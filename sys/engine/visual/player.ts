import '@fontsource/be-vietnam-pro/400.css';import '@fontsource/be-vietnam-pro/500.css';import '@fontsource/be-vietnam-pro/600.css';import '@fontsource/be-vietnam-pro/700.css';
import {makeScene2D,Node} from '@motion-canvas/2d';
import {PlaybackManager,PlaybackStatus,PlaybackState,Logger,SharedWebGLContext,Vector2,Stage,waitFor} from '@motion-canvas/core';
import {ReadOnlyTimeEvents} from '@motion-canvas/core/lib/scenes/timeEvents/ReadOnlyTimeEvents';
import {createPrimitives,ramp,smooth,mix,clamp} from './primitives';import {PaperCamera} from './camera';
import {drawIdentity} from './identity';
import {drawTemplate} from './templates/draw';
import {validateProject,resolveTrack,interpolate,cueTime,publicationMeta} from './model.mjs';
const {project,timeline,brand,assetBase}=await fetch('/__net/project').then(r=>r.json());
const query=new URLSearchParams(location.search);if(query.has('theme')){project.theme=query.get('theme');project.scenes.forEach((s:any)=>s.theme=project.theme);}if(query.has('palette'))project.palette=query.get('palette');
const scenes=validateProject(project,timeline,brand);const C={...brand.shared,...brand.palettes[project.palette]};const P=createPrimitives(C);const W=1080,H=1920;
const publication=publicationMeta(project,timeline);
await Promise.all([400,500,600,700].map(w=>document.fonts.load(`${w} 48px "Be Vietnam Pro"`,'Tiếng Việt đủ dấu ABC xyz 0123')));await document.fonts.ready;
const assets:Record<string,HTMLImageElement|HTMLVideoElement>={};const assetURL=(p:string)=>p.startsWith('/sys/templates/')?p:assetBase+p.split('/').map(encodeURIComponent).join('/');
const diagnostics:any={text:[],holds:[],assets:[]};
const allElements=(es:any[]):any[]=>es.flatMap(e=>[e,...allElements(e.children||[])]);
for(const e of scenes.flatMap((s:any)=>allElements(s.elements||[]))){
 if(e.src&&!assets[e.src]){const el=(e.type==='video'||e.mediaType==='video')?document.createElement('video'):new Image();el.src=assetURL(e.src);if(el instanceof HTMLVideoElement){el.muted=true;el.preload='auto';await new Promise((yes,no)=>{el.onloadeddata=yes;el.onerror=no;});}else await el.decode();assets[e.src]=el;diagnostics.assets.push(e.src);}
 e._tracks=Object.fromEntries(Object.entries(e.animate||{}).map(([k,v])=>[k,resolveTrack(v,timeline)]));
}
const logos:Record<string,HTMLImageElement>={};for(const theme of ['light','dark']){const i=new Image();i.src='/sys/templates/brand/'+brand.templates[theme].logo;await i.decode();logos[theme]=i;}
let identityAvatar=logos.light;if(project.identity){identityAvatar=new Image();identityAvatar.src=assetURL(project.identity.avatar);await identityAvatar.decode();}
const color=(token:string|undefined,theme:string)=>token==='none'?'':token==='foreground'||!token?theme==='light'?C.ink:C.paper:token==='accent'?C.gold:C[token];
function wrapped(ctx:CanvasRenderingContext2D,text:string,width:number,size:number,weight:number){
 ctx.font=`${weight} ${size}px "Be Vietnam Pro"`;let lines:string[]=[];
 for(const line of text.split('\n')){let out='';for(const word of line.split(' ')){if(ctx.measureText(word).width>width)throw Error('Unbreakable text exceeds width: '+word);if(ctx.measureText(out?out+' '+word:word).width>width){lines.push(out);out=word;}else out=out?out+' '+word:word;}lines.push(out);}
 return lines;
}
function textBlock(ctx:CanvasRenderingContext2D,e:any,theme:string){
 const size=e.fontSize??(e.secondary?28:44),width=e.width??760,weight=e.weight??500,lineHeight=e.lineHeight??size*1.45;
 const lines=wrapped(ctx,e.text||'',width,size,weight);const height=lines.length*lineHeight;
 if(e.height&&height>e.height+.1)throw Error('Text overflow: '+e.id+'; split or enlarge instead of shrinking');
 if(e.recordBounds)diagnostics.text.push({id:e.id,lines,height,width});
 lines.forEach((s,i)=>P.txt(ctx,s,e.align==='center'?width/2:0,size+i*lineHeight,size,color(e.color,theme),weight,e.align==='center'?'center':'left'));
}
function drawIntro(ctx:CanvasRenderingContext2D,s:any,theme:string,index:number){
 if(index!==0||publication.intro?.enabled!==true||!publication.primaryKeyword)return;
 const keyword=publication.primaryKeyword.toUpperCase();ctx.font='700 31px "Be Vietnam Pro"';const width=ctx.measureText(keyword).width+56;
 if(width>920)throw Error('publication.primaryKeyword is too wide for the intro chip');
 P.rr(ctx,80,292,width,70,28,C.teal);
 P.txt(ctx,keyword,108,338,31,theme==='light'?C.navy:C.paper,700);
}
function drawOutro(ctx:CanvasRenderingContext2D,s:any,theme:string,index:number,t:number){
 if(index!==scenes.length-1||publication.outro?.enabled!==true)return;
 const duration=publication.outro.durationSec||4;const start=Math.max(s.start,s.end-duration);if(t<start)return;
 const a=smooth(t,start,Math.min(s.end,start+.55));
 P.alpha(ctx,a,()=>{
  const takeaways=Array.isArray(publication.outro.takeaways)&&publication.outro.takeaways.length&&publication.outro.renderTakeaways!==false?publication.outro.takeaways:[];
  const rows=takeaways.map((item:string)=>{const lines=wrapped(ctx,item,470,38,500);if(lines.length>2)throw Error('Split long publication.outro.takeaways item before rendering');return lines;});
  if(takeaways.length){
   const rowHeight=rows.some((lines:string[])=>lines.length>1)?90:70,panelHeight=42+rows.length*rowHeight;P.rr(ctx,70,1205,640,panelHeight,28,theme==='light'?C.panel:C.captionDark,C.border);
   rows.forEach((lines:string[],i:number)=>{const y=1232+i*rowHeight;P.rr(ctx,106,y-20,34,34,12,C.gold);P.txt(ctx,String(i+1),123,y+6,22,C.navy,700,'center');lines.forEach((line:string,j:number)=>P.txt(ctx,line,160,y+j*43,36,theme==='light'?C.ink:C.paper,500));});
  }
  const hasTakeaways=takeaways.length>0,y=hasTakeaways?1318:1505,avatarX=hasTakeaways?750:390,avatarCenter=hasTakeaways?875:540;P.rr(ctx,avatarX,y-18,hasTakeaways?250:300,190,34,theme==='light'?C.panel:C.captionDark,C.border);
  const avatarTheme=publication.outro.avatarTheme==='scene'?theme:(publication.outro.avatarTheme||theme);
  ctx.save();ctx.beginPath();ctx.arc(avatarCenter,y+72,78,0,7);ctx.clip();ctx.drawImage(logos[avatarTheme],avatarCenter-78,y-6,156,156);ctx.restore();
  ctx.strokeStyle=C.gold;ctx.lineWidth=4;ctx.beginPath();ctx.arc(avatarCenter,y+72,86,-.8,Math.PI*1.8);ctx.stroke();
 });
}
const projections=new Map<string,{surface:HTMLCanvasElement,rig:PaperCamera}>();
function values(e:any,t:number){const x={...e};for(const [key,track] of Object.entries(e._tracks||{}))x[key]=interpolate(track,t,e[key]);return x;}
function drawElements(ctx:CanvasRenderingContext2D,items:any[],t:number,theme:string){for(const source of items){const e=values(source,t);const enter=cueTime(e.enter,timeline,-1e6),exit=cueTime(e.exit,timeline,1e6);if(t<enter||t>=exit)continue;ctx.save();ctx.globalAlpha*=clamp(e.opacity??1);ctx.translate(e.x||0,e.y||0);ctx.rotate(e.rotate||0);ctx.scale(e.scale??1,e.scale??1);
 if(e.reveal!==undefined){ctx.beginPath();ctx.rect(0,0,(e.width??900)*clamp(e.reveal),e.height??1000);ctx.clip();}
 switch(e.type){
  case 'template':drawTemplate(ctx,e,t,theme,{P,C,timeline,assets,diagnostics,palette:project.palette,layout:project.layout});break;
  case 'text':textBlock(ctx,e,theme);break;
  case 'panel':{ctx.shadowColor='#15372d24';ctx.shadowBlur=e.shadow===false?0:45;ctx.shadowOffsetY=e.shadow===false?0:25;P.rr(ctx,0,0,e.width??884,e.height??700,e.radius??28,color(e.fill??(theme==='light'?'panel':'navy'),theme),e.border?color(e.border,theme):undefined);ctx.shadowBlur=0;ctx.shadowOffsetY=0;const childTheme=['panel','paper','captionLight'].includes(e.fill)?'light':['navy','captionDark'].includes(e.fill)?'dark':theme;drawElements(ctx,e.children||[],t,childTheme);break;}
  case 'group':drawElements(ctx,e.children||[],t,theme);break;
  case 'image':case 'video':{const a=assets[e.src];const naturalW=a instanceof HTMLVideoElement?a.videoWidth:a.naturalWidth;const naturalH=a instanceof HTMLVideoElement?a.videoHeight:a.naturalHeight;const w=e.width??884,h=e.height??w*naturalH/naturalW;ctx.beginPath();ctx.roundRect(0,0,w,h,e.radius??0);ctx.clip();if(e.crop)ctx.drawImage(a,...e.crop,0,0,w,h);else ctx.drawImage(a,0,0,w,h);break;}
  case 'stroke':P.stroke(ctx,e.points,e.progress??1,color(e.color??'teal',theme),e.lineWidth??7,e.pen!==false);break;
  case 'ellipse':P.ellipseStroke(ctx,0,0,e.rx,e.ry,e.progress??1,color(e.color??'gold',theme));break;
  case 'list':{let y=0;for(let i=0;i<e.items.length;i++){const item=typeof e.items[i]==='string'?{text:e.items[i]}:e.items[i];const p=item.cue===undefined?1:smooth(t,cueTime(item.cue,timeline),cueTime(item.cue,timeline)+.45);P.alpha(ctx,p,()=>{P.rr(ctx,0,y,77,77,23,C.teal);P.txt(ctx,String(i+1).padStart(2,'0'),38,y+50,29,C.navy,700,'center');ctx.save();ctx.translate(112,y+1);textBlock(ctx,{...e,...item,width:(e.width??820)-112},theme);ctx.restore();});const lines=wrapped(ctx,item.text,(e.width??820)-112,e.fontSize??44,e.weight??500);y+=Math.max(77,lines.length*(e.fontSize??44)*1.45)+(e.gap??54);}break;}
  case 'projection':{let p=projections.get(e.id);if(!p){const surface=document.createElement('canvas');surface.width=e.width??940;surface.height=e.height??980;p={surface,rig:new PaperCamera(surface,C.teal)};projections.set(e.id,p);}const c=p.surface.getContext('2d')!;c.clearRect(0,0,p.surface.width,p.surface.height);drawElements(c,e.children||[],t,theme);ctx.setTransform(1,0,0,1,0,0);p.rig.draw(ctx,{x:e.px,y:e.py,rx:e.rx,ry:e.ry,rz:e.rz,scale:e.zoom,layers:e.layers});break;}
 }
 ctx.restore();}}
