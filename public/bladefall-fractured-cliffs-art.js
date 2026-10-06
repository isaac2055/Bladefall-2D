/* Bladefall — ACT THREE · The Fractured Cliffs' art (2026-09-25).

   The Thunder Cliffs after the voyage: wet slate cliffs, a wreck on the beach, a storm sea come up to the
   cliff tops. What you must read: the rings (the Act Two iron the hook takes), which of them the lightning is
   about to find (a white crawl on the rim) and which it has (white-hot, gone), the chain from your hand to the
   ring, the breakers coming in, and the Last Head: rearing (the lunge), straining at its chain (its collar's
   lock lit: strike it from above). */
(function installFracturedCliffsArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;
const SH = () => ART.shared || {};

const C = {
  sky:['#05070a', '#0a0f16', '#111924', '#182333'],
  hall0:'#0a0e14', hall1:'#101722',
  slate0:'#1a2028', slate1:'#28313c', slateLit:'#5c6c7c', wet:'#8aa4b8',
  sea0:'#0b1620', sea1:'#16293a', foam:'#c8dce8', bolt:'#f0f6ff', bolt2:'180,210,255',
  wood:'#2e241c', woodLit:'#5a4634', iron:'#3a3f46', ironLit:'#9aa6b2', lock:'#e0c080',
};
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 36 ? A : null; }
const K = () => root.BladefallFracturedCliffs;

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
  FA.sky(api, C.sky, 'fc');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  const { B, bw, Z } = api, t = api.time;
  for(const [par, col, spacing, seed] of [[.15, C.hall0, 300, 7], [.3, C.hall1, 210, 13]]){
    const half = bw / (2 * Z);
    const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
    for(let k = Math.floor(w0 / spacing) - 1; k <= Math.ceil(w1 / spacing) + 1; k++){
      const x = Math.round((k * spacing - api.camX - half) * Z * par + bw / 2), h = 160 + Math.round(api.hash(k, seed) * 260), w = 50 + Math.round(api.hash(k, seed + 1) * 70);
      B(x, horizon - h, w, h + 60, col);
    }
  }
  // Distant lightning: a flicker behind the stacks now and then.
  const fl = Math.max(0, Math.sin(t * 1.3) * Math.sin(t * 3.7) - .92) * 10;
  if(fl > 0){ api.ctx.fillStyle = `rgba(${C.bolt2},${.12 * fl})`; api.ctx.fillRect(0, 0, bw, api.bh); }
  FA.ash(api, 'rgba(190,210,230,.10)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'cliff':
      B(s.x0, s.y, s.w, s.floor - s.y, C.slate0); B(s.x0, s.y, s.w, 3, C.slate1); B(s.x0, s.y, s.w, 1, C.wet);
      for(let x = s.x0 - ((s.x0 + base) % 38); x < s.x1; x += 38) if(x >= s.x0) B(x, s.y + 4, 1, 10, C.hall0);
      return true;
    case 'windlass': {
      const A = st(api), cx = (s.x0 + s.x1) / 2;
      B(s.x0, s.y, s.w, s.floor - s.y, C.wood); B(s.x0, s.y, s.w, 2, C.woodLit);
      B(cx - 18, s.y - 10, 36, 10, C.iron); B(cx - 18, s.y - 10, 36, 2, C.ironLit);
      if(!(A && A.hook)){ for(let i = 0; i < 4; i++) B(cx - 14 + i * 8, s.y - 16, 5, 6, C.iron); api.glow(cx, s.y - 10, 18, '200,220,240', .2); }
      return true;
    }
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api, A = st(api), t = api.time;
  if(o.type === 'wall' && o.actArt){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = Math.max(-4, WY(o.y)), bot = Math.min(api.bh + 4, WY(o.y - o.h)), w = x1 - x0;
    if(o.actArt === 'bars'){ const lift = o.gone ? Math.round((bot - top) * .94) : 0; for(let x = x0 + 2; x < x1 - 1; x += 6) B(x, top, 3, bot - top - lift, C.iron); B(x0 - 3, top, w + 6, 3, C.ironLit); return true; }
    return false;
  }
  switch(o.type){
    case 'actRockface': {
      // Behind the road, not across it: the cliff the last head is stapled to.
      const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = Math.max(-4, WY(o.y)), bot = Math.min(api.bh + 4, WY(o.y - o.h)), w = x1 - x0;
      api.ctx.save(); api.ctx.globalAlpha = .75; B(x0, top, w, bot - top, C.slate1); B(x0, top, 3, bot - top, C.slateLit); for(let y = top + 20; y < bot; y += 31) B(x0 + 4, y, w - 8, 2, C.slate0); api.ctx.restore();
      return true;
    }
    case 'actRing': {
      const x = WX(o.x), y = WY(o.y);
      if(o.gone){ api.glow(x, y, 16, C.bolt2, .7); for(let a = 0; a < 20; a++){ const ang = a / 20 * Math.PI * 2; B(Math.round(x + Math.cos(ang) * 8), Math.round(y + Math.sin(ang) * 8), 2, 2, C.bolt); } return true; }
      if(SH().drawRing) SH().drawRing(api, o); else B(x - 6, y - 6, 12, 12, C.ironLit);
      if(o.fcWarn){ for(let a = 0; a < 20; a++){ const ang = a / 20 * Math.PI * 2 + t * 9; if(Math.sin(ang * 3 + t * 20) > .3) B(Math.round(x + Math.cos(ang) * 10), Math.round(y + Math.sin(ang) * 10), 2, 2, C.bolt); } api.glow(x, y, 14, C.bolt2, .25 + .2 * Math.sin(t * 30)); }
      return true;
    }
    case 'actWreck': {
      const x0 = WX(o.x - o.w / 2), y = WY(o.y);
      // The ship on its side on the beach: a hull of planks, a broken mast.
      for(let i = 0; i < 9; i++) B(x0 + i * 6, y - 40 - i * 9, Math.round(o.w * api.Z) - i * 12, 8, i % 2 ? C.wood : '#261e17');
      B(x0 + 200, y - 190, 6, 130, C.wood); B(x0 + 150, y - 190, 110, 5, C.wood);
      return true;
    }
    case 'actTunnel': {
      const x = WX(o.x), base = WY(o.y || 0), top = WY((o.y || 0) + o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.slate1); B(x + w, top + r * 4, 10, 4, C.slate1); }
      api.glow(x, base - 60, 60, C.bolt2, .1);
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 12, y - 3, 24, 3, C.wood); for(let i = 0; i < 3; i++) B(x - 6 + i * 5, y - 7, 3, 4, i % 2 ? '#ffb060' : '#ffe0a0'); api.glow(x, y - 6, 22, '255,180,100', .3); return true; }
  }
  return false;
}
/* The sea under the gaps; the breakers; the chain from your hand to the ring; the head's chain. */
function world(api){
  const A = st(api), k = K(); if(!A || !k) return;
  const { B, WX, WY } = api, t = api.time, KC = k.constants, p = api.G.p;
  const G0 = KC.GROUND, top = WY(-30);
  for(let i = 0; i < G0.length - 1; i++){
    const a = G0[i][1], b = G0[i + 1][0], x0 = Math.max(0, WX(a)), x1 = Math.min(api.bw, WX(b)); if(x1 <= x0) continue;
    B(x0, top, x1 - x0, api.bh - top, C.sea0);
    for(let x = x0 - (x0 % 5); x < x1; x += 5) B(x, top + Math.round(3 * Math.sin(t * 2 + x * .09)), 4, 2, x % 15 ? C.sea1 : C.foam);
  }
  const W = KC.BREAK.wave;
  for(const w of A.waves || []){
    const x0 = WX(w.x - W.w / 2), x1 = WX(w.x + W.w / 2), y1 = WY(0), y0 = WY(W.h);
    for(let x = x0; x < x1; x += 3){ const f = (x - x0) / Math.max(1, x1 - x0), h = Math.round((y1 - y0) * (1 - Math.pow(f - .35, 2) * 1.6)); B(x, y1 - h, 3, h, f < .3 ? C.foam : C.sea1); }
    B(x0, y0, x1 - x0, 3, C.foam);
  }
  if(p && p.actHook && p.actHook.ring){ SH().line ? SH().line(api, WX(p.x), WY(p.y + 30), WX(p.actHook.ring.x), WY(p.actHook.ring.y), '#6a7078')
    : B(WX(p.x), WY(p.actHook.ring.y), 1, WY(p.y + 30) - WY(p.actHook.ring.y), '#6a7078'); }
  const e = A.head;
  if(e && e.st !== 'wait' && e.st !== 'down'){
    const n = 24, sx = KC.STAPLE.x, sy = KC.STAPLE.y, ex = e.x, ey = e.y + e.h / 2, taut = e.st === 'taut';
    for(let i = 0; i <= n; i++){ const f = i / n, sag = taut ? 0 : Math.sin(f * Math.PI) * 60; B(Math.round(WX(sx + (ex - sx) * f)) - 2, Math.round(WY(sy + (ey - sy) * f - sag)) - 2, 4, 4, taut ? C.ironLit : C.iron); }
  }
}

