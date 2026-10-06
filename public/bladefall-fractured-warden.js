/* Bladefall — ACT THREE · The Fractured Warden (stage 27), 2026-09-24.

   The seventh echo: the Gaol after the Echo walked it backwards. The Gaol was walked east to west, so
   its echo runs west to east, toward the Sentence Well and not away from it. Every lamp in the Gaol
   is lit and no one is in the cells. The kit is the one the Gaol was entered with: jump, the Oathblade,
   the dash, the twin mouths and the wall jump. The Counter was the Warden's gift, so it is not here.
   The Muster applies.

     THE BLIND GALLERY: three bays under a roof too low to jump in. The only lights are the turnkeys'
       lanterns, and each turnkey carries the key to its bay's bars. Dash through its lunge and strike
       its back while it recovers.
     THE HUSH ENGINE: a climb in thin air over the void. Three bars turn in the air and none of them
       has a brake.
     THE TURNING CELL: the door is high above the cage. Set a mouth on the cage, where it rides with
       the cage, and set the other on the floor slate. Fall into the floor mouth from the perch while
       the cage is near the top of its ride and you rise out of it to the door.
     THE RED COURT: the vigil fire, cold.
     THE SENTENCE WELL (the C-side): THE SENTENCE, the Warden's echo. Its shield is always toward you.
       First it rushes: dash through the rush and strike its back while it recovers (three times).
       Then it pronounces sentence and rushes wall to wall, shielded all round, and nothing you carry
       reaches it. Only its own rush can. Set your mouths on the floor slates in its path; it runs into
       one, is thrown out of the other, and lies open where it falls (three times). */
