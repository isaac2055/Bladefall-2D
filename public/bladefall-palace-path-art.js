/* Bladefall — ACT TWO · the Path to the Palace's art (2026-09-24).

   Sunrise on the mountain, and the light hurts. The road is pale limestone that throws the
   glare back up; the palace stands over everything, white marble and gold; the Sunspire's
   mirrors are the brightest things on the screen and their light is a burn, not a signal
   (hotter, whiter than the Colony's glasses). Far down in the chasm the sea, and the beast
   you let go, circling. Only the King's things are gold; only the flower is white. */
(function installPalacePathArt(root){
'use strict';
const ART = root.BladefallActTwoArt;
if(!ART || !ART.register) return;
const S = ART.shared;
const { flower, belledFigure, sunguardFigure, kneeling, drawFallen, CAST } = S;

const C = {
  sky:['#7fa9c6', '#aac7d6', '#e6dcc0', '#f7e7bd'],
  stone:'#d7cdb5', stoneLit:'#efe6d0', stoneShade:'#b9ae96', stoneDark:'#9d927c', stoneDeep:'#857a66',
  marble:'#ece6d8', marbleShade:'#cfc7b5', gold0:'#7d6228', gold1:'#b8923c', gold2:'#d8b25a', gold3:'#f3d67a',
  wood0:'#3b332a', wood1:'#5a4e3f', wood2:'#7a6c58', wood3:'#9a8b74', canvas:'#d6c9a4', canvasShade:'#b3a47f',
  sea0:'#3f5f6c', sea1:'#56788a', sea2:'#7797a4', mist:'230,232,228', iron:'#4a3c33', ironLit:'#8f7a66',
  hydra:'#2d5a55', hydraLit:'#4f9a8c', smoke:'120,112,102',
};
const K = () => root.BladefallPalacePath && root.BladefallPalacePath.constants;
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 19 ? A : null; }

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

/* ── Backdrop: sunrise, the palace over everything, the sea far below ─────── */
const cache = {};
function skyLayer(api){
  const key = 'sky' + api.bw + 'x' + api.bh;
  return cache[key] || (cache[key] = api.layer(api.bw, api.bh, g => {
    const gr = g.createLinearGradient(0, 0, 0, api.bh);
    [0, .4, .72, .9].forEach((s, i) => gr.addColorStop(s, C.sky[i]));
    g.fillStyle = gr; g.fillRect(0, 0, api.bw, api.bh);
  }));
}
function farX(api, wx, par){ return Math.round(api.bw / 2 + (wx - (api.camX + api.bw / (2 * api.Z))) * api.Z * par); }
function backdrop(api){
  const { ctx, B, bw, bh } = api, t = api.time, A = st(api) || {};
  ctx.drawImage(skyLayer(api), 0, 0);
  const horizon = Math.round(api.groundBy - 60 + api.camYb * .2);
  // The sea, far down to the west, the way you came.
  const sg = ctx.createLinearGradient(0, horizon, 0, bh); sg.addColorStop(0, C.sea2); sg.addColorStop(1, C.sea0);
  ctx.fillStyle = sg; ctx.fillRect(0, horizon, bw, bh - horizon); B(0, horizon, bw, 1, '#e8eef0');
  // The mountain, rising east, and the palace on it.
  for(let x = 0; x < bw; x += 2){
    const wx = (x - bw / 2) / (api.Z * .1) + api.camX + bw / (2 * api.Z);
    const h = Math.round(Math.min(260, Math.max(0, (wx - 2000) * .03)) + 20 + Math.sin(wx * .002) * 12);
    B(x, horizon - h, 2, h + 60, '#b5b4a8');
  }
  const px = farX(api, 12000, .03);
  if(px > -120 && px < bw + 120){
    // Seat the distant palace on the same ridge silhouette rather than floating above it.
    const wx = (px-bw/2)/(api.Z*.1)+api.camX+bw/(2*api.Z);
    const ridge = horizon-Math.round(Math.min(260,Math.max(0,(wx-2000)*.03))+20+Math.sin(wx*.002)*12);
    for(let x=px-51;x<px+51;x++){
      const rx=(x-bw/2)/(api.Z*.1)+api.camX+bw/(2*api.Z);
      const oldRidge=horizon-Math.round(Math.min(260,Math.max(0,(rx-2000)*.03))+20+Math.sin(rx*.002)*12);
      B(x,ridge+4,1,Math.max(0,oldRidge-ridge+12),'#b5b4a8');
    }
    const P=(x,y,w,h,c)=>B(px+Math.round(x*.65),ridge+Math.round(y*.65),Math.max(1,Math.round(w*.65)),Math.max(1,Math.round(h*.65)),c);
    P(-68,-5,136,10,C.marbleShade); P(-60,-76,120,72,C.marbleShade); P(-60,-76,120,3,C.marble);
    for(let i=0;i<5;i++){P(-52+i*24,-69,6,63,C.marble);P(-44+i*24,-61,7,42,'#b5ad99');}
    P(-64,-81,128,6,C.gold1); P(-21,-124,42,43,C.marble); P(-25,-128,50,5,C.gold2);
    for(let r=0;r<18;r++){const w=Math.round(Math.sqrt(324-r*r)*1.4);P(-w,-128-r,w*2,1,r>12?C.gold3:C.gold2);}
    P(-1,-164,2,21,C.gold2);
    // Terraced foundations follow the mountain down instead of ending in open sky.
    P(-72,4,144,5,C.stoneShade); P(-78,9,156,5,C.stoneDark);
  }
  // The sun is high over the palace now, and hard to look at.
  const sx = Math.round(bw * .66), sy = Math.round(40 + api.camYb * .02);
  api.glow(sx, sy, 150, '255,244,214', .38); api.glow(sx, sy, 40, '255,252,240', .7);
  for(let dy = -8; dy <= 8; dy++){ const hw = Math.round(Math.sqrt(72 - dy * dy)); B(sx - hw, sy + dy, hw * 2 + 1, 1, '#fffbef'); }
  // The colony's smoke, standing up from below.
  ctx.fillStyle = `rgba(${C.smoke},.06)`;
  for(let k = 0; k < 4; k++){ const x = farX(api, -1400 + k * 500, .4); if(x < -40 || x > bw + 40) continue;
    for(let j = 0; j < 9; j++){ ctx.beginPath(); ctx.arc(x + Math.sin(t * .4 + j + k) * (2 + j), horizon + 30 - j * 12, 4 + j * 1.6, 0, Math.PI * 2); ctx.fill(); } }
}

/* ── Platforms: pale road, the stair, the gilt apron ──────────────────────── */
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))), left:api.WX(o.x - o.w / 2) };
}
function plat(api, o){
  if(o.gone) return true;
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  if(o.actArt !== 'road' && o.actArt !== 'stair' && o.actArt !== 'apron') return false;
  B(s.x0, s.y, s.w, s.floor - s.y, C.stone);
  const base = Math.floor(api.camX * api.Z);
  for(let x = s.x0; x < s.x1; x += 2){
    const k = (x + base) * .02, d = Math.round(24 + Math.sin(k) * 5);
    B(x, s.y + d, 2, Math.max(0, s.floor - s.y - d), C.stoneShade);
    if(s.floor > s.y + d + 30) B(x, s.y + d + 30, 2, s.floor - s.y - d - 30, C.stoneDark);
    if(api.hash((x + base) >> 1, 9) > .92) B(x, s.y + 3, 2, 1, C.stoneDeep);
  }
  B(s.x0, s.y, s.w, 2, C.stoneLit);
  if(o.actArt === 'apron'){ B(s.x0, s.y + 2, s.w, 1, C.gold2); for(let x = s.x0 - (base % 16); x < s.x1; x += 16) if(x > s.x0) B(x, s.y + 3, 1, 6, C.stoneShade); }
  // The step's riser, dressed stone.
  if(o.actArt === 'stair' && s.left > -8 && s.left < api.bw + 8){ for(let y = s.y; y < Math.min(s.floor, s.y + 60); y += 6) B(s.left, y, 5, 1, C.stoneDeep); B(s.left, s.y, 2, 60, C.stoneLit); }
  return true;
}

