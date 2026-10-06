/* Bladefall — ACT THREE · The Fractured Path's art (2026-09-25).

   Noon on the climb: white stone, black shade, and the pools of sun the mirrors throw on the road. What you must
   read: each pool (white-gold on the ground, moving), the shade (shelters; the vents' smoke while it stands), the
   risers, the beam walking the overlook's rings, and at the gate the windlass — cold iron, or lit and turnable —
   with its three turns marked on the gate, and the keeper. */
(function installFracturedPathArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;
const SH = () => ART.shared || {};

const C = {
  sky:['#1a160e', '#2a2416', '#3a321e', '#4a4026'],
  hall0:'#241f14', hall1:'#302a1a',
  stone0:'#4a4436', stone1:'#5e5644', stoneLit:'#a09478', shade:'#1e1a12', sun:'255,236,170', sunHex:'#ffecaa',
  canvas:'#6a6048', canvasLit:'#9a8e6c', iron:'#2a2a2c', ironLit:'#8a8a90', smoke:'140,134,120', shield:'#8a7a4a', shieldLit:'#e0c880',
};
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 39 ? A : null; }
const K = () => root.BladefallFracturedPath;

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
  FA.sky(api, C.sky, 'fp');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  const { B, bw, Z } = api;
  api.glow(bw * .78, Math.round(horizon - 420), 70, C.sun, .55);                                        // the sun, too high
  for(const [par, col, spacing, seed] of [[.15, C.hall0, 300, 3], [.3, C.hall1, 220, 9]]){
    const half = bw / (2 * Z);
    const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
    for(let k = Math.floor(w0 / spacing) - 1; k <= Math.ceil(w1 / spacing) + 1; k++){
      const x = Math.round((k * spacing - api.camX - half) * Z * par + bw / 2), h = 160 + Math.round(api.hash(k, seed) * 280), w = 60 + Math.round(api.hash(k, seed + 1) * 60);
      B(x, horizon - h, w, h + 60, col);
    }
  }
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'road': case 'apron':
      B(s.x0, s.y, s.w, s.floor - s.y, C.stone0); B(s.x0, s.y, s.w, 3, C.stone1); B(s.x0, s.y, s.w, 1, C.stoneLit);
      for(let x = s.x0 - ((s.x0 + base) % 41); x < s.x1; x += 41) if(x >= s.x0) B(x, s.y + 4, 1, 10, C.shade);
      return true;
    case 'windlass': {
      const A = st(api) || {}, k = K(), lit = k && A.fight && k.gateLit(A.t), cx = (s.x0 + s.x1) / 2;
      B(s.x0, s.y, s.w, s.floor - s.y, C.iron); B(s.x0, s.y, s.w, 2, lit ? C.sunHex : C.ironLit);
      for(let i = 0; i < 3; i++) B(cx - 18 + i * 14, s.y + 6, 6, s.floor - s.y - 8, i < (A.turns || 0) ? '#c0a060' : '#3a3a3c');
      if(lit) api.glow(cx, s.y, 34, C.sun, .5);
      return true;
    }
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api, A = st(api) || {}, t = api.time;
  if(o.type === 'wall' && o.actArt){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = Math.max(-4, WY(o.y)), bot = Math.min(api.bh + 4, WY(o.y - o.h)), w = x1 - x0;
    if(o.actArt === 'riser'){ B(x0, top, w, bot - top, C.stone1); B(x0, top, w, 2, C.stoneLit); return true; }
    if(o.actArt === 'bars' || o.actArt === 'sungate'){
      const lift = o.gone ? Math.round((bot - top) * .94) : Math.round((bot - top) * .3 * (o.actArt === 'sungate' ? (A.turns || 0) / 3 : 0));
      for(let x = x0 + 2; x < x1 - 1; x += 6) B(x, top, 3, bot - top - lift, o.actArt === 'sungate' ? '#8a7040' : C.iron); B(x0 - 3, top, w + 6, 3, C.stoneLit); return true;
    }
    return false;
  }
  switch(o.type){
    case 'actRing': if(SH().drawRing){ SH().drawRing(api, o); return true; } return false;
    case 'actMirror': { const x = WX(o.x), y = WY(o.y); B(x - 2, y, 4, 60, C.iron); B(x - 18, y - 14, 36, 14, '#c8c0a0'); B(x - 18, y - 14, 36, 2, '#fff8e0'); api.glow(x, y - 7, 20, C.sun, .4); return true; }
    case 'actShelter': {
      const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), base = WY(o.y), top = WY(o.y + o.h);
      B(x0, top, x1 - x0, 6, C.canvas); B(x0, top, x1 - x0, 1, C.canvasLit); B(x0 + 2, top, 3, base - top, C.iron); B(x1 - 5, top, 3, base - top, C.iron);
      api.ctx.save(); api.ctx.globalAlpha = .35; B(x0, top + 6, x1 - x0, base - top - 6, C.shade); api.ctx.restore();
      return true;
    }
    case 'actVent': {
      const x = WX(o.x), base = WY(0), k = K(), on = k && k.ventOn(o.vent, A.t || 0);
      B(x - 16, base - 8, 32, 8, C.iron);
      if(on) for(let i = 0; i < 14; i++){ const yy = base - 10 - i * 18, ww = Math.round(o.w * api.Z * (.5 + .5 * i / 14)); api.ctx.save(); api.ctx.globalAlpha = .28; B(x - ww / 2 + Math.round(Math.sin(t * 2 + i) * 6), yy - 18, ww, 18, `rgb(${C.smoke})`); api.ctx.restore(); }
      return true;
    }
    case 'actTunnel': {
      const x = WX(o.x), top = WY((o.y || 0) + o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.stone1); B(x + w, top + r * 4, 10, 4, C.stone1); }
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 12, y - 3, 24, 3, C.stone1); for(let i = 0; i < 3; i++) B(x - 6 + i * 5, y - 7, 3, 4, i % 2 ? '#ffb060' : '#ffe0a0'); return true; }
  }
  return false;
}
/* The pools of sun on the ground; the beam on the overlook's rings; the light on the windlass; the chain to your hand. */
function pool(api, x, w, y){ const { B, WX, WY } = api, x0 = WX(x - w / 2), x1 = WX(x + w / 2), gy = WY(y);
  api.ctx.save(); api.ctx.fillStyle = `rgba(${C.sun},.5)`; api.ctx.fillRect(x0, gy - 3, x1 - x0, 5); api.ctx.fillStyle = `rgba(${C.sun},.12)`; api.ctx.fillRect(x0, gy - 90, x1 - x0, 87); api.ctx.restore(); }
