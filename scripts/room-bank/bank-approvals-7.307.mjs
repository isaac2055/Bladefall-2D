// Apply only after the first 7.307 deployment, keeping new-finales delivery first.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const approved=['bank-b62','bank-b67','bank-b68','bank-b69','bank-b70','bank-b71','bank-f68','bank-f70','bank-f72'];
const fresh=['bank-b72','bank-b73','bank-b74','bank-b75','bank-b76','bank-f73','bank-f74','bank-f75','bank-f76','bank-f77'];
const path=id=>`scripts/room-bank/${id[5]==='b'?'base':'fractured'}/${id}.json`;
if(!process.argv.includes('--after-deployment')){console.log('Prepared only. After the first deployment is confirmed, rerun with --after-deployment.');process.exit(0);}
for(const id of fresh){const r=read(path(id));assert.equal(r.bank.status,'route-proven',id+': save/prove the new finale before applying older approvals');assert(r.tape.length);}
for(const id of approved){const p=path(id),r=read(p);r.bank.acceptance='banked';r.bank.needsReview=false;r.bank.humanReview='Approved by the user after the 7.306 review; numeric fun and suitability ratings remain unmeasured.';if(id==='bank-f72'){r.bank.difficulty=5;r.bank.humanReview+=' User rated difficulty 5/5.';}writeFileSync(p,JSON.stringify(r,null,2)+'\n');}
const catalog=read('scripts/room-bank/catalog.json'),records=['base','fractured'].flatMap(side=>readdirSync('scripts/room-bank/'+side).filter(f=>f.endsWith('.json')).map(f=>read(`scripts/room-bank/${side}/${f}`)));
catalog.banked=records.filter(r=>r.bank.acceptance==='banked').map(r=>r.room.id);catalog.revised=records.filter(r=>r.bank.acceptance==='revised').map(r=>r.room.id);writeFileSync('scripts/room-bank/catalog.json',JSON.stringify(catalog,null,2)+'\n');
console.log('Banked nine approved prior finales; F72 difficulty 5/5. F64/F69/F71 unchanged. Rebuild the room bank now.');
