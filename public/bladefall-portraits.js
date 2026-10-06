/* Bladefall — FACES FOR THE CONVERSATION BOX (2026-09-27).

   Celeste-style talking portraits: a 48×48 head-and-shoulders close-up for everyone who speaks, drawn in art
   pixels and shown crisp (image-rendering: pixelated) inside the conversation box. Each face is the same person as
   their body in bladefall-resident-art.js — the same signature colour, headwear, hair and prop — so the portrait and
   the figure in the world read as one character. The knight has his own: navy hood, pale face, cyan eyes, orange
   scarf.

   Authored facing right (the knight, on the left, looks at the text); the box mirrors a portrait on the right side.
   Animation state is passed in per frame: blink (eyes shut), mouth 0 closed · 1 half · 2 open (driven while text is
   revealing), and mood 'neutral' | 'concerned' (brows lift at the middle, the mouth turns down).

   API
     resolve(title)                → portrait id for a conversation title ('ROWAN', 'Tamsin · The Assessor',
                                     'THE KNEELING MAN', …) or null (signs, relics, notes: no face)
     draw(ctx, id, { blink, mouth, mood }) → paints the 48×48 portrait at ctx's origin
     has(id), ids, SIZE, KNIGHT
     mood(text)                    → 'concerned' for lines that carry hurt or fear, else 'neutral' */
