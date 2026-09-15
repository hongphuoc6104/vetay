"""Portable two-stage Motion Canvas workflow. See README before authoring episodes."""
import struct
import argparse,contextlib,fcntl,hashlib,json,math,os,re,shutil,signal,subprocess,sys,tempfile,time,urllib.request,wave
from pathlib import Path
from channel_schema import validate_channel
from voice_config import resolve_voice, spoken_text, speech_key
HERE=Path(__file__).resolve().parent;REPO=HERE.parents[1]
CACHE=Path(os.environ.get('VIDEO_LAB_CACHE',REPO.parent/'video-lab-cache')).resolve()
RUNTIME=Path(os.environ.get('VIDEO_LAB_MC_RUNTIME',CACHE/'runtimes/motion-canvas')).resolve()
OUT=CACHE/'video-workflow';EPISODES=HERE/'episodes'
def dump(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2))
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def budget(extra=700_000_000):
 CACHE.mkdir(parents=True,exist_ok=True)
 size=sum(p.stat().st_size for p in CACHE.rglob('*') if p.is_file() and not p.is_symlink())
 if size+extra>30_000_000_000:raise ValueError('Cache budget 30 GB exceeded')
 if shutil.disk_usage(CACHE).free-extra<20_000_000_000:raise ValueError('Free disk reserve 20 GB unavailable')
@contextlib.contextmanager
def lock():
 OUT.mkdir(parents=True,exist_ok=True)
 with (OUT/'runtime.lock').open('w') as f:
  try:fcntl.flock(f,fcntl.LOCK_EX|fcntl.LOCK_NB)
  except BlockingIOError:raise ValueError('Another workflow render holds the runtime lock')
  yield

def config():
 return {'node':shutil.which('node'),'ffmpeg':shutil.which('ffmpeg'),'ffprobe':shutil.which('ffprobe'),'chrome':os.environ.get('VIDEO_LAB_CHROME',shutil.which('google-chrome') or ''),'voice_python':os.environ.get('VIDEO_LAB_VOICE_PYTHON',str(REPO.parent/'vetay/sys/.venv/bin/python')),'models':os.environ.get('VIDEO_LAB_MODELS',str(REPO.parent/'vetay/sys/models')),'playwright':os.environ.get('VIDEO_LAB_PLAYWRIGHT',str(REPO.parent/'vetay/sys/engine/node_modules/playwright'))}
def doctor():
 c=config();checks={k:bool(v and Path(v).exists()) for k,v in c.items()};checks['motion_canvas']=(RUNTIME/'node_modules/@motion-canvas/core/package.json').exists()
 return {'paths':c,'checks':checks,'cache':str(CACHE),'runtime':str(RUNTIME)}
def episode_folder(name):
 if re.fullmatch(r'[a-z0-9][a-z0-9-]*',name):return EPISODES/name
 folder=(REPO/name).resolve()
 if not folder.is_relative_to((REPO/'channels').resolve()) or folder.parent.name!='episodes':raise ValueError('Invalid episode path; use channels/<channel>/episodes/<id>')
 return folder

def destination(s):
 channel=s.get('_channel_id')
 return OUT/channel/s['id'] if channel else OUT/s['id']

