import { NextApiRequest, NextApiResponse } from 'next';
import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { parseVideoId, fetchJapaneseTranscript } from '@/utils/server/youtube-transcript';
import { tokenizeJapanese } from '@/utils/server/tokenize';
import { resolveSurfaces } from '@/utils/server/reconcile';

// Transcript fetch + tokenize + reconcile can take a while.
export const config = { maxDuration: 60 };

const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const userId = req.cookies.userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    const url = (req.body?.url || '').toString().trim();
    const pasted = (req.body?.transcript || '').toString().trim();
    const pastedTitle = (req.body?.title || '').toString().trim();
    if (!url && !pasted) {
        return res.status(400).json({ error: 'Provide a YouTube URL or paste a transcript.' });
    }

    try {
        // 1. Transcript: pasted text wins; otherwise best-effort fetch.
        //    If a URL is given but auto-fetch fails, tell the user to paste
        //    (explicit — no silent fallback / no auto-translation).
        let title: string;
        let text: string;
        let videoId: string;
        if (pasted) {
            text = pasted;
            const parsed = url ? parseVideoId(url) : null;
            videoId = parsed || 'paste-' + createHash('sha1').update(pasted).digest('hex').slice(0, 16);
            title = pastedTitle || (parsed ? `YouTube ${parsed}` : 'Pasted transcript');
        } else {
            const parsed = parseVideoId(url);
            if (!parsed) return res.status(400).json({ error: 'Could not parse a YouTube video id from that URL.' });
            videoId = parsed;
            try {
                const r = await fetchJapaneseTranscript(parsed);
                title = pastedTitle || r.title;
                text = r.text;
            } catch (fetchErr: any) {
                // Message is already user-actionable & truthful (distinguishes
                // "no JA captions" from "exists but YouTube blocked download").
                return res.status(422).json({
                    error: fetchErr?.message
                        || 'Could not fetch the transcript. Paste it into the transcript box instead.',
                });
            }
        }

        // 2. Tokenize -> dictionary-form content words
        const { tokens, rawCount } = await tokenizeJapanese(text);
        if (tokens.length === 0) return res.status(422).json({ error: 'No usable Japanese words found in transcript.' });

        // 3. Reconcile against words10k via JMdict/JMnedict
        const readingOf = new Map(tokens.map(t => [t.surface, t.reading]));
        const resolution = await resolveSurfaces(sb, tokens.map(t => t.surface));

        const matchedIds: number[] = [];
        const absent: { jp: string; reading: string; english: string }[] = [];
        const dropped: Record<string, number> = {};
        for (const t of tokens) {
            const r = resolution.get(t.surface);
            if (!r) continue;
            if (r.kind === 'word') matchedIds.push(r.id);
            else if (r.kind === 'absent')
                absent.push({
                    jp: t.surface,
                    reading: r.reading || readingOf.get(t.surface) || '',
                    english: r.gloss || '',
                });
            else dropped[r.why] = (dropped[r.why] || 0) + 1;
        }

        // 4. Append genuinely-absent words to words10k (atomic, concurrency-safe)
        const idSet = new Set<number>(matchedIds);
        if (absent.length > 0) {
            const { data: appended, error: rpcErr } = await sb.rpc('append_external_words', {
                p_words: absent,
            });
            if (rpcErr) throw new Error(`append_external_words: ${rpcErr.message}`);
            for (const id of Object.values(appended as Record<string, number>)) idSet.add(id as number);
        }
        const wordIds = [...idSet];
        if (wordIds.length === 0) return res.status(422).json({ error: 'No quizzable words resolved from this video.' });

        // 5. Upsert the per-user deck + rebuild its membership
        const { data: deckRow, error: deckErr } = await sb
            .from('custom_deck')
            .upsert({
                user_id: userId, youtube_url: url, video_id: videoId,
                title, word_count: wordIds.length,
            }, { onConflict: 'user_id,video_id' })
            .select('id')
            .single();
        if (deckErr) throw new Error(`custom_deck: ${deckErr.message}`);
        const deckId = deckRow.id as number;

        await sb.from('custom_deck_word').delete().eq('deck_id', deckId);
        const rows = wordIds.map(word_id => ({ deck_id: deckId, word_id }));
        for (let i = 0; i < rows.length; i += 1000) {
            const { error } = await sb.from('custom_deck_word').insert(rows.slice(i, i + 1000));
            if (error) throw new Error(`custom_deck_word: ${error.message}`);
        }

        return res.status(200).json({
            deckId, title, wordCount: wordIds.length,
            stats: {
                rawTokens: rawCount,
                contentTokens: tokens.length,
                matched: matchedIds.length,
                absentAdded: absent.length,
                dropped,
            },
        });
    } catch (e: any) {
        console.error('custom/create error:', e);
        // Surface the real reason (no JA transcript, parse failure, etc.)
        return res.status(400).json({ error: e?.message || 'Failed to process video' });
    }
}
