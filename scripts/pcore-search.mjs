// Route search for Precision Core rooms (7.254). Breadth-first over short input segments with state
// de-duplication. Used two ways while authoring:
//  - find an intended tape (goal = the room's exit, or a stage goal), and
//  - hunt for skips: search with a constraint (e.g. "never touch the recoil pod") and expect no result.
// A found tape is a list of [frames, keys] like every other tape. Nothing here runs in the game.
//
//   import {search,ACT} from './pcore-search.mjs';
//   const r=search('p75',{actions:ACT.basic,goal:(g,ev)=>g.exited,maxNodes:200000});
import {Core,Rooms,keysToInput,expand} from './pcore-tape.mjs';

const SKIP=new Set(['defs','rooms','room','spikeSafe']);
export function snapshot(g){const o={};for(const k in g)if(!SKIP.has(k))o[k]=g[k];const c=structuredClone(o);c.defs=g.defs;c.rooms=g.rooms;c.room=g.room;
 // Freezing changes terrain in place. Each search branch needs its own ice/grid,
 // or one candidate's freeze/thaw silently changes the other candidates' physics.
 if(g.water)c.room={...g.room,grid:g.room.grid.slice(),ice:g.room.ice?.slice()};
 // Tide hazard callbacks close over the game: bind a fresh callback to this snapshot.
 if(c.water?.tide){const t=c.water.tide;c.spikeSafe=(cc,r)=>cc>=t.c0&&cc<=t.c1&&r*8>=globalThis.BladefallPrecisionWater.surfaceY(c);}else c.spikeSafe=g.spikeSafe||null;
 return c;}
export function restore(s){return snapshot(s);}
export function gameAt(id,tape=[]){
 const i=Rooms.all.findIndex(d=>d.id===id);if(i<0)throw new Error('no room '+id);
 const g=Core.createGame(Rooms.all,{room:i});
 for(const k of expand(tape))Core.step(g,keysToInput(k));g.events.length=0;return g;
}
/* Run a segment; returns {g,dead,exited,events}. */
export function run(g,seg){
 const ev=[];let dead=false,exited=false;
 for(const k of expand(seg)){Core.step(g,keysToInput(k));for(const e of g.events){ev.push(e);if(e.type==='death')dead=true;if(e.type==='exit')exited=true;}g.events.length=0;if(dead||exited)break;}
 return {g,dead,exited,events:ev};
}
const D8=['r','l','u','d','ru','lu','rd','ld'];
/* Segment vocabularies. Each is a list of tapes (usually 1–3 steps). */
export const ACT={
 move:[[[6,'r']],[[6,'l']],[[6,'']],[[3,'r']],[[3,'l']]],
 jumps:['','r','l'].flatMap(d=>[[[12,d+'j']],[[4,d+'j']],[[8,d+'j']]]),
 dashes:D8.map(d=>[[5,d+'x']]),
 grabs:[[[12,'rgu']],[[12,'lgu']],[[12,'rg']],[[12,'lg']],[[20,'rgu']],[[20,'lgu']]],
 strikes:[[[1,'s']],[[1,'us']],[[1,'ds']],[[1,'rs']],[[1,'ls']]],
};
ACT.basic=[...ACT.move,...ACT.jumps,...ACT.dashes];
ACT.climb=[...ACT.basic,...ACT.grabs];
ACT.blade=[...ACT.basic,...ACT.strikes];
/* A coarse state key: knight cell, speed buckets, dash and phase, plus a digest of moving things. */
export function defaultKey(g){
 const p=g.p;
 const ents=g.ents.map(e=>(e.x|0)+','+(e.y|0)+(e.solid?'s':'')+(e.open?'o':'')+(e.lit?'l':'')+(e.timer>0?'t':'')+(e.gone?'g':'')+(e.state||'')).join(';');
 return [p.x>>1,p.y>>1,Math.round(p.vx/30),Math.round(p.vy/30),p.state,p.dashes,p.onGround?1:0,g.phase,p.carrying?1:0,ents,g.flipped?1:0,p.airJumps||0].join('|');
}
export function search(id,{actions=ACT.basic,goal,maxNodes=150000,maxDepth=40,key=defaultKey,start=[],reject=null,verbose=false}={}){
 const g0=gameAt(id,start);
 let frontier=[{s:snapshot(g0),tape:[]}],seen=new Set([key(g0)]),nodes=0;
 for(let depth=0;depth<maxDepth&&frontier.length;depth++){
  const next=[];
  for(const n of frontier){
   for(const a of actions){
    if(++nodes>maxNodes){if(verbose)console.log('node limit at depth',depth);return null;}
    const g=restore(n.s);const r=run(g,a);
    if(r.dead)continue;
    const tape=[...n.tape,...a];
    if(reject&&reject(g,r.events))continue;
    if(goal(g,r.events,r))return {tape:[...start,...tape],g,nodes,depth};
    if(r.exited)continue;
    const k=key(g);if(seen.has(k))continue;seen.add(k);
    next.push({s:snapshot(g),tape});
   }
  }
  if(verbose)console.log('depth',depth,'frontier',next.length,'nodes',nodes);
  frontier=next;
 }
 return null;
}
/* Compress a tape: merge neighbouring steps with the same keys. */
export function compress(tape){const o=[];for(const [n,k]of tape){if(o.length&&o[o.length-1][1]===k&&!/[jxgsqp]/.test(k))o[o.length-1][0]+=n;else o.push([n,k]);}return o;}
/* Beam search: like search, but each layer keeps only the `beam` best states by score (lower is better),
   e.g. the distance to the exit. Much deeper than breadth-first; not exhaustive, so it proves nothing
   about skips on its own. */
