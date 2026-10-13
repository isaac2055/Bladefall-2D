import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {Core,runRoom} from '../pcore-tape.mjs';
const root=new URL('../../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
const baseline=JSON.parse(read('docs/room-bank/astra-outskirts-baseline.json'));
for(const [p,hash] of Object.entries(baseline))assert.equal(createHash('sha256').update(read(p)).digest('hex'),hash,`Prior record changed: ${p}`);
const report=[];
for(let n=87;n<=92;n++){
 const p=`scripts/room-bank/fractured/${n}-bank-f${n}.json`,rec=JSON.parse(read(p)),{room,bank,tape}=rec;
 const valid=r=>r.exited&&!r.deaths&&bank.requiredEvents.every(e=>r.events.some(x=>x.type===e))&&Object.entries(bank.requiredEventCounts).every(([e,n])=>r.events.filter(x=>x.type===e).length>=n);
 const r=runRoom([room],0,tape,{trace:true});assert.ok(valid(r),room.id);
 assert.ok(valid(runRoom([room],0,[[24,''],...tape])),`${room.id}: settled checkpoint`);
 assert.ok(room.map.at(-1).includes('.'));assert.equal(room.map.join('').includes('*'),false);
 const variations=[];
 for(let i=0;i<tape.length-2;i++)for(const delta of [-2,2]){
  if(tape[i][0]+delta<1)continue;
  const t=tape.map(x=>[...x]);t[i][0]+=delta;
  if(valid(runRoom([room],0,t)))variations.push({name:`Segment ${i+1} ${delta>0?'+':''}${delta} frames`,tape:t});
 }
 assert.ok(variations.length>=2,`${room.id}: no timing tolerance`);
 if(process.argv.includes('--write')){rec.bank.positiveChecks=variations.slice(0,2);writeFileSync(new URL(p,root),JSON.stringify(rec,null,2)+'\n');}
 for(const s of bank.shortcutChecks)assert.equal(runRoom([room],0,s.tape,{maxExtra:30}).exited,false,s.name);
 report.push({id:room.id,name:room.name,frames:r.exitFrame+1,deaths:r.deaths,timingPerturbationsPassing:variations.length,timingPerturbationsTried:(tape.length-2)*2,events:Object.fromEntries([...new Set(r.events.map(x=>x.type))].map(e=>[e,r.events.filter(x=>x.type===e).length]))});
}
const registry=read('public/bladefall-room-bank.js');
for(const host of ['localhost','127.0.0.1','appassets.bladefall','bladefall.example']){
 const chapters=[]; const context={location:{hostname:host,protocol:'http:',search:'?pitch=bank'},URLSearchParams,BladefallPrecisionRooms:{addPart(p){chapters.push(...p.chapters);}}};vm.runInNewContext(registry,context);
 const ids=context.BladefallRoomBank.records.filter(x=>x.bank.author==='Astra'&&x.bank.batch===22);
 assert.equal(ids.length,host==='bladefall.example'?0:6);
 for(const variant of ['c','d']){const set=chapters.filter(x=>x.bankVariant===variant);assert.equal(set.length,host==='bladefall.example'?0:1);if(set.length){assert.equal(set[0].rooms.length,3);assert.deepEqual(Array.from(set[0].rooms,x=>x.bank.csideSection),[1,2,3]);}}
}
console.log(JSON.stringify(report,null,2));
if(process.argv.includes('--write'))writeFileSync(new URL('docs/room-bank/astra-outskirts-proof.json',root),JSON.stringify({checkedAt:new Date().toISOString(),preservedRecords:Object.keys(baseline).length,scope:'Deterministic core routes, checkpoint starts, input perturbations, basic bypass probes and local host registration. Human difficulty and enjoyment remain unmeasured.',rooms:report},null,2)+'\n');
console.log('PASS: six Astra sections, separate checkpoints, prior records preserved, public exclusion.');
