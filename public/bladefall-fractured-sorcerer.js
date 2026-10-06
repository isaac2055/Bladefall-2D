/* Bladefall — ACT THREE · The Fractured Sorcerer (stage 29), 2026-09-24.

   The ninth echo: the White Court after the Echo walked it backwards. It is lit, and every door in it
   stands open, but nothing in it holds unless you feed it the cold. The kit is the one the Court was
   entered with: jump, the Oathblade, the dash, the twin mouths, the wall jump, the Counter and the
   double jump. Attunement was the Sorcerer's gift, so it is not here. The Muster applies.

     THE GLASSWORKS: an emitter drips ice onto a slate, and the anchor sends what falls into your mouth
       out across the void to the condenser. The bridge over the void is frozen only while a bolt has
       just arrived, and it thaws on the off-beat, so you cross on the beat and hang in the air through
       the thaw.
     THE PETITION GALLERY: the gallery's emitter fires high, along the wall's band of slate. Climb the
       chimney and set a mouth in the band; the other goes on the floor slate under the condenser. The
       portcullis lifts.
     THE MIRROR (the C-side): the Sorcerer's echo, a glass figure. Only its own spell, sent back, breaks
       its ward, and each phase asks for a different way back:
         I   from its perch it casts at you. Send the spell through your mouths (one in front of you, one
             under the perch) and it rises into the Mirror.
         II  it comes down to the floor. The spell has to be countered straight back at it.
         III back on the perch, it lobs the spell high so that it comes down on you. Counter it, and it
             flies flat into the mouth in front of you and up into the Mirror.
       Two breaks in each phase. */
