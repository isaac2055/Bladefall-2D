// Thunder Cliffs: Act Two's first region (stage 16). The ship stands still and the sea goes
// past it; the harbour slides in when it docks; the Chained Hydra is beaten by riding its own
// taut chains up to their locks; the Chainhook it leaves is the only way back aboard.
// These tests pin the numbers each of those claims rests on.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

const pub = (n) => new URL('../public/' + n, import.meta.url);
const read = (n) => readFileSync(pub(n), 'utf8');
const source = read('index.html');
const act = read('bladefall-act-two.js');
const art = read('bladefall-act-two-art.js');
const renderer = read('bladefall-respec-renderer.js');

function fnFrom(src, name){
  const start = src.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name + ' exists');
  const brace = src.indexOf('{', start); let depth = 0;
  for(let i = brace; i < src.length; i++){
    if(src[i] === '{') depth++;
    else if(src[i] === '}' && --depth === 0) return src.slice(start, i + 1);
  }
  throw Error('unterminated ' + name);
}
// The level is built from the page's own helpers, exactly as the inline script would.
const sandbox = vm.createContext({ Math, Object, JSON, window:{} });
vm.runInContext(['Pl', 'Wl', 'Seam', 'SlateWall'].map(n => fnFrom(source, n)).join('\n') + '\n' + act, sandbox);
const ACT = sandbox.window.BladefallActTwo;
const L = ACT.level(16);
const K = ACT.constants;
const objs = (p) => L.objects.filter(p);
const one = (p) => { const r = objs(p); assert.equal(r.length, 1); return r[0]; };
const REACH = { flat:671, dropped:774, doubleJumpRise:148 };   // measured, full kit (handoff "Full-kit reach")

test('stage 16 is registered everywhere a stage must be', () => {
  assert.match(source, /16:\(typeof BladefallActTwo!=='undefined'\?BladefallActTwo\.level\(16\):null\)/, 'CUSTOM_LEVELS');
  assert.ok(Number(/const V4_LAST_STAGE=(\d+);/.exec(source)[1]) >= 16);   // the stage is inside V4 (the cap grows with every echo)
  assert.match(renderer, /const SUPPORTED_STAGES = new Set\(\[[^\]]*\b16\b[^\]]*\]\)/);
  assert.match(source, /16:Object\.freeze\(\{id:'cliffs-red-wake'/, 'LEVEL_MUSIC');
  for(const f of ['navigating-the-red-wake', 'chains-of-the-deep', 'unburdening-the-colossus'])
    assert.ok(existsSync(pub('audio/music/' + f + '.mp3')), f + '.mp3 ships');
  assert.match(source, /<script src="bladefall-act-two\.js\?v=[\d.]+"><\/script>/);
  assert.match(source, /<script src="bladefall-act-two-art\.js\?v=[\d.]+"><\/script>/);
  assert.equal(L.portal, null, 'no completion portal: winGame() is not the end of this road');
  assert.equal(L.authoredEcology, true, 'no procedural variant enemies');
  assert.equal(L.bossSkipCircuit, 'cliffs-hydra');
  assert.equal(L.bossSkipZone, 'thunder-cliffs', 'a skip circuit must name its zone (it defaults to the Foundry)');
});

