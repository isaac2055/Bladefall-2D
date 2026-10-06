/* Bladefall — ACT THREE · The Fractured Frostfell's art (2026-09-24).

   Frostfell, warm: grey slush and wet stone, every hearth burning amber with no one beside it, and
   meltwater where the streets were. What you must read: thin ice (pale, and it cracks before it goes),
   the dry stones (dark, they hold), the spikes that stand up out of the thaw, the tollmen's and the
   Rimeguard's spears (drawn back = coming; held back = the feint), the sweep's red edge and the shards
   thrown low, and the memory, a cold light in a warm place. */
(function installFracturedFrostfellArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;

const C = {
  sky:['#0a0a10', '#15121a', '#221a1e', '#34221c'],
  hill0:'#120f14', hill1:'#1b1519',
  snow0:'#3a3a42', snow1:'#5a5a64', snowLit:'#8a8a96', slush:'#2a2c34',
  stone0:'#1c1a20', stone1:'#2c2830', stoneLit:'#4a4450',
  ice0:'#6f8a9a', ice1:'#a8c4d2', iceLit:'#e2f2fa', crack:'#2a3a44',
  water:'#0d1a22', waterLit:'120,170,190', hearth:'255,170,90', ember:'#ffb060',
  iron:'#4a4a54', ironLit:'#8a8a98', rime:'#9fc6dc', rimeLit:'#e6f6ff', cloth:'#3a3440', wood:'#6a5038',
};
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 28 ? A : null; }
const K = () => root.BladefallFracturedFrostfell;

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
  FA.sky(api, C.sky, 'ff');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  FA.bands(api, [[.1, C.hill0, 90, .004], [.24, C.hill1, 60, .008]], horizon);
  // Far roofs of the working streets, their snow sliding off; hearth-light in windows no one sits at.
  const { B, bw, Z } = api, par = .34, half = bw / (2 * Z);
  const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
  for(let k = Math.floor(w0 / 260) - 1; k <= Math.ceil(w1 / 260) + 1; k++){
    const x = Math.round((k * 260 + api.hash(k, 5) * 90 - api.camX - half) * Z * par + bw / 2), h = 50 + Math.round(api.hash(k, 6) * 60), w = 60 + Math.round(api.hash(k, 7) * 40);
    B(x, horizon - h, w, h + 40, C.hill1);
    for(let r = 0; r < w / 2; r++) B(x + r, horizon - h - r * .5, w - r * 2, 1, C.hill1);           // the roof
    if(api.hash(k, 8) > .35){ B(x + w / 2 - 3, horizon - h + 14, 6, 8, `rgba(${C.hearth},.55)`); api.glow(x + w / 2, horizon - h + 18, 12, C.hearth, .12); }
  }
  FA.ash(api, 'rgba(230,220,210,.16)');                                                         // not snow: steam, and soot
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'snow':
      B(s.x0, s.y, s.w, s.floor - s.y, C.stone0); B(s.x0, s.y, s.w, 5, C.snow0); B(s.x0, s.y, s.w, 1, C.snowLit);
      for(let x = s.x0 - ((s.x0 + base) % 23); x < s.x1; x += 23) if(x >= s.x0) B(x, s.y + 2, 9, 2, C.slush);
      FA.seams(api, s, base);
      return true;
    case 'stone': case 'crown':
      B(s.x0, s.y, s.w, s.floor - s.y, C.stone0); B(s.x0, s.y, s.w, 3, C.stone1); B(s.x0, s.y, s.w, 1, C.stoneLit);
      for(let x = s.x0 + 3; x < s.x1 - 3; x += 17) B(x, s.y - 1, 6, 1, C.snow0);                   // the last of the snow on it
      return true;
    case 'thin': {
      if(o.gone){ // sunk: a ripple where it was
        const a = .25 + .2 * Math.sin(api.time * 6 + o.x);
        B(s.x0 + 4, s.y + 2, s.w - 8, 1, `rgba(${C.waterLit},${a})`); return true; }
      const k = Math.min(1, (o.crackT || 0) / (o.ffThin || .5)), shake = k > .5 ? Math.round(Math.sin(api.time * 60) * k) : 0;
      B(s.x0 + shake, s.y, s.w, s.floor - s.y, C.ice0); B(s.x0 + shake, s.y, s.w, 2, C.ice1);
      // The bright top retreats as the plate loses strength; collision stays at the same height.
      B(s.x0,s.y,s.w*(1-k),2,C.iceLit);
      if(k > 0){ const n = 1 + Math.round(k * 4); for(let i = 0; i < n; i++){ const cx = s.x0 + Math.round(s.w * (.15 + .7 * api.hash(i, o.x))); B(cx + shake, s.y + 1, 1, s.floor - s.y - 1, C.crack); B(cx + shake - 2, s.y + 3 + i, 5, 1, C.crack); } }
      return true;
    }
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api, A = st(api);
  if(o.type === 'wall' && o.actArt){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = WY(o.y), bot = WY(o.y - o.h), w = x1 - x0;
    switch(o.actArt){
      case 'frostwall':
        B(x0, top, w, bot - top, C.stone0); B(x0, top, w, 2, C.stoneLit);
        for(let y = top + 6; y < bot; y += 11) B(x0 + ((y * 7) % Math.max(1, w - 3)), y, 2, 5, `rgba(${C.waterLit},.35)`);   // meltwater running down
        return true;
      case 'bars': {
        const lift = o.gone ? Math.round((bot - top) * .92) : 0;
        for(let x = x0 + 2; x < x1 - 1; x += 6) B(x, top, 3, bot - top - lift, C.iron);
        B(x0 - 3, top, w + 6, 3, C.ironLit);
        return true;
      }
    }
    return false;
  }
  switch(o.type){
    case 'actMemory': {
      const x = WX(o.x), y = WY(o.y), t = api.time;
      if(A && A.memory){ api.glow(x, y - 30, 14, '200,230,255', .08); return true; }
      // A column of old ice, a small figure in it, a cold light that does not melt.
      B(x - 14, y - 70, 28, 70, 'rgba(168,196,210,.55)'); B(x - 14, y - 70, 28, 2, C.iceLit);
      B(x - 4, y - 44, 8, 14, '#2a3440'); B(x - 3, y - 50, 6, 6, '#3a4450');
      api.glow(x, y - 40, 22 + 4 * Math.sin(t * 2), '200,230,255', .35);
      return true;
    }
    case 'actTunnel': {
      const x = WX(o.x), base = WY(o.y || 0), top = WY((o.y || 0) + o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.stone1); B(x + w, top + r * 4, 10, 4, C.stone1); }
      api.glow(x, base - 60, 60, '240,230,220', .12);
      return true;
    }
    case 'actFire': {                                                                              // a hearth, burning, untended
      const x = WX(o.x), y = WY(o.y), t = api.time;
      B(x - 14, y - 4, 28, 4, C.stone1);
      for(let i = 0; i < 5; i++){ const h = 6 + Math.round(5 * Math.abs(Math.sin(t * 7 + i * 1.7))); B(x - 10 + i * 4, y - 4 - h, 3, h, i % 2 ? C.ember : '#ff7a3a'); }
      api.glow(x, y - 12, 34, C.hearth, .3);
      return true;
    }
  }
  return false;
}
/* Meltwater under the streets and the stair; the Rimeguard's shards; the sweep's edge. */
function world(api){
  const A = st(api); if(!A) return;
  const { B, WX, WY } = api, t = api.time;
  for(const [a, b, y] of [[1760, 4300, -18], [5300, 8100, -120]]){
    const x0 = Math.max(0, WX(a)), x1 = Math.min(api.bw, WX(b)); if(x1 <= x0) continue;
    const top = WY(y); B(x0, top, x1 - x0, api.bh - top, C.water);
    for(let x = x0 - (x0 % 9); x < x1; x += 9){ const a2 = .15 + .15 * Math.sin(t * 2 + x * .31); B(x, top + ((x * 13) % 5), 5, 1, `rgba(${C.waterLit},${a2})`); }
  }
  // Gone platforms are skipped by the shared platform pass: show their refreezing outline here.
  for(const o of api.G.obstacles){
    if(!o.ffThin || !o.gone) continue;
    const left=WX(o.x-o.w/2), width=o.w*api.Z, y=WY(o.y);
    const ready=Math.max(0,Math.min(1,1-(o.sunkT||0)/K().constants.THIN.sunk));
    B(left,y+2,width,1,C.crack); B(left,y+2,width*ready,1,C.ice1);
  }
  for(const s of A.shards || []){ const x = WX(s.x), y = WY(s.y); B(x - 7, y - 2, 14, 4, C.rime); B(x + (s.vx > 0 ? 5 : -7), y - 1, 3, 2, C.rimeLit); }
  for(const a of A.aoes || []){ const x0 = WX(a.x - a.r), x1 = WX(a.x + a.r), y = WY((a.y || 0) + 6); B(x0, y, x1 - x0, 3, `rgba(255,90,70,${Math.min(1, a.t * 4)})`); }
}

