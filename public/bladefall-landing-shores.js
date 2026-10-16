/* Bladefall — ACT TWO · STAGE 17 · THE LANDING SHORES (2026-09-23).

   The holed boat comes in on the current and grounds on a strand of older wrecks under a
   grey dawn. Charma's golden spire stands far inland. The knight's mouth is dry as ash.
   Walked west to east, and rising: the strand (200), the tide flats (0), the King's
   landing (300), the Bell Cliff's road (300) and climb, the headland (720) and the gate
   of the colony the King keeps his sick in.

     THE WRECK LINE — the strand the sea leaves its wrecks on. A tidal gut cuts it (980
       wide, no jump) and a stranded hull walls it (400 high, no face to climb): the
       Chainhook, taken at Thunder Cliffs, is taught ACROSS and then UP, on the wrecks' own
       mooring iron.
     THE TIDE FLATS — the region's own rule. The sea goes out and comes back on a slow
       clock you can watch. Low water is a road across the sand; high water carries the
       wreckage up into footing. Floodwater wounds in place. Raised wreck ribs offer a skilled crossing and recovery
       points; the floating hatch covers rise with the flood.
     THE KING'S LANDING — a gilded jetty kept swept for a king who landed here and has
       not come back down. Its keepers are the Belled: his conscripts, bandaged, a bell at
       the belt, white flowers in the wrappings. They fight badly and unwillingly.
     THE BELL CLIFF — an overseer, a Sunguard, rings them on from a ledge no one reaches.
       On each stroke of the bell they are driven at you. Hook to its hoist and slam
       the retaining cap; the conscripts drop their pikes and flee.
     THE COLONY GATE — the same Sunguard, on the ground now, ringing more of them out of
       the gate. The bell hangs at his back. Silence it and they drop their pikes and run.
       One of them had already dropped his: a bearded man, bandaged to the eyes, kneeling
       where the bell swings back into him. The choice the act turns on is his.

   THE CHOICE (owner, 2026-09-23). ↑ TAKE HIS HAND — he warns you first: it goes to
   whoever touches it — and the white flower is yours (bladefall-act-two.js); he stands
   and walks with you. Walk past, and he kneels there until you leave the Colony. Strike
   him — twice, the first time he only covers his head — and the forsaken path is sealed
   at once. He is Oren; nothing here says so. The hammer on the ground is a chainwright's. */
