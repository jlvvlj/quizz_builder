import React from 'react'
import LoadingState from '@/components/LoadingState'
import { useState, useEffect, useCallback, useRef } from "react"
import { Pause, Settings, X } from "lucide-react"
import { useRouter } from 'next/router'
import { fetchSupabaseSessionKanji, fetchAllKanji } from '@/utils/supabase-client'
import { audioPlayer } from "@/utils/audio"
import { resumeAudioContext } from "@/utils/audioCache"
import { getAudioUrl } from "@/utils/audioUrl"
import { useSettingsModal } from '@/components/layout/SettingsContext'
import { updateKanjiProgressStatus } from '@/utils/progress-calculator'
import { calculateStepProgressFromRecords } from '@/utils/step-progress'
import QuizzCard from '@/kanji_quizzcard'
import KanjiSheet from '@/components/KanjiSheet'
import {
    QuizStartScreen,
    QuizEndScreen,
    type QuizEndStats,
    type MasteryStats,
} from '@/components/quiz/QuizTransitionScreens'
import { QuizFeedbackBanner } from '@/components/quiz/QuizFeedbackBanner'

const END_SCREEN_AUTO_CONTINUE_MS = 9000

// Add type declaration at the top of the file
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext
    }
}

interface KanjiDifficulty {
    [key: number]: {
        progress: number;
        time_to_answer: number;
        total_misses: number;
        correct_answers: number;
    };
}

interface SessionKanji {
    id: number;
    japanese_word: string;
    english: string;
    mnemonic?: string;
    example_sentence_japanese?: string;
    example_sentence_english?: string;
    sentence_audio_path?: string;
    example_sentence_japanese_2?: string;
    example_sentence_english_2?: string;
    sentence_audio_path_2?: string;
    example_sentence_japanese_3?: string;
    example_sentence_english_3?: string;
    sentence_audio_path_3?: string;
    progress?: number;
    time_to_answer?: number;
    total_misses?: number;
    correct_answers?: number;
    japanese_reading_1?: string;
    japanese_reading_2?: string;
    japanese_reading_3?: string;
    composed_of_kanji?: string;
    composed_of_kanji_description?: string;
    composed_of_kanji_2?: string;
    composed_of_kanji_description_2?: string;
    composed_of_kanji_3?: string;
    composed_of_kanji_description_3?: string;
    used_in_kanji_kanji?: string;
    used_in_kanji_meaning?: string;
    used_in_kanji_kanji_2?: string;
    used_in_kanji_meaning_2?: string;
    used_in_kanji_kanji_3?: string;
    used_in_kanji_meaning_3?: string;
    used_in_word?: string;
    used_in_word_reading?: string;
    used_in_word_meaning?: string;
    used_in_word_2?: string;
    used_in_word_reading_2?: string;
    used_in_word_meaning_2?: string;
    used_in_word_3?: string;
    used_in_word_reading_3?: string;
    used_in_word_meaning_3?: string;
    word_reading?: string[];
    word_reading_2?: string[];
    word_reading_3?: string[];
}

interface QuizCard {
    id: number;
    question: string;
    correctAnswer: string;
    wrongAnswers?: string[];
    wrongAnswer1?: string;
    wrongAnswer2?: string;
    mnemonic?: string;
    example_sentence_japanese?: string;
    example_sentence_english?: string;
    sentence_audio_path?: string;
    example_sentence_japanese_2?: string;
    example_sentence_english_2?: string;
    sentence_audio_path_2?: string;
    example_sentence_japanese_3?: string;
    example_sentence_english_3?: string;
    sentence_audio_path_3?: string;
    isReview: boolean;
    attemptKey?: number;
    progress?: number;
    time_to_answer?: number;
    total_misses?: number;
    correct_answers?: number;
    // Learning card fields
    japanese_reading_1?: string;
    japanese_reading_2?: string;
    japanese_reading_3?: string;
    composed_of_kanji?: string;
    composed_of_kanji_description?: string;
    composed_of_kanji_2?: string;
    composed_of_kanji_description_2?: string;
    composed_of_kanji_3?: string;
    composed_of_kanji_description_3?: string;
    used_in_kanji_kanji?: string;
    used_in_kanji_meaning?: string;
    used_in_kanji_kanji_2?: string;
    used_in_kanji_meaning_2?: string;
    used_in_kanji_kanji_3?: string;
    used_in_kanji_meaning_3?: string;
    used_in_word?: string;
    used_in_word_reading?: string;
    used_in_word_meaning?: string;
    used_in_word_2?: string;
    used_in_word_reading_2?: string;
    used_in_word_meaning_2?: string;
    used_in_word_3?: string;
    used_in_word_reading_3?: string;
    used_in_word_meaning_3?: string;
    word_reading?: string[];
    word_reading_2?: string[];
    word_reading_3?: string[];
}

interface AppSettings {
    sessionSize?: number;
    showPhrase: boolean;
    audioAutoPlay: boolean;
    timerDuration: number;
    answerChoices: number;
}

// Utility function to highlight English words in mnemonic
const highlightMnemonic = (mnemonic: string, english: string) => {
    // Handle case where English word has multiple meanings (e.g., "one;first")
    const englishWords = english.split(';').map(word => word.trim());

    // Create a regex pattern that matches any of the English words
    const pattern = new RegExp(`(${englishWords.join('|')})`, 'gi');

    // Split the mnemonic text into parts and map them to JSX
    const parts = mnemonic.split(pattern);
    return parts.map((part, i) => {
        if (englishWords.some(word => part.toLowerCase() === word.toLowerCase())) {
            return <span key={i} className="text-blue-300 font-medium">{part}</span>;
        }
        return part;
    });
};

