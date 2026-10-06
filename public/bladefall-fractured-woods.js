/* Bladefall — ACT THREE · The Fractured Woods (stage 22), 2026-09-24.

   The second echo: Black Woods after the Echo walked it backwards. The same lesson — the woods
   lie — made exact, at night, with the Muster on the road. The kit is the one the woods gave
   you: you come in with a single jump, and the Oathblade is still root-bound in its stump.

     THE BURNT REFUGE — the thorn beds, four lanes rolling in a wave; stones to wait on.
     THE OATHBLADE CLEARING — the thorn bed is too long to run; the road is a crumbling loop over
       it, and at its top a counterweight. Stand on it and, below you, the roots let the blade go.
       Drop off the far side and take it — with the outrider that guards it already coming.
     THE BITING CANOPY — the canopy is the road now: the floor under it is gone.
     THE MIRROR THICKET (the C-side) — the lie at its strictest. Every branch carries its resin on
       one edge, and holds only while the wind blows against that edge. The wind turns on a beat
       (the streamers show it, and flutter before it turns). Climb on the beat. Branches with resin
       on both edges hold in either wind: rests. Branches with none never hold: the lie.
     THE ROOTBOUND PASSAGE — down out of the crown over the void, step to narrow step, past the
       roots' guards. */
(function installFracturedWoods(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 22, ZONE = 'fractured-woods', SOURCE = 1;
const LEN = 10400;
const SPAWN = { x:140, y:0 };

/* ── Geometry (world units; y up; the floor is y 0; below it the void) ──────── */
const GROUND = [ [0, 3950], [4700, 6560], [6560, 6780], [9100, LEN] ]; // catch basin under the first two wind hops only
const THORNS = [                                     // [x, w, period, upT, phase] — the refuge's rolling wave, the clearing, the road
  [900, 160, 2.4, 1.2, 0], [1150, 160, 2.4, 1.2, 0.6], [1400, 160, 2.4, 1.2, 1.2], [1650, 160, 2.4, 1.2, 1.8],
  [2700, 520, 2.0, 1.4, 0],
  [5000, 160, 2.4, 1.0, 0], [5500, 180, 2.4, 1.0, 1.2],             // down 1.4 s: a 208-unit crossing takes 1.05
];
const STONES = [                                     // [x, w, y, crumble?]
  [1030, 40, 55], [1280, 40, 55], [1530, 40, 55], [1780, 40, 55],
  [2400, 100, 60], [2540, 90, 120], [2680, 90, 180, 1], [2820, 90, 240],
  [3900, 120, 50], [4050, 110, 110], [4200, 110, 170], [4360, 120, 230], [4520, 110, 170], [4680, 110, 110],
];
const COUNTERWEIGHT = { x:3000, w:120, y:300 };
const STUMP_X = 3280;                               // just past the loop, in the outrider's beat
/* The thicket: resin 'E' holds while the wind comes from the east, 'W' from the west, 'B' always,
   'N' never. Rises of 60, gaps of 50: every jump is one jump — on the beat. */
const THICKET = { x1:6560, x2:7700, period:2.6, warn:0.45 };   // warn < a 60-rise jump's 0.50 s airtime: jump as they flutter, land after the turn
const BRANCHES = [
  { x:6620, y:60, r:'E' }, { x:6740, y:120, r:'W' }, { x:6860, y:180, r:'E' }, { x:6990, y:240, r:'B', w:90 },
  { x:7110, y:300, r:'W' }, { x:6990, y:360, r:'E' }, { x:6870, y:420, r:'W' }, { x:6990, y:480, r:'B', w:90 },
  { x:7110, y:540, r:'E' }, { x:7230, y:600, r:'W' },
  { x:6740, y:60, r:'N' }, { x:7230, y:360, r:'N' }, { x:6870, y:540, r:'N' },    // the lie
];
const CROWN = { x:7400, y:660, w:160 };
const STEP_W = 90;                                   // 90-unit gaps: walking off falls short (measured), every step is a hop
const STAIRS = [ [7580, 590], [7760, 520], [7940, 450], [8120, 380], [8300, 310], [8480, 240], [8660, 170], [8840, 100], [9020, 30] ];
function groundAt(x){ for(const g of GROUND) if(x >= g[0] && x < g[1]) return 0; return null; }
const CHECKPOINTS = [ { id:'refuge', x:2000 }, { id:'clearing', x:3760 }, { id:'road', x:4760 }, { id:'thicket', x:6400 },
  { id:'crown', x:CROWN.x, y:CROWN.y }, { id:'roots', x:9200 } ];
const CUES = Object.freeze({
  thicket:Object.freeze({ id:'fractured-violet-portals', src:'./audio/music/the-archive-of-violet-portals.mp3', title:'The Archive of Violet Portals',
    artist:'Aerth score', mood:'the Mirror Thicket: climb on the wind' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function buildLevel(){
  const objects = [];
  GROUND.forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'loam' })));
  THORNS.forEach(t => objects.push(Object.assign(Sp(t[0], 0, { w:t[1], period:t[2], upT:t[3], phase:t[4], dmg:12 }), { fracturedThorns:1, rootThorns:1, actArt:'thorn-bed' })));
  STONES.forEach(s => objects.push(Object.assign(Pl(s[0], s[1], s[2]), { actArt:'bough', crumble:s[3] ? 1 : undefined })));
  objects.push(Object.assign(Pl(COUNTERWEIGHT.x, COUNTERWEIGHT.w, COUNTERWEIGHT.y), { actArt:'counterweight', counterweight:1 }));
  objects.push({ type:'actStump', actId:'stump', x:STUMP_X, y:0, w:60, h:60, actTwoUp:1, actVerb:'TAKE THE OATHBLADE', actMute:1 });
  BRANCHES.forEach((b, i) => objects.push(Object.assign(Pl(b.x, b.w || 70, b.y), { actArt:'branch', resin:b.r, branch:i })));
  objects.push(Object.assign(Pl(CROWN.x, CROWN.w, CROWN.y), { actArt:'crown' }));
  STAIRS.forEach(s => objects.push(Object.assign(Pl(s[0], STEP_W, s[1]), { actArt:'root-step' })));
  objects.push({ type:'actStreamer', x:THICKET.x1 - 20, y:0, w:20, h:260 }, { type:'actStreamer', x:THICKET.x2 + 20, y:0, w:20, h:260 },
    { type:'actStreamer', x:7300, y:680, w:20, h:200 },
    { type:'actStreamer', x:6925, y:240, w:20, h:125 }, { type:'actStreamer', x:6925, y:480, w:20, h:125 });
  objects.push({ type:'actClock', x:430, y:0, w:30, h:80 });
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:260, y:0, w:40, h:20, restSiteAnchor:'woods-embers' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'outrider', x:3400, patrol:[3100, 3700], noDrop:true },                          // it comes for the blade
      { t:'flyer', x:4300, y:330, patrol:[4000, 4650], noDrop:true },                        // canopy divers
      { t:'toxling', x:4200, y:170, patrol:[4150, 4250], noDrop:true },
      { t:'shieldbearer', x:5250, patrol:[5100, 5420], noDrop:true },
      { t:'outrider', x:6000, patrol:[5750, 6400], noDrop:true },
      { t:'shadeling', x:8120, y:380, patrol:[8090, 8150], noDrop:true },                   // the roots' stalker and guard
      { t:'grunt', x:8660, y:170, patrol:[8630, 8690], noDrop:true },
      { t:'linesman', x:9700, patrol:[9500, 9900], noDrop:true },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  const armed = done(c, 'fw-blade');
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    roots:done(c, 'fw-roots') || armed, release:done(c, 'fw-roots') || armed ? 1 : 0,
    armed, wind:'E', windT:0, warn:false, crowned:done(c, 'fw-crown'), over:false };
  // The woods' kit: the single jump; the blade only once it is taken from the stump.
  F.setKit(armed ? ['jump', 'weapon'] : ['jump']);
  const stump = G.obstacles.find(o => o.actId === 'stump'); if(stump) stump.actMute = !(G.actTwo.roots && !armed);
  applyWind(G.actTwo);
}
function firstFrame(){ F.muster(); }

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  if(A.roots) A.release = Math.min(1, (A.release || 0) + dt);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  updateCounterweight(A, p);
  updateWind(A, dt);
  if(!A.crowned && !p.dead && p.onGround && Math.abs(p.y - CROWN.y) < 4 && Math.abs(p.x - CROWN.x) < CROWN.w / 2){ A.crowned = true; kit.latch(ZONE, 'fw-crown'); A.flash = .4; }
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true; F.clear(STAGE);
    F.endCard('THE FRACTURED WOODS · BEHIND YOU', 'THE FRACTURED CAUSEWAY', 'Act Three · the next echo',
      'Behind you the thicket goes on turning in the wind. Ahead the Causeway’s machines are running backwards.', false); }
}
function lateUpdate(){}

