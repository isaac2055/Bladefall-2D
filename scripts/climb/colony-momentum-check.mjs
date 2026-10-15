// Native opening proof and finite bypass/timing probes, not an exhaustive path-search proof.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {Core,expand,keysToInput} from '../pcore-tape.mjs';
const source=JSON.parse(readFileSync(new URL('../room-bank/fractured/113-bank-f113.json',import.meta.url)));
// Preserve the strong existing level outside the small opening edit and its first lamp.
const preserved=structuredClone(source.room);delete preserved.coreProgressRevision;preserved.lights=preserved.lights.slice(1);
preserved.map=preserved.map.map((row,r)=>r>=109&&r<=116?row.slice(0,13)+'.'.repeat(25)+row.slice(38):row);
assert.equal(createHash('sha256').update(JSON.stringify(preserved)).digest('hex'),'31b2eafd29db85ec86360d704c6a4c9275cb0ecaa56b3d134d6312bc3ac29e34','all geometry/configuration outside the opening stays as revision 2');
const landed=g=>g.p.onGround&&g.p.x+g.p.w>272&&g.p.x<304&&Math.abs(g.p.y-901)<2;
const g=Core.createGame([source.room]),inputs=expand(source.verification.partTapes[0]);let frame=0,airDash=-100,wave=null,firstLanding=null,seed=null;
for(const k of inputs){const grounded=g.p.onGround;Core.step(g,keysToInput(k));frame++;
 for(const e of g.events){
  if(e.type==='dash'&&!grounded&&e.dx>0&&e.dy>0)airDash=frame;
  if(!wave&&e.type==='hyper'&&frame-airDash<=12){assert.equal(g.p.dashes,1);wave={frame,x:e.x,y:e.y};}
  if(!seed&&e.type==='pogo-loft'){assert(firstLanding);seed=frame;}
 }
 if(!firstLanding&&landed(g)){assert(wave);firstLanding=frame;}
 assert.equal(g.deaths,0);g.events.length=0;
}
assert(firstLanding);assert(seed);assert.equal(g.coreRun.index,0);
let ordinaryProbes=0,bypasses=0;
for(const run of [0,4,8,12,16,20,24,28,32])for(const jump of [0,4,8,12,16,20])for(const at of [0,6,12,18,24])for(const dash of ['rx','rux','rdx']){
 const z=Core.createGame([source.room]);ordinaryProbes++;
 for(let f=0;f<180;f++){const k=f<run?'r':f<run+jump?'rj':f===run+jump+at?dash:'rg';Core.step(z,keysToInput(k));
  if(z.deaths||z.events.some(e=>e.type==='hyper'||e.type==='super'))break;
  if(landed(z)){bypasses++;break;}z.events.length=0;
 }
}
assert.equal(bypasses,0);
// Vary only the launch clock. The same legal motion must depend on the first lamp's sweep.
assert.deepEqual(source.verification.partTapes[0][0],[1,'r']);assert.equal(source.verification.partTapes[0][1][1],'');
const originalWait=source.verification.partTapes[0][1][0],motion=inputs.slice(1+originalWait,firstLanding);
const withoutFirst={...source.room,lights:source.room.lights.slice(1)};let timedPasses=0,seenFailures=0,firstLampFailures=0;
for(let wait=0;wait<140;wait++){
 const trial=room=>{const z=Core.createGame([room]);let seen=false;for(const k of ['r',...Array(wait).fill(''),...motion]){Core.step(z,keysToInput(k));seen ||= z.events.some(e=>e.type==='death'&&e.cause==='seen');if(z.deaths)break;z.events.length=0;}return {passed:!z.deaths&&landed(z),seen};};
 const normal=trial(source.room);if(normal.passed)timedPasses++;if(normal.seen){seenFailures++;if(trial(withoutFirst).passed)firstLampFailures++;}
}
assert(timedPasses>0);assert(firstLampFailures>0,'the new lamp gates the wavedash crossing, rather than being decorative');
export const proof={airborneWavedash:wave,firstLanding,firstSeed:seed,ordinaryProbes,bypasses,lampTiming:{phases:140,timedPasses,seenFailures,firstLampFailures},preserved:'Revision 2 room outside columns13–37/rows109–116 and first lamp',limits:'Finite probes; native simulation, not a human difficulty rating.'};
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify({result:'PASS',...proof}));
