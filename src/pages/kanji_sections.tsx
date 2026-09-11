import { Play } from "lucide-react"
import { useRouter } from 'next/router'
import CircularProgress from '../components/CircularProgress'
import { calculateSectionProgress } from '../utils/progress-calculator'
import { useState, useEffect } from 'react'
import { useSettingsModal } from '@/components/layout/SettingsContext'

interface KanjiPageProps {
    onSectionSelect: (sectionId: number) => void
    onSettingsClick: () => void
}

interface SectionProgress {
    [key: string]: number;
}

const sections = [
    {
        id: 1,
        title: "Japanese Kanji 100",
        items: 100,
        sentences: 100,
        users: "9,823",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 2,
        title: "Japanese Kanji 200",
        items: 100,
        sentences: 100,
        users: "8,679",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 3,
        title: "Japanese Kanji 300",
        items: 100,
        sentences: 100,
        users: "7,970",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 4,
        title: "Japanese Kanji 400",
        items: 100,
        sentences: 100,
        users: "7,463",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 5,
        title: "Japanese Kanji 500",
        items: 100,
        sentences: 100,
        users: "6,815",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 6,
        title: "Japanese Kanji 600",
        items: 100,
        sentences: 100,
        users: "6,339",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 7,
        title: "Japanese Kanji 700",
        items: 100,
        sentences: 100,
        users: "5,906",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 8,
        title: "Japanese Kanji 800",
        items: 100,
        sentences: 100,
        users: "5,435",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 9,
        title: "Japanese Kanji 900",
        items: 100,
        sentences: 100,
        users: "5,103",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 10,
        title: "Japanese Kanji 1000",
        items: 100,
        sentences: 100,
        users: "4,824",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 11,
        title: "Japanese Kanji 1100",
        items: 100,
        sentences: 100,
        users: "4,523",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 12,
        title: "Japanese Kanji 1200",
        items: 100,
        sentences: 100,
        users: "4,279",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 13,
        title: "Japanese Kanji 1300",
        items: 100,
        sentences: 100,
        users: "3,970",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 14,
        title: "Japanese Kanji 1400",
        items: 100,
        sentences: 100,
        users: "3,763",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 15,
        title: "Japanese Kanji 1500",
        items: 100,
        sentences: 100,
        users: "3,515",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 16,
        title: "Japanese Kanji 1600",
        items: 100,
        sentences: 100,
        users: "3,239",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 17,
        title: "Japanese Kanji 1700",
        items: 100,
        sentences: 100,
        users: "3,006",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 18,
        title: "Japanese Kanji 1800",
        items: 100,
        sentences: 100,
        users: "2,835",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 19,
        title: "Japanese Kanji 1900",
        items: 100,
        sentences: 100,
        users: "2,603",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 20,
        title: "Japanese Kanji 2000",
        items: 100,
        sentences: 100,
        users: "2,424",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 21,
        title: "Japanese Kanji 2100",
        items: 100,
        sentences: 100,
        users: "2,215",
        image: "/placeholder.svg?height=80&width=80",
    },
    {
        id: 22,
        title: "Japanese Kanji 2200",
        items: 100,
        sentences: 100,
        users: "2,003",
        image: "/placeholder.svg?height=80&width=80",
    },
]

// Wrap the KanjiPage component in a route component
export default function KanjiRoute() {
    const router = useRouter();
    const { openSettings } = useSettingsModal();

    const handleSectionSelect = (sectionId: number) => {
        console.log('Kanji section selected:', sectionId);
        const section = `kanji_section_${sectionId}`;
        const params = new URLSearchParams({
            section: section,
            title: 'Kanji Study Session',
            subtitle: 'Kanji in this session',
            description: 'These are the kanji you\'ll practice in this session.'
        });
        router.push(`/kanji_session?${params.toString()}`);
    }

    return (
        <div className="min-h-screen bg-[#181818] flex flex-col">
            <KanjiPage
                onSectionSelect={handleSectionSelect}
                onSettingsClick={openSettings}
            />
        </div>
    );
}

