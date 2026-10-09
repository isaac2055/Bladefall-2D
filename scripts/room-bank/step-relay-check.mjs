// Focused rule checks for the opt-in bank device; these are not playtest ratings or route proofs.
import assert from 'node:assert/strict';
import '../../public/bladefall-pcore.js';
import '../../public/bladefall-pcore-dev-step-relay.js';
import '../../public/bladefall-pcore-dev-gravity.js';
const Core=globalThis.BladefallPrecisionCore;
const relay=g=>g.ents.filter(e=>e.type==='stepRelay');
function fixture({spawn=[11,10],floor=22,put=[],relays}={}){
 const map=Array.from({length:23},(_,r)=>Array.from({length:40},(_,c)=>r>=floor||c===0||c===39?'#':'.'));
 for(const [c,r,ch]of put)map[r][c]=ch;
 map[spawn[1]][spawn[0]]='P';
 return {id:'step-relay-check',name:'Step relay fixture',map:map.map(r=>r.join('')),stepRelays:relays||[
  {id:'A',duration:36,platforms:[{c:10,r:15,w:4,to:[0,-5]},{c:24,r:10,w:4,to:[0,5]}]},
  {id:'B',platforms:[{c:32,r:18,w:3,to:[0,-3]}]}
 ]};
}
function ticks(g,n,raw={}){for(let i=0;i<n;i++)Core.step(g,raw);}
function until(g,predicate,n=160){for(let i=0;i<n;i++){Core.step(g,{});if(predicate(g))return;}assert.fail('condition not reached');}
function make(){return Core.createGame([fixture()]);}
{
 const g=make();until(g,q=>relay(q)[0].triggers===1);
 assert.equal(relay(g)[1].triggers,1,'a landing switches its partner');
 assert.equal(relay(g)[2].triggers,0,'another group remains still');
 ticks(g,100);
 assert.equal(relay(g)[0].y,80,'platform reaches its second authored position');
 assert.equal(relay(g)[1].y,120,'partner moves oppositely');
 assert.equal(g.p.y+g.p.h,relay(g)[0].y,'rider stays on the platform');
 assert.equal(relay(g)[0].triggers,1,'riding does not switch repeatedly');
 assert.equal(g.deaths,0);
 ticks(g,1,{jump:true});until(g,q=>relay(q)[0].triggers===2);ticks(g,80);
 assert.equal(relay(g)[0].y,120,'a fresh landing returns the pair');
 assert.equal(relay(g)[1].y,80);
 assert.equal(relay(g)[0].triggers,2);
 Core.resetRoom(g);
 assert.deepEqual(relay(g).map(e=>[e.y,e.u,e.target,e.triggers]),[[120,0,0,0],[80,0,0,0],[144,0,0,0]],'retry deterministically resets every member');
}
{
 const g=make();until(g,q=>relay(q)[0].triggers===1);ticks(g,9);
 const p=g.p,e=relay(g)[0];
 // A short real fall onto the moving platform isolates reversal from an unrelated long jump arc.
 Object.assign(p,{x:e.x+8,y:e.y-p.h-3,vy:120,remY:0,onGround:false,stepRelayAirborne:true});
 until(g,q=>relay(q)[0].triggers===2,8);const reverseY=relay(g)[0].y;
 ticks(g,1);assert.ok(relay(g)[0].y>=reverseY,'reversing travels back without teleporting');
 ticks(g,60);assert.equal(relay(g)[0].y,120);assert.equal(relay(g)[0].triggers,2);
}
{
 const g=make();until(g,q=>relay(q)[0].triggers===1);ticks(g,10);
 assert.ok(g.p.liftY<0,'riding records the upward lift');
 ticks(g,1,{jump:true});assert.ok(g.p.vy<Core.K.jumpSpeed,'jump inherits upward platform speed');
 assert.equal(g.p.dashes,1,'switching and jumping do not spend the dash');
}
{
 const put=Array.from({length:9},(_,i)=>[i+1,15,'#']);
 const g=Core.createGame([fixture({spawn:[7,14],put})]);ticks(g,28,{r:true});
 assert.ok(g.p.x>=80&&g.p.x<112,'walk reaches the relay from adjacent ground');
 assert.equal(relay(g)[0].triggers,0,'walking onto a relay is not a landing');
}
{
 const g=Core.createGame([fixture({spawn:[17,19],floor:20,relays:[{platforms:[{c:20,r:17,w:3,h:3,to:[3,0]}]}]})]);
 ticks(g,1,{});ticks(g,14,{r:true,dash:true});
 assert.equal(relay(g)[0].triggers,0,'a side dash does not switch');
}
{
 const g=make();until(g,q=>relay(q)[0].triggers===1);ticks(g,10);
 const original=relay(g).map(e=>({y:e.y,oy:e.oy,dy:e.relayDY,u:e.u}));
 globalThis.BladefallPrecisionGravity.mirror(g);
 relay(g).forEach((e,i)=>{assert.equal(e.y,184-original[i].y-e.h);assert.equal(e.oy,184-original[i].oy-e.h);assert.equal(e.relayDY,-original[i].dy);assert.equal(e.u,original[i].u);});
 globalThis.BladefallPrecisionGravity.mirror(g);
 assert.deepEqual(relay(g).map(e=>({y:e.y,oy:e.oy,dy:e.relayDY,u:e.u})),original,'two gravity flips restore device state');
}
{
 const a=Core.createGame([fixture({relays:[]})]);const before=Core.digest(a);ticks(a,30);
 assert.equal(relay(a).length,0,'rooms without stepRelays have no entities');
 assert.equal(a.p.stepRelayAirborne,undefined,'rooms without stepRelays get no player state');
 assert.ok(before);
}
console.log('PASS: landing/group isolation, carry without retrigger, fresh landing/reversal, lift momentum, no dash cost, walking/side contact, reset, gravity reflection, opt-in state.');
