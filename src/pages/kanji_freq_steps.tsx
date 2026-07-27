"use client"

import { useRouter } from 'next/router'
import LoadingState from '@/components/LoadingState'
import { useEffect, useState } from 'react'
import StepsPage from '@/components/StepsPage'

// Steps within a frequency kanji section. Reuses the words StepsPage with
// content='kanji_freq'. The last section is partial, so the real step count is
// derived from the kanji total instead of always being 10.
export default function KanjiFreqSteps() {
    const router = useRouter()
    const { section } = router.query
    const [numSteps, setNumSteps] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!router.isReady) return
        if (typeof section !== 'string' || !section.startsWith('section_')) {
            router.replace('/kanji_freq_sections')
            return
        }
        const n = parseInt(section.replace('section_', ''), 10)
        let cancelled = false
        const load = async () => {
            try {
                const res = await fetch('/api/kanji/get-freq-sections', { credentials: 'include' })
                if (!res.ok) throw new Error(`Failed to load sections (${res.status})`)
                const data = await res.json()
                const total: number = data.totalKanji ?? 0
                if (cancelled) return
                if (n < 1 || (n - 1) * 1000 >= total) {
                    router.replace('/kanji_freq_sections')
                    return
                }
                const remaining = total - (n - 1) * 1000
                setNumSteps(Math.max(1, Math.min(10, Math.ceil(remaining / 100))))
            } catch (err) {
                // Surface rather than silently assuming 10 steps (no silent fallback).
                if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load section')
            }
        }
        load()
        return () => { cancelled = true }
    }, [router.isReady, section, router])

    if (error) {
        return (
            <div className="min-h-screen bg-[#181818] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-[#262626] border border-[#4F4F4F] rounded-2xl p-8 text-center">
                    <h2 className="text-white text-xl font-semibold mb-2">Couldn&apos;t load this section</h2>
                    <p className="text-red-400 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/kanji_freq_sections')}
                        className="bg-[#2F2F2F] border border-[#4F4F4F] hover:bg-[#363636] text-white px-5 py-2.5 rounded-lg transition-colors"
                    >
                        Back to sections
                    </button>
                </div>
            </div>
        )
    }

    if (!router.isReady || numSteps === null) {
        return (
            <div className="min-h-screen bg-[#181818] flex items-center justify-center">
                <LoadingState text="Loading steps" />
            </div>
        )
    }

    return (
        <StepsPage
            content="kanji_freq"
            numSteps={numSteps}
            currentSection={section as string}
            onCourseSelect={() => { /* navigation handled inside StepsPage */ }}
            onSettingsClick={() => { /* settings handled globally */ }}
        />
    )
}
