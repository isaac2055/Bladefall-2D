// First-minute visual review of the real quest-preview starts (not route proof).
import {open} from './harness.mjs';import fs from 'node:fs';
const {page,errors,close}=await open();fs.mkdirSync('.cache/quest-revision/shots',{recursive:true});
try{for(const [stage,id]of [[3,'cartographer'],[4,'recruit'],[9,'quota'],[11,'neighbors'],[16,'sailors']]){
 await page.evaluate((stage,id)=>{beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});BladefallRound2Explore.prepareStart(id);const a=G.obstacles.find(o=>o.sideStory===id&&o.sideStoryRole==='actor');BladefallSideStoryWorld.interact(a);document.querySelector('#fieldConversation button')?.click();BladefallConversation.close();mode='play';__q.frames(210);},stage,id);
 await page.screenshot({path:'.cache/quest-revision/shots/'+id+'-start.png'});
}console.log(errors.filter(e=>!/register/.test(e)));}finally{await close();}
