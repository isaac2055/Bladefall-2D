/* Bladefall — ACT TWO · the Colony's art (2026-09-24).

   Morning, through smoke. The shore's bleached palette warms by a step — packed earth,
   patched canvas, stone the colour of old bread — and the day's light comes in low and gold
   from the east, where the King's conduit climbs the mountain to the spire. The rules hold:
   only the King's things are gold (his glasses, his tap, his gates, the Sunguard), and only
   the flower is white. The sick are drawn with their cups. */
(function installColonyArt(root){
'use strict';
const ART = root.BladefallActTwoArt;
if(!ART || !ART.register) return;
const S = ART.shared;
const { flower, drawBell, belledFigure, sunguardFigure, kneeling, drawFallen, CAST } = S;

const C = {
  sky:['#6f7d88', '#98a2a2', '#c6b999', '#e3cb97'],
  earth:'#9a8c72', earthLit:'#c4b393', earthDark:'#7d7160', earthDeep:'#665c4e', pebble:'#b9ad94', path:'#a99a7d',
  stone0:'#6e6452', stone1:'#8a7f69', stone2:'#a99d84', stone3:'#c8bca2', stoneLit:'#ddd2b8',
  canvas0:'#857a60', canvas1:'#a99a78', canvas2:'#c9bb98', canvas3:'#ddd1b1', patch:'#9c6e52',
  wood0:'#3b332a', wood1:'#5a4e3f', wood2:'#7a6c58', wood3:'#9a8b74', woodLit:'#c2b397',
  smoke:'120,112,102', ember:'#e8a33d', flame:'#f3c46a', flameHot:'#fff0c8',
  gold0:'#7d6228', gold1:'#b8923c', gold2:'#d8b25a', gold3:'#f3d67a',
  water:'#9fb8bd', waterLit:'#dcebee', iron:'#4a3c33', ironLit:'#8f7a66',
  mountain:['#bdb6a5', '#aaa292', '#978f7e'], cup:'#9aa0a3',
};
const K = () => root.BladefallColony && root.BladefallColony.constants;
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 18 ? A : null; }

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

/* ── Backdrop: morning haze, the mountain, the spire, the conduit climbing to it ─ */
const cache = {};
function skyLayer(api){
  const key = 'sky' + api.bw + 'x' + api.bh;
  return cache[key] || (cache[key] = api.layer(api.bw, api.bh, g => {
    const gr = g.createLinearGradient(0, 0, 0, api.bh);
    [0, .38, .66, .86].forEach((s, i) => gr.addColorStop(s, C.sky[i]));
    g.fillStyle = gr; g.fillRect(0, 0, api.bw, api.bh);
  }));
}
function farX(api, wx, par){ return Math.round(api.bw / 2 + (wx - (api.camX + api.bw / (2 * api.Z))) * api.Z * par); }
function backdrop(api){
  const { ctx, B, bw, bh } = api, t = api.time, A = st(api) || {};
  ctx.drawImage(skyLayer(api), 0, 0);
  const horizon = Math.round(api.groundBy - 120 + api.camYb * .12);
  // The sun is up now, over the mountain, and it hurts a little to look at.
  const sx = Math.round(bw * .74), sy = Math.round(horizon - 190 + api.camYb * .05);
  api.glow(sx, sy, 110, '255,232,180', .3); api.glow(sx, sy, 30, '255,246,222', .55);
  for(let dy = -6; dy <= 6; dy++){ const hw = Math.round(Math.sqrt(42 - dy * dy)); B(sx - hw, sy + dy, hw * 2 + 1, 1, '#fbf0d6'); }
  // Three bands of hills, the last of them the mountain, rising east.
  for(let band = 0; band < 3; band++){
    const par = [.06, .12, .2][band], base = horizon + band * 10;
    for(let x = 0; x < bw; x += 2){
      const wx = (x - bw / 2) / (api.Z * par) + api.camX + bw / (2 * api.Z);
      const rise = band === 0 ? Math.min(120, Math.max(0, (wx - 4000) * .012)) : 0;
      const h = Math.round(18 + band * 6 + Math.sin(wx * .0011 + band) * 10 + Math.sin(wx * .0037 + band * 3) * 5 + rise);
      B(x, base - h, 2, h + 40, C.mountain[band]);
    }
  }
  // The palace on the mountain, and the conduit's arcade climbing to it.
  const px = farX(api, 16000, .06);
  if(px > -40 && px < bw + 40){
    const top = horizon - 150;
    B(px - 8, top + 30, 17, 36, '#d9cfb6'); B(px - 3, top, 7, 32, '#e7dcc0'); B(px - 1, top - 16, 3, 16, C.gold2); B(px, top - 22, 1, 6, C.gold3);
    api.glow(px, top - 10, 22, '243,214,122', .3);
    for(let i = 0; i < 60; i++){ const ax = px - 12 - i * 4, ay = top + 60 + i * 1.3; if(ax < -4) break; B(ax, Math.round(ay), 3, 2, '#b8ad95'); if(i % 3 === 0) B(ax + 1, Math.round(ay) + 2, 1, 6, '#a39880'); }
  }
  // The colony's smoke, standing up into still air.
  ctx.fillStyle = 'rgba(206,198,184,.06)';
  for(let k = 0; k < 7; k++){
    const x = farX(api, 1200 + k * 1500, .45); if(x < -60 || x > bw + 60) continue;
    for(let j = 0; j < 10; j++){ const r = 3 + j * 1.6, yy = horizon - 6 - j * 9, wob = Math.sin(t * .4 + j * .6 + k) * (2 + j * .8); ctx.beginPath(); ctx.arc(x + wob + j * 2, yy, r, 0, Math.PI * 2); ctx.fill(); }
  }
}

/* ── Platforms ────────────────────────────────────────────────────────────── */
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))), right:api.WX(o.x + o.w / 2) };
}
function earthBody(api, s, lit){
  const { B } = api; if(s.w <= 0) return;
  B(s.x0, s.y, s.w, s.floor - s.y, C.earth);
  const base = Math.floor(api.camX * api.Z);
  for(let x = s.x0; x < s.x1; x += 2){
    const k = (x + base) * .025, d = Math.round(30 + Math.sin(k) * 6 + Math.sin(k * 2.3) * 3);
    B(x, s.y + d, 2, Math.max(0, s.floor - s.y - d), C.earthDark);
    if(s.floor > s.y + d + 40) B(x, s.y + d + 40, 2, s.floor - s.y - d - 40, C.earthDeep);
    const n = api.hash((x + base) >> 1, 7);
    if(n > .9) B(x, s.y + 3 + ((n * 97) % 9 | 0), 2, 1, C.pebble);
  }
  B(s.x0, s.y, s.w, 2, lit || C.earthLit);
  for(let x = s.x0; x < s.x1; x += 3){ const n = api.hash((x + base) / 3 | 0, 13); if(n > .82) B(x, s.y - 1, 2, 1, n > .93 ? CAST.leafLit : CAST.leaf); }
}
function retainingWall(api, x, top, floor){
  // The step down to the next terrace: stacked stone, the colony's own work.
  const { B } = api;
  for(let y = top + 2, r = 0; y < Math.min(floor, api.bh); y += 6, r++){ B(x - 10, y, 10, 6, r % 2 ? C.stone1 : C.stone2); B(x - 10 + (r % 2 ? 5 : 2), y, 1, 6, C.stone0); B(x - 10, y, 10, 1, C.stone3); }
}
function plat(api, o){
  if(o.gone) return true;
  const { B } = api, s = span(api, o);
  switch(o.actArt){
    case 'yard-earth': case 'terrace': case 'basin':
      earthBody(api, s);
      if(o.actArt !== 'basin' && s.right > -12 && s.right < api.bw + 12) retainingWall(api, s.right, s.y, api.bh);
      return true;
    case 'conduit-deck': {
      // The walk along the top of the King's conduit: dressed slabs and the channel's lip.
      B(s.x0, s.y, s.w, 6, C.stone2); B(s.x0, s.y, s.w, 1, C.stoneLit); B(s.x0, s.y + 6, s.w, 2, C.stone0);
      const base = Math.floor(api.camX * api.Z);
      for(let x = s.x0 - ((base) % 14); x < s.x1; x += 14) if(x > s.x0) B(x, s.y + 1, 1, 5, C.stone1);
      B(s.x0, s.y - 5, s.w, 2, C.stone1); B(s.x0, s.y - 5, s.w, 1, C.stone3);                      // the channel's far lip
      return true;
    }
    case 'tower-top': B(s.x0, s.y, s.w, 3, C.wood2); B(s.x0, s.y, s.w, 1, C.woodLit); for(let x = s.x0 + 4; x < s.x1; x += 8) B(x, s.y + 1, 1, 2, C.wood0); return true;
  }
  return false;
}

