import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { kanjiIdsForWindow } from '@/utils/kanji-freq-window';
import { resolveFrequencyColumn } from '@/utils/kanjiFrequencySource';
import { effectiveProgressStatus } from '@/utils/progress-status';

// Next-item selection for the frequency kanji quiz. Mirrors /api/progress/last-word
// but over `kanji_quiz_items` (one item per taught pronunciation) and the
// kanji_quiz_item_progress table.
// Per quiz type, like the words quiz.
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
        const { section, step, sessionSize, quizType: rawQuizType } = req.query;
        const quizType = typeof rawQuizType === 'string' && rawQuizType ? rawQuizType : 'multiple_choice';

        if (!section || !step) {
            return res.status(400).json({ error: 'Section and step are required' });
        }

        const limit = sessionSize ? parseInt(sessionSize as string) : 20;
        const col = await resolveFrequencyColumn(req);

        // Ordered pronunciation item ids for this section/step rank window.
        const allItemIds = await kanjiIdsForWindow(supabase, section as string, step as string, col);
        if (allItemIds.length === 0) {
            return res.status(404).json({ error: 'No kanji quiz items found in this section/step' });
        }

        // Per-type progress for these pronunciation items.
        const { data: progressData, error: progressError } = await supabase
            .from('kanji_quiz_item_progress')
            .select('item_id, progress, progress_status, marked_as, last_reviewed')
            .eq('user_id', userId)
            .eq('quiz_type', quizType)
            .in('item_id', allItemIds);
        if (progressError) throw progressError;

        const progressMap = new Map<number, { status: string | null; lastReviewed: string | null }>();
        progressData?.forEach(p => {
            progressMap.set(p.item_id, {
                status: effectiveProgressStatus(p),
                lastReviewed: p.last_reviewed || null,
            });
        });

        // Categorize by progress_status. Priority: new → to_review → learning → mastered.
        interface ItemInfo { id: number; lastReviewed: string | null }
        const newItems: ItemInfo[] = [];
        const toReviewItems: ItemInfo[] = [];
        const learningItems: ItemInfo[] = [];
        const masteredItems: ItemInfo[] = [];

        allItemIds.forEach(id => {
            const info = progressMap.get(id);
            const item: ItemInfo = { id, lastReviewed: info?.lastReviewed || null };
            if (!info || info.status === 'new' || info.status === null) newItems.push(item);
            else if (info.status === 'to_review') toReviewItems.push(item);
            else if (info.status === 'learning') learningItems.push(item);
            else if (info.status === 'mastered') masteredItems.push(item);
        });

        // Within each category, oldest-reviewed first (nulls first).
        const sortByLastReviewed = (a: ItemInfo, b: ItemInfo) => {
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

        // Keep frequency order within the session.
        const order = new Map(allItemIds.map((id, i) => [id, i]));
        selected.sort((a, b) => (order.get(a)! - order.get(b)!));

        // Same response shape as last-word (wordIds carries the item ids) so the
        // shared quiz engine consumes it without branching.
        return res.status(200).json({ wordIds: selected, statusBreakdown });
    } catch (error) {
        console.error('Error getting next kanji (freq):', error);
        res.status(500).json({ error: 'Failed to get next kanji' });
    }
}
