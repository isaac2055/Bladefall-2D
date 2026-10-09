// Local room-authoring probe for F14/F15; never runs in the shipped game.
import {readFileSync,writeFileSync} from 'node:fs';
import {Core,keysToInput,expand} from '../pcore-tape.mjs';
const n=process.argv[2],path=new URL(`./fractured/${n}-bank-f${n}.json`,import.meta.url);
const record=JSON.parse(readFileSync(path,'utf8'));
const tape=process.argv[3]?JSON.parse(process.argv[3]):record.tape;
const g=Core.createGame([record.room]),events=[],log=[];
for(const [i,k] of expand(tape).entries()){
 Core.step(g,keysToInput(k));
 events.push(...g.events.map(e=>({...e,i})));g.events.length=0;
 if(i%10===0||g.p.state==='dead'||g.exited)log.push({i,k,x:g.p.x,y:g.p.y,state:g.p.state,dashes:g.p.dashes,carrying:!!g.p.carrying,lantern:g.ents.filter(e=>e.type==='lantern').map(e=>[e.x,e.y,e.returning]),stone:g.ents.filter(e=>e.type==='slide').map(e=>[e.x,e.y,e.moving])});
 if(g.exited||g.p.state==='dead')break;
}
console.log(JSON.stringify(log));
console.log(JSON.stringify(events.map(e=>({i:e.i,type:e.type,kind:e.kind,dir:e.dir,cause:e.cause}))));
console.log(JSON.stringify({exited:g.exited,deaths:g.deaths,frame:g.frame,p:{x:g.p.x,y:g.p.y,state:g.p.state,dashes:g.p.dashes},ents:g.ents.filter(e=>['lantern','slide','stone'].includes(e.type)).map(e=>({type:e.type,x:e.x,y:e.y,lit:e.lit}))}));
if(process.argv.includes('--save')){
 if(!g.exited||g.deaths)throw new Error('Completion not clean; no proof saved');
 record.tape=tape;record.bank.status='route-proven';record.bank.route={frames:g.frame,deaths:0,events:[...new Set(events.map(e=>e.type))],eventCounts:Object.fromEntries([...new Set(events.map(e=>e.type))].map(t=>[t,events.filter(e=>e.type===t).length]))};
 writeFileSync(path,JSON.stringify(record,null,2)+'\n');console.log('Saved individual room route');
}