/* ── Objects ──────────────────────────────────────────────────────────────── */
function object(api, o){
  switch(o.type){
    case 'wall':
      if(o.actArt === 'face') return true;
      if(o.actArt === 'bars'){ drawBars(api, o); return true; }
      return false;
    case 'actPalisade': drawInnerGate(api, o); return true;
    case 'actSick': if(!(root.BladefallResidentArt && root.BladefallResidentArt.draw(api, o))) drawSick(api, api.WX(o.x), api.WY(o.y), 1, 'woman', 0); return true;
    case 'actTent': drawTent(api, o); return true;
    case 'actFire': drawFire(api, o); return true;
    case 'actTower': drawTower(api, o); return true;
    case 'actAlmsBell': drawAlmsBell(api, o); return true;
    case 'actConduit': drawConduit(api, o); return true;
    case 'actRing': if(!o.gone) S.drawRing(api, o); return true;
    case 'actTap': drawTap(api, o); return true;
    case 'actWell': drawWell(api, o); return true;
    case 'actSable': drawSable(api, o); return true;
    case 'actArch': drawArch(api, o); return true;
    case 'actPost': drawPost(api, o); return true;
    case 'actBellTower': drawBellTower(api, o); return true;
  }
  return false;
}
function drawInnerGate(api, o){
  const { B, WX, WY } = api, x = WX(o.x), base = WY(o.y), top = WY(o.y + 260);
  for(let i = -8; i <= 6; i++){ if(i >= -1 && i <= 2) continue; const sx = x + i * 5; B(sx, top - (i % 3), 4, base - top + (i % 3), i % 2 ? C.wood1 : C.wood2); B(sx, top - 3 - (i % 3), 2, 3, C.wood2); }
  // The gate stands open behind you: the shore's light comes through it.
  api.glow(x + 2, base - 40, 30, '220,214,200', .18);
  B(x - 3, top + 20, 22, 2, CAST.drift); flower(api, x - 30, top + 60, 1); flower(api, x + 22, top + 90, 1);
}
/* A sick woman, man or child sitting: bandaged, a tin cup, a flower. */
function drawSick(api, x, y, face, kind, lift){
  const { B } = api, f = face || 1, l = Math.round(lift || 0);
  B(x - 5, y - 4, 11, 4, CAST.band0);
  B(x - 4, y - 13 - l, 9, 9 + l, kind === 'woman' ? '#7a6a62' : CAST.tunic); B(x - 4, y - 13 - l, 9, 1, '#9a8a82');
  S.bandagedHead(api, x, y - 21 - l, f, false);
  B(x + f * 5, y - 9 - l * 2, 3, 3, C.cup); B(x + f * 5, y - 9 - l * 2, 3, 1, '#c9ced0');     // the cup
}
function drawTent(api, o){
  const { B, WX, WY } = api, x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), base = WY(o.y), top = WY(o.y + o.h), w = x1 - x0, mid = (x0 + x1) >> 1;
  const A = st(api), H = base - top;
  const roofAt = (x) => Math.round(top + Math.min(1, Math.abs(x - mid) / (w / 2)) * H * .62);
  // The dark inside, the sick sitting in it with their cups, then the canvas either side.
  for(let x = x0 + 4; x < x1 - 4; x++){ const r = roofAt(x); B(x, r + 2, 1, base - r - 2, '#3d352b'); }
  const n = Math.max(1, Math.floor(w / 40));
  for(let i = 0; i < n; i++) drawSick(api, x0 + Math.round((i + .5) * w / n), base, i % 2 ? -1 : 1, 'man', A && A.turned ? 3 : 0);
  const open0 = mid - Math.round(w * .28), open1 = mid + Math.round(w * .28);
  for(let x = x0; x < x1; x++){
    const r = roofAt(x), inDoor = x > open0 && x < open1;
    const shade = (x - x0) % 9 === 0 ? C.canvas1 : C.canvas2;
    if(inDoor) B(x, r, 1, Math.max(3, Math.round((base - r) * .22)), shade);      // the flap rolled up over the door
    else B(x, r, 1, base - r, shade);
    B(x, r, 1, 1, C.canvas3);
  }
  // Tied-back flaps, the ridge pole, a patch, a flower grown up the guy-rope.
  B(open0, roofAt(open0), 2, base - roofAt(open0), C.canvas0); B(open1 - 2, roofAt(open1), 2, base - roofAt(open1), C.canvas0);
  B(mid - 1, top - 3, 2, 5, C.wood1);
  B(x0 + Math.round(w * .12), roofAt(x0 + Math.round(w * .12)) + 6, 6, 5, C.patch);
  B(x1 - Math.round(w * .18), roofAt(x1 - Math.round(w * .18)) + 8, 5, 4, C.canvas0);
  flower(api, x1 - 3, base - 12, 1);
}
function drawFire(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y), t = api.time;
  for(let i = -3; i <= 3; i++) B(x + i * 4 - 2, y - 3, 4, 3, i % 2 ? C.stone1 : C.stone2);
  for(let i = 0; i < 6; i++){ const h = 4 + Math.round((Math.sin(t * 9 + i * 1.7) + 1) * 3); B(x - 6 + i * 2, y - 3 - h, 2, h, i % 2 ? C.flame : C.ember); }
  B(x - 1, y - 9 - Math.round(Math.sin(t * 11) * 2), 2, 3, C.flameHot);
  api.glow(x, y - 8, 22, '243,180,90', .28);
}
function drawTower(api, o){
  const { B, WX, WY } = api, x = WX(o.x), base = WY(o.y), top = WY(o.y + o.h - 20), A = st(api);
  B(x - 16, top, 3, base - top, C.wood1); B(x + 13, top, 3, base - top, C.wood1);
  for(let y = top + 14; y < base - 6; y += 22){ for(let i = 0; i < 29; i++) B(x - 15 + i, y + Math.round(i * .6), 1, 1, C.wood2); }
  B(x - 20, top - 3, 40, 4, C.wood2); B(x - 20, top - 3, 40, 1, C.woodLit);
  if(!A) return;
  const w = A.watch.find(q => q.id === o.watch); if(!w) return;
  if(w.disabled){ B(x-8,top-25,16,15,C.wood1);B(x-7,top-23,14,2,C.iron);return; }
  // The watcher and his gilt glass, turned on its frame toward where the beam falls.
  const face = Math.sign(w.gx - o.x) || 1;
  sunguardFigure(api, x - face * 6, top - 3, { face, bellSwing:w.ring || 0, silenced:false, t:api.time });
  const gx = x + face * 10, gy = top - 22, ang = Math.atan2(WY(w.gy) - gy, WX(w.gx) - gx);
  B(gx - 1, gy, 2, 16, C.wood0);
  for(let a = 0; a < 16; a++){ const aa = a / 16 * Math.PI * 2; B(Math.round(gx + Math.cos(aa) * 5), Math.round(gy + Math.sin(aa) * 5), 1, 1, C.gold1); }
  B(gx - 3, gy - 3, 6, 6, C.gold3); B(Math.round(gx + Math.cos(ang) * 2), Math.round(gy + Math.sin(ang) * 2), 2, 2, '#fffbe8');
  api.glow(gx, gy, 12, '255,236,170', .45);
}
function drawAlmsBell(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y), A = st(api), ring = A ? A.almsRing : 0;
  B(x - 1, y - 44, 3, 44, C.wood1); B(x - 1, y - 44, 12, 2, C.wood1);
  const sw = ring > 0 ? Math.round(Math.sin(ring * 22) * ring * 3) : 0;
  drawBell(api, x + 9 + sw, y - 42, 1);
  B(x + 8, y - 30, 1, 22, CAST.drift);                                                      // its pull-rope, worn
}
/* THE KING'S CONDUIT: piers and arches, the walk on top; past the yard it climbs away east. */
function drawConduit(api, o){
  const { B, WX, WY, bw } = api, L = K(); if(!L) return;
  const deckY = WY(L.CONDUIT.y), ground = WY(0), x1 = L.CONDUIT.x1, x2 = L.CONDUIT.x2;
  const piers = [x1 + 50, x1 + 500, x1 + 950, x2];
  // Arches between the piers.
  for(let i = 0; i < piers.length - 1; i++){
    const a = WX(piers[i]), b = WX(piers[i + 1]); if(b < -20 || a > bw + 20) continue;
    for(let x = a; x < b; x++){
      const k = (x - a) / Math.max(1, b - a), arch = Math.round(Math.sin(k * Math.PI) * 80);
      const under = deckY + 8 + (100 - arch) * .6;
      B(x, deckY + 8, 1, Math.max(0, Math.round(under - deckY - 8)), (x - a) % 7 ? C.stone2 : C.stone1);
      B(x, Math.round(under), 1, 2, C.stone0);
    }
  }
  for(const px of piers){ const x = WX(px); if(x < -30 || x > bw + 30) continue; B(x - 9, deckY + 8, 18, ground - deckY - 8, C.stone1); B(x - 9, deckY + 8, 3, ground - deckY - 8, C.stone3); for(let y = deckY + 16; y < ground; y += 12) B(x - 9, y, 18, 1, C.stone0); }
  // Past the tap the pipe goes into the hill at a head-pier; you see it again only far off,
  // climbing the mountain to the palace.
  const hx = WX(x2);
  if(hx > -30 && hx < bw + 30){
    B(hx - 14, deckY - 30, 28, ground - deckY + 30, C.stone1); B(hx - 14, deckY - 30, 4, ground - deckY + 30, C.stone3);
    B(hx - 16, deckY - 34, 32, 5, C.stone2); B(hx - 16, deckY - 34, 32, 1, C.stoneLit);
    B(hx - 6, deckY - 20, 12, 12, C.stone0); B(hx - 4, deckY - 18, 8, 8, '#2f2a24');                      // where the channel goes in
    for(let y = deckY - 22; y < ground; y += 12) B(hx - 14, y, 28, 1, C.stone0);
  }
  // The guard's rope ladder, rolled up on the walk unless he is on it.
  const A = st(api), lx = WX(L.LADDER_X);
  if(A && A.lure){ for(let y = deckY; y < ground; y += 6){ B(lx - 3, y, 7, 1, CAST.drift); } B(lx - 3, deckY, 1, ground - deckY, C.wood2); B(lx + 3, deckY, 1, ground - deckY, C.wood2); }
  else { B(lx - 5, deckY - 5, 10, 4, C.wood2); B(lx - 5, deckY - 5, 10, 1, CAST.drift); }
}
function drawTap(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y), A = st(api), open = A && A.tapOpen;
  // The King's tap: a gilt valve housing on the walk, with a lock on it.
  B(x - 9, y - 12, 18, 12, C.gold1); B(x - 9, y - 12, 18, 1, C.gold3); B(x - 9, y - 1, 18, 1, C.gold0);
  B(x - 2, y - 18, 4, 6, C.gold2); B(x - 6, y - 19, 12, 2, C.gold2);                                    // the wheel
  if(!open){ B(x + 4, y - 9, 5, 6, C.iron); B(x + 5, y - 12, 3, 3, C.ironLit); api.glow(x, y - 8, 10, '243,214,122', .2 + .08 * Math.sin(api.time * 3)); }
  if(!open){
    B(x-9,y-13,7,3,C.gold3);B(x+2,y-13,7,3,C.gold3);
    const drop=Math.floor(api.time*10)%10;
    B(x-1,y-34+drop,2,4,C.gold3);B(x-4,y-26+drop,3,2,C.gold3);B(x+2,y-26+drop,3,2,C.gold3);
  }
  else { B(x + 5, y - 7, 5, 2, C.iron); B(x + 9, y - 5, 2, 3, C.iron); }                              // the lock, broken open
}
function drawWell(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y), A = st(api), L = K(), bucket = A ? A.bucket : 0;
  // The well-head: a ring of stone, a windlass frame, the bucket on its chain.
  B(x - 20, y - 16, 40, 16, C.stone2); B(x - 20, y - 16, 40, 2, C.stone3); for(let i = 0; i < 5; i++) B(x - 20 + i * 8, y - 16, 1, 16, C.stone0);
  B(x - 18, y - 52, 3, 36, C.wood1); B(x + 15, y - 52, 3, 36, C.wood1); B(x - 18, y - 54, 36, 3, C.wood2); B(x - 4, y - 50, 8, 4, C.wood2);
  const by = y - 44 + Math.round(bucket * 40);
  B(x, y - 50, 1, by - (y - 50), C.iron);
  if(by < y - 16){ B(x - 5, by, 10, 8, C.wood2); B(x - 5, by, 10, 1, C.iron); }
  if(A && A.tapOpen && A.water.t > 1.2){ B(x - 18, y - 16, 36, 2, C.water); B(x - 12, y - 16, 10, 1, C.waterLit); }
  // The counterweight chain runs off east on pulleys to the yard gate's lintel.
  if(L){
    const gx = WX(L.YARD_GATE_X), gy = WY(420) + 10, cy = y - 54;
    for(let i = 0; i <= 40; i++){ const k = i / 40, cx = Math.round(x + 18 + (gx - x - 18) * k), yy = Math.round(cy + (gy - cy) * k - Math.sin(k * Math.PI) * 10); B(cx, yy, 1, 1, C.iron);
      if(A && A.bucket>0 && A.bucket<1 && (i+Math.floor(A.bucket*40))%6===0) B(cx,yy,2,2,C.ironLit); }
  }
}
/* SABLE: the Causeway's stretcher-keeper, still hooded, a cup in his hands. */
function drawSable(api, o){
  if(root.BladefallResidentArt && root.BladefallResidentArt.draw(api, o)) return;   // his own body: bladefall-resident-art.js
  const { B, WX, WY } = api, A = st(api);
  const x = WX(o.x), y = WY(o.y), face = A ? A.sable.face : 1;
  api.drawFigure(x - 6, y - 22, { face, idle:api.time, pal:{ cloak:'#6b5f58', cloakLit:'#8f837a', cloakDark:'#463d38', hood:'#2c2622', scarf:'#b9a7a0', eye:'#d8c48f', skin:'#c9a98a' } });
  B(x + face * 5 - 1, y - 11, 3, 3, C.cup); B(x + face * 5 - 1, y - 11, 3, 1, '#c9ced0');
  if(A && A.tapOpen && A.water.t > 2) B(x + face * 5, y - 11, 1, 1, C.water);
}
function drawArch(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y), top = WY(o.y + o.h);
  for(const side of [-1, 1]){ const px = x + side * 26 - 4; B(px, top, 9, y - top, C.stone2); B(px, top, 2, y - top, C.stone3); for(let yy = top + 10; yy < y; yy += 12) B(px, yy, 9, 1, C.stone0); }
  B(x - 31, top - 10, 62, 9, C.stone2); B(x - 31, top - 10, 62, 1, C.stoneLit); B(x - 31, top - 2, 62, 1, C.gold2);
  B(x - 5, top - 22, 10, 10, C.gold1); B(x - 3, top - 20, 6, 6, C.gold3);                                // the King's sun
}
function drawBars(api, o){
  const { B, WX, WY } = api, x = WX(o.x), floor = WY(o.y - o.h), lintel = WY(o.y - o.h + 400);
  const k = o.moveT > 0 ? o.moveT / .5 : 0, reach = !o.gone ? 1 - k : k, tip = Math.round(lintel + (floor - lintel) * reach);
  if(tip <= lintel + 2) return;
  for(let i = -3; i <= 3; i++){ const bx = x + i * 5; B(bx, lintel, 2, tip - lintel, C.gold1); B(bx, lintel, 1, tip - lintel, C.gold3); B(bx - 1, tip - 3, 4, 3, C.gold0); }
  B(x - 17, lintel + Math.round((tip - lintel) * .5), 36, 2, C.gold1);
}
function drawPost(api, o){
  const { B, WX, WY } = api, x = WX(o.x), y = WY(o.y);
  B(x - 3, y - 34, 6, 34, C.wood1); B(x - 3, y - 34, 1, 34, C.wood3); B(x - 4, y - 24, 8, 3, C.iron); B(x - 4, y - 10, 8, 3, C.iron);
  for(let a = 0; a < 12; a++){ const aa = a / 12 * Math.PI * 2; B(Math.round(x + 5 + Math.cos(aa) * 3), Math.round(y - 8 + Math.sin(aa) * 3), 1, 1, C.ironLit); }
}
function drawBellTower(api, o){
  const { B, WX, WY } = api, L = K(); if(!L) return;
  const x = WX(o.x), base = WY(0), top = WY(L.TOWER.top), half = (L.TOWER.w / 2) * api.Z | 0;
  B(x - half, top, 3, base - top, C.wood1); B(x + half - 3, top, 3, base - top, C.wood1);
  for(let y = top + 12; y < base - 6; y += 24){ for(let i = 0; i < half * 2; i++) B(x - half + i, y + Math.round(i * .4), 1, 1, C.wood2); }
  // The bell under its little roof, and the ladder down the back.
  B(x - half - 4, top - 44, half * 2 + 8, 3, C.wood2); for(let i = 0; i < half + 6; i++) B(x - half - 4 + i, top - 44 - Math.round(i * .5), 1, 2, C.wood2); for(let i = 0; i < half + 6; i++) B(x + half + 4 - i, top - 44 - Math.round(i * .5), 1, 2, C.wood2);
  B(x - 1, top - 41, 3, 20, C.wood1); B(x - 12, top - 23, 24, 2, C.wood1);
  const A = st(api), Y = A && A.enc.yard, r = Y && Y.ringer, sw = r && !r.dead && r.bellSwing ? Math.round(Math.sin(api.time * 20) * r.bellSwing * 3) : 0;
  drawBell(api, x + 8 + sw, top - 21, 2);
  for(let y = top; y < base; y += 5) B(x + half + 4, y, 5, 1, C.wood2);
}

