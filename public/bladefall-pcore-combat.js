/* Combat Rooms: deterministic actors in the Precision Core, not another player controller.
   All movement uses the core's pixel sweeps. Pogo uses its existing seed-pod rebound.
   Attack -> tell -> committed motion -> recovery. No body-contact damage, random rolls,
   hidden completion receipts, or per-room player impulses. */
(function(root){
'use strict';
const C=root.BladefallPrecisionCore;
const K=Object.freeze({parry:9,parryRecovery:18,guardTell:27,guardActive:9,guardRecover:48,
 wingTell:27,wingActive:34,shotTell:32,shotCooldown:96,shotSpeed:86,houndTell:36,houndSpeed:160});
const hit=(a,b)=>C.overlap(a.x,a.y,a.w,a.h,b.x,b.y,b.w,b.h);
const center=a=>({x:a.x+a.w/2,y:a.y+a.h/2});
const event=(g,type,a,data={})=>C.emit(g,type,{...center(a),...data});
function reset(g){
 g.combat=null;
 if(!g.room.def.combat)return;
 g.freeze=0;g.prev={};for(const k in g.buf)g.buf[k]=0;
 const def=g.room.def.combat;
 g.combat={awake:!def.waitForMove,shots:[],serial:0,parries:0,kills:0,pogos:0,receivers:[],enemies:[],hits:0};
 for(const [i,d]of (def.enemies||[]).entries()){
  const size=d.kind==='wing'?[12,10]:d.kind==='hound'?[16,10]:[12,16];
  const e={...d,id:'enemy:'+i,w:size[0],h:size[1],ox:d.x,oy:d.y,remX:0,remY:0,vx:0,vy:0,
   hp:d.kind==='sentry'?2:d.kind==='hound'?3:2,state:'idle',t:d.delay||0,face:d.face||-1,
   cooldown:d.delay??30,stun:0,exposed:0,flash:0,attackId:0};
  g.combat.enemies.push(e);
 }
 for(const [i,r]of (def.receivers||[]).entries())g.combat.receivers.push({...r,id:r.id||'coil:'+i,w:10,h:10,lit:false});
 for(const d of def.doors||[])g.ents.push({...d,type:d.brittle?'brittle':'combatGate',id:'door:'+g.ents.length,open:false});
}
function startAttack(g,e,p){
 const a=center(e),b=center(p),dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy)||1;
 e.face=dx<0?-1:1;e.aimX=dx/n;e.aimY=dy/n;e.state='tell';
 e.t=e.kind==='sentry'?K.shotTell:e.kind==='hound'?K.houndTell:e.kind==='wing'?K.wingTell:K.guardTell;
 e.attackId++;event(g,'enemy-tell',e,{kind:e.kind});
}
function parry(g,e){
 const p=g.p;
 g.combat.parries++;C.parrySuccess(g,p);
 if(e){e.state='recover';e.t=K.guardRecover;e.exposed=90;e.stun=12;e.vx=0;e.vy=0;}
 event(g,'parry',p,{enemy:e?.id||null});
}
function hurt(g,cause){g.combat.hits++;C.kill(g,g.p,cause);}
function before(g,inp){
 if(!g.combat)return;
 // The core wakes the room on the first input and arms the shared parry (C.parryStep).
 if(!g.awake)return;
 g.combat.awake=true;
 const p=g.p;
 for(const e of g.combat.enemies){
  if(e.dead)continue;
  if(e.flash>0)e.flash--;if(e.exposed>0)e.exposed--;
  if(e.stun>0){e.stun--;moveActor(g,e);continue;}
  if(e.kind!=='wing'&&e.kind!=='sentry'){
   e.vy=Math.min(160,e.vy+C.K.gravity*C.DT);
   C.moveY(g,e,e.vy*C.DT,()=>{e.vy=0;});
  }
  if(e.state==='tell'){
   if(--e.t<=0){
    if(e.kind==='sentry'){
     const a=center(e);g.combat.shots.push({id:++g.combat.serial,x:a.x-2,y:a.y-2,w:4,h:4,
      remX:0,remY:0,vx:e.aimX*K.shotSpeed,vy:e.aimY*K.shotSpeed,life:300,reflected:false});
     e.state='recover';e.t=K.shotCooldown;event(g,'enemy-shot',e);
    }else{e.state='attack';e.t=e.kind==='wing'?K.wingActive:e.kind==='hound'?80:K.guardActive;}
   }
  }else if(e.state==='attack'){
   if(e.kind==='wing'){e.vx=e.aimX*110;e.vy=e.aimY*110;moveActor(g,e);}
   if(e.kind==='hound'){
    e.vx=e.face*K.houndSpeed;
    C.moveX(g,e,e.vx*C.DT,b=>{
     if(b?.type==='brittle'){b.open=true;event(g,'breach',b);}
     else if(b?.type==='foeSolid')root.BladefallPrecisionFoes?.breakProxy(g,b);
     e.state='recover';e.t=65;e.exposed=90;e.vx=0;
    });
   }
   if(--e.t<=0){e.state='recover';e.t=K.guardRecover;e.vx=e.vy=0;}
  }else if(e.state==='recover'){
   if(--e.t<=0){e.state='idle';e.cooldown=24;}
  }else{
   if(e.cooldown>0)e.cooldown--;
   const a=center(e),b=center(p),dx=b.x-a.x,dy=b.y-a.y;
   const range=e.kind==='guard'?30:e.kind==='hound'?180:240;
   if(e.cooldown<=0&&Math.abs(dx)<range&&Math.abs(dy)<(e.kind==='guard'?22:150)&&visible(g,a,b))startAttack(g,e,p);
   else if(e.kind==='guard'&&Math.abs(dx)>23&&Math.abs(dx)<95){
    e.face=dx<0?-1:1;
    // Walk only where there is footing; never walk off a ledge to chase.
    if(C.solidAt(g,e.x+e.face*5,e.y+e.h, e.w,2))C.moveX(g,e,e.face*.38);
   }else if(e.kind==='wing'){
    const left=e.left??e.ox-16,right=e.right??e.ox+16;
    if(e.x<=left)e.face=1;if(e.x>=right)e.face=-1;
    e.vx=e.face*22;e.vy=Math.max(-35,Math.min(35,(e.oy-e.y)*3));moveActor(g,e);
   }
  }
  if(e.y>C.H+20){e.dead=true;event(g,'enemy-fell',e);}
 }
}
function visible(g,a,b){
 const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/3);
 for(let i=1;i<n;i++)if(C.solidAt(g,a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,1,1))return false;
 return true;
}
function moveActor(g,e){
 C.moveX(g,e,e.vx*C.DT,()=>{e.vx=0;});
 if(e.stun>0)e.vy=Math.min(160,e.vy+C.K.gravity*C.DT);
 C.moveY(g,e,e.vy*C.DT,()=>{e.vy=0;});
}
function occupies(g,solid){return g.combat?.enemies.some(e=>!e.dead&&hit(e,solid))||false;}
function solidRiders(g,solid){
 return new Set((g.combat?.enemies||[]).filter(e=>!e.dead&&e.kind!=='wing'&&e.y+e.h===solid.y&&e.x<solid.x+solid.w&&e.x+e.w>solid.x));
}
function solidMoved(g,solid,dx,dy,riders){
 for(const e of g.combat?.enemies||[]){
  if(e.dead)continue;
  const pushing=hit(e,solid);
  if(!pushing&&!riders?.has(e))continue;
  const mx=pushing&&dx?(dx>0?solid.x+solid.w-e.x:solid.x-e.w-e.x):dx;
  const my=pushing&&dy?(dy>0?solid.y+solid.h-e.y:solid.y-e.h-e.y):dy;
  for(const [axis,amount]of [['x',mx],['y',my]])for(let n=0;n<Math.abs(amount);n++){
   const x=e.x+(axis==='x'?Math.sign(amount):0),y=e.y+(axis==='y'?Math.sign(amount):0);
   if(C.solidAt(g,x,y,e.w,e.h,solid)){
    if(pushing){e.dead=true;g.combat.kills++;event(g,'enemy-defeat',e,{kind:e.kind,cause:'crush'});}
    break;
   }
   e.x=x;e.y=y;
  }
 }
}
function damage(g,e,dir,projectile=false){
 const p=g.p;
 const shield=e.kind==='guard'&&e.exposed<=0&&dir.y===0&&Math.sign(p.x-e.x)===e.face&&!projectile;
 if(shield){event(g,'guard-block',e);return;}
 // An upward cut trades the exposed damage bonus for a living aerial target.
 e.hp-=e.exposed>0&&dir.y>=0?2:1;e.flash=8;e.stun=18;
 if(dir.y<0){e.vy=C.K.springSpeed;e.stun=38;}else{e.vx=dir.x*65;e.vy=0;}
 if(e.hp<=0){e.dead=true;g.combat.kills++;event(g,'enemy-defeat',e,{kind:e.kind});}
 else{e.state='recover';e.t=45;event(g,'enemy-hit',e);}
}
/* A foe's returned bolt reaches the Combat set too: it powers coils and damages enemies. */
function projectileHit(g,box,dir){
 const co=g.combat;if(!co)return false;
 for(const r of co.receivers)if(!r.lit&&hit(r,box)){r.lit=true;event(g,'receiver-lit',r,{id:r.id});return true;}
 for(const e of co.enemies)if(!e.dead&&hit(e,box)){damage(g,e,dir,true);return true;}
 return false;
}
function after(g,inp){
 if(!g.combat?.awake)return;
 const p=g.p,co=g.combat;
 // Blade contact is resolved before attacks, and before a lethal target disappears.
 if(p.strikeTimer>0){
  const sb=C.strikeBox(p);
  for(const e of co.enemies){
   if(e.dead||p.strikeHit.has(e.id)||!C.overlap(...sb,e.x,e.y,e.w,e.h))continue;
   p.strikeHit.add(e.id);
   if(p.strikeDir.y>0){C.bladeRebound(g,p,p.strikeDir);co.pogos++;event(g,'enemy-pogo',e);g.freeze=Math.max(g.freeze,3);}
   damage(g,e,p.strikeDir);
  }
 }
 const hurtbox={x:p.x,y:p.y,w:p.w,h:9},guard={x:p.x-5,y:p.y-5,w:p.w+10,h:p.h+10};
 for(const e of co.enemies){
  if(e.dead||e.state!=='attack')continue;
  const box=e.kind==='guard'?{x:e.face>0?e.x+e.w:e.x-19,y:e.y+4,w:19,h:7}:e;
  if(p.parryTimer>0&&hit(guard,box)){parry(g,e);continue;}
  if(hit(hurtbox,box)){hurt(g,e.kind);return;}
 }
 for(const s of co.shots){
  if(s.gone)continue;
  if(--s.life<=0){s.gone=true;continue;}
  s.remX+=s.vx*C.DT;s.remY+=s.vy*C.DT;
  let dx=Math.round(s.remX),dy=Math.round(s.remY);s.remX-=dx;s.remY-=dy;
  const steps=Math.max(Math.abs(dx),Math.abs(dy),1),ox=s.x,oy=s.y;
  for(let i=1;i<=steps;i++){
   s.x=ox+Math.round(dx*i/steps);s.y=oy+Math.round(dy*i/steps);
   if(!s.reflected&&p.parryTimer>0&&hit(guard,s)){
    const aim=p.parryAim||{},n=Math.hypot(aim.x||0,aim.y||0);
    if(n){s.vx=aim.x/n*K.shotSpeed*1.5;s.vy=aim.y/n*K.shotSpeed*1.5;}else{s.vx*=-1.5;s.vy*=-1.5;}
    s.reflected=true;s.remX=s.remY=0;parry(g);event(g,'shot-return',s);break;
   }
   if(!s.reflected&&hit(hurtbox,s)){s.gone=true;hurt(g,'bolt');return;}
   if(s.reflected){
    for(const r of co.receivers)if(!r.lit&&hit(r,s)){r.lit=true;s.gone=true;event(g,'receiver-lit',r,{id:r.id});break;}
    if(!s.gone)for(const e of co.enemies)if(!e.dead&&hit(e,s)){damage(g,e,{x:Math.sign(s.vx),y:0},true);s.gone=true;break;}
    if(!s.gone)for(const e of g.ents)if(e.type==='bell'&&e.timer===0&&hit(e,s)){C.flipPhase(g,'returned-shot');e.timer=18;s.gone=true;event(g,'bell',e);break;}
    // Foes share the returned shot: husks, shellbacks, rams, moths, spitters and tally stones.
    if(!s.gone&&root.BladefallPrecisionFoes?.projectileHit(g,s,{x:Math.sign(s.vx),y:0},{bells:false}))s.gone=true;
   }
   if(s.gone)break;
   if(C.solidAt(g,s.x,s.y,s.w,s.h)||s.x<0||s.x>C.W||s.y<0||s.y>C.H){s.gone=true;break;}
  }
 }
 co.shots=co.shots.filter(s=>!s.gone);
 for(const d of g.ents.filter(e=>e.type==='combatGate')){
  const ready=d.ward?co.enemies.filter(e=>e.ward===d.ward).every(e=>e.dead):
   (d.coils||[]).length>0&&d.coils.every(id=>co.receivers.some(r=>r.id===id&&r.lit));
  if(ready&&!d.open){d.open=true;event(g,'combat-gate',d);}
 }
}
root.BladefallPrecisionCombat=Object.freeze({K,reset,before,after,visible,occupies,solidRiders,solidMoved,projectileHit});
})(typeof window!=='undefined'?window:globalThis);
