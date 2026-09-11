import type { SessionWord } from '@/utils/cards'

interface DifficultyGroupsProps {
    words: SessionWord[]
}

export default function DifficultyGroups({ words }: DifficultyGroupsProps) {
    console.log('Received words:', words);

    // Only process words that have timing data
    const wordsWithDifficulty = words.map(word => {
        console.log(`Processing word ${word.id}:`, word);
        let difficulty;
        
        // Check if timeToAnswer exists and is a number
        if (typeof word.timeToAnswer !== 'number') {
            console.log(`Word ${word.id} has no timing data:`, word.timeToAnswer);
            difficulty = "hard"; // Default to hard if no timing data
        } else {
            const timeToAnswer = word.timeToAnswer;
            console.log(`Word ${word.id} time:`, timeToAnswer);

            if (timeToAnswer <= 1) {
                difficulty = "easy";
            } else if (timeToAnswer <= 2) {
                difficulty = "medium";
            } else {
                difficulty = "hard";
            }
        }

        return {
            ...word,
            difficulty
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
                                    {word.timeToAnswer?.toFixed(1)}s
                                </div>
                                <div className="h-2 bg-[#4F4F4F] rounded-full overflow-hidden">
                                    <div className="h-full bg-green-400" style={{ width: `${word.progress}%` }}></div>
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
                                    {word.timeToAnswer?.toFixed(1)}s
                                </div>
                                <div className="h-2 bg-[#4F4F4F] rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400" style={{ width: `${word.progress}%` }}></div>
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
                                    {word.timeToAnswer?.toFixed(1)}s
                                </div>
                                <div className="h-2 bg-[#4F4F4F] rounded-full overflow-hidden">
                                    <div className="h-full bg-red-400" style={{ width: `${word.progress}%` }}></div>
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
