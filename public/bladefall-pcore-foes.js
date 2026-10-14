/* Precision Core foes (7.248, merged 7.250): small enemies that answer the same verbs as the room's objects.
   They share the room with the Combat actors (bladefall-pcore-combat.js) and one parry (the core's parryStep).
   Every correct answer to a foe pays the knight in movement:
   - a cut on a body rebounds you exactly like a seed pod (down-cut = pogo) and returns the dash;
   - a cut on a bolt only breaks it;
   - a parry turns a bolt (aimed by the direction held at the press) or stops a charge cold, and returns the dash;
   - a stunned or flipped foe is a solid block you can stand on until it recovers.
   Contact rule, shared with the Combat actors: attacks hurt; bodies hurt only if they are thorned, and a
   thorned body always wears visible thorns (a shellback's back, or any foe placed with thorns:true).
   Foes keep their own clock, which starts with the room's first input, so a room of foes can be studied
   and then played the same way every time. Placement lives in the room's `foes` list. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8,DT=1/60;
const FK=Object.freeze({
 parryReach:5,
 boltSize:6,reflectMult:1.6,tellFrames:20,
 mothSize:8,
 shellW:16,shellH:12,shellSpeed:28,shellFlip:180,shellWarn:40,
 ramW:16,ramH:12,ramWalk:30,ramCharge:210,ramTell:24,ramSight:136,ramBonk:90,ramParryStun:150,ramWarn:30,gravity:900,
 spitSize:8
});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
const hurt=p=>[p.x,p.y,p.w,9];                 // the feet are not vulnerable, as with thorns
const ward=p=>[p.x-FK.parryReach,p.y-FK.parryReach,p.w+2*FK.parryReach,p.h+2*FK.parryReach];
// Thorned bodies hurt to touch; plain bodies are safe. A flipped shellback shows its belly, not its thorns.
const thorned=f=>(f.thorns??f.kind==='shell')&&!(f.kind==='shell'&&f.state==='flip');

/* A solid proxy in g.ents lets the core's collision see flipped shells, stunned rams and husks. */
function proxy(g,f){const e={type:'foeSolid',x:f.x,y:f.y,w:f.w,h:f.h,solid:false,id:'fs'+f.id,remX:0,remY:0};g.ents.push(e);return e;}
function setSolid(g,f,on){
 const e=f.proxy;e.x=f.x;e.y=f.y;e.w=f.w;e.h=f.h;
 if(!on){e.solid=false;f.pending=false;return;}
 // Like machinery: it waits to turn solid while the knight is inside it.
 if((g.players||[g.p]).some(p=>p.state!=='dead'&&overlap(p.x,p.y,p.w,p.h,f.x,f.y,f.w,f.h))){f.pending=true;e.solid=false;return;}
 f.pending=false;e.solid=true;
}

function reset(g){
 const def=g.room.def,list=def.foes||[];
 g.foes=[];g.bolts=[];g.fclock=0;
 if(!list.length){g.foes=null;return;}
 list.forEach((d,i)=>{
  const f={...d,id:i,alive:true,t:0,state:'idle',remX:0,remY:0,vx:0,vy:0,timer:0};
  if(d.kind==='moth'){f.w=f.h=FK.mothSize;f.x0=d.x*TILE;f.y0=d.y*TILE;f.x=f.x0;f.y=f.y0;f.period=d.period||120;f.path=d.path||[0,0];f.phase=d.phase||0;}
  else if(d.kind==='shell'){f.w=FK.shellW;f.h=FK.shellH;f.x=d.x*TILE;f.y=(d.y+1)*TILE-f.h;f.dir=d.dir||1;f.state='walk';}
  else if(d.kind==='ram'){f.w=FK.ramW;f.h=FK.ramH;f.x=d.x*TILE;f.y=(d.y+1)*TILE-f.h;f.dir=d.dir||1;f.state='walk';f.lo=(d.patrol?d.patrol[0]:0)*TILE;f.hi=(d.patrol?d.patrol[1]+1:g.room.cols)*TILE;}
  else if(d.kind==='spit'){f.w=f.h=FK.spitSize;f.x=d.x*TILE;f.y=d.y*TILE;const n=Math.hypot(d.dir[0],d.dir[1])||1;f.dx=d.dir[0]/n;f.dy=d.dir[1]/n;f.every=d.every||90;f.offset=d.offset||0;f.speed=d.speed||120;}
  else if(d.kind==='husk'){f.x=d.x*TILE;f.y=d.y*TILE;f.w=(d.w||1)*TILE;f.h=(d.h||1)*TILE;}
  g.foes.push(f);
  if(d.kind==='husk'||d.kind==='shell'||d.kind==='ram'){f.proxy=proxy(g,f);if(d.kind==='husk')setSolid(g,f,true);}
 });
}

