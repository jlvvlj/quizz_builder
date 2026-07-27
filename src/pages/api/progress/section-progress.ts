import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { calculateStepProgressFromRecords } from '@/utils/step-progress';
import { effectiveProgressStatus } from '@/utils/progress-status';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userId = req.cookies.userId;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });
        const { section, quizType: rawQuizType } = req.query;
        const quizType = typeof rawQuizType === 'string' && rawQuizType ? rawQuizType : 'multiple_choice';

        console.log('\n=== CALCULATING SECTION PROGRESS ===');
        console.log('User:', userId);
        console.log('Section:', section);

        if (!section) {
            return res.status(400).json({ error: 'Section is required' });
        }

        // Get all words in this section
        const { data: words, error: wordsError } = await supabase
            .from('words10k')
            .select('id')
            .eq('section', section);

        if (wordsError) throw wordsError;
        if (!words || words.length === 0) {
            console.log('No words found');
            return res.status(200).json({ progress: 0, masteredCount: 0, totalWords: 0 });
        }

        const totalWords = words.length;
        console.log('Total words in section:', totalWords);

        // Get progress_status and numeric progress for all words
        const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('word_id, progress_status, marked_as, progress')
            .eq('user_id', userId)
            .eq('quiz_type', quizType)
            .in('word_id', words.map(w => w.id));

        if (progressError) throw progressError;

        const records = (progressData || []).map(item => ({
            ...item,
            progress_status: effectiveProgressStatus(item),
        }));
        console.log('Progress records found:', records.length);

        const masteredCount = records.filter(item => item.progress_status === 'mastered').length;

        // Average per-word numeric progress across the whole section,
        // matching how individual step progress is computed so the
        // section ring on the homepage stays consistent with the
        // step rings inside the section.
        const { progress } = calculateStepProgressFromRecords(totalWords, records, masteredCount);

        console.log('Mastered count:', masteredCount);
        console.log('Progress percentage:', progress);
        console.log('=== END SECTION PROGRESS ===\n');

        return res.status(200).json({
            progress,
            masteredCount,
            totalWords
        });

    } catch (error) {
        console.error('Error calculating section progress:', error);
        res.status(500).json({ error: 'Failed to calculate section progress' });
    }
}
