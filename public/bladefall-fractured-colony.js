/* Bladefall — ACT THREE · The Fractured Colony (stage 38), 2026-09-25.

   The eighteenth echo: the Colony after the Echo walked it backwards. The tents are empty and the lamps still
   sweep for the people who left; the spring is dry; the ringer still drives the chained. The kit is the one
   the Colony was entered with — everything through the Chainhook. Nothing waits here. The Muster applies.

     THE WATCH: three towers, three lamps sweeping the ground, empty tents to stand in. Held in a lamp for a
       breath and you are caught — back to the gate of the watch.
     THE DRY SPRING: rings up to the conduit, a lamp along it, cisterns to hide in, and at its end the tap —
       strike it from above and the yard gate lifts.
     THE RINGER'S ECHO (the C-side): the bell-ringer on his tower, shield to whoever comes. Two rings over him:
       hook across above his head, drop behind him, strike before he turns. Stand in his lamp and he rings,
       and the chained lunge. */
(function installFracturedColony(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 38, ZONE = 'fractured-colony', SOURCE = 18;
const LEN = 10000;
const SPAWN = { x:150, y:0 };

/* ── Geometry (world units; y up; the ground is y 0) ──────────────────────── */
/* The Watch: each lamp sweeps the ground x = tower + amp·sin(2πt/period + phase); a knight in its beam (not in a
   tent) for `catchT` is caught. */
const WATCH = { x0:1200, x1:5000, catchT:.25, beam:90,
  towers:[ { x:2000, amp:650, period:6.4, phase:0 }, { x:3250, amp:650, period:6.8, phase:2.1 }, { x:4400, amp:600, period:6.2, phase:4.0 } ] };
const TENTS = [ [1480, 1620], [1900, 2040], [2330, 2470], [2760, 2900], [3190, 3330], [3620, 3760], [4050, 4190], [4480, 4620], [4880, 5020] ];
/* The Dry Spring. The conduit's lamp sweeps 5800-6760: it stops 200 short of where you land off the rings. */
const SPRING = { rings:[ [5300, 360], [5520, 600] ], conduit:{ x0:5600, x1:6800, y:440 }, tap:{ x:6720, w:60, h:24 },
  lamp:{ x:6280, amp:480, period:5.6, phase:1.0 }, cisterns:[ [5880, 5980], [6380, 6480] ], gate:7350 };
/* The Ringer's yard. */
const YARD = { x1:7500, x2:9500 };
const TOWER = { x0:8800, x1:9000, y:380 };
const YARD_RINGS = [ [8600, 400], [8845, 560], [8955, 560], [9200, 400] ];   // an approach ring each side (the tower's are out of reach from the ground)
const POSTS = [ 7800, 8150, 8500, 9250 ];
const RINGER = {
  w:44, h:70, turn:[1.0, .9, .8], bash:{ reach:70, tell:.45, dmg:16, cool:1.2 }, throwOff:{ vx:-420, vy:-560 },
  phases:[ { marks:2, lamps:1, toll:0 }, { marks:2, lamps:1, toll:5.0 }, { marks:2, lamps:2, toll:4.0 } ],
  lamp:{ amp:850, period:[6.0, 5.2, 5.2], centre:8400, catchT:.3 },
  chain:{ reach:160, lunge:.45, dmg:12 },
};
const CHECKPOINTS = [ { id:'gate', x:400 }, { id:'watch', x:1100 }, { id:'spring', x:5150 }, { id:'yard', x:YARD.x1 - 120 } ];
function groundAt(x){ return x >= 0 && x < LEN ? 0 : null; }
function lampX(L, t){ return L.x + L.amp * Math.sin(2 * Math.PI * t / L.period + L.phase); }
function inTent(x){ return TENTS.some(([a, b]) => x > a + 8 && x < b - 8); }
function inCistern(x){ return SPRING.cisterns.some(([a, b]) => x > a + 6 && x < b - 6); }
const CUES = Object.freeze({
  ringer:Object.freeze({ id:'fractured-ringer', src:'./audio/music/fractured-village-vigil.mp3', title:'Village Vigil (fractured)',
    artist:'Aerth score', mood:'the Ringer\'s echo: behind him, before he turns' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function ring(x, y, extra){ return Object.assign({ type:'actRing', x, y, w:24, h:24 }, extra || {}); }
function buildLevel(){
  const objects = [];
  objects.push(Object.assign(GrAt(0, LEN, 0), { actArt:'mud' }));
  WATCH.towers.forEach(t => objects.push({ type:'actTower', x:t.x, y:0, w:40, h:520 }));
  TENTS.forEach(([a, b]) => objects.push({ type:'actTent', x:(a + b) / 2, y:0, w:b - a, h:90 }));
  // The Dry Spring.
  SPRING.rings.forEach(([x, y]) => objects.push(ring(x, y)));
  const C0 = SPRING.conduit;
  objects.push(Object.assign(Pl((C0.x0 + C0.x1) / 2, C0.x1 - C0.x0, C0.y), { h:30, actArt:'conduit' }));
  objects.push(Object.assign(Pl(SPRING.tap.x, SPRING.tap.w, C0.y + SPRING.tap.h), { h:SPRING.tap.h, actArt:'tap', fcoTap:1 }));
  objects.push({ type:'actTower', x:SPRING.lamp.x, y:C0.y, w:40, h:360, conduit:true });
  SPRING.cisterns.forEach(([a, b]) => objects.push({ type:'actCistern', x:(a + b) / 2, y:C0.y, w:b - a, h:70 }));
  objects.push({ type:'wall', x:SPRING.gate, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'spring-gate', gone:false });
  // The yard.
  objects.push(Object.assign(Pl((TOWER.x0 + TOWER.x1) / 2, TOWER.x1 - TOWER.x0, TOWER.y), { h:20, actArt:'platform' }));
  objects.push({ type:'actTower', x:(TOWER.x0 + TOWER.x1) / 2, y:0, w:60, h:TOWER.y, yard:true });
  YARD_RINGS.forEach(([x, y]) => objects.push(ring(x, y, { fcoYard:1 })));
  POSTS.forEach(x => objects.push({ type:'actPost', x, y:0, w:16, h:60 }));
  objects.push({ type:'wall', x:YARD.x1, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'yard-west', gone:true });
  objects.push({ type:'wall', x:YARD.x2, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'yard-east', gone:false });
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:300, y:0, w:40, h:20, restSiteAnchor:'colony-ash' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[ { t:'belled', x:5150, patrol:[5050, 5250], noDrop:true } ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    seenT:0, tapped:done(c, 'fco-tap'), phase:done(c, 'fco-ringer-2') ? 2 : done(c, 'fco-ringer-1') ? 1 : 0, silenced:done(c, 'fco-ringer'),
    marks:0, fight:false, introduced:done(c, 'fco-met'), over:false, yardSeenT:0, tollT:0, lunges:[], lampT:0 };
  F.setKit(['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement',
    'companion-command', 'downward-strike', 'gravity-flip', 'chain-hook']);
  setBars('spring-gate', G.actTwo.tapped); setBars('yard-east', G.actTwo.silenced);
}
function firstFrame(A){ F.muster(); spawnRinger(A); spawnChained(A); }
function spawnRinger(A){
  const e = spawnEnemy('grunt', (TOWER.x0 + TOWER.x1) / 2);
  Object.assign(e, { actFoe:'ringer', kind:'fly', x:(TOWER.x0 + TOWER.x1) / 2, y:TOWER.y, baseY:TOWER.y, w:RINGER.w, h:RINGER.h, st:'wait', t:0, face:-1,
    turnT:0, cool:1, frontShield:false, portalGate:'ringer-never', active:true, noDrop:true, boss:false, maxHp:9999, hp:9999, hpWas:9999, noticeRange:1 });
  if(A.silenced) e.st = 'down';
  A.ringer = e;
}
function spawnChained(A){
  A.chained = POSTS.map(x => { const e = spawnEnemy('grunt', x);
    Object.assign(e, { actFoe:'chained', kind:'fly', x, y:0, baseY:0, w:30, h:54, post:x, st:'sit', t:0, portalGate:'chained-never', active:true, noDrop:true,
      maxHp:9999, hp:9999, noticeRange:1, free:A.silenced }); return e; });
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

/* ── The Watch, and the conduit's lamp ────────────────────────────────────── */
function lit(p, x, beam){ return Math.abs(p.x - x) < beam + 13; }
function watch(A, p, dt){
  if(p.dead){ A.seenT = 0; A.seen = false; return; }
  let seen = false;
  if(p.x > WATCH.x0 && p.x < WATCH.x1 && p.y < 60 && !inTent(p.x)) for(const T of WATCH.towers) if(lit(p, lampX(T, A.t), WATCH.beam)) seen = true;
  const C0 = SPRING.conduit;
  if(p.x > C0.x0 && p.x < C0.x1 && Math.abs(p.y - C0.y) < 60 && !inCistern(p.x) && lit(p, lampX(SPRING.lamp, A.t), WATCH.beam)) seen = true;
  A.seenT = seen ? A.seenT + dt : Math.max(0, A.seenT - dt);
  A.seen = seen;
  if(A.seenT >= WATCH.catchT && !p.dead){ A.seenT = 0; kit.burst(p.x, p.y + 30, '#ffd070', 12); fall(p); }
}
/* The tap: struck from above, it opens and the yard gate lifts. */
function tap(A, p){
  if(p.dead) return;
  if(p.slamFromY != null && p.slamFromY !== A.slamSeen){ A.slamSeen = p.slamFromY; A.slamT = .25; }
  // Keep the landing window alive throughout a slam, including repeated launch heights.
  if(p.slamming) A.slamT = .25;
  A.slamT = Math.max(0, (A.slamT || 0) - 1 / 60);
  if(A.tapped || !(A.slamT > 0 || p.slamming) || !p.onGround || !p.floorPlat || !p.floorPlat.fcoTap) return;
  A.tapped = true; kit.latch(ZONE, 'fco-tap'); setBars('spring-gate', true); A.flash = .4;
  try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
  A.queue.push({ src:{ x:SPRING.tap.x, y:SPRING.conduit.y }, accent:'#ffd070', html:'<b>THE TAP</b><br>It gives with a dry cough. Nothing runs through it; there is nothing left to. But the counterweight drops, and somewhere below, the yard gate lifts.' });
}

/* ── THE RINGER'S ECHO ────────────────────────────────────────────────────── */
function yardLamps(A){ const L = RINGER.lamp, n = RINGER.phases[A.phase].lamps, P = L.period[A.phase];
  const out = [L.centre + L.amp * Math.sin(2 * Math.PI * A.lampT / P)]; if(n > 1) out.push(L.centre - L.amp * Math.sin(2 * Math.PI * A.lampT / P + 1.2)); return out; }
function toll(A, e){
  A.tollT = 0; e.ringing = .6; kit.burst(e.x, e.y + e.h + 20, '#ffd070', 12);
  try{ if(meta.soundOn) SFX.bell ? SFX.bell() : SFX.levelup(); }catch(_e){}
  for(const c of A.chained || []) if(!c.free){ c.st = 'lunge'; c.t = 0; }
}
function updateChained(A, e, p, dt){
  if(p.dead || e.dead) return;
  e.t += dt; e.hp = 9999; e.burnT = e.poisonT = e.bleedT = e.freezeT = e.floatT = e.counterStunT = 0;
  if(e.free){ e.st = 'free'; return; }
  const R = RINGER.chain;
  if(e.st === 'lunge'){
    const tx = Math.max(e.post - R.reach, Math.min(e.post + R.reach, p.x));
    e.x += Math.sign(tx - e.x) * Math.min(Math.abs(tx - e.x), 700 * dt);
    if(!p.dead && Math.abs(p.x - e.x) < 24 && p.y < 50) harm(p, Math.sign(p.x - e.x) || 1, R.dmg);
    if(e.t >= R.lunge){ e.st = 'back'; e.t = 0; }
  } else if(e.st === 'back'){ e.x += Math.sign(e.post - e.x) * Math.min(Math.abs(e.post - e.x), 300 * dt); if(e.t > .6) e.st = 'sit'; }
  e.y = 0; e.baseY = 0;
}
function updateRinger(A, e, p, dt){
  if(p.dead || e.dead) return;
  e.t += dt; e.turnT += dt; e.cool = Math.max(0, e.cool - dt); e.ringing = Math.max(0, (e.ringing || 0) - dt);
  e.burnT = e.poisonT = e.bleedT = e.freezeT = e.floatT = e.counterStunT = 0;
  if(e.hp < e.hpWas && e.portalGate === 'melee') struck(A, e, p);
  e.hp = e.hpWas = 9999; e.shake = Math.max(0, (e.shake || 0) - dt);
  const ph = RINGER.phases[A.phase];
  if(A.fight && e.st !== 'down'){
    A.lampT += dt; A.tollT += dt;
    const lamps = yardLamps(A); A.lamps = lamps;
    const seen = p.y < 60 && p.x > YARD.x1 && p.x < YARD.x2 && lamps.some(x => lit(p, x, WATCH.beam));
    A.yardSeenT = seen ? A.yardSeenT + dt : Math.max(0, A.yardSeenT - dt * 2);
    if(A.yardSeenT >= RINGER.lamp.catchT){ A.yardSeenT = 0; toll(A, e); }
    if(ph.toll && A.tollT >= ph.toll) toll(A, e);
  }
  // He turns to whoever comes, slowly.
  const want = Math.sign(p.x - e.x) || e.face;
  if(want !== e.face && e.turnT >= RINGER.turn[A.phase]){ e.face = want; e.turnT = 0; }
  else if(want === e.face) e.turnT = 0;
  const onDeck = p.onGround && p.floorPlat && p.floorPlat.actArt === 'platform';
  switch(e.st){
    case 'wait':
      if(p.x > YARD.x1 + 80 && p.x < YARD.x2 && !p.dead){
        e.st = 'watch'; e.t = 0; A.fight = true; A.tollT = 0; A.lampT = 0; setBars('yard-west', false);
        if(!A.introduced){ A.introduced = true; kit.latch(ZONE, 'fco-met');
          A.queue.push({ src:e, accent:'#ffd070', html:'<b>THE RINGER\'S ECHO</b><br>The chained have nowhere to be driven now, and he rings for them anyway. He turns his shield to whoever climbs to him.' }); }
      }
      break;
    case 'watch':
      if(onDeck && e.face === want && Math.abs(p.x - e.x) < RINGER.bash.reach && e.cool <= 0){ e.st = 'bash-tell'; e.t = 0; }
      break;
    case 'bash-tell': if(e.t >= RINGER.bash.tell){ e.st = 'bash'; e.t = 0; } break;
    case 'bash':
      if(onDeck && Math.abs(p.x - (e.x + e.face * e.w / 2)) < 34){ harm(p, e.face, RINGER.bash.dmg); p.vx = e.face * 420; p.vy = -380; p.jumpCutOk = false; }
      if(e.t >= .2){ e.st = 'watch'; e.cool = RINGER.bash.cool; }
      break;
    case 'down': break;
  }
  e.x = (TOWER.x0 + TOWER.x1) / 2; e.y = TOWER.y; e.baseY = e.y;
  // Only from behind.
  const behind = Math.sign(p.x - e.x) === -e.face;
  e.portalGate = e.st !== 'wait' && e.st !== 'down' && behind ? 'melee' : 'ringer-never';
}
function struck(A, e, p){
  A.marks++; A.flash = .4; e.shake = .8; kit.burst(e.x, e.y + e.h / 2, '#ffd070', 20);
  try{ if(meta.soundOn) SFX.hit(); }catch(_e){}
  // He throws you off his tower, and turns.
  p.vx = RINGER.throwOff.vx * (Math.sign(p.x - e.x) || 1) * -1; p.vy = RINGER.throwOff.vy; p.jumpCutOk = false; e.face = Math.sign(p.x - e.x) || e.face; e.turnT = 0;
  if(A.marks >= RINGER.phases[A.phase].marks){
    A.marks = 0;
    if(A.phase < RINGER.phases.length - 1){ kit.latch(ZONE, 'fco-ringer-' + (A.phase + 1)); A.phase++; }
    else {
      e.st = 'down'; A.silenced = true; A.fight = false; kit.latch(ZONE, 'fco-ringer'); F.clear(STAGE);
      for(const c of A.chained || []){ c.free = true; c.st = 'free'; }
      setBars('yard-east', true); setBars('yard-west', true);
      A.queue.push({ src:e, accent:'#ffd070', html:'<b>THE RINGER\'S ECHO</b><br>The bell rope goes slack in his hand. Below, the chained sit down in the mud one by one, as if they had been waiting for permission.' });
      try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
    }
  }
}
function resetRinger(A){
  const e = A.ringer; if(!e) return;
  A.fight = false; A.marks = 0; A.tollT = 0; A.lampT = 0; A.yardSeenT = 0; e.st = 'wait'; e.t = 0; e.face = -1;
  A.queue = []; A.slamT = 0; A.slamSeen = null;
  Object.assign(e, { turnT:0, cool:1, ringing:0, hp:9999, hpWas:9999, portalGate:'ringer-never' });
  for(const c of A.chained || []){ c.st = 'sit'; c.x = c.post; c.t = 0; }
  setBars('yard-west', true);
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  watch(A, p, dt);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  tap(A, p);
  if(A.fight && (p.dead || p.x < YARD.x1 - 20)) resetRinger(A);
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && A.silenced && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('THE FRACTURED COLONY · BEHIND YOU', 'THE FRACTURED PATH', 'Act Three · the next echo',
      'Behind you the lamps sweep an empty colony. Ahead, the Palace Path, where the road climbs toward the Sun.', false); }
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'ringer') return updateRinger(A, e, p, dt);
  if(e.actFoe === 'chained') return updateChained(A, e, p, dt);
}
function lateUpdate(){}
function interact(){ return false; }
function swing(){}
function voidFloor(){ return -120; }
function cameraFloor(p){ if(!p) return null; return Math.max(-120, Math.min(0, p.y - 40)); }
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 200) return { connector:'fs-fco', zone:ZONE, targetStage:37, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.silenced ? F.seamOn(STAGE, ZONE, 'fco-fp', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fco-fp' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.fight ? CUES.ringer : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedColony = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, lampX, inTent, inCistern, constants:Object.freeze({ LEN, SPAWN, WATCH, TENTS, SPRING, YARD, TOWER, YARD_RINGS, POSTS, RINGER, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
