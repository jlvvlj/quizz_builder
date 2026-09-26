import { useState } from 'react';
import InteractiveFigure, { Slider, Stat, Stats, THEORY } from '../InteractiveFigure';

const BLUE = '#4d8dff';

/** The 36 equally likely outcomes of two distinct dice, with the event "the dice sum to s" highlighted. */
export default function DiceGrid() {
    const [sum, setSum] = useState(7);
    const cells = Array.from({ length: 36 }, (_, i) => [Math.floor(i / 6) + 1, (i % 6) + 1] as const);
    const inEvent = cells.filter(([a, b]) => a + b === sum).length;
    return <InteractiveFigure
        title="Two dice, 36 outcomes"
        lede="Each cell is one outcome (die 1, die 2); (1, 2) and (2, 1) are different outcomes. The outcomes in the event are highlighted in blue."
        note="All 36 outcomes are equally likely, so the probability of the event is the number of highlighted cells divided by 36.">
        <div className="interactive-controls">
            <Slider label="Sum of the dice" value={sum} min={2} max={12} onChange={setSum} />
        </div>
        <div className="grid grid-cols-6 gap-1 font-mono text-sm sm:text-base" role="grid" aria-label={`Outcomes where the sum is ${sum}`}>
            {cells.map(([a, b]) => {
                const hit = a + b === sum;
                return <div key={`${a}-${b}`} role="gridcell" aria-selected={hit} className="rounded-md px-1 py-2 text-center"
                    style={{ background: hit ? BLUE : '#232323', color: hit ? '#fff' : '#9a9a9a', fontWeight: hit ? 600 : 400 }}>({a}, {b})</div>;
            })}
        </div>
        <Stats>
            <Stat label="Outcomes in the event" value={String(inEvent)} color={BLUE} />
            <Stat label="Sample space" value="36" />
            <Stat label="Probability" value={`${inEvent} / 36 = ${(inEvent / 36).toFixed(3)}`} color={THEORY} />
        </Stats>
    </InteractiveFigure>;
}
