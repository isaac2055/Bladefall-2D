import { runWhiteCourtFight } from '../scripts/white-court-fight-policy.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import puppeteer from 'puppeteer';

// White Court foundation: authored arrival and permanent local service work.
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

test('White Court has an authored safe arrival, owned rooms, refuge and service counter',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>({spawn:[G.p.x,G.p.y],length:G.levelLength,source:G.campaignBlueprint.source,
  errors:G.geometryAudit.errors,rest:G.obstacles.find(o=>o.siteId==='white-antechamber')?.x,
  shop:G.obstacles.find(o=>o.shopId==='sluice-counter')?.x,
  residents:G.obstacles.filter(o=>o.courtAction==='keeper'||o.courtAction==='glassworker').length,
  nearby:G.enemies.filter(e=>!e.dead&&Math.abs(e.x-G.p.x)<500).length}));
 assert.deepEqual(r.spawn,[4800,0]);assert.equal(r.length,16000);assert.equal(r.source,'custom');
 assert.deepEqual(r.errors,[]);assert.equal(r.rest,5100);assert.equal(r.shop,4600);assert.equal(r.residents,2);assert.equal(r.nearby,0);assert.deepEqual(errors,[]);
});
test('walking west and releasing the sluice awards one seal, preserved after rest and death',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  const tas=window.__BF.tas;G.levelSelectMode=false;G.worldProgressEligible=true;
  meta.capabilities=G.sessionCapabilities;meta.zoneState=G.sessionZoneState;
  const before=meta.advancement.forgeSeals;
  tas.stepFrames(480,{left:true});tas.stepFrames(1,{interact:true});
  const open=persistentCircuitOpen('court-wheel'),first=meta.advancement.forgeSeals,alive=!G.p.dead;
  tas.stepFrames(1,{});tas.stepFrames(1,{interact:true});const twice=meta.advancement.forgeSeals;
  Object.assign(G.p,{x:5100,y:0,vx:0,vy:0,onGround:true});restAtNearbySite();
  const rested=persistentCircuitOpen('court-wheel');tasDeterministicCall(()=>die());
  return {open,first,before,twice,alive,rested,afterDeath:persistentCircuitOpen('court-wheel'),final:meta.advancement.forgeSeals};
 });
 assert.equal(r.open,true);assert.equal(r.alive,true);assert.equal(r.first,r.before+1);assert.equal(r.twice,r.first);
 assert.equal(r.rested,true);assert.equal(r.afterDeath,true);assert.equal(r.final,r.first);assert.deepEqual(errors,[]);
});
test('White Court aqueduct latch opens the sealed return contract permanently',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  const tas=window.__BF.tas;G.levelSelectMode=false;G.worldProgressEligible=true;meta.capabilities=G.sessionCapabilities;meta.zoneState=G.sessionZoneState;
  const before=BFZonesModule.eligibility('frostfell-sorcerer','frostfell',zoneTraversalState());
  Object.assign(G.p,{x:240,y:0,vx:0,vy:0,onGround:true});tas.stepFrames(1,{interact:true});
  const after=BFZonesModule.eligibility('frostfell-sorcerer','frostfell',zoneTraversalState());
  captureCurrentZonePersistence();meta.zoneState=JSON.parse(JSON.stringify(meta.zoneState));tasDeterministicCall(()=>loadStage(8));
  return {before,after,restored:BFZonesModule.eligibility('frostfell-sorcerer','frostfell',zoneTraversalState()),opened:G.openedZoneShortcuts.includes('frostfell-sorcerer')};
 });
 assert.equal(r.before.reason,'sealed-from-this-side');assert.equal(r.after.allowed,true);assert.equal(r.restored.allowed,true);assert.equal(r.opened,true);assert.deepEqual(errors,[]);
});
test('Glassworks freezes its crossing only after a real placed-portal cold shot',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  const tas=window.__BF.tas;
  Object.assign(G.p,{x:8750,y:0,vx:0,vy:0,onGround:true,floorPlat:null,invuln:60});
  tas.stepFrames(360,{});const closed=!circuitOpen('court-glass-cold');
  tas.stepFrames(1,{portal:true});tas.stepFrames(1,{});const placed=G.cratePortals.length===1;
  tas.stepFrames(45,{left:true});let hopped=false;
  for(let i=0;i<360;i++){tas.stepFrames(1,{});hopped ||= G.projectiles.some(p=>p.courtCold&&p.portalHops>0);}
  const open=circuitOpen('court-glass-cold');let bridge=false;const trace=[];
  for(let i=0;i<900&&G.p.x<10520&&!G.p.dead;i++){
   tas.stepFrames(1,{right:true,attack:true});if(i%90===0)trace.push({i,x:G.p.x,y:G.p.y,freeze:G.p.freezeT,stun:G.p.stunT});bridge ||= G.p.floorPlat?.zoneEntityId==='court-glass-ice-bridge';
  }
  return {closed,placed,hopped,open,bridge,trace,x:G.p.x,y:G.p.y,vx:G.p.vx,dead:G.p.dead,wall:G.p.wallObj&&{x:G.p.wallObj.x,type:G.p.wallObj.type},openAfter:circuitOpen('court-glass-cold'),near:G.obstacles.filter(o=>Math.abs(o.x-G.p.x)<120).map(o=>({x:o.x,y:o.y,type:o.type,circuit:o.circuit,open:o.type==='door'?doorOpen(o):null}))};
 });
 for(const key of ['closed','placed','hopped','open','bridge'])assert.equal(r[key],true,key+' '+JSON.stringify(r));
 assert.ok(r.x>=10520,JSON.stringify(r));assert.equal(r.dead,false);assert.deepEqual(errors,[]);
});