(function installFracturedWarden(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 27, ZONE = 'fractured-warden', SOURCE = 6;
const LEN = 9600;
const SPAWN = { x:140, y:0 };

/* ── Geometry (world units; y up; the floor is y 0; below it the void) ──────── */
const GROUND = [ [0, 3640], [5360, LEN] ];
/* The Blind Gallery: a roof you cannot jump over a turnkey under (measured: under 80 a jump peaks at 40, over a
   turnkey 38 tall; under 76 it peaks at 36). */
const ROOF = 76;
const BAYS = [ { id:'bay-1', x0:700, x1:1300 }, { id:'bay-2', x0:1700, x1:2420 }, { id:'bay-3', x0:2820, x1:3540 } ];
const TURNKEY_HP = 110;                               // two back-strikes of the Oathblade (~63 each at this point)
/* The Hush Engine: thin air over the void; ledges up to the doorway in the engine's east wall. */
const LOWGS = [ { x:4050, y:330, r:560 }, { x:4800, y:520, r:600 } ];   // thin air (gravity ×.35): two circles, from the lip to the last ledge
const THIN = .35;
const ENGINE_LEDGES = [ [3880, 140, 110], [4200, 130, 250], [4520, 130, 390], [4840, 130, 530], [5160, 130, 660] ];
const ENGINE_WALL = { x:5420, door:[700, 880] };
const DECK = { x:5500, w:240, y:700 };
const ROTORS = [                                     // hub x, y, half-length, speed (rad/s), phase
  { x:4040, y:395, length:115, speed:1.25, phase:0 },  // each hub sits off its hop's arc, so only the bar's tip crosses the float:
  { x:4680, y:480, length:120, speed:-1.35, phase:1.1 },// a hub on the arc left no window at all (measured)
  { x:5000, y:810, length:115, speed:1.5, phase:2.2 },
];
/* The Turning Cell: the floor slate under the perch's east edge, the perch, the cage (floor to 420), the door at 800.
   Nothing reaches 800 but the rise out of the cage: from the perch, jump and dash tops out at 633; from the cage, 573.
   Measured: the fall from the perch enters at ~1100 (the fall-speed cap) and comes out ~470 above the cage, so the
   cage must be above ~345 when you come out of it (about 28% of its ride). Drift east too early and the lip's
   underside stops you. */
const CELL = {
  slate:{ x:6230, w:120 }, perch:{ x:6180, w:110, y:480 },
  cage:{ x:6360, w:130, y:210, dy:210, period:5.2 },
  wall:{ x:6560, door:[800, 1000] }, lip:{ x:6620, w:360, y:800 },
};
const COURT = { fire:7400 };
const WELL = { x1:8000, x2:9000 };
const WELL_SLATES = [ [8200, 100], [8500, 100], [8800, 100] ];
const S = {                                          // THE SENTENCE
  w:60, h:88, hunt:70, turn:.45,
  rush:{ tell:.55, speed:500, past:60, recover:1.1, cd:1.6, min:200 },  // to where you stood at the tell, and 60 on
  slam:{ tell:.6, r:160, recover:.6, cd:3.0, within:170 },
  sentence:{ tell:1.0, speed:560, rebound:.3, legs:3, winded:1.4 },
  crash:{ time:2.0, toss:700, gravity:1600 },
  marks:3, crashes:3, hitDmg:24, slamDmg:14,
};
const CHECKPOINTS = [ { id:'gallery', x:400 }, { id:'bay-2', x:1560 }, { id:'bay-3', x:2680 }, { id:'engine', x:3580 },
  { id:'deck', x:5480, y:700 }, { id:'cell', x:5800 }, { id:'court', x:COURT.fire }, { id:'well', x:WELL.x1 - 120 } ];   // outside the gate: a retry walks in
function groundAt(x){ for(const g of GROUND) if(x >= g[0] && x < g[1]) return 0; return null; }
const CUES = Object.freeze({
  well:Object.freeze({ id:'fractured-shield-sentence', src:'./audio/music/fractured-sentence-of-the-shield-warden.mp3', title:'Sentence of the Shield Warden (fractured)',
    artist:'Aerth score', mood:'the Sentence Well: its own rush, sent back' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function stone(x, top, bottom, w, art){ return Object.assign(Wl(x, top, top - bottom, w), { noCling:1, slickL:1, slickR:1, actArt:art || 'gaolwall' }); }
function buildLevel(){
  const objects = [];
  GROUND.forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'gaol' })));
  // The Blind Gallery: roofed bays; each shut by bars under stone, the bars lifted by the bay's turnkey falling.
  for(const b of BAYS){
    objects.push(Object.assign(Pl((b.x0 + b.x1) / 2, b.x1 - b.x0, ROOF + 16), { h:16, ceilingOnly:1, actArt:'roof' }));
    // The bars exactly as wide as the stone over them: narrower bars let a knight pressed against them stand inside the
    // stone's width, and rise through it (found in the Frostfell Toll, 7.209).
    objects.push({ type:'wall', x:b.x1, y:ROOF, h:ROOF + 4, w:44, noCling:1, actArt:'bars', actBars:b.id, gone:false });
    objects.push(stone(b.x1, 1700, ROOF, 44));
  }
  // The Hush Engine.
  LOWGS.forEach(f => objects.push({ type:'lowg', x:f.x, y:f.y, r:f.r, gravityScale:THIN, actArt:'thin' }));
  ENGINE_LEDGES.forEach(l => objects.push(Object.assign(Pl(l[0], l[1], l[2]), { h:18, actArt:'brace' })));
  ROTORS.forEach(r => objects.push({ type:'rotor', x:r.x, y:r.y, length:r.length, speed:r.speed, phase:r.phase, thickness:8, hazard:1, dmg:1, actArt:'bar' }));
  objects.push(stone(ENGINE_WALL.x, ENGINE_WALL.door[0], -140, 40));
  objects.push(stone(ENGINE_WALL.x, 1700, ENGINE_WALL.door[1], 40));
  objects.push(Object.assign(Pl(DECK.x, DECK.w, DECK.y), { h:22, actArt:'brace' }));
  // The Turning Cell. The cage is slate, and a mouth set on it rides with it (carryMouths).
  objects.push(Object.assign(Slate(CELL.slate.x, CELL.slate.w, 0), { actArt:'slate' }));
  objects.push(Object.assign(Pl(CELL.perch.x, CELL.perch.w, CELL.perch.y), { h:20, actArt:'brace' }));
  objects.push(Object.assign(Slate(CELL.cage.x, CELL.cage.w, CELL.cage.y), { h:14, actArt:'cage', fwCage:1,
    move:{ dx:0, dy:CELL.cage.dy, period:CELL.cage.period, phase:0 } }));
  objects.push(stone(CELL.wall.x, CELL.wall.door[0], 0, 40));
  objects.push(stone(CELL.wall.x, 1900, CELL.wall.door[1], 40));
  objects.push(Object.assign(Pl(CELL.lip.x, CELL.lip.w, CELL.lip.y), { h:22, actArt:'brace' }));
  // The Sentence Well.
  WELL_SLATES.forEach(s => objects.push(Object.assign(Slate(s[0], s[1], 0), { actArt:'slate' })));
  objects.push({ type:'wall', x:WELL.x1, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'well-west', gone:true });
  objects.push({ type:'wall', x:WELL.x2, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'well-east', gone:false });
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:COURT.fire, y:0, w:40, h:20, restSiteAnchor:'vigil-ash' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'grunt', x:1050, patrol:[800, 1250], noDrop:true, wardenRole:'turnkey', noticeRange:520 },
      { t:'rifthound', x:1850, patrol:[1750, 2050], noDrop:true, wardenRole:'gaol-hound', noticeRange:560 },
      { t:'grunt', x:2250, patrol:[2100, 2380], noDrop:true, wardenRole:'turnkey', noticeRange:520 },
      { t:'grunt', x:3000, patrol:[2860, 3200], noDrop:true, wardenRole:'turnkey', noticeRange:520 },
      { t:'grunt', x:3350, patrol:[3200, 3500], noDrop:true, wardenRole:'turnkey', noticeRange:520 },
      { t:'shadeling', x:7000, patrol:[6900, 7200], noDrop:true, wardenRole:'cell-shadow', noticeRange:600 },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    bays:Object.fromEntries(BAYS.map(b => [b.id, done(c, 'fwd-' + b.id)])),
    rushed:done(c, 'fwd-rush'), sentenced:done(c, 'fwd-sentence'), marks:0, crashes:0, fight:false, introduced:done(c, 'fwd-met'), over:false, aoes:[] };
  const A = G.actTwo;
  if(A.rushed) A.marks = S.marks;
  // The Gaol's kit: jump, blade, dash, the twin mouths, the wall jump. No Counter.
  F.setKit(['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump']);
  for(const b of BAYS) setBars(b.id, A.bays[b.id]);
  setBars('well-east', A.sentenced);
}
function firstFrame(A){
  F.muster();
  // The turnkeys: each one's bay (it carries that bay's keys), and a turnkey's weight.
  for(const e of G.enemies){
    if(e.wardenRole !== 'turnkey') continue;
    const b = BAYS.find(b => e.x >= b.x0 && e.x <= b.x1); if(b) e.fwBay = b.id;
    e.hp = e.maxHp = Math.round(TURNKEY_HP * (G.ngHp || 1));
  }
  spawnSentence(A); // Retain the empty armour and lowered shield after completion.
}
function home(){ return { x:WELL.x2 - 300, y:0 }; }
function spawnSentence(A){
  const h = home(), e = spawnEnemy('grunt', h.x);
  Object.assign(e, { actFoe:'sentence', x:h.x, y:0, baseY:0, w:S.w, h:S.h, st:'wait', t:0, face:-1, dir:-1,
    frontShield:true, shieldFace:-1, portalGate:'sentence-never', active:true, noDrop:true, boss:false, maxHp:9999, hp:9999, hpWas:9999,
    noticeRange:1, cool:1.2, slamCool:2, legs:0 });
  if(A.sentenced) Object.assign(e, { st:'done', frontShield:false });
  A.sentence = e;
}
function setBars(id, open){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === open) return; b.gone = open; b.moveT = 0.5;
}
function strike(p, dir, kb, dmg){
  if(p.dead || p.invuln > 0 || p.dodgeTimer > 0) return;
  try{ hurtPlayer(dmg, dir, true); }catch(_e){}
  if(!p.dead){ p.vx = dir * kb; p.vy = 220; }
}

