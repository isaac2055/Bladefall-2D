// Bonus · Oren's Relay (R1–R6, 7.255): routes and the wrong answers that fail.
//   node scripts/verify-precision-part-901.mjs            (ONLY=br3,br6 runs a subset while authoring)
// Oren (bladefall-pcore-dev-relay.js) walks the knight's path a few steps behind; the portal key makes him
// hold, and holding he presses plates, is a one-way step and breaks hostile bolts. No dash in these rooms.
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT,gameAt,run} from './pcore-search.mjs';
const K=kit('BR');
const ONLY=process.env.ONLY?process.env.ONLY.split(','):null,on=id=>!ONLY||ONLY.includes(id);
console.log('Bonus · Oren’s Relay: tempting wrong strategies fail');
if(!ONLY)K.routes();

const Q=[[[1,'q']]];
const WALK=[...ACT.move,...ACT.jumps];               // no dash in these rooms
const CLIMB=[...WALK,...ACT.grabs];
const held=(g,ev)=>ev.some(e=>e.type==='oren-hold');
// A state key that also sees Oren (where he is, whether he holds), the lantern and the sentries' clock.
const key=g=>{const p=g.p,R=g.relay,l=g.ents.find(e=>e.type==='lantern');
 return [p.x>>1,p.y>>1,Math.round(p.vx/30),Math.round(p.vy/30),p.state,p.onGround?1:0,p.carrying?1:0,
  R?(R.e.x>>2)+','+(R.e.y>>2)+(R.held?'h':''):'',l?(l.x>>2)+','+(l.y>>2):'',
  g.foes?g.fclock%100>>2:'',g.bolts?g.bolts.map(b=>b.x>>4).join(';'):''].join('|');};
// Where Oren is matters only once he can be told to hold; hunts that never let him hold leave him out.
const still=g=>key({...g,relay:null});
const jumps=['', 'j','rj','lj'];

// R1 Hold the Door: the door shuts the moment nobody stands on the plate, and it is too far to reach in time.
if(on('br1')){
K.never('Hold the Door: run, hop or wait at the door without telling him to hold','br1',
 X(range(80,140,6),[0,10,30],jumps,[0,8,14]).map(([w,k,j,n])=>[[w,'r'],[k,''],...(j&&n?[[n,j]]:[]),[200,'r']]));
K.hunt('Hold the Door: no way through without Oren holding','br1',{actions:WALK,key:still,beam:100,maxDepth:35});
}

// R2 A Leg Up: the shelf is a step above the best jump; the wall under the exit is thorned, so no climb.
if(on('br2')){
K.never('A Leg Up: jump for the shelf from the floor','br2',
 X(range(140,240,4),[4,8,12,16,20],['rj','j','lj']).map(([w,n,j])=>[[w,'r'],[n,j],[60,'r'],[1,'rj'],[20,'rj'],[60,'r']]));
K.never('A Leg Up: climb or kick off the wall under the exit','br2',
 X(range(220,250,3),[8,14,20],['rgu','rg','gu'],[0,1]).map(([w,n,g,j])=>[[w,'r'],[n,'rj'],[30,g],...(j?[[1,'lj'],[12,'j'],[20,'rgu']]:[]),[60,'r']]));
K.hunt('A Leg Up: no way up without his shoulders','br2',{actions:CLIMB,reject:held,key:still,
 score:g=>Math.hypot(g.p.x-300,g.p.y-100),beam:120,maxDepth:35});
}

// R3 Under His Shield: the volleys come from behind, out of reach, faster than you run and too thick to cut
// or parry one by one. The dip at the start is the only cover.
if(on('br3')){
K.never('Under His Shield: wait for a gap, then run or hop the lane','br3',
 X(range(0,240,4),['walk','hop']).map(([w,k])=>[[w,''],[1,'rj'],[10,'rj'],...(k==='walk'?[[300,'r']]:Array(30).fill(0).flatMap(()=>[[1,'rj'],[11,'r']]))]));
K.never('Under His Shield: answer the volley with parries or cuts','br3',
 X(range(0,240,8),[6,8,10,12],['p','ls','rp']).map(([w,per,a])=>[[w,''],[1,'rj'],[10,'rj'],...Array(40).fill(0).flatMap(()=>[[1,a],[per-1,'r']]),[200,'r']]));
// Answers at a human rate: at most one parry or cut in any eight frames. (A tool-assisted chain of a parry or a
// cut every four or five frames can hold off a whole volley; see the design notes.)
const ANSWER=[['p',''],['p','r'],['p','rj'],['ls',''],['rs','r'],['ls','r']].map(([a,b])=>[[1,a],[7,b]]);
K.hunt('Under His Shield: no way down the lane without his shield (answers at a human rate)','br3',{actions:[...WALK,...ANSWER,[[12,'']],[[24,'']]],
 reject:held,key:still,beam:120,maxDepth:45});
}

