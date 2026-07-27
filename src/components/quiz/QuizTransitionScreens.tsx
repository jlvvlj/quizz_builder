import React, { useEffect, useRef, useState } from 'react'

// Animated count-up used for the score and stat numbers on the end screen.
function CountUp({
    value,
    durationMs = 1100,
    delayMs = 0,
    decimals = 0,
    suffix = '',
}: {
    value: number
    durationMs?: number
    delayMs?: number
    decimals?: number
    suffix?: string
}) {
    const [display, setDisplay] = useState(0)
    const rafRef = useRef<number | null>(null)

    useEffect(() => {
        let start: number | null = null
        let timeoutId: ReturnType<typeof setTimeout>

        const step = (ts: number) => {
            if (start === null) start = ts
            const elapsed = ts - start
            const t = Math.min(elapsed / durationMs, 1)
            // easeOutCubic
            const eased = 1 - Math.pow(1 - t, 3)
            setDisplay(value * eased)
            if (t < 1) {
                rafRef.current = requestAnimationFrame(step)
            } else {
                setDisplay(value)
            }
        }

        timeoutId = setTimeout(() => {
            rafRef.current = requestAnimationFrame(step)
        }, delayMs)

        return () => {
            clearTimeout(timeoutId)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [value, durationMs, delayMs])

    return (
        <>
            {display.toFixed(decimals)}
            {suffix}
        </>
    )
}

// Animated SVG ring that draws itself to `percent` (0-100).
function ProgressRing({
    percent,
    size = 132,
    stroke = 10,
    delayMs = 300,
    children,
}: {
    percent: number
    size?: number
    stroke?: number
    delayMs?: number
    children?: React.ReactNode
}) {
    const radius = (size - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const [drawn, setDrawn] = useState(0)

    useEffect(() => {
        const id = setTimeout(() => setDrawn(percent), delayMs)
        return () => clearTimeout(id)
    }, [percent, delayMs])

    const offset = circumference - (Math.max(0, Math.min(100, drawn)) / 100) * circumference

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90 animate-ring-glow">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#2F2F2F"
                    strokeWidth={stroke}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#FF0054"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(0.22, 1, 0.36, 1)' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
        </div>
    )
}

function Star({ filled, delayMs }: { filled: boolean; delayMs: number }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-9 w-9 sm:h-11 sm:w-11 animate-star-pop opacity-0"
            style={{ animationDelay: `${delayMs}ms` }}
            fill={filled ? '#FFD24A' : 'none'}
            stroke={filled ? '#FFD24A' : '#4F4F4F'}
            strokeWidth={1.6}
        >
            <path
                strokeLinejoin="round"
                d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.9l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.94L12 2.5z"
            />
        </svg>
    )
}

export function QuizStartScreen({ sectionLabel }: { sectionLabel?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181818] animate-overlay-in overflow-hidden">
            {/* ambient accent glow */}
            <div className="pointer-events-none absolute -top-1/4 left-1/2 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-[#FF0054]/15 blur-[120px]" />

            {/* floating ambient kanji */}
            <div className="pointer-events-none absolute inset-0 select-none">
                <span className="absolute left-[12%] top-[18%] text-6xl sm:text-8xl text-white/[0.04] animate-float-y" style={{ animationDelay: '0s' }}>学</span>
                <span className="absolute right-[14%] top-[26%] text-5xl sm:text-7xl text-white/[0.04] animate-float-y" style={{ animationDelay: '0.6s' }}>習</span>
                <span className="absolute left-[20%] bottom-[20%] text-5xl sm:text-7xl text-white/[0.04] animate-float-y" style={{ animationDelay: '1.1s' }}>字</span>
                <span className="absolute right-[18%] bottom-[24%] text-6xl sm:text-8xl text-white/[0.04] animate-float-y" style={{ animationDelay: '0.3s' }}>漢</span>
            </div>

            <div className="relative flex flex-col items-center text-center px-6">
                {sectionLabel && (
                    <div
                        className="mb-5 rounded-full border border-[#FF0054]/40 bg-[#FF0054]/10 px-4 py-1.5 text-sm font-medium uppercase tracking-[0.2em] text-[#FF6c98] animate-rise-in opacity-0"
                        style={{ animationDelay: '0.1s' }}
                    >
                        {sectionLabel}
                    </div>
                )}

                <div className="text-7xl sm:text-9xl font-bold leading-none text-white animate-pop-in opacity-0">
                    開始
                </div>

                <div
                    className="mt-6 text-2xl sm:text-3xl font-semibold text-white animate-rise-in opacity-0"
                    style={{ animationDelay: '0.25s' }}
                >
                    Get ready
                </div>

                <div
                    className="mt-2 text-sm sm:text-base text-[#A1A1A1] animate-rise-in opacity-0"
                    style={{ animationDelay: '0.4s' }}
                >
                    Press <kbd className="rounded bg-[#262626] border border-[#4F4F4F] px-2 py-0.5 text-white">space</kbd> to begin
                </div>
            </div>
        </div>
    )
}

