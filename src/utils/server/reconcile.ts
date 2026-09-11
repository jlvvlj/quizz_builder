// Server-side reconciliation resolver. Mirrors scripts/reconcile/lib.js
// but queries the jmdict_* / words10k Postgres tables (deployable) instead
// of local JSON. Given Japanese surface forms, classifies each as an
// existing words10k id, a genuinely-new word, or dropped junk.
import type { SupabaseClient } from '@supabase/supabase-js';

export const hasKanji = (s: string) => /[一-龯㐀-䶿]/.test(s);
const stripHonorific = (s: string) => {
    const m = s.match(/^[おご](.+)/);
    return m && hasKanji(m[1]) ? m[1] : null;
};
const KNUM = '一二三四五六七八九十百千万';
const CTR = '人度回つ本匹個歳才名番枚冊台階円時分秒日月年割杯羽頭軒件歩周位号丁目';
const isNumeric = (s: string) =>
    /[0-9０-９]/.test(s) ||
    new RegExp(`^[${KNUM}]+[${CTR}]?$`).test(s) ||
    new RegExp(`^(何|幾|もう|あと)?[${KNUM}]+[${CTR}](とも|目)?$`).test(s);
const looksPhrase = (s: string) => s.length >= 4 && /[をがにへともは|]/.test(s.slice(1, -1));

const chunk = <T,>(a: T[], n: number) => {
    const out: T[][] = [];
    for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n));
    return out;
};

export type Resolution =
    | { kind: 'word'; id: number }
    | { kind: 'absent'; reading: string; gloss: string }
    | { kind: 'dropped'; why: string };

interface Cluster {
    cluster_id: number; forms: string[];
    is_exp: boolean; is_ctr: boolean; reading: string; gloss: string;
}

export async function resolveSurfaces(
    sb: SupabaseClient,
    surfaces: string[]
): Promise<Map<string, Resolution>> {
    const distinct = [...new Set(surfaces)];
    // candidate keys we may need to look up (incl. honorific-stripped bases)
    const keys = new Set<string>();
    for (const s of distinct) {
        keys.add(s);
        const b = stripHonorific(s);
        if (b) keys.add(b);
    }
    const keyList = [...keys];

    // 1) direct words10k surface -> min id
    const surfToId = new Map<string, number>();
    for (const part of chunk(keyList, 300)) {
        const { data, error } = await sb.from('words10k')
            .select('id,japanese_word').in('japanese_word', part);
        if (error) throw error;
        for (const r of data || []) {
            const cur = surfToId.get(r.japanese_word);
            if (cur == null || r.id < cur) surfToId.set(r.japanese_word, r.id);
        }
    }

    // 2) jmdict clusters for the keys
    const formToClusterIds = new Map<string, number[]>();
    const clusterIds = new Set<number>();
    for (const part of chunk(keyList, 300)) {
        const { data, error } = await sb.from('jmdict_form')
            .select('form,cluster_id').in('form', part);
        if (error) throw error;
        for (const r of data || []) {
            let a = formToClusterIds.get(r.form);
            if (!a) formToClusterIds.set(r.form, (a = []));
            a.push(r.cluster_id);
            clusterIds.add(r.cluster_id);
        }
    }
    const clusterById = new Map<number, Cluster>();
    for (const part of chunk([...clusterIds], 300)) {
        const { data, error } = await sb.from('jmdict_cluster')
            .select('cluster_id,forms,is_exp,is_ctr,reading,gloss').in('cluster_id', part);
        if (error) throw error;
        for (const c of data || []) clusterById.set(c.cluster_id, c as Cluster);
    }

    // 3) words10k ids for every sibling form across those clusters
    const siblingForms = new Set<string>();
    for (const c of clusterById.values()) for (const f of c.forms) siblingForms.add(f);
    const missing = [...siblingForms].filter(f => !surfToId.has(f));
    for (const part of chunk(missing, 300)) {
        const { data, error } = await sb.from('words10k')
            .select('id,japanese_word').in('japanese_word', part);
        if (error) throw error;
        for (const r of data || []) {
            const cur = surfToId.get(r.japanese_word);
            if (cur == null || r.id < cur) surfToId.set(r.japanese_word, r.id);
        }
    }

    // 4) JMnedict names among the surfaces
    const nameSet = new Set<string>();
    for (const part of chunk(keyList, 300)) {
        const { data, error } = await sb.from('jmnedict_name')
            .select('surface').in('surface', part);
        if (error) throw error;
        for (const r of data || []) nameSet.add(r.surface);
    }

    const clustersOf = (s: string): Cluster[] =>
        (formToClusterIds.get(s) || []).map(id => clusterById.get(id)).filter(Boolean) as Cluster[];
    const resolveExisting = (s: string): number | null => {
        if (surfToId.has(s)) return surfToId.get(s)!;
        for (const c of clustersOf(s)) for (const f of c.forms) if (surfToId.has(f)) return surfToId.get(f)!;
        const b = stripHonorific(s);
        if (b) {
            if (surfToId.has(b)) return surfToId.get(b)!;
            for (const c of clustersOf(b)) for (const f of c.forms) if (surfToId.has(f)) return surfToId.get(f)!;
        }
        return null;
    };

    const out = new Map<string, Resolution>();
    for (const s of distinct) {
        if (!hasKanji(s)) { out.set(s, { kind: 'dropped', why: 'non-kanji' }); continue; }
        const ex = resolveExisting(s);
        if (ex != null) { out.set(s, { kind: 'word', id: ex }); continue; }
        if (isNumeric(s)) { out.set(s, { kind: 'dropped', why: 'numeric' }); continue; }
        const cs = clustersOf(s);
        if (cs.length && cs.some(c => c.is_exp || c.is_ctr)) { out.set(s, { kind: 'dropped', why: 'phrase/counter' }); continue; }
        if (cs.length === 0 && looksPhrase(s)) { out.set(s, { kind: 'dropped', why: 'phrase' }); continue; }
        if (nameSet.has(s) && cs.length === 0) { out.set(s, { kind: 'dropped', why: 'name' }); continue; }
        // absent: attach JMdict reading/gloss if the word is in a cluster
        const c0 = cs.find(c => c.forms.includes(s)) || cs[0];
        out.set(s, { kind: 'absent', reading: c0?.reading || '', gloss: c0?.gloss || '' });
    }
    return out;
}
