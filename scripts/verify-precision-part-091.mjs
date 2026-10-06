// Part IX · The White Court (levels 91–98, 7.254): routes and the wrong answers that fail.
//   node scripts/verify-precision-part-091.mjs
// Frozen water writes into the room grid, which pcore-search's snapshots share between branches, so the
// hunts here use huntW: the same beam search, with the grid and the ice saved and restored per branch.
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT,snapshot,run,gameAt,defaultKey} from './pcore-search.mjs';
const K=kit('IX');
const W=globalThis.BladefallPrecisionWater;
// Hunt width. Kept small so the script runs in about three minutes; the authoring sweeps ran every hunt at
// 250 and 500 as well (PCORE_BEAM=500 repeats them, about six times slower).
const B=+(process.env.PCORE_BEAM||80);

const snap=g=>{const s=snapshot(g);s._grid=g.room.grid.slice();s._ice=g.room.ice?g.room.ice.slice():null;return s;};
const rest=s=>{const g=snapshot(s);g.room.grid.set(s._grid);if(s._ice)g.room.ice.set(s._ice);return g;};
function beamW(id,{actions,goal,score,beam:B,maxDepth,key=defaultKey,reject,start=[]}){
 const g0=gameAt(id,start);let frontier=[{s:snap(g0),tape:[]}];const seen=new Set([key(g0)]);
 for(let depth=0;depth<maxDepth&&frontier.length;depth++){
  let next=[];
  for(const n of frontier)for(const a of actions){
   const g=rest(n.s);const r=run(g,a);if(r.dead)continue;
   if(reject&&reject(g,r.events))continue;
   const tape=[...n.tape,...a];
   if(goal(g,r.events,r))return {tape:[...start,...tape]};
   if(r.exited)continue;
   const k=key(g);if(seen.has(k))continue;seen.add(k);next.push({s:snap(g),tape,sc:score(g)});
  }
  next.sort((a,b)=>a.sc-b.sc);if(next.length>B)next=next.slice(0,B);frontier=next;
 }
 return null;
}
function huntW(label,id,{actions=ACT.basic,reject,goal=g=>g.exited,score=g=>-g.p.x,beam=600,maxDepth=60,key,start=[]}={}){
 const r=beamW(id,{actions,reject,goal,score,beam,maxDepth,key,start});
 // A find is replayed from scratch: only a real, deathless run counts as a skip.
 let real=false;if(r){const s=K.sim(id,r.tape);real=s.exited&&s.deaths===0;}
 K.say(!real,`${id}: ${label} (adversarial beam search${real?' FOUND '+JSON.stringify(r.tape):' found none'})`);
}
const ev=(r,t)=>r.events.some(e=>e.type===t);
const lantern=g=>g.ents.find(e=>e.type==='lantern');
const throws=[[[1,'rg']],[[1,'g']],[[1,'dg']],[[1,'lg']],[[1,'rug']],[[1,'lug']]];
const portals=['r','l','u','d','ru','lu','rd','ld'].map(d=>[[1,d+'q'],[1,'']]);
const pkey=g=>{const p=g.p,l=lantern(g);return [p.x>>2,p.y>>2,Math.round(p.vx/40),Math.round(p.vy/40),p.state,p.dashes,p.carrying?1:0,l?l.x>>2:0,l?l.y>>2:0,
 g.water?g.water.pools.map(q=>q.frozen>>4).join(','):'',g.jailers?g.jailers.map(j=>j.alive+':'+j.dir).join(','):'',g.portals?JSON.stringify(g.portals.blue):''].join('|');};

K.routes();
console.log('Part IX: tempting wrong strategies fail');

// 91 Still Water: the siphon is wider than any jump, dash, super or hyper, its far wall is thorned, and it
// drags a swimmer down faster than strokes lift him. Only the ice crosses it.
K.never('Still Water: jump, dash, super or hyper across without the blade','p91',
 X(range(4,24,2),['rx','rux','rdx',''],[0,4,8,12],['j','x']).map(([w,d,t,k])=>k==='j'?[[w,'r'],[14,'rj'],[t,'r'],...(d?[[5,d]]:[]),[200,'r']]:[[w,'r'],[5,d||'rx'],[t?t%6+1:1,'r'],[20,'rj'],[200,'r']]));
K.never('Still Water: swim for it, stroking all the way','p91',
 X(range(4,24,4),[1,2,3],['r','ru','']).map(([w,n,k])=>[[w,'r'],[14,'rj'],...Array.from({length:30},()=>[[12,'rj'],[1,k]]).flat(),[200,'r']]));
