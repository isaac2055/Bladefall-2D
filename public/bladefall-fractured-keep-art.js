/* Bladefall — ACT THREE · The Fractured Keep's art (2026-09-24).

   The Ruined Keep at night with every gate open: cold flagstone, masonry the colour of ash, arrow
   slits with no light behind them. What you must read is exact: the pale slate that will hold a mouth
   (on the floor, on the balcony, and the one band of it on the belfry wall); the wet stone where
   nothing clings (it glistens); the hoists and their keystones; the dock; the bell's cradle swinging
   on its chain. */
(function installFracturedKeepArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;

const C = {
  sky:['#05050a', '#0c0c18', '#171628', '#221a2c'],
  keep0:'#0a0a10', keep1:'#111019', keep2:'#181622',
  flag0:'#18171e', flag1:'#26242e', flagLit:'#3e3a48', joint:'#0e0d12',
  mason0:'#211f28', mason1:'#302d38', masonLit:'#4a4656',
  slate0:'#3e4450', slate1:'#5a6272', slateLit:'#8a94a8', rune:'159,214,255',
  wet:'#15161e', wetLit:'120,150,190', iron:'#3a3a44', ironLit:'#6a6a78', chain:'#5a5654',
  bronze:'#8a6a3a', bronzeLit:'#d8b070', grip:'#d8c4a5',
};
const K = () => root.BladefallFracturedKeep;
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 26 ? A : null; }

function draw(phase, api, a){
  switch(phase){
    case 'backdrop': backdrop(api); return true;
    case 'plat': return plat(api, a);
    case 'object': return object(api, a);
    case 'world': world(api); return true;
    case 'enemy': return false;
    case 'overlay': overlay(api); return true;
  }
  return false;
}

