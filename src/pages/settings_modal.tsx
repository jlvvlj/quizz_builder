"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { KEYBOARD_SOUNDS, DEFAULT_KEYBOARD_SOUND, playKeyClick, preloadKeyboardSound } from "@/utils/audio"
import { setQuizMode } from "@/utils/quiz-mode"

interface SettingsModalProps {
    onClose: () => void
    onSettingsChange?: () => void
}

const parseSessionSize = (value: string) => Math.max(1, parseInt(value, 10) || 1)

export default function SettingsModal({ onClose, onSettingsChange }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState("general")
    const [settings, setSettings] = useState({
        autoAdvance: true,
        audioAutoPlay: true,
        playCorrectAnswerAudio: false,
        showPhrase: false,
        darkMode: false,
        largeText: false,
        dailyReminders: true,
        weeklyProgress: true,
        sessionSize: 7,
        showFurigana: false,
        quizDirection: 'forward' as 'forward' | 'reverse' | 'mixed',
        timerDuration: 3,
        answerChoices: 3,
        kanjiFrequencySource: 'default' as 'default' | 'appearance' | 'jpdb',
        quizMode: 'multiple-choice' as 'multiple-choice' | 'typing',
        keyboardSound: DEFAULT_KEYBOARD_SOUND
    })

    // Load settings from database on mount
    useEffect(() => {
        async function loadSettings() {
            try {
                const response = await fetch('/api/settings/get', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error('Failed to load settings');
                }
                const data = await response.json();
                // quizMode + keyboardSound are persisted client-side (localStorage) until a DB column exists.
                let quizMode: 'multiple-choice' | 'typing' = 'multiple-choice';
                let keyboardSound = DEFAULT_KEYBOARD_SOUND;
                if (typeof window !== 'undefined') {
                    const stored = window.localStorage.getItem('quizMode');
                    if (stored === 'typing' || stored === 'multiple-choice') quizMode = stored;
                    const ks = window.localStorage.getItem('keyboardSound');
                    if (ks) keyboardSound = ks;
                }
                setSettings({ ...data, quizMode, keyboardSound });
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
        loadSettings();
    }, [])

    // Update settings in database when they change
    const updateSettings = async (key: keyof typeof settings, value: boolean | number | string) => {
        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)

        // quizMode lives in localStorage only (no DB column yet) — persist and skip the API.
        // setQuizMode also fires the quizModeChange event so progress views in
        // this tab refetch the right dimension without a full page reload.
        if (key === 'quizMode') {
            setQuizMode(value === 'typing' ? 'typing' : 'multiple-choice');
            onSettingsChange?.();
            return;
        }

        // keyboardSound is also client-side. Persist, warm the pack, and play a
        // one-key preview so you hear the choice immediately.
        if (key === 'keyboardSound') {
            const id = String(value);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('keyboardSound', id);
            }
            preloadKeyboardSound(id);
            playKeyClick(id);
            onSettingsChange?.();
            return;
        }

        try {
            const response = await fetch('/api/settings/update', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newSettings)
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

        // Notify parent component that settings have changed
            onSettingsChange?.();
        } catch (error) {
            console.error('Failed to update settings:', error);
        }
    }

    const handleSave = () => {
        // Notify parent that settings have changed
        onSettingsChange?.();
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-[#181818] z-50 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-[#4F4F4F] overflow-x-auto items-stretch">
                <button
                    className={`px-3 sm:px-4 py-3 text-sm sm:text-lg whitespace-nowrap ${activeTab === "general" ? "text-[#FF0054] border-b-2 border-[#FF0054]" : "text-white opacity-70"
                        }`}
                    onClick={() => setActiveTab("general")}
                >
                    <span className="sm:hidden">General</span><span className="hidden sm:inline">General Settings</span>
                </button>
                <button
                    className={`px-3 sm:px-4 py-3 text-sm sm:text-lg whitespace-nowrap ${activeTab === "audio" ? "text-[#FF0054] border-b-2 border-[#FF0054]" : "text-white opacity-70"
                        }`}
                    onClick={() => setActiveTab("audio")}
                >
                    <span className="sm:hidden">Audio</span><span className="hidden sm:inline">Audio Settings</span>
                </button>
                <button
                    className={`px-3 sm:px-4 py-3 text-sm sm:text-lg whitespace-nowrap ${activeTab === "quiz" ? "text-[#FF0054] border-b-2 border-[#FF0054]" : "text-white opacity-70"
                        }`}
                    onClick={() => setActiveTab("quiz")}
                >
                    <span className="sm:hidden">Quiz</span><span className="hidden sm:inline">Quiz Settings</span>
                </button>
                <button
                    className={`px-3 sm:px-4 py-3 text-sm sm:text-lg whitespace-nowrap ${activeTab === "japanese" ? "text-[#FF0054] border-b-2 border-[#FF0054]" : "text-white opacity-70"
                        }`}
                    onClick={() => setActiveTab("japanese")}
                >
                    <span className="sm:hidden">Japanese</span><span className="hidden sm:inline">Japanese Study Modes</span>
                </button>
                <button
                    className={`px-3 sm:px-4 py-3 text-sm sm:text-lg whitespace-nowrap ${activeTab === "shortcut" ? "text-[#FF0054] border-b-2 border-[#FF0054]" : "text-white opacity-70"
                        }`}
                    onClick={() => setActiveTab("shortcut")}
                >
                    <span className="sm:hidden">Keys</span><span className="hidden sm:inline">Shortcut Keys</span>
                </button>
                <button onClick={onClose} className="ml-auto px-3 sm:px-4 text-white opacity-70 hover:opacity-100 sticky right-0 bg-[#181818]">
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                {activeTab === "general" && (
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="bg-[#262626] rounded-lg p-4 sm:p-6 border border-[#4F4F4F]">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-medium text-lg text-white mb-3">Study</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-white">
                                            <span>New words per session</span>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={settings.sessionSize}
                                                    onChange={(e) => setSettings((current) => ({
                                                        ...current,
                                                        sessionSize: parseSessionSize(e.target.value)
                                                    }))}
                                                    onBlur={(e) => updateSettings('sessionSize', parseSessionSize(e.target.value))}
                                                    className="w-20 px-2 py-1 bg-[#181818] border border-[#4F4F4F] rounded text-center text-white"
                                                />
                                                <span className="text-sm text-[#A1A1A1]">words</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-white">
                                            <span>Auto-advance</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={settings.autoAdvance}
                                                    onChange={(e) => updateSettings('autoAdvance', e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-[#181818] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#181818] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#4F4F4F] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF0054]"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between text-white">
                                            <span>Audio auto-play</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={settings.audioAutoPlay}
                                                    onChange={(e) => updateSettings('audioAutoPlay', e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-[#181818] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#181818] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#4F4F4F] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF0054]"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between text-white">
                                            <span>Show example sentence after answer</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={settings.showPhrase}
                                                    onChange={(e) => updateSettings('showPhrase', e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-[#181818] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#181818] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#4F4F4F] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF0054]"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-lg text-white mb-3">Display</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-white">
                                            <span>Dark mode</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer"
                                                    checked={settings.darkMode}
                                                    onChange={(e) => updateSettings('darkMode', e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-[#181818] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#181818] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#4F4F4F] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF0054]"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between text-white">
                                            <span>Large text</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer"
                                                    checked={settings.largeText}
                                                    onChange={(e) => updateSettings('largeText', e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-[#181818] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#181818] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#4F4F4F] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF0054]"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-lg text-white mb-3">Notifications</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-white">
                                            <span>Daily reminders</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer"
                                                    checked={settings.dailyReminders}
                                                    onChange={(e) => updateSettings('dailyReminders', e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-[#181818] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#181818] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#4F4F4F] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF0054]"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between text-white">
                                            <span>Weekly progress</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer"
                                                    checked={settings.weeklyProgress}
                                                    onChange={(e) => updateSettings('weeklyProgress', e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-[#181818] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#181818] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#4F4F4F] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF0054]"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "quiz" && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-[#262626] rounded-lg p-4 sm:p-6 border border-[#4F4F4F]">
                            <h3 className="font-medium text-lg text-white mb-6">Quiz Settings</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-white">
                                    <div>
                                        <span>Quiz Direction</span>
                                        <p className="text-sm text-[#A1A1A1] mt-1">Choose which language to show as the question</p>
                                    </div>
                                    <select
                                        value={settings.quizDirection}
                                        onChange={(e) => updateSettings('quizDirection', e.target.value)}
                                        className="bg-[#181818] border border-[#4F4F4F] text-white rounded px-3 py-2"
                                    >
                                        <option value="forward">Japanese → English</option>
                                        <option value="reverse">English → Japanese</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between text-white">
                                    <div>
                                        <span>Kanji frequency order</span>
                                        <p className="text-sm text-[#A1A1A1] mt-1">Choose the sequence used for kanji quiz sections</p>
                                    </div>
                                    <select
                                        value={settings.kanjiFrequencySource}
                                        onChange={(e) => updateSettings('kanjiFrequencySource', e.target.value)}
                                        className="bg-[#181818] border border-[#4F4F4F] text-white rounded px-3 py-2"
                                    >
                                        <option value="default">Default</option>
                                        <option value="appearance">Kanji ranked by appearance</option>
                                        <option value="jpdb">Anime &amp; manga</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between text-white">
                                    <div>
                                        <span>Timer duration</span>
                                        <p className="text-sm text-[#A1A1A1] mt-1">Time limit to answer each question</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max="15"
                                            value={settings.timerDuration}
                                            onChange={(e) => updateSettings('timerDuration', Math.max(1, Math.min(15, parseInt(e.target.value) || 1)))}
                                            className="w-20 px-2 py-1 bg-[#181818] border border-[#4F4F4F] rounded text-center text-white"
                                        />
                                        <span className="text-sm text-[#A1A1A1]">seconds</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-white">
                                    <div>
                                        <span>Answer choices</span>
                                        <p className="text-sm text-[#A1A1A1] mt-1">Number of options shown for each question</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="number"
                                            min="2"
                                            max="6"
                                            value={settings.answerChoices}
                                            onChange={(e) => updateSettings('answerChoices', Math.max(2, Math.min(6, parseInt(e.target.value) || 2)))}
                                            className="w-20 px-2 py-1 bg-[#181818] border border-[#4F4F4F] rounded text-center text-white"
                                        />
                                        <span className="text-sm text-[#A1A1A1]">choices</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-white">
                                    <div>
                                        <span>Quiz Mode</span>
                                        <p className="text-sm text-[#A1A1A1] mt-1">Multiple choice answers, or type the hiragana yourself</p>
                                    </div>
                                    <select
                                        value={settings.quizMode}
                                        onChange={(e) => updateSettings('quizMode', e.target.value)}
                                        className="bg-[#181818] border border-[#4F4F4F] text-white rounded px-3 py-2"
                                    >
                                        <option value="multiple-choice">Multiple choice</option>
                                        <option value="typing">Typing (hiragana)</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between text-white">
                                    <div>
                                        <span>Keyboard sound</span>
                                        <p className="text-sm text-[#A1A1A1] mt-1">Per-keystroke sound in typing mode (plays a preview on change)</p>
                                    </div>
                                    <select
                                        value={settings.keyboardSound}
                                        onChange={(e) => updateSettings('keyboardSound', e.target.value)}
                                        className="bg-[#181818] border border-[#4F4F4F] text-white rounded px-3 py-2"
                                    >
                                        {KEYBOARD_SOUNDS.map(s => (
                                            <option key={s.id} value={s.id}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "audio" && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-[#262626] rounded-lg p-4 sm:p-6 border border-[#4F4F4F]">
                            <h3 className="font-medium text-lg text-white mb-6">Audio Settings</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-white">
                                    <span>Auto-play audio</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={settings.audioAutoPlay}
                                            onChange={(e) => updateSettings('audioAutoPlay', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-[#181818] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#181818] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#4F4F4F] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF0054]"></div>
                                    </label>
                                </div>
                                <div className="flex items-start justify-between text-white gap-4">
                                    <div className="min-w-0">
                                        <div>Play the answer word on a correct answer</div>
                                        <div className="text-sm text-[#A1A1A1] mt-1">
                                            Plays the other-side audio when you answer correctly (JA→EN plays the English word; EN→JA plays the Japanese word).
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={settings.playCorrectAnswerAudio}
                                            onChange={(e) => updateSettings('playCorrectAnswerAudio', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-[#181818] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#181818] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#4F4F4F] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF0054]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "japanese" && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-[#262626] rounded-lg p-4 sm:p-6 border border-[#4F4F4F]">
                            <h3 className="font-medium text-lg text-white mb-6">Japanese Study Modes</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-white">
                                    <span>Show Furigana</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={settings.showFurigana}
                                            onChange={(e) => updateSettings('showFurigana', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-[#181818] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#181818] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#4F4F4F] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF0054]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "shortcut" && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-[#262626] rounded-lg p-4 sm:p-6 border border-[#4F4F4F]">
                            <h3 className="font-medium text-lg text-white mb-6">Keyboard Shortcuts</h3>
                            <div className="space-y-4 text-white">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>Next card:</div>
                                    <div className="text-[#A1A1A1]">→ or Space</div>
                                    <div>Previous card:</div>
                                    <div className="text-[#A1A1A1]">←</div>
                                    <div>Answer 1:</div>
                                    <div className="text-[#A1A1A1]">1 or N</div>
                                    <div>Answer 2:</div>
                                    <div className="text-[#A1A1A1]">2 or E</div>
                                    <div>Answer 3:</div>
                                    <div className="text-[#A1A1A1]">3 or I</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Save button */}
            <div className="flex justify-end p-4 border-t border-[#4F4F4F] pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <button
                    onClick={handleSave}
                    className="bg-[#262626] border border-[#4F4F4F] text-white px-6 py-2 rounded-xl hover:bg-[#2F2F2F] transition-colors"
                >
                    Save Changes
                </button>
            </div>
        </div>
    )
}
