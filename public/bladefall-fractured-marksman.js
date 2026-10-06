/* Bladefall — ACT THREE · The Fractured Marksman (stage 24), 2026-09-24.

   The fifth echo: Marksman Road after the Echo walked it backwards. Night; the watch is still
   up, and something at the end of the road is keeping count of you. The kit is the one the road
   was entered with: jump, the Oathblade, the dash, and ONE linked mouth (set on slate with the
   portal key; it pairs with the fixed orange anchor nearby). The Muster applies.

   The watch: archers on perches you cannot reach. Each one sees you when no mantlet stands
   between you, draws (a sightline follows you, then LOCKS), and looses one arrow at the locked
   point. A mantlet stops an arrow; a dash passes through one. An arrow sent back through your mouth
   and out of an anchor kills the archer it reaches, and strikes the hardware it was aimed at.

     THE SHOTFALL — pits between the mantlets, one watch at the far tower: cross between its shots.
     THE WATCHING ROAD — the slick tower: set your mouth on the slate, step in, out on the anchor.
     THE MANTLET WORKS — the works gate opens only to its own watch's arrow, sent back: stand on the
       slate where it can see you, set the mouth, let it draw, step off.
     THE WINDCUT — height into reach: fall from the perch into your mouth and leave the anchor fast.
     THE TALLY COURT (the C-side) — the Tallyman, the Marksman's echo. It counts: I is one arrow,
       II three, and III — the Reckoning — a slow marked shot aimed at your feet, that follows you
       and then locks. Stand with your mouth between you and it, and the Reckoning goes in, out of
       the tally post and home: off its perch it comes, and you have until it climbs back to cut a
       tally with the blade. Three tallies. */
