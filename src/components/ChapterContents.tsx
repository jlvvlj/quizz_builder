import Link from 'next/link';
import { useRouter } from 'next/router';
import { SourceChapter, SourceUnit, sourceLessonUrl } from '@/utils/probability-source';

/** The same chapter map stays available on every lesson, including on phones. */
export default function ChapterContents({chapter, sectionId, unit}: {chapter: SourceChapter; sectionId: string; unit: SourceUnit}) {
    const router = useRouter();
    const navigate = (id: string) => router.push(sourceLessonUrl(sectionId, id, chapter.deckId));
    return <nav aria-label="Chapter contents" className="mb-8 rounded-xl border border-[#414141] bg-[#222222] p-4 sm:p-5">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <label className="min-w-0 text-sm font-medium text-[#B8B8B8]">Section
                <select aria-label="Chapter section" value={unit.section} onChange={e => {const first=chapter.units.find(item=>item.section===e.target.value);if(first)navigate(first.id);}} className="mt-2 block w-full min-w-0 rounded-lg border border-[#505050] bg-[#181818] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF0054]">
                    {chapter.sections.map(section=><option key={section.id} value={section.id}>{section.id} {section.title}</option>)}
                </select>
            </label>
            <label className="min-w-0 text-sm font-medium text-[#B8B8B8]">Lesson
                <select aria-label="Section lesson" value={unit.id} onChange={e=>navigate(e.target.value)} className="mt-2 block w-full min-w-0 rounded-lg border border-[#505050] bg-[#181818] px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF0054]">
                    {chapter.units.filter(item=>item.section===unit.section).map(item=><option key={item.id} value={item.id}>{item.kind==='introduction'?'Intro':item.title}</option>)}
                </select>
            </label>
        </div>
        <details className="mt-4" key={unit.id}>
            <summary className="cursor-pointer text-sm font-medium text-[#D1D1D1] hover:text-white">All sections and lessons</summary>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {chapter.sections.map(section=><section key={section.id} className="min-w-0">
                    <h2 className="mb-2 text-sm font-semibold text-[#FF80AA]">{section.id} {section.title}</h2>
                    <ol className="space-y-1">{chapter.units.filter(item=>item.section===section.id).map(item=><li key={item.id}>
                        <Link href={sourceLessonUrl(sectionId,item.id,chapter.deckId)} aria-current={item.id===unit.id?'page':undefined} className={`block rounded-md px-2 py-2 text-sm ${item.id===unit.id?'bg-[#FF0054] font-semibold text-white':'text-[#B8B8B8] hover:bg-[#333333] hover:text-white'}`}>{item.kind==='introduction'?'Intro':item.title}</Link>
                    </li>)}</ol>
                </section>)}
            </div>
        </details>
    </nav>;
}
