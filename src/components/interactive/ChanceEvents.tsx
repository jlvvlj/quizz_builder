import { useState } from 'react';
import InteractiveFigure, { ActionButton, Legend, OBSERVED, Slider, Stat, Stats, THEORY, formatProbability } from './InteractiveFigure';

/** Relative frequency of a repeated chance experiment settles on the probability that defines it. */
export default function ChanceEvents() {
    const [bias, setBias] = useState(0.5);
    const [heads, setHeads] = useState(0);
    const [trials, setTrials] = useState(0);
    const [trace, setTrace] = useState<number[]>([]);
    const [last, setLast] = useState<'H' | 'T' | null>(null);

    const flip = (count: number) => {
        let wins = heads;
        const next = trace.slice();
        let outcome: 'H' | 'T' = last ?? 'H';
        for (let index = 0; index < count; index++) {
            const isHeads = Math.random() < bias;
            outcome = isHeads ? 'H' : 'T';
            if (isHeads) wins++;
            next.push(wins / (trials + index + 1));
        }
        setHeads(wins);
        setTrials(trials + count);
        setTrace(next.slice(-4000));
        setLast(outcome);
    };
    const reset = () => {setHeads(0); setTrials(0); setTrace([]); setLast(null);};

    const observed = trials ? heads / trials : 0;
    const bars = [
        {label: 'Heads', value: trials ? heads / trials : 0, truth: bias, count: heads},
        {label: 'Tails', value: trials ? (trials - heads) / trials : 0, truth: 1 - bias, count: trials - heads},
    ];
    // Show at most 240 points so a long run still draws in one pass.
    const stride = Math.max(1, Math.ceil(trace.length / 240));
    const points = trace.filter((_, index) => index % stride === 0 || index === trace.length - 1);

    return <InteractiveFigure
        title="Chance events"
        lede="Flip a coin whose bias you control. Each bar is the fraction of flips that landed that way; the dashed line is the probability the model assigns. The two meet as the number of flips grows."
        note="The observed fraction is not the probability — it is an estimate of it that gets steadier with more trials. A biased coin still obeys the axioms: the two bars always sum to 1.">
        <div className="interactive-controls">
            <ActionButton variant="primary" onClick={() => flip(1)}>Flip once</ActionButton>
            <ActionButton onClick={() => flip(100)}>Flip 100 times</ActionButton>
            <ActionButton onClick={reset} disabled={trials === 0}>Reset</ActionButton>
        </div>
        <div className="interactive-controls">
            <Slider label="P(heads)" value={bias} min={0} max={1} step={0.01} format={value => value.toFixed(2)} onChange={value => {setBias(value); reset();}} />
        </div>
        <Stats>
            <Stat label="Flips" value={String(trials)} />
            <Stat label="Observed P(heads)" value={trials ? formatProbability(observed) : '—'} hint={trials ? `${heads} of ${trials}` : 'no flips yet'} color={OBSERVED} />
            <Stat label="True P(heads)" value={bias.toFixed(2)} color={THEORY} />
            <Stat label="Last flip" value={last === 'H' ? 'Heads' : last === 'T' ? 'Tails' : '—'} />
        </Stats>
        <div className="interactive-canvas mt-4">
            <svg viewBox="0 0 320 128" role="img" aria-label={`Observed frequencies after ${trials} flips`}>
                {bars.map((bar, index) => {
                    const x = 34 + index * 150;
                    const height = bar.value * 88;
                    const truthY = 100 - bar.truth * 88;
                    return <g key={bar.label}>
                        <rect x={x} y={12} width={104} height={88} fill="#ffffff08" rx={4} />
                        <rect x={x} y={100 - height} width={104} height={height} fill={OBSERVED} rx={4} />
                        <line x1={x - 6} x2={x + 110} y1={truthY} y2={truthY} stroke={THEORY} strokeWidth={1.6} strokeDasharray="5 4" />
                        <text x={x + 52} y={116} textAnchor="middle" fill="#c8c8c8" fontSize={12}>{bar.label}</text>
                        <text x={x + 52} y={9} textAnchor="middle" fill="#e5e5e5" fontSize={12} fontVariant="tabular-nums">{trials ? `${(bar.value * 100).toFixed(1)}%` : '—'}</text>
                    </g>;
                })}
            </svg>
        </div>
        {points.length > 1 && <div className="interactive-canvas mt-3">
            <svg viewBox="0 0 320 90" role="img" aria-label="Running fraction of heads across the flips so far">
                <line x1={0} x2={320} y1={82 - bias * 74} y2={82 - bias * 74} stroke={THEORY} strokeWidth={1.4} strokeDasharray="5 4" />
                <polyline
                    fill="none" stroke={OBSERVED} strokeWidth={1.8} strokeLinejoin="round"
                    points={points.map((value, index) => `${(index / (points.length - 1)) * 320},${82 - value * 74}`).join(' ')} />
                <text x={4} y={12} fill="#8d8d8d" fontSize={10}>running fraction of heads · {trials} flips</text>
            </svg>
        </div>}
        <Legend items={[{color: OBSERVED, label: 'observed frequency'}, {color: THEORY, label: 'assigned probability'}]} />
    </InteractiveFigure>;
}
