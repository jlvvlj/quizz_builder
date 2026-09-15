import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { calculateStepProgressFromRecords } from '@/utils/step-progress';
import { effectiveProgressStatus } from '@/utils/progress-status';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userId = req.cookies.userId;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });
        const { section, step, quizType: rawQuizType } = req.query;
        const quizType = typeof rawQuizType === 'string' && rawQuizType ? rawQuizType : 'multiple_choice';

        console.log('\n=== CALCULATING STEP PROGRESS ===');
        console.log('User:', userId);
        console.log('Section:', section);
        console.log('Step:', step);

        if (!section || !step) {
            return res.status(400).json({ error: 'Section and step are required' });
        }

        // Get all words in this section and step
        const { data: words, error: wordsError } = await supabase
            .from('words10k')
            .select('id')
            .eq('section', section)
            .eq('step', step);

        if (wordsError) throw wordsError;
        if (!words || words.length === 0) {
            console.log('No words found');
            return res.status(200).json({ progress: 0, masteredCount: 0, totalWords: 0 });
        }

        const totalWords = words.length;
        console.log('Total words in step:', totalWords);

        // Get progress_status and numeric progress for all words
        const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('word_id, progress_status, marked_as, progress')
            .eq('user_id', userId)
            .eq('quiz_type', quizType)
            .in('word_id', words.map(w => w.id));

        if (progressError) throw progressError;

        console.log('Progress records found:', progressData?.length || 0);

        // Count words by progress_status
        const records = (progressData || []).map(item => ({
            ...item,
            progress_status: effectiveProgressStatus(item),
        }));
        
        // Show all unique progress_status values found
        const uniqueStatuses = [...new Set(records.map(r => r.progress_status))];
        console.log('🔍 Unique progress_status values in DB:', uniqueStatuses);
        
        // Show sample of to_review records for debugging
        const toReviewRecords = records.filter(item => item.progress_status === 'to_review');
        console.log('🔄 to_review word_ids:', toReviewRecords.map(r => r.word_id));
        
        const newCount = records.filter(item => item.progress_status === 'new').length;
        const toReviewCount = toReviewRecords.length;
        const learningCount = records.filter(item => item.progress_status === 'learning').length;
        const masteredCount = records.filter(item => item.progress_status === 'mastered').length;
        const noStatusCount = records.filter(item => !item.progress_status).length;
        const otherCount = records.filter(item => item.progress_status && !['new', 'to_review', 'learning', 'mastered'].includes(item.progress_status)).length;

        console.log('📝 Status breakdown:');
        console.log('   🆕 new:', newCount);
        console.log('   🔄 to_review:', toReviewCount);
        console.log('   📚 learning:', learningCount);
        console.log('   ⭐ mastered:', masteredCount);
        if (noStatusCount > 0) {
            console.log('   ❓ no status (null/undefined):', noStatusCount);
        }
        if (otherCount > 0) {
            const otherStatuses = records.filter(item => item.progress_status && !['new', 'to_review', 'learning', 'mastered'].includes(item.progress_status));
            console.log('   ⚠️ other status:', otherCount, otherStatuses.map(r => r.progress_status));
        }
        console.log('   Total counted:', newCount + toReviewCount + learningCount + masteredCount + noStatusCount + otherCount);
        
        const { progress } = calculateStepProgressFromRecords(totalWords, records, masteredCount);

        console.log('Mastered count:', masteredCount);
        console.log('Progress percentage:', progress);
        console.log('=== END STEP PROGRESS ===\n');

        return res.status(200).json({ 
            progress, 
            masteredCount, 
            totalWords 
        });

    } catch (error) {
        console.error('Error calculating step progress:', error);
        res.status(500).json({ error: 'Failed to calculate step progress' });
    }
}
