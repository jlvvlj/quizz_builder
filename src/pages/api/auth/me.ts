import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

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
            return res.status(401).json({ error: 'Not authenticated', user: null, hasSession: false });
        }

        if (userId === 'anonymous') {
            // Legacy session - allow logout to clear it
            return res.status(200).json({ error: 'Legacy session', user: null, hasSession: true });
        }

        // Find user by ID
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('id, email, auth_provider, created_at')
            .eq('id', userId)
            .single();

        if (findError || !user) {
            // Clear invalid cookie
            res.setHeader('Set-Cookie', 'userId=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
            return res.status(401).json({ error: 'User not found', user: null });
        }

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                authProvider: user.auth_provider,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
