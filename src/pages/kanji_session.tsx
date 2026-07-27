import { useRouter } from 'next/router'
import LoadingState from '@/components/LoadingState'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { SessionKanji as SupabaseSessionKanji } from '../utils/supabase-client'
import { fetchSupabaseSessionKanji, fetchAllKanji } from '../utils/supabase-client'
import TabNavigation from '@/components/TabNavigation'
import KanjiCard from '../components/KanjiCard'
import WordCard from '../components/WordCard'
import type { SessionWord } from '../utils/cards'
import CircularProgress from '../components/CircularProgress'
import { calculateStepProgress, updateKanjiProgressStatus } from '../utils/progress-calculator'
import { useSettingsModal } from '@/components/layout/SettingsContext'

interface SessionKanji {
    id: number;
    japanese_word: string;
    english: string;
    mnemonic?: string;
    progress: number;
    total_misses: number;
    correct_answers: number;
    time_to_answer: number;
    progress_status?: 'new' | 'learning' | 'mastered' | 'to_review';
    marked_as?: 'new' | 'learning' | 'mastered' | 'to_review';
}

interface KanjiDifficulty {
    [key: number]: {
        progress: number;
        time_to_answer: number;
        total_misses: number;
        correct_answers: number;
    };
}

interface FrequencyWord {
    id: number;
    japanese_word: string;
    japanese_reading: string;
    english: string;
    part_of_speech: string;
    example_sentence_japanese: string | null;
    example_sentence_english: string | null;
    containsKanji: string[];
}

const DEFAULT_SETTINGS = { sessionSize: 7, showFurigana: false };