def load(name):
 folder=episode_folder(name);s=json.loads((folder/'episode.json').read_text())
 if s['id']!=folder.name or not re.fullmatch(r'[a-z0-9][a-z0-9-]*',s['id']):raise ValueError('Episode id differs from folder')
 if folder.is_relative_to(REPO/'channels'):
  channel_root=folder.parent.parent
  cfg=json.loads((channel_root/'channel.json').read_text())
  s['_channel_id']=channel_root.name
  if cfg['id']!=channel_root.name:raise ValueError('Channel identity mismatch')
  if s.get('channel',{}).get('kind')!=channel_root.name:raise ValueError('Episode channel mismatch')
  s['voice']=dict(cfg.get('voice',{}),**s.get('voice',{}))
 resolve_voice(s)

 for k in ['title','audience','language','domain','duration','width','height','fps','scenes','assets','sources','status']:
  if k not in s:raise ValueError('Missing '+k)
 if s['domain'] not in ['story','science']:raise ValueError('Invalid domain')
 if not (1<=s['duration']<=600) or s['fps']!=30 or s['width']%2 or s['height']%2:raise ValueError('Invalid output dimensions/duration/fps')
 ids=[x['id'] for x in s['scenes']]
 if not ids or len(ids)!=len(set(ids)):raise ValueError('Missing or duplicate scene IDs')
 for x in s['scenes']:
  if not all(x.get(k) for k in ['id','action','camera']) or not isinstance(x.get('text'),str) or x['seconds']<=0:raise ValueError('Incomplete scene')
 for x in s['scenes']:
  for key in ['pause_before','pause_after']:
   if not isinstance(x.get(key,0),(int,float)) or not 0<=x.get(key,0)<=3:raise ValueError('Invalid narration pause')
  spoken_text(x,resolve_voice(s))
 if abs(sum(x['seconds'] for x in s['scenes'])-s['duration'])>.01:raise ValueError('Scene durations must sum to episode duration')
 for f in ['scene.tsx','script.md','design.md','checks.md','handoff.md']:
  if not (folder/f).is_file():raise ValueError('Missing '+f)
 for a in s['assets']:
  p=(folder/a['path']).resolve()
  if not p.is_relative_to(folder.resolve()) or not p.is_file():raise ValueError('Missing/unsafe asset '+a['path'])
  if not a.get('source') or not a.get('license'):raise ValueError('Asset attribution missing')
 if s['domain']=='science' and (not s['sources'] or any(not x.get('url') or not x.get('claim') for x in s['sources'])):raise ValueError('Science claim sources required')
 for effect in s.get('effects',[]):
  if effect.get('scene') not in ids or effect.get('duration',.15)<=0 or effect.get('offset',0)<0:raise ValueError('Invalid sound effect cue')
 validate_channel(s)
 return folder,s

def fingerprint(folder):
 files=[p for p in sorted(folder.rglob('*')) if p.is_file() and '__pycache__' not in str(p)]
 data=b''.join(p.relative_to(folder).as_posix().encode()+p.read_bytes() for p in files)
 if folder.parent.name=='episodes' and (folder.parent.parent/'channel.json').exists():data+=(folder.parent.parent/'channel.json').read_bytes()
 return hashlib.sha256(data).hexdigest()
def schedule(s,durations=None):
 minimum=[(math.ceil((durations[i]+x.get('pause_before',0)+max(.25,x.get('pause_after',0)))*s['fps'])/s['fps'] if durations else 0) for i,x in enumerate(s['scenes'])]
 if sum(minimum)>s['duration']:raise ValueError('Narration exceeds duration: revise script; audio will not be clipped or sped up')
 lengths=[max(x['seconds'],minimum[i]) for i,x in enumerate(s['scenes'])]
 excess=sum(lengths)-s['duration']
 if excess>0:
  slack=sum(lengths[i]-minimum[i] for i in range(len(lengths)))
  lengths=[n-excess*(n-minimum[i])/slack for i,n in enumerate(lengths)]
 # Frame-aligned boundaries, preserving exact total.
 ends=[];t=0
 for n in lengths:t+=n;ends.append(round(t*s['fps'])/s['fps'])
 rows=[];start=0
 for i,(x,end) in enumerate(zip(s['scenes'],ends)):
  rows.append(dict(x,start=start,end=end,duration=end-start));start=end
 return {'duration':s['duration'],'scenes':rows}

