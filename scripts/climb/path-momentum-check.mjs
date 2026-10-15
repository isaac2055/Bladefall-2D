// Native momentum/louvre/airborne mirror evidence. Finite probes do not prove exhaustive impossibility.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {Core,expand,keysToInput} from '../pcore-tape.mjs';
const source=JSON.parse(readFileSync(new URL('../room-bank/fractured/114-bank-f114.json',import.meta.url)));
const changed=[[63,95],[64,95],[65,95],[66,95],[65,97],[66,97],[67,97],[75,104],[76,104],[77,104],[78,104],[72,105],[73,105],[74,105],[31,106],[31,107],[15,108],[16,108],[17,108],[18,108],[19,108],[20,108],[21,108],[22,108],[23,108],[24,108],[19,111],[20,111],[21,111],[14,112],[15,115],[16,115],[17,115],[18,115],[19,115],[20,115],[21,115],[22,115],[23,115],[24,115],[25,115],[26,115],[27,115],[28,115],[29,115]];
const keep=structuredClone(source.room);delete keep.coreProgressRevision;keep.map=keep.map.map((row,r)=>[...row].map((v,c)=>changed.some(([x,y])=>x===c&&y===r)?'.':v).join(''));
assert.equal(createHash('sha256').update(JSON.stringify(keep)).digest('hex'),'a1fc05db0a45ea638db1265df72ba2f45c00889afecd8b207cf6437fefca8556','preserve the later sections and existing light configuration');
const inputs=expand(source.verification.partTapes[0]),g=Core.createGame([source.room]);let frame=0,airDash=-100,wave=null,seed=null;
for(const k of inputs){const ground=g.p.onGround;Core.step(g,keysToInput(k));frame++;
 for(const e of g.events){if(e.type==='dash'&&!ground&&e.dx>0&&e.dy>0)airDash=frame;
  if(!wave&&e.type==='hyper'&&frame-airDash<=12&&e.x>=96&&e.x<=112){assert.equal(g.p.dashes,1);wave={frame,x:e.x,y:e.y};}
  if(!seed&&e.type==='pogo-loft'){assert(wave);seed=frame;}
 }assert.equal(g.deaths,0);g.events.length=0;
}
assert(wave);assert(seed);assert.equal(g.coreRun.index,0);
// Give ordinary launches a favorable fixture: start directly on the launch perch with all beams removed.
let ordinaryProbes=0,seedApproaches=0;
for(const col of [12,13])for(const run of [0,2,4,6])for(const jump of [4,8,12,16])for(const at of [0,4,8,12,16])for(const dash of ['rx','rux','ux']){
 const map=source.room.map.map(row=>row.replace('P','.'));map[111]=map[111].slice(0,col)+'P'+map[111].slice(col+1);const z=Core.createGame([{...source.room,map,beams:[]}]);ordinaryProbes++;
 for(let f=0;f<150;f++){const k=f<run?'r':f<run+jump?'rj':f===run+jump+at?dash:'rg';Core.step(z,keysToInput(k));
  if(z.deaths||z.events.some(e=>e.type==='hyper'||e.type==='super'))break;
  if(z.p.x+z.p.w>240&&z.p.x<264&&z.p.y<=855&&z.p.y>=800){seedApproaches++;break;}z.events.length=0;
 }
}
assert.equal(seedApproaches,0,'ordinary launches do not reach the first seed attack area even without beams');
// The first two louvres must each constrain the same physical wavedash route.
assert.deepEqual(inputs.slice(0,1),['s']);let originalWait=0;while(inputs[1+originalWait]==='')originalWait++;
const motion=inputs.slice(1+originalWait,seed);let timedPasses=0,beamFailures=0;const rescued=[0,0];
for(let wait=0;wait<76;wait++){
 const trial=room=>{const z=Core.createGame([room]);let hit=false;for(const k of ['s',...Array(wait).fill(''),...motion]){Core.step(z,keysToInput(k));if(z.deaths)break;hit ||= z.events.some(e=>e.type==='pogo-loft');z.events.length=0;}return !z.deaths&&hit;};
 if(trial(source.room)){timedPasses++;continue;}beamFailures++;
 for(let b=0;b<2;b++)if(trial({...source.room,beams:source.room.beams.filter((_,i)=>i!==b)}))rescued[b]++;
}
assert(timedPasses>0&&timedPasses<76);assert(rescued.every(n=>n>0),'both louvres independently constrain the opening launch');
const full=Core.createGame([source.room]),mirrors=[];
for(const k of expand(source.tape)){Core.step(full,keysToInput(k));for(const e of full.events)if(e.type==='mirror'){assert.equal(full.p.onGround,false,'turn each mirror from the air');mirrors.push({frame:full.frame,x:full.p.x,y:full.p.y,dashes:full.p.dashes});}assert.equal(full.deaths,0);full.events.length=0;}
assert.equal(mirrors.length,2);
export const proof={airborneWavedash:wave,firstSeed:seed,ordinaryProbes,seedApproaches,louvreTiming:{phases:76,timedPasses,beamFailures,firstLouvreFailures:rescued[0],secondLouvreFailures:rescued[1]},airborneMirrors:mirrors,preserved:'Revision 2 configuration except45 opening/mirror-approach tiles',limits:'Finite probes and native simulation; no human difficulty or exhaustive bypass claim.'};
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify({result:'PASS',...proof}));
