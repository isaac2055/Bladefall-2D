// Re-prove requested supplemental save points from a genuinely fresh native reset.
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {Core,expand,keysToInput} from '../pcore-tape.mjs';
const zip=a=>{const out=[];for(const k of a){if(out.at(-1)?.[1]===k)out.at(-1)[0]++;else out.push([1,k]);}return out;};
for(const id of (process.argv.slice(2).length?process.argv.slice(2).map(Number):[96,97,98])){
 const path=`scripts/room-bank/fractured/${id}-bank-f${id}.json`,x=JSON.parse(readFileSync(path)),old=id===98?{room:{coreCheckpoints:[]}}:JSON.parse(execFileSync('git',['show','a5df01c:'+path],{encoding:'utf8'})),frames=expand(x.tape),arrivals=[],whole=Core.createGame([x.room]);
 for(let i=0;i<frames.length;i++){Core.step(whole,keysToInput(frames[i]));for(const e of whole.events)if(e.type==='core-checkpoint')arrivals[e.index]=i+1;whole.events.length=0;}
 const parts=[];
 for(let part=0;part<=x.room.coreCheckpoints.length;part++){
  const make=()=>{const g=Core.createGame([x.room]);if(part){g.coreRun.index=part-1;Core.resetRoom(g);g.p.state='normal';g.p.respawnTimer=0;}return g;};
  const q=part?x.room.coreCheckpoints[part-1]:null,oldIndex=q?old.room.coreCheckpoints.findIndex(c=>c.name===q.name):-1;
  const base=part===0?frames:oldIndex>=0?expand(old.verification.partTapes[oldIndex+1]):frames.slice(arrivals[part-1]);
  let found=null;
  outer:for(const wait of [0,7,14,21,28,35,42,49,56,63,70,84,105,126,147,168,189,210,231,249,252,273,294,315,336,357,378,399,419])for(const move of ['', 'r','l'])for(let step=0;step<=20;step++){
   const tape=[...Array(step).fill(move),...Array(wait).fill(''),...base],g=make();let n=0;
   for(const k of tape){Core.step(g,keysToInput(k));n++;if(g.deaths)break;if(part===x.room.coreCheckpoints.length?g.exited:g.coreRun.index>=part){found=tape.slice(0,n);console.log(id,part,'proved',n,{wait,move,step});break outer;}g.events.length=0;}
  }
  if(!found)throw Error(`No restart proof ${id} part ${part}`);parts.push(zip(found));
 }
 x.verification.partTapes=parts;writeFileSync(path,JSON.stringify(x,null,2)+'\n');
}
