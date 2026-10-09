// Targeted UI smoke: actual saved tape -> review -> next room, then play-mode clock.
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {launchChrome} from '../../tests/launch-chrome.mjs';
import {catalog,bankGroups} from './catalog.mjs';
const groups=bankGroups(),activeGroup='run'+catalog.activeRun;
const buttonFor=group=>group==='superrooms'?'bankSuperrooms':group==='banked'?'bankApproved':group==='review'?'bankReview':'bankRun'+group.slice(3);
const expected=['base','fractured'].flatMap(side=>readdirSync(resolve('scripts/room-bank',side)).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync(resolve('scripts/room-bank',side,f),'utf8')))).filter(x=>x.bank.status==='route-proven');
const groupOf=x=>x.bank.acceptance==='banked'?'banked':x.bank.collection==='superrooms'?'superrooms':x.bank.run>=2?'run'+x.bank.run:x.bank.run===1?'run1':'review';
const idsFor=(side,group)=>expected.filter(x=>x.bank.side===side&&groupOf(x)===group).map(x=>x.room.id).sort();
const out=resolve('scripts/climb/.cache/room-bank');mkdirSync(out,{recursive:true});
const b=await launchChrome({headless:true,args:['--no-sandbox']});
try{
 const p=await b.newPage();await p.setViewport({width:1440,height:960});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://localhost:8371/index.html');await p.waitForSelector('#extrasBtn');await p.click('#extrasBtn');await p.click('#roomBankBtn');await p.waitForSelector('#bankBase');
 const counts=await p.evaluate(()=>({records:BladefallRoomBank.records.length,visible:document.querySelectorAll('[data-bank-room]').length}));assert.equal(counts.records,expected.length);assert.equal(counts.visible,idsFor('base',activeGroup).length);
 const visibleIds=()=>p.$$eval('[data-bank-room]',els=>els.map(e=>e.dataset.bankRoom));
 assert.deepEqual((await visibleIds()).sort(),idsFor('base',activeGroup));
 for(const group of groups){
  const button=buttonFor(group);
  const expectedCount=expected.filter(x=>groupOf(x)===group).length;
  assert.match(await p.$eval('#'+button,e=>e.textContent),new RegExp('· '+expectedCount+'$'));
 }
 await p.click('#bankReview');assert.deepEqual((await visibleIds()).sort(),idsFor('base','review'));
 await p.click('#bankApproved');assert.deepEqual((await visibleIds()).sort(),idsFor('base','banked'));
 for(const id of ['bank-f20','bank-f37','bank-f38','bank-f39','bank-f41','bank-f44'])assert.match(await p.$eval('[data-bank-room='+id+']',e=>e.textContent),/moved to Base/);
 assert.ok((await visibleIds()).includes('bank-b26'),'approved B26 is now banked');
 await p.screenshot({path:resolve(out,'banked.png')});
 for(const group of groups){
  const button=buttonFor(group);
  await p.click('#'+button);
  for(const side of ['base','fractured']){
   await p.click(side==='base'?'#bankBase':'#bankFractured');
   assert.deepEqual((await visibleIds()).sort(),idsFor(side,group));
   for(const rec of expected.filter(x=>x.bank.side===side&&groupOf(x)===group&&x.bank.format==='extended'))assert.match(await p.$eval('[data-bank-room='+rec.room.id+']',e=>e.textContent),new RegExp('Extended room · '+(rec.room.cols||40)+' × '+(rec.room.rows||23)+' tiles'));
  }
 }
 await p.click('#'+buttonFor(activeGroup));await p.click('#bankBase');
 const chapters=await p.evaluate(()=>BladefallPrecisionRooms.chapters.filter(c=>c.bank).map(c=>[c.id,c.rooms.length]));
 assert.deepEqual(chapters,['base','fractured'].flatMap(side=>groups.map(group=>['bank-'+side+'-'+group,idsFor(side,group).length])).filter(([,n])=>n));
 assert.equal(await p.evaluate(()=>!!window.BladefallPrecisionSpentThorn&&BladefallPrecisionDeviceViews.some(x=>x.name==='spent-thorn')),true,'spent thorn engine and renderer registered');
 await p.screenshot({path:resolve(out,'menu.png')});
 const id=await p.$eval('[data-bank-room]',e=>e.dataset.bankRoom);await p.click(`[data-bank-room="${id}"]`);
 const played=await p.evaluate(()=>{const V=BladefallPrecisionView,R=BladefallPrecisionRooms;const id=V.view.g.room.id;V.advance(R.tapes[id].flatMap(([n,k])=>Array(n).fill(k)));return {room:id,pending:BladefallClimbSession.state().pending,paused:V.view.paused};});
 assert.equal(played.pending,true);assert.equal(played.paused,true);
 await p.select('[name=fun]','8');await p.select('[name=difficulty]','2');await p.select('[name=suitability]','4');await p.type('[name=comment]','Candidate route; N is text.');
 await p.screenshot({path:resolve(out,'review.png')});await p.click('#bsDialog button[type=submit]');
 const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('bladescent.reviews.v1')).at(-1));assert.equal(saved.room,id);assert.equal(saved.bankSide,'base');assert.match(saved.revision,/^[a-f0-9]{12}$/);assert.equal(saved.comment,'Candidate route; N is text.');
 const exported=await p.evaluate(async()=>{const orig=URL.createObjectURL;let blob;URL.createObjectURL=x=>{blob=x;return orig(x);};BladefallClimbSession.exportReviews();URL.createObjectURL=orig;return blob.text();});assert.ok(exported.includes('"revision"'));assert.ok(exported.includes(id));
 // A combined review session retains a separate Run2 response with the revised room hash.
 await p.goto('http://localhost:8371/precision.html?pitch=bank&mode=review&side=fractured&group=run2&room=bank-f31');
 await p.waitForFunction(()=>window.BladefallPrecisionView?.view.g?.room.id==='bank-f31');
 await p.evaluate(()=>{const V=BladefallPrecisionView;V.advance(BladefallPrecisionRooms.tapes['bank-f31'].flatMap(([n,k])=>Array(n).fill(k)));});
 await p.select('[name=fun]','7');await p.select('[name=difficulty]','4');await p.select('[name=suitability]','4');await p.click('#bsDialog button[type=submit]');
 const combined=await p.evaluate(()=>JSON.parse(localStorage.getItem('bladescent.reviews.v1')));
 assert.equal(combined.length,2);assert.equal(combined[0].room,id);assert.equal(combined[1].room,'bank-f31');assert.equal(combined[1].bankSide,'fractured');
 assert.equal(combined[1].revision,await p.evaluate(()=>BladefallRoomBank.records.find(x=>x.room.id==='bank-f31').bank.revision));
 // Historical URLs resolve to the record's current side/group, including both transfer directions.
 for(const rec of expected.filter(x=>x.bank.reclassifiedFrom)){
  const room=rec.room.id,target=rec.bank.side,group=groupOf(rec);
  await p.goto('http://localhost:8371/precision.html?pitch=bank&mode=review&side='+rec.bank.reclassifiedFrom+'&group=run3&room='+room);
  await p.waitForFunction(id=>window.BladefallPrecisionView?.view.g?.room.id===id,{},room);
  const moved=await p.evaluate(()=>({side:BladefallPrecisionView.view.g.room.def.bank.side,href:document.querySelector('#bsBar a').href}));
  assert.equal(moved.side,target);assert.ok(moved.href.includes('side='+target));assert.ok(moved.href.includes('group='+group));assert.ok(moved.href.includes('room='+room));
 }
 await p.goto('http://localhost:8371/precision.html?pitch=bank&mode=play&side=fractured&group=review');await p.waitForSelector('[data-bank-room]');await p.click('[data-bank-room]');
 const playRoom=await p.evaluate(()=>BladefallPrecisionView.view.g.room.id);
 const clock=await p.evaluate(()=>{const V=BladefallPrecisionView,S=BladefallClimbSession;const a=S.state().run.frames;V.advance(Array(60).fill(''));const b=S.state().run.frames;V.view.paused=true;V.advance(Array(60).fill(''));return [a,b,S.state().run.frames];});assert.equal(clock[1]-clock[0],60);assert.equal(clock[2],clock[1]);assert.equal(await p.$('#bsRate'),null);
 const modeLink=await p.$eval('#bsBar a',e=>e.href);assert.ok(modeLink.includes('side=fractured'));assert.ok(modeLink.includes('group=review'));assert.ok(modeLink.includes('room='+playRoom));
 await p.evaluate(()=>{BladefallPrecisionView.view.paused=false;});await p.keyboard.press('Escape');await p.waitForSelector('[data-room]');
 await p.evaluate(()=>document.querySelectorAll('[data-room]')[document.querySelectorAll('[data-room]').length-1].click());
 assert.equal(await p.evaluate(()=>BladefallClimbSession.state().run.eligible),false,'pause room selection must invalidate set time');
 await p.evaluate(()=>BladefallRoomBankView.menu());await p.waitForSelector('#bankFractured');
 // Each route is already checked in Node. Browser checks that every candidate renders without page errors.
 const requested=process.argv.slice(2);
 const activeIds=new Set(expected.filter(x=>x.bank.batch===catalog.activeBatch).map(x=>x.room.id));
 const ids=(await p.evaluate(()=>BladefallRoomBank.records.map(x=>x.room.id))).filter(id=>requested.length?requested.includes(id):activeIds.has(id));
 for(const room of ids){
  await p.goto(`http://localhost:8371/precision.html?pitch=bank&mode=play&room=${room}`);await p.waitForFunction(id=>window.BladefallPrecisionView?.view.g?.room.id===id,{},room);
  await p.evaluate(()=>{BladefallPrecisionView.view.paused=true;BladefallPrecisionView.pump(1);});
  await p.screenshot({path:resolve(out,room+'.png')});
  const route=await p.evaluate(()=>{const V=BladefallPrecisionView,events=[],cameras=[],transfers=[],shots=[];let transfer=false,frame=0;const tap={event:e=>{events.push(e.type);if(e.type==='echo-swap'||e.type==='portal-pass'&&e.kind==='knight')transfer=true;}};BladefallPrecisionDeviceViews.push(tap);V.retryRoom();const id=V.view.g.room.id;V.view.paused=false;function* untilExit(){for(const [n,k]of BladefallPrecisionRooms.tapes[id])for(let i=0;i<n;i++){yield k;if(events.includes('exit'))return;}}if(V.view.g.room.w>320||V.view.g.room.h>184){const total=BladefallPrecisionRooms.tapes[id].reduce((n,[f])=>n+f,0),capture=new Set([Math.floor(total/3),Math.floor(total*2/3)]);for(const k of untilExit()){V.advance([k]);if(capture.has(++frame))shots.push({frame,data:V.view.canvas.toDataURL('image/png')});if(transfer){transfers.push([V.view.g.p.x-V.view.cam.x,V.view.g.p.y-V.view.cam.y]);transfer=false;}cameras.push([V.view.cam.x,V.view.cam.y,V.view.g.p.x,V.view.g.p.y,V.view.g.room.id]);}}else V.advance(untilExit());BladefallPrecisionDeviceViews.splice(BladefallPrecisionDeviceViews.indexOf(tap),1);return {exit:events.includes('exit'),deaths:events.filter(e=>e==='death').length,events:[...new Set(events)],cameras,transfers,shots};});
  for(const shot of route.shots)writeFileSync(resolve(out,room+'-frame-'+shot.frame+'.png'),Buffer.from(shot.data.split(',')[1],'base64'));
  // Check the actual route and bounds: an extended 48×36 room is not a three-screen superroom.
  if(route.cameras.length){
   assert.ok(route.transfers.every(([x,y])=>x>=0&&x<320&&y>=0&&y<184),room+' spatial transfer visible immediately');
   const rec=expected.find(x=>x.room.id===room),maxX=Math.max(0,(rec.room.cols||40)*8-320),maxY=Math.max(0,(rec.room.rows||23)*8-184),xs=route.cameras.map(x=>x[0]),ys=route.cameras.map(x=>x[1]),span=a=>Math.max(...a)-Math.min(...a);
   const targetX=route.cameras.map(x=>Math.max(0,Math.min(maxX,x[2]+4-160))),targetY=route.cameras.map(x=>Math.max(0,Math.min(maxY,x[3]+5-184*.55)));
   assert.ok(route.cameras.every(x=>x[4]===room),room+' is one continuous room');
   assert.ok(xs.every(x=>x>=0&&x<=maxX+.01)&&ys.every(y=>y>=0&&y<=maxY+.01),room+' camera stays within actual room bounds');
   assert.ok(span(xs)>=span(targetX)*.6-1&&span(ys)>=span(targetY)*.6-1,room+' eased camera follows the travelled route');
   console.log(room+' '+(rec.room.cols||40)+'×'+(rec.room.rows||23)+' camera travel '+Math.round(span(xs))+','+Math.round(span(ys)));
  }
  assert.equal(route.exit,true,room+' browser route');assert.equal(route.deaths,0,room+' browser deaths');
  for(const e of expected.find(x=>x.room.id===room).bank.requiredEvents||[])assert.ok(route.events.includes(e),room+' browser event '+e);

 }
 // The companion uses the remappable Portal action; its room must name that action correctly.
 if(ids.includes('bank-f50')){
  await p.goto('http://localhost:8371/precision.html?pitch=bank&mode=play&room=bank-f50');
  await p.waitForFunction(()=>window.BladefallPrecisionView?.view.g?.relay);
  await p.keyboard.press('Escape');await p.waitForSelector('#pcCtl');await p.click('#pcCtl');
  assert.match(await p.$eval('.pcBinds',e=>e.textContent),/Oren · hold \/ follow/);
  await p.screenshot({path:resolve(out,'run5-companion-controls.png')});
 }
 assert.deepEqual(errors,[]);console.log(`PASS: Extras entry; default Run ${catalog.activeRun} and all groups/counts; actual-dimension scrolling routes; combined completion reviews with stable revisions; CSV; play clock/pause; ${ids.length} rendered rooms.`);
}finally{await b.close();}
