import { launchChrome } from '../tests/launch-chrome.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage();await page.goto('http://localhost:8371/?story-placement',{waitUntil:'domcontentloaded'});
 const results=await page.evaluate(()=>{
  const rows=[];
  for(const q of BladefallSideStories.records){
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
     if(Math.abs(G.p.x-target.x)<35&&Math.abs(G.p.y-target.y)<30){keys.ArrowLeft=keys.ArrowRight=keys[kbCode('jump')]=false;last=-100;return true;}
    }keys.ArrowLeft=keys.ArrowRight=keys[kbCode('jump')]=false;last=-100;return false;
   }
   const reached=walk(actor),position={x:G.p.x,y:G.p.y};
   rows.push({id:q.id,stage:q.stage,rest:{x:rest.x,y:rest.y},actor:{x:actor.x,y:actor.y},reached,position,mode,dialogue:document.getElementById('fieldConversation')?.innerText,nearbyWalls:G.obstacles.filter(o=>o.type==='wall'&&!o.gone&&Math.abs(o.x-actor.x)<300).map(o=>({x:o.x,y:o.y,w:o.w,h:o.h}))});
  }return rows;
 });console.log(JSON.stringify(results,null,2));assert.ok(results.every(r=>r.reached),'Every actor must be reachable from the regional rest checkpoint');
 await writeFile('docs/evidence/side-stories/placement-validation.json',JSON.stringify({scope:'Movement from each existing regional rest checkpoint to the optional actor. Earned-capability fixtures; approach diagnostic, not full campaign traversal.',results},null,2)+'\n');
}finally{await browser.close();}
