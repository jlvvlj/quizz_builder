import { useRouter } from 'next/router'
import LoadingState from '@/components/LoadingState'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSettingsModal } from '@/components/layout/SettingsContext'

interface Kanji {
    id: number;
    japanese_word: string;
    english: string;
    frequency: number;
}

export default function KanjiFrequencyRoute() {
    const router = useRouter();
    const { isSettingsOpen: showSettings } = useSettingsModal();
    const [kanjis, setKanjis] = useState<Kanji[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Selection state
    const [selectedKanji, setSelectedKanji] = useState<Set<number>>(new Set());
    const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

    // Drag selection state
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null);
    const [dragBaseSelection, setDragBaseSelection] = useState<Set<number>>(new Set());
    const [mouseDownPos, setMouseDownPos] = useState<{ x: number; y: number } | null>(null);
    const [mouseDownKanji, setMouseDownKanji] = useState<{ kanji: Kanji; index: number } | null>(null);
    const DRAG_THRESHOLD = 10; // pixels to move before considering it a drag

    // Refs
    const gridRef = useRef<HTMLDivElement>(null);
    const kanjiRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    useEffect(() => {
        const fetchKanjis = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/kanji/get-all-ordered');
                const data = await response.json();

                if (response.ok && data.kanji) {
                    setKanjis(data.kanji);
                } else {
                    throw new Error(data.error || 'Failed to fetch kanjis');
                }
            } catch (error) {
                console.error('Error fetching kanjis:', error);
                setError('Failed to load kanjis. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchKanjis();
    }, []);

    // Helper function to check if two rectangles intersect
    const rectsIntersect = (
        rect1: { left: number; top: number; right: number; bottom: number },
        rect2: DOMRect
    ): boolean => {
        return !(
            rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom
        );
    };

    // Process a click on a kanji (called when mouseup happens without dragging)
    const processKanjiClick = (kanji: Kanji, index: number, shiftKey: boolean, ctrlKey: boolean) => {
        // Ctrl/Cmd + Click: Toggle single item without clearing others
        if (ctrlKey) {
            setSelectedKanji(prev => {
                const newSet = new Set(prev);
                if (newSet.has(kanji.id)) {
                    newSet.delete(kanji.id);
                } else {
                    newSet.add(kanji.id);
                }
                return newSet;
            });
            setLastClickedIndex(index);
            return;
        }

        // Shift + Click: Range selection from last clicked
        if (shiftKey && lastClickedIndex !== null) {
            const start = Math.min(lastClickedIndex, index);
            const end = Math.max(lastClickedIndex, index);
            setSelectedKanji(prev => {
                const newSet = new Set(prev);
                for (let i = start; i <= end; i++) {
                    newSet.add(kanjis[i].id);
                }
                return newSet;
            });
            return;
        }

        // Simple click: Toggle this kanji without clearing others
        setSelectedKanji(prev => {
            const newSet = new Set(prev);
            if (newSet.has(kanji.id)) {
                newSet.delete(kanji.id);
            } else {
                newSet.add(kanji.id);
            }
            return newSet;
        });
        setLastClickedIndex(index);
    };

    // Handle mousedown on a kanji cell
    const handleKanjiMouseDown = (kanji: Kanji, index: number, event: React.MouseEvent) => {
        event.preventDefault();
        // Store the mousedown position and kanji info
        setMouseDownPos({ x: event.clientX, y: event.clientY });
        setMouseDownKanji({ kanji, index });

        // Store modifier key states for later use
        const ctrlKey = event.ctrlKey || event.metaKey;

        // Keep existing selection as base for potential drag
        if (ctrlKey) {
            setDragBaseSelection(new Set(selectedKanji));
        } else {
            setDragBaseSelection(new Set());
        }
    };

    // Handle click event (for cases where mousedown/mouseup are on the same element)
    const handleKanjiClick = (kanji: Kanji, index: number, event: React.MouseEvent) => {
        // This is handled by mouseup now, prevent default behavior
        event.preventDefault();
        event.stopPropagation();
    };

    const handleMouseMove = useCallback((event: MouseEvent) => {
        // Check if we should start dragging (mouse moved past threshold)
        if (mouseDownPos && !isDragging) {
            const dx = event.clientX - mouseDownPos.x;
            const dy = event.clientY - mouseDownPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > DRAG_THRESHOLD) {
                // Start dragging
                setIsDragging(true);
                setDragStart(mouseDownPos);
                setDragEnd({ x: event.clientX, y: event.clientY });
            }
        }

        // Update drag selection if dragging
        if (isDragging && dragStart) {
            setDragEnd({ x: event.clientX, y: event.clientY });

            // Calculate selection box
            const rect = {
                left: Math.min(dragStart.x, event.clientX),
                top: Math.min(dragStart.y, event.clientY),
                right: Math.max(dragStart.x, event.clientX),
                bottom: Math.max(dragStart.y, event.clientY),
            };

            // Find all kanji cells that intersect with the selection box
            const newSelection = new Set(dragBaseSelection);
            kanjiRefs.current.forEach((element, kanjiId) => {
                const cellRect = element.getBoundingClientRect();
                if (rectsIntersect(rect, cellRect)) {
                    newSelection.add(kanjiId);
                }
            });

            setSelectedKanji(newSelection);
        }
    }, [isDragging, dragStart, dragBaseSelection, mouseDownPos]);

    const handleMouseUp = useCallback((event: MouseEvent) => {
        // If we weren't dragging and we have a mousedown kanji, process as click
        if (!isDragging && mouseDownKanji) {
            const ctrlKey = event.ctrlKey || event.metaKey;
            const shiftKey = event.shiftKey;
            processKanjiClick(mouseDownKanji.kanji, mouseDownKanji.index, shiftKey, ctrlKey);
        }

        // Reset all states
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
        setDragBaseSelection(new Set());
        setMouseDownPos(null);
        setMouseDownKanji(null);
    }, [isDragging, mouseDownKanji]);

    // Add global mouse event listeners for drag
    useEffect(() => {
        // Listen when mousedown has occurred (potential drag or click)
        if (mouseDownPos || isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [mouseDownPos, isDragging, handleMouseMove, handleMouseUp]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Escape: Clear selection
            if (e.key === 'Escape') {
                setSelectedKanji(new Set());
                setLastClickedIndex(null);
            }

            // Ctrl/Cmd + A: Select all kanji
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !showSettings) {
                e.preventDefault();
                setSelectedKanji(new Set(kanjis.map(k => k.id)));
            }

            // Enter: Start session if kanji selected
            if (e.key === 'Enter' && selectedKanji.size > 0 && !showSettings) {
                handleStartSession();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [kanjis, selectedKanji, showSettings]);

    // Start session with selected kanji
    const handleStartSession = () => {
        const selectedKanjiArray = kanjis.filter(k => selectedKanji.has(k.id));

        if (selectedKanjiArray.length === 0) return;

        // Single kanji: use existing single_kanji mode
        if (selectedKanjiArray.length === 1) {
            const kanji = selectedKanjiArray[0];
            const params = new URLSearchParams({
                kanjiChar: kanji.japanese_word,
                kanjiId: kanji.id.toString(),
                title: `${kanji.japanese_word} (${kanji.english})`,
                subtitle: `Words containing ${kanji.japanese_word}`,
                description: `Practice words that use the kanji ${kanji.japanese_word}`,
                mode: 'single_kanji'
            });
            router.push(`/kanji_session?${params.toString()}`);
            return;
        }

        // Multiple kanji: use new multi_kanji mode
        const params = new URLSearchParams({
            kanjiChars: selectedKanjiArray.map(k => k.japanese_word).join(','),
            kanjiIds: selectedKanjiArray.map(k => k.id.toString()).join(','),
            title: selectedKanjiArray.length <= 3
                ? selectedKanjiArray.map(k => k.japanese_word).join(', ')
                : `${selectedKanjiArray.length} Kanji`,
            subtitle: `Words containing selected kanji`,
            description: `Practice words that use ${selectedKanjiArray.length === 1
                ? `the kanji ${selectedKanjiArray[0].japanese_word}`
                : `any of the ${selectedKanjiArray.length} selected kanji`
            }`,
            mode: 'multi_kanji'
        });
        router.push(`/kanji_session?${params.toString()}`);
    };

    // Get frequency level label and color
    const getFrequencyLevel = (frequency: number) => {
        if (frequency <= 100) return { label: 'Essential', color: 'bg-green-500' };
        if (frequency <= 500) return { label: 'Common', color: 'bg-white' };
        if (frequency <= 1000) return { label: 'Intermediate', color: 'bg-yellow-500' };
        return { label: 'Advanced', color: 'bg-purple-500' };
    };

    return (
        <div className="min-h-screen bg-[#181818] flex flex-col">
            <div className="flex-1">
                <main className="px-3 sm:px-6 lg:px-24 py-4 sm:py-6">
                    <div className="bg-[#262626] rounded-lg border border-[#4F4F4F] p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-white">Kanji by Frequency</h2>
                            <p className="text-[#A1A1A1] text-xs sm:text-sm">
                                {selectedKanji.size > 0
                                    ? `${selectedKanji.size} kanji selected`
                                    : 'Tap to select, drag to select multiple'
                                }
                            </p>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                <span className="text-[#A1A1A1]">Essential (1-100)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-white rounded"></div>
                                <span className="text-[#A1A1A1]">Common (101-500)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                <span className="text-[#A1A1A1]">Intermediate (501-1000)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                                <span className="text-[#A1A1A1]">Advanced (1000+)</span>
                            </div>
                        </div>

                        {isLoading ? (
                            <LoadingState text="Loading kanji" />
                        ) : error ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-red-400 text-xl">{error}</div>
                            </div>
                        ) : (
                            <div
                                ref={gridRef}
                                className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 xl:grid-cols-24 gap-2 select-none"
                            >
                                {kanjis.map((kanji, index) => {
                                    const level = getFrequencyLevel(kanji.frequency);
                                    const isSelected = selectedKanji.has(kanji.id);
                                    return (
                                        <div
                                            key={kanji.id}
                                            ref={(el) => {
                                                if (el) kanjiRefs.current.set(kanji.id, el);
                                                else kanjiRefs.current.delete(kanji.id);
                                            }}
                                            onMouseDown={(e) => handleKanjiMouseDown(kanji, index, e)}
                                            className={`relative aspect-square rounded-lg
                                                       flex items-center justify-center cursor-pointer
                                                       transition-all duration-150 group
                                                       ${isSelected
                                                    ? 'bg-[#FF0054]/15 border-2 border-[#FF0054] ring-2 ring-[#FF0054]/30 scale-105 z-10'
                                                    : 'bg-[#2F2F2F] border border-[#4F4F4F] hover:bg-[#3F3F3F] hover:border-[#6F6F6F] hover:scale-110'
                                                }`}
                                            title={`${kanji.japanese_word} - ${kanji.english} (Rank #${kanji.frequency})`}
                                        >
                                            {/* Selection checkmark */}
                                            {isSelected && (
                                                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-[#FF0054] rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Frequency indicator dot */}
                                            <div className={`absolute top-1 right-1 w-2 h-2 ${level.color} rounded-full`}></div>

                                            {/* Kanji character */}
                                            <span className="text-white text-xl sm:text-2xl md:text-3xl font-bold">
                                                {kanji.japanese_word}
                                            </span>

                                            {/* Hover tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1
                                                          bg-[#1a1a1a] border border-[#4F4F4F] rounded text-xs text-white
                                                          opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                                                          whitespace-nowrap z-20">
                                                {kanji.english} (#{kanji.frequency})
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Total count */}
                        {!isLoading && !error && (
                            <div className="mt-6 text-center text-[#A1A1A1] text-sm">
                                {kanjis.length} kanji available
                            </div>
                        )}
                    </div>
                </main>
            </div>


            {/* Floating action bar */}
            {selectedKanji.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-[#262626] border border-[#4F4F4F] rounded-xl shadow-2xl p-4 flex items-center gap-4">
                        {/* Selection count */}
                        <div className="text-white font-medium px-3">
                            <span className="text-[#FF0054] text-lg">{selectedKanji.size}</span>
                            <span className="text-[#A1A1A1] ml-1">kanji selected</span>
                        </div>

                        {/* Divider */}
                        <div className="h-8 w-px bg-[#4F4F4F]" />

                        {/* Start Session button */}
                        <button
                            onClick={handleStartSession}
                            className="bg-[#FF0054] hover:bg-[#e0004a] text-white px-6 py-2.5 rounded-lg
                                       font-medium transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Start Session
                        </button>

                        {/* Clear selection button */}
                        <button
                            onClick={() => {
                                setSelectedKanji(new Set());
                                setLastClickedIndex(null);
                            }}
                            className="bg-[#2F2F2F] hover:bg-[#3F3F3F] text-white px-4 py-2.5 rounded-lg
                                       font-medium transition-colors border border-[#4F4F4F]"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