(function installLandingShores(root){
'use strict';
const A2 = root.BladefallActTwo;
if(!A2 || !A2.register) return;
const kit = A2.kit;

const SHORES = 17, ZONE = 'landing-shores';

/* ── Geometry (world units; y up) ─────────────────────────────────────────── */
const LEN = 12800;
const STRAND_Y = 200;                                   // the strand: above the highest water
const SPAWN = { x:820, y:STRAND_Y };
const GUT = { x1:1400, x2:2380 };                       // 980 of open water: no jump crosses it
const HULL = { x1:3150, x2:3500, deck:600 };            // 400 of hull with no face to climb
const BASIN = { x1:3950, x2:7350 };                     // the flats (sand at 0) the tide fills
const REFUGE = { x1:5535, x2:5835, deck:250 };          // a wreck whose deck stays dry at high water; 805 short of the jetty
/* Two pieces of wreckage the tide lifts, a jump apart: the second 85 short of the jetty and
   114 under it at high water (a double jump rises 147); at low water it is 284 under. */
const WRACK_PERCHES = [{x:4520,w:150,y:200},{x:5030,w:150,y:200}];
const BELL_RIG = {x:9260,y:470,ringY:570};
const FLOATS = [ { x:6110, w:220 }, { x:6470, w:220 } ];
const JETTY = { x1:6640, x2:7350, y:300 };
const COURT = { x1:7350, y:300 };                       // the King's landing, and the Bell Cliff's road
const SUN_ARCH_X = 8350, BELL_GATE_X = 10000;
const HEAD = { x1:10750, y:720 };                       // the headland: the Colony Gate
const PALISADE_X = 12420, FRONTIER_X = 12700;
const OVERSEER_LEDGE = { x:9380, y:470 };               // where the Sunguard rings from: a drawn ledge, no footing, no ring
const POST = { overseer:12000, oren:12085 };
/* Mooring iron on the wrecks. Measured from a standing knight's centre (y + 22) and from
   a hang (ring - 58 + 22): every hop is inside the Chainhook's 470, and no ring is in reach
   of the ground it lifts you off except the first of each pair. */
const RINGS = [
  { id:'gut-a',  x:1680,  y:450 },      // from the strand's lip: 369
  { id:'gut-b',  x:2130,  y:470 },      // from a hang on gut-a: 453; to the far lip, 250 (no dash needed)
  { id:'hull-a', x:3020,  y:470 },      // from the strand under the hull: 275
  { id:'hull-b', x:3230,  y:690 },      // from a hang on hull-a: 331; 479 from the ground
  { id:'refuge', x:5660,  y:380 },      // from the sand at the refuge's foot: 365
  { id:'cliff',  x:10480, y:560 },      // from the Bell Cliff's road: 251
  { id:'lip',    x:10800, y:800 },      // from a hang on the cliff ring: 422; lets you down on the headland
];
/* THE TIDE. One clock for the whole shore: low 8 s, flood 5, high 8, ebb 5. The sand of
   the flats is dry for ~12 s a cycle (a knight is swept once the water stands 30 over the
   feet); the strand, the refuge's deck and the jetty stand over the highest water. */
const TIDE = Object.freeze({ low:-70, high:170, lowT:10, floodT:5, highT:7, ebbT:4 });
const TIDE_PERIOD = TIDE.lowT + TIDE.floodT + TIDE.highT + TIDE.ebbT;
const SWEPT_DEPTH = 30, FLOAT_FREEBOARD = 16;

const CUES = Object.freeze({
  landfall:Object.freeze({ id:'shores-safe-harbor', src:'./audio/music/safe-harbor.mp3', title:'Safe Harbor',
    artist:'Aerth score', mood:'landfall after the storm', once:true }),
  bell:Object.freeze({ id:'shores-last-spark', src:'./audio/music/the-last-spark-of-darrow.mp3', title:'The Last Spark of Darrow',
    artist:'Aerth score', mood:'the bell drives them on' }),
  silenced:Object.freeze({ id:'shores-breaking', src:'./audio/music/the-breaking-of-the-keeps.mp3', title:'The Breaking of the Keeps',
    artist:'Aerth score', mood:'the bell stops', once:true }),
});

/* ── The three fights. The bell is the fight: it starts each one, drives each thrust, and
   the last one ends when it stops. ───────────────────────────────────────────────────── */
const ENCOUNTERS = [
  { id:'landing', circuit:'shores-landing', x1:COURT.x1 + 30, x2:SUN_ARCH_X - 30, y:COURT.y,
    trigger:(p) => p.x > 7250 && p.x < SUN_ARCH_X && p.y >= COURT.y - 10,
    posts:[ { x:7700, slot:0 }, { x:7960, slot:1 }, { x:8200, slot:2, ringer:true } ],
    waves:[], close:[], open:['sun-arch'], checkpoint:{ x:8150, y:COURT.y } },
  { id:'cliff', circuit:'shores-cliff', x1:SUN_ARCH_X + 30, x2:BELL_GATE_X - 30, y:COURT.y,
    trigger:(p) => p.x > 8700 && p.x < BELL_GATE_X && p.y >= COURT.y - 10,
    ledgeBell:true, period:2.6,
    waves:[ [ { x:9700, slot:0 }, { x:9880, slot:1 }, { x:9940, slot:2 } ] ],
    close:['sun-arch', 'bell-gate'], open:['sun-arch', 'bell-gate'], checkpoint:{ x:10180, y:COURT.y } },
  { id:'gate', circuit:'shores-gate', x1:HEAD.x1 + 30, x2:PALISADE_X - 30, y:HEAD.y,
    trigger:(p) => p.x > 11250 && p.y >= HEAD.y - 10,
    overseer:true, period:2.4, refill:3, postern:PALISADE_X - 50,
    posts:[ { x:11640, slot:0 }, { x:11770, slot:1 } ],
    waves:[], close:[], open:[], checkpoint:{ x:12250, y:HEAD.y } },
];

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildShoresLevel()); }
function buildShoresLevel(){
  // A face you cannot climb: coated both sides, no cling. Raised ground has no sides in
  // this engine, so every step up that is walked into from below carries one of these.
  const face = (x, top, h, extra) => Object.assign({ type:'wall', x, y:top, h, w:26, slickL:1, slickR:1, noCling:1, actArt:'face' }, extra || {});
  const ring = (r) => ({ type:'actRing', actId:'ring-' + r.id, x:r.x, y:r.y, w:30, h:30, shoreRing:1 });
  const bars = (id, x, down) => face(x, COURT.y + 880, 880, { actBars:id, actArt:'bars', gone:!down });
  const ground = (x1, x2, y, art) => Object.assign(GrAt(x1, x2, y), { actArt:art });
  const objects = [
    // THE WRECK LINE. The holed boat, grounded where the current left it.
    { type:'actWreck', kind:'ours', x:420, y:STRAND_Y, w:700, h:240 },
    ground(0, GUT.x1, STRAND_Y, 'strand'),
    { type:'actProp', kind:'boat-rest', x:340, y:STRAND_Y, w:40, h:40, restSiteAnchor:'holed-boat' },
    { type:'actProp', kind:'cask', actId:'cask', x:700, y:STRAND_Y, w:34, h:36, actTwoUp:1, actVerb:'LOOK' },
    { type:'actWreck', kind:'mast', x:1680, y:-160, w:34, h:640 },
    { type:'actWreck', kind:'mast', x:2130, y:-160, w:34, h:660 },
    ring(RINGS[0]), ring(RINGS[1]),
    ground(GUT.x2, HULL.x1, STRAND_Y, 'strand'),
    { type:'actWreck', kind:'hull', x:(HULL.x1 + HULL.x2) / 2, y:STRAND_Y, w:HULL.x2 - HULL.x1 + 240, h:HULL.deck - STRAND_Y },
    face(HULL.x1, HULL.deck, HULL.deck - STRAND_Y), face(HULL.x2, HULL.deck, HULL.deck - STRAND_Y),
    Pl((HULL.x1 + HULL.x2) / 2, HULL.x2 - HULL.x1, HULL.deck, { h:24, actArt:'hull-deck' }),
    ground(HULL.x1, HULL.x2, STRAND_Y, 'hidden'),
    ring(RINGS[2]), ring(RINGS[3]),
    ground(HULL.x2, BASIN.x1, STRAND_Y, 'dune'),
    // THE TIDE FLATS.
    face(BASIN.x1, STRAND_Y, STRAND_Y),
    ground(BASIN.x1, BASIN.x2, 0, 'flats'),
    { type:'actWreck', kind:'refuge', x:(REFUGE.x1 + REFUGE.x2) / 2, y:0, w:REFUGE.x2 - REFUGE.x1 + 120, h:REFUGE.deck },
    face(REFUGE.x1, REFUGE.deck, REFUGE.deck), face(REFUGE.x2, REFUGE.deck, REFUGE.deck),
    Pl((REFUGE.x1 + REFUGE.x2) / 2, REFUGE.x2 - REFUGE.x1, REFUGE.deck, { h:22, actArt:'refuge-deck' }),
    ring(RINGS[4]),
    ...FLOATS.map((f, i) => Pl(f.x, f.w, FLOAT_FREEBOARD, { h:16, actArt:'float', actFloat:i + 1, move:{ dx:0, dy:0, period:1 } })),
    ...WRACK_PERCHES.map(r => Pl(r.x, r.w, r.y, {h:18,actArt:'wrack-perch'})),
    // THE KING'S LANDING. Gilt, swept, and a scrap of violet on a nail.
    Pl((JETTY.x1 + JETTY.x2) / 2, JETTY.x2 - JETTY.x1, JETTY.y, { h:18, actArt:'jetty' }),
    { type:'actProp', kind:'cloth', actId:'cloth', x:6820, y:JETTY.y, w:30, h:60, actTwoUp:1, actVerb:'LOOK' },
    face(COURT.x1, COURT.y, COURT.y),
    ground(COURT.x1, HEAD.x1, COURT.y, 'court'),
    // The Bell Cliff stands behind everything on the road, so it draws first.
    { type:'actCliff', kind:'bell-cliff', x:9400, y:COURT.y, w:2700, h:900 },
    { type:'actProp', kind:'landing-bell', x:8260, y:COURT.y, w:40, h:120 },
    { type:'actArch', kind:'sun-arch', x:SUN_ARCH_X, y:COURT.y, w:120, h:420 },
    bars('sun-arch', SUN_ARCH_X, true),
    // THE BELL CLIFF. Hook up to the hoist and slam its split retaining cap.
    Pl(9320, 320, BELL_RIG.y, {h:20,actArt:'bell-shelf'}),
    {type:'actRing',actId:'ring-bell-rig',x:BELL_RIG.x,y:BELL_RIG.ringY,w:30,h:30,shoreRing:1},
    {type:'actProp',kind:'bell-cleat',x:BELL_RIG.x,y:BELL_RIG.y,w:50,h:30},
    { type:'actArch', kind:'bell-gate', x:BELL_GATE_X, y:COURT.y, w:120, h:420 },
    bars('bell-gate', BELL_GATE_X, false),
    ring(RINGS[5]), ring(RINGS[6]),
    face(HEAD.x1, HEAD.y, HEAD.y - COURT.y),
    // THE COLONY GATE.
    ground(HEAD.x1, LEN, HEAD.y, 'headland'),
    { type:'actPalisade', x:PALISADE_X, y:HEAD.y, w:60, h:520 },
    face(PALISADE_X, HEAD.y + 680, 680, { actId:'palisade', actArt:'palisade' }),
    { type:'actProp', kind:'gate-bar', actId:'gate', x:PALISADE_X - 46, y:HEAD.y, w:40, h:90, actTwoUp:1, actVerb:'LIFT THE BAR', actMute:1 },
    { type:'actOren', actId:'oren', x:POST.oren, y:HEAD.y, w:40, h:50, actTwoUp:1, actVerb:'TAKE HIS HAND', actMute:1 },
  ];
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[], enemies:[],
  };
}

