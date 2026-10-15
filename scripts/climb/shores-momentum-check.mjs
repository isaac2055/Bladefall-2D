// Native momentum/float deadline evidence; bounded probes are not an exhaustive bypass proof.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {Core,expand,keysToInput} from '../pcore-tape.mjs';
import {snapshot,restore} from '../pcore-search.mjs';
const source=JSON.parse(readFileSync(new URL('../room-bank/fractured/112-bank-f112.json',import.meta.url)));
const g=Core.createGame([source.room]);let frame=0,airDash=-100,wave=null,landing=null,floatStart=null;
for(const k of expand(source.verification.partTapes[0])){
 const grounded=g.p.onGround;Core.step(g,keysToInput(k));frame++;
 if(!floatStart&&g.p.onGround&&g.p.state==='normal'&&g.p.x>=136&&g.p.x<168&&g.p.y>950)floatStart=snapshot(g);
 for(const e of g.events){
  if(e.type==='dash'&&!grounded&&e.dx>0&&e.dy>0)airDash=frame;
  if(e.type==='hyper'&&frame-airDash<=12&&e.x>=136&&e.x<176){assert.equal(g.p.dashes,1);wave={frame,x:e.x,y:e.y};}
 }
 if(!landing&&g.p.onGround&&g.p.x+g.p.w>352&&g.p.x<384&&Math.abs(g.p.y-893)<2){assert(wave);landing=frame;}
 assert.equal(g.deaths,0);g.events.length=0;
}
assert(wave);assert(landing);assert(floatStart);assert.equal(g.coreRun.index,0);
let probes=0,bypasses=0;
for(const wait of [0,10,20,30,40,50,60,70])for(const jump of [4,8,12,16,20])for(const delay of [0,6,12,18,24])for(const dash of ['rx','rux','rdx']){
 const z=restore(floatStart);probes++;
 for(let f=0;f<220;f++){
  const k=f<wait?'':f<wait+jump?'rj':f===wait+jump+delay?dash:'rg';Core.step(z,keysToInput(k));
  if(z.deaths||z.events.some(e=>e.type==='hyper'||e.type==='super'))break;
  if(z.p.onGround&&z.p.x+z.p.w>352&&z.p.x<384&&Math.abs(z.p.y-893)<2){bypasses++;break;}
  z.events.length=0;
 }
}
assert.equal(bypasses,0,'ordinary launches from the actual first float cannot pass these bounded probes');
const route=Core.createGame([source.room]),riders=new Map();
for(const k of expand(source.tape)){
 Core.step(route,keysToInput(k));assert.equal(route.deaths,0);
 if(route.p.onGround&&route.p.state==='normal'&&Math.abs(route.p.vx)<1)for(const e of route.ents){
  if(e.type==='float'&&[984,1056,1128].includes(e.x)&&!riders.has(e.x)&&Math.abs(route.p.y+route.p.h-e.y)<2&&route.p.x+route.p.w>e.x&&route.p.x<e.x+e.w)riders.set(e.x,snapshot(route));
 }route.events.length=0;
}
assert.equal(riders.size,3,'the route boards all three independently timed relay floats');
const deadlines=[];
for(const [x,state]of riders){const z=restore(state);let cause=null,wait=0;for(;wait<240;wait++){Core.step(z,keysToInput(''));const death=z.events.find(e=>e.type==='death');if(death){cause=death.cause;break;}z.events.length=0;}assert.equal(cause,'spikes','waiting on relay float '+x+' meets its ceiling');deadlines.push({x,waitFrames:wait+1,cause});}
export const proof={airborneWavedash:wave,reefLanding:landing,ordinaryFloatProbes:probes,bypasses,relayDeadlines:deadlines,limits:'Finite probes; native simulation, not human difficulty verification.'};
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify({result:'PASS',...proof}));
