import './register.mjs';
import {Core,Rooms,runRoom,picture} from '../rbr-lib.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
const id=process.argv[2]||'bank-f63',file=new URL('./fractured/'+id+'.json',import.meta.url),record=JSON.parse(readFileSync(file));
const tape=process.argv[3]?JSON.parse(process.argv[3]):record.tape;
const r=runRoom([record.room],0,tape,{trace:true,maxExtra:0});
for(const t of r.log)if(t.i%10===0||t.st==='dead')console.log(JSON.stringify(t));
console.log(r.events.map(e=>e.i+':'+e.type+(e.why?':'+e.why:'')).join(' '));
console.log('state',JSON.stringify({exited:r.exited,deaths:r.deaths,p:r.g.p,sentinel:r.g.sentinel,mk:r.g.mk,sorc:r.g.sorc,super:r.g.superFractured},(k,v)=>v instanceof Set?[...v]:v));
if(process.env.SAVE_TAPE){record.tape=tape;writeFileSync(file,JSON.stringify(record,null,2)+'\n');}