/* ---------------------------------------------------------------- movement, before the knight moves */
function floorAhead(g,f,dir){const x=dir>0?f.x+f.w:f.x-1;return C().solidAt(g,x,f.y+f.h,1,1,f.proxy);}
function walk(g,f,speed){
 f.remX+=f.dir*speed*DT;let n=Math.round(f.remX);f.remX-=n;
 while(n){const s=Math.sign(n);
  const blocked=C().solidAt(g,f.x+s,f.y,f.w,f.h,f.proxy)||!floorAhead(g,f,s)||(f.lo!==undefined&&(f.x+s<f.lo||f.x+f.w+s>f.hi));
  if(blocked){f.dir=-f.dir;f.remX=0;return;}
  f.x+=s;n-=s;}
}
function sees(g,f){
 return (g.players||[g.p]).some(p=>{if(p.state==='dead'||p.state==='respawn')return false;
 if(!(p.y<f.y+f.h&&p.y+p.h>f.y))return false;
 const d=f.dir>0?p.x-(f.x+f.w):f.x-(p.x+p.w);
 return d>=0&&d<=FK.ramSight;});
}
function breakHusk(g,h,x,y){h.alive=false;setSolid(g,h,false);C().emit(g,'breach',{x:x??h.x+h.w/2,y:y??h.y+h.h/2});}
function huskAt(g,x,y,w,h){return g.foes.find(f=>f.kind==='husk'&&f.alive&&overlap(x,y,w,h,f.x,f.y,f.w,f.h));}

function updateRam(g,f){
 const Core=C();
 if(f.state==='walk'){walk(g,f,FK.ramWalk);if(sees(g,f)){f.state='tell';f.timer=FK.ramTell;Core.emit(g,'enemy-tell',{x:f.x+f.w/2,y:f.y});}}
 else if(f.state==='tell'){if(--f.timer<=0){f.state='charge';f.vy=0;}}
 else if(f.state==='charge'){
  // A charge runs until something stops it; it runs off ledges and falls.
  f.remX+=f.dir*FK.ramCharge*DT;let n=Math.round(f.remX);f.remX-=n;
  while(n){const s=Math.sign(n);const hk=huskAt(g,f.x+s,f.y,f.w,f.h);
   if(hk){breakHusk(g,hk,f.dir>0?f.x+f.w:f.x,f.y+f.h/2);stun(g,f,FK.ramBonk,'bonk');return;}
   const b=Core.blockerAt(g,f.x+s,f.y,f.w,f.h,f.proxy);
   // Cracked masonry yields to a charge, as it does to a hound's.
   if(b&&b.type==='brittle'&&!b.open){b.open=true;Core.emit(g,'breach',{x:b.x+b.w/2,y:b.y+b.h/2});stun(g,f,FK.ramBonk,'bonk');return;}
   if(b){stun(g,f,FK.ramBonk,'bonk');return;}
   f.x+=s;n-=s;}
  fall(g,f);
 }else if(f.state==='stun'){fall(g,f);if(--f.timer<=0){f.state='walk';setSolid(g,f,false);}else if(f.pending)setSolid(g,f,true);}
}
function fall(g,f){
 const Core=C();
 if(Core.solidAt(g,f.x,f.y+1,f.w,f.h,f.proxy)){f.vy=0;return;}
 f.vy=Math.min(240,f.vy+FK.gravity*DT);f.remY+=f.vy*DT;let n=Math.round(f.remY);f.remY-=n;
 while(n>0){if(Core.solidAt(g,f.x,f.y+1,f.w,f.h,f.proxy)){f.vy=0;f.remY=0;break;}f.y++;n--;}
 // Thorns below, or the bottom of the screen, end it.
 const c0=Math.floor(f.x/TILE),c1=Math.floor((f.x+f.w-1)/TILE),r=Math.floor((f.y+f.h)/TILE)-1;
 for(let c=c0;c<=c1;c++){const t=Core.tileAt(g,c,r);if(t>=Core.SPIKE_UP){defeat(g,f);return;}}
 if(f.y>g.room.h+8)defeat(g,f);
}
function stun(g,f,frames,why){f.state='stun';f.timer=frames;f.remX=0;setSolid(g,f,true);C().emit(g,'enemy-hit',{x:f.x+f.w/2,y:f.y+f.h/2,why});}
function defeat(g,f){f.alive=false;if(f.proxy)setSolid(g,f,false);C().emit(g,'enemy-defeat',{x:f.x+f.w/2,y:f.y+f.h/2,kind:f.kind});}

