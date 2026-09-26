import chapterOne from '@/data/probability-chapter-1-source.json';
import chapterTwo from '@/data/probability-chapter-2-source.json';
import chapterThree from '@/data/probability-chapter-3-source.json';
import cs109PartOne from '@/data/cs109-part-1-source.json';

export interface LessonBlock {
    kind: 'paragraph' | 'formula' | 'heading' | 'keypoint' | 'cardEnd' | 'figure' | 'code' | 'list' | 'table' | 'interactive';
    /** For an interactive block, the id of the figure to place there. */
    text: string;
    /** Book chapters only: the PDF page the block was transcribed from. */
    pdfPage?: number;
    src?: string;
    /** Figures from the CS109 reader carry their own description, having no caption. */
    alt?: string;
    language?: string;
    items?: string[];
    header?: string[];
    rows?: string[][];
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
    /** What one deck is called in its course: a book "Chapter" (the default) or a reader "Part". */
    label?: string;
    lessonCount: number;
    sections: { id: string; title: string }[];
    units: SourceUnit[];
}

export const probabilityChapterOne = chapterOne as SourceChapter;
export const probabilityChapterTwo = chapterTwo as SourceChapter;
export const probabilityChapterThree = chapterThree as SourceChapter;
export const cs109PartOneSource = cs109PartOne as SourceChapter;
export function getSourceChapter(deckId: string): SourceChapter | undefined {
    return [probabilityChapterOne, probabilityChapterTwo, probabilityChapterThree, cs109PartOneSource].find(chapter => chapter.deckId === deckId);
}

export const chapterOneLessons = probabilityChapterOne.units;

export function sourceLessonUrl(sectionId: string, itemId: string, deckId = probabilityChapterOne.deckId): string {
    return `/lesson?${new URLSearchParams({ section: sectionId, deck: deckId, item: itemId })}`;
}

/** A lesson title as plain text, for places that cannot hold notation (select options, link text). */
export function plainTitle(title: string): string {
    return title.replace(/\$([^$]*)\$/g, '$1');
}

/** What a deck is called in its course: "Chapter 3" or "Part 1". */
export function deckName(chapter: SourceChapter): string {
    return `${chapter.label ?? 'Chapter'} ${chapter.sections[0].id.split('.')[0]}`;
}
