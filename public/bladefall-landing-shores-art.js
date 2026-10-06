/* Bladefall — ACT TWO · the Landing Shores' art (2026-09-23).

   Registered with BladefallActTwoArt and drawn through the same renderer hooks as
   Thunder Cliffs (1 buffer pixel = 2 world units; api.WX / api.WY / api.B).

   A GREY DAWN after the storm: the first daylight in the game that is not fire. The
   palette is bleached — sand, salt-grey wood, rust — so that the two warm things in it
   read at once: the King's gilt (his landing, his arches, his Sunguard, the spire on the
   skyline) and the white of the trumpet flowers (in the conscripts' bandages, thick on
   the headland, and on the knight's own cloak if the hand is taken). Nothing else here
   is gold, and nothing else is white. */
(function installLandingShoresArt(root){
'use strict';
const ART = root.BladefallActTwoArt;
if(!ART || !ART.register) return;
const S = ART.shared;
const { flower, drawBell, bandagedHead, belledFigure, sunguardFigure, kneeling, walker, drawFallen } = S;

const C = {
  sky:['#4f5a64', '#6f7a83', '#a2a6a2', '#d4c7a9', '#e2d1ab'],
  strata:['#7d858b', '#9a9d98', '#b9b5a7'], strataLit:'#e8d6ae',
  sea0:'#56676b', sea1:'#6b7c7e', sea2:'#8a9894', crest:'#c9d2cc',
  sand:'#cbbd9d', sandLit:'#e3d8bb', sandShade:'#b3a585', sandDeep:'#9d9076', sandDark:'#83786a',
  wet:'#9c927c', wetLit:'#b4a98e', wetDark:'#857c69', puddle:'#aab3b3',
  wrack:'#4e5140', drift:'#8a7b63',
  wood0:'#3b332a', wood1:'#5a4e3f', wood2:'#7a6c58', wood3:'#9a8b74', woodLit:'#c2b397',
  iron0:'#2c2521', iron1:'#4a3c33', iron2:'#6b594b', iron3:'#8f7a66',
  water:'rgba(96,118,121,.84)', waterLit:'#b3c2bf', foam:'#eef2ee', waterDeep:'rgba(60,78,83,.9)',
  gold0:'#7d6228', gold1:'#b8923c', gold2:'#d8b25a', gold3:'#f3d67a',
  violet:'#6e4a8c', violetLit:'#9a73b8',
  rock0:'#514b41', rock1:'#665f53', rock2:'#7c7466', rock3:'#958c7c', rockLit:'#b0a693',
  flower:'#f4f1e6', throat:'#cfc8b2', leaf:'#4f5c44', leafLit:'#6b7a5a',
  band0:'#8f8775', band1:'#b9b09a', band2:'#d8d0bd', tunic:'#6f6a5c', tunicDark:'#524e44',
  beard:'#6e5e4a', beardLit:'#9a8a72', skin:'#b89a7c', pike:'#a08a68', pikeDark:'#6d5a44', pikeIron:'#c9c4b8', broom:'#9a8a5a',
  guard0:'#7d6228', guard1:'#c9a24a', guard2:'#e8c874', tabard:'#e7dcc0',
  sail:['#9c4a36', '#4a6a8c', '#5a7a4a'], canvas:'#b8ae96', canvasDim:'#8f8672',
};
const K = () => root.BladefallLandingShores && root.BladefallLandingShores.constants;
const A2 = () => root.BladefallActTwo;
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 17 ? A : null; }

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

/* ── Backdrop: a grey dawn over the sea, and the spire far inland ─────────── */
const cache = {};
function skyLayer(api){
  const key = 'sky' + api.bw + 'x' + api.bh;
  return cache[key] || (cache[key] = api.layer(api.bw, api.bh, g => {
    const gr = g.createLinearGradient(0, 0, 0, api.bh);
    [0, .3, .55, .74, .86].forEach((s, i) => gr.addColorStop(s, C.sky[i]));
    g.fillStyle = gr; g.fillRect(0, 0, api.bw, api.bh);
  }));
}
function strataLayer(api, idx){
  const key = 'strata' + idx;
  return cache[key] || (cache[key] = api.layer(1024, 90, g => {
    const r = api.rng(41 + idx * 13);
    // A few long, thin, broken bands: a sky clearing from the east after a storm.
    for(let i = 0; i < 7; i++){
      const x = r() * 1024, y = 10 + r() * 70, w = 120 + r() * 300, h = 1 + (r() * 2 | 0);
      for(let dx = 0; dx < w; dx += 2){
        if(Math.sin(dx * .05 + i) > .75) continue;
        const xx = (x + dx) % 1024, taper = Math.min(1, dx / 30, (w - dx) / 30);
        g.globalAlpha = .55 * taper; g.fillStyle = C.strata[idx]; g.fillRect(xx, y, 2, h);
        g.globalAlpha = .3 * taper; g.fillStyle = C.strataLit; g.fillRect(xx, y + h, 2, 1);
      }
    }
    g.globalAlpha = 1;
  }));
}
function farX(api, wx, par){ return Math.round(api.bw / 2 + (wx - (api.camX + api.bw / (2 * api.Z))) * api.Z * par); }
function backdrop(api){
  const { ctx, B, bw, bh } = api, t = api.time;
  ctx.drawImage(skyLayer(api), 0, 0);
  const horizon = Math.round(api.groundBy - 150 + api.camYb * .12);
  // The sun is still low, behind the haze, in the east.
  const sx = Math.round(bw * .8), sy = horizon - 40;
  api.glow(sx, sy, 90, '255,236,196', .28); api.glow(sx, sy, 26, '255,244,220', .5);
  for(let dy = -5; dy <= 5; dy++){ const hw = Math.round(Math.sqrt(30 - dy * dy)); B(sx - hw, sy + dy, hw * 2 + 1, 1, '#f6ead0'); }
  for(let i = 0; i < 3; i++){
    const img = strataLayer(api, i), par = [.04, .08, .14][i];
    const off = -(((t * (3 + i * 2)) + api.camX * api.Z * par) % 1024);
    const y = Math.round(horizon - 150 + i * 42 + api.camYb * .04);
    for(let x = off - 1024; x < bw; x += 1024) ctx.drawImage(img, Math.round(x), y);
  }
  // Far land rising in the east, and on it Charma's spire: the one bright point in the sky.
  const lx = farX(api, 15000, .08);
  for(let i = -20; i < 260; i++){
    const x = lx + i * 2; if(x < -2 || x > bw + 2) continue;
    const h = Math.round(Math.max(0, i) * .18 + 6 + Math.sin(i * .09) * 4 + api.hash(i >> 1, 21) * 2);
    B(x, horizon - h, 2, h, i % 5 ? '#8a918f' : '#838a88');
  }
  const spx = lx + 330;
  if(spx > -10 && spx < bw + 10){
    const top = horizon - 102;
    B(spx - 3, horizon - 58, 7, 12, '#9a9486'); B(spx - 1, top, 3, 46, C.gold1); B(spx, top - 8, 1, 8, C.gold3);
    B(spx - 1, top, 1, 46, C.gold2);
    api.glow(spx, top + 4, 16, '243,214,122', .35 + .08 * Math.sin(t * 1.3));
  }
  // The sea, calm now, grey-green to the horizon.
  const sg = ctx.createLinearGradient(0, horizon, 0, bh);
  sg.addColorStop(0, C.sea2); sg.addColorStop(.3, C.sea1); sg.addColorStop(1, C.sea0);
  ctx.fillStyle = sg; ctx.fillRect(0, horizon, bw, bh - horizon);
  B(0, horizon, bw, 1, '#c3c7bd');
  for(let row = 0; row < 12; row++){
    const y = horizon + 3 + row * row * .8 + row * 3; if(y > bh) break;
    const sp = 10 + row * 6, len = 3 + row, par = .04 + row * .04;
    const off = -((t * 4 + api.camX * api.Z * par) % sp);
    ctx.fillStyle = 'rgba(214,222,214,.3)';
    for(let x = off - sp; x < bw; x += sp){
      const j = api.hash(Math.floor((x - off) / sp) + row * 71, row + 3); if(j < .55) continue;
      ctx.fillRect(Math.round(x + j * sp * .4), Math.round(y), len, 1);
    }
  }
  // Older wrecks on a far bar: ribs and a mast or two, grey in the haze.
  for(let k = 0; k < 9; k++){
    const x = farX(api, 1200 + k * 1500, .32); if(x < -60 || x > bw + 60) continue;
    const y = horizon + 10 + (k % 3) * 3, n = api.hash(k, 31);
    ctx.fillStyle = 'rgba(92,98,98,.55)';
    for(let r = 0; r < 6; r++) ctx.fillRect(x + r * 4, y - 6 - Math.round(Math.sin(r / 5 * Math.PI) * 6), 1, 6 + Math.round(Math.sin(r / 5 * Math.PI) * 6));
    if(n > .45) ctx.fillRect(x + 10, y - 26 - Math.round(n * 10), 1, 22 + Math.round(n * 10));
  }
  // Low mist over the water.
  ctx.fillStyle = 'rgba(226,228,222,.10)';
  for(let i = 0; i < 4; i++){ const y = horizon + 6 + i * 9, off = ((t * (4 + i) + api.camX * api.Z * .2) % 300); ctx.fillRect(-300 + off + i * 40, y, bw + 600, 3); }
}

/* ── Platforms ────────────────────────────────────────────────────────────── */
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  // Raised ground is land all the way down: it runs to the foot of the screen, not to a floor.
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function sandBody(api, s, wx0, lit){
  const { B } = api;
  if(s.w <= 0) return;
  // Dry sand over damp, damp over the dark bank the sea keeps wet; the layers wander.
  B(s.x0, s.y, s.w, s.floor - s.y, C.sand);
  const base = Math.floor(api.camX * api.Z);
  for(let x = s.x0; x < s.x1; x += 2){
    const k = (x + base) * .03, d1 = Math.round(26 + Math.sin(k) * 5 + Math.sin(k * 2.7) * 2), d2 = Math.round(58 + Math.sin(k * .7 + 1) * 7);
    B(x, s.y + d1, 2, 2, C.sandShade); B(x, s.y + d1 + 2, 2, Math.max(0, d2 - d1 - 2), '#bfb193');
    if(s.floor > s.y + d2) B(x, s.y + d2, 2, s.floor - s.y - d2, C.sandDeep);
    if(s.floor > s.y + d2 + 30 && ((x + base) >> 1) % 9 === 0) B(x, s.y + d2 + 8 + ((x * 7) % 20), 2, 1, C.sandDark);
  }
  B(s.x0, s.y, s.w, 2, lit || C.sandLit);
  for(let x = s.x0; x < s.x1; x += 2){
    const n = api.hash((x + base) >> 1, 7);
    if(n > .93) B(x, s.y + 3 + ((n * 97) % 8 | 0), 1, 1, C.sandDark);
    else if(n < .05) B(x, s.y + 2 + ((n * 131) % 5 | 0), 1, 1, '#f1eadb');
  }
}
function wrackLine(api, s){
  const { B } = api, base = Math.floor(api.camX * api.Z);
  for(let x = s.x0; x < s.x1; x += 3){
    const n = api.hash((x + base) / 3 | 0, 13);
    if(n > .86) B(x, s.y - 1, 3, 1, C.wrack); else if(n > .8) B(x, s.y - 1, 5, 1, C.drift);
  }
}
function plankTop(api, x0, x1, y, lit){
  const { B } = api;
  B(x0, y, x1 - x0, 1, lit || C.woodLit); B(x0, y + 1, x1 - x0, 2, C.wood2);
  for(let x = x0 + 5; x < x1; x += 10) B(x, y + 1, 1, 2, C.wood0);
}
function plat(api, o){
  const { B } = api, L = K();
  if(o.gone) return true;
  const s = span(api, o);
  switch(o.actArt){
    case 'hidden': sandBody(api, s); return true;               // under the stranded hull
    case 'strand': case 'dune': sandBody(api, s); wrackLine(api, s); return true;
    case 'flats': {
      B(s.x0, s.y, s.w, s.floor - s.y, C.wet);
      B(s.x0, s.y, s.w, 1, C.wetLit);
      const base = Math.floor(api.camX * api.Z);
      for(let x = s.x0; x < s.x1; x += 2){
        const n = api.hash((x + base) >> 1, 17);
        if(n > .8) B(x, s.y + 2 + ((n * 53) % 4 | 0) * 2, 2, 1, C.wetDark);          // ripple marks
        if(n < .03) B(x, s.y + 1, 6, 1, C.puddle);                                   // a pool of sky
      }
      for(let yy = s.y + 12; yy < s.floor; yy += 8) B(s.x0, yy, s.w, 1, C.wetDark);
      return true;
    }
    case 'wrack-perch': {
      // Broken hull ribs anchor the stepping surface in the tidal sand.
      const bottom = api.WY(0), mid = (s.x0 + s.x1) / 2;
      B(s.x0 + 3, s.y + 3, 6, bottom - s.y, C.wood1);
      B(s.x1 - 9, s.y + 3, 6, bottom - s.y, C.wood1);
      for(let y=s.y+9; y<bottom; y+=8){
        const k=(y-s.y)/(bottom-s.y), inset=Math.round(Math.sin(k*Math.PI)*8);
        B(s.x0+9+inset,y,Math.max(1,s.w-18-inset*2),4,C.wood0);
      }
      B(mid-3,s.y-8,5,8,C.wood2);
      plankTop(api,s.x0,s.x1,s.y,C.woodLit);
      B(s.x0+2,api.WY(170),7,3,C.wrack); B(s.x1-10,api.WY(170),7,3,C.wrack);
      return true;
    }
    case 'bell-shelf':
      B(s.x0,s.y,s.w,7,C.rock2);B(s.x0,s.y,s.w,2,C.rockLit);
      B(s.x0+5,s.y+7,s.w-10,4,C.rock0);return true;
    case 'hull-deck': case 'refuge-deck': plankTop(api, s.x0, s.x1, s.y); return true;
    case 'float': {
      // Wreckage: a hatch cover lashed to two casks. It sits on the sand until the sea lifts it.
      B(s.x0, s.y, s.w, 5, C.wood2); plankTop(api, s.x0, s.x1, s.y);
      B(s.x0 + 6, s.y + 5, 12, 7, C.wood1); B(s.x1 - 18, s.y + 5, 12, 7, C.wood1);
      B(s.x0 + 6, s.y + 7, 12, 1, C.iron1); B(s.x1 - 18, s.y + 7, 12, 1, C.iron1);
      B(s.x0 + 20, s.y + 1, 1, 4, C.drift); B(s.x1 - 21, s.y + 1, 1, 4, C.drift);
      return true;
    }
    case 'jetty': {
      // THE KING'S LANDING. Dark wood, a gilt edge, swept clean every day.
      const ground = api.WY(0);
      for(let x = s.x0 + 8; x < s.x1; x += 40){ B(x, s.y + 4, 5, ground - s.y - 4, C.wood0); B(x, s.y + 20, 5, 2, C.gold1); B(x, s.y + 4, 1, ground - s.y - 4, C.wood1); }
      B(s.x0, s.y + 2, s.w, 4, '#3a2f26');
      plankTop(api, s.x0, s.x1, s.y, '#6b5a47');
      B(s.x0, s.y + 3, s.w, 1, C.gold2);
      for(let x = s.x0 + 30; x < s.x1; x += 60){ B(x, s.y - 12, 3, 12, '#3a2f26'); B(x - 1, s.y - 14, 5, 2, C.gold2); }
      return true;
    }
    case 'court': {
      const arch = api.WX(L ? L.SUN_ARCH_X : 8350);
      // The landing court: pale flags with a gilt line, sand blown across them.
      const a = { x0:s.x0, x1:Math.min(s.x1, arch), y:s.y, floor:s.floor }; a.w = a.x1 - a.x0;
      if(a.w > 0){
        B(a.x0, a.y, a.w, a.floor - a.y, '#a89d85');
        for(let yy = a.y + 2, r = 0; yy < a.floor; yy += 8, r++){ B(a.x0, yy, a.w, 1, '#8f8570'); for(let x = a.x0 + (r % 2 ? 7 : 0) - ((api.camX * api.Z) % 14 | 0); x < a.x1; x += 14) if(x > a.x0) B(x, yy, 1, 8, '#8f8570'); }
        B(a.x0, a.y, a.w, 1, '#d5cbb3'); B(a.x0, a.y + 1, a.w, 1, C.gold2);
      }
      // Past the arch, the cliff road: shingle and packed sand.
      const b = { x0:Math.max(s.x0, arch), x1:s.x1, y:s.y, floor:s.floor }; b.w = b.x1 - b.x0;
      if(b.w > 0){ sandBody(api, b, 0, '#cfc3a6'); const base = Math.floor(api.camX * api.Z);
        for(let x = b.x0; x < b.x1; x += 2){ const n = api.hash((x + base) >> 1, 23); if(n > .75) B(x, b.y + 1 + (n * 7 | 0) % 3, 2, 1, n > .9 ? C.rock3 : C.rock2); } }
      return true;
    }
    case 'cliff-ledge': {
      B(s.x0 - 3, s.y, s.w + 6, 9, C.rock2); B(s.x0 - 3, s.y, s.w + 6, 1, C.rockLit);
      for(let x = s.x0; x < s.x1; x += 5) B(x, s.y + 9, 4, 2 + Math.round(api.hash(x, 5) * 6), C.rock1);
      return true;
    }
    case 'headland': {
      sandBody(api, s, 0, '#c6bb9b');
      B(s.x0, s.y, s.w, 1, '#7d8a66');
      const base = Math.floor(api.camX * api.Z);
      for(let x = s.x0; x < s.x1; x += 2){ const n = api.hash((x + base) >> 1, 29); if(n > .7) B(x, s.y - 1 - (n * 9 | 0) % 3, 1, 1 + (n * 7 | 0) % 3, n > .85 ? C.leafLit : C.leaf); }
      return true;
    }
  }
  return false;
}

/* ── Objects ──────────────────────────────────────────────────────────────── */
function object(api, o){
  switch(o.type){
    case 'wall':
      if(o.actArt === 'face') return true;              // the ground or the hull draws itself
      if(o.actArt === 'bars'){ drawBars(api, o); return true; }
      if(o.actArt === 'palisade'){ drawPalisade(api, o); return true; }
      return false;
    case 'actWreck':
      if(o.kind === 'ours') drawOurs(api, o);
      else if(o.kind === 'mast') drawMast(api, o);
      else if(o.kind === 'hull') drawHull(api, o, 'hull');
      else if(o.kind === 'refuge') drawHull(api, o, 'refuge');
      return true;
    case 'actRing': if(!o.gone) S.drawRing(api, o); return true;
    case 'actProp': drawProp(api, o); return true;
    case 'actArch': drawArch(api, o); return true;
    case 'actCliff': drawBellCliff(api, o); return true;
    case 'actPalisade': return true;                      // drawn with its wall
    case 'actOren': { const A = st(api); if(A) S.orenFigure(api, A.oren); return true; }
  }
  return false;
}
/* The boat built from three countries, run up the strand by the current: keel in the
   sand, heeled toward you so her deck shows, holed at the turn of the bilge, the mast
   snapped at the partners with the patched sail lying over it. The cabin door is the rest. */
function drawOurs(api, o){
  const { B, WX, WY } = api, x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), base = WY(o.y) + 3, w = x1 - x0, H = 58;
  const gun = (x) => { const k = (x - x0) / w; return base - Math.round(H * (.42 + .55 * Math.pow(k, 5) + .22 * Math.pow(1 - k, 7))); };
  // The deck, seen from above because she lies over toward you.
  for(let x = x0 + 2; x < x1 - 2; x++){ const g = gun(x); B(x, g - 7, 1, 7, (x - x0) % 6 ? C.wood3 : C.wood2); B(x, g - 8, 1, 1, C.woodLit); }
  // The hull: clinker strakes, dark below the old waterline.
  for(let x = x0; x < x1; x++){
    const g = gun(x), k = (x - x0) / w;
    for(let y = g; y < base; y++){
      const strake = Math.floor((y - g) / 5), edge = (y - g) % 5 === 0;
      B(x, y, 1, 1, edge ? C.wood0 : y > base - 14 ? '#3f372d' : strake % 2 ? C.wood1 : '#655847');
    }
    if(k < .015 || k > .985) B(x, g, 1, base - g, C.wood0);
  }
  B(x0, base - 1, w, 2, C.sandShade);                                                   // the sand she sits in
  // The hole the rocks made, and the sand run in through it.
  const hx = x0 + Math.round(w * .58), hy = base - 16;
  for(let i = 0; i < 18; i++){ const r = Math.round(7 * Math.sin(i / 17 * Math.PI)) + (i % 3 === 0 ? 1 : 0); B(hx - 9 + i, hy - r, 1, r * 2 + 1, '#15120e'); }
  for(let i = 0; i < 6; i++) B(hx - 6 + i * 2, hy - 8 + (i % 2), 1, 3, C.wood2);          // sprung planks
  B(hx - 10, hy + 7, 22, 3, C.sand);
  // The cabin door, aft: this is where the knight rests.
  const dx = WX(340), dg = gun(dx);
  B(dx - 5, dg + 4, 10, 15, '#221c16'); B(dx - 5, dg + 4, 10, 1, C.wood3); B(dx - 4, dg + 5, 1, 13, C.wood2);
  // The mast, snapped at the partners, and the rest of it lying aft over the deck with the
  // sail under it: three countries' patches, stitched.
  const mx = x0 + Math.round(w * .46), mg = gun(mx);
  B(mx - 2, mg - 24, 5, 24, C.wood2); B(mx - 2, mg - 24, 1, 24, C.wood3); B(mx - 3, mg - 26, 7, 3, '#d9cfb8');
  const fall = (i) => ({ x:mx - 4 - i, y:mg - 22 + Math.round(i * .32) });
  for(let i = 0; i < 150; i++){ const q = fall(i); if(q.x < x0 - 30) break; B(q.x, q.y, 1, 3, i % 13 ? C.wood2 : C.wood3); }
  for(let i = 4; i < 132; i++){
    const q = fall(i); if(q.x < x0 - 20) break;
    const drop = 6 + Math.round(Math.sin(i * .09) * 3 + Math.abs(Math.sin(i * .031)) * 12);
    B(q.x, q.y + 3, 1, drop, i % 9 ? C.canvas : C.canvasDim); B(q.x, q.y + 3 + drop, 1, 1, C.canvasDim);
  }
  const patch = (i, c, ww, hh) => { const q = fall(i); B(q.x - ww, q.y + 5, ww, hh, c); B(q.x - ww, q.y + 5, ww, 1, '#d9cfb8'); };
  patch(26, C.sail[0], 9, 7); patch(58, C.sail[1], 8, 8); patch(94, C.sail[2], 10, 6);
  // Her stern lantern, still hung, and out.
  B(x0 + 5, gun(x0 + 5) - 18, 1, 8, C.iron1); B(x0 + 3, gun(x0 + 5) - 11, 5, 7, C.iron1); B(x0 + 4, gun(x0 + 5) - 10, 3, 4, '#6b6252');
}
function drawMast(api, o){
  const { B, WX, WY } = api, x = WX(o.x), top = WY(o.y + o.h), bottom = WY(o.y);
  B(x - 2, top, 5, bottom - top, C.wood1); B(x - 2, top, 1, bottom - top, C.wood3); B(x + 2, top, 1, bottom - top, C.wood0);
  B(x - 12, top + 18, 25, 3, C.wood2); B(x - 12, top + 18, 25, 1, C.wood3);                 // the crosstree
  for(let i = 0; i < 10; i++) B(x - 12 + (i % 2) * 24, top + 21 + i * 3, 1, 3, C.drift);      // frayed stays
  const A = st(api), water = api.WY(A ? A.water : -70);
  for(let y = water - 10; y < water + 4; y += 2) if(api.hash(y, x) > .4) B(x - 3, y, 7, 2, '#b9b5a4');   // barnacles at the line
}
/* A stranded hull, upright in the sand: stern to the west with its cabin windows, bow
   to the east with the stump of a bowsprit. Horizontal strakes following the sheer,
   a heavy wale, holes where planks have gone and the ribs show. */
