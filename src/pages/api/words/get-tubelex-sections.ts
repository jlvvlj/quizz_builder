import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// How many TUBELEX-ranked words exist, and therefore how many sections of 1000
// the TUBELEX words quiz should show. Public reference data. Mirrors
// get-freq-sections over core_tubelex_ranked, counting where tubelex_rank is
// not null.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SECTION_SIZE = 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const { count, error } = await supabase
            .from('core_tubelex_ranked')
            .select('id', { count: 'exact', head: true })
            .not('tubelex_rank', 'is', null);
        if (error) throw error;

        const totalWords = count || 0;
        const numSections = Math.max(1, Math.ceil(totalWords / SECTION_SIZE));
        return res.status(200).json({ totalWords, numSections });
    } catch (error) {
        console.error('Error in get-tubelex-sections:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
