import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {launchChrome} from '../../tests/launch-chrome.mjs';
const base=process.env.PLAYTEST_TEST_URL,b=await launchChrome({headless:true,args:['--no-sandbox']}),p=await b.newPage(),errors=[],checks=[];
p.on('pageerror',e=>errors.push(e.message));
const click=async selector=>{await p.waitForSelector(selector);await p.$eval(selector,e=>e.click());};
try{
 await p.evaluateOnNewDocument(()=>{window.requestAnimationFrame=()=>0;});
 await p.goto(base+'index.html?tas',{waitUntil:'domcontentloaded'});await p.waitForSelector('#bladescentBtn');
 const title=await p.evaluate(()=>[...document.querySelectorAll('#overlay button,#overlay a')].map(e=>e.id));
 assert(title.indexOf('bladescentBtn')<title.indexOf('newBtn'));assert(title.indexOf('apkBtn')===title.indexOf('boardsBtn')+1);checks.push('Survive above Explore; APK immediately below Leaderboards');
 await click('#boardsBtn');assert.equal(await p.$eval('[data-mode=survival]',e=>e.getAttribute('aria-pressed')),'true');await click('#ptClose');
 // New backend process uses the current schema; rows are isolated from real player data.
 await p.evaluate(()=>{BladefallPlaytest.start('survival',1,{force:true});BladefallPlaytest.tick(1);BladefallPlaytest.death();void BladefallPlaytest.complete({menu:()=>{}});});
 await p.waitForSelector('#ptSave');await p.type('#ptSave input','Release check');await click('#ptSave button');await p.waitForFunction(()=>BladefallPlaytest.state().data.outbox.length===0,{polling:50});await click('#ptMenu');
 await p.evaluate(()=>{BladefallPlaytest.start('survival',1,{force:true});BladefallPlaytest.tick(2);BladefallPlaytest.collectHeart('local-secret-1');void BladefallPlaytest.complete({menu:()=>{}});});
 await p.waitForSelector('#ptSave');await click('#ptSave button');await p.waitForFunction(()=>BladefallPlaytest.state().data.outbox.length===0,{polling:50});await click('#ptMenu');
 await p.evaluate(()=>BladefallPlaytest.boards());await click('[data-sort=hearts]');
 const row=await p.$eval('#bfPlaytestDialog tbody',e=>e.textContent);assert(row.includes('0:02.00')&&row.includes('♥ 1'));
 await click('[data-sort=time]');assert((await p.$eval('#bfPlaytestDialog tbody',e=>e.textContent)).includes('0:01.00'));
 const api=await p.evaluate(async()=>await(await fetch('/api/playtest')).json());assert.equal(api.records.length,2);checks.push('Default Survival board and distinct time/heart personal bests survive API save/read');
 await p.goto(base+'precision.html?pitch=climb&world=1',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>!!window.BladefallPrecisionView?.view.g,{polling:50});
 await p.keyboard.press('Escape');
 const pause=await p.evaluate(()=>({actions:[...document.querySelectorAll('#pcOverlay .pcBtn')].map(e=>({id:e.id,text:e.textContent.trim()})),optional:[...document.querySelectorAll('#pcOverlay .pcMini')].map(e=>e.textContent).filter(t=>/^O\d/.test(t)),text:document.querySelector('#pcOverlay').textContent}));
 assert.equal(pause.actions[0].text,'World map');assert.equal(pause.actions.at(-1).text,'Return to title menu');assert(pause.optional.length>0);assert(!pause.text.includes('Optional routes'));checks.push('Pause World map first, title last, optional O labels within room grid');
 await click('#pcResume');
 // A real secret-room route grants its heart again in a fresh run even when it is already owned globally.
 const reward=await p.evaluate(()=>{
  const V=BladefallPrecisionView,R=BladefallPrecisionRooms,C=BladefallPrecisionCore,PV=BladefallPitchView,st=PV.climb.state(),w=st.world;
  const br=w.secrets[0],last=br.sections.filter(s=>!s.passage&&!C.createGame([BladefallClimb.def(w,s.room)]).room.def.connector).at(-1),id=last.room;
  const original=PV.exit;PV.exit=function(v,next){const result=original(v,next);v.paused=true;return result;};
  const run=()=>{PV.climb.startWorld(1);C.enterRoom(V.view.g,R.all.findIndex(d=>d.id===id));V.view.g.prev={};st.branchVia='door';V.view.paused=false;V.view.replay=null;V.view.wipe=0;V.advance(R.tapes[id].flatMap(([n,k])=>Array(n).fill(k)));return {hearts:BladefallPlaytest.state().run.hearts,owned:JSON.parse(localStorage.getItem('bladefall.climb.v1')).secrets[br.id]};};
  const first=run(),second=run();PV.exit=original;return {first,second};
 });
 assert.deepEqual(reward,{first:{hearts:1,owned:true},second:{hearts:1,owned:true}});checks.push('Actual secret route awards and re-awards one heart on separate runs');
 const gate=await p.evaluate(()=>{
  const V=BladefallPrecisionView,C=BladefallPrecisionCore,R=BladefallPrecisionRooms,PV=BladefallPitchView,st=PV.climb.state();PV.climb.startWorld(2);const w=st.world;
  C.enterRoom(V.view.g,R.all.findIndex(d=>d.id===w.atlasEnd));V.view.paused=false;PV.exit(V.view,()=>{});
  return {complete:st.atlas.complete(w.n),offered:st.completionOffered,runDone:BladefallPlaytest.state().run.done,cleared:!!JSON.parse(localStorage.getItem('bladefall.climb.v1')||'{}').cleared?.[w.n]};
 });assert.deepEqual(gate,{complete:false,offered:false,runDone:false,cleared:false});checks.push('Reaching the end without own required rooms awards no world clear');
 const fresh=await p.evaluate(()=>{
  const V=BladefallPrecisionView,C=BladefallPrecisionCore,R=BladefallPrecisionRooms,PV=BladefallPitchView,st=PV.climb.state();PV.climb.startWorld(3);const w=st.world;
  for(const id of w.requiredMainRooms)st.atlas.state.solved[id]=true;
  C.enterRoom(V.view.g,R.all.findIndex(d=>d.id===w.atlasEnd));V.view.paused=false;PV.exit(V.view,()=>{});
  return {offered:st.completionOffered,runDone:BladefallPlaytest.state().run.done,eligible:BladefallPlaytest.state().run.eligible};
 });assert.deepEqual(fresh,{offered:false,runDone:false,eligible:false});checks.push('Fresh timed run cannot borrow historical room solves');

 assert.deepEqual(errors,[]);await writeFile(process.env.PLAYTEST_ARTIFACT_DIR+'/release-integration-7.304.json',JSON.stringify({checks,errors},null,2)+'\n');console.log('PASS',checks);
}finally{await b.close();}