/* ── Objects ──────────────────────────────────────────────────────────────── */
function object(api, o){
  switch(o.type){
    case 'wall':
      if(o.actArt === 'face') return true;
      if(o.actArt === 'bars'){ drawPortcullis(api, o); return true; }
      return false;
    case 'actShelter': drawShelter(api, o); return true;
    case 'actVent': drawVent(api, o); return true;
    case 'actMirror': drawMirror(api, o); return true;
    case 'actOverlook': drawChasm(api, o); return true;
    case 'actMast': drawMast(api, o); return true;
    case 'actRing': if(!o.gone) S.drawRing(api, o); return true;
    case 'actSunGate': drawSunGate(api, o); return true;
    case 'actWindlass': drawWindlass(api, o); return true;
    case 'actAnchor': drawAnchor(api, o); return true;
  }
  return false;
}
function drawShelter(api, o){
  const { B, WX, WY } = api, x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), base = WY(o.y), top = WY(o.y + 90), w = x1 - x0;
  // Shade under it first, then posts and a pilgrims' roof of weathered boards and canvas.
  api.ctx.fillStyle = 'rgba(60,50,40,.18)'; api.ctx.fillRect(x0 + 2, top + 4, w - 4, base - top - 4);
  B(x0 + 2, top, 3, base - top, C.wood1); B(x1 - 5, top, 3, base - top, C.wood1);
  for(let i = 0; i < w + 10; i++){ const x = x0 - 5 + i, k = Math.abs(i - (w + 10) / 2) / ((w + 10) / 2); B(x, top - Math.round((1 - k) * 8), 1, 4, i % 7 ? C.wood2 : C.wood3); }
  B(x0 - 3, top + 3, w + 6, 3, C.canvas); B(x0 - 3, top + 6, w + 6, 1, C.canvasShade);
  flower(api, x1 - 4, base - 10, 1);
}
function drawVent(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y);
  B(x - 8, y - 2, 16, 2, '#6b6152'); B(x - 4, y - 3, 8, 1, '#4a4238'); api.glow(x, y - 4, 10, '180,150,110', .15);
}
/* A SUNSPIRE MIRROR: a gilt disc on a stone pillar, angled down the road. */
function drawMirror(api, o){
  const { B, WX, WY } = api, A = st(api), x = WX(o.x), base = WY(o.y), top = WY(o.y + o.h - 30);
  B(x - 8, top, 16, base - top, C.stone); B(x - 8, top, 3, base - top, C.stoneLit); for(let y = top + 10; y < base; y += 14) B(x - 8, y, 16, 1, C.stoneShade);
  const m = A && A.mirrors.find(q => 'mirror-' + q.id === o.actId);
  const ang = m ? Math.atan2(WY(m.gy) - (top - 20), WX(m.gx) - x) : 1.2;
  B(x - 12, top - 4, 24, 5, C.gold1);
  const cx = x, cy = top - 20;
  for(let r = 0; r < 14; r++) for(let a = 0; a < 24; a++){ const aa = a / 24 * Math.PI * 2; if(r < 12) continue; B(Math.round(cx + Math.cos(aa) * r), Math.round(cy + Math.sin(aa) * r * .8), 1, 1, C.gold2); }
  api.ctx.fillStyle = m && m.shut ? C.iron : '#fff8e0'; api.ctx.beginPath(); api.ctx.ellipse(cx, cy, 11, 9, ang, 0, Math.PI * 2); api.ctx.fill();
  if(m && m.shut){
    for(let y=-6;y<=6;y+=4) B(cx-8,cy+y,16,2,C.gold0);
    if(m.warning){ B(cx-10,cy-1,20,2,C.gold3); api.glow(cx,cy,24,'255,210,140',.4); }
  } else api.glow(cx, cy, 34, '255,246,210', .6);
}
function drawChasm(api, o){
  const { B, WX, WY, bw, bh, ctx } = api, L = K(); if(!L) return;
  const x0 = WX(L.CHASM.x1), x1 = WX(L.CHASM.x2), lip = WY(770), t = api.time;
  const a = Math.max(-2, x0), b = Math.min(bw + 2, x1); if(b <= a) return;
  // Looking down: the cliff falling away into mist, and the sea at the bottom of it.
  const g = ctx.createLinearGradient(0, lip, 0, bh); g.addColorStop(0, `rgba(${C.mist},.35)`); g.addColorStop(.5, C.sea1); g.addColorStop(1, C.sea0);
  ctx.fillStyle = g; ctx.fillRect(a, lip, b - a, bh - lip);
  const sea = bh - 34;
  for(let x = a; x < b; x += 3) if(api.hash(x >> 2, Math.floor(t * 2)) > .7) B(x, sea + ((x * 7) % 20), 3, 1, '#a9c1c8');
  // THE BEAST, circling far below. Three necks out of the water; it does not look up.
  const cx = WX((L.CHASM.x1+L.CHASM.x2)/2 + Math.sin(t*.25)*250), dir = Math.cos(t * .25) > 0 ? 1 : -1;
  B(Math.round(cx - 30), sea + 4, 60, 8, C.hydra); B(Math.round(cx - 26), sea + 3, 52, 2, C.hydraLit);
  for(let n = 0; n < 3; n++){ const nx = cx + (n - 1) * 16 + dir * 10, h = 14 + n * 3 + Math.round(Math.sin(t * 1.3 + n) * 2);
    for(let i = 0; i < h; i++) B(Math.round(nx + Math.sin(i * .2 + t + n) * 2), sea + 4 - i, 3, 1, C.hydra);
    B(Math.round(nx + dir * 2 - 2), sea + 1 - h, 6, 3, C.hydraLit); }
  // The broken ends of the road.
  B(Math.max(-2, x0 - 6), lip, 8, 30, C.stoneShade); B(Math.min(bw, x1 - 2), lip, 8, 30, C.stoneShade);
}
function drawMast(api, o){
  const { B, WX, WY } = api, x = WX(o.x), top = WY(o.y + o.h) + 6, bottom = api.bh + 2;
  B(x - 2, top, 5, bottom - top, C.wood1); B(x - 2, top, 1, bottom - top, C.wood3);
  B(x - 10, top + 10, 21, 2, C.wood2); B(x - 10, top + 12, 1, 5, C.iron); B(x + 10, top + 12, 1, 5, C.iron);
}
function drawSunGate(api, o){
  const { B, WX, WY } = api, x = WX(o.x), base = WY(o.y), top = WY(o.y + o.h), A = st(api), L = K();
  for(const side of [-1, 1]){ const tx = x + side * 40 - 14; B(tx, top, 28, base - top, C.marble); B(tx, top, 4, base - top, '#fffaf0'); for(let y = top + 16; y < base; y += 18) B(tx, y, 28, 1, C.marbleShade); B(tx - 3, top - 8, 34, 8, C.gold1); }
  B(x - 54, top + 30, 108, 14, C.marble); B(x - 54, top + 30, 108, 2, C.gold2);
  // The sun over the gate.
  B(x - 12, top + 4, 24, 24, C.gold1); B(x - 8, top + 8, 16, 16, C.gold3); api.glow(x, top + 16, 30, '255,230,150', .45);
  // The counterweight visibly falls as the windlass raises the bars.
  const progress=A && A.gateOpen ? 1 : A ? Math.max(A.gateLift/3,A.anchors.filter(Boolean).length/2) : 0;
  const weightY=top+52+Math.round((base-top-96)*progress);
  B(x+62,top+42,1,weightY-top-42,C.ironLit); B(x+55,weightY,15,24,C.stoneDark);
  B(x+55,weightY,15,2,C.gold1); B(x+57,weightY+2,2,20,C.stoneShade);
  // The chains it hangs on, from the anchors to the lintel — broken when Oren has been at them.
  if(L) L.ANCHORS.forEach((ax, i) => {
    const broke = A && A.anchors[i], x0 = WX(ax), y0 = base - 6, x1 = x - 26 + i * 12, y1 = top + 44;
    if(broke){ for(let k = 0; k < 8; k++) B(x0, y0 - k * 2, 1, 1, C.ironLit); return; }
    for(let k = 0; k <= 30; k++){ const q = k / 30; B(Math.round(x0 + (x1 - x0) * q), Math.round(y0 + (y1 - y0) * q), 1, 1, k % 3 ? C.iron : C.ironLit); }
  });
}
function drawPortcullis(api, o){
  const { B, WX, WY } = api, x = WX(o.x), floor = WY(o.y - o.h), top = WY(o.y - 60);
  const lift = o.gone ? 1 : (o.lift || 0), tip = Math.round(floor - (floor - top) * lift);
  if(tip <= top + 2) return;
  for(let i = -4; i <= 4; i++){ const bx = x + i * 5; B(bx, top, 2, tip - top, C.gold1); B(bx, top, 1, tip - top, C.gold3); B(bx - 1, tip - 3, 4, 3, C.gold0); }
  for(let yy = top + 30; yy < tip - 10; yy += 40) B(x - 21, yy, 44, 2, C.gold1);
}
function drawWindlass(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y), A = st(api), lift = A ? A.gateLift : 0;
  B(x - 14, y - 26, 4, 26, C.wood1); B(x + 10, y - 26, 4, 26, C.wood1);
  const ang = lift * 2.1 - (A ? Math.max(0,A.windlassT)*2 : 0);
  for(let s = 0; s < 6; s++){ const a = ang + s / 6 * Math.PI * 2; for(let r = 0; r < 12; r++) B(Math.round(x + Math.cos(a) * r), Math.round(y - 20 + Math.sin(a) * r), 1, 1, C.wood2); }
  B(x - 3, y - 23, 6, 6, C.gold1);
  // Same split gold cap as the wreck windlass and Colony tap.
  B(x-12,y-32,10,3,C.gold3); B(x+2,y-32,10,3,C.gold3);
  if(A && !A.gateOpen) for(let i=0;i<3;i++){ const dy=(api.time*12+i*7)%21; B(x-1,y-56+dy,2,2,C.gold2); }
  for(let k = 0; k < 3; k++) B(x - 16 + k * 3, y - 34, 2, 2, k < lift ? C.gold3 : C.stoneDeep);          // three notches
}
function drawAnchor(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y);
  B(x - 6, y - 5, 12, 5, C.iron); B(x - 6, y - 5, 12, 1, C.ironLit);
  const A=st(api), broken=A && A.anchors[Number(o.actId.split('-')[1])];
  if(broken){ B(x+4,y-3,5,2,C.ironLit); return; }
  for(let a = 0; a < 10; a++){ const aa = a / 10 * Math.PI * 2; B(Math.round(x + Math.cos(aa) * 3), Math.round(y - 9 + Math.sin(aa) * 3), 1, 1, C.ironLit); }
}

