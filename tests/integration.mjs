import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3015';
assert(['localhost','127.0.0.1'].includes(new URL(base).hostname), 'Tests only target a local application');
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l => l.includes('=')).map(l => [l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1)]));
const admin = createClient(env.SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const users = [];
const makeClient = () => ({ cookie:'' });
async function call(client, method, path, data, status=200, extra={}) {
 const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',Cookie:client.cookie,...extra},...(data!==undefined?{body:JSON.stringify(data)}:{})});
 const result=r.status===204?null:await r.json();
 assert.equal(r.status,status,`${method} ${path}: ${JSON.stringify(result)}`);
 const cookie=r.headers.get('set-cookie'); if(cookie)client.cookie=cookie.split(';')[0];
 return result;
}
try {
 const a=makeClient(),b=makeClient(),anon=makeClient();
 await call(anon,'GET','/api/quizzes',undefined,401);
 anon.cookie='userId=anything'; await call(anon,'GET','/api/quizzes',undefined,401);
 anon.cookie='quiz_session='+'a'.repeat(64); await call(anon,'GET','/api/quizzes',undefined,401);
 for(const c of [a,b]) {
  const email=`integration-${randomUUID()}@example.com`;
  const r=await call(c,'POST','/api/auth/signup',{email,password:'IntegrationOnly123!'},201);
  users.push(r.user.id); assert(!JSON.stringify(r).includes('password_hash'));
 }
 const owner=(await call(a,'GET','/api/auth/me')).user;
 const q=(await call(a,'POST','/api/quizzes',{title:'Integration test',description:'Disposable test data'},201)).quiz;
 await call(b,'GET',`/api/quizzes/${q.id}`,undefined,404);
 await call(a,'POST','/api/quizzes',{title:'x'},403,{Origin:'https://untrusted.example'});
 await call(a,'POST',`/api/quizzes/${q.id}/items`,{items:[{question:'Q',answer:'',position:-1}]},400);
 const items=(await call(a,'POST',`/api/quizzes/${q.id}/items`,{items:[
  {question:'What is 0 minus 1?',answer:'-1',accepted_answers:['negative one'],position:0},
  {question:'What is 1 plus 0?',answer:'1',position:1},
  {question:'Which planet is the Red Planet?',answer:'Mars',explanation:'Iron oxides give Mars its reddish appearance.',position:2}
 ]},201)).items;
 const sid=(await call(a,'POST','/api/sessions',{quiz_id:q.id,mode:'typing'},201)).id;
 let s=(await call(a,'GET',`/api/sessions/${sid}`)).session;
 assert(!JSON.stringify(s.questions).includes('accepted_answers')); assert(s.questions.every(x=>!('answer' in x)));
 await call(b,'GET',`/api/sessions/${sid}`,undefined,404);
 await call(a,'POST',`/api/sessions/${sid}/answers`,{item_id:s.questions[1].id,answer:'x'},409);
 const item=items.find(i=>i.id===s.questions[0].id);
 const input={item_id:item.id,answer:item.answer==='Mars'?'  MARS  ':item.answer};
 const [first,retry]=await Promise.all([call(a,'POST',`/api/sessions/${sid}/answers`,input),call(a,'POST',`/api/sessions/${sid}/answers`,input)]);
 assert.deepEqual(first,retry); assert.equal(first.result.progress,10); assert.equal(first.result.correct,true);
 for(const question of s.questions.slice(1)) {
  const item=items.find(i=>i.id===question.id);
  const answer=item.answer==='-1'?'negative one':item.answer;
  assert.equal((await call(a,'POST',`/api/sessions/${sid}/answers`,{item_id:item.id,answer})).result.correct,true);
 }
 s=(await call(a,'GET',`/api/sessions/${sid}`)).session; assert.equal(s.answers.length,3); assert(s.completed_at);
 const progress=await admin.from('builder_quiz_progress').select('*').eq('user_id',owner.id);
 assert.ifError(progress.error); assert.equal(progress.data.length,3); assert(progress.data.every(p=>p.attempts===1&&p.progress===10));
 const activity=await call(a,'GET','/api/activity'); assert.equal(activity.activity[0].answers,3);
 const library=await call(a,'GET','/api/quizzes'); assert.equal(library.quizzes.find(x=>x.id===q.id).progress,10);
 const mid=(await call(a,'POST','/api/sessions',{quiz_id:q.id,mode:'multiple_choice'},201)).id;
 const ms=(await call(a,'GET',`/api/sessions/${mid}`)).session;
 assert(ms.questions.every(x=>x.options.length>=2&&new Set(x.options).size===x.options.length));
 const mq=ms.questions[0]; const mi=items.find(i=>i.id===mq.id);
 const wrong=mq.options.find(x=>x!==mi.answer);
 const miss=(await call(a,'POST',`/api/sessions/${mid}/answers`,{item_id:mq.id,answer:wrong})).result;
 assert.equal(miss.correct,false);assert.equal(miss.progress,0);
 await call(a,'PUT',`/api/quizzes/${q.id}`,{is_public:true});
 await call(b,'GET',`/api/quizzes/${q.id}`);
 await call(b,'GET',`/api/quizzes/${q.id}/items`,undefined,404);
 await call(b,'PUT',`/api/quizzes/${q.id}`,{title:'Hijacked'},404);
 await call(b,'DELETE',`/api/quizzes/${q.id}`,undefined,404);
 const bs=(await call(b,'POST','/api/sessions',{quiz_id:q.id,mode:'typing'},201)).id;
 await call(a,'PUT',`/api/quizzes/${q.id}`,{is_public:false});
 await call(b,'GET',`/api/sessions/${bs}`,undefined,404);
 await call(a,'PUT',`/api/quizzes/${q.id}/items/${items[0].id}`,{explanation:'Updated through API'});
 await call(a,'DELETE',`/api/quizzes/${q.id}/items/${items[0].id}`,undefined,204);
 await call(a,'PATCH','/api/auth/me',{session_size:5}); assert.equal((await call(a,'GET','/api/auth/me')).user.session_size,5);
 const oldCookie=a.cookie;
 await call(a,'POST','/api/auth/logout',{});a.cookie=oldCookie;await call(a,'GET','/api/auth/me',undefined,401);
 console.log('PASS: auth, forged-cookie rejection, owner isolation, CSRF, validation, content CRUD, answer hiding, ordering, concurrent retries, typing aliases, multiple choice, persistent progress, activity, visibility revocation, settings, logout.');
} finally {
 if(users.length){const result=await admin.from('builder_users').delete().in('id',users);assert.ifError(result.error);}
}
