/* Bladefall — ACT THREE · The Fractured Colossus (stage 31), 2026-09-24.

   The eleventh echo: the Foundry after the Echo walked it backwards. The great machine stands where it
   fell, and it is warm. Stone you set here does not stay set for long. The kit is the one the Foundry
   was entered with: jump, the Oathblade, the dash, the twin mouths, the wall jump, the Counter, the
   double jump, Attunement and Companion Command. The downward strike waits at the anvil, where it did.
   The Muster applies.

     THE ANVIL: the downward strike. Land it on the anvil's mould while the mould is glass, and the
       mould sets and the bars lift.
     THE CASTING LINE: six moulds over the void, molten most of the time, and never solid at the same
       moment as their neighbour. Land on one while it is glass and set it, so that you can wait on it
       for the next one to cool.
     THE SHAFT: moulds up a wet chimney, each set as you reach it, and lava rising behind you. At the
       top, strike the valve and the lava drains.
     THE WARM MACHINE (the C-side): the Colossus's echo, which takes each of its three answers in turn.
         I   It pours into the bay nearest you. Set that bay's mould before the metal comes, and the
             pour is refused. The refusal is the blow.
         II  It throws its slugs. Counter them back into its core.
         III It lowers its gantry. Climb it, jump its arm, and bring the downward strike down on its
             head from above.
       Two in each. */
