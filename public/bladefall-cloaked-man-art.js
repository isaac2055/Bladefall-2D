/* Bladefall — BATTLE 42 · THE CLOAKED MAN's art (2026-09-26).

   The concept sheets (docs/concept-art/cloaked-man/) drawn into the renderer's buffer at the same scale:
     I   the Penitent at rest, the Keeper's raised arm for the bat, the Drifter's stoop for the dash;
     II  the Gale drifting, the Ascendant for the swarm, the Tempest for the dive;
     III the spider: a skull you can read from across the arena (blank eyes, the oil-slick shine), a ribcage with
         the cloak's rag on it, legs that end in long-fingered hands walking on their fingertips;
     IV  the Horizon: the skull behind the arena, its far legs caging the sky, its hands on the floor's ends.
   What you must read: every tell (the dash's floor line, the ghost where the phantom will come out, the bat, the
   gap in each curtain, the dive's line, the lunge's line, the jaw, the finger marks, the gaze's line, the lifted
   hand, the cracks before the teeth) and when he can be struck (always, I–III; in IV the open eyes and a resting
   hand, both drawn bright). */
(function installCloakedManArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;
const SH = () => ART.shared || {};
const K = () => root.BladefallCloakedMan;
const STAGE = 43;

const C = { sky:['#07060f', '#140d22', '#2a1330', '#4a1c2a'], hill0:'#0d0a16', hill1:'#140f1f', stone:'#34303e', stoneLit:'#4a4556', stoneDark:'#22202a',
  line:'#0d0b12', violet:'#8a5cd8', violetLit:'#c9a8ff', iron:'#2a2a2c', ironLit:'#8a8a90', white:'#f4f0ff', ink:'#0b0810' };
const P1 = { cloak:'#5b3a8c', lit:'#8a63c7', dark:'#34205a', deep:'#1f1236', hoodIn:'#0e0918', mouth:'#8c7aa6', sheen:'#b596e6',
  glove:'#40364a', gloveLit:'#7a6c8c', chain:'#848b9b', chainLit:'#d6deeb' };
const P2 = { cloak:'#6b41b0', lit:'#a883ee', sheen:'#eadcff', dark:'#3b2170', deep:'#22113f', hoodIn:'#0c0716', mouth:'#9a86b8' };
const BACK = { cloak:'#3b2170', lit:'#6b41b0', dark:'#22113f', deep:'#150a28' };
const MANTLE = { cloak:'#8a63c7', lit:'#a78ae0', dark:'#34205a', deep:'#1f1236' };
const BONE = { cloak:'#e9dfc9', lit:'#fff8e8', dark:'#a89d86', deep:'#6f6656' };
const FAR = { cloak:'#8f869c', lit:'#b3a9bf', dark:'#655d72', deep:'#433c50' };
const GIANT = { cloak:'#a397ae', lit:'#cdc1d6', dark:'#6d6384', deep:'#473f5c' };
const DIST = { cloak:'#5f5670', lit:'#786e8a', dark:'#433b54', deep:'#2d2740' };
const VOID = '#110818';
const SHINE = ['#8ff5e6', '#9fc4ff', '#c7a2ff', '#ff9fd8', '#ffe0a0'];

function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === STAGE ? A : null; }
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

/* ── Buffer primitives ───────────────────────────────────────────────────────── */
/* A filled polygon, shaded the way the renderer shades its sprites: the top row and the left edge lit, the far
   (right) edge dark. Points are buffer pixels. */
function rows(api, pts, pal, far){
  const { B } = api; let y0 = Infinity, y1 = -Infinity;
  for(const q of pts){ if(q[1] < y0) y0 = q[1]; if(q[1] > y1) y1 = q[1]; }
  y0 = Math.floor(y0); y1 = Math.ceil(y1); far = far || 2;
  const n = pts.length; let first = true;
  for(let y = y0; y < y1; y++){
    const yc = y + .5, xs = [];
    for(let i = 0, j = n - 1; i < n; j = i++){ const a = pts[i], b = pts[j]; if((a[1] > yc) !== (b[1] > yc)) xs.push(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
    if(!xs.length) continue;
    xs.sort((p, q) => p - q);
    for(let k = 0; k + 1 < xs.length; k += 2){
      const a = Math.round(xs[k]), b = Math.round(xs[k + 1]); if(b <= a) continue;
      if(first){ B(a, y, b - a, 1, pal.lit); continue; }
      B(a, y, b - a, 1, pal.cloak); B(a, y, 1, 1, pal.lit); if(b - a > 3) B(b - far, y, far, 1, pal.dark);
    }
    first = false;
  }
}
function seg(api, x0, y0, x1, y1, t, col){
  const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for(let i = 0; i <= n; i++){ const f = i / n; api.B(Math.round(x0 + (x1 - x0) * f - t / 2), Math.round(y0 + (y1 - y0) * f - t / 2), t, t, col); }
}
/* A bone: a thick segment, its upper-left rim lit and its lower-right rim dark. */
function boneSeg(api, a, b, r, pal){
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; let nx = -dy / L, ny = dx / L; if(nx + ny > 0){ nx = -nx; ny = -ny; }
  const t = Math.max(1, Math.round(r * 2)); seg(api, a[0], a[1], b[0], b[1], t, pal.cloak);
  if(t >= 3){ const o = r - .5; seg(api, a[0] + nx * o, a[1] + ny * o, b[0] + nx * o, b[1] + ny * o, 1, pal.lit); seg(api, a[0] - nx * o, a[1] - ny * o, b[0] - nx * o, b[1] - ny * o, 1, pal.dark); }
}
function knob(api, x, y, r, pal){
  const { B } = api; r = Math.max(1, Math.round(r));
  for(let dy = -r; dy <= r; dy++){ const w = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy))); if(w <= 0) continue;
    B(x - w, y + dy, w * 2, 1, dy === -r ? pal.lit : pal.cloak); B(x - w, y + dy, 1, 1, pal.lit); B(x + w - 1, y + dy, 1, 1, dy > 0 ? pal.deep : pal.dark); }
}
function chain(api, pts, glint, col, lit){
  const { B } = api; col = col || P1.chain; lit = lit || P1.chainLit; glint = glint || 4;
  const out = [];
  for(let i = 0; i + 1 < pts.length; i++){ const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2)); for(let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
  out.push(pts[pts.length - 1]);
  out.forEach((q, k) => { const x = Math.round(q[0]), y = Math.round(q[1]);
    if(k % 2 === 0){ B(x - 1, y, 2, 1, col); B(x - 1, y, 1, 1, lit); } else { B(x, y - 1, 1, 2, col); B(x, y - 1, 1, 1, lit); }
    if(k % glint === (glint >> 1)){ B(x, y, 1, 1, '#ffffff'); api.glow(x + .5, y + .5, 3, '220,235,255', .3); } });
}
function shackle(api, x, y, w){ const { B } = api; w = w || 3; B(x - (w >> 1), y, w, 3, P1.chain); B(x - (w >> 1), y, w, 1, P1.chainLit); B(x + (w >> 1), y + 1, 1, 1, '#ffffff'); }
function glove(api, x, y, w, h){ const { B } = api; w = w || 3; h = h || 3; B(x, y, w, h, P1.glove); B(x, y, w, 1, P1.gloveLit); B(x + w - 1, y + h - 1, 1, 1, '#1a1520'); }
function sparkle(api, x, y, big){ api.B(x, y, 1, 1, '#ffffff'); api.glow(x + .5, y + .5, big ? 4 : 3, '230,215,255', big ? .45 : .3); if(big){ for(const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) api.B(x + dx, y + dy, 1, 1, '#e8dcff'); } }
function arc(api, cx, cy, r, a0, a1, t, col){ const n = Math.max(6, Math.round(Math.abs(a1 - a0) * r)); for(let i = 0; i <= n; i++){ const a = a0 + (a1 - a0) * i / n; api.B(Math.round(cx + Math.cos(a) * r - t / 2), Math.round(cy + Math.sin(a) * r - t / 2), t, t, col); } }

/* ── The hood: a narrow peak, a rounded crown, shadow for a face and a faded mouth (no eyes, ever) ──────── */
function hood(api, cx, top, pal, opts){
  const { B } = api; opts = opts || {};
  const w = opts.w || 10, h = opts.h || 11, droop = opts.droop || 0, lean = opts.lean || 0;
  const prof = [2, 4, 6, 8, 9]; while(prof.length < h - 1) prof.push(w); prof.push(w - 1);
  prof.forEach((ww, r) => { const x = Math.round(cx - ww / 2 + lean * r / h); B(x, top + r, ww, 1, r === 0 ? pal.lit : pal.cloak); B(x, top + r, 1, 1, pal.lit); B(x + ww - 2, top + r, 2, 1, pal.dark); });
  const ow = w - 4, oh = 5 + droop, oy = top + 4 + droop, ox = Math.round(cx + lean * .5);
  for(let r = 0; r < oh; r++){ const inset = r === 0 ? 2 : (r === 1 || r === oh - 1) ? 1 : 0; B(Math.round(ox - ow / 2 + inset), oy + r, ow - 2 * inset, 1, r < oh - 2 ? pal.hoodIn : '#1a1128'); }
  B(Math.round(ox - ow / 2 + 1), oy - 1, ow - 2, 1, pal.deep);
  const my = oy + oh - 2, ctx = api.ctx;
  ctx.globalAlpha = .45; B(ox - 1, my, 3, 1, pal.mouth); ctx.globalAlpha = .2; B(ox - 2, my - 1, 1, 1, pal.mouth); B(ox + 2, my - 1, 1, 1, pal.mouth); ctx.globalAlpha = 1;
}

