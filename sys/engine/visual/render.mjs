import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {spawn,spawnSync} from 'node:child_process';import {chromium} from 'playwright';
import {chunks,encodeSegment,ENCODER,validSegment} from './transport.mjs';
import {contentHolds} from './stillness.mjs';
import {workspaceCrop} from './workspace.mjs';
import {sampleProcessTree} from './metrics.mjs';
import {performance} from 'node:perf_hooks';
import {startServer} from './server.mjs';import {validateProject,resolveTrack,cueTime,publicationMeta,publicationWarnings} from './model.mjs';
const root=path.resolve(import.meta.dirname,'../../..');const args=process.argv.slice(2);const get=(k,d)=>args.includes(k)?args[args.indexOf(k)+1]:d;
const projectFile=path.resolve(get('--project','')),timelineFile=path.resolve(get('--timeline',''));const output=path.resolve(get('--output',path.join(root,'video')));
const {server,url,project,timeline,brand}=await startServer(root,projectFile,timelineFile);let browser;const began=performance.now();const stopMemory=sampleProcessTree();let peakNodeRss=0;const memoryTimer=setInterval(()=>peakNodeRss=Math.max(peakNodeRss,process.memoryUsage().rss),100);const transport=get('--transport','binary-pipe');if(!['binary-pipe','legacy-png'].includes(transport))throw Error('Unknown transport');const performanceReport={transport,bytes:0,drawMs:0,pngMs:0,ipcMs:0,diskWriteMs:0,uploadMs:0,writeWaitMs:0,segments:[]};
function run(bin,args){return new Promise((yes,no)=>{const p=spawn(bin,args,{stdio:'inherit'});p.on('error',no);p.on('exit',code=>code===0?yes():no(Error(bin+' exited '+code)));});}
const all=(es=[])=>es.flatMap(e=>[e,...all(e.children)]);
async function hashFiles(dir){const out=[];for(const d of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,d.name);if(d.isDirectory())out.push(...await hashFiles(p));else out.push([p,await fs.readFile(p)]);}return out;}
try{
 const scenes=validateProject(project,timeline,brand);const publication=publicationMeta(project,timeline);const warnings=project.layout==='drawing-first'?[]:publicationWarnings(project,timeline);for(const warning of warnings)console.warn('PUBLICATION:',warning);const start=Number(get('--start',0)),end=Number(get('--end',timeline.targetSeconds));if(start<0||end>timeline.targetSeconds+1/30||end<=start)throw Error('Invalid preview range');
 await fs.mkdir(output,{recursive:true});const base=path.dirname(projectFile);const fps=30,first=Math.round(start*fps),last=Math.round(end*fps);
 if(!project.audioMaster)throw Error('Provide audioMaster (relative PCM WAV)');await fs.access(path.resolve(base,project.audioMaster));
 // Cache per scene; keep absolute start in the key because global progress and media seek use it.
 const coreHash=crypto.createHash('sha256');for(const [name,bytes] of await hashFiles(import.meta.dirname))coreHash.update(path.basename(name)).update(bytes);for(const [name,bytes] of await hashFiles(path.join(root,'sys/engine/node_modules/@fontsource/be-vietnam-pro/files')))coreHash.update(path.basename(name)).update(bytes);coreHash.update(JSON.stringify(brand));for(const [name,bytes] of await hashFiles(path.join(root,'sys/templates/brand')))coreHash.update(path.basename(name)).update(bytes);const core=coreHash.digest('hex');
 const caches=[];
 for(const s of scenes){const normalized=JSON.parse(JSON.stringify(s));const shift=(obj)=>{if(!obj||typeof obj!=='object')return;if(Array.isArray(obj)){obj.forEach(shift);return;}for(const key of Object.keys(obj)){if(['at','enter','exit','cue','endCue'].includes(key)){obj[key]=cueTime(obj[key],timeline)-s.start;}else shift(obj[key]);}};shift(normalized);normalized.start=0;normalized.end=s.end-s.start;
  const phrases=timeline.phrases.filter(p=>p.speechEnd>s.start&&p.speechStart<s.end).map(p=>({...p,start:p.start-s.start,end:p.end-s.start,speechStart:p.speechStart-s.start,speechEnd:p.speechEnd-s.start,audio:undefined}));
  const sceneIndex=scenes.indexOf(s),scenePublication={};if(sceneIndex===0)Object.assign(scenePublication,{title:publication.title,primaryKeyword:publication.primaryKeyword,seriesLabel:publication.seriesLabel,intro:publication.intro});if(sceneIndex===scenes.length-1)Object.assign(scenePublication,{outro:publication.outro});
  const h=crypto.createHash('sha256').update(core).update(JSON.stringify(normalized)).update(JSON.stringify(phrases)).update(JSON.stringify(timeline.phrases.map(p=>[p.id,p.start,p.end,p.speechStart,p.speechEnd]))).update(JSON.stringify({start:s.start,total:timeline.targetSeconds,palette:project.palette,layout:project.layout,captionMode:project.captionMode,brandLine:project.brandLine,edition:project.edition,identity:project.identity,publication:scenePublication,previousTheme:scenes[Math.max(0,scenes.indexOf(s)-1)].theme}));

  for(const e of all(s.elements))if(e.src){const asset=e.src.startsWith('/sys/templates/')?path.join(root,e.src.slice(1)):path.resolve(base,e.src);h.update(await fs.readFile(asset));}
  const dir=path.join(root,'sys/cache/visual',h.update(get('--cache-salt','')).update(transport).update(JSON.stringify(ENCODER)).digest('hex').slice(0,20));await fs.mkdir(dir,{recursive:true});caches.push(dir);
 }
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});const page=await browser.newPage({viewport:{width:1080,height:1920}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.waitForFunction(()=>window.filmReady,null,{timeout:60000});
 let rendered=0,reused=0;const framePaths=[];const crops=[];
 const segmentPaths=[];
 if(transport==='legacy-png'){
 for(let n=first;n<last;n++){const t=n/fps,i=scenes.findIndex(s=>t>=s.start&&t<s.end);if(i<0)throw Error('Missing scene at '+t);const local=n-Math.round(scenes[i].start*fps),target=path.join(caches[i],String(local).padStart(7,'0')+'.png');let exists=true;try{await fs.access(target);}catch{exists=false;}
  if(!exists){let clock=performance.now();await page.evaluate(t=>window.renderFrame(t),t);performanceReport.drawMs+=performance.now()-clock;clock=performance.now();const result=await page.evaluate(()=>{const a=performance.now();const data=document.querySelector('#film').toDataURL('image/png').split(',')[1];return {data,pngMs:performance.now()-a};});performanceReport.ipcMs+=performance.now()-clock;performanceReport.pngMs+=result.pngMs;performanceReport.bytes+=result.data.length;clock=performance.now();await fs.writeFile(target,Buffer.from(result.data,'base64'));performanceReport.diskWriteMs+=performance.now()-clock;rendered++;}else reused++;
  framePaths.push(target);if(n%90===0)console.log('frame',n,'/',last,'rendered',rendered,'reused',reused);
 }
 }else{
 for(const part of chunks(scenes,first,last)){
  const target=path.join(caches[part.scene],`segment-${part.first}-${part.last}.mp4`);
  let measurement={reused:true};if(await validSegment(target,part.last-part.first)){reused+=part.last-part.first;}else{measurement=await encodeSegment(page,target,part.first,part.last);rendered+=part.last-part.first;for(const k of ['bytes','drawMs','pngMs','uploadMs','writeWaitMs'])performanceReport[k]+=measurement[k];}
  segmentPaths.push(target);performanceReport.segments.push({...part,...measurement});console.log('segment',part.first,part.last,'rendered',rendered,'reused',reused);
 }
 }
 if(errors.length)throw Error(errors.join('\n'));
 const concat=path.join(base,'render-frames.ffconcat');const quote=p=>p.replace(/'/g,"'\\''");if(transport==='legacy-png')await fs.writeFile(concat,'ffconcat version 1.0\n'+framePaths.map(p=>`file '${quote(p)}'\nduration ${1/fps}`).join('\n')+`\nfile '${quote(framePaths.at(-1))}'\n`);
 if(transport==='binary-pipe')await fs.writeFile(concat,'ffconcat version 1.0\n'+segmentPaths.map(p=>`file '${quote(p)}'`).join('\n')+'\n');
 const name=get('--name',first===0&&last===Math.round(timeline.targetSeconds*fps)?'final':'preview');if(!/^[\w-]+$/.test(name))throw Error('Invalid output name');const mp4=path.join(output,name+'.mp4');
 const muxStarted=performance.now();await run('ffmpeg',['-y','-v','warning','-safe','0','-f','concat','-i',concat,'-ss',String(start),'-i',path.resolve(base,project.audioMaster),'-t',String((last-first)/fps),'-r','30',...(transport==='binary-pipe'?['-c:v','copy']:['-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p']),'-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',mp4]);
 performanceReport.muxMs=performance.now()-muxStarted;
 const requestedCover=publication.coverFrame,coverFrame=Math.max(first,Math.min(last-1,requestedCover)),coverLocalFrame=coverFrame-first;
 const coverFilter=`select=eq(n\\,${coverLocalFrame})`;await run('ffmpeg',['-y','-v','error','-i',mp4,'-vf',coverFilter,'-frames:v','1','-vsync','vfr',path.join(output,(name==='final'?'cover.png':name+'-cover.png'))]);
 performanceReport.coverFrame=coverFrame;performanceReport.coverSeconds=coverFrame/fps;performanceReport.publicationWarnings=warnings;
 const stamp=t=>{let ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
 await fs.writeFile(path.join(output,name+'.srt'),timeline.phrases.filter(p=>p.speechEnd>start&&p.speechStart<end).map((p,i)=>`${i+1}\n${stamp(Math.max(0,p.speechStart-start))} --> ${stamp(Math.min(end,p.speechEnd)-start)}\n${p.caption||p.text}`).join('\n\n')+'\n');
 // Independent visual-region stillness check. Caption, header and progress bar are excluded.
 const stats=spawnSync('ffmpeg',['-hide_banner','-i',mp4,'-vf',`${workspaceCrop(project.layout)},freezedetect=n=-45dB:d=4`,'-an','-f','null','-'],{encoding:'utf8',maxBuffer:4e6});const freeze=stats.stderr||'';await fs.writeFile(path.join(base,'freeze-check.log'),freeze);
 const holds=await contentHolds(mp4,project.layout);
 const violations=holds.filter(h=>h.end-h.start>8&&!scenes.some(s=>s.holdReason&&h.start+start>=s.start&&h.end+start<=s.end));
 performanceReport.wallMs=performance.now()-began;performanceReport.peakNodeRss=peakNodeRss;Object.assign(performanceReport,await stopMemory());performanceReport.cacheBytes=0;performanceReport.cacheFiles=0;for(const dir of new Set(caches)){for(const entry of await fs.readdir(dir)){const st=await fs.stat(path.join(dir,entry));performanceReport.cacheBytes+=st.size;performanceReport.cacheFiles++;}}await fs.writeFile(path.join(output,name+'-performance.json'),JSON.stringify(performanceReport,null,2));
 const report={stylePreset:project.stylePreset,rendererVersion:project.rendererVersion,rendered,reused,frames:last-first,seconds:(last-first)/fps,scenes:scenes.map(s=>({id:s.id,theme:s.theme,cache:caches[scenes.indexOf(s)]})),publication:{...publication,coverFrame,coverSeconds:coverFrame/fps},publicationWarnings:warnings,holds,violations,errors,mp4};await fs.writeFile(path.join(base,'visual-report.json'),JSON.stringify(report,null,2));
 const publishing={title:publication.title,primaryKeyword:publication.primaryKeyword,seriesLabel:publication.seriesLabel,episode:publication.episode,coverFrame,coverSeconds:coverFrame/fps,coverPath:(name==='final'?'cover.png':name+'-cover.png'),note:'Chọn đúng khung này làm ảnh bìa trên màn hình đăng TikTok. Từ khóa trên hình giúp người xem nhận ra chủ đề; không đảm bảo thứ hạng tìm kiếm.'};await fs.writeFile(path.join(output,name+'-publishing.json'),JSON.stringify(publishing,null,2));await fs.writeFile(path.join(output,name+'-publishing.md'),`# Ghi chú đăng video\n\n- Tiêu đề: ${publishing.title||'(chưa đặt)'}\n- Từ khóa chính: ${publishing.primaryKeyword||'(chưa đặt)'}\n- Nhãn loạt bài: ${publishing.seriesLabel||'(chưa đặt)'}\n- Khung bìa: frame ${coverFrame} (${publishing.coverSeconds.toFixed(2)} giây), tệp ${publishing.coverPath}.\n\nTừ khóa trên hình giúp nhận ra chủ đề; không đảm bảo thứ hạng tìm kiếm.\n`);console.log('OUTPUT',mp4);console.log('COVER',coverFrame,coverFrame/fps+'s');console.log('CACHE',rendered,reused);
 if(violations.length)throw Error('Unexplained content hold >8 seconds; inspect visual-report.json before delivery');
}finally{await stopMemory();clearInterval(memoryTimer);await browser?.close();await server.close();}
