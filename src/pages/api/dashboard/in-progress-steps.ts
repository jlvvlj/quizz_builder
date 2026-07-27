import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { effectiveProgressStatus } from '@/utils/progress-status';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface ProgressRow {
    word_id: number;
    progress_status: string | null;
    marked_as: string | null;
    progress: number | null;
    correct_answers: number | null;
    total_misses: number | null;
    time_to_answer: number | null;
}

interface WordRow {
    id: number;
    section: string;
    step: string;
}

interface StepBucket {
    section: string;
    step: string;
    startedWords: number;
    masteredWords: number;
    progressSum: number;
    timeSpentSeconds: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const userId = req.cookies.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const { data: progressRows, error: progressErr } = await supabase
            .from('user_progress')
            .select('word_id, progress_status, marked_as, progress, correct_answers, total_misses, time_to_answer')
            .eq('user_id', userId);
        if (progressErr) throw progressErr;

        const rows = ((progressRows || []) as ProgressRow[])
            .filter(row => effectiveProgressStatus(row) !== 'new');
        if (rows.length === 0) return res.status(200).json({ steps: [] });

        const wordIds = rows.map(r => r.word_id);
        const { data: wordRows, error: wordsErr } = await supabase
            .from('words10k')
            .select('id, section, step')
            .in('id', wordIds);
        if (wordsErr) throw wordsErr;

        const wordSection = new Map<number, { section: string; step: string }>();
        for (const w of (wordRows || []) as WordRow[]) {
            wordSection.set(w.id, { section: w.section, step: w.step });
        }

        const buckets = new Map<string, StepBucket>();
        for (const r of rows) {
            const meta = wordSection.get(r.word_id);
            if (!meta) continue;
            const key = `${meta.section}|${meta.step}`;
            let b = buckets.get(key);
            if (!b) {
                b = {
                    section: meta.section,
                    step: meta.step,
                    startedWords: 0,
                    masteredWords: 0,
                    progressSum: 0,
                    timeSpentSeconds: 0,
                };
                buckets.set(key, b);
            }
            b.startedWords += 1;
            if (effectiveProgressStatus(r) === 'mastered') b.masteredWords += 1;
            const p = typeof r.progress === 'number' ? Math.max(0, Math.min(100, r.progress)) : 0;
            b.progressSum += p;
            const attempts = (r.correct_answers || 0) + (r.total_misses || 0);
            b.timeSpentSeconds += (r.time_to_answer || 0) * attempts;
        }

        // Total words per (section, step) — one head-count per bucket in parallel.
        const totals = await Promise.all(
            Array.from(buckets.values()).map(async b => {
                const { count } = await supabase
                    .from('words10k')
                    .select('*', { count: 'exact', head: true })
                    .eq('section', b.section)
                    .eq('step', b.step);
                return [b.section, b.step, count || 0] as const;
            }),
        );
        const totalMap = new Map(totals.map(([s, st, c]) => [`${s}|${st}`, c]));

        const steps = Array.from(buckets.values())
            .map(b => {
                const total = totalMap.get(`${b.section}|${b.step}`) || 0;
                const sectionNum = parseInt(b.section.replace('section_', ''), 10) || 0;
                const stepNum = parseInt(b.step.replace('step_', ''), 10) || 0;
                return {
                    section: b.section,
                    step: b.step,
                    sectionNumber: sectionNum,
                    stepNumber: stepNum,
                    sectionLabel: `Japanese Core ${sectionNum}000`,
                    stepLabel: `Step ${stepNum}`,
                    totalWords: total,
                    startedWords: b.startedWords,
                    masteredWords: b.masteredWords,
                    progressPercent: total > 0 ? Math.round(b.progressSum / total) : 0,
                    timeSpentSeconds: Math.round(b.timeSpentSeconds),
                };
            })
            .sort((a, b) =>
                a.sectionNumber - b.sectionNumber || a.stepNumber - b.stepNumber,
            );

        return res.status(200).json({ steps });
    } catch (err) {
        console.error('Error fetching in-progress steps:', err);
        return res.status(500).json({ error: 'Failed to fetch in-progress steps' });
    }
}