(function installFracturedMarksman(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 24, ZONE = 'fractured-marksman', SOURCE = 4;
const LEN = 10800;
const SPAWN = { x:140, y:0 };

/* ── Geometry (world units; y up; the floor is y 0; below it the void) ──────── */
const GROUND = [ [0, 800], [900, 1250], [1350, 1700], [1800, 3620], [4300, 7700], [8950, LEN] ];
const LEDGES = [                                     // [x, w, y]
  [3875, 250, 320],                                  // the anchor's ledge beyond the slick tower
  [4150, 160, 160],                                  // down to the works
  [7260, 120, 60], [7120, 120, 120], [7260, 120, 180], [7120, 120, 240], [7260, 120, 300], [7120, 120, 360],
  [7260, 120, 420], [7400, 160, 480],               // the Windcut climb, a jump at a time, to the perch
  [8400, 300, 300], [8750, 200, 150],                // the Windcut landing, and down to the court
  [10150, 120, 420],                                 // the Tallyman's perch (out of every reach)
];
/* Cover on the road: arrows stop on them, sightlines too. 64 high — one jump clears them (78) —
   so a mantlet is somewhere to stand behind, never a wall. */
const MANTLETS = [                                   // [x, h, w]
  [520, 64, 40], [1075, 64, 40], [1525, 64, 40], [2050, 64, 40],   // the Shotfall: one to each stretch between the pits
  [2750, 64, 40], [3150, 64, 40],                    // the watching road, short of the slate
  [5450, 64, 40],
  [9560, 64, 36], [9980, 64, 36],
];
const SLICK = { x:3650, h:700, w:60 };               // the slick tower wall on the watching road
/* The Windcut's anchor tower: a jump and two dashes off the perch land as far as the launch does
   (measured 8275–8310), so the tower stands between them — the mouth is the only way through it. */
const WINDCUT_TOWER = { x:7728, h:900, w:50 };
const SLATES = [ [3350, 200], [5750, 200], [7560, 140], [9700, 150], [9880, 120] ];
/* A mouth pairs with an anchor only while YOU are inside the anchor's range (the engine's rule): each
   slate sits well inside its anchor's range, and no slate is inside two. */
const ANCHORS = [                                    // x, y, dir, range — each alone in its envelope
  { id:'road', x:3875, y:320, dir:'floor', range:800 },
  { id:'works', x:6400, y:240, dir:'wallR', range:1000 },
  { id:'windcut', x:7760, y:560, dir:'wallR', range:450 },
  { id:'tally', x:9440, y:440, dir:'wallR', range:800 },
];
const TARGET = { x:6700, y:240, bars:'works-gate' };
const BARS = [ { id:'works-gate', x:6900, h:760, open:false }, { id:'court-west', x:9000, h:760, open:true },
  { id:'court-east', x:10350, h:760, open:false } ];
const WATCHES = [                                    // perches, range, tell (s), cooldown (s)
  { id:'tower', perches:[[2350, 240], [2470, 300]], range:1450, tell:.75, cd:1.6 },
  { id:'works', perches:[[6150, 470], [6000, 530]], range:1250, tell:.8, cd:1.8 },
  { id:'gallery', perches:[[8520, 640], [8300, 700]], range:1100, tell:.8, cd:2.2 },
];
const COURT = { x1:9000, x2:10350, perch:{ x:10150, y:420 }, floorX:10150 };
/* The Tallyman's count, by how many tallies it has lost. Tells (s): a single 0.7; the brace (three
   arrows) 0.9; the Reckoning follows you for 1.0 and holds its aim 0.5 more before it looses. */
const T = {
  counts:[ ['single', 'single', 'reckon'], ['single', 'brace', 'reckon'], ['brace', 'single', 'brace', 'reckon'] ],
  tell:{ single:.7, brace:.9, reckon:1.5 }, lock:{ single:.75, brace:.8, reckon:1.0 },
  speed:{ single:700, brace:620, reckon:470 }, recover:[.8, .7, .6], spread:.12,
  down:2.6, climb:1.0, fall:.45, hitR:44,
};
const CHECKPOINTS = [ { id:'shotfall', x:1900 }, { id:'road', x:3875, y:320 }, { id:'works', x:4700 }, { id:'windcut', x:7050 },
  { id:'court', x:9100 }, { id:'gate', x:10500 } ];
function groundAt(x){ for(const g of GROUND) if(x >= g[0] && x < g[1]) return 0; return null; }
const CUES = Object.freeze({
  court:Object.freeze({ id:'fractured-tallyman', src:'./audio/music/the-wayfarers-hearth.mp3', title:'The Wayfarer’s Hearth',
    artist:'Aerth score', mood:'the Tally Court: it is counting' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function buildLevel(){
  const objects = [];
  GROUND.forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'road' })));
  LEDGES.forEach(l => objects.push(Object.assign(Pl(l[0], l[1], l[2]), { h:30, actArt:'scaffold' })));
  MANTLETS.forEach(m => objects.push(Object.assign(Wl(m[0], m[1], m[1], m[2]), { actArt:'mantlet', fmMantlet:1, noCling:1 })));
  objects.push(Object.assign(Wl(SLICK.x, SLICK.h, SLICK.h, SLICK.w), { actArt:'tower', slickL:1, slickR:1, noCling:1 }));
  objects.push(Object.assign(Wl(WINDCUT_TOWER.x, WINDCUT_TOWER.h, WINDCUT_TOWER.h, WINDCUT_TOWER.w), { actArt:'tower', slickL:1, slickR:1, noCling:1 }));
  SLATES.forEach(s => objects.push(Object.assign(Slate(s[0], s[1], 0), { actArt:'slate' })));
  ANCHORS.forEach(a => objects.push(Anchor(a.x, a.y, a.dir, { anchorRange:a.range, fmAnchor:a.id })));
  objects.push({ type:'actTarget', x:TARGET.x, y:TARGET.y, w:44, h:44, bars:TARGET.bars });
  BARS.forEach(b => objects.push({ type:'wall', x:b.x, y:b.h, h:b.h, w:30, noCling:1, actArt:'bars', actBars:b.id, gone:b.open }));
  objects.push({ type:'actPost', x:ANCHORS[3].x - 14, y:0, w:20, h:520 });
  objects.push({ type:'actTower', x:SLICK.x, y:0, w:SLICK.w, h:SLICK.h });
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:260, y:0, w:40, h:20, restSiteAnchor:'watch-embers' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'grunt', x:1500, patrol:[1360, 1690], noDrop:true },
      { t:'shieldbearer', x:2900, patrol:[2650, 3200], noDrop:true },
      { t:'outrider', x:4800, patrol:[4500, 5100], noDrop:true },
      { t:'grunt', x:6600, patrol:[6450, 6850], noDrop:true },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  const tallies = [0, 1, 2].filter(i => done(c, 'fm-tally-' + i)).length;
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    gateOpen:done(c, 'fm-works'), tallies, freed:done(c, 'fm-tallyman'), fight:false, over:false, sparks:[] };
  // The road's kit: jump, blade, dash — and one mouth.
  F.setKit(['jump', 'weapon', 'dash', 'portal-single']);
  const A = G.actTwo;
  setBars('works-gate', A.gateOpen);
  setBars('court-east', A.freed);
}
function firstFrame(A){
  F.muster();
  for(const w of WATCHES) spawnWatch(w);
  spawnTallyman(A); // Keep the yielded figure and its cut board after reload.
}
function spawnWatch(w){
  const e = spawnEnemy('gargoyle', w.perches[0][0]);
  Object.assign(e, { actFoe:'watch', watchId:w.id, perches:w.perches, pi:0, range:w.range, tell:w.tell, cd:w.cd,
    x:w.perches[0][0], y:w.perches[0][1], baseY:w.perches[0][1], w:30, h:46, st:'idle', t:0, cool:.6, face:-1,
    active:true, noDrop:true, boss:false, portalGate:'reflect', reflectBanks:1, maxHp:40, hp:40, noticeRange:1 });
}
function spawnTallyman(A){
  const e = spawnEnemy('grunt', COURT.perch.x);
  Object.assign(e, { actFoe:'tallyman', x:COURT.perch.x, y:COURT.perch.y, baseY:COURT.perch.y, w:34, h:74, st:'wait', t:0,
    move:0, count:0, face:-1, active:true, noDrop:true, boss:false, portalGate:'tally-never', maxHp:9999, hp:9999, noticeRange:1 });
  if(A.freed) Object.assign(e, { st:'kneel', y:0, baseY:0, exposeT:0 });
  A.tallyman = e;
}
function setBars(id, open){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === open) return; b.gone = open; b.moveT = 0.5;
}

