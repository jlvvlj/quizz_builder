import InteractiveFigure, { Legend, OBSERVED, THEORY } from '../InteractiveFigure';

// Share of users who watched each movie, and the share among those who watched Amélie.
const MOVIES = [
    { title: 'Life is Beautiful', watched: 0.02, givenAmelie: 0.09 },
    { title: '3 Idiots', watched: 0.01, givenAmelie: 0.03 },
    { title: 'Zootopia', watched: 0.05, givenAmelie: 0.05 },
    { title: 'Star Wars', watched: 0.09, givenAmelie: 0.02 },
    { title: 'Amélie', watched: 0.03, givenAmelie: 1 },
];

/** P(E) for several movies E, and, once conditioned, P(E | F) where F is "watched Amélie". */
export default function MovieProbabilities({ conditioned = false }: { conditioned?: boolean }) {
    const scale = conditioned ? 1 : 0.1;
    return <InteractiveFigure
        title={conditioned ? 'Watching a movie, given they watched Amélie' : 'Watching a movie'}
        lede={conditioned
            ? 'Each bar is P(E | F): the fraction of the people who watched Amélie (F) who also watched the movie E. The faint bar is P(E) from before.'
            : 'Each bar is P(E): the number of people who watched the movie E divided by the number of people on the service.'}
        note={conditioned ? 'Given F, Amélie itself is certain: P(F | F) = 1. The others move up, down, or not at all, because knowing F is new information about the person.' : undefined}>
        {conditioned && <Legend items={[{ color: OBSERVED, label: 'P(E | F)' }, { color: THEORY, label: 'P(E)' }]} />}
        <div className="space-y-3" role="list">
            {MOVIES.map(movie => {
                const value = conditioned ? movie.givenAmelie : movie.watched;
                return <div key={movie.title} role="listitem" className="grid grid-cols-[8.5rem_1fr_4.5rem] items-center gap-3 text-sm sm:text-base">
                    <span className="text-[#E5E5E5]">{movie.title}</span>
                    <span className="relative h-5 rounded bg-[#232323]" aria-hidden>
                        {conditioned && <span className="absolute inset-y-0 left-0 rounded" style={{ width: `${(movie.watched / scale) * 100}%`, background: THEORY, opacity: 0.35 }} />}
                        <span className="absolute inset-y-1 left-0 rounded" style={{ width: `${Math.min(1, value / scale) * 100}%`, background: conditioned ? OBSERVED : THEORY }} />
                    </span>
                    <span className="text-right font-mono">{value.toFixed(2)}</span>
                </div>;
            })}
        </div>
        {!conditioned && <p className="interactive-hint">Bars are drawn on a 0 to 0.10 scale: every one of these probabilities is small.</p>}
    </InteractiveFigure>;
}
