// node scripts/climb/tools/cside-beam.mjs <roomId> [beam] [depth]: beam search for a zero-death route through a Core room
// (macros of runs, jumps, 8-way dashes and climbs; scored by flood distance to the next unlit stake, then the exit). Writes beam-<id>.json beside this file.
import fs from 'node:fs';import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
const P='/Users/computer/Projects/Bladefall-2D Antigravity/';const T=await import(P+'scripts/pcore-tape.mjs');const Core=T.Core;
globalThis.BLADEFALL_CLIMB=true;require(P+'public/bladefall-climb.js');require(P+'public/bladefall-climb-core-tapes.js');require(P+'public/bladefall-climb-cores.js');
const [id,BEAM='400',DEPTH='90']=process.argv.slice(2);const def=globalThis.BladefallClimbCsides.rooms.find(d=>d.id===id);
const g0=Core.createGame([def],{room:0}),rm=g0.room,C=rm.cols,R=rm.rows;
const bad=v=>v===1||v>=3&&v<=6;
function flood(goals){const d=new Int32Array(C*R).fill(1e6),q=[];for(const [c,r] of goals){const i=r*C+c;if(c>=0&&r>=0&&c<C&&r<R&&!bad(rm.grid[i])){d[i]=0;q.push(i);}}
 for(let h=0;h<q.length;h++){const k=q[h],c=k%C,r=(k-c)/C;for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=r+dr;if(nc<0||nr<0||nc>=C||nr>=R)continue;const j=nr*C+nc;if(d[j]>d[k]+1&&!bad(rm.grid[j])){d[j]=d[k]+1;q.push(j);}}}return d;}
const ex=rm.exit,exitGoals=[];for(let i=0;i<(ex==='left'||ex==='right'?R:C);i++)exitGoals.push(ex==='right'?[C-1,i]:ex==='left'?[0,i]:ex==='up'?[i,0]:[i,R-1]);
const stones=g0.ents.filter(e=>e.type==='stone');const stoneFlood=stones.map(e=>flood([[Math.floor((e.x+4)/8),Math.floor((e.y+4)/8)]]));const exitFlood=flood(exitGoals);
function clone(g){return {...g,p:structuredClone(g.p),ents:g.ents.map(e=>({...e})),prev:{...g.prev},buf:{...g.buf},events:[],shards:new Set(g.shards)};}
function score(g){const p=g.p,c=Math.floor((p.x+4)/8),r=Math.floor((p.y+6)/8),i=r*C+c;const lit=g.ents.filter(e=>e.type==='stone'&&e.lit).length;
 let d;if(lit<stones.length){d=Math.min(...stones.map((e,k)=>g.ents.find(x=>x.id===e.id).lit?1e6:stoneFlood[k][i]));}else d=exitFlood[i];
 return lit*500-(d>=1e6?400:d*4)-g.frame*0.02+(p.dashes>0?2:0);}
const MACROS=[];
for(const dir of ['','l','r'])for(const [n,j] of [[6,0],[12,0],[20,0],[8,8],[14,14],[22,22],[30,30]]){const seq=j?[[j,dir+'j'],[n-j>0?n-j:0,dir]].filter(x=>x[0]):[[n,dir]];MACROS.push(seq);}
for(const d of ['u','d','l','r','ul','ur','dl','dr'])for(const n of [8,14,22]){MACROS.push([[1,d+'x'],[n,d]]);MACROS.push([[1,d+'x'],[n,d.replace('d','')||'']]);}
for(const d of ['r','l'])for(const n of [10,20,30]){MACROS.push([[n,'u'+d+'g']]);MACROS.push([[n,'d'+d+'g']]);MACROS.push([[n,d+'g']]);}
const run=(g,seq)=>{let dead=false,exit=false;for(const [n,k] of seq)for(let i=0;i<n;i++){Core.step(g,T.keysToInput(k));for(const e of g.events){if(e.type==='death')dead=true;if(e.type==='exit')exit=true;}g.events.length=0;if(dead||exit)return {dead,exit};}return {dead,exit};};
let beam=[{g:clone(g0),tape:[],s:0}];let best=null;
for(let depth=0;depth<+DEPTH&&!best;depth++){const next=[],seen=new Set();
 for(const b of beam)for(const m of MACROS){const g=clone(b.g);const r=run(g,m);if(r.dead)continue;const tape=[...b.tape,...m];if(r.exit){best=tape;break;}
  const p=g.p,key=[Math.round(p.x/3),Math.round(p.y/3),Math.round(p.vx/40),Math.round(p.vy/40),p.dashes,p.state,g.ents.filter(e=>e.lit).length,g.ents.filter(e=>e.type==='crumble'&&e.state!=='idle').length].join(',');if(seen.has(key))continue;seen.add(key);
  next.push({g,tape,s:score(g)});if(best)break;}
 next.sort((a,b)=>b.s-a.s);beam=next.slice(0,+BEAM);
 if(depth%5===0)console.log('depth',depth,'beam',beam.length,'best score',beam[0]?.s.toFixed(1),'lit',beam[0]?beam[0].g.ents.filter(e=>e.lit).length:0,'pos',beam[0]?[Math.round(beam[0].g.p.x),Math.round(beam[0].g.p.y)]:'');
 if(!beam.length)break;}
if(best){const out=[];for(const [n,k] of best){if(out.length&&out.at(-1)[1]===k)out.at(-1)[0]+=n;else out.push([n,k]);}
 const v=T.runRoom([def],0,out);console.log('FOUND',out.reduce((a,[n])=>a+n,0),'frames · verify exit',v.exited,'deaths',v.deaths);fs.writeFileSync(new URL(`./beam-${id}.json`,import.meta.url),JSON.stringify(out));}
else console.log('no route');
