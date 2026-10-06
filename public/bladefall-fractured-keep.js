/* Bladefall — ACT THREE · The Fractured Keep (stage 26), 2026-09-24.

   The sixth echo: the Ruined Keep after the Echo walked it backwards — every gate open, which is
   worse. The Keep remembered its shape once; now it has forgotten the way up, and you build it with
   your own two mouths. The kit is the one the Keep was entered with: jump, the Oathblade, the dash,
   and the twin mouths (set on slate with the portal key: the first, the second, a third press clears
   them). Mason's Grip — the wall jump — waits in the Mason's Quarter, as it did. The Muster applies.

   What a pair of mouths does, it does exactly: you leave one at the speed you entered the other,
   along the way the second one faces. Fall far into a floor mouth and you come out of the other fast.

     THE COLD HEARTH — the fire out, the gatehouse empty.
     THE FALLEN REFECTORY — the broken screen: fall from the drop perch into a floor mouth and rise out
       of a balcony mouth high enough to clear it. Exactly high enough.
     THE WEIGHT HALL — the keystone on its hoist: a mouth under it, a mouth on the dock, strike the
       release — it falls through, rises out, comes down on the dock, and the hall's gate opens.
     THE MASON'S QUARTER — the Grip. Then the first chimney, a wall jump at a time.
     THE CLINGING ARCHIVE — the long climb, with a band of wet stone where nothing holds: climb one wall.
     THE BELFRY (the C-side) — the bell's cradle swings on its chain across the belfry, and the only
       thing that rings the bell is the keystone, thrown into the cradle. Set a mouth on the floor under
       the hoisted keystone; climb the belfry wall to its band of slate and set the other there, facing
       the cradle; strike the release on the cradle's beat. The keystone falls, leaves the wall mouth
       level and fast, and the cradle is there — or it is not, and the hoist takes the stone back up. */
