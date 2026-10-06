/* Bladefall — ACT THREE · The Fractured Tyrant (stage 33), 2026-09-25.

   The thirteenth echo: the Citadel after the Echo walked it backwards. The Tyrant travelled by tearing
   the room open; in the echo the tears are all that is left of him, and they do not stay open. It was
   walked east to west, so the echo runs west to east. The kit is the one the Citadel was entered with:
   everything through the gravity flip (which this Citadel, like its original, never turns on). No
   ability waits here. The Muster applies.

     THE TORN ROAD: one tear across a void, open. Dash into its mouth.
     THE BLINKING CHAIN: three tears over one long void, each open for a beat, each opening a beat after
       the one before, stepping down. Take the first as it opens; its exit hands you back the dash, and you
       spend it on the next mouth in the air.
     THE SPENT LINE: the Citadel's own room walked the other way — a bed of teeth no jump crosses, a raised
       slate face, and a tear that runs back into that face. Both your mouths on the face; ride the tear into
       the lower and the upper throws you over the teeth.
     THE TEARER (the C-side): what the Tyrant left of himself. It cannot be cut; only a tear can pass
       through it. It opens one through its own body and holds still while it is open — ride it through. */
(function installFracturedTyrant(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 33, ZONE = 'fractured-tyrant', SOURCE = 12;
const LEN = 10000;
const SPAWN = { x:140, y:0 };

/* ── Geometry (world units; y up; the floor is y 0) ─────────────────────────── */
const GROUND = [ [0, 900], [1900, 2400], [4700, LEN] ];
/* The Torn Road: one steady tear, floor to floor. */
const ROAD_TEAR = { ax:870, ay:40, bx:1930, by:40 };
/* The Blinking Chain: steps up to the first mouth, then three tears stepping down, each open `upT` of
   `period`, each opening `lag` after the one before. */
const STEPS = [ [2200, 120, 120], [2330, 120, 240] ];
const CHAIN = { x0:2420, y0:260, len:550, gap:220, drop:70, n:3, period:2.4, upT:.7, lag:.8 };
/* The Spent Line: a raised slate face, a tear back into it from the lip of the bed, the bed. */
const FACE = { x:5200, w:60, bottom:100, top:560 };
const LINE_TEAR = { ax:5530, ay:150, bx:FACE.x + FACE.w / 2 + 12, by:150 };
const BED = { x0:5560, x1:6960 };
/* The Tearer's hall. */
const HALL = { x1:7850, x2:9350 };   // the fling lands ~7300 wherever the upper mouth is set (measured 7290-7340)
const PERCHES = [ { x:7960, w:140, y:230 }, { x:9240, w:140, y:230 } ];   // against the walls
const PERCH_STEPS = [ { x:8110, w:120, y:110 }, { x:9090, w:120, y:110 } ];   // on the hall side; rises of 110 and 120, a double jump each (147)   // rises of 110 and 120: a double jump each (147)
const TEARER = {
  w:90, h:110, y:{ low:40, high:300 }, glide:260,
  phases:[ { marks:2, how:'floor' }, { marks:2, how:'perch' }, { marks:2, how:'chain' } ],
  rest:[1.4, 1.2, 1.0], tell:.8, open:[1.8, 2.2, 2.6],
  volley:{ n:[3, 5, 5], spread:.5, speed:[300, 340, 360], dmg:14, every:[3.2, 2.6, 2.2] },
  pulse:{ every:4.6, tell:.9, r:110, dmg:18, from:1 },
};
const CHECKPOINTS = [ { id:'road', x:400 }, { id:'chain', x:2000 }, { id:'line', x:4800 }, { id:'hall', x:HALL.x1 - 150 } ];
function groundAt(x){ for(const g of GROUND) if(x >= g[0] && x < g[1]) return 0; return null; }
function chainTears(){
  const out = [];
  for(let i = 0; i < CHAIN.n; i++){
    const ax = CHAIN.x0 + i * (CHAIN.len + CHAIN.gap), ay = CHAIN.y0 - i * CHAIN.drop;
    out.push({ ax, ay, bx:ax + CHAIN.len, by:ay, phase:-(i * CHAIN.lag) });
  }
  return out;
}
const CUES = Object.freeze({
  tearer:Object.freeze({ id:'fractured-tearer', src:'./audio/music/fractured-heat-of-battle.mp3', title:'Heat of Battle (fractured)',
    artist:'Bladefall score', mood:'the Tearer: ride through what cannot be cut' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function buildLevel(){
  const objects = [];
  GROUND.forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'citadel' })));
  objects.push(Seam(ROAD_TEAR.ax, ROAD_TEAR.ay, ROAD_TEAR.bx, ROAD_TEAR.by, { ftyTear:'road' }));
  STEPS.forEach(([x, w, y]) => objects.push(Object.assign(Pl(x, w, y), { actArt:'ledge' })));
  chainTears().forEach((t, i) => objects.push(Seam(t.ax, t.ay, t.bx, t.by,
    { period:CHAIN.period, upT:CHAIN.upT, phase:((t.phase % CHAIN.period) + CHAIN.period) % CHAIN.period, ftyTear:'chain-' + i })));
  // The Spent Line.
  objects.push(Object.assign(SlateWall(FACE.x, FACE.top, FACE.top - FACE.bottom), { w:FACE.w, actArt:'face' }));
  objects.push(Seam(LINE_TEAR.ax, LINE_TEAR.ay, LINE_TEAR.bx, LINE_TEAR.by, { ftyTear:'line' }));
  // The teeth are drawn; touching them is a fall (walked across, they would only cost wounds).
  for(let x = BED.x0 + 50; x < BED.x1; x += 100) objects.push(Object.assign(Sp(x, 0, { w:100, period:1, upT:1, dmg:0 }), { decorative:1, actArt:'teeth' }));
  // The hall.
  PERCH_STEPS.forEach(s => objects.push(Object.assign(Pl(s.x, s.w, s.y), { actArt:'ledge' })));
  PERCHES.forEach(s => objects.push(Object.assign(Pl(s.x, s.w, s.y), { actArt:'ledge' })));
  objects.push({ type:'wall', x:HALL.x1, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'hall-west', gone:true });
  objects.push({ type:'wall', x:HALL.x2, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'hall-east', gone:false });
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:300, y:0, w:40, h:20, restSiteAnchor:'tear-ash' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'crownguard', x:600, patrol:[480, 760], noDrop:true, frontShield:true },
      { t:'voidbat', x:2150, y:360, patrol:[1980, 2380], noDrop:true },
      { t:'rifthound', x:5000, patrol:[4800, 5140], noDrop:true },
      { t:'crownguard', x:7550, patrol:[7420, 7700], noDrop:true },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    phase:done(c, 'fty-tear-2') ? 2 : done(c, 'fty-tear-1') ? 1 : 0, torn:done(c, 'fty-tearer'), marks:0,
    fight:false, introduced:done(c, 'fty-met'), over:false, pulses:[], tears:[], volleyT:0, pulseT:0 };
  const A = G.actTwo;
  // The Citadel's kit: everything through the gravity flip. Nothing waits here.
  F.setKit(['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement',
    'companion-command', 'downward-strike', 'gravity-flip']);
  setBars('hall-east', A.torn);
}
function firstFrame(A){ F.muster(); spawnTearer(A); }
function spawnTearer(A){
  const e = spawnEnemy('grunt', (HALL.x1 + HALL.x2) / 2);
  // kind 'fly': it hovers, and nothing turns it over.
  Object.assign(e, { actFoe:'tearer', kind:'fly', x:(HALL.x1 + HALL.x2) / 2, y:TEARER.y.low, baseY:TEARER.y.low, w:TEARER.w, h:TEARER.h,
    st:'wait', t:0, face:-1, tx:(HALL.x1 + HALL.x2) / 2, ty:TEARER.y.low, frontShield:false, portalGate:'tearer-never', active:true,
    noDrop:true, boss:false, maxHp:9999, hp:9999, noticeRange:1 });
  if(A.torn) Object.assign(e,{st:'down',y:0,baseY:0});
  A.tearer = e;
}
function setBars(id, open){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === open) return; b.gone = open; b.moveT = 0.5;
}
function harm(p, dir, dmg){
  if(p.dead || p.invuln > 0 || p.dodgeTimer > 0 || p.seamRide) return;
  try{ hurtPlayer(dmg, dir, true); }catch(_e){}
}

