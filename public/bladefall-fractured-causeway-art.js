/* Bladefall — ACT THREE · The Fractured Causeway's art (2026-09-24).

   The Broken Causeway at night: a deck of iron plates over the void, a gantry of hoists against a
   rust-red sky, the machines running. What you must read is exact: every mass and its chain — its
   shadow on the deck under it, the chain rattling when it is about to go; the plate the yard's mass
   must land on; each release post, with its chain running up to the mass it lets go; the Iron Echo's
   stamp before it charges. */
(function installFracturedCausewayArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;

const C = {
  sky:['#07050a', '#140a10', '#2a1216', '#3a1a14'],
  hill0:'#0a0708', hill1:'#120c0e', hill2:'#1a1214',
  deck0:'#1a1616', deck1:'#2a2424', deckLit:'#4a4040', rivet:'#5a5048',
  iron0:'#24222a', iron1:'#3a3842', ironLit:'#6a6878', rust:'#6a3a24', rustLit:'#a0583a',
  chain:'#5a5654', chainLit:'#8a8680', brass:'#c9a060', brassLit:'#f0d890',
  armour:'#3a3a44', armour2:'#52525e', slit:'255,150,70',
};
const K = () => root.BladefallFracturedCauseway;
function massColor(id){ return id === 'B' ? '#94cbd0' : id === 'C' ? '#d2a4ca' : '#edc478'; }
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 25 ? A : null; }

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
  FA.sky(api, C.sky, 'fc');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  FA.bands(api, [[.1, C.hill0, 80, .004], [.24, C.hill1, 60, .007]], horizon);
  // Far gantries: the causeway's cranes, still.
  const { B, bw, Z } = api, par = .34, half = bw / (2 * Z);
  for(let k = Math.floor(((-bw / 2) / (Z * par) + api.camX + half) / 700) - 1; k <= Math.ceil(((bw / 2) / (Z * par) + api.camX + half) / 700) + 1; k++){
    const x = Math.round((k * 700 + api.hash(k, 9) * 260 - api.camX - half) * Z * par + bw / 2), h = 150 + Math.round(api.hash(k, 8) * 90);
    B(x - 4, horizon - h, 8, h + 40, C.hill2); B(x - 4, horizon - h, 90, 6, C.hill2); B(x + 80, horizon - h + 6, 2, 50, C.hill2);
  }
  FA.ash(api, 'rgba(220,160,140,.18)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0 || o.gone) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'deck':
      B(s.x0, s.y, s.w, s.floor - s.y, C.deck0); B(s.x0, s.y, s.w, 4, C.deck1); B(s.x0, s.y, s.w, 1, C.deckLit);
      for(let x = s.x0 - ((s.x0 + base) % 48); x < s.x1; x += 48) if(x >= s.x0){ B(x, s.y + 1, 1, 6, C.deck0); B(x + 4, s.y + 2, 2, 2, C.rivet); }
      FA.seams(api, s, base, '#9a4a3a');
      return true;
    case 'girder': case 'lift':
      B(s.x0, s.y, s.w, 6, C.iron1); B(s.x0, s.y, s.w, 1, C.ironLit); B(s.x0, s.y + 6, s.w, 3, C.iron0);
      for(let x = s.x0 + 4; x < s.x1 - 4; x += 12){ B(x, s.y + 2, 2, 2, C.rivet); }
      if(o.actArt === 'lift'){ const cx = Math.round((s.x0 + s.x1) / 2); for(let y = s.y - 6; y > 0; y -= 8) B(cx - 1, y, 2, 5, C.chain); }
      return true;
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api, A = st(api);
  if(o.type === 'wall' && o.actArt){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = WY(o.y), bot = WY(o.y - o.h), w = x1 - x0;
    switch(o.actArt){
      case 'mass': return true;                       // drawn in the world pass, wherever it hangs
      case 'bulkhead': {
        // A buffer stop: a braced iron block with two sprung buffers on the court side.
        B(x0, top, w, bot - top, C.iron0); B(x0, top, w, 3, C.ironLit);
        for(let y = top + 10; y < bot; y += 14) B(x0 + 2, y, w - 4, 2, C.iron1);
        const face = o.x < 10000 ? x1 : x0 - 8;
        for(const yy of [top + 12, top + 34]){ B(face, yy, 8, 10, C.rust); B(o.x < 10000 ? face + 6 : face, yy + 2, 2, 6, C.rustLit); }
        return true;
      }
      case 'bars': {
        const lift = o.gone ? Math.round((bot - top) * .92) : 0;
        for(let x = x0 + 2; x < x1 - 1; x += 7) B(x, top, 3, bot - top - lift, C.iron1);
        B(x0 - 4, top, w + 8, 4, C.ironLit);
        return true;
      }
    }
    return false;
  }
  switch(o.type){
    case 'actPlate': {
      const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), y = WY(0), done = A && (o.lesson ? A.lesson : A.yard);
      B(x0, y - 4, x1 - x0, 4, done ? C.brassLit : C.brass); B(x0 + 3, y - 6, x1 - x0 - 6, 2, done ? C.brassLit : C.rust);
      if(!done) api.glow((x0 + x1) / 2, y - 3, 22, '220,170,90', .12);
      return true;
    }
    case 'actRelease': {
      const x = WX(o.x), y = WY(o.y), base = WY(0);
      B(x - 2, y, 4, base - y, C.iron1);
      const ready = A && A.masses[o.mass]?.st === 'hang', col = ready ? massColor(o.mass) : C.iron1;
      B(x - 8, y - 8, 16, 16, col); B(x - 5, y - 5, 10, 10, C.iron0);
      // A taut target cord becomes visibly severed after the shot.
      if(ready){ B(x - 1, y - 7, 2, 14, C.brassLit); api.glow(x, y, 14, '240,190,110', .2); }
      else { B(x - 1, y - 7, 2, 4, C.chain); B(x + 2, y + 3, 2, 4, C.chain); }
      return true;
    }
    case 'actBow': {
      if(A && A.bow) return true;
      const x = WX(o.x), y = WY(o.y);
      // The standard's pole, and the Longbow hung on it.
      B(x - 2, y - 70, 4, 70, C.iron1); B(x - 18, y - 70, 36, 3, C.rustLit);
      for(let k = -20; k <= 20; k += 2) B(x + 10 + Math.round(Math.cos(k / 20 * 1.3) * 6), y - 42 + k, 2, 2, '#8a5a30');
      B(x + 9, y - 60, 1, 38, '#e8d8b0'); api.glow(x + 12, y - 42, 16, '240,200,140', .25);
      return true;
    }
    case 'actGantry': return true;
    case 'actTunnel': {
      const x = WX(o.x), base = WY(0), top = WY(o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.iron1); B(x + w, top + r * 4, 10, 4, C.iron1); }
      api.glow(x, base - 60, 60, '240,190,150', .1);
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 10, y - 3, 20, 3, '#2a2420'); for(let i = 0; i < 5; i++) B(x - 8 + i * 4, y - 5 - (i % 2), 2, 2, i % 2 ? '#8a3a1e' : '#ff8a3a'); api.glow(x, y - 6, 24, '255,120,60', .2); return true; }
  }
  return false;
}

