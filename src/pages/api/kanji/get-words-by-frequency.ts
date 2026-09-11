import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { resolveFrequencyColumn, frequencyAlias } from '@/utils/kanjiFrequencySource';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { frequencyStart, frequencyEnd } = req.query;

    if (!frequencyStart || !frequencyEnd) {
        return res.status(400).json({ error: 'Missing required parameters: frequencyStart, frequencyEnd' });
    }

    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
        const col = await resolveFrequencyColumn(req);

        const freqStart = parseInt(frequencyStart.toString());
        const freqEnd = parseInt(frequencyEnd.toString());

        console.log('Fetching words for kanji frequency range:', freqStart, '-', freqEnd);

        // Get pronunciation items in this frequency range.
        const { data: itemData, error: itemError } = await supabase
            .from('kanji_quiz_items')
            .select(`id, kanji_id, reading, reading_type, ${frequencyAlias(col)}`)
            .gte(col, freqStart)
            .lte(col, freqEnd)
            .not(col, 'is', null)
            .order(col, { ascending: true })
            .order('reading_order', { ascending: true })
            .returns<{ id: number; kanji_id: number; reading: string; reading_type: string; frequency: number }[]>();

        if (itemError) throw itemError;

        if (!itemData || itemData.length === 0) {
            return res.status(200).json({ words: [], kanjiList: [] });
        }

        const parentIds = [...new Set(itemData.map(item => item.kanji_id))];
        const { data: kanjiRows, error: kanjiError } = await supabase
            .from('kanji')
            .select('id, japanese_word')
            .in('id', parentIds)
            .returns<{ id: number; japanese_word: string }[]>();
        if (kanjiError) throw kanjiError;
        const kanjiById = new Map((kanjiRows || []).map(k => [k.id, k.japanese_word]));
        const kanjiData = itemData.flatMap(item => {
            const japanese_word = kanjiById.get(item.kanji_id);
            return japanese_word ? [{ ...item, japanese_word }] : [];
        });

        // Get the kanji characters
        const kanjiChars = [...new Set(kanjiData.map(k => k.japanese_word))];

        // Fetch all words from words10k
        const { data: allWords, error: wordsError } = await supabase
            .from('words10k')
            .select('*');

        if (wordsError) throw wordsError;

        // Filter words that contain at least one of the kanji
        const matchingWords = (allWords || []).filter(word =>
            kanjiChars.some(kanji => word.japanese_word.includes(kanji))
        );

        // Add which kanji each word contains
        const wordsWithKanji = matchingWords.map(word => ({
            ...word,
            containsKanji: kanjiChars.filter(kanji => word.japanese_word.includes(kanji))
        }));

        console.log('Found words containing kanji:', wordsWithKanji.length);

        return res.status(200).json({
            words: wordsWithKanji,
            kanjiList: kanjiData
        });

    } catch (error) {
        console.error('Error in get-words-by-frequency:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
