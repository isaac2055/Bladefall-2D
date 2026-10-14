/* Precision Core — Room by Room · 7. The Warden (7.259): the boss of the Sentence Well.

   Room def `warden:{x,y,dir,hp,turn,first,leave}` (x,y: the tile his feet stand in, as for jailers; dir: the way
   he faces, -1 or 1). He is the Gaol's jailers grown into one man: a tall warder behind a tower shield, slow to turn,
   and committed to whatever he starts. What is new is his rush, and the rule that answers it:
   - He rushes whatever stands in his line: the knight in front of him, inside his height, with nothing solid
     between. A tell (`WK.tell` frames: he sets his shield and his visor burns), then a straight charge the way he
     faces. The charge kills what it meets.
   - The charge stops at the first solid thing. Slammed head-first into a wall, he is dazed a moment, shield still up.
   - What meets his charge head-on and gives it back turns it round: a pressure pod (the Gaol's own, glyph R, armed),
     or the knight's parry. Returned, he is thrown back the way he came, faster, and crashes back-first into
     whatever is behind him. Crashed, his guard is down: one cut is a wound. A wound sets him on his feet facing the
     knight (`hp` wounds in all, default 1).
   - Otherwise his armour is whole, back and front: the blade glances off him (a knock back), and a cut down onto his
     helm is a pogo. Stand behind him and he turns after `turn` frames (default 50), with the jailers' ring of ticks.
   - With his last wound he goes the way `leave` says: 'left' or 'right' (he gets up and runs out of the room that
     way, ahead of the knight), 'down' (he drops through the trapdoor he crashed on: a tally gate in the floor, which
     opens as he goes), 'up' (he climbs out, off the top of the screen) or 'kneel' (he kneels where he
     crashed and lays his shield down). Tally gates (G) in his room open as he goes.
   - He is solid while he stands (walk over him, not through him), and passes through nothing while he charges.
   The room waits for the first input before he wakes (put `study:true` on the room); `first` delays his first look.
   Emits warden-tell, warden-rush, warden-slam, warden-return {how:'pod'|'parry'}, warden-crash, warden-hit,
   warden-turn, warden-gone (and recoil when a pod takes him, guard-block on a glance, parry on a parried charge).
   Opt-in (7.277; without these fields he behaves exactly as above):
   - `chain:{every,tell,speed}`: when the knight is out of his line and above him (a gallery, a jump), he does not
     wait for her to come down: after `every` frames (default 70) he swings his key chain for `tell` frames (default
     26), its aim locked on where she was, and throws the shackle along it (a foe bolt at `speed`, default 120 px/s).
     The blade breaks it, the parry turns it, stone stops it; turned back into him it rings off his shield.
   - `shove:true`: rising from a wound, he throws his shield out: a knight within `WK.shoveR` px is knocked across
     the room (no harm), so the next rush starts from a distance and cannot be met at his elbow.
   - `call:{at,x,dir,turn}`: when he has taken `at` wounds (default 1), he bellows and a jailer of the Gaol
     (bladefall-pcore-dev-gaol.js) drops from the roof at tile column `x`, facing `dir`, and stands guard there. It
     holds the room's tally gates like any jailer. His own rush and his return go through it: whatever stands in his
     line is flattened, jailer or not.
   - `reach:px` (7.280, the Fractured Warden): his rush cannot be turned until it has carried him `reach` px; met
     closer to where he set off (at his elbow as he rises), the charge goes through the parry and kills. Meet him
     in the open.
   Emits warden-wind, warden-throw, warden-shove, warden-call, jailer-fell {how:'warden'}. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8;
const WK=Object.freeze({w:14,h:22,tell:30,speed:200,back:270,daze:40,crash:170,rise:24,turn:50,sight:320,cool:20,glance:150,leave:60,rearm:45,
 chainEvery:70,chainTell:26,chainSpeed:120,bolt:6,shoveR:72,shoveX:240,shoveY:-150,drop:5});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
const cx=o=>o.x+o.w/2;
const live=p=>p.state!=='dead'&&p.state!=='respawn';
function target(g,w){
 if(!g.players)return g.p;
 const players=g.players.filter(live).sort((a,b)=>Math.abs(cx(a)-cx(w))-Math.abs(cx(b)-cx(w)));
 return players.find(p=>inLine(g,w,p))||players.find(p=>w.d.chain&&above(w,p))||players[0]||g.p;
}

function reset(g){
 const d=g.room.def.warden;g.warden=null;
 if(!d)return;
 const w={d,x:d.x*TILE+(TILE-WK.w)/2|0,y:(d.y+1)*TILE-WK.h,w:WK.w,h:WK.h,remX:0,remY:0,vx:0,vy:0,dir:d.dir||-1,
  hp:d.hp||1,wounds:0,turn:d.turn??WK.turn,state:'idle',t:0,turnT:0,cool:d.first??20,gone:false,how:null,
  chainT:0,wind:0,aim:null,called:false};
 w.body={type:'wardenBody',dev:true,solid:true,x:w.x,y:w.y,w:w.w,h:w.h,id:'warden'};
 g.ents.push(w.body);g.warden=w;
 g.parryable=true;   // the shared parry runs in his rooms
 if(d.chain&&!g.foes){g.foes=[];g.bolts=[];g.fclock=0;}   // his shackle is a foe bolt
 for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
}
/* Opt-in: above him and out of his line, he throws his shackle (see the header). */
const above=(w,p)=>p.y+p.h<=w.y+2&&Math.abs(cx(p)-cx(w))<WK.sight;
function chainStep(g,w,p,alive){
 const Core=C(),c=w.d.chain;
 if(w.wind>0){
  if(--w.wind===0){
   const s=WK.bolt,a=w.aim,sp=c.speed||WK.chainSpeed,x0=cx(w)+w.dir*4,y0=w.y+4;
   g.bolts.push({x:x0-s/2+a.x*10,y:y0-s/2+a.y*10,w:s,h:s,vx:a.x*sp,vy:a.y*sp,ovx:a.x*sp,ovy:a.y*sp,friendly:false,from:'warden',alive:true});
   w.aim=null;w.chainT=0;Core.emit(g,'warden-throw',{x:x0,y:y0,dev:true});
  }
  return true;
 }
 if(alive&&above(w,p)&&!inLine(g,w,p)){
  if(++w.chainT>=(c.every||WK.chainEvery)){
   const dx=cx(p)-cx(w),dy=(p.y+5)-(w.y+4),n=Math.hypot(dx,dy)||1;
   w.aim={x:dx/n,y:dy/n};w.dir=dx<0?-1:1;w.wind=c.tell||WK.chainTell;Core.emit(g,'warden-wind',{x:cx(w),y:w.y,dev:true});return true;
  }
 }else w.chainT=0;
 return false;
}
/* Opt-in: the jailer he calls (bladefall-pcore-dev-gaol.js shapes; it drops from the roof). */
function callJailer(g,w){
 const Core=C(),c=w.d.call,G=root.BladefallPrecisionGaol,JK=G?G.JK:{w:12,h:16,turn:45};
 if(!g.jailers)g.jailers=[];
 let y0=0;while(y0<g.room.h&&Core.solidAt(g,c.x*TILE-2,y0,JK.w,JK.h))y0+=TILE;   // the first open air under the roof
 const id=100+g.jailers.length,x=c.x*TILE-2,j={id,x,y:y0,w:JK.w,h:JK.h,dir:c.dir||-1,turn:c.turn??JK.turn,keys:true,alive:true,state:'recover',t:9999,turnT:0,called:true,dropping:true};
 j.body={type:'jailerBody',dev:true,solid:false,x:j.x,y:j.y,w:j.w,h:j.h,id:'jb'+id};
 g.jailers.push(j);g.ents.push(j.body);w.called=true;
 Core.emit(g,'warden-call',{x:cx(w),y:w.y,jx:x+6,dev:true});
}
function dropStep(g){
 const Core=C();
 for(const j of g.jailers||[]){
  if(!j.dropping)continue;
  let n=WK.drop;while(n-->0&&!Core.solidAt(g,j.x,j.y+1,j.w,j.h,j.body))j.y++;
  j.body.x=j.x;j.body.y=j.y;
  if(Core.solidAt(g,j.x,j.y+1,j.w,j.h,j.body)){j.dropping=false;j.state='idle';j.t=0;j.body.solid=true;Core.emit(g,'jailer-land',{x:j.x+6,y:j.y+j.h,dev:true});}
 }
}
/* His rush and his return go through whatever stands in his line, his own jailer included. */
function flatten(g,w,dx){
 const Core=C();
 for(const j of g.jailers||[]){
  if(!j.alive||j.dropping)continue;
  if(overlap(w.x+Math.min(0,dx)-1,w.y,w.w+Math.abs(dx)+2,w.h,j.x,j.y,j.w,j.h)){
   j.alive=false;j.body.solid=false;j.body.gone=true;g.freeze=Math.max(g.freeze,3);
   Core.emit(g,'jailer-fell',{x:j.x+j.w/2,y:j.y+j.h/2,how:'warden'});
  }
 }
}
const standing=w=>w.state==='idle'||w.state==='tell'||w.state==='daze'||w.state==='crash'||w.state==='rise'||w.state==='kneel';
function inLine(g,w,p){
 if(Math.sign(cx(p)-cx(w))!==w.dir)return false;
 if(!(p.y+p.h>w.y+2&&p.y<w.y+w.h))return false;
 if(Math.abs(cx(p)-cx(w))>WK.sight)return false;
 // Nothing solid between them, along the knight's height.
 const y=Math.max(w.y,Math.min(w.y+w.h-2,p.y+5)),x0=w.dir>0?w.x+w.w:p.x+p.w,x1=w.dir>0?p.x:w.x;
 for(let x=x0;x<x1;x+=3)if(C().solidAt(g,x,y,1,1,w.body))return false;
 return true;
}
const behind=(w,p)=>Math.sign(cx(p)-cx(w))===-w.dir&&p.y+p.h>w.y-8&&p.y<w.y+w.h+8&&Math.abs(cx(p)-cx(w))<WK.sight;
function syncBody(g,w){
 const b=w.body;b.x=w.x;b.y=w.y;
 const want=standing(w)&&w.state!=='kneel';
 if(want&&!b.solid){if(!(g.players||[g.p]).some(p=>live(p)&&overlap(p.x,p.y,p.w,p.h,w.x,w.y,w.w,w.h)))b.solid=true;}
 else if(!want)b.solid=false;
}
function turnBack(g,w,how){
 const Core=C();w.state='back';w.vx=-w.dir*WK.back;w.how=how;Core.emit(g,'warden-return',{x:cx(w),y:w.y+w.h/2,how});
}

