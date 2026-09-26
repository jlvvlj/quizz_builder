#!/usr/bin/env python3
"""Build reviewed, native Chapter 2 lessons and crop only actual diagram artwork."""
import argparse, hashlib, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SECTIONS=[('2.1','Basic Concepts'),('2.2','Probability Mass Functions'),('2.3','Functions of Random Variables'),('2.4','Expectation, Mean, and Variance'),('2.5','Joint PMFs of Multiple Random Variables'),('2.6','Conditioning'),('2.7','Independence'),('2.8','Summary and Discussion')]
# PDF page, diagram-only bounds. Captions are native text in the manuscript.
FIGURES={1:(56,[155,311,458,541]),2:(60,[153,102,461,401]),3:(61,[165,328,449,449]),4:(62,[183,180,431,307]),5:(63,[152,103,461,218]),7:(65,[154,103,459,237]),8:(67,[168,105,446,234]),9:(73,[186,108,429,233]),10:(74,[174,458,439,598]),11:(78,[175,103,439,317]),12:(81,[173,477,442,598]),13:(82,[144,359,469,580]),14:(84,[142,103,472,320]),15:(92,[215,107,400,254])}
def build(pdf=None):
 text=(ROOT/'src/data/probability-chapter-2-native.md').read_text()
 units=[]
 for raw in text.split('\n@@ ')[1:]:
  header,body=raw.split('\n',1)
  uid,sec,title,kind,pages=[s.strip() for s in header.split('|')]
  blocks=[]; summaries=[]; page=int(pages.split('-')[0])
  for part in re.split(r'\n\s*\n',body.strip()):
   part=part.strip()
   if not part:continue
   if part.startswith('@page '): page=int(part[6:]);continue
   if part.startswith('@summary '):summaries.append(part[9:]);continue
   if part=='@endcard':blocks.append(dict(kind='cardEnd',text='',pdfPage=page));continue
   if part.startswith('@figure '):
    n=int(part[8:]);p,bounds=FIGURES[n]
    blocks.append(dict(kind='figure',text=f'Figure 2.{n}',src=f'/probability/chapter-2/figure-2-{n}.webp',pdfPage=p,bounds=bounds));continue
   k='paragraph'
   if part.startswith('$$'):
    assert part.endswith('$$'),part
    k='formula';part=part[2:-2].strip()
   elif part.startswith('### '):k='heading';part=part[4:]
   elif part.startswith('> '):k='keypoint';part=part[2:]
   blocks.append(dict(kind=k,text=re.sub(r'\n(?!\\)', ' ',part) if k!='formula' else part,pdfPage=page))
  opening=next(b['text'] for b in blocks if b['kind']=='paragraph')
  units.append(dict(id=uid,section=sec,title=title,kind=kind,openingText=opening,opening={'images':[]},summary=summaries,formulas=[b['text'] for b in blocks if b['kind']=='formula'],cards=[{'id':uid+'-card-'+str(i),'title':b['text'],'images':[]} for i,b in enumerate(blocks) if b['kind']=='keypoint'],figures=[{'id':b['text'],'title':b['text'],'images':[]} for b in blocks if b['kind']=='figure'],examples=[{'id':b['text'],'title':b['text'],'images':[]} for b in blocks if b['kind']=='heading' and re.match(r'Example 2\.\d+\.',b['text'])],mathPassages=[],sourcePages=[],content=blocks,sourceRange={'firstPdfPage':int(pages.split('-')[0]),'lastPdfPage':int(pages.split('-')[-1])}))
 data=dict(deckId='probability-chapter-2',title='Discrete Random Variables',chapterNumber=2,lessonCount=len(units),sections=[dict(id=i,title=t) for i,t in SECTIONS],units=units)
 if pdf:
  import pdfplumber
  dest=ROOT/'public/probability/chapter-2';dest.mkdir(parents=True,exist_ok=True)
  with pdfplumber.open(pdf) as doc:
   for n,(p,bounds) in FIGURES.items():
    doc.pages[p-1].crop(bounds).to_image(resolution=220).original.convert('RGB').save(dest/f'figure-2-{n}.webp','WEBP',lossless=True)
  data['source']={'filename':pdf.name,'sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'firstPdfPage':56,'lastPdfPage':98}
 else:
  old=ROOT/'src/data/probability-chapter-2-source.json'
  if old.exists():data['source']=json.loads(old.read_text()).get('source',{})
 (ROOT/'src/data/probability-chapter-2-source.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 print(f'Built {len(units)} lessons, {sum(len(u["content"]) for u in units)} blocks, {len(FIGURES)} diagram crops.')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--pdf',type=Path);build(p.parse_args().pdf)
