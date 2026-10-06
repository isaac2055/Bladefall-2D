import assert from 'node:assert/strict';
import{Core,Rooms,keysToInput,sideRun}from'./rbr-lib.mjs';
for(const id of ['d15-q-hoist','d15-q-ledger']){const r=sideRun(id,Rooms.tapes[id]);assert(r.exited&&!r.deaths,id+' safe completion');}
function game(id){return Core.createGame(Rooms.all,{room:Rooms.all.findIndex(r=>r.id===id)});}
const g=game('d15-q-hoist');
// Standing at the cradle is not enough: it takes the loaded cart's weight.
g.p.x=192;g.p.y=133;for(let i=0;i<120;i++)Core.step(g,keysToInput(''));assert(!g.rescueHoist.done);assert.equal(g.rescueHoist.t,0);
const escort=game('d15-q-ledger');escort.p.x=270;for(let i=0;i<120;i++)Core.step(escort,keysToInput(''));assert.equal(escort.rescueEscort.x,56);assert(!escort.rescueEscort.done,'the Miner waits when left behind');
const r=sideRun('d15-q-ledger',Rooms.tapes['d15-q-ledger']);assert(r.events.some(e=>e.type==='miner-ledger'));assert(r.events.some(e=>e.type==='shard'));
for(const [id,event]of[['d15-high','switch-high'],['d15-backup','boost'],['d15-bell','bell'],['d15-speed','portal-pass']]){const s=sideRun(id,Rooms.tapes[id]);assert(s.exited&&!s.deaths);assert(s.events.some(e=>e.type===event),id+' uses '+event);}
console.log('cart cradle, continuous rescue, nearby escort and integrated rail routes pass');
