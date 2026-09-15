import {Node, Rect, Circle, Line, Txt} from '@motion-canvas/2d';
import {createRef, tween} from '@motion-canvas/core';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const p=clamp(v);return p*p*(3-2*p);};

// Energy-flow diagram: moving arrowheads represent energy, never material particles.
export default function* (view:any,timeline:any) {
  view.fill('#081B28');
  const heading=createRef<Txt>(), subheading=createRef<Txt>(), temperatures=createRef<Node>();
  const fingers=[createRef<Node>(),createRef<Node>()];
  const skin=[createRef<Rect>(),createRef<Rect>()];
  const halos=[createRef<Circle>(),createRef<Circle>()];
  const conclusion=createRef<Node>(), flowGroup=createRef<Node>(), condition=createRef<Txt>();
  const warms=[createRef<Rect>(),createRef<Rect>()];
  const arrows:any[]=[];
  const xs=[-225,225];
  view.add(<Node>
    <Circle x={-410} y={-750} size={1150} fill={'#163D48'} opacity={.3}/>
    {Array.from({length:9},(_,x)=>Array.from({length:14},(_,y)=><Circle x={-448+x*112} y={-810+y*118} size={3} fill={'#315261'} opacity={.45}/>)).flat()}
    <Line points={[[-440,-795],[-350,-795]]} stroke={'#64DACB'} lineWidth={5}/>
    <Txt x={-100} y={-795} text={'KHOA HỌC GẦN MÌNH  /  01'} fontSize={23} letterSpacing={2} fill={'#88ADB8'}/>
    <Txt ref={heading} y={-680} text={'SAO KIM LOẠI LẠNH HƠN?'} fontSize={49} fontWeight={800} fill={'#F2F7F5'}/>
    <Txt ref={subheading} y={-600} text={'Một căn phòng. Hai cảm giác.'} fontSize={30} fill={'#A9C3CA'}/>
    {xs.map((x,i)=><Node x={x}>
      <Rect y={80} width={396} height={382} radius={29} fill={'#030F18'} opacity={.5}/>
      <Rect y={50} width={380} height={350} radius={23} fill={i===0?'#426779':'#855634'} stroke={i===0?'#A8CAD8':'#D8A774'} lineWidth={3}/>
      {i===0?<Node>
        <Rect x={-131} y={50} width={27} height={318} radius={9} fill={'#91B5C4'} opacity={.23}/>
        <Rect x={-82} y={50} width={7} height={318} radius={3} fill={'#BBD4DE'} opacity={.3}/>
        <Line points={[[100,-101],[162,-101],[162,175]]} radius={14} stroke={'#C5DCE4'} lineWidth={2} opacity={.5}/>
      </Node>:<Node>{Array.from({length:6},(_,j)=><Line points={[[-174,-88+j*52],[-95,-97+j*52],[-16,-76+j*52],[82,-83+j*52],[174,-93+j*52]]} stroke={'#CF9B68'} lineWidth={3} radius={30} opacity={.48}/>)}</Node>}
      <Rect ref={warms[i]} y={-102} width={170} height={40} radius={19} fill={'#FFBB72'} opacity={0}/>
      <Circle ref={halos[i]} y={-125} width={164} height={32} fill={'#FFBB72'} opacity={0}/>
      <Node ref={fingers[i]} y={-315}>
        <Rect ref={skin[i]} width={114} height={220} radius={57} fill={'#E6AB88'} stroke={'#FFDBB8'} lineWidth={3}/>
        <Rect y={-47} width={72} height={80} radius={30} fill={'#F9D9C1'} stroke={'#CD9276'} lineWidth={2}/>
        <Line points={[[-34,47],[0,52],[34,47]]} stroke={'#B47765'} lineWidth={2} radius={15} opacity={.55}/>
      </Node>
      <Txt y={281} text={i===0?'KIM LOẠI':'GỖ'} fontSize={32} fontWeight={800} letterSpacing={3} fill={i===0?'#ACD4E2':'#E3B98A'}/>
    </Node>)}
    <Node ref={temperatures} opacity={0}>
      {xs.map(x=><Node x={x} y={71}><Rect width={220} height={109} radius={20} fill={'#0A2533'} stroke={'#64DACB'} lineWidth={2}/><Txt text={'22 °C'} fontSize={54} fontWeight={700} fill={'#F2F7F5'}/></Node>)}
      <Txt y={-455} text={'NHIỆT ĐỘ BAN ĐẦU BẰNG NHAU'} fontSize={26} fill={'#64DACB'} letterSpacing={2}/>
    </Node>
    <Node ref={flowGroup} opacity={0}>
      {xs.flatMap((x,i)=>Array.from({length:i===0?6:2},(_,j)=>{
        const r=createRef<Line>(); arrows.push({r,side:i,index:j});
        return <Line ref={r} x={x+(j%2===0?-27:27)} points={[[0,-24],[0,19]]} stroke={'#FFE0A2'} lineWidth={5} endArrow arrowSize={11}/>;
      }))}
      <Txt x={-225} y={-470} text={'MẤT NHIỆT NHANH'} fontSize={26} fontWeight={700} fill={'#A8E0E6'}/>
      <Txt x={225} y={-470} text={'MẤT NHIỆT CHẬM HƠN'} fontSize={25} fontWeight={700} fill={'#F3C99E'}/>
    </Node>
    <Node ref={conclusion} y={400} opacity={0}>
      <Rect width={862} height={128} radius={23} fill={'#113440'} stroke={'#2D6970'} lineWidth={2}/>
      <Txt y={-24} text={'CÙNG NHIỆT ĐỘ'} fontSize={26} letterSpacing={3} fill={'#A9C3CA'}/>
      <Txt y={25} text={'KHÁC TỐC ĐỘ MẤT NHIỆT'} fontSize={35} fontWeight={800} fill={'#64DACB'}/>
    </Node>
    <Txt ref={condition} y={510} text={'Để đủ lâu trong cùng phòng • Số nhiệt độ minh họa'} fontSize={24} fill={'#8BA7B3'}/>
  </Node>);
  const scene=(id:string)=>timeline.scenes.find((s:any)=>s.id===id);
  const phase=(id:string,t:number)=>{const s=scene(id);return s?clamp((t-s.start)/s.duration):0;};
  const mechanism=scene('mechanism');
  const mechanismDuration=mechanism?.duration||timeline.duration*.26;
  yield* tween(timeline.duration,(v)=>{
    const t=v*timeline.duration;
    const eq=phase('equal',t), mech=phase('mechanism',t), feel=phase('feeling',t), end=phase('conclusion',t);
    const touch=smooth(mech/.19);
    fingers.forEach(r=>r().y(-315+80*touch)); // lower edge ends at material surface y=-125
    const flow=smooth((mech-.19)/.13);
    temperatures().opacity(smooth(eq/.17)*(1-smooth(mech/.12)));
    flowGroup().opacity(flow);
    const age=Math.max(0,t-(mechanism?.start||0)-.19*mechanismDuration);
    arrows.forEach(({r,side,index})=>{
      const period=side===0?mechanismDuration*.28:mechanismDuration*.68;
      const u=(age/period+index/(side===0?6:2))%1;
      r().y(-157+u*(side===0?331:118));
      r().opacity(Math.sin(Math.PI*u)*.95);
    });
    warms.forEach((r,i)=>{
      const depth=i===0?28+230*smooth((mech-.19)/.8):28+24*smooth((mech-.19)/.8);
      r().height(depth);r().y(-119+depth/2);r().opacity(flow*(i===0?.14:.28));
      halos[i]().opacity(flow*.5);
    });
    const cooling=smooth((mech-.24)/.76)*.55+smooth(feel/.55)*.45;
    const mix=(a:number,b:number)=>Math.round(a+(b-a)*cooling);
    skin[0]().fill(`rgb(${mix(230,140)},${mix(171,189)},${mix(136,205)})`);
    conclusion().opacity(smooth(end/.2));
    // Vietnamese headlines kept separate from narration to avoid subtitle duplication.
    heading().text(end>0?'LẠNH HƠN… KHI SỜ':feel>0?'DA ĐANG NGUỘI ĐI':mech>0?'NHIỆT ĐI TỪ TAY VÀO VẬT':eq>0?'CÙNG NHIỆT ĐỘ':'SAO KIM LOẠI LẠNH HƠN?');
    subheading().text(mech>0?'Tay ấm hơn hai vật ban đầu.':'Một căn phòng. Hai cảm giác.');
    condition().text(mech>0?'Mũi tên = dòng nhiệt • Màu sắc là mô hình minh họa':'Để đủ lâu trong cùng phòng • Số nhiệt độ minh họa');
  });
}