(function installPortraits(root){
'use strict';
const SIZE = 48, KNIGHT = 'knight', EYE = '#1c1418', WHITE = '#f2ede4', LIP = '#8a4038', MOUTH = '#3a1418';
const pal = (c, l, d) => ({ c, l, d });

/* ── Primitives (art pixels; authored facing right) ───────────────────────────────────────────────────── */
let g = null;
const R = (x, y, w, h, c) => { if(w > 0 && h > 0){ g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); } };
const P = (x, y, c) => R(x, y, 1, 1, c);
/* Filled rows shaded like the game's sprites: top row lit, left edge lit, right edge dark. */
function fill(rows, p, far){
  far = far == null ? 2 : far; const top = rows.length ? rows[0][0] : 0;
  rows.forEach(r => { const [y, x0, x1] = r, w = x1 - x0; if(w <= 0) return;
    if(y === top){ R(x0, y, w, 1, p.l); return; }
    R(x0, y, w, 1, p.c); P(x0, y, p.l); if(w > 4) R(x1 - far, y, far, 1, p.d); });
}
function ellipseRows(cx, cy, rx, ry, jaw){
  const out = [];
  for(let y = Math.ceil(cy - ry); y <= Math.floor(cy + ry); y++){
    const t = (y + .5 - cy) / ry; if(Math.abs(t) > 1) continue;
    let hw = rx * Math.sqrt(1 - t * t); if(jaw && t > .25) hw *= 1 - jaw * Math.pow((t - .25) / .75, 1.4);
    out.push([y, Math.round(cx - hw), Math.round(cx + hw)]);
  }
  return out;
}
function polyRows(pts){
  let y0 = Infinity, y1 = -Infinity; for(const q of pts){ y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
  const out = [];
  for(let y = Math.floor(y0); y < Math.ceil(y1); y++){
    const yc = y + .5, xs = [];
    for(let i = 0, j = pts.length - 1; i < pts.length; j = i++){ const a = pts[i], b = pts[j]; if((a[1] > yc) !== (b[1] > yc)) xs.push(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
    xs.sort((a, b) => a - b); for(let k = 0; k + 1 < xs.length; k += 2) out.push([y, Math.round(xs[k]), Math.round(xs[k + 1])]);
  }
  return out;
}
const poly = (pts, p, far) => fill(polyRows(pts), p, far);
function line(x0, y0, x1, y1, c, t){ t = t || 1; const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); for(let i = 0; i <= n; i++){ const f = i / n; R(Math.round(x0 + (x1 - x0) * f), Math.round(y0 + (y1 - y0) * f), t, t, c); } }

/* ── The shared bust ──────────────────────────────────────────────────────────────────────────────────────
   Head centre (23.5, 22), 19 wide, rows 11–33; neck 20–27; shoulders from row 36 to the frame's foot. */
const HX = 23.5, HY = 22;
const SK = {
  fair:pal('#f2cfae', '#ffe4c8', '#c89a78'), ruddy:pal('#e3a883', '#f6c6a2', '#b27856'), tan:pal('#d39a70', '#ecb88c', '#9e6a48'),
  brown:pal('#a8704c', '#c89068', '#744a30'), deep:pal('#7a4c34', '#9c6c4e', '#52301e'), pale:pal('#ece0d2', '#fff6ea', '#bcae9c'),
  soot:pal('#b98a68', '#d4a684', '#7e5a42'), knight:pal('#f2c9a0', '#ffe0c0', '#c89a78'),
};
function backdrop(tint){
  R(0, 0, SIZE, SIZE, '#15131c');
  g.save(); g.globalAlpha = .28; g.fillStyle = tint; g.beginPath(); g.arc(24, 24, 20, 0, Math.PI * 2); g.fill(); g.restore();
  g.save(); g.globalAlpha = .12; g.fillStyle = tint; g.fillRect(0, 34, SIZE, 14); g.restore();
}
function shoulders(p, o){
  o = o || {}; const w = o.w || 20, top = o.top || 37;
  poly([[HX - 6, top - 2], [HX + 6, top - 2], [HX + w, top + 5], [HX + w + 1, SIZE], [HX - w - 1, SIZE], [HX - w, top + 5]], p, 3);
}
function neck(sk){ R(20, 30, 8, 8, sk.c); R(20, 30, 8, 2, sk.d); R(26, 32, 2, 6, sk.d); }
function head(sk, o){
  o = o || {};
  const rows = ellipseRows(HX + (o.dx || 0), HY + (o.dy || 0), o.rx || 9.5, o.ry || 11, o.jaw == null ? .35 : o.jaw);
  fill(rows, sk, 2);
  if(o.ear !== false){ R(13, 21, 2, 5, sk.c); P(13, 21, sk.l); R(14, 22, 1, 3, sk.d); }
  return rows;
}
/* Eyes, brows, nose and mouth for a face looking to the right. */
function features(sk, s, st){
  const e = s.eyes || 'normal', bc = s.brow || '#3a2a22', concerned = st.mood === 'concerned';
  // brows
  if(s.brows !== false && e !== 'blind' && e !== 'none'){
    if(concerned){ R(17, 19, 3, 1, bc); P(20, 18, bc); R(26, 18, 1, 1, bc); R(27, 19, 3, 1, bc); }
    else { R(17, 18, 4, 1, bc); R(26, 18, 4, 1, bc); }
  }
  // eyes
  const shut = st.blink || s.shut;
  if(e === 'normal' || e === 'small' || e === 'patch' || e === 'glow'){
    const eye = (x, patch) => {
      if(patch){ R(x - 1, 20, 4, 3, '#1a1418'); return; }
      if(shut){ R(x, 21, 3, 1, sk.d); return; }
      if(e === 'small'){ R(x + 1, 20, 2, 2, EYE); return; }
      if(e === 'glow'){ R(x, 20, 3, 2, s.eyeCol || '#9ff4ff'); P(x + 2, 20, '#ffffff'); return; }
      R(x, 20, 3, 2, WHITE); R(x + 1, 20, 2, 2, s.iris || EYE); P(x + 2, 20, '#ffffff');
    };
    eye(17, e === 'patch'); eye(26, false);
    if(s.bags){ R(17, 22, 3, 1, s.bags); R(26, 22, 3, 1, s.bags); }
  }
  if(e === 'blind'){ R(14, 19, 19, 3, s.blindCol || '#d8ccb0'); R(14, 21, 19, 1, '#b8ac90'); }
  // nose (on the facing side)
  if(s.nose !== false){ P(23, 22, sk.l); R(24, 22, 1, 4, sk.d); P(22, 25, sk.d); R(23, 26, 2, 1, sk.d); }
  // cheeks
  if(s.cheek){ R(27, 25, 2, 1, s.cheek); R(17, 25, 2, 1, s.cheek); }
  if(s.freckles) for(const [x, y] of [[18, 24], [20, 25], [27, 24], [29, 26]]) P(x, y, s.freckles);
  // mouth
  if(s.mouth !== false) mouthAt(st);
  if(s.wrinkles){ P(16, 24, sk.d); P(31, 20, sk.d); R(20, 30, 2, 1, sk.d); }
}
function mouthAt(st, y){
  const m = st.mouth || 0; y = y || 28;
  if(m === 0){ R(21, y, 6, 1, LIP); if(st.mood === 'concerned'){ P(20, y + 1, LIP); P(27, y + 1, LIP); } else { P(20, y - 1, LIP); P(27, y - 1, LIP); } }
  // Talking is a small movement (owner, 7.234): a slit, at most two pixels open, no teeth.
  else if(m === 1){ R(21, y, 6, 1, LIP); R(22, y, 4, 1, MOUTH); }
  else { R(22, y - 1, 4, 2, MOUTH); R(21, y + 1, 6, 1, LIP); }
}
/* Hair shapes (drawn after the head so they frame it). */
const HAIR = {
  short(c){ poly([[13, 16], [18, 11], [29, 11], [33, 15], [33, 18], [24, 16], [16, 18], [14, 24], [13, 24]], pal(c, lighten(c), darken(c)), 1); },
  crop(c){ poly([[14, 15], [19, 11], [29, 11], [33, 15], [33, 17], [14, 17]], pal(c, lighten(c), darken(c)), 1); R(13, 16, 3, 6, c); },
  long(c){ HAIR.short(c); poly([[12, 17], [16, 17], [17, 36], [11, 36]], pal(c, lighten(c), darken(c)), 1); },
  bun(c){ HAIR.crop(c); poly([[16, 5], [22, 5], [23, 11], [15, 11]], pal(c, lighten(c), darken(c)), 1); },
  wild(c){ HAIR.crop(c); for(const [x, y, h] of [[13, 10, 5], [16, 7, 5], [19, 6, 5], [23, 7, 4], [27, 8, 4], [30, 10, 4], [11, 13, 5]]) R(x, y, 2, h, c); },
  receding(c){ R(13, 15, 4, 9, c); R(14, 13, 5, 3, c); P(15, 13, lighten(c)); },
  bald(){ },
};
function hex(c){ const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(c, t, f){ const a = hex(c), b = hex(t); return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * f).toString(16).padStart(2, '0')).join(''); }
const lighten = c => mix(c, '#ffffff', .28), darken = c => mix(c, '#000000', .38);

/* ── HEADWEAR AND DETAILS, by name ─────────────────────────────────────────────────────────────────────── */
const HAT = {
  kettle(){ const S = pal('#8d949c', '#cdd3d8', '#50565e'); poly([[15, 9], [32, 9], [33, 15], [14, 15]], S, 2); R(8, 15, 32, 2, S.l); R(8, 17, 32, 1, S.d); R(17, 17, 15, 1, '#b27856'); },
  goggleCap(){ const C = pal('#6a4a30', '#8e6a48', '#40301e'); poly([[14, 10], [31, 9], [34, 15], [13, 16]], C, 2); R(29, 15, 9, 2, C.d);
    R(18, 10, 5, 4, '#d3a646'); R(24, 10, 5, 4, '#d3a646'); R(19, 11, 3, 2, '#bff4ff'); R(25, 11, 3, 2, '#bff4ff'); P(21, 11, '#ffffff'); P(27, 11, '#ffffff'); },
  headband(){ const Rz = pal('#c4487a', '#ee78a4', '#80284e'); R(13, 15, 21, 2, Rz.l); R(13, 17, 21, 1, Rz.d); for(let i = 0; i < 9; i++) R(12 - i, 16 + (i >> 1) + Math.round(Math.sin(i) * .6), 1, 2, i % 2 ? Rz.c : Rz.l); },
  knotScarf(){ const Rz = pal('#c8443a', '#f06c56', '#84261e'); poly([[13, 12], [20, 8], [30, 8], [35, 13], [35, 17], [12, 17]], Rz, 2);
    for(const [x, y] of [[17, 11], [23, 9], [29, 12], [20, 14], [32, 15], [15, 15]]) R(x, y, 2, 1, '#ffffff');
    poly([[19, 3], [23, 8], [18, 9]], Rz, 1); poly([[28, 3], [27, 9], [24, 8]], Rz, 1); },
  cone(){ const C = pal('#2e2c38', '#4c4a5a', '#1a1822'); poly([[13, 15], [34, 15], [28, 6], [22, 1], [16, -1], [20, 5]], C, 2); R(12, 15, 24, 2, C.c); R(12, 15, 24, 1, C.l); },
  tophat(){ const C = pal('#1e1a24', '#3a3444', '#0e0c12'); poly([[16, 0], [31, 0], [31, 12], [16, 12]], C, 2); R(16, 9, 15, 2, '#d9a42c'); R(11, 12, 25, 2, C.c); R(11, 12, 25, 1, C.l); },
  shako(){ const C = pal('#20282c', '#3a464c', '#101416'); poly([[15, 1], [32, 1], [32, 14], [15, 14]], C, 2); R(15, 1, 17, 1, C.l); R(21, 4, 5, 6, '#d3a646'); P(22, 5, '#ffe08a'); R(28, 14, 8, 1, C.d); },
  softHood(col, inner){ const C = col; poly([[9, 30], [10, 14], [16, 6], [26, 5], [34, 10], [37, 18], [35, 30], [33, 30], [33, 17], [28, 12], [18, 12], [14, 17], [13, 30]], C, 2); },
  flatcap(col){ const C = pal(col || '#4a4a52', lighten(col || '#4a4a52'), darken(col || '#4a4a52')); poly([[13, 11], [31, 10], [34, 15], [13, 16]], C, 2); R(29, 15, 9, 1, C.d); R(13, 14, 22, 1, C.d); },
  knit(col){ const C = pal(col, lighten(col), darken(col)); poly([[13, 9], [20, 6], [29, 7], [34, 12], [34, 17], [13, 17]], C, 1); R(13, 15, 21, 2, C.d); for(let x = 14; x < 34; x += 2) P(x, 15, C.l); },
  hardhat(lamp){ const Y = pal('#e8c020', '#fff070', '#9a7a10'); poly([[14, 7], [20, 4], [28, 4], [33, 8], [34, 14], [13, 14]], Y, 2); R(10, 14, 28, 2, Y.d); R(22, 4, 3, 10, Y.l);
    if(lamp){ R(29, 8, 5, 4, '#fffbe0'); R(28, 8, 1, 4, '#8a8a80'); } },
  souwester(){ const Y = pal('#e8b820', '#ffe070', '#9a7410'); poly([[14, 6], [31, 5], [34, 14], [13, 14]], Y, 2); poly([[9, 14], [37, 14], [36, 17], [6, 19]], Y, 1); poly([[6, 17], [13, 17], [12, 27], [4, 25]], Y, 1); },
  beanie(col){ const C = pal(col, lighten(col), darken(col)); poly([[13, 12], [19, 6], [29, 6], [34, 12], [34, 17], [13, 17]], C, 1); R(22, 3, 3, 3, C.l); R(13, 15, 21, 2, C.d); },
  partyhat(){ const cols = ['#f0d040', '#48c0d8']; for(let i = 0; i < 12; i++){ const w = 13 - i; R(24 - (w >> 1), 13 - i, w, 1, cols[(i >> 1) % 2]); } R(22, -2, 4, 3, '#ff84b4'); },
  helm(plume){ const S = pal('#8a9098', '#c4cad2', '#50565e'); poly([[14, 8], [21, 5], [29, 6], [34, 11], [35, 18], [34, 20], [13, 20], [12, 14]], S, 2); R(12, 17, 24, 2, S.d); R(15, 7, 2, 10, S.l);
    if(plume){ R(21, -1, 4, 7, plume); P(20, 0, lighten(plume)); } },
  straw(flowers){ const S = pal('#e8cc80', '#fff0b0', '#a88a44'); poly([[15, 6], [31, 6], [33, 13], [14, 13]], S, 1); R(3, 13, 42, 2, S.l); R(3, 15, 42, 1, S.d); R(15, 11, 18, 2, flowers ? '#d8543c' : '#8a6a3a');
    if(flowers) for(const [x, c] of [[17, '#e03a3a'], [21, '#ffffff'], [25, '#e03a3a'], [29, '#ffffff']]) R(x, 10, 2, 2, c); },
  bellcap(){ const B = pal('#d3a646', '#ffe08a', '#86621e'); poly([[17, 12], [18, 5], [22, 2], [26, 2], [30, 5], [31, 12]], B, 2); R(14, 12, 20, 2, B.d); R(22, -1, 3, 3, B.l); },
  bowl(){ const B = pal('#d3a646', '#ffe08a', '#86621e'); poly([[9, 6], [38, 6], [36, 12], [11, 12]], B, 2); R(10, 6, 27, 1, '#8ac4d8'); R(7, 12, 34, 2, B.d); P(8, 16, '#9fd8f0'); P(39, 18, '#9fd8f0'); },
  peaked(){ R(13, 9, 21, 6, '#6a5230'); R(13, 9, 21, 1, '#8a6e44'); R(13, 13, 21, 2, '#c8342c'); R(28, 15, 10, 2, '#1a1414'); R(22, 10, 3, 2, '#ffe08a'); },
  courier(){ const C = pal('#23a8a4', '#58d4cc', '#146a68'); poly([[13, 9], [31, 8], [34, 15], [13, 15]], C, 2); R(29, 14, 9, 2, '#0e2a2a'); R(21, 10, 3, 2, '#ffe08a'); },
  ushanka(){ const F = pal('#dcd6cc', '#f8f4ee', '#a8a296'); poly([[11, 12], [14, 4], [33, 4], [36, 12], [36, 17], [11, 17]], F, 2);
    for(const [x, y] of [[15, 7], [20, 5], [26, 8], [31, 6], [18, 12], [29, 13], [23, 14]]) P(x, y, F.d); R(9, 16, 5, 12, F.c); R(9, 16, 1, 12, F.l); R(34, 16, 4, 12, F.c); R(37, 16, 1, 12, F.d); },
  nightcap(){ const C = pal('#e6cc5a', '#fff0a0', '#a08a2c'); poly([[13, 16], [16, 8], [24, 5], [32, 9], [34, 16]], C, 2); poly([[16, 8], [10, 14], [7, 22], [5, 30], [9, 30], [11, 22], [15, 16]], C, 1);
    for(let i = 0; i < 4; i++) R(7 - (i > 2 ? 1 : 0), 18 + i * 3, 3, 1, '#ffffff'); R(3, 30, 5, 4, '#ffffff'); },
  flyingcap(){ const C = pal('#6a4a30', '#8e6a48', '#40301e'); poly([[12, 12], [18, 7], [30, 7], [35, 12], [35, 18], [12, 18]], C, 2); R(10, 17, 6, 12, C.c); R(10, 17, 1, 12, C.l);
    R(17, 12, 6, 5, '#d3a646'); R(25, 12, 6, 5, '#d3a646'); R(18, 13, 4, 3, '#9ff0ff'); R(26, 13, 4, 3, '#9ff0ff'); P(21, 13, '#ffffff'); P(29, 13, '#ffffff'); },
  kerchief(col){ const C = pal(col, lighten(col), darken(col)); poly([[12, 14], [18, 8], [30, 8], [35, 14], [35, 17], [12, 17]], C, 2); poly([[12, 14], [8, 18], [9, 22], [13, 18]], C, 1); },
};
/* Clothing details laid over the shoulders. */
function vNeck(col, depth){ poly([[HX - 4, 35], [HX + 4, 35], [HX, 35 + (depth || 6)]], pal(col, col, col), 0); }
function scarfCollar(p){ poly([[13, 34], [34, 34], [35, 39], [12, 39]], p, 2); }

/* ── THE CAST ──────────────────────────────────────────────────────────────────────────────────────────────
   Each: tint (backdrop), then draw(st) — body, head, features, hair, hat — in order. */
const F = {};
function person(o, st){
  backdrop(o.tint);
  if(o.back) o.back();
  shoulders(o.clothes, o.shoulders);
  if(o.collar) o.collar();
  neck(o.skin);
  if(o.under) o.under();
  head(o.skin, o.headShape);
  if(o.hair) HAIR[o.hair](o.hairCol || '#3a2a22');
  features(o.skin, o, st);
  if(o.beard){ o.beard(); if(o.mouth !== false) mouthAt(st, 28); }
  if(o.hat) o.hat();
  if(o.front) o.front(st);
}
const beard = (c, style) => () => {
  const B = pal(c, lighten(c), darken(c));
  if(style === 'spade') poly([[14, 25], [33, 25], [32, 33], [26, 40], [21, 40], [15, 33]], B, 2);
  else if(style === 'long') poly([[15, 25], [33, 25], [32, 34], [27, 45], [22, 45], [17, 34]], B, 1);
  else if(style === 'round') poly([[14, 25], [33, 25], [32, 32], [27, 36], [20, 36], [15, 32]], B, 1);
  else if(style === 'stubble'){ for(let y = 26; y < 33; y++) for(let x = 16; x < 31; x += 2) P(x + (y & 1), y, B.d); }
  else if(style === 'goatee') poly([[21, 29], [28, 29], [27, 34], [22, 34]], B, 1);
};
const moustache = (c, walrus) => () => { R(20, 26, 10, 2, c); if(walrus){ R(19, 27, 2, 3, c); R(28, 27, 2, 3, c); } P(21, 26, lighten(c)); };

F.knight = st => {
  const hood = pal('#1b2340', '#2b3a66', '#10162a'), cloak = pal('#2f4d8f', '#4a76c8', '#1d2f5c');
  backdrop('#4a76c8');
  shoulders(cloak, { w:19 });
  R(12, 36, 24, 3, '#ff7f5c'); R(12, 36, 24, 1, '#ffa27f'); R(8, 38, 6, 2, '#ff7f5c'); R(4, 39, 5, 2, '#e8683f');
  poly([[9, 36], [10, 16], [15, 7], [24, 4], [33, 7], [38, 15], [38, 36]], hood, 2); R(10, 15, 2, 20, '#4a76c8');
  const sk = SK.knight; fill(ellipseRows(25, 23, 9, 9.5, .3), sk, 1);
  R(16, 14, 18, 4, hood.c);
  if(st.blink){ R(18, 22, 3, 1, sk.d); R(27, 22, 3, 1, sk.d); }
  else { R(18, 20, 3, 3, '#9ff4ff'); R(27, 20, 3, 3, '#9ff4ff'); P(20, 20, '#ffffff'); P(29, 20, '#ffffff'); R(18, 23, 3, 1, '#6ab8d0'); R(27, 23, 3, 1, '#6ab8d0'); }
  if(st.mood === 'concerned'){ R(18, 18, 3, 1, hood.l); P(20, 17, hood.l); R(27, 17, 1, 1, hood.l); R(28, 18, 2, 1, hood.l); }
  const m = st.mouth || 0; if(m === 0) R(23, 28, 4, 1, '#b8786a'); else if(m === 1) R(24, 28, 2, 1, MOUTH); else R(23, 27, 4, 2, MOUTH);
  R(33, 22, 1, 4, sk.d);
};
F.rowan = st => person({ tint:'#a8392f', skin:SK.ruddy, clothes:pal('#a8392f', '#d8604a', '#6a2019'), hair:'crop', hairCol:'#a8a8a4', brow:'#d8d6d0', wrinkles:1,
  collar(){ for(let y = 40; y < 48; y += 3) for(let x = 6; x < 42; x += 3) P(x + (y & 1), y, '#6a2019'); R(18, 35, 12, 2, '#d8604a'); },
  beard: moustache('#e6e4de', true), hat: HAT.kettle,
  front(){ R(42, 0, 2, 48, '#7a5a3c'); R(41, 2, 4, 2, '#cdd3d8'); } }, st);
F.mara = st => person({ tint:'#c8962a', skin:SK.fair, clothes:pal('#c8962a', '#f0c454', '#82601a'), hair:'long', hairCol:'#7a3420', brow:'#5a2414',
  collar(){ vNeck('#ece4d2', 8); R(23, 36, 1, 12, '#82601a'); }, hat: HAT.goggleCap, cheek:'#e8a890',
  front(){ R(32, 40, 14, 8, '#ecdcb0'); R(32, 40, 14, 1, '#fff2cc'); R(34, 43, 8, 1, '#8a6a4a'); P(40, 45, '#c43a2a'); } }, st);
F.vey = st => person({ tint:'#c4487a', skin:SK.tan, clothes:pal('#3c3444', '#5a5064', '#241f2a'), hair:'crop', hairCol:'#1e1618', brow:'#1e1618',
  collar(){ for(let i = 0; i < 16; i++) R(10 + i * 2, 37 + i, 3, 2, i < 3 ? '#ee78a4' : '#c4487a'); R(28, 40, 10, 6, '#e6dcc6'); R(28, 40, 10, 1, '#fffaee'); },
  hat: HAT.headband, front(){ R(22, 26, 1, 1, '#8a4a3a'); } }, st);
F.elsie = st => person({ tint:'#c8443a', skin:SK.fair, clothes:pal('#c8443a', '#f06c56', '#84261e'), hair:'crop', hairCol:'#d8d4cc', brow:'#b0aaa0', cheek:'#ee8a7a', wrinkles:1,
  headShape:{ rx:10.5, ry:10.5, jaw:.2 }, collar(){ R(16, 42, 16, 6, '#efe4cc'); R(16, 42, 16, 1, '#fffaf0'); }, hat: HAT.knotScarf }, st);
F.bram = st => person({ tint:'#e0a030', skin:SK.tan, clothes:pal('#d8d0b8', '#f6f0de', '#9a927a'), hair:'crop', hairCol:'#3a2a20', brow:'#2a1a12',
  headShape:{ rx:8.5, ry:12, jaw:.4 }, collar(){ scarfCollar(pal('#e0a030', '#ffcc60', '#9a6a14')); R(6, 38, 5, 9, '#e0a030'); },
  beard: beard('#6a5040', 'stubble'), hat: HAT.cone }, st);
F.tamsin = st => person({ tint:'#d9a42c', skin:SK.fair, clothes:pal('#2a2430', '#443c4c', '#16121a'), hair:'bun', hairCol:'#d8d4e0', brow:'#a8a4b0', iris:'#3a5a8a',
  collar(){ poly([[17, 36], [30, 36], [28, 48], [19, 48]], pal('#d9a42c', '#f4cc5a', '#95701c'), 1); R(21, 35, 6, 3, '#f0ead8'); P(23, 41, '#fff4d0'); P(23, 45, '#fff4d0'); },
  hat: HAT.tophat, front(){ for(const x of [16, 25]){ R(x, 19, 6, 1, '#8a7a5a'); R(x, 23, 6, 1, '#8a7a5a'); R(x, 19, 1, 5, '#8a7a5a'); R(x + 5, 19, 1, 5, '#8a7a5a'); } R(22, 20, 3, 1, '#8a7a5a'); P(17, 20, '#ffffff'); } }, st);
F.oren = st => person({ tint:'#c0652a', skin:SK.tan, clothes:pal('#4e4a50', '#6c6872', '#322e36'), hair:'bald', brow:'#2e1c14',
  shoulders:{ w:23, top:36 }, headShape:{ rx:10.5, ry:11, jaw:.2 },
  collar(){ R(12, 38, 3, 10, '#c0652a'); R(33, 38, 3, 10, '#c0652a'); poly([[14, 42], [34, 42], [34, 48], [14, 48]], pal('#c0652a', '#ec8e4a', '#7a3c16'), 1);
    for(let i = 0; i < 14; i++){ const x = 8 + i * 2.4, y = 36 + i * 0.85; if(i % 2) R(x, y, 2, 1, '#a9b0bb'); else R(x, y - 1, 1, 2, '#eef3f8'); } },
  beard: beard('#2e1c14', 'spade'), front(){ R(15, 12, 10, 1, '#f0c090'); R(18, 17, 12, 1, '#7a4a30'); } }, st);
F.silas = st => person({ tint:'#2e8a84', skin:SK.pale, clothes:pal('#2e8a84', '#5cbcb2', '#1a5450'), hair:'crop', hairCol:'#2a2020', cheek:'#e8a0a0', iris:'#3a3a3a',
  back(){ R(2, 26, 7, 12, '#d3a646'); R(2, 26, 7, 1, '#ffe08a'); R(8, 31, 6, 2, '#86621e'); },
  collar(){ R(15, 33, 18, 5, '#5cbcb2'); for(let y = 40; y < 48; y += 3) R(23, y, 2, 2, '#ffe08a'); }, hat: HAT.shako }, st);
F.sable = st => person({ tint:'#e6dfcc', skin:SK.brown, clothes:pal('#2c2830', '#4c4652', '#18151c'), hair:'bald', eyes:'none', brows:false,
  back(){ R(4, 0, 2, 40, '#7a5a3c'); R(8, 0, 2, 40, '#a47c54'); R(3, 4, 8, 12, '#c8bca0'); },
  collar(){ R(24, 34, 7, 14, '#e6dfcc'); R(24, 34, 2, 14, '#fffaee'); },
  hat(){ HAT.softHood(pal('#2c2830', '#4c4652', '#18151c')); R(14, 12, 20, 7, '#18151c'); R(14, 19, 20, 1, '#241f28'); g.globalAlpha = .35; R(14, 20, 20, 3, '#18151c'); g.globalAlpha = 1;
    if(!st.blink){ P(19, 21, '#f0d8a0'); P(28, 21, '#f0d8a0'); } } }, st);
F.cartographer = st => person({ tint:'#7c3470', skin:SK.fair, clothes:pal('#7c3470', '#aa5a9a', '#4c1c44'), hair:'receding', hairCol:'#ece8e0', eyes:'blind', wrinkles:1,
  back(){ R(3, 18, 4, 16, '#6a4a30'); for(const [x, h] of [[3, 10], [5, 14], [7, 8]]){ R(x, 34 - h - 12, 2, h, '#efe2c0'); P(x, 34 - h - 12, '#c43030'); } },
  beard: beard('#ece8e0', 'long'), front(){ const B = pal('#d3a646', '#ffe08a', '#86621e'); line(14, 23, 7, 12, B.c, 2); poly([[2, 4], [11, 7], [9, 13], [3, 12]], B, 1); P(6, 8, '#3a2a14'); } }, st);
F.aven = st => person({ tint:'#3cc4dc', skin:SK.ruddy, clothes:pal('#e6e0d0', '#fffaf0', '#a8a290'), hair:'wild', hairCol:'#e0b060', brow:'#a07a30',
  collar(){ scarfCollar(pal('#3cc4dc', '#8ae8f6', '#1f8098')); for(let i = 0; i < 9; i++) R(11 - i, 35 + (i >> 1) + Math.round(Math.sin(st.t * 6 + i) * .7), 2, 2, i % 2 ? '#3cc4dc' : '#8ae8f6'); },
  hat(){ R(15, 13, 7, 4, '#d3a646'); R(24, 13, 7, 4, '#d3a646'); R(16, 14, 5, 2, '#bff4ff'); R(25, 14, 5, 2, '#bff4ff'); R(13, 14, 22, 1, '#6a4a30'); } }, st);
F.recruit = st => person({ tint:'#cc3a32', skin:SK.fair, clothes:pal('#cc3a32', '#f06454', '#86201a'), hair:'wild', hairCol:'#e07a2a', brow:'#c05a1a', freckles:'#d88a60', cheek:'#f0a090',
  collar(){ R(8, 37, 32, 3, '#8a8e96'); R(21, 41, 5, 5, '#ffe08a'); }, front(){ R(11, 20, 3, 6, '#f2cfae'); } }, st);
F.tovin = st => person({ tint:'#2f8f86', skin:SK.ruddy, clothes:pal('#8a8680', '#aca8a0', '#5e5a54'), hair:'crop', hairCol:'#8a8680', brow:'#6a6660', headShape:{ rx:10.5, ry:10.5, jaw:.1 },
  collar(){ poly([[14, 38], [33, 38], [34, 48], [13, 48]], pal('#2f8f86', '#55b8ac', '#1c5a54'), 1); }, beard: moustache('#d8d4cc', true), hat(){ HAT.flatcap('#4a4a52'); } }, st);
F.archivist = st => person({ tint:'#8c2c44', skin:SK.pale, clothes:pal('#8c2c44', '#b84a64', '#561828'), hair:'receding', hairCol:'#b0aab0', headShape:{ rx:8.5, ry:12, jaw:.45 }, wrinkles:1,
  back(){ const cols = ['#3a5a8a', '#8a6a2a', '#6a2a2a', '#2a5a4a', '#c8b890', '#4a3a6a']; cols.forEach((c, i) => { R(1 + (i % 2), 38 - i * 6, 10, 5, c); R(1 + (i % 2), 38 - i * 6, 10, 1, '#e8dcc0'); }); },
  front(){ R(16, 23, 5, 1, '#d3a646'); R(25, 23, 5, 1, '#d3a646'); R(21, 23, 4, 1, '#86621e'); } }, st);
F.servicekeeper = st => person({ tint:'#b08a4e', skin:SK.ruddy, clothes:pal('#b08a4e', '#d8b474', '#735830'), hair:'crop', hairCol:'#5a4028', headShape:{ rx:10.5, ry:11, jaw:.05 }, shut: st.yawn,
  collar(){ for(const [x, y] of [[23, 39], [24, 43], [25, 47]]) R(x, y, 2, 1, '#ffe08a'); }, beard: moustache('#6a4028'), hat: HAT.peaked,
  front(){ R(17, 19, 4, 1, '#c07a5a'); R(26, 19, 4, 1, '#c07a5a'); } }, st);
F.nim = st => person({ tint:'#e8a42a', skin:SK.fair, clothes:pal('#e8a42a', '#ffd064', '#9a6614'), hair:'bald', cheek:'#f09090', headShape:{ rx:8.5, ry:9, jaw:.2, dy:2 }, ear:false,
  hat(){ const C = pal('#e8a42a', '#ffd064', '#9a6614'); poly([[6, 40], [7, 16], [14, 6], [24, 3], [34, 6], [41, 16], [41, 40], [35, 40], [35, 18], [30, 12], [18, 12], [13, 18], [12, 40]], C, 2);
    for(let a = 0; a < 26; a++){ const t = a / 25 * Math.PI * 1.2 - Math.PI * 1.1; R(Math.round(24 + Math.cos(t) * 13), Math.round(24 + Math.sin(t) * 14), 2, 2, '#f4efe6'); } } }, st);
F.venn = st => person({ tint:'#26222a', skin:SK.ruddy, clothes:pal('#26222a', '#403a46', '#141216'), hair:'bald',
  collar(){ R(10, 36, 28, 4, '#dcd6cc'); R(10, 36, 28, 1, '#f8f4ee'); P(23, 42, '#c83a2a'); P(23, 46, '#c83a2a'); },
  beard: moustache('#f0ece4', true), hat: HAT.ushanka,
  front(){ R(28, 29, 7, 1, '#4e3826'); R(34, 25, 3, 4, '#7a5a3c'); P(35, 25, '#ff5a2a'); for(let i = 0; i < 3; i++){ const p = (st.t * .5 + i / 3) % 1; g.globalAlpha = (1 - p) * .6; R(35 + Math.round(Math.sin(p * 5 + i) * 1.5), 22 - Math.round(p * 18), 2, 1, '#e8e8ec'); g.globalAlpha = 1; } } }, st);
F.frostwoman = st => person({ tint:'#c46e8a', skin:SK.fair, clothes:pal('#c46e8a', '#e894ae', '#7e4058'), hair:'bun', hairCol:'#f0ece8', brow:'#c8c4c0', wrinkles:1, cheek:'#e8a0a0',
  collar(){ for(const [x, y, c] of [[10, 40, '#e8b0c0'], [20, 43, '#7e4058'], [30, 40, '#e894ae'], [14, 45, '#d88aa4'], [34, 45, '#e8b0c0']]) R(x, y, 4, 3, c); R(28, 44, 5, 4, '#4a7ac8'); R(28, 44, 5, 1, '#8ab0f0'); } }, st);
F.creaturekeeper = st => person({ tint:'#e08a2a', skin:SK.brown, clothes:pal('#e08a2a', '#ffb452', '#8e5214'), hair:'bald', eyes:'none', brows:false, shoulders:{ w:23 },
  collar(){ R(8, 42, 32, 1, '#8e5214'); R(23, 38, 1, 10, '#8e5214'); R(12, 36, 24, 3, '#f4e0c0'); }, hat: HAT.flyingcap }, st);
F.sera = st => person({ tint:'#23a8a4', skin:SK.brown, clothes:pal('#23a8a4', '#58d4cc', '#146a68'), hair:'long', hairCol:'#1a1010', brow:'#1a1010',
  collar(){ line(8, 37, 36, 48, '#6a4a30', 2); R(22, 36, 3, 12, '#146a68'); }, hat: HAT.courier }, st);
F.foundry = st => person({ tint:'#e8c020', skin:SK.soot, clothes:pal('#2e2c2e', '#4c484c', '#1a181a'), hair:'crop', hairCol:'#3a2a20', brow:'#2a1a12',
  collar(){ R(6, 43, 36, 2, '#e8c020'); R(15, 34, 18, 3, '#6a8a8a'); R(17, 35, 4, 1, '#9fe0e0'); R(26, 35, 4, 1, '#9fe0e0'); },
  front(){ P(18, 25, '#7a6a5a'); P(29, 27, '#5a4a40'); R(26, 12, 3, 1, '#5a4a40'); }, hat(){ HAT.hardhat(false); } }, st);
F.breaker = st => person({ tint:'#c8342c', skin:SK.deep, clothes:pal('#6a6a70', '#8e8e94', '#46464c'), hair:'bald', eyes:'normal', shoulders:{ w:24, top:36 }, headShape:{ rx:10.5, ry:11, jaw:.15 },
  collar(){ R(3, 38, 8, 10, SK.deep.c); R(37, 38, 8, 10, SK.deep.d); poly([[14, 34], [33, 34], [30, 41], [17, 41]], pal('#c8342c', '#e85a4a', '#86201a'), 1); },
  beard: beard('#1a1010', 'stubble'), hat(){ HAT.hardhat(false); } }, st);
F.automaton = st => {
  const I = pal('#4a5058', '#747c86', '#2a2e34'), B = pal('#c9a04a', '#f0d07a', '#7a5e22');
  backdrop('#ff8a3a');
  poly([[1, 32], [47, 30], [48, 48], [0, 48]], I, 3); R(0, 37, 48, 2, B.c); R(0, 37, 48, 1, B.l);
  const pulse = (Math.sin((st.t || 0) * 2.2) + 1) / 2; R(17, 41, 14, 7, '#1a1010'); R(18, 42, 12, 1, pulse > .5 ? '#ffd07a' : '#ff8a3a'); R(18, 45, 12, 1, '#ff8a3a');
  poly([[11, 8], [36, 8], [38, 28], [9, 28]], I, 3); R(11, 8, 25, 1, I.l); R(9, 16, 29, 2, B.c);
  const talk = st.mouth ? 1 : 0; R(14, 19, 22, 3 + talk, '#0a1418'); R(15, 20, 20, 1 + talk, '#8ff0ff'); if(!st.blink) P(33, 20, '#ffffff');
  for(const [x, y] of [[12, 11], [34, 11], [12, 25], [34, 25]]) P(x, y, B.l);
  R(14, 24, 20, 1, I.d); for(let x = 16; x < 33; x += 3) R(x, 25, 1, 2, I.d);
};
F.clerk = st => person({ tint:'#e6cc5a', skin:SK.pale, clothes:pal('#e6cc5a', '#fff0a0', '#a08a2c'), hair:'crop', hairCol:'#8a7a6a', bags:'#8a6a9a', shut: st.yawn,
  collar(){ R(19, 35, 10, 4, '#fffaf0'); P(23, 42, '#a08a2c'); P(23, 46, '#a08a2c'); }, hat: HAT.nightcap,
  front(){ R(38, 40, 8, 2, '#c8c4bc'); R(41, 32, 2, 8, '#f4f0e8'); const fl = Math.sin((st.t || 0) * 17) > .3; R(41, 29 - (fl ? 1 : 0), 2, 3, '#ffb040'); P(41, 30, '#fff4c0'); } }, st);
F.neighbor = st => person({ tint:'#e0789e', skin:SK.fair, clothes:pal('#e0789e', '#ffa0c0', '#984464'), hair:'bun', hairCol:'#b8b4b0', brow:'#8a8680', wrinkles:1,
  collar(){ poly([[14, 35], [23, 44], [32, 35], [34, 40], [23, 48], [12, 40]], pal('#ffa0c0', '#ffc0d8', '#e0789e'), 1); },
  front(){ R(40, 0, 2, 48, '#7a5a3c'); } }, st);
F.upstairs = st => person({ tint:'#3cbccc', skin:SK.tan, clothes:pal('#3cbccc', '#7ae4f0', '#1e7a88'), hair:'short', hairCol:'#5a3a2a',
  collar(){ poly([[15, 35], [23, 43], [31, 35], [33, 39], [23, 47], [13, 39]], pal('#7ae4f0', '#a8f0f8', '#3cbccc'), 1); },
  hat(){ for(const [x, y] of [[15, 12], [20, 10], [26, 10], [31, 13], [13, 18]]){ R(x, y, 3, 2, '#ff8ab4'); P(x, y, '#ffc0d8'); } } }, st);
F.figure = st => {
  const C = pal('#c8cee2', '#f4f6ff', '#8a90a8');
  backdrop('#f0cc6a');
  g.globalAlpha = .9;
  poly([[4, 48], [8, 30], [14, 14], [24, 7], [34, 14], [40, 30], [44, 48]], C, 3);
  R(15, 16, 18, 16, '#1e1c2c'); R(16, 32, 16, 1, '#2a2838');
  const flick = st.mouth ? .7 : 1; g.globalAlpha = flick;
  if(!st.blink){ R(18, 21, 3, 2, '#f0cc6a'); R(27, 21, 3, 2, '#f0cc6a'); }
  g.globalAlpha = 1;
  R(14, 3, 20, 2, '#f0cc6a'); P(13, 4, '#f0cc6a'); P(34, 4, '#f0cc6a'); R(21, 40, 6, 5, '#fff4d0');
};
F.bellkeeper = st => person({ tint:'#1f8a80', skin:SK.brown, clothes:pal('#1f8a80', '#48b8aa', '#12544e'), hair:'crop', hairCol:'#e8e4dc', brow:'#e8e4dc', wrinkles:1,
  collar(){ R(8, 45, 32, 2, '#d3a646'); }, beard: beard('#e8e4dc', 'round'), hat: HAT.bellcap,
  front(){ const sw = Math.round(Math.sin((st.t || 0) * 1.5) * 1.5); R(38 + sw, 36, 8, 7, '#d3a646'); R(37 + sw, 43, 10, 2, '#ffe08a'); R(41 + sw, 33, 2, 3, '#7a5a3c'); } }, st);
F.defender = st => person({ tint:'#9a2a2e', skin:SK.ruddy, clothes:pal('#8a9098', '#c4cad2', '#50565e'), hair:'bald', shut:true,
  collar(){ scarfCollar(pal('#9a2a2e', '#c84a4a', '#5a1418')); }, beard: beard('#6a5040', 'stubble'), hat(){ HAT.helm(); } }, st);
F.lookout = st => person({ tint:'#d0a030', skin:SK.fair, clothes:pal('#8a9098', '#c4cad2', '#50565e'), hair:'bald',
  collar(){ scarfCollar(pal('#d0a030', '#f4cc5a', '#8a6614')); }, hat(){ HAT.helm(); }, front(){ R(29, 19, 18, 4, '#d3a646'); R(29, 19, 18, 1, '#ffe08a'); P(46, 20, '#bff4ff'); } }, st);
F.volunteer = st => person({ tint:'#ece6d6', skin:SK.tan, clothes:pal('#ece6d6', '#ffffff', '#b8b0a0'), hair:'short', hairCol:'#2a1a12' }, st);
F.miner = st => person({ tint:'#b04a2a', skin:SK.soot, clothes:pal('#b04a2a', '#d8704a', '#6a2a14'), hair:'crop', hairCol:'#3a2a20',
  collar(){ R(14, 38, 3, 10, '#6a2a14'); R(31, 38, 3, 10, '#6a2a14'); }, beard: beard('#4a3a30', 'stubble'), hat(){ HAT.hardhat(true); },
  front(){ g.globalAlpha = .22; for(let i = 0; i < 10; i++) R(34 + i, 8 - (i >> 1), 1, 4 + i, '#fff6c8'); g.globalAlpha = 1; } }, st);
F.sailor = st => person({ tint:'#e8b820', skin:SK.ruddy, clothes:pal('#e8b820', '#ffe070', '#9a7410'), hair:'crop', hairCol:'#c8c4bc', brow:'#b8b4ac', wrinkles:1,
  collar(){ for(let i = 0; i < 12; i++){ const a = i / 12 * Math.PI; R(Math.round(10 + Math.cos(a) * 3), Math.round(40 + Math.sin(a) * 5), 2, 2, i % 2 ? '#7a5430' : '#b08a58'); } },
  beard: beard('#c8c4bc', 'round'), hat: HAT.souwester }, st);
F.stranded = st => person({ tint:'#c8342c', skin:SK.tan, clothes:pal('#ece4d4', '#ffffff', '#b8b0a0'), hair:'crop', hairCol:'#3a2a1a',
  collar(){ for(let y = 39; y < 48; y += 3) R(4, y, 40, 1, '#c8342c'); }, hat(){ HAT.beanie('#c8342c'); } }, st);
F.organizer = st => person({ tint:'#e2508e', skin:SK.deep, clothes:pal('#e2508e', '#ff84b4', '#98285a'), hair:'long', hairCol:'#1a1010', brow:'#1a1010', cheek:'#c86a6a',
  collar(){ const flags = ['#f0d040', '#48c0d8', '#ffffff', '#f07030']; for(let i = 0; i < 9; i++) R(6 + i * 4, 37 + Math.round(i * 1.1), 3, 3, flags[i % 4]); }, hat: HAT.partyhat }, st);
F.soldier = st => person({ tint:'#8a2a2a', skin:SK.tan, clothes:pal('#8a9098', '#c4cad2', '#50565e'), hair:'bald',
  back(){ poly([[0, 34], [10, 32], [12, 48], [0, 48]], pal('#8a2a2a', '#b84444', '#561818'), 1); }, hat(){ HAT.helm('#b84444'); } }, st);
F.mother = st => person({ tint:'#1e7a78', skin:SK.brown, clothes:pal('#1e7a78', '#44a8a2', '#0e4a48'), hair:'bald',
  back(){ const J = pal('#c07040', '#e09060', '#7a4020'); poly([[16, 0], [31, 0], [30, 5], [17, 5]], J, 1); },
  hat(){ HAT.kerchief('#1e7a78'); R(8, 17, 5, 18, '#1e7a78'); R(8, 17, 1, 18, '#44a8a2'); },
  front(){ R(26, 38, 14, 10, '#efe6d2'); R(26, 38, 14, 1, '#fffaf0'); R(30, 40, 5, 4, SK.fair.c); P(31, 41, EYE); P(33, 41, EYE); } }, st);
F.sickwoman = st => person({ tint:'#a8402e', skin:SK.tan, clothes:pal('#a8402e', '#d0624a', '#6a2418'), hair:'bald', eyes:'none', brows:false, mouth:false, nose:false,
  hat(){ const B = pal('#d8d0bd', '#efe8d8', '#b9b09a'); fill(ellipseRows(HX, 21, 10.5, 12, .3), B, 2); for(let y = 13; y < 33; y += 3) R(14, y, 20, 1, B.d);
    R(19, 20, 12, 3, '#2a2520'); if(!st.blink){ R(20, 21, 2, 1, '#f0e0c0'); R(27, 21, 2, 1, '#f0e0c0'); }
    R(10, 12, 1, 5, '#6b7a5a'); R(8, 8, 5, 4, '#f4f1e6'); P(10, 9, '#cfc8b2'); } }, st);
F.pilgrim = st => person({ tint:'#e0782a', skin:SK.deep, clothes:pal('#e0782a', '#ffa050', '#984a14'), hair:'crop', hairCol:'#1a1010',
  back(){ R(0, 10, 11, 38, '#6a4a30'); R(0, 4, 13, 7, '#6a7a8a'); R(0, 4, 13, 1, '#8a9aaa'); },
  collar(){ line(12, 36, 20, 48, '#6a4a30', 2); line(35, 36, 28, 48, '#6a4a30', 2); }, hat(){ HAT.straw(false); } }, st);
F.gardener = st => person({ tint:'#d8543c', skin:SK.brown, clothes:pal('#d8543c', '#ff7e5c', '#8e2e1e'), hair:'short', hairCol:'#2a1a12',
  collar(){ R(17, 40, 14, 8, '#e8dcc0'); R(17, 40, 14, 1, '#fffaf0'); }, hat(){ HAT.straw(true); } }, st);
F.servant = st => person({ tint:'#d8b25a', skin:SK.tan, clothes:pal('#26222c', '#443e4c', '#121016'), hair:'bald', eyes:'none', brows:false, mouth:false, nose:false,
  collar(){ R(21, 35, 6, 6, '#f4f0e6'); for(let y = 41; y < 48; y += 3) R(23, y, 2, 2, '#f3d67a'); R(8, 36, 32, 1, '#d8b25a'); },
  hat(){ const B = pal('#d8d0bd', '#efe8d8', '#b9b09a'); fill(ellipseRows(HX, 21, 10.5, 12, .3), B, 2); for(let y = 13; y < 33; y += 3) R(14, y, 20, 1, B.d);
    const G = pal('#d8b25a', '#f3d67a', '#8a6a24'); poly([[15, 15], [33, 15], [33, 27], [29, 31], [19, 31], [15, 27]], G, 2);
    R(18, 20, 4, 2, '#3a2a14'); R(27, 20, 4, 2, '#3a2a14'); R(23, 22, 2, 5, G.l); R(21, 28, 7, 1, G.d);
    R(9, 12, 1, 5, '#6b7a5a'); R(7, 8, 5, 4, '#f4f1e6'); } }, st);
F.olan = st => person({ tint:'#4a7a7c', skin:SK.ruddy, clothes:pal('#4a7a7c', '#6c9c9a', '#2e5052'), hair:'crop', hairCol:'#8a8680', wrinkles:1,
  collar(){ poly([[12, 34], [22, 36], [22, 42], [10, 40]], pal('#6c9c9a', '#8abcb8', '#4a7a7c'), 1); poly([[26, 36], [36, 34], [37, 40], [26, 42]], pal('#4a7a7c', '#6c9c9a', '#2e5052'), 1); },
  beard: beard('#a8a49c', 'stubble'), hat(){ HAT.knit('#3c3a42'); } }, st);
F.orra = st => person({ tint:'#74486c', skin:SK.fair, clothes:pal('#74486c', '#94688c', '#4a2c46'), hair:'bun', hairCol:'#dcd8e0', brow:'#b0acb8', wrinkles:1, eyes:'small',
  collar(){ for(let x = 8; x < 40; x += 3) P(x, 46, '#4a2c46'); R(30, 41, 5, 5, '#d3a646'); P(32, 43, '#fff8e0'); line(29, 36, 31, 41, '#ffe08a'); },
  hat(){ line(13, 3, 21, 9, '#d8a040'); }, front(){ for(const x of [16, 25]){ R(x, 19, 6, 5, '#d8eef4'); R(x + 1, 20, 4, 3, '#eef8fa'); P(x + 3, 21, EYE); } R(22, 21, 3, 1, '#a8a4b0'); } }, st);
F.pell = st => person({ tint:'#3a94a2', skin:SK.tan, clothes:pal('#6a6a70', '#8a8a90', '#46464c'), hair:'crop', hairCol:'#5a3a22',
  back(){ R(0, 34, 48, 2, '#a47c54'); R(0, 36, 48, 1, '#4e3826'); },
  collar(){ R(16, 42, 16, 6, '#7a5a3a'); P(20, 44, '#e0a030'); P(27, 46, '#c07a20'); R(4, 37, 5, 7, SK.tan.c); R(39, 37, 5, 7, SK.tan.d); }, hat(){ HAT.kerchief('#3a94a2'); } }, st);
F.hale = st => person({ tint:'#767a82', skin:SK.ruddy, clothes:pal('#767a82', '#9a9ea6', '#4c5058'), hair:'crop', hairCol:'#8a8680', eyes:'patch', wrinkles:1,
  collar(){ poly([[3, 36], [14, 34], [16, 40], [4, 42]], pal('#5a5f68', '#9aa1aa', '#34383e'), 1); R(33, 35, 10, 8, '#e6dcc6'); R(33, 38, 10, 1, '#c8bca4'); line(14, 38, 30, 48, '#5a4030', 1); },
  beard: beard('#b8b4ac', 'round'), front(){ line(14, 17, 30, 17, '#2a2020'); } }, st);
F.talla = st => person({ tint:'#c83c3c', skin:SK.brown, clothes:pal('#e2dac6', '#fff8ea', '#aaa290'), hair:'long', hairCol:'#2a1a14', brow:'#1a1010',
  collar(){ R(6, 44, 36, 2, '#c83c3c'); R(34, 30, 2, 12, '#2a1a14'); }, hat(){ HAT.kerchief('#c83c3c'); },
  front(){ const by = 2 + Math.round(Math.sin((st.t || 0) * 2.1)); [1, 3, 5, 3, 1].forEach((w, i) => R(42 - (w >> 1), by + i, w, 1, i < 2 ? '#ea6a5e' : '#c83c3c')); } }, st);
F.edrin = st => person({ tint:'#5a6a76', skin:SK.tan, clothes:pal('#5a6a76', '#7c8e9a', '#3a4852'), hair:'crop', hairCol:'#e0d8cc', brow:'#e0d8cc', wrinkles:1,
  beard: beard('#e0d8cc', 'round'), hat: HAT.bowl }, st);
F.senn = st => person({ tint:'#2f7a78', skin:SK.deep, clothes:pal('#d8ccb4', '#f0e6d0', '#a89c84'), hair:'bald', headShape:{ rx:8.5, ry:12, jaw:.45 },
  back(){ poly([[0, 30], [12, 32], [14, 48], [0, 48]], pal('#8a7a5a', '#a89a72', '#5e5240'), 1); for(const [x, y] of [[3, 36], [7, 41], [2, 44], [9, 34]]) R(x, y, 2, 2, '#5e5240'); },
  collar(){ poly([[15, 39], [33, 39], [34, 48], [14, 48]], pal('#2f7a78', '#4ea09c', '#1a4e4c'), 1); for(const x of [17, 21, 25]) R(x, 40, 1, 2, '#e8ecf0'); },
  beard: beard('#d8d4cc', 'goatee'), front(){ R(15, 12, 8, 1, SK.deep.l); } }, st);
F.veya = st => person({ tint:'#e0d4ba', skin:SK.fair, clothes:pal('#4a3e48', '#645868', '#302830'), hair:'crop', hairCol:'#c8c4cc', brow:'#a8a4ac', wrinkles:1,
  collar(){ poly([[4, 38], [23, 46], [43, 38], [44, 48], [3, 48]], pal('#e0d4ba', '#fff6e2', '#a89c82'), 1); R(31, 22, 3, 22, '#c8c4cc'); P(32, 44, '#c05a6a'); } }, st);
F.orenAct2 = st => person({ tint:'#b9b09a', skin:SK.tan, clothes:pal('#6f6a5c', '#8a8474', '#524e44'), hair:'bald', eyes:'none', brows:false, mouth:false, nose:false,
  hat(){ const B = pal('#d8d0bd', '#efe8d8', '#b9b09a'); fill(ellipseRows(HX, 19, 10.5, 10, .1), B, 2); for(let y = 12; y < 28; y += 3) R(14, y, 20, 1, B.d);
    R(18, 20, 13, 2, '#2a2520'); if(!st.blink) R(26, 20, 2, 1, '#f0e0c0');
    poly([[14, 27], [33, 27], [31, 36], [26, 42], [21, 42], [16, 36]], pal('#6e5e4a', '#9a8a72', '#4a3e30'), 1); R(24, 33, 1, 5, '#9a8a72');
    R(9, 12, 1, 5, '#6b7a5a'); R(7, 8, 5, 4, '#f4f1e6'); } }, st);

/* ── Who is speaking ───────────────────────────────────────────────────────────────────────────────────── */
const NAMES = {
  ROWAN:'rowan', MARA:'mara', DARO:'mara', VEY:'vey', ELSIE:'elsie', BRAM:'bram', TAMSIN:'tamsin', OREN:'oren', SILAS:'silas', SABLE:'sable',
  CARTOGRAPHER:'cartographer', AVEN:'aven', RECRUIT:'recruit', TOVIN:'tovin', ARCHIVIST:'archivist', 'SERVICE KEEPER':'servicekeeper',
  NIM:'nim', VENN:'venn', 'FROSTFELL WOMAN':'frostwoman', 'CREATURE KEEPER':'creaturekeeper', SERA:'sera', 'FOUNDRY WORKERS':'foundry',
  BREAKER:'breaker', 'WAR AUTOMATON':'automaton', 'SLEEPLESS CLERK':'clerk', NEIGHBORS:'neighbor', NEIGHBOR:'neighbor', 'UPSTAIRS NEIGHBOR':'upstairs',
  FIGURE:'figure', BELLKEEPER:'bellkeeper', 'TIRED DEFENDER':'defender', LOOKOUT:'lookout', VOLUNTEER:'volunteer', MINER:'miner', SAILORS:'sailor',
  'STRANDED SAILOR':'stranded', ORGANIZER:'organizer', SOLDIER:'soldier', MOTHER:'mother', PILGRIM:'pilgrim', 'PALACE GARDENER':'gardener',
  OLAN:'olan', ORRA:'orra', PELL:'pell', HALE:'hale', TALLA:'talla', EDRIN:'edrin', SENN:'senn', VEYA:'veya',
  'KNEELING MAN':'orenAct2', 'WOMAN BY THE GATE':'sickwoman', 'SERVANT IN A GOLD MASK':'servant', 'SERVANT':'servant',
  KNIGHT:'knight', YOU:'knight',
};
function resolve(title){
  if(!title) return null;
  let t = String(title).toUpperCase().replace(/[’']/g, '\'').trim();
  t = t.split(/\s*[·,]\s*|\s+THE\s+(?=[A-Z-]+$)/)[0].trim();                 // 'TAMSIN · THE ASSESSOR', 'VENN, STOVE FACTOR', 'AVEN THE SAIL-CUTTER'
  t = t.replace(/^(THE|A|AN)\s+/, '');
  if(/SERVICE DRAWER/.test(t)) return null;                                   // Vey's drawer has nobody behind it
  if(NAMES[t]) return NAMES[t];
  const first = t.split(/\s+/)[0];
  return NAMES[first] && !/^(THE|A)$/.test(first) ? NAMES[first] : null;
}
const CONCERN = /\b(sorry|afraid|scared|dead|died|dying|killed|lost|hurt|wound|pain|can[’']t|cold|alone|gone|burn|blood|sick|fever|nobody|never|wrong)\b/i;
function mood(text){ return CONCERN.test(String(text || '')) ? 'concerned' : 'neutral'; }
function draw(ctx, id, st){
  const fn = F[id]; if(!fn) return false;
  g = ctx; st = st || {};
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, SIZE, SIZE);
  try { fn({ t:st.t || 0, blink:!!st.blink, mouth:st.mouth || 0, mood:st.mood || 'neutral', yawn:!!st.yawn }); }
  finally { ctx.restore(); ctx.globalAlpha = 1; g = null; }
  return true;
}
root.BladefallPortraits = Object.freeze({ SIZE, KNIGHT, resolve, draw, mood, has:id => !!F[id], ids:Object.freeze(Object.keys(F)) });
})(typeof window !== 'undefined' ? window : globalThis);
