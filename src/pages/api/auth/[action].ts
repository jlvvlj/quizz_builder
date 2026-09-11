import bcrypt from 'bcryptjs';
import { api, ApiError, body, checked, cookie, createSession, db, hashToken, method, text, user } from '@/server/api';

export default api(async (req, res) => {
  const action = req.query.action;
  if (action === 'me') {
    method(req, res, ['GET', 'PATCH']);
    const current = await user(req);
    if (req.method === 'PATCH') {
      const size = body(req).session_size;
      if (typeof size !== 'number' || !Number.isInteger(size) || size < 1 || size > 100) throw new ApiError(400, 'Session size must be between 1 and 100');
      checked(await db().from('builder_users').update({ session_size: size }).eq('id', current.id));
      current.session_size = size;
    }
    return res.json({ user: current });
  }
  if (action === 'logout') {
    method(req, res, ['POST']);
    if (req.cookies.quiz_session) checked(await db().from('builder_app_sessions').delete().eq('token_hash', hashToken(req.cookies.quiz_session)));
    res.setHeader('Set-Cookie', cookie('', 0));
    return res.json({ ok: true });
  }
  if (action !== 'login' && action !== 'signup') throw new ApiError(404, 'Endpoint not found');
  method(req, res, ['POST']);
  const input = body(req);
  const email = text(input.email, 'Email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, 'Enter a valid email');
  if (typeof input.password !== 'string' || input.password.length < 8 || Buffer.byteLength(input.password, 'utf8') > 72) throw new ApiError(400, 'Password must have at least 8 characters and at most 72 UTF-8 bytes');
  const password = input.password;
  let account;
  if (action === 'signup') {
    const password_hash = await bcrypt.hash(password, 12);
    const result = await db().from('builder_users').insert({ email, password_hash }).select('id,email,session_size').single();
    if (result.error?.code === '23505') throw new ApiError(409, 'An account with this email already exists');
    account = checked(result);
  } else {
    const existing = checked(await db().from('builder_users').select('id,email,password_hash,session_size').eq('email', email).maybeSingle());
    if (!existing || !await bcrypt.compare(password, existing.password_hash)) throw new ApiError(401, 'Invalid email or password');
    account = { id: existing.id, email: existing.email, session_size: existing.session_size };
  }
  if (!account) throw new Error('Account creation returned no record');
  await createSession(account.id, res);
  return res.status(action === 'signup' ? 201 : 200).json({ user: account });
});
