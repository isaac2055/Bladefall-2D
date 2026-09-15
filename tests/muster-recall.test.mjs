import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import puppeteer from 'puppeteer';

// The recall is Frostfell's Muster Engine reaching the rest of the world. These
// tests load each return region as the recall left it, through the same zone
// hydration hook a real load uses, and check the things the owner's decisions
// forbid getting wrong: nothing spawns on a safe site, an arrival or a
// checkpoint; a reload never duplicates a post; ordinary health is upgraded once; and the signaler is a telegraphed, interruptible call.
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
  t.after(async () => { await browser.close(); server.close(); });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__BF?.tas);
  const bot = await import('../scripts/bladefall-bot.mjs');
  return { page, bot, errors };
}

const REGIONS = [[6, 'warden'], [0, 'outskirts'], [1, 'black-woods'], [2, 'brute']];

test('every return region installs its roster once, clear of safe sites, arrivals and checkpoints', async (t) => {
  const { page, bot, errors } = await openHarness(t);
  for (const [stage, zoneId] of REGIONS) {
    await page.evaluate(bot.bootstrapStage, { stage, muster: true });
    const r = await page.evaluate((zoneId) => {
      const rows = MUSTER_ROSTERS[zoneId];
      const units = () => G.enemies.filter((e) => e.muster);
      const bad = [];
      const checks = G.obstacles.filter((o) => o.type === 'check');
      const residents = G.obstacles.filter((o) => o.type === 'ambientFigure' && (o.residentId || o.questActor));
      const npcs = G.npcs || [];
      for (const [type, x, y = 0, lo, hi] of rows) {
        if (type === 'standard') continue;
        if (x < 220 || x > G.levelLength - 220) bad.push(`${type}@${x}: overlaps arrival landing`);
        if (type === 'standard') continue;
        if (!EARCH[type]) bad.push(`${type}: no archetype`);
        if (!BladefallEcology.SPECIES[type]) bad.push(`${type}: no species profile`);
        if (!(lo < x && x < hi)) bad.push(`${type}@${x}: patrol ${lo}-${hi} does not contain it`);
        for (const c of checks) if (Math.abs(c.x - x) < 200 && Math.abs((c.y || 0) - y) < 60) bad.push(`${type}@${x}: on checkpoint ${c.x}`);
        for (const o of residents) if (Math.abs(o.x - x) < 350 && Math.abs((o.y || 0) - y) < 80) bad.push(`${type}@${x}: on resident ${o.residentId || o.questActor}`);
        for (const n of npcs) if (Math.abs(n.x - x) < 350 && Math.abs((n.y || 0) - y) < 80) bad.push(`${type}@${x}: on npc ${n.profileId || n.kind}`);
        // A post has to stand on something: a unit authored into a pit only
        // looks placed until the ecology recovers it somewhere else.
        if (EARCH[type].kind !== 'fly') {
          const footing = G.obstacles.some((o) => o.type === 'plat' && !o.ceiling && !o.fake && !o.invisible &&
            x >= o.x - o.w / 2 && x <= o.x + o.w / 2 && Math.abs((o.y || 0) - y) <= 2);
          if (!footing) bad.push(`${type}@${x},${y}: no platform under it`);
        }
      }
      const expected = rows.filter((r) => r[0] !== 'standard').length;
      const first = units().length;
      // Reinstalling in place is a no-op; a real reload goes through the hook and must land on exactly one roster.
      installMusterRoster(zoneId);
      const reinstalled = units().length;
      loadStage(G.stageIndex);
      const reloaded = units().length;
      const bossesRecalled = G.enemies.filter((e) => e.boss).length;
      const musterBoss = units().filter((e) => e.boss).length;
      const ids = units().map((e) => e.zoneEntityId);
      const hpScale = G.ngHp * (1 + G.stageIndex * 0.10);
      const inflated = units().filter((e) => e.maxHp !== Math.round(Math.round(EARCH[e.type].hp * hpScale) * 1.55)).map((e) => `${e.type}:${e.maxHp}`);
      const carriesLoot = units().filter((e) => !e.noDrop).length;
      const elite = units().filter((e) => e.elite).length;
      const standards = G.obstacles.filter((o) => o.musterStandard).length;
      // Like for like: the same load path without the recall must carry the
      // same bosses, so the event neither adds one nor brings one back.
      window.__BF_MUSTER_FORCE = undefined; G.musterForced = false;
      loadStage(G.stageIndex);
      const bossesQuiet = G.enemies.filter((e) => e.boss).length;
      window.__BF_MUSTER_FORCE = true;
      return { bad, expected, first, reinstalled, reloaded, uniqueIds: new Set(ids).size, ids: ids.length,
        inflated, carriesLoot, elite, standards, bossesRecalled, bossesQuiet, musterBoss };
    }, zoneId);
    assert.deepEqual(r.bad, [], `${zoneId}: roster hygiene`);
    assert.equal(r.first, r.expected, `${zoneId}: the roster installs`);
    assert.equal(r.reinstalled, r.expected, `${zoneId}: reinstalling is a no-op`);
    assert.equal(r.reloaded, r.expected, `${zoneId}: a reload lands on exactly one roster`);
    assert.equal(r.uniqueIds, r.ids, `${zoneId}: stable ids are unique`);
    assert.deepEqual(r.inflated, [], `${zoneId}: health receives exactly one recall multiplier`);
    assert.equal(r.carriesLoot, 0, `${zoneId}: no loot carpet`);
    assert.equal(r.elite, 0, `${zoneId}: recall soldiers never roll elite`);
    assert.ok(r.standards >= 1, `${zoneId}: physical evidence is raised`);
    assert.equal(r.musterBoss, 0, `${zoneId}: no recall unit is a boss`);
    assert.equal(r.bossesRecalled, r.bossesQuiet, `${zoneId}: the recall neither adds a boss nor brings one back`);
  }
  // And without the recall, nothing changes.
  await page.evaluate(bot.bootstrapStage, { stage: 0, muster: false });
  const quiet = await page.evaluate(() => ({ units: G.enemies.filter((e) => e.muster).length, standards: G.obstacles.filter((o) => o.musterStandard).length }));
  assert.deepEqual(quiet, { units: 0, standards: 0 });
  assert.deepEqual(errors, []);
});

