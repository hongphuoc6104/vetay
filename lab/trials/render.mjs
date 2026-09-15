import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia} from '@remotion/renderer';
import path from 'node:path';import fs from 'node:fs';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
const [spec,out,scale='1']=process.argv.slice(2);const episode=JSON.parse(fs.readFileSync(spec,'utf8'));const inputProps={episode};
const serveUrl=await bundle({entryPoint:path.resolve('trial-index.tsx'),outDir:path.resolve('trial-bundle'),publicDir:path.resolve('public')});
const browserExecutable='/usr/bin/google-chrome';
const concurrency=episode.id==='benchmark'?1:2;fs.writeFileSync(path.join(path.dirname(out),'render-config.json'),JSON.stringify({concurrency,codec:'h264',crf:23,scale:Number(scale)},null,2));
const base={serveUrl,browserExecutable,codec:'h264',concurrency,scale:Number(scale),crf:23,x264Preset:'veryfast'};
if(Number(scale)<1){
 const composition=await selectComposition({serveUrl,id:'Trial',browserExecutable,inputProps});
 await renderMedia({...base,composition,inputProps,outputLocation:out,onProgress:({progress})=>{if(Math.random()<.012)console.log(Math.round(progress*100)+'%')}});
}else{
 const cache=path.resolve('../../trials/scene-cache');fs.mkdirSync(cache,{recursive:true});const clips=[],audios=[];let hits=0;
 const source=fs.readFileSync('trial-index.tsx');
 for(const [i,s] of episode.scenes.entries()){
  const e={...episode,scenes:[{...s,from:0}],frames:s.frames,sceneOffset:i,sceneCount:episode.scenes.length};
  const hash=crypto.createHash('sha256').update(JSON.stringify(e)).update(source);
  for(const k of ['audio','actorSrc','propSrc','externalSrc'])if(s[k])hash.update(fs.readFileSync(path.join('public',s[k])));
  const key=hash.digest('hex');const clip=path.join(cache,key+'.mp4'),wav=path.join(cache,key+'.wav');
  if(!fs.existsSync(clip)){
   const props={episode:e};const composition=await selectComposition({serveUrl,id:'Trial',browserExecutable,inputProps:props});
   const temp=path.join(cache,key+'.part.mp4');await renderMedia({...base,composition,inputProps:props,outputLocation:temp,muted:true});fs.renameSync(temp,clip);
  }else hits++;
  if(!fs.existsSync(wav))execFileSync('ffmpeg',['-v','error','-y','-i',path.resolve('public',s.audio),'-af','apad','-t',String(s.frames/30),'-ar','48000','-ac','1',wav]);
  clips.push(clip);audios.push(wav);console.log('SCENE',i+1,'/',episode.scenes.length,'cached',hits);
 }
 const dir=path.dirname(out);const vl=path.join(dir,'clips.txt'),al=path.join(dir,'audio.txt');
 const list=xs=>xs.map(p=>`file '${p.replaceAll("'","'\\''")}'`).join('\n');fs.writeFileSync(vl,list(clips));fs.writeFileSync(al,list(audios));
 execFileSync('ffmpeg',['-v','error','-y','-f','concat','-safe','0','-i',vl,'-f','concat','-safe','0','-i',al,'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-t',String(episode.frames/30),'-movflags','+faststart',out]);
 fs.writeFileSync(path.join(dir,'scene-cache.json'),JSON.stringify({hits,total:clips.length},null,2));
}
console.log('DONE',out);
