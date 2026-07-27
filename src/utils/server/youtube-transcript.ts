// Best-effort Japanese transcript fetch.
//
// IMPORTANT: YouTube now gates caption *content* (the timedtext
// endpoint) behind a proof-of-origin token / real browser context.
// A plain server / serverless function CANNOT reliably download caption
// text — requests return HTTP 200 with an empty body. We still detect
// whether a Japanese track exists (from the watch-page player response,
// with the EU-consent interstitial bypassed) so the error message can
// be truthful: distinguish "no JA captions" from "JA captions exist but
// YouTube blocked the automated download — paste the transcript".
// No fallback, no auto-translation.

const UA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export function parseVideoId(url: string): string | null {
    const m = url.match(/(?:v=|\/shorts\/|youtu\.be\/|\/embed\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(url.trim()) ? url.trim() : null);
}

interface CaptionTrack { baseUrl: string; languageCode: string; kind?: string; }

// Thrown when a JA track exists but YouTube blocks the content download.
export class TranscriptBlockedError extends Error {}

// Best-effort title fetch (the watch page works without captions).
async function fetchTitle(videoId: string): Promise<string> {
    try {
        const r = await fetch(
            `https://www.youtube.com/watch?v=${videoId}&bpctr=9999999999`,
            { headers: { 'User-Agent': UA, Cookie: 'CONSENT=YES+1; SOCS=CAI' } }
        );
        if (!r.ok) return `YouTube ${videoId}`;
        const html = await r.text();
        const m = html.match(/<title>([^<]+)<\/title>/);
        if (!m) return `YouTube ${videoId}`;
        return m[1].replace(/ - YouTube\s*$/, '').trim() || `YouTube ${videoId}`;
    } catch { return `YouTube ${videoId}`; }
}

// Supadata YouTube transcript path — reliable third-party that handles
// POT tokens + residential IPs for us. mode=native means strict YouTube
// captions (no auto-translation / no auto-generated text masquerading).
async function fetchViaSupadata(
    videoId: string, key: string
): Promise<{ title: string; text: string }> {
    const u = `https://api.supadata.ai/v1/transcript`
        + `?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}`
        + `&lang=ja&text=true&mode=native`;
    const r = await fetch(u, { headers: { 'x-api-key': key } });
    if (r.status === 202) {
        throw new TranscriptBlockedError(
            'Supadata is processing this video asynchronously (typically long videos). '
            + 'Paste the JA transcript to proceed now.'
        );
    }
    if (!r.ok) {
        const body = await r.text().catch(() => '');
        throw new Error(`Supadata error (${r.status}): ${body.slice(0, 200) || 'unknown'}`);
    }
    const d = await r.json() as { content?: string; lang?: string; availableLangs?: string[] };
    if (d.lang !== 'ja') {
        const avail = (d.availableLangs || []).join(', ');
        throw new Error(
            `This video has no Japanese captions${avail ? ` (available: ${avail})` : ''}. `
            + 'Only videos with a Japanese caption track are supported — paste the JA transcript instead.'
        );
    }
    const text = String(d.content || '').trim();
    if (!text) {
        throw new TranscriptBlockedError('Supadata returned an empty Japanese transcript. Paste it instead.');
    }
    const title = await fetchTitle(videoId);
    return { title, text };
}

export async function fetchJapaneseTranscript(
    videoId: string
): Promise<{ title: string; text: string }> {
    const supaKey = process.env.SUPADATA_API_KEY;
    console.log('[transcript] SUPADATA_API_KEY set?', !!supaKey, 'videoId:', videoId);
    if (supaKey) return fetchViaSupadata(videoId, supaKey);

    // No SUPADATA_API_KEY: don't run the doomed scrape (it would falsely
    // report "no captions" — a silent misdiagnosis). Be explicit instead.
    // Diagnostic: list env var NAMES visible to the function whose names
    // mention SUPA/SUPABASE (no values). Lets the user spot scope/typo issues.
    const visible = Object.keys(process.env)
        .filter(k => /SUP(A|ABASE)/i.test(k))
        .sort().join(', ') || '(none)';
    throw new Error(
        'URL auto-fetch is not configured on this environment '
        + '(SUPADATA_API_KEY missing). '
        + `Visible related env vars on this function: ${visible}. `
        + 'Common fixes: in Vercel → Project → Settings → Environment Variables, '
        + 'make sure SUPADATA_API_KEY is enabled for the PREVIEW scope (not just '
        + 'Production), then trigger a fresh deployment (existing deployments are '
        + 'not always refreshed). Or paste the Japanese transcript instead.'
    );
}
