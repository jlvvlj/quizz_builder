#!/usr/bin/env python3
"""Draft a part's lesson manuscript from the CS109 reader snapshot.

This produces the first draft of src/data/cs109-part-<n>-native.md. After that, the manuscript is
the reviewed source of truth: edits that adapt the reader's text to this app (its demos, its links,
its references to other pages) are made in the manuscript, so this script refuses to overwrite an
existing one unless --force is given.

Lessons follow the agreed breakdown: each reader chapter is a section of the part and each of its
headings starts a lesson, with an Intro lesson for any text before the first heading; a chapter
with no headings is a single lesson. The part's applications form one further section.
"""
import argparse, json, re
from pathlib import Path
from cs109_reader import ROOT, chapter, expand_macros, image_id

COURSE = json.loads((ROOT / 'src/data/cs109-course.json').read_text())


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', re.sub(r'\$[^$]*\$', '', text.lower())).strip('-')


def tex(source):
    source = re.sub(r'\\href\{[^}]*\}\{((?:[^{}]|\{[^{}]*\})*)\}', r'\1', source)  # links inside math keep only their text
    source = re.sub(r'\n\s*\n', '\n', source.strip())  # a blank line would end the manuscript block
    return expand_macros(source)


def inline(nodes):
    """Paragraph content as manuscript text; hard breaks become paragraph breaks."""
    out = ''
    for node in nodes or []:
        kind = node.get('type')
        if kind == 'text':
            text = node.get('text', '').replace('$', r'\$')
            link = next((m for m in node.get('marks') or [] if m.get('type') == 'link'), None)
            if link and re.fullmatch(r'\s*\d+\s*', text): continue  # numbered citation markers such as [1]
            out += text
        elif kind == 'math_inline': out += '$' + tex((node.get('attrs') or {}).get('value', '')) + '$'
        elif kind == 'hardBreak': out += '\n\n'
        else: out += inline(node.get('content'))
    out = re.sub(r'\[\s*\]', '', out)  # brackets left around a removed citation
    return [re.sub(r'[ \t]+', ' ', p).strip() for p in out.split('\n\n') if p.strip()]


def plain(node):
    return ' '.join(inline([node])) if node.get('type') != 'paragraph' else ' '.join(inline(node.get('content')))


class Chapter:
    def __init__(self, chapter_id):
        self.id, self.demos = chapter_id, 0

    def blocks(self, node):
        kind, attrs, children = node.get('type'), node.get('attrs') or {}, node.get('content') or []
        if kind == 'paragraph': return inline(children)
        if kind == 'heading': return [f'### {t}' for t in inline(children)]
        if kind == 'block-tex': return [f'$${tex(attrs.get("rawTex", ""))}$$'] if attrs.get('rawTex', '').strip() else []
        if kind in ('bulletList', 'orderedList'):
            items = [' '.join(p for c in item.get('content') or [] for p in self.blocks(c)) for item in children]
            return ['\n'.join(f'- {i}' for i in items if i)]
        if kind == 'codeBlock':
            return [f'```{attrs.get("language") or ""}\n' + ''.join(c.get('text', '') for c in children).rstrip() + '\n```']
        if kind == 'kindImage': return [f'@figure {image_id(attrs)}']
        if kind == 'interactive-demo':
            self.demos += 1
            return [f'@interactive {self.id.replace("_", "-")}-{self.demos}']
        if kind in ('borderedBox', 'purpleBox'): return self.box(kind, children)
        if kind == 'horizontalRule': return []
        return [b for c in children for b in self.blocks(c)]

    def box(self, kind, children):
        body = [b for c in children for b in self.blocks(c)]
        title = None
        first = children[0] if children else None
        if first and first.get('type') == 'paragraph':
            content = first.get('content') or []
            if content and content[0].get('type') == 'text' and any(m.get('type') == 'bold' for m in content[0].get('marks') or []):
                line = body[0]
                if len(re.sub(r'\$[^$]*\$', 'x', line)) <= 90:
                    title, body = line, body[1:]
                else:
                    label = ''.join(n.get('text', '') for n in content if n.get('type') == 'text' and any(m.get('type') == 'bold' for m in n.get('marks') or []))
                    label = label.strip().rstrip(':').strip()
                    title, body[0] = label, line[len(label):].lstrip(' :*').strip()
        # Reviewed in the manuscript: untitled boxes get a neutral title from what the box holds.
        title = re.sub(r'\s+', ' ', title or ('Worked example' if kind == 'purpleBox' else 'Key facts')).strip()
        return [f'> {title}', *[b for b in body if b], '@endcard']


def lessons(part):
    units = []
    sections = [(f'{part["number"]}.{i + 1}', c) for i, c in enumerate(part['chapters'])]
    for section_id, entry in sections:
        doc, reader = chapter(entry['id']), Chapter(entry['id'])
        base = entry['id'].replace('_', '-')
        current = {'id': f'{base}-intro', 'title': 'Intro', 'kind': 'introduction', 'blocks': []}
        found = []
        for node in doc.get('content') or []:
            if node.get('type') == 'heading':
                heading = ' '.join(inline(node.get('content')))
                if not heading: continue  # the reader has a few empty headings
                found.append(current)
                current = {'id': f'{base}-{slug(heading)}', 'title': heading, 'kind': 'subsection', 'blocks': []}
                continue
            current['blocks'] += reader.blocks(node)
        found.append(current)
        found = [u for u in found if u['blocks']]
        if len(found) == 1:  # a chapter with no headings is one lesson under its own name
            found[0].update(id=base, title=entry['title'], kind='section')
        for unit in found: units.append({**unit, 'section': section_id, 'source': entry['id']})
    applications = f'{part["number"]}.{len(sections) + 1}'
    for entry in part['applications']:
        if not entry['available']: continue
        reader = Chapter(entry['id'])
        blocks = []
        for node in chapter(entry['id']).get('content') or []:
            blocks += reader.blocks(node)
        units.append({'id': entry['id'].replace('_', '-'), 'title': entry['title'], 'kind': 'section', 'section': applications, 'source': entry['id'], 'blocks': blocks})
    return units, applications


def main(number, force):
    part = next(p for p in COURSE['parts'] if p['number'] == number)
    out = ROOT / f'src/data/cs109-part-{number}-native.md'
    if out.exists() and not force:
        raise SystemExit(f'{out.relative_to(ROOT)} exists and is the reviewed manuscript; pass --force to redraft it from the snapshot.')
    units, applications = lessons(part)
    ids = [u['id'] for u in units]
    duplicates = sorted({i for i in ids if ids.count(i) > 1})
    if duplicates: raise SystemExit(f'Duplicate lesson ids: {duplicates}')
    lines = [f'# {part["title"]}', '', f'@applications {applications}', '']
    for u in units:
        lines += [f'@@ {u["id"]} | {u["section"]} | {u["title"]} | {u["kind"]} | {u["source"]}', *[b + '\n' for b in u['blocks']], '']
    out.write_text('\n'.join(lines).rstrip() + '\n')
    print(f'Drafted {len(units)} lessons from {len(part["chapters"])} chapters and {sum(a["available"] for a in part["applications"])} applications into {out.relative_to(ROOT)}.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--part', type=int, required=True)
    parser.add_argument('--force', action='store_true')
    args = parser.parse_args()
    main(args.part, args.force)
