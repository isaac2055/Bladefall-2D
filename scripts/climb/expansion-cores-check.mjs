// Native acceptance evidence for the next five authored Cores. No browser/human completion is implied.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import {Core,expand,keysToInput,runRoom} from '../pcore-tape.mjs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
const worlds={101:'keep',102:'gaol',103:'frost',104:'court',105:'ember'};
const ids=process.argv.slice(2).map(Number);assert.ok(ids.length,'Pass each source id to verify.');
for(const id of ids){
 const x=JSON.parse(readFileSync(`scripts/room-bank/fractured/${id}-bank-f${id}.json`)),name=worlds[id];assert.ok(name);
 let authored;vm.runInNewContext(readFileSync(`scripts/climb/author-${name}-core.mjs`,'utf8').replace(/^import .*;\n/gm,''),{writeFileSync:(_p,s)=>{authored=JSON.parse(s);},coreCrumbleGrace});assert.deepEqual(authored.room,x.room,'Author geometry/configuration parity');
 assert.equal(x.room.crumbleExtraFrames,40);assert.equal(x.room.core,id-95);assert.ok(x.room.coreCheckpoints.length>=5);
 const whole=runRoom([x.room],0,x.tape,{trace:true});assert.ok(whole.exited);assert.equal(whole.deaths,0);
 const counts={};for(const e of whole.events)counts[e.type]=(counts[e.type]||0)+1;for(const [event,n]of Object.entries(x.bank.requiredEventCounts))assert.ok(counts[event]>=n,`${id}: ${event}: ${counts[event]} < ${n}`);
 const parts=[];assert.equal(x.verification.partTapes.length,x.room.coreCheckpoints.length+1);
 for(let part=0;part<x.verification.partTapes.length;part++){
  const g=Core.createGame([x.room]);if(part){g.coreRun.index=part-1;Core.resetRoom(g);g.p.state='normal';g.p.respawnTimer=0;}
  let done=false,frames=0;for(const k of expand(x.verification.partTapes[part])){Core.step(g,keysToInput(k));frames++;assert.equal(g.deaths,0,`${id} part ${part+1}`);if(part===x.room.coreCheckpoints.length?g.exited:g.coreRun.index>=part){done=true;break;}g.events.length=0;}assert.ok(done);parts.push(frames);
 }
 const probes=[];for(const[name,tape]of [['remove grab',x.tape.map(([n,k])=>[n,k.replaceAll('g','')])],['hold right',[[1800,'r']]],['jump/dash right',Array.from({length:70},()=>[[8,'rj'],[8,'rx'],[20,'r']]).flat()]]){const r=runRoom([x.room],0,tape);assert.ok(!r.exited,`${id}: ${name} bypassed the room`);probes.push({name,exited:r.exited,deaths:r.deaths});}
 if(id===102){const r=runRoom([{...x.room,map:x.room.map.map(row=>row.replaceAll('R','.'))}],0,x.tape);assert.ok(!r.exited&&r.deaths>0);probes.push({name:'authored route without pressure pods',exited:r.exited,deaths:r.deaths});}
 if(id===103){const r=runRoom([{...x.room,map:x.room.map.map(row=>row.replaceAll('f','.'))}],0,x.tape);assert.ok(!r.exited&&r.deaths>0);probes.push({name:'authored route without frost feathers',exited:r.exited,deaths:r.deaths});assert.ok(whole.events.some(e=>e.type==='parry'&&whole.log[e.i]?.st==='climb'),'Frost route must include the hanging parry');}
 if(id===104){const r=runRoom([{...x.room,map:x.room.map.map(row=>row.replaceAll('w','.'))}],0,x.tape);assert.ok(!r.exited&&r.deaths>0);probes.push({name:'authored route without water columns',exited:r.exited,deaths:r.deaths});assert.ok(whole.events.some(e=>e.type==='condenser'&&(whole.log[e.i]?.st==='climb'||whole.log[e.i-1]?.st==='climb')),'Court route must activate a condenser from a hanging position');}
 let heatInteractions;
 if(id===105){
  const g=Core.createGame([x.room]),gripped=new Set(),glassEntries=new Set();
  for(const k of expand(x.tape)){const y=g.p.y;Core.step(g,keysToInput(k));const p=g.p;
   for(const s of g.slabs){
    if(p.state==='climb'&&s.state==='stone'&&p.y+p.h>s.y&&p.y<s.y+s.h&&(Math.abs(p.x+p.w-s.x)<1||Math.abs(p.x-s.x-s.w)<1))gripped.add(s.id);
    if(s.state==='glass'&&p.vy<0&&p.x+p.w>s.x&&p.x<s.x+s.w&&y>=s.y+s.h&&p.y<s.y+s.h)glassEntries.add(s.id);
   }g.events.length=0;
  }
  assert.ok(gripped.size>=7,'Ember route must grip seven distinct cooling columns');assert.ok(glassEntries.size>=2,'Ember route must enter both glass gates from below');
  for(const [label,room]of [['no heated columns',{...x.room,map:x.room.map.map(row=>row.replaceAll('E','.'))}],['permanently stone slabs',{...x.room,slabs:x.room.slabs.map(()=>({stone:100000,molten:1,glass:1,offset:0}))}]]){const r=runRoom([room],0,x.tape);assert.ok(!r.exited&&r.deaths>0,label);probes.push({name:label,exited:r.exited,deaths:r.deaths});}
  heatInteractions={stoneColumnsGripped:gripped.size,glassGatesEnteredFromBelow:glassEntries.size};
 }
 const proof={room:x.room.id,status:'Native route verified; integrated as a playable Core draft awaiting player review',whole:{frames:whole.exitFrame+1,deaths:0,eventCounts:counts,minimumStamina:Math.min(...whole.log.map(t=>t.st2))},freshParts:parts,probes,...(heatInteractions?{heatInteractions}:{}),limits:'These authored-route and basic bypass probes are not exhaustive path search. No live browser or human completion claimed.'};writeFileSync(`docs/room-bank/${name}-expansion-proof.json`,JSON.stringify(proof,null,2)+'\n');console.log(`PASS ${name}: whole ${proof.whole.frames}f; fresh ${parts.join('/')}; author parity; ${probes.length} sensitivity/bypass probes.`);
}
