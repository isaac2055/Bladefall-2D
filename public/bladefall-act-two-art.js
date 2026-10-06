/* Bladefall — ACT TWO's art (2026-09-23).

   Drawn into the v4 renderer's half-resolution buffer through the six hooks it exposes
   (backdrop, plat, object, world, enemy, overlay). 1 buffer pixel is 2 world units;
   api.WX / api.WY turn world coordinates into buffer pixels and api.B fills a rectangle
   on that grid, so everything here snaps to the same pixels as the rest of the game.

   The rules the heat chapter set still hold: one hot colour, one meaning. Here the
   bright blue-white is ELECTRICITY — a crackle means iron is about to be struck, and
   nothing decorative is ever drawn in it. Rope and chain read as roads only when they
   are TAUT: straight, lit and humming; slack is a sagging, dim line you cannot use. */
(function installBladefallActTwoArt(root){
'use strict';

const C = {
  sky:['#05080c','#0b121a','#172331','#2a3947'],
  cloud:['#090e14','#0f171f','#16212b','#1f2d39'], cloudLit:'#4a6070',
  sea0:'#061319', sea1:'#0b212a', sea2:'#113240', crest:'#3f6b78', foam:'#c9dde0', foamDim:'#6f95a0',
  wood0:'#170f0a', wood1:'#281a11', wood2:'#3d2a1c', wood3:'#5d412a', woodLit:'#86633f', plank:'#110a06',
  iron0:'#15191c', iron1:'#2e3439', iron2:'#525b63', iron3:'#848f98', ironLit:'#c9d4dc',
  canvas0:'#4a4339', canvas1:'#7b715f', canvas2:'#a89b80', canvas3:'#cfc2a4',
  rope:'#7a6448', ropeLit:'#b99c72', ropeDim:'#4a3c2c',
  stone0:'#181e24', stone1:'#252d35', stone2:'#343e48', stone3:'#4d5a66', stoneLit:'#738391', wet:'#8aa0ae',
  cliff0:'#141c23', cliff1:'#1b252e', cliff2:'#243039', cliff3:'#303e49', cliffLit:'#4a5c69',
  hyd0:'#102826', hyd1:'#1d4540', hyd2:'#2d6a61', hyd3:'#4f9a8c', hydLit:'#86c9b6', belly:'#a9c6a4',
  eyeBite:'#ffcf6e', eyeTide:'#8ff0d4', eyeStorm:'#cfeeff',
  bolt:'#eef8ff', echo:'#d8b7ff', gold:'#ffd98a',
};
const WATER_Y = -84;          // world height of the sea: the hull stands ~84 clear of it

/* Later regions draw from their own files (bladefall-landing-shores-art.js) and register
   here; the white flower on the cloak is drawn here, for every region after the gate. */
const STAGE_ART = {};
function register(i, impl){ STAGE_ART[i] = impl; }
function handles(stageIndex){ return stageIndex === 16 || !!STAGE_ART[stageIndex]; }
function draw(phase, api, a){
  if(phase === 'hero'){ hero(api, a); return false; }
  const i = api.G && api.G.stageIndex;
  if(i !== 16){ const s = STAGE_ART[i]; return !!(s && s.draw(phase, api, a)); }
  if(phase === 'backdrop'){ backdrop(api); return true; }
  if(phase === 'plat') return plat(api, a);
  if(phase === 'object') return object(api, a);
  if(phase === 'world'){ world(api); return true; }
  if(phase === 'enemy') return enemy(api, a);
  if(phase === 'overlay'){ overlay(api); return true; }
  return false;
}
const A2 = () => (typeof BladefallActTwo !== 'undefined' ? BladefallActTwo : null);
function state(api){ return api.G && api.G.actTwo || null; }

/* ── Backdrop: storm sky, clouds that race with the ship, the far shore, the sea ── */
const cache = {};
function skyLayer(api){
  const key = 'sky' + api.bw + 'x' + api.bh;
  return cache[key] || (cache[key] = api.layer(api.bw, api.bh, g => {
    const gr = g.createLinearGradient(0, 0, 0, api.bh);
    C.sky.forEach((c, i) => gr.addColorStop([0, .35, .62, .8][i], c));
    g.fillStyle = gr; g.fillRect(0, 0, api.bw, api.bh);
  }));
}
function cloudLayer(api, idx){
  const key = 'cloud' + idx;
  return cache[key] || (cache[key] = api.layer(1024, 220, g => {
    const r = api.rng(17 + idx * 31);
    const col = C.cloud[idx + 1] || C.cloud[3];
    g.fillStyle = col;
    for(let i = 0; i < 26; i++){
      const cx = r() * 1024, cy = 40 + r() * 120, w = 60 + r() * 180, h = 14 + r() * 34;
      for(let dx = -w; dx < w; dx += 4){
        const k = 1 - (dx / w) * (dx / w), hh = Math.max(2, h * k * (0.7 + 0.3 * Math.sin(dx * 0.07 + i)));
        const x = ((cx + dx) % 1024 + 1024) % 1024;
        g.fillRect(Math.round(x), Math.round(cy - hh), 4, Math.round(hh * 1.6));
      }
    }
    // Lower edges a shade lighter: the storm is lit from below by the sea's own light.
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = 'rgba(80,110,130,.12)'; g.fillRect(0, 150, 1024, 70);
  }));
}
function backdrop(api){
  const { ctx, B, bw, bh } = api, A = state(api) || {}, t = api.time;
  ctx.drawImage(skyLayer(api), 0, 0);
  const flash = Math.min(1, A.flash || 0), reduced = !!(api.env && api.env.reducedMotion);
  const horizon = Math.round(api.groundBy - 118 + api.camYb * .12);
  // Far land: the shore you left, receding with the echo on it; the cliffs you are sailing at.
  farShore(api, A, horizon);
  farCliffs(api, A, horizon);
  farIsland(api, A, horizon, flash);
  // Clouds race astern with the ship's own speed.
  for(let i = 0; i < 3; i++){
    const img = cloudLayer(api, i), par = [.08, .16, .3][i];
    const off = -(((A.dist || 0) * par * .5 + api.camX * api.Z * par) % 1024);
    const y = Math.round(-40 + i * 34 + api.camYb * .05);
    for(let x = off - 1024; x < bw; x += 1024) ctx.drawImage(img, Math.round(x), y);
  }
  if(flash > .02){ ctx.fillStyle = `rgba(190,215,235,${(reduced ? .12 : .32) * flash})`; ctx.fillRect(0, 0, bw, horizon + 4); }
  // The sea, rolling about the ship: the horizon tilts and heaves with the swell while the
  // deck stays true (a roll you see, never one that throws you). Reduced motion holds it still.
  const roll = reduced || A.docked ? 0 : Math.sin(t * .7) * .03 * (.4 + (A.rain || .5)), heave = reduced ? 0 : Math.round(Math.sin(t * .9) * 3);
  const sg = ctx.createLinearGradient(0, horizon - 14, 0, bh);
  sg.addColorStop(0, '#16303b'); sg.addColorStop(.25, C.sea2); sg.addColorStop(.7, C.sea1); sg.addColorStop(1, C.sea0);
  ctx.fillStyle = sg;
  for(let x = 0; x < bw; x += 4){ const hy = Math.round(horizon + heave + roll * (x - bw / 2)); ctx.fillRect(x, hy, 4, bh - hy); B(x, hy, 4, 1, '#3c5d6a'); }
  const run = (A.dist || 0) * .5;
  for(let row = 0; row < 14; row++){
    const y = horizon + heave + 3 + row * row * .9 + row * 3;
    if(y > bh) break;
    const sp = 8 + row * 5, len = 2 + row, par = .05 + row * .045;
    const off = -((run * par + api.camX * api.Z * par) % sp);
    ctx.fillStyle = row < 5 ? 'rgba(95,140,155,.35)' : 'rgba(120,165,180,.3)';
    for(let x = off - sp; x < bw; x += sp){
      const j = api.hash(Math.floor((x - off) / sp) + row * 97, row);
      if(j < .45) continue;
      ctx.fillRect(Math.round(x + j * sp * .5), Math.round(y + roll * (x - bw / 2) + Math.sin(t * 1.3 + x * .05 + row) * (reduced ? 0 : 1)), len, 1);
    }
  }
}
function farShore(api, A, horizon){
  const k = A.echoAt == null ? 0 : A.echoAt;
  if(k <= 0.01) return;
  const { B } = api, x0 = Math.round(api.bw * .02 - (1 - k) * 160);
  for(let i = 0; i < 90; i++){
    const h = Math.round((6 + Math.sin(i * .21) * 3 + api.hash(i, 5) * 3) * k);
    B(x0 + i * 2, horizon - h, 2, h, '#0a1016');
  }
  // THE ECHO STAYS ON THE BEACH. A violet body where the boat left, not following.
  const ex = x0 + 118, ey = horizon - Math.round(9 * k);
  api.alphaWrap(k, () => { B(ex, ey - 6, 2, 6, C.echo); B(ex, ey - 8, 2, 2, '#f1d6ff'); });
  api.glow(ex + 1, ey - 4, 10, '216,183,255', .25 * k);
}
function farCliffs(api, A, horizon){
  const k = A.cliffNear || 0; if(k <= 0.01) return;
  const { B, bw } = api, scale = .35 + k * .65, base = Math.round(bw * (1.05 - k * .45));
  for(let i = 0; i < 220; i++){
    const x = base + i * 2;
    if(x > bw + 4) break;
    const n = api.hash(i >> 2, 11);
    const h = Math.round((70 + Math.sin(i * .045) * 26 + n * 18 + (i > 60 && i < 90 ? 34 : 0)) * scale);
    B(x, horizon - h, 2, h, i % 7 ? C.cliff1 : C.cliff2);
  }
}
function farIsland(api, A, horizon, flash){
  // Charma: seen only in a flash until the harbour is behind you. The spire is the one
  // warm point in the whole sky.
  const show = A.released ? .8 : flash * .9;
  if(show <= .02) return;
  const { B } = api, x0 = Math.round(api.bw * .78);
  api.alphaWrap(show, () => {
    for(let i = 0; i < 60; i++){ const h = Math.round(4 + Math.sin(i * .12) * 3 + (i > 26 && i < 34 ? 6 : 0)); B(x0 + i, horizon - h, 1, h, '#0d151c'); }
    B(x0 + 30, horizon - 22, 1, 12, '#6b5a2e'); B(x0 + 30, horizon - 23, 1, 2, C.gold);
  });
  if(A.released) api.glow(x0 + 30, horizon - 22, 6, '255,217,138', .3);
}

/* ── Platforms ────────────────────────────────────────────────────────────── */
function plankTop(api, x0, x1, y, lit){
  const { B } = api;
  B(x0, y, x1 - x0, 1, lit || C.woodLit);
  B(x0, y + 1, x1 - x0, 2, C.wood3);
  for(let x = x0 + 6; x < x1; x += 11) B(x, y + 1, 1, 2, C.plank);
}
function plat(api, o){
  if(o.gone) return true;
  const { B, WX, WY } = api;
  const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), y = WY(o.y), w = x1 - x0;
  switch(o.actArt){
    case 'deck': plankTop(api, x0, x1, y); B(x0, y + 3, w, 3, C.wood2); return true;
    case 'quarterdeck': case 'forecastle': {
      // A raised deck is a cabin: its face runs down to the main deck.
      const floor = WY(0), fx = o.actArt === 'forecastle' ? x0 : x1 - 2;
      B(x0, y + 3, w, floor - y - 3, C.wood1);
      for(let yy = y + 6; yy < floor; yy += 6) B(x0, yy, w, 1, C.wood0);
      B(fx, y, 2, floor - y, C.wood3);
      if(o.actArt === 'quarterdeck'){ B(x0 + Math.round(w * .45), y + 9, 7, 11, '#2b2014'); B(x0 + Math.round(w * .45) + 1, y + 10, 5, 4, '#e0b060'); }
      plankTop(api, x0, x1, y);
      for(let x = x0 + 3; x < x1; x += 9) B(x, y - 7, 1, 7, C.wood2);
      B(x0, y - 8, w, 2, C.wood3);
      return true;
    }
    case 'step': B(x0, y, w, WY(0) - y, C.wood2); plankTop(api, x0, x1, y); return true;
    case 'yard': {
      B(x0, y, w, 3, C.wood3); B(x0, y, w, 1, C.woodLit);
      for(let x = x0 + 8; x < x1; x += 14) B(x, y + 3, 1, 3, C.rope);
      B(x0 + 2, y + 6, w - 4, 1, C.ropeDim);
      return true;
    }
    case 'hulk': {
      const floor = WY(WATER_Y) + 20;
      B(x0 - 6, y + 3, w + 18, floor - y, '#141a14');
      for(let yy = y + 6; yy < floor; yy += 5) B(x0 - 6, yy, w + 18, 1, '#0c100b');
      for(let x = x0; x < x1; x += 3){ const n = api.hash(x, 3); if(n < .08) continue; B(x, y + (n > .9 ? 2 : 0), 3, 2, n > .5 ? '#3f4a33' : '#2e3526'); }
      B(x0 + Math.round(w * .35), y - 60, 4, 60, '#20261c'); B(x0 + Math.round(w * .35) - 6, y - 62, 12, 3, '#20261c');
      return true;
    }
    case 'hulk-windlass': {
      B(x0, y, w, WY(o.y - 50) - y, '#23291f');
      B(x0 + 6, y - 12, w - 12, 12, C.iron1); B(x0 + 6, y - 12, w - 12, 1, C.iron3);
      for(let x = x0 + 9; x < x1 - 9; x += 7) B(x, y - 12, 2, 12, C.iron0);
      B(x0 + w / 2 - 1, y - 20, 3, 8, C.iron2);
      const intact = state(api).hulk.state !== 'drifting' && state(api).hulk.state !== 'sunk';
      if(intact){
        const mx = x0 + w / 2;
        B(mx - 10, y - 14, 8, 3, C.gold); B(mx + 2, y - 14, 8, 3, C.gold);
        B(mx - 2, y - 11, 4, 7, C.iron0);
        const drop = Math.floor(api.time * 10) % 10;
        B(mx - 1, y - 36 + drop, 2, 4, C.gold);
        B(mx - 4, y - 28 + drop, 3, 2, C.gold); B(mx + 2, y - 28 + drop, 3, 2, C.gold);
      }
      return true;
    }
    case 'pier': {
      plankTop(api, x0, x1, y, '#7a5c3a');
      for(let x = x0 + 10; x < x1; x += 36) B(x, y + 3, 4, WY(WATER_Y - 60) - y, C.wood1);
      B(x0, y + 3, w, 2, C.wood2);
      return true;
    }
    case 'quay': {
      const floor = WY(WATER_Y - 80);
      B(x0, y, w, floor - y, C.stone1);
      for(let yy = y + 2, row = 0; yy < floor; yy += 9, row++){
        B(x0, yy, w, 1, C.stone0);
        for(let x = x0 + (row % 2 ? 6 : 0); x < x1; x += 22) B(x, yy, 1, 9, C.stone0);
      }
      B(x0, y, w, 2, C.stone3); B(x0, y, w, 1, C.stoneLit);
      for(let x = x0; x < x1; x += 5) if(api.hash(x, 9) > .8) B(x, y + 2, 2, 1, C.wet);
      return true;
    }
    case 'block': {
      const floor = WY(0);
      B(x0, y, w, floor - y, C.stone2); B(x0, y, w, 2, C.stoneLit);
      B(x0, y + 12, w, 1, C.stone0); B(x0 + Math.round(w / 2), y + 2, 1, 10, C.stone0);
      return true;
    }
    case 'ledge': {
      B(x0 - 4, y, w + 8, 10, C.cliff3); B(x0 - 4, y, w + 8, 1, C.cliffLit);
      for(let x = x0; x < x1; x += 6) B(x, y + 10, 4, 2 + Math.round(api.hash(x, 2) * 5), C.cliff2);
      return true;
    }
    case 'rock': {
      const floor = WY(WATER_Y - 40);
      for(let x = x0 - 10; x < x1 + 10; x += 2){
        const k = (x - x0) / Math.max(1, w), bump = Math.round(Math.sin(k * Math.PI) * 10 + api.hash(x, 6) * 3);
        B(x, y - bump + 8, 2, floor - y + bump, api.hash(x >> 2, 4) > .6 ? C.stone1 : C.stone0);
      }
      return true;
    }
  }
  return false;
}

/* ── Objects ──────────────────────────────────────────────────────────────── */
function object(api, o){
  switch(o.type){
    case 'actShip': drawShip(api, o); return true;
    case 'actIron': drawIron(api, o); return true;
    case 'actProp': drawShipProp(api, o); return true;
    case 'seam': drawLine(api, o); return true;
    case 'actStaple': drawStaple(api, o); return true;
    case 'actRing': if(!o.gone) drawRing(api, o); return true;
    case 'actRelic': if(!o.gone) drawRelic(api, o); return true;
    case 'actCliff': drawCliff(api, o); return true;
  }
  return false;
}
function drawShip(api, o){
  const { B, WX, WY } = api, A = state(api) || {}, K = A2(), c = K && K.constants;
  if(!c) return;
  const off = A.shipOff || 0, t = api.time;
  const sx0 = WX(c.DECK_X1 + off - 70), sx1 = WX(c.DECK_X2 + off + 150), deck = WY(0), keel = WY(WATER_Y - 70);
  // Hull: a long curve, the bow raked up and forward.
  for(let x = sx0; x < sx1; x++){
    const k = (x - sx0) / Math.max(1, sx1 - sx0);
    const bowLift = k > .82 ? Math.pow((k - .82) / .18, 2) * 26 : 0, sternLift = k < .07 ? (1 - k / .07) * 10 : 0;
    const top = deck + 5 - Math.round(bowLift * .35), bot = keel - Math.round(bowLift) - Math.round(sternLift) - Math.round(Math.sin(k * Math.PI) * 6);
    if(bot <= top) continue;
    B(x, top, 1, bot - top, C.wood1);
    B(x, top, 1, 2, C.wood3);
    for(let yy = top + 7; yy < bot; yy += 7) B(x, yy, 1, 1, C.wood0);
  }
  // The breach the beast left, once it has gone.
  if(A.released){ const bx = WX(c.DECK_X2 + off - 260); B(bx, deck + 12, 16, 9, '#0a0604'); B(bx + 3, deck + 10, 10, 2, C.wood3); }
  // Bowsprit and the mast.
  const bow = WX(c.DECK_X2 + off + 150);
  for(let i = 0; i < 70; i++) B(bow - 10 + i, deck - 14 - Math.round(i * .45), 3, 2, C.wood3);
  const mx = WX(c.MAST_X + off), top = WY(560);
  B(mx - 2, top, 5, deck - top, C.wood2); B(mx - 2, top, 1, deck - top, C.wood3);
  B(mx - 7, WY(470), 15, 4, C.wood3); B(mx - 7, WY(470) + 4, 15, 1, C.wood0);            // crow's nest
  B(mx + 3, top - 1, 14, 5, '#5c2230'); B(mx + 3, top - 1, 14 - Math.round((1 + Math.sin(t * 6)) * 2), 2, '#86333f');
  // Standing rigging (decoration; the RUNNING rigging is the rideable seams).
  line(api, WX(c.DECK_X1 + off + 30), WY(8), mx, WY(540), '#3a2e22');
  line(api, WX(c.DECK_X2 + off + 140), WY(46), mx, WY(540), '#3a2e22');
  // The sail: fills with the wind the voyage clock sets. Full sail pulls the rigging taut.
  const fill = Math.max(0, Math.min(1, A.sail == null ? .3 : A.sail));
  const yardY = WY(c.YARD.y) + 3, footY = WY(118), half = Math.round(c.YARD.w * api.Z / 2) - 6;
  for(let yy = yardY; yy < footY; yy++){
    const k = (yy - yardY) / Math.max(1, footY - yardY), belly = Math.round(Math.sin(k * Math.PI) * fill * 16);
    const w = Math.round(half * (1 - k * .12));
    const x0 = mx - w + belly, x1 = mx + w + belly;
    const shade = k < .15 ? C.canvas2 : k > .85 ? C.canvas0 : C.canvas1;
    B(x0, yy, x1 - x0, 1, shade);
    if((yy - yardY) % 13 === 0) B(x0, yy, x1 - x0, 1, C.canvas0);
    if(fill > .7 && k > .2 && k < .7) B(x0 + Math.round((x1 - x0) * .55), yy, 3, 1, C.canvas3);
  }
  // Three countries, three patches: the keel's wind-ash, the mast's rangefinder paint, the Keep's wax.
  B(mx - 30, yardY + 18, 8, 6, '#6d7a5a'); B(mx + 14, yardY + 40, 7, 8, '#7a5a3a'); B(mx - 8, yardY + 64, 9, 5, '#8a7a4a');
}
function drawIron(api, o){
  const { B, WX, WY } = api, A = state(api) || {};
  const x = WX(o.x), y = WY(o.y), t = api.time;
  if(o.actId === 'lantern'){
    B(x - 1, y - 26, 2, 26, C.iron2); B(x - 4, y - 32, 8, 7, C.iron1); B(x - 3, y - 31, 6, 5, '#f0c070');
    api.glow(x, y - 28, 18, '240,190,110', .25);
  } else if(o.actId === 'windlass'){
    B(x - 11, y - 12, 22, 12, C.wood2); B(x - 9, y - 16, 18, 8, C.iron1); B(x - 9, y - 16, 18, 1, C.iron3);
    for(let i = -8; i < 9; i += 4) B(x + i, y - 16, 1, 8, C.iron0);
  } else if(o.actId === 'masthead'){
    B(x - 4, WY(520), 9, 3, C.iron2); B(x - 4, WY(520), 9, 1, C.iron3);
  }
  // THE CRACKLE. The only electric colour in the region, and only on iron about to be hit.
  const b = (A.bolts || []).find(q => q.iron === o.actId && !q.struck);
  if(b){
    const k = 1 - Math.max(0, b.t) / Math.max(.01, b.warn), cy = o.actId === 'masthead' ? WY(520) : y - 14;
    api.glow(x, cy, 14 + k * 20, '200,230,255', .25 + k * .45);
    for(let i = 0; i < 3 + Math.round(k * 5); i++){
      const a = t * 20 + i * 2.1, r = 4 + api.hash(i, Math.floor(t * 20)) * (8 + k * 10);
      B(Math.round(x + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1, C.bolt);
    }
  }
}
function drawShipProp(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y);
  if(o.kind === 'helm'){
    B(x - 1, y - 14, 3, 14, C.wood2);
    const r = 7, cx = x, cy = y - 18, spin = (state(api) || {}).castOff ? api.time * 5 : 0;
    for(let a = 0; a < 16; a++){ const ang = a / 16 * Math.PI * 2; B(Math.round(cx + Math.cos(ang) * r), Math.round(cy + Math.sin(ang) * r), 1, 1, C.woodLit); }
    for(let s = 0; s < 4; s++){ const ang = spin + s * Math.PI / 4; B(Math.round(cx + Math.cos(ang) * 9), Math.round(cy + Math.sin(ang) * 9), 1, 1, C.wood3); B(Math.round(cx - Math.cos(ang) * 9), Math.round(cy - Math.sin(ang) * 9), 1, 1, C.wood3); }
    B(cx - 1, cy - 1, 3, 3, C.iron2);
  }
}
/* Rope and chain. Taut: straight, lit, a travelling glint — a road. Slack: sagging and dim. */
function line(api, x0, y0, x1, y1, col){
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0;
  for(let i = 0; i <= n; i++){ const k = n ? i / n : 0; api.B(Math.round(x0 + (x1 - x0) * k), Math.round(y0 + (y1 - y0) * k), 1, 1, col); }
}
function sag(api, x0, y0, x1, y1, depth, col, step){
  const n = Math.max(8, Math.round(Math.hypot(x1 - x0, y1 - y0) / (step || 2)));
  for(let i = 0; i <= n; i++){
    const k = i / n, x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k + Math.sin(k * Math.PI) * depth;
    api.B(Math.round(x), Math.round(y), 1, 1, col);
  }
}
function drawLine(api, o){
  const { WX, WY } = api;
  if(o.parted) return;
  const x0 = WX(o.ax), y0 = WY(o.ay - 22), x1 = WX(o.bx), y1 = WY(o.by - 22);
  if(!o.gone){
    line(api, x0, y0, x1, y1, C.ropeLit);
    line(api, x0, y0 + 1, x1, y1 + 1, C.rope);
    line(api, x0, y0 - 1, x1, y1 - 1, C.ropeLit);
    const k = (api.time * .8) % 1;
    api.B(Math.round(x0 + (x1 - x0) * k), Math.round(y0 + (y1 - y0) * k) - 1, 2, 3, '#f3e2bc');
  } else sag(api, x0, y0, x1, y1, o.actArt === 'tow' ? 34 : 18, C.ropeDim, 2);
}
function hydraHead(api, id){
  const b = api.G && api.G.boss;
  return b && b.hydraFight && b.hydra ? b.hydra.heads.find(h => h.id === id) : null;
}
function drawStaple(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y), A = state(api) || {};
  // The staple, set in the rock over its ledge.
  B(x - 5, y - 44, 11, 6, C.iron1); B(x - 5, y - 44, 11, 1, C.iron3); B(x - 2, y - 38, 5, 6, C.iron2);
  const h = hydraHead(api, o.actId), broken = A.released || (h && h.free);
  const cracks = h ? h.cracks : 2;
  const lx = x - 8, ly = y - 30;
  if(broken){
    // Hanging open, its shackle thrown back.
    B(lx, ly + 6, 16, 12, C.iron1); B(lx + 12, ly - 2, 3, 8, C.iron2);
    return;
  }
  const strain = h && (h.taut || h.lockWindow > 0);
  B(lx, ly + 6, 16, 14, strain ? C.iron2 : C.iron1);
  B(lx + 2, ly - 2, 3, 9, C.iron2); B(lx + 11, ly - 2, 3, 9, C.iron2); B(lx + 2, ly - 3, 12, 2, C.iron2);
  B(lx + 7, ly + 11, 2, 4, C.iron0);
  if(cracks >= 1){ B(lx + 4, ly + 8, 1, 5, '#0a0c0e'); B(lx + 5, ly + 12, 2, 1, '#0a0c0e'); }
  if(cracks >= 2){ B(lx + 11, ly + 9, 1, 6, '#0a0c0e'); }
  if(strain){
    api.glow(x, ly + 12, 20, '255,233,196', .35); B(lx, ly + 6, 16, 2, C.gold);
    // A split cap and descending motes show the existing slam verb.
    B(x - 6, ly + 10, 5, 2, C.gold); B(x + 2, ly + 10, 5, 2, C.gold);
    const drop = Math.floor(api.time * 12) % 10;
    B(x - 1, ly - 18 + drop, 2, 4, C.gold);
    B(x - 4, ly - 10 + drop, 3, 2, C.gold); B(x + 2, ly - 10 + drop, 3, 2, C.gold);
  }
}
function drawRing(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y), p = api.G.p;
  if(o.towRing){
    const by = WY(WATER_Y), bob = Math.round(Math.sin(api.time * 2 + o.x) * 2);
    line(api, x, y + 8, x, by + bob, C.rope);
    B(x - 10, by - 5 + bob, 20, 7, C.wood2); B(x - 12, by - 5 + bob, 24, 2, C.woodLit);
    B(x - 5, by - 9 + bob, 10, 5, C.iron2);
  }
  if(o.piling){ B(x - 3, y + 6, 6, WY(WATER_Y - 40) - y - 6, C.wood1); B(x - 3, y + 6, 1, WY(WATER_Y - 40) - y - 6, C.wood2); B(x - 4, y + 5, 8, 2, C.wood3); }
  if(o.shipRing){ const A = state(api) || {}, c = A2() && A2().constants; if(c){ line(api, x, y, WX(c.MAST_X + (A.shipOff || 0)), WY(470), '#3a2e22'); } }
  // Iron the hook can take: a heavy ring, lit on its upper rim, with its own faint gleam so
  // it reads as a place to go even before the hook is yours.
  for(let a = 0; a < 26; a++){ const ang = a / 26 * Math.PI * 2, r = 8;
    B(Math.round(x + Math.cos(ang) * r), Math.round(y + Math.sin(ang) * r), 2, 2, Math.sin(ang) < -.3 ? C.ironLit : a % 3 ? C.iron2 : C.iron3); }
  B(x - 1, y + 7, 3, 4, C.iron1);
  api.glow(x, y, 10, '201,212,220', .12);
  // The ring the hook would take, if pressed now.
  const K = A2();
  if(K && typeof hasCapability === 'function' && hasCapability('chain-hook') && !p.actHook){
    const best = K.hookTargets(p)[0];
    if(best && best.o === o) api.glow(x, y, 18, '201,212,220', .4 + .12 * Math.sin(api.time * 6));
  }
}
function drawRelic(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y);
  B(x - 10, y - 5, 20, 5, C.iron1); B(x - 10, y - 5, 20, 1, C.iron3);             // the broken collar
  B(x + 2, y - 14, 2, 10, C.iron2); B(x + 2, y - 15, 6, 2, C.iron2); B(x + 7, y - 14, 2, 4, C.iron2);   // the hook
  B(x - 6, y - 9, 6, 2, '#6b4a30');                                                // a wrapped grip
  api.glow(x + 4, y - 10, 10, '201,212,220', .18 + .08 * Math.sin(api.time * 3));
}
function drawCliff(api, o){
  const { B, WX, WY } = api;
  const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), base = WY(0), top = WY(o.h);
  // The face: broken courses of rock, lit a little from the sea side, with the storm
  // running down it in a few dark wet seams.
  for(let x = x0; x < x1; x += 2){
    const i = (x - x0) >> 1, ridge = Math.round(Math.sin(i * .03) * 18 + api.hash(i >> 3, 21) * 14);
    B(x, top - ridge, 2, base - top + ridge, C.cliff1);
  }
  for(let yy = top, row = 0; yy < base; yy += 14 + (row % 3) * 4, row++){
    for(let x = x0 + (row % 2) * 9; x < x1; ){
      const w = 18 + Math.round(api.hash(x, row) * 30), h = 12 + (row % 3) * 4;
      const n = api.hash(x + 3, row + 7);
      B(x, yy, Math.min(w - 2, x1 - x), h - 2, n > .66 ? C.cliff2 : n > .2 ? C.cliff1 : C.cliff0);
      B(x, yy, Math.min(w - 2, x1 - x), 1, n > .5 ? C.cliff3 : C.cliff2);
      x += w;
    }
  }
  for(let x = x0; x < x1; x += 53){ const sx = x + Math.round(api.hash(x, 7) * 30); B(sx, top + 20, 2, base - top - 20, 'rgba(10,16,22,.35)'); }
  api.ctx.fillStyle = 'rgba(120,160,185,.05)'; api.ctx.fillRect(x0, top, x1 - x0, base - top);
}

