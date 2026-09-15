import {Node,Rect,Circle,Line,Txt} from '@motion-canvas/2d';
import {createRef,tween} from '@motion-canvas/core';
import {character,room,palette} from './visuals';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
export default function*(view:any,timeline:any){
 view.fill(palette.paper);
 const world=createRef<Node>(),phone=createRef<Node>(),message=createRef<Txt>(),screen=createRef<Rect>(),folder=createRef<Node>(),towel=createRef<Node>(),steam=createRef<Node>(),back=createRef<Rect>();
 const mai=character('mai'),an=character('an');
 view.add(<Node ref={world}>
  {room()}
  <Node x={-255} y={88}>{mai.node}</Node>
  <Node x={150} y={88}>{an.node}</Node>
  <Node ref={folder} x={350} y={115}>
   <Rect width={186} height={146} radius={8} fill={'#faf4e7'} stroke={'#bac8c3'} lineWidth={5}/>
   <Rect x={-6} y={-8} width={186} height={146} radius={8} fill={'#fffaf0'} stroke={'#bac8c3'} lineWidth={3}/>
   <Rect x={-28} y={-26} width={94} height={48} fill={'#397d7b'}/><Line points={[[-76,25],[60,25]]} stroke={'#c1cbc4'} lineWidth={5}/>
   <Line points={[[-76,44],[15,44]]} stroke={'#c1cbc4'} lineWidth={5}/>
  </Node>
  <Rect x={-85} y={425} width={580} height={43} radius={15} fill={'#966b4d'}/>
  <Rect x={-315} y={580} width={26} height={280} fill={'#795f4c'}/><Rect x={145} y={580} width={26} height={280} fill={'#795f4c'}/>
  <Node ref={phone} x={-146} y={104}>
   <Rect width={224} height={376} radius={30} fill={palette.ink}/>
   <Rect ref={screen} width={198} height={342} radius={21} fill={'#f5f1e8'}/>
   <Rect y={-142} width={55} height={9} radius={5} fill={palette.ink}/>
   <Txt y={-100} text={'An'} fontFamily={'DejaVu Sans'} fontSize={27} fill={palette.ink}/>
   <Rect y={-10} width={169} height={86} radius={15} fill={'#d3e4db'}/>
   <Txt y={-12} text={'Cậu đến chưa?'} fontFamily={'DejaVu Sans'} fontSize={19} fill={palette.ink}/>
   <Txt ref={message} y={63} text={'Đã gửi · 18:10'} fontFamily={'DejaVu Sans'} fontSize={15} fill={'#73877f'}/><Rect ref={back} width={200} height={345} radius={20} fill={palette.ink} opacity={0}/>
  </Node>
  <Node ref={towel} x={-75} y={385}>
   <Rect width={134} height={57} radius={12} fill={'#faf4e7'}/><Line points={[[-45,-25],[-45,25]]} stroke={'#7ca6a0'} lineWidth={8}/>
  </Node>
  <Node x={40} y={366}>
   <Circle x={34} y={2} size={37} stroke={'#faf3df'} lineWidth={10}/><Rect width={63} height={75} radius={12} fill={'#faf3df'}/>
   <Node ref={steam} opacity={0}>{[-13,13].map(x=><Line x={x} points={[[0,-52],[-7,-73],[3,-92]]} stroke={'#faf3df'} lineWidth={4} opacity={.65}/>)}</Node>
  </Node>
 </Node>);
 view.add(<><Txt y={-809} text={'MỘT CHUYỆN NHỎ'} fontFamily={'DejaVu Sans'} fontSize={26} letterSpacing={5} fill={palette.teal}/><Txt y={-751} text={'Tin nhắn chưa trả lời'} fontFamily={'DejaVu Sans'} fontSize={49} fill={palette.ink}/><Txt y={819} text={'Truyện hư cấu'} fontFamily={'DejaVu Sans'} fontSize={24} fill={'#62716a'}/></>);
 const phase=(id:string,t:number,a=0,b=1)=>{const s=timeline.scenes.find((s:any)=>s.id===id);return s?ease(((t-s.start)/s.duration-a)/(b-a)):0};
 yield* tween(timeline.duration,v=>{
  const t=v*timeline.duration;
  const wait=phase('wait',t,.1,.6),put=phase('assume',t,.25,.8),arrive=phase('reveal',t,.05,.55),deliver=phase('reveal',t,.6,.95),pickup=phase('respond',t,0,.2),offer=phase('respond',t,.25,.7),accept=phase('respond',t,.7,1),end=phase('together',t,.1,.65);
  // The phone moves with Mai's hand, then rotates face down onto the table.
  phone().position([-146-164*put,104+273*put]);phone().scale(1-.65*put);phone().rotation(90*put);screen().fill(put>.88?palette.ink:'#f5f1e8');
  message().text(wait>.6?'18:22 · Chưa trả lời':'Đã gửi · 18:10');message().opacity(1-put);
  // Keep all screen details hidden after the face-down placement.
  back().opacity(put);
  mai.head().rotation(10*wait-17*arrive+5*end);
  const mx=109-164*put+140*pickup+146*offer, my=16+273*put+8*pickup-335*offer;
  mai.arm().points([[54,-72],[80+(mx-109)*.5,-5+(my-16)*.5],[mx,my]]);mai.hand().position([mx,my]);
  const entranceX=500*(1-arrive);
  // Three full strides. During each stance half the foot's world x stays fixed;
  // the other foot advances with a lifted swing, rather than sliding both feet.
  const foot=(delay:number)=>{const q=Math.max(0,arrive*6-delay),cycle=Math.floor(q/2),swing=clamp(q-cycle*2);return {x:500*arrive-(500/3)*(cycle+ease(swing)),lift:34*Math.sin(Math.PI*swing)};};
  const left=foot(0),right=foot(1);
  an.leftLeg().points([[-35,98],[-37+left.x*.5,184-left.lift*.4],[-39+left.x,272-left.lift]]);
  an.rightLeg().points([[34,98],[39+right.x*.5,184-right.lift*.4],[43+right.x,272-right.lift]]);
  an.leftShoe().position([-49+left.x,283-left.lift]);an.rightShoe().position([55+right.x,283-right.lift]);
  an.root().x(entranceX);an.root().opacity(arrive);
  an.head().rotation(-7*deliver+4*end);
  const ax=-36-214*deliver+76*accept,ay=29+228*deliver-295*accept;
  an.arm().points([[54,-72],[38+(ax-54)*.4,-12+(ay+72)*.5],[ax,ay]]);an.hand().position([ax,ay]);
  folder().position([114+entranceX-214*deliver,117+228*deliver]);folder().rotation(-5+5*deliver);folder().opacity(arrive);
  // Towel begins on the table; Mai carries it to An; An receives at x=-24, y=50.
  towel().position([-170+146*offer,385-335*offer]);towel().rotation(-9*offer);towel().opacity(1);
  steam().opacity(end);steam().y(-8*end);
  world().scale(1+.04*wait-.04*arrive);world().x(-8*wait+8*arrive);
 });
}
