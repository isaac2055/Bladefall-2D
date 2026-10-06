import { launchChrome } from '../tests/launch-chrome.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage();await page.goto('http://localhost:8371/?story-transport',{waitUntil:'domcontentloaded'});
 const result=await page.evaluate(()=>{
  const S=BladefallSideStories,W=BladefallSideStoryWorld,keys=__BF.input.keys,pressed=__BF.input.pressed;
  const tick=()=>{update(1/60);BFKeyboard.clearPressed();};
  beginRun(0,null,{hp:1,dmg:1},{startStage:15,levelSelect:true});mode='play';
  let actor=G.obstacles.find(o=>o.sideStoryRole==='actor');
  Object.assign(G.p,{x:actor.x,y:actor.y,vx:0,vy:0,onGround:true,invuln:999});
  const wasRiding=G.cartMode;beginOutskirtsInteraction(actor);const parked=!G.cartMode;
  G.sessionSideStories=S.reduce(null,'miner',{type:'choice',choice:'short'}).state;W.apply();BladefallConversation.close();
  const hoist=G.obstacles.find(o=>o.sideStory==='miner'&&o.task==='hoist'),cart=G.obstacles.find(o=>o.sideStoryRole==='cart'),cartStart=cart.x;
  let frames=0;for(;frames<600&&Math.abs(cart.x-hoist.x)>40;frames++){keys.ArrowRight=true;tick();}keys.ArrowRight=false;
  beginOutskirtsInteraction(hoist);const raised=S.row(W.state(),'miner').step===1;BladefallConversation.close();
  const escort=G.sideStoryScene.escort;
  for(let f=0;f<1500&&!escort.finished;f++){
   const dx=escort.destination-G.p.x,near=Math.abs(G.p.x-actor.x)<100,towardActor=Math.sign(dx)===Math.sign(actor.x-G.p.x);keys.ArrowLeft=dx< -12&&(near||towardActor);keys.ArrowRight=dx>12&&(near||towardActor);tick();
  }keys.ArrowLeft=keys.ArrowRight=false;
  const ledger=G.obstacles.find(o=>o.sideStory==='miner'&&o.task==='ledger');beginOutskirtsInteraction(ledger);BladefallConversation.close();
  const ready=S.row(W.state(),'miner').phase==='ready';
  for(let f=0;f<500&&!G.cartMode;f++){keys.ArrowLeft=true;tick();}keys.ArrowLeft=false;
  const miner={wasRiding,parked,pushed:cart.x-cartStart,frames,raised,arrived:escort.finished,ready,resumed:G.cartMode,player:{x:G.p.x,y:G.p.y},hoist:{x:hoist.x,y:hoist.y}};
  beginRun(0,null,{hp:1,dmg:1},{startStage:16,levelSelect:true});mode='play';
  G.sessionCapabilities=BladefallCapabilities.createState({acquired:BladefallProgression.abilities.filter(a=>a.order<=13).map(a=>a.id)});
  G.sessionSideStories=S.reduce(null,'sailors',{type:'choice',choice:'short'}).state;W.apply();
  actor=G.obstacles.find(o=>o.sideStoryRole==='actor');Object.assign(G.p,{x:actor.x,y:actor.y,vx:0,vy:0,onGround:true,invuln:999});
  pressed[kbCode('hook')]=true;tick();for(let f=0;f<90;f++)tick();
  const charm=G.obstacles.find(o=>o.sideStory==='sailors'&&o.task==='charm');
  beginOutskirtsInteraction(charm);const recovered=S.row(W.state(),'sailors').step===1;BladefallConversation.close();
  const sailors={hooked:!!G.sideStoryScene.hooked,recovered,player:{x:G.p.x,y:G.p.y},target:{x:charm.x,y:charm.y}};
  // Start at the authored harbour wake event, then let the real ship update move every object.
  G.actTwo.docked=true;G.actTwo.shoveT=.0001;
  const baseBefore=G.sideStoryScene.base.x,actorBefore=actor.x;
  for(let f=0;f<140;f++)tick();W.apply();
  sailors.shipShift=G.sideStoryScene.base.x-baseBefore;
  sailors.actorShift=actor.x-actorBefore;
  const support=G.obstacles.find(o=>o.supportKind==='sailor');
  sailors.supportOffset=support.x-G.sideStoryScene.base.x;
  sailors.hookOffset=G.obstacles.find(o=>o.sideStoryRole==='hook').x-G.sideStoryScene.base.x;
  return {miner,sailors};
 });console.log(JSON.stringify(result,null,2));
 assert.ok(result.miner.wasRiding&&result.miner.parked&&result.miner.pushed>50&&result.miner.raised&&result.miner.arrived&&result.miner.ready&&result.miner.resumed);
 assert.ok(result.sailors.hooked&&result.sailors.recovered);
 assert.ok(Math.abs(result.sailors.shipShift)>100&&Math.abs(result.sailors.actorShift-result.sailors.shipShift)<1&&Math.abs(result.sailors.supportOffset-45)<1&&Math.abs(result.sailors.hookOffset-100)<1);
 await writeFile('docs/evidence/side-stories/transport-validation.json',JSON.stringify({scope:'Local checkpoint and earned Chainhook fixtures. Actual cart pushing, follower movement, cart resume and Chainhook input; real ship drift from a harbour-wake event fixture.',result},null,2)+'\n');
}finally{await browser.close();}
