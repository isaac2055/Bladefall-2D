// The ward requires a portal return at its lit height; direct movement cannot clear it.
// (7.280) Harder wards: each needs more returns, and after a return his lane (and in the crown, the band) walks,
// so the knight must re-aim; the middle and crown add the rake, an aimed bolt that kills a knight who ignores it.
import assert from 'node:assert/strict';
import {Core,Rooms,sideRun,keysToInput} from './rbr-lib.mjs';
const need={'v13-low':2,'v13-middle':2,'v13-crown':3};
for(const id of ['v13-low','v13-middle','v13-crown']){
 const tape=Rooms.tapes[id];assert(tape,`${id}: intended tape`);
 const right=sideRun(id,tape);assert(right.exited&&!right.deaths,`${id}: safe completion`);
 assert(right.g.tyrant.gone,`${id}: ward withdrawn`);
 assert.equal(right.g.tyrant.hits,need[id]);
 const wrong=sideRun(id,tape.map(([n,k])=>[n,k.replaceAll('q','')]));
 assert(!wrong.exited&&!wrong.g.tyrant.hits,`${id}: moving without the portals cannot beat the ward`);
 assert(right.events.some(e=>e.type==='portal-pass'&&e.kind==='tyrant-bolt'));
 // The walk: after the first return his lane moves, and the old aim no longer lands.
 assert(right.events.some(e=>e.type==='tyrant-walk'),`${id}: the lane walks after a return`);
 let shots=0;const stale=tape.map(([n,k])=>{if(!k.includes('q'))return [n,k];shots++;return shots>2?[n,k.replaceAll('q','')]:[n,k];});
 const still=sideRun(id,stale,600),wins=still.events.filter(e=>e.type==='tyrant-hit').length;
 assert(!still.exited&&wins===1,`${id}: keeping the first aim wins only the first return (${wins})`);
 console.log('ok',id,'requires',need[id],'portal returns and a re-aim after the walk');
}
// The rake: a knight standing in the open (the arena floor, away from the ledgers) is hit by it.
for(const id of ['v13-middle','v13-crown']){
 const g=Core.createGame(Rooms.all,{room:Rooms.all.findIndex(r=>r.id===id)});let died=null;
 g.p.x=150;g.p.y=133;g.p.vx=g.p.vy=0;   // the open floor between the ledgers and the Tyrant
 for(let i=0;i<400&&!died;i++){Core.step(g,keysToInput(i<2?'r':''));for(const e of g.events)if(e.type==='death')died=e.cause;g.events.length=0;}
 assert.equal(died,'tyrant-bolt',`${id}: the rake kills a knight who ignores it`);
 console.log('ok',id,'the rake kills a knight who ignores it');
}
// Without the opt-in fields the device behaves exactly as before (one hit, fixed lane): a plain room def.
{const def={...Rooms.all.find(r=>r.id==='v13-low')};def.tyrant={shotRow:14,weakRow:10,hits:1};
 const rooms=[...Rooms.all];rooms.push(def);const g=Core.createGame(rooms,{room:rooms.length-1});
 assert.equal(g.tyrant.lane,14);assert.equal(g.tyrant.band,10);assert(!g.room.def.tyrant.rake);console.log('ok a ward without lanes keeps its fixed lane');}
