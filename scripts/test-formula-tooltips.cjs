// Enforces the formula tooltip rule for every chapter:
//   1. Ultra-basic notation (operators, bare P, plain numbers) gets no tooltip.
//   2. A P(...) atom is explained as a whole plus its bracketed event, never symbol by symbol.
//   3. A tooltip label never leaks authored TeX, and no definition falls back to a generic catch-all.
// New chapters are picked up automatically: add the data file to CHAPTERS below.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const load=(file,requireModule)=>{const exports={};new Function('exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(exports,requireModule);return exports;};
const notation=load('src/utils/formula-notation.ts');
const {latexFormulaModel}=load('src/utils/latex-formula.ts',()=>notation);
const {shouldExplainTerm}=notation;

// 1. Nothing ultra-basic is ever explained.
for(const glyph of ['+','-','−','=','×','·','/','<','>','≤','≥','≠','≈','(',')','[',']','{','}',',','.',';',':','P',
                    '0','1','10','0.25','1.','0.','10^{2}','10^{-2}','1²','2.'])
 assert.equal(shouldExplainTerm(glyph),false,`Basic notation must not be explained: ${glyph}`);
// Real notation still is.
for(const glyph of ['∪','∩','Ω','∅','∈','⊂','!','∑','λ','A','X','pᵏ'])
 assert.equal(shouldExplainTerm(glyph),true,`Real notation must stay explained: ${glyph}`);

// 2. A probability atom is explained as a whole plus its event, and nothing inside it.
const labels=(expr,context='')=>latexFormulaModel(expr,context).terms.map(t=>t.symbol);
const defs=(expr,context='')=>Object.fromEntries(latexFormulaModel(expr,context).terms.map(t=>[t.symbol,t.definition]));
assert.deepEqual(labels('P(A\\mid B)'),['A|B','P(A|B)']);
assert.deepEqual(labels('P(A_1\\cup A_2\\cup A_3)'),['A₁∪A₂∪A₃','P(A₁∪A₂∪A₃)']);
assert.deepEqual(labels('P(A)+P(B)=1'),['A','P(A)','B','P(B)'],'Operators inside an equation stay unexplained');
assert.equal(defs('P(A\\mid B)')['P(A|B)'],'The probability that A occurs, given that B occurs.');
assert.equal(defs('P(A_1\\cup A_2\\cup A_3)')['P(A₁∪A₂∪A₃)'],'The probability that A₁, A₂, or A₃ occurs (including overlaps).');
assert.equal(defs('P(A\\cap B)')['P(A∩B)'],'The probability that both A and B occur.');
assert.equal(defs('P(A^c\\cap B)')['P(Aᶜ∩B)'],'The probability that A does not occur and B occurs.');
// A conditional PMF is read as conditional, and a subscript's braces are not set-builder braces.
assert.match(defs('p_{X\\mid Y}(x\\mid y)','chapter-2/u')['pX|Y'],/Conditional PMF/);
assert.match(notation.describeTerm('|','','p_{X\\mid Y}(x\\mid y)'),/^Given/);
assert.match(notation.describeTerm('|','','\\{x \\mid x \\in S\\}'),/^Such that/);

