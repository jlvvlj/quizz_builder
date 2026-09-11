"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import LoadingState from '@/components/LoadingState'
import { Settings, X } from "lucide-react"
import { useRouter } from 'next/router'
import { audioPlayer } from "@/utils/audio"
import { playAudio, preloadAudio, resumeAudioContext } from "@/utils/audioCache"
import { getAudioUrl } from "@/utils/audioUrl"
import { useSettingsModal } from '@/components/layout/SettingsContext'
import {
    QuizStartScreen,
    QuizEndScreen,
    type QuizEndStats,
} from '@/components/quiz/QuizTransitionScreens'
import { SaveErrorScreen } from '@/components/quiz/SaveErrorScreen'
import { QuizFeedbackBanner } from '@/components/quiz/QuizFeedbackBanner'
import type { HomophoneGroup, HomophoneWord } from '@/pages/api/words/homophones'

const END_SCREEN_AUTO_CONTINUE_MS = 9000

// Home-row answer keys (mirrors the words quiz): n e i o ' map to choices 1-5.
const LETTER_KEYS = ['n', 'e', 'i', 'o', "'"]

interface HomophoneCard {
    id: number;
    word: string;          // kanji / kana form shown as the prompt
    reading: string;       // the shared reading (furigana)
    correctAnswer: string; // this word's gloss
    options: string[];     // every word's gloss in the group (incl. correct)
    audioPath?: string;
    attemptKey?: number;   // bumped when a missed card is re-queued
}

interface AppSettings {
    sessionSize: number;
    timerDuration: number;
    audioAutoPlay: boolean;
    answerChoices: number;
}

// Produce a short, *unique-within-group* gloss for each word so the
// text-based answer comparison can never be ambiguous. Start from the first
// dictionary sense and add more senses only if two words would otherwise show
// the same text; as a last resort tag the kanji so options stay distinct.
function buildGlosses(words: HomophoneWord[]): Map<number, string> {
    const senses = new Map<number, string[]>();
    for (const w of words) {
        senses.set(
            w.id,
            (w.english || '')
                .split(';')
                .map(s => s.trim())
                .filter(Boolean),
        );
    }
    const glossAtDepth = (id: number, depth: number) => {
        const s = senses.get(id) ?? [];
        return s.slice(0, depth).join('; ') || '(no meaning)';
    };
    for (let depth = 1; depth <= 6; depth++) {
        const result = new Map<number, string>();
        const seen = new Set<string>();
        let unique = true;
        for (const w of words) {
            const g = glossAtDepth(w.id, depth);
            if (seen.has(g)) { unique = false; break; }
            seen.add(g);
            result.set(w.id, g);
        }
        if (unique) return result;
    }
    // Fallback: force uniqueness with the kanji form.
    const result = new Map<number, string>();
    for (const w of words) result.set(w.id, `${glossAtDepth(w.id, 2)} (${w.japanese_word})`);
    return result;
}

function shuffle<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

