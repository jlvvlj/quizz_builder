import { useEffect, useState, type FormEvent } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { request } from '@/lib/client';
export default function Settings() {
  const [size, setSize] = useState(20); const [email, setEmail] = useState(''); const [status, setStatus] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(true);
  useEffect(() => { request<{ user: { session_size: number; email: string } }>('/api/auth/me').then(({ user }) => { setSize(user.session_size); setEmail(user.email); }).catch(e => setError(e.message)).finally(() => setBusy(false)); }, []);
  async function save(e: FormEvent) { e.preventDefault(); setBusy(true); setError(''); setStatus(''); try { await request('/api/auth/me', { method: 'PATCH', body: JSON.stringify({ session_size: size }) }); setStatus('Preferences saved.'); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  return <AppLayout><header className="page-header"><span className="eyebrow">FIND YOUR RHYTHM</span><h1>Preferences</h1><p>A learning routine that works for you.</p></header><form className="settings-card" onSubmit={save}><h2>Your practice</h2><p>{email}</p><label>Questions per session<input type="number" min={1} max={100} value={size} onChange={e => setSize(Number(e.target.value))} required /></label><p>Choose between 1 and 100. Smaller sessions make it easier to stay consistent.</p>{error && <div className="error" role="alert">{error}</div>}{status && <p role="status">{status}</p>}<button className="primary" disabled={busy}>Save preferences</button></form></AppLayout>;
}
