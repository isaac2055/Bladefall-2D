// tiny local dev server (no deps)
import {createServer} from 'http';
import {readFile} from 'fs/promises';
import {dirname, extname, resolve, sep} from 'path';
import {fileURLToPath} from 'url';
const ROOT=dirname(fileURLToPath(import.meta.url));
const PORT=Number.parseInt(process.env.PORT||'8371',10);
const MIME={'.html':'text/html','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
createServer(async (req,res)=>{
  const p=req.url==='/'?'/index.html':req.url.split('?')[0];
  try{
    const target=resolve(ROOT,'.'+decodeURIComponent(p));
    if(target!==ROOT&&!target.startsWith(ROOT+sep))throw new Error('invalid path');
    const data=await readFile(target);
    res.writeHead(200,{'Content-Type':MIME[extname(p)]||'application/octet-stream'});
    res.end(data);
  }catch(e){res.writeHead(404);res.end('not found');}
}).listen(PORT,()=>console.log(`serving on ${PORT}`));
