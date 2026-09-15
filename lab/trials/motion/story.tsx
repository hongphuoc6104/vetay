import {makeScene2D,Rect,Txt,Img,Line,Node} from '@motion-canvas/2d';
import {createRef,tween} from '@motion-canvas/core';
import episode from './benchmark.json';

// All coordinates correspond to the 1080x1920 Remotion composition.
// Rect children use its content centre; room SVG uses xMidYMid meet.
const ink='#173f46', accent='#e98653', font='DejaVu Sans';
export default makeScene2D(function* (view){
 view.fill('#f5efdf');
 for(const [i,s] of episode.scenes.entries()){
  const root=createRef<Node>(), actor=createRef<Img>(), prop=createRef<Img>();
  const actorBox=createRef<Node>(),propBox=createRef<Node>();
  const caption=createRef<Txt>(),bar=createRef<Rect>(),label=createRef<Txt>();
  const fit=(img:Img,w:number,h:number)=>{
   const size=img.naturalSize();
   const factor=Math.min(w/Math.max(1,size.x),h/Math.max(1,size.y));
   return [size.x*factor,size.y*factor] as [number,number];
  };
  view.add(<Node ref={root}>
   <Txt text={`${episode.series.toUpperCase()} · ${episode.episode||'01'}`} x={-476} y={-884} offset={[-1,-1]} fontSize={25} letterSpacing={5} fontWeight={700} fill={accent} fontFamily={font}/>
   <Txt text={s.heading} x={-476} y={-823} offset={[-1,-1]} width={921} fontSize={52} lineHeight={62.4} fontWeight={800} fill={ink} fontFamily={font} textWrap/>
   <Rect x={2} y={-113} width={956} height={1074} radius={42} fill={'#ffffff55'} stroke={'#173f4633'} lineWidth={2} clip>
    <Node x={0} y={0} scale={1070/1250} opacity={.21}>
     <Line points={[[-540,375],[540,375]]} stroke={ink} lineWidth={5}/>
     <Line points={[[-450,-625],[-450,375]]} stroke={ink} lineWidth={5}/>
     <Line points={[[450,-625],[450,375]]} stroke={ink} lineWidth={5}/>
     <Line points={[[-540,495],[540,495]]} stroke={ink} lineWidth={5}/>
     <Rect x={-255} y={-275} width={290} height={380} radius={5} stroke={ink} lineWidth={5}/>
     <Line points={[[-255,-465],[-255,-85]]} stroke={ink} lineWidth={5}/>
     <Line points={[[-400,-275],[-110,-275]]} stroke={ink} lineWidth={5}/>
     <Line points={[[170,225],[170,-5],[380,-5],[380,225]]} stroke={ink} lineWidth={5}/>
     <Line points={[[140,225],[420,225]]} stroke={ink} lineWidth={5}/>
     <Line points={[[160,225],[160,375]]} stroke={ink} lineWidth={5}/>
     <Line points={[[400,225],[400,375]]} stroke={ink} lineWidth={5}/>
    </Node>
    <Node ref={actorBox} x={-221} y={160}>
     <Img ref={actor} src={'/'+s.actorSrc} size={()=>fit(actor(),450,660)}/>
    </Node>
    <Node ref={propBox} x={251} y={-225}>
     <Img ref={prop} src={'/'+s.propSrc} size={()=>fit(prop(),320,340)}/>
    </Node>
    <Txt ref={label} text={s.label} x={0} y={495} offset={[0,1]} width={882} textWrap fontSize={43} lineHeight={51.6} fontWeight={800} fill={accent} fontFamily={font} textAlign={'center'}/>
   </Rect>
   <Txt ref={caption} x={-465} y={490} offset={[-1,-1]} width={885} textWrap fontSize={48} lineHeight={64.8} fontWeight={700} fill={ink} fontFamily={font} textAlign={'center'}/>
   <Rect x={-475} y={792.5} offset={[-1,0]} width={915} height={7} fill={'#173f4622'}/>
   <Rect ref={bar} x={-475} y={792.5} offset={[-1,0]} width={0} height={7} fill={accent}/>
   <Txt text={'Truyện hư cấu · Video Lab'} x={-475} y={873} offset={[-1,0]} fontSize={22} fill={ink} opacity={.65} fontFamily={font}/>
   <Txt text={`${String(i+1).padStart(2,'0')} / ${String(episode.scenes.length).padStart(2,'0')}`} x={440} y={873} offset={[1,0]} fontSize={22} fill={ink} opacity={.65} fontFamily={font}/>
  </Node>);
  yield* tween(s.frames/30,v=>{
   const f=v*s.frames,reveal=Math.min(1,f/25);
   actorBox().position([-221+(1-reveal)*-100,160+Math.sin(f/45)*8]);
   actorBox().scale(1+f/s.frames*.025);
   propBox().rotation(Math.sin(f/40)*3);propBox().scale(.9+reveal*.1);propBox().opacity(reveal);
   label().opacity(reveal);bar().width(915*(i+f/s.frames)/episode.scenes.length);
   caption().text(s.captions.find(c=>f/30>=c.start&&f/30<c.end)?.text||'');
  });
  root().remove();
 }
});