/* ── The world layer: water, waves, iron sweeps, bolts, the hydra, the hook line ── */
function world(api){
  const A = state(api); if(!A) return;
  const { B, WX, WY, bw } = api, t = api.time;
  // Waves riding over the deck from the bow. A swell is a rolling hump; a breaker is a
  // wall with a lip, grey-green and taller than every deck but the yard.
  for(const w of A.waves){
    // Water runs toward the stern (west): a steep face at w.x — where it hits — and a long
    // back slope behind it. A breaker's lip curls over its own face.
    const cx = WX(w.x), base = WY(0), H = Math.round(w.h * api.Z), back = Math.round((w.big ? 236 : 100) * api.Z), front = Math.round((w.big ? 36 : 32) * api.Z);
    const roll = (w.age || 0) * (w.big ? 3 : 5);
    for(let dx = -front; dx <= back; dx++){
      const k = dx < 0 ? Math.sqrt(Math.max(0, 1 - (dx / front) * (dx / front))) : Math.pow(Math.max(0, 1 - dx / back), 1.5);
      const hh = Math.round(H * k * (1 - .035 * (1 + Math.sin(roll + dx * .13)))); if(hh <= 0) continue;
      B(cx + dx, base - hh, 1, hh + 3, dx < 0 ? '#2f606b' : dx < back * .3 ? '#26505b' : '#1c3d47');
      if(dx >= -2 && dx <= 5) B(cx + dx, base - hh, 1, 2, C.foam);
      else if((dx * 7 + Math.floor(t * 9)) % 11 === 0) B(cx + dx, base - hh, 1, 1, C.foamDim);
      if(dx > 5 && dx < back - 4){
        const flow = ((dx * .6 + roll * 7) % Math.max(5, hh));
        if(hh > 8 && dx % 3 === 0) B(cx + dx, base - Math.round(flow), 3, 1, '#477d87');
      }
      if(dx < 0 && (dx + Math.floor(t * 12)) % 3 === 0) B(cx + dx, base - hh + 4, 1, Math.max(0, hh - 6), 'rgba(160,200,210,.18)');
    }
    for(let i = 0; i < (w.big ? 16 : 8); i++){
      const age = ((w.age || 0) * 1.5 + i / 8) % 1;
      const sx = cx - Math.round(age * (w.big ? 35 : 20));
      const sy = base - H + Math.round(age * age * 22 - age * 14) + i % 3;
      B(sx, sy, 2, age < .6 ? 2 : 1, i % 3 ? C.foam : C.foamDim);
    }
    for(let i = 0; i < 6; i++) B(cx + 8 + i * 8, base + (i % 2), 5 + i, 2, C.foamDim);
    if(w.big){
      for(let i = 0; i < 16; i++){ const a = i / 15 * Math.PI * .9;
        B(Math.round(cx - 2 - Math.sin(a) * 15), Math.round(base - H + (1 - Math.cos(a)) * 10), 2, 2, i % 3 ? C.foam : C.foamDim); }
      for(let i = 0; i < 9; i++) B(cx - 8 + Math.round(api.hash(i, Math.floor(t * 10)) * 24), base - H - 3 - Math.round(api.hash(i, 3) * 12), 1, 1, C.foam);
    }
  }
  // The chain gate: a great chain strung across the channel, crossing the ship's plane
  // where it bites. Big links, lit from the sea side, heavy enough to read from the bow.
  for(const s of A.sweeps){
    const x = WX(s.x), yTop = WY(s.y1), yBot = WY(s.y0);
    heavyChain(api, x + 150, -10, x + 4, yTop, false);            // back up into the storm
    heavyChain(api, x - 4, yBot, x - 70, WY(WATER_Y - 30), true);  // down and toward you
    for(let yy = yTop, i = 0; yy < yBot; yy += 5, i++){
      if(i % 2){ B(x - 7, yy, 14, 5, C.iron1); B(x - 7, yy, 14, 1, C.iron3); B(x - 3, yy + 2, 6, 1, C.iron0); }
      else { B(x - 3, yy - 1, 6, 7, C.iron2); B(x - 3, yy - 1, 1, 7, C.ironLit); }
    }
    if(s.kind === 'low') for(let i = 0; i < 4; i++) B(x - 10 + Math.round(api.hash(i, Math.floor(t * 30)) * 20), WY(0) - 1 - Math.round(api.hash(i, 9) * 3), 1, 1, '#ffd9a0');
  }
  // Wakes: something enormous passing just under the surface.
  for(const w of A.wakes || []){
    const x = WX(w.x), y = WY(WATER_Y);
    for(let dx = -60; dx < 40; dx++) B(x + dx, y - Math.round(Math.max(0, 6 - Math.abs(dx + 10) * .12)), 1, 2, C.foamDim);
    for(let i = 0; i < 10; i++) B(x + 30 + i * 9, y - 1 - (i % 2), 5, 1, C.foam);
  }
  drawHydra(api, A);
  // The near water, over the hull and the pilings.
  const wy = WY(WATER_Y) + ((api.env && api.env.reducedMotion) || A.docked ? 0 : Math.round(Math.sin(t * .9) * 2));
  for(let x = 0; x < bw; x += 2){
    const wx = api.camX + x / api.Z, swell = Math.round(Math.sin(wx * .012 + t * 1.8) * 1.5 + Math.sin(wx * .031 - t * 2.3));
    B(x, wy + swell, 2, api.bh - wy - swell, '#0a1c24');
    B(x, wy + swell, 2, 1, (Math.floor(wx / 20) + Math.floor(t * 3)) % 5 ? C.crest : C.foam);
  }
  api.ctx.fillStyle = 'rgba(8,24,32,.45)'; api.ctx.fillRect(0, wy + 3, bw, api.bh - wy);
  // Bolts: a thin line of static first, then the strike.
  for(const b of A.bolts){
    const x = WX(b.x), y = WY(b.y);
    if(!b.struck){
      const k = 1 - Math.max(0, b.t) / Math.max(.01, b.warn);
      if(!b.iron){
        for(let a = 0; a < 20; a++){ const ang = a / 20 * Math.PI * 2; B(Math.round(x + Math.cos(ang) * b.r * api.Z), Math.round(y + Math.sin(ang) * 3), 1, 1, k > .6 ? C.bolt : '#6f8fa6'); }
      }
      if(k > .45) api.alphaWrap((k - .45) * 1.2, () => line(api, x, 0, x, y - 4, '#9fc3dc'));
    } else {
      let cx = x, cy = 0;
      const seg = Math.max(6, Math.round(y / 10));
      for(let i = 0; i < 10; i++){
        const nx = x + (i < 9 ? Math.round((api.hash(i, Math.floor(b.life * 40)) - .5) * 18) : 0), ny = Math.min(y, cy + seg);
        line(api, cx, cy, nx, ny, C.bolt); line(api, cx + 1, cy, nx + 1, ny, '#9fc3dc');
        cx = nx; cy = ny;
      }
      api.glow(x, y, 26, '220,240,255', .6);
    }
  }
  // The hook's chain from the knight's hand to the ring.
  const p = api.G.p;
  if(p.actHook){
    const hx = WX(p.x), hy = WY(p.y + 40), rx = WX(p.actHook.ring.x), ry = WY(p.actHook.ring.y);
    const k = p.actHook.state === 'pull' ? 1 : 1;
    chainLine(api, hx, hy, Math.round(hx + (rx - hx) * k), Math.round(hy + (ry - hy) * k), C.iron2, C.iron3);
  }
}
function heavyChain(api, x0, y0, x1, y1, near){
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 5));
  for(let i = 0; i <= n; i++){
    const k = i / n, x = Math.round(x0 + (x1 - x0) * k), y = Math.round(y0 + (y1 - y0) * k);
    if(i % 2){ api.B(x - 4, y - 2, 8, 4, near ? C.iron2 : C.iron1); api.B(x - 4, y - 2, 8, 1, near ? C.ironLit : C.iron3); }
    else { api.B(x - 2, y - 4, 4, 8, near ? C.iron1 : C.iron0); api.B(x - 2, y - 4, 1, 8, near ? C.iron3 : C.iron2); }
  }
}
function chainLine(api, x0, y0, x1, y1, dark, lit){
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 3));
  for(let i = 0; i <= n; i++){
    const k = i / n, x = Math.round(x0 + (x1 - x0) * k), y = Math.round(y0 + (y1 - y0) * k);
    api.B(x - (i % 2), y - (1 - i % 2), 2, 2, i % 2 ? dark : lit);
  }
}

