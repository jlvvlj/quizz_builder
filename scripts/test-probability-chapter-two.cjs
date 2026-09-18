const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const katex=require('katex');
const load=(file,req)=>{const exports={};new Function('exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(exports,req);return exports;};
const notation=load('src/utils/formula-notation.ts');
const {latexFormulaModel}=load('src/utils/latex-formula.ts',()=>notation);
const data=require('../src/data/probability-chapter-2-source.json');
assert.equal(data.sections.length,8);assert.equal(data.units.length,20);
const examples=new Set(),figures=[],cards=[];let math=0;
for(const unit of data.units){
 assert.ok(unit.content.length);assert.ok(unit.openingText);assert.ok(unit.summary.length);
 assert.ok(data.sections.some(s=>s.id===unit.section));
 let cardOpen=false;
 for(const block of unit.content){
  assert.ok(!/\(cid:|@endcard|@page/.test(block.text));
  if(block.kind==='keypoint'){assert.ok(!cardOpen,`Nested card ${unit.id}`);cardOpen=true;cards.push(block.text);}
  if(block.kind==='cardEnd'){assert.ok(cardOpen,`Unmatched card end ${unit.id}`);cardOpen=false;}
  if(block.kind==='heading' && /^Example 2\./.test(block.text))examples.add(Number(block.text.match(/^Example 2\.(\d+)/)[1]));
  if(block.kind==='figure'){assert.ok(fs.existsSync('public'+block.src));figures.push(Number(block.text.split('.')[1]));}
  const expressions=block.kind==='formula'?[block.text]:[...block.text.matchAll(/\$([^$]+)\$/g)].map(m=>m[1]);
  assert.equal((block.text.match(/\$/g)||[]).length%2,0,`Unclosed inline math in ${unit.id}`);
  for(const expression of expressions){
   const model=latexFormulaModel(expression,'chapter-2/'+unit.id);
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
assert.deepEqual([...examples].sort((a,b)=>a-b),Array.from({length:19},(_,i)=>i+1));
assert.deepEqual(figures,[1,2,3,4,5,7,8,9,10,11,12,13,14,15]); // Figure 2.6 is absent in the supplied PDF.
assert.equal(cards.length,13);
assert.match(notation.describeTerm('E','chapter-2/expectation'),/Expected value/);
assert.match(notation.describeTerm('pX\\mid Y','chapter-2/conditioning'),/Conditional PMF/);
assert.match(notation.describeTerm('X','chapter-2/basic-concepts'),/random variable/);
// Mathematical source errata must remain corrected.
assert.ok(data.units.find(u=>u.id==='summary-and-discussion').formulas.some(f=>f.includes('p_{Z}(z)p_{Y\\mid Z}')));
assert.ok(data.units.find(u=>u.id==='independence-of-several-variables').formulas.some(f=>f.includes('1-P(A)')));
console.log(`Passed: 20 lessons, 8 sections, 19 examples, 14 figures, 13 cards, ${math} exact math token/structure comparisons.`);
