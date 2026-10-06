/* Bladefall — ACT THREE · The Fractured Inversion's art (2026-09-25).

   The Inversion the right way up: two grey floors facing each other across a violet gap, the lower one
   the world's and the upper one yours, if you take it. What you must read: which floor is broken (the
   void under a floor gap, the sky over a roof gap), the stone that stands in each gap (a pillar up, a
   spur down), the roof that crumbles (cracked, and it sags once you stand on it), the teeth, the anchor
   (lit until you take the flip), the sweeps (a violet shimmer along the surface that is about to burn,
   then the burn), and the Keel: which side its keel is shown to, and whether a blow from where you
   stand would count. */
(function installFracturedInversionArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;

const C = {
  sky:['#07060e', '#0d0a1a', '#151026', '#1d1632'],
  hall0:'#0c0a16', hall1:'#141024',
  stone0:'#1a1824', stone1:'#2a2636', stoneLit:'#5c5474', crack:'#0a0812',
  void:'#050409', violet:'201,162,255', violetHex:'#c9a2ff', burn:'#e0c8ff',
  keel:'#3a3050', keelLit:'#8a78b0', keelEdge:'#e0c8ff',
};
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 32 ? A : null; }
const K = () => root.BladefallFracturedInversion;

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
  FA.sky(api, C.sky, 'fi');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  const { B, bw, Z } = api;
  // Far columns that hang as often as they stand.
  for(const [par, col, spacing, seed] of [[.15, C.hall0, 300, 8], [.3, C.hall1, 220, 14]]){
    const half = bw / (2 * Z);
    const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
    for(let k = Math.floor(w0 / spacing) - 1; k <= Math.ceil(w1 / spacing) + 1; k++){
      const x = Math.round((k * spacing - api.camX - half) * Z * par + bw / 2), h = 160 + Math.round(api.hash(k, seed) * 200), w = 26 + Math.round(api.hash(k, seed + 1) * 20);
      if(api.hash(k, seed + 2) > .5) B(x, horizon - h, w, h + 60, col);
      else B(x, horizon - 520 - Math.round(api.hash(k, seed + 3) * 80), w, h, col);
    }
  }
  FA.ash(api, 'rgba(200,170,255,.12)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), bot:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'invfloor':
      B(s.x0, s.y, s.w, s.bot - s.y, C.stone0); B(s.x0, s.y, s.w, 3, C.stone1); B(s.x0, s.y, s.w, 1, C.stoneLit);
      FA.seams(api, { x0:s.x0, x1:s.x1, y:s.y, floor:s.bot }, base);
      return true;
    case 'roof': case 'hallroof': {
      // The roof is drawn from its underside (the walking line) up out of view.
      const under = api.WY(o.y - (o.h || 14)), top = Math.max(-4, under - 900);
      B(s.x0, top, s.w, under - top, C.stone0); B(s.x0, under - 3, s.w, 3, C.stone1); B(s.x0, under - 1, s.w, 1, C.stoneLit);
      for(let x = s.x0 - ((s.x0 + base) % 46); x < s.x1; x += 46) if(x >= s.x0) B(x, under - 9, 1, 6, C.crack);
      return true;
    }
    case 'crumble': {
      if(o.gone) return true;
      const under = api.WY(o.y - (o.h || 14)), top = Math.max(-4, under - 900);
      const sag = o.crT > 0 ? Math.round(Math.sin(api.time * 40) * 1.5 + 4 * (1 - o.crT / (o.crDur || .45))) : 0;
      B(s.x0 + 1, top, s.w - 2, under - top + sag, C.stone0); B(s.x0 + 1, under - 3 + sag, s.w - 2, 3, C.stone1);
      for(let i = 0; i < 3; i++){ const cx = s.x0 + Math.round(s.w * (.2 + .3 * i)); B(cx, under - 14 + sag, 1, 12, C.crack); B(cx - 3, under - 8 + sag, 4, 1, C.crack); }
      return true;
    }
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api, A = st(api), t = api.time;
  if(o.type === 'wall' && o.actArt){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = Math.max(-4, WY(o.y)), bot = Math.min(api.bh + 4, WY(o.y - o.h)), w = x1 - x0;
    if(o.actArt === 'pillar'){ B(x0, top, w, bot - top, C.stone1); B(x0, top, w, 2, C.stoneLit); for(let y = top + 14; y < bot; y += 22) B(x0, y, w, 1, C.stone0); return true; }
    if(o.actArt === 'spur'){ B(x0, top, w, bot - top, C.stone1); B(x0, bot - 2, w, 2, C.stoneLit); for(let y = bot - 14; y > top; y -= 22) B(x0, y, w, 1, C.stone0); return true; }
    if(o.actArt === 'bars'){ const lift = o.gone ? Math.round((bot - top) * .94) : 0; for(let x = x0 + 2; x < x1 - 1; x += 6) B(x, top, 3, bot - top - lift, C.stone1); B(x0 - 3, top, w + 6, 3, C.stoneLit); return true; }
    if(o.actArt === 'lintel'){ B(x0, top, w, bot - top, C.stone0); B(x0, bot - 2, w, 2, C.stoneLit); return true; }
    return false;
  }
  if(o.type === 'spikes' && (o.actArt === 'teeth' || o.actArt === 'thorns')){
    // The engine draws every floor spike standing up; teeth hang from the roof's underside.
    const f = ((((api.G.time + (o.phase || 0)) % o.period) + o.period) % o.period), up = f < o.upT, warn = !up && f > o.period - .45;
    const ext = up ? 1 : warn ? .45 : .15, down = o.actArt === 'teeth', bx = WX(o.x - o.w / 2), by = WY(o.y), w = WX(o.x + o.w / 2) - bx;
    const n = Math.max(3, Math.round(o.w / 16)), hh = Math.round(16 * api.Z * ext), tip = up ? C.burn : warn ? C.violetHex : C.stoneLit;
    B(bx, down ? by : by - 2, w, 2, C.stone1);
    for(let i = 0; i < n; i++){ const x = bx + Math.round((i + .5) * w / n);
      for(let k = 0; k < hh; k++) B(x - (k < hh / 2 ? 1 : 0), down ? by + 2 + k : by - 3 - k, k < hh / 2 ? 3 : 1, 1, k > hh - 4 ? tip : C.stoneLit); }
    return true;
  }
  switch(o.type){
    case 'actAnchor': {
      const x = WX(o.x), y = WY(o.y), lit = !(A && A.flip);
      B(x - 4, y - 70, 8, 70, C.stone1); B(x - 18, y - 12, 36, 12, C.stone1); B(x - 14, y - 78, 28, 8, C.stone1);
      B(x - 14, y - 78, 28, 1, C.stoneLit);
      if(lit){ api.glow(x, y - 40, 26, C.violet, .35 + .15 * Math.sin(t * 3)); B(x - 1, y - 66, 2, 52, C.violetHex); }
      return true;
    }
    case 'actTunnel': {
      const x = WX(o.x), base = WY(o.y || 0), top = WY((o.y || 0) + o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.stone1); B(x + w, top + r * 4, 10, 4, C.stone1); }
      api.glow(x, base - 60, 60, C.violet, .12);
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 12, y - 3, 24, 3, C.stone1); for(let i = 0; i < 3; i++) B(x - 6 + i * 5, y - 7, 3, 4, i % 2 ? C.violetHex : C.burn); api.glow(x, y - 6, 22, C.violet, .3); return true; }
  }
  return false;
}
/* The void under a broken floor, the sky over a broken roof; the sweeps. */
function world(api){
  const A = st(api), k = K(); if(!A || !k) return;
  const { B, WX, WY } = api, t = api.time, KC = k.constants;
  for(const [a, b] of KC.FLOOR_GAPS.concat([[KC.GULF.x0, KC.GULF.x1]])){
    const x0 = Math.max(0, WX(a)), x1 = Math.min(api.bw, WX(b)); if(x1 <= x0) continue;
    const top = WY(0); B(x0, top, x1 - x0, api.bh - top, C.void);
    for(let x = x0; x < x1; x += 9) if(api.hash(Math.floor((x + api.camX * api.Z) / 9), 3) > .8) B(x, top + 10 + Math.round(40 * api.hash(x, 5)), 1, 1, 'rgba(200,170,255,.5)');
  }
  // The sweeps: a shimmer while it tells, then the burn. Floor or roof.
  const H = KC.HALL;
  for(const s of A.sweeps || []){
    const y = s.which === 'floor' ? WY(0) : WY(H.roof), dir = s.which === 'floor' ? -1 : 1;
    const x0 = Math.max(0, WX(H.x1)), x1 = Math.min(api.bw, WX(H.x2)); if(x1 <= x0) continue;
    if(s.t < s.tell){
      const f = s.t / s.tell;
      B(x0,dir<0?y-2:y,x1-x0,2,C.violetHex);
      const edge=y+dir*KC.KEEL.sweep.reach*api.Z;
      for(let x=x0;x<x1;x+=28) B(x,edge,8,1,C.violetHex);
      for(let x = x0; x < x1; x += 14){ const on = Math.sin(t * 22 + x * .2) > .2; if(on) B(x, dir < 0 ? y - 3 : y, 6, 3, `rgba(${C.violet},${.25 + .6 * f})`); }
    } else {
      const hgt = Math.round(70 * api.Z);
      for(let x = x0; x < x1; x += 6){ const h = Math.round(hgt * (.5 + .5 * Math.abs(Math.sin(t * 9 + x * .13)))); B(x, dir < 0 ? y - h : y, 4, h, x % 12 ? `rgba(${C.violet},.75)` : C.burn); }
      api.glow((x0 + x1) / 2, y + dir * hgt / 2, (x1 - x0) / 2, C.violet, .15);
    }
  }
}

