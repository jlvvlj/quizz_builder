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
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Token and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Find user by reset token
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('id, email, reset_token_expires')
            .eq('reset_token', token)
            .single();

        if (findError || !user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Check if token has expired
        if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
            return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 10);

        // Update password and clear reset token
        const { error: updateError } = await supabase
            .from('users')
            .update({
                password_hash: passwordHash,
                reset_token: null,
                reset_token_expires: null
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error updating password:', updateError);
            return res.status(500).json({ error: 'Failed to update password' });
        }

        console.log('✅ Password reset successfully for:', user.email);

        return res.status(200).json({ message: 'Password reset successfully. You can now log in.' });

    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
