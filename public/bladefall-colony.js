/* Bladefall — ACT TWO · STAGE 18 · THE COLONY (2026-09-24).

   Inside the gate the King keeps his sick. Tents on terraces down into a basin, pit fires,
   smoke, alms-bells; morning now, hazy, the golden spire up the mountain in the east and
   the King's stone conduit climbing to it, carrying the colony's spring away. Walked west
   to east and down: the gate shelf (300), two terraces (200, 100), the basin (0).

     THE TENTS — the Sunguard keep watch from towers with a gilt glass that throws the sun
       along the ground. A beam that finds you is a stroke of the bell, and conscripts come
       out of the tents at you. Smoke from the pit fires hides you, and so does a tent.
       Sneak, or fight: both are answers; the fight is the price of being seen.
     SABLE'S SPRING — Sable, the stretcher-keeper from the Causeway, never left the sick.
       The well is dry: the King's conduit took the spring, and the yard gate beside it is
       hung on the well's own counterweight. Climb the conduit (its pier rings), get past its
       Sunguard — over him, or ring the alms-bell below so he goes down to see who rang it —
       and come down hard on the King's tap. Water falls into the well, the bucket sinks, the
       gate goes up. Sable gives water by the spoon.
     THE CONSCRIPTION YARD — the conscripts are shackled to posts, each on his own length of
       chain, and a ringer on the bell tower drives them. Alone: hook up the tower behind him
       and silence him; the shackled sit down. With Oren: he is a chainwright, and he breaks
       the shackles one by one while you keep them off him — and the colony turns.

   THE CHOICE CARRIES IN (owner decisions, 2026-09-23). Taken by the hand, Oren walks with you;
   Sable's water cures you both (the grey measures turn gold: MENDED) and the bandage comes off.
   Walked past, he kneels at the gate until you leave the Colony — the gate is behind you, west,
   and you can still go back. Leave by the road east without him and that is the forsaken path
   too. Struck, he lies where he fell; Sable fills everyone's cup but yours. */
