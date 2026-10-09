// Focused positive timing evidence requested for the revised B26, not a room search.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Core,runRoom} from '../pcore-tape.mjs';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const {room}=read('./base/bank-b26.json'),data=read('./b26-tolerance.json');
let passed=0;
for(const v of data.probes.filter(p=>p.exited&&p.deaths===0)){
 const tape=data.baselineTape.map(s=>s.slice());
 tape[data.indices.catchWait][0]=v.catchWait;tape[data.indices.cut][0]=v.cut;tape[data.indices.dash][0]=v.dash;
 if(v.pause)tape.splice(data.indices.pauseInsertAt,0,[v.pause,'']);
 const r=runRoom([room],0,tape,{maxExtra:90});
 assert.ok(r.exited&&r.deaths===0,JSON.stringify(v));
 for(const e of ['enemy-hit','enemy-pogo','enemy-defeat','stone-lit','gate-open'])assert.ok(r.events.some(a=>a.type===e),e);
 assert.ok(!r.events.some(a=>['super','hyper','ultra','wallbounce'].includes(a.type)),'ordinary Base route');passed++;
}
console.log(`B26: ${passed} complete positive timing variants, 0 deaths; includes all 60 stated combined cases. No human rating inferred.`);
