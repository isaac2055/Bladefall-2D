/* Precision Core — Room by Room · 9. The Frost Sorcerer (7.259): the boss of the White Court.

   Room def `sorcerer:{posts:[{c,r}], hits, every, tell, first, speed, leave}` (post: the tile his feet stand in;
   the tile under it must be water, bladefall-pcore-dev-water.js). He stands on the surface of a pool, and that
   pool is his ward. The rule the region has taught answers him:
   - While the pool under his feet is water, nothing touches him: the blade glances off his ward (a knock back,
     'guard-block'), and a returned orb breaks on it.
   - Freeze that pool (strike it, strike a condenser, or let frost into it) and he stands on ice, his ward gone,
     staggered for as long as the ice lasts. Then one cut is a wound. When the pool thaws the ward comes back.
   - His frost freezes the water it touches. On his beat he draws: for `tell` frames he holds a locked aim at
     where the knight was (the view draws the line), then casts one orb along it. The orb is an ordinary foe bolt
     (bladefall-pcore-foes.js): it kills what it meets, stone stops it, the blade breaks it, the parry turns it.
     Whatever it is — his, or turned back — an orb that touches unfrozen water freezes that whole pool, his own
     included. So a knight who stands where the line runs through the Sorcerer's own pool makes him freeze it.
   - A post may say `fall:{c,r}` (a floor tile under it): there his pool stands on a pillar, out of the blade's
     reach. When it freezes he loses his footing on the ice and drops to that tile, and lies there `down` frames
     (default 150) before he blinks back up: that is the opening.
   - With each wound he blinks to his next post (the posts' pools are separate), until he has taken `hits`
     (default 1); with the last he goes as `leave` says: 'right' or 'up' (he blinks out of the room, ahead of the
     knight) or 'kneel' (he kneels on the ice, and his pool stays frozen for good).
   - His body is not solid and does not hurt. Tally gates (G) in his room are keyed to him: they open when he
     has gone (or knelt).
   The room waits for the first input before he wakes (put `study:true` on the room).
   Emits sorc-tell, enemy-shot, sorc-frost (an orb froze a pool), sorc-break (his ward fell), sorc-ward (it came
   back), sorc-down (he fell from his pillar), sorc-hit, sorc-blink, sorc-gone (and guard-block when the blade meets the ward).

   Opt-in (7.277; without it he behaves exactly as above):
   - `icicles:{every,n,gap,speed,stake}`: every `every`-th cast (default 2) he raises his staff instead of drawing an
     orb. Through the tell, `n` icicles (default 3) grow on the roof: one over the knight, the others `gap` tiles
     (default 4) to either side. When he looses, they fall (accelerating to `speed`, default 200 px/s). An icicle
     kills what it meets, the blade shatters it, and it freezes the water it falls into (his own cup included). One
     that strikes stone sticks there as an ice stake (`stake` frames, default 150; 0 shatters it): a solid post of ice
     that stops his orbs and yours, can be stood on, and that the blade breaks. Emits sorc-icicles, icicle-break,
     icicle-stake, icicle-melt, and icicle (the cause of a death).
   Also, in every Room by Room region-9 (and, 7.280, region-29) room with water: the room's grid is restated from the pools' state at the
   start of each step (`input` hook). The water module keeps ice in the room's grid, which the authoring tools'
   snapshots share between search branches; this keeps a branch from standing on another branch's ice. In play
   it changes nothing (the grid already matches). Drawn by bladefall-pcore-dev-rbr-sorcerer-view.js. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const W=()=>root.BladefallPrecisionWater;
const TILE=8;
const SK=Object.freeze({w:10,h:18,every:110,tell:40,first:40,speed:115,orb:6,blink:36,leave:50,glance:150,after:50,drop:24,down:150,
 iceW:6,iceH:10,iceSpeed:200,iceAccel:900,stake:150,stakeH:16});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
const at=pc=>({x:pc.c*TILE+(TILE-SK.w)/2|0,y:(pc.r+1)*TILE-SK.h});
const open=s=>s.state==='broken'||s.state==='drop'||s.state==='down';

/* The grid, restated from the pools (see the header). */
function input(g){
 const w=g.water,def=g.room.def;if(!w||(def.rbr!==9&&def.rbr!==29))return;   // 7.280: the Fractured Sorcerer (29) too
 const Core=C(),grid=g.room.grid,ice=g.room.ice;
 for(const pool of w.pools){
  const on=pool.frozen>0;
  for(const i of pool.cells){const solid=on&&!pool.pending.has(i);grid[i]=solid?Core.SOLID:Core.EMPTY;if(ice)ice[i]=solid?1:0;}
 }
}

