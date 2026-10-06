import assert from 'node:assert/strict';
import {bootFixture} from './climb-passage-fixture.mjs';
import {expand,keysToInput} from './rbr-lib.mjs';
const {ctx,Core,worlds,view,PV,st,R}=bootFixture([],true,true),CL=ctx.BladefallClimb;
view.cam={x:0,y:0};
for(const w of worlds)for(const sec of w.sections)st.atlas.solve(sec.room);
const enter=(w,id)=>{PV.climb.startWorld(w.n);Core.enterRoom(view.g,R.all.findIndex(d=>d.id===id));view.lastInput={};PV.holding();PV.camera(view.g,view);};
let seams=0,tapes=0;
for(const w of worlds)for(const def of w.rooms){
 if(!CL.place(w,def.id))continue;
 for(const port of def.atlasSockets||[]){
  if(port.preview)continue;enter(w,def.id);const g=view.g,p=g.p,plane=port.plane??(port.edge==='left'?0:g.room.w);
  p.x=plane-p.w/2+(port.edge==='left'?-1:1);p.y=port.floor*8-p.h;p.vx=port.edge==='left'?-90:90;p.vy=0;p.state='normal';
  const place=CL.place(w,def.id),before={x:place.x+p.x,y:place.y+p.y},cam={...st.cam};
  view.lastInput=port.edge==='left'?{l:true}:{r:true};PV.holding();
  assert.equal(g.room.id,port.to,`${def.id} ${port.edge} → ${port.to}`);
  const after=CL.place(st.world,g.room.id);
  if(port.folded){
   const peer=g.room.def.atlasSockets.find(p=>p.to===def.id);
   assert.notEqual(peer.edge,port.edge,'fold never reverses held movement');
   assert.equal(g.p.x+g.p.w/2-peer.plane,port.edge==='left'?-1:1,'mouth-relative x preserved');
   assert.equal(g.p.y+g.p.h,peer.floor*8,'mouth-relative feet preserved');
   assert.equal(g.p.vx,port.edge==='left'?-90:90,'normal speed preserved');
   assert.ok(Math.abs((after.x+g.p.x-st.cam.x)-(before.x-cam.x))<1e-8,'fold preserves player screen x');
   assert.ok(Math.abs((after.y+g.p.y-st.cam.y)-(before.y-cam.y))<1e-8,'fold preserves player screen y');
  }else{
   assert.equal(after.x+g.p.x,before.x,'physical handoff keeps global x');assert.equal(after.y+g.p.y,before.y,'physical handoff keeps global y');
   assert.deepEqual({...st.cam},cam,'physical handoff keeps global camera');
  }
  assert.equal(Core.solidAt(g,g.p.x,g.p.y,g.p.w,g.p.h),false,`clear arrival ${def.id} → ${port.to}`);
  seams++;
 }
}
for(const w of worlds)for(const sec of w.sections){
 const def=w.rooms.find(d=>d.id===sec.room);if(def.connector||!R.tapes[def.id])continue;
 enter(w,def.id);const g=view.g,start=g.room.id;
 for(const k of [...expand(R.tapes[def.id]),...Array(40).fill('')]){
  const input=keysToInput(k);view.lastInput=input;PV.holding();Core.step(g,input);
  for(const e of g.events)if(e.type==='exit')PV.exit(view);g.events.length=0;
  if(g.room.id!==start)break;
 }
 assert.equal(g.deaths,0,`authored challenge ${start}`);
 assert.equal(g.room.id,w.sections[w.sections.indexOf(sec)+1]?.room,`authored exit goes directly to the next section: ${start}`);
 const place=CL.place(st.world,g.room.id);
 assert.ok(place,'resulting section is placed');
 assert.equal(Core.solidAt(g,g.p.x,g.p.y,g.p.w,g.p.h),false,`authored arrival ${start} → ${g.room.id}`);
 tapes++;
}
console.log(`${seams} directed seams preserve mouth position, movement, camera framing, and collision clearance; ${tapes} original authored challenge tapes still exit with zero deaths.`);