test('the page hands stage 16 to the module at every seam it needs', () => {
  assert.match(fnFrom(source, 'physicalSeamSpec'), /G\.stageIndex>=16&&window\.BladefallActTwo\)return BladefallActTwo\.seamSpec\(\)/);
  assert.match(fnFrom(source, 'compatibilityZoneArrival'), /king-thunder-cliffs'&&plan\.targetZoneId==='thunder-cliffs'/);
  assert.match(fnFrom(source, 'bossArena'), /e\.type==='hydra'&&window\.BladefallActTwo\)\{BladefallActTwo\.hydraArena\(e\);return;\}/);
  assert.match(fnFrom(source, 'outskirtsAuthoredInteractable'), /if\(o\.actTwoUp\)return !o\.gone&&!o\.actMute;/);
  assert.match(fnFrom(source, 'updateBossHealthBar'), /\|\|e\.hydraFight\)/, 'a mechanic fight has no health bar');
  assert.match(fnFrom(source, 'killEnemy'), /else if\(e\.type==='hydra'\)G\.portal=null;/);
  assert.match(fnFrom(source, 'launchTheShip'), /BladefallActTwo\.setSail\(\)/, 'the Act Two card sails on');
  assert.match(fnFrom(source, 'updraftsVoidFloor'), /if\(G&&G\.stageIndex===16\)return -100;/, 'the sea, not mid-air, rewinds');
  assert.match(source, /hook:'KeyA'/, 'the Chainhook has a default key');
});

test('THE RIGGING IS THE ONLY WAY OVER A BREAKER', () => {
  const yard = one(o => o.actArt === 'yard');
  const decks = objs(o => o.actArt === 'quarterdeck' || o.actArt === 'forecastle');
  const breaker = Number(/wave\(A, (\d+), true\)/.exec(act)[1]);
  const highestDeck = Math.max(...decks.map(o => o.y));
  assert.ok(yard.y > breaker, `the yard (${yard.y}) stands over a breaker (${breaker})`);
  assert.ok(highestDeck + REACH.doubleJumpRise < breaker, 'no double jump off a raised deck clears a breaker');
  assert.ok(highestDeck + REACH.doubleJumpRise < yard.y, 'and none reaches the yard: the rigging is the road');
  const rigging = objs(o => o.type === 'seam' && o.actArt === 'rigging');
  assert.equal(rigging.length, 2);
  for(const r of rigging){
    const top = Math.max(r.ay, r.by), bottom = Math.min(r.ay, r.by);
    assert.equal(top, yard.y, 'each rigging line sets you down on the yard');
    assert.ok(decks.some(d => Math.abs(d.y + 22 - bottom) < 1), 'and starts at a raised deck, at dash height');
    assert.ok(r.gone, 'slack until the sail pulls it taut');
  }
  assert.match(act, /WATER IS NOT DODGED/, 'a dash through a wave is not an answer');
});

test('THE TOW: the derelict is past every jump, and two lines and two slates reach it', () => {
  const fore = one(o => o.actArt === 'forecastle');
  const hulk = one(o => o.actArt === 'hulk');
  const gap = (hulk.x - hulk.w / 2) - (fore.x + fore.w / 2);
  assert.ok(gap > 800, `forecastle to hulk ${gap} > 800 (flat reach ${REACH.flat})`);
  const lines = objs(o => o.type === 'seam' && o.actArt === 'tow');
  assert.equal(lines.length, 2);
  for(const l of lines){
    assert.ok(l.ax > fore.x - fore.w / 2 && l.ax < fore.x + fore.w / 2 - 40, 'cleated on the forecastle, clear of the bow bulkhead');
    assert.equal(l.ay, fore.y + 22);
  }
  assert.equal(objs(o => o.type === 'wall' && o.slate).length, 2, 'a slate on the bow and one on the hulk');
  assert.ok(one(o => o.actWindlass), 'the windlass is what lets it go');
});

