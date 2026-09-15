import {collision,partialPath} from './geometry.mjs';
import {cueTime,drawingDuration} from '../model.mjs';
import {LayerStack} from './layers';
import {drawingState,transformDrawingPoint} from './drawing.mjs';
import {workspace} from '../workspace.mjs';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));const ease=(n:number)=>{n=clamp(n);return n*n*(3-2*n);};
const pathCache=new Map<string,number[][]>();const rigs=new Map<string,LayerStack>();
export function drawTemplate(ctx:CanvasRenderingContext2D,e:any,t:number,theme:string,env:any){
 const area=workspace(env.layout),drawingFirst=env.layout==='drawing-first';
 const {P,C,timeline,assets,diagnostics}=env,s=e.spec,fg=theme==='light'?C.ink:C.paper;
 const at=(v:any,d=0)=>cueTime(v,timeline,d);const start=at(e.sceneStart),end=at(e.sceneEnd),local=t-start;
 const boxes:any[]=[],strokes:any[]=[];const fade=(cue:any,seconds=.55)=>ease((t-at(cue,start))/seconds);
 const text=(id:string,content:string,x:number,y:number,width:number,size=44,col=fg,weight=500)=>{
  ctx.font=`${weight} ${size}px "Be Vietnam Pro"`;const words=content.split(' ');let lines:string[]=[],line='';for(const word of words){if(ctx.measureText(word).width>width)throw Error('Split long word: '+id);if(ctx.measureText(line?line+' '+word:word).width>width){lines.push(line);line=word;}else line=line?line+' '+word:word;}lines.push(line);
  if(lines.length>3)throw Error('Template text overflow: '+id+'; split scene');
  for(let i=0;i<lines.length;i++){const baseline=y+size+i*size*1.4,m=ctx.measureText(lines[i]);P.txt(ctx,lines[i],x,baseline,size,col,weight);boxes.push({id,x:x-m.actualBoundingBoxLeft,y:baseline-m.actualBoundingBoxAscent,w:m.actualBoundingBoxLeft+m.actualBoundingBoxRight,h:m.actualBoundingBoxAscent+m.actualBoundingBoxDescent});}
  return lines.length*size*1.4;
 };
 const card=(item:any,i:number,x:number,y:number,w=884)=>{const a=fade(item.cue);if(a<=0)return;ctx.save();ctx.globalAlpha*=a;const yy=y+(1-a)*32;P.rr(ctx,x,yy,w,180,28,theme==='light'?C.panel:C.captionDark,C.border);P.rr(ctx,x+25,yy+32,6,114,3,i===1?C.gold:C.teal);if(item.label)text(item.id+'-label',item.label,x+56,yy+22,w-96,28,C.muted,600);text(item.id,item.text,x+56,yy+(item.label?69:38),w-100,44);ctx.restore();};
 if(s.id==='focus'){
  const a=fade(s.items?.[0]?.cue);ctx.save();ctx.globalAlpha*=a;P.rr(ctx,98,705,884,430,36,theme==='light'?C.panel:C.captionDark);text('focus',s.items?.[0]?.text||'',152,805,776,56);ctx.restore();
 }else if(['cards','steps','recap','compare'].includes(s.id)){
  const items=s.items||[];const step=s.id==='compare'?315:236;const y=1020-(items.length*step-56)/2;
  const merge=s.mergeCue===undefined?0:fade(s.mergeCue,1.1);if(merge>0){ctx.save();ctx.globalAlpha*=merge;P.rr(ctx,80,y-24,920,items.length*200+40,34,theme==='light'?C.panel:C.captionDark,C.teal);ctx.restore();}
  items.forEach((item:any,i:number)=>{card(item,i,98,y+i*(step+(200-step)*merge));if(s.id==='steps'&&i<items.length-1)strokes.push({points:[[540,y+i*step+193],[540,y+(i+1)*step-16]],progress:fade(item.cue),color:C.teal});});
 }else if(s.id==='freehand'){
  for(const d of s.drawings||[]){
   const state=drawingState(d,t,timeline);if(!state.visible)continue;
   const parts=d.path.split(/(?=M)/).filter((p:string)=>p.trim());const paths=parts.map((part:string)=>{let points=pathCache.get(part);if(!points){const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',part);const length=path.getTotalLength();if(!Number.isFinite(length)||length<=0)throw Error('Empty drawing');points=[];const count=Math.ceil(length/2);for(let n=0;n<=count;n++){const p=path.getPointAtLength(length*n/count);points.push([p.x,p.y]);}pathCache.set(part,points);}return points;});
   const total=paths.reduce((n:number,p:number[][])=>n+p.length,0),progress=fade(d.cue,drawingDuration(d,timeline,start));let consumed=0;
   for(const points of paths){const mapped=points.map((p:number[])=>transformDrawingPoint(p,d.box,state));const partial=clamp((progress*total-consumed)/points.length);consumed+=points.length;if(d.fill&&partial>=1){ctx.save();ctx.globalAlpha*=.09*state.opacity;ctx.fillStyle=C[d.fill];ctx.beginPath();mapped.forEach((p:number[],i:number)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.fill();ctx.restore();}strokes.push({points:mapped,progress:partial,color:C[d.color||'teal'],width:(d.lineWidth||6)*state.scale,opacity:state.opacity,id:d.id});}
  }
  (s.items||[]).forEach((item:any,i:number)=>{if(t>=at(item.exit,Infinity))return;if(drawingFirst||item.plain){const a=fade(item.cue);if(a>0){ctx.save();ctx.globalAlpha*=a;text(item.id,item.text,item.x??160,item.y??(1450+i*65),item.width??760,40);ctx.restore();}return;}const a=fade(item.cue);if(a>0&&a<1){const x=540+(132-540)*a,y=900+(1255+i*110-900)*a;ctx.fillStyle=C.gold;ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();}ctx.save();ctx.globalAlpha*=a;if(a>0){P.rr(ctx,120,1210+i*110,840,90,22,theme==='light'?C.panel:C.captionDark);text(item.id,item.text,160,1223+i*110,760,40);}ctx.restore();});
 }else if(s.id==='layers'){
  const key=env.palette;let rig=rigs.get(key);if(!rig){rig=new LayerStack([C.teal,C.gold,C.paper],C.ink);rigs.set(key,rig);}const split=fade(s.splitCue,1.2),join=fade(s.joinCue,1.2);rig.draw(ctx,split*(1-join),.12*(1-split));
  (s.items||[]).forEach((item:any,i:number)=>{if(t>=at(item.exit,Infinity))return;if(drawingFirst||item.plain){const a=fade(item.cue);if(a>0){ctx.save();ctx.globalAlpha*=a;text(item.id,item.text,item.x??160,item.y??(1450+i*65),item.width??760,40);ctx.restore();}return;}const a=fade(item.cue);if(a>0){ctx.save();ctx.globalAlpha*=a;text(item.id,item.text,148,1320+i*90,790,40);ctx.restore();}});
 }else if(s.id==='editor'){
  const media=assets[s.src];if(!media)throw Error('Missing editor capture');const [x,y,w,h]=s.mediaBox||[98,600,884,740];P.rr(ctx,x-8,y-8,w+16,h+16,30,C.panel);ctx.drawImage(media,x,y,w,h);diagnostics.media={time:(media as HTMLVideoElement).currentTime,ready:(media as HTMLVideoElement).readyState,width:(media as HTMLVideoElement).videoWidth,duration:(media as HTMLVideoElement).duration};
  for(const r of s.protectedRegions||[])boxes.push({...r});
  (s.items||[]).forEach((item:any,i:number)=>{if(fade(item.cue)>0)text(item.id,item.text,140,1400+i*70,800,40);});
 }
 // Build annotations after measuring all text. Multiple wrapped lines get separate underlines.
 for(const a of s.annotations||[]){const progress=fade(a.cue,a.seconds||.65);if(progress<=0)continue;const target=boxes.filter(b=>b.id===a.targetId);if(!target.length)throw Error('Annotation target not visible: '+a.targetId);
  if(a.kind==='strike'&&!s.items?.some((i:any)=>i.id===a.targetId&&i.incorrect)&&!s.incorrectTargets?.includes(a.targetId))throw Error('Only explicitly wrong content may be crossed out');
  if(a.kind==='arrow'){const destination=boxes.find(b=>b.id===a.toId);if(!destination)throw Error('Missing arrow destination');const b=target[0],x=92;const points=[[b.x-18,b.y+b.h/2],[x,b.y+b.h/2],[x,destination.y+destination.h/2],[destination.x-18,destination.y+destination.h/2]];strokes.push({points,progress,color:C.teal});if(progress>.9)strokes.push({points:[[destination.x-30,destination.y+destination.h/2-9],[destination.x-18,destination.y+destination.h/2],[destination.x-30,destination.y+destination.h/2+9]],progress:(progress-.9)*10,color:C.teal});continue;}
  for(const b of target){let points;if(a.kind==='circle'){const pad=24;points=Array.from({length:121},(_,i)=>{const n=i/120*Math.PI*2;return [b.x+b.w/2+(b.w/2+pad)*Math.sign(Math.cos(n))*Math.sqrt(Math.abs(Math.cos(n))),b.y+b.h/2+(b.h/2+pad)*Math.sign(Math.sin(n))*Math.sqrt(Math.abs(Math.sin(n)))];});}else{const y=a.kind==='strike'?b.y+b.h*.5:b.y+b.h+20;points=[[b.x,y],[b.x+b.w*.5,y+2],[b.x+b.w,y]];}strokes.push({points,progress,color:C[a.color||'gold'],except:a.kind==='strike'?a.targetId:undefined});}
 }
 for(const stroke of strokes){const pts=partialPath(stroke.points,stroke.progress);if(pts.length<2)continue;if(pts.some((p:any)=>drawingFirst?(p[0]<area.x+(stroke.width||6)/2||p[0]>area.x+area.width-(stroke.width||6)/2||p[1]<area.y+(stroke.width||6)/2||p[1]>area.y+area.height-(stroke.width||6)/2):(p[0]<86||p[0]>994||p[1]<546||p[1]>1644)))throw Error('Drawing leaves safe workspace');const hit=collision(pts,boxes,Math.max(6,(stroke.width||6)/2),stroke.except);if(hit)throw Error('Pen overlaps protected text: '+hit);ctx.save();ctx.globalAlpha*=stroke.opacity??1;P.stroke(ctx,pts,1,stroke.color,stroke.width||6,false);if(stroke.progress<1){const tip=pts.at(-1)!;ctx.fillStyle=C.gold;ctx.beginPath();ctx.arc(tip[0],tip[1],5,0,Math.PI*2);ctx.fill();}ctx.restore();}
 // Header/caption are outside the template workspace; ensure text cannot intrude.
 for(const b of boxes)if(b.y<(drawingFirst?area.y:540)||b.y+b.h>(drawingFirst?area.y+area.height:1650)||b.x<80||b.x+b.w>1000)throw Error('Template content leaves safe area: '+b.id);
 diagnostics.template={id:s.id,boxes,strokeCount:strokes.length,drawings:strokes.filter(s=>s.id).map(s=>({id:s.id,progress:s.progress,opacity:s.opacity,first:s.points[0],last:s.points.at(-1)})),time:t};
}
