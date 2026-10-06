// Room by Room: hunt for a skip. Searches for any way out of a room that never produces the given events
// (e.g. refill = never takes a crystal; crumble-shake = never stands on cracked stone; grab = never climbs;
// stone-lit = never lights a stake; dash). Uses several beams (toward the exit, toward the top, toward the far
// side) over the full kit. Prints SKIP and the tape if one exists, else "no skip found" (not a proof).
//   node scripts/rbr-skip.mjs <roomId> --without refill[,dash] [--side] [--beam N]
import {ACT,beam,polish,compress,sideRun,trace,roomDef} from './rbr-lib.mjs';
const a=process.argv.slice(2),id=a[0];
const opt=k=>{const i=a.indexOf(k);return i>=0?a[i+1]:null;};
const side=a.includes('--side');const without=(opt('--without')||'').split(',').filter(Boolean);
// --plain: ordinary play only — no supers/hypers (a jump during a ground dash), ultras or wall bounces.
// Room by Room's standard: no skip with ordinary moves; a skip that needs that tech is mastery, and is logged.
if(a.includes('--plain'))without.push('super','hyper','ultra','wallbounce');
const def=roomDef(id);const cols=def.cols||40,rows=def.rows||23,dir=side?def.side:def.exit||'right';
const at=(c,r)=>(def.map[r]||'')[c]||'.';
const edge=[];
if(dir==='right'||dir==='left'){const c=dir==='right'?cols-1:0;for(let r=0;r<rows;r++)if(at(c,r)!=='#')edge.push([c,r]);}
else{const r=dir==='up'?0:rows-1;for(let c=0;c<cols;c++)if(at(c,r)!=='#')edge.push([c,r]);}
const ex=edge.reduce((s,[c,r])=>[s[0]+c,s[1]+r],[0,0]).map(v=>v/edge.length*8);
const acts=[...ACT.climb,...ACT.strikes,[[2,'rx']],[[2,'rux']],[[2,'lux']],[[20,'r']],[[20,'l']]];
const B=+(opt('--beam')||2000);
const bad=ev=>ev.some(e=>without.includes(e.type));
const goal=(g,ev)=>ev.some(e=>e.type==='exit'&&!!e.side===side);
const scores=[g=>Math.hypot(g.p.x-ex[0],g.p.y-ex[1]),g=>Math.abs(g.p.x-ex[0])+g.p.y*0.5,g=>g.p.y+Math.abs(g.p.x-ex[0])*0.2];
for(const [i,score] of scores.entries()){
 const r=beam(id,{actions:acts,beam:B,maxDepth:+(opt('--depth')||90),score,goal,reject:(g,ev)=>bad(ev)});
 if(r){const t=compress(r.tape);console.log('SKIP (beam',i+')',JSON.stringify(t));console.log(trace(id,t,8));process.exit(1);}
}
console.log(`${id}: no skip found without ${without.join('+')||'(nothing)'}`);
