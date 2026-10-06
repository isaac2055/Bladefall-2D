/* Bladefall — ACT THREE · The Fractured Line's art (2026-09-25).

   The Deep Line with its lamps out: black rock, rail irons that catch what little light the cart carries,
   amber only where the line still means something (the switch, the lock, a span on its beat). What you must
   read: where the rail is cut (the dark under it), the spans that fail (the engine's crumble), and on the
   Black Line each span's beat — solid, solid and about to go (amber ties), gone (a ghost of the irons). */
(function installFracturedLineArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;

const C = {
  sky:['#050505', '#0a0908', '#110f0c', '#18140f'],
  hall0:'#0b0a08', hall1:'#12100c',
  rock0:'#16130f', rock1:'#241f18', rockLit:'#4e4436', iron:'#6b6660', ironLit:'#b8b0a4', tie:'#3a2e22',
  amber:'255,196,90', amberHex:'#ffc45a',
};
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 35 ? A : null; }

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
  FA.sky(api, C.sky, 'fl');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  const { B, bw, Z } = api;
  // Timber sets receding into the dark, a lamp dead in each.
  for(const [par, col, spacing, seed] of [[.15, C.hall0, 260, 3], [.3, C.hall1, 180, 8]]){
    const half = bw / (2 * Z);
    const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
    for(let k = Math.floor(w0 / spacing) - 1; k <= Math.ceil(w1 / spacing) + 1; k++){
      const x = Math.round((k * spacing - api.camX - half) * Z * par + bw / 2), h = 200 + Math.round(api.hash(k, seed) * 120);
      B(x, horizon - h, 10, h + 60, col); B(x + 90, horizon - h, 10, h + 60, col); B(x - 6, horizon - h, 112, 10, col);
      if(api.hash(k, seed + 2) > .75) B(x + 46, horizon - h + 12, 6, 8, '#2a2418');
    }
  }
  FA.ash(api, 'rgba(220,200,160,.08)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function irons(api, s, base, col, tie){
  const { B } = api;
  for(let x = s.x0 - ((s.x0 + base) % 18); x < s.x1; x += 18) if(x >= s.x0) B(x, s.y - 2, 8, 3, tie);
  B(s.x0, s.y - 4, s.w, 2, col); B(s.x0, s.y - 4, s.w, 1, C.ironLit);
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'rail':
      if(o.gone) return true;
      B(s.x0, s.y, s.w, s.floor - s.y, C.rock0); B(s.x0, s.y, s.w, 3, C.rock1); irons(api, s, base, C.iron, C.tie);
      if(o.railCollapse && o.crT > 0){ const q = 1 - o.crT / (o.crDur || 1.5); B(s.x0, s.y, s.w, 3, `rgba(${C.amber},${.3 + .5 * q})`); }
      return true;
    case 'beat': {
      // Solid: irons; about to go: amber ties; gone: a ghost of the irons over the dark.
      if(o.gone){ api.ctx.save(); api.ctx.globalAlpha = .22; irons(api, s, base, C.iron, C.tie); api.ctx.restore(); return true; }
      B(s.x0, s.y, s.w, Math.min(s.floor - s.y, 20), C.rock1); irons(api, s, base, C.iron, o.flWarn ? C.amberHex : C.tie);
      if(o.flWarn) api.glow((s.x0 + s.x1) / 2, s.y, s.w / 2, C.amber, .12);
      return true;
    }
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api;
  switch(o.type){
    case 'actTunnel': {
      const x = WX(o.x), base = WY(o.y || 0), top = WY((o.y || 0) + o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.rock1); B(x + w, top + r * 4, 10, 4, C.rock1); }
      api.glow(x, base - 60, 60, C.amber, .1);
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 12, y - 3, 24, 3, C.rock1); for(let i = 0; i < 3; i++) B(x - 6 + i * 5, y - 7, 3, 4, i % 2 ? C.amberHex : '#fff0c0'); api.glow(x, y - 6, 22, C.amber, .3); return true; }
  }
  return false;
}
function world(api){
  const k=root.BladefallFracturedLine.constants;
  for(const o of api.G.obstacles) if(o.actArt==='beat' && o.gone) plat(api,o);
  const ctx=api.ctx;ctx.save();ctx.font='10px monospace';ctx.textAlign='center';ctx.fillStyle=C.amberHex;
  k.BLACK.secs.forEach(([x],i)=>{const sx=api.WX(x-70),sy=api.WY(60);api.B(sx,sy,1,60*api.Z,C.ironLit);ctx.fillText(['HOLD','REIN','LEAN'][i],sx,sy-8);});
  ctx.restore();
}
function overlay(api){
  const A = st(api) || {};
  FA.vignette(api, '6,5,3', .55);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(255,230,180,${.14 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
}

ART.register(35, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
