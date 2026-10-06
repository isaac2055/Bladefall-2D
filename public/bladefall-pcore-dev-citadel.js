/* Precision Core — the Citadel (7.254, Part XIII, levels 123–131): spent footholds.

   A spent foothold (glyph Y) is good once. Stand on it or hold its side as long as you like; the moment
   you leave it, it falls away for the rest of the attempt. Kicking off its side (a wall jump) counts as
   leaving it too. Retrying the room restores it. The precision mirror of the Citadel's footholds spent by use.
   (7.254 fix: a landing that jumps again on the same frame — a buffered jump — used to leave the foothold
   untouched, so it could be hopped on forever; contact is now read before the knight moves as well as after.) */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
function reset(g){
 for(const b of C().groupsOf(g.room.def,'Y'))g.ents.push({type:'foothold',dev:true,solid:true,x:b.x,y:b.y,w:b.w,h:b.h,id:'fh'+g.ents.length,used:false});
}
const alive=p=>p.state!=='dead'&&p.state!=='respawn';
// Feet resting on its top (before the knight moves, so a buffered jump off it still counts).
const onTop=(p,e)=>p.vy>=0&&p.y+p.h===e.y&&p.x<e.x+e.w&&p.x+p.w>e.x;
function before(g){
 const p=g.p;if(!alive(p))return;
 g.fhPrev={x:p.x,y:p.y,w:p.w,h:p.h};
 for(const e of g.ents)if(e.type==='foothold'&&!e.gone&&onTop(p,e))e.used=true;
}
function after(g){
 const Core=C(),p=g.p;
 // A wall jump this frame off a foothold's side: it was used, and has already been left.
 let kick=null;
 for(const ev of g.events)if(ev.frame===g.frame){if(ev.type==='walljump'||ev.type==='wallbounce')kick=ev.dir;else if(ev.type==='climbjump')kick=-p.facing;}
 for(const e of g.ents){
  if(e.type!=='foothold'||e.gone)continue;
  const on=Core.riderOf(g,e)||(alive(p)&&p.onGround&&p.y+p.h===e.y&&p.x<e.x+e.w&&p.x+p.w>e.x);
  if(!on&&kick&&g.fhPrev){const q=g.fhPrev,reach=6;
   // The wall was on the side opposite the kick's direction.
   const x=kick>0?q.x-reach:q.x+q.w,w=reach;
   if(Core.overlap(x,q.y,w,q.h,e.x,e.y,e.w,e.h))e.used=true;}
  if(on)e.used=true;
  else if(e.used){e.gone=true;e.solid=false;Core.emit(g,'foothold-spent',{x:e.x+e.w/2,y:e.y+e.h/2,w:e.w});}
 }
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'citadel',reset,before,after});
})(typeof window!=='undefined'?window:globalThis);
