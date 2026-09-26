#!/usr/bin/env python3
"""Compile a CS109 part's reviewed manuscript into the lesson data the app reads.

Reads src/data/cs109-part-<n>-native.md and writes src/data/cs109-part-<n>-source.json. With
--images it also downloads the part's figures from the reader and stores them as WebP under
public/cs109/part-<n>/, the way the book chapters keep only their diagram artwork as images.

Manuscript syntax, one block per blank-line-separated paragraph:
  @@ id | section | title | kind | reader chapter    starts a lesson
  $$ … $$                                            a displayed formula
  ### text                                           a heading inside the lesson
  > title … @endcard                                  a boxed card; titles starting "Example" are examples
  @figure <image id> | <description>                 a figure from the reader, described for screen readers
  @interactive <id>                                  one of this course's interactive figures, in place
  ```lang … ```                                      a code block (may contain blank lines)
  - item                                             a bulleted list, one item per line
  @summary text                                      a Key ideas line for the lesson
"""
import argparse, base64, io, json, re, urllib.request
from pathlib import Path
from cs109_reader import ROOT, SOURCE, chapter, image_id

COURSE = json.loads((ROOT / 'src/data/cs109-course.json').read_text())
EXAMPLE = re.compile(r'^(Example|Worked example|Simple Example)\b')


def image_sources():
    """Reader image id -> the URL the reader serves it from."""
    found = {}
    def walk(node):
        if isinstance(node, dict):
            if node.get('type') == 'kindImage': found[image_id(node['attrs'])] = node['attrs']['src']
            for child in node.get('content') or []: walk(child)
    for chapter_id in json.loads((SOURCE / 'manifest.json').read_text())['chapters']: walk(chapter(chapter_id))
    return found


def parse_blocks(body, number):
    code = []
    def keep(match):
        code.append((match.group(1), match.group(2)))
        return f'@code {len(code) - 1}'
    body = re.sub(r'```(\w*)\n(.*?)\n```', keep, body, flags=re.S)
    blocks, summary = [], []
    for part in re.split(r'\n\s*\n', body.strip()):
        part = part.strip()
        if not part: continue
        if part.startswith('@summary '): summary.append(part[9:]); continue
        if part == '@endcard': blocks.append({'kind': 'cardEnd', 'text': ''}); continue
        if part.startswith('@figure '):
            image, _, alt = part[8:].partition('|')
            image, alt = image.strip(), alt.strip()
            assert alt, f'Figure {image} needs a description: the reader gives its images no caption.'
            blocks.append({'kind': 'figure', 'text': 'Figure', 'alt': alt, 'image': image, 'src': f'/cs109/part-{number}/{image}.webp'}); continue
        if part.startswith('@interactive '): blocks.append({'kind': 'interactive', 'text': part[13:].strip()}); continue
        if part.startswith('@code '):
            language, text = code[int(part[6:])]
            blocks.append({'kind': 'code', 'text': text, 'language': language or 'text'}); continue
        if part.startswith('$$'):
            assert part.endswith('$$'), part
            blocks.append({'kind': 'formula', 'text': part[2:-2].strip()}); continue
        if part.startswith('### '): blocks.append({'kind': 'heading', 'text': part[4:]}); continue
        if part.startswith('> '): blocks.append({'kind': 'keypoint', 'text': part[2:].strip()}); continue
        if all(line.startswith('- ') for line in part.split('\n')):
            blocks.append({'kind': 'list', 'text': '', 'items': [line[2:].strip() for line in part.split('\n')]}); continue
        assert not part.startswith('@'), f'Unknown directive: {part[:60]}'
        blocks.append({'kind': 'paragraph', 'text': re.sub(r'\s*\n\s*', ' ', part)})
    return blocks, summary


def build(number, download):
    part = next(p for p in COURSE['parts'] if p['number'] == number)
    text = (ROOT / f'src/data/cs109-part-{number}-native.md').read_text()
    applications = re.search(r'^@applications (\S+)$', text, re.M).group(1)
    sections = [{'id': f'{number}.{i + 1}', 'title': c['title']} for i, c in enumerate(part['chapters'])]
    sections.append({'id': applications, 'title': 'Applications'})
    units = []
    for raw in text.split('\n@@ ')[1:]:
        header, body = raw.split('\n', 1)
        uid, section, title, kind, reader_chapter = [s.strip() for s in header.split('|')]
        assert any(s['id'] == section for s in sections), f'{uid}: unknown section {section}'
        blocks, summary = parse_blocks(body, number)
        cards = [b['text'] for b in blocks if b['kind'] == 'keypoint']
        units.append({
            'id': uid, 'section': section, 'title': title, 'kind': kind, 'readerChapter': reader_chapter,
            'openingText': next((b['text'] for b in blocks if b['kind'] == 'paragraph'), title),
            'opening': {'images': []}, 'summary': summary,
            'formulas': [b['text'] for b in blocks if b['kind'] == 'formula'],
            'cards': [{'id': f'{uid}-card-{i}', 'title': t, 'images': []} for i, t in enumerate(cards) if not EXAMPLE.match(t)],
            'examples': [{'id': f'{uid}-example-{i}', 'title': t, 'images': []} for i, t in enumerate(cards) if EXAMPLE.match(t)],
            'figures': [{'id': b['image'], 'title': 'Figure', 'images': []} for b in blocks if b['kind'] == 'figure'],
            'mathPassages': [], 'sourcePages': [], 'content': blocks,
        })
    ids = [u['id'] for u in units]
    assert len(set(ids)) == len(ids), 'duplicate lesson ids'
    manifest = json.loads((SOURCE / 'manifest.json').read_text())
    used = sorted({u['readerChapter'] for u in units})
    data = {'deckId': part['deckId'], 'title': part['title'], 'label': 'Part', 'chapterNumber': number,
            'lessonCount': len(units), 'sections': sections, 'units': units,
            'source': {'url': manifest['source'], 'fetchedAt': manifest['fetchedAt'],
                       'chapters': {c: manifest['chapters'][c]['sha256'] for c in used}}}
    if download:
        from PIL import Image
        urls, dest = image_sources(), ROOT / f'public/cs109/part-{number}'
        dest.mkdir(parents=True, exist_ok=True)
        for image in sorted({b['image'] for u in units for b in u['content'] if b['kind'] == 'figure'}):
            if urls[image].startswith('data:'): raw = base64.b64decode(urls[image].split(',', 1)[1])
            else:
                with urllib.request.urlopen(urls[image], timeout=60) as response: raw = response.read()
            picture = Image.open(io.BytesIO(raw))
            picture = picture.convert('RGBA' if picture.mode in ('RGBA', 'LA', 'P') else 'RGB')
            picture.thumbnail((1600, 1600))
            # Diagrams have few colours and stay pixel-exact; photographs compress lossily.
            diagram = picture.getcolors(4096) is not None
            picture.save(dest / f'{image}.webp', 'WEBP', **({'lossless': True} if diagram else {'quality': 82}))
    (ROOT / f'src/data/cs109-part-{number}-source.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    blocks = sum(len(u['content']) for u in units)
    print(f'Built part {number}: {len(units)} lessons, {len(sections)} sections, {blocks} blocks.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--part', type=int, required=True)
    parser.add_argument('--images', action='store_true', help='download the figures from the reader')
    args = parser.parse_args()
    build(args.part, args.images)
