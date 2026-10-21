/* Bladefall — THE RESIDENTS' OWN BODIES (2026-09-27).

   Everyone the knight can talk to, trade with, take a quest from or lead used to be the knight's own body
   (drawFigure with a palette swap) or a flat vector blob. The owner's bar is the Cloaked Man: you know him from
   across the room. So each person here gets
     · a silhouette nobody else in the region has (height, bulk, headwear, posture: stooped, broad, lanky, seated),
     · one signature colour that is not the knight's navy-and-orange, not a grunt's green hood, and not a
       neighbour's,
     · a prop that is their job or their story, and
     · one small idle motion (steam, a swinging lantern, a turning key, a fluttering strip of blanket).
   The design sheet is docs/concept-art/residents/DESIGNS.md.

   Drawn in the renderer's half-resolution buffer grid, lit on the top and left, dark on the far side — the same
   vocabulary as the Cloaked Man's art. Every entry point returns false for anyone it does not know, so the old
   drawing stays the fallback. Only the body changes: positions, conversations, quest state and the outcome
   performances (Rowan carrying his bench, Elsie's supper, the Recruit's dropped helmet, the Miner's cage) are read
   from the same state the old drawers read.

   Entry points (each called from a one-line hook):
     draw(api, o)                 renderer drawResident (ambient residents, G.npcs) and the Colony's actSable
     drawLegacy(c, o)             BladefallOpeningStories.drawResident (Mara, Bram, Vey in stages 0-1)
     drawStory(c, o, q, r, scene) BladefallSideStoryWorld.draw (side-story givers and supporting speakers)
     drawShop(api, o)             renderer, after the stall is drawn (the keeper behind the counter)
     drawKeeper(c, o, x, y)       BladefallOpeningStories.drawShop (Tamsin inside her own stall)
   `api` is the renderer's EXT_API; `c` is a legacy context, adapted here to the same buffer grid. */
(function installResidentArt(root){
'use strict';

/* ── The world, read lazily (index.html's `let` globals are not window properties) ─────────────────────── */
function world(){ try { return typeof G !== 'undefined' ? G : null; } catch(e){ return null; } }
function groundY(){ try { return typeof GROUND_Y !== 'undefined' ? GROUND_Y : 0; } catch(e){ return 0; } }

/* ── A legacy (world-unit) context, drawn on in buffer pixels ──────────────────────────────────────────────
   The renderer's legacyDraw scales world units by Z onto the half-resolution buffer; the classic renderer
   draws world units 1:1. Either way one buffer pixel is two world units, so a pixel here is `u` device px. */
function legacyApi(c){
  const m = c.getTransform(), u = Math.abs(m.a) * 2 || 1, g = world(), gy = groundY();
  const B = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x) * u, Math.round(y) * u, Math.max(1, Math.round(w)) * u, Math.max(1, Math.round(h)) * u); };
  return { ctx:c, u, G:g, time:g ? g.time || 0 : 0, B,
    WX: wx => Math.round((m.a * wx + m.e) / u),
    WY: wy => Math.round((m.d * (gy - wy) + m.f) / u),
    glow(x, y, r, rgb, a){
      const X = x * u, Y = y * u, R = r * u; c.globalCompositeOperation = 'lighter';
      const gr = c.createRadialGradient(X, Y, 1, X, Y, R); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gr; c.fillRect(X - R, Y - R, R * 2, R * 2); c.globalCompositeOperation = 'source-over';
    } };
}
function onLegacy(c, fn){
  const api = legacyApi(c); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false;
  try { return fn(api); } finally { c.restore(); }
}

/* ── Buffer primitives ───────────────────────────────────────────────────────────────────────────────── */
const EYE = '#1c1418', SHADOW = 'rgba(6,3,14,.34)';
const pal = (c, l, d) => ({ c, l, d });
/* A filled polygon shaded like the renderer's sprites: top row lit, left edge lit, far edge dark. */
function rows(api, pts, p){
  const B = api.B; let y0 = Infinity, y1 = -Infinity;
  for(const q of pts){ if(q[1] < y0) y0 = q[1]; if(q[1] > y1) y1 = q[1]; }
  y0 = Math.floor(y0); y1 = Math.ceil(y1);
  const n = pts.length; let first = true;
  for(let y = y0; y < y1; y++){
    const yc = y + .5, xs = [];
    for(let i = 0, j = n - 1; i < n; j = i++){ const a = pts[i], b = pts[j]; if((a[1] > yc) !== (b[1] > yc)) xs.push(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
    if(!xs.length) continue;
    xs.sort((a, b) => a - b);
    for(let k = 0; k + 1 < xs.length; k += 2){
      const a = Math.round(xs[k]), b = Math.round(xs[k + 1]); if(b <= a) continue;
      if(first){ B(a, y, b - a, 1, p.l); continue; }
      B(a, y, b - a, 1, p.c); B(a, y, 1, 1, p.l); if(b - a > 3) B(b - 1, y, 1, 1, p.d);
    }
    first = false;
  }
}
function line(api, x0, y0, x1, y1, t, col){
  const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))), o = (t - 1) >> 1;
  for(let i = 0; i <= n; i++){ const f = i / n; api.B(Math.round(x0 + (x1 - x0) * f) - o, Math.round(y0 + (y1 - y0) * f) - o, t, t, col); }
}
/* A figure's own grid: authored facing right (dx forward, dy up is negative from the ground row), mirrored
   about the figure's centre line when it faces left. */
function kit(api, x, y, f, t){
  const B = api.B;
  const R = f > 0 ? (dx, dy, w, h, col) => { if(w > 0 && h > 0) B(x + dx, y + dy, w, h, col); }
                  : (dx, dy, w, h, col) => { if(w > 0 && h > 0) B(x - dx - w, y + dy, w, h, col); };
  const k = { api, B, x, y, f, t, R };
  k.P = (dx, dy, col) => R(dx, dy, 1, 1, col);
  k.X = dx => f > 0 ? x + dx : x - dx - 1;
  k.poly = (pts, p) => rows(api, pts.map(q => [f > 0 ? x + q[0] : x - q[0], y + q[1]]), p);
  k.L = (dx0, dy0, dx1, dy1, th, col) => line(api, k.X(dx0), y + dy0, k.X(dx1), y + dy1, th || 1, col);
  k.alpha = (a, fn) => { const c = api.ctx, prev = c.globalAlpha; c.globalAlpha = prev * a; try { fn(); } finally { c.globalAlpha = prev; } };
  k.glow = (dx, dy, r, rgb, a) => api.glow(k.X(dx) + .5, y + dy + .5, r, rgb, a);
  k.flip = () => kit(api, x, y, -f, t);
  k.at = (dx, dy) => kit(api, k.X(dx) + (f > 0 ? 0 : 1), y + dy, f, t);
  return k;
}
function shadow(k, w){ k.R(-(w >> 1), -1, w, 2, SHADOW); }
/* A face: a skin block with two eyes toward the facing side, a 1px nose past the edge if asked. */
function face(k, dx, dy, sk, o){
  o = o || {}; const w = o.w || 4, h = o.h || 4, ey = dy + (o.ey == null ? 1 : o.ey);
  k.R(dx, dy, w, h, sk.c);
  if(o.shade) k.R(dx, dy, w, 1, sk.d);
  if(o.eyes !== false){ k.P(dx + w - 3, ey, o.eye || EYE); k.P(dx + w - 1, ey, o.eye || EYE); }
  if(o.nose) k.P(dx + w, ey + 1, sk.c);
  if(o.cheek) k.P(dx + w - 2, ey + 1, o.cheek);
  if(o.mouth) k.P(dx + w - 2, dy + h - 1, o.mouth);
}
function hand(k, dx, dy, sk){ k.R(dx, dy, 2, 2, sk.c); k.P(dx, dy, sk.l); }
function steam(k, dx, dy, n, rise, ph, col){
  for(let i = 0; i < n; i++){
    const p = (k.t * .6 + i / n + ph) % 1;
    k.alpha((1 - p) * .75, () => k.P(dx + Math.round(Math.sin(p * 6 + i * 2.1) * 1.3), dy - Math.round(p * rise), col || '#f2f0ea'));
  }
}
function flame(k, dx, dy, big){
  const fl = Math.sin(k.t * 17 + dx) + Math.sin(k.t * 7.3);
  k.P(dx, dy, '#fff4c0'); k.P(dx, dy - 1 - (fl > .6 ? 1 : 0), '#ffb040');
  if(big){ k.P(dx + (fl > 0 ? 1 : -1), dy, '#ff8a30'); k.P(dx, dy - 2 - (fl > 1 ? 1 : 0), '#ff7a2a'); }
}
const CHAIN = pal('#a9b0bb', '#eef3f8', '#6c727c');
function chain(k, pts, glint){
  const out = [];
  for(let i = 0; i + 1 < pts.length; i++){ const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2)); for(let j = 0; j < n; j++) out.push([a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n]); }
  out.push(pts[pts.length - 1]);
  out.forEach((q, i) => { const dx = Math.round(q[0]), dy = Math.round(q[1]);
    if(i % 2 === 0){ k.R(dx, dy, 2, 1, CHAIN.c); k.P(dx, dy, CHAIN.l); } else { k.R(dx, dy - 1, 1, 2, CHAIN.c); k.P(dx, dy - 1, CHAIN.l); }
    if(glint && i % glint === ((k.t * 4) | 0) % glint) k.P(dx, dy, '#ffffff'); });
}
/* A plank stool for the seated; the side stories used to outline one. */
function stool(k, dx, h, w){ w = w || 9; k.R(dx, -h, w, 2, '#8e715c'); k.R(dx, -h, w, 1, '#b8987a'); k.R(dx + 1, -h + 2, 1, h - 2, '#5e4a3a'); k.R(dx + w - 2, -h + 2, 1, h - 2, '#5e4a3a'); }
function stride(k, s, amp){ return s.walk ? Math.round(Math.sin(k.t * 10 + s.ph) * (amp || 2)) : 0; }
function every(t, period, dur, ph){ return ((t + (ph || 0) * period) % period) < dur; }

const SKIN = {
  fair:pal('#f2cfae', '#ffe4c8', '#c89a78'), ruddy:pal('#e3a883', '#f6c6a2', '#b27856'), tan:pal('#d39a70', '#ecb88c', '#9e6a48'),
  brown:pal('#a8704c', '#c89068', '#744a30'), deep:pal('#7a4c34', '#9c6c4e', '#52301e'), pale:pal('#ece0d2', '#fff6ea', '#bcae9c'),
  soot:pal('#b98a68', '#d4a684', '#7e5a42'),
};
const WOOD = pal('#7a5a3c', '#a47c54', '#4e3826'), IRON = pal('#5a5f68', '#9aa1aa', '#34383e'), BRASS = pal('#d3a646', '#ffe08a', '#86621e');
const BOOT = '#241c18';

/* ═══ THE CAST ════════════════════════════════════════════════════════════════════════════════════════════
   Each design is (k, s): k the figure's grid at its feet, s the pose — sit, walk, look (head turned back),
   at (seconds since the side story's last turn), and the few story flags its body shows. */
const D = {};

/* ROWAN · Outskirts · the gatekeeper. Broad, square, a wide-brimmed kettle helm; a crimson quilted gambeson;
   the spear with a strip of his brother's blanket tied under the head, fluttering. Seated on his bench when the
   bell is hung; his back to you, one hand up, when you were cruel. */
D.rowan = (k, s) => {
  const C = pal('#a8392f', '#d8604a', '#6a2019'), sk = SKIN.ruddy, trouser = '#4a3a32', grey = '#a8a8a4', mou = '#e6e4de';
  const sh = s.sit ? -25 : -22, hem = s.sit ? -13 : -6;
  shadow(k, 16);
  const spear = (bx, by, tx, ty) => {
    k.L(bx, by, tx, ty, 1, WOOD.c);
    k.P(tx, ty - 6, IRON.l); k.R(tx - 1, ty - 5, 3, 3, IRON.l); k.P(tx + 1, ty - 4, IRON.c); k.P(tx, ty - 2, IRON.c); k.R(tx - 1, ty - 1, 3, 1, '#6a5040');
    for(let i = 0; i < 6; i++){ const w = Math.round(Math.sin(k.t * 5 + s.ph - i * .9) * (s.sit ? .6 : 1.3)); k.R(tx + 1 + i, ty + 2 + w + (s.sit ? i >> 1 : 0), 1, i < 4 ? 3 : 2, i % 2 ? C.c : C.l); }
  };
  if(s.sit) spear(-9, -1, -5, -40);
  // legs
  if(s.sit){ k.R(-2, hem - 2, 11, 3, trouser); k.P(8, hem - 2, '#6a5448'); k.R(7, hem + 1, 3, -hem - 3, trouser); k.R(7, -2, 4, 2, BOOT); }
  else { const st = stride(k, s); k.R(-4 + st, -7, 3, 6, trouser); k.R(1 - st, -7, 3, 6, trouser); k.R(-4 + st, -2, 4, 2, BOOT); k.R(1 - st, -2, 4, 2, BOOT); }
  // the back arm — out behind him to end the conversation, when you were cruel
  if(s.bad && !s.walk){ const ext = Math.round(Math.min(1, (s.at || 9) / 1.5) * 7); k.L(-5, sh + 3, -6 - ext, sh + 4, 2, C.d); hand(k, -8 - ext, sh + 2, sk); k.P(-8 - ext, sh + 1, sk.c); }
  else { k.L(-5, sh + 2, -6, sh + 9, 2, C.d); hand(k, -7, sh + 9, sk); }
  // the gambeson, quilted
  k.poly([[-6, sh], [6, sh], [s.sit ? 6 : 7, hem], [-7, hem]], C);
  for(let yy = sh + 3; yy < hem - 1; yy += 3) for(let xx = -5; xx < 6; xx += 2) k.P(xx + ((yy >> 1) & 1), yy, C.d);
  k.R(-6, sh + 10, 13, 1, '#3a2a24'); k.R(0, sh + 10, 2, 1, '#e0b85a');

  // the head: he keeps glancing back down the road
  const h = s.look < 0 ? k.flip() : k;
  h.R(-2, sh - 1, 5, 1, C.l);
  face(h, 0, sh - 5, sk, { nose:true, shade:true, ey:1 });
  h.R(-3, sh - 5, 3, 3, grey); h.P(-1, sh - 4, sk.d);
  h.R(1, sh - 2, 3, 1, mou); h.P(4, sh - 2, mou);
  h.R(-3, sh - 8, 7, 2, IRON.c); h.R(-2, sh - 9, 5, 1, IRON.l); h.P(-3, sh - 8, IRON.l);
  h.R(-7, sh - 6, 15, 1, IRON.l); h.P(-7, sh - 5, IRON.d); h.P(7, sh - 5, IRON.d);
  // the spear in his fist
  if(!s.sit && s.busy){   // the spear tipped across him, head up by his shoulder; the whetstone drawn down its edge
    const st = Math.round(((k.t * 1.6 + s.ph) % 1) * 4), wx = 13, wy = -35 + st;
    spear(3, -1, 13, -30); k.L(5, sh + 1, 9, sh + 8, 2, C.c); hand(k, 9, sh + 8, sk);
    k.L(5, sh + 3, wx - 2, wy + 2, 2, C.d); k.R(wx - 1, wy, 3, 2, '#7a7468'); k.P(wx - 1, wy, '#a8a294'); hand(k, wx - 2, wy + 2, sk);
    if(st === 3 && every(k.t, .63, .08, s.ph)) k.P(wx + 2, wy - 1, '#fff2b0');
  }
  else if(!s.sit){ const bob = s.walk ? stride(k, s, 1) : 0; spear(8, -1, 8, -43 + bob); k.L(5, sh + 1, 7, sh + 6, 2, C.c); hand(k, 7, sh + 6, sk); }
  else { k.L(5, sh + 2, 6, hem - 1, 2, C.c); hand(k, 5, hem - 2, sk); }
};

/* MARA · Outskirts, Marksman road · the surveyor. Lanky and long-legged, a mustard duster whose tails flap, a
   leather cap with brass goggles on the brim, the field chart open in both hands (its corner lifts in the wind). */
/* Her run to Broken Muster (s.run, s.air: index.html updateMaraRun) leans her forward on long strides with the
   chart rolled under her arm; in the air the front knee comes up, the back leg trails and the tails stream. */
