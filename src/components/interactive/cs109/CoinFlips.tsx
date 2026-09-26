import { useRef, useState } from 'react';
import InteractiveFigure, { ActionButton, OBSERVED, Slider, Stat, Stats } from '../InteractiveFigure';
import { seeded } from './random';

/** n distinct coins, each landing heads with probability p, flipped independently. */
export default function CoinFlips() {
    const [n, setN] = useState(10);
    const [p, setP] = useState(0.6);
    const [flips, setFlips] = useState<boolean[] | null>(null);
    const random = useRef(seeded(6));
    const simulate = () => setFlips(Array.from({ length: n }, () => random.current() < p));
    const heads = flips?.filter(Boolean).length ?? 0;
    return <InteractiveFigure
        title="Flipping n coins"
        lede="Each coin lands heads (H) with probability p, independently of the others. The coins are distinct, so the order of the results matters."
        note="Simulate several times: the number of heads changes from run to run. How likely each count is, is what the rest of this section works out.">
        <div className="interactive-controls">
            <Slider label="Number of flips, n" value={n} min={1} max={20} onChange={v => { setN(v); setFlips(null); }} />
            <Slider label="P(heads), p" value={p} min={0} max={1} step={0.05} format={v => v.toFixed(2)} onChange={v => { setP(v); setFlips(null); }} />
            <ActionButton variant="primary" onClick={simulate}>Simulate</ActionButton>
        </div>
        <p className="flex flex-wrap gap-2 font-mono text-lg" aria-label="Simulator results">
            {flips ? flips.map((h, i) => <span key={i} className="grid h-9 w-9 place-items-center rounded-full border" style={{ borderColor: h ? OBSERVED : '#555', color: h ? OBSERVED : '#9a9a9a' }}>{h ? 'H' : 'T'}</span>)
                : <span className="text-base text-[#8a8a8a]">Press Simulate to flip the coins.</span>}
        </p>
        {flips && <Stats><Stat label="Heads" value={`${heads} of ${n}`} color={OBSERVED} /></Stats>}
    </InteractiveFigure>;
}
