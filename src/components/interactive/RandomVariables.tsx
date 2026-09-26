import { useState } from 'react';
import InteractiveFigure, { ActionButton, Legend, OBSERVED, Stat, Stats, THEORY } from './InteractiveFigure';

const OUTCOMES = Array.from({length: 36}, (_, index) => ({first: Math.floor(index / 6) + 1, second: (index % 6) + 1}));
const PRESETS: {label: string; assign: (outcome: {first: number; second: number}) => number}[] = [
    {label: 'Sum of the two rolls', assign: outcome => outcome.first + outcome.second},
    {label: 'Larger of the two rolls', assign: outcome => Math.max(outcome.first, outcome.second)},
    {label: 'Absolute difference', assign: outcome => Math.abs(outcome.first - outcome.second)},
    {label: 'Indicator of a double', assign: outcome => (outcome.first === outcome.second ? 1 : 0)},
];

/** A random variable is a function on the sample space; its PMF is the weight that function collects. */
export default function RandomVariables() {
    const [preset, setPreset] = useState(0);
    const [assignment, setAssignment] = useState<number[]>(OUTCOMES.map(PRESETS[0].assign));
    const [custom, setCustom] = useState(false);
    const [samples, setSamples] = useState<number[]>([]);

    const values = Array.from(new Set(assignment)).sort((a, b) => a - b);
    const pmf = values.map(value => ({value, probability: assignment.filter(item => item === value).length / 36}));
    const expectation = assignment.reduce((sum, value) => sum + value, 0) / 36;
    const observedMean = samples.length ? samples.reduce((sum, value) => sum + value, 0) / samples.length : 0;
    const peak = Math.max(...pmf.map(bar => bar.probability), ...values.map(value => samples.length ? samples.filter(item => item === value).length / samples.length : 0));

    const applyPreset = (index: number) => {setPreset(index); setCustom(false); setAssignment(OUTCOMES.map(PRESETS[index].assign)); setSamples([]);};
    const cycle = (index: number) => {
        setAssignment(current => {const next = current.slice(); next[index] = (next[index] + 1) % 13; return next;});
        setCustom(true);
        setSamples([]);
    };
    const sample = (times: number) => setSamples(current => [...current, ...Array.from({length: times}, () => assignment[Math.floor(Math.random() * 36)])].slice(-6000));

    return <InteractiveFigure
        title="Random variables"
        lede="The grid is the sample space of two fair dice: 36 equally likely outcomes. A random variable attaches a number to each of them. Pick a rule — or click any cell to write your own — then sample and watch the histogram fill in the shape the assignment already determined."
        note="The distribution is not an extra assumption: once the numbers are written on the grid, the PMF is fixed, because every cell has probability 1/36 and the PMF just collects the cells that share a value. Different functions on the same sample space give completely different distributions.">
        <div className="interactive-tabs" role="group" aria-label="Choose a random variable">
            {PRESETS.map((item, index) => <button
                key={item.label} type="button" className="interactive-tab"
                aria-pressed={!custom && preset === index} onClick={() => applyPreset(index)}>{item.label}</button>)}
            {custom && <span className="interactive-tab" aria-pressed="true">your own assignment</span>}
        </div>
        <div className="interactive-canvas mt-4">
            <p className="interactive-hint" style={{marginTop: 0}}>Sample space Ω — click a cell to change the number that outcome maps to</p>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 4, maxWidth: 330}}>
                {OUTCOMES.map((outcome, index) => {
                    const value = assignment[index];
                    const weight = values.length > 1 ? (value - values[0]) / (values[values.length - 1] - values[0]) : 0.5;
                    return <button
                        key={index} type="button" onClick={() => cycle(index)}
                        title={`Roll ${outcome.first} then ${outcome.second} ↦ ${value}`}
                        aria-label={`Outcome ${outcome.first}, ${outcome.second} maps to ${value}. Click to change.`}
                        style={{
                            aspectRatio: '1', border: '1px solid #3f3f3f', borderRadius: 6, cursor: 'pointer',
                            background: `color-mix(in srgb, ${THEORY} ${12 + weight * 58}%, #1c1c1c)`,
                            color: '#fff', font: '600 14px/1 Georgia, serif',
                        }}>{value}</button>;
                })}
            </div>
        </div>
        <div className="interactive-controls">
            <ActionButton variant="primary" onClick={() => sample(1)}>Sample once</ActionButton>
            <ActionButton onClick={() => sample(300)}>Sample 300 times</ActionButton>
            <ActionButton onClick={() => setSamples([])} disabled={samples.length === 0}>Reset samples</ActionButton>
        </div>
        <Stats>
            <Stat label="Samples" value={String(samples.length)} />
            <Stat label="Sample mean" value={samples.length ? observedMean.toFixed(3) : '—'} color={OBSERVED} />
            <Stat label="E[X]" value={expectation.toFixed(3)} color={THEORY} />
            <Stat label="Distinct values" value={String(values.length)} />
        </Stats>
        <div className="interactive-canvas interactive-scroll mt-4">
            <svg viewBox={`0 0 ${Math.max(320, values.length * 34)} 128`} role="img" aria-label="Probability mass function and sampled histogram">
                {pmf.map((bar, index) => {
                    const width = Math.max(320, values.length * 34);
                    const slot = width / values.length;
                    const x = index * slot + slot * 0.16;
                    const inner = slot * 0.68;
                    const observed = samples.length ? samples.filter(item => item === bar.value).length / samples.length : 0;
                    return <g key={bar.value}>
                        <rect x={x} y={104 - (bar.probability / peak) * 88} width={inner} height={(bar.probability / peak) * 88} fill={THEORY} opacity={0.85} rx={3} />
                        <rect x={x + inner * 0.26} y={104 - (observed / peak) * 88} width={inner * 0.48} height={(observed / peak) * 88} fill={OBSERVED} rx={2} />
                        <text x={x + inner / 2} y={120} textAnchor="middle" fill="#c8c8c8" fontSize={11}>{bar.value}</text>
                    </g>;
                })}
                <line x1={0} x2={Math.max(320, values.length * 34)} y1={104} y2={104} stroke="#4f4f4f" />
            </svg>
        </div>
        <Legend items={[{color: THEORY, label: 'PMF p(x) from the assignment'}, {color: OBSERVED, label: 'sampled relative frequency'}]} />
    </InteractiveFigure>;
}
