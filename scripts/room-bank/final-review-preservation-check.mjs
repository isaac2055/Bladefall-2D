import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {records} from './register.mjs';
import {catalog,assertBatch} from './catalog.mjs';
const old=['base','fractured'].flatMap(side=>readdirSync(`scripts/room-bank/archive/before-final-review-7.302/${side}`).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync(`scripts/room-bank/archive/before-final-review-7.302/${side}/${f}`))));
const previous=new Map(old.map(r=>[r.room.id,r]));
const revised=['bank-b24','bank-b58','bank-b59','bank-b60','bank-f24','bank-f25','bank-f32','bank-f45','bank-f59'];
assert.equal(records.length,98);assert.equal(previous.size,99);assert.equal(records.some(r=>r.room.id==='bank-f62'),false);
assert.deepEqual(records.filter(r=>r.bank.acceptance!=='banked').map(r=>r.room.id).sort(),revised.sort());
let unchangedApprovals=0,unchangedGeometry=0;
for(const r of records){const p=previous.get(r.room.id);assert.ok(p,'no unsolicited new IDs');if(!revised.includes(r.room.id)){assert.deepEqual(r.room,p.room,r.room.id+' approved geometry');assert.deepEqual(r.tape,p.tape,r.room.id+' approved route');unchangedGeometry++;}if(p.bank.acceptance==='banked'){assert.deepEqual(r,p,r.room.id+' earlier approval untouched');unchangedApprovals++;}}
assert.equal(unchangedGeometry,89);assert.equal(unchangedApprovals,50);assertBatch(records);
const baseline=JSON.parse(readFileSync('docs/room-bank/final-review-7.302-baseline.json')).sha256;
assert.equal(createHash('sha256').update(readFileSync('wrangler.worker.jsonc')).digest('hex'),baseline['wrangler.jsonc'],'Worker backend configuration preserved exactly');
const allowed=new Set(['wrangler.jsonc','public/index.html','public/precision.html','public/sw.js','public/bladefall-room-bank.js','public/bladefall-room-bank-view.js','public/bladefall-pcore-dev-sweeper.js','public/bladefall-pcore-dev-sweeper-view.js','public/bladefall-pcore-dev-spent-thorn.js','public/bladefall-pcore-dev-spent-thorn-view.js','public/bladefall-playtest.js']);
let runtimeUnchanged=0,changed=[];for(const [p,h]of Object.entries(baseline).filter(([p])=>!p.startsWith('scripts/room-bank/'))){const actual=createHash('sha256').update(readFileSync(p)).digest('hex');if(actual!==h){assert.ok(allowed.has(p),'unrelated runtime changed: '+p);changed.push(p);}else runtimeUnchanged++;}
const counts=Object.fromEntries(['base','fractured'].map(side=>[side,{all:records.filter(r=>r.bank.side===side).length,banked:records.filter(r=>r.bank.side===side&&r.bank.acceptance==='banked').length,review:records.filter(r=>r.bank.side===side&&r.bank.acceptance==='revised').length}]));
const result={version:catalog.version,unchangedPriorApprovals:unchangedApprovals,approvedGeometryAndTapesPreserved:unchangedGeometry,removed:['bank-f62'],revised,counts,runtimeUnchanged,expectedChangedRuntime:changed};
if(process.argv.includes('--write'))writeFileSync('docs/room-bank/final-review-7.302-preservation.json',JSON.stringify(result,null,2)+'\n');
console.log('PASS: 89 approved definitions/routes, 50 prior approval records, only nine revisions, no extra IDs, campaign/checkpoints/other runtime preserved.');
