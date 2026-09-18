const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const katex=require('katex');
const load=(file,requireModule)=>{const exports={};new Function('exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(exports,requireModule);return exports;};
const notation=load('src/utils/formula-notation.ts');
const {latexFormulaModel}=load('src/utils/latex-formula.ts',()=>notation);
const native=require('../src/data/probability-chapter-1-native.json');
const chapter=require('../src/data/probability-chapter-1-source.json');
let assets=0,equations=0;
for(const unit of chapter.units) for(const kind of ['mathPassages','cards','examples','figures']) for(const asset of unit[kind]){
 if(asset.text)continue;
 assert.ok(native[asset.id]?.length,`Missing content ${asset.id}`);assets++;
 for(const block of native[asset.id]){
  assert.ok(!block.text.includes('(cid:'));
  if(block.kind!=='formula')continue;
  equations++;
  const model=latexFormulaModel(block.text,unit.id);
  const opts={throwOnError:true,strict:false,displayMode:true,trust:({command})=>command==='\\htmlData'};
  try{
   const original=katex.renderToString(block.text,{...opts,output:'mathml'});
   const annotated=katex.renderToString(model.latex,{...opts,output:'mathml'});
   // Coloring and wrappers must not change the mathematical tokens or their order.
   const tokens=html=>[...html.matchAll(/<(mi|mn|mo|mtext)(?:\s[^>]*)?>(.*?)<\/\1>/g)].map(m=>m[2]).filter(s=>s.trim());
   assert.equal(tokens(annotated).join(''),tokens(original).join(''),`Changed math: ${asset.id}`);
   for (const tag of ['mfrac','msub','msup','msubsup','munder','munderover']) assert.equal((annotated.match(new RegExp('<'+tag+'[ >]','g'))||[]).length,(original.match(new RegExp('<'+tag+'[ >]','g'))||[]).length,`Changed structure ${tag}: ${asset.id}`);
   assert.ok(model.terms.length);
  }catch(e){throw Error(`${asset.id}: ${block.text}\n${e.message}`);}
 }
}
assert.equal(assets,66);assert.equal(equations,165);
assert.ok(native['conditional-probability-law-math-1'].some(b=>b.text.includes('A_1\\cup A_2\\mid B')));
assert.ok(native['cards-6'].some(b=>b.text.includes('number of elements')));
assert.ok(native['examples-14'].some(b=>b.text.includes('0.752')));
console.log(`Passed: ${assets} native assets, ${equations} exact mathematical token comparisons, complete prose/card/example coverage.`);
