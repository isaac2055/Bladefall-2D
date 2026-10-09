// The Climb (7.265) builder: turns Room by Room's regions 1–9 into continuous worlds and writes
// public/bladefall-climb-worlds.js.   node scripts/climb/build-climbs.mjs [--only N] [--verbose]
//
// For each world (scripts/climb/spec.mjs): the rooms, in order, become sections. Each section is placed where the
// previous one's exit leads (right, left, up or down) and only its own edge is opened to receive the knight:
//  - entered from the side: a short tunnel through the wall beside the fire, floors aligned;
//  - entered from below: a two-tile shaft up through the floor beside the fire, capped with a one-way ledge
//    so the floor the room was designed with is unchanged (the knight climbs the shaft's walls and steps out);
//  - entered from above: the ceiling over the fire is opened and the knight drops in.
// Every seam is then proved by simulation: the previous room's own route carries the knight across (the same
// carry the page uses, BladefallClimb.carry), a search walks or climbs him to the next fire with no death, the next
// room's own route still finishes from its fire, and idling at the fire is safe. A seam that fails stops the build.
import {readFileSync,writeFileSync,mkdirSync,readdirSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {Core,Rooms,RBR,expand,keysToInput,snapshot,restore,run,ACT} from '../rbr-lib.mjs';
import {WORLDS,SAVED_FOR_LATER,MAX_DIFFICULTY} from './spec.mjs';
import {mirrorRoom,mirrorTape} from '../rbr-src/mirror-lib.mjs';
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../..'),require=createRequire(import.meta.url);
globalThis.BLADEFALL_CLIMB=false;require(resolve(root,'public/bladefall-climb.js'));
const CL=globalThis.BladefallClimb;
const TRACE=process.argv.includes('--trace'),args=process.argv.slice(2),only=args.includes('--only')?+args[args.indexOf('--only')+1]:0,verbose=args.includes('--verbose');

/* ---------------------------------------------------------------- ratings */
const csv=readFileSync(resolve(root,'docs/playtest/room-reviews-2026-10-01.csv'),'utf8').trim().split('\n').slice(1)
 .map(l=>l.match(/"([^"]*)"/g).map(s=>s.slice(1,-1)));
const RATE=Object.fromEntries(csv.map(r=>[r[0],{diff:+r[3]||null,fun:+r[4]||null}]));

/* ---------------------------------------------------------------- map helpers */
const ROCK=new Set(['#','%']);
const dims=d=>({C:d.cols||40,R:d.rows||23});
const gridOf=d=>{const {C,R}=dims(d);const g=[];for(let r=0;r<R;r++)g.push((d.map[r]||'').padEnd(C,'.').split(''));return g;};
const spawnOf=d=>{for(let r=0;r<d.map.length;r++){const c=d.map[r].indexOf('P');if(c>=0)return {c,r};}throw new Error('no spawn in '+d.id);};
function opening(d,side){
 const g=gridOf(d),{C,R}=dims(d),out=[];
 if(side==='right'||side==='left'){const c=side==='right'?C-1:0;for(let r=0;r<R;r++)if(!ROCK.has(g[r][c]))out.push(r);}
 else{const r=side==='up'?0:R-1;for(let c=0;c<C;c++)if(!ROCK.has(g[r][c]))out.push(c);}
 return out;
}
const EXTRA_TAPES={};
const tapeOf=id=>EXTRA_TAPES[id]||Rooms.tapes[id];
const frames=t=>expand(t);

/* Run a room's own tape (on a possibly opened copy) and return how it left. */
function runTape(def,tape,{extra=40,any=false}={}){
 const g=Core.createGame([def],{room:0});let exit=null,deaths=0,snap=null;
 const f=frames(tape);
 for(let i=0;i<f.length+extra;i++){
  Core.step(g,keysToInput(f[i]||''));
  // (7.280) a knight leaving a flipped room crosses upright, as the page now hands him over
  for(const e of g.events){if(e.type==='death')deaths++;if(e.type==='exit'&&!exit){exit={side:!!e.side,i};if(g.flipped&&globalThis.BladefallPrecisionGravity)globalThis.BladefallPrecisionGravity.mirror(g);snap=CL.snap(g);}}
  g.events.length=0;if(exit)break;
 }
 return {exit,deaths,snap,g};
}
function idleSafe(def,n=150){const g=Core.createGame([def],{room:0});for(let i=0;i<n;i++){Core.step(g,keysToInput(''));for(const e of g.events)if(e.type==='death')return false;g.events.length=0;}return true;}

// Cache successful search tapes, never failures. Every hit is replayed against today's simulation before use.
// Files are independent so simultaneous world builds cannot overwrite one another's proofs.
const proofDir=resolve(root,'scripts/climb/.cache/seam-proofs');mkdirSync(proofDir,{recursive:true});
function proofFile(g,kind){const {defs,rooms,room,spikeSafe,...state}=g;
 return resolve(proofDir,createHash('sha1').update(JSON.stringify([kind,room.def,state])).digest('hex')+'.json');}
function readProof(file){try{return JSON.parse(readFileSync(file,'utf8'));}catch{return null;}}
function saveProof(file,tape){try{writeFileSync(file,JSON.stringify(tape));}catch{}}

/* From the knight's state just after a seam, can he reach the fire (stand at the spawn)? A short beam search. */
const MOVES=[...ACT.move,...ACT.jumps,...ACT.grabs,[[8,'r']],[[8,'l']],[[16,'u']],[[16,'gu']],[[16,'rgu']],[[16,'lgu']],[[1,'']],[[20,'']]];
function reachFire(g0,spawn,{beam=600,depth=40}={}){
 const key=g=>[g.p.x,g.p.y,Math.round(g.p.vx/20),Math.round(g.p.vy/20),g.p.state,g.p.onGround?1:0].join('|');
 // a fire set a little above its footing (the Bell Below's cart): standing where the knight settles from it counts
 let settled=spawn.y;try{const s0=Core.createGame([g0.room.def],{room:0});for(let i=0;i<30;i++){Core.step(s0,keysToInput(''));s0.events.length=0;}if(s0.p.onGround&&Math.abs(s0.p.x-spawn.x)<=10)settled=s0.p.y;}catch(e){}
 const ok=g=>g.p.onGround&&Math.abs(g.p.x-spawn.x)<=10&&(Math.abs(g.p.y-spawn.y)<=2||Math.abs(g.p.y-settled)<=2);
 if(ok(g0))return {tape:[]};
 const file=proofFile(g0,['fire',spawn,settled]),cached=readProof(file);
 if(cached){const g=restore(g0),r=run(g,cached);if(!r.dead&&!r.exited&&ok(g))return {tape:cached};}
 const found=tape=>{saveProof(file,tape);return {tape};};
 // Try ordinary movement before the beam search; each candidate is still simulated from the exact seam state.
 for(const t of [[[90,'']],[[80,'l']],[[80,'r']],[[70,'lgu'],[30,'r']],[[70,'rgu'],[30,'l']],[[20,'lj'],[50,'l']],[[20,'rj'],[50,'r']]]){
  const g=restore(g0),tape=[];
  for(const k of frames(t)){Core.step(g,keysToInput(k));const bad=g.events.some(e=>e.type==='death'||e.type==='exit');g.events.length=0;
   if(bad)break;if(tape.length&&tape.at(-1)[1]===k)tape.at(-1)[0]++;else tape.push([1,k]);if(ok(g))return found(tape);}
 }
 let front=[{s:snapshot(g0),tape:[]}],seen=new Set([key(g0)]);
 for(let d=0;d<depth&&front.length;d++){
  const next=[];
  for(const n of front)for(const a of MOVES){
   const g=restore(n.s);const r=run(g,a);if(r.dead)continue;
   const tape=[...n.tape,...a];if(ok(g))return found(tape);
   if(r.exited)continue;const k=key(g);if(seen.has(k))continue;seen.add(k);
   next.push({s:snapshot(g),tape,sc:Math.hypot(g.p.x-spawn.x,(g.p.y-spawn.y)*1.3)});
  }
  next.sort((a,b)=>a.sc-b.sc);front=next.slice(0,beam);
 }
 return null;
}

/* ---------------------------------------------------------------- one seam */
/* Opening a seam: the rock cells cut are remembered (def.seam), so the page can close the seam again once the
   knight has reached the section's fire, and the room then plays exactly as it was designed. */
function carve(def,cells,ch='.'){
 const g=gridOf(def);let n=0;const seam=[...(def.seam||[])];
 for(const [c,r] of cells){if(g[r]&&ROCK.has(g[r][c])){seam.push([c,r,g[r][c]]);g[r][c]=ch;n++;}}
 return {def:{...def,map:g.map(row=>row.join('')),seam},n};
}
function placeNext(prev,prevSec,next,exitSnap,opt=0){
 const pd=dims(prev),nd=dims(next),sp=spawnOf(next),dir=prev.exit||'right';
 if(dir==='right'||dir==='left'){
  const rows=opening(prev,dir);const floor=Math.max(...rows)+1;
  if(opt>0){
   // Other heights: a short tunnel through the wall into whatever open space is behind it, floors aligned.
   const g=gridOf(next),cand=[];for(let d=1;d<=12;d++)for(const tr of [sp.r-d,sp.r+d])if(tr>=3&&tr<=nd.R-2)cand.push(tr);
   const tr=cand[opt-1];
   if(tr===undefined){
    // Last resort (7.275, the Deep Line's carts): a fire with no floor to walk to (a cart over spikes). A tunnel runs
    // in through the rock above it and a two-wide hole drops the knight onto the fire. The room below is untouched.
    if(opt-1>cand.length)return null;
    let f=sp.r;while(f>0&&!ROCK.has(g[f][sp.c]))f--;
    if(f<3||!ROCK.has(g[f][sp.c]))return null;
    const step=dir==='right'?1:-1,c0=dir==='right'?0:nd.C-1,dc=dir==='right'?sp.c:sp.c-1,cells=[];
    for(let c=c0;dir==='right'?c<=dc+1:c>=dc;c+=step){if(c!==dc&&c!==dc+1&&!ROCK.has(g[f][c]))return null;for(const r of [f-3,f-2,f-1])cells.push([c,r]);}
    for(const c of [dc,dc+1])for(let r=f;r<sp.r&&ROCK.has(g[r][c]);r++)cells.push([c,r]);
    const y=prevSec.y+floor-f,x=dir==='right'?prevSec.x+pd.C:prevSec.x-nd.C;
    const {def,n}=carve(next,cells);return {x,y,def,how:`${dir} tunnel over the ceiling, dropping at ${dc}–${dc+1} (${n} rock)`};
   }
   const step=dir==='right'?1:-1,c0=dir==='right'?0:nd.C-1,cells=[];let c=c0,k=0;
   if(!ROCK.has(g[tr+1][c0]))return {skip:true};
   while(k<10&&[tr-2,tr-1,tr].some(r=>ROCK.has(g[r][c]))){for(const r of [tr-2,tr-1,tr])cells.push([c,r]);c+=step;k++;}
   if(k>=10||!ROCK.has(g[tr+1][c])&&g[tr+1][c]!=='=')return {skip:true};
   const y=prevSec.y+floor-(tr+1),x=dir==='right'?prevSec.x+pd.C:prevSec.x-nd.C;
   const {def,n}=carve(next,cells);return {x,y,def,how:`${dir} tunnel at row ${tr} (${n} rock)`};
  }
  const y=prevSec.y+floor-(sp.r+1),x=dir==='right'?prevSec.x+pd.C:prevSec.x-nd.C;
  const mapped=rows.map(r=>r+prevSec.y-y).filter(r=>r>=0&&r<=sp.r);
  const far=dir==='right'?sp.c:nd.C-1-sp.c;   // a long tunnel stays three tiles tall, so the rock around it stays
  const top=far>6?Math.max(0,sp.r-2):Math.max(0,Math.min(sp.r-3,Math.max(sp.r-6,Math.min(...mapped,sp.r))));
  const cells=[];
  const cs=dir==='right'?[...Array(Math.max(1,sp.c)).keys()]:[...Array(Math.max(1,nd.C-1-sp.c)).keys()].map(k=>nd.C-1-k);
  for(let r=top;r<=sp.r;r++)for(const c of cs)cells.push([c,r]);
  const {def,n}=carve(next,cells);return {x,y,def,how:`${dir} tunnel (${n} rock)`};
 }
 const ex=Math.max(0,Math.min(pd.C-1,Math.floor((exitSnap.x+4)/8)));
 if(dir==='up'){
  const g=gridOf(next);
  const solid=(c,r)=>c<0||c>=nd.C||r>=nd.R||ROCK.has(g[r][c]);
  const siteOk=(h,f=sp.r+1)=>{if(h<0||h+1>=nd.C)return false;let ok=true;
   for(let r=f;r<nd.R&&ok;r++)for(const c of [h,h+1])if(!ROCK.has(g[r][c]))ok=false;
   for(let r=f+1;r<nd.R&&ok;r++)if(!solid(h-1,r)||!solid(h+2,r))ok=false;
   return ok;};
  const floorAt=h=>{let f=sp.r+1;while(f<nd.R-2&&g[f][h]==='.'&&g[f][h+1]==='.')f++;return f;};   // (the first thing under it: track is solid too)
  const sites=[];for(let h=sp.c-5;h<=sp.c+5;h++)if(siteOk(h))sites.push(h);
  sites.sort((a,b)=>(Math.abs(a+1-sp.c)+(a>=sp.c?.5:0))-(Math.abs(b+1-sp.c)+(b>=sp.c?.5:0)));
  // further along the floor (7.275, a fire on a cart with track under it): tried only after every nearer way in
  const far=[];for(let h=0;h+1<nd.C;h++)if(Math.abs(h-sp.c)>5&&siteOk(h,floorAt(h)))far.push(h);
  far.sort((a,b)=>Math.abs(a+1-sp.c)-Math.abs(b+1-sp.c));
  const nearOrder=[...sites.filter(h=>h+1<sp.c||h>sp.c),...sites.filter(h=>!(h+1<sp.c||h>sp.c))];
  // no shaft beside the fire: set down on the floor first (as before), then the shafts further along
  const order=sites.length?[...nearOrder,...far]:(opt>0?[null,...far]:[]);
  if(order.length){
   if(opt>=order.length)return null;const h=order[opt];
   if(h===null)return {x:prevSec.x+ex-sp.c,y:prevSec.y-nd.R,def:next,how:'up, set down on the floor'};
   const f=far.includes(h)?floorAt(h):sp.r+1;
   let d=next,n=0;
   ({def:d,n}=carve(d,[...Array(nd.R-f-1).keys()].flatMap(k=>[[h,f+1+k],[h+1,f+1+k]])));
   ({def:d}=carve(d,[[h,f],[h+1,f]],'='));
   return {x:prevSec.x+ex-h,y:prevSec.y-nd.R,def:d,how:`up shaft at ${h}–${h+1} (${n+2} rock)`};
  }
  if(opt>0)return null;return {x:prevSec.x+ex-sp.c,y:prevSec.y-nd.R,def:next,how:'up, set down on the floor'};
 }
 // down: the fire sits under the opening; the ceiling above it is opened. Other options set the room further along
 // (left or right of the drop), opening its ceiling wherever the drop comes in, so it can clear rooms already below.
 const g=gridOf(next),shifts=[0,1,-1,2,-2,4,-4,8,-8,14,-14,20,-20,26,-26],shift=shifts[opt];if(shift===undefined)return null;
 const dc=sp.c-shift;if(dc<1||dc+1>nd.C-2)return {skip:true};
 const cells=[];
 for(const c of [dc,dc+1])for(let r=0;r<nd.R-1&&ROCK.has(g[r][c]);r++)cells.push([c,r]);
 const {def,n}=carve(next,cells);
 return {x:prevSec.x+ex-dc,y:prevSec.y+pd.R,def,how:`down through the ceiling${shift?` ${shift>0?'left':'right'} of the fire`:''} (${n} rock)`};
}
function overlaps(a,b){return a.x<b.x+b.C&&b.x<a.x+a.C&&a.y<b.y+b.R&&b.y<a.y+a.R;}
/* Two rooms may share one row or column of tiles where both are solid there (a wall on a wall): nothing can be
   walked into, and it lets a room sit flush against its neighbour instead of a tile away. */
const ROOM_DEFS=new Map();
const rockAt=(d,c,r)=>ROCK.has(((d.map[r]||'')[c])||'#');
function sharedWall(a,aDef,b){
 const x0=Math.max(a.x,b.x),x1=Math.min(a.x+a.C,b.x+b.C)-1,y0=Math.max(a.y,b.y),y1=Math.min(a.y+a.R,b.y+b.R)-1;
 if(x1<x0||y1<y0)return true;if(x1>x0&&y1>y0)return false;
 const bDef=ROOM_DEFS.get(b.room);if(!bDef)return false;
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(!rockAt(aDef,x-a.x,y-a.y)||!rockAt(bDef,x-b.x,y-b.y))return false;
 return true;
}
function fireFor(def){
 const sp=spawnOf(def),g=gridOf(def),{C}=dims(def);
 for(const c of [sp.c-1,sp.c+1,sp.c-2])if(c>=0&&c<C&&g[sp.r][c]==='.')return {c,r:sp.r};
 return {c:sp.c,r:sp.r};
}

/* ---------------------------------------------------------------- one chain (the road, or a quest's rooms) */
/* Connectors keep authored rooms intact while making their entrances fit: climbs, drops,
   side-to-side rises, and short horizontal gaps. Every connector has a simulated route. */
let connN=0,ALLOW_CONN=false;
function connector(from,H,palette,lock){
 if(from==='bridge-left'||from==='bridge-right'){
  const right=from==='bridge-right',W=H,R=6,g=Array.from({length:R},(_,r)=>Array(W).fill(r===0||r>=4?'#':'.'));
  g[3][right?2:W-3]='P';
  const id='conn-'+(++connN),def={id,name:'',exit:right?'right':'left',palette,lock,connector:true,cols:W,rows:R,map:g.map(r=>r.join('')),hint:'',question:''};
  const tape=[[W*8,right?'r':'l']],r=runTape(def,tape);if(!r.exit||r.deaths)return null;
  EXTRA_TAPES[id]=tape;Rooms.all.push(def);return def;
 }
 if(from==='raise-left'||from==='raise-right'){
  // Enter at the foot and leave sideways at the top. A U-turn's higher exit then clears this shaft.
  const right=from==='raise-right',W=8,sh=right?3:1,g=Array.from({length:H},()=>Array(W).fill('#'));
  for(let r=1;r<H-1;r++)for(let c=sh;c<sh+4;c++)g[r][c]='.';
  for(let r=H-4;r<H-1;r++)for(let c=right?0:1;c<(right?W-1:W);c++)g[r][c]='.';
  for(let r=1;r<=3;r++)for(let c=right?sh:0;c<(right?W:sh+4);c++)g[r][c]='.';
  g[H-2][right?1:W-2]='P';
  const id='conn-'+(++connN),def={id,name:'',exit:right?'right':'left',palette,lock,connector:true,cols:W,rows:H,map:g.map(r=>r.join('')),hint:'',question:''};
  const g0=Core.createGame([def],{room:0});
  const r=reachEdge(g0,{beam:100,depth:160,score:q=>q.p.y+Math.abs(q.p.x-(right?W*8:0))*.2});if(!r)return null;
  EXTRA_TAPES[id]=r.tape;Rooms.all.push(def);return def;
 }
 if(from==='up-left'||from==='up-right'){
  // A ceiling branch with a raised starting ledge is entered from the side after a climb,
  // instead of cutting an impossible shaft through the hazards below that ledge.
  const left=from==='up-left',W=9,sh=left?4:1,g=Array.from({length:H},()=>Array(W).fill('#'));
  for(let r=1;r<H;r++)for(let c=sh;c<sh+4;c++)g[r][c]='.';
  for(let r=1;r<=3;r++)for(let c=left?0:1;c<(left?W-1:W);c++)g[r][c]='.';
  g[H-2].fill('#');g[H-1].fill('#');g[H-3][sh+1]='P';
  const id='conn-'+(++connN),def={id,name:'',exit:left?'left':'right',palette,lock,connector:true,cols:W,rows:H,map:g.map(r=>r.join('')),hint:'',question:''};
  const g0=Core.createGame([def],{room:0}),r=reachEdge(g0,{beam:600,depth:100,score:q=>q.p.y+Math.abs(q.p.x-(left?0:W*8))*.2});if(!r)return null;
  EXTRA_TAPES[id]=r.tape;Rooms.all.push(def);return def;
 }
 if(from==='down'){
  // a drop: a four-wide shaft fallen straight through, entered at its top, left by its bottom (7.274, for a branch
  // whose door is in a floor and whose rooms would otherwise sit on the road below)
  const W=6,g=[];for(let r=0;r<H;r++){const row=Array(W).fill('#');for(let c=1;c<=4;c++)row[c]='.';g.push(row);}g[0][2]='P';
  const id='conn-'+(++connN),def={id,name:'',exit:'down',palette,lock,connector:true,cols:W,rows:H,map:g.map(r=>r.join('')),hint:'',question:''};
  const g0=Core.createGame([def],{room:0});const r=reachEdge(g0,{beam:200,depth:40,score:q=>-q.p.y});if(!r)return null;
  EXTRA_TAPES[id]=r.tape;Rooms.all.push(def);return def;
 }
 if(from==='turn-left'||from==='turn-right'){
  // a turn (7.275, the Deep Line's westbound carts): walked into from the side, a drop out of its floor. The road
  // goes on into the ceiling of a room below, over its fire, when that room cannot be entered from the side.
  const W=8,left=from==='turn-left',g=[];for(let r=0;r<H;r++)g.push(Array(W).fill('#'));
  const sh=left?3:1;   // the shaft's four columns, at the far side from the way in
  for(let r=1;r<4;r++)for(let c=0;c<W;c++)g[r][c]='.';
  for(let r=1;r<H;r++)for(let c=sh;c<sh+4;c++)g[r][c]='.';
  if(left){g[1][W-1]='#';g[2][W-1]='#';g[3][W-1]='#';}else{g[1][0]='#';g[2][0]='#';g[3][0]='#';}
  g[3][left?1:W-2]='P';
  const id='conn-'+(++connN),def={id,name:'',exit:'down',palette,lock,connector:true,cols:W,rows:H,map:g.map(r=>r.join('')),hint:'',question:''};
  const g0=Core.createGame([def],{room:0});const r=reachEdge(g0,{beam:200,depth:40,score:q=>-q.p.y+Math.abs(q.p.x-(sh+2)*8)});if(!r)return null;
  EXTRA_TAPES[id]=r.tape;Rooms.all.push(def);return def;
 }
 if(from!=='up'&&H<5)return null;   // a side way in needs four rows of corridor (a 4-tile shaft threw here and skipped the rest)
 const W=from==='up'?6:9,g=[];for(let r=0;r<H;r++)g.push(Array(W).fill('#'));
 const sh0=from==='right'?W-5:1;   // the shaft's four columns
 for(let r=0;r<H;r++)for(let c=sh0;c<sh0+4;c++)g[r][c]='.';
 if(from==='up'){g[H-2][1]='=';g[H-2][2]='=';g[H-3][1]='P';}
 else{const cs=from==='left'?[...Array(W).keys()].slice(1):[...Array(W).keys()].slice(0,W-1);
  for(const c of cs)for(let r=H-5;r<H-1;r++)g[r][c]='.';
  for(const c of cs)g[H-1][c]='#';
  if(from==='left'){g[H-2][W-1]='.';g[H-3][W-1]='.';g[H-4][W-1]='.';g[H-2][W-2]='P';}else{g[H-2][0]='.';g[H-3][0]='.';g[H-4][0]='.';g[H-2][1]='P';}}
 const id='conn-'+(++connN);
 const def={id,name:'',exit:'up',palette,lock,connector:true,cols:W,rows:H,map:g.map(r=>r.join('')),hint:'',question:''};
 const g0=Core.createGame([def],{room:0});g0.secretX=(sh0+1)*8;
 const r=reachEdge(g0,{beam:600,depth:80});if(!r)return null;
 EXTRA_TAPES[id]=r.tape;Rooms.all.push(def);return def;
}
/* A drop connector's route, found again when the road comes from the cache (its tape lived only in the run that laid it). */
function dropTape(def){const g0=Core.createGame([def],{room:0});const W=dims(def).C,r=reachEdge(g0,{beam:200,depth:40,score:q=>-q.p.y+Math.abs(q.p.x-W*4)});return r?r.tape:undefined;}
/* A chain of sections. `start` hangs it off a host section (a quest's side door, a secret's opening):
   {def (the host as it plays, with exit set to that door), sec, snap (the knight leaving by it)}.
   `placed` holds sections already in the world, so a branch never overlaps them. */
function buildChain(defs,tag,w,start=null,placed=[],road=false){   // (road: the rest of the road after a turn, 7.277)
 const secs=[],out=[],report=[];
 let prevDef=null,prevOrig=start?start.def:null,prevSec=start?start.sec:null,prevSnap=start?start.snap:null;
 for(const [i,d0] of defs.entries()){
  const tape=tapeOf(d0.id);if(!tape)throw new Error(`${d0.id}: no tape`);
  let sec,def;
  if(i===0&&!start){sec={x:0,y:0};def=d0;report.push(`${d0.id}: start`);}
  else{
   // try each way in (shaft positions) until one sits clear of everything already placed
   let pl=null,why='';
   // the ways in, in order: the first that sits clear of everything AND leaves the room's own routes working
   const keys=[d0.id,d0.id+'#side',d0.id+'#bearing'].filter(k=>tapeOf(k));let fallback=null;
   for(const o of w.roadLifts?.[d0.id]||w.roadGaps?.[d0.id]||w.roadRises?.[d0.id]||w.roadEntrances?.[d0.id]?[]:w.entryOptions?.[d0.id]||Array.from({length:26},(_,i)=>i)){const c=placeNext(prevOrig,prevSec,d0,prevSnap,o);if(!c)break;if(c.skip){if(TRACE)console.log('   ',d0.id,'option',o,'skipped');continue;}const rect={x:c.x,y:c.y,...dims(c.def)};
    const hit=[...secs,...placed].find(s=>overlaps(rect,s)&&!sharedWall(rect,c.def,s));if(hit){why=`would overlap ${hit.room} (${c.how})`;if(TRACE)console.log('   ',d0.id,'option',o,why,JSON.stringify([rect.x,rect.y,rect.C,rect.R]),'hit',JSON.stringify([hit.x,hit.y,hit.C,hit.R]),'from',JSON.stringify([prevSec.x,prevSec.y]));continue;}
    const g=Core.createGame([c.def],{room:0});CL.carry(Core,g,prevSnap,{x:prevSec.x*8,y:prevSec.y*8},{x:c.x*8,y:c.y*8});const drop=d0.connector&&d0.exit==='down';   // a drop shaft has no fire to stand at
    if(!drop&&!reachFire(g,g.room.spawn)){why=`cannot reach the fire (${c.how})`;if(TRACE)console.log('   ',d0.id,'option',o,why,'landed',g.p.x,g.p.y);continue;}
    const routesOk=keys.every(k=>{const t=runTape({...c.def,exit:k.endsWith('#side')?d0.exit:d0.exit},tapeOf(k));return t.exit&&!t.deaths;});
    if(routesOk){pl=c;break;}if(!fallback)fallback=c;}
   if(!pl&&fallback){pl=fallback;why='';}
   if(!pl&&ALLOW_CONN&&start&&i===0&&!defs[0].connector){
    // lift the branch clear with a connector shaft, taller until it fits
    const dir=prevOrig.exit;
    for(let H=8;H<=46&&!pl;H+=4){
     const cd=connector(dir==='up'?'up':dir==='down'?'down':dir==='left'?'left':'right',H,d0.palette,d0.lock);if(!cd)continue;
     try{const sub=buildChain([cd,...defs],tag,w,start,placed);return sub;}catch(e){why=e.message;}
    }
   }
   // An upward exit can enter a high checkpoint from the side via an explicit climbing elbow.
   if(!pl&&w.roadEntrances?.[d0.id]&&i>0&&prevOrig.exit==='up'){
    const entry=w.roadEntrances[d0.id],cd=connector('up-'+entry.side,entry.height,d0.palette,d0.lock);
    if(!cd)throw new Error(`${tag}: cannot make entrance for ${d0.id}`);
    const sub=buildChain([cd,...defs.slice(i)],tag,{...w,roadEntrances:{...w.roadEntrances,[d0.id]:null}},{def:prevOrig,sec:prevSec,snap:prevSnap},[...placed,...secs],true);
    report.push(`${d0.id}: enters through a ${entry.height}-tile climbing elbow`);
    return {secs:[...secs.map(({C,R,...s})=>s),...sub.secs],rects:[...secs,...sub.rects],rooms:[...out,...sub.rooms],report:[...report,...sub.report],lastSnap:sub.lastSnap,lastDef:sub.lastDef,lastSec:sub.lastSec};
   }
   // roadLifts explicitly raises a U-turn room before its exit can point back into the preceding road.
   // (7.277) the road after a turn may turn again (the Fractured Causeway's East and Middle courts both face back)
   if(!pl&&(!start||road)&&i>0&&!d0.connector&&!prevOrig.connector&&['left','right'].includes(prevOrig.exit||'right')){
    // a room that cannot be walked into from the side (its fire is on a cart across a pit): turn the road down
    // through a short connector and enter it from above, over its fire (7.275)
    for(const H of w.roadRises?.[d0.id]?[w.roadRises[d0.id]]:w.roadLifts?.[d0.id]?[w.roadLifts[d0.id]]:w.roadGaps?.[d0.id]?[w.roadGaps[d0.id]]:Array.from({length:15},(_,i)=>8+i*4)){
     const cd=connector(w.roadRises?.[d0.id]?(prevOrig.exit||'right'):w.roadGaps?.[d0.id]?'bridge-'+(prevOrig.exit||'right'):w.roadLifts?.[d0.id]?'raise-'+(prevOrig.exit||'right'):(prevOrig.exit||'right')==='right'?'turn-left':'turn-right',H,d0.palette,d0.lock);if(!cd)continue;
     try{const sub=buildChain([cd,...defs.slice(i)],tag,{...w,roadRises:{...w.roadRises,[d0.id]:null},roadLifts:{...w.roadLifts,[d0.id]:null},roadGaps:{...w.roadGaps,[d0.id]:null}},{def:prevOrig,sec:prevSec,snap:prevSnap},[...placed,...secs],true);
      report.push(`${d0.id}: offset through a ${H}-tile connector (${why})`);
      return {secs:[...secs.map(({C,R,...s})=>s),...sub.secs],rects:[...secs,...sub.rects],rooms:[...out,...sub.rooms],report:[...report,...sub.report],lastSnap:sub.lastSnap,lastDef:sub.lastDef,lastSec:sub.lastSec};}
     catch(e){if(TRACE)console.log('   turn',H,e.message);}
    }
   }
   if(!pl)throw new Error(`${tag}: ${d0.id} ${why}`);
   def=pl.def;sec={x:pl.x,y:pl.y};
   // The seam, as the page plays it: the previous room's route hands the knight across.
   const snap=prevSnap;if(!snap)throw new Error(`${tag}: nothing leads into ${d0.id}`);
   const g=Core.createGame([def],{room:0});CL.carry(Core,g,snap,{x:prevSec.x*8,y:prevSec.y*8},{x:sec.x*8,y:sec.y*8});
   const reach=d0.connector&&d0.exit==='down'?{tape:[]}:reachFire(g,g.room.spawn);
   if(!reach)throw new Error(`${tag}: from ${prevDef.id} the knight cannot reach ${d0.id}'s fire (${pl.how}; landed at ${g.p.x},${g.p.y})`);
   report.push(`${d0.id}: ${pl.how}; to the fire in ${expand(reach.tape).length} frames`);
  }
  // The room's own route from its fire, and a safe fire, on the room as designed (its seam is closed by then).
  const r=runTape(d0,tape,{any:true});
  if(!r.exit||r.exit.side||r.deaths)throw new Error(`${tag}: ${d0.id}'s own route fails (exit ${JSON.stringify(r.exit)}, deaths ${r.deaths})`);
  if(!idleSafe(d0))throw new Error(`${tag}: idling at ${d0.id}'s fire kills`);
  const id=`cl${w.n}-${d0.id}`;
  const fire=def.connector&&def.exit==='down'?null:fireFor(def);
  const room={...def,id,origin:d0.id,decor:[...(def.decor||[])]};
  if(w.dropPeopleOf&&room.people)room.people=room.people.filter(p=>!w.dropPeopleOf.includes(p.quest));
  secs.push({room:id,x:sec.x,y:sec.y,fire,C:dims(def).C,R:dims(def).R});
  out.push(room);ROOM_DEFS.set(id,room);
  if(verbose)console.log(`  ${tag}: placed ${d0.id} at ${sec.x},${sec.y}`);
  prevDef={...def,origin:d0.id};prevOrig={...d0};prevSec=sec;prevSnap=r.snap;
 }
 return {secs:secs.map(({C,R,...s})=>s),rects:secs,rooms:out,report,lastSnap:prevSnap,lastDef:prevOrig,lastSec:prevSec};
}

/* ---------------------------------------------------------------- secrets */
const MOVES_OUT=[...MOVES,...ACT.dashes];
function reachEdge(g0,{beam=900,depth=60,score=null}={}){
 const file=proofFile(g0,'edge'),cached=readProof(file);
 if(cached){const g=restore(g0),r=run(g,cached);if(r.exited&&!r.dead)return {tape:cached,snap:CL.snap(g)};}
 const found=(tape,g)=>{saveProof(file,tape);return {tape,snap:CL.snap(g)};};
 // Authored movement followed by a plain wall climb often reaches a door without a large search.
 const authored=tapeOf(g0.room.def.origin||g0.room.def.id)||[];
 const simple=[[[120,'rgu']],[[120,'lgu']],[[30,'r'],[100,'rgu']],[[30,'l'],[100,'lgu']],[[60,'']],[[90,'r']],[[90,'l']]];
 for(const tape of [...simple,...(authored.length?['rgu','lgu','u'].map(k=>[...authored,[120,k]]):[])]){
  const g=restore(g0),r=run(g,tape);if(r.exited&&!r.dead)return found(tape,g);
 }
 const key=g=>[g.p.x>>1,g.p.y>>1,Math.round(g.p.vx/30),Math.round(g.p.vy/30),g.p.state,g.p.dashes,g.p.onGround?1:0].join('|');
 let front=[{s:snapshot(g0),tape:[]}],seen=new Set();
 for(let d=0;d<depth&&front.length;d++){
  const next=[];
  for(const n of front)for(const a of MOVES_OUT){
   const g=restore(n.s);const r=run(g,a);if(r.dead)continue;const tape=[...n.tape,...a];
   if(r.exited)return found(tape,g);
   const k=key(g);if(seen.has(k))continue;seen.add(k);next.push({s:snapshot(g),tape,sc:score?score(g):g.p.y+Math.abs(g.p.x-g.secretX)*.5});
  }
  next.sort((a,b)=>a.sc-b.sc);front=next.slice(0,beam);
 }
 return null;
}
/* Hang a branch (a quest's rooms, or a secret room) off an opening cut in a ceiling corner of a road section.
   choices: [{defs, name, origin}] tried in order; hosts: road room ids to try. Returns the first that fits. */
function ceilingDoor(choices,hosts,spec,placed,hostOf,used,check=null){
 // first anywhere without a shaft, then with one
 for(const conn of spec.secret?.shaft?[true]:[false,true]){ALLOW_CONN=conn;const f=ceilingDoor1(choices,hosts,spec,placed,hostOf,used,check);if(f){ALLOW_CONN=false;return f;}}
 ALLOW_CONN=false;return null;
}
function ceilingDoor1(choices,hosts,spec,placed,hostOf,used,check){
 for(const id of hosts){
  if(used.has(id))continue;
  // the host as it is played: its seam open (so the way up to the door is proved without the wall the seam takes)
  const h=hostOf(id),host={...h.orig,map:h.room.map,seam:h.room.seam},g=gridOf(host);
  // spec.secret.wide (7.275): a world whose ceiling corners are all covered may cut its door anywhere along a ceiling
  const C0=dims(host).C,spots=[[36,37],[37,38],[1,2],[2,3]];
  if(spec.secret?.wide){const side=[];for(let k=3;k<C0/2-1;k++)side.push([C0-2-k,C0-1-k],[k,k+1]);spots.unshift(...side);}   // just in from the corners (a climb up a wall still reaches them), moving inward
  // Prefer the checkpoint's corner; trying the far corner first searches the entire hard challenge unnecessarily.
  const spawnCol=spawnOf(host).c,corner=cs=>cs[0]<=2||cs[1]>=C0-2;
  spots.sort((a,b)=>Number(corner(b))-Number(corner(a))||Math.abs((a[0]+a[1])/2-spawnCol)-Math.abs((b[0]+b[1])/2-spawnCol));
  // (wide: a ceiling up to ten tiles thick is cut through, the whole height of the door)
  const thick=c=>{let r=0;while(r<gm0.length&&ROCK.has(gm0[r][c]))r++;return r;},gm0=g;
  for(const cols of spots){
   if(!cols.every(c=>ROCK.has(g[0][c])&&(spec.secret?.wide?thick(c)<=10&&thick(c)<dims(host).R-1:!ROCK.has(g[1][c]))))continue;
   // A shaft must open into clear space, not retain spikes directly under its mouth.
   if(cols.some(c=>['^','v','<','>'].includes(g[thick(c)]?.[c])))continue;
   if(check?.pre&&!check.pre(h,cols))continue;
   const gm=gridOf(host);for(const c of cols)for(let r=0;r<gm.length&&ROCK.has(gm[r][c]);r++)gm[r][c]='.';const hostMap=gm.map(r=>r.join(''));
   const own=runTape({...host,map:hostMap},tapeOf(host.id));if(!own.exit||own.deaths)continue;
   const virt={...host,map:hostMap,exit:'up',side:undefined};
   const g0=Core.createGame([virt],{room:0});g0.secretX=cols[0]*8;
   const reach=reachEdge(g0);if(!reach){if(verbose)console.log('  door',id,cols,'cannot be climbed to');continue;}
   for(const ch of choices){
    try{const chain=buildChain(ch.defs,`branch ${ch.origin}`,spec,{def:virt,sec:h.sec,snap:reach.snap},placed);
     if(check&&!check(chain,h,cols)){if(verbose)console.log('  branch',ch.origin,'at',id,cols,'rejected: no way back from it');continue;}
     return {h,cols,chain,choice:ch,tape:reach.tape,start:{def:virt,sec:h.sec,snap:reach.snap}};}
    catch(e){if(verbose)console.log('  branch',ch.origin,'at',id,cols,'rejected:',e.message);}
   }
  }
 }
 return null;
}
const DOOR_TAPES={},SIDE_TAPES={};
/* A way from a room's fire out by one edge (and, for a ceiling door, through those columns), found by search. */
function reachTo(def,dir,cols){
 const oc=cols||opening(def,dir);if(!oc.length)return null;const Cw=dims(def).C*8,Rh=dims(def).R*8,mid=(oc[0]+oc[oc.length-1]+1)*4;
 const tx=dir==='up'||dir==='down'?mid:dir==='right'?Cw:0,ty=dir==='up'?-8:dir==='down'?Rh+8:mid;
 const g=Core.createGame([def],{room:0});
 // keep clear of the seam opening (pressing out through it is the way back to the previous section)
 const nearSeam=q=>(def.seam||[]).some(([c,r])=>c*8<q.p.x+q.p.w+10&&c*8+8>q.p.x-10&&r*8<q.p.y+q.p.h+8&&r*8+8>q.p.y-8);
 const r=reachEdge(g,{beam:600,depth:200,score:q=>Math.hypot(q.p.x+4-tx,q.p.y+6-ty)+(nearSeam(q)?2000:0)});
 if(!r)return null;if(cols&&Math.abs(r.snap.x+4-mid)>16)return null;
 const t=runTape(def,r.tape);return t.exit&&!t.deaths?r.tape:null;
}
function addDoor(main,h,cols,to,tape){
 if(tape)DOOR_TAPES[h.room.id+'#door']=tape;
 const k=main.rooms.findIndex(r=>r.id===h.room.id),r0=main.rooms[k],gm=gridOf(r0);for(const c of cols)for(let r=0;r<gm.length&&ROCK.has(gm[r][c]);r++)gm[r][c]='.';   // (a thick ceiling is cut through)
 main.rooms[k]={...r0,map:gm.map(r=>r.join('')),doors:[...(r0.doors||[]),{edge:'up',cols,to}]};
}


/* ---------------------------------------------------------------- the way back: return passages */
/* From a branch's far end, a passage through the rock between sections back down into the road, so no branch is a
   dead end. A* over 2x2-tile corridor cells (each needs a clear 4x4 block, so walls fit around it), then cut into
   straight segment rooms; the last drops through a new hole in a road section's ceiling. Every segment is proved. */
/* Set down in the road and let go of the keys: nothing kills him (no landing straight onto spikes or into a pit). */
function idleLanding(def,snap,from,sec){
 const g=Core.createGame([def],{room:0});CL.carry(Core,g,snap,from,{x:sec.x*8,y:sec.y*8});
 return !run(g,[[150,'']]).dead;
}
function rectsTiles(list){return list.map(s=>({x:s.x,y:s.y,C:s.C,R:s.R}));}
function blockFree(x,y,occ){for(const r of occ)if(x-1<r.x+r.C&&r.x<x+3&&y-1<r.y+r.R&&r.y<y+3)return false;return true;}
function astar(start,goal,occ,bounds,avoid=null){   // (avoid: cells the path may not use, 7.278)
 const key=(x,y)=>x+','+y,g=new Map([[key(start.x,start.y),0]]),from=new Map();
 // a binary heap on f (the open list was re-sorted every step, which made the builds slow)
 const open=[[0,start.x,start.y,0]];
 const push=e=>{open.push(e);let i=open.length-1;while(i>0){const p=(i-1)>>1;if(open[p][0]<=open[i][0])break;[open[p],open[i]]=[open[i],open[p]];i=p;}};
 const pop=()=>{const top=open[0],last=open.pop();if(open.length){open[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<open.length&&open[l][0]<open[m][0])m=l;if(r<open.length&&open[r][0]<open[m][0])m=r;if(m===i)break;[open[m],open[i]]=[open[i],open[m]];i=m;}}return top;};
 const H=(x,y)=>Math.abs(x-goal.x)+Math.abs(y-goal.y);let n=0;
 while(open.length&&n++<200000){
  const [f,x,y,dirp]=pop();
  if(x===goal.x&&y===goal.y){const path=[[x,y]];let k=key(x,y);while(from.has(k)){const [px,py]=from.get(k);path.push([px,py]);k=key(px,py);}return path.reverse();}
  for(const [dx,dy,d] of [[1,0,1],[-1,0,2],[0,1,3],[0,-1,4]]){
   const nx=x+dx,ny=y+dy;if(nx<bounds.x0||nx>bounds.x1||ny<bounds.y0||ny>bounds.y1)continue;
   if(!(nx===goal.x&&ny===goal.y)&&!blockFree(nx,ny,occ))continue;
   if(avoid&&avoid(nx,ny))continue;
   const cost=(dy<0?4:1)+(dirp&&dirp!==d?10:0),ng=g.get(key(x,y))+cost;
   if(ng<(g.get(key(nx,ny))??1e9)){g.set(key(nx,ny),ng);from.set(key(nx,ny),[x,y]);push([ng+H(nx,ny),nx,ny,d]);}
  }
 }
 return null;
}
let passN=0;
/* targets: the rooms a branch may come back into — only the room whose door it left by, or the branch's own earlier
   rooms (Isaac, 7.269: a branch is a place to explore with a reward at its end, never a shortcut to later in the
   world). [{room (as placed), sec}] */
