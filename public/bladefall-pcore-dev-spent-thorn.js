/* Departure thorns. Opt-in spentThorns:[{id,c,r,w:1,h:1,face:'up',arm:18}].
   Each rectangle is a persistent solid; only its explicitly marked face changes. First contact is
   safe indefinitely. Leaving starts a visible warning (18 simulation frames by default), then that
   face is lethal for the rest of the attempt. Other faces remain ordinary solid. Death rebuilds it.
   This spends a face, not a floor tile: it never collapses, regrows, or follows an invisible footprint. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore,TILE=8;
const SK=Object.freeze({arm:18,depth:3});
const all=g=>g.ents.filter(e=>e.type==='spentThorn');
const along=(a,n,b,m)=>a<b+m&&a+n>b;
function contact(p,e){
 if(e.face==='up')return p.y+p.h===e.y&&along(p.x,p.w,e.x,e.w);
 if(e.face==='down')return p.y===e.y+e.h&&along(p.x,p.w,e.x,e.w);
 if(e.face==='left')return p.x+p.w===e.x&&along(p.y,p.h,e.y,e.h);
 return p.x===e.x+e.w&&along(p.y,p.h,e.y,e.h);
}
function strip(e){const d=SK.depth;
 return e.face==='up'?[e.x,e.y-d,e.w,d]:e.face==='down'?[e.x,e.y+e.h,e.w,d]:e.face==='left'?[e.x-d,e.y,d,e.h]:[e.x+e.w,e.y,d,e.h];
}
function atFace(e){return e.face==='up'?{x:e.x+e.w/2,y:e.y}:e.face==='down'?{x:e.x+e.w/2,y:e.y+e.h}:e.face==='left'?{x:e.x,y:e.y+e.h/2}:{x:e.x+e.w,y:e.y+e.h/2};}
function emit(g,e,type){C().emit(g,type,{...atFace(e),id:e.label,face:e.face});}
function reset(g){
 const defs=g.room.def.spentThorns;if(!defs)return;
 g.spentThornBefore=null;
 defs.forEach((d,i)=>{
  const w=d.w??1,h=d.h??1,face=d.face??'up',arm=d.arm??SK.arm;
  if(![d.c,d.r,w,h,arm].every(Number.isInteger)||d.c<0||d.r<0||w<1||h<1||d.c+w>g.room.cols||d.r+h>g.room.rows||!['up','down','left','right'].includes(face)||arm<12||arm>120)throw new Error('Invalid spentThorns['+i+'] in '+g.room.id);
  g.ents.push({type:'spentThorn',dev:true,solid:true,id:'spentThorn'+i,label:String(d.id??i),x:d.c*TILE,y:d.r*TILE,w:w*TILE,h:h*TILE,face,arm,state:'dormant',remaining:0,remX:0,remY:0});
 });
}
function before(g){if(g.room.def.spentThorns)g.spentThornBefore={x:g.p.x,y:g.p.y,w:g.p.w,h:g.p.h,events:g.events.length};}
function after(g){
 const es=all(g);if(!es.length)return;
 const p=g.p,old=g.spentThornBefore;if(p.state==='dead'||p.state==='respawn')return;
 const teleported=old&&g.events.slice(old.events).some(e=>e.type==='echo-swap'||e.type==='portal-pass'&&e.kind==='knight');
 for(const e of es){
  const now=contact(p,e),was=old&&!teleported&&contact(old,e);
  if(e.state==='dormant'&&(now||was)){e.state='contact';emit(g,e,'spent-thorn-touch');}
  if(e.state==='contact'&&!now){e.state='arming';e.remaining=e.arm;emit(g,e,'spent-thorn-leave');continue;}
  const justArmed=e.state==='arming'&&--e.remaining===0;
  if(justArmed){e.state='armed';emit(g,e,'spent-thorn-arm');}
  if(e.state!=='armed')continue;
  const from=old&&!teleported&&!justArmed?old:p,dx=p.x-from.x,dy=p.y-from.y,n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/2)),box=strip(e);
  for(let j=0;j<=n;j++)if(C().overlap(from.x+dx*j/n,from.y+dy*j/n,p.w,p.h,...box)){C().kill(g,p,'spent-thorn');return;}
 }
}
function mirror(g){
 // Gravity already mirrors each entity body. Reflect its private face and discard the old sweep.
 for(const e of all(g))if(e.face==='up')e.face='down';else if(e.face==='down')e.face='up';
 g.spentThornBefore=null;
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'spent-thorn',reset,before,after,mirror});
root.BladefallPrecisionSpentThorn=Object.freeze({SK,all,contact,strip});
})(typeof window!=='undefined'?window:globalThis);
