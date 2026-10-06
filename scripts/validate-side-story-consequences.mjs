import { launchChrome } from '../tests/launch-chrome.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const b=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const p=await b.newPage();await p.goto('http://localhost:8371/?story-consequences',{waitUntil:'domcontentloaded'});
 const result=await p.evaluate(()=>{
  const S=BladefallSideStories,W=BladefallSideStoryWorld,rows=[];
  for(const q of S.records){
   beginRun(0,null,{hp:1,dmg:1},{startStage:q.stage,levelSelect:true});
   // Isolate a decision after physical work, instead of the usual immediate refusal path.
   let state=S.reduce(null,q.id,{type:'choice',choice:'short'}).state;
   const n=q.harshAt==='ready'?q.tasks.length:1;
   for(const task of q.tasks.slice(0,n))state=S.reduce(state,q.id,{type:'task',task:task.id,capabilities:['dash','portal-single','portal-pair','wall-jump','downward-strike','gravity-flip','chain-hook','echo']}).state;
   state=S.reduce(state,q.id,{type:'visit'}).state;state=S.reduce(state,q.id,{type:'choice',choice:'harsh'}).state;
   G.sessionSideStories=state;W.apply();loadStage(q.stage);
   const row=S.row(W.state(),q.id),props=G.obstacles.filter(o=>o.sideStory===q.id&&o.sideStoryRole==='task');
   rows.push({id:q.id,phase:row.phase,step:row.step,expectedStep:n,keptSteps:props.filter(o=>o.storyDone).length,rewardHidden:G.obstacles.find(o=>o.sideStoryRole==='reward')?.gone,gateClosed:q.id==='keeper'?!G.obstacles.find(o=>o.sideStoryRole==='gate')?.gone:null});
  }
  beginRun(0,null,{hp:1,dmg:1},{startStage:1,levelSelect:true});
  let state=S.reduce(null,'refuge',{type:'choice',choice:'short'}).state;for(const t of S.byId.refuge.tasks)state=S.reduce(state,'refuge',{type:'task',task:t.id}).state;
  state=S.reduce(state,'refuge',{type:'choice',choice:'finish'}).state;G.sessionSideStories=state;W.apply();
  const presentDuringSupper=!G.obstacles.find(o=>o.sideStoryRole==='actor').gone;loadStage(1);
  const goneOnReturn=G.obstacles.find(o=>o.sideStoryRole==='actor').gone,rewardStillAvailable=!G.obstacles.find(o=>o.sideStoryRole==='reward').gone;
  const fractured=[];for(let stage=21;stage<=40;stage++){loadStage(stage);fractured.push({stage,count:G.obstacles.filter(o=>o.sideStory).length});}
  return {rows,presentDuringSupper,goneOnReturn,rewardStillAvailable,fractured};
 });
 assert.ok(result.rows.length===20&&result.rows.every(r=>r.phase==='harsh'&&r.step===r.expectedStep&&r.keptSteps===r.step&&r.rewardHidden));
 assert.ok(result.rows.find(r=>r.id==='keeper').gateClosed);
 assert.ok(result.presentDuringSupper&&result.goneOnReturn&&result.rewardStillAvailable&&result.fractured.every(r=>r.count===0));
 await writeFile('docs/evidence/side-stories/consequence-validation.json',JSON.stringify({scope:'Explicit partial-work fixtures followed by harsh choice and real stage reload for all 20 stories; refuge timing and all 20 Fractured stages contain no side-story objects.',result},null,2)+'\n');
 console.log('PASS: partial work survives refusals, service door rebolts, refuge departs on return, and Fractured stages have no optional-story objects.');
}finally{await b.close();}
