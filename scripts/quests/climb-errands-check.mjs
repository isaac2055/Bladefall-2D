// Plays the three Ascend quests of bladefall-climb-errands.js in a headless page (precision.html?pitch=climb):
// Elsie's moths and lantern (world 2), Silas's governor and key (world 3), the Archivist's accounts (world 6).
// The knight is placed at each spot (the spots sit on each room's intended route, which verify:watch proves).
//   node scripts/quests/climb-errands-check.mjs
import {open} from './harness.mjs';
const {page,errors,close}=await open('precision.html?pitch=climb&world=1&nosw=1',()=>!!window.BladefallPitchView?.climb?.startWorld);
const fails=[];const check=(n,ok,d)=>{console.log((ok?'ok   ':'FAIL ')+n+(d?'  '+d:''));if(!ok)fails.push(n);};
try{
 const res=await page.evaluate(()=>{
  const PV=window.BladefallPitchView,V=window.BladefallPrecisionView,E=window.BladefallClimbErrands,CL=window.BladefallClimb,st=()=>PV.climb.state();
  let met=null;   // starting a world forgets who you spoke to: say hello again after each start
  const go=(n,room)=>{const w=CL.world(n),idx=w.chapter.rooms.findIndex(r=>r.id===room);st().review=false;PV.climb.startWorld(n,idx);if(met)st().spoke.add(met);V.advance(Array(30).fill(''));};
  const at=(n,sp)=>{if(st().view.g.room.id!==sp.room)go(n,sp.room);const g=st().view.g;g.p.x=sp.x-4;g.p.y=(g.flipped?g.room.h-sp.y-g.p.h/2:sp.y-g.p.h/2);g.p.vx=g.p.vy=0;V.advance(['','']);};
  const meet=(n,q)=>{const w=CL.world(n),qq=w.quests.find(x=>x.id===q),d=PV.climb.defOf(qq.from),who=d.people.find(p=>p.quest===q);met=qq.from+':'+who.who;st().spoke.add(met);return qq;};
  const done=q=>{try{return !!(JSON.parse(localStorage.getItem('bladefall.rbr.v1')||'{}').keepsakes||{})[q.keepsake.id];}catch(e){return false;}};
  const out={};localStorage.removeItem('bladefall.climb.errands.v1');
  // ---- Elsie
  let q=meet(2,'refuge');go(2,q.from);V.advance(['']);let W=E.where('refuge');
  out.elsieSpots=W[0].every(Boolean);
  for(const sp of W[0]){at(2,sp);V.advance(Array(4).fill(''));}
  out.elsieCaught=E.state('refuge').step===1;
  // dying drops it: the moths have it again at their last perch
  out.preKill=JSON.stringify({held:st()._errandHeld,s:E.state('refuge'),E:st()._errand,room:st().view.g.room.id,deaths:st().view.g.deaths});window.BladefallPrecisionCore.kill(st().view.g,st().view.g.p,'test');V.advance(Array(90).fill(''));out.postKill=JSON.stringify({held:st()._errandHeld,s:E.state('refuge'),E:st()._errand,deaths:st().view.g.deaths});out.elsieDropped=E.state('refuge').step===0;
  at(2,W[0].at(-1));V.advance(['','']);
  at(2,W[1]);V.advance(['','']);out.elsieHome=E.state('refuge').step===2;out.elsieAward=!!st().questAward;out.elsieHeart=done(q);
  // ---- Silas
  q=meet(3,'defector');go(3,q.from);V.advance(['']);W=E.where('defector');
  const gear=W[0];at(3,gear);const g=st().view.g;
  const strike=()=>{g.p.facing=1;g.p.x=gear.x-10;V.advance(['s','','','','','','','','']);};
  while(g.frame%144<60)V.advance(['']);strike();out.silasClang=E.state('defector').step===0;
  while(g.frame%144!==2)V.advance(['']);
  const st0=E.state('defector').step;g.p.x=gear.x-10;g.p.facing=1;
  for(let k=0;k<3&&E.state('defector').step===0;k++){V.advance(['s','','','']);}
  out.silasGear=E.state('defector').step===1;
  out.silasDetail=JSON.stringify({gear,px:st().view.g.p.x,room:st().view.g.room.id,frame:st().view.g.frame%144});
  const giver=E.where('defector')[1];
  at(3,{room:q.from,x:PV.climb.defOf(q.from).people.find(p=>p.quest==='defector').c*8+4,y:PV.climb.defOf(q.from).people.find(p=>p.quest==='defector').r*8+2});V.advance(['','']);
  at(3,giver);V.advance(['','']);out.silasHung=E.state('defector').step===2;out.silasAward=!!st().questAward;out.silasHeart=done(q);
  // ---- Archivist
  q=meet(6,'archivist');go(6,q.from);V.advance(['']);W=E.where('archivist');
  for(const sp of W[2].slice(0,2)){at(6,sp);}
  V.advance(Array(60*19).fill(''));out.pagesBlowBack=E.state('archivist').found.length===0;
  for(const sp of W[2]){at(6,sp);}out.pages=E.state('archivist').found.length===1;
  at(6,W[1]);out.gallery=E.state('archivist').found.length===2;
  at(6,W[0]);const g6=st().view.g;for(let k=0;k<4;k++){g6.p.facing=1;g6.p.x=W[0].x-10;V.advance(['s',...Array(40).fill('')]);}
  out.stacksDetail=JSON.stringify({sp:W[0],hits:st()._errand.hits,s:E.state('archivist'),room:st().view.g.room.id,px:st().view.g.p.x,py:st().view.g.p.y});
  at(6,W[0]);out.stacks=E.state('archivist').found.length===3;
  at(6,W[3]);V.advance(['','']);out.archivistDone=E.state('archivist').step===4;out.archivistAward=!!st().questAward;out.archivistHeart=done(q);
  return out;});
 await page.screenshot({path:'.cache/quest-shots/climb-5-heart-earned.png'});
 for(const [k,v] of Object.entries(res))if(typeof v==='boolean')check(k,v);else console.log(k,v);
 check('no page errors',!errors.filter(e=>!/register/.test(e)).length,errors.join(' | '));
}finally{await close();}
if(fails.length){console.log('\n'+fails.length+' failed');process.exit(1);}
console.log('\nPASS');
