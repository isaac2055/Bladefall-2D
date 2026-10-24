// Visual fixtures only; physical completion is verified separately by round2-*-check.
import {open} from './harness.mjs';import fs from 'node:fs';
fs.mkdirSync('.cache/round2/shots',{recursive:true});
let h=await open();
try{for(const [stage,id]of [[3,'cartographer'],[4,'recruit'],[9,'quota'],[11,'neighbors'],[16,'sailors']]){
 const info=await h.page.evaluate((stage,id)=>{__q.setup(stage,id);G.p.invuln=99;const cfg=BladefallRound2Explore.CONFIG[id],o=G.obstacles.find(o=>o.task===BladefallSideStories.byId[id].tasks[0].id&&o.sideStory===id);__q.put(o.x-90,id==='neighbors'?180:id==='sailors'?100:o.y);return {id,task:[o.x,o.y],floors:G.obstacles.filter(o=>o.type==='plat'&&Math.abs(o.x-8500)<500).map(o=>[o.x,o.y,o.w])};},stage,id);
 console.log(info);await new Promise(r=>setTimeout(r,400));await h.page.screenshot({path:'.cache/round2/shots/explore-'+id+'-start.png'});
}}finally{await h.close();}
h=await open('precision.html?pitch=climb&world=1&nosw=1',()=>!!window.BladefallPitchView?.climb?.startWorld);
try{for(const [n,id]of [[4,'cartographer'],[5,'recruit'],[10,'quota'],[12,'neighbours'],[16,'sailors']]){
 await h.page.evaluate((n,id)=>{const P=BladefallPitchView,V=BladefallPrecisionView,E=BladefallClimbRound2,w=BladefallClimb.world(n),q=w.quests.find(q=>q.id===id);E.reset(id);const room=E.CONFIG[id].rooms[0];P.climb.startWorld(n,w.chapter.rooms.findIndex(r=>r.id===room));const st=P.climb.state();st.spoke.add(q.from+':'+P.climb.defOf(q.from).people.find(p=>p.quest===id).who);V.advance(['']);const W=E.where(id),sp=Array.isArray(W[0])?W[0][0]:W[0],g=st.view.g;Object.assign(g.p,{x:sp.x-22,y:sp.y-g.p.h/2,vx:0,vy:0});V.advance(['']);P.climb.resetCamera();},n,id);
 await new Promise(r=>setTimeout(r,500));await h.page.screenshot({path:'.cache/round2/shots/ascend-'+id+'-start.png'});
}}finally{console.log(h.errors.filter(e=>!/register/.test(e)));await h.close();}
