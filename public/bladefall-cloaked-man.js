/* Bladefall — BATTLE 42 · THE CLOAKED MAN (stage 43, 2026-09-26). The last fight in the game.

   A four-phase boss designed by the owner's little brother. His attacks, as he wrote them, are the core of the
   first two phases; the rest is built out from his descriptions of each form:
     I · THE CLOAKED MAN (on the ground, purple-cloaked, chained, gloved, no eyes, a faded mouth)
       — the dash-slash: he crouches, then crosses the floor very fast and slashes at the end;
       — the phantom slash: if the slash begins while he is very far away, he vanishes and comes out BEHIND you
         to finish it (his ghost shows where, a beat before);
       — the bat: a black bat with white-crested wings, hunting you for up to five seconds. If it reaches you it
         carries you back and hovers over him, and he slashes you three times. Strike it first (one blow), or
         press Jump / Attack while it has you to struggle free.
     II · UNBOUND (aloft; the sleeves blown apart, a shinier cloak, skeleton hands)
       — the swarm: he rises and raises his hands, and curtains of bats come down with one gap in each;
       — the gale dive: he folds his sleeves and dives at where you stood; the landing sends a shockwave along the
         floor both ways (jump it), and leaves him dazed on the ground — the time to hurt him;
       — the shackle ring (below half): the broken shackles that orbit him fly outward.
     III · THE BONES (a spider-like skeleton about five times your height; a massive skull, blank eyes)
       — the lunge: it wrings its legs round its own body, then throws itself across the arena hands first, and
         is stuck in the floor a moment after;
       — the long jaw: it rears, the jaw drops open all the way to the floor, it breathes in (pulling you toward
         it), and snaps shut — two measures if you are in the mouth;
       — the fingers: its long, skinny fingers stab down where you stand, three times.
     IV · ALL OF HIM (too big for the arena: the skull rises behind it, the hands hold its edges)
       — the gaze: the blank eyes flare and a beam comes down where you stand; afterwards they stay open, and the
         eyes are what you strike (from the two slabs, or a double jump);
       — the drag: a hand lifts and drags across the whole floor (jump the fingers, or be on a slab), then rests on
         the far side — its knuckles can be struck — and drags back, slower;
       — the maw: teeth come up through the middle of the floor; the slabs and the walls are safe;
       — (below half) the storm: bats pour from the eye sockets, like the swarm.

   A death keeps the phases you have finished (you come back at the vestibule and walk in again). Each phase
   change gives one Blood measure back. The kit is the whole journey's, less the Gravity Flip (the arena has no
   ceiling to fall to). Level Select only: the last row of the Base tab, labelled 42. */
