/* Bladefall — ACT THREE · The Fractured Updrafts' art (2026-09-24).

   Updraft Canyons in a storm at night: basalt walls, rain driven sideways, lightning that shows the
   whole canyon for a moment. What you must read is exact: each column's breath — pale air rising
   on the inhale, dark air pouring down on the exhale, and amber edge warnings for the last 0.45 s
   before it turns. The canyon's teeth hang where the early dash would meet them. */
(function installFracturedUpdraftsArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;

const C = {
  sky:['#04050b', '#0a0d1c', '#161634', '#241a3a'],
  wall0:'#07080e', wall1:'#0d0f18', wall2:'#141724',
  rock0:'#15141c', rock1:'#23212c', rockLit:'#3c3848', seam:'#7a52c8',
  inhale:'200,235,255', exhale:'220,115,155', grate:'#2e3440', grateLit:'#8aa6b4', ember:'#ff9a4a',
  tooth:'#0c0b12', toothTip:'#b8b0c8', iron:'#3a3a44', ironLit:'#6a6a78',
};
const U = () => root.BladefallFracturedUpdrafts;
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 23 ? A : null; }

function draw(phase, api, a){
  switch(phase){
    case 'backdrop': backdrop(api); return true;
    case 'plat': return plat(api, a);
    case 'object': return object(api, a);
    case 'world': world(api); return true;
    case 'enemy': return false;
    case 'overlay': overlay(api); return true;
  }
  return false;
}