function before(g){
 const w=g.warden;if(!w||w.gone||!g.awake)return;
 const Core=C(),p=target(g,w),alive=live(p);
 w.t++;
 // He keeps to his floor.
 if(w.state!=='leave'){w.vy=Math.min(240,w.vy+Core.K.gravity*Core.DT);Core.moveY(g,w,w.vy*Core.DT,()=>{w.vy=0;},w.body);}
 if(w.d.call)dropStep(g);
 if(w.state==='idle'){
  if(w.cool>0)w.cool--;
  if(w.d.chain&&w.cool<=0&&chainStep(g,w,p,alive)){syncBody(g,w);return;}
  if(alive&&w.turn>0&&behind(w,p)){if(++w.turnT>=w.turn){w.dir=-w.dir;w.turnT=0;Core.emit(g,'warden-turn',{x:cx(w),y:w.y});}}
  else w.turnT=0;
  if(alive&&w.cool<=0&&inLine(g,w,p)){w.state='tell';w.t=0;w.turnT=0;w.chainT=0;Core.emit(g,'warden-tell',{x:cx(w),y:w.y});}
 }else if(w.state==='tell'){
  if(w.t>=WK.tell){w.state='rush';w.t=0;w.vx=w.dir*WK.speed;w.body.solid=false;w.rushX0=w.x;Core.emit(g,'warden-rush',{x:cx(w),y:w.y+w.h/2,dir:w.dir});}
 }else if(w.state==='rush'){
  w.body.solid=false;
  if(w.d.call)flatten(g,w,w.vx*Core.DT);
  Core.moveX(g,w,w.vx*Core.DT,()=>{w.state='daze';w.t=0;w.vx=0;Core.emit(g,'warden-slam',{x:w.dir>0?w.x+w.w:w.x,y:w.y+w.h/2});},w.body);
  // An armed pressure pod in his path gives the charge back.
  if(w.state==='rush')for(const e of g.ents){
   if(e.type!=='recoil'||e.timer>0||!overlap(w.x,w.y,w.w,w.h,e.x,e.y,e.w,e.h))continue;
   e.timer=WK.rearm;g.freeze=Math.max(g.freeze,3);Core.emit(g,'recoil',{x:e.x+4,y:e.y+4,dx:-w.dir,dy:0,warden:true});
   turnBack(g,w,'pod');break;
  }
 }else if(w.state==='back'){
  w.body.solid=false;
  if(w.d.call)flatten(g,w,w.vx*Core.DT);
  Core.moveX(g,w,w.vx*Core.DT,()=>{w.state='crash';w.t=0;w.vx=0;Core.emit(g,'warden-crash',{x:w.dir>0?w.x:w.x+w.w,y:w.y+w.h/2});},w.body);
 }else if(w.state==='daze'){
  if(w.t>=WK.daze){w.state='idle';w.cool=WK.cool;}
 }else if(w.state==='crash'){
  if(w.t>=WK.crash){w.state='idle';w.cool=WK.cool;}
 }else if(w.state==='rise'){
  if(w.t===1&&w.d.shove){
   const actor=g.coopActor;
   try{for(const [i,knight]of (g.players||[g.p]).entries()){
    if(!live(knight)||Math.abs(cx(knight)-cx(w))>=WK.shoveR||knight.y+knight.h<=w.y-8||knight.y>=w.y+w.h)continue;
    if(g.players)g.coopActor=i;
    const dir=cx(knight)<cx(w)?-1:1;knight.vx=dir*WK.shoveX;knight.vy=WK.shoveY;knight.varJump=0;knight.dashTimer=0;
    if(knight.state==='climb'||knight.state==='dash')knight.state='normal';
    knight.coast=true;g.freeze=Math.max(g.freeze,4);Core.emit(g,'warden-shove',{x:cx(w)+dir*8,y:w.y+w.h/2,dir,dev:true});
   }}finally{g.coopActor=actor;}
  }
  if(w.t===2&&w.d.call&&!w.called&&w.wounds>=(w.d.call.at||1))callJailer(g,w);
  if(w.t>=WK.rise){w.state='idle';w.cool=WK.cool;}
 }else if(w.state==='leave'){
  const how=w.d.leave||'left';
  if(how==='up'){w.y-=Math.min(6,1+w.t*.12);w.x+=w.dir*.3;}   // up the wall and out of the top of the screen
  else if(how==='down'){w.vy=Math.min(240,w.vy+Core.K.gravity*Core.DT);Core.moveY(g,w,w.vy*Core.DT,()=>{w.vy=0;},w.body);}   // through the open trapdoor
  else if(w.t>WK.rise){w.dir=how==='right'?1:-1;w.x+=w.dir*Math.min(3,(w.t-WK.rise)*.15);}   // on his feet, then away
  if(w.y<-w.h-4||w.y>g.room.h+4||w.x<-w.w-4||w.x>g.room.w+4||w.t>=WK.leave*6)gone(g,w);
 }
 syncBody(g,w);
}