test('the signaler telegraphs, wakes the dormant posts, and can be interrupted', async (t) => {
  const { page, bot } = await openHarness(t);
  await page.evaluate(bot.bootstrapStage, { stage: 0, muster: true });
  const r = await page.evaluate(() => {
    const tas = window.__BF.tas;
    const signaler = G.enemies.find((e) => e.musterRole === 'signaler');
    const posts = G.enemies.filter((e) => e.muster && e.type === 'grunt');
    // Debug setup: the knight is placed inside the signaler's notice range but
    // outside the posts' own, so only the call can wake them.
    G.p.x = signaler.x - 150; G.p.y = 0; G.p.vx = 0; G.p.vy = 0;
    // Isolate hearing from the globally enlarged visual notice range.
    for (const e of posts) { e.noticeRange = 1; e.active = false; }
    tas.saveState('near');
    const dormantBefore = posts.every((e) => !e.active);
    let calledAt = null;
    for (let i = 0; i < 160 && posts.some((e) => !e.active); i++) { tas.stepFrames(1, {}); if (signaler.signalT > 0 && calledAt === null) calledAt = i; }
    const woke = posts.every((e) => e.active && e.roused > 0);
    // Interrupt: strike during the wind-up and the call breaks.
    tas.restoreState('near');
    const s2 = G.enemies.find((e) => e.musterRole === 'signaler');
    const p2 = G.enemies.filter((e) => e.muster && e.type === 'grunt');
    for (let i = 0; i < 60 && !(s2.signalT > 0); i++) tas.stepFrames(1, {});
    const windingUp = s2.signalT > 0;
    hitEnemy(s2, 4, 1, 0, 0, null, 'melee');
    tas.stepFrames(70, {});
    return { dormantBefore, calledAt, woke, windingUp, brokenCall: s2.signalT === 0 && s2.signalCd > 0, stillDormant: p2.every((e) => !e.active) };
  });
  assert.equal(r.dormantBefore, true, 'the posts start dormant');
  assert.ok(r.calledAt !== null, 'the signaler winds up when the knight is near');
  assert.equal(r.woke, true, 'the call wakes the posts');
  assert.equal(r.windingUp, true);
  assert.equal(r.brokenCall, true, 'a strike during the wind-up breaks the call');
  assert.equal(r.stillDormant, true, 'a broken call wakes nothing');
});

