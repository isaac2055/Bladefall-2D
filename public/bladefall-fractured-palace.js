/* Bladefall — ACT THREE · The Fractured Palace (stage 40), 2026-09-25. The last echo.

   The twentieth echo: the Sunspire after the Echo walked it backwards. The light still comes down through the
   skylights, and it still goes where you send it. The kit is the one the Sunspire was entered with — everything
   through the Chainhook — and the palace asks mostly for the twin mouths. Nothing waits here. The Muster applies.

     THE SUN COURT: a shaft of light onto slate. Catch it in a floor mouth; its twin, set on a slate face, throws
       the light across the court into the seal.
     THE HALL OF HOURS: the shaft moves with the hour across a strip of slate. Catch it where it will pass; send it
       up from the ledge under the seal.
     THE KING IN THE DARK (the C-side): the throne room is dark but for the shafts. The King's echo is struck
       only while light you have sent touches him. He blinks away and takes your mouths with him when struck.
   And after him, the end of the echoes. */
(function installFracturedPalace(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 40, ZONE = 'fractured-palace', SOURCE = 20;
const LEN = 10200;
const SPAWN = { x:150, y:0 };
const SKY = 1400;

/* ── Geometry (world units; y up; the floor is y 0) ──────────────────────── */
/* The Sun Court: a shaft onto a slate panel; a raised slate face; the seal across the court; the gate. */
const COURT = { shaft:1300, panel:[1300, 120], face:{ x:1900, w:60, bottom:100, top:620 }, seal:{ x:2500, y:330, w:40, h:70 }, gate:2800 };
/* The Hall of Hours: the shaft sweeps x = x + amp·sin(2πt/period); a strip of slate under its sweep; a ledge with a
   slate top under the seal; the gate. */
const HALL = { shaft:{ x:4200, amp:450, period:6.0 }, strip:[3750, 4650], steps:[ [5080, 100, 110] ], ledge:{ x:5230, w:120, y:220 },
  seal:{ x:5230, y:560, w:110, h:40 }, gate:5700 };   // as wide as the slate under it
/* The throne room. */
const THRONE = { x1:6200, x2:9400, panels:[6700, 7300, 7900, 8500, 9000], faces:[ { x:6400, side:1 }, { x:9200, side:-1 } ],
  faceSpan:{ bottom:100, top:620 } };
const KING = {
  w:70, h:150, speed:[40, 55, 70], exposed:1.6, blink:[8.5, 7.0, 5.5], sweep:{ reach:170, tell:.6, dmg:16, cool:2.2 },
  flare:{ from:2, every:6.0, tell:.8, r:200, dmg:18 },
  phases:[ { marks:2, shafts:[ { x:6700, amp:0, period:1 } ] },
           { marks:2, shafts:[ { x:6700, amp:0, period:1 }, { x:8200, amp:320, period:6.4 } ] },
           { marks:2, shafts:[ { x:7300, amp:300, period:5.6 }, { x:8500, amp:320, period:6.4, phase:1.4 } ] } ],
};
const BURN = { dmg:12, every:1.2, w:30 };
const CHECKPOINTS = [ { id:'court', x:500 }, { id:'hall', x:2950 }, { id:'throne', x:THRONE.x1 - 120 } ];
function groundAt(x){ return x >= 0 && x < LEN ? 0 : null; }
function shaftX(S, t){ return S.x + (S.amp || 0) * Math.sin(2 * Math.PI * t / (S.period || 1) + (S.phase || 0)); }
const CUES = Object.freeze({
  king:Object.freeze({ id:'fractured-king-in-the-dark', src:'./audio/music/fractured-the-fallen-champion-duel.mp3', title:'The Fallen Champion (fractured)',
    artist:'Aerth score', mood:'the King in the dark: send the light, then strike' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function slateFloor(x, w){ return Object.assign(Slate(x, w, 4), { actArt:'slate' }); }
function slateFace(x, top, bottom, w){ return Object.assign(SlateWall(x, top, top - bottom), { w:w || 60, actArt:'face' }); }
function bars(x, id, gone){ return { type:'wall', x, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:id, gone:!!gone }; }
function buildLevel(){
  const objects = [];
  objects.push(Object.assign(GrAt(0, LEN, 0), { actArt:'marble' }));
  // The Sun Court.
  objects.push(slateFloor(COURT.panel[0], COURT.panel[1]));
  objects.push(slateFace(COURT.face.x, COURT.face.top, COURT.face.bottom, COURT.face.w));
  objects.push(Object.assign({ type:'actSeal', id:'court' }, COURT.seal), { type:'actPillar', x:COURT.seal.x, y:0, w:30, h:COURT.seal.y - 30 });
  objects.push(bars(COURT.gate, 'court-gate'));
  // The Hall of Hours.
  objects.push(slateFloor((HALL.strip[0] + HALL.strip[1]) / 2, HALL.strip[1] - HALL.strip[0]));
  HALL.steps.forEach(([x, w, y]) => objects.push(Object.assign(Pl(x, w, y), { actArt:'marbleStep' })));
  objects.push(Object.assign(Pl(HALL.ledge.x, HALL.ledge.w, HALL.ledge.y), { actArt:'marbleStep' }), Object.assign(Slate(HALL.ledge.x, HALL.ledge.w - 20, HALL.ledge.y + 4), { actArt:'slate' }));
  objects.push(Object.assign({ type:'actSeal', id:'hall' }, HALL.seal));
  objects.push(bars(HALL.gate, 'hall-gate'));
  // The throne room.
  THRONE.panels.forEach(x => objects.push(slateFloor(x, 100)));
  THRONE.faces.forEach(f => objects.push(slateFace(f.x, THRONE.faceSpan.top, THRONE.faceSpan.bottom, 50)));
  objects.push(bars(THRONE.x1, 'throne-west', true), bars(THRONE.x2, 'throne-east'));
  objects.push({ type:'actThrone', x:(THRONE.x1 + THRONE.x2) / 2 + 600, y:0, w:120, h:180 });
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:320, y:0, w:40, h:20, restSiteAnchor:'palace-ash' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[ { t:'belled', x:3300, patrol:[3150, 3500], noDrop:true }, { t:'sunguard', x:5950, patrol:[5850, 6100], noDrop:true } ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    court:done(c, 'fpa-court'), hall:done(c, 'fpa-hall'), phase:done(c, 'fpa-king-2') ? 2 : done(c, 'fpa-king-1') ? 1 : 0, yielded:done(c, 'fpa-king'),
    marks:0, fight:false, introduced:done(c, 'fpa-met'), over:false, burnCd:0, rays:[], flareT:0, flares:[] };
  F.setKit(['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump', 'attunement',
    'companion-command', 'downward-strike', 'gravity-flip', 'chain-hook']);
  setBars('court-gate', G.actTwo.court); setBars('hall-gate', G.actTwo.hall); setBars('throne-east', G.actTwo.yielded);
  for(const o of G.obstacles) if(o.type === 'actSeal') o.lit = !!G.actTwo[o.id];
}
function firstFrame(A){ F.muster(); spawnKing(A); }
function spawnKing(A){
  const x = (THRONE.x1 + THRONE.x2) / 2 + 500, e = spawnEnemy('grunt', x);
  Object.assign(e, { actFoe:'darkking', kind:'fly', x, y:0, baseY:0, w:KING.w, h:KING.h, st:'wait', t:0, face:-1, cool:1.5, blinkT:0, exposedT:0,
    frontShield:false, portalGate:'king-never', active:true, noDrop:true, boss:false, maxHp:9999, hp:9999, hpWas:9999, noticeRange:1 });
  if(A.yielded) e.st = 'down';
  A.king = e;
}
function setBars(id, open){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === open) return; b.gone = open; b.moveT = 0.5;
}
function harm(p, dir, dmg){
  if(p.dead || p.invuln > 0 || p.dodgeTimer > 0) return;
  try{ hurtPlayer(dmg, dir, true); }catch(_e){}
}

/* ── The light ─────────────────────────────────────────────────────────────── */
/* The shafts in play now. */
function shafts(A){
  if(A.fight) return KING.phases[A.phase].shafts.map(S => shaftX(S, A.t));
  return [COURT.shaft, shaftX(HALL.shaft, A.t)];
}
/* First thing an axis-aligned ray meets: a solid, a seal, or the King. */
function cast(x0, y0, dx, dy, A){
  const targets = G.obstacles.filter(o => o.type === 'actSeal' && !o.lit).map(o => ({ o, x0:o.x - o.w / 2, x1:o.x + o.w / 2, y0:o.y - o.h / 2, y1:o.y + o.h / 2 }));
  if(A.king && A.fight && A.king.st !== 'down') targets.push({ king:A.king, x0:A.king.x - KING.w / 2, x1:A.king.x + KING.w / 2, y0:A.king.y, y1:A.king.y + KING.h });
  let best = { d:dy ? SKY - y0 : 1600, hit:null };
  const solids = G.obstacles.filter(o => (o.type === 'plat' || o.type === 'wall') && !o.gone && !o.ceiling);
  const consider = (d, hit) => { if(d > 2 && d < best.d) best = { d, hit }; };
  for(const s of solids){
    const sx0 = s.x - s.w / 2, sx1 = s.x + s.w / 2, sy0 = s.y - (s.h || 14), sy1 = s.y;
    if(dy > 0 && x0 > sx0 && x0 < sx1 && sy0 > y0) consider(sy0 - y0, null);
    if(dx !== 0 && y0 > sy0 && y0 < sy1){ if(dx > 0 && sx0 > x0) consider(sx0 - x0, null); if(dx < 0 && sx1 < x0) consider(x0 - sx1, null); }
  }
  for(const t of targets){
    if(dy > 0 && x0 > t.x0 && x0 < t.x1 && t.y1 > y0) consider(Math.max(3, t.y0 - y0), t);
    if(dx !== 0 && y0 > t.y0 && y0 < t.y1){ if(dx > 0 && t.x1 > x0) consider(Math.max(3, t.x0 - x0), t); if(dx < 0 && t.x0 < x0) consider(Math.max(3, x0 - t.x1), t); }
  }
  return { x1:x0 + dx * best.d, y1:y0 + dy * best.d, hit:best.hit };
}
function light(A, p, dt){
  A.rays = [];
  if(p.dead){ A.lit = false; return; }
  const mouths = G.cratePortals || [];
  if(mouths.length === 2){
    for(const sx of shafts(A)){
      for(let i = 0; i < 2; i++){
        const a = mouths[i], b = mouths[1 - i];
        if(a.surf !== 'floor' || Math.abs(a.x - sx) > 40) continue;
        // The shaft goes in at a; it comes out of b, the way b faces.
        const dx = b.surf === 'wall' ? (b.nx || 0) : 0, dy = b.surf === 'wall' ? 0 : 1;
        const r = cast(b.x + dx * 4, (b.y || 0) + (dy ? 6 : 0), dx, dy, A);
        A.rays.push({ x0:b.x, y0:b.y || 0, x1:r.x1, y1:r.y1 });
        if(r.hit && r.hit.o) sealLit(A, r.hit.o);
        if(r.hit && r.hit.king){ r.hit.king.exposedT = KING.exposed; r.hit.king.lightExit = b; }
      }
    }
  }
  // Burns: a shaft on you, or a ray through you.
  A.burnCd = Math.max(0, A.burnCd - dt);
  let lit = shafts(A).some(sx => Math.abs(p.x - sx) < BURN.w + 13);
  for(const r of A.rays){
    // (not within 40 of the mouth it leaves: setting the mouth is not a burn)
    if(r.y0 === r.y1 && p.y < r.y0 && p.y + p.h > r.y0 && Math.abs(p.x - r.x0) > 40 && p.x > Math.min(r.x0, r.x1) && p.x < Math.max(r.x0, r.x1)) lit = true;
    if(r.x0 === r.x1 && Math.abs(p.x - r.x0) < 14 && p.y > r.y0 + 40 && p.y < r.y1) lit = true;
  }
  A.lit = lit;
  if(lit && A.burnCd <= 0){ A.burnCd = BURN.every; harm(p, 0, BURN.dmg); }
}
function sealLit(A, o){
  if(o.lit) return;
  o.lit = true; A.flash = .4; kit.burst(o.x, o.y, '#fff0b0', 16);
  try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
  if(o.id === 'court'){ A.court = true; kit.latch(ZONE, 'fpa-court'); setBars('court-gate', true); }
  if(o.id === 'hall'){ A.hall = true; kit.latch(ZONE, 'fpa-hall'); setBars('hall-gate', true); }
}

/* ── THE KING IN THE DARK ─────────────────────────────────────────────────── */
function blink(A, e, p, takeMouths){
  const lo = THRONE.x1 + 200, hi = THRONE.x2 - 200;
  let x = lo + Math.random() * (hi - lo); if(Math.abs(x - p.x) < 350) x = p.x < (lo + hi) / 2 ? hi - Math.random() * 300 : lo + Math.random() * 300;
  kit.burst(e.x, e.y + e.h / 2, '#3a3040', 16); e.x = x; e.blinkT = 0; e.st = 'walk'; e.t = 0;
  // Struck, he takes the mouth that sent the light at him (the one not in the shaft); his own blinks take nothing.
  if(takeMouths && G.cratePortals && G.cratePortals.length){
    const i = G.cratePortals.indexOf(e.lightExit); if(i >= 0) G.cratePortals.splice(i, 1);
    e.lightExit = null;
  }
  kit.burst(e.x, e.y + e.h / 2, '#fff0b0', 12);
}
function updateKing(A, e, p, dt){
  if(p.dead || e.dead) return;
  e.t += dt; e.blinkT += dt; e.cool = Math.max(0, e.cool - dt); e.exposedT = Math.max(0, e.exposedT - dt); e.shake = Math.max(0, (e.shake || 0) - dt);
  e.burnT = e.poisonT = e.bleedT = e.freezeT = e.floatT = e.counterStunT = 0;
  if(e.hp < e.hpWas && e.portalGate === 'melee') struck(A, e, p);
  e.hp = e.hpWas = 9999;
  const ph = A.phase, want = Math.sign(p.x - e.x) || e.face;
  switch(e.st){
    case 'wait':
      if(p.x > THRONE.x1 + 80 && p.x < THRONE.x2 && !p.dead){
        e.st = 'walk'; e.t = 0; A.fight = true; A.flareT = 0; setBars('throne-west', false);
        if(!A.introduced){ A.introduced = true; kit.latch(ZONE, 'fpa-met');
          A.queue.push({ src:e, accent:'#fff0b0', html:'<b>THE KING IN THE DARK</b><br>He sat in the light once and could not be touched for it. Now the light is yours to send, and nothing else in this room will reach him.' }); }
      }
      break;
    case 'walk':
      e.face = want;
      if(Math.abs(p.x - e.x) > KING.sweep.reach - 20) e.x += e.face * KING.speed[ph] * dt;
      else if(e.cool <= 0){ e.st = 'sweep-tell'; e.t = 0; }
      if(e.blinkT >= KING.blink[ph]) blink(A, e, p);
      break;
    case 'sweep-tell': if(e.t >= KING.sweep.tell){ e.st = 'sweep'; e.t = 0; } break;
    case 'sweep':
      if(!p.dead && Math.abs(p.x - e.x) < KING.sweep.reach && Math.sign(p.x - e.x) === e.face && p.y < 90) harm(p, e.face, KING.sweep.dmg);
      if(e.t >= .25){ e.st = 'walk'; e.cool = KING.sweep.cool; }
      break;
    case 'down': break;
  }
  // From noon, a flare where you stand.
  if(A.fight && ph >= KING.flare.from && e.st !== 'down'){ A.flareT += dt; if(A.flareT >= KING.flare.every){ A.flareT = 0; A.flares.push({ x:p.x, t:0 }); } }
  for(const f of A.flares){ f.t += dt; if(!f.hit && f.t >= KING.flare.tell){ f.hit = true; kit.burst(f.x, 20, '#fff0b0', 14); if(!p.dead && Math.abs(p.x - f.x) < KING.flare.r / 2 && p.y < 120) harm(p, 1, KING.flare.dmg); } }
  A.flares = A.flares.filter(f => f.t < KING.flare.tell + .4);
  e.x = Math.max(THRONE.x1 + 80, Math.min(THRONE.x2 - 80, e.x)); e.y = 0; e.baseY = 0;
  // Only while light you sent touches him.
  e.portalGate = e.exposedT > 0 && e.st !== 'down' && e.st !== 'wait' ? 'melee' : 'king-never';
}
function struck(A, e, p){
  A.marks++; A.flash = .4; e.shake = .8; e.exposedT = 0; kit.burst(e.x, e.y + e.h / 2, '#fff0b0', 24);
  try{ if(meta.soundOn) SFX.hit(); }catch(_e){}
  if(A.marks >= KING.phases[A.phase].marks){
    A.marks = 0;
    if(A.phase < KING.phases.length - 1){ kit.latch(ZONE, 'fpa-king-' + (A.phase + 1)); A.phase++; blink(A, e, p, true); }
    else {
      e.st = 'down'; A.yielded = true; A.fight = false; A.flares = []; kit.latch(ZONE, 'fpa-king'); F.clear(STAGE);
      try{ clearPlacedPortals(true, 'king-yields'); }catch(_e){ G.cratePortals = []; }   // or the road out runs through your own mouths
      setBars('throne-east', true); setBars('throne-west', true);
      try{ meta.actThreeDone = true; persist(); }catch(_e){}
      A.queue.push({ src:e, accent:'#fff0b0', html:'<b>THE KING IN THE DARK</b><br>He sits down on the floor of his own hall, out of the light, and does not get up. The last of the echoes has stopped a beat behind you.' });
      try{ if(meta.soundOn) SFX.levelup(); }catch(_e){}
    }
  } else blink(A, e, p, true);
}
function resetKing(A){
  const e = A.king; if(!e) return;
  A.fight = false; A.marks = 0; A.flares = []; e.st = 'wait'; e.t = 0; e.x = (THRONE.x1 + THRONE.x2) / 2 + 500; e.exposedT = 0; e.blinkT = 0;
  A.queue = []; A.flareT = 0; e.cool = 1.5; e.hp = e.hpWas = 9999; e.lightExit = null; e.portalGate = 'king-never';
  setBars('throne-west', true);
}
/* The end of the echoes. */
function finale(){
  if(typeof coopFinishTogether==='function'&&!coopFinishTogether('act-three-end',finale))return;
  mode = 'win'; showGameUI(false);
  showOvHTML(`<div class="card">
    <p class="ovsub" style="letter-spacing:.34em;margin:0 0 6px;">END OF ACT THREE</p>
    <h1 class="title" style="margin:0 0 4px;">THE ECHOES</h1>
    <p class="subtitle" style="margin:0 0 18px;">All twenty walked</p>
    <p class="hint" style="margin:0 0 20px;">Behind you every road you took has been taken again, harder, by the one who was always a beat late in the mirror. It is not late any more. Whatever walks out of the palace now walks alone.</p>
    <button class="bigbtn" id="echoesDone">Continue</button></div>`);
  const b = document.getElementById('echoesDone'); if(b) b.onclick = () => titleScreen();
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  light(A, p, dt);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  if(A.fight && (p.dead || p.x < THRONE.x1 - 20)) resetKing(A);
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  if(!A.over && A.yielded && p.x > LEN - 150 && !p.dead){ A.over = true; finale(); }
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'darkking') return updateKing(A, e, p, dt);
}
function lateUpdate(){}
function interact(){ return false; }
function swing(){}
function voidFloor(){ return -120; }
function cameraFloor(p){ if(!p) return null; return Math.max(-120, Math.min(0, p.y - 40)); }
function seamSpec(){
  const p = G.p;
  if(p.x < 200) return { connector:'fp-fpa', zone:ZONE, targetStage:39, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return null;                                                         // the last echo: the road ends here
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.fight ? CUES.king : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedPalace = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, shaftX, cast, constants:Object.freeze({ LEN, SPAWN, SKY, COURT, HALL, THRONE, KING, BURN, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
