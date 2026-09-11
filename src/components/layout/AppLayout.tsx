import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BookOpen, LogOut, Settings, Layers } from 'lucide-react';
import { appName, request } from '@/lib/client';
export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [error, setError] = useState('');
  async function logout() {
    try { await request('/api/auth/logout', { method: 'POST' }); await router.push('/login'); }
    catch (e) { setError((e as Error).message); }
  }
  return <div className="app-layout">
    <aside className="sidebar">
      <Link href="/" className="brand"><span className="brand-mark"><Layers size={21} /></span>{appName}</Link>
      <div className="sidebar-caption">YOUR LEARNING SPACE</div>
      <nav aria-label="Main navigation"><Link href="/" className={router.pathname === '/' || router.pathname.startsWith('/quiz/') ? 'active' : ''}><BookOpen size={18} /> Quiz library</Link><Link href="/settings" className={router.pathname === '/settings' ? 'active' : ''}><Settings size={18} /> Preferences</Link></nav>
      <div className="sidebar-bottom"><p>A little practice.<br />A little more understanding.</p><button className="quiet" onClick={logout}><LogOut size={17} /> Sign out</button>{error && <p role="alert">{error}</p>}</div>
    </aside><main className="main">{children}</main>
  </div>;
}