/* (7.280) A passage piece with one tile of rock around it, open only where its entry and exit openings run out
   (the shape the knight meets in the page, where the neighbouring pieces' rock surrounds it). */
function ringed(def){
 const {C,R}=dims(def),g=Array.from({length:R+2},()=>Array(C+2).fill('#'));
 def.map.forEach((row,r)=>[...row].forEach((ch,c)=>{g[r+1][c+1]=ch;}));
 for(const e of [def.exit,def.entry]){if(!e)continue;
  if(e==='up'||e==='down'){const r=e==='up'?1:R;for(let c=1;c<=C;c++)if(g[r][c]!=='#')g[e==='up'?0:R+1][c]='.';}
  else{const c=e==='left'?1:C;for(let r=1;r<=R;r++)if(g[r][c]!=='#')g[r][e==='left'?0:C+1]='.';}}
 return {...def,cols:C+2,rows:R+2,map:g.map(r=>r.join('')),seam:(def.seam||[]).map(([x,y,ch])=>[x+1,y+1,ch])};
}
/* (7.280) A route proved in a ringed piece runs on one tile past the piece's real edge before the ring lets him out.
   The page hands him on at the real edge (the core's own exit thresholds), so the route is cut there and the next
   piece starts from that frame, as it will in play. */
function cutAtSeam(pd,snap0,from,org,tape){
 const g=Core.createGame([pd],{room:0});CL.carry(Core,g,snap0,from,org);
 const f=frames(tape),RW=(pd.cols-2)*8,RH=(pd.rows-2)*8,ex=pd.exit;
 for(let i=0;i<f.length;i++){
  Core.step(g,keysToInput(f[i]||''));g.events.length=0;
  const p=g.p,x=p.x-8,y=p.y-8;
  const out=ex==='right'?x>=RW-2:ex==='left'?x<=-p.w+2:ex==='up'?y<=-3:y>=RH-2;
  if(out){const t=[];for(const k of f.slice(0,i+1)){if(t.length&&t[t.length-1][1]===k)t[t.length-1][0]++;else t.push([1,k]);}return {tape:t,snap:CL.snap(g)};}
 }
 return {tape,snap:CL.snap(g)};
}
function passage(branchLast,lastSec,lastSnap,targets,occAll,spec,wide=false){
 if(!wide){const r=passage(branchLast,lastSec,lastSnap,targets,occAll,spec,'narrow');if(r)return r;if(verbose)console.log('  passage: a wider search');wide=true;}else if(wide==='narrow')wide=false;
 const d=branchLast,{C,R}=dims(d),dir=d.exit||'right',open=opening(d,dir);
 // start: a short shaft (three cells) straight out of the exit, in line with where the knight left
 const ex=Math.floor((lastSnap.x+4)/8),ey=Math.floor((lastSnap.y+6)/8);
 const step={up:[0,-1],down:[0,1],right:[1,0],left:[-1,0]}[dir];let c0;
 if(dir==='up'||dir==='down'){const c=Math.max(0,Math.min(C-2,ex));c0={x:lastSec.x+c,y:dir==='up'?lastSec.y-2:lastSec.y+R};}
 else{const rr=Math.max(...open);c0={x:dir==='right'?lastSec.x+C:lastSec.x-2,y:lastSec.y+rr-1};}
 const head=[0,1,2,3].map(i=>[c0.x+step[0]*i,c0.y+step[1]*i]);
 const start={x:head[3][0],y:head[3][1]},link=[];
 const clip={up:r=>{r.y1=Math.min(r.y1,lastSec.y-1);},down:r=>{r.y0=Math.max(r.y0,lastSec.y+R);},right:r=>{r.x0=Math.max(r.x0,lastSec.x+C);},left:r=>{r.x1=Math.min(r.x1,lastSec.x-1);}}[dir];
 const occ=occAll;
 const freeExcept=(x,y)=>occ.every(r=>r.x===lastSec.x&&r.y===lastSec.y||!(x-1<r.x+r.C&&r.x<x+3&&y-1<r.y+r.R&&r.y<y+3));
 // The branch may end right against a road section: then the way back is a door straight into it.
 for(const [k,T] of targets.entries()){
  const s=T.sec,host=T.room,hd=dims(host);
  const adj=dir==='right'?s.x===lastSec.x+C:dir==='left'?s.x+hd.C===lastSec.x:dir==='down'?s.y===lastSec.y+R:s.y+hd.R===lastSec.y;
  if(!adj)continue;
  const cells=(dir==='right'||dir==='left')?open.map(o=>lastSec.y+o-s.y):open.map(o=>lastSec.x+o-s.x);
  const lim=(dir==='right'||dir==='left')?hd.R:hd.C;if(!cells.every(c=>c>=1&&c<lim-1))continue;
  const hg=gridOf(host),cut=[];
  for(const c of cells)for(let i=0;i<10;i++){
   const [x,y]=dir==='right'?[i,c]:dir==='left'?[hd.C-1-i,c]:dir==='down'?[c,i]:[c,hd.R-1-i];
   if(!ROCK.has(hg[y][x]))break;hg[y][x]='.';cut.push([x,y]);}
  const hostMap=hg.map(r=>r.join(''));
  const own=runTape({...host,map:hostMap},tapeOf(host.origin));if(!own.exit||own.deaths){if(verbose)console.log('  passage: a door into',host.origin,'breaks its route');continue;}
  const hgame=Core.createGame([{...host,map:hostMap}],{room:0});CL.carry(Core,hgame,lastSnap,{x:lastSec.x*8,y:lastSec.y*8},{x:s.x*8,y:s.y*8});
  if(!reachFire(hgame,hgame.room.spawn)){if(verbose)console.log('  passage: a door into',host.origin,'lands badly');continue;}
  if(!idleLanding({...host,map:hostMap},lastSnap,{x:lastSec.x*8,y:lastSec.y*8},s)){if(verbose)console.log('  passage: a door into',host.origin,'lands in harm');continue;}
  return {defs:[],secs:[],goal:{k,cols:cells,edge:{right:'left',left:'right',down:'up',up:'down'}[dir]},target:T,hostMap,through:[]};
 }
 if(!head.every(([x,y])=>freeExcept(x,y))){if(verbose)console.log('  passage: no room to leave',d.id,dir,JSON.stringify({lastSec,C,R,ex,ey,open,head,near:occ.filter(r=>head.some(([x,y])=>x-1<r.x+r.C&&r.x<x+3&&y-1<r.y+r.R&&r.y<y+3))}));return null;}
 // search only around the branch's end and the rooms it may come back to (fast, and never far)
 let x0=start.x,y0=start.y,x1=start.x,y1=start.y;for(const T of targets){const td=dims(T.room);x0=Math.min(x0,T.sec.x);y0=Math.min(y0,T.sec.y);x1=Math.max(x1,T.sec.x+td.C);y1=Math.max(y1,T.sec.y+td.R);}
 const M=wide?40:16,bounds={x0:x0-M,y0:y0-M,x1:x1+M,y1:y1+M};
 // goals: ceiling corners of road sections (drop in), or a door in a side wall at floor level (walk in);
 // nearest first, counting a climb as three times the distance, so the way back mostly goes down
 const goals=[];const far=(gx,gy)=>Math.abs(gx-start.x)+(gy<start.y?3:1)*Math.abs(gy-start.y);
 for(const [k,T] of targets.entries()){const s=T.sec,room=T.room,g=gridOf(room),{C:hC,R:hR}=dims(room);
  // an edge already used (its exit, a side door, a seam) can still take a way back, clear of its openings by two
  // Prefer a landing beside the checkpoint over a shorter route into the room's hazards.
  const checkpoint=spawnOf(room),extra=T.cost||0;
  const used=e=>{const o=opening(room,e);for(const dr of room.doors||[])if(dr.edge===e)o.push(...dr.cols);for(const rt of room.returns||[])if((rt.edge||'up')===e)o.push(...rt.cols);return o;};
  const clear=(e,cs)=>used(e).every(u=>cs.every(c=>Math.abs(u-c)>2));
  const ceil=[[1,2],[2,3],[hC-4,hC-3],[hC-3,hC-2]];if(wide)for(let c=4;c<hC-5;c+=3)ceil.push([c,c+1]);   // the wide pass: anywhere along the ceiling
  for(const cols of ceil){
   // through up to four tiles of ceiling, to open space below
   const TL=spec?.secret?.wide?12:4;   // (a world of thick ceilings, World 19: through up to twelve)
   let t=1;while(t<=TL&&cols.every(c=>ROCK.has(g[t][c])))t++;if(t>TL||!cols.every(c=>[...Array(t).keys()].every(y=>ROCK.has(g[y][c]))))continue;if(!clear('up',cols))continue;
   goals.push({k,depth:t,edge:'up',cols,x:s.x+cols[0],y:s.y-5,tail:[[0,1],[0,2],[0,3]],dist:far(s.x+cols[0],s.y-5)*1.25+6+extra+Math.abs(cols[0]+.5-checkpoint.c)*4});}
  for(const e of ['left','right']){const wc=e==='left'?0:hC-1,ic=e==='left'?1:hC-2;
   for(let r=2;r<hR-3;r++){
    if(![r-1,r,r+1,r+2].every(y=>ROCK.has(g[y][wc])))continue;
    // through up to four tiles of wall, to open space with a floor under it
    const st=e==='left'?1:-1;let t=1;while(t<=4&&[r,r+1].some(y=>ROCK.has(g[y][wc+st*t])))t++;
    if(t>4||!ROCK.has(g[r+2][wc+st*t]))continue;
    if((room.seam||[]).some(([c,y])=>c===wc&&Math.abs(y-r)<4)||!clear(e,[r,r+1]))continue;
    const gx=e==='left'?s.x-4:s.x+hC+2;
    goals.push({k,depth:t,edge:e,cols:[r,r+1],x:gx,y:s.y+r,tail:e==='left'?[[1,0],[2,0],[3,0]]:[[-1,0],[-2,0],[-3,0]],dist:far(gx,s.y+r)+extra+Math.abs(r+1-checkpoint.r)*4+(e==='left'?checkpoint.c:hC-1-checkpoint.c)*2});}}}
 goals.sort((a,b)=>a.dist-b.dist);
 for(const goal of goals.slice(0,wide?24:10)){
  const host=targets[goal.k].room,hsec=targets[goal.k].sec;
  // the host still plays with the hole, and a knight dropping through it reaches its fire
  const hg=gridOf(host),hd=dims(host);
  const dep=goal.depth||1;
  if(goal.edge==='up'){for(const c of goal.cols)for(let y=0;y<dep;y++)hg[y][c]='.';}
  else for(const r of goal.cols)for(let t=0;t<dep;t++)hg[r][goal.edge==='left'?t:hd.C-1-t]='.';
  const hostMap=hg.map(r=>r.join(''));
  const own=runTape({...host,map:hostMap},tapeOf(host.origin));if(!own.exit||own.deaths){if(verbose)console.log('  passage goal',host.origin,goal.cols,'breaks its route');continue;}
  // (7.278) the path may not turn back into the short corridor out of the exit: the page joins the pieces in order,
  // so a way back that doubled back over it set the knight into the second piece and he walked back into the room
  // (the Fractured Outskirts' two echoes)
  const hx0=Math.min(head[0][0],head[2][0]),hx1=Math.max(head[0][0],head[2][0]),hy0=Math.min(head[0][1],head[2][1]),hy1=Math.max(head[0][1],head[2][1]);
  const avoid=(dir==='left'||dir==='right')?(x,y)=>x>=hx0&&x<=hx1&&y>=hy0-2&&y<=hy1+2:(x,y)=>y>=hy0&&y<=hy1&&x>=hx0-2&&x<=hx1+2;
  let path=astar(start,goal,occ,bounds,avoid);if(path)path=[...head.slice(0,3),...path,...goal.tail.map(([a,b])=>[goal.x+a,goal.y+b])];if(!path){if(verbose)console.log('  passage goal',host.origin,goal.cols,'no path');continue;}
  // canvas: corridor cells open, plus the links into the branch and down into the host
  const openSet=new Set();const mark=(x,y)=>openSet.add(x+','+y);
  for(const [x,y] of path)for(const [a,b] of [[0,0],[1,0],[0,1],[1,1]])mark(x+a,y+b);
  for(const [x,y] of link)mark(x,y);

  // runs of one direction, then pieces cut in the MIDDLE of runs (so every joint is a straight corridor, and every
  // piece holds one turn); a climb gets a spring at the foot of its turn
  const runs=[];let cur=null;
  for(let i=1;i<path.length;i++){const dx=path[i][0]-path[i-1][0],dy=path[i][1]-path[i-1][1],dd=dx>0?'right':dx<0?'left':dy>0?'down':'up';
   if(!cur||cur.dir!==dd){cur={dir:dd,from:i-1,to:i};runs.push(cur);}else cur.to=i;}
  if(!runs.length){if(verbose)console.log('  passage goal',host.origin,'no runs');continue;}
  // cuts three tiles either side of every turn: a turn sits in a small piece of its own, a long run is a straight piece
  // (a run too short for both cuts gets one, in its middle)
  const cuts=[0];
  for(let r=1;r<runs.length;r++){const ci=runs[r].from,prevCi=r>1?runs[r-1].from:0,nextCi=r+1<runs.length?runs[r+1].from:path.length-1;
   const a=ci-3,bb=ci+3;
   if(a-cuts[cuts.length-1]>=3)cuts.push(a);else if(r>1&&ci-prevCi<6&&cuts[cuts.length-1]!==Math.floor((prevCi+ci)/2)&&Math.floor((prevCi+ci)/2)-cuts[cuts.length-1]>=3)cuts.push(Math.floor((prevCi+ci)/2));
   if(bb<nextCi-2&&bb-cuts[cuts.length-1]>=3)cuts.push(bb);}
  if(path.length-1-cuts[cuts.length-1]<3&&cuts.length>1)cuts.pop();
  cuts.push(path.length-1);
  const OPP={up:'down',down:'up',left:'right',right:'left'},dirAt=i=>{const a=path[Math.max(0,i-1)],b=path[Math.max(1,i)];return b[0]>a[0]?'right':b[0]<a[0]?'left':b[1]>a[1]?'down':'up';};
  const pieces=[];
  for(let k=0;k<cuts.length-1;k++){
   const i0=cuts[k],i1=cuts[k+1],cells=path.slice(i0,i1+1);
   let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of cells){x0=Math.min(x0,x-1);y0=Math.min(y0,y-1);x1=Math.max(x1,x+2);y1=Math.max(y1,y+2);}
   const isLast=k===cuts.length-2,exitDir=isLast?{up:'down',left:'right',right:'left'}[goal.edge]:dirAt(i1+1);
   // the cut line: the piece stops where the next begins (they touch, never overlap)
   if(!isLast){const [cx,cy]=path[i1];if(exitDir==='right')x1=Math.min(x1,cx);if(exitDir==='left')x0=Math.max(x0,cx+1);if(exitDir==='down')y1=Math.min(y1,cy);if(exitDir==='up')y0=Math.max(y0,cy+1);}
   if(k>0){const ed=pieces[k-1].exit,[px,py]=path[i0];if(ed==='right')x0=Math.max(x0,px+1);if(ed==='left')x1=Math.min(x1,px);if(ed==='down')y0=Math.max(y0,py+1);if(ed==='up')y1=Math.min(y1,py);}
   pieces.push({x0,y0,x1,y1,exit:exitDir,cells,i0,i1});
  }
  // the first piece stops at the branch's edge, the last at the room it comes back to
  {const q=pieces[0];clip(q);const L=pieces[pieces.length-1],hd2=dims(host);if(goal.edge==='up')L.y1=Math.min(L.y1,hsec.y-1);else if(goal.edge==='left')L.x1=Math.min(L.x1,hsec.x-1);else L.x0=Math.max(L.x0,hsec.x+hd2.C);}
  const rects=pieces.map(q=>({x0:q.x0,y0:q.y0,x1:q.x1,y1:q.y1,exit:q.exit,cells:q.cells,i0:q.i0}));
  if(rects.some(rc=>rc.x1<rc.x0+1||rc.y1<rc.y0+1)){if(verbose)console.log('  passage goal',host.origin,'rects collapse');continue;}
  if(rects.some((a,i)=>rects.some((b,j)=>j>i&&a.x0<=b.x1&&b.x0<=a.x1&&a.y0<=b.y1&&b.y0<=a.y1&&!(j===i+1&&(a.x1+1===b.x0||b.x1+1===a.x0||a.y1+1===b.y0||b.y1+1===a.y0))))){if(verbose)console.log('  passage goal',host.origin,'pieces overlap');continue;}
  // overlap check with the world (except touching)
  // a piece's rectangle may clip another room's border where both are rock (the inner corner of a turn); nothing else
  const rockOnly=(rc,o)=>{for(let y=Math.max(rc.y0,o.y);y<=Math.min(rc.y1,o.y+o.R-1);y++)for(let x=Math.max(rc.x0,o.x);x<=Math.min(rc.x1,o.x+o.C-1);x++){
    if(openSet.has(x+','+y))return false;if(!(x===o.x||x===o.x+o.C-1||y===o.y||y===o.y+o.R-1))return false;}return true;};
  {const hit=[];for(const [i,rc] of rects.entries())for(const o of occ)if(rc.x0<o.x+o.C&&o.x<=rc.x1&&rc.y0<o.y+o.R&&o.y<=rc.y1&&!rockOnly(rc,o))hit.push(`piece ${i}/${rects.length} ${JSON.stringify([rc.x0,rc.y0,rc.x1,rc.y1])} hits ${o.room} ${JSON.stringify([o.x,o.y,o.x+o.C-1,o.y+o.R-1])}`);
   if(hit.length){if(verbose)console.log('  passage goal',host.origin,'segments overlap:',hit.slice(0,2).join('; '));continue;}}
  // rooms
  const lock=d.lock,pal=d.palette,defs=[],secs=[];
  for(const [i,rc] of rects.entries()){
   const Cc=rc.x1-rc.x0+1,Rr=rc.y1-rc.y0+1,g=[];
   // only this piece's own corridor is open (another stretch of the path running alongside stays rock)
   const mine=new Set();for(const [x,y] of rc.cells)for(const [a,b2] of [[0,0],[1,0],[0,1],[1,1]])mine.add((x+a)+','+(y+b2));
   if(i===0)for(const [x,y] of link)mine.add(x+','+y);
   if(i===rects.length-1)for(const [a,b2] of goal.tail)for(const [c,d2] of [[0,0],[1,0],[0,1],[1,1]])mine.add((goal.x+a+c)+','+(goal.y+b2+d2));
   for(let y=0;y<Rr;y++){const row=[];for(let x=0;x<Cc;x++){const k=(rc.x0+x)+','+(rc.y0+y);row.push(openSet.has(k)&&mine.has(k)?'.':'#');}g.push(row);}
   const exit=rc.exit,entry=i===0?OPP[dir]:OPP[defs[i-1].exit];
   // springs: wherever this piece turns from level ground into a climb of four tiles or more, at the foot of it,
   // in the corner away from where you came (so coming back down you can land beside it)
   for(let j=1;j<rc.cells.length-1;j++){const t=rc.i0+j,[ax,ay]=path[t-1],[bx,by]=path[t],[,cy]=path[t+1];
    if(ay!==by||cy>=by)continue;                       // level ground turning into a climb
    let up=0;for(let u=t+1;u<path.length&&path[u][0]===bx&&path[u][1]<path[u-1][1];u++)up++;
    if(up<3)continue;
    const fx=(bx>ax?bx+1:bx)-rc.x0,fy=by+1-rc.y0;
    if(fy>=0&&fy<Rr-1&&fx>=0&&fx<Cc&&g[fy][fx]==='.'&&g[fy+1][fx]==='#')g[fy][fx]='s';}
   // where he stands if he ever has to start here: a floor cell nearest the way in
   const ecell=(x,y)=>entry==='left'?x:entry==='right'?Cc-1-x:entry==='up'?y:Rr-1-y;
   let sp=null,sd=1e9;for(let y=0;y<Rr;y++)for(let x=0;x<Cc;x++)if(g[y][x]==='.'&&y+1<Rr&&g[y+1][x]==='#'&&ecell(x,y)<sd){sd=ecell(x,y);sp=[x,y];}
   if(!sp)for(let y=0;y<Rr&&!sp;y++)for(let x=0;x<Cc&&!sp;x++)if(g[y][x]==='.')sp=[x,y];
   if(!sp){defs.length=0;break;}g[sp[1]][sp[0]]='P';
   const seam=[];for(let y=0;y<Rr;y++)for(let x=0;x<Cc;x++)if(g[y][x]!=='#'&&(entry==='left'?x===0:entry==='right'?x===Cc-1:entry==='up'?y===0:y===Rr-1))seam.push([x,y,'#']);
   const id='pass-'+(++passN);
   const def={id,name:'',exit,entry,seam,palette:pal,lock,passage:true,cols:Cc,rows:Rr,map:g.map(r=>r.join('')),hint:'',question:''};
   defs.push(def);secs.push({room:id,x:rc.x0,y:rc.y0,C:Cc,R:Rr});
  }
  if(defs.length<rects.length){if(verbose)console.log('  passage goal',host.origin,'a segment has no corridor');continue;}
  // Both mouths need two open tiles: a one-tile side entrance traps a two-tile-tall knight.
  if(defs.some(df=>opening(df,df.exit).length<2||opening(df,df.entry).length<2)){if(verbose)console.log('  passage goal',host.origin,'a piece is too thin');continue;}
  // prove it: carry from the branch's exit through every segment into the host, then to its fire
  let snap=lastSnap,from={x:lastSec.x*8,y:lastSec.y*8},ok=true;const through=[];
  for(const [i,def] of defs.entries()){
   // (7.280) proved inside a ring of rock open only at its entry and exit, as the page has the neighbouring rock
   const pd=ringed(def),org={x:(secs[i].x-1)*8,y:(secs[i].y-1)*8};
   const g=Core.createGame([pd],{room:0});CL.carry(Core,g,snap,from,org);
   g.secretX=(def.exit==='down'||def.exit==='up')?(goal.cols[0]-(secs[i].x-hsec.x)+1)*8:0;
   // aim at the exit opening itself
   const ex=def.exit,oc=opening(pd,ex),Cw=pd.cols*8,Rh=pd.rows*8,mid=oc.length?(oc[0]+oc[oc.length-1]+1)*4:0;
   const tx=ex==='up'||ex==='down'?mid:ex==='right'?Cw:0,ty=ex==='up'?-8:ex==='down'?Rh+8:mid;
   const sc=q=>Math.hypot(q.p.x+4-tx,q.p.y+6-ty);
   const r=reachEdge(g,{beam:400,depth:160,score:sc});if(!r){ok=false;if(verbose)console.log('  passage seg',i,'of',defs.length,def.exit,'impassable\n'+def.map.join('\n'));break;}
   const cut=cutAtSeam(pd,snap,from,org,r.tape);through.push(cut.tape);snap=cut.snap;from=org;
  }
  if(!ok){if(verbose)console.log('  passage to',host.id,'not passable');continue;}
  const hgame=Core.createGame([{...host,map:hostMap}],{room:0});CL.carry(Core,hgame,snap,from,{x:hsec.x*8,y:hsec.y*8});
  if(!reachFire(hgame,hgame.room.spawn)){if(verbose)console.log('  passage into',host.id,'lands badly');continue;}
  if(!idleLanding({...host,map:hostMap},snap,from,hsec)){if(verbose)console.log('  passage into',host.id,'lands in harm');continue;}
  for(const def of defs){Rooms.all.push(def);}
  return {defs,secs,goal,target:targets[goal.k],hostMap,through};
 }
 return null;
}

