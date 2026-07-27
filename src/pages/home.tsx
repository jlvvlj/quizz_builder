"use client"

import { Play } from "lucide-react"
import LoadingState from '@/components/LoadingState'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import CircularProgress from '../components/CircularProgress'
import { calculateSectionProgress } from '../utils/progress-calculator'
import { useQuizType } from '../utils/quiz-mode'

interface SectionInfo {
    id: number;
    rankStart: number;
    rankEnd: number;
}

// Main words page: the core vocabulary reordered by TUBELEX (YouTube subtitle)
// word frequency, one card per 1000-word section. The original words10k "Japanese
// Core" deck moved to /words_core (reachable via the button at the top).
export default function HomeRoute() {
    const router = useRouter()
    const quizType = useQuizType()
    const [sections, setSections] = useState<SectionInfo[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [sectionProgress, setSectionProgress] = useState<Record<string, number>>({})

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const res = await fetch('/api/words/get-tubelex-sections', { credentials: 'include' })
                if (!res.ok) throw new Error(`Failed to load sections (${res.status})`)
                const data = await res.json()
                const total: number = data.totalWords ?? 0
                const num: number = data.numSections ?? 0
                if (cancelled) return
                const list: SectionInfo[] = Array.from({ length: num }, (_, i) => ({
                    id: i + 1,
                    rankStart: i * 1000 + 1,
                    rankEnd: Math.min((i + 1) * 1000, total),
                }))
                setSections(list)
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load sections')
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    useEffect(() => {
        if (!sections) return
        let cancelled = false
        const load = async () => {
            const results = await Promise.all(sections.map(s =>
                calculateSectionProgress(`section_${s.id}`, quizType, 'words_tubelex')
                    .then(d => ({ id: s.id, progress: d.averageProgress }))
                    .catch(() => ({ id: s.id, progress: 0 }))
            ))
            if (cancelled) return
            setSectionProgress(results.reduce((acc, { id, progress }) => {
                acc[`section_${id}`] = progress
                return acc
            }, {} as Record<string, number>))
        }
        load()
        return () => { cancelled = true }
    }, [sections, quizType])

    const goToSection = (id: number) => router.push(`/words_tubelex_steps?section=section_${id}`)

    return (
        <div className="min-h-screen bg-[#181818] flex flex-col">
            <div className="flex-1 px-3 py-4 sm:px-6 sm:py-8 xl:px-12">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex justify-between items-center mb-4 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Japanese Words</h1>
                        {/* The original words10k "Japanese Core" deck (separate progress). */}
                        <button
                            onClick={() => router.push('/words_core')}
                            className="bg-[#262626] border border-[#4F4F4F] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#2F2F2F] transition-colors text-sm sm:text-base whitespace-nowrap"
                        >
                            Japanese Core
                        </button>
                    </div>

                    {error && (
                        <div className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-6 text-center">
                            <p className="text-white font-medium mb-1">Couldn&apos;t load word sections</p>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {!error && !sections && (
                        <LoadingState text="Loading sections" />
                    )}

                    {sections && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                            {sections.map(section => (
                                <div
                                    key={section.id}
                                    onClick={() => goToSection(section.id)}
                                    className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 sm:p-6 cursor-pointer hover:bg-[#2F2F2F] transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2 truncate">
                                                Words {section.rankStart}–{section.rankEnd}
                                            </h3>
                                            <div className="space-y-1 sm:space-y-2">
                                                <p className="text-[#A1A1A1] text-sm sm:text-base">{section.rankEnd - section.rankStart + 1} words</p>
                                                <p className="text-[#A1A1A1] text-sm sm:text-base">by frequency of use</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3 sm:gap-4 shrink-0">
                                            <CircularProgress
                                                progress={sectionProgress[`section_${section.id}`] || 0}
                                                size={50}
                                                strokeWidth={6}
                                                progressColor="#FF0054"
                                                backgroundColor="#181818"
                                            />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); goToSection(section.id); }}
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
