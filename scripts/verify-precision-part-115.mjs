// Part XII · Inversion (levels 115–122, 7.254): routes and the wrong answers that fail.
// Tapes are written in screen terms: while gravity is turned over, u and d still mean up and down on screen.
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT} from './pcore-search.mjs';
const K=kit('XII');
const only=process.argv[2];                      // optional: check one room, e.g. p117
const room=id=>!only||only===id;
K.routes();
console.log('Part XII: tempting wrong strategies fail');
// Momentum (supers, hypers) is never required before 150, but it must not skip a room's question either.
const MOM=[[[4,'rx'],[10,'rj']],[[4,'lx'],[10,'lj']],[[4,'rdx'],[10,'rj']],[[4,'ldx'],[10,'lj']]];
const ALL=[...ACT.basic,...ACT.grabs,...MOM];
const flipped=(g,ev)=>g.flipped||ev.some(e=>e.type==='gravity');
const screenY=g=>g.flipped?184-g.p.y-g.p.h:g.p.y;
const toExit=(x,y)=>g=>Math.hypot(g.p.x-x,screenY(g)-y);
// Beam width for the adversarial searches: wide enough to find the skips the morning draft had, small enough
// to keep the part near three minutes.
const BEAM=250;
// Count events of a type along a searched path (the count rides on the game state, which the search copies).
const tally=(type,key)=>(g,ev)=>(g[key]=(g[key]||0)+ev.filter(e=>e.type===type).length);

