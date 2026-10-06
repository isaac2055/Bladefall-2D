// Part XV · The Deep Line (levels 140–149, 7.254): routes and the wrong answers that fail.
//   node scripts/verify-precision-part-140.mjs          → everything
//   node scripts/verify-precision-part-140.mjs p142     → one room's wrong strategies
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT} from './pcore-search.mjs';
const K=kit('XV');
const only=process.argv[2];
const want=id=>!only||only===id;
const t0=Date.now();
if(!only)K.routes();
console.log('Part XV: tempting wrong strategies fail');
const carts=g=>g.ents.filter(e=>e.type==='cart');
// A state key that sees the carts' speed, lit stones, a held lantern and fallen track.
const cartKey=g=>{const p=g.p;return [p.x>>1,p.y>>1,Math.round(p.vx/30),Math.round(p.vy/30),p.state,p.dashes,p.onGround?1:0,g.phase,p.carrying?1:0,
 g.ents.map(e=>e.type==='cart'?`${e.x>>1},${e.y>>1},${Math.round(e.vx/20)},${Math.round(e.vy/40)}`:(e.x|0)+','+(e.y|0)+(e.solid?'s':'')+(e.open?'o':'')+(e.lit?'l':'')+(e.held?'h':'')+(e.timer>0?'t':'')+(e.broken?'b':'')+(e.shaking?'k':'')).join(';'),
 (g.foes||[]).map(f=>f.alive?1:0).join('')].join('|');};
const toExit=(x,y)=>g=>Math.hypot(g.p.x-x,g.p.y-y);
const ev=type=>(g,e)=>e.some(q=>q.type===type);
const clean=r=>r.exited;                 // with a pred, the kit counts only runs with no deaths
const shots=['l','r','u','lu','ru'].map(d=>[[1,d+'q'],[1,'']]);
const seated=g=>!!g.p.seat;
// "Let go at the post": only runs whose cart never hops count (a tape that happens to lean at the post is the answer).
const noHop=r=>!r.events.some(q=>q.type==='switch-high');
const onFoot=(id,x,y,o={})=>K.hunt('on foot, with every movement trick (never riding)',id,{actions:[...ACT.basic,...(o.climb?ACT.grabs:[])],reject:seated,key:cartKey,score:toExit(x,y),beam:o.beam||250,maxDepth:o.depth||50});

