import { useEffect, useId, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import katex from 'katex';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formulaModel, FormulaTerm, makeTerm, splitMath } from '@/utils/formula-notation';
import { SourceImage } from '@/utils/probability-source';
import { latexFormulaModel } from '@/utils/latex-formula';

export function mathHtml(source: string, context = '', displayMode = false) {
    return katex.renderToString(formulaModel(source, context).latex, {
        displayMode, throwOnError: false, strict: false,
        trust: ({ command }) => command === '\\htmlData',
    });
}

type Connector = { d: string; color: string; x: number; y: number };
export function FormulaDiagram({ source, context = '', children, terms: suppliedTerms, initiallyOpen = false, latex = false }: {
    source: string; context?: string; children?: React.ReactNode; terms?: FormulaTerm[]; initiallyOpen?: boolean; latex?: boolean;
}) {
    const model = useMemo(() => latex ? latexFormulaModel(source, context) : formulaModel(source, context), [source, context, latex]);
    const terms = suppliedTerms || model.terms;
    const [open, setOpen] = useState(initiallyOpen);
    const [group, setGroup] = useState(0);
    const [active, setActive] = useState<string>();
    const [paths, setPaths] = useState<Connector[]>([]);
    const root = useRef<HTMLDivElement>(null);
    const id = useId().replace(/:/g, '');
    const visible = terms.slice(group * 3, group * 3 + 3);
    const isAbove = (index: number) => (index + group) % 2 === 0;
    useEffect(() => {
        const el = root.current;
        if (!el || !open) { setPaths([]); return; }
        const measure = () => {
            const box = el.getBoundingClientRect();
            const lines: Connector[] = [];
            visible.forEach((term, index) => {
                const anchor = el.querySelector(`[data-formula-term="${term.id}"]`);
                const label = el.querySelector(`[data-definition="${term.id}"]`);
                if (!anchor || !label) return;
                const a = anchor.getBoundingClientRect(), b = label.getBoundingClientRect();
                const above = isAbove(index);
                const x = a.left + a.width / 2 - box.left;
                const y = (above ? a.top - 6 : a.bottom + 6) - box.top;
                const tx = b.left + b.width / 2 - box.left;
                const ty = (above ? b.bottom + 7 : b.top - 7) - box.top;
                const scrollBox = anchor.closest('.formula-scroll')?.getBoundingClientRect();
                if (scrollBox && (x + box.left < scrollBox.left || x + box.left > scrollBox.right)) return;
                lines.push({d: `M ${x} ${y} C ${x} ${y + (ty-y)*.52}, ${tx} ${ty + (above ? 22 : -22)}, ${tx} ${ty}`, color: term.color, x, y});
            });
            setPaths(lines);
        };
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        el.addEventListener('scroll', measure, true);
        document.fonts.ready.then(measure);
        const frame = requestAnimationFrame(measure);
        return () => { observer.disconnect(); el.removeEventListener('scroll', measure, true); cancelAnimationFrame(frame); };
    // The visible terms are determined by these values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, group, source, suppliedTerms]);
    const labels = (above: boolean) => {
        const placed = visible.filter((_, index) => isAbove(index) === above);
        if (!placed.length) return null;
        return <div className={`formula-label-band formula-labels-${above ? 'above' : 'below'} ${placed.length === 1 ? 'single-label' : ''}`}>
            {placed.map(term => <button type="button" key={term.id} data-definition={term.id}
                aria-label={`${term.symbol}: ${term.definition}`}
                className={`formula-definition ${active === term.id ? 'is-active' : ''}`}
                style={{ '--term-color': term.color } as React.CSSProperties}
                onFocus={() => setActive(term.id)} onBlur={() => setActive(undefined)}
                onMouseEnter={() => setActive(term.id)} onMouseLeave={() => setActive(undefined)}
                onClick={() => root.current?.querySelector(`[data-formula-term="${term.id}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })}>
                {term.definition}
            </button>)}
        </div>;
    };
    return <div className={`formula-card ${open ? 'formula-open' : ''}`}>
        <div className="formula-toolbar"><span>Explore the notation</span><button type="button" aria-expanded={open} aria-controls={`diagram-${id}`} onClick={() => setOpen(!open)}>{open ? 'Hide explanations' : 'Show explanations'}</button></div>
        <div ref={root} id={`diagram-${id}`} className="formula-diagram" data-active-term={active}>
            {open && labels(true)}
            <div className="formula-scroll" onMouseOver={e => { const el = (e.target as HTMLElement).closest('[data-formula-term]'); if (el) setActive(el.getAttribute('data-formula-term') || undefined); }} onMouseLeave={() => setActive(undefined)}>
                {children || <div className="formula-typeset" aria-label={source} dangerouslySetInnerHTML={{ __html: katex.renderToString(model.latex, { displayMode: true, throwOnError: false, strict: false, trust: ({command}) => command === '\\htmlData' }) }} />}
            </div>
            {open && <>
                <svg className="formula-connectors" aria-hidden="true">{paths.map((p, i) => <g key={i}><path d={p.d} fill="none" stroke={p.color} strokeWidth="1.6" /><circle cx={p.x} cy={p.y} r="3" fill={p.color} /></g>)}</svg>
                {labels(false)}
            </>}
        </div>
        {open && <div className="formula-term-navigation" aria-label="Formula elements">
            {terms.map((term, index) => <button key={term.id} type="button" title={term.definition} aria-pressed={Math.floor(index / 3) === group} style={{ '--term-color': term.color } as React.CSSProperties} onClick={() => { setGroup(Math.floor(index / 3)); setActive(term.id); }}>{term.symbol}</button>)}
            {terms.length > 3 && <span>Select a symbol to explore its meaning.</span>}
        </div>}
        {open && model.meaning && !children && <p className="formula-meaning">{model.meaning}</p>}
        <style>{open ? visible.map(term => `#diagram-${id} [data-formula-term="${term.id}"] { background: ${term.color}10; outline: 1px solid ${term.color}80; border-radius: 3px; }`).join('\n') : ''}</style>
    </div>;
}

function FormulaModal({ children, trigger, title = 'Formula explained' }: { children: React.ReactNode; trigger: React.ReactNode; title?: string }) {
    return <Dialog.Root><Dialog.Trigger asChild>{trigger}</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="formula-modal-overlay" /><Dialog.Content className="formula-modal"><div className="formula-modal-header"><Dialog.Title>{title}</Dialog.Title><Dialog.Close aria-label="Close formula explanation"><X size={22} /></Dialog.Close></div><Dialog.Description className="formula-modal-description">Follow the colored pointers to see what each part means.</Dialog.Description>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}

export function LessonMathText({ text, context = '' }: { text: string; context?: string }) {
    return <>{text.split('\n').map((line, lineIndex) => {
        if (!line.trim()) return <div key={lineIndex} className="h-3" />;
        const parts = splitMath(line);
        const mathLength = parts.filter(p => p.math).reduce((sum, p) => sum + p.text.length, 0);
        if (mathLength > line.length * .72 && line.length > 5) return <FormulaDiagram key={lineIndex} source={line.trim().replace(/[.,]$/, '')} context={context} />;
        return <p key={lineIndex} className="lesson-math-paragraph">{parts.map((part, i) => part.math ? <FormulaModal key={i} trigger={<button type="button" className="inline-formula" aria-label={`Explain ${part.text}`} dangerouslySetInnerHTML={{ __html: mathHtml(part.text, context) }} />}><FormulaDiagram source={part.text} context={context} initiallyOpen /></FormulaModal> : <span key={i}>{part.text}</span>)}</p>;
    })}</>;
}

function SourceMathArt({ image, context, regionIndex, interactive = false, onSelect }: { image: SourceImage; context: string; regionIndex?: number; interactive?: boolean; onSelect?: (index: number) => void }) {
    const id = useId().replace(/:/g, '');
    const w = image.bounds[2] - image.bounds[0], h = image.bounds[3] - image.bounds[1];
    const regions = image.formulaRegions || [];
    const region = regionIndex === undefined ? undefined : regions[regionIndex];
    const cropLeft = region ? Math.max(0,Math.min(...region.terms.filter(t=>![')',']','}',',','.',';'].includes(t.symbol)).map(t=>t.bounds[0]))-1) : 0;
    const cropWidth = region ? region.bounds[0]+region.bounds[2]+1-(Number.isFinite(cropLeft)?cropLeft:region.bounds[0]) : w;
    const viewBox = region ? `${Number.isFinite(cropLeft)?cropLeft:region.bounds[0]} ${Math.max(0, region.bounds[1] - 4)} ${cropWidth} ${region.bounds[3] + 8}` : `0 0 ${w} ${image.diagramHeight ?? h}`;
    const visible = region ? [{region, index: regionIndex!}] : regions.map((region,index) => ({region,index}));
    return <svg style={region ? {width: Math.max(120,(region.bounds[2]+8)*2.4), height: Math.max(52,(region.bounds[3]+8)*2.4)} : undefined} viewBox={viewBox} role="img" aria-label={region ? region.terms.map(t => t.symbol).join(' ') : 'Original excerpt with color-coded mathematical notation'} className={region ? 'source-formula-detail' : 'source-math-art'}>
        <defs>{region && <clipPath id={`${id}-crop`}><rect x={Number.isFinite(cropLeft)?cropLeft:region.bounds[0]} y={Math.max(0,region.bounds[1]-4)} width={cropWidth} height={region.bounds[3]+8}/></clipPath>}<filter id={`${id}-invert`}><feColorMatrix type="matrix" values="-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0" /></filter><mask id={`${id}-ink`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}><image href={image.src} width={w} height={h} filter={`url(#${id}-invert)`} /></mask></defs>
        <g clipPath={region ? `url(#${id}-crop)` : undefined}><image href={image.src} width={w} height={h} />
        {visible.map(({region:r,index}) => <g key={index}>
            {r.terms.map((t,i) => { const term = makeTerm(t.symbol,context,r.terms.map(t=>t.symbol).join('')); const [x,y,width,height] = t.bounds;return <g key={i} data-formula-term={term.id}><rect x={x} y={y} width={width} height={height} fill="white" /><rect x={x} y={y} width={width} height={height} fill={term.color} mask={`url(#${id}-ink)`} /></g>; })}
            {interactive && <rect x={r.bounds[0]} y={r.bounds[1]} width={r.bounds[2]} height={r.bounds[3]} fill="transparent" className="source-formula-hit" tabIndex={0} role="button" aria-label={`Explain ${r.terms.map(t=>t.symbol).join(' ')}`} onClick={() => onSelect?.(index)} onKeyDown={e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect?.(index);} }}><title>Explore this formula</title></rect>}
        </g>)}</g>
    </svg>;
}

export function AnnotatedSourceImage({ image, title, context }: { image: SourceImage; title: string; context: string }) {
    const [selected, setSelected] = useState<number | null>(null);
    const regions = image.formulaRegions || [];
    const r = regions[selected ?? 0];
    const terms = useMemo(() => r ? [...new Map(r.terms.filter(t=>!['.',',',';',')',']','}'].includes(t.symbol)).sort((a,b)=>Number(['(','[','{'].includes(a.symbol))-Number(['(','[','{'].includes(b.symbol))).map(t => {const term=makeTerm(t.symbol,context,r.terms.map(t=>t.symbol).join(''));return [term.id,term] as const;})).values()] : [], [r, context]);
    return <figure className="source-annotated">
        <SourceMathArt image={image} context={context} interactive onSelect={setSelected} />
        <figcaption><span>Page {image.printedPage}</span>{regions.length > 0 && <button type="button" onClick={() => setSelected(Math.max(0,regions.findIndex(r=>r.terms.length>=4)))}>Explain formulas</button>}<a href={image.src} target="_blank" rel="noreferrer">View original</a></figcaption>
        <Dialog.Root open={selected!==null} onOpenChange={open => {if(!open)setSelected(null);}}><Dialog.Portal><Dialog.Overlay className="formula-modal-overlay" /><Dialog.Content className="formula-modal"><div className="formula-modal-header"><Dialog.Title>Explore the formula</Dialog.Title><Dialog.Close aria-label="Close formula explanation"><X size={22}/></Dialog.Close></div><Dialog.Description className="formula-modal-description">{title} · Page {image.printedPage}. Select a colored symbol for its meaning.</Dialog.Description>{r && <FormulaDiagram key={selected} source={r.terms.map(t=>t.symbol).join(' ')} context={context} terms={terms} initiallyOpen><SourceMathArt image={image} context={context} regionIndex={selected??0}/></FormulaDiagram>}<div className="source-formula-pagination"><button type="button" disabled={selected===0} onClick={()=>setSelected(n=>Math.max(0,(n??0)-1))}><ChevronLeft size={16}/> Previous</button><span>{(selected??0)+1} / {regions.length}</span><button type="button" disabled={selected===regions.length-1} onClick={()=>setSelected(n=>Math.min(regions.length-1,(n??0)+1))}>Next <ChevronRight size={16}/></button></div></Dialog.Content></Dialog.Portal></Dialog.Root>
    </figure>;
}
