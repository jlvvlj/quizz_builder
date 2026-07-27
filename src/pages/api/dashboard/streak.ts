import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

function isoDay(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
    const c = new Date(d);
    c.setUTCDate(c.getUTCDate() + n);
    return c;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const userId = req.cookies.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    const days = Math.max(1, Math.min(60, parseInt((req.query.days as string) || '30', 10)));

    try {
        // Pull all activity rows once and compute streak across the entire history,
        // while building a dense last-N-days array for the bar/streak strip.
        const { data: rows, error } = await supabase
            .from('user_daily_activity')
            .select('day, words_practiced, time_spent_seconds')
            .eq('user_id', userId)
            .order('day', { ascending: false });

        if (error) throw error;

        const byDay = new Map<string, { words: number; seconds: number }>();
        for (const r of rows || []) {
            byDay.set(r.day, {
                words: r.words_practiced || 0,
                seconds: r.time_spent_seconds || 0,
            });
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Current streak: walk back from today (or yesterday if no activity today)
        // counting consecutive practiced days.
        let cursor = new Date(today);
        if (!byDay.has(isoDay(cursor))) cursor = addDays(cursor, -1);
        let currentStreak = 0;
        while (byDay.has(isoDay(cursor))) {
            currentStreak += 1;
            cursor = addDays(cursor, -1);
        }

        // Best streak: scan sorted ascending day list.
        const sortedDays = (rows || []).map(r => r.day).sort();
        let bestStreak = 0;
        let run = 0;
        let prev: string | null = null;
        for (const d of sortedDays) {
            if (prev && isoDay(addDays(new Date(prev), 1)) === d) {
                run += 1;
            } else {
                run = 1;
            }
            if (run > bestStreak) bestStreak = run;
            prev = d;
        }

        // Dense last-N-days series, oldest first.
        const series: Array<{ day: string; wordsPracticed: number; timeSpentSeconds: number; practiced: boolean }> = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = isoDay(addDays(today, -i));
            const v = byDay.get(d);
            series.push({
                day: d,
                wordsPracticed: v?.words || 0,
                timeSpentSeconds: v?.seconds || 0,
                practiced: !!v && v.words > 0,
            });
        }

        return res.status(200).json({ currentStreak, bestStreak, series });
    } catch (err) {
        console.error('Error fetching streak:', err);
        return res.status(500).json({ error: 'Failed to fetch streak' });
    }
}