test('THE HYDRA: every lock is on a ledge no jump reaches, and each chain reaches the quay', () => {
  const quayTop = 0, blocks = objs(o => o.actArt === 'block');
  const highestFooting = Math.max(quayTop, ...blocks.map(b => b.y));
  for(const s of K.STAPLES){
    const ledge = one(o => o.actStapleLedge === s.id);
    assert.ok(ledge.y - highestFooting > REACH.doubleJumpRise + 100, `${s.id} ledge ${ledge.y} is chain-only`);
    // The ground reach of a chain: a head can strain to the quay inside it, so a bait spot exists past it.
    const ground = Math.sqrt(s.len * s.len - s.y * s.y);
    assert.ok(ground > 250 && ground < 500, `${s.id} reaches ${ground | 0} along the quay`);
    assert.ok(s.x - ground > K.QUAY_X1 - 400 && s.x + ground < K.QUAY_X2 + 200, `${s.id}'s reach stays on the harbour`);
  }
  assert.match(act, /if\(\(h\.taut \|\| h\.lockWindow > 0\) && h\.rode\)\{/, 'a lock cracks only under strain, for a knight who came up its chain');
  assert.match(act, /if\(h\.cracks >= 2\) freeHead/);
  assert.match(act, /latch\('cliffs-hydra'\)/, 'the release writes the skip circuit the level reads');
});

test('THE CHAINHOOK: every hop is inside its range, and the ship is past every jump without it', () => {
  const rings = objs(o => o.type === 'actRing' && !o.towRing);
  assert.equal(rings.length, 3);
  const shipRing = rings.find(r => r.shipRing), pilings = rings.filter(r => !r.shipRing).sort((a, b) => b.x - a.x);
  const shove = K.SHIP_DRIFT;
  const fore = one(o => o.actArt === 'forecastle');
  const foreSpan = [fore.x - fore.w / 2 + shove, fore.x + fore.w / 2 + shove];
  const hangCentre = (r) => ({ x:r.x, y:r.y - 58 + 22 });
  const path = [{ x:K.QUAY_X1 + 10, y:22 }, hangCentre(pilings[0]), hangCentre(pilings[1])];
  const targets = [pilings[0], pilings[1], { x:shipRing.x + shove, y:shipRing.y }];
  targets.forEach((t, i) => {
    const d = Math.hypot(t.x - path[i].x, t.y - path[i].y);
    assert.ok(d <= K.HOOK_RANGE, `hop ${i} is ${d | 0} (range ${K.HOOK_RANGE})`);
  });
  const lastRing = targets[2].x;
  assert.ok(lastRing > foreSpan[0] + 20 && lastRing < foreSpan[1] - 20, 'letting go of the last ring lands on the forecastle');
  assert.ok(K.QUAY_X1 - foreSpan[1] > 800, `the shoved bow is ${K.QUAY_X1 - foreSpan[1]} from the quay: past any jump`);
  assert.ok(rings.every(r => r.gone), 'no ring before the beast has gone');
});

test('RECOVERY: the ship carries its rest, and a released harbour starts you on the quay', () => {
  const anchor = one(o => o.restSiteAnchor);
  assert.equal(anchor.restSiteAnchor, 'stern-lantern');
  assert.ok(anchor.actShip, 'the rest moves with the ship');
  assert.match(read('bladefall-recovery.js'), /\['stern-lantern', 'thunder-cliffs', 'The Stern Lantern', 0\.06, false\]/, 'not a fast-travel station: Act One stays behind the sea');
  assert.match(fnFrom(act, 'initCliffs'), /G\.p\.x = 3300; G\.p\.y = 0;/, 'no arriving on a ship the hook has not reached');
});

test('the art draws only what the region owns, and nothing before its time', () => {
  assert.match(art, /function handles\(stageIndex\)\{ return stageIndex === 16 \|\| !!STAGE_ART\[stageIndex\]; \}/);
  assert.match(fnFrom(art, 'drawHydra'), /!A\.docked\) return;/, 'no hydra over the voyage');
  for(const phase of ['backdrop', 'plat', 'object', 'world', 'enemy', 'overlay'])
    assert.ok(renderer.includes(`ext('${phase}'`), 'renderer hook: ' + phase);
});


