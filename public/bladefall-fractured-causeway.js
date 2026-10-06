/* Bladefall — ACT THREE · The Fractured Causeway (stage 25), 2026-09-24.

   The third echo: the Broken Causeway after the Echo walked it backwards. Night; the machines are
   running backwards — the hoists carry their masses out over the road and let them go on whoever
   walks under. The kit is the one the Causeway was entered with: one jump and the Oathblade; the
   Chainwake Longbow waits on the Broken Standard, as it did. The Muster applies.

   A MASS hangs from a hoist. Walk under it and its chain rattles (0.35 s) and it falls; landed, it is
   a block to jump, until the hoist takes it back up. Some are let go by a RELEASE instead: an arrow in
   the release drops its mass.

     CHAINWAKE CAMP — two masses over the road: run under without stopping, or bait one down and jump it.
     THE DROP YARD — the yard gate is held by a plate; a hoist sweeps its mass over it. Stand on the
       plate as the mass comes over, step off as it rattles, and it lands on the plate.
     THE CHAINWALK — thorn beds on the causeway, the Muster on it.
     THE COUNTERWEIGHT RISE — lifts over the void, in counter-time.
     THE BROKEN STANDARD — the Chainwake Longbow, on its perch.
     THE IRON ECHO (the C-side) — the Brute's echo. Armoured: nothing you carry hurts it. It hunts;
       it stamps (the tell); it CHARGES, committed, until something stops it. Three masses hang over
       the court, each with its release on a post on the open side. Bait the charge into a bulkhead
       under a mass — stand before it, jump the charge — and shoot that mass's release while it is
       dazed. In the last count it charges to where you stood when it stamped and digs in there — so
       stand under the middle mass when it stamps. What a mass crushes, it stays on: the court fills
       with wreckage, and wreckage stops a charge too. */