(function installColony(root){
'use strict';
const A2 = root.BladefallActTwo;
if(!A2 || !A2.register) return;
const kit = A2.kit, F = kit.foes;

const COLONY = 18, ZONE = 'colony', BACK = 17;

/* ── Geometry (world units; y up) ─────────────────────────────────────────── */
const LEN = 10800;
const TERRACES = [ { x1:0, x2:1500, y:300 }, { x1:1500, x2:2700, y:200 }, { x1:2700, x2:3800, y:100 }, { x1:3800, x2:LEN, y:0 } ];
function groundAt(x){ for(const t of TERRACES) if(x < t.x2) return t.y; return 0; }
const SPAWN = { x:150, y:300 };
/* The watch: a Sunguard on a tower turns a gilt glass, and it throws a pool of sunlight that
   sweeps the ground between `sweep[0]` and `sweep[1]`, under the tower and out either side.
   The pool is what finds you: its cone runs from the glass to `POOL` either side of it. */
const WATCH = [
  { id:'w1', x:3000, base:100, h:360, sweep:[2450, 3560], period:9,   phase:0 },
  { id:'w2', x:4600, base:0,   h:360, sweep:[4000, 5200], period:8.5, phase:2.2 },
];
const POOL = 44;
/* Pit fires breathe smoke in banks that swell, drift east and thin. */
const FIRES = [ { x:2790, phase:0 }, { x:3420, phase:3.4 }, { x:4330, phase:1.4 }, { x:4820, phase:4.8 } ];
const SMOKE = Object.freeze({ period:7, grow:2.4, hold:3.2, fade:1.8, r0:40, r1:185, drift:26, rise:10, cover:0.72 });
/* Tents: under the canopy a glass cannot see you. The seen are fought by who comes out of them. */
const TENTS = [ { x1:2440, x2:2640 }, { x1:2820, x2:2960 }, { x1:3150, x2:3350 }, { x1:4050, x2:4230 }, { x1:4410, x2:4550 }, { x1:4960, x2:5140 } ];
const TENT_H = 112;
const SCREENS = [{x:2760,r:60},{x:4780,r:95}];
const ALMS_BELL = { x:5680, y:0 };
const CONDUIT = { x1:6000, x2:7400, y:440 };
const LADDER_X = 6040;
const TAP = { x:7150 }, WELL = { x:7150 }, SABLE = { x:6960 };
const YARD_GATE_X = 7600;
const POSTS = [8000, 8450, 8900, 9350];
const CHAIN = 160;                                  // each conscript's reach from his post
const TOWER = { x:9800, w:120, top:380 };
const ROAD_GATE_X = 10300, FRONTIER_X = 10700;
/* Rings, measured like the shore's (standing centre y + 22; a hang is ring − 58 + 22):
   pier ← the ground 295; deck ← a pier hang 319, 538 from the ground; tower ← the ground 453. */
const RINGS = [
  { id:'pier',  x:6440, y:300 },
  { id:'deck',  x:6560, y:560 },
  { id:'tower', x:9830, y:470 },
];
const CUES = Object.freeze({
  bell:Object.freeze({ id:'colony-last-spark', src:'./audio/music/the-last-spark-of-darrow.mp3', title:'The Last Spark of Darrow',
    artist:'Aerth score', mood:'a bell drives them on' }),
  turned:Object.freeze({ id:'colony-village-vigil', src:'./audio/music/village-vigil.mp3', title:'Village Vigil',
    artist:'Aerth score', mood:'the colony turns: a home worth saving' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildColonyLevel()); }
function buildColonyLevel(){
  const face = (x, top, h, extra) => Object.assign({ type:'wall', x, y:top, h, w:26, slickL:1, slickR:1, noCling:1, actArt:'face' }, extra || {});
  const ring = (r) => ({ type:'actRing', actId:'ring-' + r.id, x:r.x, y:r.y, w:30, h:30, colonyRing:1 });
  const bars = (id, x, down) => face(x, 880, 880, { actBars:id, actArt:'bars', gone:!down });
  const ground = (x1, x2, y, art) => Object.assign(GrAt(x1, x2, y), { actArt:art });
  const objects = [
    // THE GATE, open behind you. The palisade's inside face, and the first of the sick.
    { type:'actPalisade', kind:'inner', x:40, y:TERRACES[0].y, w:80, h:560 },
    ground(0, TERRACES[0].x2, TERRACES[0].y, 'yard-earth'),
    { type:'actTent', actId:'tent-gate', x:620, y:TERRACES[0].y, w:240, h:TENT_H },
    { type:'actSick', actId:'sick-woman', kind:'woman', x:820, y:TERRACES[0].y, w:40, h:40, actTwoUp:1, actVerb:'LISTEN' },
    // THE TENTS, stepping down into the basin.
    face(TERRACES[1].x1, TERRACES[0].y, TERRACES[0].y - TERRACES[1].y), ground(TERRACES[1].x1, TERRACES[1].x2, TERRACES[1].y, 'terrace'),
    face(TERRACES[2].x1, TERRACES[1].y, TERRACES[1].y - TERRACES[2].y), ground(TERRACES[2].x1, TERRACES[2].x2, TERRACES[2].y, 'terrace'),
    face(TERRACES[3].x1, TERRACES[2].y, TERRACES[2].y - TERRACES[3].y), ground(TERRACES[3].x1, LEN, TERRACES[3].y, 'basin'),
    ...TENTS.map((t, i) => ({ type:'actTent', actId:'tent-' + i, x:(t.x1 + t.x2) / 2, y:groundAt(t.x1), w:t.x2 - t.x1, h:TENT_H })),
    ...FIRES.map((f, i) => ({ type:'actFire', actId:'fire-' + i, x:f.x, y:groundAt(f.x), w:40, h:20 })),
    ...WATCH.map(w => ({ type:'actTower', actId:'tower-' + w.id, x:w.x, y:w.base, w:70, h:w.h, watch:w.id })),
    // SABLE'S SPRING.
    { type:'actAlmsBell', actId:'alms-bell', x:ALMS_BELL.x, y:ALMS_BELL.y, w:30, h:90 },
    { type:'actConduit', x:(CONDUIT.x1 + CONDUIT.x2) / 2 + 600, y:0, w:CONDUIT.x2 - CONDUIT.x1 + 1400, h:CONDUIT.y },
    Pl((CONDUIT.x1 + CONDUIT.x2) / 2, CONDUIT.x2 - CONDUIT.x1, CONDUIT.y, { h:26, actArt:'conduit-deck' }),
    ring(RINGS[0]), ring(RINGS[1]),
    { type:'actTap', actId:'tap', x:TAP.x, y:CONDUIT.y, w:40, h:30 },
    { type:'actWell', actId:'well', x:WELL.x, y:0, w:90, h:120, restSiteAnchor:'sables-spring' },
    { type:'actSable', actId:'sable', x:SABLE.x, y:0, w:30, h:50, actTwoUp:1, actVerb:'TALK' },
    { type:'actArch', kind:'yard-gate', x:YARD_GATE_X, y:0, w:120, h:420 },
    bars('yard-gate', YARD_GATE_X, true),
    // THE CONSCRIPTION YARD.
    ...POSTS.map((x, i) => ({ type:'actPost', actId:'post-' + i, x, y:0, w:20, h:70 })),
    { type:'actBellTower', x:TOWER.x, y:0, w:TOWER.w + 40, h:TOWER.top + 120 },
    Pl(TOWER.x, TOWER.w, TOWER.top, { h:16, actArt:'tower-top' }),
    ring(RINGS[2]),
    { type:'actArch', kind:'road-gate', x:ROAD_GATE_X, y:0, w:120, h:420 },
    bars('road-gate', ROAD_GATE_X, true),
  ];
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[], enemies:[],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function refs(){ const r = {}; for(const o of G.obstacles) if(o.actId) r[o.actId] = o; return r; }
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE), P = kit.path();
  const A = G.actTwo = {
    stage:COLONY, t:0, spawned:false, flash:0, stingerT:0, tolls:[], fallen:[], queue:[],
    watch:WATCH.map(w => ({ id:w.id, x:w.x, base:w.base, my:w.base + w.h + 24, gx:w.sweep[0], gy:groundAt(w.sweep[0]), k:0, caught:0, grace:0, alarmT:0, screen:0 })),
    smoke:[], fireT:FIRES.map(f => f.phase),
    enc:{ w1:freshEnc('w1'), w2:freshEnc('w2'), yard:freshEnc('yard') },
    tapOpen:done(c, 'colony-tap'), water:{ t:done(c, 'colony-tap') ? 99 : 0 }, bucket:done(c, 'colony-tap') ? 1 : 0,
    sable:{ met:false, after:false, face:1 }, lure:null, almsRing:0,
    turned:P.colony === 'turned' || done(c, 'colony-turned'), turnT:done(c, 'colony-turned') ? 99 : 0,
    oren:{ x:G.p.x - 60, y:G.p.y, st:P.oren === 'helped' ? 'follow' : 'absent', t:0, face:1, vx:0, cured:!!P.orenKnown, target:null, hit:0 },
    frontier:false, checkpoints:{},
  };
  if(done(c, 'colony-yard')) A.enc.yard.st = 'done';
  for(const w of A.watch) if(done(c, 'colony-watch-' + w.id)){A.enc[w.id].st='done';w.disabled=true;}
  setBars('yard-gate', !A.tapOpen);
  setBars('road-gate', A.enc.yard.st !== 'done');
  for(const w of A.watch) aimWatch(w, WATCH.find(q => q.id === w.id), 0);
}
function freshEnc(id){ return { id, st:'idle', foes:[], silenced:false, tollT:0.6, t:0 }; }
function setBars(id, down){
  for(const o of G.obstacles) if(o.actBars === id && o.gone === down){ o.gone = !down; o.moveT = 0.5; }
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== COLONY) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A, p); }
  A.flash = Math.max(0, A.flash - dt * 2);
  if(A.stingerT > 0) A.stingerT = Math.max(0, A.stingerT - dt);
  for(const o of G.obstacles) if(o.moveT > 0) o.moveT = Math.max(0, o.moveT - dt);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  updateSmoke(A, dt);
  updateWatch(A, dt, p);
  updateLure(A, dt, p);
  updateSpring(A, dt, p);
  updateYard(A, dt, p);
  updateOren(A, dt, p);
  F.updateFallen(A, dt);
  updateCheckpoints(A, p);
  if(A.turned) A.turnT += dt;
  if(A.almsRing > 0) A.almsRing = Math.max(0, A.almsRing - dt);
  A.tolls = A.tolls.filter(t => (t.t += dt) < 1.2);
  // The road up to the palace is a walked seam once the Path exists; until then, a card.
  if(!A.frontier && p.x > FRONTIER_X && !p.dead && A.enc.yard.st === 'done' && !A2.handles(COLONY + 1)) leaveColony(A);
}
function lateUpdate(){}
function firstFrame(A, p){
  const Y = A.enc.yard;
  if(Y.st !== 'done' || (!A.turned && kit.path().oren === 'helped')){
    const c = kit.zoneCircuits(ZONE);
    POSTS.forEach((x, i) => { if(!done(c, 'colony-shackle-' + i)) F.spawnBelled(Y, { x:x + (i % 2 ? 40 : -40), y:0, x1:x - CHAIN, x2:x + CHAIN, enc:'yard', slot:0, st:Y.st === 'done' ? 'sit' : 'post', post:{ x, y:0 } }); });
    if(Y.st !== 'done'){
    Y.ringer = F.spawnSunguard(Y, { x:TOWER.x - 20, y:TOWER.top, x1:TOWER.x - 50, x2:TOWER.x + 50, enc:'yard', face:-1, st:'post', bell:'ringing', ringer:true });
    Y.guard = F.spawnSunguard(Y, { x:ROAD_GATE_X - 120, y:0, x1:ROAD_GATE_X - 600, x2:ROAD_GATE_X - 40, enc:'yard', face:-1, st:'post', bell:'none' });
    Y.guard.holdPost = true;
    Y.ringerFleeX = TOWER.x + 700;
    } else { Y.t=1; Y.silenced=true; }
  }
  if(!A.tapOpen){
    const S = A.enc.conduit = freshEnc('conduit');
    S.guard = F.spawnSunguard(S, { x:6900, y:CONDUIT.y, x1:CONDUIT.x1 + 30, x2:CONDUIT.x2 - 30, enc:'conduit', face:-1, st:'post', bell:'none' });
  }
}

