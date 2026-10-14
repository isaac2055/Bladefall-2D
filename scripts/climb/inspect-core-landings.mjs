import {readFileSync} from 'node:fs';import {Core,expand,keysToInput} from '../pcore-tape.mjs';
for(const id of [96,97,98,99,100]){
 const x=JSON.parse(readFileSync(`scripts/room-bank/fractured/${id}-bank-f${id}.json`)),g=Core.createGame([x.room]),landings=[],bounds=[0];let last='';
 for(const [f,k]of expand(x.tape).entries()){
  Core.step(g,keysToInput(k));for(const e of g.events)if(e.type==='core-checkpoint')bounds.push(f+1);g.events=[];
  if(g.p.onGround){const row=(g.p.y+g.p.h)/8,c=Math.round(g.p.x/8),tile=x.room.map[row]?.[c];if(Number.isInteger(row)&&['#','~'].includes(tile)){const key=c+':'+row;if(key!==last)landings.push({f:f+1,c,r:row-1,tile,vx:Math.round(g.p.vx),facing:g.p.facing});last=key;}}else last='';if(g.exited){bounds.push(f+1);break;}
 }
 console.log('\n',id,bounds);for(let i=0;i<bounds.length-1;i++){const lo=bounds[i],hi=bounds[i+1],mid=(lo+hi)/2;console.log(i,landings.filter(p=>p.f>lo+30&&p.f<hi-30&&!x.room.coreCheckpoints.some(q=>Math.abs(p.c-q.c)<5&&p.r===q.r)).sort((a,b)=>Math.abs(a.f-mid)-Math.abs(b.f-mid)).slice(0,4));}
}
