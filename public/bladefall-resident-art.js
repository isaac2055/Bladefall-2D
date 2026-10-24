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
/* (7.371) Busy work as a routine, not one sine: a loop of beats (name, seconds), eased inside each beat. A routine can
   have variants of the same total length; each loop picks one (seeded per person and loop), so the same person
   does not repeat the same moves on a metronome. r = { name, u (0..1), p (eased), i, loop, at (seconds into the beat) }. */
const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
function hash2(a, b){ let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function routine(t, ph, variants){
  const total = variants[0].reduce((a, b) => a + b[1], 0), T = t + ph * total * 7, loop = Math.floor(T / total);
  const beats = variants[Math.floor(hash2(loop, Math.round(ph * 1000)) * variants.length)];
  let r = T - loop * total;
  for(let i = 0; i < beats.length; i++){ const d = beats[i][1]; if(r < d) return { name:beats[i][0], u:r / d, p:ease(r / d), i, loop, at:r, d }; r -= d; }
  const b = beats[beats.length - 1]; return { name:b[0], u:1, p:1, i:beats.length - 1, loop, at:b[1], d:b[1] };
}
/* (7.373) The sound of the work: when a beat starts, its sound plays from where the person stands, fading with the
   knight's distance (Explore only; nothing when the person is off in a preview or the editor). */
const lastBeat = new WeakMap();
function workSound(s, RT, map){
  if(!RT || !s.o || !root.BladefallSfx) return;
  const key = RT.loop * 64 + RT.i; if(lastBeat.get(s.o) === key) return; lastBeat.set(s.o, key);
  const name = map[RT.name]; if(!name) return;
  const g = world(), p = g && g.p; if(!p || !Number.isFinite(s.o.x)) return;
  const d = Math.hypot(p.x - s.o.x, (p.y || 0) - (s.o.y || 0)), gain = 1 - d / 520; if(gain <= .05) return;
  try { if(typeof mode !== 'undefined' && mode !== 'play') return; } catch(_e){}
  root.BladefallSfx.play(name, { gain:gain * .8, pan:Math.max(-1, Math.min(1, (s.o.x - p.x) / 420)), gap:0 });
}
/* a there-and-back within a beat: 0 → 1 by `up`, held, back to 0 from `down` */
const swing = (u, up, down) => u < up ? ease(u / up) : u < down ? 1 : 1 - ease((u - down) / (1 - down));

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

  // (7.371) busy: sharpening the spear in strokes, then lifting it to sight along the edge, a glance down the road
  const RT = !s.sit && s.busy ? routine(k.t, s.ph, [
    [['stroke', .75], ['stroke', .75], ['stroke', .75], ['stroke', .75], ['rest', .5], ['inspect', 1.8], ['look', 1.1]],
    [['stroke', .75], ['stroke', .75], ['stroke', .75], ['stroke', .75], ['stroke', .75], ['stroke', .75], ['rest', .3], ['inspect', 1.6]],
    [['stroke', .7], ['stroke', .7], ['stroke', .7], ['look', 1.4], ['stroke', .7], ['stroke', .7], ['inspect', 1.5]]]) : null;
  workSound(s, RT, { stroke:'work-whetstone' });
  // the head: he keeps glancing back down the road; over the stone it bows to the blade
  const look = RT ? (RT.name === 'look' && RT.u > .1 && RT.u < .85 ? -1 : 1) : s.look;
  const h0 = RT && RT.name === 'stroke' ? k.at(1, 1) : RT && RT.name === 'inspect' && RT.u > .2 && RT.u < .85 ? k.at(0, -1) : k;
  const h = look < 0 ? h0.flip() : h0;
  h.R(-2, sh - 1, 5, 1, C.l);
  face(h, 0, sh - 5, sk, { nose:true, shade:true, ey:1 });
  h.R(-3, sh - 5, 3, 3, grey); h.P(-1, sh - 4, sk.d);
  h.R(1, sh - 2, 3, 1, mou); h.P(4, sh - 2, mou);
  h.R(-3, sh - 8, 7, 2, IRON.c); h.R(-2, sh - 9, 5, 1, IRON.l); h.P(-3, sh - 8, IRON.l);
  h.R(-7, sh - 6, 15, 1, IRON.l); h.P(-7, sh - 5, IRON.d); h.P(7, sh - 5, IRON.d);
  // the spear in his fist
  if(RT){   // the spear tipped across him; the whetstone pushed up the edge (contact) and brought back off it
    const insp = RT.name === 'inspect' ? swing(RT.u, .25, .8) : 0, tx = 13 - Math.round(insp * 2), ty = -30 - Math.round(insp * 3);
    spear(3, -1, tx, ty); k.L(5, sh + 1, 9, sh + 8 - Math.round(insp), 2, C.c); hand(k, 9, sh + 8 - Math.round(insp), sk);
    let wx = 9, wy = sh + 12, stone = true;
    if(RT.name === 'stroke'){
      const push = RT.u < .62, q = push ? ease(RT.u / .62) : 1 - ease((RT.u - .62) / .38);
      wx = tx + (push ? 0 : 2); wy = ty - 1 - Math.round(q * 4);
      if(RT.u > .54 && RT.u < .64) k.P(wx + 2, wy - 1, '#fff2b0');
    } else if(RT.name === 'inspect' && RT.u > .5 && RT.u < .75){ wx = tx + 1; wy = ty - 3; stone = false; }   // the thumb tries the edge
    k.L(5, sh + 3, wx - 2, wy + 2, 2, C.d);
    if(stone){ k.R(wx - 1, wy, 3, 2, '#7a7468'); k.P(wx - 1, wy, '#a8a294'); }
    hand(k, wx - 2, wy + 2, sk);
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
  // (7.371) busy: she studies the chart, pencils a mark, sights the road through the spyglass, fights the wind for it
  const RT = s.busy && !moving && !s.chartGiven ? routine(k.t, s.ph, [
    [['study', 2.0], ['mark', 1.6], ['sight', 1.8], ['gust', 1.8]],
    [['study', 1.6], ['sight', 2.2], ['mark', 1.6], ['study', 1.8]],
    [['mark', 1.4], ['study', 1.6], ['gust', 1.8], ['sight', 2.4]]]) : null;
  workSound(s, RT, { mark:'work-pencil', gust:'page' });
  const hd = RT && (RT.name === 'study' || RT.name === 'mark') ? u.at(1, 1) : RT && RT.name === 'sight' ? u.at(0, -Math.round(swing(RT.u, .2, .85))) : u;
  face(hd, 0, -31, sk, { nose:true, mouth:'#b0705a' });
  hd.R(-3, -31, 3, 4, hair);
  hd.R(-3, -34, 7, 3, cap.c); hd.R(-3, -34, 7, 1, cap.l); hd.R(3, -32, 3, 1, cap.d);
  hd.R(-1, -35, 2, 2, BRASS.c); hd.R(2, -35, 2, 2, BRASS.c); hd.P(0, -34, '#bff4ff'); hd.P(3, -34, '#bff4ff');
  if(every(k.t, 4.5, .25, s.ph)) hd.P(3, -35, '#ffffff');
  if(moving){
    // the chart rolled tight under the near arm
    u.R(-3, -21, 8, 2, '#ecdcb0'); u.R(-3, -21, 8, 1, '#fff2cc'); u.P(-3, -20, '#8a6a4a');
    u.L(3, -24, 4 + (s.air ? 2 : 0), -20, 2, C.c); hand(u, 4 + (s.air ? 2 : 0), -20, sk);
    return;
  }
  // the chart (handed across once her survey is done)
  if(s.chartGiven){ k.L(3, -24, 5, -17, 2, C.c); hand(k, 5, -17, sk); return; }
  if(RT && RT.name === 'sight'){
    // the chart down at her side in one hand; the spyglass up to her eye in the other, a slow sweep along the road
    const up = swing(RT.u, .22, .82), sweep = Math.round(Math.sin(RT.at * 1.7) * up);
    k.R(4, -16, 7, 4, '#ecdcb0'); k.R(4, -16, 7, 1, '#fff2cc'); k.P(10, -13 + Math.round(Math.sin(k.t * 5) * .6), '#fff2cc');
    k.L(3, -24, 4, -17, 2, C.c); hand(k, 3, -16, sk);
    const gx = Math.round(-6 + up * 10), gy = Math.round(-19 - up * 11) + (up > .9 ? sweep : 0);
    k.L(-1, -24, gx, gy + 1, 2, C.d); hand(k, gx - 1, gy, sk);
    if(up > .5){ k.R(gx, gy - 1, 5, 2, BRASS.c); k.R(gx, gy - 1, 5, 1, BRASS.l); k.P(gx + 4, gy, BRASS.d); if(every(k.t, 1.3, .15, s.ph)) k.P(gx + 4, gy - 1, '#ffffff'); }
    else { k.R(gx - 1, gy - 2, 2, 4, BRASS.c); k.P(gx - 1, gy - 2, BRASS.l); }
    return;
  }
  // busy: the wind lifts the chart's corner and she slaps it flat (a gust beat), or it only stirs while she reads
  const gust = RT && RT.name === 'gust' ? RT.u : 0, slap = gust > .78;
  const lift = gust ? (slap ? 0 : -Math.round(Math.min(3, gust * 4) * (1 + Math.sin(k.t * 19) * .2))) : Math.round(Math.sin(k.t * 4.1 + s.ph) * .8);
  k.L(3, -24, 4, -19, 2, C.c);
  k.R(4, -23, 8, 6, '#ecdcb0'); k.R(4, -23, 8, 1, '#fff2cc'); k.R(11, -23 + lift, 1, 1, '#fff2cc');
  if(lift < -1){ k.R(10, -23 + lift, 2, -lift, '#ecdcb0'); k.P(11, -24 + lift, '#fff2cc'); }
  if(slap){ k.L(-2, -24, 9, -24, 2, C.c); hand(k, 9, -25, sk); }
  k.R(5, -21, 5, 1, '#8a6a4a'); k.R(7, -20, 1, 2, '#6a8aa0'); k.P(9, -19, '#c43a2a'); k.P(6, -18, '#8a6a4a');
  hand(k, 3, -20, sk);
  if(RT && RT.name === 'mark'){   // the pencil in short strokes across the sheet; the line grows as she draws
    const n = Math.min(4, Math.floor(RT.u * 5)), px = 6 + n + ((k.t * 9 | 0) % 2), py = -22 + ((k.t * 6 | 0) % 2);
    for(let i = 0; i < n; i++) k.P(6 + i, -22 + (i & 1), '#3a2a1e');
    k.L(-1, -24, px - 1, py + 2, 2, C.d); hand(k, px - 1, py + 1, sk); k.P(px, py - 1, '#c89a3a'); k.P(px + 1, py - 2, '#c89a3a');
  } else hand(k, 11, -20, sk);
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
  // (7.371) busy, sitting: one hand (the other is in the sling) winds the bandage round her knee, pulls it tight, holds
  // the end in her teeth to knot it, then tries the knee
  const RT = s.busy && low ? routine(k.t, s.ph, [
    [['wind', .9], ['wind', .9], ['wind', .9], ['tug', .8], ['bite', 1.0], ['flex', 1.1], ['rest', .8]],
    [['wind', .9], ['wind', .9], ['wind', .9], ['wind', .9], ['tug', .8], ['bite', 1.0], ['rest', 1.0]]]) : null;
  workSound(s, RT, { wind:'work-cloth', tug:'work-cloth' });
  const fk = RT && RT.name === 'flex' ? Math.round(swing(RT.u, .3, .6) * 2) : 0;
  // sitting on her bedroll, knees up; or standing
  if(low){ k.R(-4, -6, 6, 2, trouser); k.L(1, -6, 4 + fk, -9 + (fk >> 1), 2, trouser); k.L(4 + fk, -9 + (fk >> 1), 6 + fk, -3, 2, trouser); k.R(5 + fk, -2, 3, 2, BOOT); }
  else { const st = stride(k, s); k.R(-3 + st, -8, 2, 7, trouser); k.R(1 - st, -8, 2, 7, trouser); k.R(-3 + st, -2, 3, 2, BOOT); k.R(1 - st, -2, 3, 2, BOOT); }
  const sh = low ? -18 : -19, base = low ? 1 : 0;
  const knee = () => {
    const kx = 2 + fk, ky = -10 + (fk >> 1);
    k.R(kx, ky, 4, 2, sling); k.P(kx + 1, ky, '#fffaee');
    if(RT.name === 'wind'){   // round the knee: in front of it on the way down, hidden behind it on the way back up
      const a = RT.p * Math.PI * 2, front = Math.sin(a) >= 0, cx = kx + 1 + Math.round(Math.cos(a) * 3), cy = ky + Math.round(Math.sin(a) * 2);
      if(front){ k.L(-4, sh + 1, cx, cy, 2, J.d); hand(k, cx, cy, sk); }
      else { k.L(-4, sh + 1, kx - 1, ky - 1, 2, J.d); k.P(kx + 4, ky + 1, sk.d); }
      for(let i = 1; i < 4; i++) k.P(kx + 3 + i, ky + 1 + (i >> 1), i < 3 ? sling : '#cfc4ac');   // the roll's loose end
    } else if(RT.name === 'tug'){   // the end pulled hard back toward her
      const q = swing(RT.u, .35, .7), hx = kx + 3 - Math.round(q * 5), hy = ky - Math.round(q * 3);
      k.L(-4, sh + 1, hx, hy, 2, J.d); hand(k, hx, hy, sk); k.L(kx + 3, ky + 1, hx + 1, hy + 1, 1, sling);
    } else if(RT.name === 'bite'){   // the end up to her teeth, held there while the hand knots it
      const q = swing(RT.u, .3, .75), hx = kx + 1 + Math.round(q * -2), hy = ky - Math.round(q * 10);
      k.L(-4, sh + 1, hx, hy, 2, J.d); hand(k, hx, hy, sk); k.L(kx + 2, ky, hx + 1, hy, 1, sling);
    } else { k.L(-4, sh + 1, kx + 1, ky - 1, 2, J.d); hand(k, kx + 1, ky - 2, sk); }   // flex / rest: the hand on the knee
  };
  if(!RT){ k.L(-4, sh + 1, -5, sh + 8, 2, J.d); hand(k, -6, sh + 8, sk); }
  k.poly([[-4, sh], [4, sh], [4, base - 7], [-4, base - 7]], J);
  for(let i = 0; i < 9; i++) k.R(-4 + i, sh + 1 + i, 2, 1, i < 2 ? R.l : R.c);                 // the sash
  k.R(1, sh + 4, 4, 3, sling); k.R(1, sh + 4, 4, 1, '#fffaee'); k.L(0, sh, 3, sh + 4, 1, '#cfc4ac'); // the sling
  if(RT) knee();   // in front of her: the knee is drawn up before her
  // the head, the headband and its tails (bowed over the bandage while she works)
  if(RT) k = RT.name === 'bite' ? k.at(1, Math.round(swing(RT.u, .3, .75) * 2)) : RT.name === 'tug' ? k.at(0, 0) : RT.name === 'wind' ? k.at(1, 1) : k.at(0, Math.round(fk / 2));
  face(k, -1, sh - 5, sk, { ey:2, mouth:'#8a4a3a' });
  k.R(-3, sh - 6, 6, 2, hair); k.R(-3, sh - 4, 2, 3, hair);
  k.R(-3, sh - 5, 6, 1, R.l); k.P(3, sh - 5, R.c);
  for(let i = 0; i < 7; i++){ const w = Math.round(Math.sin(k.t * 4.2 + s.ph - i * .75) * (i * .3)); k.P(-4 - i, sh - 5 + (i >> 1) + w, i % 2 ? R.c : R.l); if(i < 5) k.P(-4 - i, sh - 4 + (i >> 1) + w, R.d); }
  // what her free hand holds, by region
  if(low && !s.prop){   // (7.372) her fire ("the fire's for anyone"): stones, crossed logs, flames, embers rising, its glow
    const fx = 14; k.glow(fx, -5, 34, '255,150,70', .28); k.glow(fx, -4, 12, '255,210,140', .3);
    for(const [dx, c] of [[-4, '#6a645c'], [-2, '#7a746a'], [2, '#6a645c'], [4, '#5a554e']]) k.R(fx + dx, -2, 2, 2, c);
    k.L(fx - 3, -1, fx + 3, -3, 1, WOOD.d); k.L(fx - 3, -3, fx + 3, -1, 1, WOOD.c);
    const fl = k.t * 9 + s.ph * 5; k.R(fx - 1, -5, 3, 3, '#ff8a30'); k.R(fx, -7 - (Math.sin(fl) > .3 ? 1 : 0), 1, 3, '#ffc040'); k.P(fx - 1, -6 - (Math.sin(fl * 1.3) > 0 ? 1 : 0), '#ff7a2a'); k.P(fx + 1, -6 - (Math.sin(fl * .8 + 1) > .2 ? 1 : 0), '#ffb040'); k.P(fx, -4, '#fff4c0');
    for(let i = 0; i < 3; i++){ const q = (k.t * .7 + i / 3 + s.ph) % 1; k.alpha(1 - q, () => k.P(fx + Math.round(Math.sin(q * 7 + i * 2) * 2), -8 - Math.round(q * 14), q < .5 ? '#ffb040' : '#ff7030')); }
  }
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
  // (7.371) busy: a pot on the embers beside her; she stirs it, tastes from the ladle, knocks it on the rim
  const RT = s.busy && !s.sit ? routine(k.t, s.ph, [
    [['stir', 2.4], ['taste', 1.4], ['stir', 1.6], ['tap', .8], ['rest', .4]],
    [['stir', 2.0], ['tap', .8], ['stir', 1.6], ['taste', 1.4], ['rest', .8]]]) : null;
  workSound(s, RT, { tap:'work-ladle' });
  if(!s.sit && !s.walk){   // her pot in front of her: iron, on three stones, embers under it, steam off the top
    const px = 8;
    k.R(px - 1, -2, 2, 2, '#5a5650'); k.R(px + 9, -2, 2, 2, '#5a5650'); k.R(px + 4, -1, 2, 1, '#5a5650');
    const em = Math.sin(k.t * 9) > 0; k.P(px + 2, -2, em ? '#ff9a30' : '#e0602a'); k.P(px + 6, -2, em ? '#e0602a' : '#ffc040'); k.glow(px + 5, -3, 10, '255,140,60', .18);
    k.R(px, -9, 10, 7, IRON.d); k.R(px + 1, -9, 8, 6, '#3a3e44'); k.R(px - 1, -10, 12, 1, IRON.l); k.R(px, -9, 10, 1, '#5a3a22');
    steam(k, px + 5, -11, 4, 10, s.ph, '#e8e4dc');
  }
  if(RT){
    const px = 8;
    hand(k, -6, b - 12, sk);   // the other hand on her hip
    let hx, hy, tx, ty;   // the stirring hand and the ladle's bowl
    if(RT.name === 'stir'){ const a = RT.at * 5.2 + s.ph * 6; tx = px + 4 + Math.round(Math.cos(a) * 3); ty = -9 + Math.round(Math.sin(a) * .7); hx = 5 + Math.round(Math.cos(a) * 1.4); hy = b - 11 + Math.round(Math.sin(a) * .6); }
    else if(RT.name === 'taste'){ const q = swing(RT.u, .3, .75); tx = Math.round(px + 4 - q * 9); ty = Math.round(-9 - q * 7); hx = Math.round(5 - q * 2); hy = Math.round(b - 11 - q * 3);
      if(RT.u > .3 && RT.u < .75) steam(k, tx + 1, ty - 1, 2, 4, s.ph * 2, '#f2f0ea'); }
    else if(RT.name === 'tap'){ const knock = (RT.u * 2) % 1 < .3; tx = px + 8; ty = knock ? -10 : -12; hx = 6; hy = b - 12; if(knock) k.P(px + 10, -11, '#fff2c8'); }
    else { tx = px + 5; ty = -10; hx = 5; hy = b - 11; }
    RT._hx = hx; RT._hy = hy; RT._lad = () => { k.L(hx + 1, hy + 1, tx + 1, ty - 1, 1, WOOD.l); k.R(tx, ty, 3, 2, WOOD.c); k.P(tx, ty, WOOD.l); };
  } else {
  // the ladle, stirring the air
  const sp = 3, cx = Math.round(Math.cos(k.t * sp + s.ph)), cy = Math.round(Math.sin(k.t * sp + s.ph));
  k.L(-5, b - 11, -7 + cx, b - 20 + cy, 1, WOOD.l); k.R(-9 + cx, b - 22 + cy, 3, 2, WOOD.c); k.P(-9 + cx, b - 22 + cy, WOOD.l);
  hand(k, -6, b - 12, sk);
  }
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
  if(RT){ RT._lad(); hand(k, RT._hx, RT._hy, sk); }
  else if(slide < 99){ const bx = 4 + slide; k.R(bx, b - 12, 5, 2, '#e0d2b0'); k.R(bx, b - 12, 5, 1, '#fff6dc'); k.R(bx + 1, b - 10, 3, 1, '#b8a888'); steam(k, bx + 2, b - 13, 3, 7, s.ph); }
  if(!RT) hand(k, 4, b - 11, sk);
  if(s.bad){ const ext = Math.round(Math.min(1, (s.at || 9) / 1.5) * 5); k.L(4, b - 13, 6 + ext, b - 13, 2, R.c); hand(k, 7 + ext, b - 14, sk); }
};

/* BRAM · Black Woods · the lantern-keeper. The tallest man in the woods: a bone-white duster to the ankles, an
   amber scarf, a tall bent lamplighter's cone of a cap, the big iron lantern at his side (it swings; it glows
   once he trusts you), the lighting pole over his shoulder. */
D.bram = (k, s) => {
  const C = pal('#d8d0b8', '#f6f0de', '#9a927a'), A = pal('#e0a030', '#ffcc60', '#9a6a14'), sk = SKIN.tan, cap = pal('#2e2c38', '#4c4a5a', '#1a1822'), hair = '#3a2a20';
  shadow(k, 14);
  // (7.371) busy: his lantern's glass polished with a rag, the wick trimmed (the flame jumps), and the lantern lifted
  // high to look off into the dark; between times it hangs at his side
  const RT = s.busy && !s.walk && !s.handedOver ? routine(k.t, s.ph, [
    [['polish', 2.0], ['trim', 1.6], ['raise', 1.4], ['rest', 1.0]],
    [['raise', 1.6], ['rest', .8], ['polish', 2.2], ['trim', 1.4]]]) : null;
  workSound(s, RT, { polish:'work-rag', trim:'work-tinker' });
  const pole = !RT || RT.name === 'rest' || RT.name === 'raise';
  if(pole){ k.L(-5, -25, -8, -43, 1, WOOD.c); k.P(-8, -44, BRASS.l); k.P(-7, -45, BRASS.c); }   // the lighting pole
  else { k.L(-12, -1, -9, -34, 1, WOOD.c); k.P(-9, -35, BRASS.l); }                              // leant against him while his hands are busy
  const st = stride(k, s, 1);
  k.R(-3 + st, -5, 2, 4, '#3a3834'); k.R(1 - st, -5, 2, 4, '#3a3834'); k.R(-3 + st, -2, 3, 2, BOOT); k.R(1 - st, -2, 3, 2, BOOT);
  if(pole) { k.L(-4, -25, -5, -18, 2, C.d); hand(k, -6, -18, sk); }
  k.poly([[-4, -27], [4, -27], [6, -4], [-6, -4]], C);
  k.R(1, -22, 1, 18, C.d); k.P(2, -20, '#8a826c'); k.P(2, -16, '#8a826c'); k.P(2, -12, '#8a826c');
  k.R(-4, -27, 9, 2, A.c); k.R(-4, -27, 9, 1, A.l);
  const sw = Math.round(Math.sin(k.t * 2.6 + s.ph) * 1.2); k.R(-6, -25, 2, 6 + (sw > 0 ? 1 : 0), A.c); k.P(-6, -25, A.l);
  face(k, 0, -32, sk, { w:3, h:5, ey:1, nose:true });
  k.R(-3, -32, 3, 4, hair); k.R(0, -28, 3, 1, '#8a6a50');
  k.R(-3, -34, 7, 2, cap.c); k.R(-3, -34, 7, 1, cap.l); k.R(-2, -36, 5, 2, cap.c); k.P(-2, -36, cap.l);
  k.R(-2, -38, 3, 2, cap.c); k.P(-3, -39, cap.c); k.P(-4, -40, cap.l);
  // the lantern (it is on the post once the lesson is over)
  let ly = 0, lxo = 0;
  if(RT && RT.name === 'raise'){ const q = swing(RT.u, .3, .8); ly = -Math.round(q * 14); lxo = Math.round(q * 2); }
  else if(RT && (RT.name === 'polish' || RT.name === 'trim')){ ly = -5; lxo = -1; }
  k.L(4, -25, 6 + lxo, -17 + ly, 2, C.c); hand(k, 5 + lxo, -17 + ly, sk);
  if(!s.handedOver){
    const lx = 6 + lxo + (RT && RT.name !== 'rest' ? 0 : Math.round(Math.sin(k.t * 2.2 + s.ph) * (s.walk ? 1.5 : .8))), lit = s.lit;
    const jump = RT && RT.name === 'trim' && RT.u > .5 && RT.u < .7, open = RT && RT.name === 'trim' && RT.u > .2 && RT.u < .85;
    k.R(lx, -16 + ly, 1, 2, IRON.c);
    k.R(lx - 3, -14 + ly, 7, 1, IRON.l); k.R(lx - 3, -13 + ly, 7, 9, '#3e3e2a'); k.R(lx - 2, -12 + ly, 5, 7, lit ? '#ffe9a0' : '#8d8859'); k.R(lx, -12 + ly, 1, 7, lit ? '#fff8d8' : '#a8a070');
    if(open){ k.R(lx + 3, -13 + ly, 2, 7, '#3e3e2a'); k.P(lx, -9 + ly, jump ? '#ffffff' : '#ffb040'); }   // the little door swung open
    k.R(lx - 3, -5 + ly, 7, 1, IRON.d);
    if(lit || jump){ k.glow(lx, -9 + ly, jump ? 40 : 30, '255,214,120', jump ? .45 : .32); k.glow(lx, -9 + ly, 10, '255,236,170', .35); }
    if(RT && RT.name === 'polish'){   // the rag in circles on the glass
      const a = RT.at * 6.5, rx = lx - 2 + Math.round(Math.cos(a) * 1.5), ry = -10 + ly + Math.round(Math.sin(a) * 2);
      k.L(-4, -25, rx - 1, ry + 1, 2, C.d); k.R(rx - 1, ry - 1, 3, 3, '#cfc6b0'); hand(k, rx, ry, sk);
    } else if(RT && RT.name === 'trim'){   // fingers in at the wick
      const fx = lx + 1 + (open ? 2 : 4), fy = -10 + ly + Math.round(Math.sin(RT.at * 12) * .6);
      k.L(-4, -25, fx - 1, fy, 2, C.d); hand(k, fx, fy, sk);
    }
  }
};

/* OREN · the chainwright (the Causeway, the Updrafts, the Keep, Emberdeep to the Throne). The widest man in the
   world: bald, a black spade beard, a copper leather apron, a chain worn like a bandolier with a loop at his hip
   that swings, the sledge resting head-down beside him (on his shoulder when he walks). */
D.oren = (k, s) => {
  const A = pal('#c0652a', '#ec8e4a', '#7a3c16'), SHIRT = pal('#4e4a50', '#6c6872', '#322e36'), sk = SKIN.tan, beard = '#2e1c14', trouser = '#3a302a';
  // (7.373) busy: works a link of the bandolier chain, hefts the sledge and lets it fall, wipes his scalp, rests
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [
    [['link', 2.2], ['heft', 1.6], ['rest', 1.2], ['wipe', 1.0]],
    [['link', 1.6], ['wipe', 1.0], ['link', 1.4], ['heft', 1.6], ['rest', .4]]]) : null;
  workSound(s, RT, { link:'work-chain', heft:'work-hammer' });
  shadow(k, 18);
  const st = stride(k, s);
  k.R(-5 + st, -6, 4, 5, trouser); k.R(1 - st, -6, 4, 5, trouser); k.R(-5 + st, -2, 5, 2, BOOT); k.R(1 - st, -2, 5, 2, BOOT);
  k.L(-7, -19, -8, -11, 3, SHIRT.d); k.R(-9, -12, 3, 3, sk.c);
  k.poly([[-7, -21], [7, -21], [8, -13], [6, -6], [-6, -6], [-8, -13]], SHIRT);
  k.poly([[-4, -17], [4, -17], [5, -5], [-5, -5]], A);
  k.R(-4, -21, 1, 4, A.d); k.R(3, -21, 1, 4, A.d); k.R(-1, -11, 3, 2, A.d);
  // the head sits straight on the shoulders
  const bob = RT ? (RT.name === 'link' ? 2 : RT.name === 'heft' ? Math.round(swing(RT.u, .4, .7)) : 0) : every(k.t, 2.4, 1.2, s.ph) ? 1 : 0;
  k.R(-3, -27 + bob, 6, 6, sk.c); k.R(-2, -28 + bob, 4, 1, sk.l); k.P(-3, -27 + bob, sk.l); k.P(-2, -24 + bob, sk.d);
  k.R(0, -25 + bob, 3, 1, '#7a4a30'); k.P(0, -24 + bob, EYE); k.P(2, -24 + bob, EYE); k.P(3, -23 + bob, sk.c);
  k.R(-1, -22 + bob, 5, 3, beard); k.R(0, -19 + bob, 4, 3, beard); k.P(1, -16 + bob, beard); k.P(0, -21 + bob, '#5a3a2a');
  // the chain: shoulder to hip, and a loop that swings
  const sw = Math.sin(k.t * 2.2 + s.ph) * 1.5;
  chain(k, [[-6, -20], [-2, -15], [2, -11], [5, -8]], 5);
  chain(k, [[5, -8], [7 + sw * .6, -5], [5 + sw, -3], [3, -6]]);
  if(RT && RT.name === 'link'){ const tap = ((RT.at * 3.2) | 0) % 2; k.L(-7, -19, -3, -15 - tap, 2, SHIRT.c); k.R(-4, -16 - tap, 3, 3, sk.c); k.P(-4, -16 - tap, sk.l); }
  else if(RT && RT.name === 'wipe'){ const q = swing(RT.u, .3, .7); k.L(-7, -19, -3, Math.round(-15 - q * 11), 2, SHIRT.c); k.R(-4, Math.round(-16 - q * 11), 3, 3, sk.c); }
  // the sledge
  if(s.walk){ k.L(6, -18, 2, -26, 1, WOOD.c); k.R(-1, -30, 5, 4, IRON.c); k.R(-1, -30, 5, 1, IRON.l); k.L(5, -19, 7, -15, 3, SHIRT.c); k.R(5, -20, 3, 3, sk.c); }
  else { const up = RT && RT.name === 'heft' ? (RT.u < .7 ? ease(RT.u / .7) : 1 - Math.min(1, (RT.u - .7) / .08)) * 9 | 0 : 0;   // up slowly, dropped
    k.R(10, -12 - up, 1, 9, WOOD.c); k.R(8, -4 - up, 6, 4, IRON.c); k.R(8, -4 - up, 6, 1, IRON.l); k.P(13, -3 - up, IRON.d); k.L(6, -19, 8, -13 - up, 3, SHIRT.c); k.R(8, -14 - up, 3, 3, sk.c); k.P(8, -14 - up, sk.l);
    if(RT && RT.name === 'heft' && RT.u > .78 && RT.u < .9) for(let i = 0; i < 3; i++) k.P(7 + i * 3, -1 - (i & 1), '#b8a890'); }
};