test('wreck return teaches the hook with reachable stable rings', () => {
  const rings = objs(o => o.towRing).sort((a,b) => b.x - a.x);
  assert.equal(rings.length, 3);
  let from = {x:3350 + 160, y:60 + 22};
  for(const r of rings){
    assert.ok(Math.hypot(r.x-from.x,r.y-from.y) <= K.HOOK_RANGE);
    from = {x:r.x,y:r.y-36};
  }
  assert.ok(from.x < K.FORE.x + K.FORE.w/2 - 20 && from.x > K.FORE.x - K.FORE.w/2 + 20, 'last hang drops safely onto the forecastle');
});

// Execute actual encounter functions in the module's closure, with only engine services stubbed.
function encounter(){
  const hits = [], circuits = {};
  const p = {x:3500,y:0,h:44,invuln:0,face:1,jumps:0};
  const ctx = vm.createContext({window:{},Math,Object,JSON,
    G:{stageIndex:16,p,obstacles:[],enemies:[],particles:[],time:0,actTwo:{waves:[],bolts:[],wakes:[]}},
    meta:{soundOn:false},GROUND_Y:600,hasCapability:()=>true,
    BFZoneStateModule:{hydrate:()=>({circuits})},markPersistentCircuitOpen:(id)=>circuits[id]=true,
    hurtPlayer:(...args)=>hits.push(args),keyPressedFor:()=>false,
    recordWorldClear(){},recordSessionClear(){},activateRuntimeCheckpoint(){},
    captureCurrentZonePersistence(){},persist(){},
  });
  vm.runInContext(act.replace('root.BladefallActTwo = Object.freeze({',
    'root.BladefallActTwo = Object.freeze({ test:{strainAim, updateBiteHead, updateTideHead, updateStormHead, startChainRide, updateChainRide, checkLockStrikes, freeHead},'),ctx);
  const api = ctx.window.BladefallActTwo;
  const e = {maxHp:1}; api.hydraArena(e); e.active=true; ctx.G.boss=e;
  return {ctx,api,e,p,hits,circuits};
}

test('a close bait still strains the bite chain; hook, ascent and slam crack its lock', () => {
  const {ctx,api,e,p} = encounter(), h=e.hydra.heads[0], T=api.test;
  h.st='wind'; h.t=.79;
  for(let i=0;i<90&&!h.taut;i++) T.updateBiteHead(h,1/60);
  assert.ok(h.taut,'no invisible distance requirement');
  p.x=h.x+70;p.y=h.y-22;
  assert.equal(api.hookTargets(p)[0].o.actHydraHead,h);
  T.startChainRide(p,h);
  for(let i=0;i<90&&p.actRide;i++) T.updateChainRide(1/60,p);
  assert.ok(h.rode); assert.ok(h.lockWindow>0);
  // The ascent earns a short slam window even if the head has just relaxed.
  h.taut=false;p.y=h.sy+40;p.vy=400;p.slamming=true;
  T.checkLockStrikes(e,e.hydra,ctx.G.actTwo);
  assert.equal(h.cracks,1);
  p.y=h.sy+40;p.vy=400;p.slamming=true;
  T.checkLockStrikes(e,e.hydra,ctx.G.actTwo);
  assert.equal(h.cracks,1,'camping the lock cannot repeat a strike');
});

test('freed heads persist, and storm warning leaves time to ride and slam', () => {
  const {ctx,api,e,p,circuits} = encounter(), h=e.hydra.heads[2],T=api.test;
  T.freeHead(e,e.hydra,ctx.G.actTwo,e.hydra.heads[0]);
  assert.equal(circuits['cliffs-head-bite'],true);
  const next={};api.hydraArena(next);
  assert.equal(next.hydra.phase,2);assert.ok(next.hydra.heads[0].free);
  h.st='strain';h.t=0;h.tx=5500;h.ty=20;
  for(let i=0;i<90;i++)T.updateStormHead(h,ctx.G.actTwo,1/60);
  assert.ok(h.taut);assert.equal(h.crackle,0);
  for(let i=0;i<30;i++)T.updateStormHead(h,ctx.G.actTwo,1/60);
  assert.ok(h.taut);assert.ok(h.crackle>0);
});
