export const PRESET='net-cinematic-v1';
export const VERSION='1.0.0';
export const DEFAULT_COVER_FRAME=15;
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
export function publicationMeta(project,timeline){
 const raw=project.publication||{};
 const totalFrames=Math.max(1,Math.ceil((timeline.targetSeconds||0)*30));
 const requested=Number.isInteger(raw.coverFrame)?raw.coverFrame:DEFAULT_COVER_FRAME;
 return {
  present:Object.keys(raw).length>0,
  title:raw.title||project.title||'',
  primaryKeyword:raw.primaryKeyword||'',
  seriesLabel:raw.seriesLabel||'',
  episode:raw.episode,
  coverFrame:Math.max(0,Math.min(totalFrames-1,requested)),
  requestedCoverFrame:requested,
  intro:raw.intro||{},
  outro:raw.outro||{},
  totalFrames
 };
}
export function publicationWarnings(project,timeline){
 const p=publicationMeta(project,timeline),warnings=[];
 if(!p.present){warnings.push('Project has no publication metadata; intro/outro contract is not enabled (legacy project).');return warnings;}
 if(!p.primaryKeyword)warnings.push('publication.primaryKeyword is missing; the intro cannot guarantee a searchable topic label.');
 if(!p.seriesLabel)warnings.push('publication.seriesLabel is missing; the intro will use the scene label.');
 if(p.requestedCoverFrame!==p.coverFrame)warnings.push(`publication.coverFrame ${p.requestedCoverFrame} was clamped to ${p.coverFrame} for this duration.`);
 if(p.intro.enabled!==true)warnings.push('publication.intro.enabled is not true; frame 0 will use the legacy title treatment.');
 if(p.outro.enabled!==true)warnings.push('publication.outro.enabled is not true; the final scene will use its legacy logo behavior.');
 return warnings;
}
export function validateProject(project,timeline,brand){
 if(project.stylePreset!==PRESET||project.rendererVersion!==VERSION)throw Error('Project must use '+PRESET+' / '+VERSION);
 if(!brand.palettes[project.palette])throw Error('Unknown palette');
 if(project.format?.width!==1080||project.format?.height!==1920||project.format?.fps!==30)throw Error('Preset requires 1080×1920 at 30fps');
 if(timeline.valid===false||timeline.errors?.length)throw Error('Fix timing errors before rendering');
 if(!project.scenes?.length)throw Error('Author scenes before rendering');
 const pub=project.publication;
 if(pub){
  if(pub.title!==undefined&&(typeof pub.title!=='string'||!pub.title.trim()||pub.title.length>120))throw Error('publication.title must be a 1–120 character string');
  if(pub.primaryKeyword!==undefined&&(typeof pub.primaryKeyword!=='string'||!pub.primaryKeyword.trim()||pub.primaryKeyword.length>60))throw Error('publication.primaryKeyword must be a 1–60 character string');
  if(pub.seriesLabel!==undefined&&(typeof pub.seriesLabel!=='string'||pub.seriesLabel.length>60))throw Error('publication.seriesLabel must be a string of at most 60 characters');
  if(!String(pub.title||'').trim())throw Error('Projects with publication metadata require publication.title');
  if(!String(pub.seriesLabel||'').trim())throw Error('Projects with publication metadata require publication.seriesLabel');
  if(pub.intro?.enabled!==true)throw Error('New projects with publication metadata require publication.intro.enabled=true');
  if(!String(pub.primaryKeyword||'').trim())throw Error('Enabled intro requires publication.primaryKeyword');
  if(pub.outro?.enabled!==true)throw Error('New projects with publication metadata require publication.outro.enabled=true');
  if(pub.episode!==undefined&&(!Number.isInteger(pub.episode)||pub.episode<1))throw Error('publication.episode must be a positive integer');
  if(pub.coverFrame!==undefined&&(!Number.isInteger(pub.coverFrame)||pub.coverFrame<0||pub.coverFrame>=Math.ceil(timeline.targetSeconds*30)))throw Error('publication.coverFrame must point to a frame inside the video');
  if(pub.outro?.enabled===true){
   if(!['scene','light','dark'].includes(pub.outro.avatarTheme||'scene'))throw Error('publication.outro.avatarTheme must be scene, light or dark');
   if(pub.outro.durationSec!==undefined&&(!Number.isFinite(pub.outro.durationSec)||pub.outro.durationSec<3||pub.outro.durationSec>6))throw Error('publication.outro.durationSec must be 3–6 seconds');
   if(pub.outro.takeaways!==undefined){if(!Array.isArray(pub.outro.takeaways)||pub.outro.takeaways.length>3)throw Error('publication.outro.takeaways accepts at most three items');for(const item of pub.outro.takeaways)if(typeof item!=='string'||!item.trim()||item.length>110)throw Error('Each outro takeaway must be a short non-empty string');}
  }
 }
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