D.mara = (k, s) => {
  const C = pal('#c8962a', '#f0c454', '#82601a'), sk = SKIN.fair, hair = '#7a3420', cap = pal('#6a4a30', '#8e6a48', '#40301e'), trouser = '#3e3530';
  const moving = s.run || s.air, ph = k.t * 15 + s.ph;
  if(!s.air) shadow(k, 12);
  if(s.air){
    k.L(0, -11, 4, -7, 2, trouser); k.L(4, -7, 3, -3, 2, trouser); k.R(3, -3, 3, 2, BOOT);        // front knee up
    k.L(-1, -11, -5, -5, 2, trouser); k.R(-8, -6, 3, 2, BOOT);                                      // back leg trails
  } else if(s.run){
    const a = Math.round(Math.sin(ph) * 4), up = Math.round(Math.max(0, Math.cos(ph)) * 2), up2 = Math.round(Math.max(0, -Math.cos(ph)) * 2);
    k.L(-1, -11, a, -2 - up, 2, trouser); k.R(a, -2 - up, 3, 2, BOOT);
    k.L(0, -11, -a, -2 - up2, 2, trouser); k.R(-a - 1, -2 - up2, 3, 2, BOOT);
  } else {
    const st = stride(k, s);
    k.R(-3 + st, -11, 2, 10, trouser); k.R(1 - st, -11, 2, 10, trouser); k.R(-3 + st, -2, 3, 2, BOOT); k.R(1 - st, -2, 3, 2, BOOT);
  }
  const flap = s.air ? -3 : s.run ? -2 + Math.round(Math.sin(k.t * 11 + s.ph)) : Math.round(Math.sin(k.t * 3.2 + s.ph) * 1.2) + (s.walk ? -1 : 0);
  const u = moving ? k.at(1, s.run ? -Math.round(Math.abs(Math.sin(ph))) : 0) : k;   // lean into the run, bob on the stride
  const sw = s.air ? 4 : Math.round(Math.sin(ph) * 3);
  if(moving){ u.L(-1, -24, -3 - sw, -18, 2, C.d); hand(u, -4 - sw, -18, sk); }       // the far arm pumps behind her
  u.poly([[-4, -26], [4, -26], [5, -10], [-2, -10], [-6 + flap, -6], [-5, -13]], C);   // the back tail flaps
  u.R(1, -24, 1, 14, C.d); u.R(2, -25, 2, 3, '#ece4d2');
  u.R(-4, -17, 9, 1, '#4a3020'); u.R(-6, -19, 1, 5, BRASS.c); u.P(-6, -19, BRASS.l);   // belt, spyglass
  if(moving){ u.R(-6, -29, 3, 1, hair); u.P(-7, -28 + (flap & 1), hair); }             // the braid streams behind
  else { k.P(-5, -29, hair); k.R(-5, -28, 1, 4 + (flap > 0 ? 1 : 0), hair); }          // the braid
  face(u, 0, -31, sk, { nose:true, mouth:'#b0705a' });
  u.R(-3, -31, 3, 4, hair);
  u.R(-3, -34, 7, 3, cap.c); u.R(-3, -34, 7, 1, cap.l); u.R(3, -32, 3, 1, cap.d);
  u.R(-1, -35, 2, 2, BRASS.c); u.R(2, -35, 2, 2, BRASS.c); u.P(0, -34, '#bff4ff'); u.P(3, -34, '#bff4ff');
  if(every(k.t, 4.5, .25, s.ph)) u.P(3, -35, '#ffffff');
  if(moving){
    // the chart rolled tight under the near arm
    u.R(-3, -21, 8, 2, '#ecdcb0'); u.R(-3, -21, 8, 1, '#fff2cc'); u.P(-3, -20, '#8a6a4a');
    u.L(3, -24, 4 + (s.air ? 2 : 0), -20, 2, C.c); hand(u, 4 + (s.air ? 2 : 0), -20, sk);
    return;
  }
  // the chart (handed across once her survey is done)
  if(s.chartGiven){ k.L(3, -24, 5, -17, 2, C.c); hand(k, 5, -17, sk); return; }
  // busy: the wind keeps lifting the chart's corner and she keeps slapping it flat
  const gust = s.busy ? (k.t * .9 + s.ph) % 1 : 0, slap = s.busy && gust > .82;
  const lift = s.busy ? (slap ? 0 : -Math.round(Math.min(3, gust * 4.5) * (1 + Math.sin(k.t * 19) * .2))) : Math.round(Math.sin(k.t * 4.1 + s.ph) * .8);
  k.L(3, -24, 4, -19, 2, C.c);
  k.R(4, -23, 8, 6, '#ecdcb0'); k.R(4, -23, 8, 1, '#fff2cc'); k.R(11, -23 + lift, 1, 1, '#fff2cc');
  if(lift < -1){ k.R(10, -23 + lift, 2, -lift, '#ecdcb0'); k.P(11, -24 + lift, '#fff2cc'); }
  if(slap){ k.L(-2, -24, 9, -24, 2, C.c); hand(k, 9, -25, sk); }
  k.R(5, -21, 5, 1, '#8a6a4a'); k.R(7, -20, 1, 2, '#6a8aa0'); k.P(9, -19, '#c43a2a'); k.P(6, -18, '#8a6a4a');
  hand(k, 3, -20, sk); hand(k, 11, -20, sk);
};

/* VEY · the standard-bearer (Outskirts, the Gaol, the White Court). Wiry, one arm in a sling, a rose headband
   whose long tails stream behind her, a rose sash; the broken standard is never far — planted beside her, or
   propped where she sits. In the Gaol she has the key ring; in the Court, the brass sluice key. */
D.vey = (k, s) => {
  const R = pal('#c4487a', '#ee78a4', '#80284e'), J = pal('#3c3444', '#5a5064', '#241f2a'), sk = SKIN.tan, hair = '#1e1618', sling = '#e6dcc6', trouser = '#2e2a34';
  const low = s.sit;
  shadow(k, 12);
  // the standard: a snapped pole, a torn rose banner
  const standard = (bx, tx, ty) => {
    k.L(bx, -1, tx, ty, 1, WOOD.c); k.P(tx, ty - 1, WOOD.l); k.P(tx + 1, ty - 2, WOOD.d);
    for(let i = 0; i < 6; i++){ const w = Math.round(Math.sin(k.t * 3 + s.ph + i * .7) * (low ? .3 : .8)); k.R(tx + 1 + i, ty + 1 + w, 1, 9 - (i === 2 || i === 5 ? 3 : 0) - (low ? i >> 1 : 0), i === 0 ? R.l : i % 2 ? R.c : R.d); }
    k.R(tx + 2, ty + 3, 2, 2, BRASS.l);
  };
  if(low) standard(-9, -4, -28); else if(s.prop !== 'wrench') standard(-8, -8, -36);
  // sitting on her bedroll, knees up; or standing
  if(low){ k.R(-4, -6, 6, 2, trouser); k.L(1, -6, 4, -9, 2, trouser); k.L(4, -9, 6, -3, 2, trouser); k.R(5, -2, 3, 2, BOOT); }
  else { const st = stride(k, s); k.R(-3 + st, -8, 2, 7, trouser); k.R(1 - st, -8, 2, 7, trouser); k.R(-3 + st, -2, 3, 2, BOOT); k.R(1 - st, -2, 3, 2, BOOT); }
  const sh = low ? -18 : -19, base = low ? 1 : 0;
  if(s.busy && low){   // rewrapping the bandage round her knee: the hand circles it, the loose end trails
    const a = k.t * 4.2 + s.ph, cx = 3 + Math.round(Math.cos(a) * 2), cy = -9 + Math.round(Math.sin(a) * 1.5);
    k.R(2, -10, 4, 2, sling); k.P(3, -10, '#fffaee');
    k.L(-4, sh + 1, cx, cy, 2, J.d); hand(k, cx, cy, sk);
    for(let i = 1; i < 4; i++) k.P(cx + i, cy + 1 + (i >> 1) + Math.round(Math.sin(a + i) * .6), i < 3 ? sling : '#cfc4ac');
  } else { k.L(-4, sh + 1, -5, sh + 8, 2, J.d); hand(k, -6, sh + 8, sk); }
  k.poly([[-4, sh], [4, sh], [4, base - 7], [-4, base - 7]], J);
  for(let i = 0; i < 9; i++) k.R(-4 + i, sh + 1 + i, 2, 1, i < 2 ? R.l : R.c);                 // the sash
  k.R(1, sh + 4, 4, 3, sling); k.R(1, sh + 4, 4, 1, '#fffaee'); k.L(0, sh, 3, sh + 4, 1, '#cfc4ac'); // the sling
  // the head, the headband and its tails (bowed over the bandage while she works)
  if(s.busy && low) k = k.at(1, 1);
  face(k, -1, sh - 5, sk, { ey:2, mouth:'#8a4a3a' });
  k.R(-3, sh - 6, 6, 2, hair); k.R(-3, sh - 4, 2, 3, hair);
  k.R(-3, sh - 5, 6, 1, R.l); k.P(3, sh - 5, R.c);
  for(let i = 0; i < 7; i++){ const w = Math.round(Math.sin(k.t * 4.2 + s.ph - i * .75) * (i * .3)); k.P(-4 - i, sh - 5 + (i >> 1) + w, i % 2 ? R.c : R.l); if(i < 5) k.P(-4 - i, sh - 4 + (i >> 1) + w, R.d); }
  // what her free hand holds, by region
  if(s.prop === 'keys'){ const kx = 7, ky = sh + 11; k.L(4, sh + 2, 6, ky - 2, 2, J.c); hand(k, 5, ky - 2, sk);
    k.R(kx - 1, ky, 5, 1, BRASS.c); k.R(kx - 1, ky, 1, 4, BRASS.c); k.R(kx + 3, ky, 1, 4, BRASS.c); k.R(kx - 1, ky + 3, 5, 1, BRASS.d);
    const sw = Math.round(Math.sin(k.t * 2.4 + s.ph)); k.R(kx + 1 + sw, ky + 4, 1, 4, BRASS.l); k.R(kx + 1 + sw, ky + 7, 2, 1, BRASS.c); k.R(kx - 2 - sw, ky + 4, 1, 3, BRASS.c); }
  else if(s.prop === 'wrench'){ k.L(4, sh + 2, 6, sh - 2, 2, J.c); hand(k, 5, sh - 3, sk);
    k.L(6, -1, 7, sh - 12, 1, BRASS.c); k.R(4, sh - 13, 7, 2, BRASS.c); k.R(4, sh - 13, 7, 1, BRASS.l); k.P(7, sh - 8, '#ffffff'); }
};

/* ELSIE · Black Woods · the cook of the falling refuge. Short and round, a knotted red headscarf with white spots
   (the ears of the knot stand up), a cream apron, the big wooden ladle; steam off the bowl in her other hand.
   At supper she sits, and the second bowl goes across to your place. */
D.elsie = (k, s) => {
  const R = pal('#c8443a', '#f06c56', '#84261e'), dress = pal('#6e4a44', '#946a60', '#4a2e2a'), apron = '#efe4cc', sk = SKIN.fair, hair = '#d8d4cc';
  const b = s.sit ? -5 : 0;
  shadow(k, 14);
  if(s.sit){ stool(k, -6, 6, 11); k.R(1, -7, 5, 2, dress.c); k.R(4, -5, 2, 4, dress.d); k.R(4, -2, 3, 2, BOOT); }
  else { k.R(-3, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT); }
  // the ladle, stirring the air
  const cx = Math.round(Math.cos(k.t * 3 + s.ph)), cy = Math.round(Math.sin(k.t * 3 + s.ph));
  k.L(-5, b - 11, -7 + cx, b - 20 + cy, 1, WOOD.l); k.R(-9 + cx, b - 22 + cy, 3, 2, WOOD.c); k.P(-9 + cx, b - 22 + cy, WOOD.l);
  hand(k, -6, b - 12, sk);
  k.poly([[-5, b - 12], [5, b - 12], [7, b - 1], [-7, b - 1]], dress);
  k.R(-2, b - 11, 6, 10, apron); k.R(-2, b - 11, 6, 1, '#fffaf0'); k.R(3, b - 10, 1, 9, '#cdbf9c');
  k.poly([[-5, b - 15], [5, b - 15], [6, b - 10], [-6, b - 10]], R);                              // the shawl
  face(k, -1, b - 18, sk, { w:4, h:3, ey:0, cheek:'#e88878' });
  k.P(1, b - 16, '#a05048');
  k.R(-3, b - 20, 7, 2, R.c); k.R(-3, b - 20, 7, 1, R.l); k.R(-3, b - 18, 2, 2, hair);
  k.P(-2, b - 19, '#ffffff'); k.P(1, b - 20, '#ffffff'); k.P(3, b - 19, '#ffffff');
  k.P(-1, b - 21, R.c); k.P(-2, b - 22, R.l); k.P(1, b - 21, R.c); k.P(2, b - 22, R.l);           // the knot's ears
  // the bowl: in her hands, or pushed across to your place at supper
  const slide = s.good && s.at < 3 ? Math.round(Math.min(1, s.at / 3) * 11) : s.good ? 99 : 0;
  if(slide < 99){ const bx = 4 + slide; k.R(bx, b - 12, 5, 2, '#e0d2b0'); k.R(bx, b - 12, 5, 1, '#fff6dc'); k.R(bx + 1, b - 10, 3, 1, '#b8a888'); steam(k, bx + 2, b - 13, 3, 7, s.ph); }
  hand(k, 4, b - 11, sk);
  if(s.bad){ const ext = Math.round(Math.min(1, (s.at || 9) / 1.5) * 5); k.L(4, b - 13, 6 + ext, b - 13, 2, R.c); hand(k, 7 + ext, b - 14, sk); }
};

/* BRAM · Black Woods · the lantern-keeper. The tallest man in the woods: a bone-white duster to the ankles, an
   amber scarf, a tall bent lamplighter's cone of a cap, the big iron lantern at his side (it swings; it glows
   once he trusts you), the lighting pole over his shoulder. */
D.bram = (k, s) => {
  const C = pal('#d8d0b8', '#f6f0de', '#9a927a'), A = pal('#e0a030', '#ffcc60', '#9a6a14'), sk = SKIN.tan, cap = pal('#2e2c38', '#4c4a5a', '#1a1822'), hair = '#3a2a20';
  shadow(k, 14);
  k.L(-5, -25, -8, -43, 1, WOOD.c); k.P(-8, -44, BRASS.l); k.P(-7, -45, BRASS.c);                // the lighting pole
  const st = stride(k, s, 1);
  k.R(-3 + st, -5, 2, 4, '#3a3834'); k.R(1 - st, -5, 2, 4, '#3a3834'); k.R(-3 + st, -2, 3, 2, BOOT); k.R(1 - st, -2, 3, 2, BOOT);
  k.L(-4, -25, -5, -18, 2, C.d); hand(k, -6, -18, sk);
  k.poly([[-4, -27], [4, -27], [6, -4], [-6, -4]], C);
  k.R(1, -22, 1, 18, C.d); k.P(2, -20, '#8a826c'); k.P(2, -16, '#8a826c'); k.P(2, -12, '#8a826c');
  k.R(-4, -27, 9, 2, A.c); k.R(-4, -27, 9, 1, A.l);
  const sw = Math.round(Math.sin(k.t * 2.6 + s.ph) * 1.2); k.R(-6, -25, 2, 6 + (sw > 0 ? 1 : 0), A.c); k.P(-6, -25, A.l);
  face(k, 0, -32, sk, { w:3, h:5, ey:1, nose:true });
  k.R(-3, -32, 3, 4, hair); k.R(0, -28, 3, 1, '#8a6a50');
  k.R(-3, -34, 7, 2, cap.c); k.R(-3, -34, 7, 1, cap.l); k.R(-2, -36, 5, 2, cap.c); k.P(-2, -36, cap.l);
  k.R(-2, -38, 3, 2, cap.c); k.P(-3, -39, cap.c); k.P(-4, -40, cap.l);
  // the lantern (it is on the post once the lesson is over)
  k.L(4, -25, 6, -17, 2, C.c); hand(k, 5, -17, sk);
  if(!s.handedOver){
    const lx = 6 + Math.round(Math.sin(k.t * 2.2 + s.ph) * (s.walk ? 1.5 : .8)), lit = s.lit;
    k.R(lx, -16, 1, 2, IRON.c);
    k.R(lx - 3, -14, 7, 1, IRON.l); k.R(lx - 3, -13, 7, 9, '#3e3e2a'); k.R(lx - 2, -12, 5, 7, lit ? '#ffe9a0' : '#8d8859'); k.R(lx, -12, 1, 7, lit ? '#fff8d8' : '#a8a070');
    k.R(lx - 3, -5, 7, 1, IRON.d);
    if(lit){ k.glow(lx, -9, 30, '255,214,120', .32); k.glow(lx, -9, 10, '255,236,170', .35); }
  }
};

/* OREN · the chainwright (the Causeway, the Updrafts, the Keep, Emberdeep to the Throne). The widest man in the
   world: bald, a black spade beard, a copper leather apron, a chain worn like a bandolier with a loop at his hip
   that swings, the sledge resting head-down beside him (on his shoulder when he walks). */
D.oren = (k, s) => {
  const A = pal('#c0652a', '#ec8e4a', '#7a3c16'), SHIRT = pal('#4e4a50', '#6c6872', '#322e36'), sk = SKIN.tan, beard = '#2e1c14', trouser = '#3a302a';
  shadow(k, 18);
  const st = stride(k, s);
  k.R(-5 + st, -6, 4, 5, trouser); k.R(1 - st, -6, 4, 5, trouser); k.R(-5 + st, -2, 5, 2, BOOT); k.R(1 - st, -2, 5, 2, BOOT);
  k.L(-7, -19, -8, -11, 3, SHIRT.d); k.R(-9, -12, 3, 3, sk.c);
  k.poly([[-7, -21], [7, -21], [8, -13], [6, -6], [-6, -6], [-8, -13]], SHIRT);
  k.poly([[-4, -17], [4, -17], [5, -5], [-5, -5]], A);
  k.R(-4, -21, 1, 4, A.d); k.R(3, -21, 1, 4, A.d); k.R(-1, -11, 3, 2, A.d);
  // the head sits straight on the shoulders
  const bob = every(k.t, 2.4, 1.2, s.ph) ? 1 : 0;
  k.R(-3, -27 + bob, 6, 6, sk.c); k.R(-2, -28 + bob, 4, 1, sk.l); k.P(-3, -27 + bob, sk.l); k.P(-2, -24 + bob, sk.d);
  k.R(0, -25 + bob, 3, 1, '#7a4a30'); k.P(0, -24 + bob, EYE); k.P(2, -24 + bob, EYE); k.P(3, -23 + bob, sk.c);
  k.R(-1, -22 + bob, 5, 3, beard); k.R(0, -19 + bob, 4, 3, beard); k.P(1, -16 + bob, beard); k.P(0, -21 + bob, '#5a3a2a');
  // the chain: shoulder to hip, and a loop that swings
  const sw = Math.sin(k.t * 2.2 + s.ph) * 1.5;
  chain(k, [[-6, -20], [-2, -15], [2, -11], [5, -8]], 5);
  chain(k, [[5, -8], [7 + sw * .6, -5], [5 + sw, -3], [3, -6]]);
  // the sledge
  if(s.walk){ k.L(6, -18, 2, -26, 1, WOOD.c); k.R(-1, -30, 5, 4, IRON.c); k.R(-1, -30, 5, 1, IRON.l); k.L(5, -19, 7, -15, 3, SHIRT.c); k.R(5, -20, 3, 3, sk.c); }
  else { k.R(10, -12, 1, 9, WOOD.c); k.R(8, -4, 6, 4, IRON.c); k.R(8, -4, 6, 1, IRON.l); k.P(13, -3, IRON.d); k.L(6, -19, 8, -13, 3, SHIRT.c); k.R(8, -14, 3, 3, sk.c); k.P(8, -14, sk.l); }
};

