import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('\n=== /api/progress/save-kanji API CALLED ===');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userId = req.cookies.userId;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });
        const { kanjiDifficulties } = req.body;
        
        console.log('User:', userId);
        console.log('Kanji difficulties:', kanjiDifficulties);

        if (!kanjiDifficulties) {
            return res.status(400).json({ error: 'Kanji difficulties are required' });
        }

        // Convert kanji difficulties to array format for upsert
        const progressData = Object.entries(kanjiDifficulties).map(([kanjiId, data]: [string, any]) => ({
            user_id: userId,
            kanji_id: parseInt(kanjiId),
            progress: data.progress,
            time_to_answer: data.time_to_answer,
            total_misses: data.total_misses,
            correct_answers: data.correct_answers,
            last_reviewed: new Date().toISOString()
        }));

        console.log('Progress data to save:', progressData);

        // Upsert progress data
        const { error: upsertError } = await supabase
            .from('kanji_progress')
            .upsert(progressData, {
                onConflict: 'user_id,kanji_id'
            });

        if (upsertError) {
            console.error('Error upserting kanji progress:', upsertError);
            throw upsertError;
        }

        console.log('Successfully saved kanji progress');
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error saving kanji progress:', error);
        res.status(500).json({ error: 'Failed to save kanji progress' });
    }
} 