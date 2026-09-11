import { db } from '../../../utils/db';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const afterId = parseInt(req.query.afterId as string) || 0;
        
        const nextWord = db.getNextWord(afterId);

        if (nextWord) {
            res.status(200).json({ nextWord });
        } else {
            res.status(404).json({ message: 'No more words available' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 