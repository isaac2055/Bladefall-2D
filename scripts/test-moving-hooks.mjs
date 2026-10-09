// Focused contracts for the opt-in moving anchor; authored rooms provide normal-spawn solutions.
import assert from'node:assert/strict';
import{Core,runRoom,keysToInput}from'./pcore-tape.mjs';
import{readFileSync}from'node:fs';
const map=()=>{const m=Array.from({length:23},(_,r)=>Array.from({length:40},(_,c)=>!r||r===22||!c||c===39?'#':'.'));m[20][4]='P';return m;};
function room(wall=false){const m=map();if(wall)for(let r=1;r<22;r++)m[r][20]='#';return{id:'moving-fixture',map:m.map(x=>x.join('')),movingHooks:[{id:'A',c:9,r:7,w:2,to:[15,0],period:240}]};}
const g=Core.createGame([room()]);Core.step(g,keysToInput('r'));
const e=g.ents.find(e=>e.type==='hookCarrier'),r=g.ents.find(e=>e.movingHook);
Object.assign(g.p,{x:r.x,y:r.y+12,state:'hook',onGround:false,vx:e.vx,vy:e.vy,hook:{ring:r,len:12,carrierVX:e.vx,carrierVY:e.vy}});
for(let i=0;i<25;i++){Core.step(g,keysToInput('g'));assert.equal(g.p.state,'hook');assert.ok(Math.abs(g.p.vx-e.vx)<(i?5:.001),'carrier lift is applied once, allowing pixel pendulum correction');}
const before=g.p.vx;Core.step(g,{});assert.ok(g.events.some(x=>x.type==='moving-unhook'));assert.equal(g.p.hook,null);assert.ok(Math.abs(g.p.vx-before)<10,'release does not add carrier velocity a second time');
assert.throws(()=>Core.createGame([{...room(),movingHooks:[...room().movingHooks,...room().movingHooks]}]),/Duplicate/);
assert.throws(()=>Core.createGame([{...room(),movingHooks:[{id:'bad',c:2,r:3,to:[NaN,1]}]}]),/Invalid/);
const oldRing=r;Core.resetRoom(g);const resetRing=g.ents.find(e=>e.movingHook);assert.notEqual(resetRing,oldRing);assert.equal(resetRing.id,oldRing.id);assert.equal(g.p.hook,null);assert.equal(g.ents.find(e=>e.type==='hookCarrier').clock,0);
const blocked=Core.createGame([room(true)]);for(let i=0;i<120;i++)Core.step(blocked,keysToInput('r'));assert.ok(blocked.ents.find(e=>e.type==='hookCarrier').x+16<=160,'body cannot move through the wall');
const stopped=blocked.ents.find(e=>e.type==='hookCarrier'),clock=stopped.clock;for(let i=0;i<10;i++)Core.step(blocked,{});assert.equal(stopped.clock,clock,'blocked rail clock pauses instead of accumulating teleport distance');for(let y=1;y<22;y++)blocked.room.grid[y*40+20]=Core.EMPTY;const oldX=stopped.x;Core.step(blocked,{});assert.ok(Math.abs(stopped.x-oldX)<=2,'unblocking resumes without a catch-up jump');
const obstruct=Core.createGame([room()]);const rr=obstruct.ents.find(e=>e.movingHook);Object.assign(obstruct.p,{x:rr.x,y:rr.y+30,state:'hook',onGround:false,hook:{ring:rr,len:30},vx:0,vy:0});const c=Math.floor((rr.x+4)/8),row=Math.floor((rr.y+16)/8);obstruct.room.grid[row*40+c]=Core.SOLID;Core.step(obstruct,keysToInput('g'));assert.equal(obstruct.p.hook,null);assert.ok(obstruct.events.some(e=>e.type==='moving-hook-blocked'));
const fixed=JSON.parse(readFileSync(new URL('./room-bank/fractured/23-bank-f23.json',import.meta.url)));const z=runRoom([fixed.room],0,fixed.tape);assert.ok(z.exited&&!z.deaths);assert.ok(!z.events.some(e=>e.type==='moving-hook'),'ordinary fixed hook keeps its route');
console.log('PASS: moving anchor velocity/release, identity reset, solid collision, obstructed rope, fixed-hook route.');
