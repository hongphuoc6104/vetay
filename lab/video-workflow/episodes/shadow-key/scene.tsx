import {Node,Rect,Circle,Line,Txt} from '@motion-canvas/2d';
import {createRef,tween} from '@motion-canvas/core';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));const ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
function person(shadow=false){const root=createRef<Node>(),arm=createRef<Line>(),head=createRef<Node>();const skin=shadow?'#060e19':'#e7b284',coat=shadow?'#060e19':'#b5583d';
const node=<Node ref={root}>
 <Line points={[[-30,95],[-40,200],[-48,298]]} lineWidth={40} stroke={shadow?'#060e19':'#26333f'} lineCap={'round'}/>
 <Line points={[[35,95],[43,207],[60,298]]} lineWidth={40} stroke={shadow?'#060e19':'#1c2a35'} lineCap={'round'}/>
 <Rect x={-56} y={302} width={76} height={25} radius={10} fill={'#071321'}/><Rect x={69} y={302} width={73} height={25} radius={10} fill={'#071321'}/>
 <Line points={[[-60,-100],[56,-100],[73,109],[-70,109]]} closed fill={coat} radius={19}/>
 {!shadow&&<Line points={[[-45,-83],[-49,79]]} stroke={'#d8855a'} lineWidth={5}/>}
 <Line points={[[-48,-75],[-84,6],[-72,84]]} lineWidth={31} stroke={coat} lineCap={'round'} lineJoin={'round'}/>
 <Circle x={-72} y={95} width={28} height={38} fill={skin}/>
 <Rect y={-121} width={38} height={47} fill={skin} radius={9}/>
 <Node ref={head} y={-187}>
  <Rect width={92} height={129} radius={35} fill={skin}/>
  <Line points={[[-48,-13],[-52,-64],[-21,-82],[26,-75],[51,-48],[42,-11],[14,-38],[-16,-26],[-30,4]]} closed fill={'#08111c'} radius={10}/>
  {!shadow&&<><Circle x={22} y={4} size={7} fill={'#102032'}/><Line points={[[19,38],[33,35]]} stroke={'#905944'} lineWidth={3}/></>}
 </Node>
 <Line ref={arm} points={[[48,-78],[85,4],[89,101]]} stroke={coat} lineWidth={33} lineCap={'round'} lineJoin={'round'}/>
 {!shadow&&<Circle x={89} y={112} width={29} height={37} fill={skin}/>}
 </Node>;return {node,root,arm,head};}
export default function*(view:any,timeline:any){
 view.fill('#07101c');const world=createRef<Node>(),key=createRef<Node>(),hand=createRef<Circle>(),fade=createRef<Rect>();const p=person(),s=person(true);
 view.add(<Node ref={world}>
  <Rect width={1500} height={2400} fill={'#112533'}/>
  {[0,1,2,3,4,5,6,7].map(row=><Line points={[[-700,-850+row*150],[700,-850+row*150]]} stroke={'#1b3441'} lineWidth={3}/>)}
  <Rect x={265} y={-220} width={340} height={1110} fill={'#06121f'} stroke={'#30434c'} lineWidth={15}/>
  <Rect x={270} y={-400} width={240} height={380} fill={'#9a7444'} opacity={.24}/>
  <Line points={[[-130,-650],[480,360],[-475,460]]} closed fill={'#e7bc71'} opacity={.10}/>
  <Circle x={-150} y={-640} size={300} fill={'#e9b768'} opacity={.04}/>
  <Rect x={-150} y={-670} width={68} height={94} radius={10} fill={'#f3c378'}/>
  <Rect y={760} width={1500} height={700} fill={'#24343c'}/>
  <Line points={[[-700,405],[700,405]]} stroke={'#4a4f48'} lineWidth={9}/>
  {[-700,-350,0,350,700].map(x=><Line points={[[x*.4,410],[x,1050]]} stroke={'#34434a'} lineWidth={3}/>)}
  <Circle x={0} y={437} width={790} height={160} fill={'#e0b469'} opacity={.12}/>
  <Node x={45} y={100} scale={1}>{s.node}</Node>
  <Node x={-225} y={96}>{p.node}</Node>
  <Circle ref={hand} x={134} y={201} width={34} height={34} fill={'#060e19'}/>
  <Node ref={key} x={70} y={255}>
   <Circle size={28} stroke={'#ffcd65'} lineWidth={7}/>
   <Line points={[[0,13],[0,56],[17,56],[17,43]]} stroke={'#ffcd65'} lineWidth={7} lineJoin={'round'}/>
  </Node>
  <Rect x={-510} y={200} width={95} height={1900} fill={'#07121c'} rotation={-3}/>
  <Txt y={-795} text={'NHỮNG CHUYỆN SAU NỬA ĐÊM'} fontSize={23} letterSpacing={4} fill={'#91a1a7'}/>
 </Node>);
 view.add(<Rect ref={fade} width={1400} height={2300} fill={'#030810'} opacity={0}/>);
 const phase=(id:string,t:number)=>{const sc=timeline.scenes.find((a:any)=>a.id===id);return sc?ease((t-sc.start)/sc.duration):0};
 yield* tween(timeline.duration,v=>{const t=v*timeline.duration;const drop=phase('drop',t),reach=phase('reach',t),lift=phase('lift',t),wait=phase('wait',t),end=phase('end',t);
  const hx=134+(70-134)*reach+80*lift;const hy=201+(410-201)*reach-450*lift;
  s.arm().points([[48,-78],[75+(hx-134)*.4,4+(hy-201)*.45],[hx-45,hy-100]]);
  hand().position([hx,hy]);
  key().position(reach>=.999?[hx,hy+16]:[70,255+170*drop]);
  key().rotation(lift>0?-15*lift+Math.sin(end*7)*8:drop*100);
  p.head().rotation(12*reach-20*wait);
  world().scale(1+.045*reach-.045*wait);
  fade().opacity(clamp((end-.8)/.2));
 });
}
