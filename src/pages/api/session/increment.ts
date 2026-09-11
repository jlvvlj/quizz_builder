import { NextApiRequest, NextApiResponse } from 'next';
import { userProgressDb } from '@/utils/userProgressDb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userId = req.cookies.userId;
        if (!userId) {
            return res.status(401).json({ error: 'No user ID found' });
        }

        // Get current session and increment it
        const currentSession = userProgressDb.getCurrentSession(userId);
        const nextSession = currentSession + 1;
        
        // Update the session in the database
        userProgressDb.setCurrentSession(userId, nextSession);
        
        res.status(200).json({ currentSession: nextSession });
    } catch (error) {
        console.error('Error incrementing session:', error);
        res.status(500).json({ error: 'Failed to increment session' });
    }
} 