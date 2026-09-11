import React from 'react';

// 漢字[よみ]: group 1 = the kanji run, group 2 = its reading.
const FURIGANA_RE = /([^\[\]\s]+)\[([^\]]+)\]/g;

// Hiragana + katakana ranges (incl. small kana and the long-vowel mark ー).
const KANA_RE = /[ぁ-ゟ゠-ヿー]/;
const HIRAGANA_RE = /[ぁ-ゟ]/;
const isKana = (ch: string) => KANA_RE.test(ch);
const isHiragana = (ch: string) => HIRAGANA_RE.test(ch);

/**
 * A flat model of a furigana-annotated sentence. Each segment is either a
 * `ruby` (a kanji run + its reading) or plain `text`. The concatenation of the
 * segments' base text (kanji for ruby, the raw chars for text) is the "surface"
 * — the sentence as it actually reads, with no bracketed annotations. We match
 * the highlight target against the surface, then map the matched character
 * range back onto the segments for rendering.
 */
type Segment =
    | { kind: 'ruby'; kanji: string; reading: string }
    | { kind: 'text'; text: string };

function parseSegments(text: string): Segment[] {
    const segments: Segment[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    FURIGANA_RE.lastIndex = 0;

    while ((match = FURIGANA_RE.exec(text)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ kind: 'text', text: text.slice(lastIndex, match.index) });
        }
        segments.push({ kind: 'ruby', kanji: match[1], reading: match[2] });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
        segments.push({ kind: 'text', text: text.slice(lastIndex) });
    }
    return segments;
}

const segmentBase = (seg: Segment) => (seg.kind === 'ruby' ? seg.kanji : seg.text);

// The invariant part of a word for matching: the dictionary form with its
// trailing kana (okurigana) stripped, so conjugations still anchor on it.
//   食べる → 食   望む → 望   丸い → 丸   大きい → 大   結婚 → 結婚   ある → ''
function kanjiStem(word: string): string {
    let end = word.length;
    while (end > 0 && isKana(word[end - 1])) end--;
    return word.slice(0, end);
}

/**
 * Find the [start, end) character range within the surface string to highlight
 * for `word`. Returns null when the word cannot be located.
 *
 * Strategy, in order:
 *   1. Exact surface match — covers nouns / dictionary forms that appear
 *      verbatim, even when they straddle a ruby + okurigana boundary
 *      (e.g. 単純, 結婚, or a non-conjugated 食べる).
 *   2. Kanji-stem anchored at a ruby boundary — find the ruby whose kanji run
 *      equals the word's stem, then extend forward over the following hiragana
 *      (the okurigana / inflection). This is what catches conjugated verbs and
 *      i-adjectives: 食[た]べました → 食べました, 望[のぞ]んでいます → 望んでいます,
 *      丸[まる]い → 丸い. Anchoring on a *ruby* (not a bare substring) avoids
 *      false hits like the 生 inside 一生懸命 when matching 生きる.
 *   3. Kanji-stem as a bare surface substring + the same hiragana extension —
 *      a last resort for text that carries no furigana annotation.
 */
