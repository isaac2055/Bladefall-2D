import assert from 'node:assert/strict';
import {Core} from '../pcore-tape.mjs';
import '../../public/bladefall-workshop-ascend-coop-core.js';
const S=globalThis.BladefallWorkshopAscendCoopCore;
const map=Array.from({length:23},()=>Array(40).fill('.'));map[21][2]='P';map[22].fill('#');
const def={id:'delayed-finish',cols:40,rows:23,map:map.map(r=>r.join('')),exit:'right',movement:'survive-2',coreCheckpoints:[{c:15,r:21,width:20}]};
for(const first of [0,1]){
 const s=S.create(def);Object.assign(s.g.players[first],{x:319,y:165});S.step(s);assert(s.actors[first].exited);assert(s.g.players[first].waitingForPartner);assert(!s.complete);const pose={x:s.g.players[first].x,y:s.g.players[first].y},frame=s.g.frame;
 for(let i=0;i<300;i++){const inputs=[{},{}];inputs[first]={r:true,dash:true,strike:true,parry:true};S.step(s,inputs);}
 assert.equal(s.g.frame-frame,300,'unfinished actor continues world clock even when host is parked');assert.deepEqual({x:s.g.players[first].x,y:s.g.players[first].y},pose);assert.equal(s.g.deaths,0);assert.equal(s.g.players[first].strikeTimer,0);
 Core.kill(s.g,s.g.players[first],'late-hazard');assert.equal(s.g.deaths,0);assert(s.actors[first].exited);
 for(let i=0;i<240&&!s.complete;i++){const inputs=[{},{}];inputs[1-first]={r:true};S.step(s,inputs);}assert(s.complete);assert(s.g.players.every(p=>p.waitingForPartner));S.retry(s);assert(s.g.players.every(p=>!p.waitingForPartner));assert(!s.complete);assert.equal(s.g.coreRun.index,0);
}
const dead=S.create(def);dead.g.players[0].x=319;S.step(dead);Core.kill(dead.g,dead.g.players[1],'test');for(let i=0;i<100&&dead.epoch===0;i++)S.step(dead);assert.equal(dead.epoch,1);assert(dead.actors.every(a=>!a.exited));assert(dead.g.players.every(p=>!p.waitingForPartner));
console.log('PASS: either first finisher waits safely for 300 frames, attacks/late damage disabled, partner clock and completion continue, retry/death reset both actors.');