(function installFracturedKeep(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 26, ZONE = 'fractured-keep', SOURCE = 5;
const LEN = 10600;
const SPAWN = { x:140, y:0 };

/* ── Geometry (world units; y up; the floor is y 0; below it the void) ──────── */
const GROUND = [ [0, LEN] ];
const LEDGES = [                                     // [x, w, y, slate?]
  // The Refectory: up to the balcony slate, on up to the drop perch over the floor slate.
  [1820, 200, 60], [2040, 200, 120], [2220, 160, 180], [2470, 160, 240, 1],
  [2220, 160, 300], [2020, 200, 360], [1800, 200, 420], [1560, 200, 480],
  [2780, 300, 600], [3000, 200, 480], [3200, 200, 360], [3400, 200, 240], [3600, 200, 120],
  // The Weight Hall: up to the dock slate and the release.
  [4200, 200, 60], [4420, 200, 120], [4640, 200, 180], [4860, 200, 240], [5100, 260, 300, 1],
  [5420, 160, 300],
  // The Archive's crown.
  [7700, 400, 920],
];
const FLOOR_SLATES = [ [1560, 180], [3920, 200], [8960, 110] ];   // x, w — mouths hold on these (y 0)
const SCREEN = { x:2600, h:640, w:72 };              // the broken screen, wet: nothing clings
const KEYSTONE = { x:3920, y:726, shelf:720 };
const DOCK = { x:5100, y:300, w:120 };
const RELEASE = { x:5420, y:300, dur:1.3 };
const GRIP = { x:5700, y:0 };
/* The two walls after the Grip (a wall at a time); the Archive's long climb — in under its outer wall,
   up the chimney between the two, and where the inner wall's face is wet (300–620) climb the outer
   wall alone — and its east wall (slick on the side you meet it: over the top, from the crown); the Belfry's wall, hung from 60 so you walk in under it (a jump reaches its face), with its band of
   slate at 420–520 on the face toward the cradle. */
const WALLS = [                                      // [x, top, h, w, slick side?]
  [6100, 520, 520, 30], [6260, 520, 520, 30],        // the first chimney
  [7300, 960, 860, 30, 'L'],                         // the Archive's outer wall: wet outside, hung from 100 — walk in under it
  [7460, 620, 320, 30, 'L'], [7460, 300, 300, 30], [7460, 960, 340, 30],   // the Archive's inner wall, wet 300–620 inside
  [7920, 960, 960, 30, 'L'],                         // the Archive's east wall
  [8680, 420, 360, 30], [8680, 900, 380, 30],        // the Belfry wall, below (hung from 60) and above its slate band
];
const BELFRY_SLATE = { x:8680, top:520, h:100, w:30 };  // the band, 420–520
/* The keystone's hoist over the floor slate; the release; the cradle, swinging on its chain where the
   thrown stone comes down (measured: out of the band at ~1360, it crosses y 320 about 600 on). */
const HOIST = { x:8960, shelf:720, crateY:726 };
const BELL_RELEASE = { x:9110, y:0, dur:1.3 };
const CRADLE = { x:9300, y:320, dx:150, period:4.0, w:74 };
const BELL = { x:9300, y:560 };
const CHECKPOINTS = [ { id:'hearth', x:600 }, { id:'refectory', x:1300 }, { id:'hall', x:3900 }, { id:'quarter', x:5700 },
  { id:'archive', x:6700 }, { id:'crown', x:7700, y:920 }, { id:'belfry', x:8300 }, { id:'tower', x:9800 } ];
function groundAt(x){ for(const g of GROUND) if(x >= g[0] && x < g[1]) return 0; return null; }
const CUES = Object.freeze({
  belfry:Object.freeze({ id:'fractured-keep-belfry', src:'./audio/music/crystalline-trials.mp3', title:'Crystalline Trials',
    artist:'Aerth score', mood:'the Belfry: the fall is the throw' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function buildLevel(){
  const objects = [];
  GROUND.forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'flag' })));
  LEDGES.forEach(l => objects.push(l[3] ? Object.assign(Slate(l[0], l[1], l[2]), { actArt:'slate' }) : Object.assign(Pl(l[0], l[1], l[2]), { h:26, actArt:'masonry' })));
  FLOOR_SLATES.forEach(s => objects.push(Object.assign(Slate(s[0], s[1], 0), { actArt:'slate' })));
  objects.push(Object.assign(Wl(SCREEN.x, SCREEN.h, SCREEN.h, SCREEN.w), { slickL:1, slickR:1, noCling:1, actArt:'screen' }));
  // The band first: a knight clinging in it overlaps the stone above too, and the first wall found is the one he is on.
  objects.push(Object.assign(SlateWall(BELFRY_SLATE.x, BELFRY_SLATE.top, BELFRY_SLATE.h), { w:BELFRY_SLATE.w, actArt:'slatewall' }));
  WALLS.forEach(w => objects.push(Object.assign(Wl(w[0], w[1], w[2], w[3]), { actArt:w[4] ? 'wet' : 'keepwall' }, w[4] === 'L' ? { slickL:1 } : {})));
  // The keystone on its hoist; its shelf gives when the release is struck.
  objects.push(Object.assign(Pl(KEYSTONE.x, 190, KEYSTONE.shelf, { dropOnCircuit:'fk-drop' }), { actArt:'hoist' }));
  objects.push(Object.assign(Crate(KEYSTONE.x, KEYSTONE.y), { actArt:'keystone', keepMasonry:1, fkKeystone:1, x0:KEYSTONE.x, y0:KEYSTONE.y }));
  objects.push(Object.assign(Lever(RELEASE.x, RELEASE.y, 'fk-drop', RELEASE.dur), { fkRelease:1 }));
  objects.push({ type:'actDock', x:DOCK.x, y:DOCK.y, w:DOCK.w, h:8 });
  objects.push({ type:'wall', x:5560, y:760, h:760, w:30, noCling:1, actArt:'bars', actBars:'hall-gate', gone:false });
  objects.push({ type:'actGrip', actId:'grip', x:GRIP.x, y:GRIP.y, w:40, h:60, actTwoUp:1, actVerb:'TAKE THE GRIP' });
  objects.push(Object.assign(Pl(HOIST.x, 150, HOIST.shelf, { dropOnCircuit:'fk-bell-drop' }), { actArt:'hoist' }));
  objects.push(Object.assign(Crate(HOIST.x, HOIST.crateY), { actArt:'keystone', keepMasonry:1, fkBellStone:1, x0:HOIST.x, y0:HOIST.crateY }));
  objects.push(Object.assign(Lever(BELL_RELEASE.x, BELL_RELEASE.y, 'fk-bell-drop', BELL_RELEASE.dur), { fkRelease:1 }));
  // The cradle is a real platform swinging on the engine's oscillator (x0 + sin(t·2π/period)·dx): what lands on it rides it.
  objects.push(Object.assign(Pl(CRADLE.x, CRADLE.w, CRADLE.y, { move:{ dx:CRADLE.dx, dy:0, period:CRADLE.period, phase:0 } }), { h:12, actArt:'cradle', fkCradle:1 }));
  objects.push({ type:'actBell', x:BELL.x, y:BELL.y, w:60, h:80 });
  objects.push({ type:'wall', x:9600, y:760, h:760, w:30, noCling:1, actArt:'bars', actBars:'tower-gate', gone:false });
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:320, y:0, w:40, h:20, restSiteAnchor:'hearth-ash' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'grunt', x:900, patrol:[700, 1150], noDrop:true },
      { t:'rifthound', x:4400, patrol:[3950, 4900], noDrop:true },
      { t:'shieldbearer', x:6500, patrol:[6350, 6750], noDrop:true },
      { t:'gargoyle', x:7400, y:700, patrol:[7200, 7600], noDrop:true },
      { t:'outrider', x:10000, patrol:[9800, 10300], noDrop:true },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    docked:done(c, 'fk-docked'), grip:done(c, 'fk-grip'), rung:done(c, 'fk-bell'), over:false };
  const A = G.actTwo;
  // The Keep's kit: jump, blade, dash, the twin mouths — and the Grip once it is taken.
  F.setKit(A.grip ? ['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump'] : ['jump', 'weapon', 'dash', 'portal-single', 'portal-pair']);
  setBars('hall-gate', A.docked); setBars('tower-gate', A.rung);
  const grip = G.obstacles.find(o => o.actId === 'grip'); if(grip) grip.actMute = A.grip;
  seatWeights(A);
}
function firstFrame(){ F.muster(); }
function setBars(id, open){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === open) return; b.gone = open; b.moveT = 0.5;
}

