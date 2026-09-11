import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { ids } = req.query;

    if (!ids || typeof ids !== 'string') {
        return res.status(400).json({ error: 'Missing required parameter: ids (comma-separated word IDs)' });
    }

    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

        const wordIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

        if (wordIds.length === 0) {
            return res.status(400).json({ error: 'No valid word IDs provided' });
        }

        console.log('Fetching words by IDs:', wordIds);

        const { data: words, error } = await supabase
            .from('words10k')
            .select('*')
            .in('id', wordIds);

        if (error) throw error;

        console.log('Found words:', words?.length || 0);

        return res.status(200).json({ words: words || [] });

    } catch (error) {
        console.error('Error in get-by-ids:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
