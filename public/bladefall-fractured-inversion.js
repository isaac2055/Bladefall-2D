/* Bladefall — ACT THREE · The Fractured Inversion (stage 32), 2026-09-25.

   The twelfth echo: the Inversion after the Echo walked it backwards. The Inversion is the right way up,
   which is the wrong way for it. It was walked east to west, so the echo runs west to east. The kit is
   the one the Inversion was entered with: jump, the Oathblade, the dash, the twin mouths, the wall jump,
   the Counter, the double jump, Attunement, Companion Command and the downward strike. The gravity flip
   waits at the anchor, where it did. The Muster applies.

     THE RIGHT WAY UP: the anchor, and the flip.
     THE CROSSINGS: the floor and the roof both break, and never over each other. Where the floor fails,
       a pillar stands in the gap too tall to jump, so you go up and walk the roof. Where the roof fails,
       a spur hangs into the gap, so you come down and walk the floor. Some of the roof crumbles under a
       knight standing on it.
     THE WEAVE: a corridor between floor and roof, with walls up from the floor and walls down from the
       roof, one after another. You pass each on the other surface, over thorns that stand up on a beat.
     THE KEEL (the C-side): the keelman's echo, a thing with a keel and no floor. It burns the floor or
       the roof in sweeps, and you flip to the other. It shows its keel to one side at a time and goes
       to that side, and only a blow from that side counts. */