// This isolates the victory/save contract; it is not a claim of winning the fight.
test('White Court victory grants permanent access without a legacy key or boss respawn',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  G.levelSelectMode=false;G.worldProgressEligible=true;
  meta.capabilities=G.sessionCapabilities;meta.zoneState=G.sessionZoneState;
  G.sessionCapabilities=null;G.sessionZoneState=null;
  const boss=G.boss, before=hasCapability('attunement');
  G.aoes.push({courtAttack:true,x:14000,y:0,r:80,t:1,dmg:1});
  tasDeterministicCall(()=>killEnemy(boss));
  const victory={ability:hasCapability('attunement'),circuit:persistentCircuitOpen('court-defeated'),
   portal:G.portal,key:G.pickups.some(p=>p.key),hazards:G.aoes.some(a=>a.courtAttack)};
  meta.capabilities=JSON.parse(JSON.stringify(meta.capabilities));
  meta.zoneState=JSON.parse(JSON.stringify(meta.zoneState));
  tasDeterministicCall(()=>loadStage(8));
  return {before,victory,ability:hasCapability('attunement'),boss:G.enemies.some(e=>e.boss&&!e.dead),
   door:G.obstacles.some(o=>o.courtAction==='emberdeep'),portal:G.portal};
 });
 assert.equal(r.before,false);assert.equal(r.victory.ability,true);assert.equal(r.victory.circuit,true);
 assert.equal(r.victory.portal,null);assert.equal(r.victory.key,false);assert.equal(r.victory.hazards,false);
 assert.equal(r.ability,true);assert.equal(r.boss,false);assert.equal(r.door,true);assert.equal(r.portal,null);
 assert.deepEqual(errors,[]);
});

// Isolated arena start; movement, dash, portal transport and combat use ordinary inputs.
test('White Court real portal transport and Rusty Sword finish work without invulnerability or Counter',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(runWhiteCourtFight,false,null,false,'right');

 assert.equal(r.mouths.length,2);assert.equal(r.hopped,true);
 assert.deepEqual(r.events.filter(e=>e.ward).map(e=>e.ward),[1,2,3]);
 assert.equal(r.breaks,3);assert.equal(r.bossDead,true);assert.equal(r.attunement,true);
 assert.equal(r.invulnerable,false);assert.equal(r.testMode,false);assert.equal(r.attemptLost,false);
 assert.equal(r.weapon,'Rusty Sword');assert.equal(r.dead,false);assert.deepEqual(errors,[]);
});

test('Thaw Court cold creates temporary footing that melts back into a recoverable basin',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  const tas=window.__BF.tas;
  Object.assign(G.p,{x:6930,y:70,vx:0,vy:0,onGround:true,floorPlat:null,invuln:60});
  let sheet=G.obstacles.find(o=>o.courtThawSurface);
  const initiallyAbsent=sheet.gone;
  for(let i=0;i<600&&sheet.gone;i++)tas.stepFrames(1,{});
  const frozen=!sheet.gone,reaction=BFReactionsModule.activeState(G.obstacles.find(o=>o.courtThawBasin))?.id;
  let stood=false;
  for(let i=0;i<140;i++){tas.stepFrames(1,{right:true,jump:i===95});stood ||= G.p.floorPlat===sheet;}
  const crossed=G.p.x>7260;
  for(let i=0;i<360&&!sheet.gone;i++)tas.stepFrames(1,{});
  const melted=sheet.gone;
  // A missed landing starts on the actual shallow floor; input must recover it.
  Object.assign(G.p,{x:7110,y:-30,vx:0,vy:0,onGround:true,floorPlat:null});
  let rewound=false;
  for(let i=0;i<360&&G.p.x<7300;i++){
   tas.stepFrames(1,{right:true,jump:i%75===1});rewound ||= G.p.x<6900;
  }
  const recovered=G.p.x>=7300&&!rewound;
  return {initiallyAbsent,frozen,reaction,stood,crossed,melted,recovered,x:G.p.x,y:G.p.y,dead:G.p.dead,
   recovery:G.obstacles.some(o=>o.type==='plat'&&o.x===7110&&o.y===-30)};
 });
 for(const key of ['initiallyAbsent','frozen','stood','crossed','melted','recovery','recovered'])assert.equal(r[key],true,key+' '+JSON.stringify(r));
 assert.equal(r.reaction,'flash-freeze');assert.equal(r.dead,false);assert.deepEqual(errors,[]);
});