/* SILAS · the Causeway · the clockwork defector. Stiff and narrow, a verdigris coat with a column of brass buttons,
   a tall shako; the wind-up key in his back turns while the Governor Gear still walks him (it stops when he is
   free, and he sits down in the sun). His legs do not bend. */
D.silas = (k, s) => {
  const C = pal('#2e8a84', '#5cbcb2', '#1a5450'), sk = SKIN.pale, shako = pal('#20282c', '#3a464c', '#101416'), trouser = '#23282c';
  shadow(k, 12);
  const free = s.good || s.o.governorStopped;
  // the key, turning in his back
  const turn = free ? .15 : Math.abs(Math.cos(k.t * 2.4 + s.ph)), hh = Math.max(0, Math.round(turn * 3));
  k.R(-7, -18, 3, 1, BRASS.d); k.R(-9, -18 - hh, 2, 2 * hh + 1, BRASS.c); k.P(-9, -18 - hh, BRASS.l); if(hh) k.P(-8, -18 + hh, BRASS.d);
  if(s.sit){ k.R(-3, -4, 10, 2, trouser); k.R(6, -4, 3, 3, BOOT); }
  else {
    const sw = s.walk ? Math.round(Math.sin(k.t * 8 + s.ph) * 2) : 0;
    k.L(-2, -9, -2 + sw, -2, 2, trouser); k.L(1, -9, 1 - sw, -2, 2, trouser); k.R(-3 + sw, -2, 3, 2, BOOT); k.R(0 - sw, -2, 3, 2, BOOT);
  }
  const b = s.sit ? 5 : 0;
  k.R(-6, b - 23, 2, 10, C.d); hand(k, -6, b - 13, sk);
  k.poly([[-4, b - 24], [4, b - 24], [5, b - 8 - (s.sit ? 4 : 0)], [-5, b - 8 - (s.sit ? 4 : 0)]], C);
  k.R(-3, b - 25, 6, 2, C.l);
  for(let i = 0; i < 4; i++) k.P(1, b - 22 + i * 3, BRASS.l);
  k.R(-4, b - 15, 9, 1, '#16302e'); k.P(1, b - 15, BRASS.c);
  k.R(4, b - 23, 2, 10, C.c); hand(k, 4, b - 13, sk);
  face(k, -1, b - 30, sk, { w:4, h:5, ey:2, cheek:'#e8a0a0', mouth:'#a08878' });
  k.R(-3, b - 36, 7, 6, shako.c); k.R(-3, b - 36, 7, 1, shako.l); k.R(-3, b - 35, 1, 5, shako.l); k.R(0, b - 35, 2, 3, BRASS.c); k.P(0, b - 35, BRASS.l);
  k.R(3, b - 31, 3, 1, shako.d);
};

/* SABLE · the stretcher-keeper (the Causeway, the Colony). A stooped black hood; a long ivory scarf down the front
   that you can see from across a room; the folded stretcher strapped to his back, its poles standing over his
   head; the cup in both hands, steaming (and filled, once the tap runs). */
D.sable = (k, s) => {
  const C = pal('#2c2830', '#4c4652', '#18151c'), I = pal('#e6dfcc', '#fffaee', '#b0a890'), sk = SKIN.brown, canvas = '#c8bca0';
  shadow(k, 13);
  k.R(-7, -37, 1, 34, WOOD.c); k.R(-5, -38, 1, 35, WOOD.l); k.R(-7, -30, 3, 13, canvas); k.R(-7, -30, 3, 1, '#e4dac0'); k.R(-8, -26, 5, 1, '#6a4a30'); k.R(-8, -20, 5, 1, '#6a4a30');
  k.poly([[-4, -20], [4, -21], [6, -1], [-6, -1]], C);
  k.R(-3, -27, 6, 7, C.c); k.R(-3, -27, 6, 1, C.l); k.R(-3, -26, 1, 6, C.l); k.R(3, -25, 2, 3, C.c); k.P(4, -25, C.l);
  k.R(0, -24, 3, 4, sk.d); k.P(1, -23, '#f0d8a0'); k.P(3, -23, '#f0d8a0'); k.P(2, -21, sk.c);
  k.R(1, -20, 3, 15, I.c); k.R(1, -20, 1, 15, I.l); k.R(2, -6, 2, 2, I.d);                    // the scarf
  hand(k, 3, -13, sk); hand(k, 7, -13, sk);
  k.R(5, -14, 3, 3, '#9aa4a8'); k.R(5, -14, 3, 1, '#c9ced0');
  if(s.water) k.P(6, -14, '#9fd8f0');
  steam(k, 6, -15, 2, 6, s.ph);
};

/* THE CARTOGRAPHER · the Updrafts · blind. Stooped forward over a cane, a plum robe, a long white beard, a
   blindfold; a quiver of map rolls on his back; the brass ear-trumpet held up, turning to find the wind. */
D.cartographer = (k, s) => {
  const C = pal('#7c3470', '#aa5a9a', '#4c1c44'), sk = SKIN.fair, beard = pal('#ece8e0', '#ffffff', '#bab4aa');
  const b = s.sit ? -5 : 0;
  shadow(k, 14);
  k.R(-9, b - 23, 3, 12, '#6a4a30'); k.P(-9, b - 23, '#8e6a48');
  for(const [dx, h, seal] of [[-10, 6, 1], [-9, 8, 0], [-8, 5, 1]]){ k.R(dx, b - 23 - h, 1, h, '#efe2c0'); if(seal) k.P(dx, b - 23 - h, '#c43030'); }
  if(s.sit){ stool(k, -6, 6, 12); k.R(0, -8, 6, 3, C.d); k.R(4, -5, 2, 4, C.d); k.R(4, -2, 3, 2, BOOT); }
  else { k.R(-3, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT); }
  k.poly([[-6, b - 19], [3, b - 21], [6, b - 1], [-6, b - 1]], C);
  k.R(-6, b - 3, 12, 1, C.d);
  // the cane, tapping
  if(!s.sit){ const tap = every(k.t, 1.6, .2, s.ph) ? 1 : 0; k.R(8, -13 - tap, 1, 12, WOOD.c); k.P(8, -1 - tap, WOOD.d); hand(k, 7, -14 - tap, sk); k.L(3, -18, 7, -14, 2, C.c); }
  face(k, 2, b - 25, sk, { eyes:false, nose:true });
  k.R(0, b - 26, 3, 3, beard.c); k.P(0, b - 26, beard.l);
  k.R(1, b - 24, 6, 1, '#d8ccb0'); k.P(0, b - 24, '#b8ac90'); k.P(-1, b - 23, '#b8ac90');
  k.R(2, b - 22, 4, 5, beard.c); k.P(2, b - 22, beard.l); k.R(3, b - 17, 2, 3, beard.c); k.P(4, b - 14, beard.d);
  // the ear-trumpet: bell up and back, slowly sweeping
  const a = -2.2 + Math.sin(k.t * .8 + s.ph) * .35, ex = 1, ey = b - 23;
  const tx = Math.round(ex + Math.cos(a) * 7), ty = Math.round(ey + Math.sin(a) * 7);
  k.L(ex, ey, tx, ty, 1, BRASS.c); k.R(tx - 2, ty - 2, 4, 3, BRASS.c); k.R(tx - 2, ty - 2, 4, 1, BRASS.l); k.P(tx - 1, ty - 1, '#3a2a14');
  const mx = Math.round((ex + tx) / 2), my = Math.round((ey + ty) / 2); k.L(-2, b - 18, mx, my + 1, 2, C.c); hand(k, mx - 1, my, sk);
  if(every(k.t, 3, .8, s.ph)){ const p = ((k.t + s.ph * 3) % 3) / .8; k.alpha(1 - p, () => { k.P(tx - 3 - Math.round(p * 3), ty - 3, '#cfe8ff'); k.P(tx - 3 - Math.round(p * 3), ty - 1, '#cfe8ff'); k.P(tx - 4 - Math.round(p * 3), ty - 2, '#cfe8ff'); }); }
};

/* THE RECRUIT · Marksman road · borrowed courage. Short and skinny, knees knocking, a scarlet tabard, big ears and a
   ginger tuft — until you bring his uncle's helmet, which is far too big for him (brass, a red plume, down over
   his eyes). He keeps glancing both ways. */
D.recruit = (k, s) => {
  const C = pal('#cc3a32', '#f06454', '#86201a'), sk = SKIN.fair, hair = '#e07a2a', mail = '#8a8e96';
  shadow(k, 10);
  const st = stride(k, s), shake = !s.walk && every(k.t, 2.2, .5, s.ph) ? Math.round(Math.sin(k.t * 40)) : 0;
  k.R(-2 + st + shake, -7, 2, 6, '#3a3430'); k.R(1 - st, -7, 2, 6, '#3a3430'); k.R(-2 + st + shake, -2, 3, 2, BOOT); k.R(1 - st, -2, 3, 2, BOOT);
  k.R(-6, -14, 3, 6, '#8a6a44'); k.P(-6, -14, '#a88a5c'); k.P(-5, -12, BRASS.c);                        // a small round shield
  k.poly([[-3, -15], [3, -15], [4, -6], [-4, -6]], C);
  k.R(-3, -15, 7, 1, mail); k.R(-1, -12, 2, 2, BRASS.l);
  k.R(3, -14, 2, 5, mail); hand(k, 3, -9, sk);
  const h = s.look < 0 ? k.flip() : k;
  face(h, -1, -20, sk, { ey:1, cheek:'#e89a80' }); h.P(-2, -18, sk.l);
  if(s.helmet){
    h.R(-4, -24, 9, 4, BRASS.c); h.R(-3, -25, 7, 1, BRASS.l); h.P(-4, -24, BRASS.l); h.R(-5, -20, 11, 1, BRASS.d);
    const fl = Math.round(Math.sin(k.t * 3 + s.ph)); h.R(-1, -28, 2, 3, '#e03a3a'); h.P(-2 + fl, -29, '#ff6a5a'); h.P(-3 + fl, -28, '#e03a3a');
  } else {
    h.R(-2, -22, 5, 2, hair); h.P(-2, -23, hair); h.P(1, -23, '#ff9a4a'); h.P(3, -22, hair); h.P(-3, -21, hair);
  }
  if(!s.helmet && every(k.t, 5, .6, s.ph)) k.P(4, -21, '#bfe8ff');
};

/* THE ARCHIVIST · the Keep · his burden. Gaunt and tall in a wine-red robe, half-moon spectacles, a tower of
   tomes strapped to his back higher than his head; the open volume in his hands turns a page. */
D.archivist = (k, s) => {
  const C = pal('#8c2c44', '#b84a64', '#561828'), sk = SKIN.pale, hair = '#b0aab0';
  shadow(k, 14);
  const books = [['#3a5a8a', 7, 3], ['#8a6a2a', 6, 2], ['#6a2a2a', 7, 3], ['#2a5a4a', 6, 2], ['#c8b890', 7, 2], ['#4a3a6a', 5, 3], ['#8a3a2a', 6, 2]];
  let yy = -18; k.R(-6, -18, 1, 16, WOOD.d);
  books.forEach(([col, w, h], i) => { yy -= h; const dx = -10 + (i % 2) - (i === 6 ? 1 : 0); k.R(dx, yy, w, h, col); k.R(dx, yy, w, 1, '#e8dcc0'); k.P(dx + w - 1, yy + h - 1, '#1a1418'); });
  k.R(-10, -24, 8, 1, '#4a3020'); k.R(-10, -32, 8, 1, '#4a3020');
  k.R(-2, -5, 2, 4, '#2a2228'); k.R(1, -5, 2, 4, '#2a2228'); k.R(-2, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT);
  k.poly([[-4, -25], [4, -25], [5, -4], [-5, -4]], C);
  k.R(0, -23, 1, 18, C.d);
  face(k, -1, -30, sk, { h:5, ey:2, nose:true });
  k.R(-3, -31, 3, 5, hair); k.R(-1, -31, 3, 1, hair);
  k.P(0, -28, BRASS.c); k.P(2, -28, BRASS.c); k.P(1, -28, BRASS.d);
  // the open book, and a page that turns
  k.L(2, -23, 4, -18, 2, C.c); hand(k, 3, -18, sk); hand(k, 9, -18, sk);
  k.R(3, -20, 7, 3, C.d); k.R(4, -21, 6, 3, '#f0e6cc'); k.R(6, -21, 1, 3, '#b8ac90');
  const p = ((k.t + s.ph * 3.5) % 3.5) / .5;
  if(p < 1){ const col = Math.round(9 - p * 4); k.R(col, -22 + (p > .3 && p < .7 ? -1 : 0), 1, 3, '#fffaf0'); }
};

/* THE SERVICE KEEPER · the Gaol · "work order". Short, wide, pot-bellied in khaki with brass buttons, a peaked cap
   with a red band; the clipboard, the pencil tapping on it, and now and then an enormous yawn. */
D.servicekeeper = (k, s) => {
  const C = pal('#b08a4e', '#d8b474', '#735830'), sk = SKIN.ruddy, cap = '#6a5230';
  shadow(k, 15);
  k.R(-4, -6, 3, 5, '#4a3e2e'); k.R(1, -6, 3, 5, '#4a3e2e'); k.R(-4, -2, 4, 2, BOOT); k.R(1, -2, 4, 2, BOOT);
  k.L(-5, -18, -6, -11, 2, C.d); hand(k, -7, -11, sk);
  k.poly([[-5, -19], [5, -19], [7, -13], [6, -6], [-6, -6], [-6, -13]], C);
  k.R(-5, -7, 11, 1, '#3a2a1a'); k.P(0, -7, BRASS.l);
  k.P(3, -17, BRASS.l); k.P(5, -14, BRASS.l); k.P(5, -11, BRASS.l);
  const yawn = every(k.t, 7, .9, s.ph);
  face(k, -1, -24, sk, { h:5, ey:2, eyes:!yawn, nose:true });
  if(!yawn){ k.P(0, -23, sk.d); k.P(2, -23, sk.d); }
  k.R(-1, -20, 5, 1, sk.c); k.R(1, -21, 3, 1, '#6a4028');
  if(yawn){ k.R(1, -21, 2, 2, '#5a2020'); k.P(0, -22, EYE); k.P(2, -22, EYE); }
  k.R(-3, -27, 7, 3, cap); k.R(-3, -27, 7, 1, '#8a6e44'); k.R(-3, -25, 7, 1, '#c8342c'); k.R(2, -24, 4, 1, '#1a1414'); k.P(1, -26, BRASS.l);
  k.R(6, -17, 4, 7, '#8a6a44'); k.R(7, -16, 2, 5, '#f0ead8'); k.P(7, -15, '#7a7a7a'); k.P(7, -13, '#7a7a7a');
  hand(k, 5, -12, sk);
  const tap = every(k.t, .9, .15, s.ph) ? 1 : 0;
  k.L(-6, -11, -3, -14 - tap, 1, '#e0c040');
};

/* NIM · Frostfell · the frost tender. The smallest person you lead: a saffron parka, a fur-ringed hood, red mittens,
   breath smoking in the cold, the banked flame held out in its iron cage (raised while you walk together). */
D.nim = (k, s) => {
  const C = pal('#e8a42a', '#ffd064', '#9a6614'), fur = '#f4efe6', sk = SKIN.fair;
  shadow(k, 12);
  const st = stride(k, s, 1);
  k.R(-3 + st, -3, 3, 2, '#5a3a2a'); k.R(1 - st, -3, 3, 2, '#5a3a2a'); k.R(-3 + st, -2, 3, 2, BOOT); k.R(1 - st, -2, 3, 2, BOOT);
  k.poly([[-5, -13], [5, -13], [6, -3], [-6, -3]], C);
  k.R(-6, -4, 12, 1, fur); k.R(0, -12, 1, 8, C.d);
  k.R(-4, -19, 8, 7, C.c); k.R(-4, -19, 8, 1, C.l); k.P(-4, -18, C.l);
  k.R(-1, -18, 5, 5, fur); face(k, 0, -17, sk, { w:3, h:3, ey:0, cheek:'#f09090' });
  if(every(k.t, 2.3, .7, s.ph)){ const p = ((k.t + s.ph * 2.3) % 2.3) / .7; k.alpha(.6 * (1 - p), () => { k.P(4 + Math.round(p * 3), -15 - Math.round(p * 2), '#ffffff'); k.P(5 + Math.round(p * 3), -15 - Math.round(p * 2), '#e8f4ff'); }); }
  // the flame in its cage
  const up = s.follow ? 5 : s.done ? -1 : 2;
  k.L(3, -11, 6, -8 - up, 2, C.c); k.R(5, -9 - up, 2, 2, '#c8402c');
  const lx = 7, ly = -12 - up;
  k.R(lx - 1, ly - 2, 5, 1, IRON.l); k.R(lx - 1, ly - 1, 5, 6, '#3c3a38'); k.R(lx, ly, 3, 4, '#ff9a3a'); k.R(lx + 1, ly + 1, 1, 3, '#fff0c0'); k.P(lx + 1, ly - 3, IRON.c);
  flame(k, lx + 1, ly + 1, false);
  k.glow(lx + 1, ly + 2, s.follow ? 40 : 26, '239,177,100', s.follow ? .3 : .2);
};

/* THE FROSTFELL WOMAN · Frostfell · the perfect day. Tiny and bent double under a dusty-rose patchwork quilt, a
   white bun, a cane; the glued blue cup held close, steaming. At the end she sits in the dreadful chair. */
