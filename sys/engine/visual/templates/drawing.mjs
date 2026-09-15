import {cueTime,resolveTrack,interpolate} from '../model.mjs';

export const drawingTracks=['x','y','scale','rotate','opacity'];
export function drawingState(d,t,timeline) {
 const state={x:0,y:0,scale:1,rotate:0,opacity:1};
 for(const key of drawingTracks) state[key]=interpolate(resolveTrack(d.animate?.[key]||[],timeline),t,d[key]??state[key]);
 state.visible=t>=cueTime(d.enter,timeline,-Infinity)&&t<cueTime(d.exit,timeline,Infinity)&&state.opacity>0;
 return state;
}
export function transformDrawingPoint(point,box,state) {
 const [x,y,w,h]=box,px=(point[0]/100-.5)*w*state.scale,py=(point[1]/100-.5)*h*state.scale;
 const c=Math.cos(state.rotate),s=Math.sin(state.rotate);
 return [x+w/2+state.x+px*c-py*s,y+h/2+state.y+px*s+py*c];
}
