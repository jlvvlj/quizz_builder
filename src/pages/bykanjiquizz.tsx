"use client"

import React from 'react'
import LoadingState from '@/components/LoadingState'
import { useState, useEffect, useCallback, useRef } from "react"
import { Pause, Play, Settings, X } from "lucide-react"
import { useRouter } from 'next/router'
import { fetchSupabaseSessionCards } from '@/utils/supabase-client'
import { audioPlayer, correctVariantForCardIndex } from "@/utils/audio"
import { playAudio, preloadAudio, resumeAudioContext } from "@/utils/audioCache"
import { getAudioUrl } from "@/utils/audioUrl"
import { FuriganaText } from '@/utils/furigana'
import SettingsModal from './settings_modal'
import type { SessionWord as SupabaseSessionWord } from '@/utils/supabase-client'

// Add type declaration at the top of the file
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext
    }
}

interface WordDifficulty {
    [key: number]: {
        progress: number;
        timeToAnswer: number;
        totalMisses: number;
        correctAnswers: number;
    };
}

interface QuizCard {
    id: number;
    question: string;
    reading?: string;
    correctAnswer: string;
    wrongAnswers: string[];
    wrongAnswer1: string;
    wrongAnswer2: string;
    audioPath?: string;
    phrase?: {
        text: string;
        audioPath?: string;
    };
    isReview: boolean;
    attemptKey?: number;
    progress?: number;
    timeToAnswer?: number;
    totalMisses?: number;
    correctAnswers?: number;
}

interface AppSettings {
    showPhrase: boolean;
    audioAutoPlay: boolean;
    sessionSize?: number;
    quizDirection?: 'forward' | 'reverse';
    showFurigana?: boolean;
    timerDuration: number;
    answerChoices: number;
}