function before(g,inp){
 if(!g.foes||!g.awake)return;
 const Core=C(),clock=++g.fclock;
 for(const f of g.foes){
  if(!f.alive)continue;
  f.t++;
  if(f.kind==='moth'){
   const u=((clock+f.phase)%f.period)/f.period,k=u<.5?u*2:2-u*2;
   f.x=Math.round(f.x0+f.path[0]*TILE*k);f.y=Math.round(f.y0+f.path[1]*TILE*k);
  }else if(f.kind==='shell'){
   if(f.state==='walk')walk(g,f,FK.shellSpeed);
   else if(f.state==='flip'){if(f.pending)setSolid(g,f,true);if(--f.timer<=0){f.state='walk';setSolid(g,f,false);}}
  }else if(f.kind==='ram')updateRam(g,f);
  else if(f.kind==='spit'){
   const n=(clock+f.offset)%f.every;
   f.tell=f.every-n<=FK.tellFrames;
   if(n===0){const s=FK.boltSize;g.bolts.push({x:f.x+4-s/2+f.dx*6,y:f.y+4-s/2+f.dy*6,w:s,h:s,vx:f.dx*f.speed,vy:f.dy*f.speed,friendly:false,from:f.id,alive:true});Core.emit(g,'enemy-shot',{x:f.x+4,y:f.y+4});}
  }
 }
 for(const b of g.bolts){
  if(!b.alive)continue;
  b.x+=b.vx*DT;b.y+=b.vy*DT;
  const bx=Math.round(b.x),by=Math.round(b.y);
  if(bx<-8||by<-8||bx>g.room.w+8||by>g.room.h+8){b.alive=false;continue;}
  const hk=huskAt(g,bx,by,b.w,b.h);
  if(hk){b.alive=false;if(b.friendly)breakHusk(g,hk,bx+3,by+3);else Core.emit(g,'enemy-hit',{x:bx+3,y:by+3});continue;}
  if(Core.solidAt(g,bx,by,b.w,b.h)){b.alive=false;Core.emit(g,'enemy-hit',{x:bx+3,y:by+3});continue;}
  if(b.friendly)friendlyHit(g,b,bx,by);
 }
 g.bolts=g.bolts.filter(b=>b.alive);
}
/* A returned projectile is the knight's, whichever foe threw it: it fells foes, breaks husks, flips
   shellbacks, dazes rams, rings bells and lights stones; the Combat actors add coils and their own enemies.
   Returns true when something took the hit. Combat shots call this with bells:false (they ring bells themselves). */
function projectileHit(g,box,dir,{bells=true}={}){
 if(!g.foes)return false;
 const Core=C(),{x,y,w,h}=box;
 const hk=huskAt(g,x,y,w,h);if(hk){breakHusk(g,hk,x+w/2,y+h/2);return true;}
 for(const f of g.foes){
  if(!f.alive||f.kind==='husk'||!overlap(x,y,w,h,f.x,f.y,f.w,f.h))continue;
  if(f.kind==='ram'){if(f.state!=='stun')stun(g,f,FK.ramParryStun,'bolt');}
  else if(f.kind==='shell'){if(f.state!=='flip')flip(g,f);}
  else defeat(g,f);
  return true;
 }
 for(const e of g.ents){
  if(!overlap(x,y,w,h,e.x,e.y,e.w,e.h))continue;
  if(bells&&e.type==='bell'&&e.timer===0){e.timer=18;Core.flipPhase(g,'bell');Core.emit(g,'bell',{x:e.x+4,y:e.y+4});return true;}
  if(e.type==='stone'&&!e.lit){e.lit=true;Core.emit(g,'stone-lit',{x:e.x+4,y:e.y+4,left:g.ents.filter(s=>s.type==='stone'&&!s.lit).length,cut:true});return true;}
 }
 return false;
}
function friendlyHit(g,b,bx,by){
 const box={x:bx,y:by,w:b.w,h:b.h};
 if(projectileHit(g,box))b.alive=false;
 else if(root.BladefallPrecisionCombat?.projectileHit?.(g,box,{x:Math.sign(b.vx),y:0}))b.alive=false;
}
/* A Combat hound's charge breaks a husk it runs into, as a ram's does. */
function breakProxy(g,ent){
 const hk=g.foes?.find(f=>f.kind==='husk'&&f.alive&&f.proxy===ent);if(!hk)return false;
 breakHusk(g,hk);return true;
}
function flip(g,f){f.state='flip';f.timer=FK.shellFlip;setSolid(g,f,true);C().emit(g,'enemy-hit',{x:f.x+f.w/2,y:f.y+f.h/2,why:'flip'});}

