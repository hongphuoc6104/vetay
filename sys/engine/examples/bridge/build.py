import json,copy,sys,os
from pathlib import Path
root=Path(__file__).resolve().parents[4]
P={
'page':'M 8 3 L 72 3 L 93 23 L 93 97 L 8 97 Z M 72 3 L 72 23 L 93 23 M 23 39 L 77 39 M 23 55 L 77 55 M 23 71 L 60 71',
'blank':'M 8 3 L 72 3 L 93 23 L 93 97 L 8 97 Z M 72 3 L 72 23 L 93 23',
'clock':'M 50 3 C 76 3 97 24 97 50 C 97 76 76 97 50 97 C 24 97 3 76 3 50 C 3 24 24 3 50 3 M 50 12 L 50 19 M 81 50 L 89 50 M 50 81 L 50 89 M 11 50 L 19 50 M 50 27 L 50 50 L 26 50',
'person':'M 50 3 C 72 3 72 26 50 26 C 28 26 28 3 50 3 M 50 26 L 50 64 M 50 36 L 24 54 M 50 36 L 75 47 L 91 32 M 50 64 L 27 96 M 50 64 L 77 96',
'people':'M 25 5 C 42 5 42 25 25 25 C 8 25 8 5 25 5 M 5 66 L 5 45 Q 25 23 45 45 L 45 66 Z M 74 5 C 91 5 91 25 74 25 C 57 25 57 5 74 5 M 54 66 L 54 45 Q 74 23 94 45 L 94 66 Z',
'question':'M 20 27 C 18 0 81 0 81 29 C 81 48 51 48 51 67 M 51 84 L 51 90',
'check':'M 8 48 L 37 79 L 93 13',
'cross':'M 8 8 L 92 92 M 92 8 L 8 92',
'lens':'M 44 3 C 65 3 84 20 84 42 C 84 64 65 82 44 82 C 22 82 4 64 4 42 C 4 20 22 3 44 3 M 72 74 L 96 98 M 78 69 L 100 92',
'robot':'M 25 24 L 25 9 L 75 9 L 75 24 M 50 9 L 50 0 M 12 24 L 88 24 L 96 34 L 96 79 L 85 90 L 15 90 L 4 79 L 4 34 Z M 27 43 L 27 55 M 73 43 L 73 55 M 31 71 Q 50 82 70 71',
'book':'M 50 18 Q 22 0 3 9 L 3 86 Q 25 75 50 93 Q 75 75 97 86 L 97 9 Q 73 0 50 18 L 50 93 M 15 27 L 38 34 M 15 43 L 38 50 M 63 34 L 86 27 M 63 50 L 86 43',
'door':'M 6 95 L 6 4 L 94 4 L 94 95 M 15 95 L 15 14 L 85 14 L 85 95 Z M 73 57 L 75 57',
'desk':'M 5 10 L 87 10 L 98 32 L 3 32 Z M 9 32 L 9 98 L 17 98 L 17 32 M 86 32 L 86 98 L 94 98 L 94 32 M 17 49 L 86 49',
'scroll':'M 13 4 L 90 4 Q 98 4 98 15 L 22 15 L 22 88 Q 22 98 7 98 Q 1 98 1 88 L 83 88 L 83 15 M 32 29 L 71 29 M 32 44 L 71 44 M 32 59 L 71 59 M 32 74 L 63 74',
'chair':'M 8 5 L 83 5 L 83 53 M 8 5 L 8 61 L 84 61 L 96 69 L 18 69 L 8 61 M 18 69 L 18 98 M 83 69 L 83 98 M 8 24 L 83 24 M 8 42 L 83 42',
'armchair':'M 12 41 L 12 18 Q 12 4 27 4 L 74 4 Q 90 4 90 18 L 90 41 M 4 37 L 23 37 L 23 66 L 77 66 L 77 37 L 96 37 L 96 86 L 4 86 Z M 13 86 L 13 98 M 87 86 L 87 98',
'fold':'M 20 3 L 73 3 L 88 57 L 35 57 Z M 32 57 L 76 98 M 83 57 L 27 98 M 28 29 L 79 29',
'room':'M 5 3 L 95 3 L 95 97 L 65 97 M 42 97 L 5 97 Z M 42 97 L 42 60 Q 68 60 68 97',
'calendar':'M 5 10 L 95 10 L 95 95 L 5 95 Z M 5 29 L 95 29 M 23 1 L 23 19 M 77 1 L 77 19 M 35 29 L 35 95 M 65 29 L 65 95 M 5 51 L 95 51 M 5 73 L 95 73',
'arrow':'M 3 50 L 94 50 M 74 27 L 96 50 L 74 73',
'bag':'M 25 26 L 25 15 Q 50 0 75 15 L 75 26 M 15 25 L 85 25 L 97 93 L 3 93 Z M 25 42 L 75 42 L 75 75 L 25 75 Z',
'ruler':'M 3 20 L 97 20 L 97 80 L 3 80 Z M 16 20 L 16 49 M 30 20 L 30 38 M 44 20 L 44 49 M 58 20 L 58 38 M 72 20 L 72 49 M 86 20 L 86 38'
}
def c(pid,edge='speechStart',offset=0):return {'phrase':pid,'edge':edge,'offset':offset}
class Film:
 def __init__(self,ep):
  self.ep=ep;self.base=root/'sys/work/example-bridge';self.story=json.loads((self.base/'storyboard.json').read_text());self.lib={};self.groups={};self.labels={}
  self.t=json.loads((self.base/'timeline.json').read_text())
  self.rows={i:[p for p in self.t['phrases'] if p['sceneId']==f's{i:02}'] for i in range(1,21)}
 def start(self,b):return 0 if b==1 else c(self.rows[b][0]['id'])
 def end(self,b):return self.t['targetSeconds'] if b==20 else self.start(b+1)
 def add(self,id,shape,box,b,part=0,total=1,color='ink',last=20,**kw):
  rows=self.rows[b];a=rows[min(len(rows)-1,int(len(rows)*part/total))];z=rows[min(len(rows)-1,max(0,int(len(rows)*(part+1)/total)-1))]
  d={'id':id,'path':P.get(shape,shape),'box':box,'cue':c(a['id']),'endCue':c(z['id'],'speechEnd'),'color':color,'lineWidth':6,**kw}
  if total>len(rows):
   dur=(rows[-1]['speechEnd']-rows[0]['speechStart'])/total
   d['cue']=c(rows[0]['id'],offset=dur*part);d['endCue']=c(rows[0]['id'],offset=dur*(part+1))
  if last<20:d['exit']=self.end(last)
  self.lib[id]=d;self.groups[id]=(b,last);return id
 def move(self,id,b,key,va,vb):
  d=self.lib[id];d.setdefault('animate',{}).setdefault(key,[]).extend([{'at':c(self.rows[b][0]['id']),'value':va},{'at':c(self.rows[b][-1]['id'],'speechEnd'),'value':vb}])
 def label(self,b,text):self.labels[b]=text
 def circle(self,id,box,b,**kw):return self.add(id,'M 50 2 C 77 2 98 23 98 50 C 98 77 77 98 50 98 C 23 98 2 77 2 50 C 2 23 23 2 50 2',box,b,color='gold',**kw)
 def bridge(self,prefix,b,last=20,small=False):
  box=[150,570,770,590] if not small else [200,345,680,250]
  self.add(prefix+'banks','M 1 42 L 17 42 L 19 88 M 84 42 L 99 42 M 84 42 L 82 88',box,b,0,2,last=last)
  self.add(prefix+'deck','M 17 37 Q 51 33 85 37 M 17 42 Q 51 38 85 42 M 17 23 Q 51 19 85 23 M 20 23 L 20 38 M 35 22 L 35 36 M 50 21 L 50 35 M 65 22 L 65 36 M 82 23 L 82 38',box,b,1,2,last=last)
  return box
 def supports(self,id,box,b,last=20):self.add(id,'M 29 40 L 29 85 L 36 85 L 36 40 M 67 40 L 67 85 L 74 85 L 74 40 M 26 88 L 39 88 M 64 88 L 77 88',box,b,color='teal',last=last)
 def save(self):
  # Retire previous visual emphasis and unrelated scene props.
  limits={'01':{'stop-mark':15,'checking':13,'source-unknown':15,'source-group':15},'02':{'choose':18,'reminder':11},'03':{'blocked-door':5,'reading':10,'measure':8,'size-check':10,'door-swing':10,'folding-chair':10,'compare-view':10,'format-check':10,'priority':17}}
  for id,last in limits[self.ep].items():
   if id in self.lib:self.lib[id]['exit']=self.end(last);self.groups[id]=(self.groups[id][0],last)
  if self.ep=='01':
   self.lib['ai']['box']=[800,480,110,110]
  titles={'01':'AI bịa mà rất tự tin.'}
  scenes=[]
  for b in range(1,21):
   label=self.labels.get(b,'Minh họa' if b==1 else '')
   items=[{'id':f'label-{b}','text':label,'plain':True,'x':150,'y':255,'width':760,'cue':self.start(b)}] if label else []
   scenes.append({'id':f's{b:02}','start':self.start(b),'end':self.end(b),'theme':'light','title':[],'template':{'id':'freehand','version':'1.0.0','items':items,'drawings':[{'ref':id} for id,(first,last) in self.groups.items() if first<=b<=last]}})
  p={'id':'example-bridge','keyword':'AI bịa','title':titles[self.ep],'category':'ai-qua-net-ve','stylePreset':'net-cinematic-v1','rendererVersion':'1.0.0','palette':'technology','format':{'width':1080,'height':1920,'fps':30},'layout':'drawing-first','drawingCoordinateLayout':'drawing-first','captionMode':'sidecar','coverFrame':1050,'styleReviewStatus':'approved','approved':True,'audioMaster':'master.wav','drawingLibrary':self.lib,'scenes':scenes}
  (self.base/'project.json').write_text(json.dumps(p,ensure_ascii=False,indent=2));print(self.ep,len(self.lib),'drawings',self.t['targetSeconds'],'seconds')
