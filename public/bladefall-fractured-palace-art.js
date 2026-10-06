/* Bladefall — ACT THREE · The Fractured Palace's art (2026-09-25).

   The Sunspire drained of its sun but for the shafts: white marble gone grey, slate where a mouth will hold, the
   seals dark until light finds them. What you must read: each shaft (a column of light to the floor — it burns),
   the light you have sent (a gold ray out of your second mouth, to whatever it meets), the seals (dark, then
   lit), and in the throne room the King: dark, and lit gold while your light is on him — then, and only then,
   struck. */
(function installFracturedPalaceArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;

const C = {
  sky:['#0c0a08', '#14110c', '#1c1812', '#241f16'],
  hall0:'#12100c', hall1:'#1a1712',
  marble0:'#3a3832', marble1:'#4e4b44', marbleLit:'#8e8a7e', slate:'#3a4150', slateLit:'#8a96ad',
  sun:'255,240,176', sunHex:'#fff0b0', gold:'#e8c060', dark:'#15131a', iron:'#2a2a2c', ironLit:'#8a8a90',
};
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 40 ? A : null; }
const K = () => root.BladefallFracturedPalace;

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
  FA.sky(api, C.sky, 'fpa');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  const { B, bw, Z } = api;
  for(const [par, col, spacing, seed] of [[.15, C.hall0, 320, 6], [.3, C.hall1, 200, 12]]){
    const half = bw / (2 * Z);
    const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
    for(let k = Math.floor(w0 / spacing) - 1; k <= Math.ceil(w1 / spacing) + 1; k++){
      const x = Math.round((k * spacing - api.camX - half) * Z * par + bw / 2), h = 300 + Math.round(api.hash(k, seed) * 200);
      B(x, horizon - h, 26, h + 60, col); B(x - 10, horizon - h, 46, 10, col);                                   // colonnades
    }
  }
  FA.ash(api, 'rgba(240,230,200,.08)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'marble':
      B(s.x0, s.y, s.w, s.floor - s.y, C.marble0); B(s.x0, s.y, s.w, 3, C.marble1); B(s.x0, s.y, s.w, 1, C.marbleLit);
      for(let x = s.x0 - ((s.x0 + base) % 64); x < s.x1; x += 64) if(x >= s.x0) B(x, s.y + 3, 1, 12, C.hall0);
      return true;
    case 'marbleStep':
      B(s.x0, s.y, s.w, s.floor - s.y, C.marble1); B(s.x0, s.y, s.w, 2, C.marbleLit);
      return true;
    case 'slate':
      B(s.x0, s.y, s.w, Math.max(4, s.floor - s.y), C.slate); B(s.x0, s.y, s.w, 1, C.slateLit);
      for(let x = s.x0 + 4; x < s.x1 - 4; x += 12) B(x, s.y + 2, 6, 1, C.slateLit);
      return true;
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api, A = st(api) || {};
  if(o.type === 'wall' && o.actArt){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = Math.max(-4, WY(o.y)), bot = Math.min(api.bh + 4, WY(o.y - o.h)), w = x1 - x0;
    if(o.actArt === 'face'){ B(x0, top, w, bot - top, C.slate); B(x0, top, w, 2, C.slateLit); B(x0, bot - 2, w, 2, C.slateLit); for(let y = top + 12; y < bot - 4; y += 18) B(x0 + 3, y, w - 6, 1, C.slateLit); return true; }
    if(o.actArt === 'bars'){ const lift = o.gone ? Math.round((bot - top) * .94) : 0; for(let x = x0 + 2; x < x1 - 1; x += 6) B(x, top, 3, bot - top - lift, C.iron); B(x0 - 3, top, w + 6, 3, C.ironLit); return true; }
    return false;
  }
  switch(o.type){
    case 'actSeal': {
      const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = WY(o.y + o.h / 2), bot = WY(o.y - o.h / 2);
      B(x0, top, x1 - x0, bot - top, o.lit ? C.gold : C.dark); B(x0, top, x1 - x0, 2, o.lit ? C.sunHex : C.ironLit);
      const cx = (x0 + x1) / 2, cy = (top + bot) / 2; for(let a = 0; a < 16; a++){ const ang = a / 16 * Math.PI * 2; B(Math.round(cx + Math.cos(ang) * 10), Math.round(cy + Math.sin(ang) * 10), 2, 2, o.lit ? '#fff8e0' : '#5a5448'); }
      if(o.lit) api.glow(cx, cy, 34, C.sun, .5);
      return true;
    }
    case 'actPillar': { const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = WY(o.h), bot = WY(0); B(x0, top, x1 - x0, bot - top, C.marble1); B(x0, top, x1 - x0, 2, C.marbleLit); return true; }
    case 'actThrone': { const x = WX(o.x), base = WY(0), top = WY(o.h); B(x - 50, top, 100, base - top, C.marble1); B(x - 60, top, 120, 8, C.marbleLit); B(x - 40, base - 70, 80, 10, C.marbleLit); return true; }
    case 'actTunnel': {
      const x = WX(o.x), top = WY((o.y || 0) + o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.marble1); B(x + w, top + r * 4, 10, 4, C.marble1); }
      api.glow(x, top + 60, 60, C.sun, .1);
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 12, y - 3, 24, 3, C.marble1); for(let i = 0; i < 3; i++) B(x - 6 + i * 5, y - 7, 3, 4, i % 2 ? '#ffb060' : '#ffe0a0'); return true; }
  }
  return false;
}
/* The shafts from the skylights; the light you sent. */
function world(api){
  const A = st(api), k = K(); if(!A || !k) return;
  const { WX, WY, ctx } = api, KC = k.constants;
  const xs = A.fight ? KC.KING.phases[A.phase].shafts.map(S => k.shaftX(S, A.t)) : [KC.COURT.shaft, k.shaftX(KC.HALL.shaft, A.t)];
  ctx.save();
  for(const x of xs){
    const x0 = WX(x - KC.BURN.w), x1 = WX(x + KC.BURN.w), top = Math.max(-4, WY(KC.SKY)), bot = WY(0);
    const g = ctx.createLinearGradient(0, top, 0, bot); g.addColorStop(0, `rgba(${C.sun},.05)`); g.addColorStop(1, `rgba(${C.sun},.32)`);
    ctx.fillStyle = g; ctx.fillRect(x0, top, x1 - x0, bot - top); ctx.fillStyle = `rgba(${C.sun},.7)`; ctx.fillRect(x0, bot - 3, x1 - x0, 3);
  }
  for(const r of A.rays || []){
    ctx.strokeStyle = `rgba(${C.sun},.9)`; ctx.lineWidth = Math.max(2, Math.round(5 * api.Z)); ctx.beginPath(); ctx.moveTo(WX(r.x0), WY(r.y0)); ctx.lineTo(WX(r.x1), WY(r.y1)); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,240,.9)'; ctx.lineWidth = Math.max(1, Math.round(1.5 * api.Z)); ctx.beginPath(); ctx.moveTo(WX(r.x0), WY(r.y0)); ctx.lineTo(WX(r.x1), WY(r.y1)); ctx.stroke();
    api.glow(WX(r.x1), WY(r.y1), 16, C.sun, .6);
  }
  ctx.restore();
  for(const f of A.flares || []){ const fr = Math.min(1, f.t / KC.KING.flare.tell); const left = WX(f.x - KC.KING.flare.r / 2), right = WX(f.x + KC.KING.flare.r / 2), ground = WY(0); api.B(left, ground - 2, right - left, 2, C.sunHex); api.B(left, WY(120), 2, ground - WY(120), C.sunHex); api.B(right - 2, WY(120), 2, ground - WY(120), C.sunHex); api.glow(WX(f.x), WY(20), Math.round(KC.KING.flare.r / 2 * api.Z * fr), C.sun, .35 + .3 * fr); }
}
/* THE KING IN THE DARK: tall, crowned, a robe of shadow. Gold while your light is on him. */
function enemy(api, e){
  if(e.actFoe !== 'darkking') return false;
  const { B, WX, WY } = api, s = n => Math.round(n * api.Z), t = api.time;
  const sh = e.shake > 0 ? Math.round(Math.sin(t * 40) * 2) : 0, x = WX(e.x) + sh, foot = WY(e.y), top = WY(e.y + e.h), lit = e.exposedT > 0;
  if(e.st === 'down'){ B(x - s(30), foot - s(40), s(60), s(40), C.dark); for(let i = 0; i < 5; i++) B(x - s(20) + i * s(10), foot - s(52) - (i % 2) * s(6), s(5), s(12), C.gold); return true; }
  for(let i = 0; i < 8; i++){ const yy = top + s(30) + i * s(15), ww = s(34 + i * 6); B(x - ww / 2, yy, ww, s(15), lit ? '#5a4a30' : C.dark); }
  B(x - s(14), top + s(8), s(28), s(24), lit ? '#6a5838' : '#221e28');
  for(let i = 0; i < 5; i++) B(x - s(14) + i * s(7), top - s(2) - (i % 2) * s(5), s(4), s(10), lit ? C.sunHex : '#5a5040');
  if(lit){ const w = s(60); B(x - w / 2, top - s(16), w, 3, '#403828'); B(x - w / 2, top - s(16), w * Math.min(1, e.exposedT / K().constants.KING.exposed), 3, C.sunHex); }
  if(lit) api.glow(x, (top + foot) / 2, s(50), C.sun, .45);
  if(e.st === 'sweep-tell'){ const f = e.face || -1, end = WX(e.x + f * K().constants.KING.sweep.reach); B(Math.min(x, end), foot - 2, Math.abs(end - x), 2, C.sunHex); B(end - 1, WY(90), 2, foot - WY(90), C.sunHex); B(x + f * s(30), top + s(50), f * s(60), s(6), '#8a7a5a'); }
  return true;
}
function overlay(api){
  const A = st(api) || {}, k = K();
  // The throne room is dark but for the light.
  if(A.fight || (k && api.G.p.x > k.constants.THRONE.x1 - 200 && !A.yielded)){ api.ctx.fillStyle = 'rgba(4,3,6,.35)'; api.ctx.fillRect(0, 0, api.bw, api.bh); }
  if(A.lit){ api.ctx.fillStyle = 'rgba(255,230,160,.12)'; api.ctx.fillRect(0, 0, api.bw, api.bh); }
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(255,250,230,${.16 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
  FA.vignette(api, '10,8,4', .45);
}

ART.register(40, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
