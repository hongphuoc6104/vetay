import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';import {startServer} from '../visual/server.mjs';
const root=path.resolve(import.meta.dirname,'../../..'),base=path.join(root,'sys/cache/drawing-browser');await fs.mkdir(base,{recursive:true});
const timeline={valid:true,targetSeconds:6,phrases:[{id:'a',start:0,end:1,speechStart:0,speechEnd:1,text:'Câu thứ nhất.',pauseAfter:{kind:'visual',reason:'Move the path',actionIds:['line']}},{id:'b',start:4,end:6,speechStart:4,speechEnd:6,text:'Câu thứ hai.'}]};
const project={stylePreset:'net-cinematic-v1',rendererVersion:'1.0.0',palette:'technology',layout:'drawing-first',captionMode:'sidecar',format:{width:1080,height:1920,fps:30},drawingLibrary:{line:{path:'M 0 0 L 100 100 M 0 100 L 100 0',box:[200,300,300,300],cue:0,seconds:1,animate:{x:[{at:1,value:0},{at:4,value:200}]}}},scenes:[0,3].map((start,i)=>({id:'s'+i,start,end:start+3,title:[],theme:'light',template:{id:'freehand',version:'1.0.0',items:[],drawings:[{ref:'line'}]}}))};
await fs.writeFile(base+'/timeline.json',JSON.stringify(timeline));await fs.writeFile(base+'/project.json',JSON.stringify(project));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const server=await startServer(root,base+'/project.json',base+'/timeline.json');
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(server.url);await page.waitForFunction(()=>window.filmReady);
 const sample=async t=>page.evaluate(async t=>{await window.renderFrame(t);const c=document.querySelector('#film');const mini=document.createElement('canvas');mini.width=1080;mini.height=180;mini.getContext('2d').drawImage(c,0,1690,1080,180,0,0,1080,180);return {drawing:window.netDiagnostics.template.drawings,caption:mini.toDataURL()};},t);
 const early=await sample(.2),complete=await sample(1);assert(early.drawing[0].progress<complete.drawing[0].progress);
 assert.equal(early.drawing[1].progress,0,'pen must lift before second subpath');
 const before=await sample(2.9667),after=await sample(3);assert(Math.abs(before.drawing[0].first[0]-after.drawing[0].first[0])<8,'no reset at scene cut');
 const seek=await sample(4.5);await sample(.2);assert.deepEqual((await sample(4.5)).drawing,seek.drawing,'direct seek is deterministic');
 assert.equal(early.caption,seek.caption,'sidecar mode must not burn different spoken captions into image');
 // The transformed stroke is checked in screen space, including newly available upper canvas.
 await page.evaluate(()=>{window.netModel.scenes[1].elements[0].spec.drawings[0].animate.x[1].value=1000;});
 await assert.rejects(()=>sample(4.5),/safe workspace/);
 assert(errors.length===0||errors.every(e=>e.includes('safe workspace')));
 await page.close();
 const collisionPage=await browser.newPage();await collisionPage.goto(server.url);await collisionPage.waitForFunction(()=>window.filmReady);
 await collisionPage.evaluate(()=>{const spec=window.netModel.scenes[1].elements[0].spec;spec.drawings[0].scale=1.2;spec.items=[{id:'protected',text:'Nguồn',x:500,y:425,width:350,cue:0}];});
 await assert.rejects(()=>collisionPage.evaluate(()=>window.renderFrame(4.5)),/overlaps protected text/);await collisionPage.close();
 console.log('PASS drawing progression, lifted paths, scene continuity, deterministic seek, sidecar captions and transformed safe area/collision');
}finally{await browser.close();await server.server.close();}