(function installFracturedSorcerer(root){
'use strict';
const A2 = root.BladefallActTwo, F = root.BladefallFractured;
if(!A2 || !A2.register || !F) return;
const kit = A2.kit;

const STAGE = 29, ZONE = 'fractured-sorcerer', SOURCE = 8;
const LEN = 9600;
const SPAWN = { x:140, y:0 };

/* ── Geometry (world units; y up; the floor is y 0; below it the void) ──────── */
const GROUND = [ [0, 1650], [2550, LEN] ];
/* The Glassworks: an emitter over a slate; the anchor (single mouth) out over the void to the condenser. The void
   is 900: two dashes and a jump reach 677, a double jump and a dash 564. */
const GLASS = {
  emitter:{ x:1300, y:420, period:1.8, speed:380 }, slate:{ x:1300, w:110 },
  anchor:{ x:1520, y:180, dir:'wallR', range:1300 },
  bridge:{ x:2100, w:900, hold:1.0 }, condenser:{ x:2640, y:180, w:60, h:110 },
};
/* The Petition Gallery: the emitter fires along the band; the chimney up to it; the outlet under the condenser. */
const GALLERY = {
  emitter:{ x:3700, y:610, period:2.0, speed:380 },
  // The wall holds a climber up to the band and no further: above it the glass is wet (climbed over, it gated nothing).
  wall:{ x:4400, gate:120, band:560, top:1400 }, band:{ x:4400, top:660, h:100 },
  chimney:{ x:4250, top:520, bottom:150 },
  outlet:{ x:4020, w:110 }, condenser:{ x:4020, y:820, w:70, h:110 },
};
const WELL = { x1:7900, x2:9000 };
const PERCH = { x:8850, y:300, w:140 };
const FRONT_SLATES = [ [8100, 90], [8330, 90], [8560, 90] ];
const M = {                                          // THE MIRROR
  w:46, h:92, orb:{ speed:340, dmg:14, size:9 }, lob:{ gravity:700, speed:260 },
  phases:[ { breaks:2, where:'perch', tell:.9, cool:2.2 },          // I: through your mouths
           { breaks:2, where:'floor', tell:.7, cool:2.4, twin:.9 }, // II: countered straight back
           { breaks:2, where:'perch', tell:.8, cool:2.0, lob:true } ], // III: countered, then through a mouth
  floor:{ x0:8000, x1:8650, near:130, keep:[280, 420], walk:90 },
  stagger:1.4, blink:.45,
};
const CHECKPOINTS = [ { id:'shaft', x:400 }, { id:'glass', x:1150 }, { id:'far-bank', x:2800 }, { id:'gallery', x:3600 },
  { id:'portcullis', x:4600 }, { id:'well', x:WELL.x1 - 120 } ];
function groundAt(x){ for(const g of GROUND) if(x >= g[0] && x < g[1]) return 0; return null; }
const CUES = Object.freeze({
  well:Object.freeze({ id:'fractured-hall-of-mirrors', src:'./audio/music/fractured-the-sorcerers-hall-of-mirrors.mp3', title:'The Sorcerer’s Hall of Mirrors (fractured)',
    artist:'Aerth score', mood:'the Mirror: its spell, sent back three ways' }),
});

/* ── Level ─────────────────────────────────────────────────────────────────── */
let cachedLevel = null;
function level(){ return cachedLevel || (cachedLevel = buildLevel()); }
function stone(x, top, bottom, w, o){ return Object.assign(Wl(x, top, top - bottom, w), { noCling:1, slickL:1, slickR:1, actArt:'glasswall' }, o || {}); }
function buildLevel(){
  const objects = [];
  GROUND.forEach(g => objects.push(Object.assign(GrAt(g[0], g[1], 0), { actArt:'court' })));
  // The Glassworks.
  objects.push(RuneEmitter(GLASS.emitter.x, GLASS.emitter.y, 'down', { el:'ice', period:GLASS.emitter.period, speed:GLASS.emitter.speed, cool:.4, actArt:'emitter' }));
  objects.push(Object.assign(Slate(GLASS.slate.x, GLASS.slate.w, 0), { actArt:'slate' }));
  objects.push(Anchor(GLASS.anchor.x, GLASS.anchor.y, GLASS.anchor.dir, { anchorRange:GLASS.anchor.range, fwsAnchor:1 }));
  objects.push(Object.assign(Pl(GLASS.bridge.x, GLASS.bridge.w, 0), { h:14, ice:1, actArt:'bridge', fwsBridge:1, gone:true }));
  objects.push({ type:'actCondenser', actId:'glass', x:GLASS.condenser.x, y:GLASS.condenser.y, w:GLASS.condenser.w, h:GLASS.condenser.h });
  // The Petition Gallery. The band is listed before the wall: a clinging knight's wall is the first one found.
  objects.push(RuneEmitter(GALLERY.emitter.x, GALLERY.emitter.y, 'right', { el:'ice', period:GALLERY.emitter.period, speed:GALLERY.emitter.speed, cool:.6, actArt:'emitter' }));
  objects.push(Object.assign(SlateWall(GALLERY.band.x, GALLERY.band.top, GALLERY.band.h), { w:40, actArt:'band' }));
  objects.push(Object.assign(Wl(GALLERY.wall.x, GALLERY.wall.band, GALLERY.wall.band - GALLERY.wall.gate, 40), { slickR:1, actArt:'glasswall' }));
  objects.push(stone(GALLERY.wall.x, GALLERY.wall.top, GALLERY.band.top, 40));
  objects.push({ type:'wall', x:GALLERY.wall.x, y:GALLERY.wall.gate, h:GALLERY.wall.gate + 4, w:40, noCling:1, actArt:'bars', actBars:'portcullis', gone:false });   // as wide as the wall over it
  objects.push(Object.assign(Wl(GALLERY.chimney.x, GALLERY.chimney.top, GALLERY.chimney.top - GALLERY.chimney.bottom, 30), { actArt:'glasswall' }));
  objects.push(Object.assign(Slate(GALLERY.outlet.x, GALLERY.outlet.w, 0), { actArt:'slate' }));
  objects.push({ type:'actCondenser', actId:'gallery', x:GALLERY.condenser.x, y:GALLERY.condenser.y, w:GALLERY.condenser.w, h:GALLERY.condenser.h });
  // The Mirror's well.
  FRONT_SLATES.concat([[PERCH.x, 110]]).forEach(s => objects.push(Object.assign(Slate(s[0], s[1], 0), { actArt:'slate' })));
  objects.push(Object.assign(Pl(PERCH.x, PERCH.w, PERCH.y), { h:24, actArt:'perch' }));
  objects.push({ type:'wall', x:WELL.x1, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'well-west', gone:true });
  objects.push({ type:'wall', x:WELL.x2, y:900, h:900, w:30, noCling:1, actArt:'bars', actBars:'well-east', gone:false });
  objects.push({ type:'actTunnel', x:LEN - 200, y:0, w:300, h:360 });
  objects.push({ type:'actFire', x:300, y:0, w:40, h:20, restSiteAnchor:'sluice-ash' });
  return {
    len:LEN, portal:null, spawnX:SPAWN.x, spawnY:SPAWN.y, authoredEcology:true,
    build(){ init(); },
    objects, loot:[], npcs:[],
    enemies:[
      { t:'frostsinger', x:3000, patrol:[2900, 3200], noDrop:true },
      { t:'rimehulk', x:5600, patrol:[5300, 6000], noDrop:true },
      { t:'frostpike', x:6800, patrol:[6500, 7200], noDrop:true },
    ],
  };
}

/* ── Init ──────────────────────────────────────────────────────────────────── */
function done(c, id){ return kit.circuitSet(c, id); }
function init(){
  const c = kit.zoneCircuits(ZONE);
  G.actTwo = { stage:STAGE, t:0, spawned:false, flash:0, queue:[], checkpoints:{}, tolls:[], fallen:[], echoSource:SOURCE,
    frozenT:0, fed:{ glass:0, gallery:0 }, portcullis:done(c, 'fws-gallery'),
    phase:done(c, 'fws-mirror-2') ? 2 : done(c, 'fws-mirror-1') ? 1 : 0, mirrored:done(c, 'fws-mirror'), breaks:0,
    fight:false, introduced:done(c, 'fws-met'), over:false };
  // The Court's kit: everything through the double jump. Attunement was the Sorcerer's gift.
  F.setKit(['jump', 'weapon', 'dash', 'portal-single', 'portal-pair', 'wall-jump', 'counter', 'double-jump']);
  setBars('portcullis', G.actTwo.portcullis);
  setBars('well-east', G.actTwo.mirrored);
}
function firstFrame(A){
  F.muster();
  spawnMirror(A);
}
function perchSpot(){ return { x:PERCH.x, y:PERCH.y }; }
function spawnMirror(A){
  const where = M.phases[A.phase].where, s = where === 'perch' ? perchSpot() : { x:M.floor.x1, y:0 };
  const e = spawnEnemy('grunt', s.x);
  Object.assign(e, { actFoe:'mirror', x:s.x, y:s.y, baseY:s.y, w:M.w, h:M.h, st:'wait', t:0, face:-1, where,
    frontShield:false, portalGate:'mirror-never', active:true, noDrop:true, boss:false, maxHp:9999, hp:9999, noticeRange:1, cool:1.2 });
  if(A.mirrored) Object.assign(e, { st:'done', x:PERCH.x, y:0, baseY:0 });
  A.mirror = e;
}
function setBars(id, open){
  const b = G.obstacles.find(o => o.actBars === id); if(!b) return;
  if(b.gone === open) return; b.gone = open; b.moveT = 0.5;
}

/* ── The condensers: a bolt that has come through a mouth feeds one ────────────────────── */
function condensers(A, dt){
  A.frozenT = Math.max(0, A.frozenT - dt);
  for(const o of G.obstacles){
    if(o.type !== 'actCondenser') continue;
    o.flash = Math.max(0, (o.flash || 0) - dt);
    for(const pr of G.projectiles){
      if(pr.life <= 0 || pr.el !== 'ice' || !(pr.portalHops > 0) || pr.fwsOrb) continue;
      if(Math.abs(pr.x - o.x) < o.w / 2 + 6 && pr.y > o.y - 8 && pr.y < o.y + o.h){
        pr.life = 0; o.flash = .6; A.fed[o.actId] = (A.fed[o.actId] || 0) + 1; kit.burst(o.x, o.y + o.h / 2, '#dff4ff', 10);
        if(o.actId === 'glass') A.frozenT = GLASS.bridge.hold;
        if(o.actId === 'gallery' && !A.portcullis){ A.portcullis = true; kit.latch(ZONE, 'fws-gallery'); setBars('portcullis', true); A.flash = .4;
          try{ if(meta.soundOn) SFX.magic('ice'); }catch(_e){} }
      }
    }
  }
  const bridge = G.obstacles.find(o => o.fwsBridge);
  if(bridge){ bridge.gone = !(A.frozenT > 0); bridge.warn = A.frozenT > 0 && A.frozenT < .3; }
}

/* ── THE MIRROR ─────────────────────────────────────────────────────────────── */
function phaseOf(A){ return M.phases[Math.min(A.phase, M.phases.length - 1)]; }
function castOrigin(e){ return { x:e.x + (e.where === 'perch' ? -20 : e.face * 24), y:e.y + 60 }; }
function cast(A, e, p, lob){
  const origin = castOrigin(e), sx = origin.x, sy = origin.y, tx = p.x, ty = p.y + 22;
  const pr = { owner:'enemy', puzzleOnly:1, fwsOrb:1, sourceType:'mirror', x:sx, y:sy, gravity:0, size:M.orb.size, color:'#dff4ff',
    shape:'orb', glow:1, dmg:M.orb.dmg, kb:200, pierce:0, el:'ice', life:4, hitSet:[], portalHops:0 };
  if(lob){
    const dx = tx - sx, T = Math.max(1.0, Math.abs(dx) / M.lob.speed), g = M.lob.gravity;
    pr.vx = dx / T; pr.vy = (ty - sy + .5 * g * T * T) / T; pr.gravity = g; pr.fwsLob = 1;
  } else {
    const dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 1;
    pr.vx = dx / d * M.orb.speed; pr.vy = dy / d * M.orb.speed;
  }
  G.projectiles.push(pr); e.flash = .25;
}
function blinkTo(e, x, y){ kit.burst(e.x, e.y + 46, '#cfe8ff', 12); e.x = x; e.y = y; e.baseY = y; kit.burst(x, y + 46, '#cfe8ff', 12); }
/* Its own spell, sent back: which way back each phase takes (a countered orb is the player's; a portaled one has hops). */
function accepts(A, pr){
  const countered = pr.owner === 'player', portaled = pr.portalHops > 0;
  return A.phase === 0 ? portaled : A.phase === 1 ? countered : countered && portaled;
}
function orbs(A, e){
  for(const pr of G.projectiles){
    if(!pr.fwsOrb || pr.life <= 0) continue;
    if(pr.x < WELL.x1 - 20 || pr.x > WELL.x2 + 20){ pr.life = 0; continue; }
    // A countered lob flies flat back (so that it can find the mouth in front of you).
    if(pr.fwsLob && pr.owner === 'player' && !pr.fwsFlat){ pr.fwsFlat = 1; pr.gravity = 0; pr.vy = 0; pr.vx = Math.sign(pr.vx || 1) * M.orb.speed; }
    if(!(pr.reflected || pr.owner === 'player') || e.st === 'wait' || e.st === 'done') continue;
    if(Math.abs(pr.x - e.x) < e.w / 2 + pr.size && pr.y > e.y - pr.size && pr.y < e.y + e.h + pr.size){
      pr.life = 0;
      if(e.st !== 'staggered' && accepts(A, pr)) wardBreak(A, e);
      else { kit.burst(pr.x, pr.y, '#9fb8d8', 8); try{ if(meta.soundOn) SFX.hit(); }catch(_e){} }
    }
  }
}
function wardBreak(A, e){
  A.breaks++; A.flash = .5; G.shake = Math.max(G.shake || 0, 8); kit.burst(e.x, e.y + 46, '#ffffff', 22);
  e.st = 'staggered'; e.t = 0;
  try{ if(meta.soundOn) SFX.magic('ice'); }catch(_e){}
  if(A.breaks >= phaseOf(A).breaks){
    A.breaks = 0;
    for(const pr of G.projectiles) if(pr.fwsOrb) pr.life = 0;
    if(A.phase < M.phases.length - 1){ kit.latch(ZONE, 'fws-mirror-' + (A.phase + 1)); A.phase++; }
    else {
      e.st = 'done'; e.y = e.baseY = 0; A.mirrored = true; A.fight = false; kit.latch(ZONE, 'fws-mirror'); F.clear(STAGE);
      setBars('well-east', true); setBars('well-west', true);
      for(const pr of G.projectiles) if(pr.fwsOrb) pr.life = 0;
      A.queue.push({ src:e, accent:'#cfe8ff', html:'<b>THE MIRROR</b><br>It cracks from the edge inward, and for a moment every piece of it shows the Court as it was, full of people.' });
    }
  }
}
function updateMirror(A, e, p, dt){
  if(p.dead || e.dead) return;
  e.t += dt; e.flash = Math.max(0, (e.flash || 0) - dt);
  e.burnT = e.poisonT = e.bleedT = e.freezeT = e.floatT = e.counterStunT = 0; e.hp = 9999; e.vx = 0;
  orbs(A, e);
  const ph = phaseOf(A);
  switch(e.st){
    case 'wait':
      if(p.x > WELL.x1 + 80 && p.x < WELL.x2 && !p.dead){
        e.st = 'hover'; e.t = 0; e.cool = 1.2; A.fight = true; setBars('well-west', false);
        if(!A.introduced){ A.introduced = true; kit.latch(ZONE, 'fws-met');
          A.queue.push({ src:e, accent:'#cfe8ff', html:'<b>THE MIRROR</b><br>A figure of glass stands where the Sorcerer stood, and the ice it casts at you is your own face.' }); }
      }
      break;
    case 'hover': {
      if(ph.where !== e.where){ e.st = 'blink'; e.t = 0; break; }
      e.face = Math.sign(p.x - e.x) || -1;
      if(e.where === 'floor'){
        const dx = p.x - e.x, dist = Math.abs(dx);
        if(dist < M.floor.near){ e.st = 'blink'; e.t = 0; break; }
        const step = dist > M.floor.keep[1] ? Math.sign(dx) : dist < M.floor.keep[0] ? -Math.sign(dx) : 0;
        e.x = Math.max(M.floor.x0, Math.min(M.floor.x1, e.x + step * M.floor.walk * dt));
      }
      e.cool -= dt;
      if(e.cool <= 0 && !p.dead){ e.st = 'tell'; e.t = 0; e.twinLeft = ph.twin ? 1 : 0; }
      break;
    }
    case 'tell':
      e.face = Math.sign(p.x - e.x) || -1;
      if(e.t >= ph.tell){ cast(A, e, p, !!ph.lob);
        if(e.twinLeft > 0){ e.twinLeft--; e.st = 'twin'; e.t = 0; } else { e.st = 'hover'; e.t = 0; e.cool = ph.cool; } }
      break;
    case 'twin': if(e.t >= ph.twin){ cast(A, e, p, false); e.st = 'hover'; e.t = 0; e.cool = ph.cool; } break;
    case 'staggered':
      if(e.t >= M.stagger){ e.st = 'hover'; e.t = 0; e.cool = .9; }
      break;
    case 'blink':                                    // it goes out like a light and comes back where it means to be
      if(e.t >= M.blink){
        e.where = ph.where;
        if(ph.where === 'perch'){ const s = perchSpot(); blinkTo(e, s.x, s.y); }
        else { const far = Math.abs(p.x - M.floor.x0) > Math.abs(p.x - M.floor.x1) ? M.floor.x0 : M.floor.x1; blinkTo(e, far, 0); }
        e.st = 'hover'; e.t = 0; e.cool = Math.max(e.cool, .8);
      }
      break;
    case 'done': break;
  }
  e.baseY = e.y;
}
function resetMirror(A){
  const e = A.mirror; if(!e) return;
  A.fight = false; A.breaks = 0; A.queue = [];
  const where=phaseOf(A).where, spot=where==='perch'?perchSpot():{x:M.floor.x1,y:0};
  Object.assign(e,{st:'wait',t:0,cool:1.2,twinLeft:0,flash:0,where,x:spot.x,y:spot.y,baseY:spot.y,vx:0,face:-1});
  for(const pr of G.projectiles) if(pr.fwsOrb) pr.life = 0;
  setBars('well-west', true);
}

/* ── Frame ─────────────────────────────────────────────────────────────────── */
function update(dt, p){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  A.t += dt;
  if(!A.spawned){ A.spawned = true; firstFrame(A); }
  A.flash = Math.max(0, A.flash - dt * 2);
  condensers(A, dt);
  if(A.queue.length && !p.dead){ const q = A.queue.shift(); kit.say(q.src, q.html, q.responses, q.accent); return; }
  if(p.dead && A.fight) resetMirror(A);
  F.checkpoints(A, p, ZONE, CHECKPOINTS);
  const next = F.nextEcho(STAGE);
  if(!A.over && A.mirrored && p.x > LEN - 150 && !p.dead && !(next != null && A2.handles(next))){ A.over = true;
    F.endCard('THE FRACTURED SORCERER · BEHIND YOU', 'THE FRACTURED EMBERDEEP', 'Act Three · the next echo',
      'Behind you the Mirror lies in pieces, each one still showing a room with people in it. Ahead the Foundry is cold.', false); }
}
function updateFoe(e, p, dt){
  const A = G.actTwo; if(!A || A.stage !== STAGE) return;
  if(e.actFoe === 'mirror') return updateMirror(A, e, p, dt);
}
function lateUpdate(){}
function interact(){ return false; }
function swing(){}
function voidFloor(){ return -140; }
/* The gallery's climb and the Mirror's perch look up. */
function cameraFloor(p){
  if(!p) return null;
  if(p.x > 3800 && p.x < 4450 && p.y > 150) return Math.max(0, p.y - 220);
  return p.x > WELL.x1 - 50 && p.x < WELL.x2 ? 60 : 0;
}
function seamSpec(){
  const p = G.p, A = G.actTwo;
  if(p.x < 400) return { connector:'ff-fs', zone:ZONE, targetStage:28, warm:p.x <= 1400, cross:p.x <= 62 && p.face < 0, forward:false, commitClear:false };
  return A && A.stage === STAGE && A.mirrored ? F.seamOn(STAGE, ZONE, 'fs-fe', LEN, true) : null;
}
function arrival(plan){
  if(!plan || plan.targetZoneId !== ZONE) return null;
  return plan.connectorId === 'fs-fe' ? { x:LEN - 160, y:0 } : { x:SPAWN.x, y:SPAWN.y };
}
function musicCue(){
  const A = G && G.actTwo; if(!A || A.stage !== STAGE) return null;
  return A.fight ? CUES.well : null;
}

A2.register(STAGE, Object.freeze({ level, update, lateUpdate, interact, swing, updateFoe, voidFloor, cameraFloor, seamSpec, arrival, musicCue }));
F.registerEcho(SOURCE, STAGE);
root.BladefallFracturedSorcerer = Object.freeze({
  STAGE, ZONE, SOURCE, groundAt, accepts, castOrigin, constants:Object.freeze({ LEN, SPAWN, GROUND, GLASS, GALLERY, WELL, PERCH, FRONT_SLATES, M, CHECKPOINTS }),
});
})(typeof window !== 'undefined' ? window : globalThis);
