import assert from 'node:assert/strict';
import {Core} from '../pcore-tape.mjs';
const D=globalThis.BladefallPrecisionSweeper,dev=globalThis.BladefallPrecisionDevices.find(d=>d.name==='sweeper');
const map=Array.from({length:23},(_,r)=>r===0||r>=21?'#'.repeat(40):'#'+'.'.repeat(38)+'#');map[20]='#..P'+'.'.repeat(35)+'#';
const def={id:'sweeper-check',map,study:true,sweepers:[{id:'A',path:[[10,10],[20,10]],period:160}]};
const g=Core.createGame([def]);assert.equal(g.sweepers[0].x,84);for(let i=0;i<30;i++)Core.step(g,{});assert.equal(g.sweeperClock,0);
Core.step(g,{r:true});assert.equal(g.sweeperClock,1);assert.equal(g.sweepers[0].x,85);assert.equal(D.at(g.sweepers[0],80).x,164);assert.equal(D.at(g.sweepers[0],160).x,84);
assert.equal(Core.solidAt(g,84,84,1,1),false,'sweeper is not an invisible platform');
Core.resetRoom(g);assert.equal(g.sweeperClock,0);assert.equal(g.sweepers[0].x,84);
g.p.state='normal';Core.step(g,{portal:true});assert.equal(g.sweeperClock,1,'portal/echo input also starts the patrol');Core.resetRoom(g);
// The player and obstacle exchange sides in one frame without overlapping at either endpoint.
Object.assign(g.p,{x:70,y:78,w:8,h:11,state:'normal'});dev.before(g);g.p.x=100;dev.after(g);assert.equal(g.p.state,'dead');assert.equal(g.events.at(-1).cause,'sweeper');
Core.resetRoom(g);Object.assign(g.p,{x:70,y:78,state:'normal'});dev.before(g);g.p.x=100;Core.emit(g,'echo-swap');dev.after(g);assert.notEqual(g.p.state,'dead','teleport does not hit the unoccupied middle');
Core.resetRoom(g);Object.assign(g.p,{x:70,y:78,state:'normal'});dev.before(g);g.p.x=82;Core.emit(g,'portal-pass',{kind:'knight'});dev.after(g);assert.equal(g.p.state,'dead','teleport arrival remains lethal');
Core.resetRoom(g);const old=structuredClone(g.sweepers[0]);globalThis.BladefallPrecisionGravity.mirror(g);assert.equal(g.sweepers[0].y,184-old.y);globalThis.BladefallPrecisionGravity.mirror(g);assert.equal(g.sweepers[0].y,old.y);
Core.resetRoom(g);assert.equal(g.flipped,false);assert.equal(g.sweepers[0].y,84);
const loop={...def,sweepers:[{path:[[4,4],[8,4],[8,8],[4,8]],period:128,loop:true}]};const h=Core.createGame([loop]);assert.deepEqual(D.at(h.sweepers[0],32),{x:68,y:36});assert.deepEqual(D.at(h.sweepers[0],128),{x:36,y:36});
console.log('Sweepers: opt-in, input clock, reset, paths, non-solid, swept dash collision, echo/portal discontinuity, and gravity PASS.');
