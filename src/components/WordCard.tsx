import type { SessionWord } from '@/utils/cards'
import { useEffect, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select"
import type { MarkableProgressContent, ProgressStatus } from '@/utils/progress-status'

type StatusSelection = ProgressStatus | 'automatic';

interface WordCardProps {
    word: SessionWord;
    showFurigana?: boolean;
    statusContent?: MarkableProgressContent;
    quizType?: 'multiple_choice' | 'typing';
}

export default function WordCard({
    word,
    showFurigana = false,
    statusContent = 'words',
    quizType = 'multiple_choice',
}: WordCardProps) {
    const automaticStatus: ProgressStatus = word.progress_status || 'new';
    const [manualStatus, setManualStatus] = useState<ProgressStatus | null>(word.marked_as ?? null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const currentStatus = manualStatus ?? automaticStatus;

    useEffect(() => {
        setManualStatus(word.marked_as ?? null);
    }, [word.id, word.marked_as, statusContent, quizType]);

    const handleStatusChange = async (value: StatusSelection) => {
        const markedAs = value === 'automatic' ? null : value;
        setIsUpdatingStatus(true);
        try {
            const response = await fetch('/api/progress/update-marked-status', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: statusContent,
                    itemId: word.id,
                    markedAs,
                    quizType,
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            setManualStatus(markedAs);
        } catch (error) {
            console.error('Error updating word status:', error);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Calculate success rate
    const totalAttempts = (word.correctAnswers ?? 0) + (word.totalMisses ?? 0);
    const successRate = totalAttempts > 0 
        ? Math.round((word.correctAnswers ?? 0) * 100 / totalAttempts)
        : 100; // If no attempts, consider it 100%

    // Calculate speed difficulty
    let speedDifficulty: 'easy' | 'medium' | 'hard' = 'hard';
    if (typeof word.timeToAnswer === 'number') {
        if (word.timeToAnswer <= 3) {
            speedDifficulty = 'easy';
        } else if (word.timeToAnswer <= 6) {
            speedDifficulty = 'medium';
        }
    }

    // Get color for speed indicator
    const speedColor = 'bg-white'; // Changed to always white, like KanjiCard

    // Get color for progress status
    const statusColor = {
        new: 'bg-[#262626]',
        learning: 'bg-yellow-600',
        mastered: 'bg-green-600',
        to_review: 'bg-[#FF0054]'
    }[currentStatus];

    return (
        <div className="bg-[#262626] border border-[#4F4F4F] rounded-3xl p-3 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 hover:bg-[#2F2F2F] transition-colors">
            <div className="flex-1 min-w-0">
                <div className="text-2xl sm:text-3xl font-medium flex flex-wrap items-center gap-2 text-white">
                    <div className="min-w-0 break-words">
                        {showFurigana && word.reading ? (
                            <ruby>
                                {word.word}
                                <rp>(</rp>
                                <rt className="text-sm">{word.reading}</rt>
                                <rp>)</rp>
                            </ruby>
                        ) : (
                            word.word
                        )}
                    </div>
                    <div className="flex-shrink-0">
                        <Select
                            value={manualStatus ?? 'automatic'}
                            onValueChange={handleStatusChange}
                            disabled={isUpdatingStatus}
                        >
                            <SelectTrigger className={`${statusColor} text-white text-[10px] font-semibold uppercase tracking-wide px-2.5 py-0.5 h-6 w-[104px] border-[#4F4F4F] justify-center [&>svg]:hidden [&>span]:line-clamp-none`}>
                                <span>{currentStatus.replace('_', ' ')}</span>
                            </SelectTrigger>
                            <SelectContent className="bg-[#262626] border-[#4F4F4F] min-w-[7rem]">
                                <SelectItem value="automatic" className="text-[10px] uppercase tracking-wide text-white hover:bg-[#2F2F2F]">AUTOMATIC ({automaticStatus.replace('_', ' ')})</SelectItem>
                                <SelectItem value="new" className="text-[10px] uppercase tracking-wide text-white hover:bg-[#2F2F2F]">NEW</SelectItem>
                                <SelectItem value="learning" className="text-[10px] uppercase tracking-wide text-white hover:bg-[#2F2F2F]">LEARNING</SelectItem>
                                <SelectItem value="mastered" className="text-[10px] uppercase tracking-wide text-white hover:bg-[#2F2F2F]">MASTERED</SelectItem>
                                <SelectItem value="to_review" className="text-[10px] uppercase tracking-wide text-white hover:bg-[#2F2F2F]">TO REVIEW</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="text-base sm:text-xl text-[#A1A1A1] mt-1 sm:mt-1.5 break-words">{word.meaning}</div>
            </div>
            <div className="w-full sm:w-64 flex-shrink-0 sm:ml-6">
                <div className="flex flex-col gap-2">
                    {/* Progress Bars - shown for all words except new ones */}
                    {word.progress > 0 || word.isReview ? (
                        <div className="flex space-x-4">
                            {/* Progress */}
                            <div className="flex flex-col items-end">
                                <div className="text-lg text-white mb-1 text-right">{word.progress}%</div>
                                <div className="h-2 bg-[#4F4F4F] rounded-full overflow-hidden w-16">
                                    <div 
                                        className="h-full bg-white transition-all duration-300"
                                        style={{ width: `${word.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Speed */}
                            <div className="flex flex-col items-end">
                                <div className="text-lg text-[#A1A1A1] mb-1 text-right">
                                    {word.timeToAnswer?.toFixed(1)}s
                                </div>
                                <div className="h-2 bg-[#4F4F4F] rounded-full overflow-hidden w-16">
                                    <div className="h-full bg-white" style={{ width: `${word.progress}%` }}></div>
                                </div>
                            </div>

                            {/* Success Rate */}
                            <div className="flex flex-col items-end">
                                <div className="text-lg text-white mb-1 text-right">
                                    {((word.correctAnswers ?? 0) + (word.totalMisses ?? 0)) > 0 && (
                                        <span>
                                            <span 
                                                className="text-white cursor-help relative group"
                                                title={`${word.correctAnswers ?? 0} ✓ ${word.totalMisses ?? 0} ✗`}
                                            >
                                                {successRate}%
                                                <span className="invisible group-hover:visible absolute -top-14 left-1/2 transform -translate-x-1/2 bg-[#262626] text-white px-4 py-2 rounded text-base whitespace-nowrap border border-[#4F4F4F]">
                                                    <span className="text-green-400">{word.correctAnswers ?? 0} ✓</span>
                                                    {" "}
                                                    <span className="text-red-400">{word.totalMisses ?? 0} ✗</span>
                                                </span>
                                            </span>
                                        </span>
                                    )}
                                </div>
                                <div className="h-2 bg-[#4F4F4F] rounded-full overflow-hidden w-16">
                                    <div 
                                        className="h-full bg-white"
                                        style={{ width: `${successRate}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
} 