def speech(folder,s):
 c=config();audio=OUT/'audio';audio.mkdir(parents=True,exist_ok=True);rows=[];profile=resolve_voice(s)
 for x in s['scenes']:
  text=spoken_text(x,profile)
  if not text.strip() and not x.get('audio'):
   p=audio/'silence.wav'
   if not p.exists():
    with wave.open(str(p),'wb') as f:f.setparams((1,2,48000,0,'NONE','none'));f.writeframes(bytes(9600))
   rows.append({'path':str(p),'duration':0.1,'sha256':digest(p)});continue
  if x.get('audio'):
   p=(folder/x['audio']).resolve()
   if not p.is_file():raise ValueError('Imported WAV missing')
  else:
   key=speech_key(text,profile,digest(HERE/'voice.py'));p=audio/(key+'.wav')
   if not p.exists():
    spec=audio/(key+'.json');dump(spec,{'text':text,'output':str(p),'voice':profile})
    env=os.environ.copy();env.update(HF_HOME=c['models'],HF_HUB_OFFLINE='1',OMP_NUM_THREADS='2',OPENBLAS_NUM_THREADS='2')
    subprocess.run([c['voice_python'],str(HERE/'voice.py'),str(spec)],env=env,check=True,timeout=240)
  try:
   with wave.open(str(p)) as w:
    duration=w.getnframes()/w.getframerate();width=w.getsampwidth();data=w.readframes(w.getnframes())
    if width!=2:raise ValueError('Use 16-bit PCM WAV')
    values=struct.unpack('<'+'h'*(len(data)//2),data)
    if not values or max(abs(v) for v in values)<32:raise ValueError('Narration is silent')
  except Exception as e:raise ValueError('Invalid PCM WAV '+str(p)) from e
  if duration<=.1:raise ValueError('Empty narration')
  rows.append({'path':str(p),'duration':duration,'sha256':digest(p)})
 return rows

def captions(timeline,audio):
 rows=[]
 for i,s in enumerate(timeline['scenes']):
  words=s['text'].split();chunks=[' '.join(words[j:j+8]) for j in range(0,len(words),8)];duration=audio[i]['duration']
  weights=[len(x) for x in chunks];start=s['start']+s.get('pause_before',0)
  for txt,n in zip(chunks,weights):
   end=start+duration*n/sum(weights);rows.append({'start':start,'end':end,'text':txt});start=end
 return rows

def probe(p,s):
 data=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]));v=next(x for x in data['streams'] if x['codec_type']=='video')
 assert v['width']==s['width'] and v['height']==s['height'] and v['r_frame_rate']==f"{s['fps']}/1"
 assert abs(float(data['format']['duration'])-s['duration'])<.1
 assert int(v['nb_frames'])==round(s['duration']*s['fps'])
 assert any(x['codec_type']=='audio' for x in data['streams'])
 subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True,timeout=180)
 return {'decode':'pass','duration':s['duration'],'width':v['width'],'height':v['height'],'frames':v['nb_frames'],'sha256':digest(p),'full_speed_review':False,'auditory_review':False}