export default function HomophoneQuiz() {
    const router = useRouter()
    const { openSettings } = useSettingsModal()

    const [cards, setCards] = useState<HomophoneCard[]>([])
    const [originalLength, setOriginalLength] = useState(0)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answeredCards, setAnsweredCards] = useState(0)
    const [progress, setProgress] = useState(0)
    const [answers, setAnswers] = useState<string[]>([])
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    // After an answer (or timeout) the quiz shows the feedback banner and waits —
    // it advances only when the user hits Continue / Space, never automatically.
    const [awaitingContinue, setAwaitingContinue] = useState(false)
    const [timeLeft, setTimeLeft] = useState(3)
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saveError, setSaveError] = useState<string | null>(null)

    const [settings, setSettings] = useState<AppSettings | null>(null)

    const [showStartScreen, setShowStartScreen] = useState(false)
    const [showEndScreen, setShowEndScreen] = useState(false)
    const [endStats, setEndStats] = useState<QuizEndStats | null>(null)
    const startShownAtRef = useRef(0)
    const quizStartedRef = useRef(false)
    const quizCompletedRef = useRef(false)

    const sessionMissedIdsRef = useRef<Set<number>>(new Set())
    const sessionTimeSumRef = useRef(0)
    const sessionAnswerCountRef = useRef(0)
    // Per-word progress accumulator for this session, saved under the
    // 'homophone' quiz_type so it's a separate score from the words quiz.
    // Seeded from existing homophone progress so it persists across sessions.
    type Difficulty = { progress: number; timeToAnswer: number; totalMisses: number; correctAnswers: number }
    const difficultiesRef = useRef<Record<number, Difficulty>>({})

    const recordAnswer = (wordId: number, correct: boolean, timeToAnswer: number) => {
        const prev = difficultiesRef.current[wordId] || { progress: 0, timeToAnswer: 0, totalMisses: 0, correctAnswers: 0 }
        const attempts = prev.totalMisses + prev.correctAnswers
        const newTime = attempts === 0 ? timeToAnswer : (prev.timeToAnswer * attempts + timeToAnswer) / (attempts + 1)
        difficultiesRef.current[wordId] = {
            progress: correct ? Math.min((prev.progress || 0) + 10, 100) : (prev.progress || 0),
            timeToAnswer: newTime,
            totalMisses: prev.totalMisses + (correct ? 0 : 1),
            correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
        }
    }

    const currentCard = cards[currentIndex]

    // Load settings (session size + timer + audio toggle).
    useEffect(() => {
        async function loadSettings() {
            try {
                const res = await fetch('/api/settings/get', { credentials: 'include' })
                if (!res.ok) throw new Error('Failed to load settings')
                const data = await res.json()
                setSettings({
                    sessionSize: data.sessionSize && data.sessionSize > 0 ? data.sessionSize : 7,
                    timerDuration: data.timerDuration ?? 3,
                    audioAutoPlay: data.audioAutoPlay ?? true,
                    answerChoices: data.answerChoices && data.answerChoices >= 2 ? data.answerChoices : 4,
                })
            } catch (err) {
                console.error('Failed to load settings:', err)
                setError('Failed to load settings. Please try again.')
                setIsLoading(false)
            }
        }
        loadSettings()
    }, [])

    // Build the session once settings are in.
    useEffect(() => {
        if (!settings) return
        let cancelled = false
        async function load() {
            try {
                setIsLoading(true)
                const res = await fetch(`/api/words/homophones?total=${settings!.sessionSize}`, {
                    credentials: 'include',
                })
                if (!res.ok) throw new Error('Failed to load homophones')
                const { groups, fillers } = (await res.json()) as { groups: HomophoneGroup[]; fillers?: string[] }
                if (!groups || groups.length === 0) throw new Error('No homophones available')

                // Each card shows exactly `answerChoices` options: the correct
                // meaning, then as many same-reading homophones as possible (the
                // real confusers), then — only if the group is smaller than the
                // choice count — unrelated meanings to pad it out.
                const choiceCount = Math.max(2, settings!.answerChoices)
                const fillerPool = fillers ?? []
                const built: HomophoneCard[] = []
                for (const group of groups) {
                    const glosses = buildGlosses(group.words)
                    for (const w of group.words) {
                        const correct = glosses.get(w.id)!
                        const options = [correct]
                        // Same-sound homophone partners first.
                        for (const sibling of shuffle(group.words)) {
                            if (options.length >= choiceCount) break
                            if (sibling.id === w.id) continue
                            const g = glosses.get(sibling.id)!
                            if (!options.includes(g)) options.push(g)
                        }
                        // Pad with unrelated meanings if the group was too small.
                        for (const f of shuffle(fillerPool)) {
                            if (options.length >= choiceCount) break
                            if (!options.includes(f)) options.push(f)
                        }
                        built.push({
                            id: w.id,
                            word: w.japanese_word,
                            reading: group.reading,
                            correctAnswer: correct,
                            options,
                            audioPath: getAudioUrl(w.word_audio_path),
                        })
                    }
                }

                if (cancelled) return
                const ordered = shuffle(built)

                // Seed this session's progress accumulator from existing
                // 'homophone' progress so the score carries across sessions. A
                // failure here is surfaced (not silently zeroed) — same contract
                // as the words quiz.
                difficultiesRef.current = {}
                const ids = [...new Set(ordered.map(c => c.id))]
                const pres = await fetch(`/api/progress/get-batch?cardIds=${ids.join(',')}&quizType=homophone`, { credentials: 'include' })
                if (!pres.ok) throw new Error(`Failed to load homophone progress (${pres.status})`)
                const map = await pres.json() as Record<string, { progress: number; timeToAnswer: number; totalMisses: number; correctAnswers: number }>
                for (const [id, d] of Object.entries(map)) {
                    difficultiesRef.current[Number(id)] = {
                        progress: d.progress || 0,
                        timeToAnswer: d.timeToAnswer || 0,
                        totalMisses: d.totalMisses || 0,
                        correctAnswers: d.correctAnswers || 0,
                    }
                }

                if (cancelled) return
                setCards(ordered)
                setOriginalLength(ordered.length)
                setError(null)
            } catch (err) {
                if (cancelled) return
                console.error('Failed to build homophone session:', err)
                setError('Failed to load homophones. Please try again.')
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [settings])

    // Play the start sound + show the start screen on mount.
    useEffect(() => {
        if (quizStartedRef.current) return
        quizStartedRef.current = true
        resumeAudioContext()
        audioPlayer.play('quizStart')
        startShownAtRef.current = Date.now()
        setShowStartScreen(true)
    }, [])

    // Dismiss the start screen once data is ready (min display 2s; space skips).
    useEffect(() => {
        if (!showStartScreen) return
        const ready = !isLoading && cards.length > 0
        const MIN_DISPLAY_MS = 2000
        let timeout: ReturnType<typeof setTimeout> | undefined
        if (ready) {
            const elapsed = Date.now() - startShownAtRef.current
            timeout = setTimeout(() => setShowStartScreen(false), Math.max(0, MIN_DISPLAY_MS - elapsed))
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault()
                if (ready) setShowStartScreen(false)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => {
            if (timeout) clearTimeout(timeout)
            window.removeEventListener('keydown', onKey)
        }
    }, [showStartScreen, isLoading, cards.length])

    // Pre-decode each card's word audio for instant playback.
    useEffect(() => {
        if (cards.length === 0) return
        cards.forEach(c => preloadAudio(c.audioPath))
    }, [cards])

    // Shuffle the options whenever the card changes; reset per-card UI state.
    useEffect(() => {
        if (!currentCard || !settings) return
        setAnswers(shuffle(currentCard.options))
        setSelectedAnswer(null)
        setIsCorrect(null)
        setAwaitingContinue(false)
        setTimeLeft(settings.timerDuration)
        setIsTimerRunning(true)
    }, [currentIndex, currentCard, settings])

    // Play the word audio when a new card appears.
    useEffect(() => {
        if (!settings?.audioAutoPlay) return
        if (showStartScreen || showEndScreen) return
        const url = currentCard?.audioPath
        if (!url) return
        resumeAudioContext()
        const { cancel } = playAudio(url)
        const next = cards[currentIndex + 1]
        if (next) preloadAudio(next.audioPath)
        return () => cancel()
    }, [currentIndex, currentCard?.id, currentCard?.audioPath, settings?.audioAutoPlay, showStartScreen, showEndScreen, cards])

    const moveToNextCard = useCallback((correct: boolean) => {
        let newProgress = progress
        if (correct) {
            const answered = answeredCards + 1
            setAnsweredCards(answered)
            newProgress = Math.min(Math.round((answered * 100) / originalLength), 100)
            setProgress(newProgress)
        } else {
            // Re-queue the missed card so the session isn't done until it's right.
            setCards(prev => [...prev, { ...currentCard, attemptKey: Date.now() }])
        }
        if (newProgress < 100) setCurrentIndex(prev => prev + 1)
    }, [answeredCards, originalLength, progress, currentCard])

    const handleAnswerSelect = useCallback((answer: string) => {
        if (selectedAnswer !== null || !currentCard || !settings) return
        setSelectedAnswer(answer)
        setIsTimerRunning(false)

        const correct = answer === currentCard.correctAnswer
        setIsCorrect(correct)

        const timeToAnswer = Math.min(settings.timerDuration - timeLeft, settings.timerDuration)
        sessionTimeSumRef.current += timeToAnswer
        sessionAnswerCountRef.current += 1
        if (!correct) sessionMissedIdsRef.current.add(currentCard.id)
        recordAnswer(currentCard.id, correct, timeToAnswer)

        audioPlayer.play(correct ? 'correct' : 'incorrect')
        // Show the feedback banner and wait for the user to advance.
        setAwaitingContinue(true)
    }, [selectedAnswer, currentCard, settings, timeLeft])

    const handleTimeout = useCallback(() => {
        setIsTimerRunning(false)
        if (currentCard && settings) {
            sessionMissedIdsRef.current.add(currentCard.id)
            sessionTimeSumRef.current += settings.timerDuration
            sessionAnswerCountRef.current += 1
            recordAnswer(currentCard.id, false, settings.timerDuration)
        }
        // A timeout is a miss; show the failure banner and wait for Continue.
        setIsCorrect(false)
        setAwaitingContinue(true)
    }, [currentCard, settings])

    // Advance to the next card after the feedback banner. Correct advances as
    // correct, wrong / timed out as a miss (the card is re-queued).
    const handleContinue = useCallback(() => {
        if (!awaitingContinue) return
        setAwaitingContinue(false)
        moveToNextCard(isCorrect === true)
    }, [awaitingContinue, isCorrect, moveToNextCard])

    // Timer.
    useEffect(() => {
        if (!isTimerRunning || !currentCard || !settings) return
        if (showStartScreen || showEndScreen) return
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timer)
                    handleTimeout()
                    return 0
                }
                return prev - 0.1
            })
        }, 100)
        return () => clearInterval(timer)
    }, [isTimerRunning, currentCard, settings, showStartScreen, showEndScreen, handleTimeout])

    // While the feedback banner is up, Space advances to the next card (same as
    // clicking Continue). The answer-key handler below bails out when
    // awaitingContinue so Space fires exactly once.
    useEffect(() => {
        if (!awaitingContinue) return
        if (showStartScreen || showEndScreen) return
        const onKey = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault()
                handleContinue()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [awaitingContinue, showStartScreen, showEndScreen, handleContinue])

    // Keyboard: number keys (1-5) or the home-row letters (n e i o ') pick an answer.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (selectedAnswer !== null) return
            if (awaitingContinue) return
            if (showStartScreen || showEndScreen) return
            const num = parseInt(e.key, 10)
            const letterIdx = LETTER_KEYS.indexOf(e.key.toLowerCase())
            if (!isNaN(num) && num >= 1 && num <= answers.length) {
                handleAnswerSelect(answers[num - 1])
            } else if (letterIdx >= 0 && letterIdx < answers.length) {
                handleAnswerSelect(answers[letterIdx])
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [answers, handleAnswerSelect, selectedAnswer, awaitingContinue, showStartScreen, showEndScreen])

    // Completion: compute stats and show the end screen.
    useEffect(() => {
        if (progress < 100 || quizCompletedRef.current || !settings) return
        quizCompletedRef.current = true
        resumeAudioContext()
        audioPlayer.play('quizComplete')

        const totalWords = originalLength
        const missedCount = sessionMissedIdsRef.current.size
        const correctCount = Math.max(0, totalWords - missedCount)
        const accuracyPct = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0
        const answerCount = sessionAnswerCountRef.current
        const avgTime = answerCount > 0 ? sessionTimeSumRef.current / answerCount : 0
        const speedFactor = settings.timerDuration > 0
            ? Math.max(0, Math.min(1, 1 - avgTime / settings.timerDuration))
            : 0
        const score = Math.round(accuracyPct * 0.75 + speedFactor * 100 * 0.25)
        const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1

        setEndStats({ score, stars, correctCount, missedCount, totalWords, accuracyPct, avgTime })
        setShowEndScreen(true)

        // Persist this session's homophone progress (its own quiz_type). A save
        // failure is surfaced (not swallowed), same contract as the words quiz.
        // Snapshot the accumulator since refs may reset on replay.
        const wordDifficulties = { ...difficultiesRef.current }
        if (Object.keys(wordDifficulties).length > 0) {
            (async () => {
                try {
                    const res = await fetch('/api/progress/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ wordDifficulties, quizType: 'homophone' }),
                    })
                    if (!res.ok) {
                        let detail = ''
                        try { const body = await res.json(); detail = body?.error || JSON.stringify(body) }
                        catch { detail = await res.text() }
                        throw new Error(`Save failed (${res.status}): ${detail}`)
                    }
                } catch (err) {
                    console.error('Failed to save homophone progress:', err)
                    setSaveError(err instanceof Error ? err.message : String(err))
                }
            })()
        }
    }, [progress, settings, originalLength])

    const replay = useCallback(() => {
        // Reset everything for a fresh set.
        sessionMissedIdsRef.current = new Set()
        sessionTimeSumRef.current = 0
        sessionAnswerCountRef.current = 0
        quizCompletedRef.current = false
        setShowEndScreen(false)
        setSaveError(null)
        setEndStats(null)
        setAnsweredCards(0)
        setProgress(0)
        setCurrentIndex(0)
        // Re-trigger the loader by re-setting settings reference.
        setSettings(prev => (prev ? { ...prev } : prev))
    }, [])

    // On the end screen, auto-continue to a fresh round after a beat; space
    // (or the primary button) starts the next round immediately.
    useEffect(() => {
        if (!showEndScreen || saveError) return
        const timeout = setTimeout(() => replay(), END_SCREEN_AUTO_CONTINUE_MS)
        const onKey = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault()
                replay()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => {
            clearTimeout(timeout)
            window.removeEventListener('keydown', onKey)
        }
    }, [showEndScreen, saveError, replay])

    const getButtonColor = (answer: string) => {
        if (selectedAnswer !== answer) return "bg-[#2F2F2F] text-white"
        return isCorrect ? "bg-green-600 text-white" : "bg-red-600 text-white"
    }

    // Save failure after a round — surfaced with the shared screen, identical
    // to the words quiz (no silent fallback, one pattern).
    if (saveError) {
        return <SaveErrorScreen error={saveError} />
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
                <div className="text-white text-2xl">{error}</div>
            </div>
        )
    }

    if (!isLoading && cards.length === 0) {
        return (
            <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
                <LoadingState text="Preparing your cards" subText="Getting this quiz ready for you." />
            </div>
        )
    }

    const dataReady = !isLoading && cards.length > 0

    return (
        <div className="h-screen bg-[#1A1A1A] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            {showStartScreen && <QuizStartScreen sectionLabel="Homophones" />}
            {showEndScreen && endStats && (
                <QuizEndScreen
                    stats={endStats}
                    mastery={null}
                    masteryError={false}
                    hideMastery
                    sectionLabel="Homophones"
                    primaryLabel="Play again"
                    secondaryLabel="Finish"
                    autoContinueMs={END_SCREEN_AUTO_CONTINUE_MS}
                    autoContinueLabel="a new round"
                    onSeeResults={replay}
                    onFinish={() => router.push('/jalingo')}
                />
            )}

            {dataReady && currentCard && (
                <div className="w-full max-w-5xl p-3 sm:p-6 md:p-8 h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8 shrink-0">
                        <div className="flex-1 bg-[#2F2F2F] rounded-full h-8 flex items-center px-3 sm:px-4 min-w-0">
                            <span className="text-white mr-2 text-sm sm:text-base hidden sm:inline">Progress</span>
                            <div className="flex-1 h-2 bg-[#4F4F4F] rounded-full">
                                <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-white ml-3 sm:ml-4 text-sm sm:text-base">{progress}%</span>
                        </div>
                        <button className="bg-[#2F2F2F] text-white p-2 rounded-md hover:bg-[#363636] transition-colors border border-[#4F4F4F] shrink-0" onClick={openSettings}>
                            <Settings className="h-5 w-5" />
                        </button>
                        <button className="bg-[#2F2F2F] text-white p-2 rounded-md hover:bg-[#363636] transition-colors border border-[#4F4F4F] shrink-0" onClick={() => router.push('/jalingo')}>
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Card */}
                    <div className="rounded-xl sm:rounded-2xl p-4 sm:p-8 md:p-12 flex-1 flex flex-col min-h-0 relative">
                        <div className="text-center text-white flex-1 flex flex-col">
                            <div className="pt-2 sm:pt-4 flex-shrink-0">
                                <h2 className="text-base sm:text-2xl mb-4 sm:mb-8 text-[#A1A1A1]">
                                    Which meaning matches this word?
                                </h2>
                                <div className="text-5xl sm:text-6xl md:text-7xl font-bold break-words">
                                    <ruby>
                                        {currentCard.word}
                                        <rp>(</rp>
                                        <rt className="text-base sm:text-2xl text-[#A1A1A1]">{currentCard.reading}</rt>
                                        <rp>)</rp>
                                    </ruby>
                                </div>
                            </div>

                            <div className="border-t border-[#4F4F4F] mt-4 sm:mt-8 md:mt-12 flex-shrink-0" />

                            <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center">
                                <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-5xl mx-auto w-full">
                                    {answers.map((answer, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelect(answer)}
                                            disabled={selectedAnswer !== null || awaitingContinue}
                                            className={`${getButtonColor(answer)} h-20 sm:h-24 md:h-28 px-3 sm:px-4 md:px-5 text-lg sm:text-xl md:text-2xl rounded-lg w-full relative flex items-center justify-center text-center transition-colors duration-300 hover:opacity-90 disabled:cursor-not-allowed border border-[#4F4F4F]`}
                                        >
                                            <span className="line-clamp-2 leading-tight break-words">{answer}</span>
                                            <span className="absolute bottom-1 right-2 text-xs opacity-60 hidden sm:inline">
                                                (Press {index + 1})
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {awaitingContinue ? (
                                <div className="mt-4 mb-2 sm:mb-4 flex-shrink-0">
                                    <QuizFeedbackBanner
                                        status={isCorrect === true ? 'correct' : 'incorrect'}
                                        correctSolution={currentCard.correctAnswer}
                                        onContinue={handleContinue}
                                    />
                                </div>
                            ) : (
                                <div className="h-3 sm:h-4 bg-[#4F4F4F] rounded-full w-full sm:w-3/4 mx-auto overflow-hidden mt-4 mb-2 sm:mb-4 flex-shrink-0">
                                    <div
                                        className="h-full bg-white transition-all duration-100 ease-linear"
                                        style={{ width: `${(timeLeft / (settings?.timerDuration || 3)) * 100}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
