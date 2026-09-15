import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../../..');
test('topic scaffold is drawing-only and independent of caller working directory',async()=>{
 const slug='scaffold-test-'+process.pid,dir=path.join(root,'sys/work',slug);
 try {
  const r=spawnSync(process.execPath,[path.join(root,'sys/engine/studio.mjs'),'new-video-from-topic','--slug',slug,'--topic','Đặt sách vào túi'],{cwd:'/tmp',encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);
  const p=JSON.parse(await fs.readFile(path.join(dir,'project.json'))),n=JSON.parse(await fs.readFile(path.join(dir,'narration.json')));
  assert.equal(p.layout,'drawing-first');assert.equal(p.captionMode,'sidecar');assert.equal(p.scenes[0].template.id,'freehand');assert.equal(p.outputLayouts,undefined);assert.equal(p.publication,undefined);assert.deepEqual(n.durationRange,[165,180]);assert.equal(p.approved,false);
  const rejected=spawnSync(process.execPath,[path.join(root,'sys/engine/studio.mjs'),'render','--slug',slug,'--layout','both'],{encoding:'utf8'});
  assert.notEqual(rejected.status,0);assert.match(rejected.stderr,/drawing-first only/);
 } finally {await fs.rm(dir,{recursive:true,force:true});}
});
