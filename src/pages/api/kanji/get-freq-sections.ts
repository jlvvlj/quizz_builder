import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { resolveFrequencyColumn } from '@/utils/kanjiFrequencySource';

// How many frequency-ranked pronunciation items exist, and therefore how many
// sections of 1000 the frequency kanji quiz should show.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SECTION_SIZE = 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const col = await resolveFrequencyColumn(req);
        const { count, error } = await supabase
            .from('kanji_quiz_items')
            .select('id', { count: 'exact', head: true })
            .not(col, 'is', null);
        if (error) throw error;

        const totalKanji = count || 0;
        const numSections = Math.max(1, Math.ceil(totalKanji / SECTION_SIZE));
        return res.status(200).json({ totalKanji, numSections });
    } catch (error) {
        console.error('Error in get-freq-sections:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