(function installFracturedColossus(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 31, ZONE = 'fractured-colossus', SOURCE = 10;
const LEN = 9000;
const SPAWN = { x:140, y:0 };

/* ── Geometry (world units; y up; the floor is y 0; under the moulds, the void) ──────── */
const BAYS = [7000, 7140, 7280, 7420, 7560];          // the casting bed: five moulds, 120 wide, iron strips between
const GROUND = [ [0, 2400], [3760, 6940], [7060, 7080], [7200, 7220], [7340, 7360], [7480, 7500], [7620, LEN] ];
const ANVIL = { x:1500, mould:{ x:1900, w:120, y:60 }, bars:2150 };
const ANVIL_HEAT = { period:4.0, molten:.35, set:.8 };
/* The Casting Line: each mould is solid 30% of its 3.6 s (glass .65 s, then stone), and its neighbour is half a cycle
   away, so no two neighbours are ever solid together: set the one you are on to wait for the next. Gaps 90: from a
   standing start on a mould, a jump over 120 only just reached the next one's edge, too late to strike down on it. */
const LINE = { x0:2540, step:210, n:6, w:120, heat:{ period:3.6, molten:.7, set:.88 } };
/* The Shaft: a wet chimney (walk in under its west wall), and up it eleven moulds 90 apart, alternating sides, each
   solid only 30% of the time and half a cycle from the one below: set each to wait on it. The lava rises behind you
   once you are in; it never catches a climber who keeps the beat, and a missed window costs 3.6 s of it. (A chimney
   of plain walls went up in 4.4 s by wall jumps, and nothing behind it mattered; spouts down a 170-wide chimney were
   unavoidable.) At the top, the valve. */
const SHAFT = { x0:5800, x1:6000, top:1000, hung:150, gantry:{ x:6220, w:420, y:1010 }, valve:{ x:6100 }, bars:6380 };
// Rises of 90: past a jump (78), inside a double jump from a standstill (~118) with room to strike down on the ledge.
const SHAFT_LEDGES = Array.from({ length:11 }, (_, i) => [i % 2 ? 5950 : 5850, 90 * (i + 1)]);
const LAVA = { from:-60, speed:40, grace:3 };   // the beat climbs 90 every 1.8 s (50/s): at 70 it caught a perfect climber
/* The Warm Machine. */
const ARENA = { x1:6800, x2:7900 };
const BED_HEAT = { period:5.0, molten:.3, set:.7 };  // glass 2.0 s, stone 1.5 s; set stone warms back in 6 s
const SET_HOLDS = 6;
const COLOSSUS = { x:7760, w:110, h:160, core:{ y0:40, y1:150 } };
// Rises of 120 (a double jump is ~147; at 130 with a 100 step across it fell short). Each step is climbed from beside it, never from under it: the first from
// the east (it stands against the gate), the second from the first's west end, the deck (which starts east of the
// second) from the second's east end.
const GANTRY = { ledges:[ [6860, 90, 120], [6900, 90, 240] ], deck:{ x:7325, w:730, y:360 } };   // each step ~40 across and 120 up; the deck
// ends short of its head (7690 against 7705): a strike begun over the deck lands on the deck.
const W = {
  phases:[ { marks:2 }, { marks:2 }, { marks:2 } ],
  pour:{ gather:1.5, pour:.6, cool:2.2, reach:80, dmg:20 },
  slug:{ speed:360, dmg:14, every:2.2, twin:.9 },
  sweep:{ tell:.7, speed:900, every:3.2, y0:355, y1:415, dmg:18 },
  slam:{ from:150 }, stagger:1.2,                   // begun over 310: off the deck (360) onto its head (160); at 190 a strike
                                                    // begun a moment late off the deck's end did not count
};
const CHECKPOINTS = [ { id:'floor', x:400 }, { id:'anvil', x:1200 }, { id:'line', x:2300 }, { id:'shaft', x:5650 }, { id:'arena', x:ARENA.x1 - 120 } ];
function groundAt(x){ for(const g of GROUND) if(x >= g[0] && x < g[1]) return 0; return null; }
const CUES = Object.freeze({
  machine:Object.freeze({ id:'fractured-molten-colossus', src:'./audio/music/fractured-forge-of-the-molten-colossus.mp3', title:'Forge of the Molten Colossus (fractured)',
    artist:'Aerth score', mood:'the Warm Machine: set, counter, strike' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function mould(x, w, y, phase, cyc, extra){ return Object.assign(Pl(x, w, y), { h:16, actArt:'mould', heatCycle:Object.assign({ phase }, cyc) }, extra || {}); }
function buildLevel(){
  const objects = [];
  GROUND.forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'foundry' })));
  // The Anvil.
  objects.push({ type:'actAnvil', actId:'anvil', x:ANVIL.x, y:0, w:70, h:50 });
  objects.push(Object.assign(Pl(ANVIL.mould.x, ANVIL.mould.w, ANVIL.mould.y - 16), { h:ANVIL.mould.y - 16, actArt:'pedestal' }));   // iron under it: stand on the mould, never under
  objects.push(mould(ANVIL.mould.x, ANVIL.mould.w, ANVIL.mould.y, 0, ANVIL_HEAT, { fclAnvil:1 }));
  objects.push({ type:'wall', x:ANVIL.bars, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'anvil', gone:false });
  // The Casting Line.
  for(let k = 0; k < LINE.n; k++) objects.push(mould(LINE.x0 + k * LINE.step, LINE.w, 0, (k % 2) * LINE.heat.period / 2, LINE.heat, { fclLine:1 }));
  // The Shaft.
  objects.push(Object.assign(Wl(SHAFT.x0, SHAFT.top, SHAFT.top - SHAFT.hung, 30), { noCling:1, slickL:1, slickR:1, actArt:'foundrywall' }));
  objects.push(Object.assign(Wl(SHAFT.x1, SHAFT.top - 50, SHAFT.top - 50, 30), { noCling:1, slickL:1, slickR:1, actArt:'foundrywall' }));
  SHAFT_LEDGES.forEach((l, i) => objects.push(mould(l[0], 70, l[1], (i % 2) * LINE.heat.period / 2, LINE.heat, { fclLine:1, fclShaft:i })));
  objects.push(Object.assign(Pl(SHAFT.gantry.x, SHAFT.gantry.w, SHAFT.gantry.y), { h:20, actArt:'gantry' }));
  objects.push({ type:'actValve', actId:'valve', x:SHAFT.valve.x, y:SHAFT.gantry.y, w:50, h:30 });
  // Full height: off the gantry's west end a knight drops beside the shaft wall to the floor, and must not walk on from there.
  objects.push({ type:'wall', x:SHAFT.bars, y:SHAFT.gantry.y + 400, h:SHAFT.gantry.y + 400, w:30, noCling:1, actArt:'bars', actBars:'valve', gone:false });
  objects.push({ type:'actLava', actId:'shaft-lava', x:(SHAFT.x0 + SHAFT.x1) / 2, y:LAVA.from, w:SHAFT.x1 - SHAFT.x0 + 60 });
  // The Warm Machine.
  BAYS.forEach((x, i) => objects.push(mould(x, 120, 0, i * .9, BED_HEAT, { fclBay:i })));
  GANTRY.ledges.forEach(l => objects.push(Object.assign(Pl(l[0], l[1], l[2]), { h:18, actArt:'gantry', fclGantry:1, gone:true })));
  objects.push(Object.assign(Pl(GANTRY.deck.x, GANTRY.deck.w, GANTRY.deck.y), { h:20, actArt:'gantry', fclGantry:1, gone:true }));
  objects.push({ type:'wall', x:ARENA.x1, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'arena-west', gone:true });
  objects.push({ type:'wall', x:ARENA.x2, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'arena-east', gone:false });
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:300, y:0, w:40, h:20, restSiteAnchor:'crucible-ash' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'cinderling', x:900, patrol:[700, 1150], noDrop:true },
      { t:'slagwright', x:4600, patrol:[4300, 5000], noDrop:true },
      { t:'emberling', x:6500, patrol:[6400, 6650], noDrop:true },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    strike:done(c, 'fcl-strike'), anvil:done(c, 'fcl-anvil'), valve:done(c, 'fcl-valve'),
    phase:done(c, 'fcl-machine-2') ? 2 : done(c, 'fcl-machine-1') ? 1 : 0, machined:done(c, 'fcl-machine'), marks:0,
    fight:false, introduced:done(c, 'fcl-met'), over:false, lava:{ y:LAVA.from, t:0, on:false }, aoes:[], sweeps:[] };
  const A = G.actTwo;
  // The Foundry's kit: everything through Companion Command — and the downward strike, from the anvil, where it was.
  const ids = ['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement', 'companion-command'];
  F.setKit(A.strike ? ids.concat('downward-strike') : ids);
  setBars('anvil', A.anvil); setBars('valve', A.valve); setBars('arena-east', A.machined);
  if(A.anvil){ const m = G.obstacles.find(o => o.fclAnvil); if(m){ m.heatSet = true; m.fclKeep = true; } }
  const anv = G.obstacles.find(o => o.actId === 'anvil'); if(anv) anv.actMute = A.strike;
}
function firstFrame(A){
  F.muster();
  spawnMachine(A);
  if(A.phase >= 2) gantry(true);
}
function spawnMachine(A){
  const e = spawnEnemy('grunt', COLOSSUS.x);
  Object.assign(e, { actFoe:'machine', x:COLOSSUS.x, y:0, baseY:0, w:COLOSSUS.w, h:COLOSSUS.h, st:'wait', t:0, face:-1,
    frontShield:false, portalGate:'machine-never', active:true, noDrop:true, boss:false, maxHp:9999, hp:9999, noticeRange:1, cool:1.5 });
  if(A.machined) e.st = 'down';
  A.machine = e;
}
function setBars(id, open){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === open) return; b.gone = open; b.moveT = 0.5;
}
function gantry(on){ for(const o of G.obstacles) if(o.fclGantry) o.gone = !on; }
function harm(p, dir, dmg){
  if(p.dead || p.invuln > 0 || p.dodgeTimer > 0) return;
  try{ hurtPlayer(dmg, dir, true); }catch(_e){}
  if(!p.dead){ p.vx = dir * 280; p.vy = -260; p.jumpCutOk = false; }
}

