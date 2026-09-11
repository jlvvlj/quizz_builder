import type { Flashcard } from "./db"
import { getAudioUrl } from "./audioUrl"

export interface QuizCard {
    id: number;
    question: string;             // Japanese word
    correctAnswer: string;        // English translation
    wrongAnswer: string;         // Random wrong translation
    audioPath?: string;          // Path to audio file
    phrase?: {
        text: string;            // Example sentence
        audioPath?: string;      // Path to sentence audio file
    };
    isReview: boolean;
}

export interface SessionWord {
    id: number;
    word: string;        // Japanese word
    reading?: string;    // Japanese reading (hiragana/katakana)
    meaning: string;     // English translation
    progress: number;
    isReview: boolean;
    totalMisses?: number;  // Total number of times this word was missed
    correctAnswers?: number; // Total number of correct answers for this word
    timeToAnswer?: number;  // Time taken to answer in seconds
    progress_status?: 'new' | 'learning' | 'mastered' | 'to_review';  // Current progress status
    marked_as?: 'new' | 'learning' | 'mastered' | 'to_review';  // User marked status
}

export async function fetchNextWord(afterId: number): Promise<Flashcard | null> {
    try {
        const response = await fetch(`/api/flashcards/next?afterId=${afterId}`)
        if (!response.ok) {
            throw new Error('Failed to fetch next word')
        }
        const data = await response.json()
        return data.nextWord
    } catch (error) {
        console.error('Failed to fetch next word:', error)
        return null
    }
}

export async function fetchSessionCards(pageSize: number = 10, startId?: number): Promise<{
    sessionWords: SessionWord[];
    quizCards: QuizCard[];
    nextWord?: Flashcard;
}> {
    try {
        console.log('Initializing session...');
        // Initialize session if needed
        const initResponse = await fetch('/api/session/init', { 
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!initResponse.ok) {
            const error = await initResponse.text();
            throw new Error(`Failed to initialize session: ${initResponse.status} - ${error}`);
        }

        const sessionData = await initResponse.json();
        console.log('Session initialized successfully, userId:', sessionData.userId);

        // Try to get one missed word first
        const missedResponse = await fetch('/api/progress/get-missed-words?limit=1', {
            credentials: 'include'
        });
        let missedWord = null;
        if (missedResponse.ok) {
            const missedWords = await missedResponse.json();
            if (missedWords && missedWords.length > 0) {
                missedWord = missedWords[0];
                console.log('Including missed word:', missedWord);
            }
        }

        // Adjust pageSize if we have a missed word
        const newWordsCount = missedWord ? pageSize - 1 : pageSize;

        // Get the starting ID for new words
        let actualStartId: number;
        if (startId !== undefined) {
            actualStartId = startId;
        } else {
            const progressResponse = await fetch('/api/progress/last-word', {
                credentials: 'include'
            });
            if (!progressResponse.ok) {
                throw new Error('Failed to get last word progress');
            }
            const { lastWordId = 0 } = await progressResponse.json();
            actualStartId = lastWordId + 1;
        }

        // Fetch new cards and next word in parallel
        console.log('Fetching cards with startId:', actualStartId, 'count:', newWordsCount);
        const [cardsResponse, nextWord] = await Promise.all([
            fetch(`/api/flashcards/range?startId=${actualStartId}&count=${newWordsCount}`, {
                credentials: 'include'
            }),
            fetchNextWord(actualStartId + newWordsCount - 1)
        ]);

        if (!cardsResponse.ok) {
            const error = await cardsResponse.text();
            throw new Error(`Failed to fetch flashcards: ${cardsResponse.status} - ${error}`);
        }

        const data = await cardsResponse.json();
        console.log('Received flashcards:', data.cards.length);
        let dbCards: Flashcard[] = data.cards;

        // If we have a missed word, fetch its details and add it to the beginning
        if (missedWord) {
            const missedCardResponse = await fetch(`/api/flashcards/${missedWord.cardId}`);
            if (missedCardResponse.ok) {
                const missedCard = await missedCardResponse.json();
                dbCards = [missedCard, ...dbCards];
                console.log('Added missed word to session:', missedCard.id);
            }
        }

        // Create quiz cards with random wrong answers
        const quizCards: QuizCard[] = dbCards.map((card) => {
            // Get a random card for wrong answer that's not the current card
            let wrongCard;
            do {
                const randomIndex = Math.floor(Math.random() * dbCards.length);
                wrongCard = dbCards[randomIndex];
            } while (wrongCard.id === card.id);

            // Extract the file number from the audio path
            const audioFileMatch = card.audio?.word?.match(/\/([^/]+)$/);
            const audioFileName = audioFileMatch ? audioFileMatch[1] : undefined;

            // Extract the file number from the sentence audio path
            const sentenceAudioFileMatch = card.audio?.sentence?.match(/\/([^/]+)$/);
            const sentenceAudioFileName = sentenceAudioFileMatch ? sentenceAudioFileMatch[1] : undefined;

            return {
                id: card.id,
                question: card.japanese.word,
                correctAnswer: card.english,
                wrongAnswer: wrongCard.english,
                audioPath: getAudioUrl(audioFileName),
                phrase: card.exampleSentence ? {
                    text: card.exampleSentence.japanese.text,
                    audioPath: getAudioUrl(sentenceAudioFileName)
                } : undefined,
                isReview: false
            };
        });

        // Create session words (simpler format for preview)
        const sessionWords: SessionWord[] = dbCards.map(card => ({
            id: card.id,
            word: card.japanese.word,
            meaning: card.english,
            progress: 0,
            isReview: false,
            totalMisses: 0,
            correctAnswers: 0
        }));

        // Fetch progress for these words
        console.log('Fetching progress data...');
        try {
            const progressResponse = await fetch(
                `/api/progress/get-batch?cardIds=${sessionWords.map(w => w.id).join(',')}`,
                { credentials: 'include' }
            );
            
            if (!progressResponse.ok) {
                const error = await progressResponse.text();
                throw new Error(`Failed to fetch progress: ${progressResponse.status} - ${error}`);
            }

            const progressData = await progressResponse.json();
            console.log('Progress data received:', progressData);
            
            // Update session words with progress data
            sessionWords.forEach(word => {
                const progress = progressData[word.id];
                if (progress) {
                    word.progress = progress.progress || 0;
                    word.totalMisses = progress.totalMisses || 0;
                    word.correctAnswers = progress.correctAnswers || 0;
                    word.timeToAnswer = progress.timeToAnswer || 0;
                    word.isReview = progress.totalMisses > 0;
                    word.progress_status = progress.progress_status;
                    word.marked_as = progress.marked_as;
                }
            });

            // Update quiz cards with review status
            quizCards.forEach(card => {
                const progress = progressData[card.id];
                if (progress) {
                    card.isReview = progress.totalMisses > 0;
                }
            });
        } catch (error) {
            console.error('Failed to fetch progress data:', error);
            // Continue without progress data, but rethrow if it's a session error
            if (error instanceof Error && error.message.includes('No session found')) {
                throw error;
            }
        }

        console.log('Session cards prepared successfully');
        return { 
            sessionWords, 
            quizCards,
            nextWord: nextWord || undefined
        };
    } catch (error) {
        console.error('Failed to fetch cards:', error);
        throw error;
    }
} 
