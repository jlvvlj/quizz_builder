import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userId = req.cookies.userId;
        if (!userId) {
            return res.status(401).json({ error: 'No session found' });
        }

        const settings = req.body;
        
        // Convert camelCase to snake_case for Supabase
        const supabaseSettings = {
            session_size: settings.sessionSize,
            auto_advance: settings.autoAdvance,
            audio_auto_play: settings.audioAutoPlay,
            play_correct_answer_audio: settings.playCorrectAnswerAudio,
            show_phrase: settings.showPhrase,
            dark_mode: settings.darkMode,
            large_text: settings.largeText,
            daily_reminders: settings.dailyReminders,
            weekly_progress: settings.weeklyProgress,
            quiz_direction: settings.quizDirection,
            show_furigana: settings.showFurigana,
            timer_duration: settings.timerDuration,
            answer_choices: settings.answerChoices,
            kanji_frequency_source: settings.kanjiFrequencySource
        };

        // Update settings in Supabase
        const { error, data } = await supabase
            .from('users')
            .update(supabaseSettings)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating settings:', error);
            throw error;
        }

        // Convert snake_case back to camelCase for the response
        const responseSettings = {
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

        res.status(200).json(responseSettings);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
} 