export default function KanjiQuizApp() {
    const router = useRouter()
    const isLearnMode = router.query.mode === 'learn'
    // The session is introduced and quizzed in batches of this many cards:
    // intro 5 → quiz 5 → intro the next 5 → quiz them → … with any missed
    // cards collected into a final review round at the very end.
    const BATCH_SIZE = 5

    // `flashcards` holds the unique cards for the session, one per kanji, in order.
    const [flashcards, setFlashcards] = useState<QuizCard[]>([])
    const [originalLength, setOriginalLength] = useState(0)
    const [progress, setProgress] = useState(0)

    // Batched intro/quiz flow state.
    const [phase, setPhase] = useState<'intro' | 'quiz'>('intro')
    const [batchIndex, setBatchIndex] = useState(0)   // which batch we're introducing/quizzing
    const [introIndex, setIntroIndex] = useState(0)   // position while browsing a batch's intro cards
    const [quizQueue, setQuizQueue] = useState<QuizCard[]>([]) // cards being quizzed in the current segment
    const [quizPos, setQuizPos] = useState(0)         // position within quizQueue
    const [introducedIds, setIntroducedIds] = useState<Set<number>>(new Set())
    const finalReviewRef = useRef<QuizCard[]>([])     // cards missed during batch quizzes, tested at the end

    const [timeLeft, setTimeLeft] = useState(3)
    const [isTimerRunning, setIsTimerRunning] = useState(true)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    // After an answer (or timeout) the quiz shows the feedback banner and waits —
    // it advances only when the user hits Continue / Space, never automatically.
    const [awaitingContinue, setAwaitingContinue] = useState(false)
    const [answeredCards, setAnsweredCards] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { openSettings } = useSettingsModal()
    const quizStartedRef = useRef(false)
    const quizCompletedRef = useRef(false)
    const [phraseAudio, setPhraseAudio] = useState<AudioBufferSourceNode | null>(null)
    const [appSettings, setAppSettings] = useState<AppSettings>({
        sessionSize: undefined,
        showPhrase: false,
        audioAutoPlay: true,
        timerDuration: 3,
        answerChoices: 3
    })

    // Add state for tracking kanji difficulties
    const [kanjiDifficulties, setKanjiDifficulties] = useState<KanjiDifficulty>({})

    // Animated start / end transition screens
    const [showStartScreen, setShowStartScreen] = useState(false)
    const [showEndScreen, setShowEndScreen] = useState(false)
    const [endStats, setEndStats] = useState<QuizEndStats | null>(null)
    const [sectionStats, setSectionStats] = useState<MasteryStats | null>(null)
    const [sectionStatsError, setSectionStatsError] = useState(false)
    const [selectedKanjiEntry, setSelectedKanjiEntry] = useState<QuizCard | null>(null)
    const [isKanjiSheetOpen, setIsKanjiSheetOpen] = useState(false)
    const wasTimerRunningBeforeKanjiSheetRef = useRef(false)

    // Per-session accumulators, read only when the session ends. Kept in refs so
    // updating them mid-quiz never triggers a re-render.
    const sessionMissedIdsRef = useRef<Set<number>>(new Set())
    const sessionTimeSumRef = useRef(0)
    const sessionAnswerCountRef = useRef(0)

    // Timestamp the start screen first appeared, so we can hold it for a minimum
    // beat even when the session data finishes loading almost instantly.
    const startShownAtRef = useRef(0)
    // Set when the user presses space before the data is ready, so the early
    // press is honored (quiz starts the instant cards arrive) instead of dropped.
    const startRequestedRef = useRef(false)
    // Timestamp the moment the data became ready, so the auto-start beat is
    // measured from readiness — guaranteeing a window in which Space can start.
    const readyAtRef = useRef(0)

    const sectionLabel = (() => {
        const s = router.query.section
        if (typeof s !== 'string') return undefined
        const n = s.split('_').pop()
        return n && /^\d+$/.test(n) ? `Section ${n}` : undefined
    })()

    // Chunk the session into batches of BATCH_SIZE. In learn mode the whole
    // session is a single browsable batch with no quiz.
    const batches = React.useMemo<QuizCard[][]>(() => {
        if (flashcards.length === 0) return [];
        if (isLearnMode) return [flashcards];
        const out: QuizCard[][] = [];
        for (let i = 0; i < flashcards.length; i += BATCH_SIZE) {
            out.push(flashcards.slice(i, i + BATCH_SIZE));
        }
        return out;
    }, [flashcards, isLearnMode]);

    // batchIndex === batches.length is the sentinel for the final review round.
    const isFinalReview = !isLearnMode && batchIndex >= batches.length;
    const currentBatch = batches[batchIndex];
    const currentIntroCards = React.useMemo(
        () => isLearnMode ? (currentBatch ?? []) : (currentBatch ?? []).filter(c => !introducedIds.has(c.id)),
        [currentBatch, introducedIds, isLearnMode],
    );
    const isLearningPhase = phase === 'intro';
    const currentCard = isLearningPhase
        ? currentIntroCards[introIndex]
        : quizQueue[quizPos];

    const openKanjiEntrySheet = useCallback(() => {
        if (!currentCard) return;
        wasTimerRunningBeforeKanjiSheetRef.current = isTimerRunning;
        setIsTimerRunning(false);
        setSelectedKanjiEntry(currentCard);
        setIsKanjiSheetOpen(true);
    }, [currentCard, isTimerRunning]);

    const closeKanjiEntrySheet = useCallback(() => {
        setIsKanjiSheetOpen(false);
        setSelectedKanjiEntry(null);
        setIsTimerRunning(wasTimerRunningBeforeKanjiSheetRef.current);
    }, []);

    // The answer block is absolutely positioned at the bottom of the quiz card so it
    // never moves between cards or between the question / post-answer steps, no matter
    // how tall the mnemonic or example sentence above happens to be. Measure its height
    // here and reserve the same height as bottom-padding above, so the kanji header /
    // mnemonic / sentence never overlap the answer block.
    const answerBlockRef = useRef<HTMLDivElement>(null);
    const [answerBlockHeight, setAnswerBlockHeight] = useState(0);

    useEffect(() => {
        const el = answerBlockRef.current;
        if (!el) {
            setAnswerBlockHeight(0);
            return;
        }
        const measure = () => setAnswerBlockHeight(el.getBoundingClientRect().height);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
    }, [isLearningPhase, router.query.mode, appSettings.answerChoices, isLoading, flashcards.length]);

    // Load flashcards from API
    useEffect(() => {
        const loadFlashcards = async () => {
            try {
                setIsLoading(true)

                const { section, practicedKanjiIds, mode } = router.query;

                console.log('Loading quiz with section:', section);
                console.log('Using session size:', appSettings.sessionSize);
                console.log('Mode:', mode);

                let sessionKanji: SessionKanji[] = [], quizCards: QuizCard[] = [];

                // First, get all kanji for this section
                console.log('Fetching all kanji for section...');
                const { kanji: allSectionKanji } = await fetchAllKanji(section as string);

                if (mode === 'learn') {
                    // In learn mode, use all kanji from the section
                    console.log('Learn mode: Using all kanji from section');
                    sessionKanji = allSectionKanji;
                    
                    // Transform all kanji to quiz cards
                    quizCards = sessionKanji.map((k: SessionKanji) => ({
                        id: k.id,
                        question: k.japanese_word,
                        correctAnswer: k.english,
                        mnemonic: k.mnemonic,
                        example_sentence_japanese: k.example_sentence_japanese,
                        example_sentence_english: k.example_sentence_english,
                        sentence_audio_path: k.sentence_audio_path || undefined,
                        example_sentence_japanese_2: k.example_sentence_japanese_2,
                        example_sentence_english_2: k.example_sentence_english_2,
                        sentence_audio_path_2: k.sentence_audio_path_2 || undefined,
                        example_sentence_japanese_3: k.example_sentence_japanese_3,
                        example_sentence_english_3: k.example_sentence_english_3,
                        sentence_audio_path_3: k.sentence_audio_path_3 || undefined,
                        isReview: false,
                        progress: k.progress || 0,
                        time_to_answer: k.time_to_answer || 0,
                        total_misses: k.total_misses || 0,
                        correct_answers: k.correct_answers || 0,
                        composed_of_kanji: k.composed_of_kanji,
                        composed_of_kanji_description: k.composed_of_kanji_description,
                        composed_of_kanji_2: k.composed_of_kanji_2,
                        composed_of_kanji_description_2: k.composed_of_kanji_description_2,
                        composed_of_kanji_3: k.composed_of_kanji_3,
                        composed_of_kanji_description_3: k.composed_of_kanji_description_3,
                        japanese_reading_1: k.japanese_reading_1,
                        japanese_reading_2: k.japanese_reading_2,
                        japanese_reading_3: k.japanese_reading_3,
                        used_in_kanji_kanji: k.used_in_kanji_kanji,
                        used_in_kanji_meaning: k.used_in_kanji_meaning,
                        used_in_kanji_kanji_2: k.used_in_kanji_kanji_2,
                        used_in_kanji_meaning_2: k.used_in_kanji_meaning_2,
                        used_in_kanji_kanji_3: k.used_in_kanji_kanji_3,
                        used_in_kanji_meaning_3: k.used_in_kanji_meaning_3,
                        used_in_word: k.used_in_word,
                        used_in_word_reading: k.used_in_word_reading,
                        used_in_word_meaning: k.used_in_word_meaning,
                        used_in_word_2: k.used_in_word_2,
                        used_in_word_reading_2: k.used_in_word_reading_2,
                        used_in_word_meaning_2: k.used_in_word_meaning_2,
                        used_in_word_3: k.used_in_word_3,
                        used_in_word_reading_3: k.used_in_word_reading_3,
                        used_in_word_meaning_3: k.used_in_word_meaning_3,
                        word_reading: k.word_reading,
                        word_reading_2: k.word_reading_2,
                        word_reading_3: k.word_reading_3
                    }));
                } else if (practicedKanjiIds && typeof practicedKanjiIds === 'string') {
                    // If we have practiced kanji IDs, fetch those specific kanji
                    console.log('Fetching practiced kanji:', practicedKanjiIds);
                    const kanjiIds = practicedKanjiIds.split(',').map((id: string) => parseInt(id));
                    const filteredKanji = allSectionKanji.filter((k: SessionKanji) => kanjiIds.includes(k.id));

                    // Transform kanji to quiz cards
                    const numWrong = Math.max(1, appSettings.answerChoices - 1);
                    quizCards = filteredKanji.map((k: SessionKanji) => {
                        // Pick random kanji for wrong answers that are not the current kanji
                        const wrongKanji: SessionKanji[] = [];
                        const usedIndices = new Set<number>();
                        const targetWrong = Math.min(numWrong, allSectionKanji.length - 1);

                        while (wrongKanji.length < targetWrong) {
                            const randomIndex = Math.floor(Math.random() * allSectionKanji.length);
                            if (!usedIndices.has(randomIndex) && allSectionKanji[randomIndex].id !== k.id) {
                                wrongKanji.push(allSectionKanji[randomIndex]);
                                usedIndices.add(randomIndex);
                            }
                        }

                        const wrongAnswers = mode === 'learn' ? [] : wrongKanji.map(w => w.english);

                        // Add debug logs
                        console.log('Raw kanji data:', k);
                        const quizCard = {
                            id: k.id,
                            question: k.japanese_word,
                            correctAnswer: k.english,
                            wrongAnswers,
                            wrongAnswer1: mode === 'learn' ? undefined : wrongAnswers[0],
                            wrongAnswer2: mode === 'learn' ? undefined : wrongAnswers[1],
                            mnemonic: k.mnemonic,
                            example_sentence_japanese: k.example_sentence_japanese,
                            example_sentence_english: k.example_sentence_english,
                            sentence_audio_path: k.sentence_audio_path || undefined,
                            example_sentence_japanese_2: k.example_sentence_japanese_2,
                            example_sentence_english_2: k.example_sentence_english_2,
                            sentence_audio_path_2: k.sentence_audio_path_2 || undefined,
                            example_sentence_japanese_3: k.example_sentence_japanese_3,
                            example_sentence_english_3: k.example_sentence_english_3,
                            sentence_audio_path_3: k.sentence_audio_path_3 || undefined,
                            isReview: false,
                            progress: k.progress || 0,
                            time_to_answer: k.time_to_answer || 0,
                            total_misses: k.total_misses || 0,
                            correct_answers: k.correct_answers || 0,
                            // Add composed_of fields with correct names
                            composed_of_kanji: k.composed_of_kanji,
                            composed_of_kanji_description: k.composed_of_kanji_description,
                            composed_of_kanji_2: k.composed_of_kanji_2,
                            composed_of_kanji_description_2: k.composed_of_kanji_description_2,
                            composed_of_kanji_3: k.composed_of_kanji_3,
                            composed_of_kanji_description_3: k.composed_of_kanji_description_3,
                            // Keep other fields
                            japanese_reading_1: k.japanese_reading_1,
                            japanese_reading_2: k.japanese_reading_2,
                            japanese_reading_3: k.japanese_reading_3,
                            used_in_kanji_kanji: k.used_in_kanji_kanji,
                            used_in_kanji_meaning: k.used_in_kanji_meaning,
                            used_in_kanji_kanji_2: k.used_in_kanji_kanji_2,
                            used_in_kanji_meaning_2: k.used_in_kanji_meaning_2,
                            used_in_kanji_kanji_3: k.used_in_kanji_kanji_3,
                            used_in_kanji_meaning_3: k.used_in_kanji_meaning_3,
                            used_in_word: k.used_in_word,
                            used_in_word_reading: k.used_in_word_reading,
                            used_in_word_meaning: k.used_in_word_meaning,
                            used_in_word_2: k.used_in_word_2,
                            used_in_word_reading_2: k.used_in_word_reading_2,
                            used_in_word_meaning_2: k.used_in_word_meaning_2,
                            used_in_word_3: k.used_in_word_3,
                            used_in_word_reading_3: k.used_in_word_reading_3,
                            used_in_word_meaning_3: k.used_in_word_meaning_3,
                            word_reading: k.word_reading,
                            word_reading_2: k.word_reading_2,
                            word_reading_3: k.word_reading_3
                        };
                        console.log('Transformed quiz card:', quizCard);
                        return quizCard;
                    });
                    sessionKanji = filteredKanji;
                } else {
                    // Get new session kanji
                    console.log('Fetching last kanji progress for section:', section);
                    
                    // Get the last kanji ID from progress to determine where to start
                    const progressResponse = await fetch(`/api/progress/last-kanji?section=${section}`, {
                        credentials: 'include'
                    });
                    if (!progressResponse.ok) {
                        console.error('Failed to get last kanji progress:', await progressResponse.text());
                        throw new Error('Failed to get last kanji progress');
                    }
                    const { lastKanjiId } = await progressResponse.json();
                    console.log('Last kanji ID from API:', lastKanjiId);

                    console.log('Fetching session kanji with params:', {
                        sessionSize: appSettings.sessionSize || 10,
                        section,
                        startFrom: lastKanjiId
                    });

                    const result = await fetchSupabaseSessionKanji(
                        appSettings.sessionSize || 10,
                        section as string,
                        lastKanjiId.toString()
                    );
                    sessionKanji = result.sessionKanji;

                    // Transform kanji to quiz cards
                    const numWrong = Math.max(1, appSettings.answerChoices - 1);
                    quizCards = sessionKanji.map((k: SessionKanji) => {
                        // Pick random kanji for wrong answers that are not the current kanji
                        const wrongKanji: SessionKanji[] = [];
                        const usedIndices = new Set<number>();
                        const targetWrong = Math.min(numWrong, allSectionKanji.length - 1);

                        while (wrongKanji.length < targetWrong) {
                            const randomIndex = Math.floor(Math.random() * allSectionKanji.length);
                            if (!usedIndices.has(randomIndex) && allSectionKanji[randomIndex].id !== k.id) {
                                wrongKanji.push(allSectionKanji[randomIndex]);
                                usedIndices.add(randomIndex);
                            }
                        }

                        const wrongAnswers = mode === 'learn' ? [] : wrongKanji.map(w => w.english);

                        // Add debug logs
                        console.log('Raw kanji data:', k);
                        const quizCard = {
                            id: k.id,
                            question: k.japanese_word,
                            correctAnswer: k.english,
                            wrongAnswers,
                            wrongAnswer1: mode === 'learn' ? undefined : wrongAnswers[0],
                            wrongAnswer2: mode === 'learn' ? undefined : wrongAnswers[1],
                            mnemonic: k.mnemonic,
                            example_sentence_japanese: k.example_sentence_japanese,
                            example_sentence_english: k.example_sentence_english,
                            sentence_audio_path: k.sentence_audio_path || undefined,
                            example_sentence_japanese_2: k.example_sentence_japanese_2,
                            example_sentence_english_2: k.example_sentence_english_2,
                            sentence_audio_path_2: k.sentence_audio_path_2 || undefined,
                            example_sentence_japanese_3: k.example_sentence_japanese_3,
                            example_sentence_english_3: k.example_sentence_english_3,
                            sentence_audio_path_3: k.sentence_audio_path_3 || undefined,
                            isReview: false,
                            progress: k.progress || 0,
                            time_to_answer: k.time_to_answer || 0,
                            total_misses: k.total_misses || 0,
                            correct_answers: k.correct_answers || 0,
                            // Add composed_of fields with correct names
                            composed_of_kanji: k.composed_of_kanji,
                            composed_of_kanji_description: k.composed_of_kanji_description,
                            composed_of_kanji_2: k.composed_of_kanji_2,
                            composed_of_kanji_description_2: k.composed_of_kanji_description_2,
                            composed_of_kanji_3: k.composed_of_kanji_3,
                            composed_of_kanji_description_3: k.composed_of_kanji_description_3,
                            // Keep other fields
                            japanese_reading_1: k.japanese_reading_1,
                            japanese_reading_2: k.japanese_reading_2,
                            japanese_reading_3: k.japanese_reading_3,
                            used_in_kanji_kanji: k.used_in_kanji_kanji,
                            used_in_kanji_meaning: k.used_in_kanji_meaning,
                            used_in_kanji_kanji_2: k.used_in_kanji_kanji_2,
                            used_in_kanji_meaning_2: k.used_in_kanji_meaning_2,
                            used_in_kanji_kanji_3: k.used_in_kanji_kanji_3,
                            used_in_kanji_meaning_3: k.used_in_kanji_meaning_3,
                            used_in_word: k.used_in_word,
                            used_in_word_reading: k.used_in_word_reading,
                            used_in_word_meaning: k.used_in_word_meaning,
                            used_in_word_2: k.used_in_word_2,
                            used_in_word_reading_2: k.used_in_word_reading_2,
                            used_in_word_meaning_2: k.used_in_word_meaning_2,
                            used_in_word_3: k.used_in_word_3,
                            used_in_word_reading_3: k.used_in_word_reading_3,
                            used_in_word_meaning_3: k.used_in_word_meaning_3,
                            word_reading: k.word_reading,
                            word_reading_2: k.word_reading_2,
                            word_reading_3: k.word_reading_3
                        };
                        console.log('Transformed quiz card:', quizCard);
                        return quizCard;
                    });
                }

                // Initialize kanjiDifficulties with the progress data from the database
                const initialKanjiDifficulties = sessionKanji.reduce((acc: KanjiDifficulty, kanji: SessionKanji) => {
                    acc[kanji.id] = {
                        progress: kanji.progress || 0,
                        time_to_answer: kanji.time_to_answer || 0,
                        total_misses: kanji.total_misses || 0,
                        correct_answers: kanji.correct_answers || 0
                    };
                    return acc;
                }, {} as KanjiDifficulty);

                if (isLearnMode) {
                    setIntroducedIds(new Set());
                } else {
                    const ids = quizCards.map(c => c.id);
                    const introRes = await fetch(`/api/progress/introduced-kanji?cardIds=${ids.join(',')}`, {
                        credentials: 'include'
                    });
                    if (!introRes.ok) throw new Error(`Failed to check introduced kanji (${introRes.status})`);
                    const { introducedIds: introducedList } = await introRes.json() as { introducedIds: number[] };
                    setIntroducedIds(new Set(introducedList));
                }

                setKanjiDifficulties(initialKanjiDifficulties);
                setFlashcards(quizCards);
                setOriginalLength(quizCards.length);
                // Reset the batched session flow for the freshly loaded cards.
                setPhase('intro');
                setBatchIndex(0);
                setIntroIndex(0);
                setQuizQueue([]);
                setQuizPos(0);
                finalReviewRef.current = [];
                setAnsweredCards(0);
                setProgress(0);
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
    }, [router.isReady, router.query, appSettings.sessionSize, appSettings.answerChoices, isLearnMode]);

    // Show the animated start screen immediately for quiz mode — it stands in for
    // the old "Loading..." text while the session data loads in the background.
    useEffect(() => {
        if (!router.isReady) return;
        if (router.query.mode === 'learn') return;
        if (startShownAtRef.current !== 0) return;
        startShownAtRef.current = Date.now();
        setShowStartScreen(true);
    }, [router.isReady, router.query.mode]);

    // Play the quiz-start sound once the session becomes interactive (loading
    // done + at least one card available).
    useEffect(() => {
        if (isLoading) return;
        if (flashcards.length === 0) return;
        if (quizStartedRef.current) return;
        quizStartedRef.current = true;
        resumeAudioContext();
        audioPlayer.play('quizStart');
    }, [isLoading, flashcards.length]);

    // Once data is ready, hold the start screen for a short, fixed beat measured
    // from the moment it became ready (not from when the screen first appeared),
    // so there is always a window in which Space starts the quiz early. Without a
    // press the quiz auto-starts when that beat elapses. A press while still
    // loading is remembered (startRequestedRef) so the quiz begins the instant the
    // cards arrive — never silently dropped, never revealing an unready quiz.
    useEffect(() => {
        if (!showStartScreen) return;
        const ready = !isLoading && flashcards.length > 0;
        const AUTO_START_DELAY_MS = 1500;
        let timeout: ReturnType<typeof setTimeout> | undefined;
        if (ready) {
            if (startRequestedRef.current) {
                setShowStartScreen(false);
            } else {
                if (readyAtRef.current === 0) readyAtRef.current = Date.now();
                const elapsed = Date.now() - readyAtRef.current;
                timeout = setTimeout(() => setShowStartScreen(false), Math.max(0, AUTO_START_DELAY_MS - elapsed));
            }
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                startRequestedRef.current = true;
                if (!isLoading && flashcards.length > 0) setShowStartScreen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => {
            if (timeout) clearTimeout(timeout);
            window.removeEventListener('keydown', onKey);
        };
    }, [showStartScreen, isLoading, flashcards.length]);

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
                setAppSettings({
                    sessionSize: data.sessionSize,
                    showPhrase: data.showPhrase ?? false,
                    audioAutoPlay: data.audioAutoPlay ?? true,
                    timerDuration: data.timerDuration ?? 3,
                    answerChoices: data.answerChoices ?? 3
                });
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
        loadSettings();
    }, [])

    // Randomize the order of answers
    const [answers, setAnswers] = useState<string[]>([])

    // Build & shuffle the answer choices whenever the quiz lands on a new card.
    useEffect(() => {
        if (phase !== 'quiz' || !currentCard) return;

        // Filter out any undefined answers and ensure we have strings
        const wrong = currentCard.wrongAnswers && currentCard.wrongAnswers.length > 0
            ? currentCard.wrongAnswers
            : [currentCard.wrongAnswer1, currentCard.wrongAnswer2].filter((s): s is string => !!s);
        const answerArray = [currentCard.correctAnswer, ...wrong].filter(
            (answer): answer is string => answer !== undefined
        );

        for (let i = answerArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [answerArray[i], answerArray[j]] = [answerArray[j], answerArray[i]];
        }
        setAnswers(answerArray);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setAwaitingContinue(false);
        setTimeLeft(appSettings.timerDuration);
        setIsTimerRunning(true);
    }, [phase, batchIndex, quizPos, currentCard, appSettings.timerDuration]);

    // Timer functionality
    useEffect(() => {
        if (!isTimerRunning || !currentCard || isLearningPhase) return; // Don't run timer during learning phase
        if (showStartScreen || showEndScreen || isKanjiSheetOpen) return; // Pause while an overlay is up

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
    }, [isTimerRunning, currentCard, isLearningPhase, showStartScreen, showEndScreen, isKanjiSheetOpen])

    // Advance the quiz after an answer (or a timeout) within the batched flow.
    const advanceQuiz = useCallback((correct: boolean) => {
        if (isLearnMode || !currentCard) return; // learn mode has no quiz

        let newProgress = progress;
        if (correct) {
            const newAnsweredCards = answeredCards + 1;
            setAnsweredCards(newAnsweredCards);
            // Each unique card counts once toward completion; progress hits 100
            // only when every card has been answered correctly at least once.
            newProgress = Math.min(Math.round((newAnsweredCards * 100) / originalLength), 100);
            setProgress(newProgress);
        }

        // Account for a miss. During a batch quiz the card is deferred to the
        // final review round; during the final review it is re-queued so the
        // round keeps going until everything is correct.
        let segmentQueue = quizQueue;
        if (!correct) {
            if (isFinalReview) {
                segmentQueue = [...quizQueue, { ...currentCard, attemptKey: Date.now() }];
                setQuizQueue(segmentQueue);
            } else {
                finalReviewRef.current = [...finalReviewRef.current, currentCard];
            }
        }

        // Reset per-card answer state.
        setSelectedAnswer(null);
        setIsCorrect(null);
        setTimeLeft(appSettings.timerDuration);
        setIsTimerRunning(true);

        if (newProgress >= 100) return; // completion effect handles the redirect

        // More cards left in the current quiz segment.
        if (quizPos < segmentQueue.length - 1) {
            setQuizPos(quizPos + 1);
            return;
        }

        // Reached the end of this quiz segment.
        if (!isFinalReview) {
            const nextBatch = batchIndex + 1;
            if (nextBatch < batches.length) {
                // Introduce the next batch before quizzing it.
                setBatchIndex(nextBatch);
                setIntroIndex(0);
                setPhase('intro');
            } else if (finalReviewRef.current.length > 0) {
                // All batches quizzed; run one more test on everything missed.
                setBatchIndex(batches.length); // final-review sentinel
                setQuizQueue(finalReviewRef.current);
                setQuizPos(0);
                setPhase('quiz');
            }
        }
    }, [isLearnMode, currentCard, progress, answeredCards, originalLength, quizQueue, quizPos, isFinalReview, batchIndex, batches.length, appSettings.timerDuration]);

    // Handle answer selection
    const handleAnswerSelect = useCallback(
        (answer: string) => {
            if (selectedAnswer !== null) return // Prevent multiple selections

            setSelectedAnswer(answer)
            setIsTimerRunning(false)

            const correct = answer === currentCard.correctAnswer
            setIsCorrect(correct)

            // Calculate time taken to answer
            const timeToAnswer = Math.min(appSettings.timerDuration - timeLeft, appSettings.timerDuration)

            // Accumulate per-session stats for the end screen.
            sessionTimeSumRef.current += timeToAnswer
            sessionAnswerCountRef.current += 1
            if (!correct) sessionMissedIdsRef.current.add(currentCard.id)

            // Play the appropriate sound
            audioPlayer.play(correct ? 'correct' : 'incorrect')

            // Update difficulty data
            setKanjiDifficulties(prev => {
                const prevDifficulty = prev[currentCard.id] || {
                    progress: 0,
                    time_to_answer: 0,
                    total_misses: 0,
                    correct_answers: 0
                };

                const totalAttempts = prevDifficulty.total_misses + prevDifficulty.correct_answers;
                const newTimeToAnswer = totalAttempts === 0
                    ? timeToAnswer
                    : (prevDifficulty.time_to_answer * totalAttempts + timeToAnswer) / (totalAttempts + 1);

                const newProgress = correct ? Math.min((prevDifficulty.progress || 0) + 10, 100) : (prevDifficulty.progress || 0);

                return {
                    ...prev,
                    [currentCard.id]: {
                        progress: newProgress,
                        time_to_answer: newTimeToAnswer,
                        total_misses: prevDifficulty.total_misses + (correct ? 0 : 1),
                        correct_answers: prevDifficulty.correct_answers + (correct ? 1 : 0)
                    }
                }
            })

            // The mnemonic / example sentence now appears in the middle slot and
            // its audio plays, but we never auto-advance — show the feedback banner
            // and wait for the user to hit Continue / Space.
            const willShowSentence = appSettings.showPhrase && !!currentCard.example_sentence_japanese;
            if (willShowSentence && currentCard.sentence_audio_path && appSettings.audioAutoPlay) {
                try {
                    playAudio(currentCard.sentence_audio_path);
                } catch (error) {
                    console.error('🎵 Error playing audio, continuing anyway:', error);
                }
            }

            setAwaitingContinue(true);
        },
        [selectedAnswer, currentCard, timeLeft, appSettings.showPhrase, appSettings.audioAutoPlay, appSettings.timerDuration],
    );

    // Advance to the next card after the feedback banner. The result is already
    // recorded; correct advances as correct, wrong / timed out as a miss. Stops
    // any sentence audio still playing.
    const handleContinue = useCallback(() => {
        if (!awaitingContinue) return;
        if (phraseAudio) { try { (phraseAudio as AudioBufferSourceNode).stop(); } catch { /* already stopped */ } }
        setPhraseAudio(null);
        setAwaitingContinue(false);
        advanceQuiz(isCorrect === true);
    }, [awaitingContinue, phraseAudio, isCorrect, advanceQuiz]);

    // Helper function to handle redirect to results
    const handleRedirectToResults = useCallback(() => {
        const { section, practicedKanjiIds } = router.query;
        const practicedKanjiIdsString = flashcards.map(card => card.id).join(',');

        const params = new URLSearchParams({
            section: section as string,
            title: practicedKanjiIds ? 'Review Session Results' : 'Session Results',
            subtitle: practicedKanjiIds ? 'Results for this review session' : 'Results for this session',
            description: practicedKanjiIds ? 'These are the kanji you reviewed in this session.' : 'These are the kanji you practiced in this session.',
            practicedKanjiIds: practicedKanjiIdsString,
            showResultsButton: 'true'
        });

        router.push(`/kanji_session?${params.toString()}`);
    }, [router.query, flashcards]);

    // Handle quiz completion — show the animated end screen with stats, persist
    // progress, then let the auto-continue / skip handler navigate to results.
    useEffect(() => {
        if (isLearnMode) return;
        if (progress < 100) return;
        if (quizCompletedRef.current) return;
        quizCompletedRef.current = true;

        resumeAudioContext();
        audioPlayer.play('quizComplete');

        // Session score: first-try accuracy weighted with a speed bonus.
        const totalWords = originalLength;
        const missedCount = sessionMissedIdsRef.current.size;
        const correctCount = Math.max(0, totalWords - missedCount);
        const accuracyPct = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;
        const answerCount = sessionAnswerCountRef.current;
        const avgTime = answerCount > 0 ? sessionTimeSumRef.current / answerCount : 0;
        const speedFactor = appSettings.timerDuration > 0
            ? Math.max(0, Math.min(1, 1 - avgTime / appSettings.timerDuration))
            : 0;
        const score = Math.round(accuracyPct * 0.75 + speedFactor * 100 * 0.25);
        const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1;

        setEndStats({ score, stars, correctCount, missedCount, totalWords, accuracyPct, avgTime });
        setShowEndScreen(true);

        // Persist progress + statuses, then recompute fresh section mastery.
        (async () => {
            try {
                const response = await fetch('/api/progress/save-kanji', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ kanjiDifficulties })
                });
                if (!response.ok) throw new Error('Failed to save progress');
                await Promise.all(flashcards.map(async (card) => {
                    try {
                        await updateKanjiProgressStatus(card.id);
                    } catch (error) {
                        console.error(`Failed to update progress for kanji ${card.id}:`, error);
                    }
                }));
            } catch (error) {
                console.error('Failed to save quiz progress:', error);
            }

            // Fresh section mastery for the end screen. On failure we surface a
            // placeholder rather than fabricating numbers.
            try {
                const { section } = router.query;
                const { kanji } = await fetchAllKanji(section as string);
                const total = kanji.length;
                if (total <= 0) throw new Error('section has no trackable kanji');
                const mastered = kanji.filter(
                    (k: { progress_status?: string; marked_as?: string }) =>
                        (k.marked_as ?? k.progress_status) === 'mastered'
                ).length;
                // The ring shows the section's actual progress — the average
                // per-kanji progress (0..100) — matching the step path and the
                // homepage rings, not the mastered/total ratio which sits at 0%
                // until kanji are fully mastered.
                const { progress } = calculateStepProgressFromRecords(
                    total,
                    kanji as { progress?: number | null }[],
                    mastered
                );
                setSectionStats({
                    mastered,
                    total,
                    remaining: Math.max(0, total - mastered),
                    percent: progress
                });
            } catch (error) {
                console.error('Failed to load section mastery for end screen:', error);
                setSectionStatsError(true);
            }
        })();
    }, [progress, isLearnMode, originalLength, appSettings.timerDuration, kanjiDifficulties, flashcards, router.query]);

    // While the end screen is up, auto-continue to detailed results after a beat;
    // space (or the in-screen button) skips the wait.
    useEffect(() => {
        if (!showEndScreen) return;
        const timeout = setTimeout(() => handleRedirectToResults(), END_SCREEN_AUTO_CONTINUE_MS);
        const onKey = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                handleRedirectToResults();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('keydown', onKey);
        };
    }, [showEndScreen, handleRedirectToResults]);

    // Handle timeout - move to next card
    const handleTimeout = useCallback(() => {
        setIsTimerRunning(false)
        // A timeout counts as a miss; record it for the end-screen stats.
        if (currentCard) {
            sessionMissedIdsRef.current.add(currentCard.id)
            sessionTimeSumRef.current += appSettings.timerDuration
            sessionAnswerCountRef.current += 1
        }
        // A timeout is a miss; show the failure banner and wait for Continue.
        setIsCorrect(false)
        setAwaitingContinue(true)
    }, [currentCard, appSettings.timerDuration])

    // Add audio playback function using AudioContext
    const playAudio = useCallback((audioPath: string) => {
        console.log('🎵 Starting playAudio with path:', audioPath);
        
        // Create audio context for phrase
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Fetch and decode phrase audio data
        const audioUrl = getAudioUrl(audioPath);
        if (!audioUrl) {
            console.error('🎵 No audio URL resolved for path:', audioPath);
            audioContext.close();
            return;
        }

        fetch(audioUrl)
            .then(async response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch audio: ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(async buffer => {
                try {
                    const audioBuffer = await audioContext.decodeAudioData(buffer);
                    const gainNode = audioContext.createGain();
                    gainNode.gain.value = 1;
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    source.start();

                    // Store the source for cleanup
                    setPhraseAudio(source);

                    // Clean up when audio ends
                    source.onended = () => {
                        setPhraseAudio(null);
                        audioContext.close();
                    };
                } catch (error) {
                    console.error('🎵 Error playing audio:', error);
                    audioContext.close();
                }
            })
            .catch(error => {
                console.error('🎵 Error in audio playback:', error);
                audioContext.close();
            });
    }, []);

    // While the feedback banner is up, Space advances to the next card (same as
    // clicking Continue). The answer-key handler below bails out when
    // awaitingContinue so Space fires exactly once.
    useEffect(() => {
        if (!awaitingContinue) return;
        if (showStartScreen || showEndScreen || isKanjiSheetOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                handleContinue();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [awaitingContinue, showStartScreen, showEndScreen, isKanjiSheetOpen, handleContinue]);

    // Handle keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedAnswer !== null || phase !== 'quiz') return; // Only accept answers during the quiz phase
            if (awaitingContinue) return; // Banner is up — Space-to-continue owns the keyboard
            if (showStartScreen || showEndScreen || isKanjiSheetOpen) return; // Overlays own the keyboard

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
    }, [answers, handleAnswerSelect, selectedAnswer, awaitingContinue, phase, showStartScreen, showEndScreen, isKanjiSheetOpen]);

    // Get button color based on selection and correctness
    const getButtonColor = (answer: string) => {
        if (selectedAnswer !== answer) return "bg-[#2F2F2F] text-white border border-[#4F4F4F]"
        return isCorrect ? "bg-green-600 text-white" : "bg-red-600 text-white"
    }

    // Clean up audio when component unmounts
    useEffect(() => {
        return () => {
            if (phraseAudio) {
                try {
                    (phraseAudio as AudioBufferSourceNode).stop();
                } catch (e) {
                    console.log('Audio already stopped');
                }
            }
        }
    }, [phraseAudio])

    // Add wheel event handler
    useEffect(() => {
        const handleWheel = (e: Event) => {
            if (!isLearningPhase) return; // Only handle wheel in learning mode
            
            const wheelEvent = e as WheelEvent;
            e.preventDefault(); // Prevent page scrolling

            // Use deltaX for horizontal scrolling, or deltaY if shift key is pressed
            const scrollDelta = wheelEvent.shiftKey ? wheelEvent.deltaY : wheelEvent.deltaX;

            const batchLen = currentIntroCards.length;
            if (scrollDelta < 0) {
                // Scrolling left - go to previous card in this batch
                setIntroIndex(prev => Math.max(0, prev - 1));
            } else if (scrollDelta > 0) {
                // Scrolling right - go to next card in this batch
                setIntroIndex(prev => Math.min(batchLen - 1, prev + 1));
            }
        };

        // Add the event listener to the progress bar area
        const progressBar = document.querySelector('.progress-bar-area');
        if (progressBar) {
            progressBar.addEventListener('wheel', handleWheel as EventListener, { passive: false });
        }

        return () => {
            if (progressBar) {
                progressBar.removeEventListener('wheel', handleWheel as EventListener);
            }
        };
    }, [currentIntroCards.length, isLearningPhase]);

    // If every kanji in this batch has already been introduced, skip straight
    // to quizzing the full batch.
    useEffect(() => {
        if (phase !== 'intro' || isLearnMode || isFinalReview || !currentBatch) return;
        if (currentIntroCards.length === 0) {
            setQuizQueue(currentBatch);
            setQuizPos(0);
            setSelectedAnswer(null);
            setIsCorrect(null);
            setPhase('quiz');
        }
    }, [phase, isLearnMode, isFinalReview, currentBatch, currentIntroCards.length]);

    // In quiz mode the animated start screen stands in for the loading state, with
    // the session data loading behind it (handled in the main return below). Learn
    // mode keeps the plain loading text since it has no start screen.
    if (error) {
        return (
            <div className="min-h-screen bg-[#181818] flex items-center justify-center p-4">
                <div className="text-white text-2xl">{error}</div>
            </div>
        )
    }

    if (isLearnMode && isLoading) {
        return (
            <div className="min-h-screen bg-[#181818] flex items-center justify-center p-4">
                <LoadingState text="Loading your quiz" />
            </div>
        )
    }

    if (!isLoading && flashcards.length === 0) {
        return (
            <div className="min-h-screen bg-[#181818] flex items-center justify-center p-4">
                <LoadingState text="Preparing your cards" subText="Getting this quiz ready for you." />
            </div>
        )
    }

    // True once the session is interactive; the quiz chrome only renders then, so
    // it never flashes empty behind the start overlay during the background load.
    const dataReady = !isLoading && flashcards.length > 0;

    const onNext = () => {
        const batchLen = currentIntroCards.length;
        if (introIndex < batchLen - 1) {
            // Still browsing the current batch's intro cards.
            setIntroIndex(prev => prev + 1);
            return;
        }
        // Reached the end of this batch's intro.
        if (isLearnMode) {
            // Pure browse mode: wrap around, never quiz.
            setIntroIndex(0);
            return;
        }
        // Start quizzing the batch we just introduced.
        setQuizQueue(currentBatch ?? []);
        setQuizPos(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setPhase('quiz');
    }

    const onBack = () => {
        setIntroIndex(prev => Math.max(0, prev - 1));
    }

    const isFirstCard = introIndex === 0

    return (
        <div className="min-h-screen bg-[#181818] flex flex-col">
            <KanjiSheet
                isOpen={isKanjiSheetOpen}
                onClose={closeKanjiEntrySheet}
                kanji={selectedKanjiEntry}
            />
            {showStartScreen && <QuizStartScreen sectionLabel={sectionLabel} />}
            {showEndScreen && endStats && (
                <QuizEndScreen
                    stats={endStats}
                    mastery={sectionStats}
                    masteryError={sectionStatsError}
                    masteryScope="Section"
                    sectionLabel={sectionLabel}
                    autoContinueMs={END_SCREEN_AUTO_CONTINUE_MS}
                    onSeeResults={handleRedirectToResults}
                    onFinish={() => router.push('/')}
                />
            )}
            {/* min-h-0 on the flex item prevents the inner quiz content from growing
                this wrapper past the viewport, which would otherwise push the
                absolute-positioned answer block down with it. Only mounted once the
                session is ready so it never flashes empty behind the start overlay. */}
            {dataReady && (
            <div className="w-full p-2 sm:p-3 bg-[#181818] flex flex-col flex-1 min-h-0">
                {/* Header with controls */}
                <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
                    {!isLearningPhase && (
                        <button
                            className="bg-[#262626] border border-[#4F4F4F] text-white p-2 rounded-xl hover:bg-[#2F2F2F] transition-colors"
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                        >
                            <Pause className="h-5 w-5" />
                        </button>
                    )}
                    <button
                        className="bg-[#262626] border border-[#4F4F4F] text-white p-2 rounded-xl hover:bg-[#2F2F2F] transition-colors"
                        onClick={openSettings}
                    >
                        <Settings className="h-5 w-5" />
                    </button>
                    <button
                        className="bg-[#262626] border border-[#4F4F4F] text-white p-2 rounded-xl hover:bg-[#2F2F2F] transition-colors"
                        onClick={() => router.push('/')}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Main content */}
                {currentCard && (
                    isLearningPhase ? (
                        <QuizzCard
                            card={currentCard}
                            onNext={onNext}
                            onBack={onBack}
                            isFirstCard={isFirstCard}
                            compactPrimitives
                        />
                    ) : (
                        // The answer block is absolutely positioned at the bottom of this
                        // wrapper so it stays anchored regardless of what (mnemonic, example
                        // sentence, or nothing) is rendered in the middle. The kanji header
                        // and middle area live in normal flow above and reserve the answer
                        // block's measured height as bottom-padding so they never overlap.
                        // min-h-0 stops overflowing middle content from growing this wrapper.
                        <div className="relative bg-[#181818] flex-1 w-full pb-32 sm:pb-36 min-h-0 flex flex-col">
                            <div
                                className="flex-1 min-h-0 flex flex-col gap-4 sm:gap-6 text-center text-white overflow-hidden"
                                style={{ paddingBottom: answerBlockHeight ? `${answerBlockHeight}px` : undefined }}
                            >
                                {/* TOP slot: kanji header. 3-column grid keeps the main kanji
                                    horizontally centered regardless of whether the composed-of
                                    column has 0, 1, 2, or 3 entries. flex-shrink-0 keeps its
                                    intrinsic size fixed. */}
                                <div className="flex-shrink-0 grid grid-cols-[1fr_auto_1fr] items-center px-2 sm:px-8 mt-4 sm:mt-12">
                                    {/* Left column: composed-of kanji (right-aligned, reserved slot) */}
                                    <div className="flex justify-end pr-4 sm:pr-8 md:pr-12">
                                        <div className="flex flex-col gap-3 sm:gap-6 items-center">
                                            {currentCard.composed_of_kanji && (
                                                <div className="text-[2rem] sm:text-[3rem] md:text-[4rem] leading-none">{currentCard.composed_of_kanji}</div>
                                            )}
                                            {currentCard.composed_of_kanji_2 && (
                                                <div className="text-[2rem] sm:text-[3rem] md:text-[4rem] leading-none">{currentCard.composed_of_kanji_2}</div>
                                            )}
                                            {currentCard.composed_of_kanji_3 && (
                                                <div className="text-[2rem] sm:text-[3rem] md:text-[4rem] leading-none">{currentCard.composed_of_kanji_3}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Center column: main kanji — always in the exact same spot */}
                                    <button
                                        type="button"
                                        onClick={openKanjiEntrySheet}
                                        className="text-[6rem] sm:text-[9rem] md:text-[12rem] font-bold leading-none rounded-md transition-colors hover:text-[#FF0054] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0054] focus-visible:ring-offset-4 focus-visible:ring-offset-[#181818]"
                                        aria-label={`Open kanji details for ${currentCard.question}`}
                                        title={currentCard.question}
                                    >
                                        {currentCard.question}
                                    </button>

                                    {/* Right column: symmetric spacer so center column stays centered */}
                                    <div />
                                </div>

                                {/* MIDDLE slot: mnemonic + (optionally) example sentence shown
                                    after the user selects an answer. flex-1 min-h-0 absorbs
                                    leftover vertical space; overflow-y-auto keeps any long text
                                    contained inside this slot, so it can never push the kanji
                                    header up or the (absolute) answer block down. */}
                                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center gap-3 sm:gap-5 px-4 sm:px-8">
                                    {selectedAnswer !== null && currentCard.mnemonic && (
                                        <div className="text-sm sm:text-base md:text-lg text-[#A1A1A1] italic">
                                            {highlightMnemonic(currentCard.mnemonic, currentCard.correctAnswer)}
                                        </div>
                                    )}

                                    {selectedAnswer !== null && appSettings.showPhrase && currentCard.example_sentence_japanese && (
                                        <div className="text-2xl sm:text-4xl md:text-5xl break-words">
                                            {currentCard.example_sentence_japanese.split(currentCard.question).map((part, index, array) => (
                                                <React.Fragment key={index}>
                                                    {part}
                                                    {index < array.length - 1 && (
                                                        <span className="bg-[#FF0054] text-white px-2 py-1 rounded-md">{currentCard.question}</span>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* BOTTOM slot — absolutely positioned at the top of the wrapper’s
                                pb-32 sm:pb-36 padding (which itself clears the page-level fixed
                                progress bar). Its vertical position is independent of every
                                other element on the card: it does not move between cards or
                                between the question / post-answer steps, no matter how tall the
                                mnemonic or sentence above happens to be. The ref is observed by
                                a ResizeObserver so the content above reserves the same height
                                as bottom-padding and never overlaps. */}
                            {router.query.mode !== 'learn' && (
                                <div
                                    ref={answerBlockRef}
                                    className="absolute inset-x-0 bottom-32 sm:bottom-36 py-4 sm:py-6 border-t border-[#4F4F4F]/30 text-center text-white"
                                >
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto px-2 sm:px-8">
                                        {answers.map((answer, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleAnswerSelect(answer)}
                                                disabled={selectedAnswer !== null || awaitingContinue}
                                                className={`${selectedAnswer === answer
                                                        ? isCorrect
                                                            ? "bg-green-600"
                                                            : "bg-red-600"
                                                        : "bg-[#262626] border border-[#4F4F4F] hover:bg-[#2F2F2F]"
                                                    } text-white p-3 sm:p-4 md:p-6 rounded-xl text-center text-lg sm:text-xl md:text-3xl w-full transition-colors duration-300 disabled:cursor-not-allowed`}
                                            >
                                                {answer} <span className="text-xs sm:text-sm md:text-base ml-2 opacity-70 hidden sm:inline">(Press {index + 1})</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Once answered, the feedback banner replaces the timer in
                                        the same slot; the user advances via Continue / Space. */}
                                    {awaitingContinue ? (
                                        <div className="mt-4 sm:mt-8 max-w-4xl mx-auto px-2 sm:px-8">
                                            <QuizFeedbackBanner
                                                status={isCorrect === true ? 'correct' : 'incorrect'}
                                                correctSolution={currentCard.correctAnswer}
                                                onContinue={handleContinue}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-3 sm:h-4 bg-[#262626] border border-[#4F4F4F] rounded-full w-full sm:w-3/4 mx-auto overflow-hidden mt-4 sm:mt-8">
                                            <div
                                                className="h-full bg-[#FF0054] transition-all duration-100 ease-linear"
                                                style={{ width: `${(timeLeft / appSettings.timerDuration) * 100}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                )}
                <div className="fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom))] md:bottom-0 left-0 md:left-16 right-0 px-3 sm:px-8 py-3 sm:py-0 sm:h-32 bg-[#181818] flex items-center border-t md:border-t-0 border-[#4F4F4F] z-20">
                    <div className="flex items-center justify-between w-full gap-2 sm:gap-6">
                        {isLearningPhase && !isFirstCard && (
                            <button
                                onClick={onBack}
                                className="bg-[#262626] border border-[#4F4F4F] text-white px-3 sm:px-6 py-2 rounded-xl hover:bg-[#2F2F2F] transition-colors text-sm sm:text-base shrink-0"
                            >
                                ← <span className="hidden sm:inline">Back</span>
                            </button>
                        )}
                        {isLearningPhase && (
                            <div className="flex-1 bg-[#262626] border border-[#4F4F4F] rounded-xl h-10 sm:h-12 flex items-center px-3 sm:px-4 progress-bar-area min-w-0" style={{ cursor: 'ew-resize' }}>
                                <span className="text-white mr-2 text-sm sm:text-base hidden sm:inline">
                                    {isLearnMode ? 'Learning' : `Intro · batch ${batchIndex + 1}/${batches.length}`}
                                </span>
                                <div className="flex-1 h-2 sm:h-3 bg-[#2F2F2F] rounded-full">
                                    <div
                                        className="h-full bg-[#4F4F4F] rounded-full transition-all duration-300"
                                        style={{ width: `${((introIndex + 1) * 100) / (currentIntroCards.length || 1)}%` }}
                                    />
                                </div>
                                <span className="text-white ml-3 sm:ml-4 text-sm sm:text-base">
                                    {`${introIndex + 1}/${currentIntroCards.length}`}
                                </span>
                            </div>
                        )}
                        {isLearningPhase && (
                            <button
                                onClick={onNext}
                                className="bg-[#262626] border border-[#4F4F4F] text-white px-3 sm:px-6 py-2 rounded-xl hover:bg-[#2F2F2F] transition-colors text-sm sm:text-base shrink-0"
                            >
                                <span className="hidden sm:inline">{introIndex < currentIntroCards.length - 1 ? 'Next' : (isLearnMode ? 'Next' : 'Start quiz')}</span> →
                            </button>
                        )}
                    </div>
                </div>
            </div>
            )}
        </div>
    )
}
