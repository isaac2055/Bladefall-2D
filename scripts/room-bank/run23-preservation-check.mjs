// Verify user approvals/transfers independently of generated menu counts and route success.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../..',import.meta.url))),here=path.join(root,'scripts/room-bank');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const collect=base=>['base','fractured'].flatMap(side=>fs.readdirSync(path.join(base,side)).filter(f=>f.endsWith('.json')).map(f=>read(path.join(base,side,f))));
const originals=collect(path.join(here,'archive/runs-2-3-before-review')),current=collect(here),byId=new Map(current.map(x=>[x.room.id,x]));
const revised=new Set(['bank-f30','bank-f31','bank-f32','bank-f33','bank-b36','bank-b37','bank-b38','bank-f35']);
const approved=new Set(['bank-b26','bank-b31','bank-b32','bank-b33','bank-b34','bank-f34','bank-b35','bank-f36','bank-f37','bank-f38']);
const moved=new Set(['bank-f37','bank-f38']);
assert.equal(originals.length,55);assert.equal(current.length,58);
let unchanged=0;
for(const old of originals){
 const id=old.room.id,x=byId.get(id);assert.ok(x,id+' preserved');
 if(!revised.has(id)){assert.deepEqual(x.room,old.room,id+' definition');assert.deepEqual(x.tape,old.tape,id+' tape');unchanged++;}
 else{assert.equal(x.bank.acceptance,'revised',id+' awaits approval');assert.equal(x.bank.batch,8);assert.equal(x.bank.run,old.bank.run,id+' keeps original run');}
 if(approved.has(id)){assert.equal(x.bank.acceptance,'banked',id+' approved');assert.equal(x.bank.side,moved.has(id)?'base':old.bank.side);}
 else if(!revised.has(id))assert.deepEqual(x,old,id+' unrelated metadata unchanged');
 if(old.bank.acceptance==='banked')assert.equal(x.bank.acceptance,'banked',id+' retains prior approval');
}
assert.equal(unchanged,47);
for(const [id,side,parent]of [['bank-b39','base','bank-f35'],['bank-f39','fractured','bank-f37'],['bank-f40','fractured','bank-f38']]){
 const x=byId.get(id);assert.ok(x);assert.equal(x.bank.side,side);assert.equal(x.bank.acceptance,'candidate');assert.equal(x.bank.companionOf,parent);assert.equal(x.bank.run,3);
}
assert.ok(current.every(x=>x.bank.run!==4),'Run4 not built');
const baseline=read(path.join(root,'docs/room-bank/run-2-3-review-baseline.json')).sha256;
for(const file of ['public/bladefall-pcore.js','docs/design/SURVIVE-TECH-REPORT.md','docs/design/SURVIVE-ENTITY-REPORT.md','LLM-HANDOFF/locks/climb-15-20.json'])assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),baseline[file],file+' unchanged');
const counts=Object.fromEntries(['base','fractured'].map(side=>[side,current.filter(x=>x.bank.side===side&&x.bank.acceptance==='banked').length]));assert.deepEqual(counts,{base:19,fractured:13});
console.log('PASS: 10 approvals, 2 Base transfers, 8 revisions, 3 separate candidates; 47 prior room definitions/tapes unchanged; reports/core/world lock preserved.');