export function beam(id,{actions=ACT.basic,goal,score,beam:B=3000,maxDepth=80,key=defaultKey,start=[],reject=null,verbose=false}={}){
 const g0=gameAt(id,start);
 let frontier=[{s:snapshot(g0),tape:[],sc:score(g0)}],seen=new Set([key(g0)]),nodes=0;
 for(let depth=0;depth<maxDepth&&frontier.length;depth++){
  let next=[];
  for(const n of frontier){
   for(const a of actions){
    nodes++;
    const g=restore(n.s);const r=run(g,a);
    if(r.dead)continue;
    const tape=[...n.tape,...a];
    if(reject&&reject(g,r.events))continue;
    if(goal(g,r.events,r))return {tape:[...start,...tape],g,nodes,depth};
    if(r.exited)continue;
    const k=key(g);if(seen.has(k))continue;seen.add(k);
    next.push({s:snapshot(g),tape,sc:score(g)});
   }
  }
  next.sort((a,b)=>a.sc-b.sc);if(next.length>B)next=next.slice(0,B);
  if(verbose&&depth%5===0)console.log('depth',depth,'frontier',next.length,'best',next[0]?.sc?.toFixed?.(1),'nodes',nodes);
  frontier=next;
 }
 return null;
}
export const toward=(tx,ty)=>g=>Math.hypot(g.p.x-tx,g.p.y-ty);
/* Polish a found tape: greedily drop steps, drop needless jumps/grabs, and shorten holds while the
   tape still satisfies `ok(result)` (default: exits with no deaths). Makes planner output read like a
   person played it, for the pause menu's "play the intended route". */
export function polish(id,tape,ok=r=>r.exited&&r.deaths===0,rounds=3){
 const test=t=>{const g=gameAt(id);let deaths=0,exited=false;const ev=[];for(const k of expand(t)){Core.step(g,keysToInput(k));for(const e of g.events){ev.push(e);if(e.type==='death')deaths++;if(e.type==='exit')exited=true;}g.events.length=0;if(exited)break;}return {g,deaths,exited,events:ev};};
 let cur=compress(tape.map(s=>[...s]));
 for(let round=0;round<rounds;round++){
  let changed=false;
  for(let i=0;i<cur.length;i++){
   const tries=[];
   tries.push(cur.filter((_,j)=>j!==i));                                        // drop the step
   const [n,k]=cur[i];
   if(/[jg]/.test(k)&&!/[xsqp]/.test(k)){for(const drop of ['j','g','u'])if(k.includes(drop))tries.push(cur.map((s,j)=>j===i?[n,k.replace(drop,'')]:s));}
   if(n>2)tries.push(cur.map((s,j)=>j===i?[Math.max(1,n>>1),k]:s));
   for(const t of tries){const c=compress(t);if(ok(test(c))){cur=c;changed=true;break;}}
  }
  if(!changed)break;
 }
 return cur;
}
