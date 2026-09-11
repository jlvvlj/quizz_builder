import { api, checked, db, method, user } from '@/server/api';
export default api(async (req, res) => {
  method(req, res, ['GET']);
  const current = await user(req);
  const activity = checked(await db().from('builder_user_daily_activity').select('activity_date,answers').eq('user_id', current.id).order('activity_date', { ascending: false }).limit(366));
  const sessions = checked(await db().from('builder_quiz_sessions').select('id,quiz_id,created_at,builder_quizzes(title)').eq('user_id', current.id).is('completed_at', null).order('created_at', { ascending: false }).limit(5));
  return res.json({ activity, sessions });
});
