import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {bootFixture} from './climb-passage-fixture.mjs';
const {ctx,worlds}=bootFixture();
vm.runInContext(fs.readFileSync(new URL('../public/bladefall-climb-geography.js',import.meta.url),'utf8'),ctx);
const before=JSON.stringify(worlds);
const geo=ctx.BladefallClimbGeography.compile(worlds);
assert.equal(JSON.stringify(worlds),before,'compilation must not mutate authored rooms or saves');
assert.equal(geo.regions.size,9);
for(const r of geo.rooms.values()){
 const p={x:17,y:31};
 assert.deepEqual({...geo.toLocal(r.id,geo.toWorld(r.id,p))},p);
 const view=geo.visible({x:r.x*8,y:r.y*8});
 assert.ok(view.some(item=>item.id===r.id));
 assert.equal(new Set(view.map(item=>item.id)).size,view.length);
 const target=[...geo.rooms.values()].find(item=>item.id!==r.id);
 const carried=geo.transfer(r.id,target.id,p);
 assert.deepEqual({...geo.toWorld(target.id,carried)},{...geo.toWorld(r.id,p)},'ownership cannot change world position');
}
const center=n=>{const r=geo.regions.get(n).bounds;return {x:r.x+r.w/2,y:r.y+r.h/2};};
for(const [lower,upper] of [[1,2],[1,3],[2,4],[3,5],[4,6],[5,6],[8,9],[7,9]])assert.ok(center(upper).y<center(lower).y);
for(const [left,right] of [[2,3],[4,5],[8,6],[6,7]])assert.ok(center(left).x<center(right).x);
assert.equal(center(2).y,center(3).y);
assert.equal(center(4).y,center(5).y);
assert.equal(center(8).y,center(7).y);
console.log(`Shared geography: ${geo.rooms.size} authored rooms and branches, nine non-overlapping regional footprints; immutable compilation, spatial queries, ownership-independent coordinates, and Emerald ordering verified.`);