/* ── The watch: gilt glasses on towers, and the smoke of the pit fires ─────── */
function aimWatch(w, W, t){
  // A slow sweep that lingers at its ends, the way a man turns a heavy glass.
  const k = 0.5 - 0.5 * Math.cos((t + W.phase) / W.period * Math.PI * 2);
  w.k = k; w.gx = W.sweep[0] + (W.sweep[1] - W.sweep[0]) * k; w.gy = groundAt(w.gx);
}
function updateSmoke(A, dt){
  FIRES.forEach((f, i) => {
    A.fireT[i] += dt;
    if(A.fireT[i] >= SMOKE.period){ A.fireT[i] -= SMOKE.period; A.smoke.push({ x:f.x, y:groundAt(f.x) + 30, t:0, r:SMOKE.r0, d:0 }); }
  });
  for(const s of A.smoke){
    s.t += dt; s.x += SMOKE.drift * dt; s.y += SMOKE.rise * dt;
    const g = Math.min(1, s.t / SMOKE.grow);
    s.r = SMOKE.r0 + (SMOKE.r1 - SMOKE.r0) * g;
    s.d = s.t < SMOKE.grow + SMOKE.hold ? Math.min(1, s.t / 0.6) : Math.max(0, 1 - (s.t - SMOKE.grow - SMOKE.hold) / SMOKE.fade);
  }
  A.smoke = A.smoke.filter(s => s.d > 0 || s.t < 1);
}
function inSmoke(A, x, y){ return A.smoke.some(s => s.d > 0.45 && Math.hypot(x - s.x, y - s.y) < s.r * SMOKE.cover); }
function underTent(p){ const g = groundAt(p.x); return TENTS.some(t => p.x > t.x1 + 8 && p.x < t.x2 - 8 && p.y < g + TENT_H - 40 && Math.abs(groundAt(t.x1) - g) < 1); }
/* Hidden: in thick smoke, under a tent — or, for a knight who took the kneeling man's hand,
   behind residents holding canvas at fixed gaps. */
