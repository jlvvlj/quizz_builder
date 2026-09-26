import { useRef, useState } from 'react';
import InteractiveFigure, { ACCENT_C, ActionButton, OBSERVED, THEORY } from './InteractiveFigure';

type Token = 'A' | 'B' | 'C' | '∅' | 'U' | '∩' | '∪' | "'" | '(' | ')';
const NAMES = ['A', 'B', 'C'] as const;
const COLORS = [OBSERVED, THEORY, ACCENT_C];
const ATOMS: Record<string, number> = {A: 0b10101010, B: 0b11001100, C: 0b11110000, '∅': 0, U: 0b11111111};

/** Parses the button-built expression into the subset of the eight Venn regions it denotes. */
export function evaluate(tokens: Token[]): number | null {
    let cursor = 0;
    const peek = () => tokens[cursor];
    const union = (): number | null => {
        let value = intersection();
        while (value !== null && peek() === '∪') {cursor++; const right = intersection(); value = right === null ? null : value | right;}
        return value;
    };
    const intersection = (): number | null => {
        let value = complement();
        while (value !== null && peek() === '∩') {cursor++; const right = complement(); value = right === null ? null : value & right;}
        return value;
    };
    const complement = (): number | null => {
        let value = atom();
        while (value !== null && peek() === "'") {cursor++; value = ~value & 0xff;}
        return value;
    };
    const atom = (): number | null => {
        const token = tokens[cursor];
        if (token === '(') {
            cursor++;
            const value = union();
            if (value === null || tokens[cursor] !== ')') return null;
            cursor++;
            return value;
        }
        if (token !== undefined && token in ATOMS) {cursor++; return ATOMS[token];}
        return null;
    };
    const result = union();
    return result !== null && cursor === tokens.length ? result : null;
}

