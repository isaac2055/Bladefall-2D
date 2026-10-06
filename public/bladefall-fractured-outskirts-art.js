/* Bladefall — ACT THREE · The Fractured Outskirts' art (2026-09-24).

   The first road, after the Echo walked it backwards: night, a bruised sky, a cracked moon, ash
   in the air, and violet fractures through the road where the echo tore. The camp's fires are
   out. Everything readable is warm: the Sentinel's tells glow, its hammer's head, the bells'
   bronze, the Mothlight Gate's pale light. Only the rift is violet. */
(function installFracturedOutskirtsArt(root){
'use strict';
const ART = root.BladefallActTwoArt;
if(!ART || !ART.register) return;

const C = {
  sky:['#07060f', '#140d22', '#2a1330', '#4a1c2a'], moon:'#d9cfe8', moonShade:'#9d8fb5',
  hill0:'#0d0a16', hill1:'#140f1f', hill2:'#1c1428',
  ash0:'#1c1822', ash1:'#2b2530', ash2:'#3e3646', ashLit:'#5a5064', rift:'#8a5cd8', riftLit:'#c9a8ff',
  stone0:'#22202a', stone1:'#34303e', stone2:'#4a4556', plank:'#3a2c24', plankLit:'#5c4636',
  iron0:'#1e1d24', iron1:'#3a3a44', iron2:'#5a5a66', rust:'#7a4a2e', ember:'#ff8a3a', emberDim:'#8a3a1e',
  bronze0:'#5a3d1c', bronze1:'#9a6a2e', bronze2:'#d8a24a', mothlight:'200,255,220',
};
const L = () => root.BladefallFracturedOutskirts && root.BladefallFracturedOutskirts.constants;
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 21 ? A : null; }

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

/* ── Backdrop ─────────────────────────────────────────────────────────────── */
const cache = {};
function skyLayer(api){
  const key = 'sky' + api.bw + 'x' + api.bh;
  return cache[key] || (cache[key] = api.layer(api.bw, api.bh, g => {
    const gr = g.createLinearGradient(0, 0, 0, api.bh);
    [0, .42, .72, .95].forEach((s, i) => gr.addColorStop(s, C.sky[i]));
    g.fillStyle = gr; g.fillRect(0, 0, api.bw, api.bh);
    for(let i = 0; i < 90; i++){ const x = (i * 97) % api.bw, y = (i * 53) % Math.round(api.bh * .55); g.fillStyle = i % 7 ? 'rgba(220,210,240,.35)' : 'rgba(201,168,255,.6)'; g.fillRect(x, y, 1, 1); }
  }));
}
function farX(api, wx, par){ return Math.round(api.bw / 2 + (wx - (api.camX + api.bw / (2 * api.Z))) * api.Z * par); }
function backdrop(api){
  const { ctx, B, bw, bh } = api, t = api.time;
  ctx.drawImage(skyLayer(api), 0, 0);
  // The moon, cracked where the echo came through.
  const mx = Math.round(bw * .74), my = 58;
  api.glow(mx, my, 60, '200,180,230', .22);
  for(let dy = -16; dy <= 16; dy++){ const hw = Math.round(Math.sqrt(256 - dy * dy)); B(mx - hw, my + dy, hw * 2 + 1, 1, dy > 6 ? C.moonShade : C.moon); }
  for(let k = 0; k < 14; k++) B(mx - 6 + k, my - 10 + Math.round(k * 1.4) + (k % 3), 1, 1, C.rift);
  const horizon = Math.round(api.groundBy - 30 + api.camYb * .2);
  // Three bands of dead hills; the far ridge carries the camp's broken palisade.
  [[.1, C.hill0, 70, .004], [.22, C.hill1, 44, .007], [.4, C.hill2, 26, .011]].forEach(([par, col, amp, f], i) => {
    for(let x = 0; x < bw; x += 2){
      const wx = (x - bw / 2) / (api.Z * par) + api.camX + bw / (2 * api.Z);
      const h = Math.round(amp * (.6 + .4 * Math.sin(wx * f + i)) + 18 + Math.sin(wx * f * 3.1) * 6);
      B(x, horizon - h, 2, bh - horizon + h, col);
      if(i === 2 && (Math.floor(wx / 40) % 9 === 0)) B(x, horizon - h - 10, 1, 10, C.hill0);
    }
  });
  // Ash falling.
  ctx.fillStyle = 'rgba(190,180,200,.35)';
  for(let i = 0; i < 40; i++){ const x = ((i * 131 + t * 22 * (1 + i % 3)) % (bw + 20)) - 10, y = ((i * 71 + t * 30) % bh); ctx.fillRect(x, y, 1, 1); }
}

/* ── Platforms ────────────────────────────────────────────────────────────── */
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function plat(api, o){
  if(o.gone) return true;
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'ash': {
      B(s.x0, s.y, s.w, s.floor - s.y, C.ash0); B(s.x0, s.y, s.w, 6, C.ash1); B(s.x0, s.y, s.w, 1, C.ashLit);
      for(let x = s.x0 - ((s.x0 + base) % 14); x < s.x1; x += 14) if(x >= s.x0){ B(x, s.y - 2, 1, 2, '#4a4436'); B(x + 5, s.y - 1, 1, 1, '#4a4436'); }
      // The fractures: violet seams through the road.
      for(let x = s.x0; x < s.x1; x += 2){ const k = api.hash((x + base) >> 1, 21); if(k > .965){ B(x, s.y + 2, 1, 3 + Math.round(k * 20) % 6, C.rift); if(k > .99) B(x, s.y + 1, 1, 1, C.riftLit); } }
      // Its edges, broken off over the void.
      B(s.x0, s.y, 2, Math.min(40, s.floor - s.y), C.ash2); B(s.x1 - 2, s.y, 2, Math.min(40, s.floor - s.y), C.ash2);
      return true;
    }
    case 'stone': case 'vigil-top': {
      const crumbling = o.crumble && o.crT > 0;
      B(s.x0, s.y, s.w, Math.max(6, s.floor - s.y), C.stone1); B(s.x0, s.y, s.w, 2, C.stone2); B(s.x0, s.y + Math.max(4, s.floor - s.y - 2), s.w, 2, C.stone0);
      if(o.crumble){
        for(let x = s.x0 + 3; x < s.x1 - 3; x += 7) B(x, s.y + 1, 1, 5, crumbling ? C.bronze2 : C.stone0);
        if(crumbling){ const left = Math.max(0, o.crT / (o.crDur || .45));
          B(s.x0, s.y - 1, Math.max(1, s.w * left), 1, '#f5d9a0');
          for(let i = 0; i < 3; i++) B(s.x0 + (i + 1) * s.w / 4, s.y + 6 + ((api.time * 28 + i * 3) % 12), 1, 2, C.stone2);
        }
      }
      if(o.actArt === 'vigil-top' || o.x === 1470) foothold(api, o.x, o.y, o.w, 1);
      return true;
    }
    case 'refuge': {
      B(s.x0, s.y, s.w, 5, C.plank); B(s.x0, s.y, s.w, 1, C.plankLit);
      B(s.x0 + 3, s.y + 5, 3, Math.max(0, api.WY(0) - s.y - 5), C.plank); B(s.x1 - 6, s.y + 5, 3, Math.max(0, api.WY(0) - s.y - 5), C.plank);
      foothold(api, o.x, o.y, o.w, 1); return true;
    }
    case 'haft': {
      // The hammer's haft, stuck: a step, while it lasts.
      const A = st(api), k = A && A.haft ? Math.max(0, 1 - A.haft.t / (A.haft.duration || L().S.hfStuck[Math.min(2, A.rung)])) : 1;
      const cx = api.WX(o.x), floor = api.WY(0);
      B(cx - 3, s.y, 6, floor - s.y, '#6b4a2e'); B(cx - 1, s.y, 2, floor - s.y, '#b69566');
      B(cx - 13, floor - 10, 26, 10, C.iron2);
      foothold(api, o.x, o.y, o.w, k);
      return true;
    }
    case 'shoulders': return true;                     // exact ledge drawn by the stunned figure
  }
  return false;
}

