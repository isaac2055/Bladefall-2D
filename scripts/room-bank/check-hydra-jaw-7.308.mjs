// Behaviour checks for the opt-in, readable Hydra fight. Legacy routes are checked separately.
import assert from 'node:assert/strict';
import {runRoom} from '../pcore-tape.mjs';
const map=Array.from({length:23},(_,r)=>Array.from({length:40},(_,c)=>r===0||r>=20||c===0||c===39?'#':'.'));
map[19][14]='P';
const room={id:'jaw-contract',study:true,cols:40,rows:23,map:map.map(r=>r.join('')),chainHydra:{c:20,r:18,need:1,locks:[[20,18]],hunt:{tell:42,bite:16,open:84,reach:32,spines:[{c:22,r:16,w:5}]}}};
let r=runRoom([room],0,[[1,'r'],[72,''],[1,'rs'],[5,'']]);
assert.equal(r.deaths,0);assert.equal(r.g.chainHydra.done,true,'ordinary blade after the visible bite frees the head');assert.equal(r.g.chainHydra.serial,0,'no hidden grapple history is required');assert(r.events.some(e=>e.type==='hydra-tell'));assert(r.events.some(e=>e.type==='hydra-bite'));assert(r.events.some(e=>e.type==='hydra-open'));assert(r.g.ents.some(e=>e.type==='hydra-spine'&&e.solid),'the defeated head makes a physical return foothold');
r=runRoom([room],0,[[18,'r'],[1,'rs'],[5,'']]);assert.equal(r.g.chainHydra.hits,0,'armoured jaw cannot be damaged before the opening');assert(r.events.some(e=>e.type==='guard-block'),'an early cut gets explicit feedback');
r=runRoom([room],0,[[1,'r'],[37,''],[16,'r']]);assert(r.deaths>0,'walking into the telegraphed bite is dangerous');
console.log('PASS: visible attack/opening, ordinary blade damage, blocked-hit feedback, dangerous bite and physical fallen spine.');
