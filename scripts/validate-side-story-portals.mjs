import { launchChrome } from '../tests/launch-chrome.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
const page=await browser.newPage();await page.goto('http://127.0.0.1:8371/?portal-probe',{waitUntil:'domcontentloaded'});
const results=await page.evaluate(()=>{
 const rows=[];
 for(const [id,stage] of [['cartographer',3],['ember-pet',8],['neighbors',11]]){
  beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});mode='play';
  const acquired=BladefallProgression.abilities.filter(a=>a.order<=(stage===3?4:stage===8?8:12)).map(a=>a.id);
  G.sessionCapabilities=BladefallCapabilities.createState({acquired});
  const S=BladefallSideStories;let st=S.reduce(null,id,{type:'choice',choice:'short'}).state;
  if(id==='neighbors')st=S.reduce(st,id,{type:'task',task:'service',capabilities:['gravity-flip']}).state;
  G.sessionSideStories=st;BladefallSideStoryWorld.apply();
  const source=G.sideStoryScene.flowSource,target=G.obstacles.find(o=>o.sideStory===id&&o.task===(id==='cartographer'?'funnel':id==='ember-pet'?'frost':'tables'));
  Object.assign(G.p,{x:source.x,y:source.y,vx:0,vy:0,onGround:true,invuln:999});
  const keys=__BF.input.keys,pressed=__BF.input.pressed;
  const press=name=>{pressed[kbCode(name)]=true;update(1/60);BFKeyboard.clearPressed();};
  for(let i=0;i<5;i++)update(1/60);press('portal');
  const first=G.cratePortals.map(m=>({x:m.x,y:m.y}));
  let lastJump=-100,reached=false;
  for(let f=0;f<650;f++){
   const dx=target.x-G.p.x;keys.ArrowRight=dx>8;keys.ArrowLeft=dx< -8;
   if(G.p.onGround&&target.y>G.p.y+20&&f-lastJump>25){pressed[kbCode('jump')]=true;lastJump=f;}
   keys[kbCode('jump')]=f-lastJump<24;update(1/60);BFKeyboard.clearPressed();
   if(Math.abs(target.x-G.p.x)<35&&Math.abs(target.y-G.p.y)<6&&G.p.onGround){reached=true;break;}
  }
  keys.ArrowLeft=keys.ArrowRight=keys[kbCode('jump')]=false;
  if(stage!==3)press('portal');
  const pair=portalPairs().map(p=>({id:p.id,a:{x:p.a.x,y:p.a.y},b:{x:p.b.x,y:p.b.y}}));
  beginOutskirtsInteraction(target);
  const firstStep=BladefallSideStories.row(BladefallSideStoryWorld.state(),id).step;
  BladefallConversation.close();
  let chimesReached=null,chimesStep=null;
  if(id==='cartographer'){
   const chimes=G.obstacles.find(o=>o.sideStory===id&&o.task==='chimes');lastJump=-100;
   for(let f=0;f<650;f++){
    const dx=chimes.x-G.p.x;keys.ArrowRight=dx>8;keys.ArrowLeft=dx< -8;
    if(G.p.onGround&&chimes.y>G.p.y+20&&f-lastJump>25){pressed[kbCode('jump')]=true;lastJump=f;}
    keys[kbCode('jump')]=f-lastJump<24;update(1/60);BFKeyboard.clearPressed();
    if(Math.abs(chimes.x-G.p.x)<35&&Math.abs(chimes.y-G.p.y)<6&&G.p.onGround){chimesReached=true;break;}
   }
   keys.ArrowLeft=keys.ArrowRight=keys[kbCode('jump')]=false;
   beginOutskirtsInteraction(chimes);chimesStep=BladefallSideStories.row(BladefallSideStoryWorld.state(),id).step;
  }
  rows.push({id,first,chimesReached,chimesStep,firstStep,reached,player:{x:G.p.x,y:G.p.y},target:{x:target.x,y:target.y},pair,step:BladefallSideStories.row(BladefallSideStoryWorld.state(),id).step,dialogue:document.getElementById('fieldConversation')?.innerText});
  BladefallConversation.close();
 }
 return rows;
});
assert.ok(results.every(r=>r.reached&&r.first.length===1&&r.pair.length>0&&r.firstStep===(r.id==='neighbors'?2:1)&&(r.id!=='cartographer'||r.chimesReached&&r.chimesStep===2)),JSON.stringify(results));
await writeFile('docs/evidence/side-stories/portal-validation.json',JSON.stringify({scope:'Actual portal key and walking/jumping between local slates. Earned-capability checkpoint fixture; tea-service retrieval is precompleted. Checks both wind funnel and chimes, cold channel and tea-table connections.',results},null,2)+'\n');
console.log('PASS: three regional portal connections through actual placement and movement.');
}finally{await browser.close();}