/* ═══ I · the Cloaked Man on his feet ═════════════════════════════════════════ */
function hem(X, by, half, n, t){ const out = []; for(let i = 0; i <= n; i++){ const flap = Math.round(Math.sin(t * 6 + i * 1.7)); out.push([X(half - 2 * half * i / n), by - (i % 2 ? 2 + (i % 3) + flap : 0)]); } return out; }
function manOne(api, e, alpha){
  const x = api.WX(e.x), by = api.WY(e.hidden ? 0 : e.y), f = e.face || -1, t = api.time, stt = e.st;
  const X = dx => x + f * dx, ctx = api.ctx;
  if(alpha != null) ctx.globalAlpha = alpha;
  const tell = stt === 'dash-tell' || stt === 'phantom-tell';
  let lean = 0, crouch = 0;
  if(tell){ lean = 3; crouch = 2; } if(stt === 'dash'){ lean = 5; crouch = 1; } if(stt === 'stagger' || stt === 'hop'){ lean = -2; }
  if(stt === 'slash' || stt === 'slash2'){ lean = 3; }
  const walk = e.walking ? Math.round(Math.sin(t * 9)) : 0, top = by - 34 + crouch + walk;
  B0(api, X(-9), by + 1, 18, 1, 'rgba(6,3,14,.35)');
  // Chains: pooled at the feet at rest; trailing behind him when he moves.
  const moving = stt === 'dash' || tell;
  if(!moving && stt !== 'cast' && stt !== 'upslash'){
    chain(api, [[X(-4), top + 21], [X(-7), top + 27], [X(-9), by - 2], [X(-14), by - 1], [X(-19), by - 1]]);
    chain(api, [[X(4), top + 21], [X(6), top + 26], [X(9), by - 2], [X(13), by - 1], [X(18), by - 1]]);
  } else if(moving){
    chain(api, [[X(-6), top + 16], [X(-16), top + 22], [X(-26), by - 3], [X(-34), by - 1]], 5);
  }
  if(stt === 'dash') rows(api, [[X(-4), top + 11], [X(-16), top + 15], [X(-24), top + 21], [X(-15), top + 26], [X(-6), top + 25]], BACK);
  // The robe: slim at the shoulders, a torn hem at the floor.
  rows(api, [[X(-5 + lean), top + 10], [X(5 + lean), top + 10], [X(7 + lean * .4), top + 24]].concat(hem(X, by, 9, 6, t)).concat([[X(-7 + lean * .4), top + 24]]), P1);
  seg(api, X(-2 + lean * .6), top + 12, X(-3), by - 3, 1, P1.sheen);
  // Arms, by pose.
  const sleeve = (a, b) => rows(api, [[a[0] - 1.5, a[1]], [a[0] + 1.5, a[1]], [b[0] + 2, b[1]], [b[0] - 2, b[1]]], P1);
  if(stt === 'cast'){
    sleeve([X(5), top + 12], [X(10), top + 4]); glove(api, X(10) - 1, top + 1); shackle(api, X(10), top + 4);
    const loop = [], spin = t * 7;
    for(let i = 0; i <= 18; i++){ const a = i * .35 + spin; loop.push([X(1) + Math.cos(a) * 11, top - 6 + Math.sin(a) * 7]); }
    chain(api, loop, 5); api.glow(X(1), top - 6, 16, '140,160,230', .18);
    sleeve([X(-5), top + 12], [X(-7), top + 20]); glove(api, X(-9), top + 20);
    const k = Math.min(1, e.t / .7); api.glow(X(10), top + 1, 6 + 8 * k, '200,190,255', .25 + .3 * k);
  } else if(stt === 'upslash'){
    sleeve([X(4), top + 12], [X(6), top + 1]); glove(api, X(6) - 1, top - 2); sleeve([X(-5), top + 12], [X(-6), top + 20]);
    arc(api, X(6), top - 4, 12, -Math.PI * .95, -Math.PI * .05, 2, 'rgba(240,230,255,.85)');
  } else if(tell || stt === 'dash' || stt === 'slash' || stt === 'slash2' || stt === 'appear'){
    const cut = stt === 'slash' || stt === 'slash2';
    sleeve([X(-4 + lean), top + 12], [X(-10), top + 16]); glove(api, X(-12), top + 15);
    if(cut){ sleeve([X(4 + lean), top + 12], [X(14), top + 15]); glove(api, X(14), top + 13); }
    else { sleeve([X(4 + lean), top + 12], [X(8), top + 19]); glove(api, X(7), top + 18); }
    const g = tell ? Math.min(1, e.t / .5) : 1; api.glow(cut ? X(15) : X(8), cut ? top + 14 : top + 19, 5 + 6 * g, '215,200,255', .25 + .35 * g);
    if(cut){ const K2 = K(), reach = (stt === 'slash' ? K2.constants.MAN.dash.reach : K2.constants.MAN.phantom.reach) * api.Z, fade = Math.max(0, 1 - e.t / .26);
      api.ctx.globalAlpha = (alpha == null ? 1 : alpha) * fade;
      const a0 = f > 0 ? -1.2 : Math.PI + 1.2, a1 = f > 0 ? .9 : Math.PI - .9;
      arc(api, X(2), top + 18, reach * .82, a0, a1, 3, '#f1e8ff'); arc(api, X(2), top + 18, reach * .82 - 3, a0, a1, 1, '#b596e6');
      api.ctx.globalAlpha = alpha == null ? 1 : alpha; }
  } else if(stt === 'stagger'){
    sleeve([X(-5), top + 12], [X(-8), top + 19]); sleeve([X(5), top + 12], [X(8), top + 20]); glove(api, X(-10), top + 19); glove(api, X(7), top + 20);
    if(Math.floor(t * 10) % 2) sparkle(api, X(3), top + 2, false);
  } else {
    sleeve([X(-5), top + 12], [X(-2), top + 19]); sleeve([X(5), top + 12], [X(2), top + 19]);
    glove(api, Math.min(X(-3), X(0)), top + 18); glove(api, Math.max(X(-3), X(0)) + 0, top + 18);
    shackle(api, X(-4), top + 17); shackle(api, X(4), top + 17);
  }
  hood(api, X(lean * .8), top, P1, { droop:stt === 'intro' || stt === 'stalk' || stt === 'await' ? 1 : tell ? 2 : 0, lean:f * (tell || stt === 'dash' ? 2 : 0) });
  api.glow(x, top + 10, 16, '120,70,190', .10);
  if(alpha != null) ctx.globalAlpha = 1;
}
function B0(api, x, y, w, h, col){ api.ctx.fillStyle = col; api.ctx.fillRect(Math.round(x), Math.round(y), w, h); }

