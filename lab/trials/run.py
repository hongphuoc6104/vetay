#!/usr/bin/env python3
import argparse,hashlib,json,os,shutil,subprocess,sys,time,math,re
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];sys.path.insert(0,str(ROOT/'lab'))
import assets as A
CACHE=A.CACHE;OUT=CACHE/'trials';RUNTIME=CACHE/'runtimes/remotion';ORIGINAL=ROOT.parent/'vetay'
def dump(p,obj):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2))
def resolve_asset(asset):
 p=(CACHE/asset['path']).resolve()
 if not p.is_relative_to(CACHE.resolve()) or not p.is_file():raise ValueError('Missing/unsafe asset: '+str(p))
 return p
def validate(spec,reg):
 if not spec.get('scenes'):raise ValueError('Empty episode')
 if spec.get('style') not in ['vector','sketch','kenney','quickdraw']:raise ValueError('Unknown style')
 if len({s['id'] for s in spec['scenes']})!=len(spec['scenes']):raise ValueError('Duplicate scene')
 for s in spec['scenes']:
  if not s.get('text'):raise ValueError('Empty narration')
  if not s.get('id','').replace('-','').replace('_','').isalnum():raise ValueError('Unsafe scene ID')
  if 'fixedSeconds' in s and (not isinstance(s['fixedSeconds'],(float,int)) or not math.isfinite(s['fixedSeconds']) or s['fixedSeconds']<=0):raise ValueError('Invalid fixed duration')
  if s.get('drawing'):
   candidate=(CACHE/'assets/quickdraw'/f"{s['drawing']}.ndjson").resolve()
   if not candidate.is_relative_to((CACHE/'assets/quickdraw').resolve()) or not candidate.exists():raise ValueError('Missing or unsafe drawing category')
   drawings=candidate.read_text().splitlines();index=s.get('sample',0)
   if not isinstance(index,int) or not 0<=index<len(drawings):raise ValueError('Drawing sample outside range')
  for k in ['actor','prop','external']:
   if s.get(k):resolve_asset(reg[s[k]])
 return spec

def prepare(id):
 start=time.monotonic();A.budget(200_000_000)
 
 for p in (HERE/'props').glob('*.svg'):
  dst=OUT/'props'/p.name;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dst)
 spec_path=HERE/'episodes'/f'{id}.json';spec=json.loads(spec_path.read_text());reg=json.loads((HERE/'registry.json').read_text())
 # Restore the explicitly licensed fixture for the external-import experiment.
 if id=='external-import' and 'import-background' in reg:
  fixture=CACHE/'assets/kenney/rpg-urban-pack/Sample.png';destination=CACHE/reg['import-background']['path']
  if not destination.exists() and fixture.exists():destination.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(fixture,destination)
 validate(spec,reg)
 folder=OUT/id;folder.mkdir(parents=True,exist_ok=True)
 env=os.environ.copy();env['HF_HOME']=str(ORIGINAL/'sys/models');env['HF_HUB_OFFLINE']='1';env['OMP_NUM_THREADS']='2';env['OPENBLAS_NUM_THREADS']='2'
 python=ORIGINAL/'sys/.venv/bin/python'
 if all(s.get('audio') for s in spec['scenes']):
  rows=[]
  for s in spec['scenes']:
   p=Path(s['audio']).resolve();v=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(p)],text=True);rows.append({'path':str(p),'seconds':float(v)})
 else:
  if not python.exists():raise RuntimeError('Local TTS unavailable; supply scene.audio WAV')
  subprocess.run([str(python),str(HERE/'tts.py'),str(spec_path),str(OUT/'audio')],env=env,check=True)
  rows=json.loads((OUT/'audio'/f'{id}.json').read_text())
 public=RUNTIME/'public/trials'/id;public.mkdir(parents=True,exist_ok=True)
 scenes=[];offset=0;captions=[]
 for scene,a in zip(spec['scenes'],rows):
  s=dict(scene);s['frames']=math.ceil((a['seconds']+.6)*30)
  if 'fixedSeconds' in s:
   if a['seconds']>s['fixedSeconds']-.1:raise ValueError('Voice longer than fixed scene')
   s['frames']=round(s['fixedSeconds']*30)
  s['from']=offset;s['voiceFrames']=math.ceil(a['seconds']*30);dest=public/(s['id']+'.wav');shutil.copy2(a['path'],dest);s['audio']=f'trials/{id}/{dest.name}'
  for k in ['actor','prop','external']:
   if s.get(k):
    p=resolve_asset(reg[s[k]]);name=s[k]+p.suffix;shutil.copy2(p,public/name);s[k+'Src']=f'trials/{id}/{name}'
  if s.get('drawing'):
   p=CACHE/'assets/quickdraw'/f"{s['drawing']}.ndjson";s['strokes']=json.loads(p.read_text().splitlines()[s.get('sample',0)])['drawing']
  chunks=[]
  for sentence in re.findall(r'[^.!?]+[.!?]*',s['text']):
   words=sentence.split();count=math.ceil(len(words)/7)
   for n in range(count):chunks.append(' '.join(words[round(n*len(words)/count):round((n+1)*len(words)/count)]))
  total=sum(len(c) for c in chunks);t=0;s['captions']=[]
  for c in chunks:
   duration=a['seconds']*len(c)/total;s['captions'].append({'text':c,'start':t,'end':t+duration});captions.append((offset/30+t,offset/30+t+duration,c));t+=duration
  scenes.append(s);offset+=s['frames']
 spec.update(scenes=scenes,frames=offset,fps=30,width=1080,height=1920)
 dump(folder/'prepared.json',spec)
 def stamp(x):
  ms=round(x*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
 (folder/'subtitles.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(a)} --> {stamp(b)}\n{c}' for i,(a,b,c) in enumerate(captions)))
 used={s[k] for s in scenes for k in ['actor','prop','external'] if s.get(k)}
 dump(folder/'attribution.json',{k:reg[k] for k in used})
 dump(folder/'prepare-metrics.json',{'elapsed_seconds':time.monotonic()-start,'duration_seconds':offset/30,'subtitle_alignment':'estimated by text length; not forced alignment','manual_edit_minutes':None})
 A.budget();print(folder)
 return folder

