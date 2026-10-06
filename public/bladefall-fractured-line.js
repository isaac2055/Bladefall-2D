/* Bladefall — ACT THREE · The Fractured Line (stage 35), 2026-09-25.

   The fifteenth echo: the Deep Line after the Echo walked it backwards. The rail is the same rail and the
   cart the same cart, but the line has been cut where it was whole: every fork has lost its safe road, and
   the only speed that counts is speed you earn in the air. A cart ride, east, as the original was. The
   cart takes the kit away as it always did (it jumps once and throws a 360, and the sword still swings).
   The Muster applies.

     THE DEAD SIGNAL: the descent, with jets on a beat.
     THE CUT FORK: the switch, and no low road — it ends in the dark. Lean at the post or fall; the high
       line crumbles faster than it did.
     THE FALLING BRIDGE, LONGER: six spans that start failing before the cart reaches them.
     THE TRICK GAPS: gaps each only crossed with the surge a clean 360 over the last one gave.
     THE BLACK LINE (the C-side): spans over the void that are there only on their beat. Pace the cart —
       lean, rein, throw the 360 for the surge — so each is under you when it is. */
(function installFracturedLine(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 35, ZONE = 'fractured-line', SOURCE = 15;
const LEN = 13900;
const SPAWN = { x:160, y:300 };

/* ── Geometry (world units; y up; the rail's datum is y 0) ─────────────────── */
const HEAD = { x0:0, x1:700, y:300 };
const DESCENT = [ [700, 1200, 300, 160], [1200, 1650, 160, 0] ];
const JETS = [ [1950, 0.3], [2200, 1.5] ];                       // x, phase (period 2.6, up .9)
const FORK = { sw:2540, pow:980, lowEnd:2900, voidTo:4400,
  high:[ ['pl', 3220, 540], ['rc', 3610, 240, 1.35], ['pl', 3920, 340], ['rc', 4220, 260, 1.3] ], y:220, slope:[4350, 4750] };
const BRIDGE = { x0:5000, n:6, w:280, step:300, delay:1.6, trigger:420 };
/* The Trick Gaps: [x0, width]. Measured on the flat: a held cart jump is 0.87 s in the air, so it reaches
   ~0.87 × speed — 229 at rest (270), ~374 leaning (430), ~496 with full momentum (570), ~640 with a clean
   360's surge (+190 for 1.5 s). The first gap asks for the lean; the next two for the surge a clean 360 over
   the one before gave, taken off inside its 1.5 s. */
const TRICK = { gaps:[ [7700, 340], [8390, 505], [9245, 505] ] };   // 505 is past 496, the best without the surge; windows measured below
/* The Black Line: planks over the void, solid only while the wave's light is on them. The light travels at
   each stretch's pace — at rest (270), reined in (110), leaning (570) — and is `upT` of every `period` long.
   Ride inside it: match its pace. */
const BLACK = { x0:10500, secs:[ [10500, 11400, 270], [11400, 11700, 110], [11700, 12900, 570] ], period:2.8, upT:1.8, plank:100, end:12900 };
function waveT(x){ let t = 0; for(const [a, b, v] of BLACK.secs){ if(x <= a) break; t += (Math.min(x, b) - a) / v; } return t; }
const CHECKPOINTS = [ { id:'head', x:300, y:300 }, { id:'fork', x:2380 }, { id:'bridge', x:4800 }, { id:'tricks', x:6900 }, { id:'black', x:10150 } ];
function groundSegs(){
  const cuts = [ [FORK.lowEnd, FORK.voidTo], [BRIDGE.x0, BRIDGE.x0 + BRIDGE.n * BRIDGE.step] ]
    .concat(TRICK.gaps.map(([x, w]) => [x, x + w])).concat([[BLACK.x0, BLACK.end]]);
  const segs = []; let from = 1650;
  for(const [a, b] of cuts.sort((p, q) => p[0] - q[0])){ if(a > from) segs.push([from, a]); from = Math.max(from, b); }
  segs.push([from, LEN]);
  return segs;
}
function groundAt(x){ if(x < HEAD.x1) return HEAD.y; for(const g of groundSegs()) if(x >= g[0] && x < g[1]) return 0; return null; }
const CUES = Object.freeze({
  black:Object.freeze({ id:'fractured-black-line', src:'./audio/music/fractured-clockwork.mp3',
    title:'ClockWork (fractured)', artist:'Bladefall score', mood:'the Black Line: pace it to the beat' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function buildLevel(){
  const objects = [];
  objects.push(Object.assign(Pl((HEAD.x0 + HEAD.x1) / 2, HEAD.x1 - HEAD.x0, HEAD.y), { actArt:'rail' }));
  DESCENT.forEach(([a, b, y0, y1]) => objects.push(Object.assign(Slope(a, b, y0, y1), { actArt:'rail' })));
  groundSegs().forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'rail' })));
  JETS.forEach(([x, ph]) => objects.push(FJ(x, 0, { w:100, period:2.6, phase:ph, upT:.9, dmg:12 })));
  // The Cut Fork: the switch; the high line; the way down.
  objects.push(RailSwitch(FORK.sw, 0, { label:'LEAN', pow:FORK.pow }));
  for(const h of FORK.high){
    if(h[0] === 'pl') objects.push(Object.assign(Pl(h[1], h[2], FORK.y), { actArt:'rail' }));
    else objects.push(Object.assign(RailCollapse(h[1], h[2], FORK.y, { collapseDelay:h[3], trigger:300 }), { actArt:'rail' }));
  }
  objects.push(Object.assign(Slope(FORK.slope[0], FORK.slope[1], FORK.y, 0), { actArt:'rail' }));
  // The Falling Bridge.
  for(let i = 0; i < BRIDGE.n; i++) objects.push(Object.assign(RailCollapse(BRIDGE.x0 + i * BRIDGE.step + BRIDGE.w / 2, BRIDGE.w, 0,
    { collapseDelay:BRIDGE.delay, trigger:BRIDGE.trigger }), { actArt:'rail' }));
  // The Black Line.
  for(let x = BLACK.x0; x < BLACK.end; x += BLACK.plank) objects.push(Object.assign(Pl(x + BLACK.plank / 2, BLACK.plank, 0), { h:20, actArt:'beat', flWave:waveT(x + BLACK.plank / 2) }));
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:420, y:300, w:40, h:20, restSiteAnchor:'line-ash' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, cart:true, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'gargoyle', x:2100, y:300, railSniper:1, noDrop:true },
      { t:'gargoyle', x:3900, y:420, railSniper:1, noDrop:true },
      { t:'gargoyle', x:5700, y:330, railSniper:1, noDrop:true },
      { t:'gargoyle', x:8200, y:360, railSniper:1, noDrop:true },
      { t:'gargoyle', x:10600, y:360, railSniper:1, noDrop:true },
      { t:'gargoyle', x:11600, y:360, railSniper:1, noDrop:true },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    blacked:done(c, 'fl-black'), over:false, inBlack:false };
  // The Line's kit is the one the rider brought: everything through the gravity flip. The cart takes most of it.
  F.setKit(['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement',
    'companion-command', 'downward-strike', 'gravity-flip']);
}
function firstFrame(A){ F.muster(); }

