/* Bladefall — ACT TWO · Sunspire Palace (stage 20), 2026-09-24.

   The top of the mountain, in full sun, and the end of the act. The palace is drowning in the
   colony's water: fountains run over, the gardens are green in a dry country, and sick servants
   in gold masks scrub the gold. Every dial in the house reads a quarter to four.

   LIGHT IS A PORTAL NOUN. The King's mirrors and windows throw shafts of sun that burn whoever
   stands in them. A shaft that falls on slate can be caught in a mouth and let out of its twin:
   a floor mouth throws it straight up, a wall mouth straight out across the room. Three locks
   teach it, each one step further, and the King is the fourth.

     THE SUN COURT — a mirror's shaft falls on a slate slab; the garden gate's sun-seal hangs,
       dark, over another. Floor to floor: the light goes up into the seal.
     THE HALL OF HOURS — the Hour Door's dial across the hall; a shaft on the floor and a slate
       panel on the arch. Floor to wall: the light goes across the hall.
     THE AQUEDUCT CROWN — the sluice's seal high on the cistern; the arch's slate is high too,
       reached from a ring. The water goes back down the mountain to the colony, and the flume
       it filled is the road to the throne.
     THE THRONE OF NOON — the King in Daylight is untouched: his radiance turns every blade,
       until he is touched from two sides at once. A sick hand on his back while you strike his
       front — or the sun, routed through your mouths onto his back. The sun climbs through the
       windows (dawn, morning, noon) and the shade shrinks. On the forsaken road the sick fight
       for him. This time he does not run.
     THE SEA TERRACE — the hydra you set free comes up out of the sea, and does not strike. It
       has come to warn you about the one you left on the beach. You ride it away: the end of
       Act Two.

   Allies change fights, never routes: every lock is opened by light alone. */
