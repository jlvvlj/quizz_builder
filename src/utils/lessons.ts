import probabilityChapterOne from '@/data/probability-chapter-1-lessons.json';

export interface LessonExample {
    title: string;
    situation: string;
    walkthrough: string[];
    result: string;
}

export interface LessonConcept {
    title: string;
    explanation: string;
    formula?: string | null;
    example: LessonExample;
    remember: string;
    commonMistake: string;
}

export interface LessonQuickCheck {
    prompt: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

export interface Lesson {
    step: string;
    title: string;
    subtitle: string;
    durationMinutes: number;
    introduction: string;
    objectives: string[];
    concepts: LessonConcept[];
    quickChecks: LessonQuickCheck[];
}

export interface LessonDeck {
    deckId: string;
    deckTitle: string;
    lessons: Lesson[];
}

const lessonDecks: Record<string, LessonDeck> = {
    [probabilityChapterOne.deckId]: probabilityChapterOne as LessonDeck,
};

export function getLesson(deckId: string, step: string): Lesson | undefined {
    return lessonDecks[deckId]?.lessons.find((lesson) => lesson.step === step);
}

export function hasLesson(deckId: string, step: string): boolean {
    return Boolean(getLesson(deckId, step));
}

