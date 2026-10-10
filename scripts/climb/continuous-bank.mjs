// Preserve authored branch clusters, splice bank challenges into their roads, and
// prove each new entrance using the native physics. Each challenge retains its fire.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {connectorVertical,connectorOffsetDrop,connectorDropShaft} from './bank-connectors.mjs';
import {boundaryReservations} from './boundary-reservations.mjs';
import {Core,CL,createSeamGame,EXTRA_TAPES,ROOM_DEFS,dims,gridOf,spawnOf,runTape,reachFire,placeNext,overlaps,sharedWall,fireFor,connector,reachEdge} from './seam-tools.mjs';
const trace=(...x)=>{if(process.env.SEAM_TRACE)console.log(...x);};
const copy=x=>JSON.parse(JSON.stringify(x));
const quiet=JSON.parse(readFileSync(new URL('./retired-passages-7.306.json',import.meta.url),'utf8'));
const cache=new URL('./.cache/continuous-bank/',import.meta.url);mkdirSync(cache,{recursive:true});
const version=readFileSync(new URL(import.meta.url),'utf8')+readFileSync(new URL('./seam-tools.mjs',import.meta.url),'utf8')+readFileSync(new URL('../../public/bladefall-pcore.js',import.meta.url),'utf8')+readFileSync(new URL('./bank-connectors.mjs',import.meta.url),'utf8')+['bank-ceiling-entry.mjs','boundary-reservations.mjs','../../public/bladefall-climb-atlas.js','../../public/bladefall-climb-passages.js','../../public/bladefall-climb-geography-build.js'].map(f=>readFileSync(new URL(f,import.meta.url),'utf8')).join('');
export const FINALES={1:'bank-b62',2:'bank-b67',3:'bank-b68',4:'bank-b63',5:'bank-b69',6:'bank-b64',7:'bank-b70',8:'bank-b53',9:'bank-b71',11:'bank-b65',12:'bank-b49',15:'bank-b48',18:'bank-b44',19:'bank-b45',20:'bank-b66',21:'bank-f63',22:'bank-f68',23:'bank-f69',24:'bank-f50',25:'bank-f64',26:'bank-b52',27:'bank-f70',28:'bank-f71',29:'bank-f65',30:'bank-f72',32:'bank-f49',35:'bank-f45',37:'bank-f66',38:'bank-f46',40:'bank-f67'};
export const REPLACE_BOSS={3:'cl3-c3-counterweight',5:'cl5-m5-perch',7:'cl7-g7-sentence',9:'cl9-s9-ward',11:'cl11-f11-pour',20:'cl20-s20-noon',21:'cl21-fo21-last',22:'cl22-fw22-oath3',23:'cl23-fc23-middle',25:'cl25-fm25-perch',27:'cl27-fg27-sentence',29:'cl29-fs29-ward',40:'cl40-fs40-noon'};
function branchRefs(w,b){const ids=w.sections.map(s=>s.room);return [...new Set([b.from,b.host,b.returnTo,...w.rooms.filter(d=>d.doors?.some(x=>x.to===b.id)||d.returns?.some(x=>x.from===b.id)).map(d=>d.id)].filter(id=>ids.includes(id)))];}
function restoreEntrance(d){if(!d.seam?.length)return d;const g=gridOf(d);for(const [c,r,ch]of d.seam)g[r][c]=ch;return {...d,map:g.map(r=>r.join('')),seam:[]};}
function passageOf(d){
 // A retired challenge's old footprint remains only where an attached branch
 // needs its geography. Remove its fight and make it a quiet accessible hall.
 const map=d.map.map(row=>row.replace(/[\^v<>!~]/g,'.').replace(/[D]/g,'.'));
 return {id:d.id,name:'The Quiet Passage',origin:d.origin,exit:d.exit||'right',cols:d.cols||40,rows:d.rows||23,map,palette:d.palette,connector:true,retiredChallenge:true,seam:d.seam,doors:d.doors,returns:d.returns,people:d.people,closeWhilePlayed:d.closeWhilePlayed};
}
function entryBridge(def,dir){
 if(!['left','right'].includes(dir))return def;
 const sp=spawnOf(def),g=gridOf(def),seam=[...(def.seam||[])],row=sp.r+1;
 if(!g[row])return def;
 const lo=dir==='right'?0:sp.c+2,hi=dir==='right'?sp.c-2:(def.cols||40)-1;
 for(let c=lo;c<=hi;c++)if(g[row][c]==='.'){seam.push([c,row,'.']);g[row][c]='=';}
 return {...def,map:g.map(r=>r.join('')),seam,entryBridge:true};
}
function edgeDrop(H,palette){
 const cols=8,rows=H,g=Array.from({length:rows},()=>Array(cols).fill('#'));
 for(let r=0;r<rows-1;r++)for(let c=2;c<=5;c++)g[r][c]='.';
 for(let r=rows-4;r<rows-1;r++)for(let c=2;c<cols;c++)g[r][c]='.';
 g[2][3]='P';g[3][2]='=';g[3][3]='=';
 const d={id:'bank-elbow',name:'',connector:true,cols,rows,map:g.map(r=>r.join('')),exit:'right',palette,dropThru:true};
 const tape=[[12,'r'],[H*5,''],[80,'r']],direct=runTape(d,tape);if(direct.exit&&!direct.deaths){EXTRA_TAPES[d.id]=tape;return d;}
 const result=reachEdge(createSeamGame([d],{room:0}),{beam:80,depth:32,score:g=>-g.p.x-g.p.y});if(result)EXTRA_TAPES[d.id]=result.tape;return result?d:null;
}
function bend(from,to,H,palette,down=false){
 const C=8,R=H,g=Array.from({length:R},()=>Array(C).fill('#'));
 for(let r=1;r<R-1;r++)for(let c=2;c<=5;c++)g[r][c]='.';
 for(let r=down?1:R-4;r<(down?4:R-1);r++)for(let c=from==='right'?0:2;c<(from==='right'?6:C);c++)g[r][c]='.';
 for(let r=down?R-4:1;r<=(down?R-2:3);r++)for(let c=to==='left'?0:2;c<(to==='left'?6:C);c++)g[r][c]='.';
 if(!down){for(let r=R-4;r>=4;r-=3)for(let c=2;c<=5;c++)g[r][c]='=';for(let c=2;c<=5;c++)g[4][c]='=';}
 g[down?3:R-2][from==='right'?1:6]='P';
 const d={id:'bank-bend',connector:true,cols:C,rows:R,map:g.map(r=>r.join('')),exit:to,exitSpan:down?[R-4,R-1]:[1,4],palette};
 // Deliberate alternating wall jumps let the connecting stair climb without
 // requiring stamina tech, dash or a new ability from the region.
 const tape=[[12,from==='right'?'r':'l'],...(down?[[H*5,'']]:Array.from({length:Math.ceil(H/3)+2},()=>[[20,'j'],[18,'']]).flat()),[100,to==='right'?'r':'l']];
 const direct=runTape(d,tape);if(direct.exit&&!direct.deaths){EXTRA_TAPES[d.id]=tape;return d;}
 const r=reachEdge(createSeamGame([d],{room:0}),{beam:20,depth:24,score:q=>(down?-q.p.y:q.p.y)+Math.abs(q.p.x-(to==='right'?C*8:0))*.15});
 if(r)EXTRA_TAPES[d.id]=r.tape;return r?d:null;
}
export function continuousBank(source,w,{ordinary,superroom,cuts}){
 const hash=createHash('sha256').update(version+JSON.stringify([source,w,ordinary,superroom,cuts,quiet])).digest('hex');
 const file=new URL(`w${w.n}-${hash}.json`,cache);try{return JSON.parse(readFileSync(file,'utf8'));}catch{}
 let layoutAttempts=0;
 const original=source.sections.map(s=>s.room),sourceDefs=new Map(source.rooms.map(d=>[d.id,d])),defs=new Map(w.rooms.map(d=>[d.id,d]));
 const branches=[...w.quests,...w.secrets],spans=branches.map(b=>({b,refs:branchRefs(source,b)}));
 const blocked=new Set();for(const {refs}of spans){const ix=refs.map(id=>original.indexOf(id));if(ix.length)for(let i=Math.min(...ix);i<Math.max(...ix);i++)blocked.add(i);}
 // An exceptional cut inside a branch's loop keeps only a quiet physical passage.
 for(const id of cuts){const k=original.indexOf(id);if(blocked.has(k-1)&&blocked.has(k)){const saved=quiet.rooms.find(r=>r.id===id),d=saved?copy(saved.def):passageOf(sourceDefs.get(id));defs.set(id,d);w.rooms.push(d);if(saved)w.tapes[id]=copy(saved.tape);}}
 const replacement=REPLACE_BOSS[w.n];
 if(superroom&&replacement){
  const old=defs.get(replacement);if(old){
   const attached=spans.some(s=>s.refs.includes(replacement));
   if(attached){const saved=quiet.rooms.find(r=>r.id===replacement),d=saved?copy(saved.def):passageOf(old);if(saved)w.tapes[replacement]=copy(saved.tape);defs.set(replacement,d);w.rooms[w.rooms.findIndex(x=>x.id===replacement)]=d;}
   else{defs.delete(replacement);w.rooms=w.rooms.filter(d=>d.id!==replacement);}
   if(old.people?.length&&!attached){const receiver=defs.get(superroom),sp=spawnOf(receiver);receiver.people=[...(receiver.people||[]),...old.people.map((p,i)=>({...p,c:sp.c+3+i*2,r:sp.r}))];}
   w.retiredRooms[replacement]=superroom;w.retiredRoomDetails.push({id:replacement,name:old.name,to:superroom,reason:'Replaced by its native boss superroom'});
  }
 }
 const imports=new Set([...ordinary,...(superroom?[superroom]:[])]),native=source.sections.filter(s=>defs.has(s.room)).map(copy);
 const insert=new Map(),put=(at,id)=>{const a=insert.get(at)||[];a.push(id);insert.set(at,a);};
 const eligible=native.map((s,i)=>i).filter(i=>{if(i<=0||blocked.has(original.indexOf(native[i-1].room))||replacement&&original.indexOf(native[i].room)>=original.indexOf(replacement))return false;const a=defs.get(native[i-1].room),b=defs.get(native[i].room),dir=a.exit||'right',sp=spawnOf(b);return dir==='right'&&sp.c<8||dir==='left'&&sp.c>(b.cols||40)-9;});
 const cutSites=cuts.map(id=>original.indexOf(id)).map(k=>native.findIndex(s=>original.indexOf(s.room)>k)).filter(i=>eligible.includes(i));
 const preferred={'cl7-bank-b20':'cl7-g7-door','cl7-bank-f47':'cl7-g7-door','cl23-bank-b46':'cl23-fc23-counterpoise','cl23-bank-f23':'cl23-fc23-counterpoise','cl15-bank-f44':'cl15-d15-speed','cl26-bank-f34':'cl26-fk26-cells','cl29-bank-f14':'cl29-fs29-stair','cl32-bank-f12':'cl32-fi32-divide','cl32-bank-f52':'cl32-fi32-divide'};
 const used=new Set();for(const [i,id]of ordinary.entries()){
  const chosen=preferred[id]&&native.findIndex(s=>s.room===preferred[id]);
  const target=chosen>=0?chosen:cutSites.find(x=>!used.has(x))??eligible.filter(x=>!used.has(x)).sort((a,b)=>Math.abs(a-native.length*(i+1)/(ordinary.length+1))-Math.abs(b-native.length*(i+1)/(ordinary.length+1)))[0]??native.length;
  used.add(target);put(target,id);
 }
 if(superroom){let at=replacement?native.findIndex(s=>original.indexOf(s.room)>=original.indexOf(replacement)):native.length;if(at<0)at=native.length;while(at>0&&blocked.has(original.indexOf(native[at-1].room)))at--;put(at,superroom);}
 const ordered=[];for(let i=0;i<=native.length;i++){for(const id of insert.get(i)||[])ordered.push({room:id,x:0,y:0,fire:spawnOf(defs.get(id))});if(i<native.length)ordered.push(native[i]);}
 // Preserve contiguous native clusters, including every optional branch and its return.
 const chunks=[];for(const sec of ordered){const last=chunks.at(-1),prev=last?.main.at(-1),a=prev&&original.indexOf(prev.room),b=original.indexOf(sec.room);if(last&&a>=0&&b===a+1&&!imports.has(sec.room))last.main.push(sec);else chunks.push({main:[sec],branches:[]});}
 for(const {b,refs}of spans){let chunk=chunks.find(c=>refs.some(id=>c.main.some(s=>s.room===id)));if(!chunk){if(b.sections.length)throw Error(`Unplaced branch ${w.n} ${b.id}`);continue;}if(refs.some(id=>!chunk.main.some(s=>s.room===id)))throw Error(`Split branch ${w.n} ${b.id}`);chunk.branches.push(b);}
 const arrivalReservation=boundaryReservations(w,ordered[0],ordered.at(-1)).arrival;
 const placed=arrivalReservation?[arrivalReservation]:[],output=[],proofs=[],exitCache=new WeakMap();let previous=null,serial=0;
 function exitOf(d){if(exitCache.has(d))return exitCache.get(d);const {exit,deaths,snap}=runTape(d.closeWhilePlayed?restoreEntrance(d):d,w.tapes[d.id]);const result={exit,deaths,snap};exitCache.set(d,result);return result;}
 const rectsOf=(chunk,dx=0,dy=0)=>[...chunk.main,...chunk.branches.flatMap(b=>b.sections)].map(s=>({room:s.room,x:s.x+dx,y:s.y+dy,...dims(defs.get(s.room))}));
 const hit=(rects,first)=>rects.some(r=>placed.some(p=>overlaps(r,p)&&!sharedWall(r,r.room===first.id?first:defs.get(r.room),p)));
 function tryPlace(chunk,prev,kind='direct'){
  if(++layoutAttempts>260)throw Error(`W${w.n}: layout budget reached at ${prev.sec.room} → ${chunk.main[0].room}`);
  const firstSec=chunk.main[0],first=restoreEntrance(defs.get(firstSec.room)),last=defs.get(prev.sec.room),snap=prev.snap;
  const dir=last.exit||'right';if(first.campaignEntry&&dir!==first.campaignEntry)return null;const sp=spawnOf(first),want=sp.c<(first.cols||40)/2?'right':'left';if(!first.connector&&['left','right'].includes(dir)&&dir!==want)return null;
  if(['bank-f31','bank-f32'].includes(first.bankOrigin)&&dir!=='down')return null;
  for(let opt=0;opt<=27;opt++){
   const c=placeNext(last,prev.sec,first,snap,opt);if(!c)break;if(c.skip)continue;
   const dx=c.x-firstSec.x,dy=c.y-firstSec.y,rects=rectsOf(chunk,dx,dy);
   const endSec=chunk.main.at(-1),end=defs.get(endSec.room),endRun=exitOf(end);
   if(endRun.snap){const ex=end.exit||'right',x=endSec.x+dx,y=endSec.y+dy,rr=endRun.snap.y/8,cc=endRun.snap.x/8;
    const lip=ex==='right'?{x:x+(end.cols||40),y:y+rr-2,C:12,R:6}:ex==='left'?{x:x-12,y:y+rr-2,C:12,R:6}:ex==='up'?{x:x+cc-1,y:y-6,C:4,R:6}:{x:x+cc-1,y:y+(end.rows||23),C:4,R:6};
    if(placed.some(p=>overlaps(lip,p))){trace(last.id,first.id,opt,'blocked onward exit');continue;}
   }
   if(endSec.room===ordered.at(-1).room){
    const departure=boundaryReservations(w,ordered[0],{...endSec,x:endSec.x+dx,y:endSec.y+dy}).departure;
    if(departure&&[...placed,...rects.filter(r=>r.room!==endSec.room)].some(p=>overlaps(departure,p))){trace(last.id,first.id,opt,'blocked atlas departure');continue;}
   }
   if(hit(rects,c.def)){trace(last.id,first.id,opt,'overlap',rects.filter(r=>placed.some(p=>overlaps(r,p))).map(r=>[r.room,r.x,r.y,placed.filter(p=>overlaps(r,p)).map(p=>p.room)]));continue;}
   let arrival=c.def;const g=createSeamGame([arrival],{room:0}),from={x:prev.sec.x*8,y:prev.sec.y*8},to={x:c.x*8,y:c.y*8};CL.carry(Core,g,snap,from,to);
   const delta=Math.hypot(g.p.x+to.x-snap.x-from.x,g.p.y+to.y-snap.y-from.y);if(delta>12){trace(last.id,first.id,opt,'delta',delta);continue;}
   let reach=reachFire(g,g.room.spawn,{beam:80,depth:24});
   if(!reach&&!first.connector&&['left','right'].includes(dir)){arrival=entryBridge(c.def,dir);const bridged=createSeamGame([arrival],{room:0});CL.carry(Core,bridged,snap,from,to);reach=reachFire(bridged,bridged.room.spawn,{beam:80,depth:24});}
   if(!reach){trace(last.id,first.id,opt,'unreachable fire',g.p.x,g.p.y);continue;}
   const own=runTape(first,w.tapes[first.id]);if(!own.exit||own.deaths)throw Error('Route fails before splice '+first.id);
   return {dx,dy,def:{...arrival,closeWhilePlayed:!!arrival.seam?.length},proof:{from:last.id,to:first.id,how:c.how+(arrival.entryBridge?' with a retracting entry ledge':''),kind,entryDelta:delta,toFire:reach.tape}};
  }
  return null;
 }
 function commit(chunk,pl){
  if(pl){defs.set(pl.def.id,pl.def);w.rooms[w.rooms.findIndex(d=>d.id===pl.def.id)]=pl.def;proofs.push(pl.proof);for(const s of [...chunk.main,...chunk.branches.flatMap(b=>b.sections)]){s.x+=pl.dx;s.y+=pl.dy;}}
  for(const r of rectsOf(chunk)){ROOM_DEFS.set(r.room,defs.get(r.room));placed.push(r);}
  trace('placed',rectsOf(chunk));output.push(...chunk.main);const sec=chunk.main.at(-1),d=defs.get(sec.room),r=exitOf(d);
  if(!r.exit||r.deaths)throw Error(`Exit route fails W${w.n} ${d.id}`);previous={sec,snap:r.snap};
 }
 for(const [index,chunk]of chunks.entries()){
  if(!index){commit(chunk,null);continue;}
  console.log(`W${w.n}: joining ${previous.sec.room} → ${chunk.main[0].room}`);
  let pl=tryPlace(chunk,previous);if(pl){commit(chunk,pl);continue;}
  const last=defs.get(previous.sec.room),dir=last.exit||'right';let found=null;
  const nextDef=defs.get(chunk.main[0].room),want=spawnOf(nextDef).c<(nextDef.cols||40)/2?'right':'left';
  const kinds=nextDef.campaignEntry==='down'&&['left','right'].includes(dir)?['fall-down']:dir==='up'?[`up-${want}`]:dir==='down'?['drop-right']:[`fall-${want}`,`bend-${want}`,'rise-up','fall-down',`raise-${dir}`,`bridge-${dir}`];
  for(const H of [8,16,28,44,68,100,144,208,300]){for(const kind of kinds){
   const cd=kind==='rise-up'||kind==='fall-down'?connectorVertical(dir,H,w.palette,kind==='fall-down'):kind.startsWith('fall-')?bend(dir,want,H,w.palette,true):kind.startsWith('bend-')?bend(dir,want,H,w.palette):kind==='drop-right'?edgeDrop(H,w.palette):kind.startsWith('up-')?bend('up',want,H,w.palette):connector(kind==='rise-up'?dir:kind,H,w.palette,last.lock);if(!cd)continue;
   const id=`cl${w.n}-walk-${index}-${++serial}`,tape=EXTRA_TAPES[cd.id],d={...cd,id,origin:id,name:'The Connecting Road',campaignWalk:true,entry:dir==='right'?'left':dir==='left'?'right':dir==='up'?'down':'up'};
   defs.set(id,d);w.rooms.push(d);w.tapes[id]=tape;const bridge={main:[{room:id,x:0,y:0,fire:null}],branches:[]};
   const p1=tryPlace(bridge,previous,'walk');if(p1){const sec={...bridge.main[0],x:p1.dx,y:p1.dy},rr=runTape(d,tape),temp={...p1.def};ROOM_DEFS.set(id,temp);placed.push({room:id,x:sec.x,y:sec.y,...dims(d)});const old=defs.get(id);defs.set(id,temp);const p2=tryPlace(chunk,{sec,snap:rr.snap},'walk');placed.pop();defs.set(id,old);if(p2){found={bridge,p1,p2};break;}}
   defs.delete(id);w.rooms.pop();delete w.tapes[id];
  }if(found)break;}
  // A short level road before a vertical turn clears branches that overhang
  // the old exit. Keep both passages physical and prove all three seams.
  if(!found)for(const width of (dir==='up'&&chunk.main.at(-1).room===ordered.at(-1).room?[64,128,24]:[24,64,128])){
   const lead=dir==='up'?bend('up','right',width,w.palette):dir==='down'?edgeDrop(width,w.palette):connector('bridge-'+dir,width,w.palette,last.lock);
   if(!lead)continue;
   const id=`cl${w.n}-walk-${index}-${++serial}`,d={...lead,id,origin:id,name:'The Connecting Road',campaignWalk:true},tape=EXTRA_TAPES[lead.id],a={main:[{room:id,x:0,y:0,fire:null}],branches:[]};
   defs.set(id,d);w.rooms.push(d);w.tapes[id]=tape;
   const p1=tryPlace(a,previous,'walk');let retained=false;
   if(p1){const sec={...a.main[0],x:p1.dx,y:p1.dy},snap=runTape(d,tape).snap;defs.set(id,p1.def);ROOM_DEFS.set(id,p1.def);placed.push({room:id,x:sec.x,y:sec.y,...dims(d)});
    for(const H of [28,68,144,300]){for(const down of [false,true]){
     const tail=down?connectorOffsetDrop(d.exit,H,w.palette,chunk.main.at(-1).room===ordered.at(-1).room?80:24):connectorVertical(d.exit,H,w.palette,false);if(!tail)continue;
     const mid=`cl${w.n}-walk-${index}-${++serial}`,md={...tail,id:mid,origin:mid,name:'The Connecting Road',campaignWalk:true},mt=EXTRA_TAPES[tail.id],b={main:[{room:mid,x:0,y:0,fire:null}],branches:[]};
     defs.set(mid,md);w.rooms.push(md);w.tapes[mid]=mt;const p2=tryPlace(b,{sec,snap},'walk');
     if(p2){const ms={...b.main[0],x:p2.dx,y:p2.dy},msnap=runTape(md,mt).snap;defs.set(mid,p2.def);ROOM_DEFS.set(mid,p2.def);placed.push({room:mid,x:ms.x,y:ms.y,...dims(md)});
      const p3=tryPlace(chunk,{sec:ms,snap:msnap},'walk');
      if(p3)found={lead:a,leadPlace:p1,bridge:b,p1:p2,p2:p3};
      // A leftward finale's atlas hall can rise above its entrance. Separate
      // the wide upper bend from that hall with a narrow, visible drop shaft.
      if(!found&&down&&chunk.main.at(-1).room===ordered.at(-1).room)for(const height of [16,28,44,68]){
       const neck=connectorDropShaft(height,w.palette);if(!neck)continue;
       const nid=`cl${w.n}-walk-${index}-${++serial}`,nd={...neck,id:nid,origin:nid,name:'The Connecting Road',campaignWalk:true},nt=EXTRA_TAPES[neck.id],nc={main:[{room:nid,x:0,y:0,fire:null}],branches:[]};
       defs.set(nid,nd);w.rooms.push(nd);w.tapes[nid]=nt;const np=tryPlace(nc,{sec:ms,snap:msnap},'walk');
       if(np){const ns={...nc.main[0],x:np.dx,y:np.dy};defs.set(nid,np.def);ROOM_DEFS.set(nid,np.def);placed.push({room:nid,x:ns.x,y:ns.y,...dims(nd)});const end=tryPlace(chunk,{sec:ns,snap:runTape(nd,nt).snap},'walk');placed.pop();defs.set(nid,nd);
        if(end){found={lead:a,leadPlace:p1,bridge:b,p1:p2,neck:nc,neckPlace:np,p2:end};break;}}
       defs.delete(nid);w.rooms.pop();delete w.tapes[nid];
      }
      placed.pop();defs.set(mid,md);
      if(found){retained=true;break;}}
     defs.delete(mid);w.rooms.pop();delete w.tapes[mid];
    }if(found)break;}
    placed.pop();defs.set(id,d);
   }
   if(!retained){defs.delete(id);w.rooms.pop();delete w.tapes[id];}if(found)break;
  }
  if(!found)throw Error(`W${w.n}: cannot join ${previous.sec.room} to ${chunk.main[0].room}`);
  if(found.lead)commit(found.lead,found.leadPlace);commit(found.bridge,found.p1);if(found.neck)commit(found.neck,found.neckPlace);commit(chunk,found.p2);
 }
 for(const id of Object.keys(w.retiredRooms)){const seen=new Set([id]);while(w.retiredRooms[w.retiredRooms[id]]&&!seen.has(w.retiredRooms[id])){seen.add(w.retiredRooms[id]);w.retiredRooms[id]=w.retiredRooms[w.retiredRooms[id]];}}for(const detail of w.retiredRoomDetails)detail.to=w.retiredRooms[detail.id];
 w.sections=output;const usedIds=new Set([...output,...branches.flatMap(b=>b.sections)].map(s=>s.room));w.rooms=w.rooms.filter(d=>usedIds.has(d.id));w.checkpointLinks=[];w.continuousSeams=proofs;w.bankIntegration.version='7.306.0';w.bankIntegration.geography='continuous';
 w.requiredMainRooms=w.sections.filter(s=>{const d=defs.get(s.room);return !d.connector&&!d.passage&&!d.atlasJunction&&!d.atlasGate&&!d.atlasTransit;}).map(s=>s.room);
 w.blurb=`${w.name}: one continuous road with ${w.requiredMainRooms.length} checkpointed challenges${superroom?', ending in a superroom':''}.`;
 writeFileSync(file,JSON.stringify(w));console.log(`W${w.n}: ${proofs.length} physical seams, ${output.filter(s=>defs.get(s.room).campaignWalk).length} connecting roads`);return w;
}
