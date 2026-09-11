import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { googleId, email, name } = req.body;

        if (!googleId || !email) {
            return res.status(400).json({ error: 'Google ID and email are required' });
        }

        // Check if user already exists with this Google ID
        let { data: existingUser } = await supabase
            .from('users')
            .select('id, email')
            .eq('google_id', googleId)
            .single();

        if (existingUser) {
            // User exists, log them in
            console.log('✅ Google user logged in:', existingUser.id);
            
            res.setHeader('Set-Cookie', `userId=${existingUser.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`);
            
            return res.status(200).json({
                message: 'Login successful',
                user: {
                    id: existingUser.id,
                    email: existingUser.email
                }
            });
        }

        // Check if email exists but with different auth provider
        const { data: emailUser } = await supabase
            .from('users')
            .select('id, auth_provider')
            .eq('email', email.toLowerCase())
            .single();

        if (emailUser) {
            // Email exists with different provider
            if (emailUser.auth_provider === 'email') {
                return res.status(400).json({ 
                    error: 'This email is already registered with email/password. Please use the login form.' 
                });
            }
        }

        // Create new user
        const userId = uuidv4();
        
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: email.toLowerCase(),
                google_id: googleId,
                auth_provider: 'google',
                session_size: 20,
                auto_advance: true,
                audio_auto_play: true,
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
            console.error('Error creating Google user:', createError);
            return res.status(500).json({ error: 'Failed to create user' });
        }

        console.log('✅ Google user created successfully:', newUser.id);

        res.setHeader('Set-Cookie', `userId=${newUser.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`);

        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Google auth error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
