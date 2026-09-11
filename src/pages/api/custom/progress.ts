import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { calculateStepProgressFromRecords } from '@/utils/step-progress';

// Completion % for a custom deck = SAME calc as course steps / anime
// episodes, over the deck's words10k ids. READ ONLY.
const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const userId = req.cookies.userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    const deckId = parseInt(String(req.query.deckId), 10);
    if (!deckId) return res.status(400).json({ error: 'deckId required' });
    try {
        const wordIds: number[] = [];
        for (let from = 0; ; from += 1000) {
            const { data, error } = await sb
                .from('custom_deck_word').select('word_id')
                .eq('deck_id', deckId).range(from, from + 999);
            if (error) throw error;
            if (!data || data.length === 0) break;
            for (const r of data) wordIds.push(r.word_id);
            if (data.length < 1000) break;
        }
        if (wordIds.length === 0) return res.status(200).json({ progress: 0, masteredCount: 0, totalWords: 0 });

        const totalWords = wordIds.length;
        const records: { progress?: number | null; progress_status?: string | null }[] = [];
        for (let i = 0; i < wordIds.length; i += 1000) {
            const { data, error } = await sb
                .from('user_progress').select('word_id, progress_status, progress')
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
        console.error('custom/progress error:', e);
        return res.status(500).json({ error: 'Failed to calculate progress' });
    }
}