// R4 Through After You: the plate is in a room only the portal reaches; the door is back on this side.
if(on('br4')){
const toPlate=[[40,'l'],[70,'r'],[10,'']];                        // through the portal; Oren is on the plate
K.never('Through After You: stand on the plate yourself, then race back through the portal','br4',
 X(range(0,40,4),[0,4,8],['l','lj']).map(([w,k,d])=>[[40,'l'],[38+w,'r'],[k,''],[30,d],[32,'l'],[250,'r']]));
K.never('Through After You: hold him on this side of the portal','br4',
 range(0,38,2).map(w=>[[w,'l'],[1,'lq'],[39-w,'l'],[70,'r'],[10,''],[62,'l'],[250,'r']]));
const onPlate=g=>g.ents.some(e=>e.type==='plate'&&g.relay.held&&g.relay.e.x<e.x+e.w&&g.relay.e.x+8>e.x);
K.never('Through After You: hold him anywhere in the sealed room but on the plate','br4',
 X(range(40,120,2),[0,1]).map(([t,j])=>[[40,'l'],[t-40,'r'],[1,'q'],...(j?[[1,'lj'],[10,'lj']]:[]),[t-30,'l'],[250,'r']]),r=>r.exited&&!onPlate(r.g));
K.hunt('Through After You: no way through the door without Oren holding','br4',{actions:WALK,key:still,beam:100,maxDepth:40});
}

// R5 Lantern or Oren: either keeps the plate down; only Oren can be stood on, and once you are through he
// cannot follow past a shut door.
if(on('br5')){
const lanternThrough=[[20,'r'],[1,'g'],[95,'r'],[10,''],[1,'q'],[60,'r']];   // Oren on the plate, you and the lantern through
K.never('Lantern or Oren: Oren on the plate, the lantern carried through','br5',
 X(range(0,60,6),['dg','g',''],jumps,[0,1]).map(([w,t,j,rel])=>[...lanternThrough,[w,'r'],...(t?[[1,t],[10,'']]:[]),...(rel?[[1,'q'],[90,'']]:[]),[12,j],[1,'rj'],[14,'rj'],[60,'r']]));
K.hunt('Lantern or Oren: from there, no way up (release him, throw the lantern, anything)','br5',{start:lanternThrough,
 actions:[...WALK,...Q,[[1,'g']],[[1,'dg']],[[1,'rg']],[[1,'lg']]],key,score:g=>Math.hypot(g.p.x-300,g.p.y-100),beam:100,maxDepth:35});
const lanternDown=[[20,'r'],[1,'g'],[60,'r'],[1,'dg']];
K.hunt('Lantern or Oren: the lantern on the plate, but nobody to stand on','br5',{start:lanternDown,actions:CLIMB,reject:held,key:still,
 score:g=>Math.hypot(g.p.x-300,g.p.y-100),beam:100,maxDepth:30});
}

// R6 Shield, Then Shoulders: the lane is too long to run between volleys, and the shelf too high without him;
// he has to be told to follow before he can be told to hold again.
if(on('br6')){
const inChamber=r=>r.g.p.x>200&&r.g.p.y>120;
K.never('Shield, Then Shoulders: run the lane between volleys without him','br6',
 X(range(0,240,4),['walk','hop']).map(([w,k])=>[[w,''],[1,'rj'],[10,'rj'],...(k==='walk'?[[220,'r']]:Array(18).fill(0).flatMap(()=>[[1,'rj'],[11,'r']])),[20,'']]),inChamber);
const lane=[[48,''],[1,'rj'],[10,'rj'],[25,'r'],[1,'rq'],[140,'r'],[10,'']];   // in the chamber, Oren still holding the lane
K.never('Shield, Then Shoulders: leave him holding the lane and jump for the shelf','br6',
 X(range(0,60,4),[4,8,12,16,20],['rj','j','lj']).map(([w,n,j])=>[...lane,[w,'l'],[n,j],[30,'r'],[1,'rj'],[20,'rj'],[60,'r']]));
K.hunt('Shield, Then Shoulders: no way up while he still holds the lane','br6',{start:lane,actions:CLIMB,
 reject:(g,ev)=>ev.some(e=>e.type==='oren-go'),key:still,score:g=>Math.hypot(g.p.x-300,g.p.y-100),beam:100,maxDepth:30});
K.hunt('Shield, Then Shoulders: no way into the chamber without his shield','br6',{actions:[...WALK,[[12,'']],[[24,'']]],reject:held,key:still,
 goal:g=>g.p.x>200&&g.p.y>120,beam:120,maxDepth:40});
}

K.done();
