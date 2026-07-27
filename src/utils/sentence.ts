// Helpers for the sentences typing quiz.
//
// Example sentences ship with inline furigana annotations in the 漢字[よみ]
// format (the same the FuriganaText component parses). For the sentences quiz
// the QUESTION must show the bare sentence with NO readings — the user types
// the pronunciation from memory — so we strip the bracketed readings off.
//
// The typing target itself (full hiragana of the sentence) is precomputed and
// stored in words10k.example_sentence_reading; see
// scripts/generate-sentence-readings.ts. We never re-derive it at runtime.

// 漢字[よみ]: group 1 = the kanji run, group 2 = its reading.
const FURIGANA_RE = /([^\[\]\s]+)\[([^\]]+)\]/g;

// The sentence shown as the question: furigana stripped to bare kanji and the
// annotation spaces removed. 私[わたし]が 行[い]きましょう。→ 私が行きましょう。
export function plainSentence(annotated: string): string {
    return annotated.replace(FURIGANA_RE, (_m, kanji) => kanji).replace(/\s+/g, '');
}
