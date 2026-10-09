// One deterministic completion per saved candidate, plus the batch's content constraints.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {records} from './register.mjs';
import {assertBatch,catalog} from './catalog.mjs';
import {Core,runRoom} from '../pcore-tape.mjs';
const selected=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const set=records.filter(x=>(!selected.length||selected.includes(x.room.id))&&x.bank.status==='route-proven');
const report=[];
for(const {room,bank,tape} of set){
 const r=runRoom([room],0,tape,{trace:true,maxExtra:30});
 assert.equal(r.exited,true,`${room.id}: no exit`);assert.equal(r.deaths,0,`${room.id}: route dies`);
 const events=r.events.map(e=>e.type),counts=Object.fromEntries([...new Set(events)].map(k=>[k,events.filter(e=>e===k).length]));
 for(const e of bank.requiredEvents||[])assert.ok(events.includes(e),`${room.id}: intended ${e} unused`);
 for(const [e,n] of Object.entries(bank.requiredEventCounts||{}))assert.ok((counts[e]||0)>=n,`${room.id}: needs ${n} ${e} events`);
 for(const label of bank.requiredRelayLabels||[])assert.ok(r.events.some(e=>e.type==='step-relay'&&e.label===label),`${room.id}: relay ${label} unused`);
 if(bank.side==='base'&&!catalog.baseMovementExceptions?.includes(room.id))assert.ok(!events.some(e=>['super','hyper','ultra','wallbounce'].includes(e)),`${room.id}: advanced momentum in base route`);
 if(bank.newMechanics.includes('vector-refill'))assert.ok(events.includes('vector-refill'),`${room.id}: directional crystal unused`);
 if(bank.newMechanics.includes('cargo-clasp'))assert.ok(events.includes('clasp-catch'),`${room.id}: clasp unused`);
 if(bank.newMechanics.includes('hinge-arm'))assert.ok(events.includes('hinge-turn'),`${room.id}: hinged arm unused`);
 if(bank.newMechanics.includes('step-relay'))assert.ok(events.includes('step-relay'),`${room.id}: new mechanic unused`);
 // All run-time machinery should reset with the room, and the recorded start must be reproducible.
 const first=Core.createGame([room],{room:0});assert.equal(first.p.state,'normal');
 const skips=[...(bank.shortcutChecks||[]),...(bank.review?.bypassBefore?.tape?[{name:'Reported shortcut',tape:bank.review.bypassBefore.tape}]:[])];
 for(const skip of skips){const a=runRoom([room],0,skip.tape,{maxExtra:30});assert.equal(a.exited,false,`${room.id}: ${skip.name} still exits`);}
 for(const variation of bank.positiveChecks||[]){const a=runRoom([room],0,variation.tape,{maxExtra:30});assert.equal(a.exited,true,`${room.id}: positive variation ${variation.name} fails`);assert.equal(a.deaths,0,`${room.id}: positive variation ${variation.name} dies`);for(const e of variation.requiredEvents||bank.requiredEvents||[])assert.ok(a.events.some(x=>x.type===e),`${room.id}: positive variation ${variation.name} omits ${e}`);}
 const row={acceptance:bank.acceptance||'candidate',shortcutChecks:skips.length,positiveChecks:(bank.positiveChecks||[]).length,id:room.id,name:room.name,side:bank.side,estimatedDifficulty:bank.difficulty,frames:r.exitFrame+1,deaths:r.deaths,events:counts};report.push(row);
 console.log(`${room.id} ${room.name}: ${row.frames} frames, 0 deaths${counts['step-relay']?' · relay ×'+counts['step-relay']:''}`);
}
if(!selected.length){
 assertBatch(set);
 if(process.argv.includes('--write'))writeFileSync(resolve(dirname(fileURLToPath(import.meta.url)),'../../docs/room-bank/route-report.json'),JSON.stringify({checkedAt:new Date().toISOString(),kind:'One saved zero-death route per room; human fun/difficulty/suitability unmeasured',rooms:report},null,2)+'\n');
}
console.log(`PASS: ${set.length} active room routes. Player ratings are still pending.`);
