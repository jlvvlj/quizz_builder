import { useState } from 'react';
import InteractiveFigure, { Legend, Slider, Stat, Stats } from './InteractiveFigure';

const PMF_COLOR = '#f5c542', CDF_COLOR = '#ff8a3d';
export type Family = 'bernoulli' | 'binomial' | 'geometric' | 'poisson';

const choose = (n: number, k: number) => {
    let value = 1;
    for (let step = 0; step < k; step++) value = (value * (n - step)) / (step + 1);
    return value;
};

export const FAMILIES: Record<Family, {
    label: string;
    formula: string;
    support: (p: number, n: number) => number[];
    pmf: (k: number, p: number, n: number) => number;
    mean: (p: number, n: number) => number;
    variance: (p: number, n: number) => number;
    usesN: boolean;
    parameter: {label: string; min: number; max: number; step: number};
    story: string;
}> = {
    bernoulli: {
        label: 'Bernoulli(p)', formula: 'p(1) = p,  p(0) = 1 − p', usesN: false,
        parameter: {label: 'p', min: 0, max: 1, step: 0.01},
        support: () => [0, 1],
        pmf: (k, p) => (k === 1 ? p : 1 - p),
        mean: p => p, variance: p => p * (1 - p),
        story: 'One trial, coded 1 for success and 0 for failure.',
    },
    binomial: {
        label: 'Binomial(n, p)', formula: 'p(k) = C(n, k) · pᵏ (1 − p)ⁿ⁻ᵏ,  k = 0, …, n', usesN: true,
        parameter: {label: 'p', min: 0, max: 1, step: 0.01},
        support: (_p, n) => Array.from({length: n + 1}, (_, k) => k),
        pmf: (k, p, n) => choose(n, k) * p ** k * (1 - p) ** (n - k),
        mean: (p, n) => n * p, variance: (p, n) => n * p * (1 - p),
        story: 'The number of successes in n independent trials that each succeed with probability p.',
    },
    geometric: {
        label: 'Geometric(p)', formula: 'p(k) = (1 − p)ᵏ⁻¹ p,  k = 1, 2, …', usesN: false,
        parameter: {label: 'p', min: 0.02, max: 1, step: 0.01},
        support: () => Array.from({length: 24}, (_, index) => index + 1),
        pmf: (k, p) => (1 - p) ** (k - 1) * p,
        mean: p => 1 / p, variance: p => (1 - p) / p ** 2,
        story: 'The number of independent trials up to and including the first success.',
    },
    poisson: {
        label: 'Poisson(λ)', formula: 'p(k) = e⁻ᵛ λᵏ ⁄ k!,  k = 0, 1, 2, …', usesN: false,
        parameter: {label: 'λ', min: 0.1, max: 12, step: 0.1},
        support: lambda => Array.from({length: Math.min(28, Math.ceil(lambda * 3 + 8))}, (_, k) => k),
        pmf: (k, lambda) => {
            let value = Math.exp(-lambda);
            for (let step = 1; step <= k; step++) value = (value * lambda) / step;
            return value;
        },
        mean: lambda => lambda, variance: lambda => lambda,
        story: 'Counts of rare events, and the limit of a binomial when n grows while n·p stays fixed.',
    },
};

/** The four discrete families of section 2.2, with their PMF and CDF drawn together. */
export default function DiscreteDistributions({lock}: {lock?: Family}) {
    const [family, setFamily] = useState<Family>(lock ?? 'binomial');
    const [parameter, setParameter] = useState(lock === 'poisson' ? 4 : 0.5);
    const [trials, setTrials] = useState(10);
    const active = FAMILIES[family];
    const support = active.support(parameter, trials);
    const masses = support.map(k => active.pmf(k, parameter, trials));
    const peak = Math.max(...masses, 1e-9);
    const width = Math.max(320, support.length * 22);
    const slot = width / support.length;
    let running = 0;
    const cumulative = masses.map(mass => (running += mass));

    const select = (next: Family) => {
        setFamily(next);
        setParameter(next === 'poisson' ? 4 : 0.5);
    };

    return <InteractiveFigure
        title={lock ? `${active.label}` : 'Discrete distributions'}
        lede={`${active.story} Move the sliders and watch both curves respond: the amber bars are the probability mass function p(k), and the orange steps are the cumulative distribution F(k) = P(X ≤ k).`}
        note="The CDF never decreases and ends at 1, because it accumulates probabilities that are non-negative and sum to 1. Its jump at each k is exactly p(k), so the two pictures carry the same information.">
        {!lock && <div className="interactive-tabs" role="group" aria-label="Distribution family">
            {(Object.keys(FAMILIES) as Family[]).map(key => <button
                key={key} type="button" className="interactive-tab" aria-pressed={family === key}
                style={{['--tab-color' as string]: PMF_COLOR}} onClick={() => select(key)}>{FAMILIES[key].label}</button>)}
        </div>}
        <div className="interactive-controls">
            <Slider
                label={active.parameter.label} value={parameter} min={active.parameter.min} max={active.parameter.max} step={active.parameter.step}
                format={value => value.toFixed(2)} onChange={setParameter} />
            {active.usesN && <Slider label="n" value={trials} min={1} max={30} onChange={setTrials} />}
        </div>
        <Stats>
            <Stat label="Mean E[X]" value={active.mean(parameter, trials).toFixed(3)} />
            <Stat label="Variance" value={active.variance(parameter, trials).toFixed(3)} />
            <Stat label="PMF" value={active.formula} />
        </Stats>
        <div className="interactive-canvas interactive-scroll mt-4">
            <svg viewBox={`0 0 ${width} 140`} role="img" aria-label={`Probability mass function and cumulative distribution of ${active.label}`}>
                <line x1={0} x2={width} y1={112} y2={112} stroke="#4f4f4f" />
                {support.map((k, index) => (
                    <rect
                        key={k} x={index * slot + slot * 0.2} y={112 - (masses[index] / peak) * 96} width={slot * 0.6}
                        height={(masses[index] / peak) * 96} fill={PMF_COLOR} opacity={0.88} rx={2}>
                        <title>{`p(${k}) = ${masses[index].toFixed(4)}`}</title>
                    </rect>
                ))}
                <polyline
                    fill="none" stroke={CDF_COLOR} strokeWidth={1.8}
                    points={support.map((_, index) => `${index * slot + slot * 0.2},${112 - cumulative[index] * 96} ${index * slot + slot * 0.8},${112 - cumulative[index] * 96}`).join(' ')} />
                {support.map((k, index) => (support.length <= 16 || index % Math.ceil(support.length / 12) === 0)
                    ? <text key={k} x={index * slot + slot / 2} y={128} textAnchor="middle" fill="#c8c8c8" fontSize={11}>{k}</text>
                    : null)}
            </svg>
        </div>
        <Legend items={[{color: PMF_COLOR, label: 'p(k) — probability mass'}, {color: CDF_COLOR, label: 'F(k) = P(X ≤ k) — cumulative'}]} />
        {family === 'geometric' && <p className="interactive-hint">The plot shows the first 24 values; the tail continues forever, which is why the steps never quite reach 1.</p>}
    </InteractiveFigure>;
}
