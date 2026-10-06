/* Bladefall — ACT THREE · The Fractured Emberdeep (stage 30), 2026-09-24.

   The tenth echo: Emberdeep after the Echo walked it backwards. The Foundry is cold, and Oren is not
   here. The kit is the one Emberdeep was entered with: jump, the Oathblade, the dash, the twin mouths,
   the wall jump, the Counter, the double jump and Attunement. The Command Post is where it was, and it
   gives what it gave, Companion Command, though there is no one to command. The Muster applies.

     THE POUR SCHEDULE, backwards: nine slabs over the void, each running lava, glass, stone. In the
       original the cooling ran east with you. Here it runs west, against you: the slab ahead goes
       molten before the one you stand on, so you jump the molten one ahead as it comes. Spouts pour
       onto two of them while they are stone.
     THE SLAG STAIR: the forge wall is too tall to climb and wet. Slag falls onto the ledges below it
       and lands as a step; stand on the step and you reach the next ledge. The slag sinks again after
       four seconds.
     THE COMMAND POST: Companion Command, and no one to give an order to.
     THE PURGE (the C-side): the purge sweeps the forge floor from behind, faster than you can run, on
       a three-second beat. Only the floor burns: the slabs over the gaps are cooled just as the sweep
       reaches them and melt again after it, so they are the only refuges, and you can never wait on one.
       Go on the sweep's heels, stand on a slab while the next sweep passes under you, and go again. */
