// Watch check (7.339): plays the intended routes the way Watch world / Watch all Cores does, in a real browser at 8×,
// and reports every section that is skipped because its route died or never reached the exit.
//   node scripts/climb/watch-check.mjs            every base world, Fractured world and Core
//   node scripts/climb/watch-check.mjs 1 7 114    just those worlds
// Exit code 1 when anything was skipped. Serves public/ itself; nothing else needs to be running.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,join,normalize} from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChrome} from '../../tests/launch-chrome.mjs';

const ROOT=fileURLToPath(new URL('../../public/',import.meta.url));
const TYPES={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 try{const path=normalize(decodeURIComponent(new URL(req.url,'http://x').pathname)).replace(/^\/+/,'')||'index.html';
  const body=await readFile(join(ROOT,path));res.writeHead(200,{'content-type':TYPES[extname(path)]||'application/octet-stream'});res.end(body);}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const port=server.address().port;
const asked=process.argv.slice(2).map(Number).filter(Boolean);
const groups=asked.length?[asked]:[Array.from({length:20},(_,i)=>i+1),Array.from({length:20},(_,i)=>i+21),Array.from({length:20},(_,i)=>i+101)];

const browser=await launchChrome({headless:true,args:['--no-sandbox']});
let skipped=[],errors=[];
for(const worlds of groups){
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.evaluateOnNewDocument(()=>{localStorage.setItem('bladefall.climb.unlock-all.v1','1');});
 await page.goto(`http://127.0.0.1:${port}/precision.html?pitch=climb&world=1&nosw=1`,{waitUntil:'load'});
 await page.waitForFunction(()=>!!window.BladefallPitchView?.climb?.watchWorlds,{timeout:30000});
 await new Promise(r=>setTimeout(r,1500));
 await page.evaluate(w=>window.BladefallPitchView.climb.watchWorlds(w),worlds);
 for(let i=0;i<3;i++)await page.keyboard.press('BracketRight');   // 8×
 const t0=Date.now();
 while(await page.evaluate(()=>!!window.BladefallPitchView.climb.watching())){
  if(Date.now()-t0>30*60*1000){errors.push('timed out watching '+worlds.join(','));break;}
  await new Promise(r=>setTimeout(r,1000));
 }
 skipped.push(...await page.evaluate(()=>window.BladefallPitchView.climb.watchLog()));
 console.log(`watched ${worlds[0]}–${worlds.at(-1)} in ${Math.round((Date.now()-t0)/1000)} s`);
 await page.close();
}
await browser.close();server.close();
if(skipped.length||errors.length){console.log('SKIPPED:\n  '+skipped.join('\n  '));if(errors.length)console.log('ERRORS:\n  '+errors.join('\n  '));process.exit(1);}
console.log('PASS: every watched route reached its exit with no deaths.');
