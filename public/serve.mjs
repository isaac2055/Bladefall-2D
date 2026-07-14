// tiny local dev server (no deps)
import {createServer} from 'http';
import {readFile} from 'fs/promises';
import {extname, join} from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png'};
createServer(async (req,res)=>{
  const p=req.url==='/'?'/index.html':req.url.split('?')[0];
  try{
    const data=await readFile(join(process.cwd(),p));
    res.writeHead(200,{'Content-Type':MIME[extname(p)]||'application/octet-stream'});
    res.end(data);
  }catch(e){res.writeHead(404);res.end('not found');}
}).listen(8371,()=>console.log('serving on 8371'));
