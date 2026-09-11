import { createClient } from '@supabase/supabase-js';
import { getAudioUrl, getEnglishAudioUrl } from './audioUrl';
import { plainSentence } from './sentence';
import { KANJI_PRIMITIVES, kanjiPrimitivesByIds } from './kanji-primitives';
// getEnglishAudioUrl resolves a tts-audio bucket key (slashes preserved) to a
// public URL; kanji reading audio lives there at kanji/<id>.mp3.

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Add type definition at the top of the file
export interface SupabaseCard {
    id: number;
    japanese_word: string;
    japanese_reading: string | null;
    english: string;
    word_audio_path: string | null;
    english_audio_path: string | null;
    example_sentence_japanese: string | null;
    example_sentence_reading: string | null;
    example_sentence_english: string | null;
    sentence_audio_path: string | null;
}

export interface FlashCard {
    id: number;
    japanese_word: string;
    english: string;
    reading?: string;
    audio_path?: string;
    example_sentence?: string;
    example_reading?: string;
    example_meaning?: string;
}

export interface SessionWord extends FlashCard {
    progress: number;
    isReview: boolean;
    totalMisses: number;
    correctAnswers: number;
    timeToAnswer: number;
    progress_status?: 'new' | 'learning' | 'mastered' | 'to_review';
    marked_as?: 'new' | 'learning' | 'mastered' | 'to_review';
}

