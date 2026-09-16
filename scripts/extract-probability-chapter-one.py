#!/usr/bin/env python3
"""Extract reviewed Chapter 1 regions from the user-supplied PDF.

Requires pdfplumber with its rendering dependencies. Example:
  python3 scripts/extract-probability-chapter-one.py --pdf /path/to/source.pdf

The manifest is editorial data: exact headings, manually reviewed paragraph
boundaries, asset ownership, summaries, and crop coordinates in PDF points.
No OCR or generated reconstruction is used for the original source excerpts.
"""
import subprocess
import sys
import argparse
import copy
import hashlib
import json
from pathlib import Path
import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--pdf', required=True, type=Path)
args = parser.parse_args()
data = json.loads((ROOT / 'scripts/probability-chapter-one-manifest.json').read_text())
output = ROOT / 'public/probability/chapter-1'
output.mkdir(parents=True, exist_ok=True)
pdf = pdfplumber.open(args.pdf)
images = {}

def extract(name, parts):
    result = []
    for i, (page_no, top, bottom) in enumerate(parts, 1):
        assert 8 <= page_no <= 54 and 100 <= top < bottom <= 660
        page = pdf.pages[page_no - 1]
        # This full text-column width also contains the widest diagram.
        bbox = (128, top, 486, bottom)
        im = page.crop(bbox).to_image(resolution=220).original.convert('RGB')
        filename = '%s-%d.webp' % (name, i)
        im.save(output / filename, 'WEBP', lossless=True)
        item = dict(src='/probability/chapter-1/' + filename,
                    width=im.width, height=im.height,
                    pdfPage=page_no, printedPage=page_no-5,
                    bounds=list(bbox))
        result.append(item)
        images[filename] = item
    return result

for unit in data['units']:
    unit['opening'] = dict(images=extract(unit['id']+'-opening', unit['opening']))
    for kind in ('cards', 'figures', 'examples', 'mathPassages'):
        for asset in unit[kind]:
            asset['images'] = extract(asset['id'], asset.pop('parts'))
    # Original full passages allow every derivation and inline formula to be checked.
    r = unit['sourceRange']
    parts = [(p, r['startY'] if p == r['startPdfPage'] else 100,
              r['endY'] if p == r['endPdfPage'] else 655)
             for p in range(r['startPdfPage'], r['endPdfPage']+1)]
    unit['sourcePages'] = extract(unit['id']+'-source', parts)

for stale in output.glob('*.webp'):
    if stale.name not in images:
        stale.unlink()

data['source'] = dict(filename=args.pdf.name, sha256=hashlib.sha256(args.pdf.read_bytes()).hexdigest(),
                      chapter=1, firstPdfPage=8, lastPdfPage=54,
                      extraction='Original PDF regions rendered losslessly; summaries and formula lists are separate editorial text.')
data['lessonCount'] = len(data['units'])
(ROOT / 'src/data/probability-chapter-1-source.json').write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
(ROOT / 'docs/probability-chapter-1-extraction-inventory.json').write_text(json.dumps(images, indent=2)+'\n')
print('Extracted %d images; %d lesson items including %d section introductions.' % (len(images), data['lessonCount'], sum(u['kind'] == 'introduction' for u in data['units'])))

# Rebuild interactive notation whenever the original excerpts change.
subprocess.run([sys.executable, str(ROOT / 'scripts/extract-formula-annotations.py'), '--pdf', str(args.pdf)], check=True)
