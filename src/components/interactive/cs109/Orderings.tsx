import { useState } from 'react';
import InteractiveFigure, { Slider, Stat, Stats } from '../InteractiveFigure';
import { combinations } from './random';

function binomial(n: number, k: number) { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); }

/**
 * Every ordering of n results with exactly k successes, listed in lexicographic order of where the
 * successes fall. The lesson refers to rows by number, so the order is part of the content.
 */
export default function Orderings({ success = 'H', failure = 'T', n: initialN = 10, k: initialK = 4, highlight, title, lede }:
    { success?: string; failure?: string; n?: number; k?: number; highlight?: number; title: string; lede: string }) {
    const [n, setN] = useState(initialN);
    const [k, setK] = useState(initialK);
    const rows = combinations(n, Math.min(k, n));
    const marked = n === initialN && k === initialK ? highlight : undefined;
    return <InteractiveFigure title={title} lede={lede}
        note={`There are ${rows.length} orderings. Each is a distinct arrangement of ${k} ${success}’s and ${n - k} ${failure}’s, which is why their number is n! / (k!(n − k)!).`}>
        <div className="interactive-controls">
            <Slider label="n" value={n} min={1} max={12} onChange={v => { setN(v); setK(Math.min(k, v)); }} />
            <Slider label="k" value={k} min={0} max={n} onChange={setK} />
        </div>
        <Stats><Stat label="Orderings" value={String(rows.length)} hint={`${n} choose ${k} = ${binomial(n, k)}`} /></Stats>
        <ol className="interactive-scroll max-h-72 overflow-y-auto font-mono text-sm" aria-label="All orderings">
            {rows.map((chosen, index) => {
                const set = new Set(chosen);
                return <li key={index} className="flex gap-3 px-2 py-0.5" style={index + 1 === marked ? { background: '#3a2230', color: '#ffb3cb' } : undefined}>
                    <span className="w-10 shrink-0 text-right text-[#7a7a7a]">{index + 1}</span>
                    <span>({Array.from({ length: n }, (_, i) => set.has(i) ? success : failure).join(', ')})</span>
                </li>;
            })}
        </ol>
    </InteractiveFigure>;
}
