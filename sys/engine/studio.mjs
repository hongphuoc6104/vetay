#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {catalog,compileTemplates} from './visual/templates/registry.mjs';
import {cacheCommand} from './visual/cache.mjs';
import {validateProject} from './visual/model.mjs';
import {neutralProject} from './examples/neutral.mjs';
import {layoutVariants} from './visual/layouts.mjs';
const root=path.resolve(import.meta.dirname,'../..');
const args=process.argv.slice(2),cmd=(args.shift()||'help').replace(/^\//,'');
const get=(k,d)=>args.includes(k)?args[args.indexOf(k)+1]:d;
const slug=get('--slug','');
if(!slug&&!['help','setup','doctor','templates','cache'].includes(cmd))throw Error('Provide --slug NAME.');
if(slug&&!/^[a-z0-9][a-z0-9-]*$/.test(slug))throw Error('Use a lowercase slug with digits or hyphens.');
const work=path.join(root,'sys/work',slug),manifest=path.join(work,'project.json');
const exists=async p=>{try{await fs.access(p);return true;}catch{return false;}};
function run(binary,argv,options={}){const p=spawnSync(binary,argv,{cwd:root,stdio:'inherit',...options});if(p.error)throw p.error;if(p.status!==0)throw Error(`${binary} failed (${p.status})`);}
async function read(){if(!await exists(manifest))throw Error('No project manifest: '+manifest);return JSON.parse(await fs.readFile(manifest,'utf8'));}
async function doctor(){
 const checks={};for(const bin of ['node','npm','uv','ffmpeg','ffprobe'])checks[bin]=spawnSync(bin,['--version'],{stdio:'ignore'}).error===undefined;
 checks.chrome=await exists(process.env.CHROME_PATH||'/usr/bin/google-chrome');checks.engine=await exists(path.join(root,'sys/engine/node_modules/@motion-canvas/core/package.json'));
 checks.voice=spawnSync(path.join(root,'sys/.venv/bin/python'),['-c','import vieneu, soundfile, numpy'],{stdio:'ignore'}).status===0;
 console.log(JSON.stringify(checks,null,2));return Object.values(checks).every(Boolean);
}
async function render(preview=false){
 const p=await read();if(!p.approved)throw Error('Scene content must be approved before production.');
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
 const selection=get('--layout',p.outputLayouts||p.layout||'classic');
 if(!args.includes('--layout')&&!p.outputLayouts){
  run(process.execPath,[script,'--project',manifest,'--timeline',timeline,'--output',output,'--transport',get('--transport','binary-pipe'),...(preview?['--start',get('--start','0'),'--end',get('--end','5')]:[])]);
 }else for(const variant of layoutVariants(p,selection)){
  const variantFile=path.join(work,'project-'+variant.layout+'.json');await fs.writeFile(variantFile,JSON.stringify(variant,null,2));
  run(process.execPath,[script,'--project',variantFile,'--timeline',timeline,'--output',output,'--name',(preview?'preview-':'')+variant.layout,'--transport',get('--transport','binary-pipe'),...(preview?['--start',get('--start','0'),'--end',get('--end','5')]:[])]);
 }

}
switch(cmd){
 case 'voice':run(path.join(root,'sys/.venv/bin/python'),['sys/engine/voice.py',path.join(work,'narration.json')]);break;
 case 'templates':console.log(JSON.stringify(catalog,null,2));break;
 case 'cache':await cacheCommand(root,args);break;
 case 'validate':{const p=compileTemplates(await read());const timeline=JSON.parse(await fs.readFile(path.join(work,'timeline.json'),'utf8'));const brand=JSON.parse(await fs.readFile(path.join(root,'sys/templates/brand/themes.json'),'utf8'));validateProject(p,timeline,brand);console.log('Project valid; preview still required for visual review.');break;}
 case 'preview-template':await render(true);break;
 case 'setup':{
  for(const dir of ['sys/cache','sys/logs','sys/models','sys/work','video'])await fs.mkdir(path.join(root,dir),{recursive:true});
  if(!await exists(path.join(root,'sys/.venv/bin/python')))run('uv',['venv','sys/.venv']);
  run('uv',['pip','install','--python','sys/.venv','-r','sys/engine/requirements.txt']);
  if(!await exists(path.join(root,'sys/engine/node_modules/@motion-canvas/core/package.json')))run('npm',['ci','--prefix','sys/engine','--cache','sys/cache/npm']);
  if(!await doctor())process.exitCode=1;
  else run(path.join(root,'sys/.venv/bin/python'),['sys/engine/prepare-models.py']);
  console.log('Initial skill is local at sys/skill/cinematic-tutorial-video. Desktop-specific installers remain deferred until demo feedback.');break;
 }
 case 'doctor':if(!await doctor())process.exitCode=1;break;
 case 'new-video-from-topic':case 'new-video-from-research':{
  if(await exists(manifest))throw Error('Project already exists. Choose another --slug.');
  const input=get(cmd.endsWith('topic')?'--topic':'--input','');if(!input)throw Error('Provide --topic or --input.');
  await fs.mkdir(work,{recursive:true});
  const duration=Number(get('--duration','360'));if(!Number.isFinite(duration)||duration<=0)throw Error('Duration must be positive');
  const keyword=input.trim().replace(/[!?.,:;]+/g,'').replace(/\s+/g,' ').split(' ').slice(0,5).join(' ').slice(0,42);
  const p={...neutralProject(duration),id:slug,title:input,inputType:cmd.endsWith('topic')?'topic':'research',input,durationTargetSec:duration,voice:'Adam',approved:false,revisions:[],publication:{title:input.trim().slice(0,120),primaryKeyword:keyword,seriesLabel:'NÉT / HƯỚNG DẪN',coverFrame:15,intro:{enabled:true,holdSec:1.5},outro:{enabled:true,avatarTheme:'scene',durationSec:4,renderTakeaways:true,takeaways:['Thay bằng ý chính cần nhớ.']}}};
  p.scenes[0].id='scene-1';p.scenes[0].label='BẢN NHÁP / CẦN VIẾT NỘI DUNG';p.scenes[0].title=['Nội dung cảnh đầu tiên.'];
  await fs.writeFile(manifest,JSON.stringify(p,null,2));
  await fs.writeFile(path.join(work,'speech.json'),JSON.stringify({targetSeconds:duration,fps:30,phrases:[]},null,2));
  p.scenes=[{id:'scene-1',start:0,end:duration,role:'body',theme:'auto',title:['Nội dung cảnh đầu tiên.'],template:{id:'focus',version:'1.0.0',items:[{id:'idea',text:'Thay bằng một ý cần giải thích.',cue:0}]}}];if(get('--layout',null)){
   const choice=get('--layout');if(!['drawing-first','classic','both'].includes(choice))throw Error('Invalid layout');
   p.layout=choice==='both'?'drawing-first':choice;p.outputLayouts=choice;p.drawingCoordinateLayout=p.layout;p.captionMode=p.layout==='drawing-first'?'sidecar':'burned-in';
   p.styleReviewStatus='approved';p.scenes[0].template={id:'freehand',version:'1.0.0',drawings:[],items:[]};p.scenes[0].title=[];
  }
  await fs.writeFile(manifest,JSON.stringify(p,null,2));
  console.log('Created '+manifest+'\nAgent: research the input, fill template slots using references/templates.md, then obtain content approval. Do not write a custom renderer.');break;
 }
 case 'revise-scene':{
  const p=await read(),id=get('--scene',''),note=get('--note','');if(!p.scenes.some(s=>s.id===id)||!note)throw Error('Provide existing --scene and --note.');
  p.revisions.push({scene:id,note,date:new Date().toISOString(),status:'pending-agent-edit'});await fs.writeFile(manifest,JSON.stringify(p,null,2));console.log('Revision recorded. Agent must edit the scene and regenerate affected takes before rendering.');break;
 }
 case 'preview':await render(true);break;
 case 'render':case 'resume':await render();break;
 default:console.log('Commands: setup, doctor, templates, cache [--key KEY --delete], validate --slug NAME, preview-template --slug NAME,  new-video-from-topic --slug NAME --topic TEXT, new-video-from-research --slug NAME --input PATH, revise-scene --scene ID --note TEXT, preview [--start 0 --end 5], voice, render, resume [--layout drawing-first|classic|both]. Provide --slug NAME for project commands.');
}