def render(folder,s,timeline,caps,scale,audio=None):
 budget();c=config();rendername=s['id']+'-'+str(time.time_ns());dest=destination(s);dest.mkdir(parents=True,exist_ok=True)
 if not (RUNTIME/'node_modules/@motion-canvas/core').exists():raise ValueError('Missing Motion Canvas runtime; run doctor and follow README restore instructions')
 if (RUNTIME/'episode').exists():shutil.rmtree(RUNTIME/'episode')
 shutil.copytree(folder,RUNTIME/'episode')
 dump(RUNTIME/'timeline.json',timeline);dump(RUNTIME/'captions.json',caps)
 (RUNTIME/'workflow.tsx').write_text("""import {makeScene2D,Node,Rect,Txt} from '@motion-canvas/2d';import {all,tween} from '@motion-canvas/core';import scene from './episode/scene';import timeline from './timeline.json';import captions from './captions.json';export default makeScene2D(function*(view){const layer=new Node({zIndex:100});view.add(layer);const box=new Rect({y:"""+str(s['height']/2-335)+""",width:"""+str(s['width']-160)+""",height:156,radius:20,fill:'#041019dd'});const txt=new Txt({y:"""+str(s['height']/2-335)+""",width:"""+str(s['width']-220)+""",fontFamily:'DejaVu Sans',fontSize:42,lineHeight:56,fill:'#fff',textAlign:'center',textWrap:true});layer.add(box);layer.add(txt);yield* all(scene(view,timeline),tween(timeline.duration,p=>{const c=captions.find(c=>p*timeline.duration>=c.start&&p*timeline.duration<c.end);txt.text(c?.text||'');box.opacity(c?1:0);}));});""")
 (RUNTIME/'workflow-project.ts').write_text("import {makeProject} from '@motion-canvas/core';import scene from './workflow?scene';export default makeProject({scenes:[scene]});")
 dump(RUNTIME/'workflow-project.meta',{'version':0,'shared':{'size':{'x':s['width'],'y':s['height']}},'rendering':{'fps':s['fps'],'resolutionScale':scale}})
 (RUNTIME/'vite.config.js').write_text("import {defineConfig} from 'vite';import mc from '@motion-canvas/vite-plugin';export default defineConfig({plugins:[(mc.default||mc)({project:['./workflow-project.ts']})]});")
 shutil.copy2(HERE/'capture.cjs',RUNTIME/'workflow-capture.cjs')
 (RUNTIME/'driver.html').write_text("""<script type="module">import {Renderer,Vector2} from '@motion-canvas/core';import project from '/workflow-project.ts?project';window.run=async(c)=>{project.logger.onLogged.subscribe(x=>console.log(JSON.stringify(x)));const r=new Renderer(project);let result;r.onFinished.subscribe(x=>result=x);await r.render({name:c.id,range:[0,c.duration],fps:c.fps,size:new Vector2(c.width,c.height),resolutionScale:c.scale,colorSpace:'srgb',background:'#08121c',exporter:{name:'@motion-canvas/core/image-sequence',options:{fileType:'image/png',quality:100,groupByScene:false}}});if(result!==0)throw Error('Render failed '+result);};</script>""")
 log=(dest/'render.log').open('w');server=subprocess.Popen(['npm','run','dev','--','--port','4319','--strictPort'],cwd=RUNTIME,stdout=log,stderr=log,start_new_session=True)
 child=None;started=time.monotonic()
 try:
  for _ in range(100):
   if server.poll() is not None:raise ValueError('Vite failed; port busy or dependencies missing')
   try:urllib.request.urlopen('http://127.0.0.1:4319/driver.html',timeout=1);break
   except Exception:time.sleep(.2)
  env=os.environ.copy();env.update(PLAYWRIGHT_PATH=c['playwright'],CHROME_PATH=c['chrome'])
  child=subprocess.Popen([c['node'],'workflow-capture.cjs',json.dumps(dict(s,scale=scale,id=rendername))],cwd=RUNTIME,env=env,stdout=log,stderr=log,start_new_session=True)
  if child.wait(timeout=1200):raise ValueError('Scene render failed; inspect render.log')
  wav=dest/'mix.wav'
  if audio:
   inputs=[];filters=[]
   for i,(a,scene) in enumerate(zip(audio,timeline['scenes'])):inputs+=['-i',a['path']];filters.append(f'[{i}:a]adelay={round((scene["start"]+scene.get("pause_before",0))*1000)}:all=1[a{i}]')
   mixlabels=''.join(f'[a{i}]' for i in range(len(audio)));count=len(audio)
   if s.get('effects'):
    sr=48000;samples=[0.0]*round(s['duration']*sr)
    for effect in s['effects']:
     anchor=next(x['start'] for x in timeline['scenes'] if x['id']==effect['scene']);start=round((anchor+effect.get('offset',0))*sr)
     for k in range(round(effect.get('duration',.15)*sr)):
      index=start+k
      if 0<=index<len(samples):samples[index]+=min(.08,effect.get('gain',.04))*math.sin(2*math.pi*effect.get('frequency',600)*k/sr)*math.exp(-k/sr*20)
    fx=dest/'effects.wav'
    with wave.open(str(fx),'wb') as f:f.setparams((1,2,sr,0,'NONE','none'));f.writeframes(struct.pack('<'+'h'*len(samples),*[round(max(-.2,min(.2,x))*32767) for x in samples]))
    inputs+=['-i',str(fx)];mixlabels+=f'[{count}:a]';count+=1
   filters.append(mixlabels+f'amix=inputs={count}:normalize=0,alimiter=limit=0.9,apad[out]')
   subprocess.run(['ffmpeg','-v','error','-y',*inputs,'-filter_complex',';'.join(filters),'-map','[out]','-t',str(s['duration']),str(wav)],check=True)
  else:subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','anullsrc=r=48000:cl=mono','-t',str(s['duration']),str(wav)],check=True)
  candidate=dest/'candidate.mp4';target=dest/('final.mp4' if scale==1 and audio else 'preview.mp4' if audio else 'rough.mp4')
  subprocess.run(['ffmpeg','-v','error','-y','-framerate',str(s['fps']),'-i',str(RUNTIME/'output'/rendername/'%06d.png'),'-i',str(wav),'-t',str(s['duration']),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-movflags','+faststart',str(candidate)],check=True)
  report=probe(candidate,dict(s,width=round(s['width']*scale),height=round(s['height']*scale)));report.update(render_seconds=time.monotonic()-started,input_digest=fingerprint(folder));candidate.replace(target);dump(dest/(target.stem+'-report.json'),report)
  for label,t in [('opening',.5),('key',s['duration']/2),('ending',s['duration']-1)]:subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(target),'-frames:v','1',str(dest/(label+'.png'))],check=True)
  print(target,flush=True);return target
 finally:
  for p in [child,server]:
   if p:
    try:os.killpg(p.pid,signal.SIGTERM)
    except ProcessLookupError:pass
    try:p.wait(timeout=5)
    except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);p.wait()
  log.close()

