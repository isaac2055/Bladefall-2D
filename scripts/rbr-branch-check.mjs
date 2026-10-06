// Room by Room: play a quest branch through the real view in headless Chrome — the from-room's #side tape, each
// quest room's tape — and check the knight comes back to the from-room at the quest's door holding the keepsake.
//   node scripts/rbr-branch-check.mjs <outDir> <region> <questId>
import puppeteer from 'puppeteer';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,resolve} from 'node:path';
import {mkdirSync} from 'node:fs';
const here=dirname(fileURLToPath(import.meta.url));
const [,,out,nArg,qid]=process.argv;const n=+nArg;mkdirSync(out,{recursive:true});
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
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(`${base}?pitch=rbr&region=${n}${suffix}`);
await page.waitForFunction(()=>window.BladefallPrecisionView&&window.BladefallRoomByRoom);
await page.evaluate(()=>localStorage.removeItem('bladefall.rbr.v1'));
const q=await page.evaluate((n,qid)=>{const reg=window.BladefallRoomByRoom.region(n),q=reg.quests.find(x=>x.id===qid);return {from:q.from,rooms:q.rooms.map(r=>r.id),back:q.back,needs:q.needs,keep:q.keepsake.id,idx:reg.rooms.findIndex(r=>r.id===q.from)};},n,qid);
const play=(id,key)=>page.evaluate((id,key)=>{const V=window.BladefallPrecisionView,R=window.BladefallPrecisionRooms;
 for(let i=0;i<60&&(V.view.g.room.id!==id);i++)V.advance(['']);for(let i=0;i<30;i++)V.advance(['']);
 if(V.view.g.room.id!==id)return {err:'not in '+id+' but '+V.view.g.room.id};
 V.retryRoom();for(let i=0;i<14;i++)V.advance(['']);
 const ks=[];for(const [m,k] of R.tapes[key]||[])for(let i=0;i<m;i++)ks.push(k);
 for(const k of ks){if(V.view.g.room.id!==id)break;V.advance([k]);}
 for(let i=0;i<40&&V.view.g.room.id===id;i++)V.advance(['']);
 return {now:V.view.g.room.id};},id,key);
await page.evaluate(i=>{const V=window.BladefallPrecisionView;V.startChapter(V.view.chapter,i);},q.idx);
if(q.needs){
 const locked=await play(q.from,q.from+'#side');
 const sealed=await page.evaluate(()=>window.BladefallPrecisionView.view.g.sideSealed);
 if(locked.now!==q.from||!sealed)throw Error('echo branch opened without '+q.needs);
 console.log('locked without',q.needs);
 await page.evaluate(k=>localStorage.setItem('bladefall.rbr.v1',JSON.stringify({keepsakes:{[k]:true}})),q.needs);
 await page.reload();await page.waitForFunction(()=>window.BladefallPrecisionView&&window.BladefallRoomByRoom);
 await page.evaluate(i=>{const V=window.BladefallPrecisionView;V.startChapter(V.view.chapter,i);},q.idx);
}
console.log('from',q.from,'side ->',JSON.stringify(await play(q.from,q.from+'#side')));
for(const id of q.rooms){await page.evaluate(()=>{for(let i=0;i<45;i++)window.BladefallPrecisionView.advance(['']);});await page.screenshot({path:resolve(out,`branch-${id}.png`)});console.log(id,'->',JSON.stringify(await play(id,id)));}
for(let i=0;i<3;i++)await page.evaluate(()=>{for(let k=0;k<30;k++)window.BladefallPrecisionView.advance(['']);});
const end=await page.evaluate(k=>{const V=window.BladefallPrecisionView,s=JSON.parse(localStorage.getItem('bladefall.rbr.v1')||'{}');return {room:V.view.g.room.id,x:V.view.g.p.x,y:V.view.g.p.y,kept:!!(s.keepsakes||{})[k]};},q.keep);
console.log('back in',end.room,'at',end.x,end.y,'(door',q.back.c*8,q.back.r*8+8-11+')','keepsake',end.kept);
await page.screenshot({path:resolve(out,'branch-back.png')});
const ok=end.room===q.from&&end.kept;console.log(ok?'BRANCH OK':'BRANCH FAILED');
if(errors.length)console.log('page errors:\n'+errors.join('\n'));
await browser.close();process.exit(ok?0:1);