(function installFracturedCauseway(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 25, ZONE = 'fractured-causeway', SOURCE = 2;
const LEN = 11400;
const SPAWN = { x:140, y:0 };

/* ── Geometry (world units; y up; the floor is y 0; below it the void) ──────── */
const GROUND = [ [0, 6600], [7700, LEN] ];
/* The Rise: four lifts over the void, 40–70 apart, rising and falling 60 against each other — with one
   jump (78 up, 148 across) and no dash, you cross where two of them meet, not where they are apart. */
const LEDGES = [                                     // [x, w, y (middle of its travel), 'lift', phase]
  [6740, 140, 100, 'lift', 0], [6920, 140, 160, 'lift', Math.PI], [7100, 140, 100, 'lift', 0], [7280, 140, 160, 'lift', Math.PI],
  [7520, 200, 220],                                  // the Broken Standard's perch
];
const LIFT = { dy:60, period:4.4 };
/* A mass: [id, x, hang y, trigger ('under' | release id), hoist dx, hoist period, hoist phase] */
const MASSES = [
  { id:'camp-1', x:1000, y:360, trigger:'under' },
  { id:'camp-2', x:1450, y:360, trigger:'under' },
  { id:'yard', x:3300, y:380, trigger:'plate', hoist:{ dx:240, period:5.0, phase:0 } },
  { id:'lesson', x:8250, y:340, trigger:'release' }, // shoot the release to weigh the road gate
  { id:'A', x:9375, y:420, trigger:'release' },       // over where a charge west stops at the bulkhead
  { id:'B', x:9740, y:460, trigger:'release' },       // the middle: nothing stops a charge there
  { id:'C', x:10105, y:420, trigger:'release' },      // over where a charge east stops
];
const MASS = { w:84, h:60, warn:.35, g:2600, lie:2.4, lift:1.0, hitDmg:24 };
const PLATE = { x:3300, w:90, bars:'yard-gate' };
const THORNS = [ [5000, 170, 3.0, 1.4, 0], [5500, 170, 3.0, 1.4, 1.0], [6050, 170, 3.0, 1.4, 2.0] ];
const LESSON = { x:8250, gateX:8650 };
const BARS = [ { id:'lesson-gate', x:LESSON.gateX, h:600, open:false }, { id:'yard-gate', x:4100, h:700, open:false }, { id:'court-west', x:9260, h:760, open:true },
  { id:'court-east', x:10220, h:760, open:false } ];
/* The court: 960 across, bulkheads at each end (their faces stop a charge: west 9340, east 10140). Each
   mass's release is a post ~200 from it on the OPEN side — where you are once you have jumped its
   charge — so an arrow reaches it in a quarter second and the mass (~0.5 s to fall) lands inside the
   daze. Along the floor they run rA, rB, B, rB, rC: the first release in your line is the one you hit. */
const COURT = { x1:9260, x2:10220, faceW:9340, faceE:10140 };
/* The bulkheads are the causeway's buffer stops: 64 high — a jump clears them (78), a charge does not. */
const BULKHEADS = [ { x:9320, h:64, w:40 }, { x:10160, h:64, w:40 } ];
const RELEASES = [ { id:'lesson-release', x:8010, y:30, mass:'lesson' }, { id:'rA', x:9570, y:30, mass:'A' }, { id:'rB-w', x:9650, y:30, mass:'B' },
  { id:'rB-e', x:9830, y:30, mass:'B' }, { id:'rC', x:9910, y:30, mass:'C' } ];
const IRON = { w:70, h:84, hunt:62, hp:9999,
  windup:[.8, .7, .6], charge:[600, 680, 760], daze:1.7, recover:[.6, .6, 1.8], stagger:.9, cooldown:[1.3, 1.1, .9],   // the last count digs in where it stops
  hitDmg:24, bumpDmg:12,
  chargeReach:52, huntReach:70,                       // it charges head-down: a jump carries you over the charge (78), not over it walking
  shove:{ after:1.1, tell:.55, reach:100, kb:420, recover:.5 } };   // stand in its reach and it shoves you out — and then it has room to charge
const BOW = { x:7520, y:220 };
const CHECKPOINTS = [ { id:'camp', x:600 }, { id:'yard', x:2300 }, { id:'chainwalk', x:4400 }, { id:'rise', x:6500 },
  { id:'standard', x:7520, y:220 }, { id:'court', x:9100 }, { id:'gate', x:10500 } ];
function groundAt(x){ for(const g of GROUND) if(x >= g[0] && x < g[1]) return 0; return null; }
const CUES = Object.freeze({
  court:Object.freeze({ id:'fractured-iron-juggernaut', src:'./audio/music/fractured-iron-juggernaut.mp3', title:'Iron Juggernaut (fractured)',
    artist:'Bladefall score', mood:'the Iron Echo: bait the charge' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function buildLevel(){
  const objects = [];
  GROUND.forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'deck' })));
  LEDGES.forEach(l => objects.push(Object.assign(Pl(l[0], l[1], l[2]), l[3] === 'lift'
    ? { h:24, actArt:'lift', move:{ dx:0, dy:LIFT.dy, period:LIFT.period, phase:l[4] } } : { h:30, actArt:'girder' })));
  THORNS.forEach(t => objects.push(Object.assign(Sp(t[0], 0, { w:t[1], period:t[2], upT:t[3], phase:t[4], dmg:12 }), { fracturedThorns:1 })));
  // Each mass: a wall that is only solid once it has landed (a block to jump), drawn by the art wherever it is.
  MASSES.forEach(m => objects.push({ type:'wall', x:m.x, y:MASS.h, h:MASS.h, w:MASS.w, noCling:1, actArt:'mass', fcMass:m.id, gone:true }));
  objects.push({ type:'actPlate', x:PLATE.x, y:0, w:PLATE.w, h:8 });
  objects.push({ type:'actPlate', x:LESSON.x, y:0, w:PLATE.w, h:8, lesson:true });
  BARS.forEach(b => objects.push({ type:'wall', x:b.x, y:b.h, h:b.h, w:30, noCling:1, actArt:'bars', actBars:b.id, gone:b.open }));
  BULKHEADS.forEach(b => objects.push({ type:'wall', x:b.x, y:b.h, h:b.h, w:b.w, noCling:1, actArt:'bulkhead' }));
  RELEASES.forEach(r => objects.push({ type:'actRelease', x:r.x, y:r.y, w:24, h:24, release:r.id, mass:r.mass }));
  objects.push({ type:'actBow', actId:'bow', x:BOW.x, y:BOW.y, w:40, h:40, actTwoUp:1, actVerb:'TAKE THE LONGBOW' });
  objects.push({ type:'actGantry', x:5200, y:0, w:10400, h:0 });
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:260, y:0, w:40, h:20, restSiteAnchor:'chainwake-embers' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'grunt', x:2700, patrol:[2500, 2950], noDrop:true },
      { t:'outrider', x:4800, patrol:[4500, 5200], noDrop:true },
      { t:'flyer', x:5600, y:260, patrol:[5200, 6100], noDrop:true },
      { t:'grunt', x:6300, patrol:[6150, 6500], noDrop:true },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  const tallies = ['A', 'B', 'C'].filter(id => done(c, 'fc-crush-' + id));
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    yard:done(c, 'fc-yard'), lesson:done(c, 'fc-lesson'), bow:done(c, 'fc-bow'), crushed:tallies, buried:done(c, 'fc-iron'), fight:false, over:false, masses:{} };
  const A = G.actTwo;
  // The Causeway's kit: one jump and the blade — and the Longbow once it is taken.
  F.setKit(['jump', 'weapon']);
  if(A.bow) takeBow(true);
  for(const m of MASSES){
    const wreck = tallies.includes(m.id), weighed = (m.id === 'yard' && A.yard) || (m.id === 'lesson' && A.lesson);
    A.masses[m.id] = { id:m.id, st:wreck ? 'wreck' : weighed ? 'landed' : 'hang', t:0, y:wreck || weighed ? MASS.h : m.y, vy:0, x:m.x };
  }
  setBars('lesson-gate', A.lesson);
  setBars('yard-gate', A.yard);
  setBars('court-east', A.buried);
  for(const m of MASSES) syncMass(A, m);
  const bow = G.obstacles.find(o => o.actId === 'bow'); if(bow) bow.actMute = A.bow;
}
function firstFrame(A){
  F.muster();
  if(!A.buried) spawnIron(A);
}
function spawnIron(A){
  const e = spawnEnemy('grunt', (COURT.x1 + COURT.x2) / 2);
  Object.assign(e, { actFoe:'iron', x:(COURT.x1 + COURT.x2) / 2 + 220, y:0, baseY:0, w:IRON.w, h:IRON.h, st:'dormant', t:0, face:-1,
    active:true, noDrop:true, boss:false, portalGate:'iron-never', maxHp:IRON.hp, hp:IRON.hp, noticeRange:1, cool:1.0 });
  A.iron = e;
}
function setBars(id, open){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === open) return; b.gone = open; b.moveT = 0.5;
}
function takeBow(silent){
  const p = G.p;
  try{
    const bow = makeWeapon('bow', 'rare', 'Chainwake Longbow');
    const prev = p.weapon;
    if(!equipProgressionWeapon(bow, { archetype:'bow', authored:true })) p.weapon = bow;
    if(prev && prev.arche !== 'bow') p.stowedWeapon = JSON.parse(JSON.stringify(prev));
    p.atkTimer = p.atkCd = p.atkBuf = p.swingT = 0; syncWeaponCapabilities(p); hudUpdate();
  }catch(_e){}
  if(!silent){ try{ if(meta.soundOn) SFX.pickup(); }catch(_e){} }
}

