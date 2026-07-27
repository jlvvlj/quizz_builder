import { useEffect, useState } from 'react'

export type QuizType = 'typing' | 'multiple_choice'

// Fired on the window whenever the user changes Quiz Mode, so progress views in
// the *same* tab can refetch immediately (the native `storage` event only fires
// in other tabs).
export const QUIZ_MODE_EVENT = 'quizModeChange'

export function readQuizType(): QuizType {
    if (typeof window === 'undefined') return 'multiple_choice'
    return window.localStorage.getItem('quizMode') === 'typing' ? 'typing' : 'multiple_choice'
}

// Persist the chosen mode and notify same-tab listeners.
export function setQuizMode(mode: 'typing' | 'multiple-choice') {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('quizMode', mode)
    window.dispatchEvent(new Event(QUIZ_MODE_EVENT))
}

// Reactive quiz type. The initializer reads the persisted mode synchronously, so
// the very first client render already has the user's real setting — there's no
// default -> real transition, so a consumer's fetch effect runs exactly once on
// load instead of firing a throwaway 'multiple_choice' fetch first (which used to
// race the real one and make displayed progress flip between types on refresh).
//
// This is hydration-safe because quizType is never rendered into the DOM (it only
// drives client-side fetches); the server renders the SSR-safe default and the
// identical 0%-progress markup, so there's no mismatch. The effect only keeps the
// value live when the mode changes later in this tab or another.
export function useQuizType(): QuizType {
    const [quizType, setQuizType] = useState<QuizType>(readQuizType)
    useEffect(() => {
        const sync = () => setQuizType(readQuizType())
        // Re-read once in case the mode changed between the initial render and
        // this effect; setState bails out if the value is unchanged (the common
        // case), so this does not trigger an extra fetch.
        sync()
        window.addEventListener(QUIZ_MODE_EVENT, sync)
        window.addEventListener('storage', sync)
        return () => {
            window.removeEventListener(QUIZ_MODE_EVENT, sync)
            window.removeEventListener('storage', sync)
        }
    }, [])
    return quizType
}
