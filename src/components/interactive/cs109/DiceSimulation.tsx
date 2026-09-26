import { useEffect, useRef, useState } from 'react';
import InteractiveFigure, { ActionButton, OBSERVED, Slider, Stat, Stats, THEORY } from '../InteractiveFigure';
import { seeded } from './random';

const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const TRUE_PROBABILITY = 2 / 6;

/** Roll a die again and again: the fraction of rolls in E = {5, 6} settles on P(E) = 2/6. */
interface Run { rolls: number; inEvent: number; recent: number[]; trace: number[] }
const EMPTY: Run = { rolls: 0, inEvent: 0, recent: [], trace: [] };

/** Roll a die again and again: the fraction of rolls in E = {5, 6} settles on P(E) = 2/6. */
export default function DiceSimulation() {
    const [running, setRunning] = useState(false);
    const [speed, setSpeed] = useState(3);
    const [run, setRun] = useState<Run>(EMPTY);
    const random = useRef(seeded(109));

    useEffect(() => {
        if (!running) return;
        // Faster settings roll more dice per tick as well as ticking more often.
        const perTick = speed >= 8 ? 40 : speed >= 5 ? 5 : 1;
        const timer = setInterval(() => {
            // Roll outside the updater, which React may call twice: the update itself stays pure.
            const faces = Array.from({ length: perTick }, () => 1 + Math.floor(random.current() * 6));
            const hits = faces.filter(face => face >= 5).length;
            setRun(prev => ({
                rolls: prev.rolls + perTick,
                inEvent: prev.inEvent + hits,
                recent: [...prev.recent, ...faces].slice(-14),
                trace: [...prev.trace, (prev.inEvent + hits) / (prev.rolls + perTick)].slice(-2000),
            }));
        }, 1000 - speed * 95);
        return () => clearInterval(timer);
    }, [running, speed]);

    const { rolls, inEvent, recent, trace } = run;
    const reset = () => { setRunning(false); setRun(EMPTY); };
    const estimate = rolls ? inEvent / rolls : 0;
    const stride = Math.max(1, Math.ceil(trace.length / 240));
    const points = trace.filter((_, i) => i % stride === 0 || i === trace.length - 1);

    return <InteractiveFigure
        title="Rolling for E = {5, 6}"
        lede="Start rolling a fair six-sided die. Each roll that shows a 5 or a 6 is in the event E. The estimate count(E) / n is the fraction of rolls so far that landed in E."
        note="With a handful of rolls the estimate swings widely; after thousands it settles near the true probability 2/6 ≈ 0.333, as the definition of probability says it must in the limit.">
        <div className="interactive-controls">
            <ActionButton variant="primary" onClick={() => setRunning(!running)}>{running ? 'Pause' : rolls ? 'Resume' : 'Start rolling'}</ActionButton>
            <ActionButton onClick={reset} disabled={rolls === 0}>Reset</ActionButton>
            <Slider label="Speed" value={speed} min={0} max={10} onChange={setSpeed} />
        </div>
        <p className="text-3xl tracking-widest" aria-label="Most recent rolls">
            {recent.length ? recent.map((face, i) => <span key={i} style={{ color: face >= 5 ? OBSERVED : '#8a8a8a' }}>{FACES[face - 1]}</span>) : <span className="text-base text-[#8a8a8a]">No rolls yet</span>}
        </p>
        <Stats>
            <Stat label="Rolls, n" value={String(rolls)} />
            <Stat label="count(E)" value={String(inEvent)} hint="rolls showing 5 or 6" color={OBSERVED} />
            <Stat label="count(E) / n" value={rolls ? estimate.toFixed(3) : '—'} color={OBSERVED} />
            <Stat label="P(E)" value={TRUE_PROBABILITY.toFixed(3)} hint="2 / 6" color={THEORY} />
        </Stats>
        <div className="interactive-canvas mt-4">
            <svg viewBox="0 0 320 120" role="img" aria-label={`Estimate of P(E) after ${rolls} rolls`}>
                <line x1="30" x2="310" y1={100 - TRUE_PROBABILITY * 90} y2={100 - TRUE_PROBABILITY * 90} stroke={THEORY} strokeDasharray="4 3" />
                <line x1="30" x2="30" y1="10" y2="100" stroke="#555" /><line x1="30" x2="310" y1="100" y2="100" stroke="#555" />
                <text x="4" y="14" fill="#8a8a8a" fontSize="9">1</text><text x="4" y="103" fill="#8a8a8a" fontSize="9">0</text>
                {points.length > 1 && <polyline fill="none" stroke={OBSERVED} strokeWidth="1.5" points={points.map((y, i) => `${30 + (i / (points.length - 1)) * 280},${100 - y * 90}`).join(' ')} />}
            </svg>
        </div>
    </InteractiveFigure>;
}
