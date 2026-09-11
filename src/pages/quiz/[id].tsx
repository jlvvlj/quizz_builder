import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Trophy, Keyboard, ListChecks } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { request } from '@/lib/client';
import { type PracticeSession, type Answer } from '@/lib/quiz';
import { readQuizType, setQuizMode, QUIZ_MODE_EVENT } from '@/utils/quiz-mode';
function subscribeMode(callback: () => void) {
  window.addEventListener(QUIZ_MODE_EVENT, callback); window.addEventListener('storage', callback);
  return () => { window.removeEventListener(QUIZ_MODE_EVENT, callback); window.removeEventListener('storage', callback); };
}
export default function Practice() {
  const router = useRouter(); const { id, session: sessionId } = router.query;
  const [quiz, setQuiz] = useState<{ title: string; description: string } | null>(null);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const mode = useSyncExternalStore(subscribeMode, readQuizType, () => 'multiple_choice');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState(''); const [feedback, setFeedback] = useState<Answer | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (typeof id === 'string') request<{ quiz: typeof quiz }>(`/api/quizzes/${id}`).then(r => setQuiz(r.quiz)).catch(e => setError(e.message)); }, [id]);
  const load = useCallback(async () => {
    if (typeof sessionId === 'string') {
      const data = await request<{ session: PracticeSession }>(`/api/sessions/${sessionId}`);
      if (data.session.quiz_id !== id) throw new Error('This session belongs to a different quiz');
      return data.session;
    }
  }, [sessionId, id]);
  useEffect(() => { load().then(value => { if (value) setSession(value); }).catch(e => setError(e.message)); }, [load]);
  const current = session?.questions[session.answers.length];
  useEffect(() => { if (session?.mode === 'typing' && !feedback) inputRef.current?.focus(); }, [current?.id, session?.mode, feedback]);
  async function start() {
    setBusy(true); setError('');
    try { const data = await request<{ id: string }>('/api/sessions', { method: 'POST', body: JSON.stringify({ quiz_id: id, mode }) }); await router.push(`/quiz/${id}?session=${data.id}`); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function submit(value: string) {
    if (!current || !session || busy || feedback) return;
    setBusy(true); setError('');
    try { const data = await request<{ result: Answer }>(`/api/sessions/${session.id}/answers`, { method: 'POST', body: JSON.stringify({ item_id: current.id, answer: value }) }); setFeedback(data.result); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function next() {
    setBusy(true); setError('');
    try { const updated = await load(); if (updated) setSession(updated); setFeedback(null); setAnswer(''); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  const correct = session?.answers.filter(a => a.correct).length || 0;
  return <AppLayout><Link href="/" className="back"><ArrowLeft size={16} /> Back to library</Link><header className="page-header compact"><span className="eyebrow">MAKE KNOWLEDGE STICK</span><h1>{quiz?.title || 'Practice'}</h1><p>{quiz?.description}</p></header>{error && <div className="error" role="alert">{error}</div>}
    {!session && !sessionId && quiz && <section className="practice-setup"><span className="eyebrow">YOUR SESSION, YOUR WAY</span><h2>How would you like to practise?</h2><p>We’ll start with the questions that need the most attention.</p><div className="mode-picker"><button className={mode === 'multiple_choice' ? 'selected' : ''} onClick={() => { setQuizMode('multiple-choice'); }}><ListChecks /><strong>Multiple choice</strong><span>Recognise the right answer.</span></button><button className={mode === 'typing' ? 'selected' : ''} onClick={() => { setQuizMode('typing'); }}><Keyboard /><strong>Typed answers</strong><span>Recall it in your own words.</span></button></div><button className="primary" onClick={start} disabled={busy}>{busy ? 'Preparing…' : 'Start practice'}<ArrowRight size={18} /></button></section>}
    {sessionId && !session && !error && <p role="status">Loading your session…</p>}
    {session && current && <section className="practice"><div className="practice-meta"><span>QUESTION {session.answers.length + 1} OF {session.questions.length}</span><span>{session.mode === 'typing' ? 'TYPED ANSWERS' : 'MULTIPLE CHOICE'}</span></div><div className="progress-track"><div style={{ width: `${100 * session.answers.length / session.questions.length}%` }} /></div><div className="question"><h2>{current.question}</h2><p>{session.mode === 'typing' ? 'Take a moment. What comes to mind?' : 'Choose the answer that fits.'}</p></div>
      {session.mode === 'multiple_choice' ? <div className="answer-options">{current.options.map((option, i) => <button key={option} disabled={busy || !!feedback} onClick={() => submit(option)} className={feedback && option === feedback.answer ? 'correct' : feedback && option === feedback.submitted_answer && !feedback.correct ? 'incorrect' : ''}><span>{String.fromCharCode(65 + i)}</span>{option}</button>)}</div> : <form onSubmit={e => { e.preventDefault(); submit(answer); }} className="typing-form"><label className="sr-only" htmlFor="typed-answer">Your answer</label><input ref={inputRef} id="typed-answer" autoComplete="off" value={answer} onChange={e => setAnswer(e.target.value)} disabled={busy || !!feedback} placeholder="Type your answer…" /><button className="primary" disabled={busy || !!feedback || !answer.trim()}>Check answer</button></form>}
      {!feedback && <button className="quiet skip" onClick={() => submit('')} disabled={busy}>I don’t know yet · Show answer</button>}
      {busy && !feedback && <p role="status">Saving your answer…</p>}
      {feedback && <div className={`feedback ${feedback.correct ? 'success' : 'review'}`} role="status"><div>{feedback.correct ? <CheckCircle2 /> : <XCircle />}<div><h3>{feedback.correct ? 'That’s right.' : 'A chance to learn.'}</h3><p>{feedback.correct ? 'One step closer to knowing it by heart.' : `Answer: ${feedback.answer}`}</p>{feedback.explanation && <p>{feedback.explanation}</p>}<small>Question mastery: {feedback.progress}%</small></div></div><button className="primary" onClick={next} disabled={busy}>{session.answers.length + 1 === session.questions.length ? 'See results' : 'Continue'}<ArrowRight size={16} /></button></div>}
    </section>}
    {session && !current && <section className="results"><span className="trophy"><Trophy size={35} /></span><span className="eyebrow">ANOTHER STEP FORWARD</span><h2>Practice complete.</h2><p>You made time to learn. That’s what counts.</p><div className="result-score"><strong>{correct}<small> / {session.questions.length}</small></strong><span>questions answered correctly</span></div><p>Your progress is saved. Keep practising to build mastery.</p><div className="result-actions"><Link className="primary" href="/">Back to library <ArrowRight size={17} /></Link><button className="secondary" disabled={busy} onClick={start}>Practise again</button></div><details><summary>Review your answers</summary>{session.answers.map(a => <div className="review-row" key={a.item_id}><strong>{session.questions.find(q => q.id === a.item_id)?.question}</strong><span>{a.correct ? '✓' : '↗'} {a.answer}</span>{a.explanation && <p>{a.explanation}</p>}</div>)}</details></section>}
  </AppLayout>;
}