/* ═══ II · Unbound: aloft, the cloak blown apart ══════════════════════════════ */
/* A bell sleeve from s to e (buffer px), flaring from w0 to w1, its cuff torn into tatters and swept back. */
function bellSleeve(api, s, e, w0, w1, sweep, seed, pal){
  const dx = e[0] - s[0], dy = e[1] - s[1], L = Math.hypot(dx, dy) || 1, d = [dx / L, dy / L], n = [-d[1], d[0]];
  const P = (o, a, b) => [o[0] + n[0] * a + d[0] * b, o[1] + n[1] * a + d[1] * b];
  const pts = [P(s, w0 / 2, 0)], T = 4;
  for(let k = 0; k <= T * 2; k++){ const f = k / (T * 2), a = w1 / 2 - w1 * f, tip = k % 2 ? 2.5 + ((seed * 7 + k * 13) % 5) * .6 : 0; pts.push(P(e, a, tip - sweep * f)); }
  pts.push(P(s, -w0 / 2, 0));
  rows(api, pts, pal);
  const sa = P(s, -w0 * .15, 2), sb = P(e, -w1 * .3, -2); seg(api, sa[0], sa[1], sb[0], sb[1], 1, pal.sheen || pal.lit);
}
function boneHand(api, x, y, ang, L, spread, curl, point){
  const { B } = api;
  for(let i = 0; i < 4; i++){
    const a = ang + (i - 1.5) * spread, ll = L * (point === i ? 1.35 : point != null ? .45 : 1), cc = point === i ? 0 : point != null ? curl * 2.4 : curl;
    const kx = x + Math.cos(a) * 2, ky = y + Math.sin(a) * 2, mx = kx + Math.cos(a) * ll * .5, my = ky + Math.sin(a) * ll * .5, tx = mx + Math.cos(a + cc) * ll * .5, ty = my + Math.sin(a + cc) * ll * .5;
    seg(api, kx, ky, mx, my, 1, BONE.cloak); seg(api, mx, my, tx, ty, 1, BONE.cloak);
    B(Math.round(kx), Math.round(ky), 1, 1, BONE.deep); B(Math.round(mx), Math.round(my), 1, 1, BONE.dark); B(Math.round(tx), Math.round(ty), 1, 1, BONE.lit);
  }
  B(Math.round(x) - 1, Math.round(y) - 1, 3, 3, BONE.cloak); B(Math.round(x) - 1, Math.round(y) - 1, 1, 1, BONE.lit);
}
function wrist(api, e, h){ for(const o of [-.6, .6]) seg(api, e[0], e[1] + o, h[0], h[1] + o, 1, BONE.cloak); }
function hoverShadow(api, x, ground, w){ B0(api, x - w / 2, ground + 1, w, 1, 'rgba(6,3,14,.28)'); api.glow(x, ground - 1, 14, '120,70,200', .14); }
function manTwo(api, e){
  const x = api.WX(e.x), by = api.WY(e.y), f = e.face || -1, t = api.time, stt = e.st, X = dx => x + f * dx, ground = api.WY(0);
  if(stt === 'dizzy' || stt === 'collapse') return manDown(api, e, x, ground, f, t);
  hoverShadow(api, x, ground, 18);
  const top = by - 41;
  if(stt === 'swarm-rise' || stt === 'swarm-tell' || stt === 'swarm') return ascendant(api, e, x, top, f, t);
  if(stt === 'dive-tell' || stt === 'dive') return tempest(api, e, x, top, f, t);
  gale(api, e, x, top, f, t, stt === 'ring-tell');
}
function gale(api, e, cx, top, f, t, ring){
  const X = dx => cx + f * dx;
  api.glow(cx, top + 18, 30, '130,80,220', .10);
  for(const s of [-1, 1]){ const Y = dx => cx + s * dx;
    rows(api, [[Y(3), top + 12], [Y(9), top + 16], [Y(20), top + 25], [Y(26), top + 33], [Y(20), top + 32], [Y(18), top + 38], [Y(13), top + 33], [Y(10), top + 39], [Y(4), top + 30]], BACK); }
  const flap = Math.round(Math.sin(t * 3) * 1.5);
  rows(api, [[cx - 6, top + 10], [cx + 6, top + 10], [cx + 8, top + 24], [cx + 5, top + 28], [cx + 6, top + 37 + flap], [cx + 2, top + 31], [cx, top + 41], [cx - 2, top + 31], [cx - 6, top + 37 - flap], [cx - 5, top + 28], [cx - 8, top + 24]], P2);
  seg(api, cx - 2, top + 12, cx - 3, top + 29, 1, P2.sheen);
  for(const s of [-1, 1]){
    const sh = [cx + s * 5, top + 13], cu = [cx + s * 24, top + 10 + flap * s * .5];
    bellSleeve(api, sh, cu, 5, 14, -3, 3 + s, P2);
    const h = [cx + s * 28, top + 10]; wrist(api, cu, h); boneHand(api, h[0], h[1], s > 0 ? 0 : Math.PI, 7, .38, .2 * s, null);
    const bx = cx + s * 30 - 2, by2 = top + 3 + Math.round(Math.sin(t * 2 + s) * 1.5);
    api.B(bx, by2, 2, 3, P1.chain); api.B(bx + 3, by2, 2, 3, P1.chain); api.B(bx, by2, 2, 1, P1.chainLit); api.B(bx + 3, by2, 2, 1, P1.chainLit);
  }
  hood(api, cx, top, P2, { w:12 });
  for(const [dx, dy, big] of [[-5, 8, 0], [-16, 11, 0], [13, 13, 0], [-2, 22, 1], [18, 27, 0]]) if(Math.floor(t * 2 + dx) % 3) sparkle(api, cx + dx, top + dy, !!big);
  if(ring){ const k = Math.min(1, e.t / .7); for(let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2 + t * 3; const px = cx + Math.cos(a) * 20, py = top + 22 + Math.sin(a) * 14;
    api.B(Math.round(px) - 1, Math.round(py), 3, 2, P1.chain); api.B(Math.round(px) - 1, Math.round(py), 1, 1, P1.chainLit); api.glow(px, py, 4, '220,235,255', .2 + .4 * k); } }
}
function ascendant(api, e, cx, top, f, t){
  api.glow(cx, top - 8, 12, '190,150,255', .5); api.glow(cx, top - 8, 5, '255,240,255', .6);
  for(const s of [-1, 1]){ const Y = dx => cx + s * dx;
    rows(api, [[Y(2), top + 22], [Y(8), top + 25], [Y(19), top + 31], [Y(22), top + 37], [Y(15), top + 35], [Y(12), top + 41], [Y(7), top + 35], [Y(4), top + 44], [Y(1), top + 34]], BACK); }
  rows(api, [[cx - 6, top + 10], [cx + 6, top + 10], [cx + 7, top + 26], [cx + 3, top + 34], [cx, top + 45], [cx - 3, top + 34], [cx - 7, top + 26]], P2);
  seg(api, cx - 2, top + 12, cx - 3, top + 32, 1, P2.sheen);
  for(const s of [-1, 1]){ const Y = dx => cx + s * dx, sw = Math.round(Math.sin(t * 5 + s) * 1.5);
    rows(api, [[Y(5), top + 12], [Y(15), top - 3], [Y(19), top - 2], [Y(21), top + 6], [Y(26 + sw), top + 14], [Y(23), top + 15], [Y(25 + sw), top + 21], [Y(20), top + 19], [Y(19), top + 25], [Y(15), top + 20], [Y(11), top + 23], [Y(7), top + 17]], P2);
    seg(api, Y(8), top + 11, Y(17), top, 1, P2.sheen);
    wrist(api, [Y(17), top - 4], [Y(19), top - 8]); boneHand(api, Y(19), top - 8, -Math.PI / 2 + s * .45, 8, .36, -.25 * s, null);
  }
  hood(api, cx, top, P2, { w:12 });
  for(let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2 + t * 1.5; const px = cx + Math.cos(a) * 24, py = top + 22 + Math.sin(a) * 7; api.B(Math.round(px) - 2, Math.round(py), 4, 1, P1.chain); api.B(Math.round(px) - 2, Math.round(py), 1, 1, P1.chainLit); }
}
function tempest(api, e, cx, top, f, t){
  const X = dx => cx + f * dx;
  chain(api, [[X(-16), top + 17], [X(-8), top + 24], [X(4), top + 22], [X(16), top + 27], [X(28), top + 23], [X(38), top + 28]], 5);
  for(const pts of [[[2, 18], [18, 16], [33, 19], [42, 16], [34, 22], [20, 24], [4, 26]], [[2, 24], [16, 28], [30, 34], [38, 33], [28, 38], [14, 35], [0, 31]]])
    rows(api, pts.map(q => [X(q[0]), top + q[1]]), BACK);
  bellSleeve(api, [X(3), top + 13], [X(22), top + 7], 5, 11, 4, 11, Object.assign({}, BACK, { sheen:P2.lit }));
  wrist(api, [X(22), top + 7], [X(25), top + 6]); boneHand(api, X(25), top + 6, f > 0 ? -.15 : Math.PI + .15, 7, .28, .5 * f, null);
  rows(api, [[-7, 10], [4, 9], [10, 20], [26, 27], [34, 26], [24, 31], [12, 31], [16, 37], [4, 33], [-3, 27]].map(q => [X(q[0]), top + q[1]]), P2);
  seg(api, X(-4), top + 13, X(26), top + 27, 1, P2.sheen);
  hood(api, X(-3), top, P2, { w:12, droop:1 });
  bellSleeve(api, [X(-5), top + 14], [X(-16), top + 16], 5, 11, -4, 7, P2);
  wrist(api, [X(-16), top + 16], [X(-20), top + 16]);
  boneHand(api, X(-21), top + 16, f > 0 ? Math.PI : 0, 8, .3, 0, 1);
  api.glow(X(-31), top + 15, 5, '190,140,255', .6); api.B(X(-31), top + 15, 1, 1, '#ffffff');
}
function manDown(api, e, x, ground, f, t){
  const X = dx => x + f * dx, sink = e.st === 'collapse' ? Math.min(1, e.t / 1.4) : 0;
  B0(api, x - 16, ground + 1, 32, 1, 'rgba(6,3,14,.35)');
  rows(api, [[X(-18), ground], [X(-10), ground - 6], [X(-4), ground - 14 + Math.round(sink * 8)], [X(5), ground - 14 + Math.round(sink * 8)], [X(11), ground - 6], [X(19), ground]], P2);
  if(sink < .9) hood(api, X(0), ground - 24 + Math.round(sink * 16), P2, { w:12, droop:2 });
  if(e.st === 'dizzy'){
    for(const s of [-1, 1]){ rows(api, [[X(s * 6), ground - 8], [X(s * 18), ground - 3], [X(s * 24), ground], [X(s * 8), ground]], P2); boneHand(api, X(s * 26), ground - 1, s * f > 0 ? 0 : Math.PI, 6, .3, .4, null); }
    for(let i = 0; i < 3; i++){ const a = t * 4 + i * 2.1; sparkle(api, Math.round(x + Math.cos(a) * 9), Math.round(ground - 28 + Math.sin(a) * 3), false); }
  } else { for(let i = 0; i < 6; i++) api.B(X(-12 + i * 5), ground - 2, 3, 2, BONE.cloak); }
}

