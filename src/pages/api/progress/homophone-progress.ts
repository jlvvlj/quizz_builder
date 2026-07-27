import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { calculateStepProgressFromRecords } from '@/utils/step-progress';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ViewRow {
    id: number;
    japanese_reading: string;
}

/**
 * Overall homophone mastery for the signed-in user: the rounded average of
 * per-word progress (quiz_type='homophone') across the quizable homophone set
 * — i.e. the words in the homophone_words view that belong to a reading shared
 * by >= 2 distinct words, matching how the quiz selects them.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userId = req.cookies.userId;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });

        const { data, error } = await supabase
            .from('homophone_words')
            .select('id, japanese_reading');

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(200).json({ progress: 0, masteredCount: 0, totalWords: 0 });
        }

        // Keep only words whose reading is shared by >= 2 distinct words; those
        // are the ones the quiz can actually serve.
        const byReading = new Map<string, number[]>();
        for (const row of data as ViewRow[]) {
            const list = byReading.get(row.japanese_reading) ?? [];
            list.push(row.id);
            byReading.set(row.japanese_reading, list);
        }
        const quizableIds: number[] = [];
        for (const ids of byReading.values()) {
            if (ids.length >= 2) quizableIds.push(...ids);
        }

        const totalWords = quizableIds.length;
        if (totalWords === 0) {
            return res.status(200).json({ progress: 0, masteredCount: 0, totalWords: 0 });
        }

        const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('word_id, progress_status, progress')
            .eq('user_id', userId)
            .eq('quiz_type', 'homophone')
            .in('word_id', quizableIds);

        if (progressError) throw progressError;

        const records = progressData || [];
        const masteredCount = records.filter(r => r.progress_status === 'mastered').length;
        const { progress } = calculateStepProgressFromRecords(totalWords, records, masteredCount);

        return res.status(200).json({ progress, masteredCount, totalWords });
    } catch (error) {
        console.error('Error calculating homophone progress:', error);
        res.status(500).json({ error: 'Failed to calculate homophone progress' });
    }
}
