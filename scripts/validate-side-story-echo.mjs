import { launchChrome } from '../tests/launch-chrome.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const b=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
const page=await b.newPage();await page.goto('http://localhost:8371/?echo-story-test',{waitUntil:'domcontentloaded'});
const result=await page.evaluate(()=>{
 beginRun(0,null,{hp:1,dmg:1},{startStage:12,levelSelect:true});mode='play';const lockedBefore= !echoVerbAvailable();
 // Post-Tyrant return fixture, not an unearned ability in the first encounter.
 G.sessionClearedZones=['void-tyrant'];const availableAfter=echoVerbAvailable();
 G.sessionSideStories=BladefallSideStories.reduce(null,'figure',{type:'choice',choice:'short'}).state;BladefallSideStoryWorld.apply();
 const actor=G.obstacles.find(o=>o.sideStoryRole==='actor');Object.assign(G.p,{x:actor.x,y:actor.y,vx:0,vy:0,onGround:true,invuln:999});
 const keys=__BF.input.keys,pressed=__BF.input.pressed,jump=kbCode('jump');
 function drive(target){let last=-100;for(let f=0;f<500;f++){
  const dx=target.x-G.p.x;keys.ArrowLeft=dx< -8;keys.ArrowRight=dx>8;
  if(G.p.onGround&&f-last>25&&target.y>G.p.y+15){pressed[jump]=true;last=f;}
  keys[jump]=f-last<24;update(1/60);BFKeyboard.clearPressed();
  if(Math.abs(G.p.x-target.x)<10&&Math.abs(G.p.y-target.y)<10&&G.p.onGround){keys.ArrowLeft=keys.ArrowRight=keys[jump]=false;return f;}
 }keys.ArrowLeft=keys.ArrowRight=keys[jump]=false;return -1;}
 const pad=G.sideStoryScene.echoPad,release=G.obstacles.find(o=>o.task==='release'&&o.sideStory==='figure');
 const first=drive(pad);pressed[kbCode('echo')]=true;update(1/60);BFKeyboard.clearPressed();
 const echoPlaced=!!echoStanding();const middle=drive({x:actor.baseX+190,y:actor.baseY+112}),last=drive(release);
 const echoAlive=!!echoStanding();beginOutskirtsInteraction(release);
 return {lockedBefore,availableAfter,first,middle,last,echoPlaced,echoAlive,step:BladefallSideStories.row(BladefallSideStoryWorld.state(),'figure').step,x:G.p.x,y:G.p.y,dialogue:document.getElementById('fieldConversation')?.innerText};
});console.log(JSON.stringify(result,null,2));
assert.ok(result.lockedBefore&&result.availableAfter&&result.echoPlaced&&result.echoAlive&&result.first>=0&&result.middle>=0&&result.last>=0&&result.step===1);
await writeFile('docs/evidence/side-stories/echo-validation.json',JSON.stringify({scope:'Local approach, jumping, actual Echo key and release on a post-Tyrant return fixture; no teleport between contacts or synthetic Echo body.',result},null,2)+'\n');
}finally{await b.close();}
