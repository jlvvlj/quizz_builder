// Quiz feedback sounds.
//
// "correct"   → a recorded mp3 (public/sounds/correct.mp3), preloaded once
//               and cached as an AudioBuffer so playback is instant.
// "incorrect" → a short synthesized two-tone descent (kept synth so it stays
//               consistent and zero-asset).

import { getAudioContext, playAudio, preloadAudio, resumeAudioContext } from './audioCache';

const CORRECT_SOUND_URL = '/sounds/correct.mp3';
const QUIZ_START_SOUND_URL = '/sounds/quiz-start.mp3';
const QUIZ_COMPLETE_SOUND_URL = '/sounds/quiz-complete.mp3';

// Selectable per-keystroke sounds for the typing quiz. These are the click
// sound packs from monkeytype (github.com/monkeytypegame/monkeytype, GPL-3.0):
// each pack has several recorded variants and a random one plays per keystroke,
// so rapid typing doesn't sound mechanical-repetitive. `id` matches the folder
// under /public/sounds/keys/<id>/<n>.wav. The default is listed first so it
// sits on top of the settings dropdown.
export interface KeyboardSound { id: string; label: string; variants: number }
export const KEYBOARD_SOUNDS: KeyboardSound[] = [
    { id: '20', label: 'Cherry MX Blue (ABS)', variants: 10 },
    { id: '21', label: 'Cherry MX Blue (PBT)', variants: 10 },
    { id: '18', label: 'Cherry MX Black (ABS)', variants: 10 },
    { id: '19', label: 'Cherry MX Black (PBT)', variants: 10 },
    { id: '22', label: 'Cherry MX Brown (PBT)', variants: 10 },
    { id: '17', label: 'Akko Lavenders', variants: 10 },
    { id: '23', label: 'Kailh Box White', variants: 10 },
    { id: '24', label: 'Razer Green', variants: 10 },
    { id: '25', label: 'Tealios V2', variants: 10 },
    { id: '26', label: 'Trust GXT', variants: 10 },
    { id: '4', label: 'NK Creams', variants: 6 },
    { id: '5', label: 'Typewriter', variants: 6 },
    { id: '1', label: 'Click', variants: 3 },
    { id: '2', label: 'Beep', variants: 3 },
    { id: '3', label: 'Pop', variants: 3 },
    { id: '6', label: 'Osu', variants: 3 },
    { id: '7', label: 'Hitmarker', variants: 3 },
    { id: '14', label: 'Fist fight', variants: 8 },
    { id: '15', label: 'Rubber keys', variants: 5 },
    { id: '16', label: 'Fart', variants: 8 },
];
export const DEFAULT_KEYBOARD_SOUND = KEYBOARD_SOUNDS[0].id;

const keyVariantUrl = (id: string, n: number) => `/sounds/keys/${id}/${n}.wav`;
function variantsFor(id: string): number {
    return KEYBOARD_SOUNDS.find(s => s.id === id)?.variants ?? 0;
}

// Preload one pack's variants (called when a typing session starts, or when the
// sound is previewed/changed) so the first keystroke is instant. We don't warm
// every pack on import — that would fetch the whole ~5 MB sound library.
export function preloadKeyboardSound(id: string): void {
    const v = variantsFor(id);
    for (let n = 1; n <= v; n++) preloadAudio(keyVariantUrl(id, n));
}

// Play a single keystroke sound: a random variant from the chosen pack.
export function playKeyClick(id: string = DEFAULT_KEYBOARD_SOUND): void {
    const v = variantsFor(id);
    if (v <= 0) return;
    const n = 1 + Math.floor(Math.random() * v);
    resumeAudioContext();
    playAudio(keyVariantUrl(id, n), { volume: 1, trimSilence: true });
}

if (typeof window !== 'undefined') {
    // Warm the cache as soon as the module is imported on the client so the
    // first correct answer / quiz start / quiz finish doesn't pay a
    // fetch+decode penalty.
    preloadAudio(CORRECT_SOUND_URL);
    preloadAudio(QUIZ_START_SOUND_URL);
    preloadAudio(QUIZ_COMPLETE_SOUND_URL);
}

let lastQuizStartAt = 0;

class AudioPlayer {
    private static instance: AudioPlayer;

    private constructor() {
        // The shared AudioContext (from audioCache) will be resumed lazily on
        // the first user interaction.
    }

    public static getInstance(): AudioPlayer {
        if (!AudioPlayer.instance) {
            AudioPlayer.instance = new AudioPlayer();
        }
        return AudioPlayer.instance;
    }

    private playIncorrect(): void {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') void ctx.resume();
        const t0 = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t0);
        osc.frequency.setValueAtTime(415.3, t0 + 0.1);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, t0);
        gain.gain.exponentialRampToValueAtTime(0.01, t0 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.3);
    }

    public play(sound: 'correct' | 'incorrect' | 'quizStart' | 'quizComplete', _variant?: number): void {
        if (sound === 'incorrect') {
            this.playIncorrect();
            return;
        }
        if (sound === 'quizStart') {
            // Dedupe: this sound can be triggered from the click on the
            // pre-quiz page AND again from the quiz page mount. We only
            // want it to play once per "start" — 5s window covers the
            // navigation/loading gap.
            const now = Date.now();
            if (now - lastQuizStartAt < 5000) return;
            lastQuizStartAt = now;
            // Cap to ~3.5s with a clean linear fade-out so the music
            // doesn't drone on into the first card.
            playAudio(QUIZ_START_SOUND_URL, { fadeOutMs: 3500 });
            return;
        }
        if (sound === 'quizComplete') {
            playAudio(QUIZ_COMPLETE_SOUND_URL);
            return;
        }
        // Slightly hotter than unity gain so it cuts through reliably,
        // and trimSilence skips any quiet padding at the start of the
        // mp3 so the "ding" is perceptually instant.
        playAudio(CORRECT_SOUND_URL, { volume: 1.3, trimSilence: true });
    }
}

// Kept for API compatibility with existing callers; the chosen mp3 is the
// only correct sound now, so this is a no-op selector that always returns 1.
export function correctVariantForCardIndex(_index: number): number {
    return 1;
}

export const audioPlayer = AudioPlayer.getInstance();

// Awaitable variant of the correct chime — returns the playAudio handle
// so callers can chain follow-up behaviour on the chime's onended if
// they want to. Defaults to the same volume + silence trim as
// audioPlayer.play, but the volume can be boosted (e.g. the typing quiz
// plays a louder chime when a word is fully typed).
export function playCorrectChime(volume: number = 1.3): ReturnType<typeof playAudio> {
    return playAudio(CORRECT_SOUND_URL, { volume, trimSilence: true });
}

// Trigger the quiz-start sound at the moment the user clicks Start —
// playing during the loading gap was the whole point of having this
// sound. Resumes the AudioContext first (required: must run from a
// user gesture).
export function playQuizStartSound(): void {
    resumeAudioContext();
    audioPlayer.play('quizStart');
}