/* ---------------------------------------------------------------- worlds */
const lines=[];let total=0,ok=0;
const worlds=[];
const assemble=args.includes('--assemble')?args[args.indexOf('--assemble')+1]:null;
for(const spec of WORLDS){
 if(only&&spec.n!==only)continue;
 if(assemble){let w=null;try{w=JSON.parse(readFileSync(resolve(assemble,`w${spec.n}.json`),'utf8'));}catch(e){lines.push(`World ${spec.n}: not built yet (left out)`);continue;}worlds.push(w);lines.push(`World ${w.n} · ${w.name}: assembled`);total++;ok++;continue;}
 const reg=RBR.region(spec.n);if(!reg)throw new Error('no Room by Room region '+spec.n);spec._kit=reg.kit;
 for(const [id,t] of Object.entries(spec.tapes||{}))EXTRA_TAPES[id]=t;   // a route for a room the Climb patched
 const byId0=id=>reg.rooms.find(r=>r.id===id)||reg.quests.flatMap(q=>q.rooms).find(r=>r.id===id);
 // spec.patch: small fixes to a room as the climb plays it ({roomId:[[c,r,ch],…]}), e.g. a softlock.
 // spec.aim8: the blade cuts in all eight dash directions in this world (a room flag the core reads)
 const A8=d=>d&&spec.aim8?{...d,aim8:true}:d;
 // spec.exits (7.278): a room the Climb leaves by another side than Room by Room does (its patch opens that way)
 // spec.mirror (7.280): rooms the road meets from the side opposite their fire (after a room that turns back) are laid
 // as their reflection: the map, devices and routes reflected (scripts/rbr-src/mirror-lib.mjs), the same id
 const MIR=new Set(spec.mirror||[]);
 for(const id of MIR)for(const k of Object.keys(Rooms.tapes))if(k===id||k.startsWith(id+'#'))EXTRA_TAPES[k]=mirrorTape(Rooms.tapes[k]);
 const byId=id=>{let d=A8(byId0(id));if(d&&MIR.has(id))d=mirrorRoom(d);if(d&&spec.exits&&spec.exits[id])d={...d,exit:spec.exits[id]};const pt=spec.patch&&spec.patch[id];if(!d||!pt)return d;const g=gridOf(d);for(const [c,r,ch] of pt)g[r][c]=ch;return {...d,map:g.map(r=>r.join(''))};};
 for(const id of spec.order){const rt=RATE[id];if(rt&&rt.diff>MAX_DIFFICULTY)throw new Error(`${id} is rated ${rt.diff}, above ${MAX_DIFFICULTY}`);if(SAVED_FOR_LATER[id])throw new Error(`${id} is saved for later`);}
 // The road is laid once and kept (scripts/climb/.cache, keyed by its rooms, routes and the code that lays it), so a
 // change to quests, secrets or their ways back rebuilds in minutes, not the whole road again.
 // spec.reserve (7.275): ground the page will put there (the arrival junction and its mouths), relative to the first room, kept free
 const reserve=(spec.reserve||[]).map((r,i)=>({...r,room:`(reserved ${i})`}));
 const roadDefs=spec.order.map(byId),roadKey=createHash('sha1').update(JSON.stringify([roadDefs,roadDefs.map(d=>tapeOf(d.id)),reserve,spec.roadLifts,spec.roadRises,spec.roadGaps,spec.entryOptions,spec.roadEntrances,
  buildChain.toString(),placeNext.toString(),carve.toString(),reachFire.toString(),CL.carry.toString(),Core.step.toString().length])).digest('hex').slice(0,16);
 const roadFile=resolve(root,`scripts/climb/.cache/road-${spec.n}-${roadKey}.json`);
 let main;
 // --reuse-road: take this world's newest cached road even if the key moved (a change that cannot move the road,
 // like a core verb the builder never presses)
 if(args.includes('--reuse-road')){try{const dir=resolve(root,'scripts/climb/.cache');const f=readdirSync(dir).filter(x=>x.startsWith(`road-${spec.n}-`)).map(x=>({x,t:statSync(resolve(dir,x)).mtimeMs})).sort((a,b)=>b.t-a.t)[0];
  if(f){main=JSON.parse(readFileSync(resolve(dir,f.x),'utf8'));if(verbose)console.log(`  road ${spec.n}: reused ${f.x}`);}}catch(e){}}
 const patchRoad=m=>{for(const id of spec.order){const pt=spec.patch&&spec.patch[id];if(!pt)continue;const k=m.rooms.findIndex(r=>r.origin===id);const g=gridOf(m.rooms[k]);for(const [c,r,ch] of pt)g[r][c]=ch;m.rooms[k]={...m.rooms[k],map:g.map(r=>r.join(''))};}return m;};
 if(main)main=patchRoad(main);
 if(main)for(const r of main.rooms)ROOM_DEFS.set(r.id,r);
 if(!main)try{main=JSON.parse(readFileSync(roadFile,'utf8'));if(verbose)console.log(`  road ${spec.n}: from the cache`);}
 catch(e){main=buildChain(roadDefs,`world ${spec.n}`,spec,null,reserve);main.tapes=Object.fromEntries(main.rooms.filter(r=>r.connector).map(r=>[r.origin,tapeOf(r.origin)]));try{mkdirSync(dirname(roadFile),{recursive:true});writeFileSync(roadFile,JSON.stringify(main));}catch(e2){}}
 Object.assign(EXTRA_TAPES,main.tapes||{});
 for(const r of main.rooms){
  ROOM_DEFS.set(r.id,r);
  if(r.connector){connN=Math.max(connN,+(r.origin.match(/^conn-(\d+)$/)?.[1]||0));
   if(!tapeOf(r.origin)){const def={...r,id:r.origin},g=Core.createGame([def],{room:0}),ex=def.exit;
    const oc=opening(def,ex),mid=(oc[0]+oc.at(-1)+1)*4,tx=ex==='left'?0:ex==='right'?g.room.w:mid,ty=ex==='up'?0:ex==='down'?g.room.h:mid;
    const proof=reachEdge(g,{beam:200,depth:160,score:q=>Math.hypot(q.p.x+4-tx,q.p.y+6-ty)});
    if(!proof)throw new Error(`cached road ${spec.n}: missing connector route for ${r.origin}`);EXTRA_TAPES[r.origin]=proof.tape;
   }
  }
 }
 const quests=[],placed=[...main.rects,...reserve],used=new Set();
 const hostOf=id=>{const k=spec.order.includes(id)?main.rooms.findIndex(r=>r.origin===id):-1;return k<0?null:{orig:byId(id),sec:main.secs[k],room:main.rooms[k]};};
 for(const qid of spec.quests){
  const q=reg.quests.find(x=>x.id===qid);if(!q)throw new Error(`world ${spec.n}: no quest ${qid}`);
  const qrooms=q.rooms.filter(r=>!SAVED_FOR_LATER[r.id]).map(r=>byId(r.id));   // (7.278: patched like road rooms)
  const from=q.from?`cl${spec.n}-${q.from}`:null;
  if(q.from&&!spec.order.includes(q.from))throw new Error(`quest ${qid} opens from ${q.from}, which is not in world ${spec.n}`);
  let chain={secs:[],rects:[],rooms:[],report:[]},qstart=null,qhost=from;
  if(qrooms.length){
   // The quest hangs off its door: the host's side exit leads straight into its first room.
   // the side door's route on the host as it is played (seam open); where that route needed the seam's wall, a new
   // one is found, and the quest is hung where the knight actually comes out
   const h=hostOf(q.from),side=h.orig.side,played={...h.orig,map:h.room.map};
   let st=runTape(played,tapeOf(h.orig.id+'#side'));
   if(!st.exit||!st.exit.side||st.deaths){const t=reachTo({...played,exit:side,side:undefined},side,null);
    if(t){SIDE_TAPES[h.room.id]=t;st=runTape({...played,exit:side,side:undefined},t);if(st.exit)st.exit.side=true;}
    else st=runTape(h.orig,tapeOf(h.orig.id+'#side'));}
   if(!st.exit||!st.exit.side)throw new Error(`quest ${qid}: ${q.from}'s side tape does not leave by the side`);
   qstart={def:{...h.orig,exit:side},sec:h.sec,snap:st.snap};
   try{if(spec.questCeilings?.[qid]?.force)throw new Error('planned ceiling entrance');try{chain=buildChain(qrooms,`quest ${qid}`,spec,{def:{...h.orig,exit:side},sec:h.sec,snap:st.snap},placed);}
    catch(e0){ALLOW_CONN=true;try{chain=buildChain(qrooms,`quest ${qid}`,spec,{def:{...h.orig,exit:side},sec:h.sec,snap:st.snap},placed);}
     catch(e1){
      // a later room of the errand is what will not fit: shift the whole errand with a short shaft at its door
      let made=null;
      for(const H of [4,6,8,10,12,16,20]){const cd=connector(side==='up'?'up':side==='down'?'down':side==='left'?'left':'right',H,qrooms[0].palette,qrooms[0].lock);if(!cd)continue;
       try{const m=buildChain([cd,...qrooms],`quest ${qid}`,spec,{def:{...h.orig,exit:side},sec:h.sec,snap:st.snap},placed);
        // and only where its way back can leave its far end
        const fi=m.rooms.findIndex(r=>!r.connector),occ2=[...placed,...m.rects].map(r=>({x:r.x,y:r.y,C:r.C,R:r.R,room:r.room}));
        const zi=m.rooms.length-1,back=passage(m.lastDef,m.lastSec,m.lastSnap,[{room:h.room,sec:h.sec},...(fi>=0?[{room:m.rooms[fi],sec:m.secs[fi]}]:[]),...(zi>fi?[{room:m.rooms[zi],sec:m.secs[zi],cost:20}]:[])],occ2,spec);
        if(!back){if(verbose)console.log('  shaft',H,'fits, but no way back from its far end');continue;}
        made=m;if(verbose)console.log(`  quest ${qid}: a ${H}-tile shaft at its door`);break;}catch(e2){if(verbose)console.log('  shaft',H,e2.message);}}
      if(!made)throw e1;chain=made;}
     finally{ALLOW_CONN=false;}}}
   catch(e){
    // Its side door has no room beyond it (the road is there): the quest opens from a ceiling instead.
    if(verbose)console.log(`  quest ${qid}: side door blocked (${e.message}); trying a ceiling`);
    const ceiling=spec.questCeilings?.[qid],hosts=ceiling?.hosts||[...spec.order.slice(spec.order.indexOf(q.from)),...spec.order.slice(0,spec.order.indexOf(q.from))];
    const elbow=ceiling?.entry&&connector('up-'+ceiling.entry,ceiling.height||32,qrooms[0].palette,qrooms[0].lock);
    if(ceiling?.entry&&!elbow)throw new Error(`quest ${qid}: cannot build its entrance elbow`);
    const f=ceilingDoor([{defs:elbow?[elbow,...qrooms]:qrooms,origin:qid}],hosts,spec,placed,hostOf,used);
    if(!f)throw new Error(`quest ${qid}: no way to hang it off the road`);
    chain=f.chain;qstart=f.start;qhost=f.h.room.id;addDoor(main,f.h,f.cols,qid,f.tape);used.add(f.h.room.id.replace(/^cl\d+-/,''));
    const k=main.rooms.findIndex(r=>r.id===`cl${spec.n}-${q.from}`);const {side:_s,sideQuest:_q,...rest}=main.rooms[k];main.rooms[k]=rest;
    lines.push(`  quest ${qid}: opens from a ceiling in ${f.h.orig.id}`);
   }
   placed.push(...chain.rects);
  }
  quests.push({id:q.id,title:q.title,giver:q.giver,from,back:q.back,keepsake:q.keepsake,needs:q.needs,bearings:q.bearings,sections:chain.secs,_rooms:chain.rooms,_report:chain.report,_chain:qrooms.length?chain:null,_start:qstart,_qrooms:qrooms,_host:qhost,
   short:qrooms.length<q.rooms.length});
 }
 // A secret: an opening in a ceiling corner of a road section, up into a harder room with a reward at its end.
 const secrets=[];
 if(spec.secret){
  const n=spec.order.length,mid=spec.secret.hosts||spec.order.slice(Math.floor(n*.3),Math.ceil(n*.8));   // (hosts: where to try first)
  const kit=spec._kit||['dash'],lock=['dash','strike','parry','portal'].filter(v=>!kit.includes(v));
  const choices=spec.secret.rooms.map(id=>{const d0=Rooms.all.find(r=>r.id===id);if(!d0||!tapeOf(id))return null;
   const def=A8({...d0,lock,palette:reg.palette});const r=runTape(def,tapeOf(id));if(!r.exit||r.exit.side||r.deaths)return null;return {defs:[def],origin:id,name:d0.name};}).filter(Boolean);
  // only where there is a way back from it (proved again below, once every branch is in)
  const wayBack=(chain,h,cols)=>!!passage(chain.lastDef,chain.lastSec,chain.lastSnap,[{room:{...h.room,doors:[...(h.room.doors||[]),{edge:'up',cols}]},sec:h.sec},...chain.rooms.map((r,j)=>({room:r,sec:chain.secs[j]})).filter(t=>!t.room.connector).slice(0,1)],[...placed,...chain.rects].map(r=>({x:r.x,y:r.y,C:r.C,R:r.R,room:r.room})),spec);
  // the middle of the world first; if its ceilings are taken (an errand hanging over them), anywhere along the road
  const f=ceilingDoor(choices,mid,spec,placed,hostOf,used,wayBack)||ceilingDoor(choices,spec.order.filter(id=>!mid.includes(id)),spec,placed,hostOf,used,wayBack);
  if(!f)throw new Error(`world ${spec.n}: no secret room fits`);
  const sid='secret-'+spec.n;
  const last=f.chain.rooms.length-1;f.chain.rooms[last]={...f.chain.rooms[last],id:`cl${spec.n}-secret-${f.choice.origin}`,secret:true,name:f.choice.name};f.chain.secs[last].room=f.chain.rooms[last].id;
  addDoor(main,f.h,f.cols,sid,f.tape);used.add(f.h.orig.id);placed.push(...f.chain.rects);
  secrets.push({_host:f.h.room.id,id:sid,host:f.h.room.id,name:f.choice.name,origin:f.choice.origin,sections:f.chain.secs,_rooms:f.chain.rooms,_chain:f.chain});
  lines.push(`  secret: ${f.choice.origin} (${f.choice.name}) above ${f.h.orig.id}${f.chain.rooms.length>1?' (with a shaft)':''}`);
 }
 // spec.sockets (7.276, Sunspire's entrances opposite the inner braid): a small gate room hung off a road section's
 // ceiling, like a secret, with a mouth in one wall for an atlas link (the page folds a corridor into it). Its way back
 // is the shaft it was climbed up (drop through the ledge). The corridor projected beyond its mouth must sit clear of
 // every room, so a gate is only hung where that ground is free.
 for(const s of spec.sockets||[]){
  // (s.lift: extra rock under its floor, so the shaft lifts the gate clear of a taller neighbour)
  const C=16,R=14+(s.lift||0),F=10,left=s.edge!=='right',g=Array.from({length:R},(_,r)=>Array(C).fill(r===0||r>=F?'#':'.'));
  for(let r=0;r<R;r++){g[r][0]='#';g[r][C-1]='#';}
  for(let r=F-5;r<F;r++)g[r][left?0:C-1]='.';
  g[F-1][left?9:6]='P';
  const id='socket-'+s.link,def={id,name:s.name,exit:left?'left':'right',palette:reg.palette,cols:C,rows:R,map:g.map(r=>r.join('')),hint:'',question:''};
  EXTRA_TAPES[id]=[[90,left?'l':'r']];Rooms.all.push(def);
  // and dropping home through its door lands on ground, not spikes or out of the room (the Sea Terrace's shore)
  // (simulated: the room as played with the door cut, dropped in at its ceiling, 3 s idle with no death; beams cross it)
  // (and at three moments of the room's own clock, so a moving deck under the door does not pass by luck)
  const lands=(h,cols)=>{const hg=gridOf(h.room);for(const c of cols)for(let r=0;r<hg.length&&ROCK.has(hg[r][c]);r++)hg[r][c]='.';
   return [0,140,280].every(t=>{const g=Core.createGame([{...h.orig,map:hg.map(r=>r.join('')),seam:h.room.seam}],{room:0});
    for(let i=0;i<t;i++){Core.step(g,keysToInput(''));g.events.length=0;}
    g.p.x=cols[0]*8+(16-g.p.w)/2;g.p.y=0;g.p.vx=0;g.p.vy=60;
    for(let i=0;i<180;i++){Core.step(g,keysToInput(''));for(const e of g.events)if(e.type==='death')return false;g.events.length=0;}return g.p.onGround&&g.p.y>8;});};
  const clear=(chain,h,cols)=>{if(!lands(h,cols))return false;const k=chain.rooms.length-1,sec=chain.secs[k],x=left?sec.x-46:sec.x+C;
   const rect={x,y:sec.y+F-7,C:46,R:10};if(rect.x<(s.minX??2))return false;   // (left of the first room is the arrival junction)
   chain._corridor=rect;return ![...placed,...chain.rects.slice(0,-1)].some(o=>overlaps(rect,o));};
  clear.pre=lands;   // (tried before the climb to the door is searched for)
  const f=ceilingDoor([{defs:[def],origin:id}],s.hosts,spec,placed,hostOf,used,clear);
  if(!f)throw new Error(`world ${spec.n}: no room for the ${s.link} gate`);
  const k=f.chain.rooms.length-1,mid=left?9:6;
  f.chain.rooms[k]={...f.chain.rooms[k],id:`cl${spec.n}-${id}`,exit:'none',connector:true,atlasJunction:true,atlasGate:true,atlasRegion:spec.n,
   atlasSockets:[{kind:'passage',edge:left?'left':'right',floor:F,link:s.link,to:`cl${spec.n}-passage-${s.link}`,world:spec.n}],
   atlasRoads:[{edge:left?'left':'right',floor:F,points:[{c:mid,r:F},{c:left?1:C-2,r:F}]}],atlasDecks:[],atlasFloor:Array(C).fill(F)};
  f.chain.secs[k].room=f.chain.rooms[k].id;
  addDoor(main,f.h,f.cols,id,f.tape);used.add(f.h.orig.id);placed.push(...f.chain.rects);
  if(f.chain._corridor)placed.push({...f.chain._corridor,room:`(${s.link} corridor)`});   // later branches keep off it too
  quests.push({id,socket:s.link,title:s.name,from:null,sections:f.chain.secs,_rooms:f.chain.rooms,_chain:null,_host:f.h.room.id});
  lines.push(`  gate ${s.link} (${s.name}) above ${f.h.orig.id}${f.chain.rooms.length>1?' (with a shaft)':''}`);
 }
 // Every branch ends in a passage back down to the road (no dead ends).
 const occ=()=>placed.map(r=>({x:r.x,y:r.y,C:r.C,R:r.R,room:r.room}));
 // (spec.secret.first, 7.278: the secret's way back is laid before the errands', where theirs would take its ground)
 for(const b of spec.secret?.first?[...secrets,...quests.filter(q=>q._chain)]:[...quests.filter(q=>q._chain),...secrets]){
  // back only to where it was entered: the room with its door, or its own earlier rooms
  const targetsFor=(rooms,secs)=>{const hk=main.rooms.findIndex(r=>r.id===b._host);
   const T=hk>=0?[{room:main.rooms[hk],sec:main.secs[hk],main:hk}]:[];
   const j=rooms.findIndex(r=>!r.connector);if(j>=0)T.push({room:rooms[j],sec:secs[j],own:j});
   // an errand's own last room, by its entrance (a loop over it), when nothing nearer the door is free
   // (spec.noLoop, 7.278: not for these branches, whose loop would only lead back into the room just left)
   const z=rooms.length-1;if(z>j&&!rooms[z].connector&&!(spec.noLoop||[]).includes(b.id))T.push({room:rooms[z],sec:secs[z],own:z,cost:20});
   // last resort: the road just behind the door room (behind you, never ahead)
   for(const back of [1,2])if(hk-back>=0)T.push({room:main.rooms[hk-back],sec:main.secs[hk-back],main:hk-back,cost:30*back});
   return T;};   // its door room, then its first room, by its entrance
  let ch=b._chain,ps=passage(ch.lastDef,ch.lastSec,ch.lastSnap,targetsFor(b._rooms,b.sections),occ(),spec);
  // A last room whose way out leads back into its own branch (a flue down the stairs it came up): lift it on a
  // short climbable shaft, so its way out opens into rock where a passage can start.
  if(!ps&&b._start&&b._qrooms.length>0){
   const mine=new Set(b.sections.map(s=>s.room)),others=placed.filter(r=>!mine.has(r.room));
   for(let H=12;H<=36&&!ps;H+=4){
    const qr=b._qrooms,last=qr[qr.length-1],cd=connector('up',H,last.palette,last.lock);if(!cd)continue;
    let c2;try{c2=buildChain([...qr.slice(0,-1),cd,last],`quest ${b.id}`,spec,b._start,others);}catch(e){if(verbose)console.log('  lift',H,e.message);continue;}
    const o2=[...others,...c2.rects].map(r=>({x:r.x,y:r.y,C:r.C,R:r.R,room:r.room}));
    ps=passage(c2.lastDef,c2.lastSec,c2.lastSnap,targetsFor(c2.rooms,c2.secs),o2,spec);
    if(ps){placed.splice(0,placed.length,...others,...c2.rects);b.sections=c2.secs;b._rooms=c2.rooms;b._chain=c2;ch=c2;lines.push(`  ${b.id}: its last room is lifted on a ${H}-tile shaft`);}
   }
  }
  if(!ps)throw new Error(`world ${spec.n}: no way back from ${b.id}`);
  const T=ps.target,ret={cols:ps.goal.cols,edge:ps.goal.edge||'up',from:b.id};let home;
  if(T.main!==undefined){const k=T.main;main.rooms[k]={...main.rooms[k],map:ps.hostMap,returns:[...(main.rooms[k].returns||[]),ret]};home=main.rooms[k];}
  else{const j=T.own;b._rooms[j]={...b._rooms[j],map:ps.hostMap,returns:[...(b._rooms[j].returns||[]),ret]};home=b._rooms[j];}
  b.sections=[...b.sections,...ps.secs.map(({C,R,...s})=>({...s,fire:null,passage:true}))];b.returnTo=home.id;
  b._rooms=[...b._rooms,...ps.defs.map(d=>({...d,id:`cl${spec.n}-${d.id}`,origin:d.id}))];
  ps.defs.forEach((d,i)=>{
   // At this upward-to-left corner the page hands over below the ledge. Climb the right wall before crossing;
   // the isolated proof can otherwise accept leftward input that falls back through the live entrance.
   const corner=d.entry==='down'&&d.exit==='left'&&JSON.stringify(d.map)===JSON.stringify(['#####','....#','P...#','##..#','##..#']);
   DOOR_TAPES[`cl${spec.n}-${d.id}#through`]=corner?[[60,'rgu'],[20,'lj'],[10,'l']]:ps.through[i];
  });
  b.sections=b.sections.map(s=>s.passage&&!s.room.startsWith('cl')?{...s,room:`cl${spec.n}-${s.room}`}:s);
  placed.push(...ps.secs);
  lines.push(`  ${b.id}: way back (${ps.defs.length} pieces, ${ps.defs.filter(d=>d.map.some(r=>r.includes('s'))).length} springs) into ${home.origin}${T.own!==undefined?' (its own first room)':home.id===b._host?' (its door room)':' (the road just behind its door)'}`);
 }
 const rooms=[...main.rooms,...quests.flatMap(q=>q._rooms),...secrets.flatMap(x=>x._rooms)];
 // Rooms whose own routes need the wall their seam opens close it while played (and reopen when you leave).
 for(const [i,r] of rooms.entries()){
  if(!r.seam||!r.seam.length||r.atlasGate)continue;   // (a gate's shaft is its way back down: it never closes)
  const fails=(def,t)=>{const x=runTape(def,t);return !x.exit||x.deaths;};
  // A carved entrance can share the exit wall: merely exiting is insufficient if the route leaves by
  // the entrance early. Compare its crossing with the same route after restoring the entrance rock.
  const mainTape=tapeOf(r.origin),closedGrid=gridOf(r);
  for(const [x,y,ch] of r.seam)closedGrid[y][x]=ch;
  const openMain=mainTape&&runTape(r,mainTape),closedMain=mainTape&&runTape({...r,map:closedGrid.map(row=>row.join(''))},mainTape);
  const crossingMoved=openMain?.snap&&closedMain?.snap&&Math.hypot(openMain.snap.x-closedMain.snap.x,openMain.snap.y-closedMain.snap.y)>8;
  const mainBad=!!mainTape&&(!openMain.exit||openMain.deaths||crossingMoved);
  let sideBad=!!tapeOf(r.origin+'#side')&&fails(r,SIDE_TAPES[r.id]||tapeOf(r.origin+'#side'));
  const dt=DOOR_TAPES[r.id+'#door'],door=(r.doors||[])[0];
  let doorBad=!!dt&&fails({...r,exit:'up',side:undefined},dt);
  // The door or side way was proved with the wall the seam opens: find a way to it with the seam left open.
  if(!mainBad&&sideBad){const t=reachTo({...r,exit:r.side,side:undefined},r.side,null);if(t){SIDE_TAPES[r.id]=t;sideBad=false;}}
  if(!mainBad&&doorBad&&door){const t=reachTo({...r,exit:'up',side:undefined},'up',door.cols);if(t){DOOR_TAPES[r.id+'#door']=t;doorBad=false;}}
  if(mainBad||sideBad||doorBad){rooms[i]={...r,closeWhilePlayed:true};if(verbose)lines.push(`  ${r.origin} closes while played (${[mainBad&&'its route',sideBad&&'its side way',doorBad&&'its door'].filter(Boolean).join(', ')} needs the wall)`);}
 }
 const tapes={};for(const k in DOOR_TAPES)if(k.startsWith(`cl${spec.n}-`))tapes[k]=DOOR_TAPES[k];for(const r of rooms){tapes[r.id]=tapeOf(r.origin)||(r.connector&&r.exit==='down'?dropTape(r):undefined);for(const k of ['side','bearing'])if(tapeOf(r.origin+'#'+k))tapes[r.id+'#'+k]=tapeOf(r.origin+'#'+k);if(SIDE_TAPES[r.id])tapes[r.id+'#side']=SIDE_TAPES[r.id];}
 const saved=[...reg.rooms,...reg.quests.flatMap(q=>q.rooms)].filter(r=>SAVED_FOR_LATER[r.id]).map(r=>({id:r.id,name:r.name,diff:RATE[r.id]?.diff??null,fun:RATE[r.id]?.fun??null,why:SAVED_FOR_LATER[r.id]}));
 const diffs=spec.order.map(id=>RATE[id]?.diff).filter(Boolean);
 worlds.push({n:spec.n,key:reg.key,name:reg.name,palette:reg.palette,kit:reg.kit,
  blurb:`${reg.name} as one continuous climb: ${spec.order.length} sections, a fire at the start of each.`,outro:reg.outro||'',
  sections:main.secs,quests:quests.map(({_rooms,_report,_chain,_start,_qrooms,_host,...q})=>q),secrets:secrets.map(({_rooms,_chain,_host,...x})=>x),rooms,tapes,folk:reg.folk||{},props:reg.props||{},palettes:reg.palettes||{},saved,
  difficulty:diffs.length?{min:Math.min(...diffs),max:Math.max(...diffs),mean:+(diffs.reduce((a,b)=>a+b,0)/diffs.length).toFixed(1)}:{min:null,max:null,mean:null}});   // unrated regions
 lines.push(`World ${spec.n} · ${reg.name}: ${spec.order.length} sections, `+(diffs.length?`difficulty ${Math.min(...diffs)}–${Math.max(...diffs)} (mean ${worlds.at(-1).difficulty.mean})`:'not yet rated')+(saved.length?`; saved for later: ${saved.map(s=>s.id).join(', ')}`:''));
 if(verbose){for(const l of main.report)lines.push('  '+l);for(const q of quests)for(const l of q._report||[])lines.push('  ['+q.id+'] '+l);}
 total++;ok++;
}

