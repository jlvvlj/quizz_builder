"use client"

import React from 'react'
import ContinuousTabs, { type TabItem } from './ui/continuous-tabs'

export type QuizMode = 'multiple-choice' | 'typing'

interface QuizModePillsProps {
    value: QuizMode
    onChange: (mode: QuizMode) => void
}

const TABS: TabItem[] = [
    { id: 'multiple-choice', label: 'Multiple choice' },
    { id: 'typing', label: 'Typing' },
]

// Picks the answer mode for the upcoming quiz: choose from options, or type the
// reading. Mirrors the Quiz Mode setting and persists the same way.
export default function QuizModePills({ value, onChange }: QuizModePillsProps) {
    return (
        <ContinuousTabs
            tabs={TABS}
            activeId={value}
            onChange={(id) => onChange(id as QuizMode)}
            size="sm"
        />
    )
}