def render(id,scale):
 folder=prepare(id);A.budget(500_000_000)
 for f in ['index.tsx','render.mjs']:shutil.copy2(HERE/f,RUNTIME/('trial-'+f))
 spec=folder/'prepared.json';digest=hashlib.sha256(spec.read_bytes()+ (HERE/'index.tsx').read_bytes()+(HERE/'render.mjs').read_bytes()+str(scale).encode())
 for p in sorted((RUNTIME/'public/trials'/id).iterdir()):digest.update(p.read_bytes())
 target=folder/('preview.mp4' if scale<1 else 'final.mp4');key=digest.hexdigest();marker=target.with_suffix('.sha256')
 if target.exists() and marker.exists() and marker.read_text()==key:print('CACHED',target);return
 start=time.monotonic();log=folder/(target.stem+'-render.log');rss=folder/(target.stem+'-rss.txt')
 env=os.environ.copy();env['TMPDIR']=str(CACHE/'tmp')
 with log.open('w') as f:
  result=subprocess.Popen(['/usr/bin/time','-f','%M','-o',str(rss),'node','trial-render.mjs',str(spec),str(target),str(scale)],cwd=RUNTIME,env=env,stdout=f,stderr=subprocess.STDOUT)
  tree_peak=0
  while result.poll() is None:
   entries=[]
   for row in subprocess.check_output(['ps','-eo','pid=,ppid=,rss='],text=True).splitlines():
    try:entries.append(tuple(map(int,row.split())))
    except ValueError:pass
   descendants={result.pid}
   for _ in range(12):
    grown=descendants|{pid for pid,ppid,_ in entries if ppid in descendants}
    if grown==descendants:break
    descendants=grown
   tree_peak=max(tree_peak,sum(mem for pid,_,mem in entries if pid in descendants));time.sleep(.5)
 metrics={'elapsed_seconds':time.monotonic()-start,'peak_process_tree_rss_kib':tree_peak,'tree_rss_note':'sampled every 0.5s; shared pages may be counted multiple times','exit_code':result.returncode,'scale':scale,'peak_rss_kib':int(rss.read_text().strip().splitlines()[-1]),'peak_rss_note':'time maximum child RSS; not aggregate simultaneous process memory','bytes':target.stat().st_size if target.exists() else 0}
 dump(folder/(target.stem+'-metrics.json'),metrics)
 if result.returncode:raise RuntimeError(log.read_text()[-4000:])
 marker.write_text(key);A.budget();print(target,metrics,flush=True)
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('mode',choices=['prepare','render','import-image']);p.add_argument('id');p.add_argument('image',nargs='?');p.add_argument('--scale',type=float,default=1);p.add_argument('--source');p.add_argument('--license');a=p.parse_args()
 if not a.id.replace('-','').isalnum():p.error('ID: alphanumeric and hyphens only')
 if a.mode=='prepare':prepare(a.id)
 elif a.mode=='render':
  if a.scale not in [.5,1]:p.error('Supported scale: 0.5 preview or 1 final')
  render(a.id,a.scale)
 else:
  if not a.image or not a.source or not a.license:p.error('image/source/license required')
  src=Path(a.image).resolve()
  if src.suffix.lower() not in ['.png','.jpg','.jpeg','.webp']:p.error('Use raster image')
  A.budget(src.stat().st_size);dst=OUT/'imports'/(a.id+src.suffix.lower());dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
  reg=json.loads((HERE/'registry.json').read_text());reg[a.id]={'path':str(dst.relative_to(CACHE)),'source':a.source,'license':a.license,'style':'external','sha256':hashlib.sha256(dst.read_bytes()).hexdigest()};dump(HERE/'registry.json',reg);print(dst)
