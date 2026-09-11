import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { resolveFrequencyColumn, frequencyAlias } from '@/utils/kanjiFrequencySource';

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
        const col = await resolveFrequencyColumn(req);

        const freqStart = parseInt(frequencyStart.toString());
        const freqEnd = parseInt(frequencyEnd.toString());

        // Count pronunciation items in this frequency range
        const { data: kanji, error } = await supabase
            .from('kanji_quiz_items')
            .select(`id, ${frequencyAlias(col)}`)
            .gte(col, freqStart)
            .lte(col, freqEnd)
            .not(col, 'is', null);

        if (error) throw error;

        const totalKanji = kanji?.length || 0;

        // Frequency mode progress tracking not implemented yet - return 0
        return res.status(200).json({
            averageProgress: 0,
            totalKanji,
            studiedKanji: 0
        });

    } catch (error) {
        console.error('Error in frequency-section-progress:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