/* ── The Black Line's wave ────────────────────────────────────────────────── */
function waveF(o, t){ const P = BLACK.period; return (((t - o.flWave) % P) + P) % P; }
function beatSolid(o, t){ return waveF(o, t) < BLACK.upT; }
function beats(A){ for(const o of G.obstacles) if(o.flWave != null){ const f = waveF(o, G.time); o.gone = f >= BLACK.upT; o.flWarn = !o.gone && f > BLACK.upT - .45; } }

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  beats(A);
  A.inBlack = p.x > BLACK.x0 - 300 && p.x < BLACK.end + 200 && !A.blacked && !p.dead;
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  if(!A.blacked && p.x > BLACK.end + 40 && p.onGround && !p.dead){
    A.blacked = true; A.inBlack = false; kit.latch(ZONE, 'fl-black'); F.clear(STAGE); A.flash = .4;
    A.queue.push({ src:{ x:p.x, y:0 }, accent:'#ffd76a', html:'<b>THE BLACK LINE</b><br>Behind you the spans go on keeping their beat for nobody. The rail ahead is only rail.' });
    try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
  }
  const next = F.nextEcho(STAGE);
  if(!A.over && A.blacked && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('THE FRACTURED LINE · BEHIND YOU', 'FRACTURED CLIFFS', 'Act Three · the next echo',
      'Behind you the rail runs on into the dark. Ahead, the Thunder Cliffs, where the second act began.', false); }
}
function updateFoe(){}
function lateUpdate(){}
function interact(){ return false; }
function swing(){}
function voidFloor(){ return -160; }
function cameraFloor(p){ if(!p) return null; return Math.max(-160, Math.min(0, p.y - 40)); }
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 120) return { connector:'fk-fl', zone:ZONE, targetStage:34, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.blacked ? F.seamOn(STAGE, ZONE, 'fl-fc', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fl-fc' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.inBlack ? CUES.black : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedLine = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, groundSegs, beatSolid, waveT, constants:Object.freeze({ LEN, SPAWN, HEAD, DESCENT, JETS, FORK, BRIDGE, TRICK, BLACK, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
