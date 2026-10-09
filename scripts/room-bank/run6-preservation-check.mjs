// Run 6 adds new rooms; previous review and banking decisions remain unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const baseline=read('docs/room-bank/run-6-baseline.json').sha256;
let preserved=0;
for(const [file,digest]of Object.entries(baseline))if(/^scripts\/room-bank\/(base|fractured)\/.+\.json$/.test(file)){
 assert.equal(hash(file),digest,file+' previous room unchanged');
 assert.equal(hash(file.replace('scripts/room-bank/','scripts/room-bank/archive/before-run6/')),digest,file+' archived original');preserved++;
}
assert.equal(preserved,78);
const records=['base','fractured'].flatMap(side=>fs.readdirSync(path.join(root,'scripts/room-bank',side)).filter(f=>f.endsWith('.json')).map(f=>read('scripts/room-bank/'+side+'/'+f)));
assert.equal(records.length,86);assert.equal(records.filter(x=>x.bank.acceptance==='banked').length,46);
const fresh=records.filter(x=>x.bank.run===6);
assert.deepEqual(fresh.map(x=>x.room.id).sort(),['bank-b50','bank-b51','bank-b52','bank-b53','bank-f51','bank-f52','bank-f53','bank-f54']);
for(const x of fresh){assert.equal(x.bank.acceptance,'candidate');assert.equal(x.bank.status,'route-proven');assert.equal(x.bank.collection,'run6');}
for(const side of ['base','fractured'])for(const format of ['compact','superroom'])assert.equal(fresh.filter(x=>x.bank.side===side&&x.bank.format===format).length,2);
const supers=records.filter(x=>x.bank.collection==='superrooms');
assert.deepEqual(supers.map(x=>x.room.id).sort(),['bank-b44','bank-b45','bank-f45','bank-f46']);assert.ok(supers.every(x=>x.bank.acceptance==='candidate'));
assert.equal(records.filter(x=>x.bank.run===5&&x.bank.acceptance==='candidate').length,8);
const changedPublic=new Set(['public/index.html','public/precision.html','public/sw.js','public/bladefall-room-bank.js','public/bladefall-room-bank-view.js']);
let runtime=0;
for(const [file,digest]of Object.entries(baseline))if(file.startsWith('public/')&&!changedPublic.has(file)){assert.equal(hash(file),digest,file+' outside Run 6 runtime scope');runtime++;}
for(const file of ['docs/design/SURVIVE-TECH-REPORT.md','docs/design/SURVIVE-ENTITY-REPORT.md','LLM-HANDOFF/locks/climb-15-20.json'])assert.equal(hash(file),baseline[file],file+' preserved');
console.log(`PASS: all 78 earlier records preserved; 46 banked; Run 5 and prior Superrooms still in review; Run 6 balanced 4+4 with 2 compact/2 super per side; ${runtime} unrelated public files and both reports/world lock unchanged.`);
