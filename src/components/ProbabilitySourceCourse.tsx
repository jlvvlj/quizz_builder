import { AnnotatedSourceImage, FormulaDiagram, LessonMathText } from './FormulaExplorer';
import nativeContent from '@/data/probability-chapter-1-native.json';
import diagramHeights from '@/data/probability-chapter-1-diagrams.json';
import Link from 'next/link';
import ChapterContents from './ChapterContents';
import ChapterPracticeLinks from './ChapterPracticeLinks';
import NativeChapterContent from './NativeChapterContent';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import {
    getSourceChapter,
    sourceLessonUrl,
    SourceAsset,
    SourceImage,
    SourceUnit,
} from '@/utils/probability-source';

function materialCounts(unit: SourceUnit) {
    return [[unit.cards.length, 'card'], [unit.figures.length, 'figure'], [unit.examples.length, 'example']]
        .map(([count, noun]) => `${count} ${noun}${count === 1 ? '' : 's'}`).join(' · ');
}

function Excerpts({ images, title, context = '' }: { images: SourceImage[]; title: string; context?: string; priority?: boolean }) {
    return <div className="mb-5 space-y-3">{images.map(image => {
        const diagramHeight = (diagramHeights as Record<string, number>)[image.src];
        const diagram = {...image, diagramHeight, formulaRegions: image.formulaRegions?.filter(region => region.bounds[1] + region.bounds[3] <= diagramHeight)};
        return <AnnotatedSourceImage key={image.src} image={diagram} title={title} context={context || title} />;
    })}</div>;
}

function NativeContent({ id, context }: { id: string; context: string }) {
    const blocks = (nativeContent as Record<string, {kind: string; text: string}[]>)[id];
    return <div className="native-lesson-content space-y-5 text-base leading-8 text-[#E5E5E5] sm:text-lg" data-native-asset={id}>
        {blocks.map((block, index) => block.kind === 'formula'
            ? <FormulaDiagram key={index} source={block.text} context={context} latex />
            : <LessonMathText key={index} text={block.text} context={context} />)}
    </div>;
}

function AssetList({ title, assets, context = '' }: { title: string; assets: SourceAsset[]; context?: string }) {
    if (assets.length === 0) return null;
    return <section className="space-y-5" aria-label={title}>
        <h2 className="text-xl font-semibold text-white">{title} <span className="ml-1 text-sm font-normal text-[#A1A1A1]">{assets.length}</span></h2>
        {assets.length === 0 ? <p className="text-sm text-[#A1A1A1]">None in this passage.</p> : assets.map(asset => {
            const content = <>
                {title === 'Figures' && <Excerpts images={asset.images} title={asset.title} context={context} />}
                <NativeContent id={asset.id} context={context} />
                {asset.note && <p className="mt-3 text-sm leading-6 text-[#C8C8C8]">{asset.note}</p>}
            </>;
            return <div key={asset.id} className={title === 'Key points' ? 'lesson-key-card' : undefined}>
                <h3 className="mb-4 text-lg font-semibold text-[#D8D8D8]">{asset.title}</h3>
                {content}
            </div>;
        })}
    </section>;
}

function LessonMaterial({ unit }: { unit: SourceUnit }) {
    if (unit.content) return <>
        <NativeChapterContent blocks={unit.content} context={`chapter-2/${unit.id}`} />
        <details className="mt-8 rounded-xl border border-[#4F4F4F] p-4 sm:p-5">
            <summary className="cursor-pointer font-medium text-[#D1D1D1]">Key ideas</summary>
            <div className="mt-4 space-y-3 leading-7 text-[#D1D1D1]">{unit.summary.map(text=><p key={text}>{text}</p>)}</div>
        </details>
    </>;
    // Keep introductions to equations beside their statements, in source order.
    const material = [
        ...unit.mathPassages.map(asset => ({ kind: 'passage' as const, asset })),
        ...unit.cards.map(asset => ({ kind: 'card' as const, asset })),
        ...unit.figures.map(asset => ({ kind: 'figure' as const, asset })),
        ...unit.examples.map(asset => ({ kind: 'example' as const, asset })),
    ].sort((a, b) => {
        const first = a.asset.images[0];
        const second = b.asset.images[0];
        return first.pdfPage - second.pdfPage || first.bounds[1] - second.bounds[1];
    });
    const summary = <div className="space-y-4 text-base leading-7 text-[#D1D1D1]">
        {unit.summary.map(paragraph => <LessonMathText key={paragraph} text={paragraph} context={unit.id} />)}
    </div>;
    return <div className="space-y-8">
        <blockquote className="whitespace-pre-line break-words text-base leading-8 text-[#E5E5E5] sm:text-lg"><LessonMathText text={unit.openingText} context={unit.id} /></blockquote>
        {unit.mathPassages.length === 0 && summary}
        {material.map(item => {
            if (item.kind === 'passage') {
                return item.asset.text ? <div key={item.asset.id} className="space-y-5 text-base leading-8 text-[#E5E5E5] sm:text-lg">
                    {item.asset.text.split('\n\n').map((paragraph, index) => <LessonMathText key={index} text={paragraph} context={unit.id} />)}
                </div> : <NativeContent key={item.asset.id} id={item.asset.id} context={unit.id} />;
            }
            return <AssetList key={item.asset.id} title={item.kind === 'card' ? 'Key points' : item.kind === 'figure' ? 'Figures' : 'Examples'} assets={[item.asset]} context={unit.id} />;
        })}
        {unit.mathPassages.length > 0 && <details className="rounded-xl border border-[#4F4F4F] p-4 sm:p-5">
            <summary className="cursor-pointer font-medium text-[#D1D1D1]">Key ideas</summary>
            <div className="mt-4">{summary}</div>
        </details>}
    </div>;
}

