import assert from 'node:assert/strict';
import {bootFixture} from './climb-passage-fixture.mjs';
const f=bootFixture(),{worlds,ctx}=f,built=ctx.BladefallClimbGeographyBuild.build(worlds);
let joins=0,retired=0;
for(const before of worlds){
 const after=built.worlds.find(w=>w.n===before.n),main=w=>w.sections.filter(s=>!w.rooms.find(d=>d.id===s.room).connector);
 const old=main(before),now=main(after);
 assert.deepEqual(now.map(s=>s.room),old.map(s=>s.room),'identical original challenge order');
 assert.deepEqual(after.sections.map(s=>s.room),before.sections.map(s=>s.room),'no internal additions');
 const dx=now[0].x-old[0].x,dy=now[0].y-old[0].y;
 for(let i=0;i<old.length;i++){
  assert.equal(now[i].x-old[i].x,dx,`intact world x ${now[i].room}`);
  assert.equal(now[i].y-old[i].y,dy,`intact world y ${now[i].room}`);
  const a=after.rooms.find(d=>d.id===now[i].room),b=before.rooms.find(d=>d.id===old[i].room);
  assert.deepEqual(a.map,b.map);assert.equal(a.exit,b.exit);
  assert.ok(!(a.atlasSockets||[]).some(s=>s.to.includes('-turn-')));
  if(i)joins++;
 }
 for(const [id,to] of Object.entries(after.retiredPassages)){
  const a=ctx.BladefallClimbAtlas.create(built.worlds,{version:1,checkpoint:{world:after.n,room:id}});
  assert.equal(a.state.checkpoint.room,to);assert.ok(now.some(s=>s.room===to));retired++;
 }
}
assert.equal(built.passages.length,ctx.BladefallClimbAtlas.links.length);   // one passage per atlas link (12 for the inner nine; more as the crown is added)
for(const p of built.passages){assert.notEqual(p.def.atlasTransit.a,p.def.atlasTransit.b);assert.ok(!p.def.id.includes('-turn-'));}
console.log(`Nine intact original worlds, ${joins} direct challenge joins, ${ctx.BladefallClimbAtlas.links.length} interworld passages, ${retired} retired checkpoints recover into original sections.`);
