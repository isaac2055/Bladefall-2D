import { launchChrome } from '../tests/launch-chrome.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 const page=await browser.newPage();await page.goto('http://localhost:8371/?story-actions',{waitUntil:'domcontentloaded'});
 const results=await page.evaluate(()=>{
  const rows=[];
  for(const [id,stage,task,action] of [['defector',2,'gear','dash'],['automaton',10,'mould','slam'],['neighbors',11,'service','flip']]){
   beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});mode='play';
   G.sessionCapabilities=BladefallCapabilities.createState({acquired:BladefallProgression.abilities.filter(a=>a.order<=12).map(a=>a.id)});
   G.sessionSideStories=BladefallSideStories.reduce(null,id,{type:'choice',choice:'short'}).state;BladefallSideStoryWorld.apply();
   const actor=G.obstacles.find(o=>o.sideStory===id&&o.sideStoryRole==='actor'),target=G.obstacles.find(o=>o.sideStory===id&&o.task===task);
   Object.assign(G.p,{x:actor.x,y:actor.y,vx:0,vy:0,onGround:true,invuln:999});
   const keys=__BF.input.keys,pressed=__BF.input.pressed;let last=-100,reached=false;
   for(let f=0;f<500;f++){
    const dx=target.x-G.p.x;keys.ArrowRight=dx>8;keys.ArrowLeft=dx< -8;
    if(G.p.onGround&&target.y>G.p.y+15&&f-last>25){pressed[kbCode('jump')]=true;last=f;}
    keys[kbCode('jump')]=f-last<24;update(1/60);BFKeyboard.clearPressed();
    if(Math.abs(G.p.x-target.x)<25&&Math.abs(G.p.y-target.y)<10&&G.p.onGround){reached=true;break;}
   }
   keys.ArrowLeft=keys.ArrowRight=keys[kbCode('jump')]=false;
   if(action==='slam'){
    pressed[kbCode('jump')]=true;keys[kbCode('jump')]=true;
    for(let i=0;i<5;i++){update(1/60);BFKeyboard.clearPressed();}
    keys[kbCode('jump')]=false;keys[kbCode('slam')]=true;
   }else pressed[kbCode(action)]=true;
   let activated=false;
   for(let i=0;i<5;i++){update(1/60);BFKeyboard.clearPressed();activated ||= action==='dash'?G.p.dodgeTimer>0:action==='slam'?G.p.slamming:!!G.gravityFlipped;}
   if(action==='flip')beginOutskirtsInteraction(target);
   keys[kbCode('slam')]=false;
   rows.push({id,reached,activated,step:BladefallSideStories.row(BladefallSideStoryWorld.state(),id).step,player:{x:G.p.x,y:G.p.y},target:{x:target.x,y:target.y}});
   BladefallConversation.close();
  }return rows;
 });
 console.log(JSON.stringify(results,null,2));assert.ok(results.every(r=>r.reached&&r.activated&&r.step===1));
 await writeFile('docs/evidence/side-stories/action-validation.json',JSON.stringify({scope:'Earned-capability and local actor checkpoint fixtures; actual walking/jumping, dash, downward-strike and gravity keys. No synthetic action flags.',results},null,2)+'\n');
}finally{await browser.close();}
