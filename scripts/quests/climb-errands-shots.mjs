// Screenshots of the Ascend quest steps (for looking): .cache/quest-shots/climb-*.png
import {mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {open} from './harness.mjs';
const dir=fileURLToPath(new URL('../../.cache/quest-shots/',import.meta.url));mkdirSync(dir,{recursive:true});
const {page,errors,close}=await open('precision.html?pitch=climb&world=1&nosw=1',()=>!!window.BladefallPitchView?.climb?.startWorld);
const shot=async(name,n,id,room,pick)=>{const info=await page.evaluate((n,id,room,pick)=>{const PV=window.BladefallPitchView,V=window.BladefallPrecisionView,E=window.BladefallClimbErrands,st=PV.climb.state(),w=window.BladefallClimb.world(n),q=w.quests.find(x=>x.id===id);
  PV.climb.startWorld(n,w.chapter.rooms.findIndex(r=>r.id===room));const who=PV.climb.defOf(q.from).people.find(p=>p.quest===id);st.spoke.add(q.from+':'+who.who);V.advance(Array(20).fill(''));
  const W=E.where(id),sp=eval(pick);if(sp){const g=st.view.g;g.p.x=sp.x-24;g.p.y=sp.y-6;}V.advance(Array(20).fill(''));const g=st.view.g;return JSON.stringify({sp,room:g.room.id,p:[g.p.x,g.p.y],s:E.state(id),cam:st.cam});},n,id,room,pick);console.log(name,info);
 await new Promise(r=>setTimeout(r,1500));await page.screenshot({path:dir+name+'.png'});console.log(dir+name+'.png');};
try{
 await shot('climb-1-moths',2,'refuge','cl2-w2-q-fork','W[0][1]');
 await shot('climb-2-gear',3,'defector','cl3-c3-q-governor','W[0]');
 await shot('climb-3-pages',6,'archivist','cl6-k6-q-rain','W[2][1]');
 await shot('climb-4-elsie',2,'refuge','cl2-w2-kitchen','null');
}finally{console.log(errors.filter(e=>!/register/.test(e)));await close();}
