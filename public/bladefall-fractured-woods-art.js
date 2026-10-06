/* Bladefall — ACT THREE · The Fractured Woods' art (2026-09-24).

   Black Woods after the Echo: dead trunks against a violet night, fog in the hollows, the
   refuge's lanterns out. What you must read is warm and exact: the resin on a branch's edge
   (amber), the streamers that show the wind, the counterweight, the blade in the stump. The
   lie is a branch with no resin at all. */
(function installFracturedWoodsArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;

const C = {
  sky:['#05060c', '#0c1020', '#1a1430', '#2a1a34'],
  trunk0:'#07080d', trunk1:'#0e1016', trunk2:'#151722',
  loam0:'#15131a', loam1:'#221e28', loamLit:'#3a3444', moss:'#2e3a2c',
  bark0:'#241c18', bark1:'#3a2c24', barkLit:'#5c4636', resin:'#e0a040', resinLit:'#ffd27a',
  root0:'#1c1614', root1:'#2e241e', iron:'#3a3a44', ironLit:'#6a6a78', blade:'#dff6ff', fog:'150,120,200',
};
const L = () => root.BladefallFracturedWoods && root.BladefallFracturedWoods.constants;
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 22 ? A : null; }

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

function backdrop(api){
  FA.sky(api, C.sky, 'fw');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  FA.bands(api, [[.1, C.trunk0, 60, .004]], horizon);
  // Dead trunks, three depths, with their bare limbs.
  trunks(api, .16, C.trunk0, 150, 3, 6, horizon, 31);
  trunks(api, .3, C.trunk1, 190, 5, 9, horizon, 47);
  // Fog lying in the hollows.
  const { ctx, bw } = api, t = api.time;
  for(let i = 0; i < 5; i++){ const g = ctx.createLinearGradient(0, horizon - 40 - i * 8, 0, horizon + 20); g.addColorStop(0, `rgba(${C.fog},0)`); g.addColorStop(1, `rgba(${C.fog},.08)`); ctx.fillStyle = g; ctx.fillRect(((i * 170 + t * 6) % (bw + 200)) - 200, horizon - 40 - i * 8, 260, 60 + i * 8); }
  trunks(api, .52, C.trunk2, 260, 8, 14, horizon, 59);
  FA.ash(api, 'rgba(170,160,200,.25)');
}
/* A stand of dead trees at one parallax depth: world-spaced so they slide, each with two or three limbs. */
function trunks(api, par, col, spacing, wmin, wmax, horizon, seed){
  const { B, ctx, bw, bh, Z } = api, half = bw / (2 * Z);
  const toS = wx => Math.round((wx - api.camX - half) * Z * par + bw / 2);
  const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
  ctx.strokeStyle = col;
  for(let k = Math.floor(w0 / spacing) - 1; k <= Math.ceil(w1 / spacing) + 1; k++){
    const h1 = api.hash(k, seed), h2 = api.hash(k, seed + 1), h3 = api.hash(k, seed + 2);
    const x = toS(k * spacing + h1 * spacing * .6), w = Math.round(wmin + h2 * (wmax - wmin));
    const top = Math.round(horizon - bh * (.35 + .6 * h3) * (.6 + par));
    B(x - (w >> 1), top, w, bh - top, col); B(x - (w >> 2), top - 30 * par, Math.max(2, w >> 1), 30 * par + 1, col);
    ctx.lineWidth = Math.max(1, Math.round(w / 3));
    for(let b = 0; b < 3; b++){
      const hb = api.hash(k * 7 + b, seed + 3); if(hb < .3) continue;
      const y = top + (horizon - top) * (.12 + .22 * b), side = (b + k) % 2 ? 1 : -1, len = (14 + hb * 40) * (.5 + par);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + side * len, y - len * .7); ctx.lineTo(x + side * len * 1.2, y - len * .6); ctx.stroke();
    }
  }
}

