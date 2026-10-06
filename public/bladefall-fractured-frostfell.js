/* Bladefall — ACT THREE · The Fractured Frostfell (stage 28), 2026-09-24.

   The eighth echo: Frostfell after the Echo walked it backwards. Frostfell is warm, which it never was.
   Every hearth burns and no one tends them, and the ice they were lit against is going. The kit is the
   one Frostfell was entered with: jump, the Oathblade, the dash, the twin mouths, the wall jump and the
   Counter. The double jump waits in its memory, where it did. The Muster applies.

     THE TOLL: two tollmen with their backs to the toll's bars. Nothing reaches them past the spear,
       except the spear itself: counter the thrust and it reels open for the blade.
     THE THAW STREETS: the streets are meltwater now. Thin ice cracks under you in half a second and
       sinks, so you keep moving and rest only on the dry stones.
     THE FROST MEMORY: the double jump.
     THE FROZEN STAIR: the stair is thawing over the void. Its rises are too high for a jump and a
       dash, the ice gives way if you stand on it, and spikes stand up out of the thaw on a beat.
     THE CROWN (the C-side): THE RIMEGUARD, the last of the garrison. Its guard cannot be broken and
       only a countered thrust opens it. First the drill (one thrust), then the feint (three thrusts,
       the second one held), then the thaw (a held third thrust, with a low sweep and ice thrown low
       between them, which cannot be countered and must be jumped). Two openings in each. */