function drawHull(api, o, kind){
  const { B, WX, WY } = api, L = K();
  const inner = kind === 'hull' ? (L ? [L.HULL.x1, L.HULL.x2] : [o.x - o.w / 2, o.x + o.w / 2]) : (L ? [L.REFUGE.x1, L.REFUGE.x2] : [o.x - o.w / 2, o.x + o.w / 2]);
  const x0 = WX(inner[0]), x1 = WX(inner[1]), w = x1 - x0, base = WY(o.y), deck = WY(o.y + o.h), H = base - deck;
  const round = Math.min(18, Math.round(H * .3));
  for(let x = x0; x < x1; x++){
    const k = (x - x0) / Math.max(1, w), sheer = Math.round(Math.pow(k, 3) * 6 + Math.pow(1 - k, 4) * 3);
    const top = deck - sheer;
    // The turn of the bilge: the bottom corners curve in to the keel.
    const e = Math.min(x - x0, x1 - 1 - x), cut = e < round ? Math.round(round - Math.sqrt(Math.max(0, round * round - (round - e) * (round - e)))) : 0;
    const bottom = base - cut;
    for(let y = top; y < bottom; y++){
      const d = y - top, strake = Math.floor(d / 6);
      B(x, y, 1, 1, d % 6 === 0 ? C.wood0 : strake % 2 ? C.wood1 : '#655847');
    }
    B(x, top, 1, 2, C.woodLit);
    B(x, top + 9, 1, 3, C.wood0);                                                   // the wale
    if(e < 2) B(x, top, 1, bottom - top, C.wood0);
  }
  // Holes where the planks have gone: the ribs show through.
  const holes = kind === 'hull' ? [[.3, .45], [.62, .7], [.45, .25]] : [[.55, .6], [.25, .35]];
  for(const [hk, vk] of holes){
    const hx = x0 + Math.round(w * hk), hy = deck + Math.round(H * vk);
    B(hx, hy, 16, 10, '#1e1914'); for(let r = 0; r < 4; r++) B(hx + 1 + r * 4, hy, 2, 10, C.wood2);
    B(hx - 1, hy - 1, 18, 1, C.wood2);
  }
  // The stern: cabin windows in the transom, dark.
  if(kind === 'hull') for(let i = 0; i < 3; i++){ B(x0 + 4 + i * 7, deck + 14, 4, 6, '#191511'); B(x0 + 4 + i * 7, deck + 14, 4, 1, C.wood3); }
  // A broken rail along the deck.
  for(let x = x0 + 3; x < x1 - 3; x += 7) if(api.hash(x, 45) > .25) B(x, deck - 7, 1, 7, C.wood2);
  B(x0 + 2, deck - 8, Math.round(w * .55), 1, C.wood2); B(x0 + Math.round(w * .7), deck - 8, Math.round(w * .28), 1, C.wood2);
  if(!L) return;
  if(kind === 'hull'){
    // A davit off the stern carries the first ring; the mizzen stump carries the second.
    const r0 = L.RINGS[2], r1 = L.RINGS[3], rx0 = WX(r0.x), ry0 = WY(r0.y), rx1 = WX(r1.x), ry1 = WY(r1.y);
    B(rx0 - 2, ry0 - 16, x0 - rx0 + 4, 3, C.wood2); B(rx0 - 2, ry0 - 16, x0 - rx0 + 4, 1, C.wood3);
    B(rx0 - 1, ry0 - 13, 1, 5, C.drift);
    B(rx1 - 2, ry1 + 6, 5, deck - ry1 - 6, C.wood1); B(rx1 - 2, ry1 + 6, 1, deck - ry1 - 6, C.wood3); B(rx1 - 6, ry1 + 10, 13, 2, C.wood2);
    // The bowsprit's stump, up and out to the east.
    for(let i = 0; i < 22; i++) B(x1 - 2 + i, deck - 4 - Math.round(i * .45), 2, 2, i % 7 ? C.wood2 : C.wood3);
  } else {
    const r = L.RINGS[4], rx = WX(r.x), ry = WY(r.y);   // on the stump of her mast
    B(rx - 2, ry + 6, 5, deck - ry - 6, C.wood1); B(rx - 2, ry + 6, 1, deck - ry - 6, C.wood3); B(rx - 9, ry + 12, 19, 2, C.wood2);
    // Weed and barnacles to the high-water line: the tide covers her to here.
    const hw = WY(L.TIDE.high);
    for(let x = x0; x < x1; x += 2) if(api.hash(x, 47) > .35) B(x, hw - 1 + ((x * 3) % 4), 2, 2, api.hash(x, 49) > .6 ? '#b9b5a4' : C.wrack);
  }
}
function drawProp(api, o){
  if(o.kind === 'bell-cleat'){
    const A=st(api), {B,WX,WY}=api, x=WX(o.x), y=WY(o.y), broken=A.enc.cliff.st==='done';
    B(x-11,y-9,22,9,C.iron1);
    B(x-11,y-10,9,3,C.gold3);B(x+2,y-10,9,3,C.gold3);
    B(x-2,y-7,4,7,C.iron0);
    if(!broken){
      const drop=Math.floor(api.time*10)%10;
      B(x-1,y-30+drop,2,4,C.gold3);B(x-4,y-22+drop,3,2,C.gold3);B(x+2,y-22+drop,3,2,C.gold3);
    }else{B(x-13,y-5,5,2,C.gold2);B(x+12,y-3,4,2,C.gold2);}
    return;
  }
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y), t = api.time, A = st(api);
  if(o.kind === 'cask'){
    B(x - 8, y - 16, 16, 16, C.wood1); for(let i = 0; i < 4; i++) B(x - 8 + i * 4, y - 16, 1, 16, C.wood0);
    B(x - 8, y - 13, 16, 1, C.iron2); B(x - 8, y - 4, 16, 1, C.iron2);
    B(x - 2, y - 12, 6, 7, '#221d17'); B(x - 1, y - 10, 2, 3, C.wood2);         // stove in
    B(x - 10, y - 1, 20, 1, C.sandShade);
  } else if(o.kind === 'cloth'){
    B(x - 1, y - 32, 3, 32, '#3a2f26'); B(x - 2, y - 34, 5, 2, C.gold2);
    const flap = Math.round(Math.sin(t * 2.4) * 2);
    for(let i = 0; i < 12; i++) B(x + 2 + i, y - 26 + Math.round(Math.sin(t * 3 + i * .5) * 1.5) + (i > 8 ? flap : 0), 1, 5 - (i > 9 ? 2 : 0), i % 3 ? C.violet : C.violetLit);
    B(x + 3, y - 22, 6, 1, '#e7e2d6');                                            // white dust in the weave
  } else if(o.kind === 'landing-bell'){
    const rung = A ? A.tolls.find(q => Math.abs(q.x - o.x) < 60) : null, sw = rung ? Math.sin(rung.t * 14) * (1 - rung.t) * 4 : 0;
    B(x - 1, y - 60, 3, 60, '#3a2f26'); B(x - 1, y - 60, 12, 2, '#3a2f26');
    drawBell(api, x + 9 + Math.round(sw), y - 57, 1);
  } else if(o.kind === 'gate-bar'){
    return;                                                                       // drawn with the palisade
  }
}
function drawArch(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y), top = WY(o.y + o.h);
  for(const side of [-1, 1]){
    const px = x + side * 26 - 4;
    B(px, top, 9, y - top, '#a89c82'); B(px, top, 2, y - top, '#d5cbb3'); B(px + 7, top, 2, y - top, '#8f8570');
    B(px - 1, top - 3, 11, 4, C.gold1); B(px - 1, y - 6, 11, 6, '#8f8570');
  }
  B(x - 31, top - 10, 62, 8, '#a89c82'); B(x - 31, top - 10, 62, 1, '#d5cbb3'); B(x - 31, top - 3, 62, 1, C.gold2);
  // The sun disc over every arch the King raised.
  for(let a = 0; a < 16; a++){ const ang = a / 16 * Math.PI * 2; B(x + Math.round(Math.cos(ang) * 11) - 1, top - 20 + Math.round(Math.sin(ang) * 11) - 1, 2, 2, C.gold2); }
  B(x - 6, top - 26, 12, 12, C.gold1); B(x - 4, top - 24, 8, 8, C.gold3);
  api.glow(x, top - 20, 16, '243,214,122', .18);
}
/* Gilt bars: down, a cage; up, drawn into the lintel. They move over half a second. */
function drawBars(api, o){
  const { B, WX, WY } = api, x = WX(o.x), floor = WY(o.y - o.h), lintel = WY(o.y - o.h + 400);
  const k = o.moveT > 0 ? o.moveT / .5 : 0, down = !o.gone;
  const reach = down ? 1 - k : k;                                   // how far down the bars hang
  const tip = Math.round(lintel + (floor - lintel) * reach);
  if(tip <= lintel + 2) return;
  for(let i = -3; i <= 3; i++){ const bx = x + i * 5; B(bx, lintel, 2, tip - lintel, C.gold1); B(bx, lintel, 1, tip - lintel, C.gold3); B(bx - 1, tip - 3, 4, 3, C.gold0); }
  B(x - 17, lintel + Math.round((tip - lintel) * .5), 36, 2, C.gold1);
}
function drawPalisade(api, o){
  const { B, WX, WY } = api, L = K(), A = st(api);
  const x = WX(o.x), base = WY(o.y - o.h), top = WY(o.y - o.h + 360), open = A ? A.gateT : (o.gone ? 1 : 0);
  // Stakes, sharpened, lashed, taller than any jump. White flowers have climbed them.
  for(let i = -14; i <= 22; i++){
    const sx = x + i * 5, h = 3 + Math.round(api.hash(i, 51) * 6);
    if(Math.abs(i) <= 3) continue;                                   // the gate
    B(sx, top - h, 4, base - top + h, i % 2 ? C.wood1 : C.wood2); B(sx + 1, top - h - 3, 2, 3, C.wood2); B(sx, top - h, 1, base - top + h, C.wood3);
    if(api.hash(i, 53) > .55) flower(api, sx + 2, top + 20 + Math.round(api.hash(i, 55) * 60), 1);
  }
  B(x - 72, top + 30, 190, 2, C.drift); B(x - 72, base - 30, 190, 2, C.drift);
  // The gate: two leaves, barred from OUTSIDE.
  const gw = 16, lean = Math.round(open * gw * .8);
  for(const side of [-1, 1]){
    const gx = side < 0 ? x - gw : x;
    B(gx + (side < 0 ? -lean : lean), top + 10, gw - Math.round(open * 6), base - top - 10, C.wood2);
    for(let yy = top + 16; yy < base; yy += 10) B(gx + (side < 0 ? -lean : lean), yy, gw - Math.round(open * 6), 1, C.wood0);
  }
  if(open < .05){
    const by = base - 36; B(x - 24, by, 48, 5, C.wood3); B(x - 24, by, 48, 1, C.woodLit);
    B(x - 26, by - 2, 3, 9, C.iron1); B(x + 23, by - 2, 3, 9, C.iron1);
    // The prompt to lift it only once the Sunguard is down (the page's own ↑ prompt).
  }
  if(L && open > .05){ api.glow(x, base - 40, 30, '230,226,214', .12 * open); }
}
function drawBellCliff(api, o){
  const { B, WX, WY, bw } = api, L = K(), wx0 = o.x - o.w / 2, wx1 = o.x + o.w / 2;
  const x0 = Math.max(-4, WX(wx0)), x1 = Math.min(bw + 4, WX(wx1)), base = WY(o.y);
  if(x1 <= x0 || !L) return;
  const ledgeX = L.OVERSEER_LEDGE.x, ledgeY = L.OVERSEER_LEDGE.y;
  // The cliff climbs from the arch to the headland; the overseer's shelf is cut into it.
  const topAt = (wx) => {
    const k = (wx - wx0) / (wx1 - wx0);
    const rise = Math.min(1, Math.max(0, (wx - wx0) / 500)), ramp = rise * rise * (3 - 2 * rise);   // it rises out of the court
    const y = o.y + (80 + k * 360 + Math.sin(wx * .004) * 18 + Math.sin(wx * .013) * 8) * ramp;
    return Math.abs(wx - ledgeX) < 160 ? Math.max(y, ledgeY + 100) : y;
  };
  for(let x = x0; x < x1; x += 2){
    const wx = api.camX + x / api.Z, top = WY(topAt(wx)), n = api.hash(Math.floor(wx / 24), 61);
    B(x, top, 2, base - top, n > .5 ? C.rock1 : '#5f584d');
    B(x, top, 2, 2, C.rockLit); B(x, top + 2, 2, 3, C.rock2);
    for(let yy = top + 16 + (Math.floor(wx / 60) % 3) * 4; yy < base - 4; yy += 19) B(x, yy, 2, 1, C.rock0);
    if(Math.floor(wx / 2) % 97 === 0) B(x, top + 6, 1, base - top - 10, C.rock0);            // cracks
    B(x, base - 6, 2, 6, '#4a453c');
  }
  // The overseer's shelf, the bell's gallows, and the stair cut down from it to the court's east end.
  const lx = WX(ledgeX), ly = WY(ledgeY);
  B(lx - 40, ly, 80, 7, C.rock3); B(lx - 40, ly, 80, 1, C.rockLit); B(lx - 40, ly + 7, 80, 3, C.rock0);
  B(lx + 26, ly - 30, 3, 30, C.wood0); B(lx + 16, ly - 30, 13, 2, C.wood0);
  const sx0 = lx + 40, sy0 = ly + 4, steps = 16, run = WX(L.BELL_GATE_X - 90) - sx0;
  for(let i = 0; i < steps; i++){ const sx = sx0 + Math.round(i * run / steps), sy = sy0 + Math.round(i * (base - sy0) / steps); B(sx, sy, Math.ceil(run / steps) + 2, 2, C.rock3); B(sx, sy + 2, Math.ceil(run / steps) + 2, 2, C.rock0); }
}
function drawFlowers(api){
  const { WX, WY, bw } = api, L = K(); if(!L) return;
  // Thick on the headland, thickest at the gate; a few on the dunes before the flats.
  const beds = [[L.HEAD.x1 + 40, L.PALISADE_X + 380, L.HEAD.y, .55], [L.HULL.x2 + 40, L.BASIN.x1 - 30, L.STRAND_Y, .12]];
  for(const [a, b, y, dens] of beds){
    const sx0 = Math.max(a, api.camX - 20), sx1 = Math.min(b, api.camX + bw / api.Z + 20);
    for(let wx = Math.floor(sx0 / 14) * 14; wx < sx1; wx += 14){
      const n = api.hash(wx / 14 | 0, 71), near = y === L.HEAD.y ? Math.min(1, Math.max(0, (wx - L.HEAD.x1) / (L.PALISADE_X - L.HEAD.x1))) : 0;
      if(n > dens + near * .35) continue;
      const x = WX(wx + n * 10), yy = WY(y) - 7 - Math.round(n * 6);
      flower(api, x, yy, 1);
    }
  }
}

