import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const userId = req.cookies.userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const { data, error } = await sb
            .from('custom_deck')
            .select('id, title, youtube_url, video_id, word_count, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json({ decks: data || [] });
    } catch (e) {
        console.error('custom/list error:', e);
        return res.status(500).json({ error: 'Failed to load decks' });
    }
}
