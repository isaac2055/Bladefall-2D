// Part X · Emberdeep (levels 99–106, 7.254): routes and the wrong answers that fail.
// Heat slabs cycle stone → molten → glass on the room's clock (bladefall-pcore-dev-ember.js). Every room
// here is a `study` room, so the clock starts with the first input and a retry replays the same schedule.
//   node scripts/verify-precision-part-099.mjs [roomId]   (a room id runs only that room's families)
import {kit,X,range} from './pcore-verify-kit.mjs';
import {ACT} from './pcore-search.mjs';
const K=kit('X');
const only=process.argv[2];
const want=id=>!only||only===id;
if(!only)K.routes();
console.log('Part X: tempting wrong strategies fail');
const onSlab=(g,i)=>{const p=g.p,e=g.slabs[i];return p.onGround&&Math.abs(p.y+p.h-e.y)<1&&p.x+p.w>e.x&&p.x<e.x+e.w;};
// Landed on slab 0 at any frame of a segment (the reject itself only sees the segment's end).
const touchedTop=(g,ev)=>{const e=g.slabs[0];return ev.some(v=>(v.type==='land'&&Math.abs(v.y-e.y)<2||v.type==='refill-dash'&&Math.abs(v.y+11-e.y)<2)&&v.x>=e.x-4&&v.x<=e.x+e.w+4);};
const inBox=(g,x0,y0,x1,y1)=>g.p.x+g.p.w>x0&&g.p.x<x1&&g.p.y+g.p.h>y0&&g.p.y<y1;
const ev=t=>(g,e)=>e.some(x=>x.type===t);
const PARRY=[[[1,'p']],[[1,'up']],[[1,'dp']],[[1,'rp']],[[1,'lp']],[[1,'rdp']],[[1,'ldp']]];
/* The state of slab i at frame n of the room's clock (the clock starts with the first input, frame 0). */
const {BladefallPrecisionEmber:EM}=globalThis;
const slabAt=(id,i,n)=>{const g=K.sim(id,[[1,'l']]).g;return EM.stateAt(g.slabs[i],n).state;};

