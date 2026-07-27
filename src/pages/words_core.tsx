"use client"

import { Play } from "lucide-react"
import { useRouter } from 'next/router'
import CircularProgress from '../components/CircularProgress'
import { calculateSectionProgress } from '../utils/progress-calculator'
import { useQuizType } from '../utils/quiz-mode'
import { useState, useEffect } from 'react'
import { useSettingsModal } from '@/components/layout/SettingsContext'

interface HomePageProps {
    onSectionSelect: (sectionId: number) => void
    onSettingsClick: () => void
}

interface SectionProgress {
    [key: string]: number;
}

const sections = [
    {
        id: 1,
        title: "Japanese Core 1000",
        items: 100,
        sentences: 108,
        users: "9,123",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 2,
        title: "Japanese Core 2000",
        items: 100,
        sentences: 105,
        users: "4,679",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 3,
        title: "Japanese Core 3000",
        items: 100,
        sentences: 108,
        users: "4,270",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 4,
        title: "Japanese Core 4000",
        items: 100,
        sentences: 115,
        users: "3,963",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 5,
        title: "Japanese Core 5000",
        items: 100,
        sentences: 100,
        users: "3,815",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 6,
        title: "Japanese Core 6000",
        items: 100,
        sentences: 101,
        users: "3,639",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 7,
        title: "Japanese Core 7000",
        items: 100,
        sentences: 100,
        users: "3,506",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 8,
        title: "Japanese Core 8000",
        items: 100,
        sentences: 100,
        users: "3,435",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 9,
        title: "Japanese Core 9000",
        items: 100,
        sentences: 100,
        users: "3,403",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 10,
        title: "Japanese Core 10000",
        items: 100,
        sentences: 102,
        users: "3,424",
        image: "/placeholder.svg?height=80&width=80",
    },
]

// Wrap the HomePage component in a route component
export default function HomeRoute() {
    const router = useRouter();
    const { openSettings } = useSettingsModal();

    const handleSectionSelect = (sectionId: number) => {
        console.log('Section selected:', sectionId);
        const section = `section_${sectionId}`;
        router.push(`/steps?section=${section}`);
    }

    return (
        <div className="min-h-screen bg-[#181818] flex flex-col">
            <HomePage
                onSectionSelect={handleSectionSelect}
                onSettingsClick={openSettings}
            />
        </div>
    );
}

