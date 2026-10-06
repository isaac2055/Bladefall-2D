import assert from 'node:assert/strict';
import {Core,Rooms,keysToInput,sideRun,expand} from './rbr-lib.mjs';
for(const id of ['s20-dawn','s20-morning','s20-noon']){
 const tape=Rooms.tapes[id],right=sideRun(id,tape);assert(right.exited&&!right.deaths&&right.g.dayKing.yielded);assert.equal(right.g.dayKing.hits,2);
 for(const key of ['q','s']){const wrong=sideRun(id,tape.map(([n,k])=>[n,k.replaceAll(key,'')]));assert(!wrong.exited&&!wrong.g.dayKing.yielded,id+' requires both routed light and blade');}
}
const g=Core.createGame(Rooms.all,{room:Rooms.all.findIndex(r=>r.id==='s20-dawn')});g.beams.emit=[{c:14,r:16,dir:'r'}];g.p.x=204;g.p.y=133;
Core.step(g,keysToInput('ls'));for(let i=0;i<12;i++)Core.step(g,keysToInput(''));assert.equal(g.dayKing.hits,0,'direct unrouted sunlight does not expose the King');
for(const id of ['s20-q-lower','s20-q-middle','s20-q-upper']){const r=sideRun(id,Rooms.tapes[id]);assert(r.exited&&!r.deaths&&r.g.gardenShade.done);assert.equal(r.g.beams.emit.length,0,'closed shutter stops its light');}
const ride=Core.createGame(Rooms.all,{room:Rooms.all.findIndex(r=>r.id==='s20-sea')});let seated=0;
for(const k of expand(Rooms.tapes['s20-sea'])){Core.step(ride,keysToInput(k));const e=ride.ents.find(e=>e.type==='deck');if(ride.p.onGround&&ride.p.y+ride.p.h===e.y&&ride.p.x+8>e.x&&ride.p.x<e.x+e.w)seated++;}assert(seated>30,'the departure route rides the hydra');
console.log('three two-bloom hours, portal/blade necessity, closed garden shutters and hydra boarding pass');
