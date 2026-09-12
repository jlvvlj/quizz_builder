"use client"
import { Play } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect,useState } from 'react';
import LoadingState from '@/components/LoadingState';
import CircularProgress from '@/components/CircularProgress';
import { useCatalog } from '@/utils/catalog';
import { useQuizType } from '@/utils/quiz-mode';
import { calculateSectionProgress } from '@/utils/progress-calculator';
export default function HomeRoute(){
 const router=useRouter();const {sections,error}=useCatalog();const quizType=useQuizType();const [progress,setProgress]=useState<Record<string,number>>({});const [progressError,setProgressError]=useState('');
 useEffect(()=>{if(!sections)return;let alive=true;setProgressError('');Promise.all(sections.map(async s=>[s.id,(await calculateSectionProgress(s.id,quizType,'words')).averageProgress] as const)).then(rows=>{if(alive)setProgress(Object.fromEntries(rows));}).catch(e=>{if(alive)setProgressError(e.message);});return()=>{alive=false;};},[sections,quizType]);
 return <div className="min-h-screen bg-[#181818] flex flex-col"><div className="flex-1 px-3 py-4 sm:px-6 sm:py-8 xl:px-12"><div className="max-w-[1600px] mx-auto">
 <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-8">Your learning decks</h1>
 {(error||progressError)&&<p role="alert" className="text-red-400 mb-4">{error||progressError}</p>}
 {!error&&!sections&&<LoadingState text="Loading decks"/>}
 {sections?.length===0&&<p className="text-[#A1A1A1]">No learning content has been added yet.</p>}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">{sections?.map(s=><div key={s.id} onClick={()=>router.push(`/steps?section=${s.id}`)} className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 sm:p-6 cursor-pointer hover:bg-[#2F2F2F] transition-colors">
 <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="text-lg sm:text-xl font-semibold text-white mb-2">{s.deck.title}</h2><p className="text-[#A1A1A1] text-sm">{s.deck.question_label} → {s.deck.answer_label}</p><p className="text-[#A1A1A1] text-sm mt-2">{s.count} items · {s.steps.length} steps</p>{sections.filter(x=>x.deck.id===s.deck.id).length>1&&<p className="text-[#A1A1A1] text-sm">Section {s.id.replace('section_','')}</p>}</div>
 <div className="flex flex-col items-end gap-4 shrink-0"><CircularProgress progress={progress[s.id]||0} size={50} strokeWidth={6} progressColor="#FF0054" backgroundColor="#181818"/><button onClick={e=>{e.stopPropagation();router.push(`/steps?section=${s.id}`);}} className="bg-[#181818] border border-[#4F4F4F] text-white px-3 py-2 rounded-lg hover:bg-[#2F2F2F] flex items-center gap-2 text-sm"><Play className="w-4 h-4"/>Start</button></div></div>
 </div>)}</div></div></div></div>;
}
