import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function getBaseUrl(req: NextApiRequest) {
    const forwardedProto = req.headers['x-forwarded-proto'];
    const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
    const protocol = proto || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    const host = req.headers.host || 'localhost:3000';

    return `${protocol}://${host}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user by email
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('id, email, auth_provider')
            .eq('email', email.toLowerCase())
            .single();

        if (findError || !user) {
            // Don't reveal if email exists or not for security
            return res.status(200).json({ message: 'If the email exists, a reset link has been sent.' });
        }

        // Check if user signed up with Google
        if (user.auth_provider === 'google') {
            return res.status(400).json({ error: 'This account uses Google sign-in. Password reset is not available.' });
        }

        // Generate reset token
        const resetToken = uuidv4();
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Save token to database
        const { error: updateError } = await supabase
            .from('users')
            .update({
                reset_token: resetToken,
                reset_token_expires: resetTokenExpires.toISOString()
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error saving reset token:', updateError);
            return res.status(500).json({ error: 'Failed to generate reset link' });
        }

        // Log the reset link to console (instead of sending email)
        const resetUrl = `${getBaseUrl(req)}/reset-password?token=${resetToken}`;
        console.log('\n========================================');
        console.log('🔑 PASSWORD RESET LINK');
        console.log('========================================');
        console.log(`Email: ${user.email}`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log(`Expires: ${resetTokenExpires.toISOString()}`);
        console.log('========================================\n');

        return res.status(200).json({ 
            message: 'If the email exists, a reset link has been sent.',
            // Include reset URL in response for development
            _dev_resetUrl: resetUrl
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