/* ── World layer: water, bells, the Belled who gave up, the overseer on his ledge ─ */
function world(api){
  const A = st(api), L = K(); if(!A || !L) return;
  drawFlowers(api);
  drawPrints(api, L);
  drawRingMounts(api, L);
  drawWater(api, A, L);
  drawLedgeOverseer(api, A);
  for(const f of A.fallen) drawFallen(api, f);
  for(const q of A.tolls){
    const r = 6 + q.t * (q.far ? 26 : 40), a = (1 - q.t / 1.2) * (q.far ? .35 : .6);
    const x = api.WX(q.x), y = api.WY(q.y);
    api.ctx.strokeStyle = q.cold ? `rgba(220,226,235,${a})` : `rgba(243,214,122,${a})`; api.ctx.lineWidth = 1;
    api.ctx.beginPath(); api.ctx.arc(x + .5, y + .5, r, 0, Math.PI * 2); api.ctx.stroke();
  }
}
function drawWater(api, A, L){
  const { ctx, B, WX, WY, bw, bh } = api, t = api.time, reduced = !!(api.env && api.env.reducedMotion);
  const wy = WY(A.water);
  // The gut has no floor: its water runs to the foot of the screen. The flats' water
  // stands ON the sand, so it is drawn only above it, and not at all at low water.
  for(const [a, b, floorY] of [[L.GUT.x1, L.GUT.x2, null], [L.BASIN.x1, L.BASIN.x2, 0]]){
    const x0 = Math.max(-2, WX(a)), x1 = Math.min(bw + 2, WX(b)); if(x1 <= x0 || wy > bh) continue;
    if(floorY != null && A.water <= floorY + 1) continue;
    const bottom = floorY == null ? bh : WY(floorY) + 1;
    ctx.fillStyle = C.water; ctx.fillRect(x0, wy, x1 - x0, bottom - wy);
    if(bottom - wy > 24){ ctx.fillStyle = C.waterDeep; ctx.fillRect(x0, wy + 24, x1 - x0, bottom - wy - 24); }
    for(let x = x0; x < x1; x += 2){
      const s = reduced ? 0 : Math.round(Math.sin(t * 1.6 + x * .11) * 1.2);
      B(x, wy + s, 2, 1, C.waterLit);
      if(api.hash((x + Math.floor(t * 6)) >> 2, 81) > .9) B(x, wy + s - 1, 2, 1, C.foam);
    }
    const rising = root.BladefallLandingShores.tideAt(A.tideT + .15) > A.water;
    for(let i=0;i<7;i++){
      const progress = (t * .16 + i / 7) % 1;
      const x = x0 + Math.round((x1-x0) * (rising ? progress : 1-progress));
      B(x,wy+4+(i%3)*5,8+(i%2)*4,1,C.waterLit);
    }
    // Foam where the water meets a face.
    for(const fx of [x0, x1 - 3]) for(let i = 0; i < 3; i++) B(fx + (fx === x0 ? i : -i), wy - 1 + i, 3, 1, C.foam);
  }
  // The flats' edge at low water: a wet shine the sea left.
  if(A.water < 0){
    const k = Math.min(1, -A.water / 70);
    ctx.fillStyle = `rgba(214,222,214,${.18 * k})`;
    ctx.fillRect(Math.max(0, WX(L.BASIN.x1)), WY(0) + 1, Math.min(bw, WX(L.BASIN.x2)) - Math.max(0, WX(L.BASIN.x1)), 2);
  }
}
/* The Bell Cliff's iron: a ring bolted to the face, and the King's hoist post at the lip,
   whose ring lets you down onto the headland. */