// Attempt-state fixture isolates death/hydration from the combat-policy test.
test('White Court checkpoint death resets the boss attempt and keeps earlier solved work',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  const tas=window.__BF.tas;
  G.levelSelectMode=false;G.worldProgressEligible=true;
  meta.capabilities=G.sessionCapabilities;meta.zoneState=G.sessionZoneState;
  G.sessionCapabilities=null;G.sessionZoneState=null;
  for(const id of ['court-wheel','court-glass-cold','court-high-cache'])markPersistentCircuitOpen(id,'retry-test');
  Object.assign(G.p,{x:12340,y:0,vx:0,vy:0,onGround:true,floorPlat:null});
  tas.stepFrames(28,{right:true});const checkpoint={x:G.p.ckX,y:G.p.ckY};
  const e=G.boss;Object.assign(e,{courtBreaks:2,phase:3,hp:160,spellStunT:4,courtSecondT:.5,courtBlinkWind:.5});
  const receiver=G.obstacles.find(o=>o.courtBossReceiver);receiver.charge=1;
  G.obstacles.find(o=>o.courtColdStep).gone=false;
  G.obstacles.find(o=>o.courtGlaze).ice=true;
  G.projectiles.push({sourceType:'sorcerer',life:4,x:14000,y:100});
  G.aoes.push({courtAttack:true,t:2,x:14000,y:0,r:90,dmg:1});
  tasDeterministicCall(()=>die());
  return {checkpoint,x:G.p.x,y:G.p.y,breaks:G.boss.courtBreaks,hp:G.boss.hp,maxHp:G.boss.maxHp,
   stun:G.boss.spellStunT,second:G.boss.courtSecondT,blink:G.boss.courtBlinkWind,
   charge:G.obstacles.find(o=>o.courtBossReceiver).charge,
   coldStep:G.obstacles.find(o=>o.courtColdStep).gone,glaze:!!G.obstacles.find(o=>o.courtGlaze).ice,
   shots:G.projectiles.length,aoes:G.aoes.length,portalMouths:G.cratePortals.length,
   earlier:['court-wheel','court-glass-cold','court-high-cache'].map(persistentCircuitOpen)};
 });
 assert.deepEqual(r.checkpoint,{x:12400,y:40});assert.equal(r.x,12400);assert.equal(r.y,40);
 assert.equal(r.breaks,0);assert.equal(r.hp,r.maxHp);assert.equal(r.stun,0);assert.equal(r.second,0);assert.equal(r.blink,0);
 assert.equal(r.charge,0);assert.equal(r.coldStep,true);assert.equal(r.glaze,false);
 assert.equal(r.shots,0);assert.equal(r.aoes,0);assert.equal(r.portalMouths,0);
 assert.deepEqual(r.earlier,[true,true,true]);assert.deepEqual(errors,[]);
});

test('Thaw Court high cache landing needs the delayed second jump',async t=>{
 const {page,bot,errors}=await openHarness(t);const results=[];
 for(const doubleJump of [false,true]){
  await page.evaluate(bot.bootstrapStage,8);
  results.push(await page.evaluate(owned=>{
   if(!owned){G.sessionCapabilities=BFCapabilitiesModule.createState({...G.sessionCapabilities,
    acquired:G.sessionCapabilities.acquired.filter(id=>id!=='double-jump')});syncMovementCapabilities();}
   Object.assign(G.p,{x:7090,y:300,vx:0,vy:0,onGround:true,floorPlat:null,invuln:10});
   let landed=false,peak=G.p.y;
   for(let i=0;i<70;i++){
    window.__BF.tas.stepFrames(1,{right:true,jump:i<14||(i>=20&&i<38)});
    peak=Math.max(peak,G.p.y);landed ||= G.p.floorPlat?.x===7340&&G.p.onGround;
   }
   return {owned:hasCapability('double-jump'),landed,peak,x:G.p.x,y:G.p.y};
  },doubleJump));
 }
 assert.equal(results[0].owned,false);assert.equal(results[0].landed,false,JSON.stringify(results));
 assert.equal(results[1].owned,true);assert.equal(results[1].landed,true,JSON.stringify(results));
 assert.ok(results[1].peak>results[0].peak+30,JSON.stringify(results));assert.deepEqual(errors,[]);
});


test('White Court worker dialogue displays and clears when the player leaves',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  Object.assign(G.p,{x:3880,y:0,vx:0,vy:0,onGround:true,floorPlat:null});
  window.__BF.tas.stepFrames(1,{interact:true});
  const title=G.outskirtsAnnotation?.title,body=G.outskirtsAnnotation?.body;
  window.__BF.tas.stepFrames(100,{right:true});
  return {title,body,cleared:G.outskirtsAnnotation===null};
 });
 assert.match(r.title,/VEY/);assert.match(r.body,/wheel/i);assert.equal(r.cleared,true);assert.deepEqual(errors,[]);
});

