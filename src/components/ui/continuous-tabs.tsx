"use client";

import { useState, useEffect, useSyncExternalStore, useId, useRef, type FC, type ReactNode } from "react";
import { motion, LayoutGroup } from "motion/react";

/* ---------- Types ---------- */
export interface TabItem {
    id: string;
    label: string;
    /** Optional leading icon rendered before the label. */
    icon?: ReactNode;
}

interface ContinuousTabsProps {
    tabs: TabItem[];
    defaultActiveId?: string;
    /** Controlled active id — overrides internal state when provided */
    activeId?: string;
    onChange?: (id: string) => void;
    /** Auto-focus the active pill button on mount */
    autoFocus?: boolean;
    /**
     * Visual scale. "sm" (default) is the compact toolbar variant used across
     * the session pages; "md" is the larger prominent variant.
     */
    size?: "sm" | "md";
    className?: string;
}

const SIZE: Record<"sm" | "md", { nav: string; btn: string; text: string; gap: string }> = {
    md: { nav: "gap-1 p-1.5", btn: "px-6 py-2.5", text: "text-sm sm:text-base", gap: "gap-2" },
    sm: { nav: "gap-0.5 p-1", btn: "px-3 sm:px-4 py-1.5", text: "text-xs sm:text-sm", gap: "gap-1.5" },
};

export const ContinuousTabs: FC<ContinuousTabsProps> = ({
    tabs,
    defaultActiveId,
    activeId,
    onChange,
    autoFocus = false,
    size = "sm",
    className = "",
}) => {
    const sz = SIZE[size];
    const [internalActive, setInternalActive] = useState<string>(
        defaultActiveId ?? tabs[0]?.id ?? "",
    );
    const isMounted = useSyncExternalStore(() => () => {}, () => true, () => false);
    const activeBtnRef = useRef<HTMLButtonElement>(null);
    // Per-instance layout id so sibling ContinuousTabs don't bridge their
    // active pill across each other.
    const instanceId = useId();
    const pillLayoutId = `active-pill-${instanceId}`;


    // Controlled mode: prefer `activeId` when provided
    const active = activeId !== undefined ? activeId : internalActive;

    useEffect(() => {
        if (!isMounted || !autoFocus) return;
        const t = setTimeout(() => activeBtnRef.current?.focus(), 50);
        return () => clearTimeout(t);
    }, [isMounted, autoFocus]);

    const handleChange = (id: string) => {
        if (activeId === undefined) setInternalActive(id);
        onChange?.(id);
    };

    if (!isMounted) return null;

    return (
        <LayoutGroup>
            <nav
                className={`relative inline-flex items-center rounded-full bg-[#2F2F2F] border border-[#4F4F4F] ${sz.nav} ${className}`}
            >
                {tabs.map((tab) => {
                    const isActive = active === tab.id;

                    return (
                        <button
                            key={tab.id}
                            ref={isActive ? activeBtnRef : undefined}
                            type="button"
                            onClick={() => handleChange(tab.id)}
                            className={`relative rounded-full outline-none ${sz.btn}`}
                        >
                            {/* Active pill */}
                            {isActive && (
                                <motion.div
                                    layoutId={pillLayoutId}
                                    transition={{
                                        type: "spring",
                                        stiffness: 380,
                                        damping: 30,
                                        mass: 0.9,
                                    }}
                                    className="absolute inset-0 rounded-full bg-[#FF0054]"
                                />
                            )}

                            {/* Text */}
                            <motion.span
                                layout="position"
                                className={`relative z-10 inline-flex items-center justify-center ${sz.gap} ${sz.text} font-medium whitespace-nowrap transition-colors duration-200 ${
                                    isActive
                                        ? "text-white"
                                        : "text-[#A1A1A1] hover:text-white"
                                }`}
                            >
                                {tab.icon != null && (
                                    <span className="inline-flex shrink-0 [&_svg]:size-3.5">
                                        {tab.icon}
                                    </span>
                                )}
                                {tab.label}
                            </motion.span>
                        </button>
                    );
                })}
            </nav>
        </LayoutGroup>
    );
};

export default ContinuousTabs;