export default function KanjiSession() {
    const router = useRouter()
    const [kanji, setKanji] = useState<SessionKanji[]>([])
    const [allKanji, setAllKanji] = useState<SessionKanji[]>([])
    const [frequencyWords, setFrequencyWords] = useState<FrequencyWord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingAllKanji, setIsLoadingAllKanji] = useState(true)
    const [isLoadingWords, setIsLoadingWords] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("session")
    const { isSettingsOpen: showSettings, onSettingsSaved } = useSettingsModal()
    const [settings, setSettings] = useState<{ sessionSize?: number; showFurigana?: boolean } | null>(null)
    const nextKanjiRef = useRef<any>(null);
    const settingsLoadedRef = useRef(false);
    const [progress, setProgress] = useState<number>(0);

    // Get props from URL query
    const title = router.query.title as string || "Kanji Study Session";
    const subtitle = router.query.subtitle as string || "Kanji in this session";
    const description = router.query.description as string || "These are the kanji you'll practice in this session.";
    const practicedKanjiIds = router.query.practicedKanjiIds as string;
    const showResultsButton = router.query.showResultsButton === 'true';

    // Frequency mode parameters
    const isFrequencyMode = router.query.mode === 'frequency';
    const frequencyStart = router.query.frequencyStart as string;
    const frequencyEnd = router.query.frequencyEnd as string;

    // Single kanji mode parameters
    const isSingleKanjiMode = router.query.mode === 'single_kanji';
    const kanjiChar = router.query.kanjiChar as string;
    const kanjiId = router.query.kanjiId as string;

    // Multi kanji mode parameters
    const isMultiKanjiMode = router.query.mode === 'multi_kanji';
    const kanjiChars = router.query.kanjiChars as string;
    const kanjiIds = router.query.kanjiIds as string;
    const kanjiCharList = kanjiChars?.split(',').map(k => k.trim()).filter(k => k) || [];

    // Extract section numbers for display
    const sectionNumber = router.query.section?.toString().replace('kanji_section_', '') || '';
    const displayTitle = isMultiKanjiMode
        ? (title || (kanjiCharList.length <= 3 ? `Words with ${kanjiCharList.join(', ')}` : `Words with ${kanjiCharList.length} Kanji`))
        : isSingleKanjiMode
            ? (title || `Words with ${kanjiChar}`)
            : isFrequencyMode
                ? (title || `Kanji ${frequencyEnd}`)
                : `Kanji Section ${sectionNumber}`;

    // Load words for frequency mode, single kanji mode, or multi kanji mode
    useEffect(() => {
        async function loadWords() {
            // Multi kanji mode: fetch words containing any of the selected kanji
            if (isMultiKanjiMode && kanjiChars) {
                // Wait for settings to load before fetching words
                if (!settings || !settings.sessionSize) {
                    console.log('⏳ Waiting for settings to load before fetching multi kanji words...');
                    return;
                }

                try {
                    console.log('=== LOADING MULTI KANJI WORDS ===');
                    console.log('Kanji characters:', kanjiCharList);
                    console.log('Session size from settings:', settings.sessionSize);
                    const response = await fetch(
                        `/api/kanji/get-words-by-kanji?kanji=${encodeURIComponent(kanjiChars)}`,
                        { credentials: 'include' }
                    );

                    if (!response.ok) {
                        throw new Error('Failed to fetch words for kanji');
                    }

                    const result = await response.json();
                    const allWords = result.words || [];
                    console.log('Fetched words for selected kanji:', allWords.length);

                    // Apply session size limit
                    const limitedWords = allWords.slice(0, settings.sessionSize);
                    console.log('Limited to session size:', limitedWords.length);
                    setFrequencyWords(limitedWords);
                } catch (error) {
                    console.error('❌ Failed to load multi kanji words:', error);
                } finally {
                    setIsLoadingWords(false);
                }
                return;
            }

            // Single kanji mode: fetch words containing the specific kanji
            if (isSingleKanjiMode && kanjiChar) {
                // Wait for settings to load before fetching words
                if (!settings || !settings.sessionSize) {
                    console.log('⏳ Waiting for settings to load before fetching single kanji words...');
                    return;
                }

                try {
                    console.log('=== LOADING SINGLE KANJI WORDS ===');
                    console.log('Kanji character:', kanjiChar);
                    console.log('Session size from settings:', settings.sessionSize);
                    const response = await fetch(
                        `/api/kanji/get-words-by-kanji?kanji=${encodeURIComponent(kanjiChar)}`,
                        { credentials: 'include' }
                    );

                    if (!response.ok) {
                        throw new Error('Failed to fetch words for kanji');
                    }

                    const result = await response.json();
                    const allWords = result.words || [];
                    console.log('Fetched words for kanji:', allWords.length);

                    // Apply session size limit
                    const limitedWords = allWords.slice(0, settings.sessionSize);
                    console.log('Limited to session size:', limitedWords.length);
                    setFrequencyWords(limitedWords);
                } catch (error) {
                    console.error('❌ Failed to load single kanji words:', error);
                } finally {
                    setIsLoadingWords(false);
                }
                return;
            }

            // Frequency mode: fetch words by frequency range
            if (isFrequencyMode && frequencyStart && frequencyEnd) {
                // Wait for settings to load before fetching words
                if (!settings || !settings.sessionSize) {
                    console.log('⏳ Waiting for settings to load before fetching frequency words...');
                    return;
                }

                try {
                    console.log('=== LOADING FREQUENCY WORDS ===');
                    console.log('Session size from settings:', settings.sessionSize);
                    const response = await fetch(
                        `/api/kanji/get-words-by-frequency?frequencyStart=${frequencyStart}&frequencyEnd=${frequencyEnd}`,
                        { credentials: 'include' }
                    );

                    if (!response.ok) {
                        throw new Error('Failed to fetch frequency words');
                    }

                    const result = await response.json();
                    const allWords = result.words || [];
                    console.log('Fetched frequency words:', allWords.length);

                    // Apply session size limit
                    const limitedWords = allWords.slice(0, settings.sessionSize);
                    console.log('Limited to session size:', limitedWords.length);
                    setFrequencyWords(limitedWords);
                } catch (error) {
                    console.error('❌ Failed to load frequency words:', error);
                } finally {
                    setIsLoadingWords(false);
                }
                return;
            }

            // Neither mode, stop loading
            setIsLoadingWords(false);
        }

        if (router.isReady) {
            loadWords();
        }
    }, [router.isReady, isFrequencyMode, frequencyStart, frequencyEnd, isSingleKanjiMode, kanjiChar, isMultiKanjiMode, kanjiChars, settings]);

    // Load all kanji at once
    useEffect(() => {
        async function loadAllKanji() {
            try {
                console.log('=== LOADING ALL KANJI (TAB: ALL) ===');

                const { section, mode, frequencyStart: freqStart, frequencyEnd: freqEnd } = router.query;

                // Initialize session first
                console.log('Initializing kanji session...');
                const initResponse = await fetch('/api/kanji_session/init', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!initResponse.ok) {
                    throw new Error('Failed to initialize kanji session');
                }

                const sessionData = await initResponse.json();
                console.log('Kanji session initialized successfully, userId:', sessionData.userId);

                let kanjiData;

                if (mode === 'frequency' && freqStart && freqEnd) {
                    // Frequency mode: fetch kanji by frequency range
                    console.log('Fetching all kanji by frequency from API...');
                    const response = await fetch(
                        `/api/kanji/get-all-frequency?frequencyStart=${freqStart}&frequencyEnd=${freqEnd}`,
                        { credentials: 'include' }
                    );

                    if (!response.ok) {
                        throw new Error('Failed to fetch frequency-based kanji');
                    }

                    const result = await response.json();
                    kanjiData = result.kanji;
                } else {
                    console.log('Fetching all kanji from Supabase...');
                    const result = await fetchAllKanji(section as string);
                    kanjiData = result.kanji;
                }

                // Transform Kanji to SessionKanji while preserving order
                const transformedKanji = kanjiData.map((k: SupabaseSessionKanji) => ({
                    id: k.id,
                    japanese_word: k.japanese_word,
                    english: k.english,
                    mnemonic: k.mnemonic,
                    progress: k.progress || 0,
                    total_misses: k.total_misses || 0,
                    correct_answers: k.correct_answers || 0,
                    time_to_answer: k.time_to_answer || 0,
                    progress_status: k.progress_status,
                    marked_as: k.marked_as
                }));

                console.log('Transformed kanji count:', transformedKanji.length);
                setAllKanji(transformedKanji);
            } catch (error) {
                console.error('❌ Failed to load all kanji:', error);
            } finally {
                setIsLoadingAllKanji(false);
            }
        }
        if (router.isReady) {
            loadAllKanji();
        }
    }, [router.isReady, router.query]);

    // Load settings from database on mount
    useEffect(() => {
        async function loadSettings() {
            try {
                console.log('Loading settings from database...');
                await fetch('/api/kanji_session/init', {
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
                settingsLoadedRef.current = true;
            } catch (error) {
                console.error('Failed to load settings:', error);
                setSettings(DEFAULT_SETTINGS);
                settingsLoadedRef.current = true;
            }
        }
        loadSettings();
    }, []);

    // Define loadKanji function that can be reused
    const loadKanji = useCallback(async () => {
        try {
            if (!settings || !settings.sessionSize) {
                console.log('⏳ Waiting for settings to load...');
                return;
            }

            // Single kanji mode or multi kanji mode: words are loaded by loadWords, skip kanji loading
            if (isSingleKanjiMode || isMultiKanjiMode) {
                console.log('Single/multi kanji mode - skipping loadKanji, words are loaded separately');
                setIsLoading(false);
                return;
            }

            const { section, practicedKanjiIds } = router.query;

            console.log('\n=== LOADING SESSION KANJI (TAB: SESSION) ===');
            console.log('Query parameters:', { section, practicedKanjiIds });
            console.log('Current settings:', settings);

            setIsLoading(true);
            setError(null);

            let sessionKanji;
            let nextKanji;

            if (practicedKanjiIds) {
                // If we have practiced kanji IDs, use the already loaded kanji
                console.log('Using practiced kanji:', practicedKanjiIds);
                const kanjiIds = typeof practicedKanjiIds === 'string' 
                    ? practicedKanjiIds.split(',').map((id: string) => parseInt(id))
                    : [];
                console.log('Parsed kanji IDs:', kanjiIds);
                
                // Use allKanji if available, otherwise fetch
                if (allKanji.length > 0) {
                    console.log('Using already loaded kanji');
                    // Create a Map to ensure uniqueness by ID
                    const kanjiMap = new Map();
                    allKanji.forEach(k => {
                        if (kanjiIds.includes(k.id) && !kanjiMap.has(k.id)) {
                            kanjiMap.set(k.id, k);
                        }
                    });
                    sessionKanji = Array.from(kanjiMap.values());
                } else {
                    console.log('Fetching kanji since none are loaded');
                    try {
                    const { kanji } = await fetchAllKanji(section as string);
                    
                    // Ensure uniqueness by ID
                    const kanjiMap = new Map();
                    kanji.forEach((k: SupabaseSessionKanji) => {
                        if (kanjiIds.includes(k.id) && !kanjiMap.has(k.id)) {
                            kanjiMap.set(k.id, k);
                        }
                    });
                    sessionKanji = Array.from(kanjiMap.values());
                    } catch (error) {
                        console.error('Failed to fetch kanji, will show empty session:', error);
                        sessionKanji = [];
                    }
                }
                
                console.log('Filtered session kanji count:', sessionKanji.length);
                nextKanji = null;

                // Update progress status for all kanji in the session.
                // Wrap each call so one missing/failing kanji_progress row (e.g. .single()
                // throwing on 0 rows for a freshly-practiced kanji) doesn't take down the
                // whole load — that was surfacing as "Failed to load kanji session" at the
                // end of a quiz session.
                console.log('Updating progress status for all kanji in session...');
                await Promise.all(sessionKanji.map(async (kanji: SupabaseSessionKanji) => {
                    try {
                        await updateKanjiProgressStatus(kanji.id);
                    } catch (statusError) {
                        console.error(`Failed to update progress status for kanji ${kanji.id}:`, statusError);
                    }
                }));
                console.log('Progress status update completed');
            } else if (isFrequencyMode && frequencyStart && frequencyEnd) {
                // Frequency mode: fetch kanji by frequency range
                console.log('Fetching session kanji by frequency:', frequencyStart, '-', frequencyEnd);

                const response = await fetch(
                    `/api/kanji/get-session-frequency?frequencyStart=${frequencyStart}&frequencyEnd=${frequencyEnd}&sessionSize=${settings.sessionSize}`,
                    { credentials: 'include' }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch frequency-based kanji');
                }

                const result = await response.json();
                sessionKanji = result.sessionKanji;
                nextKanji = result.nextKanji;
                nextKanjiRef.current = nextKanji;

                console.log('Fetched frequency session kanji result:', {
                    sessionKanjiCount: sessionKanji?.length || 0,
                    hasNextKanji: !!nextKanji
                });
            } else {
                console.log('Fetching last kanji progress for section:', section);

                // Get the last kanji ID from progress to determine where to start
                const progressResponse = await fetch(`/api/progress/last-kanji?section=${section}`, {
                    credentials: 'include'
                });
                if (!progressResponse.ok) {
                    console.error('Failed to get last kanji progress:', await progressResponse.text());
                    throw new Error('Failed to get last kanji progress');
                }
                const { lastKanjiId: lastId } = await progressResponse.json();
                // Add 1 to get the next kanji ID we haven't seen yet
                let lastKanjiId = (lastId + 1).toString();
                console.log('Next kanji ID from API:', lastKanjiId);

                console.log('Fetching session kanji with params:', {
                    sessionSize: settings.sessionSize,
                    section,
                    startFrom: lastKanjiId
                });

                const result = await fetchSupabaseSessionKanji(
                    settings.sessionSize,
                    section as string,
                    lastKanjiId
                );
                sessionKanji = result.sessionKanji;
                nextKanji = result.nextKanji;
                nextKanjiRef.current = nextKanji;

                console.log('Fetched session kanji result:', {
                    sessionKanjiCount: sessionKanji.length,
                    hasNextKanji: !!nextKanji
                });
            }

            // Transform Kanji to SessionKanji
            const transformedKanji = sessionKanji.map((k: SupabaseSessionKanji) => ({
                id: k.id,
                japanese_word: k.japanese_word,
                english: k.english,
                mnemonic: k.mnemonic,
                progress: k.progress || 0,
                total_misses: k.total_misses || 0,
                correct_answers: k.correct_answers || 0,
                time_to_answer: k.time_to_answer || 0,
                progress_status: k.progress_status,
                marked_as: k.marked_as
            }));

            console.log('Transformed kanji count:', transformedKanji.length);
            setKanji(transformedKanji);
            setIsLoading(false);
        } catch (error) {
            console.error('❌ Error:', error);
            setError('Failed to load kanji session');
            setIsLoading(false);
        }
    }, [settings, router.query, allKanji, isFrequencyMode, isSingleKanjiMode, isMultiKanjiMode, frequencyStart, frequencyEnd]);

    // Use loadKanji in the effect
    useEffect(() => {
        if (router.isReady) {
            loadKanji();
        }
    }, [router.isReady, loadKanji]);

    // Memoize the navigation functions
    const startNextSession = useCallback(() => {
        const { section } = router.query;
        // Get the last kanji ID from the current session and add 1 to get the next one
        const nextKanjiId = kanji.length > 0 ? Math.max(...kanji.map(k => k.id)) + 1 : 1;
        const params = new URLSearchParams({
            section: section as string,
            title: 'Kanji Study Session',
            subtitle: 'Kanji in this session',
            description: 'These are the kanji you\'ll practice in this session.',
            lastKanjiId: nextKanjiId.toString()
        });
        router.push(`/kanji_session?${params.toString()}`);
    }, [router.query, kanji]);

    const startQuiz = useCallback(() => {
        // Multi kanji mode: use the kanji-specific words quiz with multiple kanji
        if (isMultiKanjiMode) {
            if (frequencyWords.length === 0) {
                console.error('No words available for quiz');
                return;
            }

            // Navigate to the kanji-specific words quiz with the word IDs
            const wordIds = frequencyWords.map(w => w.id).join(',');
            router.push({
                pathname: '/bykanjiquizz',
                query: {
                    practicedWordIds: wordIds,
                    kanjiChars,
                    kanjiIds,
                    title: kanjiCharList.length <= 3 ? kanjiCharList.join(', ') : `${kanjiCharList.length} Kanji`,
                    mode: 'multi_kanji'
                }
            });
            return;
        }

        // Single kanji mode: use the kanji-specific words quiz
        if (isSingleKanjiMode) {
            if (frequencyWords.length === 0) {
                console.error('No words available for quiz');
                return;
            }

            // Navigate to the kanji-specific words quiz with the word IDs
            const wordIds = frequencyWords.map(w => w.id).join(',');
            router.push({
                pathname: '/bykanjiquizz',
                query: {
                    practicedWordIds: wordIds,
                    kanjiChar,
                    kanjiId,
                    title: `${kanjiChar} Words`,
                    mode: 'single_kanji'
                }
            });
            return;
        }

        // Frequency mode: use the kanji-specific words quiz
        if (isFrequencyMode) {
            if (frequencyWords.length === 0) {
                console.error('No words available for quiz');
                return;
            }

            // Navigate to the kanji-specific words quiz with the word IDs
            const wordIds = frequencyWords.map(w => w.id).join(',');
            router.push({
                pathname: '/bykanjiquizz',
                query: {
                    practicedWordIds: wordIds,
                    frequencyStart,
                    frequencyEnd,
                    title: `Kanji ${frequencyEnd}`,
                    mode: 'frequency'
                }
            });
            return;
        }

        const { section } = router.query;

        // Get the last kanji ID from the URL or from the current session
        const lastKanjiId = router.query.lastKanjiId || (kanji.length > 0 ? Math.max(...kanji.map(k => k.id)) : 0);

        if (!section) {
            console.error('Missing section in URL parameters');
            return;
        }

        router.push({
            pathname: '/kanji_quizz',
            query: {
                section,
                practicedKanjiIds: practicedKanjiIds,
                lastKanjiId: lastKanjiId.toString(),
                mode: 'quiz_only' // Add quiz_only mode to skip learning phase
            }
        });
    }, [router.query, kanji, practicedKanjiIds, isFrequencyMode, isSingleKanjiMode, isMultiKanjiMode, kanjiChar, kanjiId, kanjiChars, kanjiIds, kanjiCharList, frequencyWords, frequencyStart, frequencyEnd]);

    const startLearn = useCallback(() => {
        // Frequency mode, single kanji mode, and multi kanji mode learn not implemented yet
        if (isFrequencyMode || isSingleKanjiMode || isMultiKanjiMode) {
            console.log('Frequency/single/multi kanji mode learn not implemented yet');
            return;
        }

        const { section } = router.query;

        // Get the last kanji ID from the URL or from the current session
        const lastKanjiId = router.query.lastKanjiId || (kanji.length > 0 ? Math.max(...kanji.map(k => k.id)) : 0);

        if (!section) {
            console.error('Missing section in URL parameters');
            return;
        }

        router.push({
            pathname: '/kanji_quizz',
            query: {
                section,
                practicedKanjiIds: practicedKanjiIds,
                lastKanjiId: lastKanjiId.toString(),
                mode: 'learn' // This will tell the quiz to only show learning cards
            }
        });
    }, [router.query, kanji, practicedKanjiIds, isFrequencyMode, isSingleKanjiMode, isMultiKanjiMode]);

    // Add spacebar shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !showSettings) {
                e.preventDefault(); // Prevent page scrolling
                if (showResultsButton) {
                    startNextSession();
                } else {
                    startQuiz();
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showSettings, showResultsButton, startNextSession, startQuiz]);

    const goToSection = () => {
        if (isFrequencyMode || isSingleKanjiMode || isMultiKanjiMode) {
            router.push('/kanji_sections_frequency');
        } else {
            const { section } = router.query;
            router.push(`/kanji_sections?section=${section}`);
        }
    }

    const goToHome = () => {
        router.push('/jalingo');
    }

    // Update progress
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                if (isFrequencyMode && frequencyStart && frequencyEnd) {
                    // Frequency mode: use frequency-based progress endpoint
                    const response = await fetch(
                        `/api/kanji/frequency-section-progress?frequencyStart=${frequencyStart}&frequencyEnd=${frequencyEnd}`,
                        { credentials: 'include' }
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setProgress(data.averageProgress || 0);
                    }
                } else if (router.query.section) {
                    const sectionData = await calculateStepProgress(router.query.section as string, 'kanji');
                    setProgress(sectionData.averageProgress);
                }
            } catch (error) {
                console.error('Error fetching progress:', error);
            }
        };

        fetchProgress();
    }, [router.query.section, isFrequencyMode, frequencyStart, frequencyEnd]);

    const renderContent = () => {
        if (isLoading || (activeTab === "all" && isLoadingAllKanji) || ((isFrequencyMode || isSingleKanjiMode || isMultiKanjiMode) && isLoadingWords)) {
            return (
                <LoadingState text="Loading your session" />
            )
        }

        if (error) {
            return (
                <div className="flex items-center justify-center flex-1 flex-col gap-4">
                    <div className="text-white text-2xl">Error loading session</div>
                    <div className="text-red-200">{error}</div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-[#262626] text-white px-4 py-2 rounded hover:bg-[#2F2F2F]"
                    >
                        Try Again
                    </button>
                </div>
            )
        }

        // For single_kanji, multi_kanji, or frequency mode, check frequencyWords; for regular mode, check kanji
        if (activeTab !== "all") {
            if ((isFrequencyMode || isSingleKanjiMode || isMultiKanjiMode) && (!frequencyWords || frequencyWords.length === 0)) {
                return (
                    <LoadingState text="Preparing your words" subText="Setting up this study session for you." />
                )
            }
            if (!isFrequencyMode && !isSingleKanjiMode && !isMultiKanjiMode && (!kanji || kanji.length === 0)) {
                return (
                    <LoadingState text="Preparing your kanji" subText="Setting up this study session for you." />
                )
            }
        }

        return (
            <>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-8">
                    {activeTab === "all"
                        ? (isFrequencyMode ? `Kanji ${frequencyEnd} (by frequency)` : `Kanji Section ${sectionNumber}`)
                        : displayTitle}
                </h1>

                <div className="bg-[#262626] rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-lg">
                    <div className="bg-[#2F2F2F] rounded-lg p-4">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-white text-lg font-medium mb-2">
                                        {activeTab === "all" ? "Complete Kanji List" : subtitle}
                                    </h2>
                                    <p className="text-[#A1A1A1] text-sm">
                                        {activeTab === "all" ? "Browse through all available kanji." : description}
                                    </p>
                                </div>
                                <CircularProgress 
                                    progress={progress} 
                                    size={60}
                                    strokeWidth={6}
                                    className="text-white"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <TabNavigation 
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                />
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={showResultsButton ? startNextSession : startLearn}
                                        disabled={(isFrequencyMode || isSingleKanjiMode || isMultiKanjiMode) && !showResultsButton}
                                        className={`px-6 py-3 rounded-lg transition-colors flex-shrink-0 ${
                                            (isFrequencyMode || isSingleKanjiMode || isMultiKanjiMode) && !showResultsButton
                                                ? 'bg-[#1a1a1a] border border-[#3a3a3a] text-[#666] cursor-not-allowed'
                                                : 'bg-[#262626] border border-[#4F4F4F] text-white hover:bg-[#2F2F2F]'
                                        }`}
                                    >
                                        {showResultsButton ? 'Go to Next Session' : 'Learn'}
                                    </button>
                                    <button
                                        onClick={startQuiz}
                                        className="bg-[#262626] border border-[#4F4F4F] text-white px-6 py-3 rounded-lg hover:bg-[#2F2F2F] transition-colors flex-shrink-0"
                                    >
                                        Start Quiz
                                    </button>
                                    <button
                                        onClick={goToSection}
                                        className="bg-[#262626] border border-[#4F4F4F] text-white px-6 py-3 rounded-lg hover:bg-[#2F2F2F] transition-colors flex-shrink-0"
                                    >
                                        Back to Section
                                    </button>
                                    <button
                                        onClick={goToHome}
                                        className="bg-[#262626] border border-[#4F4F4F] text-white px-6 py-3 rounded-lg hover:bg-[#2F2F2F] transition-colors flex-shrink-0"
                                    >
                                        Home
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        {(isFrequencyMode || isSingleKanjiMode || isMultiKanjiMode) ? (
                            // Frequency mode, Single kanji mode, or Multi kanji mode: show words only
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {frequencyWords.map((word) => (
                                    <WordCard
                                        key={word.id}
                                        word={{
                                            id: word.id,
                                            word: word.japanese_word,
                                            reading: word.japanese_reading,
                                            meaning: word.english,
                                            progress: 0,
                                            isReview: false,
                                            totalMisses: 0,
                                            correctAnswers: 0,
                                            timeToAnswer: 0,
                                            progress_status: 'new',
                                            marked_as: 'new'
                                        }}
                                        showFurigana={settings?.showFurigana}
                                    />
                                ))}
                            </div>
                        ) : (
                            // Regular mode: show kanji only
                            activeTab === "session" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    {kanji.map((k) => (
                                        <KanjiCard key={k.id} kanji={k} />
                                    ))}
                                </div>
                            ) : activeTab === "all" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    {allKanji.map((k) => (
                                        <KanjiCard key={k.id} kanji={k} />
                                    ))}
                                </div>
                            ) : null
                        )}
                    </div>
                </div>
            </>
        )
    }

    // Update the settings modal to handle changes
    const handleSettingsChange = useCallback(() => {
        console.log('Settings changed, reloading session...');
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
            if (router.isReady) {
                loadKanji();
            }
        })
        .catch(error => {
            console.error('Failed to load new settings:', error);
        });
    }, [router.isReady, loadKanji]);

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