function findHighlightRange(
    segments: Segment[],
    surface: string,
    word: string
): { start: number; end: number } | null {
    if (!word) return null;

    // The pedagogical spaces between words in these annotated sentences are not
    // real characters (plainSentence strips them all), so matching must ignore
    // whitespace. Build a space-free "compact" view of the surface plus a map
    // from each compact index back to its surface index, so a word written as
    // two space-separated rubies (上[うえ] 下[した] for 上下) still matches and the
    // range maps back across the space.
    const compactToSurface: number[] = [];
    let compact = '';
    for (let i = 0; i < surface.length; i++) {
        if (!/\s/.test(surface[i])) {
            compact += surface[i];
            compactToSurface.push(i);
        }
    }
    const compactRange = (ci: number, len: number) => ({
        start: compactToSurface[ci],
        end: compactToSurface[ci + len - 1] + 1,
    });

    // 1. Exact occurrence of the whole word (whitespace-insensitive).
    const exact = compact.indexOf(word);
    if (exact !== -1) return compactRange(exact, word.length);

    const stem = kanjiStem(word);
    // A purely-kana word with no exact match can't be anchored reliably; bail
    // rather than risk highlighting an unrelated kana run.
    if (!stem || stem === word) return null;

    // Sentence-final particles that trail a verb/adjective but are NOT part of
    // its conjugation (治りました**か** → highlight 治りました, not the か).
    const SENTENCE_FINAL = new Set(['か', 'ね', 'よ', 'わ', 'ぞ', 'ぜ']);
    const CLAUSE_PUNCT = /[\s。、，,.！？!?]/;
    // A position counts as a clause end if it's the string end, punctuation, or
    // another trailing particle — so chained particles (…ますかね。) all trim.
    const isClauseEnd = (i: number) =>
        i >= surface.length || CLAUSE_PUNCT.test(surface[i]) || SENTENCE_FINAL.has(surface[i]);

    // Extend a match end over the trailing hiragana that follows the stem
    // (okurigana + auxiliaries), stopping at the first non-hiragana char
    // (next kanji, katakana, space, punctuation, …), then peel back any
    // sentence-final particle sitting at the clause boundary.
    const extendOverOkurigana = (from: number): number => {
        let end = from;
        while (end < surface.length && isHiragana(surface[end])) end++;
        while (end > from && SENTENCE_FINAL.has(surface[end - 1]) && isClauseEnd(end)) end--;
        return end;
    };

    // 2. Anchor the stem on a ruby boundary.
    let cursor = 0;
    for (const seg of segments) {
        const base = segmentBase(seg);
        if (seg.kind === 'ruby' && seg.kanji === stem) {
            const start = cursor;
            return { start, end: extendOverOkurigana(start + stem.length) };
        }
        cursor += base.length;
    }

    // 3. Bare substring of the stem (un-annotated text).
    const stemIdx = compact.indexOf(stem);
    if (stemIdx !== -1) {
        const { start, end } = compactRange(stemIdx, stem.length);
        return { start, end: extendOverOkurigana(end) };
    }

    return null;
}

interface FuriganaTextProps {
    text: string;
    highlightWord?: string;
    className?: string;
}

function Ruby({ kanji, reading }: { kanji: string; reading: string }) {
    return (
        <ruby className="ruby-text">
            {kanji}
            <rp>(</rp>
            <rt>{reading}</rt>
            <rp>)</rp>
        </ruby>
    );
}

/**
 * Renders a Japanese sentence with furigana readings above the kanji. When
 * `highlightWord` is given, the occurrence of that word — including its
 * conjugated/okurigana tail — is wrapped in `.word-highlight`.
 */
export function FuriganaText({
    text,
    highlightWord,
    className = ''
}: FuriganaTextProps) {
    const segments = parseSegments(text);
    const rootClass = `example-sentence ${className}`.trim();

    const surface = segments.map(segmentBase).join('');
    const range = highlightWord
        ? findHighlightRange(segments, surface, highlightWord)
        : null;

    const nodes: React.ReactNode[] = [];
    let cursor = 0; // running offset into `surface`

    segments.forEach((seg, i) => {
        const base = segmentBase(seg);
        const segStart = cursor;
        const segEnd = cursor + base.length;
        cursor = segEnd;

        const overlaps =
            range !== null && range.start < segEnd && range.end > segStart;

        if (seg.kind === 'ruby') {
            // A ruby is atomic: highlight the whole thing if the range touches it.
            const ruby = <Ruby key={`ruby-${i}`} kanji={seg.kanji} reading={seg.reading} />;
            nodes.push(
                overlaps ? (
                    <span key={`hl-${i}`} className="word-highlight">{ruby}</span>
                ) : (
                    ruby
                )
            );
            return;
        }

        // Plain text: split it at the highlight boundaries so only the
        // overlapping slice (e.g. the okurigana) gets the highlight class.
        if (!overlaps) {
            nodes.push(<span key={`text-${i}`}>{seg.text}</span>);
            return;
        }

        const hlStart = Math.max(range!.start, segStart) - segStart;
        const hlEnd = Math.min(range!.end, segEnd) - segStart;
        const before = seg.text.slice(0, hlStart);
        const mid = seg.text.slice(hlStart, hlEnd);
        const after = seg.text.slice(hlEnd);

        nodes.push(
            <span key={`text-${i}`}>
                {before}
                <span className="word-highlight">{mid}</span>
                {after}
            </span>
        );
    });

    return <span className={rootClass}>{nodes}</span>;
}

/**
 * Parses a Japanese sentence with readings in brackets and returns JSX with
 * ruby elements. Kept for callers that only need the rendered furigana with no
 * highlighting.
 */
export function parseFurigana(text: string): React.ReactNode[] {
    return parseSegments(text).map((seg, i) =>
        seg.kind === 'ruby' ? (
            <Ruby key={`ruby-${i}`} kanji={seg.kanji} reading={seg.reading} />
        ) : (
            <span key={`text-${i}`}>{seg.text}</span>
        )
    );
}
