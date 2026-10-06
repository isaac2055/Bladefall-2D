/* Bladefall — ACT THREE · The Fractured Outskirts (stage 21), 2026-09-24.

   The first echo. The Outskirts as the Echo left it: the same road — one jump, no steel — at
   night, harder, with the Muster on it. A B-side (after Celeste): every room of the original
   remixed and made exact. And one C-side: short, strict, a puzzle to learn — the Mile Sentinel.

   Your kit is what the first road gave you: a single jump (78 high, 136 long at a run). No
   blade. Every enemy is avoided, never fought. The refined road adds low chain sweeps,
   sustained crumble sequences, and a working bell gate before the Sentinel's three bells.

     THE ASH VERGE — the creek hops, but the creeks are gone: pits, crumbling stones, a 125 jump.
     THE VIGIL CAMP — the Mile Sentinel, locked in its vigil cell on the ridge. It is awake, and
       it watches you pass. An outrider and a shieldbearer walk the camp under it; raised stones
       are the refuges.
     THE MUSTER ROAD — the high road and the low road are one road now: crumbling perches over a
       pit, a linesman firing along it, a signaler and an outrider past it.
     THE HOLLOW MILE — the patrol rhythm, tighter, at night.
     THE MOTHLIGHT GATE (the C-side) — the gate's chain is the vigil cell's lock. Pull it, and the
       Sentinel comes down into the yard. You cannot hurt it. Three vigil bells hang in the yard;
       ring them all and they bind it again. None can be reached from the ground: each is reached
       by learning one of its moves and standing on what the move leaves behind —
         HAMMERFALL (it lifts the hammer; the head glows; it commits where you stood): the hammer
           sticks, and its haft is a step.
         THE RUSH (a foot scraped twice, the helm lowered): it charges until something stops it.
           Let a standing stone stop it and it is stunned — its shoulders are a step.
         THE CHAIN SWEEP (after the second bell, straight after a Hammerfall): the chains whirl and
           sweep the floor. The haft is above it.
       Its moves come in a fixed rhythm per phase, each with a tell and an answer (Hollow Knight,
       Dark Souls): it is not a hard enemy, it is a pattern. Bells stay rung through a death. */
