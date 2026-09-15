#!/usr/bin/env python3
"""Inspect downloaded assets and generate a self-contained visual contact sheet."""
import base64, html, json, sys, xml.etree.ElementTree as ET
from pathlib import Path
import assets as A

def main():
 config=json.loads((A.ROOT/'lab/experiment.json').read_text()); group=config['name']
 out=A.CACHE/'reports'/group;out.mkdir(parents=True,exist_ok=True)
 manifest=json.loads((A.ROOT/'lab/sources.lock.json').read_text()); results=[];images=[]
 for e in manifest['assets']:
  path=A.target(e.get('extract_to',e['file']))
  files=list(path.rglob('*')) if path.is_dir() else [path]
  svgs=[f for f in files if f.suffix.lower()=='.svg']; pngs=[f for f in files if f.suffix.lower()=='.png']
  libs=[f for f in files if f.suffix=='.excalidrawlib']
  checks={}
  for f in svgs[:3]:
   ET.parse(f);checks['svg_parse']='passed'
  if libs:
   total=0
   for f in libs:
    d=json.loads(f.read_text());total+=len(d.get('libraryItems',d.get('library',[])))
   checks['excalidraw_libraries']=len(libs);checks['library_items']=total
  if e.get('kind')=='quickdraw-prefix':
   rows=[json.loads(l) for l in path.read_text().splitlines()];assert len(rows)==20
   for row in rows:
    for stroke in row['drawing']:assert len(stroke[0])==len(stroke[1]) and len(stroke[0])>0
   checks['drawings']=len(rows)
   if len(images)<24:
    paths=[]
    for stroke in rows[0]['drawing']:
     pts=list(zip(stroke[0],stroke[1]));paths.append('M'+' L'.join(f'{x},{y}' for x,y in pts))
    svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 276 276">'+''.join(f'<path d="{p}" fill="none" stroke="#164e63" stroke-width="3"/>' for p in paths)+'</svg>'
    images.append((e['id'],'image/svg+xml',svg.encode()))
  elif len(images)<24:
   for f in (svgs or pngs)[:3]:
    if f.stat().st_size<2_000_000:images.append((e['id']+'/'+f.name,'image/svg+xml' if f.suffix=='.svg' else 'image/png',f.read_bytes()))
  pyfiles=[f for f in files if f.suffix=='.py']
  if pyfiles and not svgs:
   import ast
   for f in pyfiles[:10]:ast.parse(f.read_text())
   checks['python_source_parse']=min(10,len(pyfiles))
  results.append({'id':e['id'],'svg_files':len(svgs),'png_files':len(pngs),'checks':checks})
 cards=''.join('<article><img src="data:'+mime+';base64,'+base64.b64encode(data).decode()+'"><p>'+html.escape(label)+'</p></article>' for label,mime,data in images)
 page='<!doctype html><meta charset="utf-8"><title>'+group+'</title><style>body{font:16px sans-serif;background:#f5f3ef;color:#18343e;margin:32px}main{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}article{background:white;padding:16px;border-radius:12px}img{width:100%;height:180px;object-fit:contain}p{overflow-wrap:anywhere;font-size:12px}</style><h1>'+group+'</h1><p>Asset import smoke test — not a finished story video.</p><main>'+cards+'</main>'
 (out/'gallery.html').write_text(page);(out/'smoke.json').write_text(json.dumps(results,indent=2))
 print(json.dumps({'group':group,'assets':len(results),'gallery':str(out/'gallery.html'),'results':str(out/'smoke.json')},indent=2))
if __name__=='__main__':main()