// Kanji usage mode quiz - works with frequencyStart/frequencyEnd instead of section/step
export default function ByKanjiQuizz() {
    const router = useRouter()
    const [flashcards, setFlashcards] = useState<QuizCard[]>([])
    const [originalLength, setOriginalLength] = useState(0)
    const [progress, setProgress] = useState(0)
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [timeLeft, setTimeLeft] = useState(3)
    const [isTimerRunning, setIsTimerRunning] = useState(true)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [answeredCards, setAnsweredCards] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showSettings, setShowSettings] = useState(false)
    const [showingPhrase, setShowingPhrase] = useState(false)
    const [appSettings, setAppSettings] = useState<AppSettings>({
        showPhrase: false,
        audioAutoPlay: true,
        timerDuration: 3,
        answerChoices: 3
    })
    const [wordAudio, setWordAudio] = useState<AudioBufferSourceNode | null>(null)
    const [phraseAudio, setPhraseAudio] = useState<AudioBufferSourceNode | null>(null)
    const [isPaused, setIsPaused] = useState(false)
    const quizStartedRef = useRef(false)
    const quizCompletedRef = useRef(false)

    // Add state for tracking word difficulties
    const [wordDifficulties, setWordDifficulties] = useState<WordDifficulty>({})

    // Load flashcards from API
    useEffect(() => {
        const loadFlashcards = async () => {
            try {
                setIsLoading(true)

                const { practicedWordIds, frequencyStart, frequencyEnd, title } = router.query;

                console.log('Loading kanji quiz with params:', { practicedWordIds, frequencyStart, frequencyEnd, title });

                if (!practicedWordIds || typeof practicedWordIds !== 'string') {
                    throw new Error('Missing practicedWordIds parameter for kanji quiz');
                }

                const wordIds = practicedWordIds.split(',').map((id: string) => parseInt(id));
                console.log('Fetching words by ID:', wordIds);

                // Use fetchSupabaseSessionCards with wordIds to fetch directly by ID
                // Pass dummy section/step since they're not used when wordIds is provided
                const numWrong = Math.max(1, appSettings.answerChoices - 1);
                const result = await fetchSupabaseSessionCards(
                    wordIds.length,
                    '1',  // dummy section - not used when wordIds is provided
                    '1',  // dummy step - not used when wordIds is provided
                    undefined,
                    wordIds,
                    numWrong
                );

                const sessionWords = result.sessionWords;
                console.log('Fetched session words:', sessionWords.length);

                // Transform cards to quiz cards
                const isReverse = appSettings.quizDirection === 'reverse';
                const quizCards = sessionWords.map((card: SupabaseSessionWord & { word_audio_path?: string | null; example_sentence_japanese?: string | null; sentence_audio_path?: string | null; japanese_reading?: string | null }) => {
                    // Pick random cards for wrong answers that are not the current card
                    const wrongCards: SupabaseSessionWord[] = [];
                    const usedIndices = new Set<number>();
                    const targetWrong = Math.min(numWrong, sessionWords.length - 1);

                    while (wrongCards.length < targetWrong) {
                        const randomIndex = Math.floor(Math.random() * sessionWords.length);
                        if (!usedIndices.has(randomIndex) && sessionWords[randomIndex].id !== card.id) {
                            wrongCards.push(sessionWords[randomIndex]);
                            usedIndices.add(randomIndex);
                        }
                    }

                    const wrongAnswers = wrongCards
                        .map(w => isReverse ? w.japanese_word : w.english)
                        .filter((s): s is string => !!s);

                    // Swap question/answer based on quiz direction
                    return {
                        id: card.id,
                        question: isReverse ? card.english : card.japanese_word,
                        reading: isReverse ? undefined : card.japanese_reading || undefined,
                        correctAnswer: isReverse ? card.japanese_word : card.english,
                        wrongAnswers,
                        wrongAnswer1: wrongAnswers[0],
                        wrongAnswer2: wrongAnswers[1],
                        audioPath: getAudioUrl(card.word_audio_path),
                        phrase: card.example_sentence_japanese ? {
                            text: card.example_sentence_japanese,
                            audioPath: getAudioUrl(card.sentence_audio_path)
                        } : undefined,
                        isReview: card.isReview || false,
                        progress: card.progress || 0,
                        timeToAnswer: card.timeToAnswer || 0,
                        totalMisses: card.totalMisses || 0,
                        correctAnswers: card.correctAnswers || 0
                    };
                });

                // Initialize wordDifficulties with the progress data from the database
                const initialWordDifficulties = sessionWords.reduce((acc: WordDifficulty, word: SupabaseSessionWord) => {
                    acc[word.id] = {
                        progress: word.progress || 0,
                        timeToAnswer: word.timeToAnswer || 0,
                        totalMisses: word.totalMisses || 0,
                        correctAnswers: word.correctAnswers || 0
                    };
                    return acc;
                }, {} as WordDifficulty);

                setWordDifficulties(initialWordDifficulties);
                setFlashcards(quizCards);
                setOriginalLength(quizCards.length);
                setError(null);
            } catch (error) {
                console.error('Failed to load flashcards:', error);
                setError('Failed to load flashcards. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        // Only load flashcards when router is ready and we have settings
        if (router.isReady && appSettings.sessionSize && appSettings.sessionSize > 0) {
            loadFlashcards();
        }
    }, [router.isReady, router.query, appSettings.sessionSize, appSettings.quizDirection, appSettings.answerChoices]);

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
                console.log('Loaded settings from database:', data);
                // Set all settings from database, using defaults only if values are missing
                setAppSettings({
                    showPhrase: data.showPhrase ?? false,
                    audioAutoPlay: data.audioAutoPlay ?? true,
                    sessionSize: data.sessionSize,
                    quizDirection: data.quizDirection ?? 'forward',
                    showFurigana: data.showFurigana ?? false,
                    timerDuration: data.timerDuration ?? 3,
                    answerChoices: data.answerChoices ?? 3
                });
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
        loadSettings();
    }, [])

    const currentCard = flashcards[currentCardIndex]

    // Pre-decode every card's audio (word + phrase) so playback is instant.
    useEffect(() => {
        if (flashcards.length === 0) return;
        flashcards.forEach(card => {
            preloadAudio(card.audioPath);
            preloadAudio(card.phrase?.audioPath);
        });
    }, [flashcards]);

    // Play the quiz-start sound once, the first time the session becomes
    // interactive (loading done + at least one card available).
    useEffect(() => {
        if (isLoading) return;
        if (flashcards.length === 0) return;
        if (quizStartedRef.current) return;
        quizStartedRef.current = true;
        resumeAudioContext();
        audioPlayer.play('quizStart');
    }, [isLoading, flashcards.length]);

    // Play audio when new card is shown (only in forward mode - Japanese word displayed)
    useEffect(() => {
        if (appSettings.quizDirection === 'reverse') return;
        if (isPaused) return;
        if (!currentCard?.audioPath) return;
        if (!appSettings.audioAutoPlay) return;

        resumeAudioContext();
        const { handlePromise, cancel } = playAudio(currentCard.audioPath);
        handlePromise.then(handle => {
            if (handle) setWordAudio(handle.source);
        });

        const next = flashcards[currentCardIndex + 1];
        if (next) {
            preloadAudio(next.audioPath);
            preloadAudio(next.phrase?.audioPath);
        }

        return () => {
            cancel();
            setWordAudio(null);
        };
    }, [currentCardIndex, currentCard?.id, currentCard?.audioPath, appSettings.quizDirection, appSettings.audioAutoPlay, isPaused, flashcards]);

    // Randomize the order of answers
    const [answers, setAnswers] = useState<string[]>([])

    // Shuffle answers when card changes
    useEffect(() => {
        if (!currentCard) return;

        const wrong = currentCard.wrongAnswers && currentCard.wrongAnswers.length > 0
            ? currentCard.wrongAnswers
            : [currentCard.wrongAnswer1, currentCard.wrongAnswer2].filter((s): s is string => !!s);
        const answerArray = [currentCard.correctAnswer, ...wrong];
        for (let i = answerArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [answerArray[i], answerArray[j]] = [answerArray[j], answerArray[i]];
        }
        setAnswers(answerArray);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setTimeLeft(appSettings.timerDuration);
        setIsTimerRunning(true);
    }, [currentCardIndex, currentCard, appSettings.timerDuration]);

    // Timer functionality
    useEffect(() => {
        if (!isTimerRunning || !currentCard || isPaused) return;

        const timer = setInterval(() => {
            setTimeLeft((prev: number) => {
                if (prev <= 0) {
                    clearInterval(timer)
                    handleTimeout()
                    return 0
                }
                return prev - 0.1
            })
        }, 100)

        return () => clearInterval(timer)
    }, [isTimerRunning, currentCard, isPaused])

    // Move to next card
    const moveToNextCard = useCallback((correct: boolean) => {
        // Clean up any playing audio
        if (wordAudio) {
            (wordAudio as AudioBufferSourceNode).stop();
            setWordAudio(null);
        }
        if (phraseAudio) {
            (phraseAudio as AudioBufferSourceNode).stop();
            setPhraseAudio(null);
        }

        let newProgress = progress;
        if (correct) {
            const newAnsweredCards = answeredCards + 1
            setAnsweredCards(newAnsweredCards)

            // Calculate new progress using original length
            newProgress = Math.min(Math.round((newAnsweredCards * 100) / originalLength), 100)
            setProgress(newProgress)
        } else {
            // Add current card to the end of flashcards with a new attempt key
            setFlashcards(prev => [...prev, { ...currentCard, attemptKey: Date.now() }])
        }

        // Move to next card if we haven't reached 100%
        if (newProgress < 100) {
            setCurrentCardIndex(prev => prev + 1)
        }
    }, [answeredCards, originalLength, phraseAudio, wordAudio, progress, currentCard])

    // Handle timeout - move to next card
    const handleTimeout = useCallback(() => {
        setIsTimerRunning(false)
        moveToNextCard(false)
    }, [moveToNextCard])

    // Handle quiz completion
    // TODO: Progress saving is commented out for kanji usage mode for now.
    // Uncomment the original code block below and remove the simplified version to re-enable.
    useEffect(() => {
        if (progress >= 100) {
            if (!quizCompletedRef.current) {
                quizCompletedRef.current = true;
                resumeAudioContext();
                audioPlayer.play('quizComplete');
            }
            console.log('Kanji quiz completed');

            // ===== ORIGINAL CODE WITH PROGRESS SAVING (commented out) =====
            /*
            fetch('/api/progress/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wordDifficulties
                })
            }).then(async () => {
                console.log('Progress saved with status updates');

                // Get kanji mode params from URL query
                const { frequencyStart, frequencyEnd, title } = router.query;
                console.log('Kanji quiz completion - Query parameters:', { frequencyStart, frequencyEnd, title });

                // Get the IDs of the words that were practiced
                const practicedWordIdsString = flashcards.map(card => card.id).join(',');
                console.log('Practiced word IDs:', practicedWordIdsString);

                // Navigate to kanji session results page
                const params = new URLSearchParams({
                    frequencyStart: frequencyStart as string,
                    frequencyEnd: frequencyEnd as string,
                    title: (title as string) || `Kanji ${frequencyEnd} Results`,
                    subtitle: 'Results for this kanji session',
                    description: 'These are the words you practiced in this kanji session.',
                    practicedWordIds: practicedWordIdsString,
                    showResultsButton: 'true',
                    mode: 'frequency'
                });
                console.log('Redirecting to kanji results with params:', params.toString());
                router.push(`/kanji_session_results?${params.toString()}`);
            }).catch(error => {
                console.error('Failed to save progress to DB:', error);
                // Even if saving fails, still redirect to results
                const { frequencyStart, frequencyEnd, title } = router.query;
                const practicedWordIdsString = flashcards.map(card => card.id).join(',');

                const params = new URLSearchParams({
                    frequencyStart: frequencyStart as string,
                    frequencyEnd: frequencyEnd as string,
                    title: (title as string) || `Kanji ${frequencyEnd} Results`,
                    subtitle: 'Results for this kanji session',
                    description: 'These are the words you practiced in this kanji session.',
                    practicedWordIds: practicedWordIdsString,
                    showResultsButton: 'true',
                    mode: 'frequency'
                });
                router.push(`/kanji_session_results?${params.toString()}`);
            });
            */
            // ===== END ORIGINAL CODE =====

            // ===== SIMPLIFIED VERSION (no progress saving) =====
            const { frequencyStart, frequencyEnd, kanjiChar, kanjiId, kanjiChars, kanjiIds, title, mode } = router.query;
            console.log('Kanji quiz completion - Query parameters:', { frequencyStart, frequencyEnd, kanjiChar, kanjiId, kanjiChars, kanjiIds, title, mode });

            const practicedWordIdsString = flashcards.map(card => card.id).join(',');
            console.log('Practiced word IDs:', practicedWordIdsString);

            // Build title based on mode
            let resultTitle = title as string;
            if (!resultTitle) {
                if (mode === 'multi_kanji') {
                    const kanjiList = (kanjiChars as string)?.split(',') || [];
                    resultTitle = kanjiList.length <= 3 ? `${kanjiList.join(', ')} Results` : `${kanjiList.length} Kanji Results`;
                } else if (mode === 'single_kanji') {
                    resultTitle = `${kanjiChar} Results`;
                } else {
                    resultTitle = `Kanji ${frequencyEnd} Results`;
                }
            }

            // Build params based on mode
            const params = new URLSearchParams({
                title: resultTitle,
                subtitle: 'Results for this kanji session',
                description: 'These are the words you practiced in this kanji session.',
                practicedWordIds: practicedWordIdsString,
                showResultsButton: 'true',
                mode: mode as string || 'frequency'
            });

            // Add mode-specific params
            if (mode === 'multi_kanji') {
                params.set('kanjiChars', kanjiChars as string);
                params.set('kanjiIds', kanjiIds as string);
            } else if (mode === 'single_kanji') {
                params.set('kanjiChar', kanjiChar as string);
                params.set('kanjiId', kanjiId as string);
            } else {
                params.set('frequencyStart', frequencyStart as string);
                params.set('frequencyEnd', frequencyEnd as string);
            }

            console.log('Redirecting to kanji results with params:', params.toString());
            router.push(`/kanji_session_results?${params.toString()}`);
            // ===== END SIMPLIFIED VERSION =====
        }
    }, [progress, router, wordDifficulties, flashcards]);

    // Handle answer selection
    const handleAnswerSelect = useCallback(
        (answer: string) => {
            if (selectedAnswer !== null) return // Prevent multiple selections
            if (isPaused) return

            setSelectedAnswer(answer)
            setIsTimerRunning(false)

            const correct = answer === currentCard.correctAnswer
            setIsCorrect(correct)

            // Calculate time taken to answer
            const timeToAnswer = Math.min(appSettings.timerDuration - timeLeft, appSettings.timerDuration)

            // Play the appropriate sound (cycle through 4 correct variants on
            // the first cards of the session for A/B comparison).
            if (correct) {
                audioPlayer.play('correct', correctVariantForCardIndex(currentCardIndex))
            } else {
                audioPlayer.play('incorrect')
            }

            // Always update the difficulty data regardless of correctness
            setWordDifficulties(prev => {
                const prevDifficulty = prev[currentCard.id] || {
                    progress: 0,
                    timeToAnswer: 0,
                    totalMisses: 0,
                    correctAnswers: 0
                };

                console.log('Previous difficulty:', prevDifficulty);
                console.log('Current card ID:', currentCard.id);
                console.log('Is correct:', correct);

                // Calculate average time to answer
                const totalAttempts = prevDifficulty.totalMisses + prevDifficulty.correctAnswers;
                const newTimeToAnswer = totalAttempts === 0
                    ? timeToAnswer
                    : (prevDifficulty.timeToAnswer * totalAttempts + timeToAnswer) / (totalAttempts + 1);

                const newProgress = correct ? Math.min((prevDifficulty.progress || 0) + 10, 100) : (prevDifficulty.progress || 0);
                console.log('New progress:', newProgress);

                return {
                    ...prev,
                    [currentCard.id]: {
                        progress: newProgress,
                        timeToAnswer: newTimeToAnswer,
                        totalMisses: prevDifficulty.totalMisses + (correct ? 0 : 1),
                        correctAnswers: prevDifficulty.correctAnswers + (correct ? 1 : 0)
                    }
                }
            })

            // If show phrase is enabled, show it for a moment before moving to next card
            if (appSettings.showPhrase && currentCard.phrase) {
                setShowingPhrase(true);

                if (currentCard.phrase.audioPath && appSettings.audioAutoPlay) {
                    resumeAudioContext();
                    const { handlePromise } = playAudio(currentCard.phrase.audioPath);
                    handlePromise.then(handle => {
                        if (!handle) {
                            setPhraseAudio(null);
                            setShowingPhrase(false);
                            moveToNextCard(correct);
                            return;
                        }
                        setPhraseAudio(handle.source);
                        handle.source.onended = () => {
                            setPhraseAudio(null);
                            setShowingPhrase(false);
                            moveToNextCard(correct);
                        };
                    });
                } else {
                    // If no audio or auto-play is disabled, just show the phrase for 2 seconds
                    setTimeout(() => {
                        setShowingPhrase(false);
                        moveToNextCard(correct);
                    }, 2000);
                }
            } else {
                // Small delay to show color feedback
                setTimeout(() => {
                    moveToNextCard(correct);
                }, 150);
            }
        },
        [selectedAnswer, isPaused, currentCard, currentCardIndex, timeLeft, appSettings.showPhrase, appSettings.audioAutoPlay, appSettings.timerDuration, moveToNextCard],
    )

    // Handle keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedAnswer !== null) return; // Prevent multiple selections
            if (isPaused) return;

            const letterKeys = ['n', 'e', 'i', 'o', "'"];
            const numKey = parseInt(e.key, 10);
            const letterIdx = letterKeys.indexOf(e.key.toLowerCase());
            if (!isNaN(numKey) && numKey >= 1 && numKey <= answers.length) {
                handleAnswerSelect(answers[numKey - 1]);
            } else if (letterIdx >= 0 && letterIdx < answers.length) {
                handleAnswerSelect(answers[letterIdx]);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [answers, handleAnswerSelect, selectedAnswer, showingPhrase, phraseAudio, isCorrect, moveToNextCard, isPaused]);

    // Get button color based on selection and correctness
    const getButtonColor = (answer: string) => {
        if (selectedAnswer !== answer) return "bg-[#2F2F2F] text-white"
        return isCorrect ? "bg-green-600 text-white" : "bg-red-600 text-white"
    }

    // Clean up audio when component unmounts
    useEffect(() => {
        return () => {
            if (wordAudio) {
                (wordAudio as AudioBufferSourceNode).stop();
            }
            if (phraseAudio) {
                (phraseAudio as AudioBufferSourceNode).stop();
            }
        }
    }, [wordAudio, phraseAudio])

    // Early return for loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
                <LoadingState text="Loading your quiz" />
            </div>
        )
    }

    // Early return for error state
    if (error) {
        return (
            <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
                <div className="text-white text-2xl">{error}</div>
            </div>
        )
    }

    // Early return if no flashcards are loaded
    if (flashcards.length === 0) {
        return (
            <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
                <LoadingState text="Preparing your cards" subText="Getting this quiz ready for you." />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-2 sm:p-4">
            <div className="w-full max-w-5xl p-3 sm:p-6 md:p-8 min-h-[calc(100vh-1rem)] sm:min-h-[64vh] flex flex-col">
                {/* Header with progress bar and controls */}
                <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
                    <div className="flex-1 bg-[#2F2F2F] rounded-full h-8 flex items-center px-3 sm:px-4 min-w-0">
                        <span className="text-white mr-2 text-sm sm:text-base hidden sm:inline">Progress</span>
                        <div className="flex-1 h-2 bg-[#4F4F4F] rounded-full">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-white ml-3 sm:ml-4 text-sm sm:text-base">{progress}%</span>
                    </div>

                    <button
                        className={`${isPaused ? 'bg-[#3A3A3A] ring-1 ring-white/40' : 'bg-[#2F2F2F]'} text-white p-2 rounded-md hover:bg-[#363636] transition-colors border border-[#4F4F4F] shrink-0`}
                        onClick={() => setIsPaused(prev => !prev)}
                        aria-label={isPaused ? 'Resume quiz' : 'Pause quiz'}
                        title={isPaused ? 'Resume quiz' : 'Pause quiz'}
                    >
                        {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                    </button>
                    <button
                        className="bg-[#2F2F2F] text-white p-2 rounded-md hover:bg-[#363636] transition-colors border border-[#4F4F4F] shrink-0"
                        onClick={() => setShowSettings(true)}
                    >
                        <Settings className="h-5 w-5" />
                    </button>
                    <button
                        className="bg-[#2F2F2F] text-white p-2 rounded-md hover:bg-[#363636] transition-colors border border-[#4F4F4F] shrink-0"
                        onClick={() => router.push('/')}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Main content */}
                {currentCard && (
                    <>
                        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-8 md:p-12 flex-1 flex flex-col min-h-0 relative">
                            {isPaused && (
                                <div className="absolute inset-0 z-10 rounded-xl sm:rounded-2xl bg-[#1A1A1A]/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                    <Pause className="h-12 w-12 sm:h-16 sm:w-16 mb-4 text-white/90" />
                                    <div className="text-2xl sm:text-3xl font-semibold">Paused</div>
                                    <button
                                        className="mt-6 px-5 py-2 rounded-md bg-[#2F2F2F] hover:bg-[#363636] border border-[#4F4F4F] flex items-center gap-2"
                                        onClick={() => setIsPaused(false)}
                                    >
                                        <Play className="h-4 w-4" />
                                        Resume
                                    </button>
                                </div>
                            )}
                            <div className="text-center text-white flex-1 flex flex-col">
                                {/* Fixed position header section */}
                                <div className="pt-2 sm:pt-4">
                                    <h2 className="text-base sm:text-2xl mb-4 sm:mb-8 text-[#A1A1A1]">
                                        {!showingPhrase ? 'Do you know this?' : '\u00A0'}
                                    </h2>
                                    <div className="text-5xl sm:text-6xl md:text-7xl font-bold break-words">
                                        {appSettings.showFurigana && currentCard.reading ? (
                                            <ruby>
                                                {currentCard.question}
                                                <rp>(</rp>
                                                <rt className="text-base sm:text-2xl">{currentCard.reading}</rt>
                                                <rp>)</rp>
                                            </ruby>
                                        ) : (
                                            currentCard.question
                                        )}
                                    </div>
                                </div>

                                {/* Permanent separator — sits at the same place whether answer cards or
                                    the example sentence are shown below, so the header above never shifts. */}
                                <div className="border-t border-[#4F4F4F] mt-4 sm:mt-8 md:mt-12" />

                                {/* Content section */}
                                <div className="flex-1 flex flex-col justify-center">
                                    {!showingPhrase ? (
                                        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto w-full">
                                            {answers.map((answer, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleAnswerSelect(answer)}
                                                    disabled={selectedAnswer !== null}
                                                    className={`${getButtonColor(answer)} ${
                                                        appSettings.quizDirection === 'reverse'
                                                            ? 'p-4 sm:p-6 md:p-7 text-xl sm:text-2xl md:text-3xl'
                                                            : 'p-3 sm:p-4 md:p-5 text-lg sm:text-xl md:text-2xl'
                                                    } rounded-lg text-center w-full transition-colors duration-300 hover:opacity-90 disabled:cursor-not-allowed border border-[#4F4F4F]`}
                                                >
                                                    {answer} <span className={`${appSettings.quizDirection === 'reverse' ? 'text-sm sm:text-base md:text-xl' : 'text-xs sm:text-sm md:text-base'} ml-2 opacity-70 hidden sm:inline`}>(Press {index + 1})</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        currentCard.phrase && (
                                            <div className="text-4xl sm:text-5xl md:text-6xl leading-[1.4] space-y-4 sm:space-y-6 break-words">
                                                <FuriganaText
                                                    text={currentCard.phrase.text}
                                                    highlightWord={currentCard.question}
                                                />
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Timer bar - only show when not showing phrase */}
                                {!showingPhrase && (
                                    <div className="h-3 sm:h-4 bg-[#4F4F4F] rounded-full w-full sm:w-3/4 mx-auto overflow-hidden mt-4 mb-2 sm:mb-4">
                                        <div
                                            className="h-full bg-white transition-all duration-100 ease-linear"
                                            style={{ width: `${(timeLeft / appSettings.timerDuration) * 100}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        </div>
    )
}
