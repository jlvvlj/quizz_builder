import { NextApiRequest, NextApiResponse } from 'next';
import { userProgressDb } from '@/utils/userProgressDb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, cardId } = req.query;

        if (!userId || !cardId) {
            return res.status(400).json({ error: 'Missing userId or cardId' });
        }

        const progress = userProgressDb.getProgress(
            userId as string,
            parseInt(cardId as string)
        );

        res.status(200).json(progress || null);
    } catch (error) {
        console.error('Error getting progress:', error);
        res.status(500).json({ error: 'Failed to get progress' });
    }
} 