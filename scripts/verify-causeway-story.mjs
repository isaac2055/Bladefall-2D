import assert from 'node:assert/strict';
import {launchChrome} from '../tests/launch-chrome.mjs';
import {writeFile} from 'node:fs/promises';
const b=await launchChrome({headless:true});try{const page=await b.newPage();await page.goto('http://localhost:8371/');await page.waitForFunction(()=>window.__BF);await page.setViewport({width:1200,height:800});
const result=await page.evaluate(()=>{
 beginRun(0,null,{hp:1,dmg:1},{startStage:2,levelSelect:true});mode='play';meta.testMode=false;G.stageBanner=0;
 const S=BladefallSideStories,scene=G.sideStoryScene,p=G.p;G.sessionSideStories=S.reduce(G.sessionSideStories,'defector',{type:'choice',choice:'short'}).state;BladefallSideStoryWorld.apply();
 Object.assign(p,{x:10730,y:130,vx:0,vy:0,onGround:true,jumps:0});const keys=__BF.input.keys,pressed=__BF.input.pressed,legs=[];let age=100;
 function walk(x,y){
  let pass=false;const trace=[];
  for(let i=0;i<900;i++){
   const dx=x-p.x;keys.ArrowRight=dx>8;keys.ArrowLeft=dx< -8;
   const lift=p.floorPlat?.earlyCarrier?p.floorPlat:null;
   let jump=p.onGround&&age>25&&((y>p.y+20&&Math.abs(dx)<180)||G.obstacles.some(o=>o.type==='wall'&&!o.gone&&o.y>p.y+10&&o.y<p.y+80&&Math.abs(o.x-p.x)<90&&Math.sign(o.x-p.x)===Math.sign(dx)));
   if(p.onGround&&age>25&&Math.abs(dx)>55){const ahead=p.x+Math.sign(dx)*46;if(!G.obstacles.some(o=>o.type==='plat'&&!o.gone&&Math.abs(o.y-p.y)<12&&Math.abs(o.x-ahead)<o.w/2))jump=true;}
   if(x===11240&&p.x<10925&&!lift){keys.ArrowRight=p.x<10875;keys.ArrowLeft=p.x>10890;jump=false;}
   if(lift){keys.ArrowRight=keys.ArrowLeft=false;jump=lift.charged&&Math.abs(lift.x-lift.toX)<30&&age>25;if(jump)keys.ArrowRight=true;}
   if(jump){pressed[kbCode('jump')]=true;age=0;}keys[kbCode('jump')]=age++<22;
   keys[kbCode('attack')]=Math.abs(p.x-11240)<60&&Math.abs(p.y+20-235)<55&&S.row(G.sessionSideStories,'defector').step===1;
   update(1/60);BFKeyboard.clearPressed();if(mode==='conversation')BladefallConversation.close();
   if(i%100===0)trace.push({i,x:p.x,y:p.y,step:S.row(G.sessionSideStories,'defector').step});
   if(Math.abs(p.x-x)<27&&Math.abs(p.y-y)<18&&p.onGround){pass=true;break;}
  }
  keys.ArrowRight=keys.ArrowLeft=keys[kbCode('jump')]=keys[kbCode('attack')]=false;legs.push({x,y,pass,trace:pass?undefined:trace});return pass;
 }
 function use(task){BladefallSideStoryWorld.interact(G.obstacles.find(o=>o.task===task&&o.sideStory==='defector'));BladefallConversation.close();}
 let ok=walk(10790,130);if(ok)use('brake');if(ok)ok=walk(10880,130);if(ok)ok=walk(11240,195);
 if(ok){for(let i=0;i<30;i++){keys[kbCode('attack')]=i<6;update(1/60);BFKeyboard.clearPressed();}keys[kbCode('attack')]=false;}
 if(ok)ok=walk(10887,130);if(ok)use('gate');if(ok)ok=walk(10730,130);
 return {ok,phase:S.row(G.sessionSideStories,'defector').phase,step:S.row(G.sessionSideStories,'defector').step,used:G.earlyPlatforming.used,legs,position:{x:p.x,y:p.y}};
});console.log(JSON.stringify(result));await writeFile('docs/charters/early-platforming/evidence/silas-route.json',JSON.stringify(result,null,2));await page.screenshot({path:'docs/charters/early-platforming/evidence/silas.png'});assert.ok(result.ok);assert.equal(result.phase,'ready');
const outcome=await page.evaluate(()=>{
 const S=BladefallSideStories;G.sessionSideStories=S.reduce(G.sessionSideStories,'defector',{type:'choice',choice:'finish'}).state;BladefallSideStoryWorld.apply();
 const actor=G.obstacles.find(o=>o.sideStory==='defector'&&o.sideStoryRole==='actor'),before=actor.x;
 G.p.x=10865;G.p.y=130;G.p.vx=G.p.vy=0;
 for(let i=0;i<240;i++){update(1/60);BFKeyboard.clearPressed();}
 return {before,after:actor.x,finished:G.sideStoryScene.escort.finished,stopped:actor.governorStopped,gateGone:G.obstacles.find(o=>o.sideStoryRole==='patrolFence').gone};
});assert.ok(outcome.after>outcome.before);assert.ok(outcome.finished&&outcome.stopped&&outcome.gateGone);console.log(JSON.stringify({outcome}));

}finally{await b.close();}