def episode1(f):
 box=f.bridge('opening-',1,6);f.add('walker','person',[200,605,100,200],2,0,2,last=6);f.add('ai','robot',[760,330,140,140],2,1,2,color='teal',last=6)
 for j,shape in enumerate(['clock','people','door']):f.add('info'+str(j),shape,[240+j*210,355,125,125],3,j,3,last=6)
 f.add('trust','check',[650,510,140,100],4,color='gold',last=6);f.move('trust',4,'scale',1,.65)
 f.add('lookdown','M 50 2 L 50 90 M 25 64 L 50 92 L 75 64',[470,835,90,180],5,color='gold',last=6)
 f.supports('supports',box,6,6)
 # Source and summary remain visible across the complete checking action.
 f.add('source','blank',[150,410,330,670],7,0,2,last=15);f.add('src-clock','clock',[227,560,170,170],7,1,2,color='teal',last=15);f.label(7,'Nguồn gốc')
 f.add('summary','blank',[590,410,330,670],8,0,2,last=15);f.add('sum-clock','clock',[666,560,170,170],8,1,2,color='teal',last=15);f.label(8,'9 giờ')
 f.add('room302','door',[676,835,150,195],9,last=13);f.label(9,'Phòng 302')
 f.add('checking','lens',[657,795,175,195],10,last=15,color='gold');f.move('checking',10,'x',0,-425);f.label(10,'Có trong nguồn?')
 f.add('unsupported','M 0 10 Q 45 80 97 12 M 77 2 L 98 12 L 86 29',[327,1085,420,100],11,last=15,color='gold')
 f.add('stop','person',[468,700,100,205],12,last=15);f.circle('stop-mark',[478,740,85,85],12)
 f.add('source-time-link','M 0 50 L 100 50 M 85 35 L 100 50 L 85 65',[407,580,220,80],13,0,2,last=15,color='teal')
 f.add('source-group','people',[244,760,160,135],13,1,2,last=15,color='teal')
 f.add('unknown-place','question',[694,858,80,115],14,last=15,color='gold');f.add('source-unknown','question',[267,919,80,110],14,1,2,last=15,color='gold');f.label(14,'Chưa xác định')
 f.add('checked','check',[704,748,100,80],15,0,2,last=15,color='teal');f.circle('open-question',[664,823,142,178],15,part=1,total=2,last=15)
 box=f.bridge('quiz-',16,18,True);f.supports('quiz-supports',box,16,18)
 f.add('quiz-clock','clock',[195,730,230,230],17,0,2,last=18,color='teal');f.add('quiz-duration','clock',[650,730,230,230],17,1,2,last=18);f.label(17,'30 phút?')
 f.circle('quiz-answer',[625,705,280,280],18,part=0,total=2,last=18);f.add('quiz-question','question',[730,1010,65,95],18,1,2,last=18,color='gold');f.label(18,'Chưa có căn cứ')
 box=f.bridge('final-',19);f.add('final-source','page',[680,1180,135,190],19,1,2,color='teal')
 f.supports('final-supports',box,20);f.add('final-question','question',[505,935,70,115],20,1,2,color='gold');f.label(20,'Tìm đúng căn cứ')

if __name__=='__main__':
 import shutil
 base=root/'sys/work/example-bridge'
 if sys.argv[1:] == ['init']:
  base.mkdir(parents=True,exist_ok=True)
  for name in ['narration.json','storyboard.json','sources.md']:
   if not (base/name).exists():shutil.copyfile(Path(__file__).parent/name,base/name)
  print(base)
 elif sys.argv[1:] == ['visuals']:
  f=Film('01');episode1(f);f.save()
 else:raise SystemExit('Usage: build.py init|visuals')
