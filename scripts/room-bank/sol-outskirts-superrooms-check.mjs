import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {Core,runRoom,expand} from '../pcore-tape.mjs';
import {ACT,snapshot,run,defaultKey} from '../pcore-search.mjs';
const root=new URL('../../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
let reportPath=new URL('docs/room-bank/sol-outskirts-superrooms-proof.json',root);
const selected=process.argv.slice(2).filter(x=>/^bank-f/.test(x));
if(process.argv.includes('--search')&&selected.length===1)reportPath=new URL(`docs/room-bank/sol-outskirts-superrooms-search-${selected[0]}.json`,root);
const records=[95,96].map(n=>JSON.parse(read(`scripts/room-bank/fractured/${n}-bank-f${n}.json`))).filter(x=>!selected.length||selected.includes(x.room.id));
const baseline=JSON.parse(read('docs/room-bank/sol-outskirts-superrooms-baseline.json'));
for(const [p,h]of Object.entries(baseline))assert.equal(createHash('sha256').update(read(p)).digest('hex'),h,`Earlier content changed: ${p}`);
const advanced=['super','hyper','ultra','wallbounce','late-wallbounce','reverse-super','reverse-hyper'];
const actions=[...ACT.climb,...['r','l','ru','lu','u','d','rd','ld'].map(k=>[[8,k+'x'],[8,k]]),[[18,'rj']],[[18,'lj']]];
// Isolated fresh landings give the shortcut search full dash/stamina and no inherited momentum.
function probe(room,source,target){
 const g0=Core.createGame([room]);Object.assign(g0.p,{x:source.x,y:source.y,vx:0,vy:0,remX:0,remY:0,onGround:true,wasGround:true});
 const key=g=>defaultKey(g)+'|'+[g.prev.jump,g.prev.dash,g.buf.jump,g.buf.dash,...g.ents.filter(e=>e.type==='crumble').map(e=>Math.floor((e.shaking||0)/4))].join(',');
 let frontier=[{g:snapshot(g0),tape:[]}],seen=new Set([key(g0)]),nodes=0;
 const direction=Math.sign(target.x-source.x);
 for(let depth=0;depth<26&&frontier.length;depth++){
  const next=[];
  for(const s of frontier)for(const a of actions){nodes++;const g=snapshot(s.g),r=run(g,a);if(r.dead||r.events.some(e=>advanced.includes(e.type)))continue;
   const tape=[...s.tape,...a];
   if((direction>0?g.p.x>=target.x-4:g.p.x<=target.x+4)&&g.p.y<=target.y+2)return {shortcutFound:true,tape,nodes,depth};
   if(r.exited)continue;const k=key(g);if(seen.has(k))continue;seen.add(k);
   next.push({g,tape,score:Math.hypot(g.p.x-target.x,g.p.y-target.y)+Math.max(0,g.p.y-target.y-40)*2});
  }
  next.sort((a,b)=>a.score-b.score);frontier=next.slice(0,120);
 }
 return {shortcutFound:false,nodes,maxDepth:26,beam:120};
}
const reports=[];
for(const rec of records){const{room,bank,tape,verification}=rec;
 const valid=r=>r.exited&&!r.deaths&&bank.requiredEvents.every(e=>r.events.some(x=>x.type===e))&&Object.entries(bank.requiredEventCounts).every(([e,n])=>r.events.filter(x=>x.type===e).length>=n);
 const r=runRoom([room],0,tape,{trace:true});assert.ok(valid(r),room.id);assert.ok(valid(runRoom([room],0,[[120,''],...tape])),room.id+' settled checkpoint');
 assert.equal(room.map.join('').split('P').length,2);assert.equal(room.map.join('').includes('*'),false);assert.ok(room.cols*room.rows>=18000);assert.ok(room.map.at(-1).includes('.'));
 const events=Object.fromEntries([...new Set(r.events.map(e=>e.type))].map(k=>[k,r.events.filter(e=>e.type===k).length]));
 for(const skip of verification.fixedOrdinaryBypasses||[]){
  const g=Core.createGame([room]);Object.assign(g.p,{x:skip.source.x,y:skip.source.y,vx:0,vy:0,remX:0,remY:0,onGround:true,wasGround:true});let crossed=false;
  for(const k of expand(skip.tape)){const s=run(g,[[1,k]]);if(s.dead||s.events.some(e=>advanced.includes(e.type)))break;const direction=Math.sign(skip.target.x-skip.source.x);if((direction>0?g.p.x>=skip.target.x-4:g.p.x<=skip.target.x+4)&&g.p.y<=skip.target.y+2){crossed=true;break;}}
  assert.equal(crossed,false,skip.name);
 }
 const row={fixedOrdinaryBypassRegressions:(verification.fixedOrdinaryBypasses||[]).length,id:room.id,name:room.name,dimensions:[room.cols,room.rows],frames:r.exitFrame+1,seconds:(r.exitFrame+1)/60,deaths:0,events};
 if(process.argv.includes('--write')){let tried=0;const passing=[];for(let i=0;i<tape.length-2;i++)for(const delta of[-1,1]){if(tape[i][0]+delta<1)continue;tried++;const t=tape.map(x=>[...x]);t[i][0]+=delta;if(valid(runRoom([room],0,t)))passing.push({name:`Input ${i+1}: ${delta>0?'+':''}${delta} frame`,tape:t});}
  assert.ok(passing.length>=10);rec.bank.positiveChecks=passing.filter((_,i)=>i%Math.max(1,Math.floor(passing.length/4))===0).slice(0,4);writeFileSync(new URL(`scripts/room-bank/fractured/${room.id.slice(-2)}-${room.id}.json`,root),JSON.stringify(rec,null,2)+'\n');row.timing={tried,passed:passing.length,scope:'A single input hold changed by one frame; replay of the entire room.'};
 }
 if(process.argv.includes('--search')){row.bypass=[];const spawn=Core.createGame([room]).p;let previous={x:spawn.x,y:spawn.y,kind:'land'};
  for(const [i,t]of verification.stages.entries()){if(t.kind==='land'&&previous.kind==='land'&&(i===0||Math.abs(t.x-previous.x)>=180)){
   const result=probe(room,previous,t);row.bypass.push({stage:i,source:{x:previous.x,y:previous.y},target:t,...result});console.log(room.id,'bypass',i,result.shortcutFound?'FOUND':'none found');
  }previous=t;}
 }
 for(const s of bank.shortcutChecks)assert.equal(runRoom([room],0,s.tape).exited,false,s.name);
 console.log(room.id,'zero deaths',row.frames,'frames',JSON.stringify(events));reports.push(row);
}
const registry=read('public/bladefall-room-bank.js');for(const host of['localhost','127.0.0.1','appassets.bladefall','bladefall.example']){const chapters=[],ctx={location:{hostname:host,protocol:'http:',search:'?pitch=bank'},URLSearchParams,BladefallPrecisionRooms:{addPart(p){chapters.push(...p.chapters);}}};vm.runInNewContext(registry,ctx);
 for(const variant of['g','h']){const set=chapters.filter(c=>c.bankVariant===variant);assert.equal(set.length,host==='bladefall.example'?0:1);if(set.length)assert.equal(set[0].rooms.length,1);}
}
if(process.argv.includes('--write')||process.argv.includes('--search')){let saved;try{saved=JSON.parse(readFileSync(reportPath));}catch{saved={rooms:[]};}for(const row of reports){const i=saved.rooms.findIndex(x=>x.id===row.id);if(i<0)saved.rooms.push(row);else saved.rooms[i]={...saved.rooms[i],...row};}
 Object.assign(saved,{checkedAt:new Date().toISOString(),priorRoomSourcesPreserved:145,physicsAndCampaignHashesPreserved:4,bypassScope:'Bounded beam searches from isolated fresh, stationary landings with a full dash and stamina; advanced momentum forbidden. Passing the target landing plane counts as a shortcut. This is not an exhaustive proof against every route.',browser:'Live browser verification was unavailable because local browser access was declined in this chat.',humanDifficulty:'Author estimate only; human difficulty and enjoyment await playtesting.'});writeFileSync(reportPath,JSON.stringify(saved,null,2)+'\n');}
if(process.argv.includes('--search'))assert.ok(reports.every(r=>r.bypass.every(p=>!p.shortcutFound)),'Ordinary-movement shortcut needs repair');
console.log('PASS: Sol Outskirts superroom checks.');
