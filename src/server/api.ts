import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export function checked<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
export function api(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      if (!['GET', 'HEAD'].includes(req.method || '')) {
        const origin = req.headers.origin;
        // Cookie requests must be same-origin. CLI clients can omit Origin.
        if (origin && new URL(origin).host !== req.headers.host) throw new ApiError(403, 'Cross-origin request rejected');
      }
      await handler(req, res);
    } catch (error) {
      if (error instanceof ApiError) return res.status(error.status).json({ error: error.message });
      console.error(error);
      return res.status(500).json({ error: 'Request failed. Check the server logs and database configuration.' });
    }
  };
}
export function method(req: NextApiRequest, res: NextApiResponse, allowed: string[]) {
  if (!allowed.includes(req.method || '')) {
    res.setHeader('Allow', allowed.join(', '));
    throw new ApiError(405, 'Method not allowed');
  }
}
export function uuid(value: unknown): string {
  if (typeof value !== 'string' || !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(value)) throw new ApiError(400, 'Invalid ID');
  return value;
}
export function text(value: unknown, name: string, max = 4000): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new ApiError(400, `${name} must contain 1–${max} characters`);
  return value.trim();
}
export function body(req: NextApiRequest): Record<string, unknown> {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) throw new ApiError(400, 'Expected a JSON object');
  return req.body;
}
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export function cookie(token: string, age = 604800) {
  return `quiz_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}
export async function createSession(userId: string, res: NextApiResponse) {
  const token = randomBytes(32).toString('hex');
  checked(await db().from('builder_app_sessions').insert({ token_hash: hashToken(token), user_id: userId, expires_at: new Date(Date.now() + 604800000).toISOString() }));
  res.setHeader('Set-Cookie', cookie(token));
}
export async function user(req: NextApiRequest) {
  const token = req.cookies.quiz_session;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) throw new ApiError(401, 'Please sign in');
  const session = checked(await db().from('builder_app_sessions').select('user_id').eq('token_hash', hashToken(token)).gt('expires_at', new Date().toISOString()).maybeSingle());
  if (!session) throw new ApiError(401, 'Your session expired. Please sign in');
  const result = checked(await db().from('builder_users').select('id,email,session_size').eq('id', session.user_id).single());
  return result as { id: string; email: string; session_size: number };
}
export async function quizAccess(id: string, userId: string, ownerOnly = false) {
  const quiz = checked(await db().from('builder_quizzes').select('*').eq('id', uuid(id)).maybeSingle());
  if (!quiz || (quiz.owner_id !== userId && (ownerOnly || !quiz.is_public))) throw new ApiError(404, 'Quiz not found');
  return quiz;
}
export async function progressForQuiz(userId: string, quizId: string) {
  const records: { item_id: string; progress: number }[] = [];
  for (let offset = 0; ; offset += 500) {
    const page = checked(await db().from('builder_quiz_progress').select('item_id,progress,builder_quiz_items!inner(quiz_id)').eq('user_id', userId).eq('builder_quiz_items.quiz_id', quizId).order('item_id').range(offset, offset + 499));
    if (!page) throw new Error('Progress query returned no result');
    records.push(...page);
    if (page.length < 500) return records;
  }
}