(function installFracturedInversion(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 32, ZONE = 'fractured-inversion', SOURCE = 11;
const LEN = 10200;
const SPAWN = { x:140, y:0 };
const ROOF = 500;                                     // the roof's underside: the flipped floor
const SKY = 1200;                                     // flipped and past this, the sky has you (a fall's rewind)
const VOID = -320;                                    // and below this, the void

/* ── Geometry (world units; y up; the floor is y 0; below it the void, above the roof the sky) ──────── */
const ANCHOR = { x:1100 };
const ROOF_FROM = 600;
/* The Crossings: [x0, x1, stone] gaps in the floor, each with a pillar standing in it 300 high (no jump
   clears it: you go up and walk the roof), and gaps in the roof, each with a spur hanging into it down
   to 200 (no flipped knight passes it: you come down and walk the floor). */
const FLOOR_GAPS = [ [1500, 2000], [2800, 3300], [4450, 4950] ];
const ROOF_GAPS  = [ [2150, 2650] ];
const CRUMBLE = [ [1550, 1950], [4500, 4900] ];       // roof over these floor gaps crumbles under a standing knight
const ROOF_TEETH = [ [2950, 1.3], [3150, 0], [4700, 0] ];   // teeth on the roof, on a beat; the last in the crumble
/* The Gulf: floor and roof both gone. A spur hangs from the sky to 150, then a pillar stands from the void
   to 350: under the one and over the other, in one breath — a flip in the air. */
const GULF = { x0:3550, x1:4100, spur:{ x:3700, to:150 }, pillar:{ x:3950, to:350 } };
/* The Weave: walls alternately up from the floor (to 300) and down from the roof (to 200). */
const WEAVE = { x0:5350, x1:7150, step:300, w:40, up:300, down:200 };
const WEAVE_THORNS = { period:2.4, upT:.9, dmg:14 };
/* The Keel's hall: a lower roof (420), bars at both ends, a lintel over the west bars (walk in on the floor). */
const HALL = { x1:7500, x2:8600, roof:420 };
/* The Keel's cycle: it TURNS its keel toward the surface you are not on and glides off to one side of
   you; then it SWEEPS the surface you are on. Flip at a run and you arrive under (or over) it with its keel
   bare: strike. From the second act a second sweep follows you to the surface you fled to, so you strike
   and flip back. In the third act it ends each cycle diving along your surface. Then it shuts and rests. */
const KEEL = {
  w:120, h:50, near:{ floor:110, roof:250 }, mid:180,  // its y when it shows its keel down (to the floor) or up (to the roof)
  glide:420, offset:260, rise:520,
  phases:[ { marks:2, double:false }, { marks:2, double:true }, { marks:2, double:true, dive:true } ],
  turn:.5, rest:[1.1, .9, .7],
  sweep:{ tell:.9, burn:.9, gap:1.0, dmg:16, reach:70 },
  dive:{ tell:.6, speed:560, dmg:18 },
  stagger:1.0,
};
const CHECKPOINTS = [ { id:'up', x:400 }, { id:'anchor', x:1250 }, { id:'crossing', x:2720 }, { id:'gulf', x:3420 },
  { id:'crumble', x:4250 }, { id:'weave', x:5150 }, { id:'hall', x:HALL.x1 - 120 } ];
function cuts(list){ return list.slice().sort((a, b) => a[0] - b[0]); }
function floorSegs(){
  const segs = []; let from = 0;
  for(const [a, b] of cuts(FLOOR_GAPS.concat([[GULF.x0, GULF.x1]]))){ segs.push([from, a]); from = b; }
  segs.push([from, LEN]);
  return segs;
}
function roofSegs(){
  const segs = []; let from = ROOF_FROM;
  for(const [a, b] of cuts(ROOF_GAPS.concat([[GULF.x0, GULF.x1]]))){ segs.push([from, a]); from = b; }
  segs.push([from, HALL.x1]);
  return segs;
}
function groundAt(x){ for(const g of floorSegs()) if(x >= g[0] && x < g[1]) return 0; return null; }
const CUES = Object.freeze({
  keel:Object.freeze({ id:'fractured-keel', src:'./audio/music/fractured-abnormal-circumstances.mp3', title:'Abnormal Circumstances (fractured)',
    artist:'Bladefall score', mood:'the Keel: which surface you owe' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function roofSlab(x0, x1, y, extra){ return Object.assign(Pl((x0 + x1) / 2, x1 - x0, y + 16), { h:16, ceilingOnly:1, invRoof:1, actArt:'roof' }, extra || {}); }
function stone(x, top, bottom, w, art){ return Object.assign(Wl(x, top, top - bottom, w), { noCling:1, slickL:1, slickR:1, actArt:art || 'invwall' }); }
function buildLevel(){
  const objects = [];
  floorSegs().forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'invfloor' })));
  // The roof: continuous except over its gaps; over two floor gaps it crumbles.
  for(const [a, b] of roofSegs()){
    let cursor = a;
    for(const [c0, c1] of CRUMBLE){
      if(c1 <= cursor || c0 >= b) continue;
      if(c0 > cursor) objects.push(roofSlab(cursor, c0, ROOF));
      for(let x = Math.max(c0, cursor); x < Math.min(c1, b); x += 100) objects.push(roofSlab(x, Math.min(x + 100, c1), ROOF, { crumble:1, actArt:'crumble' }));
      cursor = Math.min(c1, b);
    }
    if(cursor < b) objects.push(roofSlab(cursor, b, ROOF));
  }
  FLOOR_GAPS.forEach(([a, b]) => objects.push(stone((a + b) / 2, 300, VOID - 40, 50, 'pillar')));
  ROOF_GAPS.forEach(([a, b]) => objects.push(stone((a + b) / 2, SKY + 200, 200, 50, 'spur')));
  objects.push(stone(GULF.spur.x, SKY + 200, GULF.spur.to, 50, 'spur'));
  objects.push(stone(GULF.pillar.x, GULF.pillar.to, VOID - 40, 50, 'pillar'));
  ROOF_TEETH.forEach(([x, ph]) => objects.push(Object.assign(Sp(x, ROOF, { w:110, period:2.6, phase:ph, upT:1.0, dmg:14 }), { ceil:1, actArt:'teeth' })));
  // The Weave.
  for(let x = WEAVE.x0, k = 0; x <= WEAVE.x1; x += WEAVE.step, k++){
    if(k % 2 === 0) objects.push(stone(x, WEAVE.up, 0, WEAVE.w, 'pillar'));
    else objects.push(stone(x, ROOF, WEAVE.down, WEAVE.w, 'spur'));
    // Thorns between walls: on the floor under a spur's gap, on the roof over a pillar's gap.
    const tx = x + WEAVE.step / 2;
    if(tx < WEAVE.x1) objects.push(Object.assign(Sp(tx, k % 2 === 0 ? ROOF : 0, { w:90, period:WEAVE_THORNS.period, phase:k * .6, upT:WEAVE_THORNS.upT, dmg:WEAVE_THORNS.dmg }),
      k % 2 === 0 ? { ceil:1, actArt:'teeth' } : { actArt:'thorns' }));
  }
  // The Keel's hall.
  objects.push(roofSlab(HALL.x1, HALL.x2, HALL.roof, { actArt:'hallroof' }));
  objects.push(stone(HALL.x1, SKY + 200, HALL.roof, 60, 'lintel'));
  objects.push({ type:'wall', x:HALL.x1, y:HALL.roof + 40, h:HALL.roof + 40, w:30, noCling:1, actArt:'bars', actBars:'hall-west', gone:true });
  objects.push({ type:'wall', x:HALL.x2, y:HALL.roof + 40, h:HALL.roof + 40, w:30, noCling:1, actArt:'bars', actBars:'hall-east', gone:false });
  objects.push({ type:'actAnchor', actId:'anchor', x:ANCHOR.x, y:0, w:40, h:80 });
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:300, y:0, w:40, h:20, restSiteAnchor:'keel-ash' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true, flip:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'keelman', x:2400, y:250, patrol:[2200, 2600], noDrop:true },
      { t:'keelman', x:5800, y:250, patrol:[5500, 6100], noDrop:true },
      { t:'rifthound', x:7350, patrol:[7260, 7440], noDrop:true },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    flip:done(c, 'fi-flip'), phase:done(c, 'fi-keel-2') ? 2 : done(c, 'fi-keel-1') ? 1 : 0, keeled:done(c, 'fi-keel'), marks:0,
    fight:false, introduced:done(c, 'fi-met'), over:false, sweeps:[] };
  const A = G.actTwo;
  // The Inversion's kit: everything through the downward strike — and the flip, from the anchor, where it was.
  const ids = ['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement', 'companion-command', 'downward-strike'];
  F.setKit(A.flip ? ids.concat('gravity-flip') : ids);
  setBars('hall-east', A.keeled);
  const anc = G.obstacles.find(o => o.actId === 'anchor'); if(anc) anc.actMute = A.flip;
}
function firstFrame(A){ F.muster(); spawnKeel(A); }
function spawnKeel(A){
  const e = spawnEnemy('grunt', (HALL.x1 + HALL.x2) / 2);
  // kind 'fly': it owes neither floor, so the renderer never turns it over with the world.
  Object.assign(e, { actFoe:'keel', kind:'fly', x:(HALL.x1 + HALL.x2) / 2 + 200, y:KEEL.near.floor, baseY:KEEL.near.floor, w:KEEL.w, h:KEEL.h,
    st:'wait', t:0, face:-1, side:'down', tx:(HALL.x1 + HALL.x2) / 2, frontShield:false, portalGate:'keel-never', active:true, noDrop:true, boss:false,
    maxHp:9999, hp:9999, hpWas:9999, noticeRange:1 });
  if(A.keeled) Object.assign(e,{st:'down',y:0,baseY:0});
  A.keel = e;
}
function setBars(id, open){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === open) return; b.gone = open; b.moveT = 0.5;
}
function harm(p, dir, dmg){
  if(p.dead || p.invuln > 0 || p.dodgeTimer > 0) return;
  try{ hurtPlayer(dmg, dir, true); }catch(_e){}
}