(function installSunspire(root){
'use strict';
const A2 = root.BladefallActTwo;
if(!A2 || !A2.register) return;
const kit = A2.kit, F = kit.foes;

const STAGE = 20, ZONE = 'sunspire', BACK = 19;

/* ── Geometry (world units; y up) ─────────────────────────────────────────── */
const LEN = 11800;
const SPAWN = { x:150, y:0 };
const COURT_GATE_X = 2700, HOUR_DOOR_X = 4600, TOWER_X = 7400, THRONE_DOOR_X = 9000, SEA_DOOR_X = 10700;
const FLUME = { x1:8000, x2:8900, y:-120 };          // the aqueduct's last span: the road to the throne
const ARENA = { x1:9040, x2:10660 };
const THRONE = { x:10560 };
const TERRACE = { x1:10700, x2:11700, edge:11560 };
function groundAt(x){ return x >= FLUME.x1 && x < FLUME.x2 ? FLUME.y : 0; }

/* Slate: the only surfaces a mouth holds on. Floor slabs where the sun falls, and the arch
   panels the sun can be let out of. */
const SLABS = {
  court1:{ x:1150, w:70 }, court2:{ x:2450, w:84 },
  hall:{ x:3900, w:70 },
  crown:{ x:5600, w:70 },
  dawn:{ x:9400, w:70 }, morning:{ x:9800, w:70 }, noon:{ x:10150, w:70 },
};
const PANELS = [
  { id:'hall-arch', x:3000, top:230, h:140, face:1 },        // the Hall's arch, east face (90-230)
  { id:'crown-arch', x:4620, top:480, h:120, face:1 },       // the Crown's arch, east face, high (360-480)
  { id:'throne-west', x:THRONE_DOOR_X, top:270, h:180, face:1 },   // the Throne's doors, low (90-270)
  { id:'throne-east', x:SEA_DOOR_X, top:270, h:180, face:-1 },
];
/* Sun-seals: the locks light opens. r is generous: every mouth the slate allows reaches it. */
const SEALS = [
  { id:'court', x:2450, y:300, r:58, bars:'court-gate', line:'court' },
  { id:'hour', x:HOUR_DOOR_X - 20, y:160, r:100, bars:'hour-door', line:'hour' },
  { id:'sluice', x:TOWER_X - 20, y:430, r:86, bars:null, line:'sluice' },
];
const RING = { id:'crown', x:4760, y:470 };
/* The sun: each shaft is a ray from a mirror or a window to where it falls. */
const SHAFTS = [
  { id:'court', x:1500, y:560, tx:SLABS.court1.x, ty:0 },
  { id:'hall', x:4200, y:640, tx:SLABS.hall.x, ty:0 },
  { id:'hall-2', x:3560, y:640, tx:3420, ty:0 },
  { id:'crown', x:TOWER_X - 60, y:720, tx:SLABS.crown.x, ty:0 },
];
/* The Throne of Noon's windows, by the hour. One shaft each hour falls on slate. */
const HOURS = [
  { id:'dawn', shafts:[ { x:9700, tx:SLABS.dawn.x }, { x:10180, tx:9960, w:1 }, { x:10500, tx:10300, w:1 } ] },
  { id:'morning', shafts:[ { x:10000, tx:SLABS.morning.x }, { x:9500, tx:9280, w:1 }, { x:10460, tx:10240, w:1 }, { x:10640, tx:10420, w:1 } ] },
  { id:'noon', shafts:[ { x:10250, tx:SLABS.noon.x }, { x:9420, tx:9230, w:1 }, { x:9740, tx:9560, w:1 }, { x:10050, tx:9870, w:1 }, { x:10640, tx:10440, w:1 } ] },
];
const WINDOW_Y = 620;
const BLOOMS = 6;                                     // two for each hour
const HEAT = 0.6, BURN_CD = 1.2;                      // light burns after this long in it: long enough to set a mouth in it
const CATCH = 50;                                     // a mouth catches a ray this far from its centre

const CUES = Object.freeze({
  king:Object.freeze({ id:'sunspire-duel', src:'./audio/music/the-fallen-champion-duel.mp3', title:'The Fallen Champion Duel',
    artist:'Aerth score', mood:'the King in Daylight' }),
  hydra:Object.freeze({ id:'sunspire-hydra', src:'./audio/music/chains-of-the-deep.mp3', title:'Chains of the Deep',
    artist:'Aerth score', mood:'the hydra comes up out of the sea' }),
  ride:Object.freeze({ id:'sunspire-ride', src:'./audio/music/passing-the-flame.mp3', title:'Passing the Flame',
    artist:'Aerth score', mood:'riding the hydra away' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function buildLevel(){
  const objects = [];
  const bars = (x, id, top) => ({ type:'wall', x, y:top, h:top, w:30, slickL:1, slickR:1, noCling:1, actBars:id, actArt:'bars', gone:false });
  objects.push(Object.assign(GrAt(0, FLUME.x1), { actArt:'floor' }));
  objects.push(Object.assign(Pl((FLUME.x1 + FLUME.x2) / 2, FLUME.x2 - FLUME.x1, FLUME.y, { deep:1, h:60 }), { actArt:'flume-bed' }));
  objects.push({ type:'wall', x:FLUME.x1, y:0, h:-FLUME.y, w:26, actArt:'flume-wall' });
  objects.push({ type:'wall', x:FLUME.x2, y:0, h:-FLUME.y, w:26, actArt:'flume-wall' });
  objects.push(Object.assign(GrAt(FLUME.x2, LEN), { actArt:'floor' }));
  for(const k in SLABS){ const s = SLABS[k]; objects.push(Object.assign(Slate(s.x, s.w, 0), { actArt:'slab', actSlab:k })); }
  // The arches: stone above a doorway, a slate panel on the face the light must leave from.
  const arch = (x, top, h) => ({ type:'wall', x, y:top, h, w:40, actArt:'arch' });
  objects.push(arch(3000, 620, 390));                                        // the Hall's arch above its panel
  objects.push(arch(4620, 700, 220));                                        // the Crown's arch above its panel
  objects.push({ type:'wall', x:4620, y:360, h:160, w:40, actArt:'arch' }); // and between its panel and the doorway
  objects.push(arch(THRONE_DOOR_X, 700, 430));
  objects.push(arch(SEA_DOOR_X, 700, 430));
  for(const P of PANELS) objects.push(Object.assign(SlateWall(P.x, P.top, P.h), { w:40, actArt:'panel', actPanel:P.id, face:P.face }));
  objects.push(bars(COURT_GATE_X, 'court-gate', 700));
  objects.push(bars(HOUR_DOOR_X, 'hour-door', 90), { type:'wall', x:HOUR_DOOR_X, y:700, h:610, w:40, actArt:'door-frame' });
  objects.push(bars(THRONE_DOOR_X, 'throne-door', 90));
  objects.push(bars(SEA_DOOR_X, 'sea-door', 90));
  // The cistern and its sluice tower stand behind the road: the seal needs no wall behind it.
  objects.push({ type:'actCistern', x:(TOWER_X + FLUME.x1) / 2, y:0, w:FLUME.x1 - TOWER_X + 120, h:560 });
  objects.push({ type:'actRing', actId:'ring-' + RING.id, x:RING.x, y:RING.y, w:30, h:30 });
  for(const S of SEALS) objects.push({ type:'actSeal', actId:'seal-' + S.id, x:S.x, y:S.y, w:S.r * 2, h:S.r * 2, seal:S.id });
  for(const S of SHAFTS) objects.push({ type:'actShaftSource', x:S.x, y:S.y, w:60, h:60, shaft:S.id });
  objects.push({ type:'actFountain', actId:'fountain-0', x:620, y:0, w:120, h:90, restSiteAnchor:'servants-fountain' });
  objects.push({ type:'actFountain', actId:'fountain-1', x:1850, y:0, w:120, h:90 });
  objects.push({ type:'actServant', actId:'servant', x:900, y:0, w:30, h:50, actTwoUp:1, actVerb:'LISTEN' });
  objects.push({ type:'actServant', actId:'servant-hall', x:3560 + 180, y:0, w:30, h:50, kneel:1 });
  objects.push({ type:'actThrone', x:THRONE.x, y:0, w:120, h:220 });
  objects.push({ type:'actSeaMirror', x:THRONE.x, y:260, w:200, h:300 });
  objects.push({ type:'actHydraHead', actId:'hydra', x:TERRACE.edge - 30, y:0, w:60, h:80, actTwoUp:1, actVerb:'CLIMB ON', actMute:1 });
  objects.push({ type:'wall', x:TERRACE.x2, y:900, h:900, w:30, noCling:1, actArt:'balustrade' });
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
  const beaten = done(c, 'sunspire-king');
  const A = G.actTwo = {
    stage:STAGE, t:0, spawned:false, flash:0, stingerT:0, tolls:[], fallen:[], queue:[], trail:[],
    heat:0, burnT:0, beams:[], lit:{}, drained:done(c, 'sunspire-sluice'), drainT:done(c, 'sunspire-sluice') ? 9 : 0,
    seals:{ court:done(c, 'sunspire-court'), hour:done(c, 'sunspire-hour'), sluice:done(c, 'sunspire-sluice') },
    enc:{ hall:{ id:'hall', st:done(c, 'sunspire-hall') ? 'done' : 'idle', foes:[], silenced:false, t:0 },
          throne:{ id:'throne', st:beaten ? 'done' : 'idle', foes:[], silenced:false, t:0 } },
    // The hour you reached holds through a death (as the Foundry's acts do): the fight starts from it.
    king:null, blooms:beaten ? BLOOMS : done(c, 'sunspire-noon') ? 4 : done(c, 'sunspire-morning') ? 2 : 0, hour:0, touch:0, beamSide:0,
    oren:{ x:G.p.x - 60, y:0, st:P.oren === 'helped' ? 'follow' : 'absent', t:0, face:1, vx:0, cured:!!P.orenKnown, hit:0, touch:0 },
    allies:allied(P) ? [0, 1, 2].map(i => ({ x:G.p.x - 120 - i * 50, y:0, i, st:'follow', face:1, vx:0, t:0, cd:1 + i })) : [],
    hydra:done(c, 'sunspire-king') ? { st:'below', t:0 } : null, board:null, ride:null, over:false, checkpoints:{}, wasDead:false,
  };
  A.hour = hourOf(A.blooms);
  for(const S of SEALS) if(S.bars) setBars(S.bars, !A.seals[S.id]);
  setBars('throne-door', false);
  setBars('sea-door', !beaten);
}
function setBars(id, shut){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === !shut) return;
  b.gone = !shut; b.moveT = 0.5;
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  if(A.stingerT > 0) A.stingerT = Math.max(0, A.stingerT - dt);
  for(const o of G.obstacles) if(o.moveT > 0) o.moveT = Math.max(0, o.moveT - dt);
  if(A.board){ updateBoard(A,dt,p); return; }
  if(A.ride){ updateRide(A, dt, p); return; }
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); if(q.then) q.then(A); return; }
  A.trail.push({ x:p.x, y:p.y, face:p.face || 1 }); if(A.trail.length > 30) A.trail.shift();
  // A knight who dies in the Throne of Noon comes back outside its barred doors: the fight resets.
  if(p.dead){ A.wasDead = true; }
  else if(A.wasDead || (A.enc.throne.st === 'live' && (p.x < ARENA.x1 - 30 || p.x > ARENA.x2 + 30))){ A.wasDead = false; afterDeath(A, p); }
  updateFlume(A, dt, p);
  updateBeams(A, dt, p);
  updateHall(A, dt, p);
  updateThrone(A, dt, p);
  updateAllies(A, dt, p);
  updateOren(A, dt, p);
  updateHydra(A, dt, p);
  F.updateFallen(A, dt);
  updateCheckpoints(A, p);
  A.tolls = A.tolls.filter(t => (t.t += dt) < 1.2);
}
function lateUpdate(){
  const A=G.actTwo;
  if(A && A.board){G.p.x=A.board.x;G.p.y=A.board.y;G.p.vx=G.p.vy=0;}
}
function firstFrame(A){
  {
    const e = spawnEnemy('dayking', THRONE.x);
    Object.assign(e, { actFoe:'dayking', enc:'throne', y:0, baseY:0, floorY:0, active:true, noDrop:true, noticeRange:1, face:-1,
      st:'throne', t:0, cd:1, blinkCd:7, flareCd:9, portalGate:'daylight', exposeT:0, maxHp:6000, hp:6000, x1:ARENA.x1, x2:ARENA.x2 });
    A.king = e; A.enc.throne.foes.push(e); e.flowers = flowersFor(A.blooms);
    if(A.enc.throne.st === 'done'){ e.st='yield';e.active=false;e.hp=1;e.yielded=true; }
    if(G.boss === e) e.active = false;                 // no bar until he stands
  }
}

/* ── Light ──────────────────────────────────────────────────────────────────
   A ray is traced against the world: solids stop it; a mouth of a complete pair takes it and
   lets it out of its twin along the twin's normal (as the engine throws a body); a seal takes
   it; a body stops it (and the light burns a knight or one of the sick who fight for him). */
function solidsNear(x1, x2){
  return G.obstacles.filter(o => !o.gone && (o.type === 'plat' || o.type === 'wall') && o.x + (o.w || 0) / 2 > x1 - 40 && o.x - (o.w || 0) / 2 < x2 + 40);
}
function rayRect(x, y, dx, dy, l, r, b, t){
  let t0 = 0, t1 = 1e9;
  if(Math.abs(dx) < 1e-9){ if(x < l || x > r) return null; }
  else { let a = (l - x) / dx, c = (r - x) / dx; if(a > c){ const s = a; a = c; c = s; } t0 = Math.max(t0, a); t1 = Math.min(t1, c); }
  if(Math.abs(dy) < 1e-9){ if(y < b || y > t) return null; }
  else { let a = (b - y) / dy, c = (t - y) / dy; if(a > c){ const s = a; a = c; c = s; } t0 = Math.max(t0, a); t1 = Math.min(t1, c); }
  return t1 >= t0 && t1 > 0 ? Math.max(t0, 0) : null;
}
function rayMouth(x, y, dx, dy, m){
  if(dx * m.nx + dy * m.ny >= 0) return null;                    // it must come in against the mouth
  if(m.nx === 0){ const t = (m.y - y) / dy; if(!(t > 0.5)) return null; return Math.abs(x + dx * t - m.x) <= CATCH ? t : null; }
  const t = (m.x - x) / dx; if(!(t > 0.5)) return null;
  return Math.abs(y + dy * t - m.y) <= CATCH ? t : null;
}
function rayCircle(x, y, dx, dy, cx, cy, r){
  const fx = x - cx, fy = y - cy, b = fx * dx + fy * dy, c = fx * fx + fy * fy - r * r, d = b * b - c;
  if(d < 0) return null; const t = -b - Math.sqrt(d); return t > 0.5 ? t : null;
}
function bodies(A, p){
  const out = [];
  if(!p.dead) out.push({ kind:'knight', l:p.x - 13, r:p.x + 13, b:p.y, t:p.y + p.h, ref:p });
  const K = A.king;
  // His radiance catches the light up to the crown.
  if(K && !K.dead && K.st !== 'throne') out.push({ kind:'king', l:K.x - 42, r:K.x + 42, b:K.y, t:K.y + 200, ref:K });
  for(const e of G.enemies) if(!e.dead && e.actFoe === 'belled') out.push({ kind:'foe', l:e.x - e.w / 2, r:e.x + e.w / 2, b:e.y, t:e.y + e.h, ref:e });
  // Followers do not occlude the puzzle rays or the player's solo route to the King.
  return out;
}
function trace(A, p, src, solids, bods, mouths){
  let x = src.x, y = src.y, dx = src.tx - src.x, dy = src.ty - src.y;
  const n0 = Math.hypot(dx, dy); dx /= n0; dy /= n0;
  const segs = []; let hit = null;
  for(let hop = 0; hop < 4; hop++){
    let best = { t:3200, kind:'none' };
    for(const o of solids){
      const w = o.w || 0, t = rayRect(x, y, dx, dy, o.x - w / 2, o.x + w / 2, o.y - (o.h || 0), o.y);
      if(t != null && t > 0.5 && t < best.t) best = { t, kind:'solid', o };
    }
    if(mouths) for(const m of mouths){ const t = rayMouth(x, y, dx, dy, m); if(t != null && t <= best.t + 2) best = { t, kind:'mouth', m }; }
    for(const S of SEALS){ const t = rayCircle(x, y, dx, dy, S.x, S.y, S.r); if(t != null && t < best.t) best = { t, kind:'seal', S }; }
    for(const B of bods){ const t = rayRect(x, y, dx, dy, B.l, B.r, B.b, B.t); if(t != null && t > 0.5 && t < best.t) best = { t, kind:B.kind, ref:B.ref }; }
    segs.push({ x1:x, y1:y, x2:x + dx * best.t, y2:y + dy * best.t, dx, dy });
    if(best.kind === 'mouth'){
      const exit = mouths[0] === best.m ? mouths[1] : mouths[0];
      x = exit.x + exit.nx * 6; y = exit.y + exit.ny * 6; dx = exit.nx; dy = exit.ny;
      continue;
    }
    hit = best; break;
  }
  return { id:src.id, segs, hit, routed:segs.length > 1, dx, dy };
}
function currentShafts(A){
  const out = SHAFTS.slice();
  const K = A.king, live = A.enc.throne.st === 'live';
  if(live || (K && A.enc.throne.st === 'idle')){
    const H = HOURS[Math.min(A.hour, HOURS.length - 1)];
    H.shafts.forEach((s, i) => out.push({ id:H.id + '-' + i, x:s.x, y:WINDOW_Y, tx:s.tx, ty:0, route:!s.w }));
  }
  return out;
}
function updateBeams(A, dt, p){
  const mouths = G.cratePortals && G.cratePortals.length === 2 ? G.cratePortals : null;
  const shafts = currentShafts(A).filter(s => Math.abs(s.tx - p.x) < 2200 || Math.abs(s.x - p.x) < 2200);
  const bods = bodies(A, p);
  A.beams = [];
  let onKnight = false; A.beamSide = 0;
  for(const S of SEALS) A.lit[S.id] = Math.max(0, (A.lit[S.id] || 0) - dt * 0.5);
  for(const s of shafts){
    const solids = solidsNear(Math.min(s.x, s.tx, p.x) - 1800, Math.max(s.x, s.tx, p.x) + 1800);
    const b = trace(A, p, s, solids, bods, mouths);
    A.beams.push(b);
    const h = b.hit; if(!h) continue;
    if(h.kind === 'knight') onKnight = true;
    else if(h.kind === 'seal') lightSeal(A, h.S, dt);
    // Only light you have caught and let out again touches him: his own windows are his.
    else if(h.kind === 'king'){ if(b.routed) A.beamSide = -Math.sign(b.dx) || 0; }
    else if(h.kind === 'foe'){ const e = h.ref; e._sunT = (e._sunT || 0) + dt; if(e._sunT > 0.5){ e._sunT = 0; try{ hitEnemy(e, e.maxHp * 0.34, Math.sign(b.dx) || 1, 60, 0, 'fire', 'sun'); }catch(_e){} } }
  }
  // THE LIGHT BURNS. Not at once: long enough in it to feel it, then a measure.
  if(A.burnT > 0) A.burnT -= dt;
  const settling=A.enc.throne.st==='live' && A.king && ['rise','climb'].includes(A.king.st) && p.x>ARENA.x1;
  if(onKnight && !p.dead && !settling){
    A.heat += dt;
    if(A.heat >= HEAT && A.burnT <= 0 && !(p.invuln > 0)){
      A.burnT = BURN_CD; A.heat = 0; p.dodgeTimer = 0;
      hurtPlayer(12, -(p.face || 1), true);
      A.flash = Math.max(A.flash, 0.3); kit.burst(p.x, p.y + 30, '#ffe3a0', 12);
    }
  } else A.heat = Math.max(0, A.heat - dt * 2);
}
function lightSeal(A, S, dt){
  if(A.seals[S.id]) return;
  A.lit[S.id] = (A.lit[S.id] || 0) + dt * 1.5;
  if(A.lit[S.id] < 0.8) return;
  A.seals[S.id] = true; A.flash = Math.max(A.flash, 0.5); G.shake = Math.max(G.shake || 0, 5);
  kit.burst(S.x, S.y, '#fff1b8', 26); if(meta.soundOn) SFX.magic();
  kit.latch(ZONE, 'sunspire-' + S.id);
  if(S.bars) setBars(S.bars, false);
  if(S.id === 'sluice') openSluice(A);
}

/* ── The Aqueduct Crown: the colony's water goes home ──────────────────────── */
function openSluice(A){
  A.drainT = 0.01; A.drained = true;
  const P = kit.path();
  const line = allied(P)
    ? 'The sluice turns. The water leaves the King’s cistern the way it came — down the conduit, down the mountain, to the tents. Behind you one of the sick laughs out loud.'
    : 'The sluice turns. The water leaves the King’s cistern the way it came — down the conduit, down the mountain, to the tents. The flume ahead runs dry.';
  A.queue.push({ src:{ x:TOWER_X, y:400 }, html:'<b>THE AQUEDUCT CROWN</b><br>' + line, accent:'#9ec9d6' });
}
function updateFlume(A, dt, p){
  if(A.drainT > 0 && A.drainT < 9) A.drainT += dt;
  if(A.drained && A.drainT > 2.5) return;
  // Full, the flume runs toward you: the current carries a knight back to where the water falls.
  if(p.dead || p.x < FLUME.x1 || p.x > FLUME.x2 || p.y > -10) return;
  p.x -= 300 * dt; if(p.vx > -120) p.vx = -120;
  if(p.x < FLUME.x1 + 40) p.x = FLUME.x1 + 40;
}

/* ── The Hall of Hours: on the forsaken road the sick come in behind you ──── */
function zealot(e){ e.zealot = true; e.speed *= 1.3; e.xp = 8; return e; }
function updateHall(A, dt, p){
  const S = A.enc.hall, P = kit.path();
  if(S.st === 'done') return;
  F.recordFallen(A, S, p);
  if(S.st === 'idle'){
    if(!P.forsaken || p.x < 3600 || p.dead) return;
    S.st = 'live'; S.t = 0;
    A.tolls.push({ x:Math.max(40, p.x - 700), y:200, t:0, far:true });
    for(let i = 0; i < 3; i++){
      const x = Math.max(COURT_GATE_X + 80 + i * 60, p.x - 640 - i * 70);
      zealot(F.spawnBelled(S, { x, y:0, x1:COURT_GATE_X + 40, x2:HOUR_DOOR_X - 40, enc:'hall', slot:i, st:'arrive' }));
    }
    return;
  }
  if(!S.foes.some(e => !e.dead)){ S.st = 'done'; kit.latch(ZONE, 'sunspire-hall'); }
}

/* ── The Throne of Noon ─────────────────────────────────────────────────────
   His blade-proof radiance is the engine's portalGate: every blow is turned unless he is
   exposed, and he is exposed only while something touches him on the side away from you. */
const KING = { walk:70, reach:170, wind:0.65, swing:0.22, recover:0.6, ring:0.8, charge:0.95, flareR:200, stagger:0.8, rise:4.5, climb:6.5 };
function hourOf(blooms){ return blooms < 2 ? 0 : blooms < 4 ? 1 : 2; }
function updateThrone(A, dt, p){
  const S = A.enc.throne, K = A.king;
  if(S.st === 'done' || !K || K.dead) return;
  F.recordFallen(A, S, p);
  if(S.st === 'idle'){
    if(p.x > ARENA.x1 + 80 && p.x < ARENA.x2 && !p.dead){
      S.st = 'live'; S.t = 0; A.hour = hourOf(A.blooms);
      setBars('throne-door', true);
      K.st = 'rise'; K.t = 0; K.active = true;
      try{ clearPlacedPortals(false, 'sunspire-hour'); }catch(_e){}
      addsForHour(A, S);
    }
    return;
  }
  S.t += dt;
  // Who is touching him, and from where.
  let touch = 0;
  for(const a of A.allies.concat(A.oren.st === 'absent' ? [] : [A.oren])) if(a.st === 'touch' && Math.abs(a.x-K.x)<90) touch = a.side;
  A.touch = touch;
  const side = touch || A.beamSide, you = Math.sign(p.x - K.x) || 1;
  const open = !!side && you === -side && !['rise', 'ring', 'stagger', 'climb', 'yield', 'throne'].includes(K.st);
  K.exposeT = open ? 0.12 : 0; K.touchSide = side; K.open = open;
  K.hp = Math.max(1, K.maxHp * (1 - A.blooms / BLOOMS));
}
function addsForHour(A, S){
  if(!kit.path().forsaken) return;
  for(let i = 0; i < 2; i++){
    const x = ARENA.x1 + 60 + i * 70;
    zealot(F.spawnBelled(S, { x, y:0, x1:ARENA.x1 + 10, x2:ARENA.x2 - 10, enc:'throne', slot:i, st:'arrive' }));
  }
}
function updateKing(K, p, dt){
  const A = G.actTwo, S = A.enc.throne;
  K.t += dt; K.walking = false;
  if(K.flowerT > 0) K.flowerT -= dt;
  if(K.st === 'throne' || K.st === 'yield'){ K.x = K.st === 'throne' ? THRONE.x : K.x; K.face = -1; return; }
  if(S.st !== 'live') return;
  const dx = p.x - K.x, adx = Math.abs(dx), toward = Math.sign(dx) || K.face, hour = A.hour;
  K.cd -= dt; K.blinkCd -= dt; K.flareCd -= dt;
  switch(K.st){
    case 'rise': if(K.t > KING.rise){ K.st = 'walk'; K.t = 0; } break;
    case 'climb':
      // THE SUN CLIMBS. He goes back to the throne and lifts his arms to it; the windows move.
      if(!K._climbed && K.t > 0.3){ K._climbed = true; kit.burst(K.x, K.y + 70, '#fff1b8', 14); K.x = THRONE.x - 70; K.face = -1; kit.burst(K.x, K.y + 70, '#fff1b8', 18); }
      if(K.t >= KING.climb){ K.st = 'walk'; K.t = 0; K._climbed = false; K.blinkCd = 4; K.cd = 0.6; }
      break;
    case 'walk':
      K.face = toward;
      if(adx > 140){ K.x += toward * (KING.walk + hour * 18) * dt; K.walking = true; }
      if(K.blinkCd <= 0 && !p.dead){
        K.st = 'ring'; K.t = 0;
        K.ringX = Math.max(ARENA.x1 + 60, Math.min(ARENA.x2 - 60, p.x + toward * 190));
      } else if(hour >= 1 && K.flareCd <= 0){ K.st = 'charge'; K.t = 0; }
      else if(adx < 160 && K.cd <= 0){ K.st = 'wind'; K.t = 0; }
      break;
    case 'wind': if(K.t >= KING.wind - hour * 0.08){ K.st = 'swing'; K.t = 0; K.hit = false; if(meta.soundOn) SFX.slash(); } break;
    case 'swing':
      if(!K.hit && !p.dead){
        const fwd = (p.x - K.x) * K.face;
        if(fwd > -20 && fwd < KING.reach && p.y < K.y + 170 && p.y + p.h > K.y + 10){ K.hit = true; F.strike(K, p); if(!p.dead) p.vx = K.face * 380; }
      }
      if(K.t >= KING.swing){ K.st = 'recover'; K.t = 0; }
      break;
    case 'recover': if(K.t >= KING.recover){ K.st = 'walk'; K.t = 0; K.cd = 1.1 - hour * 0.15; } break;
    case 'ring':
      // HIS BLINK. A ring of light on the floor, behind you; then he is standing in it.
      if(K.t >= KING.ring){
        kit.burst(K.x, K.y + 70, '#fff1b8', 14);
        K.x = K.ringX; K.face = Math.sign(p.x - K.x) || -K.face;
        kit.burst(K.x, K.y + 70, '#fff1b8', 18); if(meta.soundOn) SFX.magic();
        K.st = 'wind'; K.t = 0; K.blinkCd = [8.5, 7, 5.5][hour];
        for(const a of A.allies.concat([A.oren])) if(a.st === 'touch'){ a.st = 'back'; a.t = 0; }
      }
      break;
    case 'charge':
      if(K.t >= KING.charge){
        // THE FLARE. Everything near him is thrown back; a knight in it burns.
        K.st = 'recover'; K.t = 0; K.flareCd = [99, 9, 7][hour];
        A.flash = Math.max(A.flash, 0.45); G.shake = Math.max(G.shake || 0, 6);
        kit.burst(K.x, K.y + 70, '#fff1b8', 30);
        const cx = p.x - K.x, cy = p.y + 22 - (K.y + 75);
        if(!p.dead && Math.hypot(cx, cy) < KING.flareR && !(p.dodgeTimer > 0)){ hurtPlayer(K.dmg, Math.sign(cx) || 1, true); p.vx = (Math.sign(cx) || 1) * 420; p.vy = 260; }
        for(const a of A.allies.concat([A.oren])) if(a.st !== 'absent' && Math.abs(a.x - K.x) < KING.flareR){ a.st = 'down'; a.t = 0; }
      }
      break;
    case 'stagger':
      if(K.t >= KING.stagger){
        K.st = 'walk'; K.t = 0; K.cd = 0.8;
        // He throws the light off: you are pushed back, not hurt.
        if(!p.dead && Math.abs(p.x - K.x) < 260){ p.vx = (Math.sign(p.x - K.x) || 1) * 460; p.vy = 240; }
        for(const a of A.allies.concat([A.oren])) if(a.st === 'touch'){ a.st = 'back'; a.t = 0; }
      }
      break;
  }
  K.x = Math.max(ARENA.x1 + 50, Math.min(ARENA.x2 - 50, K.x));
}
/* A blow that lands while he is open is a bloom: a white flower opens on his gold. */
function swing(p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  const K = A.king; if(!K || K.dead || A.enc.throne.st !== 'live' || !K.open) return;
  if(!p.swingHits || p.swingHits.indexOf(K) < 0 || K._bloomSwing === p.swingHits) return;
  K._bloomSwing = p.swingHits;
  bloom(A, K, p);
}
function flowersFor(n){
  return Array.from({length:n},(_,i)=>({side:i%2?1:-1,h:38+(i*19)%90,s:'sun'}));
}
function bloom(A, K, p){
  A.blooms++; K.flowerT = 1.2; K.flowers = (K.flowers || []);
  K.flowers.push({ side:K.touchSide || 1, h:30 + Math.random() * 100, s:A.touch ? 'hand' : 'sun' });
  A.flash = Math.max(A.flash, 0.4); G.shake = Math.max(G.shake || 0, 7); G.hitstop = Math.max(G.hitstop || 0, 0.1);
  kit.burst(K.x, K.y + 90, '#f4f1e6', 24); if(meta.soundOn) SFX.hit();
  K.hp = Math.max(1, K.maxHp * (1 - A.blooms / BLOOMS));
  if(A.blooms >= BLOOMS){ yieldKing(A, K, p); return; }
  K.st = 'stagger'; K.t = 0;
  const h = hourOf(A.blooms);
  if(h !== A.hour){
    // THE SUN CLIMBS. The shafts move; the mouths you set are lost in the glare; he goes back to
    // the throne for it, and that is the time you have to catch the new light.
    A.hour = h; A.stingerT = 3; A.flash = Math.max(A.flash, 0.7); K.st = 'climb';
    kit.latch(ZONE, h === 1 ? 'sunspire-morning' : 'sunspire-noon');
    for(const a of companions(A)) if(a.st === 'touch' || a.st === 'reach'){ a.st = 'back'; a.t = 0; }
    try{ clearPlacedPortals(false, 'sunspire-hour'); }catch(_e){}
    addsForHour(A, A.enc.throne);
  }
}
function yieldKing(A, K, p){
  const S = A.enc.throne;
  S.st = 'done'; K.st = 'yield'; K.t = 0; K.active = false; K.exposeT = 0; K.hp = 1;
  kit.latch(ZONE, 'sunspire-king');
  for(const e of S.foes) if(!e.dead && e !== K){ e.st = 'sit'; e.t = 0; e.yielded = true; }
  setBars('throne-door', false); setBars('sea-door', false);
  try{ clearPlacedPortals(false, 'sunspire-king'); }catch(_e){}
  try{ activateRuntimeCheckpoint(ZONE + ':throne', { x:THRONE.x - 200, y:0 }, 'checkpoint', null, true); }catch(_e){}
  A.hydra = { st:'below', t:0 };
  const P = kit.path();
  A.queue.push({ src:K, accent:'#e8d6a0', html:'<b>THE KING</b><br>He does not run. He sits down on the step of the throne and takes off the glove; the hand under it is all flowers. “Every dial in this house says a quarter to four,” he says. “I had them cut that way. I wanted it to be morning a little longer.”' });
  if(A.oren.st !== 'absent') A.queue.push({ src:A.oren, accent:'#d59a68', html:allied(P)
    ? '<b>OREN</b><br>The sick come and sit on the steps around him, the way they sat around the well. Oren puts his hammer down. “Leave him the sun. It’s all he has left.”'
    : '<b>OREN</b><br>“He’ll not run this time.” Oren looks up at the windows. “There’s nowhere higher to run.”' });
  else if(P.forsaken) A.queue.push({ src:K, accent:'#e8d6a0', html:'<b>THE THRONE OF NOON</b><br>The sick who fought for him put their cups down and sit on the steps beside him. None of them looks at you.' });
}
function afterDeath(A, p){
  // A knight who falls in the Throne of Noon comes back to its door; the hour he reached holds.
  const S = A.enc.throne, K = A.king;
  if(S.st !== 'live' || !K) return;
  S.st = 'idle'; A.blooms = A.hour * 2;
  K.st = 'throne'; K.t = 0; K.x = THRONE.x; K.active = false; K.exposeT = 0; K.open = false;
  K.flowers=flowersFor(A.blooms); K.cd=1; K.blinkCd=7; K.flareCd=9; K._climbed=false;
  A.heat=0; A.beamSide=0; A.touch=0;
  setBars('throne-door', false);
  for(const e of S.foes) if(e !== K && !e.dead){ e.dead = true; e.hp = 0; e.fled = true; }
  S.foes = [K];
  for(const a of A.allies) { a.st = 'follow'; a.x = p.x - 100 - a.i * 40; }
  if(A.oren.st !== 'absent'){ A.oren.st = 'follow'; A.oren.x = p.x - 60; }
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'dayking'){ updateKing(e, p, dt); return; }
  const S = A.enc[e.enc]; if(!S) return;
  F.update(e, p, dt, A, S);
}

/* ── The sick at your side ──────────────────────────────────────────────────
   Out of the fight they follow. In it, one at a time, they go round to his far side and lay a
   hand on his back — a white flower opens under it — until he throws them off. */
function companions(A){ return A.allies.concat(A.oren.st === 'absent' ? [] : [A.oren]); }
function updateAllies(A, dt, p){
  const S = A.enc.throne, K = A.king, fight = S.st === 'live' && K && !['rise', 'throne', 'yield', 'climb'].includes(K.st);
  const all = companions(A);
  A.touchCd = (A.touchCd || 1.5) - dt;
  if(fight && A.touchCd <= 0 && !all.some(a => a.st === 'reach' || a.st === 'touch')){
    const free = all.filter(a => a.st === 'follow' || a.st === 'back');
    if(free.length){ const a = free[Math.floor(A.t * 7) % free.length]; a.st = 'reach'; a.t = 0; a.side=-(Math.sign(p.x-K.x)||1); }
    A.touchCd = 4.2;
  }
  for(const a of A.allies) moveCompanion(A, a, dt, p, K, fight, 110 + a.i * 45);
}
function moveCompanion(A, a, dt, p, K, fight, gap){
  a.t += dt;
  if(a.st === 'down'){ if(a.t > 1.6){ a.st = 'back'; a.t = 0; } return; }
  if(fight && (a.st === 'reach' || a.st === 'touch')){
    const side = a.side || -(Math.sign(p.x - K.x) || 1), tx = K.x + side * 52, dx = tx - a.x;
    if(a.st === 'reach'){
      if(Math.abs(dx)>14 && a.t>=5){ a.st='back';a.t=0;return; }
      if(Math.abs(dx) > 14){ a.vx = Math.sign(dx) * 240; a.x += a.vx * dt; a.face = Math.sign(dx); }
      else { a.st = 'touch'; a.t = 0; a.side = side; a.face = -side; K.flowerT = 0.6; }
    } else {
      a.x = tx; a.side = side; a.face = -side; a.vx = 0;
      if(a.t > 1.8){ a.st = 'back'; a.t = 0; }
    }
    a.y = groundAt(a.x); return;
  }
  if(!fight && (a.st === 'reach' || a.st === 'touch')) a.st = 'follow';
  if(a.st === 'back' && a.t > 1.2) a.st = 'follow';
  const want = fight ? (Math.sign(p.x - K.x) >= 0 ? p.x + 90 + (a.i || 0) * 40 : p.x - 90 - (a.i || 0) * 40) : p.x - (p.face || 1) * gap, dx = want - a.x;
  if(Math.abs(p.x - a.x) > 900){ a.x = want; a.vx = 0; }
  else if(Math.abs(dx) > 18){ a.vx = Math.sign(dx) * Math.min(230, Math.abs(dx) * 3); a.x += a.vx * dt; a.face = Math.sign(dx); }
  else a.vx = 0;
  if(a.x > FLUME.x1 - 20 && a.x < FLUME.x2 + 20 && !(A.drained && A.drainT > 2.5)) a.x = Math.min(a.x, FLUME.x1 - 30);
  a.x = Math.min(a.x, (A.enc.throne.st === 'done' ? TERRACE.x2 - 60 : SEA_DOOR_X - 40));
  a.y = groundAt(a.x);
}
function updateOren(A, dt, p){
  const O = A.oren; if(O.st === 'absent') return;
  const K = A.king, fight = A.enc.throne.st === 'live' && K && !['rise', 'throne', 'yield', 'climb'].includes(K.st);
  if(fight || O.st === 'down' || O.st === 'back'){ O.i = 3; moveCompanion(A, O, dt, p, K, fight, 60); return; }
  O.st = 'follow'; kit.follow(O, p, dt); O.y = groundAt(O.x);
  if(O.x > FLUME.x1 - 20 && O.x < FLUME.x2 + 20 && !(A.drained && A.drainT > 2.5)) O.x = Math.min(O.x, FLUME.x1 - 30);
}

/* ── The sea terrace: the hydra comes, and does not strike ─────────────────── */
function updateHydra(A, dt, p){
  const H = A.hydra; if(!H) return;
  H.t += dt;
  if(H.st === 'below'){
    if(p.x > TERRACE.x1 + 300 && !p.dead){ H.st = 'rise'; H.t = 0; G.shake = Math.max(G.shake || 0, 10); A.flash = Math.max(A.flash, 0.3); }
    return;
  }
  if(H.st === 'rise' && H.t > 3.2){
    H.st = 'speak'; H.t = 0;
    const src = { x:TERRACE.edge + 60, y:260 };
    A.queue.push({ src, accent:'#7fc3b4', html:'<b>THE HYDRA</b><br>It comes up over the balustrade, all three heads, the broken chains still hanging from their collars. It does not strike. The middle head lowers until one eye is level with yours.' });
    A.queue.push({ src, accent:'#7fc3b4', html:'<b>THE TIDE HEAD</b><br>“You broke our chains, little knight. We don’t forget a thing like that. So we came to tell you.”' });
    A.queue.push({ src, accent:'#7fc3b4', html:'<b>THE STORM HEAD</b><br>“The one you left on the beach did not stay on the beach. It’s walking back along every road you took, and it hasn’t stopped once.”' });
    A.queue.push({ src, accent:'#7fc3b4', html:'<b>THE BITE HEAD</b><br>“Everywhere it goes, the fights you won start again. What you beat gets back up. Enough talk. Climb on. We’ll carry you back to the island.”',
      then:(A2s) => { const o = G.obstacles.find(q => q.actId === 'hydra'); if(o) o.actMute = false; A2s.hydra.st = 'wait'; } });
  }
}
function interact(o){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return false;
  if(o.actId === 'servant'){
    kit.say(o, '<b>A SERVANT IN A GOLD MASK</b><br>Under the mask the bandage, and white petals in the bandage. She does not stop scrubbing the fountain’s gold. “The gardens must be green by first light, sir. The King says it’s always first light.”', [
      ['Whose water is this?', '“The King’s, sir.” Then, quieter: “It came up the pipe from the tents. You can taste the tents in it.”'],
      ['Why the mask?', '“So he doesn’t have to see our faces, sir. The gold’s for him. Not for us.”'],
      ['Where is he?', '“On the Throne of Noon, sir, past the Crown. The doors only open for the sun.”'],
    ], '#e8d6a0');
    return true;
  }
  if(o.actId === 'hydra' && !o.actMute && A.hydra && A.hydra.st === 'wait'){
    o.actMute = true; beginRide(A);
    return true;
  }
  return false;
}
function beginRide(A){
  A.board = {t:0,fx:G.p.x,fy:G.p.y,x:G.p.x,y:G.p.y}; A.hydra.st = 'board';
  const p = G.p; p.vx = 0; p.vy = 0; p.invuln = 99;
  try{ showGameUI(false); }catch(_e){}                                     // a cinematic: no HUD
  try{ commitStageCompletion(); }catch(_e){}
  try{ recordWorldClear(); }catch(_e){}
  try{ recordSessionClear(STAGE); }catch(_e){}
}
function updateBoard(A,dt,p){
  const B=A.board;B.t+=dt;
  const walk=Math.min(1,B.t/.7), jump=Math.max(0,Math.min(1,(B.t-.7)/.9));
  B.x=B.fx+(TERRACE.edge-70-B.fx)*walk+64*jump;
  B.y=B.fy*(1-walk)+88*jump+Math.sin(jump*Math.PI)*55;
  p.x=B.x;p.y=B.y;p.face=1;p.vx=0;p.vy=0;p.invuln=99;p.actHook=null;
  if(B.t>=1.8){A.board=null;A.ride={t:0};A.hydra.st='ride';}
}
function updateRide(A, dt, p){
  const R = A.ride; R.t += dt;
  p.x = TERRACE.edge - 30; p.y = 0; p.vx = 0; p.vy = 0; p.invuln = 99;
  if(R.t > 13 && !A.over){ A.over = true; endOfAct(); }
}
function endOfAct(){
  if(G.coopSession&&coopActive())G.actTwo.ride=null;
  if(typeof coopFinishTogether==='function'&&!coopFinishTogether('act-two-end',endOfAct))return;
  meta.actTwoDone = true; try{ persist(); }catch(_e){}
  const P = kit.path();
  const line = allied(P) ? 'Behind you the Sunspire is only a gold point on the mountain, and the water is running down to the tents.'
    : P.forsaken ? 'Behind you the Sunspire is only a gold point on the mountain. You did not look back at the steps.'
    : 'Behind you the Sunspire is only a gold point on the mountain.';
  mode = 'win'; showGameUI(false);
  showOvHTML(`<div class="card">
    <p class="ovsub" style="letter-spacing:.34em;margin:0 0 6px;">END OF ACT TWO</p>
    <h1 class="title" style="margin:0 0 4px;">ACT THREE</h1>
    <p class="subtitle" style="margin:0 0 18px;">The Echoes</p>
    <p class="hint" style="margin:0 0 20px;">${line} The hydra swims for the island, and somewhere on it something that looks like you is a beat late in every mirror.<br>It left a piece of itself in every road you walked: find the rift shards, and the echoes will open.</p>
    <button class="bigbtn" id="actThreeGo">Continue</button></div>`);
  // Act Three: Continue shows the rift shards — what you hold, and what is still out there.
  const b = document.getElementById('actThreeGo');
  if(b) b.onclick = () => root.BladefallRiftShards ? root.BladefallRiftShards.showLedger(titleScreen, true) : titleScreen();
}

/* ── Leaving and arriving ───────────────────────────────────────────────────── */
function seamSpec(){
  const p = G.p;
  if(p.x > 1600) return null;
  return { connector:'path-sunspire', zone:ZONE, targetStage:BACK, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
}
function arrival(plan){
  return plan && plan.connectorId === 'path-sunspire' && plan.targetZoneId === ZONE ? { x:SPAWN.x, y:SPAWN.y } : null;
}
function voidFloor(p){ return p && p.x > FLUME.x1 - 20 && p.x < FLUME.x2 + 20 ? -300 : -48; }
function cameraFloor(p){ if(!p) return null; return Math.min(groundAt(p.x), Math.max(0, p.y)); }

const CHECKPOINTS = [
  { id:'court-gate', x:COURT_GATE_X + 90, when:(p) => p.x > COURT_GATE_X + 40 && p.x < COURT_GATE_X + 200 },
  { id:'hour-door', x:HOUR_DOOR_X + 90, when:(p) => p.x > HOUR_DOOR_X + 40 && p.x < HOUR_DOOR_X + 200 },
  { id:'flume', x:FLUME.x2 + 60, when:(p) => p.x > FLUME.x2 + 20 && p.x < THRONE_DOOR_X - 10 },
  { id:'terrace', x:SEA_DOOR_X + 90, when:(p) => p.x > SEA_DOOR_X + 40 && p.x < SEA_DOOR_X + 200 },
];
function updateCheckpoints(A, p){
  if(!p.onGround || p.dead || Math.abs(p.y) > 4) return;
  for(const c of CHECKPOINTS) if(!A.checkpoints[c.id] && c.when(p)){
    A.checkpoints[c.id] = true;
    try{ activateRuntimeCheckpoint(ZONE + ':' + c.id, { x:c.x, y:0 }, 'checkpoint', null, true); }catch(_e){}
  }
}

function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  if(A.board || A.ride) return CUES.ride;
  if(A.hydra && A.hydra.st !== 'below') return CUES.hydra;
  if(A.enc.throne.st === 'live') return CUES.king;
  return null;
}

A2.register(STAGE, Object.freeze({
  level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue,
}));
root.BladefallSunspire = Object.freeze({
  STAGE, ZONE, groundAt, trace:(src, solids, bods, mouths) => trace(null, null, src, solids, bods || [], mouths || null),
  rayMouth, constants:Object.freeze({ LEN, SPAWN, COURT_GATE_X, HOUR_DOOR_X, TOWER_X, THRONE_DOOR_X, SEA_DOOR_X, FLUME, ARENA, THRONE,
    TERRACE, SLABS, PANELS, SEALS, RING, SHAFTS, HOURS, WINDOW_Y, BLOOMS, HEAT, CATCH, KING }),
});
})(typeof window !== 'undefined' ? window : globalThis);
