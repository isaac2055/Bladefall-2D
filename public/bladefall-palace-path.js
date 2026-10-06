/* Bladefall — ACT TWO · STAGE 19 · THE PATH TO THE PALACE (2026-09-24).

   Out of the Colony and up. Dawn becomes sunrise as you climb, and the symptom is painful
   light: the Sunspire's great mirrors throw the sun down the mountain road, and here the
   light does not call a bell — it burns. Walked west to east and up: the smoke line
   (0 → 220), the mirror stair (330 → 770), the Hydra Overlook (a chasm over the sea, crossed
   on the Chainhook), the Sun Gate's apron (770).

     THE SMOKE LINE — where the colony's smoke gives out. The first mirror sweeps the road;
       the last of the smoke and the pilgrims' shelters are the only shade.
     THE MIRROR STAIR — a stair of shelves up the mountain under two more mirrors. Shelter to
       shelter, when the light is away.
     THE HYDRA OVERLOOK — the road is broken; old signal masts stand out of the drop, and far
       below, in the sea, the beast you set free is circling. Three rings across.
     THE SUN GATE — hung on chains and a counterweight. Alone, you slam its windlass round
       three times under the Sunguard's shield. With the colony, Oren breaks its chains.

   THE CHOICE, CARRIED UP. The colony turned (`colony:'turned'`): Oren and the sick walk with
   you, they hold canvas over you when a mirror finds you, and at the gate they take hold of
   the Sunguard while Oren works. Allies change fights, never routes: every mirror and the
   gate have their solo answer. The forsaken path (`forsaken`): the sick come up the road
   behind you and fight for the King — they do not hesitate, and no bell has to drive them. */
