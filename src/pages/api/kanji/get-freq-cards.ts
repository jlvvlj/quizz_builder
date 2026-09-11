import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { kanjiIdsForWindow } from '@/utils/kanji-freq-window';
import { resolveFrequencyColumn, frequencyAlias, type FrequencyColumn } from '@/utils/kanjiFrequencySource';

// Returns kanji pronunciation item rows for the frequency quiz, either by explicit ids
// (?ids=1,2,3) or by a section/step rank window (?section=section_1&step=step_2).
// Rows come back in frequency order. The browser can't read the `kanji` table
// directly (RLS), so the client data layer fetches cards through here.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Each row is one taught pronunciation. The item carries the matched example
// sentence/audio and reading audio path for that exact pronunciation. The active
// frequency rank is always aliased to `frequency` so the client stays source-agnostic.
const columnsFor = (col: FrequencyColumn) =>
    `id, kanji_id, reading_order, reading, reading_type, reading_occurrences, example_word, example_sentence_japanese, sentence_audio_path, reading_audio_path, ${frequencyAlias(col)}`;

type KanjiQuizItemRow = {
    id: number;
    kanji_id: number;
    reading_order: number;
    reading: string;
    reading_type: string;
    reading_occurrences: number;
    example_word: string | null;
    example_sentence_japanese: string | null;
    sentence_audio_path: string | null;
    reading_audio_path: string | null;
    frequency: number;
};

type KanjiRow = {
    id: number;
    japanese_word: string;
    english: string;
    mnemonic?: string | null;
    composed_of_kanji?: string | null;
    composed_of_kanji_description?: string | null;
    composed_of_kanji_2?: string | null;
    composed_of_kanji_description_2?: string | null;
    composed_of_kanji_3?: string | null;
    composed_of_kanji_description_3?: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const { ids, section, step } = req.query;
        const col = await resolveFrequencyColumn(req);

        let itemIds: number[];
        if (typeof ids === 'string' && ids) {
            itemIds = ids.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
        } else if (typeof section === 'string' && section) {
            itemIds = await kanjiIdsForWindow(supabase, section, typeof step === 'string' ? step : undefined, col);
        } else {
            return res.status(400).json({ error: 'Provide either ids or section[/step]' });
        }

        if (itemIds.length === 0) {
            return res.status(200).json({ kanji: [] });
        }

        const { data: items, error } = await supabase
            .from('kanji_quiz_items')
            .select(columnsFor(col))
            .in('id', itemIds)
            .order(col, { ascending: true })
            .order('reading_order', { ascending: true })
            .order('id', { ascending: true })
            .returns<KanjiQuizItemRow[]>();
        if (error) throw error;

        const kanjiIds = [...new Set((items || []).map(item => item.kanji_id))];
        const { data: siblingItems, error: siblingError } = await supabase
            .from('kanji_quiz_items')
            .select('kanji_id, reading')
            .in('kanji_id', kanjiIds)
            .returns<{ kanji_id: number; reading: string }[]>();
        if (siblingError) throw siblingError;

        const { data: kanjiRows, error: kanjiError } = await supabase
            .from('kanji')
            .select('id, japanese_word, english, mnemonic, composed_of_kanji, composed_of_kanji_description, composed_of_kanji_2, composed_of_kanji_description_2, composed_of_kanji_3, composed_of_kanji_description_3')
            .in('id', kanjiIds)
            .returns<KanjiRow[]>();
        if (kanjiError) throw kanjiError;

        const kanjiById = new Map((kanjiRows || []).map(k => [k.id, k]));
        const acceptedReadingsByKanji = new Map<number, string[]>();
        for (const item of siblingItems || []) {
            const readings = acceptedReadingsByKanji.get(item.kanji_id) || [];
            if (item.reading && !readings.includes(item.reading)) readings.push(item.reading);
            acceptedReadingsByKanji.set(item.kanji_id, readings);
        }

        const kanji = (items || []).flatMap(item => {
            const k = kanjiById.get(item.kanji_id);
            if (!k) return [];
            return {
                id: item.id,
                kanji_id: item.kanji_id,
                japanese_word: k.japanese_word,
                english: k.english,
                mnemonic: k.mnemonic,
                composed_of_kanji: k.composed_of_kanji,
                composed_of_kanji_description: k.composed_of_kanji_description,
                composed_of_kanji_2: k.composed_of_kanji_2,
                composed_of_kanji_description_2: k.composed_of_kanji_description_2,
                composed_of_kanji_3: k.composed_of_kanji_3,
                composed_of_kanji_description_3: k.composed_of_kanji_description_3,
                reading: item.reading,
                accepted_readings: acceptedReadingsByKanji.get(item.kanji_id) || [item.reading],
                reading_type: item.reading_type,
                reading_occurrences: item.reading_occurrences,
                reading_order: item.reading_order,
                frequency: item.frequency,
                example_word: item.example_word,
                example_sentence_japanese: item.example_sentence_japanese,
                sentence_audio_path: item.sentence_audio_path,
                reading_audio_path: item.reading_audio_path,
            };
        });

        return res.status(200).json({ kanji });
    } catch (error) {
        console.error('Error in get-freq-cards:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
