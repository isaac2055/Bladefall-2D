// Real opening inputs, then a finite sweep of human timing alternatives.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Core,keysToInput,expand} from '../pcore-tape.mjs';
import {snapshot,restore} from '../pcore-search.mjs';
const src=JSON.parse(readFileSync(new URL('../room-bank/fractured/98-bank-f98.json',import.meta.url)));
const room={...src.room,counterweightFlow:true};
// Revised receiving shelf: one tile lower, still far beyond a stopped wavedash.
room.map=room.map.map((r,i)=>i>=84&&i<=88?r.slice(0,75)+'.'.repeat(4)+r.slice(79):r);
room.map[85]=room.map[85].slice(0,75)+'~~~~'+room.map[85].slice(79);
const opening=[[8,'rx'],[22,'r'],[5,'rdx'],[5,'r'],[28,'rj']];
const frames=expand(opening),base=Core.createGame([room]);
for(let f=0;f<59;f++)Core.step(base,keysToInput(frames[f]));
base.events=[];const start=snapshot(base),wins=[];
for(let dashAt=60;dashAt<=69;dashAt++)for(let delay=5;delay<=12;delay++)for(let air=10;air<=38;air+=2){
 const g=restore(start);let landed=false;
 for(let f=60;f<150;f++){
  let k=f<dashAt?frames[f-1]:f<dashAt+delay?'rd':f<dashAt+delay+12?'rj':'r';
  if(f===dashAt)k+='x';if(f===dashAt+delay+air)k='rux';if(f>dashAt+delay+air&&f<dashAt+delay+air+10)k='ru';
  Core.step(g,keysToInput(k));if(g.deaths)break;
  if(g.p.onGround&&g.p.x>=592&&g.p.x<=632&&g.p.y===669){landed=true;break;}
 }
 if(landed&&g.events.some(e=>e.type==='counterweight-relay'))wins.push({dashAt,delay,air});
}
assert(wins.length>=40,'a range of native timings must reach the receiving shelf');
for(const delay of [5,6,7,8])assert(wins.some(x=>x.dashAt===67&&x.delay===delay),'four consecutive jump timings after contact');
// Stop on the launch shelf, then attempt the same diagonal-dash/jump sequence.
for(const enabled of [true,false]){
 const g=Core.createGame([{...room,counterweightFlow:enabled}]);
 Object.assign(g.p,{x:380,y:701,vx:0,vy:0,onGround:true,counterweightMomentum:1});
 for(const k of expand([[1,''],[5,'rdx'],[12,'rj']]))Core.step(g,keysToInput(k));
 assert(!g.events.some(e=>e.type==='counterweight-relay'),'stopping invalidates lift provenance');
}
// A stationary shelf launch must not replace the incoming lift flight.
let stoppedLandings=0;
for(const x of [376,384,392,400])for(let delay=5;delay<=12;delay++)for(let air=8;air<=38;air+=2){
 const g=Core.createGame([room]);Object.assign(g.p,{x,y:701,vx:0,vy:0,onGround:true,counterweightMomentum:0});
 for(let f=0;f<100;f++){
  let k=f<delay?'rd':f<delay+12?'rj':'r';if(f===0)k+='x';if(f===delay+air)k='rux';if(f>delay+air&&f<delay+air+10)k='ru';
  Core.step(g,keysToInput(k));if(g.deaths)break;
  if(g.p.onGround&&g.p.x>=592&&g.p.x<=632&&g.p.y===669){stoppedLandings++;break;}
 }
}
assert.equal(stoppedLandings,0,'stopped wavedashes cannot cross the momentum transfer');
// Identical fast landing without room opt-in retains established physics.
for(const enabled of [true,false]){
 const g=Core.createGame([{...room,counterweightFlow:enabled}]);
 Object.assign(g.p,{x:376,y:701,vx:460,vy:0,onGround:true,counterweightMomentum:1});
 for(const k of expand([[5,'rdx'],[1,'rj']]))Core.step(g,keysToInput(k));
 assert.equal(g.events.some(e=>e.type==='counterweight-relay'),enabled);
 assert.equal(g.p.dashes,enabled?1:0);
 assert.equal(Math.round(g.p.vx),enabled?552:325);
}
console.log(`PASS: ${wins.length} lift-to-shelf timing variants; early dash return; stopped launch rejected; existing room physics preserved.`);
