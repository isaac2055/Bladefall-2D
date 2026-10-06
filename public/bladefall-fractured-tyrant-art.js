/* Bladefall — ACT THREE · The Fractured Tyrant's art (2026-09-25).

   The Citadel after its master: pale stone gone grey, violet only where the room was torn. What you must
   read: the tears (the engine draws them — taut and lit when open, a slack dashed line between beats), the
   slate face that holds your mouths, the bed of teeth, and the Tearer: a knot of torn cloth round a violet
   core, the tear it is about to open drawn faint through its body during the tell. */
(function installFracturedTyrantArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;

const C = {
  sky:['#07060c', '#0d0b16', '#151222', '#1c1830'],
  hall0:'#0d0b14', hall1:'#15121f',
  stone0:'#24212c', stone1:'#35303f', stoneLit:'#6c6480', slate:'#3a4150', slateLit:'#8a96ad',
  violet:'196,123,255', violetHex:'#c47bff', pale:'#f1d6ff', tooth:'#8c8298', toothTip:'#d8cce6',
};
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 33 ? A : null; }

function draw(phase, api, a){
  switch(phase){
    case 'backdrop': backdrop(api); return true;
    case 'plat': return plat(api, a);
    case 'object': return object(api, a);
    case 'world': return true;
    case 'enemy': return enemy(api, a);
    case 'overlay': overlay(api); return true;
  }
  return false;
}

function backdrop(api){
  FA.sky(api, C.sky, 'fty');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  const { B, bw, Z } = api;
  // Far spires with rents in them.
  for(const [par, col, spacing, seed] of [[.15, C.hall0, 320, 4], [.3, C.hall1, 230, 9]]){
    const half = bw / (2 * Z);
    const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
    for(let k = Math.floor(w0 / spacing) - 1; k <= Math.ceil(w1 / spacing) + 1; k++){
      const x = Math.round((k * spacing - api.camX - half) * Z * par + bw / 2), h = 220 + Math.round(api.hash(k, seed) * 260), w = 28 + Math.round(api.hash(k, seed + 1) * 22);
      B(x, horizon - h, w, h + 60, col); B(x + w / 2 - 6, horizon - h - 18, 12, 18, col);
      if(api.hash(k, seed + 2) > .7){ const ry = horizon - h * (.3 + .4 * api.hash(k, seed + 3)); B(x + w / 2 - 1, ry, 2, 26, `rgba(${C.violet},.25)`); }
    }
  }
  FA.ash(api, 'rgba(210,180,255,.12)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'citadel':
      B(s.x0, s.y, s.w, s.floor - s.y, C.stone0); B(s.x0, s.y, s.w, 3, C.stone1); B(s.x0, s.y, s.w, 1, C.stoneLit);
      for(let x = s.x0 - ((s.x0 + base) % 52); x < s.x1; x += 52) if(x >= s.x0) B(x, s.y + 3, 1, 9, C.hall0);
      FA.seams(api, s, base, '#9a5cd8');
      return true;
    case 'ledge':
      B(s.x0, s.y, s.w, s.floor - s.y, C.stone1); B(s.x0, s.y, s.w, 2, C.stoneLit);
      return true;
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api;
  if(o.type === 'wall' && o.actArt){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = Math.max(-4, WY(o.y)), bot = Math.min(api.bh + 4, WY(o.y - o.h)), w = x1 - x0;
    if(o.actArt === 'face'){
      // Slate: the one stone here that holds a mouth. Banded, blue-grey, set in pale stone.
      B(x0, top, w, bot - top, C.slate); B(x0, top, w, 2, C.slateLit); B(x0, bot - 2, w, 2, C.slateLit);
      for(let y = top + 12; y < bot - 4; y += 18) B(x0 + 3, y, w - 6, 1, C.slateLit);
      return true;
    }
    if(o.actArt === 'bars'){ const lift = o.gone ? Math.round((bot - top) * .94) : 0; for(let x = x0 + 2; x < x1 - 1; x += 6) B(x, top, 3, bot - top - lift, C.stone1); B(x0 - 3, top, w + 6, 3, C.stoneLit); return true; }
    return false;
  }
  if(o.type === 'spikes' && o.actArt === 'teeth'){
    const bx = WX(o.x - o.w / 2), by = WY(o.y), w = WX(o.x + o.w / 2) - bx, n = Math.max(3, Math.round(o.w / 14)), hh = Math.round(18 * api.Z);
    B(bx, by - 2, w, 3, C.stone0);
    for(let i = 0; i < n; i++){ const x = bx + Math.round((i + .5) * w / n); for(let k = 0; k < hh; k++) B(x - (k < hh / 2 ? 1 : 0), by - 3 - k, k < hh / 2 ? 3 : 1, 1, k > hh - 4 ? C.toothTip : C.tooth); }
    return true;
  }
  if(o.type === 'seam' && o.ftyDyn && o.spent && !o.gone){
    // The tell: the tear it is about to open, drawn faint and trembling.
    const ax = WX(o.ax), ay = WY(o.ay), bx = WX(o.bx), by = WY(o.by), ctx = api.ctx, t = api.time;
    ctx.save(); ctx.strokeStyle = `rgba(${C.violet},${.55 + .3 * Math.sin(t * 30)})`; ctx.lineWidth = Math.max(2, Math.round(3 * api.Z));
    ctx.setLineDash([Math.round(3 * api.Z), Math.round(5 * api.Z)]); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); ctx.restore();
    return true;
  }
  switch(o.type){
    case 'actTunnel': {
      const x = WX(o.x), base = WY(o.y || 0), top = WY((o.y || 0) + o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.stone1); B(x + w, top + r * 4, 10, 4, C.stone1); }
      api.glow(x, base - 60, 60, C.violet, .12);
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 12, y - 3, 24, 3, C.stone1); for(let i = 0; i < 3; i++) B(x - 6 + i * 5, y - 7, 3, 4, i % 2 ? C.violetHex : C.pale); api.glow(x, y - 6, 22, C.violet, .3); return true; }
  }
  return false;
}

