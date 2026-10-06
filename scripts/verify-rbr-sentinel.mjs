import assert from 'node:assert/strict';
import {Core,Rooms,keysToInput,sideRun} from './rbr-lib.mjs';
for(const id of ['fo21-hammer','fo21-shoulder','fo21-last']){
 const r=sideRun(id,Rooms.tapes[id]);assert(r.exited&&!r.deaths&&r.g.sentinel.done,id);const ride=r.events.findIndex(e=>e.type==='sentinel-ride'),bell=r.events.findIndex(e=>e.type==='sentinel-bell');assert(ride>=0&&bell>ride,'ride the attack before ringing');assert(!Rooms.tapes[id].some(([,k])=>k.includes('s')),'weaponless solution');
 const g=Core.createGame(Rooms.all,{room:Rooms.all.findIndex(r=>r.id===id)});g.p.x=g.sentinel.c*8;g.p.y=g.sentinel.r*8;Core.step(g,keysToInput('r'));assert(!g.sentinel.done,'bell cannot be touched from an ordinary aerial approach');assert(Number.isFinite(g.sentinel.body.remX)&&Number.isFinite(g.sentinel.body.remY));
}
console.log('Mile Sentinel: three weaponless attack rides, bells reject an approach without riding');
