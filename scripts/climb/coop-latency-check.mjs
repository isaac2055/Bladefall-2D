import assert from 'node:assert/strict';
await import('../../public/bladefall-pcore.js');
await import('../../public/bladefall-coop-practice-core.js');
await import('../../public/bladefall-coop-practice-session.js');
import {routes} from './coop-practice-routes.mjs';
const S=globalThis.BladefallCoopPracticeSession;
for(const delay of [0,60,120])for(let room=0;room<8;room++)for(let roles=0;roles<2;roles++){
 let time=0,seq=0;const host=S.create({room,roles,now:()=>time}),token='latency-fixture-guest',queue=[];
 host.receive({type:'hello',token});
 for(const[n,a,b]of [...routes[room],[30,{},{}]])for(let i=0;i<n;i++){
  time+=1000/60;const pair=roles?[b,a]:[a,b];queue.push({at:time+delay,buttons:pair[1],epoch:host.state.epoch});
  while(queue.length&&queue[0].at<=time){const packet=queue.shift();host.receive({type:'input',token,epoch:packet.epoch,seq:++seq,buttons:packet.buttons});}
  host.local(pair[0]);host.tick();
 }
 assert.equal(host.state.game.deaths,0,`${room} roles ${roles} with ${delay} ms one-way delay`);
 assert(host.state.game.complete,`${room} roles ${roles} with ${delay} ms one-way delay completes`);
}
console.log('PASS: every practice room in both role assignments with 0, 60 and 120 ms delayed guest input (48 complete zero-death routes). This is a simulated ordered network, not an internet playtest.');
