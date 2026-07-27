import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { wordIdsForTubelexWindow } from '@/utils/tubelex-window';
import { effectiveProgressStatus } from '@/utils/progress-status';

// Next-word selection for the TUBELEX words quiz. Mirrors
// /api/progress/last-kanji-freq but over the core_tubelex_ranked TUBELEX ranking
// (section_N/step_M → rank window) and the words_tubelex_progress table.
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

        // Ordered word ids for this section/step rank window.
        const allWordIds = await wordIdsForTubelexWindow(supabase, section as string, step as string);
        if (allWordIds.length === 0) {
            return res.status(404).json({ error: 'No words found in this section/step' });
        }

        // Per-type progress for these words.
        const { data: progressData, error: progressError } = await supabase
            .from('words_tubelex_progress')
            .select('word_id, progress, progress_status, marked_as, last_reviewed')
            .eq('user_id', userId)
            .eq('quiz_type', quizType)
            .in('word_id', allWordIds);
        if (progressError) throw progressError;

        const progressMap = new Map<number, { status: string | null; lastReviewed: string | null }>();
        progressData?.forEach(p => {
            progressMap.set(p.word_id, {
                status: effectiveProgressStatus(p),
                lastReviewed: p.last_reviewed || null,
            });
        });

        // Categorize by progress_status. Priority: new → to_review → learning → mastered.
        interface WordInfo { id: number; lastReviewed: string | null }
        const newWords: WordInfo[] = [];
        const toReviewWords: WordInfo[] = [];
        const learningWords: WordInfo[] = [];
        const masteredWords: WordInfo[] = [];

        allWordIds.forEach(id => {
            const info = progressMap.get(id);
            const w: WordInfo = { id, lastReviewed: info?.lastReviewed || null };
            if (!info || info.status === 'new' || info.status === null) newWords.push(w);
            else if (info.status === 'to_review') toReviewWords.push(w);
            else if (info.status === 'learning') learningWords.push(w);
            else if (info.status === 'mastered') masteredWords.push(w);
        });

        // Within each category, oldest-reviewed first (nulls first).
        const sortByLastReviewed = (a: WordInfo, b: WordInfo) => {
            if (a.lastReviewed === null && b.lastReviewed === null) return a.id - b.id;
            if (a.lastReviewed === null) return -1;
            if (b.lastReviewed === null) return 1;
            return new Date(a.lastReviewed).getTime() - new Date(b.lastReviewed).getTime();
        };
        newWords.sort(sortByLastReviewed);
        toReviewWords.sort(sortByLastReviewed);
        learningWords.sort(sortByLastReviewed);
        masteredWords.sort(sortByLastReviewed);

        const selected: number[] = [];
        const statusBreakdown: { [key: string]: number } = { new: 0, to_review: 0, learning: 0, mastered: 0 };
        for (const w of newWords) { if (selected.length >= limit) break; selected.push(w.id); statusBreakdown.new++; }
        for (const w of toReviewWords) { if (selected.length >= limit) break; selected.push(w.id); statusBreakdown.to_review++; }
        for (const w of learningWords) { if (selected.length >= limit) break; selected.push(w.id); statusBreakdown.learning++; }
        for (const w of masteredWords) { if (selected.length >= limit) break; selected.push(w.id); statusBreakdown.mastered++; }

        // Keep TUBELEX rank order within the session.
        const order = new Map(allWordIds.map((id, i) => [id, i]));
        selected.sort((a, b) => (order.get(a)! - order.get(b)!));

        // Same response shape as last-word / last-kanji-freq (wordIds carries the
        // word ids) so the shared quiz engine consumes it without branching.
        return res.status(200).json({ wordIds: selected, statusBreakdown });
    } catch (error) {
        console.error('Error getting next word (tubelex):', error);
        res.status(500).json({ error: 'Failed to get next word' });
    }
}
