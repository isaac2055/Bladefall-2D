/* Precision Core — void stone (7.255, bonus demonstration levels): the gate walls' abyss, made a device.

   Void stone (glyph V, a rectangle; touching blocks join): solid to everything — you stand on it, the
   lantern rests on it, a thrown stone stops on it. But a dash that meets it does not stop: the knight
   goes into the void and travels straight on at dash speed, the way he was dashing, with no gravity and
   no steering, until he comes out of the far side. Coming out gives the dash back and keeps the speed
   (a sideways exit carries like a fling; an upward exit throws you high), and off a level or downward
   exit a jump pressed inside or just after — six frames' grace — jumps off the void's edge as if from
   the ground. Thorns treat a travelling knight like any other: pointing the way he goes, they are safe.
   Anything solid in the way while inside (rock, the room's edge, a shut gate) is fatal: the void does
   not let go of a knight it cannot carry through. Adjoining void stones are one passage. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const VK=Object.freeze({speed:240,grace:6});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
function reset(g){
 g.voidTravel=null;g.voidGrace=0;
 for(const b of C().groupsOf(g.room.def,'V'))g.ents.push({type:'void',dev:true,solid:true,x:b.x,y:b.y,w:b.w,h:b.h,id:'void'+g.ents.length});
}
const state=(g,p=g.p)=>g.players?p:g;
const voids=g=>g.ents.filter(e=>e.type==='void');
const inVoid=(g,p)=>voids(g).some(e=>overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h));
/* A dash meets a void stone: in you go. */
function dashHit(g,p,b){
 if(b.type!=='void'||p.state!=='dash')return false;
 const d=p.dashDir;
 state(g,p).voidTravel={vx:d.x*VK.speed,vy:d.y*VK.speed,rx:0,ry:0,entered:false,dashTimer:p.dashTimer};
 p.state='void';p.dashTimer=0;p.vx=0;p.vy=0;p.remX=p.remY=0;p.ducking=false;p.varJump=0;
 C().emit(g,'void-in',{x:p.x+4,y:p.y+6,dx:d.x,dy:d.y});
 return true;
}
function before(g){
 const p=g.p,S=state(g,p),V=S.voidTravel;
 if(S.voidGrace>0)S.voidGrace--;
 if(!V)return;
 if(p.state!=='void'){S.voidTravel=null;return;}
 const Core=C(),vs=voids(g);
 // Strikes, grabs and portal shots are swallowed by the dark; a dash or jump pressed inside is buffered
 // as usual and lands on the frame you come out.
 g.buf.strike=0;g.buf.grab=0;if(g.buf.portal!==undefined)g.buf.portal=0;
 V.rx+=V.vx*Core.DT;V.ry+=V.vy*Core.DT;
 let mx=Math.round(V.rx),my=Math.round(V.ry);V.rx-=mx;V.ry-=my;
 // Move a pixel at a time, x and y interleaved, with the void open to the knight alone. The moment he is
 // clear of every void stone he is out; the rest of the frame's travel is not taken.
 for(const e of vs)e.solid=false;
 let dead=false,out=false;
 while((mx||my)&&!dead&&!out){
  for(const [ax,dv] of [['x',Math.sign(mx)],['y',Math.sign(my)]]){
   if(!dv)continue;
   const nx=p.x+(ax==='x'?dv:0),ny=p.y+(ax==='y'?dv:0);
   if(Core.blockerAt(g,nx,ny,p.w,p.h)){dead=true;break;}
   p.x=nx;p.y=ny;if(ax==='x')mx-=dv;else my-=dv;
   const inside=inVoid(g,p);
   if(inside)V.entered=true;else if(V.entered){out=true;break;}
  }
 }
 for(const e of vs)e.solid=true;
 p.vx=0;p.vy=0;
 if(dead){S.voidTravel=null;p.state='normal';Core.kill(g,p,'void');return;}
 if(!V.entered){
  // A dash that only grazed a corner never went in: it carries on as a dash.
  S.voidTravel=null;p.state='dash';p.dashTimer=Math.max(1,V.dashTimer-1);p.vx=V.vx;p.vy=V.vy;return;
 }
 if(out){
  // Out the far side: the dash comes back, the speed stays.
  S.voidTravel=null;p.state='normal';p.vx=V.vx;p.vy=V.vy;p.remX=p.remY=0;p.maxFall=Math.max(Core.K.maxFall,V.vy);
  p.dashCooldown=0;p.dashRefillCooldown=0;Core.refillDash(g,p);
  // Ground grace only off a level or falling exit: an upward exit is already a bigger jump than a jump.
  if(V.vy>=0){p.jumpGrace=Math.max(p.jumpGrace,VK.grace);S.voidGrace=VK.grace;}
  if(V.vx)p.facing=Math.sign(V.vx);
  if(Math.abs(V.vx)>Core.K.maxRun)p.coast=true;
  Core.emit(g,'void-out',{x:p.x+4,y:p.y+6,dx:Math.sign(V.vx),dy:Math.sign(V.vy)});
 }
}
/* While travelling the core must not move or ground the knight. His speed reads as the travel speed for
   the rest of the frame (thorns pointing the way he travels are safe, as everywhere), with the
   remainders set so the core's move nets to nothing. */
function forces(g,p){
 const V=state(g,p).voidTravel;if(p.state!=='void'||!V)return;
 const DT=C().DT;p.vx=V.vx;p.vy=V.vy;p.remX=-(V.vx*DT);p.remY=-(V.vy*DT);p.pushX=0;
}
function mirror(g){for(const s of g.players||[g]){const V=s.voidTravel;if(V){V.vy=-V.vy;V.ry=-V.ry;}}}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'void',reset,before,beforePlayer:before,forces,dashHit,mirror});
root.BladefallPrecisionVoid=Object.freeze({VK});
})(typeof window!=='undefined'?window:globalThis);
