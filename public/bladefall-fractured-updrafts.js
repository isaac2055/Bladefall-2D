/* Bladefall — ACT THREE · The Fractured Updrafts (stage 23), 2026-09-24.

   The third echo: Updraft Canyons after the Echo walked it backwards, in a storm at night. The
   canyons breathe the wrong way now: every thermal INHALES — lifts you, as it always did — and
   then EXHALES, and the exhale throws you down. The kit is the one the canyons were entered with:
   one jump, the Oathblade, the dash. The Aerie Pack is gone; the harness hangs empty.

     THE ROOTBREACH — the three dash gaps, made exact: a plain one; one under the canyon's teeth
       (dash late, at the top of the jump, or the early dash's high arc meets them); a long one
       only the early dash clears.
     THE FIRST BREATH — one column over solid floor: go in on the inhale, step off at the top.
     THE BELLOWS — two columns over the void, breathing against each other: ride one, dash into
       the other as it begins to inhale, and up onto the Empty Aerie.
     THE KITE DROP — down the terraces, then one gap too long for two dashes: a crystal on the way down.
     THE CHOIR FLOOR — the Muster on the canyon floor.
     THE LUNG (the C-side) — a shaft over the void. Four columns, left–right–left–right, each inhaling
       as the last exhales; none reaches the next. Ride, and leave each one for the next on the
       breath. A dash cuts through an exhale, as it always cut through the lift.
     THE SIGNAL CROWN — the plinth is empty; down the ledges to the canyon path. */
(function installFracturedUpdrafts(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 23, ZONE = 'fractured-updrafts', SOURCE = 3;
const LEN = 10400;
const SPAWN = { x:140, y:0 };

/* ── Geometry (world units; y up; the floor is y 0; below it the void) ──────── */
const GROUND = [ [0, 700], [1000, 1300], [1620, 1880], [2300, 3150], [6440, 7400], [9300, LEN] ];   // the First Breath is over solid floor
const LEDGES = [                                     // [x, w, y, pillar?] — raised rock; a pillar runs down into the dark
  [3005, 290, 250, 1],                               // the First Breath's landing
  [4045, 950, 720, 1],                               // the Empty Aerie
  [4875, 150, 640], [5315, 130, 460],               // the Kite Drop: then 1180 to the choir floor, 460 down
  [8075, 450, 1040, 1],                              // the Signal Crown
  [8600, 200, 700, 1], [9000, 200, 420, 1],          // down to the canyon path
];
/* The canyon's teeth over the second gap: the early dash's arc (up to 153) meets them; the jump
   (78) and the dash at its top (81) pass under — a head at 44 above the feet. */
const TEETH = [ { x1:1330, x2:1600, y:132 } ];
/* The breath: every column inhales for half the beat and exhales for the other half. */
const BREATH = { period:2.8, duty:0.5, tell:0.45, exhale:3000, exhaleCap:620 };
/* A column lifts at 330 a second (measured) and overshoots its top by ~40: every ride here is
   ~0.9 s of a 1.4 s inhale, so there is a window to enter — and none to dawdle. */
const COLUMNS = [                                    // x centre, y bottom, w, h, phase (s)
  { id:'first', x:2800, y:0, w:100, h:280, phase:0 },
  { id:'b1', x:3220, y:200, w:100, h:300, phase:0 },
  { id:'b2', x:3500, y:420, w:100, h:320, phase:1.4 },
  { id:'l1', x:7500, y:-170, w:100, h:460, phase:0, lung:1 },
  { id:'l2', x:7780, y:200, w:100, h:400, phase:1.4, lung:1 },
  { id:'l3', x:7500, y:470, w:100, h:400, phase:0, lung:1 },
  { id:'l4', x:7780, y:780, w:100, h:300, phase:1.4, lung:1 },
];
/* Jump + early dash + a second dash from the last terrace lands ~6354 (measured): the floor starts at
   6440, so only the crystal on the arc's way down (it gives back the jump and the dash) reaches it
   (jump + dash after it lands ~6500; a third dash, well past). */
const CRYSTALS = [ [5800, 570] ];
const THORNS = [ [6900, 160, 2.4, 1.0, 0] ];
const LUNG = { x1:7400, x2:7900 };
const CROWN = { x:8075, y:1040, x1:7850, x2:8300 };
function groundAt(x){ for(const g of GROUND) if(x >= g[0] && x < g[1]) return 0; return null; }
const CHECKPOINTS = [ { id:'rootbreach', x:2380 }, { id:'first-breath', x:3000, y:250 }, { id:'aerie', x:3760, y:720 },
  { id:'kite', x:5315, y:460 }, { id:'choir', x:6560 }, { id:'lung', x:7300 }, { id:'crown', x:7950, y:1040 }, { id:'path', x:9400 } ];
const CUES = Object.freeze({
  lung:Object.freeze({ id:'fractured-archmage', src:'./audio/music/archives-of-the-archmage.mp3', title:'Archives of the Archmage',
    artist:'Aerth score', mood:'the Lung: leave each breath for the next' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function buildLevel(){
  const objects = [];
  GROUND.forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'basalt' })));
  LEDGES.forEach(l => objects.push(Object.assign(Pl(l[0], l[1], l[2]), { h:40, actArt:'ledge', pillar:l[3] ? 1 : undefined })));
  THORNS.forEach(t => objects.push(Object.assign(Sp(t[0], 0, { w:t[1], period:t[2], upT:t[3], phase:t[4], dmg:12 }), { fracturedThorns:1 })));
  COLUMNS.forEach(c => objects.push({ type:'updraft', x:c.x, y:c.y, w:c.w, h:c.h, pulsePeriod:BREATH.period, pulsePhase:c.phase,
    pulseDuty:BREATH.duty, fuColumn:c.id, actArt:'column' }));
  CRYSTALS.forEach(c => objects.push(Cry(c[0], c[1])));
  objects.push({ type:'actTeeth', x:(TEETH[0].x1 + TEETH[0].x2) / 2, y:TEETH[0].y, w:TEETH[0].x2 - TEETH[0].x1, h:40 });
  objects.push({ type:'actHarness', x:4300, y:720, w:40, h:90 });
  objects.push({ type:'actPlinth', x:8200, y:1040, w:60, h:60 });
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:3860, y:720, w:40, h:20, restSiteAnchor:'aerie-cinders' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'shieldbearer', x:4250, y:720, patrol:[4000, 4450], noDrop:true },          // the aerie is held
      { t:'signaler', x:4480, y:720, patrol:[4400, 4500], noDrop:true },
      { t:'flyer', x:5000, y:760, patrol:[4750, 5400], noDrop:true },                  // storm divers over the drop
      { t:'stormmote', x:5750, y:640, patrol:[5550, 6000], noDrop:true },
      { t:'grunt', x:6760, patrol:[6640, 6860], noDrop:true },
      { t:'outrider', x:7000, patrol:[6700, 7150], noDrop:true },
      { t:'linesman', x:7250, patrol:[7100, 7350], noDrop:true },
      { t:'outrider', x:9700, patrol:[9450, 10000], noDrop:true },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    crowned:kit.circuitSet(c, 'fu-crown'), bitten:0, over:false };
  // The canyons' kit: jump, blade, dash — and no Pack.
  F.setKit(['jump', 'weapon', 'dash']);
}
function firstFrame(){ F.muster(); }

