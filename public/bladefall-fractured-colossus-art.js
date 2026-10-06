/* Bladefall — ACT THREE · The Fractured Colossus's art (2026-09-24).

   The Foundry warm again: iron glowing at the seams, the machine's core a slow red. What you must
   read: each mould's state (molten = lava; glass = dark red and the only moment a downward strike sets
   it; stone; set = grey-blue with a quench sheen, and on the bed it warms back toward red before it
   lets go), the spouts, the lava rising in the shaft, the valve, the machine's arm (over the bay it
   means to fill, gathering; along the gantry, sweeping), and its core. */
(function installFracturedColossusArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;

const C = {
  sky:['#080505', '#130a08', '#1f0f0a', '#2c150c'],
  hall0:'#0e0807', hall1:'#170d0a',
  iron0:'#1c1614', iron1:'#2e2420', ironLit:'#5a463a', ironHot:'#7a3a1a',
  lava:'#ff7a2a', lavaLit:'#ffd27a', glass:'#5a1a14', glassLit:'#a0402a', stone:'#4a4442', stoneLit:'#7a706a',
  set:'#56687a', setLit:'#bfe0f0', ember:'255,140,60', core:'255,90,40',
};
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 31 ? A : null; }
const K = () => root.BladefallFracturedColossus;

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
  FA.sky(api, C.sky, 'fcl');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  const { B, bw, Z } = api;
  for(const [par, col, spacing, seed] of [[.15, C.hall0, 280, 6], [.3, C.hall1, 200, 12]]){
    const half = bw / (2 * Z);
    const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
    for(let k = Math.floor(w0 / spacing) - 1; k <= Math.ceil(w1 / spacing) + 1; k++){
      const x = Math.round((k * spacing - api.camX - half) * Z * par + bw / 2), h = 180 + Math.round(api.hash(k, seed) * 220), w = 30 + Math.round(api.hash(k, seed + 1) * 24);
      B(x, horizon - h, w, h + 60, col); B(x - 50, horizon - h * .6, 140, 7, col);
      if(api.hash(k, seed + 2) > .5) api.glow(x + w / 2, horizon - h * .6, 14, C.ember, .1);   // warm again
    }
  }
  FA.ash(api, 'rgba(230,160,120,.16)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function frac(api, o){ const c = o.heatCycle, per = c.period || 4.2; return ((((api.G.time + (c.phase || 0)) % per) + per) % per) / per; }
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z), t = api.time;
  switch(o.actArt){
    case 'foundry':
      B(s.x0, s.y, s.w, s.floor - s.y, C.iron0); B(s.x0, s.y, s.w, 4, C.iron1); B(s.x0, s.y, s.w, 1, C.ironLit);
      for(let x = s.x0 - ((s.x0 + base) % 34); x < s.x1; x += 34) if(x >= s.x0) B(x, s.y + 1, 1, 8, C.hall0);
      FA.seams(api, s, base);
      return true;
    case 'pedestal':
      B(s.x0, s.y, s.w, s.floor - s.y, C.iron1); B(s.x0, s.y, s.w, 1, C.ironLit);
      return true;
    case 'gantry':
      if(o.gone) return true;
      B(s.x0, s.y, s.w, s.floor - s.y, C.iron1); B(s.x0, s.y, s.w, 2, C.ironLit);
      for(let x = s.x0 + 6; x < s.x1; x += 22) B(x, s.y + 3, 2, s.floor - s.y - 3, C.iron0);
      return true;
    case 'mould': {
      if(o.heatSet){                                        // set: quench-grey; warming back on the machine's bed
        const warm = o.fclSetT ? Math.min(1, o.fclSetT / K().constants.SET_HOLDS) : 0;
        B(s.x0, s.y, s.w, s.floor - s.y, C.set); B(s.x0, s.y, s.w, 1, C.setLit);
        if(o.fclBay != null) B(s.x0,s.y-3,s.w*(1-warm),2,C.setLit);
        if(warm > .5) B(s.x0 + 2, s.y + 3, s.w - 4, 2, `rgba(${C.ember},${(warm - .5) * 1.6})`);
        if(o.heatSetT > 0) B(s.x0, s.y - 2, Math.round(s.w * (1 - o.heatSetT / .55)), 2, C.setLit);
        return true;
      }
      const f = frac(api, o), c = o.heatCycle;
      if(f < c.molten){ B(s.x0, s.y + 2, s.w, 5, C.lava); for(let x = s.x0; x < s.x1; x += 7) B(x, s.y + 1 + Math.round(Math.sin(t * 5 + x * .3)), 3, 1, C.lavaLit); return true; }
      if(f < c.set){ B(s.x0,s.y-3,s.w*(c.set-f)/(c.set-c.molten),2,C.lavaLit); B(s.x0, s.y, s.w, s.floor - s.y, C.glass); B(s.x0, s.y, s.w, 1, C.glassLit);
        for(let x = s.x0 + 5; x < s.x1 - 4; x += 13) B(x, s.y + 3, 3, 1, 'rgba(255,200,160,.5)'); return true; }   // glass: strike now
      B(s.x0, s.y, s.w, s.floor - s.y, C.stone); B(s.x0, s.y, s.w, 1, C.stoneLit);
      const warn = f > .82 ? (f - .82) / .18 : 0;
      if(warn > 0) for(let x = s.x0 + 6; x < s.x1 - 4; x += 17) B(x, s.y + 2, 1, s.floor - s.y - 3, `rgba(${C.ember},${.3 + .7 * warn})`);
      return true;
    }
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api, A = st(api), t = api.time;
  if(o.type === 'wall' && o.actArt){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = WY(o.y), bot = WY(o.y - o.h), w = x1 - x0;
    if(o.actArt === 'foundrywall'){ B(x0, top, w, bot - top, C.iron0); B(x0, top, w, 2, C.ironLit); for(let y = top + 10; y < bot; y += 20) B(x0, y, w, 2, C.iron1); return true; }
    if(o.actArt === 'bars'){ const lift = o.gone ? Math.round((bot - top) * .94) : 0; for(let x = x0 + 2; x < x1 - 1; x += 6) B(x, top, 3, bot - top - lift, C.iron1); B(x0 - 3, top, w + 6, 3, C.ironLit); return true; }
    return false;
  }
  switch(o.type){
    case 'actSpout': {
      const x = WX(o.x), top = WY(o.y), bot = WY(0);
      B(x - 14, top - 18, 28, 18, C.iron1); B(x - 14, top - 18, 28, 2, C.ironLit);
      if(o.warn) api.glow(x, top + 4, 14, C.ember, .5);
      if(o.pouring){ B(x - 5, top, 10, bot - top, C.lava); B(x - 2, top, 3, bot - top, C.lavaLit); }
      return true;
    }
    case 'actAnvil': {
      const x = WX(o.x), y = WY(o.y);
      B(x - 34, y - 14, 68, 14, C.iron1); B(x - 22, y - 34, 44, 20, C.iron1); B(x - 40, y - 44, 80, 10, C.iron1); B(x - 40, y - 44, 80, 2, C.ironLit);
      if(!(A && A.strike)) api.glow(x, y - 40, 20, C.ember, .35);
      return true;
    }
    case 'actValve': {
      const x = WX(o.x), y = WY(o.y), open = A && A.valve;
      B(x - 6, y - 26, 12, 26, C.iron1); B(x - 22, y - 32, 44, 8, open ? C.set : C.ironHot); B(x - 22, y - 32, 44, 2, open ? C.setLit : '#c05a2a');
      if(!open) api.glow(x, y - 28, 14, C.ember, .35 + .15 * Math.sin(t * 4));
      return true;
    }
    case 'actLava': {
      if(!A || A.valve && o.y <= K().constants.LAVA.from + 1) return true;
      const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = WY(o.y);
      B(x0, top, x1 - x0, api.bh - top, '#5a1a08');
      for(let x = x0; x < x1; x += 6) B(x, top + Math.round(2 * Math.sin(t * 3 + x * .2)), 4, 2, x % 12 ? C.lava : C.lavaLit);
      api.glow((x0 + x1) / 2, top, (x1 - x0), C.ember, .2);
      return true;
    }
    case 'actTunnel': {
      const x = WX(o.x), base = WY(o.y || 0), top = WY((o.y || 0) + o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.iron1); B(x + w, top + r * 4, 10, 4, C.iron1); }
      api.glow(x, base - 60, 60, '255,190,140', .12);
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 12, y - 3, 24, 3, C.iron1); for(let i = 0; i < 3; i++) B(x - 6 + i * 5, y - 7, 3, 4, i % 2 ? C.lava : C.lavaLit); api.glow(x, y - 6, 22, C.ember, .3); return true; }
  }
  return false;
}
/* The void under the bed and the line; the pour's splash. */
function world(api){
  const A = st(api), k = K(); if(!A || !k) return;
  const { B, WX, WY } = api, t = api.time, G0 = k.constants.GROUND, top = WY(-50);
  for(let i = 0; i < G0.length - 1; i++){
    const a = G0[i][1], b = G0[i + 1][0], x0 = Math.max(0, WX(a)), x1 = Math.min(api.bw, WX(b)); if(x1 <= x0) continue;
    B(x0, top, x1 - x0, api.bh - top, '#2a0e06');
    for(let x = x0 - (x0 % 6); x < x1; x += 6) B(x, top + Math.round(2 * Math.sin(t * 2 + x * .2)), 4, 2, x % 12 ? C.lava : C.lavaLit);
  }
  for(const o of api.G.obstacles) if(o.actArt==='mould' && o.gone) plat(api,o);
  machineTells(api,A);
  for(const a of A.aoes || []){ const x0 = WX(a.x - a.r), x1 = WX(a.x + a.r), y = WY(0); B(x0, y - 18, x1 - x0, 18, `rgba(255,120,40,${Math.min(1, a.t * 2.5)})`); }
}