(function installFracturedEmberdeep(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 30, ZONE = 'fractured-emberdeep', SOURCE = 9;
const LEN = 10000;
const SPAWN = { x:140, y:0 };

/* ── Geometry (world units; y up; the floor is y 0; under the slabs, the void) ──────── */
const GROUND = [ [0, 1500], [4200, 6900], [7220, 7800], [8120, 8700], [9020, LEN] ];
/* The Pour Schedule. Each slab's phase is 1.0 s further along than the slab west of it: the slab ahead is always
   the first to go molten. Gaps 160 (past a running jump, 148); a molten slab is jumped with the slab beyond. */
const HEAT = { period:4.2, molten:.34, set:.62 };
const POUR = { x0:1650, step:290, n:9, w:130, lead:1.0 };
const POUR_SPOUTS = [ { slab:3, phase:2.1 }, { slab:6, phase:2.1 } ];   // pour while their slab is stone
/* The Slag Stair: ledges 210 apart (a double jump and a dash make 191); the slag lands as a 58 step. The height of a
   double jump and a dash comes from the dash, which also carries ~185 across: each ledge is ~200 across from the slag
   below it (at 50–170 the dash overshot). Each slag hangs over the far end of its ledge, so you land clear of it. */
const FORGE_WALL = { x:5000, h:620, w:60 };
const STAIR = [ [4720, 120, 210], [4540, 120, 420], [4830, 270, 630] ];   // x, w, y — the top ledge runs to the wall
const SLAG = [ { x:4500, floor:0, phase:0 }, { x:4760, floor:210, phase:2 }, { x:4505, floor:420, phase:4 } ];
const SLAG_CYCLE = { period:6, warn:.6, dwell:4.2 };
const POST = { x:5700 };
/* THE PURGE: one clock (3.0 s). Vents every 100 along the forge floor rise in a sweep that runs east at 450 — faster
   than a run (211, measured) — for 0.5 s at each vent. Only the floor burns: the slabs over the three gaps are refuges, cooled
   (solid) exactly while their sweep passes over them and molten between, so nobody waits on one. A runner who never
   stops is caught ~990 on (the course is 2750): stand on a slab as the sweep goes under you, then go. */
const PURGE = { x0:6400, x1:9150, speed:450, period:3.0, upT:.5, ventStep:100, ventW:90 };   // at 2.4 the gap between refuges was too long
const PURGE_SLABS = [ { x:7060, w:300 }, { x:7960, w:300 }, { x:8860, w:300 } ];
const PURGE_HEAT = { period:3.0, molten:.2, set:.45, lead:.6 };   // solid .6 s before its sweep, 2.4 s in all
const PURGE_SPOUT = { x:8410, period:3.0, molten:.3 };
/* A slab's phase: solid from `lead` s before its sweep reaches its west edge (its window opens at f = molten). */
function refugePhase(s){ return PURGE_HEAT.molten * PURGE_HEAT.period + PURGE_HEAT.lead - (s.x - s.w / 2) / PURGE.speed; }
/* The spout pours as its sweep reaches it, and 0.34 of the beat past: go on the sweep's heels and it has stopped. */
function spoutPhase(){ return -PURGE_SPOUT.x / PURGE.speed; }
const CHECKPOINTS = [ { id:'road', x:400 }, { id:'schedule', x:1400 }, { id:'stair', x:4300 }, { id:'post', x:5900 }, { id:'purge', x:6250 } ];
function groundAt(x){ for(const g of GROUND) if(x >= g[0] && x < g[1]) return 0; return null; }
const CUES = Object.freeze({
  purge:Object.freeze({ id:'fractured-eternal-furnace', src:'./audio/music/fractured-the-eternal-furnace.mp3', title:'The Eternal Furnace (fractured)',
    artist:'Aerth score', mood:'the Purge: the sweep behind you' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function heatSlab(x, w, y, phase, cyc){ return Object.assign(Pl(x, w, y), { h:16, actArt:'heat', heatCycle:Object.assign({ phase }, cyc) }); }
function buildLevel(){
  const objects = [];
  GROUND.forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'forge' })));
  // The Pour Schedule.
  for(let k = 0; k < POUR.n; k++) objects.push(heatSlab(POUR.x0 + k * POUR.step, POUR.w, 0, k * POUR.lead, HEAT));
  POUR_SPOUTS.forEach(s => objects.push({ type:'actSpout', x:POUR.x0 + s.slab * POUR.step, y:520, w:40, h:520, period:HEAT.period,
    phase:s.slab * POUR.lead + s.phase, molten:.34 }));
  // The Slag Stair and the forge wall.
  STAIR.forEach(s => objects.push(Object.assign(Pl(s[0], s[1], s[2]), { h:24, actArt:'ledge' })));
  objects.push(Object.assign(Wl(FORGE_WALL.x, FORGE_WALL.h, FORGE_WALL.h, FORGE_WALL.w), { noCling:1, slickL:1, slickR:1, actArt:'forgewall' }));
  SLAG.forEach(s => objects.push(Object.assign(Trap(s.x, s.floor + 360), { x0:s.x, y0:s.floor + 360, floorY:s.floor, slagReal:1, actArt:'slag',
    slagCycle:{ period:SLAG_CYCLE.period, phase:s.phase, warn:SLAG_CYCLE.warn, dwell:SLAG_CYCLE.dwell } })));
  objects.push({ type:'actPost', actId:'post', x:POST.x, y:0, w:60, h:120 });
  // The Purge.
  for(let x = PURGE.x0; x <= PURGE.x1; x += PURGE.ventStep){
    if(groundAt(x - PURGE.ventW / 2) === null || groundAt(x + PURGE.ventW / 2) === null) continue;
    // decorative to the engine (its spikes only wound): the echo's sweep takes you back to the start of the purge.
    objects.push(Object.assign(Sp(x, 0, { w:PURGE.ventW, period:PURGE.period, upT:PURGE.upT, phase:-x / PURGE.speed, dmg:16 }), { fedPurge:1, decorative:1, actArt:'vent' }));
  }
  PURGE_SLABS.forEach(s => objects.push(Object.assign(heatSlab(s.x, s.w, 0, refugePhase(s), PURGE_HEAT), { fedRefuge:1 })));
  objects.push({ type:'actSpout', x:PURGE_SPOUT.x, y:520, w:40, h:520, period:PURGE_SPOUT.period, phase:spoutPhase(), molten:PURGE_SPOUT.molten });
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:300, y:0, w:40, h:20, restSiteAnchor:'furnace-ash' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'emberling', x:900, patrol:[700, 1200], noDrop:true },
      { t:'slagwright', x:4450, patrol:[4300, 4600], noDrop:true },
      { t:'cinderling', x:6000, patrol:[5800, 6200], noDrop:true },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    command:done(c, 'fed-command'), purged:done(c, 'fed-purge'), over:false, inPurge:false };
  const A = G.actTwo;
  // Emberdeep's kit: everything through Attunement — and Companion Command, from the post, where it was.
  const ids = ['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement'];
  F.setKit(A.command ? ids.concat('companion-command') : ids);
}
function firstFrame(){ F.muster(); }

