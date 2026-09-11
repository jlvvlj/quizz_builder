import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { resolveFrequencyColumn } from '@/utils/kanjiFrequencySource';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { frequencyStart, frequencyEnd } = req.query;

    if (!frequencyStart || !frequencyEnd) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
        const userId = req.cookies.userId;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });

        const col = await resolveFrequencyColumn(req);
        const freqStart = parseInt(frequencyStart.toString());
        const freqEnd = parseInt(frequencyEnd.toString());

        // Get kanji in this frequency range that are marked for review
        const { data: kanji, error } = await supabase
            .from('kanji_with_progress')
            .select('*')
            .gte(col, freqStart)
            .lte(col, freqEnd)
            .not(col, 'is', null)
            .eq('marked_for_review', true)
            .order(col, { ascending: true });

        if (error) throw error;

        console.log('Found review kanji in frequency range:', kanji?.length || 0);

        return res.status(200).json({ kanji: kanji || [] });

    } catch (error) {
        console.error('Error in get-review-kanji-frequency:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
