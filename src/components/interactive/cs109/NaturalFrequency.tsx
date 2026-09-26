import { useState } from 'react';
import InteractiveFigure, { Legend, Stat, Stats } from '../InteractiveFigure';
import { MAMMOGRAM, TestModel } from './bayes';
import TestInputs from './TestInputs';

const GROUPS = [
    { key: 'sickPositive', label: 'have the disease, test positive', color: '#ff4b86' },
    { key: 'sickNegative', label: 'have the disease, test negative', color: '#8f3a5a' },
    { key: 'healthyPositive', label: 'no disease, test positive', color: '#f5c542' },
    { key: 'healthyNegative', label: 'no disease, test negative', color: '#3a3a3a' },
] as const;

function counts({ positiveGivenDisease, positiveGivenHealthy, disease }: TestModel, population: number) {
    const sick = Math.round(population * disease);
    const sickPositive = Math.round(sick * positiveGivenDisease);
    const healthyPositive = Math.round((population - sick) * positiveGivenHealthy);
    return { sickPositive, sickNegative: sick - sickPositive, healthyPositive, healthyNegative: population - sick - healthyPositive };
}

/** Bayes' theorem as counting: a population of 1000, split by disease and by test result. */
export default function NaturalFrequency() {
    const [model, setModel] = useState(MAMMOGRAM);
    const population = 1000;
    const c = counts(model, population);
    const people = GROUPS.flatMap(group => Array.from({ length: c[group.key] }, () => group.color));
    const positives = c.sickPositive + c.healthyPositive;
    return <InteractiveFigure
        title="A population of 1000"
        lede="Each dot is one person. The numbers start from the calculator above; change them to see how the four groups shift."
        note="Among everyone who tests positive, the fraction who have the disease is P(disease | positive). When the disease is rare, the healthy people who test positive can far outnumber the sick ones.">
        <TestInputs model={model} onChange={setModel} />
        <Legend items={GROUPS.map(g => ({ color: g.color, label: `${c[g.key]} ${g.label}` }))} />
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(40, minmax(0, 1fr))' }} role="img" aria-label={`${c.sickPositive} sick and positive, ${c.healthyPositive} healthy and positive, out of ${population}`}>
            {people.map((color, i) => <span key={i} className="aspect-square rounded-full" style={{ background: color }} />)}
        </div>
        <Stats>
            <Stat label="Test positive" value={String(positives)} />
            <Stat label="Of those, have the disease" value={String(c.sickPositive)} />
            <Stat label="P(disease | positive)" value={positives ? `${c.sickPositive} / ${positives} = ${(c.sickPositive / positives).toFixed(3)}` : '—'} />
        </Stats>
    </InteractiveFigure>;
}
