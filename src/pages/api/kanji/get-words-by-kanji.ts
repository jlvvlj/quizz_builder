import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { kanji } = req.query;

    if (!kanji || typeof kanji !== 'string') {
        return res.status(400).json({ error: 'Missing required parameter: kanji' });
    }

    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

        // Support comma-separated kanji characters for multi-selection
        const kanjiList = kanji.split(',').map(k => k.trim()).filter(k => k);

        console.log('Fetching words containing kanji:', kanjiList);

        // For single kanji, use the efficient ilike query
        if (kanjiList.length === 1) {
            const { data: words, error } = await supabase
                .from('words10k')
                .select('*')
                .ilike('japanese_word', `%${kanjiList[0]}%`);

            if (error) throw error;

            console.log('Found words containing kanji:', words?.length || 0);

            return res.status(200).json({
                words: words || [],
                kanji: kanji,
                kanjiList: kanjiList,
                count: words?.length || 0
            });
        }

        // For multiple kanji, fetch all words and filter in JS
        // This is necessary because Supabase doesn't support OR with multiple ILIKE patterns efficiently
        const { data: allWords, error } = await supabase
            .from('words10k')
            .select('*');

        if (error) throw error;

        // Filter words that contain AT LEAST ONE of the kanji characters
        const matchingWords = (allWords || []).filter(word =>
            kanjiList.some(k => word.japanese_word.includes(k))
        );

        // Add which kanji each word contains (for display/sorting purposes)
        const wordsWithKanji = matchingWords.map(word => ({
            ...word,
            containsKanji: kanjiList.filter(k => word.japanese_word.includes(k))
        }));

        // Sort by number of matching kanji (words with more selected kanji first)
        wordsWithKanji.sort((a, b) => b.containsKanji.length - a.containsKanji.length);

        console.log('Found words containing selected kanji:', wordsWithKanji.length);

        return res.status(200).json({
            words: wordsWithKanji,
            kanji: kanji,
            kanjiList: kanjiList,
            count: wordsWithKanji.length
        });

    } catch (error) {
        console.error('Error in get-words-by-kanji:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
