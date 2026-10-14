/* Precision Core — Room by Room · 10. Emberdeep (7.259): a 'slab' event, nothing else.

   Emberdeep's heat slabs are the Part X module's (bladefall-pcore-dev-ember.js, glyph E, room def
   `slabs:[{stone,molten,glass,start,offset}]`). That module emits only the clock's own changes (slab-stone,
   slab-molten, slab-glass), which happen whether or not the knight goes near a slab, so a skip hunt cannot ask
   for "a way out that never used a slab". This module emits `slab` the frame the knight first touches a slab
   that is not molten (stands on it, is within a wall jump of its side, bumps it, or is inside it as glass), and again each time
   he comes back to one, only in Room by Room rooms, so the Precision Courses' event streams are unchanged.
   It moves nothing and draws nothing: the page plays the same with or without it.
     node scripts/rbr-skip.mjs e10-cooling --without slab --plain */
(function(root){
'use strict';
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
function after(g){
 if(!g.room.def.rbr||!g.slabs)return;
 const p=g.p,C=root.BladefallPrecisionCore;
 const touch=p.state!=='dead'&&p.state!=='respawn'&&g.slabs.some(e=>e.state!=='molten'&&overlap(p.x-5,p.y-2,p.w+10,p.h+5,e.x,e.y,e.w,e.h));
 if(touch&&!p.rbrOnSlab)C.emit(g,'slab',{x:p.x+4,y:p.y+p.h});
 p.rbrOnSlab=touch;
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-emberdeep',after,afterPlayer:after});
})(typeof window!=='undefined'?window:globalThis);