D.frostwoman = (k, s) => {
  const C = pal('#c46e8a', '#e894ae', '#7e4058'), sk = SKIN.fair, hair = '#f0ece8', cup = pal('#4a7ac8', '#8ab0f0', '#2a4a88');
  shadow(k, 12);
  const b = s.sit ? -5 : 0;
  if(s.sit){ stool(k, -6, 6, 11); k.R(2, -7, 4, 2, '#4a3a44'); k.R(4, -5, 2, 4, '#4a3a44'); }
  else { k.R(-4, b - 5, 8, 4, '#4a3a44'); k.R(-3, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT); }
  const tremble = every(k.t, 3, .4, s.ph) ? Math.round(Math.sin(k.t * 30) * .6) : 0;
  k.poly([[-6, b - 12], [-2, b - 16], [3, b - 14], [5, b - 4], [-6, b - 3]], C);
  k.P(-4, b - 11, C.l); k.R(-3, b - 8, 2, 2, '#e8b0c0'); k.R(1, b - 11, 2, 2, C.d); k.R(-1, b - 5, 2, 2, '#d88aa4'); k.P(3, b - 7, C.l);
  face(k, 3 + tremble, b - 15, sk, { w:3, h:4, ey:1, nose:true });
  k.R(1 + tremble, b - 16, 3, 2, hair); k.P(0 + tremble, b - 17, hair); k.P(1 + tremble, b - 17, '#ffffff');
  if(!s.sit){ k.R(8, b - 11, 1, 10, WOOD.c); k.P(7, b - 12, WOOD.l); hand(k, 7, b - 11, sk); }
  k.R(3, b - 9, 3, 3, cup.c); k.R(3, b - 9, 3, 1, cup.l); k.P(6, b - 8, cup.d); hand(k, 2, b - 8, sk);
  steam(k, 4, b - 10, 3, 6, s.ph);
};

/* THE CREATURE KEEPER · the White Court · a little winter. Round as a stove in an amber padded coat, big goggles,
   enormous fireproof mitts; the long tongs open and close, and embers spit from them. */
D.creaturekeeper = (k, s) => {
  const C = pal('#e08a2a', '#ffb452', '#8e5214'), sk = SKIN.brown, mitt = '#6a4a30';
  shadow(k, 16);
  const b = s.sit ? -5 : 0;
  if(s.sit){ stool(k, -7, 6, 14); }
  k.R(-4, -3, 4, 2, BOOT); k.R(1, -3, 4, 2, BOOT); k.R(-4, -2, 4, 2, BOOT); k.R(1, -2, 4, 2, BOOT);
  k.poly([[-6, b - 17], [6, b - 17], [8, b - 9], [6, b - 2], [-6, b - 2], [-8, b - 9]], C);
  k.R(-7, b - 12, 15, 1, C.d); k.R(-6, b - 7, 13, 1, C.d); k.R(-1, b - 16, 1, 14, C.d); k.R(-5, b - 17, 11, 2, '#f4e0c0');
  k.R(-8, b - 11, 3, 4, mitt); k.P(-8, b - 11, '#8a6a48');
  face(k, -1, b - 21, sk, { ey:1, eyes:false, mouth:'#5a3020' });
  k.R(-3, b - 24, 7, 3, '#6a4a30'); k.R(-3, b - 24, 7, 1, '#8e6a48'); k.R(-4, b - 21, 2, 4, '#6a4a30'); k.P(-4, b - 18, '#8e6a48');
  k.R(0, b - 21, 2, 2, BRASS.c); k.R(2, b - 21, 2, 2, BRASS.c); k.P(0, b - 20, '#9ff0ff'); k.P(3, b - 20, '#9ff0ff');
  // the tongs
  const open = Math.round((Math.sin(k.t * 2.8 + s.ph) + 1) * 1.2);
  k.R(5, b - 12, 3, 4, mitt); k.P(5, b - 12, '#8a6a48');
  k.L(7, b - 11, 14, b - 17 - open, 1, IRON.l); k.L(7, b - 10, 14, b - 15 + open, 1, IRON.c);
  if(open > 1){ k.P(15, b - 16, '#ffb040'); k.glow(15, b - 16, 6, '255,160,80', .3); }
};

/* THE FOUNDRY WORKERS · Emberdeep · the quota. The speaker for the crew: soot-black overalls with a hazard-yellow
   stripe, the crew's yellow hard hat, goggles round the neck, the tally board he chalks another mark on. */
D.foundry = (k, s) => {
  const C = pal('#2e2c2e', '#4c484c', '#1a181a'), Y = pal('#e8c020', '#fff070', '#9a7a10'), sk = SKIN.soot;
  shadow(k, 13);
  const b = s.sit ? 0 : 0;
  if(s.sit){ stool(k, -6, 6, 11); k.R(1, -7, 5, 2, C.c); k.R(4, -5, 2, 4, C.c); k.R(4, -2, 3, 2, BOOT); }
  else { k.R(-3, -7, 3, 6, C.c); k.R(1, -7, 3, 6, C.c); k.R(-3, -2, 4, 2, BOOT); k.R(1, -2, 4, 2, BOOT); }
  k.L(-5, b - 17, -6, b - 10, 2, C.d); k.R(-7, b - 10, 3, 3, '#8a5a30');
  k.poly([[-5, b - 18], [5, b - 18], [5, b - 6], [-5, b - 6]], C);
  k.R(-5, b - 12, 10, 1, Y.c); k.R(-2, b - 17, 5, 4, C.l);
  face(k, -1, b - 23, sk, { h:5, ey:2, nose:true }); k.P(2, b - 20, '#5a4a40'); k.P(-1, b - 22, '#7a6a5a');
  k.R(-1, b - 18, 5, 1, '#6a8a8a'); k.P(0, b - 18, '#9fe0e0');
  k.R(-3, b - 26, 7, 3, Y.c); k.R(-2, b - 27, 5, 1, Y.l); k.P(-3, b - 26, Y.l); k.R(-4, b - 24, 9, 1, Y.d);
  // the tally board
  k.R(6, b - 21, 5, 8, '#5a4030'); k.R(7, b - 20, 3, 6, '#2a2a28');
  const marks = 3 + (((k.t + s.ph * 5) / 5) | 0) % 2;
  for(let i = 0; i < marks; i++) k.R(7 + (i % 3), b - 19 + (i > 2 ? 3 : 0), 1, 2, '#e8e4d8');
  k.L(4, b - 17, 6, b - 15, 2, C.c); k.R(5, b - 15, 3, 3, '#8a5a30');
};
/* THE BREAKER · Emberdeep · a supporting speaker. Huge and bare-armed, a grey singlet, a red neckerchief, the crew
   hat, the pick on his shoulder. */
D.breaker = (k, s) => {
  const C = pal('#6a6a70', '#8e8e94', '#46464c'), Y = pal('#e8c020', '#fff070', '#9a7a10'), sk = SKIN.deep;
  shadow(k, 16);
  const b = s.sit ? 2 : 0;
  if(s.sit){ stool(k, -7, 6, 13); k.R(1, -7, 6, 3, '#3a3430'); k.R(5, -5, 3, 4, '#3a3430'); k.R(5, -2, 4, 2, BOOT); }
  else { k.R(-5, -8, 4, 7, '#3a3430'); k.R(1, -8, 4, 7, '#3a3430'); k.R(-5, -2, 5, 2, BOOT); k.R(1, -2, 5, 2, BOOT); }
  k.L(-7, b - 21, -8, b - 12, 3, sk.c); k.R(-9, b - 12, 3, 3, sk.d);
  k.poly([[-7, b - 23], [7, b - 23], [6, b - 8], [-6, b - 8]], C);
  k.R(-3, b - 24, 7, 2, '#c8342c'); k.P(3, b - 22, '#c8342c');
  face(k, -1, b - 29, sk, { h:5, ey:2, nose:true, eye:'#fff0e0' }); k.R(-1, b - 25, 4, 1, '#2a1a12');
  k.R(-3, b - 32, 7, 3, Y.c); k.R(-2, b - 33, 5, 1, Y.l); k.R(-4, b - 30, 9, 1, Y.d);
  // the pick over the shoulder
  k.L(5, b - 20, -5, b - 30, 1, WOOD.c); k.L(-8, b - 26, -3, b - 34, 2, IRON.c); k.P(-3, b - 34, IRON.l);
  k.L(6, b - 21, 5, b - 22, 3, sk.c); k.R(4, b - 23, 3, 3, sk.c);
};

/* THE WAR AUTOMATON · the Foundry. Twice the knight's height, hunched: an iron boiler of a body in brass bands, the
   furnace grate in its chest breathing light, a cyan visor slit, piston legs, fists to its knees, smoke from the
   stack on its back. */
D.automaton = (k, s) => {
  const I = pal('#4a5058', '#747c86', '#2a2e34'), eye = '#8ff0ff';
  shadow(k, 26);
  for(let i = 0; i < 3; i++){ const p = (k.t * .35 + i / 3 + s.ph) % 1; k.alpha((1 - p) * .55, () => k.R(-8 + Math.round(Math.sin(p * 5 + i) * 1.5) - (p * 3 | 0), -44 - Math.round(p * 12), 2 + (p * 3 | 0), 2 + (p * 2 | 0), '#8a8a90')); }
  k.R(-9, -43, 3, 10, I.c); k.R(-9, -43, 1, 10, I.l); k.R(-10, -44, 5, 1, BRASS.c);
  k.L(-9, -30, -11, -16, 4, I.d); k.R(-13, -16, 5, 5, I.d); k.R(-13, -16, 5, 1, BRASS.d);
  k.R(-7, -11, 4, 10, I.c); k.R(2, -11, 4, 10, I.c); k.R(-7, -11, 4, 1, I.l); k.R(2, -11, 4, 1, I.l);
  k.R(-7, -9, 4, 2, BRASS.c); k.R(2, -9, 4, 2, BRASS.c); k.R(-8, -2, 6, 2, I.d); k.R(1, -2, 7, 2, I.d);
  k.poly([[-10, -31], [8, -33], [10, -13], [-9, -11]], I);
  k.R(-9, -26, 19, 1, BRASS.c); k.R(-9, -17, 19, 1, BRASS.c); k.R(-9, -26, 19, 1, BRASS.l);
  for(const [dx, dy] of [[-7, -29], [6, -30], [-7, -14], [8, -15], [-1, -30]]) k.P(dx, dy, BRASS.l);
  const pulse = (Math.sin(k.t * 2.2 + s.ph) + 1) / 2;
  k.R(-3, -24, 7, 5, '#1a1010'); k.R(-2, -23, 5, 1, pulse > .5 ? '#ffd07a' : '#ff8a3a'); k.R(-2, -21, 5, 1, '#ff8a3a');
  k.glow(0, -21, 12 + pulse * 6, '255,138,58', .25 + pulse * .15);
  k.R(3, -38, 7, 6, I.c); k.R(3, -38, 7, 1, I.l); k.R(5, -36, 5, 1, eye); k.glow(8, -36, 6, '143,240,255', .35);
  k.L(8, -30, 11, -15, 4, I.c); k.R(9, -15, 6, 5, I.c); k.R(9, -15, 6, 1, BRASS.l);
};

/* THE NEIGHBORS · the Inversion. Downstairs: a pink bathrobe, grey hair in a bun, and the broom, raised to thump on
   the ceiling (it does, now and then). Upstairs, standing on the other floor: an aqua dressing gown, pink curlers,
   the kettle, steaming. */
D.neighbor = (k, s) => {
  const C = pal('#e0789e', '#ffa0c0', '#984464'), sk = SKIN.fair, hair = '#b8b4b0';
  shadow(k, 13);
  k.R(-3, -2, 3, 2, '#f0d0e0'); k.R(1, -2, 3, 2, '#f0d0e0');
  k.L(-5, -18, -6, -11, 2, C.d); hand(k, -7, -11, sk);
  k.poly([[-5, -19], [5, -19], [6, -2], [-6, -2]], C);
  k.R(-5, -11, 11, 1, C.d); k.R(4, -12, 2, 4, C.d); k.R(-2, -18, 3, 6, C.l);
  face(k, -1, -24, sk, { h:5, ey:2, nose:true, mouth:'#a05060' });
  k.R(-3, -25, 4, 3, hair); k.R(-4, -27, 3, 3, hair); k.P(-3, -27, '#d8d4d0');
  const thump = every(k.t, 1.8, .18, s.ph) ? -2 : 0;
  k.L(5, -18, 6, -26, 2, C.c); hand(k, 5, -27 + thump, sk);
  k.R(6, -44 + thump, 1, 38, WOOD.c); k.R(4, -48 + thump, 5, 4, '#c8a050'); k.R(4, -48 + thump, 5, 1, '#e8c878');
  if(thump) { k.P(3, -49, '#fff4d0'); k.P(9, -49, '#fff4d0'); }
};
D.upstairs = (k, s) => {
  const C = pal('#3cbccc', '#7ae4f0', '#1e7a88'), sk = SKIN.tan, hair = '#5a3a2a';
  shadow(k, 12);
  k.R(-3, -2, 3, 2, '#e8e0d0'); k.R(1, -2, 3, 2, '#e8e0d0');
  k.poly([[-4, -18], [4, -18], [6, -2], [-6, -2]], C);
  k.R(-4, -10, 9, 1, C.d); k.R(-1, -17, 3, 6, C.l);
  face(k, -1, -23, sk, { h:5, ey:2, nose:true, mouth:'#8a4a3a' });
  k.R(-3, -24, 6, 2, hair); k.R(-3, -22, 2, 3, hair);
  for(const [dx, dy] of [[-3, -25], [0, -25], [2, -24], [-4, -23]]) k.P(dx, dy, '#ff8ab4');
  k.L(-4, -17, -5, -11, 2, C.d); hand(k, -6, -11, sk);
  k.L(4, -17, 6, -12, 2, C.c); hand(k, 6, -12, sk);
  k.R(7, -14, 5, 4, '#c8c4bc'); k.R(7, -14, 5, 1, '#f0ece4'); k.R(12, -13, 2, 1, '#c8c4bc'); k.P(9, -15, '#8a8680');
  steam(k, 13, -14, 3, 6, s.ph);
  if(s.good){ k.R(-11, -10, 4, 2, '#dfd4bd'); k.P(-10, -11, '#b8a6ed'); }
};

/* THE FIGURE · the Paradox Citadel. Taller than anyone, a silver veil over a faceless dark with two gold points
   for eyes, a gold ring above its head; it does not quite touch the floor, and its hem moves on no wind. */
D.figure = (k, s) => {
  const C = pal('#c8cee2', '#f4f6ff', '#8a90a8'), gold = '#f0cc6a';
  const bob = Math.round(Math.sin(k.t * 1.6 + s.ph) * 1) - 2;
  k.alpha(.45, () => shadow(k, 10));
  k.alpha(.82, () => {
    const hem = [];
    for(let i = 0; i <= 6; i++){ const w = Math.round(Math.sin(k.t * 3 + i * 1.3 + s.ph)); hem.push([6 - i * 2, bob - 1 - (i % 2 ? 2 + w : 0)]); }
    k.poly([[-3, bob - 29], [3, bob - 29], [5, bob - 18], [6, bob - 1]].concat(hem).concat([[-6, bob - 1], [-5, bob - 18]]), C);
    k.R(-3, bob - 34, 6, 6, C.c); k.R(-2, bob - 35, 4, 1, C.l); k.P(-3, bob - 34, C.l);
    k.R(-1, bob - 32, 4, 4, '#1e1c2c'); k.P(0, bob - 31, gold); k.P(2, bob - 31, gold);
    k.R(-1, bob - 20, 3, 3, '#fff4d0'); k.glow(0, bob - 19, 12, '255,230,160', .3);
  });
  const rp = Math.sin(k.t * 2 + s.ph) > 0 ? 0 : 1;
  k.R(-3, bob - 38 - rp, 7, 1, gold); k.P(-4, bob - 37 - rp, gold); k.P(4, bob - 37 - rp, gold); k.glow(0, bob - 38, 8, '240,204,106', .25);
};

/* THE BELLKEEPER · the Drowned Throne. Built like the bell he rings: narrow shoulders, a teal robe flaring wide at
   the hem, a little brass bell of a cap; the handbell swings, and every few beats it rings. */
D.bellkeeper = (k, s) => {
  const C = pal('#1f8a80', '#48b8aa', '#12544e'), sk = SKIN.brown;
  shadow(k, 18);
  const b = s.sit ? -5 : 0;
  if(s.sit) stool(k, -8, 6, 16);
  k.poly([[-3, b - 22], [3, b - 22], [5, b - 12], [9, b - 1], [-9, b - 1], [-5, b - 12]], C);
  k.R(-8, b - 3, 17, 1, BRASS.c); k.R(-4, b - 16, 9, 1, C.d);
  face(k, -1, b - 27, sk, { h:5, ey:2, nose:true }); k.R(-2, b - 23, 5, 1, '#e8e4dc');
  k.R(-2, b - 30, 5, 3, BRASS.c); k.R(-1, b - 31, 3, 1, BRASS.l); k.P(0, b - 32, BRASS.l); k.R(-3, b - 27, 7, 1, BRASS.d);
  const ring = every(k.t, 3, .7, s.ph), sw = ring ? Math.round(Math.sin(k.t * 22) * 2) : Math.round(Math.sin(k.t * 1.5 + s.ph));
  k.L(3, b - 20, 7, b - 24, 2, C.c); hand(k, 7, b - 26, sk);
  k.R(8 + sw, b - 24, 1, 2, WOOD.c); k.R(6 + sw, b - 22, 5, 3, BRASS.c); k.R(5 + sw, b - 19, 7, 1, BRASS.l); k.P(8 + sw, b - 18, BRASS.d);
  if(ring){ const p = ((k.t + s.ph * 3) % 3) / .7; k.alpha(1 - p, () => { const r = 3 + Math.round(p * 4); k.P(8 + r, b - 21 - r, '#fff0c0'); k.P(9 + r, b - 20, '#fff0c0'); k.P(8 + r, b - 19 + r, '#fff0c0'); }); k.glow(8, b - 21, 8, '255,220,140', .25); }
};
/* The Throne's defenders: steel, dented, dead on their feet — the tired one leans on a crimson shield with his eyes
   shut; the lookout stands taller, spyglass to the eye. */