/* ── The masses ────────────────────────────────────────────────────────────── */
function massX(A, m){
  const s = A.masses[m.id];
  if(!m.hoist || s.st !== 'hang') return s.x;
  return m.x + Math.sin((G.time + m.hoist.phase) / m.hoist.period * Math.PI * 2) * m.hoist.dx;
}
function syncMass(A, m){
  const s = A.masses[m.id], o = G.obstacles.find(q => q.fcMass === m.id); if(!o) return;
  o.x = s.x; o.gone = !(s.st === 'landed' || s.st === 'wreck');
}
function under(p, x){ return Math.abs(p.x - x) < MASS.w / 2 + (p.w || 26) / 2 - 4; }
/* A mass that falls on whoever walks under it rattles first (the warning); one whose release is shot
   falls at once — the arrow cut its chain. */
function drop(A, m, cut){ const s = A.masses[m.id]; if(s.st !== 'hang') return; s.x = massX(A, m); s.t = 0; if(cut){ s.st = 'fall'; s.vy = 0; } else s.st = 'warn'; }
function updateMasses(A, p, dt){
  for(const m of MASSES){
    const s = A.masses[m.id]; s.t += dt;
    if(s.st === 'hang'){
      s.x = massX(A, m);
      if(m.trigger === 'under' && !p.dead && under(p, s.x) && p.y < m.y - MASS.h - 10) drop(A, m);
      // The yard's hoist lets go only over its plate, and only on someone standing there.
      if(m.trigger === 'plate' && !A.yard && !p.dead && under(p, s.x) && p.y < m.y - MASS.h - 10 && Math.abs(s.x - PLATE.x) < 24) drop(A, m);
    } else if(s.st === 'warn'){
      if(s.t >= MASS.warn){ s.st = 'fall'; s.t = 0; s.vy = 0; }
    } else if(s.st === 'fall'){
      s.vy += MASS.g * dt; const ny = s.y - s.vy * dt, bottom = ny - MASS.h;
      // It crushes the knight under it…
      if(!p.dead && under(p, s.x) && bottom < p.y + 44 && s.y - MASS.h >= p.y + 30 && !(p.invuln > 0) && !(p.dodgeTimer > 0)){
        try{ hurtPlayer(MASS.hitDmg, Math.sign(p.x - s.x) || 1, true); }catch(_e){}
        if(!p.dead){ p.vx = (Math.sign(p.x - s.x) || 1) * 260; p.vy = 180; }
      }
      // …and the Iron Echo, if it is under it.
      const e = A.iron;
      if(e && !e.dead && ['daze', 'recover', 'windup', 'hunt', 'charge'].includes(e.st) && Math.abs(e.x - s.x) < MASS.w / 2 + e.w / 2 - 6 && bottom < e.h){
        crush(A, e, m); s.y = MASS.h + e.h * 0; s.st = 'wreck'; s.t = 0; syncMass(A, m); continue;
      }
      s.y = ny;
      if(bottom <= 0){ s.y = MASS.h; s.st = 'landed'; s.t = 0; G.shake = Math.max(G.shake || 0, 5); kit.burst(s.x, 8, '#8a8070', 14);
        try{ if(meta.soundOn) SFX.land(); }catch(_e){}
        if(m.id === 'lesson' && !A.lesson){ A.lesson = true; kit.latch(ZONE, 'fc-lesson'); setBars('lesson-gate', true); A.flash = .3; }
        if(m.id === 'yard' && !A.yard && Math.abs(s.x - PLATE.x) < PLATE.w / 2){ A.yard = true; kit.latch(ZONE, 'fc-yard'); setBars(PLATE.bars, true); A.flash = .4;
          G.authoredCameraFocus = { x:PLATE.bars ? 4100 : s.x, y:200, t:1.0 }; }
      }
      syncMass(A, m);
    } else if(s.st === 'landed'){
      // The yard's mass stays on its plate; every other one goes back up.
      if((m.id === 'yard' && A.yard) || (m.id === 'lesson' && A.lesson)){ syncMass(A, m); continue; }
      if(s.t >= MASS.lie){ s.st = 'lift'; s.t = 0; syncMass(A, m); }
    } else if(s.st === 'lift'){
      s.y = MASS.h + (m.y - MASS.h) * Math.min(1, s.t / MASS.lift);
      if(s.t >= MASS.lift){ s.st = 'hang'; s.t = 0; s.y = m.y; }
    }
    syncMass(A, m); // Repair collision after checkpoint hydration, including landed wreckage.
  }
}
/* An arrow in a release lets its mass go. */
function releases(A){
  for(const pr of G.projectiles){
    if(pr.owner !== 'player' || pr.life <= 0) continue;
    for(const r of RELEASES){
      if(Math.abs(pr.x - r.x) > 16 || Math.abs(pr.y - r.y) > 18) continue;
      const m = MASSES.find(q => q.id === r.mass), s = A.masses[m.id];
      pr.life = 0; kit.burst(r.x, r.y, '#e6bb73', 8);
      try{ if(meta.soundOn) SFX.hit(); }catch(_e){}
      if(s.st === 'hang') drop(A, m, true);
      break; // One arrow can release only the first post it touches.
    }
  }
}

