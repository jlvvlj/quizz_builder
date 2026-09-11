import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('\n=== GET KANJI BY CHARACTER API CALLED ===');
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { character } = req.query;
    console.log('Requested character:', character);

    if (!character) {
        return res.status(400).json({ error: 'Missing character parameter' });
    }

    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

        console.log('Fetching from kanji_with_progress table...');
        const { data: kanji, error } = await supabase
            .from('kanji_with_progress')
            .select('*')
            .eq('japanese_word', character)
            .single();

        if (error) throw error;

        console.log('Kanji data retrieved:', {
            id: kanji?.id,
            japanese_word: kanji?.japanese_word,
            word_reading: kanji?.word_reading,
            word_reading_2: kanji?.word_reading_2,
            word_reading_3: kanji?.word_reading_3
        });

        res.status(200).json({ kanji });
    } catch (error) {
        console.error('Error fetching kanji:', error);
        res.status(500).json({ error: 'Failed to fetch kanji' });
    }
} 