import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../..');
export const config=JSON.parse(await fs.readFile(path.join(root,'sys/templates/brand/identity.json')));
export const media=path.join(root,'sys/templates/brand/media',config.version);
const json=async p=>JSON.parse(await fs.readFile(p,'utf8'));
export function run(bin,args,capture=false){const r=spawnSync(bin,args,{cwd:root,encoding:'utf8',stdio:capture?'pipe':'inherit',maxBuffer:8e6});if(r.error||r.status!==0)throw Error(`${bin} failed: ${r.error||r.stderr||r.status}`);return r.stdout;}
const digest=async file=>crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');
export function keyword(text){const v=String(text||'').trim();if(!v||v.split(/\s+/).length>4)throw Error('Provide keyword of 1–4 words; shorten the topic rather than shrink text');return v;}
export function bodyRange(outroSeconds){return [165-config.introSeconds-outroSeconds,180-config.introSeconds-outroSeconds];}
export function captions(parts){return parts.flatMap(({timeline,offset=0,start=0,end=timeline.targetSeconds})=>timeline.phrases.filter(p=>p.speechEnd>start&&p.speechStart<end).map(p=>({text:p.caption||p.text,start:offset+Math.max(0,p.speechStart-start),end:offset+Math.min(end,p.speechEnd)-start})));}
const stamp=t=>{const m=Math.round(t*1000);return `${String(Math.floor(m/3600000)).padStart(2,'0')}:${String(Math.floor(m/60000)%60).padStart(2,'0')}:${String(Math.floor(m/1000)%60).padStart(2,'0')},${String(m%1000).padStart(3,'0')}`;};
export const srt=rows=>rows.map((p,i)=>`${i+1}\n${stamp(p.start)} --> ${stamp(p.end)}\n${p.text}\n`).join('\n');
function project(kind,seconds,word=''){return {id:'identity-'+kind,title:config.name,stylePreset:'net-cinematic-v1',rendererVersion:'1.0.0',layout:'drawing-first',captionMode:'sidecar',palette:config.palette,format:{width:1080,height:1920,fps:30},audioMaster:'master.wav',coverFrame:27,identity:{...config,kind,seconds,keyword:word},scenes:[{id:kind,start:0,end:seconds,title:[],theme:'light',elements:[]}]};}
async function renderIdentity(kind,seconds,dir,timeline,word=''){
 await fs.writeFile(dir+'/project.json',JSON.stringify(project(kind,seconds,word),null,2));await fs.writeFile(dir+'/timeline.json',JSON.stringify(timeline,null,2));
 run(process.execPath,['sys/engine/visual/render.mjs','--project',dir+'/project.json','--timeline',dir+'/timeline.json','--output',dir,'--name',kind]);
}
export async function buildOutro(){
 const dir=path.join(root,'sys/work/brand-voice');run('python3',['sys/engine/timing.py',dir+'/speech.json','--output',dir+'/timeline.json']);const t=await json(dir+'/timeline.json');if(!t.valid)throw Error('Fix CTA narration');
 run(path.join(root,'sys/.venv/bin/python'),['sys/engine/assemble.py',dir+'/speech.json',dir+'/timeline.json','--output',dir+'/voice-master.wav']);
 const seconds=Math.ceil(Math.max(config.outroMinSeconds,t.targetSeconds+.65+.7)*30)/30;
 const shifted={...t,targetSeconds:seconds,phrases:t.phrases.map(p=>({...p,...Object.fromEntries(['start','end','speechStart','speechEnd'].map(k=>[k,p[k]+.65]))}))};
 run('ffmpeg',['-y','-v','error','-i',dir+'/voice-master.wav','-af','adelay=650,apad','-t',String(seconds),'-ar','48000','-c:a','pcm_s16le',dir+'/master.wav']);
 await renderIdentity('outro',seconds,dir,shifted);
 await fs.mkdir(media,{recursive:true});
 for(const [src,dst] of [['outro.mp4','outro.mp4'],['outro.srt','outro.srt'],['master.wav','outro.wav'],['timeline.json','timeline.json'],['outro-cover.png','outro-cover.png']])await fs.copyFile(dir+'/'+src,media+'/'+dst);
 const manifest={version:config.version,seconds,config,selection:await json(dir+'/takes.json'),files:{}};
 // Selection metadata is useful; machine-local candidate paths are unnecessary.
 for(const row of manifest.selection)for(const take of row.candidates)delete take.audio;
 const packagedTimeline=await json(media+'/timeline.json');for(const p of packagedTimeline.phrases)delete p.audio;await fs.writeFile(media+'/timeline.json',JSON.stringify(packagedTimeline,null,2));
 for(const file of ['outro.mp4','outro.srt','outro.wav','timeline.json','outro-cover.png'])manifest.files[file]=await digest(media+'/'+file);
 await fs.writeFile(media+'/manifest.json',JSON.stringify(manifest,null,2));return manifest;
}
export async function readyOutro(){const m=await json(media+'/manifest.json');if(JSON.stringify(m.config)!==JSON.stringify(config))throw Error('Rebuild identity media after changing brand configuration');for(const [f,h] of Object.entries(m.files))if(await digest(media+'/'+f)!==h)throw Error('Invalid identity media checksum: '+f);return m;}
export async function intro(word){word=keyword(word);const key=crypto.createHash('sha256').update(JSON.stringify([config,word])).update(await fs.readFile(path.join(root,'sys/engine/visual/identity.ts'))).update(await fs.readFile(path.join(root,'sys/engine/visual/primitives.ts'))).update(await fs.readFile(path.join(root,'sys/templates/brand/themes.json'))).digest('hex').slice(0,20);const dir=path.join(root,'sys/cache/identity',key);await fs.mkdir(dir,{recursive:true});
 try{const m=await json(dir+'/verified.json');if(m.sha256===await digest(dir+'/intro.mp4')&&m.cover===await digest(dir+'/intro-cover.png'))return dir;}catch{}
 run('ffmpeg',['-y','-v','error','-f','lavfi','-i','anullsrc=r=48000:cl=mono','-t',String(config.introSeconds),'-c:a','pcm_s16le',dir+'/master.wav']);
 await renderIdentity('intro',config.introSeconds,dir,{valid:true,targetSeconds:config.introSeconds,fps:30,phrases:[]},word);
 await fs.writeFile(dir+'/verified.json',JSON.stringify({sha256:await digest(dir+'/intro.mp4'),cover:await digest(dir+'/intro-cover.png')}));return dir;
}
export async function compose(parts,output,name,cover){
 await fs.mkdir(output,{recursive:true});const temp=path.join(root,'sys/cache/identity-compose',crypto.createHash('sha256').update(output+name).digest('hex').slice(0,16));await fs.mkdir(temp,{recursive:true});
 const seconds=parts.reduce((s,p)=>s+p.seconds,0),list=temp+'/video.ffconcat';
 await fs.writeFile(list,'ffconcat version 1.0\n'+parts.map(p=>`file '${p.file.replace(/'/g,"'\\''")}'\nduration ${p.seconds}`).join('\n')+'\n');
 run('ffmpeg',['-y','-v','error','-safe','0','-f','concat','-i',list,'-map','0:v:0','-an','-c:v','copy',temp+'/picture.mp4']);
 const inputs=parts.flatMap(p=>['-i',p.file]),filter=parts.map((p,i)=>`[${i}:a]atrim=duration=${p.seconds},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=mono[a${i}]`).join(';')+';'+parts.map((_,i)=>`[a${i}]`).join('')+`concat=n=${parts.length}:v=0:a=1[a]`;
 run('ffmpeg',['-y','-v','error',...inputs,'-filter_complex',filter,'-map','[a]','-c:a','pcm_s16le',temp+'/joined.wav']);
 const result=spawnSync('ffmpeg',['-hide_banner','-i',temp+'/joined.wav','-af','loudnorm=I=-15.5:TP=-2.5:LRA=7:print_format=json','-f','null','-'],{encoding:'utf8',maxBuffer:4e6});if(result.status!==0)throw Error(result.stderr);const stats=JSON.parse(result.stderr.slice(result.stderr.lastIndexOf('{'),result.stderr.lastIndexOf('}')+1));
 const norm=`loudnorm=I=-15.5:TP=-2.5:LRA=7:measured_I=${stats.input_i}:measured_TP=${stats.input_tp}:measured_LRA=${stats.input_lra}:measured_thresh=${stats.input_thresh}:offset=${stats.target_offset}:linear=true`;
 const tmp=temp+'/final.mp4';run('ffmpeg',['-y','-v','error','-i',temp+'/picture.mp4','-i',temp+'/joined.wav','-map','0:v','-map','1:a','-c:v','copy','-af',norm,'-c:a','aac','-b:a','192k','-ar','48000','-t',String(seconds),'-movflags','+faststart',tmp]);
 run('ffmpeg',['-v','error','-i',tmp,'-f','null','-']);
 await fs.copyFile(tmp,path.join(output,name+'.mp4'));await fs.copyFile(cover,path.join(output,name==='final'?'cover.png':name+'-cover.png'));
 let offset=0;const rows=[];for(const part of parts){rows.push(...captions([{timeline:part.timeline,offset,start:part.start||0,end:part.end??part.timeline.targetSeconds}]));offset+=part.seconds;}
 await fs.writeFile(path.join(output,name+'.srt'),srt(rows));
 await fs.writeFile(path.join(output,name+'-assembly.json'),JSON.stringify({seconds,identityVersion:config.version,parts:parts.map(p=>({seconds:p.seconds,file:path.basename(p.file)})),subtitles:rows.length,decoded:true},null,2));
 return {seconds};
}
export async function brandedRender({p,manifest,timeline,output,work,preview=false,start=0,end=28,transport='binary-pipe'}){
 const m=await readyOutro(),t=await json(timeline),word=keyword(p.keyword),range=bodyRange(m.seconds);
 if(!preview&&(t.targetSeconds<range[0]||t.targetSeconds>range[1]))throw Error(`Body must be ${range[0]}–${range[1]} seconds including its closing thought; identity adds ${config.introSeconds+m.seconds}s.`);
 const opening=await intro(word),bodyDir=path.join(work,'rendered-body');await fs.mkdir(bodyDir,{recursive:true});
 const spans=preview?[{start,end:Math.min(end,t.targetSeconds)},{start:Math.max(end,t.targetSeconds-4),end:t.targetSeconds}].filter(s=>s.end>s.start):[{start:0,end:t.targetSeconds}];
 const parts=[{file:opening+'/intro.mp4',seconds:config.introSeconds,timeline:{targetSeconds:config.introSeconds,phrases:[]}}];
 for(let i=0;i<spans.length;i++){const s=spans[i];const name='body-'+i;run(process.execPath,['sys/engine/visual/render.mjs','--project',manifest,'--timeline',timeline,'--output',bodyDir,'--name',name,'--transport',transport,'--start',String(s.start),'--end',String(s.end)]);parts.push({file:bodyDir+'/'+name+'.mp4',seconds:s.end-s.start,timeline:t,start:s.start,end:s.end});}
 parts.push({file:media+'/outro.mp4',seconds:m.seconds,timeline:await json(media+'/timeline.json')});
 return compose(parts,output,preview?'preview':'final',opening+'/intro-cover.png');
}
if(process.argv[1]===new URL(import.meta.url).pathname){const cmd=process.argv[2];if(cmd==='build-outro')await buildOutro();else if(cmd==='intro')console.log(await intro(process.argv.slice(3).join(' ')));else if(cmd==='check')console.log(await readyOutro());else throw Error('identity.mjs build-outro|intro KEYWORD|check');}
