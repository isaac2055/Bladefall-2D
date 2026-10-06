/* Bladefall — ACT THREE · The Fractured Marksman's art (2026-09-24).

   Marksman Road at night: the watchtowers black against a bruised sky, the road's ruts, timber
   mantlets. What you must read is exact: a sightline — dotted while it follows you, solid and
   bright once it has LOCKED — from every archer that sees you; the pale slate that will hold a
   mouth; the Tallyman's count, three strokes on the board at its back, and each one you cut. */
(function installFracturedMarksmanArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;

const C = {
  sky:['#06050c', '#100c1e', '#1e1430', '#2e1a30'],
  hill0:'#08070e', hill1:'#0e0c16', hill2:'#15121e',
  earth0:'#17131a', earth1:'#241d24', earthLit:'#3a3038', rut:'#0f0c12',
  wood0:'#241a14', wood1:'#3a2a1e', woodLit:'#5c4430', iron:'#3a3a44', ironLit:'#6a6a78',
  slate0:'#3e4450', slate1:'#5a6272', slateLit:'#8a94a8', rune:'#9fd6ff',
  cloak:'#29232f', cloak2:'#443747', mask:'#e8e2d0', bow:'#6a4a2e', string:'#d8d0c0',
  line:'230,210,150', lock:'255,236,190', reckon:'244,236,214',
};
const M = () => root.BladefallFracturedMarksman;
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 24 ? A : null; }

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
  FA.sky(api, C.sky, 'fm');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  FA.bands(api, [[.1, C.hill0, 90, .003], [.22, C.hill1, 70, .006]], horizon);
  // Distant watchtowers, unlit.
  const { B, bw, Z } = api, par = .3, half = bw / (2 * Z);
  for(let k = Math.floor(((-bw / 2) / (Z * par) + api.camX + half) / 900) - 1; k <= Math.ceil(((bw / 2) / (Z * par) + api.camX + half) / 900) + 1; k++){
    const x = Math.round((k * 900 + api.hash(k, 3) * 400 - api.camX - half) * Z * par + bw / 2), h = 120 + Math.round(api.hash(k, 4) * 80);
    B(x - 6, horizon - h, 12, h + 40, C.hill2); B(x - 14, horizon - h - 10, 28, 12, C.hill2); B(x - 16, horizon - h - 16, 32, 6, C.hill2);
  }
  FA.bands(api, [[.4, C.hill2, 45, .01]], horizon);
  FA.ash(api, 'rgba(200,180,200,.2)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0 || o.gone) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'road':
      B(s.x0, s.y, s.w, s.floor - s.y, C.earth0); B(s.x0, s.y, s.w, 4, C.earth1); B(s.x0, s.y, s.w, 1, C.earthLit);
      for(let x = s.x0 - ((s.x0 + base) % 37); x < s.x1; x += 37) if(x >= s.x0) B(x, s.y + 2, 14, 1, C.rut);
      FA.seams(api, s, base);
      return true;
    case 'scaffold':
      B(s.x0, s.y, s.w, 5, C.wood1); B(s.x0, s.y, s.w, 1, C.woodLit); B(s.x0, s.y + 5, s.w, 2, C.wood0);
      for(let x = s.x0 + 6; x < s.x1 - 4; x += 40) B(x, s.y + 7, 3, Math.min(api.bh, api.WY(0)) - s.y - 7, C.wood0);
      return true;
    case 'slate':
      // The pale panel a mouth holds on: etched, faintly lit.
      B(s.x0, s.y - 1, s.w, 5, C.slate1); B(s.x0, s.y - 1, s.w, 1, C.slateLit);
      for(let x = s.x0 + 4; x < s.x1 - 4; x += 11) B(x, s.y + 1, 5, 1, `rgba(159,214,255,${.35 + .2 * Math.sin(api.time * 2 + x * .1)})`);
      return true;
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api;
  if(o.type === 'wall' && o.actArt){
    if(o.gone && o.actArt !== 'bars') return true;
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = WY(o.y), bot = WY(o.y - o.h), w = x1 - x0;
    switch(o.actArt){
      case 'mantlet':
        B(x0, top, w, bot - top, C.wood1); B(x0, top, w, 2, C.woodLit);
        for(let y = top + 10; y < bot - 4; y += 26) B(x0, y, w, 3, C.iron);
        for(let x = x0 + 5; x < x1 - 3; x += 9) B(x, top + 3, 1, bot - top - 6, C.wood0);
        return true;
      case 'tower':
        B(x0, top, w, bot - top, '#1c1a24'); B(x0, top, w, 2, '#3a3648');
        for(let y = top + 14; y < bot; y += 22) B(x0, y, w, 1, '#2a2634');
        for(let y = top + 30; y < bot - 20; y += 60) B(x0 + w / 2 - 1, y, 2, 10, 'rgba(160,200,230,.25)');   // wet, slick
        return true;
      case 'bars': {
        const lift = o.gone ? Math.round((bot - top) * .92) : 0;
        for(let x = x0 + 2; x < x1 - 1; x += 7) B(x, top, 3, bot - top - lift, C.iron);
        B(x0 - 4, top, w + 8, 4, C.ironLit);
        return true;
      }
    }
    return false;
  }
  switch(o.type){
    case 'actTarget': {
      const A = st(api), x = WX(o.x), y = WY(o.y), hit = A && A.gateOpen;
      B(x - 3, y, 6, WY(0) - y, C.wood0);
      B(x - 16, y - 16, 32, 32, hit ? '#6a5a3a' : '#8a6a3a'); B(x - 12, y - 12, 24, 24, hit ? '#3a3024' : '#c9a060'); B(x - 4, y - 4, 8, 8, hit ? '#2a2018' : '#f0d890');
      const gateX = WX(M().constants.BARS.find(b => b.id === o.bars).x);
      B(x + 16, y, gateX - x - 16, 1, hit ? '#f0d890' : C.ironLit);
      B(gateX, y, 2, WY(0) - y, hit ? '#f0d890' : C.ironLit);
      if(hit) B(x - 8, y - 1, 16, 2, C.string);
      else api.glow(x, y, 20, '240,200,120', .18);
      return true;
    }
    case 'actPost': {
      // The tally post: the anchor is nailed to it. Old strokes cut into the wood, in fours and a line.
      const x = WX(o.x), top = WY(o.h), base = WY(0);
      B(x - 5, top, 10, base - top, C.wood1); B(x - 5, top, 10, 2, C.woodLit);
      for(let k = 0; k < 14; k++){ const y = top + 60 + k * 16; for(let j = 0; j < 4; j++) B(x - 3 + j * 2, y, 1, 8, C.wood0); B(x - 4, y + 3, 9, 1, C.wood0); }
      return true;
    }
    case 'actTower': return true;
    case 'actTunnel': {
      const x = WX(o.x), base = WY(0), top = WY(o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.wood1); B(x + w, top + r * 4, 10, 4, C.wood1); }
      api.glow(x, base - 60, 60, '230,210,170', .1);
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 10, y - 3, 20, 3, '#2a2420'); for(let i = 0; i < 5; i++) B(x - 8 + i * 4, y - 5 - (i % 2), 2, 2, i % 2 ? '#8a3a1e' : '#ff8a3a'); api.glow(x, y - 6, 24, '255,120,60', .2); return true; }
  }
  return false;
}

