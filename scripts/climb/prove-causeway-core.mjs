import {readFileSync,writeFileSync} from 'node:fs';
import {Core,keysToInput} from '../pcore-tape.mjs';
import {snapshot,restore} from '../pcore-search.mjs';
const sourceId=+(process.env.CORE_SOURCE||98),part=+(process.env.CORE_PART||0);
const path=process.env.CORE_PATH||`scripts/room-bank/fractured/${sourceId}-bank-f${sourceId}.json`,x=JSON.parse(readFileSync(path));
let g=Core.createGame([x.room]),tape=[];const startStage=+(process.argv[2]||0);
if(part){g.coreRun.index=part-1;Core.resetRoom(g);g.p.state='normal';g.p.respawnTimer=0;}
if(startStage&&!part||part&&process.env.CORE_RESUME){for(const [n,k]of (part?x.verification.partTapes[part]:x.tape))for(let i=0;i<n;i++)Core.step(g,keysToInput(k));tape=(part?x.verification.partTapes[part]:x.tape).slice();g.events.length=0;}
if(g.deaths)throw new Error('Saved prefix no longer survives the current geometry; re-prove from the last valid stage.');
const zip=t=>{const a=[];for(const [n,k]of t){if(a.at(-1)?.[1]===k)a.at(-1)[0]+=n;else a.push([n,k]);}return a;};
for(let stage=startStage;stage<Math.min(x.verification.stages.length,+(process.env.CORE_END||999)+1);stage++){
 const target=x.verification.stages[stage],dir=target.x>g.p.x?'r':'l',back=dir==='r'?'l':'r';
 const actions=[[[5,dir+'dx'],[5,dir],[18,dir+'j']],[[5,dir+'x'],[5,dir],[18,dir+'j']],...['',dir,back,dir+'j',back+'j',dir+'js',back+'js',dir+'p',back+'p',dir+'jp',back+'jp','p',dir+'gp',back+'gp','ugp','ugjp','s','ds',dir+'s',back+'s',dir+'ds','djs',dir+'g',back+'g',dir+'gj',back+'gj','ugj',dir+'ug',back+'ug','ug',dir+'u',dir+'d'].flatMap(k=>[4,10,18].map(n=>[[n,k]])),...['r','l','u','ru','lu','rd','ld'].map(k=>[[8,k+'x'],[4,k]])];
 const lift=g=>target.lift&&g.ents.find(e=>e.type==='zip'&&e.ox===target.lift[0]&&e.oy===target.lift[1]);
 const score=g=>{const e=lift(g),x=e?e.x+8:target.x,y=e?e.y-11:target.y;return Math.hypot(g.p.x-x,(g.p.y-y)*1.4)+(g.p.y>y+70?120:0);};
 let frontier=[{g:snapshot(g),t:[],s:score(g)}],found=null;
 for(let depth=0;depth<55&&frontier.length&&!found;depth++){
  const next=[],seen=new Set();
  outer:for(const node of frontier)for(const a of actions){const z=restore(node.g),events=[];let dead=false;
   for(const [n,k]of a){for(let j=0;j<n;j++){Core.step(z,keysToInput(k));events.push(...z.events);z.events.length=0;if(z.deaths){dead=true;break;}}if(dead)break;}
   if(dead||z.p.y>Math.max(g.p.y,target.y)+105||z.p.x<0||z.p.x>x.room.cols*8+16)continue;
   const t=[...node.t,...a];if(target.exit?z.exited:target.parry?events.some(e=>e.type==='parry')&&(!target.grip||z.p.state==='climb')&&Math.abs(z.p.x-target.x)<40&&Math.abs(z.p.y-target.y)<(target.toleranceY||45):target.refill?events.some(e=>e.type==='refill'):target.lift?!!lift(z)&&z.p.x+8>lift(z).x&&z.p.x<lift(z).x+lift(z).w&&Math.abs(z.p.y+11-lift(z).y)<2:target.air?Math.abs(z.p.x-target.x)<24&&Math.abs(z.p.y-target.y)<16:target.grip?z.p.state==='climb'&&Math.abs(z.p.x-target.x)<16&&Math.abs(z.p.y-target.y)<(sourceId===100?2:8):Math.abs(z.p.x-target.x)<22&&Math.abs(z.p.y-target.y)<3&&z.p.onGround){found={g:z,t};break outer;}
   if(z.exited)continue;const key=[z.p.x>>2,z.p.y>>2,Math.round(z.p.vx/35),Math.round(z.p.vy/35),z.p.dashes,z.phase,z.p.state,z.p.onGround,z.ents.filter(e=>e.type==='zip').map(e=>(e.x>>3)+','+(e.y>>3)+e.state),z.frame%(sourceId===100?90:30),z.p.parryTimer||0,z.p.parryCooldown||0].join('/');if(seen.has(key))continue;seen.add(key);next.push({g:snapshot(z),t,s:score(z)});
  }
  next.sort((a,b)=>a.s-b.s);frontier=next.slice(0,sourceId===100?160:100);if(depth%10===0)console.log('stage',stage,'depth',depth,'best',frontier[0]?.s);
 }
 if(!found){console.log('FAILED STAGE',stage,target);process.exit(1);}g=found.g;tape=zip([...tape,...found.t]);if(part){x.verification.partTapes[part]=tape;x.verification.partReached={...x.verification.partReached,[part]:stage};}else{x.tape=tape;x.verification.reachedStage=stage;}writeFileSync(path,JSON.stringify(x,null,2)+'\n');console.log('SAVED',stage,g.p.x,g.p.y,tape.reduce((n,x)=>n+x[0],0));
}
