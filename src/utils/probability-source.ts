import chapterOne from '@/data/probability-chapter-1-source.json';
import chapterTwo from '@/data/probability-chapter-2-source.json';

export interface LessonBlock {
    kind: 'paragraph' | 'formula' | 'heading' | 'keypoint' | 'cardEnd' | 'figure';
    text: string;
    pdfPage: number;
    src?: string;
}

export interface SourceImage {
    src: string;
    width: number;
    height: number;
    pdfPage: number;
    printedPage: number;
    bounds: number[];
    diagramHeight?: number;
    formulaRegions?: {bounds: number[]; terms: {symbol: string; bounds: number[]}[]}[];
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
    content?: LessonBlock[];
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

export interface SourceChapter {
    deckId: string;
    title: string;
    lessonCount: number;
    sections: { id: string; title: string }[];
    units: SourceUnit[];
}

export const probabilityChapterOne = chapterOne as SourceChapter;
export const probabilityChapterTwo = chapterTwo as SourceChapter;
export function getSourceChapter(deckId: string): SourceChapter | undefined {
    return [probabilityChapterOne, probabilityChapterTwo].find(chapter => chapter.deckId === deckId);
}

export const chapterOneLessons = probabilityChapterOne.units;

export function sourceLessonUrl(sectionId: string, itemId: string, deckId = probabilityChapterOne.deckId): string {
    return `/lesson?${new URLSearchParams({ section: sectionId, deck: deckId, item: itemId })}`;
}