/* ── The Anvil and the moulds ─────────────────────────────────────────────── */
function anvil(A, p){
  if(p.dead) return;
  if(!A.strike && !p.dead && Math.abs(p.x - ANVIL.x) < 40 && p.y < 40){
    A.strike = true; kit.latch(ZONE, 'fcl-strike'); F.grant('downward-strike'); A.flash = .4;
    const o = G.obstacles.find(o => o.actId === 'anvil'); if(o) o.actMute = true;
    try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
    A.queue.push({ src:{ x:ANVIL.x, y:0 }, accent:'#ffb454', html:'<b>THE ANVIL</b><br>Still warm. You know the blow it was made for now, straight down, and what it does to metal that is only glass.' });
  }
  if(!A.anvil){ const m = G.obstacles.find(o => o.fclAnvil); if(m && m.heatSet){ A.anvil = true; m.fclKeep = true; kit.latch(ZONE, 'fcl-anvil'); setBars('anvil', true); A.flash = .3; } }
}
/* The machine is warm: stone you set on its bed goes back to the heat after a while (the road's, you keep). */
function warmth(dt){
  for(const o of G.obstacles){
    if(!o.heatCycle || !o.heatSet || o.fclKeep || o.fclLine) continue;
    o.fclSetT = (o.fclSetT || 0) + dt;
    if(o.fclSetT >= SET_HOLDS){ o.heatSet = false; o.fclSetT = 0; }
  }
  for(const o of G.obstacles) if(o.heatCycle && !o.heatSet) o.fclSetT = 0;
}