/* ── Init (the level's build hook: objects exist, zone hydration has not run) ─ */
function refs(){ const r = {}; for(const o of G.obstacles) if(o.actId) r[o.actId] = o; return r; }
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  const A = G.actTwo = {
    stage:SHORES, t:0, tideT:0, water:TIDE.low, safe:{ x:SPAWN.x, y:SPAWN.y }, spawned:false,
    landed:done(c, 'shores-landed'), landfallT:0, stingerT:0, flash:0,
    enc:{}, fallen:[], tolls:[],
    ledge:{ x:OVERSEER_LEDGE.x, y:OVERSEER_LEDGE.y, st:done(c, 'shores-cliff') ? 'gone' : 'watch', t:0, ring:0, face:-1, alpha:1 },
    oren:{ x:POST.oren, y:HEAD.y, st:'kneel', t:0, flinch:0, warned:false, face:-1, vx:0 },
    gateOpen:done(c, 'shores-gate-open'), gateT:0, frontier:false, checkpoints:{},
  };
  for(const E of ENCOUNTERS)
    A.enc[E.id] = { st:done(c, E.circuit) ? 'done' : 'idle', wave:-1, waveT:0, foes:[], tollT:0.8, refillT:2.5, silenced:false, t:0, overseer:null };
  // Silenced at the gate, they run for the cliff path or back in through the postern.
  // Plain data, not a function: level state must survive save/restore (7.341: watched routes and the bot rely on it).
  A.enc.gate.fleeSplit = { left: HEAD.x1 - 40, right: PALISADE_X - 30 };
  setBars(['sun-arch'], A.enc.landing.st !== 'done');
  setBars(['bell-gate'], false);
  const r = refs();
  if(r.palisade) r.palisade.gone = A.gateOpen;
  // The bar can be lifted once the Sunguard is down — after a reload too, not only in the moment.
  if(r.gate) r.gate.actMute = A.gateOpen || A.enc.gate.st !== 'done';
  const P = kit.path();
  if(P.oren === 'helped'){ A.oren.st = 'follow'; A.oren.x = G.p.x - 60; A.oren.y = G.p.y; }
  else if(P.oren === 'struck') A.oren.st = 'fallen';
  placeFloats(A, true);
}
function setBars(ids, down){
  for(const o of G.obstacles) if(o.actBars && ids.includes(o.actBars)){
    if(o.gone === !down) continue;
    o.gone = !down; o.moveT = 0.5;
  }
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== SHORES) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A, p); }
  A.flash = Math.max(0, A.flash - dt * 2);
  if(A.landfallT > 0) A.landfallT = Math.max(0, A.landfallT - dt);
  if(A.stingerT > 0) A.stingerT = Math.max(0, A.stingerT - dt);
  for(const o of G.obstacles) if(o.moveT > 0) o.moveT = Math.max(0, o.moveT - dt);
  updateTide(A, dt, p);
  updateBellRig(A, p);
  for(const E of ENCOUNTERS) updateEncounter(A, E, A.enc[E.id], p, dt);
  updateLedge(A, dt);
  F.updateFallen(A, dt);
  updateOren(A, dt, p);
  updateCheckpoints(A, p);
  if(A.gateOpen) A.gateT = Math.min(1, A.gateT + dt * 1.2);
  // The Colony is a walked seam once it exists; until then the gate ends on a card.
  if(A.gateOpen && !A.frontier && p.x > FRONTIER_X && !p.dead && !A2.handles(SHORES + 1)) reachColony(A);
  A.tolls = A.tolls.filter(t => (t.t += dt) < 1.2);
}
function lateUpdate(dt, p){
  const A = G.actTwo; if(!A || A.stage !== SHORES) return;
  // The strand, the refuge, the jetty and the heights: anywhere over the highest water
  // that does not move.
  const f = p.floorPlat;
  if(p.onGround && f && !f.move && !f.actFloat && p.y >= TIDE.high + 20) A.safe = { x:p.x, y:p.y };
}
function firstFrame(A, p){
  if(!A.landed){
    A.landed = true; A.landfallT = 30;
    kit.latch(ZONE, 'shores-landed');
  }
  spawnAmbient();
  const L = A.enc.landing;
  if(L.st === 'idle') for(const s of ENCOUNTERS[0].posts) spawnBelled(ENCOUNTERS[0], L, s, 'post');
  const S = A.enc.gate;
  if(S.st === 'idle'){
    const E = ENCOUNTERS[2];
    S.overseer = spawnSunguard(E, S);
    for(const s of E.posts) spawnBelled(E, S, s, 'post');
  }
}
/* The shore's own life, kept off the Chainhook's lessons: nothing harries a knight hanging
   over the gut or on the hull's stern. One crab, out on the sand with the low water. */
