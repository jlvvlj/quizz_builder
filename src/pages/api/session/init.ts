import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

interface ExistingUser {
    id: string;
}

interface UserStats {
    totalCards?: number;
}

const isVercelRuntime = process.env.VERCEL === '1';

const defaultUserSettings = {
    session_size: 7,
    auto_advance: true,
    audio_auto_play: true,
    show_phrase: false,
    dark_mode: false,
    large_text: false,
    daily_reminders: true,
    weekly_progress: true,
    current_session: 1,
    quiz_direction: 'forward',
    show_furigana: false
};

function setUserCookie(res: NextApiResponse, userId: string) {
    res.setHeader('Set-Cookie', `userId=${userId}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 365}; SameSite=Strict`);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Session init request received');
        console.log('Current cookies:', req.cookies);
        
        if (isVercelRuntime) {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            let userId = req.cookies.userId;
            let shouldSetCookie = false;

            if (!userId) {
                console.log('No existing userId found, creating new Supabase-backed user');
                userId = randomUUID();
                shouldSetCookie = true;
            } else {
                console.log('Using existing userId:', userId);
            }

            let { data: user, error: lookupError } = await supabase
                .from('users')
                .select('current_session')
                .eq('id', userId)
                .maybeSingle();

            if (lookupError) {
                throw lookupError;
            }

            if (!user) {
                const { data: insertedUser, error: insertError } = await supabase
                    .from('users')
                    .insert({ id: userId, ...defaultUserSettings })
                    .select('current_session')
                    .single();

                if (insertError) {
                    throw insertError;
                }

                user = insertedUser;
            }

            if (shouldSetCookie) {
                setUserCookie(res, userId);
                console.log('Set new cookie for userId:', userId);
            }

            const { count: totalCards, error: statsError } = await supabase
                .from('user_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (statsError) {
                throw statsError;
            }

            const stats = { totalCards: totalCards || 0 };
            const currentSession = user.current_session || 1;

            return res.status(200).json({ userId, stats, currentSession });
        }

        const { userProgressDb } = await import('@/utils/userProgressDb');

        // Get existing userId from cookie or create new one
        let userId = req.cookies.userId;
        
        if (!userId) {
            console.log('No existing userId found, creating new one');
            userId = randomUUID();

            // Check if there's any existing progress data
            const existingUsers = userProgressDb.getAllUsers() as ExistingUser[];
            console.log('Existing users in database:', existingUsers.length);
            
            if (existingUsers.length > 0) {
                // Use the user with the most progress
                const userWithMostProgress = existingUsers.reduce((prev, curr) => {
                    const prevStats = userProgressDb.getUserStats(prev.id) as UserStats;
                    const currStats = userProgressDb.getUserStats(curr.id) as UserStats;
                    return (currStats.totalCards || 0) > (prevStats.totalCards || 0) ? curr : prev;
                });
                
                console.log('Found existing user with most progress:', userWithMostProgress.id);
                userId = userWithMostProgress.id;
            } else {
                // Create new user if no existing users
                console.log('Creating new user:', userId);
                userProgressDb.createUser(userId);
            }
            
            // Set cookie that expires in 1 year
            const cookieOptions = {
                path: '/',
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 365,
                sameSite: 'strict' as const
            };
            
            res.setHeader('Set-Cookie', `userId=${userId}; Path=${cookieOptions.path}; HttpOnly; Max-Age=${cookieOptions.maxAge}; SameSite=${cookieOptions.sameSite}`);
            console.log('Set new cookie for userId:', userId);
        } else {
            console.log('Using existing userId:', userId);
        }

        // Get user stats
        const stats = userProgressDb.getUserStats(userId);
        console.log('User stats:', stats);

        // Get or initialize current session
        const currentSession = userProgressDb.getCurrentSession(userId);
        console.log('Current session:', currentSession);

        res.status(200).json({ userId, stats, currentSession });
    } catch (error) {
        console.error('Error initializing session:', error);
        res.status(500).json({ error: 'Failed to initialize session', details: error instanceof Error ? error.message : 'Unknown error' });
    }
} 
