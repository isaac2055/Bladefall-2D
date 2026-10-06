/* Bladefall — ACT THREE · The Fractured Shores' art (2026-09-25).

   The strand of wrecks at a grey high tide. What you must read: the rings, the chain to your hand, the tide
   over the flats (its line, rising, standing, falling), the refuges above it (a rib, a wreck, a float riding
   it), the bell and its toll, and the Sunguard's echo: which way its shield faces, and whether the toll still
   rings (the bell's glow, and a gold rim on its back while a blow there would count). */
(function installFracturedShoresArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;
const SH = () => ART.shared || {};

const C = {
  sky:['#07080a', '#0c1014', '#12181e', '#1a2228'],
  hall0:'#0b0e12', hall1:'#11161b',
  sand0:'#2a2620', sand1:'#3a342a', sandLit:'#6e6450', wood0:'#241c16', wood1:'#3a2c20', woodLit:'#6a5238',
  sea0:'#0d1a22', sea1:'#1a3240', foam:'#c8d8de', gold:'255,227,160', goldHex:'#ffe3a0', iron:'#3a3f46', ironLit:'#9aa6b2',
  shield:'#8a7a4a', shieldLit:'#e0c880', guard:'#3a3428',
};
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 37 ? A : null; }
const K = () => root.BladefallFracturedShores;

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
  FA.sky(api, C.sky, 'fs');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  const { B, bw, Z } = api;
  // Wrecks on the horizon, masts at angles.
  for(const [par, col, spacing, seed] of [[.15, C.hall0, 330, 4], [.3, C.hall1, 240, 10]]){
    const half = bw / (2 * Z);
    const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
    for(let k = Math.floor(w0 / spacing) - 1; k <= Math.ceil(w1 / spacing) + 1; k++){
      const x = Math.round((k * spacing - api.camX - half) * Z * par + bw / 2), h = 40 + Math.round(api.hash(k, seed) * 50), w = 90 + Math.round(api.hash(k, seed + 1) * 80);
      B(x, horizon - h, w, h + 60, col);
      const lean = Math.round((api.hash(k, seed + 2) - .5) * 40); for(let i = 0; i < 12; i++) B(x + w / 2 + Math.round(lean * i / 12), horizon - h - i * 12, 4, 12, col);
    }
  }
  FA.ash(api, 'rgba(200,210,215,.08)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'strand': case 'rib':
      B(s.x0, s.y, s.w, s.floor - s.y, C.sand0); B(s.x0, s.y, s.w, 3, C.sand1); B(s.x0, s.y, s.w, 1, C.sandLit);
      for(let x = s.x0 - ((s.x0 + base) % 29); x < s.x1; x += 29) if(x >= s.x0) B(x, s.y + 5, 3, 1, C.sand1);
      return true;
    case 'hull': case 'refuge': case 'jetty':
      B(s.x0, s.y, s.w, s.floor - s.y, C.wood0); B(s.x0, s.y, s.w, 3, C.wood1); B(s.x0, s.y, s.w, 1, C.woodLit);
      for(let y = s.y + 14; y < s.floor; y += 16) B(s.x0, y, s.w, 1, C.wood1);
      return true;
    case 'float':
      B(s.x0, s.y, s.w, 8, C.wood1); B(s.x0, s.y, s.w, 1, C.woodLit); B(s.x0 + 6, s.y + 8, 6, 6, C.wood0); B(s.x1 - 12, s.y + 8, 6, 6, C.wood0);
      return true;
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api, A = st(api) || {}, t = api.time;
  if(o.type === 'wall' && o.actArt){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = Math.max(-4, WY(o.y)), bot = Math.min(api.bh + 4, WY(o.y - o.h)), w = x1 - x0;
    if(o.actArt === 'coat'){ B(x0, top, w, bot - top, C.wood0); for(let y = top + 6; y < bot; y += 9) B(x0 + 1, y, w - 2, 2, '#1c2a2e'); return true; }   // weed-coated: nothing holds
    if(o.actArt === 'bars'){ const lift = o.gone ? Math.round((bot - top) * .94) : 0; for(let x = x0 + 2; x < x1 - 1; x += 6) B(x, top, 3, bot - top - lift, C.iron); B(x0 - 3, top, w + 6, 3, C.ironLit); return true; }
    return false;
  }
  switch(o.type){
    case 'actRing': if(SH().drawRing){ SH().drawRing(api, o); return true; } return false;
    case 'actBell': {
      const x = WX(o.x), y = WY(o.y), k = K(), ph = k && k.constants.GUARD.phases[A.phase || 0];
      const ringing = A.fight && ph && A.tollT < ph.ring, swing = ringing ? Math.round(Math.sin(t * 18) * 3) : 0;
      B(x - 2, y - 60, 4, 20, C.wood1); B(x - 26, y - 64, 52, 6, C.wood1);
      B(x - 12 + swing, y - 42, 24, 30, '#8a6a30'); B(x - 16 + swing, y - 14, 32, 4, '#a07a38');
      if(ringing) api.glow(x, y - 28, 30, C.gold, .45);
      return true;
    }
    case 'actTunnel': {
      const x = WX(o.x), base = WY(o.y || 0), top = WY((o.y || 0) + o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.wood1); B(x + w, top + r * 4, 10, 4, C.wood1); }
      api.glow(x, base - 60, 60, C.gold, .08);
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 12, y - 3, 24, 3, C.wood1); for(let i = 0; i < 3; i++) B(x - 6 + i * 5, y - 7, 3, 4, i % 2 ? '#ffb060' : '#ffe0a0'); api.glow(x, y - 6, 22, '255,180,100', .3); return true; }
  }
  return false;
}
function water(api, x0w, x1w, level, alpha){
  const { B, WX, WY } = api, t = api.time;
  const x0 = Math.max(0, WX(x0w)), x1 = Math.min(api.bw, WX(x1w)); if(x1 <= x0) return;
  const y = WY(level);
  api.ctx.save(); api.ctx.globalAlpha = alpha;
  B(x0, y, x1 - x0, api.bh - y, C.sea0);
  api.ctx.restore();
  for(let x = x0 - (x0 % 5); x < x1; x += 5) B(x, y + Math.round(2 * Math.sin(t * 2.2 + x * .08)), 4, 2, x % 20 ? C.sea1 : C.foam);
}
/* The gut's water; the tide on the flats; the court's tide; the chain to your hand. */
function world(api){
  const A = st(api), k = K(); if(!A || !k) return;
  const KC = k.constants, p = api.G.p;
  water(api, KC.GUT.x0, KC.GUT.x1, -40, 1);
  water(api, KC.FLATS.x0, KC.FLATS.x1, A.tide, .82);
  // Tide staffs show the high-water limit before the strand floods.
  for(let x=KC.FLATS.x0+60;x<KC.FLATS.x1;x+=900){
    const sx=api.WX(x),high=api.WY(KC.TIDE.high),low=api.WY(0);
    api.B(sx,high,2,low-high,C.foam);api.B(sx-4,api.WY(A.tide),10,2,C.foam);
    for(let h=0;h<=KC.TIDE.high;h+=40)api.B(sx,api.WY(h),6,1,C.foam);
  }
  if(A.fight && KC.GUARD.phases[A.phase].tide) water(api, KC.COURT.x1, KC.COURT.x2, A.court, .78);
  if(p && p.actHook && p.actHook.ring && SH().line) SH().line(api, api.WX(p.x), api.WY(p.y + 30), api.WX(p.actHook.ring.x), api.WY(p.actHook.ring.y), '#6a7078');
}