/* ── THE CHAINED HYDRA ────────────────────────────────────────────────────── */
function drawHydra(api, A){
  const e = api.G.boss;
  // Not before the harbour: its staples are still out at sea while the ship sails.
  if(!e || !e.hydraFight || !e.hydra || e.hydraGone || !A.docked) return;
  const { B, WX, WY } = api, H = e.hydra, t = api.time;
  const bodyX = WX(e.x), bodyY = WY(WATER_Y + 26);
  const rising = H.release ? Math.min(1, H.release.t / 1.4) : 0;
  // The body: a hump of scale out of the water past the quay's end.
  for(let dx = -95; dx <= 95; dx++){
    const k = 1 - (dx / 95) * (dx / 95), hh = Math.round(k * (52 + rising * 40));
    B(bodyX + dx, bodyY - hh, 1, hh + 16, dx % 9 === 0 ? C.hyd0 : C.hyd1);
    B(bodyX + dx, bodyY - hh, 1, 2, C.hyd3);
    if(k > .2 && (dx + 95) % 11 === 0) B(bodyX + dx, bodyY - hh + 4, 3, 3, C.hyd2);
  }
  for(const h of H.heads){
    const staple = { x:WX(h.sx), y:WY(h.sy - 16) };
    const hx = WX(h.x), hy = WY(h.y);
    const under = h.y < WATER_Y - 20;
    // The chain first, behind the neck: straight and lit when taut, drooping when not.
    if(!h.free){
      const d = Math.hypot(h.x - h.sx, h.y - (h.sy - 16)), slack = Math.max(0, h.len - d);
      const col = h.taut ? C.iron3 : C.iron1, lit = h.taut ? C.ironLit : C.iron2;
      if(h.taut){ chainLine(api, staple.x, staple.y, hx, hy + 4, col, lit); if(h.crackle > 0) crackleAlong(api, staple, { x:hx, y:hy + 4 }, h.crackle); }
      else sagChain(api, staple.x, staple.y, hx, hy + 4, Math.min(90, slack * .28) * api.Z * 2, col, lit);
    } else if(!A.released || H.release) {
      // A freed head's broken chain hangs from its staple.
      for(let i = 0; i < 14; i++) B(staple.x - (i % 2), staple.y + i * 3, 2, 2, i % 2 ? C.iron1 : C.iron2);
    }
    if(under && h.st === 'sunk'){
      // Waiting under the water: two eyes and a darker shape.
      api.alphaWrap(.5, () => { B(hx - 8, WY(WATER_Y) + 4, 16, 5, C.hyd0); });
      B(hx - 3, WY(WATER_Y) + 5, 1, 1, eyeCol(h)); B(hx + 3, WY(WATER_Y) + 5, 1, 1, eyeCol(h));
      continue;
    }
    // The neck: a thick curve out of the body.
    neck(api, bodyX - 20, bodyY - 20, hx, hy, h);
    drawHead(api, h, hx, hy);
    if(h.taut && !h.free){
      const rx = hx, ry = hy + 4;
      for(let i = 0; i < 20; i++){const a = i / 20 * Math.PI * 2; B(Math.round(rx + Math.cos(a) * 9), Math.round(ry + Math.sin(a) * 9), 2, 2, C.ironLit);}
      const k = (t * .8) % 1;
      B(Math.round(rx + (staple.x - rx) * k) - 2, Math.round(ry + (staple.y - ry) * k) - 2, 4, 4, C.gold);
    }
    if(['wind','call','lunge'].includes(h.st)){
      api.glow(hx, hy - 8, 23, '255,207,110', h.st === 'lunge' ? .2 : .4);
    }
  }
}
function eyeCol(h){ return h.id === 'bite' ? C.eyeBite : h.id === 'tide' ? C.eyeTide : C.eyeStorm; }
function neck(api, x0, y0, x1, y1, h){
  const cx = (x0 + x1) / 2 + 30, cy = Math.min(y0, y1) - 60;
  // Sample by length, so a neck at full reach is still one body and not a row of beads.
  const n = Math.max(44, Math.round(Math.hypot(x1 - x0, y1 - y0) / 5));
  for(let i = 0; i <= n; i++){
    const k = i / n, a = 1 - k;
    const x = a * a * x0 + 2 * a * k * cx + k * k * x1, y = a * a * y0 + 2 * a * k * cy + k * k * y1;
    const r = Math.round(15 - k * 7);
    api.B(Math.round(x - r), Math.round(y - r), r * 2, r * 2, C.hyd1);
    api.B(Math.round(x - r), Math.round(y - r), r * 2, 2, C.hyd3);                 // the lit top
    api.B(Math.round(x - r + 2), Math.round(y + r - 4), r * 2 - 4, 2, C.belly);    // the pale throat
    if(i % 3 === 0) api.B(Math.round(x - 2), Math.round(y - r + 3), 4, 2, C.hyd2);  // scale rows
  }
}
function drawHead(api, h, x, y){
  const { B } = api, p = api.G.p, face = Math.sign(api.WX(p.x) - x) || -1, S = 2;
  const open = h.st === 'lunge' || h.st === 'strain' || h.st === 'swipe' || (h.st === 'rear' && h.spat) ? 1 : h.st === 'wind' || h.st === 'call' ? .5 : 0;
  const R = (dx, dy, w, hh, col) => B(x + (face > 0 ? dx : -dx - w) * S, y + dy * S, w * S, hh * S, col);
  // Skull, brow and snout; the jaw hangs by `open`.
  R(-9, -8, 18, 12, C.hyd2); R(-9, -8, 18, 2, C.hyd3); R(-7, -9, 12, 1, C.hydLit);
  R(6, -5, 13, 7, C.hyd2); R(6, -5, 13, 1, C.hydLit);
  const jaw = Math.round(open * 6);
  R(4, 2 + jaw, 14, 3, C.hyd1); R(4, 4 + jaw, 14, 1, C.belly);
  if(open > 0) for(let i = 0; i < 5; i++){ R(7 + i * 2.4, 2, 1, 2, '#ece4d0'); R(7 + i * 2.4, 1 + jaw, 1, 2, '#ece4d0'); }
  // A crest per head, so the three read apart at a glance: fins, frill, iron horns.
  if(h.id === 'bite') for(let i = 0; i < 3; i++) R(-6 - i * 3, -11 - i, 2, 4, C.hyd3);
  if(h.id === 'tide') for(let i = 0; i < 5; i++) R(-9 + i * 3, -12 + (i % 2), 2, 5, '#4fb0a0');
  if(h.id === 'storm'){ R(-5, -16, 2, 8, C.iron3); R(1, -17, 2, 9, C.iron3); }
  const ec = eyeCol(h);
  R(3, -5, 2, 2, ec);
  api.glow(x + face * 7, y - 8, 12, h.id === 'bite' ? '255,207,110' : h.id === 'tide' ? '143,240,212' : '207,238,255', .4);
  // The collar the chain holds.
  if(!h.free){ R(-12, -8, 4, 15, C.iron1); R(-12, -8, 4, 1, C.iron3); }
  if(h.flinch > 0) api.glow(x, y, 26, '255,233,196', .35);
}
function sagChain(api, x0, y0, x1, y1, depth, dark, lit){
  const n = Math.max(6, Math.round(Math.hypot(x1 - x0, y1 - y0) / 3));
  for(let i = 0; i <= n; i++){
    const k = i / n, x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k + Math.sin(k * Math.PI) * depth;
    api.B(Math.round(x) - (i % 2), Math.round(y) - (1 - i % 2), 2, 2, i % 2 ? dark : lit);
  }
}
function crackleAlong(api, a, b, k){
  for(let i = 0; i < 6 + Math.round(k * 10); i++){
    const u = api.hash(i, Math.floor(api.time * 24)), x = a.x + (b.x - a.x) * u, y = a.y + (b.y - a.y) * u;
    api.B(Math.round(x + (api.hash(i, 3) - .5) * 6), Math.round(y + (api.hash(i, 5) - .5) * 6), 1, 1, C.bolt);
  }
  api.glow(Math.round((a.x + b.x) / 2), Math.round((a.y + b.y) / 2), 20 + k * 20, '200,230,255', .15 + k * .35);
}

