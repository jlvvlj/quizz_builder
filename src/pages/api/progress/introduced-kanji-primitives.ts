import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Which of the given primitive quiz items has this user already been
// introduced to for this quiz type? Mirrors introduced-kanji-freq over
// kanji_primitive_item_progress.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const userId = req.cookies.userId;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });

        const { cardIds, quizType: rawQuizType } = req.query;
        const quizType = typeof rawQuizType === 'string' && rawQuizType ? rawQuizType : 'multiple_choice';
        if (typeof cardIds !== 'string' || !cardIds) {
            return res.status(400).json({ error: 'Missing cardIds parameter' });
        }
        const ids = cardIds.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
        if (ids.length === 0) return res.status(200).json({ introducedIds: [] });

        const { data, error } = await supabase
            .from('kanji_primitive_item_progress')
            .select('item_id')
            .eq('user_id', userId)
            .eq('quiz_type', quizType)
            .in('item_id', ids);
        if (error) throw error;

        const introducedIds = [...new Set((data || []).map(r => r.item_id))];
        return res.status(200).json({ introducedIds });
    } catch (error) {
        console.error('Error checking introduced kanji primitives:', error);
        return res.status(500).json({ error: 'Failed to check introduced primitives' });
    }
}
