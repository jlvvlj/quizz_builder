"use client"

import React from 'react'
import { useRouter } from 'next/router'

// Shared "the save failed" screen used by every quiz type, so a rejected
// progress save is always surfaced the same way (per the no-silent-fallbacks
// rule) instead of each quiz inventing its own handling.
export function SaveErrorScreen({ error }: { error: string }) {
    const router = useRouter()
    return (
        <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-[#262626] border border-[#4F4F4F] rounded-2xl p-8 text-center">
                <h2 className="text-white text-2xl font-semibold mb-2">Failed to save progress</h2>
                <p className="text-[#A1A1A1] mb-4">
                    Your session finished but the server rejected the save. Your progress was not recorded.
                </p>
                <pre className="text-left text-xs text-red-300 bg-[#1F1F1F] border border-[#4F4F4F] rounded p-3 mb-6 whitespace-pre-wrap break-words">
                    {error}
                </pre>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-[#FF0054] hover:bg-[#e0004a] text-white px-5 py-2.5 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-[#2F2F2F] border border-[#4F4F4F] hover:bg-[#363636] text-white px-5 py-2.5 rounded-lg transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    )
}
