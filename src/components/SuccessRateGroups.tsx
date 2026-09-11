import type { SessionWord } from '@/utils/cards'

interface SuccessRateGroupsProps {
    words: SessionWord[]
}

export default function SuccessRateGroups({ words }: SuccessRateGroupsProps) {
    console.log('Received words:', words);

    // Calculate success rate and categorize words
    const wordsWithDifficulty = words.map(word => {
        console.log(`Processing word ${word.id}:`, word);
        
        const totalAttempts = (word.correctAnswers ?? 0) + (word.totalMisses ?? 0);
        const successRate = totalAttempts > 0 
            ? Math.round((word.correctAnswers ?? 0) * 100 / totalAttempts)
            : 100; // If no attempts, consider it easy
            
        console.log(`Word ${word.id} success rate:`, successRate);

        let difficulty;
        if (successRate >= 80) {
                difficulty = "easy";
        } else if (successRate >= 50) {
                difficulty = "medium";
            } else {
                difficulty = "hard";
        }

        return {
            ...word,
            difficulty,
            successRate
        }
    });

    console.log('Words with difficulty:', wordsWithDifficulty);

    const easyWords = wordsWithDifficulty.filter((word) => word.difficulty === "easy")
    const mediumWords = wordsWithDifficulty.filter((word) => word.difficulty === "medium")
    const hardWords = wordsWithDifficulty.filter((word) => word.difficulty === "hard")

    console.log('Categorized words:', {
        easy: easyWords,
        medium: mediumWords,
        hard: hardWords
    });

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-white font-medium mb-2 flex items-center">
                    <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                    Easy ({easyWords.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {easyWords.map((word) => (
                        <div key={word.id} className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 flex items-center">
                            <div className="flex-1 min-w-0">
                                <div className="text-xl font-medium text-white">{word.word}</div>
                                <div className="text-[#A1A1A1]">{word.meaning}</div>
                            </div>
                            <div className="w-32 text-right">
                                <div className="text-sm text-[#A1A1A1] mb-1">
                                    {((word.correctAnswers ?? 0) + (word.totalMisses ?? 0)) > 0 && (
                                        <span className="ml-2">
                                            <span
                                                className="text-white cursor-help relative group"
                                                title={`${word.correctAnswers ?? 0} ✓ ${word.totalMisses ?? 0} ✗`}
                                            >
                                                {word.successRate}%
                                                <span className="invisible group-hover:visible absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[#262626] border border-[#4F4F4F] text-white px-4 py-2 rounded text-base whitespace-nowrap">
                                                    <span className="text-green-400">{word.correctAnswers ?? 0} ✓</span>
                                                    {" "}
                                                    <span className="text-red-400">{word.totalMisses ?? 0} ✗</span>
                                                </span>
                                            </span>
                                        </span>
                                    )}
                                </div>
                                <div className="h-2 bg-[#4F4F4F] rounded-full overflow-hidden">
                                    <div className="h-full bg-green-400" style={{ width: `${word.successRate}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {easyWords.length === 0 && (
                        <div className="text-[#A1A1A1] italic">No words in this category yet</div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-white font-medium mb-2 flex items-center">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                    Medium ({mediumWords.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {mediumWords.map((word) => (
                        <div key={word.id} className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 flex items-center">
                            <div className="flex-1 min-w-0">
                                <div className="text-xl font-medium text-white">{word.word}</div>
                                <div className="text-[#A1A1A1]">{word.meaning}</div>
                            </div>
                            <div className="w-32 text-right">
                                <div className="text-sm text-[#A1A1A1] mb-1">
                                    {((word.correctAnswers ?? 0) + (word.totalMisses ?? 0)) > 0 && (
                                        <span className="ml-2">
                                            <span
                                                className="text-white cursor-help relative group"
                                                title={`${word.correctAnswers ?? 0} ✓ ${word.totalMisses ?? 0} ✗`}
                                            >
                                                {word.successRate}%
                                                <span className="invisible group-hover:visible absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[#262626] border border-[#4F4F4F] text-white px-4 py-2 rounded text-base whitespace-nowrap">
                                                    <span className="text-green-400">{word.correctAnswers ?? 0} ✓</span>
                                                    {" "}
                                                    <span className="text-red-400">{word.totalMisses ?? 0} ✗</span>
                                                </span>
                                            </span>
                                        </span>
                                    )}
                                </div>
                                <div className="h-2 bg-[#4F4F4F] rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400" style={{ width: `${word.successRate}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {mediumWords.length === 0 && (
                        <div className="text-[#A1A1A1] italic">No words in this category yet</div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-white font-medium mb-2 flex items-center">
                    <span className="w-3 h-3 bg-red-400 rounded-full mr-2"></span>
                    Hard ({hardWords.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {hardWords.map((word) => (
                        <div key={word.id} className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 flex items-center">
                            <div className="flex-1 min-w-0">
                                <div className="text-xl font-medium text-white">{word.word}</div>
                                <div className="text-[#A1A1A1]">{word.meaning}</div>
                            </div>
                            <div className="w-32 text-right">
                                <div className="text-sm text-[#A1A1A1] mb-1">
                                    {((word.correctAnswers ?? 0) + (word.totalMisses ?? 0)) > 0 && (
                                        <span className="ml-2">
                                            <span
                                                className="text-white cursor-help relative group"
                                                title={`${word.correctAnswers ?? 0} ✓ ${word.totalMisses ?? 0} ✗`}
                                            >
                                                {word.successRate}%
                                                <span className="invisible group-hover:visible absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[#262626] border border-[#4F4F4F] text-white px-4 py-2 rounded text-base whitespace-nowrap">
                                                    <span className="text-green-400">{word.correctAnswers ?? 0} ✓</span>
                                                    {" "}
                                                    <span className="text-red-400">{word.totalMisses ?? 0} ✗</span>
                                                </span>
                                            </span>
                                        </span>
                                    )}
                                </div>
                                <div className="h-2 bg-[#4F4F4F] rounded-full overflow-hidden">
                                    <div className="h-full bg-red-400" style={{ width: `${word.successRate}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {hardWords.length === 0 && (
                        <div className="text-[#A1A1A1] italic">No words in this category yet</div>
                    )}
                </div>
            </div>
        </div>
    )
} 