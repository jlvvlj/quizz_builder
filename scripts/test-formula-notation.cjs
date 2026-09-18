const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const katex = require('katex');
const compiled = ts.transpileModule(fs.readFileSync('src/utils/formula-notation.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const notation = {};new Function('exports', compiled)(notation);
const {splitMath,formulaModel,describeTerm} = notation;
const render = s => katex.renderToString(formulaModel(s).latex,{throwOnError:true,strict:false,trust:({command})=>command==='\\htmlData'});
assert.deepEqual(splitMath('pᵏ(1 − p)ⁿ⁻ᵏ'),[{text:'pᵏ(1 − p)ⁿ⁻ᵏ',math:true}]);
assert.deepEqual(splitMath('De Morgan’s laws, i.e., sets.'),[{text:'De Morgan’s laws, i.e., sets.'}]);
assert.deepEqual(splitMath('(x, y)'),[{text:'(x, y)',math:true}]);
assert.ok(render('P(A | B) = P(A ∩ B)/P(B)').includes('mfrac'));
assert.ok(render('C(n, k) = n!/[k!(n − k)!]').includes('mfrac'));
assert.ok(render('(S ∪ T)ᶜ = Sᶜ ∩ Tᶜ').includes('msup'));
assert.match(describeTerm('|','','{x | x ∈ S}'), /Such that/);
assert.match(describeTerm('|','','P(A | B)'), /Given/);
assert.match(describeTerm('Ω'), /all possible outcomes/);
const data=JSON.parse(fs.readFileSync('src/data/probability-chapter-1-source.json','utf8'));
let native=0, regions=0;
for(const unit of data.units){
 for(const text of [unit.openingText,...unit.summary,...unit.mathPassages.map(p=>p.text||'')]) {
  const parts=splitMath(text);assert.equal(parts.map(p=>p.text).join(''),text,'Preserve every source character');
  for(const part of parts)if(part.math){render(part.text);native++;}
  for(const line of text.split('\n')) {const math=splitMath(line).filter(p=>p.math).reduce((n,p)=>n+p.text.length,0);if(math>line.length*.72&&line.length>5)render(line.trim().replace(/[.,]$/,''));}
 }
 for(const image of [...unit.opening.images,...unit.sourcePages,...['cards','examples','figures','mathPassages'].flatMap(k=>unit[k].flatMap(a=>a.images))]){
  assert.ok(Array.isArray(image.formulaRegions),`Missing annotation pass: ${image.src}`);
  for(const region of image.formulaRegions){regions++;assert.ok(region.terms.length);for(const term of region.terms){assert.ok(!term.symbol.includes('cid:'));assert.ok(term.bounds.every(Number.isFinite));assert.ok(term.bounds[2]>0&&term.bounds[3]>0);assert.ok(describeTerm(term.symbol,unit.id));}}
 }
}
console.log(`Passed: ${native} inline/display expressions; ${regions} source regions; fractions, powers, combinations, prose preservation and contextual bars.`);