export function ProbabilitySourceOutline({ sectionId, deckId = 'probability-chapter-1' }: { sectionId: string; deckId?: string }) {
    const chapter = getSourceChapter(deckId)!;
    const number = chapter.sections[0].id.split('.')[0];
    return <main className="min-h-screen bg-[#181818] px-4 py-8 text-white sm:px-8"><div className="mx-auto max-w-6xl">
        <Link href="/home" className="mb-6 inline-flex items-center gap-2 text-sm text-[#B8B8B8] hover:text-white"><ArrowLeft className="h-4 w-4" />Learning decks</Link>
        <h1 className="text-3xl font-bold">{number}. {chapter.title}</h1>
        <p className="mt-3 text-[#B8B8B8]">{chapter.sections.length} sections · {chapter.lessonCount} lessons</p>
        <p className="mt-3 max-w-3xl leading-7 text-[#B8B8B8]">Explore probability through definitions, formulas, diagrams, and worked examples.</p>
        <ChapterPracticeLinks sectionId={sectionId} />
        <div className="mt-8 space-y-8">
            {chapter.sections.map(section => {
                const items = chapter.units.filter(item => item.section === section.id);
                return <section key={section.id} aria-label={`${section.id} ${section.title}`} className="rounded-xl border border-[#4F4F4F] bg-[#262626] p-5 sm:p-6">
                    <h2 className="text-lg font-bold sm:text-xl">{section.id} {section.title}</h2>
                    <p className="mt-2 text-sm text-[#A1A1A1]">{items.length} {items.length === 1 ? 'lesson' : 'lessons'}{items[0]?.kind === 'section' ? ' · No separate subsection headings' : ''}</p>
                    <ol className="mt-5 grid gap-3 md:grid-cols-2">
                        {items.map(item => <li key={item.id}>
                            <Link href={sourceLessonUrl(sectionId, item.id, deckId)} className="flex h-full items-center justify-between gap-4 rounded-lg border border-[#4F4F4F] bg-[#181818] p-4 transition-colors hover:border-[#FF0054] hover:bg-[#242424]">
                                <span><span className="block font-semibold">{item.kind === 'introduction' ? 'Intro' : item.title}</span><span className="mt-2 block text-xs leading-5 text-[#A1A1A1]">{materialCounts(item)}</span></span>
                                <ArrowRight className="h-4 w-4 shrink-0 text-[#FF4B86]" />
                            </Link>
                        </li>)}
                    </ol>
                </section>;
            })}
        </div>
    </div></main>;
}

export function ProbabilitySourceLesson({ sectionId, itemId, deckId = 'probability-chapter-1' }: { sectionId: string; itemId?: string; deckId?: string }) {
    const chapter = getSourceChapter(deckId)!;
    const number = chapter.sections[0].id.split('.')[0];
    const unit = chapter.units.find(item => item.id === itemId);
    if (!unit) return <ProbabilitySourceOutline sectionId={sectionId} deckId={deckId} />;
    const section = chapter.sections.find(item => item.id === unit.section)!;
    const index = chapter.units.findIndex(item => item.id === unit.id);
    const previous = chapter.units[index - 1];
    const next = chapter.units[index + 1];
    return <main className="min-h-screen bg-[#181818] px-4 py-8 text-white sm:px-8"><div className="mx-auto max-w-5xl">
        <Link href={`/steps?section=${encodeURIComponent(sectionId)}`} className="mb-6 inline-flex items-center gap-2 text-sm text-[#B8B8B8] hover:text-white"><ArrowLeft className="h-4 w-4" />Chapter {number} lessons</Link>
        <ChapterContents chapter={chapter} sectionId={sectionId} unit={unit} />
        <header className="mb-8 border-b border-[#4F4F4F] pb-6">
            <p className="mb-3 text-sm font-semibold tracking-wide text-[#FF80AA]">{section.id} {section.title}</p>
            <h1 className="text-3xl font-bold sm:text-4xl">{unit.kind === 'introduction' ? 'Intro' : unit.title}</h1>
            <p className="mt-4 flex items-center gap-2 text-sm text-[#A1A1A1]"><BookOpen className="h-4 w-4" />{materialCounts(unit)}</p>
        </header>
        <LessonMaterial key={unit.id} unit={unit} />
        <nav aria-label="Lesson navigation" className="mt-10 flex flex-wrap justify-between gap-4 border-t border-[#4F4F4F] pt-6">
            {previous ? <Link className="inline-flex items-center gap-2 rounded-lg border border-[#4F4F4F] px-4 py-3 text-sm hover:bg-[#303030]" href={sourceLessonUrl(sectionId, previous.id, deckId)}><ArrowLeft className="h-4 w-4" />Previous: {previous.kind === 'introduction' ? `${previous.section} introduction` : previous.title}</Link> : <span />}
            {next ? <Link className="inline-flex items-center gap-2 rounded-lg bg-[#FF0054] px-4 py-3 text-sm font-semibold hover:bg-[#e6004c]" href={sourceLessonUrl(sectionId, next.id, deckId)}>Next: {next.kind === 'introduction' ? `${next.section} introduction` : next.title}<ArrowRight className="h-4 w-4" /></Link> : <Link className="rounded-lg bg-[#FF0054] px-4 py-3 text-sm font-semibold" href={`/steps?section=${encodeURIComponent(sectionId)}`}>Back to Chapter {number}</Link>}
        </nav>
        <ChapterPracticeLinks sectionId={sectionId} />
    </div></main>;
}
