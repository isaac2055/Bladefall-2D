/* Precision Core — the Foundry (7.254, Part XI, levels 107–114): anvils, belts and moulds.

   Anvil (glyph N): solid iron. A downward cut on an anvil rebounds you far higher than a seed pod
   (330 px/s against 210) and returns your dash. It answers only the downward cut: the precision
   mirror of the Foundry's downward strike.
   Belts (glyph { runs left, } runs right): solid floor that carries whatever stands on it at 60 px/s —
   the knight and the lantern. Jump off a belt and you keep its speed.
   Mould (glyph U): an empty casting frame you can pass through. Strike it and it sets into solid iron
   for the rest of the attempt: a foothold you make. It will not set around the knight. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8,DT=1/60;
const NK=Object.freeze({anvil:-330,belt:60});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
function reset(g){
 const def=g.room.def,Core=C(),room=g.room,COLS=room.cols,ROWS=room.rows;
 room.belt=room.belt||new Int8Array(COLS*ROWS);
 def.map.forEach((row,r)=>{for(let c=0;c<COLS;c++){const ch=row[c];
  if(ch==='{'||ch==='}'){room.grid[r*COLS+c]=Core.SOLID;room.belt[r*COLS+c]=ch==='{'?-1:1;}
  else if(ch==='N')g.ents.push({type:'anvil',dev:true,solid:true,x:c*TILE,y:r*TILE,w:8,h:8,id:'an'+g.ents.length,timer:0});
  else if(ch==='U')g.ents.push({type:'mould',dev:true,solid:false,x:c*TILE,y:r*TILE,w:8,h:8,id:'mo'+g.ents.length,cast:false,pending:false});
 }});
}
function beltUnder(g,x,y,w,h){
 const room=g.room,COLS=room.cols,ROWS=room.rows;if(!room.belt)return 0;const bottom=y+h;if(bottom%TILE)return 0;const r=bottom/TILE;if(r>=ROWS)return 0;
 const c0=Math.floor(x/TILE),c1=Math.floor((x+w-1)/TILE);let d=0;
 for(let c=c0;c<=c1;c++){const v=room.belt[r*COLS+c];if(v)d=v;}
 return d;
}
function forces(g,p){
 if(!g.room.belt)return;
 const d=p.onGround?beltUnder(g,p.x,p.y,p.w,p.h):0;
 if(d){p.pushX=(p.pushX||0)+d*NK.belt*DT;p.liftX=d*NK.belt;p.liftY=0;p.liftTimer=Math.max(p.liftTimer,2);}
}
function after(g){
 const Core=C(),p=g.p;
 if(g.room.belt)for(const e of g.ents){if(e.type!=='lantern'||e.held||e.returning)continue;const d=beltUnder(g,e.x,e.y,e.w,e.h);if(d)Core.moveX(g,e,d*NK.belt*DT);}
 for(const e of g.ents){
  if(e.type==='mould'&&e.pending&&!overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h)){e.pending=false;e.solid=true;}
 }
 if(!(p.strikeTimer>0))return;
 const sb=Core.strikeBox(p),d=p.strikeDir;
 for(const e of g.ents){
  if(e.type!=='anvil'&&e.type!=='mould')continue;
  const key='nk'+e.id;if(p.strikeHit.has(key)||!overlap(...sb,e.x-2,e.y-2,e.w+4,e.h+4))continue;
  if(e.type==='anvil'){
   p.strikeHit.add(key);
   if(d.y>0){p.vy=NK.anvil;p.varJumpSpeed=p.vy;p.varJump=Math.round(.12*60);p.autoJump=true;p.jumpGrace=0;Core.refillDash(g,p);p.stamina=Core.K.climbMaxStamina;g.freeze=3;Core.emit(g,'anvil',{x:e.x+4,y:e.y});}
   else Core.emit(g,'guard-block',{x:e.x+4,y:e.y+4});
  }else if(!e.cast){
   p.strikeHit.add(key);e.cast=true;
   if(overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h))e.pending=true;else e.solid=true;
   Core.emit(g,'cast',{x:e.x+4,y:e.y+4});
  }
 }
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'foundry',reset,forces,after});
root.BladefallPrecisionFoundry=Object.freeze({NK,beltUnder});
})(typeof window!=='undefined'?window:globalThis);
