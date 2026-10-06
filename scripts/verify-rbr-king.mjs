// The throne's marks require distinct bodies; bells and the Right Hand retain their rules.
import assert from 'node:assert/strict';
import {Core,Rooms,sideRun,keysToInput} from './rbr-lib.mjs';
for(const id of ['k14-marks','k14-echo','k14-return','k14-hall','k14-throne','k14-last']){
 const tape=Rooms.tapes[id],right=sideRun(id,tape);
 assert(right.exited&&!right.deaths&&right.g.crown.done,`${id}: paired marks open the gate`);
 const key=id==='k14-marks'?'g':'q';
 const wrong=sideRun(id,tape.map(([n,k])=>[n,k.replaceAll(key,'')]));
 assert(!wrong.exited&&!wrong.g.crown.done,`${id}: one body cannot claim two marks`);
}
const g=Core.createGame(Rooms.all,{room:Rooms.all.findIndex(r=>r.id==='k14-throne')});
// Place the knight and a stationary echo on the marks to isolate the sustained hold rule.
g.p.x=208;g.p.y=101;g.p.vx=g.p.vy=0;
g.ents.push({type:'echo',x:56,y:133,w:8,h:11});
const hold=g.crown.hold;
for(let i=0;i<hold-1;i++)Core.step(g,keysToInput(''));
assert.equal(g.crown.t,hold-1);assert(!g.crown.done);
Core.step(g,keysToInput(''));assert(g.crown.done);
// (7.280) The King throws while you hold: a knight who never answers a bolt dies on the mark.
{const g2=Core.createGame(Rooms.all,{room:Rooms.all.findIndex(r=>r.id==='k14-throne')});g2.p.x=208;g2.p.y=101;g2.ents.push({type:'echo',x:56,y:133,w:8,h:11});
 let cause=null;for(let i=0;i<200&&!cause;i++){Core.step(g2,keysToInput(i<1?'r':''));for(const e of g2.events)if(e.type==='death')cause=e.cause;g2.events.length=0;}
 assert.equal(cause,'bolt','the King\'s bolt kills a knight who only stands on the mark');}
// The Last Seal turns: two seals, the second needs the trade back to the echo and the King's seam.
{const t=Rooms.tapes['k14-last'],r=sideRun('k14-last',t);
 assert.equal(r.events.filter(e=>e.type==='crown-seal').length,2,'two seals');assert(r.events.some(e=>e.type==='crown-turn'));
 assert(r.events.some(e=>e.type==='zip-in'),'the second pair is reached by his seam');
 let q=0;const noTrade=t.map(([n,k])=>{if(!k.includes('q'))return [n,k];q++;return q===2?[n,k.replaceAll('q','')]:[n,k];});
 const w=sideRun('k14-last',noTrade);assert(!w.exited,'without the trade back the second seal cannot be held');}
const alarm=sideRun('k14-q-signal',Rooms.tapes['k14-q-signal']);
assert(alarm.exited&&!alarm.deaths&&alarm.g.alarm.done);
assert.equal(alarm.events.filter(e=>e.type==='alarm-note').length,5);
const missing=Rooms.tapes['k14-q-signal'].map(([n,k],i)=>[n,i===5?k.replace('s',''):k]);
const wrong=sideRun('k14-q-signal',missing);assert(!wrong.g.alarm.done&&!wrong.exited,'wrong signal keeps the gate closed');
const hand=sideRun('k14-hand',Rooms.tapes['k14-hand']);
assert(hand.exited&&!hand.deaths&&hand.g.hand.gone);assert.equal(hand.g.hand.hits,3);
const bare=sideRun('k14-hand',Rooms.tapes['k14-hand'].map(([n,k])=>[n,k.replace(/[ps]/g,'')]));
assert(!bare.exited&&!bare.g.hand.gone,'movement alone cannot defeat the Right Hand');
console.log('paired bodies, sustained seal under the King\'s bolts, the turning Last Seal, bell sequence and three-wound duel pass');
