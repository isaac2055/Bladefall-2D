/* Bladefall v4 — the Fable Respec renderer inside the main game.
   Draws the whole frame into a half-resolution buffer (1 buffer px = 2 world
   units) and blits it 2x with smoothing off, so every pixel snaps to one grid.
   Entities with a v4 look are drawn here in pixel style; anything not yet
   converted falls back to the legacy draw function on the scaled buffer context,
   so nothing disappears while regions are converted one at a time.
   Switched from render() in index.html by meta.rendererMode ('v4' | 'classic')
   and BFRespecRenderer.supports(stageIndex). Prototype: public/fable-respec.js.
   Regions: every stage through the Frost Sorcerer (0-8), including pixel bosses,
   fluids, rotors and White Court architecture. Unconverted portals, pickups and mechanisms
   retain their legacy drawers inside the buffer. */
const BFRespecRenderer = (() => {
'use strict';
const Z = 0.5;
/* 13 ADDED 2026-09-20. This Set is what `useRespecRenderer()` asks, so a stage
   missing from it is drawn by the LEGACY renderer in index.html no matter what art
   exists here — which is the literal meaning of "the Abyss King level is not
   respec'd": the Throne's props, both boss figures and the echo were all being
   skipped because the file was never asked to draw the stage at all. */
const SUPPORTED_STAGES = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15]);

// ── Base palette (figures, effects) ───────────────────────────────────────
const P = {
  moon:'#ffe9c4', ink:'#e8e2f2', dim:'#8d86a3', amber:'#ffb454', danger:'#ff5c7a', cyan:'#6be7ff', ember:'#ff9a3a',
  skyTop:'#120f24', stoneLine:'#1a1428', root:'#3a2a44', wood:'#4b3328', woodLit:'#7a5a44', canvas:'#8a7f6e', canvasDark:'#5c5347',
  cloak:'#2f4d8f', cloakLit:'#4a76c8', cloakDark:'#1d2f5c', skin:'#f2c9a0', hood:'#1b2340', eye:'#9ff4ff',
  scarf:'#ff7f5c', blade:'#dff6ff', bladeGlow:'rgba(120,220,255,.35)',
  grunt:'#5f8f4a', gruntDark:'#34552b', gruntLit:'#9ccf7a', gruntEye:'#ff6a4a', mask:'#d8d2c4',
  shade:'#8a5cff', shadeDark:'#4a2a9a', shadeLit:'#d8c4ff',
  grass:'#7fd6a8', grassDark:'#3e9c78', grassLit:'#c8ffe0',
};
// ── Per-region palettes: sky ramp, hill silhouettes, masonry, cap, ambience ─
const THEMES = {
  plains:  { sky:['#120f24','#2b1d4e','#6b3a6e','#d97b5a'], moon:true, hills:['#1c1636','#251c44','#2f2352'], shape:'hills', stone:'#4a3f66', stoneLit:'#6a5b8c', stoneDark:'#2d2540', line:'#1a1428', deep:'#221a33', cap:['#7fd6a8','#c8ffe0','#3e9c78'], fog:'rgba(214,170,220,.06)', amb:'dust', ambCol:'rgba(185,201,230,.5)' },
  forest:  { sky:['#0a120e','#11261b','#1f4030','#3f6b45'], moon:true, hills:['#0e1a12','#122217','#172c1d'], shape:'trees', stone:'#3d4a3e', stoneLit:'#5d7259', stoneDark:'#232c25', line:'#111a14', deep:'#16211a', cap:['#5fae4a','#9fe07a','#3a7a30'], fog:'rgba(120,200,140,.05)', amb:'leaf', ambCol:'rgba(111,174,78,.6)' },
  badlands:{ sky:['#160d10','#38181c','#7a3a2a','#d9764a'], moon:true, hills:['#2a1712','#3a2018','#4a2b1e'], shape:'mesa', stone:'#5a4038', stoneLit:'#846056', stoneDark:'#2c1c17', line:'#1a100d', deep:'#241713', cap:['#b08a4a','#d9b46a','#7a5a30'], fog:'rgba(214,154,106,.06)', amb:'dust', ambCol:'rgba(214,154,106,.5)' },
  canyon:  { sky:['#16110e','#4a2a1c','#9a5a30','#e0a060'], moon:true, hills:['#3d2c19','#4f3a22','#6b4d2c'], shape:'mesa', stone:'#6b5336', stoneLit:'#9a7a4e', stoneDark:'#3a2a18', line:'#20160c', deep:'#2b1f12', cap:['#c9a45a','#e8c880','#8a6a30'], fog:'rgba(224,192,136,.06)', amb:'dust', ambCol:'rgba(224,192,136,.5)' },
  ruins:   { sky:['#100e1c','#221c3a','#3e3260','#6f5a8c'], moon:true, hills:['#1b1730','#241f3c','#2e2848'], shape:'ruins', stone:'#4a4560', stoneLit:'#6f688e', stoneDark:'#2a2540', line:'#17142a', deep:'#1f1c2e', cap:['#6f9a5a','#a4cc88','#4a6a3a'], fog:'rgba(179,166,224,.06)', amb:'dust', ambCol:'rgba(179,166,224,.5)' },
  dungeon: { sky:['#08060a','#120d18','#1c1224','#33203a'], moon:false, hills:['#140c18','#1a1020','#221528'], shape:'arches', stone:'#4b3550', stoneLit:'#6f5076', stoneDark:'#2a1c2e', line:'#150c18', deep:'#1f1424', cap:['#5a4a62','#7a6a84','#3a2c40'], fog:'rgba(199,143,208,.05)', amb:'dust', ambCol:'rgba(199,143,208,.35)' },
  frost:   { sky:['#0e1620','#1e3040','#4e7899','#a8d4e8'], moon:true, hills:['#22303f','#2c3d50','#3a5068'], shape:'peaks', stone:'#41556b', stoneLit:'#6d879f', stoneDark:'#26323e', line:'#16202a', deep:'#1a2531', cap:['#e8f6ff','#ffffff','#a8c4d8'], fog:'rgba(232,246,255,.07)', amb:'snow', ambCol:'rgba(232,246,255,.8)' },
  volcano: { sky:['#0b0605','#1e0d0a','#5a2012','#c2481c'], moon:false, hills:['#170c0a','#21110d','#2c1712'], shape:'stacks', stone:'#4a332a', stoneLit:'#7d5642', stoneDark:'#261611', line:'#120a07', deep:'#1c0f0b', cap:['#d0552a','#ff9f52','#7d2c12'], fog:'rgba(255,138,74,.07)', amb:'ember', ambCol:'rgba(255,158,80,.85)' },
  // The chapter after the heat. Stage 11 and beyond named themes ('void', 'apex')
  // that were never defined, so they fell back to the plains — green hills and a
  // moon under a world that turns over. No moon here: you will be standing on it.
  void:    { sky:['#0a0510','#140b22','#2a1540','#4a2668'], moon:false, hills:['#160d26','#1d1231','#26183e'], shape:'shards', stone:'#3a2c52', stoneLit:'#61497f', stoneDark:'#221935', line:'#120b1e', deep:'#1a1029', cap:['#8a6ad0','#c4a8ff','#5a3f8f'], fog:'rgba(150,110,220,.06)', amb:'void', ambCol:'rgba(190,150,255,.62)' },
  apex:    { sky:['#080410','#12091c','#241436','#46285e'], moon:true,  hills:['#130a1f','#191029','#211636'], shape:'arches', stone:'#3f3358', stoneLit:'#6b5a8c', stoneDark:'#241c38', line:'#100a1a', deep:'#181025', cap:['#9a86d8','#d2c4ff','#6a5aa0'], fog:'rgba(170,140,230,.05)', amb:'void', ambCol:'rgba(200,170,255,.5)' },
};
let T = THEMES.plains, themeName = 'plains';
const FIGURE_PALS = {
  hero:      { cloak:P.cloak, cloakLit:P.cloakLit, cloakDark:P.cloakDark, hood:P.hood, scarf:P.scarf, eye:P.eye, skin:P.skin },
  mothsilk:  { cloak:'#668b77', cloakLit:'#a5c9ab', cloakDark:'#3d6254', hood:P.hood, scarf:P.scarf, eye:P.eye, skin:P.skin },
  ash:       { cloak:'#6b5f58', cloakLit:'#8f837a', cloakDark:'#463d38', hood:'#2c2622', scarf:'#a9a39a', eye:'#d8c48f', skin:'#c9a98a' },
  watcher:   { cloak:'#4f6a4a', cloakLit:'#7e9a72', cloakDark:'#31452f', hood:'#1f2a1c', scarf:'#b8c5a0', eye:'#e6f0c8', skin:'#d9b797' },
  survey:    { cloak:'#7a5a44', cloakLit:'#a5836a', cloakDark:'#4b3328', hood:'#2b1e18', scarf:'#c99a72', eye:'#ffe9c4', skin:'#e8c5a4' },
  escort:    { cloak:'#8a6a3a', cloakLit:'#c49a58', cloakDark:'#5a4224', hood:'#2e2214', scarf:'#e0c080', eye:'#ffe9c4', skin:'#e8c5a4' },
  windwright:{ cloak:'#3a6a7a', cloakLit:'#6aa3b8', cloakDark:'#244450', hood:'#142a34', scarf:'#cfe3ef', eye:'#dff6ff', skin:'#e8c5a4' },
  // Co-op: the second knight wears crimson, so two knights never read as one.
  partner:   { cloak:'#8a3440', cloakLit:'#c75a5c', cloakDark:'#561d27', hood:P.hood, scarf:'#e6bb73', eye:P.eye, skin:P.skin },
};
const WALKER_PALS = {
  grunt:     { body:P.grunt, dark:P.gruntDark, lit:P.gruntLit, eye:P.gruntEye, mask:P.mask },
  toxling:   { body:'#7fb03a', dark:'#3f6a1e', lit:'#c8ff6a', eye:'#e8ff9a', mask:'#c8d2a4', drip:'#9fd84a' },
  frostling: { body:'#5a8fb0', dark:'#2f5470', lit:'#a8dcff', eye:'#ffffff', mask:'#e8f6ff', drip:'#cfe9ff' },
  // The heat chapter and the Muster had no v4 bodies at all: every one of them fell
  // through drawEnemy's default to the pre-v4 vector blob, which is why they read as
  // leftovers from an older game beside the redone regions.
  emberling: { body:'#c4552a', dark:'#6d2c14', lit:'#ff9a52', eye:'#ffe6a8', mask:'#e0b487', drip:'#ff7a3a' },
  slagwright:{ body:'#8a6248', dark:'#3d2820', lit:'#c49a6a', eye:'#ffcf72', mask:'#b08a5a', drip:'#ff8a3a' },
  cinderling:{ body:'#9a3a1e', dark:'#4a1a0c', lit:'#ff7a3a', eye:'#fff0c0', mask:'#d08a58', drip:'#ffae4a' },
  shieldbearer:{ body:'#8a7a63', dark:'#463d30', lit:'#b8a684', eye:'#ffe9c4', mask:'#d8cdb4' },
  // The void chapter's own bodies, which had no v4 drawers either.
  sporecaster:{ body:'#6f9a48', dark:'#35521f', lit:'#a8d477', eye:'#e8ff9a', mask:'#c2cfa0', drip:'#9fd84a' },
  linesman:  { body:'#6f6552', dark:'#38321f', lit:'#9a8f74', eye:'#ffe0a0', mask:'#c9bb9a' },
  gaoler:    { body:'#5c5a52', dark:'#2c2a26', lit:'#8a887e', eye:'#ff9a5a', mask:'#b0aea4' },
  chainmarshal:{ body:'#7a5a44', dark:'#3a2a1e', lit:'#a5836a', eye:'#ffcf72', mask:'#c99a72' },
  signaler:  { body:'#c9a24a', dark:'#6b5220', lit:'#f0d48a', eye:'#fff0c0', mask:'#e8dcb4' },
};

// ── Helpers ───────────────────────────────────────────────────────────────
function hash(x, y){ let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function rng(seed){ let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function layer(w, h, draw){ const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; draw(g); return c; }
function glow(x, y, r, rgb, a){ ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(x, y, 1, x, y, r); gl.addColorStop(0, `rgba(${rgb},${a})`); gl.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gl; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.globalCompositeOperation = 'source-over'; }

let buf = null, bctx = null, bw = 0, bh = 0;
let ctx = null, curG = null, L = null, curEnv = null;   // buffer context, game state, legacy drawers, env during a frame
let camX = 0, camYb = 0, groundBy = 0, time = 0, lastTime = 0, dt = 0, shX = 0, shY = 0;
const B = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const WX = wx => Math.round((wx - camX) * Z);
const WY = wy => Math.round(groundBy - wy * Z);

// ── Pre-rendered backdrop ─────────────────────────────────────────────────
const cache = {};
function sky(){
  const key = 'sky' + themeName + bw + 'x' + bh;
  return cache[key] || (cache[key] = layer(bw, bh, g => {
    const gr = g.createLinearGradient(0, 0, 0, bh); T.sky.forEach((c, i) => gr.addColorStop([0, .45, .8, 1][i], c));
    g.fillStyle = gr; g.fillRect(0, 0, bw, bh);
    const r = rng(7); for(let i = 0; i < bw * .25; i++){ const x = r() * bw | 0, y = r() * bh * .6 | 0; g.fillStyle = `rgba(255,240,220,${(.25 + r() * .6) * (T.moon ? 1 : .5)})`; g.fillRect(x, y, 1, 1); }
    if(T.moon){
      const mx = bw * .78, my = bh * .18;
      const halo = g.createRadialGradient(mx, my, 20, mx, my, 96); halo.addColorStop(0, 'rgba(255,214,160,.28)'); halo.addColorStop(.4, 'rgba(255,214,160,.08)'); halo.addColorStop(1, 'rgba(255,214,160,0)'); g.fillStyle = halo; g.fillRect(mx - 100, my - 100, 200, 200);
      g.fillStyle = P.moon; g.beginPath(); g.arc(mx, my, 22, 0, 7); g.fill();
      g.fillStyle = 'rgba(200,160,140,.35)'; g.fillRect(mx - 8, my - 8, 4, 3); g.fillRect(mx + 6, my + 8, 6, 4); g.fillRect(mx - 2, my + 14, 3, 2);
    }
  }));
}
function hills(idx){
  const key = 'h' + themeName + idx;
  return cache[key] || (cache[key] = layer(1024, 420, g => {
    const seed = [3, 11, 29][idx], base = [120, 140, 160][idx], amp = [22, 18, 14][idx], col = T.hills[idx], r = rng(seed), shape = T.shape;
    g.fillStyle = col;
    for(let x = 0; x < 1024; x += 4){
      let n = Math.sin(x * .012 + seed) * amp + Math.sin(x * .031 + seed * 3) * amp * .4;
      if(shape === 'mesa') n = Math.round(n / 12) * 12;                                   // flat-topped steps
      if(shape === 'peaks') n = Math.abs(Math.sin(x * .02 + seed)) * -amp * 2.2 + amp;     // sharp ridges
      if(shape === 'stacks') n = Math.round(n / 16) * 16;                                  // cooled slag terraces
      if(shape === 'shards') n = Math.round(n / 10) * 10;                                  // a fractured shelf
      const yy = base + n | 0; g.fillRect(x, yy, 4, 420 - yy);
      if((shape === 'hills' || shape === 'peaks') && r() < .05){ const h = 20 + r() * 60 | 0, sw = 3 + r() * 5 | 0; g.fillRect(x, yy - h, sw, h); g.fillRect(x - 1, yy - h + 6, sw + 2, 2); }
      if(shape === 'ruins' && r() < .06){ const h = 14 + r() * 50 | 0, sw = 4 + r() * 8 | 0; g.fillRect(x, yy - h, sw, h); if(r() < .5) g.fillRect(x - 2, yy - h, sw + 4, 3); }
      if(shape === 'arches' && r() < .04){ const h = 30 + r() * 40 | 0; g.fillRect(x, yy - h, 4, h); g.fillRect(x + 14, yy - h, 4, h); g.fillRect(x, yy - h - 4, 18, 4); }
      // Foundry stacks: tall flues with a flared lip, the skyline of a place still working.
      if(shape === 'stacks' && r() < .055){ const h = 38 + r() * 74 | 0, sw = 5 + r() * 4 | 0;
        g.fillRect(x, yy - h, sw, h); g.fillRect(x - 2, yy - h, sw + 4, 3); g.fillRect(x - 1, yy - h + 7, sw + 2, 2); }
      // The Inversion's horizon: a spire from the floor and a spire from the roof,
      // so the skyline reads the same whichever way the world is pointing.
      if(shape === 'shards' && r() < .07){ const h = 18 + r() * 62 | 0, sw = 3 + r() * 4 | 0;
        g.fillRect(x, yy - h, sw, h); g.fillRect(x - 1, yy - h, sw + 2, 2);
        const dh = 22 + r() * 78 | 0; g.fillRect(x + sw + 4, 0, sw, dh); g.fillRect(x + sw + 3, dh - 2, sw + 2, 2); }
    }
    for(let x = 0; x < 1024; x += 6){ if(shape === 'stacks') continue; if(r() < (shape === 'trees' ? .85 : .5)){ const h = (shape === 'trees' ? 14 : 6) + r() * (shape === 'trees' ? 40 : 16) | 0; let n = Math.sin(x * .012 + seed) * amp + Math.sin(x * .031 + seed * 3) * amp * .4; if(shape === 'mesa') n = Math.round(n / 12) * 12; const yy = base + n | 0;
      if(shape === 'trees'){ g.fillRect(x + 2, yy - h, 2, h); for(let k = 0; k < 4; k++) g.fillRect(x + 2 - k - 1, yy - h + 4 + k * 4, 2 * k + 4, 3); }
      else { g.fillRect(x + 2, yy - h, 2, h); g.fillRect(x + 1, yy - h + 2, 4, 3); g.fillRect(x, yy - h + 5, 6, 3); } } }
  }));
}
function vignette(){
  const key = 'vig' + bw + 'x' + bh;
  return cache[key] || (cache[key] = layer(bw, bh, g => { const gr = g.createRadialGradient(bw / 2, bh / 2, bh * .35, bw / 2, bh / 2, bw * .72); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(6,3,14,.7)'); g.fillStyle = gr; g.fillRect(0, 0, bw, bh); }));
}
/* INTERIOR REGIONS. Everything from Emberdeep down is underground, and the
   backdrop was built on three assumptions that only hold outdoors: a sky, a
   horizon of hills pinned 196px above the ground LINE, and an abyss gradient that
   swallows everything below it. Raise a region's floor 640 units and all three
   break at once — open sky under your feet and a black band where the rock should
   be. So interiors get their own backdrop: tiled rock that wraps in BOTH axes and
   is pinned to nothing, no horizon, no abyss. */
// The whole bottom row of the drawn map runs UNDER the first third of the game.
// The Citadel is the first room of it, so it takes the interior backdrop too.
const INTERIOR_STAGES = new Set([9, 10, 11, 12]);
let interior = false;
/* Rock, not masonry. The first cut used courses the size of the player and drew
   them at full strength, which put the brightest, busiest thing in the frame
   BEHIND the level. Small broken blocks, low contrast, and every colour taken from
   the bottom of the theme's range: a backdrop's whole job is to be further away. */
function rockWall(idx){
  const key = 'rock' + themeName + idx;
  return cache[key] || (cache[key] = layer(256, 256, g => {
    const base = idx ? T.deep : T.line, lit = idx ? T.stoneDark : T.deep;
    g.fillStyle = base; g.fillRect(0, 0, 256, 256);
    const r = rng(23 + idx * 5), course = idx ? 9 : 6;
    for(let y = 0, row = 0; y < 256; y += course, row++){
      const off = (row % 2 ? course : 0) - course * 3;
      for(let x = off; x < 256; x += course * 3){
        if(r() > .34) continue;
        g.fillStyle = lit;
        g.fillRect(x + 1, y + 1, course * 3 - 2 - (r() * 5 | 0), course - 2);
      }
    }
    for(let i = 0; i < 5 + idx * 4; i++){                  // fissures break up the courses
      let x = r() * 256 | 0; const y = r() * 256 | 0;
      g.fillStyle = T.line;
      for(let k = 0, n = 26 + r() * 46; k < n; k++){ g.fillRect(x & 255, (y + k) & 255, 1, 1); x += r() < .5 ? 1 : -1; }
    }
  }));
}
function drawInteriorBackdrop(){
  ctx.fillStyle = T.line; ctx.fillRect(0, 0, bw, bh);
  // Two rock layers, wrapped in x AND y. Nothing here knows where the ground is,
  // which is the whole point: the camera can stand anywhere in the shaft.
  for(let i = 0; i < 2; i++){
    const img = rockWall(i), px = [.18, .4][i], a = [.85, .4][i];
    const ox = -(((camX * Z * px) % 256) + 256) % 256, oy = (((camYb * px) % 256) + 256) % 256 - 256;
    alphaWrap(a, () => { for(let x = ox; x < bw; x += 256) for(let y = oy; y < bh; y += 256) ctx.drawImage(img, Math.round(x), Math.round(y)); });
  }
  alphaWrap(.5, () => { ctx.fillStyle = T.fog;
    for(let i = 0; i < 4; i++){ const y = ((i * 113 - camYb * .35) % bh + bh) % bh + Math.sin(time * .3 + i) * 5; ctx.fillRect(0, Math.round(y), bw, 6); } });
  ctx.drawImage(vignette(), 0, 0);
}
/* THE WORLD TURNED OVER. The pixel path had no handling of `gravityFlipped` at all:
   the hero stood on a ceiling drawn as if he were still the right way up, and every
   platform kept its lit cap on the side he was NOT standing on. The engine keeps
   `p.y` as the box's bottom either way (see playerSlate), so a flipped figure is the
   same sprite mirrored about its own box — nothing else moves. */
function flipTell(){
  const at = curG && curG.flipTellAt;
  return at == null ? 0 : Math.max(0, 1 - (time - at) / .55);
}
function flipWrap(topY, boxH, fn){
  if(!curG || !curG.gravityFlipped) return fn();
  ctx.save(); ctx.translate(0, 2 * topY + boxH); ctx.scale(1, -1); fn(); ctx.restore();
}
/* Which side is floor. A lit cap on a surface you are hanging from is a lie, so the
   cap moves to the side you currently owe and the other side grows the fringe that
   hangs off a ceiling. Additive, so it works whichever branch drew the body. */
function polarityTrim(o){
  if(!curG.flipUnlocked || o.ceiling || o.gone || o.type !== 'plat') return;
  const w = Math.round(o.w * Z);
  if(w <= 0 || w > bw * 3) return;
  const h = Math.max(4, Math.round((o.h || 14) * Z)), bx = WX(o.x - o.w / 2), by = WY(o.y);
  const flipped = !!curG.gravityFlipped;
  B(bx, flipped ? by + h - 2 : by, w, 2, T.cap[1]);
  const rootY = flipped ? by : by + h;
  for(let x = 2; x < w - 2; x += 7){
    const len = 2 + ((hash(o.x + x, 3) * 4) | 0);
    B(bx + x, flipped ? rootY - len : rootY, 2, len, T.cap[2]);
  }
}
function drawBackdrop(){
  if(interior) return drawInteriorBackdrop();
  ctx.drawImage(sky(), 0, 0);
  for(let i = 0; i < 3; i++){
    const img = hills(i), px = [.15, .3, .5][i], shift = -((camX * Z * px) % 1024), yy = Math.round(groundBy - 196 + camYb * px * .4);
    for(let x = shift - 1024; x < bw; x += 1024) ctx.drawImage(img, Math.round(x), yy);
  }
  ctx.fillStyle = T.fog; { const bands = themeName === 'volcano' ? 6 : 4, th = themeName === 'volcano' ? 7 : 14, sp = themeName === 'volcano' ? 13 : 22;
    for(let i = 0; i < bands; i++){ const y = groundBy - 90 + i * sp + Math.sin(time * .3 + i) * 6; ctx.fillRect(0, Math.round(y), bw, th); } }
  const ab = ctx.createLinearGradient(0, groundBy - 10, 0, Math.min(bh, groundBy + 120)); ab.addColorStop(0, 'rgba(10,8,18,0)'); ab.addColorStop(.35, 'rgba(10,8,18,.75)'); ab.addColorStop(1, 'rgba(6,4,12,.98)');
  ctx.fillStyle = ab; ctx.fillRect(0, groundBy - 10, bw, bh - groundBy + 10);
}
let ambPhase = 0;
function drawAmbience(){   // drifting motes: dust, leaves or snow, scrolling with the camera at a slow parallax
  ctx.fillStyle = T.ambCol;
  const forge = curG && curG.boss && curG.boss.colossusForge && !curG.boss.dead;
  // Halved over the fight: the arena needs its tells to be the brightest small
  // things in the frame, and 58 drifting embers were competing with every one.
  const n = forge ? 26 : T.amb === 'snow' ? 70 : T.amb === 'ember' ? 58 : T.amb === 'void' ? 46 : 34;
  const bedTop = forge ? WY(130) : null;
  // A pour windup inverts the drift: one environment variable, whole screen, and
  // legible with the sound off and motion reduced.
  const boss = curG && curG.boss, drawingIn = !!(boss && boss.colossusForge && !boss.dead && (boss.forgeArmY || 0) > 0);
  // ONE accumulator, advanced by the live speed. Multiplying absolute time by a
  // speed that changes made the whole field teleport at the start of every windup.
  // In a region with two floors the drift says which way down currently is, and the
  // moment it reverses is the flip's whole-screen tell.
  const grav = curG && curG.gravityFlipped ? -1 : 1;
  const baseSp = (T.amb === 'snow' ? 18 : T.amb === 'ember' ? (drawingIn ? 30 : -24)
    : T.amb === 'void' ? 11 : T.amb === 'dust' ? 2.4 : 6) * (curG && curG.flipUnlocked ? grav : 1)
    * (1 + flipTell() * 5);
  ambPhase += baseSp * dt;
  for(let i = 0; i < n; i++){
    // Void motes cannot agree which way is down: half drift up, half drift down.
    const sp = T.amb === 'void' ? (i % 2 ? 1 : -1) : 1, h1 = hash(i, 1), h2 = hash(i, 2);
    if(T.amb === 'ember') ctx.fillStyle = (i % 3) ? T.ambCol : 'rgba(255,226,150,.9)';
    else if(T.amb === 'void') ctx.fillStyle = (i % 3) ? T.ambCol : 'rgba(228,212,255,.85)';
    const x = ((h1 * 4000 + Math.sin(time * .7 + i) * 12 + (T.amb === 'leaf' ? time * 14 : 0) - camX * Z * .7) % bw + bw) % bw;
    const y = ((h2 * 3000 + ambPhase * sp + (T.amb === 'dust' ? Math.sin(time + i) * 8 : 0)) % bh + bh) % bh;
    // The bed band belongs to the fight. Nothing decorative crosses it.
    if(bedTop !== null && y > bedTop - 16 && y < bedTop + 10) continue;
    ctx.fillRect(Math.round(x), Math.round(y), T.amb === 'snow' ? 2 : 1, T.amb === 'leaf' ? 2 : T.amb === 'ember' ? 2 : 1);
  }
}

// The opening's landmarks sit on the same ground and palette as the road.
// Muted, uncapped shapes are scenery; bright capped masonry remains walkable.
function drawOutskirtsLandmarks(){
  if(curG.stageIndex !== 0) return;
  const back = T.hills[2], face = T.stoneDark, edge = '#443653';
  const post = (x, y, h, w = 7) => { const bx = WX(x), by = WY(y); B(bx - w / 2, by - h, w, h, face); B(bx - w / 2, by - h, 1, h, edge); };
  const roof = (x, y, w, h) => { const bx = WX(x), by = WY(y); for(let i = 0; i < h; i++) B(bx - w / 2 + i * w / (2 * h), by - i, w - i * w / h, 1, back); };
  for(const o of curG.obstacles){
    if(o.type !== 'scenery' || !(o.w > 2000) || o.x + o.w / 2 < camX - 100 || o.x - o.w / 2 > camX + bw / Z + 100) continue;
    const by = WY(0);
    switch(o.kind){
      case 'verge-silhouette':
        // A collapsed roadside shelter, with its roof slumped behind Vey.
        roof(820, 24, 210, 57); post(610, 0, 85); post(985, 0, 48);
        for(let i = 0; i < 9; i++) B(WX(620 + i * 39), by - 71 + i * 3, 24, 2, edge);
        for(const x of [210, 420, 1090, 1390, 2030]){ post(x, 0, 36, 3); B(WX(x), by - 30, 22, 2, back); }
        break;
      case 'camp-ridge':
        // Broken fencing frames the patrol lane, leaving clear sky over refuges.
        for(let i = 0; i < 18; i++){
          const x = 2680 + i * 57, h = 31 + Math.round(hash(i, 41) * 22);
          if(i > 7 && i < 12) continue;
          post(x, 0, h, 5); B(WX(x) - 1, by - h - 3, 3, 3, face);
          B(WX(x), by - 21, 29, 3, back);
        }
        roof(3550, 0, 144, 61);
        break;
      case 'watchers-cut':
        // Open pier bays expose the sheltered road below the broken lookout.
        for(const [x, y] of [[5240,110],[5450,160],[5820,145],[6000,175],[6360,146],[6520,170]]){
          post(x - 48, -22, (y + 22) * Z, 6); post(x + 48, -22, (y + 22) * Z, 6);
          B(WX(x - 50), WY(y) + 8, 50, 3, edge);
          B(WX(x - 50), WY(y) + 11, 10, 6, face); B(WX(x + 30), WY(y) + 11, 10, 6, face);
        }
        break;
      case 'hollow-mile':
        for(const x of [7120, 7390, 7870, 8250, 8830, 9180]){
          const h = 48 + Math.round(hash(x, 8) * 28); post(x, 0, h, 8);
          B(WX(x) - 7, by - h - 3, 14, 3, edge);
          B(WX(x) + 4, by - h + 9, 17, 29, back);
          B(WX(x) + 4, by - h + 9, 1, 23, edge);
        }
        break;
      case 'broken-muster':
        // Empty beds and a roofed survey desk make this a place to breathe.
        roof(10300, 80, 224, 54); post(10110, 0, 80); post(10490, 0, 80);
        B(WX(10110), by - 72, 190, 4, face);
        for(const x of [9610, 9870, 10710]){
          roof(x, 0, 76, 29); B(WX(x) - 30, by - 6, 60, 6, face);
          B(WX(x) - 25, by - 3, 1, 3, edge); B(WX(x) + 24, by - 3, 1, 3, edge);
        }
        break;
      case 'mothlight-tunnel':
        // Trunks close gradually around the last descent into Black Woods.
        for(let i = 0; i < 12; i++){
          const x = 11760 + i * 168, h = 76 + i * 9;
          post(x, 0, h, 9 + i % 4);
          for(let j = 0; j < 7; j++){
            B(WX(x) + j * 3, by - h + 18 + j * 3, 4, 4, face);
            B(WX(x) - j * 4, by - h + 38 + j * 2, 5, 3, back);
          }
        }
        break;
    }
  }
}

// Forest trunks share the ground plane with the actors. Their low-contrast
// branches support the route without borrowing its bright walkable edge.
function pixelLimb(x1, y1, x2, y2, width, col){
  if(Math.max(x1,x2)+width < 0 || Math.min(x1,x2)-width > bw || Math.max(y1,y2)+1 < 0 || Math.min(y1,y2)>bh) return;
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x2-x1), Math.abs(y2-y1))));
  const dx=(x2-x1)/n, dy=(y2-y1)/n;
  let first=0,last=n;
  if(dx){const a=(-width-x1)/dx,b=(bw+width-x1)/dx;first=Math.max(0,Math.floor(Math.min(a,b)));last=Math.min(n,Math.ceil(Math.max(a,b)));}
  for(let i = first; i <= last; i++) B(x1 + dx*i - width/2, y1 + dy*i, width, 1, col);
}
function drawForestLandmarks(){
  if(curG.stageIndex !== 1) return;
  const trees = [[160,235,30],[1020,250,26],[1770,210,22],[2530,325,35],[3100,310,28],
    [4300,520,39],[4870,460,31],[5520,620,38],[6090,535,28],[6970,290,32],
    [7610,490,34],[8170,600,30],[8720,735,37],[9310,845,34],[9970,800,35],
    [10550,640,31],[11190,450,38],[11920,530,40]];
  for(const [x, h, w] of trees){
    if(x < camX - 220 || x > camX + bw/Z + 220) continue;
    const bx = WX(x), by = WY(0), hh = W2(h), ww = W2(w), dark = '#182b1c', edge = '#223b26';
    pixelLimb(bx, by, bx + 7, by - hh, ww, dark);
    pixelLimb(bx - ww/2, by, bx - 32, by + 3, 8, dark);
    pixelLimb(bx + ww/2, by, bx + 32, by + 2, 7, dark);
    for(let i = 0; i < 4; i++){
      const y = by - hh*(.35+i*.16), f = i%2 ? 1 : -1;
      pixelLimb(bx+3, y+12, bx + f*(36+i*9), y-17, 5, dark);
      B(bx + f*(38+i*9)-17, y-21, 34, 5, dark);
    }
    B(bx - ww/2 + 3, by - hh*.8, 1, hh*.7, edge);
  }
  // The clearing's old rig visibly connects the release weight to the bound
  // sword; its slack is the same persistent state as the roots below.
  const stump = curG.obstacles.find(o => o.weaponAwakening);
  const weight = curG.obstacles.find(o => o.oathbladeCounterweight);
  if(stump && weight && WX(weight.x) > -80 && WX(stump.x) < bw+80){
    const x1=WX(stump.x), y1=WY((stump.y || 0)+64), x2=WX(weight.x), y2=WY((weight.y || 0)+90), slack=stump.weaponReleased?12:3;
    for(let x=x1;x<=x2;x+=2){ const t=(x-x1)/(x2-x1); B(x,y1+(y2-y1)*t+Math.sin(t*Math.PI)*slack,1,1,'#6b6246'); }
    B(x2-3,y2-3,6,6,'#413d2a'); B(x2-1,y2-1,2,2,'#a09465');
  }
  // A fallen trunk over the clearing, and a low shelter at the inhabited road.
  for(const [x, y, w] of [[1220,95,330],[2700,325,310]]){
    const bx=WX(x), by=WY(y); if(bx < -w || bx > bw+w) continue;
    pixelLimb(bx-w/4,by+6,bx+w/4,by-8,7,'#213423');
    for(let i=0;i<5;i++) B(bx-w/4+i*w/10,by-5-i*2,4,7,'#2b432c');
  }
}

// Causeway hardware uses the same iron, copper eyes and chain profile from
// the first grounded mass through the final counterweight.
function causewayCable(x1,y1,x2,y2,on){
  pixelLimb(x1,y1,x2,y2,2,'#302721'); pixelLimb(x1,y1,x2,y2,1,on?'#b58d60':'#69584a');
}
function drawCausewayConnections(){
  if(curG.stageIndex !== 2) return;
  const obs=curG.obstacles, circuit=id=>!!(L.circuitOpen && L.circuitOpen(id));
  const yard=obs.find(o=>o.type==='trap'&&o.targetCircuit==='drop-yard');
  const catches=obs.filter(o=>o.repairCatch), plate=obs.find(o=>o.type==='plate'&&(o.id || o.circuit)==='drop-yard');
  if(yard){
    const first=catches.find(o=>o.repairCatch==='causeway-catch-yard'), armed=!yard.requiresRepairCatch || !!first?.struck;
    const x0=WX(yard.x0 || yard.x), railY=WY((yard.y0 || 410)+130), rail=W2(yard.hoist?.dx || 250);
    B(x0-rail-4,railY-3,rail*2+8,6,'#44332b'); B(x0-rail,railY-2,rail*2,1,'#90725a');
    if(first){ const fx=WX(first.x), fy=WY(first.y)-14; causewayCable(fx,fy,fx,railY,armed); causewayCable(fx,railY,x0-rail,railY,armed); wheel(fx,railY,4,0,'#8d7256'); }
    const x=WX(yard.x), y=WY(yard.y+(yard.h || 58));
    B(x-5,railY-5,10,6,'#b08a5e'); chain(x,railY+1,y,'#796654');
    if(!armed){ B(x-8,railY+7,16,3,'#665043'); B(x-6,railY+6,3,6,'#d0a56c'); }
    if(plate){
      const px=WX(plate.x), py=WY(plate.y || 0), on=circuit('drop-yard');
      const second=catches.find(o=>o.repairCatch==='causeway-catch-rise'), door=obs.find(o=>o.type==='door'&&o.circuit==='drop-yard');
      if(second){ const sx=WX(second.x), sy=WY(second.y)-14; causewayCable(px,py-4,sx,py-4,on); causewayCable(sx,py-4,sx,sy,on);
        if(door){const dx=WX(door.x), dy=WY(door.y); causewayCable(sx,sy,dx-16,sy,!!second.struck); causewayCable(dx-16,sy,dx-16,dy,!!second.struck); wheel(dx-16,dy,7,second.struck?.75:0,'#8d7256');}
      }
    }
  }
  const lifts=obs.filter(o=>o.causewayLift);
  if(lifts.length){
    const top=WY(445), first=lifts[0], last=lifts[lifts.length-1];
    B(WX(first.x)-8,top-3,WX(last.x)-WX(first.x)+16,5,'#513d2f');
    for(const o of lifts){const x=WX(o.x), y=WY(o.y), half=W2(o.w)*.35;
      for(const f of [-1,1]){const cx=x+f*half; chain(cx,top,y,'#796653'); wheel(cx,top,6,(o.y-(o.y0 || 195))*.014,'#a58158');}
      B(x-half-5,top,3,WY(0)-top,'#382921'); B(x+half+2,top,3,WY(0)-top,'#382921');
    }
  }
  const boss=curG.boss, weight=obs.find(o=>o.type==='bruteWeight');
  if(weight){
    const x=WX(weight.x), top=WY((weight.y0 || 455)+155), w=W2(weight.w), foot=WY(0);
    for(const f of [-1,1]){ const px=x+f*(w*.7+10); B(px-4,top,8,foot-top,'#392923'); B(px-4,top,1,foot-top,'#675043'); }
    B(x-w*.8-13,top-5,w*1.6+26,8,'#513c2e'); B(x-w*.8-13,top-5,w*1.6+26,1,'#967451');
    for(const o of obs.filter(o=>o.bruteDropRelease&&!o.gone)){
      const rx=WX(o.x), ry=WY(o.y); causewayCable(rx,ry,rx,top+4,!o.struck); causewayCable(rx,top+4,x,top+4,!o.struck); wheel(rx,top+4,5,o.struck?.6:0,'#977859');
    }
    // The worn fall lane is material evidence, not a targeting reticle.
    B(x-w*.48,foot-1,w*.96,2,'#77543d');
    for(let i=0;i<7;i++) B(x-w*.42+i*w*.14,foot-1,3,1,'#ba8960');
    if(boss){
      const rivets=obs.filter(o=>o.bruteWakeLever), dormant=!!boss.bruteDormant;
      for(const o of rivets){
        const rx=WX(o.x), ry=WY(o.y), slot=WX((o.x0 || o.x)+18);
        B(slot-4,ry-12,8,24,'#3a2c25'); B(slot-4,ry-12,1,24,'#826147');
        if(!o.struck) causewayCable(rx+7,ry,x-w*.7-10,top+15,true);
        else{ chain(rx+9,ry,ry+14,'#695446'); }
      }
      if(dormant){ const bx=WX(boss.x), by=WY(boss.y); causewayCable(x+w*.7+10,top+24,bx,by-20,true); }
    }
  }
}

// Updrafts: separate visual grammars for air, the ember duct and water cups.
let activeFields = null;
const tunnelImages = new WeakMap();
function updraftsOpen(id){return !!(L.circuitOpen && L.circuitOpen(id));}
function fieldLive(o){
  if(activeFields) return activeFields.has(o);
  return (!o.requiresCircuit || updraftsOpen(o.requiresCircuit)) && (!o.pulsePeriod || ((time+(o.pulsePhase||0))%o.pulsePeriod)<o.pulsePeriod*(o.pulseDuty||.62));
}
function drawAerieNest(o,bx,by,w){
  if(curG.stageIndex!==3 || !o.aerieNest) return;
  const ww=Math.min(w-4,44), x=bx+(w-ww)/2;
  B(x,by-2,ww,3,'#b0aa78'); B(x+2,by-3,ww-4,1,'#d7d6ab');
  for(let i=3;i<ww-2;i+=5) B(x+i,by-1,2,2,'#727551');
  for(const dx of [-8,0,8]){ B(bx+w/2+dx,by-6,1,3,'#b9d8ce'); B(bx+w/2+dx+1,by-7,2,1,'#d8ece0'); }
}
function drawUpdraftsField(o){
  const up=o.type==='updraft', live=fieldLive(o), fire=L.fieldVisual && L.fieldVisual(o)?.element==='fire';
  const x=WX(o.x), by=WY(o.y || 0), w=W2(o.w), h=W2(o.h), f=Math.sign(o.forceX || 1), col=fire?'#d8945d':'#a4cbd3';
  if(up){
    B(x-w/2,by-3,w,6,'#384347'); B(x-w/2,by-3,w,1,'#8eaaa9');
    for(let xx=-w/2+4;xx<w/2-2;xx+=6) B(x+xx,by-2,3,3,live?fire?'#bd7845':'#69949d':'#252e30');
    // Ribbon hems describe width and true top without making a luminous box.
    for(const side of [-1,1]){
      const sx=x+side*(w/2+3); B(sx,by-13,1,13,'#75654b');
      for(let i=0;i<8;i++) B(sx+(live?Math.round(Math.sin(time*4+i*.5)*2):side*i*.25),by-13-(live?i:0),1,live?2:1,live?col:'#727767');
    }
    if(!live) return;
    for(let i=0;i<12;i++){const q=(time*(.27+hash(i,o.x)*.25)+i*.083)%1, sx=x-w/2+3+hash(i,8)*(w-6); B(sx+(o.spiral?Math.sin(q*10+i)*w*.22:0),by-q*h,1,fire?3:5,col);}
    if(fire) for(let i=0;i<4;i++){const q=(time*.37+i*.23)%1; B(x+Math.sin(i*4+time)*w*.3,by-q*h,2,2,i%2?'#e7a464':'#9f603d');}
  }else{
    const left=x-w/2, source=f>0?left:left+w, fy=-Math.sign(o.forceY || 0);
    for(let j=0;j<3;j++){
      const y=by-8-j*Math.max(12,(h-16)/2); B(source,y-6,1,13,'#7b7259');
      for(let i=0;i<9;i++) B(source+f*i,y+Math.round(live?Math.sin(time*4-i*.4)*2:i*.25),1,2,live?col:'#65747a');
    }
    if(!live) return;
    for(let i=0;i<12;i++){const q=(time*(.22+hash(i,o.x)*.18)+i*.079)%1, sx=left+(f>0?q:1-q)*w, sy=by-6-hash(i,5)*(h-12); pixelLimb(sx-f*7,sy-fy*3,sx,sy,1,col);}
  }
}
function drawUpdraftsTunnels(){
  const rows=curG.obstacles.filter(o=>o.type==='windTunnel'); if(!rows.length || !L.windTunnelSamples) return false;
  let item=tunnelImages.get(rows[0]);
  if(!item){
    const paths=rows.map(o=>({o,s:L.windTunnelSamples(o)}));
    const left=Math.min(...paths.flatMap(p=>p.s.map(v=>v.x-p.o.halfWidth-22))), right=Math.max(...paths.flatMap(p=>p.s.map(v=>v.x+p.o.halfWidth+22)));
    const top=Math.max(...paths.flatMap(p=>p.s.map(v=>v.y+p.o.halfWidth+22))), bottom=Math.min(...paths.flatMap(p=>p.s.map(v=>v.y-p.o.halfWidth-22)));
    const image=layer(W2(right-left)+2,W2(top-bottom)+2,g=>{
      g.lineJoin='round';g.lineCap='round';
      for(const [extra,col] of [[14,'#101a20'],[2,'#6b858d'],[-2,'#263c43']]) for(const {o,s} of paths){
        g.strokeStyle=col;g.lineWidth=W2(o.halfWidth*2)+extra;g.beginPath();
        for(let i=0;i<s.length;i++){const x=Math.round((s[i].x-left)*Z),y=Math.round((top-s[i].y)*Z);if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
      }
      const insideOther=(x,y,self)=>paths.some(p=>p!==self && p.s.some((a,i)=>{if(!i)return false;const b=p.s[i-1],dx=a.x-b.x,dy=a.y-b.y,n=dx*dx+dy*dy,t=n?Math.max(0,Math.min(1,((x-b.x)*dx+(y-b.y)*dy)/n)):0;return Math.hypot(x-b.x-dx*t,y-b.y-dy*t)<p.o.halfWidth+7;}));
      for(const p of paths)for(let i=2;i<p.s.length-2;i+=3){const v=p.s[i],side=i%2?-1:1,x=v.x+v.nx*p.o.halfWidth*side,y=v.y+v.ny*p.o.halfWidth*side;if(insideOther(x,y,p))continue;
        for(let j=0;j<5;j++){g.fillStyle=j<2?'#9badb0':'#748b90';g.fillRect(Math.round((x+v.nx*side*j*2-left)*Z),Math.round((top-y-v.ny*side*j*2)*Z),2,2);}
      }
    });
    item={image,left,top,paths};tunnelImages.set(rows[0],item);
  }
  ctx.drawImage(item.image,WX(item.left),WY(item.top));
  for(const {o,s} of item.paths){
    if(!o.force)continue;
    for(let k=0;k<14;k++){const i=Math.floor((time*o.force*.2+k*s.length/14)%(s.length-1)),v=s[i],lane=(k%3-1)*o.halfWidth*.3,x=WX(v.x+v.nx*lane),y=WY(v.y+v.ny*lane);pixelLimb(x-v.tx*6,y+v.ty*6,x+v.tx*2,y-v.ty*2,1,'#a5c6ca');}
  }
  return true;
}
function drawUpdraftsConnections(){
  if(curG.stageIndex!==3)return;
  const obs=curG.obstacles, brake=obs.find(o=>o.mooringBrake),rack=obs.find(o=>o.kind==='aerie-harness-rack');
  for(const o of obs.filter(o=>o.type==='plat'&&o.supportedBy&&o.y>0)){
    const x=WX(o.x),y=WY(o.y),foot=WY(-45),w=W2(o.w);
    if(x+w/2<0||x-w/2>bw)continue;
    for(const f of [-1,1]){pixelLimb(x+f*w*.35,y+5,x+f*w*.42,foot,3,'#495b50');pixelLimb(x+f*w*.35,y+7,x,Math.min(foot,y+35),2,'#71806b');}
  }
  if(brake&&rack){const on=brake.struck||brake.timer>0,x1=WX(brake.x),y1=WY(brake.y)-13,x2=WX(rack.x),y2=WY(rack.y)-31;
    pixelLimb(x1,y1,(x1+x2)/2,(y1+y2)/2+(on?8:0),1,'#a1a08a');pixelLimb((x1+x2)/2,(y1+y2)/2+(on?8:0),x2,y2,1,'#a1a08a');}
  for(const o of obs.filter(o=>o.windCollector)){
    const dx=o.collectorAxis==='x'?o.collectorAt:o.x0,dy=(o.collectorAxis==='y'?o.collectorAt:o.y0)+58;
    const x=WX(dx),y=WY(dy),ready=!o.collectorPrereq||updraftsOpen(o.collectorPrereq),on=o.timer>0;
    B(x-19,y-10,4,20,'#536974');B(x-19,y-10,19,3,ready?'#c9d8cd':'#5e7277');B(x-19,y+7,19,3,ready?'#c9d8cd':'#5e7277');
    B(x-21,y-4,3,8,on?'#a7dac4':ready?'#95bbc6':'#465961');
    const next=obs.find(q=>q.windCollector&&q.collectorPrereq===o.id);
    if(next){const nx=WX(next.collectorAxis==='x'?next.collectorAt:next.x0),ny=WY((next.collectorAxis==='y'?next.collectorAt:next.y0)+58);
      pixelLimb(x-20,y+5,x-30,y+21,3,'#4b626c');pixelLimb(x-30,y+21,nx-26,ny+18,3,'#4b626c');
      if(on)pixelLimb(x-30,y+20,nx-26,ny+17,1,'#9ccfcd');
    }
  }
  const vessel=obs.find(o=>o.cinderVessel),damper=obs.find(o=>o.choirDamper),gate=obs.find(o=>o.kind==='wind-gate-sail'&&o.gateId==='wind-gate-1');
  if(vessel&&damper&&gate){
    const pts=[[vessel.x,vessel.y+7],[vessel.x-70,vessel.y+90],[damper.x-155,damper.y+100],[damper.x,damper.y+22],[gate.x,210]];
    const phase=Math.min(1,(curG.choirFlameT || 0)/3.2),on=updraftsOpen('wind-gate-1');
    for(let i=1;i<pts.length;i++)pixelLimb(WX(pts[i-1][0]),WY(pts[i-1][1]),WX(pts[i][0]),WY(pts[i][1]),3,'#685846');
    if(vessel.broken || vessel.timer>0){
      for(let i=0;i<pts.length-1;i++){const q=Math.max(0,Math.min(1,phase*(pts.length-1)-i));if(!q)continue;const [a,b]=[pts[i],pts[i+1]];pixelLimb(WX(a[0]),WY(a[1]),WX(a[0]+(b[0]-a[0])*q),WY(a[1]+(b[1]-a[1])*q),1,'#d79556');}
      const k=(on?(time*.34)%1:phase)*(pts.length-1),i=Math.min(pts.length-2,Math.floor(k)),q=k-i;
      B(WX(pts[i][0]+(pts[i+1][0]-pts[i][0])*q)-1,WY(pts[i][1]+(pts[i+1][1]-pts[i][1])*q)-1,3,3,'#ffe0a0');
    }
  }
}
function drawUpdraftsLever(o){
  const x=WX(o.x),y=WY(o.y || 0),on=o.timer>0 || o.struck;
  if(o.mooringBrake){B(x-9,y-6,18,7,'#514b3b');pixelLimb(x,y-4,x+(on?8:-5),y-17,2,'#b6a27b');B(x+(on?6:-7),y-19,4,4,on?'#cce2db':'#948362');return true;}
  if(o.cinderVessel){
    B(x-15,y-10,30,11,'#4c4033');B(x-15,y-10,30,1,'#ac8861');
    for(let i=-9;i<=9;i+=6){B(x+i,y-8,2,on?3:7,'#242c2d');if(on)B(x+i,y-4,3,2,'#d98648');}
    if(on)for(let i=0;i<3;i++)B(x-7+i*7+Math.sin(time*3+i),y-14-((time*17+i*8)%19),1,2,'#e5ae69');
    return true;
  }
  if(o.choirDamper){
    B(x-15,y-7,30,14,'#47504a');wheel(x,y,11,on?Math.PI/2:0,'#9b9272');
    if(on){B(x-9,y-1,18,2,'#cda976');}else B(x-1,y-9,2,18,'#cda976');return true;
  }
  if(o.airReceiver){
    const q=Math.min(1,(o.airCharge||0)/(o.airNeed||1)),live=on||o.used;
    B(x-14,y-20,28,20,'#3a535d');B(x-14,y-20,28,2,'#96aaa5');
    windRotor(x,y-10,9,live?time*.7:q*Math.PI,live);
    B(x-13,y-1,26,2,'#2b3d47');B(x-13,y-1,26*(live?1:q),2,'#bdd9cb');return true;
  }
  if(o.windCollector){
    const ready=!o.collectorPrereq||updraftsOpen(o.collectorPrereq),value=o.collectorAxis==='x'?o.x:o.y,catching=ready&&Math.abs(value-o.collectorAt)<=(o.collectorWindow||18);
    const col=on?'#a7d8c6':catching?'#e0eddf':ready?'#91bac3':'#586b73',cy=y-29;
    B(x-1,y-24,3,28,'#667975');
    for(let dx=-11;dx<=11;dx++){const yy=Math.sqrt(Math.max(0,121-dx*dx))*.6;B(x+dx,cy+yy,1,2,col);}
    B(x-12,cy-1,24,2,col);B(x-3,cy+3,6,3,on?'#b6e6d0':ready?'#6e9fa9':'#3b515a');
    if(on){B(x-9,cy+1,18,2,'#95cecd');for(let i=0;i<3;i++)B(x-16-i*3,cy+5+(time*12+i*4)%10,1,2,'#8bc1c5');}
    if(catching&&!on)glow(x,cy,15,'209,232,213',.16);
    if(o.flash>0){B(x-14,cy-3,2,2,'#dae2ce');B(x+12,cy+9,2,2,'#dae2ce');}
    return true;
  }
  return false;
}
// ── Terrain ───────────────────────────────────────────────────────────────
function bricks(bx, by, w, h, sx, sy){
  B(bx, by, w, h, T.stone);
  for(let yy = 6; yy < h; yy += 8){ B(bx, by + yy, w, 1, T.line); const off = ((yy / 8) | 0) % 2 ? 8 : 0;
    for(let xx = off; xx < w; xx += 16){ B(bx + xx, by + yy, 1, Math.min(8, h - yy), T.line); if(hash(sx + xx, sy + yy) < .18) B(bx + xx + 2, by + yy + 2, 5, 3, T.stoneLit); if(hash(sx + xx + 3, sy + yy) < .12) B(bx + xx + 8, by + yy + 3, 4, 2, T.stoneDark); } }
  B(bx, by, 1, h, T.stoneLit); B(bx + w - 1, by, 1, h, T.stoneDark); B(bx, by + h - 1, w, 1, T.stoneDark);
}
function cap(bx, by, w, sx){
  const [c, lit, dark] = T.cap;
  B(bx, by, w, 3, c); B(bx, by, w, 1, lit); B(bx, by + 3, w, 1, dark);
  if(themeName === 'dungeon') return;
  for(let xx = 0; xx < w; xx += 3){ const h = hash(sx + xx, 5); if(h < .35) B(bx + xx, by - 1 - (h * (themeName === 'frost' ? 3 : 6) | 0), 1, 2 + (h * 6 | 0), h < .15 ? lit : c); if(h > .93 && themeName === 'plains') B(bx + xx, by - 2, 1, 1, P.scarf); }
}
// The Watch uses the same brass on shields, arrow releases and the rangefinder.
// Hardware follows live collision bodies; moving mantlets remain hung from fixed rails.
const WATCH={iron:'#494453',edge:'#8c817d',wood:'#584b43',brass:'#b19a69',light:'#e6d7ac',dark:'#292533',cloth:'#68714d',clothDark:'#3d4432'};
function drawMarksmanConnections(){
  if(curG.stageIndex!==4)return;
  for(const o of curG.obstacles){
    if(o.type==='wall' && (o.watchMantlet||o.marksmanCoverTier) && !o.gone){
      const x=WX(o.x), y=WY(o.y), w=W2(o.w), motion=o.move||o.railMove;
      if(motion){
        const top=WY((o.y0??o.y)+Math.abs(motion.dy||0)+45), foot=WY(Math.max(0,(o.y0??o.y)-Math.abs(motion.dy||0)-o.h));
        for(const f of [-1,1]){B(x+f*(w/2+9),top,2,foot-top,'#423d49');B(x+f*(w/2+9),top,1,foot-top,'#655b60');}
        B(x-w/2-12,top,w+24,3,WATCH.wood);wheel(x,top+3,6,(o.y-(o.y0??o.y))*.035,WATCH.brass);
        if(o.fallT>0){pixelLimb(x,top+8,x+5,y-14,1,WATCH.brass);pixelLimb(x+5,y-14,x-3,y-4,1,WATCH.edge);}
        else chain(x,top+8,y,WATCH.brass);
      }
    }
    if(o.type==='lever' && o.marksmanTarget==='road-release'){
      const gate=curG.obstacles.find(a=>a.type==='door'&&a.circuit===o.id);if(!gate)continue;
      const x=WX(o.x),y=WY(o.y),gx=WX(gate.x),gy=WY(gate.y+35),on=o.timer>0;
      B(x+24,gy,3,WY(0)-gy,'#443d48');B(x+21,gy,gx-x-17,4,'#5d5255');
      pixelLimb(x,y-10,x+25,y-30,1,WATCH.brass);
      if(on){pixelLimb(x+25,y-30,x+32,y-9,1,WATCH.brass);chain(x+32,gy+5,y-9,WATCH.edge);}
      else chain(x+25,gy+5,y-30,WATCH.brass);
      pixelLimb(x+25,gy+6,gx,gy+6,1,WATCH.brass);chain(gx,gy+6,WY(gate.y),WATCH.brass);
      wheel(x+25,gy+5,5,on?.8:0,WATCH.brass);wheel(gx,gy+5,5,on?.8:0,WATCH.brass);
    }
    if(o.type==='lever' && o.marksmanTarget==='rangefinder'){
      const perch=curG.obstacles.find(a=>a.marksmanPerch);if(!perch)continue;
      const x=WX(o.x),y=WY(o.y),px=WX(perch.x),py=WY(perch.y),broken=o.broken;
      B(x-3,py-39,6,WY(0)-py+39,'#393344');B(x-3,py-39,px-x+8,4,'#5b5158');
      chain(x,py-34,y-12,broken?WATCH.iron:WATCH.brass);
      if(broken){pixelLimb(x,y+12,x+12,y+25,1,WATCH.edge);B(px-8,py+5,16,4,'#544852');}
      else{pixelLimb(x+12,y,px-14,py+4,2,WATCH.brass);B(px-15,py+3,30,3,WATCH.brass);}
    }
  }
  const drop=curG.obstacles.find(o=>o.galleryDropPerch),slate=curG.obstacles.find(o=>o.marksmanLinkedSlate==='gallery-drop');
  if(drop&&slate){
    const steps=curG.obstacles.filter(o=>o.galleryDropStep),left=Math.min(...steps.map(o=>o.x-o.w/2)),right=drop.x+drop.w/2,x0=WX(left+20),x1=WX(right-20),top=WY(drop.y),floor=WY(0);
    B(x0,top+4,4,floor-top,'#49414c');B(x1,top+4,4,floor-top,'#49414c');
    for(let y=top+28;y<floor;y+=58){pixelLimb(x0,y+54,x1,y,2,'#5a4c54');B(x0,y+54,x1-x0,2,'#3b3444');}
    const plumb=WX(slate.x+slate.w/2+16);B(x1,top+6,plumb-x1+3,3,'#5d5158');pixelLimb(plumb,top+9,plumb,WY(18),1,'#91806c');
    B(plumb-2,WY(20),5,7,WATCH.brass);B(WX(slate.x-slate.w/2),WY(slate.y)+5,W2(slate.w),2,WATCH.iron);
  }
  const launch=curG.obstacles.find(o=>o.galleryLaunch);
  if(launch){
    const x=WX(launch.x),y=WY(launch.y)-8,f=launch.nx||1;
    B(x-13,y-19,24,4,WATCH.iron);B(x-13,y+16,24,4,WATCH.iron);B(x-13,y-18,4,37,WATCH.brass);
    pixelLimb(x+f*10,y-17,x+f*21,y-13,2,WATCH.brass);pixelLimb(x+f*10,y+17,x+f*21,y+13,2,WATCH.brass);
    B(x-15,y-35,2,17,WATCH.wood);for(let i=0;i<14;i++)B(x-13+i,y-35+Math.sin(time*2+i*.35)*2,1,4-i*.15,'#827566');
  }
  for(const e of curG.enemies){
    if(!e.gateMechanismSniper)continue;
    const perches=e.watchPerches||[[e.watchHomeX??e.x,e.watchHomeY??e.y]], base=perches[0];
    for(let i=1;i<perches.length;i++){
      pixelLimb(WX(base[0]),WY(base[1])-2,WX(perches[i][0]),WY(perches[i][1])-2,3,WATCH.iron);
      pixelLimb(WX(base[0]),WY(base[1])-3,WX(perches[i][0]),WY(perches[i][1])-3,1,WATCH.brass);
    }
    B(WX(base[0])-7,WY(base[1])+2,14,5,WATCH.wood);
  }
}
function drawMarksmanMantlet(o,bx,by,w,h){
  const sag=o.fallT>0?1-Math.min(1,o.fallT/.7):0;
  B(bx,by,w,h,WATCH.dark);B(bx+2,by+2,w-4,h-4,WATCH.wood);
  for(let x=5;x<w-2;x+=6){B(bx+x,by+3,1,h-6,'#2d2934');B(bx+x+1,by+4,1,h-8,'#726158');}
  B(bx,by,3,h,WATCH.edge);B(bx+w-3,by,3,h,WATCH.iron);B(bx,by,w,3,WATCH.brass);B(bx,by+h-4,w,4,WATCH.iron);
  for(let y=10;y<h-5;y+=20){const yy=by+y+Math.round(sag*2);B(bx+2,yy,w-4,3,WATCH.iron);B(bx+4,yy,2,2,WATCH.brass);B(bx+w-6,yy,2,2,WATCH.brass);}
  if(sag){for(let y=8;y<h-3;y+=13)B(bx+w/2+Math.sin(y)*2,by+y,2,6,WATCH.dark);B(bx+1,by+1,3,2,WATCH.light);}
  if(!o.move&&!o.railMove){B(bx-3,by+h-3,w+6,3,WATCH.iron);B(bx-2,by+h-2,4,3,WATCH.brass);B(bx+w-2,by+h-2,4,3,WATCH.brass);}
}
function drawMarksmanTarget(o){
  if(!o.marksmanTarget)return false;
  const x=WX(o.x),y=WY(o.y),r=W2((o.w||48)/2)-1,on=o.timer>0,broken=!!o.broken,flash=o.flash>0,rejected=o.rejectFlash>0;
  const edge=flash?P.ink:rejected?P.ember:WATCH.brass;
  B(x-r-3,y-3,2*r+6,6,WATCH.iron);B(x-3,y-r-3,6,2*r+6,WATCH.iron);
  for(let dy=-r;dy<=r;dy++){const half=Math.min(r,Math.floor(Math.sqrt(Math.max(0,r*r-dy*dy))));B(x-half,y+dy,half*2+1,1,Math.abs(dy)>r-3?edge:WATCH.dark);if(half>2){B(x-half,y+dy,2,1,edge);B(x+half-1,y+dy,2,1,edge);}}
  if(broken){pixelLimb(x-7,y-8,x+1,y,2,WATCH.edge);pixelLimb(x+1,y,x-5,y+7,1,WATCH.light);pixelLimb(x+1,y,x+8,y+6,1,WATCH.edge);B(x+5,y+16,4,2,WATCH.brass);}
  else if(o.marksmanTarget==='rangefinder'){
    B(x-5,y-6,10,12,'#817d60');B(x-3,y-5,5,9,WATCH.light);B(x-3,y-5,3,2,'#fff0d1');B(x+4,y-3,2,5,'#575b51');
    for(const f of [-1,1]){B(x+f*8-1,y-1,3,2,edge);B(x-1,y+f*8-1,2,3,edge);}
  }else{
    // The arrow strikes a real retaining pin. Once released its hook hangs open.
    B(x-5,y-3,10,6,WATCH.iron);B(x-2,y-7,4,14,on?WATCH.edge:WATCH.light);
    pixelLimb(x-5,y+6,x+(on?6:-5),y+(on?11:-6),2,edge);B(x+5,y-1,5,2,edge);
  }
  if(flash||rejected)glow(x,y,19,rejected?'255,154,103':'230,215,172',.2);
  return true;
}
function drawMarksmanPortal(o,idx,authored=false){
  if(o.gone)return;
  const wall=!!o.nx,x=WX(o.x),y=WY(o.y)-(wall?8:12),rx=wall?8:13,ry=wall?14:8;
  const open=!authored||!L.lportalOpen||L.lportalOpen(o),col=authored?WATCH.brass:idx===0?'#78c3d2':'#eab176';
  if(authored){B(x-rx-3,y-ry-3,rx*2+7,ry*2+7,WATCH.iron);B(x-rx-1,y-ry-1,rx*2+3,ry*2+3,WATCH.dark);}
  alphaWrap(open?1:.3,()=>{
    for(let dy=-ry;dy<=ry;dy++){const dx=Math.round(rx*Math.sqrt(Math.max(0,1-dy*dy/(ry*ry))));B(x-dx,y+dy,dx*2+1,1,'#242238');B(x-dx,y+dy,1,1,col);B(x+dx,y+dy,1,1,col);}
    const phase=time*2;for(let i=0;i<3;i++){const a=phase+i*Math.PI*2/3;B(x+Math.cos(a)*(rx-3),y+Math.sin(a)*(ry-2),1,1,WATCH.light);}
    pixelLimb(x,y,x+(o.nx||0)*5,y-(o.ny||0)*5,1,col);
  });
}
function drawMarksmanProp(o,x,y){
  const w=W2(o.w||160),h=W2(o.h||150);
  switch(o.kind){
    case 'mantlet-rail':return true; // the actual cover owns its rail and mounts
    case 'watchtower-frame': case 'watch-brace': case 'anchor-tower': case 'release-frame':{
      const tower=o.kind==='anchor-tower';
      alphaWrap(.8,()=>{for(const f of [-1,1])pixelLimb(x+f*w*.43,y,x+f*w*.34,y-h,5,'#463e48');B(x-w*.38,y-h,w*.76,4,'#695c5b');
        for(let yy=30;yy<h;yy+=54){B(x-w*.37,y-yy,w*.74,2,'#554954');if(!tower)pixelLimb(x-w*.34,y-yy,x+w*.34,y-Math.min(h,yy+54),2,'#554954');}
        if(tower){B(x-w*.3,y-h,w*.6,h,'#383344');for(let yy=35;yy<h;yy+=63)B(x-w*.12,y-yy,4,13,'#211e30');}
      });return true;
    }
    case 'watching-road': case 'mantlet-road': case 'windcut-gallery': case 'deadeye-court':{
      const court=o.kind==='deadeye-court',gallery=o.kind==='windcut-gallery';
      // Open bays frame the route without drawing a second fake platform course.
      alphaWrap(.65,()=>{for(let i=0;i<5;i++){const px=x-w*.44+i*w*.22;B(px,y-h*.7,7,h*.7,'#393242');B(px-4,y-h*.7-4,15,5,'#534956');}
        B(x-w*.45,y-h*.7,w*.9,4,'#4f4552');
        if(court){B(x-w*.4,y-h*.82,w*.8,2,'#6b5960');for(let i=0;i<7;i++){const px=x-w*.36+i*w*.12;chain(px,y-h*.82,y-h*.72,'#695b61');B(px-3,y-h*.72,6,8,'#867e78');}}
        else if(gallery){for(const f of [-1,1])pixelLimb(x+f*w*.42,y,x+f*w*.16,y-h*.7,3,'#4a414e');}
        else if(o.kind==='mantlet-road'){for(let i=0;i<7;i++){const px=x-w*.4+i*w*.13;wheel(px,y-h*.7,4,0,'#6e5e5c');chain(px,y-h*.7+5,y-h*(.35+hash(i,3)*.15),'#4f4651');}}
      });return true;
    }
    case 'faceless-mask-rack':{
      frame(x,y,w,h,WATCH.wood);B(x-w*.35,y-h*.55,w*.7,2,'#7c6858');
      for(let i=-2;i<=2;i++){const xx=x+i*w*.14,yy=y-h*.5+(i%2)*2;B(xx-3,yy-6,6,11,'#b7afa0');B(xx-4,yy-4,8,6,'#b7afa0');B(xx-2,yy-5,2,4,'#e0d4bc');B(xx-2,yy+4,4,1,'#776e66');}
      if(o.courtCrack)pixelLimb(x-6,y-2,x+8,y-14,1,'#97806a');return true;
    }
    case 'impact-scar':{
      for(let i=0;i<8;i++){const dx=(i/7-.5)*w*.8;B(x+dx,y-1,2,2,WATCH.dark);pixelLimb(x+dx,y-2,x+dx+5,y-10-hash(i,8)*16,1,WATCH.brass);B(x+dx+4,y-10-hash(i,8)*16,3,2,WATCH.light);}return true;
    }
    default:return false;
  }
}
function drawMarksmanSightlines(){
  if(curG.stageIndex!==4)return;
  for(const e of curG.enemies){
    if(e.dead)continue;
    const boss=!!e.marksmanPortalFight,t=boss?e.marksmanAimT:e.railAimT,tx=boss?e.marksmanAimX:e.railAimX,ty=boss?e.marksmanAimY:e.railAimY;
    if(!(t>0)||!Number.isFinite(tx)||!Number.isFinite(ty))continue;
    const ox=WX(e.x+(boss?(e.face||1)*10:0)),oy=WY(e.y+e.h*(boss?.62:.55)),x=WX(tx),y=WY(ty),q=1-Math.min(1,t/(boss?(e.marksmanAimMax||.8):.78));
    const n=Math.max(1,Math.ceil(Math.hypot(x-ox,y-oy))),col=boss&&e.marksmanAimMarked?'#f4e7bb':'#d7b586';
    alphaWrap(.25+q*.35,()=>{for(let i=0;i<=n;i+=7){const xx=ox+(x-ox)*i/n,yy=oy+(y-oy)*i/n;if(xx>=-2&&xx<=bw+2)B(xx,yy,2,1,col);}});
    const r=5+Math.round((1-q)*4);for(const f of [-1,1]){B(x+f*r,y-2,1,5,col);B(x-2,y+f*r,5,1,col);}
    B(ox-1,oy-1,3,2,q>.7?WATCH.light:WATCH.brass);
  }
}
function drawWatchBow(x,y,dx,dy,span,pull,col,nocked){
  const m=Math.hypot(dx,dy)||1,ux=dx/m,uy=dy/m,nx=-uy,ny=ux;
  const ax=x-nx*span,ay=y-ny*span,bx=x+nx*span,by=y+ny*span,gripX=x+ux*4,gripY=y+uy*4,handX=x-ux*pull,handY=y-uy*pull;
  pixelLimb(ax,ay,gripX,gripY,2,col);pixelLimb(gripX,gripY,bx,by,2,col);
  pixelLimb(ax,ay,handX,handY,1,WATCH.light);pixelLimb(handX,handY,bx,by,1,WATCH.light);
  if(nocked){pixelLimb(handX,handY,x+ux*8,y+uy*8,1,WATCH.light);pixelLimb(x+ux*8-nx,y+uy*8-ny,x+ux*8+nx,y+uy*8+ny,1,col);}
}
function drawWatchSniper(e){
  const x=WX(e.x),foot=WY(e.y),w=W2(e.w),h=W2(e.h),y=foot-h,aim=e.railAimT>0;
  const f=aim&&Number.isFinite(e.railAimX)?Math.sign(e.railAimX-e.x)||e.face||-1:e.face||-1,fl=e.hitFlash>0,plated=e.gateMechanismSniper&&!(L.circuitOpen&&L.circuitOpen('mantlet-release'));
  const body=fl?P.ink:WATCH.iron,light=fl?P.ink:WATCH.brass,oy=WY(e.y+e.h*.55);
  if(e.gateMechanismSniper){
    B(x-w*.38,foot-3,w*.76,4,WATCH.iron);wheel(x,foot-1,3,(e.x-(e.watchHomeX??e.x))*.12,WATCH.brass);
    B(x-w/2,y+3,w,h-7,body);B(x-w/2,y+2,w,2,light);B(x-3,y,6,3,light);
    if(plated){for(const f2 of [-1,1]){B(x+f2*(w*.3)-2,y+4,5,h-8,light);B(x+f2*(w*.3)-1,y+6,2,2,WATCH.light);}}
    else{B(x-w*.4,y+h-6,w*.8,2,WATCH.edge);B(x-3,y+5,6,5,'#393e38');}
  }else{
    // Watch gargoyles perch to shoot: folded stone wings replace the idle flap.
    B(x-4,y+2,8,h-4,body);B(x-3,y,6,3,WATCH.wood);B(x-3,y+3,6,4,'#bcb6a7');B(x-2,y+3,1,3,WATCH.light);
    for(const s of [-1,1])pixelLimb(x+s*4,y+5,x+s*(e.watchMoveT>0?w*.7:w*.4),y+(e.watchMoveT>0?1:h-4),3,body);
    B(x-5,foot-3,3,3,WATCH.wood);B(x+2,foot-3,3,3,WATCH.wood);
  }
  const bx=x+f*(w*.38),pull=aim?5:1;
  drawWatchBow(bx,oy,aim?e.railAimX-e.x:f,aim?e.y+e.h*.55-e.railAimY:0,7,pull,light,aim);
}
function drawWatchGuard(e){
  const w=W2(e.w),h=W2(e.h),state=e.watchState,wind=state==='windup',attack=state==='commit',rest=state==='recover',f=wind||attack?(e.watchCommitDir||e.face||-1):e.face||-1;
  const x=WX(e.x)+(wind?-f*2:attack?f*2:0),foot=WY(e.y),y=foot-h+(rest?3:wind?2:0),fl=e.hitFlash>0;
  const moved=e._drawX===undefined?0:Math.min(12,Math.abs(e.x-e._drawX));e._drawX=e.x;e._ra=(e._ra||0)+moved/14;const step=wind||rest?0:Math.round(Math.sin(e._ra*2)*2);
  B(x-w*.3+step,foot-5,w*.2,5,WATCH.clothDark);B(x+w*.13-step,foot-5,w*.2,5,WATCH.clothDark);
  B(x-w*.4,y+h*.3,w*.8,h*.5,fl?P.ink:WATCH.cloth);B(x-w*.3,y+h*.3,w*.6,1,WATCH.brass);
  B(x-w*.2,y,w*.4,h*.4,fl?P.ink:WATCH.dark);B(x-w*.15,y+2,w*.3,h*.2,fl?P.ink:'#c9c0aa');
  const sf=e.shieldFace||f,sx=x+sf*w*.35,sy=rest?foot-5:y+h*.16,sh=rest?4:h*.7;
  B(sx-3,sy,6,sh,WATCH.iron);B(sx+(sf>0?2:-3),sy,1,sh,WATCH.brass);B(sx-2,sy+sh*.45,4,2,WATCH.brass);
  const ax=x-f*w*.33,ay=y+h*.5;pixelLimb(ax,ay,ax+f*(attack?10:wind?-4:2),ay+(wind?-9:rest?4:0),2,WATCH.wood);
  B(ax+f*(attack?10:wind?-4:2)-1,ay+(wind?-10:rest?3:-1),3,3,WATCH.light);
}
function drawMarksmanFigure(e){
  const w=W2(e.w),h=W2(e.h),f=e.face||-1,aim=e.marksmanAimT>0,fired=e.marksmanShotT>0,rest=e.marksmanRecoverT>0&&!(e.marksmanShotT>0),transform=e.marksmanState==='transform',warded=!e.rangefinderBroken,fl=e.hitFlash>0;
  const x=WX(e.x),foot=WY(e.y),y=foot-h+(rest?3:transform?4:0),lean=aim?-f:fired?-f*2:rest?f*3:0;
  const moved=e._drawX===undefined?0:Math.min(14,Math.abs(e.x-e._drawX));e._drawX=e.x;e._ra=(e._ra||0)+moved/20;
  const airborne=Math.abs(e.vy||0)>20,step=aim||rest||warded?0:Math.round(Math.sin(e._ra*2)*3),body=fl?P.ink:WATCH.cloth,dark=fl?P.ink:WATCH.clothDark;
  B(x-w*.3,foot-1,w*.6,2,T.line);
  B(x-w*.23+step,foot-h*.23,w*.16,h*.23-(airborne?3:0),dark);B(x+w*.07-step,foot-h*.23+(airborne?3:0),w*.16,h*.23-(airborne?3:0),dark);
  for(let i=0;i<h*.45;i++){const ww=w*(.35+i/h*.4);B(x+lean-f*2-ww/2,y+h*.31+i,ww,1,i%7===0?dark:body);}
  B(x-w*.27+lean,y+h*.28,w*.54,h*.36,body);B(x-w*.27+lean,y+h*.28,w*.54,2,'#9c9e74');B(x-w*.23+lean,y+h*.63,w*.46,2,WATCH.wood);
  B(x-w*.24+lean,y+1,w*.48,h*.29,fl?P.ink:WATCH.dark);B(x-w*.18+lean,y,w*.36,2,dark);
  const mx=x+lean+(f>0?0:-w*.18);B(mx,y+h*.1,w*.21,h*.17,fl?P.ink:'#d8d2c4');B(mx,y+h*.1,1,h*.15,'#f0e4cc');
  if(e.faceGlareUntil>time)B(mx+w*.09,y+h*.15,2,2,'#fff5c9');
  if(!warded)pixelLimb(mx+w*.14,y+h*.1,mx+w*.08,y+h*.25,1,WATCH.dark);
  if(warded){B(x-w*.18+lean,y+h*.35,w*.36,7,WATCH.iron);B(x-w*.2+lean,y+h*.35,w*.4,2,WATCH.brass);B(x-w*.2+lean,y+h*.35+5,w*.4,2,WATCH.brass);}
  const ox=WX(e.x+f*10),oy=WY(e.y+e.h*.62),bx=x+f*w*.37+(rest?-f*2:0),by=rest?foot-h*.22:oy,span=rest?h*.21:h*.3,pull=aim?(1-Math.min(1,e.marksmanAimT/(e.marksmanAimMax||.8)))*6+3:1;
  pixelLimb(x+lean,y+h*.36,bx,by,3,body);pixelLimb(x-f*w*.13+lean,y+h*.36,bx-f*pull,by,2,body);
  const aimed=(aim||fired)&&Number.isFinite(e.marksmanAimX)&&Number.isFinite(e.marksmanAimY),dx=aimed?e.marksmanAimX-e.x:f,dy=aimed?e.y+e.h*.62-e.marksmanAimY:rest?.45:0;
  drawWatchBow(bx,by,dx,dy,span,pull,e.marksmanAimMarked&&aim?'#e5d4a3':WATCH.brass,aim);
  if(fired){B(bx-f*6,by-3,3,2,WATCH.brass);B(ox,oy,2,1,WATCH.light);}
  if(transform){const q=1-Math.min(1,(e.marksmanTransformT||0)/1.05);for(let i=0;i<5;i++){const side=i%2?1:-1;B(x+side*(4+q*(11+i*2)),y+h*.4-q*12+q*q*35+i*3,3,2,WATCH.brass);}}
}
function drawMarksmanAOE(a){
  if(curG.stageIndex!==4||a.type!=='arrowRain')return false;
  const x=WX(a.x),y=WY(a.y||0),r=W2(a.r),hit=!!a.hit,q=hit?Math.max(0,(a.life||0)/.3):1-Math.min(1,(a.t||0)/(a.t0||1.15));
  alphaWrap(hit?q:.5+q*.4,()=>{
    for(let dx=-r;dx<=r;dx+=2){const dy=Math.sqrt(Math.max(0,r*r-dx*dx))*.4;B(x+dx,y-dy,2,1,WATCH.brass);B(x+dx,y+dy,2,1,WATCH.brass);}
    for(let i=-3;i<=3;i++){const xx=x+i*r*.27,yy=y-(hit?3:10+(1-q)*34+(i%2)*3);B(xx-2,y-1,5,1,WATCH.iron);B(xx,yy-8,1,10,WATCH.light);B(xx-1,yy+1,3,2,WATCH.brass);B(xx-2,yy-8,2,2,WATCH.edge);B(xx+1,yy-8,2,2,WATCH.edge);}
  });return true;
}

// Ruined Keep: warm cut stone, iron hinges and pale slate share one visual grammar.
// Scenery sits behind the route; mechanisms read the same bodies and circuits as physics.
const KEEP={stone:'#645e72',edge:'#b0a69a',dark:'#302b3d',iron:'#544b52',ironLit:'#8c7c73',brass:'#bd9965',light:'#e5d5b5',slate:'#bdc5c0',slateDark:'#75898e',wood:'#605046'};
const keepOn=id=>!!(L.circuitOpen&&L.circuitOpen(id));
function drawKeepLandmarks(){
  if(curG.stageIndex!==5)return;
  for(const o of curG.obstacles){
    if(!o.keepArchitecture||o.keepReturn||o.keepReturnExit)continue;
    const x=WX(o.x),y=WY(o.y||0),w=W2(o.w||700),h=W2(o.h||650);
    if(x+w/2<-20||x-w/2>bw+20)continue;
    if(o.kind==='archive-chain'){chain(x,y-h,y,'#4c4554');B(x-4,y-h,9,3,'#655967');continue;}
    if(o.kind==='east-collapse'){
      for(let i=0;i<10;i++){const hh=12+hash(i,o.x)*h*.36,xx=x-w*.47+i*w*.1;B(xx,y-hh,w*.12,hh,'#39323f');B(xx,y-hh,w*.12,2,'#605262');}
      pixelLimb(x-w*.38,y-h*.62,x+w*.2,y-15,10,'#514354');continue;
    }
    const hearth=o.kind==='keep-gatehouse',archive=o.kind==='clinging-archive',belfry=o.kind==='split-belfry';
    alphaWrap(.82,()=>{
      // Broken roof bays leave the sky visible and avoid a solid false wall.
      B(x-w*.48,y-h*.8,w*.96,h*.8,'#252031');
      for(let i=0;i<6;i++){
        const xx=x-w*.44+i*w*.176,hh=h*(i%2?.77:.84);
        B(xx-5,y-hh,10,hh,'#393243');B(xx-7,y-hh,14,3,'#514658');
        if(i<5){const cx=xx+w*.088,r=Math.min(58,w*.067);stepArc(cx,y-h*.49,r,'#4a4052',3);B(cx-r,y-h*.49,3,h*.49,'#39323f');B(cx+r-2,y-h*.49,3,h*.49,'#39323f');}
      }
      B(x-w*.46,y-h*.78,w*.92,3,'#4d4153');
      for(let i=0;i<8;i++){const xx=x-w*.42+i*w*.12;B(xx,y-h*.86,15+hash(i,o.x)*22,9,'#3e3448');}
      if(archive){
        for(let i=0;i<6;i++){const xx=x-w*.38+i*w*.15;B(xx,y-h*.68,18,h*.39,'#1c1926');for(let yy=0;yy<h*.39;yy+=17){B(xx,y-h*.68+yy,18,2,'#49404c');for(let j=0;j<4;j++)B(xx+2+j*4,y-h*.68+yy+4,2,10,j%2?'#5a4b4c':'#484150');}}
      }else if(hearth){
        for(let i=0;i<4;i++){const xx=x-w*.3+i*w*.21;B(xx-8,y-h*.59,16,25,'#705343');B(xx-6,y-h*.58,12,18,'#a0754c');B(xx,y-h*.59,2,25,'#39313b');}
      }else if(o.kind==='masons-quarter'){
        for(let i=0;i<5;i++){const xx=x-w*.36+i*w*.17;B(xx-13,y-58,26,58,'#1b1823');for(let j=-1;j<=1;j++){B(xx+j*8,y-56,2,23,'#5d515f');B(xx+j*8+3,y-24,2,24,'#5d515f');}}
      }else if(o.kind==='fallen-refectory'){
        for(let i=0;i<4;i++){const xx=x-w*.33+i*w*.23;B(xx-24,y-12,48,3,'#4d3d3e');B(xx-20,y-9,3,9,'#3e333a');B(xx+16,y-9,3,9,'#3e333a');}
      }
      if(belfry){
        const fold=keepOn('belfry-fold');
        for(const f of [-1,1]){const xx=x+f*w*.31;pixelLimb(xx,y-h*.9,xx+f*(fold?45:8),y-h*.45,7,'#574950');wheel(xx,y-h*.9,8,fold?f*.6:0,'#79685f');}
      }
    });
  }
}
function drawKeepConnections(){
  if(curG.stageIndex!==5)return;
  for(const shelf of curG.obstacles){
    if(!shelf.keepHoistShelf&&!shelf.belfryCradle)continue;
    const x=WX(shelf.x),y=WY(shelf.y),w=W2(shelf.w),top=WY(shelf.y+180),open=!!shelf.gone||keepOn(shelf.dropOnCircuit);
    for(const f of [-1,1]){B(x+f*(w*.56)-2,top,4,WY(0)-top,'#463d47');chain(x+f*(w*.44),top+7,y,'#8a796b');B(x+f*w*.56-5,y-2,10,4,KEEP.ironLit);}
    B(x-w*.6,top,w*1.2,5,KEEP.wood);B(x-w*.6,top,w*1.2,1,KEEP.edge);
    wheel(x,top+3,7,open?.8:0,KEEP.brass);
    const release=curG.obstacles.find(q=>q.keepDropRelease&&q.id===shelf.dropOnCircuit);
    if(release){
      const rx=WX(release.x),ry=WY(release.y)-13,corner=top+2;
      pixelLimb(x+8,corner,rx,corner,1,'#867263');chain(rx,corner+4,ry,'#867263');wheel(rx,corner,5,open?.7:0,KEEP.brass);
      B(rx-3,ry-3,7,4,KEEP.iron);if(open)pixelLimb(rx,ry-1,rx+6,ry+8,1,KEEP.edge);
    }
    // The empty cradle keeps its open hinges visible while its collision is gone.
    if(open)for(const f of [-1,1]){pixelLimb(x+f*w*.48,y,x+f*w*.48,y+w*.34,4,KEEP.iron);B(x+f*w*.48-1,y,2,w*.34,KEEP.ironLit);}
  }
  for(const plate of curG.obstacles){
    if(!plate.keepMasonryPlate&&!plate.belfryFoldPlate&&!plate.belfryBellPlate)continue;
    const gate=curG.obstacles.find(q=>q.type==='door'&&q.circuit===plate.id);if(!gate)continue;
    const x=WX(plate.x),y=WY(plate.y),gx=WX(gate.x),gy=WY(gate.y),on=keepOn(plate.id),trunk=gy-13;
    pixelLimb(x,y+6,x,trunk,2,'#514650');pixelLimb(x,trunk,gx,trunk,2,'#514650');
    pixelLimb(x,y+(on?5:1),x,trunk,1,KEEP.brass);pixelLimb(x,trunk,gx,trunk,1,KEEP.brass);chain(gx,trunk,gy,KEEP.brass);
    wheel(x,trunk,5,on?.8:0,KEEP.brass);wheel(gx,trunk,5,on?.8:0,KEEP.brass);
    if(plate.belfryBellPlate){
      const bellX=gx-27,bellY=trunk+30,sway=on?Math.sin(time*2)*2:0;
      chain(bellX,trunk,bellY-12,KEEP.ironLit);B(bellX-8+sway,bellY-13,17,8,KEEP.brass);
      for(let i=0;i<9;i++)B(bellX-8+sway-i*.6,bellY-5+i,17+i*1.2,1,i<6?'#aa8254':KEEP.light);
      B(bellX-11+sway,bellY+5,24,3,KEEP.ironLit);pixelLimb(bellX+sway,bellY+5,bellX-sway,bellY+13,2,KEEP.brass);
      const catchBody=curG.obstacles.find(q=>q.keepDockCatch==='bell');
      if(catchBody){
        const origin=catchBody.x0??catchBody.x,span=Math.abs(catchBody.move?.dx??80)+catchBody.w/2,rx=WX(origin-span),rw=W2(span*2);
        B(rx,y+17,rw,3,KEEP.iron);B(rx,y+17,rw,1,KEEP.ironLit);
        for(const f of [-1,1]){const xx=WX(origin+f*span);chain(xx,trunk+5,y+16,'#5d5158');wheel(x+f*14,y+15,4,(catchBody.x-origin)*.035,KEEP.brass);}
      }
    }
  }
  // Brackets and recessed backing make the return shelves part of the archive.
  for(const o of curG.obstacles){
    if(o.type!=='plat'||o.deep||!o.supportedBy||o.keepHoistShelf||o.belfryCradle)continue;
    const x=WX(o.x),y=WY(o.y),w=W2(o.w);if(x+w/2<0||x-w/2>bw)continue;
    const niche=String(o.supportedBy).includes('niche')||String(o.supportedBy).includes('return');
    if(niche){B(x-w*.4,y-20,w*.8,25,'#211d2a');stepArc(x,y-18,Math.round(w*.4),'#5c4f60',2);}
    for(const f of [-1,1]){const xx=x+f*w*.3;pixelLimb(xx,y+5,xx-f*8,y+24,3,'#4a404d');B(xx-3,y+4,6,3,'#79676a');}
  }
}
function drawKeepShelf(o,bx,by,w,h){
  if(!o.keepHoistShelf&&!o.belfryCradle)return false;
  if(o.gone||keepOn(o.dropOnCircuit))return true;
  B(bx,by,w,h,KEEP.iron);B(bx,by,w,2,KEEP.edge);B(bx+w/2-1,by,2,h,KEEP.dark);
  for(const f of [.14,.86]){B(bx+w*f-2,by+2,4,h-2,KEEP.brass);B(bx+w*f-1,by+3,2,2,KEEP.light);}
  return true;
}
function drawKeepWall(o,bx,by,w,h){
  bricks(bx,by,w,h,o.x,o.y);B(bx,by,w,2,KEEP.edge);
  if(o.slate){
    B(bx,by,3,h,KEEP.slate);B(bx+w-3,by,3,h,KEEP.slate);
    for(let yy=8;yy<h-3;yy+=13){B(bx,by+yy,3,3,KEEP.slateDark);B(bx+w-3,by+yy,3,3,KEEP.slateDark);}
  }else if(o.slickL||o.slickR){
    // Smooth dark glaze is visibly different from both grip stone and slate.
    if(o.slickL){B(bx,by+2,2,h-2,'#797183');B(bx+2,by+4,1,h-6,'#3d364c');}
    if(o.slickR){B(bx+w-2,by+2,2,h-2,'#797183');B(bx+w-3,by+4,1,h-6,'#3d364c');}
  }else if(!o.noCling){
    for(let yy=10;yy<h-3;yy+=14){B(bx,by+yy,3,2,'#9b8b84');B(bx+w-3,by+yy+5,3,2,'#9b8b84');}
  }
}
function drawKeepDoor(o,bx,by,w,h,open){
  B(bx-3,by,w+6,4,KEEP.edge);B(bx-3,by+4,3,h-4,KEEP.iron);B(bx+w,by+4,3,h-4,KEEP.iron);
  const hh=open?Math.min(h,12):h;
  for(let yy=4;yy<hh;yy+=14){B(bx,by+yy,w,12,KEEP.iron);B(bx,by+yy,w,2,KEEP.ironLit);B(bx+3,by+yy+4,2,2,KEEP.brass);B(bx+w-5,by+yy+4,2,2,KEEP.brass);}
  if(open){for(let yy=4;yy<12;yy+=3)B(bx-1,by+yy,w+2,1,KEEP.brass);}
  else B(bx-1,by+h-4,w+2,4,KEEP.brass);
}
function drawKeepWeight(o,bx,by,w,h){
  const plate=curG.obstacles.find(q=>q.type==='plate'&&q.id===o.targetPlate),seated=!!o.keepSeated||plate&&keepOn(plate.id)&&Math.abs(o.x-plate.x)<plate.w/2+o.w/2&&Math.abs(o.y-plate.y)<12;
  const brass=!!o.belfryWeight,edge=o.resetF>0?KEEP.light:brass?KEEP.brass:KEEP.edge;
  B(bx,by,w,h,brass?'#675451':KEEP.stone);B(bx,by,w,2,edge);B(bx,by,2,h,edge);B(bx+w-2,by+2,2,h-2,KEEP.dark);B(bx+2,by+h-2,w-2,2,KEEP.dark);
  for(const f of [.22,.7]){B(bx+w*f,by+2,2,h-4,KEEP.iron);B(bx+w*f,by+2,2,2,KEEP.brass);}
  if(brass){B(bx+w/2-2,by+h*.35,4,5,KEEP.brass);B(bx+w/2-3,by+h*.65,6,1,KEEP.light);}
  else{pixelLimb(bx+5,by+4,bx+w/2,by+h-5,1,'#3d3647');pixelLimb(bx+w/2,by+h-5,bx+w-4,by+5,1,'#3d3647');}
  if(seated){for(const f of [-1,1]){const xx=bx+w/2+f*(w/2+2);B(xx-1,by+h-7,3,7,KEEP.brass);B(xx-(f>0?4:0),by+h-7,5,2,KEEP.light);}}
  if(Math.abs(o.vy||0)>150){for(const f of [.2,.8])B(bx+w*f,by-6,1,4,'#b09d87');}
  if(o.stuck>0){const unwinding=Math.min(1,o.stuck/3);wheel(bx+w/2,by+h/2,4,unwinding*6,KEEP.brass);}
}
function drawKeepPlate(o,bx,by,w){
  const on=!!o.pressed||keepOn(o.id),down=on?2:0;
  B(bx-3,by-2,w+6,4,KEEP.dark);B(bx,by-5+down,w,4-down,KEEP.ironLit);B(bx+2,by-5+down,w-4,1,KEEP.light);
  for(const f of [-1,1]){const xx=bx+w/2+f*(w*.46);B(xx-2,by-11,4,10,KEEP.iron);B(xx-1,by-11,2,3,KEEP.brass);}
  B(bx+w/2-4,by+1,8,2,on?KEEP.brass:KEEP.iron);
}
function drawKeepRelease(o){
  if(!o.keepDropRelease)return false;
  const x=WX(o.x),y=WY(o.y||0),on=o.timer>0;
  B(x-8,y-4,16,5,KEEP.iron);B(x-7,y-4,14,1,KEEP.edge);
  const tx=x+(on?8:-7),ty=y-(on?10:21);pixelLimb(x,y-5,tx,ty,3,KEEP.brass);B(tx-3,ty-2,7,4,KEEP.light);
  wheel(x,y-5,4,on?.8:0,KEEP.ironLit);return true;
}
/* THE CART AT THE KEEP'S RAIL HEAD. Two states, and the state is the story: before the
   line has ever been ridden it sits square on its irons, chocked and chained, with its
   lamp cold — a vehicle that plainly works and plainly is not yours yet. After the ride
   it is off the rails at the Keep end: one wheel gone, the tub canted into the spoil, a
   torn length of track thrown clear and rock down across the bed. Nothing about it says
   "interact"; it says a thing happened here.
     "Ridden" is a world-scoped opened CONNECTOR, not a persistent circuit, because
   circuits are zone-scoped and this prop is asked about from a different zone than the
   one the ride ends in. */
function drawRailCart(o, bx, by){
  const ridden = !!(L.deepLineRidden && L.deepLineRidden());
  const IRON = '#6b5a4a', WOOD = '#5a4028', DARK = '#1b120d', LAMP = '#ffb04a', ROCK = '#4a3a34';
  const w = Math.max(10, Math.round(46 * Z)), h = Math.max(8, Math.round(30 * Z));
  // the rail bed under it, either way
  B(bx - Math.round(w * .9), by - Math.round(Z * 2), Math.round(w * 1.8), Math.max(1, Math.round(Z * 2)), IRON);
  for(let i = -3; i <= 3; i++)
    B(bx + i * Math.round(w * .28) - Math.round(Z * 2), by - Math.round(Z * 5),
      Math.max(1, Math.round(Z * 4)), Math.round(Z * 4), WOOD);
  if(!ridden){
    // square on its irons: tub, banded lip, two wheels, a cold lamp and a chain
    B(bx - (w >> 1), by - h, w, Math.round(h * .74), WOOD);
    B(bx - (w >> 1), by - h, w, Math.max(1, Math.round(Z * 3)), '#c9a860');
    for(const wx of [-w * .3, w * .3]){
      const cx = Math.round(bx + wx), r = Math.max(2, Math.round(Z * 5));
      B(cx - r, by - r * 2, r * 2, r * 2, DARK);
      B(cx - r, by - r - 1, r * 2, Math.max(1, Math.round(Z)), IRON);
    }
    B(bx - Math.round(w * .62), by - Math.round(h * .5), Math.round(w * .2), Math.max(1, Math.round(Z * 2)), IRON); // chock chain
    B(bx + (w >> 1) - Math.round(Z * 3), by - h - Math.round(Z * 7), Math.round(Z * 5), Math.round(Z * 7), IRON);
    B(bx + (w >> 1) - Math.round(Z * 2), by - h - Math.round(Z * 6), Math.round(Z * 3), Math.round(Z * 3), '#3a3028'); // lamp, unlit
    return true;
  }
  // derailed: canted tub, one wheel loose, torn rail, spoil
  ctx.save();
  ctx.translate(bx, by); ctx.rotate(-0.22);
  B(-(w >> 1), -h, w, Math.round(h * .74), WOOD);
  B(-(w >> 1), -h, w, Math.max(1, Math.round(Z * 3)), '#8a7448');
  B(-Math.round(w * .1), -Math.round(h * .5), Math.round(w * .3), Math.round(h * .4), DARK); // stove-in
  ctx.restore();
  const r = Math.max(2, Math.round(Z * 5));
  B(bx + Math.round(w * .8) - r, by - r * 2, r * 2, r * 2, DARK);   // the wheel that came off
  B(bx + Math.round(w * .8) - r, by - r - 1, r * 2, Math.max(1, Math.round(Z)), IRON);
  ctx.save(); ctx.translate(bx - Math.round(w * .9), by - Math.round(Z * 6)); ctx.rotate(0.5);
  B(0, 0, Math.round(w * .8), Math.max(1, Math.round(Z * 2)), IRON);   // torn track
  ctx.restore();
  for(let i = 0; i < 7; i++){
    const rx = bx + ((i * 37) % Math.round(w * 1.6)) - Math.round(w * .8);
    const rs = Math.max(2, Math.round((2 + (i % 3)) * Z));
    B(rx, by - rs, rs, rs, i % 2 ? ROCK : '#3a2c26');
  }
  glow(bx, by - Math.round(h * .4), Math.round(20 * Z), '90,64,40', .12);
  return true;
}
function drawKeepProp(o,x,y){
  if(o.kind==='rail-cart')return drawRailCart(o,x,y);
  if(o.keepReturn||o.keepReturnExit){
    const w=W2(o.w||120),h=W2(o.h||150),open=!!(curG.keepWestSealOpen||curG.ruinedKeepArchiveComplete);
    B(x-w/2,y-h,w,h,KEEP.dark);B(x-w/2-3,y-h,w+6,4,KEEP.edge);B(x-w/2-3,y-h,3,h,KEEP.stone);B(x+w/2,y-h,3,h,KEEP.stone);
    B(x-w/2+4,y-4,w-8,4,KEEP.wood);B(x-w/2+4,y-4,w-8,1,KEEP.edge);wheel(x,y-h+10,6,open?.8:0,KEEP.brass);
    for(const f of [-1,1])chain(x+f*(w*.38),y-h+6,y-4,KEEP.ironLit);
    const gateH=open?10:h-18;
    for(let xx=-w*.32;xx<=w*.32;xx+=7){B(x+xx,y-h+18,2,gateH,KEEP.ironLit);}
    B(x-w*.36,y-h+18+gateH,w*.72,3,KEEP.brass);
    if(open){B(x-9,y-12,18,1,KEEP.edge);B(x-9,y-16,1,5,KEEP.brass);B(x+8,y-16,1,5,KEEP.brass);}
    return true;
  }
  if(o.keepArchitecture||o.keepHoist)return true;
  if(o.keepWallJump){
    const claimed=!!o.read||!!(L.hasCapability&&L.hasCapability('wall-jump'));
    B(x-23,y-24,46,24,KEEP.dark);B(x-25,y-3,50,3,KEEP.stone);stepArc(x,y-20,24,KEEP.ironLit,3);
    B(x-15,y-8,30,5,KEEP.wood);B(x-16,y-9,32,1,KEEP.edge);
    if(!claimed){
      // A palm and fingers wrapped in linen, with the long loose binding resting on the ledge.
      B(x-5,y-23,10,11,'#aa977d');B(x-4,y-29,2,8,KEEP.light);B(x-1,y-31,2,9,KEEP.light);B(x+2,y-30,2,8,KEEP.light);B(x+5,y-27,2,9,KEEP.edge);
      pixelLimb(x-5,y-18,x-9,y-23,3,KEEP.edge);for(let yy=-21;yy<-10;yy+=3)pixelLimb(x-5,y+yy,x+5,y+yy-2,2,KEEP.light);
      pixelLimb(x+4,y-12,x+11,y-8,2,KEEP.edge);B(x+10,y-8,7,2,KEEP.light);nearGlow(o,'216,196,165',18);
    }
    return true;
  }
  if(o.keepVaultKey){
    B(x-25,y-47,50,47,KEEP.dark);B(x-28,y-3,56,3,KEEP.stone);stepArc(x,y-39,25,KEEP.ironLit,3);
    for(const f of [-1,1]){B(x+f*21-2,y-33,4,29,KEEP.stone);B(x+f*17-2,y-29,5,5,'#776a71');}
    const c=o.used?'#514853':KEEP.brass;wheel(x,y-29,7,0,c);B(x-1,y-22,3,13,c);B(x,y-13,7,3,c);B(x+5,y-16,2,4,c);
    if(!o.used)glow(x,y-25,20,'229,213,181',.18);return true;
  }
  if(o.kind==='mended-arch'){
    const on=keepOn(o.circuit||'keep-weight'),r=W2(Math.min(o.w||620,620)*.4);
    for(const f of [-1,1]){B(x+f*r-5,y-35,10,35,KEEP.stone);stepArc(x,y-35,r,'#62545c',7);}
    if(on){B(x-7,y-35-r,14,12,KEEP.edge);B(x-5,y-35-r+2,10,7,KEEP.stone);}
    else B(x-8,y-36-r,16,13,'#27212f');return true;
  }
  if(o.kind==='keep-clock'){
    B(x-14,y-56,28,56,'#3c3444');B(x-16,y-56,32,3,KEEP.edge);B(x-12,y-49,24,24,KEEP.dark);wheel(x,y-37,10,0,'#9a8a9c');
    pixelLimb(x,y-37,x-5,y-42,1,KEEP.light);pixelLimb(x,y-37,x+7,y-35,1,KEEP.light);chain(x,y-22,y-7,KEEP.brass);B(x-3,y-9,7,5,KEEP.brass);return true;
  }
  if(o.kind==='keep-hearth'){
    B(x-35,y-3,70,3,KEEP.dark);B(x-27,y-7,54,4,KEEP.wood);pixelLimb(x-23,y-4,x+23,y-10,3,'#876148');
    for(let i=-3;i<=3;i++){const hh=3+Math.sin(time*4+i)*2;B(x+i*7,y-7-hh,4,hh,'#ca864c');B(x+i*7,y-6,3,2,'#e6bf78');}glow(x,y-8,25,'224,164,91',.2);return true;
  }
  return false;
}
function drawKeepPortal(o,idx){
  if(o.gone)return;
  const wall=!!o.nx,x=WX(o.x),y=WY(o.y)-(wall?8:12),rx=wall?8:13,ry=wall?14:8,col=idx===0?'#8dcbd5':'#e5b37d';
  for(let dy=-ry;dy<=ry;dy++){const dx=Math.round(rx*Math.sqrt(Math.max(0,1-dy*dy/(ry*ry))));B(x-dx,y+dy,dx*2+1,1,KEEP.dark);B(x-dx,y+dy,1,1,col);B(x+dx,y+dy,1,1,col);}
  for(let i=0;i<3;i++){const a=time*2+i*2.094;B(x+Math.cos(a)*(rx-3),y+Math.sin(a)*(ry-3),1,1,KEEP.light);}
  pixelLimb(x,y,x+(o.nx||0)*5,y-(o.ny||0)*5,1,col);
}

// The Gaol uses dull iron behind the route and pale, worn edges on real bodies.
// Attack poses and armor seams read the combat state, never an animation clock.
const GAOL={dark:'#201927',back:'#302336',stone:'#665369',edge:'#b7a2b6',iron:'#4e4558',ironLit:'#927b91',brass:'#b79a73',light:'#e3d1b1',ward:'#b395ca',open:'#9ed8df',cloth:'#674a65'};
function drawGaolLandmarks(){
  if(curG.stageIndex!==6)return;
  for(const o of curG.obstacles){
    if(!o.wardenArchitecture)continue;
    const x=WX(o.x),y=WY(o.y||0),w=W2(o.w||260),h=W2(o.h||300);
    if(x+w/2<-30||x-w/2>bw+30)continue;
    if(o.roomLandmark){
      B(x-w/2,y-h*.9,w,h*.9,'#1b1423');
      const court=o.kind==='sentence-well',cells=o.kind==='turning-cells',engine=o.kind==='hush-engine';
      const bays=court?5:7;
      for(let i=0;i<bays;i++){
        const xx=x-w*.44+i*w*.88/(bays-1),r=Math.min(55,w/bays*.3),top=y-h*.62;
        B(xx-r-5,top,4,h*.62,'#3d2c42');B(xx+r+2,top,4,h*.62,'#3d2c42');
        stepArc(xx,top,r+4,'#48334d',3);stepArc(xx,top,r,'#2d2033',2);
        if(!court)for(let j=-2;j<=2;j++)B(xx+j*r*.31,top-r*.66,2,r*1.24,'#423145');
        if(o.kind==='blind-gallery'){
          B(xx-8,y-45,16,31,'#342737');B(xx-6,y-55,12,12,'#4a354c');B(xx+3,y-51,3,5,'#6e536a');
          B(xx-10,y-24,6,22,'#4b3b4e');
        }
        if(o.kind==='red-court'){B(xx-12,y-13,24,3,'#504044');B(xx-10,y-10,3,10,'#382b35');B(xx+7,y-10,3,10,'#382b35');}
      }
      B(x-w*.48,y-h*.86,w*.96,4,'#443047');B(x-w*.48,y-h*.85,w*.96,1,'#594055');
      if(engine){
        for(const s of [-1,1]){B(x+s*w*.36-10,y-h*.79,20,h*.55,'#34283d');B(x+s*w*.36-12,y-h*.67,24,4,'#514056');}
        chain(x,y-h*.87,y-h*.49,'#59495e');wheel(x,y-h*.54,24,time*.12,'#5c4a62');
      }
      if(cells)for(let i=0;i<3;i++){const xx=x-w*.32+i*w*.32;chain(xx,y-h*.84,y-18,'#4a394f');B(xx-5,y-22,10,18,'#3e3046');}
      if(court){
        const boss=curG.boss,returns=boss&&boss.wardenPortalFight?(boss.wardenSentenceReturns||0):0;
        for(let i=0;i<3;i++){
          const xx=x+(i-1)*38,yy=y-h*.73;B(xx-8,yy-11,16,23,'#4a354c');B(xx-6,yy-9,12,1,'#7c5e75');
          if(i<returns){chain(xx,yy+13,yy+26,'#725869');pixelLimb(xx,yy+31,xx+6,yy+43,2,'#725869');}
          else chain(xx,yy+13,y-h*.32,'#725869');
        }
      }
      continue;
    }
    if(o.kind==='frost-mine-mouth'){
      B(x-w*.3,y-h*.7,w*.6,h*.7,'#101923');stepArc(x,y-h*.56,w*.31,'#50616b',4);
      for(const s of [-1,1]){B(x+s*w*.3-3,y-h*.55,6,h*.55,'#594d57');B(x+s*w*.3,y-h*.55,1,h*.55,'#8d8586');}
      B(x-w*.33,y-h*.55,w*.66,5,'#736573');
      for(let i=0;i<4;i++)pixelLimb(x-w*.24,y-i*8,x+w*.24,y-i*8,2,'#40505b');continue;
    }
    // Open door furniture never paints a filled rectangle across the passage.
    const ww=Math.min(w,72),hh=Math.min(h,145);
    for(const s of [-1,1]){B(x+s*ww*.45-3,y-hh,6,hh,'#49354e');B(x+s*ww*.45,y-hh,1,hh,'#796079');}
    B(x-ww*.5,y-hh,ww,4,'#81637d');
    if(o.kind==='open-cell-door')for(let i=0;i<4;i++)B(x+ww*.48+i*2,y-hh+5,1,hh-6,'#655269');
  }
}
function drawGaolConnections(){
  if(curG.stageIndex!==6)return;
  for(const o of curG.obstacles){
    if(o.gone)continue;
    const x=WX(o.x),y=WY(o.y||0);
    if(o.type==='rotor'&&(o.wardenRotor||o.wardenCellRotor||o.wardenCourtRotor)){
      const r=W2(o.length||90);if(x+r<0||x-r>bw)continue;
      B(x-5,y,10,Math.max(3,WY(0)-y),'#392b40');B(x-4,y,1,Math.max(3,WY(0)-y),'#5d4760');
      // A recessed race shows the real sweep; only the moving bar has a bright edge.
      alphaWrap(.45,()=>{for(let a=0;a<6.28;a+=.055)B(x+Math.cos(a)*r,y-Math.sin(a)*r,1,1,'#67516e');});
    }
    if(o.gaolHushBrake){
      const rotor=curG.obstacles.find(q=>q.gaolBrakeCircuit===o.id),gate=curG.obstacles.find(q=>q.gaolHushGate),on=!!(L.circuitOpen&&L.circuitOpen(o.id));
      if(rotor){const rx=WX(rotor.x),ry=WY(rotor.y);pixelLimb(x,y+6,rx,ry,2,GAOL.ironLit);B(rx-5,ry-5,10,10,GAOL.iron);B(rx-4,ry-4,8,2,on?GAOL.open:GAOL.brass);}
      if(gate){const gx=WX(gate.x),gy=WY(gate.y)+12+(o.gaolHushBrake==='east'?0:9);pixelLimb(x,y+8,x,gy,2,GAOL.iron);pixelLimb(x,gy,gx,gy,2,GAOL.iron);pixelLimb(x,gy,gx,gy,1,on?GAOL.open:GAOL.brass);wheel(x,gy,4,on?.5:0,GAOL.brass);}
    }
    if(o.gaolRouteMouth==='exit'){
      const gate=curG.obstacles.find(q=>q.gaolCellGate),on=!!(L.circuitOpen&&L.circuitOpen('gaol-cell-passage'));
      if(gate){const gx=WX(gate.x),gy=WY(gate.y)-8;pixelLimb(x,y+W2(o.h)-8,x,gy,2,GAOL.iron);pixelLimb(x,gy,gx,gy,2,GAOL.iron);pixelLimb(x,gy,gx,gy,1,on?GAOL.open:GAOL.brass);wheel(gx,gy,4,on?.5:0,GAOL.brass);}
    }
    if(o.gaolCellCarrier){
      const ox=WX(o.x0??o.x),oy=WY(o.y0??o.y),dy=W2(o.move?.dy||210),w=W2(o.w);
      for(const s of [-1,1]){B(ox+s*w*.58,oy-dy-30,3,dy*2+55,GAOL.back);chain(ox+s*w*.38,oy-dy-25,y,GAOL.ironLit);}
      B(ox-w*.62,oy-dy-29,w*1.24,4,GAOL.ironLit);wheel(ox,oy-dy-28,6,time*.3,GAOL.brass);
    }else if(o.wardenTurningCourt){
      const ox=WX(o.x0??o.x),oy=WY(o.y0??o.y),move=o.wardenTurnMove||{},dx=W2(move.dx||0),dy=W2(move.dy||0);
      pixelLimb(ox-dx,oy+dy,ox+dx,oy-dy,3,'#3b2e45');pixelLimb(ox-dx,oy+dy,ox+dx,oy-dy,1,'#715974');
      B(x-5,y+4,10,4,GAOL.iron);B(x-4,y+4,8,1,GAOL.brass);
    }else if(o.type==='plat'&&!o.deep&&o.supportedBy){
      const w=W2(o.w);if(x+w/2<0||x-w/2>bw)continue;
      for(const s of [-1,1])pixelLimb(x+s*w*.36,y+6,x+s*w*.2,y+24,3,'#4d3851');
    }
  }
}
function drawGaolProp(o,x,y){
  if(o.wardenArchitecture)return true;
  if(o.kind==='shield-scratches'){
    for(let i=-2;i<=2;i++){pixelLimb(x-20+i*7,y-6,x+4+i*7,y-38+(i%2)*4,1,GAOL.ironLit);B(x-21+i*7,y-7,3,1,GAOL.dark);}return true;
  }
  if(o.kind==='gaol-vigil'){
    B(x-30,y-4,60,4,GAOL.dark);B(x-25,y-9,50,5,'#6c4e5e');B(x-23,y-9,46,1,'#ad8a90');
    for(const s of [-1,1]){B(x+s*17-2,y-17,5,8,GAOL.iron);B(x+s*17-1,y-16,3,5,'#cca786');}
    glow(x,y-13,24,'216,183,223',.16);return true;
  }
  return false;
}
function drawGaolLowG(o){
  const x=WX(o.x),y=WY(o.y),r=W2(o.r);
  alphaWrap(.18,()=>{for(let a=0;a<6.28;a+=.018)B(x+Math.cos(a)*r,y+Math.sin(a)*r,1,1,GAOL.open);});
  for(let i=0;i<24;i++){
    const xx=(hash(i,o.x)*2-1)*r*.93,span=Math.sqrt(Math.max(0,r*r-xx*xx)),t=(time*.08+i*.173)%1;
    alphaWrap(Math.sin(t*Math.PI)*.6,()=>{B(x+xx,y+span*(1-2*t),1,2,GAOL.open);B(x+xx+2,y+span*(1-2*t)+3,1,1,GAOL.ironLit);});
  }
}
function drawGaolPortal(o,idx){
  if(o.gone)return;
  const wall=!!o.nx,x=WX(o.x),y=WY(o.y)-(wall?8:12),rx=wall?8:13,ry=wall?14:8,col=idx===0?GAOL.open:'#ddb791';
  for(let dy=-ry;dy<=ry;dy++){
    const dx=Math.round(rx*Math.sqrt(Math.max(0,1-dy*dy/(ry*ry))));B(x-dx,y+dy,dx*2+1,1,GAOL.dark);
    B(x-dx,y+dy,1,1,col);B(x+dx,y+dy,1,1,col);
  }
  for(let i=0;i<3;i++){const a=time*2+i*2.094;B(x+Math.cos(a)*(rx-3),y+Math.sin(a)*(ry-3),1,1,GAOL.light);}
  pixelLimb(x,y,x+(o.nx||0)*5,y-(o.ny||0)*5,1,col);
}
function drawGaolGuard(e){
  const state=e.wardenState,wind=state==='windup',strike=state==='commit',rest=state==='recover',f=(wind||strike||rest?e.wardenCommitDir:e.face)||-1;
  const w=W2(e.w),h=W2(e.h),x=WX(e.x)+(wind?-f*2:strike?f*3:0),foot=WY(e.y),y=foot-h+(wind?3:rest?4:0),fl=e.hitFlash>0;
  const moved=e._drawX===undefined?0:Math.min(12,Math.abs(e.x-e._drawX));e._drawX=e.x;e._ra=(e._ra||0)+moved/14;
  const step=wind||rest?0:Math.round(Math.sin(e._ra*2)*2),body=fl?P.ink:GAOL.cloth,dark=fl?P.ink:GAOL.dark,edge=fl?P.ink:GAOL.edge;
  if(e.wardenRole==='gaol-hound'){
    B(x-w*.4,foot-12+(wind?3:0),w*.74,7,body);B(x-w*.4,foot-12+(wind?3:0),w*.74,1,edge);
    for(let i=0;i<4;i++)B(x-w*.3+i*w*.18+(i%2?step:-step),foot-6,2,6,dark);
    const hx=x+f*w*.4,hy=foot-(wind?8:strike?9:13);B(hx-3,hy,7,6,body);B(hx+f*3,hy+2,2,1,wind?GAOL.light:GAOL.ward);
    B(hx-3,hy-2,2,3,dark);B(hx+2,hy-2,2,3,dark);B(x-w*.26,foot-12+(wind?3:0),3,7,GAOL.ironLit);
    pixelLimb(x-f*w*.43,foot-8,x-f*w*.6,foot-(wind?6:13),2,dark);return;
  }
  if(e.wardenRole==='cell-shadow'){
    B(x-w*.23,y+h*.12,w*.46,h*.62,body);B(x-w*.31,y+h*.35,w*.62,h*.27,body);
    for(let i=0;i<4;i++)B(x-w*.3+i*w*.17,foot-5,3,4+(i%2),dark);
    B(x-3,y+h*.28,2,2,edge);B(x+2,y+h*.28,2,2,edge);
    pixelLimb(x+f*w*.25,y+h*.5,x+f*(strike?w*.8:wind?-w*.05:w*.4),y+h*(wind?.15:.55),2,GAOL.ward);
    return;
  }
  B(x-w*.3+step,foot-6,w*.22,6,dark);B(x+w*.1-step,foot-6,w*.22,6,dark);
  B(x-w*.35,y+h*.3,w*.7,h*.5,body);B(x-w*.35,y+h*.3,w*.7,1,edge);B(x-w*.33,y+h*.69,w*.66,2,GAOL.brass);
  B(x-w*.2,y,w*.4,h*.36,dark);B(x-w*.17,y+2,w*.34,2,GAOL.ironLit);B(x+f*3-1,y+h*.17,3,1,wind?GAOL.light:GAOL.ward);
  const sf=e.shieldFace||f,sx=x+sf*w*.4,sy=y+h*.24;
  B(sx-3,sy,7,h*.61,GAOL.iron);B(sx+(sf>0?3:-3),sy,1,h*.61,edge);B(sx-2,sy+h*.22,5,2,GAOL.brass);
  // Recovery keeps the committed shield upright: the opening is behind it.
  const ax=x-sf*w*.29,ay=y+h*.5,tx=ax+f*(strike?13:wind?-7:3),ty=ay+(wind?-12:rest?9:3);
  pixelLimb(ax,ay,tx,ty,2,GAOL.ironLit);B(tx-2,ty-2,5,5,GAOL.brass);B(tx-1,ty-1,2,2,GAOL.light);
}
function drawWardenFigure(e){
  const state=e.wardenState||'pursuit',coil=['rushWind','sentenceWind','sentenceRebound'].includes(state),rush=state==='rush'||state==='sentenceRush';
  const slam=state==='slamWind',remote=state==='portalBreakWind',broken=!!e.wardenBroken,rest=state==='recover'||state==='sentenceCrash';
  const f=(coil||rush?e.wardenRushDir:e.face)||-1,sf=e.shieldFace||f,w=W2(e.w),h=W2(e.h),foot=WY(e.y),x=WX(e.x)+(coil?-f*3:rush?f*5:0),y=foot-h+(broken?h*.32:rest?5:coil?4:0),fl=e.hitFlash>0;
  const moved=e._drawX===undefined?0:Math.min(14,Math.abs(e.x-e._drawX));e._drawX=e.x;e._ra=(e._ra||0)+moved/20;
  const step=coil||rest||broken||slam||remote?0:Math.round(Math.sin(e._ra*2)*3),body=fl?P.ink:GAOL.cloth,dark=fl?P.ink:GAOL.dark,rim=fl?P.ink:GAOL.edge;
  B(x-w*.45,foot-1,w*.9,3,GAOL.dark);
  B(x-w*.27+step,foot-h*.23,w*.19,h*.23,dark);B(x+w*.1-step,foot-h*.23,w*.19,h*.23,dark);
  B(x-w*.32,y+h*.27,w*.64,h*(broken?.37:.46),body);B(x-w*.37,y+h*.27,w*.74,4,GAOL.ironLit);B(x-w*.31,y+h*.66,w*.62,3,GAOL.brass);
  B(x-w*.2,y+h*.02,w*.4,h*.25,dark);B(x-w*.2,y+h*.02,w*.4,2,rim);B(x+f*w*.08-1,y+h*.14,3,2,coil?GAOL.light:GAOL.ward);
  for(let i=0;i<3;i++){const xx=x+(i-1)*w*.17;B(xx-1,y+h*.34,2,h*.24,GAOL.ironLit);}
  // Only a qualifying traversal opens the armor. A lit rear seam does not
  // erase the directional shield, including during a post-rush recovery.
  const open=broken||(curG.p.wardenFlankT||0)>0||(e.wardenExposureT||0)>0,seam=x-sf*w*.28;
  if(open){B(seam-1,y+h*.35,2,h*.27,GAOL.open);for(let i=0;i<3;i++)B(seam-sf*(3+i%2),y+h*.38+i*5,2,2,GAOL.open);glow(seam,y+h*.46,16,'158,216,223',.14);}
  else for(let i=0;i<3;i++)B(x-w*.24,y+h*.35+i*6,w*.48,1,GAOL.ward);
  if(!broken){
    const sx=x+sf*w*.37,sy=y+h*.24;
    B(sx-5,sy,11,h*.53,GAOL.iron);B(sx+(sf>0?5:-5),sy,1,h*.53,rim);B(sx-4,sy+2,9,2,GAOL.brass);B(sx-4,sy+h*.25,9,2,GAOL.brass);
    B(sx-1,sy+h*.14,3,h*.2,open?GAOL.ironLit:GAOL.ward);
  }else{B(x+sf*w*.46-7,foot-4,15,4,GAOL.iron);B(x+sf*w*.46-7,foot-4,15,1,GAOL.brass);}
  const ax=x-sf*w*.25,ay=y+h*.43;
  const tx=remote&&Number.isFinite(e.wardenPortalBreakX)?WX(e.wardenPortalBreakX):x+f*25;
  const lx=slam?x-sf*w*.22:remote?x+Math.sign(tx-x)*w*.65:coil?x-f*w*.55:rush?x+f*w*.7:ax;
  const ly=slam?y-10:remote?y+h*.25:coil?y+h*.43:foot-(broken?5:rest?7:h*.28);
  pixelLimb(ax,ay,lx,ly-4,2,GAOL.ironLit);B(lx-5,ly-5,10,12,GAOL.iron);B(lx-5,ly-5,10,2,GAOL.brass);B(lx-2,ly-2,4,6,coil||slam||remote?GAOL.light:GAOL.ward);
  if(coil||slam||remote)glow(lx,ly,19,'224,193,157',.2);
  if(coil){B(x-f*w*.3,foot-2,3,1,GAOL.edge);B(x-f*(w*.3+6),foot-1,4,1,GAOL.ironLit);}
  if(state==='sentenceWind'||state==='sentenceRebound'||state==='sentenceRush'){
    const count=state==='sentenceWind'?3:Math.max(1,e.wardenSentenceChain||1);
    for(let i=0;i<count;i++){const xx=x-f*(w*.3+5+i*5),yy=y+h*.55+i*2;B(xx-1,yy-2,3,5,GAOL.brass);B(xx,yy-1,1,3,GAOL.dark);}
  }
  if(remote&&Number.isFinite(e.wardenPortalBreakX)&&Number.isFinite(e.wardenPortalBreakY)){
    const mx=WX(e.wardenPortalBreakX),my=WY(e.wardenPortalBreakY),q=1-Math.max(0,Math.min(1,(e.wardenStateT||0)/.9));
    // Iron filings lift at the saved target, then close around that mouth.
    for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=23-q*9;B(mx+Math.cos(a)*rr,my-12+Math.sin(a)*rr*.55,2,2,GAOL.ward);}
  }
}
function drawGaolAOE(a){
  if(curG.stageIndex!==6||!['slam','sentence','warning'].includes(a.type))return false;
  // A harmless target marker remains subtle; the real delayed strike owns
  // the rising fragments and the full horizontal damage span.
  const x=WX(a.x),y=WY(a.y||0),r=W2(a.r),hit=!!a.hit,q=hit?Math.max(0,(a.life||0)/.3):1-Math.max(0,Math.min(1,(a.t||0)/(a.t0||.82))),warn=!(a.dmg>0);
  alphaWrap(hit?q:warn?.35:.8,()=>{
    for(let dx=-r;dx<=r;dx+=3){const dy=Math.sqrt(Math.max(0,r*r-dx*dx))*.16;B(x+dx,y-dy,2,1,warn?GAOL.ironLit:GAOL.edge);}
    if(!warn)for(let i=0;i<13;i++){const xx=x+(i/12-.5)*r*1.9,hh=hit?2+q*20:2+q*9;B(xx,y-hh-(i%3)*2,2,hh,hit?GAOL.light:GAOL.ward);B(xx-2,y,5,1,GAOL.ironLit);}
  });return true;
}

// Frostfell's heat lives in the town's ironwork. Backdrop masonry stays muted;
// pale edges belong to the surfaces, shutters and mouths that actually collide.
const FROST={dark:'#11212d',back:'#203542',stone:'#354c5b',edge:'#7994a4',iron:'#496674',ice:'#b8dfec',snow:'#e4edf0',copper:'#9e795a',warm:'#edb46d',light:'#ffe2a2',recall:'#b48caa'};
const frostOn=id=>!!(L.persistentCircuitOpen&&L.persistentCircuitOpen(id));
function frostPipe(x1,y1,x2,y2,on){
  pixelLimb(x1,y1,x2,y2,5,FROST.dark);pixelLimb(x1,y1,x2,y2,3,on?FROST.copper:FROST.iron);
  pixelLimb(x1-1,y1-1,x2-1,y2-1,1,on?FROST.warm:FROST.edge);
}
function frostFlame(x,y,size=1){
  for(let i=-2;i<=2;i++){const h=(5+Math.round((Math.sin(time*8+i*1.7)+1)*3))*size;B(x+i*3*size,y-h,2*size,h,i%2?FROST.warm:FROST.light);}
}
function drawFrostLandmarks(){
  if(curG.stageIndex!==7)return;
  for(const o of curG.obstacles){
    if(!o.frostArchitecture||o.gone)continue;
    const x=WX(o.x),y=WY(o.y||0),w=W2(o.w||260),h=W2(o.h||300),k=o.kind;
    if(x+w/2<-40||x-w/2>bw+40)continue;
    if(k==='frost-tower'){
      for(const s of [-1,1])B(x+s*w*.35,y-h,3,h,'#2b4250');
      for(let yy=y-h;yy<y;yy+=43){pixelLimb(x-w*.35,yy,x+w*.35,Math.min(y,yy+43),2,'#2a404e');pixelLimb(x+w*.35,yy,x-w*.35,Math.min(y,yy+43),2,'#2a404e');B(x-w*.37,yy,w*.74,2,'#3e5865');}
      B(x-w*.4,y-h,w*.8,2,'#627b87');continue;
    }
    if(k==='frost-aqueduct'){
      const open=!!(o.open||o.used||(L.frostAqueductOpen&&L.frostAqueductOpen()));
      B(x-w*.4,y-h,w*.8,h,FROST.dark);stepArc(x,y-h+w*.42,w*.44,FROST.stone,6);
      for(const s of [-1,1])B(x+s*w*.42-3,y-h+w*.42,6,h-w*.42,FROST.stone);
      if(!open){for(let xx=x-w*.3;xx<x+w*.32;xx+=8)B(xx,y-h+w*.5,2,h-w*.5,FROST.iron);B(x-w*.35,y-35,w*.7,3,FROST.edge);}
      else for(let i=0;i<5;i++)B(x+w*.34+i*2,y-h+w*.48,1,h-w*.48,FROST.iron);
      B(x-w*.48,y-h,w*.96,3,FROST.edge);continue;
    }
    if(!['frost-refuge','frost-workers','frost-works','frost-court','frost-washhouse','frost-street'].includes(k))continue;
    const works=k==='frost-works',street=k==='frost-street',warm=k==='frost-refuge'||(k==='frost-washhouse'&&frostOn('frost-brazier-washhouse'))||(k==='frost-workers'&&frostOn('frost-hearths'))||frostOn('frost-thermal');
    const roof=y-h*.72;
    B(x-w/2,roof,w,h*.72,FROST.back);
    for(let xx=x-w/2;xx<x+w/2;xx+=4){const q=(xx-(x-w/2))/w,top=y-h*(.88+.12*(1-Math.abs(q*2-1)));B(xx,top,4,roof-top+2,'#2b4352');B(xx,top,4,2,'#738c99');}
    for(let xx=x-w*.45;xx<x+w*.46;xx+=40){B(xx,roof+8,2,h*.72-8,'#2d4451');B(xx+2,roof+8,1,h*.72-8,'#405664');}
    const bays=Math.max(2,Math.round(w/(street?92:76)));
    for(let i=0;i<bays;i++){
      const xx=x-w*.43+(i+.5)*w*.86/bays,yy=roof+h*.14;
      const hearth=street?curG.obstacles.filter(q=>q.frostBrazier).find(q=>Math.abs(q.x-(camX+xx/Z))<330):null,lit=warm||!!hearth?.lit;
      B(xx-13,yy-3,26,35,FROST.dark);B(xx-10,yy,20,27,lit?'#7f6045':'#294352');B(xx-10,yy,20,2,lit?FROST.copper:FROST.iron);
      B(xx-1,yy,2,27,FROST.back);B(xx-10,yy+13,20,2,FROST.back);B(xx-14,yy-5,28,2,'#7c939c');
      if(lit)glow(xx,yy+16,24,'239,177,100',.1);
      if(works){
        const mustered=frostOn('frost-muster');B(xx-13,y-39,26,39,FROST.dark);
        if(!mustered){B(xx-4,y-31,8,8,'#354753');B(xx-6,y-21,12,15,'#2d3b4a');B(xx-4,y-7,3,7,'#3d4a56');B(xx+2,y-7,3,7,'#3d4a56');B(xx-2,y-29,4,1,'#60798c');pixelLimb(xx+8,y-6,xx+8,y-35,1,FROST.iron);}
        for(let j=-2;j<=2;j++)B(xx+j*5,y-38,1,mustered?5:38,FROST.iron);
        B(xx-14,y-40,28,2,mustered?FROST.recall:FROST.iron);
      }
    }
    if(!works){B(x-18,y-49,36,49,FROST.dark);B(x-20,y-51,40,3,FROST.stone);B(x+16,y-48,2,48,FROST.iron);B(x+8,y-23,2,3,warm?FROST.warm:FROST.edge);}
    if(warm)for(let i=0;i<5;i++){const q=(time*.18+i*.2)%1;alphaWrap((1-q)*.25,()=>B(x+w*.31+Math.sin(q*9)*5,y-h-4-q*36,4+q*6,3+q*3,FROST.snow));}
    B(x+w*.29,y-h-9,9,h*.25,FROST.stone);B(x+w*.29-2,y-h-10,13,3,FROST.edge);
  }
  // The real emitter and receiver share an insulated return pipe behind them.
  const source=curG.obstacles.find(o=>o.type==='runeEmitter'&&o.circuit==='frost-thermal'),receiver=curG.obstacles.find(o=>o.frostThermalReceiver);
  if(source&&receiver){
    const sx=WX(source.x),sy=WY(source.y),rx=WX(receiver.x),ry=WY(receiver.y),on=frostOn('frost-thermal'),bend=sx+78;
    frostPipe(sx-30,sy+17,bend,sy+17,on);frostPipe(bend,sy+17,bend,ry-33,on);frostPipe(bend,ry-33,rx+10,ry-33,on);frostPipe(rx+10,ry-33,rx+10,ry-10,on);
    for(let xx=bend+18;xx<rx;xx+=42){B(xx-2,ry-37,4,9,FROST.dark);B(xx-1,ry-36,2,8,FROST.edge);}
  }
  for(const o of curG.obstacles){
    if(o.type==='wind'&&o.thermalGallery){
      const x=WX(o.x-o.w/2),y=WY(o.y+o.h),w=W2(o.w),h=W2(o.h);
      B(x-4,y-4,w+8,3,FROST.stone);B(x-4,y+h+1,w+8,3,FROST.stone);
      for(const xx of [x-4,x+w+1]){B(xx,y-4,3,h+8,FROST.stone);for(let yy=y+5;yy<y+h;yy+=9)B(xx-1,yy,5,2,FROST.iron);}
    }
    if(o.type==='plat'&&o.frostFinaleLanding!==undefined){
      const x=WX(o.x),y=WY(o.y),w=W2(o.w);if(x+w/2<0||x-w/2>bw)continue;
      for(const s of [-1,1])pixelLimb(x+s*w*.38,y+5,x+s*w*.15,y+31,2,FROST.stone);
      B(x-2,y+27,4,20,FROST.back);
    }
  }
}
function drawFrostMuster(o,x,y){
  const seq=curG.frostMusterSequence,on=frostOn('frost-muster'),age=seq?.t||0,h=W2(o.h||460),reduced=!!curEnv.reducedMotion;
  B(x-90,y-16,180,16,FROST.dark);B(x-92,y-17,184,3,FROST.edge);
  for(const s of [-1,1]){B(x+s*75-4,y-h,8,h,FROST.stone);B(x+s*75-3,y-h,2,h,FROST.edge);pixelLimb(x+s*75,y-h,x,y-h-18,5,FROST.iron);chain(x+s*49,y-h+3,y-64,FROST.edge);}
  B(x-81,y-h-3,162,3,FROST.snow);B(x-75,y-h+8,150,4,FROST.iron);
  const sway=reduced?0:seq?Math.sin(age*5)*Math.min(11,age*4):on?Math.sin(time*1.7):0,cx=x+sway;
  pixelLimb(x,y-h+12,cx,y-135,3,FROST.edge);
  for(let row=0;row<58;row++){const half=15+Math.pow(row/57,2)*28;B(cx-half,y-123+row,half*2,1,on?'#897b87':'#657983');B(cx-half,y-123+row,2,1,on?'#b69caf':FROST.edge);}
  B(cx-44,y-68,88,7,FROST.dark);B(cx-46,y-70,92,3,FROST.snow);B(cx-1,y-61,3,14,FROST.edge);B(cx-5,y-50,11,4,on?FROST.recall:FROST.copper);
  wheel(x-36,y-35,20,reduced?0:(seq?age:on?time:0)*.9,FROST.iron);wheel(x+24,y-33,15,reduced?0:-(seq?age:on?time:0)*.9,FROST.edge);
  B(x-12,y-38,24,31,FROST.stone);B(x-10,y-36,20,26,on?'#704458':FROST.dark);
  pixelLimb(x-8,y-34,x+7,y-13,1,on?FROST.recall:FROST.ice);pixelLimb(x+7,y-33,x-6,y-17,1,on?FROST.recall:FROST.ice);
  pixelLimb(x-50,y-15,x-59+(seq?7:0),y-36,3,FROST.copper);B(x-64+(seq?7:0),y-39,11,4,FROST.warm);
  if(seq?.struck&&!reduced){const q=age-2.4,r=q*325;alphaWrap(Math.max(0,1-q/2.4)*.65,()=>{for(let a=0;a<6.28;a+=.018)B(x+Math.cos(a)*r,y-100+Math.sin(a)*r,2,2,FROST.recall);});}
}
function drawFrostProp(o,x,y){
  if(o.frostMusterEngine){drawFrostMuster(o,x,y);return true;}
  if(o.frostBrazier){
    const lit=!!o.lit;
    if(lit){glow(x,y-18,65,'239,177,100',.24);for(let i=-5;i<=5;i++)B(x+i*6,y-1,5,1,'#8e8774');}
    for(const s of [-1,1])pixelLimb(x+s*10,y,x+s*7,y-14,3,FROST.iron);
    B(x-16,y-20,32,8,FROST.dark);B(x-17,y-21,34,2,lit?FROST.copper:FROST.ice);B(x-12,y-15,24,1,FROST.edge);
    if(lit)frostFlame(x,y-22,1.2);else for(let i=-2;i<=2;i++){B(x+i*5,y-26-(i%2)*3,3,5+(i%2)*3,FROST.ice);B(x+i*5,y-27-(i%2)*3,1,2,FROST.snow);}
    return true;
  }
  if(o.frostMemory){
    const owned=!!(L.hasCapability&&L.hasCapability('double-jump')),on=frostOn('frost-thermal');
    B(x-24,y-12,48,12,FROST.stone);B(x-25,y-13,50,2,FROST.edge);
    for(let i=0;i<2;i++){const yy=y-26-i*18+(owned?0:Math.sin(time*2+i)*2),col=owned?FROST.edge:on?FROST.snow:FROST.iron;pixelLimb(x-9,yy+4,x,yy-5,2,col);pixelLimb(x,yy-5,x+9,yy+4,2,col);}
    if(on&&!owned)glow(x,y-35,27,'187,230,245',.23);return true;
  }
  if(o.frostReturn||o.frostReturnExit||o.frostMineDoor){
    const w=W2(o.w||100),h=W2(o.h||100),on=o.frostMineDoor||o.frostReturn||frostOn('frost-service');
    B(x-w*.4,y-h,w*.8,h,FROST.dark);stepArc(x,y-h+w*.45,w*.45,FROST.stone,4);
    for(const s of [-1,1])B(x+s*w*.43-2,y-h+w*.45,4,h-w*.45,FROST.edge);
    B(x-w*.46,y-h,w*.92,3,FROST.snow);
    if(!on){B(x-w*.32,y-h*.67,w*.64,3,FROST.iron);B(x-2,y-h*.7,4,9,FROST.copper);}
    else B(x+w*.25,y-h*.55,2,6,FROST.warm);
    return true;
  }
  if(o.frostSeam){
    const h=W2(o.h||230);B(x-29,y-h*.7,58,h*.7,o.used?FROST.dark:FROST.iron);
    pixelLimb(x+4,y-h,x-7,y-45,2,o.used?FROST.stone:FROST.ice);pixelLimb(x-7,y-45,x+14,y-15,2,o.used?FROST.stone:FROST.ice);
    if(!o.used){B(x-3,y-44,6,14,FROST.copper);glow(x,y-39,18,'230,183,110',.12);}return true;
  }
  if(o.kind==='frost-counter-relief'){
    B(x-31,y-57,62,57,FROST.stone);B(x-33,y-59,66,3,FROST.edge);
    for(const f of [-1,1]){const xx=x+f*14;B(xx-3,y-45,6,7,FROST.edge);B(xx-4,y-37,8,17,FROST.iron);pixelLimb(xx,y-21,xx-f*5,y-7,2,FROST.edge);pixelLimb(xx,y-21,xx+f*6,y-8,2,FROST.edge);pixelLimb(xx,y-31,x-f*4,y-35,2,FROST.edge);}
    B(x-5,y-39,3,13,FROST.copper);return true;
  }
  if(o.kind==='frost-ledger'||o.kind==='frost-slate-record'){plaque(x,y,24,19,!!o.lore&&!o.read,FROST.stone);return true;}
  return !!o.frostArchitecture;
}
function drawFrostReceiver(o){
  const x=WX(o.x),y=WY(o.y),on=o.timer>0||frostOn('frost-thermal'),col=on?FROST.warm:FROST.ice;
  B(x-16,y-18,32,36,FROST.stone);B(x-18,y-20,36,3,FROST.edge);B(x-14,y-15,28,29,FROST.dark);
  for(const s of [-1,1]){B(x+s*10-1,y-11,2,22,col);B(x-9,y+s*12,18,2,col);}
  for(let i=-2;i<=2;i++)B(x-8,y+i*4,16,1,on?FROST.copper:FROST.iron);
  if(on){frostFlame(x,y+8,.65);glow(x,y,27,'239,177,100',.27);}else{B(x-3,y-6,6,10,FROST.copper);B(x-1,y-9,2,5,FROST.warm);}
  if(o.flash>0)B(x-13,y-15,26,2,FROST.snow);
}
function drawFrostEmitter(o){
  const x=WX(o.x),y=WY(o.y),on=frostOn('frost-thermal'),charge=on?0:1-Math.max(0,Math.min(1,(o.cool||0)/(o.period||1.8))),f=o.dir==='left'?-1:1;
  B(x-17,y-19,34,38,FROST.stone);B(x-15,y-17,30,2,FROST.edge);B(x-13,y-13,26,26,FROST.dark);B(x+f*14-4,y-7,9,14,FROST.iron);B(x+f*18-1,y-5,2,10,FROST.copper);
  B(x-7,y+8-16*charge,14,16*charge,on?FROST.iron:FROST.copper);B(x-5,y+8-13*charge,10,13*charge,FROST.warm);
  for(let i=-1;i<=1;i++)B(x+i*5,y-11,1,23,FROST.iron);
  if(!on)glow(x,y,21,'239,150,71',.1+charge*.2);if(o.flash>0)B(x+f*22-3,y-4,6,8,FROST.light);
}
function drawFrostFlow(o,projected=false){
  const visual=L.fieldVisual&&L.fieldVisual(o),hot=visual?.id==='firestream',col=visual?.color||FROST.ice,accent=visual?.accent||FROST.snow;
  const nx=projected?(o.nx||0):Math.sign(o.forceX||1),ny=projected?(o.ny||0):0,len=projected?(o.length||380):o.w,w=projected?(o.w||110):o.h;
  const ox=projected?o.x:o.x-o.w/2,oy=projected?o.y:o.y+o.h/2;
  if(!len||!w)return;
  alphaWrap(hot?.72:.35,()=>{for(let i=0;i<22;i++){
    const q=(time*(hot?.66:.32)+hash(i,o.x))%1,side=(hash(i,o.y)-.5)*w*.85,wx=ox+nx*q*len-ny*side,wy=oy+ny*q*len+nx*side,x=WX(wx),y=WY(wy);
    pixelLimb(x-nx*(hot?10:5),y+ny*(hot?10:5),x,y,hot?2:1,i%3?col:accent);
    if(hot)B(x-nx*3,y+ny*3-2,2,2,accent);
  }});
}
function drawFrostProjectile(o){
  if(!o.puzzleOnly)return false;
  const x=WX(o.x),y=WY(o.y),d=Math.hypot(o.vx||0,o.vy||0)||1,nx=(o.vx||0)/d,ny=(o.vy||0)/d,col=o.el==='fire'?FROST.warm:FROST.ice;
  pixelLimb(x-nx*10,y+ny*10,x,y,2,col);B(x-2,y-2,4,4,FROST.light);glow(x,y,13,'239,177,100',.18);return true;
}

// The White Court is built around water, glass and suspended condensers. Its
// machinery sits behind the traversable silver edges; combat cues read state.
const COURT={dark:'#10222e',back:'#203947',stone:'#425e6b',edge:'#8da8b3',silver:'#c6d6d9',slate:'#bac6c9',glass:'#66a7bf',cold:'#9de5f4',light:'#e1fbff',brass:'#c3ad7a',warm:'#e4b87b',cloth:'#376482',violet:'#bfafd9'};
function courtArc(x,y,rx,ry,start,end,col,width=1){
  for(let a=start;a<=end;a+=.035)B(x+Math.cos(a)*rx,y+Math.sin(a)*ry,width,width,col);
}
function drawCourtLandmarks(){
  if(curG.stageIndex!==8)return;
  for(const o of curG.obstacles){
    if(!o.courtArchitecture||o.gone)continue;
    const x=WX(o.x),y=WY(o.y||0),w=W2(o.w||180),h=W2(o.h||220),k=o.kind;
    if(x+w/2<-40||x-w/2>bw+40)continue;
    if(k==='court-channel'){
      const on=frostOn('court-wheel');B(x-w/2,y-13,w,13,COURT.dark);B(x-w/2,y-15,w,2,COURT.stone);
      for(let xx=0;xx<w;xx+=27){B(x-w/2+xx,y-10,16,2,on?COURT.glass:COURT.stone);if(on)B(x-w/2+(xx+(curEnv.reducedMotion?0:time*12))%w,y-5,8,1,COURT.edge);}
      for(let xx=4;xx<w-4;xx+=54){B(x-w/2+xx,y-16,5,16,COURT.stone);B(x-w/2+xx,y-16,5,1,COURT.edge);}continue;
    }
    if(!['court-refuge','court-glassworks','court-gallery','court-tribunal'].includes(k))continue;
    const tribunal=k==='court-tribunal',glass=k==='court-glassworks',refuge=k==='court-refuge',warm=refuge&&frostOn('court-wheel'),bays=Math.max(3,Math.round(w/78));
    B(x-w/2,y-h,w,h,COURT.back);B(x-w/2,y-h,w,5,'#597680');B(x-w/2,y-h+5,w,2,COURT.stone);
    for(let i=0;i<bays;i++){
      const xx=x-w*.46+(i+.5)*w*.92/bays,r=Math.min(27,w/bays*.32),top=y-h*.62;
      B(xx-r,top,2*r,h*.62,COURT.dark);stepArc(xx,top,r,COURT.stone,4);
      for(const s of [-1,1]){B(xx+s*(r+4)-2,top,4,h*.62,'#3a5664');B(xx+s*(r+4)-2,top,1,h*.62,'#607d87');B(xx+s*(r+4)-4,y-7,8,7,COURT.stone);}
      if(glass){
        B(xx-r+4,top+4,r*2-8,h*.36,'#294b5b');B(xx-r+5,top+5,2,h*.33,'#477586');pixelLimb(xx-r+6,top+7,xx+r-6,top+h*.3,1,'#527f8c');
        for(let yy=top+12;yy<top+h*.32;yy+=17)B(xx-r+3,yy,r*2-6,2,COURT.back);
        B(xx-r+4,y-23,r*2-8,5,'#53646a');for(let j=-1;j<=1;j++){B(xx+j*9-3,y-29,6,6,COURT.edge);B(xx+j*9-2,y-28,4,4,COURT.dark);}
      }else if(refuge){B(xx-9,top+8,18,27,warm?'#836a4d':'#304b5a');B(xx,top+8,1,27,COURT.back);B(xx-9,top+21,18,1,COURT.back);if(warm)glow(xx,top+21,19,'228,184,123',.08);}
      else{B(xx-9,y-17,18,3,COURT.stone);B(xx-7,y-14,3,14,COURT.stone);B(xx+4,y-14,3,14,COURT.stone);}
      if(tribunal){chain(xx,y-h+9,top-10,'#56707d');B(xx-3,top-12,6,10,COURT.glass);B(xx-1,top-10,2,6,COURT.edge);}
    }
    for(const s of [-1,1]){B(x+s*w*.49-5,y-h-6,10,h+6,COURT.stone);B(x+s*w*.49-5,y-h-6,2,h+6,COURT.edge);B(x+s*w*.49-8,y-h-7,16,3,COURT.silver);}
  }
  for(const o of curG.obstacles){
    if(o.gone)continue;
    const x=WX(o.x),y=WY(o.y||0);
    if(o.type==='runeEmitter'&&(o.courtCold||o.courtThaw)){
      const ry=WY(Math.max(o.y+80,430));B(x-4,ry,8,y-ry,COURT.stone);B(x-3,ry,1,y-ry,COURT.edge);B(x-15,ry-3,30,5,COURT.stone);
      for(let yy=ry+12;yy<y-10;yy+=17)B(x-5,yy,10,3,COURT.edge);
    }
    if(o.courtCondenser||o.courtBossReceiver){
      const boss=o.boss,broken=!!boss?.courtFinal?.ruptured,anchorY=WY(o.courtBossReceiver?455:Math.max((o.y0??o.y)+(o.amplitude||0)+100,440));
      const minX=o.courtBossReceiver?WX(13780):o.courtGalleryReceiver?x-35:x-22,maxX=o.courtBossReceiver?WX(14140):o.courtGalleryReceiver?x+35:x+22;
      B(minX-8,anchorY-4,maxX-minX+16,6,COURT.stone);B(minX-8,anchorY-4,maxX-minX+16,1,COURT.edge);
      if(!broken){chain(x-4,anchorY,y-W2(o.h||110)/2-5,COURT.edge);chain(x+4,anchorY,y-W2(o.h||110)/2-5,COURT.stone);wheel(x,anchorY,5,curEnv.reducedMotion?0:x*.02,COURT.brass);}
      else{chain(x-4,anchorY,anchorY+20,COURT.edge);pixelLimb(x-4,anchorY+20,x+5,anchorY+31,2,COURT.edge);}
    }
    if(o.type==='plat'&&!o.deep&&o.y>30&&!o.gate){
      const w=W2(o.w);if(x+w/2<0||x-w/2>bw)continue;
      for(const s of [-1,1])pixelLimb(x+s*w*.36,y+5,x+s*w*.2,y+25,2,COURT.stone);
    }
  }
}
function drawCourtProp(o,x,y){
  if(!o.courtArchitecture)return false;
  const w=W2(o.w||180),h=W2(o.h||220),k=o.kind;
  if(k==='court-wheel'){
    const on=frostOn('court-wheel');B(x-31,y-12,62,12,COURT.stone);B(x-32,y-13,64,2,COURT.edge);
    B(x-4,y-47,8,36,COURT.stone);wheel(x,y-43,32,on&&!curEnv.reducedMotion?time*.35:0,COURT.edge);B(x-4,y-47,8,8,COURT.brass);
    pixelLimb(x-26,y-5,x-29+(on?10:0),y-27,3,COURT.brass);B(x-33+(on?10:0),y-30,8,4,COURT.warm);
    B(x+23,y-12,12,9,COURT.dark);if(on)B(x+24,y-11,10,2,COURT.brass);return true;
  }
  if(k==='court-lockbox'){
    const on=o.opened||frostOn(o.circuitId||'court-high-cache');B(x-15,y-13,30,12,COURT.stone);B(x-15,y-13,30,1,COURT.edge);
    for(const xx of [-11,9])B(x+xx,y-13,3,12,COURT.brass);
    if(on){pixelLimb(x-15,y-17,x+12,y-26,3,COURT.edge);B(x-12,y-13,24,4,COURT.dark);}else{B(x-14,y-18,28,5,COURT.edge);B(x-10,y-20,20,2,COURT.silver);B(x-2,y-15,4,5,COURT.brass);}return true;
  }
  if(k==='court-bench'||k==='court-overlook'){
    const top=k==='court-overlook'?22:16;B(x-w/2,y-top,w,4,COURT.edge);B(x-w/2+5,y-top+4,4,top-4,COURT.stone);B(x+w/2-9,y-top+4,4,top-4,COURT.stone);
    if(k==='court-overlook'){B(x-9,y-17,18,13,COURT.silver);B(x-6,y-14,12,1,COURT.stone);B(x-6,y-10,8,1,COURT.stone);}return true;
  }
  if(['court-aqueduct','court-shaft','court-doors','court-ember-door'].includes(k)){
    const ember=k==='court-ember-door',shaft=k==='court-shaft',barred=k==='court-aqueduct'&&!(L.frostAqueductOpen&&L.frostAqueductOpen()),r=w*.4;
    B(x-r,y-h+6,r*2,h-6,ember?'#291e26':COURT.dark);stepArc(x,y-h+r+4,r+4,COURT.stone,5);
    for(const s of [-1,1]){B(x+s*(r+2)-3,y-h+r,6,h-r,COURT.stone);B(x+s*(r+2)-3,y-h+r,1,h-r,COURT.edge);}
    B(x-r-6,y-h,r*2+12,3,COURT.silver);
    if(barred){for(let xx=-r+6;xx<r;xx+=8)B(x+xx,y-h+r,2,h-r,COURT.edge);B(x-r,y-29,r*2,3,COURT.brass);}
    else if(shaft){for(let yy=y-8;yy>y-h+16;yy-=11){B(x-11,yy,22,2,COURT.stone);B(x-11,yy,1,2,COURT.edge);}}
    else if(ember){B(x-r+5,y-2,r*2-10,2,COURT.warm);glow(x,y-23,29,'232,156,86',.14);}
    else B(x+r-5,y-h*.42,2,7,COURT.brass);
    return true;
  }
  return true;
}
function drawCourtSurface(o,bx,by,w,h){
  if(o.gate&&!(L.gateOpen?L.gateOpen(o):L.circuitOpen&&L.circuitOpen(o.gate))){
    // A missing ice bridge shows only its two sockets; the gap stays visible.
    for(const xx of [bx,bx+w-5]){B(xx,by+3,5,4,COURT.stone);B(xx,by+3,5,1,COURT.glass);}return;
  }
  if(o.slope){
    for(let i=0;i<w;i++){const q=i/Math.max(1,w-1),s=q*q*(3-2*q),yy=WY(o.slopeY0+(o.slopeY1-o.slopeY0)*s);B(bx+i,yy,1,Math.max(1,bh-yy),COURT.dark);B(bx+i,yy,1,2,COURT.silver);}return;
  }
  const depth=o.deep?Math.max(0,bh-by):h;if(!depth)return;
  B(bx,by,w,depth,COURT.stone);B(bx,by+4,w,Math.max(1,depth-4),COURT.dark);
  B(bx,by,w,2,o.ice?COURT.cold:o.slate?COURT.slate:COURT.silver);B(bx,by+2,w,2,o.ice?COURT.glass:COURT.stone);
  for(let xx=6;xx<w-5;xx+=17){B(bx+xx,by+5,8,1,COURT.stone);if(o.slate){B(bx+xx,by,5,1,COURT.dark);B(bx+xx+2,by+1,1,2,COURT.edge);}if(o.ice)pixelLimb(bx+xx,by,bx+xx+6,by+7,1,COURT.light);}
  if(o.courtFrostWarn)for(let xx=5;xx<w-4;xx+=11){B(bx+xx,by-1,2,2,COURT.cold);B(bx+xx+3,by+3,3,1,COURT.cold);}
}
function drawCourtEmitter(o){
  const x=WX(o.x),y=WY(o.y),[nx,ny]=({right:[1,0],left:[-1,0],up:[0,1],down:[0,-1]})[o.dir]||[0,-1],q=o.circuit&&frostOn(o.circuit)?0:1-Math.max(0,Math.min(1,(o.cool||0)/(o.period||3.2)));
  B(x-13,y-13,26,26,COURT.stone);B(x-12,y-13,24,2,COURT.silver);B(x-9,y-9,18,18,COURT.dark);
  B(x-5,y+6-12*q,10,12*q,COURT.glass);B(x-3,y+5-10*q,6,10*q,COURT.cold);
  pixelLimb(x+nx*8,y-ny*8,x+nx*17,y-ny*17,7,COURT.edge);pixelLimb(x+nx*12,y-ny*12,x+nx*17,y-ny*17,3,COURT.dark);
  if(o.flash>0){B(x+nx*19-2,y-ny*19-2,4,4,COURT.light);glow(x,y,20,'157,229,244',.25);}
}
function drawCourtReceiver(o){
  const x=WX(o.x),y=WY(o.y),rx=W2(o.w||92)/2,ry=W2(o.h||116)/2,e=o.boss,f=e?.courtFinal;
  const broken=!!f?.ruptured||!!o.courtSpent,done=o.courtCondenser&&frostOn(o.circuitId),ready=!broken&&!done&&(!o.courtBossReceiver||e&&!e.dead&&!(e.spellStunT>0)&&(!f||['cast','return'].includes(f.beat)));
  const col=o.flash>0?COURT.light:ready?COURT.cold:done?COURT.silver:COURT.stone;
  for(const s of [-1,1]){pixelLimb(x,y-ry,x+s*rx,y,2,col);if(!broken)pixelLimb(x+s*rx,y,x,y+ry,2,col);else pixelLimb(x+s*rx,y,x+s*(rx+5),y+11,2,COURT.edge);}
  B(x-5,y-ry-4,10,5,COURT.brass);B(x-3,y-ry-3,6,2,COURT.dark);
  if(broken){B(x-9,y+ry+5,7,3,COURT.glass);B(x+4,y+ry+9,6,2,COURT.silver);return;}
  for(let yy=-13;yy<=13;yy++){const half=Math.max(1,Math.round((1-Math.abs(yy)/14)*9));B(x-half,y+yy,half*2,1,done?COURT.silver:ready?COURT.glass:COURT.back);}
  B(x-3,y-7,2,9,col);B(x-2,y-ry-12,4,4,done||o.charge>0?COURT.light:COURT.dark);
  if(ready)glow(x,y,25,'157,229,244',.17);
}
function drawCourtPaddle(o){
  const x=WX(o.x),y=WY(o.y||0),down=o.flash>0;
  B(x-14,y-5,28,5,COURT.stone);B(x-10,y-6,20,1,COURT.edge);B(x-2,y-25,4,20,COURT.stone);
  pixelLimb(x,y-17,x+(down?10:-7),y-(down?23:37),3,COURT.brass);B(x+(down?5:-12),y-(down?28:42),10,10,COURT.edge);B(x+(down?8:-9),y-(down?26:40),4,6,down?COURT.light:COURT.glass);
}
function drawCourtPortal(o,index,fixed=false){
  if(o.gone)return;
  const wall=!!o.nx,x=WX(o.x),y=WY(o.y)-(wall?8:12),rx=wall?8:13,ry=wall?14:8,open=!fixed||!L.lportalOpen||L.lportalOpen(o),col=index===0?COURT.cold:COURT.warm;
  if(fixed){B(x-rx-4,y-ry-4,rx*2+8,ry*2+8,COURT.stone);B(x-rx-4,y-ry-4,rx*2+8,2,COURT.edge);}
  for(let dy=-ry;dy<=ry;dy++){const dx=Math.round(rx*Math.sqrt(Math.max(0,1-dy*dy/(ry*ry))));B(x-dx,y+dy,dx*2+1,1,COURT.dark);B(x-dx,y+dy,1,1,open?col:COURT.stone);B(x+dx,y+dy,1,1,open?col:COURT.stone);}
  if(open){courtArc(x,y,rx-2,ry-2,0,Math.PI*2,col);for(let i=0;i<3;i++){const a=(curEnv.reducedMotion?0:time*1.8)+i*2.094;B(x+Math.cos(a)*(rx-2),y+Math.sin(a)*(ry-2),1,1,COURT.light);}pixelLimb(x,y,x+(o.nx||0)*4,y-(o.ny||0)*4,1,col);}
}
function drawCourtSorcerer(e){
  const f=e.face||-1,final=e.courtFinal,exposed=e.spellStunT>0||e.exposeT>0,ruptured=!!final?.ruptured,wind=e.courtCastWind>0,follow=e.courtSecondT>0,blink=e.courtBlinkWind>0,rush=ruptured&&final.attack==='rush',recover=exposed||ruptured&&final.attack==='recover';
  const w=W2(e.w||58),h=W2(e.h||84),x=WX(e.x)+(wind?-f*2:rush?f*4:0),foot=WY(e.y),top=foot-h+(recover?6:wind?3:0),fl=e.hitFlash>0,body=fl?COURT.light:COURT.cloth,edge=fl?COURT.light:COURT.cold;
  alphaWrap(blink?.55:1,()=>{
    B(x-w*.4,foot-1,w*.8,2,COURT.dark);
    for(let row=0;row<h*.53;row++){const half=w*(.17+row/h*.37);B(x-half-f*(rush?row*.1:0),top+h*.45+row,half*2,1,row%7===0?COURT.dark:body);}
    B(x-w*.24,top+h*.24,w*.48,h*.3,body);B(x-w*.3,top+h*.24,w*.6,2,edge);B(x-2,top+h*.27,3,h*.63,COURT.silver);
    B(x-w*.2,top,w*.4,h*.27,COURT.dark);B(x-w*.23,top-2,w*.46,3,COURT.silver);B(x+f*3-2,top+h*.14,4,2,edge);
    for(const s of [-1,1])pixelLimb(x+s*w*.18,top-1,x+s*w*.24,top-7,2,COURT.edge);
    const handX=x+f*(wind?6:rush?21:recover?10:14),handY=top+h*(wind?.28:recover?.65:.42);
    pixelLimb(x+f*w*.2,top+h*.35,handX,handY,4,body);B(handX-2,handY-1,4,3,COURT.silver);
    const sx=x-f*w*.38,sy=top+(recover?12:4);pixelLimb(sx,foot-2,sx+(wind?-f*5:0),sy,2,COURT.brass);B(sx+(wind?-f*5:0)-3,sy-5,7,7,ruptured?COURT.violet:edge);
    if(wind||follow){const col=follow?COURT.violet:COURT.light;if(follow){pixelLimb(handX-5,handY-5,handX+3,handY,2,col);pixelLimb(handX+3,handY,handX-5,handY+5,2,col);}else courtArc(handX,handY,7,7,0,6.28,col);glow(handX,handY,23,'157,229,244',.22);}
  });
  if(!exposed&&!ruptured&&(!e.whiteCourtFight||e.courtBreaks<3||final)){
    const n=final?1:Math.max(0,3-(e.courtBreaks||0));for(let i=0;i<n;i++)courtArc(x,foot-h*.5,w*.78,h*.72,i*2.094,i*2.094+(final?5.8:1.7),COURT.cold,1);
  }
  if(exposed)for(let i=0;i<6;i++){const a=i*1.047,xx=x+Math.cos(a)*w*.83,yy=foot-h*.45+Math.sin(a)*h*.73;pixelLimb(xx,yy,xx+Math.cos(a)*5,yy+Math.sin(a)*6,2,COURT.silver);}
  if(rush)for(let i=0;i<4;i++)pixelLimb(x-f*(18+i*7),foot-8-i*5,x-f*(29+i*7),foot-8-i*5,1,COURT.violet);
}
function drawCourtCombat(){
  if(curG.stageIndex!==8)return;
  const e=curG.boss;if(!e||e.dead||!e.whiteCourtFight)return;
  if(e.courtBlinkWind>0&&Number.isFinite(e.courtBlinkX)){
    const x=WX(e.courtBlinkX),y=WY(0),q=Math.max(0,Math.min(1,1-e.courtBlinkWind/.8));
    alphaWrap(.3+q*.35,()=>{for(const s of [-1,1]){pixelLimb(x+s*14,y-3,x+s*11,y-39,1,COURT.cold);B(x+s*5-2,y-2,4,2,COURT.silver);}B(x-5,y-39,10,2,COURT.cold);});
  }
  if((e.courtCastWind>0||e.courtSecondT>0)&&!e.courtFinal?.ruptured){
    const follow=e.courtSecondT>0,tx=follow?e.courtSecondX:e.courtAimX,ty=follow?e.courtSecondY:e.courtAimY;
    if(Number.isFinite(tx)&&Number.isFinite(ty)){
      const x=WX(e.x+(e.face||1)*10),y=WY(e.y+e.h*.62),endX=WX(tx),endY=WY(ty),n=Math.max(1,Math.ceil(Math.hypot(endX-x,endY-y)/12));
      alphaWrap(.42,()=>{for(let i=0;i<=n;i++){const q=i/n;B(x+(endX-x)*q,y+(endY-y)*q,follow?1:2,1,follow?COURT.violet:COURT.cold);}});
    }
  }
  const f=e.courtFinal;if(!f)return;
  for(const station of [13780,14140]){
    const x=WX(station),y=WY(440)+(curEnv.reducedMotion?0:(f.beat==='barrage'||f.ruptured)?Math.sin(time*(f.ruptured?6:3))*12:0),active=station===f.station;
    B(x-10,y-3,20,60,COURT.dark);B(x-8,y,16,55,active?COURT.glass:COURT.stone);for(let i=0;i<5;i++)pixelLimb(x-7,y+i*11,x+7,y+i*11+6,1,active?COURT.cold:COURT.edge);
  }
  if(f.ruptured&&f.attack==='windup'){
    const x=WX(e.x),y=WY(e.y)-2,end=WX(Math.max(e.spellArenaL,Math.min(e.spellArenaR,e.x+(e.face||1)*253))),n=Math.ceil(Math.abs(end-x)/10);
    for(let i=1;i<=n;i++){const xx=x+(end-x)*i/n;pixelLimb(xx-2,y+1,xx+2,y-3,1,COURT.warm);}
  }
  for(const h of f.hazards||[]){
    const x=WX(h.x),y=WY(h.y),r=W2(h.r),warn=h.warn>0;
    if(warn){
      const vertical=!!h.vy,min=vertical?WY(650):WX(e.spellArenaL),max=vertical?WY(-35):WX(e.spellArenaR),q=1-Math.max(0,Math.min(1,h.warn/.85));
      alphaWrap(.26+q*.3,()=>{for(let p=min;p<max;p+=12){B(vertical?x-r:p,vertical?p:y-r,vertical?1:5,1,COURT.glass);B(vertical?x+r:p,vertical?p:y+r,vertical?1:5,1,COURT.glass);}});
      const edgeX=vertical?x:WX(h.vx>0?e.spellArenaL:e.spellArenaR),edgeY=vertical?WY(h.vy>0?-35:650):y;
      for(let i=-2;i<=2;i++)B(edgeX+i*3-1,edgeY-Math.abs(i)*2,2,5,COURT.cold);
    }else{
      for(let row=-r;row<=r;row++){const half=Math.max(1,Math.round((1-Math.abs(row)/Math.max(1,r))*8));B(x-half,y+row,half*2,1,COURT.glass);B(x-half,y+row,1,1,COURT.light);}
      pixelLimb(x,y-r,x,y+r,1,COURT.light);
    }
  }
}
function drawCourtAOE(a){
  if(curG.stageIndex!==8||!a.courtAttack)return false;
  if(!a.real&&!a.dmg)return true; // Cast and blink each have their own state cue.
  const x=WX(a.x),y=WY(a.y||0),r=W2(a.r),q=a.hit?Math.max(0,(a.life||0)/.3):Math.max(0,Math.min(1,1-a.t/(a.t0||1.3)));
  alphaWrap(a.hit?q:.8,()=>{
    courtArc(x,y,r,r*.4,0,6.28,COURT.cold);
    for(let i=-4;i<=4;i++){const xx=x+i*r*.2,hh=a.hit?6+q*20:2+q*8;pixelLimb(xx-2,y-1,xx,y-hh,2,COURT.cold);B(xx,y-hh,1,2,COURT.light);}
  });return true;
}
/* The Foundry's warnings are all bed-height and all mean "this mould is about to
   stop being floor". Drawn as a ground track plus rising pips: no colour-only cue,
   no motion-only cue, no numbers. */
/* The strike's impact reads along the surface it broke: a ring running out both
   ways at the height it landed. It replaces a smooth vector ellipse that was the one
   piece of non-pixel art left in the middle of the frame. */
function drawSlamRing(a){
  if(!a.slamRing) return false;
  const q = Math.max(0, Math.min(1, (a.life || 0) / .3));
  const x = WX(a.x), y = WY(a.y || 0), r = Math.round(W2(a.r) * (1 - q * .55));
  alphaWrap(q, () => {
    for(const sgn of [-1, 1]){ const ex = x + sgn * r;
      B(Math.min(x, ex), y - 2, Math.max(1, Math.abs(ex - x)), 2, '#e8e2f2');
      B(ex - 2, y - 6, 4, 7, '#ffffff'); }
    B(x - 3, y - 4, 6, 4, '#ffffff');
  });
  return true;
}
function drawFoundryAOE(a){
  if(curG.stageIndex !== 10) return false;
  if(a.type !== 'pour' && a.type !== 'pour-front' && !(a.type === 'slam' && a.y)) return false;
  const x = WX(a.x), y = WY(a.y || 0), r = W2(a.r), col = a.color || '#ff8a3a';
  const q = a.hit ? Math.max(0, (a.life || 0) / .3) : Math.max(0, Math.min(1, 1 - a.t / (a.t0 || .35)));
  alphaWrap(a.hit ? q : .85, () => {
    B(x - r, y - 1, r * 2, 2, col);                                     // the ground track
    B(x - r, y - 4, 2, 6, col); B(x + r - 2, y - 4, 2, 6, col);         // and its ends
    const pips = a.type === 'pour-front' ? 5 : 7;
    for(let i = 0; i < pips; i++){
      const px = x - r + (i + .5) * (r * 2 / pips), hh = a.hit ? 6 + q * 22 : 3 + q * 12;
      pixelLimb(px, y - 1, px, y - hh, 2, col); B(px, y - hh, 2, 2, '#ffe6a8');
    }
  });
  return true;
}
function drawCourtProjectile(o){
  if(!(o.courtCold||o.el==='ice'||o.sourceType==='sorcerer'||o.stolenSpell))return false;
  const x=WX(o.x),y=WY(o.y),r=Math.max(3,W2(o.size||9)),col=o.stolenSpell?COURT.light:o.courtCast==='followup'?COURT.violet:COURT.cold;
  const d=Math.hypot(o.vx||0,o.vy||0)||1,nx=(o.vx||0)/d,ny=(o.vy||0)/d;
  pixelLimb(x-nx*12,y+ny*12,x,y,2,COURT.glass);
  if(o.courtCast==='followup'){pixelLimb(x-nx*5-ny*4,y+ny*5-nx*4,x+nx*3,y-ny*3,2,col);pixelLimb(x+nx*3,y-ny*3,x-nx*5+ny*4,y+ny*5+nx*4,2,col);}
  else{courtArc(x,y,r,r,0,6.28,col);B(x-2,y-2,4,4,col);}
  if(o.stolenSpell){B(x-r-2,y-2,1,4,COURT.warm);B(x+r+2,y-2,1,4,COURT.warm);}return true;
}

/* A slab you can read: pouring lava, a cooling skin with the crust still bright,
   or cold stone with a set seam. The player should never need the state name. */
/* A blown mould keeps its rim and a notch per refusal, so the fight's progress is
   countable in greyscale from anywhere in the pit, with the sound off. */
function heatCrater(o,bx,by,w,depth){
  // Six bays have to read as six from across the pit, so every mould draws its
  // own mould walls whatever state it is in.
  if(o.castingBed){
    B(bx, by - 3, 2, depth + 3, '#180d09'); B(bx + w - 2, by - 3, 2, depth + 3, '#180d09');
    B(bx, by - 3, 2, 2, '#6b4632'); B(bx + w - 2, by - 3, 2, 2, '#6b4632');
  }
  if(!o.blownOut) return;
  // A refusal leaves a rim and a notch, permanently. This is the health bar.
  B(bx + 2, by - 3, w - 4, 1, '#4a3228');
  B(bx, by - 4, 3, 5, '#bfeaff'); B(bx + w - 3, by - 4, 3, 5, '#bfeaff');
  for(let i = 0; i < Math.min(6, o.blownOut); i++) B(bx + 6 + i * 6, by - 7, 4, 3, '#bfeaff');
}
function bankedCollar(o,bx,by,w){
  const fb = curG && curG.boss, boss = fb && fb.colossusForge && !fb.dead;
  // ONE TELL, TWO MACHINES. A region ladle aims at a mould exactly the way the
  // Colossus banks at a bay, so it wears the identical collar and chevrons. By the
  // time the fight uses this shape the player has read it a dozen times.
  const aimed = (boss && fb.forgeTargetBed === o) || !!o.ladleAimed;
  const hammered = boss && fb.forgeHammerBed === o;
  if(!aimed && !hammered) return;
  // A SHADOW for the hammer, a COLLAR for the pour. Two different shapes, because
  // they are two different threats and colour alone would not separate them.
  if(hammered){
    const q = Math.max(0, Math.min(1, fb.forgeArmY || 0));
    alphaWrap(.30 + .34 * q, () => B(bx, by - 2, w, 5, '#07040a'));
    B(bx, by - 3, w, 1, '#ffcf72'); B(bx, by - 3, 3, 3, '#ffcf72'); B(bx + w - 3, by - 3, 3, 3, '#ffcf72');
    return;
  }
  B(bx, by - 4, 5, 6, '#ffb454'); B(bx + w - 5, by - 4, 5, 6, '#ffb454');   // the collar's ends
  B(bx, by - 2, w, 3, '#ffb454');
  const t = (time * 3) % 1;
  for(let i = 0; i < 3; i++){ const q = (t + i / 3) % 1, tx = bx + 7 + i * ((w - 16) / 3);
    B(tx, by - 5 - Math.round(q * 8), 4, 4, q > .6 ? '#ffe6a8' : '#ffb454'); }
  // AND A MARK IN OPEN AIR. The collar alone sits on a bed full of other bright
  // edges; two chevrons in the empty space above the bay are the thing you catch
  // from across the pit without looking for it.
  const cx = bx + w / 2, drop = Math.round(((time * 2) % 1) * 4);
  for(let k = 0; k < 2; k++){ const cy = by - 30 + k * 9 + drop;
    for(let i = 0; i < 5; i++) B(cx - 8 + i * 4, cy + Math.abs(i - 2) * 2, 4, 3, k ? '#ffb454' : '#ffe6a8'); }
}
function drawHeatStone(o,bx,by,w,h){
  const state = o.heatState == null ? 2 : o.heatState;
  const depth = Math.max(h, 6);
  // The quench wave: the moment a slab becomes yours, read along the slab itself.
  if(o.heatSetT > 0){
    const q = 1 - Math.min(1, o.heatSetT / .55), edge = Math.round(q * w);
    alphaWrap(.85 * (1 - q), () => { B(bx, by - 2, w, 2, '#dff8ff');
      B(bx + Math.max(0, edge - 3), by - 4, 4, 6, '#ffffff'); B(bx + w - edge - 1, by - 4, 4, 6, '#ffffff'); });
  }
  if(o.belt && state !== 0) castingTread(bx, by, w, depth, Math.sign(o.belt) || 1, true);
  if(state === 0){                                            // MOLTEN — a hole that glows
    for(let x = 0; x < w; x++){
      const roll = Math.sin((x + time * 26) * .22) * 1.5;
      B(bx + x, by + roll, 1, depth, x % 7 < 4 ? '#e0561f' : '#ff8a3a');
      B(bx + x, by + roll, 1, 2, '#ffd98a');
    }
    glow(bx + w / 2, by + 2, Math.min(70, w * .7), '255,140,60', .34);
    heatCrater(o, bx, by, w, depth); bankedCollar(o, bx, by, w);
    return;
  }
  if(state === 1){                                            // SETTING — slick, crust still lit
    B(bx, by, w, depth, '#3b2a24'); B(bx, by + 2, w, depth - 2, '#241713');
    B(bx, by, w, 2, '#cdd8dc');                               // glassy skin: this is the slippery tell
    for(let x = 2; x < w - 1; x += 6) B(bx + x, by + 2, 3, 1, '#ff8a3a');
    for(let x = 4; x < w - 2; x += 11) B(bx + x, by, 2, 1, '#ffffff');
    glow(bx + w / 2, by + 3, Math.min(48, w * .5), '255,150,80', .14);
    bankedCollar(o, bx, by, w);
    // Held open by a coolant jet, or by the machine's own arm: the window is being
    // MADE, not waited for, and it says so with a cold rim.
    if(o.quenchHold > 0 || o.pourHold > 0){
      B(bx, by - 1, w, 1, o.pourHold > 0 ? '#ffcf72' : '#bfeaff');
      for(let x = 1; x < w - 1; x += 5) B(bx + x, by - 3, 2, 2, o.pourHold > 0 ? '#ffae4a' : '#dff8ff');
    }
    heatCrater(o, bx, by, w, depth);
    return;
  }
  B(bx, by, w, depth, T.stone); B(bx, by + 3, w, depth - 3, T.stoneDark);   // COLD — ordinary stone
  B(bx, by, w, 2, o.heatSet ? '#9fb4bd' : T.stoneLit);
  if(o.heatSet){ B(bx, by, w, 2, '#b6c9d2');                                        // stone you made: paler than the works'
    for(let x = 3; x < w - 2; x += 8) B(bx + x, by + 2, 4, 1, '#6e8590'); }             // a set seam
  else for(let x = 4; x < w - 3; x += 9) B(bx + x, by + 2, 3, 1, T.line);
  // ABOUT TO OPEN — lit through its seams for the last 30% of the cycle, and
  // brighter the closer it is. Steady, never flickering, so flash reduction has
  // nothing to suppress: the tell is the colour, not a strobe.
  if(o.heatWarn > 0){
    const hot = o.heatWarn > .5;
    B(bx, by, w, 2, hot ? '#ff8a3a' : '#b0461e');
    for(let x = 3; x < w - 3; x += 7) B(bx + x, by + 2, 3, 2, hot ? '#ffd98a' : '#e0561f');
    glow(bx + w / 2, by + 2, Math.min(60, w * .6), '255,120,50', .1 + o.heatWarn * .2);
  }
  heatCrater(o, bx, by, w, depth); bankedCollar(o, bx, by, w);
}
/* A conveyor has to say which way it runs before you stand on it: the rollers
   turn, and the tread scrolls the way it will carry you. */
function drawCastingLine(o,bx,by,w,h){
  const dir = Math.sign(o.belt) || 1, depth = Math.max(h, 10);
  B(bx, by, w, depth, '#2a1c17'); B(bx, by + depth - 3, w, 3, '#160d0a');
  B(bx, by, w, 3, '#6b4632');                                    // the bed
  castingTread(bx, by, w, depth, dir, false);
}
/* Tread and rollers, shared by the casting line and by the bed once the works
   puts it in motion. Reduced motion keeps the direction chevrons and drops the
   scroll, so the surface still says which way it will carry you. */
function castingTread(bx, by, w, depth, dir, overlay){
  const still = !!(curEnv && curEnv.reducedMotion);
  const scroll = still ? 0 : ((time * 46 * dir) % 12 + 12) % 12;
  for(let x = -12; x < w + 12; x += 12){
    const tx = Math.round(bx + x + scroll);
    if(tx < bx - 1 || tx > bx + w - 3) continue;
    B(tx, by + 1, 6, 1, '#b08a5a');
    B(tx + (dir > 0 ? 5 : 0), by, 2, 3, '#ffcf82');               // the leading edge catches the light
  }
  if(overlay) return;
  const rollers = Math.max(2, Math.round(w / 16));
  for(let i = 0; i < rollers; i++){
    const rx = bx + 4 + i * ((w - 8) / rollers), a = time * 7 * dir + i;
    B(rx, by + depth - 6, 4, 4, '#3d2820');
    B(rx + 1 + Math.round(Math.cos(a)), by + depth - 5 + Math.round(Math.sin(a)), 2, 2, '#8a6248');
  }
}
/* ==================== THE DEEP LINE'S RAILS AND CART ====================
   Ported from the legacy renderer, which owned both and was the only thing drawing them.
   When stage 15 joined SUPPORTED_STAGES the respec renderer took the stage over and had
   NEITHER: `drawCart` does not exist here at all, and `drawPlat` renders a slope as a flat
   2px bar at its top. So the player rode an invisible cart along curves that showed none
   of their incline — the owner's words were "you're just going forward without one ... the
   curves aren't illustrated, so it is very hard and looks absurd." Exactly right.

   The slope is sampled on the SAME smoothstep the collision uses (t*t*(3-2t)), so the
   drawn line is the line you actually ride rather than an artist's approximation. */
function railSlopeSamples(o){
  const N = 14, x1 = o.x - o.w / 2, x2 = o.x + o.w / 2, pts = [];
  for(let i = 0; i <= N; i++){
    const t = i / N, st = t * t * (3 - 2 * t);
    pts.push([WX(x1 + (x2 - x1) * t), WY(o.slopeY0 + (o.slopeY1 - o.slopeY0) * st)]);
  }
  return pts;
}
function drawRailSlope(o){
  const pts = railSlopeSamples(o), N = pts.length - 1;
  if(N < 1) return;
  // T, not THEMES[curG.theme]: `curG.theme` is assigned NOWHERE in the repo, so that
  // lookup always fell through to badlands. It looked correct only because the Deep
  // Line's own theme IS badlands — every other stage's slopes would have rendered in
  // the wrong palette the moment one was authored there.
  let maxY = -1e9; for(const q of pts) maxY = Math.max(maxY, q[1]);
  const bot = maxY + bh + 700;
  ctx.save();
  /*   A REJOINING BRANCH IS CARRIED, NOT CARVED. Filling the wedge under every slope
     buried the low road wherever a fork came back down to it — the player drove into a
     rock face and out the far side. `railTrestle` (stamped at load, same flag the cart's
     anti-burrow rule reads) says a road runs underneath, and then the branch is timber on
     piers with daylight beneath it: the fork reads as two roads, which is what it is. */
  if(o.railTrestle != null){
    const deck = WY(o.railTrestle), tie = Math.max(2, Math.round(7 * Z));
    ctx.fillStyle = '#3a2a19';
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for(let i = 1; i <= N; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    for(let i = N; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1] + tie);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2a1d11'; ctx.lineWidth = Math.max(1, Math.round(3 * Z));
    for(let i = 1; i < N; i++){
      const px = pts[i][0], py = pts[i][1] + tie;
      if(deck - py < 5) continue;                       // it has touched down
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, deck); ctx.stroke();
      const q = pts[i - 1];                             // one brace per bent, alternating
      if(deck - py > 16 && i % 2)
        { ctx.beginPath(); ctx.moveTo(q[0], q[1] + tie); ctx.lineTo(px, deck); ctx.stroke(); }
    }
    ctx.strokeStyle = T.stoneLit; ctx.lineWidth = Math.max(1, Math.round(3 * Z));
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for(let i = 1; i <= N; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    drawRailIrons(pts, N);
    ctx.restore();
    return;
  }
  // the mass under the line, so the curve reads as ground and not as a wire
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for(let i = 1; i <= N; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.lineTo(pts[N][0], bot); ctx.lineTo(pts[0][0], bot); ctx.closePath();
  ctx.fillStyle = T.stone; ctx.fill();
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1] + Math.round(60 * Z));
  for(let i = 1; i <= N; i++) ctx.lineTo(pts[i][0], pts[i][1] + Math.round(60 * Z));
  ctx.lineTo(pts[N][0], bot); ctx.lineTo(pts[0][0], bot); ctx.closePath();
  ctx.fillStyle = 'rgba(8,5,4,.55)'; ctx.fill();
  // the lit lip
  ctx.strokeStyle = T.stoneLit; ctx.lineWidth = Math.max(1, Math.round(3 * Z));
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for(let i = 1; i <= N; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
  drawRailIrons(pts, N);
  ctx.restore();
}
// ON A CART LEVEL THE LINE IS A RAIL: twin irons offset along each sample's normal,
// plus sleepers square to the local tangent. This is what makes a curve legible.
function drawRailIrons(pts, N){
  if(!curG.cartMode) return;
  for(const off of [-4 * Z, 2 * Z]){
    ctx.strokeStyle = '#8a94a6'; ctx.lineWidth = Math.max(1, Math.round(2.5 * Z));
    ctx.beginPath();
    for(let i = 0; i <= N; i++){
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const px = pts[i][0] + (-dy / len) * off, py = pts[i][1] + (dx / len) * off;
      if(i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.fillStyle = '#4a3421';
  for(let i = 1; i < N; i++){
    const a = pts[i - 1], b = pts[Math.min(N, i + 1)];
    ctx.save(); ctx.translate(pts[i][0], pts[i][1]);
    ctx.rotate(Math.atan2(b[1] - a[1], b[0] - a[0]));
    ctx.fillRect(-7 * Z, -2 * Z, 14 * Z, 6 * Z);
    ctx.restore();
  }
}
/* The cart itself. It carries the knight, so it draws with him rather than with the
   scenery, and it leans on G.cartLean the way the legacy one did. */
function drawCartRig(p){
  const x = WX(p.x), y = WY(p.y);
  ctx.save(); ctx.translate(x, y); ctx.rotate((curG.cartLean || 0) * (curG.cartDirection || 1) * -0.10); ctx.scale(Z, Z);
  const roll = p.x * 0.06;
  for(const wx of [-15, 15]){
    ctx.save(); ctx.translate(wx, -4); ctx.rotate(roll);
    ctx.fillStyle = '#241f1a'; ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#4a423a'; ctx.fillRect(-7, -1.5, 14, 3); ctx.fillRect(-1.5, -7, 3, 14);
    ctx.strokeStyle = '#8a94a6'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, 6.28); ctx.stroke();
    ctx.restore();
  }
  const tub = ctx.createLinearGradient(0, -34, 0, -6);
  tub.addColorStop(0, '#6a5030'); tub.addColorStop(1, '#352818');
  ctx.fillStyle = tub;
  ctx.beginPath(); ctx.moveTo(-27, -34); ctx.lineTo(27, -34);
  ctx.lineTo(20, -6); ctx.lineTo(-20, -6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-24, -33, 48, 4);
  ctx.strokeStyle = '#c9a860'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-27, -34); ctx.lineTo(27, -34); ctx.stroke();
  ctx.restore();
  // a boost reads as sparks off the irons, so "FULL SPEED" is visible without the HUD
  if((curG.cartBoost || 0) > 0.05)
    glow(x, y - Math.round(6 * Z), Math.round(26 * Z), '255,176,74', .18 + (curG.cartBoost || 0) * .22);
}
/*   THE RIDER GOES IN THE TUB, AND THE 360 HAS TO BE SEEN.
   Two faults, one call site. The renderer drew `drawCartRig` and THEN `drawHeroAt`, so
   the knight painted over the tub's front face — owner: "both direction of deep line
   don't show knight in cart (you can see him overlayed ontop of it, which doesn't make
   sense)." The legacy renderer had the order the other way round and this port lost it.
   The geometry was always right for a seat: the tub spans 6..34 units above his feet and
   he is 44 tall, so with the cart in front, the rim cuts him at the chest and the head
   and shoulders ride clear.
     And the mid-air flip had no wrapper here at all — the state machine ran, the trick
   landed, the world simply never turned. Owner: "you can't see the flip." Legacy rotates
   hero and cart together about the tub's centre; so does this, around the SAME point, or
   the rider shears out of his own cart halfway through the roll. */
/*   THE PARTNER IS DRAWN LIKE A KNIGHT. It used to be one bare figure call — no weapon, no
   swing, no dash, no downed pose, upright under flipped gravity, standing beside its cart,
   and in the same blue as you. Now it carries what its player carries and says who it is. */
const partnerAnim = { anim:0, idle:0 };
function drawPartner(g){
  if(!g || g.hidden) return;
  partnerAnim.anim += dt * (Math.abs(g.vx || 0) > 20 ? Math.abs(g.vx) / 20 : 0); partnerAnim.idle += dt;
  const st = { face:g.face || 1, run:!!g.onGround && Math.abs(g.vx || 0) > 20, air:!g.onGround,
    wall:!!g.onWall, wallDir:g.wallDir || 1, dashing:!!g.dashing, squash:0, stretch:0, hurt:false,
    slam:!!g.slamming, atkT:g.atkTimer > 0 ? Math.min(1, g.atkTimer / .22) : 0,
    blade:!!g.weapon, bow:!!(g.weapon && g.weapon.arche === 'bow'), pack:false,
    anim:partnerAnim.anim, idle:partnerAnim.idle, vx:g.vx || 0, vy:g.vy || 0,
    pal:FIGURE_PALS.partner, down:!!(g.dead || g.downed) };
  const top = WY(g.y) - 22;
  const body = () => drawFigure(WX(g.x - 13), top, st);
  if(g.dead) ctx.globalAlpha = .45;
  if(g.cartMode && curG.cartMode){
    ctx.save(); ctx.translate(0, -Math.round(12 * Z)); body(); ctx.restore(); drawCartRig(g);
  } else if(g.flipped){ ctx.save(); ctx.translate(0, 2 * top + 22); ctx.scale(1, -1); body(); ctx.restore(); }
  else body();
  ctx.globalAlpha = 1;
  const tag = g.tag || 'PARTNER', tx = WX(g.x), ty = g.flipped ? top + 34 : top - 6;
  ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = P.skyTop; ctx.fillText(tag, tx + 1, ty + 1);
  ctx.fillStyle = tag === 'DOWNED' || tag === 'DEFEATED' ? '#ff6a5e' : tag === 'OPPONENT' ? '#ff9a6a' : '#e6bb73';
  ctx.fillText(tag, tx, ty);
  if(g.echo){ ctx.globalAlpha = .35; drawFigure(WX(g.echo.x - 13), WY(g.echo.y) - 22, { face:g.face || 1, ghost:true, pal:FIGURE_PALS.partner }); ctx.globalAlpha = 1; }
}
function drawCartRide(p){
  if(!curG.cartMode){ drawHeroAt(p); return; }
  const dur = L.CART_FLIP_DUR || 0.55;
  const flipping = (p.cartFlipT > 0) || (p.cartTrick && !p.onGround);
  if(flipping){
    const prog = p.cartTrick ? 1 : (1 - p.cartFlipT / dur);
    const fx = WX(p.x), fy = WY(p.y) - Math.round(26 * Z);   // the tub's centre, 26 units up
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(-prog * 6.2832 * (curG.cartDirection || 1)); ctx.translate(-fx, -fy);
  }
  //   AND HE RIDES IN IT, NOT BEHIND IT. Drawn at his own feet the tub's 34-unit rim
  // leaves 10 units of a 44-unit body showing — five screen pixels at this scale, a blue
  // dot over a crate. He stands on the tub FLOOR and looks over the side, so lift him
  // clear of the rim by enough that head, shoulders and arms ride above it.
  ctx.save(); ctx.translate(0, -Math.round(12 * Z));
  drawHeroAt(p);
  ctx.restore();
  drawCartRig(p);
  if(flipping) ctx.restore();
}
function drawPlat(o){
  // A RAIL IS NOT A SLAB. Slopes carry their own drawer or the incline is invisible.
  // ...but NOT on a stage that draws its own. The White Court has a slope branch inside
  // drawCourtSurface (dispatched twenty lines below this one), and an unconditional
  // grab here silently stole stage 8's ice ramps.
  if(o.slope && curG.stageIndex !== 8){ drawRailSlope(o); return; }

  // The roof of the world is 200,000 units wide and its brick loop is per-pixel.
  // Draw only the span the camera can actually see.
  if(o.w * Z > bw * 3){
    const l = Math.max(o.x - o.w / 2, camX - 400), r = Math.min(o.x + o.w / 2, camX + bw / Z + 400);
    if(r <= l) return;
    o = Object.assign({}, o, { x:(l + r) / 2, w:r - l });
  }
  const w = Math.round(o.w * Z), h = Math.max(4, Math.round((o.h || 14) * Z)), bx = WX(o.x - o.w / 2), by = WY(o.y);
  if(curG.stageIndex===5&&drawKeepShelf(o,bx,by,w,h))return;
  if(curG.stageIndex===5&&o.keepDockCatch){
    B(bx,by,w,h,KEEP.iron);B(bx,by,w,2,KEEP.edge);B(bx+3,by+3,w-6,h-4,KEEP.dark);
    const socketW=18;B(bx+w/2-socketW/2,by,socketW,2,KEEP.brass);
    for(const f of [-1,1]){B(bx+w/2+f*(socketW/2+4)-1,by+3,3,h-4,KEEP.brass);}
    return;
  }
  if(o.heatCycle){ drawHeatStone(o,bx,by,w,h); return; }
  if(o.castingLine && !o.gone){ drawCastingLine(o,bx,by,w,h); return; }
  if(o.gone) return;
  /*   A CLOSED GATE IS NOT A PLATFORM, AND HAS TO LOOK LIKE ONE THAT ISN'T.
     Owner, on the Citadel: "the false platforms are STILL there … so I can't even pass
     this gap!" They were not leftovers — they are the three planks Oren lays, and this
     renderer drew them SOLID while the gate was shut, so the player walked at a bright
     ledge over a 1,260-unit void and fell through it. The legacy renderer had always
     drawn a closed gate as a 15%-alpha dashed outline (index.html, "closed gate: faint
     outline hints at the bridge"); the port kept that rule only inside drawCourtSurface,
     for the White Court's ice, and every other gated surface in the game lost it —
     Emberdeep's held-lava-bridge lies the same way over lava.
       It also made Oren's plate look broken: the planks were already on screen, so
     latching them changed nothing the player could see. "I still don't know what it is
     actually meant to do." */
  if(o.gate && curG.stageIndex !== 8 && !(L.gateOpen ? L.gateOpen(o) : L.circuitOpen && L.circuitOpen(o.gate))){
    ctx.save(); ctx.globalAlpha = .15; ctx.strokeStyle = '#5fd17a';
    ctx.setLineDash([6, 6]); ctx.strokeRect(bx + .5, by + .5, w - 1, Math.max(3, h) - 1);
    ctx.setLineDash([]); ctx.restore(); return;
  }
  if(curG.stageIndex===8){drawCourtSurface(o,bx,by,w,h);return;}
  if(curG.stageIndex===7){
    const depth=o.deep?Math.max(0,bh-by):h;if(!depth)return;
    B(bx,by,w,depth,FROST.stone);B(bx,by+3,w,Math.max(1,depth-3),o.deep?FROST.dark:FROST.back);
    B(bx,by,w,2,o.ice?FROST.ice:FROST.edge);B(bx,by+2,w,1,o.ice?'#6c9dad':FROST.stone);
    for(let xx=4;xx<w-3;xx+=13){B(bx+xx,by+4,7,2,FROST.stone);if(o.ice){B(bx+xx,by,5,1,FROST.snow);B(bx+xx+3,by+3,1,4,FROST.ice);}}
    if(!o.ice)for(let xx=4;xx<w-5;xx+=9)B(bx+xx,by,3,1,FROST.snow);
    if(o.frostThawRaft){for(let xx=7;xx<w-4;xx+=14)B(bx+xx,by+4,2,h-5,FROST.copper);B(bx-3,by+h-3,w+6,3,FROST.iron);}
    if(o.frostRecoveryLanding){B(bx+3,by+4,w-6,2,FROST.copper);for(const f of [-1,1])pixelLimb(bx+w/2+f*w*.38,by+h,bx+w/2+f*w*.2,by+h+17,2,FROST.iron);}
    return;
  }
  if(curG.stageIndex===6&&!o.deep){
    B(bx,by,w,h,GAOL.iron);B(bx,by,w,2,o.slate?GAOL.open:GAOL.edge);B(bx,by+h-2,w,2,GAOL.dark);
    for(let x=5;x<w-3;x+=12){B(bx+x,by+3,2,2,GAOL.brass);if(o.slate)B(bx+x,by,4,1,GAOL.light);}
    if(o.gaolRouteMouth)for(const s of [-1,1]){const xx=bx+w/2+s*(w*.5-8);B(xx-2,by-1,4,3,GAOL.brass);B(xx-2,by+3,4,1,GAOL.light);}
    return;
  }
  if(o.suspended && L.drawSuspension){
    if(curG.stageIndex===3 && o.collectorPlatform){const ax=WX(o.x0 || o.x),ay=WY((o.y0 || o.y)+130);pixelLimb(ax,ay,bx+w/2,by,1,'#9ba892');B(ax-4,ay-2,8,3,'#6e7c72');}
    else legacyDraw(L.drawSuspension,o);
  }
  if(o.deep){
    const depth = bh - by; if(depth <= 0) return;
    if(o.openingCreek || o.openingLowRoad){
      B(bx, by, w, depth, T.deep); B(bx, by, w, 2, T.stoneLit); B(bx, by + 2, w, 3, T.stoneDark);
      for(let x = 3; x < w; x += 11){ B(bx + x, by + 1, 5, 1, T.stone); if(hash(o.x + x, 9) < .6) B(bx + x + 2, by + 6, 3, 1, T.stoneDark); }
      return;
    }
    bricks(bx, by, w, Math.min(depth, 26), o.x, o.y);
    if(depth > 26){ B(bx, by + 26, w, depth - 26, T.deep); for(let yy = 26; yy < depth; yy += 9) for(let xx = 0; xx < w; xx += 13){ if(hash(o.x + xx, yy) < .3) B(bx + xx + (hash(xx, yy) * 6 | 0), by + yy + (hash(yy, xx) * 4 | 0), 3, 1, T.stoneDark); } }
    cap(bx, by, w, o.x);
    // A DEEP FLOOR THAT TAKES MOUTHS. This branch returned before the slate cap at
    // the bottom of drawPlat ever ran, so the Foundry's pit floor — 2,200 units of
    // slate — drew as ordinary brick. The arena looked like it accepted a mouth
    // anywhere for no reason at all.
    if(o.slate){
      B(bx, by, w, 3, '#bdc4bb'); B(bx, by + 3, w, 1, '#6e8590');
      for(let x = 6; x < w - 3; x += 12) B(bx + x, by + 1, 4, 1, '#6e8590');
    }
    drawAerieNest(o,bx,by,w); return;
  }
  const floating = o.y > 0;
  // The feeder's own shoulder, once it stops being a machine.
  if(o.feederWreck){
    B(bx, by, w, h, '#3a2a24'); B(bx, by, w, 2, '#8a6248');
    for(let x = 3; x < w - 3; x += 10){ B(bx + x, by + 3, 6, 2, '#241a16'); B(bx + x, by + 2, 2, 1, '#6e8590'); }
    return;
  }
  if(curG.stageIndex === 2 && (o.upperRoute || o.archeryStep || o.archeryPerch || o.archeryReturnStep || o.bruteReleaseStep || o.bruteReleasePerch || o.bruteShotPerch || o.truthSurface)){
    B(bx,by,w,h,'#584334'); B(bx,by,w,2,'#bf9b66'); B(bx,by+h-2,w,2,'#2e2420');
    for(let x=4;x<w-3;x+=11){ B(bx+x,by+3,1,h-4,'#2b201b'); B(bx+x+3,by+4,2,1,'#a58359'); }
    return;
  }
  if(curG.stageIndex === 1 && (o.truthSurface || o.mirrorCopy)){
    // The material and resin colour are identical on truths and copies. Only
    // the resin's wind-facing edge distinguishes the honest branch.
    B(bx, by, w, h, '#4b3929'); B(bx, by + h - 2, w, 2, '#2b2b21');
    B(bx, by, w, 1, '#89734c');
    for(let x = 5; x < w - 5; x += 13){ B(bx+x,by+2,8,1,'#685339'); B(bx+x+3,by+4,4,1,'#302a21'); }
    if(o.mirrorTruth || o.mirrorCopy){
      const windward = (o.forestWindDir || 1) > 0 ? 3 : w - 21;
      const leeward = (o.forestWindDir || 1) > 0 ? w - 21 : 3;
      const rx = bx + (o.mirrorTruth ? windward : leeward);
      B(rx, by - 1, 18, 2, '#d9a34a'); B(rx + 3, by - 2, 6, 1, '#f5cf79');
      B(rx + 12, by + 1, 2, 3, '#ba8137');
    }else{
      B(bx + 3, by - 1, w - 6, 2, '#b18b4c');
      for(let x = 6; x < w - 6; x += 16) B(bx + x, by - 2, 5, 1, '#d9b96c');
    }
    for(let x = 7; x < w - 5; x += 15) pixelLimb(bx+x,by+h,bx+x-3,by+h+4+hash(o.x+x,5)*4,1,'#39402a');
    if(o.mirrorCopy && o.lampSeen){
      // Lamplight exposes disconnected grain inside the copy, not a floating
      // answer label. The incorrect resin edge remains visible above it.
      for(let x=6;x<w-5;x+=12){ B(bx+x,by+1,3,h-1,'#132519'); B(bx+x-1,by+2,1,h-3,'#b6c590'); }
      B(bx+3,by+h-1,w-6,1,'#80966d');
    }
    return;
  }
  if(floating){ ctx.fillStyle = 'rgba(6,3,14,.25)'; ctx.fillRect(bx + 2, by + h, w - 4, 3); }
  bricks(bx, by, w, h, o.x, o.y);
  if(o.crumble){ for(let xx = 2; xx < w; xx += 5) if(hash(o.x + xx, 7) < .5) B(bx + xx, by + h - 1, 2, 1, T.line); B(bx, by, w, 3, T.stoneLit); B(bx, by + 3, w, 1, T.stoneDark); }
  // Brittle rock only yields to a strike from above, so it has to look struck-at:
  // a cracked cap with a fault line, not another ledge.
  if(o.brittle){ B(bx, by, w, 2, '#b9a08c');
    for(let xx = 3; xx < w - 2; xx += 4){ const d = hash(o.x + xx, 11);
      B(bx + xx, by + 2, 1, Math.max(1, Math.round(h * (.3 + d * .5))), d < .5 ? T.stoneDark : T.line); }
    for(let xx = 1; xx < w - 1; xx += 9) B(bx + xx, by + Math.round(h * .55), 5, 1, '#6a4f3e'); }
  else if(o.slope || o.ceiling) { B(bx, by, w, 2, T.stoneLit); }
  else cap(bx, by, w, o.x);
  if(floating && themeName !== 'frost') for(let xx = 4; xx < w - 4; xx += 7){ const hh = hash(o.x + xx, 99); if(hh < .5) B(bx + xx, by + h, 1, 3 + (hh * 12 | 0), P.root); }
  if(o.slate){B(bx,by,w,3,'#bdc4bb');for(let i=6;i<w-3;i+=12){B(bx+i,by+1,4,1,'#6e8590');}}
  drawAerieNest(o,bx,by,w);
  if(o.belt && !o.gone && L.drawBelt) legacyDraw(L.drawBelt, o);
  ctx.strokeStyle = T.line; ctx.lineWidth = 1; ctx.strokeRect(bx - .5, by - .5, w + 1, h + 1);
}
function drawWall(o){
  const w = Math.round((o.w || 26) * Z), h = Math.round(o.h * Z), bx = WX(o.x - (o.w || 26) / 2), by = WY(o.y);
  if(curG.stageIndex===8){
    B(bx,by,w,h,COURT.stone);B(bx,by,w,2,COURT.silver);
    for(let yy=9;yy<h;yy+=16){B(bx+2,by+yy,w-4,1,COURT.dark);B(bx+2,by+yy+2,2,1,COURT.edge);}
    for(const xx of [bx,bx+w-2])B(xx,by,2,h,o.slate?COURT.slate:o.slickL||o.slickR?COURT.glass:COURT.edge);
    if(o.slate)for(let yy=7;yy<h-4;yy+=14){B(bx,by+yy,2,4,COURT.dark);B(bx+w-2,by+yy,2,4,COURT.dark);}
    return;
  }
  if(curG.stageIndex===7){
    B(bx,by,w,h,FROST.stone);B(bx,by,w,2,FROST.edge);
    for(let yy=7;yy<h;yy+=13){B(bx+2,by+yy,w-4,2,FROST.dark);B(bx+2,by+yy-2,2,1,FROST.edge);}
    if(o.slate){B(bx,by,2,h,FROST.ice);B(bx+w-2,by,2,h,FROST.ice);for(let yy=9;yy<h-4;yy+=15){B(bx,by+yy,2,4,FROST.iron);B(bx+w-2,by+yy,2,4,FROST.iron);}}
    return;
  }
  if(curG.stageIndex===5)return drawKeepWall(o,bx,by,w,h);
  if(curG.stageIndex===6){
    B(bx,by,w,h,GAOL.iron);B(bx,by,w,2,GAOL.edge);
    B(bx,by,2,h,o.slate?GAOL.open:GAOL.ironLit);B(bx+w-2,by,2,h,o.slate?GAOL.open:GAOL.edge);
    for(let y=8;y<h-3;y+=15){B(bx+3,by+y,w-6,2,GAOL.dark);B(bx+2,by+y,2,1,GAOL.brass);B(bx+w-4,by+y,2,1,GAOL.brass);}
    if(o.gaolRouteMouth==='exit')for(const yy of [by+12,by+h-16]){B(bx-1,yy,4,4,GAOL.brass);B(bx-2,yy+1,1,2,GAOL.light);}
    if(o.wardenMineGate)for(let y=5;y<h-4;y+=24){pixelLimb(bx+3,by+y,bx+w-4,by+y+16,2,GAOL.ironLit);}
    return;
  }
  if(curG.stageIndex===4 && (o.watchMantlet||o.marksmanCoverTier)) return drawMarksmanMantlet(o,bx,by,w,h);
  if(curG.stageIndex === 2 && o.causewayBulkhead){
    B(bx,by,w,h,'#48352b'); B(bx,by,w,3,'#b5905e'); B(bx+2,by+3,2,h-3,'#8d6c4b'); B(bx+w-4,by+3,2,h-3,'#261e19');
    for(let y=14;y<h-3;y+=24){ B(bx+5,by+y,w-10,2,'#6e523b'); B(bx+7,by+y,2,2,'#b28c5d'); B(bx+w-10,by+y,2,2,'#b28c5d'); }
    return;
  }
  if(curG.stageIndex === 1 && o.rootWall){
    B(bx, by, w, h, '#342e22'); B(bx, by, 2, h, '#675335'); B(bx+w-2,by,2,h,'#1c271b');
    for(let y=5;y<h;y+=12){ pixelLimb(bx+3,by+y+5,bx+w-4,by+y,2,'#594830'); B(bx+w/2,by+y+3,1,7,'#1e241a'); }
    B(bx+3,by+1,w-6,2,'#89734c'); return;
  }
  bricks(bx, by, w, h, o.x, o.y);
  if(!o.noCling) for(let yy = 6; yy < h - 4; yy += 10){ B(bx + 1, by + yy, 2, 1, T.cap[1]); B(bx + w - 3, by + yy + 5, 2, 1, T.cap[1]); }
  B(bx, by, w, 2, T.stoneLit);
  if(o.slate){B(bx,by,3,h,'#c5cdc0');B(bx+w-3,by,3,h,'#c5cdc0');for(let y=9;y<h-4;y+=13){B(bx,by+y,3,4,'#708a94');B(bx+w-3,by+y,3,4,'#708a94');}}
}
function drawEmberVent(o, up, warn){
  const bx = WX(o.x - o.w / 2), by = WY(o.y), w = Math.round(o.w * Z);
  B(bx, by - 3, w, 4, T.stoneDark); B(bx, by - 4, w, 1, '#6a4436');
  for(let x = 2; x < w - 1; x += 4) B(bx + x, by - 3, 2, 3, '#1a0d09');          // grate slots
  const jet = up ? 17 : warn ? 6 : 0;                                            // matches the spike hitbox: the flame never lies about its reach
  if(!jet){ glow(bx + w / 2, by - 2, 10, '255,120,50', .12); return; }
  for(let x = 2; x < w - 1; x += 4){
    const wob = Math.sin(time * 22 + x) * (up ? 1 : .4);
    for(let k = 0; k < jet; k++){
      const t = k / jet, col = t < .3 ? '#fff0c0' : t < .62 ? '#ffae4a' : '#e0561f';
      B(bx + x + Math.round(wob * t * 2), by - 4 - k, t > .7 ? 1 : 2, 1, col);
    }
  }
  glow(bx + w / 2, by - jet * .6, up ? 30 : 15, '255,150,60', up ? .36 : .17);
}
function drawSpikes(o){
  if(o.flame){ legacyDraw(L.byType.spikes, o); return; }
  const up = L.spikesUp ? L.spikesUp(o) : true, warn = L.spikesWarn ? L.spikesWarn(o) : false, ext = up ? 1 : (warn ? .4 : .12);
  if(o.emberVent && !o.wall){ drawEmberVent(o, up, warn); return; }
  const tip = up ? P.ink : (warn ? P.amber : T.stoneLit), base = o.rootThorns ? P.wood : T.stoneDark;
  if(o.wall){
    // WHAT IS DRAWN IS WHAT BITES. This used to read `len` as the distance the teeth
    // jut OUT from the face, and painted a bar that long lying on its side — so a
    // 400-long band drew as a 400-unit spear across the room while the hitbox it
    // actually owns is a 400-unit-TALL strip only SPIKE_REACH wide against the wall.
    // Everything outside that narrow strip looked lethal and was not. `len` is the
    // span ALONG the wall, exactly as the collision reads it.
    const reach = Math.max(3, Math.round(24 * Z * ext)), f = o.face || 1;
    const bx = WX(o.x), half = Math.round((o.len || 80) * Z / 2), by = WY(o.y);
    B(bx - (f > 0 ? 2 : 1), by - half, 3, half * 2, base);
    const n = Math.max(3, Math.round((o.len || 80) / 22));
    for(let i = 0; i < n; i++){
      const y = by - half + Math.round((i + .5) * (half * 2) / n);
      for(let k = 0; k < reach; k++)
        B(bx + f * k, y - (k < reach / 2 ? 1 : 0), 1, k < reach / 2 ? 3 : 1,
          k > reach - 3 ? tip : T.stoneLit);
    }
    return;
  }
  const bx = WX(o.x - o.w / 2), by = WY(o.y), w = Math.round(o.w * Z), n = Math.max(3, Math.round(o.w / 16));
  B(bx, by - 2, w, 3, base);
  for(let i = 0; i < n; i++){ const x = bx + Math.round((i + .5) * w / n), hh = Math.round(14 * ext); for(let k = 0; k < hh; k++) B(x - (k < hh / 2 ? 1 : 0), by - 3 - k, k < hh / 2 ? 3 : 1, 1, k > hh - 4 ? tip : T.stoneLit); }
}
function drawDoor(o){
  const open = L.doorOpen ? L.doorOpen(o) : false, bx = WX(o.x - o.w / 2), by = WY(o.y), w = Math.round(o.w * Z), h = Math.round(o.h * Z);
  if(curG.stageIndex===8){
    const hh=open?8:h;B(bx-4,by-4,w+8,5,COURT.edge);
    for(const xx of [bx-3,bx+w+1]){B(xx,by,2,h,COURT.stone);chain(xx,by-12,by+15,COURT.brass);}
    for(let yy=0;yy<hh;yy+=12){B(bx,by+yy,w,Math.min(10,hh-yy),COURT.stone);B(bx,by+yy,w,1,COURT.silver);B(bx+w/2-1,by+yy+3,2,4,open?COURT.light:COURT.glass);}
    B(bx-1,by+hh-2,w+2,2,COURT.edge);return;
  }
  if(curG.stageIndex===7){
    const hh=open?Math.min(h,7):h;
    B(bx-4,by-4,w+8,5,FROST.edge);
    for(const s of [-1,1]){B(bx+w/2+s*(w/2+3),by,2,h,FROST.stone);chain(bx+w/2+s*(w/2+6),by-17,by+13,FROST.copper);}
    for(let yy=0;yy<hh;yy+=9){B(bx,by+yy,w,Math.min(8,hh-yy),FROST.iron);B(bx,by+yy,w,1,FROST.edge);B(bx+2,by+yy+3,w-4,1,FROST.dark);}
    B(bx-2,by+hh-2,w+4,3,open?FROST.warm:FROST.ice);
    if(o.frostDamperShutter)wheel(bx+w/2,by-12,7,open?.8:0,FROST.copper);
    return;
  }
  if(curG.stageIndex===6){
    B(bx-3,by-4,w+6,5,GAOL.ironLit);const gh=open?7:h;
    for(let x=2;x<w;x+=5){B(bx+x,by,2,gh,GAOL.iron);B(bx+x,by,1,gh,GAOL.edge);}
    for(let y=8;y<gh;y+=18)B(bx,by+y,w,3,GAOL.ironLit);
    for(const s of [-1,1]){const xx=bx+w/2+s*(w*.5+5);chain(xx,by-18,by+18,GAOL.brass);B(xx-2,by+15,5,5,open?GAOL.open:GAOL.brass);}
    return;
  }
  // THE COUNTERWEIGHT GATE. It is not a door with a switch somewhere else: the
  // weight that holds it up hangs beside it in plain air, and the chain it hangs
  // on runs to the mould. Dropped, the weight sits on the floor and the gate is
  // a raised slab that stays raised.
  if(o.foundryAnvilGate){
    const gh = open ? Math.min(h, 10) : h, wx = bx - 16;
    B(bx - 4, by - 4, w + 8, 5, '#8a5a40');
    for(let y = 0; y < gh; y += 11){ B(bx, by + y, w, 9, '#4a3128'); B(bx, by + y, w, 2, '#8a6248');
      B(bx + 2, by + y + 4, w - 4, 1, '#241a16'); }
    B(bx - 2, by + gh - 3, w + 4, 4, o.dropped ? '#6e8590' : '#b08a5a');
    // THE WEIGHT, and the tie that says what holds it. The head of the gate runs a
    // rod west — toward the mould — so the eye is sent to the thing it depends on
    // without a word of signage. Held: the weight hangs high and its cap is lit.
    // Dropped: it sits on the floor, cold, and the gate never comes down again.
    B(bx - 30, by - 4, 26, 3, '#6b4632');
    for(let i = 0; i < 3; i++) B(bx - 30 - i * 9, by - 3, 5, 2, '#8a6248');
    const wy = o.dropped ? by + h - 20 : by + Math.round(h * .26);
    chain(wx + 8, by - 3, wy, '#6b4632');
    B(wx, wy, 18, 20, o.dropped ? '#3a2a24' : '#5c3a2a');
    B(wx, wy, 18, 3, o.dropped ? '#6e8590' : '#b08a5a');
    B(wx + 3, wy + 6, 12, 2, '#241a16'); B(wx + 3, wy + 11, 12, 2, '#241a16');
    if(!o.dropped) glow(wx + 9, wy + 10, 16, '255,170,90', .14 + .06 * Math.sin(time * 2));
    return;
  }
  if(curG.stageIndex===5)return drawKeepDoor(o,bx,by,w,h,open);
  if(curG.stageIndex===4){
    const visibleH=open?Math.min(h,12):h;B(bx-3,by-3,w+6,4,WATCH.brass);
    for(let y=0;y<visibleH;y+=12){B(bx,by+y,w,10,WATCH.iron);B(bx,by+y,w,2,WATCH.edge);B(bx+2,by+y+4,2,2,WATCH.brass);B(bx+w-4,by+y+4,2,2,WATCH.brass);}
    return;
  }
  if(curG.stageIndex===3){
    const visibleH=open?Math.min(h,14):h;B(bx-2,by-3,w+4,4,'#91a496');
    for(let y=0;y<visibleH;y+=10){B(bx,by+y,w,8,'#536e77');B(bx,by+y,w,1,'#9fb8b3');B(bx+w/2-1,by+y+2,2,4,'#354c56');}
    return;
  }
  if(curG.stageIndex === 2 && o.circuit === 'drop-yard'){
    const gateH=open?Math.min(24,h):h;
    B(bx-3,by-3,w+6,4,'#9d7952');
    for(let x=3;x<w;x+=6){ B(bx+x,by,3,gateH,'#4b3931'); B(bx+x,by,1,gateH,'#977455'); }
    for(let y=7;y<gateH;y+=18) B(bx,by+y,w,3,'#6b5040');
    B(bx-2,by+gateH-3,w+4,4,'#b28b5e'); return;
  }
  if(open){ ctx.globalAlpha = .35; ctx.strokeStyle = '#5fd17a'; ctx.setLineDash([3, 4]); ctx.strokeRect(bx + .5, by + .5, w - 1, h - 1); ctx.setLineDash([]); ctx.globalAlpha = 1; return; }
  bricks(bx, by, w, h, o.x, o.y);
  const rc = o.circuit !== undefined ? '#5fd17a' : P.amber;
  for(let yy = 8; yy < h - 6; yy += 14) B(bx + (w >> 1) - 1, by + yy, 2, 6, rc);
  B(bx, by, w, 2, T.stoneLit);
}
function drawLever(o){
  if(o.gone) return;
  if(curG.stageIndex===8&&o.courtCastPaddle){drawCourtPaddle(o);return;}
  if(curG.stageIndex===7){
    if(o.frostThermalReceiver){drawFrostReceiver(o);return;}
    if(o.frostDamperLever){
      const x=WX(o.x),y=WY(o.y||0),on=o.timer>0||frostOn('frost-thermal'),q=Math.max(0,Math.min(1,(o.timer||0)/(o.dur||1.2)));
      B(x-8,y-5,16,5,FROST.stone);B(x-2,y-24,4,19,FROST.iron);wheel(x,y-22,12,on?q*1.6:0,FROST.copper);
      B(x+16,y-33,4,29,FROST.dark);B(x+17,y-31+25*(1-q),2,Math.max(1,25*q),FROST.warm);
      const gate=curG.obstacles.find(a=>a.frostDamperShutter);if(gate){const gx=WX(gate.x),gy=WY(gate.y)-12;frostPipe(x,y-38,gx,gy,on);}
      return;
    }
  }
  if(curG.stageIndex === 2 && drawCausewayLever(o)) return;
  if(curG.stageIndex === 3 && drawUpdraftsLever(o)) return;
  if(curG.stageIndex === 4 && drawMarksmanTarget(o)) return;
  if(curG.stageIndex === 5 && drawKeepRelease(o)) return;
  const bx = WX(o.x), by = WY(o.y || 0);
  if(o.bruteWakeLever || (o.w && o.w <= 14)){ const hit = o.struck || o.flip; B(bx - 3, by - 3, 6, 6, hit ? P.amber : T.stoneLit); B(bx - 1, by - 1, 2, 2, hit ? P.moon : P.danger); if(!hit) glow(bx, by, 10, '255,180,84', .25); return; }
  const f = o.flip ? 1 : -1;
  B(bx - 5, by - 3, 10, 3, T.stoneDark); B(bx - 4, by - 4, 8, 1, T.stoneLit);
  for(let i = 0; i < 9; i++) B(bx + f * (i * .6) | 0, by - 4 - i, 2, 1, P.wood);
  B(bx + f * 5, by - 14, 3, 3, o.flip ? '#5fd17a' : P.danger);
  if(!o.flip) nearGlow(o, '255,180,84', 8);
}
function drawCrystal(o){
  const bx = WX(o.x), by = WY(o.y) - 12 + Math.round(Math.sin(time * 2 + (o.spin || 0)) * 2), dim = o.cdT > 0, c = dim ? T.stoneLit : P.cyan, lit = dim ? T.stoneDark : '#ffffff', w = 1 + Math.abs(Math.cos(time * 1.5 + (o.spin || 0))) * 3 | 0;
  for(let i = -6; i <= 6; i++){ const ww = Math.max(1, Math.round(w * (1 - Math.abs(i) / 7))); B(bx - ww, by + i, ww * 2, 1, c); }
  B(bx - 1, by - 3, 1, 4, lit);
  if(!dim) glow(bx, by, 22, '107,231,255', .35);
}
function drawCrate(o){
  const bx = WX(o.x - o.w / 2), by = WY(o.y) - Math.round(o.h * Z), w = Math.round(o.w * Z), h = Math.round(o.h * Z);
  if(curG.stageIndex===5&&(o.keepMasonry||o.belfryWeight))return drawKeepWeight(o,bx,by,w,h);
  B(bx, by, w, h, P.wood); B(bx, by, w, 1, P.woodLit); B(bx, by, 1, h, P.woodLit); B(bx, by + h - 1, w, 1, P.canvasDark); B(bx + w - 1, by, 1, h, P.canvasDark);
  B(bx + 2, by + 2, w - 4, 1, P.canvasDark); B(bx + 2, by + h - 3, w - 4, 1, P.canvasDark); for(let i = 2; i < w - 2; i += 4) B(bx + i, by + 4, 1, h - 8, P.canvasDark);
}
function drawPlate(o){
  const bx = WX(o.x - o.w / 2), by = WY(o.y || 0), w = Math.round(o.w * Z), d = o.pressed ? 1 : 0;
  if(curG.stageIndex===6&&o.gaolHushBrake){
    const on=!!(o.pressed||(L.circuitOpen&&L.circuitOpen(o.id)));
    B(bx-3,by-1,w+6,3,GAOL.dark);B(bx,by-(on?2:5),w,on?2:5,GAOL.ironLit);B(bx+2,by-(on?2:5),w-4,1,on?GAOL.open:GAOL.light);
    for(let x=5;x<w-4;x+=7)B(bx+x,by-(on?1:3),2,1,GAOL.dark);return;
  }
  if(curG.stageIndex===5&&(o.keepMasonryPlate||o.belfryFoldPlate||o.belfryBellPlate))return drawKeepPlate(o,bx,by,w);
  if(curG.stageIndex===3 && o.windVane){
    B(bx-2,by-3,w+4,4,'#52696d');B(bx+2,by-4,w-4,2,o.pressed?'#b4e0c7':'#a8bbb0');
    const x=bx+w/2;B(x,by-23,1,20,'#91aaa6');for(let i=0;i<9;i++)B(x+i,by-22+i*.35,1,6-i*.4,o.pressed?'#b4e0c7':'#6a96a5');return;
  }
  if(curG.stageIndex === 2 && o.trapOnly){
    const on=!!(o.pressed || (L.circuitOpen && L.circuitOpen(o.id || o.circuit)));
    B(bx-3,by-2,w+6,4,'#302620'); B(bx,by-(on?2:5),w,on?2:5,'#9b7852'); B(bx+3,by-(on?2:5),w-6,1,'#d2ab72');
    for(let x=5;x<w-3;x+=9) B(bx+x,by-(on?2:4),2,2,'#3c3027'); return;
  }
  // A COMPANION POST. It was drawing as the generic plate — a bare white bar in a
  // dark room, which reads as a UI artifact rather than a marked place to put a
  // person. Give it boot marks, a rail to stand at, and a lamp that lights when
  // someone is actually standing on it.
  if(o.sendPost || o.relayOnly){
    const on = !!o.pressed, warm = on ? '#9dffc4' : '#ffb06a';
    B(bx - 3, by - 1, w + 6, 3, T.stoneDark);
    B(bx, by - 4 + d, w, 4 - d, on ? '#3f5a46' : '#4a352a');
    B(bx + 2, by - 4 + d, w - 4, 1, on ? '#5fd17a' : '#8a5a40');
    for(let x = 4; x < w - 3; x += 7) B(bx + x, by - 2 + d, 3, 1, on ? '#9dffc4' : '#6b4632');  // boot marks
    for(const ex of [bx - 1, bx + w - 1]){                                    // a rail at each end
      B(ex, by - 15 + d, 2, 12, T.stoneDark); B(ex, by - 16 + d, 2, 2, warm);
    }
    glow(bx + w / 2, by - 8, on ? 26 : 16, on ? '157,255,196' : '255,176,106', on ? .3 : .14);
    return;
  }
  B(bx, by - 3 + d, w, 3 - d, o.pressed ? '#5fd17a' : T.stoneLit); B(bx + 1, by - 3 + d, w - 2, 1, o.pressed ? '#9dffc4' : T.cap ? T.cap[1] : '#ffffff'); B(bx - 2, by - 1, w + 4, 2, T.stoneDark);
}
function drawChest(o){
  const bx = WX(o.x), by = WY(o.y || 0);
  B(bx - 8, by - 8, 16, 8, P.wood); B(bx - 8, by - 9, 16, 1, P.woodLit); B(bx - 8, by - 4, 16, 1, P.canvasDark);
  if(o.opened){ B(bx - 8, by - 14, 16, 2, P.woodLit); B(bx - 6, by - 7, 12, 4, T.stoneDark); }
  else { B(bx - 8, by - 12, 16, 4, P.woodLit); B(bx - 1, by - 9, 2, 3, P.amber); glow(bx, by - 8, 14, '255,180,84', .18); }
}
function drawWind(o){
  if(curG.stageIndex===3) return drawUpdraftsField(o);
  if(curG.stageIndex===7)return drawFrostFlow(o);
  const bx = WX(o.x - o.w / 2), by = WY(o.y), w = Math.round(o.w * Z), h = Math.round(o.h * Z), fx = Math.sign(o.forceX || 0), fy = -Math.sign(o.forceY || 0);
  ctx.fillStyle = themeName === 'frost' ? 'rgba(232,246,255,.35)' : 'rgba(224,214,190,.28)';
  for(let i = 0; i < 16; i++){ const h1 = hash(i, o.x | 0), h2 = hash(i, (o.y | 0) + 7), t = (time * (.5 + h1) * .5 + h2) % 1;
    const x = bx + (fx ? (fx > 0 ? t : 1 - t) * w : h1 * w), y = by + (fy ? (fy > 0 ? t : 1 - t) * h : h2 * h);
    ctx.fillRect(Math.round(x), Math.round(y), fx ? 6 : 1, fy && !fx ? 5 : 1); }
}

// ── Figures ───────────────────────────────────────────────────────────────
function drawFigure(px, py, st){
  const f = st.face || 1, pal = st.pal || FIGURE_PALS.hero, cyc = Math.sin((st.anim || 0) * 1.7);
  const sq = st.ghost ? -.2 : ((st.squash || 0) * .35 - (st.stretch || 0) * .25);
  ctx.save(); ctx.translate(px + 6, py + 22);
  if(st.dashing) ctx.scale(1.18, .86); else if(st.slam) ctx.scale(.84, 1.22); else ctx.scale(1 + sq, 1 - sq);
  if(st.down){ ctx.rotate(f * 1.35); ctx.translate(0, 6); }
  ctx.translate(-(px + 6), -(py + 22));
  if(st.hurt) ctx.globalAlpha = .45;
  const bob = st.run ? Math.round(Math.abs(cyc) * 1.5) : (!st.air && Math.sin((st.idle || 0) * 2.2) > .6 ? 1 : 0);
  const lean = st.run ? f : (st.dashing ? f * 2 : 0);
  if(!st.ghost && !st.air){ ctx.fillStyle = 'rgba(6,3,14,.35)'; ctx.fillRect(px + 1, py + 21, 11, 2); }
  const trail = st.ghost ? -f * 4 : Math.max(-4, Math.min(4, -(st.vx || 0) * .012)),
        lift = st.slam ? -4 : st.wall ? -3 : (st.air ? Math.max(-3, Math.min(3, (st.vy || 0) * .006)) : 0);
  const cl = st.ghost ? pal.cloakLit : pal.cloak, cd = st.ghost ? pal.cloakLit : pal.cloakDark, hd = st.ghost ? pal.cloak : pal.hood;
  for(let i = 0; i < 6; i++){ const w = 7 - (i > 3 ? i - 3 : 0), x = px + 3 + Math.round(trail * (i / 5)), y = py + 8 + i + Math.round(lift * (i / 5)); B(x - (f > 0 ? 0 : 1), y + bob, w, 1, i < 2 ? pal.cloakLit : (i > 4 ? cd : cl)); }
  const l1 = st.run ? Math.round(cyc * 2) : 0, l2 = st.run ? -Math.round(cyc * 2) : 0;
  if(st.wall){ B(px + 4, py + 16, 2, 5, hd); B(px + 7, py + 17, 3, 3, hd); }
  else if(st.air){ B(px + 4, py + 16, 2, 5, hd); B(px + 7, py + 15, 2, 4, hd); }
  else { B(px + 4 + l1 * f, py + 16, 2, 6 - Math.abs(l1) * .5 | 0, hd); B(px + 7 + l2 * f, py + 16, 2, 6 - Math.abs(l2) * .5 | 0, hd); }
  B(px + 3 + lean * .5, py + 9 + bob, 7, 8, cl); B(px + 3 + lean * .5, py + 9 + bob, 7, 1, pal.cloakLit); B(px + 5, py + 12 + bob, 3, 1, cd);
  B(px + 3, py + 14 + bob, 7, 1, pal.scarf);
  B(px + (f > 0 ? 1 : 9) + Math.round(trail * .6), py + 8 + bob, 3, 1, pal.scarf); B(px + (f > 0 ? 0 : 11) + Math.round(trail * .9), py + 9 + bob, 2, 1, pal.scarf);
  B(px + 2, py + 1 + bob, 9, 8, hd); B(px + 3, py + bob, 7, 1, hd); B(px + 2, py + 1 + bob, 1, 6, pal.cloakLit);
  if(!st.ghost){
    B(px + (f > 0 ? 5 : 3), py + 4 + bob, 5, 4, pal.skin);
    const eyeX = f > 0 ? px + 8 : px + 4; B(eyeX, py + 5 + bob, 1, 1, pal.eye); B(eyeX + (f > 0 ? -2 : 2), py + 5 + bob, 1, 1, pal.eye);
    if(st.wall){ const hx = st.wallDir > 0 ? px + 12 : px; B(hx, py + 9 + bob, 1, 3, pal.skin); }
    if(st.pack){const bx=px+(f>0?0:11);B(bx,py+9+bob,3,8,'#7498a0');B(bx,py+9+bob,3,1,'#c1d4bd');B(bx,py+17+bob,3,2,'#4d6671');}
    if(st.bow){
      const x=px+(f>0?13:0), y=py+11+bob;
      for(let i=-8;i<=8;i++) B(x+f*Math.round(Math.sqrt(Math.max(0,64-i*i))*.4),y+i,1,1,P.woodLit);
      B(x,y-8,1,17,'#d8c27a'); B(x-f*3,y,4,2,pal.skin);
      if(st.atkT>0){ B(x+(f>0?-5:-9),y,14,1,'#e5d19b'); B(x+f*8,y-1,2,3,P.blade); }
    }else if(st.blade){
      if(st.atkT > 0){
        const t = 1 - st.atkT, ang = (-1.1 + t * 2.2) * f, cx = px + 6 + f * 4, cy = py + 11 + bob;
        ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = P.bladeGlow; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 13, f > 0 ? -1.2 : Math.PI - 1.2, f > 0 ? ang : Math.PI - ang, f < 0); ctx.stroke(); ctx.lineWidth = 1; ctx.globalCompositeOperation = 'source-over';
        for(let i = 3; i < 15; i++) B(cx + Math.cos(ang) * i * f, cy + Math.sin(ang) * i, 1, 1, i > 12 ? P.eye : P.blade);
        B(cx, cy, 2, 2, P.amber);
      } else { const gx = px + (f > 0 ? 1 : 10), gy = py + 7 + bob; for(let i = 0; i < 7; i++) B(gx + (f > 0 ? i * -.3 : i * .3) | 0, gy + i, 1, 1, i % 3 === ((time * 6) | 0) % 3 ? P.eye : P.blade); }
    }
    if(st.slam){ B(px + 5, py + 20, 2, 10, P.blade); B(px + 4, py + 29, 4, 2, P.eye); B(px + 5, py + 16, 2, 4, P.amber); }
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
const heroAnim = { anim:0, idle:0, squash:0, stretch:0, wasGround:true, lastVy:0, ghosts:[] };
function heroState(p){
  const a = heroAnim;
  a.anim += dt * (Math.abs(p.vx) > 20 ? Math.abs(p.vx) / 20 : 0); a.idle += dt;
  if(!a.wasGround && p.onGround) a.squash = 1;
  if(a.lastVy >= -50 && p.vy < -250) a.stretch = 1;
  a.wasGround = p.onGround; a.lastVy = p.vy;
  a.squash *= Math.pow(.02, dt); a.stretch *= Math.pow(.02, dt);
  const dashing = p.dodgeTimer > 0;
  if(dashing || p.slamming) a.ghosts.push({ x:p.x, y:p.y, face:p.face, t:.22 });
  for(const g of a.ghosts) g.t -= dt; a.ghosts = a.ghosts.filter(g => g.t > 0);
  return {
    face:p.face, run:p.onGround && Math.abs(p.vx) > 20, air:!p.onGround, wall:!!p.onWall && !p.onGround, wallDir:p.wallDir || p.lastWallDir || 1,
    dashing, squash:a.squash, stretch:a.stretch, hurt:(p.hurtFlash > 0 || p.invuln > 0) && ((time * 20) | 0) % 2 === 1,
    slam:!!p.slamming, atkT:p.atkTimer > 0 ? Math.min(1, p.atkTimer / .22) : 0, blade:!!p.weapon, bow:p.weapon?.arche === 'bow', pack:!!p.hasJetpack, anim:a.anim, idle:a.idle, vx:p.vx, vy:p.vy, pal:p.gear?.chest?.mantle && p.gear.chest.name === 'Mothsilk Mantle' ? FIGURE_PALS.mothsilk : FIGURE_PALS.hero, down:!!(p.dead || p.downed),
  };
}
function drawHeroAt(p){
  for(const g of heroAnim.ghosts){ ctx.globalAlpha = g.t / .22 * .45;
    flipWrap(WY(g.y) - 22, 22, () => drawFigure(WX(g.x - 13), WY(g.y) - 22, { face:g.face, ghost:true, air:true, dashing:true })); }
  ctx.globalAlpha = 1;
  flipWrap(WY(p.y) - 22, 22, () => drawFigure(WX(p.x - 13), WY(p.y) - 22, heroState(p)));
  if(p.hasJetpack && p.fuel < 100){ const fx = WX(p.x) - 8, fy = WY(p.y) - 30; B(fx, fy, 16, 2, P.skyTop); B(fx, fy, Math.round(16 * Math.max(0, p.fuel) / 100), 2, P.amber); }
}
function drawResident(o, palKey){
  if(curG.stageIndex===8&&(o.courtKeeper||o.courtAction==='keeper')){
    const x=WX(o.x),y=WY(o.y||0),f=o.face||1;
    drawFigure(x-7,y-22,{face:f,idle:time+o.x,pal:{cloak:'#637b80',cloakLit:'#91a5a6',cloakDark:'#354b58',hood:'#283d49',scarf:COURT.brass,skin:'#d6bea2',eye:COURT.silver}});
    B(x-4,y-13,8,12,'#66716b');B(x-3,y-12,6,1,COURT.brass);pixelLimb(x+f*7,y-8,x+f*10,y-18,2,COURT.edge);B(x+f*10-2,y-20,5,4,COURT.brass);return;
  }
  if(curG.stageIndex===7&&o.profileId==='nim'){
    const x=WX(o.x),y=WY(o.y||0),f=o.face||1,moving=o.state==='follow'&&Math.abs(o.vx||0)>8;
    const pal={cloak:'#52788d',cloakLit:'#86a8b9',cloakDark:'#304d60',hood:'#23394b',scarf:FROST.warm,skin:'#d9c2a4',eye:FROST.light};
    drawFigure(x-7,y-22,{face:f,air:!o.onGround&&o.y>5,idle:time+o.x,anim:moving?time*9:0,vx:moving?o.vx:0,pal});
    B(x-5,y-16,10,3,FROST.ice);B(x+f*5-1,y-13,2,9,FROST.warm);
    const lx=x+f*11,ly=y-(o.done?8:13);pixelLimb(x+f*5,y-12,lx,ly-3,2,pal.skin);B(lx-3,ly,7,8,FROST.iron);B(lx-2,ly+1,5,5,FROST.warm);B(lx,ly+1,1,4,FROST.light);B(lx-1,ly-3,3,3,FROST.copper);
    glow(lx,ly+4,o.state==='follow'?44:29,'239,177,100',o.state==='follow'?.26:.17);
    if(o.state==='follow')for(let i=-4;i<=4;i++)B(x+i*5,y,3,1,'#968f7a');
    return;
  }
  if(curG.stageIndex===6&&o.gaolKeeper){
    const x=WX(o.x),y=WY(o.y||0),f=o.face||1;
    drawFigure(x-7,y-22,{face:f,air:false,idle:time+o.x,pal:FIGURE_PALS.ash});
    B(x-4,y-13,8,9,GAOL.cloth);B(x-3,y-12,6,1,GAOL.ironLit);
    // Enna holds the old key ring down at her side.
    const kx=x+f*8;B(kx-2,y-7,5,1,GAOL.brass);B(kx-2,y-6,1,3,GAOL.brass);B(kx+2,y-6,1,3,GAOL.brass);B(kx-1,y-3,3,1,GAOL.brass);
    B(kx,y-2,1,4,GAOL.brass);B(kx+1,y+1,2,1,GAOL.brass);return;
  }
  if(curG.stageIndex===5&&(o.keepKeeper||o.residentId==='keep-hearth-keeper')){
    const x=WX(o.x),y=WY(o.y||0),f=o.face||1;
    if(o.keepKeeper){
      drawFigure(x-7,y-22,{face:f,air:false,idle:time+o.x,pal:FIGURE_PALS.survey});
      B(x-4,y-13,8,11,'#664a34');B(x-3,y-12,6,1,'#b18a5b');B(x+9,y-15,2,12,'#796043');B(x+6,y-17,8,4,'#9c9c86');B(x-4,y-21,8,2,'#bd9c62');
      if(!o.met)nearGlow(o,'216,196,143',12);
    }else{
      B(x-7,y-8,14,7,'#554957');B(x-5,y-14,10,7,'#74616b');B(x-4,y-20,8,8,'#352d3f');B(x+1,y-17,3,4,'#bca38d');B(x-8,y-2,17,2,KEEP.dark);
      pixelLimb(x+3,y-8,x+11,y-5,2,'#bca38d');B(x+8,y-7,6,4,'#8c7261');B(x-8,y,4,2,KEEP.wood);B(x+5,y,4,2,KEEP.wood);
    }
    return;
  }
  if(o.type === 'ambientFigure' && !o.met && !o.quietV4) nearGlow(o, '216,196,143', 12);
  if(o.quietV4 && o.silhouette === 'huddled'){
    const bx = WX(o.x), by = WY(o.y || 0), p = FIGURE_PALS.ash;
    B(bx - 6, by - 10, 12, 8, p.cloakDark); B(bx - 4, by - 12, 8, 3, p.cloak);
    B(bx - 3, by - 17, 7, 7, p.hood); B(bx + 1, by - 14, 3, 3, p.skin);
    B(bx + 4, by - 7, 5, 5, p.cloak); B(bx - 7, by - 2, 16, 2, p.hood); return;
  }
  drawFigure(WX(o.x - 13), WY(o.y || 0) - 22, { face:o.face || (o.x < camX + bw / Z * .5 ? 1 : -1), air:false, idle:time + o.x, pal:FIGURE_PALS[palKey] || FIGURE_PALS.ash });
  if(curG.stageIndex===4 && o.questActor==='daro'){const x=WX(o.x),y=WY(o.y||0);B(x-4,y-13,8,11,'#786b51');B(x-4,y-13,8,2,WATCH.brass);for(let i=0;i<3;i++){pixelLimb(x-7+i*2,y-8,x-12+i*2,y-24,1,WATCH.wood);B(x-13+i*2,y-25,3,2,WATCH.light);}}
  if(curG.stageIndex === 2 && o.questActor === 'oren'){
    const x=WX(o.x), y=WY(o.y || 0); B(x-4,y-13,8,10,'#664a34'); B(x-3,y-12,6,1,'#b18a5b');
    B(x+9,y-15,2,12,'#796043'); B(x+6,y-17,8,4,'#9c9c86'); B(x-4,y-21,8,2,'#bd9c62');
  }
  if(o.profileId === 'mara'){ const x = WX(o.x), y = WY(o.y || 0); B(x + 4, y - 12, 7, 5, P.canvas); B(x + 5, y - 11, 4, 1, P.canvasDark); }
  if(curG.stageIndex === 1 && o.profileId === 'bram'){
    const x=WX(o.x)+9, y=WY(o.y || 0), lit=o.lampSettled || o.state==='follow' || o.state==='wait';
    B(x,y-17,1,5,P.woodLit); B(x-3,y-12,7,8,'#4c4c31'); B(x-2,y-11,5,5,lit?'#d5d6a0':'#8d8859'); B(x,y-11,1,5,P.moon);
    if(lit) glow(x,y-9,32,'203,221,151',.3);
  }
}

// ── Enemies ───────────────────────────────────────────────────────────────
function drawWalker(e, pal){
  const scale = (e.h || 38) / 38;
  if(scale > 1.15){
    const posed = Object.assign({}, e, { h:38 });
    ctx.save(); const ax = WX(e.x), ay = WY(e.y); ctx.translate(ax, ay); ctx.scale(scale, scale); ctx.translate(-ax, -ay);
    drawWalker(posed, pal); ctx.restore(); e._ra = posed._ra; e._drawX = posed._drawX; return;
  }
  const state = curG.stageIndex === 0 ? e.openingState : curG.stageIndex === 1 ? e.forestMode : curG.stageIndex === 4 ? e.watchState : '';
  const wind = state === 'windup' || state === 'warn' || state === 'strike-wind' || state === 'seed-wind', attack = state === 'commit' || state === 'rush' || state === 'strike' || state === 'lunge', rest = state === 'recover' || state === 'breathe' || state === 'seed-recover';
  const f = (wind || attack) ? (e.watchCommitDir || e.forestCommitDir || e.face || -1) : (e.face || -1), fl = e.hitFlash > 0, lean = wind ? -2 * f : attack ? 3 * f : rest ? f : 0;
  const bx = WX(e.x - 8), by = WY(e.y) - 19 + (wind || rest ? 2 : 0);
  const moved = e._drawX === undefined ? 0 : Math.min(10, Math.abs(e.x - e._drawX)); e._drawX = e.x;
  e._ra = (e._ra || 0) + (state ? moved : dt * Math.abs(e.vx || 0)) / 18;
  const cyc = wind || rest || state === 'pause' || state === 'watch' ? 0 : Math.sin(e._ra * 1.7);
  const body = fl ? P.ink : pal.body, dark = fl ? P.ink : pal.dark, lit = fl ? P.ink : pal.lit;
  ctx.fillStyle = 'rgba(6,3,14,.3)'; ctx.fillRect(bx + 2, by + 18, 12, 2);
  const l1 = Math.round(cyc * 2), l2 = -Math.round(cyc * 2), bob = Math.round(Math.abs(cyc));
  B(bx + 5 + l1 * f, by + 13, 3, 6 - (wind || rest ? 2 : 0), dark); B(bx + 9 + l2 * f, by + 13, 3, 6 - (wind || rest ? 2 : 0), dark);
  ctx.save(); ctx.translate(lean, 0);
  B(bx + 3, by + 6 + bob, 11, 8, body); B(bx + 3, by + 6 + bob, 11, 1, lit); B(bx + 3, by + 13 + bob, 11, 1, dark);
  B(bx + (f > 0 ? 12 : 1), by + 5 + bob, 3, 3, dark);
  B(bx + 4, by + bob, 9, 7, dark); B(bx + 5, by - 1 + bob, 7, 1, dark);
  B(bx + (f > 0 ? 7 : 5), by + 3 + bob, 5, 3, fl ? P.ink : pal.mask);
  B(bx + (f > 0 ? 9 : 7), by + 4 + bob, 1, 1, pal.eye);
  const cx = bx + (f > 0 ? 14 : 1), cy = by + 9 + bob;
  if(state === 'seed-wind'){
    // Resin swells in the raised hand while the target roots begin to push up.
    B(cx - 1, cy - 11, 3, 8, body); B(cx - 2, cy - 14, 5, 4, pal.drip || P.amber);
    B(cx, cy - 15, 1, 2, P.moon);
  }else if(wind){
    // Braced feet, a raised weapon and a lit metal edge precede commitment.
    B(cx - f * 6, cy - 12, 2, 12, P.wood); B(cx - f * 6 - 1, cy - 15, 4, 4, P.moon);
    B(cx - f * 4, cy - 6, 4, 3, body);
  }else if(attack){
    B(cx + (f > 0 ? 0 : -10), cy - 3, 11, 2, P.wood); B(cx + f * 10, cy - 4, 2, 4, T.stoneLit);
  }else { B(cx, cy + (rest ? 2 : 0), 1, rest ? 3 : 6, P.wood); B(cx - (f > 0 ? 0 : 1), cy - (rest ? 0 : 3), 2, 3, T.stoneLit); }
  if(e.frontShield){
    const sf = e.shieldFace || f, sx = bx + (sf > 0 ? 13 : -2);
    B(sx,by+6,5,10,'#6c694c'); B(sx+(sf>0?3:0),by+7,2,8,'#b2a77d'); B(sx+1,by+10,3,2,'#d3c69a');
  }
  ctx.restore();
  if(curG.stageIndex === 1 && state === 'seed-wind' && Number.isFinite(e.forestAimX)){
    const x = WX(e.forestAimX), y = WY(e.forestAimY || 0), rise = 2 + Math.round((1 - Math.min(1,(e.forestTimer || 0)/.92))*4);
    for(const dx of [-18,-7,7,18]) pixelLimb(x+dx,y,x+dx+(dx<0?3:-3),y-rise,2,'#ba9958');
    B(x-20,y,40,1,'#5b6338');
  }
  if(pal.drip && Math.random() < dt * 6 && curG) curG.particles.push({ x:e.x + (Math.random() - .5) * 20, y:curEnv.GROUND_Y - e.y - 6, vx:0, vy:30, sz:2, color:pal.drip, life:.5 });
}
/* THE CROWNGUARD — the "blob". He is the dominant body of the whole late game (both
   authored regions plus eight more from the Muster roster) and he had no respec drawer
   at all: he fell through to the legacy vector `drawEnemyFull`, which is why he reads as
   a soft purple oval against pixel-art masonry. He is a spent household soldier of the
   Citadel: plate over a stooped frame, a front shield when he carries one, and the
   crown-mark on his pauldron gone cold. Shield facing and the awareness tell stay
   readable, because they are gameplay information and not decoration. */
function drawCrownguard(e){
  const W = Math.max(6, Math.round(e.w * Z)), H = Math.max(10, Math.round(e.h * Z));
  const bx = WX(e.x) - (W >> 1), by = WY(e.y) - H, f = e.face || 1, fl = e.hitFlash > 0;
  const PLATE = '#43326b', LIT = '#6a5490', DARK = '#241a3c', CLOTH = '#2e2140', GOLD = '#b8975a';
  const K = (x, y, w, h, c) => B(bx + x, by + y, Math.max(1, w), Math.max(1, h), fl ? P.ink : c);
  ctx.fillStyle = 'rgba(6,4,12,.42)'; ctx.fillRect(bx + 2, by + H - 1, W - 4, 2);
  // legs: a stoop, not a float — the legacy blob had no feet at all
  K(Math.round(W * .24), Math.round(H * .70), Math.round(W * .18), Math.round(H * .30), DARK);
  K(Math.round(W * .58), Math.round(H * .70), Math.round(W * .18), Math.round(H * .30), DARK);
  // cloth skirt over the greaves
  K(Math.round(W * .18), Math.round(H * .56), Math.round(W * .64), Math.round(H * .18), CLOTH);
  // cuirass
  K(Math.round(W * .16), Math.round(H * .26), Math.round(W * .68), Math.round(H * .32), PLATE);
  K(Math.round(W * .16), Math.round(H * .26), Math.round(W * .68), Math.max(1, Math.round(Z * 2)), LIT);
  // the crown-mark, gone cold on a spent guard
  K(Math.round(W * .38), Math.round(H * .36), Math.round(W * .24), Math.max(1, Math.round(Z * 3)), GOLD);
  // head and helm
  K(Math.round(W * .32), Math.round(H * .08), Math.round(W * .36), Math.round(H * .20), DARK);
  K(Math.round(W * .30), Math.round(H * .06), Math.round(W * .40), Math.max(1, Math.round(Z * 3)), LIT);
  K(Math.round(W * (f < 0 ? .36 : .56)), Math.round(H * .16), Math.max(1, Math.round(Z * 3)), Math.max(1, Math.round(Z * 3)),
    e.active ? '#ff661a' : '#6a5490');
  // A FRONT SHIELD IS GAMEPLAY INFORMATION: drawn on the side it actually guards, so
  // "get behind him" stays readable at a glance.
  if(e.frontShield && !e.shieldBroken){
    const sf = e.shieldFace || f, sx = sf < 0 ? -Math.round(Z * 5) : W - Math.round(Z * 3);
    K(sx, Math.round(H * .22), Math.max(2, Math.round(Z * 8)), Math.round(H * .44), '#8f7ab8');
    K(sx, Math.round(H * .22), Math.max(2, Math.round(Z * 8)), Math.max(1, Math.round(Z * 2)), '#d8c48f');
    glow(bx + sx + Math.round(Z * 4), by + Math.round(H * .44), Math.round(14 * Z), '216,196,143', .22);
  }
}
function drawShadeling(e){
  const forest = curG.stageIndex === 1, mode = forest ? e.forestMode : '';
  if(mode === 'veil'){
    const t = Math.min(1, e.forestFade || 0), x = WX(e.x), y = WY(e.y);
    alphaWrap(1-t, () => { B(x-5,y-17+t*12,10,14*(1-t),P.shadeDark); B(x-3,y-13+t*10,2,1,P.shadeLit); B(x+2,y-13+t*10,2,1,P.shadeLit); });
    if(Number.isFinite(e.forestTeleportX)){
      const tx=WX(e.forestTeleportX), ty=WY(e.forestTeleportY ?? e.y);
      B(tx-8,ty-1,16,2,P.shadeDark); B(tx-4,ty-2-t*4,2,1,P.shadeLit); B(tx+3,ty-2-t*4,2,1,P.shadeLit);
    }
    return;
  }
  if(curG.stageIndex === 0 && e.openingState === 'vanish'){
    const x = WX(e.openingTeleportX ?? e.x), y = WY(e.y), t = 1 - Math.min(1, (e.openingTimer || 0) / .68);
    glow(x, y - 3, 20, '138,92,255', .16 + t * .2);
    B(x - 8, y - 2, 16, 2, P.shadeDark); B(x - 4, y - 3 - t * 5, 2, 2, P.shadeLit); B(x + 3, y - 3 - t * 5, 2, 2, P.shadeLit);
    return;
  }
  const wind = mode === 'strike-wind', rest = mode === 'recover', f = e.face || 1;
  const bx = WX(e.x - 8) + (wind ? -f*2 : mode === 'lunge' ? f*4 : 0), by = WY(e.y) - 20 + (wind || rest ? 3 : Math.round(Math.sin(time * 3 + e.x) * 2)), fl = e.hitFlash > 0;
  glow(bx + 8, by + 9, 24, '138,92,255', rest ? .16 : wind ? .6 : .35);
  const body = fl ? P.ink : P.shade, dark = fl ? P.ink : P.shadeDark;
  B(bx + 4, by + 2, 8, 12, body); B(bx + 2, by + 5, 12, 6, body); B(bx + 5, by, 6, 3, body);
  B(bx + 4, by + 12, 8, 3, dark); for(let i = 0; i < 4; i++){ const tw = Math.sin(time * 6 + i) > 0 ? 1 : 0; B(bx + 3 + i * 3, by + 14 + tw + (i % 2), 2, 2 + (i % 2), dark); }
  B(bx + 5, by + 5, 2, 2, P.shadeLit); B(bx + 9, by + 5, 2, 2, P.shadeLit); B(bx + 6, by + 6, 1, 1, P.stoneLine); B(bx + 10, by + 6, 1, 1, P.stoneLine);
}
function drawFlyer(e, col, lit){   // moth-bat: body + flapping wings, tinted per type
  const mode = curG.stageIndex === 1 ? e.forestMode : '', wind = mode === 'dive-mark', dive = mode === 'dive';
  const bx = WX(e.x), by = WY(e.y) - Math.round(e.h * Z / 2), fl = e.hitFlash > 0, w = wind ? 1 : Math.sin(time * (mode === 'rise' ? 7 : 14) + e.x) > 0 ? 1 : 0, c = fl ? P.ink : col;
  if(dive){
    B(bx-2,by-5,4,9,c); B(bx-1,by+4,2,3,lit);
    pixelLimb(bx-2,by-2,bx-6,by-7,2,c); pixelLimb(bx+2,by-2,bx+6,by-7,2,c);
    B(bx-1,by+1,2,1,P.moon); return;
  }
  if(wind){ B(bx-4,by+3,8,1,P.amber); B(bx-2,by+4,4,1,P.moon); }
  B(bx - 3, by - 2, 6, 5, c); B(bx - 2, by - 3, 4, 1, c); B(bx - 1, by - 1, 1, 1, P.ink); B(bx + 1, by - 1, 1, 1, P.ink);
  for(let i = 1; i <= 6; i++){ const dy = w ? -Math.round(i * .6) : Math.round(i * .4); B(bx - 3 - i, by - 1 + dy, 1, 3 - (i > 4 ? 1 : 0), i % 2 ? c : (fl ? P.ink : lit)); B(bx + 2 + i, by - 1 + dy, 1, 3 - (i > 4 ? 1 : 0), i % 2 ? c : (fl ? P.ink : lit)); }
}
function drawHound(e){
  const bx = WX(e.x - 10), by = WY(e.y) - 14, f = e.face || -1, fl = e.hitFlash > 0;
  e._ra = (e._ra || 0) + dt * Math.abs(e.vx || 0) / 14; const cyc = Math.sin(e._ra * 2), body = fl ? P.ink : '#6a48a0', dark = fl ? P.ink : '#3a2560';
  ctx.fillStyle = 'rgba(6,3,14,.3)'; ctx.fillRect(bx + 2, by + 13, 18, 2);
  glow(bx + 10, by + 6, 20, '131,88,184', .25);
  B(bx + 2, by + 4, 17, 6, body); B(bx + 2, by + 4, 17, 1, fl ? P.ink : '#9a78d0');
  B(bx + 4 + Math.round(cyc * 2), by + 10, 2, 4, dark); B(bx + 8 - Math.round(cyc * 2), by + 10, 2, 4, dark); B(bx + 12 + Math.round(cyc * 2), by + 10, 2, 4, dark); B(bx + 16 - Math.round(cyc * 2), by + 10, 2, 4, dark);
  const hx = f > 0 ? bx + 17 : bx - 2; B(hx, by + 1, 6, 5, body); B(hx + (f > 0 ? 4 : 0), by + 3, 2, 1, '#ff6a4a'); B(hx + (f > 0 ? 1 : 3), by - 1, 2, 2, dark);
  B(f > 0 ? bx - 2 : bx + 20, by + 3 + Math.round(Math.sin(time * 8) * 2), 4, 1, dark);
}
function drawGargoyle(e){
  const bx = WX(e.x), by = WY(e.y) - 8 + Math.round(Math.sin(time * 2 + e.x) * 2), fl = e.hitFlash > 0, c = fl ? P.ink : T.stoneLit, d = fl ? P.ink : T.stoneDark, w = Math.sin(time * 5 + e.x) > 0 ? 2 : 0;
  B(bx - 5, by - 4, 10, 9, c); B(bx - 4, by - 6, 8, 2, c); B(bx - 3, by - 3, 2, 2, P.amber); B(bx + 1, by - 3, 2, 2, P.amber);
  B(bx - 6, by + 1, 2, 4, d); B(bx + 4, by + 1, 2, 4, d);
  for(let i = 1; i <= 7; i++){ B(bx - 5 - i, by - 2 - (i > 3 ? i - 3 : 0) + w, 1, 4, i % 2 ? c : d); B(bx + 4 + i, by - 2 - (i > 3 ? i - 3 : 0) + w, 1, 4, i % 2 ? c : d); }
}
function drawMote(e, rgb, col){   // storm motes and sparklings: a charged core with orbiting sparks
  const bx = WX(e.x), by = WY(e.y) - Math.round(e.h * Z / 2), fl = e.hitFlash > 0;
  glow(bx, by, 22, rgb, .4);
  B(bx - 3, by - 1, 6, 3, fl ? P.ink : col); B(bx - 1, by - 3, 3, 7, fl ? P.ink : col); B(bx - 1, by - 1, 2, 2, '#ffffff');
  for(let i = 0; i < 3; i++){ const a = time * 7 + i * 2.1; B(bx + Math.cos(a) * 7, by + Math.sin(a) * 4, 1, 1, '#ffffff'); }
}

function drawAwareness(e){   // patrol perception: amber while suspicious, red once you are seen (stage 0 / 1 rules)
  const aware = e.openingAwareness || e.forestAwareness; if(!aware || aware === 'idle' || aware === 'unaware' || e.openingIntangible || e.forestMode === 'veil') return;
  ctx.save();
  if(curG.stageIndex === 0 && e.encounterRole === 'upper-sentry'){ ctx.beginPath(); ctx.rect(0, 0, bw, Math.max(0, WY(e.y - 76))); ctx.clip(); }
  const range = W2(e.noticeRange || 380), dir = e.face || 1, ox = WX(e.x + dir * 10), oy = WY(e.y) - W2(e.h * .55);
  ctx.globalAlpha = aware === 'alert' ? .2 : aware === 'suspicious' ? .14 : .1; ctx.fillStyle = aware === 'alert' ? '#ff5e54' : aware === 'suspicious' ? '#ffd76a' : '#ff9e62';
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + dir * range, oy - range * .62); ctx.lineTo(ox + dir * range, oy + range * .62); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  if(e.openingState === 'warn'){ stepArc(WX(e.x), WY(e.y) - W2(e.h * .55), 14, '#ffcf72', 1); }
  ctx.restore();
}
function drawBruteFigure(e){
  const W=W2(e.w), H=W2(e.h), mode=e.bruteState || '', broken=!!e.bruteArmorBroken, flash=e.hitFlash>0;
  const wind=mode==='windup'||mode==='rushWind', charging=mode==='charge'||mode==='rush', slam=mode==='slamWind', rest=mode==='recover', transforming=mode==='transform';
  const f=(wind||charging) ? (e.bruteChargeDir || e.face || -1) : (e.face || -1);
  const sleep=mode==='dormant'||e.bruteDormant, wake=mode==='wake'?Math.max(0,(e.bruteWakeT || 0)/1.05):0;
  const crouch=sleep?H*.3:wake?H*.3*wake:transforming?H*.22:wind?H*.12:rest?H*.1:0;
  const lean=wind?-f*3:charging?f*7:rest?f*2:0, bx=WX(e.x)-W/2, foot=WY(e.y), by=foot-H+crouch;
  const moved=e._drawX===undefined?0:Math.min(16,Math.abs(e.x-e._drawX)); e._drawX=e.x; e._ra=(e._ra || 0)+moved/17;
  const walk=!sleep&&!wind&&!rest&&!slam&&!transforming?Math.round(Math.sin(e._ra*2)*3):0;
  const skin=flash?P.ink:broken?'#c8653a':'#8a5438', dark=flash?P.ink:'#573526', lit=flash?P.ink:'#e69a64', shell=flash?P.ink:'#655049', rim=flash?P.ink:'#ba895d';
  const K=(x,y,w,h,c)=>B(bx+x+lean,by+y,w,h,c);
  B(bx-2,foot-1,W+4,3,'#241713');
  B(bx+W*.23+walk,foot-H*.22,W*.18,H*.22,dark); B(bx+W*.59-walk,foot-H*.22,W*.18,H*.22,dark);
  K(W*.13,H*.28,W*.74,H*.47-crouch*.4,skin); K(W*.15,H*.28,W*.68,2,lit); K(W*.14,H*.65-crouch*.4,W*.7,4,dark);
  K(W*.34,H*.06,W*.36,H*.25,dark); K(W*.37,H*.04,W*.28,2,skin);
  K(f>0?W*.55:W*.38,H*.15,3,sleep?1:2,sleep?'#6e5640':wind||slam?'#fff0ba':'#ffb454');
  for(const side of [-1,1]){
    const ax=side<0?W*.02:W*.77, raised=slam?H*.3:0, armY=H*.3-raised+(rest?H*.12:0);
    K(ax,armY,W*.22,H*.33,skin); K(ax,armY,W*.22,2,lit);
    K(ax-(charging&&side===f?f*-3:0),slam?-H*.02:H*.58-raised+(rest?H*.06:0),W*.23,H*.14,dark);
  }
  if(!broken){
    K(W*.06,H*.25,W*.22,H*.24,shell); K(W*.73,H*.25,W*.22,H*.24,shell);
    K(W*.18,H*.32,W*.64,H*.32,shell);
    for(let i=0;i<3;i++){ K(W*.15,H*(.34+i*.1),W*.7,2,rim); K(W*.23,H*(.34+i*.1),2,2,'#e0b982'); K(W*.72,H*(.34+i*.1),2,2,'#e0b982'); }
    K(W*.06,H*.25,W*.22,2,rim); K(W*.73,H*.25,W*.22,2,rim);
  }else{
    for(let i=0;i<3;i++){K(W*.34+(i%2)*3,H*.33+i*4,2,4,'#ffb454'); K(W*.61-(i%2)*3,H*.4+i*4,2,3,'#e98a45');}
  }
  if(transforming){
    const t=1-Math.min(1,(e.bruteTransformT || 0)/1.15);
    for(let i=0;i<6;i++){const side=i%2?1:-1, x=WX(e.x)+side*(W*.35+t*(14+i*3)), y=foot-H*.6-t*16+t*t*34+i*3; B(x,y,5+i%2,3,shell); B(x,y,5,1,rim);}
  }
  if(wind){ const heel=bx+(f>0?2:W-3); B(heel,foot-1,3,1,'#b18a62'); B(heel-f*5,foot-2,2,1,'#8c6547'); }
  if(!sleep && (broken || wind)) glow(WX(e.x)+lean,by+H*.4,22,broken?'224,121,74':'201,148,94',wind?.2:.09);
}
function drawCausewayAOE(a){
  if(curG.stageIndex!==2 || a.type!=='slam') return false;
  const x=WX(a.x), y=WY(a.y || 0), r=W2(a.r), hit=!!a.hit;
  const q=hit?Math.max(0,Math.min(1,(a.life || 0)/.3)):Math.max(0,Math.min(1,1-(a.t || 0)/(a.t0 || .78)));
  const edge=hit?'#ffd3a0':'#c48c59', radius=hit?r*(1.1-q*.2):r;
  alphaWrap(hit?q:.65,()=>{for(let dx=-radius;dx<=radius;dx+=2){const dy=Math.sqrt(Math.max(0,radius*radius-dx*dx))*.22; B(x+dx,y-dy,2,1,edge); B(x+dx,y+dy,2,1,edge);}
    for(let i=0;i<12;i++){const dx=(i/11-.5)*r*1.6; B(x+dx,y-1-Math.sin(i*2)*q*4,2,2,hit?'#eeb784':'#896044');}
  }); return true;
}
/* THE EMBER COLOSSUS. A furnace that learned to walk: a plated body with a molten
   core seam whose light is the fight's clock. The seam banks shut as armour when a
   forged slug lands (forgeStunT) and flares open when it is about to rush. */
function drawSlagBlock(o){
  const w = Math.round(o.w * Z), h = Math.round(o.h * Z);
  const bx = WX(o.x) - (w >> 1), by = WY(o.y) - h;
  const falling = o.state === 'falling', warn = o.state === 'warn', landed = o.state === 'landed';
  if(o.state === 'idle' && !o.slagCycle) return;
  if(o.state === 'idle'){                                     // still in the roof, gathering
    glow(bx + w / 2, by + h, w * .5, '255,120,50', .10); return;
  }
  const hot = falling || warn;
  B(bx, by, w, h, hot ? '#5a2a18' : '#3a2620');
  B(bx, by, w, 3, hot ? '#ff8a3a' : '#7d5642');
  for(let i = 0; i < 6; i++){
    const hx = (hash(i, o.x) * (w - 6)) | 0, hy = (hash(i, 3) * (h - 4)) | 0;
    B(bx + hx, by + hy, 3, 2, hot ? '#e0561f' : '#241713');
  }
  if(warn){ glow(bx + w / 2, by + h * 1.6, w, '255,140,60', .3 + .16 * Math.sin(time * 26)); }
  if(falling) for(let k = 1; k < 7; k++) B(bx + 2, by + h + k * 4, w - 4, 2, 'rgba(255,138,74,' + (.4 - k * .05) + ')');
  if(landed){ B(bx, by + h - 2, w, 2, '#1a0d09'); glow(bx + w / 2, by + h, w * .6, '255,110,50', .12); }
}
function drawForgeCoolantV4(o){
  const W = Math.round((o.w || 82) * Z), H = Math.round((o.h || 116) * Z);
  const bx = WX(o.x) - (W >> 1), by = WY(o.y) - (H >> 1);
  B(bx, by, W, H, '#241611'); B(bx, by, W, 3, '#7d5642'); B(bx, by + H - 3, W, 3, '#3a241c');
  for(let y = 6; y < H - 6; y += 7) B(bx + 3, by + y, W - 6, 1, 'rgba(255,255,255,.05)');
  // A GAUGE, NOT A MACHINE. The wet-forge circuit this panel used to run is gone, and
  // its hot / wet-latch / mouth-highlight states went with it. What is left is the
  // one thing the fight still needs from it: eight refusals, counted, in cold light.
  const need = 8, done = Math.floor((o.boss && o.boss.forgeQuenches) || 0);
  const step = Math.max(6, (W - 8) / need);
  for(let i = 0; i < need; i++)
    B(bx + 4 + i * step, by + H - 11, 5, 5, i < done ? '#bfeaff' : '#4a3228');
  B(bx + 3, by + H - 13, W - 6, 1, '#3a241c');
  glow(bx + W / 2, by + H * .48, W * .8, '255,140,70', .10);
}
/* IT STANDS BEHIND THE BENCH. Drawn at 2.2x on the layer beneath the casting bed,
   so the player works on top of the thing that is reaching over them — a smith at a
   bench, not a brown box among brown boxes. Collision, contact and AI are untouched:
   this changes where it is DRAWN, not where it is. */
function drawColossusFigure(e){
  const SC = 2.2;
  const W = Math.round(e.w * Z * SC), H = Math.round(e.h * Z * SC), f = e.face || -1;
  const bx = WX(e.x) - (W >> 1), by = WY(e.y) - H;
  const fl = e.hitFlash > 0, cooling = (e.forgeStunT || 0) > 0;
  const arm = Math.max(0, Math.min(1, e.forgeArmY || 0));
  const stuck = e.forgeArmStuck != null && (e.exposeT || 0) > 0;
  const wind = arm > 0 || stuck;
  const spent = e.forgeBeat === 'last' || e.forgeDump;
  // DARK IRON, and nothing on it is lit except the seam and the lip of what it
  // pours. The old body carried a 1.5x amber halo all fight, which is why every
  // real tell in the pit had to compete with the boss for the same colour.
  const plate = '#4c3b33', plateLit = '#836a5c', plateDark = '#241a16';
  const core = cooling ? '#6d3a24' : spent ? '#4a2a1e' : wind ? '#fff0b8' : '#ff8a2a';
  const K = (x, y, w, h, c) => B(bx + x, by + y, w, h, c);
  ctx.fillStyle = 'rgba(6,3,14,.5)'; ctx.fillRect(bx + 4, by + H - 2, W - 8, 4);
  B(bx - 1, by + H * .16, 2, H * .62, fl ? '#ffffff' : plateLit); B(bx + W - 1, by + H * .16, 2, H * .62, fl ? '#ffffff' : plateLit);
  const stride = Math.abs(e.vx) > 8 ? Math.sin(time * 6) * 4 : 0;
  K(W * .18 + stride, H * .70, W * .22, H * .30, plateDark);
  K(W * .60 - stride, H * .70, W * .22, H * .30, plateDark);
  K(W * .08, H * .22, W * .84, H * .50, plate);
  K(W * .08, H * .22, W * .84, 3, plateLit);
  for(const band of [.36, .54]) K(W * .08, H * band, W * .84, 3, plateDark);
  // The seam IS the health bar, worn on the body: a furnace mouth that closes to a
  // hairline across eight refusals, countable in greyscale from either end of the pit.
  const heat = Math.max(0, 1 - (e.forgeQuenches || 0) / 8);
  const seamH = cooling ? 3 : spent ? 2 : Math.max(2, Math.round(H * (.025 + .095 * heat) * (wind ? 1.4 : 1)));
  K(W * .24, H * .42 - seamH / 2, W * .52, seamH, fl ? '#ffffff' : core);
  // A hit rims the silhouette. Flashing every plate white at this size replaced the
  // machine with a white wall and took the seam — its health bar — with it.
  if(fl){ B(bx + W * .06, by + H * .20, W * .88, 2, '#ffffff'); B(bx + W * .06, by + H * .72, W * .88, 2, '#ffffff');
    B(bx + W * .26, by, W * .48, 2, '#ffffff'); }
  if(!cooling && !spent){
    glow(bx + W / 2, by + H * .42, W * (wind ? .7 : .42), '255,150,60', wind ? .34 : .18);
    for(let i = 0; i < (wind ? 4 : 2); i++)
      B(bx + W * .3 + hash(i, 7) * W * .4, by + H * .42 - (time * 30 + i * 11) % 30, 2, 2, '#ffcf82');
  }
  K(W * .28, H * .02, W * .44, H * .20, plateDark);
  K(W * .28, H * .02, W * .44, 3, plateLit);
  K(f > 0 ? W * .50 : W * .32, H * .10, W * .18, 4, cooling ? '#7a4a34' : spent ? '#5a3a2a' : '#ffb454');
  if(e.forgeAiming && (e.forgeAimT || 0) > 0){
    const tx = WX(curG.p.x), ty = WY(curG.p.y + 20);
    alphaWrap(.5, () => { const sx = bx + W / 2, sy = by + H * .42, n = 9;
      for(let i = 1; i < n; i += 2) B(sx + (tx - sx) * i / n, sy + (ty - sy) * i / n, 2, 2, '#ffcf72'); });
  }
  if(spent) for(let i = 0; i < 4; i++) B(bx + W * (.14 + i * .2), by + H * (.26 + i * .1), Math.max(3, W * .1), 2, '#3a241c');
  // PHASE 3: three chest plates over the core, each rimmed in the colour of the verb
  // that breaks it — lilac for the counter, cyan for the portals, amber for the
  // strike from above. A broken one shows the furnace behind it.
  if(e.forgeAct === 3 && e.plates){
    const keys = ['counter', 'portal', 'strike'], rims = ['#f1d6ff', '#8fe0ff', '#ffb454'];
    for(let i = 0; i < 3; i++){
      const px = W * (.14 + i * .26), pw = Math.max(5, W * .2), py = H * .28, ph = Math.max(5, H * .16);
      if(e.plates[keys[i]]){
        K(px, py, pw, ph, '#2a130c');
        K(px + pw * .2, py + ph * .3, pw * .6, Math.max(2, ph * .4), '#ff8a2a');
        glow(bx + px + pw / 2, by + py + ph / 2, pw, '255,138,42', .25);
      }else{
        K(px, py, pw, ph, plateLit); K(px + 1, py + 1, pw - 2, ph - 2, plate);
        K(px, py, pw, 1, rims[i]); K(px, py + ph - 1, pw, 1, rims[i]);
        K(px, py, 1, ph, rims[i]); K(px + pw - 1, py, 1, ph, rims[i]);
      }
    }
  }
}
/* THE SHAFT'S OWN TELLS (phases 2 and 3). The ladle-hand's pours use the region's
   chevron grammar: a gathering mark over the column for a second, then the column
   from the hand down to the metal. The valve at the top glows until it is cracked,
   and the crane's hook hangs on a chain from its jib. */
function drawColossusShaftExtras(G){
  for(const o of G.obstacles){
    if(o.colossusValve && !o.gone){
      const x = WX(o.x), y = WY(o.y);
      glow(x, y - 4, 26, '255,176,80', .35 + .15 * Math.sin(time * 5));
      for(let i = 0; i < 8; i++){ const a = i / 8 * 6.283 + time * 1.5; B(x + Math.round(Math.cos(a) * 7), y - 8 + Math.round(Math.sin(a) * 5), 2, 2, '#ffcf72'); }
      B(x - 2, y - 10, 4, 4, '#fff0b8');
    }
    if(o.craneHook){
      const jy = WY(480), jx0 = WX(12980), jx1 = WX(13920);
      B(jx0, jy, jx1 - jx0, 3, '#6a574b'); B(jx0, jy + 3, jx1 - jx0, 1, '#2a1f19');
      for(let x = jx0; x < jx1; x += 12) B(x, jy - 3, 2, 3, '#4c3b33');
      const hx = WX(o.x), hy = WY(o.y);
      B(hx - 5, jy, 10, 4, '#836a5c');                                    // trolley
      for(let y = jy + 4; y < hy - 2; y += 4) B(hx - 1, y, 2, 2, '#9a8472');   // chain
      if(o.hookState && o.hookState !== 'park' && o.hookState !== 'home') glow(hx, hy - 4, 18, '255,207,114', .25);
    }
  }
  // THE METAL, FELT BEFORE IT IS SEEN. The frame puts the knight low on screen, so
  // the rising metal is out of view until it is nearly at your feet. A heat wash
  // on the bottom edge grows as it closes, from 450 units away.
  const fb = G.boss;
  if(fb && !fb.dead && fb.colossusForge && fb.forgeAct === 2 && fb.ascent && G.p){
    const gap = G.p.y - fb.ascent.lava, k = Math.max(0, Math.min(1, 1 - gap / 450));
    if(k > 0){ for(let i = 0; i < 24; i++){ alphaWrap(k * .5 * (1 - i / 24), () => B(0, bh - 1 - i * 2, bw, 2, i < 6 ? '#ff6a1a' : '#b8401a')); } }
  }
  for(const q of G.colossusPours || []){
    // Clamped into the frame: its hand is often above the top of the view, and a
    // warning drawn off-screen is no warning.
    const x = WX(q.x), top = Math.max(18, WY(q.top)), bot = WY(q.bottom || 0);
    if(q.warn > 0){
      const k = 1 - Math.max(0, Math.min(1, q.warn));
      for(let c = 0; c < 3; c++){ const cy = top + 6 + c * 7 + Math.round(((time * 2) % 1) * 3);
        for(let i = 0; i < 5; i++) B(x - 8 + i * 4, cy + Math.abs(i - 2) * 2, 4, 2, c ? '#ffb454' : '#fff0b8'); }
      alphaWrap(.25 + .45 * k, () => { for(let y = top + 28; y < bot; y += 6) B(x - 1, y, 2, 3, '#ff8a3a'); });
    }else if(q.pour > 0){
      B(x - 5, top, 10, bot - top, '#e0561f'); B(x - 3, top, 6, bot - top, '#ff8a3a'); B(x - 1, top, 2, bot - top, '#ffd98a');
      glow(x, bot - 4, 30, '255,140,60', .4);
      for(let i = 0; i < 4; i++) B(x - 10 + hash(i, Math.floor(time * 20)) * 20, bot - 3 - (i % 2) * 2, 3, 3, '#ffcf72');
    }
  }
}
/* OVER THE TOP, never up from underneath. The shoulder rises, a boom reaches across
   the bench, and the ladle comes down into the bay from the player's own side — so
   the tell and the threat occupy the same piece of air. A jammed arm STAYS in the
   mould for the whole expose window: that is the opening a refusal buys, and it is
   on the bed, where the player already is. */
function drawColossusArm(e){
  const SC = 2.2, W = Math.round(e.w * Z * SC), H = Math.round(e.h * Z * SC), f = e.face || -1;
  const bx = WX(e.x) - (W >> 1), by = WY(e.y) - H;
  const plate = '#4c3b33', plateLit = '#836a5c', plateDark = '#241a16';
  const arm = Math.max(0, Math.min(1, e.forgeArmY || 0));
  const stuck = e.forgeArmStuck != null && (e.exposeT || 0) > 0;
  const tgt = stuck ? { x:e.forgeArmStuck } : (e.forgeTargetBed || e.forgeHammerBed);
  const shX = bx + (f > 0 ? W * .78 : W * .10), shY = by + H * .24;
  const ext = stuck ? 1 : arm;
  if(ext <= 0 || !tgt) return;
  const bedY = WY(130), topY = Math.min(shY - 10, bedY - 46), tipX = WX(tgt.x);
  B(shX - 4, topY, 9, shY - topY + 6, plate); B(shX - 4, topY, 9, 3, plateLit);
  const reachX = shX + (tipX - shX) * ext;
  const x0 = Math.round(Math.min(shX, reachX)), x1 = Math.round(Math.max(shX, reachX));
  B(x0, topY, Math.max(4, x1 - x0), 7, plate); B(x0, topY, Math.max(4, x1 - x0), 2, plateLit);
  const dropY = topY + (bedY - topY) * ext;
  B(reachX - 5, topY, 11, Math.max(2, dropY - topY), plate);
  B(reachX - 8, dropY - 9, 17, 10, plateDark); B(reachX - 8, dropY - 9, 17, 2, plateLit);
  B(reachX - 7, dropY - 3, 15, 3, stuck ? '#bfeaff' : '#ffd98a');
  glow(reachX, dropY - 2, stuck ? 16 : 24, stuck ? '191,234,255' : '255,170,90', .3 * ext);
  if(stuck) for(let i = 0; i < 3; i++) B(reachX - 6 + i * 5, dropY - 14 - ((time * 26 + i * 7) % 12), 2, 3, '#dff8ff');
  else for(let i = 0; i < 4; i++) B(reachX - 2, dropY + 2 + i * 3, 3, 2, '#ff9a3a');
}
/* THE VOID TYRANT. The fight's whole readout is a height — which band you are
   answering — and that height lived only on the walls, in legacy vector text that
   the pixel path never drew. Put it on the BODY: greaves, cuirass and crown are
   three physically distinct pieces at the three band heights, the live one is lit
   and the answered ones are cold, so the target is the thing you are looking at. */
/* THE ABYSS KING — his own figure, because the last boss in the game was falling
   through to the generic one. Everything the fight measures is ON HIM:
     · the CROWN is his phase counter — five points, spent left to right as he fractures;
     · the side he will blink to is a lit shoulder, held for the whole warning window,
       so "more telegraphed, less random" is something you can see rather than trust;
     · the throne-light behind him dims a step per phase, so the room reads the fight
       even when he is off-centre. */
function drawKingFigure(e){
  const SC = 1.7, W = Math.round(e.w * Z * SC), H = Math.round(e.h * Z * SC), f = e.face || -1;
  const bx = WX(e.x) - (W >> 1), by = WY(e.y) - H, fl = e.hitFlash > 0;
  const phase = Math.max(0, Math.min(4, (e.echoRound || e.phase || 1) - 1));
  const ROBE = '#241638', LIT = '#4b3170', DARK = '#140a22', GOLD = '#ffd700', SPENT = '#4a3f2a';
  const K = (x, y, w, h, c) => B(bx + x, by + y, w, h, c);
  ctx.fillStyle = 'rgba(4,2,10,.5)'; ctx.fillRect(bx + 2, by + H - 1, W - 4, 3);
  // throne-light: dims one step per fracture
  glow(bx + W / 2, by + H * .5, W * 1.5, '120,70,190', .26 - phase * .04);
  // ROBE — a wide column, no legs: he does not walk, he arrives
  K(Math.round(W * .1), Math.round(H * .34), Math.round(W * .8), Math.round(H * .66), ROBE);
  K(Math.round(W * .1), Math.round(H * .34), Math.round(W * .8), 3, LIT);
  for(let i = 0; i < 4; i++)
    K(Math.round(W * .2) + i * Math.round(W * .17), Math.round(H * .52), Math.round(W * .08), Math.round(H * .3), DARK);
  // SHOULDERS — the one he is about to blink to is lit for the whole warning
  // kingBlinkT is the real warning window (0.62 s, set by kingMarkBlink) and kingSide
  // is the alternating destination. Reading the actual fields is the whole point:
  // a telegraph drawn off a field nobody sets is a decoration that lies.
  const side = e.kingSide || 0, warn = (e.kingBlinkT || 0) > 0;
  K(Math.round(W * .02), Math.round(H * .3), Math.round(W * .26), Math.round(H * .12),
    warn && side < 0 ? '#e4d4ff' : LIT);
  K(Math.round(W * .72), Math.round(H * .3), Math.round(W * .26), Math.round(H * .12),
    warn && side > 0 ? '#e4d4ff' : LIT);
  // HEAD
  K(Math.round(W * .32), Math.round(H * .14), Math.round(W * .36), Math.round(H * .2), DARK);
  K(Math.round(W * (f < 0 ? .36 : .56)), Math.round(H * .22), 4, 4, fl ? '#fff' : '#ff661a');
  // CROWN — five points, one spent per fracture. This is the health bar that matters.
  for(let i = 0; i < 5; i++){
    const spent = i < phase;
    K(Math.round(W * .28) + i * Math.round(W * .1), Math.round(H * .04), 3, Math.round(H * .1),
      spent ? SPENT : GOLD);
  }
  K(Math.round(W * .26), Math.round(H * .13), Math.round(W * .48), 3, phase >= 4 ? SPENT : GOLD);
  if(fl){ for(const [x, y, w, h] of [[0, 0, W, 2], [0, H - 2, W, 2], [0, 0, 2, H], [W - 2, 0, 2, H]]) K(x, y, w, h, P.ink); }
}
function drawTyrantFigure(e){
  const SC = 1.5, W = Math.round(e.w * Z * SC), H = Math.round(e.h * Z * SC), f = e.face || -1;
  const bx = WX(e.x) - (W >> 1), by = WY(e.y) - H, fl = e.hitFlash > 0;
  const round = Math.min(2, e.paradoxRound || 0);
  const PLATE = '#3b2c56', LIT = '#6b5490', DARK = '#1d1430', COLD = '#4a7f6a', LIVE = '#e4d4ff';
  const K = (x, y, w, h, c) => B(bx + x, by + y, w, h, c);
  ctx.fillStyle = 'rgba(6,3,14,.45)'; ctx.fillRect(bx + 3, by + H - 1, W - 6, 3);
  // The three bands as fractions of the figure: legs 48, torso 178, crown 302 of 360.
  const bandY = k => Math.round(H * (1 - [48, 178, 302][k] / 360));
  const bandCol = k => k < round ? COLD : k === round ? LIVE : LIT;
  // GREAVES
  K(Math.round(W * .22), bandY(0) - 4, Math.round(W * .2), H - bandY(0) + 4, PLATE);
  K(Math.round(W * .58), bandY(0) - 4, Math.round(W * .2), H - bandY(0) + 4, PLATE);
  K(Math.round(W * .2), bandY(0) - 6, Math.round(W * .6), 5, bandCol(0));
  // CUIRASS
  K(Math.round(W * .16), bandY(1), Math.round(W * .68), bandY(0) - bandY(1) - 2, PLATE);
  K(Math.round(W * .16), bandY(1), Math.round(W * .68), 3, LIT);
  K(Math.round(W * .14), bandY(1) + 6, Math.round(W * .72), 5, bandCol(1));
  for(let i = 0; i < 3; i++) K(Math.round(W * .24) + i * Math.round(W * .18), bandY(1) + 16, Math.round(W * .1), 2, DARK);
  // ARMS, one raised on the round it is holding
  pixelLimb(bx + Math.round(W * .16), by + bandY(1) + 6, bx + Math.round(W * (f < 0 ? -.05 : 1.05)),
    by + bandY(1) + (e.atkTimer > 0 ? -6 : 22), 5, fl ? P.ink : PLATE);
  // CROWN and head
  K(Math.round(W * .3), bandY(2), Math.round(W * .4), bandY(1) - bandY(2), DARK);
  K(Math.round(W * .28), bandY(2) - 4, Math.round(W * .44), 6, bandCol(2));
  for(let i = 0; i < 5; i++) K(Math.round(W * .3) + i * Math.round(W * .09), bandY(2) - 11, 3, 8, bandCol(2));
  K(Math.round(W * (f < 0 ? .34 : .56)), bandY(2) + 10, 4, 4, e.paradoxStunT > 0 ? '#5fd17a' : '#ff661a');
  if(fl){ for(const [x, y, w, h] of [[0, 0, W, 2], [0, H - 2, W, 2], [0, 0, 2, H], [W - 2, 0, 2, H]]) K(x, y, w, h, P.ink); }
  glow(bx + W / 2, by + bandY(round), W * .9, '228,212,255', .18 + .08 * Math.sin(time * 4));
}
/* The three bands, drawn across the arena floor rather than as text on a wall: two
   faint rails and one bright one, at exactly the heights the fight measures. */
function drawParadoxRails(){
  const e = curG.boss; if(!e || !e.paradoxFight || e.dead) return;
  const bands = L.paradoxBands ? L.paradoxBands() : null; if(!bands) return;
  const round = Math.min(bands.length - 1, e.paradoxRound || 0);
  const l = WX(e.paradoxArenaL - 860), r = WX(e.paradoxArenaR + 860);
  for(let i = 0; i < bands.length; i++){
    const y = WY(bands[i].y), live = i === round, done = i < round;
    alphaWrap(live ? .85 : done ? .3 : .22, () => {
      for(let x = l; x < r; x += live ? 3 : 8) B(x, y, live ? 2 : 1, live ? 2 : 1, done ? '#5fd17a' : live ? '#e4d4ff' : '#72568c'); });
    if(live) glow((l + r) / 2, y, Math.min(bw * .5, (r - l) * .4), '228,212,255', .1);
  }
  // ALIGNMENT, without a word: a line between the two mouths that snaps straight
  // and bright when the pair answers the live band, and sags and dims when it does not.
  const m = curG.cratePortals || []; if(m.length < 2) return;
  const ok = L.tyrantPairOk ? L.tyrantPairOk(e) : false;
  const x1 = WX(m[0].x), y1 = WY(m[0].y), x2 = WX(m[1].x), y2 = WY(m[1].y);
  alphaWrap(ok ? .9 : .4, () => { const n = Math.max(2, Math.round(Math.abs(x2 - x1) / 4));
    for(let i = 0; i <= n; i++){ const t = i / n, sag = ok ? 0 : Math.round(Math.sin(t * Math.PI) * 14);
      B(Math.round(x1 + (x2 - x1) * t), Math.round(y1 + (y2 - y1) * t + sag), 2, 2, ok ? '#e4d4ff' : '#72568c'); } });
}
function drawBossFigure(e){
  if(curG.stageIndex===8&&e.type==='sorcerer'&&e.whiteCourtFight)return drawCourtSorcerer(e);
  if(e.type === 'brute' && e.bruteMachineryFight) return drawBruteFigure(e);
  if(e.type === 'archer' && e.marksmanPortalFight) return drawMarksmanFigure(e);
  if(e.type === 'warden' && e.wardenPortalFight) return drawWardenFigure(e);
  if(e.type === 'colossus' && e.forgeFight) return drawColossusFigure(e);
  if(e.type === 'tyrant' && e.paradoxFight) return drawTyrantFigure(e);
  // The Right Hand is a Tyrant too, so he borrows the body — his own fight state
  // rides on it via rightHandStun, which is what the eye colour already reads.
  if(e.type === 'tyrant' && e.rightHandFight) return drawTyrantFigure(e);
  if(e.type === 'king' && !e.dead) return drawKingFigure(e);
  const W = Math.round(e.w * Z), H = Math.round(e.h * Z), f = e.face || -1, fl = e.hitFlash > 0, en = e.lunge > 0 || (e.phase >= 2 && !(e.whiteCourtFight && e.courtBreaks >= 3));
  const bx = WX(e.x) - (W >> 1), by = WY(e.y) - H, br = Math.round(Math.sin(time * 2) * 1), lean = e.atkTimer > 0 ? f * 3 : 0;
  const eye = en ? '#ff1a1a' : '#ff661a';
  ctx.fillStyle = 'rgba(6,3,14,.4)'; ctx.fillRect(bx + 2, by + H - 1, W - 4, 3);
  glow(bx + W / 2, by + H / 2, W * (en ? 1.3 : 1), en ? '255,26,26' : '80,40,120', en ? .22 : .12);
  const K = (x, y, w, h, c) => B(bx + x + lean, by + y + br, w, h, fl ? P.ink : c);
  e._ra = (e._ra || 0) + dt * Math.abs(e.vx || 0) / 22; const cyc = Math.sin(e._ra * 1.7), l1 = Math.round(cyc * 3), l2 = -Math.round(cyc * 3);
  // THE PARADOX TELL. Carried over from the legacy drawer (index.html ~:2441): two
  // counter-rotating rings while it holds its round, and a burst of stars while it
  // is stunned and open. Without this, routing the Tyrant here would lose a warning.
  if(e.paradoxFight){
    const cx = bx + W / 2, cy = by + H * .5;
    if(e.paradoxStunT > 0){
      for(let i = 0; i < 9; i++){ const a = i / 9 * 6.2832;
        const r1 = W * (.30 + (i % 2) * .08), r2 = W * (.74 + (i % 3) * .05);
        pixelLimb(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1,
                  cx + Math.cos(a + .12) * r2, cy + Math.sin(a + .12) * r2, 2, '#f2dcff'); }
      glow(cx, cy, W * 1.1, '208,138,255', .3);
    }else{
      for(const [rr, sp, col] of [[.84, .2, '#c47bff'], [.68, -.28, '#8f6ad0']]){
        for(let i = 0; i < 14; i++){ const a = i / 14 * 6.2832 + time * sp;
          B(cx + Math.cos(a) * W * rr, cy + Math.sin(a) * H * (rr * .9), 2, 2, col); } }
      glow(cx, cy, W * .9, '176,107,255', .16 + .06 * Math.sin(time * 7));
    }
  }
  switch(e.type){
    case 'brute': {
      const body = '#c8653a', dark = '#6e3218', lit = '#e89a6a';
      K(W * .25 + l1 * f, H * .78, W * .16, H * .22, dark); K(W * .6 + l2 * f, H * .78, W * .16, H * .22, dark);
      K(W * .12, H * .3, W * .76, H * .5, body); K(W * .12, H * .3, W * .76, 2, lit); K(W * .12, H * .74, W * .76, 4, dark);
      K(f > 0 ? W * .78 : 0, H * .34, W * .22, H * .34, body); K(f > 0 ? 0 : W * .78, H * .34, W * .22, H * .34, body);
      K(f > 0 ? W * .8 : W * .02, H * .62, W * .18, H * .12, dark); K(f > 0 ? W * .02 : W * .8, H * .62, W * .18, H * .12, dark);   // fists
      K(W * .34, H * .1, W * .32, H * .22, dark); K(f > 0 ? W * .52 : W * .38, H * .16, 4, 3, eye);
      for(let i = 0; i < 6; i++){ B(bx + (f > 0 ? W * .9 : W * .06) + f * i * 3 + lean, by + H * .7 + i * 2 + br, 2, 2, T.stoneLit); }   // chain
      break; }
    case 'archer': {
      const body = '#6f7a48', dark = '#3a4126', mask = '#d8d2c4';
      K(W * .3 + l1 * f, H * .76, W * .14, H * .24, dark); K(W * .56 + l2 * f, H * .76, W * .14, H * .24, dark);
      K(W * .26, H * .28, W * .48, H * .5, body); K(W * .26, H * .28, W * .48, 2, '#9aa66a'); K(W * .3, H * .5, W * .4, 2, dark);
      K(W * .3, H * .04, W * .4, H * .26, dark); K(f > 0 ? W * .46 : W * .32, H * .12, W * .22, H * .12, mask); K(f > 0 ? W * .56 : W * .38, H * .16, 2, 2, eye);
      const bxx = bx + (f > 0 ? W * .82 : W * .18) + lean, byy = by + H * .5 + br; for(let y = -H * .3; y <= H * .3; y += 1) B(bxx + f * Math.round(Math.sqrt(Math.max(0, (H * .3) ** 2 - y * y)) * .35), byy + y, 1, 1, P.woodLit); B(bxx, byy - H * .3, 1, H * .6, 'rgba(230,210,138,.7)');
      if(e.atkTimer > 0) B(bxx + f * 6, byy - 1, f * 10, 1, '#e6d28a');
      break; }
    case 'warden': {
      const body = '#7a4f82', dark = '#3e2544', lit = '#b48ac0';
      K(W * .28 + l1 * f, H * .74, W * .16, H * .26, dark); K(W * .56 + l2 * f, H * .74, W * .16, H * .26, dark);
      K(W * .2, H * .26, W * .6, H * .5, body); K(W * .2, H * .26, W * .6, 2, lit); K(W * .2, H * .5, W * .6, 2, dark);
      K(W * .3, H * .04, W * .4, H * .24, dark); K(W * .3, H * .04, W * .4, 2, lit); K(f > 0 ? W * .48 : W * .34, H * .14, W * .18, 2, eye);
      const sf = e.shieldFace || f; B(bx + (sf > 0 ? W * .82 : W * .02) + lean, by + H * .3 + br, W * .16, H * .42, fl ? P.ink : '#4a3a55'); B(bx + (sf > 0 ? W * .82 : W * .02) + lean, by + H * .3 + br, W * .16, 2, lit);
      const lx = bx + (sf > 0 ? W * .04 : W * .9) + lean, ly = by + H * .6 + br; B(lx, ly, 4, 6, T.stoneDark); B(lx + 1, ly + 1, 2, 4, '#d8b7df'); glow(lx + 2, ly + 3, 18, '216,183,223', .35);
      break; }
    case 'sorcerer': {
      const body = '#2f5a86', dark = '#18324e', lit = '#7fd6ff';
      for(let i = 0; i < H * .5; i++){ const ww = W * .3 + (i / (H * .5)) * W * .4; K(W / 2 - ww / 2, H * .5 + i, ww, 1, i % 6 === 0 ? dark : body); }
      K(W * .26, H * .26, W * .48, H * .26, body); K(W * .26, H * .26, W * .48, 2, lit);
      K(W * .3, H * .04, W * .4, H * .24, dark); K(f > 0 ? W * .48 : W * .32, H * .14, W * .2, H * .08, '#0b1620'); K(f > 0 ? W * .56 : W * .38, H * .16, 2, 2, lit);
      const sx = bx + (f > 0 ? W * .88 : W * .08) + lean; B(sx, by + H * .2 + br, 2, H * .78, P.wood); B(sx - 2, by + H * .14 + br, 6, 8, lit); glow(sx + 1, by + H * .18 + br, 22, '127,214,255', .4);
      for(let i = 0; i < 3; i++){ const a = time * 2 + i * 2.1; B(bx + W / 2 + Math.cos(a) * W * .7, by + H * .45 + Math.sin(a) * H * .3, 3, 3, i % 2 ? '#e8f6ff' : lit); }
      break; }
    // A boss routed here without a case must never become an empty silhouette.
    default: return legacyDraw(L.drawEnemyFull, e);
  }
  if(en && Math.random() < dt * 8 && curG) curG.particles.push({ x:e.x + (Math.random() - .5) * e.w, y:curEnv.GROUND_Y - e.y - Math.random() * e.h, vx:0, vy:-40, sz:3, color:eye, life:.5 });
}
function drawFluidV4(o){
  if(!L.fluidPoints) return legacyDraw(L.byType.fluid, o);
  const pts = L.fluidPoints(o); if(!pts || pts.length < 2) return;
  const mat = (L.fluidType && L.fluidType(o)) || {}, bodyCol = o.body || mat.body || '#1d4f6e', deepCol = o.deep || mat.deep || '#0b2233', foam = o.foam || mat.foam || '#9fe0ff';
  const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), bottom = WY(o.y);
  ctx.globalAlpha = .82;
  let k = 0;
  for(let x = x0; x < x1; x++){
    const wx = camX + x / Z; while(k < pts.length - 2 && pts[k + 1].x < wx) k++;
    const a = pts[k], b = pts[Math.min(k + 1, pts.length - 1)], t = b.x === a.x ? 0 : Math.max(0, Math.min(1, (wx - a.x) / (b.x - a.x)));
    const sy = WY(a.y + (b.y - a.y) * t);
    if(sy >= bottom) continue;
    B(x, sy, 1, bottom - sy, bodyCol); if(bottom - sy > 12) B(x, sy + Math.round((bottom - sy) * .55), 1, bottom - sy - Math.round((bottom - sy) * .55), deepCol);
    B(x, sy, 1, 1, foam);
    const drift = (time * (20 + Math.abs(o.currentX || 0) * .28)) | 0, flow = (o.currentX || 0) < 0 ? -drift : drift;
    if(((x - flow) % 23 + 23) % 23 === 0) B(x, sy + 2, (o.currentX ? 3 : 2), 1, 'rgba(255,255,255,.4)');
  }
  ctx.globalAlpha = 1;
  const halo = o.glow || mat.glow;
  if(halo) glow((x0 + x1) / 2, WY(o.y + o.h), Math.min(60, (x1 - x0) / 2), rgbOf(halo, '159,224,255'), .12);
  // A contained volume is a vessel, not a floating slab: show its lip.
  if(o.contained){ const top = WY(o.y + o.h); B(x0 - 2, top - 2, 3, bottom - top + 4, T.stoneDark); B(x1 - 1, top - 2, 3, bottom - top + 4, T.stoneDark); }
}
/* '#ff7438' -> '255,116,56' for glow(), which takes a bare rgb triple. */
function rgbOf(hex, fallback){
  if(typeof hex !== 'string') return fallback;
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if(!m) return fallback;
  const v = parseInt(m[1], 16);
  return ((v >> 16) & 255) + ',' + ((v >> 8) & 255) + ',' + (v & 255);
}
function drawRotorV4(o){
  if(o.x1 == null) return;
  if(curG.stageIndex===6){
    const ax=WX(o.x1),ay=WY(o.y1),bx=WX(o.x2),by=WY(o.y2),th=Math.max(2,W2((o.thickness||8)*2)),active=!!o.hazard;
    const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay))),edge=active?'#c8a282':GAOL.ironLit;
    for(let i=0;i<=n;i++){const x=ax+(bx-ax)*i/n,y=ay+(by-ay)*i/n;B(x-th/2,y-th/2,th,th,active?GAOL.iron:GAOL.dark);B(x-th/2,y-th/2,th,1,edge);}
    const x=WX(o.x),y=WY(o.y);wheel(x,y,7,o.angle||0,GAOL.brass);B(x-2,y-2,4,4,active?GAOL.light:GAOL.open);
    for(const [xx,yy] of [[ax,ay],[bx,by]]){B(xx-2,yy-2,4,4,edge);B(xx-1,yy-1,2,2,active?GAOL.light:GAOL.iron);}
    return;
  }
  const ax = WX(o.x1), ay = WY(o.y1), bxx = WX(o.x2), byy = WY(o.y2), t = Math.max(2, Math.round((o.thickness || 8) * Z * 2)), col = o.hazard ? '#c9533e' : '#718092';
  const n = Math.max(1, Math.round(Math.hypot(bxx - ax, byy - ay)));
  for(let i = 0; i <= n; i++){ const x = ax + (bxx - ax) * i / n, y = ay + (byy - ay) * i / n; B(x - t / 2, y - t / 2, t, t, (i % 8 < 4) ? col : (o.hazard ? '#8a3325' : '#4e5a68')); }
  const hx = WX(o.x), hy = WY(o.y); B(hx - 4, hy - 4, 8, 8, '#313945'); B(hx - 1, hy - 1, 2, 2, '#d5dbe3');
}
function drawEnemy(e){
  // A walker owes the same floor the player does; a flyer owes neither, so it is
  // the one thing in the frame that never turns over.
  if(curG.gravityFlipped && e.kind !== 'fly' && !e._flipping){
    const h = Math.max(8, Math.round((e.h || 38) * Z));
    e._flipping = 1;
    flipWrap(WY(e.y) - h, h, () => drawEnemy(e));
    e._flipping = 0;
    return;
  }
  if(curG.stageIndex===7&&e.frostCounterLesson)return drawGaolGuard(e);
  if(curG.stageIndex===6&&e.wardenRole)return drawGaolGuard(e);
  if(curG.stageIndex===4){
    if(e.watchSniper)return drawWatchSniper(e);
    if(e.marksmanRole==='mantlet-guard')return drawWatchGuard(e);
    if(e.marksmanRole==='watch-runner')return drawWalker(e,{body:WATCH.cloth,dark:WATCH.clothDark,lit:'#9c9e74',eye:WATCH.dark,mask:P.mask});
  }
  drawAwareness(e);
  switch(e.type){
    case 'grunt': return drawWalker(e, WALKER_PALS.grunt);
    case 'toxling': return drawWalker(e, WALKER_PALS.toxling);
    case 'frostling': return drawWalker(e, WALKER_PALS.frostling);
    case 'emberling': case 'slagwright': case 'cinderling': case 'shieldbearer':
    case 'linesman': case 'gaoler': case 'chainmarshal': case 'signaler':
    case 'sporecaster':
      return drawWalker(e, WALKER_PALS[e.type]);
    case 'shadeling': return drawShadeling(e);
    case 'flyer': return drawFlyer(e, '#c06ac0', '#e8a8e8');
    // The Inversion and the deep stages: these all fell through to the legacy
    // vector blob, the same gap the heat chapter had.
    case 'crownguard': return drawCrownguard(e);
    case 'crawler': return drawFlyer(e, '#8c2230', '#d4566a');
    case 'voidbat': return drawFlyer(e, '#3b2a5e', '#8f6ad0');
    case 'bloodeye': return drawFlyer(e, '#a3212b', '#ff6a72');
    case 'rifthound': return drawHound(e);
    case 'gargoyle': return drawGargoyle(e);
    case 'stormmote': return drawMote(e, '111,183,216', '#6fb7d8');
    case 'sparkling': return drawMote(e, '159,224,255', '#9fe0ff');
    case 'brute': case 'archer': case 'warden': case 'sorcerer': case 'colossus':
    case 'tyrant': case 'king': return drawBossFigure(e);
    default: legacyDraw(L.drawEnemyFull, e);
  }
}


// ── Region structures (pixel primitives in buffer px; sizes follow the legacy defaults in world units) ─
const W2 = v => Math.round(v * Z);
function alphaWrap(a, fn){ const prev = ctx.globalAlpha; ctx.globalAlpha = prev * a; fn(); ctx.globalAlpha = prev; }
// MULTIPLIES. It used to assign, so a structure drawn at .9 inside a .22 dim came
// out at .9 and the arena never actually dimmed behind the fight.
function frame(bx, by, w, h, col){ const c = col || P.wood; B(bx - w * .42, by - h, 3, h, c); B(bx + w * .42 - 3, by - h, 3, h, c); B(bx - w * .44, by - h, w * .88, 3, c); B(bx - w * .44, by - h + 3, w * .88, 1, P.woodLit); }
function stepArc(cx, cy, r, col, thick){ for(let x = -r; x <= r; x++){ const y = Math.round(Math.sqrt(Math.max(0, r * r - x * x))); B(cx + x, cy - y, 1, thick || 2, col); } }
function hall(bx, by, w, h, opt){
  const o = opt || {}, dark = o.dark || '#0e0b14';
  alphaWrap(o.alpha || .9, () => {
    B(bx - w / 2, by - h, w, h, dark);
    const step = Math.max(28, Math.round(w / 9)); for(let x = -w / 2 + step / 2; x < w / 2; x += step) B(bx + x, by - h * .78, 4, h * .78, o.col || T.stoneLit);
    for(const f of [.22, .48, .76]) B(bx - w * .46, by - h * f, w * .92, 1, o.line || T.stoneDark);
    if(o.arch) stepArc(bx, by, Math.round(w * .22), o.archCol || T.stoneLit, 2);
    if(o.bars) for(let x = -w / 2 + 6; x < w / 2; x += 6) B(bx + x, by - h * .7, 1, h * .7, T.stoneDark);
    if(o.door){ B(bx - w * .25, by - h * .82, 3, h * .82, o.door); B(bx + w * .25 - 3, by - h * .82, 3, h * .82, o.door); B(bx - w * .25, by - h * .82, w * .5, 3, o.door); }
    if(o.windows) for(let x = -w / 2 + w * .18; x < w / 2 - w * .1; x += w * .28) B(bx + x, by - h * .55, 5, 7, o.windows);
  });
}
function house(bx, by, w, h, warm, opt){
  const o = opt || {}, body = o.body || T.stone, roof = o.roof || T.stoneDark;
  B(bx - w / 2, by - h * .72, w, h * .72, body); B(bx - w / 2, by - h * .72, w, 1, T.stoneLit); B(bx + w / 2 - 1, by - h * .72, 1, h * .72, T.stoneDark);
  for(let i = 0; i < h * .3; i++){ const ww = w * (1 - i / (h * .3)) + 4; B(bx - ww / 2, by - h * .72 - i - 1, ww, 1, i % 4 === 0 ? T.stoneLit : roof); }
  const win = warm ? P.amber : T.stoneDark, n = Math.max(1, Math.round(w / 26));
  for(let i = 0; i < n; i++){ const x = bx - w / 2 + (i + .5) * (w / n) - 3; B(x, by - h * .5, 6, 7, win); if(warm) B(x + 2, by - h * .5 + 2, 2, 3, P.moon); }
  B(bx - 4, by - h * .3, 8, h * .3, o.doorCol || T.stoneDark); B(bx - 3, by - h * .3, 6, 1, T.stoneLit);
  if(warm) glow(bx, by - h * .45, Math.round(w * .5), '255,180,84', .12);
}
function tower(bx, by, w, h, opt){
  const o = opt || {};
  bricks(bx - w / 2, by - h, w, h, bx, by); B(bx - w / 2 - 2, by - h, w + 4, 3, T.stoneLit);
  for(let y = 10; y < h - 6; y += 14) B(bx - 1, by - h + y, 2, 5, o.slit || T.stoneDark);
  if(o.bell){ B(bx - 4, by - h + 5, 8, 6, P.amber); B(bx - 2, by - h + 11, 4, 2, P.moon); }
  if(o.light){ B(bx - 2, by - h - 4, 4, 4, P.amber); glow(bx, by - h - 2, 14, '255,180,84', .35); }
}
function arcade(bx, by, w, h, col){
  const n = Math.max(2, Math.round(w / 40)), span = w / n;
  alphaWrap(.9, () => { B(bx - w / 2, by - h, w, h * .22, col || T.stone); B(bx - w / 2, by - h, w, 2, T.stoneLit);
    for(let i = 0; i <= n; i++) B(bx - w / 2 + i * span - 2, by - h * .78, 4, h * .78, col || T.stone);
    for(let i = 0; i < n; i++) stepArc(bx - w / 2 + (i + .5) * span, by - h * .55, Math.round(span * .45), col || T.stone, 3); });
}
function wheel(cx, cy, r, ang, col){ stepArc(cx, cy, r, col, 2); for(let x = -r; x <= r; x++){ const y = Math.round(Math.sqrt(Math.max(0, r * r - x * x))); B(cx + x, cy + y, 1, 2, col); } for(let i = 0; i < 4; i++){ const a = ang + i * Math.PI / 4; for(let k = -r; k <= r; k += 1) B(cx + Math.cos(a) * k, cy + Math.sin(a) * k, 1, 1, col); } B(cx - 2, cy - 2, 4, 4, P.moon); }
function cog(cx, cy, r, ang, col){ wheel(cx, cy, r, ang, col); for(let i = 0; i < 8; i++){ const a = ang + i * Math.PI / 4; B(cx + Math.cos(a) * (r + 1), cy + Math.sin(a) * (r + 1), 3, 3, col); } }
function mineMouth(bx, by, w, h, col){ B(bx - w / 2, by - h, w, h, '#0b1018'); B(bx - w / 2 - 3, by - h - 3, w + 6, 3, col); B(bx - w / 2 - 3, by - h, 3, h, col); B(bx + w / 2, by - h, 3, h, col); for(let y = 6; y < h; y += 9) B(bx - w / 2 + 2, by - h + y, w - 4, 1, 'rgba(255,255,255,.05)'); }
function chain(x, y1, y2, col){ for(let y = y1; y < y2; y += 3) B(x, y, 2, 2, col || T.stoneLit); }
function plaque(bx, by, w, h, unread, col){ B(bx - w / 2, by - h - 6, w, h, col || P.wood); B(bx - w / 2 + 1, by - h - 5, w - 2, 1, P.woodLit); for(let y = 3; y < h - 2; y += 3) B(bx - w / 2 + 3, by - h - 6 + y, w - 6, 1, P.canvasDark); B(bx - 1, by - 6, 2, 6, P.wood); if(unread) glow(bx, by - h / 2 - 6, 16, '216,196,143', .25); }
function sail(bx, by, w, h, col){ B(bx, by - h, 2, h, P.wood); for(let i = 0; i < h * .7; i++){ const ww = Math.round(w * .6 * (i / (h * .7))); B(bx + 2, by - h + i, ww, 1, i % 5 === 0 ? T.stoneLit : (col || '#53636a')); } }

const STRUCT = {
  'foundry-hall':(o,bx,by)=>{ const w = W2(o.w || 1200), h = W2(o.h || 460);
    hall(bx, by, w, h, { dark:'#170b07', col:'#7d5642', line:'#301a12', arch:true, archCol:'#ffb06a' });
    for(let i = -3; i <= 3; i++){ const wx = bx + i * Math.round(w * .13), wy = by - h * .58;
      B(wx - 4, wy, 8, 10, '#ffbe6e'); glow(wx, wy + 5, 14, '255,170,90', .16); } },
  'casting-crane':(o,bx,by)=>{ const w = W2(o.w || 200), h = W2(o.h || 340);
    B(bx - 3, by - h, 6, h, T.stoneDark); B(bx - w * .4, by - h, w * .8, 4, '#7d5642');
    chain(bx + w * .28, by - h, by - h * .45, '#8a6248');
    B(bx + w * .2, by - h * .45, w * .18, W2(40), '#3a241c'); glow(bx + w * .29, by - h * .4, 16, '255,140,60', .2); },
  'slag-heap':(o,bx,by)=>{ const w = W2(o.w || 260), h = W2(o.h || 120);
    for(let i = 0; i < 9; i++){ const hh = h * (.35 + hash(i, o.x) * .65), ww = w * .22;
      B(bx - w / 2 + i * (w / 9), by - hh, ww, hh, i % 2 ? '#3a2018' : '#4a2b1e');
      if(hash(i, 5) > .7) B(bx - w / 2 + i * (w / 9), by - hh, ww, 2, '#c9552a'); } },
  // The spout is the region's clock face: it gathers visibly, then lets go.
  'pour-spout':(o,bx,by)=>{ const w = W2(o.w || 120), h = W2(o.h || 220);
    // A spout is fed from somewhere: run the pipe up out of frame so it has a reason
    // to hang where it hangs. In the arena that pipe is 400px of vertical clutter
    // across six bays, so there it is a short stub instead — the fight needs the
    // bed, the arm and the column to be the only things the eye has to track.
    const feed = o.foundrySpout ? 54 : 400;
    B(bx - 5, by - h - feed, 10, feed, '#231512'); B(bx - 7, by - h - feed, 3, feed, '#3d2820');
    for(let y = by - h - feed + 10; y < by - h; y += 46){ B(bx - 9, y, 18, 5, '#3a241c'); B(bx - 9, y, 18, 1, '#6b4632'); }
    B(bx - w * .3, by - h, w * .6, h * .3, '#3a241c'); B(bx - w * .34, by - h, w * .68, 4, '#8a5a40');
    const lip = by - h * .7;
    if(o.pouring){ for(let k = 0; k < Math.round(h * .62); k++)
        B(bx - 3 + Math.sin(time * 9 + k * .35) * 2, lip + k, 6, 1, k < 7 ? '#fff0c0' : k < 20 ? '#ffae4a' : '#e0561f');
      glow(bx, by - h * .35, 34, '255,140,60', .34); }
    else if(o.pourWarn){ const p = .5 + .5 * Math.sin(time * 18);          // gathering at the lip
      B(bx - 4, lip - 2, 8, 4, '#ffae4a'); B(bx - 2, lip + 2, 4, 3 + (p * 4 | 0), '#e0561f');
      glow(bx, lip, 20 + p * 10, '255,170,90', .22 + p * .18); }
    else { B(bx - 3, lip - 1, 6, 2, '#5c3a2a'); glow(bx, lip, 12, '255,120,50', .08); } },
  // THE LADLE, and its walking cousin the feeder. Dark iron that only lights when
  // it is actually holding heat — a machine at rest is decoration, and in this
  // chapter decoration is never orange. It wears the Colossus's own grammar: a
  // gather you can strike into, a pour you cannot, and a refusal that vents cold.
  'pour-ladle':(o,bx,by)=>{
    const L = o.ladle || {}, rail = !o.feeder, live = !o.seized;
    const pouring = live && o.phase === 'pour', gather = live && o.phase === 'gather';
    const kick = Math.round((o.recoil || 0) * 10);
    let bodyY;
    if(rail){
      const x1 = WX(L.railX1 || o.x), x2 = WX(L.railX2 || o.x), rw = Math.max(2, x2 - x1);
      B(x1, by - 4, rw, 3, '#3d2820'); B(x1, by - 4, rw, 1, '#6b4632');
      for(let x = x1 + 6; x < x2; x += 18) B(x, by - 9, 2, 5, '#2a1c17');
      B(bx - 8, by - 1, 16, 5, '#4a3128'); B(bx - 8, by - 1, 16, 1, '#8a6248');
      B(bx - 2, by + 4, 4, 7, '#2a1c17');
      bodyY = by + 11 + kick;
    } else {
      const step = live ? Math.round(Math.sin(time * 6) * 3) : 0;
      B(bx - 15, by - 14 - step, 7, 14 + step, '#3d2820');                  // it walks
      B(bx + 8, by - 14 + step, 7, 14 - step, '#3d2820');
      B(bx - 18, by - 58, 36, 44, o.seized ? '#3a2a24' : '#4a3128');
      B(bx - 18, by - 58, 36, 2, '#8a6248');
      for(let i = 0; i < 3; i++) B(bx - 13 + i * 10, by - 50, 6, 6, o.seized ? '#241a16' : '#5c3a2a');
      B(bx - 8, by - 66, 16, 8, '#4a3128'); B(bx - 8, by - 66, 16, 2, '#8a6248');
      bodyY = by - 82 - kick;
    }
    const bw = 22, bxx = bx - 11;
    B(bxx, bodyY, bw, 14, '#4a3128'); B(bxx, bodyY, bw, 2, '#8a6248');
    B(bxx - 2, bodyY + 2, 2, 10, '#3d2820'); B(bxx + bw, bodyY + 2, 2, 10, '#3d2820');
    if(o.seized){
      B(bxx + 2, bodyY + 3, bw - 4, 2, '#6e8590');                          // cold, split, done
      for(let i = 0; i < 5; i++) B(bxx + 3 + i * 4, bodyY + 14, 2, 3, '#3a2a24');
      // A DEAD one. Not venting any more — the slag it was holding went hard where
      // it hung, and the whole machine wears it. Emberdeep's only sight of what the
      // next region is for, and it says nothing.
      if(o.deadLadle){
        for(let i = 0; i < 4; i++){ const dx = bxx + 2 + i * 6, run = 7 + ((i * 5) % 11);
          B(dx, bodyY + 13, 3, run, '#5c4438'); B(dx, bodyY + 13 + run, 4, 3, '#6e5546'); B(dx, bodyY + 13, 1, run, '#8a7a63'); }
        B(bxx - 4, bodyY - 2, bw + 8, 3, '#5c4438'); B(bxx - 4, bodyY - 2, bw + 8, 1, '#8a7a63');
        return;
      }
      alphaWrap(.45, () => { for(let k = 0; k < 7; k++)
        B(bx - 6 + Math.round(Math.sin(time * 1.4 + k) * (3 + k)), bodyY - 6 - k * 5, 4 + (k >> 2), 3, '#bfeaff'); });
      return;
    }
    if(o.steam > 0) alphaWrap(Math.min(1, o.steam), () => { for(let k = 0; k < 8; k++)
      B(bx - 8 + Math.round(Math.sin(time * 5 + k) * (4 + k)), bodyY - 4 - k * 4, 4, 3, k & 1 ? '#bfeaff' : '#dff8ff'); });
    if(gather){                                                             // holding the bay open
      B(bxx + 2, bodyY + 3, bw - 4, 3, '#ffae4a');
      const p = .5 + .5 * Math.sin(time * 18);
      B(bxx + 6, bodyY + 2, bw - 12, 2 + (p * 3 | 0), '#ffe6a8');
      glow(bx, bodyY + 6, 18 + p * 8, '255,170,90', .2 + p * .16);
    }
    if(pouring){
      const tip = rail ? bodyY + 14 : bodyY, ty = WY(o.tgtY == null ? (rail ? 150 : 200) : o.tgtY);
      const span = Math.abs(ty - tip), dir = ty > tip ? 1 : -1;
      for(let k = 0; k < span; k++){ const yy = tip + dir * k;
        B(bx - 3 + Math.sin(time * 9 + k * .35) * 2, yy, 6, 1, k < 6 ? '#fff0c0' : k < 18 ? '#ffae4a' : '#e0561f'); }
      glow(bx, tip + dir * span * .5, 30, '255,140,60', .3);
    } },
  // THE FISSURE. The floor at the end of the works never finished setting, and
  // what comes up through the crack is not the colour of this chapter.
  'foundry-fissure':(o,bx,by)=>{ const w = W2(o.w || 420), h = W2(o.h || 70);
    B(bx - w / 2, by, w, h, '#0a0710');
    for(let i = 0; i < 9; i++) B(bx - w / 2 + (i / 8) * (w - 2), by, 2, Math.round(h * (.4 + hash(i, o.x) * .6)), '#170b12');
    alphaWrap(.42 + .18 * Math.sin(time * 1.3), () => {
      for(let k = 0; k < 5; k++) B(Math.round(bx - w * .32 + k * (w * .16)), by + 3, 6, h - 6, '#6a2f6b'); });
    B(bx - w / 2 - 4, by - 4, 7, 7, '#7d5642'); B(bx + w / 2 - 3, by - 4, 7, 7, '#7d5642');
    glow(bx, by + h * .5, Math.round(w * .45), '150,90,200', .16); },
  'anvil-block':(o,bx,by)=>{ const w = W2(o.w || 140), h = W2(o.h || 110);
    B(bx - w * .34, by - h * .4, w * .68, h * .4, '#3f2a22'); B(bx - w * .46, by - h * .58, w * .92, h * .2, '#5a4036');
    B(bx - w * .46, by - h * .58, w * .92, 3, '#9a7258'); glow(bx, by - h * .5, 20, '255,150,70', .12); },
  'ember-refuge':(o,bx,by)=>{ const w = W2(o.w || 940), h = W2(o.h || 360);
    hall(bx, by, w, h, { dark:'#170b07', col:'#7d5642', line:'#301a12' });
    stepArc(bx, by, Math.round(w * .13), '#ffb06a', 2);
    for(let i = -2; i <= 2; i++){ const wx = bx + i * Math.round(w * .17), wy = by - h * .52;      // warm windows
      B(wx - 5, wy, 10, 12, '#ffcf82'); B(wx - 5, wy, 10, 1, '#fff0c0'); glow(wx, wy + 6, 16, '255,190,110', .18); } },
  'ember-bellows':(o,bx,by)=>{ const w = W2(o.w || 120), h = W2(o.h || 150);
    for(let i = 0; i < 6; i++) B(bx - w * .4 + i, by - h * .5 - i * 2, w * .8 - i * 2, 3, i % 2 ? '#5c3a2a' : '#7d5642');   // folded lung
    B(bx - w * .44, by - h * .5, w * .88, 3, '#2a1a12'); B(bx + w * .3, by - h * .2, 5, h * .2, T.stoneDark);
    glow(bx + w * .33, by - h * .18, 14, '255,150,60', .3 + .12 * Math.sin(time * 3)); },
  'ember-ledger':(o,bx,by)=>plaque(bx, by, W2(o.w || 80), W2(o.h || 72), !o.read, '#6b4632'),
  'ember-stack':(o,bx,by)=>{ const w = W2(o.w || 150), h = W2(o.h || 420);
    tower(bx, by, w, h); B(bx - w * .6, by - h, w * 1.2, 4, o.stackDark ? '#3a241c' : '#7d5642');
    // One flue goes dark per refusal: the skyline is the second, redundant readout.
    if(o.stackDark){ B(bx - w * .5, by - h + 4, w, 3, '#241611'); return; }
    alphaWrap(.5, () => { for(let k = 0; k < 16; k++) B(bx - 3 + Math.sin(time * .6 + k * .7) * (4 + k), by - h - 5 - k * 5, 4 + (k >> 2), 3, 'rgba(70,48,40,.8)'); }); },
  'ember-seal-arch':(o,bx,by)=>{ const w = W2(o.w || 260), h = W2(o.h || 330);
    hall(bx, by, w, h, { alpha:.85, col:'#7d5642', dark:'#170b07' }); stepArc(bx, by, Math.round(w * .26), '#ffb06a', 3);
    alphaWrap(.4 + .2 * Math.sin(time * 1.6), () => { for(let y = 0; y < h * .6; y += 5) B(bx - w * .28, by - y, w * .56, 2, '#ffd08a'); }); },
  'ember-crucible':(o,bx,by)=>{ const w = W2(o.w || 220), h = W2(o.h || 300);
    B(bx - w * .3, by - h * .55, w * .6, h * .55, '#3a241c'); B(bx - w * .34, by - h * .58, w * .68, 4, '#8a5a40');
    for(let x = -w * .3; x < w * .3; x += 4) B(bx + x, by - h * .58, 3, 2, '#ff9a3a');
    glow(bx, by - h * .6, 40, '255,140,60', .3 + .1 * Math.sin(time * 2));
    chain(bx - w * .38, by - h, by - h * .55); chain(bx + w * .36, by - h, by - h * .55); },
  'ember-command-post':(o,bx,by)=>{ const w = W2(o.w || 120), h = W2(o.h || 150);
    B(bx - w * .22, by - h * .5, w * .44, h * .5, T.stoneDark); B(bx - w * .28, by - h * .55, w * .56, 4, '#8a5a40');
    if(!o.read){ const pu = .5 + .5 * Math.sin(time * 2.4); alphaWrap(.5 + pu * .5, () => stepArc(bx, by - h * .72, 9, '#ffd08a', 2)); glow(bx, by - h * .7, 26, '255,176,106', .25 + pu * .2); }
    else B(bx - 4, by - h * .62, 8, 3, '#5c3a2a'); },
  // THE ANCHOR. Where the Inversion pays for its verb: a standing stone with an
  // identical stone hanging above it, the two floors stated as one object. It dims
  // once the flip is yours, the way every other read marker in the game does.
  'inversion-anchor':(o,bx,by)=>{ const w = W2(o.w || 130), h = W2(o.h || 170), lit = !o.read;
    const col = lit ? '#61497f' : '#3a2c52', edge = lit ? '#c4a8ff' : '#5a3f8f';
    B(bx - w * .18, by - h * .42, w * .36, h * .42, col);                    // the stone that stands
    B(bx - w * .22, by - h * .46, w * .44, 4, edge);
    B(bx - w * .18, by - h * .92, w * .36, h * .42, col);                    // and the one that hangs
    B(bx - w * .22, by - h * .92, w * .44, 4, edge);
    for(let k = 0; k < 3; k++){ const y = by - h * .5 - k * 5;               // the gap between them
      B(bx - 1, y, 2, 2, lit ? '#e4d4ff' : '#4a3a68'); }
    if(lit) glow(bx, by - h * .5, 30, '196,168,255', .22 + .08 * Math.sin(time * 1.6)); },
  'ember-forge-door':(o,bx,by)=>{ const w = W2(o.w || 200), h = W2(o.h || 300);
    hall(bx, by, w, h, { alpha:.95, col:'#6b4632', dark:'#150907' }); mineMouth(bx, by, Math.round(w * .46), Math.round(h * .62), '#8a5a40');
    B(bx - 1, by - h * .62, 2, h * .62, '#ff7a2a'); glow(bx, by - h * .3, 30, '255,122,42', .22 + .08 * Math.sin(time * 1.4)); },
  'keep-clock':(o,bx,by)=>{ tower(bx, by, 35, 48); B(bx - 12, by - 40, 24, 24, '#111018'); stepArc(bx, by - 28, 11, '#c6b0dc', 1); B(bx, by - 30, 1, 5, P.moon); B(bx, by - 28, 5, 1, P.moon); },
  'keep-hearth':(o,bx,by)=>{ B(bx - 36, by - 5, 72, 5, '#2a201d'); B(bx - 24, by - 8, 48, 3, P.wood); glow(bx, by - 8, 20, '255,154,58', .2); },
  'suspended-keystone':(o,bx,by)=>{ const w = W2(o.w || 320), h = W2(o.h || 900); alphaWrap(.6, () => { chain(bx - w * .38, by - h, by); chain(bx + w * .36, by - h, by); B(bx - w * .35, by - h, w * .7, 3, T.stoneLit); }); },
  'mended-arch':(o,bx,by)=>{ const open = L.circuitOpen && L.circuitOpen('keep-weight'); alphaWrap(open ? .8 : .4, () => stepArc(bx, by - 35, 120, open ? '#8b7658' : '#443a34', 6)); },
  'keep-gatehouse':(o,bx,by)=>hall(bx, by, W2(o.w || 520), W2(o.h || 420), { arch:true, windows:T.stoneDark }),
  'fallen-refectory':(o,bx,by)=>hall(bx, by, W2(o.w || 600), W2(o.h || 300), { alpha:.7 }),
  'weight-hall':(o,bx,by)=>hall(bx, by, W2(o.w || 700), W2(o.h || 420), { arch:true }),
  'masons-quarter':(o,bx,by)=>hall(bx, by, W2(o.w || 500), W2(o.h || 260), { windows:P.amber }),
  'split-belfry':(o,bx,by)=>tower(bx, by, W2(o.w || 90), W2(o.h || 420), { bell:true }),
  'masked-belfry':(o,bx,by)=>tower(bx, by, W2(o.w || 90), W2(o.h || 380), { bell:true }),
  'clinging-archive':(o,bx,by)=>hall(bx, by, W2(o.w || 420), W2(o.h || 360), { bars:true }),
  'archive-chain':(o,bx,by)=>chain(bx, by - W2(o.h || 400), by),
  'east-collapse':(o,bx,by)=>{ for(let i = 0; i < 9; i++){ const hh = 4 + (hash(i, o.x) * 10 | 0), ww = 6 + (hash(i, 3) * 10 | 0); B(bx - 40 + i * 9, by - hh, ww, hh, i % 2 ? T.stone : T.stoneDark); } },
  'gaol-vigil':(o,bx,by)=>{ B(bx - 31, by - 13, 62, 13, '#241923'); B(bx - 30, by - 14, 60, 1, '#9b6f86'); glow(bx, by - 18, 22, '216,183,223', .3 + .1 * Math.sin(time * 2.5)); },
  'shield-scratches':(o,bx,by)=>{ for(let i = -2; i <= 2; i++) for(let k = 0; k < 30; k++) B(bx + i * 12 - 16 + k, by - 5 - k * 1.5, 1, 1, 'rgba(216,183,223,.55)'); },
  'wind-gate-sail':(o,bx,by)=>{ if(o.threeSails){ sail(bx - 30, by, 40, 60); sail(bx, by, 40, 74); sail(bx + 30, by, 40, 60); } else sail(bx, by, 48, 80); },
  'needlewind-dead-sail':(o,bx,by)=>{ B(bx, by - 68, 2, 70, '#5d6667'); B(bx - 22, by - 44, 45, 1, '#7d8888'); B(bx - 18, by - 46, 2, 30, '#7d8888'); },
  'portal-gun-plinth':(o,bx,by)=>{ const ready = L.updraftsGateCount && L.updraftsGateCount() === 3, claimed = L.hasCapability && L.hasCapability('portal-single'); B(bx - 10, by - 14, 20, 14, T.stone); B(bx - 12, by - 16, 24, 2, T.stoneLit); if(!claimed){ B(bx - 3, by - 22, 6, 6, ready ? P.cyan : T.stoneDark); if(ready) glow(bx, by - 20, 20, '107,231,255', .4); } },
  'resin-streamer':(o,bx,by)=>{ const h = W2(o.h || 190), d = o.windDir || 1; B(bx, by - h, 3, h, P.wood); for(let i = 0; i < 14; i++) B(bx + 3 + d * i, by - h + 4 + Math.round(Math.sin(time * 4 + i * .6) * 2), 1, 2, i % 2 ? P.amber : P.ember); },
  'shotfall-camp':(o,bx,by)=>{ const w = W2(o.w || 620); alphaWrap(.85, () => { B(bx - w / 2, by - 6, w, 6, '#1b1714'); for(let x = -w / 2 + 20; x < w / 2 - 20; x += 60){ for(let i = 0; i < 12; i++) B(bx + x - 12 + i, by - 6 - i, 24 - i * 2, 1, i % 4 === 0 ? P.canvasDark : P.canvas); } }); },
  'fletcher-bench':(o,bx,by)=>{ const w = W2(o.w || 150); B(bx - w / 2, by - 17, w, 4, '#3b2a1d'); B(bx - w * .42, by - 17, 4, 17, '#3b2a1d'); B(bx + w * .36, by - 17, 4, 17, '#3b2a1d'); for(let i = 0; i < 4; i++) B(bx - w * .3 + i * 8, by - 24, 1, 7, T.stoneLit); },
  'faceless-mask-rack':(o,bx,by)=>{ const w = W2(o.w || 140), h = W2(o.h || 130); frame(bx, by, w, h, '#4c3b2d'); for(let i = 0; i < 3; i++){ const x = bx - w * .3 + i * w * .3; B(x - 3, by - h + 8 + (i % 2) * 6, 6, 8, '#d8d2c4'); B(x - 1, by - h + 10 + (i % 2) * 6, 2, 1, T.stoneDark); } },
  'veil-frame':(o,bx,by)=>{ const w = W2(o.w || 120), h = W2(o.h || 126); frame(bx, by, w, h, '#57483e'); for(let i = 0; i < h * .6; i++) B(bx - w * .3 + Math.round(Math.sin(time * 2 + i * .3) * 2), by - h + 3 + i, w * .6, 1, i % 3 ? 'rgba(200,190,170,.35)' : 'rgba(200,190,170,.2)'); },
  'mantlet-rail':(o,bx,by)=>{ const w = W2(o.w || 190); B(bx - w / 2, by - 59, w, 3, '#79664b'); for(const x of [-w * .35, w * .35]){ stepArc(bx + x, by - 55, 4, '#3a2d21', 4); } },
  'watch-brace':(o,bx,by)=>alphaWrap(.7, () => frame(bx, by, W2(o.w || 220), W2(o.h || 240), '#594633')),
  'watchtower-frame':(o,bx,by)=>alphaWrap(.75, () => { const w = W2(o.w || 320), h = W2(o.h || 390); frame(bx, by, w, h, '#4e3c2d'); B(bx - w * .3, by - h * .55, w * .6, 2, '#4e3c2d'); B(bx - w * .2, by - h - 10, w * .4, 10, '#3a2d21'); }),
  'windwright-brace':(o,bx,by)=>alphaWrap(.55, () => frame(bx, by, W2(o.w || 260), W2(o.h || 260), '#4b4640')),
  'bellows-rest':(o,bx,by)=>{ const w = W2(o.w || 620); B(bx - w / 2, by - 7, w, 7, '#201b17'); frame(bx, by, w * .8, 87, '#655641'); },
  'drop-hoist':(o,bx,by)=>{ const w = W2(o.w || 420), h = W2(o.h || 460); frame(bx, by, w, h, '#352a26'); chain(bx, by - h, by - h * .45); B(bx - 10, by - h * .45, 20, 8, T.stoneDark); },
  'chainwake-camp':(o,bx,by)=>{ B(bx - 75, by - 6, 150, 6, '#201817'); frame(bx, by, 110, 46, '#5e493d'); chain(bx - 20, by - 46, by - 20); chain(bx + 20, by - 46, by - 28); },
  'causeway-gears':(o,bx,by)=>{ const w = W2(o.w || 760), h = W2(o.h || 560); alphaWrap(.75, () => { B(bx - w / 2, by - 9, w, 9, '#211715'); cog(bx - w * .25, by - h * .45, 26, time * .4, T.stoneLit); cog(bx + w * .1, by - h * .6, 18, -time * .6, T.stoneLit); cog(bx + w * .32, by - h * .35, 22, time * .5, T.stoneLit); }); },
  'broken-causeway-gate':(o,bx,by)=>{ const w = W2(o.w || 900), h = W2(o.h || 650); alphaWrap(.6, () => { bricks(bx - w / 2, by - h * .6, 62, h * .6, o.x, o.y); bricks(bx + w / 2 - 62, by - h * .55, 62, h * .55, o.x + 1, o.y); B(bx - w / 2 + 62, by - h * .6, w * .3, 5, T.stoneDark); }); },
  'causeway-bow-rack':(o,bx,by)=>{ frame(bx, by, 60, 50, '#5e493d'); const bow = curG.pickups && curG.pickups.find(pk => pk.causewayBow && !pk.taken); if(bow){ stepArc(bx, by - 20, 12, P.amber, 2); B(bx - 12, by - 20, 24, 1, P.moon); glow(bx, by - 26, 18, '255,180,84', .3); } },
  'court-shaft':(o,bx,by)=>hall(bx, by, W2(o.w || 300), W2(o.h || 500), { alpha:.8, col:'#6b97aa', dark:'#0b1620' }),
  'rootbreach-lift':(o,bx,by)=>{ const w = W2(o.w || 760), h = W2(o.h || 720); alphaWrap(.8, () => { B(bx - w * .3, by - h, 6, h, '#3f352a'); B(bx + w * .3 - 6, by - h, 6, h, '#3f352a'); B(bx - w * .3, by - h, w * .6, 5, '#3f352a'); B(bx - 20, by - h * .4, 40, 30, T.stoneDark); B(bx - 20, by - h * .4, 40, 2, T.stoneLit); }); },
  'wind-root-aperture':(o,bx,by)=>{ const h = W2(o.h || 1600); alphaWrap(.9, () => { for(let i = 0; i < h; i += 2){ const k = i / h; B(bx - 55 + Math.round(Math.sin(k * 3) * 22), by - i, 13, 2, '#33291f'); B(bx + 42 - Math.round(Math.sin(k * 3) * 22), by - i, 13, 2, '#33291f'); } }); },
  'aerie-harness-rack':(o,bx,by)=>{ frame(bx, by, 42, 56, '#605442'); B(bx - 16, by - 47, 12, 10, '#4c6570'); B(bx - 12, by - 37, 4, 8, '#4c6570'); B(bx + 4, by - 47, 12, 10, '#4c6570'); },
  'gale-vault-seal':(o,bx,by)=>{ B(bx - 36, by - 105, 72, 105, '#211e22'); B(bx - 36, by - 105, 72, 2, '#6d8290'); B(bx - 36, by - 105, 2, 105, '#6d8290'); B(bx + 34, by - 105, 2, 105, '#6d8290'); const a = .4 + .12 * Math.sin(time * 2); ctx.globalAlpha = a; stepArc(bx, by - 52, 16, '#9fe0ff', 2); B(bx - 1, by - 70, 2, 40, '#9fe0ff'); ctx.globalAlpha = 1; glow(bx, by - 52, 30, '159,224,255', .15); },
  'signal-crown-distant':(o,bx,by)=>alphaWrap(.36, () => { stepArc(bx, by - 45, 27, '#9fe0ff', 2); for(let i = 0; i < 6; i++){ const a = i * Math.PI / 3; for(let k = 12; k < 46; k += 2) B(bx + Math.cos(a) * k, by - 45 + Math.sin(a) * k, 1, 1, '#9fe0ff'); } }),
  'windwright-route-board':(o,bx,by)=>{ plaque(bx, by, 52, 36, false, '#312b25'); for(let i = 0; i < 3; i++) stepArc(bx - 14 + i * 14, by - 22, 4, '#9fe0ff', 1); },
  'thermal-vent':(o,bx,by)=>{ const w = W2(o.w || 180); B(bx - w / 2, by - 10, w, 10, '#263038'); for(let x = -w * .35; x <= w * .35; x += w * .18) B(bx + x, by - 8, 2, 6, '#71838a'); glow(bx, by - 12, 20, '255,154,58', .12 + .06 * Math.sin(time * 3)); },
  'kite-stair':(o,bx,by)=>{ const w = W2(o.w || 1700), h = W2(o.h || 760); alphaWrap(.5, () => { for(let i = 0; i < 6; i++) sail(bx - w * .4 + i * w * .16, by - h * i / 7, 30, 50, '#5a4a39'); }); },
  'rain-catcher':(o,bx,by)=>{ const w = W2(o.w || 1460); alphaWrap(.7, () => { B(bx - w / 2, by - 16, w, 16, '#252b2d'); stepArc(bx, by - 10, Math.round(w * .37), '#53636a', 6); }); },
  'signal-crown':(o,bx,by)=>{ const w = W2(o.w || 1900), h = W2(o.h || 980), restored = L.updraftsGateCount && L.updraftsGateCount() === 3; alphaWrap(restored ? .85 : .6, () => { frame(bx, by, w * .7, h, '#414c53'); stepArc(bx, by - h * .78, Math.round(w * .09), restored ? '#9fe0ff' : '#414c53', 3); if(restored) glow(bx, by - h * .78, 60, '159,224,255', .25); }); },
  'service-lift':(o,bx,by)=>{ if(o.requiresShortcut && L.updraftsShortcutOpen && !L.updraftsShortcutOpen(o.requiresShortcut)) return; B(bx - 19, by - 75, 3, 75, '#5d6870'); B(bx + 16, by - 75, 3, 75, '#5d6870'); B(bx - 19, by - 75, 38, 3, '#5d6870'); B(bx - 12, by - 26, 24, 22, T.stoneDark); B(bx - 12, by - 26, 24, 2, T.stoneLit); },
  'resin-rack':(o,bx,by)=>{ frame(bx, by, 40, 30, '#4c3929'); for(let i = 0; i < 4; i++){ const y = by - 28 + ((time * 6 + i * 7) % 20 | 0); B(bx - 12 + i * 8, y, 2, 3, P.amber); } },
  'oathblade-counterweight':(o,bx,by)=>{ chain(bx, by - 60, by - 18); B(bx - 6, by - 18, 12, 14, T.stoneDark); B(bx - 6, by - 18, 12, 2, T.stoneLit); },
  'split-root-arch':(o,bx,by)=>{ const w = W2(o.w || 300), h = W2(o.h || 220); alphaWrap(.85, () => { for(let i = 0; i < h; i += 2){ const k = i / h; B(bx - w * .4 + Math.round(Math.sin(k * 2.2) * w * .25), by - i, 8, 2, P.wood); B(bx + w * .4 - 8 - Math.round(Math.sin(k * 2.2) * w * .25), by - i, 8, 2, P.wood); } }); },
  'root-seam':(o,bx,by)=>{ for(let i = 0; i < 30; i++) B(bx - 15 + i, by - 1 - Math.round(Math.sin(i * .5) * 2), 1, 2, P.root); for(let i = 0; i < 5; i++) B(bx - 12 + i * 6, by - 8 - (hash(i, 9) * 8 | 0), 1, 8, P.wood); },
  'whisper-marker':(o,bx,by)=>{ B(bx - 3, by - 16, 6, 16, T.stoneLit); B(bx - 2, by - 17, 4, 1, T.stoneLit); B(bx - 1, by - 12, 2, 6, o.read ? T.stoneDark : '#d8b7ff'); if(!o.read) nearGlow(o, '216,183,255', 12); },
  'hollow-ring':(o,bx,by)=>{ stepArc(bx, by - 20, 18, P.wood, 4); for(let x = -18; x <= 18; x++){ const y = Math.round(Math.sqrt(Math.max(0, 324 - x * x))); B(bx + x, by - 20 + y, 1, 3, P.wood); } },
  'clean-bandage':(o,bx,by)=>{ B(bx - 5, by - 3, 10, 3, '#e8e2d2'); B(bx - 3, by - 5, 6, 2, '#e8e2d2'); },
  'impact-scar':(o,bx,by)=>{ for(let i = 0; i < 12; i++) B(bx - 18 + i * 3, by - 1 - (hash(i, 4) * 3 | 0), 2, 1, T.stoneDark); B(bx - 6, by - 3, 12, 3, '#0e0b14'); },
  'anchor-tower':(o,bx,by)=>tower(bx, by, W2(o.w || 110), W2(o.h || 520), { light:true }),
  'release-frame':(o,bx,by)=>alphaWrap(.75, () => frame(bx, by, W2(o.w || 200), W2(o.h || 220), '#4e3c2d')),
  'watching-road':(o,bx,by)=>{},'mantlet-road':(o,bx,by)=>{},'windcut-gallery':(o,bx,by)=>{},'deadeye-court':(o,bx,by)=>{},'needlewind-labyrinth':(o,bx,by)=>{},
  'eastern-crown':(o,bx,by)=>hall(bx, by, W2(o.w || 800), W2(o.h || 500), { alpha:.7, col:'#49374f', dark:'#130e18' }),
  'blind-gallery':(o,bx,by)=>hall(bx, by, W2(o.w || 700), W2(o.h || 420), { alpha:.8, col:'#49374f', dark:'#130e18', bars:true }),
  'turning-cells':(o,bx,by)=>hall(bx, by, W2(o.w || 800), W2(o.h || 460), { col:'#49374f', dark:'#130e18', bars:true }),
  'open-cell-door':(o,bx,by)=>hall(bx, by, W2(o.w || 300), W2(o.h || 300), { col:'#49374f', dark:'#130e18', door:'#a38493' }),
  'red-court':(o,bx,by)=>hall(bx, by, W2(o.w || 700), W2(o.h || 480), { col:'#49374f', dark:'#160c14', arch:true, archCol:'#8d5c6f' }),
  'sentence-well':(o,bx,by)=>hall(bx, by, W2(o.w || 500), W2(o.h || 460), { col:'#49374f', dark:'#130e18', arch:true, archCol:'#8d5c6f' }),
  'sentence-threshold':(o,bx,by)=>hall(bx, by, W2(o.w || 240), W2(o.h || 320), { col:'#49374f', dark:'#130e18', door:'#6b4f66' }),
  'open-sentence-threshold':(o,bx,by)=>hall(bx, by, W2(o.w || 240), W2(o.h || 320), { col:'#49374f', dark:'#130e18', door:'#a38493' }),
  'hush-engine':(o,bx,by)=>{ B(bx - 30, by - 30, 60, 30, T.stoneDark); B(bx - 30, by - 30, 60, 2, T.stoneLit); wheel(bx, by - 42, 12, time * .8, '#b063b8'); glow(bx, by - 42, 26, '176,99,184', .25); },
  'frost-mine-mouth':(o,bx,by)=>mineMouth(bx, by, W2(o.w || 260), W2(o.h || 240), '#63788c'),
  'frost-mine':(o,bx,by)=>mineMouth(bx, by, W2(o.w || 200), W2(o.h || 180), '#647d8c'),
  'frost-tower':(o,bx,by)=>tower(bx, by, W2(o.w || 120), W2(o.h || 600), { light:true }),
  'frost-aqueduct':(o,bx,by)=>arcade(bx, by, W2(o.w || 700), W2(o.h || 360), '#3a5068'),
  'court-aqueduct':(o,bx,by)=>arcade(bx, by, W2(o.w || 700), W2(o.h || 360), '#3a5068'),
  'frost-seam':(o,bx,by)=>{ for(let i = 0; i < 40; i++) B(bx - 20 + i, by - 30 + Math.round(Math.sin(i * .4) * 3) + i * .3, 1, 2, '#0b1018'); },
  'frost-street':(o,bx,by)=>{ const w = W2(o.w || 400); B(bx - w / 2, by - 10, w, 10, T.stone); B(bx - w / 2, by - 10, w, 1, T.cap[1]); },
  'frost-muster-engine':(o,bx,by)=>{ const on = L.persistentCircuitOpen && L.persistentCircuitOpen('frost-muster'); B(bx - 34, by - 34, 68, 34, T.stoneDark); B(bx - 34, by - 34, 68, 2, T.stoneLit); wheel(bx, by - 46, 14, on ? time * .9 : .4, on ? P.amber : T.stoneLit); if(on) glow(bx, by - 46, 30, '255,180,84', .3); else nearGlow(o, '255,180,84', 40); },
  'frost-ledger':(o,bx,by)=>plaque(bx, by, 22, 16, !o.read), 'frost-slate-record':(o,bx,by)=>plaque(bx, by, 26, 16, !o.read, T.stone), 'frost-memory':(o,bx,by)=>plaque(bx, by, 20, 14, !o.read), 'frost-counter-relief':(o,bx,by)=>plaque(bx, by, 30, 20, false, T.stone),
  'court-wheel':(o,bx,by)=>{ const open = !!(o.open || (o.circuit && L.persistentCircuitOpen && L.persistentCircuitOpen(o.circuit))); B(bx - 30, by - 10, 60, 10, T.stoneDark); wheel(bx, by - 42, 32, open ? time * .35 : 0, '#6b97aa'); },
  'court-channel':(o,bx,by)=>{ const w = W2(o.w || 400); B(bx - w / 2, by - 14, w, 14, '#122a37'); for(let x = 0; x < w; x += 9) B(bx - w / 2 + ((x + time * 20) % w), by - 13, 4, 1, '#6b97aa'); },
  'court-bench':(o,bx,by)=>{ const w = W2(o.w || 120); B(bx - w / 2, by - 16, w, 6, '#54616a'); B(bx - w / 2 + 5, by - 10, 6, 10, '#54616a'); B(bx + w / 2 - 11, by - 10, 6, 10, '#54616a'); },
  'court-overlook':(o,bx,by)=>{ const w = W2(o.w || 300); B(bx - w / 2, by - 22, w, 4, '#72858e'); for(let x = 0; x < w; x += 12) B(bx - w / 2 + x, by - 22, 2, 22, '#54616a'); },
  'court-lockbox':(o,bx,by)=>{ B(bx - 10, by - 10, 20, 10, '#54616a'); B(bx - 10, by - 13, 20, 3, o.opened ? '#8fb3c8' : '#72858e'); if(!o.opened){ B(bx - 1, by - 8, 2, 3, P.amber); glow(bx, by - 8, 14, '255,180,84', .2); } },
  'court-doors':(o,bx,by)=>{ const w = W2(o.w || 200), h = W2(o.h || 260); B(bx - w / 2, by - h, w, h, '#54616a'); B(bx - w / 2 + 9, by - h + 11, w - 18, h - 11, '#101d29'); B(bx - 1, by - h + 11, 2, h - 11, '#6b97aa'); },
  'court-ember-door':(o,bx,by)=>{ const w = W2(o.w || 160), h = W2(o.h || 240); B(bx - w / 2, by - h, w, h, '#54616a'); B(bx - w / 2 + 8, by - h + 10, w - 16, h - 10, '#2a1410'); glow(bx, by - h * .5, 30, '255,154,58', .25); },
  'court-refuge':(o,bx,by)=>house(bx, by, W2(o.w || 300), W2(o.h || 240), true, { body:'#1c303e', roof:'#0e1a24' }),
  'court-glassworks':(o,bx,by)=>{ hall(bx, by, W2(o.w || 500), W2(o.h || 360), { alpha:.85, col:'#6b97aa', dark:'#0b1620', windows:'#9fe0ff' }); glow(bx, by - W2(o.h || 360) * .5, 40, '159,224,255', .12); },
  'court-gallery':(o,bx,by)=>arcade(bx, by, W2(o.w || 600), W2(o.h || 300), '#3a5068'),
};
for(const k of ['frost-refuge','frost-workers','frost-works','frost-court','frost-washhouse','frost-service']) STRUCT[k] = (o,bx,by) => {
  const warm = k === 'frost-refuge' || (k === 'frost-workers' && L.persistentCircuitOpen && L.persistentCircuitOpen('frost-hearths')) || (L.persistentCircuitOpen && L.persistentCircuitOpen('frost-thermal'));
  house(bx, by, W2(o.w || 320), W2(o.h || 260), warm, { body:'#1c303e', roof:'#0e1a24' });
  if(k === 'frost-works'){ const on = L.persistentCircuitOpen && L.persistentCircuitOpen('frost-thermal'); B(bx + W2(o.w || 320) * .3, by - W2(o.h || 260), 6, W2(o.h || 260) * .4, on ? '#be8955' : '#587886'); if(on) glow(bx + W2(o.w || 320) * .3 + 3, by - W2(o.h || 260), 16, '255,154,58', .3); }
};
function foundryArenaDecor(o){
  return curG.stageIndex === 10 && curG.boss && !curG.boss.dead && curG.boss.colossusForge &&
    o.x > 11600 && o.x < 15500 && !o.pourSpout && o.kind !== 'ember-forge-door';
}
function drawStructure(o){
  const fn = STRUCT[o.kind]; if(!fn) return false;
  if(o.keepVaultKey){ const bx = WX(o.x), by = WY(o.y || 0); B(bx - 41, by - 58, 82, 58, '#18151c'); B(bx - 41, by - 58, 82, 2, o.used ? '#5d5548' : '#a88b55'); stepArc(bx, by - 31, 13, o.used ? '#4a443b' : '#ffd76a', 2); if(!o.used) glow(bx, by - 31, 24, '255,215,106', .3); return true; }
  if(o.keepWallJump){ const bx = WX(o.x), by = WY(o.y || 0); B(bx - 24, by - 17, 48, 17, '#322923'); B(bx - 24, by - 17, 48, 1, '#8f745c'); for(let i = 0; i < 20; i++) B(bx - 10 + i, by - 8 - Math.round(Math.abs(Math.sin(i * .6)) * 6), 1, 2, '#d8c4a5'); nearGlow(o, '216,196,165', 20); return true; }
  fn(o, WX(o.x), WY(o.y || 0)); return true;
}

// ── Props ─────────────────────────────────────────────────────────────────
function nearGlow(o, rgb, r){
  const p = curG && curG.p; if(!p) return; const d = Math.abs(p.x - o.x); if(d > 140) return;
  glow(WX(o.x), WY(o.y || 0) - (r || 14), 18, rgb, (1 - d / 140) * (.12 + .06 * Math.sin(time * 5)));
}
function drawOpeningProp(o, bx, by){
  // Legacy footprints expressed in the shared buffer grid, with one-pixel
  // seams rather than enlarging the prototype's tiny sprites wholesale.
  switch(o.kind){
    case 'fallen-tent':
      for(let i = 0; i < 39; i++) B(bx - 46 + i, by - i, 92 - i * 2, 1, i % 13 === 0 ? P.canvasDark : '#68606a');
      B(bx - 10, by - 39, 2, 39, P.woodLit);
      for(let i = 0; i < 18; i++) B(bx - 4 + i / 2, by - i, 20 - i, 1, P.canvasDark);
      B(bx - 48, by - 1, 96, 2, T.stoneDark); return true;
    case 'broken-palisade':
      for(let i = -3; i <= 3; i++){ const h = 31 + Math.round(hash(i + 3, o.x) * 24), x = bx + i * 12; B(x - 3, by - h, 6, h, P.wood); B(x - 3, by - h, 1, h, P.woodLit); B(x - 2, by - h - 3, 4, 3, P.wood); B(x, by - h - 5, 1, 2, P.woodLit); }
      B(bx - 45, by - 19, 90, 3, P.canvasDark); return true;
    case 'survey-post':
      B(bx - 22, by - 44, 3, 44, P.wood); B(bx + 22, by - 30, 3, 30, P.wood);
      B(bx - 17, by - 39, 34, 23, P.woodLit); B(bx - 16, by - 38, 32, 21, P.canvasDark);
      for(let i = 0; i < 16; i++){ B(bx - 12 + i, by - 34 + i / 2, 1, 1, P.canvas); B(bx - 9 + i, by - 23 - i / 2, 1, 1, P.canvas); }
      for(let i = 0; i < 3; i++) B(bx - 10 + i * 9, by - 34 + i * 4, 2, 2, P.amber);
      return true;
    case 'mile-stone':
      B(bx - 9, by - 28, 18, 28, T.stone); B(bx - 7, by - 32, 13, 4, T.stone);
      B(bx - 9, by - 28, 1, 28, T.stoneLit); B(bx - 7, by - 33, 11, 1, T.stoneLit);
      B(bx - 3, by - 23, 7, 2, T.stoneDark); B(bx - 3, by - 16, 5, 2, T.stoneDark); return true;
    case 'dead-clock':
      B(bx - 17, by - 46, 34, 46, P.wood); B(bx - 16, by - 45, 32, 1, P.woodLit); B(bx - 14, by - 42, 28, 40, P.canvasDark);
      B(bx - 10, by - 40, 20, 19, T.stoneDark); B(bx - 8, by - 42, 16, 23, T.stoneDark);
      B(bx, by - 31, 8, 1, P.moon); for(let i = 0; i < 5; i++) B(bx - i, by - 31 - i, 1, 1, P.moon);
      B(bx, by - 17, 1, 11, P.woodLit); B(bx - 3, by - 9, 7, 6, P.woodLit); return true;
    case 'signal-mast':
      B(bx - 2, by - 108, 4, 108, P.wood); B(bx - 2, by - 108, 1, 108, P.woodLit);
      B(bx - 29, by - 82, 58, 2, P.woodLit); B(bx - 19, by - 52, 38, 2, P.woodLit);
      for(let i = 0; i < 27; i++) B(bx + 2, by - 103 + i, Math.max(2, 38 - i), 1, i % 9 ? '#67444d' : '#8a6566');
      B(bx - 2, by - 111, 4, 3, P.amber); return true;
    case 'breach-pylon':
      B(bx - 17, by - 59, 34, 59, T.stoneDark); B(bx - 13, by - 71, 26, 12, T.stone);
      B(bx - 6, by - 76, 16, 5, T.stone); B(bx - 13, by - 71, 1, 71, T.stoneLit);
      B(bx, by - 60, 2, 24, P.skyTop); B(bx - 5, by - 51, 12, 2, P.skyTop);
      if(o.vigilOpened) glow(bx, by - 48, 18, '216,196,143', .2); return true;
    case 'boundary-lantern':
      B(bx - 1, by - 63, 3, 63, P.wood); B(bx, by - 61, 18, 2, P.woodLit); B(bx + 16, by - 61, 1, 12, P.wood);
      B(bx + 12, by - 50, 9, 14, T.stoneDark); B(bx + 14, by - 48, 5, 10, P.amber); B(bx + 15, by - 47, 1, 7, P.moon);
      glow(bx + 16, by - 44, 28, '255,180,84', .3); return true;
    case 'mothlight-gate':
      B(bx - 31, by - 83, 62, 83, P.skyTop); B(bx - 24, by - 94, 48, 11, P.skyTop); B(bx - 14, by - 101, 28, 7, P.skyTop);
      for(const f of [-1, 1]){
        B(bx + f * 37 - 3, by - 75, 7, 75, P.wood); B(bx + f * 31 - 3, by - 89, 7, 18, P.wood);
        B(bx + f * 23 - 3, by - 99, 10, 13, P.wood); B(bx + f * 10 - 3, by - 105, 16, 7, P.wood);
        B(bx + f * 32, by - 75, 1, 62, P.woodLit);
      }
      for(const x of [-24, 0, 24]){ B(bx + x - 2, by - 70, 4, 7, P.moon); glow(bx + x, by - 66, 18, '214,227,161', .24); }
      return true;
    default: return false;
  }
}
function forestArch(bx, by, w, h){
  for(let y=0;y<h;y++){
    const k=y/h, span=w*Math.sqrt(Math.max(0,1-k*k));
    B(bx-span/2,by-y,span,1,'#0d1912');
    if(y<h-2){ B(bx-span/2-5,by-y,7,1,'#2d3824'); B(bx+span/2-2,by-y,7,1,'#2d3824'); }
    if(y%3===0){ B(bx-span/2-3,by-y,1,2,'#665637'); B(bx+span/2+2,by-y,1,2,'#4a482e'); }
  }
  for(const f of [-1,1]) pixelLimb(bx+f*w*.42,by-h*.25,bx+f*w*.63,by,8,'#2d3824');
}
function drawForestProp(o, bx, by){
  switch(o.kind){
    case 'dead-clock': case 'boundary-lantern': return drawOpeningProp(o,bx,by);
    case 'mothlight-gate': forestArch(bx,by,78,102); return true;
    case 'root-tunnel': {
      const w=W2(o.w || 360), h=W2(o.h || 390);
      forestArch(bx,by,w,h*.9);
      for(const f of [-1,1]) for(let i=0;i<4;i++) pixelLimb(bx+f*w*(.16+i*.1),by,bx+f*w*(.10+i*.055),by-h*(.62+i*.065),4,'#263820');
      B(bx-w*.22,by-1,w*.44,2,'#798350');
      for(let i=0;i<6;i++) B(bx-20+hash(i,7)*40,by-h*.25+Math.sin(time*1.8+i)*12,1,1,'#b3c690');
      return true;
    }
    case 'resin-rack':
      frame(bx,by,55,44,'#4b3927'); B(bx-25,by-28,50,2,'#70543a');
      for(let i=-1;i<=1;i++){ B(bx+i*15-5,by-29,10,18,'#2e2a1e'); B(bx+i*15-3,by-26,6,12,'#b8873d'); B(bx+i*15-2,by-25,1,6,'#d9b96c'); }
      return true;
    case 'resin-streamer': {
      const h=W2(o.h || 190), d=o.windDir || 1;
      B(bx-1,by-h,3,h,'#4b3927'); B(bx-1,by-h,1,h,'#70543a');
      pixelLimb(bx-8,by-h*.78,bx+8,by-h*.9,2,'#70543a');
      for(let i=0;i<32;i++) B(bx+d*i,by-h*.86+Math.sin(time*4-i*.2)*2+i*.08,1,3,i<3?'#f5cf79':'#d9a34a');
      for(let i=0;i<4;i++){ const travel=(time*19+i*15)%59; B(bx+d*(9+travel),by-h*.68+(i-1.5)*9+Math.sin(time*3+i)*3,3,1,'#a88b49'); }
      return true;
    }
    case 'bitten-tree': {
      const h=W2(o.h || 760), w=W2(o.w || 220)*.6;
      pixelLimb(bx,by,bx-3,by-h,w,'#202f20');
      for(let y=40;y<h;y+=48) pixelLimb(bx-w*.4,by-y,bx+w*.36,by-y-14,2,'#54482f');
      for(let i=-3;i<=3;i++){ B(bx+i*13-10,by-h-8+Math.abs(i)*3,20,7,'#2e452b'); B(bx+i*13-5,by-h-14+Math.abs(i)*3,10,7,'#2e452b'); }
      pixelLimb(bx-w*.3,by-30,bx-w*.65,by,9,'#202f20'); pixelLimb(bx+w*.3,by-30,bx+w*.65,by,9,'#202f20'); return true;
    }
    case 'mirror-stump': {
      const f=o.flip?-1:1;
      for(let y=0;y<57;y++){ const w=49-y*.55; B(bx-w/2,by-y,w,1,'#263725'); }
      pixelLimb(bx-10*f,by-30,bx-9*f,by-66,8,'#263725'); pixelLimb(bx+4*f,by-30,bx+10*f,by-59,7,'#263725');
      pixelLimb(bx-14,by-23,bx+14,by-32,1,'#75613c'); pixelLimb(bx-12,by-42,bx+9,by-51,1,'#75613c'); return true;
    }
    case 'hollow-ring': {
      const h=W2(o.h || 680), r=Math.min(37,W2(o.w || 170)*.42), cy=by-h*.54;
      pixelLimb(bx-27,cy+16,bx-34,by,9,'#293524'); pixelLimb(bx+27,cy+16,bx+34,by,9,'#293524');
      for(let x=-r;x<=r;x++){ const y=Math.sqrt(Math.max(0,r*r-x*x)); B(bx+x,cy-y,1,9,'#293524'); B(bx+x,cy+y-7,1,9,'#293524'); if(x>-r+3&&x<r-3) B(bx+x,cy-y+2,1,1,'#655334'); }
      return true;
    }
    case 'oathblade-stump':
      B(bx-36,by-6,72,6,'#293424'); B(bx-29,by-18,58,13,'#453e29'); B(bx-26,by-20,52,3,'#79653f');
      B(bx-20,by-18,40,1,'#aa8d54'); B(bx-13,by-16,26,1,'#aa8d54');
      for(const dx of [-25,-12,14,26]) pixelLimb(bx+dx,by-5,bx+dx*.7,by-17,2,'#645132');
      return true;
    case 'oathblade-counterweight': {
      const drop=o.released?14:0;
      chain(bx-14,by-48,by-17+drop,'#6b6246'); chain(bx+14,by-48,by-17+drop,'#6b6246');
      B(bx-21,by-20+drop,42,15,'#494537'); B(bx-21,by-20+drop,42,1,'#b69a61'); B(bx-2,by-14+drop,4,4,'#d6c58e'); return true;
    }
    case 'split-root-arch': forestArch(bx,by,76,98); return true;
    case 'root-seam':
      alphaWrap(o.used?.34:1,()=>{ B(bx-19,by-59,38,59,'#303a26'); for(let i=0;i<5;i++) pixelLimb(bx+(i%2?4:-5),by-54+i*10,bx+(i%2?-5:4),by-44+i*10,2,'#9b7743'); B(bx-13,by-36,26,1,'#695637'); }); return true;
    case 'whisper-marker':
      B(bx-9,by-33,18,33,'#303b2b'); B(bx-7,by-38,10,5,'#303b2b'); B(bx-7,by-34,1,31,'#718167');
      for(let i=0;i<3;i++) B(bx-3+i*2,by-28+i*6,1,4,o.read?'#53624a':'#a6b28b'); return true;
    default: return false;
  }
}
function drawCausewayLever(o){
  const x=WX(o.x), y=WY(o.y || 0), on=!!o.struck;
  if(o.bruteWakeLever || o.bruteDropRelease){
    const r=o.bruteDropRelease?6:5, col=on?'#625045':'#d2a16b';
    for(let dx=-r;dx<=r;dx++){const dy=Math.sqrt(Math.max(0,r*r-dx*dx)); B(x+dx,y-dy,1,2,col); B(x+dx,y+dy-1,1,2,col);}
    B(x-2,y-2,4,4,on?'#30231c':'#f3d19c');
    if(o.bruteWakeLever){B(x-r-7,y-1,6,2,'#74573f'); B(x+r+1,y-1,6,2,'#74573f');}
    if(o.flash>0) glow(x,y,16,'255,224,168',Math.min(.4,o.flash));
    return true;
  }
  if(o.repairCatch){
    const firstReady=curG.obstacles.some(q=>q.repairCatch==='causeway-catch-yard' && q.struck);
    const locked=o.repairCatch==='causeway-catch-rise' && (!firstReady || !(L.circuitOpen && L.circuitOpen('drop-yard')));
    B(x-9,y-5,18,6,'#423127'); B(x-9,y-5,18,1,'#987653');
    const tipX=x+(on?8:-7), tipY=y-(on?10:20);
    pixelLimb(x,y-5,tipX,tipY,3,locked?'#6b5e50':'#b68c5c'); B(tipX-2,tipY-2,5,4,locked?'#8d7860':'#e4bb7f');
    if(locked){ B(x-9,y-13,13,3,'#4e4135'); B(x-7,y-14,3,5,'#947552'); }
    return true;
  }
  return false;
}
function drawCausewayMass(o, bossWeight){
  const x=WX(o.x), y=WY(o.y), w=W2(o.w), h=W2(o.h), by=bossWeight?y:y-h;
  const warning=o.state==='warn', falling=bossWeight?o.active===1:o.state==='falling', settled=bossWeight?o.active===2:o.state==='landed';
  const shake=warning?Math.round(Math.sin(time*36)):0;
  B(x-w/2+shake,by,w,h,'#554033'); B(x-w/2+shake,by,w,2,o.flash>0?'#ffe2ae':'#ac8459'); B(x-w/2+shake,by+h-3,w,3,'#2e231e');
  B(x-w/2+3+shake,by+3,2,h-7,'#b68b5e'); B(x+w/2-5+shake,by+3,2,h-7,'#b68b5e');
  for(let i=0;i<3;i++){const px=x-w*.3+i*w*.3; B(px,by+5,2,h-11,'#392b22'); B(px-1,by+5,3,2,'#d1a36e');}
  B(x-6,by+h*.38,4,3,warning||falling?'#ffb36a':'#2a211c'); B(x+2,by+h*.38,4,3,warning||falling?'#ffb36a':'#2a211c');
  B(x-6,by+h*.65,12,2,settled?'#c69860':'#382820');
  if(bossWeight){
    const top=WY((o.y0 || 455)+155), ground=WY(0);
    if(!settled) for(const dx of [-w*.22,w*.22]) chain(x+dx,top+3,by,'#8c765d');
    else for(const dx of [-w*.22,w*.22]) for(let i=0;i<8;i++) B(x+dx+i*(dx<0?-1:1),by+2+i*3,2,2,'#74614d');
    B(x-w*.48,ground-1,w*.96,2,'#77543d'); for(let i=0;i<7;i++) B(x-w*.42+i*w*.14,ground-1,3,1,'#ba8960');
    if(o.flash>0) glow(x,by+h,40,'255,192,124',Math.min(.35,o.flash));
  }else{B(x-3,by-3,6,3,'#9f835f');}
  if(falling) for(const dx of [-w*.4,w*.4]){ B(x+dx,by-10,1,5,'#9a7759'); B(x+dx+3,by-16,1,4,'#70523e'); }
}
function drawCausewayProp(o,bx,by){
  switch(o.kind){
    case 'court-shaft': {
      if(o.courtAction!=='causeway-entry') return false;
      const w=W2(o.w || 120), h=W2(o.h || 170), open=!!(L.hasCapability && L.hasCapability('wall-jump') && L.hasCapability('double-jump'));
      // White stone and ascending treads retain the distant court's identity.
      // Its actual two-capability lock controls the raised entrance bar.
      B(bx-w/2,by-h,w,h,'#52656b'); B(bx-w/2+5,by-h+7,w-10,h-7,'#192d35');
      B(bx-w/2,by-h,w,3,'#a0b4b8'); B(bx-w/2,by-h+3,3,h-3,'#82999f'); B(bx+w/2-3,by-h+3,3,h-3,'#344750');
      for(let i=0;i<8;i++){const y=by-9-i*8, x=bx-w*.31+i*2; B(x,y,w*.55-i*2,2,open?'#819caa':'#526b78'); B(x,y+2,w*.55-i*2,4,'#293f49');}
      B(bx-w/2+4,by-3,w-8,3,'#a5bbc1');
      const barY=open?by-h+8:by-28;
      B(bx-w/2+5,barY,w-10,4,open?'#9bbbc5':'#746d5c'); B(bx-w/2+7,barY+1,w-14,1,open?'#d3e5e8':'#b09a74');
      if(open) glow(bx,by-h+16,22,'164,210,223',.16);
      return true;
    }
    case 'root-tunnel': forestArch(bx,by,W2(o.w || 300),W2(o.h || 340)*.9); return true;
    case 'drop-hoist': {
      const w=W2(o.w || 420), h=W2(o.h || 460);
      pixelLimb(bx-w/2,by,bx-w*.38,by-h,8,'#3e2e26'); pixelLimb(bx+w/2,by,bx+w*.38,by-h,8,'#3e2e26');
      B(bx-w*.4,by-h,w*.8,7,'#4d382b'); B(bx-w*.4,by-h,w*.8,1,'#8d6d4d');
      for(const f of [-1,1]){ pixelLimb(bx+f*w*.4,by-h*.7,bx+f*w*.19,by-h,3,'#71573e'); B(bx+f*w*.46-10,by-3,20,4,'#634936'); }
      wheel(bx,by-h+10,10,0,'#886746'); return true;
    }
    case 'chainwake-camp':
      frame(bx,by,160,78,'#46352b'); B(bx-42,by-29,84,11,'#6b4d37'); B(bx-42,by-29,84,2,'#af895a');
      for(const x of [-62,62]){ chain(bx+x,by-78,by-46,'#89745d'); B(bx+x-10,by-46,20,3,'#574536'); }
      B(bx-65,by-12,37,5,'#543b2c'); B(bx+32,by-12,41,5,'#543b2c'); return true;
    case 'causeway-gears': {
      const w=W2(o.w || 760), h=W2(o.h || 560);
      alphaWrap(.68,()=>{ B(bx-w/2,by,w,4,'#281c17');
        for(const [x,y,r] of [[-125,-90,44],[-35,-165,56],[77,-95,37],[142,-195,48]]) cog(bx+x,by+y,r,time*.08*(x<0?-1:1),'#614532');
        for(const f of [-1,1]) pixelLimb(bx+f*w*.36,by,bx+f*w*.42,by-h,3,'#493a2e'); B(bx-w*.42,by-h,w*.84,3,'#604935');
      }); return true;
    }
    case 'broken-causeway-gate': {
      const w=W2(o.w || 900), h=W2(o.h || 650), r=w*.42;
      for(let dx=-r;dx<=r;dx+=2){const y=Math.sqrt(Math.max(0,1-(dx/r)**2))*h*.82; B(bx+dx,by-20-y,2,10,'#39271f'); B(bx+dx,by-18-y,2,1,'#6e4d35');}
      for(const f of [-1,1]){ B(bx+f*w*.42-16,by-48,32,48,'#30231d'); B(bx+f*w*.42-16,by-48,32,2,'#715139'); }
      for(const k of [-.31,-.12,.12,.31]) chain(bx+w*k,by-h*.8,by-h*.22,'#554534');
      const fallen=!!curG.boss?.dead;
      for(let i=0;i<26;i++) B(bx-20+(fallen?-i*.7:0),by-h*.69+i+(fallen?40:0),Math.max(3,36-i*.7),1,i%8?'#70402e':'#a16440');
      return true;
    }
    case 'causeway-bow-rack':
      frame(bx,by,W2(o.w || 150),W2(o.h || 150),'#57432d'); B(bx-20,by-25,40,2,'#886a47');
      for(const x of [-15,15]) B(bx+x,by-28,2,5,'#b59868'); return true;
    default:return false;
  }
}
function drawCausewayPickup(pk){
  if(curG.stageIndex!==2 || !pk.causewayBow) return false;
  if(pk.taken) return true;
  const x=WX(pk.x), y=WY(pk.y || 0)-13;
  for(let i=-15;i<=15;i++) B(x+Math.round(Math.sqrt(Math.max(0,225-i*i))*.4),y+i,2,1,'#c09a5e');
  B(x,y-15,1,31,'#e0cb91'); B(x-2,y-3,5,6,'#6f4d30'); B(x+2,y-1,12,1,'#b9b398'); B(x+13,y-2,3,3,'#e0d9bd');
  return true;
}
function windRotor(x,y,r,angle,on){
  for(let i=0;i<6;i++){
    const a=angle+i*Math.PI/3,tx=Math.cos(a),ty=Math.sin(a),nx=-ty,ny=tx;
    pixelLimb(x+tx*3,y+ty*3,x+tx*r,y+ty*r,1,on?'#bfd9d8':'#829998');
    for(let k=4;k<r;k++)pixelLimb(x+tx*k,y+ty*k,x+tx*k+nx*(k/r)*7,y+ty*k+ny*(k/r)*7,2,on?'#8aafb2':'#556f79');
  }
  B(x-3,y-3,6,6,on?'#b9ded8':'#687b7b');B(x-1,y-1,2,2,on?'#e2f2df':'#bcc5a6');
}
function drawUpdraftsProp(o,x,y){
  switch(o.kind){
    case 'aerie-harness-rack': {
      const w=W2(o.w || 150),h=W2(o.h || 170),pk=curG.pickups.find(p=>p.jetpack&&!p.taken);
      frame(x,y,w,h,'#617472');B(x-w*.33,y-h+8,w*.66,2,'#9da58a');
      if(pk){const py=WY(pk.y)-14;chain(x-9,y-h+10,py,'#aaa68b');chain(x+9,y-h+10,py,'#aaa68b');}
      B(x-w*.4,y-2,w*.8,3,'#a5a785');return true;
    }
    case 'wind-gate-sail': {
      if(o.threeSails){for(let i=0;i<3;i++){const xx=x+(i-1)*28,hh=i===1?67:52,on=updraftsOpen('wind-gate-'+(i+1));B(xx,y-hh,2,hh,'#706956');windRotor(xx,y-hh+12,14,on?time*.5:0,on);}return true;}
      const h=W2(o.h || 360),w=W2(o.w || 190),on=updraftsOpen(o.gateId),r=Math.min(43,w*.43);
      B(x-2,y-h,4,h,'#536970');B(x-2,y-h,1,h,'#9aac9c');windRotor(x,y-h*.72,r,on?time*.38:0,on);
      B(x-11,y-4,22,4,'#596755');return true;
    }
    case 'portal-gun-plinth': {
      const claimed=L.hasCapability&&L.hasCapability('portal-single'),pk=curG.pickups.find(p=>p.portalSingle&&!p.taken),ready=!!pk&&!pk.ritualLocked;
      B(x-30,y-14,60,14,'#465c62');B(x-33,y-16,66,3,'#9baea3');B(x-23,y-28,46,12,'#3b4e55');B(x-23,y-28,46,2,'#7c989b');
      if(!claimed){
        B(x-16,y-39,27,10,ready?'#b7d2cc':'#788e8c');B(x-16,y-39,27,2,ready?'#e1ece0':'#91a19a');B(x-7,y-30,5,9,'#506a74');
        B(x+8,y-40,10,12,'#35566a');B(x+10,y-38,6,8,ready?'#8cd9eb':'#5d8597');B(x+12,y-37,2,6,ready?'#dffaff':'#88a7b2');
        if(!ready){B(x-22,y-35,4,15,'#7b887a');B(x+19,y-35,4,15,'#7b887a');}
        else glow(x+13,y-34,22,'133,205,224',.2);
      }else{stepArc(x,y-21,8,'#76969a',1);B(x-8,y-21,16,1,'#b4cfc4');}
      return true;
    }
    case 'signal-crown': {
      const w=W2(o.w || 1700),h=W2(o.h || 1020),on=updraftsOpen('all-wind-gates');
      for(const f of [-1,1]){pixelLimb(x+f*w*.45,y,x+f*w*.27,y-h,8,'#41555d');pixelLimb(x+f*w*.44,y,x+f*w*.26,y-h,1,'#829797');}
      B(x-w*.29,y-h,w*.58,5,'#78908e');B(x-2,y-h*.88,4,h*.88,'#627d83');
      for(const frac of [.21,.42,.64])B(x-w*.4,y-h*frac,w*.8,2,'#586e73');
      windRotor(x,y-h*.72,105,on?time*.22:.15,on);
      for(let i=0;i<3;i++){const live=updraftsOpen('wind-gate-'+(i+1)),xx=x+(i-1)*36,yy=y-h*.23;
        B(xx-10,yy-10,20,20,'#344950');stepArc(xx,yy,8,live?'#d1eee3':'#6c8589',2);for(let dx=-8;dx<=8;dx++)B(xx+dx,yy+Math.sqrt(Math.max(0,64-dx*dx)),1,2,live?'#9fcfc8':'#6c8589');B(xx-3,yy-3,6,6,live?'#ade3d7':'#263b45');
        if(live)glow(xx,yy,18,'160,217,211',.16);
      }
      return true;
    }
    case 'service-lift': {
      if(o.requiresShortcut && !(L.updraftsShortcutOpen&&L.updraftsShortcutOpen(o.requiresShortcut)))return true;
      const open=!!(L.updraftsShortcutOpen&&L.updraftsShortcutOpen(o.shortcutId || o.requiresShortcut)),w=W2(o.w || 120),h=W2(o.h || 180);
      frame(x,y,w,h,'#6b8182');B(x-w*.44,y-8,w*.88,8,'#3d5662');B(x-w*.44,y-8,w*.88,1,'#a1beb8');
      for(const f of [-1,1])chain(x+f*w*.25,y-h+5,y-8,'#91a498');
      if(!open){B(x-w*.35,y-22,w*.7,3,'#93846b');B(x-3,y-25,6,8,'#b4a57c');}
      else{B(x-5,y-30,10,5,'#9ccac5');B(x-3,y-31,6,1,'#ddedda');}
      return true;
    }
    case 'needlewind-dead-sail': {
      const h=W2(o.h || 120); B(x-1,y-h,2,h,'#6f7774');pixelLimb(x-21,y-h*.64,x+22,y-h*.67,2,'#7e8984');
      for(let i=0;i<22;i++){const ww=Math.max(2,37-i);B(x-18+i*.5,y-h*.65+i,ww,1,'#48545a');if(i>9)B(x-9,y-h*.65+i,3,1,'#283a41');}
      return true;
    }
    case 'windwright-brace': case 'bellows-rest': {
      const w=W2(o.w || 620),h=W2(o.h || 300),col=o.kind==='bellows-rest'?'#576057':'#465851';
      for(const f of [-1,1])pixelLimb(x+f*w*.45,y,x+f*w*.32,y-h*.7,4,col);B(x-w*.32,y-h*.7,w*.64,4,col);
      if(o.kind==='bellows-rest'){B(x-w*.4,y-6,w*.8,6,'#465349');for(let i=0;i<4;i++){const xx=x-w*.26+i*w*.17;B(xx,y-36,20,27,'#3d5050');B(xx+2,y-37,16,2,'#8a9a83');}}
      return true;
    }
    case 'rootbreach-lift': {
      const w=W2(o.w || 1480),h=W2(o.h || 760);
      for(const f of [-1,1])pixelLimb(x+f*w*.4,y+45,x+f*w*.3,y-h,5,'#4b5548');B(x-w*.3,y-h,w*.6,3,'#77816a');
      for(const f of [-1,1])chain(x+f*w*.27,y-h,y+25,'#7c826a');return true;
    }
    case 'kite-stair': {
      const w=W2(o.w || 2460),h=W2(o.h || 850);
      for(let i=0;i<7;i++){const xx=x-w*.35+i*w*.115,yy=y-75-(i%3)*85;pixelLimb(xx,y,xx+55,yy,2,'#596b60');
        for(let j=-12;j<=12;j++)B(xx+55-Math.max(1,12-Math.abs(j)),yy+j,Math.max(2,(12-Math.abs(j))*2),1,i%2?'#6b7d83':'#577d86');
        for(let j=0;j<20;j++)B(xx+55+Math.sin(time*2+j*.4+i)*2,yy+13+j,1,1,'#a8c8c8');
      }
      return true;
    }
    case 'rain-catcher': {
      const w=W2(o.w || 1880),h=W2(o.h || 560);
      for(let i=0;i<6;i++){const xx=x-w*.4+i*w*.16;B(xx,y-h*.62,3,h*.62,'#3d5962');B(xx,y-h*.62,1,h*.62,'#617d81');}
      B(x-w*.44,y-77,w*.88,4,'#668b96');B(x-w*.44,y-77,w*.88,1,'#a1bdba');B(x-w/2,y-9,w,9,'#304950');
      return true;
    }
    case 'needlewind-labyrinth': return true; // the actual tube owns this room's silhouette
    default:return false;
  }
}
function drawUpdraftsPickup(pk){
  if(curG.stageIndex!==3 || (!pk.jetpack&&!pk.portalSingle))return false;
  if(pk.taken || pk.portalSingle)return true;
  const x=WX(pk.x),y=WY(pk.y || 0);
  for(const f of [-1,1]){B(x+f*5-3,y-16,6,15,'#7c9e9f');B(x+f*5-3,y-16,6,2,'#c4d2b9');B(x+f*5-2,y-1,4,3,'#486573');B(x+f*5-1,y-13,1,10,'#b0c9bd');}
  B(x-2,y-14,4,11,'#5a6759');B(x-8,y-6,16,2,'#9d926b');
  if(pk.ritualLocked){pixelLimb(x-11,y-18,x+11,y-2,1,'#b8ac83');pixelLimb(x+11,y-18,x-11,y-2,1,'#b8ac83');}
  return true;
}
function drawForestPickup(pk){
  if(curG.stageIndex !== 1 || !['oathblade-stump','canopy-veteran-rack'].includes(pk.sourceKind)) return false;
  if(pk.taken) return true;
  const bx=WX(pk.x), by=WY(pk.y || 0);
  if(pk.sourceKind==='oathblade-stump'){
    // One sword belongs to the stump. Released roots hang loose, and taking
    // the permanent weapon removes it rather than leaving a second prop blade.
    B(bx-1,by-33,2,24,P.blade); B(bx,by-33,1,21,'#99b6ad'); B(bx-6,by-13,12,2,'#c4a868'); B(bx-1,by-12,2,7,'#514731');
    const stump=curG.obstacles.find(o=>o.weaponAwakening), bound=stump && !stump.weaponReleased;
    for(const dx of [-12,-4,6,14]) pixelLimb(bx+dx,by+2,bx+(bound?dx*.18:dx*1.3),by-(bound?26:5),2,'#79633c');
    if(!bound) glow(bx,by-23,18,'216,196,143',.17);
  }else{
    frame(bx,by,28,25,'#51452e'); B(bx-7,by-24,14,3,'#c1c9a5');
    for(let y=0;y<18;y++){ const w=12+y*.45; B(bx-w/2,by-21+y,w,1,y%6===0?'#acc9ab':'#668b77'); }
    B(bx-2,by-21,2,17,'#506c61'); B(bx+4,by-19,2,11,'#86ac91');
  }
  return true;
}
/* THE DROWNED THRONE'S FURNITURE. The region had NONE: its props were named
   `citadel-*`, no drawer claimed those names, and `drawProp` fell through the switch
   and drew nothing at all. So the last region of the game was literally empty scenery.
   Its look is the Citadel's stone, drowned: the same violet slate with a waterline
   across everything at a constant height, salt bleaching below it, and gold only on
   the King's own marks. */
const THRONE = { slate:'#2a1c3e', lit:'#453063', dark:'#150d24',
                 water:'#3d6a7a', salt:'#6d7f88', gold:'#ffd700' };
function throneWaterline(bx, w, by, h){
  // One constant height across every prop in the region, so the room reads as flooded
  // rather than as a set of individually wet objects.
  const wl = by - Math.round(h * .34);
  B(bx - (w >> 1), wl, w, Math.max(1, Math.round(Z * 2)), THRONE.water);
  B(bx - (w >> 1), wl + Math.round(Z * 2), w, Math.round(h * .34), 'rgba(61,106,122,.16)');
  return wl;
}
/* THE DEEP LINE'S FURNITURE. The region had none — not a single Scenery in 13,950
   units — so there was nothing to draw and nothing to draw it with. Its look is the
   Keep's stone seen from underneath: a rail bed on sleepers, iron-banded tunnel mouths,
   and the ore-light that is the only thing burning down here. */
const DEEP = { stone:'#2a1d18', lit:'#4a352a', dark:'#160e0b', iron:'#6b5a4a', ore:'#ffb04a' };
function drawDeepProp(o, bx, by){
  const k = o.kind;
  if(k === 'rail-cart') return drawRailCart(o, bx, by);
  if(!/^rail-/.test(k || '')) return false;
  const w = W2(o.w || 200), h = W2(o.h || 300);
  switch(k){
    case 'rail-gate': {
      // A tunnel mouth: an iron-banded arch with the line running out of it. The tail
      // gate carries a lamp, so the way ON is legible from the cart at speed.
      B(bx - (w >> 1), by - h, w, h, DEEP.dark);
      B(bx - (w >> 1), by - h, w, Math.max(2, Math.round(Z * 5)), DEEP.iron);
      for(const sx of [bx - (w >> 1), bx + (w >> 1) - Math.max(2, Math.round(Z * 7))])
        B(sx, by - h, Math.max(2, Math.round(Z * 7)), h, DEEP.stone);
      for(let i = 1; i < 4; i++){ const yy = by - Math.round(h * i / 4);
        B(bx - (w >> 1) + Math.round(Z * 7), yy, w - Math.round(Z * 14), Math.max(1, Math.round(Z * 2)), DEEP.lit); }
      // the rail itself, running through the mouth
      B(bx - (w >> 1), by - Math.round(Z * 3), w, Math.max(1, Math.round(Z * 2)), DEEP.iron);
      if(o.railHead){ B(bx - 1, by - h - Math.round(Z * 9), Math.max(2, Math.round(Z * 3)), Math.round(Z * 9), DEEP.stone);
        glow(bx, by - h - Math.round(Z * 7), Math.round(24 * Z), '255,176,74', .4); }
      else glow(bx, by - h * .5, Math.round(26 * Z), '74,53,42', .22);
      return true;
    }
    case 'rail-sleepers': {
      const n = Math.max(2, Math.round(w / Math.max(6, Z * 26)));
      for(let i = 0; i < n; i++)
        B(bx - (w >> 1) + Math.round(i * w / n), by - Math.round(Z * 4), Math.max(1, Math.round(Z * 5)), Math.round(Z * 4), DEEP.stone);
      B(bx - (w >> 1), by - Math.round(Z * 5), w, Math.max(1, Math.round(Z * 2)), DEEP.iron);
      return true;
    }
    case 'rail-orelight': {
      B(bx - Math.round(Z * 4), by - Math.round(Z * 16), Math.round(Z * 8), Math.round(Z * 16), DEEP.stone);
      B(bx - Math.round(Z * 3), by - Math.round(Z * 20), Math.round(Z * 6), Math.round(Z * 5), DEEP.ore);
      glow(bx, by - Math.round(Z * 18), Math.round(22 * Z), '255,176,74', .35);
      return true;
    }
  }
  return false;
}
function drawThroneProp(o, bx, by){
  const k = o.kind;
  // The mine mouth and its cart are shared with the Deep Line and the Keep, so the
  // Throne's east end draws the same adit the line actually comes out of.
  if(k === 'rail-cart') return drawRailCart(o, bx, by);
  if(k === 'rail-gate') return drawDeepProp(o, bx, by);
  /* THE BEACH. Act 1's last room is the only warm-coloured thing in the region: wet sand,
     a tideline that actually moves, and a hull on its side waiting for three countries'
     worth of parts. It reads as OUT — the one place in the Throne that is not stone. */
  if(k === 'throne-tide'){
    const w = W2(o.w || 900), h = Math.max(4, W2(o.h || 160));
    for(let i = 0; i < 4; i++){
      const yy = by - Math.round(i * h * .22) - Math.round((Math.sin((time || 0) * .6 + i) * 2) * Z);
      B(bx - (w >> 1), yy, w, Math.max(1, Math.round(Z * 3)), i ? 'rgba(74,122,138,.5)' : '#6d9fb0');
    }
    B(bx - (w >> 1), by, w, Math.max(2, Math.round(Z * 5)), '#8a7a5e');   // wet sand
    glow(bx, by - Math.round(h * .3), Math.round(w * .5), '109,159,176', .14);
    return true;
  }
  if(k === 'throne-boat'){
    const w = Math.max(12, W2(o.w || 190)), h = Math.max(8, W2(o.h || 120));
    const whole = !!(L.shipComplete && L.shipComplete());
    const HULL = '#6a5030', LIP = '#c9a860', CANVAS = '#cfc4a8';
    // hull, canted on the sand
    ctx.save(); ctx.translate(bx, by); ctx.rotate(whole ? -0.05 : -0.26);
    B(-(w >> 1), -Math.round(h * .5), w, Math.round(h * .42), HULL);
    B(-(w >> 1), -Math.round(h * .5), w, Math.max(1, Math.round(Z * 3)), LIP);
    if(whole){
      B(-Math.round(Z * 2), -h - Math.round(h * .5), Math.max(2, Math.round(Z * 4)), h, HULL);   // mast
      ctx.fillStyle = CANVAS;
      ctx.beginPath(); ctx.moveTo(0, -h - Math.round(h * .45));
      ctx.lineTo(Math.round(w * .42), -Math.round(h * .62));
      ctx.lineTo(0, -Math.round(h * .58)); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    if(whole) glow(bx, by - Math.round(h * .6), Math.round(34 * Z), '207,196,168', .22);
    return true;
  }
  if(!/^throne-/.test(k || '')) return false;
  const w = W2(o.w || 200), h = W2(o.h || 300);
  switch(k){
    case 'throne-gate': {
      // A drowned arch. The rail head carries a lantern so the way OUT is legible.
      B(bx - (w >> 1), by - h, w, h, THRONE.dark);
      B(bx - (w >> 1), by - h, w, Math.max(2, Math.round(Z * 5)), THRONE.lit);
      B(bx - (w >> 1), by - h, Math.max(2, Math.round(Z * 6)), h, THRONE.slate);
      B(bx + (w >> 1) - Math.max(2, Math.round(Z * 6)), by - h, Math.max(2, Math.round(Z * 6)), h, THRONE.slate);
      for(let i = 1; i < 4; i++){ const yy = by - Math.round(h * i / 4);
        B(bx - (w >> 1) + Math.round(Z * 6), yy, w - Math.round(Z * 12), Math.max(1, Math.round(Z)), THRONE.dark); }
      throneWaterline(bx, w, by, h);
      if(o.railHead){ B(bx - 1, by - h - Math.round(Z * 10), Math.max(2, Math.round(Z * 3)), Math.round(Z * 10), THRONE.slate);
        glow(bx, by - h - Math.round(Z * 8), Math.round(22 * Z), '255,215,0', .3); }
      else glow(bx, by - h * .5, Math.round(26 * Z), '69,48,99', .22);
      return true;
    }
    case 'throne-stele': {
      // A standing stone. A triptych carries three marks; a lore stone carries one lit.
      B(bx - (w >> 1), by - h, w, h, THRONE.slate);
      B(bx - (w >> 1), by - h, w, Math.max(1, Math.round(Z * 3)), THRONE.lit);
      const marks = o.triptych ? 3 : 1;
      for(let i = 0; i < marks; i++){
        const yy = by - Math.round(h * (.72 - i * .2));
        B(bx - Math.round(w * .28), yy, Math.round(w * .56), Math.max(1, Math.round(Z * 3)),
          o.read ? THRONE.salt : THRONE.gold);
      }
      throneWaterline(bx, w, by, h);
      if(!o.read) glow(bx, by - h * .65, Math.round(16 * Z), '255,215,0', .2);
      return true;
    }
    case 'throne-refuge': {
      // The Right Hand's hall: a wide dark bay with two lit flanks — his two faces,
      // echoed in the architecture so the arena reads before he steps out of it.
      B(bx - (w >> 1), by - h, w, h, THRONE.dark);
      B(bx - (w >> 1), by - h, w, Math.max(2, Math.round(Z * 4)), THRONE.lit);
      for(const sx of [bx - (w >> 1), bx + (w >> 1) - Math.round(Z * 8)])
        B(sx, by - h, Math.max(2, Math.round(Z * 8)), h, THRONE.slate);
      for(let i = -2; i <= 2; i++){ const cx = bx + i * Math.round(w * .18);
        B(cx - Math.round(Z * 3), by - Math.round(h * .74), Math.round(Z * 6), Math.round(h * .74), THRONE.slate); }
      throneWaterline(bx, w, by, h);
      glow(bx, by - h * .6, Math.round(w * .5), '196,123,255', .14);
      return true;
    }
    case 'throne-terrace': {
      // The overlook: you see the arena floor and both of his marks from up here.
      B(bx - (w >> 1), by - h, w, Math.round(h * .16), THRONE.slate);
      B(bx - (w >> 1), by - h, w, Math.max(1, Math.round(Z * 3)), THRONE.lit);
      for(let i = -2; i <= 2; i++)
        B(bx + i * Math.round(w * .2) - Math.round(Z * 2), by - h + Math.round(h * .16),
          Math.round(Z * 4), Math.round(h * .84), THRONE.slate);
      throneWaterline(bx, w, by, h);
      return true;
    }
  }
  return false;
}
function drawProp(o){
  if(o.gone) return;
  const k = o.kind, bx = WX(o.x), by = WY(o.y || 0);
  if(curG.stageIndex === 0 && drawOpeningProp(o, bx, by)) return;
  if(curG.stageIndex === 1 && drawForestProp(o, bx, by)) return;
  if(curG.stageIndex === 2 && drawCausewayProp(o,bx,by)) return;
  if(curG.stageIndex === 3 && drawUpdraftsProp(o,bx,by)) return;
  if(curG.stageIndex === 4 && drawMarksmanProp(o,bx,by)) return;
  if(curG.stageIndex === 5 && drawKeepProp(o,bx,by)) return;
  if(curG.stageIndex === 6 && drawGaolProp(o,bx,by)) return;
  if(curG.stageIndex === 7 && drawFrostProp(o,bx,by)) return;
  if(curG.stageIndex === 8 && drawCourtProp(o,bx,by)) return;
  if(curG.stageIndex === 13 && drawThroneProp(o,bx,by)) return;
  if(curG.stageIndex === 15 && drawDeepProp(o,bx,by)) return;
  if(o.keepVaultKey || o.keepWallJump || o.musterStandard){ if(o.musterStandard){ B(bx, by - 59, 2, 59, '#5b4a38'); for(let i = 0; i < 12; i++) B(bx + 2, by - 58 + i, 22 - i + Math.round(Math.sin(time * 3 + o.x * .01) * 2), 1, i % 5 === 0 ? '#e8d9b8' : '#7d1f2e'); return; } drawStructure(o); return; }
  if(o.frostArchitecture && drawStructure(o)) return;
  if(o.w > 2000 && !STRUCT[k]) return;
  switch(k){
    case 'fallen-tent': B(bx - 14, by - 1, 28, 2, P.canvasDark); for(let i = 0; i < 9; i++) B(bx - 12 + i, by - 1 - i, 24 - i * 2, 1, i % 4 === 0 ? P.canvasDark : P.canvas); B(bx - 2, by - 12, 4, 12, P.wood); B(bx + 6, by - 3, 6, 1, P.canvasDark); break;
    case 'watchfire': case 'frost-brazier': B(bx - 6, by - 2, 12, 2, P.wood); B(bx - 4, by - 4, 3, 2, P.woodLit); B(bx + 2, by - 4, 3, 2, P.woodLit); if(o.warmAsh){ B(bx - 2, by - 5, 4, 2, '#5a2a1a'); } else { glow(bx, by - 6, 26, '255,154,58', .45); for(let i = 0; i < 5; i++){ const h = 4 + ((Math.sin(time * 9 + i * 1.7) + 1) * 3 | 0); B(bx - 2 + (i - 2) * 1.5, by - 4 - h, 2, h, i % 2 ? P.ember : P.amber); } } break;
    case 'white-trumpets': for(let i = 0; i < 5; i++){ const x = bx - 10 + i * 5, h = 5 + (hash(i, o.x) * 5 | 0); B(x, by - h, 1, h, P.grassDark); B(x - 1, by - h - 2, 3, 2, P.moon); B(x, by - h - 3, 1, 1, P.moon); } break;
    case 'survey-post': B(bx, by - 26, 2, 26, P.wood); B(bx + 2, by - 25, 9, 5, P.amber); B(bx + 2, by - 25, 9, 1, P.moon); B(bx - 2, by - 1, 6, 1, P.woodLit); break;
    case 'mile-stone': B(bx - 4, by - 9, 8, 9, T.stoneLit); B(bx - 3, by - 10, 6, 1, T.stoneLit); B(bx - 2, by - 6, 4, 1, T.stoneDark); B(bx - 4, by - 1, 8, 1, T.stoneDark); break;
    case 'collapsed-stretcher': B(bx - 10, by - 2, 20, 1, P.wood); B(bx - 10, by - 5, 20, 1, P.wood); B(bx - 7, by - 5, 14, 3, P.canvas); B(bx + 8, by - 9, 2, 7, P.wood); break;
    case 'broken-palisade': for(let i = 0; i < 5; i++){ const h = 8 + (hash(i, o.x) * 10 | 0); B(bx - 10 + i * 5, by - h, 3, h, i % 2 ? P.wood : P.woodLit); B(bx - 10 + i * 5, by - h, 3, 1, P.canvasDark); } B(bx - 11, by - 6, 22, 1, P.wood); break;
    case 'abandoned-kit': B(bx - 5, by - 5, 10, 5, P.canvasDark); B(bx - 4, by - 6, 8, 1, P.canvas); B(bx + 5, by - 3, 3, 3, T.stoneLit); B(bx - 8, by - 2, 3, 2, P.amber); break;
    case 'signal-mast': B(bx, by - 60, 2, 60, P.wood); B(bx - 4, by - 58, 10, 1, P.woodLit); B(bx - 4, by - 40, 10, 1, P.woodLit); B(bx + 2, by - 57, 7, 4, P.danger); B(bx, by - 62, 2, 2, ((time * 2) | 0) % 2 ? P.amber : P.ember); break;
    case 'boundary-lantern': B(bx, by - 24, 2, 24, P.wood); B(bx - 3, by - 28, 8, 6, T.stoneDark); B(bx - 2, by - 27, 6, 4, ((time * 3) | 0) % 3 ? P.amber : P.moon); glow(bx + 1, by - 25, 22, '255,180,84', .4); break;
    case 'mothlight-gate': case 'root-tunnel': B(bx - 16, by - 44, 5, 44, T.stone); B(bx + 11, by - 44, 5, 44, T.stone); B(bx - 16, by - 48, 32, 5, T.stoneLit); B(bx - 11, by - 43, 22, 43, P.skyTop); for(let i = 0; i < 4; i++) B(bx - 8 + i * 5, by - 20 + Math.round(Math.sin(time * 2 + i) * 3), 1, 1, P.moon); break;
    case 'dead-clock': case 'keep-clock': B(bx - 6, by - 20, 12, 20, T.stoneDark); B(bx - 4, by - 17, 8, 8, P.moon); B(bx, by - 13, 1, 3, P.stoneLine); B(bx, by - 13, 3, 1, P.stoneLine); break;
    case 'patrol-cache': case 'overlook-cache': B(bx - 6, by - 6, 12, 6, P.wood); B(bx - 6, by - 7, 12, 1, P.woodLit); B(bx - 1, by - 5, 2, 2, P.amber); break;
    case 'watch-standard': B(bx, by - 30, 2, 30, P.wood); B(bx + 2, by - 29, 10, 7, P.cloak); B(bx + 2, by - 29, 10, 1, P.cloakLit); break;
    case 'breach-pylon': B(bx - 5, by - 22, 10, 22, T.stone); B(bx - 4, by - 24, 8, 2, T.stoneLit); B(bx - 1, by - 16, 2, 8, P.eye); break;
    case 'rest-stool': B(bx - 4, by - 5, 8, 2, P.woodLit); B(bx - 3, by - 3, 1, 3, P.wood); B(bx + 2, by - 3, 1, 3, P.wood); break;
    case 'bitten-tree': case 'mirror-stump': case 'oathblade-stump': B(bx - 5, by - 14, 10, 14, P.wood); B(bx - 4, by - 15, 8, 1, P.woodLit); B(bx - 6, by - 2, 12, 2, P.canvasDark); if(k === 'oathblade-stump' && !o.taken){ B(bx - 1, by - 26, 2, 12, P.blade); B(bx - 3, by - 16, 6, 1, P.amber); glow(bx, by - 20, 16, '223,246,255', .3); } break;
    default: if(!drawStructure(o)) legacyDraw(L.byType.scenery, o);   // anything still unconverted keeps its legacy drawing
  }
}
function drawCheckpoint(o){
  const bx = WX(o.x), by = WY(o.y || 0), on = o.active;
  B(bx, by - 30, 2, 30, P.wood); B(bx - 1, by - 1, 4, 1, P.woodLit);
  for(let i = 0; i < 9; i++) B(bx + 2, by - 29 + i, 9 - (i > 6 ? (i - 6) * 3 : 0), 1, on ? (i < 2 ? P.moon : P.amber) : T.stoneLit);
  if(on) glow(bx + 5, by - 25, 20, '255,180,84', .35);
}
function drawBrazier(o){
  const bx = WX(o.x), by = WY(o.y || 0), lit = !!(o.lit || o.active || o.used);
  B(bx - 7, by - 2, 14, 2, T.stoneDark); B(bx - 5, by - 6, 10, 4, T.stone); B(bx - 6, by - 7, 12, 1, T.stoneLit); B(bx - 1, by - 10, 2, 3, T.stoneDark);
  if(lit){ glow(bx, by - 12, 30, '255,154,58', .5); for(let i = 0; i < 5; i++){ const h = 4 + ((Math.sin(time * 9 + i * 1.7) + 1) * 3 | 0); B(bx - 3 + i * 1.5, by - 10 - h, 2, h, i % 2 ? P.ember : P.amber); } }
  else { B(bx - 3, by - 8, 6, 1, '#5a2a1a'); nearGlow(o, '255,154,58', 10); }
}
function drawSpring(o){ const bx = WX(o.x), by = WY(o.y || 0); const c = 1 + Math.round(Math.sin((o.anim || 0) * 9) * 1); for(let i = 0; i < 3; i++) B(bx - 5, by - 2 - i * (2 + c), 10, 1, T.stoneLit); B(bx - 6, by - 8 - c * 2, 12, 2, P.amber); }
function drawUpdraft(o){ if(curG.stageIndex===3) return drawUpdraftsField(o); const bx = WX(o.x - o.w / 2), by = WY(o.y || 0), w = Math.round(o.w * Z), h = Math.round(o.h * Z); for(let i = 0; i < 8; i++){ const t = (time * .6 + i * .13) % 1; B(bx + (hash(i, 3) * w | 0), by - t * h, 1, 3, `rgba(200,240,255,${(1 - t) * .5})`); } }
function drawStake(o){
  const bx = WX(o.x), by = WY(o.y || 0), col = o.accent || P.amber;
  if(!o.aligned) nearGlow(o, '201,154,114', 12);
  B(bx, by - 23, 2, 23, P.wood); B(bx - 3, by - 1, 8, 1, P.woodLit);
  if(o.aligned){ B(bx - 6, by - 22, 15, 2, col); B(bx + 8, by - 24, 2, 6, col); B(bx, by - 23, 2, 4, P.moon); }
  else { for(let i = 0; i < 7; i++) B(bx - 4 + i, by - 25 + i, 2, 2, T.stoneLit); B(bx, by - 23, 2, 2, P.canvas); }
}
function drawSign(o){ const bx = WX(o.x), by = WY(o.y || 0); if(o.lore && !o.read) nearGlow(o, '216,196,143', 16); B(bx - 1, by - 14, 2, 14, P.wood); B(bx - 7, by - 20, 14, 7, P.woodLit); B(bx - 6, by - 19, 12, 5, P.wood); B(bx - 4, by - 17, 8, 1, P.canvas); }
function drawCoin(o){ if(o.taken) return; const bx = WX(o.x), by = WY(o.y || 0) - 6 + Math.round(Math.sin(time * 3) * 2); const w = Math.abs(Math.cos(time * 3)) * 3 + 1 | 0; B(bx - w, by - 3, w * 2, 6, P.amber); B(bx - w + 1, by - 2, 1, 4, P.moon); }
function drawRelic(o){ const bx = WX(o.x), by = WY(o.y || 0); if(o.found) return; nearGlow(o, '255,233,196', 6); B(bx - 3, by - 8, 6, 2, P.amber); B(bx - 2, by - 6, 4, 4, P.moon); B(bx - 4, by - 2, 8, 2, P.amber); glow(bx, by - 5, 18, '255,233,196', .35); }

/* THE SEAM THE TYRANT LEAVES. Drawn where the body folded, for the two and a half
   seconds after it: one vertical line that closes from both ends toward its middle,
   which is the shape a portal makes when it shuts — not the shape anything makes
   when it dies. It is the whole of the tell, and it is meant to be noticed and not
   yet understood. */

/* A RIDEABLE SEAM. It has to read as a thing with TWO MOUTHS, because what the knight
   aims a dash at is an END, never the middle: the ends are solid and the span between
   them is only hinted. A shut seam keeps its ends visible but hollow, so a timed one
   can be READ AHEAD rather than memorised. */
function drawRideSeam(o){
  if(o.gone) return;
  const open = L.seamOpen ? L.seamOpen(o) : true;
  const ax = WX(o.ax), ay = WY(o.ay), bx = WX(o.bx), by = WY(o.by);
  /*   A LINE NOBODY HAS POWERED HANGS SLACK. A gated seam whose circuit is shut used to
     draw exactly like one between beats — dim and dashed — so "not yet" and "not now"
     looked identical and the post that powers it had nothing visible to change. Unpowered,
     it is a grey cable sagging between two dark anchors; powered, it snaps to the taut
     violet tear every other seam is. The wire from its post (drawCircuitLinks) lights at
     the same moment. */
  if(o.gate && !(L.gateOpen ? L.gateOpen(o) : (L.circuitOpen && L.circuitOpen(o.gate)))){
    ctx.save(); ctx.lineCap = 'round'; ctx.globalAlpha = .7;
    ctx.strokeStyle = '#5c5868'; ctx.lineWidth = Math.max(1, Math.round(3 * Z));
    const mx = (ax + bx) / 2, my = Math.max(ay, by) + Math.round(70 * Z);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(mx, my, bx, by); ctx.stroke();
    for(const m of [[ax, ay], [bx, by]]){
      const r = Math.round(9 * Z);
      B(Math.round(m[0] - Math.max(1, Z * 2)), m[1] - r, Math.max(2, Math.round(Z * 4)), r * 2, '#3e3a48');
    }
    ctx.restore(); return;
  }
  ctx.save(); ctx.lineCap = 'round';
  ctx.globalAlpha = o.spent ? 0.16 : (open ? 0.95 : 0.3);
  ctx.strokeStyle = open ? 'rgba(196,123,255,.8)' : 'rgba(120,96,150,.75)';
  ctx.lineWidth = Math.max(1, Math.round((open ? 5 : 2) * Z));
  if(!open) ctx.setLineDash([Math.round(5 * Z), Math.round(8 * Z)]);
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
  ctx.setLineDash([]);
  if(open){
    ctx.strokeStyle = 'rgba(241,214,255,.95)';
    ctx.lineWidth = Math.max(1, Math.round(1.6 * Z));
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    // motes running the length, so the direction of travel is legible at a glance
    const len = Math.hypot(bx - ax, by - ay) || 1, ux = (bx - ax) / len, uy = (by - ay) / len;
    const sz = Math.max(1, Math.round(3 * Z));
    for(let k = 0; k < 6; k++){
      const d = (((G.time || 0) * 260 * Z + k * len / 6) % len);
      B(Math.round(ax + ux * d - sz / 2), Math.round(ay + uy * d - sz / 2), sz, sz, '#f1d6ff');
    }
  }
  for(const m of [[ax, ay], [bx, by]]){
    const r = Math.round((open ? 11 : 5) * Z);
    B(Math.round(m[0] - Math.max(1, Z * 2)), m[1] - r, Math.max(2, Math.round(Z * 4)), r * 2,
      open ? '#f1d6ff' : '#6b5a80');
    if(open) glow(m[0], m[1], Math.round(18 * Z), '196,123,255', .45);
  }
  ctx.globalAlpha = 1; ctx.restore();
}

/* THE ECHO — a standing second body. Drawn as the knight's own silhouette in the
   Throne's violet, hollow rather than solid, so it reads at a glance as "you, left
   behind" and never as an enemy. Its remaining life is the ring under its feet: the
   verb is on a clock and the clock has to be visible without a HUD element. */
function drawEchoBody(G){
  // curG, not the G handed to drawParticles: the other live-state drawers here
  // (drawParadoxRails, seamOpen) all read curG, and the particle pass does not
  // necessarily receive the same object the simulation is mutating.
  const g = curG || G; const e = g && g.echoBody; if(!e || e.spent) return;
  // Built from B() rects rather than a stroked path: a 1px stroke at this zoom is
  // invisible against the Throne's background, and the echo has to be as readable as
  // the knight — it is a body the player is reasoning about, not an effect.
  const x = WX(e.x), y = WY(e.y);
  const w = Math.max(6, Math.round(18 * Z)), h = Math.max(14, Math.round(46 * Z));
  const fade = Math.min(1, e.life / 2.5);
  const L = fade > .5 ? '#d8b7ff' : '#8d7aa8', HI = fade > .5 ? '#f1d6ff' : '#a394bd';
  const t = Math.round(Math.max(1, Z * 2));
  ctx.globalAlpha = 0.34 + 0.3 * fade + Math.sin((e.t || 0) * 4) * 0.06;
  // hollow silhouette: four edges plus a head block, so it reads as "you, left behind"
  B(x - (w >> 1), y - h, w, t, HI);                     // shoulders
  B(x - (w >> 1), y - t, w, t, L);                      // feet
  B(x - (w >> 1), y - h, t, h, L);                      // left edge
  B(x + (w >> 1) - t, y - h, t, h, L);                  // right edge
  B(x - Math.round(w * .28), y - h - Math.round(h * .22), Math.round(w * .56), Math.round(h * .22), L);
  B(x - Math.round(w * .28), y - h - Math.round(h * .22), Math.round(w * .56), t, HI);
  ctx.globalAlpha *= .5;
  B(x - (w >> 1) + t, y - h + t, w - t * 2, h - t * 2, 'rgba(120,80,180,.5)');
  ctx.globalAlpha = 0.34 + 0.3 * fade;
  glow(x, y - h * .6, Math.round(26 * Z), '216,183,255', .3 * fade);
  // the clock, under its feet: the verb is timed and the timer must be on the body
  const ring = Math.max(2, Math.round(w * 1.8 * Math.max(.1, e.life / 14)));
  B(x - (ring >> 1), y + t, ring, t, fade > .5 ? '#d8b7ff' : '#8d7aa8');
  ctx.globalAlpha = 1;
}
function drawTyrantSeam(G){
  const s = G.tyrantSeam; if(!s) return;
  const k = 1 - Math.max(0, Math.min(1, ((G.time || 0) - s.at) / 2.6));
  if(k <= 0){ G.tyrantSeam = null; return; }
  const bx = WX(s.x), by = WY(s.y), half = Math.round(46 * Z * k);
  ctx.globalAlpha = k;
  B(bx - 1, by - half, 2, half * 2, '#f1d6ff');
  B(bx - 2, by - Math.round(half * .55), 4, Math.round(half * 1.1), 'rgba(196,123,255,.5)');
  glow(bx, by, Math.round(30 * k), '241,214,255', .4 * k);
  ctx.globalAlpha = 1;
}

// ── Particles, text, prompts ──────────────────────────────────────────────
function drawParticles(G){
  drawTyrantSeam(G);
  for(const pt of G.particles){
    const a = Math.max(0, Math.min(1, pt.life * 2.5)); if(a <= 0) continue;
    ctx.globalAlpha = a; ctx.fillStyle = pt.color;
    const s = Math.max(1, Math.round(pt.sz * Z * (0.45 + a * 0.55)));
    ctx.fillRect(Math.round((pt.x - camX) * Z), Math.round((pt.y + (G.camY || 0) + shY) * Z), s, s);
  }
  ctx.globalAlpha = 1;
}
function drawTexts(G){
  ctx.textAlign = 'center';
  for(const t of G.texts){
    ctx.globalAlpha = Math.max(0, Math.min(1, t.life * 1.4)); ctx.font = (t.big ? 'bold 10px' : 'bold 7px') + ' monospace';
    const x = Math.round((t.x - camX) * Z), y = Math.round((t.y + (G.camY || 0)) * Z);
    ctx.fillStyle = P.skyTop; ctx.fillText(t.txt, x + 1, y + 1); ctx.fillStyle = t.color; ctx.fillText(t.txt, x, y);
  }
  ctx.globalAlpha = 1;
}
function drawPrompt(pr){
  if(!pr || !pr.target) return;
  const x = WX(pr.target.x), y = WY((pr.target.y || 0)) - 41;
  if(curG.stageIndex >= 0 && curG.stageIndex <= 8){
    B(x - 4, y - 4, 9, 9, P.skyTop); B(x, y - 2, 1, 5, P.moon);
    B(x - 1, y - 1, 3, 1, P.moon); B(x - 2, y, 5, 1, P.moon); return;
  }
  ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.skyTop; ctx.fillText(pr.verb, x + 1, y + 1); ctx.fillStyle = '#d8c48f'; ctx.fillText(pr.verb, x, y);
}

// ── Legacy fallback: run an old draw function on the scaled buffer context ─
function legacyDraw(fn, o){
  if(typeof fn !== 'function') return;
  ctx.save(); ctx.setTransform(Z, 0, 0, Z, Math.round((-camX) * Z), Math.round((shY + (curG.camY || 0)) * Z)); ctx.imageSmoothingEnabled = false;
  try { fn(ctx, o); } catch(err){ /* a legacy drawer that assumes main-canvas state must not break the frame */ }
  ctx.restore();
}

// ── Frame ─────────────────────────────────────────────────────────────────
function supports(stageIndex){ return SUPPORTED_STAGES.has(stageIndex); }
function render(main, env){
  const { G, VW, VH, GROUND_Y } = env; L = env.legacy; curEnv = env;
  activeFields=G.stageIndex===3 && L.activeEnvironmentFields ? new Set(L.activeEnvironmentFields()) : null;
  themeName = THEMES[env.theme] ? env.theme : 'plains'; T = THEMES[themeName];
  const nbw = Math.ceil(VW * Z), nbh = Math.ceil(VH * Z);
  if(!buf || bw !== nbw || bh !== nbh){ buf = buf || document.createElement('canvas'); bw = nbw; bh = nbh; buf.width = bw; buf.height = bh; bctx = buf.getContext('2d', { alpha:false }); bctx.imageSmoothingEnabled = false; }
  ctx = bctx; curG = G; time = G.time || 0; dt = Math.max(0, Math.min(.05, time - lastTime)); lastTime = time;
  const shake = env.shake || { x:0, y:0 }; shX = shake.x; shY = shake.y;
  camX = G.cam - shX; camYb = ((G.camY || 0) + shY) * Z; groundBy = Math.round((GROUND_Y + shY + (G.camY || 0)) * Z);
  interior = INTERIOR_STAGES.has(G.stageIndex);
  // Y CULLING. Flat regions never needed it — everything sat within a screen of the
  // ground line. A 640-unit plateau over a 2,000-unit stair does not, and drawing a
  // room two screens above the camera is pure cost.
  const VX0 = G.cam - 160, VX1 = G.cam + VW + 160;
  const VY0 = (G.camY || 0) - VH * .6 - 400, VY1 = (G.camY || 0) + VH * .6 + 400;
  const vis = o => { const hw = (o.w || 60) / 2 + 40; if(o.x + hw <= VX0 || o.x - hw >= VX1) return false;
    if(!interior || o.y == null) return true;
    const top = o.y + (o.h || 60), bot = o.y - (o.h || 60);
    return top > VY0 && bot < VY1; };

  drawBackdrop();
  // ARENA SCRIM. The Casting Pit stacks a working skyline, six spouts, a coolant
  // header and the machine itself into one frame. Sinking the backdrop during the
  // fight leaves the bed, the arm and the pour as the only bright things in it.
  if(G.stageIndex === 10 && G.boss && !G.boss.dead && G.boss.colossusForge){
    ctx.fillStyle = 'rgba(10,5,4,.55)'; ctx.fillRect(0, 0, bw, bh);
  }
  drawOutskirtsLandmarks();
  drawForestLandmarks();
  drawCausewayConnections();
  const pixelTunnels=G.stageIndex===3 && drawUpdraftsTunnels();
  drawUpdraftsConnections();
  drawMarksmanConnections();
  drawKeepLandmarks();
  drawKeepConnections();
  drawGaolLandmarks();
  drawGaolConnections();
  drawFrostLandmarks();
  drawCourtLandmarks();
  if(G.hasCeiling){ const cy = WY(env.CEIL_Y || 1600); B(0, 0, bw, Math.max(0, cy), '#06030a'); }
  for(const o of G.obstacles) if(o.courtArchitecture && vis(o)){
    if(G.stageIndex===8)continue;
    if(G.stageIndex===2 && o.kind==='court-shaft' && drawCausewayProp(o,WX(o.x),WY(o.y || 0))) continue;
    legacyDraw(L.byType.scenery, o);
  }
  if(G.stageIndex!==8)legacyDraw(L.drawCourtFinal, null); if(G.stageIndex!==5&&G.stageIndex!==6&&G.stageIndex!==7&&G.stageIndex!==8)legacyDraw(L.drawCircuitLinks, null);
  if(G.cratePortals) for(let i = 0; i < G.cratePortals.length; i++){if(G.stageIndex===4)drawMarksmanPortal(G.cratePortals[i],i);else if(G.stageIndex===5)drawKeepPortal(G.cratePortals[i],i);else if(G.stageIndex===6)drawGaolPortal(G.cratePortals[i],G.cratePortals[i].side??i);else if(G.stageIndex===8)drawCourtPortal(G.cratePortals[i],i);else legacyDraw(c => L.drawCratePortal(c, G.cratePortals[i], i), null);}
  if(G.portal) legacyDraw(L.drawPortal, G.portal);
  // The body draws under the bench; its arm draws over it, after the terrain.
  const benchBoss = (G.stageIndex === 10 && G.boss && G.boss.forgeFight && !G.boss.dead && vis(G.boss)) ? G.boss : null;
  if(benchBoss) drawColossusFigure(benchBoss);
  for(const o of G.obstacles){
    if(o.type === 'plat'){
      const inX = o.deep || (o.x + o.w / 2 > VX0 && o.x - o.w / 2 < VX1);
      const inY = !interior || ((o.y || 0) + 24 > VY0 && (o.y || 0) - (o.h || 14) < VY1);
      if(inX && inY){ drawPlat(o); polarityTrim(o); } continue; }
    if(!vis(o)) continue;
    switch(o.type){
      case 'wall': if(!o.gone) drawWall(o); break;
      case 'scenery': {
        if(o.courtArchitecture && G.stageIndex !== 8) break;
        // THE ROOM STEPS BACK. During the Colossus fight the hall, the crane and the
        // slag heap are furniture, not information. Only the spouts — the clock — and
        // the door stay at full strength, because only they are the fight.
        if(foundryArenaDecor(o)) alphaWrap(.22, () => drawProp(o)); else drawProp(o);
        break;
      }
      case 'trap': if(G.stageIndex===2) drawCausewayMass(o,false); else if(o.slagCycle) drawSlagBlock(o); else legacyDraw(L.byType.trap,o); break;
      case 'bruteWeight': if(G.stageIndex===2) drawCausewayMass(o,true); else legacyDraw(L.byType.bruteWeight,o); break;
      case 'check': drawCheckpoint(o); break;
      case 'restSite': drawBrazier(o); break;
      case 'spring': drawSpring(o); break;
      case 'updraft': drawUpdraft(o); break;
      case 'wind': drawWind(o); break;
      case 'windTunnel': if(!pixelTunnels) legacyDraw(L.byType.windTunnel,o); break;
      case 'seam': drawRideSeam(o); break;
      case 'spikes': drawSpikes(o); break;
      case 'door': drawDoor(o); break;
      case 'lever': drawLever(o); break;
      case 'runeEmitter': if(G.stageIndex===7)drawFrostEmitter(o);else if(G.stageIndex===8)drawCourtEmitter(o);else legacyDraw(L.byType.runeEmitter,o);break;
      case 'spellSiphon': if(G.stageIndex===8)drawCourtReceiver(o);else legacyDraw(L.byType.spellSiphon,o);break;
      case 'lportal': if(G.stageIndex===4)drawMarksmanPortal(o,1,true);else if(G.stageIndex===8)drawCourtPortal(o,1,true);else legacyDraw(L.byType.lportal,o);break;
      case 'crystal': drawCrystal(o); break;
      case 'crate': drawCrate(o); break;
      case 'plate': drawPlate(o); break;
      case 'chest': drawChest(o); break;
      case 'fluid': drawFluidV4(o); break;
      case 'forgeCoolant': drawForgeCoolantV4(o); break;
      case 'rotor': drawRotorV4(o); break;
      case 'lowg': if(G.stageIndex===6)drawGaolLowG(o);else legacyDraw(L.byType.lowg,o);break;
      case 'surveyStake': drawStake(o); break;
      case 'sign': drawSign(o); break;
      case 'coin': drawCoin(o); break;
      case 'storyRelic': drawRelic(o); break;
      case 'ambientFigure': drawResident(o, o.silhouette === 'watcher' ? 'watcher' : 'ash'); break;
      case 'pit': case 'nojump': break;
      default: legacyDraw(L.byType[o.type], o);
    }
    if(o.toolRevealedT > 0) glow(WX(o.x), WY((o.y || 0) + (o.h || 50) * .5), 18, '143,216,255', .3);
  }
  for(const o of G.remixFields || []) if(vis(o)){ if(o.type === 'updraft') drawUpdraft(o); else if(o.type === 'wind') drawWind(o); else legacyDraw(L.byType[o.type], o); }
  if(G._portalProjectedFields) for(const flow of G._portalProjectedFields){if(G.stageIndex===7)drawFrostFlow(flow,true);else legacyDraw(L.drawPortalFlow, flow);}
  if(G._fluidJets) for(const jet of G._fluidJets) legacyDraw(L.drawFluidJet, jet);
  if(benchBoss) drawColossusArm(benchBoss);
  if(G.stageIndex === 10) drawColossusShaftExtras(G);
  if(G.stageIndex === 12) drawParadoxRails();
  drawAmbience();
  drawMarksmanSightlines();
  drawCourtCombat();
  for(const a of G.aoes || []) if(!drawSlamRing(a)&&!drawCausewayAOE(a)&&!drawMarksmanAOE(a)&&!drawGaolAOE(a)&&!drawCourtAOE(a)&&!drawFoundryAOE(a)) legacyDraw(L.drawAOE, a);
  for(const pk of G.pickups) if(vis(pk) && !drawForestPickup(pk) && !drawCausewayPickup(pk) && !drawUpdraftsPickup(pk)) legacyDraw(L.drawPickup, pk);
  for(const e of G.enemies) if(!e.dead && (vis(e) || (G.stageIndex === 0 && e.openingState === 'vanish' && vis({x:e.openingTeleportX})) || (G.stageIndex === 1 && e.forestMode === 'veil' && vis({x:e.forestTeleportX})))){ if(e !== benchBoss){ drawEnemy(e); if(e.riftMarked > 0) legacyDraw(L.drawRiftMark, e); } }
  if(G.critFx) for(const fx of G.critFx) legacyDraw(L.drawCritAnimation, fx);
  if(G.npcs) for(const n of G.npcs) if(vis(n)) drawResident(n, FIGURE_PALS[n.kind] ? n.kind : 'survey');
  legacyDraw(L.drawOutskirtsAnnotation, null);
  drawPrompt(env.prompt);
  if(G.fam) legacyDraw(c => L.drawFamiliar(c, G.fam, 0), null);
  legacyDraw(c => L.drawKingPortalHijack(c, G.boss), null);
  legacyDraw(L.drawTemporalEcho, G.echoTrial);
  if(env.ghost) drawPartner(env.ghost);
  drawCartRide(G.p);
  for(const pr of G.projectiles){if(G.stageIndex===7&&drawFrostProjectile(pr))continue;if(G.stageIndex===8&&drawCourtProjectile(pr))continue;legacyDraw(L.drawProjectile, pr);}
  // THE ECHO DRAWS IN NORMAL BLENDING, BEFORE THE ADDITIVE PASS. drawParticles runs
  // under globalCompositeOperation 'lighter', where a semi-transparent mid-tone body
  // over this region's near-black background adds almost nothing — the body was
  // being drawn correctly and summing to invisible. Bright sparks survive that
  // blend; a silhouette does not.
  drawEchoBody(G);
  ctx.globalCompositeOperation = 'lighter'; drawParticles(G); ctx.globalCompositeOperation = 'source-over';
  drawTexts(G);
  glow(WX(G.p.x), WY(G.p.y) - 12, 70, '120,200,255', .14);
  ctx.drawImage(vignette(), 0, 0);
  // THE WORLD TURNING OVER, said once across the whole screen: a soft vertical smear
  // in the direction you are about to fall, so the flip is an event and not a
  // silent change of rules.
  const tell = flipTell();
  if(tell > 0){
    const dir = G.gravityFlipped ? -1 : 1;
    alphaWrap(tell * .5, () => { ctx.fillStyle = 'rgba(196,168,255,.55)';
      for(let i = 0; i < 26; i++){ const h1 = hash(i, 11), h2 = hash(i, 17);
        const x = Math.round(h1 * bw), len = Math.round(18 + h2 * 54 * tell);
        const y = Math.round(((h2 * bh) + dir * tell * 90) % bh);
        ctx.fillRect(x, y, 1, len); } });
    alphaWrap(tell * .22, () => { ctx.fillStyle = '#c4a8ff'; ctx.fillRect(0, 0, bw, bh); });
  }
  main.imageSmoothingEnabled = false; main.setTransform(1, 0, 0, 1, 0, 0);
  main.drawImage(buf, 0, 0, bw, bh, 0, 0, bw * 2, bh * 2);
  main.imageSmoothingEnabled = true;
}
return { render, supports, palette:P, themes:THEMES, SUPPORTED_STAGES };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = BFRespecRenderer;
