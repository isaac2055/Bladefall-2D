/* Precision Core — the zipline (7.280): the Void Tyrant's rideable seam, in Precision Core units.

   The main game's seam (index.html, Seam/updateSeams) is a tear you DASH into. It carries you along its length
   and puts you out of the far end with your dash back. A dash and not a touch: entering one costs the
   thing it gives back, so a chain of tears is only free if every entry is clean.

   Room field `lines:[{a:[c,r], b:[c,r], setDown, oneWay, once, period, upT, phase}]`, tile coordinates.
   Each end is a mouth. The mouth point is where the knight's body sits standing on the floor below tile
   (c,r): put a mouth on the tile just above a ledge and the ride lands you standing on that ledge.
    - Dash with the knight's centre within 10 px across / 12 px up or down of a mouth: you ride to the other
      end at 400 px/s (1.7x a dash). Any dash that does not point away from the tear counts (into it, along it,
      straight up or down at it), so standing at a mouth and dashing toward the tear takes it, and dashing on from a
      landing (away from the tear you came along) does not take you back.
    - Riding, you are untouchable by thorns, and no input steers you. A dash pressed in the last frames is
      buffered and fires as you come out.
    - At the far end you get the dash back. A level or falling ride throws you on along the line at 220 px/s,
      and that sideways speed carries for 24 frames (no air drag) unless you press back. A climbing ride (it
      rises more than a quarter of its length) keeps a third of that sideways and only enough lift (110) to
      clear the lip. setDown:true sets you down with a 30 px/s nudge instead (a perch landing).
    - oneWay:true takes you from a to b only. Otherwise either end is a mouth, so a tear can bring you back.
    - once:true spends the tear after one ride (until a retry). period/upT/phase (frames) make it blink: open
      while (roomFrame+phase)%period < upT (upT defaults to half the period).
   When two mouths are in reach (a chain's landing perch), the tear you did not just ride wins.
   Lines are plain data in g.ents (type 'zipline'), so the route search's state key sees them, and they turn
   over with a gravity prism (mirror hook). Lines must not run through rock: the ride ignores it, and only the
   landing point is checked (nudged up to a tile clear). */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8;
const ZK=Object.freeze({mouthX:10,mouthY:12,speed:400,exit:220,climbKeep:.35,climbLift:-110,setDown:30,coast:24,pulse:14});
const SAFE=()=>true;   // thorns cannot touch a riding knight (shared, so a saved game state can keep it by reference)
const centre=(c,r)=>({x:c*TILE+4,y:r*TILE+2.5});   // knight's centre standing on the floor below tile (c,r)
// 7.280 fix: a room with a tide already has a thorn rule (the tide drowns thorns), so a ride must take it over for its
// length and hand the tide's rule back after (before this, riders in tide rooms died on thorns the tear crossed).
function spikesBack(g){const t=g.water&&g.water.tide,W=root.BladefallPrecisionWater;
 g.spikeSafe=t&&W?((c,r)=>c>=t.c0&&c<=t.c1&&r*TILE>=W.surfaceY(g)):null;}

function reset(g){
 const lines=g.room.def.lines;
 if(!lines||!lines.length)return;
 lines.forEach((L,i)=>{
  const A=centre(L.a[0],L.a[1]),B=centre(L.b[0],L.b[1]);
  const x=Math.min(A.x,B.x)-4,y=Math.min(A.y,B.y)-6;
  g.ents.push({type:'zipline',dev:true,solid:false,x,y,w:Math.abs(A.x-B.x)+8,h:Math.abs(A.y-B.y)+12,id:'zl'+i,li:i,
   ax:A.x,ay:A.y,bx:B.x,by:B.y,setDown:!!L.setDown,oneWay:!!L.oneWay,once:!!L.once,
   period:L.period||0,upT:L.upT??((L.period||0)>>1),phase:L.phase||0,spent:false,pulse:0,state:''});
 });
}
function openNow(g,e){
 if(e.spent)return false;
 if(!e.period)return true;
 return ((g.roomFrame+e.phase)%e.period)<e.upT;
}
function lineEnts(g){return g.ents.filter(e=>e.type==='zipline');}

