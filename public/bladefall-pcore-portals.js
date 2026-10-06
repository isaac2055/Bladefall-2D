/* Precision Core portals (7.252). One device, two ends.
   - A portal opens on portal stone (%, pale rock) only: two tiles along one face, with open air in front.
   - The portal key fires the way you aim (8 directions; nothing held fires the way you face). The shot is
     instant and snaps to a two-tile slot on the face it hits, so a recorded input always lands the same.
   - portalMode 'one': one end is fixed by the room (portals:[{color,c,r,face}]); your shot moves your end.
     portalMode 'two': your shots alternate blue, orange, blue… and each replaces the old end of its colour.
   - When both ends exist the stone behind each opens: whatever reaches the surface falls in and comes out
     of the other end. Speed is kept and turned by quarter turns, so the direction into one face becomes the
     direction out of the other ("speedy thing goes in, speedy thing comes out"). A dash keeps dashing.
     Out of a floor, you leave fast enough to clear it.
   - A floor portal remembers how far you fell: you enter as fast as a free fall from your highest point
     (up to 420 px/s), though the knight's own fall is capped at 160. Climb higher to be flung farther.
   - Out of a portal the knight is flung: no air drag, and a fall can build to 420 px/s, until he lands,
     grabs or dashes (pressing back brakes). So a floor under a ceiling portal is a loop that gathers speed.
   - The knight, the lantern, sliding stones, foe bolts and Combat shots pass. Creatures do not (yet).
     A bolt or shot that passes becomes the knight's, exactly as if parried.
   - Barrier lines (!) stop portal shots, and the knight crossing one closes the ends he placed.
   Faces: 'u' portal on top of a floor (opens upward) · 'd' under a ceiling · 'l' on a wall's left face ·
   'r' on a wall's right face. c,r is the first of the two stone tiles (leftmost or topmost). */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8,COLS=40,ROWS=23;
const PK=Object.freeze({minOut:170,cool:4,rayMax:420});
const N={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]};
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;

/* A portal's stone tiles, the pixel box they cover, and the open cells in front of it. */
function tilesOf(pt){return pt.face==='u'||pt.face==='d'?[[pt.c,pt.r],[pt.c+1,pt.r]]:[[pt.c,pt.r],[pt.c,pt.r+1]];}
function boxOf(pt){const horiz=pt.face==='u'||pt.face==='d';return {x:pt.c*TILE,y:pt.r*TILE,w:horiz?16:8,h:horiz?8:16};}
function frontOf(pt){const [nx,ny]=N[pt.face];return tilesOf(pt).map(([c,r])=>[c+nx,r+ny]);}
function make(color,c,r,face,fixed=false){return {color,c,r,face,fixed};}

function slotOK(g,pt){
 const room=g.room;
 for(const [c,r] of tilesOf(pt)){if(c<0||c>=COLS||r<0||r>=ROWS)return false;const i=r*COLS+c;if(!room.portalable[i]||room.grid[i]!==C().SOLID)return false;}
 for(const [c,r] of frontOf(pt)){if(c<0||c>=COLS||r<0||r>=ROWS)return false;if(room.grid[r*COLS+c]===C().SOLID)return false;}
 // Not on top of the other end.
 for(const o of Object.values(g.portals))if(o&&o.color!==pt.color&&tilesOf(o).some(([a,b])=>tilesOf(pt).some(([x,y])=>a===x&&b===y)))return false;
 return true;
}
function refreshHoles(g){
 const b=g.portals.blue,o=g.portals.orange;g.portalHoles=new Set();
 if(b&&o)for(const pt of [b,o])for(const [c,r] of tilesOf(pt))g.portalHoles.add(r*COLS+c);
}

function reset(g){
 const def=g.room.def;
 g.portals=null;g.portalHoles=null;
 if(!def.portalMode)return;
 g.portals={blue:null,orange:null};g.portalNext='blue';g.portalShots=0;
 for(const d of def.portals||[])g.portals[d.color]=make(d.color,d.c,d.r,d.face,true);
 refreshHoles(g);
 g.p.portalCool=0;
}

/* The shot: a ray from the knight's middle, one pixel at a time. It lands on the first solid it meets —
   on portal stone it opens (snapped to the nearer two-tile slot), on anything else it fails. */
