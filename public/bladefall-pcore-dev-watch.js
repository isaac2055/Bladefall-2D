/* Precision Core — the Colony (7.254, Part XVIII, levels 170–179): watch lights and smoke.

   Watch light (room def `lights:[{c,r,dir,sweep,period,phase,range,width}]`; angles in degrees, 0 = right,
   90 = down): a lamp whose cone swings from dir−sweep to dir+sweep and back over `period` frames (sweep 0
   holds still). Rock blocks its light, and so does anything solid standing in it (a slide stone, a shut
   gate, solid machinery). Stand in the cone for 6 frames running and you are seen: the room resets, as a
   death would. An alarm mark over the knight shows the count.
   Smoke (glyph S): open space the lamps cannot see into. While any part of you is in smoke you are hidden.
   The lamps' clock starts with the room's first input. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8,DEG=Math.PI/180;
const LK=Object.freeze({seen:6,range:120,width:18,period:240});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
function reset(g){
 const def=g.room.def;
 g.lights=(def.lights||[]).map((d,i)=>({id:i,x:d.c*TILE+4,y:d.r*TILE+4,dir:d.dir??90,sweep:d.sweep??0,period:d.period||LK.period,phase:d.phase||0,range:d.range||LK.range,width:d.width||LK.width,angle:0}));
 g.smoke=C().groupsOf(def,'S');
 g.watchClock=0;g.watchAwake=false;g.p.seenT=0;
 for(const l of g.lights)aim(l,0);
}
function aim(l,t){const u=((t+l.phase)%l.period)/l.period,k=u<.5?u*4-1:3-u*4;l.angle=(l.dir+l.sweep*k)*DEG;}
// Rock and solid bodies (stones, shut gates, solid machinery) block the light; the lantern and foes do not.
function blocks(g,x,y){if(C().tileAt(g,Math.floor(x/TILE),Math.floor(y/TILE))===C().SOLID)return true;
 const b=C().blockerAt(g,Math.floor(x),Math.floor(y),1,1);return !!b&&typeof b==='object'&&b.type!=='foeSolid';}
function sightClear(g,x0,y0,x1,y1){const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/3);for(let i=1;i<n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;if(blocks(g,x,y))return false;}return true;}
function inCone(g,l,x,y){
 const dx=x-l.x,dy=y-l.y,d=Math.hypot(dx,dy);if(d>l.range||d<1)return false;
 let a=Math.atan2(dy,dx)-l.angle;while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;
 return Math.abs(a)<=l.width*DEG&&sightClear(g,l.x,l.y,x,y);
}
function hidden(g,p){return g.smoke.some(s=>overlap(p.x,p.y,p.w,p.h,s.x,s.y,s.w,s.h));}
function before(g,inp){
 if(!g.lights.length)return;
 // The clock waits for the first input (a still room can be studied), as the header says.
 if(!g.watchAwake&&g.awake&&(g.players?g.coopInputActive:inp&&(inp.mx||inp.my||inp.jump||inp.dash||inp.grab||inp.strike||inp.parry||inp.portal)))g.watchAwake=true;
 if(g.watchAwake)g.watchClock++;
 for(const l of g.lights)aim(l,g.watchClock);
}
function after(g){
 if(!g.lights.length)return;
 const p=g.p;if(p.state==='dead'||p.state==='respawn'){p.seenT=0;return;}
 // Seen if any of three points of the body (head, middle, feet) is in a cone.
 const pts=[[p.x+4,p.y+1],[p.x+4,p.y+5],[p.x+4,p.y+10]];
 const seen=!hidden(g,p)&&g.lights.some(l=>pts.some(([x,y])=>inCone(g,l,x,y)));
 if(seen){if(p.seenT===0)C().emit(g,'glimpse',{x:p.x+4,y:p.y});if(++p.seenT>=LK.seen){p.seenT=0;C().emit(g,'seen',{x:p.x+4,y:p.y+5});C().kill(g,p,'seen');}}
 else p.seenT=0;
}
function mirror(g){for(const l of g.lights){l.y=g.room.h-l.y;l.dir=-l.dir;}for(const s of g.smoke)s.y=g.room.h-s.y-s.h;}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'watch',reset,before,after,afterPlayer:after,mirror});
root.BladefallPrecisionWatch=Object.freeze({LK,inCone,hidden,blocks});
})(typeof window!=='undefined'?window:globalThis);