/* ── Sightlines and cover ─────────────────────────────────────────────────── */
function mantlets(){ return G.obstacles.filter(o => o.fmMantlet || o.actArt === 'tower'); }
function segHitsRect(x0, y0, x1, y1, r){
  // Liang–Barsky against the wall's box (y top, h downwards)
  const L = r.x - r.w / 2, R = r.x + r.w / 2, B = r.y - r.h, Tp = r.y;
  let t0 = 0, t1 = 1; const dx = x1 - x0, dy = y1 - y0;
  for(const [p, q] of [[-dx, x0 - L], [dx, R - x0], [-dy, y0 - B], [dy, Tp - y0]]){
    if(p === 0){ if(q < 0) return false; continue; }
    const t = q / p; if(p < 0){ if(t > t1) return false; if(t > t0) t0 = t; } else { if(t < t0) return false; if(t < t1) t1 = t; }
  }
  return true;
}
function sees(e, p){
  if(p.dead || Math.abs(p.x - e.x) > e.range) return false;
  const tx = p.x, ty = p.y + 24;
  return !mantlets().some(m => !m.gone && segHitsRect(e.x, e.y + 30, tx, ty, m));
}
/* A mantlet (or the tower) stops an unreturned arrow. */
function cover(A){
  const walls = mantlets();
  for(const pr of G.projectiles){
    if(pr.owner !== 'enemy' || pr.reflected || pr.life <= 0) continue;
    for(const m of walls){
      if(m.gone || Math.abs(pr.x - m.x) > m.w / 2 + (pr.size || 5) || pr.y > m.y + 4 || pr.y < m.y - m.h - 4) continue;
      pr.life = 0; kit.burst(pr.x, pr.y, '#c9a870', 6);
      try{ if(meta.soundOn) SFX.hit(); }catch(_e){}
      break;
    }
  }
}
function shotOrigin(e){ return { x:e.x + 10 * (e.face || -1), y:e.y + 34 }; }
function shotCount(kind){ return kind === 'reckon' ? 3 : kind === 'brace' ? 2 : 1; }
function clearTallyArrows(){
  for(const pr of G.projectiles) if(pr.sourceType === 'fm-tallyman') pr.life = 0;
}
function loose(e, tx, ty, speed, extra){
  const origin = shotOrigin(e), ox = origin.x, oy = origin.y, dx = tx - ox, dy = ty - oy, m = Math.hypot(dx, dy) || 1;
  const pr = Object.assign({ owner:'enemy', sourceType:'fm-' + e.actFoe, x:ox, y:oy, vx:dx / m * speed, vy:dy / m * speed, gravity:0,
    size:5, color:'#e6d28a', shape:'arrow', glow:1, dmg:12, kb:120, pierce:0, el:null, life:4.8, hitSet:[], fmArrow:1 }, extra || {});
  G.projectiles.push(pr);
  try{ if(meta.soundOn) SFX.shoot(); }catch(_e){}
  return pr;
}

/* An archer leads you by the whole of its arrow's flight: walk on at the same pace and it finds
   you. Break your pace after it locks — stop, turn, jump, dash — and it looses at where you were going. */
function lead(e, p, speed, rest){ return Math.min(2.2, Math.hypot(p.x - e.x, p.y + 22 - (e.y + 34)) / speed + Math.max(0, rest)); }

