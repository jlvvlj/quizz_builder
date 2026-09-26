// Everyday examples are authored rather than extracted from the book, so each chapter keeps
// them in its own pair of files: a manifest naming the blocks a unit carries, and a markdown
// file holding their prose. Both chapters build through here into one content map.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = path.join(root, 'src/data');
const chapters = [1, 2];
const content = {};
let units = 0;
for (const chapter of chapters) {
  const source = fs.readFileSync(path.join(data, `probability-chapter-${chapter}-everyday.md`), 'utf8');
  const blocks = {};
  for (const section of source.split(/^@@ /m).filter(Boolean)) {
    const [id, ...lines] = section.split('\n');
    if (blocks[id]) throw Error(`Duplicate everyday example ${id}`);
    blocks[id] = lines.join('\n').trim().split(/\n\s*\n/)
      .map(text => text.startsWith('$$ ') ? {kind: 'formula', text: text.slice(3).trim()} : {kind: 'paragraph', text});
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(data, `probability-chapter-${chapter}-everyday.json`), 'utf8'));
  const chapterUnits = new Set(require(path.join(data, `probability-chapter-${chapter}-source.json`)).units.map(unit => unit.id));
  const declared = new Set();
  for (const [unitId, entries] of Object.entries(manifest)) {
    if (!chapterUnits.has(unitId)) throw Error(`Chapter ${chapter} everyday examples target an unknown unit: ${unitId}`);
    units++;
    for (const entry of entries) {
      if (!blocks[entry.id]?.length) throw Error(`Missing everyday prose: ${entry.id}`);
      if (content[entry.id]) throw Error(`Everyday example declared twice: ${entry.id}`);
      content[entry.id] = blocks[entry.id];
      declared.add(entry.id);
    }
  }
  const orphans = Object.keys(blocks).filter(id => !declared.has(id));
  if (orphans.length) throw Error(`Chapter ${chapter} everyday prose no manifest claims: ${orphans.join(', ')}`);
}
fs.writeFileSync(path.join(data, 'probability-everyday-content.json'), JSON.stringify(content, null, 2) + '\n');
console.log(`Built ${Object.keys(content).length} everyday examples across ${units} lessons.`);
