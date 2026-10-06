/* Bladefall — ACT THREE · The Fractured King's art (2026-09-25).

   The Throne drained: wet black stone, a tide line on every wall, pale lilac where the Echo has been. What
   you must read: the marks (the echo's — a hollow sigil only a second body fills; yours — a plain slab),
   whether each is weighed, the gates they hold, the span that comes when both are weighed together, and the
   Weighed Crown: hung high (nothing reaches it), pulled down onto your echo's mark (kneeling: strike), and
   the blow it aims at your echo (a ring closing on it). */
(function installFracturedKingArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;

const C = {
  sky:['#05060a', '#0a0c14', '#10131e', '#161a28'],
  hall0:'#0a0c12', hall1:'#11141d',
  stone0:'#1a1c24', stone1:'#282b36', stoneLit:'#5a6072', tide:'#3a4658', wet:'#8aa0b8',
  lilac:'216,183,255', lilacHex:'#d8b7ff', pale:'#f1e6ff', knightMark:'#b8a890', knightLit:'#e8dcc4',
};
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 34 ? A : null; }

function draw(phase, api, a){
  switch(phase){
    case 'backdrop': backdrop(api); return true;
    case 'plat': return plat(api, a);
    case 'object': return object(api, a);
    case 'world': return true;
    case 'enemy': return enemy(api, a);
    case 'overlay': overlay(api); return true;
  }
  return false;
}

function backdrop(api){
  FA.sky(api, C.sky, 'fk');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  const { B, bw, Z } = api;
  // Drowned arches, and the tide line across them.
  for(const [par, col, spacing, seed] of [[.15, C.hall0, 340, 5], [.3, C.hall1, 240, 11]]){
    const half = bw / (2 * Z);
    const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
    for(let k = Math.floor(w0 / spacing) - 1; k <= Math.ceil(w1 / spacing) + 1; k++){
      const x = Math.round((k * spacing - api.camX - half) * Z * par + bw / 2), h = 240 + Math.round(api.hash(k, seed) * 220), w = 30 + Math.round(api.hash(k, seed + 1) * 20);
      B(x, horizon - h, w, h + 60, col); B(x - 40, horizon - h, w + 80, 8, col);
      B(x, horizon - Math.round(h * .45), w, 2, C.tide);
    }
  }
  FA.ash(api, 'rgba(200,190,230,.10)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'throne':
      B(s.x0, s.y, s.w, s.floor - s.y, C.stone0); B(s.x0, s.y, s.w, 3, C.stone1); B(s.x0, s.y, s.w, 1, C.wet);
      for(let x = s.x0 - ((s.x0 + base) % 44); x < s.x1; x += 44) if(x >= s.x0) B(x, s.y + 4, 1, 8, C.hall0);
      FA.seams(api, s, base, '#8a74b0');
      return true;
    case 'ledge':
      B(s.x0, s.y, s.w, s.floor - s.y, C.stone1); B(s.x0, s.y, s.w, 2, C.wet);
      return true;
    case 'span':
      if(o.gone) return true;
      B(s.x0 + 1, s.y, s.w - 2, s.floor - s.y, C.stone1); B(s.x0 + 1, s.y, s.w - 2, 2, C.lilacHex);
      return true;
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api, A = st(api), t = api.time;
  if(o.type === 'wall' && o.actArt){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = Math.max(-4, WY(o.y)), bot = Math.min(api.bh + 4, WY(o.y - o.h)), w = x1 - x0;
    if(o.actArt === 'wall'){ B(x0, top, w, bot - top, C.stone1); B(x0, top + Math.round((bot - top) * .4), w, 2, C.tide); for(let y = top + 8; y < bot; y += 13) B(x0 + 2, y, 2, 6, C.wet); return true; }
    if(o.actArt === 'bars'){ const lift = o.gone ? Math.round((bot - top) * .94) : 0; for(let x = x0 + 2; x < x1 - 1; x += 6) B(x, top, 3, bot - top - lift, C.stone1); B(x0 - 3, top, w + 6, 3, C.stoneLit); return true; }
    return false;
  }
  if(o.type === 'plate' && o.actArt === 'mark'){
    const bx = WX(o.x - o.w / 2), by = WY(o.y || 0), w = Math.round(o.w * api.Z), on = !!o.pressed, x = bx + w / 2;
    if(o.echoOnly){
      // The echo's mark: a hollow sigil, filled only by a second body.
      const col = on ? C.pale : C.lilacHex;
      B(bx - 2, by - 2, w + 4, 4, C.stone0); B(bx, by - 3, w, 2, col);
      B(x - 6, by - 26, 12, 20, 'rgba(0,0,0,0)'); B(x - 6, by - 26, 12, 1, col); B(x - 6, by - 26, 1, 20, col); B(x + 5, by - 26, 1, 20, col); B(x - 3, by - 31, 6, 4, col);
      if(on){ B(x - 5, by - 25, 10, 18, `rgba(${C.lilac},.35)`); api.glow(x, by - 14, 20, C.lilac, .25); }
      else api.glow(x, by - 14, 12, C.lilac, .08 + .05 * Math.sin(t * 3));
    } else {
      // Yours: a plain slab that sinks when you stand on it.
      const d = on ? 2 : 0;
      B(bx, by - 4 + d, w, 4 - d, on ? C.knightLit : C.knightMark); B(bx, by - 4 + d, w, 1, C.knightLit);
    }
    return true;
  }
  if(o.type === 'spikes' && o.actArt === 'teeth') return false;       // the engine's timed teeth read fine
  switch(o.type){
    case 'actTunnel': {
      const x = WX(o.x), base = WY(o.y || 0), top = WY((o.y || 0) + o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.stone1); B(x + w, top + r * 4, 10, 4, C.stone1); }
      api.glow(x, base - 60, 60, C.lilac, .12);
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 12, y - 3, 24, 3, C.stone1); for(let i = 0; i < 3; i++) B(x - 6 + i * 5, y - 7, 3, 4, i % 2 ? C.lilacHex : C.pale); api.glow(x, y - 6, 22, C.lilac, .3); return true; }
  }
  return false;
}

