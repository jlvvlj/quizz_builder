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

        console.log('Fetching all kanji progress for batch calculation...');

        // Fetch all pronunciation items in the active frequency order. This legacy
        // endpoint still returns zeroed progress, but it must use the same
        // item set as the quiz.
        const { data: allKanji, error } = await supabase
            .from('kanji_quiz_items')
            .select(`id, ${frequencyAlias(col)}`)
            .not(col, 'is', null)
            .order(col, { ascending: true })
            .order('reading_order', { ascending: true })
            .returns<{ id: number; frequency: number }[]>();

        if (error) throw error;

        console.log(`Fetched ${allKanji?.length || 0} kanji with progress`);

        // Group by sections and calculate average progress
        const KANJI_PER_SECTION = 10;
        const sectionProgress: { [sectionId: number]: number } = {};

        if (allKanji) {
            const progressBySection: { [sectionId: number]: number[] } = {};

            for (const kanji of allKanji) {
                const sectionId = Math.ceil(kanji.frequency / KANJI_PER_SECTION);
                if (!progressBySection[sectionId]) {
                    progressBySection[sectionId] = [];
                }
                progressBySection[sectionId].push(0);
            }

            // Calculate average for each section
            for (const [sectionIdStr, progressValues] of Object.entries(progressBySection)) {
                const sectionId = parseInt(sectionIdStr);
                const average = progressValues.length > 0
                    ? Math.round(progressValues.reduce((a, b) => a + b, 0) / progressValues.length)
                    : 0;
                sectionProgress[sectionId] = average;
            }
        }

        console.log('Calculated progress for all sections');

        return res.status(200).json({ sectionProgress });

    } catch (error) {
        console.error('Error in frequency-section-progress-batch:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
