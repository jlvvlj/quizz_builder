import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { calculateStepProgressFromRecords } from '@/utils/step-progress';

// Anime-wide completion = SAME calc as a course step, over the DISTINCT
// words10k ids across every episode of the anime (anime_word). READ ONLY.
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const userId = req.cookies.userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    const animeId = parseInt(String(req.query.animeId), 10);
    if (!animeId) return res.status(400).json({ error: 'animeId required' });

    try {
        const wordIdSet = new Set<number>();
        for (let from = 0; ; from += 1000) {
            const { data, error } = await supabase
                .from('anime_word').select('word_id')
                .eq('anime_id', animeId).range(from, from + 999);
            if (error) throw error;
            if (!data || data.length === 0) break;
            for (const r of data) wordIdSet.add(r.word_id);
            if (data.length < 1000) break;
        }
        const wordIds = [...wordIdSet];
        if (wordIds.length === 0) {
            return res.status(200).json({ progress: 0, masteredCount: 0, totalWords: 0, recordsCount: 0, nonzeroCount: 0, userId: 'set' });
        }

        const totalWords = wordIds.length;
        const records: { progress?: number | null; progress_status?: string | null }[] = [];
        for (let i = 0; i < wordIds.length; i += 1000) {
            const { data, error } = await supabase
                .from('user_progress').select('progress_status, progress')
                .eq('user_id', userId).in('word_id', wordIds.slice(i, i + 1000));
            if (error) throw error;
            if (data) records.push(...data);
        }
        const masteredCount = records.filter(r => r.progress_status === 'mastered').length;
        const nonzeroCount = records.filter(r => typeof r.progress === 'number' && r.progress > 0).length;
        const { progress } = calculateStepProgressFromRecords(totalWords, records, masteredCount);
        return res.status(200).json({
            progress, masteredCount, totalWords,
            recordsCount: records.length, nonzeroCount,
            userId: 'set',
        });
    } catch (e) {
        console.error('anime/progress error:', e);
        return res.status(500).json({ error: 'Failed to calculate anime progress' });
    }
}
