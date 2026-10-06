/* Bladefall — ACT TWO · Sunspire Palace's art (2026-09-24).

   White marble and gold, in full sun, too bright to look at. The palace is wet: the colony's
   water runs over every fountain rim and down the steps, and the gardens are green in a dry
   country. Only the King's things are gold; only the flower is white — and here the flower is
   on the King. Slate is the one dark stone in the house: where the light can be caught.
   The sun's shafts are hot white; routed light is narrow teal with moving highlights. */
(function installSunspireArt(root){
'use strict';
const ART = root.BladefallActTwoArt;
if(!ART || !ART.register) return;
const S = ART.shared;
const { flower, belledFigure, kneeling, drawFallen, CAST } = S;

const C = {
  marble:'#ece6d8', marbleLit:'#fbf7ec', marbleShade:'#cfc7b5', marbleDark:'#a8a08c', vein:'#d9d1bf',
  gold0:'#7d6228', gold1:'#b8923c', gold2:'#d8b25a', gold3:'#f3d67a', goldLit:'#fff1b8',
  slate:'#4b5663', slateLit:'#6f7d8c', slateDark:'#2f3740', rune:'#bfe6ff',
  water0:'#3f7f95', water1:'#5fa3b8', water2:'#9ed2df', foam:'#e8f6f8',
  leaf0:'#3e6b3a', leaf1:'#5d8f4a', leaf2:'#8fbf6a', bloom:'#f4f1e6',
  sea0:'#3f5f6c', sea1:'#56788a', sea2:'#7797a4', hydra:'#2d5a55', hydraLit:'#4f9a8c', hydraDark:'#1d3c39', belly:'#b8c9a0',
  robe:'#efe7d2', robeShade:'#cdbf9e', robeDark:'#9f927a', skin:'#e3d3bb', skinShade:'#bfae93', iron:'#4a3c33', ironLit:'#8f7a66',
  cloak:'#2f4d8f', cloakLit:'#4a76c8', cloakDark:'#1d2f5c', hood:'#1b2340', scarf:'#ff7f5c', eye:'#9ff4ff',
};
const HOUR_SKY = [
  ['#9cc3dc', '#c9d9df', '#f3dfbe', '#ffe6bd'],      // dawn: still warm at the bottom
  ['#8fc0e0', '#c4dce8', '#f1ead6', '#fff6dc'],      // morning
  ['#b8d8ec', '#e2eef2', '#fbf8ee', '#ffffff'],      // noon: nearly white
];
const L = () => root.BladefallSunspire && root.BladefallSunspire.constants;
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 20 ? A : null; }
function hourOf(A){ return A && A.enc && A.enc.throne.st !== 'idle' ? A.hour || 0 : A && A.enc && A.enc.throne.st === 'done' ? 2 : 1; }

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

/* ── Backdrop: the sky over the top of the world, the mountain falling away ── */
const cache = {};
function skyLayer(api, h){
  const key = 'sky' + h + ':' + api.bw + 'x' + api.bh;
  return cache[key] || (cache[key] = api.layer(api.bw, api.bh, g => {
    const gr = g.createLinearGradient(0, 0, 0, api.bh);
    [0, .4, .72, .92].forEach((s, i) => gr.addColorStop(s, HOUR_SKY[h][i]));
    g.fillStyle = gr; g.fillRect(0, 0, api.bw, api.bh);
  }));
}
function farX(api, wx, par){ return Math.round(api.bw / 2 + (wx - (api.camX + api.bw / (2 * api.Z))) * api.Z * par); }
function backdrop(api){
  const { ctx, B, bw, bh } = api, t = api.time, A = st(api) || {}, K = L(), hour = hourOf(A);
  ctx.drawImage(skyLayer(api, hour), 0, 0);
  const horizon = Math.round(api.groundBy + 40 + api.camYb * .2);
  // Far below and far away: the sea, and the mountain you climbed.
  const sg = ctx.createLinearGradient(0, horizon, 0, bh); sg.addColorStop(0, C.sea2); sg.addColorStop(1, C.sea0);
  ctx.fillStyle = sg; ctx.fillRect(0, horizon, bw, bh - horizon); B(0, horizon, bw, 1, '#eef4f4');
  for(let x = 0; x < bw; x += 2){
    const wx = (x - bw / 2) / (api.Z * .12) + api.camX + bw / (2 * api.Z);
    const h = Math.round(Math.max(0, 140 - Math.abs(wx - 6000) * .02) + 16 + Math.sin(wx * .003) * 8);
    B(x, horizon - h, 2, h + 4, '#c9c7bb');
  }
  // The colony, a smudge of tents and smoke far down the western slope.
  const cx = farX(api, -2400, .12);
  if(cx > -80 && cx < bw + 80){
    for(let i = 0; i < 9; i++) B(cx - 30 + i * 7, horizon - 6 - (i % 3), 5, 3, i % 2 ? '#b3a47f' : '#9a8f76');
    ctx.fillStyle = 'rgba(120,112,102,.08)'; for(let j = 0; j < 7; j++){ ctx.beginPath(); ctx.arc(cx + Math.sin(t * .3 + j) * 3, horizon - 14 - j * 7, 3 + j, 0, Math.PI * 2); ctx.fill(); }
  }
  // THE KING'S CONDUIT: a line of arches down the mountain, from the Crown to the tents. Once the
  // sluice is open the water runs down it, home.
  const kx = farX(api, 7700, .12);
  if(kx > cx - 20){
    const y0 = horizon - 150, y1 = horizon - 8;
    for(let x = Math.max(cx, -4); x < Math.min(kx, bw + 4); x += 2){
      const q = (x - cx) / Math.max(1, kx - cx), y = Math.round(y1 + (y0 - y1) * q);
      B(x, y, 2, 2, '#b9b19c'); if(((x - cx) >> 1) % 6 === 0) B(x, y + 2, 1, Math.max(2, Math.round((y1 - y) * .15)), '#a9a08c');
      if(A.drained && A.drainT > 0.5 && api.hash(x >> 1, Math.floor(t * 8 + q * 30)) > .8) B(x, y - 1, 2, 1, C.water2);
    }
  }
  // The sun, over everything.
  const sx = Math.round(bw * (.72 - hour * .08)), sy = Math.round(46 - hour * 14 + api.camYb * .02);
  api.glow(sx, sy, 170, '255,246,220', .4 + hour * .06); api.glow(sx, sy, 44, '255,253,244', .75);
  for(let dy = -9; dy <= 9; dy++){ const hw = Math.round(Math.sqrt(81 - dy * dy)); B(sx - hw, sy + dy, hw * 2 + 1, 1, '#fffcf2'); }
  if(!K) return;
  // Inside the palace: the Hall of Hours and the Throne of Noon have walls and windows.
  interior(api, 3000, K.HOUR_DOOR_X, 660, hour, [3560, 4200]);
  interior(api, K.THRONE_DOOR_X, K.SEA_DOOR_X, 700, hour, [9230, 9420, 9560, 9700, 9870, 10000, 10050, 10180, 10250, 10360, 10500, 10640]);
  // The Sun Court: green in a dry country, on the colony's water; the colonnade over the seal.
  gardens(api, A);
  colonnade(api, 2200, 2660, 400);
  brokenGate(api);
}
function gardens(api, A){
  const { B, WX, WY } = api, floor = WY(0), t = api.time;
  for(let wx = 260; wx < 2600; wx += 230){
    const x = WX(wx); if(x < -40 || x > api.bw + 40) continue;
    if((wx / 230 | 0) % 2){
      // A cypress, clipped, taller than a man.
      for(let r = 0; r < 60; r++){ const w = Math.round(Math.sin(r / 60 * Math.PI) * 9) + 1; B(x - w, floor - 8 - r, w * 2, 1, r % 7 ? C.leaf0 : C.leaf1); }
      B(x - 6, floor - 8, 12, 8, C.gold1);
    } else {
      // A raised bed, overgrown, its runnel wet.
      B(x - 26, floor - 10, 52, 10, C.marble); B(x - 26, floor - 10, 52, 2, C.gold2);
      for(let k = 0; k < 13; k++){ const hh = 6 + ((k * 7) % 9); B(x - 24 + k * 4, floor - 10 - hh, 3, hh, k % 3 ? C.leaf1 : C.leaf2); if(k % 4 === 1) B(x - 24 + k * 4, floor - 12 - hh, 3, 2, k % 8 === 1 ? '#e8a33d' : '#d85a4a'); }
      if(!(A && A.drained)) for(let k = 0; k < 20; k++) B(x - 40 + k * 4, floor - 1, 2, 1, (k + Math.floor(t * 10)) % 5 ? C.water1 : C.foam);
    }
  }
}
function brokenGate(api){
  const { B, WX, WY } = api, x = WX(-20), floor = WY(0), top = WY(520); if(x < -80 || x > api.bw + 80) return;
  // The Sun Gate you came in by, its bars still down in the road where Oren or the windlass left them.
  B(x - 20, top, 26, floor - top, C.marble); B(x - 20, top, 4, floor - top, C.marbleLit); B(x - 24, top - 8, 34, 8, C.gold1);
  for(let i = 0; i < 8; i++) B(x + 10 + i * 6, floor - 3 - (i % 3), 5, 2, C.gold1);
  B(x + 8, floor - 6, 52, 2, C.gold0);
}
function interior(api, x1, x2, top, hour, windows){
  const { B, WX, WY, bw, ctx } = api, a = Math.max(-2, WX(x1)), b = Math.min(bw + 2, WX(x2)); if(b <= a) return;
  const floor = WY(0), roof = WY(top);
  B(a, Math.max(0, roof - 20), b - a, floor - Math.max(0, roof - 20), C.marbleShade);
  for(let x = WX(x1) + 20; x < WX(x2); x += 44) if(x > a - 12 && x < b + 12){ B(x, roof, 10, floor - roof, C.marble); B(x, roof, 2, floor - roof, C.marbleLit); B(x - 2, roof, 14, 4, C.gold1); B(x - 2, floor - 6, 14, 6, C.marbleDark); }
  B(a, roof - 20, b - a, 20, C.marble); B(a, roof - 2, b - a, 2, C.gold2); B(a, roof - 20, b - a, 2, C.marbleLit);
  // The windows the sun comes in by: tall, bright, some of them throwing a shaft.
  for(const wx of windows){
    const x = WX(wx); if(x < a - 20 || x > b + 20) continue;
    const y = WY(620);
    B(x - 7, y - 4, 14, 44, C.gold1); ctx.fillStyle = `rgba(255,252,238,${.85 + hour * .05})`; ctx.fillRect(x - 5, y - 2, 10, 40);
    api.glow(x, y + 18, 26, '255,248,226', .35 + hour * .1);
  }
}
function colonnade(api, x1, x2, h){
  const { B, WX, WY } = api, a = WX(x1), b = WX(x2), floor = WY(0), roof = WY(h);
  if(b < -10 || a > api.bw + 10) return;
  api.ctx.fillStyle = 'rgba(90,80,60,.12)'; api.ctx.fillRect(a, roof, b - a, floor - roof);
  for(let x = a + 6; x < b; x += 36){ B(x, roof, 8, floor - roof, C.marble); B(x, roof, 2, floor - roof, C.marbleLit); B(x - 2, floor - 5, 12, 5, C.marbleDark); }
  B(a - 6, roof - 12, b - a + 12, 12, C.marble); B(a - 6, roof - 1, b - a + 12, 2, C.gold2); B(a - 6, roof - 12, b - a + 12, 2, C.marbleLit);
}

/* ── Platforms: marble floor with gold inlay; slate; the flume's bed ───────── */
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function plat(api, o){
  if(o.gone) return true;
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const A = st(api);
  if(o.actArt === 'floor'){
    B(s.x0, s.y, s.w, s.floor - s.y, C.marbleShade);
    B(s.x0, s.y, s.w, 10, C.marble); B(s.x0, s.y, s.w, 2, C.marbleLit);
    const base = Math.floor(api.camX * api.Z);
    for(let x = s.x0 - ((s.x0 + base) % 24); x < s.x1; x += 24) if(x >= s.x0){ B(x, s.y + 2, 1, 8, C.vein); B(x + 12, s.y + 4, 1, 1, C.gold2); }
    B(s.x0, s.y + 10, s.w, 1, C.gold1);
    for(let x = s.x0; x < s.x1; x += 2) if(api.hash((x + base) >> 1, 13) > .9) B(x, s.y + 14 + ((x * 3) % 20), 2, 1, C.marbleDark);
    return true;
  }
  if(o.actArt === 'slab'){
    // SLATE: the one dark stone in the house, veined, rune-cut — a mouth holds here.
    const lit = A && A.beams.some(b => b.segs.some(g => Math.abs(g.x2 - o.x) < o.w / 2 + 4 && Math.abs(g.y2 - o.y) < 6));
    B(s.x0, s.y, s.w, 10, C.slate); B(s.x0, s.y, s.w, 2, C.slateLit); B(s.x0, s.y + 9, s.w, 1, C.slateDark);
    for(let x = s.x0 + 4; x < s.x1 - 4; x += 9) B(x, s.y + 4, 4, 1, C.rune);
    if(lit) api.glow((s.x0 + s.x1) / 2, s.y, s.w * .7, '255,236,190', .5);
    return true;
  }
  if(o.actArt === 'flume-bed'){
    const lip = api.WY(0);
    B(s.x0, lip, s.w, s.y - lip, '#c4baa4'); for(let y = lip + 8; y < s.y; y += 10) B(s.x0, y, s.w, 1, '#b1a78f');
    B(s.x0, s.y, s.w, s.floor - s.y, '#9d927c'); B(s.x0, s.y, s.w, 2, '#b9ae96');
    for(let x = s.x0; x < s.x1; x += 10) B(x, s.y + 3, 6, 1, '#857a66');
    if(A && (!A.drained || A.drainT < 4)) B(s.x0, s.y, s.w, 2, C.water1);     // still wet
    return true;
  }
  return false;
}

/* ── Objects ──────────────────────────────────────────────────────────────── */
function object(api, o){
  switch(o.type){
    case 'wall':
      if(o.actArt === 'bars'){ drawBars(api, o); return true; }
      if(o.actArt === 'arch' || o.actArt === 'door-frame'){ drawArch(api, o); return true; }
      if(o.actArt === 'panel'){ drawPanel(api, o); return true; }
      if(o.actArt === 'flume-wall'){ const { B, WX, WY } = api; B(WX(o.x) - 6, WY(o.y), 13, WY(o.y - o.h) - WY(o.y), C.marbleDark); B(WX(o.x) - 6, WY(o.y), 13, 2, C.marble); return true; }
      if(o.actArt === 'balustrade'){ drawBalustrade(api, o); return true; }
      return false;
    case 'actRing': if(!o.gone) S.drawRing(api, o); return true;
    case 'actSeal': drawSeal(api, o); return true;
    case 'actShaftSource': drawSource(api, o); return true;
    case 'actFountain': drawFountain(api, o); return true;
    case 'actServant': drawServant(api, o); return true;
    case 'actThrone': drawThrone(api, o); return true;
    case 'actSeaMirror': drawLateMirror(api, o); return true;
    case 'actCistern': drawCistern(api, o); return true;
    case 'actHydraHead': return true;
  }
  return false;
}
function wallRect(api, o){ const x0 = api.WX(o.x - o.w / 2), x1 = api.WX(o.x + o.w / 2); return { x0, x1, w:x1 - x0, top:api.WY(o.y), base:api.WY(o.y - o.h) }; }
function drawArch(api, o){
  const { B } = api, r = wallRect(api, o); if(r.x1 < -4 || r.x0 > api.bw + 4) return;
  B(r.x0, r.top, r.w, r.base - r.top, C.marble); B(r.x0, r.top, 3, r.base - r.top, C.marbleLit); B(r.x1 - 3, r.top, 3, r.base - r.top, C.marbleShade);
  for(let y = r.top + 12; y < r.base; y += 14) B(r.x0, y, r.w, 1, C.vein);
  if(o.y - o.h > 1){ B(r.x0 - 2, r.base - 4, r.w + 4, 4, C.gold1); B(r.x0 - 2, r.base - 4, r.w + 4, 1, C.gold3); }   // the lintel over a doorway
}
function drawPanel(api, o){
  const { B } = api, r = wallRect(api, o); if(r.x1 < -4 || r.x0 > api.bw + 4) return;
  B(r.x0, r.top, r.w, r.base - r.top, C.slate); B(r.x0, r.top, r.w, 2, C.slateLit); B(r.x0, r.base - 2, r.w, 2, C.slateDark);
  const fx = o.face > 0 ? r.x1 - 3 : r.x0 + 1;
  for(let y = r.top + 6; y < r.base - 4; y += 10) B(fx, y, 2, 5, C.rune);
  B(r.x0 - 1, r.top - 2, r.w + 2, 2, C.gold2); B(r.x0 - 1, r.base, r.w + 2, 2, C.gold2);
}
function drawBars(api, o){
  const { B, WX, WY } = api, x = WX(o.x), floor = WY(o.y - o.h), top = WY(o.y);
  const k = o.gone ? Math.max(0, (o.moveT || 0) / 0.5) : 1, tip = Math.round(top + (floor - top) * k);
  if(tip <= top + 1) return;
  for(let i = -3; i <= 3; i++){ const bx = x + i * 5; B(bx, top, 2, tip - top, C.gold1); B(bx, top, 1, tip - top, C.gold3); B(bx - 1, tip - 3, 4, 3, C.gold0); }
  for(let yy = top + 16; yy < tip - 6; yy += 34) B(x - 16, yy, 34, 2, C.gold1);
}
function drawBalustrade(api, o){
  const { B, WX, WY } = api, x = WX(o.x), base = WY(0);
  B(x - 60, base - 22, 64, 4, C.marble); B(x - 60, base - 22, 64, 1, C.marbleLit);
  for(let i = 0; i < 6; i++) B(x - 56 + i * 11, base - 18, 5, 18, C.marbleShade);
}
/* A SUN-SEAL: the King's gold disc. Dark until the sun is put on it. The Hour Door's is a dial,
   and it reads a quarter to four. */
function drawSeal(api, o){
  const { B, WX, WY, ctx } = api, A = st(api), x = WX(o.x), y = WY(o.y), r = Math.round(o.w / 2 * api.Z);
  if(x < -r - 20 || x > api.bw + r + 20) return;
  const open = A && A.seals[o.seal], lit = Math.min(1, A ? (A.lit[o.seal] || 0) / .8 : 0), glow = open ? 1 : lit;
  if(lit>0 && !open){
    ctx.strokeStyle='#80c9ce';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r+6,-Math.PI/2,-Math.PI/2+Math.PI*2*lit);ctx.stroke();
  }
  if(o.seal === 'court'){ for(let k = 0; k < 10; k++) B(x, WY(400) + k * Math.round((y - r - WY(400)) / 10), 1, 2, C.iron); }
  if(o.seal === 'hour'){
    // The dial on the Hour Door.
    ctx.fillStyle = C.marble; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.gold1; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r - 1, 0, Math.PI * 2); ctx.stroke();
    for(let i = 0; i < 12; i++){ const a = i / 12 * Math.PI * 2 - Math.PI / 2; B(Math.round(x + Math.cos(a) * (r - 6)) - 1, Math.round(y + Math.sin(a) * (r - 6)) - 1, i % 3 ? 2 : 3, i % 3 ? 2 : 3, C.gold0); }
    B(x - 1, y - r + 8, 3, r - 8, C.gold1);                                  // the gnomon
    const a = (3.75 / 12) * Math.PI * 2 - Math.PI / 2;                        // a quarter to four
    ctx.strokeStyle = `rgba(90,70,40,${.35 + glow * .4})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * (r - 10), y + Math.sin(a) * (r - 10)); ctx.stroke();
    if(glow > .02) api.glow(x, y, r + 20, '255,244,200', .55 * glow);
    return;
  }
  ctx.fillStyle = glow > .5 ? C.gold3 : C.gold1; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = glow > .5 ? C.goldLit : C.gold2; ctx.beginPath(); ctx.arc(x, y, r * .6, 0, Math.PI * 2); ctx.fill();
  for(let i = 0; i < 12; i++){ const a = i / 12 * Math.PI * 2; B(Math.round(x + Math.cos(a) * (r + 3)), Math.round(y + Math.sin(a) * (r + 3)), 2, 2, glow > .5 ? C.goldLit : C.gold0); }
  if(glow > .02) api.glow(x, y, r + 24, '255,240,190', .6 * glow);
  if(o.seal === 'sluice'){ ctx.strokeStyle = C.iron; ctx.lineWidth = 2; for(let i = 0; i < 4; i++){ const a = i / 4 * Math.PI + (A && A.drained ? A.drainT : 0); ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * r * .5, y - Math.sin(a) * r * .5); ctx.lineTo(x + Math.cos(a) * r * .5, y + Math.sin(a) * r * .5); ctx.stroke(); } }
}
function drawSource(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y);
  if(o.shaft === 'court' || o.shaft === 'crown'){
    // A King's mirror on a stone column: gilt, bright, angled at the ground.
    const base = WY(o.shaft === 'crown' ? 560 : 0);
    B(x - 6, y + 10, 12, base - y - 10, C.marble); B(x - 6, y + 10, 2, base - y - 10, C.marbleLit);
    B(x - 12, y + 6, 24, 5, C.gold1);
    api.ctx.fillStyle = '#fff8e0'; api.ctx.beginPath(); api.ctx.ellipse(x, y, 12, 9, .7, 0, Math.PI * 2); api.ctx.fill();
    api.glow(x, y, 36, '255,246,210', .6);
  }
}
/* The fountains run over with the colony's water — until it goes home. */
function drawFountain(api, o){
  const { B, WX, WY, ctx } = api, A = st(api), x = WX(o.x), base = WY(0), t = api.time; if(x < -80 || x > api.bw + 80) return;
  const full = !(A && A.drained);
  B(x - 30, base - 16, 60, 16, C.marble); B(x - 30, base - 16, 60, 2, C.gold2); B(x - 32, base - 18, 64, 3, C.marbleLit);
  B(x - 4, base - 44, 8, 28, C.marble); B(x - 14, base - 46, 28, 4, C.gold1);
  B(x - 28, base - 14, 56, 3, full ? C.water1 : C.water0);
  if(full){
    for(let i = 0; i < 6; i++){ const a = -1.3 + i * .52; ctx.strokeStyle = 'rgba(158,210,223,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, base - 46); ctx.quadraticCurveTo(x + Math.cos(a) * 14, base - 60, x + Math.cos(a) * 26, base - 16); ctx.stroke(); }
    // Over the rim, down the steps, across the marble.
    for(const s of [-1, 1]) for(let k = 0; k < 16; k++){ const yy = base - 16 + k; B(x + s * (31 + (k >> 2)), yy, 2, 1, (k + Math.floor(t * 12)) % 4 ? C.water1 : C.foam); }
    B(x - 60, base - 1, 120, 1, C.water2);
    for(let k = 0; k < 5; k++) flower(api, x - 40 + k * 20, base - 4, 1);
  }
  for(let k = 0; k < 4; k++){ B(x - 44 + k * 26, base - 8, 6, 8, C.leaf1); B(x - 43 + k * 26, base - 11, 4, 3, C.leaf2); }
}
/* A SERVANT IN A GOLD MASK, sick under it. */
function drawServant(api, o){
  if(root.BladefallResidentArt && root.BladefallResidentArt.draw(api, o)) return;   // her own body: bladefall-resident-art.js
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y); if(x < -30 || x > api.bw + 30) return;
  if(o.kneel){ B(x - 6, y - 10, 13, 10, '#e2d8c4'); B(x - 3, y - 18, 8, 8, C.gold2); B(x + 5, y - 6, 6, 2, C.gold1); flower(api, x - 4, y - 14, 1); return; }
  B(x - 5, y - 26, 11, 26, '#e2d8c4'); B(x - 5, y - 26, 11, 2, '#f0e8d8'); B(x - 5, y - 4, 11, 4, '#c9bda5');
  B(x - 4, y - 36, 9, 10, CAST.band0); B(x - 4, y - 35, 9, 7, C.gold2); B(x - 2, y - 33, 2, 1, C.gold0); B(x + 2, y - 33, 2, 1, C.gold0);   // the gold mask over the bandage
  flower(api, x + 4, y - 36, 1);
  B(x + 6, y - 16, 5, 2, '#c9bda5'); B(x + 10, y - 16, 2, 6, C.gold1);                     // a cloth, the gold she polishes
}
function drawThrone(api, o){
  const { B, WX, WY } = api, x = WX(o.x), base = WY(0), A = st(api); if(x < -80 || x > api.bw + 80) return;
  B(x - 40, base - 10, 80, 10, C.marble); B(x - 34, base - 18, 68, 8, C.marbleLit);          // the dais steps
  B(x - 22, base - 110, 44, 92, C.gold1); B(x - 18, base - 104, 36, 60, C.gold2); B(x - 22, base - 110, 44, 3, C.gold3);
  for(let r = 0; r < 14; r++){ const w = Math.round(Math.sqrt(196 - r * r) * 1.8); B(x - w, base - 110 - r, w * 2, 1, r > 9 ? C.gold3 : C.gold2); }
  B(x - 26, base - 50, 8, 32, C.gold0); B(x + 18, base - 50, 8, 32, C.gold0);               // the arms
  if(A && A.king && A.king.st === 'yield') for(let k = 0; k < 6; k++) flower(api, x - 20 + k * 8, base - 20 - (k % 2) * 6, 1);
}
/* The great mirror behind the throne. What stands in front of it is shown a beat late. */
function drawLateMirror(api, o){
  const { B, WX, WY, ctx } = api, A = st(api), x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = WY(o.y + o.h / 2), bot = WY(o.y - o.h / 2);
  if(x1 < -10 || x0 > api.bw + 10) return;
  B(x0 - 3, top - 3, x1 - x0 + 6, bot - top + 6, C.gold1);
  const g = ctx.createLinearGradient(0, top, 0, bot); g.addColorStop(0, '#f6f3ea'); g.addColorStop(1, '#d9dcd8');
  ctx.fillStyle = g; ctx.fillRect(x0, top, x1 - x0, bot - top);
  const tr = A && A.trail && A.trail[0];
  if(tr){
    const rx = WX(tr.x), ry = WY(tr.y + 260 - 10);
    if(rx > x0 + 6 && rx < x1 - 6){ ctx.save(); ctx.beginPath(); ctx.rect(x0, top, x1 - x0, bot - top); ctx.clip(); api.alphaWrap(.55, () => knight(api, rx, ry, tr.face, true)); ctx.restore(); }
  }
  for(let y = top + 6; y < bot; y += 22) B(x0 + 3, y, 2, 12, 'rgba(255,255,255,.6)');
}
function drawCistern(api, o){
  const { B, WX, WY, ctx } = api, K = L(), A = st(api); if(!K) return;
  const x0 = WX(K.TOWER_X - 60), x1 = WX(K.FLUME.x1), top = WY(560), base = WY(0), tx0 = WX(K.TOWER_X - 60), tx1 = WX(K.TOWER_X + 60);
  if(x1 < -20 || x0 > api.bw + 20) return;
  // The cistern: the King's crown of water, on the top of the world.
  B(tx1, top + 10, x1 - tx1, base - top - 10, C.marbleShade); B(tx1, top + 10, x1 - tx1, 3, C.marble);
  for(let y = top + 30; y < base; y += 22) B(tx1, y, x1 - tx1, 1, C.vein);
  for(let x = tx1 + 6; x < x1 - 6; x += 18){ B(x, top - 2, 8, 12, C.gold1); B(x + 2, top - 8, 4, 6, C.gold2); B(x + 3, top - 11, 2, 3, C.gold3); }   // its crown
  const full = !(A && A.drained);
  B(tx1, top + 4, x1 - tx1, 6, full ? C.water1 : C.water0); if(full) B(tx1, top + 4, x1 - tx1, 1, C.foam);
  // The sluice tower.
  B(tx0, top - 20, tx1 - tx0, base - top + 20, C.marble); B(tx0, top - 20, 3, base - top + 20, C.marbleLit);
  for(let y = top; y < base; y += 16) B(tx0, y, tx1 - tx0, 1, C.vein);
  B(tx0 - 4, top - 24, tx1 - tx0 + 8, 6, C.gold1);
  // The conduit comes in from the west, high; after the sluice it carries the water out again.
  B(-2, top - 40, Math.max(0, tx0 + 2), 8, '#cfc7b5');
  if(A && A.drained && A.drainT > .3){ for(let x = Math.max(-2, tx0 - 400); x < tx0; x += 3) if(api.hash(x >> 1, Math.floor(api.time * 10)) > .6) B(x, top - 40, 2, 2, C.water2); }
  else if(full) B(-2, top - 40, Math.max(0, tx0 + 2), 2, C.water1);
}

/* ── World: the light, the flume's water, the King's rings, the sick, Oren, the hydra ── */
function world(api){
  const A = st(api); if(!A) return;
  drawFlume(api, A);
  for(const b of A.beams) drawBeam(api, A, b);
  const K = A.king;
  if(K && K.st === 'charge'){
    const r=L().KING.flareR*api.Z, x=api.WX(K.x), y=api.WY(K.y+75);
    api.ctx.strokeStyle='rgba(219,114,55,.8)';api.ctx.lineWidth=2;api.ctx.beginPath();api.ctx.arc(x,y,r,0,Math.PI*2);api.ctx.stroke();
    api.B(api.WX(K.x-L().KING.flareR),api.WY(0)-2,r*2,2,'#d98a54');
  }
  if(K && K.st === 'ring'){
    const x = api.WX(K.ringX), y = api.WY(0), k = Math.min(1, K.t / .8);
    api.ctx.strokeStyle = `rgba(255,240,190,${.3 + .6 * k})`; api.ctx.lineWidth = 2;
    api.ctx.beginPath(); api.ctx.ellipse(x, y - 1, 26 + 10 * (1 - k), 5, 0, 0, Math.PI * 2); api.ctx.stroke();
    api.glow(x, y - 30, 40, '255,240,190', .3 * k);
  }
  for(const f of A.fallen) drawFallen(api, f);
  for(const a of A.allies) drawAlly(api, A, a);
  if(A.oren && A.oren.st !== 'absent'){ S.orenFigure(api, A.oren); if(A.oren.st === 'touch') touchHand(api, A.oren); }
  for(const q of A.tolls){
    const r = 6 + q.t * (q.far ? 26 : 40), al = (1 - q.t / 1.2) * (q.far ? .35 : .6), x = api.WX(q.x), y = api.WY(q.y);
    api.ctx.strokeStyle = `rgba(243,214,122,${al})`; api.ctx.lineWidth = 1; api.ctx.beginPath(); api.ctx.arc(x + .5, y + .5, r, 0, Math.PI * 2); api.ctx.stroke();
  }
  if(A.hydra && A.hydra.st !== 'below' && !A.ride) drawHydra(api, A);
}
function drawFlume(api, A){
  const K = L(); if(!K) return;
  const { B, WX, WY } = api, x0 = Math.max(-2, WX(K.FLUME.x1 + 13)), x1 = Math.min(api.bw + 2, WX(K.FLUME.x2 - 13)); if(x1 <= x0) return;
  const k = A.drained ? Math.max(0, 1 - A.drainT / 2.5) : 1; if(k <= 0) return;
  const bed = WY(K.FLUME.y), top = Math.round(bed + (WY(-10) - bed) * k);
  api.ctx.fillStyle = 'rgba(79,140,160,.78)'; api.ctx.fillRect(x0, top, x1 - x0, bed - top);
  const base = Math.floor(api.camX * api.Z), t = api.time;
  for(let x = x0; x < x1; x += 2) if(api.hash((x + base + Math.floor(t * 180)) >> 2, 5) > .78) B(x, top + 1 + ((x * 5) % Math.max(2, bed - top - 2)), 3, 1, C.foam);
  B(x0, top, x1 - x0, 1, C.water2);
}
/* THE SUN. Natural shafts are warm; routed light is narrow teal with moving highlights. */
function drawBeam(api, A, b){
  const { ctx, WX, WY } = api;
  b.segs.forEach((g, i) => {
    const x1 = WX(g.x1), y1 = WY(g.y1), x2 = WX(g.x2), y2 = WY(g.y2), w = i === 0 ? 11 : 6;
    ctx.save(); ctx.lineCap = 'butt';
    if(A.king && ['rise','climb'].includes(A.king.st) && b.id.match(/^(dawn|morning|noon)-/)) ctx.globalAlpha*=.35;
    // A shaft is soft and wide; light let out of a mouth has a dark teal edge, so it reads on marble.
    ctx.strokeStyle = i === 0 ? 'rgba(255,244,210,.34)' : 'rgba(65,160,180,.65)'; ctx.lineWidth = w + 6; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = i === 0 ? 'rgba(255,248,226,.55)' : 'rgba(203,255,252,.98)'; ctx.lineWidth = i === 0 ? w - 3 : 3; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    if(i>0){
      const length=Math.hypot(x2-x1,y2-y1);
      for(let d=(api.time*55)%30;d<length;d+=30){const q=d/Math.max(1,length);api.B(Math.round(x1+(x2-x1)*q),Math.round(y1+(y2-y1)*q)-1,3,2,'#f3fffb');}
    }
    ctx.restore();
    if(i === b.segs.length - 1){
      const h = b.hit && b.hit.kind;
      api.glow(x2, y2, h === 'seal' || h === 'king' ? 26 : 16, '255,236,190', h === 'knight' ? .7 : .45);
      if(h === 'solid' && Math.abs(g.dy) > .5){ ctx.fillStyle = 'rgba(255,236,190,.5)'; ctx.beginPath(); ctx.ellipse(x2, y2, 9, 2, 0, 0, Math.PI * 2); ctx.fill(); }
    }
  });
  if(A.heat > .05 && b.hit && b.hit.kind === 'knight'){ const p = api.G.p; api.glow(WX(p.x), WY(p.y + 22), 16, '255,200,130', .5 * Math.min(1, A.heat / .6)); }
}
function drawAlly(api, A, a){
  const { B, WX, WY } = api, x = WX(a.x), y = WY(a.y), f = a.face || 1, w = Math.abs(a.vx) > 20 ? Math.round(Math.sin(api.time * 10 + a.i) * 2) : 0;
  if(a.st === 'down'){ kneeling(api, x, y, f, 'belled'); return; }
  B(x - 3 + w, y - 9, 2, 9, CAST.band0); B(x + 1 - w, y - 9, 2, 9, CAST.band0);
  B(x - 4, y - 19, 9, 11, a.i % 2 ? '#7a6a62' : CAST.tunic);
  S.bandagedHead(api, x, y - 27, f, false);
  if(a.st === 'touch') touchHand(api, a);
  else B(x + f * 5, y - 12, 3, 3, '#9aa0a3');                               // the cup
}
/* A hand laid flat on the King's back — and a white flower opening under it. */
function touchHand(api, a){
  const { B, WX, WY } = api, x = WX(a.x), y = WY(a.y), f = a.face || 1;
  B(x + f * 4, y - 20, 12 * 1, 2, CAST.band1); B(x + f * 14, y - 22, 3, 4, CAST.band1);
  flower(api, x + f * 17, y - 26, 1);
  api.glow(x + f * 17, y - 24, 10, '244,241,230', .4);
}
function knight(api, x, y, f, ghost){
  const { B } = api;
  B(x - 4, y - 8, 3, 8, C.cloakDark); B(x + 1, y - 8, 3, 8, C.cloakDark);
  B(x - 6, y - 20, 12, 13, ghost ? '#8a94b0' : C.cloak); B(x - 6, y - 20, 3, 13, ghost ? '#aab2c8' : C.cloakLit);
  B(x - 5, y - 28, 10, 8, ghost ? '#50587a' : C.hood); B(x + (f > 0 ? 1 : -3), y - 25, 2, 1, ghost ? '#dfe6ff' : C.eye);
  B(x - 6 * f - (f > 0 ? 3 : 0), y - 21, 4, 2, ghost ? '#c7b3a8' : C.scarf);
}

/* ── The King in Daylight ─────────────────────────────────────────────────── */
function enemy(api, e){
  if(e.type === 'dayking'){ drawKing(api, e); return true; }
  if(e.type === 'belled'){
    const x = api.WX(e.x), y = api.WY(e.y);
    if(e.st === 'sit'){ kneeling(api, x, y, e.face, 'belled'); return true; }
    if(e._sunT > .1) api.glow(x, y - 20, 14, '255,210,140', .5);
    api.drawAwareness(e); belledFigure(api, x, y, e); return true;
  }
  return false;
}
function drawKing(api, K){
  const { B, WX, WY, ctx } = api, A = st(api), t = api.time;
  let x = WX(K.x), y = WY(K.y); const f = K.face || -1;
  if(K.st === 'throne'){ y -= 8; }
  const seated = K.st === 'throne' || K.st === 'yield';
  const fade = K.st === 'ring' ? Math.max(.25, 1 - K.t / .8) : 1;
  ctx.save(); ctx.globalAlpha *= fade;
  // THE RADIANCE: turned blades. Where something touches him it breaks, on that side.
  if(!seated){
    const glowA = K.st === 'charge' ? .35 + .5 * Math.min(1, K.t / .95) : .28;
    api.glow(x, y - 48, 70, '255,244,210', glowA);
    if(K.touchSide){ ctx.fillStyle = 'rgba(120,120,140,.12)'; ctx.fillRect(x + (K.touchSide > 0 ? 8 : -40), y - 96, 32, 90); }
    if(K.open){ ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y - 48, 50, K.touchSide > 0 ? Math.PI * .6 : -Math.PI * .4, K.touchSide > 0 ? Math.PI * 1.4 : Math.PI * .4); ctx.stroke(); }
  }
  const lean = K.st === 'stagger' ? -f * 3 : K.st === 'wind' ? -f * 2 : K.st === 'swing' ? f * 3 : 0, h = seated ? 58 : 72;
  // The robe: cloth of gold now, not the drowned violet, with a white mantle over the shoulders.
  // An ink line round all of it: in his own white hall he must still be the thing you see.
  const ink = '#3d2f18';
  for(let r = 0; r < h; r++){
    const w = Math.round(11 + (h - r) * .2), yy = y - r - 2, xx = x + Math.round(lean * r / h), mantle = r > h - 22;
    B(xx - w - 1, yy, w * 2 + 2, 1, ink);
    B(xx - w, yy, w * 2, 1, mantle ? (r % 6 === 0 ? C.robeShade : C.robe) : (r % 9 === 0 ? C.gold1 : C.gold2));
    B(xx - w, yy, 2, 1, mantle ? C.robeShade : C.gold1); B(xx + w - 2, yy, 2, 1, mantle ? C.robeDark : C.gold0);
  }
  B(x - 27, y - 3, 54, 2, C.gold0); B(x - 26, y - 5, 52, 2, C.gold3);          // the hem
  B(x + lean - 2, y - h + 20, 4, h - 26, C.robe);                               // the white stole down the gold
  const hx = x + lean, hy = y - h - 12;
  // The head: gaunt, pale, the flower at the temple. The beard of a man who has stopped caring for it.
  B(hx - 7, hy - 1, 14, 15, ink);
  B(hx - 6, hy, 12, 12, C.skin); B(hx - 6, hy + 8, 12, 5, C.skinShade); B(hx + f * 2, hy + 4, 2, 2, '#ff8a3a');
  flower(api, hx - f * 6, hy + 2, 1);
  // The crown: its teeth, gilt, too heavy.
  B(hx - 9, hy - 5, 18, 6, ink); B(hx - 8, hy - 4, 16, 4, C.gold2); for(let i = 0; i < 4; i++){ B(hx - 9 + i * 5, hy - 10, 4, 6, ink); B(hx - 8 + i * 5, hy - 9, 2, 5, C.gold3); }
  // The glove: gold on the hand that strikes. Off, when he yields — and the hand is flowers.
  const ax = hx + f * 12, ay = y - h + 8;
  if(K.st === 'yield'){ B(ax - 2, ay + 10, 6, 5, C.bloom); flower(api, ax, ay + 10, 1); flower(api, ax + 3, ay + 13, 1); }
  else if(K.st === 'wind'){ B(ax - f * 4, ay - 16, 6, 18, C.robe); B(ax - f * 4, ay - 22, 7, 7, C.gold2); api.glow(ax - f * 4, ay - 19, 14, '255,236,170', .6); }
  else if(K.st === 'climb' || K.st === 'rise'){
    // Both arms up to the sun.
    for(const s of [-1, 1]){ B(hx + s * 10 - 2, hy - 18, 5, 22, C.robe); B(hx + s * 10 - 3, hy - 24, 7, 7, s === f ? C.gold2 : C.skin); }
    api.glow(hx, hy - 24, 50, '255,246,210', .5 + .3 * Math.sin(t * 6));
  }
  else if(K.st === 'swing'){ B(ax+(f<0?-18:0), ay, 18, 5, C.robe); B(ax + f * 16, ay - 1, 7, 7, C.gold2); ctx.strokeStyle = 'rgba(255,236,170,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y - h + 6, 80, f > 0 ? -1.1 : Math.PI - .2, f > 0 ? .2 : Math.PI + 1.1); ctx.stroke(); }
  else { B(ax - 2, ay, 5, 18, C.robe); B(ax - 2, ay + 16, 6, 6, C.gold2); }
  // The flowers the fight has opened on him.
  for(const fl of K.flowers || []){ const fx = x + fl.side * (8 + (fl.h % 7)), fy = y - Math.round(fl.h / 2); flower(api, fx, fy, 1); }
  if(K.flowerT > 0) api.glow(x, y - 50, 40, '244,241,230', .4 * Math.min(1, K.flowerT));
  if(K.hitFlash > 0) api.glow(x, y - 48, 30, '191,230,255', .5);
  ctx.restore();
}

/* ── The hydra, at the terrace's edge ─────────────────────────────────────── */
function drawHydra(api, A){
  const { B, WX, WY, ctx } = api, K = L(), H = A.hydra, t = api.time; if(!K) return;
  const bx = WX(K.TERRACE.edge + 40), sea = WY(-300), floor = WY(0);
  const rise = H.st === 'rise' ? Math.min(1, H.t / 3) : 1;
  const eyes = ['#ff6a4a', '#8fd8ff', '#f3e27a'];
  // Three heads over the balustrade: the storm head high, the bite head low, the tide head in the
  // middle — lowered to the terrace when it has said what it came to say.
  const heads = [ { dx:-150, up:210 }, { dx:-70, up:170 }, { dx:40, up:250 } ];
  heads.forEach((hd, n) => {
    const low = (H.st === 'wait' || H.st === 'board') && n === 1;
    const top = Math.round(floor - (low ? 34 : hd.up) * rise - (1 - rise) * -120 + Math.sin(t * 1.1 + n * 2) * 3);
    const nx = bx - 30 + n * 28, hx = low ? WX(K.TERRACE.edge - 30) + 12 : bx + hd.dx;
    // The neck: a thick curve up out of the sea, lit along its back, pale along its throat.
    const N = Math.max(40, Math.ceil(Math.abs(top - sea) / 2));
    for(let i = 0; i <= N; i++){
      const q = i / N, cx = Math.round(nx + (hx - nx) * q * q), cy = Math.round(sea + (top - sea) * q), w = Math.round(17 - q * 5);
      B(cx - (w >> 1), cy, w, 3, i % 9 < 7 ? C.hydra : C.hydraDark); B(cx - (w >> 1), cy, 3, 3, C.hydraLit); B(cx + (w >> 1) - 3, cy, 3, 3, C.belly);
    }
    // The head: a long jaw, a heavy brow, the eye; the collar and its broken chain.
    const d = -1;
    B(hx - 18, top - 10, 36, 16, C.hydra); B(hx - 16, top - 13, 32, 3, C.hydra); B(hx - 16, top - 13, 32, 2, C.hydraLit);
    B(hx - 20, top - 16, 10, 5, C.hydraDark); B(hx + 8, top - 16, 10, 5, C.hydraDark);                    // the brow ridges
    B(hx + d * 24 - 8, top - 4, 18, 10, C.hydra); B(hx + d * 24 - 8, top - 4, 18, 2, C.hydraLit);
    B(hx + d * 24 - 8, top + 4, 18, 2, C.belly); for(let k = 0; k < 4; k++) B(hx + d * 24 - 6 + k * 4, top + 3, 1, 2, '#f4f1e6');   // the jaw, its teeth
    B(hx + d * 30 - 2, top - 2, 2, 2, C.hydraDark);                                                       // a nostril
    B(hx + d * 6 - 3, top - 7, 6, 4, eyes[n]); api.glow(hx + d * 6, top - 5, 12, '255,230,200', .5);
    B(hx - 20, top + 6, 38, 4, C.iron); B(hx - 20, top + 6, 38, 1, C.ironLit);
    for(let k = 0; k < 9; k++) B(hx + 8 + (k % 2) * 2, top + 11 + k * 4, 3, 3, k % 2 ? C.iron : C.ironLit);
  });
  // The sea boils where it holds itself up.
  ctx.fillStyle = 'rgba(232,246,248,.5)'; for(let i = 0; i < 12; i++){ ctx.beginPath(); ctx.ellipse(bx - 60 + i * 11, sea + 2 + Math.sin(t * 3 + i) * 2, 6, 2, 0, 0, Math.PI * 2); ctx.fill(); }
}

/* ── Overlay: the flash, the heat, and the ride ───────────────────────────── */
function overlay(api){
  const A = st(api) || {}, { ctx, bw, bh } = api, reduced = !!(api.env && api.env.reducedMotion);
  if(A.ride){ drawRide(api, A); return; }
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ ctx.fillStyle = `rgba(255,244,214,${(reduced ? .06 : .24) * flash})`; ctx.fillRect(0, 0, bw, bh); }
  if(A.heat > .05){ const k = Math.min(1, A.heat / .6); const g = ctx.createRadialGradient(bw / 2, bh / 2, bh * .3, bw / 2, bh / 2, bh * .75); g.addColorStop(0, 'rgba(255,200,130,0)'); g.addColorStop(1, `rgba(255,190,110,${.28 * k})`); ctx.fillStyle = g; ctx.fillRect(0, 0, bw, bh); }
}
/* THE RIDE. The hydra swims west with the knight at the root of its middle neck; the Sunspire
   shrinks behind, gold, on its mountain. */
function drawRide(api, A){
  const { ctx, B, bw, bh } = api, t = A.ride.t, T = api.time;
  const g = ctx.createLinearGradient(0, 0, 0, bh); g.addColorStop(0, '#8fc0e0'); g.addColorStop(.55, '#f1ead6'); g.addColorStop(.56, C.sea2); g.addColorStop(1, C.sea0);
  ctx.fillStyle = g; ctx.fillRect(0, 0, bw, bh);
  const horizon = Math.round(bh * .56);
  api.glow(Math.round(bw * .78), 50, 140, '255,246,220', .45);
  // Behind: the mountain and the palace, going away.
  const k = Math.max(.25, 1 - t / 14), mx = Math.round(bw * .82 + t * 6), mw = Math.round(220 * k), mh = Math.round(150 * k);
  for(let i = -mw; i <= mw; i++){ const hh = Math.round(mh * (1 - Math.abs(i) / mw)); B(mx + i, horizon - hh, 1, hh, '#c9c7bb'); }
  B(mx - Math.round(8 * k), horizon - mh - Math.round(18 * k), Math.max(2, Math.round(16 * k)), Math.round(18 * k), C.marble);
  api.glow(mx, horizon - mh - Math.round(14 * k), Math.round(30 * k), '255,236,170', .6);
  // The sea running past.
  for(let row = 0; row < 14; row++){
    const y = horizon + 4 + row * row * 1.3, sp = 20 + row * 14;
    for(let x = -40; x < bw + 40; x += 34 - row){ const xx = Math.round(((x + T * sp) % (bw + 80)) - 40); B(xx, Math.round(y), 6 + row, 1, row % 3 ? '#a9c1c8' : '#e8f6f8'); }
  }
  // The hydra, swimming west — a hill of a thing, most of it under the water — and the knight
  // sitting at the root of its middle neck.
  const bx = Math.round(bw * .44), by = Math.round(horizon + 70 + Math.sin(T * 1.4) * 3);
  for(let i = 0; i < 26; i++){ const wx = bx + 90 + i * 9, wy = by + 6 + Math.round(Math.sin(i * .7 + T * 3) * 2); B(wx, wy, 7 + (i % 3), 1, i % 2 ? '#e8f6f8' : '#a9c1c8'); B(wx + 3, wy - 3 - (i % 4), 4, 1, '#e8f6f8'); }   // its wake
  for(let r = 0; r < 26; r++){ const hw = Math.round(Math.sqrt(1 - Math.pow(r / 26, 2)) * 120); B(bx - hw, by - r, hw * 2, 1, r > 20 ? C.hydraLit : r % 6 ? C.hydra : C.hydraDark); }
  B(bx - 124, by, 248, 3, '#e8f6f8');                                               // the waterline
  const eyes = ['#ff6a4a', '#8fd8ff', '#f3e27a'];
  const heads = [ { r:-70, len:120, up:150 }, { r:-30, len:150, up:190 }, { r:10, len:130, up:165 } ];
  heads.forEach((hd, n) => {
    const root0 = bx + hd.r, sway = Math.sin(T * 1.3 + n * 1.7) * 6; let hx = root0, hy = by - 20;
    for(let i = 0; i <= 60; i++){ const q = i / 60; hx = Math.round(root0 - q * hd.len + sway * q); hy = Math.round(by - 20 - q * hd.up + q * q * 40); const w = Math.round(16 - q * 6); B(hx - (w >> 1), hy, w, 3, i % 9 < 7 ? C.hydra : C.hydraDark); B(hx - (w >> 1), hy, 3, 3, C.hydraLit); B(hx + (w >> 1) - 3, hy, 3, 3, C.belly); }
    B(hx - 22, hy - 8, 34, 14, C.hydra); B(hx - 22, hy - 8, 34, 2, C.hydraLit); B(hx - 30, hy - 2, 12, 8, C.hydra); B(hx - 30, hy + 5, 12, 2, C.belly);
    B(hx - 14, hy - 5, 4, 3, eyes[n]); api.glow(hx - 12, hy - 4, 8, '255,230,200', .4);
  });
  const kx = bx - 22, ky = by - 26;
  knight(api, kx, ky, -1, false);
  // The cloak streams back.
  for(let i = 0; i < 9; i++) B(kx + 5 + i * 2, ky - 18 + Math.round(Math.sin(T * 8 + i) * 2) + (i >> 2), 2, 3, i % 3 ? C.cloak : C.cloakLit);
  for(let i = 0; i < 5; i++) B(kx + 4 + i * 2, ky - 21 + Math.round(Math.sin(T * 9 + i) * 1), 2, 1, C.scarf);
  // White in, white out.
  const fade = t < 1.2 ? 1 - t / 1.2 : t > 11.5 ? Math.min(1, (t - 11.5) / 1.5) : 0;
  if(fade > 0){ ctx.fillStyle = `rgba(255,252,242,${fade})`; ctx.fillRect(0, 0, bw, bh); }
}

ART.register(20, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