/* ── Enemies ──────────────────────────────────────────────────────────────── */
function enemy(api, e){
  if(e.type === 'hydra') return true;                       // drawn with its necks in `world`
  if(e.type === 'stormgull'){ drawGull(api, e); return true; }
  if(e.type === 'reefcrab'){ api.drawAwareness(e); drawCrab(api, e); return true; }
  return false;
}
function drawGull(api, e){
  const { B, WX, WY } = api, x = WX(e.x), y = WY(e.y + (e.h || 18) / 2), t = api.time;
  const face = e.face || -1, flap = Math.sin(t * 14 + (e.aiId || 0)), diving = (e.vy || 0) > 80;
  const wy = Math.round(diving ? 2 : flap * 4);
  if(e.hitFlash > 0) api.glow(x, y, 10, '255,255,255', .4);
  B(x - 5, y - 2, 11, 4, '#d9e2e6'); B(x - 5, y + 1, 11, 1, '#9aa6ad');
  B(x + face * 5, y - 2, face * 3, 2, '#d9e2e6'); B(x + face * 8, y - 1, face * 2, 1, '#e8b25a');
  B(x - 14, y - 2 - wy, 10, 2, '#b8c4ca'); B(x + 4, y - 2 - wy, 10, 2, '#b8c4ca');
  B(x - 15, y - 2 - wy, 2, 2, '#46525a'); B(x + 13, y - 2 - wy, 2, 2, '#46525a');
  B(x + face * 6, y - 2, 1, 1, '#1b1f22');
}
function drawCrab(api, e){
  const { B, WX, WY } = api, x = WX(e.x), y = WY(e.y), t = api.time;
  const sf = e.shieldFace || e.face || -1, walk = Math.round(Math.sin(t * 12 + (e.aiId || 0)) * 1);
  if(e.hitFlash > 0) api.glow(x, y - 6, 12, '255,255,255', .4);
  for(let i = -2; i <= 2; i++){ B(x + i * 4, y - 3, 1, 3, '#6b2a18'); B(x + i * 4 + (i % 2 ? walk : -walk), y - 1, 1, 1, '#6b2a18'); }
  B(x - 10, y - 10, 20, 7, '#9a4428'); B(x - 9, y - 11, 18, 2, '#c05a36'); B(x - 10, y - 4, 20, 1, '#5a2414');
  // The shell's thick front: the side a blade glances off.
  B(x + sf * 8 - (sf < 0 ? 3 : 0), y - 12, 4, 9, '#d8744a'); B(x + sf * 9 - (sf < 0 ? 1 : 0), y - 12, 1, 9, '#f0a070');
  // Claws up: the big one forward over the shell, the small one tucked behind.
  B(x + sf * 11, y - 16 + walk, sf * 3, 7, '#b0503a'); B(x + sf * 12, y - 19 + walk, sf * 5, 3, '#d8744a');
  B(x + sf * 16, y - 17 + walk, sf * 2, 3, '#f0a070');
  B(x - sf * 11, y - 13, -sf * 2, 5, '#9a4428'); B(x - sf * 13, y - 15, -sf * 3, 2, '#c05a36');
  B(x - 3, y - 13, 1, 2, '#1b1f22'); B(x + 2, y - 13, 1, 2, '#1b1f22');
}

