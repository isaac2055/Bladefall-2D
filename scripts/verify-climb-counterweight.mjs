import assert from 'node:assert/strict';
import {Core,worlds,view,PV,st,R} from './climb-passage-fixture.mjs';
const w=worlds.find(w=>w.n===6),def=w.rooms.find(d=>d.atlasTransit?.lift),spec=def.atlasTransit.lift;
PV.climb.startWorld(6);Core.enterRoom(view.g,R.all.findIndex(r=>r.id===def.id));const g=view.g;
Object.assign(g.p,{x:spec.x+spec.w/2-4,y:spec.bottom-11,vx:0,vy:0,onGround:true});view.lastInput={};
let reachedTop=false,previousY=g.p.y;
for(let f=0;f<600;f++){
 PV.holding();Core.step(g,{});g.events.length=0;
 assert.ok(Math.abs(g.p.y-previousY)<=3,'lift does not teleport rider');previousY=g.p.y;
 assert.equal(g.deaths,0);const lift=g.ents.find(e=>e.type==='climb-lift');
 if(lift.state==='wait'){assert.equal(g.p.y+g.p.h,spec.top);reachedTop=true;break;}
}
assert.ok(reachedTop,'lift carries rider to upper dock');
// Step off onto the top dock and let the empty counterweight return.
for(let i=0;i<25;i++){view.lastInput={l:true};PV.holding();Core.step(g,view.lastInput);g.events.length=0;}
for(let i=0;i<600;i++){view.lastInput={};PV.holding();Core.step(g,{});g.events.length=0;}
assert.equal(g.deaths,0);assert.equal(g.ents.find(e=>e.type==='climb-lift').state,'idle');assert.equal(g.ents.find(e=>e.type==='climb-lift').y,spec.bottom);
assert.ok(g.p.y+g.p.h<=spec.top+1,'player remains on upper dock');
Core.resetRoom(g);view.lastInput={};PV.holding();assert.equal(g.ents.filter(e=>e.type==='climb-lift').length,0,'lift waits through respawn');
g.p.state='normal';PV.holding();assert.equal(g.ents.filter(e=>e.type==='climb-lift').length,1);PV.holding();assert.equal(g.ents.filter(e=>e.type==='climb-lift').length,1,'no duplicate lifts');
console.log('Chainwell counterweight: smooth full-height ride, dismount, automatic empty return and respawn verified.');