def main():
 ap=argparse.ArgumentParser();ap.add_argument('command',choices=['doctor','init','validate','rough','ready','produce','check','voice']);ap.add_argument('episode',nargs='?');ap.add_argument('--scale',type=float,default=1,choices=[.5,1]);args=ap.parse_args()
 if args.command=='doctor':print(json.dumps(doctor(),indent=2));return
 if args.command=='init':
  if not args.episode:raise ValueError('Episode required')
  folder=episode_folder(args.episode);folder.mkdir(parents=True,exist_ok=False)
  dump(folder/'episode.json',{'id':folder.name,'title':'','domain':'story','language':'vi','audience':'15+ phổ thông','duration':30,'width':1080,'height':1920,'fps':30,'status':'draft','scenes':[],'assets':[],'sources':[]})
  for f in ['script.md','design.md','checks.md','handoff.md']:(folder/f).write_text('Draft — agent must complete before validation.\n')
  return
 folder,s=load(args.episode);dest=destination(s)
 if args.command=='validate':print('Package valid; readiness is checked separately');return
 if args.command=='check':print(json.dumps(probe(dest/'final.mp4',s),indent=2));return
 if args.command=='ready':
  channel=s.get('channel',{})
  if any(c.get('status')!='supported' for c in channel.get('claims',[])):raise ValueError('Editorial claims unresolved; return to preparation')
  if any(c.get('status')!='pass' for c in channel.get('continuity_checks',[])):raise ValueError('Continuity checks pending or failed')
  report=json.loads((dest/'rough-report.json').read_text())
  if report['input_digest']!=fingerprint(folder):raise ValueError('Rough render stale; render it again')
  dump(dest/'ready.json',{'input_digest':fingerprint(folder),'note':'Technical preparation complete; see episode handoff for visual review'});return
 with lock():
  if args.command=='voice':
   budget();dest.mkdir(parents=True,exist_ok=True);dump(dest/'audio.json',speech(folder,s));print(dest/'audio.json');return
  if args.command=='rough':render(folder,s,schedule(s),[],.5);return
  ready=json.loads((dest/'ready.json').read_text())
  if ready['input_digest']!=fingerprint(folder):raise ValueError('Preparation changed; rerun rough and ready')
  audio=speech(folder,s);timeline=schedule(s,[a['duration'] for a in audio]);caps=captions(timeline,audio)
  dump(dest/'timeline.json',timeline);dump(dest/'audio.json',audio);dump(dest/'captions.json',caps)
  def stamp(t):ms=round(t*1000);return f'{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}'
  (dest/'subtitles.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}' for i,c in enumerate(caps)))
  render(folder,s,timeline,caps,args.scale,audio)
  (dest/'index.html').write_text('<meta charset="utf-8"><title>Video</title><video controls style="height:90vh" src="final.mp4" poster="key.png"></video><p><a href="subtitles.srt">SRT</a></p>')
if __name__=='__main__':
 try:main()
 except Exception as e:print(f'Workflow failed: {e}',file=sys.stderr);sys.exit(1)
