import React from "react";

export type LoadingStateVariant = "page" | "inline";

interface LoadingStateProps {
    /** Primary text shown directly beneath the animated icon. */
    text?: string;
    /** Optional smaller line shown under the primary text. */
    subText?: string;
    /** "page" fills the available space and centers; "inline" is compact for in-list use. */
    variant?: LoadingStateVariant;
    /** Extra classes for the outer wrapper. */
    className?: string;
}

/**
 * A single, polished loading indicator used everywhere across the app.
 *
 * Design: a softly glowing white dual-arc spinner with a gentle pulsing core,
 * and a short label beneath it. Replaces the old bare "Loading..." / "No words
 * available" page text. Built purely from the existing Tailwind animation
 * system (animate-spin / animate-ping + the overlay-in keyframe) — no extra
 * dependencies.
 */
export default function LoadingState({
    text = "Loading",
    subText,
    variant = "page",
    className = "",
}: LoadingStateProps) {
    const isInline = variant === "inline";
    const ringSize = isInline ? "h-10 w-10" : "h-20 w-20 sm:h-24 sm:w-24";

    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className={[
                "flex flex-col items-center justify-center gap-6 text-center animate-overlay-in",
                isInline ? "py-8" : "flex-1 min-h-[70vh] w-full px-6",
                className,
            ].join(" ")}
        >
            <div
                className={`relative ${ringSize} [filter:drop-shadow(0_0_10px_rgba(255,255,255,0.35))]`}
            >
                {/* Static faint track */}
                <div className="absolute inset-0 rounded-full border-[3px] border-white/10" />
                {/* Spinning white arc */}
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-white border-r-white animate-spin [animation-duration:0.85s]" />
                {/* Counter-rotating inner arc for depth */}
                <div className="absolute inset-[6px] rounded-full border-2 border-transparent border-b-white/60 animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
                {/* Soft pulsing core */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="absolute h-2.5 w-2.5 rounded-full bg-white opacity-75 animate-ping" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <p
                    className={`font-semibold tracking-wide text-white ${
                        isInline ? "text-base" : "text-xl sm:text-2xl"
                    }`}
                >
                    {text}
                </p>
                {subText && (
                    <p className="text-[#A1A1A1] text-sm">{subText}</p>
                )}
            </div>

            <span className="sr-only">Loading</span>
        </div>
    );
}
