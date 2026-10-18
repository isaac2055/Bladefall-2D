import assert from 'node:assert/strict';
import {exploreRuntime} from './explore-runtime-harness.mjs';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const parent=await exploreRuntime();let child;
try{
 const w=parent.w;w.beginRun(0,null,{hp:1,dmg:1},{startStage:1});const native=w.__BF.G,geometry=JSON.stringify(native.obstacles),time=native.time;
 w.__BF.meta.devUnlocked=true;   // Edit this level is a test-mode tool (7.349)
 w.openPause();assert(w.document.getElementById('workshopEdit'));w.document.getElementById('workshopEdit').click();await tick();
 const B=w.BladefallWorkshopBridge,ui=B.state().active;assert(ui,'actual Explore pause opens builder');assert.equal(w.__BF.mode,'pause');w.gameUpdate();assert.equal(native.time,time);
 const A=w.BladefallWorkshopExplore,spawn=A.objects(ui.snapshot().definition).find(o=>o.collection==='spawn');ui.select(spawn.id);
 const field=ui.element.querySelector('[data-property=x]');field.value=String(spawn.x+40);field.dispatchEvent(new w.Event('change'));await ui.save();
 const draft=ui.snapshot(),expected=A.compile(draft.definition);assert.equal(expected.start.x,spawn.data.x+40);
 ui.element.querySelector('[data-action=test]').click();await tick();assert(ui.element.hidden);const frame=B.state().preview.querySelector('iframe');assert(frame.src.includes('index.html?workshopPlay='));
 let supplied;frame.contentWindow.postMessage=(data,origin)=>{supplied={data,origin};};
 w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:frame.contentWindow,data:{type:'bladefall-workshop-document-request',id:draft.id,nonce:'native-test'}}));
 assert.equal(supplied.data.document.id,draft.id);assert.equal(supplied.data.document.revision,draft.revision);
 const originalSupplied=supplied;w.dispatchEvent(new w.MessageEvent('message',{origin:'https://wrong.example',source:frame.contentWindow,data:{type:'bladefall-workshop-document-request',id:draft.id,nonce:'wrong'}}));assert.equal(supplied,originalSupplied,'other origins cannot read drafts');
 const receipts=[];let parentWindow;
 child=await exploreRuntime('?workshopPlay='+encodeURIComponent(draft.id),{beforeScript:async(cw,src)=>{
  if((src||'').split('?')[0]!=='bladefall-workshop-bridge.js')return;
  parentWindow={postMessage(message,origin){receipts.push(message);if(message.type==='bladefall-workshop-document-request')queueMicrotask(()=>cw.dispatchEvent(new cw.MessageEvent('message',{origin:cw.location.origin,source:parentWindow,data:{type:'bladefall-workshop-document',nonce:message.nonce,document:JSON.parse(JSON.stringify(draft))}})));}};
  Object.defineProperty(cw,'parent',{value:parentWindow});
 }});await tick();
 const cw=child.w,g=cw.__BF.G;assert(g?.workshop,'native Explore preview starts through document transfer');assert.equal(g.p.x,expected.start.x);assert.equal(g.p.y,expected.start.y);assert.equal(cw.BladefallPlaytest.state().run,null,'preview does not create a leaderboard/review run');
 assert.equal(cw.BladefallWorkshopBridge.state().playDocument.id,draft.id);assert.equal(cw.__BF.mode,'play');assert(cw.__BF.G.levelSelectMode);
 for(let i=0;i<20;i++)cw.gameUpdate();cw.die();assert.equal(cw.__BF.G.obstacles.length,expected.obstacles.length);assert.equal(cw.__BF.G.p.x,expected.start.x,'death returns to edited spawn');
 cw.nextStage();assert.equal(cw.__BF.mode,'pause');assert(receipts.some(r=>r.type==='bladefall-workshop-complete'&&r.document===draft.id));
 cw.dispatchEvent(new cw.MessageEvent('message',{origin:cw.location.origin,source:parentWindow,data:{type:'bladefall-workshop-retry',document:draft.id}}));assert.equal(cw.__BF.mode,'play');assert.equal(cw.__BF.G.p.x,expected.start.x);
 B.state().preview.querySelector('button').click();assert(!ui.element.hidden);assert.equal(B.state().preview,null);
 ui.element.querySelector('[data-action=library]').click();await tick();const library=w.document.querySelector('[aria-label="Level library"]');assert(library);library.querySelector('[data-action=blank]').click();await tick();const replacement=B.state().active;assert.notEqual(replacement,ui);assert.equal(replacement.snapshot().mode,'ascend');assert.equal(w.__BF.mode,'pause','switching drafts does not resume the parent game');replacement.close();assert.equal(w.__BF.G,native);assert.equal(JSON.stringify(native.obstacles),geometry);assert.equal(w.__BF.mode,'play');
 assert.deepEqual(parent.errors,[]);assert.deepEqual(child.errors,[]);
 console.log('PASS: actual Explore pause/editor, persisted edit, source/origin guarded draft transfer, native isolated preview, death/retry/completion, return with original scene intact.');
}finally{child?.close();parent.close();}
