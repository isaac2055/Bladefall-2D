import {open} from './harness.mjs';import fs from 'node:fs';
const {page,errors,close}=await open();let failures=0;
fs.mkdirSync('.cache/round2/shots',{recursive:true});
const shot=async id=>{await new Promise(r=>setTimeout(r,400));await page.screenshot({path:'.cache/round2/shots/explore-'+id+'.png'});};
const check=(name,ok,detail)=>{console.log(`${ok?'ok  ':'FAIL'} ${name}${detail?' '+detail:''}`);if(!ok)failures++;};
try{
 await page.evaluate(()=>{__q.tap=action=>{__BF.input.pressed[kbCode(action)]=true;__q.frames(1);};__q.finish=()=>{const id=G.sideStoryScene.id,a=G.obstacles.find(o=>o.sideStory===id&&o.sideStoryRole==='actor');__q.put(a.x,a.y);BladefallSideStoryWorld.interact(a);[...document.querySelectorAll('#fieldConversation button')].find(b=>b.textContent==='Continue')?.click();BladefallConversation.close();mode='play';const reward=G.obstacles.find(o=>o.sideStory===id&&o.sideStoryRole==='reward'),blood=G.p.blood;__q.put(reward.x,reward.y);const first=BladefallSideStoryWorld.interact(reward);BladefallConversation.close();mode='play';const twice=BladefallSideStoryWorld.interact(reward);const saved=G.sessionSideStories;BladefallSideStoryWorld.install();BladefallSideStoryWorld.apply();return first&&!twice&&G.p.blood===blood&&__q.row(id).claimed&&saved===G.sessionSideStories;};__q.round=(stage,id)=>{__q.setup(stage,id);G.p.weapon=oathbladeWeapon();G.p.invuln=999;};});
 const carto=await page.evaluate(()=>{const Q=__q,out={};Q.round(3,'cartographer');const R=BladefallRound2Explore;
  out.noMarkerStairs=!G.obstacles.some(o=>o.sideStory==='cartographer'&&['step','task'].includes(o.sideStoryRole));
  Q.put(6220,340);Q.tap('portal');Q.frames(100);out.funnel=Q.row('cartographer').step===1;out.flow=JSON.stringify({p:[G.p.x,G.p.y],mouths:G.cratePortals,pairs:portalPairs().map(p=>[p.a.x,p.a.y,p.b.x,p.b.y]),step:Q.row('cartographer').step});
  for(let guard=0;guard<12&&Q.row('cartographer').step===1;guard++){const ribbon=G.obstacles.find(o=>o.kind==='ribbon');Q.put(ribbon.x,ribbon.y);Q.frames(160);}
  out.ribbon=Q.row('cartographer').step===2;
  Q.put(7050,0);G.p.face=1;Q.swing();out.unlinkedRejected=Q.row('cartographer').step===2;
  Q.put(6800,520);Q.tap('portal');Q.put(7030,0);while(G.time%2.4>0.6)Q.frames(1);Q.swing();
  out.chimes=Q.row('cartographer').phase==='ready';const a=G.obstacles.find(o=>o.sideStory==='cartographer'&&o.sideStoryRole==='actor'),start=a.x;Q.frames(120);out.deskMoves=a.x<start;
  out.rewardOnceNoHealAndReload=Q.finish();return out;});await shot('cartographer');for(const [k,v]of Object.entries(carto))if(typeof v==='boolean')check('Cartographer '+k,v);else console.log(k,v);
 const recruit=await page.evaluate(()=>{const Q=__q,out={};Q.round(4,'recruit');Q.put(6730,340);out.helmet=Q.row('recruit').step===1;
  const a=G.obstacles.find(o=>o.sideStory==='recruit'&&o.sideStoryRole==='actor');Q.put(a.x+20,a.y);Q.frames(10);const x=a.x;Q.frames(60);out.waits=a.x===x;
  for(let guard=0;guard<700&&Q.row('recruit').step===1;guard++){
   const shots=G.projectiles.some(pr=>pr.watchShot&&Math.abs(pr.x-a.x)<260);if(shots)Q.frames(6);else Q.frames(6,{ArrowRight:true});
   if(G.p.x>7050)Q.frames(3,{ArrowLeft:true});
  }
  out.crossing=Q.row('recruit').step===2;out.position=JSON.stringify({p:G.p.x,a:a.x,m:G.sideStoryScene.round2});
  Q.put(7180,0);G.p.face=1;Q.swing();Q.frames(140);Q.put(7440,0);Q.frames(90);out.braced=G.sideStoryScene.round2.braced;out.finished=Q.row('recruit').phase==='ready';out.rewardOnceNoHealAndReload=Q.finish();return out;});await shot('recruit');for(const [k,v]of Object.entries(recruit))if(typeof v==='boolean')check('Recruit '+k,v);else console.log(k,v);
 const quota=await page.evaluate(()=>{const Q=__q,out={};Q.round(9,'quota');Q.put(6760,640);Q.swing();out.tagged=Q.row('quota').step===1;
  Q.frames(220);out.noUnlinkedProgress=Q.row('quota').step===1;Q.tap('portal');Q.frames(220);out.loop=Q.row('quota').step===2;out.detail=JSON.stringify({mouths:G.cratePortals,step:Q.row('quota').step});
  Q.put(7760,640);Q.frames(120);out.caught=G.sideStoryScene.round2.held==='scrap';Q.put(8180,640);Q.frames(30);Q.put(8300,640);Q.frames(180);out.mustHold=Q.row('quota').phase==='active';Q.put(8180,640);Q.frames(180);out.ready=Q.row('quota').phase==='ready';out.rewardOnceNoHealAndReload=Q.finish();return out;});await shot('quota');for(const [k,v]of Object.entries(quota))if(typeof v==='boolean')check('Quota '+k,v);else console.log(k,v);
 const tea=await page.evaluate(()=>{const Q=__q,out={};Q.round(11,'neighbors');Q.put(8850,362);Q.frames(5);out.noUprightCatch=Q.row('neighbors').step===0;Q.tap('flip');
  for(let i=0;i<20&&Q.row('neighbors').step===0;i++){const pot=G.obstacles.find(o=>o.kind==='pot');Q.put(pot.x,414-18-G.p.h);Q.frames(4);}
  out.caught=Q.row('neighbors').step===1;Q.tap('flip');Q.frames(5);out.spills=!G.sideStoryScene.round2.parked&&G.sideStoryScene.round2.held!=='pot';Q.tap('flip');Q.put(8850,414-18-G.p.h);Q.frames(30);
  Q.put(9720,414-18-G.p.h);G.p.face=1;Q.swing();out.parked=G.sideStoryScene.round2.parked;Q.tap('flip');Q.put(9720,180);Q.frames(10);out.cups=Q.row('neighbors').step===2;
  Q.tap('portal');Q.tap('flip');Q.put(9320,474-18-G.p.h);Q.tap('portal');Q.put(9700,414-18-G.p.h);G.p.face=1;Q.swing();Q.frames(120);out.ready=Q.row('neighbors').phase==='ready';out.detail=JSON.stringify({flip:G.gravityFlipped,p:[G.p.x,G.p.y],mouths:G.cratePortals,m:G.sideStoryScene.round2,row:Q.row('neighbors')});out.rewardOnceNoHealAndReload=Q.finish();return out;});await shot('neighbors');for(const [k,v]of Object.entries(tea))if(typeof v==='boolean')check('Tea '+k,v);else console.log(k,v);
 const sailors=await page.evaluate(()=>{const Q=__q,out={};Q.round(16,'sailors');
  // Fixture: the existing harbour has opened. Quest actions below use real hook input and its actual rings.
  Object.assign(G.actTwo,{released:true,docked:true,leg:5,shipOff:0,harbourOff:0,shoveT:9});for(const o of G.obstacles)if(o.actHarbour)o.x=o.fx;for(const o of G.obstacles)if(o.type==='actRing'&&!o.towRing)o.gone=false;
  Q.put(2130,100);Q.tap('hook');Q.frames(25);Q.tap('hook');Q.frames(25);__BF.input.pressed[kbCode('jump')]=true;Q.frames(1,{[kbCode('jump')]:true,ArrowRight:true});Q.frames(40,{[kbCode('jump')]:true,ArrowRight:true});Q.tap('hook');Q.frames(95);
  out.chased=Q.row('sailors').step>=1;out.tension=Q.row('sailors').step===2;out.hook=JSON.stringify({p:[G.p.x,G.p.y],ring:G.p.actHook?.ring?.actId,perch:G.sideStoryScene.round2.perch,step:Q.row('sailors').step});
  Q.frames(1,{ArrowLeft:true});Q.tap('hook');Q.frames(25);Q.tap('hook');Q.frames(25);Q.tap('jump');Q.frames(50);Q.walk(760,100);Q.frames(900);G.p.face=1;Q.swing();Q.frames(10);
  out.descended=Q.row('sailors').phase==='ready';out.follow=JSON.stringify({p:[G.p.x,G.p.y],npc:G.obstacles.filter(o=>o.sideStory==='sailors'&&o.sideStoryRole==='support').map(o=>[o.x,o.y]),queue:G.sideStoryScene.round2.trail.length});out.rewardOnceNoHealAndReload=Q.finish();return out;});await shot('sailors');for(const [k,v]of Object.entries(sailors))if(typeof v==='boolean')check('Sailors '+k,v);else console.log(k,v);
 check('no runtime errors',!errors.filter(e=>!/register/.test(e)).length,errors.join(' | '));
}finally{await close();}
if(failures)process.exitCode=1;else console.log('PASS: five physical Explore quest flows');
