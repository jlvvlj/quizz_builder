import { useState } from 'react';
import InteractiveFigure, { ACCENT_C, ActionButton, Legend, OBSERVED, THEORY } from './InteractiveFigure';

type Rect = {x0: number; x1: number; y0: number; y1: number};
const EVENTS: {name: string; color: string; rect: Rect}[] = [
    {name: 'A', color: OBSERVED, rect: {x0: 0.05, x1: 0.55, y0: 0.05, y1: 0.65}},
    {name: 'B', color: THEORY, rect: {x0: 0.35, x1: 0.95, y0: 0.25, y1: 0.75}},
    {name: 'C', color: ACCENT_C, rect: {x0: 0.20, x1: 0.80, y0: 0.50, y1: 0.95}},
];
const SIDE = 196, ORIGIN = 8, CAP = 1500;

const area = (rect: Rect) => Math.max(0, rect.x1 - rect.x0) * Math.max(0, rect.y1 - rect.y0);
const meet = (first: Rect, second: Rect): Rect => ({x0: Math.max(first.x0, second.x0), x1: Math.min(first.x1, second.x1), y0: Math.max(first.y0, second.y0), y1: Math.min(first.y1, second.y1)});
const holds = (rect: Rect, point: {x: number; y: number}) => point.x >= rect.x0 && point.x <= rect.x1 && point.y >= rect.y0 && point.y <= rect.y1;
const toX = (value: number) => ORIGIN + value * SIDE;

/** Conditioning on an event throws away the rest of the sample space and renormalises what is left. */
export default function ConditionalProbability() {
    const [points, setPoints] = useState<{x: number; y: number}[]>([]);
    const [given, setGiven] = useState<string | null>(null);

    const condition = given ? EVENTS.find(event => event.name === given)!.rect : {x0: 0, x1: 1, y0: 0, y1: 1};
    const inCondition = points.filter(point => holds(condition, point));
    const drop = (times: number) => setPoints(current => [...current, ...Array.from({length: times}, () => ({x: Math.random(), y: Math.random()}))].slice(-CAP));

    const rows = EVENTS.map(event => {
        const joint = meet(event.rect, condition);
        const observed = inCondition.length ? inCondition.filter(point => holds(event.rect, point)).length / inCondition.length : 0;
        return {...event, truth: area(joint) / area(condition), observed, matches: inCondition.filter(point => holds(event.rect, point)).length};
    });

    return <InteractiveFigure
        title="Conditional probability"
        lede="Points land uniformly in the square, so an event's probability is just its area. Condition on an event and the square dims to that event alone — the probabilities are recomputed against what is left, not against the original square."
        note={<>Conditioning divides by what you know: P(A | B) = P(A ∩ B) / P(B). Notice that conditioning can push a probability either way — P(A | C) is smaller than P(A) here, while P(B | C) is larger — and that P(B | B) = 1, because once B is given, B is certain.</>}>
        <div className="interactive-tabs" role="group" aria-label="Condition on an event">
            <button type="button" className="interactive-tab" aria-pressed={given === null} onClick={() => setGiven(null)}>Whole sample space</button>
            {EVENTS.map(event => <button
                key={event.name} type="button" className="interactive-tab" aria-pressed={given === event.name}
                style={{['--tab-color' as string]: event.color}} onClick={() => setGiven(event.name)}>given {event.name}</button>)}
        </div>
        <div className="interactive-controls">
            <ActionButton variant="primary" onClick={() => drop(1)}>Drop a point</ActionButton>
            <ActionButton onClick={() => drop(200)}>Drop 200 points</ActionButton>
            <ActionButton onClick={() => setPoints([])} disabled={points.length === 0}>Reset</ActionButton>
        </div>
        <div className="interactive-canvas mt-4" style={{maxWidth: 420, marginInline: 'auto'}}>
            <svg viewBox="0 0 212 212" role="img" aria-label={given ? `Sample space restricted to event ${given}` : 'Whole sample space with events A, B and C'}>
                <rect x={ORIGIN} y={ORIGIN} width={SIDE} height={SIDE} fill="#ffffff06" stroke="#5a5a5a" rx={4} />
                {points.map((point, index) => {
                    const inside = holds(condition, point);
                    return <circle key={index} cx={toX(point.x)} cy={toX(point.y)} r={1.7} fill={inside ? '#ffffff' : '#ffffff'} opacity={inside ? 0.75 : 0.06} />;
                })}
                {given && <path
                    d={`M${ORIGIN},${ORIGIN} h${SIDE} v${SIDE} h${-SIDE} Z M${toX(condition.x0)},${toX(condition.y0)} v${(condition.y1 - condition.y0) * SIDE} h${(condition.x1 - condition.x0) * SIDE} v${-(condition.y1 - condition.y0) * SIDE} Z`}
                    fillRule="evenodd" fill="#181818" opacity={0.78} />}
                {EVENTS.map(event => <g key={event.name}>
                    <rect
                        x={toX(event.rect.x0)} y={toX(event.rect.y0)}
                        width={(event.rect.x1 - event.rect.x0) * SIDE} height={(event.rect.y1 - event.rect.y0) * SIDE}
                        fill={event.color} fillOpacity={given === event.name ? 0.16 : 0.07}
                        stroke={event.color} strokeWidth={given === event.name ? 2 : 1.2} rx={3} />
                    <text x={toX(event.rect.x0) + 7} y={toX(event.rect.y0) + 15} fill={event.color} fontSize={13} fontFamily="Georgia, serif">{event.name}</text>
                </g>)}
            </svg>
        </div>
        <div className="interactive-canvas mt-3">
            <p style={{margin: '0 0 10px', font: '14px/1.5 system-ui', color: '#b8b8b8'}}>
                {given ? `${inCondition.length} of ${points.length} points fall in ${given}; only those count now.` : `${points.length} points dropped.`}
            </p>
            <svg viewBox="0 0 320 112" role="img" aria-label="Conditional probabilities of each event">
                {rows.map((row, index) => {
                    const y = 10 + index * 34;
                    return <g key={row.name}>
                        <text x={0} y={y + 14} fill={row.color} fontSize={12} fontFamily="Georgia, serif">{given ? `P(${row.name}|${given})` : `P(${row.name})`}</text>
                        <rect x={72} y={y} width={190} height={9} fill="#ffffff0d" rx={4} />
                        <rect x={72} y={y} width={190 * row.observed} height={9} fill={OBSERVED} rx={4} />
                        <rect x={72} y={y + 12} width={190} height={9} fill="#ffffff0d" rx={4} />
                        <rect x={72} y={y + 12} width={190 * row.truth} height={9} fill={THEORY} rx={4} />
                        <text x={270} y={y + 8} fill={OBSERVED} fontSize={11}>{inCondition.length ? row.observed.toFixed(3) : '—'}</text>
                        <text x={270} y={y + 20} fill={THEORY} fontSize={11}>{row.truth.toFixed(3)}</text>
                    </g>;
                })}
            </svg>
        </div>
        <Legend items={[{color: OBSERVED, label: 'observed fraction of the surviving points'}, {color: THEORY, label: 'exact ratio of areas'}]} />
    </InteractiveFigure>;
}
