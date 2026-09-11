import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { effectiveProgressStatus } from '@/utils/progress-status';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userId = req.cookies.userId;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });
        const { sessionSize, quizType: rawQuizType } = req.query;
        const quizType = typeof rawQuizType === 'string' && rawQuizType ? rawQuizType : 'multiple_choice';
        const limit = sessionSize ? parseInt(sessionSize as string, 10) : 20;

        const { data: items, error: itemsError } = await supabase
            .from('kanji_primitive_items')
            .select('id')
            .order('display_order', { ascending: true });
        if (itemsError) throw itemsError;

        const allItemIds = (items || []).map(item => Number(item.id));
        if (allItemIds.length === 0) {
            return res.status(404).json({ error: 'No primitive quiz items found' });
        }

        const { data: progressData, error: progressError } = await supabase
            .from('kanji_primitive_item_progress')
            .select('item_id, progress, progress_status, marked_as, last_reviewed')
            .eq('user_id', userId)
            .eq('quiz_type', quizType)
            .in('item_id', allItemIds);
        if (progressError) throw progressError;

        const progressMap = new Map<number, { status: string | null; lastReviewed: string | null }>();
        progressData?.forEach(row => {
            progressMap.set(Number(row.item_id), {
                status: effectiveProgressStatus(row),
                lastReviewed: row.last_reviewed || null,
            });
        });

        interface PrimitiveInfo { id: number; lastReviewed: string | null }
        const newItems: PrimitiveInfo[] = [];
        const toReviewItems: PrimitiveInfo[] = [];
        const learningItems: PrimitiveInfo[] = [];
        const masteredItems: PrimitiveInfo[] = [];

        allItemIds.forEach(id => {
            const info = progressMap.get(id);
            const item = { id, lastReviewed: info?.lastReviewed || null };
            if (!info || info.status === 'new' || info.status === null) newItems.push(item);
            else if (info.status === 'to_review') toReviewItems.push(item);
            else if (info.status === 'learning') learningItems.push(item);
            else if (info.status === 'mastered') masteredItems.push(item);
        });

        const sortByLastReviewed = (a: PrimitiveInfo, b: PrimitiveInfo) => {
            if (a.lastReviewed === null && b.lastReviewed === null) return a.id - b.id;
            if (a.lastReviewed === null) return -1;
            if (b.lastReviewed === null) return 1;
            return new Date(a.lastReviewed).getTime() - new Date(b.lastReviewed).getTime();
        };
        newItems.sort(sortByLastReviewed);
        toReviewItems.sort(sortByLastReviewed);
        learningItems.sort(sortByLastReviewed);
        masteredItems.sort(sortByLastReviewed);

        const selected: number[] = [];
        const statusBreakdown: { [key: string]: number } = { new: 0, to_review: 0, learning: 0, mastered: 0 };
        for (const item of newItems) { if (selected.length >= limit) break; selected.push(item.id); statusBreakdown.new++; }
        for (const item of toReviewItems) { if (selected.length >= limit) break; selected.push(item.id); statusBreakdown.to_review++; }
        for (const item of learningItems) { if (selected.length >= limit) break; selected.push(item.id); statusBreakdown.learning++; }
        for (const item of masteredItems) { if (selected.length >= limit) break; selected.push(item.id); statusBreakdown.mastered++; }

        const order = new Map(allItemIds.map((id, index) => [id, index]));
        selected.sort((a, b) => (order.get(a)! - order.get(b)!));

        return res.status(200).json({ wordIds: selected, statusBreakdown });
    } catch (error) {
        console.error('Error getting next kanji primitives:', error);
        res.status(500).json({ error: 'Failed to get next primitives' });
    }
}
