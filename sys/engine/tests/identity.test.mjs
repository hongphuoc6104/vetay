import test from 'node:test';import assert from 'node:assert/strict';
import {keyword,bodyRange,captions,srt,readyOutro} from '../identity.mjs';
test('identity budget includes both wrappers and keyword stays short',()=>{
 assert.deepEqual(bodyRange(5),[158.5,173.5]);assert.equal(keyword(' Cửa sổ ngữ cảnh '),'Cửa sổ ngữ cảnh');assert.throws(()=>keyword('Một chủ đề có quá nhiều từ'),/1–4/);assert.throws(()=>keyword(''),/1–4/);
});
test('preview captions clip body ranges and offset outro exactly once',()=>{
 const body={targetSeconds:10,phrases:[{text:'A',speechStart:1,speechEnd:3},{text:'B',speechStart:8,speechEnd:10}]};
 const outro={targetSeconds:5,phrases:[{text:'Thích và theo dõi',speechStart:.8,speechEnd:2.5}]};
 const rows=captions([{timeline:body,offset:1.5,start:2,end:4},{timeline:body,offset:3.5,start:8,end:10},{timeline:outro,offset:5.5}]);
 assert.deepEqual(rows,[{text:'A',start:1.5,end:2.5},{text:'B',start:3.5,end:5.5},{text:'Thích và theo dõi',start:6.3,end:8}]);assert.match(srt(rows),/00:00:06,300 --> 00:00:08,000/);
});
test('bundled outro is complete, verified and ready without synthesizing Adam',async()=>{const m=await readyOutro();assert.equal(m.version,'map-v1');assert(m.seconds>=5);assert.equal(m.selection[0].candidates.length,2);});
