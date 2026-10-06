// Screenshot Precision Core rooms as a player sees them (7.254): headless Chrome, precision.html from disk.
//   node scripts/pcore-shot.mjs <outDir> <level>[:room][@frames] ...     e.g. 75 75:0@120 82
// A level is its number (chapter index + 1). @frames plays that many frames of the room's intended tape
// first, so a device's later state can be checked. Writes <outDir>/L<level>-<room>.png.
import puppeteer from 'puppeteer';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,resolve} from 'node:path';
import {mkdirSync} from 'node:fs';
const here=dirname(fileURLToPath(import.meta.url));
const [,,out,...specs]=process.argv;
if(!out||!specs.length){console.error('usage: node scripts/pcore-shot.mjs <outDir> <level>[:room][@frames] ...');process.exit(1);}
mkdirSync(out,{recursive:true});
const page_=pathToFileURL(resolve(here,'../public/precision.html')).href;
const browser=await puppeteer.launch({headless:'new',args:['--allow-file-access-from-files']});
const page=await browser.newPage();await page.setViewport({width:1280,height:760});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
for(const spec of specs){
 // <level>[:room][@frames] or id:<roomId>[@frames]
 const m=/^(?:id:([\w-]+)|(\d+)(?::(\d+))?)(?:@(\d+))?$/.exec(spec);if(!m){console.error('bad spec',spec);continue;}
 let level=+m[2],room=+(m[3]||0);const frames=+(m[4]||0);
 if(m[1]){await page.goto(page_);await page.waitForFunction(()=>window.BladefallPrecisionRooms);
  const at=await page.evaluate(id=>{const ch=window.BladefallPrecisionRooms.chapters;for(let c=0;c<ch.length;c++){const i=ch[c].rooms.findIndex(r=>r.id===id);if(i>=0)return [c,i];}return null;},m[1]);
  if(!at){console.error('no room',m[1]);continue;}level=at[0]+1;room=at[1];}
 await page.goto(`${page_}?chapter=${level-1}&room=${room}`);
 await page.waitForFunction(()=>window.BladefallPrecisionCore&&document.getElementById('pcCanvas'),{timeout:10000});
 await new Promise(r=>setTimeout(r,500));
 if(frames){await page.evaluate((frames)=>{const V=window.BladefallPrecisionView,R=window.BladefallPrecisionRooms;
   const tape=R.tapes[V.view.g.room.id]||[];const ks=[];for(const [n,k]of tape)for(let i=0;i<n;i++)ks.push(k);
   V.advance(ks.slice(0,frames));},frames);await new Promise(r=>setTimeout(r,100));}
 const file=resolve(out,`${m[1]||'L'+level+'-'+room}${frames?'-f'+frames:''}.png`);
 await page.screenshot({path:file});console.log('wrote',file);
}
if(errors.length)console.log('page errors:\n'+errors.join('\n'));
await browser.close();
