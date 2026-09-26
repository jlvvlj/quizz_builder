import { useState } from 'react';
import InteractiveFigure, { OBSERVED, Slider, Stat, Stats } from '../InteractiveFigure';

const LETTERS = ['A', 'C', 'G', 'T'] as const;
const POSITION: Record<string, [number, number]> = { A: [70, 50], C: [250, 50], G: [70, 170], T: [250, 170] };
const sub = (i: number) => String(i).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]).join('');

/** The four DNA letters; a mutation moves from one letter to any of the other three. */
export function DnaGraph() {
    const [from, setFrom] = useState<string>('A');
    const edges = LETTERS.flatMap((a, i) => LETTERS.slice(i + 1).map(b => [a, b] as const));
    return <InteractiveFigure
        title="DNA letters as a graph"
        lede="Each node is a DNA letter and each edge an allowed mutation: any letter can mutate into any of the other three. Choose a letter to see where it can go."
        note="Every letter has exactly three neighbours, so from any letter each possible mutation is one of three equally likely moves.">
        <div className="interactive-controls" role="group" aria-label="Current letter">
            {LETTERS.map(l => <button key={l} type="button" className="interactive-button" data-variant={l === from ? 'primary' : undefined} onClick={() => setFrom(l)}>{l}</button>)}
        </div>
        <div className="interactive-canvas">
            <svg viewBox="0 0 320 220" role="img" aria-label={`${from} can mutate into ${LETTERS.filter(l => l !== from).join(', ')}`}>
                {edges.map(([a, b]) => {
                    const lit = a === from || b === from;
                    return <line key={a + b} x1={POSITION[a][0]} y1={POSITION[a][1]} x2={POSITION[b][0]} y2={POSITION[b][1]} stroke={lit ? OBSERVED : '#4a4a4a'} strokeWidth={lit ? 3 : 1.5} />;
                })}
                {LETTERS.map(l => <g key={l}>
                    <circle cx={POSITION[l][0]} cy={POSITION[l][1]} r="24" fill={l === from ? OBSERVED : '#262626'} stroke="#8a8a8a" />
                    <text x={POSITION[l][0]} y={POSITION[l][1] + 7} textAnchor="middle" fontSize="20" fill="#fff">{l}</text>
                </g>)}
            </svg>
        </div>
    </InteractiveFigure>;
}

/** Every sequence of n mutations starting from A, in the order the lesson refers to them. */
export function MutationSequences() {
    const [n, setN] = useState(2);
    let sequences: string[][] = [['A']];
    for (let step = 0; step < n; step++) sequences = sequences.flatMap(seq => LETTERS.filter(l => l !== seq[seq.length - 1]).map(l => [...seq, l]));
    return <InteractiveFigure
        title="Sequences of mutations from A"
        lede="Starting from A, each mutation changes the letter to one of the other three. Here are all the possible sequences for the number of mutations you choose."
        note="Each mutation has three choices, so there are 3ⁿ sequences of n mutations, and each one is equally likely.">
        <div className="interactive-controls"><Slider label="Number of mutations, n" value={n} min={1} max={5} onChange={setN} /></div>
        <Stats>
            <Stat label="Sequences" value={String(sequences.length)} hint="3ⁿ" />
            <Stat label={`Ending at A after ${n}`} value={String(sequences.filter(s => s[s.length - 1] === 'A').length)} color={OBSERVED} />
        </Stats>
        <ol className="interactive-scroll max-h-64 overflow-y-auto font-mono text-sm" aria-label="All mutation sequences">
            {sequences.map((seq, i) => <li key={i} className="flex gap-3 px-2 py-0.5" style={seq[seq.length - 1] === 'A' ? { color: OBSERVED } : undefined}>
                <span className="w-10 shrink-0 text-right text-[#7a7a7a]">{i + 1}</span>
                <span>{seq.map((l, j) => `${l}${sub(j)}`).join(', ')}</span>
            </li>)}
        </ol>
    </InteractiveFigure>;
}