/* SILAS · the Causeway · the clockwork defector. Stiff and narrow, a verdigris coat with a column of brass buttons,
   a tall shako; the wind-up key in his back turns while the Governor Gear still walks him (it stops when he is
   free, and he sits down in the sun). His legs do not bend. */
D.silas = (k, s) => {
  const C = pal('#2e8a84', '#5cbcb2', '#1a5450'), sk = SKIN.pale, shako = pal('#20282c', '#3a464c', '#101416'), trouser = '#23282c';
  shadow(k, 12);
  const free = s.good || s.o.governorStopped;
  // (7.373) busy (still wound): stands to attention, polishes a button with his cuff, a jerk of the head, a salute
  const RT = s.busy && !s.sit && !s.walk ? routine(k.t, s.ph, [
    [['stand', 1.5], ['polish', 1.6], ['jerk', .6], ['stand', .9], ['salute', 1.2]],
    [['polish', 1.4], ['stand', 1.2], ['salute', 1.2], ['jerk', .6], ['stand', 1.4]]]) : null;
  workSound(s, RT, { polish:'work-rag', jerk:'work-tinker' });
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
  if(RT && RT.name === 'polish'){ const a = RT.at * 9; const hx = 2 + Math.round(Math.cos(a)), hy = b - 19 + Math.round(Math.sin(a) * 2); k.L(4, b - 23, hx + 1, hy, 2, C.c); hand(k, hx, hy, sk); }
  else if(RT && RT.name === 'salute'){ const q = swing(RT.u, .2, .8); k.L(4, b - 23, 4, Math.round(b - 23 - q * 6), 2, C.c); hand(k, Math.round(3 - q), Math.round(b - 13 - q * 18), sk); }
  else { k.R(4, b - 23, 2, 10, C.c); hand(k, 4, b - 13, sk); }
  if(RT && RT.name === 'jerk' && RT.u < .5) k = k.at(((RT.at * 20) | 0) % 2, 0);
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
  // (7.373) busy: knots the stretcher's strap tight, drinks from the cup, tugs the poles to test them
  const RT = s.busy ? routine(k.t, s.ph, [
    [['knot', 1.8], ['sip', 1.4], ['check', 1.4], ['knot', 1.2]],
    [['sip', 1.6], ['knot', 2.0], ['check', 1.2], ['rest', 1.0]]]) : null;
  workSound(s, RT, { knot:'work-rope', check:'work-rope' });
  if(RT && RT.name === 'sip'){   // the cup up from the ground to his mouth and back
    const q = swing(RT.u, .3, .75), cx = Math.round(7 - q * 5), cy = Math.round(-3 - q * 18);
    k.L(3, -16, cx - 1, cy + 2, 2, C.c); hand(k, cx - 1, cy + 1, sk); k.R(cx, cy, 3, 3, '#9aa4a8'); k.R(cx, cy, 3, 1, '#c9ced0'); steam(k, cx + 1, cy - 1, 2, 5, s.ph);
    hand(k, 3, -13, sk);
  } else if(RT && RT.name === 'check'){   // a tug on the poles over his shoulder, a look up at them
    const t2 = ((RT.at * 4) | 0) % 2; k.L(2, -18, -5, -30 - t2, 2, C.c); hand(k, -6, -31 - t2, sk); hand(k, 3, -13, sk);
    k.R(7, -3, 3, 3, '#9aa4a8'); k.R(7, -3, 3, 1, '#c9ced0'); steam(k, 8, -4, 2, 6, s.ph);
  } else if(RT){   // knot / rest: both hands up at the pole, pulling a knot tight; the cup steams on the ground
    const pull = RT.name === 'knot' && ((RT.at * 2.4) % 1) < .3 ? 1 : 0;
    k.L(2, -18, -3, -22 - pull, 2, C.c); hand(k, -4, -23 - pull, sk); k.L(3, -16, -2, -18 + pull, 2, C.c); hand(k, -3, -19 + pull, sk);
    k.R(-6, -22, 2, 1, '#6a4a30'); k.P(-4 - pull, -21, '#6a4a30');
    k.R(7, -3, 3, 3, '#9aa4a8'); k.R(7, -3, 3, 1, '#c9ced0'); steam(k, 8, -4, 2, 6, s.ph);
  } else {
  hand(k, 3, -13, sk); hand(k, 7, -13, sk);
  k.R(5, -14, 3, 3, '#9aa4a8'); k.R(5, -14, 3, 1, '#c9ced0');
  if(s.water) k.P(6, -14, '#9fd8f0');
  steam(k, 6, -15, 2, 6, s.ph);
  }
};

