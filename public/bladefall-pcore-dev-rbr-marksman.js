/* Precision Core — Room by Room · 5. The Hollow Marksman (7.259): the boss of Deadeye Court.

   Room def `marksman:{perches:[{c,r}], hits, every, tell, first, speed, ward, leave}` (perch: the tile he
   stands on, feet on its floor line). He keeps the room's clock, which starts with the first input (put
   `study:true` on the room). On his beat he draws: for `tell` frames he holds a locked aim at where the
   knight was when he drew (the view draws the line), then looses one marked arrow along it. The arrow is
   an ordinary foe bolt (bladefall-pcore-foes.js), so the shared parry meets it, returns it the way the knight
   holds, and stone or a moving mantlet (a deck) stops it.
   - A returned arrow that reaches him is a hit. Until he has taken `hits` in this room he leaps to his next
     perch (a visible jump; no shots while in the air). With the last, he leaves the way `leave` says:
     'right' or 'up' (off the screen, to the next room) or 'fall' (off his perch and down: defeated).
   - `ward`: the id of a Combat coil (room def `combat.receivers`). Until a returned bolt lights it, his
     brass lens turns every returned arrow aside (it breaks on him, 'guard-block').
   - The blade does not reach him: perches are out of reach, and his body is not a target.
   - Tally gates (G) in his room are keyed to him: they open when he has gone.
   Emits mk-tell, enemy-shot, marksman-hit, marksman-leap, marksman-gone (and guard-block).
   Opt-in (7.277; without these fields he behaves exactly as above):
   - `volley:n` (with `gap`, default 16 frames): each draw looses n marked arrows down the same locked line, `gap`
     frames apart. Any of them, returned, is a hit; the rest still come. A hit (he leaps) ends the volley.
   - `rain:{every,on,w,n,speed,delay}`: every `every`-th draw (default 3) — or, with on:'leap', the first draw from
     each new perch — he draws straight up instead. Through the
     tell a band `w` tiles wide (default 5) is marked on the ground under where the knight stood when he drew; he
     looses up, and `delay` frames later (default 18) `n` arrows (default 5) fall through the band from the top of
     the room at `speed` px/s (default 150). They are ordinary foe bolts: stone and a mantlet stop them, the blade
     breaks one, the parry turns one; leave the band or get under cover. Emits mk-rain.
   It does nothing in a room without `marksman`. Drawn by bladefall-pcore-dev-rbr-marksman-view.js. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8;
const MK=Object.freeze({w:10,h:16,every:120,tell:36,first:50,speed:130,bolt:6,leap:40,leave:70,after:40});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
const at=pc=>({x:pc.c*TILE-1,y:(pc.r+1)*TILE-MK.h});

function reset(g){
 const d=g.room.def.marksman;g.mk=null;
 if(!d)return;
 const perches=d.perches||[{c:30,r:5}];
 const o=at(perches[0]);
 g.mk={d,perches,i:0,x:o.x,y:o.y,w:MK.w,h:MK.h,hits:0,need:d.hits||1,every:d.every||MK.every,tell:d.tell||MK.tell,speed:d.speed||MK.speed,
  state:'watch',t:0,next:d.first??MK.first,aim:null,face:-1,from:null,to:null,gone:false,
  draws:0,mode:'line',band:null,volley:[],rainQ:[]};
 // He shares the foes' bolts and parry: make sure that system runs in this room.
 if(!g.foes){g.foes=[];g.bolts=[];g.fclock=0;}
 for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
}
const centre=o=>({x:o.x+o.w/2,y:o.y+o.h/2});
function target(g,m){return g.players?.filter(p=>p.state!=='dead'&&p.state!=='respawn').sort((a,b)=>Math.hypot(a.x+4-m.x-m.w/2,a.y+5-m.y-m.h/2)-Math.hypot(b.x+4-m.x-m.w/2,b.y+5-m.y-m.h/2))[0]||g.p;}
function warded(g,m){
 const id=m.d.ward;if(!id)return false;
 const r=g.combat&&g.combat.receivers.find(x=>x.id===id);
 return !(r&&r.lit);
}
function before(g){
 const m=g.mk;if(!m||m.gone||!g.awake)return;
 const Core=C(),p=target(g,m);
 // Returned arrows that reach him (the foes module has already moved every bolt this frame).
 if(m.state==='watch'||m.state==='draw'){
  for(const b of g.bolts){
   if(!b.alive||!b.friendly||!overlap(b.x,b.y,b.w,b.h,m.x,m.y,m.w,m.h))continue;
   b.alive=false;
   if(warded(g,m)){Core.emit(g,'guard-block',{x:b.x+3,y:b.y+3});continue;}
   m.hits++;Core.emit(g,'marksman-hit',{x:m.x+m.w/2,y:m.y+6,hits:m.hits,need:m.need,...(g.players&&Number.isInteger(b.parriedBy)?{player:b.parriedBy}:{})});
   if(m.hits>=m.need){m.state='leave';m.t=0;m.from={x:m.x,y:m.y};}
   else{m.i=(m.i+1)%m.perches.length;m.state='leap';m.t=0;m.from={x:m.x,y:m.y};m.to=at(m.perches[m.i]);Core.emit(g,'marksman-leap',{x:m.x+m.w/2,y:m.y+m.h});}
   m.aim=null;m.volley=[];if(!m.raining)m.band=null;break;
  }
  g.bolts=g.bolts.filter(b=>b.alive);
 }
 // The rest of a volley, and a rain on its way down (opt-in).
 if(m.volley.length&&(m.state==='watch'||m.state==='draw')){for(const v of m.volley)v.t--;while(m.volley.length&&m.volley[0].t<=0){loose(g,m,m.volley.shift().aim);}}
 if(m.rainQ.length){for(const r of m.rainQ)r.t--;while(m.rainQ.length&&m.rainQ[0].t<=0){const r=m.rainQ.shift();rainArrow(g,m,r.x);}}
 else if(m.band&&m.raining&&!g.bolts.some(b=>b.alive&&b.from==='mk-rain')){m.band=null;m.raining=false;}   // the band shows until the rain is down
 m.t++;
 if(m.state==='watch'||m.state==='draw'){
  const k=centre(m),q={x:p.x+4,y:p.y+5};
  if(m.state==='watch'){m.face=q.x<k.x?-1:1;
   if(m.t>=m.next&&p.state!=='dead'&&p.state!=='respawn'&&!m.volley.length&&!m.rainQ.length){
    const dx=q.x-k.x,dy=q.y-k.y,n=Math.hypot(dx,dy)||1;m.draws++;
    const rain=m.d.rain;
    if(rain&&(rain.on==='leap'?m.rainNext:m.draws%(rain.every||3)===0)){m.rainNext=false;m.mode='rain';m.aim={x:0,y:-1};const w=(rain.w||5)*TILE;m.band={x:Math.round(q.x-w/2),w,y:groundUnder(g,q.x,p.y+p.h)};}
    else{m.mode='line';m.aim={x:dx/n,y:dy/n};m.face=dx<0?-1:1;}
    m.state='draw';m.t=0;Core.emit(g,'mk-tell',{x:k.x,y:k.y,rain:m.mode==='rain'});}}
  else if(m.t>=m.tell){
   if(m.mode==='rain'){
    // Loosed up; the rain falls through the marked band a moment later.
    const r=m.d.rain,n=r.n||5,b=m.band;
    for(let i=0;i<n;i++)m.rainQ.push({t:(r.delay??18)+(i*7)%11,x:b.x+Math.round((i+.5)*b.w/n)});
    m.rainQ.sort((a,b)=>a.t-b.t);m.raining=true;
    Core.emit(g,'mk-rain',{x:k.x,y:m.y,bx:b.x,bw:b.w});
   }else{
    loose(g,m,m.aim);
    const n=m.d.volley||1;for(let i=1;i<n;i++)m.volley.push({t:i*(m.d.gap||16),aim:m.aim});
   }
   m.state='watch';m.t=0;m.next=m.every-m.tell;m.aim=null;m.mode='line';
  }
 }else if(m.state==='leap'){
  const u=Math.min(1,m.t/MK.leap),hgt=Math.max(0,Math.min(24+Math.abs(m.to.x-m.from.x)*.15,Math.min(m.from.y,m.to.y)-2));   // the arc stays on the screen
  m.x=Math.round(m.from.x+(m.to.x-m.from.x)*u);m.y=Math.round(m.from.y+(m.to.y-m.from.y)*u-Math.sin(u*Math.PI)*hgt);
  m.face=m.to.x>=m.from.x?1:-1;
  if(u>=1){m.state='watch';m.t=0;m.next=MK.after;m.rainNext=true;}
 }else if(m.state==='leave'){
  const how=m.d.leave||'right';
  if(how==='fall'){m.y=Math.round(m.from.y+(m.t>12?(m.t-12)*(m.t-12)*.12:-m.t*.4));if(m.t>=MK.leave||m.y>g.room.h+20)gone(g,m);}
  else if(how==='up'){m.y=Math.round(m.from.y-m.t*m.t*.08);m.x=m.from.x+Math.round(m.t*.4)*(m.face||1);if(m.t>=MK.leave)gone(g,m);}
  else{m.face=1;m.x=Math.round(m.from.x+m.t*2.2);m.y=Math.round(m.from.y-Math.sin(Math.min(1,m.t/24)*Math.PI)*14);if(m.t>=MK.leave||m.x>g.room.w+12)gone(g,m);}
 }
}
/* The foes' parry sends an unaimed bolt back on the signs of its speed (a 45° line for a slanted one). His arrows
   fly at any slant, so an unaimed return of one goes back exactly along its own line, as the hint says. */
