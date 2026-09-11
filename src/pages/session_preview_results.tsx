"use client"

import { useRouter } from 'next/router'
import LoadingState from '@/components/LoadingState'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { SessionWord as SupabaseSessionWord } from '../utils/supabase-client'
import { fetchSupabaseSessionCards, fetchAllCards, takeCachedSessionCardsByIds, fetchKanjiFreqSessionCards, fetchAllKanjiFreqCards, takeCachedKanjiFreqCardsByIds, fetchTubelexSessionCards, fetchAllTubelexCards, takeCachedTubelexCardsByIds, fetchKanjiPrimitiveSessionCards, fetchAllKanjiPrimitiveCards, takeCachedKanjiPrimitiveCardsByIds } from '../utils/supabase-client'
import WordAnalysis from '@/components/WordAnalysis'
import DifficultyGroups from '@/components/DifficultyGroups'
import SuccessRateGroups from '@/components/SuccessRateGroups'
import { useSettingsModal } from '@/components/layout/SettingsContext'
import TabNavigation from '@/components/TabNavigation'
import TypingLangPills, { type TypingLang } from '@/components/TypingLangPills'
import QuizModePills, { type QuizMode } from '@/components/QuizModePills'
import ContentPills, { type ContentMode } from '@/components/ContentPills'
import WordCard from '../components/WordCard'
import CircularProgress from '../components/CircularProgress'
import { calculateStepProgress } from '../utils/progress-calculator'
import { setQuizMode as persistQuizMode } from '../utils/quiz-mode'
import { playQuizStartSound } from '../utils/audio'

interface SessionWord {
    id: number;
    word: string;
    meaning: string;
    progress: number;
    isReview: boolean;
    totalMisses: number;
    correctAnswers: number;
    timeToAnswer: number;
    progress_status?: 'new' | 'learning' | 'mastered' | 'to_review';
    marked_as?: 'new' | 'learning' | 'mastered' | 'to_review';
}

interface SessionPreviewResultsProps {
    title?: string;
    subtitle?: string;
    description?: string;
}

const DEFAULT_SETTINGS = { sessionSize: 7 };