function backdrop(api){
  FA.sky(api, C.sky, 'fk');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  // The Keep's bulk: towers and curtain walls at two depths, slits unlit.
  const { B, bw, Z } = api;
  for(const [par, col, spacing, hMin, seed] of [[.14, C.keep0, 520, 260, 11], [.3, C.keep1, 380, 180, 23]]){
    const half = bw / (2 * Z);
    const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
    for(let k = Math.floor(w0 / spacing) - 1; k <= Math.ceil(w1 / spacing) + 1; k++){
      const x = Math.round((k * spacing + api.hash(k, seed) * spacing * .4 - api.camX - half) * Z * par + bw / 2);
      const tw = 40 + Math.round(api.hash(k, seed + 1) * 50), th = hMin + Math.round(api.hash(k, seed + 2) * 180);
      B(x - tw / 2, horizon - th, tw, th + 60, col);
      for(let c = 0; c < tw; c += 12) B(x - tw / 2 + c, horizon - th - 8, 7, 8, col);           // crenels
      B(x + tw / 2, horizon - th * .45, spacing * par * .6, th * .45 + 60, col);                  // curtain wall
      for(let y = horizon - th + 30; y < horizon - 20; y += 46) B(x - 1, y, 2, 10, '#06060a');     // a slit
    }
  }
  FA.ash(api, 'rgba(180,170,200,.2)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function slateTop(api, s, x0, x1){
  const { B } = api;
  B(x0, s.y - 1, x1 - x0, 5, C.slate1); B(x0, s.y - 1, x1 - x0, 1, C.slateLit);
  for(let x = x0 + 4; x < x1 - 4; x += 11) B(x, s.y + 1, 5, 1, `rgba(${C.rune},${.35 + .2 * Math.sin(api.time * 2 + x * .1)})`);
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0 || o.gone) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'flag':
      B(s.x0, s.y, s.w, s.floor - s.y, C.flag0); B(s.x0, s.y, s.w, 4, C.flag1); B(s.x0, s.y, s.w, 1, C.flagLit);
      for(let x = s.x0 - ((s.x0 + base) % 44); x < s.x1; x += 44) if(x >= s.x0) B(x, s.y + 1, 1, 8, C.joint);
      FA.seams(api, s, base);
      return true;
    case 'masonry':
      B(s.x0, s.y, s.w, 8, C.mason1); B(s.x0, s.y, s.w, 1, C.masonLit); B(s.x0, s.y + 8, s.w, 4, C.mason0);
      for(let x = s.x0 - ((s.x0 + base) % 24); x < s.x1; x += 24) if(x >= s.x0) B(x, s.y + 2, 1, 6, C.mason0);
      return true;
    case 'slate':
      if(o.y > 1){ B(s.x0, s.y, s.w, 12, C.mason0); }
      slateTop(api, s, s.x0, s.x1);
      return true;
    case 'cradle': {
      const A = st(api), w = s.w;
      B(s.x0, s.y, w, 6, C.iron); B(s.x0, s.y - 18, 4, 18, C.iron); B(s.x1 - 4, s.y - 18, 4, 18, C.iron); B(s.x0, s.y, w, 1, A && A.rung ? C.bronzeLit : C.ironLit);
      if(!(A && A.rung)) api.glow((s.x0 + s.x1) / 2, s.y - 6, 20, '200,210,255', .1);
      return true;
    }
    case 'hoist':
      B(s.x0, s.y, s.w, 5, C.iron); B(s.x0, s.y, s.w, 1, C.ironLit);
      for(const cx of [s.x0 + 6, s.x1 - 8]) for(let y = s.y - 6; y > s.y - 220; y -= 8) B(cx, y, 2, 5, C.chain);
      return true;
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api, A = st(api);
  if(o.type === 'wall' && o.actArt){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = WY(o.y), bot = WY(o.y - o.h), w = x1 - x0;
    switch(o.actArt){
      case 'keepwall':
        B(x0, top, w, bot - top, C.mason0); B(x0, top, w, 2, C.masonLit);
        for(let y = top + 10; y < bot; y += 12) B(x0, y, w, 1, C.keep2);
        return true;
      case 'wet': case 'screen': {
        // Wet stone: nothing clings. It glistens on the face that will not hold.
        B(x0, top, w, bot - top, C.wet); B(x0, top, w, 2, '#2a2c38');
        const face = o.slickL && !o.slickR ? x0 : o.slickR && !o.slickL ? x1 - 2 : null;
        // The slippery face stays legible even between glints; the dry face remains stone.
        if(face != null) B(face, top + 2, 2, bot - top - 2, 'rgba(120,150,190,.4)');
        for(let y = top + 6; y < bot - 4; y += 9){ const a = .25 + .2 * Math.sin(api.time * 3 + y * .2);
          if(face != null) B(face, y, 2, 5, `rgba(${C.wetLit},${a})`); else { B(x0, y, 2, 5, `rgba(${C.wetLit},${a})`); B(x1 - 2, y + 4, 2, 5, `rgba(${C.wetLit},${a})`); } }
        if(o.actArt === 'screen') for(let k = 0; k < 5; k++) B(x0 + 6 + k * 12, top - 6 - (k % 2) * 5, 8, 6 + (k % 2) * 5, C.wet);   // the broken top
        return true;
      }
      case 'slatewall':
        B(x0, top, w, bot - top, C.slate0); B(x0, top, w, 2, C.slateLit);
        for(let y = top + 4; y < bot - 3; y += 8) B(x1 - 3, y, 2, 4, `rgba(${C.rune},${.45 + .25 * Math.sin(api.time * 2 + y * .1)})`);
        api.glow(x1, (top + bot) / 2, 16, C.rune, .18);
        return true;
      case 'bars': {
        const lift = o.gone ? Math.round((bot - top) * .92) : 0;
        for(let x = x0 + 2; x < x1 - 1; x += 7) B(x, top, 3, bot - top - lift, C.iron);
        B(x0 - 4, top, w + 8, 4, C.ironLit);
        return true;
      }
    }
    return false;
  }
  switch(o.type){
    case 'crate': {
      if(o.actArt !== 'keystone') return false;
      const x = WX(o.x - o.w / 2), y = WY(o.y + o.h), w = o.w * api.Z, h = o.h * api.Z;
      B(x, y, w, h, C.mason1); B(x, y, w, 2, C.grip); B(x, y, 2, h, C.masonLit);
      B(x + 3, y + 4, w - 6, h - 7, C.mason0);
      // Matching bronze inlays connect each stone to its receiving seat.
      B(x + w / 2 - 1, y + 5, 2, h - 9, C.bronzeLit);
      B(x + 4, y + h / 2, w - 8, 2, C.bronzeLit);
      return true;
    }
    case 'actDock': {
      const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), y = WY(o.y), done = A && A.docked;
      B(x0, y - 3, x1 - x0, 3, done ? C.bronzeLit : C.bronze);
      for(let x = x0 + 4; x < x1 - 4; x += 10) B(x, y - 6, 4, 3, done ? C.bronzeLit : C.bronze);
      if(!done) api.glow((x0 + x1) / 2, y - 4, 24, '220,180,110', .12);
      return true;
    }
    case 'actGrip': {
      if(A && A.grip) return true;
      const x = WX(o.x), y = WY(o.y);
      B(x - 16, y - 60, 32, 60, C.mason0); B(x - 10, y - 52, 20, 44, '#0a090e');
      B(x - 6, y - 36, 12, 8, C.grip); B(x - 4, y - 38, 8, 2, '#f0e0c0'); api.glow(x, y - 32, 16, '240,220,180', .25);
      return true;
    }
    case 'actBell': {
      const x = WX(o.x), y = WY(o.y), rung = A && A.rung, sw = rung && !api.env?.reducedMotion ? Math.round(Math.sin(api.time * 5) * 2) : 0;
      const z = api.Z;
      B(x - 40*z, y - 90*z, 80*z, 6*z, C.iron); B(x - 2*z, y - 84*z, 4*z, 14*z, C.chain);
      for(let r = 0; r < 60; r++){ const w = 10 + Math.round(r * .3); B(x - w*z + sw*r/60, y - (70-r)*z, w*2*z, z, r > 55 ? C.bronzeLit : C.bronze); }
      if(rung) api.glow(x, y - 35*z, 30, '240,210,150', .25);
      return true;
    }
    case 'actTunnel': {
      const x = WX(o.x), base = WY(0), top = WY(o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.mason1); B(x + w, top + r * 4, 10, 4, C.mason1); }
      api.glow(x, base - 60, 60, '220,210,240', .1);
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 10, y - 3, 20, 3, '#2a2420'); for(let i = 0; i < 3; i++) B(x - 6 + i * 5, y - 4, 2, 1, '#5a2a1a'); return true; }   // the hearth, cold
  }
  return false;
}
/* The cradle's chain, from the bell frame's pivot to wherever the cradle has swung. */
function world(api){
  const k = K(), A = st(api); if(!k || !A) return;
  const c = api.G.obstacles.find(o => o.fkCradle); if(!c) return;
  const { B, WX, WY } = api, C0 = k.constants.CRADLE, cx = WX(c.x), cy = WY(c.y) - 18, top = WY(k.constants.BELL.y + 10), pivot = WX(C0.x);
  // Receiver-to-gate linkages make success a physical consequence.
  for(const [x, y, gate, done] of [[k.constants.DOCK.x, k.constants.DOCK.y, 5560, A.docked], [k.constants.BELL.x, k.constants.BELL.y, 9600, A.rung]]){
    const left=WX(x), right=WX(gate), height=WY(y);
    B(left,height+4,right-left,1,done?C.bronzeLit:C.chain); B(right,height+4,1,WY(0)-height-4,done?C.bronzeLit:C.chain);
  }
  // Cables trace each strike release to its hoist; a failed throw visibly tensions the recall cable.
  for(const [id,stoneFlag] of [['fk-drop','fkKeystone'],['fk-bell-drop','fkBellStone']]){
    const lever=api.G.obstacles.find(o=>o.type==='lever'&&o.id===id), stone=api.G.obstacles.find(o=>o[stoneFlag]);
    const shelf=api.G.obstacles.find(o=>o.dropOnCircuit===id); if(!lever||!stone||!shelf) continue;
    const lx=WX(lever.x), ly=WY(lever.y+40), hx=WX(shelf.x), hy=WY(shelf.y+45);
    const color=lever.timer>0?C.bronzeLit:C.chain;
    B(lx,hy,1,ly-hy,color); B(Math.min(lx,hx),hy,Math.abs(lx-hx),1,color); B(hx,hy,1,22,color);
    if(!stone.keepSeated && stone.stuck>0){
      const alpha=.2+.6*Math.min(1,stone.stuck/3), sy=WY(stone.y+stone.h);
      for(let yy=hy;yy<sy;yy+=8) B(WX(stone.x),yy,1,4,`rgba(216,176,112,${alpha})`);
    }
  }
  // A hanging plumb line gives the swing a stable centre reference, without solving its timing.
  for(let yy=top;yy<WY(C0.y);yy+=10) B(pivot,yy,1,3,'rgba(216,176,112,.25)');
  const n = 16; for(let i = 0; i <= n; i++){ const q = i / n; B(Math.round(pivot + (cx - pivot) * q) - 1, Math.round(top + (cy - top) * q), 2, 4, C.chain); }
}
function overlay(api){
  const A = st(api) || {};
  FA.vignette(api, '5,5,10', .55);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(230,225,250,${.14 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
}

ART.register(26, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