test('Causeway high shaft is reachable continuously with the White Court capability prefix',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,2);
 const r=await page.evaluate(()=>{
  G.sessionCapabilities=levelSelectCapabilitiesForStage(8);syncMovementCapabilities();syncPortalCapabilities();
  Object.assign(G.p,{x:10450,y:0,vx:0,vy:0,onGround:true,floorPlat:null,invuln:30});
  const segments=[];
  for(const [x,y,moveAt] of [[10640,130,0],[10800,130,0],[10930,260,0],[11130,260,0],[11020,390,8],[10980,390,0]]){
   const jumping=y>G.p.y+10;let landed=false;
   for(let i=0;i<150;i++){
    const p=G.p,dx=x-p.x;
    window.__BF.tas.stepFrames(1,{right:dx>8&&i>=moveAt,left:dx< -8&&i>=moveAt,
     jump:jumping&&(i<20||(i>=22&&i<40))});
    if(p.onGround&&Math.abs(p.x-x)<22&&Math.abs(p.y-y)<3){landed=true;break;}
   }
   segments.push({target:[x,y],landed,x:G.p.x,y:G.p.y});if(!landed)break;
  }
  return {segments,action:outskirtsInteractionCandidate()?.courtAction};
 });
 assert.equal(r.segments.length,6,JSON.stringify(r));assert.ok(r.segments.every(s=>s.landed),JSON.stringify(r));
 assert.equal(r.action,'causeway-entry');assert.deepEqual(errors,[]);
});

test('Petition Gallery moving receiver accepts a real two-mouth cold return',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  const tas=window.__BF.tas;Object.assign(G.p,{x:11980,y:0,vx:0,vy:0,onGround:true,floorPlat:null,invuln:60});
  const receiver=G.obstacles.find(o=>o.courtGalleryReceiver),start=receiver.x;
  tas.stepFrames(2,{});tas.stepFrames(1,{portal:true});tas.stepFrames(1,{});
  tas.stepFrames(220,{left:true});tas.stepFrames(20,{});
  const closed=!circuitOpen('court-gallery-cold');
  tas.stepFrames(1,{portal:true});tas.stepFrames(1,{});
  const mouths=G.cratePortals.length;let hopped=false,min=Infinity,max=-Infinity;
  for(let i=0;i<650;i++){
   tas.stepFrames(1,{});min=Math.min(min,receiver.x);max=Math.max(max,receiver.x);
   hopped ||= G.projectiles.some(p=>p.courtCold&&p.portalHops>0);
  }
  Object.assign(G.p,{x:11710,y:270,vx:0,vy:0,onGround:true,floorPlat:null});
  let stood=false;
  for(let i=0;i<200;i++){tas.stepFrames(1,{right:true});stood ||= G.p.floorPlat?.zoneEntityId==='court-gallery-bridge';}
  return {closed,mouths,hopped,stood,crossed:G.p.x>12300,opened:circuitOpen('court-gallery-cold'),glass:circuitOpen('court-glass-cold'),
   travel:max-min,start,bridge:gateOpen(G.obstacles.find(o=>o.zoneEntityId==='court-gallery-bridge'))};
 });
 assert.equal(r.closed,true);assert.equal(r.mouths,2);assert.equal(r.hopped,true);assert.equal(r.opened,true);
 assert.equal(r.stood,true);assert.equal(r.crossed,true);assert.equal(r.glass,false);assert.ok(r.travel>200);assert.equal(r.bridge,true);assert.deepEqual(errors,[]);
});

test('first White Court ward freezes a useful crossing with an existing dry bypass',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  const tas=window.__BF.tas;Object.assign(G.p,{x:12880,y:0,vx:0,vy:0,onGround:true,floorPlat:null,invuln:60});
  const sheet=G.obstacles.find(o=>o.courtColdStep),initiallyAbsent=sheet.gone;
  const dry=[];let wet=false;
  for(const [x,y] of [[13030,65],[13135,65],[13275,65],[13500,0]]){
   const jump=y>=G.p.y&&Math.abs(x-G.p.x)>120;let landed=false;
   for(let i=0;i<180;i++){
    const p=G.p,dx=x-p.x;
    tas.stepFrames(1,{right:dx>8,left:dx< -8,jump:jump&&(i<20||(i>=22&&i<40))});
    wet ||= (p._fluidSub||0)>.05;
    if(p.onGround&&Math.abs(p.x-x)<22&&Math.abs(p.y-y)<3){landed=true;break;}
   }
   dry.push(landed);if(!landed)break;
  }
  // Ward-state fixture; the separate full-fight test proves real projectile capture.
  const receiver=G.obstacles.find(o=>o.courtBossReceiver);
  tasDeterministicCall(()=>breakCourtWard(receiver,{portalHops:1,stolenSpell:true,life:1}));
  const frozen=!sheet.gone;
  Object.assign(G.p,{x:13060,y:0,vx:0,vy:0,onGround:true,floorPlat:null});
  let stood=false;
  for(let i=0;i<105;i++){tas.stepFrames(1,{right:true});stood ||= G.p.floorPlat===sheet;}
  return {initiallyAbsent,dry,wet,frozen,stood,x:G.p.x,y:G.p.y};
 });
 assert.equal(r.initiallyAbsent,true);assert.deepEqual(r.dry,[true,true,true,true],JSON.stringify(r));
 assert.equal(r.wet,false);assert.equal(r.frozen,true);assert.equal(r.stood,true);assert.ok(r.x>13300);assert.ok(Math.abs(r.y)<.01);
 assert.deepEqual(errors,[]);
});