export default function SessionPreviewResults() {
    console.log('SessionPreviewResults component mounted');

    const router = useRouter()
    const [words, setWords] = useState<SessionWord[]>([])
    const [allWords, setAllWords] = useState<SessionWord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingAllWords, setIsLoadingAllWords] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("session")
    const { isSettingsOpen: showSettings, onSettingsSaved } = useSettingsModal()
    const [settings, setSettings] = useState<{ sessionSize?: number } | null>(null)
    const nextWordRef = useRef<any>(null);
    const settingsLoadedRef = useRef(false);
    // Guards the practiced-words (results) load so it runs once even when the
    // effect re-fires after settings finish loading.
    const resultsLoadedRef = useRef(false);
    const observerTarget = useRef<HTMLDivElement | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(50);
    const [progress, setProgress] = useState<number>(0);
    // Typing-quiz language choice lives here on the session page. quizMode is
    // stored client-side; quizDirection comes from saved settings. The pills only
    // matter for a forward typing quiz, so they're shown only then.
    // Read the persisted mode/lang synchronously in the initializer so the first
    // render already has the user's real setting. Otherwise quizMode would start
    // at the default and flip after mount, re-running loadCards/loadAllWords/
    // fetchProgress a second time and racing the first (progress flickering
    // between quiz types). Safe for SSR: the pills render null until mounted, so
    // this client-only value never hits the server markup.
    const [quizMode, setQuizMode] = useState<string>(() => {
        if (typeof window === 'undefined') return 'multiple-choice';
        const stored = window.localStorage.getItem('quizMode');
        return stored === 'typing' || stored === 'multiple-choice' ? stored : 'multiple-choice';
    });
    const [quizDirection, setQuizDirection] = useState<string | undefined>(undefined);
    // What this session drills: the words, or each word's example sentence (typed
    // from memory). Seeded from the URL so arriving with ?content=sentences (e.g.
    // "next session" after a sentences quiz) stays in sentences mode.
    const [contentMode, setContentMode] = useState<ContentMode>(() => {
        if (typeof window === 'undefined') return 'words';
        return new URLSearchParams(window.location.search).get('content') === 'sentences' ? 'sentences' : 'words';
    });
    const [typingLang, setTypingLang] = useState<TypingLang>(() => {
        if (typeof window === 'undefined') return 'japanese';
        const stored = window.localStorage.getItem('typingLang');
        return stored === 'japanese' || stored === 'english' || stored === 'mix' ? stored : 'japanese';
    });

    const handleTypingLangChange = useCallback((lang: TypingLang) => {
        setTypingLang(lang);
        if (typeof window !== 'undefined') window.localStorage.setItem('typingLang', lang);
    }, []);

    // Per-quiz-type dimension that the preview's word selection and progress all
    // key off of. Derived from the page's quizMode so changing the toggle below
    // re-runs every dependent effect (cards, progress, all-words list).
    // Sentences are always typed, so they read/select against the 'typing'
    // progress dimension just like the typing word quiz.
    const quizType: 'typing' | 'multiple_choice' =
        (quizMode === 'typing' || contentMode === 'sentences') ? 'typing' : 'multiple_choice';

    // Switch the answer mode for the upcoming quiz right here on the session page.
    // persistQuizMode writes localStorage and fires the quizModeChange event so
    // the quiz itself and the section/step progress views stay in sync.
    const handleQuizModeChange = useCallback((mode: QuizMode) => {
        setQuizMode(mode);
        persistQuizMode(mode);
    }, []);

    // For a sentences session the input mode is fixed (forward Japanese typing),
    // so the answer-language pills don't apply and are hidden. For words they
    // apply to a forward quiz of either mode (typing: what you type;
    // multiple-choice: what the options show), but never in reverse.
    const showLangPills = contentMode === 'words'
        && (quizMode === 'typing' || quizMode === 'multiple-choice')
        && quizDirection !== 'reverse';
    const langPillVariant = quizMode === 'typing' ? 'typing' : 'choice';

    const handleContentModeChange = useCallback((mode: ContentMode) => {
        setContentMode(mode);
    }, []);

    // Get props from URL query
    const title = router.query.title as string || "Study Session";
    const subtitle = router.query.subtitle as string || "Words in this session";
    const description = router.query.description as string || "These are the words you'll practice in this session.";
    const practicedWordIds = router.query.practicedWordIds as string;
    const showResultsButton = router.query.showResultsButton === 'true';

    // Frequency kanji deck reuses this whole page; it only swaps the data source.
    const isKanji = router.query.content === 'kanji_freq';
    const isTubelex = router.query.content === 'words_tubelex';
    const isPrimitives = router.query.content === 'kanji_primitives';
    const contentParam: 'words' | 'kanji_freq' | 'words_tubelex' | 'kanji_primitives' =
        isPrimitives ? 'kanji_primitives' : isKanji ? 'kanji_freq' : isTubelex ? 'words_tubelex' : 'words';

    // Extract section and step numbers for display
    const sectionNumber = router.query.section?.toString().replace('section_', '') || '';
    const stepNumber = router.query.step?.toString().replace('step_', '') || '';
    const displayTitle = isPrimitives ? 'Primitives' : `Section ${sectionNumber} - Step ${stepNumber}`;

    // Load all words at once
    useEffect(() => {
        async function loadAllWords() {
            try {
                console.log('=== LOADING ALL WORDS (TAB: ALL) ===');
                
                const { section, step } = router.query;
                
                // Initialize session first
                console.log('Initializing session...');
                const initResponse = await fetch('/api/session/init', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!initResponse.ok) {
                    throw new Error('Failed to initialize session');
                }
                
                const sessionData = await initResponse.json();
                console.log('Session initialized successfully, userId:', sessionData.userId);
                
                console.log('Fetching all words from Supabase...');
                let cards;
                const secStr = section as string;
                if (isPrimitives) {
                    const res = await fetchAllKanjiPrimitiveCards(quizType);
                    cards = res.cards;
                } else if (isKanji) {
                    // Frequency kanji window for this section/step, with per-type progress.
                    const res = await fetchAllKanjiFreqCards(secStr, step as string, quizType);
                    cards = res.cards;
                } else if (isTubelex) {
                    // TUBELEX-reordered words window, with words_tubelex_progress.
                    const res = await fetchAllTubelexCards(secStr, step as string, quizType);
                    cards = res.cards;
                } else if (secStr && secStr.startsWith('anime_')) {
                    // Anime deck spans many words10k sections — resolve the
                    // full episode membership, then fetch those cards by id.
                    const animeId = parseInt(secStr.replace('anime_', ''), 10);
                    const episode = parseInt(String(step).replace('ep_', ''), 10);
                    const sres = await fetch(
                        `/api/anime/session?animeId=${animeId}&episode=${episode}&all=1`,
                        { credentials: 'include' }
                    );
                    const sjson = await sres.json();
                    const wordIds: number[] = sjson.wordIds || [];
                    if (wordIds.length === 0) {
                        cards = [];
                    } else {
                        const r = await fetchSupabaseSessionCards(
                            wordIds.length, secStr, step as string, undefined, wordIds
                        );
                        cards = r.sessionWords;
                    }
                } else if (secStr && secStr.startsWith('custom_')) {
                    // Custom deck spans many words10k sections — resolve the
                    // full deck membership, then fetch those cards by id.
                    const deckId = parseInt(secStr.replace('custom_', ''), 10);
                    const sres = await fetch(
                        `/api/custom/session?deckId=${deckId}&all=1`,
                        { credentials: 'include' }
                    );
                    const sjson = await sres.json();
                    const wordIds: number[] = sjson.wordIds || [];
                    if (wordIds.length === 0) {
                        cards = [];
                    } else {
                        const r = await fetchSupabaseSessionCards(
                            wordIds.length, secStr, step as string, undefined, wordIds
                        );
                        cards = r.sessionWords;
                    }
                } else {
                    // Per-word progress is per quiz type: show the dimension the
                    // user is currently practicing (typing vs multiple_choice).
                    const res = await fetchAllCards(1, 1000, secStr, step as string, quizType);
                    cards = res.cards;
                }

                // Transform FlashCards to SessionWords
                const transformedCards = cards.map((card: SupabaseSessionWord) => ({
                    id: card.id,
                    word: card.japanese_word,
                    meaning: card.english,
                    progress: card.progress,
                    isReview: card.isReview,
                    totalMisses: card.totalMisses,
                    correctAnswers: card.correctAnswers,
                    timeToAnswer: card.timeToAnswer,
                    progress_status: card.progress_status,
                    marked_as: card.marked_as
                }));
                
                setAllWords(transformedCards);
            } catch (error) {
                console.error('❌ Failed to load all words:', error);
            } finally {
                setIsLoadingAllWords(false);
            }
        }
        if (router.isReady) {
            loadAllWords();
        }
    }, [router.isReady, router.query, quizType, isPrimitives, isKanji, isTubelex]);

    // Load settings from database on mount
    useEffect(() => {
        async function loadSettings() {
            try {
                console.log('Loading settings from database...');
                await fetch('/api/session/init', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const response = await fetch('/api/settings/get', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error('Failed to load settings');
                }
                const data = await response.json();
                console.log('Settings loaded:', data);
                setSettings(data);
                setQuizDirection(data.quizDirection);
                settingsLoadedRef.current = true;
            } catch (error) {
                console.error('Failed to load settings:', error);
                setSettings(DEFAULT_SETTINGS);
                settingsLoadedRef.current = true;
            }
        }
        loadSettings();
    }, [])

    // Define loadCards function that can be reused
    const loadCards = useCallback(async () => {
        const loadId = Math.random().toString(36).substring(7);
        console.log(`[${loadId}] loadCards START - Settings:`, settings);
        
        try {
            const { section, step, practicedWordIds } = router.query;
            const isPracticed = !!practicedWordIds && typeof practicedWordIds === 'string';
            if (!section || (!isPracticed && !step)) {
                console.log(`[${loadId}] Missing required session params, skipping load`);
                return;
            }

            // The preview (non-results) path needs settings for the session size.
            // The results path is keyed by the practiced IDs in the URL, so it can
            // load without waiting for settings.
            if (!isPracticed && !settings) {
                console.log(`[${loadId}] No settings available, skipping preview load`);
                return;
            }

            console.log(`[${loadId}] Loading session words for section ${section} step ${step}`);

            setError(null);

            let result;

            // Match the quiz's per-type selection: typing mode picks/orders words
            // by typing progress, multiple-choice by its own. Without this the
            // preview (defaulting to multiple_choice) showed a different set than
            // the typing quiz actually ran. quizType is derived from the page's
            // mode toggle, so flipping it reloads this session.

            // If we have practicedWordIds, we're showing results - fetch those specific words
            if (isPracticed) {
                // Claim the load synchronously so a re-fire (e.g. when settings
                // finish loading) can't kick off a second, slower fetch.
                resultsLoadedRef.current = true;
                const idsString = practicedWordIds as string;
                console.log(`[${loadId}] Fetching practiced words:`, idsString);
                const wordIds = idsString.split(',').map(id => parseInt(id));
                // Reuse the promise the quiz end screen already kicked off, so this
                // resolves instantly when arriving straight from a finished quiz.
                const prefetched = isPrimitives
                    ? takeCachedKanjiPrimitiveCardsByIds(wordIds, quizType)
                    : isKanji
                    ? takeCachedKanjiFreqCardsByIds(wordIds, quizType)
                    : isTubelex
                    ? takeCachedTubelexCardsByIds(wordIds, quizType)
                    : takeCachedSessionCardsByIds(wordIds, contentMode === 'sentences' ? 'sentences' : 'words');
                if (prefetched) {
                    // Straight from a finished quiz: the data is already loading and
                    // the session cookie was set during the quiz, so we skip the
                    // /api/session/init round-trip and render the moment it resolves.
                    const r = await prefetched;
                    result = { sessionWords: r.sessionWords };
                } else {
                    setIsLoading(true);
                    const initResponse = await fetch('/api/session/init', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (!initResponse.ok) {
                        throw new Error('Failed to initialize session');
                    }
                    // Fetch by explicit ids (section-agnostic) — anime decks span
                    // many words10k sections, so a section/step query misses them.
                    const r = isPrimitives
                        ? await fetchKanjiPrimitiveSessionCards(wordIds, 2, undefined, quizType)
                        : isKanji
                        ? await fetchKanjiFreqSessionCards(wordIds, quizType)
                        : isTubelex
                        ? await fetchTubelexSessionCards(wordIds, quizType)
                        : await fetchSupabaseSessionCards(
                            wordIds.length,
                            section as string,
                            step as string,
                            undefined,
                            wordIds,
                            2,
                            quizType
                        );
                    result = { sessionWords: r.sessionWords };
                }
            } else {
                setIsLoading(true);
                // Initialize session first
                console.log(`[${loadId}] Initializing session...`);
                const initResponse = await fetch('/api/session/init', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!initResponse.ok) {
                    throw new Error('Failed to initialize session');
                }

                // For regular session preview, get next unviewed words
                console.log(`[${loadId}] Fetching next unviewed words...`);
                let wordIds: number[];
                let isReview = false;
                if (isPrimitives) {
                    const progressResponse = await fetch(`/api/progress/last-kanji-primitives?sessionSize=${settings!.sessionSize}&quizType=${quizType}`, {
                        credentials: 'include'
                    });

                    if (!progressResponse.ok) {
                        throw new Error('Failed to get next primitives');
                    }

                    const data = await progressResponse.json();
                    wordIds = data.wordIds;
                } else {
                    const lastEndpoint = isKanji ? 'last-kanji-freq' : isTubelex ? 'last-words-tubelex' : 'last-word';
                    const progressResponse = await fetch(`/api/progress/${lastEndpoint}?section=${section}&step=${step}&sessionSize=${settings!.sessionSize}&quizType=${quizType}`, {
                        credentials: 'include'
                    });

                    if (!progressResponse.ok) {
                        throw new Error('Failed to get next words');
                    }

                    const data = await progressResponse.json();
                    wordIds = data.wordIds;
                    isReview = data.isReview;
                }
                console.log(`[${loadId}] Next word IDs for session:`, wordIds);
                console.log(`[${loadId}] Is review session:`, isReview);

                // Fetch session cards for these specific word IDs
                console.log(`[${loadId}] Fetching session cards...`);
                result = isPrimitives
                    ? await fetchKanjiPrimitiveSessionCards(wordIds, 2, undefined, quizType)
                    : isKanji
                    ? await fetchKanjiFreqSessionCards(wordIds, quizType)
                    : isTubelex
                    ? await fetchTubelexSessionCards(wordIds, quizType)
                    : await fetchSupabaseSessionCards(
                        settings!.sessionSize || 0,
                        section as string,
                        step as string,
                        undefined, // No longer using startId
                        wordIds, // Pass the specific word IDs to fetch
                        2,
                        quizType
                    );
            }

            // Transform and set words
            const transformedWords = result.sessionWords.map(word => ({
                id: word.id,
                word: word.japanese_word,
                meaning: word.english,
                progress: word.progress,
                isReview: word.isReview,
                totalMisses: word.totalMisses,
                correctAnswers: word.correctAnswers,
                timeToAnswer: word.timeToAnswer,
                progress_status: word.progress_status,
                marked_as: word.marked_as
            }));

            console.log(`[${loadId}] Setting ${transformedWords.length} words`);
            setWords(transformedWords);
            
        } catch (err) {
            console.error(`[${loadId}] Error:`, err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load session words';
            setError(errorMessage);
        } finally {
            console.log(`[${loadId}] Finished - setting isLoading to false`);
            setIsLoading(false);
        }
    }, [router.query, settings, quizType, contentMode, isPrimitives, isKanji, isTubelex]);

    // Use loadCards in the effect
    useEffect(() => {
        const effectId = Math.random().toString(36).substring(7);
        console.log(`[${effectId}] Effect triggered:`, {
            isRouterReady: router.isReady,
            hasSettings: !!settings,
            settingsSize: settings?.sessionSize,
            section: router.query.section,
            step: router.query.step
        });

        if (!router.isReady || !router.query.section || !router.query.step) {
            console.log(`[${effectId}] Skipping loadCards - conditions not met`);
            return;
        }

        const isPracticed = !!router.query.practicedWordIds;
        // Results (practiced) load runs once and doesn't wait for settings, so it
        // can consume the quiz's prefetched data immediately. Preview load waits
        // for settings (needed for session size).
        if (isPracticed) {
            if (resultsLoadedRef.current) return;
            loadCards();
        } else if (settings) {
            loadCards();
        }
    }, [router.isReady, loadCards, settings, router.query.section, router.query.step, router.query.practicedWordIds]);

    // Memoize the navigation functions
    const startNextSession = useCallback(() => {
        const { section, step, content } = router.query;
        const params = new URLSearchParams({
            section: section as string,
            step: step as string,
            title: 'Study Session',
            subtitle: 'Words in this session',
            description: 'These are the words you\'ll practice in this session.'
        });
        if (content === 'kanji_primitives') params.set('content', 'kanji_primitives');
        else if (content === 'kanji_freq') params.set('content', 'kanji_freq');
        else if (content === 'words_tubelex') params.set('content', 'words_tubelex');
        else if (contentMode === 'sentences') params.set('content', 'sentences');
        router.push(`/session_preview_results?${params.toString()}`);
    }, [router.query, contentMode]);

    const startQuiz = useCallback(() => {
        const { section, step, content } = router.query;
        if (!section) {
            console.error('Missing section in URL parameters');
            return;
        }

        // Kick the start music IMMEDIATELY (in the user-gesture handler)
        // so it covers the navigation + quizz page load. quizz.tsx also
        // calls play('quizStart') on mount; audio.ts dedupes within 5s.
        playQuizStartSound();

        // Carry the deck/content choice through to /quizz (kanji_freq or sentences).
        const contentQuery = content === 'kanji_primitives'
            ? { content: 'kanji_primitives' }
            : content === 'kanji_freq'
            ? { content: 'kanji_freq' }
            : content === 'words_tubelex'
            ? { content: 'words_tubelex' }
            : contentMode === 'sentences' ? { content: 'sentences' } : {};

        // For review quiz, we only need section
        if (practicedWordIds) {
            router.push({
                pathname: '/quizz',
                query: {
                    section,
                    practicedWordIds,
                    ...contentQuery
                }
            });
            return;
        }

        // For regular quiz, we need both section and step
        if (!step) {
            console.error('Missing step in URL parameters for regular quiz');
            return;
        }

        router.push({
            pathname: '/quizz',
            query: {
                section,
                step,
                practicedWordIds: content === 'kanji_primitives'
                    ? words.map(word => word.id).join(',')
                    : practicedWordIds,
                ...contentQuery
            }
        });
    }, [router.query, practicedWordIds, contentMode, words]);

    // Add spacebar shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !showSettings) {
                e.preventDefault() // Prevent page scrolling
                if (showResultsButton) {
                    startNextSession();
                } else {
                    startQuiz();
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showSettings, showResultsButton, startNextSession, startQuiz])

    const goToSection = () => {
        const { section } = router.query;
        router.push(isPrimitives ? '/kanji_freq_sections' : isKanji ? `/kanji_freq_steps?section=${section}` : isTubelex ? `/words_tubelex_steps?section=${section}` : `/steps?section=${section}`);
    }

    const goToHome = () => {
        router.push('/');
    }

    // Intersection Observer for infinite scrolling
    useEffect(() => {
        console.log('Infinite scroll effect triggered with:', {
            hasObserverTarget: !!observerTarget.current,
            hasMore,
            isLoadingMore,
            activeTab,
            currentPage
        });

        if (!observerTarget.current || !hasMore || isLoadingMore || activeTab !== "all") {
            console.log('Skipping observer setup because:', {
                noTarget: !observerTarget.current,
                noMoreData: !hasMore,
                isCurrentlyLoading: isLoadingMore,
                wrongTab: activeTab !== "all"
            });
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                console.log('Observer callback triggered:', {
                    isIntersecting: entries[0].isIntersecting,
                    hasMore,
                    isLoadingMore
                });
                
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    console.log(`Loading more words - incrementing page from ${currentPage}`);
                    setCurrentPage(prev => prev + 1);
                }
            },
            { threshold: 0.1 }
        );

        console.log('Setting up observer on target element');
        observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, activeTab, currentPage]);

    // True only on the very first load, before any words exist. A later refetch
    // (e.g. flipping the quiz-mode toggle, which re-orders words by that type's
    // progress) keeps the existing content + chrome mounted and shows a light
    // inline state on just the list, so it never feels like a full page reload.
    const isInitialLoad = (isLoading || (activeTab === "all" && isLoadingAllWords))
        && words.length === 0 && allWords.length === 0;
    // Refresh in flight for the currently visible list.
    const isRefreshing = activeTab === "all" ? isLoadingAllWords : isLoading;

    const renderContent = () => {
        if (isInitialLoad) {
            return (
                <LoadingState text="Loading your results" />
            )
        }

        if (error) {
            return (
                <div className="flex items-center justify-center flex-1 flex-col gap-4">
                    <div className="text-white text-2xl">Error loading session</div>
                    <div className="text-red-400">{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-[#2F2F2F] border border-[#4F4F4F] text-white px-4 py-2 rounded hover:bg-[#363636] transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )
        }

        if ((!words || words.length === 0) && activeTab !== "all") {
            return (
                <LoadingState
                    text={isPrimitives ? 'Preparing your primitives' : 'Preparing your words'}
                    subText={isPrimitives ? 'Gathering this primitive session.' : "Gathering this session's results."}
                />
            )
        }

        return (
            <>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-8">
                    {displayTitle}
                </h1>

                <div>
                    <div className="bg-[#1F1F1F] border border-[#4F4F4F] rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col gap-4 sm:gap-6">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="text-white text-base sm:text-lg font-medium mb-1 sm:mb-2">
                                        {activeTab === "all" ? (isPrimitives ? "Complete Primitive List" : "Complete Word List") : subtitle}
                                    </h2>
                                    <p className="text-[#A1A1A1] text-xs sm:text-sm">
                                        {activeTab === "all" ? (isPrimitives ? "Browse through all available primitives." : "Browse through all available words.") : description}
                                    </p>
                                </div>
                                <CircularProgress
                                    progress={progress}
                                    size={50}
                                    strokeWidth={6}
                                    className="text-white shrink-0"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
                                    <TabNavigation
                                        activeTab={activeTab}
                                        onTabChange={setActiveTab}
                                    />
                                    {!showResultsButton && !isPrimitives && (
                                        <ContentPills value={contentMode} onChange={handleContentModeChange} />
                                    )}
                                    {!showResultsButton && !isPrimitives && contentMode === 'words' && (
                                        <QuizModePills value={quizMode as QuizMode} onChange={handleQuizModeChange} />
                                    )}
                                    {showLangPills && !showResultsButton && (
                                        <TypingLangPills value={typingLang} onChange={handleTypingLangChange} variant={langPillVariant} />
                                    )}
                                </div>
                                <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-4">
                                    <button
                                        onClick={showResultsButton ? startNextSession : startQuiz}
                                        className="bg-[#FF0054] hover:bg-[#e0004a] text-white font-medium px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md transition-colors text-sm sm:text-base"
                                    >
                                        {showResultsButton ? (
                                            <><span className="sm:hidden">Next</span><span className="hidden sm:inline">Go to Next Session</span></>
                                        ) : 'Start Quiz'}
                                    </button>
                                    <button
                                        onClick={goToSection}
                                        className="bg-[#2F2F2F] border border-[#4F4F4F] hover:bg-[#363636] text-white font-medium px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md transition-colors text-sm sm:text-base"
                                    >
                                        <span className="sm:hidden">Section</span><span className="hidden sm:inline">Back to Section</span>
                                    </button>
                                    <button
                                        onClick={goToHome}
                                        className="bg-[#2F2F2F] border border-[#4F4F4F] hover:bg-[#363636] text-white font-medium px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md transition-colors text-sm sm:text-base"
                                    >
                                        Home
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 sm:mt-6 relative">
                        {isRefreshing && (
                            <div className="absolute inset-0 z-10 flex items-start justify-center pt-10 sm:pt-12 rounded-lg bg-[#1F1F1F]/50 backdrop-blur-[1px]">
                                <div className="flex items-center gap-2 text-white text-sm">
                                    <svg className="animate-spin h-4 w-4 text-[#FF0054]" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Updating list…
                                </div>
                            </div>
                        )}
                        <div className={isRefreshing ? 'opacity-40 pointer-events-none transition-opacity duration-200' : 'transition-opacity duration-200'}>
                            {activeTab === "session" ? (
                                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                    {words.map((word) => (
                                        <WordCard key={word.id} word={word} statusContent={contentParam} quizType={quizType} />
                                    ))}
                                </div>
                            ) : activeTab === "speed" ? (
                                <DifficultyGroups words={words} />
                            ) : activeTab === "all" ? (
                                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                    {allWords.map((word) => (
                                        <WordCard key={word.id} word={word} statusContent={contentParam} quizType={quizType} />
                                    ))}
                                </div>
                            ) : (
                                <SuccessRateGroups words={words} />
                            )}
                        </div>
                    </div>
                </div>
            </>
        )
    }

    // Update the settings modal to handle changes
    const handleSettingsChange = useCallback(() => {
        console.log('Settings changed, reloading session...');
        // Fetch new settings from database
        fetch('/api/settings/get', {
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load settings');
            }
            return response.json();
        })
        .then(newSettings => {
            console.log('New settings loaded:', newSettings);
            setSettings(newSettings);
            setQuizDirection(newSettings.quizDirection);
            if (typeof window !== 'undefined') {
                const storedMode = window.localStorage.getItem('quizMode');
                if (storedMode === 'typing' || storedMode === 'multiple-choice') setQuizMode(storedMode);
            }
            // Force reload cards with new session size
            if (router.isReady) {
                loadCards();
            }
        })
        .catch(error => {
            console.error('Failed to load new settings:', error);
        });
    }, [router.isReady, loadCards]);

    useEffect(() => {
        let cancelled = false;
        const fetchProgress = async () => {
            if (!router.query.section || !router.query.step) return;
            try {
                // Show progress for the input mode in use (typing vs multiple_choice).
                // quizType flips once on mount (default -> real mode), so guard
                // against a stale fetch overwriting the latest with the wrong type.
                const stepData = await calculateStepProgress(router.query.section as string, router.query.step as string, quizType, contentParam);
                if (cancelled) return;
                setProgress(stepData.averageProgress);
            } catch (error) {
                console.error('Error fetching progress:', error);
            }
        };

        fetchProgress();
        return () => { cancelled = true; };
    }, [router.query.section, router.query.step, quizType, contentParam]);

    useEffect(() => onSettingsSaved(handleSettingsChange), [onSettingsSaved, handleSettingsChange]);

    return (
        <div className="min-h-screen bg-[#181818] flex flex-col">
            <div className="flex-1 overflow-auto">
                <div className="max-w-6xl mx-auto p-3 sm:p-6 md:p-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    )
}
