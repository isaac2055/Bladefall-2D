// Review decisions and preservation independently checked against the before-edit archive.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const baseline=read('docs/room-bank/superrooms-baseline.json').sha256;
const approved={ 'bank-f31':'fractured','bank-b40':'fractured','bank-b43':'base','bank-f41':'base','bank-f42':'fractured','bank-f43':'fractured','bank-f44':'base' };
const revised=['bank-f32','bank-f35','bank-b41','bank-b42'];
const records=['base','fractured'].flatMap(side=>fs.readdirSync(path.join(root,'scripts/room-bank',side)).filter(f=>f.endsWith('.json')).map(f=>read('scripts/room-bank/'+side+'/'+f)));
const byId=new Map(records.map(x=>[x.room.id,x]));
let untouched=0,archived=0;
for(const [file,digest]of Object.entries(baseline)){
 if(!/^scripts\/room-bank\/(base|fractured)\/.+\.json$/.test(file))continue;
 const archive=file.replace('scripts/room-bank/','scripts/room-bank/archive/run4-before-superrooms/');
 assert.equal(hash(archive),digest,archive+' exact original');archived++;
 const old=read(archive),id=old.room.id,current=byId.get(id);assert.ok(current,id+' retained');
 if(revised.includes(id))continue;
 if(id in approved){assert.deepEqual(current.room,old.room,id+' approved geometry unchanged');assert.deepEqual(current.tape,old.tape,id+' approved route unchanged');}
 else{assert.deepEqual(current,old,id+' untouched source');untouched++;}
}
assert.equal(archived,66);assert.equal(untouched,55);
for(const [id,side]of Object.entries(approved)){const b=byId.get(id).bank;assert.equal(b.acceptance,'banked',id);assert.equal(b.side,side,id);}
for(const id of revised)assert.equal(byId.get(id).bank.acceptance,'revised',id);
assert.equal(byId.get('bank-f35').bank.side,'base');
assert.equal(records.length,70);assert.equal(records.filter(x=>x.bank.acceptance==='banked').length,46);
for(const side of ['base','fractured'])assert.equal(records.filter(x=>x.bank.collection==='superrooms'&&x.bank.side===side).length,2);
assert.ok(!records.some(x=>x.bank.run===5),'Run 5 remains unbuilt');
const changedPublic=new Set(['public/index.html','public/precision.html','public/sw.js','public/bladefall-room-bank.js','public/bladefall-room-bank-view.js',
 'public/bladefall-pcore-dev-hook.js','public/bladefall-pcore-dev-moving-hook.js','public/bladefall-pcore-dev-beam.js','public/bladefall-pcore-portals.js',
 'public/bladefall-pcore-view.js','public/bladefall-pcore-combat.js','public/bladefall-pcore-foes.js','public/bladefall-pcore-dev-foundry.js','public/bladefall-pcore-dev-foundry-view.js']);
let runtime=0;
for(const [file,digest]of Object.entries(baseline))if(file.startsWith('public/')&&!changedPublic.has(file)){assert.equal(hash(file),digest,file+' outside scoped runtime changes');runtime++;}
for(const file of ['docs/design/SURVIVE-TECH-REPORT.md','docs/design/SURVIVE-ENTITY-REPORT.md','LLM-HANDOFF/locks/climb-15-20.json'])assert.equal(hash(file),baseline[file],file+' preserved');
console.log(`PASS: 7 approvals, 3 side transfers, 4 revisions, 2+2 superrooms; 66 originals archived; 55 untouched records; ${runtime} unchanged public files; reports/world lock preserved; Run 5 unbuilt.`);
