interface StatusCountsProps {
    counts: { new: number; learning: number; mastered: number; to_review: number };
}

const TILES = [
    { key: 'new', label: 'New', color: 'text-[#A1A1A1]' },
    { key: 'learning', label: 'Learning', color: 'text-yellow-400' },
    { key: 'mastered', label: 'Mastered', color: 'text-green-400' },
    { key: 'to_review', label: 'To Review', color: 'text-[#FF0054]' },
] as const;

export default function StatusCounts({ counts }: StatusCountsProps) {
    return (
        <div className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Item progress</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {TILES.map(t => (
                    <div
                        key={t.key}
                        className="bg-[#181818] border border-[#4F4F4F] rounded-lg p-3 sm:p-4 flex flex-col items-center"
                    >
                        <span className={'text-2xl sm:text-3xl font-bold ' + t.color}>{counts[t.key]}</span>
                        <span className="text-sm text-[#A1A1A1] mt-1">{t.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
