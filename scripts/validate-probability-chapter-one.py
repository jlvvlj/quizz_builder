#!/usr/bin/env python3
"""Validate the extraction inventory and detect clipped source glyphs."""
import argparse
import hashlib
import json
import re
from pathlib import Path
import pdfplumber
from PIL import Image

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--pdf', required=True, type=Path)
args = parser.parse_args()
data = json.loads((root/'src/data/probability-chapter-1-source.json').read_text())
assert data['source']['sha256'] == hashlib.sha256(args.pdf.read_bytes()).hexdigest()
pdf = pdfplumber.open(args.pdf)
units = data['units']
assert len({u['id'] for u in units}) == len(units) == 27
assert sum(u['kind']=='subsection' for u in units) == 20
assert sum(u['kind']=='section' for u in units) == 2
assert sum(u['kind']=='introduction' for u in units) == 5
assert data['lessonCount'] == 27
assert [sum(u['section']==s['id'] for u in units) for s in data['sections']] == [3,9,3,1,5,5,1]
for section in data['sections']:
    section_units = [u for u in units if u['section'] == section['id']]
    if any(u['kind'] == 'subsection' for u in section_units):
        assert section_units[0]['kind'] == 'introduction', section['id']
for kind,count in [('cards',13),('figures',16),('examples',30)]:
    ids={a['id'] for u in units for a in u[kind]}
    assert ids == {'%s-%d'%(kind,n) for n in range(1,count+1)}

# Every mathematical glyph in the lesson body must be visible in its opening,
# an explanatory passage, or an existing card/figure/example (not only hidden
# behind the complete-source disclosure). Floated assets may belong to a nearby
# subsection, so their reviewed assignments are checked chapter-wide.
visible_images = [im for u in units for kind in ('cards','figures','examples','mathPassages')
                  for a in u[kind] for im in a['images']]
for u in units:
    coverage = visible_images + u['opening']['images']
    r = u['sourceRange']
    for pn in range(r['startPdfPage'], r['endPdfPage'] + 1):
        top = r['startY'] if pn == r['startPdfPage'] else 100
        bottom = r['endY'] if pn == r['endPdfPage'] else 655
        for char in pdf.pages[pn - 1].chars:
            y = (char['top'] + char['bottom']) / 2
            if not (top <= y <= bottom and 128 < char['x0'] < 486):
                continue
            is_math = any(font in char['fontname'] for font in ('CMMI','CMSY','CMEX','MSAM','MSBM')) or char['text'] in '=∈∉⊂⊃ΩΩØ∅'
            if is_math:
                assert any(im['pdfPage'] == pn and im['bounds'][1] <= y <= im['bounds'][3]
                           for im in coverage), (u['id'], pn, char['text'], y)

sets_intro = next(u for u in units if u['id'] == 'sets-introduction')
assert len(sets_intro['mathPassages']) == 5
assert 'x ∈ S' in sets_intro['mathPassages'][0]['text']
assert 'If S contains a finite number of elements' in sets_intro['mathPassages'][1]['text']
assert 'S = {x₁, x₂, …, xₙ}' in sets_intro['mathPassages'][1]['text']

seen=set()
for u in units:
    assert u['opening']['images'] and u['summary'] and u['sourcePages']
    # Verify the exact heading words occur in the source page identified by the unit.
    heading = re.sub(r'\W','',u['title']).lower()
    page_text = re.sub(r'\W','',pdf.pages[u['sourcePages'][0]['pdfPage']-1].extract_text()).lower()
    assert heading in page_text, u['title']
    assets = [u['opening'], {'images':u['sourcePages']}] + [a for kind in ('cards','figures','examples','mathPassages') for a in u[kind]]
    for a in assets:
        for im in a['images']:
            path=root/'public'/im['src'].lstrip('/')
            assert path.is_file(),path
            with Image.open(path) as image:
                assert image.size == (im['width'],im['height'])
            seen.add(path.name)
            x0,top,x1,bottom=im['bounds']
            page=pdf.pages[im['pdfPage']-1]
            clipped=[c for c in page.chars if x0<c['x0']<c['x1']<x1 and
                     (c['top']<top-.2<c['bottom']-.2 or c['top']+.2<bottom<c['bottom']-.2)]
            assert not clipped,(u['id'],path.name,''.join(c['text'] for c in clipped))
    for card in u['cards']:
        im=card['images'][0];x0,top,x1,bottom=im['bounds']
        assert any(abs(r['x0']-133)<1 and r['width']>340 and top<=r['top']<r['bottom']<=bottom
                   for r in pdf.pages[im['pdfPage']-1].rects),card['title']
assert seen == {p.name for p in (root/'public/probability/chapter-1').glob('*.webp')}
assert 'probability-chapter-1' not in (root/'src/utils/lessons.ts').read_text()
print('PASS: 27 lessons including 5 introductions, %d explanatory passages, 13 original cards, all 16 figures, all 30 examples, %d intact excerpts; complete math coverage, no clipped glyphs or orphan assets.'%(sum(len(u['mathPassages']) for u in units),len(seen)))
