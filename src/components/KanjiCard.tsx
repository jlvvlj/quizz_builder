import { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type StatusType = 'new' | 'learning' | 'mastered' | 'to_review';

interface KanjiCardProps {
    kanji: {
        id: number;
        japanese_word: string;
        english: string;
        progress: number;
        progress_status?: StatusType;
        marked_as?: StatusType;
        time_to_answer?: number;
        total_misses?: number;
        correct_answers?: number;
        isReview?: boolean;
        mnemonic?: string;
    };
}

export default function KanjiCard({ kanji }: KanjiCardProps) {
    // Initialize with marked_as if it exists, otherwise fall back to progress_status
    const [currentStatus, setCurrentStatus] = useState<StatusType>(
        kanji.marked_as || kanji.progress_status || 'new'
    );

    const handleStatusChange = async (value: StatusType) => {
        try {
            const response = await fetch('/api/kanji/update-marked-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    kanjiId: kanji.id,
                    markedAs: value
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            setCurrentStatus(value);
        } catch (error) {
            console.error('Error updating kanji status:', error);
            // Optionally show an error message to the user
        }
    };

    // Calculate success rate
    const totalAttempts = (kanji.correct_answers ?? 0) + (kanji.total_misses ?? 0);
    const successRate = totalAttempts > 0 
        ? Math.round((kanji.correct_answers ?? 0) * 100 / totalAttempts)
        : 100; // If no attempts, consider it 100%

    // Calculate speed difficulty
    let speedDifficulty: 'easy' | 'medium' | 'hard' = 'hard';
    if (typeof kanji.time_to_answer === 'number') {
        if (kanji.time_to_answer <= 3) {
            speedDifficulty = 'easy';
        } else if (kanji.time_to_answer <= 6) {
            speedDifficulty = 'medium';
        }
    }

    // Get color for speed indicator
    const speedColor = 'bg-white'; // Changed to always white

    // Get color for progress status
    const statusColor = {
        new: 'bg-[#262626]',
        learning: 'bg-yellow-600',
        mastered: 'bg-green-600',
        to_review: 'bg-[#FF0054]'
    }[currentStatus];

    return (
        <div className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-6 flex items-center hover:bg-[#2F2F2F] transition-colors">
            <div className="flex-1 min-w-0">
                <div className="text-3xl font-medium truncate flex items-center gap-3 text-white">
                    {kanji.japanese_word}
                    <Select
                        value={currentStatus}
                        onValueChange={handleStatusChange}
                    >
                        <SelectTrigger className={`${statusColor} text-white text-xs font-semibold uppercase tracking-wide px-3 py-0.5 h-8 w-[120px] border-[#4F4F4F] justify-center [&>svg]:hidden [&>span]:line-clamp-none`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#262626] border-[#4F4F4F] min-w-[8rem]">
                            <SelectItem value="new" className="text-xs uppercase tracking-wide text-white hover:bg-[#2F2F2F]">NEW</SelectItem>
                            <SelectItem value="learning" className="text-xs uppercase tracking-wide text-white hover:bg-[#2F2F2F]">LEARNING</SelectItem>
                            <SelectItem value="mastered" className="text-xs uppercase tracking-wide text-white hover:bg-[#2F2F2F]">MASTERED</SelectItem>
                            <SelectItem value="to_review" className="text-xs uppercase tracking-wide text-white hover:bg-[#2F2F2F]">TO REVIEW</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-xl text-[#A1A1A1] truncate mt-1.5">{kanji.english}</div>
            </div>
            <div className="w-64 flex-shrink-0 ml-6">
                <div className="flex flex-col gap-2">
                    {kanji.progress > 0 || kanji.isReview ? (
                        <div className="flex space-x-4">
                            {/* Progress */}
                            <div className="flex flex-col items-end">
                                <div className="text-lg text-white mb-1 text-right">{kanji.progress}%</div>
                                <div className="h-2 bg-[#4F4F4F] rounded-full overflow-hidden w-16">
                                    <div 
                                        className="h-full bg-white transition-all duration-300"
                                        style={{ width: `${kanji.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Speed */}
                            <div className="flex flex-col items-end">
                                <div className="text-lg text-[#A1A1A1] mb-1 text-right">
                                    {kanji.time_to_answer?.toFixed(1)}s
                                </div>
                                <div className="h-2 bg-[#4F4F4F] rounded-full overflow-hidden w-16">
                                    <div className="h-full bg-white" style={{ width: `${kanji.progress}%` }}></div>
                                </div>
                            </div>

                            {/* Success Rate */}
                            <div className="flex flex-col items-end">
                                <div className="text-lg text-white mb-1 text-right">
                                    {((kanji.correct_answers ?? 0) + (kanji.total_misses ?? 0)) > 0 && (
                                        <span>
                                            <span 
                                                className="text-white cursor-help relative group"
                                                title={`${kanji.correct_answers ?? 0} ✓ ${kanji.total_misses ?? 0} ✗`}
                                            >
                                                {successRate}%
                                                <span className="invisible group-hover:visible absolute -top-14 left-1/2 transform -translate-x-1/2 bg-[#262626] text-white px-4 py-2 rounded text-base whitespace-nowrap border border-[#4F4F4F]">
                                                    <span className="text-green-400">{kanji.correct_answers ?? 0} ✓</span>
                                                    {" "}
                                                    <span className="text-red-400">{kanji.total_misses ?? 0} ✗</span>
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