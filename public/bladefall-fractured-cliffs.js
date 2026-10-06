/* Bladefall — ACT THREE · The Fractured Cliffs (stage 36), 2026-09-25.

   The sixteenth echo: the Thunder Cliffs after the Echo walked it backwards. The ship is a wreck on the
   beach and the sea has come up the cliffs to meet you. The storm is the same storm. The kit is the one
   the Cliffs were entered with — everything through the gravity flip — and the Chainhook waits on the
   wreck's windlass, taken with the downward strike, where the hulk's was. The Muster applies.

     THE WRECK: the windlass (strike it from above: the hook), and two rings over the first gap.
     THE IRON ROAD: rings over the sea, and the lightning walking along them. It strikes the iron on a beat;
       follow behind it, and never be on a ring it is about to find.
     THE BREAKERS: the cliff top, and walls of water coming in off the sea. Be on a ring when one passes.
     THE LAST HEAD (the C-side): the Hydra's last head, chained to the cliff. It lunges at you and strains
       its chain; hook the ring over it and bring the downward strike down on its lock. */
(function installFracturedCliffs(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 36, ZONE = 'fractured-cliffs', SOURCE = 16;
const LEN = 9800;
const SPAWN = { x:140, y:0 };

/* ── Geometry (world units; y up; the cliff top is y 0; the sea below) ─────── */
const GROUND = [ [0, 1100], [1900, 2150], [4450, LEN] ];
const WINDLASS = { x:820, w:70, y:24 };   // low: a jump gives a real fall onto it
const FIRST_RINGS = [ { x:1400, y:280 }, { x:1750, y:300 } ];   // the first within 470 of the edge; the second from the first's hang
/* The Iron Road: rings over the sea; the lightning finds ring i at `offset·i` of every `period`, warned
   `warn` before, and the ring is gone (white-hot) for `gone` after. It walks east: follow behind it. */
const IRON = { x0:2350, step:380, n:6, y:[320, 360], period:3.0, offset:.5, warn:1.2, gone:.7, dmg:16 };
/* The Breakers: rings over the cliff top; walls of water off the sea, from the east. */
const BREAK = { x0:4450, x1:7000, rings:{ x0:4700, step:350, n:7, y:340 }, wave:{ h:260, w:140, speed:520, every:3.4 } };
/* The Last Head. */
const ARENA = { x1:7200, x2:8800 };
const HEAD_RINGS = [7450, 7750, 8050, 8350].map(x => ({ x, y:440 }));   // in reach from the floor 150 to either side
const STAPLE = { x:8700, y:60 };
const HEAD = {
  w:110, h:80, rest:{ x:8550, y:300 }, low:90,
  phases:[ { marks:2, breakers:false, storm:false }, { marks:2, breakers:true, storm:false }, { marks:2, breakers:true, storm:true } ],
  idle:[1.6, 1.3, 1.1], tell:.8, lunge:.3, taut:[2.6, 2.4, 2.2], back:.7, dmg:18, slamFrom:150, bounce:720,
};
const CHECKPOINTS = [ { id:'wreck', x:400 }, { id:'rock', x:2020 }, { id:'cliff', x:4550 }, { id:'mid', x:5750 }, { id:'head', x:ARENA.x1 - 120 } ];
function groundAt(x){ for(const g of GROUND) if(x >= g[0] && x < g[1]) return 0; return null; }
function ironRings(){ return Array.from({ length:IRON.n }, (_, i) => ({ x:IRON.x0 + i * IRON.step, y:IRON.y[i % 2], i })); }
function breakRings(){ const R = BREAK.rings; return Array.from({ length:R.n }, (_, i) => ({ x:R.x0 + i * R.step, y:R.y })); }
const CUES = Object.freeze({
  head:Object.freeze({ id:'fractured-last-head', src:'./audio/music/fractured-chains-of-the-deep.mp3', title:'Chains of the Deep (fractured)',
    artist:'Aerth score', mood:'the Last Head: strike the lock from above' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function ring(x, y, extra){ return Object.assign({ type:'actRing', x, y, w:24, h:24 }, extra || {}); }
function buildLevel(){
  const objects = [];
  GROUND.forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'cliff' })));
  objects.push({ type:'actWreck', x:420, y:0, w:520, h:200 });
  objects.push(Object.assign(Pl(WINDLASS.x, WINDLASS.w, WINDLASS.y), { h:WINDLASS.y, actArt:'windlass', fcWindlass:1 }));
  FIRST_RINGS.forEach(r => objects.push(ring(r.x, r.y)));
  ironRings().forEach(r => objects.push(ring(r.x, r.y, { fcIron:r.i })));
  breakRings().forEach(r => objects.push(ring(r.x, r.y, { fcBreak:1 })));
  HEAD_RINGS.forEach(r => objects.push(ring(r.x, r.y, { fcHead:1 })));
  objects.push({ type:'actRockface', x:STAPLE.x + 60, y:600, h:600, w:80 });   // drawn only: the road runs on past it
  objects.push({ type:'wall', x:ARENA.x1, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'head-west', gone:true });
  objects.push({ type:'wall', x:ARENA.x2, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'head-east', gone:false });
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:260, y:0, w:40, h:20, restSiteAnchor:'wreck-ash' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'stormgull', x:3000, y:520, patrol:[2600, 3500], noDrop:true },
      { t:'reefcrab', x:5200, patrol:[5000, 5400], noDrop:true },
      { t:'reefcrab', x:6400, patrol:[6200, 6650], noDrop:true },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    hook:done(c, 'fc-hook'), phase:done(c, 'fc-head-2') ? 2 : done(c, 'fc-head-1') ? 1 : 0, freed:done(c, 'fc-head'), marks:0,
    fight:false, introduced:done(c, 'fc-met'), over:false, waves:[], waveT:0, bolts:[] };
  const A = G.actTwo;
  const ids = ['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement',
    'companion-command', 'downward-strike', 'gravity-flip'];
  F.setKit(A.hook ? ids.concat('chain-hook') : ids);
  setBars('head-east', A.freed);
}
function firstFrame(A){ F.muster(); if(!A.freed) spawnHead(A); }
function spawnHead(A){
  const e = spawnEnemy('grunt', HEAD.rest.x);
  Object.assign(e, { actFoe:'lasthead', kind:'fly', x:HEAD.rest.x, y:HEAD.rest.y, baseY:HEAD.rest.y, w:HEAD.w, h:HEAD.h, st:'wait', t:0, face:-1,
    tx:HEAD.rest.x, ty:HEAD.rest.y, frontShield:false, portalGate:'head-never', active:true, noDrop:true, boss:false, maxHp:9999, hp:9999, noticeRange:1 });
  A.head = e;
}
function setBars(id, open){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === open) return; b.gone = open; b.moveT = 0.5;
}
function harm(p, dir, dmg){
  if(p.dead || p.invuln > 0 || p.dodgeTimer > 0) return;
  try{ hurtPlayer(dmg, dir, true); }catch(_e){}
}
function fall(p){ if(p.dead) return; if(p.actHook) p.actHook = null; try{ hurtPlayer(0, 1, false); }catch(_e){} }

