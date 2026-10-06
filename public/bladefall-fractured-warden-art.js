/* Bladefall — ACT THREE · The Fractured Warden's art (2026-09-24).

   The Gaol with every lamp lit and no one inside, except in the Blind Gallery, which is dark. There
   the only lights are your own and the turnkeys' lanterns, and the gaol hounds show nothing but their
   eyes. Things you must read: the bars (they lift), the pale slate (a mouth holds there), the cage and
   its chain, the turning bars, the thin air of the Engine (motes that rise too slowly), and the
   Sentence's shield, which is toward you, or all round it, or gone. */
(function installFracturedWardenArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;

const C = {
  sky:['#07050a', '#110c16', '#1b1322', '#26192c'],
  hall0:'#0d0a12', hall1:'#150f1b', hall2:'#1e1626',
  flag0:'#1a1420', flag1:'#2a2031', flagLit:'#46384e', joint:'#0f0b13',
  stone0:'#241b2a', stone1:'#35283d', stoneLit:'#5a4862',
  iron:'#4e4558', ironLit:'#927b91', dark:'#201927', brass:'#b79a73', brassLit:'#e3c48f',
  slate0:'#3e4450', slate1:'#5a6272', slateLit:'#8a94a8', rune:'159,214,255',
  lamp:'255,210,140', thin:'158,216,223', ward:'#b395ca', cloth:'#4a3450', pale:'#c9b8d8',
};
const W = () => root.BladefallFracturedWarden;
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 27 ? A : null; }

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
  FA.sky(api, C.sky, 'fwd');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  const { B, bw, Z } = api;
  // The Gaol's tiers: galleries of cell arches at two depths, each arch barred, every one of them empty.
  for(const [par, col, spacing, rows, seed] of [[.16, C.hall0, 150, 5, 7], [.32, C.hall1, 110, 3, 19]]){
    const half = bw / (2 * Z);
    const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
    B(0, horizon - rows * 70 - 40, bw, rows * 70 + 100, col);
    for(let k = Math.floor(w0 / spacing) - 1; k <= Math.ceil(w1 / spacing) + 1; k++){
      const x = Math.round((k * spacing - api.camX - half) * Z * par + bw / 2);
      for(let r = 0; r < rows; r++){
        const y = horizon - 30 - r * 70, aw = Math.round(spacing * par * .5), ah = 40;
        B(x - aw / 2, y - ah, aw, ah, '#060409');
        for(let b = 2; b < aw - 1; b += 4) B(x - aw / 2 + b, y - ah + 4, 1, ah - 4, C.hall2);
        if(api.hash(k * 7 + r, seed) > .8) api.glow(x, y - ah / 2, 10, C.lamp, .08);        // a lamp, lit, for no one
        B(x - aw / 2 - 3, y, aw + 6, 3, C.hall2);
      }
    }
  }
  FA.ash(api, 'rgba(200,180,220,.14)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function slateTop(api, s){
  const { B } = api;
  B(s.x0, s.y - 1, s.w, 5, C.slate1); B(s.x0, s.y - 1, s.w, 1, C.slateLit);
  for(let x = s.x0 + 4; x < s.x1 - 4; x += 11) B(x, s.y + 1, 5, 1, `rgba(${C.rune},${.35 + .2 * Math.sin(api.time * 2 + x * .1)})`);
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0 || o.gone) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'gaol':
      B(s.x0, s.y, s.w, s.floor - s.y, C.flag0); B(s.x0, s.y, s.w, 4, C.flag1); B(s.x0, s.y, s.w, 1, C.flagLit);
      for(let x = s.x0 - ((s.x0 + base) % 38); x < s.x1; x += 38) if(x >= s.x0) B(x, s.y + 1, 1, 7, C.joint);
      FA.seams(api, s, base);
      return true;
    case 'roof': {
      // A lintel of black stone, studded; its underside is where your head stops.
      B(s.x0, s.y, s.w, s.floor - s.y, C.stone0); B(s.x0, s.floor - 2, s.w, 2, C.stone1);
      for(let x = s.x0 - ((s.x0 + base) % 30) + 6; x < s.x1; x += 30) if(x >= s.x0) B(x, s.floor - 5, 2, 2, C.ironLit);
      B(s.x0, api.WY(1700), s.w, s.y - api.WY(1700), C.hall1);                                  // the gallery above, stone to the top
      return true;
    }
    case 'brace':
      B(s.x0, s.y, s.w, s.floor - s.y, C.stone0); B(s.x0, s.y, s.w, 3, C.stone1); B(s.x0, s.y, s.w, 1, C.stoneLit);
      B(s.x0 + 3, s.floor - 3, s.w - 6, 2, C.iron); B(s.x0 + 2, s.y + 3, 2, s.floor - s.y - 3, C.iron); B(s.x1 - 4, s.y + 3, 2, s.floor - s.y - 3, C.iron);
      return true;
    case 'slate':
      slateTop(api, s);
      return true;
    case 'cage': {
      // The cage: an iron floor with a slate deck, posts and a crown bar, hung on its chain.
      const top = s.y - Math.round(64 * api.Z);
      B(s.x0, s.y + 3, s.w, 6, C.iron); B(s.x0, s.y + 8, s.w, 1, C.dark);
      slateTop(api, s);
      for(const x of [s.x0, s.x1 - 3]) B(x, top, 3, s.y - top, C.iron);
      B(s.x0, top, s.w, 3, C.ironLit);
      for(let x = s.x0 + 10; x < s.x1 - 8; x += 12) B(x, top + 3, 1, 10, C.iron);
      return true;
    }
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api, A = st(api);
  if(o.type === 'wall' && o.actArt){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = WY(o.y), bot = WY(o.y - o.h), w = x1 - x0;
    switch(o.actArt){
      case 'gaolwall':
        B(x0, top, w, bot - top, C.stone0); B(x0, top, w, 2, C.stoneLit); B(x0, top, 1, bot - top, C.stone1); B(x1 - 1, top, 1, bot - top, C.stone1);
        for(let y = top + 14; y < bot; y += 16) B(x0, y, w, 1, C.hall2);
        return true;
      case 'bars': {
        const lift = o.gone ? Math.round((bot - top) * .92) : 0;
        for(let x = x0 + 2; x < x1 - 1; x += 6) B(x, top, 3, bot - top - lift, C.iron);
        B(x0 - 3, top, w + 6, 3, C.ironLit);
        if(!o.gone && o.actBars && o.actBars.startsWith('bay')) B((x0 + x1) / 2 - 2, (top + bot) / 2 - 3, 5, 6, C.brass);   // the lock
        return true;
      }
    }
    return false;
  }
  if(o.type === 'rotor' && o.actArt === 'bar'){
    if(o.x1 == null) return true;
    const ax = WX(o.x1), ay = WY(o.y1), bx = WX(o.x2), by = WY(o.y2), th = Math.max(3, Math.round((o.thickness || 8) * api.Z * 1.6));
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay)));
    for(let i = 0; i <= n; i += 1){ const x = ax + (bx - ax) * i / n, y = ay + (by - ay) * i / n; B(x - th / 2, y - th / 2, th, th, (i % 10) < 5 ? C.iron : '#5e3a3a'); }
    for(const [xx, yy] of [[ax, ay], [bx, by]]){ B(xx - 3, yy - 3, 6, 6, '#c8a282'); B(xx - 1, yy - 1, 2, 2, '#f0c8a0'); }
    const hx = WX(o.x), hy = WY(o.y); B(hx - 5, hy - 5, 10, 10, C.brass); B(hx - 2, hy - 2, 4, 4, C.dark);
    return true;
  }
  if(o.type === 'lowg' && o.actArt === 'thin'){
    // Thin air: motes rising too slowly, and nothing else to see.
    const x = WX(o.x), y = WY(o.y), r = o.r * api.Z;
    for(let i = 0; i < 46; i++){
      const xx = (api.hash(i, 31) * 2 - 1) * r * .95, sp = Math.sqrt(Math.max(0, r * r - xx * xx)), t = (api.time * .05 + i * .137) % 1;
      const a = Math.sin(t * Math.PI) * .5;
      B(x + xx, y + sp * (1 - 2 * t), 1, 2, `rgba(${C.thin},${a})`);
    }
    return true;
  }
  switch(o.type){
    case 'actTunnel': {
      const x = WX(o.x), base = WY(0), top = WY(o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.stone1); B(x + w, top + r * 4, 10, 4, C.stone1); }
      api.glow(x, base - 60, 60, '220,230,255', .12);
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 12, y - 3, 24, 3, '#2a2226'); for(let i = 0; i < 4; i++) B(x - 8 + i * 5, y - 4, 2, 1, '#4a2a2a'); return true; }   // the vigil fire, cold
  }
  return false;
}
/* The cage's chain, up out of sight. */
function world(api){
  const A = st(api); if(!A) return;
  const c = api.G.obstacles.find(o => o.fwCage); if(!c) return;
  const { B, WX, WY } = api, top = WY(c.y) - Math.round(64 * api.Z), x = WX(c.x);
  for(let y = top - 4; y > -10; y -= 7) B(x - 1, y, 2, 4, C.iron);
  B(x - 4, top - 4, 8, 4, C.ironLit);
  // A hoist scale marks the high portion of the ride, not the time to release a fall.
  const cell = W().constants.CELL, rail = WX(c.x + c.w / 2 + 18);
  const bottom = WY(cell.cage.y - cell.cage.dy), peak = WY(cell.cage.y + cell.cage.dy), high = WY(345);
  B(rail, peak, 1, bottom - peak, C.iron); B(rail - 1, peak, 3, high - peak, C.brassLit);
  B(rail - 3, WY(c.y), 7, 2, '#9fd6ff');
  if(c.y >= 345) B(WX(c.x-c.w/2),WY(c.y),c.w*api.Z,1,C.brassLit);
}