test('White Court paddle requests a warned cast through a real sword strike',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  const tas=window.__BF.tas,e=G.boss;
  Object.assign(G.p,{x:13365,y:0,vx:0,vy:0,onGround:true,floorPlat:null,face:1,invuln:20});
  Object.assign(e,{x:13700,active:true,courtCastCd:10,courtCastWind:0});
  // Keep the fixture camera with its relocated combatants for first engagement.
  G.cam=13100;G.camY=0;BFCamera.reset(G.cam,G.camY);
  tas.stepFrames(1,{attack:true});tas.stepFrames(1,{});
  const paddle=G.obstacles.find(o=>o.courtCastPaddle),struck=paddle.flash>0,requested=e.courtCastCd<.3;
  let warned=false,shot=false,warningFrames=0;
  for(let i=0;i<100;i++){
   tas.stepFrames(1,{attack:i%20===0});
   if(e.courtCastWind>0){warned=true;warningFrames++;}
   if(G.projectiles.some(p=>p.sourceType==='sorcerer')){shot=true;break;}
  }
  return {struck,requested,warned,shot,warningFrames,breaks:e.courtBreaks};
 });
 assert.equal(r.struck,true,JSON.stringify(r));assert.equal(r.requested,true);
 assert.equal(r.warned,true);assert.equal(r.shot,true);assert.ok(r.warningFrames>=55,JSON.stringify(r));
 assert.equal(r.breaks,0);assert.deepEqual(errors,[]);
});


test('White Court remains finishable after the final exposure expires',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(runWhiteCourtFight,false,null,true,'right');

 assert.equal(r.finalExposureExpired,true);assert.equal(r.bossDead,true);assert.equal(r.attunement,true);
 assert.equal(r.testMode,false);assert.equal(r.invulnerable,false);assert.equal(r.attemptLost,false);
 assert.deepEqual(r.events.filter(e=>e.ward).map(e=>e.ward),[1,2,3]);assert.deepEqual(errors,[]);
});

test('Glassworks missed bridge landing recovers without a checkpoint rewind',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  const tas=window.__BF.tas;
  // Start falling into the unsolved basin, then leave using ordinary movement.
  Object.assign(G.p,{x:10010,y:40,vx:0,vy:0,onGround:false,floorPlat:null});
  let rewound=false,landed=false,minY=G.p.y;
  for(let i=0;i<90;i++){
   tas.stepFrames(1,{});minY=Math.min(minY,G.p.y);
   rewound ||= G.p.x<9700;landed ||= G.p.onGround&&G.p.y<0;
  }
  for(let i=0;i<240&&!rewound&&G.p.x<10270;i++){
   tas.stepFrames(1,{right:true,jump:i%75<25});rewound ||= G.p.x<9700;
  }
  return {rewound,landed,minY,x:G.p.x,y:G.p.y,dead:G.p.dead,solved:circuitOpen('court-glass-cold')};
 });
 assert.equal(r.rewound,false,JSON.stringify(r));assert.equal(r.landed,true,JSON.stringify(r));
 assert.ok(r.x>=10270,JSON.stringify(r));assert.equal(r.dead,false);assert.equal(r.solved,false);assert.deepEqual(errors,[]);
});

test('White Court missed casts dissipate at both arena edges',async t=>{
 const {page,bot,errors}=await openHarness(t);
 for(const side of ['left','right']){
  await page.evaluate(bot.bootstrapStage,8);
  const r=await page.evaluate(side=>{
   const tas=window.__BF.tas,b=G.boss;
   // Endpoint positions isolate the boundary; the boss creates each shot normally.
   Object.assign(G.p,{x:side==='left'?13020:15020,y:0,vx:0,vy:0,onGround:true,floorPlat:null,invuln:60});
   b.x=side==='left'?13400:14700;
   const shots=new Set();let escaped=false;
   for(let i=0;i<720;i++){
    tas.stepFrames(1,{});
    for(const pr of G.projectiles)if(pr.sourceType==='sorcerer'){
     shots.add(pr);escaped ||= pr.x<b.spellArenaL||pr.x>b.spellArenaR;
    }
   }
   return {side,shots:shots.size,escaped,breaks:b.courtBreaks};
  },side);
  assert.ok(r.shots>=1,JSON.stringify(r));assert.equal(r.escaped,false,JSON.stringify(r));assert.equal(r.breaks,0);
 }
 assert.deepEqual(errors,[]);
});