/* THE CARTOGRAPHER · the Updrafts · blind. Stooped forward over a cane, a plum robe, a long white beard, a
   blindfold; a quiver of map rolls on his back; the brass ear-trumpet held up, turning to find the wind. */
D.cartographer = (k, s) => {
  const C = pal('#7c3470', '#aa5a9a', '#4c1c44'), sk = SKIN.fair, beard = pal('#ece8e0', '#ffffff', '#bab4aa');
  const b = s.sit ? -5 : 0;
  // (7.373) busy: listens through the trumpet for the wind, draws a map roll from the quiver and feels its edge
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [
    [['listen', 2.4], ['feel', 2.0], ['listen', 1.6]],
    [['feel', 1.8], ['listen', 2.6], ['nod', 1.6]]]) : null;
  workSound(s, RT, { feel:'work-pages' });
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
  const mx = Math.round((ex + tx) / 2), my = Math.round((ey + ty) / 2);
  if(RT && RT.name === 'feel'){   // the trumpet lowered; the hand back to the quiver, a roll drawn half out and fingered
    const q = swing(RT.u, .25, .8), rx = -9, ry = Math.round(b - 30 - q * 5);
    k.L(-2, b - 18, rx + 1, ry + 3, 2, C.c); hand(k, rx, ry + 2, sk); k.R(rx, ry - 3, 2, 5, '#efe2c0'); if(q > .9 && ((RT.at * 6) | 0) % 2) k.P(rx + 1, ry - 3, '#c43030');
  } else { k.L(-2, b - 18, mx, my + 1, 2, C.c); hand(k, mx - 1, my, sk); }
  if(every(k.t, 3, .8, s.ph)){ const p = ((k.t + s.ph * 3) % 3) / .8; k.alpha(1 - p, () => { k.P(tx - 3 - Math.round(p * 3), ty - 3, '#cfe8ff'); k.P(tx - 3 - Math.round(p * 3), ty - 1, '#cfe8ff'); k.P(tx - 4 - Math.round(p * 3), ty - 2, '#cfe8ff'); }); }
};

/* THE RECRUIT · Marksman road · borrowed courage. Short and skinny, knees knocking, a scarlet tabard, big ears and a
   ginger tuft — until you bring his uncle's helmet, which is far too big for him (brass, a red plume, down over
   his eyes). He keeps glancing both ways. */
D.recruit = (k, s) => {
  const C = pal('#cc3a32', '#f06454', '#86201a'), sk = SKIN.fair, hair = '#e07a2a', mail = '#8a8e96';
  // (7.373) busy: drills with the little shield (up, a jab), knees knocking, a nervous look back, a deep breath
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [
    [['drill', 2.0], ['shake', .8], ['look', 1.0], ['breathe', 1.2], ['drill', 1.2]],
    [['breathe', 1.0], ['drill', 2.4], ['look', 1.2], ['shake', 1.6]]]) : null;
  workSound(s, RT, { drill:'swing' });
  shadow(k, 10);
  const st = stride(k, s), shake = !s.walk && (RT ? RT.name === 'shake' : every(k.t, 2.2, .5, s.ph)) ? Math.round(Math.sin(k.t * 40)) : 0;
  if(RT && RT.name === 'breathe') k = k.at(0, -Math.round(swing(RT.u, .4, .6)));
  k.R(-2 + st + shake, -7, 2, 6, '#3a3430'); k.R(1 - st, -7, 2, 6, '#3a3430'); k.R(-2 + st + shake, -2, 3, 2, BOOT); k.R(1 - st, -2, 3, 2, BOOT);
  const sh = RT && RT.name === 'drill' ? swing((RT.u * 2) % 1, .3, .6) : 0, sx = Math.round(sh * 9), sy = -Math.round(sh * 3);
  k.R(-6 + sx, -14 + sy, 3, 6, '#8a6a44'); k.P(-6 + sx, -14 + sy, '#a88a5c'); k.P(-5 + sx, -12 + sy, BRASS.c);                        // a small round shield
  k.poly([[-3, -15], [3, -15], [4, -6], [-4, -6]], C);
  k.R(-3, -15, 7, 1, mail); k.R(-1, -12, 2, 2, BRASS.l);
  k.R(3, -14, 2, 5, mail); hand(k, 3, -9, sk);
  const h = (RT ? RT.name === 'look' && RT.u > .15 && RT.u < .85 : s.look < 0) ? k.flip() : k;
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
  // (7.373) busy: reads, turns a page, pushes his spectacles up, hitches the tower of books on his back
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [
    [['read', 2.0], ['turn', .8], ['read', 1.6], ['specs', 1.0], ['hitch', 1.2]],
    [['read', 1.4], ['turn', .8], ['hitch', 1.2], ['read', 2.0], ['turn', .8], ['specs', .4]]]) : null;
  workSound(s, RT, { turn:'work-pages', hitch:'work-rope' });
  shadow(k, 14);
  const books = [['#3a5a8a', 7, 3], ['#8a6a2a', 6, 2], ['#6a2a2a', 7, 3], ['#2a5a4a', 6, 2], ['#c8b890', 7, 2], ['#4a3a6a', 5, 3], ['#8a3a2a', 6, 2]];
  const hb = RT && RT.name === 'hitch' ? -Math.round(swing(RT.u, .3, .5) * 2) : 0;
  let yy = -18 + hb; k.R(-6, -18 + hb, 1, 16, WOOD.d);
  books.forEach(([col, w, h], i) => { yy -= h; const dx = -10 + (i % 2) - (i === 6 ? 1 : 0); k.R(dx, yy, w, h, col); k.R(dx, yy, w, 1, '#e8dcc0'); k.P(dx + w - 1, yy + h - 1, '#1a1418'); });
  k.R(-10, -24 + hb, 8, 1, '#4a3020'); k.R(-10, -32 + hb, 8, 1, '#4a3020');
  k.R(-2, -5, 2, 4, '#2a2228'); k.R(1, -5, 2, 4, '#2a2228'); k.R(-2, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT);
  k.poly([[-4, -25], [4, -25], [5, -4], [-5, -4]], C);
  k.R(0, -23, 1, 18, C.d);
  const hk = RT && (RT.name === 'read' || RT.name === 'turn') ? k.at(1, 1) : k;
  face(hk, -1, -30, sk, { h:5, ey:2, nose:true });
  hk.R(-3, -31, 3, 5, hair); hk.R(-1, -31, 3, 1, hair);
  hk.P(0, -28, BRASS.c); hk.P(2, -28, BRASS.c); hk.P(1, -28, BRASS.d);
  if(RT && RT.name === 'specs' && RT.u > .2 && RT.u < .8){ k.L(-2, -23, 1, -27, 2, C.d); hand(k, 0, -28, sk); }
  // the open book, and a page that turns
  k.L(2, -23, 4, -18, 2, C.c); hand(k, 3, -18, sk); hand(k, 9, -18, sk);
  k.R(3, -20, 7, 3, C.d); k.R(4, -21, 6, 3, '#f0e6cc'); k.R(6, -21, 1, 3, '#b8ac90');
  const p = RT ? (RT.name === 'turn' ? RT.u : 2) : ((k.t + s.ph * 3.5) % 3.5) / .5;
  if(p < 1){ const col = Math.round(9 - p * 4); k.R(col, -22 + (p > .3 && p < .7 ? -1 : 0), 1, 3, '#fffaf0'); }
};

/* THE SERVICE KEEPER · the Gaol · "work order". Short, wide, pot-bellied in khaki with brass buttons, a peaked cap
   with a red band; the clipboard, the pencil tapping on it, and now and then an enormous yawn. */
D.servicekeeper = (k, s) => {
  const C = pal('#b08a4e', '#d8b474', '#735830'), sk = SKIN.ruddy, cap = '#6a5230';
  // (7.373) busy: writes on the clipboard, taps the pencil thinking, yawns enormously, looks back down the cells
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [
    [['write', 2.0], ['tap', 1.4], ['yawn', 1.2], ['look', 1.2], ['write', 1.2]],
    [['tap', 1.2], ['write', 2.4], ['look', 1.0], ['yawn', 1.4], ['tap', 1.0]]]) : null;
  workSound(s, RT, { write:'work-pencil' });
  shadow(k, 15);
  k.R(-4, -6, 3, 5, '#4a3e2e'); k.R(1, -6, 3, 5, '#4a3e2e'); k.R(-4, -2, 4, 2, BOOT); k.R(1, -2, 4, 2, BOOT);
  k.L(-5, -18, -6, -11, 2, C.d); hand(k, -7, -11, sk);
  k.poly([[-5, -19], [5, -19], [7, -13], [6, -6], [-6, -6], [-6, -13]], C);
  k.R(-5, -7, 11, 1, '#3a2a1a'); k.P(0, -7, BRASS.l);
  k.P(3, -17, BRASS.l); k.P(5, -14, BRASS.l); k.P(5, -11, BRASS.l);
  const yawn = RT ? RT.name === 'yawn' && RT.u > .15 && RT.u < .85 : every(k.t, 7, .9, s.ph);
  if(RT && RT.name === 'look' && RT.u > .15 && RT.u < .85) k = k.flip();
  face(k, -1, -24, sk, { h:5, ey:2, eyes:!yawn, nose:true });
  if(!yawn){ k.P(0, -23, sk.d); k.P(2, -23, sk.d); }
  k.R(-1, -20, 5, 1, sk.c); k.R(1, -21, 3, 1, '#6a4028');
  if(yawn){ k.R(1, -21, 2, 2, '#5a2020'); k.P(0, -22, EYE); k.P(2, -22, EYE); }
  k.R(-3, -27, 7, 3, cap); k.R(-3, -27, 7, 1, '#8a6e44'); k.R(-3, -25, 7, 1, '#c8342c'); k.R(2, -24, 4, 1, '#1a1414'); k.P(1, -26, BRASS.l);
  k.R(6, -17, 4, 7, '#8a6a44'); k.R(7, -16, 2, 5, '#f0ead8'); k.P(7, -15, '#7a7a7a'); k.P(7, -13, '#7a7a7a');
  hand(k, 5, -12, sk);
  if(RT && RT.name === 'write'){ const wx = 6 + ((RT.at * 7) | 0) % 3, wy = -15 + ((RT.at * 2.5) | 0) % 4;   // the pencil across the sheet
    k.L(-5, -18, wx - 1, wy + 2, 2, C.d); hand(k, wx - 1, wy + 1, sk); k.P(wx, wy, '#e0c040'); }
  else { const tap = (RT ? RT.name === 'tap' && ((RT.at * 3) % 1) < .2 : every(k.t, .9, .15, s.ph)) ? 1 : 0;
  k.L(-6, -11, -3, -14 - tap, 1, '#e0c040'); }
};

/* NIM · Frostfell · the frost tender. The smallest person you lead: a saffron parka, a fur-ringed hood, red mittens,
   breath smoking in the cold, the banked flame held out in its iron cage (raised while you walk together). */
