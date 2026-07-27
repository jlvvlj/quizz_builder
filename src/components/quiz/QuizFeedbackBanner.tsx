import React from 'react'
import { Check, X } from 'lucide-react'

export interface QuizFeedbackBannerProps {
    status: 'correct' | 'incorrect'
    // Shown under "Correct solution:" on an incorrect answer.
    correctSolution: string
    // Optional kana line shown above the solution when the solution is Japanese.
    reading?: string
    // Optional "Meaning:" line — the translation, when the solution is Japanese.
    meaning?: string
    onContinue: () => void
}

// Duolingo-style feedback banner pinned to the bottom of the quiz card. Green on
// a correct answer, red on an incorrect one (or a revealed/timed-out card). The
// quiz waits on this banner — advancing happens only when the user clicks
// Continue or presses Space (the Space shortcut is owned by the quiz page, not
// this component).
export function QuizFeedbackBanner({
    status,
    correctSolution,
    reading,
    meaning,
    onContinue,
}: QuizFeedbackBannerProps) {
    const correct = status === 'correct'

    return (
        <div
            className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-4 sm:px-6 ${
                correct
                    ? 'border-green-500/40 bg-green-500/10'
                    : 'border-red-500/40 bg-red-500/10'
            }`}
        >
            <div className="flex min-w-0 items-center gap-3 sm:gap-4 text-left">
                <div
                    className={`flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full ${
                        correct ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}
                >
                    {correct ? (
                        <Check className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" strokeWidth={3} />
                    ) : (
                        <X className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" strokeWidth={3} />
                    )}
                </div>

                {correct ? (
                    <div className="text-xl sm:text-2xl font-bold text-green-400">Great!</div>
                ) : (
                    <div className="min-w-0">
                        <div className="text-sm sm:text-base font-bold text-red-400">
                            Correct solution:
                        </div>
                        {reading && (
                            <div className="text-xs sm:text-sm text-red-300/80 break-words">
                                {reading}
                            </div>
                        )}
                        <div className="text-base sm:text-lg text-red-200 break-words">
                            {correctSolution}
                        </div>
                        {meaning && (
                            <>
                                <div className="mt-1 text-sm sm:text-base font-bold text-red-400">
                                    Meaning:
                                </div>
                                <div className="text-sm sm:text-base text-red-200 break-words">
                                    {meaning}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={onContinue}
                autoFocus
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 sm:px-8 text-sm sm:text-base font-bold uppercase tracking-wide text-black transition-colors ${
                    correct
                        ? 'bg-green-400 hover:bg-green-300'
                        : 'bg-red-400 hover:bg-red-300'
                }`}
            >
                Continue
                <kbd className="hidden sm:inline rounded bg-black/15 border border-black/20 px-1.5 py-0.5 text-xs font-medium normal-case">
                    Space
                </kbd>
            </button>
        </div>
    )
}

export default QuizFeedbackBanner