function poolAt(g,c,r){const w=g.water,COLS=g.room.cols,ROWS=g.room.rows;if(!w||c<0||c>=COLS||r<0||r>=ROWS)return null;const i=r*COLS+c;return w.cells[i]?w.pools[w.body[i]]:null;}
function reset(g){
 const d=g.room.def.sorcerer;g.sorc=null;g.icicles=null;
 if(!d)return;
 const posts=d.posts||[{c:30,r:12}],o=at(posts[0]);
 g.sorc={d,posts,i:0,x:o.x,y:o.y,w:SK.w,h:SK.h,hits:0,need:d.hits||1,every:d.every||SK.every,tell:d.tell||SK.tell,speed:d.speed||SK.speed,
  state:'watch',t:0,next:d.first??SK.first,aim:null,face:-1,gone:false,kneel:false,warded:true,casts:0,mode:'orb'};
 g.icicles=[];
 // His orbs are the foes' bolts, met by the shared parry: make sure that system runs in this room.
 if(!g.foes){g.foes=[];g.bolts=[];g.fclock=0;}
 for(const e of g.ents)if(e.type==='gate')e.devKeyed=true;
}
const post=s=>s.posts[s.i];
function myPool(g,s){const pc=post(s);return poolAt(g,pc.c,pc.r+1);}
function warded(g,s){const pool=myPool(g,s);return !(pool&&pool.frozen>0);}
const centre=o=>({x:o.x+o.w/2,y:o.y+o.h/2});

/* An orb that touches unfrozen water freezes that pool (his frost, or the knight's return of it). */
function frost(g){
 if(!g.bolts||!g.water)return;
 const Core=C();
 for(const b of g.bolts){
  if(!b.alive)continue;
  const c0=Math.floor(b.x/TILE),c1=Math.floor((b.x+b.w-1)/TILE),r0=Math.floor(b.y/TILE),r1=Math.floor((b.y+b.h-1)/TILE);
  let hit=null;
  for(let r=r0;r<=r1&&!hit;r++)for(let c=c0;c<=c1&&!hit;c++){const pool=poolAt(g,c,r);if(pool&&!(pool.frozen>0)&&Core.tileAt(g,c,r)!==Core.SOLID)hit=pool;}
  if(!hit)continue;
  b.alive=false;W().freeze(g,hit);Core.emit(g,'sorc-frost',{x:b.x+3,y:b.y+3,pool:hit.id,friendly:!!b.friendly});
 }
 g.bolts=g.bolts.filter(b=>b.alive);
}