function spawnAmbient(){
  for(const [x, lo, hi] of [[4900, 4400, 5400]]){
    const y = x < BASIN.x1 ? STRAND_Y : 0;
    const e = spawnEnemy('reefcrab', x);
    Object.assign(e, { y, baseY:y, safeY:y, safeX:x, noDrop:true, noticeRange:480, face:-1, frontShield:true, shieldFace:-1,
      turnDelay:1.05, patrolMin:lo, patrolMax:hi, shoreCrab:true });
  }
}

/* ── The tide ─────────────────────────────────────────────────────────────── */
function ease(k){ return k * k * (3 - 2 * k); }
function tideAt(t){
  const u = ((t % TIDE_PERIOD) + TIDE_PERIOD) % TIDE_PERIOD;
  if(u < TIDE.lowT) return TIDE.low;
  if(u < TIDE.lowT + TIDE.floodT) return TIDE.low + (TIDE.high - TIDE.low) * ease((u - TIDE.lowT) / TIDE.floodT);
  if(u < TIDE.lowT + TIDE.floodT + TIDE.highT) return TIDE.high;
  return TIDE.high - (TIDE.high - TIDE.low) * ease((u - TIDE.lowT - TIDE.floodT - TIDE.highT) / TIDE.ebbT);
}
function inWater(x, pad){ return (x > GUT.x1 - pad && x < GUT.x2 + pad) || (x > BASIN.x1 - pad && x < BASIN.x2 + pad); }
function updateTide(A, dt, p){
  // First approach always reveals the low-water road; thereafter the sea keeps time.
  if(p.x >= BASIN.x1 - 180 || A.tideStarted){ A.tideStarted = true; A.tideT += dt; }
  A.water = tideAt(A.tideT);
  placeFloats(A, false);
  if(!p.dead && inWater(p.x, 0) && p.y < A.water - SWEPT_DEPTH && !p.actHook && !G.physicalSeamCrossing) swept(A, p);
  // What the water covers cannot reach you, and does not try.
  for(const e of G.enemies) if(e.shoreCrab && !e.dead){ e.submerged = A.water > e.y + 16; if(e.submerged){ e.vx = 0; e.active = false; } }
}
function placeFloats(A, first){
  for(const o of G.obstacles){
    if(!o.actFloat) continue;
    const afloat = A.water + FLOAT_FREEBOARD > FLOAT_FREEBOARD + 2;
    const bob = afloat ? Math.sin(G.time * 1.3 + o.actFloat * 2.1) * 2 : 0;
    const y = Math.max(FLOAT_FREEBOARD, A.water + FLOAT_FREEBOARD) + bob;
    o.y0 = y; o.x0 = o.x0 == null ? o.x : o.x0;
    if(first){ o.y = y; o.x = o.x0; }
  }
}
/* Floodwater wounds and throws you upward in place. Only falling into the void
   rewinds position. Water is not dodged: a dash does not carry you through it. */