/* ── THE TEARER ───────────────────────────────────────────────────────────── */
/* Its tear, placed through its own body, opened after a tell. How you reach the near mouth is the act:
   from the floor (I), from the perch nearer you (II), or off a first tear, in the air (III). */
function openTear(A, e, p){
  closeTears(A);
  const ph = TEARER.phases[A.phase], dir = p.x < e.x ? 1 : -1;     // the tear runs from your side through it
  const cy = e.y + e.h / 2, tears = [];
  if(ph.how === 'floor'){
    const nx = e.x - dir * 300;
    tears.push(Seam(nx, 30, e.x + dir * 260, cy + (cy - 30) * 260 / 300, { ftyHeart:1 }));
  } else if(ph.how === 'perch'){
    const perch = PERCHES.slice().sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
    const d = Math.sign(e.x - perch.x) || 1, nx = perch.x + d * (perch.w / 2 + 10);
    tears.push(Seam(nx, perch.y + 20, e.x + d * 260, cy, { ftyHeart:1 }));
  } else {
    // The first tear lifts you off the floor, and is spent (or its own top end would take the dash back);
    // the second begins 100 on, in the air, and runs through it.
    const nx = e.x - dir * 620, top = e.x - dir * 430;
    tears.push(Seam(nx, 30, top, cy - 10, { ftyLift:1, once:true }));
    tears.push(Seam(top + dir * 100, cy, e.x + dir * 260, cy, { ftyHeart:1 }));
  }
  for(const t of tears){ Object.assign(t, { spent:true, actArt:'tear', ftyDyn:1 }); G.obstacles.push(t); A.tears.push(t); }
}
function closeTears(A){ for(const t of A.tears){ t.gone = true; t.spent = true; } G.obstacles = G.obstacles.filter(o => !(o.ftyDyn && o.gone)); A.tears = []; }
function volley(A, e, p){
  const V = TEARER.volley, n = V.n[A.phase], sx = e.x, sy = e.y + e.h / 2;
  const base = Math.atan2((p.y + 22) - sy, p.x - sx);
  for(let i = 0; i < n; i++){
    const a = base + (n > 1 ? (i / (n - 1) - .5) * V.spread : 0), sp = V.speed[A.phase];
    G.projectiles.push({ owner:'enemy', ftyBolt:1, sourceType:'tearer', x:sx, y:sy, vx:Math.cos(a) * sp, vy:Math.sin(a) * sp,
      gravity:0, size:9, color:'#c47bff', shape:'orb', glow:1, dmg:V.dmg, kb:200, pierce:0, el:'void', life:4, hitSet:[], portalHops:0 });
  }
  e.flash = .25;
}
function pulses(A, p, dt){
  for(const q of A.pulses){
    q.t += dt;
    if(!q.hit && q.t >= TEARER.pulse.tell){
      q.hit = true;
      if(!p.dead && Math.abs(p.x - q.x) < TEARER.pulse.r && p.onGround) harm(p, Math.sign(p.x - q.x) || 1, TEARER.pulse.dmg);
      kit.burst(q.x, 10, '#c47bff', 14);
    }
  }
  A.pulses = A.pulses.filter(q => q.t < TEARER.pulse.tell + .35);
}
function updateTearer(A, e, p, dt){
  if(p.dead || e.dead) return;
  e.t += dt; e.hp = 9999;
  e.burnT = e.poisonT = e.bleedT = e.freezeT = e.floatT = e.counterStunT = 0;
  e.flash = Math.max(0, (e.flash || 0) - dt); e.shake = Math.max(0, (e.shake || 0) - dt);
  const ph = TEARER.phases[A.phase];
  // It glides only while it rests; while its tear is open it holds still.
  if(e.st === 'rest' || e.st === 'wait'){
    e.x += Math.sign(e.tx - e.x) * Math.min(Math.abs(e.tx - e.x), TEARER.glide * dt);
    e.y += Math.sign(e.ty - e.y) * Math.min(Math.abs(e.ty - e.y), TEARER.glide * dt);
  }
  e.baseY = e.y;
  // Ridden through: the blow. Once a tear.
  const r = p.seamRide;
  if(r && r.o.ftyHeart && !r.o.ftyStruck && Math.abs(p.x - e.x) < e.w / 2 + 10 && Math.abs((p.y + 22) - (e.y + e.h / 2)) < e.h / 2 + 20){
    r.o.ftyStruck = true; mark(A, e, p);
  }
  if(A.fight && e.st !== 'down'){
    A.volleyT += dt;
    if(A.volleyT >= TEARER.volley.every[A.phase] && e.st !== 'open'){ A.volleyT = 0; volley(A, e, p); }
    if(A.phase >= TEARER.pulse.from){ A.pulseT += dt; if(A.pulseT >= TEARER.pulse.every){ A.pulseT = 0; A.pulses.push({ x:p.x, t:0 }); } }
  }
  switch(e.st){
    case 'wait':
      if(p.x > HALL.x1 + 80 && p.x < HALL.x2 && !p.dead){
        e.st = 'rest'; e.t = 0; A.fight = true; setBars('hall-west', false); A.volleyT = 0; A.pulseT = 0;
        if(!A.introduced){ A.introduced = true; kit.latch(ZONE, 'fty-met');
          A.queue.push({ src:e, accent:'#c47bff', html:'<b>THE TEARER</b><br>What the Tyrant left of himself when he stopped travelling: a knot where a room was torn open too often. Steel goes through it and finds nothing. A tear would not.' }); }
      }
      break;
    case 'rest':
      if(e.t >= TEARER.rest[A.phase]){
        // It settles where its next tear can reach you, and tears.
        e.ty = ph.how === 'floor' ? TEARER.y.low + 40 : TEARER.y.high;
        if(Math.abs(e.y - e.ty) < 4 && Math.abs(e.x - e.tx) < 4){ e.st = 'tell'; e.t = 0; openTear(A, e, p); }
      }
      break;
    case 'tell':
      if(e.t >= TEARER.tell){ for(const t of A.tears) t.spent = false; e.st = 'open'; e.t = 0; }
      break;
    case 'open': {
      const struck = A.tears.some(t => t.ftyStruck);
      if(e.t >= TEARER.open[A.phase] || (struck && !p.seamRide)){
        closeTears(A); e.st = 'rest'; e.t = 0;
        // It moves on, away from where you are.
        const span = [HALL.x1 + 260, HALL.x2 - 260];
        e.tx = p.x < (HALL.x1 + HALL.x2) / 2 ? span[1] - Math.random() * 300 : span[0] + Math.random() * 300;
        e.ty = TEARER.y.low + 120;
      }
      break;
    }
    case 'down': break;
  }
  e.x = Math.max(HALL.x1 + 120, Math.min(HALL.x2 - 120, e.x));
  e.portalGate = 'tearer-never';
}
function mark(A, e, p){
  A.marks++; A.flash = .4; e.shake = .8; kit.burst(e.x, e.y + e.h / 2, '#f1d6ff', 22);
  try{ if(meta.soundOn) SFX.hit(); }catch(_e){}
  if(A.marks >= TEARER.phases[A.phase].marks){
    A.marks = 0;
    if(A.phase < TEARER.phases.length - 1){ kit.latch(ZONE, 'fty-tear-' + (A.phase + 1)); A.phase++; }
    else {
      e.st = 'down'; A.torn = true; A.fight = false; A.pulses = []; kit.latch(ZONE, 'fty-tearer'); F.clear(STAGE);
      for(const pr of G.projectiles) if(pr.ftyBolt) pr.life = 0;
      setBars('hall-east', true); setBars('hall-west', true);
      A.queue.push({ src:e, accent:'#c47bff', html:'<b>THE TEARER</b><br>The last tear goes through it and does not close behind you. For a moment the room is a room.' });
      try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
    }
  }
}
function resetTearer(A){
  const e = A.tearer; if(!e) return;
  A.fight = false; A.marks = 0; A.pulses = []; A.queue = []; A.volleyT = A.pulseT = 0; closeTears(A); e.st = 'wait'; e.t = 0; e.tx = (HALL.x1 + HALL.x2) / 2; e.ty = TEARER.y.low;
  for(const pr of G.projectiles) if(pr.ftyBolt) pr.life = 0;
  setBars('hall-west', true);
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  pulses(A, p, dt);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  if(A.fight && (p.dead || p.x < HALL.x1 - 20)) resetTearer(A);
  if(!p.dead && !p.seamRide && p.y < 12 && p.x > BED.x0 + 6 && p.x < BED.x1 - 6){ try{ hurtPlayer(0, 1, false); }catch(_e){} }
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && A.torn && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('THE FRACTURED TYRANT · BEHIND YOU', 'THE FRACTURED KING', 'Act Three · the next echo',
      'Behind you the Citadel is only a building. Ahead, the Throne, where the King waits for an answer the Echo already gave him.', false); }
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'tearer') return updateTearer(A, e, p, dt);
}
function lateUpdate(){}
function interact(){ return false; }
function swing(){}
function voidFloor(){ return -160; }
function cameraFloor(p){ if(!p) return null; return Math.max(-160, Math.min(0, p.y - 40)); }
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 400) return { connector:'fi-ft', zone:ZONE, targetStage:32, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.torn ? F.seamOn(STAGE, ZONE, 'ft-fk', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'ft-fk' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.fight ? CUES.tearer : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedTyrant = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, chainTears, constants:Object.freeze({ LEN, SPAWN, GROUND, ROAD_TEAR, STEPS, CHAIN, FACE, LINE_TEAR, BED, HALL,
    PERCHES, PERCH_STEPS, TEARER, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
