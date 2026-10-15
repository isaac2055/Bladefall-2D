// Geometry-level opening check. Finite ordinary-input probes are not an exhaustive bypass proof.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Core,expand,keysToInput} from '../pcore-tape.mjs';
import {snapshot,restore} from '../pcore-search.mjs';
import {fileURLToPath} from 'node:url';
const x=JSON.parse(readFileSync(new URL('../room-bank/fractured/111-bank-f111.json',import.meta.url)));
const g=Core.createGame([x.room]);let frame=0,airDash=-100,wave=null,firstHook=null,firstLanding=null;
for(const k of expand(x.verification.partTapes[0])){
 const grounded=g.p.onGround;Core.step(g,keysToInput(k));frame++;
 for(const e of g.events){
  if(e.type==='dash'&&!grounded&&e.dx>0&&e.dy>0)airDash=frame;
  if(e.type==='hyper'&&frame-airDash<=12&&e.x>=96&&e.x<=144&&e.y===1088)wave={frame,x:e.x};
  if(e.type==='hook'&&e.x===292&&!firstHook){assert.ok(wave,'the opening ring follows an airborne diagonal dash into the phase pad');assert.equal(g.p.dashes,1,'carry the restored dash to the ring');assert.equal(g.phase,1,'the entry wall must remain absent');firstHook=frame;}
 }
 if(g.p.onGround&&g.p.x+8>400&&g.p.x<432&&g.p.y===1053&&!firstLanding){assert.ok(firstHook);assert.equal(g.phase,0,'the departure dash restores the gold landing');firstLanding=frame;}
 assert.equal(g.deaths,0);g.events.length=0;
}
assert.ok(firstLanding);assert.equal(g.coreRun.index,0);
let probes=0,reached=0;
for(const run of [0,4,8,12,16,20,24])for(const jump of [0,4,8,12,16])for(const at of [0,6,12,18,24])for(const dash of ['rx','rux','rdx']){
 const z=Core.createGame([x.room]);probes++;
 for(let f=0;f<180;f++){
  const k=f<run?'r':f<run+jump?'rj':f===run+jump+at?dash:'rg';Core.step(z,keysToInput(k));
  if(z.events.some(e=>e.type==='hyper'||e.type==='super'))break;
  if(z.p.onGround&&z.p.x+8>400&&z.p.x<432&&z.p.y===1053){reached++;break;}
  z.events.length=0;if(z.deaths)break;
 }
}
assert.equal(reached,0,'ordinary run/jump/dash probes must not bypass the opening phase/momentum sequence');
const route=Core.createGame([x.room]),riders=new Map();
for(const k of expand(x.tape)){
 Core.step(route,keysToInput(k));
 if(route.p.onGround&&route.p.state==='normal'&&Math.abs(route.p.vx)<1)for(const e of route.ents){
  if(e.type==='deck'&&!riders.has(e.id)&&Math.abs(route.p.y+route.p.h-e.y)<2&&route.p.x+route.p.w>e.x&&route.p.x<e.x+e.w)riders.set(e.id,snapshot(route));
 }route.events.length=0;
}
assert.equal(riders.size,2,'the route actually boards both timed decks');
const deckDeadlines=[];
for(const [id,state] of riders){const z=restore(state);let cause=null,wait=0;for(;wait<600;wait++){Core.step(z,keysToInput(''));const death=z.events.find(e=>e.type==='death');if(death){cause=death.cause;break;}z.events.length=0;}assert.equal(cause,'spikes','remaining on '+id+' must meet its thorn ceiling');deckDeadlines.push({id,waitFrames:wait+1,cause});}
export const proof={airborneWavedash:wave,firstHook,firstGoldLanding:firstLanding,ordinaryProbes:probes,bypasses:reached,deckDeadlines,limits:'Finite probes, not exhaustive route search; no human difficulty claim.'};
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify({result:'PASS',...proof}));