/* ── Overlay: rain, and the flash ─────────────────────────────────────────── */
function overlay(api){
  const A = state(api) || {}, { ctx, bw, bh } = api, t = api.time;
  const reduced = !!(api.env && api.env.reducedMotion);
  const n = Math.round((A.rain == null ? .6 : A.rain) * (reduced ? 50 : 150));
  ctx.fillStyle = 'rgba(170,200,220,.28)';
  for(let i = 0; i < n; i++){
    const h1 = api.hash(i, 1), h2 = api.hash(i, 2), speed = reduced ? 40 : 420;
    const x = ((h1 * bw * 1.3 - t * speed * .45 - api.camX * api.Z * .9) % (bw + 40) + bw + 40) % (bw + 40) - 20;
    const y = ((h2 * bh + t * speed) % (bh + 20)) - 10;
    for(let k = 0; k < 6; k++) ctx.fillRect(Math.round(x - k * .6), Math.round(y + k), 1, 1);
  }
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ ctx.fillStyle = `rgba(215,235,255,${(reduced ? .05 : .16) * flash})`; ctx.fillRect(0, 0, bw, bh); }
}

/* ══════════════ THE KING'S PEOPLE, drawn the same in every region ══════════════
   The Belled (bandaged, a bell at the belt, a white flower in the wrappings, a pike they
   would rather not use), the Sunguard (gilt, a sun on the shield, a bell at the back),
   and the kneeling man. Nothing else in Act Two is gold, and nothing else is white. */
