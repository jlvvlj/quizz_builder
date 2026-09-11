"use client"

import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
    segmentReading,
    matchesRomaji,
    isRomajiPrefix,
    katakanaToHiragana,
    type RomajiUnit,
} from '@/utils/romaji'
import { playKeyClick, DEFAULT_KEYBOARD_SOUND } from '@/utils/audio'

interface TypingAnswerProps {
    targetReading: string
    // When provided with more than one reading (e.g. a kanji's several accepted
    // on'yomi), the answer is shown as one row per reading and typing ANY of them
    // completes the card — matched in parallel like EnglishTypingAnswer's
    // alternatives. Omitted / single-element for the words quiz (unchanged path).
    targetReadings?: string[]
    onComplete: () => void
    disabled?: boolean
    // When true, every slot is filled with the correct reading and input is
    // ignored (the user pressed "show answer"); onComplete is NOT called.
    reveal?: boolean
    resetKey: string | number
    keySound?: string
}

// Dispatch: a single reading uses the original, untouched component; two or more
// readings use the stacked parallel-matching variant.
export default function TypingAnswer(props: TypingAnswerProps) {
    if (props.targetReadings && props.targetReadings.length > 1) {
        return (
            <MultiReadingTyping
                readings={props.targetReadings}
                onComplete={props.onComplete}
                disabled={props.disabled}
                reveal={props.reveal}
                resetKey={props.resetKey}
                keySound={props.keySound ?? DEFAULT_KEYBOARD_SOUND}
            />
        )
    }
    return <SingleReadingTyping {...props} />
}

function SingleReadingTyping({
    targetReading,
    onComplete,
    disabled = false,
    reveal = false,
    resetKey,
    keySound = DEFAULT_KEYBOARD_SOUND,
}: TypingAnswerProps) {
    const normalized = useMemo(() => katakanaToHiragana(targetReading), [targetReading])
    const units = useMemo(() => segmentReading(normalized), [normalized])
    const chars = useMemo(() => Array.from(normalized), [normalized])

    const [filled, setFilled] = useState<(string | null)[]>(() => chars.map(() => null))
    const [unitIndex, setUnitIndex] = useState(0)
    const [buffer, setBuffer] = useState('')
    const [shakeKey, setShakeKey] = useState(0)
    const [popKey, setPopKey] = useState(0)
    const [recentIndices, setRecentIndices] = useState<Set<number>>(new Set())
    const completedRef = useRef(false)

    useEffect(() => {
        setFilled(chars.map(() => null))
        setUnitIndex(0)
        setBuffer('')
        setShakeKey(0)
        setPopKey(0)
        setRecentIndices(new Set())
        completedRef.current = false
    }, [resetKey, chars])

    // Show-answer: fill every slot with the target reading, stop accepting input,
    // and do NOT auto-complete — the parent records the miss and waits for the
    // user to advance.
    useEffect(() => {
        if (!reveal) return
        completedRef.current = true
        setFilled(chars.slice())
        setUnitIndex(units.length)
        setBuffer('')
        setRecentIndices(new Set())
    }, [reveal, chars, units])

    useEffect(() => {
        if (disabled || reveal) return
        if (completedRef.current) return

        const handleKey = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return
            if (e.key === 'Tab') return
            if (unitIndex >= units.length) return

            const unit = units[unitIndex]

            if (e.key === 'Backspace') {
                e.preventDefault()
                if (buffer.length > 0) {
                    setBuffer(b => b.slice(0, -1))
                }
                return
            }

            if (e.key.length !== 1) return

            // Direct hiragana / katakana input
            const asHira = katakanaToHiragana(e.key)
            if (asHira === unit.hiragana || asHira === unit.hiragana[0]) {
                e.preventDefault()
                playKeyClick(keySound)
                acceptUnit(unit)
                return
            }

            const k = e.key.toLowerCase()
            if (!/^[a-z\-]$/.test(k)) return
            e.preventDefault()
            // A real letter was typed — click for every keystroke, even ones
            // that turn out wrong (they still got typed).
            playKeyClick(keySound)

            const newBuffer = buffer + k
            if (matchesRomaji(unit, newBuffer)) {
                acceptUnit(unit)
                return
            }
            if (isRomajiPrefix(unit, newBuffer)) {
                setBuffer(newBuffer)
                return
            }
            // Could the new char alone start the unit? (recover from a stray keystroke)
            if (isRomajiPrefix(unit, k)) {
                setBuffer(k)
                return
            }
            // Wrong key — reset buffer and shake
            setBuffer('')
            setShakeKey(s => s + 1)
        }

        const acceptUnit = (unit: RomajiUnit) => {
            const start = unit.startIndex
            const newlyFilled: number[] = []
            setFilled(prev => {
                const next = [...prev]
                for (let j = 0; j < unit.length; j++) {
                    next[start + j] = unit.hiragana[j]
                    newlyFilled.push(start + j)
                }
                return next
            })
            setRecentIndices(new Set(newlyFilled))
            setPopKey(p => p + 1)
            setBuffer('')

            const nextIndex = unitIndex + 1
            setUnitIndex(nextIndex)

            if (nextIndex >= units.length) {
                completedRef.current = true
                // Brief pause so the final char animation reads, then resolve.
                window.setTimeout(() => onComplete(), 260)
            }
        }

        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [unitIndex, units, buffer, disabled, reveal, onComplete, keySound])

    return (
        <div
            className="flex flex-wrap justify-center items-end gap-3 sm:gap-4 mt-4 mb-4 select-none"
            aria-label="Type the hiragana for this word"
        >
            {chars.map((targetCh, i) => {
                const ch = filled[i]
                const isFilled = ch !== null
                const isCurrent =
                    !isFilled &&
                    unitIndex < units.length &&
                    i >= units[unitIndex].startIndex &&
                    i < units[unitIndex].startIndex + units[unitIndex].length
                const justFilled = isFilled && recentIndices.has(i)
                // Show the in-progress romaji (c -> ch -> chi) in the first slot
                // of the unit currently being typed.
                const isUnitStart = isCurrent && i === units[unitIndex].startIndex
                const pending = isUnitStart ? buffer : ''

                return (
                    <CharSlot
                        key={i}
                        targetCh={targetCh}
                        ch={ch}
                        isFilled={isFilled}
                        isCurrent={isCurrent}
                        justFilled={justFilled}
                        pending={pending}
                        popKey={popKey}
                        shakeKey={isCurrent ? shakeKey : 0}
                    />
                )
            })}
        </div>
    )
}

