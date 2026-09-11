export interface AnimeListItem {
    id: number;
    slug: string;
    title: string;
    difficulty: number;
    episode_count: number;
    total_words: number;
    unique_words: number;
}

export interface AnimeEpisode {
    episode_number: number;
    title: string | null;
    word_count: number;
}

export async function fetchAnimeList(): Promise<AnimeListItem[]> {
    const r = await fetch('/api/anime/list', { credentials: 'include' });
    if (!r.ok) throw new Error('Failed to load anime list');
    return (await r.json()).anime || [];
}

export async function fetchAnimeEpisodes(
    animeId: number
): Promise<{ anime: { id: number; title: string; slug: string }; episodes: AnimeEpisode[] }> {
    const r = await fetch(`/api/anime/episodes?animeId=${animeId}`, { credentials: 'include' });
    if (!r.ok) throw new Error('Failed to load episodes');
    return r.json();
}

export async function fetchAnimeEpisodeSession(
    animeId: number,
    episode: number,
    sessionSize: number
): Promise<number[]> {
    const r = await fetch(
        `/api/anime/session?animeId=${animeId}&episode=${episode}&sessionSize=${sessionSize}`,
        { credentials: 'include' }
    );
    if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to build session');
    }
    return (await r.json()).wordIds || [];
}