// This same bronze, flat, riveted edge marks the road's refuges, the practice
// bell's stone, the hammer grip and the exposed shoulder armour.
function foothold(api, x, y, w, remaining){
  const left = api.WX(x - w / 2), right = api.WX(x + w / 2), top = api.WY(y);
  api.B(left, top, right - left, 4, C.bronze0);
  api.B(left, top, right - left, 1, C.bronze2);
  api.B(left, top, Math.max(1, (right - left) * remaining), 1, '#f5dfae');
  for(let xx = left + 3; xx < right - 2; xx += 7) api.B(xx, top + 2, 1, 1, C.bronze2);
}

/* ── Objects ──────────────────────────────────────────────────────────────── */
function object(api, o){
  switch(o.type){
    case 'wall':
      if(o.actArt === 'vigil-stone'){ drawStone(api, o); return true; }
      if(o.actArt === 'bars'){ drawBars(api, o, C.iron1, C.iron2); return true; }
      if(o.actArt === 'gate'){ drawBars(api, o, '#4a5a4e', '#8fb89a'); return true; }
      return false;
    case 'actCell': drawCell(api, o); return true;
    case 'actFire': drawFire(api, o); return true;
    case 'actBell': drawBell(api, o); return true;
    case 'actLever': drawLever(api, o); return true;
    case 'actGate': drawGate(api, o); return true;
  }
  return false;
}
function drawStone(api, o){
  const { B, WX, WY } = api, x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = WY(o.y), base = WY(o.y - o.h);
  if(x1 < -6 || x0 > api.bw + 6) return;
  B(x0, top, x1 - x0, base - top, C.stone1); B(x0, top, 3, base - top, C.stone2); B(x1 - 3, top, 3, base - top, C.stone0);
  for(let y = top + 8; y < base - 4; y += 11) B(x0 + 4, y, x1 - x0 - 8, 1, C.stone0);
  const cx = Math.round((x0 + x1) / 2), cy = top + 14;
  for(let a = 0; a < 12; a++){ const q = a / 12 * Math.PI * 2; B(Math.round(cx + Math.cos(q) * 4), Math.round(cy + Math.sin(q) * 4), 1, 1, C.iron2); }   // the chain's ring
}
function drawBars(api, o, dark, lit){
  const { B, WX, WY } = api, x = WX(o.x), floor = WY(o.y - o.h), top = WY(o.y);
  const k = o.gone ? Math.max(0, (o.moveT || 0) / 0.5) : 1, tip = Math.round(top + (floor - top) * k);
  if(tip <= top + 1) return;
  for(let i = -3; i <= 3; i++){ const bx = x + i * 5; B(bx, top, 2, tip - top, dark); B(bx, top, 1, tip - top, lit); B(bx - 1, tip - 3, 4, 3, dark); }
  for(let yy = top + 16; yy < tip - 6; yy += 34) B(x - 16, yy, 34, 2, dark);
}
/* The vigil cell on the ridge: a rock ledge, an iron cage, and it — awake — watching you. */
function drawCell(api, o){
  const { B, WX, WY } = api, A = st(api), x = WX(o.x), base = WY(o.y), top = WY(o.y + 130);
  if(x < -90 || x > api.bw + 90) return;
  for(let i = 0; i < 70; i++){ const w = Math.round(40 + i * .8); B(x - w, base + i, w * 2, 1, i < 4 ? C.stone2 : C.stone0); }   // the ledge
  const e = A && A.sentinel, inside = e && e.st === 'caged', shake = A && A.cellShake > 1.2 ? Math.round(Math.sin(api.time * 60)) : 0;
  if(inside) sentinelFigure(api, e, x + shake, base, { caged:true });
  for(let i = -5; i <= 5; i++){ const bx = x + i * 11 + (Math.abs(i) < 2 ? shake : 0); B(bx, top, 2, base - top, C.iron1); B(bx, top, 1, base - top, C.iron2); }
  B(x - 60, top - 3, 121, 4, C.iron1); B(x - 60, base - 3, 121, 3, C.iron0);
  if(!inside){ B(x - 12, base - 30, 24, 2, C.iron2); for(let k = 0; k < 6; k++) B(x + 8 + k * 3, base - 28 + (k % 2), 2, 2, C.iron1); }   // the door hanging, empty
}
function drawFire(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y), t = api.time;
  B(x - 10, y - 3, 20, 3, '#2a2420'); for(let i = 0; i < 5; i++) B(x - 8 + i * 4, y - 5 - (i % 2), 2, 2, i % 2 ? C.emberDim : C.ember);
  api.glow(x, y - 6, 26, '255,120,60', .22 + .06 * Math.sin(t * 5));
}
function drawBell(api, o){
  const { B, WX, WY, ctx } = api, A = st(api), x = WX(o.x), y = WY(o.y), rung = A && (o.bell === 'lesson' ? A.lesson : A.bells[o.bell]);
  if(x < -30 || x > api.bw + 30) return;
  for(let k = 0; k < 8; k++) B(x, y - 16 - k * 4, 1, 2, C.iron1);                  // its chain, up into the dark
  const swing = rung ? Math.round(Math.sin(api.time * 7) * 2) : 0;
  for(let r = 0; r < 12; r++){ const w = Math.round(3 + r * .55); B(x - w + swing, y - 8 + r, w * 2, 1, r < 3 ? C.bronze2 : r > 9 ? C.bronze0 : C.bronze1); }
  B(x - 1 + swing, y + 4, 2, 3, C.bronze0);
  if(rung){ api.glow(x, y, 20, '255,210,140', .45); ctx.strokeStyle = 'rgba(160,140,120,.8)'; ctx.lineWidth = 1; }
  else {
    const next = !A || !A.bells.centre ? 'centre' : !A.bells.east ? 'east' : 'west';
    const focus = o.bell === 'lesson' || o.bell === next;
    api.glow(x, y, focus ? 25 : 12, '216,162,74', focus ? .4 : .16);
    if(focus){
      // Moths settle on the lip, giving even a motion-reduced frame a clear target.
      B(x - 12, y - 2, 3, 1, '#f5dfae'); B(x + 10, y - 5, 3, 1, '#f5dfae');
      B(x - 8, y + 6, 16, 2, C.bronze2);
    }
  }
}
function drawLever(api, o){
  const { B, WX, WY } = api, A = st(api), x = WX(o.x), y = WY(o.y), pulled = A && A.released;
  B(x - 5, y - 20, 10, 20, C.iron1); B(x - 2, y - 36, 3, 16, C.iron2);
  if(pulled){ for(let k = 0; k < 10; k++) B(x - 30 + k * 3, y - 2 - (k % 2), 2, 2, C.iron1); }
  else { for(let k = 0; k < 12; k++) B(x + 1, y - 36 - k * 4, 1, 2, C.iron1); B(x - 3, y - 40, 7, 4, C.rust); }
}
function drawGate(api, o){
  const { B, WX, WY } = api, A = st(api), x = WX(o.x), base = WY(0), top = WY(320);
  if(x < -100 || x > api.bw + 100) return;
  api.glow(x + 20, base - 70, 90, C.mothlight, A && A.cleared ? .5 : .2);             // the mothlight beyond
  for(const side of [-1, 1]){ const px = x + side * 50 - 12; B(px, top, 24, base - top, C.stone1); B(px, top, 3, base - top, C.stone2); B(px - 3, top - 6, 30, 6, C.stone2); }
  B(x - 62, top - 14, 124, 12, C.stone1); B(x - 62, top - 14, 124, 2, C.stone2);
  for(let i = 0; i < 6; i++) B(x - 40 + i * 16, top - 22 + (i % 2) * 2, 2, 6, 'rgba(200,255,220,.6)');   // moths
}

