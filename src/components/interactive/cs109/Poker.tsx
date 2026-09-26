import { useState } from 'react';
import InteractiveFigure, { ActionButton } from '../InteractiveFigure';
import { seeded, shuffle } from './random';

type Card = { rank: string; suit: string };
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
const YOURS: Card[] = [{ rank: 'K', suit: '♥' }, { rank: '4', suit: '♣' }];
const BOARD: Card[] = [{ rank: 'Q', suit: '♦' }, { rank: '6', suit: '♠' }, { rank: 'K', suit: '♠' }, { rank: 'A', suit: '♠' }, { rank: '2', suit: '♣' }];
const OPPONENTS = 5;
const same = (a: Card, b: Card) => a.rank === b.rank && a.suit === b.suit;
const REMAINING = SUITS.flatMap(suit => RANKS.map(rank => ({ rank, suit }))).filter(c => ![...YOURS, ...BOARD].some(k => same(c, k)));

function PlayingCard({ card }: { card: Card }) {
    const red = card.suit === '♥' || card.suit === '♦';
    return <span className="inline-grid h-14 w-10 place-items-center rounded-md border border-[#bbb] bg-white font-semibold leading-none shadow-sm" style={{ color: red ? '#c62828' : '#111' }} aria-label={`${card.rank}${card.suit}`}>
        <span className="text-sm">{card.rank}</span><span className="text-lg">{card.suit}</span>
    </span>;
}

function Row({ label, cards }: { label: string; cards: Card[] }) {
    return <div className="flex flex-wrap items-center gap-2"><span className="w-28 shrink-0 text-sm text-[#A1A1A1]">{label}</span>{cards.map(c => <PlayingCard key={c.rank + c.suit} card={c} />)}</div>;
}

/** The five board cards on the table. */
export function PokerBoard() {
    return <div className="my-6 space-y-3 rounded-xl border border-[#3A3A3A] bg-[#151515] p-4" aria-label="The board and your hand">
        <Row label="Board" cards={BOARD} />
        <Row label="Your hand" cards={YOURS} />
    </div>;
}

/** Outcomes from the sample space: the 45 unseen cards dealt into the 10 open slots, 2 per opponent. */
export function PokerSamples() {
    const [seed, setSeed] = useState(1);
    const random = seeded(seed);
    const examples = Array.from({ length: 3 }, () => shuffle(REMAINING, random).slice(0, OPPONENTS * 2));
    return <InteractiveFigure
        title="Outcomes from the sample space"
        lede={`${REMAINING.length} cards remain unseen. One outcome assigns 10 of them to the open slots, two to each of the ${OPPONENTS} opponents. Here are three outcomes.`}
        note="Each outcome is equally likely, and the order of the slots matters: the same ten cards dealt to different opponents is a different outcome.">
        <div className="interactive-controls"><ActionButton variant="primary" onClick={() => setSeed(seed + 1)}>Shuffle and show new examples</ActionButton></div>
        <div className="space-y-5">
            {examples.map((deal, e) => <div key={e} className="space-y-2">
                <p className="text-sm font-semibold text-[#E5E5E5]">Outcome {e + 1}</p>
                {Array.from({ length: OPPONENTS }, (_, o) => <Row key={o} label={`Opponent ${o + 1}`} cards={deal.slice(o * 2, o * 2 + 2)} />)}
            </div>)}
        </div>
    </InteractiveFigure>;
}
