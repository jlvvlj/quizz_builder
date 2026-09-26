/**
 * A small seeded generator. Figures start from a fixed seed so the server and the browser draw the
 * same first frame; a click moves the seed on.
 */
export function seeded(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function shuffle<T>(items: T[], random: () => number): T[] {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/** Every way to choose k of n positions, in lexicographic order of the chosen positions. */
export function combinations(n: number, k: number): number[][] {
    const out: number[][] = [];
    const pick = (start: number, chosen: number[]) => {
        if (chosen.length === k) { out.push(chosen); return; }
        for (let i = start; i <= n - (k - chosen.length); i++) pick(i + 1, [...chosen, i]);
    };
    pick(0, []);
    return out;
}