/* Completed weights belong to their mechanisms, including after save hydration.
   keepSeated uses the engine's existing settled-weight path (no pushing or portal re-entry). */
function seatWeight(k, x, y){
  if(!k) return;
  Object.assign(k, { x, y, x0:x, y0:y, yPrev:y, vx:0, vy:0, stuck:0, keepSeated:true, resetF:0 });
  k._restMouth = null; k._portalEntry = null; k._portalExit = null;
}
function seatWeights(A){
  if(A.docked){ const k = G.obstacles.find(o => o.fkKeystone); seatWeight(k, DOCK.x, DOCK.y); if(k) k.fkDocked = true; }
  if(A.rung){
    const k = G.obstacles.find(o => o.fkBellStone), c = G.obstacles.find(o => o.fkCradle);
    if(c){ seatWeight(k, c.x, c.y); if(k) k.fkRung = true; }
  }
}

/* The dock: the keystone, come to rest on it after a mouth has carried it — the hall's gate opens. */
function dock(A){
  if(A.docked) return;
  const k = G.obstacles.find(o => o.fkKeystone); if(!k) return;
  if(Math.abs(k.x - DOCK.x) < DOCK.w / 2 && Math.abs(k.y - DOCK.y) < 14 && Math.abs(k.vy || 0) < 60){   // a crate's y is its foot
    A.docked = true; k.fkDocked = true; k.x0 = k.x; k.y0 = k.y; kit.latch(ZONE, 'fk-docked'); setBars('hall-gate', true); A.flash = .5;
    kit.burst(k.x, k.y, '#d8c4a5', 18);
    try{ if(meta.soundOn) SFX.magic(); }catch(_e){}
  }
}

