import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { section } = req.query;

    if (!section) {
        return res.status(400).json({ error: 'Section parameter is required' });
    }

    try {
        console.log('Fetching review words for section:', section);

        // First get all words in the section
        const { data: words, error: wordsError } = await supabase
            .from('words10k')
            .select('id, japanese_word, english, section, step')
            .eq('section', section);

        if (wordsError) {
            console.error('Error fetching words:', wordsError);
            return res.status(500).json({ error: 'Failed to fetch words' });
        }

        if (!words || words.length === 0) {
            console.log('No words found in section');
            return res.status(200).json({ words: [] });
        }

        // Then get progress data for these words
        const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('*')
            .in('word_id', words.map(w => w.id));

        if (progressError) {
            console.error('Error fetching progress data:', progressError);
            return res.status(500).json({ error: 'Failed to fetch progress data' });
        }

        // Create a map of word_id to progress data
        const progressMap = (progressData || []).reduce((acc, curr) => {
            acc[curr.word_id] = curr;
            return acc;
        }, {} as Record<number, any>);

        // Combine words with their progress data and filter for review
        const reviewWords = words
            .map(word => {
                const progress = progressMap[word.id];
                return {
                    ...word,
                    progress_status: progress?.progress_status || 'new',
                    marked_as: progress?.marked_as || null
                };
            })
            .filter(word => 
                word.marked_as === 'to_review' || 
                (!word.marked_as && word.progress_status === 'to_review')
            );

        console.log('Found review words:', reviewWords.length);
        return res.status(200).json({ words: reviewWords });
    } catch (error) {
        console.error('Error in get-review-words:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 