/* Lightning: a deterministic storm — a strike every 5–9 s, a double flicker. */
function lightning(t){
  const k = Math.floor(t / 7), start = k * 7 + (Math.sin(k * 12.9898) * 43758.5453 % 1 + 1) % 1 * 2.5, d = t - start;
  if(d < 0 || d > .5) return 0;
  return d < .08 ? 1 : d < .16 ? .2 : d < .24 ? .8 : Math.max(0, 1 - (d - .24) / .26) * .5;
}
function backdrop(api){
  FA.sky(api, C.sky, 'fu');
  const horizon = Math.round(api.groundBy - 30 + api.camYb * .2);
  const L = api.env?.reducedMotion ? 0 : lightning(api.time);
  FA.bands(api, [[.08, L > .5 ? '#1c1a2c' : C.wall0, 220, .003], [.2, L > .5 ? '#22203a' : C.wall1, 170, .005], [.38, C.wall2, 110, .009]], horizon);
  if(L > 0){ api.ctx.fillStyle = `rgba(190,180,255,${.12 * L})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
  if(!api.env?.reducedMotion) FA.ash(api, 'rgba(160,170,210,.2)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep || o.pillar ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0 || o.gone) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'basalt': case 'ledge':
      B(s.x0, s.y, s.w, s.floor - s.y, C.rock0); B(s.x0, s.y, s.w, 4, C.rock1); B(s.x0, s.y, s.w, 1, C.rockLit);
      for(let x = s.x0 - ((s.x0 + base) % 13); x < s.x1; x += 13) if(x >= s.x0) B(x, s.y + 6, 1, Math.min(8, s.floor - s.y - 6), C.rock1);
      FA.seams(api, s, base, C.seam);
      return true;
  }
  return false;
}
function object(api, o){
  switch(o.type){
    case 'updraft': if(o.actArt === 'column'){ drawGrate(api, o); return true; } return false;
    case 'actTeeth': drawTeeth(api, o); return true;
    case 'actHarness': drawHarness(api, o); return true;
    case 'actPlinth': drawPlinth(api, o); return true;
    case 'actTunnel': drawTunnel(api, o); return true;
    case 'actFire': { const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y); B(x - 10, y - 3, 20, 3, '#2a2420'); for(let i = 0; i < 5; i++) B(x - 8 + i * 4, y - 5 - (i % 2), 2, 2, i % 2 ? '#8a3a1e' : C.ember); api.glow(x, y - 6, 24, '255,120,60', .2); return true; }
  }
  return false;
}
function colOf(o){ const u = U(); return u && u.constants.COLUMNS.find(c => c.id === o.fuColumn); }
/* Steady amber edge rails warn along the entire ride, including above the grate. */
function drawGrate(api, o){
  const { B, WX, WY } = api, u = U(), c = colOf(o); if(!u || !c) return;
  const b = u.breath(c, api.G.time), turning = b.left < u.constants.BREATH.tell;
  const x = WX(o.x - o.w / 2), w = Math.round(o.w * api.Z), y = WY(o.y);
  const color = b.inhale ? C.inhale : C.exhale;
  B(x, y - 3, w, 6, C.grate);
  B(x, y - 3, w, 1, turning ? '#ffd18a' : `rgb(${color})`);
  for(let xx = 3; xx < w - 2; xx += 6) B(x + xx, y - 2, 3, 3, `rgb(${color})`);
  const top = WY(o.y + o.h);
  for(const sx of [x - 2, x + w + 1]){
    for(let yy = top; yy < y - 4; yy += 9) B(sx, yy, 1, Math.min(4, y - 4 - yy), `rgba(${color},.5)`);
    if(turning) B(sx, top, 2, Math.max(0, y - 4 - top), '#ffd18a');
  }
  // Repeated arrowheads communicate direction even with motion disabled or the foot off-screen.
  for(let yy = top + 14; yy < y - 12; yy += 32){
    for(let k = 0; k < 4; k++){
      const ay = yy + (b.inhale ? k : -k);
      B(x + w / 2 - k, ay, 1, 1, `rgba(${color},.85)`);
      B(x + w / 2 + k, ay, 1, 1, `rgba(${color},.85)`);
    }
  }
}
function drawTeeth(api, o){
  const { B, WX, WY } = api, x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2);
  const bottom = WY(o.y), top = WY(o.y + 40), depth = bottom - top;
  B(x0, top, x1 - x0, Math.max(1, depth - 8), C.tooth);
  for(let x = x0; x < x1; x += 8){
    for(let k = 0; k < Math.min(8, depth); k++){
      const inset = Math.floor(k / 2), width = Math.min(8 - inset * 2, x1 - x - inset);
      if(width > 0) B(x + inset, bottom - 8 + k, width, 1, k > 5 ? C.toothTip : C.tooth);
    }
  }
}
function drawHarness(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y);
  B(x - 1, y - 90, 3, 90, C.iron); B(x - 24, y - 90, 48, 3, C.ironLit);
  // The straps hang empty: the Pack is gone.
  for(const dx of [-16, 14]){ for(let k = 0; k < 9; k++) B(x + dx + Math.round(Math.sin((api.env?.reducedMotion ? 0 : api.time) * 2 + k * .4 + dx) * (k / 4)), y - 86 + k * 4, 2, 3, '#5a4a3a'); }
}
function drawPlinth(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y);
  B(x - 22, y - 30, 44, 30, C.rock1); B(x - 26, y - 34, 52, 4, C.rockLit); B(x - 6, y - 40, 12, 6, '#1a1824');
  api.glow(x, y - 40, 20, '140,100,220', .12);   // where the Linked Portal waited: nothing now
}
function drawTunnel(api, o){
  const { B, WX, WY } = api, x = WX(o.x), base = WY(0), top = WY(o.h);
  for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.rock1); B(x + w, top + r * 4, 10, 4, C.rock1); }
  api.glow(x, base - 60, 60, '200,220,255', .1);
}

/* The air itself, in the columns: rising pale streaks on the inhale, dark ones pouring down on the exhale. */
function world(api){
  const u = U(); if(!u) return;
  const { B, WX, WY, ctx } = api, t = api.env?.reducedMotion ? 0 : api.time;
  for(const c of u.constants.COLUMNS){
    const x0 = WX(c.x - c.w / 2), x1 = WX(c.x + c.w / 2); if(x1 < -20 || x0 > api.bw + 20) continue;
    const yb = WY(c.y), yt = WY(c.y + c.h), h = yb - yt, b = u.breath(c, api.G.time);
    const g = ctx.createLinearGradient(0, yt, 0, yb);
    g.addColorStop(0, `rgba(${b.inhale ? C.inhale : C.exhale},0)`); g.addColorStop(1, `rgba(${b.inhale ? C.inhale : C.exhale},${b.inhale ? .11 : .13})`);
    ctx.fillStyle = g; ctx.fillRect(x0, yt, x1 - x0, h);
    for(let i = 0; i < 16; i++){
      const q = ((t * (b.inhale ? .55 : 1.1) + i * .0625 + api.hash(i, c.x) * .3) % 1), sx = x0 + 3 + Math.round(api.hash(i, 7 + c.x) * (x1 - x0 - 6));
      const sy = b.inhale ? yb - q * h : yt + q * h;
      B(sx, Math.round(sy), 1, b.inhale ? 5 : 7, `rgba(${b.inhale ? C.inhale : C.exhale},${(b.inhale ? .65 : .7) * (1 - Math.abs(q - .5))})`);
    }
  }
}
function overlay(api){
  const A = st(api) || {};
  const { ctx, bw, bh } = api, t = api.env?.reducedMotion ? 0 : api.time;
  // Rain, driven east to west.
  ctx.fillStyle = 'rgba(150,160,200,.22)';
  for(let i = 0; i < 70; i++){ const x = ((i * 137 - t * 260) % (bw + 60) + bw + 60) % (bw + 60) - 30, y = ((i * 89 + t * 520) % (bh + 40)) - 20; ctx.fillRect(Math.round(x), Math.round(y), 1, 6); ctx.fillRect(Math.round(x) - 1, Math.round(y) + 6, 1, 3); }
  FA.vignette(api, '4,4,12', .6);
  const L = api.env?.reducedMotion ? 0 : lightning(t); if(L > .3){ ctx.fillStyle = `rgba(220,215,255,${.1 * L})`; ctx.fillRect(0, 0, bw, bh); }
  const flash = api.env?.reducedMotion ? 0 : Math.min(1, A.flash || 0);
  if(flash > .02){ ctx.fillStyle = `rgba(220,240,255,${.16 * flash})`; ctx.fillRect(0, 0, bw, bh); }
}

ART.register(23, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
