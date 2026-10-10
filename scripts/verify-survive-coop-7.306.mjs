// Two independent browser profiles: no shared saves, input or physics.
// Prefer production PeerJS signaling + WebRTC; explicitly report local transport fallback.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {launchChrome} from '../tests/launch-chrome.mjs';
const base=process.argv[2]||'http://localhost:8371',out='scripts/climb/.cache/coop-7.306';await fs.mkdir(out,{recursive:true});
const browser=await launchChrome({headless:true,args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const result={version:'7.306',transport:null,physicalDevices:false,checks:[],network:[],errors:[]};
const ok=(value,label,detail)=>{assert.ok(value,label+': '+JSON.stringify(detail));result.checks.push({label,detail});console.log('PASS',label);};
const contexts=await Promise.all([browser.createBrowserContext(),browser.createBrowserContext()]);const pages=await Promise.all(contexts.map(c=>c.newPage()));const [host,guest]=pages;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 for(const [index,page]of pages.entries()){
  page.on('pageerror',e=>result.errors.push({index,message:e.message}));
  page.on('requestfailed',r=>{if(/peerjs/.test(r.url()))result.network.push({index,url:r.url().split('?')[0],error:r.failure()?.errorText});});
  await page.setViewport({width:1280,height:720});await page.evaluateOnNewDocument(()=>{window.requestAnimationFrame=()=>0;window.cancelAnimationFrame=()=>{};});
  await page.goto(base+'/precision.html?pitch=climb&world=1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.BladefallPrecisionView?.view.g);
 }
 await host.evaluate(()=>localStorage.setItem('coop-isolation-probe','host-only'));
 ok(await guest.evaluate(()=>localStorage.getItem('coop-isolation-probe')===null),'Separate browser profiles have isolated saves');
 await host.evaluate(()=>BladefallClimbCoop.host());
 try{
  await host.waitForFunction(()=>['waiting','error'].includes(BladefallClimbCoop.status),{timeout:18000,polling:50});
  const state=await host.evaluate(()=>({status:BladefallClimbCoop.status,code:BladefallClimbCoop.code,error:BladefallClimbCoop.err}));
  assert.equal(state.status,'waiting',state.error||'PeerJS host did not open');await guest.evaluate(code=>BladefallClimbCoop.join(code),state.code);
  await Promise.all(pages.map(p=>p.waitForFunction(()=>BladefallClimbCoop.status==='on'&&!!BladefallClimbCoop.remote,{timeout:18000,polling:50})));
  result.transport='PeerJS signaling and actual WebRTC data channel';
 }catch(error){
  result.network.push({connection:error.message});console.log('PeerJS unavailable; using explicit isolated-profile test relay:',error.message);
  for(const page of pages)await page.evaluate(()=>BladefallClimbCoop.leave());
  // BroadcastChannel does not cross isolated storage profiles. Relay only its
  // messages through the harness; the real game transport callbacks remain live.
  for(const [index,page]of pages.entries()){
   await page.exposeFunction('__relayCoop',data=>pages[1-index].evaluate(data=>{for(const channel of window.__channels||[])channel.onmessage?.({data});},data));
   await page.evaluate(()=>{window.__channels=[];window.BroadcastChannel=class{constructor(name){this.name=name;__channels.push(this);}postMessage(data){void __relayCoop(data);}close(){__channels=__channels.filter(c=>c!==this);}};history.replaceState(null,'',location.href+'&coop=local');});
  }
  await host.evaluate(()=>BladefallClimbCoop.host());await guest.evaluate(()=>BladefallClimbCoop.join('LOCAL'));
  await Promise.all(pages.map(p=>p.waitForFunction(()=>BladefallClimbCoop.status==='on'&&!!BladefallClimbCoop.remote,{timeout:5000,polling:50})));
  result.transport='Explicit local message relay across isolated browser profiles (network service unavailable)';
 }
 console.log('TRANSPORT',result.transport);
 const snapshot=page=>page.evaluate(()=>{const g=BladefallPrecisionView.view.g,s=BladefallPitchView.climb.state();return {world:s.world.n,room:g.room.id,phase:g.phase,boss:JSON.stringify({warden:g.warden&&{state:g.warden.state,wounds:g.warden.wounds,hp:g.warden.hp},sorc:g.sorc&&{state:g.sorc.state,hits:g.sorc.hits},mk:g.mk&&{state:g.mk.state,hits:g.mk.hits}}),player:{x:g.p.x,y:g.p.y,dashes:g.p.dashes,carrying:!!g.p.carrying},entities:JSON.stringify(g.ents,(k,v)=>v instanceof Set?[...v]:v instanceof Map?[...v]:v),portals:JSON.stringify(g.portals),shards:[...g.shards],deaths:g.deaths,roomDeaths:g.roomDeaths,solved:Object.keys(s.atlas.state.solved).sort(),trialSolved:[...s.trialSolved].sort(),hearts:BladefallPlaytest.state().run?.hearts||0,heartIds:BladefallPlaytest.state().run?.heartIds||[]};});
 const enter=async(page,room)=>page.evaluate(room=>{const w=BladefallClimb.worlds.find(w=>w.rooms.some(d=>d.id===room));BladefallPitchView.climb.startWorld(w.n);const p=BladefallClimb.place(w,room);if(!BladefallPitchView.climb.teleport(room,p.x+100,p.y+10))throw Error('Cannot enter '+room);BladefallPrecisionView.view.wipe=0;BladefallPrecisionView.view.wipeTo=null;},room);
 const cases=[{room:'cl2-bank-b67',kind:'new Base superroom',record:'base/bank-b67.json'},{room:'cl7-bank-b70',kind:'new native Warden boss superroom',record:'base/bank-b70.json'},{room:'cl27-bank-f70',kind:'new Fractured superroom',record:'fractured/bank-f70.json'}];
 for(const c of cases){
  await enter(host,c.room);await enter(guest,c.room);await guest.waitForFunction(id=>BladefallClimbCoop.remote?.room===id,{timeout:5000,polling:50},c.room);
  const draw=await guest.evaluate(()=>{const V=BladefallPrecisionView,original=V.drawKnight;let count=0;V.drawKnight=(...args)=>{count++;original(...args);};BladefallClimbCoop.draw(V.view.b,V.view.g,BladefallPitchView.climb.sectionOf(V.view.g));V.drawKnight=original;return {count,room:BladefallClimbCoop.remote.room};});ok(draw.count===1,'Partner ghost renders in imported '+c.kind,draw);
  const before=await snapshot(guest);
  const tape=JSON.parse(await fs.readFile('scripts/room-bank/'+c.record,'utf8')).tape;
  const completed=await host.evaluate(tape=>{const V=BladefallPrecisionView,C=BladefallPrecisionCore,events=[];BladefallPrecisionDeviceViews.push({event:e=>events.push(e.type)});const origin=V.view.g.room.id;for(const [frames,keys]of tape){V.advance(Array(frames).fill(keys));if(V.view.g.room.id!==origin)break;}const s=BladefallPitchView.climb.state();return {origin,room:V.view.g.room.id,events,solved:!!s.atlas.state.solved[origin],deaths:V.view.g.deaths};},tape);
  ok(completed.solved&&completed.events.includes('exit'),'Host completes '+c.kind+' through its normal room simulation',completed);
  await wait(180);assert.deepEqual(await snapshot(guest),before);ok(true,'Host completion leaves guest position, switches, portals, hearts, deaths and solved rooms unchanged: '+c.kind);
  // The host may be in the exit passage or still at a finale. Following must land at the
  // guest's own start, not beside a partner near the exit.
  await guest.waitForFunction(id=>BladefallClimbCoop.remote?.room===id,{timeout:5000,polling:50},completed.room);
  const follow=await guest.evaluate(()=>{const V=BladefallPrecisionView,co=BladefallClimbCoop;co.tDown=true;for(let n=0;n<66;n++)co.tick(V.view.g);const g=V.view.g,s=BladefallPitchView.climb.state();return {room:g.room.id,x:g.p.x,y:g.p.y,spawn:g.room.spawn,solved:!!s.atlas.state.solved[g.room.id],hearts:BladefallPlaytest.state().run?.hearts||0};});
  ok(follow.room===completed.room&&follow.x===follow.spawn.x&&follow.y===follow.spawn.y&&!follow.solved&&follow.hearts===before.hearts,'Following enters the guest checkpoint without gifting a clear: '+c.kind,follow);
 }
 // State mutation probes go beyond winning a room: even while connected,
 // host-only phase, portal, entity, death and heart changes must stay local.
 await enter(host,'cl6-bank-b50');await enter(guest,'cl6-bank-b50');const before=await snapshot(guest);
 const hostChanges=await host.evaluate(()=>{const g=BladefallPrecisionView.view.g,C=BladefallPrecisionCore;C.flipPhase(g,'coop-isolation-probe');for(const e of g.ents){if('lit'in e)e.lit=true;if('open'in e)e.open=true;}if(g.portals)g.portals.blue={color:'blue',c:4,r:4,face:'right',probe:true};C.kill(g,g.p,'coop isolation');const id=BladefallClimb.world(6).secrets[0].id;BladefallPlaytest.collectHeart(id);return {phase:g.phase,deaths:g.deaths,hearts:BladefallPlaytest.state().run.hearts,portals:!!g.portals};});
 await wait(200);assert.deepEqual(await snapshot(guest),before);ok(hostChanges.deaths>before.deaths&&hostChanges.hearts===1,'Host phase/portal/device/death/heart changes remain private',hostChanges);
 // A final-exit visit alone is insufficient if any of that player's required
 // campaign rooms are unfinished. Invoke the real exit hook at that exit.
 await enter(guest,'cl6-bank-b50');const incomplete=await guest.evaluate(()=>{const P=BladefallPitchView,V=BladefallPrecisionView,w=BladefallClimb.world(6),p=BladefallClimb.place(w,w.atlasEnd);P.climb.teleport(w.atlasEnd,p.x,p.y);P.exit(V.view,()=>{throw Error('Unexpected generic advance');});const s=P.climb.state(),save=JSON.parse(localStorage.getItem('bladefall.climb.v1')||'{}');return {required:w.requiredMainRooms.length,solved:w.requiredMainRooms.filter(id=>s.atlas.state.solved[id]).length,clear:!!save.cleared?.[6],offered:s.completionOffered};});ok(incomplete.solved<incomplete.required&&!incomplete.clear&&!incomplete.offered,'A guest cannot complete a world by following past unfinished rooms',incomplete);
 // Ghost rendering is asserted above; screenshots are not required for state-isolation checks.
 ok(result.errors.length===0,'No browser page errors',result.errors);
 await fs.writeFile(out+'/receipt.json',JSON.stringify(result,null,2));console.log(result.checks.length+' co-op checks passed');
}finally{for(const page of pages)await page.evaluate(()=>window.BladefallClimbCoop?.leave()).catch(()=>{});await browser.close();}
