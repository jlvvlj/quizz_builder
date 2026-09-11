import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import {
    effectiveProgressStatus,
    isMarkableProgressContent,
    isProgressStatus,
    PROGRESS_TARGETS,
} from '@/utils/progress-status';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const QUIZ_TYPES = new Set(['multiple_choice', 'typing']);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const userId = req.cookies.userId;
    if (!userId) {
        return res.status(401).json({ error: 'No session found' });
    }

    const { content, itemId: rawItemId, markedAs: rawMarkedAs, quizType: rawQuizType } = req.body ?? {};
    const itemId = Number(rawItemId);
    const quizType = typeof rawQuizType === 'string' ? rawQuizType : 'multiple_choice';

    if (!isMarkableProgressContent(content)) {
        return res.status(400).json({ error: 'Invalid progress content type' });
    }
    if (!Number.isSafeInteger(itemId) || itemId <= 0) {
        return res.status(400).json({ error: 'Invalid item ID' });
    }
    if (rawMarkedAs !== null && !isProgressStatus(rawMarkedAs)) {
        return res.status(400).json({ error: 'Invalid marked status' });
    }
    if (!QUIZ_TYPES.has(quizType)) {
        return res.status(400).json({ error: 'Invalid quiz type' });
    }

    const target = PROGRESS_TARGETS[content];
    const record = {
        user_id: userId,
        [target.idColumn]: itemId,
        quiz_type: quizType,
        marked_as: rawMarkedAs,
    };

    const { data, error } = await supabase
        .from(target.table)
        .upsert(record, { onConflict: target.conflictColumns })
        .select('progress_status, marked_as')
        .single();

    if (error) {
        console.error('Failed to update marked progress status:', error);
        return res.status(500).json({ error: 'Failed to update marked status' });
    }

    return res.status(200).json({
        progressStatus: data.progress_status,
        markedAs: data.marked_as,
        effectiveStatus: effectiveProgressStatus(data),
    });
}
