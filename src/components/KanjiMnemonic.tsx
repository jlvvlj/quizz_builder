import React from 'react'
import { createPortal } from 'react-dom'
import { Card } from '@/components/ui/card'

export interface PrimitiveHint {
    kanji: string
    meaning: string
}

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function uniqueTerms(values: string[]) {
    const seen = new Set<string>()
    return values
        .map(value => value.trim())
        .filter(Boolean)
        .filter(value => {
            const key = value.toLowerCase()
            if (seen.has(key)) return false
            seen.add(key)
            return true
        })
}

function meaningTerms(english: string) {
    return uniqueTerms([
        english,
        ...english.split(/[;,/]/g),
    ])
}

export function PrimitiveHintCard({ primitive, compact = true }: { primitive: PrimitiveHint; compact?: boolean }) {
    const sizeClass = compact
        ? 'h-16 w-16 sm:h-20 sm:w-20 lg:h-28 lg:w-28'
        : 'h-24 w-24 sm:h-32 sm:w-32 lg:h-48 lg:w-48'
    const kanjiClass = compact
        ? 'text-[40px] sm:text-[52px] lg:text-[72px]'
        : 'text-[60px] sm:text-[80px] lg:text-[120px]'
    const labelClass = compact
        ? 'text-[10px] sm:text-xs'
        : 'text-xs sm:text-sm lg:text-base'

    return (
        <Card className={`bg-[#262626] border-[#4F4F4F] border ${sizeClass} flex flex-col items-center rounded-xl hover:border-[#FF0054] transition-colors`}>
            <div className="flex-1 flex items-center justify-center pt-2">
                <div className={`${kanjiClass} font-bold text-white leading-none`}>
                    {primitive.kanji}
                </div>
            </div>
            <div className={`text-white ${labelClass} text-center px-2 pb-2 w-full truncate`}>
                {primitive.meaning}
            </div>
        </Card>
    )
}

export function KanjiMnemonic({
    mnemonic,
    english,
    primitives,
    className = '',
}: {
    mnemonic: string
    english: string
    primitives: PrimitiveHint[]
    className?: string
}) {
    const [hoverPreview, setHoverPreview] = React.useState<{
        primitive: PrimitiveHint
        left: number
        top: number
        placement: 'above' | 'below'
    } | null>(null)
    const englishWords = meaningTerms(english)
    const englishByMeaning = new Set(englishWords.map(word => word.toLowerCase()))
    const primitiveByMeaning = new Map(primitives.map(primitive => [primitive.meaning.toLowerCase(), primitive]))
    const primitiveMeanings = primitives.map(primitive => primitive.meaning).filter(Boolean)
    const tokens = [...englishWords, ...primitiveMeanings]
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)

    if (!mnemonic || tokens.length === 0) {
        return <span className={className}>{mnemonic}</span>
    }

    const pattern = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi')

    const showPrimitivePreview = (primitive: PrimitiveHint, element: HTMLElement) => {
        const rect = element.getBoundingClientRect()
        const placement = rect.top < 150 ? 'below' : 'above'
        setHoverPreview({
            primitive,
            left: rect.left + rect.width / 2,
            top: placement === 'above' ? rect.top - 8 : rect.bottom + 8,
            placement,
        })
    }

    return (
        <>
        <span className={className}>
            {mnemonic.split(pattern).map((part, index) => {
                if (!part) return null
                const lower = part.toLowerCase()
                const isMeaning = englishByMeaning.has(lower)
                const primitive = primitiveByMeaning.get(lower)

                if (isMeaning) {
                    return (
                        <span key={index} style={{ backgroundColor: '#2463EB', color: 'white', padding: '4px', borderRadius: '4px' }}>
                            {part}
                        </span>
                    )
                }

                if (primitive) {
                    return (
                        <span
                            key={index}
                            className="inline-block"
                            onMouseEnter={(event) => showPrimitivePreview(primitive, event.currentTarget)}
                            onMouseMove={(event) => showPrimitivePreview(primitive, event.currentTarget)}
                            onMouseLeave={() => setHoverPreview(null)}
                        >
                            <span style={{ backgroundColor: '#DA2877', color: 'white', padding: '4px', borderRadius: '4px' }}>
                                {part}
                            </span>
                        </span>
                    )
                }

                return part
            })}
        </span>
        {hoverPreview && typeof document !== 'undefined'
            ? createPortal(
                <div
                    className="pointer-events-none fixed z-[9999]"
                    style={{
                        left: hoverPreview.left,
                        top: hoverPreview.top,
                        transform: hoverPreview.placement === 'above'
                            ? 'translate(-50%, -100%)'
                            : 'translate(-50%, 0)',
                    }}
                >
                    <PrimitiveHintCard primitive={hoverPreview.primitive} compact />
                </div>,
                document.body,
            )
            : null}
        </>
    )
}
