// One quick look at a Climb world in the page (node scripts/climb/page-check.mjs N [shots]):
//  - the road, each section played by its own route from its fire: deaths, and whether it carries on;
//  - each branch: in by its door, its rooms, its way back walked to where it comes out, the reward, and the
//    way back's opening gone into from that room (the passage the other way).
// Needs the dev server on :8371 (node public/serve.mjs).
import {launchChrome} from '../../tests/launch-chrome.mjs';
import {fileURLToPath} from 'node:url';
const world=+(process.argv[2]||1),shots=process.argv[3]==='shots';
const OUT=fileURLToPath(new URL('./.cache/',import.meta.url));
const b=await launchChrome({headless:true,args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1280,height:720});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(`http://localhost:8371/precision.html?pitch=climb&world=${world}`,{waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>window.BladefallPrecisionView?.view.g,{timeout:30000});
await p.evaluate(()=>{localStorage.removeItem('bladefall.rbr.v1');localStorage.removeItem('bladefall.climb.v1');});
// (7.278) a Fractured world's echoes are sealed until the base quest's keepsake is held: hand those over, so the check
// can go in (the seal itself is checked by eye; nothing else in the save is set)
await p.evaluate(()=>{const w=BladefallPitchView.climb.state().world,need=(w?.quests||[]).map(q=>q.needs).filter(Boolean);
 if(need.length)localStorage.setItem('bladefall.rbr.v1',JSON.stringify({keepsakes:Object.fromEntries(need.map(k=>[k,true]))}));});
const r=await p.evaluate(()=>{
 const V=BladefallPrecisionView,R=BladefallPrecisionRooms,v=V.view,st=BladefallPitchView.climb.state(),w=st.world,CL=BladefallClimb;v.paused=false;
 const fr=t=>{const o=[];for(const [m,k] of t||[])for(let i=0;i<m;i++)o.push(k);return o;};
 const go=id=>{const i=R.chapters[st.chapter].rooms.findIndex(r=>r.id===id);V.goRoom(R.chapters.slice(0,st.chapter).reduce((n,c)=>n+c.rooms.length,0)+i);for(let i=0;i<12;i++)V.advance(['']);};
 const play=key=>{const from=v.g.room.id,f=fr(R.tapes[key]);for(let i=0;i<f.length+40;i++){V.advance([f[i]||'']);if(v.g.room.id!==from)break;}return v.g.room.id;};
 const out={road:[],branches:[]};
 // the road
 // the original climb only (the connected map adds an arrival and a departure junction around it)
 const road=w.sections.filter(s=>!CL.def(w,s.room).atlasJunction);
 go(road[0].room);
 for(const [k,s] of road.entries()){if(v.g.room.id!==s.room){out.road.push(`lost at ${s.room} (in ${v.g.room.id})`);break;}
  const d0=v.chapterStats.deaths;V.advance(['']);V.retryRoom();for(let i=0;i<12;i++)V.advance(['']);play(s.room);
  if(v.chapterStats.deaths>d0)out.road.push(`${s.room}: ${v.chapterStats.deaths-d0} deaths`);if(v.view?.mode&&v.mode!=='play')break;if(v.mode!=='play')break;}
 out.roadOk=!out.road.length;
 // the branches
 v.mode='play';
 for(const br of [...w.quests.filter(q=>q.sections.length),...(w.secrets||[])]){
  const e={id:br.id},real=br.sections.filter(s=>!s.passage),pass=br.sections.filter(s=>s.passage);
  const door=w.sections.find(s=>(CL.def(w,s.room).doors||[]).some(d=>d.to===br.id));const host=door?door.room:br.from;
  go(host);play(door?host+'#door':host+'#side');e.inBy=door?'ceiling door':'side door';e.entered=v.g.room.id===real[0].room;
  const d0=v.chapterStats.deaths;
  st.burst=null;st.branchVia='door';
  for(const s of real){if(v.g.room.id!==s.room){e.lost=v.g.room.id;break;}V.advance(['']);V.retryRoom();play(s.room);}
  e.pickedUp=!!st.burst;   // the item at the far end touched on the way out (not just the exit's fallback)
  for(const s of pass){if(v.g.room.id!==s.room){e.lost=e.lost||('passage: in '+v.g.room.id);break;}play(s.room+'#through');}
  for(const id of [real.at(-1).room])if(!e.lost&&!pass.length)play(id);
  e.cameOut=v.g.room.id;e.cameOutWhere=w.sections.some(s=>s.room===v.g.room.id)?(v.g.room.id===host?'its door room':'the road ELSEWHERE'):(real.some(s=>s.room===v.g.room.id)?'its own entrance room':'?');
  e.home=v.g.room.id===br.returnTo;for(let i=0;i<90;i++)V.advance(['']);e.deaths=v.chapterStats.deaths-d0;
  const sv=[JSON.parse(localStorage.getItem('bladefall.rbr.v1')||'{}').keepsakes||{},JSON.parse(localStorage.getItem('bladefall.climb.v1')||'{}').secrets||{}];
  e.reward=!!(br.keepsake?sv[0][br.keepsake.id]:sv[1][br.id]);
  e.passage=`${pass.length} pieces, ${pass.filter(s=>CL.def(w,s.room).map.some(r=>r.includes('s'))).length} springs`;
  // home from a ceiling door's branch: stand at its entrance's fire, drop through the ledge (down + jump), fall home
  if(door){go(real[0].room);V.advance(['']);V.retryRoom();for(let i=0;i<20;i++)V.advance(['']);
   // walk to the shaft: the seam cells are the shaft
   // stand on the shaft's cap, on a column with open air above it (not under a wall's spikes)
   const dd=CL.def(w,real[0].room),sm=dd.seam||[],top=sm.length?Math.min(...sm.map(c=>c[1])):0,cols=[...new Set(sm.map(c=>c[0]))].sort((a,b)=>b-a);
   const col=cols.find(c=>'.P'.includes((dd.map[top-1]||'')[c]))??cols[0],q=v.g.p;if(col!==undefined)q.x=col*8;for(let i=0;i<4;i++)V.advance(['']);
   const dd0=v.chapterStats.deaths;V.advance(['dj']);for(let i=0;i<120&&v.g.room.id===real[0].room;i++)V.advance(['']);for(let i=0;i<30;i++)V.advance(['']);
   e.dropHome=v.g.room.id===host&&v.chapterStats.deaths===dd0;}
  // the way back's opening, the other way
  const home=CL.def(w,br.returnTo),ret=(home&&home.returns||[]).find(x=>x.from===br.id),lp=pass.at(-1);
  if(ret&&lp){go(br.returnTo);for(let i=0;i<40;i++)V.advance(['']);const q=v.g.p,ed=ret.edge||'up',key=ed==='up'?'u':ed==='left'?'l':'r';
   if(ed==='up'){q.x=ret.cols[0]*8;q.y=2;q.vy=-120;}else{q.x=ed==='left'?0:v.g.room.w-q.w;q.y=ret.cols[0]*8+2;}
   for(let i=0;i<30&&v.g.room.id===br.returnTo;i++)V.advance([key]);e.reverse=v.g.room.id===lp.room;}
  out.branches.push(e);
 }
 return out;});
console.log(`world ${world}: road ${r.roadOk?'OK (every section plays from its fire, 0 deaths)':'PROBLEMS '+r.road.join('; ')}`);
for(const e of r.branches)console.log(' ',JSON.stringify(e));
if(shots){
 // pictures: the first branch's way back, from the first piece, and where it comes out
 const ids=r.branches.map(e=>e.id);
 for(const id of ids){
  await p.evaluate(id=>{const ov=document.getElementById('pcOverlay');if(ov)ov.style.display='none';const V=BladefallPrecisionView,R=BladefallPrecisionRooms,v=V.view,st=BladefallPitchView.climb.state(),w=st.world;v.paused=false;
   const br=w.quests.find(q=>q.id===id)||w.secrets.find(x=>x.id===id),pass=br.sections.filter(s=>s.passage);
   const i=R.chapters[st.chapter].rooms.findIndex(r=>r.id===(pass[Math.floor(pass.length/2)]||br.sections[0]).room);V.goRoom(R.chapters.slice(0,st.chapter).reduce((n,c)=>n+c.rooms.length,0)+i);for(let i=0;i<20;i++)V.advance(['']);v.paused=true;},id);
  await new Promise(r=>setTimeout(r,500));await p.screenshot({path:OUT+`w${world}-${id}-passage.png`});
 }
}
console.log('  page errors',errs.length?errs:'none');await b.close();