function drawRingMounts(api, L){
  const { B, WX, WY } = api, c = L.RINGS[5], lip = L.RINGS[6];
  // Hoist iron shares the hull-ring language; a hanging cable connects it to the bell cap.
  const bx=WX(L.BELL_RIG.x), by=WY(L.BELL_RIG.ringY), foot=WY(L.BELL_RIG.y);
  B(bx+18,by-18,4,foot-by+18,C.wood1);B(bx-3,by-18,25,3,C.wood3);
  B(bx,by-15,1,7,C.iron3);
  for(let y=by+9;y<foot-10;y+=4) B(bx,y,2,3,C.iron2);
  const cx = WX(c.x), cy = WY(c.y);
  if(cx > -20 && cx < api.bw + 20){ B(cx - 4, cy - 14, 9, 6, C.iron1); B(cx - 4, cy - 14, 9, 1, C.iron3); B(cx - 1, cy - 9, 3, 3, C.iron2); }
  const lx = WX(lip.x), ly = WY(lip.y), head = WY(L.HEAD.y);
  if(lx > -40 && lx < api.bw + 40){
    B(lx + 14, ly - 16, 4, head - ly + 16, C.wood1); B(lx + 14, ly - 16, 1, head - ly + 16, C.wood3);      // the post
    B(lx - 2, ly - 18, 20, 3, C.wood2); B(lx - 2, ly - 18, 20, 1, C.wood3);                                // the arm
    B(lx, ly - 15, 1, 7, C.drift);
    for(let i = 0; i < 8; i++) B(lx + 15 - i, ly - 8 + i * 2, 1, 1, C.drift);                              // a brace
  }
}
/* Two sets of prints up the court from the jetty: a heavy heel that drags its left foot,
   and an ordinary boot a long stride behind it. Swept around, never swept away. */