(function installFracturedOutskirts(root){
'use strict';
const A2 = root.BladefallActTwo;
if(!A2 || !A2.register) return;
const kit = A2.kit;

const STAGE = 21, ZONE = 'fractured-outskirts', SOURCE = 0;
const LEN = 9900;
const SPAWN = { x:140, y:0 };
const JUMP = { rise:78, far:136 };                  // the jump-only kit, measured

/* ── Geometry (world units; y up; the floor is y 0; below it the void) ──────── */
const GROUND = [ [0, 420], [880, 1100], [1620, 1900], [2280, 2900], [3010, 3700], [3700, 4050], [4930, 5520], [5630, 6250], [6570, 6700],
  [7200, 7450], [7730, 7800], [7915, LEN] ];
const STONES = [                                    // [centre x, width, top y, crumble?]
  [575, 70, 0], [735, 54, 30, 1], [1210, 52, 40, 1], [1340, 48, 60, 1], [1470, 50, 20], [2010, 60, 55, 1], [2140, 50, 20, 1],
  [4160, 52, 40, 1], [4290, 54, 70], [4420, 48, 40, 1], [4550, 48, 10, 1], [4680, 52, 50, 1], [4810, 48, 20, 1],
  [6360, 52, 50, 1], [6490, 46, 20, 1],
  [6820, 50, 30, 1], [6950, 44, 60, 1], [7080, 44, 20, 1], [7550, 60, 55, 1], [7680, 50, 20, 1],
];
const REFUGES = [ [2500, 90, 60], [2760, 90, 60], [3200, 80, 70], [3420, 80, 70], [5850, 80, 64], [6150, 80, 64], [7420, 70, 66], [7640, 70, 66] ];
function groundAt(x){ for(const g of GROUND) if(x >= g[0] && x < g[1]) return 0; return null; }
const CELL = { x:3120, y:150 };                     // the vigil cell on the ridge
/* The Mothlight Gate's yard: the C-side. */
const YARD = { x1:8350, x2:9650 };
const LEVER_X = 8440, GATE_X = 9720;
// A small working bell and its portcullis teach touch -> ring -> released chain.
// The bell sits over a stable stepping stone, between two crumble sequences.
const LESSON = { x:1470, y:150, gateX:2240 };
const ROAD_SWEEPS = [
  { x:1810, y:0, reach:140, period:3.8, offset:0 },
  { x:4550, y:10, reach:180, period:3.6, offset:1.1 },
  { x:7500, y:0, reach:185, period:3.4, offset:2.2 },
];
const ROAD_TELL = 1.05, ROAD_ACTIVE = .24;
function roadSweepState(s, time){
  const t = (time + s.offset) % s.period;
  return { t, warning:t < ROAD_TELL, active:t >= ROAD_TELL && t < ROAD_TELL + ROAD_ACTIVE,
    progress:Math.min(1, t / ROAD_TELL) };
}
const SENTINEL_STONES = [ { id:'s1', x:8700, w:60, h:70 }, { id:'s2', x:9250, w:60, h:70 } ];   // tops in one jump (78)
const BELLS = [
  { id:'west', x:8520, y:180 },                      // from the haft under it, or its shoulders at the first stone
  { id:'centre', x:9000, y:190 },                    // only from the haft: no stone is near enough
  { id:'east', x:9250, y:230 },                      // only from its shoulders, stunned against the second stone
];
const BELL_R = 16;
const S = {                                          // the Sentinel: tells and answers, by phase (bells rung)
  w:70, h:130, walk:[70, 80, 92], reach:230,
  hfTell:[1.25, 1.05, 0.9], hfLock:0.55, hfHalf:55, hfStuck:[3.1, 2.5, 2.0], wave:{ speed:400, life:0.45 },
  rushTell:[0, 1.05, 0.85], rushSpeed:520, stunStone:2.8, stunWall:1.2,
  sweepDelay:0.35, sweepTell:0.6, sweepReach:260, bound:2.5,
};
const CHECKPOINTS = [
  { id:'verge', x:1700 }, { id:'camp', x:3780 }, { id:'road', x:6620 }, { id:'mile', x:8100 },
];
const CUES = Object.freeze({
  trial:Object.freeze({ id:'fractured-crystalline-trials', src:'./audio/music/crystalline-trials.mp3', title:'Crystalline Trials',
    artist:'Aerth score', mood:'the Mile Sentinel: a pattern to learn' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function buildLevel(){
  const objects = [];
  GROUND.forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'ash' })));
  STONES.forEach(s => objects.push(Object.assign(Pl(s[0], s[1], s[2]), { actArt:'stone', crumble:s[3] ? 1 : undefined })));
  REFUGES.forEach(r => objects.push(Object.assign(Pl(r[0], r[1], r[2], { openingRefuge:true }), { actArt:'refuge' })));
  objects.push({ type:'actBell', x:LESSON.x, y:LESSON.y, w:32, h:32, bell:'lesson' });
  objects.push({ type:'wall', x:LESSON.gateX, y:360, h:360, w:24, noCling:1, actArt:'bars', actBars:'lesson-gate', gone:false });
  objects.push({ type:'actCell', x:CELL.x, y:CELL.y, w:120, h:130 });
  objects.push({ type:'actFire', x:260, y:0, w:40, h:20, restSiteAnchor:'ash-watchfire' });
  // The yard's standing stones: solid to it and to you; their tops are refuges from the sweep.
  SENTINEL_STONES.forEach(s => {
    objects.push({ type:'wall', x:s.x, y:s.h, h:s.h, w:s.w, actArt:'vigil-stone', vigilStone:s.id });
    objects.push(Object.assign(Pl(s.x, s.w, s.h), { actArt:'vigil-top' }));
  });
  BELLS.forEach(b => objects.push({ type:'actBell', actId:'bell-' + b.id, x:b.x, y:b.y, w:BELL_R * 2, h:BELL_R * 2, bell:b.id }));
  objects.push({ type:'actLever', actId:'lever', x:LEVER_X, y:0, w:30, h:60, actTwoUp:1, actVerb:'PULL THE CHAIN' });
  objects.push({ type:'wall', x:YARD.x1, y:600, h:600, w:30, noCling:1, actArt:'bars', actBars:'yard-west', gone:true });
  objects.push({ type:'wall', x:GATE_X, y:600, h:600, w:30, noCling:1, actArt:'gate', actBars:'mothlight-gate', gone:false });
  objects.push({ type:'actGate', x:GATE_X, y:0, w:160, h:320 });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    // THE MUSTER, on the first road: the Frostfell engine's garrison walks it (applyRecallBaseline
    // at init: x1.55 health, x1.25 damage, eyes to 480). None of them can be fought.
    enemies:[
      { t:'outrider', x:2600, patrol:[2320, 2880], noDrop:true, encounterIntent:'avoidance', safeRefugeX:2760 },
      { t:'shieldbearer', x:3310, patrol:[3050, 3650], noDrop:true, encounterIntent:'avoidance', safeRefugeX:3420, frontShield:true, shieldFace:-1 },
      { t:'linesman', x:5200, patrol:[5000, 5400], noDrop:true, encounterIntent:'avoidance' },
      { t:'signaler', x:5470, patrol:[5420, 5510], noDrop:true, encounterIntent:'avoidance' },
      { t:'outrider', x:6000, patrol:[5680, 6200], noDrop:true, encounterIntent:'avoidance', safeRefugeX:6150 },
      { t:'grunt', x:7340, patrol:[7230, 7410], noDrop:true, encounterIntent:'avoidance', safeRefugeX:7420 },
      { t:'shadeling', x:7770, patrol:[7735, 7790], noDrop:true, encounterIntent:'avoidance', safeRefugeX:7640 },
    ],
  };
}

/* ── Init: the first road's kit, the Muster, the vigil ─────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  const bells = { west:done(c, 'fo-bell-west'), centre:done(c, 'fo-bell-centre'), east:done(c, 'fo-bell-east') };
  const cleared = done(c, 'fo-sentinel');
  G.actTwo = {
    stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    bells, rung:Object.values(bells).filter(Boolean).length, released:done(c, 'fo-released') || cleared, cleared,
    sentinel:null, waves:[], haft:null, cellShake:0, over:false, wasDead:false,
    lesson:done(c, 'fo-lesson-bell') || cleared || done(c, 'fo-released'), roadHits:{},
  };
  // The first road's kit: a single jump, and the dash, which no echo takes away (setKit in bladefall-fractured.js).
  // No blade, nothing the Echo's road did not give you.
  const F = root.BladefallFractured;
  if(F && F.setKit) F.setKit(['jump']);
  else try{
    G.sessionCapabilities = BFCapabilitiesModule.createState({ acquired:['dash'] });
    G.p.weapon = null; if(G.p.weapons) G.p.weapons = [];
    syncMovementCapabilities(G.p); syncWeaponCapabilities(G.p);
  }catch(_e){}
  G.musterForced = true;
  setBars('yard-west', true);
  setBars('mothlight-gate', cleared);
  setBars('lesson-gate', G.actTwo.lesson);
}
function setBars(id, open){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === open) return; b.gone = open; b.moveT = 0.5;
}
function firstFrame(A){
  // Each body as the Muster's own installer sets it (installMusterRoster): its bounds, its role —
  // the outrider commits to a lunge and leaves a recovery; the signaler calls the posts. (At the
  // first frame, not in build(): the level's enemies are spawned after build runs.)
  for(const e of G.enemies){
    if(e.actFoe) continue;
    Object.assign(e, { muster:true, authoredEncounter:true, musterMin:e.patrolMin, musterMax:e.patrolMax });
    if(e.type === 'outrider'){ e.musterRole = 'outrider'; e.recallHomeY = 0; e.recallCooldown = 1.2; }
    if(e.type === 'signaler') e.musterRole = 'signaler';
    try{ applyRecallBaseline(e); }catch(_e){}
  }
  if(A.cleared) return;
  const e = spawnEnemy('grunt', (YARD.x1 + YARD.x2) / 2);
  Object.assign(e, { actFoe:'sentinel', type:'grunt', w:S.w, h:S.h, y:0, baseY:0, floorY:0, active:true, noDrop:true, boss:false,
    portalGate:'vigil', maxHp:9999, hp:9999, noticeRange:1, face:-1, st:A.released ? 'wait' : 'caged', t:0, cycle:0, x1:YARD.x1, x2:YARD.x2 });
  e.x = A.released ? 8840 : CELL.x;
  A.sentinel = e;
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  for(const q of A.tolls) q.t += dt;
  A.tolls = A.tolls.filter(q => q.t < 1.2);
  for(const o of G.obstacles) if(o.moveT > 0) o.moveT = Math.max(0, o.moveT - dt);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); if(q.then) q.then(A); return; }
  if(p.dead) A.wasDead = true;
  else if(A.wasDead){ A.wasDead = false; resetYard(A); }
  updateCell(A, dt, p);
  updateRoad(A, p);
  updateWaves(A, dt, p);
  updateHaft(A, dt);
  updateBells(A, p);
  updateYard(A, p);
  updateCheckpoints(A, p);
  // Through the gate: on into the next echo if it is built, else the card that says what is next.
  const F = root.BladefallFractured, next = F && F.nextEcho(STAGE);
  if(!A.over && A.cleared && p.x > GATE_X + 60 && !p.dead && !(next != null && A2.handles(next))) endOfEcho(A);
}
function lateUpdate(){}

function updateRoad(A, p){
  if(p.dead) return;
  // Existing player-flag snapshots may predate the road mechanisms.
  if(!A.roadHits) A.roadHits = {};
  if(!A.lesson && Math.abs(p.x - LESSON.x) < BELL_R + p.w / 2 && p.y + p.h > LESSON.y - BELL_R && p.y < LESSON.y + BELL_R){
    A.lesson = true; kit.latch(ZONE, 'fo-lesson-bell'); setBars('lesson-gate', true);
    A.tolls.push({ x:LESSON.x, y:LESSON.y, t:0 });
    try{ if(meta.soundOn && SFX.windGate) SFX.windGate(90, LESSON.x); }catch(_e){}
  }
  ROAD_SWEEPS.forEach((s, i) => {
    const beat = roadSweepState(s, A.t), cycle = Math.floor((A.t + s.offset) / s.period);
    if(beat.active && A.roadHits[i] !== cycle && Math.abs(p.x - s.x) < s.reach + p.w / 2 && p.y < s.y + 40 && p.y + p.h > s.y){
      A.roadHits[i] = cycle; strike(p, Math.sign(p.x - s.x) || 1, 160);
    }
  });
}

/* The cell on the ridge: it is awake, and it watches you go by. */
function updateCell(A, dt, p){
  const e = A.sentinel; if(!e || e.st !== 'caged') return;
  e.x = CELL.x; e.y = CELL.y; e.face = Math.sign(p.x - e.x) || e.face;
  if(A.cellShake > 0) A.cellShake -= dt;
  if(Math.abs(p.x - CELL.x) < 140 && A.cellShake <= 0 && !p.dead){
    A.cellShake = 1.6; G.shake = Math.max(G.shake || 0, 3);
    try{ if(meta.soundOn) SFX.hit(); }catch(_e){}
  }
}

/* ── The yard ──────────────────────────────────────────────────────────────── */
function updateYard(A, p){
  const e = A.sentinel; if(!e || A.cleared) return;
  const inYard = p.x > YARD.x1 + 40 && p.x < YARD.x2 && !p.dead;
  if(e.st === 'wait' && inYard){ e.st = 'stalk'; e.t = 0; setBars('yard-west', false); }
}
function interact(o){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return false;
  if(o.actId === 'lever' && !A.released){
    A.released = true; kit.latch(ZONE, 'fo-released'); o.actMute = true;
    const e = A.sentinel;
    // The gate's chain runs west along the ridge to the vigil cell's lock. It gives.
    if(e){ e.st = 'drop'; e.t = 0; e.x = 8840; e.y = 520; }
    setBars('yard-west', false);
    return true;
  }
  return false;
}
function resetYard(A){
  // Dead in the yard: back at the Hollow Mile's end; the bells you rang stay rung.
  const e = A.sentinel; if(!e || A.cleared) return;
  A.waves = []; A.haft = null; removeHaft(); removeShoulders();
  if(A.released){ e.st = 'wait'; e.t = 0; e.x = 8840; e.y = 0; e.cycle = 0;
    e.swept = false; e.sweepT = null; e.sweepHit = false; e.hitThisRush = false; e.hitX = null; }
  setBars('yard-west', true);
}

/* THE SENTINEL. Not hard — exact. Each move has a tell, a commitment and a window. */
function phase(A){ return Math.min(2, A.rung); }
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'sentinel'){ updateSentinel(A, e, p, dt); return; }
}
function updateSentinel(A, e, p, dt){
  if(p.dead) return;
  e.t += dt; e.walking = false;
  if(e.st === 'caged' || e.st === 'wait' || e.st === 'bound-final') return;
  const ph = phase(A), dx = p.x - e.x, adx = Math.abs(dx);
  switch(e.st){
    case 'drop':
      e.y = Math.max(0, 520 - e.t * 900);
      if(e.y <= 0){ e.st = 'land'; e.t = 0; G.shake = Math.max(G.shake || 0, 12); A.flash = Math.max(A.flash, 0.4); kit.burst(e.x, 20, '#9a8f7a', 26); }
      break;
    case 'land': if(e.t > 1.2){ e.st = 'stalk'; e.t = 0; } break;
    case 'stalk': {
      e.face = Math.sign(dx) || e.face;
      // The rhythm: phase 0 — hammer, hammer; from the first bell — hammer, rush; from the second —
      // hammer (and its sweep), rush, hammer.
      const next = nextMove(A, e);
      if(next === 'rush' && e.t > 0.9){ e.st = 'rush-tell'; e.t = 0; e.rushDir = Math.sign(dx) || e.face; break; }
      if(next === 'hammer'){
        if(adx < S.reach && e.t > 0.7){ e.st = 'hf-tell'; e.t = 0; e.target = p.x; break; }
        if(adx > 60){ e.x += Math.sign(dx) * S.walk[ph] * dt; e.walking = true; }
      }
      break;
    }
    case 'hf-tell': {
      const T = S.hfTell[ph];
      if(e.t < T * S.hfLock) e.target = Math.max(e.x - S.reach, Math.min(e.x + S.reach, p.x));   // it tracks you, then commits
      if(e.t >= T){ hammerfall(A, e, p); }
      break;
    }
    case 'hf-stuck':
      if(ph >= 2 && !e.swept && e.t > S.sweepDelay){ e.swept = true; e.sweepT = 0; }
      if(e.swept && e.sweepT != null){
        e.sweepT += dt;
        if(e.sweepT >= S.sweepTell && !e.sweepHit){ e.sweepHit = true; sweep(A, e, p); }
      }
      if(e.t >= S.hfStuck[ph]){ e.st = 'recover'; e.t = 0; removeHaft(); A.haft = null; }
      break;
    case 'rush-tell': e.face = e.rushDir; if(e.t >= S.rushTell[ph]){ e.st = 'rush'; e.t = 0; } break;
    case 'rush': {
      const nx = e.x + e.rushDir * S.rushSpeed * dt;
      const stone = SENTINEL_STONES.find(s => (e.rushDir > 0 ? e.x + S.w / 2 <= s.x - s.w / 2 + 2 && nx + S.w / 2 >= s.x - s.w / 2 : e.x - S.w / 2 >= s.x + s.w / 2 - 2 && nx - S.w / 2 <= s.x + s.w / 2));
      if(stone){ e.x = stone.x - e.rushDir * (stone.w / 2 + S.w / 2); stun(A, e, S.stunStone, stone.id); break; }
      if(nx - S.w / 2 < YARD.x1 + 16 || nx + S.w / 2 > YARD.x2 - 10){ e.x = Math.max(YARD.x1 + 16 + S.w / 2, Math.min(YARD.x2 - 10 - S.w / 2, nx)); stun(A, e, S.stunWall, null); break; }
      e.x = nx; e.walking = true;
      // It hits you if you are in its way at its height (standing on a stone top is above the crash).
      if(!p.dead && Math.abs(p.x - e.x) < S.w / 2 + 10 && p.y < 60 && !e.hitThisRush){ e.hitThisRush = true; strike(p, e.rushDir, 420); }
      break;
    }
    case 'stunned':
      if(e.t >= e.stunFor){ e.st = 'recover'; e.t = 0; removeShoulders(); }
      break;
    case 'recover': if(e.t > 0.5){ e.st = 'stalk'; e.t = 0; e.cycle++; e.swept = false; e.sweepT = null; e.sweepHit = false; e.hitThisRush = false; } break;
    case 'bound': if(e.t > S.bound){ e.st = 'stalk'; e.t = 0; e.cycle = 0; } break;
  }
  e.x = Math.max(YARD.x1 + 20 + S.w / 2, Math.min(YARD.x2 - 20 - S.w / 2, e.x));
}
function nextMove(A, e){
  const ph = phase(A), c = e.cycle || 0;
  if(ph === 0) return 'hammer';
  if(ph === 1) return c % 2 === 0 ? 'hammer' : 'rush';
  return ['hammer', 'rush', 'hammer'][c % 3];
}
function strike(p, dir, kb){
  if(p.invuln > 0 || p.dodgeTimer > 0) return;
  hurtPlayer(12, dir, true);
  if(!p.dead){ p.vx = dir * kb; p.vy = 220; }
}
function hammerfall(A, e, p){
  const ph = phase(A), x = e.target;
  e.st = 'hf-stuck'; e.t = 0; e.hitX = x; e.swept = false; e.sweepT = null; e.sweepHit = false;
  G.shake = Math.max(G.shake || 0, 9); kit.burst(x, 10, '#c9bda0', 20);
  try{ if(meta.soundOn) SFX.land(); }catch(_e){}
  if(!p.dead && Math.abs(p.x - x) < S.hfHalf + 10 && p.y < 110) strike(p, Math.sign(p.x - x) || 1, 320);
  // The shock runs out both ways along the floor: jump it — or be on the haft.
  A.waves.push({ x, dir:-1, t:0 }, { x, dir:1, t:0 });
  // The hammer sticks. Its haft is a step for as long as it is stuck.
  removeHaft();
  const haft = Object.assign(Pl(x, 64, 64), { actArt:'haft', sentinelHaft:1 });
  G.obstacles.push(haft); A.haft = { x, t:0, duration:S.hfStuck[ph] };
}
function removeHaft(){ const i = G.obstacles.findIndex(o => o.sentinelHaft); if(i >= 0) G.obstacles.splice(i, 1); }
function removeShoulders(){ const i = G.obstacles.findIndex(o => o.sentinelShoulders); if(i >= 0) G.obstacles.splice(i, 1); }
function updateHaft(A, dt){ if(A.haft) A.haft.t += dt; }
function updateWaves(A, dt, p){
  for(const w of A.waves){
    w.t += dt; w.x += w.dir * S.wave.speed * dt;
    if(!w.hit && !p.dead && p.onGround && p.y < 8 && Math.abs(p.x - w.x) < 16){ w.hit = true; strike(p, w.dir, 260); }
  }
  A.waves = A.waves.filter(w => w.t < S.wave.life);
}
function sweep(A, e, p){
  G.shake = Math.max(G.shake || 0, 6); kit.burst(e.x, 20, '#8f7a66', 16);
  try{ if(meta.soundOn) SFX.slash(); }catch(_e){}
  if(!p.dead && Math.abs(p.x - e.x) < S.sweepReach && p.y < 40) strike(p, Math.sign(p.x - e.x) || 1, 360);
}
/* Against a stone it is stunned, and bent over: its shoulders are a step for a moment. */
function stun(A, e, t, stoneId){
  e.st = 'stunned'; e.t = 0; e.stunFor = t; e.stunStone = stoneId;
  G.shake = Math.max(G.shake || 0, 10); kit.burst(e.x + e.rushDir * S.w / 2, 60, '#c9bda0', 22);
  try{ if(meta.soundOn) SFX.hit(); }catch(_e){}
  removeShoulders();
  if(stoneId) G.obstacles.push(Object.assign(Pl(e.x, 56, 130), { actArt:'shoulders', sentinelShoulders:1 }));
}

