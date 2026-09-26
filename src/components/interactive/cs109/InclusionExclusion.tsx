import { useState } from 'react';
import InteractiveFigure, { Slider, Stat, Stats } from '../InteractiveFigure';
import { combinations } from './random';

const sub = (i: number) => String(i).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]).join('');

/** The inclusion-exclusion rule for the size of a union of n sets, written out term by term. */
export default function InclusionExclusion() {
    const [n, setN] = useState(3);
    const levels = Array.from({ length: n }, (_, r) => ({ size: r + 1, groups: combinations(n, r + 1) }));
    const union = Array.from({ length: n }, (_, i) => `A${sub(i + 1)}`).join(' ∪ ');
    return <InteractiveFigure
        title="Inclusion–exclusion for n sets"
        lede="Change the number of sets to see how the formula for the size of their union expands: add every set, subtract every pairwise overlap, add back every triple overlap, and so on."
        note="The signs alternate with the number of sets in each intersection, and the formula has 2ⁿ − 1 terms in all, which is why it grows unwieldy quickly.">
        <div className="interactive-controls"><Slider label="Number of sets" value={n} min={1} max={5} onChange={setN} /></div>
        <p className="font-mono text-base text-white">|{union}| =</p>
        <div className="space-y-2 font-mono text-sm">
            {levels.map(({ size, groups }) => <p key={size} className="leading-7">
                <span className="mr-2 inline-block w-4 text-lg" style={{ color: size % 2 ? '#7bd9e7' : '#ff4b86' }}>{size % 2 ? '+' : '−'}</span>
                {groups.map((g, i) => <span key={i}>{i > 0 && <span className="text-[#7a7a7a]"> + </span>}|{g.map(j => `A${sub(j + 1)}`).join(' ∩ ')}|</span>)}
            </p>)}
        </div>
        <Stats><Stat label="Terms" value={String(2 ** n - 1)} hint="2ⁿ − 1" /></Stats>
    </InteractiveFigure>;
}
