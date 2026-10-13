import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {Core,Rooms,runRoom} from '../pcore-tape.mjs';
import {beam,ACT} from '../pcore-search.mjs';
const root=new URL('../../',import.meta.url),path=new URL('./fractured/94-bank-f94.json',import.meta.url),rec=JSON.parse(readFileSync(path)),{room,bank,tape,verification}=rec;
const baseline=JSON.parse(readFileSync(new URL('docs/room-bank/white-mile-baseline.json',root)));
for(const [p,h]of Object.entries(baseline))assert.equal(createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex'),h,p);
const valid=r=>r.exited&&!r.deaths&&Object.entries(bank.requiredEventCounts).every(([e,n])=>r.events.filter(x=>x.type===e).length>=n);
assert.equal(room.map.join('').split('P').length,2);assert.equal(room.map.join('').includes('*'),false);assert.ok(room.cols*room.rows>=14000);
const result=runRoom([room],0,tape,{trace:true});assert.ok(valid(result));assert.ok(valid(runRoom([room],0,[[120,''],...tape])));
const events=Object.fromEntries([...new Set(result.events.map(e=>e.type))].map(k=>[k,result.events.filter(e=>e.type===k).length]));
const variations=[];let tried=0;
if(!process.argv.includes('--search'))for(let i=0;i<tape.length-2;i++)for(const delta of [-1,1]){if(tape[i][0]+delta<1)continue;tried++;const t=tape.map(x=>[...x]);t[i][0]+=delta;if(valid(runRoom([room],0,t)))variations.push({name:`Input ${i+1}: ${delta>0?'+':''}${delta} frame`,tape:t});}
for(const s of bank.shortcutChecks)assert.equal(runRoom([room],0,s.tape).exited,false,s.name);
const chapters=[];const ctx={location:{hostname:'localhost',protocol:'http:',search:'?pitch=bank'},URLSearchParams,BladefallPrecisionRooms:{addPart(p){chapters.push(...p.chapters);}}};vm.runInNewContext(readFileSync(new URL('public/bladefall-room-bank.js',root),'utf8'),ctx);
const ch=chapters.filter(c=>c.bankVariant==='f');assert.equal(ch.length,1);assert.equal(ch[0].rooms.length,1);assert.equal(ch[0].rooms[0].id,room.id);
const output=new URL('docs/room-bank/white-mile-proof.json',root);
if(process.argv.includes('--write')){assert.ok(variations.length>=10);rec.bank.positiveChecks=variations.filter((_,i)=>i%Math.max(1,Math.floor(variations.length/4))===0).slice(0,4);writeFileSync(path,JSON.stringify(rec,null,2)+'\n');writeFileSync(output,JSON.stringify({checkedAt:new Date().toISOString(),frames:result.exitFrame+1,seconds:(result.exitFrame+1)/60,deaths:0,dimensions:[room.cols,room.rows],priorRecordsPreserved:Object.keys(baseline).length,events,timingPerturbations:{tried,passed:variations.length,scope:'One input hold changed by one frame; full-room replay from the starting checkpoint.'},browser:'Not run: local browser access was declined in this chat.',humanDifficulty:'Pending; automated completion is not a human difficulty measurement.'},null,2)+'\n');}
if(process.argv.includes('--search')){
 Rooms.all.push(room);const probes=[];const advanced=['super','hyper','ultra','wallbounce','late-wallbounce','reverse-super','reverse-hyper'];
 for(const i of [0,1,2,3,4,5,8,9,10,11,12,17]){
  let n=0,end=i?verification.milestones[i-1].to:0,start=[];for(const [f,k]of tape){if(n>=end)break;start.push([Math.min(f,end-n),k]);n+=f;}
  const t=verification.stages[i];const r=beam(room.id,{start,actions:[...ACT.climb,...['ru','lu','r','l','u'].map(k=>[[8,k+'x'],[8,k]])],beam:100,maxDepth:24,reject:(g,ev)=>ev.some(e=>advanced.includes(e.type)),score:g=>Math.hypot(g.p.x-t.x,g.p.y-t.y)+Math.max(0,g.p.y-t.y-40)*2,goal:g=>g.p.onGround&&g.p.y===t.y&&Math.abs(g.p.x-t.x)<20});
  probes.push({stage:i,shortcutFound:!!r,beam:100,depth:24,...(r?{tape:r.tape}:{})});console.log('Bypass stage',i,r?'FOUND':'none found');
 }
 const saved=JSON.parse(readFileSync(output));saved.bypassSearch={scope:'Bounded independent search at twelve long transfers, from recorded incoming states, forbidding advanced momentum. Not exhaustive proof of all possible routes.',probes};writeFileSync(output,JSON.stringify(saved,null,2)+'\n');assert.ok(probes.every(p=>!p.shortcutFound),'An ordinary-movement bypass needs repair');
}
console.log('PASS',room.name,result.exitFrame+1,'frames',JSON.stringify(events));
