"use client"

import React from 'react'
import ContinuousTabs, { type TabItem } from './ui/continuous-tabs'

export type TypingLang = 'japanese' | 'english' | 'mix'

interface TypingLangPillsProps {
    value: TypingLang
    onChange: (lang: TypingLang) => void
    // 'typing' (default): you produce the answer — "Type Japanese / Type English".
    // 'choice': multiple-choice options — "Japanese / English" (no "Type").
    variant?: 'typing' | 'choice'
}

const TYPING_TABS: TabItem[] = [
    { id: 'japanese', label: 'Type Japanese' },
    { id: 'english', label: 'Type English' },
    { id: 'mix', label: 'Mix' },
]

const CHOICE_TABS: TabItem[] = [
    { id: 'japanese', label: 'Japanese' },
    { id: 'english', label: 'English' },
    { id: 'mix', label: 'Mix' },
]

// Chooses the answer language: in the typing quiz, what the user types; in the
// multiple-choice quiz, what the options show (Japanese reading, English
// translation, or a per-word mix). Has no bearing on progress.
export default function TypingLangPills({ value, onChange, variant = 'typing' }: TypingLangPillsProps) {
    return (
        <ContinuousTabs
            tabs={variant === 'choice' ? CHOICE_TABS : TYPING_TABS}
            activeId={value}
            onChange={(id) => onChange(id as TypingLang)}
            size="sm"
        />
    )
}