/* THE SENTENCE: a warden's armour with no one in it, a shield the height of a door. */
function enemy(api, e){
  if(e.actFoe !== 'sentence') return false;
  const { B, WX, WY } = api, Z = api.Z, t = api.time, fl = e.hitFlash > 0;
  const x = WX(e.x), foot = WY(e.y), f = e.dir || e.face || -1, sf = e.shieldFace || f;
  const s = n => Math.round(n * Z);
  const body = fl ? '#f0e6ff' : C.iron, lit = fl ? '#ffffff' : C.ironLit, cloth = C.cloth;
  if(e.st === 'thrown' || e.st === 'crashed'){
    // On its back: the armour flat, the shield flung off beside it.
    const y = foot - s(e.st === 'thrown' ? 30 : 16);
    B(x - s(40), y, s(80), s(16), body); B(x - s(40), y, s(80), 2, lit); B(x - s(44), y + s(2), s(10), s(12), C.dark);
    B(x + s(46), foot - s(8), s(34), s(8), C.brass); B(x + s(46), foot - s(8), s(34), 1, C.brassLit);
    if(e.st === 'crashed') for(let k = 0; k < 3; k++) B(x - s(10) + ((t * 30 + k * 11) % s(24)), y - s(8) - k * 2, 2, 2, C.pale);
    return true;
  }
  if(e.st === 'done'){
    B(x - s(18), foot - s(40), s(36), s(40), body); B(x - s(18), foot - s(40), s(36), 2, lit);
    B(x - s(34), foot - s(6), s(68), s(6), C.brass);                                          // the shield, face down
    return true;
  }
  const crouch = e.st === 'rush-tell' || e.st === 'slam-tell' || e.st === 'pronounce' ? s(6) : 0;
  const lean = e.st === 'rush' || e.st === 'sentence' ? f * s(8) : 0, h = s(88) - crouch, top = foot - h;
  // Greaves, the hauberk, the pauldrons, the helm with nothing in the slit.
  B(x - s(16), foot - s(24), s(12), s(24), body); B(x + s(4), foot - s(24), s(12), s(24), body);
  for(let r = 0; r < h - s(24); r++){ const w = s(20) - Math.round(Math.abs(r - (h - s(24)) * .55) * .15); B(x - w + Math.round(lean * r / h), foot - s(24) - r, w * 2, 1, r % 9 === 0 ? lit : cloth); }
  const hx = x + lean;
  B(hx - s(26), top + s(10), s(14), s(10), body); B(hx + s(12), top + s(10), s(14), s(10), body);
  B(hx - s(10), top - s(6), s(20), s(18), body); B(hx - s(10), top - s(6), s(20), 2, lit);
  B(hx - s(6), top + s(2), s(12), 2, '#050307');
  // The shield: the height of a door, on the side it faces.
  const sx = hx + sf * s(28), sh = s(76), sy = foot - sh - (e.st === 'pronounce' ? s(24) : 0);
  B(sx - s(6), sy, s(12), sh, C.brass); B(sx + (sf > 0 ? s(4) : -s(6)), sy, 2, sh, C.brassLit); B(sx - s(4), sy + sh / 2 - 2, s(8), 4, C.dark);
  // Pronounced: shielded all round — a ring of pale shields turning about it.
  const all = e.portalGate === 'sentence-never' && e.st !== 'wait';
  if(all){ for(let k = 0; k < 8; k++){ const a = t * 1.6 + k * .785, rx = Math.cos(a) * s(46), ry = Math.sin(a) * s(52);
    B(x + rx - 2, foot - s(46) + ry - 4, 4, 8, `rgba(201,184,216,${.35 + .25 * Math.sin(a * 2)})`); } }
  if(e.st === 'rush-tell' && Math.floor(e.t * 10) % 2 === 0) for(let k = 0; k < 6; k++) B(x - f * (s(20) + k * 5), foot - 1 - (k % 2), 3, 1, C.pale);
  return true;
}