function hidden(A, p){
  if(kit.path().oren === 'helped' && SCREENS.some(s => Math.abs(p.x-s.x)<s.r && Math.abs(p.y-groundAt(s.x))<60)) return 'screened';
  if(underTent(p)) return 'tent';
  if(inSmoke(A, p.x, p.y + 24)) return 'smoke';
  return null;
}
function updateWatch(A, dt, p){
  A.watch.forEach((w, i) => {
    const W = WATCH[i], S = A.enc[w.id];
    if(A.turned || S.st === 'done'){w.disabled=true;w.caught=0;w.screen=0;return;}
    if(w.grace > 0) w.grace -= dt;
    if(S.st === 'live'){
      // Caught: the glass holds on you and the bell does not stop until they have you.
      w.gx = Math.max(W.sweep[0] - 200, Math.min(W.sweep[1] + 200, p.x)); w.gy = groundAt(w.gx);
      S.tollT -= dt;
      if(S.tollT <= 0){ S.tollT = 2.6; F.toll(A, S, { x:w.x, y:w.my + 10 }); w.ring = 1; }
      F.recordFallen(A, S, p);
      const alive = S.foes.filter(e => !e.dead);
      const far = Math.abs(p.x - (W.sweep[0] + W.sweep[1]) / 2) > (W.sweep[1] - W.sweep[0]) / 2 + 900;
      if(far) for(const e of alive) if(e.st !== 'flee'){ e.st = 'flee'; e.t = 0; e.fleeX = nearestTent(e.x); }
      if(!alive.length){ S.st = 'done'; w.disabled=true; w.caught=0; kit.latch(ZONE, 'colony-watch-' + w.id); }
    } else {
      if(w.ring > 0) w.ring = Math.max(0, w.ring - dt * 2.5);
      if(w.caught > 0){
        // The glass stops and flares on you for a breath before the bell: get into smoke or
        // under canvas in that breath and he loses you.
        w.gx = p.x; w.gy = groundAt(p.x);
        if(hidden(A, p)){ w.caught = 0; w.grace = 0.8; return; }
        w.caught -= dt;
        if(w.caught <= 0) raiseAlarm(A, w, W, S, p);
        return;
      }
      aimWatch(w, W, A.t);
      const lit = inBeam(w, p);
      w.screen = lit && hidden(A, p) === 'screened' ? Math.min(1, w.screen + dt * 4) : Math.max(0, w.screen - dt * 2);
      if(lit && w.grace <= 0 && !p.dead && !hidden(A, p)){ w.caught = 0.85; if(meta.soundOn) SFX.hit(); }
    }
    if(w.ring > 0) w.ring = Math.max(0, w.ring - dt * 2.5);
  });
}
/* Inside the cone from the glass down to the pool (the knight's middle or head). */
function inBeam(w, p){
  if(p.dead) return false;
  const inTri = (x, y) => {
    const ax = w.x, ay = w.my, bx = w.gx - POOL, by = w.gy, cx = w.gx + POOL, cy = w.gy;
    const d1 = (x - bx) * (ay - by) - (ax - bx) * (y - by), d2 = (x - cx) * (by - cy) - (bx - cx) * (y - cy), d3 = (x - ax) * (cy - ay) - (cx - ax) * (y - ay);
    return !(((d1 < 0) || (d2 < 0) || (d3 < 0)) && ((d1 > 0) || (d2 > 0) || (d3 > 0)));
  };
  return inTri(p.x, p.y + 20) || inTri(p.x, p.y + 40) || (Math.abs(p.x - w.gx) < POOL && p.y < w.gy + 30);
}
function nearestTent(x){ let best = TENTS[0], d = 1e9; for(const t of TENTS){ const m = (t.x1 + t.x2) / 2, dd = Math.abs(m - x); if(dd < d){ d = dd; best = t; } } return (best.x1 + best.x2) / 2; }
function raiseAlarm(A, w, W, S, p){
  S.st = 'live'; S.t = 0; S.tollT = 0.1; S.silenced = false; S.foes = S.foes.filter(e => !e.dead);
  // Two come out of the nearest tent — one from each side of it if there is room.
  const tx = nearestTent(p.x), x1 = W.sweep[0] - 300, x2 = W.sweep[1] + 300;
  for(let i = 0; i < 2; i++){
    const x = Math.max(x1, Math.min(x2, tx + (i ? 60 : -60)));
    const e = F.spawnBelled(S, { x, y:groundAt(x), x1, x2, enc:w.id, slot:i, st:'arrive' });
    e.xp = 6; e.terraced = true;
  }
  A.flash = Math.max(A.flash, 0.25);
}