test('recalled residents say so, and only once the recall has happened', async (t) => {
  const { page, bot } = await openHarness(t);
  await page.evaluate(bot.bootstrapStage, { stage: 2, muster: true });
  const r = await page.evaluate(() => {
    const oren = G.obstacles.find((o) => o.questActor === 'oren');
    const recalled = ambientFigureDialogue(oren, true);
    window.__BF_MUSTER_FORCE = undefined; G.musterForced = false;
    const before = ambientFigureDialogue(oren, true);
    return { recalled, before, registry: BFDialogueModule.text('causeway.oren.muster') };
  });
  assert.equal(r.recalled, r.registry);
  assert.notEqual(r.before, r.registry);
  assert.match(r.recalled, /chain counted again/);
});

test('the recall strengthens ordinary enemies in all sixteen regions exactly once, never bosses', async (t) => {
  const { page, bot, errors } = await openHarness(t);
  for (let stage = 0; stage < 16; stage++) {
    await page.evaluate(bot.bootstrapStage, { stage, muster: false });
    const before = await page.evaluate(() => G.enemies.map(e => ({ id:e._zoneEntityId, hp:e.maxHp, dmg:e.dmg, boss:e.boss })));
    await page.evaluate(bot.bootstrapStage, { stage, muster: true });
    const check = await page.evaluate((before) => {
      const errors=[];
      for(const old of before){
        const e=G.enemies.find(e=>e._zoneEntityId===old.id);if(!e){errors.push('missing '+old.id);continue;}
        const expected=old.boss?old.hp:Math.round(old.hp*1.55);
        if(Math.abs(e.dmg-old.dmg*(old.boss?1:1.25))>1e-8)errors.push('damage '+e.type);
        if(e.maxHp!==expected)errors.push(e.type+': '+e.maxHp+' expected '+expected);
        if(!e.boss&&e.noticeRange<480)errors.push('notice '+e.type);
        const once=e.maxHp;applyRecallBaseline(e);applyRecallBaseline(e);
        if(e.maxHp!==once)errors.push('stacked '+e.type);
        if(e.boss&&e.musterUpgraded)errors.push('boss upgraded');
      }
      return errors;
    }, before);
    assert.deepEqual(check, [], `stage ${stage}`);
  }
  assert.deepEqual(errors, []);
});

test('each return region has its own role early on the actual arrival route', async (t) => {
  const { page, bot } = await openHarness(t);
  for(const [stage,type,x,y] of [[6,'gaoler',330,0],[0,'outrider',70,500],[1,'canopywing',70,0],[2,'chainmarshal',70,0]]){
    await page.evaluate(bot.bootstrapStage,{stage,muster:true});
    const r=await page.evaluate(({type,x,y})=>{
      const actors=G.enemies.filter(e=>e.muster),unique=actors.filter(e=>e.type===type);
      return {count:actors.length,first:Math.min(...unique.map(e=>Math.abs(e.x-x))),
        unique:unique.length,large:unique.some(e=>e.h>=76||e.w>=54),
        standards:G.obstacles.some(o=>o.musterStandard&&Math.abs(o.x-x)<600)};
    },{type,x,y});
    assert.ok(r.count>=12,`${type}: a regional roster, not a handful of posts`);
    assert.ok(r.unique>=3,`${type}: repeated regional identity`);
    // Outskirts arrives atop a sealed chimney above a refuge; its first combat
    // pocket follows the safe descent (under seven seconds at normal run speed).
    assert.ok(r.first<1500,`${type}: encounter in the first ten seconds`);
    assert.equal(r.standards,true,`${type}: evidence at the actual entrance`);
  }
});