(function installFracturedFrostfell(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 28, ZONE = 'fractured-frostfell', SOURCE = 7;
const LEN = 9800;
const SPAWN = { x:140, y:0 };

/* ── Geometry (world units; y up; the floor is y 0; below it meltwater, and the void) ──────── */
const GROUND = [ [0, 1760], [4300, 5300] ];
const TOLL = [ { id:'toll-1', bars:900, wounds:2, wind:.6 }, { id:'toll-2', bars:1560, wounds:3, wind:.45 } ];
const TM = { w:44, h:70, reach:95, walk:60, post:160, recover:.5, cool:1.0, reel:1.1, dmg:16 };
/* The Thaw Streets: thin ice cracks after half a second of standing and sinks for 2.6 s; dry stones hold.
   Ice gaps are 100 (a running jump, 148, with room: at 130 only a jump from the plate's last ~20 made it); the
   first and the last are 175 and 235 (the dash). */
const THIN = { crack:.5, sunk:2.6 };
const STREET_ICE = [1980, 2170, 2620, 2810, 3000, 3450, 3640, 3830, 4020];
const STREET_DRY = [ [2400, 150], [3230, 150] ];
const MEMORY = { x:4700, y:0 };
/* The Frozen Stair: rises of ~170 over gaps of ~165. Measured: a jump and a dash top out at 153, a double jump
   alone at 147, a double jump and a dash at 191. Thawing ice gives way after 0.9 s of standing. */
const STAIR_THAW = .9;
const STAIR = [                                      // x, w, y, kind ('ice' thaws; 'dry' holds, with a checkpoint)
  [5480, 110, 120, 'ice'], [5760, 110, 290, 'ice'], [6060, 160, 400, 'dry'], [6360, 110, 570, 'ice'],
  [6680, 110, 470, 'ice'], [6980, 110, 630, 'ice'], [7300, 160, 520, 'dry'], [7600, 100, 690, 'ice'], [7900, 100, 560, 'ice'],
];
const STAIR_SPIKES = [ [6680, 470, 0], [7900, 560, 1.2] ];   // x, y, phase: up 1.0 s of every 2.4
const CROWN = { x0:8100, y:620 };
const ARENA = { x1:8300, x2:9300 };
const R = {                                          // THE RIMEGUARD
  w:56, h:92, reach:105, walk:80, dmg:20, reel:1.1, recover:.35, gap:1.0,
  // Each number is a windup; a thrust follows it by .18 s. Thrusts are never closer than .8 s: the Counter's own
  // cooldown is .7 s (at .63 s apart, the first draft's feint could not be countered through).
  phases:[ { opens:2, combo:[.6] },                  // the drill: one thrust
           { opens:2, combo:[.62, 1.2, .62] },       // the feint: the second thrust held
           { opens:2, combo:[.62, .62, 1.1], thaw:true } ],   // the thaw: a held third; a sweep and shards between
  sweep:{ tell:.6, reach:170, dmg:20 }, shards:{ n:3, speed:430, every:.38, dmg:16 },
};
const CHECKPOINTS = [ { id:'toll', x:400 }, { id:'bank', x:1700 }, { id:'stone-1', x:2400 }, { id:'stone-2', x:3230 },
  { id:'memory', x:4450 }, { id:'stair-1', x:6060, y:400 }, { id:'stair-2', x:7300, y:520 }, { id:'crown', x:8200, y:CROWN.y } ];
function groundAt(x){ for(const g of GROUND) if(x >= g[0] && x < g[1]) return 0; return null; }
const CUES = Object.freeze({
  crown:Object.freeze({ id:'fractured-frozen-garrison', src:'./audio/music/fractured-engine-of-the-frozen-garrison.mp3', title:'Engine of the Frozen Garrison (fractured)',
    artist:'Aerth score', mood:'the Crown: the last of the garrison, thawing' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function stone(x, top, bottom, w){ return Object.assign(Wl(x, top, top - bottom, w), { noCling:1, slickL:1, slickR:1, actArt:'frostwall' }); }
function buildLevel(){
  const objects = [];
  GROUND.forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'snow' })));
  // The Toll: each tollman's bars, stone above them.
  for(const t of TOLL){
    // The bars exactly as wide as the stone over them: at 26 under 44, a knight pressed against the bars stood inside the
    // stone's width, and a jump and a dash carried him up through it and past the toll (measured, 7.209).
    objects.push({ type:'wall', x:t.bars, y:120, h:124, w:44, noCling:1, actArt:'bars', actBars:t.id, gone:false });
    objects.push(stone(t.bars, 1700, 120, 44));
  }
  // The Thaw Streets.
  STREET_ICE.forEach(x => objects.push(Object.assign(Pl(x, 90, 0), { h:14, ice:1, actArt:'thin', ffThin:THIN.crack })));
  STREET_DRY.forEach(d => objects.push(Object.assign(Pl(d[0], d[1], 0), { h:30, actArt:'stone' })));
  objects.push({ type:'actMemory', actId:'memory', x:MEMORY.x, y:MEMORY.y, w:44, h:70, actTwoUp:1, actVerb:'REMEMBER' });
  // The Frozen Stair.
  STAIR.forEach(s => objects.push(Object.assign(Pl(s[0], s[1], s[2]), s[3] === 'ice'
    ? { h:16, ice:1, actArt:'thin', ffThin:STAIR_THAW } : { h:28, actArt:'stone' })));
  STAIR_SPIKES.forEach(s => objects.push(Sp(s[0], s[1], { w:90, period:2.4, phase:s[2], upT:1.0, dmg:14 })));
  // The Crown.
  objects.push(Object.assign(Pl((CROWN.x0 + LEN) / 2, LEN - CROWN.x0, CROWN.y), { h:40, actArt:'crown' }));
  objects.push({ type:'wall', x:ARENA.x1, y:CROWN.y + 900, h:900, w:30, noCling:1, actArt:'bars', actBars:'crown-west', gone:true });
  objects.push({ type:'wall', x:ARENA.x2, y:CROWN.y + 900, h:900, w:30, noCling:1, actArt:'bars', actBars:'crown-east', gone:false });
  objects.push({ type:'actTunnel', x:LEN - 200, y:CROWN.y, w:300, h:360 });
  objects.push({ type:'actFire', x:300, y:0, w:40, h:20, restSiteAnchor:'refuge-ash' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'frostpike', x:2400, patrol:[2350, 2450], noDrop:true },
      { t:'frostsinger', x:3230, patrol:[3180, 3280], noDrop:true },
      { t:'rimehulk', x:5000, patrol:[4800, 5200], noDrop:true },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    toll:Object.fromEntries(TOLL.map(t => [t.id, done(c, 'ff-' + t.id)])), memory:done(c, 'ff-memory'),
    phase:done(c, 'ff-rime-2') ? 2 : done(c, 'ff-rime-1') ? 1 : 0, rimed:done(c, 'ff-rime'), opens:0,
    fight:false, introduced:done(c, 'ff-met'), over:false, shards:[], aoes:[] };
  const A = G.actTwo;
  // Frostfell's kit: jump, blade, dash, the twin mouths, the wall jump, the Counter — and the double jump, remembered.
  const ids = ['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter'];
  F.setKit(A.memory ? ids.concat('double-jump') : ids);
  for(const t of TOLL) setBars(t.id, A.toll[t.id]);
  setBars('crown-east', A.rimed);
  const m = G.obstacles.find(o => o.actId === 'memory'); if(m) m.actMute = A.memory;
}
function firstFrame(A){
  F.muster();
  for(const t of TOLL) if(!A.toll[t.id]) spawnGuard(A, 'tollman', t.bars - 40, 0, { toll:t.id, wounds:t.wounds, combo:[t.wind], post:t.bars - 40 });
  A.rime = spawnGuard(A, 'rimeguard', 9000, CROWN.y, { st:A.rimed ? 'down' : 'wait', frontShield:!A.rimed });
}
function spawnGuard(A, kind, x, y, extra){
  const e = spawnEnemy('grunt', x);
  Object.assign(e, { actFoe:kind, x, y, baseY:y, w:kind === 'rimeguard' ? R.w : TM.w, h:kind === 'rimeguard' ? R.h : TM.h, st:'guard', t:0,
    face:-1, shieldFace:-1, frontShield:true, portalGate:'rime-never', active:true, noDrop:true, boss:false, maxHp:9999, hp:9999, hpWas:9999,
    noticeRange:1, cool:.8, ci:0, homeX:x, homeY:y }, extra || {});
  return e;
}
function setBars(id, open){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === open) return; b.gone = open; b.moveT = 0.5;
}
/* A blow that can be countered: countered, it returns true (and stuns nothing: the guard decides what follows). */
function thrust(e, p, dmg){
  if(p.dead) return 'miss';
  const dir = Math.sign(p.x - e.x) || e.face;
  const inFront = dir === e.face, reach = e.actFoe === 'rimeguard' ? R.reach : TM.reach;
  if(!inFront || Math.abs(p.x - e.x) > reach || Math.abs(p.y - e.y) > 70) return 'miss';
  let countered = false;
  try{ countered = tryPlayerCounter('melee', dir, e); }catch(_e){}
  e.counterStunT = 0; e.vx = 0;
  if(countered) return 'countered';
  if(p.invuln > 0 || p.dodgeTimer > 0) return 'miss';
  try{ hurtPlayer(dmg, dir, true); }catch(_e){}
  if(!p.dead){ p.vx = dir * 300; p.vy = 240; }
  return 'hit';
}
/* A blow that cannot be countered (the sweep, the shards): jump it. */
function harm(p, dir, dmg){
  if(p.dead || p.invuln > 0 || p.dodgeTimer > 0) return;
  try{ hurtPlayer(dmg, dir, true); }catch(_e){}
  if(!p.dead){ p.vx = dir * 260; p.vy = 220; }
}

/* ── The thaw: thin ice gives way under a standing knight, and freezes again ──────────── */
function thaw(A, p, dt){
  for(const o of G.obstacles){
    if(!o.ffThin) continue;
    if(o.gone){ o.sunkT -= dt; if(o.sunkT <= 0 && !(Math.abs(p.x - o.x) < o.w / 2 + 20 && Math.abs(p.y - o.y) < 50)){ o.gone = false; o.crackT = 0; } continue; }
    if(p.onGround && p.floorPlat === o && !p.dead){
      o.crackT = (o.crackT || 0) + dt;
      if(o.crackT >= o.ffThin){ o.gone = true; o.sunkT = THIN.sunk; o.crackT = 0; kit.burst(o.x, o.y, '#cfe8f4', 10);
        try{ if(meta.soundOn) SFX.hit(); }catch(_e){} }
    } else if(o.crackT > 0) o.crackT = Math.max(0, o.crackT - dt * .5);
  }
}

/* ── The tollmen and the Rimeguard: a guard nothing breaks but its own countered thrust ──────── */
function combo(A, e){ return e.actFoe === 'rimeguard' ? R.phases[A.phase].combo : e.combo; }
function updateGuard(A, e, p, dt){
  if(p.dead || e.dead) return;
  e.t += dt;
  e.burnT = e.poisonT = e.bleedT = e.freezeT = e.floatT = 0;
  if(e.hp < e.hpWas) onWound(A, e, p);
  e.hp = e.hpWas = 9999;
  if(e.dead) return;
  const rime = e.actFoe === 'rimeguard', dx = p.x - e.x, dist = Math.abs(dx);
  const turn = () => { if(Math.abs(dx) > 8){ e.face = e.shieldFace = Math.sign(dx); } };
  switch(e.st){
    case 'wait':
      if(p.x > ARENA.x1 + 80 && p.x < ARENA.x2 && Math.abs(p.y - CROWN.y) < 40 && !p.dead){
        e.st = 'guard'; e.t = 0; e.cool = 1.0; A.fight = true; setBars('crown-west', false);
        if(!A.introduced){ A.introduced = true; kit.latch(ZONE, 'ff-met');
          A.queue.push({ src:e, accent:'#bfe0f0', html:'<b>THE RIMEGUARD</b><br>The last of the garrison, its ice armour running with meltwater. It lowers its spear toward you, the way it was taught to.' }); }
      }
      break;
    case 'guard': {
      turn();
      const want = (rime ? R.reach : TM.reach) - 20;
      if(dist > want){ const step = Math.sign(dx) * (rime ? R.walk : TM.walk) * dt; e.x += step; }
      if(!rime) e.x = Math.max(e.post - TM.post, Math.min(e.post, e.x));
      e.cool -= dt;
      if(e.cool <= 0 && dist < want + 80 && Math.abs(p.y - e.y) < 60){
        if(rime && R.phases[A.phase].thaw && e.lastWasCombo){ e.lastWasCombo = false; e.st = Math.random() < .5 ? 'sweep-tell' : 'shard-tell'; e.t = 0; break; }
        e.ci = 0; e.st = 'wind'; e.t = 0; e.lastWasCombo = true;
      }
      break;
    }
    case 'wind':                                     // the spear drawn back; a held one is the feint
      turn();
      if(dist > (rime ? R.reach : TM.reach) - 25) e.x += Math.sign(dx) * (rime ? R.walk : TM.walk) * dt;
      if(!rime) e.x = Math.max(e.post - TM.post, Math.min(e.post, e.x));
      if(e.t >= combo(A, e)[e.ci]){
        e.st = 'thrust'; e.t = 0; e.x += e.face * 16;
        const r = thrust(e, p, rime ? R.dmg : TM.dmg), last = e.ci >= combo(A, e).length - 1;
        if(r === 'countered' && last){ e.st = 'reel'; e.t = 0; e.woundedThisReel = false; A.flash = .3; kit.burst(e.x + e.face * 20, e.y + 50, '#f1f6ff', 14); }
        else if(r === 'countered'){ e.x -= e.face * 10; kit.burst(e.x + e.face * 20, e.y + 50, '#f1f6ff', 6); }
      }
      break;
    case 'thrust':
      if(e.t >= .18){ e.x -= e.face * 16;
        if(e.ci < combo(A, e).length - 1){ e.ci++; e.st = 'wind'; e.t = 0; }
        else { e.st = 'recover'; e.t = 0; } }
      break;
    case 'recover': if(e.t >= (rime ? R.recover : TM.recover)){ e.st = 'guard'; e.t = 0; e.cool = rime ? R.gap : TM.cool; } break;
    case 'reel':                                     // countered: open to the blade
      if(e.t >= (rime ? R.reel : TM.reel)){ e.st = 'recover'; e.t = 0; }
      break;
    // The thaw: a low sweep, and ice thrown low. Neither is a blow the Counter answers.
    case 'sweep-tell': turn(); if(e.t >= R.sweep.tell){ e.st = 'sweep'; e.t = 0; A.aoes.push({ x:e.x + e.face * R.sweep.reach / 2, r:R.sweep.reach / 2, y:e.y, t:.25 });
      if(dist < R.sweep.reach && Math.sign(dx) === e.face && p.y - e.y < 34) harm(p, e.face, R.sweep.dmg); } break;
    case 'sweep': if(e.t >= .4){ e.st = 'guard'; e.t = 0; e.cool = .6; } break;
    case 'shard-tell': turn(); if(e.t >= .5){ e.st = 'shards'; e.t = 0; e.thrown = 0; } break;
    case 'shards':
      if(e.thrown < R.shards.n && e.t >= e.thrown * R.shards.every){ e.thrown++;
        A.shards.push({ x:e.x + e.face * 30, y:e.y + 14, vx:e.face * R.shards.speed, life:2.4 }); }
      if(e.thrown >= R.shards.n && e.t >= R.shards.n * R.shards.every + .2){ e.st = 'guard'; e.t = 0; e.cool = .7; }
      break;
    case 'down': break;
  }
  if(rime && e.st !== 'wait'){ e.x = Math.max(ARENA.x1 + 40, Math.min(ARENA.x2 - 40, e.x)); }
  e.y = e.homeY; e.baseY = e.y;
  // Its guard: only the blade, and only while it reels.
  const open = e.st === 'reel';
  e.frontShield = !open && e.st !== 'down'; e.portalGate = open ? 'melee' : 'rime-never';
}
function onWound(A, e, p){
  if(e.st !== 'reel' || e.woundedThisReel) return;
  e.woundedThisReel = true; kit.burst(e.x, e.y + 50, '#e8f4ff', 16); A.flash = .35;
  e.st = 'recover'; e.t = 0;
  if(e.actFoe === 'tollman'){
    if(--e.wounds <= 0){ e.dead = true; e.hp = 0; kit.burst(e.x, e.y + 40, '#cfe8f4', 24); G.shake = Math.max(G.shake || 0, 6); }
    return;
  }
  A.opens++;
  if(A.opens >= R.phases[A.phase].opens){
    A.opens = 0;
    if(A.phase < R.phases.length - 1){ kit.latch(ZONE, 'ff-rime-' + (A.phase + 1)); A.phase++; e.cool = 1.4; }
    else {
      e.st = 'down'; A.rimed = true; A.fight = false; A.shards = []; A.aoes = []; kit.latch(ZONE, 'ff-rime'); F.clear(STAGE);
      setBars('crown-east', true); setBars('crown-west', true); e.frontShield = false;
      A.queue.push({ src:e, accent:'#bfe0f0', html:'<b>THE RIMEGUARD</b><br>It kneels, and the ice goes out of its armour all at once, as meltwater. The spear it holds is only wood.' });
      try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
    }
  }
}
/* The tollmen carry the toll: its bars lift when the tollman in front of them falls. */
function tolls(A){
  for(const t of TOLL){
    if(A.toll[t.id]) continue;
    if(G.enemies.some(e => e.toll === t.id && !e.dead)) continue;
    A.toll[t.id] = true; kit.latch(ZONE, 'ff-' + t.id); setBars(t.id, true);
    try{ if(meta.soundOn) SFX.pickup(); }catch(_e){}
  }
}
function shards(A, p, dt){
  for(const s of A.shards){
    s.x += s.vx * dt; s.life -= dt;
    if(s.x < ARENA.x1 || s.x > ARENA.x2) s.life = 0;
    if(s.life > 0 && Math.abs(s.x - p.x) < 16 && p.y - CROWN.y < 26 && Math.abs(p.y - CROWN.y) < 40){ harm(p, Math.sign(s.vx), R.shards.dmg); s.life = 0; }
  }
  A.shards = A.shards.filter(s => s.life > 0);
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  for(const a of A.aoes) a.t -= dt; A.aoes = A.aoes.filter(a => a.t > 0);
  thaw(A, p, dt);
  shards(A, p, dt);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  if(p.dead){ A.shards = []; A.aoes = []; }
  else tolls(A);
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && A.rimed && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('THE FRACTURED FROSTFELL · BEHIND YOU', 'THE FRACTURED SORCERER', 'Act Three · the next echo',
      'Behind you the last of the garrison kneels in its own meltwater. Ahead the White Court is lit, and every door in it is open.', false); }
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'tollman' || e.actFoe === 'rimeguard') return updateGuard(A, e, p, dt);
}
function interact(o){
  const A = G.actTwo; if(!A || A.stage !== STAGE || G.p.dead) return false;
  if(o.actId === 'memory' && !A.memory){
    A.memory = true; o.actMute = true; kit.latch(ZONE, 'ff-memory'); F.grant('double-jump'); A.flash = .4;
    try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
    A.queue.push({ src:o, accent:'#bfe0f0', html:'<b>THE FROST MEMORY</b><br>A boy jumping on the ice of a frozen pond, again, higher, as if the air had a second floor. The ice under him is thin, and he knows it.' });
    return true;
  }
  return false;
}
function lateUpdate(){}
function swing(){}
function voidFloor(){ return -140; }
/* The stair and the crown look up. */
function cameraFloor(p){
  if(!p) return null;
  return p.x > 5300 ? Math.max(0, Math.min(p.y, CROWN.y) - 200) : 0;
}
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 400) return { connector:'fw-ff', zone:ZONE, targetStage:27, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.rimed ? F.seamOn(STAGE, ZONE, 'ff-fs', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'ff-fs' ? { x:LEN - 160, y:CROWN.y } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.fight ? CUES.crown : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedFrostfell = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, constants:Object.freeze({ LEN, SPAWN, GROUND, TOLL, TM, THIN, STREET_ICE, STREET_DRY, MEMORY, STAIR_THAW, STAIR,
    STAIR_SPIKES, CROWN, ARENA, R, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
