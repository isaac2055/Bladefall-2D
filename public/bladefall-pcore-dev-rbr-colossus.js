/* Precision Core — Room by Room · 11. The Ember Colossus (7.259): the Last Pour, and a 'belt' event.

   Room def `colossus:{rail,x,bays,need,gather,pour,rest,first,speed,jam,body,leave}`. The Colossus is the Foundry's machine
   grown into a general: a furnace-bodied giant standing in the dark beyond the room's `body` wall ('left' or
   'right'), whose arm carries a ladle along a rail under the roof. Its sentence is the Foundry's own, turned on it:
   - The ladle hangs from the rail with its lip on tile row `rail`, starting over column `x` (default the first bay).
     It goes to each bay in `bays` (tile columns) in turn, gathers there for `gather` frames (default 60: the ladle
     tips, and chevrons run down the column it is about to fill), then pours for `pour` frames (default 46).
   - The pour is a falling column of metal one tile wide, from the ladle's lip to the first solid thing under it.
     It kills whatever it meets. An empty mould is no floor to it: the metal runs straight through.
   - A pour onto a mould you have struck cold is refused. The metal sets on the cold iron there and then, into a
     solid iron pillar from the mould up to the ladle's lip (a foothold, and a wall to climb), and the ladle jams
     for a moment. Each refusal counts; a bay that has refused is never poured again. Refuse it `need` times
     (default: every bay) and it is beaten: its arm goes the way `leave` says ('left' or 'right': it drags the
     ladle off along the rail; 'up': it hoists it off the top of the screen; 'down': the whole machine falls
     through the floor) and the room's tally gates (G) open.
   - Between pours it rests `rest` frames (default 40) while the column drains; `first` delays its first move.
   Opt-in (7.277; without it the machine behaves exactly as above):
   - `crack:true` (7.280, the Fractured Colossus): a pour that lands on fault stone (bladefall-pcore-dev-fault.js,
     a room with `fault`) cracks the strip from where it landed, as a touch would; the floor there falls tile by tile.
   - `hunt:{every,lock,speed}`: every `every`-th move (default 3) it hunts instead of going to its next bay: the ladle
     follows the knight's column along the rail (at `speed`, default 110 px/s) while it gathers, holds still for the
     last `lock` frames (default 18: its chevrons turn red), and pours there. The pour kills as any pour does; but it
     obeys the same law: if it lands on a mould you have struck cold, at a bay it has not yet been refused, it is
     refused there and counts. So stand on your own iron when it aims at you, and step off before it pours.
   It does nothing in a room without `colossus`; such rooms wait for the first input before it wakes (`study:true`).
   Emits colossus-gather, colossus-pour, colossus-refuse {n,need}, colossus-down, and pour (the cause of a death).

   Separately, in Room by Room rooms only, it emits `belt` the frame the knight or the lantern comes to rest on a
   casting belt (bladefall-pcore-dev-foundry.js), so a skip hunt can ask for a way out that never used one:
     node scripts/rbr-skip.mjs f11-line --without belt --plain
   That part moves nothing. Drawn by bladefall-pcore-dev-rbr-colossus-view.js. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8;
const CK=Object.freeze({gather:60,pour:46,rest:40,jam:50,speed:84,flow:480,leave:150,first:20});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;

function reset(g){
 const d=g.room.def.colossus;g.colossus=null;
 if(!d)return;
 const bays=d.bays||[20];
 g.colossus={d,bays,x:(d.x??bays[0])*TILE+4,y0:(d.rail+1)*TILE,i:0,state:'move',t:0,cool:d.first??CK.first,len:0,drain:0,
  refused:new Set(),n:0,need:d.need||bays.length,gone:false,sink:0,jamX:0,moves:0,hunt:false,col:bays[0]};
 for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
}
const bayX=c=>c*TILE;
/* Where a column of metal from the lip at x (left edge of the bay) stops: the first solid pixel row under it. */
function stopAt(g,c,x){
 const Core=C(),h=g.room.h;
 for(let y=c.y0;y<h;y++)if(Core.solidAt(g,x+1,y,6,1))return y;
 return h+16;
}
function castMouldAt(g,x,y){return g.ents.find(e=>e.type==='mould'&&e.solid&&e.x===x&&e.y===y)||null;}
function nextBay(c){
 for(let k=1;k<=c.bays.length;k++){const j=(c.i+k)%c.bays.length;if(!c.refused.has(j)){c.i=j;return true;}}
 return false;
}
/* Opt-in hunt: the column under the knight (its arm reaches the whole rail, wall to wall). */
function huntCol(g,c){
 const lo=1,hi=g.room.cols-2;
 return Math.max(lo,Math.min(hi,Math.floor((g.p.x+g.p.w/2)/TILE)));
}
function startMove(c){c.moves++;const h=c.d.hunt;c.hunt=!!h&&c.moves%(h.every||3)===0;if(!c.hunt)c.col=c.bays[c.i];}
function before(g){
 const c=g.colossus;if(!c||c.gone||!g.awake)return;
 const Core=C(),p=g.p;
 c.t++;
 if(c.state==='move'){
  if(c.cool>0){c.cool--;return;}
  if(c.hunt)c.col=huntCol(g,c);else c.col=c.bays[c.i];
  const tx=bayX(c.col)+4,dx=tx-c.x,s=(c.d.speed||CK.speed)*Core.DT;
  if(Math.abs(dx)<=s){c.x=tx;c.state='gather';c.t=0;Core.emit(g,'colossus-gather',{x:c.x,y:c.y0,hunt:c.hunt});}
  else c.x+=Math.sign(dx)*s;
 }else if(c.state==='gather'){
  const gather=c.d.gather||CK.gather;
  if(c.hunt){
   // It follows the knight along the rail until the lock, then holds.
   const h=c.d.hunt,lock=h.lock??18;
   if(c.t<gather-lock){c.col=huntCol(g,c);}
   else if(c.t===gather-lock)Core.emit(g,'colossus-lock',{x:bayX(c.col)+4,y:c.y0});
   const tx=bayX(c.col)+4,dx=tx-c.x,sp=(h.speed||110)*Core.DT;
   c.x=Math.abs(dx)<=sp?tx:c.x+Math.sign(dx)*sp;
   if(c.t>=gather&&c.x!==tx)c.t=gather-1;   // it pours only where it has arrived
  }
  if(c.t>=gather){c.state='pour';c.t=0;c.len=0;c.drain=0;Core.emit(g,'colossus-pour',{x:c.x,y:c.y0,hunt:c.hunt});}
 }else if(c.state==='pour'){
  const x=bayX(c.col),stop=stopAt(g,c,x);
  c.len=Math.min(c.len+CK.flow*Core.DT,stop-c.y0);
  // Metal that reaches cold iron sets on it: the pour is refused.
  if(c.y0+c.len>=stop){const m=castMouldAt(g,x,stop);if(m){refuse(g,c,x,stop);return;}}
  // Opt-in (7.280, the Fractured Colossus) `crack:true`: metal that lands on fault stone cracks the strip there.
  if(c.d.crack&&c.y0+c.len>=stop&&g.fault){const f=g.ents.find(e=>e.type==='fault'&&e.solid&&e.fuse<0&&e.x===x&&e.y===stop);if(f)crackFault(g,f);}
  if(c.t>=(c.d.pour||CK.pour)){c.state='rest';c.t=0;}
 }else if(c.state==='rest'){
  // The column drains from the top and falls away.
  c.drain+=CK.flow*Core.DT;
  if(c.t>=(c.d.rest||CK.rest)){c.len=0;c.drain=0;if(!c.hunt)nextBay(c);c.state='move';c.t=0;startMove(c);}
 }else if(c.state==='jam'){
  if(c.t>=(c.d.jam||CK.jam)){
   if(c.n>=c.need){c.state='leave';c.t=0;Core.emit(g,'colossus-down',{x:c.x,y:c.y0,how:c.d.leave||'right'});}
   else{if(c.refused.has(c.i))nextBay(c);c.state='move';c.t=0;startMove(c);}
  }
 }else if(c.state==='leave'){
  const how=c.d.leave||'right';
  if(how==='left'||how==='right')c.x+=(how==='right'?1:-1)*Math.min(4,1+c.t*.05);
  else if(how==='up')c.sink-=Math.min(4,.5+c.t*.04);
  else c.sink+=Math.min(3,.3+c.t*.03);
  if(c.t>=CK.leave){c.gone=true;}
 }
 // The pour kills what it meets (the drained top of the column is empty).
 if((c.state==='pour'||c.state==='rest')&&p.state!=='dead'&&p.state!=='respawn'){
  const x=bayX(c.col),top=c.y0+c.drain,bot=c.y0+c.len;
  if(bot>top&&overlap(p.x,p.y,p.w,p.h,x+1,top,6,bot-top))Core.kill(g,p,'pour');
 }
}
function refuse(g,c,x,stop){
 const Core=C(),p=g.p;
 // A hunt's pour counts for the bay it landed on (if that bay has not refused it already).
 let bay=c.i;if(c.hunt){bay=c.bays.findIndex((b,j)=>b===c.col&&!c.refused.has(j));if(bay<0){c.state='rest';c.t=0;return;}}
 const pillar={type:'cpillar',dev:true,solid:true,x,y:c.y0,w:TILE,h:stop-c.y0,id:'cp'+c.n,glow:60};
 if(pillar.h>0){g.ents.push(pillar);if(overlap(p.x,p.y,p.w,p.h,pillar.x,pillar.y,pillar.w,pillar.h))Core.kill(g,p,'pour');}
 c.refused.add(bay);c.n++;c.state='jam';c.t=0;c.len=0;c.drain=0;c.jamX=x;
 g.freeze=Math.max(g.freeze,4);
 Core.emit(g,'colossus-refuse',{x:x+4,y:stop,n:c.n,need:c.need});
}
/* The fault device's crack, started by the pour instead of a touch (fault stone: bladefall-pcore-dev-fault.js). */
function crackFault(g,hit){
 const {fuse,spread}=g.fault.cfg,line=g.ents.filter(e=>e.type==='fault'&&e.line===hit.line),byRC=new Map(line.map(e=>[e.c+','+e.r,e]));
 const dist=new Map([[hit,0]]),q=[hit];
 while(q.length){const a=q.shift(),d=dist.get(a);for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const b=byRC.get((a.c+dc)+','+(a.r+dr));if(b&&!dist.has(b)){dist.set(b,d+1);q.push(b);}}}
 for(const [e,d] of dist){if(!e.solid)continue;const f=fuse+spread*d;if(e.fuse<0||f<e.fuse){e.fuse=f;e.state='crack';}}
 C().emit(g,'fault-crack',{x:hit.x+4,y:hit.y+4,line:hit.line,by:'pour'});
}
function gateHold(g){const c=g.colossus;return !!(c&&c.n<c.need);}

/* The 'belt' event (Room by Room rooms only). */
function after(g){
 if(!g.room.def.rbr||!g.room.belt)return;
 const F=root.BladefallPrecisionFoundry;if(!F)return;
 const Core=C(),p=g.p;
 const on=p.state!=='dead'&&p.onGround&&!!F.beltUnder(g,p.x,p.y,p.w,p.h);
 if(on&&!p.rbrOnBelt)Core.emit(g,'belt',{x:p.x+4,y:p.y+p.h,who:'knight'});
 p.rbrOnBelt=on;
 for(const e of g.ents){if(e.type!=='lantern')continue;
  const l=!e.held&&!e.returning&&!!F.beltUnder(g,e.x,e.y,e.w,e.h);
  if(l&&!e.rbrOnBelt)Core.emit(g,'belt',{x:e.x+4,y:e.y+e.h,who:'lantern'});
  e.rbrOnBelt=l;}
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-colossus',reset,before,after,gateHold});
root.BladefallRbrColossus=Object.freeze({CK});
})(typeof window!=='undefined'?window:globalThis);
