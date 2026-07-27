import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { effectiveProgressStatus } from '@/utils/progress-status';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type Status = 'new' | 'learning' | 'mastered' | 'to_review';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const userId = req.cookies.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    try {
        // Total words in the words10k corpus.
        const { count: totalWords, error: totalErr } = await supabase
            .from('words10k')
            .select('*', { count: 'exact', head: true });
        if (totalErr) throw totalErr;

        const { data: rows, error } = await supabase
            .from('user_progress')
            .select('progress_status, marked_as')
            .eq('user_id', userId);
        if (error) throw error;

        const counts: Record<Status, number> = { new: 0, learning: 0, mastered: 0, to_review: 0 };
        for (const r of rows || []) {
            const s = effectiveProgressStatus(r);
            if (s in counts) counts[s] += 1;
        }

        // Words with no progress row are implicitly "new".
        const tracked = (rows || []).length;
        const untrackedNew = Math.max(0, (totalWords || 0) - tracked);
        counts.new += untrackedNew;

        return res.status(200).json({ counts, totalWords: totalWords || 0 });
    } catch (err) {
        console.error('Error fetching status counts:', err);
        return res.status(500).json({ error: 'Failed to fetch status counts' });
    }
}
