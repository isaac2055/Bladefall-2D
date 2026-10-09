/* Room-bank cargo clasps. cargoClasps:[{id:'A',c:12,r:8}].
   An open, non-solid ring catches an unheld lantern and suspends it. Grab retrieves it normally;
   strike the ring to release it into current gravity. The ring stays open briefly after release.
   A caught lantern still casts shade and presses plates. The empty ring does neither.
   Keep this device after moving-object devices; its final snap prevents wind/current drift. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore,CK=Object.freeze({open:24,pulse:18});
const clasps=g=>g.ents.filter(e=>e.type==='cargoClasp');
const cargo=(g,e)=>e.cargoId!=null?g.ents.find(q=>q.type==='lantern'&&q.id===e.cargoId):null;
function anchor(e,l){l.x=e.x;l.y=e.y;l.vx=l.vy=l.remX=l.remY=0;}
function reset(g){
 const seen=new Set();
 for(const [i,d] of (g.room.def.cargoClasps||[]).entries()){
  const id=String(d.id??String.fromCharCode(65+i));
  if(seen.has(id)||!Number.isInteger(d.c)||!Number.isInteger(d.r))throw new Error('Invalid cargo clasp in '+g.room.id);
  seen.add(id);const e={type:'cargoClasp',dev:true,solid:false,id:'clasp:'+id,label:id,x:d.c*8,y:d.r*8,w:8,h:8,cargoId:null,open:0,pulse:0};
  if(e.x<0||e.y<0||e.x+8>g.room.w||e.y+8>g.room.h||C().solidAt(g,e.x,e.y,8,8))throw new Error('Cargo clasp '+id+' overlaps solid or bounds in '+g.room.id);
  g.ents.push(e);
 }
}
function detach(g,e,reason){const l=cargo(g,e);e.cargoId=null;e.open=CK.open;e.pulse=CK.pulse;if(l&&!l.held){l.vx=l.vy=l.remX=l.remY=0;}C().emit(g,reason==='pickup'?'clasp-take':'clasp-release',{x:e.x+4,y:e.y+4,label:e.label});}
function settle(g,e,catchNew){
 const l=cargo(g,e);
 if(l){if(l.held||l.returning){detach(g,e,'pickup');return;}anchor(e,l);return;}
 if(!catchNew||e.open>0)return;
 const Core=C(),used=new Set(clasps(g).filter(q=>q.cargoId!=null).map(q=>q.cargoId));
 const q=g.ents.find(q=>q.type==='lantern'&&!q.held&&!q.returning&&!used.has(q.id)&&Core.overlap(q.x,q.y,q.w,q.h,e.x,e.y,8,8));
 if(q){e.cargoId=q.id;e.pulse=CK.pulse;anchor(e,q);Core.emit(g,'clasp-catch',{x:e.x+4,y:e.y+4,label:e.label});}
}
function ready(g){for(const e of clasps(g))settle(g,e,true);}
function before(g){for(const e of clasps(g)){if(e.open>0)e.open--;if(e.pulse>0)e.pulse--;settle(g,e,true);}}
function after(g){
 const Core=C(),p=g.p;
 for(const e of clasps(g)){
  const l=cargo(g,e);
  if(l?.held){detach(g,e,'pickup');continue;}
  if(l&&p.strikeTimer>0&&!p.strikeHit.has(e.id)&&Core.overlap(...Core.strikeBox(p),e.x-2,e.y-2,12,12)){
   p.strikeHit.add(e.id);detach(g,e,'strike');continue;
  }
  settle(g,e,true);
 }
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'cargo-clasp',reset,ready,before,after});
root.BladefallPrecisionCargoClasp=Object.freeze({CK,clasps,cargo});
})(typeof window!=='undefined'?window:globalThis);
