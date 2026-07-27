import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('id, email, password_hash, auth_provider')
            .eq('email', email.toLowerCase())
            .single();

        if (findError || !user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if user signed up with Google
        if (user.auth_provider === 'google') {
            return res.status(400).json({ error: 'This account uses Google sign-in. Please use the Google button.' });
        }

        // Verify password
        if (!user.password_hash) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        console.log('✅ User logged in successfully:', user.id);

        // Set session cookie
        res.setHeader('Set-Cookie', `userId=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`);

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
