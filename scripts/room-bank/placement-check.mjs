// Audit the analysis-only allocation and preserve campaign/approved room state.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {records} from './register.mjs';
import {assertBatch,catalog} from './catalog.mjs';
const baseline=JSON.parse(readFileSync('docs/room-bank/placement-7.303-baseline.json'));
const plan=JSON.parse(readFileSync('docs/room-bank/world-placement-7.303.json'));
const oldPaths=Object.keys(baseline.sha256).filter(p=>/^scripts\/room-bank\/(base|fractured)\/.*\.json$/.test(p));
const old=new Map(oldPaths.map(p=>{const x=JSON.parse(execFileSync('git',['show',baseline.commit+':'+p],{encoding:'utf8'}));return [x.room.id,x];}));
assert.equal(records.length,97);assert.equal(old.size,98);assertBatch(records);
assert(records.every(r=>r.bank.acceptance==='banked'));assert(!records.some(r=>r.room.id==='bank-b60'));
let unchangedRooms=0,oldApprovals=0;
for(const r of records){const was=old.get(r.room.id);assert(was,'no new rooms');if(!['bank-f32','bank-f59'].includes(r.room.id)){assert.deepEqual(r.room,was.room,r.room.id+' geometry');assert.deepEqual(r.tape,was.tape,r.room.id+' route');unchangedRooms++;}if(was.bank.acceptance==='banked'){assert.deepEqual(r,was,r.room.id+' prior approval');oldApprovals++;}}
assert.equal(unchangedRooms,95);assert.equal(oldApprovals,89);
assert.deepEqual(records.find(r=>r.room.id==='bank-b32'),old.get('bank-b32'),'literal B32 stays untouched; lantern description identifies F32');
const f32=records.find(r=>r.room.id==='bank-f32'),old32=structuredClone(old.get('bank-f32').room);
for(let c=19;c<=22;c++){const row=old32.map[21].split('');assert.equal(row[c],'.');row[c]='B';old32.map[21]=row.join('');}
assert.deepEqual(f32.room,old32,'F32 only receiving platform extension');
const f59=records.find(r=>r.room.id==='bank-f59');assert(!f59.room.spentThorns.some(x=>x.id==='Run-up'));assert(f59.room.spentThorns.some(x=>x.id==='Return grip'));assert.equal(f59.room.map[18].slice(30,39),'#########');
assert(f59.bank.wavedashProof,'saved actual wavedash evidence');
const allowed=new Set(['public/index.html','public/precision.html','public/sw.js','public/bladefall-playtest.js','public/bladefall-room-bank.js']);
let unchangedRuntime=0;for(const [p,h]of Object.entries(baseline.sha256).filter(([p])=>!oldPaths.includes(p))){const a=createHash('sha256').update(readFileSync(p)).digest('hex');if(a!==h)assert(allowed.has(p),'unrelated campaign/runtime changed '+p);else unchangedRuntime++;}
const worlds=[];vm.runInNewContext(readFileSync('public/bladefall-climb-worlds.js','utf8'),{BladefallClimb:{addWorld:w=>worlds.push(w)}});
assert.deepEqual(plan.worlds.map(w=>w.world).sort((a,b)=>a-b),Array.from({length:40},(_,i)=>i+1));
const superroom=r=>r.bank.format==='superroom'||r.bank.collection==='superrooms';
const ordinary=records.filter(r=>!superroom(r));const supers=records.filter(superroom).map(r=>r.room.id).sort();
assert.deepEqual([...plan.supersReserved].sort(),supers,'all superrooms reserved without world assignment');
const ids=plan.worlds.flatMap(w=>w.rooms.map(r=>r.id));assert.equal(new Set(ids).size,ids.length,'no duplicates');assert.deepEqual([...ids].sort(),ordinary.map(r=>r.room.id).sort(),'every ordinary room once');
for(const w of plan.worlds){assert(w.rooms.length>=2&&w.rooms.length<=3,'two or three bank rooms per world');assert(worlds.some(x=>x.n===w.world));assert.deepEqual(w.rooms.map(r=>r.order),Array.from({length:w.rooms.length},(_,i)=>i+1));for(const r of w.rooms){assert(r.reason?.length>15,r.id+' placement reason');const source=records.find(x=>x.room.id===r.id);if((w.world<=20)!==(source.bank.side==='base'))assert(['bank-b56','bank-b57','bank-b61'].includes(r.id)&&r.sideException,r.id+' unexplained side crossover');}}
const sequence=new Map(plan.worlds.flatMap(w=>w.rooms.map(r=>[r.id,w.world*100+r.order])));
const routeReport=new Map(JSON.parse(readFileSync('docs/room-bank/route-report.json')).rooms.map(r=>[r.id,r]));
const inventory=JSON.parse(readFileSync('docs/room-bank/world-inventory-7.303.json'));
let mainCount=0,candidateCount=0;
for(const w of plan.worlds){
 const live=worlds.find(x=>x.n===w.world),defs=new Map(live.rooms.map(r=>[r.id,r]));
 const main=live.sections.filter(s=>!s.passage&&!s.connector&&!defs.get(s.room)?.passage&&!defs.get(s.room)?.connector).map(s=>s.room);
 assert.equal(w.name,live.name);assert.deepEqual(w.kit,Array.from(live.kit));assert.equal(w.existingAuthoredMainRooms,main.length);mainCount+=main.length;
 const wi=inventory.worlds.find(x=>x.id===w.world);assert.deepEqual(wi.authoredOrder,Array.from(main));
 assert.equal(w.reservedFinalRoom.type,'superroom');assert.equal(w.reservedFinalRoom.assignedRoom,null);
 for(const id of w.protectedCurrentRooms)assert(main.includes(id),'protected room exists in world');
 for(const c of w.replacementCandidates){assert(main.includes(c.id),'candidate exists on this main road');assert(!w.protectedCurrentRooms.includes(c.id),'candidate is not a protected introduction');assert(c.evidence?.length>30);candidateCount++;}
 for(const r of w.rooms){
  const source=records.find(x=>x.room.id===r.id);assert.equal(r.name,source.room.name);assert.equal(r.sourceSide,source.bank.side);
  for(const prior of r.prerequisites||[])assert(sequence.has(prior)&&sequence.get(prior)<sequence.get(r.id),r.id+' preceding bank teaching '+prior);
  for(const prior of r.nativePrerequisites||[]){const earlier=worlds.find(x=>x.n===prior.world);assert(prior.world<=w.world);assert(earlier.sections.some(s=>s.room===prior.room),'native lesson exists on main road');assert(!plan.worlds.find(x=>x.world===prior.world).replacementCandidates.some(x=>x.id===prior.room),'native prerequisite preserved');}
  const used=new Set(source.tape.map(x=>x[1]).join(''));for(const [key,ability]of Object.entries({x:'dash',s:'strike',p:'parry',q:'portal'}))if(used.has(key))assert(live.kit.includes(ability),r.id+' requires '+ability+' before native kit');
  if(routeReport.get(r.id).events.wallbounce)assert(w.world>=24,r.id+' wallbounce before native World24 teaching');
 }
}
assert.equal(mainCount,490);assert.equal(candidateCount,72);
assert.deepEqual(plan.implementation,{campaignImports:false,campaignCuts:false,checkpointChanges:false,superroomAssignments:false});
assert.equal(ordinary.length,87);assert.equal(plan.worlds.filter(w=>w.rooms.length===3).length,7);
const result={version:catalog.version,banked:records.length,unchangedRoomDefinitionsAndRoutes:unchangedRooms,unchangedPriorApprovals:oldApprovals,unchangedRuntime,ordinaryAssigned:ids.length,worlds:40,worldsWithTwo:33,worldsWithThree:7,superroomsReserved:supers,cut:['bank-b60'],actionKitsChecked:true,prerequisiteOrderChecked:true,nativeWallbounceOrderChecked:true,existingMainRooms:mainCount,replacementReviewCandidates:candidateCount,campaignImported:false,superroomsAssigned:false};
if(process.argv.includes('--write'))writeFileSync('docs/room-bank/placement-7.303-audit.json',JSON.stringify(result,null,2)+'\n');
console.log('PASS: 97 approved; 87 ordinary rooms assigned once across all40 worlds (2–3 each); superrooms reserved; campaign and95 old room routes preserved.');
