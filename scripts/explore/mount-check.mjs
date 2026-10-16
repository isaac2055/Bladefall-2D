// Quest mounts (7.343, public/bladefall-explore-mounts.js), in a real browser:
//   - before "A Bell for the Camp" is finished there is no roost in the Outskirts;
//   - finished, the Bellwing roosts by the camp; Up there offers the flight, and it sets the knight down facing
//     the Mothlight Door; it stays perched there (across a stage reload, and in the save), and flies him back;
//   - the flight does Mara's survey: her three bearings aligned and her field chart granted;
//   - under the TAS/watch rules (Watch, ● Record, route building) there is no roost even when finished.
//   node scripts/explore/mount-check.mjs            (serves public/ itself)
import assert from 'node:assert/strict';
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
const url=`http://127.0.0.1:${server.address().port}/index.html`;
const browser=await launchChrome({headless:true,args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),errors=[];
async function open(query){
 const page=await browser.newPage();await page.setViewport({width:1280,height:720});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url+query,{waitUntil:'load'});await page.waitForFunction(()=>typeof beginRun==='function'&&window.BladefallMounts,{timeout:60000});await sleep(1000);
 return page;
}
const roosts=page=>page.evaluate(()=>G.obstacles.filter(o=>o.mountRoost).map(o=>o.mountRoost));
const finish=page=>page.evaluate(()=>{G.sessionSideStories={quests:{gatekeeper:{phase:'completed',claimed:true}}};BladefallMounts.install();});
async function ride(page,from){
 await page.evaluate(id=>{const r=G.obstacles.find(o=>o.mountRoost===id);G.p.x=r.x+30;G.p.y=r.y;G.p.vx=0;},from);await sleep(600);
 const verb=await page.evaluate(()=>interactionPrompt()?.verb);assert.match(verb||'',/RIDE THE BELLWING/,'prompt at the '+from+' roost');
 await page.evaluate(()=>beginOutskirtsInteraction());await sleep(1200);
 const clicked=await page.evaluate(()=>{for(const b of document.querySelectorAll('#fieldConversation button'))if(/^Fly to/.test(b.textContent)){b.click();return b.textContent;}return null;});
 assert.ok(clicked,'flight offered at the '+from+' roost');
 const t0=Date.now();let high=0;
 while(Date.now()-t0<20000){await sleep(250);const s=await page.evaluate(()=>({f:!!G.mountFlight,y:G.p.y}));high=Math.max(high,s.y);if(!s.f&&Date.now()-t0>2000)break;}
 return {clicked,high,...await page.evaluate(()=>({x:Math.round(G.p.x),face:G.p.face,mode,at:BladefallMounts.perch(),dead:G.p.dead}))};
}

const page=await open('?nosw=1');
await page.evaluate(()=>beginRun(0,null,{hp:1,dmg:1},{startStage:0,levelSelect:true}));await sleep(1500);
assert.deepEqual(await roosts(page),[],'no roost before the story is finished');
await finish(page);
assert.deepEqual(await roosts(page),['camp','door'],'roosts once the story is finished');
const out=await ride(page,'camp');
assert.ok(out.high>150,'flew over the road (highest '+Math.round(out.high)+')');
assert.equal(out.mode,'play');assert.equal(out.at,'door');assert.equal(out.face,1);assert.ok(!out.dead);
assert.ok(out.x>13300&&out.x<13600,'set down short of the Mothlight Door (x='+out.x+')');
// The flight does Mara's survey: all three bearings aligned and her chart granted.
const chart=await page.evaluate(()=>({chart:!!meta.outskirtsFieldChart,aligned:G.obstacles.filter(o=>o.type==='surveyStake'&&o.aligned).length,
 stakes:G.obstacles.filter(o=>o.type==='surveyStake').length,maraDone:!!(G.npcs||[]).find(n=>n.kind==='survey')?.done}));
assert.ok(chart.stakes>=3&&chart.aligned===chart.stakes,'all bearings aligned ('+chart.aligned+'/'+chart.stakes+')');
assert.ok(chart.chart&&chart.maraDone,'Mara\'s field chart granted');
// It stays perched at the door: leave the Outskirts and come back, and it is still there to ride back west.
const kept=await page.evaluate(()=>{loadStage(0);BladefallMounts.install();return {perch:BladefallMounts.perch(),roosts:G.obstacles.filter(o=>o.mountRoost).length};});
assert.equal(kept.perch,'door','still perched at the door after the stage reloads');assert.equal(kept.roosts,2);
const back=await ride(page,'door');
assert.equal(back.at,'camp');assert.ok(back.x<1200,'back at the camp (x='+back.x+')');
// A campaign keeps the perch in the save.
const saved=await page.evaluate(()=>{const was=meta.mounts;meta.mounts={perch:{0:'door'},reached:{}};persist();const back=loadSave().mounts;meta.mounts=was;persist();return back;});
assert.equal(saved?.perch?.[0],'door','the save keeps where the Bellwing is perched');
await page.close();

// Under the TAS rules the roost is never installed.
const tas=await open('?tas=1&nosw=1');
await tas.evaluate(()=>{tasPrepareRun();tasDeterministicCall(()=>beginRun(0,null,{hp:1,dmg:1},{startStage:0,levelSelect:true,testRun:true,runSeed:0xB07}));});
await finish(tas);
assert.deepEqual(await roosts(tas),[],'no roost under the TAS/watch rules');
await browser.close();server.close();
assert.deepEqual(errors,[],'page errors');
console.log(`PASS: no roost before the story; the Bellwing flew camp → Mothlight Door (x=${out.x}, up to ${Math.round(out.high)}), aligned ${chart.aligned}/${chart.stakes} bearings and granted Mara's chart, stayed perched at the door across a reload (and in the save), and flew back (x=${back.x}); none under TAS rules; no page errors.`);