/* The masses, where they are: chain up to the gantry, the shadow on the deck, the rattle before it goes.
   And each release's chain, up and over to its mass. */
function world(api){
  const k = K(), A = st(api); if(!k || !A || !A.masses) return;
  const { B, WX, WY, ctx } = api, t = api.env?.reducedMotion ? 0 : api.time, M = k.constants.MASS;
  const gantryY = WY(640);
  for(const r of k.constants.RELEASES){
    const s = A.masses[r.mass]; if(!s || s.st === 'wreck') continue;
    const x0 = WX(r.x), y0 = WY(r.y + 10), x1 = WX(s.x), rail = WY(k.constants.MASSES.find(m => m.id === r.mass).y + 35);
    ctx.save(); ctx.strokeStyle = s.st === 'hang' ? massColor(r.mass) : C.chain; ctx.globalAlpha = s.st === 'hang' ? .65 : .25; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, rail); ctx.lineTo(x1, rail); ctx.lineTo(x1, WY(s.y)); ctx.stroke(); ctx.restore();
  }
  for(const m of k.constants.MASSES){
    const s = A.masses[m.id]; if(!s) continue;
    const x = WX(s.x), w = Math.round(M.w * api.Z), top = WY(s.y), h = Math.round(M.h * api.Z);
    if(x + w < -20 || x - w > api.bw + 20) continue;
    const rattle = s.st === 'warn' ? Math.round(Math.sin(t * 60) * 2) : 0;
    // The chain up to the gantry (not once it has fallen and stayed).
    if(s.st !== 'wreck' && s.st !== 'landed') for(let y = gantryY; y < top; y += 8) B(x - 1 + rattle, y, 2, 5, s.st === 'warn' ? C.chainLit : C.chain);
    // Its shadow on the deck, while it hangs over you.
    if(s.st === 'hang' || s.st === 'warn' || s.st === 'fall'){ const q = Math.max(.15, 1 - (s.y - M.h) / 500); ctx.fillStyle = `rgba(0,0,0,${.45 * q})`; ctx.fillRect(x - w / 2, WY(0) - 2, w, 3); }
    // Amber brackets show the committed fall footprint even when the hoist is off-screen.
    if(s.st === 'warn' || s.st === 'fall'){
      const floor = WY(0), col = s.st === 'warn' ? '#ffd18a' : '#f58d69';
      B(x - w / 2, floor - 2, w, 2, col);
      for(const edge of [x - w / 2, x + w / 2 - 2]) B(edge, floor - 9, 2, 9, col);
    }
    // The mass: riveted iron, rust in the seams.
    B(x - w / 2 + rattle, top, w, h, C.iron0); B(x - w / 2 + rattle, top, w, 3, C.ironLit);
    for(let yy = top + 10; yy < top + h - 4; yy += 14) B(x - w / 2 + 4 + rattle, yy, w - 8, 2, C.rust);
    for(let xx = x - w / 2 + 6; xx < x + w / 2 - 4; xx += 12) B(xx + rattle, top + 5, 2, 2, C.rivet);
    if(m.trigger === 'release') B(x - w / 2 + 4, top + h - 4, w - 8, 2, massColor(m.id));
    if(s.st === 'warn') api.glow(x, top + h / 2, 26, '255,160,90', .25);
  }
  // The plate's physical linkage leads to its gate, bright once the weight seats.
  for(const [px, gx, done] of [[k.constants.PLATE.x, 4100, A.yard], [k.constants.LESSON.x, k.constants.LESSON.gateX, A.lesson]]){
    const left = Math.max(0, WX(px)), right = Math.min(api.bw, WX(gx));
    if(right > left){ B(left, WY(0) + 5, right - left, 1, done ? C.brassLit : C.chain); }
  }
  // The gantry beam itself.
  const x0 = Math.max(0, WX(600)), x1 = Math.min(api.bw, WX(k.constants.LEN - 300));
  if(x1 > x0){ B(x0, gantryY - 6, x1 - x0, 6, C.iron0); B(x0, gantryY - 6, x1 - x0, 1, C.iron1); }
}

