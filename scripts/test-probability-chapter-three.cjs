const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const katex=require('katex');
const load=(file,req)=>{const exports={};new Function('exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(exports,req);return exports;};
const notation=load('src/utils/formula-notation.ts');
const {latexFormulaModel}=load('src/utils/latex-formula.ts',()=>notation);
const data=require('../src/data/probability-chapter-3-source.json');
assert.equal(data.sections.length,7);assert.equal(data.units.length,19);
assert.equal(data.deckId,'probability-chapter-3');assert.equal(data.chapterNumber,3);
const examples=new Set(),figures=[],cards=[];let math=0;
for(const unit of data.units){
 assert.ok(unit.content.length);assert.ok(unit.openingText);assert.ok(unit.summary.length);
 assert.ok(data.sections.some(s=>s.id===unit.section));
 assert.ok(unit.sourceRange.firstPdfPage>=99&&unit.sourceRange.lastPdfPage<=150,`Page range outside chapter 3 in ${unit.id}`);
 let cardOpen=false;
 for(const block of unit.content){
  assert.ok(!/\(cid:|@endcard|@page|@figure|@summary/.test(block.text));
  if(block.kind==='keypoint'){assert.ok(!cardOpen,`Nested card ${unit.id}`);cardOpen=true;cards.push(block.text);}
  if(block.kind==='cardEnd'){assert.ok(cardOpen,`Unmatched card end ${unit.id}`);cardOpen=false;}
  if(block.kind==='heading' && /^Example 3\./.test(block.text))examples.add(Number(block.text.match(/^Example 3\.(\d+)/)[1]));
  if(block.kind==='figure'){assert.ok(fs.existsSync('public'+block.src),`Missing ${block.src}`);figures.push(Number(block.text.split('.')[1]));}
  const expressions=block.kind==='formula'?[block.text]:[...block.text.matchAll(/\$([^$]+)\$/g)].map(m=>m[1]);
  assert.equal((block.text.match(/\$/g)||[]).length%2,0,`Unclosed inline math in ${unit.id}`);
  for(const expression of expressions){
   const model=latexFormulaModel(expression,'chapter-3/'+unit.id);
   const opts={throwOnError:true,strict:false,output:'mathml',trust:({command})=>command==='\\htmlData'};
   try{
    const original=katex.renderToString(expression,opts),annotated=katex.renderToString(model.latex,opts);
    const tokens=html=>[...html.matchAll(/<(mi|mn|mo|mtext)(?:\s[^>]*)?>(.*?)<\/\1>/g)].map(m=>m[2]).filter(s=>s.trim()).join('');
    assert.equal(tokens(annotated),tokens(original));
    for(const tag of ['mfrac','msub','msup','msubsup','munder','munderover'])assert.equal((annotated.match(new RegExp('<'+tag+'[ >]','g'))||[]).length,(original.match(new RegExp('<'+tag+'[ >]','g'))||[]).length,tag);
   }catch(e){throw Error(`${unit.id}: ${expression}\n${e.message}`);}
   math++;
  }
 }
 assert.ok(!cardOpen,`Unclosed card ${unit.id}`);
}
assert.deepEqual([...examples].sort((a,b)=>a-b),Array.from({length:29},(_,i)=>i+1));
assert.deepEqual(figures,[1,2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26]); // Figure 3.12 is absent in the supplied PDF.
assert.equal(cards.length,12);
// Every printed subsection heading is its own lesson, and boxed titles stay inside one.
assert.deepEqual(data.units.filter(u=>u.kind==='subsection').map(u=>u.title),['Expectation','Exponential Random Variable','The Standard Normal Random Variable','Expectation','Conditioning One Random Variable on Another',"Inference and the Continuous Bayes' Rule",'Independence','Joint CDFs','More than Two Random Variables','The Linear Case','The Monotonic Case','Functions of Two Random Variables']);
assert.deepEqual(data.units.filter(u=>u.kind==='introduction').map(u=>u.section),['3.1','3.3','3.5','3.6']);
// Mathematical source errata must remain corrected.
assert.ok(data.units.find(u=>u.id==='continuous-bayes').content.some(b=>b.text.includes('f_{X\\mid Y}(x\\mid y)$ is contained')||b.text.includes('conditional PDF $f_{X\\mid Y}')),'Example 3.18 must name the posterior conditional PDF');
assert.ok(!JSON.stringify(data).includes('f_{X\\mid X}'),'The f_{X|X} typo of the source must stay corrected');
assert.ok(data.units.find(u=>u.id==='joint-cdfs').content.some(b=>b.text.includes('recovered from the CDF')),'The "recovered from the PDF" typo of the source must stay corrected');
// Chapter 3 notation: densities, distribution functions and the normal table.
assert.match(notation.describeTerm('E','chapter-3/expectation'),/Expected value/);
assert.match(notation.describeTerm('var','chapter-3/expectation'),/Variance/);
assert.match(notation.describeTerm('fX','chapter-3/pdfs-introduction'),/Probability density function/);
assert.match(notation.describeTerm('fX,Y','chapter-3/multiple-continuous-introduction'),/Joint PDF/);
assert.match(notation.describeTerm('fX|Y','chapter-3/conditioning-one-on-another'),/Conditional PDF/);
assert.match(notation.describeTerm('FX','chapter-3/cumulative-distribution-functions'),/Cumulative distribution function/);
assert.match(notation.describeTerm('\u03a6','chapter-3/standard-normal'),/standard normal/i);
assert.match(notation.describeTerm('\u03bb','chapter-3/exponential-random-variable'),/exponential/);
// An integral's scripts are the region it accumulates over, never a summation index.
const integral=(expression,context='chapter-3/u')=>latexFormulaModel(expression,context).terms.filter(t=>/[\u222b\u222c\u222d]/.test(t.symbol)).map(t=>t.definition);
assert.deepEqual(integral('\\int_{-\\infty}^{\\infty}xf_{X}(x)\\,dx'),['Integrates over the whole real line.']);
assert.deepEqual(integral('\\int_{a}^{b}f_{X}(x)\\,dx'),['Integrates over the interval from a to b.']);
assert.deepEqual(integral('\\int_{-\\infty}^{x}f_{X}(t)\\,dt'),['Integrates over everything up to x.']);
assert.deepEqual(integral('\\int_{B}f_{X}(x)\\,dx'),['Integrates over the set B.']);
assert.match(integral('\\iint_{(x,y)\\in B}f_{X,Y}(x,y)\\,dx\\,dy')[0],/every \(x, y\) in B/);
// The d of a differential marks the variable of integration; it is not a quantity to define.
assert.ok(!latexFormulaModel('\\int_{0}^{1}f_{X}(x)\\,dx','chapter-3/u').terms.some(t=>t.symbol==='d'));
// No expression anywhere in the chapter may fall back to a definition meant for another chapter.
let terms=0;
for(const unit of data.units)for(const block of unit.content){
 const expressions=block.kind==='formula'?[block.text]:[...block.text.matchAll(/\$([^$]+)\$/g)].map(m=>m[1]);
 for(const expression of expressions)for(const term of latexFormulaModel(expression,'chapter-3/'+unit.id).terms){
  terms++;
  assert.doesNotMatch(term.definition,/condition stated here selects|Complement: outcomes outside/,`${unit.id}: ${term.symbol}`);
 }
}
console.log(`Passed: 19 lessons, 7 sections, 29 examples, 25 figures, 12 cards, ${math} exact math token/structure comparisons, ${terms} explained terms.`);
