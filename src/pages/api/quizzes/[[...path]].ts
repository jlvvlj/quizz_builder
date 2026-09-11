import { api, ApiError, body, checked, db, method, progressForQuiz, quizAccess, text, user, uuid } from '@/server/api';
import { calculateStepProgressFromRecords } from '@/utils/step-progress';

function fields(input: Record<string, unknown>, partial = false) {
  const result: Record<string, unknown> = {};
  if (!partial || 'title' in input) result.title = text(input.title, 'Title', 160);
  if ('description' in input) {
    if (typeof input.description !== 'string' || input.description.length > 4000) throw new ApiError(400, 'Description must be at most 4000 characters');
    result.description = input.description;
  }
  if ('is_public' in input) {
    if (typeof input.is_public !== 'boolean') throw new ApiError(400, 'is_public must be a boolean');
    result.is_public = input.is_public;
  }
  return result;
}
function itemFields(input: Record<string, unknown>, partial = false) {
  const result: Record<string, unknown> = {};
  if (!partial || 'question' in input) result.question = text(input.question, 'Question');
  if (!partial || 'answer' in input) result.answer = text(input.answer, 'Answer', 2000);
  if ('accepted_answers' in input) {
    if (!Array.isArray(input.accepted_answers) || input.accepted_answers.length > 30) throw new ApiError(400, 'accepted_answers must be an array of up to 30 strings');
    result.accepted_answers = input.accepted_answers.map(x => text(x, 'Accepted answer', 2000));
  }
  if ('position' in input) {
    if (typeof input.position !== 'number' || !Number.isSafeInteger(input.position) || input.position < 0) throw new ApiError(400, 'position must be a non-negative integer');
    result.position = input.position;
  }
  if ('explanation' in input) {
    if (typeof input.explanation !== 'string' || input.explanation.length > 4000) throw new ApiError(400, 'Explanation must be at most 4000 characters');
    result.explanation = input.explanation;
  }
  if ('metadata' in input) {
    if (!input.metadata || typeof input.metadata !== 'object' || Array.isArray(input.metadata) || JSON.stringify(input.metadata).length > 8000) throw new ApiError(400, 'metadata must be an object of at most 8000 characters');
    result.metadata = input.metadata;
  }
  return result;
}

export default api(async (req, res) => {
  const current = await user(req);
  const path = (req.query.path || []) as string[];
  if (path.length === 0) {
    method(req, res, ['GET', 'POST']);
    if (req.method === 'POST') {
      const quiz = checked(await db().from('builder_quizzes').insert({ ...fields(body(req)), owner_id: current.id }).select('*').single());
      return res.status(201).json({ quiz });
    }
    const offset = Number(req.query.offset || 0);
    if (!Number.isSafeInteger(offset) || offset < 0) throw new ApiError(400, 'Invalid offset');
    const quizResult = await db().from('builder_quizzes').select('*', { count: 'exact' }).or(`owner_id.eq.${current.id},is_public.eq.true`).order('created_at', { ascending: false }).order('id').range(offset, offset + 99);
    const quizzes = checked(quizResult);
    if (!quizzes) throw new Error('Quiz query returned no result');
    const results = await Promise.all(quizzes.map(async quiz => {
      const countResult = await db().from('builder_quiz_items').select('id', { count: 'exact', head: true }).eq('quiz_id', quiz.id);
      checked(countResult);
      const records = await progressForQuiz(current.id, quiz.id);
      return { ...quiz, item_count: countResult.count || 0, ...calculateStepProgressFromRecords(countResult.count || 0, records, records.filter(p => p.progress === 100).length), owned: quiz.owner_id === current.id };
    }));
    return res.json({ quizzes: results, total: quizResult.count, offset });
  }
  const id = uuid(path[0]);
  if (path.length === 1) {
    method(req, res, ['GET', 'PUT', 'DELETE']);
    const quiz = await quizAccess(id, current.id, req.method !== 'GET');
    if (req.method === 'DELETE') {
      checked(await db().from('builder_quizzes').delete().eq('id', id).eq('owner_id', current.id));
      return res.status(204).end();
    }
    if (req.method === 'PUT') return res.json({ quiz: checked(await db().from('builder_quizzes').update(fields(body(req), true)).eq('id', id).eq('owner_id', current.id).select('*').single()) });
    return res.json({ quiz });
  }
  if (path[1] !== 'items' || path.length > 3) throw new ApiError(404, 'Endpoint not found');
  await quizAccess(id, current.id, true);
  if (path.length === 2) {
    method(req, res, ['GET', 'POST']);
    if (req.method === 'GET') {
      const offset = Number(req.query.offset || 0);
      if (!Number.isSafeInteger(offset) || offset < 0) throw new ApiError(400, 'Invalid offset');
      const result = await db().from('builder_quiz_items').select('*', { count: 'exact' }).eq('quiz_id', id).order('position').order('id').range(offset, offset + 99);
      return res.json({ items: checked(result), total: result.count, offset });
    }
    const input = body(req).items;
    if (!Array.isArray(input) || input.length < 1 || input.length > 100) throw new ApiError(400, 'Supply 1–100 items');
    const rows = input.map((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) throw new ApiError(400, 'Each item must be an object');
      return { position: index, accepted_answers: [], explanation: '', metadata: {}, ...itemFields(item), quiz_id: id };
    });
    return res.status(201).json({ items: checked(await db().from('builder_quiz_items').insert(rows).select('*')) });
  }
  method(req, res, ['PUT', 'DELETE']);
  const itemId = uuid(path[2]);
  if (req.method === 'DELETE') {
    const deleted = checked(await db().from('builder_quiz_items').delete().eq('id', itemId).eq('quiz_id', id).select('id'));
    if (!deleted || !deleted.length) throw new ApiError(404, 'Item not found');
    return res.status(204).end();
  }
  const item = checked(await db().from('builder_quiz_items').update(itemFields(body(req), true)).eq('id', itemId).eq('quiz_id', id).select('*').maybeSingle());
  if (!item) throw new ApiError(404, 'Item not found');
  return res.json({ item });
});
