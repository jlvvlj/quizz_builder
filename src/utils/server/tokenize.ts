// Japanese morphological tokenizer (kuromoji). Splits raw transcript
// text into dictionary-form content words. The reconciliation resolver
// does the rest of the filtering (kanji / phrase / counter / name).
import path from 'path';

// kuromoji has no bundled types worth importing; treat as any.
const kuromoji = require('kuromoji');

// NOTE: do not use require.resolve here — webpack rewrites it to a
// virtual "(api)/..." path. Resolve from the real cwd (project root in
// dev and on the serverless function thanks to outputFileTracingIncludes).
const DIC_DIR = path.join(process.cwd(), 'node_modules', 'kuromoji', 'dict');

let tokenizerPromise: Promise<any> | null = null;
function getTokenizer(): Promise<any> {
    if (!tokenizerPromise) {
        tokenizerPromise = new Promise((resolve, reject) => {
            kuromoji.builder({ dicPath: DIC_DIR }).build((err: any, tk: any) =>
                err ? reject(err) : resolve(tk));
        });
    }
    return tokenizerPromise;
}

const kataToHira = (s: string) =>
    s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

const CONTENT_POS = new Set(['名詞', '動詞', '形容詞']);

export interface Token { surface: string; reading: string; }

// Returns distinct dictionary-form content tokens (+ best-effort reading)
// and the total raw token count (for stats).
export async function tokenizeJapanese(
    text: string
): Promise<{ tokens: Token[]; rawCount: number }> {
    const tk = await getTokenizer();
    const raw = tk.tokenize(text);
    const map = new Map<string, string>(); // surface -> reading
    for (const t of raw) {
        if (!CONTENT_POS.has(t.pos)) continue;
        if (t.pos_detail_1 === '非自立' || t.pos_detail_1 === '接尾') continue;
        const surface = t.basic_form && t.basic_form !== '*' ? t.basic_form : t.surface_form;
        if (!surface) continue;
        if (!map.has(surface)) {
            const r = t.reading && t.reading !== '*' ? kataToHira(t.reading) : '';
            map.set(surface, r);
        }
    }
    return {
        tokens: [...map.entries()].map(([surface, reading]) => ({ surface, reading })),
        rawCount: raw.length,
    };
}