/* THE TEARER: torn cloth round a core. Lit while its tear is open; shaken when ridden through. */
function enemy(api, e){
  if(e.actFoe !== 'tearer') return false;
  const { B, WX, WY } = api, s = n => Math.round(n * api.Z), t = api.time, A = st(api) || {};
  const x = WX(e.x) + (e.shake > 0 ? Math.round(Math.sin(t * 40) * 2) : 0), foot = WY(e.y), top = WY(e.y + e.h), mid = (foot + top) / 2;
  if(e.st === 'down'){ for(let i = 0; i < 5; i++) B(x - s(40) + i * s(18), WY(0) - s(6) - (i % 2) * s(4), s(14), s(6) + (i % 2) * s(4), C.stone1); return true; }
  for(let i = 0; i < 7; i++){
    const a = t * .8 + i * .9, r = s(34 + 10 * Math.sin(t * 2 + i));
    const cx = x + Math.round(Math.cos(a) * r * .8), cy = mid + Math.round(Math.sin(a) * r);
    B(cx - s(9), cy - s(14), s(18), s(28), i % 2 ? C.stone1 : C.stone0);
  }
  const open = e.st === 'open', tell = e.st === 'tell';
  api.glow(x, mid, s(open ? 40 : 26), C.violet, open ? .55 : tell ? .35 + .2 * Math.sin(t * 20) : .2);
  B(x - s(8), mid - s(8), s(16), s(16), open ? C.pale : C.violetHex);
  if(e.flash > 0) api.glow(x, mid, s(30), C.violet, e.flash * 2);
  return true;
}
function overlay(api){
  const A = st(api) || {};
  FA.vignette(api, '8,6,14', .5);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(230,210,255,${.14 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
  // The pulses: where it will strike the floor.
  const { B, WX, WY } = api, t = api.time;
  for(const q of A.pulses || []){
    const pulse=root.BladefallFracturedTyrant.constants.TEARER.pulse;
    const f = Math.min(1, q.t / pulse.tell), x0 = WX(q.x - pulse.r), x1 = WX(q.x + pulse.r), y = WY(0);
    B(x0,y-2,x1-x0,2,C.violetHex); B(x0,y-10,1,10,C.pale); B(x1-1,y-10,1,10,C.pale);
    for(let x = x0; x < x1; x += 8) if(Math.sin(t * 24 + x * .3) > -.2) B(x, y - 3, 5, 3, `rgba(196,123,255,${.3 + .6 * f})`);
    if(q.hit) api.glow((x0 + x1) / 2, y - 10, (x1 - x0) / 2, '196,123,255', .5);
  }
}

ART.register(33, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
