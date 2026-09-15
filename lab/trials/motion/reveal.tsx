import {makeScene2D,Line,Txt} from '@motion-canvas/2d';
import {createRef,all,waitFor} from '@motion-canvas/core';
export default makeScene2D(function* (view){
 view.fill('#f6f0dd'); const line=createRef<Line>();
 view.add(<Txt text={'Manh mối xuất hiện từng nét'} y={-620} fontSize={48} fill={'#302c48'} fontFamily={'DejaVu Sans'}/>);
 view.add(<Line ref={line} points={[[-220,240],[-220,-180],[170,-180],[170,240],[-220,240],[-220,-180],[-140,-210],[240,-210],[240,210],[170,240]]} stroke={'#dd665b'} lineWidth={12} end={0}/>);
 yield* line().end(1,7);view.add(<Txt text={'Ngày mai chưa được viết.'} y={520} fontSize={48} fill={'#302c48'}/>);yield* waitFor(3);
});
