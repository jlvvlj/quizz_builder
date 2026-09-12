"use client"

import React from 'react'
import LoadingState from '@/components/LoadingState'
import { useState, useEffect, useCallback, useRef } from "react"
import { Pause, Play, Settings, X } from "lucide-react"
import { useRouter } from 'next/router'
import { fetchSupabaseSessionCards, fetchAllCards, prefetchSessionCardsByIds, fetchKanjiFreqSessionCards, prefetchKanjiFreqCardsByIds, fetchTubelexSessionCards, prefetchTubelexCardsByIds, fetchKanjiPrimitiveSessionCards, prefetchKanjiPrimitiveCardsByIds, fetchKanjiByCharacter } from '@/utils/supabase-client'
import { audioPlayer, correctVariantForCardIndex, playCorrectChime, preloadKeyboardSound, DEFAULT_KEYBOARD_SOUND } from "@/utils/audio"
import { playAudio, preloadAudio, resumeAudioContext } from "@/utils/audioCache"
import { getAudioUrl, getEnglishAudioUrl } from "@/utils/audioUrl"
import { FuriganaText } from '@/utils/furigana'
import { useSettingsModal } from '@/components/layout/SettingsContext'
import TypingAnswer from '@/components/TypingAnswer'
import EnglishTypingAnswer from '@/components/EnglishTypingAnswer'
import { hasHiragana, isKanaOnly, katakanaToHiragana } from '@/utils/romaji'

type TypingLang = 'japanese' | 'english' | 'mix'
import type { SessionWord as SupabaseSessionWord, SupabaseCard } from '@/utils/supabase-client'
import {
    QuizStartScreen,
    QuizEndScreen,
    type QuizEndStats,
    type MasteryStats,
} from '@/components/quiz/QuizTransitionScreens'
import { SaveErrorScreen } from '@/components/quiz/SaveErrorScreen'
import { QuizFeedbackBanner } from '@/components/quiz/QuizFeedbackBanner'
import KanjiSheet from '@/components/KanjiSheet'
import { KanjiMnemonic, type PrimitiveHint } from '@/components/KanjiMnemonic'

const END_SCREEN_AUTO_CONTINUE_MS = 9000

function shuffleQuizCards(cards: QuizCard[]): QuizCard[] {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

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
    kanjiEntryId?: number;
    kanjiEntryCharacter?: string;
    mnemonic?: string;
    composed_of_kanji?: string;
    composed_of_kanji_description?: string;
    composed_of_kanji_2?: string;
    composed_of_kanji_description_2?: string;
    composed_of_kanji_3?: string;
    composed_of_kanji_description_3?: string;
    reading?: string;
    // Frequency kanji quiz: all accepted taught readings (hiragana). When a
    // kanji has more than one, the Japanese-typing card shows one row per
    // reading and accepts any. Absent / single-element for the words quiz.
    readingAlternatives?: string[];
    // Frequency kanji quiz: valid sibling readings for the same bare kanji.
    // The intro still teaches `reading` only, but quiz answers accept any of
    // these because the prompt has no contextual word to disambiguate.
    acceptedReadings?: string[];
    correctAnswer: string;
    acceptedAnswers?: string[];
    // The English meaning, preserved even when the options are switched to readings
    // (Japanese option mode), so the forward MC prompt can show it. Set by
    // applyMcOptionLang.
    meaning?: string;
    wrongAnswers: string[];
    wrongAnswer1: string;
    wrongAnswer2: string;
    // Hiragana readings of the same wrong-answer cards, parallel to wrongAnswers.
    // Used to rebuild the multiple-choice options as readings when the forward
    // quiz's option language is "Japanese" (or per-word "Mix").
    wrongReadings?: string[];
    // Which language the multiple-choice options ended up in for this card, after
    // applying the session's option-language choice. 'english' = translations
    // (default), 'japanese' = hiragana readings. Drives the answer-side audio.
    optionLang?: 'japanese' | 'english';
    audioPath?: string;
    englishAudioPath?: string;
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
    playCorrectAnswerAudio: boolean;
    sessionSize?: number;
    quizDirection?: 'forward' | 'reverse';
    showFurigana?: boolean;
    timerDuration: number;
    answerChoices: number;
    quizMode?: 'multiple-choice' | 'typing';
    keyboardSound?: string;
}

function toKanjiSheetCard(kanjiData: any) {
    return {
        question: kanjiData.japanese_word,
        correctAnswer: kanjiData.english,
        mnemonic: kanjiData.mnemonic,
        composed_of_kanji: kanjiData.composed_of_kanji_1,
        composed_of_kanji_description: kanjiData.composed_of_kanji_description_1,
        composed_of_kanji_2: kanjiData.composed_of_kanji_2,
        composed_of_kanji_description_2: kanjiData.composed_of_kanji_description_2,
        composed_of_kanji_3: kanjiData.composed_of_kanji_3,
        composed_of_kanji_description_3: kanjiData.composed_of_kanji_description_3,
        used_in_kanji_kanji: kanjiData.used_in_kanji_kanji,
        used_in_kanji_meaning: kanjiData.used_in_kanji_meaning,
        used_in_kanji_kanji_2: kanjiData.used_in_kanji_kanji_2,
        used_in_kanji_meaning_2: kanjiData.used_in_kanji_meaning_2,
        used_in_kanji_kanji_3: kanjiData.used_in_kanji_kanji_3,
        used_in_kanji_meaning_3: kanjiData.used_in_kanji_meaning_3,
        used_in_word: kanjiData.used_in_word,
        used_in_word_reading: kanjiData.used_in_word_reading,
        used_in_word_meaning: kanjiData.used_in_word_meaning,
        used_in_word_2: kanjiData.used_in_word_2,
        used_in_word_reading_2: kanjiData.used_in_word_reading_2,
        used_in_word_meaning_2: kanjiData.used_in_word_meaning_2,
        used_in_word_3: kanjiData.used_in_word_3,
        used_in_word_reading_3: kanjiData.used_in_word_reading_3,
        used_in_word_meaning_3: kanjiData.used_in_word_meaning_3,
        example_sentence_japanese: kanjiData.example_sentence_japanese,
        example_sentence_english: kanjiData.example_sentence_english,
        sentence_audio_path: kanjiData.sentence_audio_path,
        example_sentence_japanese_2: kanjiData.example_sentence_japanese_2,
        example_sentence_english_2: kanjiData.example_sentence_english_2,
        sentence_audio_path_2: kanjiData.sentence_audio_path_2,
        example_sentence_japanese_3: kanjiData.example_sentence_japanese_3,
        example_sentence_english_3: kanjiData.example_sentence_english_3,
        sentence_audio_path_3: kanjiData.sentence_audio_path_3,
        japanese_reading_1: kanjiData.japanese_reading_1,
        japanese_reading_2: kanjiData.japanese_reading_2,
        japanese_reading_3: kanjiData.japanese_reading_3,
        word_reading: kanjiData.word_reading,
        word_reading_2: kanjiData.word_reading_2,
        word_reading_3: kanjiData.word_reading_3,
    };
}

// Rebuild a forward multiple-choice card's options in the chosen language. The
// session's option language (Type-Japanese / Type-English / Mix, set on the
// session page and stored client-side) mirrors the typing quiz: 'english' keeps
// the English meaning (the default), 'japanese' swaps every option to its reading
// (a word's hiragana, a kanji's on'yomi), and 'mix' decides per word by id parity
// — exactly the scheme the typing card uses (see typingPlan). The forward MC
// prompt mirrors the option language: English options pair with a reading prompt,
// Japanese (reading) options pair with the English-meaning prompt (see meaning).
// Reverse mode never calls this.
function applyMcOptionLang(cards: QuizCard[], lang: TypingLang): QuizCard[] {
    if (lang === 'english') return cards;
    return cards.map(card => {
        const eff: 'japanese' | 'english' =
            lang === 'mix' ? (card.id % 2 === 0 ? 'japanese' : 'english') : 'japanese';
        if (eff === 'english') return { ...card, optionLang: 'english' as const };
        // Need the correct card's reading and the wrong cards' readings to build a
        // full reading-only option set. All words carry a reading, so this holds;
        // if a card is missing reading data we keep its English options rather than
        // render a half-Japanese, half-English choice list.
        const wrongReadings = card.wrongReadings?.filter(Boolean) ?? [];
        if (!card.reading || wrongReadings.length < card.wrongAnswers.length) {
            return { ...card, optionLang: 'english' as const };
        }
        return {
            ...card,
            // Options become readings, so stash the English meaning for the prompt
            // (Japanese option mode shows the meaning as the question).
            meaning: card.correctAnswer,
            correctAnswer: card.reading,
            acceptedAnswers: card.acceptedReadings?.length ? card.acceptedReadings : [card.reading],
            wrongAnswers: wrongReadings,
            wrongAnswer1: wrongReadings[0],
            wrongAnswer2: wrongReadings[1],
            optionLang: 'japanese' as const,
        };
    });
}

