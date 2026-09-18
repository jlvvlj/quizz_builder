import { useRef, useState } from 'react';
import InteractiveFigure, { ActionButton, Legend, OBSERVED, Stat, Stats, THEORY } from './InteractiveFigure';

const FACES = [1, 2, 3, 4, 5, 6];
const COLUMN = 46, BASE = 104, HEIGHT = 84, LEFT = 22;

/** The expectation is the probability-weighted average, and the sample mean is what converges to it. */
export default function Expectation() {
    const [weights, setWeights] = useState<number[]>(FACES.map(() => 1));
    const [counts, setCounts] = useState<number[]>(FACES.map(() => 0));
    const [trace, setTrace] = useState<number[]>([]);
    const svgRef = useRef<SVGSVGElement>(null);
    const dragging = useRef<number | null>(null);

    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const probabilities = weights.map(weight => weight / total);
    const expectation = FACES.reduce((sum, face, index) => sum + face * probabilities[index], 0);
    const rolls = counts.reduce((sum, count) => sum + count, 0);
    const sampleMean = rolls ? counts.reduce((sum, count, index) => sum + count * FACES[index], 0) / rolls : 0;

    const roll = (times: number) => {
        const next = counts.slice();
        const path = trace.slice();
        let sum = counts.reduce((accumulator, count, index) => accumulator + count * FACES[index], 0);
        for (let step = 0; step < times; step++) {
            const target = Math.random() * total;
            let cumulative = 0, face = 0;
            while (face < 5 && (cumulative += weights[face]) <= target) face++;
            next[face]++;
            sum += FACES[face];
            path.push(sum / (rolls + step + 1));
        }
        setCounts(next);
        setTrace(path.slice(-4000));
    };
    const reset = () => {setCounts(FACES.map(() => 0)); setTrace([]);};

    const setWeightFromPointer = (face: number, clientY: number) => {
        const box = svgRef.current?.getBoundingClientRect();
        if (!box) return;
        const y = ((clientY - box.top) / box.height) * 128;
        const value = Math.min(1, Math.max(0.02, (BASE - y) / HEIGHT));
        setWeights(current => {const next = current.slice(); next[face] = value; return next;});
        reset();
    };

    return <InteractiveFigure
        title="Expectation"
        lede="Drag a bar to change how likely that face is, then roll. The cyan bars are the probabilities you set; the pink bars are how often each face actually came up. The marker below tracks the sample mean against the expectation."
        note="The expectation need not be an attainable value: a fair die has E[X] = 3.5, a number the die can never show. It is the long-run average, not a typical outcome.">
        <div className="interactive-controls">
            <ActionButton variant="primary" onClick={() => roll(1)}>Roll once</ActionButton>
            <ActionButton onClick={() => roll(100)}>Roll 100 times</ActionButton>
            <ActionButton onClick={reset} disabled={rolls === 0}>Reset</ActionButton>
            <ActionButton onClick={() => {setWeights(FACES.map(() => 1)); reset();}}>Fair die</ActionButton>
        </div>
        <Stats>
            <Stat label="Rolls" value={String(rolls)} />
            <Stat label="Sample mean" value={rolls ? sampleMean.toFixed(3) : '—'} color={OBSERVED} />
            <Stat label="Expectation E[X]" value={expectation.toFixed(3)} hint="Σ x · p(x)" color={THEORY} />
        </Stats>
        <div className="interactive-canvas mt-4">
            <svg
                ref={svgRef} viewBox="0 0 320 128" role="application"
                aria-label="Die face probabilities; drag a bar to change a probability"
                onPointerMove={event => {if (dragging.current !== null) setWeightFromPointer(dragging.current, event.clientY);}}
                onPointerUp={() => {dragging.current = null;}}
                onPointerLeave={() => {dragging.current = null;}}>
                {FACES.map((face, index) => {
                    const x = LEFT + index * COLUMN;
                    const probability = probabilities[index];
                    const observed = rolls ? counts[index] / rolls : 0;
                    return <g key={face}>
                        <rect
                            x={x} y={BASE - HEIGHT} width={34} height={HEIGHT} fill="#ffffff08" rx={3}
                            style={{cursor: 'ns-resize'}}
                            onPointerDown={event => {event.currentTarget.releasePointerCapture?.(event.pointerId); dragging.current = index; setWeightFromPointer(index, event.clientY);}} />
                        <rect x={x} y={BASE - probability * HEIGHT} width={34} height={probability * HEIGHT} fill={THEORY} opacity={0.85} rx={3} style={{pointerEvents: 'none'}} />
                        <rect x={x + 9} y={BASE - observed * HEIGHT} width={16} height={observed * HEIGHT} fill={OBSERVED} rx={2} style={{pointerEvents: 'none'}} />
                        <text x={x + 17} y={BASE + 14} textAnchor="middle" fill="#c8c8c8" fontSize={12}>{face}</text>
                        <text x={x + 17} y={BASE - HEIGHT - 4} textAnchor="middle" fill="#8d8d8d" fontSize={10}>{probability.toFixed(2)}</text>
                    </g>;
                })}
                <line x1={LEFT - 4} x2={LEFT + 6 * COLUMN - 8} y1={BASE} y2={BASE} stroke="#4f4f4f" strokeWidth={1} />
            </svg>
        </div>
        <div className="interactive-canvas mt-3">
            <svg viewBox="0 0 320 52" role="img" aria-label={`Expectation ${expectation.toFixed(2)}${rolls ? ` and sample mean ${sampleMean.toFixed(2)}` : ', no rolls yet'}`}>
                <line x1={20} x2={300} y1={34} y2={34} stroke="#4f4f4f" strokeWidth={1.4} />
                {FACES.map(face => <g key={face}>
                    <line x1={20 + ((face - 1) / 5) * 280} x2={20 + ((face - 1) / 5) * 280} y1={30} y2={38} stroke="#4f4f4f" />
                    <text x={20 + ((face - 1) / 5) * 280} y={50} textAnchor="middle" fill="#8d8d8d" fontSize={10}>{face}</text>
                </g>)}
                <polygon points={`${20 + ((expectation - 1) / 5) * 280},26 ${14 + ((expectation - 1) / 5) * 280},14 ${26 + ((expectation - 1) / 5) * 280},14`} fill={THEORY} />
                {rolls > 0 && <polygon points={`${20 + ((sampleMean - 1) / 5) * 280},42 ${14 + ((sampleMean - 1) / 5) * 280},54 ${26 + ((sampleMean - 1) / 5) * 280},54`} fill={OBSERVED} />}
            </svg>
        </div>
        <Legend items={[{color: THEORY, label: 'probability / expectation'}, {color: OBSERVED, label: 'observed frequency / sample mean'}]} />
    </InteractiveFigure>;
}
