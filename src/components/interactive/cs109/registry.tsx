import { ReactNode } from 'react';
import BayesCalculator from './BayesCalculator';
import CoinFlips from './CoinFlips';
import DiceGrid from './DiceGrid';
import DiceSimulation from './DiceSimulation';
import { DnaGraph, MutationSequences } from './DnaMutations';
import InclusionExclusion from './InclusionExclusion';
import LogPlot from './LogPlot';
import MontyHall from './MontyHall';
import MovieProbabilities from './MovieProbabilities';
import NaturalFrequency from './NaturalFrequency';
import NetworkReliability from './NetworkReliability';
import Orderings from './Orderings';
import { PokerBoard, PokerSamples } from './Poker';
import Serendipity from './Serendipity';

const KHeads = ({ highlight }: { highlight?: number }) => <Orderings title="Every way to get exactly k heads"
    lede="All the orderings of n coin flips with exactly k heads, one per row. The list scrolls." highlight={highlight} />;

/**
 * The CS109 course's own interactive figures, keyed by the slot id its manuscript places them at
 * (`@interactive <id>`). They are separate from the book course's figures by design.
 */
const FIGURES: Record<string, () => ReactNode> = {
    'probability-1': () => <DiceSimulation />,
    'equally-likely-1': () => <DiceGrid />,
    'cond-prob-1': () => <MovieProbabilities />,
    'cond-prob-2': () => <MovieProbabilities conditioned />,
    'bayes-theorem-1': () => <BayesCalculator />,
    'bayes-theorem-2': () => <NaturalFrequency />,
    'log-probabilities-1': () => <LogPlot />,
    'many-flips-1': () => <CoinFlips />,
    // The lesson points at row 128 of this list, so it is marked.
    'many-flips-2': () => <KHeads highlight={128} />,
    'binomial-diff-p-1': () => <KHeads />,
    'counting-1': () => <InclusionExclusion />,
    'random-walks-2': () => <Orderings success="Right" failure="Left" n={10} k={6} title="Every way to end at position 2"
        lede="All the series of 10 moves with exactly 6 moves right and 4 left, one per row. The list scrolls." />,
    'random-walks-3': () => <DnaGraph />,
    'random-walks-4': () => <MutationSequences />,
    'poker-1': () => <PokerBoard />,
    'poker-2': () => <PokerSamples />,
    'serendipity-1': () => <Serendipity />,
    'monty-hall-1': () => <MontyHall />,
    'server-example-1': () => <NetworkReliability />,
};

export function hasCs109Interactive(id: string): boolean {
    return id in FIGURES;
}

export function Cs109Interactive({ id }: { id: string }) {
    const build = FIGURES[id];
    if (build) return <>{build()}</>;
    // Not built yet: say so in place instead of dropping a figure the text refers to.
    return <div role="note" className="my-6 rounded-xl border border-dashed border-[#6B6B6B] bg-[#1F1F1F] p-5 text-sm text-[#A1A1A1]">
        Interactive figure <code className="text-[#FF80AA]">{id}</code> is not built yet.
    </div>;
}
