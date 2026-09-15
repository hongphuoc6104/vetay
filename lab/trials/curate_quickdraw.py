"""Make 100-candidate contact sheet. Geometric screening is not human approval."""
import json,html
from pathlib import Path
from run import CACHE,HERE,OUT,dump
categories=['cat','rainbow','umbrella','apple','banana','bicycle','bird','book','butterfly','car','clock','cloud','cup','fish','flower','house','ice cream','moon','star','tree']
old=json.loads((HERE/'quickdraw-selection.json').read_text()) if (HERE/'quickdraw-selection.json').exists() else [];review={str(r['key_id']):r['status'] for r in old}
rows=[];cards=[]
for cat in categories:
 candidates=[json.loads(s) for s in (CACHE/'assets/quickdraw'/f'{cat}.ndjson').read_text().splitlines()]
 valid=[]
 for i,r in enumerate(candidates):
  d=r['drawing'];x=[v for a in d for v in a[0]];y=[v for a in d for v in a[1]]
  if r.get('recognized') and len(x)>12 and max(x)-min(x)>80 and max(y)-min(y)>60 and len(d)<18:valid.append((i,r))
 if len(valid)<5:raise ValueError('Not enough candidates '+cat)
 for i,r in valid[:5]:
  paths=''.join('<polyline points="'+' '.join(f'{x},{y}' for x,y in zip(s[0],s[1]))+'"/>' for s in r['drawing'])
  rows.append({'category':cat,'sample':i,'key_id':r['key_id'],'status':review.get(str(r['key_id']),'geometry-screened; visual contact sheet available')})
  cards.append(f'<div><svg viewBox="-15 -15 285 285"><g fill="none" stroke="#173f46" stroke-width="4" stroke-linecap="round">{paths}</g></svg><p>{html.escape(cat)} #{i}</p></div>')
dump(HERE/'quickdraw-selection.json',rows);p=OUT/'quickdraw-contact.html';p.write_text('<meta charset="utf-8"><style>body{display:grid;grid-template-columns:repeat(10,1fr);font:14px sans-serif;background:#f5efdf}div{border:1px solid #ccc;padding:8px}svg{width:120px;height:120px}p{margin:0}</style>'+''.join(cards));print(p)
