/* Precision Core — Frostfell (7.254, Part VIII, levels 83–90): ice, wind and the frost feather.

   Ice (glyph I): solid rock that barely grips. On ice you gather speed and lose it slowly (an eighth of the
   usual traction), so a dash's speed carries a long way and stopping takes planning.
   Wind (room def `winds:[{c,r,w,h,dx,dy}]`, tiles; dx/dy in px/s): inside the box the knight and the
   lantern drift by that speed on top of whatever they are doing, except while holding a wall.
   Frost feather (glyph f, the precision mirror of Frostfell's double jump): touch it and you carry one
   jump in the air. Press jump off the ground (and away from a wall) to spend it. It melts when your feet
   touch the ground, so it only ever lasts one flight. Like a crystal it grows back after 2.5 s, and it
   ignores you while you already carry one. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8,COLS=40,ROWS=23,DT=1/60;
const FK=Object.freeze({ice:.125,featherBack:150});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;

function reset(g){
 const def=g.room.def,Core=C(),room=g.room;
 // Rooms may be larger than one screen (merge pitches); the defaults stay 40x23.
 const COLS=room.cols||40,ROWS=room.rows||23;
 room.ice=room.ice||new Uint8Array(COLS*ROWS);
 def.map.forEach((row,r)=>{for(let c=0;c<COLS;c++)if(row[c]==='I'){room.grid[r*COLS+c]=Core.SOLID;room.ice[r*COLS+c]=1;}});
 g.winds=(def.winds||[]).map(w=>({x:w.c*TILE,y:w.r*TILE,w:w.w*TILE,h:w.h*TILE,dx:w.dx||0,dy:w.dy||0}));
 def.map.forEach((row,r)=>{for(let c=0;c<COLS;c++)if(row[c]==='f')g.ents.push({type:'feather',dev:true,x:c*TILE,y:r*TILE,w:8,h:8,timer:0,id:'fe'+g.ents.length});});
 g.p.airJumps=0;
}
function onIce(g,p){
 const room=g.room;if(!room.ice)return false;
 const COLS=room.cols||40,ROWS=room.rows||23;
 if(p.y+p.h>=ROWS*TILE)return false;
 const r=(p.y+p.h)/TILE;if(r!==Math.floor(r))return false;
 const c0=Math.floor(p.x/TILE),c1=Math.floor((p.x+p.w-1)/TILE);
 for(let c=c0;c<=c1;c++)if(room.ice[r*COLS+c])return true;
 return false;
}
function windAt(g,x,y,w,h){let dx=0,dy=0;for(const z of g.winds||[])if(overlap(x,y,w,h,z.x,z.y,z.w,z.h)){dx+=z.dx;dy+=z.dy;}return [dx,dy];}

function before(g,inp){
 const p=g.p,Core=C();
 // Traction is read by the core's run code this frame.
 p.traction=onIce(g,p)?FK.ice:1;
 for(const e of g.ents){
  if(e.type!=='feather')continue;
  if(e.timer>0){if(--e.timer===0)Core.emit(g,'feather-back',{x:e.x+4,y:e.y+4});continue;}
  if(p.state!=='dead'&&!(p.airJumps>0)&&overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h)&&!p.onGround){
   p.airJumps=1;e.timer=FK.featherBack;Core.emit(g,'feather',{x:e.x+4,y:e.y+4});
  }
 }
 if(p.onGround&&p.airJumps>0){p.airJumps=0;Core.emit(g,'feather-melt',{x:p.x+4,y:p.y+p.h});}
}
function forces(g,p,inp){
 if(!g.winds||!g.winds.length||p.state==='climb')return;
 const [dx,dy]=windAt(g,p.x,p.y,p.w,p.h);
 if(dx)p.pushX=(p.pushX||0)+dx*DT;
 if(dy){p.windRemY=(p.windRemY||0)+dy*DT;const n=Math.round(p.windRemY);if(n){p.windRemY-=n;C().moveY(g,p,n,(b,s)=>{});}}
}
function airJump(g,p,inp){
 if(p.airJumps>0&&!p.carrying&&p.state==='normal'){
  p.airJumps=0;C().jump(g,p,inp);C().emit(g,'feather-jump',{x:p.x+4,y:p.y+p.h});return true;
 }
}
function after(g){
 if(!g.winds||!g.winds.length)return;
 const Core=C();
 for(const e of g.ents){
  if(e.type!=='lantern'||e.held||e.returning)continue;
  const [dx,dy]=windAt(g,e.x,e.y,e.w,e.h);
  if(dx)Core.moveX(g,e,dx*DT);if(dy)Core.moveY(g,e,dy*DT);
 }
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'frost',reset,before,forces,airJump,after});
root.BladefallPrecisionFrost=Object.freeze({FK,onIce,windAt});
})(typeof window!=='undefined'?window:globalThis);