/* ── The alms-bell: whoever rings it gets a visit ──────────────────────────── */
function updateLure(A, dt, p){
  const S = A.enc.conduit, g = S && S.guard; if(!g || g.dead) return;
  const L = A.lure;
  if(!L) return;
  // Down the conduit, down the ladder, to the bell; a long look round; back up.
  const path = [ { x:LADDER_X + 20, y:CONDUIT.y }, { x:LADDER_X, y:0 }, { x:ALMS_BELL.x + 50, y:0 } ];
  L.t += dt;
  if(L.leg < path.length){
    const to = path[L.leg], dx = to.x - g.x, dy = to.y - g.y, d = Math.hypot(dx, dy), v = (L.leg === 1 ? 110 : 150) * dt;
    if(d <= v){ g.x = to.x; g.y = to.y; L.leg++; }
    else { g.x += dx / d * v; g.y += dy / d * v; }
    g.face = g.shieldFace = Math.sign(dx) || g.face; g.walking = true;
  } else if(L.look < 4){ L.look += dt; g.walking = false; g.face = g.shieldFace = Math.sin(L.look * 2) > 0 ? 1 : -1; }
  else {
    const back = [ { x:LADDER_X, y:0 }, { x:LADDER_X + 20, y:CONDUIT.y }, { x:6900, y:CONDUIT.y } ];
    const to = back[L.back || 0], dx = to.x - g.x, dy = to.y - g.y, d = Math.hypot(dx, dy), v = (L.back === 1 ? 110 : 120) * dt;
    if(d <= v){ g.x = to.x; g.y = to.y; L.back = (L.back || 0) + 1; if(L.back >= back.length){ A.lure = null; g.st = 'post'; g.floorY = CONDUIT.y; g.walking = false; return; } }
    else { g.x += dx / d * v; g.y += dy / d * v; }
    g.face = g.shieldFace = Math.sign(dx) || g.face; g.walking = true;
  }
  // Met on the ground by whoever rang it: he fights there.
  if(g.y < 1 && !p.dead && Math.abs(p.y - g.y) < 60 && Math.abs(p.x - g.x) < 160){
    A.lure = null; g.st = 'fight'; g.floorY = 0; g.x1 = ALMS_BELL.x - 400; g.x2 = YARD_GATE_X - 40; g.t = 0;
  }
}
function ringAlms(A){
  A.almsRing = 1.2; A.tolls.push({ x:ALMS_BELL.x, y:ALMS_BELL.y + 80, t:0 });
  if(meta.soundOn){ if(SFX.windGate) SFX.windGate(110, ALMS_BELL.x); else SFX.hit(); }
  const S = A.enc.conduit, g = S && S.guard;
  if(g && !g.dead && !A.lure && (g.st === 'post' || g.st === 'guard')){ A.lure = { t:0, leg:0, look:0, back:0 }; g.st = 'script'; }
}