/* ── The windlass: the hook, where it was ─────────────────────────────────── */
function windlass(A, p){
  if(p.dead) return;
  // Landed on the drum straight out of a downward strike. A short strike can begin and land inside one
  // frame, so a new strike is read from where the engine says it began (p.slamFromY), not from p.slamming.
  if(p.slamFromY != null && p.slamFromY !== A.slamSeen){ A.slamSeen = p.slamFromY; A.slamT = .25; }
  // Keep the landing window alive throughout a slam, including repeated launch heights.
  if(p.slamming) A.slamT = .25;
  A.slamT = Math.max(0, (A.slamT || 0) - 1 / 60);
  if(A.hook || !(A.slamT > 0 || p.slamming) || !p.onGround || !p.floorPlat || !p.floorPlat.fcWindlass) return;
  A.hook = true; kit.latch(ZONE, 'fc-hook'); F.grant('chain-hook'); A.flash = .4;
  try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
  A.queue.push({ src:{ x:WINDLASS.x, y:WINDLASS.y }, accent:'#b8d0e0', html:'<b>THE WINDLASS</b><br>It gives, and the chain it held comes off the drum into your hand: the hook, as it was. There is iron on the cliffs, and the sea between.' });
}

/* ── The lightning on the iron ────────────────────────────────────────────── */
function ironPhase(i, t){ const P = IRON.period; return ((((t - i * IRON.offset) % P) + P) % P); }   // 0 = the strike
function lightning(A, p, dt){
  for(const o of G.obstacles){
    if(o.fcIron == null && !(o.fcHead && A.fight && HEAD.phases[A.phase].storm)) continue;
    const i = o.fcIron != null ? o.fcIron : (o.x - ARENA.x1) / 300;
    const f = ironPhase(i, G.time);
    const struck = f < IRON.gone, warn = f > IRON.period - IRON.warn;
    if(struck && !o.gone){
      o.gone = true; kit.burst(o.x, o.y, '#f0f6ff', 14);
      try{ G.shake = Math.min((G.shake || 0) + 4, 10); }catch(_e){}
      if(p.actHook && p.actHook.ring === o){ harm(p, 1, IRON.dmg); p.actHook = null; }
    } else if(!struck && o.gone) o.gone = false;
    o.fcWarn = warn;
  }
}
function unstorm(){ for(const o of G.obstacles) if(o.fcHead){ o.gone = false; o.fcWarn = false; } }