/* The ride: placed directly along the tear each frame (before the core moves anything). */
function before(g,inp,actorOnly=false){
 const p=g.p,Core=C();
 if(p.zipCoast>0&&--p.zipCoast===0)p.coast=false;
 // A ride carried into another room (The Climb hands the knight's whole state across a seam) ends there as a
 // throw along the line; a ride state with no ride is plain ground state again.
 if(p.state==='ride'&&(!p.ride||p.ride.room!==g.room.id)){
  const R=p.ride;p.ride=null;p.state='normal';
  if(R){p.vx=R.dx*ZK.exit;p.vy=R.dy*ZK.exit;if(Math.abs(p.vx)>Core.K.maxRun){p.coast=true;p.zipCoast=ZK.coast;}p.dashCooldown=0;Core.refillDash(g,p);}
  if(g.spikeSafe===SAFE)spikesBack(g);
  return;
 }
 if(p.ride&&p.state!=='ride')p.ride=null;
 let any=false;
 for(const e of g.ents){if(e.type!=='zipline')continue;any=true;if(!actorOnly&&e.pulse>0)e.pulse--;e.state=e.spent?'spent':openNow(g,e)?'':'shut';}
 if(!any)return;
 const R=p.ride;
 if(!R)return;
 if(!g.players)g.spikeSafe=SAFE;   // every frame of the ride (a restored search state rebinds the tide's rule)
 g.buf.strike=0;g.buf.grab=0;if(g.buf.portal!==undefined)g.buf.portal=0;
 R.t++;
 if(R.t<R.n){
  const k=R.t/R.n;
  p.x=Math.round(R.fx+(R.tx-R.fx)*k-4);p.y=Math.round(R.fy+(R.ty-R.fy)*k-5.5);p.remX=p.remY=0;
  return;
 }
 // Out of the far mouth.
 const e=g.ents.find(q=>q.type==='zipline'&&q.li===R.li);
 p.ride=null;p.state='normal';p.remX=p.remY=0;
 p.x=Math.round(R.tx-4);p.y=Math.round(R.ty-5.5);
 for(let i=1;i<=TILE&&Core.solidAt(g,p.x,p.y,p.w,p.h);i++)p.y--;
 const climbing=R.dy<-0.25;
 if(e&&e.setDown){p.vx=Math.sign(R.dx)*ZK.setDown;p.vy=0;}
 else if(climbing){p.vx=R.dx*ZK.exit*ZK.climbKeep;p.vy=ZK.climbLift;}
 else{p.vx=R.dx*ZK.exit;p.vy=R.dy*ZK.exit;}
 if(Math.abs(p.vx)>Core.K.maxRun){p.coast=true;p.zipCoast=ZK.coast;}
 if(R.dx)p.facing=Math.sign(R.dx);
 p.maxFall=Math.max(Core.K.maxFall,p.vy);p.varJump=0;p.autoJump=false;
 p.dashCooldown=0;p.dashRefillCooldown=0;Core.refillDash(g,p);
 if(g.spikeSafe===SAFE)spikesBack(g);
 p.zipLast=R.li;
 if(e){if(e.once)e.spent=true;e.pulse=ZK.pulse;}
 Core.emit(g,'zip-out',{x:p.x+4,y:p.y+6,dx:R.dx,dy:R.dy,li:R.li});
}
/* While riding the core must not move the knight: his speed reads as the ride's (the view's pose and any
   speed-aware device), with remainders set so the core's move nets to nothing. */
function forces(g,p){
 const R=p.ride;if(p.state!=='ride'||!R)return;
 const DT=C().DT;p.vx=R.dx*ZK.speed;p.vy=R.dy*ZK.speed;p.remX=-(p.vx*DT);p.remY=-(p.vy*DT);p.pushX=0;
}
/* A dash that passes a mouth is taken (checked after the core has moved the knight this frame). */
function after(g){
 const p=g.p;if(p.state!=='dash'||p.dashAim)return;
 const ls=lineEnts(g);if(!ls.length)return;
 const cx=p.x+4,cy=p.y+5.5;let best=null;
 for(const e of ls){
  if(!openNow(g,e))continue;
  for(const end of e.oneWay?[0]:[0,1]){
   const mx=end?e.bx:e.ax,my=end?e.by:e.ay,ox=end?e.ax:e.bx,oy=end?e.ay:e.by;
   if(Math.abs(cx-mx)>ZK.mouthX||Math.abs(cy-my)>ZK.mouthY)continue;
   // A dash pointing away from the tear does not go in (so you can dash on from a landing).
   const L=Math.hypot(ox-mx,oy-my)||1;if((p.dashDir.x*(ox-mx)+p.dashDir.y*(oy-my))/L<-0.01)continue;
   const score=(e.li===p.zipLast?1000:0)+Math.hypot(cx-mx,cy-my);
   if(!best||score<best.score)best={e,end,score};
  }
 }
 if(!best)return;
 const e=best.e,fx=best.end?e.bx:e.ax,fy=best.end?e.by:e.ay,tx=best.end?e.ax:e.bx,ty=best.end?e.ay:e.by;
 const len=Math.hypot(tx-fx,ty-fy)||1;
 p.ride={li:e.li,room:g.room.id,fx,fy,tx,ty,dx:(tx-fx)/len,dy:(ty-fy)/len,t:0,n:Math.max(2,Math.ceil(len/(ZK.speed*C().DT)))};
 p.state='ride';p.dashTimer=0;p.ducking=false;p.vx=0;p.vy=0;p.remX=p.remY=0;p.varJump=0;p.autoJump=false;p.coast=p.fling=false;p.zipCoast=0;
 p.x=Math.round(fx-4);p.y=Math.round(fy-5.5);
 if(!g.players)g.spikeSafe=SAFE;
 e.pulse=ZK.pulse;
 C().emit(g,'zip-in',{x:fx,y:fy,tx,ty,li:e.li});
}
function mirror(g){
 const H=g.room.h||184;
 for(const e of g.ents)if(e.type==='zipline'){e.ay=H-e.ay;e.by=H-e.by;}
 for(const p of g.players||[g.p]){const R=p.ride;if(R){R.fy=H-R.fy;R.ty=H-R.ty;R.dy=-R.dy;}}
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'zipline',reset,before,beforePlayer:(g,inp)=>before(g,inp,true),forces,after,afterPlayer:after,mirror});
root.BladefallPrecisionZipline=Object.freeze({ZK,openNow});
})(typeof window!=='undefined'?window:globalThis);
