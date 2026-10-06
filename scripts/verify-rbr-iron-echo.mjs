import assert from 'node:assert/strict';
import {Core,Rooms,keysToInput,sideRun} from './rbr-lib.mjs';
for(const id of ['fc23-west','fc23-east','fc23-middle']){
 const r=sideRun(id,Rooms.tapes[id]);assert(r.exited&&!r.deaths,id);const defeats=r.events.filter(e=>e.type==='enemy-defeat');assert.equal(defeats.length,1);assert.equal(defeats[0].cause,'crush');assert(r.g.combat.enemies.every(e=>e.dead));
 const noDrop=sideRun(id,Rooms.tapes[id].map(([n,k])=>[n,k==='dx'?'d':k]));assert(!noDrop.exited&&noDrop.g.combat.enemies.some(e=>!e.dead),'court cannot clear without falling mass');
 const g=Core.createGame(Rooms.all,{room:Rooms.all.findIndex(r=>r.id===id)}),enemy=g.combat.enemies[0];g.p.x=enemy.x-10;g.p.y=enemy.y+5;Core.step(g,keysToInput('rs'));assert(!enemy.dead,'blade cannot defeat armor');
}
console.log('Iron Echo: three clean crushes; withheld weights and direct blade cannot clear the courts');