// 99 Cooling Road: rush the stair without waiting on a slab, at any start time and any hop rhythm.
if(want('px99')){
 const rush=[];
 for(let w=0;w<260;w+=10)for(const a of [8,12,16,20])for(const h of [2,8,14])for(const style of ['j','jx','ju','xj']){
  const hop=style==='j'?[[a,'rj'],[h,'']]:style==='jx'?[[a,'rj'],[5,'rux'],[h,'']]:style==='ju'?[[8,'rj'],[5,'ux'],[a,'r'],[h,'']]:[[5,'rx'],[a,'rj'],[h,'']];
  const t=[[1,'l'],[w,''],[20,'r']];for(let k=0;k<6;k++)t.push(...hop);t.push([100,'r']);rush.push(t);}
 K.never('Cooling Road: climb the stair without stopping on a slab','px99',rush);
 K.hunt('Cooling Road: no way up the ledge\'s face without the top slab','px99',{actions:ACT.climb,reject:(g,ev)=>onSlab(g,0)||touchedTop(g,ev),
  score:g=>g.p.y*2-g.p.x,beam:100,maxDepth:40});
}
// 100 Glass Door: every slab spans the shaft. Rushing (hop as soon as you land) or climbing straight up meets stone or molten.
if(want('px100')){
 const rush=X(range(0,200,4),[0,3,6,10],[12,17]).map(([w,h,j])=>{const t=[[78,'r'],[w,'']];for(let k=0;k<6;k++)t.push([j,'j'],[h,'']);t.push([130,'r']);return t;});
 const climb=X(range(0,200,4),['gu','rgu','lgu']).map(([w,k])=>[[78,'r'],[w,''],[8,'j'],[300,k],[130,'r']]);
 K.never('Glass Door: hop up the shaft without waiting on the pips','px100',rush);
 K.never('Glass Door: climb the walls straight up through the doors','px100',climb);
}
// 101 Slow Fall: the ledge melts long before the floor sets and the shaft is lined with thorns.
if(want('px101')){
 const bare=X(range(0,300,6),['r','rx','rj']).map(([w,m])=>[[w,''],[20,m==='rj'?'rj':'r'],...(m==='rx'?[[5,'rdx']]:[]),[200,''],[150,'r']]);
 const thrown=X(range(0,300,6),[4,12,20]).map(([w,k])=>[[8,'r'],[1,'g'],[w,''],[k,'r'],[1,'rg'],[1,''],[20,'r'],[200,''],[150,'r']]);
 K.never('Slow Fall: drop down the shaft without the light, at any time','px101',bare);
 K.never('Slow Fall: throw the light down the shaft and follow it','px101',thrown);
 K.hunt('Slow Fall: no way down to the plate but gliding with the light','px101',{actions:ACT.climb,
  reject:g=>g.p.carrying&&inBox(g,56,50,88,150)&&!g.p.onGround,
  score:g=>(g.ents.find(e=>e.type==='held').solid?300:0)-g.p.x+(g.p.carrying?0:50),beam:100,maxDepth:40});
}
// 102 Two Doors: the tempting read is to board the moment the near door turns glass.
if(want('px102')){
 const onsets=[];let prev=slabAt('px102',0,0);
 for(let n=1;n<800;n++){const s=slabAt('px102',0,n);if(s==='glass'&&prev!=='glass')onsets.push(n);prev=s;}
 const board=X(onsets.filter(n=>n>=20),range(-12,6,2)).map(([n,d])=>[[4,'r'],[n+d-8,''],[16,'r'],[40,''],[60,'r']]).filter(t=>t[1][0]>=0);
 K.never('Two Doors: board as the near door turns glass','px102',board);
 K.hunt('Two Doors: no way across the thorns but the lift','px102',{actions:ACT.climb,reject:ev('zip-start'),score:g=>-g.p.x,beam:100,maxDepth:40});
}
// 103 Pod Hours: the far slab stays molten for over five seconds; nothing but the pods keeps you up that long.
if(want('px103')){
 const rush=X(range(0,340,8),[12,20],['rx','rux'],[0,1]).map(([w,a,d,two])=>[[1,'l'],[w,''],[12,'r'],[a,'rj'],[5,d],...(two?[[10,'r'],[1,'rj']]:[]),[150,'r']]);
 K.never('Pod Hours: jump and dash across without cutting a pod','px103',rush);
 K.hunt('Pod Hours: no crossing without the pods','px103',{actions:[...ACT.climb,...ACT.strikes],reject:ev('pod'),score:g=>-g.p.x,beam:100,maxDepth:40});
}
// 104 Open Window: fire while the window is stone and the shot stops; follow while it is molten and it burns.
if(want('px104')){
 const fire=f=>[[50,'r'],[f-50,''],[1,'uq'],[3,''],[14,'r'],[30,''],[6,'r'],[16,'rj'],[90,'r']];
 const stone=[],molten=[];
 for(let f=52;f<520;f+=2){const s=slabAt('px104',0,f);if(s==='stone')stone.push(fire(f));
  // arriving on the window about 35 frames after the shot: the tempting "fire and go" while it is molten
  if(slabAt('px104',0,f)==='molten'&&slabAt('px104',0,f-20)!=='molten'&&slabAt('px104',0,f+40)==='molten')molten.push(fire(f));}
 K.never('Open Window: fire while the window is stone','px104',stone);
 K.never('Open Window: fire as the window melts and follow at once','px104',molten);
 K.hunt('Open Window: no way up but the portal','px104',{actions:[...ACT.climb,...ACT.strikes],reject:ev('portal-pass'),score:g=>g.p.y,beam:100,maxDepth:40});
}
// 105 Glass Underfoot: the first bolt crosses over stone (it stops), the slab melts before the second, which crosses over glass.
if(want('px105')){
 const stoneParry=X(range(96,112,1),[0,4,8]).map(([w,d])=>[[47,'l'],[3,''],[5,'r'],[w-4-d,''],[d+4,'l'],[1,'dp'],[20,''],[130,'r']]);
 const stay=X(range(90,112,2),[0,20,40]).map(([w,k])=>[[47,'l'],[3,''],[5,'r'],[w-4,''],[4,'l'],[1,'dp'],[k,''],[1,'dp'],[200,''],[1,'dp'],[130,'r']]);
 K.never('Glass Underfoot: parry the first bolt down through stone','px105',stoneParry,r=>r.g.ents.some(e=>e.type==='stone'&&e.lit));
 K.never('Glass Underfoot: stand on the slab and wait for it to open','px105',stay);
 // The skip the first sweep found (a bolt parried down from the air through molten) is closed by the clock:
 // the slab's cycle is exactly two volleys long, so every bolt crosses it on stone or on glass, never molten.
 {const g=K.sim('px105',[[1,'l']]).g;const seen=new Set();let bad=0;
  const step=globalThis.BladefallPrecisionCore.step;
  for(let n=0;n<2400;n++){step(g,{});g.events.length=0;g.p.x=240;g.p.y=109;g.p.state='normal';
   for(const b of g.bolts){if(b.x>=138&&b.x<=168){seen.add(g.slabs[0].state);if(g.slabs[0].state==='molten')bad++;}if(b.x>200)b.alive=false;}}
  K.say(bad===0&&seen.has('glass')&&seen.has('stone'),`px105: Glass Underfoot: over 2400 frames every bolt crosses the slab on ${[...seen].join(' or ')} (${bad} frames on molten)`);}
}
// 106a Carried Down: with the light in hand you cannot fire, so the shot comes first.
if(want('px106a')){
 const lightFirst=X(range(0,200,8),['uq','ruq','luq']).map(([w,q])=>[[42,'l'],[2,''],[7,'r'],[49,''],[62,'l'],[1,'g'],[w,''],[73,'r'],[1,q],[3,''],[5,'l'],[66,''],[12,'r'],[40,''],[50,'rj'],[8,'r'],[6,''],[1,'dg'],[42,'r']]);
 const stoneShot=[];for(let f=44;f<400;f+=3)if(slabAt('px106a',0,f)==='stone')stoneShot.push([[42,'l'],[2,''],[f-44,'r'],[1,'uq'],[3,''],[62,'l'],[1,'g'],[73,'r'],[3,''],[5,'l'],[66,''],[12,'r'],[40,''],[50,'rj'],[8,'r'],[6,''],[1,'dg'],[42,'r']]);
 K.never('Carried Down: pick up the light first, then try to fire','px106a',lightFirst);
 K.never('Carried Down: fire while the window is stone','px106a',stoneShot);
}
// 106b The Last Pour: the wake slab melts and the roof opens late; nothing but the pod holds you in between.
if(want('px106b')){
 const rush=X(range(0,240,8),[12,20],['ux','rux'],[0,1]).map(([w,a,d,g])=>[[1,'l'],[w,''],[12,'r'],[a,'rj'],[5,d],...(g?[[30,'rgu']]:[]),[150,'r']]);
 K.never('The Last Pour: up through the roof without the pod','px106b',rush);
 K.hunt('The Last Pour: no way through the roof without the pod','px106b',{actions:[...ACT.climb,...ACT.strikes],reject:ev('pod'),
  score:g=>g.p.y<70?-g.p.x:g.p.y+400,beam:100,maxDepth:40});
}
K.done();
