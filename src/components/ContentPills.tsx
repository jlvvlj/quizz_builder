"use client"

import React from 'react'
import ContinuousTabs, { type TabItem } from './ui/continuous-tabs'

export type ContentMode = 'words' | 'sentences'

interface ContentPillsProps {
    value: ContentMode
    onChange: (mode: ContentMode) => void
}

const TABS: TabItem[] = [
    { id: 'words', label: 'Words' },
    { id: 'sentences', label: 'Sentences' },
]

// Picks what the upcoming session drills: the words themselves, or the example
// sentence for each word (typed from memory). Sentences is always a forward
// Japanese typing quiz, so the quiz-mode / typing-language pills hide for it.
export default function ContentPills({ value, onChange }: ContentPillsProps) {
    return (
        <ContinuousTabs
            tabs={TABS}
            activeId={value}
            onChange={(id) => onChange(id as ContentMode)}
            size="sm"
        />
    )
}