/* ── World: smoke, the glasses' light, the shackles' chains, the water, the colony ─ */
function world(api){
  const A = st(api), L = K(); if(!A || !L) return;
  drawSmoke(api, A);
  for(const w of A.watch) drawBeam(api, A, w);
  // These residents hold actual stationary shelter, rather than appearing wherever hit.
  if(root.BladefallActTwo.kit.path().oren === 'helped' && !A.turned) for(const shelter of L.SCREENS){
    const x=api.WX(shelter.x), y=api.WY(root.BladefallColony.groundAt(shelter.x)), half=shelter.r*api.Z;
    drawSick(api,x-half+5,y,1,'man',8);drawSick(api,x+half-5,y,-1,'woman',8);
    api.B(x-half,y-38,half*2,4,C.canvas3);api.B(x-half+2,y-34,half*2-4,12,C.canvas2);
    for(let i=0;i<half*2-8;i+=8) api.B(x-half+4+i,y-30,4,2,C.canvas1);
  }
  drawChains(api, A, L);
  if(A.tapOpen) drawFalling(api, A, L);
  for(const f of A.fallen) drawFallen(api, f);
  if(A.oren && A.oren.st !== 'absent') S.orenFigure(api, A.oren);
  if(A.turned) drawTurned(api, A, L);
  for(const q of A.tolls){
    const r = 6 + q.t * 40, a = (1 - q.t / 1.2) * .6, x = api.WX(q.x), y = api.WY(q.y);
    api.ctx.strokeStyle = `rgba(243,214,122,${a})`; api.ctx.lineWidth = 1; api.ctx.beginPath(); api.ctx.arc(x + .5, y + .5, r, 0, Math.PI * 2); api.ctx.stroke();
  }
}
function drawSmoke(api, A){
  const { ctx, WX, WY } = api;
  for(const s of A.smoke){
    if(s.d <= 0.01) continue;
    const x = WX(s.x), y = WY(s.y), r = s.r * api.Z;
    for(let i = 0; i < 7; i++){
      const a = i / 7 * Math.PI * 2 + s.t * .2, rr = r * (.55 + .12 * Math.sin(i * 2.1 + s.t));
      ctx.fillStyle = `rgba(${C.smoke},${.16 * s.d})`;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * .35, y + Math.sin(a) * r * .25, rr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = `rgba(${C.smoke},${.22 * s.d})`; ctx.beginPath(); ctx.arc(x, y, r * .5, 0, Math.PI * 2); ctx.fill();
  }
}
/* A glass's light: a cone from the glass to a pool of sun on the ground, sweeping. It
   flares when it has found you. */
function drawBeam(api, A, w){
  if(w.disabled) return;
  const { ctx, WX, WY } = api, L = K(), pool = (L ? L.POOL : 44);
  const mx = WX(w.x), my = WY(w.my), gx = WX(w.gx), gy = WY(w.gy), half = pool * api.Z;
  const S = A.enc[w.id], hot = w.caught > 0 || (S && S.st === 'live');
  const a = hot ? .34 : .16;
  const g = ctx.createLinearGradient(mx, my, gx, gy); g.addColorStop(0, `rgba(255,240,190,${a + .2})`); g.addColorStop(1, `rgba(255,226,150,${a})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(mx - 1, my); ctx.lineTo(gx - half, gy); ctx.lineTo(gx + half, gy); ctx.lineTo(mx + 1, my); ctx.closePath(); ctx.fill();
  // The pool on the ground: the thing that finds you.
  ctx.fillStyle = `rgba(255,238,180,${hot ? .55 : .32})`;
  ctx.beginPath(); ctx.ellipse(gx, gy, half, 3, 0, 0, Math.PI * 2); ctx.fill();
  api.glow(gx, gy - 4, half + 8, '255,230,160', hot ? .45 : .22);

}
function drawChains(api, A, L){
  const { B, WX, WY } = api, Y = A.enc.yard;
  for(const e of Y.foes){
    if(e.dead || !e.shackle) continue;
    const px = WX(e.shackle.x) + 5, py = WY(0) - 8, ex = WX(e.x), ey = WY(e.y) - 2;
    const taut = Math.abs(e.x - e.shackle.x) > L.CHAIN - 24, sagD = taut ? 0 : 8;
    for(let i = 0; i <= 24; i++){ const k = i / 24, x = Math.round(px + (ex - px) * k), y = Math.round(py + (ey - py) * k + Math.sin(k * Math.PI) * sagD); B(x, y, 1, 1, taut ? C.ironLit : C.iron); }
  }
}
function drawFalling(api, A, L){
  const { B, WX, WY } = api, x = WX(L.TAP.x) + 4, top = WY(L.CONDUIT.y) + 2, bottom = Math.min(WY(0) - 16, top + A.water.t * 220), t = api.time;
  for(let y = top; y < bottom; y++){ const wob = Math.round(Math.sin(y * .3 + t * 14)); B(x - 2 + wob, y, 4, 1, (y + Math.floor(t * 30)) % 5 ? C.water : C.waterLit); }
  for(let i = 0; i < 4; i++) B(x - 6 + i * 4, bottom - 2 - ((i * 3 + Math.floor(t * 20)) % 4), 2, 2, C.waterLit);
}
/* THE COLONY TURNED: the sick out of the tents and up in the road, cups raised. */
function drawTurned(api, A, L){
  const k = Math.min(1, A.turnT / 3);
  api.alphaWrap(k, () => {
    for(let i = 0; i < 9; i++){
      const wx = L.YARD_GATE_X + 180 + i * 250 + Math.round(api.hash(i, 3) * 60);
      const x = api.WX(wx); if(x < -20 || x > api.bw + 20) continue;
      drawSick(api, x, api.WY(0), i % 2 ? 1 : -1, i % 3 ? 'man' : 'woman', 10);
    }
  });
}

/* ── Enemies ──────────────────────────────────────────────────────────────── */
function enemy(api, e){
  if(e.type === 'belled'){
    const x = api.WX(e.x), y = api.WY(e.y);
    if(e.st === 'sit'){ const { B } = api; B(x - 14, y - 2, 26, 1, CAST.pike); kneeling(api, x, y, e.face, 'belled'); return true; }
    api.drawAwareness(e);
    belledFigure(api, x, y, e.st === 'post' ? Object.assign({}, e, { st:'close' }) : e);
    return true;
  }
  if(e.type === 'sunguard'){
    if(e.hitFlash > 0) api.glow(api.WX(e.x), api.WY(e.y) - 18, 14, '255,255,255', .4);
    sunguardFigure(api, api.WX(e.x), api.WY(e.y), { face:e.shieldFace, bellSwing:e.bellSwing, silenced:e.bell !== 'ringing', walking:e.walking,
      t:api.time, wind:e.st === 'wind', swing:e.st === 'swing', noBell:e.bell === 'none' });
    return true;
  }
  return false;
}

/* ── Overlay: ash on the air, and the warmth of the light ─────────────────── */
function overlay(api){
  const A = st(api) || {}, { ctx, bw, bh } = api, t = api.time, reduced = !!(api.env && api.env.reducedMotion);
  ctx.fillStyle = 'rgba(214,206,190,.25)';
  for(let i = 0, n = reduced ? 12 : 36; i < n; i++){
    const h1 = api.hash(i, 71), h2 = api.hash(i, 72);
    const x = ((h1 * bw * 1.3 + t * 6 - api.camX * api.Z * .5) % (bw + 20) + bw + 20) % (bw + 20) - 10;
    const y = ((h2 * bh - t * (8 + h1 * 6)) % bh + bh) % bh;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ ctx.fillStyle = `rgba(255,236,190,${(reduced ? .05 : .16) * flash})`; ctx.fillRect(0, 0, bw, bh); }
}

ART.register(18, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
