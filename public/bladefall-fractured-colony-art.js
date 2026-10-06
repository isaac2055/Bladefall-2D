/* Bladefall — ACT THREE · The Fractured Colony's art (2026-09-25).

   The Colony emptied: grey mud, slack tents, cold pit fires, and the watch lamps still sweeping. What you must
   read: each lamp's beam on the ground (amber; red while it holds you), the tents and cisterns you can stand
   in, the rings, the tap, and in the yard the Ringer — which way his shield faces, and his back when a blow
   there would count — and the chained at their posts, and how far their chains reach. */
(function installFracturedColonyArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;
const SH = () => ART.shared || {};

const C = {
  sky:['#08080a', '#0e0e10', '#151518', '#1c1c20'],
  hall0:'#0c0c0e', hall1:'#131316',
  mud0:'#221e1a', mud1:'#302a24', mudLit:'#5a5046', canvas:'#4a443a', canvasLit:'#7a7060', wood0:'#2a221a', wood1:'#3e3226', woodLit:'#6a563e',
  stone:'#34302c', stoneLit:'#6a625a', amber:'255,208,112', red:'255,90,70', iron:'#3a3f46', ironLit:'#9aa6b2', shield:'#8a7a4a', shieldLit:'#e0c880',
};
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 38 ? A : null; }
const K = () => root.BladefallFracturedColony;

function draw(phase, api, a){
  switch(phase){
    case 'backdrop': backdrop(api); return true;
    case 'plat': return plat(api, a);
    case 'object': return object(api, a);
    case 'world': world(api); return true;
    case 'enemy': return enemy(api, a);
    case 'overlay': overlay(api); return true;
  }
  return false;
}

