import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../utils/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

        const { id } = req.query;

    if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'Invalid card ID' });
    }

    try {
        const card = db.getFlashcardById(parseInt(id));

        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        res.status(200).json(card);
    } catch (error) {
        console.error('Error fetching card:', error);
        res.status(500).json({ error: 'Failed to fetch card' });
    }
} 