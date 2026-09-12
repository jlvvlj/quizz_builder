import { startSession } from '@/server/auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        // Validate input
        if (typeof email !== 'string' || typeof password !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || Buffer.byteLength(password, 'utf8') > 72) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Check if email already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Generate unique user ID
        const userId = uuidv4();

        // Create user
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: email.toLowerCase(),
                password_hash: passwordHash,
                auth_provider: 'email',
                session_size: 7,
                auto_advance: true,
                audio_auto_play: false,
                show_phrase: false,
                dark_mode: false,
                large_text: false,
                daily_reminders: true,
                weekly_progress: true,
                current_session: 1
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating user:', createError);
            return res.status(500).json({ error: 'Failed to create user' });
        }

        console.log('✅ User created successfully:', newUser.id);

        // Set session cookie
        await startSession(res, userId);

        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
