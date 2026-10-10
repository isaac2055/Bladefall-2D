import {readFileSync,writeFileSync} from 'node:fs';
import {Core,runRoom} from '../rbr-lib.mjs';
const f=new URL('./base/bank-b65.json',import.meta.url),rec=JSON.parse(readFileSync(f));
const extra=process.argv[2]?JSON.parse(process.argv[2]):[];
const tape=process.argv.includes('--replace')?extra:[...rec.tape,...extra];
const run=runRoom([rec.room],0,tape,{trace:true});
console.log(JSON.stringify({end:run.log.at(-1),boss:{n:run.g.colossus.n,state:run.g.colossus.state,t:run.g.colossus.t,hunt:run.g.colossus.hunt,col:run.g.colossus.col},ents:run.g.ents.filter(e=>['slide','anvil','mould','cpillar'].includes(e.type)).map(e=>({type:e.type,x:e.x,y:e.y,solid:e.solid,cast:e.cast})),exit:run.exited,deaths:run.deaths,events:run.events.filter(e=>!['land','colossus-gather','colossus-pour'].includes(e.type)).slice(-8)},null,2));
if(process.argv.includes('--trace'))console.log(run.log.filter((x,i)=>i%20===0));
if(process.argv.includes('--save')&&!run.deaths){rec.tape=tape;writeFileSync(f,JSON.stringify(rec,null,2)+'\n');console.log('Saved checkpoint');}
