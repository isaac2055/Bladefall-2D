import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import puppeteer from 'puppeteer';

// Return cache interaction, persistent rewards and earned Double Jump access.
async function openHarness(t) {
  const root = resolve('public');
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg',
    '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.bak': 'text/html' };
  const server = createServer(async (req, res) => {
    try {
      const path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
      if (!path.startsWith(root + '/')) throw new Error('outside root');
      const bytes = await readFile(path);
      res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' });
      res.end(bytes);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600_000,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox'] });
  t.after(async () => { const child=browser.process(); await browser.close(); for(const stream of child?.stdio||[])stream?.destroy(); server.closeAllConnections(); server.close(); });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__BF?.tas);
  const bot = await import('../scripts/bladefall-bot.mjs');
  return { page, bot, errors };
}

const REGIONS = [[6,'warden'],[0,'outskirts'],[1,'black-woods'],[2,'brute']];

test('return reserves stay sealed before the recall and install without duplicates',async t=>{
 const {page,bot,errors}=await openHarness(t);
 for(const [stage,zone] of REGIONS){
  await page.evaluate(bot.bootstrapStage,stage);
  const r=await page.evaluate(zone=>{
   const tas=window.__BF.tas,cache=G.obstacles.find(o=>o.recallReserve);
   Object.assign(G.p,{x:cache.x,y:cache.y-22,vx:0,vy:0,onGround:true,invuln:10});
   tas.stepFrames(1,{interact:true});
   const closed=!cache.opened&&!cache.read&&G.obstacles.filter(o=>o.recallRoad).every(o=>o.gone);
   installRecallReturnRoute(zone);installRecallReturnRoute(zone);
   return {closed,count:G.obstacles.filter(o=>o.recallReserve).length,
    ids:G.obstacles.filter(o=>o.recallReserve||o.recallRoad).map(o=>o.zoneEntityId)};
  },zone);
  assert.equal(r.closed,true,zone);assert.equal(r.count,1);assert.equal(new Set(r.ids).size,r.ids.length);
 }
 assert.deepEqual(errors,[]);
});

test('each reserve rewards once and its route survives rest, death, reload and serialized campaign state',async t=>{
 const {page,bot,errors}=await openHarness(t);
 for(const [stage,zone] of REGIONS){
  await page.evaluate(bot.bootstrapStage,{stage,muster:true});
  const r=await page.evaluate(({stage,zone})=>{
   const tas=window.__BF.tas;
   // A campaign persistence fixture, isolated in this browser's in-memory save.
   G.levelSelectMode=false;G.worldProgressEligible=true;meta.zoneState=G.sessionZoneState;
   meta.capabilities=G.sessionCapabilities;
   meta.zoneState=BFZoneStateModule.setCircuit(meta.zoneState,'frostfell','frost-muster',{open:true});
   const cache=G.obstacles.find(o=>o.recallReserve),id=cache.shortcutId;
   const before=JSON.parse(JSON.stringify(meta.advancement));
   Object.assign(G.p,{x:cache.x,y:cache.y-22,vx:0,vy:0,onGround:true,invuln:10});
   tas.stepFrames(1,{interact:true});
   const first=JSON.stringify(meta.advancement),opened=cache.opened;
   tas.stepFrames(1,{});tas.stepFrames(1,{interact:true});
   const duplicate=JSON.stringify(meta.advancement)===first;
   captureCurrentZonePersistence();meta.zoneState=JSON.parse(JSON.stringify(meta.zoneState));
   tasDeterministicCall(()=>loadStage(stage));
   const restored=G.openedZoneShortcuts.includes(id)&&G.obstacles.filter(o=>o.recallRoad).every(o=>!o.gone);
   const site=G.obstacles.find(o=>o.type==='restSite');Object.assign(G.p,{x:site.x,y:site.y,vx:0,vy:0,onGround:true});
   restAtNearbySite();
   const afterRest=G.openedZoneShortcuts.includes(id)&&G.obstacles.filter(o=>o.recallRoad).every(o=>!o.gone);
   tasDeterministicCall(()=>die());
   const afterDeath=G.stageIndex===stage&&G.openedZoneShortcuts.includes(id)&&G.obstacles.filter(o=>o.recallRoad).every(o=>!o.gone);
   return {opened,duplicate,restored,afterRest,afterDeath,changed:JSON.stringify(before)!==first,
    stillSame:JSON.stringify(meta.advancement)===first,roads:G.obstacles.filter(o=>o.recallRoad).length};
  },{stage,zone});
  for(const key of ['opened','duplicate','restored','afterRest','afterDeath','changed','stillSame'])assert.equal(r[key],true,zone+' '+key);
  assert.ok(r.roads>=2);
 }
 assert.deepEqual(errors,[]);
});

test('reserve ledges are reachable with real double-jump inputs, above a single jump',async t=>{
 const {page,bot,errors}=await openHarness(t);
 for(const [stage,zone] of REGIONS){
  await page.evaluate(bot.bootstrapStage,{stage,muster:true});
  const r=await page.evaluate(()=>{
   const tas=window.__BF.tas,cache=G.obstacles.find(o=>o.recallReserve),ledge=G.obstacles.find(o=>o.zoneEntityId===cache.shortcutId+'-ledge');
   Object.assign(G.p,{x:cache.x-130,y:0,vx:0,vy:0,onGround:true,floorPlat:null,jumps:0,invuln:20});
   tas.saveState('reserve-ground');
   const samples=[];
   const trial=(double,moveAt)=>{
    tas.restoreState('reserve-ground');
    if(!double){G.sessionCapabilities=BFCapabilitiesModule.createState({acquired:['jump']});syncMovementCapabilities();}
    let landed=false,maxY=0,maxJumps=0;
    for(let i=0;i<100;i++){
     tas.stepFrames(1,{right:i>=moveAt,jump:i<20||(double&&i>=22&&i<45)});
     maxY=Math.max(maxY,G.p.y);maxJumps=Math.max(maxJumps,G.p.maxJumps);
     if(G.p.onGround&&G.p.floorPlat?.zoneEntityId===ledge.zoneEntityId){landed=true;break;}
    }
    samples.push({double,moveAt,maxY,maxJumps});return landed;
   };
   const timings=[18,22,26,30,34],single=timings.some(n=>trial(false,n));
   const winning=timings.find(n=>trial(true,n));
   return {single,winning,y:ledge.y,samples};
  });
  assert.equal(r.single,false,zone+' single jump');assert.notEqual(r.winning,undefined,zone+' double jump '+JSON.stringify(r.samples));
 }
 assert.deepEqual(errors,[]);
});
