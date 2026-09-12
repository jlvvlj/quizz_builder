"use client"

import { Play } from "lucide-react"
import CircularProgress from './CircularProgress'
import { calculateStepProgress } from '../utils/progress-calculator'
import { useQuizType } from '../utils/quiz-mode'
import { useState, useEffect, useMemo } from 'react'

interface StepsPageProps {
    onCourseSelect: (stepId: number, section: string, step: string) => void
    onSettingsClick: () => void
    currentSection: string
    // 'kanji_freq' reuses this page for the frequency kanji quiz: same steps grid,
    // but kanji-by-frequency copy, kanji-freq progress, and content threaded into
    // the session URL. Defaults to the words quiz (unchanged).
    content?: 'words' | 'kanji_freq' | 'words_tubelex'
    // The last kanji section is partial, so it may have fewer than 10 steps.
    numSteps?: number
    actualSteps?: {id:number;items:number}[]
    deckTitle?: string
    deckDescription?: string
}

interface StepProgress {
    [key: string]: number;
}

export default function StepsPage({ onCourseSelect, onSettingsClick, currentSection, content = 'words', numSteps = 10, actualSteps, deckTitle, deckDescription }: StepsPageProps) {
    const [stepProgress, setStepProgress] = useState<StepProgress>({});
    // Show the progress for the input mode the user is currently in: typing and
    // multiple-choice each track their own score. Reactive so changing Quiz Mode
    // in settings refetches without a full page reload.
    const quizType = useQuizType();
    const isKanji = content === 'kanji_freq';
    const isTubelex = content === 'words_tubelex';

    // Extract the section number for display
    const sectionNumber = currentSection.replace('section_', '');
    const itemNoun = deckTitle ? 'items' : isKanji ? 'kanji' : 'words';
    const rankStart = (parseInt(sectionNumber) - 1) * 1000 + 1;
    const rankEnd = parseInt(sectionNumber) * 1000;
    const sectionTitle = deckTitle || (isKanji
        ? `Kanji by Frequency ${rankStart}–${rankEnd}`
        : isTubelex
        ? `Words by Frequency ${rankStart}–${rankEnd}`
        : `Japanese Core ${sectionNumber}000`);

    // Generate steps for this section. Memoized so its identity is stable across
    // renders (otherwise the progress effect below would refetch every render).
    const steps = useMemo(() => (
        actualSteps ? actualSteps.map(s => ({...s,sentences:0,users:'',image:''})) : Array.from({ length: numSteps }, (_, i) => ({
            id: i + 1,
            items: 100,
            sentences: 100,
            users: (3000 + (parseInt(sectionNumber) * 100) + (i * 50)).toLocaleString(),
            image: `https://placehold.co/80x80/e2e8f0/1e293b?text=Step+${i + 1}`,
        }))
    ), [sectionNumber, numSteps, actualSteps]);

    // Calculate progress for each step.
    // useQuizType() starts at its 'multiple_choice' default and only corrects to
    // the real mode after mount, so this effect fires twice on load (MC then the
    // real type). The `cancelled` guard ensures a stale fetch (the superseded
    // quiz type) can never overwrite the latest one — otherwise the two
    // concurrent fetches race and the displayed numbers flip on every refresh.
    useEffect(() => {
        let cancelled = false;
        const fetchProgress = async () => {
            try {
                const progressPromises = steps.map(step =>
                    calculateStepProgress(currentSection, `step_${step.id}`, quizType, content)
                        .then(stepData => ({ id: step.id, progress: stepData.averageProgress }))
                        .catch(error => {
                            console.error(`Error fetching progress for step ${step.id}:`, error);
                            return { id: step.id, progress: 0 };
                        })
                );

                const progressResults = await Promise.all(progressPromises);
                if (cancelled) return;
                const progressData = progressResults.reduce((acc, { id, progress }) => {
                    acc[`step_${id}`] = progress;
                    return acc;
                }, {} as StepProgress);

                setStepProgress(progressData);
            } catch (error) {
                console.error('Error fetching progress:', error);
            }
        };

        fetchProgress();
        return () => { cancelled = true; };
    }, [currentSection, steps, quizType, content]);

    const handleStepClick = async (stepId: number) => {
        console.log('Step clicked:', { stepId, currentSection });
        const step = `step_${stepId}`;

        // No bulk progress_status recompute here anymore — it used to call
        // updateWordProgressStatus per word, which had no user_id filter
        // and would overwrite every user's row for each word_id.
        // progress_status is now maintained by /api/progress/save.ts on
        // each save, which is the single source of truth.

        onCourseSelect(stepId, currentSection, step);
        // Navigate to session_preview_results with title and text props
        const params = new URLSearchParams({
            section: currentSection,
            step: step,
            title: 'Study Session',
            subtitle: deckTitle || (isKanji ? 'Kanji in this session' : 'Items in this session'),
            description: deckDescription || (isKanji
                ? 'These are the kanji you\'ll practice in this session.'
                : 'These are the items you\'ll practice in this session.')
        });
        if (isKanji) params.set('content', 'kanji_freq');
        else if (isTubelex) params.set('content', 'words_tubelex');
        window.location.href = `/session_preview_results?${params.toString()}`;
    };

    return (
        <div className="min-h-screen bg-[#181818] flex flex-col">

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 w-full">
                <div className="bg-[#262626] rounded-lg border border-[#4F4F4F] p-4 sm:p-6">
                    {/* Title Section */}
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">{sectionTitle}</h2>
                    </div>

                    {/* Description Section */}
                    <div className="flex gap-6 mb-6 sm:mb-8">
                        <div className="flex-1 text-sm sm:text-base">
                            <div className="mb-2">
                                <span className="text-[#A1A1A1]">Category </span>
                                <span className="font-medium text-white">{sectionTitle}</span>
                            </div>
                            <div className="mb-2 text-[#A1A1A1] flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1">
                                <span><span>Level: </span><span className="font-medium text-white">Practice</span></span>
                                <span><span>Items: </span><span className="font-medium text-white">{steps.reduce((n,s)=>n+s.items,0)}</span></span>
                            </div>
                            {deckDescription ? <p className="text-[#A1A1A1] mb-2">{deckDescription}</p> : isKanji ? (
                                <p className="text-[#A1A1A1] mb-2">
                                    Kanji reading questions ranked {rankStart}–{rankEnd} by frequency of use in Japanese.
                                </p>
                            ) : (
                                <>
                                    <p className="text-[#A1A1A1] mb-2">
                                        The Japanese Core {sectionNumber}000 covers the {sectionNumber}th 1,000 most commonly used words in Japanese.
                                    </p>
                                    <p className="text-[#A1A1A1] mb-2 hidden sm:block">
                                        We recommend you first read our{" "}
                                        <a href="#" className="text-[#FF0054] hover:underline">
                                            Guide to Japanese
                                        </a>
                                        . This will explain the basics of inputting Japanese.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Steps Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                onClick={() => handleStepClick(step.id)}
                                className="bg-[#181818] border border-[#4F4F4F] rounded-lg p-4 sm:p-6 cursor-pointer hover:bg-[#2F2F2F] transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Step {step.id}</h3>
                                        <div className="space-y-1 sm:space-y-2">
                                            <p className="text-[#A1A1A1] text-sm sm:text-base">{step.items} {itemNoun}</p>
                                            {!deckTitle && !isKanji && (
                                                <p className="text-[#A1A1A1] text-sm sm:text-base">{step.sentences} example sentences</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 sm:gap-4 shrink-0">
                                        <CircularProgress
                                            progress={stepProgress[`step_${step.id}`] || 0}
                                            size={50}
                                            strokeWidth={6}
                                            progressColor="#FF0054"
                                            backgroundColor="#262626"
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStepClick(step.id);
                                            }}
                                            className="bg-[#262626] border border-[#4F4F4F] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#2F2F2F] transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                                        >
                                            <Play className="w-4 h-4" />
                                            Start
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