/* The counterweight at the top of the loop: stand on it and the roots let the blade go. */
function updateCounterweight(A, p){
  if(A.roots || p.dead || !p.onGround || Math.abs(p.y - COUNTERWEIGHT.y) > 4 || Math.abs(p.x - COUNTERWEIGHT.x) > COUNTERWEIGHT.w / 2) return;
  A.roots = true; kit.latch(ZONE, 'fw-roots'); A.flash = .5; G.shake = Math.max(G.shake || 0, 6);
  try{ if(meta.soundOn) SFX.hit(); }catch(_e){}
  const stump = G.obstacles.find(o => o.actId === 'stump'); if(stump) stump.actMute = false;
  kit.burst(STUMP_X, 30, '#9a7a4a', 20);
}
function interact(o){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return false;
  if(o.actId === 'stump' && A.roots && !A.armed){
    A.armed = true; o.actMute = true; kit.latch(ZONE, 'fw-blade');
    F.grantBlade();
    A.flash = .6; kit.burst(STUMP_X, 40, '#dff6ff', 24);
    try{ if(meta.soundOn) SFX.magic(); }catch(_e){}
    A.queue.push({ src:o, accent:'#dff6ff', html:'<b>THE OATHBLADE</b><br>The roots let it go all at once. It is colder than it was, and it rings a little when it moves, like something is inside it that was not before.' });
    return true;
  }
  return false;
}

