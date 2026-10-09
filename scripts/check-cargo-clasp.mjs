// Focused opt-in cargo-clasp contract. Room routes separately exercise normal inputs.
import assert from 'node:assert/strict';
import {Core,keysToInput} from './pcore-tape.mjs';
const rows=Array.from({length:23},()=>Array(40).fill('.'));
rows[22].fill('#');rows[21][2]='P';rows[10][10]='l';
const def={id:'clasp-contract',map:rows.map(r=>r.join('')),cargoClasps:[{id:'A',c:10,r:10}],beams:[{c:10,r:0,dir:'d'}],beamsHarmless:true};
const g=Core.createGame([def]),D=globalThis.BladefallPrecisionCargoClasp;
const tick=(k='',n=1)=>{for(let i=0;i<n;i++)Core.step(g,keysToInput(k));};
let ring=D.clasps(g)[0],lan=g.ents.find(e=>e.type==='lantern');assert.equal(lan.id,0);
tick();assert.equal(ring.cargoId,0);tick('',120);assert.deepEqual([lan.x,lan.y,lan.vx,lan.vy],[80,80,0,0]);assert.equal(g.events.filter(e=>e.type==='clasp-catch').length,1);
assert(g.beams.paths.every(s=>s[3]<80),'caught lantern casts ordinary shade');
// Standard grab detaches exactly once and makes the ring visibly open.
g.p.x=88;g.p.y=83;tick('g');assert.equal(lan.held,true);assert.equal(ring.cargoId,null);assert(ring.open>0);assert.equal(g.events.filter(e=>e.type==='clasp-take').length,1);
// Repeat catch; a strike releases into gravity and cannot recatch immediately.
g.p.carrying=null;lan.held=false;lan.x=80;lan.y=80;lan.vx=lan.vy=0;ring.open=0;g.p.x=96;g.p.y=96;tick();assert.equal(ring.cargoId,0);
g.p.x=80;g.p.y=92;g.p.vx=g.p.vy=0;g.p.strikeCooldown=0;tick('us');assert.equal(ring.cargoId,null);assert(ring.open>0);g.p.x=16;g.p.y=160;tick('',12);assert(lan.y>80);assert.equal(g.events.filter(e=>e.type==='clasp-release').length,1);
// Generic gravity mirrors ring and captured cargo together, then release falls in that gravity.
lan.x=80;lan.y=80;lan.vx=lan.vy=0;ring.open=0;tick();assert.equal(ring.cargoId,0);
globalThis.BladefallPrecisionGravity.mirror(g);tick('',20);assert.equal(g.flipped,true);assert.deepEqual([ring.y,lan.y],[96,96]);
g.p.x=80;g.p.y=108;g.p.vx=g.p.vy=0;g.p.strikeCooldown=0;tick('ds');assert.equal(ring.cargoId,null);g.p.x=16;tick('',10);assert(lan.y>96,'release falls toward current simulation gravity');
Core.resetRoom(g);ring=D.clasps(g)[0];lan=g.ents.find(e=>e.type==='lantern');assert.equal(g.flipped,false);assert.equal(ring.cargoId,0);assert.equal(ring.open,0);tick('',12);assert.equal(ring.cargoId,0);
const plain=Core.createGame([{id:'no-clasp',map:def.map}]);assert.equal(D.clasps(plain).length,0);
console.log('cargo-clasp: catch, zero ID, stable shade, pickup, repeat catch, blade release, gravity mirror, retry and opt-in passed');
