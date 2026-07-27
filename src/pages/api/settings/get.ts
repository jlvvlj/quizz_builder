import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userId = req.cookies.userId;
        if (!userId) {
            return res.status(401).json({ error: 'No session found' });
        }

        // Get settings from Supabase
        const { error, data } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error getting settings:', error);
            throw error;
        }

        // Convert snake_case to camelCase for the response
        const settings = {
            sessionSize: data.session_size,
            autoAdvance: data.auto_advance,
            audioAutoPlay: data.audio_auto_play,
            playCorrectAnswerAudio: data.play_correct_answer_audio ?? false,
            showPhrase: data.show_phrase,
            darkMode: data.dark_mode,
            largeText: data.large_text,
            dailyReminders: data.daily_reminders,
            weeklyProgress: data.weekly_progress,
            quizDirection: data.quiz_direction || 'forward',
            showFurigana: data.show_furigana || false,
            timerDuration: data.timer_duration ?? 3,
            answerChoices: data.answer_choices ?? 3,
            kanjiFrequencySource: data.kanji_frequency_source || 'default'
        };

        res.status(200).json(settings);
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({ error: 'Failed to get settings' });
    }
} 