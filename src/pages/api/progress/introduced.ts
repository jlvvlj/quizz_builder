import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Which of the given words has this user already been introduced to?
//
// A word is "introduced" for a quiz type once it has a user_progress row for
// that type. The quiz's intro phase uses this to teach a word the first time
// it's met in a given quiz type, instead of re-introducing it every session.
// It's per-type (matching per-type progress): typing introduces a word
// independently of multiple-choice.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const userId = req.cookies.userId;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });

        const { cardIds, quizType: rawQuizType } = req.query;
        // Introduced is per quiz type, consistent with per-type progress: a word
        // is "met" in typing independently of multiple-choice, so each type
        // introduces it once. Defaults to multiple_choice for legacy callers.
        const quizType = typeof rawQuizType === 'string' && rawQuizType ? rawQuizType : 'multiple_choice';
        if (typeof cardIds !== 'string' || !cardIds) {
            return res.status(400).json({ error: 'Missing cardIds parameter' });
        }
        const ids = cardIds.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
        if (ids.length === 0) return res.status(200).json({ introducedIds: [] });

        const { data, error } = await supabase
            .from('user_progress')
            .select('word_id')
            .eq('user_id', userId)
            .eq('quiz_type', quizType)
            .in('word_id', ids);
        if (error) throw error;

        const introducedIds = [...new Set((data || []).map(r => r.word_id))];
        return res.status(200).json({ introducedIds });
    } catch (error) {
        console.error('Error checking introduced words:', error);
        return res.status(500).json({ error: 'Failed to check introduced words' });
    }
}