function enemy(api, e){
  if(e.actFoe !== 'iron') return false;
  const { WX, WY } = api, x = WX(e.x), y = WY(e.y), f = e.dir || e.face || -1, t = api.env?.reducedMotion ? 0 : api.time;
  // Body dimensions are world units, just like its collision and the knight's jump.
  const B = (bx, by, w, h, col) => api.B(x + (bx - x) * api.Z, y + (by - y) * api.Z, w * api.Z, h * api.Z, col);
  const crouch = e.st === 'windup' ? 6 : e.st === 'daze' || e.st === 'crushed' ? 10 : e.st === 'buried' ? 40 : 0;
  const lean = e.st === 'charge' ? f * 10 : 0, h = (e.st === 'charge' ? K().constants.IRON.chargeReach : 84) - crouch;
  // Legs, the barrel of the body, the pauldrons; plates on plates.
  B(x - 20, y - 22, 14, 22, C.armour); B(x + 6, y - 22, 14, 22, C.armour);
  for(let r = 0; r < h - 22; r++){ const w = 30 - Math.round(Math.abs(r - (h - 22) * .6) * .18); B(x - w + Math.round(lean * r / h), y - 22 - r, w * 2, 1, r % 10 === 0 ? C.armour : C.armour2); }
  const top = y - h, hx = x + lean;
  B(hx - 36, top + 10, 16, 12, C.armour2); B(hx + 20, top + 10, 16, 12, C.armour2);
  B(hx - 12, top - 8, 24, 20, C.armour); B(hx - 12, top - 8, 24, 2, C.ironLit);
  const glow = e.st === 'windup' ? .6 + .4 * Math.sin(t * 34) : e.st === 'charge' ? 1 : e.st === 'daze' ? .15 : .4;
  B(hx - 8 + (f > 0 ? 3 : 0), top, 12, 3, `rgba(${C.slit},${glow})`); api.glow(x + (hx + f * 2 - x) * api.Z, y + (top + 1 - y) * api.Z, (10 + glow * 10) * api.Z, C.slit, .25 * glow);
  if(e.st === 'windup' && e.target != null){
    const tx = WX(e.target), floor = WY(0);
    api.B(tx - 12, floor - 2, 24, 2, C.brassLit);
    api.B(tx - 1, floor - 7, 2, 7, C.brassLit);
  }
  // The stamp: dust off the deck under its lead foot.
  if(e.st === 'windup' && Math.floor(e.t * 6) % 2 === 0) for(let k = 0; k < 6; k++) B(x + f * (18 + k * 5), y - 1 - (k % 2), 3, 1, '#b8a890');
  // Dazed: sparks off the helm.
  if(e.st === 'daze') for(let k = 0; k < 3; k++) B(hx - 10 + ((t * 40 + k * 13) % 22), top - 14 - (k * 3), 2, 2, '#ffd27a');
  return true;
}

