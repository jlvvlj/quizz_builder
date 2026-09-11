import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('\n=== /api/progress/last-kanji API CALLED ===');
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userId = req.cookies.userId;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });
        const { section } = req.query;
        
        console.log('User:', userId);
        console.log('Section:', section);

        if (!section) {
            return res.status(400).json({ error: 'Section is required' });
        }

        // Extract the section number from the section parameter (e.g., "kanji_section_1" -> 1)
        const sectionNumber = parseInt(section.toString().split('_').pop() || '1');

        // First get all kanji in this section
        const { data: sectionKanji, error: sectionError } = await supabase
            .from('kanji_with_progress')
            .select('id')
            .eq('step_id', sectionNumber)
            .order('id', { ascending: true });

        if (sectionError) {
            throw sectionError;
        }

        if (!sectionKanji || sectionKanji.length === 0) {
            return res.status(404).json({ error: 'No kanji found in this section' });
        }

        const kanjiIds = sectionKanji.map(k => k.id);
        console.log('All kanji IDs in section (sorted):', kanjiIds);

        // First try to find kanji with no progress
        const { data: noProgressKanji, error: noProgressError } = await supabase
            .from('kanji_with_progress')
            .select('id')
            .eq('step_id', sectionNumber)
            .is('progress', null)
            .order('id', { ascending: true })
            .limit(1);

        if (noProgressError) throw noProgressError;

        // If we found a kanji with no progress, use the one before it as the last kanji
        if (noProgressKanji && noProgressKanji.length > 0) {
            const index = kanjiIds.indexOf(noProgressKanji[0].id);
            const lastKanjiId = index > 0 ? kanjiIds[index - 1] : 0;
            console.log('Found kanji with no progress, last kanji ID:', lastKanjiId);
            return res.status(200).json({ lastKanjiId });
        }

        // If no new kanji found, get the kanji with lowest progress
        console.log('No new kanji found, getting kanji with lowest progress...');
        const { data: lowestProgressKanji, error: lowestProgressError } = await supabase
            .from('kanji_progress')
            .select('kanji_id, progress')
            .eq('user_id', userId)
            .in('kanji_id', kanjiIds)
            .order('progress', { ascending: true })
            .limit(1);

        if (lowestProgressError) throw lowestProgressError;

        // If we found a kanji with progress, use the one before it as the last kanji
        if (lowestProgressKanji && lowestProgressKanji.length > 0) {
            const index = kanjiIds.indexOf(lowestProgressKanji[0].kanji_id);
            const lastKanjiId = index > 0 ? kanjiIds[index - 1] : 0;
            console.log('Found kanji with lowest progress, last kanji ID:', lastKanjiId);
            return res.status(200).json({ lastKanjiId });
        }

        // If no kanji found at all, start from the beginning
        console.log('No kanji found, starting from beginning');
        return res.status(200).json({ lastKanjiId: 0 });
    } catch (error) {
        console.error('Error in last-kanji:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 