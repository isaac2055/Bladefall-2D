import assert from 'node:assert/strict';
import {Core,worlds,view,PV,st,R,ctx} from './climb-passage-fixture.mjs';
for(const w of worlds)for(const s of w.sections)st.atlas.solve(s.room);
view.cam={x:0,y:0};let crossings=0;
for(const w of worlds)for(const def of w.rooms)for(const socket of (def.atlasSockets||[]).filter(s=>!s.preview))for(const mode of ['walk','jump','dash','dash-start']){
 PV.climb.startWorld(w.n);Core.enterRoom(view.g,R.all.findIndex(r=>r.id===def.id));st.cam=null;st.passageCool=0;st.enteredAt=0;view.g.frame=120;
 const g=view.g,sign=socket.edge==='left'?-1:1;
 Object.assign(g.p,{x:sign<0?14:g.room.w-22,y:socket.floor*8-11-(mode==='walk'?0:Math.min(8,(socket.height||4)*8-11)),vx:sign*(mode==='dash'?240:90),vy:mode==='jump'?-10:0,facing:sign,
 state:mode==='dash'?'dash':'normal',dashTimer:12,dashDir:{x:sign,y:0},dashAim:false,dashFlash:7,dashes:mode==='dash'?0:1,onGround:mode==='walk',varJump:mode==='jump'?5:0,varJumpSpeed:-30});
 view.scarf=[{x:g.p.x+4,y:g.p.y+3}];view.trail=[];view.parts=[];view.lastInput=sign<0?{l:true}:{r:true};
 PV.camera(g,view);let entered=false;
 for(let f=0;f<50;f++){
  const before={room:g.room.id,x:g.p.x,y:g.p.y,vx:g.p.vx,vy:g.p.vy,state:g.p.state,dashTimer:g.p.dashTimer,dashFlash:g.p.dashFlash,varJump:g.p.varJump,screenX:g.p.x-view.cam.x,screenY:g.p.y-view.cam.y,scarfX:view.scarf[0].x-g.p.x};
  if(mode==='dash-start')view.lastInput={...(sign<0?{l:true}:{r:true}),dash:f===0};
  PV.holding();
  if(g.room.id!==before.room){
   entered=true;const expected=socket.kind==='region'?st.atlas.endpoint(socket.link,socket.world):socket.to;assert.equal(g.room.id,expected,`${def.id}: wrong destination for ${socket.link||socket.to}`);assert.equal(view.g,g);for(const key of ['vx','vy','state','dashTimer','dashFlash','varJump'])assert.deepEqual(g.p[key],before[key],`${def.id} ${mode}: ${key} reset`);
   assert.equal(view.scarf[0].x-g.p.x,before.scarfX,'scarf must translate with body');
   PV.camera(g,view);
   assert.ok(Math.abs(g.p.x-view.cam.x-before.screenX)<5,`${def.id} ${mode}: camera x discontinuity`);
   assert.ok(Math.abs(g.p.y-view.cam.y-before.screenY)<5,`${def.id} ${mode}: camera y discontinuity`);
   assert.ok(!Core.solidAt(g,g.p.x,g.p.y,g.p.w,g.p.h),`${def.id}: arrival collision`);
   assert.ok(Math.abs(g.p.vx)>40,`${def.id}: boundary stopped motion`);
   break;
  }
  Core.step(g,view.lastInput);g.events.length=0;PV.camera(g,view);
 }
 assert.ok(entered,`${def.id} ${socket.edge} ${mode}: did not cross`);
 const target=g.room.id;for(let f=0;f<16;f++){PV.holding();Core.step(g,view.lastInput);g.events.length=0;PV.camera(g,view);}
 assert.equal(g.room.id,target,`${def.id}: bounced back`);assert.equal(g.deaths,0);crossings++;
}
// A locked path remains solid and never leaks into another region.
const w=worlds[0],def=w.rooms.find(d=>d.atlasSockets?.some(s=>s.kind==='passage')),socket=def.atlasSockets.find(s=>s.kind==='passage');
PV.climb.startWorld(1);Core.enterRoom(view.g,R.all.findIndex(r=>r.id===def.id));const open=st.atlas.state.open;st.atlas.state.open={};
const g=view.g,sign=socket.edge==='left'?-1:1;Object.assign(g.p,{x:sign<0?4:g.room.w-12,y:socket.floor*8-11});view.lastInput=sign<0?{l:true}:{r:true};
for(let i=0;i<45;i++){PV.holding();Core.step(g,view.lastInput);g.events.length=0;}
assert.equal(g.room.id,def.id);assert.ok(g.p.x>=0&&g.p.x+g.p.w<=g.room.w);st.atlas.state.open=open;
const plain=Core.createGame([{id:'plain',map:['..........','..........','P.........','##########'],exit:'none'}]);plain.p.x=0;for(let i=0;i<20;i++)Core.step(plain,{l:true});assert.equal(plain.p.x,0,'ordinary core boundaries unchanged');
console.log(`${crossings} real walking, jumping, active-dash and dash-start crossings: continuous motion/pose/scarf/camera, safe follow-through, sealed route and non-Climb bounds verified.`);
