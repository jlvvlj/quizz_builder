import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface HomophoneWord {
    id: number;
    japanese_word: string;
    english: string;
    word_audio_path: string | null;
}

export interface HomophoneGroup {
    reading: string;
    words: HomophoneWord[];
}

interface ViewRow {
    id: number;
    japanese_word: string;
    japanese_reading: string;
    english: string;
    word_audio_path: string | null;
}

// Fisher-Yates, returns a new array.
function shuffle<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const totalParam = parseInt(String(req.query.total ?? ''), 10);
        const total = Number.isFinite(totalParam) ? Math.max(2, Math.min(40, totalParam)) : 7;

        // Homophone progress is tracked per word under quiz_type='homophone'.
        // When a userId cookie is present we rank groups by that progress so the
        // session rotates through un-mastered / least-recently-reviewed groups
        // first; with no userId the ranking degrades to a plain random shuffle
        // (identical to the prior behavior — not a fallback, the same code path).
        const userId = req.cookies.userId;

        // The homophone_words view is the curated set of standalone words whose
        // full reading is shared by >= 2 distinct words (see migration 00015).
        // It is small (a few hundred rows), so we load it all and assemble the
        // session in JS.
        const { data, error } = await supabase
            .from('homophone_words')
            .select('id, japanese_word, japanese_reading, english, word_audio_path');

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'No homophone words available' });
        }

        // Per-word homophone progress for this user, keyed by word id.
        const progressMap = new Map<number, { status: string | null; lastReviewed: string | null }>();
        if (userId) {
            const allIds = (data as ViewRow[]).map(r => r.id);
            const { data: progress, error: progressError } = await supabase
                .from('user_progress')
                .select('word_id, progress_status, last_reviewed')
                .eq('user_id', userId)
                .eq('quiz_type', 'homophone')
                .in('word_id', allIds);

            if (progressError) throw progressError;
            progress?.forEach(p => {
                progressMap.set(p.word_id, {
                    status: p.progress_status ?? null,
                    lastReviewed: p.last_reviewed ?? null,
                });
            });
        }

        // Group rows by shared reading.
        const byReading = new Map<string, HomophoneWord[]>();
        for (const row of data as ViewRow[]) {
            const list = byReading.get(row.japanese_reading) ?? [];
            list.push({
                id: row.id,
                japanese_word: row.japanese_word,
                english: row.english,
                word_audio_path: row.word_audio_path,
            });
            byReading.set(row.japanese_reading, list);
        }

        const allGroups: HomophoneGroup[] = [...byReading.entries()]
            .map(([reading, words]) => ({ reading, words }))
            .filter(g => g.words.length >= 2);

        // Rank groups by progress: a group is fully mastered only if every word
        // in it is mastered; its "freshness" is the oldest last_reviewed across
        // its words (never-seen words count as epoch 0, i.e. oldest). We shuffle
        // first so equal-ranked groups come out in random order each session,
        // then stable-sort un-mastered groups ahead of mastered ones and, within
        // each bucket, oldest-reviewed first. Fully-mastered groups still appear
        // last so they get periodic review once everything else is exhausted.
        interface RankedGroup { group: HomophoneGroup; allMastered: boolean; oldest: number }
        const ranked: RankedGroup[] = allGroups.map(group => {
            let allMastered = group.words.length > 0;
            let oldest = Infinity;
            for (const w of group.words) {
                const info = progressMap.get(w.id);
                if (!info || info.status !== 'mastered') allMastered = false;
                const t = info?.lastReviewed ? new Date(info.lastReviewed).getTime() : 0;
                if (t < oldest) oldest = t;
            }
            return { group, allMastered, oldest };
        });

        const ordered = shuffle(ranked);
        ordered.sort((a, b) => {
            if (a.allMastered !== b.allMastered) return a.allMastered ? 1 : -1;
            return a.oldest - b.oldest;
        });

        // Pick whole groups (in ranked order) until we reach the requested word
        // total. Groups are kept intact so every word always has its homophone
        // partners available as distractors; this can overshoot `total` by at
        // most one group's size, which is acceptable.
        const selected: HomophoneGroup[] = [];
        let count = 0;
        for (const { group } of ordered) {
            if (count >= total) break;
            const words = shuffle(group.words);
            selected.push({ reading: group.reading, words });
            count += words.length;
        }

        // Filler meanings for padding cards out to the configured answer-choice
        // count when a homophone group is smaller than that. Sourced from words
        // NOT in this session (different readings), so they're plausible
        // standalone-word distractors that are never themselves homophones of
        // the prompt.
        const selectedIds = new Set(selected.flatMap(g => g.words.map(w => w.id)));
        const fillerSeen = new Set<string>();
        const fillers: string[] = [];
        for (const row of shuffle(data as ViewRow[])) {
            if (selectedIds.has(row.id)) continue;
            const gloss = (row.english || '').split(';')[0].trim();
            if (!gloss || fillerSeen.has(gloss)) continue;
            fillerSeen.add(gloss);
            fillers.push(gloss);
            if (fillers.length >= 60) break;
        }

        return res.status(200).json({ groups: selected, total: count, fillers });
    } catch (error) {
        console.error('Error building homophone session:', error);
        return res.status(500).json({ error: 'Failed to build homophone session' });
    }
}
