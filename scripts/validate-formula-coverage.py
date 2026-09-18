#!/usr/bin/env python3
"""Check mathematical variables and operators in every excerpt have annotations."""
import argparse,json
from pathlib import Path
import pdfplumber
p=argparse.ArgumentParser();p.add_argument('--pdf',required=True);args=p.parse_args()
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'src/data/probability-chapter-1-source.json').read_text())
pdf=pdfplumber.open(args.pdf);checked=set();glyphs=0
for u in data['units']:
 images=u['opening']['images']+u['sourcePages']+[im for kind in ['cards','figures','examples','mathPassages'] for a in u[kind] for im in a['images']]
 for im in images:
  if im['src'] in checked:continue
  checked.add(im['src']);x0,y0,x1,y1=im['bounds']
  terms=[t for r in im['formulaRegions'] for t in r['terms']]
  for c in pdf.pages[im['pdfPage']-1].chars:
   if not (x0<=c['x0'] and c['x1']<=x1 and y0<=c['top'] and c['bottom']<=y1):continue
   if not any(f in c['fontname'] for f in ['CMMI','CMSY','CMEX','MSBM']):continue
   if not c['text'].strip() or c['text'] in ['•','†','.',',',';',')','(','[',']','{','}']:continue
   # Delimiters are grouping artwork, not independent mathematical quantities.
   if c['text'] in [f'(cid:{n})' for n in [3,4,5,6,8,10,12,14,15,16,17,18,19]]:continue
   # A combined symbol (for example ∉) may own several overlapping glyphs.
   cx=(c['x0']+c['x1'])/2-x0;cy=(c['top']+c['bottom'])/2-y0
   assert any(t['bounds'][0]-.05<=cx<=t['bounds'][0]+t['bounds'][2]+.05 and t['bounds'][1]-.05<=cy<=t['bounds'][1]+t['bounds'][3]+.05 for t in terms), (im['src'],c['text'],c['x0'],c['top'])
   glyphs+=1
print(f'PASS: {glyphs} mathematical glyphs annotated across {len(checked)} original excerpts.')
