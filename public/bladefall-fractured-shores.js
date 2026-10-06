/* Bladefall — ACT THREE · The Fractured Shores (stage 37), 2026-09-25.

   The seventeenth echo: the Landing Shores after the Echo walked it backwards. The strand of wrecks at a
   higher tide: the gut wider, the flats drowning instead of wetting, the bells rung for nobody. The kit is
   the one the Shores were entered with — everything through the Chainhook. Nothing waits here. The Muster
   applies.

     THE GUT: three rings over the water between the strands, then the hull, climbed by two more.
     THE FLATS AT FLOOD: the tide comes in faster and higher, and it drowns. Cross in the low water, refuge
       to refuge — a rib, a wreck, a float that rides the tide up — and never be on the sand at the flood.
     THE SUNGUARD'S ECHO (the C-side): a shield that turns to face you, a bell that tolls on a beat, and one
       rule: only a blow on its back, landed while the toll still rings, counts. */
(function installFracturedShores(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 37, ZONE = 'fractured-shores', SOURCE = 17;
const LEN = 10000;
const SPAWN = { x:300, y:200 };

/* ── Geometry (world units; y up; the flats' sand is y 0) ──────────────────── */
const STRAND = { x0:0, x1:1300, y:200 };
const GUT = { x0:1300, x1:2450, rings:[ [1600, 450], [1950, 480], [2300, 460] ] };
const FAR = { x0:2450, x1:2750, y:200 };
const HULL = { x0:2750, x1:3100, deck:600, rings:[ [2650, 470], [2900, 690] ] };
const STEP = { x0:3100, x1:3300, y:200 };                        // the hull's foot: above high water
/* The Flats: sand at 0 under a tide that runs low → flood → high → ebb, from `low` to `high`. Refuges stand
   above high water; a float rides it. */
const FLATS = { x0:3300, x1:7200 };
const TIDE = { low:-70, high:190, phases:[4.0, 3.0, 5.0, 3.0], drown:26 };
const RIB = { x0:4300, x1:4450, y:200, ring:[4375, 400] };   // above a jump: reached by its ring
const WRECK = { x0:5400, x1:5720, y:250, ring:[5560, 390] };
const FLOAT = { x:6350, w:110 };
const SHORE = [ [7200, 7330, 120], [7330, 7460, 240] ];
const JETTY = { x0:7460, x1:7760, y:300 };
/* The Sunguard's court. */
const COURT = { x1:7900, x2:9400 };
const COURT_RINGS = [ [8250, 400], [8650, 420], [9050, 400] ];
const COURT_PERCHES = [ [8200, 140, 130], [8650, 140, 130], [9100, 140, 130] ];
const BELL = { x:8000, y:330 };
const GUARD = {
  w:56, h:84, speed:[60, 70, 80], turn:[1.1, .95, .8], bash:{ reach:80, tell:.5, dmg:16, cool:1.4 },
  phases:[ { marks:2, toll:2.4, ring:.75, tide:false }, { marks:2, toll:2.4, ring:.7, tide:true }, { marks:2, toll:1.9, ring:.55, tide:true } ],
  tide:{ low:-60, high:130, phases:[3.5, 1.2, 1.8, 1.2] }, water:{ dmg:12, lift:620 },   // wet ~3.5 s of every 7.7
};
const CHECKPOINTS = [ { id:'strand', x:500, y:200 }, { id:'far', x:2620, y:200 }, { id:'foot', x:3200, y:200 }, { id:'wreck', x:5560, y:250 },
  { id:'jetty', x:7600, y:300 } ];
function groundSegs(){
  return [ [STRAND.x0, STRAND.x1, STRAND.y], [FAR.x0, FAR.x1, FAR.y], [HULL.x0, HULL.x1, HULL.deck], [STEP.x0, STEP.x1, STEP.y],
    [FLATS.x0, FLATS.x1, 0], [JETTY.x1, LEN, 0] ];
}
function groundAt(x){ for(const [a, b, y] of groundSegs()) if(x >= a && x < b) return y; return null; }
/* The tide's level at time t in a cycle [low, flood, high, ebb]. */
function tideLevel(t, T){
  const [l, f, h, e] = T.phases, P = l + f + h + e, u = ((t % P) + P) % P;
  if(u < l) return T.low;
  if(u < l + f) return T.low + (T.high - T.low) * (u - l) / f;
  if(u < l + f + h) return T.high;
  return T.high - (T.high - T.low) * (u - l - f - h) / e;
}
const CUES = Object.freeze({
  guard:Object.freeze({ id:'fractured-sunguard', src:'./audio/music/fractured-the-last-spark-of-darrow.mp3', title:'The Last Spark of Darrow (fractured)',
    artist:'Aerth score', mood:'the Sunguard\'s echo: strike on the toll, from behind' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function ring(x, y, extra){ return Object.assign({ type:'actRing', x, y, w:24, h:24 }, extra || {}); }
function coat(x, top, bottom){ const b = bottom || 0; return Object.assign(Wl(x, top, top - b, 24), { noCling:1, slickL:1, slickR:1, clingSurface:0, actArt:'coat' }); }
function buildLevel(){
  const objects = [];
  groundSegs().forEach(([a, b, y]) => objects.push(Object.assign(GrAt(a, b, y), { actArt:y === 600 ? 'hull' : 'strand' })));
  GUT.rings.forEach(([x, y]) => objects.push(ring(x, y)));
  HULL.rings.forEach(([x, y]) => objects.push(ring(x, y)));
  objects.push(coat(HULL.x0 + 12, HULL.deck));                     // the hull's side: coated, no clinging up it
  // Every raised block is solid only from above, so each face is a coated wall: nothing walks into a refuge, nothing clings up it.
  objects.push(Object.assign(GrAt(RIB.x0, RIB.x1, RIB.y), { actArt:'rib' }), ring(RIB.ring[0], RIB.ring[1]), coat(RIB.x0 + 12, RIB.y), coat(RIB.x1 - 12, RIB.y));
  objects.push(coat(WRECK.x0 + 12, WRECK.y), coat(WRECK.x1 - 12, WRECK.y), coat(STEP.x1 - 12, STEP.y));
  objects.push(coat(SHORE[0][0] + 12, SHORE[0][2]), coat(SHORE[1][0] + 12, SHORE[1][2], SHORE[0][2]), coat(JETTY.x0 + 12, JETTY.y, SHORE[1][2]));
  objects.push(Object.assign(GrAt(WRECK.x0, WRECK.x1, WRECK.y), { actArt:'refuge' }), ring(WRECK.ring[0], WRECK.ring[1]));
  objects.push(Object.assign(Pl(FLOAT.x, FLOAT.w, 16), { h:14, actArt:'float', fsFloat:1 }));
  SHORE.forEach(([a, b, y]) => objects.push(Object.assign(GrAt(a, b, y), { actArt:'strand' })));
  objects.push(Object.assign(GrAt(JETTY.x0, JETTY.x1, JETTY.y), { actArt:'jetty' }));
  COURT_RINGS.forEach(([x, y]) => objects.push(ring(x, y, { fsCourt:1 })));
  // Perches a double jump up, above the court's high water (a knight is swept only when it rises 20 past his feet).
  COURT_PERCHES.forEach(([x, w, y]) => objects.push(Object.assign(Pl(x, w, y), { actArt:'jetty' })));
  objects.push({ type:'actBell', x:BELL.x, y:BELL.y, w:40, h:50 });
  objects.push({ type:'wall', x:COURT.x1, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'court-west', gone:true });
  objects.push({ type:'wall', x:COURT.x2, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'court-east', gone:false });
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:520, y:200, w:40, h:20, restSiteAnchor:'strand-ash' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'reefcrab', x:2620, y:200, patrol:[2540, 2720], noDrop:true },
      { t:'reefcrab', x:4900, patrol:[4600, 5300], noDrop:true },
      { t:'belled', x:7600, y:300, patrol:[7480, 7740], noDrop:true },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    tideT:0, tide:TIDE.low, phase:done(c, 'fs-guard-2') ? 2 : done(c, 'fs-guard-1') ? 1 : 0, broken:done(c, 'fs-guard'), marks:0,
    fight:false, introduced:done(c, 'fs-met'), over:false, tollT:0, courtT:0, court:GUARD.tide.low };
  // The Shores' kit: everything through the Chainhook. Nothing waits here.
  F.setKit(['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement',
    'companion-command', 'downward-strike', 'gravity-flip', 'chain-hook']);
  setBars('court-east', G.actTwo.broken);
}
function firstFrame(A){ F.muster(); spawnGuard(A); }
function spawnGuard(A){
  const e = spawnEnemy('grunt', (COURT.x1 + COURT.x2) / 2 + 250);
  Object.assign(e, { actFoe:'sunguard', x:(COURT.x1 + COURT.x2) / 2 + 250, y:0, baseY:0, w:GUARD.w, h:GUARD.h, st:'wait', t:0, face:-1, turnT:0,
    frontShield:false, portalGate:'sg-never', active:true, noDrop:true, boss:false, maxHp:9999, hp:9999, hpWas:9999, noticeRange:1, cool:1 });
  if(A.broken) e.st='down';
  A.guard = e;
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

/* ── The flats' tide ──────────────────────────────────────────────────────── */
function flats(A, p, dt){
  // The clock runs once you are at the flats' edge, so it is the same tide every time you come to it.
  if(p.x > STEP.x0 - 200 && p.x < SHORE[0][0] + 200) A.tideT += dt;
  A.tide = tideLevel(A.tideT, TIDE);
  // The float rests on the sand at low water and rides the tide up from there.
  const fl = G.obstacles.find(o => o.fsFloat); if(fl){ fl.y = Math.max(0, A.tide) + 16; }
  const inFlats = p.x > FLATS.x0 + 10 && p.x < FLATS.x1 - 10;
  if(inFlats && !p.dead && !p.actHook && !p.seamRide && A.tide > p.y + TIDE.drown) fall(p);
}
/* ── The court's tide (the Sunguard's second act on) ──────────────────────── */
function courtTide(A, p, dt){
  const on = A.fight && GUARD.phases[A.phase].tide;
  if(on) A.courtT += dt; else A.courtT = 0;
  A.court = on ? tideLevel(A.courtT, GUARD.tide) : GUARD.tide.low;
  if(on && !p.dead && !p.actHook && p.x > COURT.x1 && p.x < COURT.x2 && A.court > p.y + 20){
    harm(p, 1, GUARD.water.dmg); p.vy = -GUARD.water.lift; p.jumpCutOk = false;
  }
}

/* ── THE SUNGUARD'S ECHO ──────────────────────────────────────────────────── */
function updateGuard(A, e, p, dt){
  if(p.dead || e.dead) return;
  e.t += dt; e.turnT += dt; e.cool = Math.max(0, e.cool - dt);
  e.burnT = e.poisonT = e.bleedT = e.freezeT = e.floatT = e.counterStunT = 0;
  if(e.hp < e.hpWas && e.portalGate === 'melee') struck(A, e, p);
  e.hp = e.hpWas = 9999;
  e.shake = Math.max(0, (e.shake || 0) - dt);
  const ph = GUARD.phases[A.phase];
  if(A.fight){ A.tollT += dt; if(A.tollT >= ph.toll){ A.tollT = 0; try{ if(meta.soundOn) SFX.bell ? SFX.bell() : SFX.levelup(); }catch(_e){} kit.burst(BELL.x, BELL.y + 20, '#ffe3a0', 10); } }
  const tolling = A.fight && A.tollT < ph.ring;
  // It turns to face you, slowly.
  const want = Math.sign(p.x - e.x) || e.face;
  if(want !== e.face && e.turnT >= GUARD.turn[A.phase]){ e.face = want; e.turnT = 0; }
  else if(want === e.face) e.turnT = 0;
  switch(e.st){
    case 'wait':
      if(p.x > COURT.x1 + 80 && p.x < COURT.x2 && !p.dead){
        e.st = 'walk'; e.t = 0; A.fight = true; A.tollT = 0; setBars('court-west', false);
        if(!A.introduced){ A.introduced = true; kit.latch(ZONE, 'fs-met');
          A.queue.push({ src:e, accent:'#ffe3a0', html:'<b>THE SUNGUARD\'S ECHO</b><br>The gate it kept is gone and it keeps it anyway, turning its shield to whatever comes. The bell still tells it when to be afraid.' }); }
      }
      break;
    case 'walk':
      if(Math.abs(p.x - e.x) > GUARD.bash.reach) e.x += e.face * GUARD.speed[A.phase] * dt;
      else if(e.cool <= 0 && e.face === want){ e.st = 'bash-tell'; e.t = 0; }
      break;
    case 'bash-tell': if(e.t >= GUARD.bash.tell){ e.st = 'bash'; e.t = 0; } break;
    case 'bash':
      e.x += e.face * 420 * dt;
      if(!p.dead && Math.abs(p.x - (e.x + e.face * e.w / 2)) < 30 && p.y < e.h) harm(p, e.face, GUARD.bash.dmg);
      if(e.t >= .18){ e.st = 'walk'; e.t = 0; e.cool = GUARD.bash.cool; }
      break;
    case 'down': break;
  }
  e.x = Math.max(COURT.x1 + 40, Math.min(COURT.x2 - 40, e.x)); e.y = 0; e.baseY = 0;
  // Only its back, and only while the toll rings.
  const behind = Math.sign(p.x - e.x) === -e.face;
  e.portalGate = e.st !== 'wait' && e.st !== 'down' && behind && tolling ? 'melee' : 'sg-never';
  e.tolling = tolling;
}
function struck(A, e, p){
  A.marks++; A.flash = .4; e.shake = .8; kit.burst(e.x, e.h, '#ffe3a0', 20);
  try{ if(meta.soundOn) SFX.hit(); }catch(_e){}
  A.tollT = GUARD.phases[A.phase].ring;                          // one blow a toll
  if(A.marks >= GUARD.phases[A.phase].marks){
    A.marks = 0;
    if(A.phase < GUARD.phases.length - 1){ kit.latch(ZONE, 'fs-guard-' + (A.phase + 1)); A.phase++; }
    else {
      e.st = 'down'; A.broken = true; A.fight = false; kit.latch(ZONE, 'fs-guard'); F.clear(STAGE);
      setBars('court-east', true); setBars('court-west', true);
      A.queue.push({ src:e, accent:'#ffe3a0', html:'<b>THE SUNGUARD\'S ECHO</b><br>The shield comes down on the last toll and stays down. The bell rings once more for nobody, and stops.' });
      try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
    }
  }
}
function resetGuard(A){
  const e = A.guard; if(!e) return;
  A.fight = false; A.marks = 0; A.tollT = 0; A.courtT = 0; A.queue = []; e.hp=e.hpWas=9999; e.turnT=0; e.cool=1; e.tolling=false; e.portalGate='sg-never'; e.st = 'wait'; e.t = 0; e.x = (COURT.x1 + COURT.x2) / 2 + 250; e.face = -1;
  setBars('court-west', true);
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  flats(A, p, dt);
  courtTide(A, p, dt);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  if(A.fight && (p.dead || p.x < COURT.x1 - 20)) resetGuard(A);
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && A.broken && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('FRACTURED SHORES · BEHIND YOU', 'THE FRACTURED COLONY', 'Act Three · the next echo',
      'Behind you the tide keeps its hours on an empty strand. Ahead, the Colony, and whatever still answers there.', false); }
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'sunguard') return updateGuard(A, e, p, dt);
}
function lateUpdate(){}
function interact(){ return false; }
function swing(){}
function voidFloor(p){ return p && p.x > GUT.x0 && p.x < GUT.x1 ? -300 : -120; }
function cameraFloor(p){ if(!p) return null; const g = groundAt(p.x); return Math.max(-160, Math.min(g == null ? 0 : g, p.y) - 40); }
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 200) return { connector:'fc-fs', zone:ZONE, targetStage:36, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.broken ? F.seamOn(STAGE, ZONE, 'fs-fco', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fs-fco' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.fight ? CUES.guard : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedShores = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, groundSegs, tideLevel, constants:Object.freeze({ LEN, SPAWN, STRAND, GUT, FAR, HULL, STEP, FLATS, TIDE, RIB, WRECK, FLOAT,
    SHORE, JETTY, COURT, COURT_RINGS, COURT_PERCHES, BELL, GUARD, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