let dark = null;
function darkness(api, A){
  const p = api.G.p; if(!p || typeof document === 'undefined') return;
  const s = p.x < 3500 ? 1 : p.x > 3900 ? 0 : (3900 - p.x) / 400; if(s <= 0) return;
  const w = Math.ceil(api.bw), h = Math.ceil(api.bh);
  if(!dark || dark.width !== w || dark.height !== h){ dark = document.createElement('canvas'); dark.width = w; dark.height = h; }
  const c = dark.getContext('2d'); if(!c) return;
  c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, w, h);
  c.fillStyle = `rgba(4,3,8,${.9 * s})`; c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r) => { const g = c.createRadialGradient(x, y, r * .3, x, y, r); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); };
  hole(api.WX(p.x), api.WY(p.y + 22), 230 * api.Z);
  const lamps = api.G.enemies.filter(e => !e.dead && e.wardenRole === 'turnkey');
  for(const e of lamps) hole(api.WX(e.x + (e.face || -1) * 12), api.WY(e.y + 26), (150 + 8 * Math.sin(api.time * 9 + e.x)) * api.Z);
  c.globalCompositeOperation = 'source-over';
  api.ctx.drawImage(dark, 0, 0);
  // The lanterns themselves, and the hounds' eyes, over the dark.
  const { B, WX, WY } = api;
  for(const e of lamps){ const x = WX(e.x + (e.face || -1) * 12), y = WY(e.y + 26); B(x - 2, y - 3, 5, 6, C.brass); B(x - 1, y - 1, 3, 3, '#ffe0a8'); api.glow(x, y, 12, C.lamp, .4);
    if(e.wardenState === 'windup'){
      const dir=e.wardenCommitDir||e.face||1, fy=WY(e.y);
      B(x-4,y-5,9,1,C.brassLit); B(x-4,y+4,9,1,C.brassLit);
      for(let k=1;k<=3;k++) B(WX(e.x+dir*(18+k*14)),fy-3,k+1,2,C.brassLit);
    }
    if(e.wardenState === 'recover') B(WX(e.x-(e.face||1)*(e.w/2+3)),WY(e.y+30),1,24*api.Z,C.brassLit);
  }
  for(const e of api.G.enemies) if(!e.dead && e.wardenRole === 'gaol-hound'){ const x = WX(e.x + (e.face || 1) * 16), y = WY(e.y + 20); B(x - 3, y, 2, 2, '#ff5040'); B(x + 1, y, 2, 2, '#ff5040'); }
}
function sentenceTell(api, A){
  const e=A.sentence, k=W(); if(!e || !k || e.dead || !A.fight) return;
  const {B,WX,WY}=api, S=k.constants.S, floor=WY(0), x=WX(e.x);
  if(e.st === 'slam-tell'){
    const left=WX(e.x-S.slam.r), right=WX(e.x+S.slam.r), height=40*api.Z;
    B(left,floor-2,right-left,2,C.brassLit);
    for(const edge of [left,right-1]) B(edge,floor-height,1,height,C.brassLit);
    for(let xx=left+4;xx<right;xx+=12) B(xx,floor-5,3,2,C.brass);
  }
  if(e.st === 'rush-tell' || e.st === 'pronounce'){
    const all=e.st === 'pronounce', well=k.constants.WELL;
    const left=WX(all?well.x1+45:Math.min(e.x,e.to)), right=WX(all?well.x2-45:Math.max(e.x,e.to));
    B(left,floor-2,right-left,2,all?C.pale:C.brassLit);
    if(!all) B(WX(e.to)-1,floor-10,2,10,C.brassLit);
    for(let xx=left+8;xx<right-8;xx+=24){ B(xx,floor-7,4,1,C.pale); B(xx+e.dir*3,floor-9,1,5,C.pale); }
    if(all) for(const [sx,w] of k.constants.WELL_SLATES){
      const l=WX(sx-w/2), r=WX(sx+w/2);
      B(l,floor-4,r-l,2,'#9fd6ff'); B(l,floor-9,2,5,'#9fd6ff'); B(r-2,floor-9,2,5,'#9fd6ff');
    }
  }
  if(e.st === 'recover'){
    const back=WX(e.x-(e.shieldFace||e.face||1)*(e.w/2+4));
    B(back,WY(e.y+54),2,38*api.Z,C.brassLit);
  }
}

function overlay(api){
  const A = st(api) || {};
  darkness(api, A);
  sentenceTell(api, A);
  const { B, WX, WY } = api;
  for(const a of A.aoes || []){ const x = WX(a.x), y = WY(0), r = Math.round(a.r * api.Z * (1.2 - a.t)); for(let k = -r; k <= r; k += 3) B(x + k, y - 2 - Math.round(Math.sqrt(Math.max(0, r * r - k * k)) * .15), 2, 2, 'rgba(201,184,216,.6)'); }
  FA.vignette(api, '6,4,9', .55);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(230,220,245,${.14 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
}

ART.register(27, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
