import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {Core,keysToInput,runRoom,expand} from '../pcore-tape.mjs';
const reports=[];
for(const id of (process.argv.slice(2).length?process.argv.slice(2).map(Number):[99,100])){
 const x=JSON.parse(readFileSync(`scripts/room-bank/fractured/${id}-bank-f${id}.json`)),d=x.room;
 assert(d.cols*d.rows>=12000);assert.equal(d.coreCheckpoints.length,2);assert(!d.lines?.length);
 const full=runRoom([d],0,x.tape),counts=full.events.reduce((o,e)=>(o[e.type]=(o[e.type]||0)+1,o),{});
 assert(full.exited&&full.deaths===0,d.id+' whole route');
 for(const[type,min]of Object.entries(x.bank.requiredEventCounts))assert((counts[type]||0)>=min,d.id+' uses '+type);
 const parts=[];
 for(let part=0;part<3;part++){
  const g=Core.createGame([d]);if(part){g.coreRun.index=part-1;Core.resetRoom(g);g.p.state='normal';g.p.respawnTimer=0;}
  let done=false,n=0;for(const k of expand(x.verification.partTapes[part]||[])){Core.step(g,keysToInput(k));n++;assert.equal(g.deaths,0);if(part===2?g.exited:g.coreRun.index>=part){done=true;break;}g.events.length=0;}
  assert(done,d.id+' independently reset part '+part);parts.push(n);
 }
 // Measure actual contact with both light-platform types, not merely dash events.
 const g=Core.createGame([d]),light=new Set();for(const k of expand(x.tape)){Core.step(g,keysToInput(k));if(g.p.onGround)for(const e of g.ents)if(e.type==='toggle'&&e.solid&&Math.abs(g.p.y+g.p.h-e.y)<2&&g.p.x+g.p.w>e.x&&g.p.x<e.x+e.w)light.add(e.phase);g.events.length=0;}
 if(id===99)assert.deepEqual([...light].sort(),[0,1],'both A and B platforms are used as real landings');
 // Removing a mechanic from the chosen tape is a counterfactual, not an exhaustive bypass proof.
 const omitted=id===99?'s':'p',ablation=runRoom([d],0,x.tape.map(([n,k])=>[n,k.replaceAll(omitted,'')]));assert(!ablation.exited||ablation.deaths>0,'recorded route depends on '+omitted);
 let probes=0,openingReached=0;const first=id===99?{x:256,y:725}:{x:296,y:797};
 for(const run of [0,6,12,18,24,30])for(const jump of [8,16,24])for(const dashAt of [0,8,16,24]){
  const z=Core.createGame([d]);for(let f=0;f<180;f++){Core.step(z,keysToInput(f<run?'r':f<run+jump?'rj':f===run+jump+dashAt?'rx':'r'));if(z.deaths)break;if(z.p.onGround&&z.p.x>=first.x&&z.p.x<first.x+40&&Math.abs(z.p.y-first.y)<3){openingReached++;break;}z.events.length=0;}probes++;
 }
 assert.equal(openingReached,0,'ordinary run/jump/one-dash probes do not bypass the opening');
 reports.push({id:d.id,name:d.name,wholeFrames:full.exitFrame+1,partFrames:parts,counts,lightLandings:[...light],recordedRouteAblation:omitted,ordinaryOpeningProbes:probes,openingReached,limitations:'Native proofs and finite counterfactual/probe searches; no human difficulty or live browser playtest claim.'});
}
writeFileSync('docs/room-bank/new-cores-proof.json',JSON.stringify(reports,null,2)+'\n');console.log('PASS:',reports.map(r=>r.name+': '+r.wholeFrames+'f, fresh parts '+r.partFrames.join('/')).join('; '));
