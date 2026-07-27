import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { cardIds, quizType: rawQuizType } = req.query;
        const quizType = typeof rawQuizType === 'string' && rawQuizType ? rawQuizType : 'multiple_choice';
        const userId = req.cookies.userId;

        if (!userId) {
            return res.status(401).json({ error: 'No session found. Please refresh the page.' });
        }
        if (typeof cardIds !== 'string' || !cardIds) {
            return res.status(400).json({ error: 'Missing cardIds parameter' });
        }

        const cardIdArray = cardIds.split(',').map(id => {
            const parsed = parseInt(id.trim(), 10);
            if (Number.isNaN(parsed)) throw new Error(`Invalid card ID: ${id}`);
            return parsed;
        });
        if (cardIdArray.length === 0) {
            return res.status(400).json({ error: 'No valid card IDs provided' });
        }

        const { data: progressData, error: progressError } = await supabase
            .from('kanji_primitive_item_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('quiz_type', quizType)
            .in('item_id', cardIdArray);

        if (progressError) {
            console.error('Error fetching kanji primitive progress:', progressError);
            return res.status(500).json({ error: 'Failed to fetch progress data' });
        }

        const progressMap: { [key: number]: any } = {};
        for (const cardId of cardIdArray) {
            const progress = progressData?.find(row => Number(row.item_id) === cardId);
            if (progress) {
                progressMap[cardId] = {
                    progress: progress.progress || 0,
                    timeToAnswer: progress.time_to_answer || 0,
                    totalMisses: progress.total_misses || 0,
                    correctAnswers: progress.correct_answers || 0,
                    progress_status: progress.progress_status,
                    marked_as: progress.marked_as,
                };
            } else {
                progressMap[cardId] = {
                    progress: 0,
                    timeToAnswer: 0,
                    totalMisses: 0,
                    correctAnswers: 0,
                    progress_status: 'new',
                    marked_as: null,
                };
            }
        }

        res.status(200).json(progressMap);
    } catch (error) {
        console.error('Error getting batch kanji primitive progress:', error);
        const message = error instanceof Error ? error.message : 'Failed to get batch progress';
        res.status(500).json({ error: message });
    }
}