/* Cues in the world pass remain visible when the hull is outside the camera. */
function machineTells(api,A){
  const e=A.machine; if(!e || !A.fight || e.st==='down') return;
  const {B,WX,WY}=api,k=K().constants,Z=api.Z;
  if(e.st==='gather' && e.bay){
    const b=e.bay,left=WX(b.x-k.W.pour.reach),right=WX(b.x+k.W.pour.reach),floor=WY(0);
    const color=b.heatSet?C.setLit:C.lavaLit;
    B(left,floor-2,right-left,2,color);
    for(const edge of [left,right-1]) B(edge,floor-60*Z,1,60*Z,color);
    const remaining=Math.max(0,1-e.t/k.W.pour.gather);
    B(WX(b.x-b.w/2),WY(80),b.w*Z*remaining,2,color);
    // A plumb line points from the incoming ladle to the selected mould.
    for(let y=WY(250);y<WY(90);y+=10) B(WX(b.x),y,1,4,color);
  }
  if(e.st==='sweep-tell'){
    const left=WX(k.ARENA.x1),right=WX(k.GANTRY.deck.x+k.GANTRY.deck.w/2),y=WY(k.W.sweep.y1);
    B(left,y,right-left,1,C.lavaLit);
    for(let x=left+12;x<right-8;x+=24){B(x,y+5,6,1,C.lavaLit);B(x,y+3,1,5,C.lavaLit);}
  }
  if(A.phase===1 && (e.st==='twin' || e.st==='idle' && e.cool<.7)){
    const x=WX(e.x-50),y=WY(e.y+110),t=e.st==='twin'?e.t/k.W.slug.twin:1-e.cool/.7;
    B(x-12,y+14,24,1,C.ironLit);B(x-12,y+14,24*Math.max(0,Math.min(1,t)),2,C.lavaLit);
    api.glow(x,y,12,C.ember,.5);
  }
  if(A.phase===2){
    const x=WX(e.x),head=WY(e.y+e.h),height=WY(e.y+e.h+k.W.slam.from);
    B(x-12,head,24,2,C.setLit);
    B(x-8,height,16,1,C.setLit);B(x,height,1,6,C.setLit);
  }
}

