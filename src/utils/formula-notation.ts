export interface FormulaTerm { id: string; symbol: string; definition: string; color: string }
export interface FormulaModel { source: string; latex: string; terms: FormulaTerm[]; meaning?: string }
export interface TextPart { text: string; math?: boolean }
const palette = ['#8954c7', '#2863b8', '#ad650d', '#008397', '#b73e58', '#31805b'];
const sub = '₀₁₂₃₄₅₆₇₈₉ₙₖᵢⱼₛ₌₋₊ᵣ';
const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵏᶦᶜ⁻⁺';
const normal = (s: string) => [...s].map(c => ({ ...Object.fromEntries([...sub].map((v,i)=>[v,'0123456789nkijs=-+r'[i]])), ...Object.fromEntries([...sup].map((v,i)=>[v,'0123456789nkic-+'[i]])) }[c] || c)).join('');
const esc = (s: string) => s.replace(/[\\{}%&#_$]/g, '\\$&');
const supers: Record<string,string> = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',n:'ⁿ',k:'ᵏ',i:'ᶦ',c:'ᶜ','-':'⁻','−':'⁻','+':'⁺'};
/** Superscript an exponent for display, falling back to ^(…) when a glyph has no form. */
const superscript = (body: string) => [...body].every(c => supers[c]) ? [...body].map(c => supers[c]).join('') : `^(${body})`;
// Keep arithmetic and punctuation readable without turning every glyph into a lesson.
// A single operator, a bare P, or a plain number carries no notation to teach, so it
// gets no tooltip; grouped atoms such as P(A∣B) are explained as a whole instead.
const BASIC_GLYPH = /^(?:P|[=+−\-×·/<>≤≥≠≈()[\]{},.;:]|[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+)$/;
// Digits, decimal points, signs and a numeric exponent are arithmetic, not notation:
// "10", "0.25.", "10^{-2}" and "1²" all teach nothing.
const PURE_NUMBER = /^[-−+]?\d+(?:\.\d+)?(?:\^\s*\{?\s*[-−+]?\d+\s*\}?|[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+)?[.,;:]*$/;
export function shouldExplainTerm(symbol: string): boolean {
 const s = symbol.trim();
 return !!s && !BASIC_GLYPH.test(s) && !PURE_NUMBER.test(s);
}

const subs: Record<string,string> = {'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',n:'ₙ',i:'ᵢ',j:'ⱼ',k:'ₖ',r:'ᵣ'};
const subscript = (body: string) => [...body].map(c => subs[c] || c).join('');
/** A readable label for authored TeX; this never changes the rendered formula. */
export function mathLabel(source: string): string {
 const commands: Record<string,string> = {cup:'∪',cap:'∩',mid:'|',vert:'|',Omega:'Ω',varnothing:'∅',in:'∈',notin:'∉',le:'≤',leq:'≤',ge:'≥',geq:'≥',ne:'≠',neq:'≠',ldots:'…',cdots:'…',infty:'∞',lambda:'λ',sigma:'σ',times:'×',cdot:'·'};
 let out = source.replace(/\\(?:left|right|bigl|bigr|Bigl|Bigr|big|Big)\b/g,'')
  .replace(/\\(?:text|mathrm|operatorname)\{([^{}]*)\}/g,'$1')
  .replace(/\\([A-Za-z]+)/g,(all,name)=>commands[name] || name)
  .replace(/\\[,;! ]/g,' ').replace(/\\([{}])/g,'$1');
 // Nested scripts such as p_{X_{i}} only collapse innermost-first, so repeat until stable.
 for (let pass = 0; pass < 4; pass++) {
  const next = out
   .replace(/_\{([^{}]*)\}|_([A-Za-z0-9])/g,(_,a,b)=>subscript(a??b))
   .replace(/\^\{c\}|\^c/g,'ᶜ')
   .replace(/\^\{([^{}]*)\}|\^([A-Za-z0-9])/g,(_,a,b)=>superscript(a??b));
  if (next === out) break;
  out = next;
 }
 // Operators bind tightly in a label: "A∩B" and "pX|Y", not "A∩ B" and "pX| Y".
 return out.replace(/\s*([|∣∪∩])\s*/g,'$1').replace(/\s+/g,' ').trim();
}

// Split only at the current nesting level: (A ∪ B) ∩ C is not A ∪ (B ∩ C).
function splitEvent(source: string, separators: string): string[] {
 let depth=0, start=0; const parts:string[]=[];
 for(let i=0;i<source.length;i++) {
  if('([{'.includes(source[i]))depth++;
  else if(')]}'.includes(source[i]))depth--;
  else if(depth===0 && separators.includes(source[i])){parts.push(source.slice(start,i).trim());start=i+1;}
 }
 parts.push(source.slice(start).trim()); return parts;
}
function unwrapEvent(source:string):string {
 let s=source.trim();
 while('({['.includes(s[0]||' ') && s.length>1) {
  const closing=({'(':')','{':'}','[':']'} as Record<string,string>)[s[0]];
  let depth=0,end=-1;
  for(let i=0;i<s.length;i++){if(s[i]===s[0])depth++;if(s[i]===closing)depth--;if(depth===0){end=i;break;}}
  if(end!==s.length-1)break;
  s=s.slice(1,-1).trim();
 }
 return s;
}
function joinEvents(parts:string[], conjunction:string):string {
 return parts.length===2 ? parts.join(` ${conjunction} `) : parts.slice(0,-1).join(', ')+`, ${conjunction} `+parts[parts.length-1];
}
export function describeEvent(source:string):string {
 const s=unwrapEvent(mathLabel(source));
 const given=splitEvent(s,'|∣');
 if(given.length===2)return `${describeEvent(given[0])}, given that ${describeEvent(given[1])}`;
 const union=splitEvent(s,'∪');
 if(union.length>1) {
  if(union.every(p=>/^[A-Z][₀-₉ₙᵢⱼₖ]*$/.test(p)))return `${joinEvents(union,'or')} occurs (including overlaps)`;
  if(union.length===2)return `${describeEvent(union[0])} or ${describeEvent(union[1])}`;
  return `at least one of these holds: ${joinEvents(union.map(p=>`(${describeEvent(p)})`),'or')}`;
 }
 const intersection=splitEvent(s,'∩');
 if(intersection.length>1) {
  if(intersection.every(p=>/^[A-Z][₀-₉ₙᵢⱼₖ]*$/.test(p)))return intersection.length===2 ? `both ${joinEvents(intersection,'and')} occur` : `${joinEvents(intersection,'and')} all occur`;
  if(intersection.length===2)return `${describeEvent(intersection[0])} and ${describeEvent(intersection[1])}`;
  return `all of these hold: ${joinEvents(intersection.map(p=>`(${describeEvent(p)})`),'and')}`;
 }
 const joint=splitEvent(s,',');
 if(joint.length>1)return joinEvents(joint.map(describeEvent),'and');
 if(s.endsWith('ᶜ')){const inner=s.slice(0,-1);return /^[A-Z][₀-₉ₙᵢⱼₖ]*$/.test(inner) ? `${inner} does not occur` : `the event “${describeEvent(inner)}” does not occur`;}
 if(s==='Ω')return 'any outcome in the sample space occurs';
 if(s==='∅')return 'the impossible event occurs';
 const relation=s.match(/^(.+?)\s*(∈|∉|≤|≥|≠|=|<|>)\s*(.+)$/);
 if(relation) {
  const words:Record<string,string>={'=':'equals','≠':'does not equal','>':'is greater than','<':'is less than','≤':'is at most','≥':'is at least','∈':'belongs to','∉':'does not belong to'};
  return `${relation[1].trim()} ${words[relation[2]]} ${relation[3].trim()}`;
 }
 return /^[A-Z][₀-₉ₙᵢⱼₖ]*$/.test(s) ? `${s} occurs` : s;
}

/** CS109 writes events with words and an upper-case complement: "E and F", "E or F", "E^C". */
export function cs109Event(label:string):string {
 return label.replace(/\s+and\s+/g,'∩').replace(/\s+or\s+/g,'∪').replace(/\^\(C\)|\^C(?![A-Za-z])/g,'ᶜ');
}

export function probabilityTerms(body:string, context=''): {whole:FormulaTerm; event:FormulaTerm} {
 const label=mathLabel(body);
 const described=describeEvent(context.startsWith('cs109-') ? cs109Event(label) : label);
 const event=makeTerm(label,context);
 event.id='event-'+event.id;
 event.definition=`The event that ${described}.`;
 const whole=makeTerm(`P(${label})`,context);
 whole.definition=`The probability that ${described}.`;
 return {whole,event};
}

/** Locate a complete P(...) atom, including nested event parentheses and sized TeX delimiters. */
export function probabilityCallAt(source:string,start:number) {
 if(start>0 && /[A-Za-z]/.test(source[start-1]))return;
 const prefix=source.slice(start).match(/^(?:P|\\mathrm\{P\})\s*(?:\\(?:left|bigl|Bigl|big|Big)\s*)?\(/);
 if(!prefix)return;
 const bodyStart=start+prefix[0].length;
 let depth=1;
 for(let i=bodyStart;i<source.length;i++) {
  if(source[i]==='(')depth++;
  if(source[i]===')' && --depth===0) {
   const suffix=source.slice(bodyStart,i).match(/\s*\\(?:right|bigr|Bigr|big|Big)\s*$/);
   const bodyEnd=suffix ? i-suffix[0].length : i;
   // A call split across alignment columns or rows cannot become one marked group.
   if(/&|\\\\/.test(source.slice(bodyStart,bodyEnd)))return;
   return {start,end:i+1,bodyStart,bodyEnd,body:source.slice(bodyStart,bodyEnd)};
  }
 }
}
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
 '∬':['Integrate over a region of the plane.','\\iint'], '∭':['Integrate over a region of space.','\\iiint'],
 'Σ':['Sum: add the indexed terms.','\\sum'], '∑':['Sum: add the indexed terms.','\\sum'],
 '∏':['Product: multiply the indexed terms.','\\prod'], '⋃':['Union over the indexed collection of sets.','\\bigcup'],
 '⋂':['Intersection over the indexed collection of sets.','\\bigcap'],
};

/** Reads the balanced group (or single command/character) that follows a script marker. */
function readGroup(text: string, start: number): [string, number] {
 if (text[start] !== '{') {
  const command = text.slice(start).match(/^\\[A-Za-z]+/);
  return command ? [command[0], start + command[0].length] : [text[start] || '', start + 1];
 }
 let depth = 0, i = start;
 for (; i < text.length; i++) {
  if (text[i] === '\\') { i++; continue; }            // \{ and \} are literal braces, not nesting
  if (text[i] === '{') depth++;
  else if (text[i] === '}' && --depth === 0) { i++; break; }
 }
 return [text.slice(start + 1, i - 1), i];
}

/** Index text is read aloud in the definition, so give its operators room to breathe. */
const spaced = (text: string) => text.replace(/\s*([=<>≤≥≠∈|])\s*/g, ' $1 ').replace(/\s*,\s*/g, ', ').replace(/\s+/g, ' ').trim();

/** The lower and upper scripts of a big operator, from authored TeX or from unicode scripts. */
function operatorScripts(symbol: string, detail: string): {lower: string; upper: string} {
 if (detail) {
  let lower = '', upper = '';
  for (let i = 0; i < detail.length; i++) {
   if (detail[i] === '\\') { i++; continue; }
   if (detail[i] !== '_' && detail[i] !== '^') continue;
   const [body, next] = readGroup(detail, i + 1);
   if (detail[i] === '_') lower = body; else upper = body;
   i = next - 1;
  }
  return {lower: spaced(mathLabel(lower)), upper: spaced(mathLabel(upper))};
 }
 const rest = symbol.slice(1);
 const low = [...rest].filter(c => sub.includes(c)).join('');
 const high = rest.slice(low.length).replace('^', '');
 return {lower: spaced(normal(low)), upper: spaced(high === '∞' ? '∞' : normal(high))};
}

// A big operator is read by its index: the index says which terms are included and which are
// not, so that — not the operator glyph — is what the explanation has to describe.
const BIG_OPERATOR: Record<string, (range: string) => string> = {
 'Σ': range => `Adds one term for ${range}`, '∑': range => `Adds one term for ${range}`,
 '∏': range => `Multiplies one factor for ${range}`,
 '⋃': range => `Unions the sets indexed by ${range}`,
 '⋂': range => `Intersects the sets indexed by ${range}`,
 '∫': range => `Integrates over ${range}`,
 '∬': range => `Integrates over ${range}`, '∭': range => `Integrates over ${range}`,
};

/** Turns an index such as "x", "k=1"…"n", "x>0" or "{x ∣ g(x)=y}" into words. */
function indexPhrase(lower: string, upper: string): {range: string; caveat?: string} {
 const builder = lower.match(/^\{\s*(.+?)\s*\|\s*(.+?)\s*\}$/);
 if (builder) return {range: `every ${builder[1]} satisfying ${builder[2]}`, caveat: 'values that fail that condition contribute nothing'};
 const range = lower.match(/^([A-Za-zλσ])\s*=\s*(.+)$/);
 if (range && upper === '∞') return {range: `each value of ${range[1]} from ${range[2]} upward, continuing without end`};
 if (range && upper) return {range: `each whole-number value of ${range[1]} from ${range[2]} up to ${upper}`};
 if (range) return {range: `each value of ${range[1]} from ${range[2]} onward`};
 const member = lower.match(/^(.+?)\s*∈\s*(.+)$/);
 if (member) return {range: `every ${member[1]} in ${member[2]}`, caveat: `anything outside ${member[2]} is left out`};
 const condition = lower.match(/^(.+?)\s*([<>≤≥≠])\s*.+$/);
 if (condition) return {range: `every value of ${condition[1]} that satisfies ${lower}`, caveat: 'the values that fail that condition are left out'};
 const list = lower.split(',').map(part => part.trim()).filter(Boolean);
 if (list.length > 1) return {range: `every combination of ${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`};
 return {range: `every possible value of ${lower}`};
}

/** An integral's scripts are limits or a region, not an index: read them as the area being accumulated over. */
function integralRange(lower: string, upper: string): {range: string; caveat?: string} {
 if (!upper) {
  const builder = lower.match(/^\{\s*(.+?)\s*\|\s*(.+?)\s*\}$/);
  if (builder) return {range: `every ${builder[1]} satisfying ${builder[2]}`, caveat: 'values outside it contribute nothing'};
  const member = lower.match(/^(.+?)\s*∈\s*(.+)$/);
  if (member) return {range: `every ${member[1]} in ${member[2]}`, caveat: `anything outside ${member[2]} contributes nothing`};
  const condition = lower.match(/^(.+?)\s*([<>≤≥])\s*.+$/);
  if (condition) return {range: `the region where ${lower} holds`};
  return {range: `the set ${lower}`};
 }
 const negativeInfinity = /^[-−]\s*∞$/.test(lower);
 if (negativeInfinity && upper === '∞') return {range: 'the whole real line'};
 if (upper === '∞') return {range: `everything from ${lower} upward`};
 if (negativeInfinity) return {range: `everything up to ${upper}`};
 return {range: `the interval from ${lower} to ${upper}`};
}

function describeBigOperator(glyph: string, symbol: string, detail: string): string {
 const {lower, upper} = operatorScripts(symbol, detail);
 if (!lower) return fixed[glyph][0];
 const {range, caveat} = '∫∬∭'.includes(glyph) ? integralRange(lower, upper) : indexPhrase(lower, upper);
 return `${BIG_OPERATOR[glyph](range)}${caveat ? `; ${caveat}` : ''}.`;
}

export function describeTerm(symbol: string, context = '', expression = '', detail = ''): string {
 const s = symbol.trim();
 if (BIG_OPERATOR[s[0]] && (detail || s.length > 1 || fixed[s])) return describeBigOperator(s[0], s, detail);
 if (context.startsWith('chapter-2/')) {
  if(s==='E') return 'Expected value: average the possible values using their probabilities as weights.';
  if(s==='var') return 'Variance: the expected squared distance from the mean.';
  if(s==='λ') return 'Lambda: the positive parameter of a Poisson distribution; equal to its mean and variance.';
  if(s==='σ') return 'Standard deviation: the square root of variance, in the original units.';
  if(s==='e') return 'Euler’s number (about 2.71828), the base of the natural exponential.';
  if(s==='k') return /geometric/.test(context) ? 'k: the trial number of the first success, starting at one.' : 'k: a possible integer value of the random variable.';
  if(s==='p' && /poisson/.test(context)) return 'Success probability in the binomial model being approximated.';
  if(/^p[A-Z]/.test(s)) return /\\mid|\|/.test(s) ? 'Conditional PMF: probability of the values on the left, given the information on the right.' : s.includes(',') ? 'Joint PMF: probability that all the indicated random variables take these values together.' : 'Probability mass function: probability that the named random variable takes the specified value.';
  if(/^S/.test(s) && /several/.test(context)) return 'Sample mean: the sum of the observations divided by the sample size.';
  if(/^[XYZVTM](?:[₀-₉ᵢₙ]|[0-9]|\^|$)/.test(s)) return `${s}: a random variable (a number determined by the outcome); its role is defined in the accompanying example.`;
  if(s==='c' || s==='a' || s==='b' || s==='d') return `${s}: a fixed constant or endpoint defined in the accompanying formula.`;
  if(s==='g' || s==='h' || s==='f') return `${s}: a function that transforms the random variable’s value.`;
 }
 if (context.startsWith('cs109-')) {
  const flips=/many-flips|binomial-diff-p|random-walks|independence-generalized/.test(context);
  const counting=/counting|combinatorics|poker/.test(context);
  const inclusion=/prob-or-inclusion-exclusion/.test(context);
  if(s==='S') return 'Sample space S: the set of every possible outcome of the experiment.';
  if(/^(.+)(\^\(C\)|ᶜ)$/.test(s)) return `Complement of ${s.replace(/(\^\(C\)|ᶜ)$/,'')}: every outcome in the sample space that is not in it.`;
  if(/random-walks/.test(context) && /^[ACGT][₀-₉ᵢₙ]+$/.test(s)) return `${s}: the event that the DNA letter after mutation step ${s.slice(1).replace(/[₀-₉]/g,d=>'₀₁₂₃₄₅₆₇₈₉'.indexOf(d).toString()).replace('ᵢ','i').replace('ₙ','n')} is ${s[0]}.`;
  if(/random-walks/.test(context) && /^N[₀-₉ᵢₙ+]+$/.test(s)) return `${s}: the event that the DNA letter at this step is N, which stands for any of A, C, G, or T.`;
  if(/inclusion-exclusion/.test(context) && /^Y/.test(s)) return `${s}: the sum of the probabilities of every intersection of exactly r of the events.`;
  if(/^E[ᵢₙ]_/.test(s)) return `${s}: one of the events in a chosen subset of the events.`;
  if(/^[EFGHUBAMDLR](?:[₀-₉ᵢₙⱼₖ]+)?$/.test(s)) return `${s}: an event, a subset of the sample space S.`;
  if(s==='e') return /log-probabilities/.test(context) ? 'Euler’s number (about 2.71828), the base of the natural logarithm.' : 'Euler’s number (about 2.71828).';
  if(s==='n') return flips ? 'n: the number of coin flips, or steps, in the experiment.' : counting ? 'n: the number of distinct objects to arrange or choose from.' : inclusion ? 'n: the number of events being combined.' : 'n: the number of trials, objects, or events in this statement.';
  if(s==='k') return flips ? 'k: the number of heads (successes) being counted.' : 'k: the number of objects chosen, or the number of outcomes counted.';
  if(s==='r') return inclusion ? 'r: how many events each intersection in the sum combines.' : 'r: the number of objects chosen, or of steps, in this count.';
  if(/^p(?:[₀-₉ᵢₙ]+)?$/.test(s)) return flips ? `${s}: the probability that a flip lands heads (a step goes right).` : `${s}: a probability, a number between 0 and 1.`;
  if(/^[ijm]$/.test(s)) return `${s}: an index that counts through the terms, events, or steps.`;
  if(s==='N') return 'N: the number of distinct orderings being counted.';
  if(s==='x') return 'x: a single outcome, a member of the set it is drawn from.';
  if(/^[a-d]$/.test(s)) return `${s}: a fixed number given in the statement.`;
  if(s==='C' || s==='c') return 'C: a named set or event from the statement.';
 }
 if (context.startsWith('chapter-3/')) {
  if(s==='E') return 'Expected value: average the possible values, weighting each by the density there.';
  if(s==='var') return 'Variance: the expected squared distance from the mean.';
  if(s==='λ') return 'Lambda: the positive parameter of an exponential PDF; the mean is 1/λ.';
  if(s==='μ') return 'Mu: the mean of a normal distribution, the value its bell curve is centred on.';
  if(s.startsWith('σ')) return 'Sigma: the standard deviation, in the original units; σ² is the variance.';
  if(s==='Φ') return 'Standard normal CDF: the probability that a standard normal random variable is at most this value, read from the normal table.';
  if(s==='δ') return 'Delta: the length of a small interval, thought of as close to zero.';
  if(s==='e') return 'Euler’s number (about 2.71828), the base of the natural exponential.';
  if(s==='θ'||s==='Θ') return 'Theta: the angle in the accompanying model, measured in radians.';
  if(/^f[-A-Z]/.test(s)) return /\\mid|\|/.test(s) ? 'Conditional PDF: the density of the variable on the left, given the information on the right.'
   : s.includes(',') ? 'Joint PDF: the density of the listed random variables together; its integral over a region gives the probability of that region.'
   : 'Probability density function: its area over an interval is the probability of that interval; the value itself is not a probability.';
  if(/^F[A-Z]/.test(s)||/^F\^/.test(s)) return s.includes(',') ? 'Joint CDF: the probability that every listed random variable is at most its listed value.' : 'Cumulative distribution function: the probability that the random variable is at most this value.';
  if(/^p[A-Z]/.test(s)) return 'Probability mass function: probability that the discrete random variable takes the specified value.';
  if(/^[XYZTNSΘ](?:[₀-₉ᵢₙ]|[0-9]|\^|$)/.test(s)) return `${s}: a random variable (a number determined by the outcome); its role is defined in the accompanying statement.`;
  if(s==='g') return 'g: the function applied to the random variable, as in Y = g(X).';
  if(s==='h') return 'h: the inverse function; it returns the value of X that g sends to y.';
  if(s==='I') return 'I: the interval of values the random variable is confined to.';
  if(/^[abcdrls](?:[₀-₉ᵢₙ]|\+|$)/.test(s)) return `${s}: a fixed constant or endpoint defined in the accompanying statement.`;
  if(/^[xyzt](?:[₀-₉]|$)/.test(s)) return `${s}: a numerical value the corresponding random variable can take.`;
 }
 if ((s==='Ω'||s==='Ω')&&/sets-introduction|set-operations|algebra-of-sets/.test(context)) return 'Universe: all elements under consideration.';
 if(s==='|' && (expression.match(/\|/g)||[]).length>=2 && !expression.includes('{')) return /[xyz]/.test(expression) ? 'Absolute value: distance from zero, regardless of sign.' : 'Cardinality: the number of elements in the enclosed set.';
 if (s==='c' && /independent-trials/.test(context)) return 'Capacity: the maximum number of users that can be served at once.';
 // Set-builder braces mean "such that"; a subscript's braces (p_{X∣Y}) do not.
 if (s === '|') return expression.replace(/[_^]\{[^{}]*\}/g,'').includes('{') && !expression.includes('P(') ? 'Such that: the condition after this bar selects the elements.' : 'Given: use the event on the right as the known information.';
 if (s==='≈') return 'Approximately equal to: the value has been rounded.';
 if (s==='→') return 'Tends to: the expression approaches the value on the right.';
 if (s==='⏟') return 'The brace groups the factors counted together.';
 if (s==='ℝ²') return 'The plane: ordered pairs of real numbers.';
 if (s==='ℝ³') return 'Space: ordered triples of real numbers.';
 if (fixed[s]) return fixed[s][0];
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
 // A raised expression is about the exponent, not the base: pᵏ is not "a probability".
 const power = s.match(/^(.+?)(?:\^\((.+)\)|([⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵏᶦ⁻⁺]+))$/);
 if (power) return `${s}: ${power[1]} raised to the power ${power[2] ?? normal(power[3]!)}.`;
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
 const indexed = s.match(/^([a-zA-Z])[₀-₉ₙₖᵢⱼₛᵣ]+$/);
 if (indexed) return `${s}: a named quantity in this example; the subscript identifies which one.`;
 return `${s}: the condition stated here selects which outcomes to include.`;
}
function colorFor(symbol:string) {
 const key=symbol.match(/^[A-Za-zΩΩ]/)?.[0] || symbol.replace(/[₀-₉ₙₖᵢⱼᶜ⁰-⁹]/g,'');
 const map:Record<string,number>={S:0,T:1,U:5,x:2,y:4,P:0,A:1,B:5,C:4,'∪':3,'∩':3,'∈':3,'∉':4,'Ω':0,'Ω':0,n:1,k:2,p:0,'=':5,'|':2};
 return palette[map[key] ?? ([...key].reduce((a,c)=>a+c.charCodeAt(0),0)%palette.length)];
}
export function makeTerm(symbol:string,context='',expression='',detail=''):FormulaTerm {
 const suffix=detail?'-'+[...detail].reduce((hash,c)=>(hash*33^c.codePointAt(0)!)>>>0,5381).toString(36):'';
 return {id:'t'+[...symbol].map(c=>c.codePointAt(0)!.toString(16)).join('-')+suffix,symbol,definition:describeTerm(symbol,context,expression,detail),color:colorFor(symbol)};
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
 const terms:FormulaTerm[]=[];
 let insideProbability=false;
 const mark=(term:FormulaTerm,t:string)=>{if(!terms.some(v=>v.id===term.id))terms.push(term);return `\\htmlData{formula-term=${term.id}}{\\textcolor{${term.color}}{${t}}}`;};
 const add=(s:string,t:string)=> insideProbability || !shouldExplainTerm(s) ? t : mark(makeTerm(s,context,source),t);
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
  if(s==='P' && tokens[at]==='('){
   const start=at+1; let end=start,depth=1;
   for(;end<tokens.length;end++){if(tokens[end]==='(')depth++;if(tokens[end]===')' && --depth===0)break;}
   if(depth===0 && !insideProbability && context!=='sets-introduction') {
    const grouped=probabilityTerms(tokens.slice(start,end).join(''),context);
    at++; insideProbability=true; const body=sequence(')'); insideProbability=false;
    return mark(grouped.whole,`\\mathrm{P}(${mark(grouped.event,body)})`);
   }
   return '\\mathrm{P} '+one();
  }
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
