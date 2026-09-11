"use client"

import { useRouter } from 'next/router'
import LoadingState from '@/components/LoadingState'
import { useState, useEffect, useRef } from 'react'
import type { SessionWord } from '../utils/cards'
import { fetchSessionCards } from '../utils/cards'
import WordAnalysis from '@/components/WordAnalysis'
import { useSettingsModal } from '@/components/layout/SettingsContext'
import DifficultyGroups from '@/components/DifficultyGroups'
import SuccessRateGroups from '@/components/SuccessRateGroups'
import TabNavigation from '@/components/TabNavigation'
import WordCard from '../components/WordCard'

export default function SessionResults() {
    const router = useRouter()
    const [words, setWords] = useState<SessionWord[]>([])
    const [allWords, setAllWords] = useState<SessionWord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingAllWords, setIsLoadingAllWords] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("session")
    const { isSettingsOpen: showSettings } = useSettingsModal()
    const [settings, setSettings] = useState({ sessionSize: 7 })
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const pageSize = 50  // Show 50 words per page
    const observerTarget = useRef<HTMLDivElement>(null)

    // Load settings from database on mount
    useEffect(() => {
        async function loadSettings() {
            try {
                const response = await fetch('/api/settings/get', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error('Failed to load settings');
                }
                const data = await response.json();
                setSettings(data);
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
        loadSettings();
    }, [])

    // Load all words with infinite scrolling
    useEffect(() => {
        async function loadAllWords() {
            try {
                setIsLoadingAllWords(currentPage === 1);
                setIsLoadingMore(currentPage > 1);
                
                const response = await fetch(`/api/flashcards?page=${currentPage}&pageSize=${pageSize}`);
                if (!response.ok) {
                    throw new Error('Failed to load all words');
                }
                const data = await response.json();
                
                // Convert to SessionWord format
                const formattedWords: SessionWord[] = data.cards.map((card: any) => ({
                    id: card.id,
                    word: card.japanese.word,
                    meaning: card.english,
                    progress: 0,
                    isReview: false,
                    totalMisses: 0,
                    correctAnswers: 0
                }));

                // Fetch progress for these words
                const progressResponse = await fetch(
                    `/api/progress/get-batch?cardIds=${formattedWords.map(w => w.id).join(',')}`,
                    { credentials: 'include' }
                );
                
                if (!progressResponse.ok) {
                    throw new Error('Failed to fetch progress data');
                }

                const progressData = await progressResponse.json();
                
                // Update words with progress data
                const updatedWords = formattedWords.map(word => {
                    const progress = progressData[word.id];
                    if (progress) {
                        return {
                            ...word,
                            progress: progress.progress || 0,
                            totalMisses: progress.totalMisses || 0,
                            correctAnswers: progress.correctAnswers || 0,
                            timeToAnswer: progress.timeToAnswer || 0,
                            isReview: progress.totalMisses > 0
                        };
                    }
                    return word;
                });

                setAllWords(prev => currentPage === 1 ? updatedWords : [...prev, ...updatedWords]);
                setHasMore(data.cards.length === pageSize);
            } catch (error) {
                console.error('Failed to load all words:', error);
            } finally {
                setIsLoadingAllWords(false);
                setIsLoadingMore(false);
            }
        }
        loadAllWords();
    }, [currentPage, pageSize]);

    // Intersection Observer for infinite scrolling
    useEffect(() => {
        if (!observerTarget.current || !hasMore || isLoadingMore || activeTab !== "all") return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    setCurrentPage(prev => prev + 1);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, activeTab]);

    useEffect(() => {
        async function loadSessionResults() {
            if (!router.isReady || !settings) return;

            try {
                setIsLoading(true);
                setError(null);

                // Get the last word ID from progress to determine where to start
                const progressResponse = await fetch('/api/progress/last-word', {
                    credentials: 'include'
                });
                if (!progressResponse.ok) {
                    throw new Error('Failed to get last word progress');
                }
                const { lastWordId = 0 } = await progressResponse.json();
                const startId = lastWordId + 1 - settings.sessionSize; // Go back one session
                
                console.log('Loading results with startId:', startId);
                console.log('Using session size:', settings.sessionSize);
                
                // Fetch session words with their progress
                const { sessionWords } = await fetchSessionCards(settings.sessionSize, startId);
                
                if (!sessionWords || sessionWords.length === 0) {
                    throw new Error('No words found for this session');
                }

                // Fetch progress for these words
                const progressResponse2 = await fetch(
                    `/api/progress/get-batch?cardIds=${sessionWords.map(w => w.id).join(',')}`,
                    { credentials: 'include' }
                );
                
                if (!progressResponse2.ok) {
                    throw new Error('Failed to fetch progress data');
                }

                const progressData = await progressResponse2.json();
                
                // Update session words with progress data
                const updatedWords = sessionWords.map(word => {
                    const progress = progressData[word.id];
                    if (progress) {
                        return {
                            ...word,
                            progress: progress.progress || 0,
                            totalMisses: progress.totalMisses || 0,
                            correctAnswers: progress.correctAnswers || 0,
                            timeToAnswer: progress.timeToAnswer || 0,
                            isReview: progress.totalMisses > 0
                        };
                    }
                    return word;
                });

                setWords(updatedWords);
            } catch (err) {
                console.error('Failed to load session results:', err);
                setError(err instanceof Error ? err.message : 'Failed to load session results');
            } finally {
                setIsLoading(false);
            }
        }

        loadSessionResults();
    }, [router.isReady, settings, router.query.session]);

    const repeatSession = () => {
        // Keep the same session number
        const session = parseInt(router.query.session as string) || 1
        router.push(`/quizz?session=${session}`)
    }

    const startNextSession = async () => {
        try {
            // Call the increment endpoint
            const response = await fetch('/api/session/increment', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to increment session');
            }
            
            const data = await response.json();
            router.push(`/session_preview?session=${data.currentSession}`);
        } catch (error) {
            console.error('Failed to increment session:', error);
        }
    }

    // Add spacebar shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !showSettings) {
                e.preventDefault() // Prevent page scrolling
                startNextSession()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showSettings])

    const renderContent = () => {
        if (activeTab === "all") {
            if (isLoadingAllWords && currentPage === 1) {
                return (
                    <LoadingState text="Loading words" subText="Fetching the full word list" />
                );
            }

            return (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {allWords.map((word) => (
                            <WordCard key={word.id} word={word} />
                        ))}
                    </div>
                    {/* Loading indicator and observer target */}
                    <div ref={observerTarget} className="mt-8 text-center">
                        {isLoadingMore && (
                            <LoadingState variant="inline" text="Loading more words" />
                        )}
                        {!hasMore && allWords.length > 0 && (
                            <div className="text-white text-lg">No more words to load</div>
                        )}
                    </div>
                </>
            );
        }

        if (isLoading) {
            return (
                <LoadingState text="Loading your results" />
            )
        }

        if (error) {
            return (
                <div className="flex items-center justify-center flex-col gap-4">
                    <div className="text-white text-2xl">Error loading results</div>
                    <div className="text-red-200">{error}</div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#FF0054] text-white px-4 py-2 rounded hover:bg-[#e0004a] transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-[#2F2F2F] border border-[#4F4F4F] text-white px-4 py-2 rounded hover:bg-[#363636] transition-colors"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            )
        }

        if (words.length === 0) {
            return (
                <div className="flex items-center justify-center flex-col gap-4">
                    <div className="text-white text-2xl">No words found</div>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-[#FF0054] text-white px-4 py-2 rounded hover:bg-[#e0004a] transition-colors"
                    >
                        Start New Session
                    </button>
                </div>
            )
        }

        if (activeTab === "speed") {
            return <DifficultyGroups words={words} />
        }

        if (activeTab === "success") {
            return <SuccessRateGroups words={words} />
        }

        // Default session tab content
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {words.map((word) => (
                    <WordCard key={word.id} word={word} />
                ))}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#181818] flex flex-col">
            <div className="flex-1 overflow-auto">
                <div className="max-w-6xl mx-auto p-3 sm:p-6 md:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-8">Session Results</h1>

                    <div className="bg-[#262626] border border-[#4F4F4F] rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-lg">
                        <div className="bg-[#1F1F1F] border border-[#4F4F4F] rounded-lg p-4">
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h2 className="text-white text-lg font-medium mb-2">Session Summary</h2>
                                    <p className="text-[#A1A1A1] text-sm">Here&apos;s how you did with these words.</p>
                                </div>
                                <TabNavigation
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                    rightContent={
                                        activeTab !== "all" && (
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={repeatSession}
                                                    className="bg-[#2F2F2F] border border-[#4F4F4F] hover:bg-[#363636] text-white font-medium px-6 py-3 rounded-lg shadow-md transition-colors flex-shrink-0"
                                                >
                                                    Repeat Session
                                                </button>
                                                <button
                                                    onClick={startNextSession}
                                                    className="bg-[#FF0054] hover:bg-[#e0004a] text-white font-medium px-6 py-3 rounded-lg shadow-md transition-colors flex-shrink-0"
                                                >
                                                    Next Session
                                                </button>
                                            </div>
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