function backdrop(api){
  FA.sky(api, C.sky, 'fco');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  const { B, bw, Z } = api;
  for(const [par, col, spacing, seed] of [[.15, C.hall0, 260, 2], [.3, C.hall1, 190, 7]]){
    const half = bw / (2 * Z);
    const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
    for(let k = Math.floor(w0 / spacing) - 1; k <= Math.ceil(w1 / spacing) + 1; k++){
      const x = Math.round((k * spacing - api.camX - half) * Z * par + bw / 2), h = 30 + Math.round(api.hash(k, seed) * 40), w = 60 + Math.round(api.hash(k, seed + 1) * 50);
      for(let i = 0; i < h; i += 3) B(x + Math.round(i * .6), horizon - h + i, w - Math.round(i * 1.2), 3, col);      // tent shapes on the hills
    }
  }
  FA.ash(api, 'rgba(210,200,190,.10)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'mud':
      B(s.x0, s.y, s.w, s.floor - s.y, C.mud0); B(s.x0, s.y, s.w, 3, C.mud1); B(s.x0, s.y, s.w, 1, C.mudLit);
      for(let x = s.x0 - ((s.x0 + base) % 23); x < s.x1; x += 23) if(x >= s.x0) B(x, s.y + 4, 4, 1, C.mud1);
      return true;
    case 'conduit':
      B(s.x0, s.y, s.w, s.floor - s.y, C.stone); B(s.x0, s.y, s.w, 2, C.stoneLit); B(s.x0, s.y + 8, s.w, 3, '#1a1816');
      return true;
    case 'tap': {
      const A = st(api), cx = (s.x0 + s.x1) / 2;
      B(s.x0, s.y, s.w, s.floor - s.y, C.iron); B(s.x0, s.y, s.w, 2, C.ironLit); B(cx - 4, s.y - 12, 8, 12, C.iron);
      if(!(A && A.tapped)) api.glow(cx, s.y - 6, 14, C.amber, .2);
      return true;
    }
    case 'platform':
      B(s.x0, s.y, s.w, s.floor - s.y, C.wood1); B(s.x0, s.y, s.w, 2, C.woodLit);
      return true;
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api, A = st(api) || {}, t = api.time;
  if(o.type === 'wall' && o.actArt === 'bars'){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = Math.max(-4, WY(o.y)), bot = Math.min(api.bh + 4, WY(o.y - o.h)), w = x1 - x0;
    const lift = o.gone ? Math.round((bot - top) * .94) : 0; for(let x = x0 + 2; x < x1 - 1; x += 6) B(x, top, 3, bot - top - lift, C.iron); B(x0 - 3, top, w + 6, 3, C.ironLit); return true;
  }
  switch(o.type){
    case 'actRing': if(SH().drawRing){ SH().drawRing(api, o); return true; } return false;
    case 'actTower': {
      const x = WX(o.x), base = WY(o.y), top = WY(o.y + o.h), w = Math.round(o.w * api.Z);
      B(x - w / 2, top, w, base - top, C.wood0); for(let y = top + 10; y < base; y += 24){ B(x - w / 2, y, w, 2, C.wood1); B(x - w / 2 + 2, y, 2, 14, C.wood1); }
      if(!o.yard){ B(x - 16, top - 14, 32, 14, C.wood1); api.glow(x, top - 8, 14, C.amber, .5); }
      return true;
    }
    case 'actTent': {
      const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), base = WY(0), top = WY(o.h), w = x1 - x0;
      for(let y = top; y < base; y += 2){ const f = (y - top) / Math.max(1, base - top), half = Math.round(w / 2 * (.25 + .75 * f)); B(Math.round((x0 + x1) / 2) - half, y, half * 2, 2, y % 6 ? C.canvas : C.canvasLit); }
      B(Math.round((x0 + x1) / 2) - 1, top - 8, 2, 10, C.wood1);
      return true;
    }
    case 'actCistern': {
      const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), base = WY(o.y), top = WY(o.y + o.h);
      B(x0, top, 4, base - top, C.stone); B(x1 - 4, top, 4, base - top, C.stone); B(x0, top, x1 - x0, 3, C.stoneLit);
      return true;
    }
    case 'actPost': {
      const x = WX(o.x), base = WY(0), top = WY(o.h); B(x - 3, top, 6, base - top, C.wood1); B(x - 5, top, 10, 3, C.woodLit);
      const k = K(); if(k && !A.silenced){ const r = k.constants.RINGER.chain.reach; api.ctx.save(); api.ctx.globalAlpha = .18; B(WX(o.x - r), base - 2, WX(o.x + r) - WX(o.x - r), 2, C.ironLit); api.ctx.restore(); }
      return true;
    }
    case 'actTunnel': {
      const x = WX(o.x), base = WY(o.y || 0), top = WY((o.y || 0) + o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.wood1); B(x + w, top + r * 4, 10, 4, C.wood1); }
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 12, y - 3, 24, 3, C.wood1); for(let i = 0; i < 3; i++) B(x - 6 + i * 5, y - 7, 3, 4, i % 2 ? '#ffb060' : '#ffe0a0'); api.glow(x, y - 6, 22, '255,180,100', .3); return true; }
  }
  return false;
}
function beam(api, fromX, fromY, toX, toY, w, hot){
  const { WX, WY, ctx } = api, col = hot ? C.red : C.amber;
  ctx.save(); ctx.fillStyle = `rgba(${col},.13)`; ctx.beginPath(); ctx.moveTo(WX(fromX), WY(fromY)); ctx.lineTo(WX(toX - w), WY(toY)); ctx.lineTo(WX(toX + w), WY(toY)); ctx.closePath(); ctx.fill();
  ctx.fillStyle = `rgba(${col},.35)`; ctx.fillRect(WX(toX - w), WY(toY) - 3, WX(toX + w) - WX(toX - w), 3); ctx.restore();
}
/* The lamps' beams; the chain to your hand; the chains of the chained. */
function world(api){
  const A = st(api), k = K(); if(!A || !k) return;
  const KC = k.constants, p = api.G.p, hot = A.seenT > .05;
  for(const T of KC.WATCH.towers) beam(api, T.x, 520, k.lampX(T, A.t), 0, KC.WATCH.beam, hot && A.seen);
  beam(api, KC.SPRING.lamp.x, KC.SPRING.conduit.y + 360, k.lampX(KC.SPRING.lamp, A.t), KC.SPRING.conduit.y, KC.WATCH.beam, hot && A.seen);
  if(A.fight && A.lamps) for(const x of A.lamps) beam(api, (KC.TOWER.x0 + KC.TOWER.x1) / 2, KC.TOWER.y + 200, x, 0, KC.WATCH.beam, A.yardSeenT > .05);
  for(const c of A.chained || []){ if(c.free) continue; const n = 10; for(let i = 0; i <= n; i++){ const f = i / n; api.B(Math.round(api.WX(c.post + (c.x - c.post) * f)) - 1, Math.round(api.WY(4 + Math.sin(f * Math.PI) * -6)), 3, 3, C.iron); } }
  if(p && p.actHook && p.actHook.ring && SH().line) SH().line(api, api.WX(p.x), api.WY(p.y + 30), api.WX(p.actHook.ring.x), api.WY(p.actHook.ring.y), '#6a7078');
}

