import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { calculateStepProgressFromRecords } from '@/utils/step-progress';
import { wordIdsForTubelexWindow } from '@/utils/tubelex-window';
import { effectiveProgressStatus } from '@/utils/progress-status';

// Step progress for the TUBELEX words quiz. Mirrors step-progress-kanji-freq
// over the TUBELEX rank window + words_tubelex_progress.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userId = req.cookies.userId;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });
        const { section, step, quizType: rawQuizType } = req.query;
        const quizType = typeof rawQuizType === 'string' && rawQuizType ? rawQuizType : 'multiple_choice';

        if (!section || !step) {
            return res.status(400).json({ error: 'Section and step are required' });
        }

        const wordIds = await wordIdsForTubelexWindow(supabase, section as string, step as string);
        if (wordIds.length === 0) {
            return res.status(200).json({ progress: 0, masteredCount: 0, totalWords: 0 });
        }
        const totalWords = wordIds.length;

        const { data: progressData, error: progressError } = await supabase
            .from('words_tubelex_progress')
            .select('word_id, progress_status, marked_as, progress')
            .eq('user_id', userId)
            .eq('quiz_type', quizType)
            .in('word_id', wordIds);
        if (progressError) throw progressError;

        const records = (progressData || []).map(item => ({
            ...item,
            progress_status: effectiveProgressStatus(item),
        }));
        const masteredCount = records.filter(item => item.progress_status === 'mastered').length;
        const { progress } = calculateStepProgressFromRecords(totalWords, records, masteredCount);

        return res.status(200).json({ progress, masteredCount, totalWords });
    } catch (error) {
        console.error('Error calculating words-tubelex step progress:', error);
        res.status(500).json({ error: 'Failed to calculate step progress' });
    }
}
