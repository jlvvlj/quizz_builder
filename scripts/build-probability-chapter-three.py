#!/usr/bin/env python3
"""Build reviewed, native Chapter 3 lessons and crop only actual diagram artwork."""
import argparse, hashlib, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SECTIONS=[('3.1','Continuous Random Variables and PDFs'),('3.2','Cumulative Distribution Functions'),('3.3','Normal Random Variables'),('3.4','Conditioning on an Event'),('3.5','Multiple Continuous Random Variables'),('3.6','Derived Distributions'),('3.7','Summary and Discussion')]
# PDF page, diagram-only bounds read off the figure frames printed in the PDF. Captions are native text in the manuscript.
FIGURES={1:(101,[167,108,447,204]),2:(101,[136,438,298,535]),3:(102,[141,381,293,470]),4:(103,[210,523,404,621]),5:(107,[161,529,452,619]),6:(110,[149,108,465,294]),7:(112,[160,108,454,306]),8:(113,[207,108,406,265]),9:(114,[150,507,464,591]),10:(116,[141,477,473,578]),11:(118,[178,106,458,260]),13:(119,[212,351,401,495]),14:(122,[143,516,303,636]),15:(123,[177,367,436,553]),16:(126,[206,435,407,615]),17:(127,[153,201,269,298]),18:(128,[195,479,419,603]),19:(129,[136,296,286,436]),20:(140,[139,108,475,339]),21:(141,[154,108,460,223]),22:(143,[173,304,441,554]),23:(145,[178,220,436,338]),24:(147,[223,108,390,256]),25:(148,[182,185,431,307]),26:(149,[179,108,435,224])}
def build(pdf=None):
 text=(ROOT/'src/data/probability-chapter-3-native.md').read_text()
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
    blocks.append(dict(kind='figure',text=f'Figure 3.{n}',src=f'/probability/chapter-3/figure-3-{n}.webp',pdfPage=p,bounds=bounds));continue
   k='paragraph'
   if part.startswith('$$'):
    assert part.endswith('$$'),part
    k='formula';part=part[2:-2].strip()
   elif part.startswith('### '):k='heading';part=part[4:]
   elif part.startswith('> '):k='keypoint';part=part[2:]
   blocks.append(dict(kind=k,text=re.sub(r'\n(?!\\)', ' ',part) if k!='formula' else part,pdfPage=page))
  opening=next(b['text'] for b in blocks if b['kind']=='paragraph')
  units.append(dict(id=uid,section=sec,title=title,kind=kind,openingText=opening,opening={'images':[]},summary=summaries,formulas=[b['text'] for b in blocks if b['kind']=='formula'],cards=[{'id':uid+'-card-'+str(i),'title':b['text'],'images':[]} for i,b in enumerate(blocks) if b['kind']=='keypoint'],figures=[{'id':b['text'],'title':b['text'],'images':[]} for b in blocks if b['kind']=='figure'],examples=[{'id':b['text'],'title':b['text'],'images':[]} for b in blocks if b['kind']=='heading' and re.match(r'Example 3\.\d+\.',b['text'])],mathPassages=[],sourcePages=[],content=blocks,sourceRange={'firstPdfPage':int(pages.split('-')[0]),'lastPdfPage':int(pages.split('-')[-1])}))
 data=dict(deckId='probability-chapter-3',title='General Random Variables',chapterNumber=3,lessonCount=len(units),sections=[dict(id=i,title=t) for i,t in SECTIONS],units=units)
 if pdf:
  import pdfplumber
  dest=ROOT/'public/probability/chapter-3';dest.mkdir(parents=True,exist_ok=True)
  with pdfplumber.open(pdf) as doc:
   for n,(p,bounds) in FIGURES.items():
    doc.pages[p-1].crop(bounds).to_image(resolution=220).original.convert('RGB').save(dest/f'figure-3-{n}.webp','WEBP',lossless=True)
  data['source']={'filename':pdf.name,'sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'firstPdfPage':99,'lastPdfPage':150}
 else:
  old=ROOT/'src/data/probability-chapter-3-source.json'
  if old.exists():data['source']=json.loads(old.read_text()).get('source',{})
 (ROOT/'src/data/probability-chapter-3-source.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 print(f'Built {len(units)} lessons, {sum(len(u["content"]) for u in units)} blocks, {len(FIGURES)} diagram crops.')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--pdf',type=Path);build(p.parse_args().pdf)
