import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Clear the session cookie
    res.setHeader('Set-Cookie', 'userId=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');

    console.log('✅ User logged out');

    return res.status(200).json({ message: 'Logged out successfully' });
}
