"use client"

import { useRouter } from 'next/router'
import LoadingState from '@/components/LoadingState'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { SessionWord as SupabaseSessionWord } from '../utils/supabase-client'
import { fetchSupabaseSessionCards, fetchAllCards } from '../utils/supabase-client'
import WordAnalysis from '@/components/WordAnalysis'
import DifficultyGroups from '@/components/DifficultyGroups'
import SuccessRateGroups from '@/components/SuccessRateGroups'
import { useSettingsModal } from '@/components/layout/SettingsContext'
import TabNavigation from '@/components/TabNavigation'
import TypingLangPills, { type TypingLang } from '@/components/TypingLangPills'
import WordCard from '../components/WordCard'

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

const DEFAULT_SETTINGS = { sessionSize: 7 };

export default function SessionPreview() {
    console.log('SessionPreview component mounted');

    const router = useRouter()
    const [words, setWords] = useState<SessionWord[]>([])
    const [allWords, setAllWords] = useState<SessionWord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingAllWords, setIsLoadingAllWords] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("session")
    const { isSettingsOpen: showSettings, onSettingsSaved } = useSettingsModal()
    const [settings, setSettings] = useState<null | { sessionSize: number }>(null)
    const nextWordRef = useRef<any>(null);
    const settingsLoadedRef = useRef(false);
    const observerTarget = useRef<HTMLDivElement | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(50);
    // Answer-language choice lives here, on the session page. quizMode is stored
    // client-side; quizDirection comes from saved settings. The pills apply to a
    // forward quiz of either mode (typing: what you type; multiple-choice: what the
    // options show), so they're shown for both — but never in reverse.
    const [quizMode, setQuizMode] = useState<string>('multiple-choice');
    const [quizDirection, setQuizDirection] = useState<string | undefined>(undefined);
    const [typingLang, setTypingLang] = useState<TypingLang>('english');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const storedMode = window.localStorage.getItem('quizMode');
        if (storedMode === 'typing' || storedMode === 'multiple-choice') setQuizMode(storedMode);
        const storedLang = window.localStorage.getItem('typingLang');
        if (storedLang === 'japanese' || storedLang === 'english' || storedLang === 'mix') {
            setTypingLang('english');
        }
    }, []);

    const handleTypingLangChange = useCallback((lang: TypingLang) => {
        setTypingLang(lang);
        if (typeof window !== 'undefined') window.localStorage.setItem('typingLang', lang);
    }, []);

    const showLangPills = false && (quizMode === 'typing' || quizMode === 'multiple-choice') && quizDirection !== 'reverse';
    const langPillVariant = quizMode === 'typing' ? 'typing' : 'choice';
    const statusQuizType = quizMode === 'typing' ? 'typing' : 'multiple_choice';

    // One session init per page mount, shared by every loader below. The init
    // endpoint mints and Set-Cookies the userId for new users; firing it from
    // three places concurrently used to risk three different UUIDs racing to
    // set that cookie. A single shared promise removes both the race and the
    // extra round-trips, and still guarantees init resolves before any fetch
    // that relies on the cookie.
    const sessionInitRef = useRef<Promise<void> | null>(null);
    const ensureSessionInit = useCallback(() => {
        if (!sessionInitRef.current) {
            sessionInitRef.current = (async () => {
                const res = await fetch('/api/session/init', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!res.ok) {
                    throw new Error('Failed to initialize session');
                }
            })().catch((err) => {
                // Never cache a failed init — let a later caller retry it.
                sessionInitRef.current = null;
                throw err;
            });
        }
        return sessionInitRef.current;
    }, []);

    // Load all words at once
    useEffect(() => {
        async function loadAllWords() {
            try {
                console.log('=== LOADING ALL WORDS (TAB: ALL) ===');
                
                const { section, step } = router.query;
                
                // Initialize the session once (shared across every loader here).
                await ensureSessionInit();

                console.log('Fetching all words from Supabase...');
                // Per-word progress is per quiz type: show the dimension the user
                // is currently practicing (typing vs multiple_choice).
                const quizType = (typeof window !== 'undefined' && window.localStorage.getItem('quizMode') === 'typing')
                    ? 'typing'
                    : 'multiple_choice';
                const { cards } = await fetchAllCards(
                    1, // page
                    1000, // large page size to get all words
                    section as string,
                    step as string,
                    quizType
                );
                
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
                    marked_as: card.marked_as,
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
    }, [router.isReady, router.query, ensureSessionInit]);

    // Load settings from database on mount
    useEffect(() => {
        async function loadSettings() {
            try {
                console.log('Loading settings from database...');
                await ensureSessionInit();

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
                // Set default settings on error
                setSettings(DEFAULT_SETTINGS);
                settingsLoadedRef.current = true;
            }
        }
        loadSettings();
    }, [ensureSessionInit])

    // Define loadCards function that can be reused
    const loadCards = useCallback(async () => {
            try {
            if (!settings) {
                console.log('⏳ Waiting for settings to load...');
                return;
            }

            const { section, step } = router.query;
            
            console.log('\n=== LOADING SESSION WORDS (TAB: SESSION) ===');
            
            // Initialize the session once (shared across every loader here).
            await ensureSessionInit();

            console.log('Current settings:', settings);
            setIsLoading(true)
            setError(null)
            
            // Select the same words the quiz will run: progress-ordered for this
            // quiz type (typing vs multiple-choice select independently). The old
            // code read a `lastWordId` field that last-word no longer returns, so
            // it always started from the top and disagreed with the quiz.
            const quizType = (typeof window !== 'undefined' && window.localStorage.getItem('quizMode') === 'typing')
                ? 'typing' : 'multiple_choice';
            console.log('Fetching next session words...');
            const progressResponse = await fetch(`/api/progress/last-word?section=${section}&step=${step}&sessionSize=${settings.sessionSize}&quizType=${quizType}`, {
                credentials: 'include'
            });
            if (!progressResponse.ok) {
                throw new Error('Failed to get next session words');
            }
            const { wordIds } = await progressResponse.json();
            console.log('Next word IDs:', wordIds);

            console.log('Calling fetchSupabaseSessionCards...');
            const { sessionWords, nextWord } = await fetchSupabaseSessionCards(
                settings.sessionSize,
                section as string,
                step as string,
                undefined,
                wordIds,
                2,
                quizType
            );
            
            // Transform Supabase SessionWords to our SessionWords
            const transformedWords = sessionWords.map((word: SupabaseSessionWord) => ({
                id: word.id,
                word: word.japanese_word,
                meaning: word.english,
                progress: word.progress,
                isReview: word.isReview,
                totalMisses: word.totalMisses,
                correctAnswers: word.correctAnswers,
                timeToAnswer: word.timeToAnswer,
                progress_status: word.progress_status,
                marked_as: word.marked_as,
            }));
            
            console.log('Session words after transformation:', transformedWords.map(w => ({
                id: w.id,
                progress: w.progress,
                isReview: w.isReview,
                totalMisses: w.totalMisses,
                correctAnswers: w.correctAnswers
            })));
            
            console.log('Session words received:', {
                requestedSize: settings.sessionSize,
                receivedWords: transformedWords.length,
                words: transformedWords
            });
            
            // Store the next word
            nextWordRef.current = nextWord;
            console.log('Next session will start with word ID:', nextWordRef.current?.id);
            
            if (!transformedWords || transformedWords.length === 0) {
                throw new Error('No words received from server');
            }

            setWords(transformedWords)
            console.log('✅ Session words loaded successfully');
                setError(null)
            } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load session words';
            console.error('❌ Error:', errorMessage);
            setError(errorMessage)
            } finally {
                setIsLoading(false)
            }
    }, [settings, router.query, ensureSessionInit]);

    // Use loadCards in the effect
    useEffect(() => {
        if (router.isReady) {
            loadCards()
        }
    }, [router.isReady, loadCards])

    const startQuiz = useCallback(() => {
        setActiveTab("session"); // Reset to session tab
        router.push({
            pathname: '/quizz',
            query: router.query
        });
    }, [router]);

    // Add spacebar shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !showSettings) {
                e.preventDefault() // Prevent page scrolling
                startQuiz()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showSettings])

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

    const renderContent = () => {
        if (activeTab === "all") {
            if (isLoadingAllWords) {
                return (
                    <LoadingState text="Loading words" subText="Fetching the full word list" />
                );
            }

            return (
                <>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-8">Words List</h1>
                    <div>
                        <div className="bg-[#1F1F1F] border border-[#4F4F4F] rounded-lg p-3 sm:p-4">
                            <div className="flex flex-col gap-4 sm:gap-6">
                                <div>
                                    <h2 className="text-white text-base sm:text-lg font-medium mb-1 sm:mb-2">Complete Word List</h2>
                                    <p className="text-[#A1A1A1] text-xs sm:text-sm">Browse through all available words.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                    <TabNavigation
                                        activeTab={activeTab}
                                        onTabChange={setActiveTab}
                                    />
                                    {showLangPills && (
                                        <TypingLangPills value={typingLang} onChange={handleTypingLangChange} variant={langPillVariant} />
                                    )}
                                    <button
                                        onClick={startQuiz}
                                        className="bg-[#FF0054] hover:bg-[#e0004a] text-white font-medium px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md transition-colors text-sm sm:text-base"
                                    >
                                        Start Quiz
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-6">
                            <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                {allWords.map((word) => (
                                    <WordCard
                                        key={word.id}
                                        word={word}
                                        statusContent="words"
                                        quizType={statusQuizType}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            );
        }

        if (isLoading) {
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
                        className="bg-[#FF0054] text-white px-4 py-2 rounded hover:bg-[#e0004a] transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )
        }

        if (!words || words.length === 0) {
            return (
                <LoadingState text="Preparing your words" subText="Setting up this study session for you." />
            )
        }

        return (
            <>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-8">Study Session</h1>

                <div>
                    <div className="bg-[#1F1F1F] border border-[#4F4F4F] rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col gap-4 sm:gap-6">
                            <div>
                                <h2 className="text-white text-base sm:text-lg font-medium mb-1 sm:mb-2">Items in this session</h2>
                                <p className="text-[#A1A1A1] text-xs sm:text-sm">These are the items you&apos;ll practice in this session.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <TabNavigation
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                />
                                {showLangPills && (
                                    <TypingLangPills value={typingLang} onChange={handleTypingLangChange} variant={langPillVariant} />
                                )}
                                <button
                                    onClick={startQuiz}
                                    className="bg-[#FF0054] hover:bg-[#e0004a] text-white font-medium px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md transition-colors text-sm sm:text-base"
                                >
                                    Start Quiz
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 sm:mt-6">
                        {activeTab === "session" ? (
                            <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                {words.map((word) => (
                                    <WordCard
                                        key={word.id}
                                        word={word}
                                        statusContent="words"
                                        quizType={statusQuizType}
                                    />
                                ))}
                            </div>
                        ) : activeTab === "speed" ? (
                            <DifficultyGroups words={words} />
                        ) : (
                            <SuccessRateGroups words={words} />
                        )}
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
