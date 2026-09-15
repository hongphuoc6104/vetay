import {workspace} from './workspace.mjs';
/** Uniform affine fit for canonical drawings; font sizes are never scaled. */
export function fitDrawing(d,from,to){
 const result=structuredClone(d),scale=Math.min(to.width/from.width,to.height/from.height);
 const tx=to.x+(to.width-from.width*scale)/2-from.x*scale,ty=to.y+(to.height-from.height*scale)/2-from.y*scale;
 const [x,y,w,h]=d.box;result.box=[tx+x*scale,ty+y*scale,w*scale,h*scale];result.lineWidth=(d.lineWidth??6)*scale;
 for(const key of ['x','y']){if(d[key]!==undefined)result[key]=d[key]*scale;for(const k of result.animate?.[key]||[])k.value*=scale;}
 return result;
}
export function layoutVariants(project,selection){
 const layouts=selection==='both'?['drawing-first','classic']:[selection||project.layout||'classic'];
 if(layouts.some(x=>!['drawing-first','classic'].includes(x)))throw Error('Choose drawing-first, classic or both');
 return layouts.map(layout=>{
  const p=structuredClone(project),source=project.drawingCoordinateLayout||project.layout||'classic';
  if(source!==layout){
   if(p.scenes.some(s=>s.template?.id!=='freehand'))throw Error('Cross-layout export requires freehand scenes');
   const from=workspace(source),a=workspace(layout),to={...a,x:a.x+14,y:a.y+14,width:a.width-28,height:a.height-28};
   if(layout==='classic'&&p.scenes.some(s=>(s.template.items||[]).some(i=>!i.plain)))to.height=620;
   for(const [id,d] of Object.entries(p.drawingLibrary||{}))p.drawingLibrary[id]=fitDrawing(d,from,to);
   for(const s of p.scenes){
    s.template.drawings=(s.template.drawings||[]).map(d=>d.ref?d:fitDrawing(d,from,to));
    s.template.items=(s.template.items||[]).map((item,i)=>{
     const mapped={...item};
     if(item.plain){const k=Math.min(to.width/from.width,to.height/from.height);mapped.x=to.x+(to.width-from.width*k)/2+((item.x??150)-from.x)*k;mapped.y=to.y+(to.height-from.height*k)/2+((item.y??250)-from.y)*k;mapped.width=Math.min(item.width??760,to.x+to.width-mapped.x);return mapped;}
     delete mapped.x;delete mapped.y;delete mapped.width;
     if(layout==='drawing-first')Object.assign(mapped,{x:150,y:1460+i*64,width:760});
     return mapped;
    });
   }
  }
  p.layout=layout;p.drawingCoordinateLayout=layout;
  p.captionMode=layout==='drawing-first'?'sidecar':'burned-in';
  if(layout==='classic')for(const s of p.scenes){if(!s.title?.length)s.title=s.framedTitle||[p.title];s.label=s.label||'AI QUA NÉT VẼ';}
  return p;
 });
}