export interface QuizEndStats {
    score: number
    stars: number
    correctCount: number
    missedCount: number
    totalWords: number
    accuracyPct: number
    avgTime: number
}

export interface MasteryStats {
    mastered: number
    total: number
    remaining: number
    percent: number
}

export function QuizEndScreen({
    stats,
    mastery,
    masteryError,
    masteryScope = 'Step',
    sectionLabel,
    unitLabel = 'kanji',
    autoContinueMs,
    onSeeResults,
    onFinish,
    hideMastery = false,
    primaryLabel = 'See detailed results',
    secondaryLabel = 'Finish',
    autoContinueLabel = 'results',
}: {
    stats: QuizEndStats
    mastery: MasteryStats | null
    masteryError: boolean
    // The scope this mastery is measured over, capitalized for display
    // (e.g. 'Step' for the words/kanji-freq steps, 'Section' for the
    // section-based kanji quiz which has no sub-steps).
    masteryScope?: string
    sectionLabel?: string
    unitLabel?: string
    // When set, a countdown footer is shown; the parent owns the actual
    // navigation. Omit it for self-contained quizzes that don't auto-advance.
    autoContinueMs?: number
    onSeeResults: () => void
    onFinish: () => void
    hideMastery?: boolean
    primaryLabel?: string
    secondaryLabel?: string
    autoContinueLabel?: string
}) {
    const [remaining, setRemaining] = useState(
        autoContinueMs ? Math.ceil(autoContinueMs / 1000) : 0,
    )

    useEffect(() => {
        if (!autoContinueMs) return
        const id = setInterval(() => {
            setRemaining(prev => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(id)
    }, [autoContinueMs])

    const masteryPending = mastery === null && !masteryError
    const masteryScopeLower = masteryScope.toLowerCase()

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center bg-[#181818] animate-overlay-in overflow-y-auto">
            {/* ambient accent glow */}
            <div className="pointer-events-none absolute -top-1/4 left-1/2 h-[55vh] w-[55vh] -translate-x-1/2 rounded-full bg-[#FF0054]/15 blur-[120px]" />

            <div className="relative w-full max-w-2xl px-5 sm:px-8 py-8 sm:py-12 flex flex-col items-center">
                {sectionLabel && (
                    <div
                        className="mb-3 text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-[#A1A1A1] animate-rise-in opacity-0"
                        style={{ animationDelay: '0.05s' }}
                    >
                        {sectionLabel}
                    </div>
                )}
                <h1 className="text-3xl sm:text-5xl font-bold text-white animate-pop-in opacity-0">
                    Quiz Complete
                </h1>

                {/* Stars */}
                <div className="mt-5 flex items-center gap-2">
                    {[0, 1, 2].map(i => (
                        <Star key={i} filled={i < stats.stars} delayMs={500 + i * 160} />
                    ))}
                </div>

                {/* Score */}
                <div className="mt-6 flex flex-col items-center">
                    <div
                        className="text-7xl sm:text-8xl font-bold leading-none animate-pop-in opacity-0 bg-gradient-to-r from-[#FF0054] via-[#ff5c8a] to-[#FF0054] bg-clip-text text-transparent bg-[length:200%_auto] animate-sheen"
                        style={{ animationDelay: '0.2s' }}
                    >
                        <CountUp value={stats.score} delayMs={350} durationMs={1200} />
                    </div>
                    <div className="mt-1 text-sm uppercase tracking-[0.25em] text-[#A1A1A1]">Score</div>
                </div>

                {/* Quiz stat grid */}
                <div className="mt-8 grid w-full grid-cols-2 gap-3 sm:gap-4">
                    <StatCard label="Correct" delayMs={0.45} accent>
                        <CountUp value={stats.correctCount} delayMs={450} durationMs={900} />
                        <span className="text-xl sm:text-2xl text-[#A1A1A1]"> / {stats.totalWords}</span>
                    </StatCard>
                    <StatCard label="Missed" delayMs={0.55}>
                        <CountUp value={stats.missedCount} delayMs={550} durationMs={900} />
                    </StatCard>
                    <StatCard label="Accuracy" delayMs={0.65}>
                        <CountUp value={stats.accuracyPct} delayMs={650} durationMs={1000} suffix="%" />
                    </StatCard>
                    <StatCard label="Avg time" delayMs={0.75}>
                        <CountUp value={stats.avgTime} delayMs={750} durationMs={1000} decimals={1} suffix="s" />
                    </StatCard>
                </div>

                {/* Mastery progress */}
                {!hideMastery && (
                <div
                    className="mt-8 w-full rounded-2xl border border-[#4F4F4F] bg-[#262626] p-5 sm:p-6 flex items-center gap-5 sm:gap-7 animate-rise-in opacity-0"
                    style={{ animationDelay: '0.85s' }}
                >
                    <ProgressRing percent={mastery?.percent ?? 0} delayMs={1100}>
                        <span className="text-2xl sm:text-3xl font-bold text-white">
                            {masteryPending ? (
                                <span className="text-[#A1A1A1]">…</span>
                            ) : masteryError ? (
                                <span className="text-[#A1A1A1]">—</span>
                            ) : (
                                <CountUp value={mastery!.percent} delayMs={1200} durationMs={1200} suffix="%" />
                            )}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-[#A1A1A1]">{masteryScope}</span>
                    </ProgressRing>

                    <div className="flex-1 text-left">
                        <div className="text-base sm:text-lg font-semibold text-white">{masteryScope} mastery</div>
                        {masteryPending ? (
                            <div className="mt-1 text-sm text-[#A1A1A1]">Calculating…</div>
                        ) : masteryError ? (
                            <div className="mt-1 text-sm text-[#A1A1A1]">Progress unavailable</div>
                        ) : (
                            <>
                                <div className="mt-1 text-sm text-[#A1A1A1]">
                                    <span className="text-white font-semibold">{mastery!.mastered}</span> of{' '}
                                    <span className="text-white font-semibold">{mastery!.total}</span> {unitLabel} mastered
                                </div>
                                <div className="mt-2 text-sm">
                                    <span className="text-[#FF6c98] font-semibold">{mastery!.remaining}</span>
                                    <span className="text-[#A1A1A1]"> more to master this {masteryScopeLower}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                )}

                {/* Actions */}
                <div
                    className="mt-8 flex w-full flex-col sm:flex-row gap-3 animate-rise-in opacity-0"
                    style={{ animationDelay: '1s' }}
                >
                    <button
                        onClick={onSeeResults}
                        className="flex-1 rounded-xl bg-[#FF0054] px-6 py-3.5 text-white font-semibold text-base sm:text-lg hover:bg-[#e0004a] transition-colors"
                    >
                        {primaryLabel}
                    </button>
                    <button
                        onClick={onFinish}
                        className="flex-1 rounded-xl bg-[#262626] border border-[#4F4F4F] px-6 py-3.5 text-white font-semibold text-base sm:text-lg hover:bg-[#2F2F2F] transition-colors"
                    >
                        {secondaryLabel}
                    </button>
                </div>

                {autoContinueMs ? (
                    <div className="mt-4 text-xs text-[#A1A1A1]">
                        Continuing to {autoContinueLabel} in {remaining}s · press{' '}
                        <kbd className="rounded bg-[#262626] border border-[#4F4F4F] px-1.5 py-0.5 text-white">space</kbd> to skip
                    </div>
                ) : null}
            </div>
        </div>
    )
}

function StatCard({
    label,
    children,
    delayMs,
    accent = false,
}: {
    label: string
    children: React.ReactNode
    delayMs: number
    accent?: boolean
}) {
    return (
        <div
            className={`rounded-2xl border ${
                accent ? 'border-[#FF0054]/40 bg-[#FF0054]/10' : 'border-[#4F4F4F] bg-[#262626]'
            } px-4 py-4 sm:py-5 text-center animate-rise-in opacity-0`}
            style={{ animationDelay: `${delayMs}s` }}
        >
            <div className="text-3xl sm:text-4xl font-bold text-white">{children}</div>
            <div className="mt-1 text-xs sm:text-sm uppercase tracking-wider text-[#A1A1A1]">{label}</div>
        </div>
    )
}
