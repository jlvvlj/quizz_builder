import { useState } from 'react';
import InteractiveFigure, { ActionButton, OBSERVED, Slider, Stat, Stats, THEORY } from '../InteractiveFigure';

type Phase = 'pick' | 'host' | 'decide' | 'done';

/** The Monty Hall game with n doors, and a tally of how staying and switching fare over many games. */
export default function MontyHall() {
    const [doors, setDoors] = useState(3);
    const [prize, setPrize] = useState(0);
    const [picked, setPicked] = useState<number | null>(null);
    const [other, setOther] = useState<number | null>(null);
    const [final, setFinal] = useState<number | null>(null);
    const [phase, setPhase] = useState<Phase>('pick');
    const [tally, setTally] = useState({ stay: [0, 0], switch: [0, 0] }); // [wins, games]

    const newGame = () => { setPicked(null); setOther(null); setFinal(null); setPhase('pick'); };
    // The prize is placed when you pick, in the click handler: a fixed first game would give it away.
    const pick = (door: number) => { if (phase === 'pick') { setPrize(Math.floor(Math.random() * doors)); setPicked(door); setPhase('host'); } };
    const hostOpens = () => {
        if (picked === null) return;
        // The host leaves closed the prize door, or, if you already picked it, a random other door.
        const closed = picked !== prize ? prize : (() => { const rest = [...Array(doors).keys()].filter(d => d !== picked); return rest[Math.floor(Math.random() * rest.length)]; })();
        setOther(closed); setPhase('decide');
    };
    const decide = (door: number) => {
        setFinal(door); setPhase('done');
        const key = door === picked ? 'stay' : 'switch';
        const won = door === prize ? 1 : 0;
        setTally(t => ({ ...t, [key]: [t[key][0] + won, t[key][1] + 1] }));
    };
    const rate = ([wins, games]: number[]) => games ? `${(wins / games).toFixed(2)} (${wins} of ${games})` : '—';
    const open = (door: number) => phase === 'done' || ((phase === 'decide') && door !== picked && door !== other);

    return <InteractiveFigure
        title="The Monty Hall game"
        lede="Pick a door. The host then opens every other door except one, never revealing the prize. Stay with your door or switch to the one left closed, then play again to build up a tally."
        note="The host's actions concentrate the remaining probability into the other closed door: staying wins with probability 1/n, switching with probability (n − 1)/n.">
        <div className="interactive-controls">
            <Slider label="Doors, n" value={doors} min={3} max={10} onChange={n => { setDoors(n); newGame(); }} />
            <ActionButton onClick={() => newGame()}>New game</ActionButton>
        </div>
        <p className="interactive-hint" aria-live="polite">
            {phase === 'pick' && 'Pick a door.'}
            {phase === 'host' && `You picked door ${(picked ?? 0) + 1}. Now let the host open the other doors.`}
            {phase === 'decide' && `The host left door ${(other ?? 0) + 1} closed. Stay with door ${(picked ?? 0) + 1} or switch?`}
            {phase === 'done' && (final === prize ? `You win! The prize was behind door ${prize + 1}.` : `No prize. It was behind door ${prize + 1}.`)}
        </p>
        <div className="flex flex-wrap gap-2">
            {Array.from({ length: doors }, (_, d) => {
                const shown = open(d);
                const chosen = d === picked || d === final;
                return <button key={d} type="button" disabled={phase !== 'pick' && !(phase === 'decide' && (d === picked || d === other))}
                    onClick={() => phase === 'pick' ? pick(d) : decide(d)}
                    className="grid h-20 w-14 place-items-center rounded-lg border-2 text-sm font-semibold disabled:cursor-default"
                    style={{ borderColor: chosen ? OBSERVED : '#555', background: shown ? (d === prize ? '#1f4d2f' : '#1b1b1b') : '#2c2c2c', color: '#eee' }}>
                    {shown ? (d === prize ? 'PRIZE' : 'EMPTY') : `Door ${d + 1}`}
                </button>;
            })}
        </div>
        {phase === 'host' && <div className="interactive-controls"><ActionButton variant="primary" onClick={hostOpens}>Host opens other doors</ActionButton></div>}
        <Stats>
            <Stat label="Stay wins" value={rate(tally.stay)} hint={`theory ${(1 / doors).toFixed(2)}`} color={THEORY} />
            <Stat label="Switch wins" value={rate(tally.switch)} hint={`theory ${((doors - 1) / doors).toFixed(2)}`} color={OBSERVED} />
        </Stats>
    </InteractiveFigure>;
}