/* THE BELLS. Touch one and it rings: the vigil's chains come for it. */
function updateBells(A, p){
  const e = A.sentinel; if(!e || !A.released || A.cleared || p.dead) return;
  for(const b of BELLS){
    if(A.bells[b.id]) continue;
    if(Math.abs(p.x - b.x) < BELL_R + p.w / 2 && p.y + p.h > b.y - BELL_R && p.y < b.y + BELL_R){
      A.bells[b.id] = true; A.rung++; kit.latch(ZONE, 'fo-bell-' + b.id);
      A.flash = Math.max(A.flash, 0.5); G.shake = Math.max(G.shake || 0, 8);
      A.tolls.push({ x:b.x, y:b.y, t:0 });
      try{ if(meta.soundOn){ if(SFX.windGate) SFX.windGate(90, b.x); else SFX.hit(); } }catch(_e){}
      removeHaft(); removeShoulders(); A.haft = null; A.waves = [];
      if(A.rung >= BELLS.length){ bindSentinel(A, e); return; }
      e.st = 'bound'; e.t = 0;
    }
  }
}
function bindSentinel(A, e){
  e.st = 'bound-final'; e.t = 0; A.cleared = true;
  kit.latch(ZONE, 'fo-sentinel');
  setBars('yard-west', true); setBars('mothlight-gate', true);
  try{ activateRuntimeCheckpoint(ZONE + ':gate', { x:GATE_X - 120, y:0 }, 'checkpoint', null, true); }catch(_e){}
  A.queue.push({ src:e, accent:'#b98cff', html:'<b>THE MILE SENTINEL</b><br>The third bell. The chains come out of the ground and the walls and take it by the arms and the neck, and it goes down on its knees in the yard, the way it knelt in the cell. The Mothlight Gate lifts.' });
}
function endOfEcho(A){
  A.over = true;
  try{ commitStageCompletion(); }catch(_e){}
  try{ recordWorldClear(); }catch(_e){}
  try{ recordSessionClear(STAGE); }catch(_e){}
  mode = 'win'; showGameUI(false);
  showOvHTML(`<div class="card">
    <p class="ovsub" style="letter-spacing:.34em;margin:0 0 6px;">THE FRACTURED OUTSKIRTS · BEHIND YOU</p>
    <h1 class="title" style="margin:0 0 4px;">THE FRACTURED WOODS</h1>
    <p class="subtitle" style="margin:0 0 18px;">Act Three · the next echo</p>
    <p class="hint" style="margin:0 0 20px;">Behind you the Sentinel kneels in its chains. Ahead the woods are dark, and something in them is walking backwards.<br>The Fractured Woods is the next echo to be built.</p>
    <button class="bigbtn" id="echoGo">Continue</button></div>`);
  const b = document.getElementById('echoGo'); if(b) b.onclick = () => titleScreen();
}