/* ── Sable's spring: the conduit, its guard, the King's tap, the well and the gate ─ */
function updateSpring(A, dt, p){
  const S = A.enc.conduit;
  if(S && S.guard){
    const g = S.guard;
    // On the conduit he holds the walk: anyone who comes up onto it, he comes for.
    if(g.st === 'post' && !g.dead && !A.lure && p.y > CONDUIT.y - 10 && p.x > CONDUIT.x1 && p.x < CONDUIT.x2) { S.st = 'live'; g.st = 'fight'; }
    F.recordFallen(A, S, p);
  }
  // The tap: come down hard on it from the walk.
  if(!A.tapOpen && p.slamming && p.vy > 0 && Math.abs(p.x - TAP.x) < 55 && p.y >= CONDUIT.y - 6 && p.y - CONDUIT.y < 110){
    A.tapOpen = true; A.water.t = 0;
    p.slamming = false; p.vy = -380;
    G.shake = Math.max(G.shake || 0, 8); G.hitstop = Math.max(G.hitstop || 0, 0.06);
    kit.burst(TAP.x, CONDUIT.y + 10, '#f3d67a', 20); kit.burst(TAP.x, CONDUIT.y - 20, '#cfe3ea', 16);
    if(meta.soundOn) SFX.hit();
    kit.latch(ZONE, 'colony-tap');
  }
  if(A.tapOpen){
    A.water.t += dt;
    // The bucket fills, sinks, and its counterweight lifts the yard gate.
    if(A.water.t > 1.2) A.bucket = Math.min(1, A.bucket + dt / 1.4);
    if(A.bucket >= 1 && G.obstacles.some(o => o.actBars === 'yard-gate' && !o.gone)){
      setBars('yard-gate', false); G.shake = Math.max(G.shake || 0, 4); if(meta.soundOn) SFX.land();
    }
  }
  // Sable speaks when you come near: first about the tap; after the water, with the cup.
  // Keep both conversations local to him so the approach and hook climb stay uninterrupted.
  const P = kit.path(), inHollow = Math.abs(p.x - SABLE.x) < 230 && p.y < 60 && !p.dead;
  A.sable.face = Math.sign(p.x - SABLE.x) || 1;
  if(inHollow && !A.sable.met){ A.sable.met = true; sableIntro(A, P); }
  else if(inHollow && A.tapOpen && A.water.t > 2 && !A.sable.after){ A.sable.after = true; sableWater(A, P, p); }
}
const SABLE_ACCENT = '#b9a7a0';
function sableIntro(A, P){
  const src = { x:SABLE.x, y:0 };
  if(P.oren === 'struck'){
    kit.say(src, '<b>SABLE</b><br>“I heard what happened at the gate.” He does not look at you. “The King’s tap is on the conduit, over the well. Do what you came to do, and go.”', null, SABLE_ACCENT);
    return;
  }
  const tail = P.oren === 'helped' ? ' He looks past you at the man with the hammer. “And you brought one in by the hand. Good. Get the water down and I’ll see to you both.”'
    : ' “There’s a man kneeling at the gate. Nobody’s taken his hand, and they won’t let me out to him.”';
  kit.say(src, '<b>SABLE</b><br>“The King’s pipe took the spring. There’s a tap on the conduit, right over the well. I can’t climb to it, and they’d see me if I could.”' + tail, [
    ['I’ll get the water down.', '“Not by rushing. Mind the one who walks the conduit. He hears the alms-bell like any of them.”'],
    ['Why does the King want it?', '“For his fountains. He says the sun is coming up, and he wants to be clean for it.”'],
    ['Is there nothing to drink here?', '“Not since the leaves turned. We give them the dew. A spoon at a time.”'],
  ], SABLE_ACCENT);
}
function sableWater(A, P, p){
  const src = { x:SABLE.x, y:0 };
  if(P.oren === 'struck'){
    kit.say(src, '<b>SABLE</b><br>He fills the cups of the sick, one by one, and does not fill yours.', null, SABLE_ACCENT);
    return;
  }
  if(P.infected){
    kit.cure();
    A.oren.cured = true; P.orenKnown = true; kit.savePath();
    A.flash = Math.max(A.flash, 0.6);
    kit.say(src, '<b>SABLE</b><br>“Slowly. One spoon at a time. It helps more than you think.” He gives the water to the man first, then to you. The flowers on your cloak close, and where they closed the cloth is gold.', null, SABLE_ACCENT);
    A.queue.push({ src:A.oren, accent:'#d59a68', html:'<b>OREN</b><br>He unwinds the bandage from his face. The beard is months long, but it is Oren, the chainwright from the Causeway. “…There. Know me now?” He takes up his hammer. “Stay close in the yard. I can open those shackles. It’s what I do.”', responses:[
      ['You followed him here.', '“As far as the sea would let me. Then it handed me to his men.”'],
      ['How long has it been?', '“Since the leaves turned. Long enough to learn every lock in that yard, and hate each one.”'],
      ['You look terrible.', '“Aye, and you look like a man who drank from the same cup.”'],
    ] });
    return;
  }
  // Not sick: the water is only water, and the thirst you came ashore with is gone.
  restoreBlood(p, Infinity);
  const nudge = P.oren === 'kneeling' ? ' “That man at the gate is still kneeling. You know where the gate is.”' : '';
  kit.say(src, '<b>SABLE</b><br>“There. The spring will find its way back up the pipe now, a little at a time.” He fills a cup and holds it out. The water is cold, and your mouth stops burning.' + nudge, null, SABLE_ACCENT);
}

