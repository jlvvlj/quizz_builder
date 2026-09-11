import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { calculateStepProgressFromRecords } from '@/utils/step-progress';
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
        const { quizType: rawQuizType } = req.query;
        const quizType = typeof rawQuizType === 'string' && rawQuizType ? rawQuizType : 'multiple_choice';

        const { data: items, error: itemsError } = await supabase
            .from('kanji_primitive_items')
            .select('id')
            .order('display_order', { ascending: true });
        if (itemsError) throw itemsError;

        const itemIds = (items || []).map(item => Number(item.id));
        if (itemIds.length === 0) {
            return res.status(200).json({ progress: 0, masteredCount: 0, totalWords: 0 });
        }

        const { data: progressData, error: progressError } = await supabase
            .from('kanji_primitive_item_progress')
            .select('item_id, progress_status, marked_as, progress')
            .eq('user_id', userId)
            .eq('quiz_type', quizType)
            .in('item_id', itemIds);
        if (progressError) throw progressError;

        const records = (progressData || []).map(item => ({
            ...item,
            progress_status: effectiveProgressStatus(item),
        }));
        const masteredCount = records.filter(item => item.progress_status === 'mastered').length;
        const { progress } = calculateStepProgressFromRecords(itemIds.length, records, masteredCount);

        return res.status(200).json({ progress, masteredCount, totalWords: itemIds.length });
    } catch (error) {
        console.error('Error calculating kanji primitive progress:', error);
        res.status(500).json({ error: 'Failed to calculate primitive progress' });
    }
}