/* ── Checkpoints, floors, arrival ──────────────────────────────────────────── */
function updateCheckpoints(A, p){
  if(!p.onGround || p.dead || Math.abs(p.y) > 4) return;
  for(const c of CHECKPOINTS) if(!A.checkpoints[c.id] && Math.abs(p.x - c.x) < 60){
    A.checkpoints[c.id] = true;
    try{ activateRuntimeCheckpoint(ZONE + ':' + c.id, { x:c.x, y:0 }, 'checkpoint', null, true); }catch(_e){}
  }
}
/* Below the road is the void: fall and you are back at the last fire you passed. */
function voidFloor(){ return -140; }
function cameraFloor(p){ if(!p) return null; return Math.max(0, Math.min(p.y, 0)); }
function seamSpec(){
  const A = G.actTwo, F = root.BladefallFractured;
  return F && A && A.stage === STAGE ? F.seamOn(STAGE, ZONE, 'fo-fw', LEN, A.cleared) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fo-fw' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };   // back from the woods: at the gate
}
function swing(){}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  const e = A.sentinel;
  if(e && A.released && !A.cleared && e.st !== 'wait') return CUES.trial;
  return null;
}

A2.register(STAGE, Object.freeze({
  level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue,
}));
if(root.BladefallFractured) root.BladefallFractured.registerEcho(SOURCE, STAGE);
root.BladefallFracturedOutskirts = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, nextMove, constants:Object.freeze({ LEN, SPAWN, JUMP, GROUND, STONES, REFUGES, CELL, YARD, LEVER_X,
    GATE_X, SENTINEL_STONES, BELLS, BELL_R, S, CHECKPOINTS, LESSON, ROAD_SWEEPS, ROAD_TELL, ROAD_ACTIVE }), roadSweepState,
});
})(typeof window !== 'undefined' ? window : globalThis);
