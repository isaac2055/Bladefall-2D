import { launchChrome } from '../tests/launch-chrome.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage();await page.goto('http://localhost:8371/?story-water',{waitUntil:'domcontentloaded'});
 const result=await page.evaluate(()=>{
  beginRun(0,null,{hp:1,dmg:1},{startStage:18,levelSelect:true});mode='play';
  G.sessionCapabilities=BladefallCapabilities.createState({acquired:BladefallProgression.abilities.map(a=>a.id)});
  const S=BladefallSideStories,W=BladefallSideStoryWorld;
  let state=S.reduce(null,'mother',{type:'choice',choice:'short'}).state;state=S.reduce(state,'mother',{type:'task',task:'cup'}).state;G.sessionSideStories=state;W.apply();
  const tap=G.obstacles.find(o=>o.type==='actTap'),water=G.obstacles.find(o=>o.sideStory==='mother'&&o.task==='water');
  Object.assign(G.p,{x:water.x,y:water.y,vx:0,vy:0,onGround:true,invuln:999});beginOutskirtsInteraction();
  const blocked=S.row(W.state(),'mother').step===1;BladefallConversation.close();
  // Existing conduit checkpoint: use the actual jump/downward-strike input to open its tap.
  Object.assign(G.p,{x:tap.x,y:tap.y,vx:0,vy:0,onGround:true,invuln:999});
  const keys=__BF.input.keys,pressed=__BF.input.pressed;
  pressed[kbCode('jump')]=true;keys[kbCode('jump')]=true;
  for(let i=0;i<5;i++){update(1/60);BFKeyboard.clearPressed();}
  keys[kbCode('jump')]=false;keys[kbCode('slam')]=true;
  for(let i=0;i<10;i++){update(1/60);BFKeyboard.clearPressed();}keys[kbCode('slam')]=false;
  const tapOpened=!!G.actTwo.tapOpen;
  // Return checkpoint beside Sable; check ordinary target selection, not a forced prop reference.
  Object.assign(G.p,{x:water.x,y:water.y,vx:0,vy:0,onGround:true,invuln:999});
  for(let i=0;i<180;i++){
   if(mode==='conversation')document.querySelector('#fieldConversation button')?.click();
   update(1/60);BFKeyboard.clearPressed();
  }
  if(mode==='conversation')BladefallConversation.close();
  const candidate=outskirtsInteractionCandidate();beginOutskirtsInteraction();
  return {blocked,tapOpened,target:candidate?.task,step:S.row(W.state(),'mother').step,phase:S.row(W.state(),'mother').phase};
 });console.log(result);assert.ok(result.blocked&&result.tapOpened&&result.target==='water'&&result.step===2&&result.phase==='ready');
 await writeFile('docs/evidence/side-stories/water-validation.json',JSON.stringify({scope:'Cup-completed and local conduit/return checkpoint fixtures. Actual jump/slam opens existing tap; ordinary interaction selection beside Sable completes the optional water task.',result},null,2)+'\n');
}finally{await browser.close();}
