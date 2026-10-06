/* Bladefall — ACT THREE · The Fractured King (stage 34), 2026-09-25.

   The fourteenth echo: the Drowned Throne after the Echo walked it backwards. The Throne gave the knight
   a second body; the echo asks what one knight can do with it alone — no Oren to hold the other mark, no
   Right Hand to learn from. The kit is the one the Throne was entered with: everything through the gravity
   flip (never turned on here), and the Echo, which works from the first step as it did. The Muster applies.

     THE FIRST MARK: a mark only the echo weighs, and the gate beside it held while it does.
     THE RETURN: a gate on a high ledge held for a breath by a plate far below it. The only way back up in a
       breath is the echo you left at the gate.
     TWO MARKS AT ONCE: the echo's mark behind you, yours at the far end of a gauntlet, and a bridge that
       comes only while both are weighed together. The echo lasts fourteen seconds.
     THE WEIGHED CROWN (the C-side): the King's echo hangs over his hall and nothing reaches him. Weigh his
       two marks at once and he is pulled down onto your echo; trade places with it and you are beside him. */
(function installFracturedKing(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 34, ZONE = 'fractured-king', SOURCE = 13;
const LEN = 10400;
const SPAWN = { x:140, y:0 };

/* ── Geometry (world units; y up; the floor is y 0) ─────────────────────────── */
const GROUND = [ [0, 5000], [5900, 7000], [7800, LEN] ];
/* The First Mark. */
const FIRST = { mark:560, gate:720 };
/* The Return: a stair up to a long ledge (360) with a hole in it; the gate at the ledge's east end; under the
   ledge a closed room with the plate below the hole. The plate holds the gate for `hold` after it is left. */
const RETURN = { stair:[ [1180, 120, 120], [1320, 120, 240] ], ledge:{ x0:1440, x1:2300, y:360 }, hole:[1820, 1900],
  plate:1860, gate:2300, hold:2.5, bridge:{ x0:2300, x1:3200 } };
/* Two Marks at Once: the echo's mark, a void crossed by a blinking tear, teeth on a beat, the knight's mark,
   and the bridge that comes while both are weighed together (and stays). */
const MARKS = { echo:4700, tear:{ ax:4970, ay:40, bx:5930, by:40, period:2.4, upT:1.0 }, teeth:[ [6150, 0], [6350, .8], [6550, 1.6] ],
  teethT:{ period:2.4, upT:1.0, w:150 }, knight:6860, bridge:{ x0:7000, x1:7800, y:0 } };
/* The Weighed Crown. */
const HALL = { x1:8000, x2:9600 };
const HALL_PERCHES = [ { x:8150, w:130, y:230 }, { x:9450, w:130, y:230 } ];
const HALL_STEPS = [ { x:8320, w:120, y:110 }, { x:9280, w:120, y:110 } ];
const CROWN = {
  w:110, h:120, hoverY:330, pull:900, kneel:2.0, rise:260,
  phases:[ { marks:2, apart:520, perch:false, breaks:false }, { marks:2, apart:820, perch:false, breaks:true }, { marks:2, apart:0, perch:true, breaks:true } ],
  volley:{ n:[3, 3, 4], spread:.55, speed:[300, 330, 350], dmg:14, every:[3.4, 3.0, 2.6] },   // the echo work is the fight; the volleys only keep you moving
  breaker:{ every:4.2, tell:1.0, r:70, dmg:16 },
};
const CHECKPOINTS = [ { id:'first', x:400 }, { id:'return', x:1100 }, { id:'bridge', x:3300 }, { id:'marks', x:4550 },
  { id:'far', x:7900 } ];
function groundAt(x){ for(const g of GROUND) if(x >= g[0] && x < g[1]) return 0; return null; }
const CUES = Object.freeze({
  crown:Object.freeze({ id:'fractured-crown', src:'./audio/music/fractured-a-crown-of-ashes.mp3', title:'A Crown of Ashes (fractured)',
    artist:'Bladefall score', mood:'the Weighed Crown: two bodies, one knight' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function bars(x, y, h, id, gone){ return { type:'wall', x, y, h, w:30, noCling:1, actArt:'bars', actBars:id, gone:!!gone }; }
function buildLevel(){
  const objects = [];
  GROUND.forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'throne' })));
  // The First Mark.
  objects.push(Object.assign(Plate(FIRST.mark, 0, 'fk-first'), { echoOnly:1, actArt:'mark' }));
  objects.push(bars(FIRST.gate, 900, 900, 'first'));
  // The Return.
  RETURN.stair.forEach(([x, w, y]) => objects.push(Object.assign(Pl(x, w, y), { actArt:'ledge' })));
  const L0 = RETURN.ledge;
  objects.push(Object.assign(Pl((L0.x0 + RETURN.hole[0]) / 2, RETURN.hole[0] - L0.x0, L0.y), { h:20, actArt:'ledge' }));
  objects.push(Object.assign(Pl((RETURN.hole[1] + L0.x1) / 2, L0.x1 - RETURN.hole[1], L0.y), { h:20, actArt:'ledge' }));
  objects.push(Object.assign(Pl((RETURN.bridge.x0 + RETURN.bridge.x1) / 2, RETURN.bridge.x1 - RETURN.bridge.x0, L0.y), { h:20, actArt:'ledge' }));
  // Under the ledge a closed room: its east wall stands from the floor to the ledge, wet.
  objects.push(Object.assign(Wl(RETURN.gate + 20, L0.y - 20, L0.y - 20, 40), { noCling:1, slickL:1, slickR:1, clingSurface:0, actArt:'wall' }));
  objects.push(Object.assign(Plate(RETURN.plate, 0, 'fk-return'), { actArt:'mark', knightMark:1 }));
  objects.push(bars(RETURN.gate, L0.y + 540, 540, 'return'));
  // Down from the bridge.
  objects.push(Object.assign(Pl(3300, 120, 240), { actArt:'ledge' }), Object.assign(Pl(3440, 120, 120), { actArt:'ledge' }));
  // Two Marks at Once.
  objects.push(Object.assign(Plate(MARKS.echo, 0, 'fk-marks-echo'), { echoOnly:1, actArt:'mark' }));
  objects.push(Seam(MARKS.tear.ax, MARKS.tear.ay, MARKS.tear.bx, MARKS.tear.by, { period:MARKS.tear.period, upT:MARKS.tear.upT }));
  MARKS.teeth.forEach(([x, ph]) => objects.push(Object.assign(Sp(x, 0, { w:MARKS.teethT.w, period:MARKS.teethT.period, phase:ph, upT:MARKS.teethT.upT, dmg:14 }), { actArt:'teeth' })));
  objects.push(Object.assign(Plate(MARKS.knight, 0, 'fk-marks-knight'), { actArt:'mark', knightMark:1 }));
  const B0 = MARKS.bridge;
  for(let x = B0.x0; x < B0.x1; x += 100) objects.push(Object.assign(Pl(x + 50, 100, B0.y), { h:20, actArt:'span', fkSpan:1, gone:true }));
  // The Weighed Crown's hall.
  HALL_STEPS.forEach(s => objects.push(Object.assign(Pl(s.x, s.w, s.y), { actArt:'ledge' })));
  HALL_PERCHES.forEach(s => objects.push(Object.assign(Pl(s.x, s.w, s.y), { actArt:'ledge' })));
  objects.push(bars(HALL.x1, 900, 900, 'hall-west', true));
  objects.push(bars(HALL.x2, 900, 900, 'hall-east', false));
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:300, y:0, w:40, h:20, restSiteAnchor:'crown-ash' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true, echoVerb:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'rifthound', x:3700, patrol:[3560, 4400], noDrop:true },
      { t:'voidbat', x:6300, y:260, patrol:[6050, 6700], noDrop:true },
      { t:'crownguard', x:7950, patrol:[7850, 7990], noDrop:true, frontShield:true },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    returnT:0, firstDone:done(c, 'fk-first'), spanned:done(c, 'fk-span'), phase:done(c, 'fk-crown-2') ? 2 : done(c, 'fk-crown-1') ? 1 : 0, crowned:done(c, 'fk-crown'),
    marks:0, fight:false, introduced:done(c, 'fk-met'), over:false, breakers:[], volleyT:0, breakT:0, hallMarks:[], cycle:0 };
  const A = G.actTwo;
  // The Throne's kit: everything through the gravity flip. The Echo is this region's own verb (level.echoVerb).
  F.setKit(['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement',
    'companion-command', 'downward-strike', 'gravity-flip']);
  if(A.spanned) for(const o of G.obstacles) if(o.fkSpan) o.gone = false;
  setBars('hall-east', A.crowned);
}
function firstFrame(A){ F.muster(); spawnCrown(A); }
function spawnCrown(A){
  const e = spawnEnemy('grunt', (HALL.x1 + HALL.x2) / 2);
  Object.assign(e, { actFoe:'crown', kind:'fly', x:(HALL.x1 + HALL.x2) / 2, y:CROWN.hoverY, baseY:CROWN.hoverY, w:CROWN.w, h:CROWN.h,
    st:'wait', t:0, face:-1, tx:(HALL.x1 + HALL.x2) / 2, frontShield:false, portalGate:'crown-never', active:true, noDrop:true, boss:false,
    maxHp:9999, hp:9999, hpWas:9999, noticeRange:1 });
  if(A.crowned) Object.assign(e,{st:'down',y:0,baseY:0});
  A.crown = e;
}
function setBars(id, open){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === open) return; b.gone = open; b.moveT = 0.5;
}
function plate(id){ return G.obstacles.find(o => o.type === 'plate' && o.id === id); }
function harm(p, dir, dmg){
  if(p.dead || p.invuln > 0 || p.dodgeTimer > 0) return;
  try{ hurtPlayer(dmg, dir, true); }catch(_e){}
}