/* ── The bat: black, white-crested wings ──────────────────────────────────── */
function bat(api, x, y, face, t, s, glow){
  const { B } = api; s = s || 1; const up = Math.floor(t * 12) % 2 === 0;
  const W = Math.round(9 * s), Hh = Math.round(4 * s), body = { cloak:'#1b1426', lit:'#3a2d4c', dark:'#0d0912' };
  if(glow !== false) api.glow(x, y, Math.round(10 * s), '150,110,230', .28);
  for(const side of [-1, 1]){
    const pts = up ? [[x + side * 2, y - 1], [x + side * (W - 3), y - Hh - 2], [x + side * W, y - 1], [x + side * (W - 2), y + 2], [x + side * (W - 5), y + 1], [x + side * 2, y + 2]]
                   : [[x + side * 2, y], [x + side * (W - 3), y + 1], [x + side * W, y + Hh + 2], [x + side * (W - 4), y + 3], [x + side * 2, y + 2]];
    rows(api, pts, body, 1);
    const t2 = s > 1.2 ? 2 : 1;                                               // the white crest along each wing's leading edge
    seg(api, pts[0][0], pts[0][1], pts[1][0], pts[1][1], t2, C.white); seg(api, pts[1][0], pts[1][1], pts[2][0], pts[2][1], 1, '#d9d2ea');
  }
  const bw = Math.max(3, Math.round(4 * s)), bh = Math.max(4, Math.round(5 * s));
  B(x - (bw >> 1), y - 2, bw, bh, '#120d18'); B(x - (bw >> 1), y - 2, 1, bh, '#3a2d4c');
  B(x - (bw >> 1), y - 3, 1, 1, '#120d18'); B(x + (bw >> 1) - 1, y - 3, 1, 1, '#120d18');                        // ears
  B(x + (face > 0 ? 0 : -1), y - 1, 1, 1, '#ffffff'); if(s > 1.2) B(x + (face > 0 ? -2 : 1), y - 1, 1, 1, '#ffffff');
}

