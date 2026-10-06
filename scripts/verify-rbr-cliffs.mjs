import assert from 'node:assert/strict';
import {Core,Rooms,sideRun,keysToInput} from './rbr-lib.mjs';
// (7.280) Each head now takes three hooked cuts; the Tidal and Storm chains drag the collar across the chasm after
// each cut; the First and Storm heads spit at the knight.
for(const id of ['t16-bite','t16-tide-head','t16-storm']){
 const tape=Rooms.tapes[id],r=sideRun(id,tape),need=Rooms.all.find(d=>d.id===id).chainHydra.need||2;
 assert(r.exited&&!r.deaths&&r.g.chainHydra.done,id);assert.equal(r.g.chainHydra.hits,need);
 const cuts=r.events.filter(e=>e.type==='hydra-lock');assert.equal(cuts.length,need);
 for(let k=1;k<cuts.length;k++)assert(r.events.some(e=>e.type==='hook'&&e.i>cuts[k-1].i&&e.i<cuts[k].i),id+': every cut needs a fresh hooked ascent');
 for(const key of ['g','s']){const wrong=sideRun(id,tape.map(([n,k])=>[n,k.replaceAll(key,'')]));assert(!wrong.exited&&!wrong.g.chainHydra.done,id+' needs hook and blade');}
 const upward=sideRun(id,tape.map(([n,k])=>[n,k.includes('s')?k.replaceAll('d','')+'u':k]));assert(!upward.exited&&!upward.g.chainHydra.done,'upward cuts cannot free collar');
 const def=Rooms.all.find(d=>d.id===id).chainHydra;
 if(def.locks){const drags=r.events.filter(e=>e.type==='hydra-drag');assert.equal(drags.length,need-1,id+': the collar is dragged after each cut');
  assert.deepEqual(cuts.map(e=>[Math.floor(e.x/8),Math.floor(e.y/8)]),def.locks.slice(0,need),id+': each cut lands where the collar was dragged');}
 if(def.spit){const g=Core.createGame(Rooms.all,{room:Rooms.all.findIndex(d=>d.id===id)});let cause=null;
  for(let i=0;i<400&&!cause;i++){Core.step(g,keysToInput(i<1?'l':''));for(const e of g.events)if(e.type==='death')cause=e.cause;g.events.length=0;}
  assert.equal(cause,'bolt',id+': the spit kills a knight who ignores it');}
 console.log('ok',id,need,'cuts',def.locks?'· dragged collar':'',def.spit?'· spit':'');
}
// Without the opt-in fields a collar still takes two cuts at a fixed lock.
{const d={...Rooms.all.find(r=>r.id==='t16-bite')};d.chainHydra={phase:0,c:34,r:7};const rooms=[...Rooms.all,d];const g=Core.createGame(rooms,{room:rooms.length-1});
 assert.equal(g.chainHydra.need,undefined);assert.equal(g.chainHydra.c,34);assert(!g.bolts||!g.bolts.length);console.log('ok a plain collar keeps two cuts at a fixed lock');}
console.log('three Hydra collars: fresh hooked downward cuts required, routes clear without deaths');