const CAST = {
  flower:'#f4f1e6', throat:'#cfc8b2', leaf:'#4f5c44', leafLit:'#6b7a5a',
  band0:'#8f8775', band1:'#b9b09a', band2:'#d8d0bd', tunic:'#6f6a5c', tunicDark:'#524e44',
  beard:'#6e5e4a', beardLit:'#9a8a72', skin:'#b89a7c', pike:'#a08a68', pikeDark:'#6d5a44', pikeIron:'#c9c4b8', broom:'#9a8a5a',
  guard0:'#7d6228', guard1:'#c9a24a', guard2:'#e8c874', tabard:'#e7dcc0',
  gold0:'#7d6228', gold1:'#b8923c', gold2:'#d8b25a', gold3:'#f3d67a', drift:'#8a7b63', iron2:'#6b594b', iron3:'#8f7a66',
};
function drawBell(api, x, y, scale){
  const { B } = api, s = scale || 1;
  B(x - 1, y, 2, 2 * s, CAST.gold0);
  B(x - 3 * s, y + 2 * s, 6 * s, 4 * s, CAST.gold1); B(x - 4 * s, y + 5 * s, 8 * s, 2 * s, CAST.gold1);
  B(x - 3 * s, y + 2 * s, 1, 4 * s, CAST.gold3); B(x - 1, y + 7 * s, 2, 1 + s, CAST.gold0);
}
/* ── The white trumpet flower ─────────────────────────────────────────────── */
function flower(api, x, y, s){
  const { B } = api;
  B(x, y, 1, 3, CAST.leaf);
  B(x - 1, y + 3, 3, 2, CAST.flower); B(x - 2, y + 5, 5, 1, CAST.flower); B(x, y + 4, 1, 1, CAST.throat);
}
function drawFallen(api, f){
  const { B, WX, WY } = api, x = WX(f.x), y = WY(f.y), a = f.t < 2.4 ? 1 : Math.max(0, 1 - (f.t - 2.4) / 4);
  api.alphaWrap(a, () => {
    if(f.kind === 'sunguard'){ if(f.t < 2.4) kneeling(api, x, y, f.face, 'guard'); else walker(api, x, y, -f.away, f.t, 'guard'); return; }
    // The pike stays where it fell.
    B(x - 14, y - 2, 26, 1, CAST.pike); B(x + 12, y - 3, 3, 2, CAST.pikeIron);
    if(f.t < 2.4) kneeling(api, x, y, f.face, 'belled'); else walker(api, x + Math.round((f.t - 2.4) * 0), y, f.away, f.t, 'belled');
  });
}

