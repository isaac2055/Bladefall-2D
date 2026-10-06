import { launchChrome } from '../tests/launch-chrome.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await launchChrome({headless:true,executablePath:process.env.PUPPETEER_EXECUTABLE_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const results=[];
try{
 for(const preview of [false,true]){
  const context=await browser.createBrowserContext(),page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8371/?side-story-saves',{waitUntil:'domcontentloaded'});
  await page.evaluate(preview=>{beginRun(0,null,{hp:1,dmg:1},{startStage:0,levelSelect:preview});const a=G.obstacles.find(o=>o.sideStoryRole==='actor');G.p.x=a.x;G.p.y=a.y;beginOutskirtsInteraction(a);},preview);
  // Use keyboard focus and Enter, not a reducer call, to commit the refusal.
  await page.keyboard.press('Tab');await page.keyboard.press('Tab');await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>BladefallSideStoryWorld.state().quests.gatekeeper.phase),'harsh');
  await page.keyboard.press('Escape');
  await page.evaluate(()=>saveRunAtStage(G.stageIndex,snapOf(G.p)));
  await page.reload({waitUntil:'domcontentloaded'});
  const restored=await page.evaluate(()=>{continueRun();const r=BladefallSideStoryWorld.state().quests.gatekeeper;return {phase:r?.phase,preview:G.levelSelectMode,actor:!!G.obstacles.find(o=>o.sideStoryRole==='actor'),rewardHidden:G.obstacles.find(o=>o.sideStoryRole==='reward')?.gone,soloAffected:!!meta.sideStories?.quests?.gatekeeper};});
  assert.equal(restored.phase,'harsh');assert.equal(restored.preview,preview);assert.equal(restored.actor,true);assert.equal(restored.rewardHidden,true);assert.equal(restored.soloAffected,!preview);assert.deepEqual(errors,[]);
  results.push(restored);await context.close();
 }
 // Physical acquisition is covered by movement checks. These fixtures isolate save/Continue reconstruction.
 for(const preview of [false,true])for(const checkpoint of ['mid-rescue','completed-unclaimed']){
  const context=await browser.createBrowserContext(),page=await context.newPage();
  await page.goto('http://127.0.0.1:8371/?side-story-return',{waitUntil:'domcontentloaded'});
  const expected=await page.evaluate(({preview,checkpoint})=>{
   const S=BladefallSideStories,id=checkpoint==='mid-rescue'?'recruit':'refuge',stage=checkpoint==='mid-rescue'?4:1;
   beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:preview});
   let state=S.reduce(null,id,{type:'choice',choice:'short'}).state;
   state=S.reduce(state,id,{type:'task',task:S.byId[id].tasks[0].id}).state;
   if(id==='recruit')state=S.reduce(state,id,{type:'rescue'}).state;
   else {state=S.reduce(state,id,{type:'task',task:S.byId[id].tasks[1].id}).state;state=S.reduce(state,id,{type:'choice',choice:'finish'}).state;}
   if(preview)G.sessionSideStories=state;else meta.sideStories=state;
   BladefallSideStoryWorld.apply();saveRunAtStage(G.stageIndex,snapOf(G.p));
   return {id,phase:S.row(state,id).phase,step:S.row(state,id).step};
  },{preview,checkpoint});
  await page.reload({waitUntil:'domcontentloaded'});
  const restored=await page.evaluate(id=>{
   continueRun();const row=BladefallSideStories.row(BladefallSideStoryWorld.state(),id);
   return {phase:row.phase,step:row.step,rescued:row.rescued,claimed:row.claimed,actorGone:!!G.obstacles.find(o=>o.sideStoryRole==='actor')?.gone,rewardHidden:!!G.obstacles.find(o=>o.sideStoryRole==='reward')?.gone,rescueDone:!!G.sideStoryScene.rescue?.done,soloAffected:!!meta.sideStories?.quests?.[id]};
  },expected.id);
  assert.equal(restored.phase,expected.phase);assert.equal(restored.step,expected.step);assert.equal(restored.soloAffected,!preview);
  if(checkpoint==='mid-rescue'){assert.ok(restored.rescued&&restored.rescueDone&&!restored.actorGone&&restored.rewardHidden);}
  else {assert.ok(restored.actorGone&&!restored.rewardHidden&&!restored.claimed);}
  results.push({preview,checkpoint,...restored});await context.close();
 }
 await writeFile('docs/evidence/side-stories/save-validation.json',JSON.stringify({scope:'Real keyboard selection, Escape, browser reload and Continue; campaign and isolated level-select refusal persistence; in-progress rescue and completed/unclaimed refuge checkpoint fixtures survive browser reload/Continue.',results},null,2)+'\n');
 console.log('PASS: campaign and preview survive browser reload/Continue; keyboard commits and closes dialogue; preview does not change campaign.');
}finally{await browser.close();}
