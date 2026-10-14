import assert from 'node:assert/strict';
import {exploreRuntime} from './explore-runtime-harness.mjs';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const parent=await exploreRuntime();let child;
try{
 const w=parent.w,B=w.BladefallWorkshopBridge;w.beginRun(0,null,{hp:1,dmg:1},{startStage:0});await B.editExplore();
 const M=w.BladefallWorkshopModel,A=w.BladefallWorkshopExplore,doc=M.create({id:'shared-preview',mode:'explore',name:'Shared preview',definition:A.blank()}),listeners=new Set();
 const host=w.BladefallWorkshopCollaboration.host({document:doc,onPlay:m=>{for(const listener of listeners)listener(m);}});
 let invitation;const actions=[];
 const co={actor:'host',session:host.session,info:()=>({people:[],code:'ABC234',message:'Connected',invitation}),attach(){},presence(){},close(){},onPlay:f=>{listeners.add(f);return()=>listeners.delete(f);},play:m=>{actions.push(m);host.play(m);},offerTest:async()=>invitation=host.test()};
 w.BladefallWorkshopCoBuild.open=({onSession})=>onSession(doc,co);
 B.state().active.element.querySelector('[data-action=cobuild]').click();await tick();await tick();const ui=B.state().active;
 ui.element.querySelector('[data-action=test]').click();await tick();const preview=B.state().preview,frame=preview.querySelector('iframe'),outgoing=[];let cw,parentWindow;
 frame.contentWindow.postMessage=data=>{if(cw)cw.dispatchEvent(new cw.MessageEvent('message',{origin:cw.location.origin,source:parentWindow,data}));else outgoing.push(data);};
 child=await exploreRuntime('?workshopPlay='+doc.id,{beforeScript:async(win,src)=>{
  if((src||'').split('?')[0]!=='bladefall-workshop-bridge.js')return;cw=win;parentWindow={postMessage:data=>queueMicrotask(()=>w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:frame.contentWindow,data})))};Object.defineProperty(cw,'parent',{value:parentWindow});
 }});await tick();
 assert.equal(cw.__BF.mode,'pause','first participant waits for a partner');assert(preview.textContent.includes('Waiting for a partner'));
 const guestMessages=[],socket=host.connect(m=>guestMessages.push(m));socket.receive({type:'hello',actor:'friend',token:'friend-token',name:'Friend'});socket.receive({type:'play',action:'join',test:invitation.id});await tick();
 assert.equal(cw.__BF.mode,'play');assert(cw.__BF.G.coopSession);assert(preview.textContent.includes('Playing together'));
 cw.__BF.G.p.x=400;[...preview.querySelectorAll('button')].find(b=>b.textContent==='Restart test').click();await tick();assert.equal(cw.__BF.G.p.x,100);assert(guestMessages.filter(m=>m.event==='roster').length>=2,'partner receives shared restart');
 socket.close();await tick();assert.equal(cw.__BF.mode,'pause');assert(preview.textContent.includes('Waiting for a partner'));
 [...preview.querySelectorAll('button')].find(b=>b.textContent==='Play solo').click();await tick();assert.equal(cw.__BF.mode,'play');assert(!cw.__BF.G.coopSession);assert(!cw.__NET.conn);assert(preview.textContent.includes('Testing solo'));assert.equal(actions.at(-1).action,'leave');
 const before=actions.length;cw.__BF.G.p.x=450;[...preview.querySelectorAll('button')].find(b=>b.textContent==='Restart test').click();await tick();assert.equal(cw.__BF.G.p.x,100);assert.equal(actions.length,before,'solo restart stays local');
 preview.querySelector('button').click();assert.equal(B.state().preview,null);assert(!ui.element.hidden);assert.equal(listeners.size,0);
 // A third builder can still preview alone when both seats are already occupied.
 for(const actor of ['one','two']){const peer=host.connect(()=>{});peer.receive({type:'hello',actor,token:'token-'+actor,name:actor});peer.receive({type:'play',action:'join',test:invitation.id});}
 ui.collaborationChanged();ui.element.querySelector('[data-action=join-test]').click();await tick();const full=B.state().preview,fullFrame=full.querySelector('iframe'),sent=[];fullFrame.contentWindow.postMessage=m=>sent.push(m);
 w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:fullFrame.contentWindow,data:{type:'bladefall-workshop-coop-ready',document:doc.id}}));assert(full.textContent.includes('Both co-op seats are occupied'));const fullCount=actions.length;
 [...full.querySelectorAll('button')].find(b=>b.textContent==='Restart test').click();assert.equal(sent.at(-1).type,'bladefall-workshop-retry');full.querySelector('button').click();assert.equal(actions.length,fullCount,'unseated preview does not send restart or leave');assert.equal(listeners.size,0);ui.close();assert.deepEqual(parent.errors,[]);assert.deepEqual(child.errors,[]);
 console.log('PASS: actual builder/iframe shared preview, native waiting/join, synchronized restart, partner departure, solo fallback and local retry, occupied seats, listener cleanup and return to editing.');
}finally{child?.close();parent.close();}
