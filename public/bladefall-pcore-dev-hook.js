/* Precision Core — Thunder Cliffs (7.254, Part XVI, levels 150–159): hook rings and moving decks.

   Hook ring (glyph O): in the air, hold grab within reach of a ring (56 px, nothing solid between) and
   the chain catches: you swing on it. Holding grab early is fine: the chain catches the moment a ring
   comes into reach. After you let go, the same ring waits for a fresh press of grab. Left and right pump the swing; up hauls the chain in, down pays it
   out. Let go of grab and you fly off at the speed you had, and that sideways speed carries through the
   air until you land. Jump to let go with a little lift; dash to let go and dash at once. A wall within
   reach of your hands wins over a ring: grab climbs.
   Moving deck (room def `decks:[{c,r,w,h,to:[dx,dy],period,phase}]`): a solid platform that runs to
   `to` tiles away and back, forever, easing at each end. It carries whatever stands on it; jump off and
   you keep its speed. Decks start with the room's first input. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8,DT=1/60;
const HK=Object.freeze({reach:56,pump:260,gravity:900,reel:70,minLen:12,maxLen:80,takeUp:32,jumpLift:-90});
function reset(g){
 const def=g.room.def,Core=C();
 def.map.forEach((row,r)=>{for(let c=0;c<(def.cols||Core.COLS);c++)if(row[c]==='O')g.ents.push({type:'ring',dev:true,x:c*TILE,y:r*TILE,w:8,h:8,id:'rg'+g.ents.length});});
 (def.decks||[]).forEach((d,i)=>g.ents.push({type:'deck',dev:true,solid:true,x:d.c*TILE,y:d.r*TILE,w:d.w*TILE,h:(d.h||1)*TILE,ox:d.c*TILE,oy:d.r*TILE,
  dx:d.to[0]*TILE,dy:d.to[1]*TILE,period:d.period||180,phase:d.phase||0,remX:0,remY:0,clock:0,id:'dk'+i}));
 g.p.hook=null;g.p.lastRing=null;g.decksAwake=false;
}
function clear(g,x0,y0,x1,y1){const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/3);for(let i=1;i<n;i++)if(C().solidAt(g,x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,1,1))return false;return true;}
function ringFor(g,p,skip){
 let best=null,bd=HK.reach+1;const cx=p.x+4,cy=p.y+4;
 for(const e of g.ents){if(e.type!=='ring'||e===skip)continue;const d=Math.hypot(e.x+4-cx,e.y+4-cy);if(d<bd&&clear(g,cx,cy,e.x+4,e.y+4)){bd=d;best=e;}}
 return best?{ring:best,len:Math.max(HK.minLen,bd)}:null;
}
function release(g,p,why){
 if(p.hook?.ring.movingHook)root.BladefallPrecisionMovingHook?.release(g,p,why);
 p.lastRing=p.hook&&p.hook.ring;p.hook=null;p.state='normal';p.coast=true;p.fling=false;p.maxFall=Math.max(p.maxFall,C().K.maxFall);
 C().emit(g,'unhook',{x:p.x+4,y:p.y+4,why});
}
function before(g,inp){
 const Core=C(),p=g.p;
 // Decks move on their own clock, which starts with the room's first input.
 if(!g.decksAwake&&g.awake&&(inp.mx||inp.my||inp.jump||inp.dash||inp.grab||inp.strike||inp.parry||inp.portal))g.decksAwake=true;
 for(const e of g.ents){
  if(e.type!=='deck')continue;
  if(g.decksAwake)e.clock++;
  const u=((e.clock+e.phase)%e.period)/e.period,k=u<.5?u*2:2-u*2,ease=k*k*(3-2*k);
  const nx=e.ox+e.dx*ease,ny=e.oy+e.dy*ease;Core.moveSolid(g,e,nx-(e.x+e.remX),ny-(e.y+e.remY));
 }
 if(p.state==='dead'||p.state==='respawn'){p.hook=null;return;}
 if(p.state==='hook'){
  if(g.buf.dash>0&&p.dashes>0){release(g,p,'dash');return;}
  if(g.buf.jump>0){g.buf.jump=0;release(g,p,'jump');p.vy=Math.min(p.vy,0)+HK.jumpLift;Core.emit(g,'jump',{x:p.x+4,y:p.y+p.h});return;}
  if(!inp.grab){release(g,p,'let-go');return;}
  return;
 }
 // Catch a ring: in the air, grab held, hands free, no wall to hold. A fresh press may take any ring;
 // a held grab takes any ring but the one just let go.
 if(g.buf.grab>0)p.lastRing=null;
 if(inp.grab&&p.state==='normal'&&!p.onGround&&!p.carrying&&!Core.solidAt(g,p.x+p.facing*2,p.y,p.w,p.h-3)){
  const h=ringFor(g,p,p.lastRing);
  if(h){g.buf.grab=0;g.buf.jump=0;g.buf.dash=0;p.hook=h;p.state='hook';p.varJump=0;p.autoJump=false;p.fling=p.coast=false;Core.emit(g,'hook',{x:h.ring.x+4,y:h.ring.y+4,fx:p.x+4,fy:p.y+4});}
 }
}
function forces(g,p,inp){
 if(p.state!=='hook'||!p.hook||p.hook.ring.movingHook)return;
 const h=p.hook,rx=h.ring.x+4,ry=h.ring.y+4;
 // Reel in or pay out.
 if(inp.my<0)h.len=Math.max(HK.minLen,h.len-HK.reel*DT);else if(inp.my>0)h.len=Math.min(HK.maxLen,h.len+HK.reel*DT);
 // Gravity, pumping, then the chain: never farther than its length. The chain winds in its own slack
 // (down to takeUp px), so swinging in close shortens it rather than leaving it loose to snap taut.
 p.vy+=HK.gravity*DT;
 let dx=p.x+4-rx,dy=p.y+4-ry,d=Math.hypot(dx,dy)||1;
 if(d<h.len&&!(inp.my>0))h.len=Math.max(Math.min(h.len,HK.takeUp),d);const ux=dx/d,uy=dy/d;
 if(inp.mx)p.vx+=inp.mx*HK.pump*DT*Math.abs(uy);   // pumping pushes along the swing, strongest at the bottom
 const out=p.vx*ux+p.vy*uy;if(d>=h.len-.01&&out>0){p.vx-=out*ux;p.vy-=out*uy;}
 // Pull back onto the circle if the step would carry us past it.
 const nx=dx+p.vx*DT,ny=dy+p.vy*DT,nd=Math.hypot(nx,ny);
 if(nd>h.len){const k=h.len/nd;const cx=nx*k-dx,cy=ny*k-dy;p.vx=cx/DT;p.vy=cy/DT;}
 if(p.vx)p.facing=Math.sign(p.vx);
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'hook',reset,before,forces});
root.BladefallPrecisionHook=Object.freeze({HK,ringFor,release});
})(typeof window!=='undefined'?window:globalThis);
