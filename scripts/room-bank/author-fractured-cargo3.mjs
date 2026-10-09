// Focused authoring helper for this five-room Fractured batch only.
import {readFileSync,writeFileSync} from 'node:fs';
import {Core,keysToInput,expand} from '../pcore-tape.mjs';
const n=process.argv[2],path=new URL(`./fractured/${n}-bank-f${n}.json`,import.meta.url);
const rec=JSON.parse(readFileSync(path)),tape=process.argv[3]?JSON.parse(process.argv[3]):rec.tape,g=Core.createGame([rec.room]),ev=[],log=[];
for(const [i,k] of expand(tape).entries()){Core.step(g,keysToInput(k));ev.push(...g.events.map(e=>({...e,i})));g.events.length=0;if(i%10===0||g.p.state==='dead'||g.exited)log.push({i,k,x:g.p.x,y:g.p.y,st:g.p.state,d:g.p.dashes,carry:!!g.p.carrying,objs:g.ents.filter(e=>['lantern','slide','zip','cart'].includes(e.type)).map(e=>[e.type,e.x,e.y,e.state,e.moving])});if(g.exited||g.p.state==='dead')break;}
console.log(JSON.stringify(log.slice(-25)));console.log(JSON.stringify(ev.map(e=>({i:e.i,t:e.type,kind:e.kind,cause:e.cause}))));console.log(JSON.stringify({exit:g.exited,deaths:g.deaths,frames:g.frame,p:[g.p.x,g.p.y,g.p.state,g.p.dashes],bodies:g.ents.filter(e=>['lantern','slide','stone','echo'].includes(e.type)).map(e=>[e.type,e.x,e.y,e.lit])}));
if(process.argv.includes('--save')){if(!g.exited||g.deaths)throw Error('No clean completion');rec.tape=tape;rec.bank.status='route-proven';rec.bank.route={frames:g.frame,deaths:0,events:[...new Set(ev.map(e=>e.type))],eventCounts:Object.fromEntries([...new Set(ev.map(e=>e.type))].map(t=>[t,ev.filter(e=>e.type===t).length]))};writeFileSync(path,JSON.stringify(rec,null,2)+'\n');console.log('Saved '+rec.room.id);}
