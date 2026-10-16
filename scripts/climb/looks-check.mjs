// Looks check (7.342): every room of the forty Ascend worlds is drawn in its world's look (bladefall-climb-looks.js).
//   - every room's palette is one Ascend defines (none falls back to the generic footing grey);
//   - an imported Room Bank room, superrooms included, has its world's palette;
//   - each Fractured world has its own palette, unlike every other world's;
//   - the sky behind each imported room is its own world's.
//   node scripts/climb/looks-check.mjs            (serves public/ itself; real browser)
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,join,normalize} from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChrome} from '../../tests/launch-chrome.mjs';

const ROOT=fileURLToPath(new URL('../../public/',import.meta.url));
const TYPES={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try{const path=normalize(decodeURIComponent(new URL(req.url,'http://x').pathname)).replace(/^\/+/,'')||'index.html';
  const body=await readFile(join(ROOT,path));res.writeHead(200,{'content-type':TYPES[extname(path)]||'application/octet-stream'});res.end(body);}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await launchChrome({headless:true,args:['--no-sandbox']});
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.evaluateOnNewDocument(()=>{localStorage.setItem('bladefall.climb.unlock-all.v1','1');});
await page.goto(`http://127.0.0.1:${server.address().port}/precision.html?pitch=climb&world=1&nosw=1&review=1`,{waitUntil:'load'});
await page.waitForFunction(()=>!!window.BladefallPitchView?.climb?.startWorld,{timeout:30000});
await new Promise(r=>setTimeout(r,1000));
const report=await page.evaluate(async()=>{
 const C=window.BladefallPitchView.climb,CL=window.BladefallClimb,L=window.BladefallClimbLooks,bad=[];
 const footing=JSON.stringify(C.palette('footing')),palOf=name=>JSON.stringify(C.palette(name));
 const seen=new Map();let rooms=0,imports=0;
 for(let n=1;n<=40;n++){
  const w=CL.world(n),worldPal=L.worldPalette(n,w.palette);
  if(palOf(worldPal)===footing)bad.push(`W${n}: world palette ${worldPal} is not defined`);
  const key=palOf(worldPal);if(n>20){if(seen.has(key))bad.push(`W${n}: same palette as W${seen.get(key)}`);}seen.set(key,seen.get(key)||n);
  for(const s of CL.all(w)){const d=CL.def(w,s.room),name=L.roomPalette(d);rooms++;
   if(name!=='footing'&&palOf(name)===footing)bad.push(`${d.id}: palette ${name} is not defined`);
   if(d.campaignImport){imports++;if(name!==worldPal)bad.push(`${d.id}: imported room drawn as ${name}, its world is ${worldPal}`);}
   if(n>20&&name!==worldPal)bad.push(`${d.id}: Fractured room drawn as ${name}, its world is ${worldPal}`);}
 }
 // The sky behind an imported room is its own world's.
 for(let n=1;n<=40;n++){const w=CL.world(n);
  for(const d of w.chapter.rooms.filter(r=>r.campaignImport)){C.state().review=true;C.startWorld(n,w.chapter.rooms.indexOf(d));
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   if(C.state().sky?.n!==n)bad.push(`${d.id}: sky is world ${C.state().sky?.n}`);}}
 return {bad,rooms,imports};
});
await browser.close();server.close();
if(report.bad.length||errors.length){console.log('FAIL:\n  '+[...report.bad,...errors].join('\n  '));process.exit(1);}
console.log(`PASS: ${report.rooms} rooms in 40 worlds drawn in their world's look; ${report.imports} imported rooms match their world's palette and sky; 20 distinct Fractured palettes.`);