/* THE KEEL: a hull with a keel instead of legs. The keel faces the side it shows; lit when a blow from
   where you stand would count. */
function enemy(api, e){
  if(e.actFoe !== 'keel') return false;
  const { B, WX, WY } = api, s = n => Math.round(n * api.Z), t = api.time, A = st(api) || {};
  const x = WX(e.x), yb = WY(e.y), yt = WY(e.y + e.h), mid = (yb + yt) / 2, sh = e.shake > 0 ? Math.round(Math.sin(t * 40) * 2) : 0;
  if(e.st === 'down'){ B(x - s(60), WY(0) - s(26), s(120), s(26), C.keel); B(x - s(8), WY(0) - s(40), s(16), s(14), C.keelLit); return true; }
  // Hull.
  B(x - s(60) + sh, mid - s(14), s(120), s(28), C.keel); B(x - s(60) + sh, mid - s(14), s(120), 2, C.keelLit);
  B(x - s(40) + sh, mid - s(20), s(80), s(6), C.keel);
  // The keel: a blade along its underside (shown down) or its back (shown up).
  const down = e.side === 'down', ky = down ? mid + s(14) : mid - s(14) - s(18);
  const right = (down && !(api.G && api.G.gravityFlipped)) || (!down && api.G && api.G.gravityFlipped);
  const live = e.portalGate === 'melee';
  for(let i = 0; i < 9; i++){ const w = s(60 - Math.abs(i - 4) * 12); B(x - w / 2 + sh, down ? ky + i * 2 : ky + s(18) - i * 2 - 2, w, 2, live ? C.keelEdge : C.keelLit); }
  if(live) api.glow(x + sh, down ? ky + s(8) : ky + s(10), s(30), C.violet, .35 + .2 * Math.sin(t * 8));
  else if(right && e.st !== 'wait') api.glow(x + sh, mid, s(18), C.violet, .1);
  // The dive: a tell, then the hull comes low and fast.
  if(e.st === 'dive-tell'){
    api.glow(x,mid,s(40)*(1+e.t),C.violet,.3);
    const edge=WX(e.diveDir>0?K().constants.HALL.x2-70:K().constants.HALL.x1+70);
    B(Math.min(x,edge),WY(e.diveY),Math.abs(edge-x),1,C.burn);
    B(Math.min(x,edge),WY(e.diveY+e.h),Math.abs(edge-x),1,C.burn);
  }
  return true;
}
function overlay(api){
  const A = st(api) || {};
  FA.vignette(api, '8,6,16', .5);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(220,200,255,${.14 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
}

ART.register(32, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