// 3. Sweep every authored expression in every chapter.
const CHAPTERS=[
 {source:'src/data/probability-chapter-1-source.json',native:'src/data/probability-chapter-1-native.json',context:u=>u},
 {source:'src/data/probability-chapter-2-source.json',context:u=>'chapter-2/'+u},
];
const MATH_SPAN=/(?<!\\)\$((?:\\\$|[^$])+?)(?<!\\)\$/g;
const GENERIC=/the condition stated here selects which outcomes to include/;
// A big operator is read by its index, so the index-free wording is a bug, not a default.
const INDEX_FREE=/^(?:Sum: add|Product: multiply|Union over|Intersection over)/;
let checked=0,indexed=0;
const sweep=(expr,context,where)=>{
 for(const term of latexFormulaModel(expr,context).terms){
  checked++;
  assert.ok(shouldExplainTerm(term.symbol),`${where}: basic glyph explained: ${term.symbol}`);
  assert.ok(!/\\[A-Za-z]|\^\{|_\{/.test(term.symbol),`${where}: raw TeX in label: ${term.symbol} (${expr})`);
  assert.ok(!GENERIC.test(term.definition),`${where}: generic catch-all definition for ${term.symbol} (${expr})`);
  assert.ok(term.definition.trim().length>2,`${where}: empty definition for ${term.symbol}`);
  if(!/^[\u2211\u220f\u22c3\u22c2\u03a3]/.test(term.symbol))continue;
  indexed++;
  assert.ok(!INDEX_FREE.test(term.definition),`${where}: big operator explained without its index: ${term.symbol} (${expr})`);
 }
};
for(const chapter of CHAPTERS){
 const data=JSON.parse(fs.readFileSync(chapter.source,'utf8'));
 const native=chapter.native?JSON.parse(fs.readFileSync(chapter.native,'utf8')):null;
 const blocks=[];
 if(native){
  for(const unit of data.units)for(const kind of ['mathPassages','cards','examples','figures'])for(const asset of unit[kind]||[])
   for(const block of native[asset.id]||[])blocks.push({block,unit:unit.id});
 } else {
  for(const unit of data.units)for(const block of unit.content)blocks.push({block,unit:unit.id});
 }
 for(const {block,unit} of blocks){
  const context=chapter.context(unit);
  if(block.kind==='formula'){sweep(block.text,context,unit);continue;}
  // A literal dollar must be escaped, so prose about money is never parsed as math.
  assert.equal((block.text.replace(/\\\$/g,'').match(/\$/g)||[]).length%2,0,`${unit}: unbalanced $ (escape a literal dollar as \\$)`);
  for(const match of block.text.matchAll(MATH_SPAN))sweep(match[1],context,unit);
 }
}
// 4. Each shape of index is explained as what it selects, not as "the indexed terms".
const bigOperator=(expr,context='chapter-2/u')=>latexFormulaModel(expr,context).terms.filter(t=>/^[\u2211\u220f\u22c3\u22c2]/.test(t.symbol)).map(t=>t.definition);
assert.deepEqual(bigOperator('\\sum_{x} p_X(x)'),['Adds one term for every possible value of x.']);
assert.deepEqual(bigOperator('\\sum_{x>0} p_X(x)'),['Adds one term for every value of x that satisfies x > 0; the values that fail that condition are left out.']);
assert.deepEqual(bigOperator('\\sum_{k=1}^{n} a_k'),['Adds one term for each whole-number value of k from 1 up to n.']);
assert.deepEqual(bigOperator('\\sum_{k=0}^{\\infty} a_k'),['Adds one term for each value of k from 0 upward, continuing without end.']);
assert.deepEqual(bigOperator('\\sum_{x\\in S} p'),['Adds one term for every x in S; anything outside S is left out.']);
assert.deepEqual(bigOperator('\\sum_{x,y} p'),['Adds one term for every combination of x and y.']);
assert.deepEqual(bigOperator('\\sum_{\\{x\\mid g(x)=y\\}} p'),['Adds one term for every x satisfying g(x) = y; values that fail that condition contribute nothing.']);
assert.deepEqual(bigOperator('\\bigcup_{n=1}^{\\infty} A_n'),['Unions the sets indexed by each value of n from 1 upward, continuing without end.']);
assert.deepEqual(bigOperator('\\bigcap_{i=1}^{n} A_i'),['Intersects the sets indexed by each whole-number value of i from 1 up to n.']);
assert.deepEqual(bigOperator('\\prod_{i=1}^{n} p_i'),['Multiplies one factor for each whole-number value of i from 1 up to n.']);
// The unicode inline path reaches the same explanations.
assert.equal(notation.describeTerm('\u03a3\u1d62\u208c\u2081\u207f'),'Adds one term for each whole-number value of i from 1 up to n.');
// Two sums in one formula are two different terms, because their indices differ.
const doubleSum=latexFormulaModel('\\sum_{x}\\sum_{y} p_{XY}(x,y)','chapter-2/joint-pmf-introduction').terms.filter(t=>t.symbol==='\u2211');
assert.equal(doubleSum.length,2,'A double sum must explain each index separately');
assert.notEqual(doubleSum[0].id,doubleSum[1].id);
assert.match(doubleSum[0].definition,/value of x\./);
assert.match(doubleSum[1].definition,/value of y\./);

console.log(`Passed: ${checked} tooltips across ${CHAPTERS.length} chapters (${indexed} indexed big operators); basic notation suppressed, P(...) grouped, labels free of raw TeX.`);
