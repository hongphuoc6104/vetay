export function workspace(layout) {
 return layout === 'drawing-first'
  ? {x:80,y:220,width:920,height:1390}
  : {x:80,y:550,width:920,height:1110};
}
export function workspaceCrop(layout) {
 const {x,y,width,height}=workspace(layout);
 return `crop=${width}:${height}:${x}:${y}`;
}