function world(api){
  const A = st(api), k = K(); if(!A || !k) return;
  const KC = k.constants, p = api.G.p;
  if(A.fight && !A.opened){
    const M = KC.GATE.mirror, phase = ((A.t % M.period) + M.period) % M.period;
    const remaining = phase < M.lit ? (M.lit - phase) / M.lit : (M.period - phase) / (M.period - M.lit);
    const x = api.WX(KC.GATE.windlass.x), y = api.WY(KC.TOP + 60), w = 70 * api.Z;
    api.B(x - w / 2, y, w, 3, '#403828'); api.B(x - w / 2, y, w * remaining, 3, phase < M.lit ? '#ffe08a' : '#8a8070');
    if(A.turns > 0){ api.B(x - w / 2, y + 6, w, 2, '#403828'); api.B(x - w / 2, y + 6, w * Math.max(0, 1 - A.slipT / KC.GATE.slip), 2, '#c89850'); }
  }
  for(const M of KC.MIRRORS){ const x = k.poolX(M, A.t), g = k.groundAt(x); if(g != null) pool(api, x, M.w, g); }
  const bx = k.poolX(KC.OVERLOOK_BEAM, A.t); api.glow(api.WX(bx), api.WY(910), 60, C.sun, .35);
  if(A.fight && k.gateLit(A.t)) pool(api, KC.GATE.windlass.x, A.turns >= 2 ? 520 : 180, KC.TOP);
  if(p && p.actHook && p.actHook.ring && SH().line) SH().line(api, api.WX(p.x), api.WY(p.y + 30), api.WX(p.actHook.ring.x), api.WY(p.actHook.ring.y), '#6a6250');
}
function enemy(api, e){
  if(e.actFoe !== 'keeper') return false;
  const { B, WX, WY } = api, s = n => Math.round(n * api.Z), x = WX(e.x), foot = WY(e.y), top = WY(e.y + e.h), f = e.face || -1;
  if(e.st === 'down'){ B(x - s(16), top + s(10), s(32), foot - top - s(10), '#4a4030'); B(x - s(26), foot - s(8), s(20), s(8), C.shield); return true; }
  B(x - s(16), top + s(12), s(32), foot - top - s(12), '#4a4030'); B(x - s(11), top, s(22), s(16), '#3a3226');
  const sx = x + f * s(18) - (f < 0 ? s(9) : 0), lean = e.st === 'bash-tell' ? f * s(4) : 0;
  B(sx + lean, top + s(6), s(9), foot - top - s(10), C.shield); B(sx + lean + (f < 0 ? 0 : s(7)), top + s(6), s(2), foot - top - s(10), C.shieldLit);
  return true;
}
function overlay(api){
  const A = st(api) || {};
  const glare = Math.min(.18, Math.max(0, (api.G.p.y || 0) / 660) * .18);                               // the higher, the harsher
  if(glare > .01){ api.ctx.fillStyle = `rgba(255,240,200,${glare})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
  if(A.lit){ api.ctx.fillStyle = 'rgba(255,220,140,.14)'; api.ctx.fillRect(0, 0, api.bw, api.bh); }
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(255,250,230,${.16 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
  FA.vignette(api, '20,16,8', .4);
}

ART.register(39, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
