// This request's decisions and untouched sources, independent of the generated catalog.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const baseline=read('docs/room-bank/run-4-baseline.json').sha256;
const allowed=new Set(['bank-f30','bank-f31','bank-f32','bank-f33','bank-b36','bank-b37','bank-b38','bank-b39','bank-f35','bank-f39','bank-f40']);
let preserved=0;for(const [file,hash]of Object.entries(baseline)){
 if(!/^scripts\/room-bank\/(base|fractured)\/.+\.json$/.test(file))continue;
 const id=file.match(/bank-[bf]\d+/)[0];if(allowed.has(id))continue;
 assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash,file+' untouched');preserved++;
}
assert.equal(preserved,47);
for(const file of ['docs/design/SURVIVE-TECH-REPORT.md','docs/design/SURVIVE-ENTITY-REPORT.md'])assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),baseline[file],file+' preserved');
const records=['base','fractured'].flatMap(side=>fs.readdirSync(path.join(root,'scripts/room-bank',side)).filter(f=>f.endsWith('.json')).map(f=>read('scripts/room-bank/'+side+'/'+f))),byId=new Map(records.map(x=>[x.room.id,x]));
for(const [id,side]of [['bank-f30','fractured'],['bank-f33','fractured'],['bank-b36','base'],['bank-b38','base'],['bank-b39','base'],['bank-f35','base'],['bank-f39','base'],['bank-f40','fractured']]){const x=byId.get(id);assert.equal(x.bank.acceptance,'banked',id);assert.equal(x.bank.side,side,id);}
for(const id of ['bank-f31','bank-f32','bank-b37'])assert.equal(byId.get(id).bank.acceptance,'revised',id);
assert.equal(records.length,66);assert.equal(records.filter(x=>x.bank.acceptance==='banked').length,40);
for(const side of ['base','fractured'])assert.equal(records.filter(x=>x.bank.run===4&&x.bank.side===side&&x.bank.acceptance==='candidate').length,4);
assert.ok(!records.some(x=>x.bank.run===5),'Run 5 remains unstarted');
console.log('PASS: 8 approvals, 2 Base transfers, 3 re-review rooms, 4+4 Run4 candidates; 47 earlier sources and both design reports unchanged.');