/* ---------------------------------------------------------------- answers, after the knight moves */
function after(g,inp){
 if(!g.foes||!g.awake)return;
 const p=g.p,Core=C();
 if(p.state==='dead'||p.state==='respawn')return;
 const wb=ward(p);
 // 1. Parries come first: a ward that meets an attack turns it.
 if(p.parryTimer>0){
  for(const b of g.bolts){
   if(b.friendly||!overlap(...wb,b.x,b.y,b.w,b.h)||!(p.parryTimer>0))continue;
   const sp=Math.hypot(b.vx,b.vy)*FK.reflectMult;
   // The direction held at the press aims the return; with none it goes straight back along its own line.
   const a=p.parryAim||{x:0,y:0};let ax=a.x,ay=a.y;const aimed=!!(ax||ay);if(!aimed){ax=-Math.sign(b.vx);ay=-Math.sign(b.vy);}
   const n=Math.hypot(ax,ay)||1;b.vx=ax/n*sp;b.vy=ay/n*sp;b.friendly=true;
   if(g.players){b.parriedBy=g.coopActor;b.returnAim={x:a.x,y:a.y};}
   if(aimed){b.x=p.x+4-b.w/2+ax/n*8;b.y=p.y+5-b.h/2+ay/n*8;}
   answered(g,p,b.x+3,b.y+3);
  }
  for(const f of g.foes){
   if(!(p.parryTimer>0))break;
   if(!f.alive||f.kind!=='ram'||f.state!=='charge'||!overlap(...wb,f.x,f.y,f.w,f.h))continue;
   // The charge stops dead; the ram is thrown back a step and dazed.
   const dir=f.dir;for(let i=0;i<8;i++)if(!Core.solidAt(g,f.x-dir,f.y,f.w,f.h,f.proxy))f.x-=dir;
   stun(g,f,FK.ramParryStun,'parry');answered(g,p,f.x+f.w/2,f.y+f.h/2);
  }
 }
 // 2. The blade. Every foe you can cut rebounds you like a pod.
 if(p.strikeTimer>0){
  const sb=Core.strikeBox(p),d=p.strikeDir;
  for(const f of g.foes){
   const key='foe'+f.id;
   if(!f.alive||f.kind==='husk'||p.strikeHit.has(key)||!overlap(...sb,f.x-1,f.y-1,f.w+2,f.h+2))continue;
   p.strikeHit.add(key);
   // A ram on its feet is all horn: the blade glances off and gives nothing back. Only a parry stops it.
   if(f.kind==='ram'&&f.state!=='stun'){p.vx=(p.x+4<f.x+f.w/2?-1:1)*150;p.vy=Math.min(p.vy,-80);if(p.state==='climb')p.state='normal';g.freeze=2;Core.emit(g,'guard-block',{x:f.x+f.w/2,y:f.y+f.h/2});continue;}
   Core.bladeRebound(g,p,d);g.freeze=3;
   if(f.kind==='moth'||f.kind==='spit'){defeat(g,f);continue;}
   if(f.kind==='shell'){if(f.state==='walk'&&d.y<=0)flip(g,f);else Core.emit(g,'enemy-pogo',{x:f.x+f.w/2,y:f.y});continue;}
   if(f.kind==='ram'){Core.emit(g,'enemy-pogo',{x:f.x+f.w/2,y:f.y+f.h/2});continue;}
  }
  for(const b of g.bolts){
   if(b.friendly||!b.alive||!overlap(...sb,b.x-1,b.y-1,b.w+2,b.h+2))continue;
   // The blade only breaks a bolt; it gives nothing back. Parry it to keep it — and your dash.
   b.alive=false;Core.emit(g,'enemy-hit',{x:b.x+3,y:b.y+3});
  }
  g.bolts=g.bolts.filter(b=>b.alive);
 }
 if(!g.players)hurtPlayer(g,p);
}
function hurtPlayer(g,p){
 if(!g.foes||!g.awake||p.state==='dead'||p.state==='respawn')return;
 const Core=C(),hb=hurt(p);
 // 3. Attacks hurt: hostile bolts and a charging ram. Bodies hurt only if thorned.
 for(const b of g.bolts)if(!b.friendly&&overlap(...hb,b.x,b.y,b.w,b.h)){Core.kill(g,p,'bolt');return;}
 for(const f of g.foes){
  if(!f.alive||f.kind==='husk')continue;
  const attacking=f.kind==='ram'&&f.state==='charge';
  if((attacking||thorned(f))&&overlap(...hb,f.x,f.y,f.w,f.h)){Core.kill(g,p,f.kind);return;}
 }
}
// Resolve damage only after both knights have had a chance to defend.
function afterPlayers(g){
 const actor=g.coopActor;
 try{for(const [i,p]of (g.players||[]).entries()){g.coopActor=i;hurtPlayer(g,p);}}
 finally{g.coopActor=actor;}
}
/* The same answer as a Combat parry: ward spent, dash back, a three-tick freeze. No launch. */
function answered(g,p,x,y){C().parrySuccess(g,p);C().emit(g,'parry',{x,y});}

root.BladefallPrecisionFoes=Object.freeze({FK,reset,before,after,afterPlayer:after,afterPlayers,projectileHit,breakProxy,thorned});
})(typeof window!=='undefined'?window:globalThis);
