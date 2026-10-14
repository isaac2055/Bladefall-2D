/* Room bank: hinged stone arms. Strike the brass hub to turn its arm a quarter turn clockwise.
   hingeArms:[{id:'A',c:12,r:10,length:6,dir:'right'}]. c/r names the pivot tile, included in length.
   The same solid body becomes a floor, wall or ceiling; it blocks light. No refill, recoil or lift.
   Only the destination pose is tested, not the drawn sweep. An occupied destination jams safely.
   All attempt state stays on entities. Registration precedes beam tracing, including the reset trace. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore,TILE=8;
const DIRS=Object.freeze(['right','down','left','up']);
const HK=Object.freeze({pulse:16,jam:24});
const arms=g=>g.ents.filter(e=>e.type==='hingeArm');
function pose(e,dir=e.dir){
 const n=e.length*TILE,x=e.pivotX,y=e.pivotY;
 switch(dir){
  case 'right':return {x,y,w:n,h:TILE};
  case 'down':return {x,y,w:TILE,h:n};
  case 'left':return {x:x-n+TILE,y,w:n,h:TILE};
  case 'up':return {x,y:y-n+TILE,w:TILE,h:n};
  default:throw new Error('Unknown hinge direction: '+dir);
 }
}
function nextDir(g,e){return DIRS[(DIRS.indexOf(e.dir)+(g.flipped?3:1))%4];}
function obstruction(g,e,b){
 const Core=C(),p=g.p;
 if(b.x<0||b.y<0||b.x+b.w>g.room.w||b.y+b.h>g.room.h)return 'edge';
 const hit=Core.blockerAt(g,b.x,b.y,b.w,b.h,e);
 if(hit)return typeof hit==='object'?(hit.type==='hingeArm'?'arm':'solid'):'rock';
 if((g.players||[p]).some(p=>p.state!=='dead'&&p.state!=='respawn'&&Core.overlap(b.x,b.y,b.w,b.h,p.x,p.y,p.w,p.h)))return 'knight';
 if(g.ents.some(q=>q.type==='lantern'&&!q.returning&&Core.overlap(b.x,b.y,b.w,b.h,q.x,q.y,q.w,q.h)))return 'lantern';
 return null;
}
function reset(g){
 const defs=g.room.def.hingeArms||[],seen=new Set();
 for(const [i,d] of defs.entries()){
  const label=String(d.id??String.fromCharCode(65+i));
  if(seen.has(label)||!Number.isInteger(d.c)||!Number.isInteger(d.r)||!Number.isInteger(d.length)||d.length<2||!DIRS.includes(d.dir)){
   throw new Error('Room '+g.room.id+': invalid hinge arm '+label+' (unique id, integer c/r/length >= 2 and right/down/left/up required)');
  }
  seen.add(label);
  const e={type:'hingeArm',dev:true,solid:true,id:'hinge:'+label,label,group:i,pivotX:d.c*TILE,pivotY:d.r*TILE,
   length:d.length,dir:d.dir,state:d.dir,pulse:0,jam:0,jamReason:null,turns:0,remX:0,remY:0};
  Object.assign(e,pose(e));g.ents.push(e);
 }
 for(const e of arms(g)){
  const why=obstruction(g,e,e);
  if(why)throw new Error('Room '+g.room.id+': hinge '+e.label+' starts overlapping '+why);
 }
}
function before(g){for(const e of arms(g)){if(e.pulse>0)e.pulse--;if(e.jam>0)e.jam--;}}
function after(g){
 const p=g.p,Core=C();
 if(p.state==='dead'||p.state==='respawn'||p.strikeTimer<=0||p.strikeHit.has('hinge:stroke'))return;
 const sb=Core.strikeBox(p);
 const hits=arms(g).filter(e=>Core.overlap(...sb,e.pivotX-2,e.pivotY-2,12,12));
 if(!hits.length)return;
 // One hub per swing, even while the blade stays out; a jam also consumes this swing's contact.
 hits.sort((a,b)=>Math.hypot(a.pivotX+4-p.x-4,a.pivotY+4-p.y-5)-Math.hypot(b.pivotX+4-p.x-4,b.pivotY+4-p.y-5));
 const e=hits[0],dir=nextDir(g,e),b=pose(e,dir),why=obstruction(g,e,b);
 p.strikeHit.add('hinge:stroke');p.strikeHit.add(e.id);
 if(why){e.jam=HK.jam;e.jamReason=why;Core.emit(g,'hinge-jam',{x:e.pivotX+4,y:e.pivotY+4,label:e.label,dir,reason:why});return;}
 const from=e.dir;Object.assign(e,b);e.dir=dir;e.state=dir;e.turns++;e.pulse=HK.pulse;e.jam=0;e.jamReason=null;
 for(const rider of g.players||[p])if(rider.onGround&&!Core.onGroundCheck(g,rider))rider.onGround=false;
 Core.emit(g,'hinge-turn',{x:e.pivotX+4,y:e.pivotY+4,label:e.label,from,dir});
}
function mirror(g){
 // Gravity already mirrored the body's bbox. Reflect its private hub and physical direction too.
 for(const e of arms(g)){
  e.pivotY=g.room.h-e.pivotY-TILE;
  if(e.dir==='up')e.dir='down';else if(e.dir==='down')e.dir='up';
  e.state=e.dir;Object.assign(e,pose(e));
 }
}
const dev={name:'hinge',reset,before,after,afterPlayer:after,mirror};
const devices=root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[];
const beam=devices.findIndex(d=>d.name==='beam');
if(beam<0)devices.push(dev);else devices.splice(beam,0,dev);
root.BladefallPrecisionHinge=Object.freeze({HK,DIRS,arms,pose,nextDir,obstruction});
})(typeof window!=='undefined'?window:globalThis);