D.nim = (k, s) => {
  const C = pal('#e8a42a', '#ffd064', '#9a6614'), fur = '#f4efe6', sk = SKIN.fair;
  // (7.373) busy (waiting): warms her mittens at the flame, blows into them, stamps her feet against the cold
  const RT = s.busy && !s.walk && !s.follow ? routine(k.t, s.ph, [
    [['warm', 2.2], ['blow', 1.2], ['stamp', 1.4], ['warm', 1.2]],
    [['stamp', 1.2], ['warm', 2.0], ['blow', 1.4], ['look', 1.4]]]) : null;
  workSound(s, RT, { stamp:'step-snow' });
  shadow(k, 12);
  const st = RT && RT.name === 'stamp' ? (((RT.at * 4) | 0) % 2 ? 1 : -1) : stride(k, s, 1);
  const lift = RT && RT.name === 'stamp' ? (((RT.at * 4) % 1) < .5 ? 1 : 0) : 0;
  k.R(-3 + st, -3 - lift, 3, 2, '#5a3a2a'); k.R(1 - st, -3, 3, 2, '#5a3a2a'); k.R(-3 + st, -2 - lift, 3, 2, BOOT); k.R(1 - st, -2, 3, 2, BOOT);
  k.poly([[-5, -13], [5, -13], [6, -3], [-6, -3]], C);
  k.R(-6, -4, 12, 1, fur); k.R(0, -12, 1, 8, C.d);
  k.R(-4, -19, 8, 7, C.c); k.R(-4, -19, 8, 1, C.l); k.P(-4, -18, C.l);
  if(RT && RT.name === 'look' && RT.u > .2 && RT.u < .8) k = k.flip();
  k.R(-1, -18, 5, 5, fur); face(k, 0, -17, sk, { w:3, h:3, ey:0, cheek:'#f09090' });
  if(RT && RT.name === 'blow'){ k.R(2, -15, 3, 2, '#c8402c'); const p = (RT.at * 1.8) % 1; k.alpha(.7 * (1 - p), () => { k.P(5 + Math.round(p * 2), -16 - Math.round(p * 3), '#ffffff'); k.P(4 + Math.round(p * 3), -17 - Math.round(p * 3), '#e8f4ff'); }); }
  if(every(k.t, 2.3, .7, s.ph)){ const p = ((k.t + s.ph * 2.3) % 2.3) / .7; k.alpha(.6 * (1 - p), () => { k.P(4 + Math.round(p * 3), -15 - Math.round(p * 2), '#ffffff'); k.P(5 + Math.round(p * 3), -15 - Math.round(p * 2), '#e8f4ff'); }); }
  // the flame in its cage
  const up = s.follow ? 5 : s.done ? -1 : 2;
  k.L(3, -11, 6, -8 - up, 2, C.c); k.R(5, -9 - up, 2, 2, '#c8402c');
  if(RT && RT.name === 'warm'){ const r = Math.round(Math.sin(RT.at * 3)); k.L(-3, -11, 5, -10 - up + r, 2, C.c); k.R(5, -11 - up + r, 2, 2, '#c8402c'); }   // the other mitten held to the cage
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
  // (7.373) busy: sips from the glued cup, holds it in both hands to warm them, shivers
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [
    [['hold', 2.0], ['sip', 1.6], ['shiver', 1.0], ['hold', 1.4]],
    [['sip', 1.6], ['hold', 2.6], ['shiver', 1.8]]]) : null;
  const tremble = (RT ? RT.name === 'shiver' : every(k.t, 3, .4, s.ph)) ? Math.round(Math.sin(k.t * 30) * .6) : 0;
  const sip = RT && RT.name === 'sip' ? swing(RT.u, .3, .75) : 0, cdx = Math.round(sip * 1), cdy = -Math.round(sip * 5);
  k.poly([[-6, b - 12], [-2, b - 16], [3, b - 14], [5, b - 4], [-6, b - 3]], C);
  k.P(-4, b - 11, C.l); k.R(-3, b - 8, 2, 2, '#e8b0c0'); k.R(1, b - 11, 2, 2, C.d); k.R(-1, b - 5, 2, 2, '#d88aa4'); k.P(3, b - 7, C.l);
  face(k, 3 + tremble, b - 15, sk, { w:3, h:4, ey:1, nose:true });
  k.R(1 + tremble, b - 16, 3, 2, hair); k.P(0 + tremble, b - 17, hair); k.P(1 + tremble, b - 17, '#ffffff');
  if(!s.sit){ k.R(8, b - 11, 1, 10, WOOD.c); k.P(7, b - 12, WOOD.l); hand(k, 7, b - 11, sk); }
  k.R(3 + cdx, b - 9 + cdy, 3, 3, cup.c); k.R(3 + cdx, b - 9 + cdy, 3, 1, cup.l); k.P(6 + cdx, b - 8 + cdy, cup.d); hand(k, 2 + cdx, b - 8 + cdy, sk);
  if(RT && RT.name === 'hold') hand(k, 5, b - 7, sk);
  steam(k, 4 + cdx, b - 10 + cdy, 3, 6, s.ph);
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
  // (7.373) busy: works the tongs (open, shut, an ember spat), wipes the goggles with a mitt, stokes low
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [
    [['tongs', 2.2], ['wipe', 1.2], ['stoke', 1.6], ['tongs', 1.0]],
    [['stoke', 1.8], ['tongs', 2.0], ['wipe', 1.2], ['rest', 1.0]]]) : null;
  workSound(s, RT, { tongs:'work-tinker', stoke:'work-chain' });
  if(RT && RT.name === 'wipe'){ const a = RT.at * 8; k.R(-1 + Math.round(Math.cos(a)), b - 22 + Math.round(Math.sin(a)), 3, 3, mitt); }
  // the tongs
  const open = RT && RT.name !== 'tongs' ? (RT.name === 'stoke' ? 0 : 1) : Math.round((Math.sin(k.t * 2.8 + s.ph) + 1) * 1.2);
  const low = RT && RT.name === 'stoke' ? Math.round(swing(RT.u, .3, .7) * 9) : 0;
  const bt = b + low;
  k.R(5, b - 12, 3, 4, mitt); k.P(5, b - 12, '#8a6a48');
  k.L(7, b - 11, 14, bt - 17 - open, 1, IRON.l); k.L(7, b - 10, 14, bt - 15 + open, 1, IRON.c);
  if(open > 1 || RT && RT.name === 'stoke' && RT.u > .4 && RT.u < .7){ k.P(15, bt - 16, '#ffb040'); k.glow(15, bt - 16, 6, '255,160,80', .3); }
};

/* THE FOUNDRY WORKERS · Emberdeep · the quota. The speaker for the crew: soot-black overalls with a hazard-yellow
   stripe, the crew's yellow hard hat, goggles round the neck, the tally board he chalks another mark on. */
D.foundry = (k, s) => {
  // (7.373) busy: chalks another mark on the tally board, counts it over (head nodding), wipes his brow
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [[['count', 1.6], ['chalk', 1.4], ['wipe', 1.0], ['count', 1.2]], [['chalk', 1.4], ['count', 2.0], ['rest', .8], ['wipe', 1.0]]]) : null;
  workSound(s, RT, { chalk:'work-pencil' });
  if(RT && RT.name === 'count' && ((RT.at * 2.5) | 0) % 2) k = k.at(0, 1);
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
  if(RT && RT.name === 'chalk'){ const cx = 7 + ((RT.at * 6) | 0) % 3, cy = b - 19 + ((RT.at * 4) | 0) % 3; k.L(4, b - 17, cx - 1, cy + 1, 2, C.c); k.R(cx - 1, cy, 2, 2, '#8a5a30'); k.P(cx, cy - 1, '#ffffff'); }
  else if(RT && RT.name === 'wipe'){ const q = swing(RT.u, .3, .7); k.L(4, b - 17, 2, Math.round(b - 17 - q * 6), 2, C.c); k.R(1, Math.round(b - 18 - q * 6), 3, 3, '#8a5a30'); }
  else { k.L(4, b - 17, 6, b - 15, 2, C.c); k.R(5, b - 15, 3, 3, '#8a5a30'); }
};
/* THE BREAKER · Emberdeep · a supporting speaker. Huge and bare-armed, a grey singlet, a red neckerchief, the crew
   hat, the pick on his shoulder. */
D.breaker = (k, s) => {
  // (7.373) busy: swings the pick down into the rock (chips fly), leans on it, rolls his shoulders
  const RT = s.busy && !s.walk && !s.sit ? routine(k.t, s.ph, [[['swing', 1.3], ['swing', 1.3], ['lean', 1.6], ['roll', 1.0]], [['lean', 1.2], ['swing', 1.3], ['swing', 1.3], ['swing', 1.3], ['roll', .5]]]) : null;
  workSound(s, RT, { swing:'work-hammer' });
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
  if(RT && RT.name === 'swing'){   // wound up high behind, then down hard in front
    const u = RT.u, up = u < .55 ? ease(u / .55) : 1 - ease(Math.min(1, (u - .55) / .15)), a = -1.9 + (1 - up) * 2.5;
    const hx = 3, hy = b - 22 - Math.round(up * 6), px = Math.round(hx + Math.cos(a) * 14), py = Math.round(hy + Math.sin(a) * 14);
    k.L(hx, hy, px, py, 1, WOOD.c); k.L(px - 3, py - 2, px + 3, py + 2, 2, IRON.c); k.P(px + 3, py + 2, IRON.l);
    k.L(6, b - 21, hx, hy, 3, sk.c); k.R(hx - 1, hy - 1, 3, 3, sk.c);
    if(u > .7 && u < .9) for(let i = 0; i < 3; i++) k.P(px + 2 + i * 2, py - 1 - i, '#c8b8a0');
  } else if(RT && RT.name === 'lean'){ k.L(8, -1, 7, b - 18, 1, WOOD.c); k.L(4, -1, 11, -3, 2, IRON.c); k.L(6, b - 21, 7, b - 18, 3, sk.c); k.R(6, b - 19, 3, 3, sk.c); }
  else {
  // the pick over the shoulder
  k.L(5, b - 20, -5, b - 30, 1, WOOD.c); k.L(-8, b - 26, -3, b - 34, 2, IRON.c); k.P(-3, b - 34, IRON.l);
  k.L(6, b - 21, 5, b - 22, 3, sk.c); k.R(4, b - 23, 3, 3, sk.c);
  }
};

/* THE WAR AUTOMATON · the Foundry. Twice the knight's height, hunched: an iron boiler of a body in brass bands, the
   furnace grate in its chest breathing light, a cyan visor slit, piston legs, fists to its knees, smoke from the
   stack on its back. */
D.automaton = (k, s) => {
  // (7.373) busy: vents a hard burst of steam, turns its head with a whir, clenches and opens its fist
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [[['idle', 2.0], ['vent', 1.2], ['look', 1.6], ['flex', 1.2]], [['flex', 1.0], ['idle', 1.6], ['look', 1.4], ['vent', 2.0]]]) : null;
  workSound(s, RT, { vent:'gust', look:'work-tinker', flex:'work-chain' });
  if(RT && RT.name === 'vent'){ const q = RT.u; for(let i = 0; i < 6; i++){ const p = (q * 1.6 + i / 6) % 1; k.alpha((1 - p) * .8, () => k.R(-8 - Math.round(p * 6) + (i % 3), -44 - Math.round(p * 18), 3, 3, '#d8d8de')); } }
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
  const lk = RT && RT.name === 'look' ? Math.round(Math.sin(RT.u * Math.PI) * -3) : 0;
  k.R(3 + lk, -38, 7, 6, I.c); k.R(3 + lk, -38, 7, 1, I.l); k.R(5 + lk + (lk ? -1 : 0), -36, 5, 1, eye); k.glow(8 + lk, -36, 6, '143,240,255', .35);
  const fl = RT && RT.name === 'flex' && ((RT.at * 3) | 0) % 2 ? 1 : 0;
  k.L(8, -30, 11, -15, 4, I.c); k.R(9, -15 + fl, 6, 5 - fl, I.c); k.R(9, -15 + fl, 6, 1, BRASS.l);
};

/* THE NEIGHBORS · the Inversion. Downstairs: a pink bathrobe, grey hair in a bun, and the broom, raised to thump on
   the ceiling (it does, now and then). Upstairs, standing on the other floor: an aqua dressing gown, pink curlers,
   the kettle, steaming. */
D.neighbor = (k, s) => {
  // (7.373) busy: thumps the ceiling with the broom handle, sweeps the floor, a hand on her hip, muttering
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [[['thump', 1.6], ['sweep', 2.0], ['hip', 1.2], ['thump', 1.2]], [['sweep', 2.4], ['thump', 2.0], ['hip', 1.6]]]) : null;
  workSound(s, RT, { thump:'stone-hit', sweep:'work-sweep' });
  const C = pal('#e0789e', '#ffa0c0', '#984464'), sk = SKIN.fair, hair = '#b8b4b0';
  shadow(k, 13);
  k.R(-3, -2, 3, 2, '#f0d0e0'); k.R(1, -2, 3, 2, '#f0d0e0');
  k.L(-5, -18, -6, -11, 2, C.d); hand(k, -7, -11, sk);
  k.poly([[-5, -19], [5, -19], [6, -2], [-6, -2]], C);
  k.R(-5, -11, 11, 1, C.d); k.R(4, -12, 2, 4, C.d); k.R(-2, -18, 3, 6, C.l);
  face(k, -1, -24, sk, { h:5, ey:2, nose:true, mouth:'#a05060' });
  k.R(-3, -25, 4, 3, hair); k.R(-4, -27, 3, 3, hair); k.P(-3, -27, '#d8d4d0');
  if(RT && RT.name === 'sweep'){   // the broom turned down, head on the floor, pushed in short strokes
    const sx = Math.round(Math.sin(RT.at * 5) * 3);
    k.L(5, -18, 7 + sx, -10, 2, C.c); hand(k, 7 + sx, -11, sk); k.L(7 + sx, -10, 10 + sx, -2, 1, WOOD.c); k.R(9 + sx, -3, 5, 3, '#c8a050'); k.R(9 + sx, -3, 5, 1, '#e8c878');
    if(((RT.at * 5) % 1) < .3) k.P(14 + sx, -1, '#a89878');
  } else {
  const thump = (RT ? RT.name === 'thump' && ((RT.at * 2.2) % 1) < .2 : every(k.t, 1.8, .18, s.ph)) ? -2 : 0;
  if(RT && RT.name === 'hip'){ k.L(5, -18, 7, -13, 2, C.c); hand(k, 6, -13, sk); k.R(9, -44, 1, 38, WOOD.c); k.R(7, -48, 5, 4, '#c8a050'); }
  else {
  k.L(5, -18, 6, -26, 2, C.c); hand(k, 5, -27 + thump, sk);
  k.R(6, -44 + thump, 1, 38, WOOD.c); k.R(4, -48 + thump, 5, 4, '#c8a050'); k.R(4, -48 + thump, 5, 1, '#e8c878');
  if(thump) { k.P(3, -49, '#fff4d0'); k.P(9, -49, '#fff4d0'); }
  } }
};
D.upstairs = (k, s) => {
  // (7.373) busy: pours from the kettle, sips, blows on it, glances down at the floor (the thumping below)
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [[['hold', 1.4], ['pour', 1.4], ['sip', 1.6], ['look', 1.2]], [['sip', 1.6], ['hold', 2.0], ['look', 1.0], ['pour', 1.0]]]) : null;
  workSound(s, RT, { pour:'work-slosh' });
  const C = pal('#3cbccc', '#7ae4f0', '#1e7a88'), sk = SKIN.tan, hair = '#5a3a2a';
  shadow(k, 12);
  k.R(-3, -2, 3, 2, '#e8e0d0'); k.R(1, -2, 3, 2, '#e8e0d0');
  k.poly([[-4, -18], [4, -18], [6, -2], [-6, -2]], C);
  k.R(-4, -10, 9, 1, C.d); k.R(-1, -17, 3, 6, C.l);
  face(k, -1, -23, sk, { h:5, ey:2, nose:true, mouth:'#8a4a3a' });
  k.R(-3, -24, 6, 2, hair); k.R(-3, -22, 2, 3, hair);
  for(const [dx, dy] of [[-3, -25], [0, -25], [2, -24], [-4, -23]]) k.P(dx, dy, '#ff8ab4');
  k.L(-4, -17, -5, -11, 2, C.d); hand(k, -6, -11, sk);
  const lift = RT && RT.name === 'sip' ? swing(RT.u, .3, .75) : 0, tilt = RT && RT.name === 'pour' ? swing(RT.u, .3, .7) : 0;
  const kx = Math.round(7 - lift * 5), ky = Math.round(-14 - lift * 7 + tilt * 2);
  k.L(4, -17, kx - 1, ky + 2, 2, C.c); hand(k, kx - 1, ky + 2, sk);
  k.R(kx, ky, 5, 4, '#c8c4bc'); k.R(kx, ky, 5, 1, '#f0ece4'); k.R(kx + 5, ky + 1 + Math.round(tilt * 2), 2, 1, '#c8c4bc'); k.P(kx + 2, ky - 1, '#8a8680');
  if(tilt > .5){ const d = (RT.at * 3) % 1; k.P(kx + 7, ky + 3 + Math.round(d * 5), '#a8d0e8'); }
  steam(k, kx + 6, ky, 3, 6, s.ph);
  if(RT && RT.name === 'look' && RT.u > .2 && RT.u < .8) k.P(0, -21, '#8a4a3a');
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
  // (7.373) busy: rings the handbell (a peal), polishes it on his robe, holds it still to listen
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [[['hold', 1.4], ['ring', 1.4], ['listen', 1.6], ['polish', 1.6]], [['polish', 2.0], ['hold', 1.0], ['ring', 1.4], ['listen', 1.6]]]) : null;
  workSound(s, RT, { polish:'work-rag' });
  const C = pal('#1f8a80', '#48b8aa', '#12544e'), sk = SKIN.brown;
  shadow(k, 18);
  const b = s.sit ? -5 : 0;
  if(s.sit) stool(k, -8, 6, 16);
  k.poly([[-3, b - 22], [3, b - 22], [5, b - 12], [9, b - 1], [-9, b - 1], [-5, b - 12]], C);
  k.R(-8, b - 3, 17, 1, BRASS.c); k.R(-4, b - 16, 9, 1, C.d);
  face(k, -1, b - 27, sk, { h:5, ey:2, nose:true }); k.R(-2, b - 23, 5, 1, '#e8e4dc');
  k.R(-2, b - 30, 5, 3, BRASS.c); k.R(-1, b - 31, 3, 1, BRASS.l); k.P(0, b - 32, BRASS.l); k.R(-3, b - 27, 7, 1, BRASS.d);
  const ring = RT ? RT.name === 'ring' : every(k.t, 3, .7, s.ph), sw = ring ? Math.round(Math.sin(k.t * 22) * 2) : RT && RT.name === 'polish' ? Math.round(Math.sin(RT.at * 9)) : RT ? 0 : Math.round(Math.sin(k.t * 1.5 + s.ph));
  k.L(3, b - 20, 7, b - 24, 2, C.c); hand(k, 7, b - 26, sk);
  k.R(8 + sw, b - 24, 1, 2, WOOD.c); k.R(6 + sw, b - 22, 5, 3, BRASS.c); k.R(5 + sw, b - 19, 7, 1, BRASS.l); k.P(8 + sw, b - 18, BRASS.d);
  if(ring){ const p = ((k.t + s.ph * 3) % 3) / .7; k.alpha(1 - p, () => { const r = 3 + Math.round(p * 4); k.P(8 + r, b - 21 - r, '#fff0c0'); k.P(9 + r, b - 20, '#fff0c0'); k.P(8 + r, b - 19 + r, '#fff0c0'); }); k.glow(8, b - 21, 8, '255,220,140', .25); }
};
/* The Throne's defenders: steel, dented, dead on their feet — the tired one leans on a crimson shield with his eyes
   shut; the lookout stands taller, spyglass to the eye. */
