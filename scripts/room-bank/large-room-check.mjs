// Regressions for devices used beyond the old 40x23 viewport. Physics stays unscaled.
import assert from 'node:assert/strict';
import {Core,keysToInput} from '../pcore-tape.mjs';
const cols=80,rows=46,map=Array.from({length:rows},()=>Array(cols).fill('.'));
const put=(c,r,s)=>[...s].forEach((v,i)=>map[r][c+i]=v);
put(0,45,'#'.repeat(cols));put(48,36,'}'.repeat(14));put(48,34,'P');put(60,25,'O');put(50,30,'/');put(44,30,'c');
for(let r=32;r<=37;r++)put(74,r,'%');put(69,40,'%%');
const room={id:'large-device-fixture',name:'Large room dimensions',cols,rows,map:map.map(x=>x.join('')),beams:[{c:50,r:0,dir:'d'},{c:0,r:20,dir:'r'}],beamsHarmless:true,
 portalMode:'one',portals:[{color:'orange',c:69,r:40,face:'u'}],movingHooks:[{id:'Far',c:63,r:27,w:3,to:[8,0],period:180}],combat:{enemies:[{kind:'guard',x:520,y:335,delay:999}]}};
const g=Core.createGame([room],{room:0});
assert.equal(g.room.w,640);assert.equal(g.room.h,368);
assert.ok(g.ents.some(e=>e.type==='ring'&&e.x>=480),'fixed ring beyond old width parsed');
assert.ok(g.ents.some(e=>e.type==='hookCarrier'),'moving carrier accepted beyond old bounds');
assert.ok(g.ents.some(e=>e.type==='stone'&&e.lit),'beam beyond the old width reflects at its actual mirror and lights a tally');
assert.ok(g.beams.paths.some(p=>p[0]===4&&p[2]>600),'beam traces across the full large map');
for(let i=0;i<60;i++)Core.step(g,keysToInput(i===0?'r':''));
assert.equal(g.p.state,'normal');assert.ok(g.p.x>400,'far conveyor carries the knight');
assert.ok(!g.combat.enemies[0].dead,'enemy below old screen bottom survives on the real floor');
g.p.x=560;g.p.y=268;g.p.vx=g.p.vy=0;
Core.step(g,keysToInput('rq'));
assert.ok(g.portals.blue?.c===74,'portal gun can place on a wall beyond the original viewport');
assert.ok(g.portalHoles.has(40*cols+69),'portal holes use the actual row stride');
console.log('PASS: wide/tall beams, mirror, tally, belt, fixed and moving hooks, enemy bounds and portal placement.');
