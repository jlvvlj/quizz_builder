import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// SRS session over a custom deck (mirrors /api/anime/session). Word ids
// are words10k ids -> existing quiz + read-only progress just work.
const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const userId = req.cookies.userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    const deckId = parseInt(String(req.query.deckId), 10);
    const limit = req.query.sessionSize ? parseInt(String(req.query.sessionSize), 10) : 20;
    const wantAll = req.query.all === '1' || req.query.all === 'true';
    if (!deckId) return res.status(400).json({ error: 'deckId required' });

    try {
        // ownership check
        const { data: deck, error: de } = await sb
            .from('custom_deck').select('id').eq('id', deckId).eq('user_id', userId).maybeSingle();
        if (de) throw de;
        if (!deck) return res.status(404).json({ error: 'Deck not found' });

        const allWordIds: number[] = [];
        for (let from = 0; ; from += 1000) {
            const { data, error } = await sb
                .from('custom_deck_word').select('word_id')
                .eq('deck_id', deckId).order('word_id', { ascending: true })
                .range(from, from + 999);
            if (error) throw error;
            if (!data || data.length === 0) break;
            for (const r of data) allWordIds.push(r.word_id);
            if (data.length < 1000) break;
        }
        if (allWordIds.length === 0) return res.status(404).json({ error: 'Deck is empty' });
        if (wantAll) return res.status(200).json({ wordIds: allWordIds, total: allWordIds.length });

        const { data: progress, error: pe } = await sb
            .from('user_progress').select('word_id, progress_status, last_reviewed')
            .eq('user_id', userId).in('word_id', allWordIds);
        if (pe) throw pe;
        const pmap = new Map<number, { status: string | null; last: string | null }>();
        (progress || []).forEach(p =>
            pmap.set(p.word_id, { status: p.progress_status || null, last: p.last_reviewed || null }));

        const buckets: Record<string, { id: number; last: string | null }[]> =
            { new: [], to_review: [], learning: [], mastered: [] };
        for (const id of allWordIds) {
            const pi = pmap.get(id);
            const s = !pi || !pi.status || pi.status === 'new' ? 'new' : pi.status;
            (buckets[s] || buckets.new).push({ id, last: pi?.last || null });
        }
        const byLast = (a: any, b: any) => {
            if (a.last === null && b.last === null) return a.id - b.id;
            if (a.last === null) return -1;
            if (b.last === null) return 1;
            return new Date(a.last).getTime() - new Date(b.last).getTime();
        };
        const selected: number[] = [];
        for (const k of ['new', 'to_review', 'learning', 'mastered']) {
            buckets[k].sort(byLast);
            for (const w of buckets[k]) { if (selected.length >= limit) break; selected.push(w.id); }
            if (selected.length >= limit) break;
        }
        selected.sort((a, b) => a - b);
        return res.status(200).json({ wordIds: selected, total: allWordIds.length });
    } catch (e) {
        console.error('custom/session error:', e);
        return res.status(500).json({ error: 'Failed to build session' });
    }
}
