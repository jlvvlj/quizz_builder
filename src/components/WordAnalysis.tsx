import { useState } from 'react'
import type { SessionWord } from '@/utils/cards'
import DifficultyGroups from './DifficultyGroups'
import SuccessRateGroups from './SuccessRateGroups'

interface WordAnalysisProps {
    words: SessionWord[]
}

export default function WordAnalysis({ words }: WordAnalysisProps) {
    const [activeTab, setActiveTab] = useState<'speed' | 'success'>('speed')

    return (
        <div>
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab('speed')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors border ${
                        activeTab === 'speed'
                            ? 'bg-[#2F2F2F] text-white border-[#4F4F4F]'
                            : 'bg-[#1F1F1F] text-[#A1A1A1] border-[#4F4F4F] hover:bg-[#262626] hover:text-white'
                    }`}
                >
                    Speed
                </button>
                <button
                    onClick={() => setActiveTab('success')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors border ${
                        activeTab === 'success'
                            ? 'bg-[#2F2F2F] text-white border-[#4F4F4F]'
                            : 'bg-[#1F1F1F] text-[#A1A1A1] border-[#4F4F4F] hover:bg-[#262626] hover:text-white'
                    }`}
                >
                    Success Rate
                </button>
            </div>

            {activeTab === 'speed' ? (
                <DifficultyGroups words={words} />
            ) : (
                <SuccessRateGroups words={words} />
            )}
        </div>
    )
} 
