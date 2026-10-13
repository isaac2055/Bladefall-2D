import {readFileSync,writeFileSync} from 'node:fs';
import {Core,keysToInput} from '../pcore-tape.mjs';
import {snapshot,restore} from '../pcore-search.mjs';
const path='scripts/room-bank/fractured/98-bank-f98.json',x=JSON.parse(readFileSync(path));
let g=Core.createGame([x.room]),tape=[];const startStage=+(process.argv[2]||0);
if(startStage){for(const [n,k]of x.tape)for(let i=0;i<n;i++)Core.step(g,keysToInput(k));tape=x.tape.slice();g.events.length=0;}
const zip=t=>{const a=[];for(const [n,k]of t){if(a.at(-1)?.[1]===k)a.at(-1)[0]+=n;else a.push([n,k]);}return a;};
for(let stage=startStage;stage<x.verification.stages.length;stage++){
 const target=x.verification.stages[stage],dir=target.x>g.p.x?'r':'l',back=dir==='r'?'l':'r';
 const actions=[[[5,dir+'dx'],[5,dir],[18,dir+'j']],[[5,dir+'x'],[5,dir],[18,dir+'j']],...['',dir,back,dir+'j',back+'j',dir+'g','ug',dir+'u',dir+'d'].flatMap(k=>[4,10,18].map(n=>[[n,k]])),...['r','l','u','ru','lu','rd','ld'].map(k=>[[8,k+'x'],[4,k]])];
 const score=g=>Math.hypot(g.p.x-target.x,(g.p.y-target.y)*1.4)+(g.p.y>target.y+70?120:0);
 let frontier=[{g:snapshot(g),t:[],s:score(g)}],found=null;
 for(let depth=0;depth<55&&frontier.length&&!found;depth++){
  const next=[],seen=new Set();
  outer:for(const node of frontier)for(const a of actions){const z=restore(node.g),events=[];let dead=false;
   for(const [n,k]of a){for(let j=0;j<n;j++){Core.step(z,keysToInput(k));events.push(...z.events);z.events.length=0;if(z.deaths){dead=true;break;}}if(dead)break;}
   if(dead||z.p.y>Math.max(g.p.y,target.y)+105||z.p.x<0||z.p.x>1285)continue;
   const t=[...node.t,...a];if(target.exit?z.exited:target.refill?events.some(e=>e.type==='refill'):Math.abs(z.p.x-target.x)<22&&Math.abs(z.p.y-target.y)<3&&z.p.onGround){found={g:z,t};break outer;}
   if(z.exited)continue;const key=[z.p.x>>2,z.p.y>>2,Math.round(z.p.vx/35),Math.round(z.p.vy/35),z.p.dashes,z.p.state,z.p.onGround,z.ents.filter(e=>e.type==='zip').map(e=>(e.x>>3)+','+(e.y>>3)+e.state),z.frame%30].join('/');if(seen.has(key))continue;seen.add(key);next.push({g:snapshot(z),t,s:score(z)});
  }
  next.sort((a,b)=>a.s-b.s);frontier=next.slice(0,100);if(depth%10===0)console.log('stage',stage,'depth',depth,'best',frontier[0]?.s);
 }
 if(!found){console.log('FAILED STAGE',stage,target);process.exit(1);}g=found.g;tape=zip([...tape,...found.t]);x.tape=tape;x.verification.reachedStage=stage;writeFileSync(path,JSON.stringify(x,null,2)+'\n');console.log('SAVED',stage,g.p.x,g.p.y,tape.reduce((n,x)=>n+x[0],0));
}