test('White Court wrong pair can miss repeatedly and be replaced for a real capture',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  const tas=window.__BF.tas,seen=new Set();let corrected=false;
  // Position fixtures isolate pair ownership/retry, not movement or combat survival.
  function placeAt(x){
   Object.assign(G.p,{x,y:0,vx:0,vy:0,onGround:true,floorPlat:null,invuln:120});
   tas.stepFrames(2,{});tas.stepFrames(1,{portal:true});tas.stepFrames(1,{});
  }
  placeAt(13700);placeAt(14522);
  const stale=G.cratePortals.slice();
  Object.assign(G.p,{x:14485,y:0,vx:0,vy:0,onGround:true});
  function lure(){
   const p=G.p,b=G.boss;
   tas.stepFrames(1,{right:b.courtCastWind>0||p.x<(corrected?14557:14475),left:b.courtCastWind<=0&&p.x>(corrected?14567:14485)});
   for(const pr of G.projectiles)if(pr.stolenSpell&&pr.portalHops>0)seen.add(pr);
  }
  for(let i=0;i<1800;i++)lure();
  const missedReturns=seen.size,breaksBefore=G.boss.courtBreaks,retained=stale.every(o=>G.cratePortals.includes(o));
  while(G.hitstop>0)tas.stepFrames(1,{});
  tas.stepFrames(1,{portal:true});tas.stepFrames(1,{});const cleared=G.cratePortals.length===0;
  placeAt(13960);placeAt(14522);
  const replaced=G.cratePortals.length===2&&G.cratePortals.every(o=>!stale.includes(o));
  Object.assign(G.p,{x:14485,y:0,vx:0,vy:0,onGround:true});
  corrected=true;G.p.x=14567;
  for(let i=0;i<1800&&G.boss.courtBreaks===0;i++)lure();
  return {missedReturns,breaksBefore,retained,cleared,replaced,breaksAfter:G.boss.courtBreaks,player:[G.p.x,G.p.y],boss:G.boss.x,mouths:G.cratePortals,returns:[...seen].slice(-8).map(p=>({x:p.x,y:p.y,hops:p.portalHops,life:p.life}))};
 });
 assert.ok(r.missedReturns>=3,JSON.stringify(r));assert.equal(r.breaksBefore,0,JSON.stringify(r));
 for(const key of ['retained','cleared','replaced'])assert.equal(r[key],true,JSON.stringify(r));
 assert.equal(r.breaksAfter,1,JSON.stringify(r));assert.deepEqual(errors,[]);
});

test('White Court resumes pursuit after a blink warning expires',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  const tas=window.__BF.tas,b=G.boss;
  Object.assign(G.p,{x:14600,y:0,vx:0,vy:0,onGround:true,invuln:60});
  // Isolate the final tick of a warned blink, including a fractional remainder.
  b.courtBlinkWind=.01;b.courtBlinkX=13700;b.courtCastCd=2;
  tas.stepFrames(2,{});const wind=b.courtBlinkWind,start=b.x;
  tas.stepFrames(90,{});
  return {wind,start,end:b.x};
 });
 assert.equal(r.wind,0,JSON.stringify(r));assert.ok(r.end>r.start+50,JSON.stringify(r));assert.deepEqual(errors,[]);
});

test('White Court receiver accepts near-edge returns but rejects clear lateral misses',async t=>{
 const {page,bot,errors}=await openHarness(t);
 for(const offset of [-50,50,-65,65]){
  await page.evaluate(bot.bootstrapStage,8);
  const r=await page.evaluate(offset=>{
   const tas=window.__BF.tas,returned=new Set();
   // Position/damage fixtures isolate real projectile transport and capture width.
   function placeAt(x){
    Object.assign(G.p,{x,y:0,vx:0,vy:0,onGround:true,floorPlat:null,invuln:60});
    tas.stepFrames(2,{});tas.stepFrames(1,{portal:true});tas.stepFrames(1,{});
   }
   placeAt(13960+offset);placeAt(14870);
   Object.assign(G.p,{x:14915,y:0,vx:0,vy:0,onGround:true});
   for(let i=0;i<1200&&G.boss.courtBreaks===0;i++){
    const p=G.p,b=G.boss;
    tas.stepFrames(1,{right:b.courtCastWind>0||p.x<14910,left:b.courtCastWind<=0&&p.x>14920});
    for(const pr of G.projectiles)if(pr.stolenSpell&&pr.portalHops>0&&Math.abs(pr.x-(13960+offset))<1)returned.add(pr);
   }
   return {offset,returned:returned.size,breaks:G.boss.courtBreaks,player:[G.p.x,G.p.y]};
  },offset);
  assert.ok(r.returned>0,JSON.stringify(r));
  assert.equal(r.breaks,Math.abs(offset)===50?1:0,JSON.stringify(r));
 }
 assert.deepEqual(errors,[]);
});

test('White Court shallow arena channel has walkable recovery on both banks',async t=>{
 const {page,bot,errors}=await openHarness(t);
 for(const side of ['left','right']){
  await page.evaluate(bot.bootstrapStage,8);
  const r=await page.evaluate(side=>{
   const tas=window.__BF.tas;
   Object.assign(G.p,{x:13200,y:-30,vx:0,vy:0,onGround:true,floorPlat:null,invuln:60});
   let rewind=false,minY=G.p.y;
   for(let i=0;i<240;i++){
    tas.stepFrames(1,{left:side==='left',right:side==='right'});
    minY=Math.min(minY,G.p.y);rewind ||= G.p.x<12900;
    if(rewind||(side==='right'?G.p.x>13350:G.p.x<13050))break;
   }
   return {side,rewind,minY,x:G.p.x,y:G.p.y};
  },side);
  assert.equal(r.rewind,false,JSON.stringify(r));assert.ok(r.minY>=-30.01,JSON.stringify(r));
  assert.ok(side==='right'?r.x>13350:r.x<13050,JSON.stringify(r));assert.ok(Math.abs(r.y)<.01,JSON.stringify(r));
 }
 assert.deepEqual(errors,[]);
});

