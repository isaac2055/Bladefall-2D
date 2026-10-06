import { launchChrome } from '../tests/launch-chrome.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage();await page.goto('http://localhost:8371/?puzzle-loops',{waitUntil:'domcontentloaded'});
 const results=await page.evaluate(()=>{
  const rows=[],S=BladefallSideStories,W=BladefallSideStoryWorld;
  for(const [id,stage,order] of [['cartographer',3,4],['ember-pet',8,8],['neighbors',11,12],['figure',12,12]]){
   beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});mode='play';
   G.sessionCapabilities=BladefallCapabilities.createState({acquired:BladefallProgression.abilities.filter(a=>a.order<=order).map(a=>a.id)});
   if(id==='figure')G.sessionClearedZones=['void-tyrant'];
   const movementTrace=[];const rest=G.zoneRestSite,actor=G.obstacles.find(o=>o.sideStoryRole==='actor'),keys=__BF.input.keys,pressed=__BF.input.pressed;
   Object.assign(G.p,{x:rest.x,y:rest.y||0,vx:0,vy:0,onGround:true,invuln:999});
   const tick=()=>{if(mode==='conversation')document.querySelector('#fieldConversation button')?.click();update(1/60);BFKeyboard.clearPressed();};
   const press=name=>{pressed[kbCode(name)]=true;tick();};
   function walk(target){let last=-100;for(let f=0;f<700;f++){
    const dx=target.x-G.p.x;keys.ArrowLeft=dx< -5;keys.ArrowRight=dx>5;
    if(G.p.onGround&&target.y>G.p.y+15&&f-last>25){pressed[kbCode('jump')]=true;last=f;}
    keys[kbCode('jump')]=f-last<24;tick();if(id==='figure'&&target.x===4430&&f<45&&f%5===0)movementTrace.push({f,x:G.p.x,y:G.p.y,ground:G.p.onGround,jumps:G.p.jumps,vy:G.p.vy,jumpHeld:keys[kbCode('jump')],mode});
    if(Math.abs(G.p.x-target.x)<10&&Math.abs(G.p.y-target.y)<15&&G.p.onGround){keys.ArrowLeft=keys.ArrowRight=keys[kbCode('jump')]=false;return true;}
   }keys.ArrowLeft=keys.ArrowRight=keys[kbCode('jump')]=false;return false;}
   const choose=choice=>{const c=S.view(W.state(),id).choices.find(c=>c.id===choice);if(!c)return false;const b=[...document.querySelectorAll('#fieldConversation button')].find(b=>b.textContent===c.label);b?.click();return !!b;};
   const use=()=>{beginOutskirtsInteraction();BladefallConversation.close();};
   const actorReached=walk(actor);beginOutskirtsInteraction();const accepted=choose('short');choose('leave');let puzzle=true;const trace=[];
   const task=name=>G.obstacles.find(o=>o.sideStory===id&&o.task===name);
   if(id==='figure'){
    const padReached=walk(G.sideStoryScene.echoPad);puzzle=padReached&&puzzle;trace.push({padReached,x:G.p.x,y:G.p.y});press('echo');
    const midReached=walk({x:actor.baseX+190,y:actor.baseY+112});puzzle=midReached&&puzzle;trace.push({midReached,x:G.p.x,y:G.p.y});const releaseReached=walk(task('release'));puzzle=releaseReached&&puzzle;trace.push({releaseReached,x:G.p.x,y:G.p.y,echo:!!echoStanding(),candidate:outskirtsInteractionCandidate()?.task});use();
   }else{
    if(id==='neighbors'){
     puzzle=walk(task('service'))&&puzzle;press('flip');for(let i=0;i<4;i++)tick();use();press('flip');for(let i=0;i<12;i++)tick();
     puzzle=walk({x:actor.baseX+75,y:actor.baseY})&&puzzle;
    }
    puzzle=walk(G.sideStoryScene.flowSource)&&puzzle;press('portal');
    const target=task(id==='cartographer'?'funnel':id==='ember-pet'?'frost':'tables');puzzle=walk(target)&&puzzle;if(id!=='cartographer')press('portal');use();
    if(id==='cartographer'){puzzle=walk(task('chimes'))&&puzzle;use();}
    press('portal');
   }
   const tasksBeforeReturn=S.row(W.state(),id).step;
   const descended=walk({x:actor.baseX-(id==='figure'?25:75)*G.sideStoryScene.base.dir,y:actor.baseY});
   if(id==='ember-pet'){puzzle=walk(task('settle'))&&puzzle;use();}
   const returned=walk(actor);const candidate=outskirtsInteractionCandidate();trace.push({returned,x:G.p.x,y:G.p.y,candidate:{type:candidate?.type,profile:candidate?.profileId,role:candidate?.sideStoryRole}});beginOutskirtsInteraction();const finished=choose('finish');choose('leave');
   const reward=G.obstacles.find(o=>o.sideStoryRole==='reward'),rewardReached=walk(reward);use();
   rows.push({id,movementTrace,trace,actorReached,accepted,puzzle,tasksBeforeReturn,descended,returned,finished,rewardReached,claimed:S.row(W.state(),id).claimed,phase:S.row(W.state(),id).phase,position:{x:G.p.x,y:G.p.y},portals:G.cratePortals.length});
  }return rows;
 });console.log(JSON.stringify(results,null,2));assert.ok(results.every(r=>r.actorReached&&r.accepted&&r.puzzle&&r.descended&&r.returned&&r.finished&&r.rewardReached&&r.claimed));
 await writeFile('docs/evidence/side-stories/puzzle-loop-validation.json',JSON.stringify({scope:'Continuous portal/gravity/Echo quest loops from regional rest to actual dialogue and reward, ordinary interaction selection. Initial earned-ability and post-Tyrant fixture only; no intermediate teleports or quest-state fixtures.',results},null,2)+'\n');
}finally{await browser.close();}
