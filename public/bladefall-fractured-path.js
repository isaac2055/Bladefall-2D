/* Bladefall — ACT THREE · The Fractured Path (stage 39), 2026-09-25.

   The nineteenth echo: the Palace Path after the Echo walked it backwards. It is noon on the climb now and
   always; the mirrors have been turned to the road, and nobody carries canvas over anyone. The kit is the
   one the Path was entered with — everything through the Chainhook. Nothing waits here. The Muster applies.

     NOON ROAD: pools of sun thrown by the mirrors slide along the road and burn. Shelters and the smoke of
       the vents are shade; the smoke comes and goes.
     THE BURNING STAIR: six risers, a double jump each, and the pools crossing the landings.
     THE OVERLOOK: the chasm by three rings, and a mirror's beam walking the rings: iron in the sun burns.
     THE SUN GATE (the C-side): the windlass turns only while the sun is on it. Strike it from the ring above
       while it is lit — and do not stay in the light. Three turns open the gate; a turn slips back if you are
       slow with the next; its keeper walks the apron. */
(function installFracturedPath(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 39, ZONE = 'fractured-path', SOURCE = 19;
const LEN = 10400;
const SPAWN = { x:150, y:0 };

/* ── Geometry (world units; y up; the road starts at 0 and climbs to 660) ─── */
const RISE = 110, TOP = 660;
const ROAD = { x0:0, x1:2600 };
const STAIR = { x0:2600, step:360, n:6 };                                // risers at x0 + i·step, each 110 up
const OVERLOOK = { x0:STAIR.x0 + STAIR.n * STAIR.step + 200, rings:[ [5250, 900], [5650, 930], [6080, 980] ], x1:6240 };   // a jump out of a hang is one jump from a standstill: it reaches ~6286 at the lip's height   // the last within 430 of the second; 220 short of the lip
const APRON = { x0:6240, x1:LEN };
/* The mirrors: each throws a pool of sun `w` wide that slides x = x + amp·sin(2πt/period + phase) along the ground
   under it. `shutter` = [lit, dark] makes one go dark on a beat. */
const MIRRORS = [
  { x:1250, amp:700, period:7.0, phase:0, w:110 }, { x:2150, amp:480, period:6.0, phase:2.0, w:110 },
  { x:3300, amp:600, period:6.6, phase:1.0, w:170 }, { x:4300, amp:560, period:6.2, phase:3.0, w:170 },   // the stair's pools are wider
];
const SHELTERS = [ [560, 720], [1080, 1240], [1620, 1780], [2180, 2340],
  [2740, 2860], [3100, 3220], [3460, 3580], [3820, 3940], [4180, 4300], [4540, 4660] ];   // one on every landing of the stair
const VENTS = [ { x:880, w:120, period:4.0, on:2.0 }, { x:1960, w:120, period:4.4, on:2.2, phase:1.5 } ];
const BURN = { dmg:14, every:.9 };
const OVERLOOK_BEAM = { amp:560, period:4.8, x:5650 };                  // walks the rings: a lit ring burns a hanging knight
/* The Sun Gate. */
const GATE = { x:8600, windlass:{ x:7900, w:70, h:30 }, ring:[7900, TOP + 400], mirror:{ x:7900, period:5.4, lit:2.8 },
  turns:3, slip:7.0, arena:{ x1:6600, x2:8580 } };
const KEEPER = { w:46, h:66, speed:[0, 55, 70], turn:[1.0, .9, .8], bash:{ reach:70, tell:.5, dmg:16, cool:1.3 } };
const CHECKPOINTS = [ { id:'road', x:400, y:0 }, { id:'stair', x:2480, y:0 }, { id:'midstair', x:3520, y:330 }, { id:'overlook', x:OVERLOOK.x0 - 120, y:TOP }, { id:'apron', x:6550, y:TOP } ];
function groundAt(x){
  if(x < STAIR.x0) return 0;
  if(x < STAIR.x0 + STAIR.n * STAIR.step) return (Math.floor((x - STAIR.x0) / STAIR.step) + 1) * RISE;
  if(x < OVERLOOK.x0) return TOP;
  if(x < OVERLOOK.x1) return null;
  return TOP;
}
function poolX(M, t){ return M.x + M.amp * Math.sin(2 * Math.PI * t / M.period + (M.phase || 0)); }
function inShelter(x){ return SHELTERS.some(([a, b]) => x > a + 8 && x < b - 8); }
function ventOn(V, t){ const P = V.period, u = ((t + (V.phase || 0)) % P + P) % P; return u < V.on; }
function inSmoke(x, t){ return VENTS.some(V => Math.abs(x - V.x) < V.w / 2 && ventOn(V, t)); }
function gateLit(t){ const M = GATE.mirror, P = M.period, u = ((t % P) + P) % P; return u < M.lit; }
const CUES = Object.freeze({
  gate:Object.freeze({ id:'fractured-sun-gate', src:'./audio/music/fractured-element.mp3', title:'Element (fractured)',
    artist:'Bladefall score', mood:'the Sun Gate: strike it lit, and leave the light' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function ring(x, y, extra){ return Object.assign({ type:'actRing', x, y, w:24, h:24 }, extra || {}); }
function coat(x, top, bottom){ return Object.assign(Wl(x, top, top - (bottom || 0), 24), { noCling:1, slickL:1, slickR:1, clingSurface:0, actArt:'riser' }); }
function buildLevel(){
  const objects = [];
  objects.push(Object.assign(GrAt(ROAD.x0, STAIR.x0, 0), { actArt:'road' }));
  for(let i = 0; i < STAIR.n; i++){
    const a = STAIR.x0 + i * STAIR.step, y = (i + 1) * RISE;
    objects.push(Object.assign(GrAt(a, a + STAIR.step, y), { actArt:'road' }), coat(a + 12, y, y - RISE));
  }
  objects.push(Object.assign(GrAt(STAIR.x0 + STAIR.n * STAIR.step, OVERLOOK.x0, TOP), { actArt:'road' }));
  OVERLOOK.rings.forEach(([x, y]) => objects.push(ring(x, y, { fpOver:1 })));
  objects.push(Object.assign(GrAt(APRON.x0, APRON.x1, TOP), { actArt:'apron' }));
  MIRRORS.forEach(M => objects.push({ type:'actMirror', x:M.x, y:groundAt(M.x) + 380, w:40, h:40 }));
  SHELTERS.forEach(([a, b]) => objects.push({ type:'actShelter', x:(a + b) / 2, y:groundAt((a + b) / 2), w:b - a, h:110 }));
  VENTS.forEach(V => objects.push({ type:'actVent', x:V.x, y:0, w:V.w, h:20, vent:V }));
  // The Sun Gate.
  objects.push(Object.assign(Pl(GATE.windlass.x, GATE.windlass.w, TOP + GATE.windlass.h), { h:GATE.windlass.h, actArt:'windlass', fpWindlass:1 }));
  objects.push(ring(GATE.ring[0], GATE.ring[1], { fpGate:1 }));
  objects.push({ type:'actMirror', x:GATE.mirror.x - 260, y:TOP + 520, w:40, h:40, gate:true });
  objects.push({ type:'wall', x:GATE.x, y:TOP + 900, h:900, w:34, noCling:1, actArt:'sungate', actBars:'sun-gate', gone:false });
  objects.push({ type:'wall', x:GATE.arena.x1, y:TOP + 900, h:900, w:30, noCling:1, actArt:'bars', actBars:'apron-west', gone:true });
  objects.push({ type:'actTunnel', x:LEN - 200, y:TOP, w:300, h:360 });
  objects.push({ type:'actFire', x:640, y:0, w:40, h:20, restSiteAnchor:'path-ash' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[ { t:'belled', x:3500, y:3 * RISE, patrol:[3330, 3620], noDrop:true }, { t:'belled', x:6800, y:TOP, patrol:[6700, 7100], noDrop:true } ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    burnCd:0, turns:done(c, 'fp-turn-2') ? 2 : done(c, 'fp-turn-1') ? 1 : 0, opened:done(c, 'fp-gate'), slipT:0, fight:false,
    introduced:done(c, 'fp-met'), over:false, lit:false };
  F.setKit(['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement',
    'companion-command', 'downward-strike', 'gravity-flip', 'chain-hook']);
  setBars('sun-gate', G.actTwo.opened);
}
function firstFrame(A){ F.muster(); spawnKeeper(A); }
function spawnKeeper(A){
  const e = spawnEnemy('grunt', GATE.windlass.x + 160);
  Object.assign(e, { actFoe:'keeper', kind:'fly', x:GATE.windlass.x + 160, y:TOP, baseY:TOP, w:KEEPER.w, h:KEEPER.h, st:'wait', t:0, face:-1, turnT:0, cool:1,
    frontShield:false, portalGate:'keeper-never', active:true, noDrop:true, boss:false, maxHp:9999, hp:9999, noticeRange:1 });
  if(A.opened) e.st = 'down';
  A.keeper = e;
}
function setBars(id, open){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === open) return; b.gone = open; b.moveT = 0.5;
}
function harm(p, dir, dmg){
  if(p.dead || p.invuln > 0 || p.dodgeTimer > 0) return;
  try{ hurtPlayer(dmg, dir, true); }catch(_e){}
}

/* ── The sun ──────────────────────────────────────────────────────────────── */
function sun(A, p, dt){
  A.burnCd = Math.max(0, A.burnCd - dt);
  let lit = false;
  const g = groundAt(p.x);
  if(g != null && p.onGround && Math.abs(p.y - g) < 6 && !inShelter(p.x) && !inSmoke(p.x, A.t))
    for(const M of MIRRORS) if(Math.abs(p.x - poolX(M, A.t)) < M.w / 2 + 13) lit = true;
  // The overlook's beam walks the rings: a knight hanging from a lit ring burns.
  const h = p.actHook;
  if(h && h.ring && h.ring.fpOver && Math.abs(h.ring.x - poolX(OVERLOOK_BEAM, A.t)) < 70) lit = true;
  // The gate's light on the windlass and round it (the last turn: on the whole apron under it too).
  if(A.fight && gateLit(A.t) && p.onGround && Math.abs(p.y - TOP) < 40 && Math.abs(p.x - GATE.windlass.x) < (A.turns >= 2 ? 260 : 90)) lit = true;
  A.lit = lit;
  if(lit && A.burnCd <= 0){ A.burnCd = BURN.every; harm(p, 0, BURN.dmg); kit.burst(p.x, p.y + 20, '#ffe08a', 8); }
}

/* ── THE SUN GATE ─────────────────────────────────────────────────────────── */
function windlass(A, p, dt){
  if(A.opened || p.dead) return;
  if(A.turns > 0 && A.turns < GATE.turns){ A.slipT += dt; if(A.slipT >= GATE.slip){ A.slipT = 0; A.turns--; A.flash = .2; kit.burst(GATE.windlass.x, TOP + 40, '#a08050', 10); } }
  if(p.slamFromY != null && p.slamFromY !== A.slamSeen){ A.slamSeen = p.slamFromY; A.slamT = .25; }
  // Keep the landing window alive throughout a slam, including repeated launch heights.
  if(p.slamming) A.slamT = .25;
  A.slamT = Math.max(0, (A.slamT || 0) - dt); A.turnCd = Math.max(0, (A.turnCd || 0) - dt);
  if(A.turnCd > 0 || !(A.slamT > 0 || p.slamming) || !p.onGround || !p.floorPlat || !p.floorPlat.fpWindlass) return;
  A.slamT = 0; A.turnCd = .6;                                       // one strike, one answer (the same strike is remembered)
  // The bounce: off the iron, up and away.
  p.vy = -620; p.vx = (Math.sign(p.x - GATE.windlass.x) || -1) * 260; p.jumpCutOk = false;
  if(!gateLit(A.t)){ kit.burst(GATE.windlass.x, TOP + 30, '#6a6a6a', 6); try{ if(meta.soundOn) SFX.hit(); }catch(_e){} return; }    // cold iron: nothing
  A.turns++; A.slipT = 0; A.flash = .4; kit.burst(GATE.windlass.x, TOP + 40, '#ffe08a', 18);
  try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
  if(A.turns < GATE.turns){ kit.latch(ZONE, 'fp-turn-' + A.turns); return; }
  A.opened = true; A.fight = false; kit.latch(ZONE, 'fp-gate'); F.clear(STAGE); setBars('sun-gate', true); setBars('apron-west', true);
  if(A.keeper) A.keeper.st = 'down';
  A.queue.push({ src:{ x:GATE.x, y:TOP }, accent:'#ffe08a', html:'<b>THE SUN GATE</b><br>The third turn takes, and the gate goes up into the glare. Its keeper lowers his shield, and looks at the palace as if he had never seen it from this side.' });
}
function updateKeeper(A, e, p, dt){
  if(p.dead || e.dead) return;
  e.t += dt; e.turnT += dt; e.cool = Math.max(0, e.cool - dt); e.hp = 9999;
  e.burnT = e.poisonT = e.bleedT = e.freezeT = e.floatT = e.counterStunT = 0;
  const want = Math.sign(p.x - e.x) || e.face, ph = Math.min(A.turns, 2);
  if(want !== e.face && e.turnT >= KEEPER.turn[ph]){ e.face = want; e.turnT = 0; } else if(want === e.face) e.turnT = 0;
  switch(e.st){
    case 'wait':
      if(p.x > GATE.arena.x1 + 60 && Math.abs(p.y - TOP) < 300 && !p.dead){
        e.st = 'walk'; e.t = 0; A.fight = true; setBars('apron-west', false);
        if(!A.introduced){ A.introduced = true; kit.latch(ZONE, 'fp-met');
          A.queue.push({ src:e, accent:'#ffe08a', html:'<b>THE SUN GATE</b><br>A windlass of black iron, and a mirror that finds it on a beat. The iron is cold between. Its keeper will not let you stand beside it long.' }); }
      }
      break;
    case 'walk':
      if(p.onGround && Math.abs(p.y - TOP) < 40){
        if(Math.abs(p.x - e.x) > KEEPER.bash.reach) e.x += e.face * KEEPER.speed[ph] * dt;
        else if(e.cool <= 0 && e.face === want){ e.st = 'bash-tell'; e.t = 0; }
      }
      break;
    case 'bash-tell': if(e.t >= KEEPER.bash.tell){ e.st = 'bash'; e.t = 0; } break;
    case 'bash':
      e.x += e.face * 380 * dt;
      if(!p.dead && Math.abs(p.x - (e.x + e.face * e.w / 2)) < 30 && Math.abs(p.y - TOP) < e.h) harm(p, e.face, KEEPER.bash.dmg);
      if(e.t >= .2){ e.st = 'walk'; e.cool = KEEPER.bash.cool; }
      break;
    case 'down': break;
  }
  e.x = Math.max(GATE.arena.x1 + 40, Math.min(GATE.x - 40, e.x)); e.y = TOP; e.baseY = TOP;
  e.portalGate = 'keeper-never';     // he cannot be put down; he can be kept away
}
function resetGate(A){ A.fight = false; A.slipT = 0; A.queue = []; A.slamT = 0; A.slamSeen = null; A.turnCd = 0; const e = A.keeper; if(e && e.st !== 'down'){ e.st = 'wait'; e.x = GATE.windlass.x + 160; e.t = 0; e.turnT = 0; e.cool = 1; e.face = -1; } setBars('apron-west', true); }

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  sun(A, p, dt);
  if(A.fight) windlass(A, p, dt);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  if(A.fight && (p.dead || p.x < GATE.arena.x1 - 20)) resetGate(A);
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && A.opened && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('THE FRACTURED PATH · BEHIND YOU', 'FRACTURED PALACE', 'Act Three · the next echo',
      'Behind you the mirrors burn an empty road. Ahead, the Palace, and the Sun at its heart.', false); }
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'keeper') return updateKeeper(A, e, p, dt);
}
function lateUpdate(){}
function interact(){ return false; }
function swing(){}
function voidFloor(p){ return p && p.x > OVERLOOK.x0 && p.x < OVERLOOK.x1 ? TOP - 400 : -120; }
function cameraFloor(p){ if(!p) return null; const g = groundAt(p.x); return Math.max(-120, Math.min(g == null ? TOP - 100 : g, p.y) - 40); }
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 200) return { connector:'fco-fp', zone:ZONE, targetStage:38, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.opened ? F.seamOn(STAGE, ZONE, 'fp-fpa', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fp-fpa' ? { x:LEN - 160, y:TOP } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.fight ? CUES.gate : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedPath = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, poolX, inShelter, inSmoke, ventOn, gateLit, constants:Object.freeze({ LEN, SPAWN, RISE, TOP, ROAD, STAIR, OVERLOOK, APRON,
    MIRRORS, SHELTERS, VENTS, BURN, OVERLOOK_BEAM, GATE, KEEPER, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