export interface QuizCard {
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
    // Legacy multi-reading display path.
    readingAlternatives?: string[];
    // Frequency kanji quiz: sibling taught readings for the same bare kanji.
    acceptedReadings?: string[];
    correctAnswer: string;
    wrongAnswers: string[];
    wrongAnswer1: string;
    wrongAnswer2: string;
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

export interface SessionKanji {
    id: number;
    japanese_word: string;
    english: string;
    mnemonic?: string;
    example_sentence_japanese?: string;
    example_sentence_english?: string;
    sentence_audio_path?: string;
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
    progress_status?: 'new' | 'learning' | 'mastered' | 'to_review';
    marked_as?: 'new' | 'learning' | 'mastered' | 'to_review';
}

// Server-scoped progress fetch. /api/progress/get-batch reads the userId
// cookie server-side and only returns rows for the current user, so this
// avoids leaking another user's (or the 'anonymous') user_progress row into
// the browser. Returns a map keyed by word_id; missing ids resolve to the
// API's default zeroed shape.
//
// NOTE: do NOT bypass this by querying `user_progress` directly from the
// browser — the public anon key can't filter by user_id (the cookie is
// HttpOnly) and every previous direct query was unscoped, which is the
// exact bug this helper exists to fix.
type ProgressBatchRow = {
    progress: number;
    timeToAnswer: number;
    totalMisses: number;
    correctAnswers: number;
    progress_status: 'new' | 'learning' | 'mastered' | 'to_review' | null;
    marked_as: 'new' | 'learning' | 'mastered' | 'to_review' | null;
};

async function fetchProgressBatch(wordIds: number[], quizType: string = 'multiple_choice'): Promise<Record<number, ProgressBatchRow>> {
    if (wordIds.length === 0) return {};
    const res = await fetch(
        `/api/progress/get-batch?cardIds=${wordIds.join(',')}&quizType=${encodeURIComponent(quizType)}`,
        { credentials: 'include' },
    );
    if (!res.ok) {
        // 401 here means the user isn't logged in. We deliberately don't
        // fall back to anonymous — surface the failure so the caller can
        // decide. (Per project rule: no silent fallbacks.)
        throw new Error(`Failed to fetch progress batch: ${res.status}`);
    }
    return (await res.json()) as Record<number, ProgressBatchRow>;
}

export async function fetchAllCards(page: number = 1, pageSize: number = 50, section?: string, step?: string, quizType: string = 'multiple_choice') {
    try {
        console.log('\n=== FETCHING ALL CARDS FROM SUPABASE ===');
        console.log('Parameters:', { page, pageSize, section, step });
        const start = (page - 1) * pageSize;
        
        // // Get total count first with filters
        // console.log('Getting total count...');
        // let query = supabase
        //     .from('words10k_with_progress')
        //     .select('*', { count: 'exact', head: true });
            
        // if (section) query = query.eq('section', section);
        // if (step) query = query.eq('step', step);
        
        // const { count } = await query;
        // console.log('Total count:', count);

        // Then get the actual page of data with filters
        console.log('Fetching words from words10k table...');
        let cardsQuery = supabase
            .from('words10k')
            .select('*')
            .order('id', { ascending: true });
            
        if (section) cardsQuery = cardsQuery.eq('section', section);
        if (step) cardsQuery = cardsQuery.eq('step', step);
        
        const { data: cards, error } = await cardsQuery
            .range(start, start + pageSize - 1);

        if (error) {
            console.error('Error in fetchAllCards:', error);
            throw error;
        }

        if (!cards) {
            throw new Error('No cards returned from database');
        }

        console.log('Fetched words:', cards.map(c => c.id));

        // Get progress data for these cards — scoped to the current user
        // via the server endpoint (see fetchProgressBatch).
        console.log('Fetching progress data via /api/progress/get-batch...');
        console.log('Word IDs to fetch:', cards.map(c => c.id));
        const progressMap = await fetchProgressBatch(cards.map(c => c.id), quizType);
        console.log('Progress map received:', progressMap);

        // Add progress data to cards
        const cardsWithProgress = cards.map(card => {
            const progress = progressMap[card.id];
            return {
                ...card,
                progress: progress?.progress || 0,
                isReview: (progress?.totalMisses || 0) > 0,
                totalMisses: progress?.totalMisses || 0,
                correctAnswers: progress?.correctAnswers || 0,
                timeToAnswer: progress?.timeToAnswer || 0,
                progress_status: progress?.progress_status || 'new',
                marked_as: progress?.marked_as ?? undefined
            };
        });

        console.log('Cards with progress:', cardsWithProgress.map(c => ({
            id: c.id,
            progress: c.progress,
            isReview: c.isReview,
            totalMisses: c.totalMisses,
            correctAnswers: c.correctAnswers
        })));

        // Calculate if there are more pages
        // const hasMore = count ? start + cards.length < count : false;
        // console.log('Pagination info:', { start, hasMore, currentCount: cards.length, totalCount: count });

        console.log('=== FINISHED FETCHING ALL CARDS ===\n');

        return { cards: cardsWithProgress };
    } catch (error) {
        console.error('Error in fetchAllCards:', error);
        throw error;
    }
}

export async function fetchSupabaseSessionCards(pageSize: number = 10, section?: string, step?: string, startId?: string, wordIds?: number[], numWrongAnswers: number = 2, quizType: string = 'multiple_choice', content: 'words' | 'sentences' = 'words') {
    try {
        console.log('\n=== FETCHING SESSION CARDS FROM SUPABASE ===');
        console.log('Parameters:', { pageSize, section, step, startId, wordIds });

        let cards: SupabaseCard[];

        if (wordIds && wordIds.length > 0) {
            // Fetch specific words by IDs
            console.log('📌 Fetching specific words by IDs:', wordIds);
            
            const { data, error } = await supabase
                .from('words10k')
                .select('id, japanese_word, japanese_reading, english, word_audio_path, english_audio_path, example_sentence_japanese, example_sentence_reading, example_sentence_english, sentence_audio_path')
                .in('id', wordIds)
                .order('id', { ascending: true });

            if (error) {
                console.error('Error fetching words by IDs:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.error('❌ No words found for the provided IDs');
                throw new Error('No words found for the provided IDs');
            }

            cards = data;
            console.log('✅ Fetched words:', {
                count: cards.length,
                firstCardId: cards[0]?.id,
                lastCardId: cards[cards.length - 1]?.id,
                allIds: cards.map(c => c.id)
            });
        } else {
            // Original logic for backward compatibility
        console.log('Fetching words from words10k table...');
        let query = supabase
            .from('words10k')
            .select('id, japanese_word, japanese_reading, english, word_audio_path, english_audio_path, example_sentence_japanese, example_sentence_reading, example_sentence_english, sentence_audio_path')
            .order('id', { ascending: true });
            
        if (section) query = query.eq('section', section);
        if (step) query = query.eq('step', step);
        if (startId) query = query.gte('id', parseInt(startId));
        
        console.log('=== WORD SELECTION LOGIC ===');
        console.log('Starting search from ID:', startId);
        
            let { data, error } = await query.limit(pageSize);

        if (error) {
            console.error('Error in fetchSupabaseSessionCards:', error);
            throw error;
        }

        console.log('Initial query results:', {
                cardsFound: data?.length || 0,
                firstCardId: data?.[0]?.id,
                lastCardId: data?.[data.length - 1]?.id
        });

        // If no cards found with the current startId, try from the beginning of the step
            if (!data || data.length === 0) {
            console.log('No words found with startId, trying from beginning of step...');
            let retryQuery = supabase
                .from('words10k')
                .select('id, japanese_word, japanese_reading, english, word_audio_path, english_audio_path, example_sentence_japanese, example_sentence_reading, example_sentence_english, sentence_audio_path')
                .order('id', { ascending: true });
                
            if (section) retryQuery = retryQuery.eq('section', section);
            if (step) retryQuery = retryQuery.eq('step', step);
            
            const { data: retryCards, error: retryError } = await retryQuery.limit(pageSize);
            
            if (retryError) {
                console.error('Error in retry query:', retryError);
                throw retryError;
            }
            
            console.log('Retry query results:', {
                cardsFound: retryCards?.length || 0,
                firstCardId: retryCards?.[0]?.id,
                lastCardId: retryCards?.[retryCards.length - 1]?.id
            });
            
            if (!retryCards || retryCards.length === 0) {
                console.error('No words found in step even after retry');
                throw new Error('No words found in step');
            }
            
                data = retryCards;
                console.log('Found words from beginning of step. First word ID:', data[0].id);
        } else {
                console.log('Found words from startId. First word ID:', data[0].id);
            }

            cards = data;
        }

        // Get the next word after this session
        const { data: nextWordData } = await supabase
            .from('words10k')
            .select('*')
            .gt('id', cards[cards.length - 1].id)
            .order('id', { ascending: true })
            .limit(1);

        const nextWord = nextWordData && nextWordData.length > 0 ? nextWordData[0] : null;
        
        console.log('=== END WORD SELECTION LOGIC ===\n');

        // Get progress data for these cards — scoped to the current user
        // via the server endpoint (see fetchProgressBatch).
        console.log('Fetching progress data via /api/progress/get-batch...');
        console.log('Word IDs to fetch:', cards.map(c => c.id));

        const progressMap = await fetchProgressBatch(cards.map(c => c.id), quizType);

        if (progressMap) {
            console.log("progress map:")
            console.log(progressMap, JSON.stringify(progressMap, null, 2));
        }

        // Transform cards to session words with progress data
        const sessionWords = cards.map(card => {
            const progress = progressMap[card.id];
            return {
                ...card,
                progress: progress?.progress || 0,
                isReview: (progress?.totalMisses || 0) > 0,
                totalMisses: progress?.totalMisses || 0,
                correctAnswers: progress?.correctAnswers || 0,
                timeToAnswer: progress?.timeToAnswer || 0,
                progress_status: progress?.progress_status || 'new',
                marked_as: progress?.marked_as ?? undefined
            };
        });

        if (progressMap) {
            console.log("sessionWords:")
            console.log(sessionWords, JSON.stringify(sessionWords, null, 2));
        }

        // Sentences quiz: the user types the reading of each example sentence.
        // Build typing-only cards from the sentence fields, dropping any word whose
        // sentence has no stored reading (the typing target) — those can't be
        // quizzed. The question is the bare sentence (furigana stripped).
        //
        // audioPath = the sentence's spoken audio. The quiz/typing card never
        // autoplays it (the reading is typed from memory — quizz.tsx skips audio
        // on typing cards), but it IS played while the sentence is being
        // introduced, and again on a correct answer when "play answer audio" is on.
        if (content === 'sentences') {
            const sentenceCards = cards
                .filter(card => !!card.example_sentence_japanese && !!card.example_sentence_reading)
                .map(card => {
                    const progress = progressMap[card.id];
                    return {
                        id: card.id,
                        question: plainSentence(card.example_sentence_japanese as string),
                        reading: card.example_sentence_reading ?? undefined,
                        correctAnswer: card.example_sentence_english ?? card.english,
                        wrongAnswers: [] as string[],
                        wrongAnswer1: '',
                        wrongAnswer2: undefined as unknown as string,
                        audioPath: getAudioUrl(card.sentence_audio_path),
                        englishAudioPath: undefined,
                        // No example-phrase reveal — the sentence already IS the prompt.
                        phrase: undefined,
                        isReview: (progress?.totalMisses || 0) > 0,
                        progress: progress?.progress || 0,
                        timeToAnswer: progress?.timeToAnswer || 0,
                        totalMisses: progress?.totalMisses || 0,
                        correctAnswers: progress?.correctAnswers || 0,
                    };
                });
            console.log(`Built ${sentenceCards.length} sentence cards (of ${cards.length} words)`);
            return { sessionWords, quizCards: sentenceCards, nextWord };
        }

        // Transform cards to quiz cards with progress data
        console.log('Starting quiz cards transformation...');
        const quizCards = cards.map(card => {
            // Get up to two random cards for wrong answers that are not the current card
            const wrongCards = [];
            const usedIndices = new Set<number>();
            const maxWrongAnswers = Math.min(numWrongAnswers, cards.length - 1); // Can't have more wrong answers than other cards available

            let attempts = 0;
            const maxAttempts = cards.length * 2; // Prevent infinite loops

            while (wrongCards.length < maxWrongAnswers && attempts < maxAttempts) {
                attempts++;
                const randomIndex = Math.floor(Math.random() * cards.length);
                if (!usedIndices.has(randomIndex) && cards[randomIndex].id !== card.id) {
                    wrongCards.push(cards[randomIndex]);
                    usedIndices.add(randomIndex);
                }
            }

            const progress = progressMap[card.id];
            const wrongAnswers = wrongCards.map(c => c.english).filter((s): s is string => !!s);
            // Readings of the same wrong cards, parallel to wrongAnswers, so the
            // forward quiz can rebuild the options as hiragana readings when the
            // option language is Japanese (or per-word Mix).
            const wrongReadings = wrongCards.map(c => c.japanese_reading).filter((s): s is string => !!s);

            // Construct quiz card with available wrong answers
            const quizCard = {
                id: card.id,
                question: card.japanese_word,
                reading: card.japanese_reading ?? undefined,
                correctAnswer: card.english,
                wrongAnswers,
                wrongAnswer1: wrongAnswers[0] || "No answer available",
                wrongAnswer2: wrongAnswers[1],  // Will be undefined if only one wrong answer
                wrongReadings,
                audioPath: getAudioUrl(card.word_audio_path),
                englishAudioPath: getEnglishAudioUrl(card.english_audio_path),
                phrase: card.example_sentence_japanese ? {
                    text: card.example_sentence_japanese,
                    audioPath: getAudioUrl(card.sentence_audio_path)
                } : undefined,
                isReview: (progress?.totalMisses || 0) > 0,
                progress: progress?.progress || 0,
                timeToAnswer: progress?.timeToAnswer || 0,
                totalMisses: progress?.totalMisses || 0,
                correctAnswers: progress?.correctAnswers || 0
            };

            console.log(`Created quiz card for ${card.japanese_word} with ${wrongCards.length} wrong answers`);
            return quizCard;
        });

        if (quizCards) {
            console.log("quiz cards:")
            console.log(quizCards, JSON.stringify(quizCards, null, 2));
        }

        else {console.log("No quizz cards?")}

        console.log('=== FINISHED FETCHING SESSION CARDS ===\n');
        console.log("sessionWord, quizCards, nextWord are : ")
        console.log(sessionWords, quizCards, nextWord)

        return {
            sessionWords,
            quizCards,
            nextWord
        };
    } catch (error) {
        console.error('Error in fetchSupabaseSessionCards:', error);
        throw error;
    }
}

// --- Session-results prefetch cache ---------------------------------------
// Warms the (multi-query) session-cards fetch for an explicit set of word IDs
// while the quiz end screen is still showing, so navigating to the results
// page is instant instead of starting the load only after the redirect.
type SessionCardsResult = Awaited<ReturnType<typeof fetchSupabaseSessionCards>>;
const sessionCardsByIdsCache = new Map<string, Promise<SessionCardsResult>>();

// Key by ids AND content so a words prefetch and a sentences prefetch for the
// same word ids don't clobber each other.
function idsKey(wordIds: number[], content: string = 'words') {
    return `${content}:${[...wordIds].sort((a, b) => a - b).join(',')}`;
}

export function prefetchSessionCardsByIds(wordIds: number[], section?: string, step?: string, quizType: string = 'multiple_choice', content: 'words' | 'sentences' = 'words') {
    if (!wordIds || wordIds.length === 0) return;
    const key = idsKey(wordIds, content);
    if (sessionCardsByIdsCache.has(key)) return;
    const promise = fetchSupabaseSessionCards(wordIds.length, section, step, undefined, wordIds, 2, quizType, content);
    // Keep the original promise for the consumer; attach a no-op catch so an
    // early failure doesn't surface as an unhandled rejection before consume.
    promise.catch(() => {});
    sessionCardsByIdsCache.set(key, promise);
}

// Consume (once) a previously prefetched session-cards promise. Returns null if
// nothing was prefetched for these IDs, so the caller falls back to fetching.
export function takeCachedSessionCardsByIds(wordIds: number[], content: 'words' | 'sentences' = 'words'): Promise<SessionCardsResult> | null {
    const key = idsKey(wordIds, content);
    const promise = sessionCardsByIdsCache.get(key) ?? null;
    if (promise) sessionCardsByIdsCache.delete(key);
    return promise;
}

export async function fetchAllKanji(section: string) {
    console.log('\n=== FETCHING ALL KANJI ===');
    console.log('Section:', section);
    
    try {
        const response = await fetch(`/api/kanji/get-all?section=${section}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch kanji');
        }
        
        const data = await response.json();
        
        // Log a sample of the data
        if (data.kanji && data.kanji.length > 0) {
            console.log('Sample kanji data received:', {
                id: data.kanji[0].id,
                japanese_word: data.kanji[0].japanese_word,
                word_reading: data.kanji[0].word_reading,
                word_reading_2: data.kanji[0].word_reading_2,
                word_reading_3: data.kanji[0].word_reading_3
            });
        }
        
        return { kanji: data.kanji || [] };
    } catch (error) {
        console.error('Error fetching all kanji:', error);
        return { kanji: [] };
    }
}

export async function fetchSupabaseSessionKanji(
    sessionSize: number,
    section: string,
    startFrom: string
) {
    try {
        const response = await fetch(`/api/kanji/get-session?section=${section}&sessionSize=${sessionSize}&startFrom=${startFrom}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch session kanji');
        }
        
        const data = await response.json();
        return {
            sessionKanji: data.sessionKanji || [],
            nextKanji: data.nextKanji || null
        };
    } catch (error) {
        console.error('Error fetching session kanji:', error);
        return {
            sessionKanji: [],
            nextKanji: null
        };
    }
}

// --- Frequency kanji quiz -------------------------------------------------
// Mirrors fetchSupabaseSessionCards / fetchAllCards but sources kanji
// pronunciation items from the server. Each item is one kanji + one taught
// reading, with independent progress.

type KanjiFreqRow = {
    id: number;
    kanji_id: number;
    japanese_word: string;
    english: string;
    mnemonic: string | null;
    composed_of_kanji: string | null;
    composed_of_kanji_description: string | null;
    composed_of_kanji_2: string | null;
    composed_of_kanji_description_2: string | null;
    composed_of_kanji_3: string | null;
    composed_of_kanji_description_3: string | null;
    reading: string;
    accepted_readings: string[] | null;
    reading_type: string;
    reading_occurrences: number;
    reading_order: number;
    example_word: string | null;
    example_sentence_japanese: string | null;
    sentence_audio_path: string | null;
    reading_audio_path: string | null;
};

async function fetchKanjiFreqProgressBatch(
    kanjiIds: number[],
    quizType: string = 'multiple_choice',
): Promise<Record<number, ProgressBatchRow>> {
    if (kanjiIds.length === 0) return {};
    const res = await fetch(
        `/api/progress/get-batch-kanji-freq?cardIds=${kanjiIds.join(',')}&quizType=${encodeURIComponent(quizType)}`,
        { credentials: 'include' },
    );
    if (!res.ok) {
        throw new Error(`Failed to fetch kanji progress batch: ${res.status}`);
    }
    return (await res.json()) as Record<number, ProgressBatchRow>;
}

function buildKanjiFreqCards(rows: KanjiFreqRow[], progressMap: Record<number, ProgressBatchRow>, numWrongAnswers: number = 2) {
    const sessionWords = rows.map(row => {
        const progress = progressMap[row.id];
        return {
            id: row.id,
            japanese_word: row.japanese_word,
            english: row.english,
            reading: row.reading,
            progress: progress?.progress || 0,
            isReview: (progress?.totalMisses || 0) > 0,
            totalMisses: progress?.totalMisses || 0,
            correctAnswers: progress?.correctAnswers || 0,
            timeToAnswer: progress?.timeToAnswer || 0,
            progress_status: progress?.progress_status || 'new',
            marked_as: progress?.marked_as ?? undefined,
        };
    });

    const quizCards = rows.map(row => {
        // Wrong answers: other kanji's English meanings from this session set
        // (same approach as fetchSupabaseSessionCards).
        const usedIndices = new Set<number>();
        const maxWrongAnswers = Math.min(numWrongAnswers, rows.length - 1);
        const normalizeAnswer = (s: string) => s.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
        const correctEnglishKey = row.english ? normalizeAnswer(row.english) : '';
        const usedEnglishKeys = new Set<string>(correctEnglishKey ? [correctEnglishKey] : []);
        const wrongPairs: { answer: string; reading: string }[] = [];
        let attempts = 0;
        const maxAttempts = rows.length * 4;
        while (wrongPairs.length < maxWrongAnswers && attempts < maxAttempts) {
            attempts++;
            const i = Math.floor(Math.random() * rows.length);
            if (!usedIndices.has(i) && rows[i].id !== row.id) {
                const wrong = rows[i];
                usedIndices.add(i);
                if (!wrong.english || !wrong.reading) continue;
                const key = normalizeAnswer(wrong.english);
                if (!key || usedEnglishKeys.has(key)) continue;
                usedEnglishKeys.add(key);
                wrongPairs.push({ answer: wrong.english.trim().replace(/\s+/g, ' '), reading: wrong.reading });
            }
        }
        const progress = progressMap[row.id];
        const wrongAnswers = wrongPairs.map(pair => pair.answer);
        // Taught reading of each wrong item, parallel to wrongAnswers, so the
        // multiple-choice options can be rebuilt as readings when the option
        // language is Japanese (or per-word Mix) — same as the words quiz.
        const wrongReadings = wrongPairs.map(pair => pair.reading);
        return {
            id: row.id,
            question: row.japanese_word,
            kanjiEntryId: row.kanji_id,
            kanjiEntryCharacter: row.japanese_word,
            mnemonic: row.mnemonic ?? undefined,
            composed_of_kanji: row.composed_of_kanji ?? undefined,
            composed_of_kanji_description: row.composed_of_kanji_description ?? undefined,
            composed_of_kanji_2: row.composed_of_kanji_2 ?? undefined,
            composed_of_kanji_description_2: row.composed_of_kanji_description_2 ?? undefined,
            composed_of_kanji_3: row.composed_of_kanji_3 ?? undefined,
            composed_of_kanji_description_3: row.composed_of_kanji_description_3 ?? undefined,
            reading: row.reading,
            acceptedReadings: row.accepted_readings?.length ? row.accepted_readings : [row.reading],
            correctAnswer: row.english,
            wrongAnswers,
            wrongAnswer1: wrongAnswers[0] || 'No answer available',
            wrongAnswer2: wrongAnswers[1],
            wrongReadings,
            // Reading audio is per pronunciation item, not per kanji.
            audioPath: getEnglishAudioUrl(row.reading_audio_path),
            englishAudioPath: undefined,
            phrase: row.example_sentence_japanese ? {
                text: row.example_sentence_japanese,
                audioPath: getAudioUrl(row.sentence_audio_path),
            } : undefined,
            isReview: (progress?.totalMisses || 0) > 0,
            progress: progress?.progress || 0,
            timeToAnswer: progress?.timeToAnswer || 0,
            totalMisses: progress?.totalMisses || 0,
            correctAnswers: progress?.correctAnswers || 0,
        };
    });

    return { sessionWords, quizCards };
}

async function fetchKanjiFreqRowsByIds(kanjiIds: number[]): Promise<KanjiFreqRow[]> {
    const res = await fetch(`/api/kanji/get-freq-cards?ids=${kanjiIds.join(',')}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch kanji cards: ${res.status}`);
    const data = await res.json();
    return (data.kanji || []) as KanjiFreqRow[];
}

// Session cards for an explicit set of kanji ids (the session selection from
// /api/progress/last-kanji-freq, or the practiced ids on the results page).
export async function fetchKanjiFreqSessionCards(kanjiIds: number[], quizType: string = 'multiple_choice', numWrongAnswers: number = 2) {
    if (!kanjiIds || kanjiIds.length === 0) {
        throw new Error('No kanji ids provided');
    }
    const rows = await fetchKanjiFreqRowsByIds(kanjiIds);
    if (rows.length === 0) throw new Error('No kanji found for the provided ids');
    const progressMap = await fetchKanjiFreqProgressBatch(rows.map(r => r.id), quizType);
    const { sessionWords, quizCards } = buildKanjiFreqCards(rows, progressMap, numWrongAnswers);
    return { sessionWords, quizCards, nextWord: null };
}

// All kanji in a section/step window, with progress — for the session preview
// "all"/"session" lists. Mirrors fetchAllCards' { cards } shape.
export async function fetchAllKanjiFreqCards(section: string, step: string | undefined, quizType: string = 'multiple_choice') {
    const qs = new URLSearchParams({ section });
    if (step) qs.set('step', step);
    const res = await fetch(`/api/kanji/get-freq-cards?${qs.toString()}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch kanji window: ${res.status}`);
    const data = await res.json();
    const rows = (data.kanji || []) as KanjiFreqRow[];
    const progressMap = await fetchKanjiFreqProgressBatch(rows.map(r => r.id), quizType);
    const { sessionWords } = buildKanjiFreqCards(rows, progressMap);
    return { cards: sessionWords };
}

// Separate prefetch cache from the words one — kanji ids and word ids are both
// small ints, so a shared id-keyed cache could cross sessions. Keyed by ids+quizType.
type KanjiFreqCardsResult = Awaited<ReturnType<typeof fetchKanjiFreqSessionCards>>;
const kanjiFreqCardsByIdsCache = new Map<string, Promise<KanjiFreqCardsResult>>();

function kanjiIdsKey(kanjiIds: number[], quizType: string) {
    return `${quizType}:${[...kanjiIds].sort((a, b) => a - b).join(',')}`;
}

export function prefetchKanjiFreqCardsByIds(kanjiIds: number[], quizType: string = 'multiple_choice') {
    if (!kanjiIds || kanjiIds.length === 0) return;
    const key = kanjiIdsKey(kanjiIds, quizType);
    if (kanjiFreqCardsByIdsCache.has(key)) return;
    const promise = fetchKanjiFreqSessionCards(kanjiIds, quizType);
    promise.catch(() => {});
    kanjiFreqCardsByIdsCache.set(key, promise);
}

export function takeCachedKanjiFreqCardsByIds(kanjiIds: number[], quizType: string = 'multiple_choice'): Promise<KanjiFreqCardsResult> | null {
    const key = kanjiIdsKey(kanjiIds, quizType);
    const promise = kanjiFreqCardsByIdsCache.get(key) ?? null;
    if (promise) kanjiFreqCardsByIdsCache.delete(key);
    return promise;
}

// --- Kanji primitives quiz ------------------------------------------------
// Local display data for the primitive primer. Selection and progress are
// DB-backed through kanji_primitive_items / kanji_primitive_item_progress.

async function fetchKanjiPrimitiveProgressBatch(primitiveIds: number[], quizType: string = 'multiple_choice'): Promise<Record<number, ProgressBatchRow>> {
    if (!primitiveIds || primitiveIds.length === 0) return {};
    const res = await fetch(
        `/api/progress/get-batch-kanji-primitives?cardIds=${primitiveIds.join(',')}&quizType=${encodeURIComponent(quizType)}`,
        { credentials: 'include' }
    );
    if (!res.ok) {
        throw new Error(`Failed to fetch kanji primitive progress batch: ${res.status}`);
    }
    return res.json();
}

const primitiveKanjiEntryCache = new Map<string, Promise<any | null>>();

async function fetchPrimitiveKanjiEntry(character: string): Promise<any | null> {
    if (!primitiveKanjiEntryCache.has(character)) {
        primitiveKanjiEntryCache.set(character, fetchKanjiByCharacter(character).then(result => result.kanji || null));
    }
    return primitiveKanjiEntryCache.get(character)!;
}

function kanjiEntryFields(kanjiData: any): Partial<QuizCard> {
    if (!kanjiData) return {};
    return {
        kanjiEntryId: kanjiData.id,
        kanjiEntryCharacter: kanjiData.japanese_word,
        mnemonic: kanjiData.mnemonic ?? undefined,
        composed_of_kanji: kanjiData.composed_of_kanji_1 ?? kanjiData.composed_of_kanji ?? undefined,
        composed_of_kanji_description: kanjiData.composed_of_kanji_description_1 ?? kanjiData.composed_of_kanji_description ?? undefined,
        composed_of_kanji_2: kanjiData.composed_of_kanji_2 ?? undefined,
        composed_of_kanji_description_2: kanjiData.composed_of_kanji_description_2 ?? undefined,
        composed_of_kanji_3: kanjiData.composed_of_kanji_3 ?? undefined,
        composed_of_kanji_description_3: kanjiData.composed_of_kanji_description_3 ?? undefined,
    };
}

async function buildKanjiPrimitiveCards(ids?: number[], numWrongAnswers: number = 2, limit?: number, quizType: string = 'multiple_choice', includeKanjiDetails: boolean = false) {
    const rows = ids && ids.length > 0
        ? kanjiPrimitivesByIds(ids)
        : KANJI_PRIMITIVES.slice(0, limit && limit > 0 ? limit : KANJI_PRIMITIVES.length);
    const progressMap = await fetchKanjiPrimitiveProgressBatch(rows.map(row => row.id), quizType);
    const kanjiEntryByCharacter = new Map<string, any>();
    if (includeKanjiDetails) {
        const characters = Array.from(new Set(rows.map(row => row.dbMatches[0]).filter((value): value is string => !!value)));
        const entries = await Promise.all(characters.map(async character => [character, await fetchPrimitiveKanjiEntry(character)] as const));
        entries.forEach(([character, entry]) => {
            if (entry) kanjiEntryByCharacter.set(character, entry);
        });
    }
    const sessionWords = rows.map(row => ({
        ...(() => {
            const progress = progressMap[row.id];
            return {
                progress: progress?.progress || 0,
                isReview: (progress?.totalMisses || 0) > 0,
                totalMisses: progress?.totalMisses || 0,
                correctAnswers: progress?.correctAnswers || 0,
                timeToAnswer: progress?.timeToAnswer || 0,
                progress_status: progress?.progress_status || 'new' as const,
                marked_as: progress?.marked_as ?? undefined,
            };
        })(),
        id: row.id,
        japanese_word: row.label,
        english: row.meaning,
    }));

    const quizCards = rows.map(row => {
        const progress = progressMap[row.id];
        const wrongRows: typeof rows = [];
        const usedIndices = new Set<number>();
        const maxWrongAnswers = Math.min(numWrongAnswers, rows.length - 1);
        let attempts = 0;
        const maxAttempts = rows.length * 2;
        while (wrongRows.length < maxWrongAnswers && attempts < maxAttempts) {
            attempts++;
            const i = Math.floor(Math.random() * rows.length);
            if (!usedIndices.has(i) && rows[i].id !== row.id) {
                wrongRows.push(rows[i]);
                usedIndices.add(i);
            }
        }
        const wrongAnswers = wrongRows.map(other => other.meaning);
        const kanjiEntry = row.dbMatches[0] ? kanjiEntryByCharacter.get(row.dbMatches[0]) : null;
        return {
            id: row.id,
            question: row.label,
            ...kanjiEntryFields(kanjiEntry),
            correctAnswer: row.meaning,
            wrongAnswers,
            wrongAnswer1: wrongAnswers[0] || 'No answer available',
            wrongAnswer2: wrongAnswers[1],
            isReview: (progress?.totalMisses || 0) > 0,
            progress: progress?.progress || 0,
            timeToAnswer: progress?.timeToAnswer || 0,
            totalMisses: progress?.totalMisses || 0,
            correctAnswers: progress?.correctAnswers || 0,
            optionLang: 'english' as const,
        };
    });

    return { sessionWords, quizCards, nextWord: null };
}

export async function fetchKanjiPrimitiveSessionCards(ids?: number[], numWrongAnswers: number = 2, limit?: number, quizType: string = 'multiple_choice') {
    const result = await buildKanjiPrimitiveCards(ids, numWrongAnswers, limit, quizType, true);
    if (result.sessionWords.length === 0) throw new Error('No primitives found for the provided ids');
    return result;
}

export async function fetchAllKanjiPrimitiveCards(quizType: string = 'multiple_choice') {
    const { sessionWords } = await buildKanjiPrimitiveCards(KANJI_PRIMITIVES.map(row => row.id), 2, undefined, quizType);
    return { cards: sessionWords };
}

type KanjiPrimitiveCardsResult = Awaited<ReturnType<typeof fetchKanjiPrimitiveSessionCards>>;
const kanjiPrimitiveCardsByIdsCache = new Map<string, Promise<KanjiPrimitiveCardsResult>>();

function primitiveIdsKey(ids?: number[], quizType: string = 'multiple_choice') {
    const idsKey = ids && ids.length > 0 ? [...ids].sort((a, b) => a - b).join(',') : 'all';
    return `${quizType}:${idsKey}`;
}

export function prefetchKanjiPrimitiveCardsByIds(ids?: number[], quizType: string = 'multiple_choice') {
    const key = primitiveIdsKey(ids, quizType);
    if (kanjiPrimitiveCardsByIdsCache.has(key)) return;
    const promise = fetchKanjiPrimitiveSessionCards(ids, 2, undefined, quizType);
    promise.catch(() => {});
    kanjiPrimitiveCardsByIdsCache.set(key, promise);
}

export function takeCachedKanjiPrimitiveCardsByIds(ids?: number[], quizType: string = 'multiple_choice'): Promise<KanjiPrimitiveCardsResult> | null {
    const key = primitiveIdsKey(ids, quizType);
    const promise = kanjiPrimitiveCardsByIdsCache.get(key) ?? null;
    if (promise) kanjiPrimitiveCardsByIdsCache.delete(key);
    return promise;
}

export async function fetchKanjiByCharacter(character: string) {
    console.log('\n=== FETCHING KANJI BY CHARACTER ===');
    console.log('Character:', character);
    
    try {
        const response = await fetch(`/api/kanji/get-by-character?character=${encodeURIComponent(character)}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch kanji');
        }
        
        const data = await response.json();
        console.log('Response data:', {
            id: data.kanji?.id,
            japanese_word: data.kanji?.japanese_word,
            word_reading: data.kanji?.word_reading,
            word_reading_2: data.kanji?.word_reading_2,
            word_reading_3: data.kanji?.word_reading_3
        });
        
        return { kanji: data.kanji || null };
    } catch (error) {
        console.error('Error fetching kanji:', error);
        return { kanji: null };
    }
} 

// --- TUBELEX words quiz ---------------------------------------------------
// Parallel to the frequency kanji block above, but sources WORD rows from
// core_tubelex_ranked (ordered by tubelex_rank) and reads per-quiz-type
// progress from words_tubelex_progress. Returns the EXACT same card shapes the
// words quiz engine consumes, so quizz.tsx only swaps the fetch call. Rows from
// source='tubelex_added' carry NULL audio + NULL example sentence — handled
// gracefully (no audio / no phrase), they play text-only for now.

type TubelexRow = {
    id: number;
    japanese_word: string;
    japanese_reading: string | null;
    english: string;
    word_audio_path: string | null;
    english_audio_path: string | null;
    example_sentence_japanese: string | null;
    example_sentence_reading: string | null;
    example_sentence_english: string | null;
    sentence_audio_path: string | null;
    tubelex_rank: number | null;
};

async function fetchTubelexProgressBatch(
    wordIds: number[],
    quizType: string = 'multiple_choice',
): Promise<Record<number, ProgressBatchRow>> {
    if (wordIds.length === 0) return {};
    const res = await fetch(
        `/api/progress/get-batch-words-tubelex?cardIds=${wordIds.join(',')}&quizType=${encodeURIComponent(quizType)}`,
        { credentials: 'include' },
    );
    if (!res.ok) {
        throw new Error(`Failed to fetch tubelex progress batch: ${res.status}`);
    }
    return (await res.json()) as Record<number, ProgressBatchRow>;
}

function buildTubelexCards(rows: TubelexRow[], progressMap: Record<number, ProgressBatchRow>, numWrongAnswers: number = 2) {
    const sessionWords = rows.map(row => {
        const progress = progressMap[row.id];
        return {
            id: row.id,
            japanese_word: row.japanese_word,
            english: row.english,
            reading: row.japanese_reading ?? undefined,
            progress: progress?.progress || 0,
            isReview: (progress?.totalMisses || 0) > 0,
            totalMisses: progress?.totalMisses || 0,
            correctAnswers: progress?.correctAnswers || 0,
            timeToAnswer: progress?.timeToAnswer || 0,
            progress_status: progress?.progress_status || 'new',
            marked_as: progress?.marked_as ?? undefined,
        };
    });

    const quizCards = rows.map(row => {
        const wrongCards: TubelexRow[] = [];
        const usedIndices = new Set<number>();
        const maxWrongAnswers = Math.min(numWrongAnswers, rows.length - 1);
        let attempts = 0;
        const maxAttempts = rows.length * 2;
        while (wrongCards.length < maxWrongAnswers && attempts < maxAttempts) {
            attempts++;
            const i = Math.floor(Math.random() * rows.length);
            if (!usedIndices.has(i) && rows[i].id !== row.id) {
                wrongCards.push(rows[i]);
                usedIndices.add(i);
            }
        }
        const progress = progressMap[row.id];
        const wrongAnswers = wrongCards.map(c => c.english).filter((s): s is string => !!s);
        // Readings of the wrong cards, parallel to wrongAnswers, so the forward
        // quiz can rebuild options as hiragana when the option language is
        // Japanese (or per-word Mix) — same as the words quiz.
        const wrongReadings = wrongCards.map(c => c.japanese_reading).filter((s): s is string => !!s);
        return {
            id: row.id,
            question: row.japanese_word,
            reading: row.japanese_reading ?? undefined,
            correctAnswer: row.english,
            wrongAnswers,
            wrongAnswer1: wrongAnswers[0] || 'No answer available',
            wrongAnswer2: wrongAnswers[1],
            wrongReadings,
            audioPath: getAudioUrl(row.word_audio_path),
            englishAudioPath: getEnglishAudioUrl(row.english_audio_path),
            phrase: row.example_sentence_japanese ? {
                text: row.example_sentence_japanese,
                audioPath: getAudioUrl(row.sentence_audio_path),
            } : undefined,
            isReview: (progress?.totalMisses || 0) > 0,
            progress: progress?.progress || 0,
            timeToAnswer: progress?.timeToAnswer || 0,
            totalMisses: progress?.totalMisses || 0,
            correctAnswers: progress?.correctAnswers || 0,
        };
    });

    return { sessionWords, quizCards };
}

async function fetchTubelexRowsByIds(wordIds: number[]): Promise<TubelexRow[]> {
    const res = await fetch(`/api/words/get-tubelex-cards?ids=${wordIds.join(',')}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch tubelex cards: ${res.status}`);
    const data = await res.json();
    return (data.words || []) as TubelexRow[];
}

export async function fetchTubelexSessionCards(wordIds: number[], quizType: string = 'multiple_choice', numWrongAnswers: number = 2) {
    if (!wordIds || wordIds.length === 0) {
        throw new Error('No word ids provided');
    }
    const rows = await fetchTubelexRowsByIds(wordIds);
    if (rows.length === 0) throw new Error('No words found for the provided ids');
    const progressMap = await fetchTubelexProgressBatch(rows.map(r => r.id), quizType);
    const { sessionWords, quizCards } = buildTubelexCards(rows, progressMap, numWrongAnswers);
    return { sessionWords, quizCards, nextWord: null };
}

export async function fetchAllTubelexCards(section: string, step: string | undefined, quizType: string = 'multiple_choice') {
    const qs = new URLSearchParams({ section });
    if (step) qs.set('step', step);
    const res = await fetch(`/api/words/get-tubelex-cards?${qs.toString()}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch tubelex window: ${res.status}`);
    const data = await res.json();
    const rows = (data.words || []) as TubelexRow[];
    const progressMap = await fetchTubelexProgressBatch(rows.map(r => r.id), quizType);
    const { sessionWords } = buildTubelexCards(rows, progressMap);
    return { cards: sessionWords };
}

type TubelexCardsResult = Awaited<ReturnType<typeof fetchTubelexSessionCards>>;
const tubelexCardsByIdsCache = new Map<string, Promise<TubelexCardsResult>>();

function tubelexIdsKey(wordIds: number[], quizType: string) {
    return `${quizType}:${[...wordIds].sort((a, b) => a - b).join(',')}`;
}

export function prefetchTubelexCardsByIds(wordIds: number[], quizType: string = 'multiple_choice') {
    if (!wordIds || wordIds.length === 0) return;
    const key = tubelexIdsKey(wordIds, quizType);
    if (tubelexCardsByIdsCache.has(key)) return;
    const promise = fetchTubelexSessionCards(wordIds, quizType);
    promise.catch(() => {});
    tubelexCardsByIdsCache.set(key, promise);
}

export function takeCachedTubelexCardsByIds(wordIds: number[], quizType: string = 'multiple_choice'): Promise<TubelexCardsResult> | null {
    const key = tubelexIdsKey(wordIds, quizType);
    const promise = tubelexCardsByIdsCache.get(key) ?? null;
    if (promise) tubelexCardsByIdsCache.delete(key);
    return promise;
}
