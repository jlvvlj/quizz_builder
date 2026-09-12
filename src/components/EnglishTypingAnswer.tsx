"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { playKeyClick, DEFAULT_KEYBOARD_SOUND } from '@/utils/audio'

interface EnglishTypingAnswerProps {
    target: string
    onComplete: () => void
    disabled?: boolean
    // When true, every slot is filled with the correct answer and input is
    // ignored (the user pressed "show answer"); onComplete is NOT called.
    reveal?: boolean
    resetKey: string | number
    keySound?: string
}

// A character must be typed when it's a letter or digit; spaces and punctuation
// are filled automatically as the cursor reaches them.
function isTypeable(ch: string): boolean {
    return /[\p{L}\p{N}]/u.test(ch)
}

interface Alt {
    chars: string[]         // raw characters, for display (spaces/punctuation incl.)
    letters: string         // lowercase typeable letters, for matching
    letterPosOf: number[]   // for each char index, its letter position (or -1)
}

// Each comma/semicolon-separated translation becomes its own row. Within a row,
// only letters/digits are typed; spaces and punctuation are shown automatically.
function buildAlt(text: string): Alt {
    const chars = Array.from(text)
    const letterPosOf = new Array<number>(chars.length).fill(-1)
    let letters = ''
    chars.forEach((c, i) => {
        if (isTypeable(c)) {
            letterPosOf[i] = letters.length
            letters += c.toLowerCase()
        }
    })
    return { chars, letters, letterPosOf }
}

// Length of the common prefix between an alternative's letters and what's typed.
function matchLen(letters: string, typed: string): number {
    let n = 0
    while (n < typed.length && n < letters.length && letters[n] === typed[n]) n++
    return n
}

export default function EnglishTypingAnswer({
    target,
    onComplete,
    disabled = false,
    reveal = false,
    resetKey,
    keySound = DEFAULT_KEYBOARD_SOUND,
}: EnglishTypingAnswerProps) {
    // Parenthetical hints like "wake (someone) up" aren't typed — strip them
    // (before splitting, in case a comma sits inside the parentheses) so the user
    // just types "wake up". The full answer string is still what validates.
    const alts = useMemo(
        () => target
            .replace(/\([^)]*\)/g, ' ')
            .split(/[,;]/)
            .map(s => s.replace(/\s+/g, ' ').trim())
            .filter(Boolean)
            .map(buildAlt),
        [target],
    )

    // The letters typed so far. Every alternative is rendered against this same
    // string: a row fills its slots up to the prefix it shares with `typed`, so a
    // single keystroke advances every alternative that matches at that position.
    const [typed, setTyped] = useState('')
    const [shakeKey, setShakeKey] = useState(0)
    const [popKey, setPopKey] = useState(0)
    const completedRef = useRef(false)

    useEffect(() => {
        setTyped('')
        setShakeKey(0)
        setPopKey(0)
        completedRef.current = false
    }, [resetKey, alts])

    useEffect(() => {
        if (disabled || reveal) return
        if (completedRef.current) return

        const handleKey = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return
            if (e.key === 'Tab') return

            if (e.key === 'Backspace') {
                e.preventDefault()
                setTyped(t => t.slice(0, -1))
                return
            }

            if (e.key.length !== 1) return
            const L = e.key.toLowerCase()
            if (!isTypeable(L)) return // ignore spaces / punctuation — auto-filled

            e.preventDefault()
            // Click on every real keystroke, even wrong ones, matching hiragana mode.
            playKeyClick(keySound)

            const pos = typed.length
            // An alternative accepts the next letter only if it has matched every
            // letter typed so far and its next letter equals L.
            const accepts = alts.some(
                a => matchLen(a.letters, typed) === typed.length
                    && a.letters.length > pos
                    && a.letters[pos] === L,
            )
            if (!accepts) {
                setShakeKey(s => s + 1)
                return
            }

            const newTyped = typed + L
            setTyped(newTyped)
            setPopKey(p => p + 1)

            // Completing any one alternative validates the answer.
            if (alts.some(a => a.letters === newTyped)) {
                completedRef.current = true
                window.setTimeout(() => onComplete(), 260)
            }
        }

        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [alts, typed, disabled, reveal, onComplete, keySound])

    return (
        <div className="flex flex-col items-center gap-3 sm:gap-4 mt-4 mb-4 select-none">
            {alts.map((alt, ai) => {
                const ml = matchLen(alt.letters, typed)
                // Alive = matched everything typed so far and still has letters left;
                // only an alive row shows the glowing "next" slot. A revealed card
                // shows every alternative fully and has no live cursor.
                const alive = !reveal && ml === typed.length && alt.letters.length > typed.length

                return (
                    <div
                        key={ai}
                        className="flex flex-wrap justify-center items-end gap-1.5 sm:gap-2"
                        aria-label="Type the answer"
                    >
                        {alt.chars.map((targetCh, i) => {
                            if (targetCh === ' ') {
                                return <div key={i} className="w-4 sm:w-6" />
                            }

                            const lp = alt.letterPosOf[i]
                            const typeable = lp >= 0
                            // Non-typeable punctuation is always shown; letters show
                            // once typed (their letter position is within the prefix).
                            // On reveal, every letter is shown.
                            const isFilled = reveal || !typeable || lp < ml
                            const isCurrent = alive && lp === typed.length
                            const justFilled = !reveal && typeable && lp === typed.length - 1 && ml >= typed.length

                            return (
                                <CharSlot
                                    key={i}
                                    ch={isFilled ? targetCh : null}
                                    typeable={typeable}
                                    isFilled={isFilled}
                                    isCurrent={isCurrent}
                                    justFilled={justFilled}
                                    popKey={popKey}
                                    shakeKey={isCurrent ? shakeKey : 0}
                                />
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}

interface CharSlotProps {
    ch: string | null
    typeable: boolean
    isFilled: boolean
    isCurrent: boolean
    justFilled: boolean
    popKey: number
    shakeKey: number
}

function CharSlot({
    ch,
    typeable,
    isFilled,
    isCurrent,
    justFilled,
    popKey,
    shakeKey,
}: CharSlotProps) {
    // Punctuation (auto-filled, non-typeable) shows muted and without an
    // underline so the letters the user types stand out.
    return (
        <div
            key={shakeKey ? `s-${shakeKey}` : undefined}
            className={`flex flex-col items-center w-7 sm:w-9 ${
                shakeKey ? 'animate-char-shake' : ''
            }`}
        >
            <div className="h-12 sm:h-16 flex items-end justify-center">
                {isFilled ? (
                    <span
                        key={`${popKey}-${ch}`}
                        className={`text-4xl sm:text-5xl font-bold leading-none ${
                            typeable ? '' : 'text-[#A1A1A1]'
                        } ${justFilled ? 'animate-char-pop' : ''}`}
                    >
                        {ch}
                    </span>
                ) : (
                    <span className="text-4xl sm:text-5xl font-bold leading-none text-transparent">
                        {' '}
                    </span>
                )}
            </div>
            {typeable && (
                <div
                    className={`mt-2 h-[5px] w-6 sm:w-8 rounded-full transition-colors duration-300 ${
                        isFilled
                            ? 'bg-[#FF0054]'
                            : isCurrent
                            ? 'bg-white animate-underline-glow'
                            : 'bg-[#4F4F4F]'
                    } ${justFilled ? 'animate-underline-pulse' : ''}`}
                    style={{ transformOrigin: 'center' }}
                />
            )}
        </div>
    )
}