function fire(g,dx,dy){
 const Core=C(),p=g.p;
 const n=Math.hypot(dx,dy)||1,sx=dx/n,sy=dy/n;
 let x=p.x+4,y=p.y+5,pc=Math.floor(x/TILE),pr=Math.floor(y/TILE);
 for(let i=0;i<PK.rayMax;i++){
  x+=sx;y+=sy;const c=Math.floor(x/TILE),r=Math.floor(y/TILE);
  if(x<0||y<0||x>=Core.W||y>=Core.H)return {ok:false,x,y};
  if(g.room.grill[r*COLS+c])return {ok:false,x,y,grill:true};
  const ent=g.ents.find(e=>(e.type==='toggle'||e.type==='gate'||e.type==='held'||e.type==='slide'||e.type==='zip'||e.type==='foeSolid'||e.type==='crumble'||e.type==='combatGate'||e.type==='brittle'||e.dev&&!e.shotThrough)&&isSolid(e)&&x>=e.x&&x<e.x+e.w&&y>=e.y&&y<e.y+e.h);
  if(ent)return {ok:false,x,y};
  if(Core.tileAt(g,c,r)===Core.SOLID){
   // Which face: the side the ray came in through.
   let face;
   if(c!==pc&&r!==pr)face=Math.abs(sx)>=Math.abs(sy)?(sx>0?'l':'r'):(sy>0?'u':'d');
   else if(c!==pc)face=sx>0?'l':'r';else face=sy>0?'u':'d';
   const horiz=face==='u'||face==='d';
   const along=horiz?x/TILE-c:y/TILE-r;           // where on the tile it hit, 0..1
   const tries=horiz?(along<.5?[[c-1,r],[c,r]]:[[c,r],[c-1,r]]):(along<.5?[[c,r-1],[c,r]]:[[c,r],[c,r-1]]);
   return {ok:true,x,y,face,tries,c,r};
  }
  pc=c;pr=r;
 }
 return {ok:false,x,y};
}
function isSolid(e){
 switch(e.type){case 'toggle':case 'held':return e.solid;case 'gate':return !e.open;case 'slide':case 'zip':return true;
  case 'foeSolid':return e.solid;case 'crumble':return !e.broken;case 'combatGate':case 'brittle':return !e.open;default:return !!(e.dev&&e.solid);}
}
function place(g,dx,dy){
 const Core=C(),p=g.p,mode=g.room.def.portalMode;
 const color=mode==='one'?'blue':g.portalNext;
 const hit=fire(g,dx,dy);let pt=null;
 if(hit.ok)for(const [c,r] of hit.tries){const cand=make(color,c,r,hit.face);if(slotOK(g,cand)){pt=cand;break;}}
 g.portalShots++;
 if(!pt){Core.emit(g,'portal-fizzle',{x:hit.x,y:hit.y,color,grill:!!hit.grill});return;}
 g.portals[color]=pt;
 if(mode==='two')g.portalNext=color==='blue'?'orange':'blue';
 refreshHoles(g);
 const b=boxOf(pt);Core.emit(g,'portal-open',{x:b.x+b.w/2,y:b.y+b.h/2,color,face:pt.face});
}

/* Quarter turns: the direction into the entry face becomes the direction out of the exit face. */
function turn(vx,vy,inFace,outFace){
 const [ix,iy]=N[inFace],[ox,oy]=N[outFace];
 // Find R with R(-in)=out among the four rotations.
 const rots=[[1,0,0,1],[0,-1,1,0],[-1,0,0,-1],[0,1,-1,0]];
 for(const [a,b,c,d] of rots){if(a*-ix+b*-iy===ox&&c*-ix+d*-iy===oy)return [a*vx+b*vy,c*vx+d*vy];}
 return [vx,vy];
}
/* Put a w×h body just outside the exit face, keeping its place along the portal. */
function exitPos(from,to,x,y,w,h){
 const fb=boxOf(from),tb=boxOf(to),fh=from.face==='u'||from.face==='d',th=to.face==='u'||to.face==='d';
 let t=fh?(x-fb.x)/(16-w||1):(y-fb.y)/(16-h||1);t=Math.max(0,Math.min(1,t));
 if(th){const nx=Math.round(tb.x+t*(16-w));return {x:Math.max(tb.x,Math.min(tb.x+16-w,nx)),y:to.face==='u'?tb.y-h:tb.y+8};}
 const ny=Math.round(tb.y+t*(16-h));return {x:to.face==='l'?tb.x-w:tb.x+8,y:Math.max(tb.y,Math.min(tb.y+16-h,ny))};
}
function linked(g){return g.portals&&g.portals.blue&&g.portals.orange;}
/* Which open end, if any, a body has gone into (it overlaps the opened stone). */
function entered(g,x,y,w,h){
 if(!linked(g))return null;
 for(const pt of [g.portals.blue,g.portals.orange]){const b=boxOf(pt);if(overlap(x,y,w,h,b.x,b.y,b.w,b.h))return pt;}
 return null;
}
function other(g,pt){return pt.color==='blue'?g.portals.orange:g.portals.blue;}
function carry(g,body,vxKey,vyKey,kind){
 const pt=entered(g,Math.round(body.x),Math.round(body.y),body.w,body.h);if(!pt)return false;
 const to=other(g,pt),pos=exitPos(pt,to,body.x,body.y,body.w,body.h);
 let [vx,vy]=turn(body[vxKey],body[vyKey],pt.face,to.face);
 if(to.face==='u'&&vy>-PK.minOut)vy=-PK.minOut;         // out of a floor: fast enough to clear it
 body.x=pos.x;body.y=pos.y;body[vxKey]=vx;body[vyKey]=vy;if('remX' in body){body.remX=0;body.remY=0;}
 // A bolt that goes through your portal is yours, as if you had parried it: it lights coils and stones.
 if(kind==='bolt')body.friendly=true;else if(kind==='shot')body.reflected=true;
 C().emit(g,'portal-pass',{x:body.x+body.w/2,y:body.y+body.h/2,kind,from:pt.color});
 return true;
}

