import assert from 'node:assert/strict';
import {bootFixture} from './climb-passage-fixture.mjs';
const f=bootFixture([],true,true),{ctx,Core,worlds,view,PV,st,R}=f;
const elements=new Map(),element=id=>{if(!elements.has(id))elements.set(id,{getAttribute:()=>'',setAttribute(){}});return elements.get(id);};
ctx.document={getElementById:element,querySelector:element,querySelectorAll:()=>[]};
st.api.showOverlay=()=>{};st.api.hideOverlay=()=>{};
st.review=false;
let count=0;
for(const w of worlds)for(const d of w.rooms.filter(d=>d.atlasTerrain))for(const port of d.atlasSockets){
 const checkpoint={world:w.n,room:d.id,via:null,entry:port.edge};
 st.atlas.state.checkpoint=checkpoint;view.g=null;PV.menu();element('clContinue').onclick();
 assert.equal(view.g.room.id,d.id);assert.equal(st.world.n,w.n);
 assert.equal(view.g.p.x,port.plane+(port.edge==='left'?32:-40));assert.equal(view.g.p.y+view.g.p.h,port.floor*8);
 assert.ok(!Core.solidAt(view.g,view.g.p.x,view.g.p.y,view.g.p.w,view.g.p.h),`clear resume ${d.id} ${port.edge}`);
 assert.equal(st.atlas.state.checkpoint.entry,port.edge);count++;
}
const restored=bootFixture([...f.storage],true,true);
assert.deepEqual(JSON.parse(JSON.stringify(restored.st.atlas.state.checkpoint)),JSON.parse(JSON.stringify(st.atlas.state.checkpoint)));
const legacy=bootFixture([],true,false);
for(const w of legacy.worlds)for(const d of w.rooms)assert.ok(R.all.some(r=>r.id===d.id),`legacy room retained ${d.id}`);
console.log(`${count} passage entry checkpoints resume through the actual Continue action at clear mouth positions; fresh saves and all legacy room IDs remain valid.`);
