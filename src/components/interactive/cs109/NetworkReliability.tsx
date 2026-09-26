import { useState } from 'react';
import InteractiveFigure, { OBSERVED, Slider, Stat, Stats, THEORY } from '../InteractiveFigure';
import { combinations } from './random';

const sub = (i: number) => String(i).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]).join('');

/** P(a path from A to B) two ways: inclusion-exclusion over router successes, and the complement. */
export default function NetworkReliability() {
    const [n, setN] = useState(3);
    const [p, setP] = useState(0.9);
    const groups = Array.from({ length: n }, (_, r) => combinations(n, r + 1)).flat();
    // Inclusion-exclusion, summed in full: independent routers make each intersection p^|group|.
    const viaInclusion = groups.reduce((sum, g) => sum + (g.length % 2 ? 1 : -1) * p ** g.length, 0);
    const viaComplement = 1 - (1 - p) ** n;
    const shown = groups.filter(g => g.length <= 3);
    return <InteractiveFigure
        title="Network reliability, two ways"
        lede="Choose the number of routers and the probability that each one works. Both methods give the same probability that a path from A to B exists; compare how much work each takes."
        note={`For n = ${n}, inclusion–exclusion needs ${groups.length} terms; the complement needs one line.`}>
        <div className="interactive-controls">
            <Slider label="Routers, n" value={n} min={1} max={6} onChange={setN} />
            <Slider label="P(router works), p" value={p} min={0.1} max={0.99} step={0.01} format={v => v.toFixed(2)} onChange={setP} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
            <section aria-label="Method 1: inclusion–exclusion" className="rounded-lg border border-[#3A3A3A] p-3">
                <p className="mb-2 text-sm font-semibold" style={{ color: OBSERVED }}>Method 1: inclusion–exclusion · {groups.length} terms</p>
                <ol className="interactive-scroll max-h-48 overflow-y-auto font-mono text-sm">
                    {shown.map((g, i) => <li key={i}><span className="inline-block w-4">{g.length % 2 ? '+' : '−'}</span>P({g.map(j => `R${sub(j + 1)}`).join(' ∩ ')}) = {(p ** g.length).toFixed(4)}</li>)}
                    {groups.length > shown.length && <li className="text-[#8a8a8a]">… and {groups.length - shown.length} more terms</li>}
                </ol>
            </section>
            <section aria-label="Method 2: complement" className="rounded-lg border border-[#3A3A3A] p-3">
                <p className="mb-2 text-sm font-semibold" style={{ color: THEORY }}>Method 2: complement · one line</p>
                <p className="font-mono text-sm">P(E) = 1 − (1 − p)ⁿ = 1 − (1 − {p.toFixed(2)})^{n}</p>
            </section>
        </div>
        <Stats>
            <Stat label="By inclusion–exclusion" value={viaInclusion.toFixed(6)} color={OBSERVED} />
            <Stat label="By the complement" value={viaComplement.toFixed(6)} color={THEORY} />
        </Stats>
    </InteractiveFigure>;
}
