import { supabase } from '../../utils/supabase-client';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const start = (page - 1) * pageSize;

    try {
        // Get total count
        const { count } = await supabase
            .from('words10k')
            .select('*', { count: 'exact', head: true });

        // Get the actual page of data
        const { data: cards, error } = await supabase
            .from('words10k')
            .select('*')
            .range(start, start + pageSize - 1)
            .order('id', { ascending: true });

        if (error) throw error;

        res.status(200).json({
            cards,
            total: count,
            page,
            pageSize
        });
    } catch (error) {
        console.error('Failed to fetch flashcards:', error);
        res.status(500).json({ error: 'Failed to fetch flashcards' });
    }
} 