/* The spouts: a column of metal, on its own clock; gathering (it brightens) just before it lets go. */
function spouts(A, p, dt){
  for(const o of G.obstacles){
    if(o.type !== 'actSpout') continue;
    const t = (((G.time + o.phase) % o.period) + o.period) % o.period, f = t / o.period;
    o.pouring = f < o.molten; o.warn = !o.pouring && f > .78;
    o.hitCd = Math.max(0, (o.hitCd || 0) - dt);
    if(!o.pouring || p.dead || p.invuln > 0 || p.dodgeTimer > 0 || o.hitCd > 0) continue;
    if(Math.abs(p.x - o.x) < 22 && p.y < o.y){ o.hitCd = .7; try{ hurtPlayer(18, Math.sign(p.x - o.x) || 1, true, 1); }catch(_e){} }
  }
}
/* The post: walk up to it and Companion Command is yours, as it was Oren's to answer. */
function post(A, p){
  if(A.command || p.dead || Math.abs(p.x - POST.x) > 40 || p.y > 40) return;
  A.command = true; kit.latch(ZONE, 'fed-command'); F.grant('companion-command'); A.flash = .4;
  try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
  A.queue.push({ src:{ x:POST.x, y:0 }, accent:'#ffb454', html:'<b>THE COMMAND POST</b><br>You know how to give the order now: go there, hold that. The post is cold, and there is no one here to give it to.' });
}
/* The sweep: touch a risen vent and the purge has you, back to where it began (a fall's rewind, not a wound). */
function sweep(A, p){
  if(p.dead || p.y > 30) return;                     // no dashing through it: the refuges are the way
  for(const o of G.obstacles){
    if(!o.fedPurge || Math.abs(p.x - o.x) > o.w / 2 + 10) continue;
    const t = (((G.time + o.phase) % o.period) + o.period) % o.period;
    if(t < o.upT){ A.swept = (A.swept || 0) + 1; kit.burst(p.x, 20, '#ff9a4a', 16); try{ hurtPlayer(0, 1, false); }catch(_e){} return; }
  }
}
/* The purge is survived when you stand past it; the sweep keeps running for anyone who comes after. */
function purge(A, p){
  A.inPurge = p.x > PURGE.x0 - 100 && p.x < PURGE.x1 + 60 && !A.purged && !p.dead;
  if(!A.purged && p.x > PURGE.x1 + 80 && p.onGround && !p.dead){
    A.purged = true; A.inPurge = false; kit.latch(ZONE, 'fed-purge'); F.clear(STAGE); A.flash = .5;
    try{ if(meta.soundOn) SFX.magic(); }catch(_e){}
    A.queue.push({ src:{ x:p.x, y:p.y }, accent:'#ffb454', html:'<b>THE PURGE</b><br>Behind you the vents go on breathing fire along the floor, on the beat, for no one.' });
  }
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  spouts(A, p, dt);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  post(A, p);
  sweep(A, p);
  purge(A, p);
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && A.purged && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('THE FRACTURED EMBERDEEP · BEHIND YOU', 'THE FRACTURED COLOSSUS', 'Act Three · the next echo',
      'Behind you the purge sweeps an empty floor. Ahead the Foundry’s great machine is standing where it fell, and it is warm.', false); }
}
function updateFoe(){}
function lateUpdate(){}
function interact(){ return false; }
function swing(){}
function voidFloor(){ return -140; }
/* The stair looks up. */
function cameraFloor(p){
  if(!p) return null;
  return p.x > 4300 && p.x < 5100 && p.y > 150 ? Math.max(0, p.y - 220) : 0;
}
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 400) return { connector:'fs-fe', zone:ZONE, targetStage:29, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.purged ? F.seamOn(STAGE, ZONE, 'fe-fcl', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fe-fcl' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.inPurge ? CUES.purge : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedEmberdeep = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, constants:Object.freeze({ LEN, SPAWN, GROUND, HEAT, POUR, POUR_SPOUTS, FORGE_WALL, STAIR, SLAG, SLAG_CYCLE, POST,
    PURGE, PURGE_SLABS, PURGE_HEAT, PURGE_SPOUT, CHECKPOINTS }), refugePhase, spoutPhase,
});
})(typeof window !== 'undefined' ? window : globalThis);