if(room('p115')){
 // 115 The Other Floor: the thorns are far too wide to cross on the floor.
 K.never('The Other Floor: run, jump and dash over the thorns','p115',
  X(range(20,60,4),[0,4,8,14],['rx','rux','rdx']).map(([w,j,d])=>[[w,'r'],...(j?[[j,'rj']]:[]),[5,d],[120,'r']]));
 K.hunt('The Other Floor: no way over without turning the room over','p115',{actions:ALL,reject:flipped,score:g=>-g.p.x,beam:BEAM,maxDepth:60});
}
if(room('p116')){
 // 116 Falling Up: the flip spends the dash; without the glass there is none to turn back with.
 // The glass sits on the natural line, so these tapes steer round it; a pass counts only if it never refilled there.
 K.never('Falling Up: flip, then reach for the prism back without the glass','p116',
  X([4,8,12],range(0,40,4),['','l','r'],['rx','rux','ux']).map(([j,w,m,d])=>[[30,'r'],[j,'rj'],[5,'rux'],[w,m],[5,d],[120,'r']]),
  r=>r.exited&&!r.events.some(e=>e.type==='refill'));
 K.hunt('Falling Up: never touch the glass','p116',{actions:ALL,reject:(g,ev)=>ev.some(e=>e.type==='refill'),score:toExit(320,150),beam:BEAM,maxDepth:60});
 K.hunt('Falling Up: across without a flip','p116',{actions:ALL,reject:flipped,score:g=>-g.p.x,beam:BEAM,maxDepth:60});
}
if(room('p117')){
 // 117 Pogo Up: flipped, a cut toward the screen's floor throws you into the thorn roof.
 const pods=g=>g.ents.filter(e=>e.type==='pod');
 K.never('Pogo Up: cut down (on screen) at the pods','p117',
  X(range(14,40,2),['ds','rds']).map(([w,s])=>[[30,'r'],[10,'rj'],[5,'rux'],[w,'r'],[1,s],[20,'r'],[5,'rx'],[40,'r'],[1,s],[80,'r']]));
 K.hunt('Pogo Up: never cut the second pod','p117',{actions:[...ALL,...ACT.strikes],start:[[30,'r'],[10,'rj'],[5,'rux']],reject:g=>pods(g)[1].timer>0,score:toExit(320,140),beam:BEAM,maxDepth:60});
 K.hunt('Pogo Up: across without a flip','p117',{actions:[...ALL,...ACT.strikes],reject:flipped,score:g=>-g.p.x,beam:BEAM,maxDepth:60});
}
if(room('p119')){
 // 119 The Light Falls: the plate is sealed at the bottom of a shaft that opens toward the roof.
 const open=r=>r.g.ents.some(e=>e.type==='held'&&!e.solid)||r.exited;
 K.never('The Light Falls: throw the lantern at the shaft from the floor','p119',
  X(range(0,40,4),['','r'],['rg','g','ug'],[0,20,60]).map(([w,m,t,k])=>[[w,'r'],[1,'rg'],[4,m],[1,t],[k,''],[4,'r'],[5,'rx'],[100,'']]),open);
 K.never('The Light Falls: set it down and turn the room over twice','p119',
  X(range(0,60,6),range(40,130,10)).map(([w,k])=>[[16,'r'],[5,'rx'],[60,''],[w,'r'],[k,'r'],[20,'r'],[5,'rx'],[150,'r']]),open);
 K.hunt('The Light Falls: never pick the lantern up','p119',{actions:ALL,reject:(g,ev)=>ev.some(e=>e.type==='pickup'),score:toExit(320,150),beam:BEAM,maxDepth:70});
 K.hunt('The Light Falls: out without a flip','p119',{actions:[...ALL,[[1,'rg']],[[1,'g']],[[1,'dg']]],reject:flipped,score:toExit(320,150),beam:BEAM,maxDepth:70});
}
if(room('p118')){
 // 118 Plumb Up: the pit is in the roof, and only the stone can floor it.
 K.never('Plumb Up: leave the stone where it hangs and jump the pit','p118',
  X(range(0,40,4),[0,4,8,12],['rx','rdx','rux']).map(([w,j,d])=>[[4,''],[5,'rx'],[60,''],[20,'r'],[w,'r'],...(j?[[j,'rj']]:[]),[5,d],[160,'r']]),
  r=>r.exited&&!r.events.some(e=>e.type==='stone-hit'));
 K.hunt('Plumb Up: never move the stone','p118',{actions:ALL,reject:(g,ev)=>ev.some(e=>e.type==='stone-hit'),score:toExit(320,30),beam:BEAM,maxDepth:70});
 K.hunt('Plumb Up: out without a flip','p118',{actions:ALL,reject:flipped,score:toExit(320,30),beam:BEAM,maxDepth:70});
}
if(room('p120')){
 // 120 The Long Fall: the orange end throws you only as hard as you fell into the roof.
 K.never('The Long Fall: dash or jump up into a roof portal, right way up','p120',
  X(range(0,24,3),['ux','rux','j'],[0,6,12]).map(([w,d,k])=>[[w,'r'],[1,'uq'],[1,''],[k,''],[5,d],[20,'r'],[5,'rx'],[120,'r']]));
 K.never('The Long Fall: turn over, land on the roof, then step into the portal','p120',
  X(range(0,30,3),range(20,60,8)).map(([w,k])=>[[2,''],[5,'rx'],[60,''],[1,'uq'],[1,''],[w,'l'],[k,''],[120,'r']]));
 K.hunt('The Long Fall: across without the portal','p120',{actions:ALL,reject:(g,ev)=>ev.some(e=>e.type==='portal-pass'),score:toExit(320,8),beam:BEAM,maxDepth:70});
}
if(room('p121')){
 // 121 Count the Prism: the prism's dash turns the machinery like any other.
 K.never('Count the Prism: straight through the prism, no spare turn','p121',
  X(range(0,20,2),range(0,90,6),['','r','l']).map(([w,k,m])=>[[w,'r'],[5,'rx'],[k,m],[150,'']]),r=>r.g.flipped&&r.g.p.onGround);
 K.never('Count the Prism: flip back without the bell','p121',
  X(range(0,60,4),['','r','l']).map(([k,m])=>[[2,''],[5,'ux'],[50,''],[6,'r'],[5,'rx'],[60,'r'],[4,'rj'],[5,'rx'],[30,'r'],[4,'r'],[5,'rx'],[k,m],[150,'r']]));
 const onCyan=g=>g.flipped&&g.p.onGround&&g.p.x<168;
 K.hunt('Count the Prism: never stand on the cyan','p121',{actions:[...ALL,...ACT.strikes],reject:onCyan,score:toExit(320,140),beam:BEAM,maxDepth:70});
 K.hunt('Count the Prism: across without a flip','p121',{actions:[...ALL,...ACT.strikes],reject:flipped,score:toExit(320,140),beam:BEAM,maxDepth:70});
}
if(room('p122')){
 // 122 Inside Out: four turns, and each turn's dash comes from somewhere else: the roof, the glass, the pod.
 const toSecond=[[2,''],[5,'rx'],[35,''],[32,'r'],[5,'rdx']];
 K.never('Inside Out: upside down, cut the pod toward your head','p122',
  X(range(16,36,2),['ds','rds','s','rs']).map(([w,s])=>[...toSecond,[29,'r'],[5,'rx'],[w,'r'],[1,s],[4,'r'],[5,'rdx'],[80,'r']]));
 K.never('Inside Out: no cut at all, straight for the last prism','p122',
  X(range(0,40,2),['rx','rdx','rux']).map(([w,d])=>[...toSecond,[29,'r'],[5,'rx'],[w,'r'],[5,d],[80,'r']]));
 const flips=tally('gravity','_flips');
 K.hunt('Inside Out: never touch the glass','p122',{actions:[...ALL,...ACT.strikes],reject:(g,ev)=>ev.some(e=>e.type==='refill'),score:toExit(320,150),beam:BEAM,maxDepth:60});
 K.hunt('Inside Out: never cut the pod','p122',{actions:ALL,reject:(g,ev)=>ev.some(e=>e.type==='pod'),score:toExit(320,150),beam:BEAM,maxDepth:60});
 K.hunt('Inside Out: out with fewer than four turns','p122',{actions:[...ALL,...ACT.strikes],reject:(g,ev)=>flips(g,ev)>=4,score:toExit(320,150),beam:BEAM,maxDepth:60});
}
K.done();
