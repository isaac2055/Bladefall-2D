/* Precision Core — the Gaol (7.254, Part VII, levels 75–82): jailers and pressure pods.

   Jailer (room def `jailers:[{x,y,dir,turn,keys}]`, x/y the tile of its feet): a shielded warder that
   commits to a facing. Its shield covers the side it faces.
   - From the front the blade glances off (no dash back) and a returned bolt breaks on the shield.
     Step into its reach and it thrusts after a tell; a parry staggers it with its shield down.
   - From behind — or while it staggers — one cut fells it, and the cut throws you like a seed pod.
     A bolt that reaches its back fells it too. A cut down onto its helm is a pogo: dash back, no harm done.
   - When you stand behind it, it turns — after `turn` frames (default 45); turn:0 never turns. A ring of
     ticks over its helm fills while it makes up its mind.
   - While any jailer with keys (the default) stands, every tally gate (G) stays shut.
   Pressure pod (glyph R, the Base Bank's Recoil Well): dash into one and it throws you back the way you
   came, harder than the dash, and returns the dash. Diagonal in, diagonal out; down in, straight up out.
   Sideways speed carries through the air until you land. It re-arms after 45 frames. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8;
const JK=Object.freeze({w:12,h:16,turn:45,sight:128,band:24,reach:14,tell:18,thrust:8,recover:30,stagger:90,glance:150});
const RK=Object.freeze({speed:280,rearm:45});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
const cx=o=>o.x+o.w/2,cy=o=>o.y+o.h/2;

function reset(g){
 const def=g.room.def,Core=C();
 g.jailers=null;
 if(def.jailers&&def.jailers.length){
  g.jailers=def.jailers.map((d,i)=>({id:i,x:d.x*TILE-2,y:(d.y+1)*TILE-JK.h,w:JK.w,h:JK.h,dir:d.dir||-1,turn:d.turn??JK.turn,keys:d.keys!==false,
   alive:true,state:'idle',t:0,turnT:0}));
  // Each jailer is a solid body: you cannot walk through it, only over it (or around it through a portal).
  for(const j of g.jailers){j.body={type:'jailerBody',dev:true,solid:true,x:j.x,y:j.y,w:j.w,h:j.h,id:'jb'+j.id};g.ents.push(j.body);}
  g.parryable=true;
  for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
 }
 for(const b of Core.groupsOf(def,'R'))for(let yy=0;yy<b.h;yy+=TILE)for(let xx=0;xx<b.w;xx+=TILE)
  g.ents.push({type:'recoil',dev:true,x:b.x+xx,y:b.y+yy,w:8,h:8,timer:0,id:'rc'+g.ents.length,ox:b.x+xx,oy:b.y+yy});
}
const behind=(j,p)=>Math.sign(cx(p)-cx(j))===-j.dir;
const inBand=(j,p)=>Math.abs(cy(p)-cy(j))<JK.band;
function thrustBox(j){return j.dir>0?[j.x+j.w,j.y+4,JK.reach+2,8]:[j.x-JK.reach-2,j.y+4,JK.reach+2,8];}
function fell(g,j,how){j.alive=false;j.body.solid=false;j.body.gone=true;C().emit(g,'jailer-fell',{x:cx(j),y:cy(j),how});}

function before(g,inp,actorOnly=false){
 const Core=C(),p=g.p;
 // Pressure pods answer a dash in progress (after its aim is read).
 for(const e of g.ents){
  if(e.type!=='recoil')continue;
  if(e.timer>0){if(!actorOnly&&--e.timer===0){if(g.players)e.backFrame=g.frame;Core.emit(g,'recoil-back',{x:e.x+4,y:e.y+4});}continue;}
  if(g.players&&e.backFrame===g.frame)continue;
  if(p.state==='dash'&&!p.dashAim&&overlap(p.x,p.y,p.w,p.h,e.x,e.y,e.w,e.h)){
   const d=p.dashDir;p.state='normal';p.dashTimer=0;p.ducking=false;
   p.vx=-d.x*RK.speed;p.vy=-d.y*RK.speed;p.coast=p.vx!==0;p.varJump=0;p.autoJump=false;p.maxFall=Core.K.maxFall;
   if(p.vy<0){p.varJumpSpeed=p.vy;}
   if(p.vx)p.facing=Math.sign(p.vx);
   Core.refillDash(g,p);e.timer=RK.rearm;g.freeze=Math.max(g.freeze,3);g.recoils=(g.recoils||0)+1;
   Core.emit(g,'recoil',{x:e.x+4,y:e.y+4,dx:-d.x,dy:-d.y});
  }
 }
 if(actorOnly||!g.jailers||!g.awake)return;
 const live=(g.players||[p]).filter(p=>p.state!=='dead'&&p.state!=='respawn');
 for(const j of g.jailers){
  if(!j.alive)continue;
  const p=g.players?live.slice().sort((a,b)=>Math.hypot(cx(a)-cx(j),cy(a)-cy(j))-Math.hypot(cx(b)-cx(j),cy(b)-cy(j)))[0]||g.p:g.p,alive=p.state!=='dead'&&p.state!=='respawn';
  // Committed facing: stand behind it long enough and it turns.
  if(j.state==='idle'||j.state==='recover'){
   if(alive&&j.turn>0&&behind(j,p)&&inBand(j,p)&&Math.abs(cx(p)-cx(j))<JK.sight){if(++j.turnT>=j.turn){j.dir=-j.dir;j.turnT=0;Core.emit(g,'jailer-turn',{x:cx(j),y:j.y});}}
   else j.turnT=0;
  }
  if(j.state==='idle'){
   const gap=j.dir>0?p.x-(j.x+j.w):j.x-(p.x+p.w);
   if(alive&&!behind(j,p)&&gap>=-4&&gap<=JK.reach&&inBand(j,p)){j.state='tell';j.t=JK.tell;Core.emit(g,'enemy-tell',{x:cx(j),y:j.y});}
  }else if(j.state==='tell'){if(--j.t<=0){j.state='thrust';j.t=JK.thrust;Core.emit(g,'jailer-thrust',{x:cx(j)+j.dir*10,y:cy(j)});}}
  else if(j.state==='thrust'){if(--j.t<=0){j.state='recover';j.t=JK.recover;}}
  else if(j.state==='recover'){if(--j.t<=0)j.state='idle';}
  else if(j.state==='stagger'){if(--j.t<=0){j.state='idle';Core.emit(g,'jailer-recover',{x:cx(j),y:j.y});}}
 }
 // Returned bolts: the shield stops one coming at its face; its back does not.
 if(g.bolts)for(const b of g.bolts){
  if(!b.alive)continue;
  for(const j of g.jailers){
   if(!j.alive||!overlap(b.x,b.y,b.w,b.h,j.x,j.y,j.w,j.h))continue;
   const intoFace=Math.sign(b.vx)===-j.dir&&Math.abs(b.vx)>=Math.abs(b.vy);
   b.alive=false;
   if(b.friendly&&(!intoFace||j.state==='stagger'))fell(g,j,'bolt');else Core.emit(g,'guard-block',{x:b.x+3,y:b.y+3});
   break;
  }
 }
}

function after(g,inp){
 if(!g.jailers||!g.awake)return;
 const Core=C(),p=g.p;
 if(p.state==='dead'||p.state==='respawn')return;
 const ward=[p.x-5,p.y-5,p.w+10,p.h+10];
 for(const j of g.jailers){
  if(!j.alive)continue;
  // Parry: a ward that meets the thrust staggers the jailer, shield down.
  if(j.state==='thrust'&&p.parryTimer>0&&overlap(...ward,...thrustBox(j))){
   j.state='stagger';j.t=JK.stagger;j.turnT=0;Core.parrySuccess(g,p);Core.emit(g,'parry',{x:cx(j)+j.dir*8,y:cy(j)});continue;
  }
  // The blade.
  if(p.strikeTimer>0){
   const key='jl'+j.id,sb=Core.strikeBox(p),d=p.strikeDir;
   if(!p.strikeHit.has(key)&&overlap(...sb,j.x-1,j.y-1,j.w+2,j.h+2)){
    p.strikeHit.add(key);
    if(d.y>0){Core.bladeRebound(g,p,d);g.freeze=3;Core.emit(g,'enemy-pogo',{x:cx(j),y:j.y});}
    else if(behind(j,p)||j.state==='stagger'){Core.bladeRebound(g,p,d);g.freeze=3;fell(g,j,'blade');continue;}
    else{p.vx=(cx(p)<cx(j)?-1:1)*JK.glance;p.vy=Math.min(p.vy,-80);if(p.state==='climb')p.state='normal';g.freeze=2;Core.emit(g,'guard-block',{x:cx(j)+j.dir*6,y:cy(j)});}
   }
  }
  // The thrust hurts; the body does not.
  if(!g.players&&j.state==='thrust'&&overlap(p.x,p.y,p.w,9,...thrustBox(j))){Core.kill(g,p,'jailer');return;}
 }
}
function afterPlayers(g){
 if(!g.jailers||!g.awake)return;
 const actor=g.coopActor;
 try{for(const [i,p]of g.players.entries()){
  if(p.state==='dead'||p.state==='respawn')continue;
  g.coopActor=i;
  for(const j of g.jailers)if(j.alive&&j.state==='thrust'&&overlap(p.x,p.y,p.w,9,...thrustBox(j))){C().kill(g,p,'jailer');break;}
 }}finally{g.coopActor=actor;}
}
function gateHold(g){return !!(g.jailers&&g.jailers.some(j=>j.alive&&j.keys));}

(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'gaol',reset,before,beforePlayer:(g,inp)=>before(g,inp,true),after,afterPlayer:after,afterPlayers,gateHold});
root.BladefallPrecisionGaol=Object.freeze({JK,RK,thrustBox});
})(typeof window!=='undefined'?window:globalThis);
