/* Precision Core — Room by Room · Broken Causeway (7.259): the Brute.

   The Brute is a Combat hound (bladefall-pcore-combat.js) placed with brute:true in a room's combat.enemies.
   Everything it does is the hound's: it wakes when it sees the knight, shows its tell, commits to a straight
   charge, breaks cracked masonry it runs into (a brittle door: the cracked brace), and stops dazed against
   anything solid. This module changes only two things:
   - it is big: a 24×16 body instead of the hound's 16×10 (give its y as the top of that body: floor − 16);
   - it is armoured: the blade glances off it, as off a ram's horn (a knock back, no pogo, no damage).
   So nothing the knight carries can hurt it. Weight can: a moving solid (a slide stone, a lift) that pushes
   it into the floor crushes it, which the Combat actors already do (solidMoved). That is the boss's solution:
   bait the charge under the counterweight, then drop the counterweight on it.
   It acts only on enemies marked brute (every other taped room replays identically with or without it), but the
   causeway's boss rooms and their tapes need it: without it the Brute is hound-sized and the blade cuts it down.
   So the Room by Room page must load it (script tags for this file and -view.js).

   Opt-in (7.277, fields on the brute's enemy def; without them it behaves exactly as above):
   - `crush:n` (default 1): crushes it takes. A crush that is not the last cracks its armour instead: it heaves
     itself out from under the weight to the nearer open side, reels for `BK.daze` frames, and gets up enraged —
     a shorter tell and a faster charge. The cracks glow through its plates (the view), one seam per crush.
   - `stamp:true`: once cracked (or always, with `stamp:'always'`), every charge that ends against something solid
     ends in a stamp: it rears for `BK.wind` frames, then a shockwave runs out along the floor both ways from its
     feet, `BK.waveH` px tall, until it meets a wall or runs out of floor. It kills what it meets on the floor; a
     knight in the air, on a ledge or behind solid stone is untouched (ground attacks stay on the ground).
   Emits brute-crack {cracks,need} (in place of the Combat's enemy-defeat for a crush that only cracks),
   brute-rear, brute-stamp, and quake (the cause of a death). */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const W=24,H=16;