/* The sightlines: dotted while they follow you, solid once locked. The Reckoning's is thick and pale. */
function world(api){
  const { ctx, WX, WY } = api;
  for(const e of api.G.enemies){
    if(e.dead || !(e.actFoe === 'watch' && e.st === 'aim' || e.actFoe === 'tallyman' && e.st === 'draw') || e.aimX == null) continue;
    const reckon = e.actFoe === 'tallyman' && e.kind === 'reckon', col = reckon ? C.reckon : e.locked ? C.lock : C.line;
    const origin = M().shotOrigin(e), x0 = WX(origin.x), y0 = WY(origin.y), x1 = WX(e.aimX), y1 = WY(e.aimY);
    const tell = e.actFoe === 'watch' ? e.tell : M().constants.T.tell[e.kind], q = Math.min(1, e.t / tell);
    ctx.save(); ctx.strokeStyle = `rgba(${col},${e.locked ? .75 : .25 + .35 * q})`; ctx.lineWidth = reckon ? 3 : e.locked ? 2 : 1;
    if(!e.locked) ctx.setLineDash([4, 6]);
    const spread = e.actFoe === 'tallyman' && e.kind === 'brace' ? [-M().constants.T.spread, 0, M().constants.T.spread] : [0];
    const base = Math.atan2(y1 - y0, x1 - x0), len = Math.hypot(x1 - x0, y1 - y0);
    for(const d of spread){ ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(base + d) * len, y0 + Math.sin(base + d) * len); ctx.stroke(); }
    ctx.restore();
    if(e.locked){ api.B(x1 - 6, y1, 13, 1, `rgba(${col},.9)`); api.B(x1, y1 - 6, 1, 13, `rgba(${col},.9)`); api.glow(x1, y1, 10, col, .3); }
  }
}

