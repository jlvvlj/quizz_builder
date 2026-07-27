import { NextApiRequest, NextApiResponse } from 'next';
import { userProgressDb } from '../../../../utils/userProgressDb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId, cardId } = req.query;

    if (!userId || !cardId || Array.isArray(userId) || Array.isArray(cardId)) {
        return res.status(400).json({ error: 'Invalid userId or cardId' });
    }

    try {
        switch (req.method) {
            case 'GET':
                const progress = userProgressDb.getProgress(userId, parseInt(cardId));
                if (progress) {
                    res.status(200).json(progress);
                } else {
                    res.status(404).json({ error: 'Progress not found' });
                }
                break;

            case 'PUT':
                const body = req.body;
                userProgressDb.upsertProgress({
                    userId,
                    cardId: parseInt(cardId),
                    ...body
                });
                res.status(200).json({ message: 'Progress updated successfully' });
                break;

            default:
                res.setHeader('Allow', ['GET', 'PUT']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Error handling progress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 