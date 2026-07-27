import type { SupabaseClient } from '@supabase/supabase-js';

// The TUBELEX-reordered words quiz reuses the words' section_N / step_M
// addressing, but `core_tubelex_ranked` has no meaningful section/step columns
// for this deck — only a sparse `tubelex_rank` (1 = most frequent). So a
// section/step maps to a *rank window* over the TUBELEX ordering:
//
//   section_N covers ranks (N-1)*1000 + 1 .. N*1000   (1000 words / section)
//   step_M within covers       +(M-1)*100 + 1 .. +M*100 (100 words / step)
//
// We resolve a window to its ordered word ids with a deterministic
// `ORDER BY tubelex_rank, id` + range() (LIMIT/OFFSET), so the same
// section/step always yields the same words in the same order. This mirrors
// kanji-freq-window.ts byte-for-byte, swapping kanji.frequency for
// core_tubelex_ranked.tubelex_rank.

const SECTION_SIZE = 1000;
const STEP_SIZE = 100;

function sectionNumber(section: string): number {
    const n = parseInt(section.split('_').pop() || '1', 10);
    return Number.isNaN(n) || n < 1 ? 1 : n;
}

function stepNumber(step: string): number {
    const n = parseInt(step.split('_').pop() || '1', 10);
    return Number.isNaN(n) || n < 1 ? 1 : n;
}

/** Byte-range [offset, limit] for a section (whole section) or a single step. */
export function tubelexWindow(section: string, step?: string): { offset: number; limit: number } {
    const n = sectionNumber(section);
    if (step) {
        const m = stepNumber(step);
        return { offset: (n - 1) * SECTION_SIZE + (m - 1) * STEP_SIZE, limit: STEP_SIZE };
    }
    return { offset: (n - 1) * SECTION_SIZE, limit: SECTION_SIZE };
}

/**
 * Ordered word ids for a section (when `step` omitted) or a single step,
 * following the global TUBELEX ranking.
 */
export async function wordIdsForTubelexWindow(
    supabase: SupabaseClient,
    section: string,
    step?: string,
): Promise<number[]> {
    const { offset, limit } = tubelexWindow(section, step);
    const { data, error } = await supabase
        .from('core_tubelex_ranked')
        .select('id')
        .not('tubelex_rank', 'is', null)
        .order('tubelex_rank', { ascending: true })
        .order('id', { ascending: true })
        .range(offset, offset + limit - 1);
    if (error) throw error;
    return (data || []).map((w: { id: number }) => w.id);
}
