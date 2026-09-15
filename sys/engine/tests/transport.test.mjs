import test from 'node:test';import assert from 'node:assert/strict';
import {chunks,validSegment} from '../visual/transport.mjs';
import {collision,partialPath} from '../visual/templates/geometry.mjs';
import {validateTemplate,compileTemplates} from '../visual/templates/registry.mjs';
test('chunks cover non-frame-aligned scenes and preview exactly once',()=>{const c=chunks([{start:0,end:5.651427},{start:5.651427,end:30}],19,817);const frames=c.flatMap(c=>Array.from({length:c.last-c.first},(_,i)=>c.first+i));assert.deepEqual(frames,Array.from({length:798},(_,i)=>19+i));assert.ok(c.every(c=>c.last-c.first<=300));});
test('corrupt or absent cache is never reused',async()=>assert.equal(await validSegment(import.meta.filename,300),false));
test('pen avoids letters, except explicitly crossed target',()=>{const boxes=[{id:'wrong',x:20,y:20,w:100,h:40},{id:'right',x:20,y:100,w:100,h:40}];assert.equal(collision([[0,30],[130,30]],boxes,3),'wrong');assert.equal(collision([[0,30],[130,30]],boxes,3,'wrong'),null);assert.equal(collision([[0,110],[130,110]],boxes,3,'wrong'),'right');assert.equal(collision([[20,80],[120,80]],boxes,6),null);});
test('path progress follows distance and is deterministic',()=>{assert.deepEqual(partialPath([[0,0],[10,0],[10,30]],.5),[[0,0],[10,0],[10,10]]);});
test('template cannot smuggle arbitrary layout or strike correct text',()=>{assert.throws(()=>compileTemplates({scenes:[{template:{id:'cards',version:'1.0.0'},elements:[{}]}]}));assert.throws(()=>validateTemplate({id:'cards',version:'1.0.0',items:[{id:'a',text:'correct'}],annotations:[{kind:'strike',targetId:'a'}]}));assert.throws(()=>validateTemplate({id:'freehand',version:'1.0.0',drawings:[{path:'<script/>',box:[0,0,1,1]}]}));});