/* THE SUNGUARD'S ECHO: a tall shield on the side it faces; its back lit gold while a blow there would count. */
function enemy(api, e){
  if(e.actFoe !== 'sunguard') return false;
  const { B, WX, WY } = api, s = n => Math.round(n * api.Z), t = api.time;
  const sh = e.shake > 0 ? Math.round(Math.sin(t * 40) * 2) : 0, x = WX(e.x) + sh, foot = WY(e.y), top = WY(e.y + e.h), f = e.face || -1;
  if(e.st === 'down'){ B(x - s(34), foot - s(10), s(68), s(10), C.guard); B(x - s(10), foot - s(22), s(40), s(12), C.shield); return true; }
  B(x - s(18), top + s(14), s(36), foot - top - s(14), C.guard); B(x - s(12), top, s(24), s(16), C.guard);              // body, helm
  B(x - s(6), top + s(5), s(12), s(3), '#c8b070');                                                                        // visor slit
  const bx = x + f * s(20) - (f < 0 ? s(10) : 0), lean = e.st === 'bash-tell' ? f * s(4) : 0;
  B(bx + lean, top + s(6), s(10), foot - top - s(10), C.shield); B(bx + lean + (f < 0 ? 0 : s(8)), top + s(6), s(2), foot - top - s(10), C.shieldLit);   // the shield
  if(e.st==='bash-tell'){
    const end=WX(e.x+f*(e.w/2+420*.18+30));
    B(Math.min(x,end),foot-2,Math.abs(end-x),2,C.goldHex);
    B(end-1,top,2,foot-top,C.goldHex);
  }
  if(e.tolling){const ph=K().constants.GUARD.phases[st(api).phase];B(x-s(24),top-s(8),s(48)*Math.max(0,1-st(api).tollT/ph.ring),2,C.goldHex);}
  if(e.portalGate === 'melee'){ const rx = x - f * s(18); B(rx - s(1), top + s(14), s(3), foot - top - s(14), C.goldHex); api.glow(rx, (top + foot) / 2, s(26), C.gold, .35); }
  return true;
}
function overlay(api){
  const A = st(api) || {};
  FA.vignette(api, '6,8,10', .5);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(255,240,210,${.14 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
}

ART.register(37, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
