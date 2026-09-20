import { FormulaModel, FormulaTerm, makeTerm, mathLabel, shouldExplainTerm, probabilityCallAt, probabilityTerms } from './formula-notation';

// Preserve authored TeX structure while attaching the same interactive term markers
// used by the lesson's inline notation. Text inside \text stays ordinary prose.
export function latexFormulaModel(source: string, context = ''): FormulaModel {
    const terms: FormulaTerm[] = [];
    const symbols: Record<string, string> = {
        Omega: 'Ω', varnothing: '∅', cup: '∪', cap: '∩', in: '∈', notin: '∉', subset: '⊂',
        le: '≤', ge: '≥', ne: '≠', approx: '≈', mid: '|', cdot: '·', times: '×',
        sum: '∑', prod: '∏', bigcap: '⋂', bigcup: '⋃', infty: '∞', to: '→', ldots: '…', cdots: '…',
        int: '∫', iint: '∬', iiint: '∭',
        lambda: 'λ', sigma: 'σ', mu: 'μ', delta: 'δ', Phi: 'Φ', Theta: 'Θ', theta: 'θ',
    };
    const mark = (term: FormulaTerm, latex: string) => {
        if (!terms.some(t => t.id === term.id)) terms.push(term);
        return `\\htmlData{formula-term=${term.id}}{\\textcolor{${term.color}}{${latex}}}`;
    };
    // A big operator's scripts travel with it: its index is what its explanation is about.
    const add = (symbol: string, latex: string, detail = '') => shouldExplainTerm(symbol) ? mark(makeTerm(symbol, context, source, detail), latex) : latex;
    let i = 0;
    let result = '';
    const group = () => {
        const start = i;
        if (source[i] !== '{') return source[i++] || '';
        let depth = 0;
        do { if (source[i] === '{') depth++; if (source[i] === '}') depth--; i++; } while (i < source.length && depth);
        return source.slice(start, i);
    };
    while (i < source.length) {
        const call = context === 'sets-introduction' ? undefined : probabilityCallAt(source, i);
        if (call) {
            const grouped = probabilityTerms(call.body, context);
            result += mark(grouped.whole, source.slice(i, call.bodyStart) + mark(grouped.event, call.body) + source.slice(call.bodyEnd, call.end));
            i = call.end;
            continue;
        }
        if (source[i] === '\\') {
            const command = source.slice(i).match(/^\\([A-Za-z]+|.)/)![0];
            i += command.length;
            const name = command.slice(1);
            if (['text', 'mathrm', 'operatorname', 'begin', 'end'].includes(name)) {
                const body = group();
                result += name === 'mathrm' && body === '{P}' ? add('P', '\\mathrm{P}')
                    : name === 'operatorname' && body === '{var}' ? add('var', command + body) : command + body;
            } else if (symbols[name]) {
                let atom = command;
                while (source[i] === '_' || source[i] === '^') { atom += source[i++]; atom += group(); }
                result += add(symbols[name], atom, atom);
            } else result += command;
        } else if (/[A-Za-z0-9=+!<>|−-]/.test(source[i])) {
            // A d glued to what follows is a differential (dx, d\theta, dF_X), not a quantity of its own.
            if (source[i] === 'd' && /[A-Za-z\\(]/.test(source[i + 1] || '')) { result += source[i++]; continue; }
            let atom = source[i++];
            if (/\d/.test(atom)) while (/[\d.]/.test(source[i] || ' ') && i < source.length) atom += source[i++];
            while (source[i] === '_' || source[i] === '^') { atom += source[i++]; atom += group(); }
            result += add(mathLabel(atom), atom);
        } else result += source[i++];
    }
    return {source, latex: result, terms};
}
