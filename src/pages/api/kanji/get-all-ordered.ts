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

        console.log('Fetching all kanji ordered by frequency...');

        // Get all pronunciation items ordered by frequency.
        // Note: Supabase default limit is 1000 rows, use range() to fetch all
        const { data: itemData, error } = await supabase
            .from('kanji_quiz_items')
            .select(`id, kanji_id, reading, reading_type, reading_occurrences, ${frequencyAlias(col)}`)
            .not(col, 'is', null)
            .order(col, { ascending: true })
            .order('reading_order', { ascending: true })
            .range(0, 9999)
            .returns<{ id: number; kanji_id: number; reading: string; reading_type: string; reading_occurrences: number; frequency: number }[]>();

        if (error) throw error;

        const kanjiIds = [...new Set((itemData || []).map(item => item.kanji_id))];
        const { data: kanjiRows, error: kanjiError } = await supabase
            .from('kanji')
            .select('id, japanese_word, english')
            .in('id', kanjiIds);
        if (kanjiError) throw kanjiError;

        const kanjiById = new Map((kanjiRows || []).map(k => [k.id, k]));
        const kanji = (itemData || []).flatMap(item => {
            const k = kanjiById.get(item.kanji_id);
            return k ? [{ ...item, japanese_word: k.japanese_word, english: k.english }] : [];
        });

        console.log('Found kanji quiz items:', kanji.length);

        return res.status(200).json({ kanji });

    } catch (error) {
        console.error('Error in get-all-ordered:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