/* THE WIND. It turns on a beat; the streamers flutter for the last 0.45 s before it does. */
function updateWind(A, dt){
  A.windT += dt;
  if(A.windT >= THICKET.period){ A.windT -= THICKET.period; A.wind = A.wind === 'E' ? 'W' : 'E';
    try{ if(meta.soundOn && Math.abs(G.p.x - (THICKET.x1 + THICKET.x2) / 2) < 900) SFX.hit(); }catch(_e){} }
  A.warn = A.windT > THICKET.period - THICKET.warn;
  // Hydration / player flags can restore an object's previous gone state. The
  // live wind, rather than saved geometry, is authoritative on every frame.
  applyWind(A);
}
function holds(resin, wind){ return resin === 'B' || resin === wind; }
function applyWind(A){ for(const o of G.obstacles) if(o.actArt === 'branch') o.gone = !holds(o.resin, A.wind); }
function thornState(o, time){
  const t = ((time + o.phase) % o.period + o.period) % o.period;
  return { up:t < o.upT, warn:t > o.period - .4, growth:Math.max(0, (t - (o.period - .4)) / .4) };
}

function updateFoe(){}
function swing(){}
/* Below the road is the void: fall and you are back at the last fire. */
function voidFloor(){ return -140; }
function cameraFloor(p){ if(!p) return null; return Math.max(0, Math.min(p.y, 0)); }
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 400) return { connector:'fo-fw', zone:ZONE, targetStage:21, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE ? F.seamOn(STAGE, ZONE, 'fw-fc', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fw-fc' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };   // back from the canyons: at the tunnel
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  const p = G.p;
  if(p.x > THICKET.x1 - 200 && p.x < THICKET.x2 + 100 && !A.crowned) return CUES.thicket;
  return null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedWoods = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, holds, thornState, constants:Object.freeze({ LEN, SPAWN, GROUND, THORNS, STONES, COUNTERWEIGHT, STUMP_X, THICKET,
    BRANCHES, CROWN, STAIRS, STEP_W, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
