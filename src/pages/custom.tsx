"use client"

import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { Play } from 'lucide-react';
import CircularProgress from '@/components/CircularProgress';

interface Deck {
    id: number;
    title: string;
    youtube_url: string;
    video_id: string;
    word_count: number;
    created_at: string;
}

export default function CustomPage() {
    const router = useRouter();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [progressMap, setProgressMap] = useState<Record<number, number>>({});
    const [url, setUrl] = useState('');
    const [transcript, setTranscript] = useState('');
    const [manualTitle, setManualTitle] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [starting, setStarting] = useState<number | null>(null);

    const loadDecks = useCallback(async () => {
        try {
            const r = await fetch('/api/custom/list', { credentials: 'include' });
            const d = await r.json();
            const list: Deck[] = d.decks || [];
            setDecks(list);
            list.forEach(deck => {
                fetch(`/api/custom/progress?deckId=${deck.id}`, { credentials: 'include' })
                    .then(x => x.ok ? x.json() : Promise.reject(new Error('progress ' + x.status)))
                    .then(p => setProgressMap(m => ({ ...m, [deck.id]: p.progress || 0 })))
                    .catch(err => console.error(`deck ${deck.id} progress fetch failed:`, err));
            });
        } catch (e) {
            console.error(e);
            setError('Failed to load your decks.');
        }
    }, []);

    useEffect(() => { loadDecks(); }, [loadDecks]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (busy || (!url.trim() && !transcript.trim())) return;
        setBusy(true); setError(null); setNotice(null);
        try {
            const r = await fetch('/api/custom/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    url: url.trim(),
                    transcript: transcript.trim(),
                    title: manualTitle.trim(),
                }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || 'Failed to process video');
            const dropped = Object.values(d.stats?.dropped || {})
                .reduce((a: number, b) => a + (b as number), 0);
            setNotice(
                `Added "${d.title}": ${d.wordCount} words in deck — ` +
                `${d.stats.matched} already in your dictionary, ` +
                `${d.stats.absentAdded} new word${d.stats.absentAdded === 1 ? '' : 's'} added to the database, ` +
                `${dropped} skipped (names/particles/counters).`
            );
            setUrl(''); setTranscript(''); setManualTitle('');
            await loadDecks();
        } catch (err: any) {
            setError(err.message || 'Failed to process video');
        } finally {
            setBusy(false);
        }
    };

    const startDeck = async (deck: Deck) => {
        if (starting !== null) return;
        setStarting(deck.id);
        try {
            let sessionSize = 20;
            try {
                const s = await fetch('/api/settings/get', { credentials: 'include' });
                if (s.ok) { const d = await s.json(); if (d.sessionSize) sessionSize = d.sessionSize; }
            } catch { /* settings optional — keep default */ }

            const sres = await fetch(
                `/api/custom/session?deckId=${deck.id}&sessionSize=${sessionSize}`,
                { credentials: 'include' });
            const sj = await sres.json();
            if (!sres.ok) throw new Error(sj.error || 'Failed to build session');
            const wordIds: number[] = sj.wordIds || [];
            if (wordIds.length === 0) { alert('No words available for this deck.'); setStarting(null); return; }

            const params = new URLSearchParams({
                section: `custom_${deck.id}`,
                step: 'deck',
                title: deck.title,
                subtitle: 'Custom video deck',
                description: 'Words from this YouTube video, reconciled to your vocabulary deck.',
                practicedWordIds: wordIds.join(','),
            });
            router.push(`/session_preview_results?${params.toString()}`);
        } catch (e: any) {
            console.error(e);
            alert(e.message || 'Failed to start session.');
            setStarting(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#181818] flex flex-col">
            <div className="flex-1 px-3 py-4 sm:px-6 sm:py-8 xl:px-12">
                <div className="max-w-[1600px] mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-8">
                        Custom Content
                    </h1>

                    <form onSubmit={submit} className="mb-6 sm:mb-8 flex flex-col gap-3">
                        <input
                            type="text"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="YouTube URL (auto-fetch is best-effort)"
                            className="bg-[#262626] border border-[#4F4F4F] rounded-lg px-4 py-3 text-white placeholder-[#6F6F6F] focus:outline-none focus:border-[#FF0054]"
                        />
                        <input
                            type="text"
                            value={manualTitle}
                            onChange={e => setManualTitle(e.target.value)}
                            placeholder="Title (optional — used when pasting a transcript)"
                            className="bg-[#262626] border border-[#4F4F4F] rounded-lg px-4 py-3 text-white placeholder-[#6F6F6F] focus:outline-none focus:border-[#FF0054]"
                        />
                        <textarea
                            value={transcript}
                            onChange={e => setTranscript(e.target.value)}
                            rows={6}
                            placeholder="Or paste the Japanese transcript text here (most reliable). If you give only a URL, auto-fetch is attempted."
                            className="bg-[#262626] border border-[#4F4F4F] rounded-lg px-4 py-3 text-white placeholder-[#6F6F6F] focus:outline-none focus:border-[#FF0054] resize-y"
                        />
                        <button
                            type="submit"
                            disabled={busy}
                            className="self-start bg-[#FF0054] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {busy ? 'Processing…' : 'Add deck'}
                        </button>
                    </form>

                    {busy && (
                        <p className="text-[#A1A1A1] mb-4">
                            Tokenizing and reconciling — this can take up to a minute.
                        </p>
                    )}
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {notice && <p className="text-green-500 mb-4">{notice}</p>}

                    {decks.length === 0 && !busy && (
                        <p className="text-[#A1A1A1]">No custom decks yet — add a YouTube video above.</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                        {decks.map(deck => (
                            <div
                                key={deck.id}
                                onClick={() => startDeck(deck)}
                                className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 sm:p-6 cursor-pointer hover:bg-[#2F2F2F] transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2 truncate">
                                            {deck.title}
                                        </h3>
                                        <p className="text-[#A1A1A1] text-sm sm:text-base">
                                            {deck.word_count} words
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 sm:gap-4 shrink-0">
                                        <CircularProgress
                                            progress={progressMap[deck.id] || 0}
                                            size={50}
                                            strokeWidth={6}
                                            progressColor="#FF0054"
                                            backgroundColor="#262626"
                                        />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); startDeck(deck); }}
                                            disabled={starting !== null}
                                            className="bg-[#181818] border border-[#4F4F4F] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#2F2F2F] transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base disabled:opacity-50"
                                        >
                                            <Play className="w-4 h-4" />
                                            {starting === deck.id ? '…' : 'Start'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
