import { randomInt } from 'crypto';
import { api, ApiError, body, checked, db, method, progressForQuiz, quizAccess, user, uuid } from '@/server/api';
import { isCorrect, normalizeAnswer, type QuizItem, type Answer } from '@/lib/quiz';

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = randomInt(i + 1); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export default api(async (req, res) => {
  const current = await user(req);
  const path = (req.query.path || []) as string[];
  if (path.length === 0) {
    method(req, res, ['POST']);
    const input = body(req);
    const quiz = await quizAccess(uuid(input.quiz_id), current.id);
    if (!['typing', 'multiple_choice'].includes(String(input.mode))) throw new ApiError(400, 'Select typing or multiple_choice');
    // Load all content in explicit pages; do not silently truncate a large deck.
    const items: QuizItem[] = [];
    for (let offset = 0; ; offset += 500) {
      const page = checked(await db().from('builder_quiz_items').select('id,question,answer,accepted_answers,explanation,position').eq('quiz_id', quiz.id).order('position').order('id').range(offset, offset + 499)) as QuizItem[];
      items.push(...page);
      if (page.length < 500) break;
    }
    if (!items.length) throw new ApiError(422, 'This quiz has no questions yet');
    const progress = await progressForQuiz(current.id, quiz.id);
    const scores = new Map(progress.map(row => [row.item_id, row.progress]));
    const selected = shuffle(items).sort((a, b) => (scores.get(a.id) || 0) - (scores.get(b.id) || 0)).slice(0, current.session_size);
    const questions = selected.map(item => {
      const distractors = [...new Map(items.filter(other => !isCorrect(other.answer, item)).map(other => [normalizeAnswer(other.answer), other.answer])).values()];
      if (input.mode === 'multiple_choice' && !distractors.length) throw new ApiError(422, 'Multiple choice requires at least two distinct answers. Add questions or choose typed answers');
      return { ...item, options: input.mode === 'multiple_choice' ? shuffle([item.answer, ...shuffle(distractors).slice(0, 3)]) : [] };
    });
    const session = checked(await db().from('builder_quiz_sessions').insert({ user_id: current.id, quiz_id: quiz.id, mode: input.mode, questions }).select('id').single());
    if (!session) throw new Error('Session creation returned no record');
    return res.status(201).json({ id: session.id });
  }
  if (path.length > 2 || (path.length === 2 && path[1] !== 'answers')) throw new ApiError(404, 'Endpoint not found');
  const session = checked(await db().from('builder_quiz_sessions').select('*').eq('id', uuid(path[0])).eq('user_id', current.id).maybeSingle());
  if (!session) throw new ApiError(404, 'Session not found');
  const quiz = await quizAccess(session.quiz_id, current.id);
  if (path.length === 1) {
    method(req, res, ['GET']);
    return res.json({ session: { id: session.id, quiz_id: quiz.id, title: quiz.title, mode: session.mode, completed_at: session.completed_at, answers: session.answers,
      questions: session.questions.map((q: QuizItem & { options: string[] }) => ({ id: q.id, question: q.question, options: q.options })) } });
  }
  method(req, res, ['POST']);
  const input = body(req);
  const itemId = uuid(input.item_id);
  if (typeof input.answer !== 'string' || input.answer.length > 2000) throw new ApiError(400, 'Answer must be a string of at most 2000 characters');
  const previous = (session.answers as Answer[]).find(a => a.item_id === itemId);
  if (previous) return res.json({ result: previous });
  const question = session.questions[session.answers.length] as QuizItem & { options: string[] } | undefined;
  if (!question || question.id !== itemId) throw new ApiError(409, 'Answer the current question first');
  if (session.mode === 'multiple_choice' && input.answer !== '' && !question.options.includes(input.answer)) throw new ApiError(400, 'Choose one of the offered answers');
  const result = checked(await db().rpc('record_quiz_answer', { p_user: current.id, p_session: session.id, p_item: itemId, p_answer: input.answer, p_correct: isCorrect(input.answer, question) }));
  return res.json({ result });
});
