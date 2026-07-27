import { NextApiRequest, NextApiResponse } from 'next';
import { userProgressDb } from '@/utils/userProgressDb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userId = req.cookies.userId;
        if (!userId) {
            return res.status(401).json({ error: 'No session found' });
        }

        const limit = parseInt(req.query.limit as string) || 5;

        // Get all user progress
        const allProgress = userProgressDb.getAllUserProgress(userId);
        
        // Filter for words that have been missed at least once and sort by total misses
        const missedWords = allProgress
            .filter(progress => progress.totalMisses > 0)
            .sort((a, b) => b.totalMisses - a.totalMisses)
            .slice(0, limit);

        res.status(200).json(missedWords);
    } catch (error) {
        console.error('Error getting missed words:', error);
        res.status(500).json({ error: 'Failed to get missed words' });
    }
} 