import assert from 'node:assert/strict';
import {Core,Rooms,keysToInput,sideRun,expand} from './rbr-lib.mjs';
const create=id=>Core.createGame(Rooms.all,{room:Rooms.all.findIndex(r=>r.id===id)});
const id='fw22-clearing',r=sideRun(id,Rooms.tapes[id]);assert(r.exited&&!r.deaths&&r.g.oathRoot.released&&r.g.oathRoot.taken);
const g=create(id);g.p.x=33*8;g.p.y=133;Core.step(g,keysToInput('us'));assert(!g.oathRoot.taken&&!g.p.strikeTimer,'bound blade cannot be taken or used');
const noUp=sideRun(id,Rooms.tapes[id].map(([n,k])=>[n,k.replaceAll('u','')]));assert(!noUp.exited&&!noUp.g.oathRoot.taken,'weight alone does not take the blade');
const w=create('fw22-wind');for(let i=0;i<60;i++){Core.step(w,keysToInput(''));w.events.length=0;}assert.equal(w.resinWind.t,0,'study pause holds wind');
Core.step(w,keysToInput('rx'));w.events.length=0;assert.equal(w.resinWind.phase,0,'dash does not turn wind');
// Inspect each real branch against the two clock phases, including the resinless lie and both-edge rest.
for(const phase of [0,1]){w.freeze=0;w.resinWind.t=phase*156+40;Core.step(w,keysToInput(''));w.events.length=0;for(const e of w.ents.filter(e=>e.type==='resinBranch'))assert.equal(e.solid,e.phase===2||e.phase===phase);}
if(Rooms.tapes['fw22-wind']){const route=sideRun('fw22-wind',Rooms.tapes['fw22-wind']);assert(route.exited&&!route.deaths);const trace=create('fw22-wind'),landed=new Set();for(const k of expand(Rooms.tapes['fw22-wind'])){Core.step(trace,keysToInput(k));for(const e of trace.ents.filter(e=>e.type==='resinBranch'))if(e.solid&&trace.p.onGround&&trace.p.y+trace.p.h===e.y&&trace.p.x+8>e.x&&trace.p.x<e.x+e.w)landed.add(e.id);trace.events.length=0;}for(let i=0;i<5;i++)assert(landed.has('resin-'+i),'intended climb lands branch '+i);}
console.log('Oathblade release and deliberate pickup, wind timing, honest/false resin and intended climb pass');
