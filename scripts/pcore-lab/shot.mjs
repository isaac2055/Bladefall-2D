// Precision Core lab (7.280): screenshots of the lab's teaching rooms as a player sees them, in headless Chrome
// from disk (precision.html on a Room by Room page, so region palettes load), with the lab rooms injected.
//   node scripts/pcore-lab/shot.mjs <outDir> <roomId>[@frames] ...     e.g. lab-zip-1@40
// @frames plays that many frames of the room's lab tape (lab.tapes.json) first. Device modules that the page
// does not list yet are added before the room starts.
import puppeteer from 'puppeteer';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,resolve} from 'node:path';
import {mkdirSync,readFileSync,readdirSync,existsSync} from 'node:fs';
const here=dirname(fileURLToPath(import.meta.url)),pub=resolve(here,'../../public');
const [,,out,...specs]=process.argv;
if(!out||!specs.length){console.error('usage: node scripts/pcore-lab/shot.mjs <outDir> <roomId>[@frames] ...');process.exit(1);}
mkdirSync(out,{recursive:true});
const {rooms}=await import('./rooms.mjs');
const tf=resolve(here,'lab.tapes.json'),tapes=existsSync(tf)?JSON.parse(readFileSync(tf,'utf8')):{};
const html=readFileSync(resolve(pub,'precision.html'),'utf8');
const missing=readdirSync(pub).filter(f=>/^bladefall-pcore-dev-.*\.js$/.test(f)&&!html.includes(f)).sort((a,b)=>/-view\.js$/.test(a)-/-view\.js$/.test(b));
const pageFile=pathToFileURL(resolve(pub,'precision.html')).href;
const browser=await puppeteer.launch({headless:'new',args:['--allow-file-access-from-files']});
const page=await browser.newPage();
await page.evaluateOnNewDocument(()=>localStorage.setItem('bladefall.rbr.survey.v1',JSON.stringify({active:false,rooms:{}})));
await page.setViewport({width:1280,height:760});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
for(const spec of specs){
 const m=/^([\w-]+)(?:@(\d+))?$/.exec(spec);if(!m){console.error('bad spec',spec);continue;}
 const id=m[1],frames=+(m[2]||0);
 await page.goto(`${pageFile}?pitch=rbr&region=13`);
 await page.waitForFunction(()=>window.BladefallPrecisionView&&window.BladefallRoomByRoom,{timeout:10000});
 for(const f of missing)await page.addScriptTag({url:pathToFileURL(resolve(pub,f)).href});
 const ok=await page.evaluate((rooms,tapes,id)=>{
  const R=window.BladefallPrecisionRooms,V=window.BladefallPrecisionView;
  if(!R.chapters.some(c=>c.id==='pcore-lab'))R.addPart({part:'lab',title:'Lab',chapters:[{id:'pcore-lab',name:'Lab',bonus:true,rooms:rooms.map(r=>({lock:['strike','parry','portal'],...r}))}],tapes});
  const ci=R.chapters.findIndex(c=>c.id==='pcore-lab'),ri=R.chapters[ci].rooms.findIndex(r=>r.id===id);
  if(ri<0)return false;V.startChapter(ci,ri);return true;},rooms,tapes,id);
 if(!ok){console.error('no lab room',id);continue;}
 await wait(300);
 await page.evaluate(f=>{const V=window.BladefallPrecisionView,R=window.BladefallPrecisionRooms;const ks=[];for(const [k,key] of R.tapes[V.view.g.room.id]||[])for(let i=0;i<k;i++)ks.push(key);V.advance(['',...ks.slice(0,f)]);},frames);
 const file=resolve(out,`${id}${frames?'-f'+frames:''}.png`);await page.screenshot({path:file});console.log('wrote',file);
}
if(errors.length)console.log('page errors:\n'+errors.join('\n'));
await browser.close();process.exit(errors.length?1:0);