D.defender = (k, s) => {
  // (7.373) busy: on guard, nodding off and jerking awake, setting the shield straight
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [[['guard', 2.0], ['nod', 1.6], ['jerk', .6], ['adjust', 1.4]], [['adjust', 1.2], ['guard', 2.4], ['nod', 1.4], ['jerk', .6]]]) : null;
  workSound(s, RT, { adjust:'work-chain' });
  const S = pal('#8a9098', '#c4cad2', '#50565e'), sk = SKIN.ruddy, crimson = pal('#9a2a2e', '#c84a4a', '#5a1418');
  shadow(k, 14);
  const b = s.sit ? 0 : 0;
  if(s.sit){ stool(k, -6, 6, 11); k.R(1, -7, 5, 2, '#3a3a40'); k.R(4, -5, 2, 4, '#3a3a40'); k.R(4, -2, 3, 2, BOOT); }
  else { k.R(-3, -7, 3, 6, '#3a3a40'); k.R(1, -7, 3, 6, '#3a3a40'); k.R(-3, -2, 4, 2, BOOT); k.R(1, -2, 4, 2, BOOT); }
  k.poly([[-5, b - 19], [5, b - 19], [6, b - 6], [-6, b - 6]], S);
  k.R(-5, b - 19, 11, 2, crimson.c); k.P(4, b - 17, crimson.c); k.R(-5, b - 11, 11, 1, S.d);
  const nod = RT ? (RT.name === 'nod' ? Math.round(ease(RT.u) * 2) : 0) : every(k.t, 4, 1.5, s.ph) ? 1 : 0;
  if(RT && RT.name === 'jerk' && RT.u < .4) k = k.at(0, -1);
  face(k, 0, b - 23 + nod, sk, { h:4, ey:1, eyes:false, nose:true }); k.R(1, b - 22 + nod, 3, 1, sk.d);
  k.R(-3, b - 26 + nod, 7, 3, S.c); k.R(-2, b - 27 + nod, 5, 1, S.l); k.R(-4, b - 23 + nod, 2, 3, S.d); k.P(2, b - 25 + nod, S.d);
  const sy = RT && RT.name === 'adjust' ? -Math.round(swing(RT.u, .3, .6) * 2) : 0;
  k.R(6, b - 18 + sy, 5, 12, crimson.c); k.R(6, b - 18 + sy, 5, 1, crimson.l); k.R(8, b - 17 + sy, 1, 10, '#e8dcc8'); k.R(7, b - 6 + sy, 3, 1, crimson.d);
  hand(k, 5, b - 14 + sy, sk);
};
D.lookout = (k, s) => {
  // (7.373) busy: sweeps the spyglass along the water, lowers it to rub an eye, fixes on something
  const RT = s.busy && !s.walk && !s.sit ? routine(k.t, s.ph, [[['scan', 2.4], ['rub', 1.2], ['fix', 1.6]], [['fix', 1.4], ['scan', 2.6], ['rub', 1.2]]]) : null;
  const S = pal('#8a9098', '#c4cad2', '#50565e'), sk = SKIN.fair, scarf = pal('#d0a030', '#f4cc5a', '#8a6614');
  shadow(k, 12);
  const b = s.sit ? 2 : 0;
  if(s.sit){ stool(k, -6, 6, 11); k.R(1, -7, 5, 2, '#3a3a40'); k.R(4, -5, 2, 4, '#3a3a40'); k.R(4, -2, 3, 2, BOOT); }
  else { k.R(-3, -9, 2, 8, '#3a3a40'); k.R(1, -9, 2, 8, '#3a3a40'); k.R(-3, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT); }
  k.poly([[-4, b - 22], [4, b - 22], [5, b - 8], [-5, b - 8]], S);
  k.R(-4, b - 22, 9, 2, scarf.c); k.R(-6, b - 21, 2, 5, scarf.c); k.P(-6, b - 21, scarf.l);
  face(k, -1, b - 27, sk, { h:5, ey:2 }); k.P(2, b - 25, sk.c);
  k.R(-3, b - 30, 7, 3, S.c); k.R(-2, b - 31, 5, 1, S.l); k.R(-3, b - 27, 1, 3, S.d);
  if(RT && RT.name === 'rub'){ const r = ((RT.at * 6) | 0) % 2; k.L(3, b - 20, 2, b - 25, 2, S.c); hand(k, 1 + r, b - 26, sk); k.R(4, b - 14, 2, 6, BRASS.c); }
  else {
  const sweep = s.sit ? 2 : RT && RT.name === 'fix' ? 0 : Math.round(Math.sin(k.t * (RT ? 1.6 : .9) + s.ph) * 1.2);
  k.L(3, b - 20, 5, b - 25 + sweep, 2, S.c); hand(k, 4, b - 26 + sweep, sk);
  k.R(4, b - 26 + sweep, 7, 2, BRASS.c); k.R(4, b - 26 + sweep, 7, 1, BRASS.l); k.P(11, b - 26 + sweep, '#bff4ff');
  if(RT && RT.name === 'fix' && every(k.t, .8, .2, s.ph)) k.P(11, b - 27 + sweep, '#ffffff');
  }
};
D.volunteer = (k, s) => {
  // (7.373) busy: holds the torch up high to see, trims it, warms a hand at it
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [[['hold', 1.6], ['raise', 1.6], ['warm', 1.4]], [['warm', 1.6], ['hold', 1.2], ['raise', 1.8]]]) : null;
  workSound(s, RT, { raise:'gust' });
  const C = pal('#ece6d6', '#ffffff', '#b8b0a0'), sk = SKIN.tan;
  shadow(k, 10);
  k.R(-2, -7, 2, 6, '#5a4a3a'); k.R(1, -7, 2, 6, '#5a4a3a'); k.R(-2, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT);
  k.poly([[-4, -17], [4, -17], [4, -6], [-4, -6]], C);
  face(k, -1, -22, sk, { h:5, ey:2 }); k.R(-3, -23, 6, 2, '#2a1a12'); k.R(-3, -21, 2, 2, '#2a1a12');
  const up = RT && RT.name === 'raise' ? Math.round(swing(RT.u, .3, .75) * 7) : 0;
  k.L(3, -16, 6, -21 - up, 2, C.c); hand(k, 5, -22 - up, sk); k.R(6, -28 - up, 1, 7, WOOD.c); flame(k, 6, -29 - up, true); k.glow(6, -30 - up, 14 + up, '255,180,90', .3);
  if(RT && RT.name === 'warm'){ k.L(-3, -16, 3, -26, 2, C.d); hand(k, 3, -27 + Math.round(Math.sin(RT.at * 4)), sk); }
};

/* THE MINER · the Deep Line. Stooped under the low roof: rust-red overalls, a yellow hard hat with a lamp whose
   beam sweeps the dark, the pick over his shoulder. Behind bars, until you raise them. */
D.miner = (k, s) => {
  // (7.373) busy: sweeps the lamp along the seam, taps the rock with his hammer and listens, wipes the soot off
  const RT = s.busy && !s.walk && !s.caged ? routine(k.t, s.ph, [[['sweep', 2.2], ['tap', 1.6], ['listen', 1.0], ['wipe', 1.0]], [['tap', 1.4], ['sweep', 2.0], ['wipe', .8], ['tap', 1.6]]]) : null;
  workSound(s, RT, { tap:'work-hammer' });
  const C = pal('#b04a2a', '#d8704a', '#6a2a14'), Y = pal('#e8c020', '#fff070', '#9a7a10'), sk = SKIN.soot;
  shadow(k, 13);
  k.R(-3, -7, 3, 6, C.d); k.R(1, -7, 3, 6, C.d); k.R(-3, -2, 4, 2, BOOT); k.R(1, -2, 4, 2, BOOT);
  k.L(-2, -12, -9, -26, 1, WOOD.c); k.L(-12, -24, -7, -29, 2, IRON.c); k.P(-7, -29, IRON.l); k.P(-12, -24, IRON.l);
  k.poly([[-5, -17], [4, -18], [5, -6], [-5, -6]], C);
  k.R(-3, -16, 1, 10, C.d); k.R(2, -16, 1, 10, C.d); k.R(-2, -15, 4, 3, C.l);
  if(RT && RT.name === 'tap'){ const hit = ((RT.at * 2.6) % 1) < .25 ? 1 : 0; k.L(3, -16, 7 - hit, -17, 2, C.c); hand(k, 7 - hit, -18, sk); k.R(8 - hit, -20, 1, 4, WOOD.c); k.R(8 - hit, -21, 3, 2, IRON.c); }
  else if(RT && RT.name === 'wipe'){ const q = swing(RT.u, .3, .7); k.L(3, -16, 3, Math.round(-16 - q * 5), 2, C.c); hand(k, 2, Math.round(-17 - q * 5), sk); }
  else { k.L(3, -16, 5, -11, 2, C.c); hand(k, 4, -11, sk); }
  if(RT && RT.name === 'listen') k = k.at(1, 1);
  face(k, 0, -21, sk, { h:4, ey:1, nose:true }); k.R(0, -18, 4, 1, '#5a4a40');
  k.R(-3, -24, 7, 3, Y.c); k.R(-2, -25, 5, 1, Y.l); k.R(-4, -22, 9, 1, Y.d);
  k.R(3, -24, 2, 2, '#fffbe0');
  const a = RT && RT.name !== 'sweep' ? .05 : Math.sin(k.t * (RT ? 1.2 : .7) + s.ph) * .25;
  k.alpha(.18, () => { for(let i = 2; i < 14; i++){ const yy = Math.round(-23 + Math.tan(a) * i), w = 1 + (i >> 2); k.R(4 + i, yy - (w >> 1), 1, w, '#fff6c8'); } });
  k.glow(5, -23, 8, '255,246,200', .4);
  if(s.caged){ const top = -32; k.R(-12, top, 25, 1, IRON.c); k.R(-12, -1, 25, 1, IRON.d);
    for(const bx of [-12, -7, 0, 7, 12]){ k.R(bx, top, 1, 32, IRON.c); k.P(bx, top, IRON.l); } }
};

/* THE SAILORS · Thunder Cliffs. The speaker: a yellow oilskin and the long-tailed sou'wester, a grey beard, a coil
   of rope over his shoulder; rain runs off the brim. The stranded one clings to the spar in a red-and-white
   striped jersey and a red knit cap, waving. */
D.sailor = (k, s) => {
  // (7.373) busy: coils the rope hand over hand, looks out to sea, shakes the wet off his hat brim
  const RT = s.busy && !s.walk && !s.sit ? routine(k.t, s.ph, [[['coil', 2.4], ['look', 1.4], ['shake', .8], ['coil', 1.4]], [['look', 1.6], ['coil', 2.6], ['shake', .8], ['rest', 1.0]]]) : null;
  workSound(s, RT, { coil:'work-rope' });
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
  if(RT && RT.name === 'coil'){ const a2 = RT.at * 5, hx = -1 + Math.round(Math.cos(a2) * 4), hy = b - 14 + Math.round(Math.sin(a2) * 3); k.L(5, b - 18, hx + 1, hy, 2, Y.c); hand(k, hx, hy, sk); }
  else if(RT && RT.name === 'shake'){ const j = ((RT.at * 16) | 0) % 2; k.L(5, b - 18, 5, b - 25, 2, Y.c); hand(k, 4 + j, b - 27, sk); }
  else { k.L(5, b - 18, 7, b - 11, 2, Y.c); hand(k, 6, b - 11, sk); }
  if(RT && RT.name === 'look' && RT.u > .2 && RT.u < .8) k.P(4, b - 22, '#3a2a1a');
};
D.stranded = (k, s) => {
  // (7.373) busy (waiting on the rock): waves big, cups both hands to shout, drops his arms, tired
  const RT = s.busy && !s.walk && !s.perched ? routine(k.t, s.ph, [[['wave', 2.0], ['shout', 1.4], ['rest', 1.4]], [['rest', 1.0], ['wave', 2.4], ['shout', 1.4]]]) : null;
  const sk = SKIN.tan, red = '#c8342c', white = '#ece4d4';
  shadow(k, 10);
  k.R(-3, -7, 2, 6, '#8a8068'); k.R(1, -7, 2, 6, '#8a8068'); k.R(-3, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT);
  k.poly([[-4, -17], [4, -17], [4, -6], [-4, -6]], pal(white, '#ffffff', '#b8b0a0'));
  for(let yy = -15; yy < -6; yy += 2) k.R(-4, yy, 8, 1, red);
  face(k, -1, -22, sk, { h:5, ey:2, mouth:'#8a3a2a' }); k.R(-3, -24, 7, 3, red); k.P(0, -25, '#e85a4a'); k.R(-3, -21, 2, 1, '#3a2a1a');
  const wave = Math.round(Math.sin(k.t * 7 + s.ph) * 1.5);
  if(s.perched){ k.L(3, -16, 5 + wave, -24, 2, white); hand(k, 4 + wave, -26, sk); k.L(-3, -16, -5, -23, 2, white); hand(k, -6, -25, sk); }
  else if(RT && RT.name === 'shout'){ k.L(3, -16, 3, -20, 2, white); hand(k, 3, -21, sk); k.L(-3, -16, 1, -20, 2, white); hand(k, 1, -21, sk); }
  else if(RT && RT.name === 'rest'){ k.L(3, -16, 4, -10, 2, white); hand(k, 4, -10, sk); k.L(-3, -16, -4, -10, 2, white); hand(k, -5, -10, sk); }
  else { const w2 = RT ? Math.round(Math.sin(k.t * 9 + s.ph) * 2.5) : wave; k.L(3, -16, 6 + w2, -23 - (RT ? 2 : 0), 2, white); hand(k, 5 + w2, -25 - (RT ? 2 : 0), sk); k.L(-3, -16, -4, -10, 2, white); hand(k, -5, -10, sk); }
};