D.defender = (k, s) => {
  const S = pal('#8a9098', '#c4cad2', '#50565e'), sk = SKIN.ruddy, crimson = pal('#9a2a2e', '#c84a4a', '#5a1418');
  shadow(k, 14);
  const b = s.sit ? 0 : 0;
  if(s.sit){ stool(k, -6, 6, 11); k.R(1, -7, 5, 2, '#3a3a40'); k.R(4, -5, 2, 4, '#3a3a40'); k.R(4, -2, 3, 2, BOOT); }
  else { k.R(-3, -7, 3, 6, '#3a3a40'); k.R(1, -7, 3, 6, '#3a3a40'); k.R(-3, -2, 4, 2, BOOT); k.R(1, -2, 4, 2, BOOT); }
  k.poly([[-5, b - 19], [5, b - 19], [6, b - 6], [-6, b - 6]], S);
  k.R(-5, b - 19, 11, 2, crimson.c); k.P(4, b - 17, crimson.c); k.R(-5, b - 11, 11, 1, S.d);
  const nod = every(k.t, 4, 1.5, s.ph) ? 1 : 0;
  face(k, 0, b - 23 + nod, sk, { h:4, ey:1, eyes:false, nose:true }); k.R(1, b - 22 + nod, 3, 1, sk.d);
  k.R(-3, b - 26 + nod, 7, 3, S.c); k.R(-2, b - 27 + nod, 5, 1, S.l); k.R(-4, b - 23 + nod, 2, 3, S.d); k.P(2, b - 25 + nod, S.d);
  k.R(6, b - 18, 5, 12, crimson.c); k.R(6, b - 18, 5, 1, crimson.l); k.R(8, b - 17, 1, 10, '#e8dcc8'); k.R(7, b - 6, 3, 1, crimson.d);
  hand(k, 5, b - 14, sk);
};
D.lookout = (k, s) => {
  const S = pal('#8a9098', '#c4cad2', '#50565e'), sk = SKIN.fair, scarf = pal('#d0a030', '#f4cc5a', '#8a6614');
  shadow(k, 12);
  const b = s.sit ? 2 : 0;
  if(s.sit){ stool(k, -6, 6, 11); k.R(1, -7, 5, 2, '#3a3a40'); k.R(4, -5, 2, 4, '#3a3a40'); k.R(4, -2, 3, 2, BOOT); }
  else { k.R(-3, -9, 2, 8, '#3a3a40'); k.R(1, -9, 2, 8, '#3a3a40'); k.R(-3, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT); }
  k.poly([[-4, b - 22], [4, b - 22], [5, b - 8], [-5, b - 8]], S);
  k.R(-4, b - 22, 9, 2, scarf.c); k.R(-6, b - 21, 2, 5, scarf.c); k.P(-6, b - 21, scarf.l);
  face(k, -1, b - 27, sk, { h:5, ey:2 }); k.P(2, b - 25, sk.c);
  k.R(-3, b - 30, 7, 3, S.c); k.R(-2, b - 31, 5, 1, S.l); k.R(-3, b - 27, 1, 3, S.d);
  const sweep = s.sit ? 2 : Math.round(Math.sin(k.t * .9 + s.ph) * 1.2);
  k.L(3, b - 20, 5, b - 25 + sweep, 2, S.c); hand(k, 4, b - 26 + sweep, sk);
  k.R(4, b - 26 + sweep, 7, 2, BRASS.c); k.R(4, b - 26 + sweep, 7, 1, BRASS.l); k.P(11, b - 26 + sweep, '#bff4ff');
};
D.volunteer = (k, s) => {
  const C = pal('#ece6d6', '#ffffff', '#b8b0a0'), sk = SKIN.tan;
  shadow(k, 10);
  k.R(-2, -7, 2, 6, '#5a4a3a'); k.R(1, -7, 2, 6, '#5a4a3a'); k.R(-2, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT);
  k.poly([[-4, -17], [4, -17], [4, -6], [-4, -6]], C);
  face(k, -1, -22, sk, { h:5, ey:2 }); k.R(-3, -23, 6, 2, '#2a1a12'); k.R(-3, -21, 2, 2, '#2a1a12');
  k.L(3, -16, 6, -21, 2, C.c); hand(k, 5, -22, sk); k.R(6, -28, 1, 7, WOOD.c); flame(k, 6, -29, true); k.glow(6, -30, 14, '255,180,90', .3);
};

/* THE MINER · the Deep Line. Stooped under the low roof: rust-red overalls, a yellow hard hat with a lamp whose
   beam sweeps the dark, the pick over his shoulder. Behind bars, until you raise them. */
D.miner = (k, s) => {
  const C = pal('#b04a2a', '#d8704a', '#6a2a14'), Y = pal('#e8c020', '#fff070', '#9a7a10'), sk = SKIN.soot;
  shadow(k, 13);
  k.R(-3, -7, 3, 6, C.d); k.R(1, -7, 3, 6, C.d); k.R(-3, -2, 4, 2, BOOT); k.R(1, -2, 4, 2, BOOT);
  k.L(-2, -12, -9, -26, 1, WOOD.c); k.L(-12, -24, -7, -29, 2, IRON.c); k.P(-7, -29, IRON.l); k.P(-12, -24, IRON.l);
  k.poly([[-5, -17], [4, -18], [5, -6], [-5, -6]], C);
  k.R(-3, -16, 1, 10, C.d); k.R(2, -16, 1, 10, C.d); k.R(-2, -15, 4, 3, C.l);
  k.L(3, -16, 5, -11, 2, C.c); hand(k, 4, -11, sk);
  face(k, 0, -21, sk, { h:4, ey:1, nose:true }); k.R(0, -18, 4, 1, '#5a4a40');
  k.R(-3, -24, 7, 3, Y.c); k.R(-2, -25, 5, 1, Y.l); k.R(-4, -22, 9, 1, Y.d);
  k.R(3, -24, 2, 2, '#fffbe0');
  const a = Math.sin(k.t * .7 + s.ph) * .25;
  k.alpha(.18, () => { for(let i = 2; i < 14; i++){ const yy = Math.round(-23 + Math.tan(a) * i), w = 1 + (i >> 2); k.R(4 + i, yy - (w >> 1), 1, w, '#fff6c8'); } });
  k.glow(5, -23, 8, '255,246,200', .4);
  if(s.caged){ const top = -32; k.R(-12, top, 25, 1, IRON.c); k.R(-12, -1, 25, 1, IRON.d);
    for(const bx of [-12, -7, 0, 7, 12]){ k.R(bx, top, 1, 32, IRON.c); k.P(bx, top, IRON.l); } }
};

/* THE SAILORS · Thunder Cliffs. The speaker: a yellow oilskin and the long-tailed sou'wester, a grey beard, a coil
   of rope over his shoulder; rain runs off the brim. The stranded one clings to the spar in a red-and-white
   striped jersey and a red knit cap, waving. */
D.sailor = (k, s) => {
  const Y = pal('#e8b820', '#ffe070', '#9a7410'), sk = SKIN.ruddy, beard = '#c8c4bc', rope = pal('#7a5430', '#b08a58', '#4e3420');
  shadow(k, 14);
  const b = s.sit ? -1 : 0;
  if(s.sit){ stool(k, -6, 6, 12); k.R(1, -7, 5, 2, '#2a2a2c'); k.R(4, -5, 2, 4, '#2a2a2c'); k.R(4, -2, 3, 2, BOOT); }
  else { k.R(-4, -6, 3, 5, '#2a2a2c'); k.R(1, -6, 3, 5, '#2a2a2c'); k.R(-4, -2, 4, 2, BOOT); k.R(1, -2, 4, 2, BOOT); }
  k.L(-5, b - 18, -6, b - 10, 2, Y.d); hand(k, -7, b - 10, sk);
  k.poly([[-5, b - 19], [5, b - 19], [7, b - 5], [-7, b - 5]], Y);
  k.R(0, b - 18, 1, 13, Y.d); k.P(2, b - 15, '#3a3a3a'); k.P(2, b - 11, '#3a3a3a');
  for(let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2; k.P(Math.round(-1 + Math.cos(a) * 4), Math.round(b - 14 + Math.sin(a) * 3), i % 2 ? rope.c : rope.l); }
  face(k, -1, b - 24, sk, { h:5, ey:1, nose:true }); k.R(-1, b - 21, 5, 3, beard); k.P(-1, b - 21, '#e8e4dc');
  k.R(-3, b - 27, 7, 3, Y.c); k.R(-2, b - 28, 5, 1, Y.l); k.R(-3, b - 24, 8, 1, Y.d); k.R(-6, b - 24, 4, 2, Y.c); k.P(-6, b - 23, Y.d);
  const p = ((k.t + s.ph * 1.4) % 1.4) / 1.4; k.alpha(1 - p, () => k.P(-6, b - 21 + Math.round(p * 8), '#bfe0ff'));
  k.L(5, b - 18, 7, b - 11, 2, Y.c); hand(k, 6, b - 11, sk);
};
D.stranded = (k, s) => {
  const sk = SKIN.tan, red = '#c8342c', white = '#ece4d4';
  shadow(k, 10);
  k.R(-3, -7, 2, 6, '#8a8068'); k.R(1, -7, 2, 6, '#8a8068'); k.R(-3, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT);
  k.poly([[-4, -17], [4, -17], [4, -6], [-4, -6]], pal(white, '#ffffff', '#b8b0a0'));
  for(let yy = -15; yy < -6; yy += 2) k.R(-4, yy, 8, 1, red);
  face(k, -1, -22, sk, { h:5, ey:2, mouth:'#8a3a2a' }); k.R(-3, -24, 7, 3, red); k.P(0, -25, '#e85a4a'); k.R(-3, -21, 2, 1, '#3a2a1a');
  const wave = Math.round(Math.sin(k.t * 7 + s.ph) * 1.5);
  if(s.perched){ k.L(3, -16, 5 + wave, -24, 2, white); hand(k, 4 + wave, -26, sk); k.L(-3, -16, -5, -23, 2, white); hand(k, -6, -25, sk); }
  else { k.L(3, -16, 6 + wave, -23, 2, white); hand(k, 5 + wave, -25, sk); k.L(-3, -16, -4, -10, 2, white); hand(k, -5, -10, sk); }
};

/* THE ORGANIZER · the Landing Shores · a birthday. Hot pink, a striped paper party hat with a bobble, a string of
   bunting over one shoulder, the little cake with its candle flickering. */
D.organizer = (k, s) => {
  const C = pal('#e2508e', '#ff84b4', '#98285a'), sk = SKIN.deep, flags = ['#f0d040', '#48c0d8', '#ffffff', '#f07030'];
  shadow(k, 13);
  k.R(-3, -2, 3, 2, '#5a2a3a'); k.R(1, -2, 3, 2, '#5a2a3a');
  k.poly([[-4, -19], [4, -19], [7, -2], [-7, -2]], C);
  k.R(-5, -12, 11, 1, C.d);
  for(let i = 0; i < 7; i++){ const dx = -5 + i * 2, dy = -18 + Math.round(i * 1.4); k.P(dx, dy, flags[i % 4]); k.P(dx, dy + 1, flags[i % 4]); }
  k.L(-4, -18, -6, -11, 2, C.d); hand(k, -7, -11, sk);
  face(k, -1, -24, sk, { h:5, ey:2, mouth:'#f0a0a0' }); k.R(-3, -24, 3, 5, '#1a1010'); k.P(-4, -22, '#1a1010');
  const hat = [['#f0d040', 5], ['#48c0d8', 3], ['#f0d040', 1]];
  hat.forEach(([col, w], i) => k.R(-1 + ((5 - w) >> 1), -26 - i * 2, w, 2, col));
  k.P(1, -31 + (Math.sin(k.t * 4 + s.ph) > .6 ? -1 : 0), '#ff84b4');
  k.L(4, -18, 6, -13, 2, C.c); hand(k, 5, -13, sk);
  k.R(6, -15, 6, 3, '#f4e8d0'); k.R(6, -15, 6, 1, '#ff9ac0'); k.R(9, -17, 1, 2, '#f8f0ff'); flame(k, 9, -18, false);
  k.glow(9, -19, 6, '255,200,120', .3);
};
D.soldier = (k, s) => {
  const S = pal('#8a9098', '#c4cad2', '#50565e'), cloak = pal('#8a2a2a', '#b84444', '#561818'), sk = SKIN.tan;
  shadow(k, 13);
  const b = s.sit ? 2 : 0;
  k.L(8, -1, 8, -34, 1, WOOD.c); k.P(8, -35, S.l); k.R(7, -34, 3, 2, S.l);
  if(s.sit){ stool(k, -6, 6, 11); k.R(1, -7, 5, 2, '#3a3430'); k.R(4, -5, 2, 4, '#3a3430'); k.R(4, -2, 3, 2, BOOT); }
  else { k.R(-3, -8, 3, 7, '#3a3430'); k.R(1, -8, 3, 7, '#3a3430'); k.R(-3, -2, 4, 2, BOOT); k.R(1, -2, 4, 2, BOOT); }
  k.poly([[-6, b - 20], [-2, b - 20], [-4, b - 5], [-8, b - 6]], cloak);
  k.poly([[-4, b - 20], [4, b - 20], [5, b - 8], [-5, b - 8]], S);
  k.R(-4, b - 13, 9, 1, '#3a2a24');
  face(k, -1, b - 25, sk, { h:5, ey:2, nose:true });
  k.R(-3, b - 28, 7, 3, S.c); k.R(-2, b - 29, 5, 1, S.l); k.R(-4, b - 25, 9, 1, S.d); k.R(1, b - 30, 1, 2, cloak.l);
  k.L(4, b - 19, 7, b - 14, 2, S.c); hand(k, 7, b - 15, sk);
};

/* THE MOTHER · the Colony. A deep teal headscarf and dress, the baby in a cream sling at her chest (a tiny hand
   waves), a clay water jar balanced on her head; she rocks from foot to foot. */
D.mother = (k, s) => {
  const C = pal('#1e7a78', '#44a8a2', '#0e4a48'), sk = SKIN.brown, jar = pal('#c07040', '#e09060', '#7a4020');
  shadow(k, 13);
  const rock = Math.round(Math.sin(k.t * 1.8 + s.ph) * .8);
  k.R(-3, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT);
  k.poly([[-4 + rock, -21], [4 + rock, -21], [6, -2], [-6, -2]], C);
  k.R(-5, -3, 11, 1, C.d);
  k.R(1 + rock, -17, 5, 5, '#efe6d2'); k.R(1 + rock, -17, 5, 1, '#fffaf0'); k.R(3 + rock, -16, 2, 2, SKIN.fair.c); k.L(-3 + rock, -21, 2 + rock, -15, 1, '#d8ccb0');
  if(every(k.t, 2.5, 1, s.ph)) k.P(5 + rock, -18, SKIN.fair.c);
  k.L(3 + rock, -20, 5 + rock, -15, 2, C.c); hand(k, 5 + rock, -16, sk);
  face(k, 0 + rock, -26, sk, { h:5, ey:2, nose:true });
  k.R(-3 + rock, -27, 6, 2, C.c); k.R(-3 + rock, -25, 3, 5, C.c); k.R(-3 + rock, -27, 6, 1, C.l); k.P(-4 + rock, -22, C.d);
  k.R(-2 + rock, -32, 5, 4, jar.c); k.R(-1 + rock, -33, 3, 1, jar.l); k.R(-2 + rock, -32, 1, 4, jar.l); k.R(-3 + rock, -28, 7, 1, jar.d);
  k.L(-3 + rock, -20, -4 + rock, -28, 2, C.d); hand(k, -5 + rock, -30, sk);
};

/* THE PILGRIM · the Path to the Palace. A saffron robe, a wide straw hat, and a pack taller than he is — bedroll on
   top, a pot hanging off it that swings and clinks; the staff with a bell. He sets the pack down when you are
   cruel, and sits beside it when you are kind. */
D.pilgrim = (k, s) => {
  const C = pal('#e0782a', '#ffa050', '#984a14'), sk = SKIN.deep, straw = pal('#e8cc80', '#fff0b0', '#a88a44');
  shadow(k, 14);
  const b = s.sit ? -5 : 0;
  const pack = (px, py) => {
    k.R(px, py - 20, 8, 20, '#6a4a30'); k.R(px, py - 20, 8, 1, '#8e6a48'); k.R(px + 1, py - 18, 6, 7, '#8a6a44');
    k.R(px - 1, py - 25, 10, 5, '#6a7a8a'); k.R(px - 1, py - 25, 10, 1, '#8a9aaa'); k.R(px + 3, py - 25, 1, 5, '#4a5a6a');
    const sw = Math.round(Math.sin(k.t * 2.4 + s.ph) * 1.4); k.P(px - 1, py - 10, IRON.c); k.R(px - 3 + sw, py - 9, 3, 3, IRON.c); k.P(px - 3 + sw, py - 9, IRON.l);
  };
  if(s.bad) pack(10, -1); else pack(-12, b - 3);
  if(s.sit){ stool(k, -6, 6, 11); k.R(1, -7, 5, 2, C.d); k.R(4, -5, 2, 4, C.d); k.R(4, -2, 3, 2, '#6a4a30'); }
  else { k.R(-3, -2, 3, 2, '#6a4a30'); k.R(1, -2, 3, 2, '#6a4a30'); }
  k.poly([[-4, b - 19], [4, b - 19], [6, b - 2], [-6, b - 2]], C);
  k.R(-4, b - 10, 9, 1, '#6a3a14'); k.L(-4, b - 18, 2, b - 10, 1, '#6a4a30');
  face(k, -1, b - 24, sk, { h:5, ey:2, nose:true, mouth:'#4a2a1a' });
  k.R(-3, b - 26, 7, 2, straw.c); k.R(-2, b - 27, 5, 1, straw.l); k.R(-7, b - 24, 15, 1, straw.c); k.R(-7, b - 24, 15, 1, straw.l); k.P(-7, b - 23, straw.d); k.P(7, b - 23, straw.d);
  if(!s.sit){ const bl = Math.round(Math.sin(k.t * 1.9 + s.ph)); k.R(8, -30, 1, 29, WOOD.c); k.P(8, -31, WOOD.l); k.R(8 + bl, -29, 2, 2, BRASS.c); k.L(4, b - 18, 7, -16, 2, C.c); hand(k, 7, -17, sk); }
};