/* The cradle swings; the thrown keystone, arriving in it, rings the bell and opens the tower. */
function cradleX(t){ return CRADLE.x + Math.sin(t / CRADLE.period * Math.PI * 2) * CRADLE.dx; }
function cradle(A){
  if(A.rung) return;
  const k = G.obstacles.find(o => o.fkBellStone), c = G.obstacles.find(o => o.fkCradle); if(!k || !c) return;
  if(Math.abs(k.x - c.x) < CRADLE.w / 2 && Math.abs(k.y - c.y) < 8 && Math.abs(k.vy || 0) < 80){   // resting in it
    A.rung = true; k.fkRung = true; k.x0 = k.x; k.y0 = k.y;
    kit.latch(ZONE, 'fk-bell'); setBars('tower-gate', true); F.clear(STAGE); A.flash = .7; G.shake = Math.max(G.shake || 0, 8);
    try{ if(meta.soundOn) SFX.magic(); }catch(_e){}
    A.queue.push({ src:{ x:BELL.x, y:BELL.y }, accent:'#e8dcc0', html:'<b>THE BELFRY BELL</b><br>It rings once and goes on ringing long after it should have stopped, the way a bell does in a dream.' });
  }
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  if(!p.dead){ dock(A); cradle(A); }
  seatWeights(A);
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && A.rung && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('THE FRACTURED KEEP · BEHIND YOU', 'THE FRACTURED WARDEN', 'Act Three · the next echo',
      'Behind you the bell is still going, and the Keep has remembered one way up. Ahead the Gaol is lit, and no one is in the cells.', false); }
}
function interact(o){
  const A = G.actTwo; if(!A || A.stage !== STAGE || G.p.dead) return false;
  if(o.actId === 'grip' && !A.grip){
    A.grip = true; o.actMute = true; kit.latch(ZONE, 'fk-grip'); F.grant('wall-jump'); A.flash = .4;
    try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
    A.queue.push({ src:o, accent:'#d8c4a5', html:'<b>MASON’S GRIP</b><br>Worn smooth where a thousand hands have held it. Jump against stone, and the stone holds you.' });
    return true;
  }
  return false;
}
function lateUpdate(){ const A = G.actTwo; if(A && A.stage === STAGE) seatWeights(A); }
function updateFoe(){}
function swing(){}
function voidFloor(){ return -140; }
/* The climbs look up. */
function cameraFloor(p){
  if(!p) return null;
  if(p.x > 8600 && p.x < 9650) return Math.max(90, p.y - 200); // Frame bell, cradle and release together.
  const climbing = (p.x > 5980 && p.x < 8000 && p.y > 150) || (p.x > 1400 && p.x < 2900 && p.y > 200);
  return climbing ? Math.max(0, p.y - 200) : 0;
}
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 400) return { connector:'fm-fk', zone:ZONE, targetStage:24, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.rung ? F.seamOn(STAGE, ZONE, 'fk-fw', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fk-fw' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  const p = G.p; return p.x > 8400 && p.x < 9600 && !A.rung ? CUES.belfry : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedKeep = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, constants:Object.freeze({ LEN, SPAWN, GROUND, LEDGES, FLOOR_SLATES, SCREEN, KEYSTONE, DOCK, RELEASE, GRIP,
    WALLS, BELFRY_SLATE, HOIST, BELL_RELEASE, CRADLE, BELL, CHECKPOINTS }), cradleX,
});
})(typeof window !== 'undefined' ? window : globalThis);
