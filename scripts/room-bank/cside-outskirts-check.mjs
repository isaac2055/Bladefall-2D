// Outskirts C-side review: route feasibility, recorded timing/shortcut cases,
// local-only registration, separate three-room sets, and legacy preservation.
// --search additionally explores bounded independent bypass policies.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import {records} from './register.mjs';
import {runRoom,Rooms} from '../pcore-tape.mjs';
import {beam,ACT,defaultKey} from '../pcore-search.mjs';
const root=new URL('../../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
const candidates=records.filter(x=>x.bank.collection==='csides');
assert.equal(candidates.length,6);
const report={kind:'Recorded zero-death routes and specific probes; human difficulty and fun remain unmeasured. Bounded searches are not an exhaustive proof.',rooms:[],registration:[],searches:[]};
for(const variant of ['a','b']){
 const set=candidates.filter(x=>x.bank.csideVariant===variant).sort((a,b)=>a.bank.csideSection-b.bank.csideSection);
 assert.deepEqual(set.map(x=>x.bank.csideSection),[1,2,3]);
 for(const x of set){
  assert.equal(x.bank.cside,1);assert.deepEqual(x.bank.worlds,[1,21]);
  assert.equal(x.bank.localOnly,true);assert.equal(x.bank.needsReview,true);assert.equal(x.bank.acceptance,'candidate');
  assert.ok(x.room.map.at(-1).includes('.'),'real open void below the challenge');
  assert.ok(!x.room.map.join('').includes('*'),'no hearts');
  assert.equal(x.room.movement,'survive-2');
  const r=runRoom([x.room],0,x.tape);assert.ok(r.exited);assert.equal(r.deaths,0);
  const settled=runRoom([x.room],0,[[16,''],...x.tape]);assert.ok(settled.exited);assert.equal(settled.deaths,0,'route also starts from a settled fire');
  for(const e of x.bank.requiredEvents)assert.ok(r.events.some(v=>v.type===e),`${x.room.id}: ${e}`);
  for(const [e,n]of Object.entries(x.bank.requiredEventCounts))assert.ok(r.events.filter(v=>v.type===e).length>=n);
  assert.ok(x.bank.positiveChecks.length>=2);assert.ok(x.bank.shortcutChecks.length>=3);
  for(const p of x.bank.positiveChecks){const r=runRoom([x.room],0,p.tape,{maxExtra:30});assert.ok(r.exited,p.name);assert.equal(r.deaths,0,p.name);}
  for(const p of x.bank.shortcutChecks)assert.equal(runRoom([x.room],0,p.tape,{maxExtra:30}).exited,false,p.name);
  report.rooms.push({id:x.room.id,variant,section:x.bank.csideSection,frames:r.exitFrame+1,deaths:0,positiveCases:x.bank.positiveChecks.map(p=>p.name),failedShortcutCases:x.bank.shortcutChecks.map(p=>p.name)});
 }
 assert.ok(set.at(-1).room.sentinel,'native Sentinel finale');
}
const bankSource=read('public/bladefall-room-bank.js');
const indexSource=read('public/index.html');
const offline=indexSource.match(/function offlineApp\(\)\{[^\n]+\}/)[0];
for(const [hostname,protocol,local]of [['localhost','http:',true],['127.0.0.1','http:',true],['[::1]','http:',true],['play.localhost','http:',true],['appassets.bladefall','https:',true],['','file:',true],['bladefall.pages.dev','https:',false],['localhost.example.com','https:',false]]){
 const chapters=[];const scope={location:{hostname,protocol,search:'?pitch=bank'},URLSearchParams,BladefallPrecisionRooms:{addPart:p=>chapters.push(...p.chapters)}};
 runInNewContext(bankSource,scope);
 assert.equal(scope.BladefallRoomBank.records.filter(x=>x.bank.collection==='csides').length,local?6:0);
 assert.equal(scope.BladefallRoomBank.groups.includes('csides'),local);
 assert.equal(runInNewContext(offline+';offlineApp()',scope),local,'Extras visibility on '+hostname);
 const sets=chapters.filter(c=>c.bankGroup==='csides');assert.equal(sets.length,local?2:0);
 if(local)for(const c of sets){assert.equal(c.rooms.length,3);assert.ok(c.rooms.every(d=>d.bank.csideVariant===c.bankVariant));}
 report.registration.push({hostname,protocol,csideSections:local?6:0,extrasVisible:local});
}
const baseline=JSON.parse(read('docs/room-bank/cside-outskirts-baseline.json'));
for(const [path,hash]of Object.entries(baseline.files))assert.equal(createHash('sha256').update(readFileSync(new URL(path,root))).digest('hex'),hash,'preserve '+path);
assert.equal(Object.keys(baseline.files).filter(x=>x.startsWith('scripts/room-bank/')).length,132);
report.preservedEarlierRooms=132;
if(process.argv.includes('--search'))for(const id of ['bank-f81','bank-f83','bank-f86']){
 const x=candidates.find(x=>x.room.id===id),noRide=!!x.room.sentinel;
 const result=beam(id,{actions:ACT.climb,beam:120,maxDepth:65,key:g=>defaultKey(g)+'|'+Math.floor((g.sentinel?.t||0)/10),
  reject:(g,events)=>events.some(e=>noRide?e.type==='sentinel-ride':['super','hyper','ultra','wallbounce'].includes(e.type)),
  goal:(g,e)=>e.some(x=>x.type==='exit'),score:g=>Math.hypot(g.p.x-(x.room.exit==='left'?-8:x.room.cols*8),g.p.y-(noRide?20:130))});
 assert.equal(result,null,`${id}: independently found ${noRide?'no-ride':'ordinary movement'} bypass`);
 report.searches.push({id,constraint:noRide?'Never mount the Sentinel':'No super, hyper, ultra or wallbounce',beam:120,maxDepth:65,result:'No exit found; bounded search only'});
 console.log(id,'independent bypass search: no exit found');
}
if(process.argv.includes('--write'))writeFileSync(new URL('docs/room-bank/cside-outskirts-check.json',root),JSON.stringify(report,null,2)+'\n');
console.log('PASS: six routes, twelve timing variations, eighteen recorded shortcuts, local-only two-set registration, 132 earlier sources preserved.');
