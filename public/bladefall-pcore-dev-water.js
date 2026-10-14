/* Precision Core — water (7.254): the White Court's freezing pools (Part IX, levels 91–98) and the Landing
   Shores' tide (Part XVII, levels 160–169).

   Water (glyph w) is open space you swim in. Under water you sink slowly and move at a crawl; a jump is a
   stroke (a full jump's rise, as often as you like), and a dash still works. The lantern floats up to
   the surface. Currents (room def `currents:[{c,r,w,h,dx,dy}]`, px/s) carry the knight and the lantern
   while they are in the water there.
   Freezing: strike water, or strike a condenser (glyph n), and the whole connected pool freezes into ice
   (solid, slippery, as in Frostfell). It thaws after `thaw` frames (room def, default 240); ticks along
   the ice count down. Ice will not form inside the knight or the lantern: those cells wait until they
   leave. A condenser freezes every pool in the room; a strike freezes the pool it touches.
   The tide (room def `tide:{c0,c1,low,high,hold,move}`, rows and frames): the sea between columns c0..c1
   rises from row `low` to row `high` and falls back, holding `hold` frames at each end and taking `move`
   frames to turn (7.308: holdLow/holdHigh, if given, hold the low and high water for different times). Its clock
   starts with the room's first input. Floats (glyph F) rest where they are
   drawn and ride the surface up when the sea is above them. Thorns under the surface are drowned:
   harmless until the sea leaves them. */