function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))), left:api.WX(o.x - o.w / 2), right:api.WX(o.x + o.w / 2) };
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z), A = st(api);
  switch(o.actArt){
    case 'loam':
      if(o.gone) return true;
      B(s.x0, s.y, s.w, s.floor - s.y, C.loam0); B(s.x0, s.y, s.w, 5, C.loam1); B(s.x0, s.y, s.w, 1, C.loamLit);
      for(let x = s.x0 - ((s.x0 + base) % 11); x < s.x1; x += 11) if(x >= s.x0) B(x, s.y - 2, 2, 2, C.moss);
      FA.seams(api, s, base);
      return true;
    case 'bough': case 'root-step': case 'crown': case 'counterweight':
      if(o.gone) return true;
      B(s.x0, s.y, s.w, 6, o.actArt === 'root-step' ? C.root1 : C.bark1); B(s.x0, s.y, s.w, 1, C.barkLit); B(s.x0, s.y + 6, s.w, 2, C.bark0);
      if(o.crumble){
        for(let x = s.x0 + 3; x < s.x1 - 3; x += 7) B(x, s.y + 1, 1, 4, o.crT > 0 ? C.resinLit : C.bark0);
        if(o.crT > 0) B(s.x0, s.y, s.w * Math.max(0, o.crT / (o.crDur || .45)), 1, C.resinLit);
      }
      if(o.actArt === 'counterweight'){
        const cx = Math.round((s.x0 + s.x1) / 2), drop = Math.round(12 * (A && A.release || 0));
        // The pressure surface stays level; the weight underneath sinks and pulls
        // the root cable. No decorative block pretends to obstruct the landing.
        B(s.x0, s.y, s.w, 2, C.resinLit);
        B(cx - 13, s.y + 12 + drop, 26, 24, C.iron); B(cx - 13, s.y + 12 + drop, 26, 2, C.ironLit);
        B(cx - 8, s.y + 4, 2, 9 + drop, C.ironLit); B(cx + 6, s.y + 4, 2, 9 + drop, C.ironLit);
      }
      if(o.actArt === 'crown'){ B(s.x0, s.y, s.w, 2, C.resinLit); api.glow((s.x0 + s.x1) / 2, s.y, 30, '255,220,160', .2); }
      return true;
    case 'branch': {
      // Drawn even when it will not hold: that is the lie. Resin is amber on its edge; the wind
      // blowing against the resin is what makes it hold. A held branch is solid bark with lit
      // resin; a hollow one is a ghost of itself. As the wind is about to turn, the branches it
      // will harden stir, and the ones it will drop shiver — the resinless never stir at all.
      const held = !o.gone, left = s.left, right = s.right, ctx = api.ctx;
      const turning = A && A.warn && o.resin !== 'B' && o.resin !== 'N';
      const reduced = !!(api.env && api.env.reducedMotion);
      const jx = turning && held && !reduced ? Math.round(Math.sin(api.time * 40)) : 0;
      const alpha = held ? 1 : turning ? .85 : o.resin === 'N' ? .22 : .48;
      ctx.save(); ctx.globalAlpha = alpha;
      if(held){ B(s.x0 + jx, s.y, s.w, 5, C.bark1); B(s.x0 + jx, s.y, s.w, 1, C.barkLit); B(s.x0 + jx, s.y + 5, s.w, 2, C.bark0); }
      else {
        // Broken outlines cannot be mistaken for a solid top. Incoming branches
        // acquire a bright dotted rim before turning solid on the wind change.
        for(let x = s.x0; x < s.x1; x += 6) B(x, s.y, Math.min(3, s.x1 - x), 1, turning ? C.resinLit : C.barkLit);
        B(s.x0, s.y + 5, s.w, 1, C.barkLit); B(s.x0, s.y, 1, 6, C.barkLit); B(s.x1 - 1, s.y, 1, 6, C.barkLit);
      }
      if(held && o.resin !== 'N'){
        const remaining = turning ? Math.max(0, (L().THICKET.period - A.windT) / L().THICKET.warn) : 1;
        B(s.x0, s.y, s.w * remaining, 1, o.resin === 'B' ? C.resinLit : C.resin);
        if(o.resin === 'B') for(let x = s.x0 + 3; x < s.x1; x += 8) B(x, s.y + 3, 2, 1, C.resin);
      }
      const resinAt = (x) => { B(x, s.y - 2, 4, 8, held ? C.resin : '#7a5a34'); B(x + 1, s.y - 1, 2, 3, held ? C.resinLit : C.resin); };
      if(o.resin === 'E' || o.resin === 'B') resinAt(right - 5 + jx);
      if(o.resin === 'W' || o.resin === 'B') resinAt(left + 1 + jx);
      ctx.restore();
      if(held && o.resin !== 'N'){ if(o.resin === 'E' || o.resin === 'B') api.glow(right - 3, s.y + 2, 7, '240,180,90', .45); if(o.resin === 'W' || o.resin === 'B') api.glow(left + 3, s.y + 2, 7, '240,180,90', .45); }
      return true;
    }
  }
  return false;
}

