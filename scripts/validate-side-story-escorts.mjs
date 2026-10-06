import { launchChrome } from '../tests/launch-chrome.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await launchChrome({headless:true,executablePath:process.env.PUPPETEER_EXECUTABLE_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:8371/?escort-validation',{waitUntil:'domcontentloaded'});
 const result=await page.evaluate(()=>{
  const rows=[];
  for(const [id,stage] of [['recruit',4],['miner',15],['defector',2]]){
   beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});
   const S=BladefallSideStories,q=S.byId[id];let s=S.reduce(null,id,{type:'choice',choice:'short'}).state;
   // Start at the local escort checkpoint: retrieval/destruction is covered separately.
   s=S.reduce(s,id,{type:'task',task:q.tasks[0].id,capabilities:['dash']}).state;
   if(id==='defector')s=S.reduce(s,id,{type:'choice',choice:'finish'}).state;
   G.sessionSideStories=s;BladefallSideStoryWorld.apply();G.cartMode=false;mode='play';
   const actor=G.obstacles.find(o=>o.sideStoryRole==='actor'),e=G.sideStoryScene.escort;
   Object.assign(G.p,{x:actor.x,y:actor.y,vx:0,vy:0,onGround:true,invuln:999});
   const keys=__BF.input.keys;
   // An absent player cannot advance the follower.
   G.p.x=actor.x+500;const before=actor.x;for(let i=0;i<90;i++)BladefallSideStoryWorld.update(1/60);
   const waits=before===actor.x;G.p.x=actor.x;
   let frames=0;
   for(;frames<1500&&!e.finished;frames++){
    const distance=e.destination-G.p.x,lead=Math.abs(G.p.x-actor.x);
    keys.ArrowLeft=distance< -12&&lead<100;keys.ArrowRight=distance>12&&lead<100;
    update(1/60);BFKeyboard.clearPressed();
   }
   keys.ArrowLeft=keys.ArrowRight=false;
   rows.push({id,waits,arrived:e.finished,frames,actorX:actor.x,playerX:G.p.x,destination:e.destination,helmetDropped:e.helmetDropped,rescued:BladefallSideStories.row(BladefallSideStoryWorld.state(),id).rescued});
  }
  return rows;
 });
 assert.ok(result.every(r=>r.waits&&r.arrived),JSON.stringify(result));
 assert.ok(result.find(r=>r.id==='recruit').helmetDropped);
 assert.ok(result.find(r=>r.id==='recruit').rescued);
 await writeFile('docs/evidence/side-stories/escort-validation.json',JSON.stringify({scope:'Normal movement from local escort checkpoint. Earlier retrieval/destruction uses a saved-state fixture; no follower teleport or artificial movement.',result},null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
