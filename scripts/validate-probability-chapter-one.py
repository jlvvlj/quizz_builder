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
assert data['lessonCount'] == 22
assert [sum(u['section']==s['id'] and u['kind']!='introduction' for u in units) for s in data['sections']] == [2,8,2,1,4,4,1]
for kind,count in [('cards',13),('figures',16),('examples',30)]:
    ids={a['id'] for u in units for a in u[kind]}
    assert ids == {'%s-%d'%(kind,n) for n in range(1,count+1)}

seen=set()
for u in units:
    assert u['opening']['images'] and u['summary'] and u['sourcePages']
    # Verify the exact heading words occur in the source page identified by the unit.
    heading = re.sub(r'\W','',u['title']).lower()
    page_text = re.sub(r'\W','',pdf.pages[u['sourcePages'][0]['pdfPage']-1].extract_text()).lower()
    assert heading in page_text, u['title']
    assets = [u['opening'], {'images':u['sourcePages']}] + [a for kind in ('cards','figures','examples') for a in u[kind]]
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
print('PASS: 22 lessons, 5 introductions, 13 original cards, all 16 figures, all 30 examples, %d intact excerpts; no clipped glyphs or orphan assets.'%len(seen))