test('White Court left-entry route survives recovery and wins against active pursuit',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(runWhiteCourtFight,false,null,false,'left');
 assert.equal(r.bossDead,true,JSON.stringify(r));assert.equal(r.attunement,true);
 assert.equal(r.changedSide,true);assert.equal(r.attemptLost,false);assert.equal(r.dead,false);
 assert.equal(r.invulnerable,false);assert.equal(r.testMode,false);assert.equal(r.weapon,'Rusty Sword');
 assert.deepEqual(r.events.filter(e=>e.ward).map(e=>e.ward),[1,2,3]);
 assert.ok(r.returns.some(p=>p.ward===0&&Math.abs(p.x-13960)<1));assert.deepEqual(errors,[]);
});

test('White Court high cache route replays continuously from the authored arrival',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const route=JSON.parse(await readFile(new URL('../docs/charters/09-frost-sorcerer/evidence/high-route.json',import.meta.url),'utf8'));
 const r=await page.evaluate(route=>{
  const tas=window.__BF.tas;G.p.invuln=600;
  const start=[G.p.x,G.p.y],landings=[];let frame=0;
  for(const segment of route.segments){
   for(let i=0;i<segment.frames;i++)tas.stepFrames(1,route.inputs[frame++]);
   landings.push({target:segment.target,x:G.p.x,y:G.p.y,ground:G.p.onGround});
  }
  tas.stepFrames(1,{interact:true});
  return {start,frame,landings,cache:persistentCircuitOpen('court-high-cache'),dead:G.p.dead};
 },route);
 assert.deepEqual(r.start,[4800,0]);assert.equal(r.frame,route.inputs.length);assert.equal(r.cache,true);assert.equal(r.dead,false);
 for(const p of r.landings){assert.ok(Math.abs(p.x-p.target[0])<22&&Math.abs(p.y-p.target[1])<3,JSON.stringify(p));assert.equal(p.ground,true);}
 assert.deepEqual(errors,[]);
});

test('White Court gallery recollection and checkpoint connect through continuous movement',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const route=JSON.parse(await readFile(new URL('../docs/charters/09-frost-sorcerer/evidence/gallery-route.json',import.meta.url),'utf8'));
 const r=await page.evaluate(route=>{
  const tas=window.__BF.tas;
  // One initial position/damage fixture; no resets between ledges or the descent.
  Object.assign(G.p,{x:10820,y:0,vx:0,vy:0,onGround:true,floorPlat:null,invuln:600});
  const landings=[];let frame=0;
  for(const segment of route.segments){
   for(let i=0;i<segment.frames;i++)tas.stepFrames(1,route.inputs[frame++]);
   landings.push({target:segment.target,x:G.p.x,y:G.p.y,ground:G.p.onGround});
  }
  tas.stepFrames(1,{interact:true});
  const found=!!G.obstacles.find(o=>o.sealedRecollection==='frost-sorcerer')?.read;
  let rewind=false;
  for(let i=0;i<500&&G.p.x<12400;i++){tas.stepFrames(1,{right:true});rewind ||= G.p.x<10800;}
  return {landings,found,rewind,x:G.p.x,y:G.p.y,checkpoint:G.p.ckX,dead:G.p.dead};
 },route);
 for(const p of r.landings){assert.ok(Math.abs(p.x-p.target[0])<22&&Math.abs(p.y-p.target[1])<3,JSON.stringify(p));assert.equal(p.ground,true);}
 assert.equal(r.found,true);assert.equal(r.rewind,false);assert.equal(r.dead,false);
 assert.ok(r.x>=12400,JSON.stringify(r));assert.ok(Math.abs(r.y)<.01,JSON.stringify(r));assert.equal(r.checkpoint,12400);assert.deepEqual(errors,[]);
});

test('White Court overlook is reachable, quiet and frames the arena until movement or timeout',async t=>{
 const {page,bot,errors}=await openHarness(t);
 const route=JSON.parse(await readFile(new URL('../docs/charters/09-frost-sorcerer/evidence/overlook-route.json',import.meta.url),'utf8'));
 for(const [width,height,reduced] of [[1440,900,false],[640,360,true]]){
  await page.evaluate(bot.bootstrapStage,8);
  const r=await page.evaluate(({route,width,height,reduced})=>{
   mainCanvas.width=width;mainCanvas.height=height;recalcVP();meta.soundOn=false;meta.reducedMotion=reduced;
   BFCamera.applySettings({reducedMotion:reduced});
   const tas=window.__BF.tas;
   Object.assign(G.p,{x:12400,y:0,vx:0,vy:0,onGround:true,floorPlat:null,invuln:0});
   const blood=G.p.blood;
   for(const input of route.inputs)tas.stepFrames(1,input);
   const landed=G.p.onGround&&Math.abs(G.p.y-190)<1&&Math.abs(G.p.x-12900)<30;
   tas.stepFrames(1,{interact:true});const opened=!!G.authoredCameraFocus?.courtLook;
   tas.stepFrames(120,{});
   const receiver=G.obstacles.find(o=>o.courtBossReceiver);
   const visible=x=>x>G.cam&&x<G.cam+VW;
   const framed=visible(receiver.x-receiver.w/2)&&visible(receiver.x+receiver.w/2)&&visible(G.boss.x-G.boss.w/2)&&visible(G.boss.x+G.boss.w/2);
   const slateVisible=G.obstacles.filter(o=>o.slate&&o.y===0&&Math.min(o.x+o.w/2,G.cam+VW)-Math.max(o.x-o.w/2,G.cam)>60).length;
   const vertical=GROUND_Y+G.camY<=VH&&GROUND_Y-receiver.y-receiver.h/2+G.camY>=0;
   const quiet=!G.boss.active&&G.p.blood===blood,viewCam=G.cam;
   tas.stepFrames(1,{left:true});const cancelled=!G.authoredCameraFocus;
   tas.stepFrames(45,{});const returned=G.cam<viewCam-300;
   tas.stepFrames(1,{interact:true});const reopened=!!G.authoredCameraFocus?.courtLook;
   tas.stepFrames(280,{});const expired=!G.authoredCameraFocus;
   return {width,height,reduced,vertical,landed,opened,framed,slateVisible,quiet,cancelled,returned,reopened,expired,blood:G.p.blood,startBlood:blood};
  },{route,width,height,reduced});
  for(const key of ['vertical','landed','opened','framed','quiet','cancelled','returned','reopened','expired'])assert.equal(r[key],true,JSON.stringify(r));
  assert.ok(r.slateVisible>=2,JSON.stringify(r));assert.equal(r.blood,r.startBlood,JSON.stringify(r));
 }
 assert.deepEqual(errors,[]);
});