function object(api, o){
  switch(o.type){
    case 'spikes': if(o.fracturedThorns){ drawThorns(api, o); return true; } return false;
    case 'actStump': drawStump(api, o); return true;
    case 'actStreamer': drawStreamer(api, o); return true;
    case 'actClock': drawClock(api, o); return true;
    case 'actTunnel': drawTunnel(api, o); return true;
    case 'actFire': { const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y); B(x - 10, y - 3, 20, 3, '#2a2420'); for(let i = 0; i < 5; i++) B(x - 8 + i * 4, y - 5 - (i % 2), 2, 2, i % 2 ? '#8a3a1e' : '#ff8a3a'); api.glow(x, y - 6, 24, '255,120,60', .2); return true; }
  }
  return false;
}
function drawStump(api, o){
  const { B, WX, WY } = api, A = st(api), x = WX(o.x), y = WY(0);
  // A broken trunk: flared at the foot, a jagged top, the grain in dark lines.
  for(let r = 0; r < 30; r++){ const w = 17 + Math.round(Math.max(0, 8 - r) * 1.6); B(x - w, y - r, w * 2, 1, r > 27 ? C.barkLit : C.bark1); }
  for(let k = -2; k <= 2; k++) B(x + k * 7, y - 30 - (Math.abs(k * 7 + 3) % 5), 5, 4 + (Math.abs(k * 13) % 5), C.bark1);
  for(let k = -2; k <= 2; k++) B(x + k * 6, y - 24, 1, 20, C.bark0);
  for(const [dx, len] of [[-30, 18], [-24, 10], [24, 12], [30, 16]]) for(let i = 0; i < len; i++) B(x + dx + Math.sign(dx) * i, y - 3 + (i >> 3), 3, 3, C.root1);
  if(A && A.armed) return;
  // The Oathblade, root-bound until the counterweight is stood on.
  B(x - 1, y - 60, 3, 36, C.blade); B(x - 6, y - 30, 13, 2, '#9a8a6a'); api.glow(x, y - 44, 14, '200,240,255', .3);
  const released = A && A.roots ? (A.release == null ? 1 : A.release) : 0;
  if(released < 1) for(let k = 0; k < 5; k++) B(x - 6 + (k % 3) * 4 + (k % 2 ? 1 : -1) * released * 15, y - 32 - k * 5 + released * 18, 8, 2, C.root1);
  if(A && A.roots) api.glow(x, y - 45, 22, '200,240,255', .4);
}
function drawThorns(api, o){
  const {B, WX, WY} = api, state = root.BladefallFracturedWoods.thornState(o, api.G.time);
  const left=WX(o.x-o.w/2), right=WX(o.x+o.w/2), floor=WY(o.y);
  B(left, floor, right-left, 4, C.root1);
  // The actual bite is 24 units high. Warning buds stay below that silhouette;
  // down beds flatten into root knots and can be walked.
  const height=state.up ? 24*api.Z : state.warn ? (3+6*state.growth)*api.Z : 2;
  for(let x=left+2;x<right-2;x+=7){
    for(let y=0;y<height;y++) B(x+Math.floor(y/5),floor-y,Math.max(1,4-y/3),1,state.up ? '#b58696' : state.warn ? C.resinLit : C.root1);
  }
  if(state.warn) for(let x=left;x<right;x+=8) B(x,floor-1,4,1,C.resin);
}
function drawStreamer(api, o){
  const { B, WX, WY, ctx } = api, A = st(api), x = WX(o.x), base = WY(o.y), top = WY(o.y + o.h), t = api.time;
  B(x - 1, top, 3, base - top, C.bark1);
  const dir = A && A.wind === 'E' ? -1 : 1, flutter = api.env && api.env.reducedMotion ? 0 : A && A.warn ? Math.sin(t * 40) * 3 : Math.sin(t * 5) * 1;
  // The ribbon blows the way the wind goes: from the east, it streams west.
  for(let r = 0; r < 3; r++){ const y = top + 6 + r * 10; ctx.strokeStyle = r % 2 ? '#c95a4a' : '#e0c080'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + dir * 14, y + flutter, x + dir * 30, y + 2 + flutter * 1.5); ctx.stroke(); }
  if(A && A.warn) api.glow(x, top + 16, 16, '255,210,140', .35);
}
function drawClock(api, o){
  const { B, WX, WY, ctx } = api, x = WX(o.x), y = WY(60);
  B(x - 2, y, 4, WY(0) - y, C.bark1);
  ctx.fillStyle = '#2a2830'; ctx.beginPath(); ctx.arc(x, y - 8, 9, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#9a8a6a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x + 5, y - 5); ctx.moveTo(x, y - 8); ctx.lineTo(x - 1, y - 15); ctx.stroke();   // twenty to four
}
function drawTunnel(api, o){
  const { B, WX, WY } = api, x = WX(o.x), base = WY(0), top = WY(o.h);
  for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.root1); B(x + w, top + r * 4, 10, 4, C.root1); }
  api.glow(x, base - 60, 60, '200,255,220', .12);
}

