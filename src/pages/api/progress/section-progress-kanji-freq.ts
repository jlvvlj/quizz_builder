import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { calculateStepProgressFromRecords } from '@/utils/step-progress';
import { kanjiIdsForWindow } from '@/utils/kanji-freq-window';
import { resolveFrequencyColumn } from '@/utils/kanjiFrequencySource';
import { effectiveProgressStatus } from '@/utils/progress-status';

// Section progress for the frequency kanji quiz. Mirrors
// /api/progress/section-progress over the kanji pronunciation-item rank window
// + kanji_quiz_item_progress.
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
        const { section, quizType: rawQuizType } = req.query;
        const quizType = typeof rawQuizType === 'string' && rawQuizType ? rawQuizType : 'multiple_choice';

        if (!section) {
            return res.status(400).json({ error: 'Section is required' });
        }

        // Whole-section window (no step). Resolve the same frequency column the
        // deck uses so the progress window matches the kanji actually practiced.
        const col = await resolveFrequencyColumn(req);
        const itemIds = await kanjiIdsForWindow(supabase, section as string, undefined, col);
        if (itemIds.length === 0) {
            return res.status(200).json({ progress: 0, masteredCount: 0, totalWords: 0 });
        }
        const totalWords = itemIds.length;

        const { data: progressData, error: progressError } = await supabase
            .from('kanji_quiz_item_progress')
            .select('item_id, progress_status, marked_as, progress')
            .eq('user_id', userId)
            .eq('quiz_type', quizType)
            .in('item_id', itemIds);
        if (progressError) throw progressError;

        const records = (progressData || []).map(item => ({
            ...item,
            progress_status: effectiveProgressStatus(item),
        }));
        const masteredCount = records.filter(item => item.progress_status === 'mastered').length;
        const { progress } = calculateStepProgressFromRecords(totalWords, records, masteredCount);

        return res.status(200).json({ progress, masteredCount, totalWords });
    } catch (error) {
        console.error('Error calculating kanji-freq section progress:', error);
        res.status(500).json({ error: 'Failed to calculate section progress' });
    }
}
