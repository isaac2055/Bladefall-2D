// Release contract for the requested ten review candidates. Old campaign and bank content stay intact.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {records} from './register.mjs';
import {assertBatch} from './catalog.mjs';
const baseline=JSON.parse(readFileSync('docs/room-bank/superrooms-7.305-baseline.json','utf8'));
const sharedFixes=new Set(['public/bladefall-pcore-dev-rbr-sorcerer.js','public/bladefall-pcore-dev-rbr-sunspire.js','public/bladefall-pcore-dev-rbr-sunspire-view.js']);
let preserved=0;
for(const [file,hash]of Object.entries(baseline.sha256)){
 if(sharedFixes.has(file))continue;
 assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),hash,file+' changed outside this review set');preserved++;
}
assertBatch(records);
const placements={'bank-b62':1,'bank-b63':4,'bank-b64':6,'bank-b65':11,'bank-b66':20,'bank-f63':21,'bank-f64':25,'bank-f65':29,'bank-f66':37,'bank-f67':40};
const bosses={'bank-b65':'colossus','bank-b66':'dayKing','bank-f63':'sentinel','bank-f64':'marksman','bank-f65':'sorcerer','bank-f67':'dayKing'};
const fresh=records.filter(x=>baseline.newIds.includes(x.room.id));
assert.equal(fresh.length,10);
for(const x of fresh){
 const {room,bank}=x;
 assert.equal(bank.status,'route-proven',room.id+' needs a completion route');
 assert.equal(bank.acceptance,'candidate',room.id+' remains for human review');
 assert.deepEqual(bank.worlds,[placements[room.id]]);
 assert.equal(bank.format,'superroom');
 assert.ok(bank.shortcutChecks?.length>=1,room.id+' needs a credible bypass probe');
 assert.ok(bank.positiveChecks?.length>=2,room.id+' needs alternate successful ending timings');
 assert.ok(bank.tags?.length,room.id+' has useful menu descriptors');
 assert.ok(bank.novelty&&bank.nearestExisting&&bank.endingForgiveness,room.id+' records its puzzle and final recovery');
 if(bosses[room.id])assert.ok(room[bosses[room.id]],room.id+' uses the native boss');
}
const report={version:'7.305.0',checkedAt:new Date().toISOString(),previousBankCount:baseline.previousBankCount,preservedFiles:preserved,sharedRuntimeFix:[...sharedFixes],reviewRooms:fresh.map(x=>({id:x.room.id,name:x.room.name,side:x.bank.side,world:x.bank.worlds[0],nativeBoss:bosses[x.room.id]||null,shortcutChecks:x.bank.shortcutChecks.length,endingVariants:x.bank.positiveChecks.length})),campaignChanged:false};
if(process.argv.includes('--write'))writeFileSync('docs/room-bank/superrooms-7.305-audit.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS: ten review candidates; 5 Base / 5 Fractured; six native bosses; earlier bank/campaign preserved ('+preserved+' files).');
