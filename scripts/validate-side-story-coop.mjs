import { launchChrome } from '../tests/launch-chrome.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const b=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const host=await b.newPage(),guest=await b.newPage();
 for(const [p,role] of [[host,'host'],[guest,'guest']]){
  await p.goto('http://localhost:8371/?side-story-coop',{waitUntil:'domcontentloaded'});
  await p.evaluate(role=>{
   beginRun(0,null,{hp:1,dmg:1},{startStage:0,levelSelect:true,coop:true});mode='pause';
   window.__solo=JSON.stringify(meta.sideStories);window.__messages=[];NET.role=role;netInitProtocol(role);
   NET.conn={open:true,send:m=>{if(m.t?.startsWith('sideStory'))window.__messages.push(m);}};
   const actor=G.obstacles.find(o=>o.sideStoryRole==='actor');Object.assign(G.p,{x:actor.x,y:actor.y,invuln:999});
   NET.ghost={x:actor.x,y:actor.y,stage:0};
  },role);
 }
 const pump=async()=>{for(let n=0;n<12;n++){let count=0;for(const [from,to] of [[guest,host],[host,guest]]){const messages=await from.evaluate(()=>window.__messages.splice(0));count+=messages.length;for(const m of messages)await to.evaluate(m=>netOnMessage(m),m);}if(!count)return;}throw new Error('network did not settle');};
 const choose=async(p,id,choice)=>p.evaluate(({id,choice})=>{const c=BladefallSideStories.view(BladefallSideStoryWorld.state(),id).choices.find(c=>c.id===choice);const b=[...document.querySelectorAll('#fieldConversation button')].find(b=>b.textContent===c?.label);if(!b)throw new Error('choice unavailable '+choice);b.click();},{id,choice});
 await guest.evaluate(()=>beginOutskirtsInteraction(G.obstacles.find(o=>o.sideStoryRole==='actor')));await choose(guest,'gatekeeper','short');await choose(guest,'gatekeeper','leave');await pump();
 // The guest can predict a lever pull, but the host must see the physical ballast too.
 const ballast=await guest.evaluate(()=>{const o=G.obstacles.find(o=>o.task==='ballast');Object.assign(G.p,{x:o.x,y:o.y});const c=G.obstacles.find(o=>o.openingBallast);c.x=o.x;c.y=o.y;return {x:o.x,y:o.y};});
 await host.evaluate(pos=>Object.assign(NET.ghost,pos),ballast);
 await guest.evaluate(()=>{beginOutskirtsInteraction(G.obstacles.find(o=>o.task==='ballast'));BladefallConversation.close();});await pump();
 for(const p of [host,guest])assert.equal(await p.evaluate(()=>BladefallSideStories.row(BladefallSideStoryWorld.state(),'gatekeeper').step),0,'host rejects an unweighted brake');
 for(const p of [host,guest])await p.evaluate(()=>{const c=G.obstacles.find(o=>o.openingBallast);c.x=1050;c.y=0;});
 for(const task of await guest.evaluate(()=>BladefallSideStories.byId.gatekeeper.tasks.map(t=>t.id))){
  const pos=await guest.evaluate(task=>{const o=G.obstacles.find(o=>o.task===task);G.p.x=o.x;G.p.y=o.y;return{x:o.x,y:o.y};},task);
  await host.evaluate(pos=>Object.assign(NET.ghost,pos),pos);
  await guest.evaluate(task=>{beginOutskirtsInteraction(G.obstacles.find(o=>o.task===task));BladefallConversation.close();},task);await pump();
 }
 const pos=await guest.evaluate(()=>{const a=G.obstacles.find(o=>o.sideStoryRole==='actor');G.p.x=a.x;G.p.y=a.y;beginOutskirtsInteraction(a);return{x:a.x,y:a.y};});await host.evaluate(pos=>Object.assign(NET.ghost,pos),pos);
 await choose(guest,'gatekeeper','finish');await choose(guest,'gatekeeper','leave');await pump();
 const rewardPos=await guest.evaluate(()=>{const r=G.obstacles.find(o=>o.sideStoryRole==='reward');G.p.x=r.x;G.p.y=r.y;G.p.blood=2;return{x:r.x,y:r.y};});await host.evaluate(pos=>Object.assign(NET.ghost,pos),rewardPos);
 await guest.evaluate(()=>beginOutskirtsInteraction(G.obstacles.find(o=>o.sideStoryRole==='reward')));
 const beforeAck=await guest.evaluate(()=>G.p.blood);await pump();
 const completed=await Promise.all([host,guest].map(p=>p.evaluate(()=>({row:BladefallSideStories.row(BladefallSideStoryWorld.state(),'gatekeeper'),soloUntouched:JSON.stringify(meta.sideStories)===window.__solo,blood:G.p.blood}))));
 assert.ok(completed.every(r=>r.row.phase==='completed'&&r.row.claimed&&r.soloUntouched));assert.equal(beforeAck,2);assert.equal(completed[1].blood,4);
 const packet=await host.evaluate(()=>coopSessionPacket());assert.ok(packet.sideStories.quests.gatekeeper.claimed);
 await host.evaluate(()=>netSend({t:'sideStoryState',stage:G.stageIndex,state:BladefallSideStoryWorld.state(),revision:G.sideStoryRevision,receipts:Object.values(G._sideStoryGuestReceipts)}));await pump();
 assert.equal(await guest.evaluate(()=>G.p.blood),4,'replayed receipts must not heal twice');
 // Simulate reconnect after the host accepted the claim but its acknowledgment never arrived.
 const recoveredReward=await guest.evaluate(packet=>{G._sideStoryReceivedRewards={};G.p.blood=2;applyCoopSession(packet);const once=G.p.blood;applyCoopSession(packet);return {once,twice:G.p.blood};},packet);
 assert.deepEqual(recoveredReward,{once:4,twice:4});

 for(const p of [host,guest])await p.evaluate(packet=>{BladefallConversation.close();applyCoopSession(packet);loadStage(1);mode='pause';const a=G.obstacles.find(o=>o.sideStoryRole==='actor');G.p.x=a.x;G.p.y=a.y;NET.ghost={x:a.x,y:a.y,stage:1};window.__messages=[];},packet);
 // A host refusal wins over an in-flight stale guest acceptance.
 await guest.evaluate(()=>beginOutskirtsInteraction(G.obstacles.find(o=>o.sideStoryRole==='actor')));await choose(guest,'refuge','short');
 await host.evaluate(()=>beginOutskirtsInteraction(G.obstacles.find(o=>o.sideStoryRole==='actor')));await choose(host,'refuge','harsh');await pump();
 const refused=await Promise.all([host,guest].map(p=>p.evaluate(()=>({phase:BladefallSideStories.row(BladefallSideStoryWorld.state(),'refuge').phase,rewardHidden:G.obstacles.find(o=>o.sideStoryRole==='reward').gone,soloUntouched:JSON.stringify(meta.sideStories)===window.__solo}))));
 assert.ok(refused.every(r=>r.phase==='harsh'&&r.rewardHidden&&r.soloUntouched));
 const escortPacket=await host.evaluate(()=>{
  let state=BladefallSideStories.reduce(BladefallSideStoryWorld.state(),'recruit',{type:'choice',choice:'short'}).state;
  state=BladefallSideStories.reduce(state,'recruit',{type:'task',task:'helmet'}).state;G.sessionSideStories=state;loadStage(4);mode='pause';
  const a=G.obstacles.find(o=>o.sideStoryRole==='actor');G.p.x=a.x-1000;G.p.y=a.y;NET.ghost={x:a.x+70,y:a.y,stage:4};window.__messages=[];return coopSessionPacket();
 });
 await guest.evaluate(packet=>{applyCoopSession(packet);loadStage(4);mode='pause';window.__messages=[];},escortPacket);
 const hostEscort=await host.evaluate(()=>{
  const a=G.obstacles.find(o=>o.sideStoryRole==='actor'),e=G.sideStoryScene.escort;
  for(let i=0;i<1200&&!e.finished;i++){NET.ghost.x=a.x+70;NET.ghost.y=a.y;BladefallSideStoryWorld.update(1/60);}
  BladefallSideStoryWorld.update(.2);return {x:a.x,finished:e.finished,phase:BladefallSideStories.row(BladefallSideStoryWorld.state(),'recruit').phase};
 });await pump();
 const guestEscort=await guest.evaluate(()=>({x:G.obstacles.find(o=>o.sideStoryRole==='actor').x,finished:G.sideStoryScene.escort.finished,phase:BladefallSideStories.row(BladefallSideStoryWorld.state(),'recruit').phase}));
 assert.deepEqual(guestEscort,hostEscort);assert.ok(hostEscort.finished&&hostEscort.phase==='ready');

 // The second opening story has a separate route and four ordered interactions.
 for(const p of [host,guest])await p.evaluate(()=>{BladefallConversation.close();beginRun(0,null,{hp:1,dmg:1},{startStage:1,levelSelect:true,coop:true});mode='pause';NET.ghost={stage:1,x:700,y:0};G.p.x=700;G.p.y=0;});
 await guest.evaluate(()=>beginOutskirtsInteraction(G.obstacles.find(o=>o.sideStoryRole==='actor')));await choose(guest,'refuge','short');await choose(guest,'refuge','leave');await pump();
 for(const task of ['line','lantern','floor','table']){
  const pos=await guest.evaluate(task=>{const o=G.obstacles.find(o=>o.task===task);Object.assign(G.p,{x:o.x,y:o.y});return {x:o.x,y:o.y};},task);
  await host.evaluate(pos=>Object.assign(NET.ghost,pos),pos);
  await guest.evaluate(task=>{beginOutskirtsInteraction(G.obstacles.find(o=>o.task===task));BladefallConversation.close();},task);await pump();
 }
 for(const p of [host,guest])assert.equal(await p.evaluate(()=>BladefallSideStories.row(BladefallSideStoryWorld.state(),'refuge').phase),'ready');
 await guest.evaluate(()=>{G.p.x=700;G.p.y=0;beginOutskirtsInteraction(G.obstacles.find(o=>o.sideStoryRole==='actor'));});await host.evaluate(()=>Object.assign(NET.ghost,{x:700,y:0}));
 await choose(guest,'refuge','finish');await choose(guest,'refuge','leave');await pump();
 for(const p of [host,guest])assert.equal(await p.evaluate(()=>BladefallSideStories.row(BladefallSideStoryWorld.state(),'refuge').phase),'completed');
 await host.evaluate(()=>{loadStage(1);mode='pause';BladefallSideStoryWorld.update(.2);});await pump();
 assert.equal(await guest.evaluate(()=>G.sideStoryScene.revisit),true,'return-scene visibility comes from the host');
 await writeFile('docs/evidence/side-stories/coop-validation.json',JSON.stringify({scope:'Two browser instances with an in-memory transport exercising production packet encoding, netOnMessage and quest handlers; guest decisions/tasks, host reward acknowledgment, stage-session transfer, conflicting decisions and solo isolation. Includes host-authoritative follower movement led solely by guest-body fixtures and matching guest poses. Does not exercise real WebRTC signaling.',completed,refused,beforeAck,recoveredReward,hostEscort,guestEscort},null,2)+'\n');
 console.log('PASS: shared decisions, guest task progress, acknowledged one-use reward, stage carryover, conflict convergence and solo isolation.');
}finally{await b.close();}
