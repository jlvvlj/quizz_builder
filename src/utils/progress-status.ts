export const PROGRESS_STATUSES = ['new', 'learning', 'mastered', 'to_review'] as const;

export type ProgressStatus = typeof PROGRESS_STATUSES[number];

export const MARKABLE_PROGRESS_CONTENTS = [
    'words',
    'sentences',
    'words_tubelex',
    'kanji_freq',
    'kanji_primitives',
] as const;

export type MarkableProgressContent = typeof MARKABLE_PROGRESS_CONTENTS[number];

export interface ProgressStatusRecord {
    progress_status?: string | null;
    marked_as?: string | null;
}

export const PROGRESS_TARGETS: Record<MarkableProgressContent, {
    table: string;
    idColumn: 'word_id' | 'item_id';
    conflictColumns: string;
}> = {
    words: {
        table: 'user_progress',
        idColumn: 'word_id',
        conflictColumns: 'user_id,word_id,quiz_type',
    },
    sentences: {
        table: 'user_progress',
        idColumn: 'word_id',
        conflictColumns: 'user_id,word_id,quiz_type',
    },
    words_tubelex: {
        table: 'words_tubelex_progress',
        idColumn: 'word_id',
        conflictColumns: 'user_id,word_id,quiz_type',
    },
    kanji_freq: {
        table: 'kanji_quiz_item_progress',
        idColumn: 'item_id',
        conflictColumns: 'user_id,item_id,quiz_type',
    },
    kanji_primitives: {
        table: 'kanji_primitive_item_progress',
        idColumn: 'item_id',
        conflictColumns: 'user_id,item_id,quiz_type',
    },
};

export function isProgressStatus(value: unknown): value is ProgressStatus {
    return typeof value === 'string' && PROGRESS_STATUSES.includes(value as ProgressStatus);
}

export function isMarkableProgressContent(value: unknown): value is MarkableProgressContent {
    return typeof value === 'string'
        && MARKABLE_PROGRESS_CONTENTS.includes(value as MarkableProgressContent);
}

export function effectiveProgressStatus(record?: ProgressStatusRecord | null): ProgressStatus {
    if (isProgressStatus(record?.marked_as)) return record.marked_as;
    if (isProgressStatus(record?.progress_status)) return record.progress_status;
    return 'new';
}
