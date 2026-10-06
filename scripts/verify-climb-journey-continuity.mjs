// Normal tick ordering, elapsed time, authored ending and complete branching trips.
// This catches legacy return routing winning before a socket's centre crossing.
import assert from 'node:assert/strict';
import {bootFixture} from './climb-passage-fixture.mjs';
import {expand,keysToInput} from './rbr-lib.mjs';
function journey(links,targetWorld=2){
 const {Core,worlds,view,PV,st,R}=bootFixture();
 for(const w of worlds)for(const sec of w.sections)st.atlas.solve(sec.room);
 const tick=input=>{view.lastInput=input;PV.holding();Core.step(view.g,input);for(const e of view.g.events)if(e.type==='exit')PV.exit(view);view.g.events.length=0;};
 const follow=(points,exit)=>{
  let i=0,hold=0,aim=0,aimDir=0,lastJump=-100,lastDash=-100;const room=view.g.room.id;
  for(let f=0;f<10000&&view.g.room.id===room;f++){
   const g=view.g,p=g.p,t=points[i];
   if(!t){if(!exit)return;tick(exit==='left'?{l:true}:{r:true});continue;}
   const dx=t.c*8+4-(p.x+4),dy=p.y+p.h-t.r*8;
   if(Math.abs(dx)<9&&dy<=2&&dy>=-(t.ground?20:2)&&p.onGround){i++;continue;}
   const inp={l:dx<-3,r:dx>3};
   if(p.onGround&&f-lastJump>24&&(dy>2||Core.solidAt(g,p.x+(dx<0?-3:9),p.y,2,11)||Math.abs(dx)>32&&!Core.solidAt(g,p.x+(dx<0?-16:16),p.y+p.h+1,8,8))){hold=19;lastJump=f;}
   inp.jump=hold-->0;
   if(!aim&&!p.onGround&&p.vy>0&&dy>1&&Math.abs(dx)<90&&p.dashes>0&&f-lastDash>25){inp.dash=true;aim=14;aimDir=Math.abs(dx)>30?Math.sign(dx):0;lastDash=f;}
   if(aim>0){aim--;inp.u=true;inp.l=aimDir<0;inp.r=aimDir>0;}
   if(p.onGround&&dy<-3&&Math.abs(dx)<25&&f-lastJump>24){inp.d=true;inp.jump=true;lastJump=f;}
   tick(inp);
   assert.equal(view.g.deaths,0,`death following ${room}`);
  }
  if(exit)assert.notEqual(view.g.room.id,room,`stalled ${room} toward ${JSON.stringify(points[i])}: ${view.g.p.x},${view.g.p.y}`);
  else assert.equal(i,points.length,`incomplete bank in ${room}`);
 };
 const bankToCenter=()=>{
  const g=view.g,d=g.room.def,edge=g.p.x<g.room.w/2?'left':'right';
  const road=d.atlasRoads.filter(r=>r.edge===edge).sort((a,b)=>Math.abs(a.floor*8-g.p.y-g.p.h)-Math.abs(b.floor*8-g.p.y-g.p.h))[0];
  follow([...road.points].reverse());
 };
 const roadTo=socket=>{
  const d=view.g.room.def,road=d.atlasRoads.find(r=>r.edge===socket.edge&&r.floor===socket.floor);
  // The reported bug required time in the junction; do not test only an immediate transfer.
  for(let i=0;i<90;i++)tick({});
  follow(road.points,socket.edge);
  assert.equal(view.g.room.id,socket.to,`wrong branch for ${socket.link||socket.to}`);
 };
 PV.climb.startWorld(1);Core.enterRoom(view.g,R.all.findIndex(d=>d.id===worlds[0].atlasEnd));
 for(const input of expand(R.tapes[worlds[0].atlasEnd])){tick(keysToInput(input));if(view.g.room.def.atlasJunction)break;}
 assert.equal(view.g.room.id,worlds[0].sections.at(-1).room);
 for(const link of links){
  bankToCenter();const socket=view.g.room.def.atlasSockets.find(s=>s.link===link);assert.ok(socket);
  roadTo(socket);
  const g=view.g,d=g.room.def.atlasTransit,edge=g.p.x<g.room.w/2?'left':'right';
  follow(edge==='left'?d.route:[...d.route].reverse(),edge==='left'?'right':'left');
  assert.ok(view.g.room.def.atlasJunction,'passage arrives in its connected junction');
 }
 bankToCenter();roadTo(view.g.room.def.atlasSockets.find(s=>s.kind==='room'));
 assert.equal(st.world.n,targetWorld);assert.equal(view.g.room.id,targetWorld===1?worlds[0].atlasEnd:worlds[targetWorld-1].atlasStart);assert.equal(view.g.deaths,0);
 const entered=view.g.room.id;for(let f=0;f<120;f++)tick({});assert.equal(view.g.room.id,entered,'must remain in the playable region');
 if(targetWorld===2){for(let f=0;f<60&&view.g.p.x<view.g.room.spawn.x-2;f++)tick({r:true});for(let f=0;f<15;f++)tick({});for(const input of expand(R.tapes[entered])){tick(keysToInput(input));if(view.g.room.id!==entered)break;}assert.notEqual(view.g.room.id,entered,`Black Woods first section is playable: ${JSON.stringify({p:view.g.p,deaths:view.g.deaths})}`);assert.ok(!view.g.room.def.atlasJunction);assert.equal(st.world.n,2);assert.equal(view.g.deaths,0);}
 else{for(let f=0;f<600&&view.g.room.id===entered;f++)tick({l:true});assert.equal(view.g.room.id,worlds[0].sections.at(-3).room,'Gatehouse leads back to Muster Yard');assert.equal(view.g.deaths,0);}
 console.log(`Continuous zero-death trip: Outskirts ending → ${links.join(' → ')} → playable region ${targetWorld}; waiting, banking, return sockets and normal tick order included.`);
}
journey(['1-2']);
journey(['1-3','2-3']);

journey(['1-3','2-3','1-2'],1);
