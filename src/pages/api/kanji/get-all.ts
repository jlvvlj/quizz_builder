import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('\n=== GET ALL KANJI API CALLED ===');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Progress is per-user, so this endpoint needs the signed-in user.
    const userId = req.cookies.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const { section } = req.query;
    console.log('Section:', section, 'User:', userId);

    if (!section) {
        return res.status(400).json({ error: 'Missing section parameter' });
    }

    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

        // Extract the section number from the section parameter (e.g., "kanji_section_1" -> 1)
        const sectionNumber = parseInt(section.toString().split('_').pop() || '1');
        console.log('Section number:', sectionNumber);

        // Read kanji content from the base table. We deliberately do NOT read the
        // `kanji_with_progress` view here: that view joins progress on
        // current_setting('app.current_user_id'), which this endpoint never set,
        // so it always resolved to the 'anonymous' bucket and every signed-in
        // user saw anonymous progress. Instead, fetch the user's own
        // kanji_progress rows and merge them with the same COALESCE defaults the
        // view applies, keeping the response shape identical for all consumers.
        const { data: kanjiRows, error: kanjiError } = await supabase
            .from('kanji')
            .select('*')
            .eq('step_id', sectionNumber)
            .order('id', { ascending: true });

        if (kanjiError) throw kanjiError;

        const rows = kanjiRows || [];
        const kanjiIds = rows.map(k => k.id);

        const { data: progressRows, error: progressError } = await supabase
            .from('kanji_progress')
            .select('kanji_id, progress, time_to_answer, total_misses, correct_answers, last_reviewed, progress_status, marked_as')
            .eq('user_id', userId)
            .in('kanji_id', kanjiIds.length ? kanjiIds : [-1]);

        if (progressError) throw progressError;

        const progressByKanji = new Map((progressRows || []).map(p => [p.kanji_id, p]));

        // Mirror the kanji_with_progress view's COALESCE defaults so the response
        // shape is exactly what consumers already expect.
        const kanji = rows.map(k => {
            const p = progressByKanji.get(k.id);
            return {
                ...k,
                user_id: p ? userId : 'anonymous',
                progress: p?.progress ?? 0,
                time_to_answer: p?.time_to_answer ?? 0,
                total_misses: p?.total_misses ?? 0,
                correct_answers: p?.correct_answers ?? 0,
                last_reviewed: p?.last_reviewed ?? '1970-01-01T00:00:00+00:00',
                progress_status: p?.progress_status ?? null,
                marked_as: p?.marked_as ?? '',
            };
        });

        if (kanji.length > 0) {
            console.log('Sample kanji data:', {
                id: kanji[0].id,
                japanese_word: kanji[0].japanese_word,
                progress: kanji[0].progress,
                progress_status: kanji[0].progress_status,
            });
        }

        res.status(200).json({ kanji });
    } catch (error) {
        console.error('Error fetching all kanji:', error);
        res.status(500).json({ error: 'Failed to fetch kanji' });
    }
}