/* ── The Shaft: lava rises behind you once you are in the chimney; the valve drains it ──────── */
function shaft(A, p, dt){
  const L = A.lava, inShaft = p.x > SHAFT.x0 - 20 && p.x < SHAFT.x1 + 20 && p.y > 20 && !p.dead;
  const lava = G.obstacles.find(o => o.actId === 'shaft-lava');
  if(A.valve){ L.y = Math.max(LAVA.from, L.y - 120 * dt); L.on = false; if(lava) lava.y = L.y; return; }
  if(inShaft && !L.on){ L.on = true; L.t = 0; }
  if(L.on){
    L.t += dt; if(L.t > LAVA.grace) L.y += LAVA.speed * dt;
    if(p.y < L.y - 10 && Math.abs(p.x - (SHAFT.x0 + SHAFT.x1) / 2) < 140 && !p.dead){ try{ hurtPlayer(0, 1, false); }catch(_e){} L.on = false; L.y = LAVA.from; }
    if(p.x < SHAFT.x0 - 200 || p.dead){ L.on = false; L.y = LAVA.from; }
  }
  if(lava) lava.y = L.y;
  // The valve: a downward strike on it.
  if(!A.valve && !p.dead && p.slamming && Math.abs(p.x - SHAFT.valve.x) < 34 && Math.abs(p.y - SHAFT.gantry.y) < 30){
    A.valve = true; kit.latch(ZONE, 'fcl-valve'); setBars('valve', true); A.flash = .4; G.shake = Math.max(G.shake || 0, 10);
    kit.burst(SHAFT.valve.x, SHAFT.gantry.y + 20, '#ffd27a', 18);
    try{ if(meta.soundOn) SFX.magic(); }catch(_e){}
  }
}
function spouts(A, p, dt){
  for(const o of G.obstacles){
    if(o.type !== 'actSpout') continue;
    const t = (((G.time + o.phase) % o.period) + o.period) % o.period, f = t / o.period;
    o.pouring = f < o.molten; o.warn = !o.pouring && f > .8;
    o.hitCd = Math.max(0, (o.hitCd || 0) - dt);
    if(!o.pouring || p.dead || p.invuln > 0 || o.hitCd > 0) continue;
    if(Math.abs(p.x - o.x) < 24 && p.y < o.y){ o.hitCd = .7; harm(p, Math.sign(p.x - o.x) || 1, 18); }
  }
}

