"use client"

import { Play } from "lucide-react"
import LoadingState from '@/components/LoadingState'
import { useState, useEffect } from 'react'
import CircularProgress from '../components/CircularProgress'
import { calculateStepProgress } from '../utils/progress-calculator'
import { useQuizType } from '../utils/quiz-mode'
import { KANJI_PRIMITIVES } from '../utils/kanji-primitives'

// One card per 100-question step. Steps still belong to 1000-item sections under
// the hood (section_<N> / step_<1..10>), but we flatten every section's steps
// into a single grid so the user lands directly on the full list of quiz steps
// instead of having to pick a section first.
interface StepInfo {
    section: string;   // e.g. "section_1"
    step: string;      // e.g. "step_3"
    key: string;       // unique "section_1-step_3"
    rankStart: number;
    rankEnd: number;
}

const STEPS_PER_SECTION = 10;
const KANJI_PER_STEP = 100;

export default function KanjiFreqSections() {
    const quizType = useQuizType()
    const [steps, setSteps] = useState<StepInfo[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [stepProgress, setStepProgress] = useState<Record<string, number>>({})
    const [primitiveProgress, setPrimitiveProgress] = useState(0)

    // Build the flat step list from the live quiz-item count (ceil(total / 100)).
    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const res = await fetch('/api/kanji/get-freq-sections', { credentials: 'include' })
                if (!res.ok) throw new Error(`Failed to load steps (${res.status})`)
                const data = await res.json()
                const total: number = data.totalKanji ?? 0
                if (cancelled) return
                const numSteps = Math.ceil(total / KANJI_PER_STEP)
                const list: StepInfo[] = Array.from({ length: numSteps }, (_, i) => {
                    const sectionId = Math.floor(i / STEPS_PER_SECTION) + 1
                    const stepId = (i % STEPS_PER_SECTION) + 1
                    return {
                        section: `section_${sectionId}`,
                        step: `step_${stepId}`,
                        key: `section_${sectionId}-step_${stepId}`,
                        rankStart: i * KANJI_PER_STEP + 1,
                        rankEnd: Math.min((i + 1) * KANJI_PER_STEP, total),
                    }
                })
                setSteps(list)
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load steps')
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    // Per-step progress rings for the active quiz type.
    useEffect(() => {
        if (!steps) return
        let cancelled = false
        const load = async () => {
            const results = await Promise.all(steps.map(s =>
                calculateStepProgress(s.section, s.step, quizType, 'kanji_freq')
                    .then(d => ({ key: s.key, progress: d.averageProgress }))
                    .catch(() => ({ key: s.key, progress: 0 }))
            ))
            if (cancelled) return
            setStepProgress(results.reduce((acc, { key, progress }) => {
                acc[key] = progress
                return acc
            }, {} as Record<string, number>))
        }
        load()
        return () => { cancelled = true }
    }, [steps, quizType])

    useEffect(() => {
        let cancelled = false
        calculateStepProgress('primitives', 'primitives', quizType, 'kanji_primitives')
            .then(d => {
                if (!cancelled) setPrimitiveProgress(d.averageProgress)
            })
            .catch(() => {
                if (!cancelled) setPrimitiveProgress(0)
            })
        return () => { cancelled = true }
    }, [quizType])

    const goToStep = (s: StepInfo) => {
        const params = new URLSearchParams({
            section: s.section,
            step: s.step,
            title: 'Study Session',
            subtitle: 'Kanji in this session',
            description: "These are the kanji you'll practice in this session.",
            content: 'kanji_freq',
        })
        window.location.href = `/session_preview_results?${params.toString()}`
    }

    const goToPrimitives = () => {
        const params = new URLSearchParams({
            section: 'primitives',
            step: 'primitives',
            title: 'Primitives',
            subtitle: 'Primitives in this session',
            description: "These are the kanji primitives you'll practice before the frequency steps.",
            content: 'kanji_primitives',
        })
        window.location.href = `/session_preview_results?${params.toString()}`
    }

    return (
        <div className="min-h-screen bg-[#181818] flex flex-col">
            <div className="flex-1 px-3 py-4 sm:px-6 sm:py-8 xl:px-12">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex justify-between items-center mb-4 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Kanji by Frequency</h1>
                    </div>

                    {error && (
                        <div className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-6 text-center">
                            <p className="text-white font-medium mb-1">Couldn&apos;t load kanji steps</p>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {!error && !steps && (
                        <LoadingState text="Loading steps" />
                    )}

                    {steps && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                            <div
                                onClick={goToPrimitives}
                                className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 sm:p-6 cursor-pointer hover:bg-[#2F2F2F] transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2 truncate">
                                            Primitives
                                        </h3>
                                        <div className="space-y-1 sm:space-y-2">
                                            <p className="text-[#A1A1A1] text-sm sm:text-base">{KANJI_PRIMITIVES.length} questions</p>
                                            <p className="text-[#A1A1A1] text-sm sm:text-base">before Kanji 1</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 sm:gap-4 shrink-0">
                                        <CircularProgress
                                            progress={primitiveProgress}
                                            size={50}
                                            strokeWidth={6}
                                            progressColor="#FF0054"
                                            backgroundColor="#181818"
                                        />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); goToPrimitives(); }}
                                            className="bg-[#181818] border border-[#4F4F4F] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#2F2F2F] transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                                        >
                                            <Play className="w-4 h-4" />
                                            Start
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {steps.map(step => (
                                <div
                                    key={step.key}
                                    onClick={() => goToStep(step)}
                                    className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 sm:p-6 cursor-pointer hover:bg-[#2F2F2F] transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2 truncate">
                                                Kanji {step.rankStart}–{step.rankEnd}
                                            </h3>
                                            <div className="space-y-1 sm:space-y-2">
                                                <p className="text-[#A1A1A1] text-sm sm:text-base">{step.rankEnd - step.rankStart + 1} questions</p>
                                                <p className="text-[#A1A1A1] text-sm sm:text-base">by frequency of use</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3 sm:gap-4 shrink-0">
                                            <CircularProgress
                                                progress={stepProgress[step.key] || 0}
                                                size={50}
                                                strokeWidth={6}
                                                progressColor="#FF0054"
                                                backgroundColor="#181818"
                                            />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); goToStep(step); }}
                                                className="bg-[#181818] border border-[#4F4F4F] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#2F2F2F] transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                                            >
                                                <Play className="w-4 h-4" />
                                                Start
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
