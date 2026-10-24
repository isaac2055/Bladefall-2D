import {open} from './harness.mjs';import fs from 'node:fs';
const {page,close}=await open();const all={};
try{for(const [s,id,lo,hi]of [[4,'recruit',5700,7550],[3,'cartographer',6100,8900],[9,'quota',6500,8500],[11,'neighbors',8000,11000],[16,'sailors',0,3500]]){
 all[id]=await page.evaluate((s,id,lo,hi)=>{beginRun(0,null,{hp:1,dmg:1},{startStage:s,levelSelect:true});return {
 caps:G.sessionCapabilities,act:G.actTwo,keys:{hook:kbCode('hook'),jump:kbCode('jump')},p:{x:G.p.x,y:G.p.y},rest:G.zoneRestSite,
 obstacles:G.obstacles.filter(o=>o.x>=lo&&o.x<=hi&&!o.sideStory).map(o=>{const v={};for(const[k,x]of Object.entries(o))if(!k.startsWith('_')&&typeof x!=='function')v[k]=x;return v;}),
 enemies:G.enemies.filter(o=>o.x>=lo&&o.x<=hi).map(o=>({type:o.type,x:o.x,y:o.y,w:o.w,h:o.h,watchSniper:o.watchSniper,gateMechanismSniper:o.gateMechanismSniper,perches:o.watchPerches}))
 };},s,id,lo,hi);
}fs.mkdirSync('.cache/quest-revision',{recursive:true});fs.writeFileSync('.cache/quest-revision/survey.json',JSON.stringify(all,null,2));console.log('Survey saved');}finally{await close();}
