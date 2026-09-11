import { createClient } from '@supabase/supabase-js';

// Types
interface StepProgress {
    stepId: number;
    averageProgress: number;
    totalWords: number;
    completedWords: number;
}

interface SectionProgress {
    sectionId: string;
    steps: StepProgress[];
    averageProgress: number;
    totalWords: number;
    completedWords: number;
}

// Initialize Supabase client
const supabaseUrl = 'https://edexrpvrgbyhilxccvzs.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Calculate progress for a single step
 * Progress = percentage of words with progress_status = 'mastered'
 * Uses API endpoint to ensure proper user_id filtering
 */
export async function calculateStepProgress(section: string, step: string, quizType: string = 'multiple_choice', content: 'words' | 'kanji_freq' | 'words_tubelex' | 'kanji_primitives' = 'words'): Promise<{ averageProgress: number }> {
    try {
        const endpoint = content === 'kanji_primitives' ? 'step-progress-kanji-primitives' : content === 'kanji_freq' ? 'step-progress-kanji-freq' : content === 'words_tubelex' ? 'step-progress-words-tubelex' : 'step-progress';
        const response = await fetch(`/api/progress/${endpoint}?section=${section}&step=${step}&quizType=${quizType}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to calculate step progress');
        }

        const data = await response.json();
        return { averageProgress: data.progress };
    } catch (error) {
        console.error('Error calculating step progress:', error);
        throw error;
    }
}

/**
 * Calculate progress for an entire section
 * Progress = percentage of words with progress_status = 'mastered' across all steps
 * Uses API endpoint to ensure proper user_id filtering
 */
export async function calculateSectionProgress(section: string, quizType: string = 'multiple_choice', content: 'words' | 'kanji_freq' | 'words_tubelex' | 'kanji_primitives' = 'words'): Promise<SectionProgress> {
    try {
        const endpoint = content === 'kanji_primitives' ? 'section-progress-kanji-primitives' : content === 'kanji_freq' ? 'section-progress-kanji-freq' : content === 'words_tubelex' ? 'section-progress-words-tubelex' : 'section-progress';
        const response = await fetch(`/api/progress/${endpoint}?section=${section}&quizType=${quizType}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to calculate section progress');
        }

        const data = await response.json();
        
        return {
            sectionId: section,
            steps: [],
            averageProgress: data.progress,
            totalWords: data.totalWords,
            completedWords: data.masteredCount
        };
    } catch (error) {
        console.error('Error calculating section progress:', error);
        throw error;
    }
}

// Removed: getWordProgress (queried a non-existent `words` table) and
// updateWordProgressStatus (queried + updated `user_progress` with no
// user_id filter — when more than one user had a row for the same word_id
// it would read an arbitrary row and write the computed status back to
// every user's row, corrupting cross-user data).
// progress_status is now computed and persisted exclusively in
// /api/progress/save.ts as part of each save.

/**
 * Calculate and update the progress status for a kanji
 */
export async function updateKanjiProgressStatus(kanjiId: number): Promise<void> {
    try {
        // Get the user ID from cookies
        const cookies = document.cookie.split(';');
        const userIdCookie = cookies.find(c => c.trim().startsWith('userId='));
        const userId = userIdCookie ? userIdCookie.split('=')[1].trim() : 'anonymous';

        // Get the kanji's progress data
        const { data: progressData, error: progressError } = await supabase
            .from('kanji_progress')
            .select('progress, total_misses, correct_answers')
            .eq('kanji_id', kanjiId)
            .eq('user_id', userId)
            .single();

        if (progressError) throw progressError;
        if (!progressData) return;

        // Calculate success rate
        const totalAttempts = progressData.correct_answers + progressData.total_misses;
        const successRate = totalAttempts > 0 
            ? (progressData.correct_answers / totalAttempts) * 100 
            : 0;

        // Determine the new status
        let newStatus: 'new' | 'learning' | 'mastered' | 'to_review';

        if (totalAttempts === 0) {
            newStatus = 'new';
        } else if (progressData.progress >= 100 && successRate >= 80) {
            newStatus = 'mastered';
        } else if (progressData.progress >= 50 || successRate >= 50) {
            newStatus = 'learning';
        } else {
            newStatus = 'to_review';
        }

        // Update the kanji's progress status
        const { error: updateError } = await supabase
            .from('kanji_progress')
            .update({ progress_status: newStatus })
            .eq('kanji_id', kanjiId)
            .eq('user_id', userId);

        if (updateError) throw updateError;
    } catch (error) {
        console.error('Error updating kanji progress status:', error);
        throw error;
    }
}

// Removed testProgressStatus dev hook — it depended on
// updateWordProgressStatus, which is gone.
