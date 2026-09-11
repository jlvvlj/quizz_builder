import { useRouter } from 'next/router';
import { Play } from 'lucide-react';

export interface InProgressStep {
    section: string;
    step: string;
    sectionLabel: string;
    stepLabel: string;
    totalWords: number;
    startedWords: number;
    masteredWords: number;
    progressPercent: number;
    timeSpentSeconds: number;
}

interface InProgressStepsProps {
    steps: InProgressStep[];
}

function formatTime(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const m = Math.floor(seconds / 60);
    if (m < 60) return `${m}m ${Math.round(seconds % 60)}s`;
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
}

function StepCard({ s, onStart }: { s: InProgressStep; onStart: (s: InProgressStep) => void }) {
    return (
        <div className="bg-[#181818] border border-[#4F4F4F] rounded-lg p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3">
                <div className="min-w-0">
                    <h4 className="text-white font-semibold text-sm sm:text-base">
                        {s.sectionLabel} — {s.stepLabel}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#A1A1A1] mt-0.5">
                        {s.startedWords}/{s.totalWords} started · {formatTime(s.timeSpentSeconds)}
                    </p>
                </div>
                <button
                    onClick={() => onStart(s)}
                    className="bg-[#FF0054] hover:bg-[#e0004a] text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 shrink-0 transition-colors text-sm sm:text-base"
                >
                    <Play className="w-4 h-4" />
                    Start
                </button>
            </div>
            <div className="h-2 bg-[#262626] rounded-full overflow-hidden">
                <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${s.progressPercent}%` }}
                />
            </div>
            <div className="flex justify-between mt-1 text-xs text-[#A1A1A1]">
                <span>{s.progressPercent}%</span>
                <span>
                    {s.masteredWords} mastered
                </span>
            </div>
        </div>
    );
}

export default function InProgressSteps({ steps }: InProgressStepsProps) {
    const router = useRouter();

    const handleStart = (s: InProgressStep) => {
        const params = new URLSearchParams({
            section: s.section,
            step: s.step,
            title: 'Study Session',
            subtitle: 'Words in this session',
            description: "These are the words you'll practice in this session.",
        });
        router.push(`/session_preview_results?${params.toString()}`);
    };

    // Split the steps endpoint into the two groups the user expects, and
    // drop 0% cards — they were cluttering the list with steps the user
    // had barely touched. "Completed" = progressPercent >= 100 (every word
    // averaged to 100% progress), mirrors the /home section grouping.
    const inProgress = steps.filter(s => s.progressPercent > 0 && s.progressPercent < 100);
    const completed = steps.filter(s => s.progressPercent >= 100);

    if (inProgress.length === 0 && completed.length === 0) {
        return (
            <div className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-white mb-2">In progress</h3>
                <p className="text-[#A1A1A1] text-sm">
                    No steps started yet. Pick a course to begin.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {inProgress.length > 0 && (
                <div className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        In progress
                        <span className="ml-2 text-sm font-normal text-[#A1A1A1]">
                            {inProgress.length}
                        </span>
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                        {inProgress.map(s => (
                            <StepCard key={`${s.section}-${s.step}`} s={s} onStart={handleStart} />
                        ))}
                    </div>
                </div>
            )}

            {completed.length > 0 && (
                <div className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Completed
                        <span className="ml-2 text-sm font-normal text-[#A1A1A1]">
                            {completed.length}
                        </span>
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                        {completed.map(s => (
                            <StepCard key={`${s.section}-${s.step}`} s={s} onStart={handleStart} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
