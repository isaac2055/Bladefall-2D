/* Precision Core — Emberdeep (7.254, Part X, levels 99–106): heat slabs on the pour schedule.

   A heat slab (glyph E, a rectangle) runs a fixed cycle, on the room's clock rather than your dash:
     stone  — solid;
     molten — open and deadly to touch from any side;
     glass  — cooling: a one-way top you can land on from above and pass from below or the side.
   The cycle is stone → molten → glass → stone. Each slab reads its own timing from the room def
   `slabs:[{stone,molten,glass,offset}]` (frames, in the order the slabs appear top-left first;
   defaults 90/60/45, offset 0). The clock starts with the room's first input. A slab that turns
   solid (stone) while you are inside it waits until you leave. Pips on each slab count down to its
   next change, so the schedule can be read rather than memorised. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const EK=Object.freeze({stone:90,molten:60,glass:45});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
const ORDER=['stone','molten','glass'];

function reset(g){
 const def=g.room.def,Core=C();
 const list=Core.groupsOf(def,'E');if(!list.length){g.slabs=null;return;}
 g.slabClock=0;
 g.slabs=list.map((b,i)=>{
  const d=(def.slabs||[])[i]||{};
  const e={type:'slab',dev:true,x:b.x,y:b.y,w:b.w,h:b.h,id:'sl'+i,durs:{stone:d.stone??EK.stone,molten:d.molten??EK.molten,glass:d.glass??EK.glass},offset:d.offset||0,start:d.start||'stone'};
  e.state=stateAt(e,0).state;e.solid=e.state==='stone';e.thru=e.state==='glass';
  g.ents.push(e);return e;
 });
}
/* Where a slab is in its cycle at a given clock: its state and the frames left in it. */
function stateAt(e,clock){
 const seq=[...ORDER.slice(ORDER.indexOf(e.start)),...ORDER.slice(0,ORDER.indexOf(e.start))];
 const cyc=seq.reduce((n,s)=>n+e.durs[s],0);let k=((clock+e.offset)%cyc+cyc)%cyc;
 for(const s of seq){if(k<e.durs[s])return {state:s,left:e.durs[s]-k};k-=e.durs[s];}
 return {state:seq[0],left:1};
}
function before(g){
 if(!g.slabs)return;
 const Core=C(),p=g.p;
 if(g.awake)g.slabClock++;
 for(const e of g.slabs){
  const {state,left}=stateAt(e,g.slabClock);e.left=left;
  if(state!==e.state){
   e.state=state;Core.emit(g,'slab-'+state,{x:e.x+e.w/2,y:e.y+e.h/2});
   e.pending=state==='stone';
  }
  if(state==='stone'){
   if(e.pending){const inside=p.state!=='dead'&&overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h);if(!inside)e.pending=false;}
   e.solid=!e.pending;e.thru=false;
  }else{e.solid=false;e.thru=state==='glass';}
 }
}
function after(g){
 if(!g.slabs)return;
 const p=g.p;if(p.state==='dead'||p.state==='respawn')return;
 for(const e of g.slabs)if(e.state==='molten'&&overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h)){C().kill(g,p,'molten');return;}
 // A lantern that touches molten stone is lost, and floats home.
 for(const l of g.ents)if(l.type==='lantern'&&!l.held&&!l.returning&&g.slabs.some(e=>e.state==='molten'&&overlap(l.x,l.y,l.w,l.h,e.x,e.y,e.w,e.h))){l.returning=true;l.timer=40;C().emit(g,'lantern-lost',{x:l.x+4,y:l.y});}
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'ember',reset,before,after});
root.BladefallPrecisionEmber=Object.freeze({EK,stateAt});
})(typeof window!=='undefined'?window:globalThis);
