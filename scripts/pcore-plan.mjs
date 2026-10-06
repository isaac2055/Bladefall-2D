// Staged tape planner for authoring Precision Core routes.
// For each stage, candidate input segments are appended to the tape so far; the first candidate
// that reaches the stage goal without a death is kept. `settle` runs extra idle frames before the
// goal is judged but is NOT added to the tape. Save a found tape into
// public/bladefall-pcore-tapes.js and add the room to scripts/verify-precision-core.mjs.
//
//   import {plan,cands,range} from './pcore-plan.mjs';
//   const tape=plan('k1',[
//    {name:'walk to stone',cands:cands(n=>[[n,'r']],range(10,60,2)),goal:g=>g.p.x>=62},
//    {name:'push',settle:60,cands:[[[5,'rx'],[40,'']]],goal:g=>g.ents.find(e=>e.type==='slide').x===144},
//   ]);
import {Core,Rooms,expand,keysToInput} from './pcore-tape.mjs';
export function sim(id,tape,extra=0){
 const i=Rooms.all.findIndex(d=>d.id===id);const g=Core.createGame(Rooms.all,{room:i});
 const frames=expand(tape);const ev=[];let exited=false;
 for(let f=0;f<frames.length+extra;f++){Core.step(g,keysToInput(frames[f]||''));for(const e of g.events){ev.push({...e,f});if(e.type==='exit')exited=true;}g.events.length=0;if(exited)break;}
 return {g,ev,exited,deaths:ev.filter(e=>e.type==='death').length};
}
export function plan(id,stages,{verbose=true}={}){
 let tape=[];
 for(const [si,st] of stages.entries()){
  let found=null;
  for(const c of st.cands){
   const r=sim(id,[...tape,...c],st.settle??0);
   const count=t=>r.ev.filter(e=>e.type===t).length;
   if(r.deaths===0&&st.goal(r.g,r.ev,{count})){found=c;break;}
  }
  if(!found){if(verbose)console.log(`stage ${si} (${st.name||''}) failed after ${st.cands.length} candidates; tape so far`,JSON.stringify(tape));return null;}
  tape=[...tape,...found];if(verbose)console.log(`stage ${si} ${st.name||''}: ${JSON.stringify(found)}`);
 }
 return tape;
}
export const range=(a,b,s=1)=>{const o=[];for(let v=a;v<=b;v+=s)o.push(v);return o;};
export function cands(fn,...lists){const out=[];const rec=(i,acc)=>{if(i===lists.length){out.push(fn(...acc));return;}for(const v of lists[i])rec(i+1,[...acc,v]);};rec(0,[]);return out;}
