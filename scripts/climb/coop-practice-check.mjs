import assert from 'node:assert/strict';
await import('../../public/bladefall-pcore.js');
const Core=globalThis.BladefallPrecisionCore;
await import('../../public/bladefall-coop-practice-core.js');
const P=globalThis.BladefallCoopPracticeCore;
import {routes} from './coop-practice-routes.mjs';
function run(roles,omit=-1,room=0){const s=P.create(room,roles);for(const[n,a,b]of (routes[room]))for(let i=0;i<n;i++){
 const pair=roles?[b,a]:[a,b];if(omit>=0)pair[omit]={};P.step(s,pair);
 assert.equal(s.games[0].frame,s.games[1].frame,'both native players advance once per authoritative tick');
 for(const g of s.games)for(const b of s.bodies){const e=g.ents.find(e=>e.id===b.id);assert.equal(e.x,b.x);assert.equal(e.y,b.y);}
 }return s;}
for(const room of [0,1,2,3,4,5,6,7])for(const roles of [0,1]){
 const s=run(roles,-1,room);assert.equal(s.complete,true,'both roles complete with real inputs');assert.equal(s.deaths,0);
 for(const omitted of [0,1]){const solo=run(roles,omitted,room);assert.equal(solo.complete,false,'neither knight can be omitted');assert.equal(room===2?solo.puzzle.brake===2:solo.puzzle.latched,false,'the puzzle itself requires the other knight, beyond the shared finish');}
 assert.deepEqual(P.view(run(roles,-1,room)),P.view(s),'deterministic shared state');
}
// The first room really transfers one weight between both lower scales.
const exchange=P.create(0);for(const[n,a,b]of routes[0].slice(0,12))for(let i=0;i<n;i++)P.step(exchange,[a,b]);assert(exchange.puzzle.latched);assert(exchange.puzzle.weighted);assert(!exchange.puzzle.returnWeighted);for(let i=0;i<180;i++)P.step(exchange,[{},{}]);assert.equal(exchange.bodies.find(b=>b.id==='return').y,312,'the upper latch alone cannot lift the operator');
// Shield direction is physical: facing away cannot stop the incoming stream.
const wrongShield=P.create(3);for(let i=0;i<20;i++)P.step(wrongShield,[{parry:true,r:true},{}]);assert(wrongShield.deaths>0);assert.equal(wrongShield.puzzle.latched,false);
// Objects cannot substitute for a knight on the tandem locks.
const locks=P.create(7);assert.equal(locks.lantern,null);for(let i=0;i<100;i++)P.step(locks,[{portal:true,use:true},{portal:true,use:true}]);assert.equal(locks.puzzle.charge,0);assert.equal(locks.puzzle.latched,false);
const s=P.create();for(let i=0;i<90;i++)P.step(s,[{},{}]);const before=P.view(s);s.paused=true;for(let i=0;i<90;i++)P.step(s,[{r:true},{jump:true}]);assert.equal(s.frame,before.frame);assert.deepEqual(P.view(s).players,before.players);
s.paused=false;P.step(s,[{reset:true},{}]);assert.equal(s.epoch,1);assert.equal(s.frame,0);assert.equal(s.puzzle.latched,false);assert.equal(s.lantern.held,-1);
for(let i=0;i<5;i++)P.step(s,[{reset:true},{}]);assert.equal(s.epoch,1,'held reset cannot repeatedly reset the world');
Core.kill(s.games[1],s.games[1].p,'test');P.step(s,[{},{}]);assert.equal(s.epoch,2);assert.equal(s.games[0].p.x,64);assert.equal(s.games[1].p.x,308);
const relay=P.create(1);P.step(relay,[{portal:true},{portal:true}]);assert.deepEqual(relay.puzzle.portals,[false,false],'portal controls require reaching each bay’s marked surface');
for(const roles of [0,1]){const clue=P.create(5,roles);assert.deepEqual(P.view(clue,roles).puzzle.clue,[2,0,1]);assert.equal(P.view(clue,1-roles).puzzle.clue,undefined);P.step(clue,[{},{}]);assert.equal(clue.puzzle.shutter,false);}
for(let hold=34;hold<=44;hold++){const launch=P.create(4);for(const[n,a,b]of [[hold,{use:true},{}],[24,{},{r:true,jump:true}],[8,{},{r:true,dash:true}],[55,{},{r:true}]])for(let i=0;i<n;i++)P.step(launch,[a,b]);assert.equal(launch.deaths,0);assert.equal(launch.games[1].p.y,141,'eleven adjacent release timings land on the high ledge');}
console.log('PASS: all eight native practice rooms, both role assignments, no idle-partner solution, deterministic machinery, pause and shared death/reset.');
