import { FormulaModel, FormulaTerm, makeTerm } from './formula-notation';

// Preserve authored TeX structure while attaching the same interactive term markers
// used by the lesson's inline notation. Text inside \text stays ordinary prose.
export function latexFormulaModel(source: string, context = ''): FormulaModel {
    const terms: FormulaTerm[] = [];
    const symbols: Record<string, string> = {
        Omega: 'Ω', varnothing: '∅', cup: '∪', cap: '∩', in: '∈', notin: '∉', subset: '⊂',
        le: '≤', ge: '≥', ne: '≠', approx: '≈', mid: '|', cdot: '·', times: '×',
        sum: '∑', prod: '∏', bigcap: '⋂', bigcup: '⋃', infty: '∞', to: '→', ldots: '…', cdots: '…',
        lambda: 'λ', sigma: 'σ',
    };
    const add = (symbol: string, latex: string) => {
        const term = makeTerm(symbol, context, source);
        if (!terms.some(t => t.id === term.id)) terms.push(term);
        return `\\htmlData{formula-term=${term.id}}{\\textcolor{${term.color}}{${latex}}}`;
    };
    const scriptSymbol = (s: string) => s.replace(/_\{([^}]+)\}|_([A-Za-z0-9])/g, (_, a, b) => [...(a || b)].map(c => '₀₁₂₃₄₅₆₇₈₉'['0123456789'.indexOf(c)] || ({n:'ₙ',i:'ᵢ',j:'ⱼ',k:'ₖ',r:'ᵣ'} as Record<string,string>)[c] || c).join('')).replace(/\^\{c\}|\^c/g, 'ᶜ');
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
                result += add(symbols[name], atom);
            } else result += command;
        } else if (/[A-Za-z0-9=+!<>|−-]/.test(source[i])) {
            let atom = source[i++];
            if (/\d/.test(atom)) while (/[\d.]/.test(source[i] || ' ') && i < source.length) atom += source[i++];
            while (source[i] === '_' || source[i] === '^') { atom += source[i++]; atom += group(); }
            result += add(scriptSymbol(atom), atom);
        } else result += source[i++];
    }
    return {source, latex: result, terms};
}
