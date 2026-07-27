import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const animeId = parseInt(String(req.query.animeId), 10);
    if (!animeId) return res.status(400).json({ error: 'animeId required' });
    try {
        const { data: anime, error: ae } = await supabase
            .from('anime').select('id, title, slug').eq('id', animeId).maybeSingle();
        if (ae) throw ae;
        if (!anime) return res.status(404).json({ error: 'Anime not found' });

        const { data: eps, error: ee } = await supabase
            .from('anime_episodes')
            .select('episode_number, title, word_count')
            .eq('anime_id', animeId)
            .order('episode_number', { ascending: true });
        if (ee) throw ee;

        if (eps && eps.length > 0) {
            return res.status(200).json({ anime, episodes: eps });
        }
        // Movie / special: no episode breakdown -> single full-vocab deck (ep 0)
        const { count } = await supabase
            .from('anime_word')
            .select('word_id', { count: 'exact', head: true })
            .eq('anime_id', animeId)
            .eq('episode_number', 0);
        return res.status(200).json({
            anime,
            episodes: [{ episode_number: 0, title: 'Full vocabulary', word_count: count || 0 }],
        });
    } catch (e) {
        console.error('anime/episodes error:', e);
        return res.status(500).json({ error: 'Failed to load episodes' });
    }
}
