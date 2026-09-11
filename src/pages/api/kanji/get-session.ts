import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { section, sessionSize, startFrom } = req.query;

    if (!section || !sessionSize || !startFrom) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

        // Extract the section number from the section parameter (e.g., "kanji_section_1" -> 1)
        const sectionNumberRaw = parseInt(section.toString().split('_').pop() || '1');
        // Use section number directly as step_id
        const stepId = sectionNumberRaw;
        
        console.log('Section number:', sectionNumberRaw, 'Step ID:', stepId);

        // First try to get kanji with no progress
        // Note: We don't filter by user_id here because the view's JOIN handles user-specific
        // progress through PostgreSQL session variables. Filtering by user_id breaks when
        // the session variable isn't set (all rows get user_id='anonymous').
        const { data: newKanji, error: newKanjiError } = await supabase
            .from('kanji_with_progress')
            .select('*')
            .eq('step_id', stepId)
            .is('progress', null)
            .order('id', { ascending: true })
            .limit(parseInt(sessionSize.toString()));

        if (newKanjiError) throw newKanjiError;

        // If we found new kanji, return them
        if (newKanji && newKanji.length > 0) {
            console.log('Found new kanji:', newKanji.length);
            return res.status(200).json({
                sessionKanji: newKanji,
                nextKanji: null
            });
        }

        // If no new kanji, get all kanji ordered by progress and then by ID
        console.log('No new kanji found, getting kanji with lowest progress...');
        
        const { data: sectionKanji, error: sectionError } = await supabase
            .from('kanji_with_progress')
            .select('*')
            .eq('step_id', stepId)
            .order('progress', { ascending: true, nullsFirst: true })
            .order('id', { ascending: true });

        if (sectionError) throw sectionError;
        if (!sectionKanji || sectionKanji.length === 0) {
            return res.status(404).json({ error: 'No kanji found in this section' });
        }

        // Find where to start based on the startFrom parameter
        const startIndex = sectionKanji.findIndex(k => k.id > parseInt(startFrom.toString()));
        const sessionKanji = sectionKanji.slice(
            startIndex >= 0 ? startIndex : 0,
            (startIndex >= 0 ? startIndex : 0) + parseInt(sessionSize.toString())
        );

        // Get the next kanji after this session
        const nextKanji = sectionKanji[startIndex + parseInt(sessionSize.toString())] || null;

        console.log('Returning session kanji:', sessionKanji.length);
        return res.status(200).json({
            sessionKanji,
            nextKanji
        });

    } catch (error) {
        console.error('Error in get-session:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 