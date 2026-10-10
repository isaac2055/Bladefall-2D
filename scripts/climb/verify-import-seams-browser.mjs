// Real-view checks for changed native joins and the three changed native arrivals.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {launchChrome} from '../../tests/launch-chrome.mjs';
const base=process.argv[2]||'http://localhost:8371',out='scripts/climb/.cache/integration-7.304';await fs.mkdir(out,{recursive:true});
const b=await launchChrome({headless:true,args:['--no-sandbox']}),p=await b.newPage(),errors=[],results=[];
p.on('pageerror',e=>errors.push(e.message));
try{
 await p.evaluateOnNewDocument(()=>{window.requestAnimationFrame=()=>0;});
 await p.goto(base+'/precision.html?pitch=climb&world=1',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.BladefallPrecisionView?.view.g);
 const native=await p.evaluate(()=>BladefallClimb.worlds.flatMap(w=>w.checkpointLinks.filter(l=>!BladefallClimb.def(w,l.from).campaignImport).map(l=>({world:w.n,id:l.from,to:l.to}))));
 await p.evaluate(()=>{BladefallPlaytest.setFeedback(false);const PV=BladefallPitchView,original=PV.exit;PV.exit=function(v,next){window.__seamExit=v.g.room.id;const result=original(v,next);v.paused=true;return result;};});
 for(const item of native){
  const r=await p.evaluate(({world,id,to})=>{
   const PV=BladefallPitchView,V=BladefallPrecisionView,R=BladefallPrecisionRooms,C=BladefallPrecisionCore,st=PV.climb.state();st.review=true;PV.climb.startWorld(world);const v=V.view;
   C.enterRoom(v.g,R.all.findIndex(d=>d.id===id));BladefallClimbBankPassages.arrive(v.g);v.paused=false;v.mode='play';v.wipe=0;v.replay=null;st.enteredAt=0;st.closed.clear();window.__seamExit=null;
   const tape=R.tapes[id]||[],frames=tape.flatMap(([n,k])=>Array(n).fill(k));V.advance([...frames,...Array(30).fill('')]);
   return {world,id,expected:to,exited:window.__seamExit===id,to:v.g.room.id,deaths:v.chapterStats.deaths,spawn:{x:v.g.p.x,y:v.g.p.y},expectedSpawn:v.g.room.spawn};
  },item);results.push(r);console.log(r.exited&&r.to===r.expected&&!r.deaths?'PASS':'FAIL',r.id,r.to,'deaths',r.deaths);
 }
 const arrivals=[];
 for(const world of [2,6,7])arrivals.push(await p.evaluate(world=>{
  const PV=BladefallPitchView,V=BladefallPrecisionView,R=BladefallPrecisionRooms,C=BladefallPrecisionCore,st=PV.climb.state();st.review=true;PV.climb.startWorld(world);const v=V.view,w=st.world,first=w.sections.find(s=>!BladefallClimb.def(w,s.room).atlasJunction),arrival=w.rooms.find(d=>d.id===`cl${world}-atlas-arrival`),port=arrival.atlasSockets.find(s=>s.to===first.room);
  C.enterRoom(v.g,R.all.findIndex(d=>d.id===arrival.id));const g=v.g,d=port.edge==='left'?'l':'r';g.p.x=port.edge==='left'?1:g.room.w-g.p.w-1;g.p.y=port.floor*8-g.p.h;g.p.vy=0;g.p.vx=0;g.p.onGround=true;v.paused=false;v.mode='play';st.enteredAt=-100;V.advance([d]);
  for(let i=0;i<30&&g.room.id===arrival.id;i++)V.advance([d]);
  const crossed=g.room.id===first.room;
  // Walk to its new fire through the actual atlas-carved receiving tunnel.
  for(let i=0;i<110&&crossed&&Math.abs(g.p.x-g.room.spawn.x)>3;i++)V.advance([g.p.x<g.room.spawn.x?'r':'l']);
  const reached=crossed&&Math.abs(g.p.x-g.room.spawn.x)<=5&&Math.abs(g.p.y-g.room.spawn.y)<=12;
  return {world,from:arrival.id,to:g.room.id,expected:first.room,crossed,reached,deaths:v.chapterStats.deaths,position:{x:g.p.x,y:g.p.y},spawn:g.room.spawn};
 },world));
 await fs.writeFile(out+'/native-seams.json',JSON.stringify({results,arrivals,errors},null,2)+'\n');
 console.log('ARRIVALS',JSON.stringify(arrivals));assert.deepEqual(errors,[]);assert(results.every(r=>r.exited&&r.to===r.expected&&!r.deaths),JSON.stringify(results.filter(r=>!r.exited||r.to!==r.expected||r.deaths)));assert(arrivals.every(r=>r.crossed&&r.reached&&!r.deaths));
 console.log(`PASS ${results.length} changed native exit/checkpoint joins and three changed arrival tunnels through actual Climb view.`);
}finally{await b.close();}