function swept(A, p){
  if(p.invuln > 0) return;
  p.dodgeTimer = 0;
  kit.burst(p.x, Math.max(A.water, 0), '#dfe8e6', 16);
  hurtPlayer(10, -1, true);
  if(p.dead) return;
  p.vy = -760; p.onGround = false; p.floorPlat = null;
  p.slamming = false; p.invuln = Math.max(p.invuln || 0, 1.2);
  if(meta.soundOn) SFX.land();
}
/* The void floor is also the camera's floor (cameraMinimumY). Over the gut it is deep, so
   a knight going in is followed down to the water and swept from it; everywhere else it
   sits just under world zero, so the view never opens onto ground below the flats. */
function voidFloor(p){ return p && p.x > GUT.x1 && p.x < GUT.x2 ? -400 : -48; }
/* THE CAMERA STANDS ON THE GROUND YOU ARE ON. The shore climbs in shelves (200, 0, 300,
   720); framing each from world zero would fill half the screen with the shelf's own
   body. Never above your feet, so a drop is always followed down. */
function cameraFloor(p){
  if(!p) return null;
  const x = p.x;
  const ground = x < GUT.x1 ? STRAND_Y : x < GUT.x2 ? -60 : x < BASIN.x1 ? STRAND_Y : x < JETTY.x1 ? 0 : x < HEAD.x1 ? COURT.y : HEAD.y;
  return Math.min(ground, Math.max(-60, p.y));
}

