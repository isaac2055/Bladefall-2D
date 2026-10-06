/* Precision Core — Room by Room · 4. The Updrafts (7.259): a 'wind' event, nothing else.

   The Updrafts' thermals are the Frostfell module's wind boxes (bladefall-pcore-dev-frost.js, room def
   `winds:[{c,r,w,h,dx,dy}]`). That module moves the knight but emits nothing, so a skip hunt cannot ask for
   "a way out that never rode the wind". This module emits `wind` the frame the knight enters a wind box (and
   again each time he re-enters one), only in Room by Room rooms, so the Precision Courses' event streams are
   unchanged. It moves nothing and draws nothing: the page plays the same with or without it.
     node scripts/rbr-skip.mjs u4-bellows --without wind --plain */
(function(root){
'use strict';
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
function after(g){
 if(!g.room.def.rbr||!g.winds||!g.winds.length)return;
 const p=g.p,C=root.BladefallPrecisionCore;
 const inside=p.state!=='dead'&&g.winds.some(z=>overlap(p.x,p.y,p.w,p.h,z.x,z.y,z.w,z.h));
 if(inside&&!p.rbrInWind)C.emit(g,'wind',{x:p.x+4,y:p.y+p.h});
 p.rbrInWind=inside;
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-updrafts',after});
})(typeof window!=='undefined'?window:globalThis);
