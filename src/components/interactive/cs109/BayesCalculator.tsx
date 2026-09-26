import { useState } from 'react';
import InteractiveFigure, { OBSERVED, Stat, Stats, THEORY } from '../InteractiveFigure';
import { MAMMOGRAM, posterior } from './bayes';
import TestInputs from './TestInputs';

/** P(disease | positive) from the test's two error rates and the prior, by Bayes' theorem. */
export default function BayesCalculator() {
    const [model, setModel] = useState(MAMMOGRAM);
    const { positive, diseaseGivenPositive } = posterior(model);
    const f = (v: number) => v.toFixed(3);
    return <InteractiveFigure
        title="Probability of disease given a positive test"
        lede="Set how often the test is positive with and without the disease, and how common the disease is. The first two start at the mammogram's 95% and 7%; the prior of 1% is an example to change."
        note="Let D be the event that the patient has the disease and T the event that the test is positive. The denominator P(T) comes from the law of total probability.">
        <TestInputs model={model} onChange={setModel} />
        <Stats>
            <Stat label="P(T)" value={f(positive)} hint="probability of a positive test" color={THEORY} />
            <Stat label="P(D | T)" value={f(diseaseGivenPositive)} hint="disease, given a positive test" color={OBSERVED} />
        </Stats>
        <p className="interactive-hint font-mono">
            P(D | T) = P(T | D)·P(D) / [P(T | D)·P(D) + P(T | Dᶜ)·P(Dᶜ)] = {f(model.positiveGivenDisease)}·{f(model.disease)} / ({f(model.positiveGivenDisease)}·{f(model.disease)} + {f(model.positiveGivenHealthy)}·{f(1 - model.disease)}) = {f(diseaseGivenPositive)}
        </p>
    </InteractiveFigure>;
}