/* THE ORGANIZER · the Landing Shores · a birthday. Hot pink, a striped paper party hat with a bobble, a string of
   bunting over one shoulder, the little cake with its candle flickering. */
D.organizer = (k, s) => {
  // (7.373) busy: shields the candle with a hand, straightens the bunting, bobs to a tune
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [[['shield', 1.8], ['bunting', 1.6], ['hum', 1.6]], [['hum', 1.4], ['shield', 1.6], ['bunting', 2.0]]]) : null;
  if(RT && RT.name === 'hum' && ((RT.at * 3) | 0) % 2) k = k.at(0, -1);
  const C = pal('#e2508e', '#ff84b4', '#98285a'), sk = SKIN.deep, flags = ['#f0d040', '#48c0d8', '#ffffff', '#f07030'];
  shadow(k, 13);
  k.R(-3, -2, 3, 2, '#5a2a3a'); k.R(1, -2, 3, 2, '#5a2a3a');
  k.poly([[-4, -19], [4, -19], [7, -2], [-7, -2]], C);
  k.R(-5, -12, 11, 1, C.d);
  for(let i = 0; i < 7; i++){ const dx = -5 + i * 2, dy = -18 + Math.round(i * 1.4); k.P(dx, dy, flags[i % 4]); k.P(dx, dy + 1, flags[i % 4]); }
  if(RT && RT.name === 'bunting'){ const bx2 = -4 + ((RT.at * 3) | 0) % 4 * 2; k.L(-4, -18, bx2, -17, 2, C.d); hand(k, bx2, -18, sk); }
  else if(!(RT && RT.name === 'shield')){ k.L(-4, -18, -6, -11, 2, C.d); hand(k, -7, -11, sk); }
  face(k, -1, -24, sk, { h:5, ey:2, mouth:'#f0a0a0' }); k.R(-3, -24, 3, 5, '#1a1010'); k.P(-4, -22, '#1a1010');
  const hat = [['#f0d040', 5], ['#48c0d8', 3], ['#f0d040', 1]];
  hat.forEach(([col, w], i) => k.R(-1 + ((5 - w) >> 1), -26 - i * 2, w, 2, col));
  k.P(1, -31 + (Math.sin(k.t * 4 + s.ph) > .6 ? -1 : 0), '#ff84b4');
  k.L(4, -18, 6, -13, 2, C.c); hand(k, 5, -13, sk);
  k.R(6, -15, 6, 3, '#f4e8d0'); k.R(6, -15, 6, 1, '#ff9ac0'); k.R(9, -17, 1, 2, '#f8f0ff'); flame(k, 9, -18, false);
  k.glow(9, -19, 6, '255,200,120', .3);
  if(RT && RT.name === 'shield'){ k.L(-4, -18, 7, -18, 2, C.d); hand(k, 7, -19, sk); }
};
D.soldier = (k, s) => {
  // (7.373) busy (on watch): stands, shifts his weight, tightens a strap, stifles a yawn
  const RT = s.busy && !s.walk && !s.sit ? routine(k.t, s.ph, [[['stand', 2.0], ['shift', 1.2], ['strap', 1.4], ['yawn', 1.2]], [['strap', 1.2], ['stand', 2.2], ['yawn', 1.2], ['shift', 1.2]]]) : null;
  workSound(s, RT, { strap:'work-chain' });
  const S = pal('#8a9098', '#c4cad2', '#50565e'), cloak = pal('#8a2a2a', '#b84444', '#561818'), sk = SKIN.tan;
  shadow(k, 13);
  const b = s.sit ? 2 : 0;
  k.L(8, -1, 8, -34, 1, WOOD.c); k.P(8, -35, S.l); k.R(7, -34, 3, 2, S.l);
  if(s.sit){ stool(k, -6, 6, 11); k.R(1, -7, 5, 2, '#3a3430'); k.R(4, -5, 2, 4, '#3a3430'); k.R(4, -2, 3, 2, BOOT); }
  else { k.R(-3, -8, 3, 7, '#3a3430'); k.R(1, -8, 3, 7, '#3a3430'); k.R(-3, -2, 4, 2, BOOT); k.R(1, -2, 4, 2, BOOT); }
  k.poly([[-6, b - 20], [-2, b - 20], [-4, b - 5], [-8, b - 6]], cloak);
  k.poly([[-4, b - 20], [4, b - 20], [5, b - 8], [-5, b - 8]], S);
  k.R(-4, b - 13, 9, 1, '#3a2a24');
  const hk = RT && RT.name === 'shift' ? k.at(Math.round(swing(RT.u, .3, .7)), 0) : k;
  face(hk, -1, b - 25, sk, { h:5, ey:2, nose:true });
  hk.R(-3, b - 28, 7, 3, S.c); hk.R(-2, b - 29, 5, 1, S.l); hk.R(-4, b - 25, 9, 1, S.d); hk.R(1, b - 30, 1, 2, cloak.l);
  if(RT && RT.name === 'strap'){ const t2 = ((RT.at * 4) | 0) % 2; k.L(4, b - 19, 0, b - 15 - t2, 2, S.c); hand(k, 0, b - 16 - t2, sk); }
  else if(RT && RT.name === 'yawn' && RT.u > .2 && RT.u < .8){ k.L(4, b - 19, 3, b - 22, 2, S.c); hand(k, 2, b - 23, sk); }
  else { k.L(4, b - 19, 7, b - 14, 2, S.c); hand(k, 7, b - 15, sk); }
};

/* THE MOTHER · the Colony. A deep teal headscarf and dress, the baby in a cream sling at her chest (a tiny hand
   waves), a clay water jar balanced on her head; she rocks from foot to foot. */
D.mother = (k, s) => {
  // (7.373) busy: rocks the baby (now quicker, now slow), bends her head to hush it, steadies the jar on her head
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [[['rock', 2.4], ['hush', 1.6], ['rock', 1.2], ['steady', 1.0]], [['hush', 1.4], ['rock', 2.8], ['steady', 1.0], ['rock', 1.0]]]) : null;
  const C = pal('#1e7a78', '#44a8a2', '#0e4a48'), sk = SKIN.brown, jar = pal('#c07040', '#e09060', '#7a4020');
  shadow(k, 13);
  const rock = RT ? (RT.name === 'rock' ? Math.round(Math.sin(k.t * 3.2 + s.ph) * 1.4) : RT.name === 'hush' ? 1 : 0) : Math.round(Math.sin(k.t * 1.8 + s.ph) * .8);
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
  // (7.373) busy: stands with the staff; bows his head and prays; the staff's bell given a shake
  const RT = s.busy && !s.walk && !s.sit ? routine(k.t, s.ph, [[['rest', 1.6], ['pray', 2.4], ['ring', 1.0]], [['pray', 2.0], ['rest', 1.4], ['ring', 1.0], ['rest', .6]]]) : null;
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
  if(RT && RT.name === 'pray'){ k = k.at(1, 1); hand(k, 2, b - 15, sk); }
  face(k, -1, b - 24, sk, { h:5, ey:2, nose:true, mouth:'#4a2a1a' });
  k.R(-3, b - 26, 7, 2, straw.c); k.R(-2, b - 27, 5, 1, straw.l); k.R(-7, b - 24, 15, 1, straw.c); k.R(-7, b - 24, 15, 1, straw.l); k.P(-7, b - 23, straw.d); k.P(7, b - 23, straw.d);
  if(!s.sit){ const bl = RT && RT.name === 'ring' ? Math.round(Math.sin(k.t * 20) * 2) : Math.round(Math.sin(k.t * 1.9 + s.ph)); k.R(8, -30, 1, 29, WOOD.c); k.P(8, -31, WOOD.l); k.R(8 + bl, -29, 2, 2, BRASS.c); k.L(4, b - 18, 7, -16, 2, C.c); hand(k, 7, -17, sk); }
};

/* THE PALACE GARDENER · Sunspire. A coral smock, a wide straw sun hat with red flowers on the band, pruning shears
   at the belt, the copper watering can dripping. */
D.gardener = (k, s) => {
  // (7.373) busy: waters the beds, lowers the can to rest, wipes her brow under the hat
  const RT = s.busy && !s.walk && !s.sit ? routine(k.t, s.ph, [[['water', 2.4], ['rest', 1.2], ['wipe', 1.0], ['water', 1.4]], [['water', 3.0], ['wipe', 1.0], ['rest', 2.0]]]) : null;
  workSound(s, RT, { water:'splash' });
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
    const p = ((k.t + s.ph * 1.1) % 1.1) / 1.1; if(!RT || RT.name === 'water') k.alpha(1 - p, () => k.P(15, b - 15 + Math.round(p * 12), '#9fd8f0'));
    if(RT && RT.name === 'wipe' && RT.u > .2 && RT.u < .8){ k.L(-4, b - 17, -1, b - 22, 2, C.d); hand(k, -1, b - 23, sk); }
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
  // (7.371) busy: he watches the road, counts the patrols off the notches, leans on his hip to cut a new one, blows it clean
  const RT = s.busy ? routine(k.t, s.ph, [
    [['watch', 1.6], ['count', 1.6], ['notch', 1.8], ['blow', 1.0]],
    [['count', 1.6], ['watch', 2.2], ['count', 1.4], ['watch', .8]],
    [['watch', 1.2], ['notch', 1.8], ['blow', 1.0], ['count', 2.0]]]) : null;
  workSound(s, RT, { notch:'work-whittle' });
  k.L(-6, -21, -8, -1, 1, WOOD.c); k.R(-9, -22, 4, 1, WOOD.l); k.P(-8, -1, WOOD.d);                 // the crutch
  k.R(-3, -8, 2, 7, '#3a3430'); k.R(-3, -2, 3, 2, BOOT); k.R(1, -8, 2, 4, '#3a3430'); k.R(1, -4, 1, 4, WOOD.l);   // boot, peg
  k.poly([[-6, -25], [2, -25], [5, -8], [-5, -8]], C);
  k.R(0, -23, 1, 15, C.d); k.R(-5, -16, 9, 1, '#2e2a26'); k.P(-5, -24, C.l);
  const cutting = RT && RT.name === 'notch', down = RT && RT.name !== 'watch';
  if(!cutting) k.L(-5, -23, -7, -22, 2, C.d);
  // head down over the stick while he counts or cuts; up and along the road while he watches (a slow look each way)
  const h0 = down ? k.at(1, 1) : k, h = RT && RT.name === 'watch' && RT.u > .45 && RT.u < .8 ? h0.flip() : h0;
  face(h, -2, -30, sk, { h:5, ey:down ? 3 : 2, nose:true }); h.R(-2, -26, 4, 1, '#a8a49c');
  if(RT && (RT.name === 'count' || RT.name === 'watch' && RT.u > .85) && every(k.t, .5, .25, s.ph)) h.P(1, -26, '#7a4a3a');   // lips counting
  if(RT && RT.name === 'blow' && RT.u > .3 && RT.u < .8) h.P(2, -26, '#7a4a3a');
  h.R(-4, -32, 6, 3, cap.c); h.R(-3, -33, 4, 1, cap.c); h.R(-4, -32, 6, 1, cap.l); h.R(-4, -30, 6, 1, cap.d);
  const lift = RT ? (RT.name === 'blow' ? -3 - Math.round(swing(RT.u, .25, .8) * 5) : RT.name === 'watch' ? -1 : -3) : 0;
  const sx = RT && RT.name === 'blow' ? 4 : 6;
  k.L(1, -23, sx - 2, -17 + lift, 2, C.c); hand(k, sx - 2, -18 + lift, sk);
  k.R(sx, -23 + lift, 1, 9, WOOD.l); for(let i = 0; i < 4; i++) k.P(sx, -22 + lift + i * 2, WOOD.d);
  if(RT && (RT.name === 'count' || !RT)) k.P(sx - 1, -22 + lift + (((k.t * 3.2 + s.ph * 4) | 0) % 4) * 2, sk.l);
  else if(!RT) k.P(5, -22 + (((k.t * .8 + s.ph * 4) | 0) % 4) * 2, sk.l);
  if(cutting){   // the knife hand comes across from the crutch; three short cuts, chips falling
    const cut = (RT.u * 3) % 1, hy = -17 + lift - Math.round(ease(Math.min(1, cut * 1.6)) * 2), n = Math.floor(RT.u * 3);
    k.L(-5, -23, 4, hy + 1, 2, C.d); hand(k, 4, hy, sk); k.P(5, hy - 1, IRON.l);
    k.P(6, -16 + lift, n > 1 ? WOOD.d : '#c8a878');
    if(cut > .55){ const f = (cut - .55) / .45; k.alpha(1 - f, () => { k.P(7, -16 + lift + Math.round(f * 12), '#d8b888'); k.P(8 + (n & 1), -15 + lift + Math.round(f * 10), '#c8a878'); }); }
  }
  if(RT && RT.name === 'blow' && RT.u > .35 && RT.u < .9){ const f = (RT.u - .35) / .55;   // the shavings blown off the stick
    k.alpha(1 - f, () => { for(let i = 0; i < 3; i++) k.P(sx + 1 + Math.round(f * (5 + i * 2)), -20 + lift + i * 2 - Math.round(f * 2), '#d8b888'); }); }
};
/* ORRA · Black Woods · the clock keeper. Small and round-shouldered in dusky plum, a white bun with a pencil through
   it, big round spectacles; her daughter's watch swings on its chain, and now and then goes up to her ear. */
