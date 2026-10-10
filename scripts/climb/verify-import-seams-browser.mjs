// Exact changed-seam tapes through the real Climb view, with local assets only.
// --world=N / --from=source-id / --limit=N target a repair; --seams-only omits UI checks.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {launchChrome} from '../../tests/launch-chrome.mjs';
import {loadWorlds,exitRoute,fireTarget} from './check-bank-import.mjs';
const option=name=>process.argv.find(x=>x.startsWith('--'+name+'='))?.split('=')[1],only=Number(option('world')||0),limit=Number(option('limit')||Infinity);
const seamsOnly=process.argv.includes('--seams-only'),uiOnly=process.argv.includes('--ui-only'),onlyFrom=option('from')||'';
const raw=loadWorlds();assert(raw.every(w=>/^7\.30[67]\.0$/.test(w.bankIntegration?.version)),'Rebuild the complete 7.306 campaign before browser seam verification.');
const out=resolve('scripts/climb/.cache/integration-7.307');await fs.mkdir(out,{recursive:true});
const worlds=raw.filter(w=>!only||w.n===only),items=(uiOnly?[]:worlds).flatMap(w=>w.continuousSeams.filter(proof=>!onlyFrom||proof.from===onlyFrom).map(proof=>{const d=w.rooms.find(r=>r.id===proof.from),r=exitRoute(d,w.tapes[d.id]);assert(r.exit&&!r.deaths,`${d.id}: source route before browser`);return {world:w.n,...proof,exitFrame:r.exit.i+1,target:fireTarget(w.rooms.find(r=>r.id===proof.to))};})).slice(0,limit);
const buildHash=createHash('sha256').update(await fs.readFile('public/bladefall-climb-worlds.js')).digest('hex'),results=[],errors=[],checks=[];
const b=await launchChrome({headless:true,protocolTimeout:30000,args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']}),p=await b.newPage();
p.on('pageerror',e=>{errors.push(e.message);console.error('PAGE',e.message);});
// Keep touch emulation stable when changing viewport size; changing isMobile
// mid-run would reload the page and discard the instrumented live view.
await p.setViewport({width:1100,height:700,isMobile:true,hasTouch:true,deviceScaleFactor:1});
await p.evaluateOnNewDocument(()=>{window.requestAnimationFrame=()=>0;localStorage.setItem('bladefall.pcore.v1',JSON.stringify({options:{sound:false,music:false,shake:false},assist:{speed:1,infiniteStamina:false}}));});
const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.json':'application/json','.webmanifest':'application/manifest+json'};
await p.setRequestInterception(true);p.on('request',async req=>{try{const u=new URL(req.url());if(u.hostname!=='bladefall2d.pages.dev')return req.abort();const path=resolve('public','.'+(u.pathname==='/'?'/index.html':u.pathname));if(!path.startsWith(resolve('public')+'/'))return req.abort();await req.respond({status:200,contentType:mime[extname(path)]||'application/octet-stream',body:await fs.readFile(path)});}catch{await req.respond({status:404,body:''});}});
const receipt=()=>fs.writeFile(out+`/physical-seams${only?'-w'+only:''}${onlyFrom?'-'+onlyFrom:''}.json`,JSON.stringify({version:'7.307.0',buildHash,scope:{world:only||'all',planned:items.length,limited:Number.isFinite(limit)||!!onlyFrom,from:onlyFrom||null,seamsOnly},results,checks,errors},null,2)+'\n');
function ok(value,label,detail){checks.push({label,pass:!!value,detail});console.log(value?'PASS':'FAIL',label);}
try{
 await p.goto('https://bladefall2d.pages.dev/precision.html?pitch=climb&world=1',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.BladefallPrecisionView?.view.g);
 await p.evaluate(()=>{
  BladefallPlaytest.setFeedback(false);
  window.__closedRoom=d=>{const map=d.map.map(row=>[...row]);for(const [c,r,ch]of d.seam||[])map[r][c]=ch;return BladefallPrecisionCore.parseRoom({...d,map:map.map(row=>row.join(''))},0);};
  window.__setupRoom=(world,id)=>{const PV=BladefallPitchView,V=BladefallPrecisionView,R=BladefallPrecisionRooms,C=BladefallPrecisionCore,st=PV.climb.state();st.review=true;PV.climb.startWorld(world);const v=V.view;v.g=C.createGame(R.all,{room:R.all.findIndex(d=>d.id===id)});v.paused=false;v.mode='play';v.wipe=0;v.wipeTo=null;v.replay=null;v.chapterStats.deaths=0;v.chapterStats.frames=0;v.roomTimer=0;v.trail=[];v.parts=[];v.scarf=[];st.enteredAt=0;st.closed.clear();st.cam=null;st.trail=[];st.lit={};const d=v.g.room.def;
   // Begin at the checkpoint after its approach has closed. No player relocation,
   // physics override, solved flag or route-demo assistance is used during either tape.
   if(d.closeWhilePlayed){const restored=__closedRoom(d);for(const [c,r]of d.seam||[]){const i=r*v.g.room.cols+c;v.g.room.grid[i]=restored.grid[i];v.g.room.portalable[i]=restored.portalable[i];}v.g.room.rev=(v.g.room.rev||0)+1;st.closed.add(id);}
   window.__seamWatch=null;V.advance([]);return v;
  };
  const PV=BladefallPitchView,original=PV.exit;
  PV.exit=function(v,next){const watch=window.__seamWatch;if(!watch||v.g.room.id!==watch.from)return original(v,next);const g=v.g,st=PV.climb.state(),pl=PV.climb.sectionOf(g),before={x:pl.x+g.p.x,y:pl.y+(g.flipped?g.room.h-g.p.y-g.p.h:g.p.y),vx:g.p.vx,vy:g.flipped?-g.p.vy:g.p.vy,cam:st.cam&&{...st.cam}},answer=original(v,next),afterPlace=PV.climb.sectionOf(v.g);watch.hit={before,after:{x:afterPlace.x+v.g.p.x,y:afterPlace.y+v.g.p.y,vx:v.g.p.vx,vy:v.g.p.vy,cam:st.cam&&{...st.cam}},to:v.g.room.id,frame:g.frame};v.paused=true;return answer;};
 });
 for(const item of items){
  const r=await p.evaluate(item=>{
   const PV=BladefallPitchView,V=BladefallPrecisionView,R=BladefallPrecisionRooms,C=BladefallPrecisionCore,v=__setupRoom(item.world,item.from),st=PV.climb.state(),frames=R.tapes[item.from].flatMap(([n,k])=>Array(n).fill(k));window.__seamWatch={from:item.from};
   const prefix=Math.max(0,item.exitFrame-18);V.advance(frames.slice(0,prefix));
   // Draw the final approach each frame so camera continuity is measured in the
   // real eased camera, rather than a single drawing after a thousand-frame tape.
   for(let i=prefix;i<frames.length+40&&!__seamWatch.hit;i++)V.advance([frames[i]||'']);
   const hit=__seamWatch.hit,camAfterDraw=st.cam&&{...st.cam};window.__seamWatch=null;
   if(!hit)return {world:item.world,from:item.from,to:item.to,pass:false,why:'source did not reach its forward exit',actualRoom:v.g.room.id,deaths:v.chapterStats.deaths,position:{x:v.g.p.x,y:v.g.p.y},state:v.g.p.state};
   const delta=Math.hypot(hit.after.x-hit.before.x,hit.after.y-hit.before.y),cameraHeld=!!hit.before.cam&&!!hit.after.cam&&hit.before.cam.x===hit.after.cam.x&&hit.before.cam.y===hit.after.cam.y,cameraDrawDelta=camAfterDraw&&Math.hypot(camAfterDraw.x-hit.after.cam.x,camAfterDraw.y-hit.after.cam.y),velocityHeld=hit.before.vx===hit.after.vx&&hit.before.vy===hit.after.vy;
   v.paused=false;const targetFrames=item.toFire.flatMap(([n,k])=>Array(n).fill(k));if(hit.to===item.to)V.advance(targetFrames);
   const g=v.g,sp=item.target.spawn;
   // Recoil and cargo supports can move below their authored spawn. Identify the
   // original support by its origin, then require actual standing on it at finish.
   const support=()=>g.ents.find(e=>!e.gone&&(e.solid||e.type==='zip'||e.type==='slide'||e.type==='thru'||e.thru)&&Math.abs(e.oy-(sp.y+g.p.h))<=1&&sp.x<e.ox+e.w&&sp.x+g.p.w>e.ox);
   const atHeight=()=>Math.abs(g.p.y-sp.y)<=2||Math.abs(g.p.y-item.target.settled)<=2||!!(support()&&C.standingOn(g,g.p,support()));
   const nearFire=()=>{const e=support(),fallingToSupport=e&&g.p.x<e.x+e.w&&g.p.x+g.p.w>e.x&&g.p.y>=sp.y-3&&g.p.y<=e.y-g.p.h+3&&e.y-g.p.h-sp.y<=48;return hit.to===item.to&&g.room.id===item.to&&Math.abs(g.p.x-sp.x)<=24&&(atHeight()||fallingToSupport);};
   const atFireNow=()=>hit.to===item.to&&g.room.id===item.to&&g.p.onGround&&Math.abs(g.p.x-sp.x)<=10&&atHeight();
   const expected=g.room.def.closeWhilePlayed?__closedRoom(g.room.def):null,isRestored=()=>!expected||(g.room.def.seam||[]).every(([c,r])=>{const i=r*g.room.cols+c;return g.room.grid[i]===expected.grid[i]&&g.room.portalable[i]===expected.portalable[i];});
   // Walk/brake the final few pixels with normal input, allowing a natural fall
   // onto the authored moving support. Final acceptance still requires the same
   // 10px fire radius, grounded support, and the fully restored entrance.
   const settling=[];for(let i=0;i<32&&nearFire()&&(!atFireNow()||!isRestored());i++){const dx=sp.x-g.p.x,key=Math.abs(dx)>1?(dx>0?'r':'l'):'';settling.push(key);V.advance([key]);}
   const atFire=atFireNow(),restored=expected?isRestored():null,position={x:g.p.x,y:g.p.y,ground:g.p.onGround},at=v.g.room.id;
   const pristinePuzzle=['bank-f31','bank-f32','bank-b76'].includes(g.room.def.bankOrigin)?{phase:g.phase,lit:g.ents.filter(e=>e.type==='stone'&&e.lit).length,openGates:g.ents.filter(e=>e.type==='gate'&&e.open).length,...(g.room.def.bankOrigin==='bank-b76'?{heldLanterns:g.ents.filter(e=>e.type==='lantern'&&e.held).length,openWeightDoors:(g.weightCircuits||[]).flatMap(c=>c.doors).filter(e=>!e.solid).length}:{})}:null,pristine=!pristinePuzzle||pristinePuzzle.phase===0&&pristinePuzzle.lit===0&&pristinePuzzle.openGates===0&&!(pristinePuzzle.heldLanterns||pristinePuzzle.openWeightDoors);
   const deaths=v.chapterStats.deaths,pass=pristine&&hit.to===item.to&&delta<=12.001&&cameraHeld&&cameraDrawDelta<90&&velocityHeld&&atFire&&deaths===0&&restored!==false;
   return {world:item.world,from:item.from,to:item.to,actual:hit.to,pass,entryDelta:delta,expectedDelta:item.entryDelta,cameraHeld,cameraDrawDelta,velocityHeld,atFire,deaths,restoredEntrance:restored,pristinePuzzle,position,afterApproach:at,sourceExitFrame:item.exitFrame,approachFrames:targetFrames.length,settlingFrames:settling,hit};
  },item);
  results.push(r);console.log(r.pass?'PASS':'FAIL',`W${r.world}`,r.from,'→',r.to,r.pass?`Δ${r.entryDelta}px` : JSON.stringify(r));await receipt();
 }
 // The same atlas and camera must render a wide mobile viewport without altering
 // the 320×184 simulation's dimensions or enabling protected-room skips.
 if(!seamsOnly){
 await p.setViewport({width:844,height:390,isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const mobile=await p.evaluate(()=>{BladefallPrecisionTouch.setActive(true);const w=BladefallClimb.world(1),id=w.requiredMainRooms.find(id=>{const d=BladefallClimb.def(w,id);return !d.bank&&(d.cols||40)*(d.rows||23)<=920;}),v=__setupRoom(1,id);BladefallPrecisionView.advance([]);return {id,viewport:[v.viewportW,v.viewportH],buffer:[v.buf.width,v.buf.height],core:BladefallPrecisionCore.W,canvas:pcCanvas.getBoundingClientRect().toJSON(),camera:BladefallPitchView.climb.state().cam};});
 ok(mobile.viewport[0]>=398&&mobile.viewport[1]===184&&mobile.buffer[0]===mobile.viewport[0]&&mobile.core===320&&mobile.canvas.width>=843,'Mobile Climb widens view and fills landscape without physics resizing',mobile);
 await p.keyboard.press('Escape');
 const menu=await p.evaluate(()=>({order:[...document.querySelectorAll('#pcOverlay .pcBtn')].map(e=>e.id||e.textContent),skip:document.querySelector('#pcSkipSection')?.textContent,disabled:document.querySelector('#pcSkipSection')?.disabled,info:BladefallPitchView.climb.skipInfo()}));
 ok(menu.order.indexOf('pcChapters')+1===menu.order.indexOf('pcCtl'),'World map immediately precedes Controls',menu.order);
 ok(menu.info.allowed&&!menu.disabled&&menu.skip.includes('3 left'),'Normal checkpoint exposes the mobile pause skip with remaining count',menu);
 if(menu.info.allowed){await receipt();console.log('UI scrolling to skip');await p.$eval('#pcSkipSection',e=>e.scrollIntoView({block:'center'}));const box=await p.$eval('#pcSkipSection',e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});console.log('UI tapping skip',JSON.stringify(box));await p.touchscreen.tap(box.x,box.y);console.log('UI skip tap delivered');await new Promise(r=>setTimeout(r,220));const skipped=await p.evaluate(()=>({room:BladefallPrecisionView.view.g.room.id,paused:BladefallPrecisionView.view.paused,remaining:BladefallPitchView.climb.state().skips,reason:BladefallClimbSession.state().run.reason,overlay:document.querySelector('#pcOverlay').classList.contains('show')}));ok(skipped.room!==mobile.id&&skipped.remaining===2&&!skipped.paused&&!skipped.overlay&&skipped.reason==='skip','Actual touch skip advances once, closes pause and invalidates the trial',skipped);}
 await receipt();console.log('UI checking protected rooms');
 const protectedRooms=await p.evaluate(()=>{const CL=BladefallClimb,out=[];for(const w of CL.worlds){const ids=new Set([w.sections.find(s=>CL.def(w,s.room)?.campaignWalk)?.room,w.sections.find(s=>{const d=CL.def(w,s.room);return ['boss','sentinel','marksman','colossus','warden','sorcerer','tyrant','crown','chainHydra','dayKing','rootCrown'].some(k=>d[k])&&d.id!==w.bankIntegration.superroom;})?.room,w.quests[0]?.sections[0]?.room,w.secrets[0]?.sections[0]?.room].filter(Boolean));for(const id of ids){__setupRoom(w.n,id);const st=BladefallPitchView.climb.state(),info=BladefallPitchView.climb.skipInfo(),before=st.skips,accepted=BladefallPitchView.climb.skipSection({fromPause:true});out.push({world:w.n,id,info,accepted,unchanged:before===st.skips&&BladefallPrecisionView.view.g.room.id===id});}}return out;});
 ok(protectedRooms.every(r=>!r.info.allowed&&!r.accepted&&r.unchanged),'Nonfinal bosses, connecting roads and optional routes reject skips',protectedRooms);
 const finaleCosts=await p.evaluate(()=>{const out=[];for(const n of [1,21]){const w=BladefallClimb.world(n),id=w.bankIntegration.superroom,cost=n>20?3:2;for(const budget of [cost-1,cost,3]){__setupRoom(n,id);const st=BladefallPitchView.climb.state();st.skips=budget;const info=BladefallPitchView.climb.skipInfo(),accepted=BladefallPitchView.climb.skipSection({fromPause:true});out.push({world:n,budget,cost,info,accepted,remaining:st.skips,room:BladefallPrecisionView.view.g.room.id,changed:BladefallPrecisionView.view.g.room.id!==id,solved:st.trialSolved.has(id),invalid:BladefallClimbSession.state().run.reason==='skip'});}}return out;});
 ok(finaleCosts.every(r=>r.info.cost===r.cost&&r.info.finale&&(r.budget<r.cost?!r.accepted&&!r.changed&&r.remaining===r.budget:r.accepted&&r.changed&&r.remaining===r.budget-r.cost&&r.solved&&r.invalid)),'Base finales cost two skips and Fractured finales cost three; insufficient budgets cannot advance',finaleCosts);

 } // UI checks; rendering was already verified above without an optional screenshot.
 ok(errors.length===0,'No browser script errors',errors);await receipt();
 assert(results.length===items.length&&results.every(r=>r.pass),`${results.filter(r=>!r.pass).length} physical seam failures; see saved receipt`);assert(checks.every(c=>c.pass),'Browser integration UI checks failed; see saved receipt');console.log(`PASS ${results.length} real continuous exit/approach routes and ${checks.length} browser checks.`);
}finally{await receipt();await b.close();}
