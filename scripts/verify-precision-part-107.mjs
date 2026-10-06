// Part XI · The Foundry (levels 107–114, 7.254): routes and the wrong answers that fail.
//   node scripts/verify-precision-part-107.mjs [roomId]   (a room id runs only that room's families)
// Hunts here are small beams (the long offline searches are listed in docs/design/precision-parts/PART-XI.md).
// Momentum (super, hyper, ultra) is optional before level 150: where a hunt excludes it, the label says so.
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT} from './pcore-search.mjs';
const K=kit('XI');
const only=process.argv[2];
const want=id=>!only||only===id;
if(!only)K.routes();
console.log('Part XI: tempting wrong strategies fail');
const ev=t=>(g,e)=>e.some(x=>x.type===t);
const MOM=['hyper','super','ultra'];
const noMom=rej=>(g,e)=>e.some(x=>MOM.includes(x.type))||rej(g,e);
const upDashes=['u','ru','lu'];
const Q=['r','l','u','d','ru','lu','rd','ld'].map(d=>[[1,d+'q'],[1,'']]);
const lit=g=>g.ents.some(e=>e.type==='lantern'&&!e.held&&g.ents.some(p=>p.type==='plate'&&p.down));

// 107 First Stroke: nothing but the anvil's downward answer clears the ledge.
if(want('p107')){
 K.never('First Stroke: run, jump and dash at the ledge from the floor or the anvil top','p107',
  X(range(20,80,4),[1,6,12],upDashes,[0,1]).map(([w,j,d,cut])=>[[w,'r'],[1,'rj'],[j,'r'],[5,d+'x'],...(cut?[[1,'rs']]:[]),[160,'r']]));
 K.never('First Stroke: a cut from the side or from below only rings','p107',
  X(range(40,70,3),['rs','us','s'],[0,8]).map(([w,s,j])=>[[w,'r'],...(j?[[1,'rj'],[j,'r']]:[]),[1,s],[4,''],[1,'rj'],[5,'rux'],[160,'r']]));
 K.hunt('First Stroke: no way up without the anvil','p107',{actions:[...ACT.climb,...ACT.strikes],reject:ev('anvil'),
  score:g=>g.p.y+(g.p.x>144?-60:0),beam:100,maxDepth:40});
}
// 108 Iron and Seed: the pair under the teeth throws you into them; the pod is the only way across.
if(want('p108')){
 const pre=[[5,'rux'],[14,'rj'],[14,'rj'],[14,'r'],[1,'ds'],[14,'r'],[5,'rx'],[14,'rj']];
 K.never('Iron and Seed: cut down on the pair under the teeth','p108',
  X(range(0,12,2),[1,4,8],[2,5,8,12]).map(([w,j,k])=>[...pre,[w,'r'],[j,'j'],[k,''],[1,'ds'],[30,'r'],[14,'rj'],[5,'rux'],[1,'ds'],[60,'r']]));
 K.never('Iron and Seed: jump and dash for the iron without the pod','p108',
  X([0,2,4],[8,14],['rx','rux','rdx'],range(0,30,3)).map(([w,j,d,k])=>[[w,''],[j,'rj'],[5,d],[k,'r'],[5,'rx'],[40,'r'],[1,'rj'],[5,'rux'],[1,'ds'],[60,'r']]));
 K.hunt('Iron and Seed: no way over the teeth without the pod (no momentum)','p108',{actions:[...ACT.climb,...ACT.strikes],reject:noMom(ev('pod')),
  score:g=>g.p.y<50?-g.p.x-500:(g.p.x<230?-g.p.x+600:g.p.y),beam:100,maxDepth:40});
 K.hunt('Iron and Seed: no way up without the far anvil','p108',{actions:[...ACT.climb,...ACT.strikes],reject:ev('anvil'),
  score:g=>g.p.y<50?-g.p.x-500:(g.p.x<230?Math.hypot(g.p.x-240,g.p.y-60)+300:g.p.y),beam:100,maxDepth:40});
}
// 109 Cold Cast: the anvil throws you over the teeth, and nothing on the far side holds until you strike it.
if(want('p109')){
 K.never('Cold Cast: over the teeth without casting a mould','p109',
  X([28,30,32],range(20,60,4),['rx','rux'],range(0,24,4)).map(([w,k,d,m])=>[[w,'r'],[1,'rj'],[4,''],[1,'ds'],[k,'r'],[5,d],[m,'r'],[12,'rj'],[5,'rux'],[80,'r']]));
 K.hunt('Cold Cast: no way across without a cast','p109',{actions:[...ACT.climb,...ACT.strikes],reject:ev('cast'),score:g=>-g.p.x+(g.p.y>100?80:0),beam:100,maxDepth:40});
}
// 110 Passenger: the knight cannot fit the tunnel; the anvil's door opens only for the light on the plate.
if(want('p110')){
 K.never('Passenger: cut the anvil with the door shut','p110',
  X(range(40,140,6),[0,6],[4,8]).map(([w,j,k])=>[[w,'r'],...(j?[[j,'r']]:[]),[1,'j'],[k,''],[1,'ds'],[40,''],[160,'r']]));
 K.hunt('Passenger: no way out without letting go of the light','p110',{actions:[...ACT.climb,...ACT.strikes],reject:ev('throw'),
  score:g=>g.p.y<70?-g.p.x-500:g.p.y,beam:100,maxDepth:40});
}
// 111 Down the Shaft: a bolt parried from the floor never reaches the husk high on the far wall.
if(want('p111')){
 K.never('Down the Shaft: parry from the floor, at any aim','p111',
  X(range(60,100,4),['rup','rp','up','p'],[0,120]).map(([w,a,k])=>[[w,'r'],[1,a],[k,''],[1,a],[300,'r']]));
 K.hunt('Down the Shaft: no way to break the husk without the anvil','p111',{actions:[...ACT.climb,[[1,'rp']],[[1,'rup']],[[1,'up']],[[1,'p']]],reject:ev('anvil'),
  goal:(g,e)=>e.some(x=>x.type==='breach')||g.exited,score:g=>g.p.y,beam:100,maxDepth:40});
}
// 112 Sideways: the fixed end throws you across only as hard as you came in; a jump or a dash is too slow.
if(want('p112')){
 K.never('Sideways: your end over the anvil, in by jump or dash','p112',
  X(range(16,30,2),[3,5,8],['ux','rux','lux',''],['','r']).map(([w,j,d,h])=>[[w,'r'],[1,'uq'],[2,''],[1,'j'],[j,'j'],...(d?[[5,d]]:[[1,'j']]),[20,h],[80,'r']]));
 K.never('Sideways: your end anywhere else on the stone, then the anvil','p112',
  X([0,6,40,56,70],['uq','ruq','luq'],[0,1]).map(([w,q,l])=>[[w,w>30?'r':''],[1,q],[2,''],[Math.abs(w-22),w>22?'l':'r'],...(l?[[4,'l']]:[]),[1,'j'],[8,'j'],[1,'ds'],[20,''],[80,'r']]).filter(t=>t[0][0]!==22));
 K.hunt('Sideways: no way across without the anvil','p112',{actions:[...ACT.climb,...ACT.strikes,...Q],reject:ev('anvil'),
  score:g=>g.p.x>=216&&g.p.y<100?-1000-g.p.x:-g.p.x+Math.max(0,g.p.y-30),beam:100,maxDepth:40});
 K.hunt('Sideways: no way across without the portal','p112',{actions:[...ACT.climb,...ACT.strikes],reject:ev('portal-pass'),
  score:g=>-g.p.x+(g.p.y>150?100:0),beam:100,maxDepth:40});
}
// 113 Iron Island: the pour floor holds for less than the crossing; cast iron is the only place to wait it out.
if(want('p113')){
 K.never('Iron Island: run the whole floor in one window, dashing as often as it comes back (no momentum)','p113',
  X(range(0,240,6),[2,8],[4,8,12],[0,1]).map(([w,n,k,hop])=>{const t=[[1,'l'],[w,''],...(hop?[[14,'rj'],[5,'rux']]:[[10,'r']])];for(let i=0;i<n;i++)t.push([5,'rx'],[k,'rj']);t.push([12,'rj'],[5,'rux'],[300,'r']);return t;}),
  r=>r.exited&&!r.events.some(e=>MOM.includes(e.type)));
 K.never('Iron Island: wait on the floor or in the air, never strike','p113',
  X(range(0,120,6),[0,1],range(0,160,20)).map(([w,j,v])=>[[1,'l'],[w,''],[90,'r'],...(j?[[14,'j']]:[]),[v,''],[200,'r']]));
 K.hunt('Iron Island: no way across without casting the mould (no momentum)','p113',{actions:[...ACT.climb,...ACT.strikes],reject:noMom(ev('cast')),
  score:g=>-g.p.x,beam:100,maxDepth:40});
}
// 114a Three Strokes: the anvil will not reach the ledge, the pod will not reach it, and the mould holds only once struck.
if(want('p114a')){
 const pod=[[6,'r'],[1,'rj'],[4,'r'],[1,'ds'],[44,'r'],[5,'rx'],[14,'rj'],[5,'rx'],[1,'ds']];
 K.never('Three Strokes: from the pod straight for the ledge, no cut','p114a',
  X(range(0,24,2),['rx','rux','ux'],[0,6,12]).map(([w,d,k])=>[...pod,[w,'r'],[5,d],[k,'r'],[12,'rj'],[5,'rux'],[60,'r']]));
 K.never('Three Strokes: from the anvil straight for the mould, no pod','p114a',
  X(range(30,60,3),['rx','rux'],range(0,30,5),['ds','rs']).map(([w,d,k,s])=>[[6,'r'],[1,'rj'],[4,'r'],[1,'ds'],[w,'r'],[5,d],[k,'r'],[1,s],[14,'rj'],[5,'rux'],[60,'r']]));
 K.hunt('Three Strokes: no way up without casting the mould','p114a',{actions:[...ACT.basic,...ACT.strikes],reject:noMom(ev('cast')),
  score:g=>g.p.x>270&&g.p.y<14?-g.p.x-1000:Math.hypot(g.p.x-280,g.p.y-5),beam:100,maxDepth:40});
 K.hunt('Three Strokes: no way up without the pod','p114a',{actions:[...ACT.basic,...ACT.strikes],reject:noMom(ev('pod')),
  score:g=>g.p.x>270&&g.p.y<14?-g.p.x-1000:Math.hypot(g.p.x-280,g.p.y-5),beam:100,maxDepth:40});
}
// 114b Grille: the knight cannot follow the light through the grille, nor carry it up; only your end above the shelf puts it there.
if(want('p114b')){
 K.never('Grille: carry the light up the block yourself','p114b',
  X(range(30,80,5),[8,14],['rgu','ru','r'],[0,1]).map(([w,j,k,d])=>[[1,'g'],[w,'r'],[j,'rj'],[40,k],...(d?[[5,'rux']]:[]),[60,'r'],[1,'dg'],[100,'r']]));
 K.never('Grille: send the light in before your end is open, and leave it','p114b',
  X(range(20,60,5),[0,20,60]).map(([w,k])=>[[1,'g'],[w,'r'],[1,'rg'],[k,''],[20,'rgu'],[20,'ru'],[14,'rj'],[20,'rgu'],[14,'j'],[5,'ux'],[60,'ru'],[60,'ru'],[14,'r']]));
 K.hunt('Grille: no way to the plate but the light through the portal','p114b',{actions:[...ACT.climb,[[1,'g']],[[1,'dg']],[[1,'rg']],...Q],
  reject:(g,e)=>e.some(x=>x.type==='portal-pass'&&x.kind!=='knight'),goal:g=>g.exited,score:g=>-g.p.x+(g.p.carrying?0:40),beam:100,maxDepth:40});
}
K.done();