function before(g,inp){
 if(!g.portals)return;
 const Core=C(),p=g.p;
 if(p.portalCool>0)p.portalCool--;
 // Fire: the direction held at the press, or the way you face.
 if(g.buf.portal>0&&g.room.def.portalMode!=='fixed'&&p.state!=='dead'&&p.state!=='respawn'&&!p.carrying){
  g.buf.portal=0;let dx=inp.mx,dy=inp.my;if(!dx&&!dy)dx=p.facing;place(g,dx,dy);
 }
 if(!linked(g))return;
 // Things that are not the knight: the lantern, sliding stones, foe bolts.
 for(const e of g.ents){
  if(e.type==='lantern'&&!e.held&&!e.returning)carry(g,e,'vx','vy','lantern');
  else if(e.type==='slide'&&e.moving){const v={x:e.x,y:e.y,w:e.w,h:e.h,vx:e.dirX,vy:e.dirY};
   if(carry(g,v,'vx','vy','stone')){e.x=v.x;e.y=v.y;e.dirX=Math.sign(Math.round(v.vx));e.dirY=Math.sign(Math.round(v.vy));e.remX=e.remY=0;}}
 }
 if(g.bolts)for(const b of g.bolts)if(b.alive)carry(g,b,'vx','vy','bolt');
}
function after(g,inp){
 if(!g.portals)return;
 const Core=C(),p=g.p;
 // A barrier line closes the ends you placed.
 const c0=Math.floor(p.x/TILE),c1=Math.floor((p.x+p.w-1)/TILE),r0=Math.floor(p.y/TILE),r1=Math.floor((p.y+p.h-1)/TILE);
 let crossed=false;for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(r>=0&&r<ROWS&&c>=0&&c<COLS&&g.room.grill[r*COLS+c])crossed=true;
 if(crossed){let any=false;for(const k of ['blue','orange'])if(g.portals[k]&&!g.portals[k].fixed){g.portals[k]=null;any=true;}
  if(any){refreshHoles(g);Core.emit(g,'portal-close',{x:p.x+4,y:p.y+5});}}
 // Combat shots move during the Combat step, just before this.
 if(g.combat&&linked(g))for(const s of g.combat.shots)if(!s.gone)carry(g,s,'vx','vy','shot');
 if(!linked(g)||p.portalCool>0)return;
 const pt=entered(g,p.x,p.y,p.w,p.h);
 if(!pt){trackPeak(p);return;}
 const to=other(g,pt),pos=exitPos(pt,to,p.x,p.y,p.w,p.h);
 // A floor portal remembers the height of the fall: you go in as fast as a free fall from your peak
 // (the knight's own fall is capped; a portal's is not, up to the fling limit). Height sets distance.
 if(pt.face==='u'&&p.vy>0&&p.airPeakY!=null){const h=p.y-p.airPeakY;if(h>0)p.vy=Math.max(p.vy,Math.min(C().K.flingMaxFall,Math.sqrt(2*C().K.gravity*h)));}
 let [vx,vy]=turn(p.vx,p.vy,pt.face,to.face);
 if(to.face==='u'&&vy>-PK.minOut)vy=-PK.minOut;
 if(p.state==='dash'){const [dx,dy]=turn(p.dashDir.x,p.dashDir.y,pt.face,to.face);p.dashDir={x:dx,y:dy};}
 if(p.state==='climb')p.state='normal';
 p.x=pos.x;p.y=pos.y;p.remX=p.remY=0;p.vx=vx;p.vy=vy;p.onGround=false;p.portalCool=PK.cool;p.fling=true;
 if(vx)p.facing=Math.sign(vx);
 if(p.carrying){p.carrying.x=p.x;p.carrying.y=p.y-8;}
 p.airPeakY=p.y;
 Core.emit(g,'portal-pass',{x:p.x+4,y:p.y+5,kind:'knight',from:pt.color});
}
function trackPeak(p){if(p.onGround||p.state==='climb'||p.airPeakY==null)p.airPeakY=p.y;else if(p.y<p.airPeakY)p.airPeakY=p.y;}
/* For the view: where a shot fired now would open (without firing it). */
function preview(g,dx,dy){
 if(!g.portals)return null;
 if(!dx&&!dy)dx=g.p.facing;
 const color=g.room.def.portalMode==='one'?'blue':g.portalNext;
 const hit=fire(g,dx,dy);if(!hit.ok)return {ok:false,x:hit.x,y:hit.y,color};
 for(const [c,r] of hit.tries){const cand=make(color,c,r,hit.face);if(slotOK(g,cand))return {ok:true,x:hit.x,y:hit.y,color,pt:cand,box:boxOf(cand)};}
 return {ok:false,x:hit.x,y:hit.y,color};
}
root.BladefallPrecisionPortals=Object.freeze({PK,reset,before,after,preview,boxOf,tilesOf,N,refresh:refreshHoles,turn,linked,other,exitPos,entered});
})(typeof window!=='undefined'?window:globalThis);