// Main KanjiPage component
export function KanjiPage({ onSectionSelect, onSettingsClick }: KanjiPageProps) {
    const router = useRouter()
    const [sectionProgress, setSectionProgress] = useState<SectionProgress>({});

    // Calculate progress for each section
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const progressPromises = sections.map(section => 
                    calculateSectionProgress(`kanji_section_${section.id}`)
                        .then(sectionData => ({ id: section.id, progress: sectionData.averageProgress }))
                        .catch(error => {
                            console.error(`Error fetching progress for kanji section ${section.id}:`, error);
                            return { id: section.id, progress: 0 };
                        })
                );

                const progressResults = await Promise.all(progressPromises);
                const progressData = progressResults.reduce((acc, { id, progress }) => {
                    acc[`kanji_section_${id}`] = progress;
                    return acc;
                }, {} as SectionProgress);

                setSectionProgress(progressData);
            } catch (error) {
                console.error('Error fetching progress:', error);
            }
        };

        fetchProgress();
    }, []);

    const handleSectionClick = (sectionId: number) => {
        console.log('Kanji section clicked:', sectionId);
        onSectionSelect(sectionId);
    }

    const handleReviewClick = async (e: React.MouseEvent, sectionId: number) => {
        e.stopPropagation(); // Prevent triggering the section click
        console.log('Review clicked for kanji section:', sectionId);
        
        try {
            // Fetch kanji marked for review
            const response = await fetch(`/api/kanji/get-review-kanji?section=kanji_section_${sectionId}`);
            const data = await response.json();
            
            if (!response.ok) {
                console.error('API error:', data.error);
                throw new Error(data.error || 'Failed to fetch review kanji');
            }
            
            const { kanji } = data;
            console.log('Received review kanji:', kanji?.length || 0);
            
            if (!kanji || kanji.length === 0) {
                alert('No kanji marked for review in this section.');
                return;
            }

            // Navigate to session preview with the review kanji
            const params = new URLSearchParams({
                section: `kanji_section_${sectionId}`,
                title: 'Kanji Review Session',
                subtitle: 'Kanji marked for review',
                description: 'These are the kanji you\'ve marked for review in this section.',
                practicedKanjiIds: kanji.map((k: any) => k.id).join(',')
            });
            
            const url = `/kanji_session_preview?${params.toString()}`;
            console.log('Navigating to:', url);
            router.push(url);
        } catch (error) {
            console.error('Error starting kanji review session:', error);
            alert('Failed to start kanji review session. Please try again.');
        }
    }

    return (
        <div className="flex-1">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 w-full">
                <div className="bg-[#262626] rounded-lg border border-[#4F4F4F] p-4 sm:p-6">
                    {/* Title Section */}
                    <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Japanese Kanji Series</h2>
                        <button className="bg-[#FF0054] hover:bg-[#e0004a] text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base shrink-0">
                            Add All
                        </button>
                    </div>

                    {/* Courses Section */}
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Courses</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {sections.map((section) => (
                                <div
                                    key={section.id}
                                    onClick={() => handleSectionClick(section.id)}
                                    className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-3 sm:p-4 transition-colors hover:bg-[#2F2F2F] cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <img
                                            src={section.image || "/placeholder.svg"}
                                            alt={section.title}
                                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg bg-[#2F2F2F] shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-white mb-1 text-sm sm:text-base truncate">{section.title}</h4>
                                            <div className="text-xs sm:text-sm text-[#A1A1A1] mb-1">
                                                <span>{section.items} Kanji</span>
                                                <span className="mx-2">•</span>
                                                <span className="hidden sm:inline">{section.sentences} Example Sentences</span>
                                                <span className="sm:hidden">{section.sentences} ex.</span>
                                            </div>
                                            <span className="inline-block bg-[#1F1F1F] border border-[#4F4F4F] text-[#A1A1A1] text-xs px-2 py-0.5 sm:py-1 rounded">
                                                Intermediate
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                                            <CircularProgress
                                                progress={sectionProgress[`kanji_section_${section.id}`] || 0}
                                                size={45}
                                                className="text-white hidden sm:block"
                                            />
                                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                                <button
                                                    onClick={(e) => handleReviewClick(e, section.id)}
                                                    className="bg-[#2F2F2F] border border-[#4F4F4F] hover:bg-[#363636] text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors"
                                                >
                                                    Review
                                                </button>
                                                <button className="bg-[#FF0054] hover:bg-[#e0004a] text-white p-1.5 sm:p-2 rounded-full transition-colors">
                                                    <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
} 