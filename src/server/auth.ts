import { createHash, randomBytes } from 'crypto';
import type { NextApiResponse } from 'next';
import { serverDb } from './db';
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export async function startSession(res: NextApiResponse, userId: string) {
 const token = randomBytes(32).toString('hex');
 const {error} = await serverDb.from('app_sessions').insert({token_hash:tokenHash(token),user_id:userId,expires_at:new Date(Date.now()+7*86400000).toISOString()});
 if(error) throw error;
 res.setHeader('Set-Cookie', [`quiz_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${process.env.NODE_ENV==='production'?'; Secure':''}`, 'userId=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax']);
}
