import {makeScene2D,Rect,Circle,Line,Node} from '@motion-canvas/2d';
import {createRef,tween} from '@motion-canvas/core';

// Original vector artwork; independent articulation for the person and reflection.
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a:number,b:number,v:number)=>a+(b-a)*v;
type Pt=[number,number];
function character(reflected=false){
 const root=createRef<Node>(),head=createRef<Node>(),arm=createRef<Line>(),forearm=createRef<Line>(),hand=createRef<Node>();
 const legA=createRef<Line>(),legB=createRef<Line>(),shoeA=createRef<Rect>(),shoeB=createRef<Rect>();
 const skin=reflected?'#cfaa83':'#efbe91',coat=reflected?'#9c4934':'#bc593a';
 const node=<Node ref={root}>
  <Circle y={340} width={270} height={35} fill={'#02070dd0'}/>
  <Line ref={legA} points={[[-39,170],[-48,245],[-52,322]]} stroke={'#222934'} lineWidth={49} lineCap={'round'} lineJoin={'round'}/>
  <Line ref={legB} points={[[39,170],[45,245],[48,322]]} stroke={'#313440'} lineWidth={47} lineCap={'round'} lineJoin={'round'}/>
  <Rect ref={shoeA} x={-64} y={331} width={88} height={33} radius={13} fill={'#101720'}/>
  <Rect ref={shoeB} x={56} y={331} width={86} height={33} radius={13} fill={'#131b25'}/>
  <Line points={[[-68,-54],[-94,25],[-84,139]]} stroke={'#783c32'} lineWidth={47} lineJoin={'round'} lineCap={'round'}/>
  <Circle x={-84} y={154} width={34} height={48} fill={skin}/>
  <Line points={[[-63,-76],[32,-84],[79,-45],[65,180],[-74,178],[-85,16]]} closed fill={coat} radius={20}/>
  <Line points={[[-62,-59],[-73,135],[-55,162]]} stroke={'#df8251'} lineWidth={6} opacity={.55}/>
  <Line points={[[13,-66],[17,163]]} stroke={'#743a32'} lineWidth={4}/>
  <Rect x={35} y={36} width={40} height={43} radius={5} stroke={'#713c33'} lineWidth={3}/>
  <Rect y={-89} width={45} height={50} radius={12} fill={skin}/>
  <Node ref={head} y={-157}>
   <Circle x={-6} y={-6} width={124} height={154} fill={'#111b24'}/>
   <Rect x={8} y={14} width={98} height={127} radius={40} fill={skin}/>
   <Circle x={-44} y={22} size={28} fill={skin}/>
   <Line points={[[-55,-7],[-50,-62],[-13,-82],[41,-65],[57,-20],[22,-39],[-15,-28],[-28,14]]} closed fill={'#111b24'} radius={9}/>
   <Line points={[[33,11],[49,31],[33,34]]} stroke={'#9e6855'} lineWidth={3} lineJoin={'round'}/>
   <Line points={[[15,1],[34,-2]]} stroke={'#3a2929'} lineWidth={5} lineCap={'round'}/>
   <Circle x={28} y={13} size={7} fill={'#12202b'}/>
   <Line points={[[26,53],[42,50]]} stroke={'#865445'} lineWidth={3} lineCap={'round'}/>
   <Line points={[[-41,-31],[-32,-52],[3,-62]]} stroke={'#40505b'} lineWidth={5} opacity={.45}/>
  </Node>
  <Line ref={arm} points={[[55,-51],[93,18],[95,105]]} stroke={coat} lineWidth={48} lineCap={'round'} lineJoin={'round'}/>
  <Line ref={forearm} points={[[93,18],[95,105]]} stroke={skin} lineWidth={27} lineCap={'round'}/>
  <Node ref={hand} x={95} y={111}>
   <Rect width={33} height={50} radius={13} fill={skin}/>
   <Line points={[[-11,-13],[-12,-37],[-5,-42],[1,-18],[3,-44],[10,-44],[13,-16],[18,-35],[24,-31],[22,1]]} stroke={skin} lineWidth={7} lineCap={'round'} lineJoin={'round'}/>
   <Line points={[[-14,4],[-29,-7],[-30,-18]]} stroke={skin} lineWidth={9} lineCap={'round'}/>
  </Node>
 </Node>;
 return {node,root,head,arm,forearm,hand,legA,legB,shoeA,shoeB};
}
export default makeScene2D(function* (view){
 view.fill('#061019');
 const world=createRef<Node>(),glass=createRef<Rect>(),light=createRef<Node>(),fade=createRef<Rect>();
 const person=character(),reflection=character(true);
 view.add(<Node ref={world}>
  <Rect width={1900} height={2400} fill={'#0b1d29'}/>
  <Rect x={230} y={-330} width={1050} height={1450} fill={'#102935'}/>
  {[0,1,2,3,4].map(i=><Line points={[[-610+i*280,-1100],[-610+i*280,410]]} stroke={'#1b3540'} lineWidth={3}/>)}
  <Rect x={-505} y={-130} width={210} height={1120} fill={'#030c15'} stroke={'#263941'} lineWidth={17}/>
  <Line points={[[-380,-680],[-380,420]]} stroke={'#526064'} lineWidth={3}/>
  <Circle x={-425} y={75} size={13} fill={'#b99b65'}/>
  <Rect y={830} width={1900} height={820} fill={'#17262d'}/>
  <Rect y={424} width={1900} height={16} fill={'#35444a'}/>
  {[-900,-450,0,450,900].map(x=><Line points={[[x*.22,440],[x,1500]]} stroke={'#2d3b3f'} lineWidth={3}/>)}
  {[590,810,1130].map(y=><Line points={[[-950,y],[950,y]]} stroke={'#2c3b40'} lineWidth={3}/>)}
  <Circle x={150} y={460} width={790} height={160} fill={'#b1894820'}/>
  <Node ref={light} x={-210} y={-580}>
   {[620,440,270].map((r,i)=><Circle size={r} fill={'#ffbd60'} opacity={.025+i*.012}/>)}
   <Line points={[[0,-400],[0,0]]} stroke={'#635749'} lineWidth={5}/>
   <Line points={[[-85,25],[-47,-49],[47,-49],[85,25]]} closed fill={'#c6a376'} stroke={'#e9be7e'} lineWidth={3}/>
   <Circle y={30} width={160} height={22} fill={'#ffd18a'}/>
   <Line points={[[-76,42],[-320,940],[420,940],[78,42]]} closed fill={'#ffc57108'}/>
  </Node>
  <Circle x={-105} y={-320} size={102} fill={'#17272f'} stroke={'#967b50'} lineWidth={6}/>
  <Line points={[[-105,-356],[-105,-320],[-80,-307]]} stroke={'#c6b694'} lineWidth={4} lineCap={'round'}/>
  <Rect x={246} y={-91} width={413} height={1122} radius={184} fill={'#030d15'} shadowColor={'#000000'} shadowBlur={38} shadowOffset={[18,22]}/>
  <Rect x={230} y={-110} width={405} height={1110} radius={183} fill={'#7d5836'} stroke={'#d3a465'} lineWidth={8}/>
  <Rect x={230} y={-110} width={372} height={1078} radius={170} fill={'#152e3b'} stroke={'#372e26'} lineWidth={9} clip>
   <Rect y={40} width={400} height={1100} fill={'#173443'}/>
   <Line points={[[85,-560],[85,580]]} stroke={'#2a4852'} lineWidth={3}/>
   <Rect y={488} width={420} height={140} fill={'#223b44'}/>
   <Node x={22} y={97} scale={[-.88,.88]}>{reflection.node}</Node>
   <Line points={[[-150,-410],[90,-550]]} stroke={'#d6edf0'} opacity={.07} lineWidth={32}/>
   <Line points={[[85,350],[180,285]]} stroke={'#d6edf0'} opacity={.05} lineWidth={20}/>
  </Rect>
  <Rect ref={glass} x={230} y={-110} width={351} height={1055} radius={162} stroke={'#dcba7c'} lineWidth={2} opacity={.18}/>
  <Node x={-135} y={88}>{person.node}</Node>
  <Node x={-590} y={340}>
   <Line points={[[0,420],[95,40],[70,-135]]} stroke={'#07131a'} lineWidth={16}/>
   {[-100,-40,30,100].map((y,i)=><Circle x={i%2?120:30} y={y} width={180} height={64} rotation={i%2?-34:30} fill={'#07151c'}/>)}
  </Node>
  <Rect x={565} y={170} width={100} height={1800} fill={'#041019'} shadowColor={'#00000088'} shadowBlur={20}/>
 </Node>);
 // Subtle cinema masking, outside camera transform and away from subtitle region.
 view.add(<><Rect y={-905} width={1080} height={110} fill={'#03080dc9'}/><Rect y={895} width={1080} height={130} fill={'#03080de8'}/><Rect ref={fade} width={1080} height={1920} fill={'#020609'} opacity={0}/></>);
 function pose(c:ReturnType<typeof character>,lift:number,t:number,wave=false){
  const elbow:Pt=[mix(90,135,lift),mix(25,-83,lift)];
  const wrist:Pt=[mix(97,175,lift),mix(120,-173,lift)];
  if(wave) wrist[0]+=Math.sin(t*6)*10;
  c.arm().points([[55,-51],elbow]); c.forearm().points([elbow,wrist]);
  c.hand().position(wrist);c.hand().rotation(mix(165,0,lift)+(wave?Math.sin(t*6)*12:0));
 }
 const lift=(t:number)=>t<3?1-ease((t+.55)/.55):t<7?ease((t-3)/1.5):1-ease((t-7.2)/.9);
 yield* tween(22,v=>{
  const t=v*22;
  pose(person,lift(t),t);
  pose(reflection,t<15.5?lift(t-.65):ease((t-16.1)/1.6),t,t>=17.7);
  const exit=ease((t-11.6)/3.5);
  person.root().x(-exit*700);person.root().scale.x(t<11.3?1:mix(1,-1,ease((t-11.3)/.3)));
  person.head().rotation(t<8?0:-8*ease((t-8)/.6)*(1-ease((t-10.3)/.6)));
  if(exit>0&&exit<1){
   const stride=Math.sin((t-11.6)*7)*25;
   person.legA().points([[-39,170],[-48+stride*.4,245],[-52+stride,322]]);
   person.legB().points([[39,170],[45-stride*.4,245],[48-stride,322]]);
   person.shoeA().x(-64+stride);person.shoeB().x(56-stride);
  }
  // Close contact, return to establish the departure, then isolate the reflection.
  const close=ease((t-3)/1.1)*(1-ease((t-6.5)/1.1));
  const final=ease((t-16)/3.2);
  world().scale(1+close*.24+final*.28);
  world().position([-close*15-final*95,close*75+final*45]);
  glass().opacity(.16+.11*close);
  light().opacity(1-.32*ease((t-20)/1.8));
  fade().opacity(ease((t-21.65)/.35));
 });
});
