import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import {
    chapterOneLessons,
    probabilityChapterOne as chapter,
    sourceLessonUrl,
    SourceAsset,
    SourceImage,
    SourceUnit,
} from '@/utils/probability-source';

function materialCounts(unit: SourceUnit) {
    return [[unit.cards.length, 'card'], [unit.figures.length, 'figure'], [unit.examples.length, 'example']]
        .map(([count, noun]) => `${count} ${noun}${count === 1 ? '' : 's'}`).join(' · ');
}

function Excerpts({ images, title, priority = false }: { images: SourceImage[]; title: string; priority?: boolean }) {
    return <div className="space-y-3">
        {images.map((image, index) => (
            <figure key={image.src} className="overflow-hidden rounded-lg border border-[#4F4F4F] bg-white">
                <a href={image.src} target="_blank" rel="noreferrer" aria-label={`Open ${title}, page ${image.printedPage}, at full size`}>
                    <Image
                        src={image.src}
                        alt={`${title}. Exact excerpt from page ${image.printedPage}${images.length > 1 ? `, part ${index + 1} of ${images.length}` : ''}.`}
                        width={image.width}
                        height={image.height}
                        unoptimized
                        priority={priority && index === 0}
                        className="h-auto w-full"
                    />
                </a>
                <figcaption className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-600">
                    Page {image.printedPage} · PDF page {image.pdfPage} · Select the excerpt to enlarge
                </figcaption>
            </figure>
        ))}
    </div>;
}

function AssetList({ title, assets, collapsible = false }: { title: string; assets: SourceAsset[]; collapsible?: boolean }) {
    if (assets.length === 0) return null;
    return <section className="space-y-5" aria-label={title}>
        <h2 className="text-xl font-semibold text-white">{title} <span className="ml-1 text-sm font-normal text-[#A1A1A1]">{assets.length}</span></h2>
        {assets.length === 0 ? <p className="text-sm text-[#A1A1A1]">None in this passage.</p> : assets.map(asset => {
            const content = <>
                <Excerpts images={asset.images} title={asset.title} />
                {asset.note && <p className="mt-3 text-sm leading-6 text-[#C8C8C8]">{asset.note}</p>}
            </>;
            return collapsible ? (
                <details key={asset.id} className="rounded-xl border border-[#4F4F4F] bg-[#202020] p-4 sm:p-5">
                    <summary className="cursor-pointer text-lg font-medium text-white">{asset.title} <span className="ml-2 text-sm font-normal text-[#A1A1A1]">Read the complete example</span></summary>
                    <div className="mt-5">{content}</div>
                </details>
            ) : <div key={asset.id}>
                <h3 className="mb-3 font-medium text-[#D8D8D8]">{asset.title}</h3>
                {content}
            </div>;
        })}
    </section>;
}

