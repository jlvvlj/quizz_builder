import Link from 'next/link';
import { useCatalog } from '@/utils/catalog';

export default function ChapterPracticeLinks({sectionId}: {sectionId: string}) {
    const {sections}=useCatalog();
    const section=sections?.find(item=>item.id===sectionId);
    if(!section?.steps.length)return null;
    return <details className="mt-8 rounded-xl border border-[#414141] p-4">
        <summary className="cursor-pointer font-medium text-white">Practice quizzes</summary>
        <p className="mt-3 text-sm text-[#B8B8B8]">Choose a quiz topic to practise what you have learned.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">{section.steps.map(step=><Link key={step.key} href={`/session_preview_results?${new URLSearchParams({section:sectionId,step:step.key,title:'Study Session',subtitle:step.title||'Practice',description:'Review these questions before starting your quiz.'})}`} className="rounded-lg bg-[#292929] px-4 py-3 text-sm text-[#E5E5E5] hover:bg-[#363636]">{step.title||`Quiz ${step.id}`} · {step.items} questions</Link>)}</div>
    </details>;
}
