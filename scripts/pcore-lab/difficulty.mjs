// Room by Room difficulty measure (7.280), for the Fractured ramp (docs/plans/fractured-hard.md). For each room's
// road tape it reports what a player has to do, measured in the core, not guessed:
//   chain   the most presses (jump, dash, grab, a tear ride) between two safe stops. A safe stop is a frame on the
//           ground from which standing still for 60 frames does not die (a cracking fault, a shade, a deck or a
//           timed hazard is not a stop). This is "linked decisions".
//   stops   how many separate safe stops the route passes (fewer = fewer rests).
//   run     the longest stretch of the route, in frames, between two safe stops (how long you must keep going).
// (A per-press timing window measured on a fixed tape is not reported: the planner's tapes are tuned to the
// frame, so shifting one press misaligns every later one and every press reads as frame-tight. Judge timing
// windows by play and by the brief's rules instead.)
//   tech    momentum events on the route (super, hyper, ultra, wallbounce).
//   node scripts/pcore-lab/difficulty.mjs 21 22 ...        (regions; main rooms, road tapes)
//   node scripts/pcore-lab/difficulty.mjs fo21-ash ...     (rooms)
import {Core,Rooms,RBR,expand,keysToInput,snapshot,restore} from '../rbr-lib.mjs';
const M=['super','hyper','ultra','wallbounce'];
const idx=id=>Rooms.all.findIndex(d=>d.id===id);
function play(id,tape,{stops=false}={}){
 const g=Core.createGame(Rooms.all,{room:idx(id)});const frames=expand(tape);let deaths=0,exited=false;const ev=[];const safe=[];
 for(let i=0;i<frames.length+30&&!exited;i++){
  Core.step(g,keysToInput(frames[i]||''));
  for(const e of g.events){ev.push({...e,i});if(e.type==='death')deaths++;if(e.type==='exit')exited=true;}g.events.length=0;
  if(stops&&g.p.onGround&&g.p.state==='normal'&&i%2===0){const s=restore(snapshot(g));let dead=false;
   for(let k=0;k<60&&!dead;k++){Core.step(s,keysToInput(''));if(s.events.some(e=>e.type==='death'))dead=true;s.events.length=0;}safe.push([i,!dead]);}
 }
 return {deaths,exited,ev,safe};
}
const ok=(id,t)=>{const r=play(id,t);return r.exited&&r.deaths===0;};
function measure(id){
 const tape=Rooms.tapes[id];if(!tape)return null;
 const base=play(id,tape,{stops:true});if(!base.exited||base.deaths)return {id,broken:true};
 // presses: frame starts of j/x/g, plus tear rides
 const presses=[];let f=0,prev='';
 for(const [n,k] of tape){for(const c of 'jxg')if(k.includes(c)&&!prev.includes(c))presses.push(f);prev=k;f+=n;}
 for(const e of base.ev)if(e.type==='zip-in')presses.push(e.i);
 presses.sort((a,b)=>a-b);
 // chains between safe stops
 const stopAt=new Set(base.safe.filter(s=>s[1]).map(s=>s[0]));let chain=0,cur=0,stops=0,last=-9,run=0,from=0;const ps=new Set(presses);
 const end=Math.max(f,...presses)+1;
 for(let i=0;i<end;i++){if(stopAt.has(i)){if(i-last>2)stops++;run=Math.max(run,i-from);from=i;last=i;chain=Math.max(chain,cur);cur=0;}if(ps.has(i))cur++;}
 chain=Math.max(chain,cur);run=Math.max(run,end-from);
 const tech=[...new Set(base.ev.filter(e=>M.includes(e.type)).map(e=>e.type))];
 return {id,frames:f,presses:presses.length,chain,stops,run,tech:tech.join('+')||'-'};
}
const args=process.argv.slice(2);const ids=[];
for(const a of args){if(/^\d+$/.test(a)){const r=RBR.region(+a);if(r)ids.push(...r.rooms.map(x=>x.id));}else ids.push(a);}
const rows=ids.map(measure).filter(Boolean);
console.log('room'.padEnd(22),'frames presses chain stops   run tech');
for(const r of rows)console.log(r.broken?`${r.id.padEnd(22)} (tape does not finish)`:`${r.id.padEnd(22)} ${String(r.frames).padStart(6)} ${String(r.presses).padStart(7)} ${String(r.chain).padStart(5)} ${String(r.stops).padStart(5)} ${String(r.run).padStart(5)} ${r.tech}`);
const good=rows.filter(r=>!r.broken),avg=k=>(good.reduce((s,r)=>s+(+r[k]||0),0)/Math.max(1,good.length)).toFixed(1);
console.log(`mean: presses ${avg('presses')}, longest chain ${avg('chain')} (max ${Math.max(0,...good.map(r=>r.chain))}), stops ${avg('stops')}, longest run ${avg('run')} frames (max ${Math.max(0,...good.map(r=>r.run))}), rooms with momentum ${good.filter(r=>r.tech!=='-').length}/${good.length}`);
