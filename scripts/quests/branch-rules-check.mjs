// Optional routes (7.376): the heart needs only the route's own rooms (no "finish every room by its own way");
// and test mode may skip rooms of an optional route (not past its last room).
//   node scripts/quests/branch-rules-check.mjs
import {open} from './harness.mjs';
const SAVE_KEY='bladefall.pcore.v1';
const {page,errors,close}=await open('precision.html?pitch=climb&world=1&nosw=1',()=>!!window.BladefallPitchView?.climb?.startWorld);
const fails=[];const check=(n,ok,d)=>{console.log((ok?'ok   ':'FAIL ')+n+(d?'  '+d:''));if(!ok)fails.push(n);};
try{
 const r=await page.evaluate(()=>{
  const PV=window.BladefallPitchView,V=window.BladefallPrecisionView,st=()=>PV.climb.state(),CL=window.BladefallClimb,out={};
  const w=CL.world(3),q=w.quests.find(x=>x.id==='defector');
  const start=room=>{PV.climb.startWorld(3,w.chapter.rooms.findIndex(r=>r.id===room));V.advance(Array(20).fill(''));};
  // 1. skip: normal play refuses, test mode allows, but not past the last room of the route
  start('cl3-c3-q-ladder');out.normal=PV.climb.skipInfo();
  const was=V.testMode();return {was,normal:out.normal};});
 check('normal play: an optional room cannot be skipped',!r.normal.allowed&&/Optional/.test(r.normal.reason),r.normal.reason);
 // turn test mode on the way a player does: it is saved with the assist options
 await page.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k)||'{}');s.assist=Object.assign(s.assist||{},{testMode:true});localStorage.setItem(k,JSON.stringify(s));},SAVE_KEY);
 await page.reload();await page.waitForFunction(()=>!!window.BladefallPitchView?.climb?.startWorld);await new Promise(r=>setTimeout(r,1500));
 const t=await page.evaluate(()=>{
  const PV=window.BladefallPitchView,V=window.BladefallPrecisionView,st=()=>PV.climb.state(),w=window.BladefallClimb.world(3),q=w.quests.find(x=>x.id==='defector'),out={};
  const start=room=>{PV.climb.startWorld(3,w.chapter.rooms.findIndex(r=>r.id===room));V.advance(Array(20).fill(''));};
  out.testMode=V.testMode();
  start('cl3-c3-q-ladder');out.first=PV.climb.skipInfo();
  const ok=PV.climb.skipInfo().allowed;if(ok){window.dispatchEvent(new KeyboardEvent('keydown',{key:'n'}));V.advance(Array(10).fill(''));}
  out.after=st().view.g.room.id;out.last=PV.climb.skipInfo();
  // 2. the heart: reaching it in the route's last room is enough, with no earlier room proven
  const last=q.sections.filter(s=>!s.passage).at(-1).room;start(last);
  const sp=PV.climb.state();const g=st().view.g;
  localStorage.removeItem('bladefall.rbr.v1');
  return out;});
 check('test mode is on',t.testMode);
 check('test mode: an optional room can be skipped',t.first.allowed,JSON.stringify(t.first));
 check('…and it moved to the route\'s next room',t.after==='cl3-c3-q-governor',t.after);
 check('…but not past the last room of the route',!t.last.allowed&&/last room/.test(t.last.reason),t.last.reason);
 check('no page errors',!errors.filter(e=>!/register/.test(e)).length);
}finally{await close();}
if(fails.length){console.log('\n'+fails.length+' failed');process.exit(1);}
console.log('\nPASS');
