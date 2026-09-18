import { ReactNode } from 'react';
import ChanceEvents from './ChanceEvents';
import ConditionalProbability from './ConditionalProbability';
import Counting from './Counting';
import DiscreteDistributions from './DiscreteDistributions';
import Expectation from './Expectation';
import RandomVariables from './RandomVariables';
import SetTheory from './SetTheory';
import Variance from './Variance';

/**
 * Which interactive figures belong to which lesson, keyed by `<deckId>:<unitId>`.
 * Both chapters contain a `conditioning-introduction`, so the deck has to be part of the key.
 */
const FIGURES: Record<string, () => ReactNode> = {
    'probability-chapter-1:set-operations': () => <SetTheory />,
    'probability-chapter-1:algebra-of-sets': () => <SetTheory />,
    'probability-chapter-1:probability-laws': () => <ChanceEvents />,
    'probability-chapter-1:conditioning-introduction': () => <ConditionalProbability />,
    'probability-chapter-1:k-permutations': () => <Counting defaultOrdered />,
    'probability-chapter-1:combinations': () => <Counting defaultOrdered={false} />,
    'probability-chapter-2:basic-concepts': () => <RandomVariables />,
    'probability-chapter-2:pmf-introduction': () => <DiscreteDistributions />,
    'probability-chapter-2:bernoulli': () => <DiscreteDistributions lock="bernoulli" />,
    'probability-chapter-2:binomial': () => <DiscreteDistributions lock="binomial" />,
    'probability-chapter-2:geometric': () => <DiscreteDistributions lock="geometric" />,
    'probability-chapter-2:poisson': () => <DiscreteDistributions lock="poisson" />,
    'probability-chapter-2:expectation-mean-variance': () => <><Expectation /><Variance /></>,
};

export function lessonFigures(deckId: string, unitId: string): ReactNode {
    const build = FIGURES[`${deckId}:${unitId}`];
    return build ? build() : null;
}
