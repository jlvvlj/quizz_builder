"use client"

import { useRouter } from 'next/router'
import LoadingState from '@/components/LoadingState'
import { useState, useEffect, useCallback } from 'react'
import type { SessionWord as SupabaseSessionWord } from '../utils/supabase-client'
import { fetchSupabaseSessionCards } from '../utils/supabase-client'
import DifficultyGroups from '@/components/DifficultyGroups'
import SuccessRateGroups from '@/components/SuccessRateGroups'
import { useSettingsModal } from '@/components/layout/SettingsContext'
import TabNavigation from '@/components/TabNavigation'
import WordCard from '../components/WordCard'
import CircularProgress from '../components/CircularProgress'

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

// Kanji session results page - works with frequencyStart/frequencyEnd instead of section/step
export default function KanjiSessionResults() {
    console.log('KanjiSessionResults component mounted');

    const router = useRouter()
    const [words, setWords] = useState<SessionWord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("session")
    const { isSettingsOpen: showSettings, onSettingsSaved } = useSettingsModal()
    const [settings, setSettings] = useState<{ sessionSize?: number } | null>(null)
    const [progress, setProgress] = useState<number>(0);

    // Get props from URL query
    const title = router.query.title as string || "Kanji Session Results";
    const subtitle = router.query.subtitle as string || "Words in this session";
    const description = router.query.description as string || "These are the words you practiced in this kanji session.";
    const practicedWordIds = router.query.practicedWordIds as string;
    const frequencyStart = router.query.frequencyStart as string;
    const frequencyEnd = router.query.frequencyEnd as string;
    const showResultsButton = router.query.showResultsButton === 'true';

    // Single kanji mode parameters
    const mode = router.query.mode as string;
    const isSingleKanjiMode = mode === 'single_kanji';
    const kanjiChar = router.query.kanjiChar as string;
    const kanjiId = router.query.kanjiId as string;

    // Display title based on mode
    const displayTitle = isSingleKanjiMode
        ? `${kanjiChar} Results`
        : `Kanji ${frequencyEnd} Results`;

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
            } catch (error) {
                console.error('Failed to load settings:', error);
                setSettings(DEFAULT_SETTINGS);
            }
        }
        loadSettings();
    }, [])

    // Load practiced words by ID
    const loadCards = useCallback(async () => {
        const loadId = Math.random().toString(36).substring(7);
        console.log(`[${loadId}] loadCards START for kanji session results`);

        try {
            if (!practicedWordIds) {
                console.log(`[${loadId}] No practicedWordIds, skipping load`);
                setIsLoading(false);
                return;
            }

            // Initialize session first
            console.log(`[${loadId}] Initializing session...`);
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

            setIsLoading(true);
            setError(null);

            // Fetch practiced words directly by ID
            console.log(`[${loadId}] Fetching practiced words:`, practicedWordIds);
            const wordIds = practicedWordIds.split(',').map(id => parseInt(id));

            // Use fetchSupabaseSessionCards with wordIds to fetch directly by ID
            // Pass dummy section/step since they're not used when wordIds is provided
            const result = await fetchSupabaseSessionCards(
                wordIds.length,
                '1',  // dummy section - not used when wordIds is provided
                '1',  // dummy step - not used when wordIds is provided
                undefined,
                wordIds
            );

            // Transform and set words
            const transformedWords = result.sessionWords.map((word: SupabaseSessionWord) => ({
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

            // Calculate average progress from the words
            if (transformedWords.length > 0) {
                const avgProgress = Math.round(
                    transformedWords.reduce((sum: number, w: SessionWord) => sum + (w.progress || 0), 0) / transformedWords.length
                );
                setProgress(avgProgress);
            }

        } catch (err) {
            console.error(`[${loadId}] Error:`, err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load session words';
            setError(errorMessage);
        } finally {
            console.log(`[${loadId}] Finished - setting isLoading to false`);
            setIsLoading(false);
        }
    }, [practicedWordIds]);

    // Load cards when router is ready and we have practicedWordIds
    useEffect(() => {
        if (router.isReady && practicedWordIds) {
            loadCards();
        }
    }, [router.isReady, practicedWordIds, loadCards]);

    // Navigate to next session (fetch new words for same kanji or frequency range)
    const startNextSession = useCallback(async () => {
        try {
            // Single kanji mode: fetch words for the specific kanji
            if (isSingleKanjiMode && kanjiChar) {
                const response = await fetch(`/api/kanji/get-words-by-kanji?kanji=${encodeURIComponent(kanjiChar)}`);
                const data = await response.json();

                if (!response.ok) {
                    console.error('API error:', data.error);
                    throw new Error(data.error || 'Failed to fetch words');
                }

                const { words } = data;
                console.log('Fetched words for next session:', words?.length || 0);

                if (!words || words.length === 0) {
                    alert('No words available for this kanji.');
                    return;
                }

                // Navigate to kanji session page
                const params = new URLSearchParams({
                    kanjiChar,
                    kanjiId,
                    title: `${kanjiChar} Words`,
                    subtitle: `Words containing ${kanjiChar}`,
                    description: `Practice words that use the kanji ${kanjiChar}`,
                    mode: 'single_kanji'
                });
                router.push(`/kanji_session?${params.toString()}`);
                return;
            }

            // Frequency mode: fetch words by frequency range
            if (!frequencyStart || !frequencyEnd) {
                console.error('Missing frequency range parameters');
                return;
            }

            const response = await fetch(`/api/kanji/get-words-by-frequency?frequencyStart=${frequencyStart}&frequencyEnd=${frequencyEnd}`);
            const data = await response.json();

            if (!response.ok) {
                console.error('API error:', data.error);
                throw new Error(data.error || 'Failed to fetch words');
            }

            const { words } = data;
            console.log('Fetched words for next session:', words?.length || 0);

            if (!words || words.length === 0) {
                alert('No words available for this kanji section.');
                return;
            }

            // Navigate to kanji session page
            const params = new URLSearchParams({
                frequencyStart,
                frequencyEnd,
                title: `Kanji ${frequencyEnd}`,
                subtitle: 'Most frequently used kanji',
                description: `Kanji ranked ${frequencyStart}-${frequencyEnd} by usage frequency.`,
                mode: 'frequency'
            });
            router.push(`/kanji_session?${params.toString()}`);
        } catch (error) {
            console.error('Error starting next session:', error);
            alert('Failed to start next session. Please try again.');
        }
    }, [frequencyStart, frequencyEnd, isSingleKanjiMode, kanjiChar, kanjiId, router]);

    // Start a quiz with the same practiced words
    const startQuiz = useCallback(() => {
        if (!practicedWordIds) {
            console.error('Missing practicedWordIds for quiz');
            return;
        }

        const params = new URLSearchParams({
            practicedWordIds,
            mode: isSingleKanjiMode ? 'single_kanji' : 'frequency'
        });

        // Add mode-specific params
        if (isSingleKanjiMode) {
            params.set('kanjiChar', kanjiChar);
            params.set('kanjiId', kanjiId);
            params.set('title', `${kanjiChar} Words`);
        } else {
            params.set('frequencyStart', frequencyStart);
            params.set('frequencyEnd', frequencyEnd);
            params.set('title', `Kanji ${frequencyEnd}`);
        }

        router.push(`/bykanjiquizz?${params.toString()}`);
    }, [practicedWordIds, frequencyStart, frequencyEnd, isSingleKanjiMode, kanjiChar, kanjiId, router]);

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

    const goToKanjiSections = () => {
        router.push('/kanji_sections_frequency');
    }

    const goToHome = () => {
        router.push('/');
    }

    const renderContent = () => {
        if (isLoading) {
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

        if (!words || words.length === 0) {
            return (
                <LoadingState text="Preparing your words" subText="Gathering this session's results." />
            )
        }

        return (
            <>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-8">
                    {displayTitle}
                </h1>

                <div className="bg-[#262626] border border-[#4F4F4F] rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-lg">
                    <div className="bg-[#1F1F1F] border border-[#4F4F4F] rounded-lg p-4">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-white text-lg font-medium mb-2">
                                        {subtitle}
                                    </h2>
                                    <p className="text-[#A1A1A1] text-sm">
                                        {description}
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
                                    hideTabs={['all']}
                                />
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={showResultsButton ? startNextSession : startQuiz}
                                        className="bg-[#FF0054] hover:bg-[#e0004a] text-white font-medium px-6 py-3 rounded-lg shadow-md transition-colors flex-shrink-0"
                                    >
                                        {showResultsButton ? 'Go to Next Session' : 'Start Quiz'}
                                    </button>
                                    <button
                                        onClick={goToKanjiSections}
                                        className="bg-[#2F2F2F] border border-[#4F4F4F] hover:bg-[#363636] text-white font-medium px-6 py-3 rounded-lg shadow-md transition-colors flex-shrink-0"
                                    >
                                        Back to Kanji Sections
                                    </button>
                                    <button
                                        onClick={goToHome}
                                        className="bg-[#2F2F2F] border border-[#4F4F4F] hover:bg-[#363636] text-white font-medium px-6 py-3 rounded-lg shadow-md transition-colors flex-shrink-0"
                                    >
                                        Home
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        {activeTab === "session" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {words.map((word) => (
                                    <WordCard key={word.id} word={word} />
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

    // Handle settings change
    const handleSettingsChange = useCallback(() => {
        console.log('Settings changed, reloading...');
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
        })
        .catch(error => {
            console.error('Failed to load new settings:', error);
        });
    }, []);

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
