// Romaji <-> hiragana helpers for the typing quiz.
// Segments a hiragana reading into typing "units" — each unit is 1 or 2 hiragana
// characters that share a single romaji syllable. Each unit carries the list of
// accepted romaji forms (for alternates like shi/si, chi/ti, tsu/tu, fu/hu).

const KATAKANA_TO_HIRAGANA_OFFSET = 0x30A1 - 0x3041;
export function katakanaToHiragana(s: string): string {
    let out = '';
    for (const ch of s) {
        const code = ch.charCodeAt(0);
        if (code >= 0x30A1 && code <= 0x30F6) {
            out += String.fromCharCode(code - KATAKANA_TO_HIRAGANA_OFFSET);
        } else {
            out += ch;
        }
    }
    return out;
}

const BASE: Record<string, string> = {
    あ:'a', い:'i', う:'u', え:'e', お:'o',
    か:'ka', き:'ki', く:'ku', け:'ke', こ:'ko',
    が:'ga', ぎ:'gi', ぐ:'gu', げ:'ge', ご:'go',
    さ:'sa', し:'shi', す:'su', せ:'se', そ:'so',
    ざ:'za', じ:'ji', ず:'zu', ぜ:'ze', ぞ:'zo',
    た:'ta', ち:'chi', つ:'tsu', て:'te', と:'to',
    だ:'da', ぢ:'ji', づ:'zu', で:'de', ど:'do',
    な:'na', に:'ni', ぬ:'nu', ね:'ne', の:'no',
    は:'ha', ひ:'hi', ふ:'fu', へ:'he', ほ:'ho',
    ば:'ba', び:'bi', ぶ:'bu', べ:'be', ぼ:'bo',
    ぱ:'pa', ぴ:'pi', ぷ:'pu', ぺ:'pe', ぽ:'po',
    ま:'ma', み:'mi', む:'mu', め:'me', も:'mo',
    や:'ya', ゆ:'yu', よ:'yo',
    ら:'ra', り:'ri', る:'ru', れ:'re', ろ:'ro',
    わ:'wa', を:'wo', ん:'n',
    ゃ:'ya', ゅ:'yu', ょ:'yo',
};

const ALTERNATES: Record<string, string[]> = {
    し: ['si'], じ: ['zi'], ち: ['ti'], つ: ['tu'], ふ: ['hu'],
    ぢ: ['di'], づ: ['du'],
    // を is the object particle and is pronounced "o", so accept a bare "o" as
    // well as "wo". This only affects the を kana itself (the particle) — every
    // other character keeps its own romaji, so "o" still types お normally.
    を: ['o'],
};

// initial consonant for combo syllables (ki+ya = kya, etc.)
const COMBO_PREFIX: Record<string, string[]> = {
    き: ['ky'], ぎ: ['gy'],
    し: ['sh', 'sy'], じ: ['j', 'jy', 'zy'],
    ち: ['ch', 'ty'], ぢ: ['j', 'dy'],
    に: ['ny'], ひ: ['hy'], び: ['by'], ぴ: ['py'],
    み: ['my'], り: ['ry'],
};

const SMALL_VOWEL: Record<string, string> = { ゃ: 'a', ゅ: 'u', ょ: 'o' };

export interface RomajiUnit {
    hiragana: string;     // 1 or 2 hiragana chars consumed
    romaji: string[];     // accepted romaji (lowercase, ascii)
    startIndex: number;   // index into the source reading
    length: number;       // number of source chars consumed
}

export function segmentReading(input: string): RomajiUnit[] {
    const reading = katakanaToHiragana(input);
    const units: RomajiUnit[] = [];
    let i = 0;

    while (i < reading.length) {
        const ch = reading[i];
        const next = reading[i + 1];

        // sokuon っ — accept the doubled first consonant of the next unit, plus xtu/ltu
        if (ch === 'っ') {
            const accepted = new Set<string>(['xtu', 'ltu']);
            if (next) {
                const peek = peekFirstRomajiChar(reading, i + 1);
                if (peek) accepted.add(peek);
            }
            units.push({ hiragana: 'っ', romaji: [...accepted], startIndex: i, length: 1 });
            i += 1;
            continue;
        }

        // combo syllable: kya/sha/cho/etc.
        if (next && SMALL_VOWEL[next] && COMBO_PREFIX[ch]) {
            const vowel = SMALL_VOWEL[next];
            const forms = COMBO_PREFIX[ch].map(p => p + vowel);
            units.push({ hiragana: ch + next, romaji: forms, startIndex: i, length: 2 });
            i += 2;
            continue;
        }

        // ん — accept 'n' or 'nn'
        if (ch === 'ん') {
            units.push({ hiragana: 'ん', romaji: ['nn', 'n'], startIndex: i, length: 1 });
            i += 1;
            continue;
        }

        // long-vowel mark (chōonpu, ー) — accept the literal mark or a hyphen,
        // matching how Japanese IMEs map the '-' key.
        if (ch === 'ー') {
            units.push({ hiragana: 'ー', romaji: ['ー', '-'], startIndex: i, length: 1 });
            i += 1;
            continue;
        }

        const base = BASE[ch];
        if (base) {
            const forms = [base, ...(ALTERNATES[ch] || [])];
            units.push({ hiragana: ch, romaji: forms, startIndex: i, length: 1 });
        } else {
            // pass-through: long vowel mark, punctuation, unknown — type the literal char
            units.push({ hiragana: ch, romaji: [ch], startIndex: i, length: 1 });
        }
        i += 1;
    }
    return units;
}

function peekFirstRomajiChar(reading: string, idx: number): string | null {
    const ch = reading[idx];
    const next = reading[idx + 1];
    if (next && SMALL_VOWEL[next] && COMBO_PREFIX[ch]) {
        return COMBO_PREFIX[ch][0][0];
    }
    if (ch === 'ん') return 'n';
    if (ch === 'っ') return null;
    const base = BASE[ch];
    return base ? base[0] : null;
}

export function isRomajiPrefix(unit: RomajiUnit, buffer: string): boolean {
    return unit.romaji.some(r => r.startsWith(buffer));
}

export function matchesRomaji(unit: RomajiUnit, buffer: string): boolean {
    return unit.romaji.includes(buffer);
}

const HIRAGANA_RE = /[぀-ゟ]/;
export function hasHiragana(s: string | undefined | null): boolean {
    return !!s && HIRAGANA_RE.test(s);
}

const KANA_ONLY_RE = /^[぀-ゟ゠-ヿー]+$/;
export function isKanaOnly(s: string | undefined | null): boolean {
    return !!s && KANA_ONLY_RE.test(s);
}