/* ── THE WARM MACHINE ─────────────────────────────────────────────────────── */
function nearestBay(p){ let best = null, d = 1e9; for(const o of G.obstacles){ if(o.fclBay == null) continue; const k = Math.abs(o.x - p.x); if(k < d){ d = k; best = o; } } return best; }
function mark(A, e, why){
  A.marks++; A.flash = .5; G.shake = Math.max(G.shake || 0, 10); kit.burst(e.x, e.y + 100, '#ffd27a', 22);
  e.st = 'stagger'; e.t = 0;
  try{ if(meta.soundOn) SFX.hit(); }catch(_e){}
  if(A.marks >= W.phases[A.phase].marks){
    A.marks = 0; A.aoes = [];
    for(const pr of G.projectiles) if(pr.fclSlug) pr.life = 0;
    if(A.phase < W.phases.length - 1){ kit.latch(ZONE, 'fcl-machine-' + (A.phase + 1)); A.phase++; if(A.phase === 2) gantry(true); }
    else {
      e.st = 'down'; A.machined = true; A.fight = false; kit.latch(ZONE, 'fcl-machine'); F.clear(STAGE);
      setBars('arena-east', true); setBars('arena-west', true);
      for(const pr of G.projectiles) if(pr.fclSlug) pr.life = 0;
      A.queue.push({ src:e, accent:'#ffb454', html:'<b>THE WARM MACHINE</b><br>It kneels over its own bed. The heat goes out of it the way it goes out of a hearth, slowly, and then all at once.' });
    }
  }
}
function slug(A, e, p){
  const sx = e.x - 50, sy = e.y + 110, dx = p.x - sx, dy = (p.y + 22) - sy, d = Math.hypot(dx, dy) || 1;
  G.projectiles.push({ owner:'enemy', puzzleOnly:1, fclSlug:1, sourceType:'machine', x:sx, y:sy, vx:dx / d * W.slug.speed, vy:dy / d * W.slug.speed,
    gravity:0, size:10, color:'#ffb04a', shape:'orb', glow:1, dmg:W.slug.dmg, kb:220, pierce:0, el:'fire', life:4, hitSet:[], portalHops:0 });
}
function slugs(A, e){
  for(const pr of G.projectiles){
    if(!pr.fclSlug || pr.life <= 0) continue;
    if(pr.x < ARENA.x1 - 20 || pr.x > ARENA.x2 + 20){ pr.life = 0; continue; }
    if(pr.owner !== 'player' || e.st === 'down') continue;
    if(!pr.fclBack){ pr.fclBack = 1; pr.life = 4; }   // countered: a fresh life for the way home (it had ~1.6 s left of 4)
    if(Math.abs(pr.x - e.x) < e.w / 2 + pr.size && pr.y > e.y + COLOSSUS.core.y0 && pr.y < e.y + COLOSSUS.core.y1){
      pr.life = 0;
      if(A.phase === 1 && e.st !== 'stagger') mark(A, e, 'counter'); else kit.burst(pr.x, pr.y, '#c9a080', 8);
    }
  }
}
function updateMachine(A, e, p, dt){
  if(p.dead || e.dead) return;
  e.t += dt; e.hp = 9999; e.vx = 0; e.x = COLOSSUS.x; e.y = 0;
  e.burnT = e.poisonT = e.bleedT = e.freezeT = e.floatT = e.counterStunT = 0;
  slugs(A, e);
  // Struck from above: a downward strike begun at least `from` over its head, passing down through it.
  if(p.slamming){ if(p.fclSlamFrom == null) p.fclSlamFrom = p.y; } else p.fclSlamFrom = null;
  if(A.phase === 2 && e.st !== 'stagger' && e.st !== 'down' && p.slamming && Math.abs(p.x - e.x) < e.w / 2 + 8 &&
     p.y < e.y + e.h + 12 && p.y > e.y + e.h - 60 && (p.fclSlamFrom - (e.y + e.h)) >= W.slam.from){
    // Thrown back up onto the deck (p.vy < 0 is up; jumpCutOk off, or releasing jump cuts the throw to a hop).
    // Nearly straight up: thrown west at once, the deck's underside stops it.
    p.slamming = false; p.vy = -900; p.vx = -60; p.jumpCutOk = false; p.fclSlamFrom = null; mark(A, e, 'from above');
  }
  switch(e.st){
    case 'wait':
      if(p.x > ARENA.x1 + 80 && p.x < ARENA.x2 && !p.dead){
        e.st = 'idle'; e.t = 0; e.cool = 1.2; A.fight = true; setBars('arena-west', false);
        if(!A.introduced){ A.introduced = true; kit.latch(ZONE, 'fcl-met');
          A.queue.push({ src:e, accent:'#ffb454', html:'<b>THE WARM MACHINE</b><br>The Colossus stands where it fell, and its ladle arm still knows the bed. It turns the arm toward the bay nearest you.' }); }
      }
      break;
    case 'idle': {
      e.cool -= dt;
      if(e.cool > 0 || p.dead) break;
      if(A.phase === 0){ e.bay = nearestBay(p); e.st = 'gather'; e.t = 0; }
      else if(A.phase === 1){ slug(A, e, p); e.twinLeft = (A.volley = (A.volley || 0) + 1) % 2 === 0 ? 1 : 0; e.st = e.twinLeft ? 'twin' : 'idle'; e.t = 0; e.cool = W.slug.every; }
      else { e.st = 'sweep-tell'; e.t = 0; }
      break;
    }
    case 'gather':                                   // its arm over the bay; the metal gathering
      if(e.t >= W.pour.gather){ e.st = 'pour'; e.t = 0;
        const b = e.bay;
        if(b && b.heatSet){ b.heatSet = false; b.fclSetT = 0; kit.burst(b.x, 20, '#ffd27a', 20); mark(A, e, 'refused'); }
        else if(b){ A.aoes.push({ x:b.x, r:W.pour.reach, t:.4 }); if(!p.dead && Math.abs(p.x - b.x) < W.pour.reach && p.y < 60) harm(p, Math.sign(p.x - b.x) || 1, W.pour.dmg); }
      }
      break;
    case 'pour': if(e.t >= W.pour.pour){ e.st = 'idle'; e.t = 0; e.cool = W.pour.cool; } break;
    case 'twin': if(e.t >= W.slug.twin){ slug(A, e, p); e.st = 'idle'; e.t = 0; } break;
    case 'sweep-tell': if(e.t >= W.sweep.tell){ e.st = 'sweep'; e.t = 0; e.sweepX = GANTRY.deck.x + GANTRY.deck.w / 2; } break;   // along the deck only: off its end is the way down onto its head
    case 'sweep':                                    // its arm along the gantry, east to west
      e.sweepX -= W.sweep.speed * dt;
      if(!p.dead && p.x < GANTRY.deck.x + GANTRY.deck.w / 2 + 10 && p.y >= W.sweep.y0 - 45 && p.y < W.sweep.y1 && Math.abs(p.x - e.sweepX) < 26) harm(p, -1, W.sweep.dmg);
      if(e.sweepX < ARENA.x1){ e.st = 'idle'; e.t = 0; e.cool = W.sweep.every - W.sweep.tell; if(Math.random() < .5) slug(A, e, p); }
      break;
    case 'stagger': if(e.t >= W.stagger){ e.st = 'idle'; e.t = 0; e.cool = 1.0; } break;
    case 'down': break;
  }
}
function resetMachine(A){
  const e = A.machine; if(!e) return;
  A.fight = false; A.marks = 0; A.volley = 0; A.aoes = []; A.sweeps = []; A.queue = [];
  Object.assign(e,{st:'wait',t:0,cool:1.5,twinLeft:0,bay:null,sweepX:null});
  G.p.fclSlamFrom = null;
  for(const pr of G.projectiles) if(pr.fclSlug) pr.life = 0;
  setBars('arena-west', true);
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  for(const a of A.aoes) a.t -= dt; A.aoes = A.aoes.filter(a => a.t > 0);
  warmth(dt);
  spouts(A, p, dt);
  shaft(A, p, dt);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  anvil(A, p);
  // A fall into a molten bay rewinds you outside the gate: the fight starts again when you walk back in.
  if(A.fight && (p.dead || p.x < ARENA.x1 - 20)) resetMachine(A);
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && A.machined && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('THE FRACTURED COLOSSUS · BEHIND YOU', 'THE FRACTURED INVERSION', 'Act Three · the next echo',
      'Behind you the machine kneels over its bed, cooling at last. Ahead the Inversion is the right way up, which is the wrong way for it.', false); }
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'machine') return updateMachine(A, e, p, dt);
}
function lateUpdate(){}
function interact(){ return false; }
function swing(){}
function voidFloor(){ return -140; }
/* The shaft looks up; the gantry fight looks up a little. */
function cameraFloor(p){
  if(!p) return null;
  if(p.x > SHAFT.x0 - 100 && p.x < SHAFT.bars + 100 && p.y > 150) return Math.max(0, p.y - 240);
  return p.x > ARENA.x1 && p.x < ARENA.x2 && p.y > 200 ? 120 : 0;
}
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 400) return { connector:'fe-fcl', zone:ZONE, targetStage:30, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.machined ? F.seamOn(STAGE, ZONE, 'fcl-fi', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fcl-fi' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.fight ? CUES.machine : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedColossus = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, constants:Object.freeze({ LEN, SPAWN, BAYS, GROUND, ANVIL, ANVIL_HEAT, LINE, SHAFT, SHAFT_LEDGES, LAVA, ARENA, BED_HEAT,
    SET_HOLDS, COLOSSUS, GANTRY, W, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