(function(root){
'use strict';
const C=()=>root.BladefallPrecisionCore;
const TILE=8,DT=1/60;
const WK=Object.freeze({sink:30,sinkDown:90,rise:-45,drag:1500,maxX:70,thaw:240,float:-40});
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;

function reset(g){
 const def=g.room.def,room=g.room,Core=C(),COLS=room.cols,ROWS=room.rows;
 g.water=null;
 const cells=new Uint8Array(COLS*ROWS);let any=false;
 def.map.forEach((row,r)=>{for(let c=0;c<COLS;c++)if(row[c]==='w'){cells[r*COLS+c]=1;any=true;}});
 const tide=def.tide?{...def.tide,clock:0}:null;
 if(!any&&!tide&&!def.map.some(r=>r.includes('n')))return;
 // Undo any ice a previous attempt left behind.
 room.ice=room.ice||new Uint8Array(COLS*ROWS);
 for(let i=0;i<cells.length;i++)if(cells[i]){room.grid[i]=Core.EMPTY;room.ice[i]=0;}
 // Pools: 4-connected bodies of water cells.
 const body=new Int16Array(COLS*ROWS).fill(-1),pools=[];
 for(let i=0;i<cells.length;i++){
  if(!cells[i]||body[i]>=0)continue;
  const id=pools.length,list=[],stack=[i];body[i]=id;
  while(stack.length){const k=stack.pop();list.push(k);const c=k%COLS,r=(k/COLS)|0;
   for(const [dc,dr]of [[1,0],[-1,0],[0,1],[0,-1]]){const cc=c+dc,rr=r+dr;if(cc<0||cc>=COLS||rr<0||rr>=ROWS)continue;const j=rr*COLS+cc;if(cells[j]&&body[j]<0){body[j]=id;stack.push(j);}}}
  pools.push({id,cells:list,frozen:0,pending:new Set()});
 }
 g.water={cells,body,pools,tide,thaw:def.thaw||WK.thaw,
  currents:(def.currents||[]).map(z=>({x:z.c*TILE,y:z.r*TILE,w:z.w*TILE,h:z.h*TILE,dx:z.dx||0,dy:z.dy||0}))};
 def.map.forEach((row,r)=>{for(let c=0;c<COLS;c++)if(row[c]==='n')g.ents.push({type:'condenser',dev:true,x:c*TILE,y:r*TILE,w:8,h:8,timer:0,id:'cd'+g.ents.length});});
 if(tide){
  for(const b of Core.groupsOf(def,'F'))g.ents.push({type:'float',dev:true,solid:true,x:b.x,y:b.y,w:b.w,h:b.h,homeY:b.y,remX:0,remY:0,id:'fl'+g.ents.length});
  g.spikeSafe=(c,r)=>c>=tide.c0&&c<=tide.c1&&r*TILE>=surfaceY(g);
 }
}
/* The tide's surface in pixels (lower y = higher sea). */
function surfaceY(g){
 const t=g.water.tide;if(!t)return Infinity;
 // (7.308, opt-in) holdLow/holdHigh hold the two ends for different times; without them both use `hold`.
 const lo=t.holdLow??t.hold,hi=t.holdHigh??t.hold;
 const lowY=t.low*TILE,highY=t.high*TILE,cyc=lo+hi+2*t.move,k=t.clock%cyc;
 let f;if(k<lo)f=0;else if(k<lo+t.move)f=(k-lo)/t.move;else if(k<lo+t.move+hi)f=1;else f=1-(k-lo-t.move-hi)/t.move;
 return Math.round(lowY+(highY-lowY)*f);
}
function inWater(g,x,y){
 const w=g.water,COLS=g.room.cols,ROWS=g.room.rows;if(!w)return false;
 const c=Math.floor(x/TILE),r=Math.floor(y/TILE);if(c<0||c>=COLS||r<0||r>=ROWS)return false;
 const i=r*COLS+c;
 if(w.cells[i]&&g.room.grid[i]!==C().SOLID)return true;
 const t=w.tide;if(t&&c>=t.c0&&c<=t.c1&&y>=surfaceY(g)&&g.room.grid[i]!==C().SOLID)return true;
 return false;
}
function currentAt(g,x,y,w,h){let dx=0,dy=0;for(const z of g.water.currents)if(overlap(x,y,w,h,z.x,z.y,z.w,z.h)){dx+=z.dx;dy+=z.dy;}return [dx,dy];}

const playerOccupies=(g,x,y)=>(g.players||[g.p]).some(p=>p.state!=='dead'&&overlap(p.x,p.y,p.w,p.h,x,y,8,8));
function freeze(g,pool){
 const Core=C(),room=g.room,p=g.p,COLS=room.cols;
 pool.frozen=g.water.thaw;pool.pending.clear();
 for(const i of pool.cells){
  const c=i%COLS,r=(i/COLS)|0,x=c*TILE,y=r*TILE;
  const busy=playerOccupies(g,x,y)||g.ents.some(e=>e.type==='lantern'&&!e.held&&overlap(e.x,e.y,e.w,e.h,x,y,8,8));
  if(busy){pool.pending.add(i);continue;}
  room.grid[i]=Core.SOLID;room.ice[i]=1;
 }
 const k=pool.cells[0];Core.emit(g,'freeze',{x:(k%COLS)*TILE+4,y:((k/COLS)|0)*TILE+4,pool:pool.id});
}
function thaw(g,pool){
 const Core=C(),room=g.room,COLS=room.cols;
 for(const i of pool.cells){room.grid[i]=Core.EMPTY;room.ice[i]=0;}
 pool.pending.clear();pool.frozen=0;
 const k=pool.cells[0];Core.emit(g,'thaw',{x:(k%COLS)*TILE+4,y:((k/COLS)|0)*TILE+4,pool:pool.id});
}

function before(g,inp){
 const w=g.water;if(!w)return;
 const Core=C(),p=g.p,room=g.room,COLS=room.cols;
 if(w.tide&&g.awake){
  const before=surfaceY(g);w.tide.clock++;const now=surfaceY(g);
  for(const e of g.ents){if(e.type!=='float')continue;const want=Math.min(e.homeY,now-e.h);if(want!==e.y)Core.moveSolid(g,e,0,want-e.y-e.remY);}
  if(before!==now)g.tideMoved=true;
 }
 // Frozen pools: count down; cells waiting on the knight or the lantern freeze once they are clear.
 for(const pool of w.pools){
  if(!pool.frozen)continue;
  for(const i of [...pool.pending]){const x=(i%COLS)*TILE,y=((i/COLS)|0)*TILE;
   const busy=playerOccupies(g,x,y)||g.ents.some(e=>e.type==='lantern'&&!e.held&&overlap(e.x,e.y,e.w,e.h,x,y,8,8));
   if(!busy){pool.pending.delete(i);room.grid[i]=Core.SOLID;room.ice[i]=1;}}
  if(--pool.frozen<=0)thaw(g,pool);
 }
 for(const e of g.ents)if(e.type==='condenser'&&e.timer>0)e.timer--;
}
function forces(g,p,inp){
 const w=g.water;if(!w)return;
 const wet=inWater(g,p.x+4,p.y+6);
 // One splash per entry: bobbing at the surface crosses it every few frames, so a splash waits 20 frames.
 if(p.splashT>0)p.splashT--;
 if(wet&&!p.wasWet&&!(p.splashT>0)){C().emit(g,'splash',{x:p.x+4,y:p.y+6});p.splashT=20;}
 p.wasWet=wet;p.swimming=wet;
 if(!wet||p.state==='climb'||p.state==='dash')return;
 // Water: a slow sink, a crawl sideways, and strokes (the jump) that rise as far as a jump on land.
 if(!(p.varJump>0)){const target=inp.my<0?WK.rise:inp.my>0?WK.sinkDown:WK.sink;p.vy=approachN(p.vy,target,WK.drag*DT);}
 if(Math.abs(p.vx)>WK.maxX)p.vx=approachN(p.vx,Math.sign(p.vx)*WK.maxX,WK.drag*DT);
 p.fling=p.coast=false;
 const [dx,dy]=currentAt(g,p.x,p.y,p.w,p.h);
 if(dx)p.pushX=(p.pushX||0)+dx*DT;
 if(dy){p.curRemY=(p.curRemY||0)+dy*DT;const n=Math.round(p.curRemY);if(n){p.curRemY-=n;C().moveY(g,p,n);}}
}
const approachN=(v,t,d)=>v>t?Math.max(v-d,t):Math.min(v+d,t);
function airJump(g,p,inp){
 if(g.water&&p.swimming&&!p.carrying){C().jump(g,p,inp);C().emit(g,'stroke',{x:p.x+4,y:p.y+6});return true;}
}
function after(g,inp){
 const w=g.water;if(!w)return;
 const Core=C(),p=g.p,COLS=g.room.cols,ROWS=g.room.rows;
 // The lantern floats and drifts with the current.
 for(const e of g.ents){
  if(e.type!=='lantern'||e.held||e.returning)continue;
  if(inWater(g,e.x+4,e.y+4)){e.vy=approachN(e.vy,WK.float,WK.drag*DT);e.vx=approachN(e.vx,0,200*DT);
   const [dx,dy]=currentAt(g,e.x,e.y,e.w,e.h);if(dy)Core.moveY(g,e,dy*DT);if(dx)Core.moveX(g,e,dx*DT);}   // down first: a current that presses the lantern under a lip then carries it through
  else if(inWater(g,e.x+4,e.y+9)&&e.vy>0){e.vy=0;}   // resting on the surface
 }
 afterPlayer(g,inp);
}
function afterPlayer(g,inp){
 const w=g.water;if(!w)return;
 const Core=C(),p=g.p,COLS=g.room.cols,ROWS=g.room.rows;
 // The blade freezes: a strike into water freezes that pool; a strike on a condenser freezes them all.
 if(p.strikeTimer>0&&!p.strikeHit.has('water')){
  const [sx,sy,sw,sh]=Core.strikeBox(p);
  for(const e of g.ents){if(e.type==='condenser'&&e.timer===0&&overlap(sx,sy,sw,sh,e.x-2,e.y-2,e.w+4,e.h+4)){
   p.strikeHit.add('water');e.timer=20;for(const pool of w.pools)freeze(g,pool);Core.emit(g,'condenser',{x:e.x+4,y:e.y+4});g.freeze=2;return;}}
  const hit=new Set();
  for(let y=sy;y<sy+sh;y+=4)for(let x=sx;x<sx+sw;x+=4){const c=Math.floor(x/TILE),r=Math.floor(y/TILE);if(c<0||c>=COLS||r<0||r>=ROWS)continue;const i=r*COLS+c;if(w.cells[i]&&!w.pools[w.body[i]].frozen)hit.add(w.body[i]);}
  if(hit.size){p.strikeHit.add('water');for(const id of hit)freeze(g,w.pools[id]);g.freeze=2;}
 }
}
(root.BladefallPrecisionDevices=root.BladefallPrecisionDevices||[]).push({name:'water',reset,before,forces,airJump,after,afterPlayer});
root.BladefallPrecisionWater=Object.freeze({WK,inWater,surfaceY,freeze,thaw});
})(typeof window!=='undefined'?window:globalThis);