/* ── Foes: the King's people live in the Act Two core (kit.foes); these place them here ── */
const F = kit.foes;
function spawnBelled(E, S, s, st){
  return F.spawnBelled(S, { x:s.x, y:E.y, x1:E.x1, x2:E.x2, enc:E.id, slot:s.slot || 0, st, ringer:!!s.ringer,
    bellAt:s.ringer ? { x:8260, y:COURT.y + 110 } : null });
}
function spawnSunguard(E, S){
  return F.spawnSunguard(S, { x:POST.overseer, y:E.y, x1:E.x1, x2:E.x2, enc:E.id, home:POST.overseer, face:-1, st:'post', bell:'ringing' });
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== SHORES) return;
  const S = A.enc[e.enc]; if(!S) return;
  F.update(e, p, dt, A, S);
}
const toll = F.toll;

/* ── Encounters ───────────────────────────────────────────────────────────── */
function updateEncounter(A, E, S, p, dt){
  if(S.st === 'done') return;
  F.recordFallen(A, S, p);
  if(S.st === 'idle'){
    if(!p.dead && E.trigger(p)) begin(A, E, S);
    return;
  }
  S.t += dt;
  // The bell: from the ledge in the Bell Cliff; from the Sunguard's back at the gate.
  if(E.period && !S.silenced){
    S.tollT -= dt;
    if(S.tollT <= 0){
      S.tollT = E.period;
      if(E.ledgeBell && A.ledge.st === 'watch'){ A.ledge.ring = 1; toll(A, S, { x:A.ledge.x, y:A.ledge.y + 60 }); }
      else if(E.overseer && S.overseer && !S.overseer.dead){ const o = S.overseer; o.bellSwing = 1; toll(A, S, { x:o.x - o.shieldFace * 22, y:o.y + 36 }); strikeKneeling(A, o); }
    }
  }
  const alive = S.foes.filter(e => !e.dead);
  if(E.refill && !S.silenced){
    const standing = alive.filter(e => e.actFoe === 'belled').length;
    S.refillT -= dt;
    if(standing < E.refill && S.refillT <= 0){
      S.refillT = 3.4;
      const e = spawnBelled(E, S, { x:E.postern, slot:standing }, 'arrive');
      e.xp = 4;
    }
  }
  if(E.overseer){ if(S.overseer && S.overseer.dead) finish(A, E, S); return; }
  if(alive.length) return;
  // This encounter ends at its bell, not after another mandatory wave clear.
  if(E.ledgeBell && S.wave >= 0) return;
  if(S.wave + 1 < E.waves.length){
    S.waveT += dt;
    if(S.waveT > (S.wave < 0 ? 0.4 : 1.4)){ S.wave++; S.waveT = 0; for(const s of E.waves[S.wave]) spawnBelled(E, S, s, 'arrive'); }
  } else finish(A, E, S);
}
function updateBellRig(A, p){
  const S = A.enc.cliff;
  if(S.st !== 'live' || !p.slamming || !(p.vy > 0)) return;
  if(Math.abs(p.x - BELL_RIG.x) > 48 || p.y < BELL_RIG.y - 12 || p.y > BELL_RIG.y + 90) return;
  p.slamming = false; p.vy = -400;
  S.silenced = true; A.stingerT = 12;
  for(const f of S.foes) if(!f.dead){ f.st = 'flee'; f.t = 0; f.fleeX = BELL_GATE_X + 250; f.dropped = true; }
  kit.burst(BELL_RIG.x, BELL_RIG.y + 20, '#f3d67a', 22);
  G.shake = Math.max(G.shake || 0, 5);
  if(meta.soundOn) SFX.hit();
  finish(A, ENCOUNTERS[1], S);
}
function begin(A, E, S){
  S.st = 'live'; S.t = 0; S.tollT = 0.5;
  setBars(E.close, true);
  if(E.close.length){ G.shake = Math.max(G.shake || 0, 5); if(meta.soundOn) SFX.land(); }
}
function finish(A, E, S){
  S.st = 'done';
  kit.latch(ZONE, E.circuit);
  setBars(E.open, false);
  if(E.id === 'landing'){
    // Far up the cliff a bell answers the landing's. Somebody wants you to come on.
    A.tolls.push({ x:OVERSEER_LEDGE.x, y:OVERSEER_LEDGE.y + 60, t:0, far:true });
  }
  if(E.id === 'cliff'){ A.ledge.st = 'leave'; A.ledge.t = 0; }
  if(E.id === 'gate'){ const r = refs(); if(r.gate) r.gate.actMute = false; }
  try{ activateRuntimeCheckpoint(ZONE + ':' + E.id, E.checkpoint, 'checkpoint', null, true); }catch(_e){}
  try{ captureCurrentZonePersistence(); if(!G.levelSelectMode) persist(); }catch(_e){}
  if(meta.soundOn && SFX.pickup) SFX.pickup();
}
/* The overseer on the Bell Cliff's ledge: rings, and when there is nobody left to ring
   for, turns and goes up the cliff path toward the gate. */
