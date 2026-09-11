import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Which of the given words has this user already been introduced to for this
// quiz type? Mirrors introduced-kanji-freq over words_tubelex_progress. A word
// is "introduced" once it has a words_tubelex_progress row for that quiz type.
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
            .from('words_tubelex_progress')
            .select('word_id')
            .eq('user_id', userId)
            .eq('quiz_type', quizType)
            .in('word_id', ids);
        if (error) throw error;

        const introducedIds = [...new Set((data || []).map(r => r.word_id))];
        return res.status(200).json({ introducedIds });
    } catch (error) {
        console.error('Error checking introduced words (tubelex):', error);
        return res.status(500).json({ error: 'Failed to check introduced words' });
    }
}
