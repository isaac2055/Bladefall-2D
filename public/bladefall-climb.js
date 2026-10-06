/* The Climb (7.265): each world of Bladefall as one continuous, scrolling place, after Merge Pitch B
   ("Frostfell, one mountain"), which Isaac liked best. A world is a chain of sections: the rooms of Room by Room
   (only those rated 7 or easier, easy first), set side by side or stacked where their exits lead, with a fire at the
   start of each. The camera never cuts; the knight walks out of one section into the next with the speed he had;
   a death puts him back at the fire of the section he is in, and only that section is reset.

   Every section is still its own Precision Core room, so its rules (gates and their stakes, plates and their doors,
   the toggle phase, bosses, portals) and its intended tape are exactly Room by Room's. Only the room's edge is opened
   where the previous section joins it (see scripts/climb/build-climbs.mjs, which writes bladefall-climb-worlds.js).

   This file is the registry and the seam: it runs in the page and in node (globalThis.BLADEFALL_CLIMB=true). The
   worlds register only on a climb page (precision.html?pitch=climb), so nothing else in the game sees them.
   Flow and drawing: bladefall-climb-view.js. Plan: docs/plans/climb-worlds.md. */
(function(root){
'use strict';
const wanted=root.BLADEFALL_CLIMB||(root.location&&/[?&]pitch=climb/.test(root.location.search||''));
const CL={worlds:[],wanted:!!wanted};
const TILE=8;

/* addWorld({n,key,name,blurb,outro,palette,sections:[{room,x,y,fire}],quests:[{id,title,giver,from,back,keepsake,sections}],
   rooms:[room defs], tapes:{}, folk, props, palettes, saved:[{id,name,diff,fun}]}) — x/y are tile offsets in the world. */
CL.addWorld=function(w){
 if(wanted&&root.BladefallClimbAtlas)root.BladefallClimbAtlas.prepareWorld(w);
 if(wanted&&root.BladefallClimbPassages)root.BladefallClimbPassages.prepare(w);
 CL.worlds.push(w);CL.worlds.sort((a,b)=>a.n-b.n);
 if(!wanted||!root.BladefallPrecisionRooms||!root.BladefallPrecisionRooms.addPart)return w;
 const main=w.sections.map(s=>w.rooms.find(r=>r.id===s.room));
 // A branch's way back (its passage) is played like any room, but it is not a level: it is named after its branch
 // and left out of the pause menu's room list (bladefall-pcore-view.js skips rooms marked passage or connector).
 for(const b of [...w.quests,...(w.secrets||[])])for(const s of b.sections){const r=w.rooms.find(r=>r.id===s.room);
  if(r&&(r.passage||r.connector)&&!r.name)r.name=(b.title||b.name||'')+' · the way back';}
 const quest=w.quests.flatMap(q=>q.sections.map(s=>w.rooms.find(r=>r.id===s.room)));
 const secret=(w.secrets||[]).flatMap(x=>x.sections.map(s=>w.rooms.find(r=>r.id===s.room)));
 const chapter={id:'climb-'+w.key,name:w.name,climb:w.n,pitch:'climb',bonus:true,palette:w.palette,blurb:w.blurb||'',outro:w.outro||'',
  rooms:[...main,...quest,...secret,...(w.passages||[]).map(s=>w.rooms.find(r=>r.id===s.room))],mainCount:main.length};
 w.chapter=chapter;
 root.BladefallPrecisionRooms.addPart({part:'climb',title:'The Climb',chapters:[chapter],tapes:w.tapes||{}});
 return w;
};
CL.world=n=>CL.worlds.find(w=>w.n===n)||null;
CL.def=(w,id)=>w.rooms.find(r=>r.id===id)||null;

/* Where a section sits, in pixels, and which list it belongs to (the main road or a quest's own chain). */
CL.place=function(w,roomId){
 for(const s of w.passages||[])if(s.room===roomId)return {x:s.x*TILE,y:s.y*TILE,sec:s,chain:[s],quest:null,branch:null};
 for(const s of w.sections)if(s.room===roomId)return {x:s.x*TILE,y:s.y*TILE,sec:s,chain:w.sections,quest:null,branch:null};
 for(const q of w.quests)for(const s of q.sections)if(s.room===roomId)return {x:s.x*TILE,y:s.y*TILE,sec:s,chain:q.sections,quest:q,branch:{kind:'quest',obj:q,host:q.from}};
 for(const x of w.secrets||[])for(const s of x.sections)if(s.room===roomId)return {x:s.x*TILE,y:s.y*TILE,sec:s,chain:x.sections,quest:null,branch:{kind:'secret',obj:x,host:x.host}};
 return null;
};
/* Every section of a world: the road, its quests' branches and its secrets. */
CL.all=w=>[...w.sections,...w.quests.flatMap(q=>q.sections),...(w.secrets||[]).flatMap(x=>x.sections),...(w.passages||[])];

/* The seam: the knight leaves section A by its exit and is set down in section B (already entered with
   Core.enterRoom) at the same place in the world, with the speed, facing and dash he had. If the two rooms
   disagree by a pixel at the join, he is nudged to the nearest clear spot. */
CL.carry=function(Core,g,snap,from,to,continuous=false){
 const q=g.p,room=g.room;
 if(continuous&&snap.motion){
  const maxDashes=q.maxDashes;Object.assign(q,snap.motion);q.maxDashes=maxDashes;q.dashes=Math.min(q.dashes,maxDashes);
  q.x=snap.x+from.x-to.x;q.y=snap.y+from.y-to.y;
  q.carrying=null;q.strikeHit=new Set();
  if(snap.prev)g.prev={...snap.prev};if(snap.buf)g.buf={...snap.buf};
  return q;
 }
 let x=Math.round(snap.x+from.x-to.x),y=Math.round(snap.y+from.y-to.y);
 // Rising in through a floor opening he may hang below the room's edge for a moment (the core only kills below
 // room.h+2), so he is not popped up by his own height at the crossing.
 x=Math.max(0,Math.min(room.w-q.w,x));y=Math.max(0,Math.min(snap.vy<0?room.h-1:room.h-q.h,y));
 if(Core.solidAt(g,x,y,q.w,q.h)){
  let best=null,bd=1e9;
  for(let dy=-56;dy<=56;dy++)for(let dx=-24;dx<=24;dx++){
   const d=Math.abs(dx)*2+Math.abs(dy);if(d>=bd)continue;const nx=x+dx,ny=y+dy;
   if(nx<0||ny<0||nx+q.w>room.w||ny+q.h>room.h)continue;
   if(!Core.solidAt(g,nx,ny,q.w,q.h)){best=[nx,ny];bd=d;}
  }
  if(best){x=best[0];y=best[1];}
 }
 q.x=x;q.y=y;q.remX=0;q.remY=0;
 q.vx=snap.vx;q.vy=snap.vy;q.facing=snap.facing;q.dashes=Math.min(snap.dashes,q.maxDashes);
 q.stamina=snap.stamina;q.onGround=false;q.wasGround=false;q.state='normal';
 // the keys held and the presses still buffered cross with him (in the page it is the same game, so this changes nothing there)
 if(snap.prev)g.prev={...snap.prev};if(snap.buf)g.buf={...snap.buf};
 return q;
};
CL.snap=g=>{const p=g.p;return {motion:{...p,dashDir:{...p.dashDir},beforeDash:{...p.beforeDash},strikeDir:{...p.strikeDir}},x:p.x,y:p.y,vx:p.vx,vy:p.vy,facing:p.facing,dashes:p.dashes,stamina:p.stamina,prev:g.prev?{...g.prev}:null,buf:g.buf?{...g.buf}:null};};

root.BladefallClimb=CL;
})(typeof window!=='undefined'?window:globalThis);