/* THE WARM MACHINE: a hull of iron plates round a red core; one arm, the ladle. */
function enemy(api, e){
  if(e.actFoe !== 'machine') return false;
  const { B, WX, WY } = api, s = n => Math.round(n * api.Z), t = api.time;
  const A = st(api) || {}, x = WX(e.x), foot = WY(e.y), h = s(160), top = foot - h;
  const down = e.st === 'down', stag = e.st === 'stagger', sh = stag ? Math.round(Math.sin(t * 40) * 2) : 0;
  if(down){ B(x - s(60), foot - s(60), s(120), s(60), C.iron1); B(x - s(60), foot - s(60), s(120), 2, C.ironLit); api.glow(x, foot - s(40), s(20), C.core, .1); return true; }
  // Legs, hull, head.
  B(x - s(46) + sh, foot - s(40), s(30), s(40), C.iron1); B(x + s(16) + sh, foot - s(40), s(30), s(40), C.iron1);
  B(x - s(55) + sh, top + s(40), s(110), h - s(80), C.iron1); B(x - s(55) + sh, top + s(40), s(110), 3, C.ironLit);
  for(let y = top + s(52); y < foot - s(44); y += s(16)) B(x - s(52) + sh, y, s(104), 1, C.iron0);
  B(x - s(30) + sh, top, s(60), s(42), C.iron1); B(x - s(30) + sh, top, s(60), 2, C.ironLit);
  B(x - s(20) + sh, top + s(16), s(40), 4, `rgba(${C.core},${.6 + .3 * Math.sin(t * 3)})`);
  // The core: open (bright) in the second act, when a countered slug can reach it.
  const coreA = A.phase === 1 ? .8 + .2 * Math.sin(t * 6) : .35;
  api.glow(x + sh, foot - s(95), s(24), C.core, coreA * .5); B(x - s(12) + sh, foot - s(108), s(24), s(26), `rgba(${C.core},${coreA})`);
  // The arm: over the bay it means (gathering), or down the gantry (sweeping), or at rest.
  const shoulder = { x:x - s(50), y:top + s(56) };
  let hx = shoulder.x - s(60), hy = shoulder.y - s(20);
  if(e.st === 'gather' || e.st === 'pour'){ const b = e.bay; if(b){ hx = WX(b.x); hy = WY(260); } }
  else if(e.st === 'sweep-tell'){ hx = shoulder.x - s(30); hy = WY(500); }
  else if(e.st === 'sweep'){ hx = WX(e.sweepX); hy = WY(385); }
  const n = Math.max(1, Math.round(Math.hypot(hx - shoulder.x, hy - shoulder.y) / 3));
  for(let i = 0; i <= n; i++) B(Math.round(shoulder.x + (hx - shoulder.x) * i / n) - 3, Math.round(shoulder.y + (hy - shoulder.y) * i / n) - 3, 7, 7, C.iron1);
  B(hx - 14, hy - 8, 28, 16, C.iron1); B(hx - 14, hy - 8, 28, 2, C.ironLit);                    // the ladle
  if(e.st === 'gather'){ const g = Math.min(1, e.t / 1.5); B(hx - 10, hy + 6, 20, 3, `rgba(${C.ember},${.4 + .6 * g})`); api.glow(hx, hy + 10, 10 + 20 * g, C.ember, .5); }
  if(e.st === 'pour'){ B(hx - 5, hy + 8, 10, WY(0) - hy - 8, C.lava); B(hx - 2, hy + 8, 3, WY(0) - hy - 8, C.lavaLit); }
  if(e.st === 'sweep') api.glow(hx, hy, 14, C.ember, .5);
  return true;
}
function overlay(api){
  const A = st(api) || {};
  FA.vignette(api, '12,5,3', .5);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(255,220,180,${.14 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
}

ART.register(31, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