/* ── The road ─────────────────────────────────────────────────────────────── */
/* A mark lets its echo go once its work is done: an echo still standing behind you would turn the next press
   of the key into a trade back to it. */
function release(x){ const e = typeof echoStanding === 'function' ? echoStanding() : null; if(e && Math.abs(e.x - x) < 60) e.spent = true; }
function road(A, p, dt){
  if(p.dead) return;
  const first = plate('fk-first');
  if(!A.firstDone && p.x > FIRST.gate + 40 && !p.dead){ A.firstDone = true; kit.latch(ZONE, 'fk-first'); release(FIRST.mark); }
  if(first) setBars('first', A.firstDone || !!first.pressed);
  const ret = plate('fk-return');
  if(ret && ret.pressed) A.returnT = RETURN.hold; else A.returnT = Math.max(0, A.returnT - dt);
  setBars('return', A.returnT > 0);
  if(!A.spanned){
    const e = plate('fk-marks-echo'), k = plate('fk-marks-knight');
    if(e && k && e.pressed && k.pressed){
      A.spanned = true; kit.latch(ZONE, 'fk-span'); A.flash = .4; release(MARKS.echo);
      for(const o of G.obstacles) if(o.fkSpan){ o.gone = false; kit.burst(o.x, 10, '#d8b7ff', 6); }
      try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
    }
  }
}

