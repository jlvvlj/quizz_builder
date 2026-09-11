import type { NextApiRequest } from 'next';
import { createClient } from '@supabase/supabase-js';

// The kanji table carries several rankings:
//   frequency_word_occurrence -> DEFAULT: kanji ordered by how often they occur in
//                          TUBELEX compound words (all-kanji words, length >= 2)
//   frequency_wordorder_composed -> previous default: order of first appearance in
//                          COMPOSED words (>=2 kanji, where onyomi is used)
//   frequency_wordorder -> first appearance in ANY word (incl. single-kanji words)
//   frequency           -> TUBELEX kanji frequency (YouTube subtitles), preserved
//   frequency_jpdb      -> JPDB (anime / manga / visual novels), opt-in via settings
export type FrequencyColumn =
    | 'frequency'
    | 'frequency_jpdb'
    | 'frequency_word_occurrence'
    | 'frequency_wordorder'
    | 'frequency_wordorder_composed';

// Resolve which ranking the requesting user has selected. The choice lives on
// users.kanji_frequency_source ('default' | 'appearance' | 'jpdb'). Anonymous
// requests and any unrecognized value use the default column — that is the
// intended contract, not a fallback that hides a failure. A genuine DB error
// propagates to the caller.
export async function resolveFrequencyColumn(req: NextApiRequest): Promise<FrequencyColumn> {
    const userId = req.cookies.userId;
    if (!userId) return 'frequency_word_occurrence';

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
    const { data, error } = await supabase
        .from('users')
        .select('kanji_frequency_source')
        .eq('id', userId)
        .maybeSingle();

    if (error) throw error;
    if (data?.kanji_frequency_source === 'jpdb') return 'frequency_jpdb';
    if (data?.kanji_frequency_source === 'appearance') return 'frequency_wordorder_composed';
    return 'frequency_word_occurrence';
}

// PostgREST select fragment that always exposes the active rank under the key
// `frequency`, so response shapes stay identical regardless of the chosen source.
export function frequencyAlias(col: FrequencyColumn): string {
    return col === 'frequency' ? 'frequency' : `frequency:${col}`;
}