function enemy(api, e){
  if(e.actFoe === 'watch'){ watchFigure(api, e); return true; }
  if(e.actFoe === 'tallyman'){ tallymanFigure(api, e); return true; }
  return false;
}
function bow(api, x, y, f, drawn, big){
  const { B } = api, h = big ? 34 : 24, pull = drawn ? (big ? 10 : 7) : 2;
  for(let k = -h; k <= h; k += 2){ const bx = x + f * Math.round(Math.cos(k / h * 1.3) * (big ? 9 : 6)); B(bx, y + k, 2, 2, C.bow); }
  B(x - f * pull, y - h + 2, 1, h * 2 - 4, C.string);
}
function watchFigure(api, e){
  const { WX, WY } = api, x = WX(e.x), y = WY(e.y), f = e.face || -1;
  const B = (bx, by, w, h, col) => api.B(x + (bx - x) * api.Z, y + (by - y) * api.Z, w * api.Z, h * api.Z, col);
  // The perch: a small platform under it.
  B(x - 16, y, 32, 4, C.wood1); B(x - 2, y + 4, 4, 20, C.wood0);
  B(x - 7, y - 30, 14, 30, C.cloak); B(x - 9, y - 38, 18, 10, C.cloak2);                 // hooded
  B(x - 4 + f * 2, y - 36, 5, 3, C.mask);
  bow({...api, B}, x + f * 10, y - 22, f, e.st === 'aim', false);
  if(e.st === 'aim' && e.locked) api.glow(x + f * 10 * api.Z, y - 22 * api.Z, 10 * api.Z, '255,230,170', .3);
}
function tallymanFigure(api, e){
  const { WX, WY } = api, A = st(api) || {}, x = WX(e.x), y = WY(e.y), f = e.face || -1;
  const B = (bx, by, w, h, col) => api.B(x + (bx - x) * api.Z, y + (by - y) * api.Z, w * api.Z, h * api.Z, col);
  const kneel = e.st === 'kneel' || e.st === 'down', h = kneel ? 52 : 74;
  // A long coat to the ground, a hood, a white mask with no face.
  for(let r = 0; r < h - 16; r++){ const w = 9 + Math.round(r / (h - 16) * 7); B(x - w, y - r, w * 2, 1, r % 9 === 0 ? C.cloak2 : C.cloak); }
  const top = y - h;
  B(x - 10, top, 20, 18, C.cloak2); B(x - 6 + f * 2, top + 5, 11, 10, C.mask); B(x - 3 + f * 2, top + 9, 5, 1, '#8a8478');
  // The tally board on its back: three strokes, and each one you have cut is struck through, lit.
  const bx = x - f * 16, by = top + 12;
  B(bx - 9, by, 18, 26, C.wood1); B(bx - 9, by, 18, 2, C.woodLit);
  for(let k = 0; k < 3; k++){ const cut = k < (A.tallies || 0); B(bx - 5 + k * 5, by + 5, 2, 16, cut ? '#ffe6a8' : C.wood0); if(cut){ B(bx - 7, by + 12 + k, 16, 1, '#ffe6a8'); api.glow(x + (bx - x) * api.Z, y + (by + 13 - y) * api.Z, 10 * api.Z, '255,230,170', .15); } }
  if(e.st === 'kneel'){ B(f > 0 ? x + 18 : x - 58, y - 3, 40, 3, C.bow); return; }   // the bow laid down
  bow({...api, B}, x + f * 14, top + 34, f, e.st === 'draw', true);
  // The count, held up in the fingers of its other hand while it draws: I, II, III.
  if(e.st === 'draw'){ for(let k = 0; k < e.count; k++) B(x - f * 4 - 4 + k * 4, top - 16, 2, 10, e.kind === 'reckon' ? '#f4ecd6' : '#b8b0a0'); }
  if(e.st === 'down'){
    const q = Math.max(0, e.exposeT || 0) / M().constants.T.down;
    B(bx - 10, by, 2, 26 * q, '#ffe6a8'); B(bx + 9, by, 2, 26 * q, '#ffe6a8');
    api.glow(x, y - 30 * api.Z, 26 * api.Z, '255,230,170', .15 + .2 * q);
  }
}

function edgeCount(api, A){
  const e = A.tallyman; if(!e || e.dead || !A.fight || e.st !== 'draw') return;
  const sx = api.WX(e.x), sy = api.WY(e.y + e.h);
  if(sx >= 20 && sx <= api.bw - 20 && sy >= 20) return;
  const x = Math.max(14, Math.min(api.bw - 14, sx)), y = Math.max(24, Math.min(api.bh - 24, sy));
  const count = M().shotCount(e.kind), col = e.kind === 'reckon' ? '#f4ecd6' : '#c9a060';
  for(let k = 0; k < count; k++) api.B(x - count * 3 + k * 6, y, 2, 9, col);
  if(e.locked) api.B(x - count * 3 - 2, y + 12, count * 6 + 2, 2, col);
}
function overlay(api){
  const A = st(api) || {};
  FA.vignette(api, '6,4,10', .55);
  edgeCount(api, A);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(255,240,210,${.14 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
}

ART.register(24, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