function paint(ctx:CanvasRenderingContext2D,t:number){
 if(project.identity){drawIdentity(ctx,t,project.identity,P,C,identityAvatar);return;}
 const s=scenes.find((s:any)=>t>=s.start&&t<s.end)||scenes.at(-1),index=scenes.indexOf(s),previous=scenes[Math.max(0,index-1)];let light=s.theme==='light'?1:0;
 if(previous.theme!==s.theme)light=mix(previous.theme==='light'?1:0,light,smooth(t,s.start,s.start+.65));
 const drawingFirst=project.layout==='drawing-first';
 const {fg}=P.background(ctx,light,project.brandLine||'AI / RESEARCH / LEARNING',project.edition||'NÉT  —  01',!drawingFirst);
 if(!drawingFirst){
 const introEnabled=index===0&&publication.intro?.enabled===true;
 P.txt(ctx,introEnabled?(publication.seriesLabel||s.label||''):s.label||'',80,267,28,fg,600);
 for(let i=0;i<3;i++)P.rr(ctx,824+i*61,244,43,5,2,i<=Math.min(2,index)?C.teal:'#8ea49e55');
 drawIntro(ctx,s,s.theme,index);const a=introEnabled?1:smooth(t,s.start,s.start+.5);const titleY=introEnabled?425:375;ctx.font='600 68px "Be Vietnam Pro"';const titleLines=introEnabled&&publication.title?wrapped(ctx,publication.title,920,68,600):s.title;if(titleLines.length>2)throw Error('Title overflow; split or shorten: '+s.id);for(const line of titleLines)if(ctx.measureText(line).width>920)throw Error('Title overflow; split or shorten: '+s.id);P.alpha(ctx,a,()=>titleLines.forEach((line:string,i:number)=>P.txt(ctx,line,80,titleY+i*89+(introEnabled?0:(1-a)*38),68,i===1&&s.theme==='dark'?C.gold:fg,600)));

 }
 ctx.save();const cam=s.camera||{};const v=(k:string,d:number)=>cam[k]?interpolate(resolveTrack(cam[k],timeline),t,d):d;ctx.translate(540,1050);ctx.scale(v('zoom',1),v('zoom',1));ctx.translate(-540+v('x',0),-1050+v('y',0));drawElements(ctx,s.elements||[],t,s.theme);ctx.restore();
 if(!drawingFirst&&s.logo){P.alpha(ctx,smooth(t,s.end-1.7,s.end-1.2),()=>{ctx.save();ctx.beginPath();ctx.arc(540,1450,90,0,7);ctx.clip();ctx.drawImage(logos[s.theme],450,1360,180,180);ctx.restore();});}
 if(!drawingFirst)drawOutro(ctx,s,s.theme,index,t);
 if(index>0&&!drawingFirst){const p=ramp(t,s.start-.05,s.start+.65);if(p>0&&p<1){ctx.save();ctx.translate(-400+p*1900,0);ctx.rotate(-.08);ctx.globalAlpha=Math.sin(p*Math.PI)*.48;ctx.fillStyle=C.teal;ctx.fillRect(-100,-100,130,2200);ctx.fillStyle=C.gold;ctx.fillRect(46,-100,10,2200);ctx.restore();}}

 const phrase=timeline.phrases.find((p:any)=>t>=p.speechStart&&t<p.speechEnd);
 if(phrase&&project.captionMode!=='sidecar'){const text=phrase.caption||phrase.text;const lines=wrapped(ctx,text,820,28,500);if(lines.length>2)throw Error('Caption exceeds two lines: '+phrase.id);const height=lines.length===1?104:130;P.rr(ctx,96,1700,888,height,23,light>.5?C.captionLight:C.captionDark);lines.forEach((line:string,i:number)=>P.txt(ctx,line,540,1749+i*40,28,fg,500,'center'));}
 if(!drawingFirst){ctx.fillStyle=light>.5?C.ruleLight:C.ruleDark;ctx.fillRect(80,1870,920,3);ctx.fillStyle=C.gold;ctx.fillRect(80,1870,920*t/timeline.targetSeconds,3);}
}
const manager=new PlaybackManager();manager.fps=30;manager.state=PlaybackState.Rendering;const status=new PlaybackStatus(manager),logger=new Logger(),shared=new SharedWebGLContext(logger);
class Film extends Node{protected draw(c:CanvasRenderingContext2D){c.save();c.translate(-540,-960);paint(c,status.time);c.restore();}}
const desc=makeScene2D(function*(view){view.add(new Film({}));yield* waitFor(timeline.targetSeconds);});const scene=new desc.klass({...desc,name:'net-cinematic',size:new Vector2(W,H),resolutionScale:1,logger,playback:status,timeEventsClass:ReadOnlyTimeEvents,sharedWebGLContext:shared} as any);manager.setup([scene]);await manager.recalculate();await manager.reset();
const stage=new Stage();stage.configure({size:new Vector2(W,H),resolutionScale:1,colorSpace:'srgb',background:C.navy});const canvas=document.querySelector('#film') as HTMLCanvasElement,c=canvas.getContext('2d')!;
async function renderFrame(t:number){const frame=Math.max(0,Math.min(Math.round(timeline.targetSeconds*30)-1,Math.round(t*30)));t=frame/30;
 const active=scenes.find((s:any)=>t>=s.start&&t<s.end)||scenes.at(-1);const activeIds=new Set(allElements(active.elements||[]).filter((e:any)=>e.type==='projection').map((e:any)=>e.id));for(const [id,p] of projections)if(!activeIds.has(id)){p.rig.dispose();projections.delete(id);}
 for(const e of allElements(active.elements||[]).filter((e:any)=>e.type==='video'||e.mediaType==='video')){const v=assets[e.src] as HTMLVideoElement;const desired=Math.max(0,Math.min(v.duration-.001,t-cueTime(e.enter??e.sceneStart,timeline)+(e.sourceStart||e.spec?.sourceStart||0)));if(Math.abs(v.currentTime-desired)>.001)await new Promise<void>((yes,no)=>{v.onseeked=()=>yes();v.onerror=no;v.currentTime=desired;});}
 await manager.seek(frame);await stage.render(manager.currentScene,manager.previousScene);const fatal=logger.history.find(x=>x.level==='error');if(fatal)throw Error(fatal.message);c.clearRect(0,0,W,H);c.drawImage(stage.finalBuffer,0,0);return frame;}
(window as any).renderFrame=renderFrame;(window as any).netDiagnostics=diagnostics;(window as any).netModel={project,scenes,timeline};
await renderFrame(0);(window as any).filmReady=true;
const audio=new Audio('/__net/audio');let playing=false,start=0;document.querySelector('#play')!.addEventListener('click',()=>{playing=!playing;if(!playing){audio.pause();return;}start=performance.now();audio.currentTime=0;audio.play().catch(()=>{});requestAnimationFrame(tick);});
async function tick(now:number){if(!playing)return;const t=(now-start)/1000;if(t>=timeline.targetSeconds){playing=false;audio.pause();return;}await renderFrame(t);requestAnimationFrame(tick);}