const BK=Object.freeze({daze:40,extra:70,wind:10,wave:150,waveH:6,shove:12});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
function reset(g){
 for(const e of g.combat?.enemies||[])if(e.brute){e.w=W;e.h=H;e.hp=0;e.cracks=0;e.felled=false;e.stampT=0;e.prevState=e.state;}   // no health pips: only weight ends it
 g.bruteWaves=[];
}
/* Runs after a strike starts and before anything moves, so the Combat actors never see the cut land. */
function forces(g,p){
 const co=g.combat;if(!co||p.strikeTimer<=0)return;
 const Core=C(),sb=Core.strikeBox(p);
 if(p.strikeTimer===Core.K.strikeFrames||!p.bruteGlance)p.bruteGlance=new Set();   // a new swing
 for(const e of co.enemies){
  if(!e.brute||e.dead)continue;
  // Marked for the whole swing, hit or not: the Combat actors skip anything already struck.
  p.strikeHit.add(e.id);
  const near=Core.overlap(sb[0]-4,sb[1]-4,sb[2]+8,sb[3]+8,e.x,e.y,e.w,e.h);
  if(!near||p.bruteGlance.has(e.id))continue;
  p.bruteGlance.add(e.id);
  p.vx=(p.x+4<e.x+e.w/2?-1:1)*150;p.vy=Math.min(p.vy,-80);if(p.state==='climb')p.state='normal';
  g.freeze=Math.max(g.freeze,2);Core.emit(g,'guard-block',{x:e.x+e.w/2,y:e.y+e.h/2,brute:true});
 }
}
/* A crush that only cracks it: out from under the weight, reeling. */
function crack(g,e){
 const Core=C();
 e.dead=false;e.cracks++;g.combat.kills=Math.max(0,g.combat.kills-1);
 // The Combat actors announced a defeat this step; it was only a crack.
 for(let i=g.events.length-1;i>=0;i--)if(g.events[i].type==='enemy-defeat'&&g.events[i].cause==='crush'){g.events.splice(i,1);break;}
 // The nearest place beside the weight with nothing over it (so the stone still settling cannot take it again).
 const clear=x=>x>=0&&x+e.w<=g.room.w&&!Core.solidAt(g,x,e.y-24,e.w,e.h+24);
 let to=null;
 for(let d=0;d<=g.room.w&&to===null;d+=2){
  const order=e.x+e.w/2<g.room.w/2?[d,-d]:[-d,d];
  for(const dx of order)if(to===null&&clear(e.x+dx))to=e.x+dx;
 }
 if(to===null)to=e.x;
 e.shove=to-e.x;e.shoveT=BK.shove;e.x=to;e.remX=0;e.vx=0;e.vy=0;e.stun=0;e.exposed=0;
 e.face=e.shove>0?-1:e.shove<0?1:e.face;   // it comes up facing the weight that cracked it
 e.state='recover';e.t=BK.daze;e.stampT=0;
 g.freeze=Math.max(g.freeze,6);
 Core.emit(g,'brute-crack',{x:e.x+e.w/2,y:e.y+e.h/2,cracks:e.cracks,need:e.crush,dev:true});
}
function enraged(e){return e.cracks>0;}
function before(g){
 const co=g.combat;if(!co)return;
 const Core=C();
 for(const e of co.enemies){
  if(!e.brute)continue;
  if(e.dead&&!e.felled){if((e.cracks||0)+1<(e.crush||1))crack(g,e);else e.felled=true;}
  if(e.dead)continue;
  if(e.shoveT>0)e.shoveT--;
  if(enraged(e)&&g.awake){
   // A shorter tell (36 → 24 frames) and a faster charge (the Combat hound's 160 + BK.extra px/s).
   if(e.state==='tell'&&e.t>2&&e.t%3===0)e.t--;
   if(e.state==='attack'){
    Core.moveX(g,e,e.face*BK.extra*Core.DT,b=>{
     if(b?.type==='brittle'){b.open=true;Core.emit(g,'breach',{x:b.x+b.w/2,y:b.y+b.h/2});}
     else if(b?.type==='foeSolid')root.BladefallPrecisionFoes?.breakProxy(g,b);
     e.state='recover';e.t=65;e.exposed=90;e.vx=0;
    });
   }
  }
  // The stamp: a charge that ended against something solid (the hound's recover after a hit is 65 frames).
  const stamps=e.stamp==='always'||(e.stamp&&enraged(e));
  if(stamps&&e.prevState==='attack'&&e.state==='recover'&&e.t>=60){e.stampT=BK.wind;Core.emit(g,'brute-rear',{x:e.x+e.w/2,y:e.y,dev:true});}
  if(e.stampT>0&&--e.stampT===0&&e.state==='recover'){
   const fy=e.y+e.h,cx=e.x+e.w/2;
   g.bruteWaves.push({x:cx-2,y:fy,dir:-1,t:0},{x:cx-2,y:fy,dir:1,t:0});
   g.freeze=Math.max(g.freeze,2);Core.emit(g,'brute-stamp',{x:cx,y:fy,dev:true});
  }
  e.prevState=e.state;
 }
 // Shockwaves run along the floor until a wall or the end of the floor.
 if(g.bruteWaves.length){
  for(const w of g.bruteWaves){
   w.t++;const step=BK.wave*Core.DT;w.rem=(w.rem||0)+step;const n=Math.floor(w.rem);w.rem-=n;
   for(let i=0;i<n&&!w.done;i++){
    const nx=w.x+w.dir;
    if(Core.solidAt(g,nx+(w.dir>0?3:0),w.y-BK.waveH,1,BK.waveH-1)||!Core.solidAt(g,nx+1,w.y,2,1)||nx<-4||nx>g.room.w)w.done=true;
    else w.x=nx;
   }
  }
  g.bruteWaves=g.bruteWaves.filter(w=>!w.done);
 }
}
function after(g){
 const p=g.p;if(!g.bruteWaves||!g.bruteWaves.length||p.state==='dead'||p.state==='respawn')return;
 for(const w of g.bruteWaves)if(overlap(p.x,p.y,p.w,p.h,w.x-1,w.y-BK.waveH,6,BK.waveH)){C().kill(g,p,'quake');return;}
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-causeway',reset,forces,before,after});
root.BladefallRbrCauseway=Object.freeze({BK});
})(typeof window!=='undefined'?window:globalThis);
