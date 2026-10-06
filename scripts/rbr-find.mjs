// Room by Room: find an intended tape for a room with beam search, then polish it so it reads like play.
//   node scripts/rbr-find.mjs <roomId> [--side] [--via c,r ...] [--acts basic|climb|blade|all] [--beam N] [--depth N]
// Waypoints (--via, tile coordinates) are visited in order before the exit; each stage restarts the beam from
// the best state found. Prints the tape as JSON plus a trace picture. Nothing here runs in the game.
import {readFileSync} from 'node:fs';
import {defaultKey} from './pcore-search.mjs';
import {Core,Rooms,ACT,beam,polish,compress,sideRun,trace,roomDef} from './rbr-lib.mjs';
const a=process.argv.slice(2),id=a[0];
const opt=k=>{const i=a.indexOf(k);return i>=0?a[i+1]:null;};
const side=a.includes('--side');
const vias=[];a.forEach((v,i)=>{if(v==='--via')vias.push(a[i+1].split(',').map(Number));});
const wantShard=a.includes('--shard');
const avoid=(opt('--avoid')||'').split(',').filter(Boolean);
if(a.includes('--plain'))avoid.push('super','hyper','ultra','wallbounce');   // e.g. --avoid shard: never take the room's pickup
const required=(opt('--require')||'').split(',').filter(Boolean);
let prefixEvents=[];
const reject=(g,ev)=>{
 g.rbrRequired=[...new Set([...prefixEvents,...(g.rbrRequired||[]),...ev.map(e=>e.type).filter(t=>required.includes(t))])];
 return ev.some(e=>avoid.includes(e.type));
};
const def=roomDef(id);if(!def){console.error('no room',id);process.exit(1);}
const acts={jump:[...ACT.move,...ACT.jumps],dash:[...ACT.move,...ACT.jumps,...['r','l','u','ru','lu'].map(d=>[[5,d+'x']])],climbdash:[...ACT.move,...ACT.jumps,...['r','l','u','ru','lu'].map(d=>[[5,d+'x']]),...ACT.grabs],basic:ACT.basic,climb:ACT.climb,blade:[...ACT.climb,...ACT.strikes],echo:[...ACT.climb,[[1,'q']]],portal:[...ACT.climb,...['','l','r','u','d','lu','ru','ld','rd'].map(k=>[[1,k+'q']])],all:[...ACT.climb,...ACT.strikes]}[opt('--acts')||'climb'];
const key=g=>defaultKey(g)+'|'+JSON.stringify([g.rbrRequired?.slice().sort(),g.crown?.t,g.crown?.done,g.alarm?.at,g.hand&&[g.hand.i,g.hand.hits,Math.floor(g.hand.t/6)],g.tyrant&&[g.tyrant.hits,Math.floor(g.tyrant.t/6),g.tyrant.gone],
 // 7.277: the base bosses' progress, so two states that differ only in how far a fight has gone are not merged.
 g.mk&&[g.mk.hits,g.mk.i,g.mk.state],g.warden&&[g.warden.wounds,g.warden.state,g.warden.dir],g.sorc&&[g.sorc.hits,g.sorc.i,g.sorc.state],
 g.colossus&&[g.colossus.n,g.colossus.state],g.combat&&g.combat.enemies.filter(e=>e.brute).map(e=>[e.dead,e.cracks])]);
