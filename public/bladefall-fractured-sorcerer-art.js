/* Bladefall — ACT THREE · The Fractured Sorcerer's art (2026-09-24).

   The White Court lit and empty: white stone gone grey, tall panes of glass with nothing behind them,
   every door open. What you must read: the emitters (a blue eye that drips or fires on its beat), the
   slate (pale, rune-lit), the condensers (glass vessels that flash when the cold comes home), the
   bridge (ice while it is fed, a dashed ghost while it thaws, flickering just before it goes), the
   band of slate high on the gallery wall, and the Mirror: a glass figure that shows where it will cast,
   cracks when its ward breaks, and wears a ring of panes (on its perch) or none (on the floor). */
(function installFracturedSorcererArt(root){
'use strict';
const ART = root.BladefallActTwoArt, FA = root.BladefallFractured && root.BladefallFractured.art;
if(!ART || !ART.register || !FA) return;

const C = {
  sky:['#070910', '#0e1320', '#161d2e', '#1f2638'],
  hall0:'#0b0f18', hall1:'#121826', pane:'rgba(160,200,230,.10)', paneLit:'rgba(200,230,255,.22)',
  stone0:'#1c2230', stone1:'#2c3446', stoneLit:'#56627a', white:'#9aa6ba',
  slate1:'#5a6272', slateLit:'#8a94a8', rune:'159,214,255',
  ice0:'#7fa6c0', ice1:'#b8d8ea', iceLit:'#eaf6ff', cold:'170,220,255',
  iron:'#4a5060', ironLit:'#8a92a8', glass:'#bcd8ec', glassLit:'#f2faff', glassDark:'#56708a',
};
const K = () => root.BladefallFracturedSorcerer;
function st(api){ const A = api.G && api.G.actTwo; return A && A.stage === 29 ? A : null; }

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
  FA.sky(api, C.sky, 'fws');
  const horizon = Math.round(api.groundBy - 20 + api.camYb * .2);
  const { B, bw, Z } = api;
  // The Court's halls: tall panes of glass in stone frames, in two depths, all of them empty.
  for(const [par, col, spacing, h, seed] of [[.16, C.hall0, 170, 300, 3], [.32, C.hall1, 120, 220, 9]]){
    const half = bw / (2 * Z);
    const w0 = (-bw / 2) / (Z * par) + api.camX + half, w1 = (bw / 2) / (Z * par) + api.camX + half;
    B(0, horizon - h - 30, bw, h + 90, col);
    for(let k = Math.floor(w0 / spacing) - 1; k <= Math.ceil(w1 / spacing) + 1; k++){
      const x = Math.round((k * spacing - api.camX - half) * Z * par + bw / 2), pw = Math.round(spacing * par * .45);
      B(x - pw / 2, horizon - h, pw, h - 20, C.pane);
      for(let r = 0; r < pw / 2; r++) B(x - pw / 2 + r, horizon - h - Math.round(Math.sqrt(Math.max(0, (pw / 2) * (pw / 2) - (pw / 2 - r) * (pw / 2 - r)))), pw - r * 2, 1, C.pane);   // the arch
      if(api.hash(k, seed) > .6) B(x - pw / 2 + 2, horizon - h + 10, 2, h - 40, C.paneLit);
    }
  }
  FA.ash(api, 'rgba(210,230,255,.14)');
}
function span(api, o){
  const x0 = Math.max(-4, api.WX(o.x - o.w / 2)), x1 = Math.min(api.bw + 4, api.WX(o.x + o.w / 2));
  return { x0, x1, w:x1 - x0, y:api.WY(o.y), floor:o.deep ? api.bh + 2 : Math.min(api.bh + 2, api.WY(o.y - (o.h || 14))) };
}
function slateTop(api, s){
  const { B } = api;
  B(s.x0, s.y - 1, s.w, 5, C.slate1); B(s.x0, s.y - 1, s.w, 1, C.slateLit);
  for(let x = s.x0 + 4; x < s.x1 - 4; x += 11) B(x, s.y + 1, 5, 1, `rgba(${C.rune},${.35 + .2 * Math.sin(api.time * 2 + x * .1)})`);
}
function plat(api, o){
  const { B } = api, s = span(api, o); if(s.w <= 0) return true;
  const base = Math.floor(api.camX * api.Z);
  switch(o.actArt){
    case 'court':
      B(s.x0, s.y, s.w, s.floor - s.y, C.stone0); B(s.x0, s.y, s.w, 4, C.stone1); B(s.x0, s.y, s.w, 1, C.stoneLit);
      for(let x = s.x0 - ((s.x0 + base) % 52); x < s.x1; x += 52) if(x >= s.x0) B(x, s.y + 1, 1, 9, C.hall0);
      FA.seams(api, s, base);
      return true;
    case 'perch':
      B(s.x0, s.y, s.w, s.floor - s.y, C.stone1); B(s.x0, s.y, s.w, 2, C.white);
      return true;
    case 'slate':
      slateTop(api, s);
      return true;
    case 'bridge': {
      if(o.gone){                                   // thawed: a dashed ghost of where it freezes
        for(let x = s.x0; x < s.x1; x += 14) B(x, s.y, 7, 1, `rgba(${C.cold},.28)`);
        return true;
      }
      const flick = o.warn && Math.floor(api.time * 24) % 2 === 0;
      B(s.x0, s.y, s.w, s.floor - s.y, flick ? C.ice0 : C.ice1); B(s.x0, s.y, s.w, 1, C.iceLit);
      const remaining=Math.min(1,(st(api).frozenT||0)/K().constants.GLASS.bridge.hold);
      B(s.x0,s.y+3,s.w*remaining,2,C.glassLit);
      for(let x = s.x0 + 6; x < s.x1; x += 29) B(x, s.y + 2, 9, 1, C.iceLit);
      return true;
    }
  }
  return false;
}
function object(api, o){
  const { B, WX, WY } = api;
  if(o.type === 'wall' && o.actArt){
    const x0 = WX(o.x - o.w / 2), x1 = WX(o.x + o.w / 2), top = WY(o.y), bot = WY(o.y - o.h), w = x1 - x0;
    switch(o.actArt){
      case 'glasswall':
        B(x0, top, w, bot - top, C.stone0); B(x0, top, w, 2, C.stoneLit); B(x0, top, 1, bot - top, C.stone1); B(x1 - 1, top, 1, bot - top, C.stone1);
        return true;
      case 'band':
        B(x0, top, w, bot - top, C.slate1); B(x0, top, w, 2, C.slateLit);
        for(let y = top + 4; y < bot - 3; y += 8) B(x0, y, 2, 4, `rgba(${C.rune},${.45 + .25 * Math.sin(api.time * 2 + y * .1)})`);
        api.glow(x0, (top + bot) / 2, 16, C.rune, .18);
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
    case 'runeEmitter': {
      if(o.actArt !== 'emitter') return false;
      const x = WX(o.x), y = WY(o.y), f = Math.min(1, (o.flash || 0) * 5);
      B(x - 10, y - 10, 20, 20, C.stone1); B(x - 10, y - 10, 20, 2, C.stoneLit);
      B(x - 4, y - 4, 8, 8, `rgba(${C.cold},${.5 + .5 * f})`); api.glow(x, y, 10 + 10 * f, C.cold, .3 + .3 * f);
      return true;
    }
    case 'actCondenser': {
      const x = WX(o.x), top = WY(o.y + o.h), bot = WY(o.y), w = Math.round(o.w * api.Z), f = Math.min(1, (o.flash || 0) * 2);
      B(x - w / 2, top, w, bot - top, 'rgba(180,210,235,.18)'); B(x - w / 2, top, 2, bot - top, C.glass); B(x + w / 2 - 2, top, 2, bot - top, C.glass);
      B(x - w / 2 - 3, bot, w + 6, 4, C.iron); B(x - w / 2 - 3, top - 4, w + 6, 4, C.iron);
      if(f > 0) api.glow(x, (top + bot) / 2, 30, C.cold, .5 * f);
      return true;
    }
    case 'actTunnel': {
      const x = WX(o.x), base = WY(o.y || 0), top = WY((o.y || 0) + o.h);
      for(let r = 0; r < 18; r++){ const w = Math.round(Math.sqrt(1 - Math.pow(r / 18, 2)) * 70); B(x - w - 10, top + r * 4, 10, 4, C.stone1); B(x + w, top + r * 4, 10, 4, C.stone1); }
      api.glow(x, base - 60, 60, '230,240,255', .12);
      return true;
    }
    case 'actFire': { const x = WX(o.x), y = WY(o.y); B(x - 12, y - 3, 24, 3, '#262a34'); B(x - 6, y - 5, 12, 2, C.glassDark); return true; }   // a brazier of blue glass, cold
  }
  return false;
}

/* Conduits show what each condenser controls, even between bolts. */
function world(api){
  const A=st(api); if(!A) return;
  const {B,WX,WY}=api, k=K().constants;
  const bridge=api.G.obstacles.find(o=>o.fwsBridge);
  if(bridge && bridge.gone){
    const left=Math.max(0,WX(bridge.x-bridge.w/2)), right=Math.min(api.bw,WX(bridge.x+bridge.w/2));
    for(let x=left;x<right;x+=14) B(x,WY(0),Math.min(7,right-x),1,C.glassDark);
  }
  for(const [c,toX,toY,on] of [[k.GLASS.condenser,2550,0,A.frozenT>0],[k.GALLERY.condenser,k.GALLERY.wall.x,120,A.portcullis]]){
    const x=WX(c.x+c.w/2+8), y=WY(c.y), end=WX(toX), floor=WY(toY);
    const color=on?C.ice1:C.glassDark;
    B(x,Math.min(y,floor),1,Math.abs(floor-y),color); B(Math.min(x,end),floor,Math.abs(end-x),1,color);
  }
}

/* THE MIRROR: a figure of glass. */
function enemy(api, e){
  if(e.actFoe !== 'mirror') return false;
  const { B, WX, WY } = api, s = n => Math.round(n * api.Z), t = api.time;
  const x = WX(e.x), foot = WY(e.y), f = e.face || -1, h = s(92);
  if(e.st === 'done'){ for(let k = 0; k < 9; k++) B(x - s(30) + k * s(7), foot - 2 - (k % 3), s(5), 2 + (k % 2), k % 2 ? C.glass : C.glassLit); return true; }
  if(e.st === 'blink' && Math.floor(e.t * 20) % 2 === 0) return true;
  const stag = e.st === 'staggered', lean = stag ? Math.round(Math.sin(t * 30) * 2) : 0, top = foot - h;
  // Robe and body of glass, the light running down it; a face that is only a brighter pane.
  for(let r = 0; r < h - s(18); r++){ const w = s(8) + Math.round(r * .14); B(x - w + lean, top + s(18) + r, w * 2, 1, r % 11 === 0 ? C.glassLit : (r + Math.floor(t * 30)) % 23 === 0 ? C.glassLit : C.glass); }
  B(x - s(8) + lean, top, s(16), s(18), C.glass); B(x - s(5) + lean, top + s(4), s(10), s(8), C.glassLit);
  if(stag) for(let k = 0; k < 5; k++) B(x - s(10) + k * s(5) + lean, top + s(20) + ((k * 13) % s(50)), 1, s(18), C.glassDark);   // the crack
  // The cast: its hand raised and the cold gathering in it.
  if(e.st === 'tell' || e.st === 'twin'){
    const A=st(api), ph=K().constants.M.phases[A.phase], origin=K().castOrigin(e);
    const hx=WX(origin.x), hy=WY(origin.y), duration=e.st==='twin'?ph.twin:ph.tell;
    const charge=Math.min(1,e.t/duration);
    api.glow(hx,hy,8+14*charge,C.cold,.6); B(hx-2,hy-2,4,4,C.glassLit);
    B(hx-s(12),hy+s(9),s(24),1,C.glassDark); B(hx-s(12),hy+s(9),s(24)*charge,2,C.glassLit);
    // Raised droplets distinguish a lob; paired lights distinguish the floor's twin cast.
    if(ph.lob) for(let i=1;i<=3;i++) B(hx-s(i*7),hy-s(i*9),2,3,C.ice1);
    if(ph.twin) for(let i=0;i<(e.st==='twin'?1:2);i++) B(hx+s(15+i*7),hy-2,3,4,C.ice1);
  }
  // The ward carries the required return marks: paired mouths, a counter spark, or both.
  if(!stag){
    const phase=st(api).phase, y=top-s(14);
    if(phase!==1) for(const offset of [-10,10]){B(x+s(offset)-3,y,6,1,C.iceLit);B(x+s(offset)-3,y+1,1,5,C.iceLit);B(x+s(offset)+2,y+1,1,5,C.iceLit);B(x+s(offset)-3,y+6,6,1,C.iceLit);}
    if(phase>0){B(x-1,y-2,2,11,C.glassLit);B(x-4,y+2,8,2,C.glassLit);}
  }
  // On its perch it wears a ring of panes; on the floor, none.
  if(e.where === 'perch' && !stag) for(let k = 0; k < 6; k++){ const a = t * .9 + k * 1.047, rx = Math.cos(a) * s(40), ry = Math.sin(a) * s(14);
    B(x + rx - 2, top + s(46) + ry - 5, 4, 10, `rgba(200,230,255,${.25 + .2 * Math.sin(a)})`); }
  return true;
}
function overlay(api){
  const A = st(api) || {};
  FA.vignette(api, '6,8,14', .5);
  const flash = Math.min(1, A.flash || 0);
  if(flash > .02){ api.ctx.fillStyle = `rgba(230,242,255,${.16 * flash})`; api.ctx.fillRect(0, 0, api.bw, api.bh); }
}

ART.register(29, Object.freeze({ draw }));
})(typeof window !== 'undefined' ? window : globalThis);
