import fs from 'node:fs/promises';import path from 'node:path';import {neutralProject} from './neutral.mjs';
const root=path.resolve(import.meta.dirname,'../../..');const dir=path.join(root,'sys/work/neutral');await fs.mkdir(dir,{recursive:true});
const project=neutralProject();const timeline={valid:true,errors:[],targetSeconds:3,fps:30,phrases:[]};
await fs.writeFile(path.join(dir,'project.json'),JSON.stringify(project,null,2));await fs.writeFile(path.join(dir,'timeline.json'),JSON.stringify(timeline,null,2));
const frames=3*48000,bytes=Buffer.alloc(44+frames*2);bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(48000,24);bytes.writeUInt32LE(96000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(frames*2,40);await fs.writeFile(path.join(dir,'master.wav'),bytes);console.log(dir);