// --- Multi-reading variant -------------------------------------------------
// Stacks one row per accepted reading and matches keystrokes against every row
// in parallel; typing any one reading to completion finishes the card. Mirrors
// EnglishTypingAnswer's stacked-alternatives behaviour, but with kana/romaji
// unit matching instead of letter-by-letter.
interface MultiReadingTypingProps {
    readings: string[]
    onComplete: () => void
    disabled?: boolean
    reveal?: boolean
    resetKey: string | number
    keySound: string
}

interface MultiRow {
    normalized: string
    units: RomajiUnit[]
    chars: string[]
}

interface RowState {
    filled: (string | null)[]
    unitIndex: number
    buffer: string
    recent: Set<number>
}

function MultiReadingTyping({
    readings,
    onComplete,
    disabled = false,
    reveal = false,
    resetKey,
    keySound,
}: MultiReadingTypingProps) {
    // The parent rebuilds the `readings` array on every render, so memoize on its
    // VALUE (joined), not its identity. Otherwise `rows` would change every render
    // and the reset effect below would wipe the typed state on every keystroke —
    // which made multi-reading (multi-on'yomi) typing appear completely broken.
    const readingsKey = readings.join('')
    const rows = useMemo<MultiRow[]>(
        () => readings.map(r => {
            const normalized = katakanaToHiragana(r)
            return { normalized, units: segmentReading(normalized), chars: Array.from(normalized) }
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [readingsKey],
    )

    const makeState = (): RowState[] =>
        rows.map(row => ({ filled: row.chars.map(() => null), unitIndex: 0, buffer: '', recent: new Set<number>() }))

    // Per-row mutable state in a ref so a single keystroke can advance several
    // rows without racing multiple array state updates; `force` repaints.
    const stateRef = useRef<RowState[]>(makeState())
    const [, force] = useReducer((x: number) => x + 1, 0)
    const [shakeKey, setShakeKey] = useState(0)
    const [popKey, setPopKey] = useState(0)
    const completedRef = useRef(false)

    useEffect(() => {
        stateRef.current = makeState()
        setShakeKey(0)
        setPopKey(0)
        completedRef.current = false
        force()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetKey, rows])

    // Show-answer: fill every reading row fully, stop accepting input, and do NOT
    // auto-complete — the parent records the miss and waits for the user.
    useEffect(() => {
        if (!reveal) return
        completedRef.current = true
        stateRef.current = rows.map(row => ({
            filled: row.chars.slice(),
            unitIndex: row.units.length,
            buffer: '',
            recent: new Set<number>(),
        }))
        force()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reveal, rows])

    useEffect(() => {
        if (disabled || reveal) return
        if (completedRef.current) return

        const handleKey = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return
            if (e.key === 'Tab') return
            const st = stateRef.current

            if (e.key === 'Backspace') {
                e.preventDefault()
                let changed = false
                st.forEach(s => { if (s.buffer.length > 0) { s.buffer = s.buffer.slice(0, -1); changed = true } })
                if (changed) force()
                return
            }

            if (e.key.length !== 1) return
            const asHira = katakanaToHiragana(e.key)
            const k = e.key.toLowerCase()
            const isLetter = /^[a-z-]$/.test(k)
            const isKana = /[ぁ-ん]/.test(asHira)
            if (!isLetter && !isKana) return
            e.preventDefault()

            let anyConsumed = false
            let anyCompleted = false
            st.forEach((s, ri) => {
                const row = rows[ri]
                if (s.unitIndex >= row.units.length) return // already finished this row
                const unit = row.units[s.unitIndex]
                const accept = () => {
                    const start = unit.startIndex
                    const newRecent = new Set<number>()
                    for (let j = 0; j < unit.length; j++) { s.filled[start + j] = unit.hiragana[j]; newRecent.add(start + j) }
                    s.recent = newRecent
                    s.buffer = ''
                    s.unitIndex += 1
                    anyConsumed = true
                    if (s.unitIndex >= row.units.length) anyCompleted = true
                }
                // Direct kana input
                if (asHira === unit.hiragana || asHira === unit.hiragana[0]) { accept(); return }
                if (isLetter) {
                    const nb = s.buffer + k
                    if (matchesRomaji(unit, nb)) { accept(); return }
                    if (isRomajiPrefix(unit, nb)) { s.buffer = nb; s.recent = new Set(); anyConsumed = true; return }
                    if (isRomajiPrefix(unit, k)) { s.buffer = k; s.recent = new Set(); anyConsumed = true; return }
                    s.buffer = '' // this row can't take the key; it just resets
                }
            })

            if (anyConsumed) {
                playKeyClick(keySound)
                setPopKey(p => p + 1)
                force()
                if (anyCompleted) {
                    completedRef.current = true
                    window.setTimeout(() => onComplete(), 260)
                }
            } else {
                // No row accepted the key — shake all and clear pending buffers.
                st.forEach(s => { s.buffer = '' })
                setShakeKey(s => s + 1)
                force()
            }
        }

        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [rows, disabled, reveal, onComplete, keySound])

    return (
        <div className="flex flex-col items-center gap-3 sm:gap-4 mt-4 mb-4 select-none">
            {rows.map((row, ri) => {
                const s = stateRef.current[ri]
                return (
                    <div
                        key={ri}
                        className="flex flex-wrap justify-center items-end gap-3 sm:gap-4"
                        aria-label="Type any one of the readings"
                    >
                        {row.chars.map((targetCh, i) => {
                            const ch = s.filled[i]
                            const isFilled = ch !== null
                            const isCurrent =
                                !isFilled &&
                                s.unitIndex < row.units.length &&
                                i >= row.units[s.unitIndex].startIndex &&
                                i < row.units[s.unitIndex].startIndex + row.units[s.unitIndex].length
                            const justFilled = isFilled && s.recent.has(i)
                            const isUnitStart = isCurrent && i === row.units[s.unitIndex].startIndex
                            const pending = isUnitStart ? s.buffer : ''
                            return (
                                <CharSlot
                                    key={i}
                                    targetCh={targetCh}
                                    ch={ch}
                                    isFilled={isFilled}
                                    isCurrent={isCurrent}
                                    justFilled={justFilled}
                                    pending={pending}
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
    targetCh: string
    ch: string | null
    isFilled: boolean
    isCurrent: boolean
    justFilled: boolean
    pending: string
    popKey: number
    shakeKey: number
}

function CharSlot({
    ch,
    isFilled,
    isCurrent,
    justFilled,
    pending,
    popKey,
    shakeKey,
}: CharSlotProps) {
    return (
        <div
            // Re-key on a fill (to replay the bounce) or a wrong key (to replay
            // the shake); only one of the two ever applies to a given slot.
            key={justFilled ? `f-${popKey}` : shakeKey ? `s-${shakeKey}` : undefined}
            className={`flex flex-col items-center w-14 sm:w-16 ${
                justFilled ? 'animate-kana-bounce' : ''
            } ${shakeKey ? 'animate-char-shake' : ''}`}
        >
            <div className="h-16 sm:h-20 flex items-end justify-center">
                {isFilled ? (
                    <span
                        key={`${popKey}-${ch}`}
                        className={`text-5xl sm:text-6xl font-bold leading-none text-[#60A5FA] ${
                            justFilled ? 'animate-char-pop' : ''
                        }`}
                    >
                        {ch}
                    </span>
                ) : pending ? (
                    // Live romaji for the syllable being composed (c -> ch -> chi).
                    <span className="text-5xl sm:text-6xl font-mono font-semibold leading-none text-white lowercase">
                        {pending}
                    </span>
                ) : (
                    <span className="text-5xl sm:text-6xl font-bold leading-none text-transparent">
                        {'　'}
                    </span>
                )}
            </div>
            <div
                className={`mt-2 h-[6px] w-12 sm:w-14 rounded-full transition-colors duration-300 ${
                    isFilled
                        ? 'bg-[#60A5FA]'
                        : isCurrent
                        ? 'bg-white animate-underline-glow'
                        : 'bg-[#4F4F4F]'
                } ${justFilled ? 'animate-underline-pulse' : ''}`}
                style={{ transformOrigin: 'center' }}
            />
        </div>
    )
}
