// Sorcerer pools must use the room's dimensions, including in new superrooms.
import assert from 'node:assert/strict';
import {Core, Rooms, keysToInput, runRoom} from '../rbr-lib.mjs';
const cols=80, rows=46;
const map=Array.from({length:rows},()=>Array(cols).fill('.'));
map[44][2]='P'; map[45].fill('#');
for(let c=60;c<64;c++){map[31][c]='w';map[32][c]='#';}
const room={id:'far-sorcerer-fixture',name:'Far frost pool',cols,rows,map:map.map(r=>r.join('')),rbr:29,study:true,
 sorcerer:{posts:[{c:61,r:30}],first:9999,leave:'kneel'}};
const g=Core.createGame([room],{room:0});
Core.step(g,keysToInput('r'));
assert.equal(g.sorc.warded,true,'unfrozen distant pool wards the Sorcerer');
g.bolts.push({x:61*8,y:31*8,w:6,h:6,vx:0,vy:0,ovx:0,ovy:0,alive:true,from:'sorc',frost:true,marked:true});
const events=[];
for(let i=0;i<3;i++){Core.step(g,keysToInput(''));events.push(...g.events);g.events.length=0;}
assert.ok(events.some(e=>e.type==='sorc-frost'),'an orb freezes water beyond both old viewport limits');
assert.equal(g.sorc.warded,false,'the distant pool dropping its ward is recognized');
assert.equal(g.sorc.state,'broken');
assert.ok(events.some(e=>e.type==='sorc-break'));
const native=Rooms.all.filter(r=>r.sorcerer);
assert.equal(native.length,6,'cover every native Sorcerer room');
for(const def of native){
 const result=runRoom([def],0,Rooms.tapes[def.id],{maxExtra:60});
 assert.equal(result.exited,true,def.id+' exits');
 assert.equal(result.deaths,0,def.id+' retains its zero-death route');
}
console.log('PASS: distant frost/ward interaction and all six native Sorcerer routes.');
