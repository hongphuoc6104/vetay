import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {compileTemplates} from '../visual/templates/registry.mjs';
import {validateProject} from '../visual/model.mjs';
import {drawingState,transformDrawingPoint} from '../visual/templates/drawing.mjs';
import {workspaceCrop} from '../visual/workspace.mjs';
const brand=JSON.parse(await fs.readFile(new URL('../../templates/brand/themes.json',import.meta.url)));
const timeline={valid:true,targetSeconds:6,phrases:[{id:'a',start:0,end:1,speechStart:0,speechEnd:1,pauseAfter:{kind:'visual',seconds:3,reason:'Move the bridge',actionIds:['bridge']}},{id:'b',start:4,end:6,speechStart:4,speechEnd:6}]};
const project=()=>({stylePreset:'net-cinematic-v1',rendererVersion:'1.0.0',palette:'technology',layout:'drawing-first',captionMode:'sidecar',format:{width:1080,height:1920,fps:30},drawingLibrary:{bridge:{path:'M 0 0 L 100 100',box:[100,300,300,300],cue:0,seconds:1,animate:{x:[{at:{phrase:'a',edge:'speechEnd'},value:0},{at:{phrase:'b'},value:200}]}}},scenes:[0,3].map((start,i)=>({id:'s'+i,start,end:start+3,title:[],theme:'light',template:{id:'freehand',version:'1.0.0',items:[],drawings:[{ref:'bridge'}]}}))});
test('shared object retains absolute state through scene cuts and direct seeking',()=>{
 const p=compileTemplates(project());validateProject(p,timeline,brand);
 const first=p.scenes[0].elements[0].spec.drawings[0],second=p.scenes[1].elements[0].spec.drawings[0];
 assert.deepEqual(drawingState(first,3,timeline),drawingState(second,3,timeline));
 assert.equal(drawingState(second,4,timeline).x,200);
 assert.deepEqual(transformDrawingPoint([0,0],second.box,drawingState(second,4,timeline)),[300,300]);
 assert.equal(project().scenes[0].template.drawings[0].path,undefined);
});
test('visual pauses reject nonexistent and inactive actions',()=>{
 const p=project();p.drawingLibrary.bridge.animate={};assert.throws(()=>validateProject(compileTemplates(p),timeline,brand),/continuous drawing/);
 const t=structuredClone(timeline);t.phrases[0].pauseAfter.actionIds=['missing'];assert.throws(()=>validateProject(compileTemplates(project()),t,brand),/Unknown visual action/);
});
test('refs and tracks fail early instead of failing mid-render',()=>{
 const p=project();p.scenes[1].template.drawings=[{ref:'missing'}];assert.throws(()=>compileTemplates(p),/Unknown drawing ref/);
 const q=project();q.drawingLibrary.bridge.animate.x[1].at=0;assert.throws(()=>validateProject(compileTemplates(q),timeline,brand),/keyframes/);
});
test('drawing labels have small concurrent text budgets',()=>{
 const p=project();p.scenes[0].template.items=[{id:'long',text:'Một dòng có quá nhiều chữ'}];assert.throws(()=>validateProject(compileTemplates(p),timeline,brand),/1–4/);
 p.scenes[0].template.items=[0,1,2].map(i=>({id:String(i),text:'Nguồn',cue:0}));assert.throws(()=>validateProject(compileTemplates(p),timeline,brand),/At most two/);
});
test('layout crop excludes captions and expands to new drawing workspace',()=>{
 assert.equal(workspaceCrop(),'crop=920:1110:80:550');assert.equal(workspaceCrop('drawing-first'),'crop=920:1390:80:220');
});
test('new Adam timing moves anchored object motion',()=>{
 const d=project().drawingLibrary.bridge,t=structuredClone(timeline);t.phrases[0].speechEnd=2;t.phrases[1].speechStart=5;
 assert.equal(drawingState(d,2,t).x,0);assert.equal(drawingState(d,5,t).x,200);
});
test('scale/rotation use box center and enter/exit control object visibility',()=>{
 const d={box:[200,300,100,100],enter:1,exit:4,x:10,y:20,scale:2,rotate:Math.PI/2};
 assert.equal(drawingState(d,0,timeline).visible,false);assert.equal(drawingState(d,1,timeline).visible,true);assert.equal(drawingState(d,4,timeline).visible,false);
 const [x,y]=transformDrawingPoint([0,0],d.box,drawingState(d,2,timeline));assert(Math.abs(x-360)<1e-8);assert(Math.abs(y-270)<1e-8);
 assert.equal(drawingState({...d,opacity:0},2,timeline).visible,false);
});
import {drawingDuration} from '../visual/model.mjs';
import {fitDrawing,layoutVariants} from '../visual/layouts.mjs';
test('endCue follows measured audio and rejects ambiguous duration',()=>{
 const d={cue:{phrase:'a',edge:'speechEnd'},endCue:{phrase:'b'}};
 assert.equal(drawingDuration(d,timeline),3);const t=structuredClone(timeline);t.phrases[1].speechStart=5;assert.equal(drawingDuration(d,t),4);
 assert.throws(()=>drawingDuration({...d,seconds:3},timeline),/not both/);assert.throws(()=>drawingDuration({cue:3,endCue:2},timeline),/follow/);
});
test('layout fit scales positions, stroke and translations uniformly',()=>{
 const d={path:'M 0 0 L 100 100',box:[20,30,100,200],x:8,animate:{y:[{at:0,value:20},{at:1,value:40}]},lineWidth:8};
 const fitted=fitDrawing(d,{x:0,y:0,width:200,height:400},{x:100,y:100,width:100,height:200});
 assert.deepEqual(fitted.box,[110,115,50,100]);assert.equal(fitted.x,4);assert.equal(fitted.lineWidth,4);assert.equal(fitted.animate.y[1].value,20);assert.equal(d.lineWidth,8);
 const p=project();p.title='Ví dụ';const variants=layoutVariants(p,'both');assert.equal(variants.length,2);assert.equal(variants[0].captionMode,'sidecar');assert.equal(variants[1].captionMode,'burned-in');assert.equal(p.layout,'drawing-first');
});
test('classic drawing fit leaves space for separate label panels',()=>{
 const p=project();p.title='Nội dung';p.scenes[0].template.items=[{id:'note',text:'Một nhãn',cue:0}];
 const q=layoutVariants(p,'classic')[0],d=q.drawingLibrary.bridge;
 assert(d.box[1]+d.box[3]<1210);
 assert.equal(q.scenes[0].template.items[0].text,'Một nhãn');
});
