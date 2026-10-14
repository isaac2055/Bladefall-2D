/* Precision Core — fault lines (7.280, the Fractured act): stone that remembers being touched.

   Fault stone (glyph T, only in a room with the field `fault`): solid rock with a seam of light through it.
   Touch it from any side (stand on it, hold it, bump it, brush it) and it cracks where you touched. The crack
   then runs along every fault tile joined to that one, a tile at a time, and each tile falls the moment the
   crack has run its fuse. A fallen tile comes back `rest` frames later (never on top of you).
   Room field `fault:{fuse:12, spread:6, rest:120}` (frames; every key optional, `fault:{}` uses these):
    - fuse: frames from the touch until the touched tile falls (12: land and go, no standing still).
    - spread: frames the crack takes per tile beyond it (6 = 1.33 px/frame, a little slower than a run at
      1.5 px/frame: run along a strip the moment you land and you just stay ahead of it; stop and it has you).
    - rest: frames a fallen tile stays gone.
   Tiles are joined edge to edge (not corner to corner): a separate strip is a separate fault.
   What it asks: commit. Every touch starts a clock you can see running toward the tile you stand on.
   (7.280, Fractured Line, opt-in) fault.carts:true — a cart's wheels crack fault track too (a strip rolled onto
   cracks from the tile under the wheels), so a cart on fault track has to keep rolling. Without the key only the
   knight cracks it, as before. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8;
const FK=Object.freeze({fuse:12,spread:6,rest:120});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;

function reset(g){
 const def=g.room.def;g.fault=null;
 if(!def.fault)return;
 const cfg={...FK,...(typeof def.fault==='object'?def.fault:{})};
 const cols=g.room.cols||40,rows=g.room.rows||23,at=(c,r)=>(def.map[r]||'')[c]||'.';
 const cell=new Map();
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(at(c,r)==='T'){
  const e={type:'fault',dev:true,solid:true,x:c*TILE,y:r*TILE,w:TILE,h:TILE,id:'ft'+g.ents.length,c,r,line:-1,fuse:-1,down:0,state:''};
  g.ents.push(e);cell.set(r*cols+c,e);
 }
 // Joined strips: flood fill edge to edge.
 let k=0;
 for(const e of cell.values()){
  if(e.line>=0)continue;
  const q=[e];e.line=k;
  while(q.length){const a=q.pop();for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const b=cell.get((a.r+dr)*cols+a.c+dc);if(b&&b.line<0&&a.c+dc>=0&&a.c+dc<cols){b.line=k;q.push(b);}}}
  k++;
 }
 g.fault={cfg};
}
const faults=g=>g.ents.filter(e=>e.type==='fault');

/* The clocks: cracked tiles count down and fall; fallen tiles rest and come back. */
function before(g){
 if(!g.fault)return;
 const Core=C();
 for(const e of g.ents){
  if(e.type!=='fault')continue;
  if(e.solid&&e.fuse>=0){
   if(--e.fuse<0){e.solid=false;e.down=g.fault.cfg.rest;e.state='down';Core.emit(g,'fault-fall',{x:e.x+4,y:e.y+4});}
  }else if(!e.solid){
   if(e.down>0)e.down--;
   else if(!(g.players||[g.p]).some(p=>p.state!=='dead'&&p.state!=='respawn'&&overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h))){e.solid=true;e.fuse=-1;e.state='';Core.emit(g,'fault-back',{x:e.x+4,y:e.y+4});}
  }
 }
}
/* A touch cracks the strip from the touched tile outward. */
function after(g,inp,actorOnly=false){
 if(!g.fault)return;
 const p=g.p;if(p.state==='dead'||p.state==='respawn')return;
 const fs=faults(g);let hit=null;
 for(const e of fs)if(e.solid&&e.fuse<0&&overlap(p.x-1,p.y-1,p.w+2,p.h+2,e.x,e.y,e.w,e.h)){hit=e;break;}
 if(!actorOnly&&g.fault.cfg.carts)for(const c of g.ents){if(c.type!=='cart'||c.gone)continue;
  for(const e of fs)if(e.solid&&e.fuse<0&&overlap(c.x,c.y+c.h,c.w,1,e.x,e.y,e.w,e.h)){crack(g,fs,e);break;}}
 if(hit)crack(g,fs,hit);
}
function crack(g,fs,hit){
 const {fuse,spread}=g.fault.cfg,line=fs.filter(e=>e.line===hit.line),byRC=new Map(line.map(e=>[e.c+','+e.r,e]));
 const dist=new Map([[hit,0]]),q=[hit];
 while(q.length){const a=q.shift(),d=dist.get(a);for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const b=byRC.get((a.c+dc)+','+(a.r+dr));if(b&&!dist.has(b)){dist.set(b,d+1);q.push(b);}}}
 for(const [e,d] of dist){if(!e.solid)continue;const f=fuse+spread*d;if(e.fuse<0||f<e.fuse){e.fuse=f;e.state='crack';}}
 C().emit(g,'fault-crack',{x:hit.x+4,y:hit.y+4,line:hit.line});
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'fault',reset,before,after,afterPlayer:(g,inp)=>after(g,inp,true)});
root.BladefallPrecisionFault=Object.freeze({FK});
})(typeof window!=='undefined'?window:globalThis);