/* ── The anchor; the sky ──────────────────────────────────────────────────── */
function anchor(A, p){
  if(A.flip || p.dead || Math.abs(p.x - ANCHOR.x) > 40 || p.y > 60) return;
  A.flip = true; kit.latch(ZONE, 'fi-flip'); F.grant('gravity-flip'); A.flash = .4;
  const o = G.obstacles.find(o => o.actId === 'anchor'); if(o) o.actMute = true;
  try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
  A.queue.push({ src:{ x:ANCHOR.x, y:0 }, accent:'#c9a2ff', html:'<b>THE ANCHOR</b><br>It holds nothing now. You remember what it held: which way is down is a thing you choose.' });
}
function sky(A, p){
  // A fall into the sky rewinds like a fall into the void, and you come back the right way up.
  if(G.gravityFlipped && p.y > SKY && !p.dead){ try{ hurtPlayer(0, 1, false); }catch(_e){} G.gravityFlipped = false; }
}

/* ── THE KEEL ─────────────────────────────────────────────────────────────── */
/* Where the knight is: on (or toward) the floor, or on (or toward) the roof. */
function surfaceOf(){ return G.gravityFlipped ? 'roof' : 'floor'; }
function otherOf(w){ return w === 'floor' ? 'roof' : 'floor'; }
function sweepAt(A, which){ A.sweeps.push({ which, t:0, tell:KEEL.sweep.tell, burn:KEEL.sweep.burn }); }
function onSurface(p, which){
  return which === 'floor' ? (!G.gravityFlipped && p.y < KEEL.sweep.reach) : (G.gravityFlipped && p.y + p.h > HALL.roof - KEEL.sweep.reach);
}
function sweeps(A, p, dt){
  for(const s of A.sweeps){
    s.t += dt;
    if(s.t >= s.tell && s.t < s.tell + s.burn && !p.dead && onSurface(p, s.which) && p.x > HALL.x1 && p.x < HALL.x2) harm(p, 1, KEEL.sweep.dmg);
  }
  A.sweeps = A.sweeps.filter(s => s.t < s.tell + s.burn);
}
/* Bare while it turns and sweeps: until the (last) sweep's burn begins where it shows its keel. */
function bare(A, e){
  if(e.struck) return false;                           // one mark a cycle
  if(e.st === 'turn') return true;
  if(e.st !== 'sweeping') return false;
  const W = KEEL.sweep; return KEEL.phases[A.phase].double ? e.t < W.gap + W.tell : e.t < W.tell + W.burn;
}
function updateKeel(A, e, p, dt){
  if(p.dead || e.dead) return;
  e.t += dt;
  e.burnT = e.poisonT = e.bleedT = e.freezeT = e.floatT = e.counterStunT = 0;
  if(e.hp < e.hpWas && e.portalGate === 'melee') onBlow(A, e, p);
  e.hp = e.hpWas = 9999;
  const ph = KEEL.phases[A.phase], W = KEEL.sweep;
  const shown = e.st === 'turn' || e.st === 'sweeping';
  e.shake = Math.max(0, (e.shake || 0) - dt);
  const wantY = e.st === 'down' ? 0 : e.st === 'dive' || e.st === 'dive-tell' ? e.diveY : shown ? KEEL.near[e.side === 'down' ? 'floor' : 'roof'] : KEEL.mid;
  e.y += Math.sign(wantY - e.y) * Math.min(Math.abs(wantY - e.y), KEEL.rise * dt); e.baseY = e.y;
  if(e.st === 'turn' || e.st === 'sweeping') e.x += Math.sign(e.tx - e.x) * Math.min(Math.abs(e.tx - e.x), KEEL.glide * dt);
  switch(e.st){
    case 'wait':
      if(p.x > HALL.x1 + 80 && p.x < HALL.x2 && !p.dead){
        e.st = 'rest'; e.t = 0; A.fight = true; setBars('hall-west', false);
        if(!A.introduced){ A.introduced = true; kit.latch(ZONE, 'fi-met');
          A.queue.push({ src:e, accent:'#c9a2ff', html:'<b>THE KEEL</b><br>A thing with a keel instead of legs, which owes neither floor and so never has to choose. It turns its keel away from you.' }); }
      }
      break;
    case 'rest':
      if(e.t >= KEEL.rest[A.phase] && !p.dead){
        // It shows its keel to the surface you are NOT on, and glides off to one side of you.
        e.side = surfaceOf() === 'floor' ? 'up' : 'down';
        const room = [p.x - KEEL.offset, p.x + KEEL.offset].filter(x => x > HALL.x1 + 90 && x < HALL.x2 - 90);
        e.tx = room.length ? room[room.length > 1 && Math.abs(room[0] - e.x) < Math.abs(room[1] - e.x) ? 0 : room.length - 1] : (HALL.x1 + HALL.x2) / 2;
        e.st = 'turn'; e.t = 0; e.struck = false;
      }
      break;
    case 'turn':
      // It burns the surface it turned its keel away from: where you were.
      if(e.t >= KEEL.turn){ e.first = e.side === 'up' ? 'floor' : 'roof'; sweepAt(A, e.first); e.second = null; e.st = 'sweeping'; e.t = 0; }
      break;
    case 'sweeping':
      if(ph.double && !e.second && e.t >= W.gap){ e.second = otherOf(e.first); sweepAt(A, e.second); }
      if(e.t >= (ph.double ? W.gap : 0) + W.tell + W.burn){
        if(ph.dive){ e.st = 'dive-tell'; e.t = 0; e.diveDir = Math.sign(p.x - e.x) || 1; e.diveY = G.gravityFlipped ? HALL.roof - 60 : 12; }
        else { e.st = 'rest'; e.t = 0; }
      }
      break;
    case 'dive-tell': if(e.t >= KEEL.dive.tell){ e.st = 'dive'; e.t = 0; } break;
    case 'dive':
      e.x += e.diveDir * KEEL.dive.speed * dt;
      if(!p.dead && Math.abs(p.x - e.x) < e.w / 2 + p.w / 2 && p.y < e.y + e.h && p.y + p.h > e.y) harm(p, e.diveDir, KEEL.dive.dmg);
      if(e.x < HALL.x1 + 80 || e.x > HALL.x2 - 80){ e.st = 'rest'; e.t = 0; }
      break;
    case 'down': break;
  }
  e.x = Math.max(HALL.x1 + 70, Math.min(HALL.x2 - 70, e.x));
  // Only its keel side counts: the blade from the floor while it shows its keel down, from the roof while it shows it up.
  const right = (e.side === 'down' && !G.gravityFlipped) || (e.side === 'up' && G.gravityFlipped);
  e.portalGate = right && bare(A, e) ? 'melee' : 'keel-never';
}
function onBlow(A, e, p){
  // The blow marks it and it flinches; the cycle runs on — the second sweep and the dive still come.
  A.marks++; A.flash = .4; e.struck = true; e.shake = KEEL.stagger; kit.burst(e.x, e.y + e.h / 2, '#e0c8ff', 18);
  try{ if(meta.soundOn) SFX.hit(); }catch(_e){}
  if(A.marks >= KEEL.phases[A.phase].marks){
    A.marks = 0;
    if(A.phase < KEEL.phases.length - 1){ kit.latch(ZONE, 'fi-keel-' + (A.phase + 1)); A.phase++; }
    else {
      e.st = 'down'; A.keeled = true; A.fight = false; A.sweeps = []; kit.latch(ZONE, 'fi-keel'); F.clear(STAGE);
      setBars('hall-east', true); setBars('hall-west', true);
      A.queue.push({ src:e, accent:'#c9a2ff', html:'<b>THE KEEL</b><br>It rolls over and settles on the floor keel-down, like a boat pulled up for the winter. It has chosen at last.' });
      try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
    }
  }
}
function resetKeel(A){ const e = A.keel; if(!e) return; A.fight = false; A.marks = 0; A.sweeps = []; Object.assign(e,{st:'wait',t:0,struck:false,hp:9999,hpWas:9999,second:null,diveY:null,diveDir:0,portalGate:'keel-never'}); A.queue = []; setBars('hall-west', true); }

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  sweeps(A, p, dt);
  sky(A, p);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  anchor(A, p);
  if(A.fight && (p.dead || p.x < HALL.x1 - 20)) resetKeel(A);
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && A.keeled && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('THE FRACTURED INVERSION · BEHIND YOU', 'THE FRACTURED TYRANT', 'Act Three · the next echo',
      'Behind you the Keel has chosen a floor. Ahead the Citadel\'s paradoxes have all been answered, and nobody believes the answers.', false); }
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'keel') return updateKeel(A, e, p, dt);
}
function lateUpdate(){}
function interact(){ return false; }
function swing(){}
function voidFloor(){ return VOID; }
function cameraFloor(p){ if(!p) return null; return Math.max(VOID, Math.min(70, p.y + 70)); }   // both floors in view; over a gap, look down into it
/* Both floors in view, standing on either: the engine frames a flipped knight a third of the way up the screen,
   which from the roof hides the floor you are about to flip to. */
function cameraCeiling(p){ if(!p || !G.gravityFlipped || p.y > ROOF + 40) return null; return 100; }
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 400) return { connector:'fcl-fi', zone:ZONE, targetStage:31, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.keeled ? F.seamOn(STAGE, ZONE, 'fi-ft', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fi-ft' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.fight ? CUES.keel : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, cameraCeiling, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedInversion = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, floorSegs, roofSegs, constants:Object.freeze({ LEN, SPAWN, ROOF, SKY, VOID, ANCHOR, ROOF_FROM, FLOOR_GAPS, ROOF_GAPS, CRUMBLE, ROOF_TEETH, GULF, WEAVE,
    WEAVE_THORNS, HALL, KEEL, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
