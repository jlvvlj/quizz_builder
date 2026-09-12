import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createClient} from '@supabase/supabase-js';
const env=Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')&&!l.startsWith('#')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i),l.slice(i+1).trim().replace(/^['"]|['"]$/g,'')];}));
const db=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const base=process.env.TEST_BASE_URL||'http://localhost:3016';assert.match(base,/^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
const created=[];
const fixtureDeck=`test-deck-${Date.now()}`;
async function call(path,{method='GET',body,cookie,headers={}}={}){const r=await fetch(base+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...headers},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json().catch(()=>null),cookie:r.headers.getSetCookie().find(s=>s.startsWith('quiz_session='))?.split(';')[0]};}
try{
 assert.equal((await call('/api/settings/get')).status,401);
 assert.equal((await call('/api/settings/get',{cookie:'userId=bc053d02-6153-4e7b-a384-167b338d3f9d'})).status,401);
 const accounts=[];
 for(let i=0;i<2;i++){const email=`test-${Date.now()}-${i}@example.com`;const a=await call('/api/auth/signup',{method:'POST',body:{email,password:'TestingOnly123!'}});assert.equal(a.status,201,JSON.stringify(a));created.push(a.data.user.id);accounts.push(a);}
 const a=accounts[0],b=accounts[1];
 assert.ok(a.cookie);assert.notEqual(a.cookie,b.cookie);
 assert.equal((await call('/api/session/init',{method:'POST',cookie:a.cookie})).data.userId,a.data.user.id);
 const cat=await call('/api/catalog',{cookie:a.cookie});assert.equal(cat.data.total,500);assert.equal(cat.data.sections.length,1);assert.deepEqual(cat.data.sections[0].steps.map(s=>s.items),[100,100,100,100,100]);
 // A partial step must come from actual content, never an assumed 100 items.
 const fixture=await db.from('learning_decks').insert({id:fixtureDeck,title:'Temporary count test',description:'Test fixture',question_label:'Question',answer_label:'Answer'});assert.ifError(fixture.error);
 const fixtureItems=await db.from('words10k').insert([1,2,3].map(n=>({deck_id:fixtureDeck,japanese_word:`Test prompt ${n}`,english:`Test answer ${n}`,section:'section_9001',step:n<3?'step_1':'step_2'})));assert.ifError(fixtureItems.error);
 const partial=(await call('/api/catalog',{cookie:a.cookie})).data.sections.find(s=>s.id==='section_9001');assert.equal(partial.count,3);assert.deepEqual(partial.steps.map(s=>s.items),[2,1]);
 assert.ifError((await db.from('words10k').delete().eq('deck_id',fixtureDeck)).error);assert.ifError((await db.from('learning_decks').delete().eq('id',fixtureDeck)).error);
 const settings=(await call('/api/settings/get',{cookie:a.cookie})).data;
 const savedSettings=await call('/api/settings/update',{method:'POST',cookie:a.cookie,body:{...settings,sessionSize:3,quizDirection:'forward'}});assert.equal(savedSettings.status,200);assert.equal(savedSettings.data.sessionSize,3);
 assert.equal((await call('/api/settings/get',{cookie:b.cookie})).data.sessionSize,7);
 assert.equal((await call('/api/settings/update',{method:'POST',cookie:a.cookie,body:settings,headers:{Origin:'https://other.example'}})).status,403);
 const next=await call('/api/progress/last-word?section=section_1&step=step_1&sessionSize=3',{cookie:a.cookie});assert.equal(next.status,200);
 const payload={wordDifficulties:{1:{progress:20,timeToAnswer:1.5,totalMisses:0,correctAnswers:1}},quizType:'multiple_choice'};
 assert.equal((await call('/api/progress/save',{method:'POST',cookie:a.cookie,body:payload})).status,200);
 const progress=(await call('/api/progress/get-batch?cardIds=1&quizType=multiple_choice',{cookie:a.cookie})).data;assert.equal(progress[1].progress,20);
 assert.equal((await call('/api/progress/get-batch?cardIds=1&quizType=multiple_choice',{cookie:b.cookie})).data[1].progress,0);
 assert.equal((await call('/api/progress/get-batch?cardIds=1&quizType=typing',{cookie:a.cookie})).data[1].progress,0);
 const introduced=await call('/api/progress/introduced?cardIds=1',{cookie:a.cookie});assert.deepEqual(introduced.data.introducedIds,[1]);
 const step=await call('/api/progress/step-progress?section=section_1&step=step_1',{cookie:a.cookie});assert.equal(step.data.totalWords,100);assert.equal(step.data.progress,0);
 const mark=await call('/api/progress/update-marked-status',{method:'POST',cookie:a.cookie,body:{content:'words',itemId:1,markedAs:'mastered',quizType:'typing'}});assert.equal(mark.status,200);
 assert.equal((await call('/api/dashboard/streak',{cookie:a.cookie})).data.currentStreak,1);
 assert.equal((await call('/api/auth/me',{cookie:a.cookie+'; userId='+b.data.user.id})).data.user.id,a.data.user.id);
 for(const table of ['users','app_sessions','user_progress','user_daily_activity']){const r=await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=*`,{headers:{apikey:env.NEXT_PUBLIC_SUPABASE_ANON_KEY,Authorization:`Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`}});assert.ok([401,403].includes(r.status),table);assert.equal((await r.json()).code,'42501',table);}
 assert.equal((await call('/api/auth/logout',{method:'POST',cookie:a.cookie})).status,200);assert.equal((await call('/api/auth/me',{cookie:a.cookie})).status,401);
 console.log('PASS: signup, session verification, catalog counts, settings, CSRF, progress, separate quiz modes, account isolation, marking, activity, RLS and logout');
}finally{assert.ifError((await db.from('words10k').delete().eq('deck_id',fixtureDeck)).error);assert.ifError((await db.from('learning_decks').delete().eq('id',fixtureDeck)).error);for(const id of created){const {error}=await db.from('users').delete().eq('id',id);if(error)throw error;}}
