const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const {createElement} = require('react');
const {renderToStaticMarkup} = require('react-dom/server');

const root = path.resolve(__dirname, '..');
const cache = new Map();
const resolve = candidate => {
    for (const suffix of ['', '.tsx', '.ts', '/index.tsx', '/index.ts']) if (fs.existsSync(candidate + suffix) && fs.statSync(candidate + suffix).isFile()) return candidate + suffix;
    throw new Error(`Cannot resolve ${candidate}`);
};
const loadModule = request => {
    const file = resolve(request);
    if (cache.has(file)) return cache.get(file);
    const module = {exports: {}};
    cache.set(file, module.exports);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true}}).outputText;
    const requireFrom = specifier => {
        if (specifier.startsWith('.')) return loadModule(path.resolve(path.dirname(file), specifier));
        if (specifier.startsWith('@/')) return loadModule(path.join(root, 'src', specifier.slice(2)));
        return require(specifier);
    };
    new Function('exports', 'require', 'module', '__filename', '__dirname', code)(module.exports, requireFrom, module, file, path.dirname(file));
    cache.set(file, module.exports);
    return module.exports;
};

// 1. Every registry key must name a lesson that actually exists in the chapter data.
const chapters = ['probability-chapter-1', 'probability-chapter-2']
    .map(deck => require(`../src/data/${deck}-source.json`));
const source = fs.readFileSync(path.join(root, 'src/components/interactive/registry.tsx'), 'utf8');
const keys = [...source.matchAll(/'(probability-chapter-[12]):([a-z0-9-]+)'/g)].map(match => ({deck: match[1], unit: match[2]}));
assert.ok(keys.length >= 13, `Expected the full mapping, found ${keys.length}`);
for (const key of keys) {
    const chapter = chapters.find(item => item.deckId === key.deck);
    assert.ok(chapter, `Unknown deck ${key.deck}`);
    assert.ok(chapter.units.some(unit => unit.id === key.unit), `${key.deck} has no lesson "${key.unit}"`);
}
assert.equal(new Set(keys.map(key => `${key.deck}:${key.unit}`)).size, keys.length, 'Duplicate registry key');

// 2. Every figure must render without throwing, and carry its interactive chrome.
const {lessonFigures} = loadModule(path.join(root, 'src/components/interactive/registry'));
let rendered = 0;
for (const key of keys) {
    const element = lessonFigures(key.deck, key.unit);
    assert.ok(element, `No figure produced for ${key.deck}:${key.unit}`);
    const html = renderToStaticMarkup(element);
    assert.match(html, /class="interactive-figure"/, `${key.unit} is missing the shared figure chrome`);
    assert.match(html, /aria-label="Interactive: /, `${key.unit} is missing its accessible name`);
    assert.ok(!/NaN|undefined/.test(html), `${key.unit} rendered NaN or undefined`);
    rendered++;
}
assert.equal(lessonFigures('probability-chapter-1', 'summary-and-discussion'), null, 'Unmapped lessons must stay untouched');

// 3. The counting figure must agree with the factorial identity C(n,k) = P(n,k)/k!
const factorial = value => Array.from({length: value}, (_, index) => index + 1).reduce((product, item) => product * item, 1);
const countingHtml = renderToStaticMarkup(lessonFigures('probability-chapter-1', 'combinations'));
assert.match(countingHtml, /6 ÷ 2 = 3/, 'Counting figure lost its permutation/combination identity');
assert.equal(factorial(2), 2);

// 4. The set-expression parser must obey the algebra of sets, not just parse.
const {evaluate} = loadModule(path.join(root, 'src/components/interactive/SetTheory'));
const parse = text => evaluate([...text].filter(character => character !== ' '));
assert.equal(parse("(A ∪ B)'"), parse("A' ∩ B'"), 'De Morgan failed for union');
assert.equal(parse("(A ∩ B)'"), parse("A' ∪ B'"), 'De Morgan failed for intersection');
assert.equal(parse('A ∪ B ∩ C'), parse('A ∪ (B ∩ C)'), 'Intersection must bind tighter than union');
assert.equal(parse("A ∩ A'"), parse('∅'), 'A ∩ A′ must be empty');
assert.equal(parse("A ∪ A'"), parse('U'), 'A ∪ A′ must be the whole space');
assert.equal(parse('A ∩ (B ∪ C)'), parse('(A ∩ B) ∪ (A ∩ C)'), 'Distributivity failed');
assert.equal(parse("A''"), parse('A'), 'Double complement must be the identity');
for (const broken of ['A ∩', '(A ∪ B', ')A', '∩ A', 'A B']) assert.equal(parse(broken), null, `"${broken}" must not parse`);

// 5. Each distribution must be a genuine PMF, with the mean and variance it advertises.
const {FAMILIES} = loadModule(path.join(root, 'src/components/interactive/DiscreteDistributions'));
const cases = [['bernoulli', 0.3, 1], ['binomial', 0.4, 12], ['binomial', 0.9, 30], ['poisson', 3.5, 1], ['poisson', 0.4, 1], ['geometric', 0.25, 1]];
for (const [name, parameter, trials] of cases) {
    const family = FAMILIES[name];
    // Sum far past the plotted window so a truncated tail cannot hide an error.
    const reach = name === 'geometric' || name === 'poisson' ? Array.from({length: 400}, (_, index) => index + (name === 'geometric' ? 1 : 0)) : family.support(parameter, trials);
    const masses = reach.map(k => family.pmf(k, parameter, trials));
    assert.ok(masses.every(mass => mass >= 0), `${name} produced a negative probability`);
    const total = masses.reduce((sum, mass) => sum + mass, 0);
    assert.ok(Math.abs(total - 1) < 1e-9, `${name}(${parameter}) masses sum to ${total}, not 1`);
    const mean = reach.reduce((sum, k, index) => sum + k * masses[index], 0);
    const variance = reach.reduce((sum, k, index) => sum + (k - mean) ** 2 * masses[index], 0);
    assert.ok(Math.abs(mean - family.mean(parameter, trials)) < 1e-6, `${name}(${parameter}) mean ${mean} ≠ stated ${family.mean(parameter, trials)}`);
    assert.ok(Math.abs(variance - family.variance(parameter, trials)) < 1e-6, `${name}(${parameter}) variance ${variance} ≠ stated ${family.variance(parameter, trials)}`);
}

console.log(`Interactive figures: ${keys.length} lesson mappings verified, ${rendered} figures rendered, set algebra and 4 distribution families checked.`);
