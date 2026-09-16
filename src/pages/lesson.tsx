"use client"

import LoadingState from '@/components/LoadingState';
import { useCatalog } from '@/utils/catalog';
import { getLesson } from '@/utils/lessons';
import { ProbabilitySourceLesson } from '@/components/ProbabilitySourceCourse';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock3,
    Lightbulb,
    Play,
    Target,
    XCircle,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

export default function LessonPage() {
    const router = useRouter();
    const { sections, error: catalogError } = useCatalog();
    const [activeIndex, setActiveIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});

    const sectionId = typeof router.query.section === 'string' ? router.query.section : '';
    const deckId = typeof router.query.deck === 'string' ? router.query.deck : '';
    const stepId = typeof router.query.step === 'string' ? router.query.step : '';
    const section = sections?.find((item) => item.id === sectionId);
    const lesson = useMemo(() => getLesson(deckId, stepId), [deckId, stepId]);

    useEffect(() => {
        setActiveIndex(0);
        setAnswers({});
    }, [deckId, stepId]);

    if (catalogError) {
        return <p role="alert" className="p-6 text-red-400">{catalogError}</p>;
    }

    if (!router.isReady || !sections) {
        return <LoadingState text="Loading lesson" />;
    }

    if (section && deckId === 'probability-chapter-1' && section.deck.id === deckId) {
        return <ProbabilitySourceLesson sectionId={sectionId} itemId={typeof router.query.item === 'string' ? router.query.item : undefined} />;
    }

    if (!section || !lesson) {
        return (
            <main className="min-h-screen bg-[#181818] px-4 py-10 text-white">
                <div className="mx-auto max-w-2xl rounded-2xl border border-[#4F4F4F] bg-[#262626] p-8 text-center">
                    <BookOpen className="mx-auto mb-4 h-9 w-9 text-[#FF0054]" />
                    <h1 className="text-2xl font-bold">Lesson unavailable</h1>
                    <p className="mt-2 text-[#A1A1A1]">This topic does not have a guided lesson yet.</p>
                    <button
                        onClick={() => router.push(`/steps?section=${encodeURIComponent(sectionId)}`)}
                        className="mt-6 rounded-lg bg-[#FF0054] px-5 py-2.5 font-semibold text-white hover:bg-[#e6004c]"
                    >
                        Back to topics
                    </button>
                </div>
            </main>
        );
    }

    const isCheckScreen = activeIndex === lesson.concepts.length;
    const completedChecks = lesson.quickChecks.filter((check, index) => answers[index] === check.correctAnswer).length;
    const answeredChecks = Object.keys(answers).length;
    const progress = Math.round(((activeIndex + 1) / lesson.concepts.length) * 100);
    const concept = lesson.concepts[Math.min(activeIndex, lesson.concepts.length - 1)];

    const startQuiz = () => {
        const params = new URLSearchParams({
            section: sectionId,
            step: stepId,
            title: 'Study Session',
            subtitle: lesson.title,
            description: lesson.introduction,
        });
        window.location.href = `/session_preview_results?${params.toString()}`;
    };

    return (
        <main className="min-h-screen bg-[#181818] px-3 py-5 text-white sm:px-6 sm:py-8">
            <div className="mx-auto max-w-6xl">
                <button
                    onClick={() => router.push(`/steps?section=${encodeURIComponent(sectionId)}`)}
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#A1A1A1] hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to topics
                </button>

                <section className="overflow-hidden rounded-2xl border border-[#4F4F4F] bg-[#262626]">
                    <header className="border-b border-[#4F4F4F] p-5 sm:p-8">
                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#FF0054]/10 px-3 py-1 text-sm font-semibold text-[#FF4B86]">
                                    <BookOpen className="h-4 w-4" /> Guided lesson
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{lesson.title}</h1>
                                <p className="mt-2 text-lg text-[#D1D1D1]">{lesson.subtitle}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2 rounded-lg border border-[#4F4F4F] bg-[#181818] px-3 py-2 text-sm text-[#D1D1D1]">
                                <Clock3 className="h-4 w-4 text-[#FF4B86]" />
                                About {lesson.durationMinutes} min
                            </div>
                        </div>
                        <p className="mt-5 max-w-3xl leading-7 text-[#B8B8B8]">{lesson.introduction}</p>

                        <div className="mt-5 rounded-xl border border-[#414141] bg-[#202020] p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#FF4B86]">What you’ll learn</p>
                            <ul className="mt-3 grid gap-2 text-sm text-[#D1D1D1] md:grid-cols-3">
                                {lesson.objectives.map((objective) => (
                                    <li key={objective} className="flex gap-2 leading-5">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FF4B86]" />
                                        {objective}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-6">
                            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#A1A1A1]">
                                <span>{isCheckScreen ? 'Quick check' : `Concept ${activeIndex + 1} of ${lesson.concepts.length}`}</span>
                                <span>{isCheckScreen ? 'Ready to practise' : `${progress}%`}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-[#181818]">
                                <div
                                    className="h-full rounded-full bg-[#FF0054] transition-all duration-300"
                                    style={{ width: `${isCheckScreen ? 100 : progress}%` }}
                                />
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
                        <aside className="min-w-0 border-b border-[#4F4F4F] p-4 lg:border-b-0 lg:border-r">
                            <p className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-[#7F7F7F]">Lesson map</p>
                            <nav aria-label="Lesson concepts" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
                                {lesson.concepts.map((item, index) => (
                                    <button
                                        key={item.title}
                                        onClick={() => setActiveIndex(index)}
                                        className={`min-w-[190px] rounded-lg px-3 py-3 text-left text-sm transition-colors lg:min-w-0 ${
                                            activeIndex === index
                                                ? 'bg-[#FF0054] font-semibold text-white'
                                                : index < activeIndex
                                                ? 'bg-[#333333] text-white hover:bg-[#3A3A3A]'
                                                : 'text-[#A1A1A1] hover:bg-[#303030] hover:text-white'
                                        }`}
                                    >
                                        <span className="mr-2 opacity-70">{index + 1}.</span>{item.title}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setActiveIndex(lesson.concepts.length)}
                                    className={`min-w-[190px] rounded-lg px-3 py-3 text-left text-sm transition-colors lg:min-w-0 ${
                                        isCheckScreen
                                            ? 'bg-[#FF0054] font-semibold text-white'
                                            : 'text-[#A1A1A1] hover:bg-[#303030] hover:text-white'
                                    }`}
                                >
                                    <span className="mr-2 opacity-70">✓</span>Quick check
                                </button>
                            </nav>
                        </aside>

                        <div className="min-w-0 p-5 sm:p-8 lg:p-10">
                            {!isCheckScreen ? (
                                <article key={concept.title} className="animate-overlay-in">
                                    <h2 className="text-2xl font-bold sm:text-3xl">{concept.title}</h2>
                                    {concept.definition && (
                                        <blockquote className="mt-5 border-l-2 border-[#FF0054] pl-4 text-base font-medium leading-7 text-white sm:text-lg">
                                            {concept.definition}
                                        </blockquote>
                                    )}
                                    <p className="mt-4 max-w-3xl text-base leading-7 text-[#D1D1D1] sm:text-lg">{concept.explanation}</p>

                                    {concept.formula && (
                                        <div className="mt-6 overflow-x-auto rounded-xl border border-[#FF0054]/40 bg-[#181818] px-5 py-4 font-mono text-base text-[#FF80AA] sm:text-lg">
                                            {concept.formula}
                                        </div>
                                    )}

                                    <section className="mt-7 rounded-xl border border-[#4F4F4F] bg-[#1D1D1D] p-5 sm:p-6">
                                        <div className="flex items-center gap-3">
                                            <span className="rounded-lg bg-[#FF0054]/15 p-2 text-[#FF4B86]">
                                                <Lightbulb className="h-5 w-5" />
                                            </span>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-[#FF4B86]">Real-life example</p>
                                                <h3 className="mt-0.5 text-xl font-semibold">{concept.example.title}</h3>
                                            </div>
                                        </div>
                                        <p className="mt-4 leading-7 text-[#C8C8C8]">{concept.example.situation}</p>
                                        {concept.example.table && (
                                            <div className="mt-5 overflow-x-auto rounded-lg border border-[#4F4F4F]">
                                                <table className="w-full text-left text-sm leading-6">
                                                    <caption className="sr-only">{concept.example.title}: values used in the example</caption>
                                                    <thead className="bg-[#303030] text-white">
                                                        <tr>{concept.example.table.columns.map((column) => (
                                                            <th key={column} scope="col" className="px-4 py-3 font-semibold">{column}</th>
                                                        ))}</tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#4F4F4F] text-[#D8D8D8]">
                                                        {concept.example.table.rows.map((row, rowIndex) => (
                                                            <tr key={rowIndex}>{row.map((cell, cellIndex) => (
                                                                <td key={cellIndex} className="px-4 py-3">{cell}</td>
                                                            ))}</tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        <ol className="mt-5 space-y-3">
                                            {concept.example.walkthrough.map((step, index) => (
                                                <li key={step} className="flex gap-3 text-[#D8D8D8]">
                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#343434] text-sm font-bold text-white">{index + 1}</span>
                                                    <span className="pt-0.5 leading-6">{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                        <div className="mt-5 rounded-lg bg-[#2B2B2B] px-4 py-3 font-medium leading-6 text-white">
                                            {concept.example.result}
                                        </div>
                                    </section>

                                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                                            <div className="flex items-center gap-2 font-semibold text-emerald-300">
                                                <Target className="h-5 w-5" /> Remember
                                            </div>
                                            <p className="mt-2 leading-6 text-[#D1D1D1]">{concept.remember}</p>
                                        </div>
                                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                                            <div className="flex items-center gap-2 font-semibold text-amber-300">
                                                <AlertTriangle className="h-5 w-5" /> Common mistake
                                            </div>
                                            <p className="mt-2 leading-6 text-[#D1D1D1]">{concept.commonMistake}</p>
                                        </div>
                                    </div>
                                </article>
                            ) : (
                                <section className="animate-overlay-in">
                                    <h2 className="text-2xl font-bold sm:text-3xl">Check your understanding</h2>
                                    <p className="mt-3 text-[#B8B8B8]">Choose an answer, then read the explanation before starting the quiz.</p>

                                    <div className="mt-7 space-y-6">
                                        {lesson.quickChecks.map((check, checkIndex) => {
                                            const selected = answers[checkIndex];
                                            const isAnswered = Boolean(selected);
                                            const isCorrect = selected === check.correctAnswer;
                                            return (
                                                <div key={check.prompt} className="rounded-xl border border-[#4F4F4F] bg-[#1D1D1D] p-5 sm:p-6">
                                                    <h3 className="text-lg font-semibold">{checkIndex + 1}. {check.prompt}</h3>
                                                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                                        {check.options.map((option) => {
                                                            const selectedOption = selected === option;
                                                            const correctOption = isAnswered && option === check.correctAnswer;
                                                            const wrongOption = selectedOption && option !== check.correctAnswer;
                                                            return (
                                                                <button
                                                                    key={option}
                                                                    onClick={() => setAnswers((current) => ({ ...current, [checkIndex]: option }))}
                                                                    className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                                                                        correctOption
                                                                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-100'
                                                                            : wrongOption
                                                                            ? 'border-red-500 bg-red-500/10 text-red-100'
                                                                            : 'border-[#4F4F4F] bg-[#292929] text-[#D1D1D1] hover:border-[#777777] hover:text-white'
                                                                    }`}
                                                                >
                                                                    {option}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {isAnswered && (
                                                        <div className={`mt-4 flex gap-3 rounded-lg p-3 ${isCorrect ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                                                            {isCorrect ? (
                                                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                                                            ) : (
                                                                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                                                            )}
                                                            <p className="leading-6 text-[#D8D8D8]">
                                                                <span className="font-semibold text-white">{isCorrect ? 'Correct. ' : `The answer is ${check.correctAnswer}. `}</span>
                                                                {check.explanation}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-8 rounded-xl border border-[#4F4F4F] bg-[#181818] p-5 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="font-semibold">{answeredChecks < lesson.quickChecks.length ? 'Answer both questions when you are ready.' : `${completedChecks} of ${lesson.quickChecks.length} correct`}</p>
                                            <p className="mt-1 text-sm text-[#A1A1A1]">You can review any concept from the lesson map.</p>
                                        </div>
                                        <button
                                            onClick={startQuiz}
                                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF0054] px-5 py-3 font-semibold text-white hover:bg-[#e6004c] sm:mt-0 sm:w-auto"
                                        >
                                            <Play className="h-4 w-4 fill-current" /> Start quiz
                                        </button>
                                    </div>
                                </section>
                            )}

                            <div className="mt-9 flex items-center justify-between border-t border-[#4F4F4F] pt-6">
                                <button
                                    onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
                                    disabled={activeIndex === 0}
                                    className="inline-flex items-center gap-2 rounded-lg border border-[#4F4F4F] px-4 py-2.5 font-medium text-white hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Previous
                                </button>
                                {!isCheckScreen && (
                                    <button
                                        onClick={() => setActiveIndex((index) => Math.min(lesson.concepts.length, index + 1))}
                                        className="inline-flex items-center gap-2 rounded-lg bg-[#FF0054] px-5 py-2.5 font-semibold text-white hover:bg-[#e6004c]"
                                    >
                                        {activeIndex === lesson.concepts.length - 1 ? 'Quick check' : 'Next concept'}
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
