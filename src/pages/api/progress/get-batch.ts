import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { cardIds, quizType: rawQuizType } = req.query;
        const quizType = typeof rawQuizType === 'string' && rawQuizType ? rawQuizType : 'multiple_choice';
        const userId = req.cookies.userId;

        console.log('Progress batch request received');
        console.log('- userId from cookie:', userId);
        console.log('- cardIds:', cardIds);

        if (!userId) {
            console.log('No userId found in cookies');
            return res.status(401).json({ error: 'No session found. Please refresh the page.' });
        }

        if (!cardIds) {
            console.log('No cardIds provided in query');
            return res.status(400).json({ error: 'Missing cardIds parameter' });
        }

        // Validate cardIds format
        if (typeof cardIds !== 'string') {
            return res.status(400).json({ error: 'Invalid cardIds format' });
        }

        // Convert comma-separated cardIds to array of numbers
        const cardIdArray = cardIds.split(',').map(id => {
            const parsed = parseInt(id.trim());
            if (isNaN(parsed)) {
                throw new Error(`Invalid card ID: ${id}`);
            }
            return parsed;
        });

        if (cardIdArray.length === 0) {
            return res.status(400).json({ error: 'No valid card IDs provided' });
        }

        console.log('- parsed cardIds:', cardIdArray);
        
        // Get progress for each card
        const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('quiz_type', quizType)
            .in('word_id', cardIdArray);

        if (progressError) {
            console.error('Error fetching progress:', progressError);
            return res.status(500).json({ error: 'Failed to fetch progress data' });
        }

        // Create a map of word_id to progress data
        const progressMap: { [key: number]: any } = {};
        for (const cardId of cardIdArray) {
            const progress = progressData?.find(p => p.word_id === cardId);
                if (progress) {
                progressMap[cardId] = {
                    progress: progress.progress || 0,
                    timeToAnswer: progress.time_to_answer || 0,
                    totalMisses: progress.total_misses || 0,
                    correctAnswers: progress.correct_answers || 0,
                    progress_status: progress.progress_status,
                    marked_as: progress.marked_as
                };
                } else {
                    // If no progress found, return default values
                    progressMap[cardId] = {
                        progress: 0,
                        timeToAnswer: 0,
                        totalMisses: 0,
                    correctAnswers: 0,
                    progress_status: 'new',
                    marked_as: null
                    };
            }
        }

        console.log('Progress data retrieved:', progressMap);
        console.log('Number of cards with progress:', Object.keys(progressMap).length);

        res.status(200).json(progressMap);
    } catch (error) {
        console.error('Error getting batch progress:', error);
        const message = error instanceof Error ? error.message : 'Failed to get batch progress';
        res.status(500).json({ error: message });
    }
} 