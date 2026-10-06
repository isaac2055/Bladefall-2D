import { launchChrome } from '../tests/launch-chrome.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const b=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const p=await b.newPage();await p.goto('http://localhost:8371/?story-recovery',{waitUntil:'domcontentloaded'});
 const results=await p.evaluate(()=>{
  const rows=[];
  for(const preview of [false,true]){
   beginRun(0,null,{hp:1,dmg:1},{startStage:4,levelSelect:preview});mode='play';meta.hardcore=false;
   const S=BladefallSideStories,W=BladefallSideStoryWorld;
   let state=S.reduce(null,'recruit',{type:'choice',choice:'short'}).state;state=S.reduce(state,'recruit',{type:'task',task:'helmet'}).state;state=S.reduce(state,'recruit',{type:'rescue'}).state;
   if(preview)G.sessionSideStories=state;else meta.sideStories=state;W.apply();
   let actor=G.obstacles.find(o=>o.sideStoryRole==='actor');Object.assign(G.p,{x:actor.x,y:actor.y,vx:0,vy:0,onGround:true});
   G.checkpointCharge=1;const placed=placeEarnedCheckpoint();G.p.dead=true;die();
   actor=G.obstacles.find(o=>o.sideStoryRole==='actor');const restored=S.row(W.state(),'recruit'),escort=G.sideStoryScene.escort;
   const keys=__BF.input.keys;G.p.invuln=999;
   for(let i=0;i<1500&&!escort.finished;i++){
    const dx=escort.destination-G.p.x,lead=Math.abs(G.p.x-actor.x);
    keys.ArrowLeft=dx< -12&&lead<100;keys.ArrowRight=dx>12&&lead<100;update(1/60);BFKeyboard.clearPressed();
   }keys.ArrowLeft=keys.ArrowRight=false;
   meta.outskirtsFieldChart=false;openPause();const journalButton=!!document.getElementById('questBtn');document.getElementById('questBtn')?.click();const journalShowsObjective=document.getElementById('overlay').innerText.includes(S.journal(W.state()).find(q=>q.id==='recruit').objective);
   rows.push({preview,journalButton,journalShowsObjective,placed,stage:G.stageIndex,alive:!G.p.dead,phase:restored.phase,step:restored.step,rescued:restored.rescued,rescueDone:G.sideStoryScene.rescue.done,arrived:escort.finished});
  }return rows;
 });console.log(results);assert.ok(results.every(r=>r.journalButton&&r.journalShowsObjective&&r.placed&&r.stage===4&&r.alive&&r.phase==='active'&&r.step===1&&r.rescued&&r.rescueDone&&r.arrived));
 await writeFile('docs/evidence/side-stories/recovery-validation.json',JSON.stringify({scope:'Mid-rescue saved-state fixture; real checkpoint placement, death recovery and normal movement completing the restored escort in campaign and preview.',results},null,2)+'\n');
}finally{await b.close();}
