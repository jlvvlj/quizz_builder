export interface StepProgressRecord {
    progress?: number | null;
}

export interface CalculatedStepProgress {
    progress: number;
    masteredCount: number;
}

/**
 * Step progress is the rounded average of per-word progress (0..100).
 * Missing progress records are treated as 0.
 */
export function calculateStepProgressFromRecords(
    totalWords: number,
    records: StepProgressRecord[],
    masteredCount: number
): CalculatedStepProgress {
    if (totalWords <= 0) {
        return { progress: 0, masteredCount: 0 };
    }

    const totalProgress = records.reduce((sum, record) => {
        const value = typeof record.progress === 'number' ? record.progress : 0;
        return sum + Math.max(0, Math.min(100, value));
    }, 0);

    const progress = Math.round(totalProgress / totalWords);
    return { progress, masteredCount };
}