/* ── The breath ────────────────────────────────────────────────────────────── */
function breath(c, t){
  const P = BREATH.period, q = ((t + c.phase) % P + P) % P, inT = P * BREATH.duty;
  return q < inT ? { inhale:true, left:inT - q } : { inhale:false, left:P - q };
}
function inside(p, c){ return Math.abs(p.x - c.x) < c.w / 2 + (p.w || 26) / 2 && p.y >= c.y && p.y < c.y + c.h; }
/* The inhale is the engine's own pulsing updraft. The exhale is this: inside a column that is
   breathing out, you are thrown down — unless you are dashing, which rides through it. */
function exhale(p, dt){
  if(p.dodgeTimer > 0 || p.dead) return;
  for(const c of COLUMNS){
    if(breath(c, G.time).inhale || !inside(p, c)) continue;
    p.vy = Math.min(p.vy + BREATH.exhale * dt, BREATH.exhaleCap); p.jumpCutOk = false;
  }
}
/* The canyon's teeth: a head that reaches them is bitten and knocked down. */
function teeth(A, p, dt){
  if(p.dead) return;
  A.bitten = Math.max(0, A.bitten - dt);
  for(const t of TEETH){
    if(p.x < t.x1 || p.x > t.x2 || p.y + (p.h || 44) < t.y || p.y > t.y + 40 || A.bitten > 0) continue;
    A.bitten = 0.8;
    try{ hurtPlayer(12, -(p.face || 1), true); }catch(_e){}
    p.vy = Math.max(p.vy, 240); // Apply after the shared damage kick.
  }
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  exhale(p, dt);
  teeth(A, p, dt);
  if(!A.crowned && !p.dead && p.onGround && Math.abs(p.y - CROWN.y) < 4 && p.x > CROWN.x1 && p.x < CROWN.x2){ A.crowned = true; kit.latch(ZONE, 'fu-crown'); A.flash = .4; }
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true; F.clear(STAGE);
    F.endCard('THE FRACTURED UPDRAFTS · BEHIND YOU', 'THE FRACTURED MARKSMAN', 'Act Three · the next echo',
      'Behind you the canyons go on breathing. Ahead, on the watch road, something is keeping count of you.', false); }
}
function lateUpdate(){}
function interact(){ return false; }
function updateFoe(){}
function swing(){}
function voidFloor(){ return -140; }
/* In the two climbs the camera looks UP: the next column and the ledge above are what you must see.
   (Normally a rising knight sits a quarter of the way down the screen; here, 60%.) */
function cameraFloor(p){
  if(!p) return null;
  const climbing = (p.x > 3150 && p.x < 3650 && p.y > 150) || (p.x > LUNG.x1 && p.x < LUNG.x2 + 60 && p.y > 0);
  return climbing ? Math.max(0, p.y - 170) : 0;
}
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 400) return { connector:'fc-fu', zone:ZONE, targetStage:25, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE ? F.seamOn(STAGE, ZONE, 'fu-fm', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fu-fm' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };   // back from the watch road: at the tunnel
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  const p = G.p;
  if(p.x > LUNG.x1 - 150 && p.x < LUNG.x2 + 100 && !A.crowned) return CUES.lung;
  return null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedUpdrafts = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, breath, inside, constants:Object.freeze({ LEN, SPAWN, GROUND, LEDGES, TEETH, BREATH, COLUMNS,
    CRYSTALS, THORNS, LUNG, CROWN, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
