import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import {Core,expand,keysToInput,runRoom} from '../pcore-tape.mjs';
import {coreCrumbleGrace} from './core-difficulty.mjs';
const path='scripts/room-bank/fractured/101-bank-f101.json',x=JSON.parse(readFileSync(path));
let authored;
vm.runInNewContext(readFileSync('scripts/climb/author-keep-core.mjs','utf8').replace(/^import .*;\n/gm,''),{writeFileSync:(_p,s)=>{authored=JSON.parse(s);},coreCrumbleGrace});
assert.deepEqual(authored.room,x.room,'Author source must regenerate current geometry and save points.');
assert.equal(x.room.crumbleExtraFrames,40);
const whole=runRoom([x.room],0,x.tape,{trace:true});assert.ok(whole.exited);assert.equal(whole.deaths,0);
const count={};for(const e of whole.events)count[e.type]=(count[e.type]||0)+1;
for(const [event,n] of Object.entries(x.bank.requiredEventCounts))assert.ok(count[event]>=n,`${event}: ${count[event]} < ${n}`);
const parts=[];
for(let i=0;i<x.verification.partTapes.length;i++){
 const g=Core.createGame([x.room]);if(i){g.coreRun.index=i-1;Core.resetRoom(g);g.p.state='normal';g.p.respawnTimer=0;}
 let done=false,n=0;for(const k of expand(x.verification.partTapes[i])){Core.step(g,keysToInput(k));n++;assert.equal(g.deaths,0,`Part ${i+1} died`);if(i===x.room.coreCheckpoints.length?g.exited:g.coreRun.index>=i){done=true;break;}g.events.length=0;}
 assert.ok(done,`Part ${i+1} not completed`);parts.push(n);
}
assert.equal(parts.length,6);
const upper=runRoom([x.room],0,x.verification.alternateOpeningTape);
assert.equal(upper.deaths,0);assert.ok(upper.events.some(e=>e.type==='core-checkpoint'&&e.index===0));assert.ok(!upper.events.some(e=>e.type==='pod'));
const noGrab=runRoom([x.room],0,x.tape.map(([n,k])=>[n,k.replaceAll('g','')]));assert.ok(!noGrab.exited&&noGrab.deaths>0);
const frames=expand(x.tape),delay=runRoom([x.room],0,[...frames.slice(0,324),...Array(180).fill('g'),...frames.slice(324)].map(k=>[1,k]),{trace:true});assert.ok(!delay.exited&&delay.deaths>0);assert.ok(Math.min(...delay.log.map(t=>t.st2))<Core.K.climbTired);
const proof={room:x.room.id,status:'native verified; awaiting player review and release integration',whole:{frames:whole.exitFrame+1,deaths:0,eventCounts:count,minimumStamina:Math.min(...whole.log.map(t=>t.st2))},freshParts:parts,alternateOpening:{frames:expand(x.verification.alternateOpeningTape).length,deaths:0,seedStrikes:0},probes:{removeGrab:{exited:noGrab.exited,deaths:noGrab.deaths},extraThreeSecondHang:{exited:delay.exited,deaths:delay.deaths,minimumStamina:Math.min(...delay.log.map(t=>t.st2))}},limits:'No live browser or human completion claimed. Removing grab from this tape is a route sensitivity probe, not exhaustive shortcut analysis.'};
writeFileSync('docs/room-bank/keep-core-proof.json',JSON.stringify(proof,null,2)+'\n');console.log('PASS: Keep whole route, all six fresh parts, optional seed-free opening, stamina delay and no-grab sensitivity, author geometry parity.');