D.orra = (k, s) => {
  const C = pal('#74486c', '#94688c', '#4a2c46'), SH = pal('#8a5c82', '#a87ca0', '#5c3a58'), sk = SKIN.fair, hair = '#dcd8e0';
  shadow(k, 12);
  k.R(-3, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT);
  k.poly([[-4, -17], [4, -17], [6, -1], [-6, -1]], C);
  k.poly([[-5, -18], [4, -18], [5, -12], [-6, -11]], SH); k.P(-6, -11, SH.d); k.P(-4, -10, SH.d); k.P(-2, -11, SH.d);
  // (7.371) busy: the watch to her ear (head tipped to it), then down to read its face and tap the glass, a turn of the
  // crown, a hard shake at arm's length, and a sigh as it drops on its chain
  const RT = s.busy ? routine(k.t, s.ph, [
    [['listen', 1.8], ['read', 1.4], ['shake', .9], ['listen', 1.5], ['sigh', 1.0]],
    [['read', 1.6], ['wind', 1.6], ['listen', 1.8], ['shake', .9], ['sigh', .7]]]) : null;
  workSound(s, RT, { listen:'work-tick', shake:'work-shake' });
  const hk = RT ? (RT.name === 'listen' ? k.at(1, 0) : RT.name === 'read' || RT.name === 'wind' ? k.at(1, 1) : RT.name === 'sigh' ? k.at(0, Math.round(swing(RT.u, .3, .7))) : k) : k;
  face(hk, -1, -22, sk, { eyes:false, mouth:'#a06050' });
  hk.R(0, -21, 2, 2, '#d8eef4'); hk.R(2, -21, 2, 2, '#d8eef4');
  if(RT && RT.name === 'listen' && RT.u > .25 && RT.u < .85){ hk.R(1, -20, 1, 1, '#a08890'); hk.R(3, -20, 1, 1, '#a08890'); }   // eyes shut, listening
  else { hk.P(1, -20, EYE); hk.P(3, -20, EYE); }
  hk.R(-3, -23, 6, 1, hair); hk.R(-3, -22, 2, 3, hair); hk.R(-2, -26, 4, 3, hair); hk.P(-2, -26, '#ffffff'); hk.L(-4, -27, 1, -25, 1, '#d8a040');
  if(RT && RT.name !== 'shake' && RT.name !== 'sigh'){
    if(RT.name === 'listen'){ const q = swing(RT.u, .2, .85), hy = Math.round(-14 - q * 8);
      k.L(3, -17, 3, hy + 1, 2, SH.c); hand(k, 3, hy, sk); k.R(4, hy - 1, 3, 3, BRASS.c); k.P(5, hy, '#fff8e0'); }
    else {   // read / wind: the watch up before her, the other hand's finger at the glass or the crown
      const wx = 6, wy = -15; k.L(3, -16, 5, wy + 1, 2, SH.c); hand(k, 5, wy + 1, sk); k.R(wx, wy - 1, 3, 3, BRASS.c); k.P(wx + 1, wy, '#fff8e0'); k.P(wx + 1, wy - 1, BRASS.d);
      const tap = RT.name === 'read' ? (RT.u > .5 && ((RT.at * 6) | 0) % 2 === 0 ? 1 : 0) : 0, tw = RT.name === 'wind' ? (((RT.at * 8) | 0) % 2) : 0;
      k.L(-3, -16, wx - 1, wy - 2 + tap, 2, SH.d); k.P(wx + (RT.name === 'wind' ? 1 : 0), wy - 2 + tap - (RT.name === 'wind' ? 1 : 0), sk.l);
      if(tw) k.P(wx + 2, wy - 3, sk.c);
    }
  } else if(RT){   // shake: hard and fast at arm's length; sigh: it drops back to swing on its chain
    const sh = RT.name === 'shake', jx = sh ? ((k.t * 26 | 0) % 2 ? 2 : -1) : 0, jy = sh ? ((k.t * 19 | 0) % 2) : Math.round(swing(RT.u, .3, .7));
    k.L(3, -16, 6, -14 + jy, 2, SH.c); hand(k, 6 + (sh ? jx >> 1 : 0), -15 + jy, sk);
    const sw = sh ? jx : Math.round(Math.sin(k.t * 4 + s.ph) * 1.6);
    k.L(7, -13 + jy, 7 + sw, -9 + jy, 1, BRASS.l); k.R(6 + sw, -9 + jy, 3, 3, BRASS.c); k.P(7 + sw, -8 + jy, '#fff8e0'); k.P(7 + sw, -9 + jy, BRASS.d);
  }
  if(RT) return;
  const ear = every(k.t, 5, 1.6, s.ph), shake = false;
  if(ear){ k.L(3, -17, 3, -21, 2, SH.c); hand(k, 3, -22, sk); k.R(4, -23, 3, 3, BRASS.c); k.P(5, -22, '#fff8e0'); }
  else {
    const sw = shake ? ((k.t * 22 | 0) % 2 ? 2 : -1) : Math.round(Math.sin(k.t * 2.5 + s.ph) * 1.4);
    k.L(3, -16, 5, -13, 2, SH.c); hand(k, 5, -14, sk);
    k.L(6, -12, 6 + sw, -9, 1, BRASS.l); k.R(5 + sw, -9, 3, 3, BRASS.c); k.P(6 + sw, -8, '#fff8e0'); k.P(6 + sw, -9, BRASS.d);
  }
};
/* PELL · Black Woods · the resin worker. Stocky, sleeves rolled, a sea-green-blue kerchief, a leather apron
   spotted with resin; a yoke over both shoulders with a bucket at each end, one of them dripping amber. */
D.pell = (k, s) => {
  const K2 = pal('#3a94a2', '#62b8c2', '#1e5e6a'), SM = pal('#6a6a70', '#8a8a90', '#46464c'), sk = SKIN.tan, apron = pal('#7a5a3a', '#9a7a52', '#4e3822');
  // (7.371) busy: the yoke hitched up on his shoulders (the buckets jump and swing), a paddle dipped in the front
  // bucket and lifted to watch the resin run off it, the paddle wiped on his apron, a look and a tap at the back bucket
  const RT = s.busy ? routine(k.t, s.ph, [
    [['settle', 1.0], ['skim', 2.2], ['wipe', 1.0], ['check', 1.4], ['rest', .8]],
    [['skim', 2.0], ['settle', 1.0], ['check', 1.4], ['skim', 1.6], ['wipe', .4]]]) : null;
  workSound(s, RT, { skim:'work-slosh', settle:'work-slosh' });
  shadow(k, 16);
  const hitch = RT && RT.name === 'settle' ? Math.round(swing(RT.u, .25, .45) * 2) : 0;
  const kick = RT && RT.name === 'settle' ? Math.sin(Math.max(0, RT.u - .4) * 14) * 2.2 * (1 - RT.u) : RT && RT.name === 'check' && RT.u > .5 ? Math.sin((RT.u - .5) * 16) * 2 * (1 - RT.u) : 0;
  const sw = Math.round(Math.sin(k.t * 1.7 + s.ph) * .8 + kick), y0 = -hitch;
  k.R(-4, -7, 3, 6, '#3e3a36'); k.R(1, -7, 3, 6, '#3e3a36'); k.R(-4, -2, 4, 2, BOOT); k.R(1, -2, 4, 2, BOOT);
  k.R(-11, -21 + y0, 23, 1, WOOD.l); k.R(-11, -20 + y0, 23, 1, WOOD.d);                                            // the yoke
  for(const bx of [-12, 10]){ const b2 = bx < 0 ? sw : Math.round(sw * .7) + (RT && RT.name === 'skim' ? 0 : 0);
    k.R(bx + 1, -20 + y0, 1, 6, '#b09a70'); k.R(bx + b2, -14 + y0, 5, 5, WOOD.c); k.R(bx + b2, -14 + y0, 5, 1, WOOD.l); k.R(bx + 1 + b2, -14 + y0, 3, 1, '#e8a030'); k.R(bx + b2, -11 + y0, 5, 1, IRON.c); }
  const p = ((k.t + s.ph * 1.8) % 1.8) / 1.8; k.alpha(1 - p, () => k.P(12 + sw, -9 + y0 + Math.round(p * 8), '#e89a2a'));
  k.poly([[-5, -19 + y0], [5, -19 + y0], [6, -7], [-6, -7]], SM);
  k.R(-3, -15, 7, 9, apron.c); k.R(-3, -15, 7, 1, apron.l); k.P(0, -11, '#e0a030'); k.P(2, -9, '#c07a20'); k.P(-2, -8, '#e0a030');
  let look = false;
  if(RT && RT.name === 'skim'){   // the paddle in the front bucket, stirred, then lifted to watch it run
    const lift = swing(RT.u, .55, .9), st = RT.u < .55 ? Math.round(Math.sin(RT.at * 9) * 1.2) : 0;
    const px = 12 + st, py = Math.round(-13 + y0 - lift * 8);
    k.L(5, -18 + y0, px - 2, py - 1, 2, sk.c); hand(k, px - 2, py - 2, sk); k.L(px - 1, py - 1, px, py + 3, 1, WOOD.l);
    if(lift > .6){ k.P(px, py + 4, '#e8a030'); const d = (RT.at * 2.5) % 1; k.alpha(1 - d, () => k.P(px, py + 5 + Math.round(d * 6), '#e89a2a')); }
    k.L(-5, -18 + y0, -8, -20 + y0, 2, sk.c); hand(k, -9, -21 + y0, sk);
  } else if(RT && RT.name === 'wipe'){   // the paddle wiped down the apron, both ways
    const wx = Math.round(Math.sin(RT.u * Math.PI * 3) * 2);
    k.L(5, -18 + y0, 1 + wx, -12, 2, sk.c); hand(k, 1 + wx, -13, sk); k.L(2 + wx, -13, 3 + wx, -9, 1, WOOD.l);
    k.L(-5, -18 + y0, -8, -20 + y0, 2, sk.c); hand(k, -9, -21 + y0, sk);
  } else if(RT && RT.name === 'check'){   // a look back at the far bucket and a tap on it
    look = RT.u > .15 && RT.u < .85; const tap = RT.u > .45 && RT.u < .6;
    k.L(-5, -18 + y0, tap ? -10 : -8, tap ? -15 + y0 : -20 + y0, 2, sk.c); hand(k, tap ? -11 : -9, tap ? -16 + y0 : -21 + y0, sk);
    k.L(5, -18 + y0, 8, -20 + y0, 2, sk.c); hand(k, 8, -21 + y0, sk);
  } else { k.L(-5, -18 + y0, -8, -20 + y0, 2, sk.c); hand(k, -9, -21 + y0, sk); k.L(5, -18 + y0, 8, -20 + y0, 2, sk.c); hand(k, 8, -21 + y0, sk); }
  const h = look ? k.flip().at(0, y0) : RT && (RT.name === 'skim' || RT.name === 'wipe') ? k.at(1, 1 + y0) : k.at(0, y0);
  face(h, -1, -25, sk, { h:5, ey:2, nose:true }); h.R(-3, -22, 2, 2, '#5a3a22');
  h.R(-3, -27, 7, 3, K2.c); h.R(-3, -27, 7, 1, K2.l); h.P(-4, -25, K2.c); h.P(-5, -24 + (sw > 0 ? 1 : 0), K2.d);
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
  // (7.371) busy: he works the bad shoulder (rubs it, rolls it, eases the arm up and down) and drinks between times
  const RT = s.busy ? routine(k.t, s.ph, [
    [['rub', 1.6], ['roll', 1.6], ['stretch', 1.4], ['drink', 1.4], ['rest', 1.0]],
    [['drink', 1.4], ['rest', 1.2], ['roll', 1.6], ['rub', 1.4], ['stretch', 1.4]]]) : null;
  workSound(s, RT, { drink:'work-gulp', rub:'work-cloth' });
  const ra = RT && RT.name === 'roll' ? RT.at * 4 : 0, roll = RT && RT.name === 'roll' ? Math.round(Math.sin(ra) * 1.3) : 0, rollx = RT && RT.name === 'roll' ? Math.round(Math.cos(ra) * .8) : 0;
  k.R(3 + rollx, -20 + roll, 3, 5, band); k.R(3 + rollx, -18 + roll, 3, 1, '#c8bca4'); k.R(3 + rollx, -16 + roll, 3, 1, '#c8bca4');   // bandaged shoulder
  const sip = !s.busy && every(k.t, 5.5, 1.3, s.ph);
  if(RT && RT.name === 'rub'){ const a = RT.at * 7; k.L(-5, -17, 2 + Math.round(Math.cos(a)), -18 + Math.round(Math.sin(a)), 2, C.d); hand(k, 2 + Math.round(Math.cos(a)), -19 + Math.round(Math.sin(a)), sk); }
  else { k.L(-5, -17, -3, -9, 2, C.d); hand(k, -3, -10, sk); }
  if(RT){
    if(RT.name === 'drink'){ const q = swing(RT.u, .3, .75);   // the canteen up from the ground, head back, and down again
      const cx = Math.round(9 - q * 7), cy = Math.round(-4 - q * 19);
      k.L(4, -15, cx - 1, cy + 2, 2, C.c); hand(k, cx - 1, cy + 1, sk); k.R(cx, cy, 3, 4, '#8a6a44'); k.P(cx, cy, '#a8845a'); }
    else if(RT.name === 'stretch'){ const q = swing(RT.u, .4, .65), ex = Math.round(6 + q * 3), ey = Math.round(-11 - q * 13);   // slowly, as far as it goes
      k.L(4 + rollx, -15, ex, ey, 2, C.c); hand(k, ex, ey - 1, sk); k.R(9, -4, 3, 4, '#8a6a44'); k.P(9, -4, '#a8845a'); }
    else { k.L(4 + rollx, -15 + roll, 6, -10 + roll, 2, C.c); hand(k, 6, -10 + roll, sk); k.R(9, -4, 3, 4, '#8a6a44'); k.P(9, -4, '#a8845a'); }
  }
  else if(sip){ k.L(4, -15, 3, -21, 2, C.c); hand(k, 2, -23, sk); k.R(3, -25, 3, 4, '#8a6a44'); k.P(3, -25, '#a8845a'); }
  else { k.L(4, -15, 6, -11, 2, C.c); hand(k, 6, -11, sk); k.R(8, -13, 3, 4, '#8a6a44'); k.P(8, -13, '#a8845a'); k.P(9, -14, '#c8b890'); }
  // the head: back for the drink, away from the shoulder as he rolls it, down while he rubs it (the eye screwed shut)
  const hh = RT ? (RT.name === 'drink' ? k.at(-Math.round(swing(RT.u, .3, .75)), -Math.round(swing(RT.u, .3, .75))) : RT.name === 'roll' ? k.at(-1, 0) : RT.name === 'rub' ? k.at(0, 1) : k) : k;
  face(hh, -1, -26, sk, { h:5, ey:2, nose:true, eyes:!(RT && (RT.name === 'rub' || RT.name === 'stretch' && RT.u > .35 && RT.u < .7)) });
  if(RT && (RT.name === 'rub' || RT.name === 'stretch' && RT.u > .35 && RT.u < .7)) hh.R(1, -24, 2, 1, '#6a4030');   // wincing
  hh.R(-1, -25, 2, 2, '#1a1418'); hh.R(-3, -26, 3, 1, '#2a2020');
  hh.R(-3, -27, 5, 2, '#8a8680'); hh.R(-3, -25, 2, 2, '#8a8680'); hh.R(-1, -22, 5, 2, beard); hh.P(3, -23, beard);
};
/* TALLA · the Updrafts · the kite-mender. Wiry in a cream sailcloth smock with a scarlet sash and kerchief, two black
   braids; she flies a scarlet test kite on a line up in the draught, its tail of bows streaming. */
D.talla = (k, s) => {
  // (7.373) busy: tugs the kite line to climb it, winds some in, watches it ride
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [[['watch', 1.8], ['tug', 1.4], ['wind', 1.6]], [['tug', 1.2], ['watch', 2.2], ['wind', 1.4]]]) : null;
  workSound(s, RT, { tug:'work-rope' });
  const tug = RT && RT.name === 'tug' ? (((RT.at * 2.4) % 1) < .3 ? 2 : 0) : 0;
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
  if(RT && RT.name === 'wind'){ const a2 = RT.at * 7; k.L(-4, -19, 1 + Math.round(Math.cos(a2) * 2), -18 + Math.round(Math.sin(a2) * 2), 2, SM.d); }
  k.L(3, -19, 4, -21 + tug, 2, SM.c); hand(k, 3, -22 + tug, sk);
  face(k, -1, -25, sk, { h:5, ey:2, nose:true, mouth:'#6a3024' });
  k.R(-3, -27, 6, 2, R.c); k.R(-3, -27, 6, 1, R.l); k.R(-3, -25, 2, 2, hair);
  k.R(-4, -24, 1, 6, hair); k.P(-4, -18, R.c); k.R(3, -23, 1, 4, hair);
};
/* EDRIN · the Updrafts · the rain-catcher keeper. Stout in a long slate rain cape and rubber boots, a white round
   beard, and on his head an upturned brass bowl that catches the rain (it spills over the rim); a tin cup held
   out for the drips. */
