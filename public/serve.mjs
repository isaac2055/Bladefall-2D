// tiny local dev server (no deps)
import {createServer} from 'http';
import {readFile} from 'fs/promises';
import {dirname, extname, resolve, sep} from 'path';
import {fileURLToPath} from 'url';
const ROOT=dirname(fileURLToPath(import.meta.url));
const PORT=Number.parseInt(process.env.PORT||'8371',10);
const MIME={'.html':'text/html','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
createServer(async (req,res)=>{
  // Strip the query BEFORE testing for the root, or `/?tas` (the harness flag the game
  // itself reads off location.search) resolves to the directory and 404s.
  const bare=req.url.split('?')[0];
  const p=(bare==='/'||bare==='')?'/index.html':bare;
  try{
    const target=resolve(ROOT,'.'+decodeURIComponent(p));
    if(target!==ROOT&&!target.startsWith(ROOT+sep))throw new Error('invalid path');
    const data=await readFile(target),type=MIME[extname(p)]||'application/octet-stream';
    // Media elements seek with Range requests. Without 206 replies the music can
    // neither resume a saved position nor loop from a point after its intro.
    const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range||'');
    if(range&&(range[1]||range[2])){
      const size=data.length;
      const start=range[1]?Number(range[1]):Math.max(0,size-Number(range[2]));
      const end=range[1]&&range[2]?Math.min(Number(range[2]),size-1):size-1;
      if(start>end){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
      res.writeHead(206,{'Content-Type':type,'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});
      res.end(data.subarray(start,end+1));return;
    }
    res.writeHead(200,{'Content-Type':type,'Accept-Ranges':'bytes'});
    res.end(data);
  }catch(e){res.writeHead(404);res.end('not found');}
}).listen(PORT,()=>console.log(`serving on ${PORT}`));
