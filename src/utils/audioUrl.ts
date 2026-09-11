const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const AUDIO_BUCKET = 'jalingo-audio';
const TTS_BUCKET = 'tts-audio';

export function getAudioUrl(filename: string | null | undefined): string | undefined {
    if (!filename) return undefined;
    const clean = filename.replace('/', '_');
    if (process.env.NODE_ENV === 'production' && SUPABASE_URL) {
        return `${SUPABASE_URL}/storage/v1/object/public/${AUDIO_BUCKET}/${clean}`;
    }
    return `/api/audio/${clean}`;
}

// English (and future Japanese) TTS audio lives in the public tts-audio
// bucket, keyed at e.g. `en/<words10k_id>.mp3`. Preserve slashes — this
// bucket organises by language subfolder, served straight from Supabase
// Storage public URLs.
export function getEnglishAudioUrl(key: string | null | undefined): string | undefined {
    if (!key || !SUPABASE_URL) return undefined;
    return `${SUPABASE_URL}/storage/v1/object/public/${TTS_BUCKET}/${key}`;
}