huntW('Still Water: no crossing without freezing','p91',{actions:[...ACT.climb],reject:(g,e)=>e.some(x=>x.type==='freeze'),beam:B,maxDepth:45});

// 92 Hands Full: with the lantern in hand the blade is useless; the pool is too wide to glide over; the
// plate is well short of the door. Strike the pool and go back for the light, and the ice thaws under you.
K.never('Hands Full: glide over with the light, no condenser','p92',
 X(range(0,30,3),['r','rj'],[0,10,20]).map(([w,k,s])=>[[12,'l'],[1,'lg'],[w,'r'],[1,k],[s,'r'],[200,'r'],[1,'dg'],[80,'r']]));
K.never('Hands Full: freeze the pool with the blade, then fetch the light','p92',
 X([40,44,48,52,56],[0,1],[20,30,40]).map(([w,d,c])=>[[w,'r'],[1,'rj'],[1,'rds'],[20,'r'],[c,'lgu'],[c,'lgu'],[30,'l'],[1,'lg'],[1,''],[200,'r'],[1,'dg'],[60,'r']]));
huntW('Hands Full: no way through without the condenser','p92',{actions:[...ACT.climb,...ACT.strikes,...throws],
 reject:(g,e)=>e.some(x=>x.type==='condenser'),key:pkey,beam:B,maxDepth:50,
 score:g=>{const l=lantern(g);return -(l.x*2+g.p.x)+(g.p.carrying?-30:0);}});

// 93 Undertow: the upper culvert runs home, lifts a swimmer off its thorned floor, and never gets through.
const lower=g=>g.p.y>=15*8&&g.p.x>=10*8&&g.p.x<30*8;
{ // Count only runs that exit without ever entering the lower lane.
 const tapes=X(range(20,60,8),['r','ru','rj','rd'],[0,1]).map(([w,k,d])=>[[w,'r'],...(d?[[5,'rx']]:[]),...Array.from({length:40},()=>[[12,k],[1,'r']]).flat(),[100,'ru']]);
 let n=0;for(const t of tapes){const g=gameAt('p93');let low=false,out=false,dead=false;for(const seg of t){const r=run(g,[seg]);if(lower(g))low=true;if(r.dead){dead=true;break;}if(r.exited){out=true;break;}}if(out&&!low&&!dead)n++;}
 K.say(n===0,`p93: Undertow: swim the upper culvert (${tapes.length} tried, ${n} get through without the lower lane)`);
}
huntW('Undertow: no way out but the lower culvert','p93',{actions:[...ACT.climb,[[20,'rd']],[[20,'ru']]],reject:g=>lower(g),beam:B,maxDepth:45});

// 94 Downstream: the dam runs to the roof. The light floats, so it cannot go under; the knight is too tall for
// the slot at the surface; the drain's well pulls down harder than the lantern floats or a carried knight rises.
K.never('Downstream: carry the light down the drain','p94',
 X([50,70,90],[120,140,160],['rgu','ru','rj','u','rug']).map(([w,t,k])=>[[5,'r'],[1,'rg'],[w,'rd'],[t,'r'],...Array.from({length:8},()=>[[12,k],[1,'']]).flat(),[1,'ug'],[80,'rgu'],[60,'r']]));
const inSlot=g=>{const l=lantern(g);return l.x>=15*8&&l.x<=20*8&&l.y>=11*8+4&&l.y<=13*8+4;};
huntW('Downstream: the light reaches the plate only through the slot','p94',{actions:[...ACT.climb,...throws,[[20,'rd']],[[20,'d']]],
 reject:g=>inSlot(g),key:pkey,beam:B,maxDepth:45,score:g=>{const l=lantern(g);return -(l.x*2+g.p.x);}});

// 95 Under the Warder: from the front his shield holds and his roof is too low to leap.
const culvert=g=>g.p.x>=23*8&&g.p.x<32*8&&g.p.y>=14*8;
K.never('Under the Warder: over the ice and at his shield','p95',
 X([8,10,12],range(40,100,6),['s','x','j','p'],[0,1]).map(([w,t,a,u])=>[[w,'r'],[1,'rj'],[1,'rds'],[t,'r'],[1,a==='x'?'rx':a==='j'?'rj':(u?'u':'')+a],[6,'r'],[1,'rs'],[10,'r'],[1,'rs'],[100,'r']]),
 r=>r.g.jailers[0].alive===false);
