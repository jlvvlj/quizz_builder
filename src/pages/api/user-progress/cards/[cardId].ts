import { NextApiRequest, NextApiResponse } from 'next';
import { userProgressDb } from '../../../../utils/userProgressDb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { cardId } = req.query;

    if (!cardId || Array.isArray(cardId)) {
        return res.status(400).json({ error: 'Invalid cardId' });
    }

    try {
        if (req.method === 'GET') {
            const stats = userProgressDb.getCardStats(parseInt(cardId));
            res.status(200).json(stats);
        } else {
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Error getting card stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 