(function installCloakedMan(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 43, ZONE = 'cloaked-man', LABEL = '42';
const LEN = 5000;
const SPAWN = { x:150, y:0 };
const ARENA = { x1:2800, x2:4600, mid:3700 };
const SLABS = [ { x:3450, w:170, y:150 }, { x:3950, w:170, y:150 } ];
const RINGS = [ { x:3250, y:380 }, { x:4150, y:380 } ];
const CHECKPOINTS = [ { id:'approach', x:1300 }, { id:'vestibule', x:2560 } ];
const KIT = ['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement',
  'companion-command', 'downward-strike', 'chain-hook'];
const BIG = 1e6;

/* Each phase's share of the bar. An Oathblade swing lands for about 21, so these are ~22 / 18 / 26 / 24 blows —
   more for a counter riposte, a slam or a crit. */
const POOLS = [460, 380, 540, 500];
const NAMES = ['VESPER', 'VESPER · UNBOUND', 'VESPER · THE BONES', 'VESPER · ALL OF HIM'];
const TITLES = [['I', 'VESPER'], ['II', 'UNBOUND'], ['III', 'WHAT WAS UNDER THE CLOAK'], ['IV', 'ALL OF HIM']];

/* Phase I. */
const MAN = { w:30, h:66, walk:130, keep:300, poise:3, poiseWindow:1.6,
  dash:{ tell:.5, speed:1500, max:620, slash:.26, reach:108, recover:.7 },
  phantom:{ far:430, tell:.5, vanish:.32, appear:.14, slash:.26, reach:112, recover:.8 },
  bat:{ cd:7.5, cast:.7, speed:215, steer:2.2, life:5, carry:420, gap:.55, grip:5, w:34, h:22 } };
/* Phase II. */
const AIR = { w:34, h:70, hover:170, swarmY:300, keep:320,
  dive:{ tell:.7, speed:1150, dizzy:1.6, rise:.6, wave:{ speed:520, h:34, life:1.4 } },
  swarm:{ rise:.5, tell:.6, waves:3, every:1.2, roost:.6, fall:360, step:62, gap:88, y:450 },
  ring:{ tell:.7, n:10, speed:250, life:3.2, from:.5 } };
/* Phase III. The skull is the body you strike (a 96-wide head). */
const BONES = { R:48, crouch:70, rear:150, keep:440, walk:240,
  lunge:{ tell:.95, speed:1400, max:900, stuck:1.3 },
  jaw:{ rear:.5, drop:.45, inhale:1.3, pull:150, snap:.2, close:1.0, mouth:34 },
  stab:{ raise:.35, n:3, tell:.55, down:.22, every:.45, w:26, h:260, recover:.7 } };
/* Phase IV. The giant's skull stands behind the arena's middle. */
const GIANT = { SX:ARENA.mid, SY:250, R:250, rise:4.0,
  gaze:{ tell:.9, lock:.6, beam:.4, w:76, exposed:2.3 },
  drag:{ lift:.8, speed:1300, back:700, rest:1.8, fingers:52 },
  maw:{ tell:.9, up:.7, n:5, w:80, h:120, span:430 },
  storm:{ from:.5, waves:2 } };

const CUES = Object.freeze({
  approach:Object.freeze({ id:'cloaked-approach', src:'./audio/music/fractured-the-last-spark-of-darrow.mp3', title:'The Last Spark of Darrow (fractured)', artist:'Aerth score', mood:'the last road' }),
  p0:Object.freeze({ id:'cloaked-man-i', src:'./audio/music/iron-oath-of-the-night-attack.mp3', title:'Iron Oath of the Night Attack', artist:'Aerth score', mood:'a duel with the cloaked man' }),
  p1:Object.freeze({ id:'cloaked-man-ii', src:'./audio/music/through-the-void-breach.mp3', title:'Through the Void Breach', artist:'Aerth score', mood:'he rises; the bats come down' }),
  p2:Object.freeze({ id:'cloaked-man-iii', src:'./audio/music/fractured-the-black-procession.mp3', title:'The Black Procession (fractured)', artist:'Aerth score', mood:'what was under the cloak' }),
  p3:Object.freeze({ id:'cloaked-man-iv', src:'./audio/music/the-breaking-of-the-keeps.mp3', title:'The Breaking of the Keeps', artist:'Aerth score', mood:'all of him' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function bars(x, id, gone){ return { type:'wall', x, y:900, h:900, w:30, noCling:1, actArt:'cmBars', actBars:id, gone:!!gone }; }
function buildLevel(){
  const objects = [];
  // The road in: a pit to cross, a low wall to climb by the ledges, then the vestibule.
  objects.push(Object.assign(GrAt(0, 900, 0), { actArt:'cmStone' }));
  objects.push(Object.assign(GrAt(1030, LEN, 0), { actArt:'cmStone' }));              // 130 of pit: a running double jump, or a dash
  // Each step a single jump (apex ~78) with the double jump to spare: 60, 130, then the wall's top at 200.
  objects.push(Object.assign(Pl(1640, 150, 60), { actArt:'cmLedge' }), Object.assign(Pl(1860, 150, 130), { actArt:'cmLedge' }));
  objects.push(Object.assign(Wl(2010, 200, 200, 60), { actArt:'cmWall', noCling:1 }));
  objects.push({ type:'actFire', x:2470, y:0, w:40, h:20, restSiteAnchor:'cloaked-ash' });
  // The arena.
  SLABS.forEach(s => objects.push(Object.assign(Pl(s.x, s.w, s.y), { actArt:'cmSlab' })));
  RINGS.forEach(r => objects.push({ type:'actRing', x:r.x, y:r.y, w:30, h:30 }));
  objects.push(bars(ARENA.x1, 'west', true), bars(ARENA.x2, 'east'));
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[], enemies:[],
  };
}

/* ── State ─────────────────────────────────────────────────────────────────── */
function sumFrom(i){ let s = 0; for(let k = i; k < POOLS.length; k++) s += POOLS[k]; return s; }
function floorOf(phase){ return sumFrom(phase + 1); }
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  const phase = G.vesperEncounter ? 0 : done(c, 'cm-p3') ? 3 : done(c, 'cm-p2') ? 2 : done(c, 'cm-p1') ? 1 : 0;
  G.actTwo = { stage:STAGE, t:0, spawned:false, echoSource:13, flash:0, checkpoints:{},
    phase, hp:sumFrom(phase), fight:false, over:false, won:false, trans:null, endT:0,
    bar:{ label:NAMES[phase], hp:sumFrom(phase), maxHp:sumFrom(0), x:ARENA.mid, y:0, w:40, h:60, active:true, dead:false, boss:true },
    man:null, bat:null, grab:null, batCd:2.5, poise:[],
    swarm:[], waves:[], shards:[], shock:[], stabs:[], spikes:[], beams:[], fx:[], pending:[],
    spider:null, giant:null, eyes:[], hand:null, banner:null, order:0, cool:1.2, hitT:0 };
  F.setKit(KIT);
  try{ restoreBlood(G.p, Infinity); }catch(_e){}                          // Level Select's late-journey profile starts at half
  setBars('west', true); setBars('east', false);
}
function setBars(id, open){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === open) return; b.gone = open; b.moveT = 0.5;
}

/* ── Bodies the blade can land on ────────────────────────────────────────── */
function body(kind, x, y, w, h){
  const e = spawnEnemy('grunt', x);
  Object.assign(e, { actFoe:kind, kind:'fly', x, y, baseY:y, w, h, vx:0, vy:0, face:-1, active:true, noDrop:true, boss:false, xp:0,
    maxHp:BIG, hp:BIG, hpWas:BIG, noticeRange:1, st:'wait', t:0, portalGate:null, color:'#8a63c7' });
  return e;
}
function drop(e){ if(!e) return; e.dead = true; e.cmGone = true; const i = G.enemies.indexOf(e); if(i >= 0) G.enemies.splice(i, 1); }
/* What the blade did since last frame; the body itself never dies. */
function taken(e){
  let dealt = 0;
  if(e.dead && !e.cmGone){ dealt = BIG; e.dead = false; }            // Test Mode's one-blow kill: a phase, not the fight
  else if(e.hp < e.hpWas) dealt = e.hpWas - e.hp;
  e.hp = e.hpWas = BIG;
  e.burnT = e.poisonT = e.bleedT = e.freezeT = e.floatT = 0; e.vx = 0; e.vy = 0;
  return dealt;
}
function wound(A, dealt, e){
  if(dealt <= 0 || A.trans || !A.fight) return;
  if(G.vesperEncounter&&!meta.testMode){A.hitT=.12;return;} // the first confrontation cannot lose its first phase
  if(!G.vesperEncounter)dealt*=root.BladefallExploreFinale?.vesperWard?.()??.01;
  const floor = floorOf(A.phase);
  A.hp = Math.max(floor, A.hp - dealt); A.hitT = .12; if(e) e.hitT = .14;
  A.poise.push(A.t); A.poise = A.poise.filter(t => A.t - t < 2.2);
  if(A.hp <= floor) endPhase(A);
}

/* ── Hurting the knight ──────────────────────────────────────────────────── */
function over(p, x0, x1, y0, y1){ return p.x + p.w / 2 > Math.min(x0, x1) && p.x - p.w / 2 < Math.max(x0, x1) && p.y + p.h > y0 && p.y < y1; }
function open(p){ return !p.dead && !(p.invuln > 0) && !(p.dodgeTimer > 0); }
/* A blow that lands (one Blood measure, or `measures`). A melee blow met with a counter is turned instead. */
function strike(A, p, dir, opts){
  opts = opts || {};
  if(!open(p)) return false;
  if(opts.parry && typeof tryPlayerCounter === 'function' && tryPlayerCounter('melee', dir || 1, opts.parry)){ stagger(A, opts.parry, 1.1); return false; }
  try{ hurtPlayer(20, dir || 0, true, G.vesperEncounter?3:!root.BladefallExploreFinale?.vesperMerged?.()?Math.max(3,opts.measures||1):opts.measures > 1 ? opts.measures : undefined); }catch(_e){}
  return true;
}
function stagger(A, e, secs){
  if(e === A.man){ e.st = 'stagger'; e.t = 0; e.stagger = secs; }
  else if(A.spider && e === A.spider.head){ A.spider.st = 'stuck'; A.spider.t = 0; A.spider.stuckFor = secs; }
  fx(A, 'spark', e.x, e.y + (e.h || 40) / 2, '#f1d6ff');
}
function fx(A, kind, x, y, col, extra){ A.fx.push(Object.assign({ kind, x, y, col, t:0 }, extra || {})); }
function burst(x, y, col, n){ try{ kit.burst(x, y, col, n); }catch(_e){} }
function sfx(name){ try{ if(meta.soundOn && SFX[name]) SFX[name](); }catch(_e){} }
function clampX(x, pad){ return Math.max(ARENA.x1 + (pad || 60), Math.min(ARENA.x2 - (pad || 60), x)); }
function towards(e, p){ return Math.sign(p.x - e.x) || e.face || -1; }

/* ── The fight's shape ───────────────────────────────────────────────────── */
function begin(A, p){
  A.fight = true; A.encounterT=0; setBars('west', false);
  try{ restoreBlood(p, Infinity); }catch(_e){}
  G.boss = A.bar; A.bar.dead = false; A.bar.active = true;
  standPhase(A, true);
}
function standPhase(A, entering){
  A.bar.label = NAMES[A.phase]; A.cool = entering ? 1.0 : 1.4; A.order = 0; A.poise = [];
  A.banner = { n:TITLES[A.phase][0], text:TITLES[A.phase][1], t:0 };
  if(A.phase <= 1){
    if(!A.man) later(A, { op:'man', x:ARENA.x2 - 420, st:'intro' });
    else { A.man.st = A.phase === 1 ? 'drift' : 'intro'; A.man.t = 0; }
  }
  if(A.phase === 2 && !A.spider) later(A, { op:'spider' });
  if(A.phase === 3 && !A.giant){ A.giant = giantState(entering); later(A, { op:'giant' }); }
}
/* Bodies are made and unmade between frames, never inside the enemy loop that is calling us. The queue holds plain
   orders, not closures, so the fight's state stays serialisable for TAS snapshots and checkpoint flags. */
function later(A, op){ A.pending.push(op); }
function carry(A, op){
  switch(op.op){
    case 'man': if(!A.man){ A.man = body('cmMan', op.x, 0, MAN.w, MAN.h); A.man.face = -1; A.man.st = op.st; A.man.t = 0; } break;
    case 'spider': if(!A.spider) makeSpider(A, ARENA.x2 - 360, BONES.crouch, 'intro', 0, -1); break;
    case 'bones': { const x = A.man ? A.man.x : ARENA.mid; if(A.man){ drop(A.man); A.man = null; }
      if(!A.spider) makeSpider(A, clampX(x, 180), 10, 'assemble', 1, Math.sign(G.p.x - x) || -1); break; }
    case 'unspider': if(A.spider){ drop(A.spider.head); A.spider = null; } break;
    case 'giant': if(!A.eyes.length) giantBodies(A); break;
    case 'bat': if(A.man && !A.bat) spawnBat(A, A.man); break;
    case 'unbat': if(A.bat){ drop(A.bat); A.bat = null; } break;
  }
}
function makeSpider(A, x, sy, st, coil, face){
  const head = body('cmSkull', x, sy - BONES.R, BONES.R * 2, BONES.R * 2);
  A.spider = { head, x, face, sy, coil, jaw:0, st, t:0, stride:0, lean:0 };
}
function giantState(entering){
  return { rise:entering ? 1 : 0, st:entering ? 'idle' : 'rise', t:0, eyes:0, exposed:0, flare:0, crack:0,
    hands:[ { side:-1, x:ARENA.x1 + 70, home:ARENA.x1 + 70, st:'grip', t:0, lift:0 }, { side:1, x:ARENA.x2 - 70, home:ARENA.x2 - 70, st:'grip', t:0, lift:0 } ] };
}
function giantBodies(A){
  A.eyes = [-1, 1].map(s => { const e = body('cmEye', GIANT.SX + s * GIANT.R * .38, GIANT.SY - GIANT.R * .2 - 35, 104, 70); e.portalGate = 'cm-closed'; e.side = s; return e; });
  A.hand = body('cmHand', -9999, -400, 130, 60); A.hand.portalGate = 'cm-closed';
}
function clearHazards(A){ A.swarm = []; A.waves = []; A.shards = []; A.shock = []; A.stabs = []; A.spikes = []; A.beams = []; if(A.bat){ drop(A.bat); A.bat = null; } release(A, false); }
function endPhase(A){
  if(G.vesperEncounter){root.BladefallExploreFinale.encounterDefeat();return;}
  clearHazards(A);
  try{ restoreBlood(G.p, 1); }catch(_e){}
  if(A.phase < 3){
    kit.latch(ZONE, 'cm-p' + (A.phase + 1));
    A.trans = { from:A.phase, t:0, dur:[2.6, 3.0, 4.6][A.phase] };
    sfx('levelup'); G.shake = Math.max(G.shake || 0, 8); A.flash = .6;
  } else {
    A.won = true; A.trans = { from:3, t:0, dur:7.5, final:true };
    A.hp = 0; A.bar.hp = 0; A.bar.dead = true; A.bar.active = false; G.boss = null;
    try{ document.getElementById('bosshpwrap').classList.remove('on'); }catch(_e){}
    sfx('enemyDie'); G.shake = Math.max(G.shake || 0, 14); A.flash = 1;
  }
}
function updateTransition(A, p, dt){
  const T = A.trans; T.t += dt;
  if(T.final){
    if(A.giant){ A.giant.crack = Math.min(1, T.t / 2); A.giant.rise = Math.max(0, 1 - Math.max(0, T.t - 2) / 3.2); }
    if(A.eyes.length || A.hand){ for(const e of A.eyes) drop(e); A.eyes = []; drop(A.hand); A.hand = null; }
    if(T.t > 1.2 && !T.cloak){ T.cloak = { x:ARENA.mid, y:560, t:0 }; }
    if(T.cloak){ T.cloak.t += dt; T.cloak.y = Math.max(0, 560 - T.cloak.t * 70); T.cloak.x = ARENA.mid + Math.sin(T.cloak.t * 1.3) * 60 * (T.cloak.y / 560); }
    if(T.t >= T.dur && !A.over){ A.over = true; finale(); }
    return;
  }
  // I → II: he rises and the chains break. II → III: the cloak falls empty and the bones stand up out of it.
  // III → IV: the spider goes down through the floor and the whole of him rises behind the arena.
  if(T.from === 0 && A.man){ A.man.y = Math.min(AIR.hover, A.man.y + dt * 110); A.man.st = 'rise'; A.man.t = T.t; if(T.t > .4 && !T.chains){ T.chains = true; burst(A.man.x, 60, '#d6deeb', 26); } }
  if(T.from === 1 && A.man){
    A.man.st = 'collapse'; A.man.t = T.t; A.man.y = Math.max(0, A.man.y - dt * 260);
    if(T.t > 1.4 && !T.bones){ T.bones = true; later(A, { op:'bones' }); }
  }
  if(T.from === 2){
    if(A.spider){ A.spider.st = 'sink'; A.spider.t = T.t; A.spider.sy = BONES.crouch - T.t * 70; }
    if(T.t > 1.5 && !A.giant){ A.giant = giantState(false); later(A, { op:'giant' }); }
    if(T.t > 1.6 && !T.under){ T.under = true; later(A, { op:'unspider' }); }
    if(T.t > 1.6 && A.giant) A.giant.rise = Math.min(1, (T.t - 1.6) / 2.8);
    G.shake = Math.max(G.shake || 0, 3);
  }
  if(T.t >= T.dur){
    A.phase = T.from + 1; A.hp = Math.min(A.hp, sumFrom(A.phase)); A.trans = null;
    if(A.phase === 3 && A.giant){ A.giant.rise = 1; A.giant.st = 'idle'; A.giant.t = 0; }
    standPhase(A, false);
  }
}

/* ═══ I · THE CLOAKED MAN ═══════════════════════════════════════════════════ */
function manChoose(A, e, p){
  const d = Math.abs(p.x - e.x);
  if(!A.bat && A.batCd <= 0 && (d > 260 || Math.random() < .35)){ e.st = 'cast'; e.t = 0; return; }
  if(d > MAN.phantom.far){ e.st = 'phantom-tell'; e.t = 0; return; }
  e.st = 'dash-tell'; e.t = 0; e.face = towards(e, p);
  e.tx = clampX(e.x + e.face * Math.min(MAN.dash.max, Math.max(120, Math.abs(p.x - e.x) + 30)), 40);
}
function slashBox(e, reach){ return [e.x - e.face * 12, e.x + e.face * reach, e.y, e.y + 96]; }
function updateMan(A, e, p, dt){
  if(A.phase !== 0) return updateAloft(A, e, p, dt);
  e.t += dt; e.y = e.hidden ? -400 : 0;                                  // vanished, he is nowhere a blade can reach
  const dealt = taken(e); if(dealt) wound(A, dealt, e);
  if(e.counterStunT > 0 && e.st !== 'stagger'){ e.counterStunT = 0; stagger(A, e, 1.1); }
  if(A.trans || !A.fight || p.dead){ if(e.st !== 'intro') e.st = A.trans ? e.st : 'stalk'; return; }
  const D = MAN.dash, PH = MAN.phantom;
  e.portalGate = null;
  // Three blows in quick succession and he steps back out of it.
  if(A.poise.length >= MAN.poise && ['stalk', 'recover'].includes(e.st)){ A.poise = []; e.st = 'hop'; e.t = 0; e.face = towards(e, p); }
  switch(e.st){
    case 'intro': e.face = towards(e, p); if(e.t > 1.1){ e.st = 'stalk'; e.t = 0; } break;
    case 'stalk': {
      e.face = towards(e, p);
      if(A.grab){ e.st = 'await'; e.t = 0; break; }
      const d = p.x - e.x, want = Math.abs(d) > MAN.keep + 40 ? 1 : Math.abs(d) < MAN.keep - 80 ? -1 : 0;
      e.walking = want !== 0; e.x = clampX(e.x + Math.sign(d) * want * MAN.walk * dt, 50);
      A.cool -= dt; if(A.cool <= 0){ A.cool = .7 + Math.random() * .6; manChoose(A, e, p); }
      break; }
    case 'hop': e.x = clampX(e.x - e.face * 560 * dt, 50); if(e.t > .32){ e.st = 'stalk'; e.t = 0; A.cool = .25; } break;
    case 'dash-tell': if(e.t >= D.tell){ e.st = 'dash'; e.t = 0; sfx('slash'); } break;
    case 'dash': {
      const step = D.speed * dt, left = e.tx - e.x;
      if(Math.abs(p.x - e.x) < 70 && Math.sign(p.x - e.x) === e.face && p.y < 110){ e.st = 'slash'; e.t = 0; e.hit = false; break; }
      if(Math.abs(left) <= step){ e.x = e.tx; e.st = 'slash'; e.t = 0; e.hit = false; }
      else e.x += Math.sign(left) * step;
      if(A.t % .03 < dt) fx(A, 'ghost', e.x, 0, null, { face:e.face, life:.25 });
      break; }
    case 'slash': case 'slash2': {
      const reach = e.st === 'slash' ? D.reach : PH.reach;
      if(!e.hit && e.t >= .05){ e.hit = true; const b = slashBox(e, reach); if(over(p, b[0], b[1], b[2], b[3])) strike(A, p, e.face, { parry:e }); }
      if(e.t >= (e.st === 'slash' ? D.slash : PH.slash)){ e.recover = e.st === 'slash' ? D.recover : PH.recover; e.st = 'recover'; e.t = 0; }
      break; }
    case 'phantom-tell': e.face = towards(e, p); if(e.t >= PH.tell){ e.st = 'vanish'; e.t = 0; e.hidden = true; burst(e.x, 40, '#3a2458', 16);
        e.mx = clampX(p.x - (p.face || 1) * 90, 50); if(Math.abs(e.mx - p.x) < 60) e.mx = clampX(p.x + (p.x < ARENA.mid ? 90 : -90), 50); } break;
    case 'vanish': if(e.t >= PH.vanish){ e.x = e.mx; e.hidden = false; e.face = towards(e, p); e.st = 'appear'; e.t = 0; burst(e.x, 40, '#8a63c7', 14); } break;
    case 'appear': e.face = towards(e, p); if(e.t >= PH.appear){ e.st = 'slash2'; e.t = 0; e.hit = false; sfx('slash'); } break;
    case 'recover': if(e.t >= (e.recover || .7)){ e.st = 'stalk'; e.t = 0; } break;
    case 'stagger': if(e.t >= (e.stagger || 1)){ e.st = 'stalk'; e.t = 0; A.cool = .5; } break;
    case 'cast':
      e.face = towards(e, p);
      if(e.t >= MAN.bat.cast){ e.st = 'recover'; e.t = 0; e.recover = .45; A.batCd = MAN.bat.cd; later(A, { op:'bat' }); }
      break;
    case 'await': e.face = towards(e, p); break;
    case 'upslash':
      if(!A.grab || A.grab.st !== 'hover'){ e.st = 'recover'; e.t = 0; e.recover = .6; break; }
      e.face = towards(e, p);
      if(e.t >= MAN.bat.gap){ e.t = 0; e.cuts = (e.cuts || 0) + 1; sfx('slash'); fx(A, 'upcut', e.x, e.y + e.h, null);
        const hit = !p.dead; if(hit){ p.invuln = 0; strike(A, p, 0); }
        if(e.cuts >= 3){ release(A, true); e.st = 'recover'; e.t = 0; e.recover = .8; } }
      break;
  }
  if(e.st === 'stalk' || e.st === 'recover') A.batCd = Math.max(0, A.batCd - dt);
  A.bar.x = e.x; A.bar.y = e.y;
}

/* The bat: black, white-crested wings. It hunts for up to five seconds; one blow ends it. */
function spawnBat(A, e){
  if(A.bat) return;
  const b = body('cmBat', e.x + e.face * 14, 96, MAN.bat.w, MAN.bat.h);
  Object.assign(b, { st:'hunt', t:0, bvx:e.face * 180, bvy:90, life:MAN.bat.life });
  A.bat = b; burst(b.x, b.y + 10, '#f4f0ff', 8);
}
function updateBat(A, b, p, dt){
  b.t += dt;
  if(taken(b) && b.st !== 'carry-grab'){ killBat(A, b); return; }
  if(b.st === 'hunt'){
    const tx = p.x, ty = p.y + 26, dx = tx - b.x, dy = ty - (b.y + b.h / 2), L = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, MAN.bat.steer * dt);
    b.bvx += (dx / L * MAN.bat.speed - b.bvx) * k; b.bvy += (dy / L * MAN.bat.speed - b.bvy) * k;
    b.x = clampX(b.x + b.bvx * dt, 20); b.y = Math.max(20, Math.min(520, b.y + b.bvy * dt + Math.sin(b.t * 14) * 18 * dt));
    b.face = Math.sign(b.bvx) || b.face;
    if(b.t >= b.life){ killBat(A, b, true); return; }
    if(!A.grab && open(p) && over(p, b.x - b.w / 2, b.x + b.w / 2, b.y, b.y + b.h)) grab(A, b, p);
  }
}
function killBat(A, b, faded){
  burst(b.x, b.y + b.h / 2, faded ? '#3a2458' : '#f4f0ff', faded ? 8 : 14);
  if(!faded) sfx('hit');
  if(A.grab && A.grab.bat === b) release(A, false, true);
  later(A, { op:'unbat' });
}
function grab(A, b, p){
  A.grab = { bat:b, st:'carry', t:0, grip:MAN.bat.grip, shake:0 };
  b.st = 'carry'; sfx('hurt'); G.shake = Math.max(G.shake || 0, 4);
  p.vx = 0; p.vy = 0; p.slamming = false; p.dodgeTimer = 0;
  if(A.man && ['stalk', 'recover', 'hop'].includes(A.man.st)){ A.man.st = 'await'; A.man.t = 0; }
}
function release(A, finished, byBlow){
  const g = A.grab; if(!g) return;
  A.grab = null;
  const p = G.p;
  if(p && !p.dead){ p.vy = finished ? 0 : -330; p.invuln = Math.max(p.invuln || 0, .6); }
  if(g.bat && !byBlow){ burst(g.bat.x, g.bat.y + 10, finished ? '#3a2458' : '#f4f0ff', 14); later(A, { op:'unbat' }); }
  if(!finished && A.man && A.man.st === 'upslash'){ A.man.st = 'stagger'; A.man.t = 0; A.man.stagger = .7; }
  if(!finished && A.man && A.man.st === 'await'){ A.man.st = 'stalk'; A.man.t = 0; }
}
function struggled(){
  try{ return ['jump', 'attack', 'dash', 'counter'].some(k => keyPressedFor(k)); }catch(_e){ return false; }
}
function updateGrab(A, p, dt){
  const g = A.grab; if(!g) return;
  if(p.dead){ release(A, false); return; }
  g.t += dt; g.shake = Math.max(0, g.shake - dt * 4);
  if(struggled()){ g.grip--; g.shake = 1; burst(p.x, p.y + 50, '#f4f0ff', 3); if(g.grip <= 0){ release(A, false); sfx('hit'); return; } }
  const b = g.bat, m = A.man;
  if(g.st === 'carry' && m){
    const tx = m.x, ty = m.y + m.h + 96, dx = tx - b.x, dy = ty - b.y, L = Math.hypot(dx, dy), step = MAN.bat.carry * dt;
    if(L <= step){ b.x = tx; b.y = ty; g.st = 'hover'; g.t = 0; if(m.st === 'await' || m.st === 'stalk' || m.st === 'recover'){ m.st = 'upslash'; m.t = 0; m.cuts = 0; } }
    else { b.x += dx / L * step; b.y += dy / L * step; b.face = Math.sign(dx) || b.face; }
  } else if(g.st === 'hover' && m){
    b.x += (m.x - b.x) * Math.min(1, dt * 6);
    if(m.st !== 'upslash' && ['await', 'stalk', 'recover'].includes(m.st)){ m.st = 'upslash'; m.t = 0; m.cuts = 0; }
  }
  if(!m){ release(A, false); }
}
function pin(A, p){
  const g = A.grab; if(!g || p.dead) return;
  p.x = g.bat.x; p.y = g.bat.y - p.h + 6; p.vx = 0; p.vy = 0; p.onGround = false; p.floorPlat = null; p.dodgeTimer = 0; p.slamming = false;
}

/* ═══ II · UNBOUND ══════════════════════════════════════════════════════════ */
const AIR_ORDER = [['dive', 'swarm', 'dive', 'dive', 'swarm'], ['dive', 'swarm', 'ring', 'dive', 'ring', 'swarm']];
function updateAloft(A, e, p, dt){
  e.t += dt;
  const dealt = taken(e); if(dealt) wound(A, dealt, e);
  if(e.counterStunT > 0){ e.counterStunT = 0; if(e.st === 'dive'){ land(A, e); } }
  if(A.trans || !A.fight || p.dead) return;
  e.portalGate = null;
  const lateHalf = A.hp - floorOf(1) < POOLS[1] * AIR.ring.from;
  switch(e.st){
    case 'drift': {
      const side = Math.sign(e.x - p.x) || 1, tx = clampX(p.x + side * AIR.keep, 80), ty = AIR.hover + Math.sin(A.t * 1.7) * 26;
      e.x += (tx - e.x) * Math.min(1, dt * 1.6); e.y += (ty - e.y) * Math.min(1, dt * 2.2); e.face = towards(e, p);
      A.cool -= dt;
      if(A.cool <= 0){
        const list = AIR_ORDER[lateHalf ? 1 : 0], next = list[A.order++ % list.length];
        e.st = next + '-tell'; e.t = 0;
        if(next === 'dive'){ e.tx = clampX(p.x, 40); e.ty = 0; }
        if(next === 'swarm'){ e.st = 'swarm-rise'; }
      }
      break; }
    case 'dive-tell': e.face = Math.sign(e.tx - e.x) || e.face; e.y += 40 * dt; if(e.t >= AIR.dive.tell){ e.st = 'dive'; e.t = 0; sfx('slash'); } break;
    case 'dive': {
      const dx = e.tx - e.x, dy = -e.y, L = Math.hypot(dx, dy), step = AIR.dive.speed * dt;
      if(L <= step){ e.x = e.tx; e.y = 0; land(A, e); break; }
      e.x += dx / L * step; e.y += dy / L * step;
      if(over(p, e.x - e.w / 2, e.x + e.w / 2, e.y, e.y + e.h)) strike(A, p, Math.sign(dx) || e.face, { parry:e });
      if(A.t % .03 < dt) fx(A, 'ghost', e.x, e.y, null, { face:e.face, life:.25, air:true });
      break; }
    case 'dizzy': e.y = 0; if(e.t >= AIR.dive.dizzy || A.poise.length >= 5){ A.poise = []; e.st = 'rise'; e.t = 0; } break;
    case 'rise': e.y = Math.min(AIR.hover, e.y + dt * AIR.hover / AIR.dive.rise); if(e.t >= AIR.dive.rise){ e.st = 'drift'; e.t = 0; A.cool = 1.0 + Math.random() * .5; } break;
    case 'swarm-rise': e.y += (AIR.swarmY - e.y) * Math.min(1, dt * 4); if(e.t >= AIR.swarm.rise){ e.st = 'swarm-tell'; e.t = 0; } break;
    case 'swarm-tell': if(e.t >= AIR.swarm.tell){ e.st = 'swarm'; e.t = 0; A.gapX = null; queueSwarm(A, p, AIR.swarm.waves, e); } break;
    case 'swarm': if(e.t >= AIR.swarm.waves * AIR.swarm.every + .6){ e.st = 'drift'; e.t = 0; A.cool = 1.1; } break;
    case 'ring-tell': if(e.t >= AIR.ring.tell){ e.st = 'drift'; e.t = 0; A.cool = 1.3; throwRing(A, e); } break;
    default: e.st = 'drift';
  }
  e.x = clampX(e.x, 40);
  A.bar.x = e.x; A.bar.y = e.y;
}
function land(A, e){
  e.y = 0; e.st = 'dizzy'; e.t = 0; G.shake = Math.max(G.shake || 0, 7); sfx('hit'); burst(e.x, 10, '#c7a2ff', 18);
  for(const dir of [-1, 1]) A.shock.push({ x:e.x, dir, t:0 });
}
/* Curtains of bats with one gap each; the gap moves, but never further than a run can follow. */
function queueSwarm(A, p, waves, from){
  let gap = clampX(p.x + (Math.random() - .5) * 240, 150);
  for(let w = 0; w < waves; w++){
    if(w > 0){ const shift = (180 + Math.random() * 160) * (Math.random() < .5 ? -1 : 1); gap = clampX(gap + shift, 150); }
    A.waves.push({ at:A.t + w * AIR.swarm.every, gap, from:from ? { x:from.x, y:from.y + 50 } : null, spawned:false });
  }
}
function updateSwarm(A, p, dt){
  for(const w of A.waves) if(!w.spawned && A.t >= w.at){
    w.spawned = true;
    for(let x = ARENA.x1 + 36; x < ARENA.x2 - 20; x += AIR.swarm.step){
      if(Math.abs(x - w.gap) < AIR.swarm.gap) continue;
      A.swarm.push({ x:x + (Math.random() - .5) * 8, y:AIR.swarm.y + (Math.random() - .5) * 20, t:0, ph:Math.random() * 6.28, from:w.from });
    }
  }
  A.waves = A.waves.filter(w => !w.spawned);
  for(const b of A.swarm){
    b.t += dt;
    if(b.t > AIR.swarm.roost){ b.y -= AIR.swarm.fall * dt; b.x += Math.sin(b.t * 6 + b.ph) * 22 * dt; }
    if(!b.dead && b.t > AIR.swarm.roost && over(p, b.x - 12, b.x + 12, b.y, b.y + 14) && strike(A, p, 0)){ b.dead = true; burst(b.x, b.y, '#f4f0ff', 6); }
    if(b.y < 2 && !b.dead){ b.dead = true; burst(b.x, 4, '#3a2458', 3); }
  }
  A.swarm = A.swarm.filter(b => !b.dead);
}
function throwRing(A, e){
  for(let i = 0; i < AIR.ring.n; i++){
    const a = i / AIR.ring.n * Math.PI * 2 + A.t;
    A.shards.push({ x:e.x + Math.cos(a) * 30, y:e.y + 35 + Math.sin(a) * 30, vx:Math.cos(a) * AIR.ring.speed, vy:Math.sin(a) * AIR.ring.speed, t:0 });
  }
  sfx('slash'); burst(e.x, e.y + 35, '#d6deeb', 12);
}
function updateShards(A, p, dt){
  for(const s of A.shards){
    s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt;
    if(s.y < 4){ s.y = 4; s.vy = Math.abs(s.vy) * .5; }
    if(!s.dead && over(p, s.x - 8, s.x + 8, s.y - 8, s.y + 8) && strike(A, p, Math.sign(s.vx))) s.dead = true;
    if(s.t > AIR.ring.life || s.x < ARENA.x1 || s.x > ARENA.x2) s.dead = true;
  }
  A.shards = A.shards.filter(s => !s.dead);
}
function updateShock(A, p, dt){
  const W = AIR.dive.wave;
  for(const s of A.shock){
    s.t += dt; s.x += s.dir * W.speed * dt;
    if(!s.hit && over(p, s.x - 14, s.x + 14, 0, W.h) && strike(A, p, s.dir)) s.hit = true;
  }
  A.shock = A.shock.filter(s => s.t < W.life && s.x > ARENA.x1 && s.x < ARENA.x2);
}

/* ═══ III · THE BONES ═══════════════════════════════════════════════════════ */
const BONE_ORDER = ['lunge', 'stab', 'jaw', 'lunge', 'jaw', 'stab'];
function skullAt(S){ return { x:S.x + S.face * 30, y:S.sy }; }
function updateSkull(A, e, p, dt){
  const S = A.spider; if(!S || S.head !== e) return;
  const dealt = taken(e); if(dealt) wound(A, dealt, e);
  if(e.counterStunT > 0){ e.counterStunT = 0; if(S.st === 'lunge'){ S.st = 'stuck'; S.t = 0; S.stuckFor = 1.6; } }
  S.t += dt;
  const sk = skullAt(S); e.x = sk.x; e.y = sk.y - BONES.R; e.w = BONES.R * 2; e.h = BONES.R * 2; e.face = S.face;
  A.bar.x = sk.x; A.bar.y = 0;
  if(A.trans || !A.fight || p.dead){ if(S.st === 'assemble'){ S.sy = Math.min(BONES.crouch, S.sy + dt * 60); S.coil = Math.max(0, S.coil - dt); } return; }
  const J = BONES.jaw, L = BONES.lunge, ST = BONES.stab;
  const settle = (to, k) => { S.sy += (to - S.sy) * Math.min(1, dt * (k || 5)); };
  switch(S.st){
    case 'assemble': case 'intro': settle(BONES.crouch); S.coil = Math.max(0, S.coil - dt); if(S.t > 1.4){ S.st = 'skitter'; S.t = 0; A.cool = .8; } break;
    case 'skitter': {
      settle(BONES.crouch); S.coil = Math.max(0, S.coil - dt * 2); S.jaw = Math.max(0, S.jaw - dt * 2);
      S.face = towards({ x:skullAt(S).x, face:S.face }, p);
      const d = p.x - S.x, want = Math.abs(d) > BONES.keep + 60 ? 1 : Math.abs(d) < BONES.keep - 120 ? -1 : 0;
      const mv = Math.sign(d) * want * BONES.walk * dt; S.x = clampX(S.x + mv, 180); S.stride += Math.abs(mv);
      if(A.poise.length >= 5){ A.poise = []; S.x = clampX(S.x - S.face * 60, 180); A.cool = Math.min(A.cool, .3); }
      A.cool -= dt;
      if(A.cool <= 0){
        const next = BONE_ORDER[A.order++ % BONE_ORDER.length];
        S.st = next === 'lunge' ? 'lunge-tell' : next === 'jaw' ? 'rear' : 'stab-raise'; S.t = 0;
        if(next === 'lunge'){ S.tx = clampX(p.x + S.face * 80, 180); }
      }
      break; }
    case 'lunge-tell': settle(BONES.crouch - 14); S.coil = Math.min(1, S.t / L.tell); if(S.t >= L.tell){ S.st = 'lunge'; S.t = 0; sfx('slash'); } break;
    case 'lunge': {
      settle(60, 8); S.coil = Math.max(0, S.coil - dt * 5);
      const step = L.speed * dt, left = S.tx - S.x; S.stride += step;
      if(Math.abs(left) <= step){ S.x = S.tx; S.st = 'stuck'; S.t = 0; S.stuckFor = L.stuck; G.shake = Math.max(G.shake || 0, 8); burst(skullAt(S).x + S.face * 60, 8, '#e9dfc9', 16); }
      else S.x += Math.sign(left) * step;
      const k = skullAt(S);
      if(over(p, k.x - BONES.R, k.x + S.face * 150, 0, S.sy + BONES.R)) strike(A, p, S.face, { parry:e });
      break; }
    case 'stuck': settle(48, 6); if(S.t >= (S.stuckFor || L.stuck)){ S.st = 'skitter'; S.t = 0; A.cool = .9 + Math.random() * .5; } break;
    case 'rear': settle(BONES.rear, 6); if(S.t >= J.rear){ S.st = 'drop'; S.t = 0; sfx('hurt'); } break;
    case 'drop': {
      settle(BONES.rear, 6); S.jaw = Math.min(1, S.t / J.drop);
      const k = skullAt(S), chin = jawChin(S);
      if(!S.dropHit && over(p, k.x - J.mouth, k.x + J.mouth, chin, chin + 40)){ S.dropHit = true; strike(A, p, Math.sign(p.x - k.x) || 1); }
      if(S.t >= J.drop){ S.st = 'inhale'; S.t = 0; S.dropHit = false; }
      break; }
    case 'inhale': {
      S.jaw = 1; const k = skullAt(S);
      if(!p.dead && !A.grab && Math.abs(p.x - k.x) < 760 && !(p.dodgeTimer > 0)) p.x += Math.sign(k.x - p.x) * J.pull * dt;
      if(A.t % .05 < dt) fx(A, 'breath', p.x + (Math.random() - .5) * 400, 20 + Math.random() * 200, null, { tx:k.x, ty:S.sy - BONES.R, life:.6 });
      if(S.t >= J.inhale){ S.st = 'snap'; S.t = 0; }
      break; }
    case 'snap': {
      S.jaw = Math.max(0, 1 - S.t / J.snap); const k = skullAt(S);
      if(!S.snapHit && S.t > J.snap * .5 && over(p, k.x - J.mouth - 6, k.x + J.mouth + 6, 0, S.sy - BONES.R * .9)){ S.snapHit = true; strike(A, p, Math.sign(p.x - k.x) || 1, { measures:2 }); }
      if(S.t >= J.snap){ S.st = 'close'; S.t = 0; S.snapHit = false; G.shake = Math.max(G.shake || 0, 6); sfx('hit'); }
      break; }
    case 'close': settle(56, 5); S.jaw = 0; if(S.t >= J.close){ S.st = 'skitter'; S.t = 0; A.cool = .8; } break;
    case 'stab-raise': settle(BONES.crouch + 20); if(S.t >= ST.raise){ S.st = 'stab'; S.t = 0; S.stabs = 0; } break;
    case 'stab':
      if(S.stabs < ST.n && S.t >= S.stabs * ST.every){ A.stabs.push({ x:clampX(p.x, 40), t:0, face:S.face }); S.stabs++; }
      if(S.stabs >= ST.n && S.t >= ST.n * ST.every + ST.tell + ST.down){ S.st = 'stuck'; S.t = 0; S.stuckFor = ST.recover; }
      break;
    default: S.st = 'skitter';
  }
}
/* The chin's height (world y) for the jaw's current opening: shut, it hangs under the teeth; open, at the floor. */
function jawChin(S){ const teeth = S.sy - BONES.R * .98; return teeth - BONES.R * .44 - (teeth - BONES.R * .44 - 4) * S.jaw; }
function updateStabs(A, p, dt){
  const ST = BONES.stab;
  for(const s of A.stabs){
    s.t += dt;
    if(!s.hit && s.t >= ST.tell && s.t < ST.tell + ST.down && over(p, s.x - ST.w, s.x + ST.w, 0, ST.h) && strike(A, p, s.face)) s.hit = true;
    if(s.t >= ST.tell && !s.boom){ s.boom = true; G.shake = Math.max(G.shake || 0, 4); burst(s.x, 4, '#e9dfc9', 8); }
  }
  A.stabs = A.stabs.filter(s => s.t < ST.tell + ST.down + .5);
}

/* ═══ IV · ALL OF HIM ═══════════════════════════════════════════════════════ */
const GIANT_ORDER = [['gaze', 'drag', 'maw', 'gaze', 'drag'], ['gaze', 'storm', 'drag', 'maw', 'gaze', 'drag', 'storm']];
function eyeY(){ return GIANT.SY - GIANT.R * .2; }
function updateGiant(A, p, dt){
  const Gi = A.giant; if(!Gi) return;
  Gi.t += dt; Gi.exposed = Math.max(0, Gi.exposed - dt);
  A.bar.x = ARENA.mid; A.bar.y = 0;
  if(!(A.trans || !A.fight || p.dead)) giantAct(A, Gi, p, dt);
  // What the blade can reach, after this frame's moves: the eyes while open, a hand while it rests.
  for(const e of A.eyes){ e.portalGate = Gi.exposed > 0 ? null : 'cm-closed'; e.x = GIANT.SX + e.side * GIANT.R * .38; e.y = eyeY() - 35; }   // a blow's knockback must not walk the eye off the skull
  if(A.hand){ const h = Gi.hands.find(h => h.st === 'rest'); A.hand.portalGate = h ? null : 'cm-closed';
    if(h){ A.hand.x = h.x; A.hand.y = 0; } else { A.hand.x = -9999; A.hand.y = -400; } }
}
function giantAct(A, Gi, p, dt){
  if(Gi.st === 'rise'){ if(Gi.rise >= 1){ Gi.st = 'idle'; Gi.t = 0; } return; }
  const G4 = GIANT, lateHalf = A.hp < POOLS[3] * G4.storm.from;
  switch(Gi.st){
    case 'idle':
      A.cool -= dt;
      if(A.cool <= 0){ const list = GIANT_ORDER[lateHalf ? 1 : 0], next = list[A.order++ % list.length]; Gi.st = next; Gi.t = 0; Gi.sub = 'tell';
        if(next === 'drag'){ const h = Gi.hands[p.x < ARENA.mid ? 0 : 1]; Gi.dragHand = h; h.st = 'lift'; h.t = 0; }
        if(next === 'maw') Gi.maw = mawSpots();
        if(next === 'storm'){ A.gapX = null; queueSwarm(A, p, G4.storm.waves, { x:GIANT.SX, y:eyeY() }); } }
      break;
    case 'gaze':
      if(Gi.sub === 'tell'){ Gi.flare = Math.min(1, Gi.t / G4.gaze.tell); if(Gi.t < G4.gaze.lock) Gi.tx = clampX(p.x, 40);
        if(Gi.t >= G4.gaze.tell){ Gi.sub = 'beam'; Gi.t = 0; A.beams.push({ x:Gi.tx, t:0 }); sfx('hit'); G.shake = Math.max(G.shake || 0, 5); } }
      else if(Gi.sub === 'beam'){ if(Gi.t >= G4.gaze.beam){ Gi.sub = 'open'; Gi.t = 0; Gi.flare = 0; Gi.exposed = G4.gaze.exposed; } }
      else if(Gi.st === 'gaze' && Gi.exposed <= 0){ Gi.st = 'idle'; Gi.t = 0; A.cool = 1.0; }
      break;
    case 'drag': {
      const h = Gi.dragHand, D = G4.drag, far = h.side < 0 ? ARENA.x2 - 150 : ARENA.x1 + 150;
      h.t += dt;
      if(h.st === 'lift'){ h.lift = Math.min(1, h.t / D.lift); if(h.t >= D.lift){ h.st = 'sweep'; h.t = 0; h.hitThis = false; sfx('slash'); } }
      else if(h.st === 'sweep' || h.st === 'return'){
        const to = h.st === 'sweep' ? far : h.home, speed = h.st === 'sweep' ? D.speed : D.back, step = speed * dt;
        h.lift = Math.max(0, h.lift - dt * 4);
        if(Math.abs(to - h.x) <= step){ h.x = to; if(h.st === 'sweep'){ h.st = 'rest'; h.t = 0; G.shake = Math.max(G.shake || 0, 6); burst(h.x, 10, '#a397ae', 14); } else { h.st = 'grip'; h.t = 0; Gi.st = 'idle'; Gi.t = 0; A.cool = .9; } }
        else h.x += Math.sign(to - h.x) * step;
        if(!h.hitThis && over(p, h.x - 80, h.x + 80, 0, D.fingers) && strike(A, p, Math.sign(to - h.x) || 1)) h.hitThis = true;
      } else if(h.st === 'rest'){ if(h.t >= D.rest){ h.st = 'return'; h.t = 0; h.hitThis = false; } }
      break; }
    case 'maw': {
      const M = G4.maw;
      if(Gi.sub === 'tell' && Gi.t >= M.tell){ Gi.sub = 'up'; Gi.t = 0; G.shake = Math.max(G.shake || 0, 7); sfx('hit'); A.spikes = Gi.maw.map(x => ({ x, t:0 })); }
      else if(Gi.sub === 'up' && Gi.t >= M.up){ A.spikes = []; Gi.st = 'idle'; Gi.t = 0; A.cool = 1.0; }
      break; }
    case 'storm': if(Gi.t >= G4.storm.waves * AIR.swarm.every + 1.2){ Gi.st = 'idle'; Gi.t = 0; A.cool = .9; } break;
  }
}
function mawSpots(){ const M = GIANT.maw, out = []; for(let i = 0; i < M.n; i++) out.push(ARENA.mid - M.span + (2 * M.span) * i / (M.n - 1)); return out; }
function updateEye(A, e){ const dealt = taken(e); if(dealt) wound(A, dealt, e); }
function updateHandBody(A, e){ const dealt = taken(e); if(dealt) wound(A, dealt, e); }
function updateBeams(A, p, dt){
  for(const b of A.beams){ b.t += dt; if(!b.hit && over(p, b.x - GIANT.gaze.w / 2, b.x + GIANT.gaze.w / 2, 0, eyeY()) && strike(A, p, 0)) b.hit = true; }
  A.beams = A.beams.filter(b => b.t < GIANT.gaze.beam);
}
function updateSpikes(A, p, dt){
  const M = GIANT.maw;
  for(const s of A.spikes){ s.t += dt; if(!s.hit && over(p, s.x - M.w / 2, s.x + M.w / 2, 0, M.h * Math.min(1, s.t / .12)) && strike(A, p, 0)) s.hit = true; }
}

/* ── The end ─────────────────────────────────────────────────────────────── */
function finale(){
  if(typeof coopFinishTogether==='function'&&!coopFinishTogether('cloaked-man',finale))return;
  root.BladefallExploreFinale.ending();
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(G.coopSession&&NET.isGuest()){
    F.checkpoints(A,p,ZONE,CHECKPOINTS);
    // Predict only local hazard contact; phase changes and actor creation are host-owned.
    updateSwarm(A,p,dt);updateShards(A,p,dt);updateShock(A,p,dt);
    updateStabs(A,p,dt);updateBeams(A,p,dt);updateSpikes(A,p,dt);
    if(A.fight&&!A.won)G.boss=A.bar;
    if(A.won&&A.over)finale();
    return;
  }
  A.t += dt; A.flash = Math.max(0, A.flash - dt * 2); A.hitT = Math.max(0, A.hitT - dt);
  if(!A.spawned){ A.spawned = true; standPhase(A, true); A.banner = null; try{ restoreBlood(p, Infinity); }catch(_e){} }
  while(A.pending.length) carry(A, A.pending.shift());
  if(A.banner){ A.banner.t += dt; if(A.banner.t > 3.2) A.banner = null; }
  for(const f of A.fx) f.t += dt; A.fx = A.fx.filter(f => f.t < (f.life || .6));
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const entrant=[p,...(G.coopSession&&NET.isHost()&&NET.ghost?.stage===STAGE?[NET.ghost]:[])].find(body=>!body.dead&&body.x>ARENA.x1+90&&body.x<ARENA.x2);
  if(!A.fight&&!A.won&&entrant)begin(A,entrant);
  if(A.fight && !A.won && !p.dead && p.x < ARENA.x1 - 30) p.x = ARENA.x1 + 20;       // the bars are shut
  if(G.vesperEncounter&&A.fight&&!p.dead){
    A.encounterT+=dt;
    if(A.encounterT>14&&!meta.testMode){A.encounterT=0;p.invuln=0;p.dodgeTimer=0;hurtPlayer(999,0,true,99);if(G.coopSession)root.BladefallExploreFinale.encounterDefeat();return;}
  }
  if(A.trans) updateTransition(A, p, dt);
  if(A.fight && !A.trans){
    updateGrab(A, p, dt);
    if(A.phase === 1 || A.phase === 3) updateSwarm(A, p, dt);
    if(A.phase === 1){ updateShards(A, p, dt); updateShock(A, p, dt); }
    if(A.phase === 2) updateStabs(A, p, dt);
    if(A.phase === 3){ updateGiant(A, p, dt); updateBeams(A, p, dt); updateSpikes(A, p, dt); }
  } else if(A.giant && A.phase === 3 && !A.won) updateGiant(A, p, dt);
  A.bar.hp = Math.max(0, A.hp); A.bar.maxHp = sumFrom(0);
  if(A.fight && !A.won && G.boss !== A.bar) G.boss = A.bar;
  if(p.dead && A.grab) release(A, false);
}
function lateUpdate(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  pin(A, p);
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  e.t = e.t || 0;
  switch(e.actFoe){
    case 'cmMan': return updateMan(A, e, p, dt);
    case 'cmBat': return updateBat(A, e, p, dt);
    case 'cmSkull': return updateSkull(A, e, p, dt);
    case 'cmEye': return updateEye(A, e);
    case 'cmHand': return updateHandBody(A, e);
  }
}
function interact(){ return false; }
function swing(){}
function voidFloor(){ return -120; }
function cameraFloor(p){ if(!p) return null; return Math.max(-120, Math.min(0, p.y - 40)); }
function seamSpec(){ return null; }
// Only for a crossing INTO this arena (7.234): answering every plan put every Act One seam arrival at x 150.
function arrival(plan){ return plan && plan.targetZoneId === ZONE ? { x:SPAWN.x, y:SPAWN.y } : null; }
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  if(A.won) return CUES.p3;
  return A.fight ? CUES['p' + A.phase] : CUES.approach;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
function coopSnapshot(){
  if(!G||G.stageIndex!==STAGE||!G.actTwo)return null;
  const actors=new Set(G.enemies);
  return JSON.parse(JSON.stringify(G.actTwo,(key,value)=>actors.has(value)?{actorId:value.aiId}:key==='grab'?null:value));
}
function coopReceive(state){
  if(!state||G.stageIndex!==STAGE)return;
  const actors=new Map(G.enemies.map(e=>[e.aiId,e]));
  const restore=value=>{
    if(!value||typeof value!=='object')return value;
    if(Object.prototype.hasOwnProperty.call(value,'actorId'))return actors.get(value.actorId)||null;
    if(Array.isArray(value))return value.map(restore);
    return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,restore(v)]));
  };
  const checkpoints=G.actTwo.checkpoints;
  Object.assign(G.actTwo,restore(state));G.actTwo.checkpoints=checkpoints;
  if(G.actTwo.fight&&!G.actTwo.won)G.boss=G.actTwo.bar;
}
root.BladefallCloakedMan = Object.freeze({coopSnapshot,coopReceive,
  STAGE, ZONE, LABEL, skullAt, jawChin, eyeY,
  constants:Object.freeze({ LEN, SPAWN, ARENA, SLABS, RINGS, CHECKPOINTS, KIT, POOLS, NAMES, TITLES, MAN, AIR, BONES, GIANT }),
});
})(typeof window !== 'undefined' ? window : globalThis);