/* THE WEIGHED CROWN: a hollow crown over a long drowned robe. Hung, it sways; kneeling, the crown is low and lit. */
function enemy(api, e){
  if(e.actFoe !== 'crown') return false;
  const { B, WX, WY } = api, s = n => Math.round(n * api.Z), t = api.time;
  const sh = e.shake > 0 ? Math.round(Math.sin(t * 40) * 2) : 0, x = WX(e.x) + sh, foot = WY(e.y), top = WY(e.y + e.h);
  if(e.st === 'down'){ B(x - s(50), WY(0) - s(10), s(100), s(10), C.stone1); B(x - s(20), WY(0) - s(22), s(40), s(12), C.lilacHex); return true; }
  const sway = e.st === 'hover' ? Math.round(Math.sin(t * 1.4) * s(4)) : 0;
  // Robe.
  for(let i = 0; i < 6; i++){ const yy = top + s(30) + i * s(14), ww = s(40 + i * 8); B(x - ww / 2 + sway * (i / 6), yy, ww, s(14), i % 2 ? C.stone1 : C.stone0); }
  B(x - s(20) + sway, top + s(16), s(40), s(18), C.stone1);
  // The crown.
  const kneel = e.st === 'kneel', col = kneel ? C.pale : C.lilacHex;
  for(let i = 0; i < 5; i++) B(x - s(22) + i * s(10) + sway, top - s(6) - (i % 2 ? s(6) : 0), s(5), s(10) + (i % 2 ? s(6) : 0), col);
  B(x - s(24) + sway, top + s(4), s(48), s(5), col);
  if(kneel && !e.struck) B(x-s(40),foot-s(4),s(80)*Math.max(0,1-e.t/root.BladefallFracturedKing.constants.CROWN.kneel),2,C.pale);
  if(kneel && !e.struck) api.glow(x, top + s(6), s(34), C.lilac, .5 + .2 * Math.sin(t * 10));
  // Hung: the threads that hold it up.
  if(e.st === 'hover'){ for(const dx of [-18, 18]) B(x + s(dx) + sway, 0, 1, Math.max(0, top), `rgba(${C.lilac},.18)`); }
  return true;
}
function overlay(api){
  const A = st(api) || {};
  FA.vignette(api, '6,6,12', .5);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(230,220,255,${.14 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
  // The blows at your echo: a ring closing on where it stands.
  const { WX, WY, ctx } = api;
  if(A.returnT>0){const gate=api.G.obstacles.find(o=>o.actBars==='return');if(gate){
    const k=root.BladefallFracturedKing.constants.RETURN;
    api.B(WX(gate.x)-20,WY(gate.y-gate.h+60),40*Math.min(1,A.returnT/k.hold),3,C.pale);
  }}
  for(const b of A.breakers || []){
    const f = Math.min(1, b.t / 1.0), r = Math.max(4, Math.round((1 - f) * 70 * api.Z + 10));
    ctx.save(); ctx.strokeStyle = `rgba(216,183,255,${.4 + .5 * f})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(WX(b.x), WY(b.y + 22), r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
}

ART.register(34, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
