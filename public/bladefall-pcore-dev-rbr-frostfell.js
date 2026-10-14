/* Precision Core — Room by Room · 8. Frostfell (7.259): an 'ice' event, nothing else.

   Frostfell's ice is the Frostfell module's glyph I (bladefall-pcore-dev-frost.js): solid rock with an eighth of the
   usual traction. That module changes the knight's grip but emits nothing, so a skip hunt cannot ask for "a way out
   that never used the ice". This module emits `ice` the frame the knight starts using ice: his feet on top of an ice
   tile (even when a buffered jump leaves it that same frame), or his hands on an ice face (clinging to it, or a wall
   jump, climb jump or wall bounce off it). It emits again each time he comes back to ice after leaving it. Only in
   Room by Room rooms, so the Precision Courses' event streams are unchanged. It moves nothing and draws nothing: the
   page plays the same with or without it.
     node scripts/rbr-skip.mjs f8-streets --without ice --plain */
(function(root){
'use strict';
const TILE=8,PUSH=new Set(['walljump','wallbounce','climbjump','grab']);
function iceIn(g,x,y,w,h){
 const room=g.room,COLS=room.cols||40,ROWS=room.rows||23;
 for(let r=Math.max(0,Math.floor(y/TILE));r<=Math.min(ROWS-1,Math.floor((y+h-1)/TILE));r++)
  for(let c=Math.max(0,Math.floor(x/TILE));c<=Math.min(COLS-1,Math.floor((x+w-1)/TILE));c++)if(room.ice[r*COLS+c])return true;
 return false;
}
function after(g){
 if(!g.room.def.rbr||!g.room.ice)return;
 const p=g.p,F=root.BladefallPrecisionFrost;if(!F)return;
 let on=false;
 if(p.state!=='dead'){
  on=F.onIce(g,p);
  // Hands on an ice face: within the core's wall-jump reach (3 px), plus the frame's move away from it (and up), on either side.
  if(!on&&(p.state==='climb'||g.events.some(e=>(!g.players||e.player===g.coopActor)&&PUSH.has(e.type))))on=iceIn(g,p.x-6,p.y,6,p.h+4)||iceIn(g,p.x+p.w,p.y,6,p.h+4);
 }
 if(on&&!p.rbrOnIce)root.BladefallPrecisionCore.emit(g,'ice',{x:p.x+4,y:p.y+p.h});
 p.rbrOnIce=on;
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-frostfell',after,afterPlayer:after});
})(typeof window!=='undefined'?window:globalThis);
