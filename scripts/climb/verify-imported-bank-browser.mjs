// Play each imported bank tape through the production view, including Climb hooks and checkpoint transfer.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {launchChrome} from '../../tests/launch-chrome.mjs';
const base=process.argv[2]||'http://localhost:8371',out='scripts/climb/.cache/integration-7.304';await fs.mkdir(out,{recursive:true});
const b=await launchChrome({headless:true,args:['--no-sandbox']}),p=await b.newPage(),errors=[],results=[];
p.on('pageerror',e=>errors.push(e.message));
try{
 await p.evaluateOnNewDocument(()=>{window.requestAnimationFrame=()=>0;});
 await p.goto(base+'/precision.html?pitch=climb&world=1',{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>window.BladefallPrecisionView?.view.g);
 const imports=await p.evaluate(()=>BladefallClimb.worlds.flatMap(w=>w.requiredBankRooms.map(id=>({world:w.n,id}))));
 assert.equal(imports.length,97);
 await p.evaluate(()=>{
  BladefallPlaytest.setFeedback(false);const PV=BladefallPitchView,original=PV.exit;
  PV.exit=function(v,next){const from=v.g.room.id;window.__importExit=from;const result=original(v,next);v.paused=true;return result;};
 });
 for(const item of imports){
  const r=await p.evaluate(({world,id})=>{
   const PV=BladefallPitchView,V=BladefallPrecisionView,R=BladefallPrecisionRooms,C=BladefallPrecisionCore,st=PV.climb.state();
   st.review=true;PV.climb.startWorld(world);const v=V.view;
   const index=R.all.findIndex(d=>d.id===id);C.enterRoom(v.g,index);BladefallClimbBankPassages.arrive(v.g);
   v.paused=false;v.mode='play';v.wipe=0;v.replay=null;st.enteredAt=0;st.closed.clear();window.__importExit=null;
   const frames=R.tapes[id].flatMap(([n,k])=>Array(n).fill(k));
   V.advance([...frames,...Array(5).fill('')]);
   return {world,id,exited:window.__importExit===id,to:v.g.room.id,deaths:v.chapterStats.deaths,frames:frames.length,source:BladefallClimb.def(st.world,id).campaignImport,spawn:{x:v.g.p.x,y:v.g.p.y},expectedSpawn:v.g.room.spawn};
  },item);
  results.push(r);await fs.writeFile(out+'/browser-routes.json',JSON.stringify({results,errors},null,2)+'\n');
  console.log(r.exited&&!r.deaths?'PASS':'FAIL',r.id,r.to,'deaths',r.deaths);
 }
 assert.deepEqual(errors,[]);assert.equal(results.filter(r=>!r.exited||r.deaths).length,0,JSON.stringify(results.filter(r=>!r.exited||r.deaths)));
 console.log('PASS all97 imported routes through the real Climb view and per-room checkpoint transfers.');
}finally{await b.close();}
