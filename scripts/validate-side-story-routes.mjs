import { launchChrome } from '../tests/launch-chrome.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage();await page.goto('http://localhost:8371/?story-placement',{waitUntil:'domcontentloaded'});
 const results=await page.evaluate(()=>{
  const rows=[];
  for(const q of BladefallSideStories.records.filter(q=>!['defector','cartographer','ember-pet','automaton','neighbors','figure','miner','sailors','mother','recruit'].includes(q.id))){
   beginRun(0,null,{hp:1,dmg:1},{startStage:q.stage,levelSelect:true});mode='play';
   G.sessionCapabilities=BladefallCapabilities.createState({acquired:BladefallProgression.abilities.map(a=>a.id)});
   const rest=G.zoneRestSite,actor=G.obstacles.find(o=>o.sideStoryRole==='actor');
   Object.assign(G.p,{x:rest.x,y:rest.y||0,vx:0,vy:0,onGround:true,invuln:999});
   const keys=__BF.input.keys,pressed=__BF.input.pressed;let last=-100;
   function walk(target){
    for(let f=0;f<650;f++){
     if(mode==='conversation'){const choice=document.querySelector('#fieldConversation button');if(choice)choice.click();}
     const dx=target.x-G.p.x;keys.ArrowLeft=dx< -8;keys.ArrowRight=dx>8;
     if(G.p.onGround&&target.y>G.p.y+15&&f-last>25){pressed[kbCode('jump')]=true;last=f;}
     keys[kbCode('jump')]=f-last<24;update(1/60);BFKeyboard.clearPressed();
     if(Math.abs(G.p.x-target.x)<(target.task?35:10)&&Math.abs(G.p.y-target.y)<(target.task?30:10)&&G.p.onGround){keys.ArrowLeft=keys.ArrowRight=keys[kbCode('jump')]=false;last=-100;return true;}
    }keys.ArrowLeft=keys.ArrowRight=keys[kbCode('jump')]=false;last=-100;return false;
   }
   const reached=walk(actor),tasks=[];
   if(reached){
    G.sessionSideStories=BladefallSideStories.reduce(null,q.id,{type:'choice',choice:'short'}).state;BladefallSideStoryWorld.apply();
    for(const task of q.tasks){
     const target=G.obstacles.find(o=>o.sideStory===q.id&&o.task===task.id);
     let approach=true;
     if(q.id==='keeper'&&task.id==='lunch')approach=walk({x:actor.baseX,y:actor.baseY});
     // Walk the intermediate ledges instead of attempting a jump straight to the top.
     for(const ledge of G.obstacles.filter(o=>o.sideStory===q.id&&o.sideStoryRole==='step'&&o.y>G.p.y+15&&o.y<target.y).sort((a,b)=>a.y-b.y))approach=walk(ledge)&&approach;
     if(target.y<G.p.y-20){
      const edge={x:actor.baseX,y:actor.baseY};
      edge.x=actor.baseX-75*G.sideStoryScene.base.dir;
      approach=walk(edge)&&approach;
     }
     const arrived=walk(target),candidate=outskirtsInteractionCandidate();
     tasks.push({task:task.id,approach,arrived,selected:candidate?.task||candidate?.sideStoryRole||candidate?.type,position:{x:G.p.x,y:G.p.y},target:{x:target.x,y:target.y}});
     if(!arrived)break;
     beginOutskirtsInteraction();
     if(task.id==='signal')for(const note of ['short','short','short','long','long'])[...document.querySelectorAll('#fieldConversation button')].find(b=>b.textContent==='Ring a '+note+' note.')?.click();
     BladefallConversation.close();
    }
   }
   const returnReached=walk({x:actor.baseX,y:actor.baseY});
   let finished=false,rewardReached=false,rewardSelected=null;
   if(returnReached&&BladefallSideStories.row(BladefallSideStoryWorld.state(),q.id).phase==='ready'){
    beginOutskirtsInteraction();
    const view=BladefallSideStories.view(BladefallSideStoryWorld.state(),q.id),finish=view.choices.find(c=>c.id===(q.resolutions?'finish:keep':'finish'));
    if(finish)[...document.querySelectorAll('#fieldConversation button')].find(b=>b.textContent===finish.label)?.click();
    finished=BladefallSideStories.row(BladefallSideStoryWorld.state(),q.id).phase==='completed';BladefallConversation.close();
    const reward=G.obstacles.find(o=>o.sideStoryRole==='reward');rewardReached=walk(reward);rewardSelected=outskirtsInteractionCandidate()?.sideStoryRole;
    beginOutskirtsInteraction();BladefallConversation.close();
   }
   rows.push({id:q.id,reached,tasks,returnReached,finished,rewardReached,rewardSelected,state:BladefallSideStories.row(BladefallSideStoryWorld.state(),q.id),gate:G.obstacles.find(o=>o.sideStoryRole==='gate')?.gone});
  }return rows;
 });console.log(JSON.stringify(results,null,2));assert.ok(results.length===10&&results.every(r=>r.reached&&r.state.phase==='completed'&&r.state.claimed&&r.returnReached&&r.finished&&r.rewardReached&&r.rewardSelected==='reward'&&r.tasks.every(t=>t.approach&&t.arrived&&t.selected===t.task)),'Every simple quest route must reach its own task through normal interaction selection');
 await writeFile('docs/evidence/side-stories/route-validation.json',JSON.stringify({scope:'Normal movement from regional rest checkpoint through simple quest props; earned capability fixtures. Diagnostic checks ordinary interaction selection.',results},null,2)+'\n');
}finally{await browser.close();}
