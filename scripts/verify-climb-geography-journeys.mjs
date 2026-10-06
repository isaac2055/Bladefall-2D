import assert from 'node:assert/strict';
import {bootFixture} from './climb-passage-fixture.mjs';
const {ctx,Core,worlds,view,PV,st,R}=bootFixture([],true,true);
view.cam={x:0,y:0};
for(const w of worlds)for(const s of w.sections)st.atlas.solve(s.room);
let frames=0;const times=[];
function tick(input){view.lastInput=input;PV.holding();Core.step(view.g,input);for(const e of view.g.events)if(e.type==='exit')PV.exit(view);view.g.events.length=0;frames++;assert.equal(view.g.deaths,0,'journey death');}
function dense(path){const out=[];for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],n=Math.max(Math.abs(a.c-b.c),Math.abs(a.r-b.r));for(let j=0;j<n;j++)out.push({c:a.c+(b.c-a.c)*j/n,r:a.r+(b.r-a.r)*j/n});}out.push(path.at(-1));return out;}
function follow(points,exit=null){
 const id=view.g.room.id;let at=0,hold=0,lastJump=-100,lastDash=-100,aim=0,aimDir=0;
 for(let frame=0;frame<points.length*30+3000;frame++){
  const g=view.g,p=g.p,feet=p.y+p.h;if(g.room.id!==id){assert.equal(g.room.id,exit?.to,`unexpected departure ${id}`);return;}
  let best=at,distance=Infinity;
  for(let i=at;i<Math.min(points.length,at+24);i++){const q=points[i],d=Math.abs(q.c*8-p.x)+Math.abs(q.r*8-feet)*1.5;if(d<distance){distance=d;best=i;}}
  if(distance<24)at=Math.max(at,best);
  const end=points.at(-1),near=Math.abs(p.x-end.c*8)<12&&Math.abs(feet-end.r*8)<14&&at>points.length-20;
  if(near&&!exit)return;
  const target=points[Math.min(points.length-1,at+4)];let dx=target.c*8-p.x,dy=feet-target.r*8;
  const lift=g.ents.find(e=>e.type==='climb-lift'&&p.y>=e.y&&p.y<e.y+56&&target.r*8<e.y);
  if(lift){dx=lift.x-12-p.x;dy=Math.max(dy,20);}
  const under=g.ents.find(e=>e.type==='climb-lift'&&Math.abs(feet-e.y)<12&&target.r*8>e.y+8);
  if(under)dx=under.x+under.w+12-p.x;
  const input={l:dx<-2,r:dx>2};
  if(near&&exit){input.l=exit.edge==='left';input.r=exit.edge==='right';}
  if(p.onGround&&frame-lastJump>22&&(dy>2||Core.solidAt(g,p.x+(dx<0?-3:9),p.y,2,11))){hold=19;lastJump=frame;}
  input.jump=hold-->0;
  if(p.onGround&&dy<-3&&Math.abs(dx)<25&&frame-lastJump>22){input.d=true;input.jump=true;lastJump=frame;}
  if(!aim&&!p.onGround&&p.vy>0&&(dy>4||Core.solidAt(g,p.x+(dx<0?-4:10),p.y,2,11))&&p.dashes>0&&frame-lastDash>25){input.dash=true;aim=14;aimDir=!g.room.def.atlasJunction&&Math.abs(dx)>28?Math.sign(dx):0;lastDash=frame;}
  if(aim>0){aim--;input.u=true;input.l=aimDir<0;input.r=aimDir>0;}
  tick(input);
 }
 throw Error(`Stalled ${id} ${at}/${points.length} at ${view.g.p.x},${view.g.p.y+view.g.p.h} target ${JSON.stringify(points[at+4])}`);
}
function road(port,reverse=false){const d=view.g.room.def,r=d.atlasRoads.find(r=>r.edge===port.edge&&r.floor===port.floor);assert.ok(r,`road ${d.id}`);const p=dense(r.points);follow(reverse?p.reverse():p,reverse?null:port);}
function travel(link){
 const started=frames;
 const hub=view.g.room.def,port=hub.atlasSockets.find(p=>p.link===link);assert.ok(port,`link ${link} at ${hub.id}`);road(port);
 const passage=view.g.room.def,entry=passage.atlasSockets.find(p=>p.to===hub.id),exit=passage.atlasSockets.find(p=>p!==entry),path=passage.atlasTerrain.path;
 const dist=p=>Math.abs(p.c*8-view.g.p.x)+Math.abs(p.r*8-view.g.p.y-view.g.p.h);
 follow(dist(path[0])<dist(path.at(-1))?[...path]:[...path].reverse(),exit);
 const arrival=view.g.room.def,incoming=arrival.atlasSockets.find(p=>p.to===passage.id);road(incoming,true);times.push((frames-started)/60);
}
for(const links of [['1-2'],['1-3','2-3'],['1-3','2-3','1-2']]){
 PV.climb.startWorld(1);Core.enterRoom(view.g,R.all.findIndex(d=>d.id==='cl1-atlas-crossroads'));PV.holding();
 for(const link of links)travel(link);
 const hub=view.g.room.def,main=hub.atlasSockets.find(p=>!p.link);road(main);
 assert.ok(!view.g.room.def.connector,`playable destination ${view.g.room.id}`);
 console.log(links.join(' → '),'→',view.g.room.id);
}
for(const link of ctx.BladefallClimbAtlas.links)for(const n of [link.a,link.b]){
 const w=worlds.find(w=>w.n===n),hub=w.rooms.find(d=>d.atlasJunction&&d.atlasSockets.some(p=>p.link===link.id));
 PV.climb.startWorld(n);Core.enterRoom(view.g,R.all.findIndex(d=>d.id===hub.id));PV.holding();
 travel(link.id);
 const main=view.g.room.def.atlasSockets.find(p=>!p.link);
 if(main){road(main);assert.ok(!view.g.room.def.connector,'playable regional endpoint');}
 console.log(link.id,n,'→',view.g.room.id);
}
assert.ok(Math.max(...times)<10,'every connection takes less than ten seconds at normal game speed');
console.log('Hearth-to-hearth seconds:',Math.min(...times).toFixed(1),'to',Math.max(...times).toFixed(1),'mean',(times.reduce((a,b)=>a+b,0)/times.length).toFixed(1));
console.log(`Complete regional trips with normal movement, no repositioning after setup, ${frames} frames.`);
