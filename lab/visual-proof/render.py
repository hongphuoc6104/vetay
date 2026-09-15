import sys,time,json,shutil,subprocess,urllib.request,os,signal
from pathlib import Path
HERE=Path(__file__).resolve().parent;BASE=HERE.parents[2];CACHE=BASE/'video-lab-cache';R=CACHE/'runtimes/motion-canvas';OUT=CACHE/'trials/visual-proof'
sys.path.insert(0,str(HERE.parent))
import assets
assets.budget(700_000_000)
name=sys.argv[1];scale=float(sys.argv[2]) if len(sys.argv)>2 else .5
assert name in ['mirror','pump']
for p in HERE.glob('*.tsx'):shutil.copy2(p,R/p.name)
for p in HERE.glob('*-captions.json'):shutil.copy2(p,R/p.name)
# wrap scene to add synchronized captions using independent timeline
(R/'proof.tsx').write_text('''import {makeScene2D,Txt,Rect,Node} from '@motion-canvas/2d';
import {all,tween} from '@motion-canvas/core';
import original from './'''+name+'''';
import captions from './'''+name+'''-captions.json';
export default makeScene2D(function*(view){
 const layer=new Node({zIndex:100});view.add(layer);
 const box=new Rect({y:625,width:920,height:160,radius:22,fill:'#030913dd'});
 const text=new Txt({y:625,width:850,fontFamily:'DejaVu Sans',fontSize:42,lineHeight:56,fill:'#fff',textAlign:'center',textWrap:true});layer.add(box);layer.add(text);
 yield* all(original.config(view),tween(22,v=>{const c=captions.find(c=>v*22>=c.start&&v*22<c.end);text.text(c?.text||'');box.opacity(c?1:0);}));
});''')
(R/'proof-project.ts').write_text("import {makeProject} from '@motion-canvas/core';import scene from './proof?scene';export default makeProject({scenes:[scene]});")
(R/'proof-project.meta').write_text(json.dumps({'version':0,'shared':{'size':{'x':1080,'y':1920}},'rendering':{'fps':30,'resolutionScale':scale}}))
(R/'vite.config.js').write_text("import {defineConfig} from 'vite';import mc from '@motion-canvas/vite-plugin';export default defineConfig({plugins:[(mc.default||mc)({project:['./proof-project.ts']})]});")
(R/'driver.html').write_text('''<script type="module">import {Renderer,Vector2} from '@motion-canvas/core';import project from '/proof-project.ts?project';window.run=async(name,scale)=>{project.logger.onLogged.subscribe(x=>console.log(JSON.stringify(x)));const r=new Renderer(project);let result;r.onFinished.subscribe(x=>result=x);await r.render({name,range:[0,22],fps:30,size:new Vector2(1080,1920),resolutionScale:scale,colorSpace:'srgb',background:'#08121c',exporter:{name:'@motion-canvas/core/image-sequence',options:{fileType:'image/png',quality:100,groupByScene:false}}});if(result!==0)throw Error('render '+result);};</script>''')
OUT.mkdir(parents=True,exist_ok=True);log=(OUT/f'{name}-render.log').open('w');server=subprocess.Popen(['npm','run','dev','--','--port','4319','--strictPort'],cwd=R,stdout=log,stderr=log,start_new_session=True)
try:
 for i in range(100):
  try:urllib.request.urlopen('http://127.0.0.1:4319/driver.html');break
  except:time.sleep(.2)
 start=time.monotonic();env=os.environ.copy();env['PLAYWRIGHT_PATH']=str(BASE/'vetay/sys/engine/node_modules/playwright')
 subprocess.run(['node','capture.cjs',name,str(scale)],cwd=R,env=env,stdout=log,stderr=log,check=True,timeout=1200)
 target=OUT/(name+('-preview' if scale<1 else '')+'.mp4')
 subprocess.run(['ffmpeg','-v','error','-y','-framerate','30','-i',str(R/'output'/name/'%06d.png'),'-i',str(OUT/(name+'.wav')),'-t','22','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-movflags','+faststart',str(target)],check=True)
 (OUT/f'{name}-metrics.json').write_text(json.dumps({'seconds':time.monotonic()-start,'scale':scale,'bytes':target.stat().st_size}))
 print(target)
finally:
 os.killpg(server.pid,signal.SIGTERM);server.wait();log.close()
