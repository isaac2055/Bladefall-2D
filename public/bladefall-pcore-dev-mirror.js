/* Precision Core — mirror panes (7.280, the Fractured act): the glass the Fractured world was reflected in.

   Mirror pane (glyph |, a rectangle, only in a room with the field `mirror`): a sheet of glass. To everything
   that is not a dashing knight it is a wall: you stand on it, hold it, bump it; the lantern and stones stop on
   it. A DASH goes through it, and coming through, left and right swap: the arrow that pointed left now runs and
   aims right, for every move (running, wall jumps, aiming a dash or a cut) until you dash through a pane again,
   which swaps them back. Like a gravity prism, a pane works once per pass: leave it before it will turn you
   again. A dash that ends inside the glass leaves you free to fall out of it. Retrying the room sets the
   controls right.
   Room field `mirror:{}` (no settings yet). Up and down are never swapped by glass (a gravity prism does that,
   and the two combine).
   What it asks: every pane costs your dash, and on the far side your hands are reversed. So the question in a
   glass room is where you will have a dash again, and which side you will be facing when you get it.
   While swapped the knight carries a cyan glint with a small two-way arrow over him and both side edges of the
   screen glow cyan, so the swapped state is never off screen. Cyan glass will swap; white glass will swap back.
   The swap is applied to the core's input each frame in this module's `before` hook; the swapped state is
   written into each pane's `state` so the route search's state key sees it. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
function reset(g){
 g.mirrorLR=false;
 if(!g.room.def.mirror)return;
 for(const b of C().groupsOf(g.room.def,'|'))g.ents.push({type:'pane',dev:true,solid:true,x:b.x,y:b.y,w:b.w,h:b.h,id:'mp'+g.ents.length,armed:true,state:''});
}
function before(g,inp){
 if(!g.room.def.mirror)return;
 const p=g.p,alive=p.state!=='dead'&&p.state!=='respawn',dashing=alive&&p.state==='dash';
 for(const e of g.ents){
  if(e.type!=='pane')continue;
  const inside=alive&&overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h);
  // Open to a dashing knight (and to a knight still inside it); a wall to everything else.
  e.solid=!dashing&&!inside;
  if(!inside){e.armed=true;continue;}
  // Only a dash opens the glass, so a knight inside it came through on one (even if the dash ran out in it).
  if(e.armed){
   e.armed=false;g.mirrorLR=!g.mirrorLR;
   C().emit(g,'mirror',{x:e.x+e.w/2,y:e.y+e.h/2,on:g.mirrorLR});
  }
 }
 for(const e of g.ents)if(e.type==='pane')e.state=g.mirrorLR?'m':'';
 if(g.mirrorLR&&inp){const l=inp.l;inp.l=inp.r;inp.r=l;inp.mx=-inp.mx;
  // The parry reads its aim before device hooks run: turn a ward armed this frame the same way.
  if(p.parryAim&&p.parryTimer===C().PARRY.window)p.parryAim={...p.parryAim,x:-p.parryAim.x};}
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'mirror',reset,before});
})(typeof window!=='undefined'?window:globalThis);
