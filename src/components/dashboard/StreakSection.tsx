import { Check, X, Flame } from 'lucide-react';

interface DayPoint {
    day: string;
    wordsPracticed: number;
    timeSpentSeconds: number;
    practiced: boolean;
}

interface StreakSectionProps {
    series: DayPoint[];
    currentStreak: number;
    bestStreak: number;
}

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Sun..Sat

const BAR_BASELINE = 100;

export default function StreakSection({ series, currentStreak, bestStreak }: StreakSectionProps) {
    const last7 = series.slice(-7);
    const maxWords = Math.max(0, ...series.map(d => d.wordsPracticed));
    // Bars scale against a baseline of 100 words/day, so a quiet 30-word
    // day looks like a 30% bar against the implicit goal. If any day in
    // the window exceeds 100 the ceiling grows to fit, so a 500-word day
    // fills the bar and the other days re-normalize against 500.
    const barScale = Math.max(BAR_BASELINE, maxWords);
    const totalWords = series.reduce((sum, d) => sum + d.wordsPracticed, 0);

    return (
        <div className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-white">Streak</h3>
                <div className="flex items-center gap-3 sm:gap-6 text-sm">
                    <div className="flex items-center gap-2 text-[#FF0054]">
                        <Flame className="h-4 w-4" />
                        <span>
                            <span className="font-semibold">{currentStreak}</span>
                            <span className="text-[#A1A1A1] ml-1">day streak</span>
                        </span>
                    </div>
                    <div className="text-[#A1A1A1]">
                        Best: <span className="text-white font-semibold">{bestStreak}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-6">
                {last7.map((d, i) => {
                    const date = new Date(d.day + 'T00:00:00Z');
                    const letter = DAY_LETTERS[date.getUTCDay()];
                    const isToday = i === last7.length - 1;
                    return (
                        <div key={d.day} className="flex flex-col items-center gap-2">
                            <span className={'text-xs ' + (isToday ? 'text-white font-semibold' : 'text-[#A1A1A1]')}>
                                {isToday ? 'Today' : letter}
                            </span>
                            <div
                                className={
                                    'w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center ' +
                                    (d.practiced
                                        ? 'bg-[#FF0054] text-white'
                                        : 'bg-[#181818] text-[#4F4F4F] border border-[#4F4F4F]')
                                }
                            >
                                {d.practiced ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div>
                <div className="flex items-center justify-between mb-2 text-xs text-[#A1A1A1]">
                    <span>Words practiced per day · last {series.length} days</span>
                    <span>
                        max bar = {barScale}
                        {maxWords > 0 && <span className="ml-2">· peak {maxWords}</span>}
                    </span>
                </div>
                <div className="flex items-end justify-between gap-1 h-40 sm:h-48">
                    {series.map(d => {
                        const fillPct = (d.wordsPracticed / barScale) * 100;
                        const fillHeight = d.wordsPracticed > 0 ? Math.max(4, fillPct) : 0;
                        return (
                            <div
                                key={d.day}
                                title={`${d.day}: ${d.wordsPracticed} words`}
                                className="group relative flex-1 h-full bg-[#1F1F1F] border border-[#4F4F4F] rounded-t overflow-hidden"
                            >
                                <div
                                    className="absolute bottom-0 inset-x-0 bg-[#FF0054]/70 group-hover:bg-[#FF0054] transition-colors"
                                    style={{ height: `${fillHeight}%` }}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-[#A1A1A1]">
                    <span>{series[0]?.day.slice(5).replace('-', '/')}</span>
                    <span>{series[series.length - 1]?.day.slice(5).replace('-', '/')}</span>
                </div>
                {totalWords === 0 && (
                    <p className="mt-3 text-sm text-[#A1A1A1] text-center">
                        No practice activity yet. Start a session to build your streak.
                    </p>
                )}
            </div>
        </div>
    );
}
