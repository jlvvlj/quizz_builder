import { useState } from 'react';
import InteractiveFigure from './InteractiveFigure';

const MARBLES = [
    {name: 'red', color: '#ff4b86'},
    {name: 'cyan', color: '#7bd9e7'},
    {name: 'amber', color: '#f5c542'},
    {name: 'green', color: '#79d197'},
    {name: 'violet', color: '#b79cf0'},
];
const SIZES = [1, 2, 3, 4, 5];
const MAX_LISTED = 120;

function permutations(pool: number[], take: number): number[][] {
    if (take === 0) return [[]];
    return pool.flatMap(item => permutations(pool.filter(other => other !== item), take - 1).map(rest => [item, ...rest]));
}
function combinations(pool: number[], take: number): number[][] {
    if (take === 0) return [[]];
    return pool.flatMap((item, index) => combinations(pool.slice(index + 1), take - 1).map(rest => [item, ...rest]));
}
function count(n: number, r: number, ordered: boolean): number {
    if (r > n) return 0;
    let value = 1;
    for (let step = 0; step < r; step++) value *= n - step;
    if (ordered) return value;
    for (let step = 2; step <= r; step++) value /= step;
    return Math.round(value);
}

/** Ordered draws are k-permutations; unordered draws are combinations, smaller by exactly k! */
export default function Counting({defaultOrdered = true}: {defaultOrdered?: boolean}) {
    const [ordered, setOrdered] = useState(defaultOrdered);
    const [cell, setCell] = useState({n: 3, r: 2});
    const pool = Array.from({length: cell.n}, (_, index) => index);
    const listed = (ordered ? permutations(pool, Math.min(cell.r, cell.n)) : combinations(pool, Math.min(cell.r, cell.n)));
    const total = count(cell.n, cell.r, ordered);

    return <InteractiveFigure
        title={ordered ? 'Counting: k-permutations' : 'Counting: combinations'}
        lede="Pick a cell in the table to draw that many marbles from a bag of that many colours, and every possible draw is listed below it. Switch between ordered and unordered draws to see which arrangements collapse into one."
        note={<>Order is the only difference between the two counts, and it is worth exactly <span style={{fontFamily: 'Georgia, serif'}}>k!</span>: each unordered group of k marbles can be arranged in k! orders, so C(n, k) = P(n, k) / k!. With n = {cell.n} and k = {cell.r} that is {count(cell.n, cell.r, true)} ÷ {Array.from({length: cell.r}, (_, index) => index + 1).reduce((product, value) => product * value, 1)} = {count(cell.n, cell.r, false)}.</>}>
        <div className="interactive-tabs" role="group" aria-label="Counting mode">
            <button type="button" className="interactive-tab" aria-pressed={ordered} onClick={() => setOrdered(true)}>Permutations — order matters</button>
            <button type="button" className="interactive-tab" aria-pressed={!ordered} onClick={() => setOrdered(false)}>Combinations — order does not</button>
        </div>
        <div className="interactive-canvas interactive-scroll mt-4">
            <table className="interactive-table">
                <caption className="sr-only">{ordered ? 'Number of k-permutations' : 'Number of combinations'} of n marbles taken k at a time</caption>
                <thead>
                    <tr><th scope="col">{ordered ? 'P(n, k)' : 'C(n, k)'}</th>{SIZES.map(r => <th key={r} scope="col">k = {r}</th>)}</tr>
                </thead>
                <tbody>
                    {SIZES.map(n => <tr key={n}>
                        <th scope="row">n = {n}</th>
                        {SIZES.map(r => {
                            const selected = cell.n === n && cell.r === r;
                            const value = count(n, r, ordered);
                            return <td key={r} aria-selected={selected}>
                                {r <= n
                                    ? <button type="button" onClick={() => setCell({n, r})} aria-label={`${value} ways to draw ${r} of ${n} marbles`}>{value}</button>
                                    : <span style={{color: '#5a5a5a'}}>—</span>}
                            </td>;
                        })}
                    </tr>)}
                </tbody>
            </table>
        </div>
        <div className="interactive-canvas mt-3" aria-live="polite">
            <p style={{margin: '0 0 10px', font: '15px/1.5 system-ui', color: '#e5e5e5'}}>
                Drawing <b>{cell.r}</b> of <b>{cell.n}</b> marbles, {ordered ? 'keeping track of the order' : 'ignoring the order'}: <b style={{color: '#ff4b86'}}>{total}</b> {total === 1 ? 'way' : 'ways'}
            </p>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                {listed.slice(0, MAX_LISTED).map((draw, index) => (
                    <span key={index} style={{display: 'inline-flex', gap: 4, alignItems: 'center', border: '1px solid #3f3f3f', borderRadius: 999, padding: '4px 8px', background: '#222'}}>
                        {draw.length === 0
                            ? <span style={{font: '12px/1 system-ui', color: '#8d8d8d'}}>the empty draw</span>
                            : draw.map((marble, slot) => <i key={slot} aria-label={MARBLES[marble].name} style={{width: 13, height: 13, borderRadius: '50%', background: MARBLES[marble].color, display: 'inline-block'}} />)}
                    </span>
                ))}
            </div>
            {listed.length > MAX_LISTED && <p className="interactive-hint">Showing the first {MAX_LISTED} of {listed.length}.</p>}
        </div>
    </InteractiveFigure>;
}