test('White Court local frost warns, freezes briefly, dries and clears on a returned spell',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  const e=G.boss,patch=G.obstacles.find(o=>o.courtGlaze);
  e.courtBreaks=1;e.active=true;e.courtCastCd=100;e.courtBlinkCd=100;e.courtStormCd=100;
  const samples=[];
  for(let i=0;i<360;i++){
   updateWhiteCourtBoss(e,G.p,1/60);
   samples.push({warn:patch.courtFrostWarn,ice:patch.ice});
  }
  // A genuine returned payload must clear an already frozen patch immediately.
  e.courtFrostT=1.5;updateWhiteCourtBoss(e,G.p,1/60);
  const frozenBefore=patch.ice;
  const receiver=G.obstacles.find(o=>o.boss===e&&o.courtBossReceiver);
  const captured=breakCourtWard(receiver,{life:1,portalHops:1,stolenSpell:true});
  const cleared=!patch.ice&&!patch.courtFrostWarn;
  updateWhiteCourtBoss(e,G.p,1/60);
  return {samples,frozenBefore,captured,cleared,stunnedDry:!patch.ice&&!patch.courtFrostWarn};
 });
 for(const i of [0,30,55])assert.deepEqual(r.samples[i],{warn:true,ice:false});
 for(const i of [65,120,175])assert.deepEqual(r.samples[i],{warn:false,ice:true});
 for(const i of [185,240,350])assert.deepEqual(r.samples[i],{warn:false,ice:false});
 assert.ok(r.frozenBefore&&r.captured&&r.cleared&&r.stunnedDry);assert.deepEqual(errors,[]);
});

test('White Court staggered casts keep distinct visual identities and committed follow-up aim',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  const e=G.boss;Object.assign(e,{courtBreaks:1,courtCastWind:1/60,courtAimX:14500,courtAimY:2,courtBlinkCd:100,courtStormCd:100});
  Object.assign(G.p,{x:14400,y:0});G.projectiles=[];
  updateWhiteCourtBoss(e,G.p,1/60);
  const locked=[e.courtSecondX,e.courtSecondY],warning=e.courtSecondT;
  G.p.x=14800;
  for(let i=0;i<43;i++)updateWhiteCourtBoss(e,G.p,1/60);
  return {locked,warning,shots:G.projectiles.map(p=>({cast:p.courtCast,el:p.el,stealable:p.stealable})),aim:[e.courtSecondX,e.courtSecondY]};
 });
 assert.deepEqual(r.locked,[14400,2]);assert.deepEqual(r.aim,r.locked);assert.ok(Math.abs(r.warning-.7)<1e-6);
 assert.deepEqual(r.shots.map(p=>p.cast),['payload','followup']);
 assert.ok(r.shots.every(p=>p.el==='ice'&&p.stealable));assert.deepEqual(errors,[]);
});

test('White Court first cast waits for both combatants to enter the viewport',async t=>{
 const {page,bot,errors}=await openHarness(t);await page.evaluate(bot.bootstrapStage,8);
 const r=await page.evaluate(()=>{
  const e=G.boss;Object.assign(G.p,{x:13400,y:0});G.cam=13000;VW=800;
  e.courtCastCd=0;e.courtBlinkCd=0;G.projectiles=[];
  const start=e.x;
  for(let i=0;i<60;i++)updateWhiteCourtBoss(e,G.p,1/60);
  const hidden={wind:e.courtCastWind,blink:e.courtBlinkWind,shots:G.projectiles.length,pursued:e.x<start};
  G.cam=13300;VW=1100;updateWhiteCourtBoss(e,G.p,1/60);
  return {hidden,wind:e.courtCastWind,engaged:e.courtEngaged,shots:G.projectiles.length};
 });
 assert.deepEqual(r.hidden,{wind:0,blink:0,shots:0,pursued:true});
 assert.ok(Math.abs(r.wind-1.05)<1e-6);assert.equal(r.engaged,true);assert.equal(r.shots,0);assert.deepEqual(errors,[]);
});
