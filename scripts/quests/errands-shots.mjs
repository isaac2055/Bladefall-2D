// Screenshots of the reworked side-story steps (for looking, not asserting): .cache/quest-shots/*.png
import {mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {open} from './harness.mjs';
const dir=fileURLToPath(new URL('../../.cache/quest-shots/',import.meta.url));mkdirSync(dir,{recursive:true});
const {page,errors,close}=await open();
const shot=async(name,fn)=>{await page.evaluate(fn);await new Promise(r=>setTimeout(r,3200));await page.screenshot({path:dir+name+'.png'});console.log(dir+name+'.png');};
try{
 await shot('1-elsie-moths',()=>{__q.setup(1,'refuge');__q.put(1000,0);});
 await shot('2-elsie-lantern',()=>{BladefallSideStoryWorld.completeTask('refuge','moths');const l=G.obstacles.find(o=>o.errand==='lantern');l.held=true;__q.put(1900,0);});
 await shot('3-elsie-log',()=>{BladefallSideStoryWorld.completeTask('refuge','lantern');G.p.weapon=oathbladeWeapon();__q.put(2200,0);});
 await shot('4-silas-gear',()=>{__q.setup(2,'defector');__q.put(11180,205);});
 await shot('5-silas-arms',()=>{BladefallSideStoryWorld.completeTask('defector','gear');__q.put(10260,0);});
 await shot('6-keep-masonry',()=>{__q.setup(5,'archivist');__q.put(3300,360);});
 await shot('7-keep-pages',()=>{__q.put(12100,240);});
 await shot('8-elsie-return',()=>{__q.setup(1,'refuge');for(const task of ['moths','lantern','log'])BladefallSideStoryWorld.completeTask('refuge',task);__q.put(2250,0);});
 await shot('9-archivist-return',()=>{__q.setup(5,'archivist');for(const task of ['reading','wall','pages'])BladefallSideStoryWorld.completeTask('archivist',task);__q.put(12500,360);});
}finally{console.log('errors',errors.filter(e=>!/register/.test(e)));await close();}
