// The ceiling-door lift (7.280), in the page: node scripts/climb/lift-check.mjs [world ...] (default: every world).
// For every ceiling door (a secret, an errand cut in a ceiling, a gate room): stand under it and let go of the keys
// (nothing happens), hold Up alone (he is carried up through it and lands on the branch's ledge, 0 deaths), then
// down + jump (he drops home). A Fractured echo's door is also tried without its keepsake: it must not lift.
// Needs the dev server on :8371 (node public/serve.mjs).
import {launchChrome} from '../../tests/launch-chrome.mjs';
const want=process.argv.slice(2).map(Number).filter(Boolean);
const b=await launchChrome({headless:true,args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:960,height:552});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const open=async(w,keepsakes)=>{
 await p.goto(`http://localhost:8371/precision.html?pitch=climb&world=${w}`,{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>window.BladefallPrecisionView?.view.g,{timeout:120000,polling:250});
 await p.evaluate(k=>{localStorage.removeItem('bladefall.climb.v1');const w=BladefallPitchView.climb.state().world,need=(w?.quests||[]).map(q=>q.needs).filter(Boolean);
  localStorage.setItem('bladefall.rbr.v1',JSON.stringify({keepsakes:k?Object.fromEntries(need.map(x=>[x,true])):{}}));},keepsakes);};
const tryDoors=()=>p.evaluate(()=>{
 const V=BladefallPrecisionView,R=BladefallPrecisionRooms,v=V.view,st=BladefallPitchView.climb.state(),w=st.world,CL=BladefallClimb;v.paused=false;
 const ov=document.getElementById('pcOverlay');if(ov)ov.style.display='none';
 const go=id=>{const i=R.chapters[st.chapter].rooms.findIndex(r=>r.id===id);V.goRoom(R.chapters.slice(0,st.chapter).reduce((n,c)=>n+c.rooms.length,0)+i);for(let k=0;k<20;k++)V.advance(['']);};
 const out=[];
 for(const s of w.sections)for(const dr of CL.def(w,s.room).doors||[]){
  const br=[...w.quests,...(w.secrets||[])].find(b=>b.id===dr.to);if(!br||!br.sections.length)continue;
  const sealed=!!(br.needs&&!(JSON.parse(localStorage.getItem('bladefall.rbr.v1')||'{}').keepsakes||{})[br.needs]);
  const e={world:w.n,door:s.room,to:dr.to,sealed};let d0=0,k=0;
  // a room's own hazard keeps its clock (a watch light starts sweeping at the first input): if it catches him, let it
  // sweep on a while from the fire (holding down, which never lifts) and try again
  for(let attempt=0;attempt<6;attempt++){
   go(s.room);for(let j=0;j<attempt*50;j++)V.advance(['d']);d0=v.chapterStats.deaths;
   // set him down on the floor under the door (the first tile under it that is not air: a one-way ledge counts)
   const g=v.g,rm=g.room;let r=0;while(r<rm.rows&&dr.cols.every(c=>rm.grid[r*rm.cols+c]===0))r++;
   g.p.x=dr.cols[0]*8+4;g.p.y=r*8-g.p.h;g.p.vx=g.p.vy=0;for(let j=0;j<(attempt?6:30);j++)V.advance(['']);
   if(!attempt)e.still=v.g.room.id===s.room&&Math.abs(v.g.p.y-(r*8-g.p.h))<2;   // no input: nothing happens
   k=0;
   for(;k<360;k++){V.advance(['u']);if(v.g.room.id!==s.room&&v.g.p.onGround&&!st.lift)break;}
   // A shade punishes waiting: test an immediate retreat from its entrance.
   if(!CL.def(w,br.sections[0].room).shade)for(let j=0;j<20;j++)V.advance(['']);
   e.attempts=attempt+1;if(v.chapterStats.deaths===d0||sealed)break;}
  e.frames=k;e.landedIn=v.g.room.id;e.onLedge=v.g.p.onGround;e.inBranch=br.sections.some(x=>x.room===v.g.room.id);e.deaths=v.chapterStats.deaths-d0;
  if(sealed){e.ok=e.still&&v.g.room.id===s.room&&!e.deaths;out.push(e);continue;}
  // home again: down + jump on the ledge (a branch that starts on a cart has no ledge over its way in)
  const fd=CL.def(w,br.sections[0].room),shaft=(fd.seam||[]).length>0;
  if(fd.echo)e.note='its shade follows him up: no way back by the door (the room\'s design)';
  else if(e.inBranch&&shaft){for(let j=0;j<(fd.shade?0:60);j++)V.advance(['']);V.advance(['dj']);for(let j=0;j<200&&v.g.room.id!==s.room;j++)V.advance(['']);for(let j=0;j<30;j++)V.advance(['']);e.home=v.g.room.id===s.room;e.deaths=v.chapterStats.deaths-d0;}
  e.ok=e.still&&e.inBranch&&e.onLedge&&!e.deaths&&(e.home!==false);out.push(e);
 }
 return out;});
const worlds=want.length?want:await (async()=>{await open(1,true);return p.evaluate(()=>BladefallClimb.worlds.filter(w=>w.sections.some(s=>(BladefallClimb.def(w,s.room).doors||[]).length)).map(w=>w.n));})();
let bad=0,n=0;
for(const w of worlds){
 await open(w,true);for(const e of await tryDoors()){n++;if(!e.ok)bad++;console.log(`${e.ok?'ok  ':'FAIL'} world ${e.world} ${e.door} -> ${e.to}: ${e.inBranch?`lifted into ${e.landedIn} in ${e.frames} frames${e.attempts>1?` (try ${e.attempts}: the room's hazard timed)`:''}, ${e.onLedge?'on its ledge':'NOT on a ledge'}`:`stayed in ${e.landedIn}`}${e.home===undefined?'':e.home?', dropped home':', NOT home'}${e.note?' ('+e.note+')':''}${e.still?'':', MOVED with no input'}, ${e.deaths} deaths`);}
 // an echo's door without its keepsake stays shut
 const sealedOnes=await p.evaluate(()=>{const w=BladefallPitchView.climb.state().world;return w.sections.some(s=>(BladefallClimb.def(w,s.room).doors||[]).some(dr=>w.quests.find(q=>q.id===dr.to)?.needs));});
 if(sealedOnes){await open(w,false);for(const e of (await tryDoors()).filter(e=>e.sealed)){n++;if(!e.ok)bad++;console.log(`${e.ok?'ok  ':'FAIL'} world ${e.world} ${e.door} -> ${e.to} (sealed echo): ${e.ok?'stays shut':'opened'}`);}}
}
console.log(`${n} door checks, ${bad} failing; page errors ${errs.length?errs.join(' | '):'none'}`);await b.close();process.exit(bad?1:0);
