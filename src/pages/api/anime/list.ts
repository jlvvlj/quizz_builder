import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const { data, error } = await supabase
            .from('anime')
            .select('id, slug, title, difficulty, episode_count, total_words, unique_words')
            .order('title', { ascending: true });
        if (error) throw error;
        return res.status(200).json({ anime: data || [] });
    } catch (e) {
        console.error('anime/list error:', e);
        return res.status(500).json({ error: 'Failed to load anime list' });
    }
}