huntW('Under the Warder: no way to his back but the culvert','p95',{actions:[...ACT.climb,...ACT.strikes,[[1,'p']]],
 goal:g=>!g.jailers[0].alive,reject:g=>culvert(g),key:pkey,beam:B,maxDepth:45,score:g=>Math.hypot(g.p.x-232,g.p.y-85)});

// 96 Down Is a Door: the pier runs floor to vault and the only pale stone is the siphon's floor, so nothing
// crosses the thorns but a fall through a floor portal. (The pier's own stone was cut: a wall-jump into it
// kept the jump's lift through the portal and carried a slow exit over the thorns.)
K.never('Down Is a Door: jump, dash or swim at the pier without a portal','p96',
 X(range(0,24,3),['','rj','rx','rux'],[0,20,40]).map(([w,k,t])=>[[w,'r'],[14,'rj'],...(k?[[5,k]]:[]),[t,'rd'],...Array.from({length:10},()=>[[12,'rj'],[1,'r']]).flat(),[100,'r']]));
huntW('Down Is a Door: no crossing without the floor portal','p96',{actions:[...ACT.climb,...portals],
 reject:g=>g.portals&&g.portals.blue&&g.portals.blue.face==='u',key:pkey,beam:B,maxDepth:35});

// 97 Drains: three basins climb to the door on thorned towers, five tiles apart in height, so each one is a
// jump and a dash from the last and two are out of reach. Thorn rims stop a stroke off the water's corner.
K.never('Drains: jump and dash up without the blade','p97',
 X(range(0,16,4),[6,10,14],['rux','ux','rx'],range(0,20,4)).map(([w,h,d,t])=>[[w,'r'],...Array.from({length:4},()=>[[h,'rj'],[5,d],[t,'r'],[10,'r']]).flat(),[60,'r']]));
const basin=(g,c,r)=>g.water.pools[g.water.body[r*40+c]];
const H97=[...ACT.basic,...ACT.grabs,[[1,'ds']],[[1,'rds']],[[1,'rs']]],sc97=g=>-(g.p.x-g.p.y*1.5);
for(const [n,c,r] of [['first',10,18],['middle',19,13],['last',28,8]])
 huntW(`Drains: the ${n} basin cannot be skipped`,'p97',{actions:H97,reject:g=>basin(g,c,r).frozen>0,key:pkey,beam:B,maxDepth:45,score:sc97});

// 98a Refresh: the condenser's ice thaws before the light is across, and the light cannot be carried over.
// It has to be put down: thrown ahead into the trench, where the plate is. Then the knight either cuts the
// pool again as it goes (the intended line) or, if he threw early enough, glides and dashes for the bank;
// both answer the question, so the hunt forbids only letting go of the light.
K.never('Refresh: carry the light straight across','p98a',
 X(range(80,120,4),[0,1],[0,10,20]).map(([w,j,s])=>[[8,'l'],[1,'ls'],[30,'l'],[1,'g'],[w,'r'],...(j?[[1,'rj']]:[]),[s,''],[200,'r'],[1,'dg'],[60,'r']]));
huntW('Refresh: no way over without putting the light down','p98a',{actions:[...ACT.move,...ACT.jumps,...ACT.dashes,...ACT.strikes,...throws],
 reject:(g,e)=>e.some(x=>x.type==='throw'),key:pkey,beam:B,maxDepth:50,start:[[8,'l'],[1,'ls'],[30,'l'],[1,'g']],
 score:g=>{const l=lantern(g);return -(l.x*2+g.p.x);}});

// 98b Two Lanes: the upper lane runs back to the spring; the warder cannot be passed above.
const lower98=g=>g.p.x>=24*8&&g.p.x<32*8&&g.p.y>=17*8;
K.never('Two Lanes: swim the upper lane','p98b',
 X([8,10,12],range(60,90,6),['r','ru','rj']).map(([w,t,k])=>[[w,'r'],[1,'rj'],[1,'rds'],[t,'r'],...Array.from({length:30},()=>[[12,k],[1,'r']]).flat(),[40,'u'],[14,'lj'],[20,'l'],[1,'ls'],[100,'r']]),
 r=>r.g.jailers[0].alive===false);
huntW('Two Lanes: no way to his back but the lower lane','p98b',{actions:[...ACT.climb,...ACT.strikes,[[20,'ru']]],
 goal:g=>!g.jailers[0].alive,reject:g=>lower98(g),key:pkey,beam:B,maxDepth:50,score:g=>Math.hypot(g.p.x-232,g.p.y-80)});

K.done();