const B=+(opt('--beam')||2500),D=+(opt('--depth')||90);
// Targets are authored in screen coordinates; inverted physics stores mirrored y.
const screenY=g=>g.flipped?g.room.h-g.p.y-g.p.h:g.p.y;
const cols=def.cols||40,rows=def.rows||23,dir=side?def.side:def.exit||'right';
const at=(c,r)=>(def.map[r]||'')[c]||'.';
const edge=[];
if(dir==='right'||dir==='left'){const c=dir==='right'?cols-1:0;for(let r=0;r<rows;r++)if(at(c,r)!=='#')edge.push([c,r]);}
else{const r=dir==='up'?0:rows-1;for(let c=0;c<cols;c++)if(at(c,r)!=='#')edge.push([c,r]);}
if(!edge.length){console.error('no opening on the',dir,'edge');process.exit(1);}
const ex=edge.reduce((s,[c,r])=>[s[0]+c,s[1]+r],[0,0]).map(v=>v/edge.length);
const target=[ex[0]*8+(dir==='right'?24:dir==='left'?-24:0),ex[1]*8+(dir==='up'?-24:dir==='down'?24:0)];
let start=opt('--start')?JSON.parse(readFileSync(opt('--start'),'utf8')):[];
const done=(g,ev)=>required.every(t=>(g.rbrRequired||[]).includes(t))&&ev.some(e=>e.type==='exit'&&(!!e.side)===side)&&(!wantShard||g.shards.size>0);
if(wantShard)def.map.forEach((row,r)=>{const c=row.indexOf('*');if(c>=0)vias.unshift([c,r]);});
for(const [k,[c,r]] of vias.entries()){
 const tx=c*8,ty=r*8;
 prefixEvents=sideRun(id,start,0).events.map(e=>e.type).filter(t=>required.includes(t));
 const res=beam(id,{key,actions:acts,start,beam:B,maxDepth:D,reject,score:g=>Math.hypot(g.p.x-tx,screenY(g)-ty),goal:g=>Math.abs(g.p.x-tx)<=6&&Math.abs(screenY(g)-ty)<=8&&g.p.state!=='dead'});
 if(!res){console.log('could not reach waypoint',k,[c,r]);process.exit(2);}
 start=res.tape;console.log('waypoint',k,'reached at depth',res.depth);
}
prefixEvents=sideRun(id,start,0).events.map(e=>e.type).filter(t=>required.includes(t));
const res=beam(id,{key,actions:acts,start,beam:B,maxDepth:D,reject,score:g=>Math.hypot(g.p.x-target[0],screenY(g)-target[1]),goal:(g,ev)=>done(g,ev)});
if(!res){console.log('no route to the',dir,'exit');process.exit(2);}
const ok=r=>r.exited&&r.deaths===0&&r.side===side;
const t=polish(id,compress(res.tape),x=>x.exited&&x.deaths===0&&x.events.some(e=>e.type==='exit'&&!!e.side===side)&&(!wantShard||x.events.some(e=>e.type==='shard'))&&!x.events.some(e=>avoid.includes(e.type))&&required.every(t=>x.events.some(e=>e.type===t)),3);
const r=sideRun(id,t);
if(!ok(r)||r.events.some(e=>avoid.includes(e.type))||!required.every(t=>r.events.some(e=>e.type===t))){console.error('route fails the requested constraints; not saved');process.exit(2);}
console.log(JSON.stringify(t));
console.log('exited',r.exited,'side',r.side,'deaths',r.deaths,'frame',r.frame);
console.log(trace(id,t,10));
// --save: store the tape in the region's tapes file and regenerate the region.
if(a.includes('--save')){
 const {readdirSync,readFileSync,writeFileSync,existsSync}=await import('node:fs');
 const {execFileSync}=await import('node:child_process');
 const {fileURLToPath}=await import('node:url');const {dirname,resolve}=await import('node:path');
 const dir=resolve(dirname(fileURLToPath(import.meta.url)),'rbr-src'),nn=String(def.rbr).padStart(2,'0');
 const src=readdirSync(dir).find(f=>f.startsWith(nn+'-')&&f.endsWith('.mjs'));
 const tf=resolve(dir,src.replace(/\.mjs$/,'.tapes.json'));
 const tapes=existsSync(tf)?JSON.parse(readFileSync(tf,'utf8')):{};
 tapes[id+(opt('--as')?'#'+opt('--as'):side?'#side':'')]=t;writeFileSync(tf,JSON.stringify(tapes,null,0).replace(/\],"/g,'],\n"'));
 console.log(execFileSync('node',[resolve(dir,'gen.mjs'),nn]).toString().trim());
}
