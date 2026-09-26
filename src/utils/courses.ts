import cs109 from '@/data/cs109-course.json';

export interface CourseEntry { id: string; title: string; available: boolean }

export interface CoursePart {
    deckId: string;
    number: number;
    key: string;
    title: string;
    chapters: CourseEntry[];
    applications: CourseEntry[];
}

export interface Course {
    id: string;
    title: string;
    subtitle: string;
    /** Decks in reading order: book chapters, or reader parts. */
    deckIds: string[];
    /** Present for courses whose outline is known before their decks have lessons. */
    parts?: CoursePart[];
    sourceUrl?: string;
}

export const cs109Course = cs109 as { title: string; subtitle: string; source: { url: string }; parts: CoursePart[] };

export const courses: Course[] = [
    {
        id: 'bertsekas',
        title: 'Introduction to Probability',
        subtitle: 'Bertsekas & Tsitsiklis',
        // Named rather than read from the chapter sources, so this registry stays small enough to import anywhere.
        deckIds: ['probability-chapter-1', 'probability-chapter-2', 'probability-chapter-3'],
    },
    {
        id: 'cs109',
        title: cs109Course.title,
        subtitle: cs109Course.subtitle,
        deckIds: cs109Course.parts.map(part => part.deckId),
        parts: cs109Course.parts,
        sourceUrl: cs109Course.source.url,
    },
];

export function getCourse(id: string): Course | undefined {
    return courses.find(course => course.id === id);
}

export function courseOfDeck(deckId: string): Course | undefined {
    return courses.find(course => course.deckIds.includes(deckId));
}