function after(g){
 const m=g.mk;if(!m||!g.bolts)return;
 for(const b of g.bolts){
  if(!b.marked||!b.friendly||b.turned)continue;
  b.turned=true;const a=g.players?b.returnAim:g.p.parryAim;
  if(!(a&&(a.x||a.y))){const k=Math.hypot(b.vx,b.vy)/(Math.hypot(b.ovx,b.ovy)||1);b.vx=-b.ovx*k;b.vy=-b.ovy*k;}
 }
}
/* One marked arrow along `a`: it leaves the bow where its line first clears his perch (straight down through it,
   it still breaks). */
function loose(g,m,a){
 const Core=C(),k=centre(m),s=MK.bolt;let d=9;while(d<24&&Core.solidAt(g,Math.round(k.x-s/2+a.x*d),Math.round(m.y+5-s/2+a.y*d),s,s))d+=3;
 g.bolts.push({x:k.x-s/2+a.x*d,y:m.y+5-s/2+a.y*d,w:s,h:s,vx:a.x*m.speed,vy:a.y*m.speed,ovx:a.x*m.speed,ovy:a.y*m.speed,friendly:false,from:'mk',marked:true,alive:true});
 Core.emit(g,'enemy-shot',{x:k.x,y:m.y+5});
}
/* A falling arrow of a rain, from the first open air at the top of its column. */
function rainArrow(g,m,x){
 const Core=C(),s=MK.bolt,sp=m.d.rain.speed||150;let y=0;while(y<g.room.h-8&&Core.solidAt(g,x-s/2,y,s,s))y+=2;
 g.bolts.push({x:x-s/2,y,w:s,h:s,vx:0,vy:sp,ovx:0,ovy:sp,friendly:false,from:'mk-rain',alive:true});
}
/* The floor line under a point (for the rain band): the first solid below it. */
function groundUnder(g,x,y){const Core=C();let yy=Math.max(0,Math.round(y));while(yy<g.room.h&&!Core.solidAt(g,Math.round(x)-1,yy,2,1))yy++;return yy;}
function gone(g,m){m.gone=true;m.state='gone';C().emit(g,'marksman-gone',{x:m.x+m.w/2,y:m.y+m.h/2,how:m.d.leave||'right'});}
function gateHold(g){return !!(g.mk&&!g.mk.gone);}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-marksman',reset,before,after,afterPlayer:after,gateHold});
root.BladefallRbrMarksman=Object.freeze({MK,warded});
})(typeof window!=='undefined'?window:globalThis);
