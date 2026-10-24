import {open} from './harness.mjs';import fs from 'node:fs';
const {page,errors,close}=await open('precision.html?pitch=climb&world=1&nosw=1',()=>!!window.BladefallPitchView?.climb?.startWorld);
let fails=0;const check=(n,ok)=>{console.log((ok?'ok  ':'FAIL')+' '+n);if(!ok)fails++;};
try{
const result=await page.evaluate(()=>{
 const PV=BladefallPitchView,V=BladefallPrecisionView,E=BladefallClimbRound2,C=BladefallPrecisionCore,R=BladefallPrecisionRooms,CL=BladefallClimb;let id,world,met;const st=()=>PV.climb.state(),g=()=>st().view.g,out={};
 const go=(room)=>{const w=CL.world(world);st().review=false;PV.climb.startWorld(world,w.chapter.rooms.findIndex(r=>r.id===room));st().spoke.add(met);V.advance(['']);};
 const begin=(n,key)=>{world=n;id=key;E.reset(key);const q=CL.world(n).quests.find(q=>q.id===key),d=PV.climb.defOf(q.from),who=d.people.find(p=>p.quest===key);met=q.from+':'+who.who;go(q.from);return q;};
 const at=(sp,n=2)=>{if(g().room.id!==sp.room)go(sp.room);g().p.x=sp.x-4;g().p.y=g().flipped?g().room.h-sp.y-g().p.h/2:sp.y-g().p.h/2;g().p.vx=g().p.vy=0;V.advance(Array(n).fill(''));};
 const hit=sp=>{at(sp);g().p.facing=1;g().p.x=sp.x-10;V.advance(['s',...Array(8).fill('')]);};
 const advance=(n,k='')=>V.advance(Array(n).fill(k));
 const tape=(room,observer)=>{go(room);const entries=R.tapes[room];for(const [n,k]of entries){for(let i=0;i<n;i++){V.advance([k]);observer?.();if(g().room.id!==room)return;}}};
 const heart=q=>!!JSON.parse(localStorage.getItem('bladefall.rbr.v1')||'{}').keepsakes?.[q.keepsake.id];
 // Beam search from the live physical state proves the return, rather than teleporting the companion.
 const copy=src=>{const o={};for(const k in src)if(!['defs','rooms','room','events','spikeSafe'].includes(k))o[k]=src[k];const z=structuredClone(o);z.defs=src.defs;z.rooms=src.rooms;z.room=src.room;z.events=[];z.spikeSafe=src.spikeSafe;return z;};
 const solveBack=(edge,point)=>{
  const base=g(),goal=z=>point?Math.hypot(z.p.x+4-point.x,z.p.y+z.p.h/2-point.y)<10:edge==='left'?z.p.x<=1:edge==='right'?z.p.x>=z.room.w-z.p.w-1:edge==='up'?z.p.y<=1:z.p.y>=z.room.h-z.p.h-2;
  const score=z=>point?Math.hypot(z.p.x+4-point.x,z.p.y+z.p.h/2-point.y):edge==='left'?z.p.x:edge==='right'?z.room.w-z.p.x:edge==='up'?z.p.y:z.room.h-z.p.y;
  const dirs=edge==='right'?['r','rj','rg','rgu','rgj','rx','rux','j','g','gu','ru','']:edge==='down'?['l','r','d','dj','ldj','rdj','lj','rj','ld','rd','dx','g','']:['l','lj','lg','lgu','lgj','lx','lux','j','g','gu','lu',''];
  let beam=[{g:copy(base),t:[]}];const seen=new Set();
  for(let depth=0;depth<55;depth++){
   const next=[];for(const node of beam)for(const k of dirs){const z=copy(node.g);let ok=false;
    for(let i=0;i<6;i++){C.step(z,BladefallRouteSolver.keysToInput(k));if(z.deaths>base.deaths||['dead','respawn'].includes(z.p.state))break;if(goal(z)){ok=true;const frames=[...node.t,...Array(i+1).fill(k)];V.advance(frames);V.advance(Array(12).fill(k));return {ok:true,frames:frames.length};}}
    if(z.deaths>base.deaths||['dead','respawn'].includes(z.p.state)||z.exited)continue;
    const p=z.p,key=[Math.round(p.x/3),Math.round(p.y/3),Math.round(p.vx/35),Math.round(p.vy/35),p.dashes,p.state,p.onGround,p.hook?.ring?.id||'',p.hook?Math.round(p.hook.len/5):'',k.includes('j')].join(',');if(seen.has(key))continue;seen.add(key);next.push({g:z,t:[...node.t,...Array(6).fill(k)],rank:score(z)+depth*.05});}
   next.sort((a,b)=>a.rank-b.rank);beam=next.slice(0,45);if(!beam.length)break;
  }return {ok:false,p:[base.p.x,base.p.y],edge};
 };
 let q=begin(4,'cartographer'),W=E.where(id);out.cartoSpots=W.flat().every(Boolean);
 // The ribbon is caught by the real intended gust traversal, with no quest-state edits.
 tape(E.CONFIG[id].rooms[0]);out.cartoRide=E.state(id).step===1;out.cartoState=JSON.stringify(E.state(id));
 if(E.state(id).step===1){W=E.where(id);at(W[1]);for(let i=0;i<140&&E.state(id).step===1;i++)at(W[1],1);out.cartoSettle=E.state(id).step===2;
 W=E.where(id);while(g().frame%144>50)advance(1);hit(W[2]);out.cartoDone=heart(q)&&E.state(id).step===3;}
 q=begin(5,'recruit');W=E.where(id);at(W[0]);out.recruitHelmet=E.state(id).step===1;at(W[1]);out.recruitReturned=E.state(id).step===2;
 tape(E.CONFIG[id].road);advance(80);out.recruitCross=heart(q);out.recruitState=JSON.stringify(E.state(id));
 q=begin(10,'quota');W=E.where(id);at(W[0]);advance(10);out.quotaNeedsMark=E.state(id).step===0;hit(W[0]);for(let i=0;i<120&&E.state(id).step===0;i++)at(W[0],1);out.quotaMark=E.state(id).step===1;
 W=E.where(id);at(W[1]);out.quotaLift=E.state(id).step===2;hit(W[2]);advance(20);out.quotaNeedsHold=!heart(q);for(let i=0;i<300&&!heart(q);i++)at(W[2],1);out.quotaDone=heart(q)&&E.state(id).step===3;out.quotaState=JSON.stringify(E.state(id));
 q=begin(12,'neighbours');W=E.where(id);tape(E.CONFIG[id].rooms[0]);out.teaCatch=E.state(id).step===1;out.teaFirst=JSON.stringify(E.state(id));
 if(E.state(id).step===1){go(E.CONFIG[id].rooms[1]);W=E.where(id);hit(W[1][0]);out.teaParked=!!E.state(id).parked;tape(E.CONFIG[id].rooms[1]);out.teaCups=E.state(id).step===2;out.teaSecond=JSON.stringify(E.state(id));
  W=E.where(id);at(W[2]);tape(E.CONFIG[id].road);out.teaDone=heart(q)&&E.state(id).step===3;}
 q=begin(16,'sailors');W=E.where(id);tape(E.CONFIG[id].rooms[0]);let triedHold=false;
 tape(E.CONFIG[id].rooms[1],()=>{if(E.state(id).step===1&&!triedHold){triedHold=true;V.advance(Array(65).fill('g'));}});
 out.sailorsChase=E.state(id).step>=1;out.noBranchHeart=!heart(q);out.sailorsHold=E.state(id).step===2;
 out.sailorsAfterHold=JSON.stringify({step:E.state(id).step,room:g().room.id,p:[g().p.x,g().p.y]});
 // Finish the last room to reopen its entrance, then physically retrace the branch.
 if(g().room.id===E.CONFIG[id].rooms[1])advance(55,'r');
 if(g().room.id==='cl16-pass-12')advance(30,'l');
 const seen=[];for(let guard=0;guard<8&&g().room.id!==q.from;guard++){
  const room=g().room.id,def=g().room.def,place=PV.climb.sectionOf(g()),idx=place.chain.findIndex(s=>s.room===room),previous=idx>0?place.chain[idx-1]:CL.world(world).sections.find(s=>s.room===q.from),dx=previous.x*8-place.x,dy=previous.y*8-place.y,edge=def.entry||(Math.abs(dy)>Math.abs(dx)?dy>0?'down':'up':dx<0?'left':'right');
  if(room==='cl16-t16-q-rigging'){for(const ring of g().ents.filter(e=>e.type==='ring').sort((a,b)=>b.x-a.x)){const part=solveBack('left',{x:ring.x+4,y:ring.y+24});seen.push({room,via:'ring',...part});if(!part.ok)break;}const shore=solveBack('left',{x:36,y:138});seen.push({room,via:'shore',...shore});}
  const proof=solveBack(edge);seen.push({room,edge,...proof});if(!proof.ok)break;
 }
 if(g().room.id===q.from){W=E.where(id);seen.push({room:q.from,...solveBack('left',W[2])});for(let i=0;i<900&&E.state(id).queue.length;i++)advance(1);hit(W[2]);out.sailorsDone=heart(q)&&E.state(id).step===3;}
 else out.sailorsDone=false;
 out.sailorsReturnPath=JSON.stringify({seen,room:g().room.id,p:[g().p.x,g().p.y],step:E.state(id).step,npc:E.state(id).npc,queued:E.state(id).queue.length});
 // Report route/hold evidence even when an action needs a different reachable hook sample.
 return out;
});
for(const [k,v]of Object.entries(result))if(typeof v==='boolean')check(k,v);else console.log(k,v);
check('no runtime errors',!errors.filter(e=>!/register/.test(e)).length);if(errors.length)console.log(errors);
}finally{await close();}
if(fails)process.exitCode=1;else console.log('PASS');
