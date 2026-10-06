import { launchChrome } from '../tests/launch-chrome.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const b=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const p=await b.newPage();await p.setViewport({width:844,height:390,isMobile:true,hasTouch:true});
 await p.goto('http://localhost:8371/?touch-story',{waitUntil:'domcontentloaded'});
 await p.evaluate(()=>{beginRun(0,null,{hp:1,dmg:1},{startStage:0,levelSelect:true});let a=G.obstacles.find(o=>o.sideStoryRole==='actor');G.p.x=a.x;G.p.y=a.y;beginOutskirtsInteraction(a);});
 await p.tap('#fieldConversation button');await p.tap('#fieldConversation button');
 const result=await p.evaluate(()=>({mode,phase:BladefallSideStoryWorld.state().quests.gatekeeper.phase,panel:!!document.getElementById('fieldConversation')}));
 assert.deepEqual(result,{mode:'play',phase:'active',panel:false});
 await p.evaluate(()=>{const a=G.obstacles.find(o=>o.sideStoryRole==='actor');beginOutskirtsInteraction(a);document.getElementById('fieldConversation').scrollTop=0;});
 const before=await p.evaluate(()=>({node:BladefallSideStoryWorld.state().quests.gatekeeper.node,...(()=>{const e=document.getElementById('fieldConversation'),r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height-20,max:e.scrollHeight-e.clientHeight};})()}));
 const session=await p.createCDPSession();
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:before.x,y:before.y}]});
 for(let i=1;i<=5;i++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:before.x,y:before.y-i*20}]});
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const swipe=await p.evaluate(()=>({node:BladefallSideStoryWorld.state().quests.gatekeeper.node,scroll:document.getElementById('fieldConversation')?.scrollTop,mode}));
 assert.ok(before.max>0&&swipe.scroll>0&&swipe.node===before.node&&swipe.mode==='conversation');
 await writeFile('docs/evidence/side-stories/touch-validation.json',JSON.stringify({scope:'Native mobile landscape touch taps through two consecutive dialogue nodes, not programmatic clicks; native swipe scrolls the active dialogue without choosing an option.',result,swipe},null,2)+'\n');
 console.log('PASS: consecutive touch selections start the quest and return to play.');
}finally{await b.close();}