function settle(g,phase='all'){
 const w=g.warden;if(!w||w.gone||!g.awake)return;
 const Core=C(),p=g.p;
 if((phase==='all'||phase==='world')&&w.d.chain&&g.bolts){
  // A shackle turned back into him rings off his shield.
  for(const b of g.bolts)if(b.alive&&b.friendly&&b.from==='warden'&&overlap(b.x,b.y,b.w,b.h,w.x,w.y,w.w,w.h)){b.alive=false;Core.emit(g,'guard-block',{x:b.x+3,y:b.y+3,warden:true});}
  g.bolts=g.bolts.filter(b=>b.alive);
 }
 if(phase==='world'||!live(p))return;
 // The blade.
 if(phase!=='hurt'&&p.strikeTimer>0&&!p.strikeHit.has('warden')&&w.state!=='leave'&&w.state!=='kneel'){
  const sb=Core.strikeBox(p),d=p.strikeDir;
  if(overlap(...sb,w.x-1,w.y-1,w.w+2,w.h+2)){
   p.strikeHit.add('warden');
   if(d.y>0){Core.bladeRebound(g,p,d);g.freeze=3;Core.emit(g,'enemy-pogo',{x:cx(w),y:w.y});}
   else if(w.state==='crash'){
    Core.bladeRebound(g,p,d);g.freeze=6;w.wounds++;
    Core.emit(g,'warden-hit',{x:cx(w),y:w.y+w.h/2,wounds:w.wounds,hp:w.hp});
    if(w.wounds>=w.hp){
     if((w.d.leave||'left')==='kneel'){w.state='kneel';w.t=0;gone(g,w,true);}
     else{w.state='leave';w.t=0;w.body.solid=false;}
    }else{w.state='rise';w.t=0;w.dir=cx(p)<cx(w)?-1:1;}
   }else{
    p.vx=(cx(p)<cx(w)?-1:1)*WK.glance;p.vy=Math.min(p.vy,-80);if(p.state==='climb')p.state='normal';
    g.freeze=2;Core.emit(g,'guard-block',{x:cx(w)+(cx(p)<cx(w)?-6:6),y:w.y+w.h/2,warden:true});
   }
  }
 }
 // His charge: a parry meeting it head-on returns it; anything else it meets dies.
 if(w.state==='rush'){
  const front=w.dir>0?[w.x+w.w-4,w.y,6,w.h]:[w.x-2,w.y,6,w.h];
  const ward=[p.x-5,p.y-5,p.w+10,p.h+10];
  if(phase!=='hurt'&&p.parryTimer>0&&Math.sign(cx(p)-cx(w))===w.dir&&overlap(...ward,...front)&&(!w.d.reach||Math.abs(w.x-(w.rushX0??w.x))>=w.d.reach)){
   Core.parrySuccess(g,p);Core.emit(g,'parry',{x:cx(w)+w.dir*8,y:w.y+w.h/2,warden:true});turnBack(g,w,'parry');w.body.solid=false;return true;
  }
  if(phase!=='defend'&&overlap(p.x,p.y,p.w,9,w.x,w.y,w.w,w.h)){Core.kill(g,p,'warden');return;}
 }else if(w.state==='back'){
  if(phase!=='defend'&&overlap(p.x,p.y,p.w,9,w.x,w.y,w.w,w.h)){Core.kill(g,p,'warden');return;}
 }
}
function after(g){if(!g.players)settle(g);}
function afterPlayers(g){
 const p=g.p,actor=g.coopActor,parried=new Set();
 try{settle(g,'world');for(const phase of ['defend','hurt'])for(const [i,knight]of g.players.entries()){
  if(phase==='hurt'&&parried.has(knight))continue;
  g.p=knight;g.coopActor=i;if(settle(g,phase))parried.add(knight);
 }}
 finally{g.p=p;g.coopActor=actor;}
}
function gone(g,w,kneel){w.gone=!kneel;if(kneel)w.kneel=true;w.body.solid=false;C().emit(g,'warden-gone',{x:cx(w),y:w.y+w.h/2,how:kneel?'kneel':w.d.leave||'left'});if(!kneel)w.state='gone';}
function gateHold(g){const w=g.warden;return !!(w&&!w.gone&&!w.kneel&&w.state!=='leave');}

(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-gaol',reset,before,after,afterPlayers,gateHold});
root.BladefallRbrGaol=Object.freeze({WK});
})(typeof window!=='undefined'?window:globalThis);
