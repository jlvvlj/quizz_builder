import { ReactNode } from 'react';
import { FlaskConical } from 'lucide-react';

/** Shared chrome so every interactive figure reads as the same kind of object in a lesson. */
export default function InteractiveFigure({title, lede, note, children}: {title: string; lede: string; note?: ReactNode; children: ReactNode}) {
    return <section className="interactive-figure" aria-label={`Interactive: ${title}`}>
        <header>
            <p className="interactive-badge"><FlaskConical className="h-3 w-3" aria-hidden />Interactive</p>
            <h3>{title}</h3>
            <p className="interactive-lede">{lede}</p>
        </header>
        {children}
        {note && <p className="interactive-note">{note}</p>}
    </section>;
}

export function ActionButton({onClick, children, variant, disabled}: {onClick: () => void; children: ReactNode; variant?: 'primary'; disabled?: boolean}) {
    return <button type="button" className="interactive-button" data-variant={variant} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function Stat({label, value, hint, color}: {label: string; value: string; hint?: string; color?: string}) {
    return <div className="interactive-stat" style={color ? {['--stat-color' as string]: color} : undefined}>
        <dt>{label}</dt>
        <dd>{value}{hint && <small>{hint}</small>}</dd>
    </div>;
}

export function Stats({children}: {children: ReactNode}) {
    return <dl className="interactive-stats">{children}</dl>;
}

export function Slider({label, value, min, max, step = 1, format, onChange}: {label: string; value: number; min: number; max: number; step?: number; format?: (value: number) => string; onChange: (value: number) => void}) {
    return <label className="interactive-slider">{label}
        <input type="range" value={value} min={min} max={max} step={step} onChange={event => onChange(Number(event.target.value))} />
        <b>{format ? format(value) : value}</b>
    </label>;
}

export function Legend({items}: {items: {color: string; label: string}[]}) {
    return <p className="interactive-legend">{items.map(item => <span key={item.label} style={{color: item.color}}><i />
        <span style={{color: '#b8b8b8'}}>{item.label}</span></span>)}</p>;
}

export const OBSERVED = '#ff4b86';
export const THEORY = '#7bd9e7';
export const ACCENT_C = '#f5c542';

export function formatProbability(value: number): string {
    return Number.isFinite(value) ? value.toFixed(3) : '—';
}
