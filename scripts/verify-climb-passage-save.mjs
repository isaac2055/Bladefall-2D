import './verify-climb-passages.mjs';
import assert from 'node:assert/strict';
import {bootFixture,Core,storage} from './climb-passage-fixture.mjs';
const entries=[...storage],checkpoint=JSON.parse(storage.get('bladefall.climb.atlas.v1')).checkpoint;
const restored=bootFixture(entries,true);
assert.deepEqual(JSON.parse(JSON.stringify(restored.st.atlas.state.checkpoint)),checkpoint);
for(const w of restored.worlds)for(const def of w.rooms.filter(d=>d.atlasTransit?.winch)){
 restored.PV.climb.startWorld(w.n);Core.enterRoom(restored.view.g,restored.R.all.findIndex(r=>r.id===def.id));restored.view.lastInput={};restored.PV.holding();
 assert.ok(restored.view.g.ents.filter(e=>e.type==='stone').every(e=>e.lit));
 assert.ok(restored.view.g.ents.filter(e=>e.type==='gate').every(e=>e.open),`${def.id}: restored shutter`);
}
const legacy=JSON.parse(storage.get('bladefall.climb.v1'));legacy.stakes['cl5-passage-5-6']=[99999];
const migrated=bootFixture(entries.map(([k,v])=>[k,k==='bladefall.climb.v1'?JSON.stringify(legacy):v]),true);
migrated.PV.climb.startWorld(5);Core.enterRoom(migrated.view.g,migrated.R.all.findIndex(r=>r.id==='cl5-passage-5-6'));migrated.view.lastInput={};migrated.PV.holding();
assert.ok(migrated.view.g.ents.filter(e=>e.type==='gate').every(e=>e.open),'old layout winch saves migrate by passage');
console.log('Fresh application state restores passage checkpoint/entry and all shutters; older-layout winches remain open.');
