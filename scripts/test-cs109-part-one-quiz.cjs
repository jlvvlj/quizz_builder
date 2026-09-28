const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const quiz=require('../data/cs109/part-1/questions.json');
const deck=require('../data/cs109/part-1/deck.json');
const source=require('../src/data/cs109-part-1-source.json');
const course=require('../src/data/cs109-course.json');
const part=course.parts[0];
// The deck sits where the course registry looks for Part 1 (partSection: section_<number + 4>).
assert.equal(deck.id,part.deckId);
assert.equal(deck.section,`section_${part.number+4}`);
// Steps run 1..n in order, and their counts match the questions.
assert.deepEqual(quiz.steps.map(s=>s.number),quiz.steps.map((_,i)=>i+1));
for(const step of quiz.steps)assert.equal(step.question_count,quiz.questions.filter(q=>q.step===step.number).length,`step ${step.number} count`);
assert.ok(quiz.questions.length>=90,`${quiz.questions.length} questions`);
const lessons=new Map(source.units.map(u=>[u.id,u]));
const ids=new Set(),prompts=new Set();
for(const q of quiz.questions){
 assert.ok(!ids.has(q.id),`duplicate id ${q.id}`);ids.add(q.id);
 assert.ok(!prompts.has(q.question),`duplicate question ${q.question}`);prompts.add(q.question);
 assert.match(q.id,/^CS109-P1-\d{2}-\d{2}$/);
 assert.equal(q.options.length,4,q.id);
 assert.equal(new Set(q.options).size,4,`${q.id} repeats a choice`);
 assert.ok(q.options.includes(q.correct_answer),`${q.id} lacks its answer`);
 assert.ok(q.explanation.trim(),`${q.id} explanation`);
 // Every question tests a Part 1 lesson.
 assert.ok(lessons.has(q.lesson),`${q.id} names unknown lesson ${q.lesson}`);
 assert.equal(lessons.get(q.lesson).readerChapter,q.reader_chapter,q.id);
 // Questions are plain text: no raw TeX, and none of the book course's notation or wording.
 const text=[q.question,...q.options,q.explanation].join(' ');
 assert.doesNotMatch(text,/\$|\\[A-Za-z]/,`${q.id} holds raw TeX`);
 assert.doesNotMatch(text,/Ω|\bchapter\b|\bthe book\b|Bertsekas|Tsitsiklis|probability-chapter/i,`${q.id} uses the book course's wording`);
}
// The correct answer is not always in the same slot.
const slots=new Set(quiz.questions.map(q=>q.options.indexOf(q.correct_answer)));
assert.equal(slots.size,4,'answers use every slot');
// Every section of Part 1 is quizzed.
const quizzed=new Set(quiz.questions.map(q=>q.reader_chapter));
for(const u of source.units)assert.ok(quizzed.has(u.readerChapter),`no question on ${u.readerChapter}`);
// The committed migration is exactly what the generator writes.
const out=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'cs109-quiz-')),'deck.sql');
execFileSync('node',['data/cs109/part-1/generate-sql.mjs',out]);
const migrations=fs.readdirSync('supabase/migrations').filter(f=>fs.readFileSync(`supabase/migrations/${f}`,'utf8').includes(`'${deck.id}'`));
assert.equal(migrations.length,1,`migrations for ${deck.id}: ${migrations}`);
assert.equal(fs.readFileSync(`supabase/migrations/${migrations[0]}`,'utf8'),fs.readFileSync(out,'utf8'),'migration is stale: regenerate it');
console.log(`CS109 Part 1 quiz: ${quiz.questions.length} questions over ${quiz.steps.length} steps, ${quizzed.size} sections.`);
