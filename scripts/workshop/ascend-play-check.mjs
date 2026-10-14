import assert from 'node:assert/strict';
import {Core} from '../pcore-tape.mjs';
import '../../public/bladefall-workshop-ascend-coop-core.js';
import '../../public/bladefall-workshop-ascend-play.js';
const P=globalThis.BladefallWorkshopAscendPlay;
const map=Array.from({length:23},()=>Array(40).fill('.'));map[21][2]='P';map[22].fill('#');
const definition={id:'network-ascend',cols:40,rows:23,map:map.map(r=>r.join('')),exit:'right',movement:'survive-2',coreCheckpoints:[{c:15,r:21,width:20}]};
function pair(room=definition){const toHost=[],toGuest=[],errors=[];let finishes=0;const h=P.create({definition:room,role:'host',send:p=>toGuest.push(structuredClone(p)),onError:e=>errors.push(e),onComplete:()=>finishes++}),g=P.create({definition:room,role:'guest',send:p=>toHost.push(structuredClone(p)),onError:e=>errors.push(e),onComplete:()=>finishes++});const deliver=()=>{while(toHost.length||toGuest.length){while(toHost.length)h.receive(toHost.shift());while(toGuest.length)g.receive(toGuest.shift());}};h.ready();g.ready();deliver();return {h,g,deliver,toHost,toGuest,errors,finishes:()=>finishes};}
const pair1=pair();const {h,g,deliver}=pair1;
for(let i=0;i<100;i++){g.tick({r:i<80,jump:i===20});deliver();h.tick({r:true,jump:i===40});deliver();}g.tick();
const host=h.state().simulation,guest=g.state().simulation;
assert.equal(h.state().frame,g.state().frame);assert.deepEqual(host.actors,guest.actors);assert.deepEqual(host.g.ents,guest.g.ents);assert.equal(host.g.coreRun.index,guest.g.coreRun.index);assert.notEqual(host.g.players[0].x,host.g.players[1].x,'independent player inputs');
// Wrong-role traffic cannot change host physics or inject authoritative guest frames.
const old=h.state().frame;h.receive({ascend:'frame',seq:1000,inputs:[{l:true},{}]});assert.equal(h.state().frame,old);
// A short stall catches up in exact order; duplicate frames are ignored.
const lag=pair();for(let i=0;i<20;i++){lag.h.tick({r:true});lag.deliver();}assert.equal(lag.g.state().pending,20);for(let i=0;i<3;i++)lag.g.tick();assert.equal(lag.g.state().frame,20);assert.deepEqual(lag.h.state().simulation.actors,lag.g.state().simulation.actors);lag.g.receive({ascend:'frame',seq:20,inputs:[{},{}]});assert.equal(lag.g.state().pending,0);
// Missing frames stop rather than silently simulate a different world.
lag.g.receive({ascend:'frame',seq:22,inputs:[{},{}]});assert(!lag.g.state().connected);assert.match(lag.errors[0],/lost/);
// Stale guest input is released, even if no explicit key-up arrives.
const stale=pair();stale.g.tick({r:true});stale.deliver();for(let i=0;i<60;i++)stale.h.tick();assert.equal(stale.h.state().simulation.g.players[1].vx,0);
// Disconnected previews cannot advance, and malformed inputs cannot set arbitrary state.
const stopped=pair();stopped.h.stop();stopped.h.tick({r:true});assert.equal(stopped.h.state().frame,0);const bad=pair();bad.h.receive({ascend:'input',seq:1,input:{r:'true',state:'dash',x:500}});bad.h.tick();assert.equal(bad.h.state().simulation.g.players[1].x,16);
const finished=pair();for(let i=0;i<240;i++){finished.g.tick({r:true});finished.deliver();finished.h.tick({r:true});finished.deliver();}finished.g.tick();assert.equal(finished.finishes(),2);assert(finished.h.state().simulation.complete&&finished.g.state().simulation.complete);const endFrame=finished.h.state().frame;finished.h.tick({r:true});assert.equal(finished.h.state().frame,endFrame);
const deadly=structuredClone(definition),rows=deadly.map.map(r=>r.split(''));rows[21][10]='^';deadly.map=rows.map(r=>r.join(''));const deaths=pair(deadly);for(let i=0;i<200;i++){deaths.g.tick({r:true});deaths.deliver();deaths.h.tick({r:true});deaths.deliver();}deaths.g.tick();assert(deaths.h.state().simulation.epoch>0);assert.deepEqual(deaths.h.state().simulation.actors,deaths.g.state().simulation.actors);assert.equal(deaths.h.state().simulation.epoch,deaths.g.state().simulation.epoch);
console.log('PASS: authoritative native Ascend frame transport, independent guest inputs, ordered catch-up, duplicate/role guards, gap-stop, stale input release, disconnect, shared death/retry and joint completion.');
