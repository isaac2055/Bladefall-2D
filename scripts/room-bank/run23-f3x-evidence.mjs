// Focused regression evidence for the human-reported Run 2 bypasses.
// Reads archived and current records; never changes geometry or score data.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {runRoom} from '../pcore-tape.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const load=(path)=>JSON.parse(readFileSync(resolve(here,path),'utf8'));
const cases=[
 {id:31,tape:[[1,'rs'],[40,'l'],[12,'lux'],[36,'l'],[1,'ls'],[1,''],[12,'rj'],[12,'rux'],[120,'r']]},
 {id:32,tape:[[1,'rs'],[11,'l'],[9,'lj'],[12,'lx'],[19,'l'],[28,'r'],[170,'l']]}
];
for(const {id,tape} of cases){
 const filename=`fractured/${id}-bank-f${id}.json`;
 const previous=load('archive/runs-2-3-before-review/'+filename),current=load(filename);
 const before=runRoom([previous.room],0,tape),after=runRoom([current.room],0,tape);
 assert.ok(before.exited&&before.deaths===0,`F${id}: archived boring route must complete`);
 assert.ok(!before.events.some(e=>['super','hyper','wallbounce'].includes(e.type)),`F${id}: archived route must use no advanced technique`);
 assert.ok(!after.exited,`F${id}: same reported bypass must fail after revision`);
 console.log(`F${id}: ordinary bypass completed original in ${before.exitFrame+1} frames; revised room rejects it.`);
}
const d=load('fractured/33-bank-f33.json'),r=runRoom([d.room],0,d.tape);
assert.ok(r.exited&&r.deaths===0,'F33: replacement route completes');
assert.equal(d.room.jailers[0].keys,false,'F33: enemy death is not an automatic gate key');
const cut=r.events.find(e=>e.type==='jailer-fell'),light=r.events.find(e=>e.type==='stone-lit');
assert.ok(cut&&light?.beam&&light.i>cut.i,'F33: the lethal cut must open the beam path to the tally');
assert.ok(!r.events.some(e=>e.type==='wallbounce'),'F33: replacement is not another wallbounce route');
console.log('F33: shield removal causes beam-tally activation; no wallbounce or technique-name gate.');
// Independent review caught a second bypass in the first revision: prepare an ordinary
// forward hyper on recoverable ground. Keep that intermediate geometry as before evidence.
for(const fixture of load('run23-f3x-before-commitment.json').rooms){
 const before=runRoom([fixture.room],0,fixture.tape);
 const id=fixture.id.replace('bank-f',''),current=load(`fractured/${id}-bank-f${id}.json`);
 const after=runRoom([current.room],0,fixture.tape);
 assert.ok(before.exited&&before.deaths===0,`${fixture.id}: forward-hyper before proof`);
 assert.ok(before.events.some(e=>e.type==='hyper')&&!before.events.some(e=>e.type==='reverse-hyper'),`${fixture.id}: before route must omit reversal`);
 assert.ok(!after.exited,`${fixture.id}: forward-hyper bypass must fail after the physical commitment fix`);
 assert.ok(after.events.some(e=>e.type==='death'&&e.cause==='light'),`${fixture.id}: the departure beam must physically stop walking into range`);
 console.log(`${fixture.id}: independent forward-hyper bypass completed before in ${before.exitFrame+1} frames; repaired departure beam rejects it.`);
}
console.log('PASS: focused Run 2 feedback evidence. Human ratings remain unmeasured.');
