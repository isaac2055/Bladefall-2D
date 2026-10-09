/* Precision Core — the Deep Line (7.254, Part XV, levels 140–149): carts, boost strips and switches.

   Cart (glyph C, usually two tiles wide): a heavy tub on wheels. It falls, rolls, and stops against
   whatever is in its way. Dash into its side and it rolls off away from you (the dash is spent, as with a
   slide stone). Land in it and you ride seated: left and right no longer walk, they lean, and the cart
   gathers speed that way (to 150 px/s); let go and it coasts. Jump out and you keep the cart's speed.
   A cart is not ground: standing on one never gives your dash back, you cannot dash from it (jump out
   first), and a dash that lands on it ends there, seated. So a cart is never a launch pad for a super,
   a hyper or a wavedash; the only speed it lends is its own.
   Rail (glyph -): solid track. Boost strips (glyphs ( and )): track that throws a cart passing over it
   to 300 px/s the way the strip points. Brass switch (glyph k, on the track): a cart that passes it while
   you lean the way it rolls hops up to the high line (five rows up; the high line starts four tiles past
   the post); otherwise it rolls on underneath.
   Collapsing track (glyph ~, the core's crumbling stone): a cart rolling onto it sets it shaking, as the
   knight's feet do, and it falls 0.4 s later; a span is every touching ~, so a trestle post (a - between
   spans) splits a bridge into spans that fall one by one.
   Lean only works with the wheels on the track; in the air the cart keeps what it had.
   A cart lost off the bottom of the room comes back to where it started. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8,DT=1/60;
const CK=Object.freeze({lean:260,leanMax:150,coast:40,boost:300,hop:-310,gravity:900,maxFall:240,push:200,home:40});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
function reset(g){
 const def=g.room.def,Core=C(),room=g.room,COLS=room.cols,ROWS=room.rows;
 room.boost=room.boost||new Int8Array(COLS*ROWS);
 def.map.forEach((row,r)=>{for(let c=0;c<COLS;c++){const ch=row[c],i=r*COLS+c;
  if(ch==='-'||ch==='('||ch===')'){room.grid[i]=Core.SOLID;room.rail=room.rail||new Uint8Array(COLS*ROWS);room.rail[i]=1;if(ch!=='-')room.boost[i]=ch==='('?-1:1;}
  else if(ch==='k')g.ents.push({type:'switch',dev:true,x:c*TILE,y:r*TILE,w:8,h:8,id:'sw'+g.ents.length});
 }});
 for(const b of Core.groupsOf(def,'C'))g.ents.push({type:'cart',dev:true,solid:true,x:b.x,y:b.y,w:b.w,h:b.h,ox:b.x,oy:b.y,vx:0,vy:0,remX:0,remY:0,id:'ct'+g.ents.length,lost:0});
 g.p.seat=null;
}
function supported(g,e){return C().solidAt(g,e.x,e.y+1,e.w,e.h,e);}
function boostUnder(g,e){const COLS=g.room.cols,ROWS=g.room.rows,r=(e.y+e.h)/TILE;if(r!==Math.floor(r)||r>=ROWS)return 0;let d=0;for(let c=Math.floor(e.x/TILE);c<=Math.floor((e.x+e.w-1)/TILE);c++)d=g.room.boost[r*COLS+c]||d;return d;}
function seatedIn(g,e){const p=g.p;return p.state!=='dead'&&p.y+p.h===e.y&&p.x+4>=e.x&&p.x+4<e.x+e.w&&p.vy>=0;}
function before(g,inp){
 const Core=C(),p=g.p,H=g.room.h;
 for(const e of g.ents){
  if(e.type!=='cart')continue;
  if(e.lost>0){if(--e.lost===0){e.x=e.ox;e.y=e.oy;e.vx=e.vy=0;e.remX=e.remY=0;e.gone=false;e.solid=true;Core.emit(g,'cart-home',{x:e.x+e.w/2,y:e.y});}continue;}
  const seated=seatedIn(g,e)&&p.onGround;
  // A cart is not ground: feet on a cart do not bring the dash back (the core refills only while this is 0),
  // no dash starts from it, and a dash that lands on it ends, seated.
  if(p.state!=='dead'&&p.state!=='respawn'&&p.y+p.h===e.y&&p.x<e.x+e.w&&p.x+p.w>e.x){
   p.dashRefillCooldown=Math.max(p.dashRefillCooldown,2);g.buf.dash=0;
   if(p.state==='dash'&&!p.dashAim){p.state='normal';p.dashTimer=0;p.ducking=false;p.vx=0;p.vy=0;}
  }
  const onRail=supported(g,e);
  if(seated&&onRail){if(inp.mx){const t=CK.leanMax*inp.mx;if(Math.abs(e.vx)<CK.leanMax||Math.sign(e.vx)!==inp.mx)e.vx=approach(e.vx,t,CK.lean*DT);}}
  if(onRail){
   // Collapsing track under the wheels starts to shake.
   for(const s of g.ents)if(s.type==='crumble'&&!s.broken&&!s.shaking&&overlap(e.x,e.y+e.h,e.w,1,s.x,s.y,s.w,s.h)){s.shaking=Core.K.crumbleShakeFrames;Core.emit(g,'crumble-shake',{x:s.x+s.w/2,y:s.y});}
   const b=boostUnder(g,e);if(b){if(e.vx*b<CK.boost){e.vx=b*CK.boost;Core.emit(g,'boost',{x:e.x+e.w/2,y:e.y+e.h});}}
   else if(!(seated&&inp.mx))e.vx=approach(e.vx,0,CK.coast*DT);
   e.vy=0;
  }else e.vy=Math.min(CK.maxFall,e.vy+CK.gravity*DT);
  // Switch: lean the way you roll as the cart passes a brass switch, and it hops to the high line.
  for(const s of g.ents){if(s.type!=='switch')continue;
   if(onRail&&e.vx&&overlap(e.x,e.y,e.w,e.h+1,s.x,s.y,s.w,s.h)&&!e.hopped){
    if(seated&&inp.mx===Math.sign(e.vx)){e.vy=CK.hop;e.hopped=s.id;Core.emit(g,'switch-high',{x:s.x+4,y:s.y});}else if(e.passed!==s.id){e.passed=s.id;Core.emit(g,'switch-low',{x:s.x+4,y:s.y});}}}
  if(onRail&&e.vy>=0&&e.hopped&&!g.ents.some(s=>s.type==='switch'&&overlap(e.x,e.y,e.w,e.h+1,s.x,s.y,s.w,s.h)))e.hopped=null;
  // Move: sideways, stopping at the first solid (it shoves the knight, as any moving solid does); then fall or rise.
  e.remX+=e.vx*DT;let nx=Math.round(e.remX);e.remX-=nx;
  while(nx){const s=Math.sign(nx);if(Core.blockerAt(g,e.x+s,e.y,e.w,e.h,e)){if(Math.abs(e.vx)>60)Core.emit(g,'cart-bump',{x:s>0?e.x+e.w:e.x,y:e.y+e.h/2});e.vx=0;e.remX=0;break;}Core.moveSolid(g,e,s,0);nx-=s;}
  e.remY+=e.vy*DT;let ny=Math.round(e.remY);e.remY-=ny;
  while(ny){const s=Math.sign(ny);if(Core.blockerAt(g,e.x,e.y+s,e.w,e.h,e)){if(s>0&&e.vy>120)Core.emit(g,'cart-land',{x:e.x+e.w/2,y:e.y+e.h});e.vy=0;e.remY=0;break;}Core.moveSolid(g,e,0,s);ny-=s;}
  // A seated knight carries the cart's speed: jump out and keep it.
  if(seatedIn(g,e)&&p.onGround){p.liftX=e.vx;p.liftY=Math.min(0,e.vy);p.liftTimer=Core.K.liftGraceFrames;}
  if(e.y>H+8){e.lost=CK.home;e.gone=true;e.solid=false;Core.emit(g,'cart-lost',{x:e.x+e.w/2,y:H});}
 }
}
const approach=(v,t,d)=>v>t?Math.max(v-d,t):Math.min(v+d,t);
function forces(g,p,inp){
 // Seated: left and right lean the cart instead of walking; the knight rides at the cart's middle.
 const cart=g.ents.find(e=>e.type==='cart'&&!e.gone&&seatedIn(g,e));
 if(cart&&p.onGround&&p.state==='normal'&&p.vy>=0){p.vx=0;p.seat=cart;const want=Math.round(cart.x+cart.w/2-4);if(want!==p.x)C().moveX(g,p,Math.sign(want-p.x));}
 else{if(p.seat&&p.vy<0&&Math.abs(p.vx)>C().K.maxRun)p.coast=true;p.seat=null;}
}
/* A dash into a cart's side starts it rolling, the way a slide stone would. */
function dashHit(g,p,b,sx,sy){
 if(b.type!=='cart'||!sx)return;
 b.vx=sx*CK.push;p.state='normal';p.dashTimer=0;p.ducking=false;p.vx=-sx*120;p.vy=-120;p.varJumpSpeed=p.vy;p.varJump=9;p.autoJump=true;
 g.freeze=2;C().emit(g,'stone-hit',{x:b.x+b.w/2,y:b.y+b.h/2,dx:sx,dy:0});return true;
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'rail',reset,before,forces,dashHit});
root.BladefallPrecisionRail=Object.freeze({CK});
})(typeof window!=='undefined'?window:globalThis);
