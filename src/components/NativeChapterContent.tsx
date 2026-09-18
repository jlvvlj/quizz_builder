import { ReactNode } from 'react';
import { LessonBlock } from '@/utils/probability-source';
import { FormulaDiagram, LessonLatexText } from './FormulaExplorer';

export default function NativeChapterContent({blocks, context}: {blocks: LessonBlock[]; context: string}) {
    const render = (block: LessonBlock, index: number): ReactNode => {
        if(block.kind==='formula') return <FormulaDiagram key={index} source={block.text} context={context} latex />;
        if(block.kind==='heading') return <h2 key={index} className="pt-4 text-xl font-semibold text-white">{block.text}</h2>;
        if(block.kind==='figure') return <figure key={index} aria-label={block.text} className="my-6">
            {/* Only diagram artwork is rasterized; all surrounding text and mathematics are native. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={block.src} alt={`${block.text}: diagram illustrated in the following caption`} className="mx-auto h-auto max-h-[520px] max-w-full rounded-lg bg-white object-contain" loading="lazy" />
        </figure>;
        return <LessonLatexText key={index} text={block.text} context={context} />;
    };
    const content: ReactNode[]=[];
    for(let i=0;i<blocks.length;i++) {
        const block=blocks[i];
        if(block.kind==='cardEnd') continue;
        if(block.kind==='figure' && blocks[i+1]?.kind==='paragraph' && blocks[i+1].text.startsWith(block.text+':')) {
            const caption=blocks[++i];
            content.push(<figure key={`figure-${i}`} aria-label={block.text} className="my-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.src} alt={block.text} className="mx-auto h-auto max-h-[520px] max-w-full rounded-lg bg-white object-contain" loading="lazy" />
                <figcaption className="mt-4 text-base leading-7 text-[#C8C8C8]"><LessonLatexText text={caption.text} context={context} /></figcaption>
            </figure>);
            continue;
        }
        if(block.kind!=='keypoint'){content.push(render(block,i));continue;}
        const start=i;const children: ReactNode[]=[];
        while(i+1<blocks.length && blocks[i+1].kind!=='cardEnd' && blocks[i+1].kind!=='keypoint') {i++;children.push(render(blocks[i],i));}
        content.push(<section key={`card-${start}`} aria-label={block.text} className="lesson-key-card">
            <h2 className="text-lg font-semibold text-white">{block.text}</h2>
            <div className="mt-4 space-y-5">{children}</div>
        </section>);
    }
    return <div className="native-lesson-content space-y-6 text-base leading-8 text-[#E5E5E5] sm:text-lg">{content}</div>;
}
