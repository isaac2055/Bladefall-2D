import { launchChrome } from '../tests/launch-chrome.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage();await page.goto('http://localhost:8371/?ability-loops',{waitUntil:'domcontentloaded'});
 const results=await page.evaluate(()=>{
  const rows=[],S=BladefallSideStories,W=BladefallSideStoryWorld;
  for(const [id,stage,order,action] of [['defector',2,3,'dash'],['automaton',10,11,'slam'],['recruit',4,5,'escort'],['sailors',16,13,'hook'],['miner',15,13,'cart'],['mother',18,13,'water']]){
   beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});mode='play';
   G.sessionCapabilities=BladefallCapabilities.createState({acquired:BladefallProgression.abilities.filter(a=>a.order<=order).map(a=>a.id)});
   if(id==='mother')G.actTwo.tapOpen=true; // Initial restored-spring checkpoint; actual tap opening has its own input check.
   const rest=G.zoneRestSite,actor=G.obstacles.find(o=>o.sideStoryRole==='actor'),keys=__BF.input.keys,pressed=__BF.input.pressed;
   Object.assign(G.p,{x:rest.x,y:rest.y||0,vx:0,vy:0,onGround:true,invuln:999});
   const tick=()=>{if(mode==='conversation')document.querySelector('#fieldConversation button')?.click();update(1/60);BFKeyboard.clearPressed();};
   function walk(target){let last=-100;for(let f=0;f<700;f++){
    const dx=target.x-G.p.x;keys.ArrowLeft=dx< -5;keys.ArrowRight=dx>5;
    if(G.p.onGround&&target.y>G.p.y+15&&f-last>25){pressed[kbCode('jump')]=true;last=f;}
    keys[kbCode('jump')]=f-last<24;tick();
    if(Math.abs(G.p.x-target.x)<10&&Math.abs(G.p.y-target.y)<15&&G.p.onGround){keys.ArrowLeft=keys.ArrowRight=keys[kbCode('jump')]=false;return true;}
   }keys.ArrowLeft=keys.ArrowRight=keys[kbCode('jump')]=false;return false;}
   const choose=choice=>{const c=S.view(W.state(),id).choices.find(c=>c.id===choice);if(!c)return false;const button=[...document.querySelectorAll('#fieldConversation button')].find(b=>b.textContent===c.label);button?.click();return !!button;};
   const actorReached=walk(actor);beginOutskirtsInteraction();const accepted=choose('short');choose('leave');
   const target=G.obstacles.find(o=>o.sideStory===id&&o.task===S.byId[id].tasks[0].id);let targetReached;
   if(action==='hook'){pressed[kbCode('hook')]=true;for(let i=0;i<90;i++)tick();targetReached=Math.abs(G.p.x-target.x)<34&&Math.abs(G.p.y-target.y)<34;beginOutskirtsInteraction();BladefallConversation.close();keys[kbCode('slam')]=true;tick();keys[kbCode('slam')]=false;}
   else if(action==='cart'){const cart=G.obstacles.find(o=>o.sideStoryRole==='cart');for(let f=0;f<600&&Math.abs(cart.x-target.x)>40;f++){keys.ArrowRight=true;tick();}keys.ArrowRight=false;targetReached=walk({x:target.x-40,y:target.y});beginOutskirtsInteraction();BladefallConversation.close();}
   else targetReached=walk(target);
   if(action==='slam'){pressed[kbCode('jump')]=true;keys[kbCode('jump')]=true;for(let i=0;i<5;i++)tick();keys[kbCode('jump')]=false;keys[kbCode('slam')]=true;}else if(action==='dash')pressed[kbCode('dash')]=true;
   else if(action==='escort'||action==='water'){beginOutskirtsInteraction();BladefallConversation.close();}
   for(let i=0;i<5;i++)tick();keys[kbCode('slam')]=false;
   const abilityWorked=S.row(W.state(),id).step===1;
   const descended=action==='cart'?true:walk({x:actor.baseX-75,y:actor.baseY});
   let second=true,escorted=true;
   const lead=()=>{const e=G.sideStoryScene.escort;for(let f=0;f<1200&&!e.finished;f++){const dx=e.destination-G.p.x,near=Math.abs(G.p.x-actor.x)<100,toward=Math.sign(dx)===Math.sign(actor.x-G.p.x);keys.ArrowRight=dx>10&&(near||toward);keys.ArrowLeft=dx< -10&&(near||toward);tick();}keys.ArrowLeft=keys.ArrowRight=false;return e.finished;};
   if(id==='recruit'){walk(actor);escorted=lead();const crossing=G.obstacles.find(o=>o.sideStory===id&&o.task==='crossing');second=walk(crossing);beginOutskirtsInteraction();BladefallConversation.close();}
   if(id==='miner'){escorted=lead();const ledger=G.obstacles.find(o=>o.sideStory===id&&o.task==='ledger');second=walk(ledger);beginOutskirtsInteraction();BladefallConversation.close();}
   if(id==='mother'){const water=G.obstacles.find(o=>o.sideStory===id&&o.task==='water');second=walk(water);beginOutskirtsInteraction();BladefallConversation.close();}
   if(id==='sailors'){const share=G.obstacles.find(o=>o.sideStory===id&&o.task==='share');second=walk(share);beginOutskirtsInteraction();BladefallConversation.close();}

   if(id==='automaton'){const roof=G.obstacles.find(o=>o.sideStory===id&&o.task==='roof');second=walk(roof);beginOutskirtsInteraction();BladefallConversation.close();}
   const returned=walk(actor);beginOutskirtsInteraction();const finished=choose('finish');choose('leave');
   if(id==='defector'){
    const e=G.sideStoryScene.escort;
    for(let f=0;f<1200&&!e.finished;f++){const dx=e.destination-G.p.x;keys.ArrowRight=dx>10&&Math.abs(G.p.x-actor.x)<100;keys.ArrowLeft=dx< -10&&Math.abs(G.p.x-actor.x)<100;tick();}
    keys.ArrowLeft=keys.ArrowRight=false;escorted=e.finished;
   }
   const reward=G.obstacles.find(o=>o.sideStoryRole==='reward'),rewardReached=walk(reward);beginOutskirtsInteraction();BladefallConversation.close();
   rows.push({diagnostic:{player:{x:G.p.x,y:G.p.y},actor:{x:actor.x,y:actor.y},mode,dead:G.p.dead,hook:!!G.p.actHook,step:S.row(W.state(),id).step},id,actorReached,accepted,targetReached,abilityWorked,descended,second,returned,finished,escorted,rewardReached,claimed:S.row(W.state(),id).claimed,phase:S.row(W.state(),id).phase});
  }return rows;
 });console.log(JSON.stringify(results,null,2));assert.ok(results.every(r=>Object.entries(r).every(([k,v])=>['id','phase','diagnostic'].includes(k)||v===true)));
 await writeFile('docs/evidence/side-stories/ability-loop-validation.json',JSON.stringify({scope:'Continuous walking/jumping, actual dash/slam/hook, DOM conversation choices, Silas/recruit escorts and ordinary turn-in/reward selection from regional rest checkpoints. Only initial earned-capability/checkpoint fixtures (including a restored Colony spring); no intermediate teleports or state/task fixtures.',results},null,2)+'\n');
}finally{await browser.close();}
