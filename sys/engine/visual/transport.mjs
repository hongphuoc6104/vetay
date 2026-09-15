/** Bounded binary frame receiver. No base64 and no frame files. */
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {performance} from 'node:perf_hooks';
export const ENCODER={codec:'libx264',preset:'fast',crf:18,pixelFormat:'yuv420p',fps:30,chunkFrames:300,version:1};
export function chunks(scenes,first,last){
 const result=[];
 for(let i=0;i<scenes.length;i++){
  const a=Math.ceil(scenes[i].start*30-1e-7),b=Math.ceil(scenes[i].end*30-1e-7);
  for(let n=a;n<b;n+=300){const from=Math.max(n,first),to=Math.min(n+300,b,last);if(to>from)result.push({scene:i,first:from,last:to});}
 }
 return result;
}
export function probe(file){return new Promise((resolve,reject)=>{
 const p=spawn('ffprobe',['-v','error','-select_streams','v:0','-count_frames','-show_entries','stream=codec_name,width,height,r_frame_rate,nb_read_frames','-of','json',file]);let out='';p.stdout.on('data',d=>out+=d);p.on('error',reject);p.on('close',code=>{try{if(code)throw Error('Invalid video cache');resolve(JSON.parse(out).streams[0]);}catch(e){reject(e);}});
});}
export async function validSegment(file,count,checkDigest=true){try{if(checkDigest){const record=JSON.parse(await fs.readFile(file+'.json','utf8'));const digest=crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');if(record.sha256!==digest||record.frames!==count)return false;}const p=await probe(file);return p.codec_name==='h264'&&p.width===1080&&p.height===1920&&p.r_frame_rate==='30/1'&&Number(p.nb_read_frames)===count;}catch{return false;}}
export async function encodeSegment(page,file,first,last,{ffmpeg='ffmpeg'}={}){
 const temporary=file+'.partial.mp4';await fs.rm(temporary,{force:true});
 const p=spawn(ffmpeg,['-y','-v','error','-f','image2pipe','-framerate','30','-c:v','png','-i','pipe:0','-an','-c:v',ENCODER.codec,'-preset',ENCODER.preset,'-crf',String(ENCODER.crf),'-pix_fmt',ENCODER.pixelFormat,'-r','30','-video_track_timescale','15360','-frames:v',String(last-first),temporary]);
 let stderr='',failure,expected=first,active=false;const metrics={bytes:0,frames:0,writeWaitMs:0,drawMs:0,pngMs:0,uploadMs:0,maxInFlight:1,encodeWallMs:0};
 p.stderr.on('data',d=>stderr=(stderr+d).slice(-10000));p.stdin.on('error',e=>failure=e);
 const done=new Promise((resolve,reject)=>{p.on('error',reject);p.on('close',code=>code===0?resolve():reject(Error(`Encoder failed (${code}): ${stderr}`)));});done.catch(e=>failure=e);
 const token=crypto.randomBytes(24).toString('hex');
 const server=http.createServer(async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','content-type');
  if(req.method==='OPTIONS'){res.end();return;}
  try{
   const u=new URL(req.url,'http://localhost');
   if(u.pathname!=='/'+token||req.method!=='POST')throw Error('Invalid receiver request');
   if(active||Number(u.searchParams.get('frame'))!==expected||expected>=last)throw Error('Duplicate or out-of-order frame');
   if(failure)throw failure;active=true;let bytes=0;const parts=[];
   for await(const part of req){bytes+=part.length;if(bytes>16*1024*1024)throw Error('Frame exceeds size limit');parts.push(part);}
   const data=Buffer.concat(parts);if(data.length<8||data.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Expected PNG frame');
   const t=performance.now();await new Promise((yes,no)=>p.stdin.write(data,e=>e?no(e):yes()));metrics.writeWaitMs+=performance.now()-t;
   metrics.bytes+=bytes;metrics.frames++;expected++;active=false;res.end('ok');
  }catch(e){failure=e;active=false;res.statusCode=400;res.end(String(e));}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const endpoint=`http://127.0.0.1:${server.address().port}/${token}`,started=performance.now();
 try{
  // One bounded batch in the browser; HTTP acknowledgements apply encoder backpressure.
  const measured=await page.evaluate(async({endpoint,first,last})=>{
   const m={drawMs:0,pngMs:0,uploadMs:0};
   for(let frame=first;frame<last;frame++){
    let t=performance.now();await window.renderFrame(frame/30);m.drawMs+=performance.now()-t;
    t=performance.now();const blob=await new Promise((resolve,reject)=>document.querySelector('#film').toBlob(b=>b?resolve(b):reject(Error('Canvas PNG failed')),'image/png'));m.pngMs+=performance.now()-t;
    t=performance.now();const response=await fetch(endpoint+'?frame='+frame,{method:'POST',body:blob});if(!response.ok)throw Error(await response.text());await response.text();m.uploadMs+=performance.now()-t;
   }return m;
  },{endpoint,first,last});
  if(failure)throw failure;if(expected!==last)throw Error('Missing frames');p.stdin.end();await done;
  if(!await validSegment(temporary,last-first,false))throw Error('Encoded segment frame/format mismatch');
  await fs.rename(temporary,file);const record={frames:last-first,sha256:crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex'),encoder:ENCODER};await fs.writeFile(file+'.json.tmp',JSON.stringify(record));await fs.rename(file+'.json.tmp',file+'.json');Object.assign(metrics,measured);metrics.encodeWallMs=performance.now()-started;metrics.cacheBytes=(await fs.stat(file)).size;return metrics;
 }catch(e){p.stdin.destroy();p.kill('SIGKILL');await done.catch(()=>{});await fs.rm(temporary,{force:true});throw e;}
 finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
}