/* ── Figures ──────────────────────────────────────────────────────────────── */
/* A bandaged head: wrappings to the eyes, a slit, and a white flower tucked in. */
function bandagedHead(api, x, y, f, beard){
  const { B } = api;
  B(x - 3, y, 7, 7, CAST.band2); B(x - 3, y + 2, 7, 1, CAST.band1); B(x - 3, y + 5, 7, 1, CAST.band1);
  B(x + (f > 0 ? 1 : -2), y + 3, 3, 1, '#2a2520');                                // the eye slit
  // Months of beard below the wrappings, grey coming into it.
  if(beard){ const rows = [7, 7, 6, 5, 3, 2]; rows.forEach((wd, i) => { const bx = x - 3 + Math.floor((7 - wd) / 2); B(bx, y + 7 + i, wd, 1, i % 2 ? CAST.beard : '#5d4f3e'); }); B(x + (f > 0 ? 2 : -1), y + 8, 1, 3, CAST.beardLit); B(x, y + 10, 1, 2, CAST.beardLit); }
  // The flower tucked in behind the ear, on a green stalk so it reads against the white.
  const fx = x - f * 5; B(fx, y + 1, 1, 3, CAST.leafLit); B(fx - 1, y - 1, 3, 2, CAST.flower); B(fx - 2, y - 2, 5, 1, CAST.flower); B(fx, y, 1, 1, CAST.throat);
}
/* Oren without the bandage (after Sable's water): the chainwright's face, a hood of dark hair,
   and the beard of months, grey coming into it. */
function bareHead(api, x, y, f){
  const { B } = api;
  B(x - 3, y, 7, 3, '#4a3a2c'); B(x - 3, y + 3, 1, 3, '#4a3a2c'); B(x + 3, y + 3, 1, 2, '#4a3a2c');   // hair
  B(x - 2, y + 3, 5, 4, CAST.skin); B(x + (f > 0 ? 1 : -1), y + 4, 1, 1, '#2a2520'); B(x + (f > 0 ? -1 : 1), y + 4, 1, 1, '#2a2520');
  const rows = [7, 7, 6, 5, 3, 2]; rows.forEach((wd, i) => { const bx = x - 3 + Math.floor((7 - wd) / 2); B(bx, y + 6 + i, wd, 1, i % 2 ? CAST.beard : '#5d4f3e'); });
  B(x + (f > 0 ? 2 : -1), y + 7, 1, 3, CAST.beardLit); B(x, y + 9, 1, 2, CAST.beardLit);
}
function belledFigure(api, x, y, e){
  const { B } = api, f = e.face || -1, t = api.time, stt = e.st;
  const tremble = (stt === 'hesitate' || stt === 'close') && !e.driven ? Math.round(Math.sin(t * 40 + (e.aiId || 0)) * .6) : 0;
  const walk = e.walking ? Math.round(Math.sin(t * 12 + (e.aiId || 0)) * 2) : 0;
  const lean = stt === 'thrust' ? f * 2 : stt === 'wind' ? -f * 2 : 0;
  const bx = x + tremble + lean;
  if(e.hitFlash > 0) api.glow(bx, y - 14, 12, '255,255,255', .4);
  // Legs, wrapped.
  B(x - 3 + walk, y - 9, 2, 9, CAST.band0); B(x + 1 - walk, y - 9, 2, 9, CAST.band0);
  B(x - 3 + walk, y - 6, 2, 1, CAST.band1); B(x + 1 - walk, y - 4, 2, 1, CAST.band1);
  // Body: a drab tunic, a rope belt, the bell at the belt.
  B(bx - 4, y - 19, 9, 11, CAST.tunic); B(bx - 4, y - 19, 9, 1, '#8a8474'); B(bx - 4, y - 11, 9, 1, CAST.drift);
  drawBell(api, bx - f * 3, y - 11, 1);
  bandagedHead(api, bx, y - 27, f, false);
  if(stt === 'flee'){ B(bx - 5, y - 26, 2, 6, CAST.band1); B(bx + 4, y - 26, 2, 6, CAST.band1); return; }   // hands up, pike gone
  // The forsaken's sick: no pike, the flowers open all over them, hands out for you.
  if(e.zealot){
    flower(api, bx + f * 2, y - 17, 1); flower(api, bx - f * 3, y - 12, 1);
    const reach = stt === 'thrust' ? 9 : stt === 'wind' ? 2 : 5;
    B(bx + (f > 0 ? 4 : -4 - reach), y - 17, reach, 2, CAST.band1); B(bx + (f > 0 ? 4 : -4 - reach), y - 14, reach - 1, 2, CAST.band1);
    return;
  }
  // The pike: swept low as a broom at the post; drawn back on the wind; out on the thrust.
  const hand = { x:bx + f * 3, y:y - 16 };
  let ang, len = 26, back = 0;
  if(stt === 'post'){ ang = 2.3 + Math.sin(t * 3 + (e.aiId || 0)) * .25; len = 20; }
  else if(stt === 'rouse'){ ang = -.4 - Math.min(1, e.t / .9) * .2; }
  else if(stt === 'wind'){ ang = -.25; back = Math.round(Math.min(1, e.t / (e.windT || .6)) * 8); }
  else if(stt === 'thrust'){ ang = -.05; back = -8; }
  else ang = .35;                                                         // low, unwilling
  const ca = Math.cos(ang) * f, sa = Math.sin(ang);
  for(let i = -6; i < len; i++){ const px = Math.round(hand.x - f * back + ca * i), py = Math.round(hand.y + sa * i); B(px, py, 1, 1, CAST.pike); B(px, py + 1, 1, 1, CAST.pikeDark); }
  const hx = Math.round(hand.x - f * back + ca * len), hy = Math.round(hand.y + sa * len);
  if(stt === 'post'){ B(hx - 2, hy, 5, 3, CAST.broom); }
  else { B(hx - (f > 0 ? 0 : 3), hy - 1, 4, 2, CAST.pikeIron); B(hx + (f > 0 ? 3 : -4), hy, 1, 1, '#d8d3c8'); }
  B(hand.x - 1, hand.y - 1, 2, 2, CAST.band1);
  if(stt === 'wind') api.glow(bx, y - 16, 10, '243,214,122', .12 + (e.driven > 0 ? .2 : 0));
}
function sunguardFigure(api, x, y, o){
  const { B } = api, f = o.face || -1, walk = o.walking ? Math.round(Math.sin((o.t || 0) * 10) * 2) : 0, s = o.small ? 1 : 1;
  // Greaves, gilt; a pale tabard with the sun on it; a crested helm.
  B(x - 4 + walk, y - 11, 3, 11, CAST.guard0); B(x + 1 - walk, y - 11, 3, 11, CAST.guard0); B(x - 4 + walk, y - 11, 1, 11, CAST.guard1);
  B(x - 6, y - 25, 12, 15, CAST.guard1); B(x - 6, y - 25, 12, 1, CAST.guard2); B(x - 4, y - 23, 8, 13, CAST.tabard);
  B(x - 1, y - 20, 3, 3, CAST.gold2);
  B(x - 4, y - 33, 8, 8, CAST.guard1); B(x - 4, y - 33, 8, 1, CAST.guard2); B(x + (f > 0 ? 0 : -3), y - 30, 4, 1, '#2a2217');
  B(x - 1, y - 37, 3, 4, CAST.gold3);
  // The bell, at his back on a yoke.
  const bf = -f, sw = Math.round((o.bellSwing || 0) * 4 * Math.sin((o.t || 0) * 22));
  if(!o.silenced){ B(x + bf * 7 - 1, y - 24, 2, 6, CAST.gold0); drawBell(api, x + bf * 9 + sw, y - 19, 1); if(o.bellSwing > .1) api.glow(x + bf * 9, y - 15, 12, '243,214,122', .3 * o.bellSwing); }
  else { B(x + bf * 7 - 1, y - 24, 2, 3, CAST.gold0); }
  // The shield: a gilt sun, carried to the front.
  if(!o.noShield){ const sx = x + f * 8 - (f > 0 ? 0 : 7); B(sx, y - 27, 8, 16, CAST.gold1); B(sx + 1, y - 26, 6, 14, CAST.gold2); B(sx + 2, y - 21, 4, 4, CAST.gold3); B(f > 0 ? sx + 7 : sx, y - 27, 1, 16, CAST.gold0); }
  // The haft.
  const hx = x - f * 5, raise = o.wind ? -12 : o.swing ? 8 : 0;
  if(o.swing){ for(let i = 0; i < 20; i++) B(hx + f * i, y - 20 - Math.round(i * .1), 1, 2, CAST.pike); B(hx + f * 20, y - 23, 3, 4, CAST.gold1); }
  else { for(let i = 0; i < 18; i++) B(hx, y - 12 - i + raise, 1, 1, CAST.pike); B(hx - 1, y - 32 + raise, 3, 4, CAST.gold1); }
}
function kneeling(api, x, y, f, kind){
  const { B } = api;
  if(kind === 'guard'){ B(x - 6, y - 16, 12, 10, CAST.guard1); B(x - 4, y - 23, 8, 7, CAST.guard1); B(x - 6, y - 4, 12, 4, CAST.guard0); B(x + f * 9, y - 6, 8, 6, CAST.gold1); return; }
  B(x - 5, y - 4, 10, 4, CAST.band0); B(x - 4, y - 14, 8, 10, CAST.tunic); drawBell(api, x - f * 2, y - 7, 1);
  bandagedHead(api, x + f, y - 20, f, false);
}
function walker(api, x, y, f, t, kind){
  const { B } = api, w = Math.round(Math.sin(t * 9) * 2);
  if(kind === 'guard'){ B(x - 4 + w, y - 11, 3, 11, CAST.guard0); B(x + 1 - w, y - 11, 3, 11, CAST.guard0); B(x - 6, y - 25, 12, 15, CAST.guard1); B(x - 4, y - 33, 8, 8, CAST.guard1); return; }
  B(x - 3 + w, y - 9, 2, 9, CAST.band0); B(x + 1 - w, y - 9, 2, 9, CAST.band0);
  B(x - 4, y - 19, 9, 11, CAST.tunic); bandagedHead(api, x, y - 27, f, false);
}
/* THE KNEELING MAN. Bandaged to the eyes, the beard of months under the wrappings, a
   chainwright's hammer on the ground by his knee. */