/* THE LAST HEAD: a long wet head, jaw and crest; a lock on its collar that lights while its chain is taut. */
function enemy(api, e){
  if(e.actFoe !== 'lasthead') return false;
  const { B, WX, WY } = api, s = n => Math.round(n * api.Z), t = api.time;
  const sh = e.shake > 0 ? Math.round(Math.sin(t * 40) * 2) : 0, x = WX(e.x) + sh, foot = WY(e.y), top = WY(e.y + e.h);
  if(e.st === 'down') return true;
  const face = api.G.p.x < e.x ? -1 : 1, rear = e.st === 'tell' ? -s(10) : 0;
  B(x - s(55), top + s(10) + rear, s(110), s(50), '#1e2a30'); B(x - s(55), top + s(10) + rear, s(110), 3, '#4a6070');
  B(x + face * s(40) - s(20), top + s(30) + rear, s(40), s(34), '#1e2a30');                              // jaw
  B(x + face * s(30) - s(4), top + s(20) + rear, s(8), s(6), e.st === 'tell' ? '#ffe0a0' : '#c8d8e0');  // eye
  for(let i = 0; i < 5; i++) B(x - s(40) + i * s(18), top + rear - s(8) + (i % 2) * s(4), s(8), s(18), '#2a3a44');   // crest
  // The collar and its lock.
  const taut = e.st === 'taut' && !e.struck;
  B(x - s(30), top + s(4) + rear, s(60), s(8), C.iron); B(x - s(8), top - s(8) + rear, s(16), s(14), taut ? C.lock : C.iron);
  if(taut) B(x-s(30),top-s(12),s(60)*Math.max(0,1-e.t/K().constants.HEAD.taut[st(api).phase]),2,C.lock);
  if(e.st==='tell'){const target=WX(e.tx),level=WY(e.ty+e.h);B(target-s(55),level,s(110),2,C.lock);B(target,level-s(14),1,s(14),C.lock);}
  if(taut) api.glow(x, top - s(2), s(24), '224,192,128', .45 + .2 * Math.sin(t * 10));
  return true;
}
function overlay(api){
  const A = st(api) || {};
  FA.vignette(api, '4,6,10', .5);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(220,235,255,${.14 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
  // A breaker still off-screen to the east: spray at the edge.
  const { B, WX } = api;
  for(const w of A.waves || []){ const x = WX(w.x); if(x > api.bw && x < api.bw + 700){ const a = 1 - (x - api.bw) / 700; for(let i = 0; i < 6; i++) B(api.bw - 6 - Math.round(api.hash(i,Math.floor(api.time*12)) * 10), Math.round(api.WY(0) - api.hash(i+11,Math.floor(api.time*12)) * 200 * a), 3, 3, `rgba(200,220,232,${.6 * a})`); } }
}

ART.register(36, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