/* ---------------------------------------------------------------- write */
const out=resolve(root,'public/bladefall-climb-worlds.js');
const js=`/* The Climb (7.265): generated by scripts/climb/build-climbs.mjs from Room by Room's regions and Isaac's ratings
   (docs/playtest/room-reviews-2026-10-01.csv). Do not edit by hand: change scripts/climb/spec.mjs or the region
   sources, then rebuild. Every seam and every room's route was proved by simulation when this was written. */
(function(root){'use strict';const CL=root.BladefallClimb;if(!CL)return;
${worlds.map(w=>`CL.addWorld(${JSON.stringify(w)});`).join('\n')}
})(typeof window!=='undefined'?window:globalThis);
`;
const check=args.includes('--check');
// --emit DIR: also save each world built here as DIR/wN.json; --assemble DIR: write the page's file from those
// (worlds build independently, so they can be built in parallel and joined).
if(args.includes('--emit')){const dir=args[args.indexOf('--emit')+1];for(const w of worlds)writeFileSync(resolve(dir,`w${w.n}.json`),JSON.stringify(w));}
if(check&&!only){
 // npm run verify:climb — every seam and route re-proved above; the page's file must match what this builds.
 let cur='';try{cur=readFileSync(out,'utf8');}catch(e){}
 if(cur!==js){console.log(lines.join('\n'));console.log('STALE: public/bladefall-climb-worlds.js differs from a fresh build; run npm run build:climb');process.exit(1);}
}
if(!only&&!check)writeFileSync(out,js);
console.log(lines.join('\n'));
console.log(only?`(only world ${only}: not written)`:check?`all ${total} worlds: every seam and every room's route proved; the page's file is up to date`:`wrote ${out} (${(js.length/1024).toFixed(0)} KB, ${total} worlds)`);
