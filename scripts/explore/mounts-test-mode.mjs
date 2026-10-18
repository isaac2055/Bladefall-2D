// The shortcut test mode and gallery (7.345, public/bladefall-explore-mounts.js + the level select), in a real browser:
//   - five taps on Base in the level select turn the test mode on (and mark the tab), five more turn it off;
//   - on, a level-select run of any region has both roosts with no side story finished and no "Not yet" gate,
//     while a campaign run (not level select) still has none;
//   - the Quest shortcuts gallery draws a picture for every region's shortcut.
//   node scripts/explore/mounts-test-mode.mjs [--shots dir]      (serves public/ itself)
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
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
const args=process.argv.slice(2),shots=args.includes('--shots')?args[args.indexOf('--shots')+1]:null;
if(shots)await mkdir(shots,{recursive:true});
const browser=await launchChrome({headless:true,args:['--no-sandbox']});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),errors=[];
const page=await browser.newPage();await page.setViewport({width:1280,height:900});page.on('pageerror',e=>errors.push(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/index.html?nosw=1`,{waitUntil:'load'});
await page.waitForFunction(()=>typeof openLevelSelect==='function'&&window.BladefallMounts,{timeout:60000});await sleep(800);
await page.evaluate(()=>{BladefallMounts.setTestMode(false);openLevelSelect();});
// Off, a copy sent out for feedback shows no tester's tools: no Watch/Record, no gallery, no Edit this level.
const hidden=await page.evaluate(()=>({watch:document.querySelectorAll('.lvlwatch,.lvlrecord,#lvlWatchAll').length,gallery:!!document.getElementById('lvlShortcuts'),
 edit:(()=>{beginRun(0,null,{hp:1,dmg:1},{startStage:0,levelSelect:true});openPause();const e=!!document.getElementById('workshopEdit');mode='title';openLevelSelect();return e;})()}));
assert.deepEqual(hidden,{watch:0,gallery:false,edit:false},'test-mode tools hidden while it is off');
const tapBase=async n=>{for(let i=0;i<n;i++){await page.click('[data-tab="0"]');await sleep(120);}};
await tapBase(4);
assert.equal(await page.evaluate(()=>BladefallMounts.testMode()),false,'four taps do nothing');
await tapBase(1);
assert.equal(await page.evaluate(()=>BladefallMounts.testMode()),true,'the fifth tap turns the test mode on');
assert.match(await page.$eval('[data-tab="0"]',b=>b.textContent),/✦/,'the Base tab is marked');
assert.ok(await page.$('#lvlShortcutTest'),'the level select says so');
const shown=await page.evaluate(()=>({watch:document.querySelectorAll('.lvlwatch').length,record:document.querySelectorAll('.lvlrecord').length,gallery:!!document.getElementById('lvlShortcuts'),
 edit:(()=>{beginRun(0,null,{hp:1,dmg:1},{startStage:0,levelSelect:true});openPause();const e=!!document.getElementById('workshopEdit');mode='title';openLevelSelect();return e;})()}));
assert.ok(shown.watch>0&&shown.record>0&&shown.gallery&&shown.edit,'test mode shows Watch, Record, the gallery and Edit this level '+JSON.stringify(shown));
// The gallery: a picture for every region.
await page.click('#lvlShortcuts');await sleep(1500);
const cards=await page.evaluate(()=>[...document.querySelectorAll('#scGallery canvas[data-sc]')].map(cv=>{
 cv.scrollIntoView();const c=cv.getContext('2d');BladefallMounts.preview(c,+cv.dataset.sc,1.7,cv.width,cv.height);
 const d=c.getImageData(0,0,cv.width,cv.height).data,seen=new Set();for(let i=0;i<d.length;i+=4*37)seen.add(d[i]<<16|d[i+1]<<8|d[i+2]);
 return {stage:+cv.dataset.sc,colours:seen.size};}));
const nMounts=await page.evaluate(()=>Object.keys(BladefallMounts.MOUNTS).length);
assert.equal(cards.length,nMounts,'a card per shortcut');
for(const c of cards)assert.ok(c.colours>25,`stage ${c.stage}'s picture is drawn (${c.colours} colours)`);
if(shots){await page.evaluate(()=>{const g=document.querySelector('#scGallery canvas').closest('div[style*=grid]');g.scrollTop=0;});await sleep(600);await page.screenshot({path:shots+'/gallery.png'});await page.setViewport({width:390,height:844});await sleep(600);await page.screenshot({path:shots+'/gallery-phone.png'});await page.setViewport({width:1280,height:900});}
await page.click('#scBack');await sleep(300);
// A level-select run of every region: both roosts, no gate, without any side story.
const rows=[];
for(const stage of Object.keys(await page.evaluate(()=>BladefallMounts.MOUNTS)).map(Number)){
 await page.evaluate(s=>beginRun(0,null,{hp:1,dmg:1},{startStage:s,levelSelect:true}),stage);await sleep(1200);
 const r=await page.evaluate(()=>{BladefallMounts.install();
  return {roosts:(BladefallMounts.roosts()||[]).length,missing:BladefallMounts.missing(),placed:G.obstacles.filter(o=>o.mountRoost).length,ls:!!G.levelSelectMode,stage:G.stageIndex};});
 rows.push({stage,...r});
 assert.equal(r.roosts,2,`stage ${stage}: both roosts `+JSON.stringify(r));assert.deepEqual(r.missing,[],`stage ${stage}: no "Not yet" gate`);
 assert.equal(r.placed,2,`stage ${stage}: both roosts stand`);
}
// A campaign run never sees the test mode.
const campaign=await page.evaluate(()=>{beginRun(0,null,{hp:1,dmg:1},{startStage:0});BladefallMounts.install();return G.obstacles.filter(o=>o.mountRoost).length;});
assert.equal(campaign,0,'no roost in a campaign run');
await page.evaluate(()=>{mode='title';openLevelSelect();});await sleep(300);
// Five taps on Fractured toggle it too.
const tapFx=async n=>{for(let i=0;i<n;i++){await page.click('[data-tab="fx"]');await sleep(120);}};
await tapFx(5);
assert.equal(await page.evaluate(()=>BladefallMounts.testMode()),false,'five taps on Fractured turn it off');
await tapFx(5);
assert.equal(await page.evaluate(()=>BladefallMounts.testMode()),true,'and on again');
await tapBase(5);
assert.equal(await page.evaluate(()=>BladefallMounts.testMode()),false,'five more taps turn it off');
await browser.close();server.close();
assert.deepEqual(errors,[],'page errors');
console.log(`PASS: tester's tools (Watch/Record, gallery, Edit this level) hidden until test mode; five taps on Base or Fractured toggle it; on, all ${rows.length} regions' shortcuts stand in level-select runs with no story or gate, none in a campaign run; the gallery draws all ${cards.length} shortcuts.`);