export default function SetTheory() {
    const [tokens, setTokens] = useState<Token[]>(['A', '∩', 'B']);
    const [circles, setCircles] = useState([{x: 124, y: 88}, {x: 196, y: 88}, {x: 160, y: 140}]);
    const svgRef = useRef<SVGSVGElement>(null);
    const dragging = useRef<number | null>(null);
    const regions = evaluate(tokens);
    const radius = 52;

    const move = (clientX: number, clientY: number) => {
        const index = dragging.current;
        const box = svgRef.current?.getBoundingClientRect();
        if (index === null || !box) return;
        const x = Math.min(320 - radius - 4, Math.max(radius + 4, ((clientX - box.left) / box.width) * 320));
        const y = Math.min(200 - radius - 4, Math.max(radius + 4, ((clientY - box.top) / box.height) * 200));
        setCircles(current => current.map((circle, position) => position === index ? {x, y} : circle));
    };

    return <InteractiveFigure
        title="Set operations"
        lede="Build an expression from the buttons and the shading shows exactly which part of the sample space it names. Drag any circle to see which identities survive when the sets overlap differently."
        note={<>Every compound event is built from unions, intersections and complements of simpler events. Check De Morgan&rsquo;s laws for yourself: <span style={{fontFamily: 'Georgia, serif'}}>(A ∪ B)&rsquo;</span> shades the same region as <span style={{fontFamily: 'Georgia, serif'}}>A&rsquo; ∩ B&rsquo;</span>, and the shading stays equal however you drag the circles.</>}>
        <div className="interactive-canvas">
            <svg
                ref={svgRef} viewBox="0 0 320 200" role="application" aria-label={`Venn diagram shading ${tokens.join(' ') || 'nothing'}`}
                onPointerMove={event => {if (dragging.current !== null) move(event.clientX, event.clientY);}}
                onPointerUp={() => {dragging.current = null;}}
                onPointerLeave={() => {dragging.current = null;}}>
                <defs>
                    {circles.map((circle, index) => <mask key={`in-${index}`} id={`venn-in-${index}`}>
                        <rect x={0} y={0} width={320} height={200} fill="black" />
                        <circle cx={circle.x} cy={circle.y} r={radius} fill="white" />
                    </mask>)}
                    {circles.map((circle, index) => <mask key={`out-${index}`} id={`venn-out-${index}`}>
                        <rect x={0} y={0} width={320} height={200} fill="white" />
                        <circle cx={circle.x} cy={circle.y} r={radius} fill="black" />
                    </mask>)}
                </defs>
                <rect x={4} y={4} width={312} height={192} fill="#ffffff06" stroke="#5a5a5a" strokeWidth={1} rx={8} />
                <text x={13} y={20} fill="#8d8d8d" fontSize={11}>U</text>
                {regions !== null && Array.from({length: 8}, (_, region) => region).filter(region => regions & (1 << region)).map(region => (
                    <g key={region} mask={`url(#venn-${region & 1 ? 'in' : 'out'}-0)`} style={{pointerEvents: 'none'}}>
                        <g mask={`url(#venn-${region & 2 ? 'in' : 'out'}-1)`}>
                            <g mask={`url(#venn-${region & 4 ? 'in' : 'out'}-2)`}>
                                <rect x={5} y={5} width={310} height={190} fill="#ff0054" opacity={0.42} rx={7} />
                            </g>
                        </g>
                    </g>
                ))}
                {circles.map((circle, index) => <g key={NAMES[index]}>
                    <circle
                        cx={circle.x} cy={circle.y} r={radius} fill="transparent" stroke={COLORS[index]} strokeWidth={1.8}
                        style={{cursor: 'grab'}}
                        onPointerDown={event => {dragging.current = index; event.currentTarget.releasePointerCapture?.(event.pointerId);}} />
                    <text x={circle.x} y={circle.y - radius + 16} textAnchor="middle" fill={COLORS[index]} fontSize={15} fontFamily="Georgia, serif" style={{pointerEvents: 'none'}}>{NAMES[index]}</text>
                </g>)}
            </svg>
        </div>
        <div className="interactive-canvas mt-3" aria-live="polite">
            <p style={{margin: 0, font: '20px/1.5 Georgia, serif', color: regions === null ? '#f0a0a0' : '#fff', minHeight: 30}}>
                {tokens.length ? tokens.join(' ') : <span style={{color: '#8d8d8d', fontSize: 15}}>Press the buttons to build an expression</span>}
            </p>
            <p className="interactive-hint" style={{marginTop: 4}}>
                {regions === null ? 'Not a complete expression yet — finish it (or close the brackets) to see the shading.'
                    : regions === 0 ? 'This expression is the empty set: no region is shaded.'
                    : regions === 0xff ? 'This expression is the whole sample space.'
                    : `Shades ${Array.from({length: 8}, (_, region) => region).filter(region => regions & (1 << region)).length} of the 8 regions.`}
            </p>
        </div>
        <div className="interactive-controls" role="group" aria-label="Expression buttons">
            {(['A', 'B', 'C', '∅', 'U', '∩', '∪', "'", '(', ')'] as Token[]).map(token => (
                <button key={token} type="button" className="interactive-button" style={{fontFamily: 'Georgia, serif', minWidth: 40}} onClick={() => setTokens(current => [...current, token])}>{token}</button>
            ))}
            <ActionButton onClick={() => setTokens(current => current.slice(0, -1))} disabled={tokens.length === 0}>Backspace</ActionButton>
            <ActionButton onClick={() => setTokens([])} disabled={tokens.length === 0}>Clear</ActionButton>
        </div>
        <div className="interactive-controls">
            {[["A ∪ B", ['A', '∪', 'B']], ["(A ∪ B)'", ['(', 'A', '∪', 'B', ')', "'"]], ["A' ∩ B'", ['A', "'", '∩', 'B', "'"]], ['A ∩ (B ∪ C)', ['A', '∩', '(', 'B', '∪', 'C', ')']]].map(([label, value]) => (
                <button key={label as string} type="button" className="interactive-tab" onClick={() => setTokens(value as Token[])}>{label as string}</button>
            ))}
        </div>
    </InteractiveFigure>;
}
