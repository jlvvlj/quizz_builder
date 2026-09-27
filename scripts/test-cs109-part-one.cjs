const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const katex=require('katex');
const load=(file,req)=>{const exports={};new Function('exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(exports,req);return exports;};
const notation=load('src/utils/formula-notation.ts');
const {latexFormulaModel}=load('src/utils/latex-formula.ts',()=>notation);
const data=require('../src/data/cs109-part-1-source.json');
const course=require('../src/data/cs109-course.json');
const part=course.parts[0];
// Structure: one section per reader chapter plus the applications, one lesson per heading.
assert.equal(data.deckId,'cs109-part-1');assert.equal(data.label,'Part');
assert.deepEqual(data.sections.map(s=>s.title),[...part.chapters.map(c=>c.title),'Applications']);
assert.equal(data.units.length,66);
assert.deepEqual([...new Set(data.units.map(u=>u.readerChapter))].sort(),[...part.chapters,...part.applications.filter(a=>a.available)].map(c=>c.id).sort());
const MATH=/((?<!\\)\$(?:\\\$|[^$])+?(?<!\\)\$)/g;
const inline=text=>(text.match(MATH)||[]).map(m=>m.slice(1,-1));
const opts={throwOnError:true,strict:false,output:'mathml',trust:({command})=>command==='\\htmlData'};
const tokens=html=>[...html.matchAll(/<(mi|mn|mo|mtext)(?:\s[^>]*)?>(.*?)<\/\1>/g)].map(m=>m[2]).filter(s=>s.trim()).join('');
let math=0,terms=0;const figures=new Set(),slots=[],generic=[];
// Definitions the app falls back to for a letter it knows nothing about; CS109 terms must never land there.
const FALLBACK=/a named quantity in this example|the condition stated here selects|Set [A-Z]: a collection|^Event [^:]+: a set of possible outcomes|raised to the power C|the named set or collection used/;
const check=(expression,unit)=>{
 const model=latexFormulaModel(expression,'cs109-part-1/'+unit.id);
 try{
  const original=katex.renderToString(expression,opts),annotated=katex.renderToString(model.latex,opts);
  assert.equal(tokens(annotated),tokens(original));
  for(const tag of ['mfrac','msub','msup','msubsup','munder','munderover'])assert.equal((annotated.match(new RegExp('<'+tag+'[ >]','g'))||[]).length,(original.match(new RegExp('<'+tag+'[ >]','g'))||[]).length,tag);
 }catch(e){throw Error(`${unit.id}: ${expression}\n${e.message}`);}
 math++;
 for(const term of model.terms){terms++;if(FALLBACK.test(term.definition))generic.push(`${unit.id}: ${term.symbol} → ${term.definition}`);}
};
for(const unit of data.units){
 assert.ok(unit.content.length,unit.id);assert.ok(data.sections.some(s=>s.id===unit.section),unit.id);
 for(const e of inline(unit.title))check(e,unit);
 let cardOpen=false;
 for(const block of unit.content){
  assert.ok(!/@endcard|@figure|@interactive|@summary|@@/.test(block.text||''),`${unit.id}: directive leaked into text`);
  if(block.kind==='keypoint'){assert.ok(!cardOpen,`Nested card ${unit.id}`);cardOpen=true;assert.ok(!block.text.includes('\n')&&block.text.length<=120,`${unit.id}: card title swallowed its body: ${block.text.slice(0,60)}`);}
  if(block.kind==='cardEnd'){assert.ok(cardOpen,`Unmatched card end ${unit.id}`);cardOpen=false;}
  if(block.kind==='figure'){assert.ok(fs.existsSync('public'+block.src),`Missing ${block.src}`);assert.ok(block.alt&&block.alt.length>20,`${unit.id}: figure needs a description`);figures.add(block.image);}
  if(block.kind==='interactive')slots.push(block.text);
  if(block.kind==='code')assert.ok(block.text.trim().length,`${unit.id}: empty code block`);
  const texts=block.kind==='formula'?[]:block.kind==='list'?block.items:[block.text||''];
  for(const text of texts)assert.equal((text.match(/(?<!\\)\$/g)||[]).length%2,0,`Unclosed inline math in ${unit.id}: ${text.slice(0,60)}`);
  const expressions=block.kind==='formula'?[block.text]:texts.flatMap(inline);
  for(const e of expressions)check(e,unit);
 }
 assert.ok(!cardOpen,`Unclosed card ${unit.id}`);
}
assert.equal(figures.size,14);
// Everyday stories: CS109's own, built from its own file, in this course's words.
const everyday=require('../src/data/cs109-everyday.json');
const manifest=everyday.manifests['cs109-part-1'];
let stories=0;
for(const [unit,entries] of Object.entries(manifest)){
 assert.ok(data.units.some(u=>u.id===unit),`Stories for an unknown lesson ${unit}`);
 assert.ok(entries.length<=5&&new Set(entries.map(e=>e.scenario)).size===entries.length,`${unit}: one story per scenario at most`);
 for(const entry of entries){
  const blocks=everyday.content[entry.id];stories++;
  assert.ok(blocks&&blocks.length,`Missing story ${entry.id}`);
  for(const block of blocks){
   assert.doesNotMatch(block.text,/Ω|\bchapter\b|\bthe book\b|\bthis book\b/i,`${entry.id} uses the book course's wording`);
   assert.equal((block.text.match(/(?<!\\)\$/g)||[]).length,0,`${entry.id}: unescaped $ would start math`);
   // Story arithmetic is typeset and explained too, and must also resolve to this course's definitions.
   for(const line of block.text.split('\n'))for(const part of notation.splitMath(line))if(part.math)for(const term of notation.formulaModel(part.text,'cs109-part-1/'+unit).terms){terms++;if(FALLBACK.test(term.definition))generic.push(`${entry.id}: ${term.symbol} → ${term.definition}`);}
  }
 }
}
if(generic.length){console.log(generic.slice(0,30).join('\n'));}
assert.equal(generic.length,0,`${generic.length} terms fell back to a generic definition`);
// The two courses never share content: nothing in CS109's data may point at the book course.
for(const file of ['src/data/cs109-part-1-native.md','src/data/cs109-part-1-source.json','src/data/cs109-course.json','src/data/cs109-part-1-everyday.md','src/data/cs109-everyday.json'])
 assert.doesNotMatch(fs.readFileSync(file,'utf8'),/probability-chapter-\d|everyday-c\d|Bertsekas|Tsitsiklis/,`${file} refers to the book course`);
// Source errata must stay corrected.
const all=JSON.stringify(data);
assert.ok(!all.includes('Probaiblity')&&!all.includes('YWhile')&&!all.includes('bellow')&&!all.includes('resistent'),'source typos');
assert.ok(data.units.find(u=>u.id==='bacteria-evolution').formulas.some(f=>f.includes('M^C)')),'complement of M');
assert.ok(!data.units.find(u=>u.id==='netflix-genres').formulas.some(f=>/L[123]\|/.test(f)),'L_1, L_2, L_3 subscripts');
assert.ok(data.units.find(u=>u.id==='independence-alternative-definition').formulas.some(f=>f.includes('P(A,B) \\\\')),'row break after P(A,B)');
// Notation specific to this course.
assert.match(notation.describeTerm('S','cs109-part-1/probability-events-and-experiments'),/Sample space/);
assert.match(notation.probabilityTerms('E \\text{ and } F','cs109-part-1/prob-and-intro').whole.definition,/both E and F occur/);
assert.match(notation.probabilityTerms('E^C','cs109-part-1/axioms-provable-identities').whole.definition,/E does not occur/);
assert.match(notation.describeTerm('e','cs109-part-1/log-probabilities-intro'),/natural logarithm/);
assert.match(notation.describeTerm('n','cs109-part-1/many-flips-intro'),/coin flips/);
// Interactive figures: every slot the text refers to must be built.
const registry=fs.readFileSync('src/components/interactive/cs109/registry.tsx','utf8');
const unbuilt=slots.filter(id=>!registry.includes(`'${id}'`));
console.log(`Passed: 66 lessons, ${data.sections.length} sections, 14 figures, ${math} exact math token/structure comparisons, ${terms} explained terms, ${stories} everyday stories across ${Object.keys(manifest).length} lessons.`);
console.log(`Interactive slots: ${slots.length}, built ${slots.length-unbuilt.length}${unbuilt.length?`; not built: ${unbuilt.join(', ')}`:''}.`);
assert.equal(unbuilt.length,0,'unbuilt interactive figures');