/* ── The breakers ─────────────────────────────────────────────────────────── */
function breakers(A, p, dt){
  // Off the sea, from 1200 ahead of you (always seen coming); none spawn in the cliff's last stretch.
  const W = BREAK.wave, onCliff = p.x > BREAK.x0 && p.x < BREAK.x1 - 450, inHall = A.fight && HEAD.phases[A.phase].breakers;
  if(onCliff || inHall){
    A.waveT += dt;
    if(A.waveT >= W.every){ A.waveT = 0; A.waves.push({ t:0, x:inHall ? ARENA.x2 - 20 : Math.min(ARENA.x1 - 20, p.x + 1200), until:inHall ? ARENA.x1 : BREAK.x0 - 100 }); }
  } else A.waveT = W.every - .8;
  for(const w of A.waves){
    w.x -= W.speed * dt; w.t += dt;
    if(!p.dead && Math.abs(p.x - w.x) < W.w / 2 + 13 && p.y < W.h && !(p.actHook && p.actHook.state === 'hang')){
      if(inHall) harm(p, -1, 14); else fall(p);
    }
  }
  A.waves = A.waves.filter(w => w.x > w.until);
}

/* ── THE LAST HEAD ─────────────────────────────────────────────────────────── */
function updateHead(A, e, p, dt){
  if(p.dead || e.dead) return;
  e.t += dt; e.hp = 9999;
  e.burnT = e.poisonT = e.bleedT = e.freezeT = e.floatT = e.counterStunT = 0;
  e.shake = Math.max(0, (e.shake || 0) - dt);
  const ph = HEAD.phases[A.phase];
  const move = (tx, ty, sp) => { e.x += Math.sign(tx - e.x) * Math.min(Math.abs(tx - e.x), sp * dt); e.y += Math.sign(ty - e.y) * Math.min(Math.abs(ty - e.y), sp * dt); };
  switch(e.st){
    case 'wait':
      if(p.x > ARENA.x1 + 80 && p.x < ARENA.x2 && !p.dead){
        e.st = 'idle'; e.t = 0; A.fight = true; setBars('head-west', false); A.waveT = 0; A.waves = [];
        if(!A.introduced){ A.introduced = true; kit.latch(ZONE, 'fc-met');
          A.queue.push({ src:e, accent:'#b8d0e0', html:'<b>THE LAST HEAD</b><br>The others went free with the body. This one was chained to the cliff and forgotten, and it has been pulling ever since. Its lock is on its collar.' }); }
      }
      break;
    case 'idle':
      move(HEAD.rest.x, HEAD.rest.y + Math.sin(e.t * 2) * 20, 300);
      if(e.t >= HEAD.idle[A.phase] && !p.dead){
        // It lunges at you: at the ring you stand under.
        const r = HEAD_RINGS.slice().sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
        e.tx = r.x; e.ty = HEAD.low; e.st = 'tell'; e.t = 0; e.struck = false;
      }
      break;
    case 'tell': if(e.t >= HEAD.tell){ e.st = 'lunge'; e.t = 0; e.fromX = e.x; e.fromY = e.y; } break;
    case 'lunge': {
      const f = Math.min(1, e.t / HEAD.lunge);
      e.x = e.fromX + (e.tx - e.fromX) * f; e.y = e.fromY + (e.ty - e.fromY) * f;
      if(!p.dead && Math.abs(p.x - e.x) < e.w / 2 + 10 && p.y < e.y + e.h && p.y + p.h > e.y) harm(p, Math.sign(p.x - e.x) || -1, HEAD.dmg);
      if(f >= 1){ e.st = 'taut'; e.t = 0; kit.burst(e.x, e.y, '#9ab8c8', 12); }
      break;
    }
    case 'taut':
      // Straining at the end of its chain: the lock on its collar is open to a blow from above.
      if(!e.struck && p.slamming && Math.abs(p.x - e.x) < e.w / 2 + 8 && p.y < e.y + e.h + 14 && p.y > e.y + e.h - 50 &&
         (p.fcSlamFrom == null || p.fcSlamFrom - (e.y + e.h) >= HEAD.slamFrom)){
        e.struck = true; p.slamming = false; p.vy = -HEAD.bounce; p.jumpCutOk = false; p.fcSlamFrom = null; mark(A, e, p);
        if(!A.freed){ e.st = 'back'; e.t = 0; }
      } else if(e.t >= HEAD.taut[A.phase]){ e.st = 'back'; e.t = 0; }
      break;
    case 'back': move(HEAD.rest.x, HEAD.rest.y, 900); if(e.t >= HEAD.back){ e.st = 'idle'; e.t = 0; } break;
    case 'down': e.y = Math.max(-200, e.y - 200 * dt); break;
  }
  e.baseY = e.y;
  e.portalGate = 'head-never';
}
function mark(A, e, p){
  A.marks++; A.flash = .4; e.shake = .8; kit.burst(e.x, e.y + e.h, '#e8f0f6', 22);
  try{ if(meta.soundOn) SFX.hit(); G.shake = Math.min((G.shake || 0) + 8, 14); }catch(_e){}
  if(A.marks >= HEAD.phases[A.phase].marks){
    A.marks = 0;
    if(A.phase < HEAD.phases.length - 1){ kit.latch(ZONE, 'fc-head-' + (A.phase + 1)); A.phase++; }
    else {
      e.st = 'down'; A.freed = true; A.fight = false; A.waves = []; unstorm(); kit.latch(ZONE, 'fc-head'); F.clear(STAGE);
      setBars('head-east', true); setBars('head-west', true);
      A.queue.push({ src:e, accent:'#b8d0e0', html:'<b>THE LAST HEAD</b><br>The lock parts, and the chain runs out over the edge after the rest of it. For the first time since the storm began, nothing on this cliff is pulling.' });
      try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
    }
  }
}
function resetHead(A){
  const e = A.head; if(!e) return;
  A.fight = false; A.marks = 0; A.waves = []; A.queue = []; G.p.fcSlamFrom = null; e.struck = false; unstorm(); e.st = 'wait'; e.t = 0; e.x = HEAD.rest.x; e.y = HEAD.rest.y;
  setBars('head-west', true);
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  // Where a downward strike began: the head's lock wants one begun well above it.
  if(p.slamming && p.fcSlamFrom == null) p.fcSlamFrom = p.y; else if(!p.slamming) p.fcSlamFrom = null;
  lightning(A, p, dt);
  breakers(A, p, dt);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  windlass(A, p);
  if(A.fight && (p.dead || p.x < ARENA.x1 - 20)) resetHead(A);
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && A.freed && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('FRACTURED CLIFFS · BEHIND YOU', 'FRACTURED SHORES', 'Act Three · the next echo',
      'Behind you the cliffs hold nothing down. Ahead, the Landing Shores, where the Colony first answered.', false); }
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'lasthead') return updateHead(A, e, p, dt);
}
function lateUpdate(){}
function interact(){ return false; }
function swing(){}
function voidFloor(){ return -160; }
function cameraFloor(p){ if(!p) return null; return Math.max(-160, Math.min(0, p.y - 40)); }
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 400) return { connector:'fl-fc', zone:ZONE, targetStage:35, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.freed ? F.seamOn(STAGE, ZONE, 'fc-fs', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fc-fs' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.fight ? CUES.head : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedCliffs = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, ironRings, breakRings, ironPhase, constants:Object.freeze({ LEN, SPAWN, GROUND, WINDLASS, FIRST_RINGS, IRON, BREAK, ARENA,
    HEAD_RINGS, STAPLE, HEAD, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