// Move the HomePage component to a separate export
export function HomePage({ onSectionSelect, onSettingsClick }: HomePageProps) {
    const router = useRouter()
    const [sectionProgress, setSectionProgress] = useState<SectionProgress>({});
    // Reflect the input mode the user is currently in: typing and multiple-choice
    // each track their own progress score. Reactive so changing Quiz Mode in
    // settings refetches without a full page reload.
    const quizType = useQuizType();

    // Calculate progress for each section. Guard against a superseded quiz-type
    // fetch overwriting the latest one if the mode changes mid-session.
    useEffect(() => {
        let cancelled = false;
        const fetchProgress = async () => {
            try {
                const progressPromises = sections.map(section =>
                    calculateSectionProgress(`section_${section.id}`, quizType)
                        .then(sectionData => ({ id: section.id, progress: sectionData.averageProgress }))
                        .catch(error => {
                            console.error(`Error fetching progress for section ${section.id}:`, error);
                            return { id: section.id, progress: 0 };
                        })
                );

                const progressResults = await Promise.all(progressPromises);
                if (cancelled) return;
                const progressData = progressResults.reduce((acc, { id, progress }) => {
                    acc[`section_${id}`] = progress;
                    return acc;
                }, {} as SectionProgress);

                setSectionProgress(progressData);
            } catch (error) {
                console.error('Error fetching progress:', error);
            }
        };

        fetchProgress();
        return () => { cancelled = true; };
    }, [quizType]);

    const handleSectionClick = (sectionId: number) => {
        console.log('Section clicked:', sectionId);
        onSectionSelect(sectionId);
    }

    const handleReviewClick = async (e: React.MouseEvent, sectionId: number) => {
        e.stopPropagation(); // Prevent triggering the section click
        console.log('Review clicked for section:', sectionId);
        
        try {
            // Fetch words marked for review
            const response = await fetch(`/api/words/get-review-words?section=section_${sectionId}`);
            const data = await response.json();
            
            if (!response.ok) {
                console.error('API error:', data.error);
                throw new Error(data.error || 'Failed to fetch review words');
            }
            
            const { words } = data;
            console.log('Received review words:', words?.length || 0);
            
            if (!words || words.length === 0) {
                alert('No words marked for review in this section.');
                return;
            }

            // Navigate to session preview with the review words
            const params = new URLSearchParams({
                section: `section_${sectionId}`,
                title: 'Review Session',
                subtitle: 'Words marked for review',
                description: 'These are the words you\'ve marked for review in this section.',
                practicedWordIds: words.map((w: any) => w.id).join(',')
            });
            
            const url = `/session_preview_results?${params.toString()}`;
            console.log('Navigating to:', url);
            router.push(url);
        } catch (error) {
            console.error('Error starting review session:', error);
            alert('Failed to start review session. Please try again.');
        }
    }

    const renderSectionCard = (section: typeof sections[number]) => (
        <div
            key={section.id}
            onClick={() => handleSectionClick(section.id)}
            className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 sm:p-6 cursor-pointer hover:bg-[#2F2F2F] transition-colors"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2 truncate">{section.title}</h3>
                    <div className="space-y-1 sm:space-y-2">
                        <p className="text-[#A1A1A1] text-sm sm:text-base">{section.items} words</p>
                        <p className="text-[#A1A1A1] text-sm sm:text-base">{section.sentences} example sentences</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-3 sm:gap-4 shrink-0">
                    <CircularProgress
                        progress={sectionProgress[`section_${section.id}`] || 0}
                        size={50}
                        strokeWidth={6}
                        progressColor="#FF0054"
                        backgroundColor="#181818"
                    />
                    <button
                        onClick={(e) => handleReviewClick(e, section.id)}
                        className="bg-[#181818] border border-[#4F4F4F] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#2F2F2F] transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                    >
                        <Play className="w-4 h-4" />
                        Review
                    </button>
                </div>
            </div>
        </div>
    );

    // The Quizz flow (/jalingo → Words → /home?all=1) browses every course.
    // The Courses sidebar link (/home) intentionally hides 0%-progress
    // sections so in-progress courses aren't buried.
    const showAll = router.query.all === '1';

    const inProgressSections = sections.filter(s => {
        const p = sectionProgress[`section_${s.id}`] || 0;
        return p > 0 && p < 100;
    });
    const completedSections = sections.filter(
        s => (sectionProgress[`section_${s.id}`] || 0) >= 100,
    );
    const hasAnyProgress = inProgressSections.length > 0 || completedSections.length > 0;

    return (
        <div className="flex-1 px-3 py-4 sm:px-6 sm:py-8 xl:px-12">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex justify-between items-center mb-4 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Japanese Core</h1>
                    {/* Back to the main (TUBELEX-frequency) words deck. */}
                    <button
                        onClick={() => router.push('/home')}
                        className="bg-[#262626] border border-[#4F4F4F] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#2F2F2F] transition-colors text-sm sm:text-base whitespace-nowrap"
                    >
                        Words by frequency
                    </button>
                </div>

                {showAll && (
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                            {sections.map(renderSectionCard)}
                        </div>
                    </section>
                )}

                {!showAll && !hasAnyProgress && (
                    <div className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-6 text-center">
                        <p className="text-white font-medium mb-1">No courses started yet</p>
                        <p className="text-[#A1A1A1] text-sm">
                            Pick a section from the sidebar to start practicing — your courses in
                            progress and completed ones will show up here.
                        </p>
                    </div>
                )}

                {!showAll && inProgressSections.length > 0 && (
                    <section className="mb-6 sm:mb-10">
                        <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                            In Progress
                            <span className="ml-2 text-sm font-normal text-[#A1A1A1]">
                                {inProgressSections.length}
                            </span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                            {inProgressSections.map(renderSectionCard)}
                        </div>
                    </section>
                )}

                {!showAll && completedSections.length > 0 && (
                    <section>
                        <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                            Completed
                            <span className="ml-2 text-sm font-normal text-[#A1A1A1]">
                                {completedSections.length}
                            </span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                            {completedSections.map(renderSectionCard)}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
