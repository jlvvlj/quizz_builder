"use client"
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect,useState } from 'react';
import LoadingState from '@/components/LoadingState';
import CircularProgress from '@/components/CircularProgress';
import { CatalogSection, useCatalog } from '@/utils/catalog';
import { courses, CoursePart } from '@/utils/courses';
import { getSourceChapter } from '@/utils/probability-source';
import { useQuizType } from '@/utils/quiz-mode';
import { calculateSectionProgress } from '@/utils/progress-calculator';

function DeckCard({s,sections,progress}:{s:CatalogSection;sections:CatalogSection[];progress:Record<string,number>}){
 const router=useRouter();const chapter=getSourceChapter(s.deck.id);
 return <div onClick={()=>router.push(`/steps?section=${s.id}`)} className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 sm:p-6 cursor-pointer hover:bg-[#2F2F2F] transition-colors">
 <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="text-lg sm:text-xl font-semibold text-white mb-2">{s.deck.title}</h2><p className="text-[#A1A1A1] text-sm">{chapter ? `Chapter ${chapter.sections[0].id.split('.')[0]} lessons` : `${s.deck.question_label} → ${s.deck.answer_label}`}</p><p className="text-[#A1A1A1] text-sm mt-2">{chapter ? ` ${chapter.sections.length} sections · ${chapter.lessonCount} lessons` : `${s.count} items · ${s.steps.length} steps`}</p>{sections.filter(x=>x.deck.id===s.deck.id).length>1&&<p className="text-[#A1A1A1] text-sm">Section {s.id.replace('section_','')}</p>}</div>
 <div className="flex flex-col items-end gap-4 shrink-0">{!chapter&&<CircularProgress progress={progress[s.id]||0} size={50} strokeWidth={6} progressColor="#FF0054" backgroundColor="#181818"/>}<button onClick={e=>{e.stopPropagation();router.push(`/steps?section=${s.id}`);}} className="bg-[#181818] border border-[#4F4F4F] text-white px-3 py-2 rounded-lg hover:bg-[#2F2F2F] flex items-center gap-2 text-sm"><Play className="w-4 h-4"/>Start</button></div></div>
 </div>;
}

// A part whose outline is known but whose lessons have not been built yet.
function PlannedPartCard({part,courseId}:{part:CoursePart;courseId:string}){
 return <Link href={`/course?id=${courseId}#part-${part.number}`} className="block bg-[#1F1F1F] border border-dashed border-[#4F4F4F] rounded-lg p-4 sm:p-6 hover:bg-[#262626] transition-colors">
 <p className="text-xs font-semibold uppercase tracking-wide text-[#FF80AA] mb-2">Part {part.number}</p>
 <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">{part.title}</h2>
 <p className="text-[#A1A1A1] text-sm">{part.chapters.length} chapters · {part.applications.length} applications</p>
 <p className="text-[#7A7A7A] text-sm mt-2">Lessons in preparation</p>
 </Link>;
}

export default function HomeRoute(){
 const {sections,error}=useCatalog();const quizType=useQuizType();const [progress,setProgress]=useState<Record<string,number>>({});const [progressError,setProgressError]=useState('');
 useEffect(()=>{if(!sections)return;let alive=true;setProgressError('');Promise.all(sections.map(async s=>[s.id,(await calculateSectionProgress(s.id,quizType,'words')).averageProgress] as const)).then(rows=>{if(alive)setProgress(Object.fromEntries(rows));}).catch(e=>{if(alive)setProgressError(e.message);});return()=>{alive=false;};},[sections,quizType]);
 const inCourse=new Set(courses.flatMap(c=>c.deckIds));const other=sections?.filter(s=>!inCourse.has(s.deck.id))??[];
 return <div className="min-h-screen bg-[#181818] flex flex-col"><div className="flex-1 px-3 py-4 sm:px-6 sm:py-8 xl:px-12"><div className="max-w-[1600px] mx-auto">
 <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-8">Your learning decks</h1>
 {(error||progressError)&&<p role="alert" className="text-red-400 mb-4">{error||progressError}</p>}
 {!error&&!sections&&<LoadingState text="Loading decks"/>}
 {sections?.length===0&&<p className="text-[#A1A1A1] mb-8">No learning content has been added yet.</p>}
 {sections&&courses.filter(c=>c.parts||sections.some(s=>c.deckIds.includes(s.deck.id))).map(course=><section key={course.id} aria-label={course.title} className="mb-10">
 <div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-xl sm:text-2xl font-bold text-white">{course.title}</h2><p className="text-sm text-[#A1A1A1]">{course.subtitle}</p></div>
 {course.parts&&<Link href={`/course?id=${course.id}`} className="inline-flex items-center gap-2 text-sm text-[#FF80AA] hover:text-white">Course outline<ArrowRight className="h-4 w-4"/></Link>}</div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">{course.deckIds.map(deckId=>{
  const live=sections.filter(s=>s.deck.id===deckId);const part=course.parts?.find(p=>p.deckId===deckId);
  if(live.length)return live.map(s=><DeckCard key={s.id} s={s} sections={sections} progress={progress}/>);
  return part?<PlannedPartCard key={deckId} part={part} courseId={course.id}/>:null;
 })}</div></section>)}
 {other.length>0&&<section aria-label="Other decks"><h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Other decks</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">{other.map(s=><DeckCard key={s.id} s={s} sections={sections!} progress={progress}/>)}</div></section>}
 </div></div></div>;
}