test('regional attacks commit, recover, and the gaoler lash costs two Blood without a checkpoint teleport', async (t) => {
  const {page,bot}=await openHarness(t);
  await page.evaluate(bot.bootstrapStage,{stage:6,muster:true});
  const lash=await page.evaluate(()=>{
    const e=G.enemies.find(e=>e.type==='gaoler'),p=G.p;
    Object.assign(p,{x:e.x+200,y:0,vx:0,vy:0,blood:5,invuln:0,dodgeTimer:0,dead:false,starT:0,ckX:14000});
    e.recallCooldown=0;updateRegionalRecallEnemy(e,p,1/60,e.speed);
    const warning=e.recallState==='windup';
    for(let i=0;i<50;i++)updateRegionalRecallEnemy(e,p,1/60,e.speed);
    return {warning,blood:p.blood,x:p.x,vx:p.vx,state:e.recallState};
  });
  assert.equal(lash.warning,true);assert.equal(lash.blood,3);
  assert.equal(lash.x,1050);assert.ok(lash.vx<0);assert.equal(lash.state,'strike');
  await page.evaluate(bot.bootstrapStage,{stage:0,muster:true});
  const charge=await page.evaluate(()=>{
    const e=G.enemies.find(e=>e.type==='outrider'),p=G.p;
    p.x=e.x+170;p.y=0;e.recallCooldown=0;updateRegionalRecallEnemy(e,p,1/60,e.speed);
    const dir=e.recallDir;p.x=e.x-160;
    for(let i=0;i<40;i++)updateRegionalRecallEnemy(e,p,1/60,e.speed);
    const locked=e.recallDir===dir&&e.recallState==='strike';
    for(let i=0;i<30;i++)updateRegionalRecallEnemy(e,p,1/60,e.speed);
    return {locked,recovery:e.recallState==='recover'};
  });
  assert.deepEqual(charge,{locked:true,recovery:true});
  await page.evaluate(bot.bootstrapStage,{stage:1,muster:true});
  const wing=await page.evaluate(()=>{
    const e=G.enemies.find(e=>e.type==='canopywing'&&e.x>2500),p=G.p;
    p.x=e.x+150;p.y=e.y-80;e.recallCooldown=0;updateRegionalRecallEnemy(e,p,1/60,e.speed);
    const aim=e.recallAimX,start=e.x;p.x=e.x-150;
    for(let i=0;i<55;i++)updateRegionalRecallEnemy(e,p,1/60,e.speed);
    return {locked:e.recallAimX===aim,moved:e.x>start};
  });
  assert.deepEqual(wing,{locked:true,moved:true});
  await page.evaluate(bot.bootstrapStage,{stage:2,muster:true});
  const formation=await page.evaluate(()=>{
    const e=G.enemies.find(e=>e.type==='chainmarshal'&&e.x>3000),p=G.p;
    p.x=e.x-250;p.y=0;updateRegionalRecallEnemy(e,p,1/60,e.speed);
    const line=G.enemies.find(a=>a.type==='linesman'&&Math.abs(a.x-e.x)<460);
    const from=line.x;updateOrdinaryEnemyAI(line,p,1/60,line.speed,{},{});
    return {formed:e.recallFormation,shield:e.frontShield,damage:e.bloodDamage,supportMoved:line.x<from};
  });
  assert.deepEqual(formation,{formed:true,shield:true,damage:2,supportMoved:true});
});

