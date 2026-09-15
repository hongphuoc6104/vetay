import {Node,Rect,Circle,Line,Txt} from '@motion-canvas/2d';
import {createRef,tween} from '@motion-canvas/core';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export default function*(view:any,timeline:any){
 view.fill('#071523');
 const world=createRef<Node>(),cone=createRef<Node>(),label=createRef<Txt>(),focus=createRef<Circle>(),arrow=createRef<Line>();
 const dots:any[]=[];const centers:any[]=[];
 view.add(<Node ref={world}>
  <Circle x={-390} y={-220} size={1100} fill={'#14384b'} opacity={.28}/>
  {Array.from({length:16},(_,i)=><Line points={[[-600,-800+i*100],[600,-800+i*100]]} stroke={'#183041'} lineWidth={1}/>)}
  <Txt y={-700} text={'BÊN TRONG ÂM THANH'} fontSize={26} letterSpacing={5} fill={'#7299a9'}/>
  <Txt y={-605} text={'KHÔNG KHÍ CÓ BAY ĐI?'} fontSize={47} fontWeight={800} fill={'#eff9fc'}/>
  <Rect x={-385} y={-110} width={215} height={490} radius={32} fill={'#172b39'} stroke={'#668799'} lineWidth={4}/>
  <Rect x={-399} y={-110} width={128} height={394} radius={17} fill={'#08121e'} stroke={'#314d5c'} lineWidth={3}/>
  <Rect x={-380} y={-110} width={60} height={136} radius={8} fill={'#bf7e3f'}/>
  <Node ref={cone} x={-320} y={-110}>
   <Line points={[[-45,-55],[15,-190],[38,-190],[0,-48],[0,48],[38,190],[15,190],[-45,55]]} closed fill={'#829da5'} stroke={'#c6dde0'} lineWidth={3}/>
   <Line points={[[17,-186],[17,186]]} stroke={'#36d6e3'} lineWidth={8}/>
   <Circle x={-30} y={0} width={38} height={92} fill={'#d5e4e8'}/>
  </Node>
  <Line points={[[-262,-342],[465,-342],[465,132],[-262,132]]} stroke={'#255064'} lineWidth={2} radius={15}/>
  {Array.from({length:22},(_,col)=>col).flatMap(col=>Array.from({length:9},(_,row)=>{
    const ref=createRef<Circle>();dots.push(ref);centers.push([-236+col*32,-294+row*46]);
    return <Circle ref={ref} x={-236+col*32} y={-294+row*46} size={col===10&&row===4?17:9} fill={col===10&&row===4?'#ffd073':'#63d5e3'}/>;
  }))}
  <Circle ref={focus} x={84} y={-110} width={84} height={55} stroke={'#ffd073'} lineWidth={2} lineDash={[4,6]} opacity={0}/>
  <Line ref={arrow} points={[[-190,210],[395,210]]} stroke={'#e5a957'} lineWidth={5} endArrow arrowSize={15} opacity={0}/>
  <Txt ref={label} y={335} fontSize={37} fontWeight={700} fill={'#e9f4f7'} text={'MÀNG LOA RUNG'}/>
  <Txt y={418} text={'Sơ đồ nguyên lý • Chuyển động được làm chậm'} fontSize={22} fill={'#7295a6'}/>
  <Line points={[[-430,475],[430,475]]} stroke={'#284554'} lineWidth={2}/>
 </Node>);
 const phase=(id:string,t:number)=>{const s=timeline.scenes.find((s:any)=>s.id===id);return s?clamp((t-s.start)/s.duration):0};
 yield* tween(timeline.duration,(v)=>{
   const t=v*timeline.duration;const f=phase('particle',t),last=phase('wave',t);const amp=16;const wt=t*3.5;
   cone().x(-320+amp*Math.sin(-wt-236*2*Math.PI/220));
   dots.forEach((r,i)=>{const [x,y]=centers[i];r().x(x+amp*Math.sin(x*2*Math.PI/220-wt));r().opacity(f>0&&last===0?(i===94?1:.45):.85);});
   focus().opacity(f>0?1:0);arrow().opacity(last>0?1:0);
   label().text(last>0?'SÓNG TRUYỀN ĐI →':f>0?'HẠT DAO ĐỘNG TẠI CHỖ ↔':phase('rare',t)>0?'NÉN • GIÃN • NÉN • GIÃN':phase('compress',t)>0?'VÙNG KHÍ NÉN TRUYỀN ĐI':'MÀNG LOA RUNG');
 });
}