/* ── The Conscription Yard ─────────────────────────────────────────────────── */
function updateYard(A, dt, p){
  const Y = A.enc.yard;
  // The colony turns when the last shackle is off — even if the ringer was silenced first.
  if(!A.turned && A.oren.st !== 'absent' && Y.t > 0 && !Y.foes.some(e => !e.dead && e.actFoe === 'belled' && e.shackle)) turnColony(A);
  if(Y.st === 'done') return;
  F.recordFallen(A, Y, p);
  if(Y.st === 'idle'){ if(!p.dead && A.tapOpen && p.x > YARD_GATE_X + 120 && p.y < 60) Y.st = 'live'; return; }
  Y.t += dt;
  const r = Y.ringer;
  if(!Y.silenced && r && !r.dead && r.st !== 'flee'){
    Y.tollT -= dt;
    if(Y.tollT <= 0){ Y.tollT = 2.6; r.bellSwing = 1; F.toll(A, Y, { x:TOWER.x + 30, y:TOWER.top + 70 }); }
  }
  const bound = Y.foes.filter(e => !e.dead && e.actFoe === 'belled' && e.shackle && e.st !== 'freed');
  const opened = Y.silenced || (A.oren.st !== 'absent' && !bound.length);
  if(opened && !Y.opening){
    Y.opening = true;
    if(!Y.silenced && r && !r.dead) F.silence(A, Y, r);
    if(Y.guard && !Y.guard.dead){ Y.guard.st = 'flee'; Y.guard.fleeX = FRONTIER_X + 200; Y.guard.t = 0; }
    setBars('road-gate', false);
    if(A.oren.st !== 'absent' && !bound.length) turnColony(A);
  }
  if(Y.opening && !Y.finished){
    Y.finished = true; Y.st = 'done';
    kit.latch(ZONE, 'colony-yard');
    try{ activateRuntimeCheckpoint(ZONE + ':yard', { x:ROAD_GATE_X + 120, y:0 }, 'checkpoint', null, true); }catch(_e){}
    try{ captureCurrentZonePersistence(); if(!G.levelSelectMode) persist(); }catch(_e){}
  }
}
/* THE COLONY TURNS. The last shackle is off; the ringer drops the rope; the sick come out
   of the tents with their cups and stand in the road. They will walk with you. */
function turnColony(A){
  if(A.turned) return;
  A.turned = true; A.turnT = 0;
  const P = kit.path(); P.colony = 'turned'; kit.savePath();
  kit.latch(ZONE, 'colony-turned');
  A.flash = Math.max(A.flash, 0.4);
  A.queue.push({ src:A.oren, accent:'#d59a68', html:'<b>OREN</b><br>“That’s the last shackle.” Behind you the tents open. The sick come out with their cups and their bells, and nobody rings them.' });
}

/* ── Oren, if he came in with you ──────────────────────────────────────────── */
function updateOren(A, dt, p){
  const O = A.oren; if(O.st === 'absent') return;
  O.t += dt; if(O.hit > 0) O.hit = Math.max(0, O.hit - dt);
  const Y = A.enc.yard;
  // In the yard he goes to the shackles himself, one post at a time.
  if((Y.st === 'live' || Y.st === 'done') && O.st !== 'break'){
    const next = nextShackle(Y);
    if(next){ O.st = 'break'; O.target = next; O.t = 0; }
  }
  if(O.st === 'break'){
    const e = O.target;
    if(!e || e.dead || !e.shackle){ const n = nextShackle(Y); if(n){ O.target = n; O.t = 0; } else { O.st = 'follow'; O.target = null; } return; }
    const post = e.shackle.x;
    // Work together down the yard; he cannot finish the whole rescue offscreen.
    if(p.dead || Math.abs(p.x-post)>420){O.t=0;O.vx=0;return;}
    if(Math.abs(post - O.x) > 700 && Math.abs(p.x - O.x) > 700){ O.x = p.x - (p.face || 1) * 50; O.y = p.y; }       // never left behind
    const dx = post - O.x;
    if(Math.abs(dx) > 24){ O.vx = Math.sign(dx) * 190; O.x += O.vx * dt; O.face = Math.sign(dx); O.t = 0; O.y = 0; return; }
    O.vx = 0; O.face = Math.sign(e.x - O.x) || O.face;
    if(Math.floor(O.t / 0.5) > Math.floor((O.t - dt) / 0.5)){ O.hit = 0.2; kit.burst(post, 24, '#cfd6da', 6); if(meta.soundOn) SFX.hit(); }
    if(O.t > 1.6) freeShackled(A, e);
    return;
  }
  if(O.st === 'follow') kit.follow(O, p, dt);
}
function nextShackle(Y){
  let best = null;
  for(const e of Y.foes) if(!e.dead && e.actFoe === 'belled' && e.shackle && e.st !== 'freed' && (!best || e.shackle.x < best.shackle.x)) best = e;
  return best;
}
function freeShackled(A, e){
  if(e.shackle) kit.latch(ZONE, 'colony-shackle-' + POSTS.indexOf(e.shackle.x));
  e.st = 'flee'; e.t = 0; e.fleeX = 6400; e.freedBy = 'oren'; e.dropped = true; e.x1 = -1e9; e.x2 = 1e9; e.shackle = null;
  kit.burst(e.x, 20, '#e9e2cf', 10);
}

