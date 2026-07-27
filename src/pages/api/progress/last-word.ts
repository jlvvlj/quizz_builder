import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { effectiveProgressStatus } from '@/utils/progress-status';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('\n=== /api/progress/next-words API CALLED ===');
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userId = req.cookies.userId;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });
        const { section, step, sessionSize, quizType: rawQuizType } = req.query;
        // Next-word selection is per quiz type: each type advances words by its
        // own progress. Defaults to multiple_choice for legacy callers.
        const quizType = typeof rawQuizType === 'string' && rawQuizType ? rawQuizType : 'multiple_choice';

        console.log('User:', userId);
        console.log('Quiz type:', quizType);
        console.log('Section:', section);
        console.log('Step:', step);
        console.log('Session size:', sessionSize);

        if (!section || !step) {
            return res.status(400).json({ error: 'Section and step are required' });
        }

        const limit = sessionSize ? parseInt(sessionSize as string) : 20;

        // Get all words in this section/step
        const { data: sectionWords, error: sectionError } = await supabase
            .from('words10k')
            .select('id')
            .eq('section', section)
            .eq('step', step)
            .order('id', { ascending: true });

        if (sectionError) {
            throw sectionError;
        }

        if (!sectionWords || sectionWords.length === 0) {
            console.log('❌ No words found in this section/step');
            return res.status(404).json({ error: 'No words found in this section/step' });
        }

        const allWordIds = sectionWords.map(w => w.id);
        console.log(`📚 Total words in ${section}/${step}:`, allWordIds.length);
        console.log(`📚 Word ID range: ${allWordIds[0]} - ${allWordIds[allWordIds.length - 1]}`);

        // Get progress for all words in this section/step, including last_reviewed for ordering
        const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('word_id, progress, progress_status, marked_as, last_reviewed')
            .eq('user_id', userId)
            .eq('quiz_type', quizType)
            .in('word_id', allWordIds);

        if (progressError) {
            throw progressError;
        }

        console.log(`📊 Words with progress records:`, progressData?.length || 0);

        // Create maps for each progress_status category
        const progressMap = new Map<number, { progress: number; status: string | null; lastReviewed: string | null }>();
        progressData?.forEach(p => {
            progressMap.set(p.word_id, { 
                progress: p.progress || 0, 
                status: effectiveProgressStatus(p),
                lastReviewed: p.last_reviewed || null
            });
        });

        // Categorize words by their progress_status
        // Priority order: new → to_review → learning → mastered
        // Store word info with lastReviewed for sorting
        interface WordInfo { id: number; lastReviewed: string | null }
        const newWords: WordInfo[] = [];
        const toReviewWords: WordInfo[] = [];
        const learningWords: WordInfo[] = [];
        const masteredWords: WordInfo[] = [];

        allWordIds.forEach(wordId => {
            const progressInfo = progressMap.get(wordId);
            const wordInfo: WordInfo = { 
                id: wordId, 
                lastReviewed: progressInfo?.lastReviewed || null 
            };
            
            if (!progressInfo || progressInfo.status === 'new' || progressInfo.status === null) {
                // Word has no progress record OR status is 'new' OR status is null
                newWords.push(wordInfo);
            } else if (progressInfo.status === 'to_review') {
                toReviewWords.push(wordInfo);
            } else if (progressInfo.status === 'learning') {
                learningWords.push(wordInfo);
            } else if (progressInfo.status === 'mastered') {
                masteredWords.push(wordInfo);
            }
        });

        // Sort each category by lastReviewed (null first, then oldest first)
        // This ensures words not recently practiced are selected first
        const sortByLastReviewed = (a: WordInfo, b: WordInfo) => {
            if (a.lastReviewed === null && b.lastReviewed === null) return a.id - b.id;
            if (a.lastReviewed === null) return -1;
            if (b.lastReviewed === null) return 1;
            return new Date(a.lastReviewed).getTime() - new Date(b.lastReviewed).getTime();
        };

        newWords.sort(sortByLastReviewed);
        toReviewWords.sort(sortByLastReviewed);
        learningWords.sort(sortByLastReviewed);
        masteredWords.sort(sortByLastReviewed);

        console.log(`📝 Word counts by status:`);
        console.log(`   🆕 new: ${newWords.length}`);
        console.log(`   🔄 to_review: ${toReviewWords.length}`);
        console.log(`   📚 learning: ${learningWords.length}`);
        console.log(`   ⭐ mastered: ${masteredWords.length}`);

        // Select words in priority order until we have enough
        // Words are already sorted by lastReviewed (oldest first) within each category
        const selectedWords: number[] = [];
        const statusBreakdown: { [key: string]: number } = { new: 0, to_review: 0, learning: 0, mastered: 0 };

        // Priority 1: new words (sorted by lastReviewed, oldest first)
        for (const wordInfo of newWords) {
            if (selectedWords.length >= limit) break;
            selectedWords.push(wordInfo.id);
            statusBreakdown.new++;
        }

        // Priority 2: to_review words (sorted by lastReviewed, oldest first)
        for (const wordInfo of toReviewWords) {
            if (selectedWords.length >= limit) break;
            selectedWords.push(wordInfo.id);
            statusBreakdown.to_review++;
        }

        // Priority 3: learning words (sorted by lastReviewed, oldest first)
        for (const wordInfo of learningWords) {
            if (selectedWords.length >= limit) break;
            selectedWords.push(wordInfo.id);
            statusBreakdown.learning++;
        }

        // Priority 4: mastered words (sorted by lastReviewed, oldest first)
        for (const wordInfo of masteredWords) {
            if (selectedWords.length >= limit) break;
            selectedWords.push(wordInfo.id);
            statusBreakdown.mastered++;
        }

        // Sort by ID to maintain order within the session
        selectedWords.sort((a, b) => a - b);

        console.log(`🎯 Selected ${selectedWords.length} words for session:`);
        console.log(`   Breakdown: ${statusBreakdown.new} new, ${statusBreakdown.to_review} to_review, ${statusBreakdown.learning} learning, ${statusBreakdown.mastered} mastered`);
        console.log(`   Word IDs: ${selectedWords.join(', ')}`);
        console.log(`   ID range: ${selectedWords[0] || 'none'} - ${selectedWords[selectedWords.length - 1] || 'none'}`);

        return res.status(200).json({ 
            wordIds: selectedWords,
            statusBreakdown
        });

    } catch (error) {
        console.error('Error getting next words:', error);
        res.status(500).json({ error: 'Failed to get next words' });
    }
}
