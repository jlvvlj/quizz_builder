// Everyday examples for the CS109 course. They are authored, not extracted from the reader, and
// they belong to this course alone: the five running scenarios were copied from the book course
// and adapted, so nothing here refers to its files. One markdown file per part holds every story,
// each headed by the lesson it belongs to, its scenario, and its title.
const fs = require('node:fs');
const path = require('node:path');
const data = path.join(__dirname, '..', 'src/data');
const SCENARIOS = {a: 'Meridian Air', b: 'Tally', c: 'The Forecast Market', d: 'The Warm Intro', e: 'One Cell'};
const parts = [1];
const manifests = {}, content = {};
let stories = 0;
for (const part of parts) {
  const source = fs.readFileSync(path.join(data, `cs109-part-${part}-everyday.md`), 'utf8');
  const units = new Set(require(path.join(data, `cs109-part-${part}-source.json`)).units.map(unit => unit.id));
  const manifest = {};
  for (const section of source.split(/^@@ /m).slice(1)) {
    const [header, ...lines] = section.split('\n');
    const [unit, letter, title] = header.split('|').map(s => s.trim());
    if (!units.has(unit)) throw Error(`Part ${part} story targets an unknown lesson: ${unit}`);
    if (!SCENARIOS[letter]) throw Error(`Unknown scenario "${letter}" for ${unit}`);
    if (!title) throw Error(`Story for ${unit} (${letter}) has no title`);
    const id = `cs109-p${part}-${unit}-${letter}`;
    if (content[id]) throw Error(`Two ${SCENARIOS[letter]} stories for ${unit}`);
    const text = lines.join('\n').trim();
    if (!text) throw Error(`Missing prose: ${id}`);
    content[id] = text.split(/\n\s*\n/).map(block => block.startsWith('$$') ? {kind: 'formula', text: block.replace(/^\$\$|\$\$$/g, '').trim()} : {kind: 'paragraph', text: block});
    (manifest[unit] ||= []).push({id, scenario: SCENARIOS[letter], title});
    stories++;
  }
  // Stories appear in scenario order whatever order they were written in.
  for (const list of Object.values(manifest)) list.sort((x, y) => x.id.localeCompare(y.id));
  manifests[`cs109-part-${part}`] = manifest;
}
fs.writeFileSync(path.join(data, 'cs109-everyday.json'), JSON.stringify({manifests, content}, null, 2) + '\n');
console.log(`Built ${stories} CS109 everyday examples across ${Object.values(manifests).reduce((n, m) => n + Object.keys(m).length, 0)} lessons.`);