(function installPalacePath(root){
'use strict';
const A2 = root.BladefallActTwo;
if(!A2 || !A2.register) return;
const kit = A2.kit, F = kit.foes;

const STAGE = 19, ZONE = 'palace-path', BACK = 18;

/* ── Geometry (world units; y up) ─────────────────────────────────────────── */
const LEN = 10400;
const CHASM = { x1:5600, x2:6900 };
const STEPS = [
  { x1:0, x2:900, y:0 }, { x1:900, x2:1700, y:110 }, { x1:1700, x2:2600, y:220 },                 // the smoke line
  { x1:2600, x2:3100, y:330 }, { x1:3100, x2:3600, y:440 }, { x1:3600, x2:4100, y:550 },
  { x1:4100, x2:4600, y:660 }, { x1:4600, x2:CHASM.x1, y:770 },                                    // the mirror stair
  { x1:CHASM.x2, x2:LEN, y:770 },                                                                   // the Sun Gate's apron
];
function groundAt(x){ if(x >= CHASM.x1 && x < CHASM.x2) return null; for(const s of STEPS) if(x < s.x2) return s.y; return 770; }
const SPAWN = { x:150, y:0 };
/* The Sunspire's mirrors: each throws a burning pool that sweeps its span. */
const MIRRORS = [
  { id:'m1', x:1850, base:220, h:420, sweep:[980, 2560], period:8,   phase:0 },
  { id:'m2', x:3350, base:440, h:420, sweep:[2660, 4060], period:7.5, phase:1.5 },
  { id:'m3', x:4850, base:770, h:380, sweep:[4160, 5560], period:7,   phase:3 },
  { id:'m4', x:8300, base:770, h:420, sweep:[7200, 8700], period:8,   phase:0.5, shutter:true },   // the approach; the gate fight stands clear of it
];
const POOL = 50;
const SHUTTER = Object.freeze({ period:5.4, open:2.8, warning:0.65 });
/* Pilgrims' shelters: a roof on two posts. Under one, no mirror reaches you. */
const SHELTERS = [
  { x1:340, x2:480, rest:true }, { x1:1100, x2:1240 }, { x1:1500, x2:1640 }, { x1:2000, x2:2140 }, { x1:2380, x2:2520 },
  { x1:2800, x2:2940 }, { x1:3200, x2:3340 }, { x1:3650, x2:3790 }, { x1:3950, x2:4080 },
  { x1:4240, x2:4380 }, { x1:4700, x2:4840 }, { x1:5080, x2:5220 }, { x1:5420, x2:5560 },
  { x1:7520, x2:7660 }, { x1:8000, x2:8140 }, { x1:8420, x2:8560 },
];
/* The colony's smoke rises up the slope and gives out at the smoke line. */
const VENTS = [ { x:420, phase:0 }, { x:1150, phase:2.4 }, { x:1900, phase:4.6 } ];
const SMOKE = Object.freeze({ period:7, grow:2.4, hold:3.2, fade:1.8, r0:40, r1:190, drift:34, rise:16, cover:0.72 });
const RINGS = [ { id:'o1', x:5850, y:1000 }, { id:'o2', x:6250, y:1050 }, { id:'o3', x:6650, y:1000 } ];
const GATE_X = 9600, WINDLASS_X = 9250, ANCHORS = [9440, 9530], FRONTIER_X = 10300;
const CUES = Object.freeze({
  gate:Object.freeze({ id:'path-last-spark', src:'./audio/music/the-last-spark-of-darrow.mp3', title:'The Last Spark of Darrow',
    artist:'Aerth score', mood:'storming the Sun Gate' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildPathLevel()); }
function buildPathLevel(){
  const face = (x, top, h, extra) => Object.assign({ type:'wall', x, y:top, h, w:26, slickL:1, slickR:1, noCling:1, actArt:'face' }, extra || {});
  const ring = (r) => ({ type:'actRing', actId:'ring-' + r.id, x:r.x, y:r.y, w:30, h:30, pathRing:1 });
  const objects = [];
  STEPS.forEach((s, i) => {
    objects.push(Object.assign(GrAt(s.x1, s.x2, s.y), { actArt:i < 3 ? 'road' : i < 8 ? 'stair' : 'apron' }));
    const prev = STEPS[i - 1];
    if(prev && prev.x2 === s.x1 && s.y > prev.y) objects.push(face(s.x1, s.y, s.y - prev.y));
  });
  objects.push(face(CHASM.x2, 770, 770 + 400));                           // the far lip of the chasm
  SHELTERS.forEach((s, i) => objects.push(Object.assign({ type:'actShelter', actId:'shelter-' + i, x:(s.x1 + s.x2) / 2, y:groundAt(s.x1), w:s.x2 - s.x1, h:130 },
    s.rest ? { restSiteAnchor:'pilgrims-shelter' } : {})));
  VENTS.forEach((v, i) => objects.push({ type:'actVent', actId:'vent-' + i, x:v.x, y:groundAt(v.x), w:40, h:20 }));
  MIRRORS.forEach(m => objects.push({ type:'actMirror', actId:'mirror-' + m.id, x:m.x, y:m.base, w:80, h:m.h, mirror:m.id }));
  objects.push({ type:'actOverlook', x:(CHASM.x1 + CHASM.x2) / 2, y:0, w:CHASM.x2 - CHASM.x1 + 600, h:1200 });
  // Act Three: a ledge below the lip, out of the road. Drop to it for the rift shard; the first ring
  // (336 from it) takes you back up. It is 1,100 short of the far lip: no stepping stone across.
  objects.push(Object.assign(Pl(5740, 120, 660), { actArt:'road', riftLedge:1 }));
  RINGS.forEach(r => objects.push({ type:'actMast', x:r.x, y:-300, w:30, h:r.y + 300 }, ring(r)));
  objects.push({ type:'actSunGate', x:GATE_X, y:770, w:260, h:540 });
  objects.push(face(GATE_X, 770 + 540, 540, { actBars:'sun-gate', actArt:'bars', gone:false }));
  objects.push({ type:'actWindlass', actId:'windlass', x:WINDLASS_X, y:770, w:60, h:60 });
  ANCHORS.forEach((x, i) => objects.push({ type:'actAnchor', actId:'anchor-' + i, x, y:770, w:30, h:30 }));
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[], enemies:[],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function allied(P){ return P.oren === 'helped' && P.colony === 'turned'; }
function init(){
  const c = kit.zoneCircuits(ZONE), P = kit.path();
  const A = G.actTwo = {
    stage:STAGE, t:0, spawned:false, flash:0, stingerT:0, tolls:[], fallen:[], queue:[], glare:0,
    mirrors:MIRRORS.map(m => ({ id:m.id, x:m.x, my:m.base + m.h + 24, gx:m.sweep[0], gy:groundAt(m.sweep[0]) || 770, hitT:0, canopy:0 })),
    smoke:[], ventT:VENTS.map(v => v.phase), burnT:0,
    enc:{ ambush:{ id:'ambush', st:done(c, 'path-ambush') ? 'done' : 'idle', foes:[], silenced:false, t:0 },
          gate:{ id:'gate', st:done(c, 'path-gate') ? 'done' : 'idle', foes:[], silenced:false, tollT:1, t:0 } },
    gateLift:done(c, 'path-gate') ? 3 : [1,2,3].filter(i => done(c, 'path-windlass-' + i)).length,
    gateOpen:done(c, 'path-gate'), anchors:ANCHORS.map((_, i) => done(c, 'path-anchor-' + i)), windlassT:0,
    oren:{ x:G.p.x - 60, y:G.p.y, st:P.oren === 'helped' ? 'follow' : 'absent', t:0, face:1, vx:0, cured:!!P.orenKnown, target:null, hit:0 },
    allies:allied(P) ? [0, 1, 2].map(i => ({ x:G.p.x - 120 - i * 50, y:G.p.y, i, st:'follow', face:1, vx:0, grab:null, cd:1 + i })) : [],
    frontier:false, checkpoints:{},
  };
  const gate = G.obstacles.find(o => o.actBars === 'sun-gate'); if(gate){ gate.gone = A.gateOpen; gate.lift = A.gateOpen ? 1 : A.gateLift / 3; }
  for(const m of A.mirrors) aim(m, MIRRORS.find(q => q.id === m.id), 0);
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  if(A.stingerT > 0) A.stingerT = Math.max(0, A.stingerT - dt);
  for(const o of G.obstacles) if(o.moveT > 0) o.moveT = Math.max(0, o.moveT - dt);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  updateSmoke(A, dt);
  updateAllies(A, dt, p);
  updateMirrors(A, dt, p);
  updateAmbush(A, dt, p);
  updateGate(A, dt, p);
  updateOren(A, dt, p);
  F.updateFallen(A, dt);
  updateCheckpoints(A, p);
  A.tolls = A.tolls.filter(t => (t.t += dt) < 1.2);
  // The higher the road, the more the light hurts to look at.
  A.glare = Math.min(1, Math.max(0, (p.y - 100) / 800));
  if(!A.frontier && p.x > FRONTIER_X && A.gateOpen && !p.dead && !A2.handles(STAGE + 1)) reachPalace(A);
}
function lateUpdate(){}
function firstFrame(A){
  const G2 = A.enc.gate;
  if(G2.st !== 'done'){
    // One Sunguard holds the windlass: it turns inside his reach. Behind him is room to fight
    // his back (230 to the bars) and nobody else to close it.
    G2.guards = [
      F.spawnSunguard(G2, { x:WINDLASS_X + 120, y:770, x1:8600, x2:GATE_X - 40, enc:'gate', face:-1, st:'post', bell:'none' }),
    ];
    G2.guards[0].holdPost = true;
  }
}

/* ── The mirrors: light that burns ─────────────────────────────────────────── */
function aim(m, M, t){
  const k = 0.5 - 0.5 * Math.cos((t + M.phase) / M.period * Math.PI * 2);
  m.gx = M.sweep[0] + (M.sweep[1] - M.sweep[0]) * k; const g = groundAt(m.gx); m.gy = g == null ? 770 : g;
}
function mirrorPower(M, t){
  if(!M.shutter) return { open:true, warning:false };
  const cycle = ((t + M.phase) % SHUTTER.period + SHUTTER.period) % SHUTTER.period;
  return { open:cycle < SHUTTER.open, warning:cycle >= SHUTTER.period - SHUTTER.warning };
}
function canopyFor(A, p){
  return A.allies.find(a => a.st === 'cover' && Math.abs(a.x-p.x)<95 && Math.abs(a.y-p.y)<60) || null;
}
function underShelter(p){ const g = groundAt(p.x); return g != null && SHELTERS.some(s => p.x > s.x1 + 8 && p.x < s.x2 - 8 && Math.abs(groundAt(s.x1) - g) < 1 && p.y < g + 90); }
function inSmoke(A, x, y){ return A.smoke.some(s => s.d > 0.45 && Math.hypot(x - s.x, y - s.y) < s.r * SMOKE.cover); }
function inLight(m, p){
  if(p.dead) return false;
  const inTri = (x, y) => {
    const ax = m.x, ay = m.my, bx = m.gx - POOL, by = m.gy, cx = m.gx + POOL, cy = m.gy;
    const d1 = (x - bx) * (ay - by) - (ax - bx) * (y - by), d2 = (x - cx) * (by - cy) - (bx - cx) * (y - cy), d3 = (x - ax) * (cy - ay) - (cx - ax) * (y - ay);
    return !(((d1 < 0) || (d2 < 0) || (d3 < 0)) && ((d1 > 0) || (d2 > 0) || (d3 > 0)));
  };
  return inTri(p.x, p.y + 20) || inTri(p.x, p.y + 40) || (Math.abs(p.x - m.gx) < POOL && p.y < m.gy + 30 && p.y >= m.gy - 5);
}
function updateMirrors(A, dt, p){
  if(A.burnT > 0) A.burnT -= dt;
  A.mirrors.forEach((m, i) => {
    aim(m, MIRRORS[i], A.t);
    const power = mirrorPower(MIRRORS[i], A.t);
    m.shut = !power.open; m.warning = power.warning;
    const lit = power.open && inLight(m, p), carrier = canopyFor(A, p);
    m.canopy = lit && carrier ? Math.min(1, m.canopy + dt * 5) : Math.max(0, m.canopy - dt * 2);
    if(!lit || A.burnT > 0 || carrier) return;
    if(underShelter(p) || inSmoke(A, p.x, p.y + 24)) return;
    // THE LIGHT BURNS. One measure, a flinch, and a moment before it can burn again.
    A.burnT = 1.2; p.dodgeTimer = 0;
    hurtPlayer(12, Math.sign(p.x - m.x) || 1, true);
    A.flash = Math.max(A.flash, 0.35);
    kit.burst(p.x, p.y + 30, '#ffe3a0', 12);
  });
}
function updateSmoke(A, dt){
  VENTS.forEach((v, i) => {
    A.ventT[i] += dt;
    if(A.ventT[i] >= SMOKE.period){ A.ventT[i] -= SMOKE.period; A.smoke.push({ x:v.x, y:(groundAt(v.x) || 0) + 30, t:0, r:SMOKE.r0, d:0 }); }
  });
  for(const s of A.smoke){
    s.t += dt; s.x += SMOKE.drift * dt; s.y += SMOKE.rise * dt;
    s.r = SMOKE.r0 + (SMOKE.r1 - SMOKE.r0) * Math.min(1, s.t / SMOKE.grow);
    s.d = s.t < SMOKE.grow + SMOKE.hold ? Math.min(1, s.t / 0.6) : Math.max(0, 1 - (s.t - SMOKE.grow - SMOKE.hold) / SMOKE.fade);
  }
  A.smoke = A.smoke.filter(s => s.d > 0 || s.t < 1);
}

/* ── The forsaken road: the sick come up behind you, and fight for him ─────── */
function updateAmbush(A, dt, p){
  const S = A.enc.ambush, P = kit.path();
  if(S.st === 'done') return;
  F.recordFallen(A, S, p);
  if(S.st === 'idle'){
    if(!P.forsaken || p.x < 1300 || p.dead) return;
    S.st = 'live'; S.t = 0;
    // Far behind, down in the colony, a bell. They come up the road with their cups dropped.
    A.tolls.push({ x:Math.max(40, p.x - 700), y:(groundAt(p.x) || 0) + 200, t:0, far:true });
    for(let i = 0; i < 3; i++){
      const x = Math.max(60, p.x - 620 - i * 70);
      const e = F.spawnBelled(S, { x, y:groundAt(x) || 0, x1:40, x2:2560, enc:'ambush', slot:i, st:'arrive' });
      zealot(e);
    }
    return;
  }
  if(!S.foes.some(e => !e.dead)){ S.st = 'done'; kit.latch(ZONE, 'path-ambush'); }
}
function zealot(e){ e.zealot = true; e.terraced = true; e.speed *= 1.3; e.xp = 8; return e; }

/* ── The Sun Gate ──────────────────────────────────────────────────────────── */
function updateGate(A, dt, p){
  const S = A.enc.gate, P = kit.path();
  if(S.st === 'done') return;
  F.recordFallen(A, S, p);
  if(S.st === 'idle'){
    if(p.x > 8300 && Math.abs(p.y - 770) < 60 && !p.dead){
      S.st = 'live'; S.t = 0;
      if(P.forsaken) for(let i = 0; i < 3; i++){
        const x = 7300 - i * 80, e = F.spawnBelled(S, { x, y:770, x1:7100, x2:GATE_X - 40, enc:'gate', slot:i, st:'arrive' });
        zealot(e); e.terraced = false;
      }
    }
    return;
  }
  S.t += dt;
  // ALONE: the counterweight. Come down hard on the windlass and it turns a third of the way.
  if(!A.gateOpen && A.windlassT <= 0 && p.slamming && p.vy > 0 && Math.abs(p.x - WINDLASS_X) < 45 && p.y >= 766 && p.y - 770 < 120){
    A.gateLift++; kit.latch(ZONE, 'path-windlass-' + A.gateLift); A.windlassT = 0.6; p.slamming = false; p.vy = -340;
    G.shake = Math.max(G.shake || 0, 5); kit.burst(WINDLASS_X, 800, '#d8b25a', 14); if(meta.soundOn) SFX.hit();
    liftGate(A, A.gateLift / 3);
  }
  if(A.windlassT > 0) A.windlassT -= dt;
  // WITH THE COLONY: Oren breaks the chains it hangs on.
  if(!A.gateOpen && A.anchors.every(Boolean)) openGate(A, 'chains');
  if(!A.gateOpen && A.gateLift >= 3) openGate(A, 'windlass');
}
function liftGate(A, k){
  const bars = G.obstacles.find(o => o.actBars === 'sun-gate'); if(!bars) return;
  bars.lift = Math.min(1, k); bars.moveT = 0.4;
}
function openGate(A, how){
  A.gateOpen = true; liftGate(A, 1);
  const bars = G.obstacles.find(o => o.actBars === 'sun-gate'); if(bars){ bars.gone = true; bars.moveT = 0.5; }
  G.shake = Math.max(G.shake || 0, how === 'chains' ? 10 : 7); A.flash = Math.max(A.flash, 0.5);
  if(meta.soundOn) SFX.land();
  const S = A.enc.gate;
  // The gate is down: the Sunguard fall back to the palace; the sick who fought for them stop.
  for(const e of S.foes) if(!e.dead){
    if(e.actFoe === 'sunguard'){ e.st = 'flee'; e.t = 0; e.fleeX = LEN; }
    else { e.st = 'flee'; e.t = 0; e.fleeX = 7000; }
  }
  S.st = 'done'; kit.latch(ZONE, 'path-gate');
  try{ activateRuntimeCheckpoint(ZONE + ':gate', { x:GATE_X + 200, y:770 }, 'checkpoint', null, true); }catch(_e){}
  try{ captureCurrentZonePersistence(); if(!G.levelSelectMode) persist(); }catch(_e){}
  if(how === 'chains') A.queue.push({ src:A.oren, accent:'#d59a68', html:'<b>OREN</b><br>The second chain snaps. The counterweight drops, hauling the gate clear. “He always did build things to be opened from the inside.”' });
}

/* ── Oren and the colony, if they came up with you ─────────────────────────── */
function updateOren(A, dt, p){
  const O = A.oren; if(O.st === 'absent') return;
  O.t += dt; if(O.hit > 0) O.hit = Math.max(0, O.hit - dt);
  const S = A.enc.gate;
  if(S.st === 'live' && !A.gateOpen){
    const i = A.anchors.findIndex(a => !a);
    if(i >= 0){
      const ax = ANCHORS[i];
      if(p.dead || Math.abs(p.x-ax)>420){ O.st='follow'; O.t=0; kit.follow(O,p,dt); snapToGround(O); return; }
      if(Math.abs(p.x - O.x) > 900 && Math.abs(ax - O.x) > 900){ O.x = p.x - (p.face || 1) * 50; O.y = 770; }   // never left behind
      const dx = ax - O.x;
      if(Math.abs(dx) > 20){ O.st = 'break'; O.vx = Math.sign(dx) * 200; O.x += O.vx * dt; O.face = Math.sign(dx); O.t = 0; O.y = 770; return; }
      O.st = 'break'; O.vx = 0; O.face = 1;
      if(Math.floor(O.t / 0.5) > Math.floor((O.t - dt) / 0.5)){ O.hit = 0.2; kit.burst(ax, 800, '#cfd6da', 6); if(meta.soundOn) SFX.hit(); }
      if(O.t > 2){ A.anchors[i] = true; kit.latch(ZONE, 'path-anchor-' + i); O.t = 0; kit.burst(ax, 820, '#d8b25a', 16); G.shake = Math.max(G.shake || 0, 4); }
      return;
    }
  }
  O.st = 'follow';
  kit.follow(O, p, dt); snapToGround(O);
}
function snapToGround(o){ const g = groundAt(o.x); if(g != null) o.y = g; }
function updateAllies(A, dt, p){
  const S = A.enc.gate;
  for(const a of A.allies){
    a.cd -= dt;
    // Wait at the nearest bank while the knight hooks across; regroup on solid ground.
    if(groundAt(p.x) == null){
      a.x = a.x < (CHASM.x1+CHASM.x2)/2 ? CHASM.x1-90-a.i*35 : CHASM.x2+90+a.i*35;
      a.y=770; a.vx=0; a.st='wait'; continue;
    }
    // At the gate they take hold of the Sunguard, one at a time, so his shield is turned away.
    if(S.st === 'live' && !A.gateOpen){
      if(!a.grab || a.grab.dead){ a.grab = S.foes.find(e => e.actFoe === 'sunguard' && !e.dead && e.st !== 'flee' && !A.allies.some(b => b !== a && b.grab === e)) || null; }
      const e = a.grab;
      if(e){
        const side = Math.sign(e.x - p.x) || 1, tx = e.x + side * 30, dx = tx - a.x;
        if(Math.abs(dx) > 16){ a.vx = Math.sign(dx) * 210; a.x += a.vx * dt; a.face = Math.sign(dx); a.st = 'run'; }
        else { a.vx = 0; a.st = 'grab'; a.face = -side;
          if(a.cd <= 0){ a.cd = 3; e.counterStunT = Math.max(e.counterStunT || 0, 1.3); e.shieldFace = side; e._turnT = 0; kit.burst(e.x, 800, '#e9e2cf', 6); } }
        a.y = 770; continue;
      }
    }
    a.st = a.i === 0 && p.x < 9000 ? 'cover' : 'follow';
    const want = p.x - (p.face || 1) * (a.st === 'cover' ? 30 : 110 + a.i * 45), dx = want - a.x;
    if(Math.abs(p.x - a.x) > 700){ a.x = want; a.vx = 0; }
    else if(Math.abs(dx) > 18){ a.vx = Math.sign(dx) * Math.min(280, Math.abs(dx) * 5); a.x += a.vx * dt; a.face = Math.sign(dx); }
    else a.vx = 0;
    snapToGround(a);
    if(groundAt(a.x) == null){ a.x = p.x - (p.face || 1) * 60; snapToGround(a); }
  }
}

/* ── Up targets ─────────────────────────────────────────────────────────────── */
function interact(){ return false; }
function swing(){}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  const S = A.enc[e.enc]; if(!S) return;
  if(e.terraced){ const g = groundAt(e.x); if(g != null) e.floorY = g; }
  F.update(e, p, dt, A, S);
}

/* ── Leaving: the road on to the palace ─────────────────────────────────────── */
function reachPalace(A){
  A.frontier = true;
  try{ commitStageCompletion(); }catch(_e){}
  try{ recordWorldClear(); }catch(_e){}
  try{ recordSessionClear(STAGE); }catch(_e){}
  const P = kit.path();
  const line = allied(P) ? 'Oren walks ahead of you through the broken gate. Behind you the sick come up the road with their cups.'
    : P.forsaken ? 'The sick who fought for him sit down in the road behind you. Above, the palace is quiet. It is waiting.'
    : 'Oren walks beside you through the gate. Above, the palace is quiet. It is waiting.';
  kit.showFrontierCard('THE PATH · BEHIND YOU', 'THE SUNSPIRE', 'Sunspire Palace', line);
}
function seamSpec(){
  const p = G.p, A = G.actTwo;
  // Through the broken gate, into the palace.
  if(p.x > LEN / 2){
    if(!A || A.stage !== STAGE || !A.gateOpen || !A2.handles(STAGE + 1)) return null;
    return { connector:'path-sunspire', zone:ZONE, targetStage:STAGE + 1, warm:p.x >= LEN - 1400, cross:p.x >= LEN - 62 && p.face > 0, forward:true, commitClear:true };
  }
  return { connector:'colony-path', zone:ZONE, targetStage:BACK, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  if(plan.connectorId === 'colony-path') return { x:SPAWN.x, y:SPAWN.y };
  if(plan.connectorId === 'path-sunspire') return { x:LEN - 160, y:770 };   // back out of the palace, inside the gate
  return null;
}
/* Over the chasm the drop is the sea: fall and you are back at the lip. */
function voidFloor(p){ return p && p.x > CHASM.x1 && p.x < CHASM.x2 ? 300 : -48; }
function cameraFloor(p){
  if(!p) return null;
  const g = groundAt(p.x);
  return g == null ? 560 : Math.min(g, Math.max(0, p.y));
}

/* ── Checkpoints ───────────────────────────────────────────────────────────── */
const CHECKPOINTS = [
  { id:'smoke-line', x:2560, y:220, when:(p) => p.x > 2480 && p.x < 2600 && Math.abs(p.y - 220) < 4 },
  { id:'lip', x:5480, y:770, when:(p) => p.x > 5400 && p.x < 5590 && Math.abs(p.y - 770) < 4 },
  { id:'far-lip', x:7000, y:770, when:(p) => p.x > 6920 && p.x < 7100 && Math.abs(p.y - 770) < 4 },
];
function updateCheckpoints(A, p){
  if(!p.onGround || p.dead) return;
  for(const c of CHECKPOINTS) if(!A.checkpoints[c.id] && c.when(p)){
    A.checkpoints[c.id] = true;
    try{ activateRuntimeCheckpoint(ZONE + ':' + c.id, { x:c.x, y:c.y }, 'checkpoint', null, true); }catch(_e){}
  }
}

function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  if(A.enc.gate.st === 'live' || A.enc.ambush.st === 'live') return CUES.gate;
  return null;
}

A2.register(STAGE, Object.freeze({
  level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue,
}));
root.BladefallPalacePath = Object.freeze({
  STAGE, ZONE, groundAt, constants:Object.freeze({ LEN, CHASM, STEPS, SPAWN, MIRRORS, POOL, SHELTERS, VENTS, SMOKE, RINGS,
    GATE_X, WINDLASS_X, ANCHORS, FRONTIER_X, SHUTTER }),
});
})(typeof window !== 'undefined' ? window : globalThis);
