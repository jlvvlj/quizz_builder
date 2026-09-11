import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, BookOpen, Flame, CheckCircle2, Search } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { request } from '@/lib/client';
interface Quiz { id: string; title: string; description: string; item_count: number; progress: number; masteredCount: number; owned: boolean; is_public: boolean }
interface Activity { activity_date: string; answers: number }
async function loadQuizzes() {
  const quizzes: Quiz[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await request<{ quizzes: Quiz[]; total: number }>(`/api/quizzes?offset=${offset}`);
    quizzes.push(...page.quizzes);
    if (quizzes.length >= page.total || page.quizzes.length < 100) return { quizzes };
  }
}
export default function Library() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [sessions, setSessions] = useState<{ id: string; quiz_id: string; builder_quizzes: { title: string } }[]>([]);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useEffect(() => { Promise.all([loadQuizzes(), request<{ activity: Activity[]; sessions: typeof sessions }>('/api/activity')]).then(([q, a]) => { setQuizzes(q.quizzes); setActivity(a.activity); setSessions(a.sessions); }).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  let streak = 0;
  const days = new Set(activity.map(a => a.activity_date));
  const date = new Date();
  if (!days.has(date.toISOString().slice(0, 10))) date.setUTCDate(date.getUTCDate() - 1);
  while (days.has(date.toISOString().slice(0, 10))) { streak++; date.setUTCDate(date.getUTCDate() - 1); }
  const filtered = quizzes.filter(q => `${q.title} ${q.description}`.toLowerCase().includes(search.toLowerCase()));
  return <AppLayout><header className="page-header"><span className="eyebrow">A LITTLE MORE EVERY DAY</span><h1>What will you learn today?</h1><p>Follow your curiosity. Build on what you know.</p></header>
    {error && <div role="alert" className="error">{error}<button onClick={() => window.location.reload()}>Try again</button></div>}
    <section className="stats" aria-label="Learning overview"><div><span className="stat-icon"><BookOpen /></span><div><strong>{quizzes.length}</strong><span>Quizzes to explore</span></div></div><div><span className="stat-icon warm"><Flame /></span><div><strong>{streak} <small>{streak === 1 ? 'day' : 'days'}</small></strong><span>Current streak · UTC</span></div></div><div><span className="stat-icon green"><CheckCircle2 /></span><div><strong>{quizzes.reduce((sum, q) => sum + q.masteredCount, 0)}</strong><span>Questions mastered</span></div></div></section>
    {sessions.length > 0 && <div className="resume"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h3>{sessions[0].builder_quizzes.title}</h3></div><Link className="secondary" href={`/quiz/${sessions[0].quiz_id}?session=${sessions[0].id}`}>Continue practice <ArrowRight size={16} /></Link></div>}
    <div className="section-heading"><div><h2>Your quiz library <span className="count">{quizzes.length}</span></h2><p>One small session. One step forward.</p></div><label className="search"><Search size={17} /><input aria-label="Search quizzes" placeholder="Find a topic…" value={search} onChange={e => setSearch(e.target.value)} /></label></div>
    {loading ? <p role="status" className="empty">Loading your library…</p> : <div className="quiz-grid">{filtered.map((q, i) => <Link href={`/quiz/${q.id}`} className="quiz-card" key={q.id}><div className="card-top"><span className={`topic-icon tone-${i % 3}`}><BookOpen size={23} /></span><ArrowUpRight size={20} /></div><div className="card-label">{q.owned ? 'YOUR QUIZ' : 'COMMUNITY QUIZ'}{q.is_public && q.owned ? ' · PUBLIC' : ''}</div><h3>{q.title}</h3><p>{q.description || 'A new opportunity to put your knowledge into practice.'}</p><div className="card-footer"><span>{q.item_count} questions</span><span>{q.progress}% mastered</span></div><div className="progress-track"><div style={{ width: `${q.progress}%` }} /></div></Link>)}</div>}
    {!loading && !filtered.length && <div className="empty"><BookOpen size={32} /><h3>{quizzes.length ? 'No matching quizzes' : 'Your next discovery starts here'}</h3><p>{quizzes.length ? 'Try another topic or keyword.' : 'Quizzes shared with you will appear in your library.'}</p></div>}
    <footer className="page-footer">Progress comes from showing up. You’re in the right place.</footer>
  </AppLayout>;
}