/* ── Up targets, and a blade on a bell ─────────────────────────────────────── */
function interact(o){
  const A = G.actTwo; if(!A || A.stage !== COLONY) return false;
  if(o.actId === 'sick-woman'){
    kit.say(o, '<b>A WOMAN BY THE GATE</b><br>“The King came through in summer. On foot, if you’ll believe it, with one hand in a glove. Had the pipe built before the leaves turned. Never once took that glove off.”');
    return true;
  }
  if(o.actId === 'sable'){
    const P = kit.path();
    const line = !A.tapOpen ? '“The tap’s on the conduit, over the well. Mind the one who walks it.”'
      : P.oren === 'struck' ? 'He is filling cups, and does not turn round.'
      : '“One thing at a time. Start there.”';
    kit.say({ x:SABLE.x, y:0 }, '<b>SABLE</b><br>' + line, null, SABLE_ACCENT);
    return true;
  }
  return false;
}
function swing(p, w){
  const A = G.actTwo; if(!A || A.stage !== COLONY) return;
  const token = A.almsToken || (A.almsToken = { almsBell:true });
  if(p.swingHits.indexOf(token) >= 0) return;
  const fwd = (ALMS_BELL.x - p.x) * p.face;
  if(fwd < -20 || fwd > (w.range || 50) + 40 || p.y > 110) return;
  p.swingHits.push(token);
  ringAlms(A);
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== COLONY) return;
  const S = A.enc[e.enc]; if(!S) return;
  // Foes of the tents walk the terraces: their floor is the terrace under them.
  if(e.terraced) e.floorY = groundAt(e.x);
  F.update(e, p, dt, A, S);
}

/* ── Leaving: the road to the palace, and the choice closes behind you ─────── */
function leaveColony(A){
  A.frontier = true;
  closeChoice();
  const P = kit.path();
  try{ commitStageCompletion(); }catch(_e){}
  try{ recordWorldClear(); }catch(_e){}
  try{ recordSessionClear(COLONY); }catch(_e){}
  const line = P.colony === 'turned' ? 'The sick come out of the tents behind you with their cups and their bells, and follow Oren up the road.'
    : P.oren === 'helped' ? 'Oren walks beside you. Behind you, the yard is quiet.'
    : P.oren === 'left' ? 'Behind you, past the tents and the gate, a man is still kneeling. Nobody took his hand.'
    : 'The bells ring behind you all the way to the road.';
  kit.showFrontierCard('THE COLONY · BEHIND YOU', 'CHARMA SHORES', 'The Path to the Palace', line);
}
function seamSpec(){
  const p = G.p, A = G.actTwo;
  // The road east, up to the palace: leaving the Colony closes the choice behind you.
  if(p.x > LEN / 2){
    if(!A || A.stage !== COLONY || A.enc.yard.st !== 'done' || !A2.handles(COLONY + 1)) return null;
    const cross = p.x >= LEN - 62 && p.face > 0;
    if(cross) closeChoice();
    return { connector:'colony-path', zone:ZONE, targetStage:COLONY + 1, warm:p.x >= LEN - 1400, cross, forward:true, commitClear:true };
  }
  // The gate behind you is the way back to the kneeling man.
  return { connector:'shores-colony', zone:ZONE, targetStage:BACK, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
}
function closeChoice(){
  const P = kit.path();
  if(P.oren === 'kneeling'){ P.oren = 'left'; P.forsaken = true; kit.savePath(); }
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  if(plan.connectorId === 'shores-colony') return { x:SPAWN.x, y:SPAWN.y };
  if(plan.connectorId === 'colony-path') return { x:LEN - 160, y:0 };
  return null;
}
function voidFloor(){ return -48; }
function cameraFloor(p){ return p ? Math.min(groundAt(p.x), Math.max(0, p.y)) : null; }

/* ── Checkpoints ───────────────────────────────────────────────────────────── */
const CHECKPOINTS = [
  { id:'terraces', x:2560, y:200, when:(p) => p.x > 2480 && p.x < 2700 && p.y >= 198 },
  { id:'basin', x:5500, y:0, when:(p) => p.x > 5420 && p.x < 5600 && p.y < 5 },
];
function updateCheckpoints(A, p){
  if(!p.onGround || p.dead) return;
  for(const c of CHECKPOINTS) if(!A.checkpoints[c.id] && c.when(p)){
    A.checkpoints[c.id] = true;
    try{ activateRuntimeCheckpoint(ZONE + ':' + c.id, { x:c.x, y:c.y }, 'checkpoint', null, true); }catch(_e){}
  }
}

/* ── Music: the refuge; a bell's drive while one rings; the vigil once it turns ─ */
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== COLONY) return null;
  if(A.turned) return CUES.turned;
  const Y = A.enc.yard;
  if((Y.st === 'live' && !Y.silenced) || A.enc.w1.st === 'live' || A.enc.w2.st === 'live') return CUES.bell;
  return null;
}

A2.register(COLONY, Object.freeze({
  level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue,
}));
root.BladefallColony = Object.freeze({
  COLONY, ZONE, groundAt, constants:Object.freeze({ LEN, TERRACES, SPAWN, WATCH, POOL, FIRES, SMOKE, TENTS, TENT_H, SCREENS, ALMS_BELL, CONDUIT,
    LADDER_X, TAP, WELL, SABLE, YARD_GATE_X, POSTS, CHAIN, TOWER, ROAD_GATE_X, FRONTIER_X, RINGS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
