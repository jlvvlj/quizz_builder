import { useRouter } from 'next/router';
import LoadingState from '@/components/LoadingState';
import StepsPage from '@/components/StepsPage';
import { useCatalog } from '@/utils/catalog';
import { getSourceChapter } from '@/utils/probability-source';
import { ProbabilitySourceOutline } from '@/components/ProbabilitySourceCourse';
export default function Steps(){
 const router=useRouter();const {sections,error}=useCatalog();
 if(error)return <p role="alert" className="p-6 text-red-400">{error}</p>;
 if(!router.isReady||!sections)return <LoadingState text="Loading steps"/>;
 const section=sections.find(s=>s.id===router.query.section);
 if(!section)return <p className="p-6 text-white">This section has no learning content.</p>;
 if(getSourceChapter(section.deck.id))return <ProbabilitySourceOutline deckId={section.deck.id} sectionId={section.id}/>;
 return <StepsPage onCourseSelect={()=>{}} onSettingsClick={()=>{}} currentSection={section.id} numSteps={section.steps.length} actualSteps={section.steps} deckId={section.deck.id} deckTitle={section.deck.title} deckDescription={section.deck.description}/>;
}
