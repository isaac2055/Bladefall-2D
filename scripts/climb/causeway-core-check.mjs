import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {Core,runRoom,keysToInput} from '../pcore-tape.mjs';
const x=JSON.parse(readFileSync(new URL('../room-bank/fractured/98-bank-f98.json',import.meta.url))),d=x.room,full=runRoom([d],0,x.tape);
assert.equal(d.lines.length,0,'Causeway has no late-world ziplines');assert.equal(d.zips.length,7,'seven native counterweights');assert(d.counterweightFlow);assert(full.exited&&full.deaths===0);const counts={};for(const e of full.events)counts[e.type]=(counts[e.type]||0)+1;for(const [k,n]of Object.entries(x.bank.requiredEventCounts))assert(counts[k]>=n,k);
// Search ordinary run/jump/single-airdash openings while rejecting lift or advanced-movement assistance.
let attempts=0,ordinaryFirstLandings=0;
for(let jumpAt=0;jumpAt<=30;jumpAt+=2)for(let dashAt=jumpAt+1;dashAt<=jumpAt+55;dashAt+=3)for(const aim of ['r','ru']){
 const g=Core.createGame([d]);attempts++;let assisted=false;
 for(let f=0;f<170;f++){const input=keysToInput('r'+(f>=jumpAt&&f<jumpAt+12?'j':'')+(f===dashAt?'x'+(aim==='ru'?'u':''):''));Core.step(g,input);if(g.events.some(e=>['zip-start','hyper','super','ultra','wallbounce'].includes(e.type)))assisted=true;
  if(g.p.onGround&&g.p.x>=47*8-8&&g.p.x<51*8&&Math.abs(g.p.y-701)<2){if(!assisted)ordinaryFirstLandings++;break;}g.events.length=0;if(g.deaths)break;
 }
}
assert.equal(ordinaryFirstLandings,0,'ordinary one-jump/one-dash openings cannot reach the first shelf without the lift/advanced movement');
// A wrong-direction/early-late launch isn't reported as a bypass merely because the native tape uses a named event.
const simple=[[[600,'r']],Array.from({length:30},()=>[[8,'rj'],[8,'rx'],[20,'r']]).flat(),Array.from({length:30},()=>[[8,'r'],[8,'rx'],[20,'r']]).flat()];for(const t of simple)assert(!runRoom([d],0,t).exited);
// Small timing variants: report real outcomes; do not claim exhaustive timing robustness.
const variants=[];for(const delta of [-2,-1,1,2]){const t=x.tape.map(a=>a.slice());t[0][0]=Math.max(1,t[0][0]+delta);const r=runRoom([d],0,t);variants.push({firstInputDelta:delta,firstShelfLanded:r.events.some(e=>e.type==='land'&&e.x>=372&&e.x<=415&&e.y===712),exited:r.exited,deaths:r.deaths});}
assert(variants.every(v=>v.firstShelfLanded),'opening tolerates timing variation while later inputs still need adapting');
const proof={room:d.id,frames:full.exitFrame+1,deaths:full.deaths,counts,ordinaryOpeningAttempts:attempts,ordinaryUnaidedLandings:ordinaryFirstLandings,simpleWholeRouteProbes:simple.length,timingVariants:variants,limits:'Finite native probes, not exhaustive shortcut or human difficulty proof. No live browser playtesting.'};
writeFileSync(new URL('../../docs/room-bank/causeway-core-proof.json',import.meta.url),JSON.stringify(proof,null,2)+'\n');console.log(proof);
