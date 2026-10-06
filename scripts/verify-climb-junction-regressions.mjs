import assert from 'node:assert/strict';
import {bootFixture} from './climb-passage-fixture.mjs';
const geography=process.argv.includes('--geography');
const {ctx,PV,st,view,Core,R,worlds}=bootFixture([],false,geography);
let ports=0;
for(const w of worlds)for(const d of w.rooms.filter(d=>d.atlasJunction)){
 PV.climb.startWorld(w.n);Core.enterRoom(view.g,R.all.findIndex(r=>r.id===d.id));
 const baseline=JSON.stringify(PV.climb.portViews(view.g));
 assert.equal(PV.climb.portViews(view.g).length,d.atlasSockets.length,'all entrances shown together');
 for(let y=-40;y<view.g.room.h+40;y+=7){view.g.p.y=y;assert.equal(JSON.stringify(PV.climb.portViews(view.g)),baseline,`${d.id}: jumping replaced a destination`);}
 for(const p of PV.climb.portViews(view.g)){
  assert.ok(p.viewTop<=p.floor*8-11&&p.viewBottom>=p.floor*8,`${d.id}: complete walking aperture remains visible`);ports++;
 }
}
// Existing progress must not fight pressure-plate mechanics on each tick.
PV.climb.startWorld(1);const id=worlds[0].atlasEnd,idx=R.all.findIndex(d=>d.id===id);
st.atlas.solve(id);
for(let visit=0;visit<3;visit++){
 Core.enterRoom(view.g,idx);let noise=0;
 for(let f=0;f<600;f++){view.lastInput={};PV.holding();Core.step(view.g,{});noise+=view.g.events.filter(e=>e.type==='held-close'||e.type==='held-open').length;view.g.events.length=0;}
 assert.equal(noise,0,'cleared Gatehouse generates no repeating gate sound');
 assert.ok(view.g.ents.filter(e=>e.type==='held').every(e=>e.latchedOpen&&!e.solid));
}
// A new puzzle still opens and closes its pressure gate normally.
const fresh=Core.createGame([R.all[idx]]),gate=fresh.ents.find(e=>e.type==='held');
assert.ok(gate&&!gate.latchedOpen);gate.solid=false;Core.step(fresh,{});
assert.ok(gate.solid);assert.equal(fresh.events.filter(e=>e.type==='held-close').length,1);
console.log(`${geography?'Shared geography: ':''}${ports} junction apertures stay visible at every height. Three 10-second cleared Gatehouse visits are silent; uncleared pressure gates still close normally.`);