function drawPrints(api, L){
  const { B, WX, WY } = api, y = WY(L.COURT.y) + 2;
  for(let wx = L.JETTY.x2 + 40; wx < L.SUN_ARCH_X - 60; wx += 46){
    const x = WX(wx); if(x < -10 || x > api.bw + 10) continue;
    const k = (wx / 46 | 0) % 2;
    B(x, y + k, 4, 1, '#7d7462'); if(k) B(x - 3, y + 1, 3, 1, '#8f8570');            // the drag
    B(x + 12, y + 1 - k, 3, 1, '#857c6a');
  }
}
function drawLedgeOverseer(api, A){
  const Lg = A.ledge; if(Lg.st === 'gone' || Lg.alpha <= 0) return;
  api.alphaWrap(Lg.alpha, () => {
    sunguardFigure(api, api.WX(Lg.x), api.WY(Lg.y), { face:Lg.face, bellSwing:Lg.ring, bellFace:1, walking:Lg.st === 'leave', t:Lg.t, small:true });
  });
}
/* ── Enemies ──────────────────────────────────────────────────────────────── */
function enemy(api, e){
  if(e.type === 'belled'){ api.drawAwareness(e); belledFigure(api, api.WX(e.x), api.WY(e.y), e); return true; }
  if(e.type === 'sunguard'){
    if(e.hitFlash > 0) api.glow(api.WX(e.x), api.WY(e.y) - 18, 14, '255,255,255', .4);
    sunguardFigure(api, api.WX(e.x), api.WY(e.y), { face:e.shieldFace, bellSwing:e.bellSwing, silenced:e.bell === 'silenced', walking:e.walking,
      t:api.time, wind:e.st === 'wind', swing:e.st === 'swing' });
    return true;
  }
  if(e.type === 'stormgull'){ S.drawGull(api, e); return true; }
  if(e.type === 'reefcrab'){ if(e.submerged) return true; api.drawAwareness(e); S.drawCrab(api, e); return true; }
  return false;
}

/* ── Overlay: spray on the air, and the cold of a choice made ─────────────── */
function overlay(api){
  const A = st(api) || {}, { ctx, bw, bh } = api, t = api.time, reduced = !!(api.env && api.env.reducedMotion);
  ctx.fillStyle = 'rgba(236,236,228,.22)';
  const n = reduced ? 14 : 40;
  for(let i = 0; i < n; i++){
    const h1 = api.hash(i, 91), h2 = api.hash(i, 92);
    const x = ((h1 * bw * 1.4 + t * 9 - api.camX * api.Z * .6) % (bw + 20) + bw + 20) % (bw + 20) - 10;
    const y = ((h2 * bh + Math.sin(t * .6 + i) * 8) % bh);
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ ctx.fillStyle = `rgba(222,228,236,${(reduced ? .06 : .2) * flash})`; ctx.fillRect(0, 0, bw, bh); }
}

ART.register(17, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
