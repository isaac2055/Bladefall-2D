// Native seam authoring primitives, shared with the continuous bank importer.
// These simulate the exact exit state; no checkpoint relocation is used.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {entranceDrop} from './bank-ceiling-entry.mjs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {Core,Rooms,expand,keysToInput,snapshot,restore,run,ACT} from '../rbr-lib.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),require=createRequire(import.meta.url);
globalThis.BLADEFALL_CLIMB=false;require(resolve(root,'public/bladefall-climb.js'));
const CL=globalThis.BladefallClimb;
// Match the actual Climb view's room flags, including imported puzzle exceptions.
function createSeamGame(defs,options){const g=Core.createGame(defs,options),d=g.room.def;g.dropThru=d.campaignImport?!!d.dropThru:true;g.springUp=!d.campaignImport;return g;}

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
 const g=createSeamGame([def],{room:0});let exit=null,deaths=0,snap=null;
 const f=frames(tape);
 for(let i=0;i<f.length+extra;i++){
  Core.step(g,keysToInput(f[i]||''));
  // (7.280) a knight leaving a flipped room crosses upright, as the page now hands him over
  for(const e of g.events){if(e.type==='death')deaths++;if(e.type==='exit'&&!exit){exit={side:!!e.side,i};if(g.flipped&&globalThis.BladefallPrecisionGravity)globalThis.BladefallPrecisionGravity.mirror(g);snap=CL.snap(g);}}
  g.events.length=0;if(exit)break;
 }
 return {exit,deaths,snap,g};
}
function idleSafe(def,n=150){const g=createSeamGame([def],{room:0});for(let i=0;i<n;i++){Core.step(g,keysToInput(''));for(const e of g.events)if(e.type==='death')return false;g.events.length=0;}return true;}

// Cache successful search tapes, never failures. Every hit is replayed against today's simulation before use.
// Files are independent so simultaneous world builds cannot overwrite one another's proofs.
const proofDir=resolve(root,'scripts/climb/.cache/seam-proofs');mkdirSync(proofDir,{recursive:true});
function proofFile(g,kind){const {defs,rooms,room,spikeSafe,...state}=g;
 return resolve(proofDir,createHash('sha1').update(JSON.stringify([kind,room.def,state])).digest('hex')+'.json');}
function readProof(file){try{return JSON.parse(readFileSync(file,'utf8'));}catch{return null;}}
function saveProof(file,tape){try{writeFileSync(file,JSON.stringify(tape));}catch{}}

