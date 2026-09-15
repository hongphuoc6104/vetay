import fs from 'node:fs/promises';import {createReadStream} from 'node:fs';import path from 'node:path';import {createServer} from 'vite';
import {compileTemplates} from './templates/registry.mjs';
export async function startServer(root,projectFile,timelineFile){
 const project=compileTemplates(JSON.parse(await fs.readFile(projectFile,'utf8'))),timeline=JSON.parse(await fs.readFile(timelineFile,'utf8'));const brand=JSON.parse(await fs.readFile(path.join(root,'sys/templates/brand/themes.json'),'utf8'));const base=path.dirname(projectFile);
 const server=await createServer({configFile:false,root,cacheDir:path.join(root,'sys/cache/net-vite'),server:{host:'127.0.0.1',port:0,hmr:false,watch:null,fs:{allow:[root]}},plugins:[{name:'net-project',configureServer(s){s.middlewares.use(async(req,res,next)=>{try{
  const pathname=decodeURIComponent((req.url||'').split('?')[0]);
  if(pathname==='/__net/project'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({project,timeline,brand,assetBase:'/__net/assets/'}));return;}
  if(pathname==='/__net/audio'||pathname.startsWith('/__net/assets/')){const relative=pathname==='/__net/audio'?project.audioMaster:pathname.slice('/__net/assets/'.length);if(!relative){res.statusCode=404;res.end('No audio');return;}const target=path.resolve(base,relative);if(!target.startsWith(base+path.sep))throw Error('Asset outside project');const stat=await fs.stat(target);const ext=path.extname(target);res.setHeader('Content-Type',({'.wav':'audio/wav','.mp4':'video/mp4','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'}[ext])||'application/octet-stream');res.setHeader('Accept-Ranges','bytes');let start=0,end=stat.size-1;
  if(req.headers.range){const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);if(!m||(!m[1]&&!m[2])){res.statusCode=416;res.end();return;}if(m[1]){start=Number(m[1]);end=m[2]?Math.min(end,Number(m[2])):end;}else start=Math.max(0,stat.size-Number(m[2]));if(start>end||start>=stat.size){res.statusCode=416;res.setHeader('Content-Range',`bytes */${stat.size}`);res.end();return;}res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${stat.size}`);}
  res.setHeader('Content-Length',end-start+1);if(req.method==='HEAD'){res.end();return;}const stream=createReadStream(target,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);return;}
  next();
 }catch(e){res.statusCode=404;res.end(String(e));}});}}]});await server.listen();return {server,url:server.resolvedUrls.local[0]+'sys/engine/visual/index.html',project,timeline,brand};
}