/* The tollmen and the Rimeguard. */
function enemy(api, e){
  if(e.actFoe !== 'tollman' && e.actFoe !== 'rimeguard') return false;
  if(e.dead) return true;
  const { B, WX, WY } = api, Z = api.Z, s = n => Math.round(n * Z), t = api.time, fl = e.hitFlash > 0;
  const rime = e.actFoe === 'rimeguard', x = WX(e.x), foot = WY(e.y), f = e.face || -1, h = s(rime ? 92 : 70);
  const body = fl ? '#ffffff' : rime ? C.rime : C.iron, lit = fl ? '#ffffff' : rime ? C.rimeLit : C.ironLit;
  const reel = e.st === 'reel', kneel = e.st === 'down', crouch = reel ? s(8) : kneel ? s(30) : 0, top = foot - h + crouch;
  // Legs, the body, the helm.
  B(x - s(12), foot - s(22), s(9), s(22), C.cloth); B(x + s(3), foot - s(22), s(9), s(22), C.cloth);
  B(x - s(16), top + s(16), s(32), h - s(38) - crouch, body); B(x - s(16), top + s(16), s(32), 2, lit);
  if(rime) for(let y = top + s(20); y < foot - s(24); y += s(9)) B(x - s(14) + ((y * 5) % s(26)), y, 1, s(5), `rgba(${C.waterLit},.6)`);  // running meltwater
  B(x - s(10), top, s(20), s(18), body); B(x - s(10), top, s(20), 2, lit); B(x + f * s(2) - s(4), top + s(7), s(8), 2, reel ? '#ffe0a0' : '#0a0c10');
  if(kneel){ B(x - s(30), foot - s(4), s(60), s(3), C.wood); return true; }
  // The spear: drawn back in the windup (held back longer in the feint), thrust, or knocked wide in the reel.
  const wind = e.st === 'wind', thr = e.st === 'thrust', sweep = e.st === 'sweep-tell' || e.st === 'sweep';
  const len = s(rime ? 80 : 64), sy = top + s(rime ? 40 : 32);
  let x0, x1, y0, y1;
  if(reel){ x0 = x - f * s(8); y0 = sy + s(20); x1 = x0 - f * len * .7; y1 = sy - s(30); }
  else if(sweep){ x0 = x - f * s(10); y0 = foot - s(10); x1 = x0 + f * len; y1 = foot - s(6); }
  else { const back = wind ? s(26) : thr ? -s(24) : 0; x0 = x - f * s(20) - f * back; x1 = x0 + f * len; y0 = y1 = sy; }
  const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0)));
  for(let i = 0; i <= n; i += 1) B(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 2, 2, C.wood);
  B(x1 - 3, y1 - 2, 6, 4, sweep ? '#ff6a50' : lit);
  if(wind){
    const A=st(api), pattern=rime ? K().constants.R.phases[A.phase].combo : e.combo;
    const duration=pattern[e.ci], remaining=Math.max(0,duration-e.t), held=duration>.9;
    const ready=remaining<=.22, progress=Math.min(1,e.t/duration);
    // Held spears stay blue until the final counter beat; the drawn-back shaft fills toward its tip.
    const cue=ready?'#fff0b0':held?C.rime:C.ironLit;
    B(Math.min(x0,x1),y1+5,Math.abs(x1-x0),1,C.cloth);
    const fill=Math.abs(x1-x0)*progress;
    B(f>0?x0:x0-fill,y1+5,fill,2,cue);
    api.glow(x1,y1,ready?14:8,ready?'255,240,180':'180,210,255',.5);
    // One notch per thrust; the last is the one that opens the guard.
    for(let i=0;i<pattern.length;i++) B(x-s(pattern.length*5)+s(i*10),top-s(9),s(6),i===pattern.length-1?s(4):s(2),i===e.ci?cue:C.cloth);
  }
  if(reel){
    const remaining=Math.max(0,1-e.t/(rime?K().constants.R.reel:K().constants.TM.reel));
    B(x-s(20),foot-s(3),s(40)*remaining,2,'#fff0b0');
  }
  if(e.st==='sweep-tell'){
    const end=WX(e.x+f*K().constants.R.sweep.reach),y=WY(e.y);
    B(Math.min(x,end),y-2,Math.abs(end-x),2,'#ff6a50');B(end-1,y-s(34),2,s(34),'#ff6a50');
  }
  if(e.st==='shard-tell' || e.st==='shards'){
    for(let i=e.thrown&&e.st==='shards'?e.thrown:0;i<K().constants.R.shards.n;i++)
      B(x+f*s(24+i*10)-s(3),foot-s(14),s(6),s(4),C.rimeLit);
  }
  return true;
}
function overlay(api){
  const A = st(api) || {};
  FA.vignette(api, '14,8,6', .5);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(235,245,255,${.14 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
}

ART.register(28, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