/* The Iron Echo off the screen still tells you: a chevron at that edge, pulsing with its stamp, streaking
   with its charge. */
function edgeTell(api, A){
  const e = A.iron; if(!e || e.dead || !A.fight || !['windup', 'charge'].includes(e.st)) return;
  const x = api.WX(e.x); if(x > -10 && x < api.bw + 10) return;
  const side = x < 0 ? 1 : -1, ex = side > 0 ? 8 : api.bw - 8, y = api.WY(e.y + 40), t = api.time, { B } = api;
  const a = e.st === 'charge' ? 1 : .5 + .5 * Math.abs(Math.sin(t * 17));
  for(let k = 0; k < 10; k++){ B(ex + side * k, y - 10 + k, 2, 2, `rgba(255,150,70,${a})`); B(ex + side * k, y + 10 - k, 2, 2, `rgba(255,150,70,${a})`); }
  if(e.st === 'charge') for(let k = 0; k < 5; k++) B(ex + side * (14 + k * 8), y - 1, 5, 2, `rgba(255,190,120,${.8 - k * .15})`);
  api.glow(ex + side * 6, y, 22, '255,150,70', .35 * a);
}
function overlay(api){
  const A = st(api) || {};
  edgeTell(api, A);
  FA.vignette(api, '8,4,4', .55);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(255,220,180,${.14 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
}

ART.register(25, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
