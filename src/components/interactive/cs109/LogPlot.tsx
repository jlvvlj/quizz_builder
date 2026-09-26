import { useState } from 'react';
import InteractiveFigure, { Legend, OBSERVED, Slider, Stat, Stats, THEORY } from '../InteractiveFigure';

const X0 = 40, X1 = 310, Y0 = 20, Y1 = 180;
const LOW = -5; // the vertical axis runs from log(x) = -5 up to 1

/** x and log(x) for 0 < x ≤ 1: every log of a probability is at most zero, and falls away fast near 0. */
export default function LogPlot() {
    const [x, setX] = useState(0.5);
    const px = (v: number) => X0 + v * (X1 - X0);
    const py = (v: number) => Y1 - ((v - LOW) / (1 - LOW)) * (Y1 - Y0);
    const curve = Array.from({ length: 200 }, (_, i) => (i + 1) / 200).filter(v => Math.log(v) >= LOW).map(v => `${px(v)},${py(Math.log(v))}`).join(' ');
    return <InteractiveFigure
        title="x and log(x)"
        lede="The straight line is x, the curve is log(x), both for values a probability can take, 0 < x ≤ 1. Move x to read off its log."
        note="Every log is negative, except log(1) = 0. As x approaches 0, log(x) heads toward negative infinity, so it never runs out of room for tiny probabilities.">
        <div className="interactive-controls"><Slider label="x" value={x} min={0.01} max={1} step={0.01} format={v => v.toFixed(2)} onChange={setX} /></div>
        <Legend items={[{ color: THEORY, label: 'x' }, { color: OBSERVED, label: 'log(x)' }]} />
        <div className="interactive-canvas">
            <svg viewBox="0 0 320 200" role="img" aria-label={`log(${x.toFixed(2)}) = ${Math.log(x).toFixed(3)}`}>
                <line x1={X0} x2={X1} y1={py(0)} y2={py(0)} stroke="#666" />
                <line x1={X0} x2={X0} y1={Y0} y2={Y1} stroke="#666" />
                {[1, 0, -1, -2, -3, -4, -5].map(v => <text key={v} x={X0 - 6} y={py(v) + 3} fill="#8a8a8a" fontSize="9" textAnchor="end">{v}</text>)}
                {[0, 0.5, 1].map(v => <text key={v} x={px(v)} y={py(0) + 12} fill="#8a8a8a" fontSize="9" textAnchor="middle">{v}</text>)}
                <line x1={px(0)} y1={py(0)} x2={px(1)} y2={py(1)} stroke={THEORY} strokeWidth="1.5" />
                <polyline points={curve} fill="none" stroke={OBSERVED} strokeWidth="1.5" />
                <circle cx={px(x)} cy={py(Math.log(x))} r="4" fill={OBSERVED} />
                <circle cx={px(x)} cy={py(x)} r="4" fill={THEORY} />
            </svg>
        </div>
        <Stats><Stat label="x" value={x.toFixed(2)} color={THEORY} /><Stat label="log(x)" value={Math.log(x).toFixed(3)} color={OBSERVED} /></Stats>
    </InteractiveFigure>;
}