/* The keys: a bay's bars lift when no turnkey that carries its keys is left standing. */
function keys(A){
  for(const b of BAYS){
    if(A.bays[b.id]) continue;
    if(G.enemies.some(e => e.fwBay === b.id && !e.dead)) continue;
    A.bays[b.id] = true; kit.latch(ZONE, 'fwd-' + b.id); setBars(b.id, true); A.flash = .25;
    try{ if(meta.soundOn) SFX.pickup(); }catch(_e){}
  }
}
/* A mouth set on the cage rides with it. */
function carryMouths(){
  const cage = G.obstacles.find(o => o.fwCage); if(!cage || !G.cratePortals) return;
  for(const m of G.cratePortals){
    if(!Object.prototype.hasOwnProperty.call(m, '_fwCage')){
      const on = m.surf === 'floor' && Math.abs(m.x - cage.x) <= cage.w / 2 + 2 && Math.abs(m.y - cage.y) < 12;
      Object.defineProperty(m, '_fwCage', { value:on ? m.x - cage.x : null, writable:true, enumerable:true });
    }
    if(m._fwCage != null){ m.x = cage.x + m._fwCage; m.y = cage.y; }
  }
}

/* ── THE SENTENCE ──────────────────────────────────────────────────────────── */
function phase(A){ return A.marks < S.marks ? 'rush' : 'sentence'; }
/* Its shield comes round to you: behind it for longer than the turn and it faces you again. */
function turnShield(e, p, dt){
  const want = Math.sign(p.x - e.x) || e.shieldFace;
  if(want === e.shieldFace){ e.behindT = 0; return; }
  e.behindT = (e.behindT || 0) + dt;
  if(e.behindT >= S.turn){ e.shieldFace = e.face = want; e.behindT = 0; }
}
function contact(e, p){ return !p.dead && Math.abs(p.x - e.x) < e.w / 2 + 14 && p.y < e.y + e.h - 16 && p.y + 40 > e.y; }
function clampWell(e){ e.x = Math.max(WELL.x1 + 45, Math.min(WELL.x2 - 45, e.x)); }
function updateSentence(A, e, p, dt){
  if(p.dead || e.dead) return;
  e.t += dt;
  // Nothing clings to it: no bleed, burn, frost or float (a blow is the only thing that counts).
  e.burnT = e.poisonT = e.bleedT = e.freezeT = e.floatT = e.counterStunT = 0;
  if(e.hp < e.hpWas) onHit(A, e, p);
  e.hp = e.hpWas = 9999;
  const ph = phase(A);
  switch(e.st){
    case 'wait':
      if(p.x > WELL.x1 + 80 && p.x < WELL.x2 && !p.dead){
        e.st = 'hunt'; e.t = 0; e.cool = 1.0; A.fight = true; setBars('well-west', false);
        if(!A.introduced){ A.introduced = true; kit.latch(ZONE, 'fwd-met');
          A.queue.push({ src:e, accent:'#c9b8d8', html:'<b>THE SENTENCE</b><br>It carries a warden’s shield, and there is no face behind it. It raises the shield toward you and keeps it toward you wherever you go.' }); }
      }
      break;
    case 'hunt': {
      turnShield(e, p, dt);
      const dx = p.x - e.x, dist = Math.abs(dx);
      if(dist > 60) e.x += Math.sign(dx) * S.hunt * dt;
      e.cool -= dt; e.slamCool -= dt;
      if(contact(e, p)) strike(p, Math.sign(dx) || 1, 240, S.slamDmg);
      if(ph === 'sentence' && e.cool <= 0){ e.st = 'pronounce'; e.t = 0; e.legs = 0; break; }
      if(ph === 'rush' && e.cool <= 0 && dist > S.rush.min){ e.st = 'rush-tell'; e.t = 0; e.dir = Math.sign(dx) || e.face; e.shieldFace = e.face = e.dir; e.to = p.x + e.dir * S.rush.past; break; }
      if(e.slamCool <= 0 && dist < S.slam.within){ e.st = 'slam-tell'; e.t = 0; }
      break;
    }
    case 'rush-tell': if(e.t >= S.rush.tell){ e.st = 'rush'; e.t = 0; e.hit = false; } break;
    case 'rush':
      e.x += e.dir * S.rush.speed * dt;
      if(!e.hit && contact(e, p) && !(p.dodgeTimer > 0)){ e.hit = true; strike(p, e.dir, 360, S.hitDmg); }
      if((e.x - e.to) * e.dir >= 0 || e.x <= WELL.x1 + 45 || e.x >= WELL.x2 - 45){ clampWell(e); e.st = 'recover'; e.t = 0; }
      break;
    case 'recover':                                  // still facing the way it rushed: its back is open
      if(e.t >= S.rush.recover){ e.st = 'hunt'; e.t = 0; e.cool = S.rush.cd; }
      break;
    case 'slam-tell':
      if(e.t >= S.slam.tell){ e.st = 'slam'; e.t = 0; A.aoes.push({ x:e.x, r:S.slam.r, t:.3 }); G.shake = Math.max(G.shake || 0, 6);
        if(!p.dead && Math.abs(p.x - e.x) < S.slam.r && p.y < 40) strike(p, Math.sign(p.x - e.x) || 1, 320, S.slamDmg); }
      break;
    case 'slam': if(e.t >= S.slam.recover){ e.st = 'hunt'; e.t = 0; e.slamCool = S.slam.cd; } break;
    // THE SENTENCE: wall to wall, shielded all round.
    case 'pronounce':
      e.dir = Math.sign(p.x - e.x) || e.dir || 1; e.face = e.shieldFace = e.dir;
      if(e.t >= S.sentence.tell){ e.st = 'sentence'; e.t = 0; e.hit = false; }
      break;
    case 'sentence': {
      const was = e.x;
      e.x += e.dir * S.sentence.speed * dt;
      if(!e.hit && contact(e, p) && !(p.dodgeTimer > 0)){ e.hit = true; strike(p, e.dir, 380, S.hitDmg); }
      if(throughMouth(A, e, was)) break;
      if(e.x <= WELL.x1 + 45 || e.x >= WELL.x2 - 45){ clampWell(e); G.shake = Math.max(G.shake || 0, 7);
        if(++e.legs >= S.sentence.legs){ e.st = 'winded'; e.t = 0; } else { e.st = 'rebound'; e.t = 0; } }
      break;
    }
    case 'rebound': if(e.t >= S.sentence.rebound){ e.dir = -e.dir; e.face = e.shieldFace = e.dir; e.st = 'sentence'; e.t = 0; e.hit = false; } break;
    case 'winded': if(e.t >= S.sentence.winded){ e.st = 'hunt'; e.t = 0; e.cool = .8; } break;
    case 'thrown':                                   // out of your other mouth, and down
      e.vyc -= S.crash.gravity * dt; e.y += e.vyc * dt;
      if(e.y <= 0){ e.y = 0; e.st = 'crashed'; e.t = 0; G.shake = Math.max(G.shake || 0, 10); kit.burst(e.x, 10, '#c9b8d8', 16); }
      break;
    case 'crashed':                                  // on its back: open from every side
      if(e.t >= S.crash.time){ e.st = 'hunt'; e.t = 0; e.cool = 1.2; }
      break;
    case 'done': break;
  }
  clampWell(e); e.baseY = e.y;
  // What the engine lets land: in the rush, the blade from behind; in the sentence, nothing; thrown or fallen, the
  // blade from anywhere. Only the blade ('melee'): the dash's fire echo, passing behind it, once counted as a strike.
  const open = e.st === 'thrown' || e.st === 'crashed';
  e.frontShield = !open && e.st !== 'done';
  e.portalGate = open || (ph === 'rush' && e.st !== 'wait') ? 'melee' : 'sentence-never';
}
/* Its own rush, sent back: running over one floor mouth of your pair, it is thrown out of the other. */
function throughMouth(A, e, was){
  const m = G.cratePortals || []; if(m.length < 2) return false;
  for(let i = 0; i < 2; i++){
    const a = m[i], b = m[1 - i]; if(a.surf !== 'floor') continue;
    // The rush must physically meet a floor mouth in this well, with an exit here too.
    if(Math.abs((a.y || 0) - e.y) > 26 || a.x <= WELL.x1 || a.x >= WELL.x2) continue;
    if(b.surf !== 'floor' || Math.abs(b.y || 0) > 26 || b.x <= WELL.x1 || b.x >= WELL.x2) continue;
    if((was - a.x) * (e.x - a.x) > 0) continue;       // it did not cross this mouth this frame
    e.x = b.x; e.y = Math.max(0, (b.y || 0) + 10); e.vyc = S.crash.toss;
    e.st = 'thrown'; e.t = 0; A.flash = .5; G.shake = Math.max(G.shake || 0, 10);
    kit.burst(a.x, 30, '#9fd6ff', 12); kit.burst(b.x, 30, '#9fd6ff', 18);
    try{ clearPlacedPortals(false, 'sentence-thrown'); }catch(_e){ G.cratePortals = []; }
    try{ if(meta.soundOn) SFX.magic(); }catch(_e){}
    return true;
  }
  return false;
}
function onHit(A, e, p){
  if(e.st === 'thrown' || e.st === 'crashed'){
    A.crashes++; A.flash = .5; kit.burst(e.x, 40, '#e8dcc0', 16);
    if(A.crashes >= S.crashes){
      e.st = 'done'; e.t = 0; A.sentenced = true; A.fight = false; kit.latch(ZONE, 'fwd-sentence');
      setBars('well-east', true); setBars('well-west', true); F.clear(STAGE);
      A.queue.push({ src:e, accent:'#c9b8d8', html:'<b>THE SENTENCE</b><br>The shield comes down at last. There is no one behind it, and there has not been for a long time.' });
      try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
    } else { e.st = 'hunt'; e.t = 0; e.cool = 1.4; e.y = 0; e.shieldFace = e.face = Math.sign(p.x - e.x) || e.face; }
    return;
  }
  if(phase(A) === 'rush' && e.st !== 'wait'){
    A.marks++; A.flash = .35; kit.burst(e.x, 50, '#e8dcc0', 14);
    if(A.marks >= S.marks){ A.rushed = true; kit.latch(ZONE, 'fwd-rush'); }
    e.st = 'hunt'; e.t = 0; e.cool = A.marks >= S.marks ? 1.6 : S.rush.cd; e.shieldFace = e.face = Math.sign(p.x - e.x) || e.face;
  }
}
function resetSentence(A){
  const e = A.sentence; if(!e) return;
  A.fight = false; A.crashes = 0; A.marks = A.rushed ? S.marks : 0;
  Object.assign(e, { st:'wait', t:0, x:home().x, y:0, dir:-1, face:-1, shieldFace:-1, cool:1.2, slamCool:2, legs:0, hp:9999, hpWas:9999, hit:false, behindT:0, vyc:0, baseY:0, frontShield:true, portalGate:'sentence-never' });
  A.aoes = [];
  setBars('well-west', true);
  try{ clearPlacedPortals(false, 'sentence-reset'); }catch(_e){}
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  for(const a of A.aoes) a.t -= dt; A.aoes = A.aoes.filter(a => a.t > 0);
  carryMouths();
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  if(!p.dead) keys(A);
  if(p.dead && A.fight) resetSentence(A);
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && A.sentenced && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('THE FRACTURED WARDEN · BEHIND YOU', 'THE FRACTURED FROSTFELL', 'Act Three · the next echo',
      'Behind you the shield lies face down in the well. Ahead Frostfell is warm, which it never was.', false); }
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'sentence') return updateSentence(A, e, p, dt);
}
function lateUpdate(){}
function interact(){ return false; }
function swing(){}
function voidFloor(){ return -140; }
/* The climbs look up. */
function cameraFloor(p){
  if(!p) return null;
  const climbing = (p.x > 3700 && p.x < 5700 && p.y > 120) || (p.x > 5800 && p.x < 6800 && p.y > 200);
  return climbing ? Math.max(0, p.y - 200) : 0;
}
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 400) return { connector:'fk-fw', zone:ZONE, targetStage:26, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.sentenced ? F.seamOn(STAGE, ZONE, 'fw-ff', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fw-ff' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.fight ? CUES.well : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedWarden = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, phase, constants:Object.freeze({ LEN, SPAWN, GROUND, ROOF, BAYS, TURNKEY_HP, LOWGS, THIN, ENGINE_LEDGES, ENGINE_WALL, DECK, ROTORS,
    CELL, COURT, WELL, WELL_SLATES, S, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
