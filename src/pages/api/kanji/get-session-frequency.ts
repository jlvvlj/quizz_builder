import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { resolveFrequencyColumn } from '@/utils/kanjiFrequencySource';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { frequencyStart, frequencyEnd, sessionSize } = req.query;

    if (!frequencyStart || !frequencyEnd || !sessionSize) {
        return res.status(400).json({ error: 'Missing required parameters: frequencyStart, frequencyEnd, sessionSize' });
    }

    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
        const col = await resolveFrequencyColumn(req);

        const freqStart = parseInt(frequencyStart.toString());
        const freqEnd = parseInt(frequencyEnd.toString());
        const size = parseInt(sessionSize.toString());

        console.log('Fetching kanji by frequency:', freqStart, '-', freqEnd, 'session size:', size);

        // Get pronunciation items directly (not using progress from meaning mode)
        const { data: itemData, error: itemError } = await supabase
            .from('kanji_quiz_items')
            .select('*')
            .gte(col, freqStart)
            .lte(col, freqEnd)
            .not(col, 'is', null)
            .order(col, { ascending: true })
            .order('reading_order', { ascending: true })
            .limit(size);

        if (itemError) throw itemError;

        if (!itemData || itemData.length === 0) {
            return res.status(404).json({ error: 'No kanji quiz items found in this frequency range' });
        }

        const kanjiIds = [...new Set(itemData.map(item => item.kanji_id))];
        const { data: kanjiRows, error: kanjiError } = await supabase
            .from('kanji')
            .select('id, japanese_word, english')
            .in('id', kanjiIds);
        if (kanjiError) throw kanjiError;

        const kanjiById = new Map((kanjiRows || []).map(k => [k.id, k]));

        // Return kanji with zeroed progress (frequency mode progress not implemented yet).
        // Expose the active ranking under `frequency` so the client is source-agnostic.
        const sessionKanji = itemData.flatMap(item => {
            const k = kanjiById.get(item.kanji_id);
            if (!k) return [];
            return [{
            ...item,
            japanese_word: k.japanese_word,
            english: k.english,
            frequency: (item as Record<string, unknown>)[col],
            progress: 0,
            total_misses: 0,
            correct_answers: 0,
            time_to_answer: 0,
            progress_status: null,
            marked_as: null
            }];
        });

        console.log('Returning session kanji:', sessionKanji.length);
        return res.status(200).json({
            sessionKanji,
            nextKanji: null
        });

    } catch (error) {
        console.error('Error in get-session-frequency:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
