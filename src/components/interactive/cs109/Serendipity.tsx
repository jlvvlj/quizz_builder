import { useState } from 'react';
import InteractiveFigure, { OBSERVED, Stat, Stats } from '../InteractiveFigure';

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    return <label className="flex flex-col gap-1 text-sm text-[#D1D1D1]">{label}
        <input type="number" min={0} value={value} onChange={e => onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))} className="w-40 rounded-lg border border-[#505050] bg-[#181818] px-3 py-2 text-white" />
    </label>;
}

/** The chance of seeing at least one friend among s people drawn from a population of p with f friends. */
export default function Serendipity() {
    const [population, setPopulation] = useState(17000);
    const [friends, setFriends] = useState(150);
    const [seen, setSeen] = useState(100);
    const problem = seen > population ? 'The people you see cannot outnumber the population.' : friends > population ? 'Your friends cannot outnumber the population.' : '';
    let none = 1;
    // P(no friend) = Π (p − f − i) / (p − i) for i = 0 … s − 1: one factor per person seen.
    if (!problem) for (let i = 0; i < seen; i++) none *= Math.max(0, population - friends - i) / (population - i);
    return <InteractiveFigure
        title="At least one friend"
        lede="Set the population, how many of them are your friends, and how many people you see. Everyone is equally likely to be the next person you see."
        note="The chance climbs far faster than intuition suggests, because it is one minus the chance of missing every one of your friends with every person you see.">
        <div className="interactive-controls flex-wrap">
            <Field label="Total population, p" value={population} onChange={setPopulation} />
            <Field label="Friends, f" value={friends} onChange={setFriends} />
            <Field label="People that you see, s" value={seen} onChange={setSeen} />
        </div>
        {problem ? <p role="alert" className="interactive-hint text-[#ff8a8a]">{problem}</p>
            : <Stats>
                <Stat label="P(see no friend)" value={none.toFixed(4)} />
                <Stat label="P(see at least one friend)" value={(1 - none).toFixed(4)} color={OBSERVED} />
            </Stats>}
    </InteractiveFigure>;
}
