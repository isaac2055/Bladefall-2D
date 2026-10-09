/* Moving hook carriers (opt-in room-bank entity).
   movingHooks:[{id:'A',c,r,w:2,h:1,to:[dx,dy],period:240,phase:0}]
   Tiles for geometry, frames for a complete eased out-and-back cycle. Each visible solid carries
   a ring below its centre. Motion starts on room input. Fixed hooks retain their original code.
   The rope carries relative swing velocity plus actual carrier velocity exactly once. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore,T=8,DT=1/60;
const carriers=g=>g.ents.filter(e=>e.type==='hookCarrier');
function point(e){const u=(((e.clock+e.phase)%e.period+e.period)%e.period)/e.period,k=u<.5?u*2:2-u*2,s=k*k*(3-2*k);return {x:e.ox+e.dx*s,y:e.oy+e.dy*s};}
function mount(e,r){r.x=e.x+e.remX+e.w/2-4;r.y=e.y+e.remY+e.h+2;}
function reset(g){
 const defs=g.room.def.movingHooks||[],labels=new Set();
 if(!Array.isArray(defs))throw Error('movingHooks must be an array');
 defs.forEach((d,i)=>{
  const label=String(d.id??i),w=d.w??2,h=d.h??1;
  if(labels.has(label))throw Error('Duplicate moving hook id: '+label);labels.add(label);
  if(![d.c,d.r,w,h,d.to?.[0],d.to?.[1],d.period??240,d.phase??0].every(Number.isFinite)||w<=0||h<=0||(d.period??240)<60)throw Error('Invalid moving hook geometry: '+label);
  for(const [c,r]of[[d.c,d.r],[d.c+d.to[0],d.r+d.to[1]]])if(c<0||r<0||c+w>g.room.cols||r+h+1.25>g.room.rows)throw Error('Moving hook outside room: '+label);
  const id='moving-hook:'+String(d.id??i),e={type:'hookCarrier',dev:true,solid:true,id,label:String(d.id??i),x:d.c*T,y:d.r*T,w:(d.w||2)*T,h:(d.h||1)*T,ox:d.c*T,oy:d.r*T,dx:(d.to?.[0]||0)*T,dy:(d.to?.[1]||0)*T,period:Math.round(d.period||240),phase:d.phase||0,clock:0,remX:0,remY:0,vx:0,vy:0,stepX:0,stepY:0,blocked:false};
  const p=point(e);e.x=Math.round(p.x);e.y=Math.round(p.y);e.remX=p.x-e.x;e.remY=p.y-e.y;
  const r={type:'ring',dev:true,movingHook:true,carrierId:id,id:id+':ring',w:8,h:8};mount(e,r);g.ents.push(e,r);
 });
}
function release(g,p,why){const h=p.hook;if(!h?.ring.movingHook)return;C().emit(g,'moving-unhook',{id:h.ring.carrierId,x:p.x+4,y:p.y+4,why,vx:p.vx,vy:p.vy});p.liftTimer=0;}
function detach(g,why){const p=g.p;if(!p.hook?.ring.movingHook)return;release(g,p,why);p.lastRing=p.hook.ring;p.hook=null;p.state='normal';p.coast=true;p.fling=false;C().emit(g,'moving-hook-blocked',{x:p.x+4,y:p.y+4,why});C().emit(g,'unhook',{x:p.x+4,y:p.y+4,why});}
function moveAxis(g,e,delta,axis){
 const key=axis?'remY':'remX',total=e[key]+delta,n=Math.round(total),s=Math.sign(n);e[key]=0;
 for(let i=0;i<Math.abs(n);i++){
  if(C().blockerAt(g,e.x+(axis?0:s),e.y+(axis?s:0),e.w,e.h,e)){e.blocked=true;return;}
  C().moveSolid(g,e,axis?0:s,axis?s:0);e.remX=axis?e.remX:0;e.remY=axis?0:e.remY;
 }
 e[key]=total-n;
}
function before(g){
 const Core=C(),p=g.p;
 for(const e of carriers(g)){
  const r=g.ents.find(x=>x.id===e.id+':ring'),oldX=e.x+e.remX,oldY=e.y+e.remY,wasBlocked=e.blocked,rider=Core.riderOf(g,e);e.blocked=false;
  if(g.awake)e.clock++;
  const q=point(e);moveAxis(g,e,q.x-(e.x+e.remX),0);moveAxis(g,e,q.y-(e.y+e.remY),1);
  // Pause the rail clock at a blocker; opening a door must not cause a catch-up teleport.
  if(e.blocked&&g.awake)e.clock--;
  e.stepX=e.x+e.remX-oldX;e.stepY=e.y+e.remY-oldY;e.vx=e.stepX/DT;e.vy=e.stepY/DT;mount(e,r);
  if(rider){p.liftX=e.vx;p.liftY=e.vy;p.liftTimer=Core.K.liftGraceFrames;}
  if(e.blocked&&!wasBlocked)Core.emit(g,'moving-carrier-stop',{id:e.id,x:r.x+4,y:r.y+4});
  if(g.awake&&(e.clock+e.phase)%(e.period/2)===0)Core.emit(g,'moving-hook-turn',{id:e.id,x:r.x+4,y:r.y+4});
  const h=p.hook;if(h?.ring===r){
   if(Math.hypot(e.stepX,e.stepY)>8){detach(g,'anchor-discontinuity');continue;}
   if(h.carrierVX!==undefined){p.vx+=e.vx-h.carrierVX;p.vy+=e.vy-h.carrierVY;}
   h.carrierVX=e.vx;h.carrierVY=e.vy;p.liftTimer=0;
  }
 }
}
function forces(g,p,inp){
 const h=p.hook;if(p.state!=='hook'||!h?.ring.movingHook)return;
 const e=g.ents.find(x=>x.id===h.ring.carrierId);if(!e){detach(g,'missing-carrier');return;}
 const H=root.BladefallPrecisionHook.HK;
 if(h.carrierVX===undefined){h.carrierVX=e.vx;h.carrierVY=e.vy;p.liftTimer=0;C().emit(g,'moving-hook',{id:e.id,x:h.ring.x+4,y:h.ring.y+4});}
 if(inp.my<0)h.len=Math.max(H.minLen,h.len-H.reel*DT);else if(inp.my>0)h.len=Math.min(H.maxLen,h.len+H.reel*DT);
 let vx=p.vx-e.vx,vy=p.vy-e.vy+H.gravity*DT;
 const dx=p.x+4-(h.ring.x+4-e.stepX),dy=p.y+4-(h.ring.y+4-e.stepY),d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;
 if(d<h.len&&!(inp.my>0))h.len=Math.max(Math.min(h.len,H.takeUp),d);
 if(inp.mx)vx+=inp.mx*H.pump*DT*Math.abs(uy);
 const out=vx*ux+vy*uy;if(d>=h.len-.01&&out>0){vx-=out*ux;vy-=out*uy;}
 const nx=dx+vx*DT,ny=dy+vy*DT,nd=Math.hypot(nx,ny);
 if(nd>h.len){const k=h.len/nd;vx=(nx*k-dx)/DT;vy=(ny*k-dy)/DT;}
 p.vx=vx+e.vx;p.vy=vy+e.vy;if(p.vx)p.facing=Math.sign(p.vx);
}
function after(g){
 const p=g.p,h=p.hook;if(p.state!=='hook'||!h?.ring.movingHook)return;
 const rx=h.ring.x+4,ry=h.ring.y+4,dx=p.x+4-rx,dy=p.y+4-ry,n=Math.ceil(Math.hypot(dx,dy)/2);
 for(let i=1;i<n;i++)if(C().solidAt(g,rx+dx*i/n,ry+dy*i/n,1,1)){detach(g,'rope-obstructed');return;}
 if(Math.hypot(dx,dy)>h.len+4)detach(g,'body-obstructed');
}
// Move carriers before hook catches/releases; moving rope forces replace only the opt-in branch.
const list=root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[],index=list.findIndex(x=>x.name==='hook');
list.splice(index<0?list.length:index,0,{name:'moving-hook',reset,before,forces,after});
root.BladefallPrecisionMovingHook=Object.freeze({carriers,release,point});
})(typeof window!=='undefined'?window:globalThis);
