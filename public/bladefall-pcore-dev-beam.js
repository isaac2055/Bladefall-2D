/* Precision Core — light (7.254): the Palace Path's mirrors and shutters (Part XIX, levels 180–189) and the
   Sunspire's light through portals (Part XX, levels 190–199).

   Emitter (room def `beams:[{c,r,dir}]`, dir r/l/u/d): a sun-window that throws a straight beam. The beam
   runs until rock, a closed shutter, the lantern or a solid thing stops it. It burns: touching it is death.
   Stand in its shade.
   Mirror (glyphs / and \): turns a beam a quarter turn. Strike a mirror and it swaps to the other slant.
   Shutter (glyph X, a rectangle; room def `shutters:[{open,shut,offset}]` in frames, defaults 60/60/0):
   a louvre that opens and shuts on a beat, stopping the beam while shut. You can pass through either way.
   A tally stone (c) that the beam falls on is lit, as if touched.
   The lantern stops a beam: carry it and you carry shade.
   Portals: a beam that reaches an open end comes out of the other, turned the way the knight would be. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8;
const D={r:[1,0],l:[-1,0],u:[0,-1],d:[0,1]};
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
function reset(g){
 const def=g.room.def,Core=C(),COLS=g.room.cols;
 g.beams=null;
 const mirrors=[];def.map.forEach((row,r)=>{for(let c=0;c<COLS;c++){const ch=row[c];if(ch==='/'||ch==='\\')g.ents.push({type:'mirror',dev:true,x:c*TILE,y:r*TILE,w:8,h:8,slant:ch,id:'mr'+g.ents.length,timer:0});}});
 const sh=Core.groupsOf(def,'X');
 sh.forEach((b,i)=>{const d=(def.shutters||[])[i]||{};const e={type:'shutter',dev:true,x:b.x,y:b.y,w:b.w,h:b.h,beat:{open:d.open??60,shut:d.shut??60,offset:d.offset||0},id:'sh'+i};e.open=shutterOpen(e,0);g.ents.push(e);});
 if(!def.beams)return;
 g.beams={emit:def.beams.map(b=>({c:b.c,r:b.r,dir:b.dir})),paths:[],clock:0,harmless:!!def.beamsHarmless};
}
// A spent foothold, cart or other device may initialize after the beam module.
// Trace only once all device reset hooks have supplied their actual solid bodies.
function ready(g){if(g.beams)trace(g);}
function shutterOpen(e,clock){const cyc=e.beat.open+e.beat.shut,k=((clock+e.beat.offset)%cyc+cyc)%cyc;return k<e.beat.open;}
/* Follow every beam cell by cell. Returns the list of segments [x0,y0,x1,y1] in pixels. */
function trace(g){
 const Core=C(),P=root.BladefallPrecisionPortals,paths=[],lit=new Set(),COLS=g.room.cols,ROWS=g.room.rows;
 const mirrorAt=new Map();for(const e of g.ents)if(e.type==='mirror')mirrorAt.set((e.y/TILE)*COLS+e.x/TILE,e);
 const blocking=g.ents.filter(e=>(e.type==='shutter'&&!e.open)||(e.type==='lantern'&&!e.returning)||(e.type!=='shutter'&&e.type!=='mirror'&&Core.blockerAt&&isSolidEnt(e)));
 for(const em of g.beams.emit){
  let c=em.c,r=em.r,[dx,dy]=D[em.dir],sx=c*TILE+4,sy=r*TILE+4,steps=0;
  const seg=()=>{paths.push([sx,sy,c*TILE+4,r*TILE+4]);};
  while(steps++<Math.max(400,4*(COLS+ROWS))){
   const nc=c+dx,nr=r+dy;
   if(nc<0||nc>=COLS||nr<0||nr>=ROWS){c=nc;r=nr;seg();break;}
   const i=nr*COLS+nc;
   // Portal: an open end swallows the beam and the other end throws it out, turned.
   if(g.portalHoles&&g.portalHoles.has(i)&&P){
    const pt=[g.portals.blue,g.portals.orange].find(q=>q&&P.tilesOf(q).some(([a,b])=>a===nc&&b===nr));
    if(pt){c=nc;r=nr;seg();const to=P.other(g,pt),k=P.tilesOf(pt).findIndex(([a,b])=>a===nc&&b===nr);
     const [ox,oy]=P.N[to.face],[tc,tr]=P.tilesOf(to)[k];const [vx,vy]=P.turn(dx,dy,pt.face,to.face);
     dx=Math.sign(Math.round(vx));dy=Math.sign(Math.round(vy));c=tc;r=tr;sx=c*TILE+4;sy=r*TILE+4;continue;}
   }
   if(Core.tileAt(g,nc,nr)===Core.SOLID){c=nc;r=nr;paths.push([sx,sy,c*TILE+4-dx*4,r*TILE+4-dy*4]);break;}
   const cx=nc*TILE+4,cy=nr*TILE+4;
   // A blocker stops the beam if it covers any of the beam's burning band in this cell (the same 2 px the
   // burn test uses), so a carried lantern shades every pixel it covers. The beam ends at its face.
   const bx=dx?nc*TILE:cx-1,by=dy?nr*TILE:cy-1,bw=dx?TILE:2,bh=dy?TILE:2;
   const hit=blocking.filter(e=>overlap(bx,by,bw,bh,e.x,e.y,e.w,e.h));
   if(hit.length){c=nc;r=nr;let ex=cx,ey=cy;
    if(dx>0)ex=Math.min(...hit.map(e=>e.x));else if(dx<0)ex=Math.max(...hit.map(e=>e.x+e.w));
    else if(dy>0)ey=Math.min(...hit.map(e=>e.y));else ey=Math.max(...hit.map(e=>e.y+e.h));
    if(dx)ex=Math.max(nc*TILE,Math.min(ex,nc*TILE+TILE));if(dy)ey=Math.max(nr*TILE,Math.min(ey,nr*TILE+TILE));
    paths.push([sx,sy,ex-dx,ey-dy]);break;}
   c=nc;r=nr;
   for(const e of g.ents)if(e.type==='stone'&&!e.lit&&cx>=e.x&&cx<e.x+e.w&&cy>=e.y&&cy<e.y+e.h)lit.add(e);
   const m=mirrorAt.get(i);
   if(m){seg();sx=cx;sy=cy;if(m.slant==='/'){[dx,dy]=[-dy,-dx];}else{[dx,dy]=[dy,dx];}}
  }
 }
 g.beams.paths=paths;
 for(const e of lit){e.lit=true;Core.emit(g,'stone-lit',{x:e.x+4,y:e.y+4,left:g.ents.filter(s=>s.type==='stone'&&!s.lit).length,beam:true});}
}
function isSolidEnt(e){if(e.gone)return false;switch(e.type){case 'toggle':case 'held':return e.solid;case 'gate':return !e.open;case 'slide':case 'zip':return true;case 'crumble':return !e.broken;case 'foeSolid':return !!e.solid;default:return !!(e.dev&&e.solid);}}
function before(g){
 const Core=C();
 if(g.beams&&g.awake)g.beams.clock++;
 const clock=g.beams?g.beams.clock:g.roomFrame;
 for(const e of g.ents){
  if(e.type==='shutter'){const o=shutterOpen(e,clock);if(o!==e.open){e.open=o;Core.emit(g,o?'shutter-open':'shutter-shut',{x:e.x+e.w/2,y:e.y+e.h/2});}}
  else if(e.type==='mirror'&&e.timer>0)e.timer--;
 }
}
function turnMirror(g,p){
 const Core=C();
 // The blade turns a mirror.
 if(p.strikeTimer>0){const sb=Core.strikeBox(p);for(const e of g.ents){if(e.type!=='mirror'||e.timer>0||p.strikeHit.has(e.id)||!overlap(...sb,e.x-2,e.y-2,e.w+4,e.h+4))continue;p.strikeHit.add(e.id);e.slant=e.slant==='/'?'\\':'/';e.timer=12;Core.emit(g,'mirror',{x:e.x+4,y:e.y+4});}}
}
function burn(g,p){
 const Core=C();
 if(g.beams.harmless||p.state==='dead'||p.state==='respawn')return;
 const hx=p.x,hy=p.y,hw=p.w,hh=9;
 for(const [x0,y0,x1,y1]of g.beams.paths){const bx=Math.min(x0,x1)-1,by=Math.min(y0,y1)-1,bw=Math.abs(x1-x0)+2,bh=Math.abs(y1-y0)+2;
  if(overlap(hx,hy,hw,hh,bx,by,bw,bh)){Core.kill(g,p,'light');return;}}
}
function after(g){
 turnMirror(g,g.p);if(!g.beams||g.players)return;trace(g);burn(g,g.p);
}
function afterPlayers(g){
 if(!g.beams)return;trace(g);
 for(const [i,p]of g.players.entries()){g.coopActor=i;burn(g,p);}g.coopActor=null;
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'beam',reset,ready,before,after,afterPlayer:g=>turnMirror(g,g.p),afterPlayers});
root.BladefallPrecisionBeam=Object.freeze({trace,shutterOpen});
})(typeof window!=='undefined'?window:globalThis);