function world(api){
  const A=st(api), k=L(); if(!A||!k) return;
  const {B,WX,WY}=api, from=k.COUNTERWEIGHT, to=k.STUMP_X;
  if(WX(to)<-30||WX(from.x)>api.bw+30)return;
  const release=A.roots?(A.release==null?1:A.release):0;
  // A root tendon descends from the loaded weight into the sword's binding.
  for(let i=0;i<=64;i++){
    const q=i/64,x=from.x+(to-from.x)*q,y=from.y-50-(from.y-85)*q-30*Math.sin(q*Math.PI);
    B(WX(x),WY(y),3,2,q<=release&&A.roots?C.resin:C.root1);
  }
}
/* The wind you can see anywhere on screen: leaves carried the way it blows, harder as it is about to turn. */
const LEAVES = Array.from({ length:54 }, (_, i) => ({ x:(i * 97) % 997 / 997, y:(i * 61) % 613 / 613, v:.6 + (i % 5) * .15, ph:i * 1.7 }));
function leaves(api, A){
  const { B, bw, bh } = api, K = L(), p = api.G.p;
  const near = K && p && p.x > K.THICKET.x1 - 700 && p.x < K.THICKET.x2 + 500;
  const n = near ? LEAVES.length : 18, dir = A.wind === 'E' ? -1 : 1, gust = A.warn ? 1.9 : 1, dt = api.env && api.env.reducedMotion ? 0 : Math.min(.05, api.dt || 0);
  for(let i = 0; i < LEAVES.length; i++){
    const l = LEAVES[i];
    l.x = (l.x + dir * l.v * gust * dt * .55 + 1) % 1;
    if(i >= n) continue;
    const sway = api.env && api.env.reducedMotion ? 0 : Math.sin(api.time * 3 + l.ph) * 6 * gust;
    const x = Math.round(l.x * (bw + 40)) - 20, y = Math.round(l.y * bh + sway);
    B(x, y, 3, 1, i % 3 ? '#8a6a4a' : '#b08a5a'); B(x + (dir > 0 ? -2 : 3), y + 1, 2, 1, 'rgba(120,90,60,.6)');
  }
}
function overlay(api){
  const A = st(api) || {};
  if(A.wind) leaves(api, A);
  FA.vignette(api, '6,6,14', .55);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(220,240,255,${.16 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
}

ART.register(22, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
