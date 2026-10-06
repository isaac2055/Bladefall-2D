/* Precision Core — Oren's relay (7.254, bonus demonstration levels): a companion you send and hold.

   Room def `companion:{delay}` (default 20 frames). Oren walks your exact path a little behind you, so he
   can go anywhere you have been. The portal key tells him to hold: he stops where he stands. Holding, he
   presses a plate as the lantern would, his shoulders are a step you can stand on (from above only), and a
   hostile bolt that reaches him breaks on his shield. Press the key again and he walks on — along your path,
   at a run, until he is back behind you. If you die, he is back at the start with you.
   (7.255 fixes, made while building the bonus set: told to hold while he is in the air — partway along one of
   your jumps — he walks on along your path and takes hold where his feet first find ground, and if that ground
   goes from under him he walks on again, so he never hangs in the air as a step. Left waiting while you stand
   still, he finishes the jump or fall he was in rather than hovering. And he no longer walks through a held
   door that has shut behind you, or anything else solid: he waits at it.) */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const RK=Object.freeze({delay:20,run:3});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
// Ground under his feet (rock, a one-way top, machinery); a wall beside him while he climbs your path.
const grounded=(g,e)=>C().onGroundCheck(g,e);
const walled=(g,e)=>C().solidAt(g,e.x-1,e.y,e.w,e.h)||C().solidAt(g,e.x+1,e.y,e.w,e.h);
// One step along your path, unless it would take him into something solid that he is not already in
// (a held door shut behind you, machinery, a portal that has closed): he waits there instead.
function stepOn(g,R){
 const e=R.e,pt=R.path[R.i+1];if(!pt)return false;
 if(C().solidAt(g,pt.x,pt.y,e.w,e.h)&&!C().solidAt(g,e.x,e.y,e.w,e.h))return false;
 R.i++;if(pt.x!==e.x)e.facing=Math.sign(pt.x-e.x);e.x=pt.x;e.y=pt.y;return true;
}
function reset(g){
 const def=g.room.def;g.relay=null;
 if(!def.companion)return;
 const p=g.p,e={type:'oren',dev:true,x:p.x,y:p.y,w:8,h:11,solid:false,thru:false,presses:false,id:'oren',facing:1};
 g.ents.push(e);
 g.relay={e,delay:def.companion.delay||RK.delay,path:[{x:p.x,y:p.y}],i:0,held:false,settling:false};
}
function before(g,inp){
 const R=g.relay;if(!R)return;
 const Core=C(),p=g.p,e=R.e;
 if(g.buf.portal>0&&p.state!=='dead'&&p.state!=='respawn'){
  g.buf.portal=0;R.held=!R.held;R.settling=R.held;e.presses=false;e.thru=false;
  if(!R.held)Core.emit(g,'oren-go',{x:e.x+4,y:e.y+5});
 }
 let moved=false;
 if(p.state!=='dead'&&p.state!=='respawn'){const last=R.path[R.path.length-1];if(last.x!==p.x||last.y!==p.y){R.path.push({x:p.x,y:p.y});moved=true;}}
 // Told to hold, he plants only on ground: in the air he walks on along your path until his feet find some.
 // If the ground goes from under him while he holds (machinery, a spent foothold), he walks on the same way.
 if(R.held&&!R.settling&&!grounded(g,e)){R.settling=true;e.presses=false;e.thru=false;}
 if(R.held&&R.settling){
  if(!grounded(g,e))stepOn(g,R);
  if(grounded(g,e)){R.settling=false;e.presses=true;Core.emit(g,'oren-hold',{x:e.x+4,y:e.y+5});}
 }
 // Held, his shoulders are a one-way step; he may not take hold inside the knight.
 if(R.held&&!R.settling&&!e.thru&&!overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h))e.thru=true;
 if(!R.held){
  // Walk the path: never closer than `delay` points behind the knight; faster when he has fallen back.
  const target=Math.max(0,R.path.length-1-R.delay);
  const steps=R.i<target-R.delay?RK.run:1;
  for(let k=0;k<steps&&R.i<target;k++)if(!stepOn(g,R))break;
  // Waiting on you in mid-air (you stopped soon after a jump), he finishes the arc instead of hovering.
  if(!moved&&R.i>=target&&!grounded(g,e)&&!walled(g,e))stepOn(g,R);
 }
 // A hostile bolt breaks on him while he holds.
 if(R.held&&!R.settling&&g.bolts)for(const b of g.bolts)if(b.alive&&!b.friendly&&overlap(b.x,b.y,b.w,b.h,e.x,e.y,e.w,e.h)){b.alive=false;Core.emit(g,'guard-block',{x:b.x+3,y:b.y+3});}
}
function mirror(g){const R=g.relay;if(!R)return;for(const s of R.path)s.y=184-s.y-11;}   // his own body is mirrored with the other entities
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'relay',reset,before,mirror});
root.BladefallPrecisionRelay=Object.freeze({RK});
})(typeof window!=='undefined'?window:globalThis);
