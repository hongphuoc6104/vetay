import {Node,Rect,Circle,Line} from '@motion-canvas/2d';
import {createRef} from '@motion-canvas/core';
export const palette={ink:'#243441',paper:'#f1e8d8',wall:'#d9ded7',teal:'#397d7b',ochre:'#dca44e',skin:'#dcaa86'};
export function character(kind:'mai'|'an') {
 const root=createRef<Node>(),head=createRef<Node>(),arm=createRef<Line>(),hand=createRef<Circle>(),leftLeg=createRef<Line>(),rightLeg=createRef<Line>(),leftShoe=createRef<Rect>(),rightShoe=createRef<Rect>();
 const coat=kind==='mai'?palette.ochre:palette.teal;
 const node=<Node ref={root}>
  <Circle y={294} width={220} height={28} fill={'#243441'} opacity={.12}/>
  <Line ref={leftLeg} points={[[-35,98],[-39,272]]} stroke={palette.ink} lineWidth={40} lineCap={'round'}/>
  <Line ref={rightLeg} points={[[34,98],[43,272]]} stroke={palette.ink} lineWidth={40} lineCap={'round'}/>
  <Rect ref={leftShoe} x={-49} y={283} width={74} height={22} radius={10} fill={'#29323b'}/><Rect ref={rightShoe} x={55} y={283} width={74} height={22} radius={10} fill={'#29323b'}/>
  <Rect y={7} width={145} height={217} radius={35} fill={coat}/>
  {kind==='an'&&<><Line points={[[20,-56],[23,-20]]} stroke={'#5faaa9'} lineWidth={4}/><Line points={[[-18,-35],[-14,-6]]} stroke={'#5faaa9'} lineWidth={4}/></>}
  <Line points={[[-50,-71],[-90,10],[-80,70]]} stroke={coat} lineWidth={32} lineCap={'round'}/>
  <Circle x={-80} y={79} size={30} fill={palette.skin}/>
  <Rect y={-114} width={36} height={47} radius={10} fill={palette.skin}/>
  <Node ref={head} y={-177}>
   {kind==='mai'&&<Rect y={-6} width={124} height={150} radius={45} fill={palette.ink}/>}
   <Rect width={95} height={123} radius={40} fill={palette.skin}/>
   <Line points={kind==='mai'?[[-49,8],[-55,-58],[-17,-77],[33,-62],[52,-23],[14,-40],[-27,-10]]:[[-50,-21],[-45,-60],[14,-74],[48,-49],[49,-20],[12,-39],[-20,-28]]} closed fill={palette.ink} radius={12}/>
   <Circle x={20} y={2} size={7} fill={palette.ink}/><Line points={[[14,34],[30,34]]} stroke={'#925c4d'} lineWidth={3} lineCap={'round'}/>
  </Node>
  <Line ref={arm} points={[[54,-72],[94,-10],[102,66]]} stroke={coat} lineWidth={33} lineCap={'round'} lineJoin={'round'}/>
  <Circle ref={hand} x={102} y={66} size={31} fill={palette.skin}/>
 </Node>;
 return {node,root,head,arm,hand,leftLeg,rightLeg,leftShoe,rightShoe};
}
export function room(){return <Node>
 <Rect width={1500} height={2400} fill={palette.wall}/>
 <Rect x={-320} y={-420} width={350} height={480} radius={8} fill={'#acbdbb'} stroke={'#f6f0e4'} lineWidth={20}/>
 <Line points={[[-320,-660],[-320,-180]]} stroke={'#f6f0e4'} lineWidth={12}/>
 <Line points={[[-490,-420],[-150,-420]]} stroke={'#f6f0e4'} lineWidth={12}/>
 {[-450,-365,-270,-190].map((x,i)=><Line points={[[x,-580+i*30],[x-45,-450+i*30]]} stroke={'#dae4df'} lineWidth={5}/>)}
 <Rect x={285} y={-190} width={355} height={1070} radius={8} fill={'#879f9a'}/>
 <Rect x={285} y={-190} width={310} height={1020} fill={'#435c62'}/>
 <Rect y={715} width={1500} height={680} fill={'#c8b8a1'}/>
 <Line points={[[-750,375],[750,375]]} stroke={'#f4eddf'} lineWidth={14}/>
 <Line points={[[-750,520],[750,520]]} stroke={'#b9a88e'} lineWidth={3}/>
 </Node>}
