const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/data/probability-chapter-1-native.md'), 'utf8');
const result = {};
for (const section of source.split(/^@@ /m).filter(Boolean)) {
  const [id, ...lines] = section.split('\n');
  if (result[id]) throw Error(`Duplicate asset ${id}`);
  result[id] = lines.join('\n').trim().split(/\n\s*\n/).map(text => {
    const kind = text.startsWith('$$ ') ? 'formula' : 'paragraph';
    if (kind === 'formula') {
      text = text.slice(3).trim();
      // Explicit arguments are needed before inserting annotation macros.
      text = text.replace(/\\(frac|binom)(\d)(\d)/g, '\\$1{$2}{$3}')
        .replace(/\\(frac|binom)(\d)(?=\{)/g, '\\$1{$2}');
    }
    return {kind, text};
  });
}
const chapter = require('../src/data/probability-chapter-1-source.json');
for (const unit of chapter.units) for (const key of ['mathPassages', 'cards', 'examples', 'figures']) {
  for (const asset of unit[key]) if (!asset.text && !result[asset.id]?.length) throw Error(`Missing native content: ${asset.id}`);
}
fs.writeFileSync(path.join(root,'src/data/probability-chapter-1-native.json'), JSON.stringify(result,null,2)+'\n');
console.log(`Built ${Object.keys(result).length} native assets, ${Object.values(result).flat().filter(b=>b.kind==='formula').length} equations.`);
