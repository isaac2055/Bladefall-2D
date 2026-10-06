/* Bladefall — ACT THREE · The Fractured Emberdeep's art (2026-09-24).

   The Foundry cold: black iron, ash, and the lava under the floor still running. What you must read:
   each slab's state (molten = lava, and gone; glass = dark red and slick; stone = grey; and in its
   last stretch before it melts, its seams glow), the spouts (they brighten before they pour), the
   slag (it shakes on its chain before it drops, lands as a step, and sinks), the vents of the purge
   (they glow before they rise, and the glow runs along the floor ahead of the sweep), and the post. */
(function installFracturedEmberdeepArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;

const C = {
  sky:['#070506', '#110b0a', '#1b100d', '#271510'],
  hall0:'#0c0808', hall1:'#140d0b',
  iron0:'#1a1616', iron1:'#2a2422', ironLit:'#4a403a', ash:'#3a3432',
  lava:'#ff7a2a', lavaLit:'#ffd27a', glass:'#5a1a14', glassLit:'#a0402a', stone:'#4a4442', stoneLit:'#7a706a',
  ember:'255,140,60', slag:'#3a302a', slagLit:'#6a5a4a',
};
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 30 ? A : null; }
const K = () => root.BladefallFracturedEmberdeep;

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
  FA.sky(api, C.sky, 'fed');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  const { B, bw, Z } = api;
  // The Foundry's halls: chimneys and gantries, cold, at two depths.
  for(const [par, col, spacing, seed] of [[.15, C.hall0, 300, 4], [.3, C.hall1, 210, 8]]){
    const half = bw / (2 * Z);
    const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
    for(let k = Math.floor(w0 / spacing) - 1; k <= Math.ceil(w1 / spacing) + 1; k++){
      const x = Math.round((k * spacing - api.camX - half) * Z * par + bw / 2), h = 160 + Math.round(api.hash(k, seed) * 200), w = 26 + Math.round(api.hash(k, seed + 1) * 20);
      B(x, horizon - h, w, h + 60, col);
      B(x - 40, horizon - h * .55, 120, 6, col);                                                  // a gantry
      if(api.hash(k, seed + 2) > .7) api.glow(x + w / 2, horizon - h, 8, C.ember, .08);          // one coal left in a chimney
    }
  }
  FA.ash(api, 'rgba(200,170,150,.16)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function heatFraction(api, o){ const c = o.heatCycle, per = c.period || 4.2; return ((((api.G.time + (c.phase || 0)) % per) + per) % per) / per; }
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'forge':
      B(s.x0, s.y, s.w, s.floor - s.y, C.iron0); B(s.x0, s.y, s.w, 4, C.iron1); B(s.x0, s.y, s.w, 1, C.ironLit);
      for(let x = s.x0 - ((s.x0 + base) % 34); x < s.x1; x += 34) if(x >= s.x0) B(x, s.y + 1, 1, 8, C.hall0);
      FA.seams(api, s, base);
      return true;
    case 'ledge':
      B(s.x0, s.y, s.w, s.floor - s.y, C.iron1); B(s.x0, s.y, s.w, 2, C.ironLit);
      return true;
    case 'heat': {
      const f = heatFraction(api, o), c = o.heatCycle, t = api.time;
      if(f >= c.molten){
        // A steady rim drains toward the next melt; refuge end brackets identify the safe span.
        const left=api.WX(o.x-o.w/2), width=o.w*api.Z, remaining=(1-f)/(1-c.molten);
        B(left,s.y-3,width*remaining,2,o.fedRefuge?'#b8d0ce':C.stoneLit);
        if(o.fedRefuge) for(const edge of [left,left+width-2]) B(edge,s.y-8,2,8,'#b8d0ce');
      }
      if(f < c.molten){                                   // molten: lava where the slab was
        B(s.x0, s.y + 2, s.w, 5, C.lava); for(let x = s.x0; x < s.x1; x += 7) B(x, s.y + 1 + Math.round(Math.sin(t * 5 + x * .3)), 3, 1, C.lavaLit);
        api.glow((s.x0 + s.x1) / 2, s.y, s.w * .5, C.ember, .25); return true; }
      if(f < c.set){ B(s.x0, s.y, s.w, s.floor - s.y, C.glass); B(s.x0, s.y, s.w, 1, C.glassLit); return true; }   // glass: slick
      B(s.x0, s.y, s.w, s.floor - s.y, C.stone); B(s.x0, s.y, s.w, 1, C.stoneLit);
      const warn = f > .7 ? (f - .7) / .3 : 0;              // its last stretch: the seams glow
      if(warn > 0){ for(let x = s.x0 + 6; x < s.x1 - 4; x += 17) B(x, s.y + 2, 1, s.floor - s.y - 3, `rgba(${C.ember},${.3 + .7 * warn})`); api.glow((s.x0 + s.x1) / 2, s.y, 18, C.ember, .25 * warn); }
      return true;
    }
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api, A = st(api), t = api.time;
  if(o.type === 'wall' && o.actArt === 'forgewall'){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = WY(o.y), bot = WY(o.y - o.h), w = x1 - x0;
    B(x0, top, w, bot - top, C.iron0); B(x0, top, w, 3, C.ironLit);
    for(let y = top + 8; y < bot; y += 22) B(x0 + 3, y, w - 6, 2, C.iron1);
    for(let y = top + 12; y < bot; y += 14) B(x0 + ((y * 7) % Math.max(1, w - 3)), y, 2, 5, 'rgba(160,140,130,.3)');   // condensation: wet
    return true;
  }
  if(o.type === 'trap' && o.actArt === 'slag'){
    const x = WX(o.x), y = WY(o.y), w = Math.round(o.w * api.Z), h = Math.round(o.h * api.Z);
    const shake = o.state === 'warn' ? Math.round(Math.sin(t * 60) * 2) : 0;
    if(o.state === 'idle' || o.state === 'warn'){ for(let yy = y - h - 4; yy > y - h - 400; yy -= 8) B(x - 1 + shake, yy, 2, 5, C.iron1); }   // its chain
    B(x - w / 2 + shake, y - h, w, h, C.slag); B(x - w / 2 + shake, y - h, w, 2, C.slagLit);
    for(let k = 0; k < 4; k++) B(x - w / 2 + 6 + k * (w / 4) + shake, y - h + 8 + (k % 2) * 14, 4, 3, `rgba(${C.ember},${o.state === 'landed' ? .25 : .5})`);
    if(o.state === 'warn' || o.state === 'fall'){
      const floor=WY(o.floorY||0);
      B(x-w/2,floor-2,w,2,C.lavaLit);
      B(x-w/2,floor-8,1,8,C.lavaLit);B(x+w/2-1,floor-8,1,8,C.lavaLit);
    }
    if(o.state === 'landed'){
      const remaining=Math.max(0,1-(o.slagDwell||0)/o.slagCycle.dwell);
      B(x-w/2,y-h,w*remaining,2,C.lavaLit);
    }
    if(o.state === 'landed' && (o.slagDwell || 0) > (o.slagCycle.dwell - 1)) B(x - w / 2, y - 3, w, 3, C.lava);                 // it is going
    return true;
  }
  if(o.type === 'spikes' && o.actArt === 'vent'){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), y = WY(o.y), per = o.period, f = ((((api.G.time + o.phase) % per) + per) % per);
    const up = f < o.upT, warn = !up && f > per - .7;
    B(x0 + 4, y - 3, x1 - x0 - 8, 3, C.iron1);
    if(warn){
      api.glow((x0 + x1) / 2, y - 4, 16, C.ember, .35);
      B(x0,y-2,x1-x0,2,C.lavaLit);
      for(let x=x0+8;x<x1-8;x+=18){B(x,y-7,5,1,C.lavaLit);B(x+4,y-9,1,5,C.lavaLit);}
    }
    if(up){ B(x0,y-30*api.Z,x1-x0,30*api.Z,'rgba(255,122,42,.18)'); for(let x = x0 + 4; x < x1 - 4; x += 8){ const h = 14 + Math.round(10 * Math.abs(Math.sin(t * 20 + x))); B(x, y - h, 5, h, x % 16 ? C.lava : C.lavaLit); } api.glow((x0 + x1) / 2, y - 14, 30, C.ember, .4); }
    return true;
  }
  switch(o.type){
    case 'actSpout': {
      const x = WX(o.x), top = WY(o.y), bot = WY(0);
      B(x - 14, top - 18, 28, 18, C.iron1); B(x - 14, top - 18, 28, 2, C.ironLit); B(x - 6, top, 12, 6, C.iron0);
      if(o.warn){
        api.glow(x,top+4,14,C.ember,.5);
        // The complete damage corridor is marked on the landing before the pour.
        B(WX(o.x-22),bot-3,44*api.Z,3,C.lavaLit);
        for(const edge of [o.x-22,o.x+22]) B(WX(edge),bot-14*api.Z,1,14*api.Z,C.lavaLit);
      }
      if(o.pouring){ B(WX(o.x-22),top,44*api.Z,bot-top,'rgba(255,122,42,.28)'); B(WX(o.x-22),top,1,bot-top,C.glassLit); B(WX(o.x+22),top,1,bot-top,C.glassLit); B(x - 5, top + 6, 10, bot - top - 6, C.lava); B(x - 2, top + 6, 3, bot - top - 6, C.lavaLit); api.glow(x, bot - 8, 26, C.ember, .35); }
      return true;
    }
    case 'actPost': {
      const x = WX(o.x), y = WY(o.y), on = A && A.command;
      B(x - 4, y - 110, 8, 110, C.iron1); B(x - 22, y - 110, 44, 10, C.iron1); B(x - 22, y - 110, 44, 2, C.ironLit);
      B(x - 14, y - 96, 28, 18, on ? '#5a3a24' : '#3a2a20'); if(!on) api.glow(x, y - 88, 16, '255,180,84', .35);
      return true;
    }
    case 'actTunnel': {
      const x = WX(o.x), base = WY(o.y || 0), top = WY((o.y || 0) + o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.iron1); B(x + w, top + r * 4, 10, 4, C.iron1); }
      api.glow(x, base - 60, 60, '255,190,140', .12);
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 12, y - 3, 24, 3, C.ash); B(x - 4, y - 5, 2, 2, `rgba(${C.ember},.6)`); return true; }   // a forge hearth, one coal
  }
  return false;
}
/* The lava under the floor, where there is no floor. */
function world(api){
  const A = st(api), k = K(); if(!A || !k) return;
  const { B, WX, WY } = api, t = api.time, G0 = k.constants.GROUND;
  // The shared platform pass skips molten/gone slabs. Keep their location visible here.
  for(const o of api.G.obstacles) if(o.actArt==='heat' && o.gone) plat(api,o);
  const top = WY(-50);
  for(let i = 0; i < G0.length - 1; i++){
    const a = G0[i][1], b = G0[i + 1][0], x0 = Math.max(0, WX(a)), x1 = Math.min(api.bw, WX(b)); if(x1 <= x0) continue;
    B(x0, top, x1 - x0, api.bh - top, '#2a0e06');
    for(let x = x0 - (x0 % 6); x < x1; x += 6) B(x, top + Math.round(2 * Math.sin(t * 2 + x * .2)), 4, 2, x % 12 ? C.lava : C.lavaLit);
    api.glow((x0 + x1) / 2, top, (x1 - x0) * .5, C.ember, .12);
  }
}
function overlay(api){
  const A = st(api) || {};
  FA.vignette(api, '10,5,3', .5);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(255,220,180,${.14 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
}

ART.register(30, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
