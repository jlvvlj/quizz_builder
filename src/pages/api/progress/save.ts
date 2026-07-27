import { NextApiRequest, NextApiResponse } from 'next';
import { createClient, PostgrestError } from '@supabase/supabase-js';

// Initialize Supabase client - use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('Supabase URL configured:', supabaseUrl ? 'Yes' : 'No');
console.log('Supabase Key configured:', supabaseKey ? 'Yes (length: ' + supabaseKey.length + ')' : 'No');

const supabase = createClient(supabaseUrl, supabaseKey);

type Stage =
    | 'parse_request'
    | 'user_progress_upsert'
    | 'activity_read'
    | 'activity_upsert';

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
        if (!userId) {
            return res.status(401).json({ error: 'No session found' });
        }

        const { wordDifficulties, quizType: rawQuizType } = req.body;
        // Which quiz type this progress belongs to. Defaults to multiple_choice
        // so legacy callers (and the existing backfilled rows) keep working.
        const quizType = typeof rawQuizType === 'string' && rawQuizType ? rawQuizType : 'multiple_choice';
        console.log('\n=== SAVING PROGRESS TO DATABASE ===');
        console.log('User ID:', userId, '| quizType:', quizType);

        const calculateProgressStatus = (progress: number, correctAnswers: number, totalMisses: number): string => {
            const totalAttempts = correctAnswers + totalMisses;
            const successRate = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;
            if (totalAttempts === 0) return 'new';
            if (progress >= 100) return 'mastered';
            if (progress >= 50 || successRate >= 50) return 'learning';
            return 'to_review';
        };

        const progressRecords = Object.entries(wordDifficulties).map(([wordId, difficulty]: [string, any]) => {
            const progress = difficulty.progress || 0;
            const correctAnswers = difficulty.correctAnswers || 0;
            const totalMisses = difficulty.totalMisses || 0;
            return {
                user_id: userId,
                word_id: parseInt(wordId),
                quiz_type: quizType,
                progress: progress,
                time_to_answer: difficulty.timeToAnswer || 0,
                total_misses: totalMisses,
                correct_answers: correctAnswers,
                progress_status: calculateProgressStatus(progress, correctAnswers, totalMisses),
                last_reviewed: new Date().toISOString(),
            };
        });

        console.log('Records to save:', progressRecords.length);

        stage = 'user_progress_upsert';
        const { error: upsertError, data } = await supabase
            .from('user_progress')
            .upsert(progressRecords, { onConflict: 'user_id,word_id,quiz_type' })
            .select();
        if (upsertError) {
            console.error('user_progress upsert failed:', upsertError);
            throw new SaveError(stage, describePgError(upsertError), upsertError);
        }
        console.log('user_progress upsert ok, rows:', data?.length || 0);

        // Bump the user's daily activity counters for the dashboard streak/chart.
        const wordsPracticed = progressRecords.length;
        const timeSpentSeconds = Math.round(
            Object.values(wordDifficulties).reduce((sum: number, d: any) => {
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
            console.error('activity read failed:', activityReadError);
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
            console.error('activity upsert failed:', activityError);
            throw new SaveError(stage, describePgError(activityError), activityError);
        }

        console.log('=== PROGRESS SAVE COMPLETE ===\n');
        res.status(200).json({ message: 'Progress saved successfully', count: data?.length });
    } catch (error) {
        const isSaveError = error instanceof SaveError;
        const failedStage: Stage = isSaveError ? error.stage : stage;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error saving progress at stage="${failedStage}":`, error);
        res.status(500).json({
            error: `Failed to save progress at stage=${failedStage}: ${message}`,
            stage: failedStage,
        });
    }
}
