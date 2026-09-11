import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import LoadingState from '@/components/LoadingState'
import StreakSection from '@/components/dashboard/StreakSection';
import StatusCounts from '@/components/dashboard/StatusCounts';
import InProgressSteps, { type InProgressStep } from '@/components/dashboard/InProgressSteps';

function buildEmptySeries(days: number): StreakData['series'] {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const out: StreakData['series'] = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setUTCDate(d.getUTCDate() - i);
        out.push({
            day: d.toISOString().slice(0, 10),
            wordsPracticed: 0,
            timeSpentSeconds: 0,
            practiced: false,
        });
    }
    return out;
}

interface StreakData {
    currentStreak: number;
    bestStreak: number;
    series: Array<{ day: string; wordsPracticed: number; timeSpentSeconds: number; practiced: boolean }>;
}

interface StatusCountsData {
    counts: { new: number; learning: number; mastered: number; to_review: number };
    totalWords: number;
}

export default function Dashboard() {
    const router = useRouter();
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [statusCounts, setStatusCounts] = useState<StatusCountsData | null>(null);
    const [inProgress, setInProgress] = useState<InProgressStep[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const [streakRes, countsRes, stepsRes] = await Promise.all([
                    fetch('/api/dashboard/streak?days=30', { credentials: 'include' }),
                    fetch('/api/dashboard/status-counts', { credentials: 'include' }),
                    fetch('/api/dashboard/in-progress-steps', { credentials: 'include' }),
                ]);
                const [streakJson, countsJson, stepsJson] = await Promise.all([
                    streakRes.json(),
                    countsRes.json(),
                    stepsRes.json(),
                ]);
                if (cancelled) return;
                setStreak(streakRes.ok && Array.isArray(streakJson?.series) ? streakJson : null);
                setStatusCounts(countsRes.ok ? countsJson : null);
                setInProgress(stepsRes.ok ? (stepsJson.steps || []) : []);
            } catch (err) {
                console.error('Dashboard load failed:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#181818] px-3 py-4 sm:px-6 sm:py-8 xl:px-12">
            <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Home</h1>

                {loading ? (
                    <LoadingState text="Loading your dashboard" />
                ) : (
                    <>
                        <StreakSection
                            series={streak?.series ?? buildEmptySeries(30)}
                            currentStreak={streak?.currentStreak ?? 0}
                            bestStreak={streak?.bestStreak ?? 0}
                        />
                        {statusCounts && <StatusCounts counts={statusCounts.counts} />}

                        {/* Quick-start practice cards, mirroring the /jalingo hub.
                            Sit directly below the Item progress (status counts)
                            section. Words goes to the words sections; Kanji jumps
                            straight to the frequency quiz steps (skipping the
                            kanji_choice learning-path page). */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div
                                onClick={() => router.push('/home?all=1')}
                                className="bg-[#262626] border border-[#4F4F4F] p-6 sm:p-8 rounded-2xl cursor-pointer hover:bg-[#2F2F2F] transition-colors flex flex-col justify-center items-center text-center"
                            >
                                <h2 className="text-2xl sm:text-3xl font-semibold mb-2 sm:mb-3 text-white">Words</h2>
                                <p className="text-[#A1A1A1] text-base sm:text-lg">Click to explore Japanese words</p>
                            </div>
                            <div
                                onClick={() => router.push('/kanji_freq_sections')}
                                className="bg-[#262626] border border-[#4F4F4F] p-6 sm:p-8 rounded-2xl cursor-pointer hover:bg-[#2F2F2F] transition-colors flex flex-col justify-center items-center text-center"
                            >
                                <h2 className="text-2xl sm:text-3xl font-semibold mb-2 sm:mb-3 text-white">Kanji</h2>
                                <p className="text-[#A1A1A1] text-base sm:text-lg">Click to quiz Japanese kanji</p>
                            </div>
                        </div>

                        <InProgressSteps steps={inProgress} />
                    </>
                )}
            </div>
        </div>
    );
}