/* THE PALACE GARDENER · Sunspire. A coral smock, a wide straw sun hat with red flowers on the band, pruning shears
   at the belt, the copper watering can dripping. */
D.gardener = (k, s) => {
  const C = pal('#d8543c', '#ff7e5c', '#8e2e1e'), sk = SKIN.brown, straw = pal('#e8cc80', '#fff0b0', '#a88a44'), can = pal('#c07a3a', '#e8a060', '#7a4418');
  shadow(k, 14);
  const b = s.sit ? -1 : 0;
  if(s.sit){ stool(k, -6, 6, 11); k.R(1, -7, 5, 2, '#4a3a2a'); k.R(4, -5, 2, 4, '#4a3a2a'); k.R(4, -2, 3, 2, BOOT); }
  else { k.R(-3, -6, 2, 5, '#4a3a2a'); k.R(1, -6, 2, 5, '#4a3a2a'); k.R(-3, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT); }
  k.L(-4, b - 17, -5, b - 10, 2, C.d); hand(k, -6, b - 10, sk);
  k.poly([[-4, b - 18], [4, b - 18], [6, b - 5], [-6, b - 5]], C);
  k.R(-2, b - 12, 6, 6, '#e8dcc0'); k.R(-2, b - 12, 6, 1, '#fffaf0'); k.R(-5, b - 10, 2, 4, IRON.l);
  face(k, -1, b - 23, sk, { h:5, ey:2, nose:true });
  k.R(-3, b - 25, 7, 2, straw.c); k.R(-2, b - 26, 5, 1, straw.l); k.R(-7, b - 23, 15, 1, straw.c); k.R(-7, b - 23, 15, 1, straw.l);
  k.P(-2, b - 25, '#e03a3a'); k.P(1, b - 25, '#ffffff'); k.P(3, b - 25, '#e03a3a');
  if(!s.sit){
    k.L(4, b - 17, 6, b - 12, 2, C.c); hand(k, 6, b - 13, sk);
    k.R(7, b - 14, 5, 5, can.c); k.R(7, b - 14, 5, 1, can.l); k.L(11, b - 12, 14, b - 15, 1, can.c); k.R(6, b - 16, 1, 3, can.d);
    const p = ((k.t + s.ph * 1.1) % 1.1) / 1.1; k.alpha(1 - p, () => k.P(15, b - 15 + Math.round(p * 12), '#9fd8f0'));
  }
};

/* ── THE RESIDENTS WHO ONLY TALK ────────────────────────────────────────────────────────────────────────
   Quieter than the quest givers — softer colours, no glow, no marker — but each still has a shape, a colour, a
   thing in the hand and one small motion of their own. */

/* OLAN · Outskirts · the road keeper. Tall and listing to one side on a crutch, a peg for one leg, a knit watch
   cap, a sea-grey-teal greatcoat; the notched tally stick he counts the patrols on (his thumb walks the notches). */
D.olan = (k, s) => {
  const C = pal('#4a7a7c', '#6c9c9a', '#2e5052'), sk = SKIN.ruddy, cap = pal('#3c3a42', '#5a5862', '#26242a');
  shadow(k, 14);
  k.L(-6, -21, -8, -1, 1, WOOD.c); k.R(-9, -22, 4, 1, WOOD.l); k.P(-8, -1, WOOD.d);                 // the crutch
  k.R(-3, -8, 2, 7, '#3a3430'); k.R(-3, -2, 3, 2, BOOT); k.R(1, -8, 2, 4, '#3a3430'); k.R(1, -4, 1, 4, WOOD.l);   // boot, peg
  k.poly([[-6, -25], [2, -25], [5, -8], [-5, -8]], C);
  k.R(0, -23, 1, 15, C.d); k.R(-5, -16, 9, 1, '#2e2a26'); k.P(-5, -24, C.l);
  k.L(-5, -23, -7, -22, 2, C.d);
  // busy: head down over the tally stick, counting the patrols under his breath (the thumb runs the notches)
  const h = s.busy ? k.at(1, 1) : k, count = s.busy ? 3.2 : .8;
  face(h, -2, -30, sk, { h:5, ey:s.busy ? 3 : 2, nose:true }); h.R(-2, -26, 4, 1, '#a8a49c');
  if(s.busy && every(k.t, .5, .25, s.ph)) h.P(1, -26, '#7a4a3a');
  h.R(-4, -32, 6, 3, cap.c); h.R(-3, -33, 4, 1, cap.c); h.R(-4, -32, 6, 1, cap.l); h.R(-4, -30, 6, 1, cap.d);
  const lift = s.busy ? -3 : 0;
  k.L(1, -23, 4, -17 + lift, 2, C.c); hand(k, 4, -18 + lift, sk);
  k.R(6, -23 + lift, 1, 9, WOOD.l); for(let i = 0; i < 4; i++) k.P(6, -22 + lift + i * 2, WOOD.d);
  k.P(5, -22 + lift + (((k.t * count + s.ph * 4) | 0) % 4) * 2, sk.l);
};
/* ORRA · Black Woods · the clock keeper. Small and round-shouldered in dusky plum, a white bun with a pencil through
   it, big round spectacles; her daughter's watch swings on its chain, and now and then goes up to her ear. */
D.orra = (k, s) => {
  const C = pal('#74486c', '#94688c', '#4a2c46'), SH = pal('#8a5c82', '#a87ca0', '#5c3a58'), sk = SKIN.fair, hair = '#dcd8e0';
  shadow(k, 12);
  k.R(-3, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT);
  k.poly([[-4, -17], [4, -17], [6, -1], [-6, -1]], C);
  k.poly([[-5, -18], [4, -18], [5, -12], [-6, -11]], SH); k.P(-6, -11, SH.d); k.P(-4, -10, SH.d); k.P(-2, -11, SH.d);
  face(k, -1, -22, sk, { eyes:false, mouth:'#a06050' });
  k.R(0, -21, 2, 2, '#d8eef4'); k.R(2, -21, 2, 2, '#d8eef4'); k.P(1, -20, EYE); k.P(3, -20, EYE);
  k.R(-3, -23, 6, 1, hair); k.R(-3, -22, 2, 3, hair); k.R(-2, -26, 4, 3, hair); k.P(-2, -26, '#ffffff'); k.L(-4, -27, 1, -25, 1, '#d8a040');
  if(every(k.t, 5, 1.6, s.ph)){ k.L(3, -17, 3, -21, 2, SH.c); hand(k, 3, -22, sk); k.R(4, -23, 3, 3, BRASS.c); k.P(5, -22, '#fff8e0'); }
  else {
    const sw = Math.round(Math.sin(k.t * 2.5 + s.ph) * 1.4);
    k.L(3, -16, 5, -13, 2, SH.c); hand(k, 5, -14, sk);
    k.L(6, -12, 6 + sw, -9, 1, BRASS.l); k.R(5 + sw, -9, 3, 3, BRASS.c); k.P(6 + sw, -8, '#fff8e0'); k.P(6 + sw, -9, BRASS.d);
  }
};
/* PELL · Black Woods · the resin worker. Stocky, sleeves rolled, a sea-green-blue kerchief, a leather apron
   spotted with resin; a yoke over both shoulders with a bucket at each end, one of them dripping amber. */
D.pell = (k, s) => {
  const K2 = pal('#3a94a2', '#62b8c2', '#1e5e6a'), SM = pal('#6a6a70', '#8a8a90', '#46464c'), sk = SKIN.tan, apron = pal('#7a5a3a', '#9a7a52', '#4e3822');
  shadow(k, 16);
  const sw = Math.round(Math.sin(k.t * 1.7 + s.ph) * .8);
  k.R(-4, -7, 3, 6, '#3e3a36'); k.R(1, -7, 3, 6, '#3e3a36'); k.R(-4, -2, 4, 2, BOOT); k.R(1, -2, 4, 2, BOOT);
  k.R(-11, -21, 23, 1, WOOD.l); k.R(-11, -20, 23, 1, WOOD.d);                                            // the yoke
  for(const bx of [-12, 10]){ k.R(bx + 1, -20, 1, 6, '#b09a70'); k.R(bx + sw, -14, 5, 5, WOOD.c); k.R(bx + sw, -14, 5, 1, WOOD.l); k.R(bx + 1 + sw, -14, 3, 1, '#e8a030'); k.R(bx + sw, -11, 5, 1, IRON.c); }
  const p = ((k.t + s.ph * 1.8) % 1.8) / 1.8; k.alpha(1 - p, () => k.P(12 + sw, -9 + Math.round(p * 8), '#e89a2a'));
  k.poly([[-5, -19], [5, -19], [6, -7], [-6, -7]], SM);
  k.R(-3, -15, 7, 9, apron.c); k.R(-3, -15, 7, 1, apron.l); k.P(0, -11, '#e0a030'); k.P(2, -9, '#c07a20'); k.P(-2, -8, '#e0a030');
  k.L(-5, -18, -8, -20, 2, sk.c); hand(k, -9, -21, sk); k.L(5, -18, 8, -20, 2, sk.c); hand(k, 8, -21, sk);
  face(k, -1, -25, sk, { h:5, ey:2, nose:true }); k.R(-3, -22, 2, 2, '#5a3a22');
  k.R(-3, -27, 7, 3, K2.c); k.R(-3, -27, 7, 1, K2.l); k.P(-4, -25, K2.c); k.P(-5, -24 + (sw > 0 ? 1 : 0), K2.d);
};
/* HALE · Black Woods · the quiet veteran. Sat heavy on his bedroll, legs out: a steel-grey gambeson, one dented
   pauldron, the other shoulder bandaged, an eye patch, a cropped grey beard, his helmet on the ground beside him;
   now and then he drinks from the canteen. */
D.hale = (k, s) => {
  const C = pal('#767a82', '#9a9ea6', '#4c5058'), sk = SKIN.ruddy, beard = '#b8b4ac', band = '#e6dcc6';
  shadow(k, 18);
  k.R(-13, -3, 5, 3, IRON.c); k.R(-12, -4, 3, 1, IRON.l); k.R(-13, -1, 6, 1, IRON.d);                      // his helmet
  k.R(-2, -8, 10, 3, '#3e3a36'); k.R(7, -7, 3, 5, BOOT); k.P(7, -7, '#4a3e36');
  k.poly([[-6, -20], [5, -20], [6, -6], [-6, -6]], C);
  k.L(-5, -19, 3, -9, 1, '#5a4030'); k.R(-6, -10, 12, 1, '#4a3424'); k.P(0, -10, BRASS.c);            // baldric and belt
  k.R(-7, -21, 5, 3, IRON.c); k.R(-7, -21, 5, 1, IRON.l); k.P(-3, -19, IRON.d);                              // pauldron
  k.R(3, -20, 3, 5, band); k.R(3, -18, 3, 1, '#c8bca4'); k.R(3, -16, 3, 1, '#c8bca4');                   // bandaged shoulder
  const sip = every(k.t, 5.5, 1.3, s.ph);
  k.L(-5, -17, -3, -9, 2, C.d); hand(k, -3, -10, sk);
  if(sip){ k.L(4, -15, 3, -21, 2, C.c); hand(k, 2, -23, sk); k.R(3, -25, 3, 4, '#8a6a44'); k.P(3, -25, '#a8845a'); }
  else { k.L(4, -15, 6, -11, 2, C.c); hand(k, 6, -11, sk); k.R(8, -13, 3, 4, '#8a6a44'); k.P(8, -13, '#a8845a'); k.P(9, -14, '#c8b890'); }
  face(k, -1, -26, sk, { h:5, ey:2, nose:true });
  k.R(-1, -25, 2, 2, '#1a1418'); k.R(-3, -26, 3, 1, '#2a2020');
  k.R(-3, -27, 5, 2, '#8a8680'); k.R(-3, -25, 2, 2, '#8a8680'); k.R(-1, -22, 5, 2, beard); k.P(3, -23, beard);
};
/* TALLA · the Updrafts · the kite-mender. Wiry in a cream sailcloth smock with a scarlet sash and kerchief, two black
   braids; she flies a scarlet test kite on a line up in the draught, its tail of bows streaming. */
D.talla = (k, s) => {
  const R = pal('#c83c3c', '#ea6a5e', '#822222'), SM = pal('#e2dac6', '#fff8ea', '#aaa290'), sk = SKIN.brown, hair = '#2a1a14';
  const bx = -10 + Math.round(Math.sin(k.t * 1.3 + s.ph) * 2), by = -48 + Math.round(Math.sin(k.t * 2.1 + s.ph) * 1.5);
  k.alpha(.65, () => k.L(4, -19, bx, by + 6, 1, '#f0ead8'));
  [1, 3, 5, 5, 3, 1].forEach((w, i) => k.R(bx - (w >> 1), by + i, w, 1, i < 2 ? R.l : i > 3 ? R.d : R.c));
  k.R(bx, by + 1, 1, 4, '#f4ecd8');
  for(let i = 0; i < 4; i++){ const tx = bx + Math.round(Math.sin(k.t * 4 + s.ph + i) * (1 + i * .4)), ty = by + 7 + i * 2; k.P(tx, ty, i % 2 ? '#f4ecd8' : R.l); }
  shadow(k, 12);
  k.R(-3, -8, 2, 7, '#4a3e36'); k.R(1, -8, 2, 7, '#4a3e36'); k.R(-3, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT);
  k.poly([[-4, -20], [4, -20], [5, -7], [-5, -7]], SM);
  k.R(-4, -14, 9, 1, R.c); k.P(-4, -13, R.d); k.R(2, -12, 2, 3, '#8a6a44');
  k.L(-4, -19, -6, -13, 2, SM.d); hand(k, -7, -13, sk);
  k.L(3, -19, 4, -21, 2, SM.c); hand(k, 3, -22, sk);
  face(k, -1, -25, sk, { h:5, ey:2, nose:true, mouth:'#6a3024' });
  k.R(-3, -27, 6, 2, R.c); k.R(-3, -27, 6, 1, R.l); k.R(-3, -25, 2, 2, hair);
  k.R(-4, -24, 1, 6, hair); k.P(-4, -18, R.c); k.R(3, -23, 1, 4, hair);
};
/* EDRIN · the Updrafts · the rain-catcher keeper. Stout in a long slate rain cape and rubber boots, a white round
   beard, and on his head an upturned brass bowl that catches the rain (it spills over the rim); a tin cup held
   out for the drips. */
D.edrin = (k, s) => {
  const C = pal('#5a6a76', '#7c8e9a', '#3a4852'), sk = SKIN.tan, beard = '#e0d8cc';
  shadow(k, 16);
  k.R(-4, -5, 3, 4, '#2a2a2c'); k.R(1, -5, 3, 4, '#2a2a2c'); k.R(-4, -2, 4, 2, '#1a1a1c'); k.R(1, -2, 4, 2, '#1a1a1c');
  k.poly([[-4, -20], [4, -20], [7, -4], [-7, -4]], C);
  k.R(-1, -18, 1, 14, C.d); k.R(-6, -6, 13, 1, C.d);
  face(k, -1, -25, sk, { h:5, ey:2, nose:true }); k.R(-1, -22, 5, 3, beard); k.P(0, -19, beard); k.P(-2, -23, beard);
  k.R(-6, -26, 13, 1, BRASS.d); k.R(-5, -29, 11, 3, BRASS.c); k.R(-5, -29, 11, 1, BRASS.l); k.R(-4, -29, 9, 1, '#8ac4d8');
  const p = ((k.t + s.ph * 1.3) % 1.3) / 1.3; k.alpha(1 - p, () => { k.P(-7, -26 + Math.round(p * 7), '#9fd8f0'); k.P(7, -25 + Math.round(p * 10), '#9fd8f0'); });
  k.L(3, -18, 5, -14, 2, C.c); hand(k, 5, -14, sk);
  k.R(7, -16, 3, 3, '#9aa4a8'); k.R(7, -16, 3, 1, '#c9ced0'); if(p > .5) k.P(8, -16, '#9fd8f0');
};
/* SENN · the Marksman road · the veil-mender. Tall, thin and bald, a sea-teal apron stuck with pins over a linen
   shirt, a bolt of mottled veil-cloth over one shoulder, a spool at the belt; the long needle rises and draws its
   thread. */