/* ── THE WEIGHED CROWN ────────────────────────────────────────────────────── */
/* Two marks per cycle: the echo's (on the floor) and the knight's. In the last act the knight's is on a perch. */
function layMarks(A, e, p){
  clearMarks(A);
  const ph = CROWN.phases[A.phase], mid = (HALL.x1 + HALL.x2) / 2, side = (A.cycle++ % 2) ? 1 : -1;
  let ex, kx, ky = 0;
  // Your mark on a perch, the echo's on the floor on the same side: a walk and a climb inside the echo's five seconds.
  if(ph.perch){ const perch = HALL_PERCHES[side < 0 ? 0 : 1]; kx = perch.x; ky = perch.y; ex = perch.x - side * 420; }
  else { ex = mid + side * ph.apart / 2; kx = mid - side * ph.apart / 2; }
  const em = Object.assign(Plate(ex, 0, 'fk-crown-echo'), { echoOnly:1, actArt:'mark', fkHall:1 });
  const km = Object.assign(Plate(kx, ky, 'fk-crown-knight'), { actArt:'mark', knightMark:1, fkHall:1 });
  G.obstacles.push(em, km); A.hallMarks = [em, km];
}
function clearMarks(A){ G.obstacles = G.obstacles.filter(o => !o.fkHall); A.hallMarks = []; }
function volley(A, e, p){
  const V = CROWN.volley, n = V.n[A.phase], sx = e.x, sy = e.y + e.h * .4;
  const base = Math.atan2((p.y + 22) - sy, p.x - sx);
  for(let i = 0; i < n; i++){
    const a = base + (n > 1 ? (i / (n - 1) - .5) * V.spread : 0), sp = V.speed[A.phase];
    G.projectiles.push({ owner:'enemy', fkBolt:1, sourceType:'crown', x:sx, y:sy, vx:Math.cos(a) * sp, vy:Math.sin(a) * sp,
      gravity:0, size:9, color:'#d8b7ff', shape:'orb', glow:1, dmg:V.dmg, kb:200, pierce:0, el:'void', life:4, hitSet:[], portalHops:0 });
  }
}
/* It breaks the echoes it can see: a blow where your echo stands, after a tell. */
function breakers(A, p, dt){
  // Pulled down, it strikes nothing: a blow still falling is lost.
  if(A.crown && A.crown.st !== 'hover') A.breakers = [];
  for(const b of A.breakers){
    b.t += dt;
    if(!b.hit && b.t >= CROWN.breaker.tell){
      b.hit = true; kit.burst(b.x, 20, '#d8b7ff', 16);
      const echo = typeof echoStanding === 'function' ? echoStanding() : null;
      if(echo && Math.abs(echo.x - b.x) < CROWN.breaker.r){ echo.spent = true; try{ addText(echo.x, GROUND_Y - echo.y - 70, 'THE ECHO BREAKS', '#8d7aa8', false); }catch(_e){} }
      if(!p.dead && Math.abs(p.x - b.x) < CROWN.breaker.r && Math.abs(p.y - b.y) < 60) harm(p, Math.sign(p.x - b.x) || 1, CROWN.breaker.dmg);
    }
  }
  A.breakers = A.breakers.filter(b => b.t < CROWN.breaker.tell + .35);
}
function updateCrown(A, e, p, dt){
  if(p.dead || e.dead) return;
  e.t += dt;
  e.burnT = e.poisonT = e.bleedT = e.freezeT = e.floatT = e.counterStunT = 0;
  if(e.hp < e.hpWas && e.portalGate === 'melee') struck(A, e, p);
  e.hp = e.hpWas = 9999;
  e.shake = Math.max(0, (e.shake || 0) - dt);
  const ph = CROWN.phases[A.phase];
  if(A.fight && e.st !== 'down'){
    A.volleyT += dt;
    if(A.volleyT >= CROWN.volley.every[A.phase] && e.st === 'hover'){ A.volleyT = 0; volley(A, e, p); }
    // It breaks the echoes it can see: an echo stands here `every` and a tell, no longer.
    if(ph.breaks){ const echo = typeof echoStanding === 'function' ? echoStanding() : null;
      if(!echo || e.st !== 'hover') A.breakT = 0; else if((A.breakT += dt) >= CROWN.breaker.every && !A.breakers.length){ A.breakT = 0; A.breakers.push({ x:echo.x, y:echo.y, t:0 }); } }
  }
  switch(e.st){
    case 'wait':
      if(p.x > HALL.x1 + 80 && p.x < HALL.x2 && !p.dead){
        e.st = 'hover'; e.t = 0; A.fight = true; setBars('hall-west', false); A.volleyT = 0; A.breakT = 0; layMarks(A, e, p);
        if(!A.introduced){ A.introduced = true; kit.latch(ZONE, 'fk-met');
          A.queue.push({ src:e, accent:'#d8b7ff', html:'<b>THE WEIGHED CROWN</b><br>The King\'s echo, hung over his hall by the weight he never let go of. Two marks under it — one yours, one for the body you leave. Weighed together, they pull it down.' }); }
      }
      break;
    case 'hover': {
      e.x += Math.sign(e.tx - e.x) * Math.min(Math.abs(e.tx - e.x), CROWN.rise * dt);
      e.y += Math.sign(CROWN.hoverY - e.y) * Math.min(Math.abs(CROWN.hoverY - e.y), CROWN.rise * dt);
      const [em, km] = A.hallMarks;
      if(em && km && em.pressed && km.pressed){ e.st = 'pulled'; e.t = 0; e.tx = em.x; }
      break;
    }
    case 'pulled':
      // Down onto the echo's mark, fast.
      e.x += Math.sign(e.tx - e.x) * Math.min(Math.abs(e.tx - e.x), CROWN.pull * dt);
      e.y += Math.sign(0 - e.y) * Math.min(Math.abs(e.y), CROWN.pull * dt);
      if(Math.abs(e.x - e.tx) < 2 && e.y < 2){ e.st = 'kneel'; e.t = 0; e.struck = false; kit.burst(e.x, 10, '#d8b7ff', 20); try{ G.shake = Math.min((G.shake || 0) + 6, 12); }catch(_e){} }
      break;
    case 'kneel':
      if(e.t >= CROWN.kneel){ e.st = 'hover'; e.t = 0; e.tx = (HALL.x1 + HALL.x2) / 2; layMarks(A, e, p); }
      break;
    case 'down': break;
  }
  e.baseY = e.y;
  e.x = Math.max(HALL.x1 + 80, Math.min(HALL.x2 - 80, e.x));
  e.portalGate = e.st === 'kneel' && !e.struck ? 'melee' : 'crown-never';
}
function struck(A, e, p){
  e.struck = true; e.shake = .8; A.marks++; A.flash = .4; kit.burst(e.x, e.y + e.h / 2, '#f1e6ff', 22);
  try{ if(meta.soundOn) SFX.hit(); }catch(_e){}
  if(A.marks >= CROWN.phases[A.phase].marks){
    A.marks = 0;
    if(A.phase < CROWN.phases.length - 1){ kit.latch(ZONE, 'fk-crown-' + (A.phase + 1)); A.phase++; }
    else {
      e.st = 'down'; e.y = 0; A.crowned = true; A.fight = false; A.breakers = []; clearMarks(A); kit.latch(ZONE, 'fk-crown'); F.clear(STAGE);
      for(const pr of G.projectiles) if(pr.fkBolt) pr.life = 0;
      setBars('hall-east', true); setBars('hall-west', true);
      A.queue.push({ src:e, accent:'#d8b7ff', html:'<b>THE WEIGHED CROWN</b><br>It stays down. Whatever held it up has been set somewhere else, and nobody is coming back for it.' });
      try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
    }
  }
}
function resetCrown(A){
  const e = A.crown; if(!e) return;
  A.fight = false; A.marks = 0; A.breakers = []; A.queue = []; A.volleyT = A.breakT = 0; e.hp = e.hpWas = 9999; e.struck = false; e.portalGate = 'crown-never'; clearMarks(A); e.st = 'wait'; e.t = 0; e.x = e.tx = (HALL.x1 + HALL.x2) / 2; e.y = CROWN.hoverY;
  for(const pr of G.projectiles) if(pr.fkBolt) pr.life = 0;
  setBars('hall-west', true);
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  road(A, p, dt);
  breakers(A, p, dt);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  if(A.fight && (p.dead || p.x < HALL.x1 - 20)) resetCrown(A);
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && A.crowned && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('THE FRACTURED KING · BEHIND YOU', 'THE FRACTURED LINE', 'Act Three · the next echo',
      'Behind you the Throne is empty and stays empty. Ahead, the Deep Line, where the road went down the first time.', false); }
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'crown') return updateCrown(A, e, p, dt);
}
function lateUpdate(){}
function interact(){ return false; }
function swing(){}
function voidFloor(){ return -160; }
function cameraFloor(p){ if(!p) return null; return Math.max(-160, Math.min(0, p.y - 40)); }
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 400) return { connector:'ft-fk', zone:ZONE, targetStage:33, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.crowned ? F.seamOn(STAGE, ZONE, 'fk-fl', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fk-fl' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.fight ? CUES.crown : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedKing = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, constants:Object.freeze({ LEN, SPAWN, GROUND, FIRST, RETURN, MARKS, HALL, HALL_PERCHES, HALL_STEPS, CROWN, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
