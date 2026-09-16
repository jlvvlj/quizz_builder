#!/usr/bin/env python3
"""Add glyph-aligned annotation data without changing the source artwork."""
import json, re, argparse
from pathlib import Path
import pdfplumber
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--pdf',required=True);args=p.parse_args()
data=json.loads((ROOT/'src/data/probability-chapter-1-source.json').read_text())
pdf=pdfplumber.open(args.pdf)
cache={}; count=0
symbols=set('ΩΩØ∅∪∩∈∉⊂⊃⊆≠≤≥∞∑Σ∏⋃⋂=+−×·≈→')
cid={1:'⋃',2:'⋂',3:'(',4:')',5:'(',6:')',7:'ℝ',8:'{',9:'|',10:'}',11:'∑',12:'(',13:'∏',14:'(',15:')',16:'⏟',17:'⏟',18:'⏟',19:'⏟'}
translate={'\x00':'','!':'!','"':'∑','#':'∏','$':'⋃','%':'⋂'}
def annotate(image):
 global count
 key=image['src']
 if key in cache:return cache[key]
 x0,y0,x1,y1=image['bounds']; page=pdf.pages[image['pdfPage']-1]
 chars=[dict(c) for c in page.chars if c['x0']>=x0 and c['x1']<=x1 and c['top']>=y0 and c['bottom']<=y1 and c['text'].strip()]
 for c in chars:
  if c['text'].startswith('(cid:'):
   c['text']=cid[int(c['text'][5:-1])]
   if 'CMEX' in c['fontname']:c['bottom']=min(y1,c['bottom']+14)
 # Non-membership is printed as overlapping membership and slash glyphs.
 slashes=[]
 for c in chars:
  if c['text']=='∈':
   overlay=next((d for d in chars if d['text']=='/' and abs(d['top']-c['top'])<3 and c['x0']-1<=d['x0']<=c['x1']),None)
   if overlay:
    c['text']='∉';c['x1']=max(c['x1'],overlay['x1']);slashes.append(id(overlay))
 chars=[c for c in chars if id(c) not in slashes]
 # Font identity reliably distinguishes mathematical variables from italic English.
 def math(c):return any(f in c['fontname'] for f in ['CMMI','CMSY','CMEX','MSBM']) or c['text'] in symbols or c['text'].isdigit() or (c['text']=='P' and 'CMBX' in c['fontname'] and not any(re.match('[A-Za-z]',d['text']) and -.3<d['x0']-c['x1']<1 and abs(d['top']-c['top'])<3 for d in chars))
 for c in chars:c['_math']=math(c)
 picked=[]
 for c in chars:
  if c['_math']:picked.append(c)
  elif c['text'] in '0123456789=+−-<>/!|()[]{},.':
   if any(d['_math'] and abs((c['top']+c['bottom'])/2-(d['top']+d['bottom'])/2)<12 and min(abs(c['x0']-d['x1']),abs(c['x1']-d['x0']))<18 for d in chars):picked.append(c)
 # Group mathematical glyphs into horizontal formula runs, including raised indices.
 picked_ids={id(c) for c in picked}
 groups=[]
 for c in sorted(picked,key=lambda c:(round(c['top']/12),c['x0'])):
  matches=[g for g in groups if c['x0']-g['right']<14 and c['x0']>=g['left']-2 and c['top']<g['bottom']+2 and c['bottom']>g['top']-2 and not any(id(d) not in picked_ids and d['x0']>g['right'] and d['x1']<c['x0'] and abs(d['top']-c['top'])<5 for d in chars)]
  if matches:
   g=matches[-1];g['chars'].append(c);g['right']=max(g['right'],c['x1']);g['top']=min(g['top'],c['top']);g['bottom']=max(g['bottom'],c['bottom'])
  else:groups.append(dict(left=c['x0'],right=c['x1'],top=c['top'],bottom=c['bottom'],chars=[c]))
 # A fraction bar joins its numerator and denominator into one explorable region.
 for edge in page.edges:
  ex0,ex1,ey=edge['x0'],edge['x1'],edge['top']
  if not (x0<=ex0<ex1<=x1 and y0<ey<y1 and 3<ex1-ex0<180 and abs(edge['bottom']-ey)<1):continue
  above=[g for g in groups if g['right']>ex0 and g['left']<ex1 and 0<=ey-g['bottom']<13]
  below=[g for g in groups if g['right']>ex0 and g['left']<ex1 and 0<=g['top']-ey<13]
  if not above or not below:continue
  connected=above+below
  left=min(g['left'] for g in connected);right=max(g['right'] for g in connected)
  top=min(g['top'] for g in connected);bottom=max(g['bottom'] for g in connected)
  # Include the equality and adjacent probability expression on the same baseline.
  adjacent=[g for g in groups if g not in connected and g['top']<ey+6 and g['bottom']>ey-6 and min(abs(g['right']-left),abs(g['left']-right))<16]
  connected+=adjacent
  glyphs=[c for g in connected for c in g['chars']]
  glyphs.append(dict(text='/',fontname='FractionBar',x0=ex0,x1=ex1,top=ey-.4,bottom=ey+.6))
  for g in connected:
   if g in groups:groups.remove(g)
  groups.append(dict(left=min(c['x0'] for c in glyphs),right=max(c['x1'] for c in glyphs),top=min(c['top'] for c in glyphs),bottom=max(c['bottom'] for c in glyphs),chars=glyphs))
 groups.sort(key=lambda g:(g['top'],g['left']))
 result=[]
 for g in groups:
  terms=[]
  for c in g['chars']:
   s=c['text']
   # CMEX encodes large operators in custom character slots.
   if 'CMEX' in c['fontname']:s={'!':'∑','"':'∑','#':'∏','$':'∏','%':'⋂','&':'⋃'}.get(s,s)
   if not s or ord(s[0])<32 or s in ['•','†']:continue
   terms.append(dict(symbol=s,bounds=[round(c['x0']-x0,2),round(c['top']-y0,2),round(max(3 if 'CMEX' in c['fontname'] else .2,c['x1']-c['x0']),2),round(c['bottom']-c['top'],2)]))
  if any(t['symbol'] not in '.,;()[]{}' for t in terms):result.append(dict(bounds=[round(g['left']-x0,2),round(g['top']-y0,2),round(max(3,g['right']-g['left']),2),round(g['bottom']-g['top'],2)],terms=terms))
 cache[key]=result;count+=len(result);return result
for u in data['units']:
 for image in [*u['opening']['images'],*u['sourcePages'],*[i for k in ('mathPassages','cards','examples','figures') for a in u[k] for i in a['images']]]:
  image['formulaRegions']=annotate(image)
# Compact only the derived coordinates; keep reviewed source text readable.
replacements={}
def compact_regions(value):
 if isinstance(value,dict):
  for key,item in value.items():
   if key=='formulaRegions':
    marker='__FORMULA_REGIONS_'+str(len(replacements))+'__'
    replacements[marker]=json.dumps(item,ensure_ascii=False,separators=(',',':'))
    value[key]=marker
   else:compact_regions(item)
 elif isinstance(value,list):
  for item in value:compact_regions(item)
compact_regions(data)
rendered=json.dumps(data,ensure_ascii=False,indent=2)
for marker,value in replacements.items():rendered=rendered.replace('"'+marker+'"',value)
(ROOT/'src/data/probability-chapter-1-source.json').write_text(rendered+'\n')
print(f'Annotated {count} mathematical regions across {len(cache)} excerpts.')
