/* Movable impulse seed (Run 3). Opt in with impulseSeeds:[{id:'A',c:12,r:14}].
   A blade cut nudges an idle floating seed 24 px along the cut over an 18-tick windup.
   Solids stop its travel. A fresh cut in the following 150-tick charged window launches
   the knight away from its current centre. Touch alone does nothing. No dash/stamina refill.
   A burst cools for 45 ticks; expiry or cooldown returns it to idle at its new position.
   Seeds are not platforms, cargo, beam shields or portal passengers. */
(function(root){'use strict';
const C=()=>root.BladefallPrecisionCore,TILE=8;
const IK=Object.freeze({nudge:24,windup:18,charged:150,cooldown:45,speed:300,freeze:2});
const seeds=g=>g.ents.filter(e=>e.type==='impulseSeed');
function reset(g){
 const seen=new Set();for(const [i,d]of(g.room.def.impulseSeeds||[]).entries()){
  const label=String(d.id??String.fromCharCode(65+i));
  if(seen.has(label)||!Number.isFinite(d.c)||!Number.isFinite(d.r))throw Error('Invalid impulse seed '+label);
  seen.add(label);const e={type:'impulseSeed',dev:true,solid:false,id:'impulse:'+label,label,x:d.c*TILE,y:d.r*TILE,w:8,h:8,state:'idle',timer:0,vx:0,vy:0,remX:0,remY:0,pulse:0};
  if(C().solidAt(g,e.x,e.y,e.w,e.h))throw Error('Impulse seed '+label+' starts in solid terrain');
  g.ents.push(e);
 }
}
function emit(g,e,type,data={}){C().emit(g,type,{x:e.x+4,y:e.y+4,label:e.label,...data});}
function before(g){
 const Core=C();for(const e of seeds(g)){
  if(e.pulse>0)e.pulse--;
  if(e.state==='windup'){
   Core.moveX(g,e,e.vx*Core.DT,()=>{e.vx=0;},e);Core.moveY(g,e,e.vy*Core.DT,()=>{e.vy=0;},e,false);
   if(--e.timer<=0){e.vx=e.vy=0;e.remX=e.remY=0;e.state='charged';e.timer=IK.charged;emit(g,e,'impulse-ready');}
  }else if(e.state==='charged'&&--e.timer<=0){e.state='idle';emit(g,e,'impulse-expire');}
  else if(e.state==='cooldown'&&--e.timer<=0){e.state='idle';emit(g,e,'impulse-reset');}
 }
}
function clearContact(g,p,e){
 const Core=C(),x0=p.x+p.w/2,y0=p.y+p.h/2,dx=e.x+4-x0,dy=e.y+4-y0,n=Math.ceil(Math.hypot(dx,dy)/2);
 for(let i=1;i<n;i++)if(Core.solidAt(g,x0+dx*i/n,y0+dy*i/n,1,1))return false;
 return true;
}
function burst(g,p,e){
 const Core=C();let dx=p.x+p.w/2-e.x-4,dy=p.y+p.h/2-e.y-4;let length=Math.hypot(dx,dy);
 if(length<4){dx=-p.strikeDir.x;dy=-p.strikeDir.y;length=Math.hypot(dx,dy)||1;}
 p.vx=dx/length*IK.speed;p.vy=dy/length*IK.speed;p.remX=p.remY=0;
 p.state='normal';p.dashTimer=0;p.dashAim=false;p.ducking=false;p.varJump=0;p.autoJump=false;p.jumpGrace=0;p.forceMoveTimer=0;
 if(p.hook){p.lastRing=p.hook.ring;p.hook=null;}p.ride=null;p.zipCoast=0;
 p.liftTimer=0;p.liftX=0;p.liftY=0;if(p.move2)p.move2.wallGrace=0;
 p.coast=true;p.fling=true;p.maxFall=Core.K.flingMaxFall;p.onGround=false;
 e.state='cooldown';e.timer=IK.cooldown;e.pulse=12;g.freeze=Math.max(g.freeze,IK.freeze);
 emit(g,e,'impulse-burst',{vx:p.vx,vy:p.vy,px:p.x+p.w/2,py:p.y+p.h/2});
}
function after(g){
 const p=g.p,Core=C();if(p.state==='dead'||p.state==='respawn'||p.carrying||p.strikeTimer<=0||p.strikeHit.has('impulse:stroke'))return;
 const sb=Core.strikeBox(p),hits=seeds(g).filter(e=>!p.strikeHit.has(e.id)&&Core.overlap(...sb,e.x-2,e.y-2,12,12)&&clearContact(g,p,e));
 if(!hits.length)return;hits.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
 const e=hits[0];p.strikeHit.add('impulse:stroke');p.strikeHit.add(e.id);
 if(e.state==='idle'){
  const d=p.strikeDir,len=Math.hypot(d.x,d.y)||1;e.vx=d.x/len*IK.nudge*Core.FPS/IK.windup;e.vy=d.y/len*IK.nudge*Core.FPS/IK.windup;
  e.state='windup';e.timer=IK.windup;e.pulse=6;emit(g,e,'impulse-prime',{dx:d.x/len,dy:d.y/len});
 }else if(e.state==='charged')burst(g,p,e);
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'impulse',reset,before,after});
root.BladefallPrecisionImpulse=Object.freeze({IK,seeds,clearContact});
})(typeof window!=='undefined'?window:globalThis);
