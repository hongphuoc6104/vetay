/** The shared map signature: fixed composition, genuinely progressive ink paths. */
export function drawIdentity(ctx:CanvasRenderingContext2D,t:number,spec:any,P:any,C:any,avatar:HTMLImageElement){
 const clamp=(x:number)=>Math.max(0,Math.min(1,x));
 const progress=(a:number,b:number)=>clamp((t-a)/(b-a));
 const path=(points:number[][],a:number,b:number,color=C.teal,width=7)=>P.stroke(ctx,points,progress(a,b),color,width,false);
 const star=(x:number,y:number,r:number,p:number)=>{ctx.save();ctx.translate(x,y);ctx.scale(p,p);ctx.fillStyle=C.gold;ctx.beginPath();ctx.moveTo(0,-r);ctx.quadraticCurveTo(r*.2,-r*.2,r,0);ctx.quadraticCurveTo(r*.2,r*.2,0,r);ctx.quadraticCurveTo(-r*.2,r*.2,-r,0);ctx.quadraticCurveTo(-r*.2,-r*.2,0,-r);ctx.fill();ctx.restore();};
 const ring=(x:number,y:number,r:number)=>Array.from({length:161},(_,i)=>{const a=-Math.PI/2+i/160*Math.PI*2;return [x+Math.cos(a)*r,y+Math.sin(a)*r];});
 P.background(ctx,1,'','',false);
 // Sparse topographic lines remain outside the information hierarchy.
 ctx.save();ctx.globalAlpha=.13;ctx.strokeStyle=C.teal;ctx.lineWidth=2;
 for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(80,330+i*48);ctx.bezierCurveTo(160,150+i*38,300,200+i*50,355,290+i*42);ctx.stroke();ctx.beginPath();ctx.moveTo(745,1390+i*40);ctx.bezierCurveTo(840,1290+i*40,915,1400+i*40,1000,1320+i*40);ctx.stroke();}ctx.restore();
 if(spec.kind==='intro'){
  P.txt(ctx,spec.name,540,530,34,C.ink,600,'center');
  const words=spec.keyword.trim().split(/\s+/);if(words.length>4||words.length<1)throw Error('Identity keyword requires 1–4 words');
  ctx.font='700 88px "Be Vietnam Pro"';const lines:string[]=[];let line='';for(const word of words){if(ctx.measureText(word).width>820)throw Error('Shorten keyword');if(ctx.measureText(line?line+' '+word:word).width>820){lines.push(line);line=word;}else line=line?line+' '+word:word;}lines.push(line);if(lines.length>2)throw Error('Shorten keyword to two lines');
  const y=lines.length===1?835:780;lines.forEach((v,i)=>P.txt(ctx,v,540,y+i*118,88,C.ink,700,'center'));
  path([[115,1340],[190,1310],[190,1130],[285,1130],[345,1050],[780,1050],[970,960],[970,640],[785,640]],0,.86);
  star(785,640,44,progress(.64,.9));
  path([[170,980],[420,982],[735,976]],.9,1.18,C.ink,5);
  path([[735,976],[885,1110],[965,1110],[1000,1155]],1.18,1.5,C.teal,5);
 }else{
  const end=spec.seconds,stretch=(end-.7)/4.3;
  const route=ring(540,820,253);
  path([[80,680],[165,680],[165,820],[287,820]],0,.32);
  path(route,.25,1.12*stretch);
  const a=progress(.42,1.05*stretch);ctx.save();ctx.globalAlpha=a;ctx.beginPath();ctx.arc(540,820,224,0,Math.PI*2);ctx.clip();ctx.drawImage(avatar,316,596,448,448);ctx.restore();
  P.alpha(ctx,progress(1*stretch,1.65*stretch),()=>P.txt(ctx,spec.name,540,1170,48,C.ink,600,'center'));
  star(540,523,36,progress(1.1*stretch,1.7*stretch));
  // Hand-drawn thumb, with a separate cuff; never a simulated platform button.
  path([[293,1347],[316,1347],[345,1314],[355,1272],[370,1272],[380,1290],[374,1322],[416,1322],[425,1338],[415,1383],[402,1394],[335,1394],[315,1382],[293,1382]],2*stretch,3.05*stretch,C.ink,6);
  path([[281,1345],[299,1345],[299,1400],[281,1400],[281,1345]],2.6*stretch,3.1*stretch,C.teal,5);
  path(ring(714,1347,50),2.65*stretch,3.35*stretch,C.ink,5);
  path([[689,1347],[739,1347]],3.2*stretch,3.6*stretch,C.teal,6);path([[714,1322],[714,1372]],3.4*stretch,3.85*stretch,C.teal,6);
  P.alpha(ctx,progress(3*stretch,3.5*stretch),()=>{P.txt(ctx,'Thích',355,1470,34,C.ink,500,'center');P.txt(ctx,'Theo dõi',715,1470,34,C.ink,500,'center');});
  path([[355,1510],[355,1550],[540,1575],[715,1550],[715,1510]],3.8*stretch,4.15*stretch,C.teal,4);
  path([[540,1575],[900,1575],[965,1510],[965,1100],[840,1100],[740,980]],4.05*stretch,4.3*stretch,C.teal,3);
 }
}
