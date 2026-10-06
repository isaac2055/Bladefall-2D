// Room by Room (7.259): screenshots as a player sees them, in headless Chrome from disk.
//   node scripts/rbr-shot.mjs <outDir> menu | <region>[:room][@frames] ...
//   node scripts/rbr-shot.mjs <outDir> play:<region>      plays every main room on its tape through the real view,
//                                                         shooting each room's first frame and the end card.
import puppeteer from 'puppeteer';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,resolve} from 'node:path';
import {mkdirSync} from 'node:fs';
const here=dirname(fileURLToPath(import.meta.url));
const [,,out,...specs]=process.argv;
mkdirSync(out,{recursive:true});
const pageFile=pathToFileURL(resolve(here,'../public/precision.html')).href;
// Regions and region devices still being built (not yet in FILES) load by URL parameter.
const {readdirSync}=await import('node:fs');
const pubFiles=readdirSync(resolve(here,'../public'));
const extraFiles=pubFiles.filter(f=>/^bladefall-rbr-\d\d-.*\.js$/.test(f)&&!/-view\.js$/.test(f)).map(f=>f.slice(14,-3));
const pageHtml=(await import('node:fs')).readFileSync(resolve(here,'../public/precision.html'),'utf8');
const extraDevs=pubFiles.filter(f=>/^bladefall-pcore-dev-rbr-.*\.js$/.test(f)&&!/-view\.js$/.test(f)&&!pageHtml.includes(f)).map(f=>f.slice(24,-3));   // not yet on the page
const base=pageFile;
const suffix=`&rbrfile=${extraFiles.join(',')}${extraDevs.length?'&rbrdev='+extraDevs.join(','):''}`;
const browser=await puppeteer.launch({headless:'new',args:['--allow-file-access-from-files']});
const page=await browser.newPage();
// Review cards are tested separately; route captures exercise uninterrupted traversal.
await page.evaluateOnNewDocument(()=>localStorage.setItem('bladefall.rbr.survey.v1',JSON.stringify({active:false,rooms:{}})));await page.setViewport({width:1280,height:760});
let failed=false;const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const ready=()=>page.waitForFunction(()=>window.BladefallPrecisionView&&window.BladefallRoomByRoom,{timeout:10000});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
for(const spec of specs){
 if(spec==='menu'){await page.goto(`${base}?pitch=rbr${suffix}`);await ready();await wait(400);await page.screenshot({path:resolve(out,'menu.png'),fullPage:true});console.log('wrote menu.png');continue;}
 const play=/^play:(\d+)$/.exec(spec);
 if(play){
  const n=+play[1];await page.goto(`${base}?pitch=rbr&region=${n}${suffix}`);await ready();await wait(300);
  const rooms=await page.evaluate(n=>window.BladefallRoomByRoom.region(n).rooms.map(r=>r.id),n);
  for(const [k,id] of rooms.entries()){
   // Let the slide finish, shoot the room, then play its tape (the view's own tick: slides, speech, exits).
   const res=await page.evaluate(async (id)=>{const V=window.BladefallPrecisionView,R=window.BladefallPrecisionRooms;
    for(let i=0;i<40&&V.view.g.room.id!==id;i++)V.advance(['']);
    for(let i=0;i<40;i++)V.advance(['']);   // the slide
    return {room:V.view.g.room.id};},id);
   if(res.room!==id){failed=true;console.log('FAIL expected room',id,'got',res.room);break;}
   await page.evaluate(()=>{window.BladefallPrecisionView.retryRoom();for(let i=0;i<14;i++)window.BladefallPrecisionView.advance(['']);});
   await page.screenshot({path:resolve(out,`r${n}-${String(k+1).padStart(2,'0')}-${id}.png`)});
   const after=await page.evaluate((id)=>{const V=window.BladefallPrecisionView,R=window.BladefallPrecisionRooms;
    const ks=[];for(const [m,key] of R.tapes[id]||[])for(let i=0;i<m;i++)ks.push(key);
    let deaths=V.view.chapterStats.deaths;for(const key of ks){if(V.view.g.room.id!==id)break;V.advance([key]);}
    for(let i=0;i<60&&V.view.g.room.id===id&&V.view.mode==='play';i++)V.advance(['']);
    return {now:V.view.g.room.id,mode:V.view.mode,deaths:V.view.chapterStats.deaths-deaths};},id);
   console.log(`${id}: left to ${after.now} (${after.mode}), deaths ${after.deaths}`);
   const expected=rooms[k+1];if(after.deaths||expected&&after.now!==expected||!expected&&after.mode!=='card'){failed=true;console.log('FAIL room did not finish cleanly');break;}
  }
  await wait(200);await page.screenshot({path:resolve(out,`r${n}-end.png`)});console.log(failed?'wrote failure state':'wrote end card');
  continue;
 }
 const m=/^(\d+)(?::([\w-]+))?(?:@(\d+))?$/.exec(spec);if(!m){console.error('bad spec',spec);continue;}
 const n=+m[1];let room=m[2]||'0';
 await page.goto(`${base}?pitch=rbr&region=${n}${suffix}`);await ready();
 const idx=await page.evaluate((n,room)=>{const reg=window.BladefallRoomByRoom.region(n);const all=[...reg.rooms,...reg.quests.flatMap(q=>q.rooms)];return isNaN(+room)?all.findIndex(r=>r.id===room):+room;},n,room);
 await page.evaluate(i=>{const V=window.BladefallPrecisionView;const c=V.view.chapter;V.startChapter(c,i);},idx);
 await wait(300);
 const frames=+(m[3]||0);
 await page.evaluate(f=>{const V=window.BladefallPrecisionView,R=window.BladefallPrecisionRooms;const ks=[];for(const [k,key] of R.tapes[V.view.g.room.id]||[])for(let i=0;i<k;i++)ks.push(key);V.advance(['',...ks.slice(0,f)]);},frames);
 const file=resolve(out,`r${n}-${room}${frames?'-f'+frames:''}.png`);await page.screenshot({path:file});console.log('wrote',file);
}
if(errors.length)console.log('page errors:\n'+errors.join('\n'));
await browser.close();process.exit(failed||errors.length?1:0);