function LessonMaterial({ unit }: { unit: SourceUnit }) {
    return <div className="space-y-10">
        <section aria-label={unit.title}>
            <blockquote className="whitespace-pre-line break-words border-l-2 border-[#FF0054] pl-5 text-base leading-8 text-[#E5E5E5] sm:text-lg">{unit.openingText}</blockquote>
            <div className="mt-6 space-y-4 text-base leading-7 text-[#D1D1D1]">
                {unit.summary.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {unit.formulas.length > 0 && <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-white">Formulas</h3>
                {unit.formulas.map(formula => <div key={formula} className="overflow-x-auto rounded-lg border border-[#FF0054]/30 bg-[#181818] p-4 font-mono text-sm leading-7 text-[#FF9BBB] sm:text-base">{formula}</div>)}
            </div>}
        </section>
        <AssetList title="Key points" assets={unit.cards} />
        <AssetList title="Figures" assets={unit.figures} />
        <AssetList title="Examples" assets={unit.examples} collapsible />
        <details className="rounded-lg border border-[#4F4F4F] p-4">
            <summary className="cursor-pointer text-sm text-[#A1A1A1]">View the original wording and notation</summary>
            <div className="mt-4"><Excerpts images={unit.opening.images} title={unit.title} /></div>
        </details>
        <details className="rounded-xl border border-[#4F4F4F] p-4 sm:p-5">
            <summary className="cursor-pointer font-medium text-[#D1D1D1]">Complete original passage</summary>
            <p className="my-4 text-sm leading-6 text-[#A1A1A1]">Read every derivation and inline formula in its original layout. Figures that continue onto another page are also collected above with their full captions.</p>
            <Excerpts images={unit.sourcePages} title={unit.title} />
        </details>
    </div>;
}

export function ProbabilitySourceOutline({ sectionId }: { sectionId: string }) {
    return <main className="min-h-screen bg-[#181818] px-4 py-8 text-white sm:px-8"><div className="mx-auto max-w-6xl">
        <Link href="/home" className="mb-6 inline-flex items-center gap-2 text-sm text-[#B8B8B8] hover:text-white"><ArrowLeft className="h-4 w-4" />Learning decks</Link>
        <h1 className="text-3xl font-bold">1. {chapter.title}</h1>
        <p className="mt-3 text-[#B8B8B8]">7 sections · {chapter.lessonCount} lessons</p>
        <p className="mt-3 max-w-3xl leading-7 text-[#B8B8B8]">Explore probability through definitions, formulas, diagrams, and worked examples.</p>
        <div className="mt-8 space-y-8">
            {chapter.sections.map(section => {
                const items = chapterOneLessons.filter(item => item.section === section.id);
                return <section key={section.id} aria-label={`${section.id} ${section.title}`} className="rounded-xl border border-[#4F4F4F] bg-[#262626] p-5 sm:p-6">
                    <h2 className="text-lg font-bold sm:text-xl">{section.id} {section.title}</h2>
                    <p className="mt-2 text-sm text-[#A1A1A1]">{items.length} {items.length === 1 ? 'lesson' : 'lessons'}{items[0]?.kind === 'section' ? ' · No separate subsection headings' : ''}</p>
                    <ol className="mt-5 grid gap-3 md:grid-cols-2">
                        {items.map(item => <li key={item.id}>
                            <Link href={sourceLessonUrl(sectionId, item.id)} className="flex h-full items-center justify-between gap-4 rounded-lg border border-[#4F4F4F] bg-[#181818] p-4 transition-colors hover:border-[#FF0054] hover:bg-[#242424]">
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

export function ProbabilitySourceLesson({ sectionId, itemId }: { sectionId: string; itemId?: string }) {
    const unit = chapter.units.find(item => item.id === itemId);
    if (!unit) return <ProbabilitySourceOutline sectionId={sectionId} />;
    const section = chapter.sections.find(item => item.id === unit.section)!;
    const index = chapter.units.findIndex(item => item.id === unit.id);
    const previous = chapter.units[index - 1];
    const next = chapter.units[index + 1];
    return <main className="min-h-screen bg-[#181818] px-4 py-8 text-white sm:px-8"><div className="mx-auto max-w-5xl">
        <Link href={`/steps?section=${encodeURIComponent(sectionId)}`} className="mb-6 inline-flex items-center gap-2 text-sm text-[#B8B8B8] hover:text-white"><ArrowLeft className="h-4 w-4" />Chapter 1 lessons</Link>
        <header className="mb-8 border-b border-[#4F4F4F] pb-6">
            <p className="mb-3 text-sm font-semibold tracking-wide text-[#FF80AA]">{section.id} {section.title}</p>
            <h1 className="text-3xl font-bold sm:text-4xl">{unit.kind === 'introduction' ? 'Intro' : unit.title}</h1>
            <p className="mt-4 flex items-center gap-2 text-sm text-[#A1A1A1]"><BookOpen className="h-4 w-4" />{materialCounts(unit)}</p>
        </header>
        <LessonMaterial key={unit.id} unit={unit} />
        <nav aria-label="Lesson navigation" className="mt-10 flex flex-wrap justify-between gap-4 border-t border-[#4F4F4F] pt-6">
            {previous ? <Link className="inline-flex items-center gap-2 rounded-lg border border-[#4F4F4F] px-4 py-3 text-sm hover:bg-[#303030]" href={sourceLessonUrl(sectionId, previous.id)}><ArrowLeft className="h-4 w-4" />Previous: {previous.kind === 'introduction' ? `${previous.section} introduction` : previous.title}</Link> : <span />}
            {next ? <Link className="inline-flex items-center gap-2 rounded-lg bg-[#FF0054] px-4 py-3 text-sm font-semibold hover:bg-[#e6004c]" href={sourceLessonUrl(sectionId, next.id)}>Next: {next.kind === 'introduction' ? `${next.section} introduction` : next.title}<ArrowRight className="h-4 w-4" /></Link> : <Link className="rounded-lg bg-[#FF0054] px-4 py-3 text-sm font-semibold" href={`/steps?section=${encodeURIComponent(sectionId)}`}>Back to Chapter 1</Link>}
        </nav>
    </div></main>;
}