/* ═══ III · the Bones ═════════════════════════════════════════════════════════ */
/* A small raster for sprites drawn once and cached: masks, the shaded fill, the oil-slick shine. */
function hexRGB(h){ const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function Ras(w, h){ this.w = w; this.h = h; this.px = new Float32Array(w * h * 4); }
Ras.prototype.mask = function(test){ const m = new Uint8Array(this.w * this.h); for(let y = 0; y < this.h; y++) for(let x = 0; x < this.w; x++) if(test(x + .5, y + .5)) m[y * this.w + x] = 1; return m; };
Ras.prototype.ell = function(cx, cy, rx, ry){ return this.mask((x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1); };
Ras.prototype.poly = function(pts){ return this.mask((x, y) => { let c = false; for(let i = 0, j = pts.length - 1; i < pts.length; j = i++){ const a = pts[i], b = pts[j]; if((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }); };
Ras.prototype.fill = function(m, col, a){ const c = hexRGB(col), P = this.px; a = a == null ? 1 : a;
  for(let i = 0; i < m.length; i++) if(m[i]){ const k = i * 4; if(P[k + 3] === 0){ P[k] = c[0]; P[k + 1] = c[1]; P[k + 2] = c[2]; P[k + 3] = a; } else { P[k] += (c[0] - P[k]) * a; P[k + 1] += (c[1] - P[k + 1]) * a; P[k + 2] += (c[2] - P[k + 2]) * a; P[k + 3] = Math.max(P[k + 3], a); } } };
Ras.prototype.shade = function(m, pal, far){
  const w = this.w, h = this.h, at = (x, y) => x >= 0 && y >= 0 && x < w && y < h && m[y * w + x];
  this.fill(m, pal.cloak);
  const dk = new Uint8Array(m.length), lt = new Uint8Array(m.length), dp = new Uint8Array(m.length);
  for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){ const i = y * w + x; if(!m[i]) continue;
    for(let k = 1; k <= far; k++) if(!at(x + k, y) || !at(x, y + k)) dk[i] = 1;
    if(!at(x, y + 1)) dp[i] = 1; if(!at(x, y - 1) || !at(x - 1, y)) lt[i] = 1; }
  this.fill(dk, pal.dark); this.fill(dp, pal.deep); this.fill(lt, pal.lit);
};
Ras.prototype.canvas = function(){
  const cv = document.createElement('canvas'); cv.width = this.w; cv.height = this.h;
  const g = cv.getContext('2d'), img = g.createImageData(this.w, this.h), P = this.px;
  for(let i = 0; i < P.length; i += 4){ img.data[i] = P[i]; img.data[i + 1] = P[i + 1]; img.data[i + 2] = P[i + 2]; img.data[i + 3] = Math.round(P[i + 3] * 255); }
  g.putImageData(img, 0, 0); return cv;
};
function and(a, b){ const m = new Uint8Array(a.length); for(let i = 0; i < a.length; i++) m[i] = a[i] && b[i] ? 1 : 0; return m; }
function or(a, b){ const m = new Uint8Array(a.length); for(let i = 0; i < a.length; i++) m[i] = a[i] || b[i] ? 1 : 0; return m; }
function not(a){ const m = new Uint8Array(a.length); for(let i = 0; i < a.length; i++) m[i] = a[i] ? 0 : 1; return m; }

/* The skull, once per size: cranium, face, blank eyes, the nose, the upper teeth, a violet crack and the odd shine. The
   jaw is drawn live (it opens). Returns the canvas and the skull's centre in it. */
const cache = {};
function skullSprite(R, pal, key){
  const k = 'skull' + key + R; if(cache[k]) return cache[k];
  const u = Math.max(1, R / 21), U = n => Math.max(1, Math.round(n * u));
  const w = Math.ceil(R * 2 + 8), h = Math.ceil(R * 1.95 + 8), sx = w / 2, sy = R * .86 + 4;
  const r = new Ras(w, h);
  const cran = r.ell(sx, sy, R, R * .86), face = r.poly([[sx - R * .84, sy + R * .2], [sx + R * .84, sy + R * .2], [sx + R * .62, sy + R * .98], [sx - R * .62, sy + R * .98]]);
  const head = or(cran, face);
  r.shade(head, pal, U(2));
  r.fill(and(head, not(r.ell(sx - R * .22, sy - R * .12, R * 1.02, R * 1.05))), pal.dark, .55);
  r.fill(and(head, not(r.ell(sx - R * .36, sy - R * .2, R * 1.12, R * 1.2))), pal.deep, .45);
  r.fill(and(head, r.mask((x, y) => y > sy + R * .72 && Math.abs(x - sx) > R * .5)), pal.dark, .5);
  for(const [r0, r1, a0, a1, al] of [[.68, .76, -2.7, -.4, .7], [.5, .54, -2.4, -1.1, .35]]){
    const cx = sx - R * .08, cy = sy + R * .08;
    for(let i = 0; i < SHINE.length; i++) r.fill(and(cran, r.mask((x, y) => { const d = Math.hypot(x - cx, y - cy), a = Math.atan2(y - cy, x - cx);
      return d >= R * r0 && d < R * r1 && a > a0 && a < a1 && Math.floor((a - a0) / (a1 - a0) * SHINE.length * 1.5) % SHINE.length === i; })), SHINE[i], al);
  }
  const gl = Math.min(3, U(2));                                                            // a glint, not a tile, at any size
  r.fill(r.mask((x, y) => x >= sx - R * .5 && x < sx - R * .5 + gl && y >= sy - R * .55 && y < sy - R * .55 + gl), '#ffffff');
  const crack = [[sx + R * .15, sy - R * .86], [sx + R * .05, sy - R * .6], [sx + R * .22, sy - R * .45], [sx + R * .12, sy - R * .22]];
  const cw = U(1) / 2 + .1;
  r.fill(and(head, r.mask((x, y) => { for(let i = 0; i + 1 < crack.length; i++){ const a = crack[i], b = crack[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
    const tt = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L)); if(Math.hypot(x - a[0] - tt * dx, y - a[1] - tt * dy) <= cw) return true; } return false; })), '#3a1d5c');
  for(const s of [-1, 1]){
    const ex = sx + s * R * .38, ey = sy + R * .2;
    r.fill(and(head, r.ell(ex, ey - R * .2, R * .34, R * .08)), pal.dark, .7);
    r.fill(r.ell(ex, ey, R * .29, R * .25), VOID);
    r.fill(r.ell(ex, ey + .5, R * .17, R * .14), '#efe6ff');
    r.fill(r.ell(ex - R * .05, ey - R * .03, R * .07, R * .06), '#ffffff');
  }
  r.fill(r.poly([[sx, sy + R * .44], [sx - R * .13, sy + R * .72], [sx, sy + R * .66], [sx + R * .13, sy + R * .72]]), VOID);
  const ty = sy + R * .98;
  for(let x = sx - R * .56; x < sx + R * .56; x += 2.6 * u){
    r.fill(r.mask((px, py) => px >= x && px < x + U(2) && py >= ty - 2 * u && py < ty - 2 * u + U(2)), pal.cloak);
    r.fill(r.mask((px, py) => px >= x && px < x + U(2) && py >= ty - 2 * u && py < ty - 2 * u + U(.5)), pal.lit);
  }
  return (cache[k] = { cv:r.canvas(), ox:sx, oy:sy, R, u });
}
/* The jaw, live. Shut: the mandible under the teeth. Open: two long rami down to `chinY`, teeth along them, the mouth
   dark with a violet light in it. (X, Y) is the skull's centre in the buffer; everything in buffer pixels. */
function jaw(api, X, Y, R, chinY, pal, open){
  const { B } = api, u = Math.max(1, R / 21), ty = Y + R * .98;
  if(!open || chinY <= ty + R * .5){
    rows(api, [[X - R * .64, ty - u], [X + R * .64, ty - u], [X + R * .52, ty + R * .3], [X + R * .22, ty + R * .44], [X - R * .22, ty + R * .44], [X - R * .52, ty + R * .3]], pal, Math.max(1, Math.round(2 * u)));
    for(let x = X - R * .5; x < X + R * .5; x += 2.4 * u) B(Math.round(x), Math.round(ty), Math.max(1, Math.round(u)), Math.max(1, Math.round(u)), VOID);
    return;
  }
  const hw = R * .66, cw = R * .34, cy = chinY, top = Y + R * .5;
  const mouth = [[X - hw + 3 * u, ty], [X + hw - 3 * u, ty], [X + cw - 2 * u, cy - 3 * u], [X - cw + 2 * u, cy - 3 * u]];
  rows(api, mouth, { cloak:VOID, lit:VOID, dark:VOID });
  api.glow(X, ty + (cy - ty) * .5, (cy - ty) * .5, '150,80,255', .45);
  rows(api, [[X - hw - u, top], [X - hw + 3 * u, top], [X - hw + 3 * u, ty], [X - cw + 2 * u, cy - 3 * u], [X - cw + u, cy + 4 * u], [X - cw - 3 * u, cy]], pal, Math.max(1, Math.round(2 * u)));
  rows(api, [[X + hw - 3 * u, top], [X + hw + u, top], [X + cw + 3 * u, cy], [X + cw - u, cy + 4 * u], [X + cw - 2 * u, cy - 3 * u], [X + hw - 3 * u, ty]], pal, Math.max(1, Math.round(2 * u)));
  rows(api, [[X - cw + 2 * u, cy - 3 * u], [X + cw - 2 * u, cy - 3 * u], [X + cw - u, cy + 4 * u], [X - cw + u, cy + 4 * u]], pal, Math.max(1, Math.round(2 * u)));
  const tw = Math.max(1, Math.round(2 * u));
  for(let y = ty + 5 * u; y < cy - 3 * u; y += 3 * u){ const f = (y - ty) / (cy - ty), x0 = X - (hw - 3 * u) + (hw - cw - u) * f, x1 = X + (hw - 3 * u) - (hw - cw - u) * f;
    B(Math.round(x0), Math.round(y), tw, Math.max(1, Math.round(u)), pal.cloak); B(Math.round(x1 - tw), Math.round(y), tw, Math.max(1, Math.round(u)), pal.cloak); }
  for(let x = X - cw + 2 * u; x < X + cw - 2 * u; x += 2.5 * u){ B(Math.round(x), Math.round(cy - 5 * u), tw, Math.max(1, Math.round(3 * u)), pal.cloak); B(Math.round(x), Math.round(cy - 5 * u), tw, 1, pal.lit); }
}
function drawSkull(api, X, Y, R, pal, key, jawChinY, open, eyes, noGlow){
  jaw(api, X, Y, R, jawChinY, pal, open);
  const S = skullSprite(R, pal, key);
  api.ctx.drawImage(S.cv, Math.round(X - S.ox), Math.round(Y - S.oy));
  if(!noGlow) skullGlow(api, X, Y, R, eyes, S);
}
function skullGlow(api, X, Y, R, eyes, S){
  S = S || { u:Math.max(1, R / 21) };
  const flare = eyes || 0;
  for(const s of [-1, 1]){ const ex = X + s * R * .38, ey = Y + R * .2;
    api.glow(ex, ey, R * .45, '170,120,255', .3 + .5 * flare);
    if(flare > .05){ api.ctx.globalAlpha = Math.min(1, flare); api.ctx.fillStyle = '#ffffff'; api.ctx.beginPath(); api.ctx.ellipse(ex, ey + .5, R * .19, R * .16, 0, 0, Math.PI * 2); api.ctx.fill(); api.ctx.globalAlpha = 1; api.glow(ex, ey, R * .3, '255,255,255', .4 * flare); } }
  api.glow(X + R * .15, Y - R * .5, 6 * S.u, '140,80,255', .25);
}

/* Legs that end in hands: long fingers arched like a spider's, each set down on its tip. */
function planted(api, x, y, out, floor, L, pal){
  for(const [reach, lift] of [[-.38, 3], [.42, 4], [.72, 6], [1.0, 5]]){
    const sg = reach > 0 ? 1 : -1, tx = x + out * L * reach, ax = x + out * L * reach * .45, ay = y - lift;
    const pts = [[x + out * sg, y], [ax, ay], [tx - out * 1.5 * sg, ay + 1.5], [tx, floor - 1]];
    for(let i = 0; i + 1 < pts.length; i++) seg(api, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 1, pal.cloak);
    api.B(Math.round(ax), Math.round(ay), 1, 1, pal.lit); api.B(Math.round(pts[2][0]), Math.round(pts[2][1]), 1, 1, pal.deep);
  }
  knob(api, Math.round(x), Math.round(y), 2, pal);
}
function openHand(api, x, y, a, L, pal){
  for(let i = 0; i < 4; i++){ const fa = a + (i - 1.5) * .2; let px = x + Math.cos(fa) * 2, py = y + Math.sin(fa) * 2;
    for(const [l, c] of [[.42, 0], [.34, .1], [.24, .1]]){ const na = fa + c * (i - 1.5); const nx = px + Math.cos(na) * L * l, ny = py + Math.sin(na) * L * l; seg(api, px, py, nx, ny, 1, pal.cloak); api.B(Math.round(nx), Math.round(ny), 1, 1, pal.deep); px = nx; py = ny; }
    api.B(Math.round(px), Math.round(py), 1, 1, pal.lit); }
  knob(api, Math.round(x), Math.round(y), 2, pal);
}
function leg(api, pts, r, pal){
  for(let i = 0; i + 1 < pts.length; i++) boneSeg(api, pts[i], pts[i + 1], r * Math.max(.6, 1 - .18 * i), pal);
  for(let i = 1; i < pts.length - 1; i++) knob(api, Math.round(pts[i][0]), Math.round(pts[i][1]), r * Math.max(.6, 1 - .18 * i) + .9, pal);
}
function cage(api, cx, cy, rx, ry, pal){
  const ctx = api.ctx; ctx.globalAlpha = .8; ctx.fillStyle = '#150b22'; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  api.glow(cx, cy + 2, rx * .8, '140,70,230', .35); api.glow(cx, cy + 2, 4, '230,200,255', .6);
  for(let i = 0; i < 6; i++){ const f = -.8 + 1.6 * i / 5, x = cx + rx * f, h = ry * Math.sqrt(1 - f * f);
    const a = [x + rx * .12 * (1 - Math.abs(f)), cy - h], m = [x - rx * .15, cy], b = [x + rx * .05, cy + h * .9];
    boneSeg(api, a, m, 1.2, pal); boneSeg(api, m, b, 1, pal); }
}
function spine(api, pts, pal, r){
  const out = [];
  for(let i = 0; i + 1 < pts.length; i++){ const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3.2)); for(let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
  out.forEach((q, i) => { const rr = r * (1 - .5 * i / out.length); knob(api, Math.round(q[0]), Math.round(q[1]), rr, pal); api.B(Math.round(q[0]), Math.round(q[1] - rr - 1), 1, 1, pal.dark); });
}
/* The spider, whole: far legs, cage and rag, spine, near legs, the skull. Positions from the fight's state. */
function spider(api, S, A){
  const Z = api.Z, K2 = K(), BN = K2.constants.BONES, f = S.face || -1, t = api.time;
  const sk = K2.skullAt(S), SX = api.WX(sk.x), SY = api.WY(sk.y), R = Math.round(BN.R * Z), floor = api.WY(0);
  const bodyX = api.WX(S.x - f * 100), bodyY = api.WY(Math.max(30, S.sy + 40)), coil = S.coil || 0;
  const X = dx => bodyX + f * dx;
  // Feet: planted round the body; they step as the body travels (stride), and are drawn in when it coils.
  const gait = (S.stride || 0) * Z / 60;
  const feet = [-150, -90, -30, 40, 110, 170].map((o, i) => { const ph = (gait + i * .5) % 1, lift = ph < .25 ? Math.sin(ph / .25 * Math.PI) * 6 : 0;
    return [X(o * (1 - .45 * coil)) + f * (ph < .25 ? ph * 20 : 5 - (ph - .25) * 6), floor - lift]; });
  const hip = i => [X(-26 + i * 10), bodyY + 6];
  const knee = (i, hx, fx) => { const out = fx[0] - hx[0], up = 58 + (i % 3) * 8; const w = coil;
    return [hx[0] + out * .45 * (1 - w) + (bodyX - hx[0]) * w * .8 - f * w * (i % 2 ? 26 : -26), Math.min(hx[1], fx[1]) - up * (1 - .35 * w) - w * 10]; };
  const lunge = S.st === 'lunge', stuck = S.st === 'stuck';
  B0(api, Math.min(feet[0][0], feet[5][0]) - 6, floor + 1, Math.abs(feet[5][0] - feet[0][0]) + 12, 2, 'rgba(6,3,14,.35)');
  // Far legs.
  for(const i of [0, 2, 4]){ const hx = hip(i); let fx = feet[i]; if(lunge) fx = [X(-190 - i * 16), floor - 20 - i * 6];
    const kn = knee(i, hx, fx); leg(api, [hx, kn, fx], 2.1, FAR); if(lunge) openHand(api, fx[0], fx[1], f > 0 ? Math.PI : 0, 13, FAR); else planted(api, fx[0], fx[1], fx[0] < hx[0] ? -1 : 1, floor, 13, FAR); }
  cage(api, X(0), bodyY, 26, 17, BONE);
  rows(api, [[-20, -18], [4, -22], [26, -14], [32, 0], [26, 4], [28, 14], [20, 8], [16, 18], [10, 8], [4, 16], [0, 4], [-8, 6], [-16, -4]].map(q => [X(q[0]), bodyY + q[1]]), P1);
  const back = [X(-44), bodyY + 10];
  spine(api, [[SX - f * R * .7, SY - R * .3], [X(24), bodyY - 16], [X(4), bodyY - 22], [X(-18), bodyY - 20], [X(-38), bodyY - 10], back, [X(-46), bodyY + 20]], BONE, 2.2);
  chain(api, [[X(-40), bodyY + 2], [X(-48), bodyY + 14], [X(-50), bodyY + 28], [X(-47), bodyY + 40]], 4);
  // Near legs.
  for(const i of [1, 3, 5]){ const hx = hip(i); let fx = feet[i];
    if(lunge) fx = [X(-170 - i * 18), floor - 10 - i * 4];
    const kn = knee(i, hx, fx); leg(api, [hx, kn, fx], 2.4, BONE); if(lunge) openHand(api, fx[0], fx[1], f > 0 ? Math.PI : 0, 14, BONE); else planted(api, fx[0], fx[1], fx[0] < hx[0] ? -1 : 1, floor, 15, BONE); }
  // The front arms: reaching in the lunge, dug into the floor when stuck, raised for the stabs.
  const shoulder = [SX - f * R * .2, SY + R * .2];
  if(lunge){ for(const dy of [-26, 14]) { const el = [SX + f * R * .6, SY + dy - 10], hd = [SX + f * (R + 26), SY + dy]; leg(api, [shoulder, el, hd], 2.3, BONE); openHand(api, hd[0], hd[1], f > 0 ? 0 : Math.PI, 19, BONE); } }
  else if(stuck){ for(const dx of [-10, 18]){ const el = [SX + f * (R * .5 + dx), SY - R - 10], hd = [SX + f * (R + 12 + dx), floor - 4]; leg(api, [shoulder, el, hd], 2.3, BONE); planted(api, hd[0], hd[1], f, floor, 14, BONE); } }
  else if(S.st === 'stab-raise' || S.st === 'stab'){ const el = [SX + f * R * .8, SY - R * 1.6], hd = [SX + f * R * .5, SY - R * 2.3]; leg(api, [shoulder, el, hd], 2.3, BONE); openHand(api, hd[0], hd[1], -Math.PI / 2, 17, BONE); }
  // The skull.
  const chin = api.WY(K2.jawChin(S)), open = (S.jaw || 0) > .02;
  const flare = S.st === 'lunge-tell' ? Math.min(1, S.t / .95) : S.st === 'rear' || S.st === 'drop' ? .6 : S.st === 'inhale' ? .8 : 0;
  drawSkull(api, SX, SY, R, BONE, 'bone', chin, open, flare);
  if(coil > .05) for(let i = 0; i < 4; i++){ const a = t * 9 + i * 1.6; api.B(Math.round(bodyX + Math.cos(a) * 30), Math.round(bodyY + Math.sin(a) * 18), 2, 1, '#b99cff'); }
}

/* ═══ IV · all of him ═══════════════════════════════════════════════════════ */
function giant(api, A){
  const Gi = A.giant, K2 = K(), GC = K2.constants.GIANT, Z = api.Z; if(!Gi) return;
  const rise = Gi.rise == null ? 1 : Gi.rise, R = Math.round(GC.R * Z);
  const X = api.WX(GC.SX), Y = api.WY(GC.SY - (1 - rise) * (GC.R + 340));
  // The far legs, caging the sky.
  for(const [hx, hy, kx, ky, fx, fy] of [[-60, 10, -300, -260, -520, 120], [-30, -20, -170, -330, -330, 180], [30, -20, 170, -330, 330, 180], [60, 10, 300, -260, 520, 120]]){
    const h = [X + hx, Y + hy], k = [X + kx, Y + ky + (1 - rise) * 200], fo = [X + fx, Y + fy + 100];
    leg(api, [h, k, fo], 5.5, DIST);
  }
  const ctx = api.ctx; ctx.globalAlpha = .9; ctx.fillStyle = '#150b22'; ctx.beginPath(); ctx.ellipse(X, Y - R * .9, R * .9, R * .5, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  const flare = Math.max(Gi.flare || 0, Gi.exposed > 0 ? 1 : 0);
  drawSkull(api, X, Y, R, GIANT, 'giant', 0, false, flare, true);
  // A step back into the dusk (the concept's Horizon): a veil over all of him, thickest low down; the eyes burn through it.
  ctx.fillStyle = 'rgba(16,10,28,.30)'; ctx.fillRect(0, 0, api.bw, api.groundBy);
  const hz = ctx.createLinearGradient(0, api.groundBy - 160, 0, api.groundBy); hz.addColorStop(0, 'rgba(74,28,42,0)'); hz.addColorStop(1, 'rgba(74,28,42,.35)');
  ctx.fillStyle = hz; ctx.fillRect(0, api.groundBy - 160, api.bw, 160);
  skullGlow(api, X, Y, R, flare);
  if(Gi.exposed > 0){ for(const s of [-1, 1]){ const ex = X + s * R * .38, ey = Y + R * .2, pulse = .5 + .5 * Math.sin(api.time * 10);
    api.ctx.strokeStyle = `rgba(255,240,200,${.5 + .4 * pulse})`; api.ctx.lineWidth = 2; api.ctx.beginPath(); api.ctx.ellipse(ex, ey, R * .3 + 3, R * .26 + 3, 0, 0, Math.PI * 2); api.ctx.stroke(); } }
  if(Gi.crack > 0){ const k = Gi.crack; for(let i = 0; i < 3; i++){ const w = 2 + k * 10 - i * 3; if(w > 0) api.glow(X + R * .15, Y - R * .5, R * .2 * k + 20, '220,190,255', .3 * k); }
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1 + k * 4; ctx.beginPath(); ctx.moveTo(X + R * .15, Y - R * .86); ctx.lineTo(X + R * .05, Y - R * .6); ctx.lineTo(X + R * .22, Y - R * .45); ctx.lineTo(X + R * .12, Y - R * .22); ctx.lineTo(X + R * .2, Y + R * .1); ctx.stroke(); }
}
function giantHands(api, A){
  const Gi = A.giant; if(!Gi) return;
  const floor = api.WY(0), rise = Gi.rise == null ? 1 : Gi.rise, D = K().constants.GIANT.drag;
  for(const h of Gi.hands){
    const x = api.WX(h.x), lift = (h.lift || 0) * 40, s = h.side, sink = (1 - rise) * 120;
    const wrist = [x - s * 8, floor - 4 - lift + sink], arm = [x - s * 16, floor + 6 + sink];      // up out of the floor's edge
    for(const o of [-2.5, 2.5]) boneSeg(api, [arm[0] + o, arm[1]], [wrist[0] + o, wrist[1]], 3.4, GIANT);
    knob(api, Math.round(wrist[0]), Math.round(wrist[1]), 4, GIANT);
    const rest = h.st === 'rest', dir = h.st === 'sweep' ? -s : h.st === 'return' ? s : s;
    for(let i = 0; i < 4; i++){ const reach = 16 + 9 * i;
      const pts = [[wrist[0] + dir * 2, wrist[1] - 3 - i * .5], [wrist[0] + dir * reach * .35, wrist[1] - 16 - i * 2 - lift * .3], [wrist[0] + dir * reach * .75, wrist[1] - 10 - i], [wrist[0] + dir * reach, floor - 1 - lift * .5]];
      for(let j = 0; j + 1 < pts.length; j++) boneSeg(api, pts[j], pts[j + 1], 1.6 - j * .2, rest ? BONE : GIANT);
      for(let j = 1; j < pts.length - 1; j++) knob(api, Math.round(pts[j][0]), Math.round(pts[j][1]), 1.8, rest ? BONE : GIANT); }
    if(rest){ api.glow(x, floor - 12, 26, '255,240,200', .18 + .1 * Math.sin(api.time * 10)); }
    if(h.st === 'lift'){ const k = Math.min(1, h.t / D.lift); api.B(Math.min(x, api.WX(s < 0 ? K().constants.ARENA.x2 - 150 : K().constants.ARENA.x1 + 150)), floor - 1, Math.abs(api.WX(s < 0 ? K().constants.ARENA.x2 - 150 : K().constants.ARENA.x1 + 150) - x), 1, `rgba(255,120,120,${.3 + .5 * k})`); }
  }
}

/* ── Backdrop, floors, objects ─────────────────────────────────────────────── */
function backdrop(api){
  FA.sky(api, C.sky, 'cm');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  FA.bands(api, [[.12, C.hill0, 46, .004, 'hills'], [.25, C.hill1, 30, .007, 'hills']], horizon);
  const A = st(api);
  if(A && A.giant) giant(api, A);
  FA.ash(api, 'rgba(200,190,220,.12)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'cmStone':
      B(s.x0, s.y, s.w, s.floor - s.y, C.stoneDark); B(s.x0, s.y, s.w, 3, C.stone); B(s.x0, s.y, s.w, 1, C.stoneLit);
      for(let x = s.x0 - ((s.x0 + base) % 23); x < s.x1; x += 23) if(x >= s.x0) B(x, s.y + 4, 1, 5, C.line);
      FA.seams(api, s, base, C.violet);
      return true;
    case 'cmLedge': case 'cmSlab':
      B(s.x0, s.y, s.w, Math.max(5, s.floor - s.y), C.stoneDark); B(s.x0, s.y, s.w, 3, C.stone); B(s.x0, s.y, s.w, 1, C.stoneLit);
      for(let i = 0; i < s.w; i += 3) B(s.x0 + i, s.floor, 2, 1 + ((i * 7) % 3), C.stoneDark);
      if(o.actArt === 'cmSlab') B(s.x0 + Math.round(s.w * .6), s.y + 2, 1, 1, C.violet);
      return true;
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api;
  if(o.type === 'wall' && o.actArt){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = Math.max(-4, WY(o.y)), bot = Math.min(api.bh + 4, WY(o.y - o.h)), w = x1 - x0;
    if(o.actArt === 'cmBars'){ const lift = o.gone ? Math.round((bot - top) * .94) : 0; for(let x = x0 + 2; x < x1 - 1; x += 6) B(x, top, 3, bot - top - lift, C.iron); B(x0 - 3, top, w + 6, 3, C.ironLit); return true; }
    if(o.actArt === 'cmWall'){ B(x0, top, w, bot - top, C.stoneDark); B(x0, top, w, 3, C.stone); B(x0, top, w, 1, C.stoneLit); B(x0, top, 1, bot - top, C.stone); for(let y = top + 10; y < bot; y += 14) B(x0 + 2, y, w - 4, 1, C.line); return true; }
    return false;
  }
  if(o.type === 'actRing'){ if(SH().drawRing){ SH().drawRing(api, o); return true; } return false; }
  if(o.type === 'actFire'){ const x = WX(o.x), y = WY(o.y); B(x - 12, y - 3, 24, 3, C.stone); for(let i = 0; i < 3; i++) B(x - 6 + i * 5, y - 7 - (Math.floor(api.time * 6 + i) % 2), 3, 4, i % 2 ? '#c9a8ff' : '#8a5cd8'); api.glow(x, y - 8, 16, '160,110,255', .25); return true; }
  return false;
}

/* ── The world layer: tells, hazards, the swarm, the giant's hands ─────────── */
function world(api){
  const A = st(api); if(!A) return;
  const { B, WX, WY } = api, K2 = K(), c = K2.constants, floor = WY(0), t = api.time;
  if(A.giant) giantHands(api, A);
  const m = A.man;
  if(m && A.phase === 0 && !A.trans){
    if(m.st === 'dash-tell'){ const k = Math.min(1, m.t / c.MAN.dash.tell), x0 = WX(m.x), x1 = WX(m.tx); B(Math.min(x0, x1), floor - 1, Math.abs(x1 - x0), 1, `rgba(201,168,255,${.35 + .5 * k})`); B(x1 - 1, floor - 10, 2, 10, `rgba(201,168,255,${.35 + .5 * k})`); }
    if(m.st === 'vanish' || (m.st === 'phantom-tell' && m.t > .35)){ const ghost = Object.assign({}, m, { x:m.st === 'vanish' ? m.mx : m.x, st:'phantom-tell', hidden:false, y:0, face:Math.sign(api.G.p.x - (m.mx || m.x)) || 1 });
      if(m.st === 'vanish'){ manOne(api, ghost, .25 + .25 * Math.sin(t * 30)); api.glow(WX(m.mx), floor - 18, 20, '160,110,255', .35); } }
  }
  if(m && A.phase === 1 && m.st === 'dive-tell'){ const k = Math.min(1, m.t / c.AIR.dive.tell); api.ctx.strokeStyle = `rgba(201,168,255,${.3 + .5 * k})`; api.ctx.lineWidth = 1; api.ctx.setLineDash([3, 3]); api.ctx.beginPath(); api.ctx.moveTo(WX(m.x), WY(m.y + 35)); api.ctx.lineTo(WX(m.tx), floor); api.ctx.stroke(); api.ctx.setLineDash([]); B(WX(m.tx) - 6, floor - 1, 12, 1, '#c9a8ff'); }
  for(const f of A.fx){
    if(f.kind === 'ghost'){ const a = .35 * (1 - f.t / (f.life || .25)); api.ctx.globalAlpha = a; B0(api, WX(f.x) - 6, WY(f.y) - (f.air ? 40 : 32), 12, f.air ? 30 : 32, '#6b41b0'); api.ctx.globalAlpha = 1; }
    if(f.kind === 'upcut'){ const a = 1 - f.t / .6; api.ctx.globalAlpha = Math.max(0, a); arc(api, WX(f.x), WY(f.y) - 6, 16, -Math.PI * .9, -Math.PI * .1, 2, '#f1e8ff'); api.ctx.globalAlpha = 1; }
    if(f.kind === 'breath'){ const k = f.t / (f.life || .6), x = WX(f.x + (f.tx - f.x) * k), y = WY(f.y + (f.ty - f.y) * k); B(Math.round(x), Math.round(y), 2, 1, 'rgba(201,168,255,.7)'); }
    if(f.kind === 'spark'){ for(let i = 0; i < 6; i++){ const a = i / 6 * 6.28 + f.t * 4, r = 6 + f.t * 30; B(Math.round(WX(f.x) + Math.cos(a) * r), Math.round(WY(f.y) + Math.sin(a) * r), 1, 1, '#f1d6ff'); } }
  }
  for(const s of A.shock){ const x = WX(s.x), h = Math.round(c.AIR.dive.wave.h * api.Z), fade = 1 - s.t / c.AIR.dive.wave.life;
    api.ctx.globalAlpha = Math.max(.2, fade); for(let i = 0; i < h; i++) B(x - s.dir * (i >> 1), floor - i, 2, 1, i < 2 ? '#ffffff' : '#c7a2ff'); api.ctx.globalAlpha = 1; api.glow(x, floor - h / 2, 10, '190,150,255', .3 * fade); }
  for(const s of A.shards){ const x = WX(s.x), y = WY(s.y); B(x - 2, y - 1, 4, 2, P1.chain); B(x - 2, y - 1, 1, 1, P1.chainLit); api.glow(x, y, 4, '220,235,255', .3); }
  for(const b of A.swarm){ const x = WX(b.x), y = WY(b.y + 7), roost = b.t < c.AIR.swarm.roost; if(roost) api.ctx.globalAlpha = Math.min(1, b.t / .3); bat(api, Math.round(x), Math.round(y), 1, t + b.ph, 1, false); api.ctx.globalAlpha = 1; }
  if(A.swarm.length){ api.ctx.globalCompositeOperation = 'lighter'; for(const b of A.swarm){ api.ctx.fillStyle = 'rgba(120,80,200,.18)'; api.ctx.fillRect(Math.round(WX(b.x)) - 8, Math.round(WY(b.y + 7)) - 5, 16, 9); } api.ctx.globalCompositeOperation = 'source-over'; }
  for(const w of A.waves){ const left = w.at - A.t; if(left < .9 && left > 0){ const gx = WX(w.gap); B(gx - 1, floor - 24, 2, 24, `rgba(180,255,220,${.5 * (1 - left / .9)})`); } }
  for(const s of A.stabs){ const ST = c.BONES.stab, x = WX(s.x);
    if(s.t < ST.tell){ const k = s.t / ST.tell; B(x - 1, WY(ST.h), 2, floor - WY(ST.h), `rgba(233,223,201,${.12 + .3 * k})`); B(x - Math.round(ST.w * api.Z), floor - 1, Math.round(2 * ST.w * api.Z), 1, `rgba(255,120,120,${.3 + .5 * k})`); }
    else if(s.t < ST.tell + ST.down + .4){ const top = WY(ST.h); for(const o of [-8, -3, 2, 7]){ boneSeg(api, [x + o * .6, top - 30], [x + o, floor - 1], 1.2, BONE); api.B(x + o, floor - 2, 1, 2, BONE.lit); } } }
  for(const b of A.beams){ const w = Math.round(c.GIANT.gaze.w * api.Z), x = WX(b.x), top = WY(K2.eyeY()), k = 1 - b.t / c.GIANT.gaze.beam;
    api.ctx.fillStyle = `rgba(255,250,255,${.5 * k + .3})`; api.ctx.fillRect(x - w / 2, top, w, floor - top); api.glow(x, floor - 10, w, '230,210,255', .6 * k); }
  const Gi = A.giant;
  if(Gi && Gi.st === 'gaze' && Gi.sub === 'tell' && Gi.tx != null){ const k = Gi.flare || 0, x = WX(Gi.tx), top = WY(K2.eyeY()); api.ctx.strokeStyle = `rgba(255,255,255,${.2 + .6 * k})`; api.ctx.setLineDash([2, 4]); api.ctx.beginPath(); api.ctx.moveTo(WX(c.GIANT.SX), top); api.ctx.lineTo(x, floor); api.ctx.stroke(); api.ctx.setLineDash([]); B(x - Math.round(c.GIANT.gaze.w * api.Z / 2), floor - 1, Math.round(c.GIANT.gaze.w * api.Z), 1, '#ffffff'); }
  if(Gi && Gi.st === 'maw' && Gi.maw){ const M = c.GIANT.maw;
    if(Gi.sub === 'tell'){ const k = Gi.t / M.tell; for(const mx of Gi.maw){ const x = WX(mx); for(let i = -3; i <= 3; i++) B(x + i * 3, floor + (i % 2), 2, 1, `rgba(201,120,255,${.3 + .6 * k})`); api.glow(x, floor, 12 * k + 4, '160,90,255', .3 * k); } }
    else for(const s of A.spikes){ const x = WX(s.x), up = Math.min(1, s.t / .12), h = Math.round(M.h * api.Z * up), hw = Math.round(M.w * api.Z / 2);
      rows(api, [[x - hw, floor], [x - hw * .3, floor - h * .8], [x, floor - h], [x + hw * .3, floor - h * .8], [x + hw, floor]], GIANT); } }
  if(A.trans && A.trans.cloak){ const cl = A.trans.cloak, x = WX(cl.x), y = WY(cl.y);
    rows(api, [[x - 8, y - 12], [x + 8, y - 12], [x + 12, y], [x + 4, y - 3], [x, y + 1], [x - 5, y - 2], [x - 12, y]], P1); api.glow(x, y - 6, 12, '140,90,220', .2); }
  if(A.trans && !A.trans.final && A.trans.from === 0 && A.trans.t > .4 && A.trans.t < 1.6){ const m2 = A.man; if(m2) for(let i = 0; i < 8; i++){ const a = i / 8 * 6.28, r = (A.trans.t - .4) * 60; B(Math.round(WX(m2.x) + Math.cos(a) * r), Math.round(WY(m2.y + 30) + Math.sin(a) * r), 2, 1, P1.chainLit); } }
}

/* ── Bodies ───────────────────────────────────────────────────────────────── */
function enemy(api, e){
  const A = st(api); if(!A) return false;
  switch(e.actFoe){
    case 'cmMan':
      if(e.hidden) return true;
      if(A.phase === 0 && !(A.trans && A.trans.from === 0 && A.trans.t > .8)) manOne(api, e, e.st === 'appear' ? Math.min(1, e.t / .14) : null);
      else manTwo(api, e);
      if(e.hitT > 0){ e.hitT -= api.dt; api.glow(api.WX(e.x), api.WY(e.y + 34), 18, '255,255,255', .3); }
      return true;
    case 'cmBat': { const x = api.WX(e.x), y = api.WY(e.y + e.h / 2); bat(api, Math.round(x), Math.round(y), e.face || 1, api.time, 1.7);
      if(e.st === 'hunt' && e.life - e.t < 1.2 && Math.floor(api.time * 12) % 2) api.glow(x, y, 8, '255,255,255', .2);
      return true; }
    case 'cmSkull': if(A.spider && A.spider.head === e) spider(api, A.spider, A);
      if(e.hitT > 0){ e.hitT -= api.dt; api.glow(api.WX(e.x), api.WY(e.y + e.h / 2), 30, '255,255,255', .25); }
      return true;
    case 'cmEye': case 'cmHand':
      if(e.hitT > 0){ e.hitT -= api.dt; api.glow(api.WX(e.x), api.WY(e.y + e.h / 2), 30, '255,255,255', .35); }
      return true;
  }
  return false;
}

/* ── Overlay: the phase's name, the struggle, the flash ────────────────────── */
function overlay(api){
  const A = st(api); if(!A) return;
  const { ctx, bw, bh } = api;
  if(api.G.vesperEncounter){ctx.save();ctx.textAlign='center';ctx.font='8px monospace';ctx.fillStyle='#e5c6ff';ctx.fillText(A.encounterT>11?'“YOU CANNOT CUT AWAY WHAT IS MISSING.”':'VESPER’S WARD DOES NOT BREAK',bw/2,bh-20);ctx.restore();}
  if(A.flash > .02){ ctx.fillStyle = `rgba(230,215,255,${.22 * Math.min(1, A.flash)})`; ctx.fillRect(0, 0, bw, bh); }
  if(A.banner){ const k = A.banner.t, a = Math.min(1, k / .4) * Math.min(1, (3.2 - k) / .6);
    if(a > 0){ ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; const by = Math.round(bh * .42);                                  // under the stage's own title card, which can still be up after a retry
      ctx.fillStyle = 'rgba(8,5,14,.55)'; ctx.fillRect(0, by - 16, bw, 36);
      ctx.fillStyle = '#c9a8ff'; ctx.font = '8px monospace'; ctx.fillText(A.banner.n, bw / 2, by - 3);
      ctx.fillStyle = '#f1e8ff'; ctx.font = 'bold 11px monospace'; ctx.fillText(A.banner.text, bw / 2, by + 11); ctx.restore(); } }
  const g = A.grab;
  if(g){ const p = api.G.p, x = api.WX(p.x), y = api.WY(p.y + p.h) - 14, max = K().constants.MAN.bat.grip;
    ctx.save(); ctx.textAlign = 'center'; ctx.font = '7px monospace'; ctx.fillStyle = '#f4f0ff'; ctx.fillText('JUMP / ATTACK — BREAK FREE', x + (g.shake ? Math.round(Math.sin(api.time * 60) * 2) : 0), y - 6);
    for(let i = 0; i < max; i++){ ctx.fillStyle = i < g.grip ? '#8a63c7' : '#2a1d3a'; ctx.fillRect(Math.round(x - max * 4 + i * 8), y - 3, 6, 3); } ctx.restore(); }
  FA.vignette(api, '10,5,20', .4);
}

ART.register(STAGE, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