function orenFigure(api, O){
  const { B, WX, WY } = api, x = WX(O.x), y = WY(O.y), f = O.face || -1;
  const hammer = () => { B(x + 7, y - 2, 12, 1, CAST.pike); B(x + 17, y - 5, 4, 5, CAST.iron2); B(x + 17, y - 5, 4, 1, CAST.iron3); };
  if(O.st === 'fallen'){
    hammer();
    B(x - 12, y - 4, 20, 4, CAST.tunic); B(x - 14, y - 6, 6, 5, CAST.band2); B(x - 13, y - 1, 5, 2, CAST.beard);
    return;
  }
  if(O.st === 'kneel' || O.st === 'rise' && O.t < .4){
    hammer();
    const cower = O.flinch > 0 ? 1 : 0, bob = Math.round(Math.sin(api.time * 2) * .5);
    B(x - 5, y - 4, 11, 4, CAST.band0);                                   // knees
    B(x - 4, y - 15 + cower * 2 + bob, 9, 11, CAST.tunic); B(x - 4, y - 15 + cower * 2 + bob, 9, 1, '#8a8474');
    for(let i = 0; i < 3; i++) B(x - 4 + i * 3, y - 6 + bob, 1, 2, CAST.tunicDark);   // the rags
    bandagedHead(api, x + f, y - 24 + cower * 4 + bob, f, true);
    if(cower){ B(x - 5, y - 26 + bob, 3, 7, CAST.skin); B(x + 3, y - 26 + bob, 3, 7, CAST.skin); }   // hands over his head
    return;
  }
  // Standing, and walking with you — or at a shackle, swinging the hammer.
  const w = Math.abs(O.vx || 0) > 20 ? Math.round(Math.sin(api.time * 10) * 2) : 0;
  B(x - 3 + w, y - 10, 2, 10, CAST.band0); B(x + 1 - w, y - 10, 2, 10, CAST.band0);
  B(x - 4, y - 21, 9, 12, CAST.tunic); B(x - 4, y - 21, 9, 1, '#8a8474');
  if(O.cured){ B(x - 4, y - 18, 9, 9, '#7a5a3c'); B(x - 4, y - 18, 9, 1, '#9c7a52'); }          // the chainwright's apron
  if(O.cured) bareHead(api, x, y - 29, f); else bandagedHead(api, x, y - 29, f, true);
  if(O.st === 'break'){
    const up = O.hit > 0 ? 0 : 1, hx = x + f * 6, hy = y - 22 - up * 8;
    for(let i = 0; i < 12; i++) B(hx + Math.round(f * i * (up ? 0.2 : 0.9)), hy + Math.round(i * (up ? 0.95 : 0.4)), 1, 1, CAST.pike);
    B(hx + f * (up ? 2 : 10) - 1, hy + (up ? 10 : 4), 4, 3, CAST.iron2);
  } else { B(x - f * 5, y - 20, 1, 12, CAST.pike); B(x - f * 5 - 1, y - 22, 3, 3, CAST.iron2); }   // he carries the hammer again
}


/* ── The white flower: trumpet flowers open on the cloak, one for the touch and one for
   each measure it has greyed. Drawn over the knight's own figure, facing with it. ────── */
function hero(api, p){
  // The gold stitches go where the knight goes, Act One too; the white flower lives in Act Two.
  const K = A2(); if(!K || !p || !api.G) return;
  const P = K.peekPath(); if(!P || !(P.mended || (P.infected && api.G.stageIndex > 16))) return;
  // Cured, the flowers have closed; where they were, the cloth is stitched gold.
  const n = P.mended ? Math.min(6, P.gold || 1) : Math.min(6, 1 + (K.kit.greyMeasures(p) || 0)), f = p.face || 1;
  if(P.mended){
    const px = api.WX(p.x - 13), py = api.WY(p.y) - 22, spots = [[4, 11], [7, 13], [5, 15], [8, 10], [3, 14], [6, 16]];
    for(let i = 0; i < n; i++){ const x = f > 0 ? px + spots[i][0] : px + 12 - spots[i][0], y = py + spots[i][1]; api.B(x, y, 2, 1, '#f3d67a'); api.B(x, y + 1, 1, 1, '#b8923c'); }
    return;
  }
  const px = api.WX(p.x - 13), py = api.WY(p.y) - 22, B = api.B;
  const spots = [[4, 11], [7, 13], [5, 15], [8, 10], [3, 14], [6, 16]];
  for(let i = 0; i < n; i++){
    const sx = spots[i][0], sy = spots[i][1], x = f > 0 ? px + sx : px + 12 - sx, y = py + sy;
    B(x, y, 2, 1, '#f4f1e6'); B(x - f, y - 1, 1, 1, '#fffdf5'); B(x + (f > 0 ? 2 : -1), y + 1, 1, 1, '#fffdf5'); B(x, y + 1, 1, 1, '#cfc8b2');
  }
  if(n > 1) api.glow(px + 6, py + 13, 8, '244,241,230', .08 * n);
}

root.BladefallActTwoArt = Object.freeze({ handles, draw, register, C, hero,
  shared:Object.freeze({ drawRing, drawGull, drawCrab, line, sag, CAST, flower, drawBell, bandagedHead, belledFigure,
    sunguardFigure, kneeling, walker, orenFigure, drawFallen, bareHead }) });
})(typeof window !== 'undefined' ? window : globalThis);