/* Opt-in icicles (see the header). */
function growIcicles(g,s,x){
 const Core=C(),ic=s.d.icicles,n=ic.n||3,gap=(ic.gap??4)*TILE,c0=Math.floor(x/TILE)*TILE+1;
 for(let i=0;i<n;i++){
  const cx=c0+Math.round((i-(n-1)/2)*gap);if(cx<0||cx+SK.iceW>g.room.w)continue;
  let y=0;while(y<g.room.h-TILE&&Core.solidAt(g,cx,y,SK.iceW,SK.iceH))y+=TILE;
  if(y>=g.room.h-TILE)continue;
  g.icicles.push({x:cx,y,w:SK.iceW,h:SK.iceH,state:'form',t:0,vy:0,rem:0});
 }
}
function icicleStep(g){
 const Core=C(),s=g.sorc,ic=s.d.icicles||{};
 for(const c of g.icicles){
  c.t++;
  if(c.state==='fall'){
   c.vy=Math.min(ic.speed||SK.iceSpeed,c.vy+SK.iceAccel*Core.DT);c.rem+=c.vy*Core.DT;let n=Math.floor(c.rem);c.rem-=n;
   while(n-->0&&c.state==='fall'){
    // Into water: the pool freezes, the icicle is spent.
    const pool=poolAt(g,Math.floor((c.x+3)/TILE),Math.floor((c.y+c.h)/TILE));
    if(pool&&!(pool.frozen>0)){W().freeze(g,pool);c.state='gone';Core.emit(g,'sorc-frost',{x:c.x+3,y:c.y+c.h,pool:pool.id,icicle:true});break;}
    if(Core.solidAt(g,c.x,c.y+1,c.w,c.h)){
     const life=ic.stake??SK.stake;
     if(life>0&&!Core.solidAt(g,c.x,c.y+c.h-SK.stakeH,c.w,SK.stakeH)){
      c.state='stake';c.t=0;c.life=life;c.y=c.y+c.h-SK.stakeH;c.h=SK.stakeH;
      c.ent={type:'iceStake',dev:true,solid:false,x:c.x,y:c.y,w:c.w,h:c.h,id:'is'+g.frame+'_'+c.x};g.ents.push(c.ent);
      Core.emit(g,'icicle-stake',{x:c.x+3,y:c.y+c.h});
     }else{c.state='gone';Core.emit(g,'icicle-break',{x:c.x+3,y:c.y+c.h});}
     break;
    }
    c.y++;
    if(c.y>g.room.h){c.state='gone';break;}
   }
  }else if(c.state==='stake'){
   // Solid once the knight is clear of it (it never closes around her).
   const p=g.p;if(!c.ent.solid&&!overlap(p.x,p.y,p.w,p.h,c.x,c.y,c.w,c.h))c.ent.solid=true;
   if(--c.life<=0){c.state='gone';Core.emit(g,'icicle-melt',{x:c.x+3,y:c.y+c.h/2});}
  }
  if(c.state==='gone'&&c.ent){c.ent.gone=true;c.ent.solid=false;}
 }
 // Orbs (his or turned) break on a stake.
 if(g.bolts)for(const b of g.bolts)for(const c of g.icicles)if(b.alive&&c.state==='stake'&&overlap(b.x,b.y,b.w,b.h,c.x,c.y,c.w,c.h)){b.alive=false;Core.emit(g,'guard-block',{x:b.x+3,y:b.y+3,ice:true});}
 if(g.bolts)g.bolts=g.bolts.filter(b=>b.alive);
 g.icicles=g.icicles.filter(c=>c.state!=='gone');
 g.ents=g.ents.filter(e=>!(e.type==='iceStake'&&e.gone));
}
function before(g){
 const s=g.sorc;
 if(s&&g.icicles&&g.awake)icicleStep(g);
 if(s&&!s.gone&&g.awake)beforeSorc(g,s);
 // Every room of the region with his orbs: frost freezes water (the foes module has moved every bolt this frame).
 if(g.sorc&&g.awake)frost(g);
}
function beforeSorc(g,s){
 const Core=C(),p=g.p;
 s.t++;
 if(s.kneel)return;
 const was=s.warded;if(s.state!=='drop'&&s.state!=='down'&&s.state!=='blink')s.warded=warded(g,s);
 if(s.state==='watch'||s.state==='tell'||s.state==='broken'){
  if(!s.warded&&s.state!=='broken'){
   s.t=0;s.aim=null;Core.emit(g,'sorc-break',{x:s.x+s.w/2,y:s.y+s.h/2});
   if(g.icicles)for(const c of g.icicles)if(c.state==='form'){c.state='gone';Core.emit(g,'icicle-melt',{x:c.x+3,y:c.y+c.h/2});}   // his hold on them breaks with his ward
   const f=post(s).fall;if(f){s.state='drop';s.from={x:s.x,y:s.y};s.to=at(f);}else s.state='broken';
  }
  else if(s.warded&&s.state==='broken'){s.state='watch';s.t=0;s.next=SK.after;Core.emit(g,'sorc-ward',{x:s.x+s.w/2,y:s.y+s.h/2});}
 }
 if(was!==s.warded&&s.warded&&s.state==='watch'&&s.next<SK.after)s.next=SK.after;
 const k=centre(s),q={x:p.x+4,y:p.y+5},alive=p.state!=='dead'&&p.state!=='respawn';
 if(s.state==='watch'){
  s.face=q.x<k.x?-1:1;
  if(s.t>=s.next&&alive){const dx=q.x-k.x,dy=q.y-(s.y+6),n=Math.hypot(dx,dy)||1;s.aim={x:dx/n,y:dy/n};s.face=dx<0?-1:1;s.state='tell';s.t=0;
   const ic=s.d.icicles;s.casts++;s.mode=ic&&s.casts%(ic.every||2)===0?'ice':'orb';
   if(s.mode==='ice'){s.aim={x:0,y:-1};growIcicles(g,s,q.x);}
   Core.emit(g,'sorc-tell',{x:k.x,y:s.y+6,ice:s.mode==='ice'});}
 }else if(s.state==='tell'&&s.mode==='ice'){
  if(s.t>=s.tell){for(const c of g.icicles)if(c.state==='form')c.state='fall';Core.emit(g,'sorc-icicles',{x:k.x,y:s.y});s.state='watch';s.t=0;s.next=s.every-s.tell;s.aim=null;s.mode='orb';}
 }else if(s.state==='tell'){
  if(s.t>=s.tell){
   // The orb leaves the hand on the knight's side, where its line first clears stone.
   const o=SK.orb,a=s.aim,hx=k.x+(a.x<0?-4:4);let d=6;while(d<24&&Core.solidAt(g,Math.round(hx-o/2+a.x*d),Math.round(s.y+6-o/2+a.y*d),o,o))d+=3;
   g.bolts.push({x:hx-o/2+a.x*d,y:s.y+6-o/2+a.y*d,w:o,h:o,vx:a.x*s.speed,vy:a.y*s.speed,ovx:a.x*s.speed,ovy:a.y*s.speed,friendly:false,from:'sorc',marked:true,frost:true,alive:true});
   Core.emit(g,'enemy-shot',{x:k.x,y:s.y+6,frost:true});s.state='watch';s.t=0;s.next=s.every-s.tell;s.aim=null;
  }
 }else if(s.state==='blink'){
  if(s.t===Math.floor(SK.blink/2)){const o=at(post(s));s.x=o.x;s.y=o.y;s.warded=warded(g,s);}
  if(s.t>=SK.blink){s.state='watch';s.t=0;s.next=SK.after;}
 }else if(s.state==='leave'){
  if(s.t>=SK.leave)gone(g,s);
 }else if(s.state==='drop'){
  // Off his ice and down to the floor: a short hop out, then the fall.
  const u=Math.min(1,s.t/SK.drop);s.x=Math.round(s.from.x+(s.to.x-s.from.x)*u);s.y=Math.round(s.from.y+(s.to.y-s.from.y)*u*u-Math.sin(u*Math.PI)*6);
  if(u>=1){s.state='down';s.t=0;Core.emit(g,'sorc-down',{x:s.x+s.w/2,y:s.y+s.h});}
 }else if(s.state==='down'){
  if(s.t>=(s.d.down||SK.down)){s.state='blink';s.t=0;Core.emit(g,'sorc-blink',{x:s.x+s.w/2,y:s.y+s.h/2});}
 }
}
/* A turned orb flies back exactly along its own line when nothing is held (as the Marksman's arrows do). */
function after(g){
 const s=g.sorc;if(!s||!g.bolts)return;
 const Core=C(),p=g.p,a=p.parryAim;
 for(const b of g.bolts){
  if(!b.marked||!b.friendly||b.turned||b.from!=='sorc')continue;
  b.turned=true;
  if(!(a&&(a.x||a.y))){const k=Math.hypot(b.vx,b.vy)/(Math.hypot(b.ovx,b.ovy)||1);b.vx=-b.ovx*k;b.vy=-b.ovy*k;}
 }
 if(g.icicles&&g.icicles.length&&p.state!=='dead'&&p.state!=='respawn'){
  // The blade shatters an icicle or a stake; a falling icicle kills.
  if(p.strikeTimer>0){const sb=Core.strikeBox(p);for(const c of g.icicles)if(c.state!=='form'&&overlap(...sb,c.x,c.y,c.w,c.h)){c.state='gone';if(c.ent){c.ent.gone=true;c.ent.solid=false;}Core.emit(g,'icicle-break',{x:c.x+3,y:c.y+c.h/2,cut:true});}
   g.icicles=g.icicles.filter(c=>c.state!=='gone');g.ents=g.ents.filter(e=>!(e.type==='iceStake'&&e.gone));}
  for(const c of g.icicles)if(c.state==='fall'&&overlap(p.x,p.y,p.w,p.h,c.x+1,c.y,c.w-2,c.h)){Core.kill(g,p,'icicle');return;}
 }
 if(s.gone||s.kneel||!g.awake||p.state==='dead'||p.state==='respawn')return;
 // A turned orb that reaches him breaks on the ward (or, warded or not, is spent on him).
 for(const b of g.bolts){
  if(!b.alive||!b.friendly||!overlap(b.x,b.y,b.w,b.h,s.x,s.y,s.w,s.h))continue;
  b.alive=false;Core.emit(g,'guard-block',{x:b.x+3,y:b.y+3,sorc:true});
 }
 g.bolts=g.bolts.filter(b=>b.alive);
 // The blade.
 if(p.strikeTimer>0&&!p.strikeHit.has('sorc')&&(s.state==='watch'||s.state==='tell'||open(s))){
  const sb=Core.strikeBox(p),d=p.strikeDir;
  if(overlap(...sb,s.x-1,s.y-1,s.w+2,s.h+2)){
   p.strikeHit.add('sorc');
   if(open(s)){
    // A wound gives the dash back; a side cut only pops the knight up (a pod's side throw would skid him off
    // across the ice), a down cut is a pogo.
    if(d.y!==0)Core.bladeRebound(g,p,d);else{p.vy=Math.min(p.vy,-90);Core.refillDash(g,p);}g.freeze=6;s.hits++;
    Core.emit(g,'sorc-hit',{x:s.x+s.w/2,y:s.y+s.h/2,hits:s.hits,need:s.need});
    if(s.hits>=s.need){
     if((s.d.leave||'right')==='kneel'){s.kneel=true;s.state='kneel';s.t=0;const pool=myPool(g,s);if(pool)pool.frozen=1e9;gone(g,s,true);}
     else{s.state='leave';s.t=0;}
    }else{s.i=(s.i+1)%s.posts.length;s.state='blink';s.t=0;Core.emit(g,'sorc-blink',{x:s.x+s.w/2,y:s.y+s.h/2});}
   }else{
    // The ward: the blade glances off.
    if(d.y>0){Core.bladeRebound(g,p,d);}
    else{p.vx=(p.x+4<s.x+s.w/2?-1:1)*SK.glance;p.vy=Math.min(p.vy,-80);if(p.state==='climb')p.state='normal';}
    g.freeze=2;Core.emit(g,'guard-block',{x:s.x+s.w/2,y:s.y+s.h/2,sorc:true});
   }
  }
 }
}
function gone(g,s,kneel){
 if(!kneel){s.gone=true;s.state='gone';}
 C().emit(g,'sorc-gone',{x:s.x+s.w/2,y:s.y+s.h/2,how:kneel?'kneel':s.d.leave||'right'});
}
function gateHold(g){const s=g.sorc;return !!(s&&!s.gone&&!s.kneel);}

(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rbr-sorcerer',input,reset,before,after,gateHold});
root.BladefallRbrSorcerer=Object.freeze({SK,warded,open});
})(typeof window!=='undefined'?window:globalThis);
