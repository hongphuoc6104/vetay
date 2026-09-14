import fs from 'node:fs/promises';import path from 'node:path';import {createServer} from 'vite';
export async function startServer(root,projectFile,timelineFile){
 const project=JSON.parse(await fs.readFile(projectFile,'utf8')),timeline=JSON.parse(await fs.readFile(timelineFile,'utf8'));const brand=JSON.parse(await fs.readFile(path.join(root,'sys/templates/brand/themes.json'),'utf8'));const base=path.dirname(projectFile);
 const server=await createServer({configFile:false,root,cacheDir:path.join(root,'sys/cache/net-vite'),server:{host:'127.0.0.1',port:0,hmr:false,fs:{allow:[root]}},plugins:[{name:'net-project',configureServer(s){s.middlewares.use(async(req,res,next)=>{try{
  const pathname=decodeURIComponent((req.url||'').split('?')[0]);
  if(pathname==='/__net/project'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({project,timeline,brand,assetBase:'/__net/assets/'}));return;}
  if(pathname==='/__net/audio'||pathname.startsWith('/__net/assets/')){const relative=pathname==='/__net/audio'?project.audioMaster:pathname.slice('/__net/assets/'.length);if(!relative){res.statusCode=404;res.end('No audio');return;}const target=path.resolve(base,relative);if(!target.startsWith(base+path.sep))throw Error('Asset outside project');const bytes=await fs.readFile(target);const ext=path.extname(target);res.setHeader('Content-Type',({'.wav':'audio/wav','.mp4':'video/mp4','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'}[ext])||'application/octet-stream');res.end(bytes);return;}
  next();
 }catch(e){res.statusCode=404;res.end(String(e));}});}}]});await server.listen();return {server,url:server.resolvedUrls.local[0]+'sys/engine/visual/index.html',project,timeline,brand};
}