/* THE RINGER: a hooded figure on the tower, bell rope in one hand, shield on the side he faces. The chained: hunched
   figures in iron at their posts. */
function enemy(api, e){
  const { B, WX, WY } = api, s = n => Math.round(n * api.Z), t = api.time;
  if(e.actFoe === 'chained'){
    const x = WX(e.x), foot = WY(0), sit = e.st === 'sit' || e.st === 'free';
    const h = sit ? s(30) : s(50); B(x - s(10), foot - h, s(20), h, '#3a342c'); B(x - s(7), foot - h - s(10), s(14), s(10), '#3a342c');
    if(!e.free) B(x - s(8), foot - s(14), s(16), s(3), C.iron);
    return true;
  }
  if(e.actFoe !== 'ringer') return false;
  const sh = e.shake > 0 ? Math.round(Math.sin(t * 40) * 2) : 0, x = WX(e.x) + sh, foot = WY(e.y), top = WY(e.y + e.h), f = e.face || -1;
  if(e.st === 'down'){ B(x - s(26), foot - s(12), s(52), s(12), '#3a3028'); return true; }
  B(x - s(15), top + s(12), s(30), foot - top - s(12), '#3a3028'); B(x - s(11), top, s(22), s(16), '#2a221c');     // robe, hood
  // The bell above him, swinging when he rings.
  const bx = x - f * s(6), by = top - s(34), swing = e.ringing > 0 ? Math.round(Math.sin(t * 20) * 4) : 0;
  B(bx - s(9) + swing, by, s(18), s(16), '#8a6a30'); if(e.ringing > 0) api.glow(bx, by + s(8), s(26), C.amber, .45);
  const sx = x + f * s(16) - (f < 0 ? s(8) : 0), lean = e.st === 'bash-tell' ? f * s(4) : 0;
  B(sx + lean, top + s(8), s(8), foot - top - s(12), C.shield); B(sx + lean + (f < 0 ? 0 : s(6)), top + s(8), s(2), foot - top - s(12), C.shieldLit);
  if(e.portalGate === 'melee'){ const rx = x - f * s(15); B(rx - 1, top + s(12), 3, foot - top - s(12), '#ffd070'); api.glow(rx, (top + foot) / 2, s(22), C.amber, .3); }
  return true;
}
function overlay(api){
  const A = st(api) || {};
  FA.vignette(api, '8,8,8', .45);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(255,236,200,${.14 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
  const k = K(), limits = k.constants;
  const s = Math.min(1, Math.max((A.seenT || 0) / limits.WATCH.catchT, (A.yardSeenT || 0) / limits.RINGER.lamp.catchT));
  if(s > 0 && !api.G.p.dead){ const x = api.WX(api.G.p.x), y = api.WY(api.G.p.y + api.G.p.h + 12);
    api.B(x - 20, y, 40, 3, '#342824'); api.B(x - 20, y, 40 * s, 3, '#ffd070'); }
  if(s > .05){ api.ctx.fillStyle = `rgba(255,90,70,${.12 * Math.min(1, s)})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
}

ART.register(38, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
