// Shared AudioContext + decoded-buffer cache so card audio plays
// near-synchronously with the visual transition instead of waiting on
// a fresh fetch + decode cycle every time.

let _ctx: AudioContext | null = null;
const buffers = new Map<string, AudioBuffer>();
const inflight = new Map<string, Promise<AudioBuffer>>();

export function getAudioContext(): AudioContext {
    if (typeof window === 'undefined') {
        throw new Error('AudioContext requested on the server');
    }
    if (!_ctx) {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        _ctx = new Ctor();
    }
    return _ctx;
}

export function resumeAudioContext(): void {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            void ctx.resume();
        }
    } catch {
        // Server-side render or no AudioContext available — ignore.
    }
}

export function preloadAudio(url: string | undefined | null): Promise<AudioBuffer> | null {
    if (!url) return null;
    if (buffers.has(url)) return Promise.resolve(buffers.get(url)!);
    if (inflight.has(url)) return inflight.get(url)!;

    const promise = (async () => {
        const ctx = getAudioContext();
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await ctx.decodeAudioData(arrayBuffer);
        buffers.set(url, buffer);
        inflight.delete(url);
        return buffer;
    })();

    inflight.set(url, promise);
    promise.catch(() => inflight.delete(url));
    return promise;
}

export interface PlayHandle {
    source: AudioBufferSourceNode;
    stop: () => void;
}

// Per-buffer cache for the offset (seconds) of the first audible sample,
// so we only scan a given mp3 once for silence trimming.
const silenceOffsets = new WeakMap<AudioBuffer, number>();
function leadingSilenceOffset(buffer: AudioBuffer, threshold = 0.01): number {
    const cached = silenceOffsets.get(buffer);
    if (cached !== undefined) return cached;
    const ch = buffer.getChannelData(0);
    let i = 0;
    for (; i < ch.length; i++) {
        if (Math.abs(ch[i]) >= threshold) break;
    }
    const off = i / buffer.sampleRate;
    silenceOffsets.set(buffer, off);
    return off;
}

function playBuffer(buffer: AudioBuffer, opts?: { volume?: number; fadeOutMs?: number; trimSilence?: boolean }): PlayHandle {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        void ctx.resume();
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const v = opts?.volume;
    const fadeMs = opts?.fadeOutMs;
    const needsGain = (typeof v === 'number' && v !== 1) || (typeof fadeMs === 'number' && fadeMs > 0);
    if (needsGain) {
        const gain = ctx.createGain();
        const initVol = typeof v === 'number' ? Math.max(0, v) : 1;
        gain.gain.value = initVol;
        if (typeof fadeMs === 'number' && fadeMs > 0) {
            // Ramp gain from current → ~0 over fadeMs and cut the source,
            // effectively capping playback to fadeMs with a clean fade-out.
            const fadeSec = fadeMs / 1000;
            const t0 = ctx.currentTime;
            gain.gain.setValueAtTime(initVol, t0);
            // linearRampToValueAtTime to 0 is technically discouraged; use a
            // tiny floor so the ramp completes.
            gain.gain.linearRampToValueAtTime(0.0001, t0 + fadeSec);
            try { source.stop(t0 + fadeSec); } catch { /* ignore */ }
        }
        source.connect(gain);
        gain.connect(ctx.destination);
    } else {
        source.connect(ctx.destination);
    }
    // Skip leading silence in the mp3 so the chime feels truly instant
    // even if the source file has a few hundred ms of quiet padding.
    const startOffset = opts?.trimSilence ? leadingSilenceOffset(buffer) : 0;
    source.start(0, startOffset);
    return {
        source,
        stop: () => {
            try {
                source.stop();
            } catch {
                /* already stopped */
            }
        },
    };
}

// Starts playback immediately if cached, otherwise fetches+decodes then plays.
// Returns a handle synchronously when possible so callers can `stop()` mid-flight.
export function playAudio(url: string | undefined | null, opts?: { volume?: number; fadeOutMs?: number; trimSilence?: boolean }): { handlePromise: Promise<PlayHandle | null>; cancel: () => void } {
    let cancelled = false;
    let activeHandle: PlayHandle | null = null;

    const handlePromise: Promise<PlayHandle | null> = (async () => {
        if (!url) return null;
        const cached = buffers.get(url);
        if (cached) {
            if (cancelled) return null;
            activeHandle = playBuffer(cached, opts);
            return activeHandle;
        }
        try {
            const buffer = await preloadAudio(url)!;
            if (cancelled) return null;
            activeHandle = playBuffer(buffer, opts);
            return activeHandle;
        } catch (err) {
            console.error('Error playing audio:', err);
            return null;
        }
    })();

    return {
        handlePromise,
        cancel: () => {
            cancelled = true;
            if (activeHandle) activeHandle.stop();
        },
    };
}
