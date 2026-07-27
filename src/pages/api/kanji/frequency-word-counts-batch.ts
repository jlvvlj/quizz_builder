import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { resolveFrequencyColumn, frequencyAlias } from '@/utils/kanjiFrequencySource';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
        const col = await resolveFrequencyColumn(req);

        console.log('Fetching all kanji quiz items and words for batch word count...');

        // Fetch all pronunciation items with frequency in one query.
        const { data: allItems, error: itemError } = await supabase
            .from('kanji_quiz_items')
            .select(`kanji_id, ${frequencyAlias(col)}`)
            .not(col, 'is', null)
            .order(col, { ascending: true })
            .order('reading_order', { ascending: true })
            .returns<{ kanji_id: number; frequency: number }[]>();

        if (itemError) throw itemError;

        const parentIds = [...new Set((allItems || []).map(item => item.kanji_id))];
        const { data: kanjiRows, error: kanjiError } = await supabase
            .from('kanji')
            .select('id, japanese_word')
            .in('id', parentIds)
            .returns<{ id: number; japanese_word: string }[]>();
        if (kanjiError) throw kanjiError;
        const kanjiById = new Map((kanjiRows || []).map(k => [k.id, k.japanese_word]));

        // Fetch all words from words10k in one query
        const { data: allWords, error: wordsError } = await supabase
            .from('words10k')
            .select('id, japanese_word');

        if (wordsError) throw wordsError;

        console.log(`Fetched ${allItems?.length || 0} kanji quiz items and ${allWords?.length || 0} words`);

        // Group kanji by frequency sections (10 kanji per section)
        const KANJI_PER_SECTION = 10;
        const wordCounts: { [sectionId: number]: number } = {};

        // Pre-calculate which kanji belong to each section
        const kanjiBySection: { [sectionId: number]: string[] } = {};

        if (allItems) {
            for (const item of allItems) {
                const sectionId = Math.ceil(item.frequency / KANJI_PER_SECTION);
                if (!kanjiBySection[sectionId]) {
                    kanjiBySection[sectionId] = [];
                }
                const kanji = kanjiById.get(item.kanji_id);
                if (kanji) kanjiBySection[sectionId].push(kanji);
            }
        }

        // For each section, count words containing any of those kanji
        for (const [sectionIdStr, kanjiChars] of Object.entries(kanjiBySection)) {
            const sectionId = parseInt(sectionIdStr);
            let count = 0;

            if (allWords) {
                count = allWords.filter(word =>
                    kanjiChars.some(kanji => word.japanese_word.includes(kanji))
                ).length;
            }

            wordCounts[sectionId] = count;
        }

        console.log('Calculated word counts for all sections');

        return res.status(200).json({ wordCounts });

    } catch (error) {
        console.error('Error in frequency-word-counts-batch:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
