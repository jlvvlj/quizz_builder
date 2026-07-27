import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { resolveFrequencyColumn } from '@/utils/kanjiFrequencySource';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { frequencyStart, frequencyEnd } = req.query;

    if (!frequencyStart || !frequencyEnd) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
        const col = await resolveFrequencyColumn(req);

        const freqStart = parseInt(frequencyStart.toString());
        const freqEnd = parseInt(frequencyEnd.toString());

        console.log('Fetching word count for frequency range:', freqStart, '-', freqEnd);

        // Get pronunciation items in this frequency range.
        const { data: itemData, error: itemError } = await supabase
            .from('kanji_quiz_items')
            .select('kanji_id')
            .gte(col, freqStart)
            .lte(col, freqEnd)
            .not(col, 'is', null);

        if (itemError) {
            console.error('Kanji quiz item query error:', itemError);
            throw itemError;
        }

        console.log('Found kanji quiz items in range:', itemData?.length || 0);

        if (!itemData || itemData.length === 0) {
            console.log('No kanji found in frequency range');
            return res.status(200).json({ wordCount: 0, kanjiCount: 0 });
        }

        const parentIds = [...new Set(itemData.map(item => item.kanji_id))];
        const { data: kanjiData, error: kanjiError } = await supabase
            .from('kanji')
            .select('japanese_word')
            .in('id', parentIds);
        if (kanjiError) {
            console.error('Kanji query error:', kanjiError);
            throw kanjiError;
        }

        // Get the kanji characters
        const kanjiChars = kanjiData.map(k => k.japanese_word);
        console.log('Kanji chars:', kanjiChars);

        // Count words that contain any of these kanji
        const { data: words, error: wordsError } = await supabase
            .from('words10k')
            .select('id, japanese_word');

        if (wordsError) {
            console.error('Words query error:', wordsError);
            throw wordsError;
        }

        console.log('Total words fetched:', words?.length || 0);

        // Count words that contain at least one of the kanji
        let wordCount = 0;
        if (words) {
            wordCount = words.filter(word =>
                kanjiChars.some(kanji => word.japanese_word.includes(kanji))
            ).length;
        }

        console.log('Words containing kanji:', wordCount);

        return res.status(200).json({
            wordCount,
            kanjiCount: itemData.length
        });

    } catch (error) {
        console.error('Error in frequency-word-count:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