/* From the knight's state just after a seam, can he reach the fire (stand at the spawn)? A short beam search. */
const MOVES=[...ACT.move,...ACT.jumps,...ACT.grabs,[[8,'r']],[[8,'l']],[[16,'u']],[[16,'gu']],[[16,'rgu']],[[16,'lgu']],[[1,'']],[[20,'']]];
function reachFire(g0,spawn,{beam=100,depth=24}={}){
 let remaining=1200;
 const key=g=>[g.p.x,g.p.y,Math.round(g.p.vx/20),Math.round(g.p.vy/20),g.p.state,g.p.onGround?1:0].join('|');
 // a fire set a little above its footing (the Bell Below's cart): standing where the knight settles from it counts
 let settled=spawn.y;try{const s0=createSeamGame([g0.room.def],{room:0});for(let i=0;i<30;i++){Core.step(s0,keysToInput(''));s0.events.length=0;}if(s0.p.onGround&&Math.abs(s0.p.x-spawn.x)<=10)settled=s0.p.y;}catch(e){}
 const ok=g=>g.p.onGround&&Math.abs(g.p.x-spawn.x)<=10&&(Math.abs(g.p.y-spawn.y)<=2||Math.abs(g.p.y-settled)<=2);
 if(ok(g0))return {tape:[]};
 const file=proofFile(g0,['fire',spawn,settled]),cached=readProof(file);
 if(cached){const g=restore(g0),r=run(g,cached);if(!r.dead&&!r.exited&&ok(g))return {tape:cached};}
 const found=tape=>{saveProof(file,tape);return {tape};};
 // Try ordinary movement before the beam search; each candidate is still simulated from the exact seam state.
 for(const t of [[[65,''],[32,'r'],[10,'']],[[90,'']],[[180,'']],[[80,'l']],[[80,'r']],[[70,'lgu'],[30,'r']],[[70,'rgu'],[30,'l']],[[20,'lj'],[50,'l']],[[20,'rj'],[50,'r']],[[12,'lx'],[30,'l']],[[12,'rx'],[30,'r']]]){
  const g=restore(g0),tape=[];
  for(const k of frames(t)){Core.step(g,keysToInput(k));const bad=g.events.some(e=>e.type==='death'||e.type==='exit');g.events.length=0;
   if(bad)break;if(tape.length&&tape.at(-1)[1]===k)tape.at(-1)[0]++;else tape.push([1,k]);if(ok(g))return found(tape);}
 }
 let front=[{s:snapshot(g0),tape:[]}],seen=new Set([key(g0)]);
 for(let d=0;d<depth&&front.length;d++){
  const next=[];
  for(const n of front)for(const a of MOVES){
   if(--remaining<0)return null;
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
  const allRows=opening(prev,dir),cross=Math.floor((exitSnap.y+5)/8),nearest=allRows.slice().sort((a,b)=>Math.abs(a-cross)-Math.abs(b-cross))[0];
  let lo=nearest,hi=nearest;while(allRows.includes(lo-1))lo--;while(allRows.includes(hi+1))hi++;
  const rows=allRows.filter(r=>r>=lo&&r<=hi),floor=Math.min(hi+1,Math.ceil((exitSnap.y+11)/8));
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
   const {def,n}=carve(next,cells);if(ROCK.has(g[sp.r+1]?.[sp.c])&&def.map[sp.r+1]?.[sp.c]!==g[sp.r+1][sp.c])return {skip:true};return {x,y,def,how:`${dir} tunnel at row ${tr} (${n} rock)`};
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
 // These fires are inside a phase roof and live beam. A ceiling approach
 // to their west leaves the opening tally and phase switch untouched.
 if(['bank-f31','bank-f32'].includes(next.bankOrigin)){
  if(opt>0)return null;const def=entranceDrop(next,28);if(!def)return null;
  return {x:prevSec.x+ex-28,y:prevSec.y+pd.R,def,how:'down beside the phase roof, onto a retracting approach ledge'};
 }
 const g=gridOf(next),shifts=[0,1,-1,2,-2,4,-4,8,-8,14,-14,20,-20,26,-26],shift=shifts[opt];if(shift===undefined)return null;
 const dc=sp.c-shift;if(dc<1||dc+1>nd.C-2)return {skip:true};
 const cells=[];
 // Reach the actual starting alcove even when another empty chamber lies
 // above its ceiling. Every cut is restored at the checkpoint.
 for(const c of [dc,dc+1])for(let r=0;r<sp.r;r++)if(ROCK.has(g[r][c]))cells.push([c,r]);
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
  const g0=createSeamGame([def],{room:0});
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
  const g0=createSeamGame([def],{room:0}),r=reachEdge(g0,{beam:600,depth:100,score:q=>q.p.y+Math.abs(q.p.x-(left?0:W*8))*.2});if(!r)return null;
  EXTRA_TAPES[id]=r.tape;Rooms.all.push(def);return def;
 }
 if(from==='down'){
  // a drop: a four-wide shaft fallen straight through, entered at its top, left by its bottom (7.274, for a branch
  // whose door is in a floor and whose rooms would otherwise sit on the road below)
  const W=6,g=[];for(let r=0;r<H;r++){const row=Array(W).fill('#');for(let c=1;c<=4;c++)row[c]='.';g.push(row);}g[0][2]='P';
  const id='conn-'+(++connN),def={id,name:'',exit:'down',palette,lock,connector:true,cols:W,rows:H,map:g.map(r=>r.join('')),hint:'',question:''};
  const g0=createSeamGame([def],{room:0});const r=reachEdge(g0,{beam:200,depth:40,score:q=>-q.p.y});if(!r)return null;
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
  const g0=createSeamGame([def],{room:0});const r=reachEdge(g0,{beam:200,depth:40,score:q=>-q.p.y+Math.abs(q.p.x-(sh+2)*8)});if(!r)return null;
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
 const g0=createSeamGame([def],{room:0});g0.secretX=(sh0+1)*8;
 const r=reachEdge(g0,{beam:600,depth:80});if(!r)return null;
 EXTRA_TAPES[id]=r.tape;Rooms.all.push(def);return def;
}
/* A drop connector's route, found again when the road comes from the cache (its tape lived only in the run that laid it). */
function dropTape(def){const g0=createSeamGame([def],{room:0});const W=dims(def).C,r=reachEdge(g0,{beam:200,depth:40,score:q=>-q.p.y+Math.abs(q.p.x-W*4)});return r?r.tape:undefined;}

const MOVES_OUT=[...MOVES,...ACT.dashes];
function reachEdge(g0,{beam=900,depth=60,score=null}={}){
 let remaining=1200;
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
   if(--remaining<0)return null;
   const g=restore(n.s);const r=run(g,a);if(r.dead)continue;const tape=[...n.tape,...a];
   if(r.exited)return found(tape,g);
   const k=key(g);if(seen.has(k))continue;seen.add(k);next.push({s:snapshot(g),tape,sc:score?score(g):g.p.y+Math.abs(g.p.x-g.secretX)*.5});
  }
  next.sort((a,b)=>a.sc-b.sc);front=next.slice(0,beam);
 }
 return null;
}

export {Core,CL,createSeamGame,Rooms,EXTRA_TAPES,ROOM_DEFS,ROCK,dims,gridOf,spawnOf,opening,runTape,idleSafe,reachFire,carve,placeNext,overlaps,sharedWall,fireFor,connector,reachEdge};