/* ── World: the shock along the floor, the rings of the bells ─────────────── */
function world(api){
  const A = st(api); if(!A) return;
  const { B, WX, WY, ctx } = api;
  const k = L(); if(k){
    for(const s of k.ROAD_SWEEPS) drawRoadSweep(api, s, A);
    // Bell cables meet the actual gate. Lit chains stay lit after death.
    const cables = [{ ...k.LESSON, id:'lesson', to:k.LESSON.gateX }, ...k.BELLS.map(b => ({ ...b, to:k.GATE_X }))];
    for(const b of cables){
      if(WX(b.to) < -20 || WX(b.x) > api.bw + 20) continue;
      const rung = b.id === 'lesson' ? A.lesson : A.bells[b.id], h = b.id === 'lesson' ? 230 : 320 + k.BELLS.findIndex(q => q.id === b.id) * 22;
      const col = rung ? C.bronze2 : '#645a60';
      for(let yy = b.y + 24; yy < h; yy += 10) B(WX(b.x), WY(yy), 1, 3, col);
      for(let xx = Math.max(b.x, api.camX - 20); xx < Math.min(b.to, api.camX + api.bw / api.Z + 20); xx += 12) B(WX(xx), WY(h), 4, 1, col);
      B(WX(b.to) - 3, WY(h) - 3, 6, 6, rung ? '#f5dfae' : C.iron1);
    }
  }
  for(const w of A.waves){
    const x = WX(w.x), y = WY(0), k = 1 - w.t / .45;
    B(x - 6, y - 5, 12, 5, `rgba(200,180,150,${.7 * k})`); B(x - 3, y - 9, 6, 4, `rgba(230,210,170,${.5 * k})`);
  }
  for(const q of A.tolls){
    const r = 6 + q.t * 40, al = (1 - q.t / 1.2) * .7, x = WX(q.x), y = WY(q.y);
    ctx.strokeStyle = `rgba(216,162,74,${al})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x + .5, y + .5, r, 0, Math.PI * 2); ctx.stroke();
  }
}

function drawRoadSweep(api, s, A){
  const { B, WX, WY, ctx } = api, left = WX(s.x - s.reach), right = WX(s.x + s.reach);
  if(right < -20 || left > api.bw + 20) return;
  const beat = root.BladefallFracturedOutskirts.roadSweepState(s, A.t), x = WX(s.x), floor = WY(s.y);
  // A chain winch on the ruined road's masonry, with a winding ratchet.
  B(x - 13, floor - 116, 26, 116, '#29232f'); B(x - 13, floor - 116, 2, 116, '#403644');
  for(let yy = floor - 102; yy < floor; yy += 14) B(x - 11, yy, 23, 1, '#18141f');
  B(x - 6, floor - 95, 12, 10, C.iron1); B(x - 4, floor - 93, 8, 6, beat.warning ? C.ember : C.iron2);
  const end = beat.active ? left + (right - left) * (beat.t - L().ROAD_TELL) / L().ROAD_ACTIVE : left + (right - left) * (beat.warning ? beat.progress : 0);
  ctx.strokeStyle = beat.active ? '#f0c78b' : beat.warning ? '#b58e64' : '#534757'; ctx.lineWidth = beat.active ? 2 : 1;
  ctx.beginPath(); ctx.moveTo(x, floor - 85); ctx.lineTo(end, floor - (beat.active ? 12 : 55)); ctx.stroke();
  B(end - 4, floor - (beat.active ? 16 : 59), 8, 8, beat.warning || beat.active ? C.bronze2 : C.iron2);
  if(beat.active){
    for(let xx = left; xx < right; xx += 6){ B(xx, WY(s.y + 20), 4, 2, '#e6b77a'); B(xx + 1, WY(s.y + 20) - 1, 2, 4, C.bronze1); }
  }
  if(beat.warning || beat.active){
    const y = WY(s.y + 40);
    ctx.fillStyle = beat.active ? 'rgba(255,170,90,.2)' : 'rgba(255,170,90,.06)'; ctx.fillRect(left, y, right - left, floor - y);
    for(let xx = left; xx < right; xx += 8) B(xx, floor - 1, beat.active ? 8 : 4, 1, beat.active ? '#f5dfae' : C.ember);
  }
}

/* ── The Mile Sentinel ────────────────────────────────────────────────────────
   Iron on iron, a great hammer, a helm with one slit. Every move shows itself before it comes:
   the hammer lifted and its head going from dull to orange (it tracks you, then goes still — it
   has committed); a foot scraped twice and the slit flaring (the rush); the chains whirling. */
function enemy(api, e){
  if(e.actFoe === 'sentinel'){ if(e.st !== 'caged') sentinelFigure(api, e, api.WX(e.x), api.WY(e.y), {}); return true; }
  return false;
}
function sentinelFigure(api, e, x, y, o){
  const { B, ctx } = api, t = api.time, f = e.face || -1, A = st(api);
  if(e.st === 'stunned' && e.stunStone){
    // Its back is a real 130-high ledge: draw at that world height, not the old
    // crouching sprite's much lower shoulders (which hid an invisible platform).
    const top = api.WY(130), left = api.WX(e.x - 28), right = api.WX(e.x + 28);
    B(left + 3, top + 3, right - left - 6, y - top - 16, C.iron1);
    B(left + 3, top + 5, 3, y - top - 22, C.iron2);
    for(let yy = top + 12; yy < y - 18; yy += 10){ B(left + 6, yy, right - left - 10, 2, C.iron0); B(x - 4, yy - 2, 8, 2, C.rust); }
    B(left - 3, y - 16, 13, 16, C.iron0); B(right - 10, y - 16, 13, 16, C.iron0);
    B(x + e.rushDir * 16 - 6, top + 14, 14, 17, C.iron2); B(x + e.rushDir * 16 - 3, top + 22, 8, 2, C.emberDim);
    foothold(api, e.x, 130, 56, Math.max(0, 1 - e.t / e.stunFor));
    for(let i = 0; i < 3; i++) B(x - 9 + i * 8, top - 8 - (i % 2) * 3, 2, 2, '#f5dfae');
    return;
  }
  const kneel = e.st === 'bound' || e.st === 'bound-final' || e.st === 'stunned' || o.caged;
  const h = kneel ? 50 : 82, lean = e.st === 'rush' ? f * 6 : e.st === 'rush-tell' ? f * 3 : 0;
  // Legs, body, pauldrons.
  if(!kneel){ B(x - 12, y - 18, 9, 18, C.iron0); B(x + 3, y - 18, 9, 18, C.iron0); }
  else { B(x - 16, y - 8, 30, 8, C.iron0); }
  for(let r = 0; r < h - 18; r++){ const w = 17 - Math.round(Math.abs(r - (h - 18) * .7) * .12); B(x - w + Math.round(lean * r / h), y - 18 - r - (kneel ? -10 : 0), w * 2, 1, r % 8 === 0 ? C.iron0 : C.iron1); }
  const top = y - h - (kneel ? -10 : 0), hx = x + lean;
  B(hx - 22, top + 8, 12, 8, C.iron2); B(hx + 10, top + 8, 12, 8, C.iron2);                     // pauldrons
  for(let k = 0; k < 5; k++) B(hx - 8 + k * 4, top + 22 + (k % 2), 3, 2, C.rust);                 // rust at the belly plates
  // The helm, and its slit. The slit flares for the rush.
  B(hx - 8, top - 6, 16, 16, C.iron1); B(hx - 8, top - 6, 16, 2, C.iron2);
  const flare = e.st === 'rush-tell' ? .6 + .4 * Math.sin(t * 30) : e.st === 'rush' ? 1 : .35;
  B(hx - 5 + (f > 0 ? 2 : 0), top, 8, 2, `rgba(255,150,70,${flare})`); api.glow(hx + f * 2, top + 1, 8 + flare * 8, '255,140,60', .25 * flare);
  // The rush's tell: a foot scraped twice.
  if(e.st === 'rush-tell' && Math.floor(e.t * 5) % 2 === 0) for(let k = 0; k < 4; k++) B(x - f * (14 + k * 4), y - 1 - (k % 2), 2, 1, '#c9bda0');
  if(e.st === 'rush-tell'){
    const stone = L().SENTINEL_STONES.filter(s => (s.x - e.x) * e.rushDir > 0).sort((a,b) => Math.abs(a.x-e.x)-Math.abs(b.x-e.x))[0];
    const end = api.WX(stone ? stone.x - e.rushDir * stone.w / 2 : e.rushDir > 0 ? L().YARD.x2 : L().YARD.x1);
    for(let xx = Math.min(x, end); xx < Math.max(x, end); xx += 9) B(xx, api.WY(3), 5, 1, C.ember);
    if(stone){ B(end - 2, api.WY(62), 4, 28, '#f5dfae'); api.glow(end, api.WY(35), 18, '255,170,90', .3); }
  }
  // The hammer.
  const hammerHeadCol = e.st === 'hf-tell' ? lerpCol(e.t / Math.max(.01, holdT(A, e))) : C.iron2;
  if(e.st === 'hf-tell'){
    B(hx + f * 4, top - 50, 3, 52, '#6b4a2e');                                                    // lifted high
    B(hx + f * 4 - 10, top - 64, 22, 14, hammerHeadCol);
    if(e.t / holdT(A, e) > .55) api.glow(hx + f * 4, top - 57, 20, '255,150,70', .6);             // committed
    const tx = api.WX(e.target || e.x); ctx.strokeStyle = `rgba(255,150,70,${e.t / holdT(A, e) > .55 ? .7 : .25})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(tx, api.WY(0) - 1, L().S.hfHalf * api.Z, 3, 0, 0, Math.PI * 2); ctx.stroke();
    if(e.t / holdT(A, e) >= L().S.hfLock){
      B(tx - L().S.hfHalf * api.Z, api.WY(0) - 2, L().S.hfHalf * api.Z * 2, 2, C.ember);
    }
  } else if(e.st === 'hf-stuck' || e.st === 'recover' && e.hitX != null){
    const hxw = api.WX(e.hitX); B(hxw - 12, api.WY(0) - 12, 24, 12, C.iron2);                      // head in the ground
    // The grip is drawn by its actual platform at y=64; the arm reaches it.
    ctx.strokeStyle = C.iron2; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx + f * 14, top + 17); ctx.lineTo(hxw, api.WY(64) + 5); ctx.stroke();
  } else if(!o.caged){
    B(hx + f * 18, top + 10, 3, 48, '#6b4a2e'); B(hx + f * 18 - 9, top + 50, 21, 12, C.iron2);   // carried low
  }
  // The chains: bound to its collar once a bell has rung; whirled for the sweep.
  const bells = A ? A.rung : 0;
  if(e.swept && e.st === 'hf-stuck'){
    const k = Math.min(1, (e.sweepT || 0) / .6);
    ctx.strokeStyle = `rgba(150,150,165,${.4 + .5 * k})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, api.WY(20), L().S.sweepReach * api.Z, 10, 0, 0, Math.PI * 2); ctx.stroke();
    if(!e.sweepHit) for(let xx = x - L().S.sweepReach * api.Z; xx < x + L().S.sweepReach * api.Z; xx += 9) B(xx, api.WY(0) - 1, 5, 1, C.ember);
  }
  for(let i = 0; i < bells; i++){ for(let k = 0; k < 7; k++) B(hx - 6 + i * 6 + (k % 2), top + 16 + k * 4, 2, 2, C.iron2); }
  if(e.st === 'bound' || e.st === 'bound-final'){ ctx.strokeStyle = 'rgba(150,150,165,.8)'; ctx.lineWidth = 1; for(const d of [-1, 1]){ ctx.beginPath(); ctx.moveTo(hx, top + 14); ctx.lineTo(hx + d * 90, api.WY(0)); ctx.stroke(); } }
  if(e.st === 'stunned') for(let k = 0; k < 3; k++){ const a = t * 4 + k * 2.1; B(Math.round(hx + Math.cos(a) * 12), Math.round(top - 14 + Math.sin(a) * 3), 2, 2, '#e8d8a0'); }
}
function holdT(A, e){ const L2 = L(); const ph = A ? Math.min(2, A.rung) : 0; return L2 ? L2.S.hfTell[ph] : 1; }
function lerpCol(k){ const q = Math.max(0, Math.min(1, k)); const r = Math.round(90 + q * 165), g = Math.round(90 + q * 60), b = Math.round(102 - q * 40); return `rgb(${r},${g},${b})`; }

/* ── Overlay ──────────────────────────────────────────────────────────────── */
function overlay(api){
  const A = st(api) || {}, { ctx, bw, bh } = api, reduced = !!(api.env && api.env.reducedMotion);
  // The night presses in at the edges.
  const g = ctx.createRadialGradient(bw / 2, bh / 2, bh * .35, bw / 2, bh / 2, bh * .85);
  g.addColorStop(0, 'rgba(8,6,16,0)'); g.addColorStop(1, 'rgba(8,6,16,.5)'); ctx.fillStyle = g; ctx.fillRect(0, 0, bw, bh);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ ctx.fillStyle = `rgba(216,162,74,${(reduced ? .05 : .18) * flash})`; ctx.fillRect(0, 0, bw, bh); }
}

ART.register(21, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