D.edrin = (k, s) => {
  // (7.373) busy: lifts the catch-cup to look how much fell, tips it out, sets it back under the drip
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [[['wait', 2.0], ['check', 1.6], ['tip', 1.2]], [['check', 1.4], ['wait', 2.4], ['tip', 1.0]]]) : null;
  workSound(s, RT, { tip:'splash' });
  const C = pal('#5a6a76', '#7c8e9a', '#3a4852'), sk = SKIN.tan, beard = '#e0d8cc';
  shadow(k, 16);
  k.R(-4, -5, 3, 4, '#2a2a2c'); k.R(1, -5, 3, 4, '#2a2a2c'); k.R(-4, -2, 4, 2, '#1a1a1c'); k.R(1, -2, 4, 2, '#1a1a1c');
  k.poly([[-4, -20], [4, -20], [7, -4], [-7, -4]], C);
  k.R(-1, -18, 1, 14, C.d); k.R(-6, -6, 13, 1, C.d);
  face(k, -1, -25, sk, { h:5, ey:2, nose:true }); k.R(-1, -22, 5, 3, beard); k.P(0, -19, beard); k.P(-2, -23, beard);
  k.R(-6, -26, 13, 1, BRASS.d); k.R(-5, -29, 11, 3, BRASS.c); k.R(-5, -29, 11, 1, BRASS.l); k.R(-4, -29, 9, 1, '#8ac4d8');
  const p = ((k.t + s.ph * 1.3) % 1.3) / 1.3; k.alpha(1 - p, () => { k.P(-7, -26 + Math.round(p * 7), '#9fd8f0'); k.P(7, -25 + Math.round(p * 10), '#9fd8f0'); });
  const lift = RT && RT.name === 'check' ? swing(RT.u, .3, .75) : 0, tip = RT && RT.name === 'tip' ? swing(RT.u, .2, .6) : 0;
  const cx = Math.round(7 - lift * 3), cy = Math.round(-16 - lift * 6);
  k.L(3, -18, cx - 2, cy + 2, 2, C.c); hand(k, cx - 2, cy + 2, sk);
  k.R(cx, cy + Math.round(tip), 3, 3, '#9aa4a8'); k.R(cx, cy, 3, 1, '#c9ced0'); if(p > .5 && !tip) k.P(cx + 1, cy, '#9fd8f0');
  if(tip > .5){ const d = (RT.at * 3) % 1; k.P(cx + 3, cy + 2 + Math.round(d * 12), '#9fd8f0'); k.P(cx + 4, cy + 4 + Math.round(d * 10), '#9fd8f0'); }
};
/* SENN · the Marksman road · the veil-mender. Tall, thin and bald, a sea-teal apron stuck with pins over a linen
   shirt, a bolt of mottled veil-cloth over one shoulder, a spool at the belt; the long needle rises and draws its
   thread. */
D.senn = (k, s) => {
  // (7.373) busy: stitches the veil (the needle drawn up and through), bites the thread off, holds the work up to look
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [[['sew', 2.6], ['bite', 1.0], ['look', 1.4]], [['look', 1.2], ['sew', 2.8], ['bite', 1.0]]]) : null;
  workSound(s, RT, { bite:'work-cloth' });
  const A = pal('#2f7a78', '#4ea09c', '#1a4e4c'), SH = pal('#d8ccb4', '#f0e6d0', '#a89c84'), sk = SKIN.deep, cloth = pal('#8a7a5a', '#a89a72', '#5e5240');
  shadow(k, 13);
  k.poly([[-7, -25], [-2, -26], [-3, -11], [-8, -8]], cloth); for(const [dx, dy] of [[-6, -22], [-5, -17], [-7, -13], [-4, -20], [-6, -10]]) k.P(dx, dy, cloth.d);
  k.R(-2, -10, 2, 9, '#3a3430'); k.R(1, -10, 2, 9, '#3a3430'); k.R(-2, -2, 3, 2, BOOT); k.R(1, -2, 3, 2, BOOT);
  k.poly([[-4, -25], [4, -25], [4, -10], [-4, -10]], SH);
  k.R(-3, -21, 7, 12, A.c); k.R(-3, -21, 7, 1, A.l); for(let i = 0; i < 3; i++) k.P(-2 + i * 2, -20, '#e8ecf0');
  k.R(4, -15, 2, 2, '#c8605a'); k.P(4, -15, '#e88a80');
  face(k, -1, -31, sk, { h:5, ey:2, nose:true }); k.R(-2, -32, 4, 1, sk.l); k.P(-2, -29, sk.d); k.R(1, -27, 3, 1, '#d8d4cc');
  const p = ((k.t * (RT && RT.name === 'sew' ? 1.6 : 1) + s.ph * 1.6) % 1.6) / 1.6, lift = RT && RT.name === 'bite' ? 8 : RT && RT.name === 'look' ? 3 : Math.round(Math.sin(p * Math.PI) * 5);
  k.L(3, -24, 5, -18 - lift, 2, SH.c); hand(k, 5, -19 - lift, sk);
  k.L(6, -20 - lift, 8, -25 - lift, 1, '#e8eef4'); k.alpha(.8, () => k.L(7, -22 - lift, -3, -21, 1, '#d88ab0'));
};
/* VEYA · the Keep · the hearth keeper. Sat on her stool by the fire, a cream wool shawl, a silver braid over her
   shoulder; the knitting needles click, and the rose scarf she is making hangs to the floor with its ball of yarn. */
D.veya = (k, s) => {
  // (7.373) busy: knits (the needles clicking), counts the stitches on the needle, rests her hands
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [[['knit', 2.6], ['count', 1.4], ['rest', 1.2]], [['knit', 3.0], ['rest', 1.0], ['count', 1.2]]]) : null;
  const C = pal('#e0d4ba', '#fff6e2', '#a89c82'), dress = pal('#4a3e48', '#645868', '#302830'), sk = SKIN.fair, hair = '#c8c4cc', R = pal('#c05a6a', '#e07a88', '#7e3240');
  shadow(k, 14);
  stool(k, -6, 6, 11);
  k.R(1, -7, 5, 2, dress.c); k.R(4, -5, 2, 4, dress.c); k.R(4, -2, 3, 2, BOOT);
  k.poly([[-5, -18], [4, -18], [5, -6], [-6, -6]], dress);
  k.poly([[-6, -19], [5, -19], [6, -12], [0, -9], [-6, -12]], C); for(const dx of [-5, -3, -1, 1, 3]) k.P(dx, -11 + (dx > -1 ? -1 : 0), C.d);
  face(k, -1, -24, sk, { h:5, ey:2, mouth:'#a06050' }); k.R(-3, -25, 5, 2, hair); k.R(-3, -23, 2, 3, hair); k.R(2, -21, 1, 7, hair); k.P(2, -14, R.c);
  const c = RT && RT.name !== 'knit' ? 0 : every(k.t, RT ? .35 : .5, RT ? .17 : .25, s.ph) ? 1 : 0;
  if(RT && RT.name === 'count' && ((RT.at * 3) | 0) % 2) k.P(1, -26, '#a06050');
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
  // (7.373) busy: lies wrapped, coughs (the body jerks), lifts the cup to sip, lies back
  const RT = s.busy && !s.walk ? routine(k.t, s.ph, [[['lie', 2.2], ['cough', 1.0], ['sip', 1.6]], [['sip', 1.6], ['lie', 2.6], ['cough', .6]]]) : null;
  if(RT && RT.name === 'cough' && ((RT.at * 6) | 0) % 2) k = k.at(0, -1);
  const R = pal('#a8402e', '#d0624a', '#6a2418'), sk = SKIN.tan;
  shadow(k, 12);
  k.R(-5, -4, 11, 3, '#7a6a62'); k.R(3, -3, 4, 2, '#8f8775'); k.R(6, -2, 2, 2, BOOT);
  k.poly([[-4, -13], [4, -13], [6, -3], [-6, -3]], R);
  k.R(-4, -8, 9, 1, R.d); k.P(-2, -11, R.l);
  wrapped(k, -3, -20, 7, 7); k.R(1, -17, 3, 1, '#2a2520'); k.P(2, -17, '#f0e0c0');
  whiteFlower(k, -4, -19);
  const up = RT ? (RT.name === 'sip' ? Math.round(swing(RT.u, .3, .7) * 3) : 0) : every(k.t, 3.4, 1.6, s.ph) ? 1 : 0;
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
  // (7.373) the Assessor at her counter: holds a coin up to the light, rubs it on her sleeve, sets it down and notes it
  const RT = routine(k.t, s.ph, [[['appraise', 1.8], ['rub', 1.2], ['note', 1.4], ['wait', 1.2]], [['wait', 1.4], ['appraise', 2.0], ['note', 1.2], ['rub', 1.0]]]);
  workSound(s, RT, { note:'work-pencil', appraise:'coin' });
  const lift = RT.name === 'appraise' && RT.u > .15 && RT.u < .9;
  if(RT.name === 'rub'){ const r = ((RT.at * 8) | 0) % 2; k.L(-4, -10, 4 + r, -10, 2, coat.d); }
  if(RT.name === 'note'){ const nx = 3 + ((RT.at * 6) | 0) % 3; k.L(4, -10, nx, -3, 2, coat.c); hand(k, nx, -3, sk); k.P(nx + 1, -2, '#3a2a1a'); return; }
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
  // (7.373) the sail-cutter: shears snipping in quick runs, then the cloth measured along her arm
  const RT = routine(k.t, s.ph, [[['cut', 1.6], ['measure', 1.4], ['cut', 1.2], ['rest', 1.0]], [['measure', 1.2], ['cut', 2.2], ['rest', 1.4]]]);
  workSound(s, RT, { cut:'work-tinker', measure:'work-cloth' });
  const open = RT.name === 'cut' ? Math.round((Math.sin(RT.at * 14) + 1) * 1.2) : 1;
  if(RT.name === 'measure'){ const mx = Math.round(-4 + RT.p * 9); k.L(-4, -6, mx, -7, 2, C.d); hand(k, mx, -8, sk); k.R(-5, -8, Math.max(1, mx + 5), 1, '#f4ecd8'); }
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
  // (7.373) the mason: chisel taps in a run, blows the dust off, looks the stone over
  const RT = routine(k.t, s.ph, [[['tap', 2.4], ['blow', 1.0], ['look', 1.4]], [['look', 1.0], ['tap', 2.8], ['blow', 1.0]]]);
  workSound(s, RT, { tap:'stone-hit' });
  const tap = RT.name === 'tap' && ((RT.at * 2.6) % 1) < .18;
  if(RT.name === 'blow' && RT.u > .3 && RT.u < .9){ const d = (RT.u - .3) / .6; k.alpha(1 - d, () => { k.P(9 + Math.round(d * 4), -3 - Math.round(d * 3), '#d8d0c0'); k.P(10 + Math.round(d * 5), -1 - Math.round(d * 2), '#d8d0c0'); }); }
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
  // (7.373) the stove factor: draws on the pipe (a bigger puff of smoke after), taps it out, rests
  const RT = routine(k.t, s.ph, [[['draw', 1.4], ['puff', 1.6], ['rest', 1.6], ['tap', .8]], [['rest', 1.2], ['draw', 1.6], ['puff', 1.8], ['rest', .8]]]);
  workSound(s, RT, { tap:'work-tinker' });
  const n = RT.name === 'puff' ? 6 : 3;
  for(let i = 0; i < n; i++){ const p = (k.t * .5 + i / n + s.ph) % 1; k.alpha((1 - p) * .6, () => k.R(7 + Math.round(Math.sin(p * 5 + i) * 1.5), -14 - Math.round(p * 10), 1 + (p > .5 ? 1 : 0) + (RT.name === 'puff' ? 1 : 0), 1, '#e8e8ec')); }
  if(RT.name === 'draw' && RT.u > .3 && RT.u < .8) k.P(6, -12, '#ffb040');
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
  // (7.373) the courier: writes the docket, checks the satchel strap, looks up at the door
  const RT = routine(k.t, s.ph, [[['write', 2.0], ['strap', 1.0], ['look', 1.2]], [['look', 1.0], ['write', 2.4], ['strap', .8]]]);
  workSound(s, RT, { write:'work-pencil' });
  const q = RT.name === 'write' ? Math.round(Math.sin(k.t * 9 + s.ph)) : 0;
  if(RT.name === 'strap'){ k.L(-4, -6, -2, -8, 2, C.d); hand(k, -2, -9, sk); }
  k.L(4, -6, 6, -2, 2, C.c); hand(k, 6, -2, sk); k.L(8 + q, -2, 10 + q, -7, 1, '#f4f0e8'); k.P(10 + q, -7, '#ffffff');
};
/* THE SLEEPLESS CLERK · the Inversion. A butter-yellow nightshirt and a long nightcap drooping to the shoulder with
   a bobble, deep purple under the eyes, the candle on its saucer; she yawns. */
K.clerk = (k, s) => {
  const C = pal('#e6cc5a', '#fff0a0', '#a08a2c'), sk = SKIN.pale;
  k.poly([[-5, -9], [5, -9], [6, 4], [-6, 4]], C);
  k.R(-2, -9, 5, 2, '#fffaf0'); k.P(0, -6, C.d); k.P(0, -3, C.d);
  // (7.373) the sleepless clerk: yawns, trims the candle, nods off a moment and starts
  const RT = routine(k.t, s.ph, [[['wait', 1.6], ['yawn', 1.2], ['trim', 1.2], ['nod', 1.6]], [['nod', 1.4], ['wait', 1.2], ['yawn', 1.4], ['trim', 1.0]]]);
  workSound(s, RT, { trim:'work-tinker' });
  const yawn = RT.name === 'yawn' && RT.u > .15 && RT.u < .85;
  if(RT.name === 'nod') k = k.at(0, RT.u < .8 ? Math.round(ease(RT.u / .8) * 2) : 0);
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
const BUSY = new Set(['vey', 'olan', 'mara', 'rowan', 'orra', 'pell', 'hale', 'elsie', 'oren', 'sable', 'bram', 'silas', 'cartographer', 'recruit', 'archivist', 'servicekeeper', 'nim', 'frostwoman', 'creaturekeeper', 'foundry', 'breaker', 'automaton', 'neighbor', 'upstairs', 'bellkeeper', 'defender', 'lookout', 'volunteer', 'miner', 'sailor', 'stranded', 'organizer', 'soldier', 'mother', 'pilgrim', 'gardener', 'talla', 'edrin', 'senn', 'veya', 'sickwoman']);   // (7.371) + Bram's lantern   // (7.363) + the Woods and the Causeway
const attention = new WeakMap();
function attend(g, o, t){
  const p = g && g.p, near = !!p && Math.abs(p.x - o.x) < 130 && Math.abs((p.y || 0) - (o.y || 0)) < 90;
  let a = attention.get(o); if(!a){ a = { near:false, since:-9 }; attention.set(o, a); }
  if(near && !a.near) a.since = t; a.near = near;
  return near ? { busy:false, notice:Math.min(1, (t - a.since) / .7) } : { busy:true, notice:1 };
}
/* (7.373) A word to themselves: as the knight comes within earshot of someone busy, they mutter one short line about
   their work, voiced, once per visit (a new stage builds new residents). Never two at once, and never over speech. */
const barked = new WeakSet(); let lastBark = -1e9;
function bark(g, id, o){
  const V = root.BladefallVoice, text = V && V.LINES && V.LINES['barks/' + id], p = g && g.p;
  if(!text || !p || barked.has(o) || !Number.isFinite(o.x)) return;
  const dx = Math.abs(p.x - o.x), dy = Math.abs((p.y || 0) - (o.y || 0)); if(dx > 240 || dy > 120) return;
  try { if(typeof mode !== 'undefined' && mode !== 'play') return; } catch(_e){}
  const now = root.performance ? root.performance.now() : Date.now(); if(now - lastBark < 9000 || V.speaking()) return;
  barked.add(o); lastBark = now; const secs = V.play(text) || 2.2;
  let floor = 0; try { floor = typeof GROUND_Y !== 'undefined' ? GROUND_Y : 0; } catch(_e){}   // Explore's texts are in screen-world y
  if(Array.isArray(g.texts)) g.texts.push({ x:o.x, y:floor - (o.y || 0) - (HEAD[id] || 34) - 26, txt:text, color:'#e6dcc4', quiet:true, vy:-6, life:secs + 1.6 });
}
function pose(api, id, o, extra){
  const g = api.G, t = api.time || 0, vx = o.vx != null && Math.abs(o.vx) > 8 ? o.vx : velocity(o, t);
  const walk = Math.abs(vx) > 8;
  const s = Object.assign({ id, t, ph:seed(id), walk, look:1, o, sit:false }, extra || {});
  if(!walk && !s.good && !s.chartGiven && !s.run && !s.air && !(g && g.npcs && g.npcs.includes(o))){ const a = attend(g, o, t);
    // (7.361) Everyone is at their own work until the knight comes close: the four with a work pose use it; the rest
    // keep to their side, heads down in a slow working bob, and turn with the same start when they notice him.
    if(BUSY.has(id)) s.busy = a.busy; else s.idle = a.busy;
    s.notice = a.notice; if(s.busy) bark(g, id, o); }
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
      if(q.id === 'recruit') extra.helmet = scene?.round2 ? r.step === 1 && !!scene.round2.returned : r.step >= 1 && !(scene && scene.escort && scene.escort.helmetDropped);
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