/* ── The watch ─────────────────────────────────────────────────────────────── */
function updateWatch(e, p, dt){
  if(e.dead || p.dead) return;
  e.face = Math.sign(p.x - e.x) || e.face;
  e.t += dt;
  if(e.st === 'move'){
    const q = Math.min(1, e.t / .6), s = q * q * (3 - 2 * q);
    e.x = e.mx0 + (e.mx1 - e.mx0) * s; e.y = e.my0 + (e.my1 - e.my0) * s; e.baseY = e.y;
    if(q >= 1){ e.st = 'idle'; e.t = 0; }
    return;
  }
  if(e.st === 'idle'){
    e.cool = Math.max(0, e.cool - dt);
    if(e.cool <= 0 && sees(e, p)){ e.st = 'aim'; e.t = 0; e.aimX = null; e.locked = false; }
    return;
  }
  if(e.st === 'aim'){
    if(e.t < e.tell * .72){ const k = lead(e, p, 600, e.tell - e.t); e.aimX = p.x + (p.vx || 0) * k; e.aimY = p.y + 22; }
    e.locked = e.t >= e.tell * .72;
    if(e.t >= e.tell){
      loose(e, e.aimX, e.aimY, 600, { fmWatch:e.watchId });
      const next = e.perches[(e.pi = (e.pi + 1) % e.perches.length)];
      Object.assign(e, { st:'move', t:0, mx0:e.x, my0:e.y, mx1:next[0], my1:next[1], cool:e.cd, locked:false });
    }
  }
}

