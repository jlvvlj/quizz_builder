// Creates sample content through the public application API, never direct SQL.
// Run only against a local preview. Uses the documented disposable test account.
const base=process.env.TEST_BASE_URL || 'http://127.0.0.1:3015';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('Demo seeding requires a local preview');
let cookie='';
async function call(method,path,body){
 const res=await fetch(base+path,{method,headers:{'Content-Type':'application/json',Cookie:cookie},...(body?{body:JSON.stringify(body)}:{})});
 const data=await res.json();const setCookie=res.headers.get('set-cookie');if(setCookie)cookie=setCookie.split(';')[0];
 return {res,data};
}
const credentials={email:'claude-verify@example.com',password:'JalingoTest123!'};
let auth=await call('POST','/api/auth/login',credentials);
if(auth.res.status===401)auth=await call('POST','/api/auth/signup',credentials);
if(!auth.res.ok)throw new Error(JSON.stringify(auth.data));
const samples=[
 {title:'Science essentials',description:'From tiny atoms to distant planets. Revisit the ideas that explain our world.',items:[
  {question:'Which planet is known as the Red Planet?',answer:'Mars',explanation:'Iron oxides on its surface give Mars a reddish appearance.'},
  {question:'What gas do plants absorb during photosynthesis?',answer:'Carbon dioxide',accepted_answers:['CO2','CO₂']},
  {question:'What force keeps planets in orbit around the Sun?',answer:'Gravity',accepted_answers:['Gravitation']},
  {question:'What is the chemical symbol for gold?',answer:'Au'}]},
 {title:'Around the world',description:'Places, landscapes, and a few familiar landmarks. See how much you remember.',items:[
  {question:'What is the capital of France?',answer:'Paris'},
  {question:'On which continent is the Sahara Desert?',answer:'Africa'},
  {question:'Which ocean lies between Africa and Australia?',answer:'Indian Ocean',accepted_answers:['The Indian Ocean']},
  {question:'Which country is home to the city of Kyoto?',answer:'Japan'}]},
 {title:'Computer fundamentals',description:'The everyday ideas behind the digital world, one small question at a time.',items:[
  {question:'What does CPU stand for?',answer:'Central processing unit'},
  {question:'How many bits are in a byte?',answer:'8',accepted_answers:['eight']},
  {question:'What does a binary digit represent: one of how many values?',answer:'2',accepted_answers:['two']},
  {question:'What does RAM stand for?',answer:'Random access memory'}]}
];
const library=await call('GET','/api/quizzes');if(!library.res.ok)throw new Error(JSON.stringify(library.data));
for(const sample of samples){
 if(library.data.quizzes.some(q=>q.owned && q.title===sample.title)){console.log('Already present:',sample.title);continue;}
 const {res,data}=await call('POST','/api/quizzes',{title:sample.title,description:sample.description,is_public:true});
 if(!res.ok)throw new Error(JSON.stringify(data));
 const created=await call('POST',`/api/quizzes/${data.quiz.id}/items`,{items:sample.items.map((item,position)=>({...item,position}))});
 if(!created.res.ok)throw new Error(JSON.stringify(created.data));
 console.log('Created:',sample.title,data.quiz.id);
}
console.log('Sample quizzes available. Sign in with the documented local test account.');
