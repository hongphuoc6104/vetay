#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {catalog,compileTemplates} from './visual/templates/registry.mjs';
import {cacheCommand} from './visual/cache.mjs';
import {validateProject} from './visual/model.mjs';
import {brandedRender,bodyRange,readyOutro,config as identityConfig} from './identity.mjs';
import {neutralProject} from './examples/neutral.mjs';

const root=path.resolve(import.meta.dirname,'../..');
const args=process.argv.slice(2),cmd=(args.shift()||'help').replace(/^\//,'');
const get=(k,d)=>args.includes(k)?args[args.indexOf(k)+1]:d;
const slug=get('--slug','');
if(args.includes('--layout')&&get('--layout')!=='drawing-first')throw Error('This branch produces drawing-first only.');
if(!slug&&!['help','setup','doctor','templates','cache'].includes(cmd))throw Error('Provide --slug NAME.');
if(slug&&!/^[a-z0-9][a-z0-9-]*$/.test(slug))throw Error('Use a lowercase slug with digits or hyphens.');
const work=path.join(root,'sys/work',slug),manifest=path.join(work,'project.json');
const exists=async p=>{try{await fs.access(p);return true;}catch{return false;}};
function run(binary,argv,options={}){const p=spawnSync(binary,argv,{cwd:root,stdio:'inherit',...options});if(p.error)throw p.error;if(p.status!==0)throw Error(`${binary} failed (${p.status})`);}
async function read(){if(!await exists(manifest))throw Error('No project manifest: '+manifest);return JSON.parse(await fs.readFile(manifest,'utf8'));}
async function doctor(){
 const checks={};for(const bin of ['node','npm','uv','ffmpeg','ffprobe']){const result=spawnSync(bin,[bin.startsWith('ff')?'-version':'--version'],{stdio:'ignore'});checks[bin]=!result.error&&result.status===0;}
 checks.chrome=spawnSync(process.env.CHROME_PATH||'/usr/bin/google-chrome',['--version'],{stdio:'ignore'}).status===0;checks.engine=await exists(path.join(root,'sys/engine/node_modules/@motion-canvas/core/package.json'));
 checks.font=await exists(path.join(root,'sys/engine/node_modules/@fontsource/be-vietnam-pro/files/be-vietnam-pro-vietnamese-400-normal.woff2'));
 checks.encoder=spawnSync('ffmpeg',['-hide_banner','-encoders'],{encoding:'utf8'}).stdout?.includes('libx264')||false;
 checks.adam=spawnSync(path.join(root,'sys/.venv/bin/python'),['sys/engine/prepare-models.py','--check'],{cwd:root,stdio:'inherit'}).status===0;
 console.log(JSON.stringify(checks,null,2));return Object.values(checks).every(Boolean);
}
async function render(preview=false){
 const p=await read();if(!p.approved)throw Error('Finish the authored storyboard and mark approved:true before production; the topic request authorizes creation.');
 if(!preview&&p.layout==='drawing-first'&&p.styleReviewStatus!=='approved')throw Error('Review the drawing-first candidate preview before full production; then record styleReviewStatus: approved.');
 const script=path.join(root,'sys/engine/visual/render.mjs');
 if(p.stylePreset!=='net-cinematic-v1')throw Error('Migrate the project to net-cinematic-v1 before rendering.');
 const speech=path.join(work,'speech.json'),timeline=path.join(work,'timeline.json');
 if(!await exists(speech))throw Error('Author speech.json with measured phrase WAVs before rendering.');
 run('python3',['sys/engine/timing.py',speech,'--output',timeline]);
 run(path.join(root,'sys/.venv/bin/python'),['sys/engine/assemble.py',speech,timeline,'--output',path.join(work,p.audioMaster||'master.wav')]);
 const output=path.join(root,'video',p.category||'huong-dan',slug);
 if(!/^[a-z0-9-]+$/.test(p.category||'huong-dan'))throw Error('Invalid category');
 await fs.mkdir(output,{recursive:true});
 if(p.layout!=='drawing-first'||p.captionMode!=='sidecar')throw Error('Use drawing-first with sidecar captions on this branch.');
 const measured=JSON.parse(await fs.readFile(timeline,'utf8'));
 await brandedRender({p,manifest,timeline,output,work,preview,start:Number(get('--start','0')),end:Number(get('--end','28')),transport:get('--transport','binary-pipe')});

}
switch(cmd){
 case 'voice':run(path.join(root,'sys/.venv/bin/python'),['sys/engine/voice.py',path.join(work,'narration.json')]);break;
 case 'templates':console.log(JSON.stringify(catalog,null,2));break;
 case 'cache':await cacheCommand(root,args);break;
 case 'validate':{const p=compileTemplates(await read());const timeline=JSON.parse(await fs.readFile(path.join(work,'timeline.json'),'utf8'));const brand=JSON.parse(await fs.readFile(path.join(root,'sys/templates/brand/themes.json'),'utf8'));validateProject(p,timeline,brand);console.log('Project valid; preview still required for visual review.');break;}
 case 'preview-template':await render(true);break;
 case 'setup':{
  for(const dir of ['sys/cache','sys/logs','sys/models','sys/work','video'])await fs.mkdir(path.join(root,dir),{recursive:true});
  if(!await exists(path.join(root,'sys/.venv/bin/python')))run('uv',['venv','--python','3.12','sys/.venv']);
  run('uv',['pip','install','--python','sys/.venv','-r','sys/engine/requirements.txt']);
  if(!await exists(path.join(root,'sys/engine/node_modules/@motion-canvas/core/package.json')))run('npm',['ci','--prefix','sys/engine','--cache','sys/cache/npm']);
  run(path.join(root,'sys/.venv/bin/python'),['sys/engine/prepare-models.py']);
  if(!await doctor())process.exitCode=1;
  console.log('Initial skill is local at sys/skill/cinematic-tutorial-video. Desktop-specific installers remain deferred until demo feedback.');break;
 }
 case 'doctor':if(!await doctor())process.exitCode=1;break;
 case 'new-video-from-topic':case 'new-video-from-research':{
  if(await exists(manifest))throw Error('Project already exists. Choose another --slug.');
  const input=get(cmd.endsWith('topic')?'--topic':'--input','');if(!input)throw Error('Provide --topic or --input.');
  await fs.mkdir(work,{recursive:true});
  const duration=Number(get('--duration','175'));if(!Number.isFinite(duration)||duration<165||duration>180)throw Error('Full video target must be 165–180 seconds');
  const p={...neutralProject(duration),id:slug,title:input,inputType:cmd.endsWith('topic')?'topic':'research',input,durationTargetSec:duration,keyword:get('--keyword',input.trim().split(/\s+/).length<=4?input:''),voice:'Adam',approved:false,revisions:[],layout:'drawing-first',captionMode:'sidecar',drawingCoordinateLayout:'drawing-first',styleReviewStatus:'approved',drawingLibrary:{}};
  const identity=await readyOutro();const range=bodyRange(identity.seconds);
  p.scenes=[{id:'s01',start:0,end:duration-identityConfig.introSeconds-identity.seconds,role:'body',theme:'light',title:[],template:{id:'freehand',version:'1.0.0',items:[],drawings:[]}}];
  await fs.writeFile(manifest,JSON.stringify(p,null,2));
  await fs.writeFile(path.join(work,'narration.json'),JSON.stringify({durationRange:range,phrases:[]},null,2));
  await fs.writeFile(path.join(work,'storyboard.md'),'# '+input+'\n\nWrite 18–24 beats: initial object → drawing action → result → narration → labels → carried objects.\n');
  await fs.writeFile(path.join(work,'sources.md'),'# Sources\n\nRecord claim, primary source URL, access date, and whether the scene is an analogy or invented example.\n');
  console.log('Created '+manifest+'\nAuthor the storyboard and narration, run voice, bind measured cues, self-review preview, then render. See the skill.');break;
 }
 case 'revise-scene':{
  const p=await read(),id=get('--scene',''),note=get('--note','');if(!p.scenes.some(s=>s.id===id)||!note)throw Error('Provide existing --scene and --note.');
  p.revisions.push({scene:id,note,date:new Date().toISOString(),status:'pending-agent-edit'});await fs.writeFile(manifest,JSON.stringify(p,null,2));console.log('Revision recorded. Agent must edit the scene and regenerate affected takes before rendering.');break;
 }
 case 'preview':await render(true);break;
 case 'render':case 'resume':await render();break;
 default:console.log('Commands: setup, doctor, templates, cache [--key KEY --delete], validate --slug NAME, preview-template --slug NAME,  new-video-from-topic --slug NAME --topic TEXT, new-video-from-research --slug NAME --input PATH, revise-scene --scene ID --note TEXT, preview [--start 0 --end 28], voice, render, resume. Provide --slug NAME for project commands.');
}
