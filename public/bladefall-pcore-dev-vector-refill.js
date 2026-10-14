/* Precision Core — directional crystals (room-bank experiment, 7.286).
   vectorRefills:[{c,r,dir:'up'|'down'|'left'|'right',once:false}]
   An ordinary-sized refill that accepts only motion along its arrow (>4 px/s). Any movement counts:
   a jump, fall, run, fling or dash. Other approaches pass through without consuming the crystal.
   Legal collection has the ordinary crystal's dash/stamina refill, hit stop and recharge timing. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore,TILE=8;
const VK=Object.freeze({minSpeed:4});
const DIR=Object.freeze({up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]});
function reset(g){
 (g.room.def.vectorRefills||[]).forEach((d,i)=>{
  const dir=DIR[d.dir];if(!dir)throw new Error('vectorRefills['+i+']: expected up, down, left or right');
  g.ents.push({type:'vectorRefill',dev:true,solid:false,id:'vr'+i,x:d.c*TILE,y:d.r*TILE,w:8,h:8,
   dx:dir[0],dy:dir[1],timer:0,once:!!d.once,spent:false});
 });
}
function before(g){
 for(const e of g.ents)if(e.type==='vectorRefill'&&e.timer>0&&!e.spent&&--e.timer===0)C().emit(g,'refill-back',{x:e.x+4,y:e.y+4});
}
const accepts=(e,p)=>p.vx*e.dx+p.vy*e.dy>VK.minSpeed;
function after(g){
 const Core=C(),p=g.p;if(p.state==='dead'||p.state==='respawn')return;
 for(const e of g.ents){
  if(e.type!=='vectorRefill'||e.spent||e.timer!==0||!accepts(e,p)||!Core.overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h))continue;
  const a=Core.refillDash(g,p),b=p.stamina<Core.K.climbTired;
  if(!a&&!b)continue;
  p.stamina=Core.K.climbMaxStamina;e.timer=Core.K.refillRespawnFrames;e.spent=e.once;g.freeze=2;
  Core.emit(g,'refill',{x:e.x+4,y:e.y+4});
  Core.emit(g,'vector-refill',{x:e.x+4,y:e.y+4,dx:e.dx,dy:e.dy,once:e.once});
 }
}
function mirror(g){for(const e of g.ents)if(e.type==='vectorRefill')e.dy=-e.dy;}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'vector-refill',reset,before,after,afterPlayer:after,mirror});
root.BladefallPrecisionVectorRefill=Object.freeze({VK,accepts});
})(typeof window!=='undefined'?window:globalThis);
