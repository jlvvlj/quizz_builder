// Every expression in the CS109 reader snapshot must render once its macros are expanded.
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const katex=require('katex');
const dump=execFileSync('python3',['-c',`
import json,sys
sys.path.insert(0,'scripts')
from cs109_reader import chapter, expressions, expand_macros, SOURCE
manifest=json.loads((SOURCE/'manifest.json').read_text())
rows=[[cid,tex,expand_macros(tex)] for cid in manifest['chapters'] for tex in expressions(chapter(cid))]
print(json.dumps({'rows':rows,'probes':[[t,expand_macros(t)] for t in [r'\\P(E \\and F)',r'\\pi + \\partial + \\phi',r'\\E X',r'\\E[X]',r'X \\sim \\Bin(n, p)',r'\\cdot \\choose \\cup',r'E^\\c',r'\\log\\P(x)']]}))
`],{maxBuffer:64<<20}).toString();
const {rows,probes}=JSON.parse(dump);
const map=Object.fromEntries(probes);
// Custom macros become standard TeX; standard commands that share a prefix are left alone.
assert.equal(map['\\P(E \\and F)'],'P(E \\text{ and } F)');
assert.equal(map['\\pi + \\partial + \\phi'],'\\pi + \\partial + \\phi');
assert.equal(map['\\E X'],'E X');
assert.equal(map['\\E[X]'],'E[X]');
// After a control word the expansion is spaced off, or \\log\\P would read as the unknown \\logP.
assert.equal(map['\\log\\P(x)'],'\\log P(x)');
assert.equal(map['X \\sim \\Bin(n, p)'],'X \\sim \\text{Bin}(n, p)');
assert.equal(map['\\cdot \\choose \\cup'],'\\cdot \\choose \\cup');
assert.equal(map['E^\\c'],'E^C');
const failures=[];
for(const [cid,tex,expanded] of rows){
 try{katex.renderToString(expanded,{throwOnError:true,strict:false,displayMode:true,trust:true});}
 catch(e){failures.push(`${cid}: ${tex.slice(0,80)} -> ${e.message.slice(0,100)}`);}
}
if(failures.length)console.log(failures.slice(0,25).join('\n'));
console.log(`${rows.length} expressions across the reader; ${rows.length-failures.length} render, ${failures.length} fail.`);
assert.equal(failures.length,0);
