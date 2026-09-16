import chapterOne from '@/data/probability-chapter-1-source.json';

export interface SourceImage {
    src: string;
    width: number;
    height: number;
    pdfPage: number;
    printedPage: number;
    bounds: number[];
}

export interface SourceAsset {
    id: string;
    title: string;
    note?: string;
    images: SourceImage[];
}

export interface SourcePassage extends SourceAsset {
    text?: string;
}

export interface SourceUnit {
    id: string;
    section: string;
    title: string;
    kind: 'subsection' | 'section' | 'introduction';
    opening: { images: SourceImage[] };
    openingText: string;
    summary: string[];
    formulas: string[];
    cards: SourceAsset[];
    figures: SourceAsset[];
    examples: SourceAsset[];
    mathPassages: SourcePassage[];
    sourcePages: SourceImage[];
}

export const probabilityChapterOne = chapterOne as {
    deckId: string;
    title: string;
    lessonCount: number;
    sections: { id: string; title: string }[];
    units: SourceUnit[];
};

export const chapterOneLessons = probabilityChapterOne.units;

export function sourceLessonUrl(sectionId: string, itemId: string): string {
    return `/lesson?${new URLSearchParams({ section: sectionId, deck: probabilityChapterOne.deckId, item: itemId })}`;
}
