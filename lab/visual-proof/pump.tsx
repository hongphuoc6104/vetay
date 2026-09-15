import {makeScene2D, Node, Rect, Circle, Line, Txt, Gradient} from '@motion-canvas/2d';
import {createRef, tween} from '@motion-canvas/core';

// Original 2D cutaway. Two explicit check valves make this a schematic pump,
// not a claim that every bicycle pump has this exact intake construction.
const cyan='#64e7ef', amber='#ffc16b', white='#e8f4f6', navy='#071722';
const font='DejaVu Sans';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{v=clamp(v); return v*v*(3-2*v);};
const lerp=(a:number,b:number,p:number)=>a+(b-a)*p;
const metal=new Gradient({from:[-120,0],to:[120,0],stops:[{offset:0,color:'#55727d'},{offset:.18,color:'#edf4f3'},{offset:.36,color:'#89a5ad'},{offset:.7,color:'#c6d9dc'},{offset:1,color:'#405d6b'}]});
const chamber=new Gradient({from:[0,-300],to:[0,360],stops:[{offset:0,color:'#102c3c'},{offset:1,color:'#16414d'}]});

export default makeScene2D(function* (view) {
 view.fill(navy);
 const world=createRef<Node>(), piston=createRef<Node>(), skin=createRef<Node>();
 const inlet=createRef<Node>(), outlet=createRef<Node>(), pressure=createRef<Rect>();
 const stage=createRef<Txt>(), detail=createRef<Txt>(), valveNote=createRef<Node>();
 const stageNumber=createRef<Txt>(), phaseLine=createRef<Rect>(), cutLine=createRef<Line>();
 const gas:Circle[]=[], incoming:Circle[]=[], outgoing:Circle[]=[];
 // Subtle engineering paper, with a warm/cool pool behind the machine.
 view.add(<Circle x={-130} y={-40} size={1150} fill={new Gradient({type:'radial',fromRadius:0,toRadius:600,stops:[{offset:0,color:'#15405077'},{offset:1,color:'#07172200'}]})}/>);
 for(let x=-480;x<=480;x+=80) view.add(<Line points={[[x,-630],[x,530]]} stroke={'#294552'} opacity={.15} lineWidth={1}/>);
 for(let y=-630;y<=530;y+=80) view.add(<Line points={[[-480,y],[480,y]]} stroke={'#294552'} opacity={.15} lineWidth={1}/>);
 view.add(<>
  <Txt x={-450} y={-824} offset={[-1,0]} text={'CƠ CHẾ / 01'} fontFamily={font} fontSize={25} letterSpacing={6} fill={cyan}/>
  <Txt ref={stageNumber} x={450} y={-824} offset={[1,0]} text={'22 GIÂY'} fontFamily={font} fontSize={23} fill={'#7798a7'}/>
  <Line points={[[-450,-780],[450,-780]]} stroke={'#294755'} lineWidth={2}/>
  <Txt ref={stage} x={0} y={-697} text={'KHÍ ĐI MỘT CHIỀU'} fontFamily={font} fontSize={51} fontWeight={700} fill={white}/>
  <Txt ref={detail} x={0} y={-637} text={'Bên trong một chiếc bơm'} fontFamily={font} fontSize={26} fill={'#89a7b3'}/>
  <Rect ref={phaseLine} x={-450} y={-583} offset={[-1,0]} width={0} height={3} fill={cyan}/>
 </>);
 view.add(<Node ref={world} x={-90} y={-25}>
  {/* Ground and rear engineering datum. */}
  <Circle x={60} y={425} width={690} height={65} fill={'#020b12'} opacity={.7}/>
  <Line points={[[-340,395],[540,395]]} stroke={'#30515e'} lineWidth={2}/>
  <Line points={[[0,-480],[0,395]]} stroke={'#65808d'} lineDash={[7,12]} lineWidth={1} opacity={.4}/>
  {/* Wheel remains physically unchanged during a single pump stroke. */}
  <Node x={360} y={230}>
   <Circle size={302} fill={'#05101a'} stroke={'#60727b'} lineWidth={5}/>
   <Circle size={262} stroke={'#bdced1'} lineWidth={6}/>
   <Circle size={241} stroke={'#243f4a'} lineWidth={2}/>
   {Array.from({length:16},(_,i)=>{
    const a=i*Math.PI/8; return <Line points={[[0,0],[Math.cos(a)*127,Math.sin(a)*127]]} stroke={'#5b7782'} lineWidth={2}/>;
   })}
   <Circle size={29} fill={metal} stroke={white} lineWidth={2}/>
   <Rect x={-129} y={0} width={30} height={15} radius={3} fill={amber}/>
  </Node>
  {/* Hose below chamber, to wheel valve. */}
  <Line points={[[127,316],[173,316],[173,450],[210,450],[210,230],[229,230]]} radius={25} stroke={'#020a10'} lineWidth={25}/>
  <Line points={[[127,316],[173,316],[173,450],[210,450],[210,230],[229,230]]} radius={25} stroke={'#476675'} lineWidth={14}/>
  <Line points={[[127,316],[173,316],[173,450],[210,450],[210,230],[229,230]]} radius={25} stroke={'#173747'} lineWidth={7}/>
  {/* Intake duct intentionally placed below the lowest piston position. */}
  <Rect x={-187} y={300} width={154} height={48} radius={12} fill={'#45626e'} stroke={'#a9c3cb'} lineWidth={2}/>
  <Rect x={-187} y={300} width={154} height={24} fill={'#071a26'}/>
  <Rect x={-260} y={300} width={16} height={63} radius={4} fill={metal}/>
  {/* Cutaway body, with real wall thickness and a dark upper chamber. */}
  <Rect y={30} width={258} height={680} radius={29} fill={metal} stroke={'#d6e5e7'} lineWidth={2}/>
  <Rect y={27} width={218} height={636} radius={14} fill={chamber}/>
  <Rect y={342} width={218} height={18} fill={'#486977'}/>
  <Line points={[[-105,-283],[-105,325]]} stroke={'#c4e3e7'} lineWidth={2} opacity={.3}/>
  {/* Gas stays below the moving piston and above the cylinder floor. */}
  {Array.from({length:48},(_,i)=>{
   const ref=createRef<Circle>();
   const node=<Circle ref={ref} size={7+(i%3)} fill={cyan} shadowColor={'#4ddddc88'} shadowBlur={7}/>;
   gas.push(ref()); return node;
  })}
  {/* Piston, rod, and handle move as one rigid assembly. */}
  <Node ref={piston} y={-120}>
   <Rect y={-300} width={28} height={600} fill={metal} stroke={'#d4e8eb'} lineWidth={1}/>
   <Rect y={-600} width={285} height={48} radius={17} fill={'#18313f'} stroke={'#98b1bc'} lineWidth={3}/>
   <Line points={[[-117,-609],[117,-609]]} stroke={'#def0f2'} lineWidth={3} opacity={.4}/>
   <Rect width={214} height={33} radius={7} fill={metal} stroke={white} lineWidth={2}/>
   <Rect y={17} width={216} height={9} radius={3} fill={amber}/>
   <Rect y={-17} width={216} height={7} radius={3} fill={'#112535'}/>
  </Node>
  <Rect x={0} y={-303} width={279} height={24} radius={7} fill={metal}/>
  <Rect x={0} y={383} width={358} height={29} radius={9} fill={'#1d3645'} stroke={'#738e98'} lineWidth={2}/>
  <Rect x={-120} y={300} width={40} height={24} fill={'#071a26'}/><Rect x={116} y={316} width={35} height={24} fill={'#173747'}/>
  {/* Check valves pivot out of the flow and close against a visible seat. */}
  <Rect x={-152} y={300} width={12} height={45} fill={'#8da8b3'}/>
  <Node ref={inlet} x={-146} y={284}>
   <Line points={[[0,0],[0,31]]} stroke={amber} lineWidth={7} lineCap={'round'}/>
   <Circle size={9} fill={white}/>
  </Node>
  <Rect x={128} y={316} width={48} height={46} radius={7} fill={'#193a47'} stroke={'#b8cbd0'} lineWidth={2}/>
  <Rect x={119} y={316} width={6} height={36} fill={'#708d99'}/>
  <Node ref={outlet} x={123} y={301}>
   <Line points={[[0,0],[0,30]]} stroke={amber} lineWidth={7} lineCap={'round'}/>
   <Circle size={8} fill={white}/>
  </Node>
  {/* Supply and discharge dots are separate, time-gated streams. */}
  {Array.from({length:9},()=>{const ref=createRef<Circle>();const n=<Circle ref={ref} size={7} fill={cyan}/>;incoming.push(ref());return n;})}
  {Array.from({length:16},()=>{const ref=createRef<Circle>();const n=<Circle ref={ref} size={7} fill={cyan}/>;outgoing.push(ref());return n;})}
  {/* Pressure is qualitative, never an invented quantitative reading. */}
  <Rect x={161} y={-102} width={13} height={233} radius={6} fill={'#294b58'}/>
  <Rect ref={pressure} x={161} y={14} offset={[0,1]} width={13} height={28} radius={6} fill={amber}/>
  {[0,1,2,3,4].map(i=><Line points={[[177,-216+i*58],[187,-216+i*58]]} stroke={'#93acb5'} lineWidth={2}/>)}
  {/* Exterior shell peels off only once to expose the cutaway. */}
  <Node ref={skin}>
   <Rect y={27} width={249} height={645} radius={22} fill={metal} stroke={'#d1e1e3'} lineWidth={2}/>
   <Rect x={-85} y={25} width={6} height={570} radius={3} fill={'#e8f9fb'} opacity={.65}/>
   <Txt y={30} text={'AIR'} rotation={-90} fontFamily={font} fontSize={39} letterSpacing={12} fontWeight={700} fill={'#16323f'}/>
  </Node>
  <Line ref={cutLine} points={[[-110,-293],[-110,342]]} stroke={cyan} lineWidth={3} opacity={0}/>
  <Node ref={valveNote} opacity={0}>
   <Line points={[[134,317],[253,112],[362,112]]} stroke={amber} lineWidth={2}/>
   <Circle x={134} y={317} size={68} stroke={amber} lineWidth={2}/>
   <Txt x={278} y={78} text={'VAN MỘT CHIỀU'} fontFamily={font} fontSize={20} fontWeight={700} fill={amber}/>
  </Node>
 </Node>);
 view.add(<>
  <Txt x={-446} y={490} offset={[-1,0]} text={'SƠ ĐỒ NGUYÊN LÝ'} fontFamily={font} fontSize={20} letterSpacing={3} fill={'#91aeb9'}/>
  <Txt x={446} y={490} offset={[1,0]} text={'HÚT → NÉN → ĐẨY'} fontFamily={font} fontSize={21} fill={cyan}/>
 </>);
 const hose:[[number,number],...Array<[number,number]>]=[[136,316],[173,316],[173,450],[210,450],[210,230],[229,230]];
 const lengths=hose.slice(1).map((p,i)=>Math.hypot(p[0]-hose[i][0],p[1]-hose[i][1]));
 const total=lengths.reduce((a,b)=>a+b,0);
 const route=(p:number):[number,number]=>{let d=p*total;for(let i=0;i<lengths.length;i++){if(d<=lengths[i])return [lerp(hose[i][0],hose[i+1][0],d/lengths[i]),lerp(hose[i][1],hose[i+1][1],d/lengths[i])];d-=lengths[i];}return hose[hose.length-1];};
 yield* tween(22,value=>{
  const t=value*22;
  let py=-90;
  if(t<1.4) py=lerp(-90,185,ease(t/1.4));
  else if(t<3) py=185;
  else if(t<7) py=lerp(185,-205,ease((t-3)/4));
  else if(t<12) py=lerp(-205,170,ease((t-7)/5));
  else if(t<16) py=lerp(170,249,ease((t-12)/4));
  else if(t<20) py=lerp(249,-130,ease((t-16)/4));
  else py=-130;
  piston().y(py);
  const reveal=ease((t-1.6)/1.2);
  skin().x(reveal*-145);skin().opacity(1-reveal);
  cutLine().opacity(Math.sin(reveal*Math.PI));
  const intake=t>=3&&t<7||t>=16&&t<20;
  const pushing=t>=12&&t<16;
  inlet().rotation(intake?-63:0);
  outlet().rotation(pushing?-63:0);
  const top=py+32, bottom=329;
  for(let i=0;i<gas.length;i++){
   // Fixed particle diameter; density increases only by reducing available volume.
   const u=((i*0.61803398875)%1), v=((i*0.41421356237)%1);
   gas[i].position([-96+u*192+Math.sin(t*2+i)*2,top+8+v*Math.max(1,bottom-top-16)+Math.sin(t*2.3+i*.7)*2]);
   gas[i].opacity(reveal*(.64+(i%3)*.13));
  }
  incoming.forEach((dot,i)=>{
   const u=(t*.7+i/9)%1;
   dot.position([lerp(-340,-110,u),300+Math.sin(i*7)*5]);
   dot.opacity(intake?Math.min(1,u*6):0);
  });
  outgoing.forEach((dot,i)=>{
   const u=(t*.34+i/16)%1;
   dot.position(route(u)); dot.opacity(pushing?1:0);
  });
  pressure().height(t<7?25:t<12?lerp(25,211,ease((t-7)/5)):t<16?211:t<20?lerp(211,25,ease((t-16)/1.3)):25);
  const closeFocus=ease((t-15.8)/1.0)*(1-ease((t-19.4)/1.0));
  // Mild camera movement preserves the entire mechanism and readable captions.
  world().scale(lerp(.80,.84,reveal)+closeFocus*.02);
  world().x(-90-closeFocus*42);
  world().y(95-closeFocus*10);
  valveNote().opacity(closeFocus);
  stage().text(t<3?'KHÍ ĐI MỘT CHIỀU':t<7?'01 / HÚT KHÍ':t<12?'02 / NÉN KHÍ':t<16?'03 / ĐẨY VÀO LỐP':t<20?'KHÓA ĐƯỜNG QUAY LẠI':'HÚT. NÉN. ĐẨY.');
  detail().text(t<3?'Bên trong một chiếc bơm':t<7?'Piston đi lên · khoang khí mở rộng':t<12?'Cùng lượng khí · khoang nhỏ hơn':t<16?'Áp suất đủ lớn → van đầu ra mở':t<20?'Piston kéo lên · van đầu ra đóng':'Một chu kỳ. Một chiều chuyển động.');
  phaseLine().width(900*clamp(t/22));
  stageNumber().text(`${Math.min(22,Math.floor(t)).toString().padStart(2,'0')} / 22`);
 });
});
