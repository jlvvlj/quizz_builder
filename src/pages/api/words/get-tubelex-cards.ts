import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { wordIdsForTubelexWindow } from '@/utils/tubelex-window';

// Returns word rows for the TUBELEX-reordered words quiz, either by explicit
// ids (?ids=1,2,3) or by a section/step rank window
// (?section=section_1&step=step_2). Rows come back in TUBELEX rank order. The
// browser can't read core_tubelex_ranked directly under RLS, so the client data
// layer fetches cards through here.
//
// Unlike get-freq-cards (which borrows example sentences via RPC), the words
// here carry their own example sentence + audio columns, so we select them
// directly — no RPC. tubelex_added rows have NULL audio/sentence columns; that
// is expected and the client renders them text-only.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const COLUMNS =
    'id, japanese_word, japanese_reading, english, word_audio_path, english_audio_path, example_sentence_japanese, example_sentence_reading, example_sentence_english, sentence_audio_path, tubelex_rank';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const { ids, section, step } = req.query;

        let wordIds: number[];
        if (typeof ids === 'string' && ids) {
            wordIds = ids.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
        } else if (typeof section === 'string' && section) {
            wordIds = await wordIdsForTubelexWindow(supabase, section, typeof step === 'string' ? step : undefined);
        } else {
            return res.status(400).json({ error: 'Provide either ids or section[/step]' });
        }

        if (wordIds.length === 0) {
            return res.status(200).json({ words: [] });
        }

        const { data, error } = await supabase
            .from('core_tubelex_ranked')
            .select(COLUMNS)
            .in('id', wordIds)
            .order('tubelex_rank', { ascending: true })
            .order('id', { ascending: true });
        if (error) throw error;

        return res.status(200).json({ words: data || [] });
    } catch (error) {
        console.error('Error in get-tubelex-cards:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
