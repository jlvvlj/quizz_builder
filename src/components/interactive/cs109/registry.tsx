import { ReactNode } from 'react';

/**
 * The CS109 course's own interactive figures, keyed by the slot id its manuscript places them at
 * (`@interactive <id>`). They are separate from the book course's figures by design.
 */
const FIGURES: Record<string, () => ReactNode> = {
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
