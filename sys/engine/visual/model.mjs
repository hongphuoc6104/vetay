export const PRESET='net-cinematic-v1';
export const VERSION='1.0.0';
export function cueTime(value, timeline, fallback=0){
 if(value===undefined)return fallback;
 if(typeof value==='number'&&Number.isFinite(value))return value;
 const phrase=timeline.phrases.find(p=>p.id===value?.phrase);
 if(!phrase)throw Error('Unknown phrase cue: '+JSON.stringify(value));
 const edge=value.edge||'speechStart';
 if(!['start','end','speechStart','speechEnd'].includes(edge))throw Error('Invalid cue edge');
 return phrase[edge]+(value.offset||0);
}
export function resolveScene(scene,project,timeline){
 const start=cueTime(scene.start,timeline),end=cueTime(scene.end,timeline,timeline.targetSeconds);
 const theme=scene.theme&&scene.theme!=='auto'?scene.theme:project.theme&&project.theme!=='auto'?project.theme:['hook','chapter','recap'].includes(scene.role)?'dark':'light';
 return {...scene,start,end,theme};
}
export function resolveTrack(track,timeline){return track.map(k=>({...k,at:cueTime(k.at,timeline)}));}
export function interpolate(track,t,base){
 if(!track?.length)return base;
 if(t<=track[0].at)return track[0].value;
 for(let i=1;i<track.length;i++)if(t<=track[i].at){const a=track[i-1],b=track[i];let p=Math.max(0,Math.min(1,(t-a.at)/(b.at-a.at)));if(b.ease!=='linear')p=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;return a.value+(b.value-a.value)*p;}
 return track.at(-1).value;
}
export function validateProject(project,timeline,brand){
 if(project.stylePreset!==PRESET||project.rendererVersion!==VERSION)throw Error('Project must use '+PRESET+' / '+VERSION);
 if(!brand.palettes[project.palette])throw Error('Unknown palette');
 if(project.format?.width!==1080||project.format?.height!==1920||project.format?.fps!==30)throw Error('Preset requires 1080×1920 at 30fps');
 if(timeline.valid===false||timeline.errors?.length)throw Error('Fix timing errors before rendering');
 if(!project.scenes?.length)throw Error('Author scenes before rendering');
 const scenes=project.scenes.map(s=>resolveScene(s,project,timeline));let end=0;const ids=new Set();
 for(const s of scenes){
  if(ids.has(s.id)||!s.id)throw Error('Unique scene ids required');ids.add(s.id);
  if(Math.abs(s.start-end)>1/30||s.end<=s.start)throw Error('Scenes must cover the timeline without gaps or overlaps');end=s.end;
  if(!['light','dark'].includes(s.theme))throw Error('Unresolved scene theme');
  if(!Array.isArray(s.title)||s.title.length>2)throw Error('Use at most two authored title lines');
  const descend=es=>es.flatMap(e=>[e,...descend(e.children||[])]);
  for(const e of descend(s.elements||[])){
   if(!['text','panel','image','video','stroke','ellipse','list','projection','group','template'].includes(e.type))throw Error('Unknown component '+e.type);
   if(e.fontSize!==undefined&&e.fontSize<(e.secondary?28:40))throw Error('Text is too small: '+e.id);
   if(e.type==='projection'&&!e.id)throw Error('Projection needs a stable id');
   for(const track of Object.values(e.animate||{})){const keys=resolveTrack(track,timeline);if(keys.some((x,i)=>i&&x.at<=keys[i-1].at))throw Error('Keyframes must increase');}
   for(const color of ['color','fill','border'])if(e[color]&&e[color]!=='none'&&!['foreground','accent'].includes(e[color])&&!Object.hasOwn({...brand.shared,...brand.palettes[project.palette]},e[color]))throw Error('Use brand color tokens: '+e[color]);
  }
 }
 if(Math.abs(end-timeline.targetSeconds)>1/30)throw Error('Scene coverage does not match target duration');
 return scenes;
}
