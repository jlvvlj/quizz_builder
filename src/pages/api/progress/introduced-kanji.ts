import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Which of the given learning-section kanji has this user already been
// introduced to? The legacy kanji quiz stores progress in kanji_progress keyed
// only by kanji_id, so introduction is shared across kanji quiz sessions.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const userId = req.cookies.userId;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });

        const { cardIds } = req.query;
        if (typeof cardIds !== 'string' || !cardIds) {
            return res.status(400).json({ error: 'Missing cardIds parameter' });
        }
        const ids = cardIds.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
        if (ids.length === 0) return res.status(200).json({ introducedIds: [] });

        const { data, error } = await supabase
            .from('kanji_progress')
            .select('kanji_id')
            .eq('user_id', userId)
            .in('kanji_id', ids);
        if (error) throw error;

        const introducedIds = [...new Set((data || []).map(r => r.kanji_id))];
        return res.status(200).json({ introducedIds });
    } catch (error) {
        console.error('Error checking introduced kanji:', error);
        return res.status(500).json({ error: 'Failed to check introduced kanji' });
    }
}