/* ── The Tallyman ──────────────────────────────────────────────────────────── */
function tier(A){ return Math.min(2, A.tallies); }
function updateTallyman(A, e, p, dt){
  if(e.dead || p.dead) return;
  e.t += dt;
  const ph = tier(A), seq = T.counts[ph];
  switch(e.st){
    case 'wait':
      if(p.x > COURT.x1 + 120 && !p.dead){ e.st = 'recover'; e.t = 0; e.move = 0; A.fight = true; setBars('court-west', false);
        kit.say(e, '<b>THE TALLYMAN</b><br>It turns a mask with no face toward you and draws a line on the board at its back. Then another. It is counting.', null, '#e8dcc0'); }
      return;
    case 'recover':
      if(e.t >= T.recover[ph]){ e.kind = seq[e.move % seq.length]; e.st = 'draw'; e.t = 0; e.count = shotCount(e.kind); e.aimX = null; e.locked = false; }
      return;
    case 'draw': {
      const tell = T.tell[e.kind], lockT = e.kind === 'reckon' ? T.lock.reckon : tell * T.lock[e.kind];
      e.face = Math.sign(p.x - e.x) || -1;
      // The Reckoning is aimed at your FEET: its line meets the floor where you stand, so a mouth set
      // just in front of you — between you and it — is where the arrow goes in. (Standing ON a mouth
      // is not a place: step back onto one and it takes you.)
      if(e.t < lockT){ e.aimX = p.x + (e.kind === 'single' ? (p.vx || 0) * lead(e, p, T.speed.single, tell - e.t) : 0); e.aimY = e.kind === 'reckon' ? p.y + 2 : p.y + 22; }
      e.locked = e.t >= lockT;
      if(e.t >= tell){
        if(e.kind === 'single') loose(e, e.aimX, e.aimY, T.speed.single);
        else if(e.kind === 'brace'){
          const origin = shotOrigin(e), base = Math.atan2(e.aimY - origin.y, e.aimX - origin.x);
          for(const k of [-1, 0, 1]){ const a = base + k * T.spread; loose(e, origin.x + Math.cos(a) * 1000, origin.y + Math.sin(a) * 1000, T.speed.brace); }
        } else {
          loose(e, e.aimX, e.aimY, T.speed.reckon, { size:9, color:'#f4ecd6', dmg:24, reckoning:1, puzzleOnly:1, life:6 });
        }
        e.move++; e.st = 'recover'; e.t = 0; e.locked = false;
      }
      return;
    }
    case 'struck':                                   // off the perch, falling
      e.y = Math.max(0, COURT.perch.y * (1 - Math.min(1, e.t / T.fall)));
      if(e.t >= T.fall){ e.st = 'down'; e.t = 0; e.y = 0; e.baseY = 0; e.exposeT = T.down; e.hpAtDown = e.hp; G.shake = Math.max(G.shake || 0, 8); kit.burst(e.x, 10, '#c9bda0', 18); }
      return;
    case 'down':                                     // on the floor: the blade can reach it — once
      e.exposeT = Math.max(0, T.down - e.t);
      if(e.hp < e.hpAtDown){ cutTally(A, e); return; }
      if(e.t >= T.down){ e.st = 'climb'; e.t = 0; e.exposeT = 0; }
      return;
    case 'climb':
      e.y = COURT.perch.y * Math.min(1, e.t / T.climb); e.baseY = e.y; e.exposeT = 0;
      if(e.t >= T.climb){ e.st = 'recover'; e.t = 0; e.move = 0; e.hp = 9999; }
      return;
    case 'kneel':
      e.exposeT = 0; e.y = 0;
      return;
  }
}
/* A Reckoning sent back through the mouth and out of the tally post reaches it on its perch. */
function reckonings(A){
  const e = A.tallyman; if(!e || e.dead || !['wait', 'recover', 'draw'].includes(e.st)) return;
  for(const pr of G.projectiles){
    if(!pr.reckoning || !pr.reflected || pr.life <= 0) continue;
    if(Math.abs(pr.x - e.x) < T.hitR && pr.y > e.y - 10 && pr.y < e.y + e.h + 10){
      clearTallyArrows(); pr.life = 0; e.st = 'struck'; e.t = 0; e.locked = false; A.flash = .5;
      kit.burst(e.x, e.y + 40, '#f4ecd6', 22); G.shake = Math.max(G.shake || 0, 10);
      try{ if(meta.soundOn) SFX.hit(); }catch(_e){}
      break;
    }
  }
}
function cutTally(A, e){
  kit.latch(ZONE, 'fm-tally-' + A.tallies); A.tallies++; A.flash = .6; e.exposeT = 0; e.hp = 9999;
  kit.burst(e.x, e.y + 60, '#ffe6a8', 24);
  if(A.tallies >= 3){
    e.st = 'kneel'; e.t = 0; A.freed = true; A.fight = false; kit.latch(ZONE, 'fm-tallyman');
    setBars('court-east', true); setBars('court-west', true); F.clear(STAGE);
    A.queue.push({ src:e, accent:'#e8dcc0', html:'<b>THE TALLYMAN</b><br>The board at its back is full. It sets the bow down on the floor, very carefully, as if the floor might mind.' });
    try{ if(meta.soundOn) SFX.magic(); }catch(_e){}
  } else { e.st = 'climb'; e.t = 0; }
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  cover(A);
  if(!p.dead){ targets(A); reckonings(A); }
  if(p.dead && A.fight && A.tallyman){ A.fight = false; clearTallyArrows(); const e = A.tallyman; Object.assign(e, { st:'wait', t:0, y:COURT.perch.y, baseY:COURT.perch.y, exposeT:0, hp:9999, aimX:null, locked:false, move:0, count:0 }); setBars('court-west', true); }
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && A.freed && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('THE FRACTURED MARKSMAN · BEHIND YOU', 'THE FRACTURED KEEP', 'Act Three · the next echo',
      'Behind you the board is full and the bow is on the floor. Ahead the Keep stands with every gate open.', false); }
}
/* The works gate listens for its own watch's arrow, sent back. */
function targets(A){
  if(A.gateOpen) return;
  for(const pr of G.projectiles){
    if(!pr.reflected || !pr.fmArrow || pr.life <= 0) continue;
    if(Math.abs(pr.x - TARGET.x) < 30 && Math.abs(pr.y - TARGET.y) < 30){
      pr.life = 0; A.gateOpen = true; kit.latch(ZONE, 'fm-works'); setBars(TARGET.bars, true); A.flash = .5;
      G.authoredCameraFocus = { x:TARGET.x + 200, y:TARGET.y, t:1.0 };
      try{ if(meta.soundOn) SFX.magic(); }catch(_e){}
    }
  }
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'watch') return updateWatch(e, p, dt);
  if(e.actFoe === 'tallyman') return updateTallyman(A, e, p, dt);
}
function lateUpdate(){}
function interact(){ return false; }
function swing(){}
function voidFloor(){ return -140; }
/* In the court the camera sits a little higher, so the Tallyman on its perch — and the count it holds
   up — are on the screen with you. */
function cameraFloor(p){ if(!p) return null; return p.x > COURT.x1 - 100 && p.x < COURT.x2 ? 90 : 0; }
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 400) return { connector:'fu-fm', zone:ZONE, targetStage:23, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.freed ? F.seamOn(STAGE, ZONE, 'fm-fk', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fm-fk' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.fight ? CUES.court : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedMarksman = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, sees, segHitsRect, shotOrigin, shotCount, constants:Object.freeze({ LEN, SPAWN, GROUND, LEDGES, MANTLETS, SLICK, WINDCUT_TOWER, SLATES, ANCHORS,
    TARGET, BARS, WATCHES, COURT, T, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
