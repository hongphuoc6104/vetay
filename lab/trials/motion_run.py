"""Automated Motion Canvas export through its Renderer API; FFmpeg muxes shared audio."""
import os,json,shutil,subprocess,time,sys
from pathlib import Path
from run import HERE,CACHE,OUT,prepare,dump,A
name=sys.argv[1] if len(sys.argv)>1 else 'benchmark';scale=float(sys.argv[2]) if len(sys.argv)>2 else .5
r=CACHE/'runtimes/motion-canvas';folder=OUT/('motion-'+name);folder.mkdir(parents=True,exist_ok=True)
A.budget(700_000_000)
if name=='benchmark':
 prepare('benchmark');shutil.copy2(OUT/'benchmark/prepared.json',r/'benchmark.json');shutil.copytree(CACHE/'runtimes/remotion/public/trials/benchmark',r/'public/trials/benchmark',dirs_exist_ok=True)
for p in (HERE/'motion').iterdir():shutil.copy2(p,r/p.name)
# Minimal stable Vite entry, no modifications to cached upstream sources.
(r/'vite.config.js').write_text("import {defineConfig} from 'vite';import mc from '@motion-canvas/vite-plugin';export default defineConfig({plugins:[(mc.default||mc)({project:['./project.ts','./reveal-project.ts']})]});")
meta={'version':0,'shared':{'size':{'x':1080,'y':1920}},'rendering':{'fps':30,'resolutionScale':scale}}
for f in ['project.meta','reveal-project.meta']:dump(r/f,meta)
serverlog=(folder/'server.log').open('w');server=subprocess.Popen(['npm','run','dev','--','--port','4319','--strictPort'],cwd=r,stdout=serverlog,stderr=subprocess.STDOUT)
try:
 import urllib.request
 for i in range(100):
  if server.poll() is not None:raise RuntimeError('Vite failed; see server.log')
  try:urllib.request.urlopen('http://127.0.0.1:4319/driver.html',timeout=1);break
  except Exception:time.sleep(.2)
 start=time.monotonic();env=os.environ.copy();env['PLAYWRIGHT_PATH']=str(HERE.parents[2]/'vetay/sys/engine/node_modules/playwright')
 with (folder/'render.log').open('w') as log:subprocess.run(['/usr/bin/time','-f','%M','-o',str(folder/'rss.txt'),'node','capture.cjs',name,str(scale)],cwd=r,env=env,stdout=log,stderr=subprocess.STDOUT,check=True,timeout=900)
 duration=15 if name=='benchmark' else 10;target=folder/('preview.mp4' if scale<1 else 'final.mp4')
 frames=r/'output'/name
 cmd=['ffmpeg','-v','error','-y','-framerate','30','-i',str(frames/'%06d.png')]
 if name=='benchmark':
  spec=json.loads((OUT/'benchmark/prepared.json').read_text());parts=[]
  for i,s in enumerate(spec['scenes']):
   wav=folder/f'part{i}.wav';subprocess.run(['ffmpeg','-v','error','-y','-i',str(r/'public'/s['audio']),'-af','apad','-t',str(s['frames']/30),'-ar','48000',str(wav)],check=True);parts.append(wav)
  (folder/'audio-list.txt').write_text(''.join("file '"+str(p)+"'\n" for p in parts));audio=folder/'narration.wav';subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(folder/'audio-list.txt'),'-c:a','pcm_s16le',str(audio)],check=True);cmd+=['-i',str(audio),'-c:a','aac']
 cmd+=['-t',str(duration),'-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p',str(target)];subprocess.run(cmd,check=True)
 dump(folder/'metrics.json',{'elapsed_seconds':time.monotonic()-start,'scale':scale,'duration_seconds':duration,'frames_exported':len(list(frames.glob('*.png'))),'peak_rss_kib':int((folder/'rss.txt').read_text().strip()),'peak_rss_note':'maximum child RSS, excludes Vite server; not total process-tree memory','bytes':target.stat().st_size,'status':'rendered'})
 print(target)
finally:
 server.terminate();server.wait(timeout=10);serverlog.close()
A.budget()