function updateLedge(A, dt){
  const L = A.ledge;
  L.t += dt; if(L.ring > 0) L.ring = Math.max(0, L.ring - dt * 2.5);
  if(L.st === 'leave'){
    L.face = 1; L.x += 40 * dt;
    if(L.t > 1.2) L.alpha = Math.max(0, 1 - (L.t - 1.2) / 2);
    if(L.t > 3.4) L.st = 'gone';
  }
}
/* ── The kneeling man ─────────────────────────────────────────────────────── */
function strikeKneeling(A, o){
  const O = A.oren;
  if(O.st !== 'kneel') return;
  if(Math.abs(O.x - o.x) < 140){ O.flinch = 0.7; kit.burst(O.x, O.y + 30, '#e9e2cf', 5); }
}
function gateFightDone(A){ return A.enc.gate.st === 'done'; }
function updateOren(A, dt, p){
  const O = A.oren, r = refs(), o = r.oren, P = kit.path();
  O.t += dt; if(O.flinch > 0) O.flinch = Math.max(0, O.flinch - dt);
  if(o){ o.x = O.x; o.y = O.y; o.actMute = !(P.oren === 'kneeling' && O.st === 'kneel' && gateFightDone(A)); }
  if(O.st === 'kneel' && gateFightDone(A) && !O.warned && Math.abs(p.x - O.x) < 210 && Math.abs(p.y - O.y) < 90){
    O.warned = true;
    say(O, '<b>THE KNEELING MAN</b><br>He does not look up. “Don’t. It goes to whoever touches it.”', [
      ['I’m not afraid of it.', '“You should be. I was, the first month. After that you’re too tired.”'],
      ['What is it?', '“Nobody here calls it anything. Flowers come up through the wrappings. After a while the bell’s all you hear.”'],
      ['Then stay down.', '“Aye. Haven’t done anything else since the leaves turned.”'],
    ]);
  }
  if(O.st === 'rise'){ if(O.t > 1.1){ O.st = 'follow'; O.t = 0; } return; }
  if(O.st === 'follow') kit.follow(O, p, dt);
}
const say = kit.say;
function takeHand(A){
  const O = A.oren, P = kit.path();
  if(P.oren !== 'kneeling' || O.st !== 'kneel') return false;
  P.oren = 'helped'; kit.afflict();
  O.st = 'rise'; O.t = 0; O.face = Math.sign(G.p.x - O.x) || -1;
  kit.burst(O.x, O.y + 40, '#f4f1e6', 16);
  if(meta.soundOn && SFX.pickup) SFX.pickup();
  try{ hudUpdate(); }catch(_e){}
  say(O, '<b>THE KNEELING MAN</b><br>“…You’d do that? I’ve knelt on this shore since the leaves turned, and not one of them—” ' +
    'He takes the hand and stands. His palm is dry and hot. Under your gauntlet something white begins to open.', [
      ['Can you walk?', '“If you’re going in there, aye. I can.”'],
      ['Who are you?', '“Nobody the King remembers. Ask me again when there’s water.”'],
      ['Keep up.', '“I’ll keep up. I’ve been following people a long while.”'],
    ]);
  return true;
}
/* A blade that lands on him. The first time he only covers his head; the second time
   is a choice, and it is made at once. */
function swing(p, w){
  const A = G.actTwo; if(!A || A.stage !== SHORES) return;
  const O = A.oren, P = kit.path();
  if(O.st !== 'kneel' || P.oren !== 'kneeling' || !gateFightDone(A)) return;
  const token = A.orenToken || (A.orenToken = { orenStrike:true });
  if(p.swingHits.indexOf(token) >= 0) return;
  const fwd = (O.x - p.x) * p.face;
  if(fwd < -20 || fwd > (w.range || 50) + 30 || Math.abs(p.y - O.y) > 60) return;
  p.swingHits.push(token);
  P.strikes = (P.strikes || 0) + 1;
  O.flinch = 1; kit.burst(O.x, O.y + 30, '#b8413a', 8);
  if(meta.soundOn) SFX.hit();
  if(P.strikes === 1){ say(O, '<b>THE KNEELING MAN</b><br>He covers his head. He does not reach for the hammer.'); kit.savePath(); return; }
  // FORSAKEN. Sealed here, not later.
  P.oren = 'struck'; P.forsaken = true;
  O.st = 'fallen'; O.t = 0;
  A.flash = 1; G.shake = Math.max(G.shake || 0, 4);
  A.tolls.push({ x:PALISADE_X + 400, y:HEAD.y + 200, t:0, far:true, cold:true });
  kit.savePath();
}