// 140 Thorn Line: only the cart crosses the thorns. A run that dies respawns in the cart, and a dash that ends on the cart
// seats you again, so only a clean run that leaves the room on foot would count.
if(want('p140')){
 onFoot('p140',318,141);
 K.never('Thorn Line: jump out of the cart and cross on foot','p140',
  X(['r','l',''],[4,8,14],range(0,30,6),['r','ru','rd','u'],[0,6,14]).map(([d,j,w,x,j2])=>[[j,d+'j'],[w,'r'],[5,x+'x'],[j2,'rj'],[200,'r']]),r=>r.exited&&!r.g.p.seat);
}
// 141 Buffer Stop: the cart's speed, kept in the air (the ledge sits past anything a standing start reaches).
if(want('p141')){
 onFoot('p141',318,95);
 K.never('Buffer Stop: ride to the buffer, then jump and dash from the stopped cart','p141',
  X([70,90],[4,8,12,14],range(0,20,2),['rx','rux']).map(([w,j,d,x])=>[[w,'r'],[20,''],[j,'rj'],[d,'r'],[5,x],[150,'r']]));
 K.never('Buffer Stop: lean a little (under 90 px/s), coast, then jump out and dash','p141',X([10,15,20],range(0,100,10),range(14,38,4),['rx','rux']).map(([L,C,D,x])=>[[L,'r'],[C,''],[14,'rj'],[D-14,'r'],[5,x],[150,'r']]));
 K.hunt('Buffer Stop: from a stopped cart, with every movement trick','p141',{actions:ACT.climb,start:[[70,'r'],[20,'']],key:cartKey,score:toExit(318,95),reject:g=>carts(g).some(e=>e.vx!==0),beam:200,maxDepth:45});
}
// 142 Back Up: a lean alone is too slow for the falling bridge; only the strip behind you throws the cart fast enough.
if(want('p142')){
 K.never('Back Up: lean east from the start, at any pace','p142',X(range(0,40,4),range(10,120,10),['r','']).map(([w,L,c])=>[[w,''],[L,'r'],[200,c]]),clean);
 K.never('Back Up: back up short of the strip, then lean east','p142',X(range(4,40,3),range(0,20,5)).map(([a,w])=>[[a,'l'],[w,''],[200,'r']]),r=>r.exited&&!r.events.some(e=>e.type==='boost'));
 K.never('Back Up: jump out over the falling bridge','p142',X(range(20,80,6),[8,14],['rx','rux']).map(([L,j,x])=>[[L,'r'],[j,'rj'],[5,x],[150,'r']]),clean);
 K.hunt('Back Up: no way over without the strip','p142',{actions:ACT.basic,reject:ev('boost'),key:cartKey,score:toExit(318,80),beam:200,maxDepth:40});
}
// 143 High Line: the cart goes up only if you lean the way it rolls at the post.
if(want('p143')){
 K.never('High Line: let go as the cart passes the post, then lean on','p143',X(range(10,46,3),range(8,50,6)).map(([L,G])=>[[L,'r'],[G,''],[200,'r']]),r=>r.exited&&noHop(r));
 K.hunt('High Line: no way out without the switch','p143',{actions:ACT.basic,reject:ev('switch-high'),key:cartKey,score:toExit(318,100),beam:200,maxDepth:40});
}
// 144 The Cut Fork: the first high line dead-ends at a thorned pillar; let go at the first post, lean at the second.
if(want('p144')){
 K.never('The Cut Fork: lean through the first post','p144',X(range(34,80,4),range(0,40,8)).map(([L,G])=>[[L,'r'],[G,''],[300,'r']]),clean);
 K.never('The Cut Fork: let go at both posts','p144',X(range(10,30,4),range(0,40,10)).map(([L,w])=>[[L,'r'],[300,'']]),clean);
 K.hunt('The Cut Fork: no way out without the second post','p144',{actions:ACT.basic,reject:(g,e)=>e.some(q=>q.type==='switch-high'&&q.x>180),key:cartKey,score:toExit(318,100),beam:200,maxDepth:40});
}
// 145 Westbound: the ledge is out of reach of one dash from the cart; the green glass gives the second.
if(want('p145')){
 K.never('Westbound: one dash only, any direction and timing','p145',X(range(40,64,4),[8,14],range(0,30,3),['lx','lux','ux']).map(([J,j,D,x])=>[[J,'l'],[j,'lj'],[D,'l'],[5,x],[80,'l']]),clean);
 K.hunt('Westbound: no way up without the glass','p145',{actions:ACT.climb,reject:ev('refill'),key:cartKey,score:toExit(0,60),beam:200,maxDepth:50});
}
// 146 Tally Line: the high stone is above any jump and dash from the line; the switch's hop puts you under it.
if(want('p146')){
 const lit=r=>r.g.ents.some(e=>e.type==='stone'&&e.y<60&&e.lit);
 K.never('Tally Line: let go at the post, then jump and dash for the high stone','p146',
  X(range(20,40,5),range(4,40,6),[8,14],range(0,16,4),['ux','lux','rux']).map(([a,b,j,D,x])=>[[a,'l'],[b,''],[j,'lj'],[D,'l'],[5,x],[60,'l']]),r=>lit(r)&&noHop(r));
 K.hunt('Tally Line: no way out without the switch','p146',{actions:[...ACT.basic,...ACT.strikes],reject:ev('switch-high'),key:cartKey,
  score:g=>(g.ents.some(e=>e.type==='stone'&&e.y<60&&!e.lit)?Math.hypot(g.p.x-152,g.p.y-48)+400:Math.hypot(g.p.x,g.p.y-140)),beam:200,maxDepth:45});
}
// 147 Bell Line: a dash flips the colours but leaves the cart; ring both bells from the seat, in time.
if(want('p147')){
 K.never('Bell Line: ring one bell, or none','p147',[...range(10,40,2).map(a=>[[a,'l'],[1,'lus'],[200,'l']]),...range(30,80,2).map(a=>[[a,'l'],[1,'lus'],[200,'l']]),[[300,'l']]],clean);
 K.never('Bell Line: jump out and dash to flip them','p147',X(range(10,60,5),[8,14],['lx','lux','ux','dx']).map(([a,j,x])=>[[a,'l'],[j,'lj'],[5,x],[200,'l']]),clean);
 K.hunt('Bell Line: no way out without a bell','p147',{actions:[...ACT.basic,...ACT.strikes],reject:ev('bell'),key:cartKey,score:toExit(0,90),beam:200,maxDepth:40});
}
// 148 Speedy Line: only the strip's throw carries you up the thorned shaft; a lean's speed falls short.
if(want('p148')){
 K.never('Speedy Line: jump out before the strip, then shoot and dash','p148',X(range(10,40,5),range(0,20,4),range(0,24,4),['ux','lux']).map(([J,Q,D,x])=>[[J,'l'],[14,'lj'],[Q,'l'],[1,'lq'],[D,'l'],[5,x],[80,'l']]),clean);
 K.hunt('Speedy Line: no way up without the strip','p148',{actions:[...ACT.basic,...shots],reject:ev('boost'),key:cartKey,score:toExit(0,80),beam:200,maxDepth:45});
}
// 149 The Last Line. Lamp Car: too wide for any leap from the cart; only the lantern's glide carries.
if(want('p149a')){
 K.never('Lamp Car: jump out at full speed and dash, without the lantern','p149a',X(range(10,34,3),[8,14],range(0,24,4),['lx','lux']).map(([a,j,d,x])=>[[a,'l'],[j,'lj'],[d,'l'],[5,x],[100,'l']]),clean);
 K.hunt('Lamp Car: no way across without the lantern','p149a',{actions:ACT.climb,reject:ev('pickup'),key:cartKey,score:toExit(0,100),beam:200,maxDepth:45});
}
// Moth Line: a thrown leap and a dash fall short of the ledge; each moth's pogo lifts you and gives the dash back.
if(want('p149b')){
 K.never('Moth Line: thrown leap and one dash, no moth','p149b',X(range(24,34,2),[8,14],range(0,30,3),['lx','lux','ux']).map(([a,j,d,x])=>[[a,'l'],[j,'lj'],[d,'l'],[5,x],[100,'l']]),clean);
 K.hunt('Moth Line: no way up with one moth or none','p149b',{actions:ACT.blade,goal:g=>g.exited&&g.foes.filter(f=>!f.alive).length<2,key:cartKey,score:toExit(0,10),beam:200,maxDepth:45});
}
// The Boat: the switch's throw gives the height (jump at its top), the pod gives the second dash for the distance.
if(want('p149c')){
 K.never('The Boat: let the cart pass the post low, then jump and dash','p149c',
  X(range(8,24,4),range(0,40,5),[8,14],range(0,20,4),['lx','lux']).map(([a,g,j,d,x])=>[[a,'l'],[g,''],[j,'lj'],[d,'l'],[5,x],[100,'l']]),r=>r.exited&&noHop(r));
 K.never('The Boat: the throw, then two dashes, never cutting the pod','p149c',
  X([28,30,32,34],range(10,30,3),range(10,30,4),['lx','lux']).map(([a,b,c,x])=>[[a,'l'],[14,'lj'],[b,'l'],[5,'lx'],[c,'l'],[5,x],[80,'l']]),clean);
 K.hunt('The Boat: no way to the quay without the pod','p149c',{actions:ACT.climb,reject:ev('pod'),key:cartKey,score:toExit(0,60),beam:200,maxDepth:45});
 K.hunt('The Boat: no way to the quay without the switch','p149c',{actions:ACT.blade,reject:ev('switch-high'),key:cartKey,score:toExit(0,60),beam:200,maxDepth:45});
}
console.log(`(${((Date.now()-t0)/1000).toFixed(0)} s)`);
K.done();
