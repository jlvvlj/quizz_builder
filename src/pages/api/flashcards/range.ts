import { db } from '../../../utils/db';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const startId = parseInt(req.query.startId as string);
        const count = parseInt(req.query.count as string);

        if (isNaN(startId) || isNaN(count)) {
            return res.status(400).json({ message: 'Invalid startId or count' });
        }

        const cards = db.getWordsByIdRange(startId, count);
        res.status(200).json({ cards });
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 