/* ── Up targets: the cask, the cloth, the kneeling man, the gate's bar ───── */
function interact(o){
  const A = G.actTwo; if(!A || A.stage !== SHORES) return false;
  if(o.actId === 'cask'){
    say(o, '<b>THE WATER CASK</b><br>Stove in on the rocks. The last of the water went on the crossing, and the sea is no use for this thirst. Your mouth is dry as ash.');
    return true;
  }
  if(o.actId === 'cloth'){
    say(o, '<b>VIOLET SILK</b><br>Torn from a hem on the jetty’s gilt nails, and left there. It is stiff with a fine white dust, and it smells of flowers.'
      + (root.BladefallRiftShards ? root.BladefallRiftShards.look('cloth') : ''));   // Act Three: the Echo’s rift shard
    return true;
  }
  if(o.actId === 'oren') return takeHand(A);
  if(o.actId === 'gate' && !o.actMute && !A.gateOpen){
    A.gateOpen = true; A.gateT = 0; o.actMute = true;
    const r = refs(); if(r.palisade) r.palisade.gone = true;
    kit.latch(ZONE, 'shores-gate-open');
    G.shake = Math.max(G.shake || 0, 4);
    if(meta.soundOn) SFX.land();
    return true;
  }
  return false;
}

/* ── The road on: the Colony is the next region ───────────────────────────── */
function reachColony(A){
  A.frontier = true;
  try{ commitStageCompletion(); }catch(_e){}
  try{ recordWorldClear(); }catch(_e){}
  try{ recordSessionClear(SHORES); }catch(_e){}
  try{ captureCurrentZonePersistence(); if(!G.levelSelectMode) persist(); }catch(_e){}
  const P = kit.path();
  const line = P.oren === 'helped' ? 'The bandaged man walks in beside you, into the smoke. The flowers on your cloak have opened.'
    : P.oren === 'struck' ? 'Nobody inside the gate comes out to meet you.'
    : 'Behind you, the kneeling man has not moved.';
  kit.showFrontierCard('THE LANDING SHORES · BEHIND YOU', 'CHARMA SHORES', 'The Colony', line);
}
/* Through the open gate is the Colony; back out of it, the gate — and whoever still kneels there. */
function seamSpec(){
  const A = G.actTwo, p = G.p;
  if(!A || A.stage !== SHORES || !A.gateOpen || !A2.handles(SHORES + 1)) return null;
  return { connector:'shores-colony', zone:ZONE, targetStage:SHORES + 1, warm:p.x >= LEN - 1400, cross:p.x >= LEN - 62 && p.face > 0, forward:true, commitClear:true };
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  if(plan.connectorId === 'cliffs-landing') return { x:SPAWN.x, y:SPAWN.y };
  if(plan.connectorId === 'shores-colony') return { x:LEN - 160, y:HEAD.y };
  return null;
}

/* ── Checkpoints: the dune before the flats, the jetty, the headland ─────── */
const CHECKPOINTS = [
  { id:'dune', x:3700, y:STRAND_Y, when:(p) => p.x > 3600 && p.x < BASIN.x1 && p.y >= STRAND_Y - 2 },
  { id:'jetty', x:6900, y:JETTY.y, when:(p) => p.x > JETTY.x1 + 60 && p.x < 7150 && p.y >= JETTY.y - 2 },
  { id:'headland', x:10900, y:HEAD.y, when:(p) => p.x > HEAD.x1 + 40 && p.x < 11100 && p.y >= HEAD.y - 2 },
];
function updateCheckpoints(A, p){
  if(!p.onGround || p.dead) return;
  for(const c of CHECKPOINTS) if(!A.checkpoints[c.id] && c.when(p)){
    A.checkpoints[c.id] = true;
    try{ activateRuntimeCheckpoint(ZONE + ':' + c.id, { x:c.x, y:c.y }, 'checkpoint', null, true); }catch(_e){}
  }
}

/* ── Music: landfall once, the bell's loop while one rings, its stopping once ─ */
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== SHORES) return null;
  if(A.stingerT > 0) return CUES.silenced;
  const ringing = (A.enc.cliff.st === 'live') || (A.enc.gate.st === 'live' && !A.enc.gate.silenced);
  if(ringing) return CUES.bell;
  if(A.landfallT > 0) return CUES.landfall;
  return null;
}

A2.register(SHORES, Object.freeze({
  level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue,
}));
root.BladefallLandingShores = Object.freeze({
  SHORES, ZONE, tideAt, inWater, constants:Object.freeze({ LEN, STRAND_Y, SPAWN, GUT, HULL, BASIN, REFUGE, FLOATS, JETTY, COURT,
    SUN_ARCH_X, BELL_GATE_X, HEAD, PALISADE_X, FRONTIER_X, OVERSEER_LEDGE, POST, RINGS, TIDE, SWEPT_DEPTH,
    FLOAT_FREEBOARD, WRACK_PERCHES, BELL_RIG, ENCOUNTERS, BELLED:F.BELLED, SUNGUARD:F.SUNGUARD }),
});
})(typeof window !== 'undefined' ? window : globalThis);