D.senn = (k, s) => {
  const A = pal('#2f7a78', '#4ea09c', '#1a4e4c'), SH = pal('#d8ccb4', '#f0e6d0', '#a89c84'), sk = SKIN.deep, cloth = pal('#8a7a5a', '#a89a72', '#5e5240');
  shadow(k, 13);
  k.poly([[-7, -25], [-2, -26], [-3, -11], [-8, -8]], cloth); for(const [dx, dy] of [[-6, -22], [-5, -17], [-7, -13], [-4, -20], [-6, -10]]) k.P(dx, dy, cloth.d);
  k.R(-2, -10, 2, 9, '#3a3430'); k.R(1, -10, 2, 9, '#3a3430'); k.R(-2, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT);
  k.poly([[-4, -25], [4, -25], [4, -10], [-4, -10]], SH);
  k.R(-3, -21, 7, 12, A.c); k.R(-3, -21, 7, 1, A.l); for(let i = 0; i < 3; i++) k.P(-2 + i * 2, -20, '#e8ecf0');
  k.R(4, -15, 2, 2, '#c8605a'); k.P(4, -15, '#e88a80');
  face(k, -1, -31, sk, { h:5, ey:2, nose:true }); k.R(-2, -32, 4, 1, sk.l); k.P(-2, -29, sk.d); k.R(1, -27, 3, 1, '#d8d4cc');
  const p = ((k.t + s.ph * 1.6) % 1.6) / 1.6, lift = Math.round(Math.sin(p * Math.PI) * 5);
  k.L(3, -24, 5, -18 - lift, 2, SH.c); hand(k, 5, -19 - lift, sk);
  k.L(6, -20 - lift, 8, -25 - lift, 1, '#e8eef4'); k.alpha(.8, () => k.L(7, -22 - lift, -3, -21, 1, '#d88ab0'));
};
/* VEYA · the Keep · the hearth keeper. Sat on her stool by the fire, a cream wool shawl, a silver braid over her
   shoulder; the knitting needles click, and the rose scarf she is making hangs to the floor with its ball of yarn. */
D.veya = (k, s) => {
  const C = pal('#e0d4ba', '#fff6e2', '#a89c82'), dress = pal('#4a3e48', '#645868', '#302830'), sk = SKIN.fair, hair = '#c8c4cc', R = pal('#c05a6a', '#e07a88', '#7e3240');
  shadow(k, 14);
  stool(k, -6, 6, 11);
  k.R(1, -7, 5, 2, dress.c); k.R(4, -5, 2, 4, dress.c); k.R(4, -2, 3, 2, BOOT);
  k.poly([[-5, -18], [4, -18], [5, -6], [-6, -6]], dress);
  k.poly([[-6, -19], [5, -19], [6, -12], [0, -9], [-6, -12]], C); for(const dx of [-5, -3, -1, 1, 3]) k.P(dx, -11 + (dx > -1 ? -1 : 0), C.d);
  face(k, -1, -24, sk, { h:5, ey:2, mouth:'#a06050' }); k.R(-3, -25, 5, 2, hair); k.R(-3, -23, 2, 3, hair); k.R(2, -21, 1, 7, hair); k.P(2, -14, R.c);
  const c = every(k.t, .5, .25, s.ph) ? 1 : 0;
  k.R(4, -10, 3, 8, R.c); k.R(4, -10, 3, 1, R.l); for(let yy = -8; yy < -2; yy += 2) k.R(4, yy, 3, 1, R.d);
  hand(k, 2, -12, sk); hand(k, 6, -12, sk);
  k.L(3, -12, 6, -16 - c, 1, '#d8d0c0'); k.L(7, -12, 4, -16 + c - 1, 1, '#d8d0c0');
  k.R(9, -3, 3, 3, R.c); k.P(9, -3, R.l); k.alpha(.8, () => k.L(10, -3, 6, -2, 1, R.l));
};

/* ACT TWO'S SICK · the white flower is the disease; the bandage wraps are theirs. What makes these two yours to
   find: THE SICK WOMAN in the Colony sits in a brick-red shawl, holding her tin cup up to you, the flower at her
   temple; THE SERVANT in the Sunspire is tall and slender in black livery with gold buttons and white gloves, the
   gold mask over the bandages, polishing a gold cup that does not need it (kneeling, in the hall). */
const BAND = pal('#d8d0bd', '#efe8d8', '#b9b09a');
function wrapped(k, dx, dy, w, h){ k.R(dx, dy, w, h, BAND.c); k.R(dx, dy, w, 1, BAND.l); for(let yy = dy + 2; yy < dy + h; yy += 2) k.R(dx, yy, w, 1, BAND.d); }
function whiteFlower(k, dx, dy){ k.R(dx, dy, 1, 2, '#6b7a5a'); k.R(dx - 1, dy - 2, 3, 2, '#f4f1e6'); k.P(dx, dy - 2, '#cfc8b2'); }
D.sickwoman = (k, s) => {
  const R = pal('#a8402e', '#d0624a', '#6a2418'), sk = SKIN.tan;
  shadow(k, 12);
  k.R(-5, -4, 11, 3, '#7a6a62'); k.R(3, -3, 4, 2, '#8f8775'); k.R(6, -2, 2, 2, BOOT);
  k.poly([[-4, -13], [4, -13], [6, -3], [-6, -3]], R);
  k.R(-4, -8, 9, 1, R.d); k.P(-2, -11, R.l);
  wrapped(k, -3, -20, 7, 7); k.R(1, -17, 3, 1, '#2a2520'); k.P(2, -17, '#f0e0c0');
  whiteFlower(k, -4, -19);
  const up = every(k.t, 3.4, 1.6, s.ph) ? 1 : 0;
  k.L(3, -11, 6, -12 - up, 2, R.c); hand(k, 6, -13 - up, sk);
  k.R(7, -15 - up, 3, 3, '#9aa4a8'); k.R(7, -15 - up, 3, 1, '#c9ced0');
};
D.servant = (k, s) => {
  const L = pal('#26222c', '#443e4c', '#121016'), G = pal('#d8b25a', '#f3d67a', '#8a6a24'), glove = '#f4f0e6';
  if(s.kneel){
    shadow(k, 14);
    k.R(-6, -4, 12, 4, L.d); k.poly([[-4, -14], [4, -14], [6, -4], [-6, -4]], L); k.R(-4, -14, 9, 1, G.c);
    wrapped(k, -3, -21, 7, 7); k.R(-2, -20, 6, 5, G.c); k.R(-2, -20, 6, 1, G.l); k.P(0, -18, G.d); k.P(2, -18, G.d);
    whiteFlower(k, -4, -21); k.R(5, -6, 6, 2, G.c); k.P(5, -6, G.l); hand(k, 4, -7, pal(glove, '#ffffff', '#c8c4bc'));
    return;
  }
  shadow(k, 12);
  k.R(-3, -10, 2, 9, L.d); k.R(1, -10, 2, 9, L.d); k.R(-3, -2, 3, 2, '#0e0c10'); k.R(1, -2, 3, 2, '#0e0c10');
  k.poly([[-4, -27], [4, -27], [5, -10], [2, -10], [0, -6], [-2, -10], [-5, -10]], L);             // the tailcoat
  k.R(-4, -27, 9, 1, G.c); k.R(1, -26, 1, 15, G.d); for(let i = 0; i < 4; i++) k.P(2, -24 + i * 3, G.l);
  k.R(-1, -26, 2, 3, '#f4f0e6');
  wrapped(k, -3, -35, 7, 8);
  k.R(-2, -34, 6, 6, G.c); k.R(-2, -34, 6, 1, G.l); k.R(-2, -33, 1, 5, G.l); k.P(4, -32, G.c); k.R(0, -32, 1, 1, '#3a2a14'); k.R(2, -32, 1, 1, '#3a2a14'); k.P(1, -30, G.d);
  whiteFlower(k, -4, -35);
  // the polishing: the cloth goes round the cup
  const a = k.t * 3.2 + s.ph, cx = Math.round(Math.cos(a) * 1.2), cy = Math.round(Math.sin(a) * .8);
  k.L(-4, -25, -5, -17, 2, L.d);
  k.L(3, -25, 5, -18, 2, L.c); k.R(6, -18, 3, 4, G.c); k.R(6, -18, 3, 1, G.l); k.R(5, -14, 5, 1, G.d);
  k.R(6 + cx, -19 + cy, 3, 2, '#f4f0e6'); k.P(6 + cx, -19 + cy, glove);
  if(every(k.t, 2.2, .3, s.ph)) { k.P(9, -17, '#ffffff'); k.glow(8, -17, 4, '255,236,160', .35); }
};

/* ── SHOPKEEPERS, behind their counters ──────────────────────────────────────────────────────────────────
   A bust: dy is measured from the keeper's waist, which is hidden behind the counter. */
const K = {};
/* TAMSIN · Black Woods · the Assessor. A black frock coat over a saffron waistcoat, round spectacles, silver hair,
   a top hat with a gold band; she lifts a coin to her eye and it flashes. */
K.tamsin = (k, s) => {
  const coat = pal('#2a2430', '#443c4c', '#16121a'), W = pal('#d9a42c', '#f4cc5a', '#95701c'), sk = SKIN.fair, hat = pal('#1e1a24', '#3a3444', '#0e0c12');
  k.poly([[-5, -12], [5, -12], [6, 2], [-6, 2]], coat);
  k.R(-2, -11, 5, 13, W.c); k.R(-2, -11, 5, 1, W.l); k.P(0, -8, '#fff4d0'); k.P(0, -5, '#fff4d0'); k.P(0, -2, '#fff4d0');
  k.R(-1, -12, 3, 2, '#f0ead8');
  face(k, -2, -17, sk, { w:5, h:5, ey:1, eyes:false, mouth:'#b06a5a' });
  k.R(-4, -17, 2, 4, '#d8d4e0'); k.P(-4, -13, '#b8b4c4');
  k.R(-1, -16, 2, 2, '#bfeaff'); k.R(2, -16, 2, 2, '#bfeaff'); k.P(1, -16, '#8a7a5a'); k.P(-1, -16, '#ffffff');
  k.R(-3, -24, 7, 6, hat.c); k.R(-3, -24, 7, 1, hat.l); k.R(-3, -23, 1, 5, hat.l); k.R(-3, -19, 7, 1, W.c); k.R(-5, -18, 11, 1, hat.c);
  const lift = every(k.t, 4, 1.4, s.ph);
  k.L(4, -10, 6, lift ? -16 : -8, 2, coat.c); hand(k, 6, lift ? -17 : -8, sk);
  k.P(7, lift ? -18 : -9, '#ffe070'); if(lift && every(k.t, 4, .35, s.ph + .15)){ k.P(7, lift ? -19 : -10, '#ffffff'); k.glow(7, -18, 5, '255,230,120', .45); }
};
/* AVEN · the Updrafts · the sail-cutter. Wind-wild sandy hair, brass goggles on the forehead, a canvas smock and a
   cyan scarf streaming out behind; the great shears open and shut. */
K.aven = (k, s) => {
  const C = pal('#e6e0d0', '#fffaf0', '#a8a290'), cy = pal('#3cc4dc', '#8ae8f6', '#1f8098'), sk = SKIN.ruddy, hair = '#e0b060';
  k.poly([[-5, -8], [5, -8], [6, 4], [-6, 4]], C);
  for(let i = 0; i < 8; i++){ const w = Math.round(Math.sin(k.t * 6 + s.ph - i * .8) * (i * .25)); k.R(-4 - i, -8 + (i >> 2) + w, 1, 2, i % 2 ? cy.c : cy.l); }
  k.R(-4, -9, 9, 2, cy.c); k.R(-4, -9, 9, 1, cy.l);
  face(k, -1, -14, sk, { h:5, ey:2, nose:true, mouth:'#a05a4a' });
  k.R(-3, -16, 6, 2, hair); k.R(-3, -14, 2, 2, hair);
  const gust = Math.round(Math.sin(k.t * 6 + s.ph) * .6);
  for(const [dx, dy] of [[-4, -17], [-5, -16], [-6, -17 + gust], [-4, -15], [-6, -14 + gust], [-7, -15 + gust], [-1, -17], [1, -17]]) k.P(dx, dy, dx < -5 ? '#f0cc80' : hair);
  k.R(-1, -15, 2, 2, BRASS.c); k.R(2, -15, 2, 2, BRASS.c); k.P(-1, -15, '#bff4ff'); k.P(3, -15, '#bff4ff');
  const open = Math.round((Math.sin(k.t * 3.2 + s.ph) + 1) * 1.2);
  k.L(4, -6, 6, -9, 2, C.c); hand(k, 6, -10, sk);
  k.L(7, -10, 13, -15 - open, 1, IRON.l); k.L(7, -10, 13, -13 + open, 1, IRON.c); k.P(7, -10, BRASS.c);
};
/* TOVIN · the Keep · the mason. A square head under a flat cap, a grey walrus moustache, a slate-teal apron; he taps
   the chisel into a stone on the counter, and chips fly. */
K.tovin = (k, s) => {
  const A = pal('#2f8f86', '#55b8ac', '#1c5a54'), shirt = pal('#8a8680', '#aca8a0', '#5e5a54'), sk = SKIN.ruddy;
  k.poly([[-6, -9], [6, -9], [7, 4], [-7, 4]], shirt);
  k.R(-4, -7, 9, 11, A.c); k.R(-4, -7, 9, 1, A.l); k.R(-4, -9, 1, 2, A.d); k.R(4, -9, 1, 2, A.d);
  face(k, -2, -15, sk, { w:6, h:6, ey:2, nose:true }); k.R(0, -11, 5, 1, '#d8d4cc'); k.P(4, -10, '#d8d4cc'); k.P(-1, -10, '#d8d4cc');
  k.R(-3, -17, 8, 2, '#4a4a52'); k.R(-3, -17, 8, 1, '#6a6a74'); k.R(4, -16, 3, 1, '#2e2e34');
  const tap = every(k.t, 1.3, .18, s.ph);
  k.L(5, -6, 7, -1, 2, shirt.c); hand(k, 7, -2, sk); k.R(8, -1, 1, 3, IRON.l);
  k.L(-4, -6, 3, tap ? -4 : -7, 2, shirt.d); k.R(3, tap ? -6 : -9, 3, 3, WOOD.c);
  if(tap){ k.P(10, -2, '#d8d0c0'); k.P(11, -4, '#ffffff'); k.P(9, -4, '#d8d0c0'); }
};
/* VENN · Frostfell · the stove factor. Coal-black coat, a tall white fur hat with its ear flaps up, a white walrus
   moustache, the pipe with its red coal and smoke curling off. */
K.venn = (k, s) => {
  const coat = pal('#26222a', '#403a46', '#141216'), fur = pal('#dcd6cc', '#f8f4ee', '#a8a296'), sk = SKIN.ruddy;
  k.poly([[-6, -9], [6, -9], [7, 4], [-7, 4]], coat);
  k.R(-6, -9, 13, 2, fur.c); k.R(-6, -9, 13, 1, fur.l); k.R(0, -7, 1, 11, fur.d); k.P(2, -4, '#c83a2a'); k.P(2, -1, '#c83a2a');
  face(k, -1, -15, sk, { w:5, h:6, ey:2, nose:true }); k.R(0, -11, 5, 1, fur.c); k.P(4, -10, fur.c); k.P(-1, -10, fur.c);
  k.R(-5, -20, 11, 5, fur.c); k.R(-4, -21, 9, 1, fur.l); k.R(-5, -20, 1, 4, fur.l); k.R(-4, -16, 9, 1, fur.d);
  for(const [dx, dy] of [[-3, -19], [0, -18], [3, -19], [-1, -20], [2, -17], [-4, -17], [4, -18]]) k.P(dx, dy, fur.d);
  k.R(-6, -18, 2, 5, fur.c); k.P(-6, -18, fur.l); k.R(5, -18, 2, 5, fur.c); k.P(6, -14, fur.d); k.P(-6, -14, fur.d);
  k.R(4, -10, 3, 1, WOOD.d); k.R(6, -12, 2, 2, WOOD.c); k.P(6, -12, '#ff5a2a');
  for(let i = 0; i < 3; i++){ const p = (k.t * .5 + i / 3 + s.ph) % 1; k.alpha((1 - p) * .6, () => k.R(7 + Math.round(Math.sin(p * 5 + i) * 1.5), -14 - Math.round(p * 10), 1 + (p > .5 ? 1 : 0), 1, '#e8e8ec')); }
  k.glow(7, -12, 4, '255,110,60', .3 + Math.sin(k.t * 3) * .1);
};
/* SERA · Emberdeep · the courier. A turquoise courier's jacket and peaked cap, a dark ponytail, the satchel strap
   across her; she writes in the ledger on the counter, the quill wagging. */
K.sera = (k, s) => {
  const C = pal('#23a8a4', '#58d4cc', '#146a68'), sk = SKIN.brown, hair = '#1a1010';
  k.poly([[-5, -9], [5, -9], [6, 4], [-6, 4]], C);
  k.L(-5, -9, 5, 2, 1, '#6a4a30'); k.R(-1, -8, 2, 12, C.d);
  face(k, -1, -15, sk, { h:6, ey:2, nose:true, mouth:'#6a3a2a' });
  k.R(-3, -15, 2, 3, hair); for(let i = 0; i < 4; i++) k.P(-4 - (i >> 1), -14 + i + Math.round(Math.sin(k.t * 2 + s.ph) * .6), hair);
  k.R(-3, -18, 7, 3, C.c); k.R(-3, -18, 7, 1, C.l); k.R(3, -16, 3, 1, '#0e2a2a'); k.P(0, -17, BRASS.l);
  const q = Math.round(Math.sin(k.t * 9 + s.ph) * (every(k.t, 3, 1.6, s.ph) ? 1 : 0));
  k.L(4, -6, 6, -2, 2, C.c); hand(k, 6, -2, sk); k.L(8 + q, -2, 10 + q, -7, 1, '#f4f0e8'); k.P(10 + q, -7, '#ffffff');
};
/* THE SLEEPLESS CLERK · the Inversion. A butter-yellow nightshirt and a long nightcap drooping to the shoulder with
   a bobble, deep purple under the eyes, the candle on its saucer; she yawns. */