/* ── The Iron Echo ─────────────────────────────────────────────────────────── */
function tier(A){ return Math.min(2, A.crushed.length); }
function stops(A){
  // What stops a charge: the bulkheads' faces, and the faces of the wreckage it has already been crushed by.
  const walls = [COURT.faceW, COURT.faceE];
  for(const id of A.crushed){ const m = MASSES.find(q => q.id === id); walls.push(m.x - MASS.w / 2, m.x + MASS.w / 2); }
  return walls;
}
function updateIron(A, e, p, dt){
  if(p.dead || e.dead) return;
  e.t += dt;
  const ph = tier(A);
  const contact = (reach) => !p.dead && Math.abs(p.x - e.x) < e.w / 2 + 12 && p.y < reach && !(p.invuln > 0) && !(p.dodgeTimer > 0);
  switch(e.st){
    case 'dormant':
      if(p.x > COURT.x1 + 90 && !p.dead){ e.st = 'hunt'; e.t = 0; A.fight = true; setBars('court-west', false);
        kit.say(e, '<b>THE IRON ECHO</b><br>It was a man in armour once. Now it is the armour, walking. It turns, and the whole court leans with it.', null, '#c9bda0'); }
      return;
    case 'hunt': {
      e.face = Math.sign(p.x - e.x) || e.face; e.cool = Math.max(0, e.cool - dt);
      if(Math.abs(p.x - e.x) > 60) e.x += e.face * IRON.hunt * dt;
      if(contact(IRON.huntReach)) strike(p, e.face, 260, IRON.bumpDmg);
      e.close = Math.abs(p.x - e.x) < IRON.shove.reach ? (e.close || 0) + dt : 0;
      if(e.close >= IRON.shove.after){ e.st = 'shove'; e.t = 0; e.close = 0; break; }
      if(e.cool <= 0 && Math.abs(p.x - e.x) > 110){ e.st = 'windup'; e.t = 0; e.dir = e.face; }
      break;
    }
    case 'shove':
      if(e.t >= IRON.shove.tell && !e.shoved){ e.shoved = true; kit.burst(e.x + e.face * 40, 30, '#c9bda0', 10);
        if(!p.dead && Math.abs(p.x - e.x) < IRON.shove.reach && p.y < IRON.huntReach) strike(p, e.face, IRON.shove.kb, IRON.bumpDmg); }
      if(e.t >= IRON.shove.tell + IRON.shove.recover){ e.st = 'hunt'; e.t = 0; e.shoved = false; e.cool = Math.min(e.cool, .3); }
      break;
    case 'windup':
      e.face = e.dir = Math.sign(p.x - e.x) || e.dir;
      // In the last count it commits to where you are standing when it stamps.
      e.target = ph >= 2 ? p.x : null;
      if(e.t >= IRON.windup[ph]){ e.st = 'charge'; e.t = 0; e.hit = false; try{ if(meta.soundOn) SFX.land(); }catch(_e){} }
      break;
    case 'charge': {
      const v = IRON.charge[ph], nx = e.x + e.dir * v * dt;
      const wall = stops(A).filter(w => (w - e.x) * e.dir > 0 && (w - nx) * e.dir <= e.w / 2).sort((a, b) => Math.abs(a - e.x) - Math.abs(b - e.x))[0];
      if(!e.hit && contact(IRON.chargeReach)){ e.hit = true; strike(p, e.dir, 380, IRON.hitDmg); }
      if(wall != null){ e.x = wall - e.dir * e.w / 2; e.st = 'daze'; e.t = 0; G.shake = Math.max(G.shake || 0, 10); kit.burst(e.x + e.dir * e.w / 2, 40, '#c9bda0', 18);
        try{ if(meta.soundOn) SFX.hit(); }catch(_e){} break; }
      if(e.target != null && (e.target - nx) * e.dir <= 0){ e.x = e.target; e.st = 'recover'; e.t = 0; break; }
      e.x = Math.max(COURT.x1 + 40, Math.min(COURT.x2 - 40, nx));
      break;
    }
    case 'daze': if(e.t >= IRON.daze){ e.st = 'hunt'; e.t = 0; e.cool = IRON.cooldown[ph]; } break;
    case 'recover': if(e.t >= IRON.recover[ph]){ e.st = 'hunt'; e.t = 0; e.cool = IRON.cooldown[ph]; } break;
    case 'crushed': if(e.t >= IRON.stagger){ e.st = A.crushed.length >= 3 ? 'buried' : 'hunt'; e.t = 0; e.cool = IRON.cooldown[tier(A)]; } break;
    case 'buried': break;
  }
}
function crush(A, e, m){
  if(A.crushed.includes(m.id)) return;
  A.crushed.push(m.id); kit.latch(ZONE, 'fc-crush-' + m.id); A.flash = .6;
  e.st = 'crushed'; e.t = 0; G.shake = Math.max(G.shake || 0, 14); kit.burst(e.x, 60, '#e6bb73', 26);
  try{ if(meta.soundOn) SFX.hit(); }catch(_e){}
  if(A.crushed.length >= 3){
    A.buried = true; A.fight = false; kit.latch(ZONE, 'fc-iron'); setBars('court-east', true); setBars('court-west', true); F.clear(STAGE);
    A.queue.push({ src:e, accent:'#c9bda0', html:'<b>THE IRON ECHO</b><br>Under the third weight it stops trying. Something inside the armour lets out a long breath, and the plates settle.' });
  }
}
function strike(p, dir, kb, dmg){
  if(p.invuln > 0 || p.dodgeTimer > 0) return;
  try{ hurtPlayer(dmg, dir, true); }catch(_e){}
  if(!p.dead){ p.vx = dir * kb; p.vy = 200; }
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  updateMasses(A, p, dt);
  releases(A);
  if(p.dead && A.fight && A.iron){ A.fight = false; Object.assign(A.iron, { st:'dormant', t:0, x:(COURT.x1 + COURT.x2) / 2 + 220, cool:1.0, close:0, shoved:false, hit:false, target:null }); setBars('court-west', true); }
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && A.buried && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('THE FRACTURED CAUSEWAY · BEHIND YOU', 'THE FRACTURED UPDRAFTS', 'Act Three · the next echo',
      'Behind you the court is full of iron and it has stopped moving. Ahead the canyons breathe the wrong way.', false); }
}
function interact(o){
  const A = G.actTwo; if(!A || A.stage !== STAGE || G.p.dead) return false;
  if(o.actId === 'bow' && !A.bow){
    A.bow = true; o.actMute = true; kit.latch(ZONE, 'fc-bow'); takeBow(false); A.flash = .4;
    A.queue.push({ src:o, accent:'#e6bb73', html:'<b>THE CHAINWAKE LONGBOW</b><br>The string is new. Someone restrung it and left it here, on the standard, for whoever came next.' });
    return true;
  }
  return false;
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'iron') return updateIron(A, e, p, dt);
}
function lateUpdate(){}
function swing(){}
function voidFloor(){ return -140; }
function cameraFloor(p){ if(!p) return null; return p.x > COURT.x1 - 100 && p.x < COURT.x2 ? 60 : 0; }
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 400) return { connector:'fw-fc', zone:ZONE, targetStage:22, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.buried ? F.seamOn(STAGE, ZONE, 'fc-fu', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fc-fu' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.fight ? CUES.court : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedCauseway = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, massX, constants:Object.freeze({ LEN, SPAWN, GROUND, LEDGES, LIFT, MASSES, MASS, PLATE, THORNS, BARS, COURT,
    BULKHEADS, RELEASES, IRON, BOW, LESSON, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
