export interface FormulaTerm { id: string; symbol: string; definition: string; color: string }
export interface FormulaModel { source: string; latex: string; terms: FormulaTerm[]; meaning?: string }
export interface TextPart { text: string; math?: boolean }
const palette = ['#8954c7', '#2863b8', '#ad650d', '#008397', '#b73e58', '#31805b'];
const sub = '₀₁₂₃₄₅₆₇₈₉ₙₖᵢⱼₛ₌₋₊ᵣ';
const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵏᶦᶜ⁻⁺';
const normal = (s: string) => [...s].map(c => ({ ...Object.fromEntries([...sub].map((v,i)=>[v,'0123456789nkijs=-+r'[i]])), ...Object.fromEntries([...sup].map((v,i)=>[v,'0123456789nkic-+'[i]])) }[c] || c)).join('');
const esc = (s: string) => s.replace(/[\\{}%&#_$]/g, '\\$&');
const fixed: Record<string, [string,string]> = {
 'Ω':['Sample space: all possible outcomes.','\\Omega'], 'Ω':['Sample space: all possible outcomes.','\\Omega'],
 '∅':['Empty set: no elements or outcomes.','\\varnothing'], 'Ø':['Empty set: no elements or outcomes.','\\varnothing'],
 '∪':['Union: in either set, including their overlap.','\\cup'], '∩':['Intersection: in both sets.','\\cap'],
 '∈':['Is an element of the set.','\\in'], '∉':['Is not an element of the set.','\\notin'],
 '⊂':['Is a subset of: every element on the left belongs to the set on the right.','\\subset'],
 '⊃':['Contains the set on the right.','\\supset'], '⊆':['Is a subset of, possibly equal to.','\\subseteq'],
 '=':['Both sides have the same value or describe the same set.','='], '≠':['The two sides are different.','\\ne'],
 '≤':['Less than or equal to.','\\le'], '≥':['Greater than or equal to.','\\ge'], '<':['Less than.','<'], '>':['Greater than.','>'],
 '+':['Add these quantities.','+'], '−':['Subtract the quantity on the right.','-'], '-':['Subtract the quantity on the right.','-'],
 '·':['Multiply these quantities.','\\cdot'], '×':['Product: combine the choices or multiply quantities.','\\times'],
 '/':['Divide the numerator by the denominator.','/'], '!':['Factorial: multiply the integers from 1 up to this number; 0! = 1.','!'],
 '…':['Continue the same pattern.','\\ldots'], '⋯':['Continue the same pattern.','\\cdots'], '∞':['Infinity: no finite upper limit.','\\infty'],
 '⇒':['The statement on the left implies the one on the right.','\\Rightarrow'], '⇔':['Each statement implies the other.','\\Leftrightarrow'],
 'ℝ':['The set of all real numbers.','\\mathbb{R}'], '∫':['Integrate: accumulate over the indicated set or interval.','\\int'],
 'Σ':['Sum: add the indexed terms.','\\sum'], '∑':['Sum: add the indexed terms.','\\sum'],
 '∏':['Product: multiply the indexed terms.','\\prod'], '⋃':['Union over the indexed collection of sets.','\\bigcup'],
 '⋂':['Intersection over the indexed collection of sets.','\\bigcap'],
};
export function describeTerm(symbol: string, context = '', expression = ''): string {
 const s = symbol.trim();
 if ((s==='Ω'||s==='Ω')&&/sets-introduction|set-operations|algebra-of-sets/.test(context)) return 'Universe: all elements under consideration.';
 if(s==='|' && (expression.match(/\|/g)||[]).length>=2 && !expression.includes('{')) return /[xyz]/.test(expression) ? 'Absolute value: distance from zero, regardless of sign.' : 'Cardinality: the number of elements in the enclosed set.';
 if (s==='c' && /independent-trials/.test(context)) return 'Capacity: the maximum number of users that can be served at once.';
 if (s === '|') return expression.includes('{') && !expression.includes('P(') ? 'Such that: the condition after this bar selects the elements.' : 'Given: use the event on the right as the known information.';
 if (s==='≈') return 'Approximately equal to: the value has been rounded.';
 if (s==='→') return 'Tends to: the expression approaches the value on the right.';
 if (s==='⏟') return 'The brace groups the factors counted together.';
 if (s==='ℝ²') return 'The plane: ordered pairs of real numbers.';
 if (s==='ℝ³') return 'Space: ordered triples of real numbers.';
 if (fixed[s]) return fixed[s][0];
 if (/^[⋃⋂Σ∑∏]/.test(s)) return `${fixed[s[0]][0]} ${s.slice(1) ? 'The lower index gives the starting value; the upper index gives the limit.' : ''}`;
 if (s === '{' || s === '}') return 'Braces enclose the elements or defining condition of a set.';
 if (s === '(' || s === ')') return 'Parentheses group the enclosed expression.';
 if (s === '[' || s === ']') return 'Brackets delimit an interval or group an expression.';
 if (s === 'P') return /sets-introduction/.test(context) ? 'A property used to select the elements of a set.' : 'Probability: the chance of the event, from 0 to 1.';
 if (/^[A-ZΩΩ][ᶜc]$/.test(s)) return `Complement of ${s[0]}: all outcomes outside ${s[0]}.`;
 if (s === 'C' && /combinations|counting/.test(context)) return 'Choose: count unordered selections of k objects from n.';
 if (s === 'H') return 'Heads: the outcome of a coin toss.';
 if (s === 'T' && (/trials/.test(context) || expression.includes('H'))) return 'Tails: the outcome of a coin toss.';
 if (s === 'c' || s === 'ᶜ') return 'Complement: outcomes outside the set or event.';
 if (s === '²' || s === '³') return `Power ${normal(s)}: multiply the base by itself ${normal(s)} times.`;
 if (/^[STU]/.test(s)) return `Set ${s}${s.length>1 ? ': the subscript identifies which set in the collection' : ': a collection of elements'}.`;
 if (/^[ABCDEFHD]/.test(s)) return /sets|counting|permutations|combinations|partitions/.test(context) ? `${s}: the named set or collection used in this expression.` : `Event ${s}: a set of possible outcomes.`;
 if (/^[xyz]/.test(s)) return `${s}: an element or numerical value${s.length>1 ? '; its index identifies its position' : ''}.`;
 if (/^[ijk]/.test(s)) return s[0]==='k' ? 'k: the number selected, or the number of successes being counted.' : `${s}: an index identifying a term, event, or position.`;
 if (s==='n' && /set-operations|algebra-of-sets/.test(context)) return 'Index identifying a set in the collection.';
 if (/^n/.test(s)) return /trials/.test(context) ? `${s}: the number of trials${s.length>1 ? ' in this group' : ''}.` : `${s}: the number of objects, outcomes, or terms${s.length>1 ? ' in the indexed group' : ''}.`;
 if (/^[pq]/.test(s)) return `${s}: a probability assigned by the model; between 0 and 1.`;
 if (s==='r') return 'r: the number of stages or groups.';
 if (/^\d+(\.\d+)?$/.test(s)) return s==='0' ? 'Zero: none; probability 0 means the event has zero probability.' : s==='1' ? 'One: the whole amount; probability 1 is certainty.' : `${s}: the numerical value used in this expression.`;
 if (s==='C') return 'Choose: the number of unordered selections of k objects from n.';
 if (s==='or') return 'At least one of the conditions holds, including when both hold.';
 if (s==='and') return 'Both conditions must hold.';
 if (/^[a-zA-Z]$/.test(s)) return `${s}: a named quantity in this example; its value is specified in the accompanying statement.`;
 if (/^[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵏᶦ⁻⁺]+$/.test(s)) return `Exponent ${normal(s)}: the power to which the preceding expression is raised.`;
 return `${s}: the condition stated here selects which outcomes to include.`;
}
function colorFor(symbol:string) {
 const key=symbol.match(/^[A-Za-zΩΩ]/)?.[0] || symbol.replace(/[₀-₉ₙₖᵢⱼᶜ⁰-⁹]/g,'');
 const map:Record<string,number>={S:0,T:1,U:5,x:2,y:4,P:0,A:1,B:5,C:4,'∪':3,'∩':3,'∈':3,'∉':4,'Ω':0,'Ω':0,n:1,k:2,p:0,'=':5,'|':2};
 return palette[map[key] ?? ([...key].reduce((a,c)=>a+c.charCodeAt(0),0)%palette.length)];
}
export function makeTerm(symbol:string,context='',expression=''):FormulaTerm {
 return {id:'t'+[...symbol].map(c=>c.codePointAt(0)!.toString(16)).join('-'),symbol,definition:describeTerm(symbol,context,expression),color:colorFor(symbol)};
}
const mathOp = /[=≠≤≥<>∈∉⊂⊃⊆∪∩+−·×/⇒⇔]/;
function atomEnd(text:string,start:number):number {
 let i=start;
 if (/[({[]/.test(text[i]||'')) {
  const end:Record<string,string>={'(':')','{':'}','[':']'}; const close=end[text[i]];let depth=1;i++;
  for(;i<text.length;i++){if(text[i]===text[start])depth++;if(text[i]===close){depth--;if(depth===0){i++;while(i<text.length&&(sub+sup+'!').includes(text[i]))i++;return i;}}}
  return start;
 }
 const head=text.slice(i).match(/^(?:[⋃⋂Σ∑∏∫]|[A-Za-zΩΩØ∅ℝ](?![A-Za-z])|\d+(?:\.\d+)?)/);
 if(!head)return start;i+=head[0].length;
 while(i<text.length && (sub+sup+'!').includes(text[i]))i++;
 if(text[i]==='^'){i++;while(i<text.length && /[∞\d⁰-⁹]/.test(text[i]))i++;}
 if((head[0]==='P'||head[0]==='C')&&text[i]==='('){const end=atomEnd(text,i);if(end>i)i=end;}
 return i;
}
export function splitMath(text:string):TextPart[] {
 const out:TextPart[]=[];let plain=0;let i=0;
 while(i<text.length){
  if(i>0 && /[A-Za-z₀-₉’']/.test(text[i-1])){i++;continue;}
  if(/[“‘]/.test(text[i-1]||'')&&/[”’]/.test(text[i+1]||'')){i++;continue;}
  if(text.slice(Math.max(0,i-2),i+4).match(/(?:i\.e\.|e\.g\.)/)){i++;continue;}
  let end=atomEnd(text,i);
  if(end===i){i++;continue;}
  const first=text.slice(i,end);
  if(first.startsWith('(')&&/[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(first)&&!/^\([Nn]umber of elements of/.test(first)){i++;continue;}
  // An English article or an ordinary parenthesized phrase is not a formula.
  if(((first==='a'||(first==='A'&&/^\s+[A-Za-z]{2}/.test(text.slice(end))&&!/\b(?:event|events|of|and|that|in|when|if|given|probability)\s+$/.test(text.slice(0,i))))&&!mathOp.test(text.slice(end).trimStart()[0]||''))||(/^[({[]/.test(first)&&!/[=∈∉ΩΩ∅Ø₀-₉]|\b[A-Z]\b|\d|^\([xyz], ?[xyz]\)/.test(first))){i++;continue;}
  let pos=end;
  while(pos<text.length){
   let q=pos;while(text[q]===' ')q++;
   if(mathOp.test(text[q]||'')) {q++;while(text[q]===' ')q++;const next=atomEnd(text,q);if(next>q){pos=end=next;continue;}}
   // Adjacent factors such as P(A)P(B).
   if(q===pos && (text[q]==='P'||text[q]==='(')){const next=atomEnd(text,q);if(next>q){pos=end=next;continue;}}
   break;
  }
  const expr=text.slice(i,end);
  const numeric=/^\d+(\.\d+)?$/.test(expr);
  if(numeric){i=end;continue;}
  if(i>plain)out.push({text:text.slice(plain,i)});out.push({text:expr,math:true});plain=end;i=end;
 }
 if(plain<text.length)out.push({text:text.slice(plain)});return out;
}
export function formulaModel(source:string,context=''):FormulaModel {
 const terms:FormulaTerm[]=[];const add=(s:string,t:string)=>{const term=makeTerm(s,context,source);if(!terms.some(v=>v.id===term.id))terms.push(term);return `\\htmlData{formula-term=${term.id}}{\\textcolor{${term.color}}{${t}}}`;};
 const tokens=source.match(/[A-Za-z]{2,}|[⋃⋂Σ∑∏∪∩∫][₀-₉ₙₖᵢⱼₛ₌₋₊]*(?:\^?∞|[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵏᶦ⁻⁺]+)?|[A-Za-zΩΩℝ][₀-₉ₙₖᵢⱼₛᵣ]*[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵏᶦᶜ⁻⁺]*|\d+(?:\.\d+)?|[A-Za-z]{2,}|[^\s]/g)||[];
 let at=0;
 function sequence(close?:string):string {
  const pieces:string[]=[];
  while(at<tokens.length){const s=tokens[at++];if(s===close)break;
   if(s==='!'){const previous=pieces.pop()||'';pieces.push(previous+add('!','!'));continue;}
   if(s && [...s].every(c=>sup.includes(c))){let power=s;while(tokens[at]&&[...tokens[at]].every(c=>sup.includes(c)))power+=tokens[at++];const previous=pieces.pop()||'';pieces.push(previous+`^{${add(power,normal(power))}}`);continue;}
   if(s==='/') {const numerator=pieces.pop()||'1';const denominator=one();pieces.push(add('/',`\\frac{${numerator}}{${denominator}}`));continue;}
   at--;pieces.push(one());
  }return pieces.join(' ');
 }
 function one():string {
  const s=tokens[at++]||'';
  if('([{'.includes(s)&&s){const closing=s==='('?')':s==='['?']':'}';const body=sequence(closing);const left=s==='{'?'\\{':s;const right=closing==='}'?'\\}':closing;return `${add(s,left)} ${body} ${add(closing,right)}`;}
  if(s==='P' && tokens[at]==='('){return add('P','\\mathrm{P}')+' '+one();}
  if(s==='C' && tokens[at]==='('){at++;let n='';while(at<tokens.length&&tokens[at]!==',')n+=tokens[at++];at++;let k='';while(at<tokens.length&&tokens[at]!==')')k+=tokens[at++];at++;return add('C',`\\binom{${add(n,esc(normal(n)))}}{${add(k,esc(normal(k)))}}`);}
  if(/[⋃⋂Σ∑∏∪∩∫]/.test(s[0]||'')){const low=[...s.slice(1)].filter(c=>sub.includes(c)).join('');const high=s.slice(1+low.length).replace('^','');return add(s,`${fixed[s[0]][1]}${low?`_{${normal(low)}}`:''}${high?`^{${high==='∞'?'\\infty':normal(high)}}`:''}`);}
  if(fixed[s])return add(s,fixed[s][1]);
  if(s==='|')return add(s,'\\mid');
  if(s===','||s===';'||s==='.')return s;
  const match=s.match(/^([A-Za-zΩΩℝ])([₀-₉ₙₖᵢⱼₛᵣ]*)([⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵏᶦᶜ⁻⁺]*)$/);
  if(match){const base=fixed[match[1]]?.[1]||match[1];return add(s,base+(match[2]?`_{${normal(match[2])}}`:'')+(match[3]?`^{${normal(match[3])}}`:''));}
  if(/^\d/.test(s))return add(s,s);
  if(/^[A-Za-z]+$/.test(s)){let phrase=s;while(tokens[at]&&/^[A-Za-z]{2,}$/.test(tokens[at])&&!['and','or'].includes(tokens[at])&&!['and','or'].includes(phrase))phrase+=' '+tokens[at++];return ['or','and'].includes(phrase)?add(phrase,`\\text{ ${esc(phrase)} }`):`\\text{${esc(phrase)} }`;}
  return add(s,`\\text{${esc(s)}}`);
 }
 const latex=sequence();
 const meaning=source.includes('∪')&&source.includes('=')&&!source.includes('P(')?'A union includes every element that belongs to either set, including elements in both.':source.includes('∩')&&source.includes('=')&&!source.includes('P(')?'An intersection keeps only the elements shared by both sets.':source.includes('P(')&&source.includes('|')&&source.includes('/')?'Restrict attention to the given event, then compare the probability of the shared outcomes with that event’s total probability.':undefined;
 return {source,latex,terms,meaning};
}
