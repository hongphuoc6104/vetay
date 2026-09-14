import {easeInOutCubic} from '@motion-canvas/core';
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const ramp=(t:number,a:number,b:number)=>clamp((t-a)/(b-a));
export const smooth=(t:number,a:number,b:number)=>easeInOutCubic(ramp(t,a,b));
export const mix=(a:number,b:number,k:number)=>a+(b-a)*k;

export function createPrimitives(C:any){
const W=1080,H=1920;
function rr(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,fill:string,stroke?:string){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}}
function txt(ctx:CanvasRenderingContext2D,s:string,x:number,y:number,size:number,color:string,weight=500,align:CanvasTextAlign='left'){ctx.font=`${weight} ${size}px "Be Vietnam Pro"`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(s,x,y);}
function stroke(ctx:CanvasRenderingContext2D,pts:number[][],progress:number,color:string,width=7,tip=false){
 if(progress<=0)return;const segs=pts.slice(1).map((p,i)=>Math.hypot(p[0]-pts[i][0],p[1]-pts[i][1]));let remain=segs.reduce((a,b)=>a+b,0)*clamp(progress);let ex=pts[0][0],ey=pts[0][1];
 ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(ex,ey);
 for(let i=0;i<segs.length;i++){const r=Math.min(1,remain/segs[i]);ex=mix(pts[i][0],pts[i+1][0],r);ey=mix(pts[i][1],pts[i+1][1],r);ctx.lineTo(ex,ey);remain-=segs[i];if(remain<=0)break;}ctx.stroke();
 if(tip&&progress<.995){ctx.translate(ex,ey);ctx.rotate(-.45);ctx.shadowColor='#0004';ctx.shadowBlur=12;rr(ctx,-8,-85,16,70,7,C.gold);ctx.shadowBlur=0;ctx.fillStyle=C.ink;ctx.beginPath();ctx.moveTo(-8,-15);ctx.lineTo(8,-15);ctx.lineTo(0,1);ctx.fill();}ctx.restore();
}
function ellipseStroke(ctx:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,p:number,color:string){const pts=[];for(let i=0;i<=80;i++){const a=(i/80)*Math.PI*2-.5;pts.push([x+Math.cos(a)*rx,y+Math.sin(a)*ry+Math.sin(a*3)*3]);}stroke(ctx,pts,p,color,6,true);}
function arrow(ctx:CanvasRenderingContext2D,x:number,y:number,length:number,p:number,color:string){stroke(ctx,[[x,y],[x+8,y+length*.2],[x-5,y+length*.55],[x,y+length]],p,color,6,true);if(p>.85)stroke(ctx,[[x-14,y+length-18],[x,y+length],[x+14,y+length-18]],(p-.85)/.15,color,6);}
function alpha(ctx:CanvasRenderingContext2D,a:number,fn:()=>void){ctx.save();ctx.globalAlpha*=clamp(a);fn();ctx.restore();}

function background(ctx:CanvasRenderingContext2D,light:number,header="AI / RESEARCH / LEARNING",edition="NÉT  —  01"){
 ctx.fillStyle=C.navy;ctx.fillRect(0,0,W,H);
 // Soft pools of light and an understated drafting grid.
 const glow=ctx.createRadialGradient(870,690,0,760,900,1150);glow.addColorStop(0,C.glow);glow.addColorStop(1,C.navy);ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
 alpha(ctx,light,()=>{ctx.fillStyle=C.paper;ctx.fillRect(0,0,W,H);const g=ctx.createRadialGradient(700,800,20,650,850,900);g.addColorStop(0,'#ffffff');g.addColorStop(1,C.paperEdge);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);});
 alpha(ctx,.10,()=>{ctx.fillStyle=light>.5?C.muted:C.teal;for(let x=42;x<W;x+=42)for(let y=36;y<H;y+=42){ctx.beginPath();ctx.arc(x,y,.95,0,7);ctx.fill();}});
 // Very restrained ink rules anchor the frame instead of letterboxing it.
 ctx.strokeStyle=light>.5?C.ruleLight:C.ruleDark;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(78,194);ctx.lineTo(1002,194);ctx.stroke();
 const fg=light>.5?C.ink:C.paper;
 txt(ctx,header,80,155,21,fg,500);
 txt(ctx,edition,1000,155,21,fg,600,'right');
 return {light,fg};
}

return {rr,txt,stroke,ellipseStroke,arrow,alpha,background};
}