K.clerk = (k, s) => {
  const C = pal('#e6cc5a', '#fff0a0', '#a08a2c'), sk = SKIN.pale;
  k.poly([[-5, -9], [5, -9], [6, 4], [-6, 4]], C);
  k.R(-2, -9, 5, 2, '#fffaf0'); k.P(0, -6, C.d); k.P(0, -3, C.d);
  const yawn = every(k.t, 6, 1, s.ph);
  face(k, -1, -15, sk, { h:6, ey:2, eyes:!yawn });
  k.P(0, -12, '#8a6a9a'); k.P(2, -12, '#8a6a9a');
  if(yawn){ k.R(1, -11, 2, 2, '#5a2a2a'); k.P(0, -13, EYE); k.P(2, -13, EYE); }
  k.R(-3, -18, 7, 3, C.c); k.R(-3, -18, 7, 1, C.l);
  for(const [dx, dy, w] of [[-4, -18, 0], [-5, -18, 1], [-6, -17, 0], [-7, -16, 1], [-7, -15, 0], [-7, -14, 1]]) k.P(dx, dy, w ? '#ffffff' : C.c);
  k.R(-8, -13, 2, 2, '#ffffff');
  k.L(4, -6, 6, -4, 2, C.c); hand(k, 6, -4, sk);
  k.R(6, -3, 5, 1, '#c8c4bc'); k.R(8, -7, 1, 4, '#f4f0e8'); flame(k, 8, -8, false); k.glow(8, -9, 14, '255,210,130', .35);
};
/* VEY'S SERVICE DRAWER · the White Court: nobody minds it. Brass pulls, a rose ribbon tag of hers. */
K.drawer = (k, s) => {
  k.R(-7, -12, 14, 12, '#4a4450'); k.R(-7, -12, 14, 1, '#6a6474');
  for(const dy of [-10, -5]){ k.R(-6, dy, 12, 4, '#5a5462'); k.R(-6, dy, 12, 1, '#7a7484'); k.R(-1, dy + 2, 3, 1, BRASS.l); }
  const sw = Math.round(Math.sin(k.t * 1.6) * .6); k.P(2, -7, '#ee78a4'); k.R(3 + sw, -6, 1, 3, '#c4487a'); k.P(4 + sw, -3, '#ee78a4');
};

/* ═══ WHO IS WHO ═══════════════════════════════════════════════════════════════════════════════════════════ */
const STORY = { gatekeeper:'rowan', refuge:'elsie', defector:'silas', cartographer:'cartographer', recruit:'recruit', archivist:'archivist',
  keeper:'servicekeeper', winter:'frostwoman', 'ember-pet':'creaturekeeper', quota:'foundry', automaton:'automaton', neighbors:'neighbor',
  figure:'figure', alarm:'bellkeeper', miner:'miner', sailors:'sailor', birthday:'organizer', mother:'mother', pilgrim:'pilgrim', garden:'gardener' };
const SUPPORT = { worker:'breaker', neighbor:'upstairs', sailor:'stranded', soldier:'soldier', volunteer:'volunteer' };
const PROFILE = { mara:'mara', bram:'bram', ilyra:'oren', sera:'oren', nim:'nim' };
const RESIDENT = { 'outskirts-survivor':'vey', 'brute-chainwright':'oren', 'marksman-fletcher':'mara', 'brute-stretcher':'sable',
  'outskirts-roadkeeper':'olan', 'woods-clockkeeper':'orra', 'woods-resinworker':'pell', 'woods-veteran':'hale',
  'updrafts-kitemender':'talla', 'updrafts-rainkeeper':'edrin', 'marksman-veilmender':'senn', 'keep-hearth-keeper':'veya' };
const QUEST = { oren:'oren', daro:'mara' };
const SHOP = { 'ethereal-goods':'tamsin', 'bellows-exchange':'aven', 'keepers-counter':'tovin', 'white-exchange':'venn', 'sluice-counter':'drawer', 'cinder-ledger':'sera', 'last-inventory':'clerk' };
const SEATED = ['gatekeeper', 'winter', 'quota', 'refuge', 'alarm', 'pilgrim', 'garden', 'defector', 'cartographer'];
function designFor(o){
  if(!o) return null;
  if(o.type === 'actSable') return 'sable';
  if(o.type === 'actServant') return 'servant';
  if(o.type === 'actSick') return 'sickwoman';
  if(o.sideStory){ if(o.sideStoryRole === 'actor') return STORY[o.sideStory] || null;
    if(o.sideStoryRole === 'support') return o.supportKind === 'defender' ? (/lookout/i.test(o.name || '') ? 'lookout' : 'defender') : SUPPORT[o.supportKind] || null; return null; }
  if(o.profileId && PROFILE[o.profileId]) return PROFILE[o.profileId];
  if(o.residentId && RESIDENT[o.residentId]) return RESIDENT[o.residentId];
  if(o.questActor && QUEST[o.questActor]) return QUEST[o.questActor];
  return null;
}

/* ── Pose ──────────────────────────────────────────────────────────────────────────────────────────────── */
const seeds = {};
function seed(id){ if(seeds[id] == null){ let h = 7; for(const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0; seeds[id] = (h % 1000) / 1000; } return seeds[id]; }
const motion = new WeakMap();
function velocity(o, t){
  let m = motion.get(o); if(!m){ m = { x:o.x, t, vx:0 }; motion.set(o, m); return 0; }
  const dt = t - m.t; if(dt > 0){ const v = (o.x - m.x) / dt; m.vx = dt > .4 ? 0 : m.vx * .5 + v * .5; m.x = o.x; m.t = t; }
  return m.vx;
}
function facePlayer(g, o, fallback){
  const p = g && g.p; if(p && Math.abs(p.x - o.x) < 240 && Math.abs((p.y || 0) - (o.y || 0)) < 180) return p.x >= o.x ? 1 : -1;
  return fallback || 1;
}
/* Busy, then they notice you (7.359). The Outskirts' people are at their own work until the knight comes close;
   then a short start (`s.notice` runs 0→1 over .7s, the body jolts up a pixel) and they turn to face him. They go
   back to it when he walks off. Ids in BUSY have a busy pose; since 7.361 everyone else stands at their own work (`s.idle`). */
const BUSY = new Set(['vey', 'olan', 'mara', 'rowan']);
const attention = new WeakMap();
function attend(g, o, t){
  const p = g && g.p, near = !!p && Math.abs(p.x - o.x) < 130 && Math.abs((p.y || 0) - (o.y || 0)) < 90;
  let a = attention.get(o); if(!a){ a = { near:false, since:-9 }; attention.set(o, a); }
  if(near && !a.near) a.since = t; a.near = near;
  return near ? { busy:false, notice:Math.min(1, (t - a.since) / .7) } : { busy:true, notice:1 };
}
function pose(api, id, o, extra){
  const g = api.G, t = api.time || 0, vx = o.vx != null && Math.abs(o.vx) > 8 ? o.vx : velocity(o, t);
  const walk = Math.abs(vx) > 8;
  const s = Object.assign({ id, t, ph:seed(id), walk, look:1, o, sit:false }, extra || {});
  if(!walk && !s.good && !s.chartGiven && !s.run && !s.air && !(g && g.npcs && g.npcs.includes(o))){ const a = attend(g, o, t);
    // (7.361) Everyone is at their own work until the knight comes close: the four with a work pose use it; the rest
    // keep to their side, heads down in a slow working bob, and turn with the same start when they notice him.
    if(BUSY.has(id)) s.busy = a.busy; else s.idle = a.busy;
    s.notice = a.notice; }
  s.face = walk ? Math.sign(vx) : (s.busy || s.idle) ? (o.workFace || o.face || 1) : facePlayer(g, o, o.face || 1);
  if(!walk && (id === 'rowan' || id === 'recruit') && every(t, id === 'recruit' ? 2.6 : 7, id === 'recruit' ? .8 : .9, s.ph)) s.look = -1;
  return s;
}
function render(api, id, o, s, x, y){
  const fn = D[id]; if(!fn) return false;
  const bob = s.idle && Math.sin(s.t * 2.6 + s.ph * 6) > .55 ? -1 : 0;   // the working bob of someone busy with their hands
  const k = kit(api, x, y - bob - (s.notice != null && s.notice < .3 ? 1 : 0), s.face, s.t);   // the start, when they notice you
  const c = api.ctx, a0 = c.globalAlpha;
  if(o.state === 'dead') c.globalAlpha = a0 * .25;
  else if(o.flash > 0) c.globalAlpha = a0 * (.5 + .5 * Math.sin(s.t * 40));
  try { fn(k, s); } finally { c.globalAlpha = a0; }
  return true;
}
function nearGlow(api, o, rgb){
  const p = api.G && api.G.p; if(!p) return; const d = Math.abs(p.x - o.x); if(d > 140) return;
  api.glow(api.WX(o.x), api.WY(o.y || 0) - 12, 18, rgb, (1 - d / 140) * (.12 + .06 * Math.sin((api.time || 0) * 5)));
}
/* A side story's state marker, in pixels: … while it waits to be taken, ✓ when it is ready to be told. */
function marker(api, x, y, phase, accent){
  const B = api.B, col = accent || '#e8dcc0', dk = '#14101a';
  if(phase === 'offered'){ for(const dx of [-3, 0, 3]){ B(x + dx - 1, y - 1, 3, 3, dk); B(x + dx, y, 1, 1, col); } }
  if(phase === 'ready'){ const pts = [[-3, 0], [-2, 1], [-1, 2], [0, 1], [1, 0], [2, -1], [3, -2]];
    for(const [dx, dy] of pts) B(x + dx - 1, y + dy - 1, 3, 3, dk); for(const [dx, dy] of pts) B(x + dx, y + dy, 1, 1, col); }
}
const HEAD = { rowan:33, mara:37, vey:30, elsie:24, bram:42, oren:31, silas:38, sable:40, cartographer:32, recruit:30, archivist:40, servicekeeper:29,
  nim:22, frostwoman:20, servant:40, sickwoman:24, creaturekeeper:26, foundry:30, breaker:36, automaton:47, neighbor:50, upstairs:28, figure:42, bellkeeper:35, defender:30, lookout:33,
  volunteer:32, miner:34, sailor:30, stranded:28, organizer:34, soldier:36, mother:36, pilgrim:30, gardener:29 };

/* ═══ ENTRY POINTS ═════════════════════════════════════════════════════════════════════════════════════════ */
/* The renderer's residents: ambient figures, travellers (G.npcs), and the Colony's Sable. */
function draw(api, o){
  const id = designFor(o); if(!id || !D[id]) return false;
  const g = api.G, extra = {};
  if(id === 'vey') extra.prop = o.gaolKeeper ? 'keys' : o.courtKeeper || o.courtAction === 'keeper' ? 'wrench' : null;
  if(id === 'vey' && o.quietV4 && o.silhouette === 'huddled') extra.sit = true;
  if(id === 'nim'){ extra.follow = o.state === 'follow'; extra.done = !!o.done; }
  if(id === 'servant') extra.kneel = !!o.kneel;
  if(id === 'mara'){ extra.run = o.maraPose === 'run'; extra.air = o.maraPose === 'air'; }
  if(id === 'bram'){ extra.lit = !!(o.lampSettled || o.state === 'follow' || o.state === 'wait'); }
  if(id === 'sable' && o.type === 'actSable'){ const A = g && g.actTwo; if(A && A.stage === 18){ extra.water = !!(A.tapOpen && A.water && A.water.t > 2); } }
  const s = pose(api, id, o, extra);
  if(o.type === 'actSable'){ const A = g && g.actTwo; if(A && A.sable) s.face = A.sable.face || s.face; }
  if(o.type === 'ambientFigure' && !o.met && !o.quietV4) nearGlow(api, o, '216,196,143');
  const x = api.WX(o.x), y = api.WY(o.y || 0);
  render(api, id, o, s, x, y);
  if(id === 'nim' && s.follow) for(let i = -4; i <= 4; i++) api.B(x + i * 5, y, 3, 1, '#968f7a');
  return true;
}
/* The opening stories' residents (stages 0-1), on their legacy context. */
function drawLegacy(c, o){
  const id = designFor(o); if(!id || !['mara', 'bram', 'vey', 'olan', 'orra', 'pell', 'hale'].includes(id)) return false;
  return onLegacy(c, api => {
    const extra = {};
    if(id === 'vey' || id === 'hale') extra.sit = true;
    if(id === 'bram'){ extra.lit = !!(o.lampSettled || o.state === 'follow' || o.state === 'wait'); extra.handedOver = !!o.done; }
    if(id === 'mara'){ extra.chartGiven = !!o.done; extra.run = o.maraPose === 'run'; extra.air = o.maraPose === 'air'; }
    const s = pose(api, id, o, extra);
    return render(api, id, o, s, api.WX(o.x), api.WY(o.y || 0));
  });
}
/* The side stories: the giver and the people their conversations point at. */
function drawStory(c, o, q, r, scene){
  const id = designFor(o); if(!id || !D[id] || !q || !r) return false;
  return onLegacy(c, api => {
    const good = r.phase === 'completed', bad = r.phase === 'harsh', perf = scene && scene.performance, opening = q.stage < 2;
    const extra = { good, bad, step:r.step, phase:r.phase, at:perf ? perf.t : 9 };
    if(o.sideStoryRole === 'actor'){
      if(opening) extra.sit = good && !o.openingWalking;   // turned away, not sat down, when you were cruel
      else extra.sit = (bad && q.id === 'garden') || (good && SEATED.includes(q.id) && !(q.id === 'defector' && !scene.escort?.finished));
      if(q.id === 'recruit') extra.helmet = r.step >= 1 && !(scene && scene.escort && scene.escort.helmetDropped);
      if(q.id === 'miner') extra.caged = r.step === 0;
    } else {
      extra.sit = !!o.seated;
      if(o.supportKind === 'sailor') extra.perched = Math.abs(o.y - (o.perchY == null ? -1 : o.perchY)) < 1 && !(r.step > 0 || bad);
    }
    const s = pose(api, id, o, extra);
    if(o.openingWalking) s.walk = true;
    if(q.id === 'gatekeeper' && o.sideStoryRole === 'actor'){ s.face = bad ? -1 : 1; if(o.openingWalking) s.face = (o.x < (scene && scene.base ? scene.base.x : o.x)) ? -1 : 1; }
    if(q.id === 'refuge' && o.sideStoryRole === 'actor' && (good || bad)) s.face = 1;
    if(q.id === 'defector' && o.sideStoryRole === 'actor' && s.walk) s.face = Math.sign(velocity(o, s.t)) || s.face;
    const x = api.WX(o.x), y = api.WY(o.y || 0);
    if(o.inverted){ const ctx = api.ctx, u = api.u || 1; ctx.save(); ctx.translate(0, 2 * y * u); ctx.scale(1, -1); try { render(api, id, o, s, x, y); } finally { ctx.restore(); } }
    else if(q.id === 'figure' && o.sideStoryRole === 'actor' && r.step === 0){
      render(api, id, o, s, x, y);
      const B = api.B; B(x - 13, y - 34, 26, 1, '#9cbedb'); B(x - 13, y - 34, 1, 34, '#9cbedb'); B(x + 12, y - 34, 1, 34, '#9cbedb'); B(x - 13, y - 34, 26, 1, '#d8ecff');
    } else render(api, id, o, s, x, y);
    // what the old actor drew around the body
    if(o.sideStoryRole === 'actor'){
      if(q.id === 'recruit' && scene && scene.escort && scene.escort.helmetDropped){
        const hx = api.WX(scene.base.x + 135 * scene.base.dir), B = api.B;
        B(hx - 4, y - 4, 9, 3, BRASS.c); B(hx - 3, y - 5, 7, 1, BRASS.l); B(hx - 5, y - 1, 11, 1, BRASS.d); B(hx - 1, y - 7, 2, 2, '#e03a3a');
      }
      if(!opening && (r.phase === 'offered' || r.phase === 'ready')) marker(api, x, y - (HEAD[id] || 34) - 4, r.phase, q.accent);
    }
    return true;
  });
}
/* A stall's keeper, drawn over the stall after it (renderer), and the counter again in front of the keeper. */
function drawShop(api, o){
  const id = SHOP[o && o.shopId]; if(!id || !K[id]) return false;
  const g = api.G; if(id === 'tamsin' && g && g.stageIndex < 2 && root.BladefallOpeningStories) return false;   // her own stall draws her
  const x = api.WX(o.x), y = api.WY(o.y || 0), B = api.B, t = api.time || 0;
  B(x - 5, y - 24, 11, 10, '#241c19');                                                   // the old keeper's round shadow
  const k = kit(api, x, y - 10, facePlayer(g, o, 1), t);
  K[id](k, { t, ph:seed(id), o });
  B(x - 27, y - 11, 55, 5, '#59432e'); B(x - 25, y - 9, 50, 3, '#8d6b43'); B(x - 25, y - 9, 50, 1, '#a8845a');
  return true;
}
/* Tamsin inside the opening stories' own stall (it draws its counter after her). */
function drawKeeper(c, o, wx, wy){
  const id = SHOP[o && o.shopId]; if(!id || !K[id]) return false;
  return onLegacy(c, api => {
    const t = api.time || 0, x = api.WX(o.x), y = api.WY(o.y || 0) - 6 - (id === 'tamsin' ? 5 : 0);
    K[id](kit(api, x, y, facePlayer(api.G, o, 1), t), { t, ph:seed(id), o });
    return true;
  });
}
/* For the design sheet and the capture scripts: draw any design standing at a buffer position. */
function drawDesign(api, id, x, y, opts){
  if(K[id]){ K[id](kit(api, x, y, (opts && opts.face) || 1, api.time || 0), Object.assign({ t:api.time || 0, ph:seed(id) }, opts || {})); return true; }
  if(!D[id]) return false;
  const s = Object.assign({ id, t:api.time || 0, ph:seed(id), walk:false, look:1, sit:false, face:1, o:{} }, opts || {});
  return render(api, id, s.o, s, x, y);
}

root.BladefallResidentArt = Object.freeze({ draw, drawLegacy, drawStory, drawShop, drawKeeper, drawDesign, designFor, legacyApi,
  designs:Object.freeze(Object.keys(D)), keepers:Object.freeze(Object.keys(K)) });
})(typeof window !== 'undefined' ? window : globalThis);
