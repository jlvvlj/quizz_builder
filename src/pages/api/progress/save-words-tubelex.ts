import { NextApiRequest, NextApiResponse } from 'next';
import { createClient, PostgrestError } from '@supabase/supabase-js';

// Saves TUBELEX words quiz progress. Mirrors save-kanji-freq (per-quiz-type
// progress_status + daily-activity bump) but writes words_tubelex_progress keyed
// by (user_id, word_id, quiz_type). The request body reuses the words quiz's
// `wordDifficulties` accumulator verbatim — the keys are word ids here.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

type Stage = 'parse_request' | 'word_progress_upsert' | 'activity_read' | 'activity_upsert';

class SaveError extends Error {
    stage: Stage;
    cause?: PostgrestError | Error | unknown;
    constructor(stage: Stage, message: string, cause?: PostgrestError | Error | unknown) {
        super(message);
        this.stage = stage;
        this.cause = cause;
    }
}

function describePgError(err: PostgrestError | undefined | null): string {
    if (!err) return '';
    const parts = [err.message];
    if (err.code) parts.push(`code=${err.code}`);
    if (err.details) parts.push(`details=${err.details}`);
    if (err.hint) parts.push(`hint=${err.hint}`);
    return parts.join(' | ');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let stage: Stage = 'parse_request';
    try {
        const userId = req.cookies.userId;
        if (!userId) return res.status(401).json({ error: 'No session found' });

        // Accept both `wordDifficulties` and `kanjiDifficulties` so the shared
        // quiz engine can post its existing accumulator unchanged.
        const difficulties = req.body.wordDifficulties ?? req.body.kanjiDifficulties;
        const { quizType: rawQuizType } = req.body;
        const quizType = typeof rawQuizType === 'string' && rawQuizType ? rawQuizType : 'multiple_choice';
        if (!difficulties) {
            return res.status(400).json({ error: 'wordDifficulties are required' });
        }

        const calculateProgressStatus = (progress: number, correctAnswers: number, totalMisses: number): string => {
            const totalAttempts = correctAnswers + totalMisses;
            const successRate = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;
            if (totalAttempts === 0) return 'new';
            if (progress >= 100) return 'mastered';
            if (progress >= 50 || successRate >= 50) return 'learning';
            return 'to_review';
        };

        const progressRecords = Object.entries(difficulties).map(([wordId, difficulty]: [string, any]) => {
            const progress = difficulty.progress || 0;
            const correctAnswers = difficulty.correctAnswers || 0;
            const totalMisses = difficulty.totalMisses || 0;
            return {
                user_id: userId,
                word_id: parseInt(wordId),
                quiz_type: quizType,
                progress,
                time_to_answer: difficulty.timeToAnswer || 0,
                total_misses: totalMisses,
                correct_answers: correctAnswers,
                progress_status: calculateProgressStatus(progress, correctAnswers, totalMisses),
                last_reviewed: new Date().toISOString(),
            };
        });

        stage = 'word_progress_upsert';
        const { error: upsertError, data } = await supabase
            .from('words_tubelex_progress')
            .upsert(progressRecords, { onConflict: 'user_id,word_id,quiz_type' })
            .select();
        if (upsertError) {
            throw new SaveError(stage, describePgError(upsertError), upsertError);
        }

        // Bump daily activity counters (dashboard streak/chart), same as save.ts.
        const wordsPracticed = progressRecords.length;
        const timeSpentSeconds = Math.round(
            Object.values(difficulties).reduce((sum: number, d: any) => {
                const attempts = (d.correctAnswers || 0) + (d.totalMisses || 0);
                return sum + (d.timeToAnswer || 0) * attempts;
            }, 0)
        );
        const today = new Date().toISOString().slice(0, 10);

        stage = 'activity_read';
        const { data: existing, error: activityReadError } = await supabase
            .from('user_daily_activity')
            .select('words_practiced, time_spent_seconds')
            .eq('user_id', userId)
            .eq('day', today)
            .maybeSingle();
        if (activityReadError) {
            throw new SaveError(stage, describePgError(activityReadError), activityReadError);
        }

        stage = 'activity_upsert';
        const next = {
            user_id: userId,
            day: today,
            words_practiced: (existing?.words_practiced || 0) + wordsPracticed,
            time_spent_seconds: (existing?.time_spent_seconds || 0) + timeSpentSeconds,
        };
        const { error: activityError } = await supabase
            .from('user_daily_activity')
            .upsert(next, { onConflict: 'user_id,day' });
        if (activityError) {
            throw new SaveError(stage, describePgError(activityError), activityError);
        }

        res.status(200).json({ message: 'Progress saved successfully', count: data?.length });
    } catch (error) {
        const isSaveError = error instanceof SaveError;
        const failedStage: Stage = isSaveError ? error.stage : stage;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error saving words-tubelex progress at stage="${failedStage}":`, error);
        res.status(500).json({ error: `Failed to save progress at stage=${failedStage}: ${message}`, stage: failedStage });
    }
}
