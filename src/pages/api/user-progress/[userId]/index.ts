import { NextApiRequest, NextApiResponse } from 'next';
import { userProgressDb } from '../../../../utils/userProgressDb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = req.query;

    if (!userId || Array.isArray(userId)) {
        return res.status(400).json({ error: 'Invalid userId' });
    }

    try {
        switch (req.method) {
            case 'GET':
                const progress = userProgressDb.getAllUserProgress(userId);
                res.status(200).json(progress);
                break;

            case 'POST':
                // Create user if doesn't exist
                const { email } = req.body;
                userProgressDb.createUser(userId, email);
                res.status(201).json({ message: 'User created successfully' });
                break;

            case 'GET /stats':
                const stats = userProgressDb.getUserStats(userId);
                res.status(200).json(stats);
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Error handling user progress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 