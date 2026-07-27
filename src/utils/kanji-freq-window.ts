import type { SupabaseClient } from '@supabase/supabase-js';
import type { FrequencyColumn } from '@/utils/kanjiFrequencySource';

// The frequency kanji quiz reuses the words' section_N / step_M addressing, but
// it practices rows from `kanji_quiz_items`: one row per taught kanji reading.
// A section/step maps to a *rank window* over that pronunciation-item subset:
//
//   section_N covers ranks (N-1)*1000 + 1 .. N*1000   (1000 kanji / section)
//   step_M within covers       +(M-1)*100 + 1 .. +M*100 (100 kanji / step)
//
// We resolve a window to its ordered kanji ids with a deterministic
// `ORDER BY frequency, id` + range() (LIMIT/OFFSET), so the same section/step
// always yields the same kanji in the same order.

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
export function kanjiFreqWindow(section: string, step?: string): { offset: number; limit: number } {
    const n = sectionNumber(section);
    if (step) {
        const m = stepNumber(step);
        return { offset: (n - 1) * SECTION_SIZE + (m - 1) * STEP_SIZE, limit: STEP_SIZE };
    }
    return { offset: (n - 1) * SECTION_SIZE, limit: SECTION_SIZE };
}

/**
 * Ordered kanji quiz item ids for a section (when `step` omitted) or a single
 * step, following the selected global frequency ranking.
 */
export async function kanjiIdsForWindow(
    supabase: SupabaseClient,
    section: string,
    step?: string,
    col: FrequencyColumn = 'frequency',
): Promise<number[]> {
    const { offset, limit } = kanjiFreqWindow(section, step);
    const { data, error } = await supabase
        .from('kanji_quiz_items')
        .select('id')
        .not(col, 'is', null)
        .order(col, { ascending: true })
        .order('reading_order', { ascending: true })
        .order('id', { ascending: true })
        .range(offset, offset + limit - 1);
    if (error) throw error;
    return (data || []).map((k: { id: number }) => k.id);
}