test('regional roles enter windup and strike through real fixed-frame gameplay', async (t) => {
  const {page,bot,errors}=await openHarness(t);
  for(const [stage,type,x,y] of [[6,'gaoler',850,0],[0,'outrider',1460,0],[1,'canopywing',3160,230],[2,'chainmarshal',3870,0]]){
    await page.evaluate(bot.bootstrapStage,{stage,muster:true});
    const r=await page.evaluate(({type,x,y})=>{
      const e=G.enemies.find(a=>a.type===type&&Math.abs(a.x-x)<20),p=G.p;
      // Isolated encounter setup, then the actual update loop owns AI/physics.
      Object.assign(p,{x:x+110,y:type==='canopywing'?0:y,vx:0,vy:0,invuln:30});
      const seen=new Set();
      for(let i=0;i<240;i++){window.__BF.tas.stepFrames(1,{});seen.add(e.recallState);}
      return {seen:[...seen],finite:Number.isFinite(e.x)&&Number.isFinite(e.y)};
    },{type,x,y});
    assert.ok(r.seen.includes('windup'),`${type}: live windup ${r.seen}`);
    assert.ok(r.seen.includes('strike'),`${type}: live attack ${r.seen}`);
    assert.ok(r.seen.includes('recover'),`${type}: live recovery ${r.seen}`);
    assert.equal(r.finite,true);
  }
  assert.deepEqual(errors,[]);
});

test('first recall re-garrisons dead ordinary enemies once, preserving bosses, gates and later deaths', async (t) => {
  const {page,bot}=await openHarness(t);
  await page.evaluate(bot.bootstrapStage,{stage:2,muster:false});
  const r=await page.evaluate(()=>{
    const ordinary=G.enemies.find(e=>!e.boss&&!e.unique),boss=G.boss;
    const ordinaryId=ordinary._zoneEntityId,bossId=boss._zoneEntityId;
    ordinary.dead=true;boss.dead=true;
    markPersistentCircuitOpen('recall-preserved-door','fixture');
    G.openedZoneShortcuts.push('recall-preserved-shortcut');
    captureCurrentZonePersistence();
    const old=JSON.stringify(G.sessionZoneState);
    window.__BF_MUSTER_FORCE=true;G.musterForced=true;loadStage(2);
    const revived=G.enemies.find(e=>e._zoneEntityId===ordinaryId);
    const first={revived:!!revived&&!revived.dead,boss:G.enemies.some(e=>e._zoneEntityId===bossId&&!e.dead),
      gate:persistentCircuitOpen('recall-preserved-door'),shortcut:G.openedZoneShortcuts.includes('recall-preserved-shortcut'),
      marked:persistentCircuitOpen('recall-garrisoned-v1')};
    revived.dead=true;captureCurrentZonePersistence();
    const saved=JSON.parse(JSON.stringify(G.sessionZoneState));
    loadStage(2);
    const deadAfter= !G.enemies.some(e=>e._zoneEntityId===ordinaryId&&!e.dead);
    G.sessionZoneState=JSON.parse(JSON.stringify(saved));loadStage(2);
    const deadAfterReload=!G.enemies.some(e=>e._zoneEntityId===ordinaryId&&!e.dead);
    const hp=G.enemies.filter(e=>e.muster).map(e=>e.maxHp);
    loadStage(2);
    return {first,deadAfter,deadAfterReload,hpStable:JSON.stringify(hp)===JSON.stringify(G.enemies.filter(e=>e.muster).map(e=>e.maxHp)),
      oldHadNoMarker:!old.includes('recall-garrisoned-v1')};
  });
  assert.deepEqual(r,{first:{revived:true,boss:false,gate:true,shortcut:true,marked:true},deadAfter:true,deadAfterReload:true,hpStable:true,oldHadNoMarker:true});
});

test('the recalled Causeway opening remains passable with the earned return kit', async (t) => {
  const {page,bot}=await openHarness(t);
  await page.evaluate(bot.bootstrapStage,{stage:2,muster:true});
  const r=await page.evaluate(()=>{
    const tas=window.__BF.tas;
    tas.stepFrames(30,{right:true});
    tas.stepFrames(16,{right:true,jump:true});
    tas.stepFrames(1,{right:true});
    tas.stepFrames(20,{right:true,jump:true,dash:true});
    tas.stepFrames(210,{right:true});
    return tas.getPlayerState();
  });
  assert.ok(r.x>1000,`passed the opening marshal, x=${r.x}`);
  assert.equal(r.dead,false);
  assert.ok(r.blood>0);
});