/* ── World: smoke, the burning light, the canopy carriers, Oren ─────── */
function world(api){
  const A = st(api); if(!A) return;
  drawSmoke(api, A);
  for(const m of A.mirrors) drawLight(api, A, m);
  for(const f of A.fallen) drawFallen(api, f);
  for(const a of A.allies) drawAlly(api, A, a);
  if(A.oren && A.oren.st !== 'absent' && root.BladefallPalacePath.groundAt(A.oren.x) != null) S.orenFigure(api, A.oren);
  for(const q of A.tolls){
    const r = 6 + q.t * (q.far ? 26 : 40), al = (1 - q.t / 1.2) * (q.far ? .35 : .6), x = api.WX(q.x), y = api.WY(q.y);
    api.ctx.strokeStyle = `rgba(243,214,122,${al})`; api.ctx.lineWidth = 1; api.ctx.beginPath(); api.ctx.arc(x + .5, y + .5, r, 0, Math.PI * 2); api.ctx.stroke();
  }
}
function drawSmoke(api, A){
  const { ctx, WX, WY } = api;
  for(const s of A.smoke){ if(s.d <= .01) continue; const x = WX(s.x), y = WY(s.y), r = s.r * api.Z;
    for(let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2 + s.t * .2; ctx.fillStyle = `rgba(${C.smoke},${.15 * s.d})`; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * .35, y + Math.sin(a) * r * .25, r * .6, 0, Math.PI * 2); ctx.fill(); } }
}
/* The mirrors' light: whiter and hotter than the Colony's glasses — it burns. */
function drawLight(api, A, m){
  const { ctx, WX, WY } = api, L = K(), pool = L ? L.POOL : 50;
  const mx = WX(m.x), my = WY(m.my), gx = WX(m.gx), gy = WY(m.gy), half = pool * api.Z;
  if(m.shut){
    if(m.warning){ api.B(gx-half,gy-1,half*2,1,C.gold2); api.glow(gx,gy,half+4,'255,210,140',.18); }
    return;
  }
  const g = ctx.createLinearGradient(mx, my, gx, gy); g.addColorStop(0, 'rgba(255,252,236,.42)'); g.addColorStop(1, 'rgba(255,214,150,.3)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(mx - 2, my); ctx.lineTo(gx - half, gy); ctx.lineTo(gx + half, gy); ctx.lineTo(mx + 2, my); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,236,190,.6)'; ctx.beginPath(); ctx.ellipse(gx, gy, half, 3, 0, 0, Math.PI * 2); ctx.fill();
  api.glow(gx, gy - 4, half + 10, '255,210,140', .45);

}
function drawAlly(api, A, a){
  const { B, WX, WY } = api, x = WX(a.x), y = WY(a.y), f = a.face || 1, w = Math.abs(a.vx) > 20 ? Math.round(Math.sin(api.time * 10 + a.i) * 2) : 0;
  B(x - 3 + w, y - 9, 2, 9, CAST.band0); B(x + 1 - w, y - 9, 2, 9, CAST.band0);
  B(x - 4, y - 19, 9, 11, a.i % 2 ? '#7a6a62' : CAST.tunic);
  S.bandagedHead(api, x, y - 27, f, false);
  if(a.st === 'cover'){
    B(x-42,y-38,84,4,C.canvas); B(x-42,y-34,84,1,C.canvasShade);
    B(x-38,y-33,2,25,C.wood2); B(x+36,y-33,2,25,C.wood2);
    B(x-14,y-37,9,3,C.canvasShade); B(x+20,y-37,6,3,C.canvasShade);
  } else if(a.st === 'grab'){ B(x + f * 4, y - 18, 6, 2, CAST.band1); B(x + f * 4, y - 14, 5, 2, CAST.band1); }
  else { B(x + f * 5, y - 12, 3, 3, '#9aa0a3'); B(x - f * 6, y - 30, 1, 22, C.wood2); B(x - f * 6 - 5, y - 32, 11, 2, C.canvas); }   // cup; a canvas pole
}

/* ── Enemies ──────────────────────────────────────────────────────────────── */
function enemy(api, e){
  if(e.type === 'belled'){
    const x = api.WX(e.x), y = api.WY(e.y);
    if(e.st === 'sit'){ kneeling(api, x, y, e.face, 'belled'); return true; }
    api.drawAwareness(e); belledFigure(api, x, y, e); return true;
  }
  if(e.type === 'sunguard'){
    if(e.hitFlash > 0) api.glow(api.WX(e.x), api.WY(e.y) - 18, 14, '255,255,255', .4);
    sunguardFigure(api, api.WX(e.x), api.WY(e.y), { face:e.shieldFace, bellSwing:0, silenced:true, walking:e.walking, t:api.time, wind:e.st === 'wind', swing:e.st === 'swing' });
    if(e.counterStunT > 0) api.glow(api.WX(e.x), api.WY(e.y) - 30, 10, '233,226,207', .5);
    return true;
  }
  return false;
}

/* ── Overlay: the glare, and the burn ─────────────────────────────────────── */
function overlay(api){
  const A = st(api) || {}, { ctx, bw, bh } = api, reduced = !!(api.env && api.env.reducedMotion);
  // Painful light: the higher the road, the whiter the top of the world.
  const gl = (A.glare || 0) * (reduced ? .5 : 1);
  if(gl > .02){ const g = ctx.createLinearGradient(0, 0, 0, bh * .6); g.addColorStop(0, `rgba(255,248,226,${.34 * gl})`); g.addColorStop(1, 'rgba(255,248,226,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, bw, bh * .6); }
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ ctx.fillStyle = `rgba(255,236,190,${(reduced ? .06 : .22) * flash})`; ctx.fillRect(0, 0, bw, bh); }
}

ART.register(19, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
