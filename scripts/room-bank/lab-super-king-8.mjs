import './register.mjs';
import {runRoom} from '../rbr-lib.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
const file=new URL('./fractured/bank-f67.json',import.meta.url),rec=JSON.parse(readFileSync(file)),tape=process.argv[2]?JSON.parse(process.argv[2]):rec.tape;
const r=runRoom([rec.room],0,tape,{trace:true,maxExtra:0});
for(const p of r.log)if(p.i%(+process.env.EVERY||20)===0||p.st==='dead')console.log(JSON.stringify(p));
console.log(r.events.map(e=>e.i+':'+e.type+(e.why?':'+e.why:'')).join(' '));
console.log(JSON.stringify({exited:r.exited,deaths:r.deaths,p:r.g.p,king:r.g.dayKing,echo:r.g.echo,carrier:r.g.ents.find(e=>e.type==='hookCarrier'),beam:r.g.beams?.paths},(k,v)=>v instanceof Set?[...v]:v));
if(process.env.SAVE_TAPE){rec.tape=tape;writeFileSync(file,JSON.stringify(rec,null,2)+'\n');}
