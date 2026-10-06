import assert from 'node:assert/strict';
import {bootFixture} from './climb-passage-fixture.mjs';
const {ctx,worlds,Core,PV,view,R,st}=bootFixture([],true,true),geo=ctx.BladefallClimb.geography;
let projections=0,ends=0;
for(const w of worlds)for(const def of w.rooms.filter(d=>d.atlasJunction))for(const port of def.atlasSockets.filter(p=>p.folded)){
 const room=geo.rooms.get(def.id);
 const corridor={x:room.x+(port.edge==='left'?-40:room.w),y:room.y+port.floor-6,w:40,h:8};
 const overlaps=geo.query(corridor).filter(r=>!r.def.atlasTerrain&&r.id!==def.id);
 assert.equal(overlaps.length,0,`${def.id} ${port.link}: projected corridor overlaps ${overlaps.map(r=>r.id).join(', ')}`);
 projections++;
}
for(const w of worlds)for(const def of w.rooms.filter(d=>d.atlasFold)){
 const g=Core.createGame([def]);g.walkSeams=def.atlasSockets;
 assert.equal(g.room.h,64,'collision geometry fits the 64px visible passage');
 for(const port of def.atlasSockets){
  const x=port.plane+(port.edge==='left'?-4:-3),floor=port.floor*8;
  assert.equal(Core.solidAt(g,x,floor-11,8,11),false,'walking opening remains clear');
  assert.equal(Core.solidAt(g,x,floor-40,8,8),true,'cannot stand on an invisible apron beyond a mouth');
  ends++;
 }
}
assert.equal(projections,2*ctx.BladefallClimbAtlas.links.length);assert.equal(ends,2*ctx.BladefallClimbAtlas.links.length);   // two mouths per atlas link
for(const w of worlds)for(const section of w.sections)st.atlas.solve(section.room);
let runs=0;
for(const w of worlds)for(const def of w.rooms.filter(d=>d.atlasFold))for(const direction of [-1,1]){
 PV.climb.startWorld(w.n);Core.enterRoom(view.g,R.all.findIndex(d=>d.id===def.id));
 const g=view.g,exit=def.atlasSockets.find(s=>s.edge===(direction<0?'left':'right')),entry=def.atlasSockets.find(s=>s!==exit);
 Object.assign(g.p,{x:entry.plane+(direction>0?12:-20),y:entry.floor*8-g.p.h});
 for(let frame=0;frame<600&&g.room.id===def.id;frame++){
  const input={l:direction<0,r:direction>0,jump:frame%48<18,dash:frame%95===24};
  view.lastInput=input;PV.holding();Core.step(g,input);g.events.length=0;
 }
 assert.equal(g.deaths,0,`${def.id}: jumping/dashing trip`);
 assert.equal(g.room.id,exit.to,`${def.id}: correct destination after full trip`);runs++;
}
assert.equal(runs,2*ctx.BladefallClimbAtlas.links.length);
console.log(`${2*ctx.BladefallClimbAtlas.links.length} projected corridors clear authored rooms; ${2*ctx.BladefallClimbAtlas.links.length} mouth boundaries block decorative aprons; ${2*ctx.BladefallClimbAtlas.links.length} full trips with repeated jumps and dashes arrive correctly without deaths.`);