export default function FlashcardApp() {
    const router = useRouter()
    // `flashcards` holds the unique cards for the session, one per word, in order.
    const [flashcards, setFlashcards] = useState<QuizCard[]>([])
    const [originalLength, setOriginalLength] = useState(0)
    const [progress, setProgress] = useState(0)

    // The session is introduced and quizzed in batches of this many words:
    // intro 5 → quiz 5 → intro the next 5 → quiz them → … with any missed
    // words collected into a final review round at the very end.
    const BATCH_SIZE = 5
    const [phase, setPhase] = useState<'intro' | 'quiz'>('intro')
    const [batchIndex, setBatchIndex] = useState(0)   // which batch we're introducing/quizzing
    const [introIndex, setIntroIndex] = useState(0)   // position while browsing a batch's intro cards
    const [quizQueue, setQuizQueue] = useState<QuizCard[]>([]) // cards being quizzed in the current segment
    const [quizPos, setQuizPos] = useState(0)         // position within quizQueue
    const finalReviewRef = useRef<QuizCard[]>([])     // cards missed during batch quizzes, tested at the end
    // Words the user has already been introduced to (any quiz type); the intro
    // phase skips these so each word is taught only once, ever.
    const [introducedIds, setIntroducedIds] = useState<Set<number>>(new Set())

    const [timeLeft, setTimeLeft] = useState(3)
    const [isTimerRunning, setIsTimerRunning] = useState(true)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    // Typing cards only: the user pressed "show answer" — the reading is revealed
    // in the slots, the card is counted as a miss, and we wait for the user to
    // advance (Space / Next) rather than moving on automatically.
    const [revealed, setRevealed] = useState(false)
    // After an answer (correct, wrong, revealed, or timed out) the quiz shows the
    // feedback banner and waits — it advances only when the user hits Continue /
    // Space, never automatically.
    const [awaitingContinue, setAwaitingContinue] = useState(false)
    const [answeredCards, setAnsweredCards] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const { openSettings } = useSettingsModal()
    const [showingPhrase, setShowingPhrase] = useState(false)
    const [appSettings, setAppSettings] = useState<AppSettings>({
        showPhrase: false,
        audioAutoPlay: true,
        playCorrectAnswerAudio: false,
        timerDuration: 3,
        answerChoices: 3
    })
    const [wordAudio, setWordAudio] = useState<AudioBufferSourceNode | null>(null)
    const [phraseAudio, setPhraseAudio] = useState<AudioBufferSourceNode | null>(null)
    const [isPaused, setIsPaused] = useState(false)
    // What the user types in typing mode: the Japanese reading, the English
    // translation, or a per-word mix of both. Toggled live via a pill on the
    // session; persisted client-side. Has no bearing on progress — any correct
    // completion counts the same.
    const [typingLang, setTypingLang] = useState<TypingLang>('english')
    const quizStartedRef = useRef(false)
    const quizCompletedRef = useRef(false)

    // Add state for tracking word difficulties
    const [wordDifficulties, setWordDifficulties] = useState<WordDifficulty>({})

    // Animated start / end transition screens
    const [showStartScreen, setShowStartScreen] = useState(false)
    const [showEndScreen, setShowEndScreen] = useState(false)
    const [endStats, setEndStats] = useState<QuizEndStats | null>(null)
    const [stepStats, setStepStats] = useState<MasteryStats | null>(null)
    const [stepStatsError, setStepStatsError] = useState(false)
    // The detailed-results URL, computed once progress is saved; the end screen
    // auto-continues there (or the user skips with space / a button).
    const [resultsHref, setResultsHref] = useState<string | null>(null)
    const [selectedKanjiEntry, setSelectedKanjiEntry] = useState<any | null>(null)
    const [isKanjiSheetOpen, setIsKanjiSheetOpen] = useState(false)
    const kanjiEntryCacheRef = useRef<Map<string, any | null>>(new Map())
    const wasPausedBeforeKanjiSheetRef = useRef(false)

    // Per-session accumulators, read only when the session ends. Kept in refs so
    // updating them mid-quiz never triggers a re-render.
    const sessionMissedIdsRef = useRef<Set<number>>(new Set())
    const sessionTimeSumRef = useRef(0)
    const sessionAnswerCountRef = useRef(0)
    // Timestamps so the start / end screens hold for a minimum beat even when
    // their background work (loading / saving) finishes almost instantly.
    const startShownAtRef = useRef(0)
    // Set when the user presses space before the data is ready, so the early
    // press is honored (quiz starts the instant cards arrive) instead of dropped.
    const startRequestedRef = useRef(false)
    // Timestamp the moment the data became ready, so the auto-start beat is
    // measured from readiness — guaranteeing a window in which Space can start.
    const readyAtRef = useRef(0)
    const endShownAtRef = useRef(0)

    const sectionLabel = (() => {
        const s = router.query.section
        if (typeof s !== 'string') return undefined
        const n = s.split('_').pop()
        return n && /^\d+$/.test(n) ? `Section ${n}` : undefined
    })()

    // Which deck this session is for. 'kanji_freq' swaps the data source (kanji
    // by frequency + kanji_freq_progress) while reusing the whole quiz engine;
    // anything else (default) is the words quiz, byte-for-byte unchanged.
    const isKanji = router.query.content === 'kanji_freq'
    // TUBELEX-reordered words quiz: same engine, data source is core_tubelex_ranked
    // (ordered by tubelex_rank) + words_tubelex_progress. Purely additive.
    const isTubelex = router.query.content === 'words_tubelex'
    // Sentences quiz: same engine, but the prompt is a full example sentence and
    // the user types its reading. Drives the smaller fonts and the unit label.
    const isSentences = router.query.content === 'sentences'
    const isPrimitives = router.query.content === 'kanji_primitives'

    // Load flashcards from API
    useEffect(() => {
        const loadFlashcards = async () => {
            try {
                setIsLoading(true)
                
                const { section, step, practicedWordIds } = router.query;
                // The sentences quiz reuses this whole engine; it differs only in
                // content (type the example sentence's reading, no audio). It always
                // runs as a forward Japanese typing quiz.
                const isSentences = router.query.content === 'sentences';
                const content: 'words' | 'sentences' = isSentences ? 'sentences' : 'words';
                // Per-type progress: typing and multiple-choice select + read their
                // own progress dimension independently. Sentences share the 'typing'
                // dimension (they are typing practice on the same words).
                const quizType = (isSentences || appSettings.quizMode === 'typing') ? 'typing' : 'multiple_choice';

                console.log('Loading quiz with section:', section, 'step:', step, 'quizType:', quizType);
                console.log('Using session size:', appSettings.sessionSize);

                let sessionWords: SupabaseSessionWord[] = [], quizCards: QuizCard[] = [];

                if (isPrimitives) {
                    const numWrong = Math.max(1, appSettings.answerChoices - 1);
                    let primitiveIds = practicedWordIds && typeof practicedWordIds === 'string'
                        ? practicedWordIds.split(',').map((id: string) => parseInt(id))
                        : undefined;
                    if (!primitiveIds) {
                        const progressResponse = await fetch(`/api/progress/last-kanji-primitives?sessionSize=${appSettings.sessionSize}&quizType=${quizType}`, {
                            credentials: 'include'
                        });
                        if (!progressResponse.ok) throw new Error('Failed to get next primitives');
                        const { wordIds } = await progressResponse.json();
                        primitiveIds = wordIds;
                    }
                    const result = await fetchKanjiPrimitiveSessionCards(primitiveIds, numWrong, appSettings.sessionSize, quizType);
                    sessionWords = result.sessionWords as unknown as SupabaseSessionWord[];
                    quizCards = shuffleQuizCards(result.quizCards as unknown as QuizCard[]);
                } else if (isKanji) {
                    // Frequency kanji quiz: the kanji ids come from the practiced
                    // list (results re-entry) or from the per-type next-kanji
                    // endpoint; the cards (incl. on'yomi reading alternatives) are
                    // built by fetchKanjiFreqSessionCards in the exact shape the
                    // engine consumes. Reverse direction / per-question wrong-count
                    // mirror the words quiz.
                    const numWrong = Math.max(1, appSettings.answerChoices - 1);
                    let kanjiIds: number[];
                    if (practicedWordIds && typeof practicedWordIds === 'string') {
                        kanjiIds = practicedWordIds.split(',').map((id: string) => parseInt(id));
                    } else {
                        if (!step) throw new Error('Missing step parameter for regular quiz');
                        const progressResponse = await fetch(`/api/progress/last-kanji-freq?section=${section}&step=${step}&sessionSize=${appSettings.sessionSize}&quizType=${quizType}`, {
                            credentials: 'include'
                        });
                        if (!progressResponse.ok) throw new Error('Failed to get next kanji');
                        const { wordIds } = await progressResponse.json();
                        kanjiIds = wordIds;
                    }
                    const result = await fetchKanjiFreqSessionCards(kanjiIds, quizType, numWrong);
                    sessionWords = result.sessionWords as unknown as SupabaseSessionWord[];
                    quizCards = result.quizCards as unknown as QuizCard[];
                } else if (isTubelex) {
                    // TUBELEX words quiz: word ids from the practiced list or the
                    // per-type next-word endpoint; cards built by
                    // fetchTubelexSessionCards in the same shape the engine consumes.
                    const numWrong = Math.max(1, appSettings.answerChoices - 1);
                    let tubelexIds: number[];
                    if (practicedWordIds && typeof practicedWordIds === 'string') {
                        tubelexIds = practicedWordIds.split(',').map((id: string) => parseInt(id));
                    } else {
                        if (!step) throw new Error('Missing step parameter for regular quiz');
                        const progressResponse = await fetch(`/api/progress/last-words-tubelex?section=${section}&step=${step}&sessionSize=${appSettings.sessionSize}&quizType=${quizType}`, {
                            credentials: 'include'
                        });
                        if (!progressResponse.ok) throw new Error('Failed to get next word');
                        const { wordIds } = await progressResponse.json();
                        tubelexIds = wordIds;
                    }
                    const result = await fetchTubelexSessionCards(tubelexIds, quizType, numWrong);
                    sessionWords = result.sessionWords as unknown as SupabaseSessionWord[];
                    quizCards = result.quizCards as unknown as QuizCard[];
                } else if (practicedWordIds && typeof practicedWordIds === 'string') {
                    // If we have practiced word IDs, fetch those specific words directly by ID
                    console.log('Fetching practiced words:', practicedWordIds);
                    const wordIds = practicedWordIds.split(',').map((id: string) => parseInt(id));

                    // Use fetchSupabaseSessionCards with wordIds to fetch directly by ID
                    const numWrong = Math.max(1, appSettings.answerChoices - 1);
                    const result = await fetchSupabaseSessionCards(
                        wordIds.length,
                        section as string,
                        step as string,
                        undefined,
                        wordIds,
                        numWrong,
                        quizType,
                        content
                    );

                    sessionWords = result.sessionWords;

                    // Sentences come back ready-built (typing-only, filtered to words
                    // with a stored reading); the word quiz remaps per direction below.
                    if (isSentences) {
                        quizCards = result.quizCards;
                    } else {
                    // Transform cards to quiz cards
                    const isReverse = appSettings.quizDirection === 'reverse';
                    quizCards = sessionWords.map((card: SupabaseSessionWord & { japanese_reading?: string; word_audio_path?: string | null; english_audio_path?: string | null }) => {
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
                        // Readings of the same wrong cards, for the Japanese option
                        // language (forward only).
                        const wrongReadings = wrongCards
                            .map(w => (w as { japanese_reading?: string }).japanese_reading)
                            .filter((s): s is string => !!s);

                        // Swap question/answer based on quiz direction
                        return {
                            id: card.id,
                            question: isReverse ? card.english : card.japanese_word,
                            reading: isReverse ? undefined : card.japanese_reading,
                            correctAnswer: isReverse ? card.japanese_word : card.english,
                            wrongAnswers,
                            wrongAnswer1: wrongAnswers[0],
                            wrongAnswer2: wrongAnswers[1],
                            wrongReadings,
                            audioPath: getAudioUrl(card.word_audio_path),
                            englishAudioPath: getEnglishAudioUrl(card.english_audio_path),
                            phrase: undefined,
                            isReview: card.isReview || false,
                            progress: card.progress || 0,
                            timeToAnswer: card.timeToAnswer || 0,
                            totalMisses: card.totalMisses || 0,
                            correctAnswers: card.correctAnswers || 0
                        };
                    });
                    }
                } else {
                    // For regular quiz, we need both section and step
                    if (!step) {
                        throw new Error('Missing step parameter for regular quiz');
                    }

                    // Get the next unviewed words for this session
                    console.log('Fetching next unviewed words...');
                    const progressResponse = await fetch(`/api/progress/last-word?section=${section}&step=${step}&sessionSize=${appSettings.sessionSize}&quizType=${quizType}`, {
                        credentials: 'include'
                    });
                    if (!progressResponse.ok) {
                        throw new Error('Failed to get next words');
                    }
                    const { wordIds, isReview } = await progressResponse.json();
                    console.log('Next word IDs for session:', wordIds);
                    console.log('Is review session:', isReview);
                    
                    const numWrong = Math.max(1, appSettings.answerChoices - 1);
                    const result = await fetchSupabaseSessionCards(
                        appSettings.sessionSize,
                        section as string,
                        step as string,
                        undefined, // No longer using startId
                        wordIds, // Pass the specific word IDs to fetch
                        numWrong,
                        quizType,
                        content
                    );
                    sessionWords = result.sessionWords;

                    // Transform quiz cards based on quiz direction
                    const isReverse = appSettings.quizDirection === 'reverse';
                    if (isSentences) {
                        // Already built typing-only and filtered to words with a reading.
                        quizCards = result.quizCards;
                    } else if (isReverse && result.quizCards) {
                        // Swap question/answer for reverse mode
                        quizCards = result.quizCards.map((card: QuizCard, index: number) => {
                            const originalCard = sessionWords[index];
                            // Find random cards for wrong answers
                            const wrongCards: typeof sessionWords[0][] = [];
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
                                .map(w => w.japanese_word)
                                .filter((s): s is string => !!s);
                            return {
                                ...card,
                                question: originalCard?.english || card.correctAnswer,
                                reading: undefined, // No reading for reverse mode
                                correctAnswer: originalCard?.japanese_word || card.question,
                                wrongAnswers,
                                wrongAnswer1: wrongAnswers[0] || card.wrongAnswer1,
                                wrongAnswer2: wrongAnswers[1] || card.wrongAnswer2
                            };
                        });
                    } else {
                        quizCards = result.quizCards;
                    }
                }

                // Forward multiple-choice quiz (words or kanji): apply the session's
                // option language (Japanese readings / English meanings / per-word
                // mix), mirroring the typing quiz. Stored client-side alongside
                // quizMode; reverse mode and the sentences quiz keep their built-in
                // option set.
                if (!isPrimitives
                    && !isSentences
                    && appSettings.quizMode === 'multiple-choice'
                    && appSettings.quizDirection !== 'reverse') {
                    const storedLang = typeof window !== 'undefined'
                        ? window.localStorage.getItem('typingLang')
                        : null;
                    const optionLang: TypingLang =
                        'english';
                    quizCards = applyMcOptionLang(quizCards, optionLang);
                }

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

                // Which of these words the user has already been introduced to
                // (any quiz type). The intro phase skips these so a word is only
                // taught once, ever. Failure surfaces rather than silently
                // re-introducing or hiding everything (no silent fallback).
                const ids = quizCards.map(c => c.id);
                const introUrl = isPrimitives
                    ? `/api/progress/introduced-kanji-primitives?cardIds=${ids.join(',')}&quizType=${quizType}`
                    : isKanji
                    ? `/api/progress/introduced-kanji-freq?cardIds=${ids.join(',')}&quizType=${quizType}`
                    : isTubelex
                    ? `/api/progress/introduced-words-tubelex?cardIds=${ids.join(',')}&quizType=${quizType}`
                    : `/api/progress/introduced?cardIds=${ids.join(',')}&quizType=${quizType}`;
                const introRes = await fetch(introUrl, { credentials: 'include' });
                if (!introRes.ok) throw new Error(`Failed to check introduced cards (${introRes.status})`);
                const { introducedIds: introducedList } = await introRes.json() as { introducedIds: number[] };
                setIntroducedIds(new Set(introducedList));

                setWordDifficulties(initialWordDifficulties);
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
    }, [router.isReady, router.query, appSettings.sessionSize, appSettings.quizDirection, appSettings.answerChoices, appSettings.quizMode, isPrimitives, isKanji, isTubelex, isSentences]);

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
                // The sentences quiz is always a forward Japanese typing quiz with no
                // furigana (the reading is what you type from memory), regardless of
                // the user's saved word-quiz preferences.
                const isSentences = typeof window !== 'undefined'
                    && new URLSearchParams(window.location.search).get('content') === 'sentences';
                // quizMode and keyboardSound are stored client-side (no DB column yet).
                let quizMode: 'multiple-choice' | 'typing' = 'multiple-choice';
                let keyboardSound = DEFAULT_KEYBOARD_SOUND;
                if (typeof window !== 'undefined') {
                    const stored = window.localStorage.getItem('quizMode');
                    if (stored === 'typing' || stored === 'multiple-choice') quizMode = stored;
                    const storedLang = window.localStorage.getItem('typingLang');
                    if (storedLang === 'japanese' || storedLang === 'english' || storedLang === 'mix') {
                        setTypingLang('english');
                    }
                    const ks = window.localStorage.getItem('keyboardSound');
                    if (ks) keyboardSound = ks;
                }
                if (isSentences) {
                    quizMode = 'typing';
                    setTypingLang('japanese');
                }
                // Set all settings from database, using defaults only if values are missing
                setAppSettings({
                    showPhrase: data.showPhrase ?? false,
                    audioAutoPlay: data.audioAutoPlay ?? true,
                    playCorrectAnswerAudio: data.playCorrectAnswerAudio ?? false,
                    sessionSize: data.sessionSize,
                    quizDirection: isSentences ? 'forward' : (data.quizDirection ?? 'forward'),
                    showFurigana: isSentences ? false : (data.showFurigana ?? false),
                    timerDuration: data.timerDuration ?? 3,
                    answerChoices: data.answerChoices ?? 3,
                    quizMode,
                    keyboardSound
                });
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
        loadSettings();
    }, [])

    // Warm the chosen keystroke-sound pack so the first key in typing mode is
    // instant (we don't preload the whole ~5 MB sound library on load).
    useEffect(() => {
        if (appSettings.quizMode === 'typing' && appSettings.keyboardSound) {
            preloadKeyboardSound(appSettings.keyboardSound);
        }
    }, [appSettings.quizMode, appSettings.keyboardSound])

    // Chunk the session into batches of BATCH_SIZE.
    const batches = React.useMemo<QuizCard[][]>(() => {
        if (flashcards.length === 0) return [];
        const out: QuizCard[][] = [];
        for (let i = 0; i < flashcards.length; i += BATCH_SIZE) {
            out.push(flashcards.slice(i, i + BATCH_SIZE));
        }
        return out;
    }, [flashcards]);

    // batchIndex === batches.length is the sentinel for the final review round.
    const isFinalReview = batchIndex >= batches.length;
    const currentBatch = batches[batchIndex];
    // Only the never-introduced words in this batch get an intro; words the user
    // has already met are quizzed without being re-taught.
    const currentIntroCards = React.useMemo(
        () => (currentBatch ?? []).filter(c => !introducedIds.has(c.id)),
        [currentBatch, introducedIds],
    );
    const isLearningPhase = phase === 'intro';
    const currentCard = isLearningPhase
        ? currentIntroCards[introIndex]
        : quizQueue[quizPos];

    const closeKanjiSheet = useCallback(() => {
        setIsKanjiSheetOpen(false);
        setSelectedKanjiEntry(null);
        setIsPaused(wasPausedBeforeKanjiSheetRef.current);
    }, []);

    const openKanjiSheetForCurrentCard = useCallback(async () => {
        const character = currentCard?.kanjiEntryCharacter;
        if (!character) return;

        wasPausedBeforeKanjiSheetRef.current = isPaused;
        setIsPaused(true);

        if (kanjiEntryCacheRef.current.has(character)) {
            const cached = kanjiEntryCacheRef.current.get(character);
            if (cached) {
                setSelectedKanjiEntry(cached);
                setIsKanjiSheetOpen(true);
            } else {
                setIsPaused(wasPausedBeforeKanjiSheetRef.current);
            }
            return;
        }

        const { kanji } = await fetchKanjiByCharacter(character);
        if (!kanji) {
            kanjiEntryCacheRef.current.set(character, null);
            setIsPaused(wasPausedBeforeKanjiSheetRef.current);
            return;
        }

        const sheetCard = toKanjiSheetCard(kanji);
        kanjiEntryCacheRef.current.set(character, sheetCard);
        setSelectedKanjiEntry(sheetCard);
        setIsKanjiSheetOpen(true);
    }, [currentCard?.kanjiEntryCharacter, isPaused]);

    // Hiragana target(s) for Japanese typing, when this card has any. A words
    // card has exactly one (its reading); a bare-kanji card can accept sibling
    // taught readings for the same kanji because the prompt has no word context.
    // Empty when the question is kanji without a typeable reading.
    const kanaTypingTargets: string[] = (() => {
        if (!currentCard) return [];
        const alts = currentCard.acceptedReadings?.length
            ? currentCard.acceptedReadings
            : (currentCard.readingAlternatives && currentCard.readingAlternatives.length > 0)
                ? currentCard.readingAlternatives
                : (currentCard.reading ? [currentCard.reading] : []);
        const hira = alts.filter(r => !!r && hasHiragana(r)).map(r => katakanaToHiragana(r));
        if (hira.length > 0) return Array.from(new Set(hira));
        if (currentCard.question && isKanaOnly(currentCard.question)) {
            return [katakanaToHiragana(currentCard.question)];
        }
        return [];
    })();
    const kanaTypingTarget: string | null = kanaTypingTargets[0] ?? null;

    // Resolve what the user types on this card given the session typing language.
    // Typing applies only forward (Japanese question shown). For 'mix' the choice
    // is deterministic per word so it doesn't flip on re-render; a word with no
    // kana target falls to English typing rather than dropping to multiple choice.
    const typingPlan: { kind: 'japanese' | 'english'; target: string; targets?: string[] } | null = (() => {
        if (appSettings.quizMode !== 'typing') return null;
        if (appSettings.quizDirection === 'reverse') return null;
        if (!currentCard) return null;
        const lang: TypingLang = typingLang === 'mix'
            ? (currentCard.id % 2 === 0 ? 'japanese' : 'english')
            : typingLang;
        if (lang === 'english') {
            return currentCard.correctAnswer ? { kind: 'english', target: currentCard.correctAnswer } : null;
        }
        if (kanaTypingTarget) return { kind: 'japanese', target: kanaTypingTarget, targets: kanaTypingTargets };
        if (typingLang === 'mix' && currentCard.correctAnswer) {
            return { kind: 'english', target: currentCard.correctAnswer };
        }
        return null;
    })();
    const isTypingCard = typingPlan !== null;

    // Forward multiple-choice hint shown under the question word/kanji. When the
    // options are English meanings, the reading (Japanese pronunciation) is shown as
    // a hint. When the options are readings, no hint is shown — the English meaning
    // used to appear here, but it gave the answer away and made the quiz too easy.
    // The question itself stays the word/kanji. Only the quiz phase of a forward MC
    // card has a hint (the intro already teaches the reading; reverse/typing/
    // sentences have none). null → no hint line.
    const mcHint: string | null = (() => {
        if (!currentCard) return null;
        if (isLearningPhase || isTypingCard || isSentences) return null;
        if (appSettings.quizMode !== 'multiple-choice') return null;
        if (appSettings.quizDirection === 'reverse') return null;
        // Mix option language never shows the reading hint: half the cards have
        // reading options (where the hint leaks the answer) and the other half
        // would otherwise show it, making the session inconsistent. The intro
        // still teaches the reading; only the all-English option language keeps
        // the hint.
        if (typingLang === 'mix') return null;
        return currentCard.optionLang === 'japanese'
            ? null
            : (currentCard.reading ?? null);
    })();

    const questionContent = currentCard && mcHint === null && appSettings.showFurigana && currentCard.reading ? (
        <ruby>
            {currentCard.question}
            <rp>(</rp>
            <rt className="text-base sm:text-2xl">{currentCard.reading}</rt>
            <rp>)</rp>
        </ruby>
    ) : (
        currentCard?.question
    );
    const questionNode = currentCard?.kanjiEntryCharacter ? (
        <button
            type="button"
            onClick={(event) => {
                event.stopPropagation();
                void openKanjiSheetForCurrentCard();
            }}
            className="inline rounded-md transition-colors hover:text-[#FF0054] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0054] focus-visible:ring-offset-4 focus-visible:ring-offset-[#1A1A1A]"
            aria-label={`Open kanji details for ${currentCard.kanjiEntryCharacter}`}
            title={currentCard.kanjiEntryCharacter}
        >
            {questionContent}
        </button>
    ) : questionContent;

    // Per-card timer budget. Words use the raw timer-duration setting. A sentence
    // can't be typed in those few seconds, so its budget scales with the reading
    // length — the setting becomes a per-(~word-sized chunk) rate rather than a
    // whole-card cap. ~3 kana ≈ one word's worth of time.
    const SENTENCE_CHARS_PER_UNIT = 3;
    const effectiveTimerDuration = (() => {
        if (!isSentences) return appSettings.timerDuration;
        const len = currentCard?.reading ? Array.from(currentCard.reading).length : 0;
        return Math.max(
            appSettings.timerDuration,
            Math.ceil((appSettings.timerDuration * len) / SENTENCE_CHARS_PER_UNIT),
        );
    })();

    // Pre-decode every card's audio (word + phrase) as soon as the session is
    // loaded so playback is near-instant when the card appears.
    useEffect(() => {
        if (flashcards.length === 0) return;
        flashcards.forEach(card => {
            preloadAudio(card.audioPath);
            preloadAudio(card.englishAudioPath);
            preloadAudio(card.phrase?.audioPath);
        });
    }, [flashcards]);

    // Play the quiz-start sound IMMEDIATELY on mount so it covers the
    // loading wait (this sound is *for* the loading gap). The originating
    // click on /session_preview_results also triggers it via
    // playQuizStartSound(); audio.ts dedupes within 5s, so we never
    // double-fire. Direct hard-navigations to /quizz still get the music.
    useEffect(() => {
        if (quizStartedRef.current) return;
        quizStartedRef.current = true;
        resumeAudioContext();
        audioPlayer.play('quizStart');
    }, []);

    // Show the animated start screen immediately — it stands in for the old
    // "Loading..." text while the session data loads in the background.
    useEffect(() => {
        if (startShownAtRef.current !== 0) return;
        startShownAtRef.current = Date.now();
        setShowStartScreen(true);
    }, []);

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

    // Play audio when a new card is shown. In forward mode (JA question)
    // we play the Japanese audio; in reverse (EN question) the English
    // TTS audio. If the relevant URL is missing (e.g., extension words
    // without EN audio yet) we just skip — no audio for that card.
    useEffect(() => {
        if (isPaused) return;
        if (!appSettings.audioAutoPlay) return;
        if (!currentCard) return;
        // In the quiz phase, typing cards manage their own flow and shouldn't
        // autoplay. The kanji quiz also stays silent on question cards: speaking
        // the reading there would give away the multiple-choice answer. Only the
        // intro card teaches the kanji with audio.
        if (phase === 'quiz' && (isTypingCard || isKanji)) return;
        // Same reasoning for the words quiz when the options are readings (Japanese
        // option language): the word's audio IS the reading the user has to pick,
        // so autoplaying it would give the answer away.
        if (phase === 'quiz' && currentCard.optionLang === 'japanese') return;
        // Mix option language stays silent in the quiz too: even its English-option
        // cards would otherwise play the word's audio (i.e. its reading), so the
        // session would be inconsistent — some cards spoken, some not. The intro
        // still teaches the word with audio.
        if (phase === 'quiz' && typingLang === 'mix') return;
        // Intro teaches the word, so always play the Japanese word audio there;
        // the quiz plays the question-side audio for the current direction.
        const url = phase === 'intro'
            ? currentCard.audioPath
            : (appSettings.quizDirection === 'reverse' ? currentCard.englishAudioPath : currentCard.audioPath);
        if (!url) return;

        resumeAudioContext();
        const { handlePromise, cancel } = playAudio(url);
        handlePromise.then(handle => {
            if (handle) setWordAudio(handle.source);
        });

        return () => {
            cancel();
            setWordAudio(null);
        };
    }, [phase, batchIndex, introIndex, quizPos, currentCard?.id, currentCard?.audioPath, currentCard?.englishAudioPath, currentCard?.optionLang, appSettings.quizDirection, appSettings.audioAutoPlay, isTypingCard, isKanji, isPaused, typingLang]);

    // Randomize the order of answers
    const [answers, setAnswers] = useState<string[]>([])

    // Build & shuffle the answer choices whenever the quiz lands on a new card.
    useEffect(() => {
        if (phase !== 'quiz' || !currentCard) return;

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
        setRevealed(false);
        setAwaitingContinue(false);
        setTimeLeft(effectiveTimerDuration);
        // The timer runs in typing mode too (using the timer-duration setting),
        // so an unknown word still times out and moves on instead of leaving the
        // user stuck. Sentences keep the timer but on a length-scaled budget
        // (effectiveTimerDuration) so a long reading is actually completable.
        setIsTimerRunning(true);
    }, [phase, batchIndex, quizPos, currentCard, effectiveTimerDuration, isTypingCard, isSentences]);

    // Timer functionality
    useEffect(() => {
        if (!isTimerRunning || !currentCard || isPaused) return;
        if (isLearningPhase) return; // No timer during the intro phase
        if (showStartScreen || showEndScreen) return; // Pause while a transition screen is up

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
    }, [isTimerRunning, currentCard, isTypingCard, isPaused, isLearningPhase, showStartScreen, showEndScreen])

    // Advance the quiz after an answer (or a timeout) within the batched flow.
    const advanceQuiz = useCallback((correct: boolean) => {
        // Clean up any playing audio
        if (wordAudio) {
            (wordAudio as AudioBufferSourceNode).stop();
            setWordAudio(null);
        }
        if (phraseAudio) {
            (phraseAudio as AudioBufferSourceNode).stop();
            setPhraseAudio(null);
        }
        if (!currentCard) return;

        let newProgress = progress;
        if (correct) {
            const newAnsweredCards = answeredCards + 1
            setAnsweredCards(newAnsweredCards)
            // Each unique word counts once toward completion; progress hits 100
            // only when every word has been answered correctly at least once.
            newProgress = Math.min(Math.round((newAnsweredCards * 100) / originalLength), 100)
            setProgress(newProgress)
        }

        // A miss during a batch quiz is deferred to the final review round; a miss
        // during the final review is re-queued so the round loops until correct.
        let segmentQueue = quizQueue;
        if (!correct) {
            if (isFinalReview) {
                segmentQueue = [...quizQueue, { ...currentCard, attemptKey: Date.now() }];
                setQuizQueue(segmentQueue);
            } else {
                finalReviewRef.current = [...finalReviewRef.current, currentCard];
            }
        }

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
    }, [wordAudio, phraseAudio, currentCard, progress, answeredCards, originalLength, quizQueue, quizPos, isFinalReview, batchIndex, batches.length])

    // Intro browse navigation. We page through only the new words, but the
    // quiz that follows still covers the whole batch (incl. already-known words).
    const onIntroNext = useCallback(() => {
        if (introIndex < currentIntroCards.length - 1) {
            setIntroIndex(prev => prev + 1);
            return;
        }
        // Done introducing this batch — start quizzing the full batch.
        setQuizQueue(currentBatch ?? []);
        setQuizPos(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setPhase('quiz');
    }, [currentBatch, currentIntroCards.length, introIndex])

    // If every word in this batch has already been introduced, there's nothing
    // to teach — skip the intro and go straight to quizzing the batch.
    useEffect(() => {
        if (phase !== 'intro' || isFinalReview || !currentBatch) return;
        if (currentIntroCards.length === 0) {
            setQuizQueue(currentBatch);
            setQuizPos(0);
            setSelectedAnswer(null);
            setIsCorrect(null);
            setPhase('quiz');
        }
    }, [phase, isFinalReview, currentBatch, currentIntroCards])

    const onIntroBack = useCallback(() => {
        setIntroIndex(prev => Math.max(0, prev - 1));
    }, [])

    // Handle timeout - move to next card
    const handleTimeout = useCallback(() => {
        setIsTimerRunning(false)
        // A timeout counts as a miss: record it for the end-screen stats AND in
        // the per-word difficulty data that gets persisted (total_misses /
        // progress_status), mirroring a wrong answer and the show-answer path.
        if (currentCard) {
            sessionMissedIdsRef.current.add(currentCard.id)
            sessionTimeSumRef.current += effectiveTimerDuration
            sessionAnswerCountRef.current += 1

            setWordDifficulties(prev => {
                const prevDifficulty = prev[currentCard.id] || {
                    progress: 0,
                    timeToAnswer: 0,
                    totalMisses: 0,
                    correctAnswers: 0,
                }
                const totalAttempts = prevDifficulty.totalMisses + prevDifficulty.correctAnswers
                const newTimeToAnswer = totalAttempts === 0
                    ? effectiveTimerDuration
                    : (prevDifficulty.timeToAnswer * totalAttempts + effectiveTimerDuration) / (totalAttempts + 1)
                return {
                    ...prev,
                    [currentCard.id]: {
                        // A miss drops progress by 20 (floored at 0).
                        progress: Math.max((prevDifficulty.progress || 0) - 20, 0),
                        timeToAnswer: newTimeToAnswer,
                        totalMisses: prevDifficulty.totalMisses + 1,
                        correctAnswers: prevDifficulty.correctAnswers,
                    },
                }
            })
        }
        // A timeout is a miss; show the failure banner and wait for Continue.
        setIsCorrect(false)
        setAwaitingContinue(true)
    }, [currentCard, effectiveTimerDuration])

    // Handle quiz completion — show the animated end screen with stats, persist
    // progress, then hand the results URL to the auto-continue effect below.
    useEffect(() => {
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
        endShownAtRef.current = Date.now();
        setShowEndScreen(true);

        const { section, step, practicedWordIds } = router.query;

        // Start loading the results-page data NOW (while the end screen is up) so
        // the transition to the results view is instant instead of showing a
        // second loading state after the redirect. The results page consumes this
        // prefetched promise via takeCachedSessionCardsByIds.
        const practicedIds = flashcards.map(card => card.id);
        const prefetchQuizType = appSettings.quizMode === 'typing' ? 'typing' : 'multiple_choice';
        if (isPrimitives) {
            prefetchKanjiPrimitiveCardsByIds(practicedIds, prefetchQuizType);
        } else if (isKanji) {
            prefetchKanjiFreqCardsByIds(practicedIds, prefetchQuizType);
        } else if (isTubelex) {
            prefetchTubelexCardsByIds(practicedIds, prefetchQuizType);
        } else {
            prefetchSessionCardsByIds(
                practicedIds,
                typeof section === 'string' ? section : undefined,
                typeof step === 'string' ? step : undefined,
                prefetchQuizType,
                isSentences ? 'sentences' : 'words'
            );
        }
        router.prefetch('/session_preview_results');

        // Fresh step mastery for the end screen. On failure (or a step with
        // no trackable words, e.g. anime/custom) we surface a placeholder rather
        // than fabricating numbers.
        (async () => {
            try {
                if (typeof section !== 'string') throw new Error('no section');
                if (typeof step !== 'string') throw new Error('no step');
                const quizType = appSettings.quizMode === 'typing' ? 'typing' : 'multiple_choice';
                const stepProgressUrl = isPrimitives
                    ? `/api/progress/step-progress-kanji-primitives?quizType=${quizType}`
                    : isKanji
                    ? `/api/progress/step-progress-kanji-freq?section=${encodeURIComponent(section)}&step=${encodeURIComponent(step)}&quizType=${quizType}`
                    : isTubelex
                    ? `/api/progress/step-progress-words-tubelex?section=${encodeURIComponent(section)}&step=${encodeURIComponent(step)}&quizType=${quizType}`
                    : `/api/progress/step-progress?section=${encodeURIComponent(section)}&step=${encodeURIComponent(step)}&quizType=${quizType}`;
                const res = await fetch(stepProgressUrl, {
                    credentials: 'include'
                });
                if (!res.ok) throw new Error('step-progress request failed');
                const data = await res.json();
                const total = data.totalWords ?? 0;
                const mastered = data.masteredCount ?? 0;
                if (total <= 0) throw new Error('step has no trackable words');
                setStepStats({
                    mastered,
                    total,
                    remaining: Math.max(0, total - mastered),
                    // The ring shows the step's actual progress — the average
                    // per-word progress (0..100) the endpoint computes, matching
                    // the step rings on the homepage — not the mastered/total
                    // ratio, which sits at 0% until words are fully mastered.
                    percent: data.progress ?? 0
                });
            } catch (error) {
                console.error('Failed to load step mastery for end screen:', error);
                setStepStatsError(true);
            }
        })();

        // Persist progress, then hand the results URL to the auto-continue effect.
        const save = async () => {
            setIsSaving(true);
            setSaveError(null);
            try {
                const isReadOnly = typeof section === 'string'
                    && (section.startsWith('anime_') || section.startsWith('custom_'));
                // Each input mode tracks its own progress dimension: typing
                // answers advance the 'typing' progress, multiple-choice the
                // 'multiple_choice' progress, so the two scores stay separate.
                const quizType = appSettings.quizMode === 'typing' ? 'typing' : 'multiple_choice';

                if (isReadOnly) {
                    // Anime/custom sessions span local membership lists and do not
                    // write into the normal progress tables.
                    console.log('Read-only session — progress intentionally not saved');
                } else {
                    console.log(`Quiz completed, saving ${quizType} progress...`);
                    const saveUrl = isPrimitives ? '/api/progress/save-kanji-primitives' : isKanji ? '/api/progress/save-kanji-freq' : isTubelex ? '/api/progress/save-words-tubelex' : '/api/progress/save';
                    const res = await fetch(saveUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ wordDifficulties, quizType }),
                    });

                    if (!res.ok) {
                        let detail = '';
                        try {
                            const body = await res.json();
                            detail = body?.error || JSON.stringify(body);
                        } catch {
                            detail = await res.text();
                        }
                        throw new Error(`Save failed (${res.status}): ${detail}`);
                    }
                    console.log('Progress saved with status updates');
                }

                const practicedWordIdsString = flashcards.map(card => card.id).join(',');
                let params: URLSearchParams;
                const isReviewResults = practicedWordIds && !step;
                if (isReviewResults) {
                    params = new URLSearchParams({
                        section: section as string,
                        title: 'Review Session Results',
                        subtitle: 'Results for this review session',
                        description: 'These are the words you reviewed in this session.',
                        practicedWordIds: practicedWordIdsString,
                        showResultsButton: 'true'
                    });
                } else {
                    if (!step) {
                        throw new Error('Missing step parameter for regular quiz completion');
                    }
                    params = new URLSearchParams({
                        section: section as string,
                        step: step as string,
                        title: 'Session Results',
                        subtitle: 'Results for this session',
                        description: 'These are the words you practiced in this session.',
                        practicedWordIds: practicedWordIdsString,
                        showResultsButton: 'true'
                    });
                }
                // Keep the deck context so "next session" stays in the same mode.
                if (isPrimitives) params.set('content', 'kanji_primitives');
                else if (isKanji) params.set('content', 'kanji_freq');
                else if (isTubelex) params.set('content', 'words_tubelex');
                else if (isSentences) params.set('content', 'sentences');
                setResultsHref(`/session_preview_results?${params.toString()}`);
            } catch (err) {
                // Per the "No silent fallbacks" project rule, do NOT auto-redirect
                // when save fails — that would mask a broken save endpoint and
                // is exactly how the empty-streak bug went undetected. Surface
                // the error so the user can retry or report it.
                console.error('Failed to save progress to DB:', err);
                setSaveError(err instanceof Error ? err.message : String(err));
            } finally {
                setIsSaving(false);
            }
        };

        save();
    }, [progress, router, wordDifficulties, flashcards, originalLength, appSettings.timerDuration, appSettings.quizMode, isPrimitives, isSentences, isKanji, isTubelex]);

    // While the end screen is up, auto-continue to detailed results once the save
    // has produced the URL; space (or the in-screen button) skips the wait.
    useEffect(() => {
        if (!showEndScreen || !resultsHref) return;
        const elapsed = Date.now() - endShownAtRef.current;
        const remaining = Math.max(0, END_SCREEN_AUTO_CONTINUE_MS - elapsed);
        const go = () => router.push(resultsHref);
        const timeout = setTimeout(go, remaining);
        const onKey = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                go();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('keydown', onKey);
        };
    }, [showEndScreen, resultsHref, router]);

    // Handle answer selection
    const handleAnswerSelect = useCallback(
        (answer: string) => {
            if (selectedAnswer !== null) return // Prevent multiple selections
            if (isPaused) return

            setSelectedAnswer(answer)
            setIsTimerRunning(false)

            const acceptedAnswers = currentCard.acceptedAnswers?.length
                ? currentCard.acceptedAnswers
                : [currentCard.correctAnswer];
            const correct = acceptedAnswers.includes(answer)
            setIsCorrect(correct)

            // Calculate time taken to answer
            const timeToAnswer = Math.min(effectiveTimerDuration - timeLeft, effectiveTimerDuration)

            // Accumulate per-session stats for the end screen.
            sessionTimeSumRef.current += timeToAnswer
            sessionAnswerCountRef.current += 1
            if (!correct) sessionMissedIdsRef.current.add(currentCard.id)

            // Play the appropriate sound. Typing a word fully + correctly gets a
            // louder correct chime (the keystrokes have lower-volume clicks, so
            // the completion reward needs to cut through); multiple-choice uses
            // the standard chime.
            if (correct) {
                if (isTypingCard) {
                    playCorrectChime(2.4)
                } else {
                    audioPlayer.play('correct', correctVariantForCardIndex(sessionAnswerCountRef.current))
                }
            } else {
                audioPlayer.play('incorrect')
            }

            // Answer-side audio URL (used below to gate the advance when the
            // "play answer word on correct" setting is on). Forward (JA Q) ->
            // English audio, unless the options are hiragana readings (Japanese
            // option language), in which case the answer IS the Japanese word so we
            // confirm with its audio. Reverse (EN Q) -> Japanese audio. Sentences
            // play the sentence's own audio (its audioPath).
            const answerSideUrl = correct
                ? (isSentences
                    ? currentCard.audioPath
                    : (appSettings.quizDirection === 'reverse'
                        ? currentCard.audioPath
                        : currentCard.optionLang === 'japanese'
                            ? (answer === currentCard.correctAnswer ? currentCard.audioPath : undefined)
                            : currentCard.englishAudioPath))
                : undefined;
            const waitForAnswerAudio =
                correct
                && appSettings.playCorrectAnswerAudio
                && appSettings.audioAutoPlay
                && !!answerSideUrl;

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

                // Correct: +10 (capped at 100). Missed: -20 (floored at 0).
                const newProgress = correct
                    ? Math.min((prevDifficulty.progress || 0) + 10, 100)
                    : Math.max((prevDifficulty.progress || 0) - 20, 0);
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

            // Show the feedback banner and wait for the user to advance — never
            // auto-advance. The example-sentence phrase and the answer-side word
            // audio still play under the banner; handleContinue stops any audio
            // that's still going when the user moves on.
            if (appSettings.showPhrase && currentCard.phrase) {
                setShowingPhrase(true);
                if (currentCard.phrase.audioPath && appSettings.audioAutoPlay) {
                    resumeAudioContext();
                    const { handlePromise } = playAudio(currentCard.phrase.audioPath);
                    handlePromise.then(handle => {
                        if (handle) setPhraseAudio(handle.source);
                    }).catch(() => { /* phrase audio is optional */ });
                }
            } else if (waitForAnswerAudio && answerSideUrl) {
                // Short delay first so the "correct" chime doesn't overlap the word.
                setTimeout(() => {
                    resumeAudioContext();
                    const { handlePromise } = playAudio(answerSideUrl);
                    handlePromise.then(handle => {
                        if (handle) setPhraseAudio(handle.source);
                    }).catch(() => { /* answer audio is optional */ });
                }, 200);
            }
            setAwaitingContinue(true);
        },
        [selectedAnswer, isPaused, currentCard, timeLeft, isTypingCard, isSentences, appSettings.showPhrase, appSettings.audioAutoPlay, appSettings.playCorrectAnswerAudio, appSettings.quizDirection, effectiveTimerDuration],
    )

    // "Show answer" (typing cards only): the user can't recall the reading. Reveal
    // the full answer in the slots, count the card as a miss once, and wait for
    // the user to advance — do NOT move on automatically. Bound to ⌘/Ctrl+Space.
    const handleShowAnswer = useCallback(() => {
        if (!isTypingCard) return
        if (phase !== 'quiz') return
        if (isPaused) return
        if (selectedAnswer !== null) return
        if (revealed) return
        if (!currentCard) return

        setRevealed(true)
        setIsTimerRunning(false)

        const timeToAnswer = Math.min(effectiveTimerDuration - timeLeft, effectiveTimerDuration)
        sessionTimeSumRef.current += timeToAnswer
        sessionAnswerCountRef.current += 1
        sessionMissedIdsRef.current.add(currentCard.id)

        audioPlayer.play('incorrect')

        // Record the miss in the per-word difficulty data (mirrors the !correct
        // branch of handleAnswerSelect, but never advances).
        setWordDifficulties(prev => {
            const prevDifficulty = prev[currentCard.id] || {
                progress: 0,
                timeToAnswer: 0,
                totalMisses: 0,
                correctAnswers: 0,
            }
            const totalAttempts = prevDifficulty.totalMisses + prevDifficulty.correctAnswers
            const newTimeToAnswer = totalAttempts === 0
                ? timeToAnswer
                : (prevDifficulty.timeToAnswer * totalAttempts + timeToAnswer) / (totalAttempts + 1)
            return {
                ...prev,
                [currentCard.id]: {
                    // A miss drops progress by 20 (floored at 0).
                    progress: Math.max((prevDifficulty.progress || 0) - 20, 0),
                    timeToAnswer: newTimeToAnswer,
                    totalMisses: prevDifficulty.totalMisses + 1,
                    correctAnswers: prevDifficulty.correctAnswers,
                },
            }
        })

        // Show the failure banner and wait for the user to advance.
        setAwaitingContinue(true)
    }, [isTypingCard, phase, isPaused, selectedAnswer, revealed, currentCard, effectiveTimerDuration, timeLeft])

    // Advance to the next card after the feedback banner. The result is already
    // recorded; a correct answer advances as correct, everything else (wrong /
    // revealed / timed out) as a miss, so the card is deferred to / re-queued in
    // the review round. Stops any phrase/answer audio still playing.
    const handleContinue = useCallback(() => {
        if (!awaitingContinue) return
        if (phraseAudio) { try { (phraseAudio as AudioBufferSourceNode).stop() } catch { /* already stopped */ } }
        setPhraseAudio(null)
        setShowingPhrase(false)
        setRevealed(false)
        setAwaitingContinue(false)
        advanceQuiz(isCorrect === true)
    }, [awaitingContinue, phraseAudio, isCorrect, advanceQuiz])

    // While the feedback banner is up, Space advances to the next card (same as
    // clicking Continue). This single handler owns bare Space in the answered
    // state for every card type; all the other key handlers below bail out when
    // awaitingContinue so Space fires exactly once.
    useEffect(() => {
        if (!awaitingContinue) return
        if (showStartScreen || showEndScreen || isPaused) return
        const onKey = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault()
                handleContinue()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [awaitingContinue, showStartScreen, showEndScreen, isPaused, handleContinue])

    // Typing-card shortcut: ⌘/Ctrl+Space reveals the answer (counts as a miss).
    // Once answered, the banner's Space handler above takes over. The TypingAnswer
    // components ignore modified keys, so ⌘+Space never reaches them.
    useEffect(() => {
        if (!isTypingCard) return
        if (phase !== 'quiz') return
        if (isLearningPhase) return
        if (showStartScreen || showEndScreen) return

        const onKey = (e: KeyboardEvent) => {
            if (isPaused) return
            if (awaitingContinue) return
            const isSpace = e.code === 'Space' || e.key === ' '
            if (!isSpace) return
            if (e.metaKey || e.ctrlKey) {
                e.preventDefault()
                handleShowAnswer()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [isTypingCard, phase, isLearningPhase, showStartScreen, showEndScreen, isPaused, awaitingContinue, handleShowAnswer])

    // Handle keyboard input
    useEffect(() => {
        // The TypingAnswer component owns keystrokes in typing mode.
        if (isTypingCard) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (phase !== 'quiz') return; // Only accept answers during the quiz phase
            if (selectedAnswer !== null) return; // Prevent multiple selections
            if (awaitingContinue) return; // Banner is up — Space-to-continue owns the keyboard
            if (isPaused) return;
            if (showStartScreen || showEndScreen) return; // Transition screens own the keyboard

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
    }, [answers, handleAnswerSelect, selectedAnswer, awaitingContinue, showingPhrase, phraseAudio, isCorrect, isTypingCard, isPaused, phase, showStartScreen, showEndScreen]);

    // During the intro phase, Space advances to the next word (or starts the
    // batch quiz on the last intro card) — same as clicking Next.
    useEffect(() => {
        if (phase !== 'intro') return;
        if (showStartScreen || showEndScreen || isPaused) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                onIntroNext();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [phase, showStartScreen, showEndScreen, isPaused, onIntroNext]);

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

    // The animated start screen stands in for the loading state (handled in the
    // main return below), with the session data loading behind it.

    // Early return for error state
    if (error) {
        return (
            <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
                <div className="text-white text-2xl">{error}</div>
            </div>
        )
    }

    // Save error after quiz completion — show the real message instead of
    // silently redirecting to results (per "No silent fallbacks" rule).
    if (saveError) {
        return <SaveErrorScreen error={saveError} />
    }

    // During normal completion the end screen is the saving UI; only fall back to
    // a plain "Saving…" screen if we're somehow saving without the end screen up.
    if (isSaving && !showEndScreen) {
        return (
            <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
                <LoadingState text="Saving your progress" />
            </div>
        )
    }

    // Early return if no flashcards are loaded (only once loading is finished, so
    // the start screen — not this text — covers the background load).
    if (!isLoading && flashcards.length === 0) {
        return (
            <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
                <LoadingState text="Preparing your cards" subText="Getting this quiz ready for you." />
            </div>
        )
    }

    // True once the session is interactive; the quiz card only renders then, so it
    // never flashes empty behind the start overlay during the background load.
    const dataReady = !isLoading && flashcards.length > 0;

    return (
        <div className="h-screen bg-[#1A1A1A] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            <KanjiSheet
                isOpen={isKanjiSheetOpen}
                onClose={closeKanjiSheet}
                kanji={selectedKanjiEntry}
            />
            {showStartScreen && <QuizStartScreen sectionLabel={sectionLabel} />}
            {showEndScreen && endStats && (
                <QuizEndScreen
                    stats={endStats}
                    mastery={stepStats}
                    masteryError={stepStatsError}
                    sectionLabel={sectionLabel}
                    unitLabel={isKanji ? 'kanji' : isTubelex ? 'words' : isSentences ? 'sentences' : 'words'}
                    autoContinueMs={END_SCREEN_AUTO_CONTINUE_MS}
                    onSeeResults={() => { if (resultsHref) router.push(resultsHref); }}
                    onFinish={() => router.push('/')}
                />
            )}
            {/* Fixed (not min-) height so the card never grows when the phrase
                reveals; combined with the inner overflow-hidden content area
                this locks every element's Y position across all card modes. */}
            {dataReady && (
            <div className="w-full max-w-5xl p-3 sm:p-6 md:p-8 h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] flex flex-col">
                {/* Header with progress bar and controls — shrink-0 so it can't
                    be pushed by content growth below. */}
                <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8 shrink-0">
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
                        onClick={openSettings}
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
                                <div className="absolute inset-0 z-30 rounded-xl sm:rounded-2xl bg-[#1A1A1A]/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
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
                                {/* Header \u2014 never compresses regardless of what
                                    renders below (answers vs phrase vs typing
                                    vs none). Pinning shrink so the question
                                    word stays at the same Y position. */}
                                <div className="pt-2 sm:pt-4 flex-shrink-0">
                                    <h2 className="text-base sm:text-2xl mb-4 sm:mb-8 text-[#A1A1A1]">
                                        {isLearningPhase
                                            ? (isSentences ? 'Learn this sentence' : 'Learn this word')
                                            : (!showingPhrase ? (isSentences ? 'Type the reading of this sentence' : 'Do you know this?') : '\u00A0')}
                                    </h2>
                                    <div className={`${isSentences ? 'text-3xl sm:text-4xl md:text-5xl leading-snug' : 'text-5xl sm:text-6xl md:text-7xl'} font-bold break-words`}>
                                        {/* In forward MC the reading is suppressed here (it would
                                            duplicate the English-mode hint, or leak the answer in
                                            Japanese mode). Furigana ruby is kept only outside MC. */}
                                        {questionNode}
                                    </div>
                                    {mcHint !== null && (
                                        <div className="mt-3 sm:mt-4 text-xl sm:text-2xl text-[#A1A1A1] break-words">
                                            {mcHint}
                                        </div>
                                    )}
                                </div>

                                {/* Permanent separator — sits at the same place whether answer cards or
                                    the example sentence are shown below, so the header above never shifts. */}
                                <div className="border-t border-[#4F4F4F] mt-4 sm:mt-8 md:mt-12 flex-shrink-0" />

                                {/* Content section — flex-1 + min-h-0 + overflow-hidden so a tall
                                    phrase can't push siblings around (header/separator/timer stay put). */}
                                <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center">
                                    {isLearningPhase ? (
                                        // Intro: show the reading(s) + the English meaning so the
                                        // user learns it before being quizzed on the batch. A kanji
                                        // teaches only this pronunciation item's reading. The
                                        // sentences quiz uses smaller fonts (the reading is long).
                                        (() => {
                                            const introReadings = (currentCard.readingAlternatives && currentCard.readingAlternatives.length > 0)
                                                ? currentCard.readingAlternatives
                                                : (currentCard.reading ? [currentCard.reading] : []);
                                            // The English meaning. In reading-option MC the answer is
                                            // the reading, so the meaning is stashed in `meaning`;
                                            // everywhere else `correctAnswer` already is the meaning.
                                            const introMeaning = currentCard.meaning ?? currentCard.correctAnswer;
                                            const primitiveHints = [
                                                currentCard.composed_of_kanji && currentCard.composed_of_kanji_description
                                                    ? { kanji: currentCard.composed_of_kanji, meaning: currentCard.composed_of_kanji_description }
                                                    : null,
                                                currentCard.composed_of_kanji_2 && currentCard.composed_of_kanji_description_2
                                                    ? { kanji: currentCard.composed_of_kanji_2, meaning: currentCard.composed_of_kanji_description_2 }
                                                    : null,
                                                currentCard.composed_of_kanji_3 && currentCard.composed_of_kanji_description_3
                                                    ? { kanji: currentCard.composed_of_kanji_3, meaning: currentCard.composed_of_kanji_description_3 }
                                                    : null,
                                            ].filter((primitive): primitive is PrimitiveHint => !!primitive);
                                            return (
                                                <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
                                                    {introReadings.length > 0 && (
                                                        <div className={`${isSentences ? 'text-lg sm:text-xl md:text-2xl leading-snug break-words' : 'text-2xl sm:text-3xl'} text-[#A1A1A1]`}>{introReadings.join('、')}</div>
                                                    )}
                                                    <div className={`${isSentences ? 'text-xl sm:text-2xl md:text-3xl' : 'text-3xl sm:text-4xl md:text-5xl'} font-semibold break-words text-white`}>
                                                        {introMeaning}
                                                    </div>
                                                    {currentCard.mnemonic && (
                                                        <div className="max-w-3xl max-h-40 overflow-y-auto px-2 text-sm sm:text-base md:text-lg leading-relaxed text-white whitespace-pre-line">
                                                            <KanjiMnemonic
                                                                mnemonic={currentCard.mnemonic}
                                                                english={introMeaning}
                                                                primitives={primitiveHints}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()
                                    ) : !showingPhrase ? (
                                        isTypingCard && typingPlan ? (
                                            <div
                                                className={`max-w-3xl mx-auto w-full ${
                                                    isCorrect === true ? 'animate-success-flash' : ''
                                                }`}
                                            >
                                                {typingPlan.kind === 'japanese' ? (
                                                    <>
                                                        <TypingAnswer
                                                            targetReading={typingPlan.target}
                                                            targetReadings={typingPlan.targets && typingPlan.targets.length > 1 ? typingPlan.targets : undefined}
                                                            resetKey={`${currentCard.id}-${currentCard.attemptKey ?? 0}`}
                                                            disabled={selectedAnswer !== null || awaitingContinue}
                                                            reveal={revealed}
                                                            keySound={appSettings.keyboardSound ?? DEFAULT_KEYBOARD_SOUND}
                                                            onComplete={() => handleAnswerSelect(currentCard.correctAnswer)}
                                                        />
                                                        <p className="text-center text-sm text-[#A1A1A1] mt-6">
                                                            {typingPlan.targets && typingPlan.targets.length > 1
                                                                ? 'Type any one of the readings in romaji or hiragana'
                                                                : 'Type the reading in romaji or hiragana'}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <EnglishTypingAnswer
                                                            target={typingPlan.target}
                                                            resetKey={`${currentCard.id}-${currentCard.attemptKey ?? 0}`}
                                                            disabled={selectedAnswer !== null || awaitingContinue}
                                                            reveal={revealed}
                                                            keySound={appSettings.keyboardSound ?? DEFAULT_KEYBOARD_SOUND}
                                                            onComplete={() => handleAnswerSelect(currentCard.correctAnswer)}
                                                        />
                                                        <p className="text-center text-sm text-[#A1A1A1] mt-6">
                                                            Type the answer
                                                        </p>
                                                    </>
                                                )}

                                                {/* "Show answer" lets the user fail a card they can't
                                                    recall: it reveals the reading in the slots, counts a
                                                    miss, and brings up the feedback banner (which owns
                                                    the Continue/Space advance). Hidden once answered. */}
                                                {!awaitingContinue && (
                                                    <div className="mt-6 flex items-center justify-center">
                                                        <button
                                                            onClick={handleShowAnswer}
                                                            disabled={selectedAnswer !== null}
                                                            className="inline-flex items-center gap-2 rounded-md border border-[#4F4F4F] bg-[#2F2F2F] px-4 py-2 text-sm text-[#A1A1A1] hover:bg-[#363636] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            Show answer
                                                            <kbd className="rounded bg-[#1A1A1A] border border-[#4F4F4F] px-1.5 py-0.5 text-xs">⌘ Space</kbd>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-5xl mx-auto w-full">
                                                {answers.map((answer, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleAnswerSelect(answer)}
                                                        disabled={selectedAnswer !== null || awaitingContinue}
                                                        // Fixed height so long/short answers never reflow the grid;
                                                        // long text is clamped to 2 lines and ellipsised.
                                                        className={`${getButtonColor(answer)} ${
                                                            appSettings.quizDirection === 'reverse'
                                                                ? 'h-24 sm:h-28 md:h-32 px-4 sm:px-6 md:px-7 text-xl sm:text-2xl md:text-3xl'
                                                                : 'h-20 sm:h-24 md:h-28 px-3 sm:px-4 md:px-5 text-lg sm:text-xl md:text-2xl'
                                                        } rounded-lg w-full relative flex items-center justify-center text-center transition-colors duration-300 hover:opacity-90 disabled:cursor-not-allowed border border-[#4F4F4F]`}
                                                    >
                                                        {/* Kana reading options (Japanese option language) render
                                                            1.5× larger than the button's base text; English meaning
                                                            options keep the base size. */}
                                                        <span className={`line-clamp-2 leading-tight break-words${currentCard.optionLang === 'japanese' ? ' text-[1.5em]' : ''}`}>{answer}</span>
                                                        <span className="absolute bottom-1 right-2 text-xs opacity-60 hidden sm:inline">
                                                            (Press {index + 1})
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )
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

                                {/* Bottom slot: intro navigation or the quiz timer bar. The
                                    feedback banner is an overlay below so its larger height never
                                    changes the answer-area layout. */}
                                {isLearningPhase ? (
                                    <div className="flex items-center justify-between gap-3 mt-4 mb-2 sm:mb-4 flex-shrink-0">
                                        <button
                                            onClick={onIntroBack}
                                            disabled={introIndex === 0}
                                            className="bg-[#2F2F2F] border border-[#4F4F4F] text-white px-4 sm:px-6 py-2 rounded-md hover:bg-[#363636] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            ← <span className="hidden sm:inline">Back</span>
                                        </button>
                                        <span className="text-xs sm:text-sm text-[#A1A1A1] text-center">
                                            {`Intro · batch ${batchIndex + 1}/${batches.length} · ${introIndex + 1}/${currentIntroCards.length}`}
                                        </span>
                                        <button
                                            onClick={onIntroNext}
                                            className="bg-[#FF0054] text-white px-4 sm:px-6 py-2 rounded-md hover:bg-[#e0004a] transition-colors font-medium"
                                        >
                                            {introIndex < currentIntroCards.length - 1 ? 'Next' : 'Start quiz'} →
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className={`h-3 sm:h-4 bg-[#4F4F4F] rounded-full w-full sm:w-3/4 mx-auto overflow-hidden mt-4 mb-2 sm:mb-4 flex-shrink-0 ${
                                            showingPhrase || awaitingContinue ? 'invisible' : ''
                                        }`}
                                    >
                                        <div
                                            className="h-full bg-white transition-all duration-100 ease-linear"
                                            style={{ width: `${(timeLeft / effectiveTimerDuration) * 100}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                            {!isLearningPhase && awaitingContinue && (
                                <div className="absolute inset-x-4 bottom-4 z-20 sm:inset-x-8 sm:bottom-8 md:inset-x-12 md:bottom-12">
                                    <QuizFeedbackBanner
                                        status={isCorrect === true ? 'correct' : 'incorrect'}
                                        correctSolution={
                                            isTypingCard && typingPlan
                                                ? (typingPlan.kind === 'japanese'
                                                    ? (typingPlan.targets && typingPlan.targets.length > 1
                                                        ? typingPlan.targets.join('、')
                                                        : typingPlan.target)
                                                    : typingPlan.target)
                                                : currentCard.correctAnswer
                                        }
                                        meaning={
                                            isTypingCard && typingPlan && typingPlan.kind === 'japanese'
                                                ? currentCard.correctAnswer
                                                : undefined
                                        }
                                        onContinue={handleContinue}
                                    />
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            )}
        </div>
    )
}
