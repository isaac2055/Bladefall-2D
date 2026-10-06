// Shared checks for the Precision Core part verifiers (7.254+). Each part script:
//   import {kit} from './pcore-verify-kit.mjs'; const K=kit('VII');
//   K.routes();                      // every room of the part replays its tape to the exit, no deaths, twice alike
//   K.never(label,id,tapes,pred);    // a family of tempting wrong tapes: none satisfies pred (default: exits)
//   K.hunt(label,id,{reject,...});   // adversarial beam search for a skip; passes when it finds none
//   K.done();
import {Core,Rooms,runRoom,expand,keysToInput} from './pcore-tape.mjs';
import {beam,ACT} from './pcore-search.mjs';
export const range=(a,b,s=1)=>{const o=[];for(let v=a;v<=b;v+=s)o.push(v);return o;};
/* Cartesian product of lists: X([1,2],['a','b']) → [[1,'a'],[1,'b'],[2,'a'],[2,'b']]. */
export const X=(...ls)=>ls.reduce((acc,l)=>acc.flatMap(a=>l.map(v=>[...a,v])),[[]]);
export function kit(part){
 let pass=0,fail=0;const say=(ok,msg)=>{ok?pass++:fail++;console.log((ok?'  ok   ':'  FAIL ')+msg);};
 const idx=id=>{const i=Rooms.all.findIndex(d=>d.id===id);if(i<0)throw new Error('no room '+id);return i;};
 const sim=(id,tape,extra=0)=>runRoom(Rooms.all,idx(id),tape,{maxExtra:extra});
 const rooms=()=>Rooms.chapters.filter(c=>c.part===part).flatMap(c=>c.rooms);
 return {
  say,sim,idx,rooms,
  routes(){
   console.log(`Part ${part}: intended routes`);
   for(const d of rooms()){
    const tape=Rooms.tapes[d.id];if(!tape){say(false,`${d.id} has no tape`);continue;}
    const i=idx(d.id),a=runRoom(Rooms.all,i,tape),b=runRoom(Rooms.all,i,tape);
    say(a.exited&&a.deaths===0,`${d.id} ${d.name}: exits at frame ${a.exitFrame}, no deaths`);
    if(Core.digest(a.g)!==Core.digest(b.g))say(false,`${d.id} replays identically`);
   }
  },
  // Default: no tape reaches the exit (even after a retry mid-tape). With a custom pred, only a run
  // with no deaths counts, so lighting a stone and then dying never passes for a solution.
  never(label,id,tapes,pred){let n=0;for(const t of tapes){const r=sim(id,t);if(pred?(r.deaths===0&&pred(r)):r.exited)n++;}say(n===0,`${id}: ${label} (${tapes.length} tried, ${n} succeed)`);return n;},
  /* The core rule for state-based wrong strategies: a pred that is met only after a death does not count. */
  hunt(label,id,{actions=ACT.basic,reject,goal=g=>g.exited,score,beam:B=1500,maxDepth=100,key,start=[]}={}){
   const r=beam(id,{actions,reject,goal,score:score||(g=>-g.p.x),beam:B,maxDepth,key,start});
   say(!r,`${id}: ${label} (adversarial beam search${r?' FOUND '+JSON.stringify(r.tape):' found none'})`);return r;
  },
  done(){console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0);},
 };
}
