import { useState } from 'react';
import InteractiveFigure, { ActionButton, Legend, OBSERVED, Stat, Stats, THEORY } from './InteractiveFigure';

const DECK = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Variance is the expected squared distance from the mean, so a running average of (X − μ)² finds it. */
export default function Variance() {
    const [included, setIncluded] = useState<number[]>(DECK);
    const [squares, setSquares] = useState(0);
    const [draws, setDraws] = useState(0);
    const [trace, setTrace] = useState<number[]>([]);
    const [last, setLast] = useState<number | null>(null);

    const mean = included.reduce((sum, value) => sum + value, 0) / included.length;
    const variance = included.reduce((sum, value) => sum + (value - mean) ** 2, 0) / included.length;
    const estimate = draws ? squares / draws : 0;

    const reset = () => {setSquares(0); setDraws(0); setTrace([]); setLast(null);};
    const draw = (times: number) => {
        let total = squares, card = last ?? included[0];
        const path = trace.slice();
        for (let step = 0; step < times; step++) {
            card = included[Math.floor(Math.random() * included.length)];
            total += (card - mean) ** 2;
            path.push(total / (draws + step + 1));
        }
        setSquares(total);
        setDraws(draws + times);
        setTrace(path.slice(-4000));
        setLast(card);
    };
    const toggle = (value: number) => {
        const next = included.includes(value) ? included.filter(item => item !== value) : [...included, value].sort((a, b) => a - b);
        if (next.length === 0) return; // An empty deck has no mean to measure spread around.
        setIncluded(next);
        reset();
    };

    const ceiling = Math.max(variance * 1.6, ...trace.slice(-240), 1);
    const stride = Math.max(1, Math.ceil(trace.length / 240));
    const points = trace.filter((_, index) => index % stride === 0 || index === trace.length - 1);
    const deviation = Math.sqrt(variance);
    const position = (value: number) => 20 + ((value - 1) / 8) * 280;

    return <InteractiveFigure
        title="Variance"
        lede="Choose which cards stay in the deck, then draw. Each draw contributes its squared distance from the mean; the pink line is the running average of those squared distances and the cyan line is the variance of the deck you built."
        note="Removing the middle cards raises the variance without moving the mean — spread and centre are separate facts about a distribution. The standard deviation σ is the square root of the variance, so it is back in the units of the cards themselves.">
        <div className="interactive-canvas">
            <p className="interactive-hint" style={{marginTop: 0}}>Cards in the deck (click to remove or return one)</p>
            <div className="interactive-controls" role="group" aria-label="Cards in the deck">
                {DECK.map(value => {
                    const active = included.includes(value);
                    return <button
                        key={value} type="button" onClick={() => toggle(value)} aria-pressed={active}
                        className="interactive-button"
                        style={{minWidth: 42, opacity: active ? 1 : 0.3, borderColor: active ? THEORY : '#5a5a5a', fontFamily: 'Georgia, serif', fontSize: 16}}>
                        {value}
                    </button>;
                })}
            </div>
        </div>
        <div className="interactive-controls">
            <ActionButton variant="primary" onClick={() => draw(1)}>Draw a card</ActionButton>
            <ActionButton onClick={() => draw(100)}>Draw 100 times</ActionButton>
            <ActionButton onClick={reset} disabled={draws === 0}>Reset</ActionButton>
            <ActionButton onClick={() => {setIncluded(DECK); reset();}}>Full deck</ActionButton>
        </div>
        <Stats>
            <Stat label="Draws" value={String(draws)} hint={last === null ? undefined : `last card ${last}`} />
            <Stat label="Mean μ" value={mean.toFixed(3)} />
            <Stat label="Running avg of (X − μ)²" value={draws ? estimate.toFixed(3) : '—'} color={OBSERVED} />
            <Stat label="Variance" value={variance.toFixed(3)} hint={`σ = ${deviation.toFixed(3)}`} color={THEORY} />
        </Stats>
        <div className="interactive-canvas mt-4">
            <svg viewBox="0 0 320 70" role="img" aria-label={`Deck values spread around a mean of ${mean.toFixed(2)}`}>
                <rect x={position(Math.max(1, mean - deviation))} y={22} width={Math.max(0, position(Math.min(9, mean + deviation)) - position(Math.max(1, mean - deviation)))} height={20} fill={THEORY} opacity={0.16} rx={3} />
                <line x1={20} x2={300} y1={32} y2={32} stroke="#4f4f4f" strokeWidth={1.2} />
                {DECK.map(value => <circle key={value} cx={position(value)} cy={32} r={included.includes(value) ? 5 : 3} fill={included.includes(value) ? '#e5e5e5' : '#3f3f3f'} />)}
                <line x1={position(mean)} x2={position(mean)} y1={16} y2={48} stroke={THEORY} strokeWidth={1.8} />
                <text x={position(mean)} y={12} textAnchor="middle" fill={THEORY} fontSize={10}>μ</text>
                <text x={20} y={64} fill="#8d8d8d" fontSize={10}>shaded band: μ ± σ</text>
            </svg>
        </div>
        {points.length > 1 && <div className="interactive-canvas mt-3">
            <svg viewBox="0 0 320 90" role="img" aria-label="Running average of squared deviations across the draws so far">
                <line x1={0} x2={320} y1={82 - (variance / ceiling) * 74} y2={82 - (variance / ceiling) * 74} stroke={THEORY} strokeWidth={1.4} strokeDasharray="5 4" />
                <polyline
                    fill="none" stroke={OBSERVED} strokeWidth={1.8} strokeLinejoin="round"
                    points={points.map((value, index) => `${(index / (points.length - 1)) * 320},${82 - Math.min(1, value / ceiling) * 74}`).join(' ')} />
                <text x={4} y={12} fill="#8d8d8d" fontSize={10}>running average of (X − μ)² · {draws} draws</text>
            </svg>
        </div>}
        <Legend items={[{color: OBSERVED, label: 'running average of squared deviations'}, {color: THEORY, label: 'variance of the deck'}]} />
    </InteractiveFigure>;
}
