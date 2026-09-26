"use client"
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import LoadingState from '@/components/LoadingState';
import { useCatalog } from '@/utils/catalog';
import { CourseEntry, getCourse } from '@/utils/courses';

function EntryList({ title, entries }: { title: string; entries: CourseEntry[] }) {
    if (entries.length === 0) return null;
    return <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#A1A1A1]">{title} <span className="font-normal">{entries.length}</span></h3>
        <ol className="grid gap-2 md:grid-cols-2">
            {entries.map((entry, index) => <li key={entry.id} className="flex items-baseline gap-3 rounded-lg border border-[#3A3A3A] bg-[#181818] px-4 py-3">
                <span className="w-6 shrink-0 text-right text-xs text-[#7A7A7A]">{index + 1}</span>
                <span className="text-[#E5E5E5]">{entry.title}</span>
                {!entry.available && <span className="ml-auto text-xs text-[#7A7A7A]">no chapter document</span>}
            </li>)}
        </ol>
    </div>;
}

// The whole outline of a course whose parts are listed ahead of their lessons.
export default function CourseRoute() {
    const router = useRouter();
    const { sections, error } = useCatalog();
    const course = typeof router.query.id === 'string' ? getCourse(router.query.id) : undefined;
    if (!router.isReady) return <LoadingState text="Loading course" />;
    if (!course?.parts) return <main className="min-h-screen bg-[#181818] p-8 text-white">
        <p>This course has no outline page.</p>
        <Link href="/home" className="mt-4 inline-block text-[#FF80AA]">Back to learning decks</Link>
    </main>;
    return <main className="min-h-screen bg-[#181818] px-4 py-8 text-white sm:px-8"><div className="mx-auto max-w-6xl">
        <Link href="/home" className="mb-6 inline-flex items-center gap-2 text-sm text-[#B8B8B8] hover:text-white"><ArrowLeft className="h-4 w-4" />Learning decks</Link>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="mt-2 text-[#B8B8B8]">{course.subtitle}</p>
        <p className="mt-3 text-[#B8B8B8]">{course.parts.length} parts · {course.parts.reduce((n, p) => n + p.chapters.length, 0)} chapters · {course.parts.reduce((n, p) => n + p.applications.length, 0)} applications</p>
        {course.sourceUrl && <a href={course.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-[#FF80AA] hover:text-white">Source reader<ExternalLink className="h-4 w-4" /></a>}
        {error && <p role="alert" className="mt-4 text-red-400">{error}</p>}
        <div className="mt-8 space-y-8">
            {course.parts.map(part => {
                const live = sections?.find(section => section.deck.id === part.deckId);
                return <section key={part.deckId} id={`part-${part.number}`} aria-label={`Part ${part.number} ${part.title}`} className="scroll-mt-8 rounded-xl border border-[#4F4F4F] bg-[#262626] p-5 sm:p-6">
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold tracking-wide text-[#FF80AA]">Part {part.number}</p>
                            <h2 className="text-xl font-bold sm:text-2xl">{part.title}</h2>
                        </div>
                        {live
                            ? <Link href={`/steps?section=${live.id}`} className="inline-flex items-center gap-2 rounded-lg bg-[#FF0054] px-4 py-2 text-sm font-semibold hover:bg-[#e6004c]">Open part<ArrowRight className="h-4 w-4" /></Link>
                            : <span className="rounded-lg border border-dashed border-[#4F4F4F] px-3 py-2 text-sm text-[#A1A1A1]">{sections ? 'Lessons in preparation' : 'Checking availability'}</span>}
                    </div>
                    <div className="space-y-6">
                        <EntryList title="Chapters" entries={part.chapters} />
                        <EntryList title="Applications" entries={part.applications} />
                    </div>
                </section>;
            })}
        </div>
    </div></main>;
}
