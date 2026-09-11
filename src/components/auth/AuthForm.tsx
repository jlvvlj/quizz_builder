import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layers, ArrowRight } from 'lucide-react';
import { appName, request } from '@/lib/client';
export default function AuthForm({ signup = false }: { signup?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      await request(`/api/auth/${signup ? 'signup' : 'login'}`, { method: 'POST', body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) });
      await router.push('/');
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-intro"><Link href="/login" className="brand"><span className="brand-mark"><Layers size={22} /></span>{appName}</Link><div><span className="eyebrow">CURIOSITY, MEET CONSISTENCY</span><h1>There’s always<br />more to learn.</h1><p>Any topic. Your pace.<br />Turn a few questions into lasting knowledge.</p><div className="orbit" aria-hidden="true"><div /><span>?</span><div /></div></div><small>Build understanding, one question at a time.</small></section>
    <section className="auth-panel"><div className="auth-card"><span className="eyebrow">LET’S GET STARTED</span><h2>{signup ? 'Make room for learning.' : 'Welcome back.'}</h2><p>{signup ? 'Create your account and start exploring.' : 'Your next discovery is waiting.'}</p>
      <form onSubmit={submit}><label>Email<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label><label>Password<input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={8} required placeholder="At least 8 characters" /></label>{error && <div className="error" role="alert">{error}</div>}<button className="primary" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}<ArrowRight size={17} /></button></form>
      <p className="auth-switch">{signup ? 'Already have an account?' : 'New here?'} <Link href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create an account'}</Link></p>
    </div></section></main>;
}
