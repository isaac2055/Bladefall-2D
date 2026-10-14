/* Precision Core — Inversion (7.254, Part XII, levels 115–122): gravity prisms.

   A gravity prism (glyph Q) turns gravity over when you dash through it. Everything that falls falls the
   other way: the knight, the lantern, a thrown stone. Ceilings become floors; thorns that pointed down
   now point at your feet. Up and down on the controls stay up and down on the screen. A prism works
   once per pass: leave it before it will flip you again. Retrying the room sets gravity right.

   How: the simulation stays the same code. A flip mirrors the room top to bottom — tiles, thorns,
   machinery, stones, portals, foes and the knight, with vertical speeds reversed — and the view draws
   the mirrored room upside down, so on screen nothing moves but the knight now stands on the ceiling.
   Up and down input are swapped while flipped. Other modules can mirror their own state through a
   `mirror(g)` hook. Rooms with water or a tide do not support prisms. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8,COLS=40,ROWS=23,H=ROWS*TILE;
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
const my=(y,h,height=H)=>height-y-h;

function flipRows(arr,swap,cols=COLS,rows=ROWS){
 const tmp=arr.slice();
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){let v=tmp[(rows-1-r)*cols+c];if(swap)v=swap(v);arr[r*cols+c]=v;}
}
/* The room is never changed in place: a flip swaps g.room between the parsed room and a mirrored copy of it
   (made once, kept on the upright room). Nothing else mutates tiles during play in a room with prisms, so
   both stay valid; and a saved game state (the route search's snapshots share g.room by reference) keeps
   whichever side it was saved on. Every per-tile layer (grid, portal stone, barrier lines, ice, belts,
   rails) is mirrored with it. */
function mirroredCopy(room){
 const Core=C(),m={...room,_mirror:undefined},cols=room.cols||COLS,rows=room.rows||ROWS;
 for(const k of Object.keys(room)){const v=room[k];
  if(ArrayBuffer.isView(v)&&v.length===cols*rows){m[k]=v.slice();flipRows(m[k],k==='grid'?(t=>t===Core.SPIKE_UP?Core.SPIKE_DOWN:t===Core.SPIKE_DOWN?Core.SPIKE_UP:t):null,cols,rows);}}
 m.exit=room.exit==='up'?'down':room.exit==='down'?'up':room.exit;
 m.mirrored=true;m.upright=room;
 return m;
}
function mirrorRoom(g){
 if(g.room.mirrored)g.room=g.room.upright;
 else g.room=g.room._mirror||(g.room._mirror=mirroredCopy(g.room));
}
function mirrorBody(o,height=H){
 if(!o)return;
 if(typeof o.y==='number'&&typeof o.h==='number')o.y=my(o.y,o.h,height);
 if(typeof o.oy==='number'&&typeof o.h==='number')o.oy=my(o.oy,o.h,height);
 if(typeof o.ty==='number'&&typeof o.h==='number')o.ty=my(o.ty,o.h,height);
 if(typeof o.homeY==='number')o.homeY=my(o.homeY,o.h,height);
 if(typeof o.vy==='number')o.vy=-o.vy;
 if(typeof o.remY==='number')o.remY=-o.remY;
 if(typeof o.dirY==='number')o.dirY=-o.dirY;
 if(o.type==='deck'&&typeof o.dy==='number')o.dy=-o.dy;
}
function mirror(g){
 const height=g.room.h||H,rows=g.room.rows||ROWS;
 mirrorRoom(g);
 for(const e of g.ents)mirrorBody(e,height);
 for(const f of g.foes||[]){
  if(f.kind==='moth'){f.y0=my(f.y0,f.h,height);f.path=[f.path[0],-f.path[1]];}
  mirrorBody(f,height);if(f.kind==='spit')f.dy=-f.dy;
 }
 for(const b of g.bolts||[])mirrorBody(b,height);
 for(const j of g.jailers||[])mirrorBody(j,height);
 for(const z of g.winds||[]){z.y=my(z.y,z.h,height);z.dy=-z.dy;}
 if(g.portals)for(const k of ['blue','orange']){const pt=g.portals[k];if(!pt)continue;
  const horiz=pt.face==='u'||pt.face==='d';
  if(horiz){pt.r=rows-1-pt.r;pt.face=pt.face==='u'?'d':'u';}else pt.r=rows-2-pt.r;}
 if(g.portals&&root.BladefallPrecisionPortals?.refresh)root.BladefallPrecisionPortals.refresh(g);
 // The knight: position, vertical speeds and every remembered vertical direction.
 for(const p of g.players||[g.p]){p.y=my(p.y,p.h,height);p.vy=-p.vy;p.remY=-p.remY;p.varJumpSpeed=-(p.varJumpSpeed||0);
 if(p.varJump>0){p.varJump=0;p.autoJump=false;}
 for(const k of ['dashDir','beforeDash','pressAim','parryAim','strikeDir'])if(p[k])p[k]={...p[k],y:-p[k].y};
 if(p.airPeakY!=null)p.airPeakY=my(p.airPeakY,p.h,height);
 p.liftY=-p.liftY;p.onGround=false;p.wasGround=false;p.jumpGrace=0;
 if(p.carrying){p.carrying.x=p.x;p.carrying.y=p.y-8;}}
 C().devCall('mirror',g);
 g.flipped=!g.flipped;
}
function unload(g){if(g.room&&g.room.mirrored)g.room=g.room.upright;g.flipped=false;}
function reset(g){
 if(g.room.mirrored)g.room=g.room.upright;g.flipped=false;
 for(const b of C().groupsOf(g.room.def,'Q'))g.ents.push({type:'prism',dev:true,x:b.x,y:b.y,w:b.w,h:b.h,id:'pr'+g.ents.length,armed:true});
}
function input(g,raw){if(!g.flipped)return;return {...raw,u:raw.d,d:raw.u};}
function before(g){
 const p=g.p;if(p.state==='dead'||p.state==='respawn')return;
 for(const e of g.ents){
  if(e.type!=='prism')continue;
  const inside=overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h);
  if(!inside){if(!g.players||g.players.every(p=>p.state==='dead'||p.state==='respawn'||!overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h)))e.armed=true;continue;}
  if(e.armed&&p.state==='dash'&&!p.dashAim){e.armed=false;const x=e.x+e.w/2,y=e.y+e.h/2;mirror(g);C().emit(g,'gravity',{x,y:my(y,0,g.room.h||H),flipped:g.flipped});}
 }
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'gravity',reset,unload,input,before,beforePlayer:before});
root.BladefallPrecisionGravity=Object.freeze({mirror,mirroredCopy});
})(typeof window!=='undefined'?window:globalThis);
