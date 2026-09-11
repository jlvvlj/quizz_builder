"use client"

import { useRouter } from 'next/router';
import LoadingState from '@/components/LoadingState'
import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import CircularProgress from '@/components/CircularProgress';
import {
    fetchAnimeEpisodes,
    fetchAnimeEpisodeSession,
    type AnimeEpisode,
} from '@/utils/anime-client';

export default function AnimeEpisodesPage() {
    const router = useRouter();
    const { id } = router.query;
    const [title, setTitle] = useState('');
    const [episodes, setEpisodes] = useState<AnimeEpisode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [starting, setStarting] = useState<number | null>(null);
    const [progressMap, setProgressMap] = useState<Record<number, number>>({});

    const animeId = typeof id === 'string' ? parseInt(id, 10) : NaN;

    useEffect(() => {
        if (!router.isReady || Number.isNaN(animeId)) return;
        fetchAnimeEpisodes(animeId)
            .then(({ anime, episodes }) => {
                setTitle(anime.title);
                setEpisodes(episodes);
                // Completion % per episode — read-only, same calc as course steps.
                episodes.forEach(ep => {
                    fetch(`/api/anime/episode-progress?animeId=${animeId}&episode=${ep.episode_number}`,
                        { credentials: 'include' })
                        .then(r => r.ok ? r.json() : Promise.reject(new Error('progress ' + r.status)))
                        .then(d => setProgressMap(m => ({ ...m, [ep.episode_number]: d.progress || 0 })))
                        .catch(err => console.error(`ep ${ep.episode_number} progress fetch failed:`, err));
                });
            })
            .catch(e => { console.error(e); setError('Failed to load episodes.'); })
            .finally(() => setLoading(false));
    }, [router.isReady, animeId]);

    const startEpisode = async (ep: AnimeEpisode) => {
        if (starting !== null) return;
        setStarting(ep.episode_number);
        try {
            let sessionSize = 20;
            try {
                const s = await fetch('/api/settings/get', { credentials: 'include' });
                if (s.ok) { const d = await s.json(); if (d.sessionSize) sessionSize = d.sessionSize; }
            } catch { /* settings optional — keep default */ }

            const wordIds = await fetchAnimeEpisodeSession(animeId, ep.episode_number, sessionSize);
            if (!wordIds.length) { alert('No words available for this episode.'); setStarting(null); return; }

            const params = new URLSearchParams({
                section: `anime_${animeId}`,
                step: `ep_${ep.episode_number}`,
                title: title,
                subtitle: ep.episode_number === 0 ? 'Full vocabulary' : `Episode ${ep.episode_number}`,
                description: 'Words from this anime, reconciled to your vocabulary deck.',
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
            <main className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 w-full">
                <div className="bg-[#262626] rounded-lg border border-[#4F4F4F] p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">
                            {title || 'Anime'}
                        </h2>
                    </div>

                    {loading && <LoadingState text="Loading episodes" />}
                    {error && <p className="text-red-500">{error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                        {episodes.map(ep => (
                            <div
                                key={ep.episode_number}
                                onClick={() => startEpisode(ep)}
                                className="bg-[#181818] border border-[#4F4F4F] rounded-lg p-4 sm:p-6 cursor-pointer hover:bg-[#2F2F2F] transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">
                                            {ep.episode_number === 0
                                                ? 'Full vocabulary'
                                                : `Episode ${ep.episode_number}`}
                                        </h3>
                                        <p className="text-[#A1A1A1] text-sm sm:text-base">
                                            {ep.word_count} words
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 sm:gap-4 shrink-0">
                                        <CircularProgress
                                            progress={progressMap[ep.episode_number] || 0}
                                            size={50}
                                            strokeWidth={6}
                                            progressColor="#FF0054"
                                            backgroundColor="#262626"
                                        />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); startEpisode(ep); }}
                                            disabled={starting !== null}
                                            className="bg-[#262626] border border-[#4F4F4F] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#2F2F2F] transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base disabled:opacity-50"
                                        >
                                            <Play className="w-4 h-4" />
                                            {starting === ep.episode_number ? '…' : 'Start'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
