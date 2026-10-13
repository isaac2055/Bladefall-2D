import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {handle} from '../../server/playtest-service.mjs';
const model=globalThis.BladefallPlaytestModel,storeData=new Map(),store={get:async k=>storeData.get(k),setJSON:async(k,v,{onlyIfNew}={})=>{if(!onlyIfNew||!storeData.has(k))storeData.set(k,v);},list:async({prefix})=>({blobs:[...storeData.keys()].filter(k=>k.startsWith(prefix)).map(key=>({key}))})};
const disk=new Map(),localStorage={getItem:k=>disk.get(k)||null,setItem:(k,v)=>disk.set(k,v),removeItem:k=>disk.delete(k)};
let network=false,posts=0;
function client(){const context=vm.createContext({BladefallPlaytestModel:model,localStorage,crypto:webcrypto,location:{hostname:'localhost',protocol:'http:'},navigator:{onLine:false},queueMicrotask,addEventListener(){},setInterval(){},fetch:async(url,opts)=>{if(!network)throw Error('offline');if(opts?.method==='POST')posts++;return handle(new Request('https://bladefall2d.pages.dev'+new URL(url,'https://bladefall2d.pages.dev').pathname,{...opts,headers:{...opts?.headers,Origin:'http://localhost:8371'}}),store);}});vm.runInContext(readFileSync(new URL('../../public/bladefall-playtest.js',import.meta.url),'utf8'),context);return context;}
let c=client(),p=c.BladefallPlaytest;
const row={id:'review-test-0001',mode:'review',campaign:'room-bank',world:'bank-fractured-cores-h',room:'bank-f96',name:'Turn of the Trumpet',fun:9,difficulty:5,suitability:4,comment:'Private test comment',tester:'Test fixture',session:'session-test',frames:80,revision:'revision-test',bankBatch:25,bankSide:'fractured',ms:1333,deaths:5,assisted:false,build:'test'};
p.saveFeedback(row);assert.equal(p.feedbackState(row.id),'pending');assert.equal(posts,0);
c=client();p=c.BladefallPlaytest;assert.equal(p.state().data.feedback[0].comment,row.comment);assert.equal(p.feedbackState(row.id),'pending');
network=true;c.navigator.onLine=true;await p.sync();assert.equal(p.feedbackState(row.id),'synced');assert.equal(posts,1);
p.saveFeedback(row);await p.sync();assert.equal(posts,1);const saved=[...storeData.values()].find(r=>r.id===row.id);for(const k of ['comment','suitability','revision','tester','frames','deaths'])assert.equal(saved[k],row[k]);
const profile=p.state().data;
const request=record=>new Request('https://bladefall2d.pages.dev/api/playtest',{method:'POST',headers:{Origin:'http://localhost:8371'},body:JSON.stringify({kind:'feedback',player:profile.player,token:profile.token,record:{...record,player:profile.player,season:model.SEASON}})});
const retry=await handle(request({...row,comment:'duplicate should not overwrite'}),store);assert.equal(retry.status,200);assert.equal(saved.comment,row.comment);
assert.equal((await handle(request({...row,id:'invalid-review-0001',suitability:6}),store)).status,400);
assert.equal((await handle(request({...row,id:'core-review-0001',campaign:'cores',world:'101',room:'core-outskirts'}),store)).status,200);
const publicResult=await(await handle(new Request('https://bladefall2d.pages.dev/api/playtest'),store)).json();assert.equal(publicResult.records.length,0);assert.ok(!JSON.stringify(publicResult).includes(row.comment));
const options=await handle(new Request('https://bladefall2d.pages.dev/api/playtest',{method:'OPTIONS',headers:{Origin:'http://localhost:8371'}}),store);assert.equal(options.status,204);assert.equal(options.headers.get('Access-Control-Allow-Origin'),'http://localhost:8371');assert.equal((await handle(new Request('https://bladefall2d.pages.dev/api/playtest',{method:'OPTIONS',headers:{Origin:'https://unrelated.example'}}),store)).status,403);
// A successful static HTML response must not erase an unsent review.
const second={...row,id:'review-test-0002'};c.navigator.onLine=false;p.saveFeedback(second);c.navigator.onLine=true;c.fetch=async()=>new Response('<html>Not an API</html>');await p.sync();assert.equal(p.feedbackState(second.id),'pending');
console.log('PASS: cloud review validation, offline reload/retry, acknowledged saves, idempotency, metadata, local CORS, and private feedback excluded from leaderboards.');
// Exercise the real Room Bank review form: typed drafts survive reopening, and Save queues cloud feedback.
const {JSDOM}=await import('jsdom');
const dom=new JSDOM('<!doctype html><body></body>',{url:'http://localhost:8371/precision.html?pitch=bank&mode=review',runScripts:'outside-only'}),w=dom.window;
w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
Object.defineProperty(w.navigator,'onLine',{value:false,configurable:true});w.setInterval=()=>0;w.BladefallPlaytestModel=model;w.fetch=async()=>{throw Error('offline fixture');};w.BladefallPrecisionView={clearInput(){}};
w.eval(readFileSync(new URL('../../public/bladefall-playtest.js',import.meta.url),'utf8'));
w.eval(readFileSync(new URL('../../public/bladefall-climb-session.js',import.meta.url),'utf8'));
const def={id:'bank-f96',name:'Turn of the Trumpet',bank:{revision:'form-revision',side:'fractured',batch:25}},state={world:{n:'bank-fractured-cores-1',name:'Outskirts Core',atlasStart:def.id},view:{g:{room:{id:def.id,def}},chapterStats:{deaths:4},paused:false},sessionConfig:{title:'Room Bank',build:'test'}};
w.BladefallClimbSession.init(state,new w.URLSearchParams('mode=review'));w.BladefallClimbSession.start();
w.document.getElementById('bsRate').click();let form=w.document.getElementById('bsRating');for(const [key,value]of Object.entries({tester:'Form tester',fun:'8',difficulty:'5',suitability:'4',comment:'Draft retained without export'}))form.elements.namedItem(key).value=value;
form.elements.comment.dispatchEvent(new w.Event('input',{bubbles:true}));assert(JSON.parse(w.localStorage.getItem('bladescent.review-drafts.v1'))['bank-f96@form-revision']);
w.document.getElementById('bsCancel').click();w.document.getElementById('bsRate').click();form=w.document.getElementById('bsRating');assert.equal(form.elements.comment.value,'Draft retained without export');assert.equal(form.elements.fun.value,'8');
form.dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));const reviews=JSON.parse(w.localStorage.getItem('bladescent.reviews.v1'));assert.equal(reviews.length,1);assert.equal(reviews[0].comment,'Draft retained without export');assert.equal(Object.keys(JSON.parse(w.localStorage.getItem('bladescent.review-drafts.v1'))).length,0);
assert.equal(w.BladefallPlaytest.feedbackState(reviews[0].id),'pending');const feedback=w.BladefallPlaytest.state().data.feedback[0];assert.equal(feedback.room,def.id);assert.equal(feedback.suitability,4);assert.equal(feedback.revision,'form-revision');assert.equal(feedback.world,'bank-fractured-cores-1');
w.BladefallClimbSession.syncReviews();assert.equal(w.BladefallPlaytest.state().data.feedback.length,1);assert(w.document.getElementById('bsClock').textContent.includes('waiting for cloud'));
// Campaign/Core feedback also recovers drafts and permits a manual mid-room review.
w.BladefallPlaytest.setup({pause:()=>()=>{},clearInput(){}});const coreInfo={mode:'review',campaign:'cores',world:'101',room:'core-outskirts',name:'Turn of the Trumpet',part:2,x:1290,y:589};
let complete=w.BladefallPlaytest.feedback(coreInfo,true),coreForm=w.document.querySelector('#bfPlaytestDialog form');coreForm.elements.fun.value='9';coreForm.elements.difficulty.value='5';coreForm.elements.comment.value='Mid-Core note';coreForm.elements.comment.dispatchEvent(new w.Event('input',{bubbles:true}));w.document.getElementById('ptSkip').click();await complete;
complete=w.BladefallPlaytest.feedback(coreInfo,true);coreForm=w.document.querySelector('#bfPlaytestDialog form');assert.equal(coreForm.elements.comment.value,'Mid-Core note');coreForm.dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));await complete;const coreFeedback=w.BladefallPlaytest.state().data.feedback.find(r=>r.room==='core-outskirts');assert.equal(coreFeedback.part,2);assert.equal(coreFeedback.x,1290);assert.equal(coreFeedback.comment,'Mid-Core note');assert.equal(w.BladefallPlaytest.feedbackState(coreFeedback.id),'pending');dom.window.close();
console.log('PASS: real review form draft recovery, local save, automatic cloud queue, correct room metadata, status, and repeat/backfill deduplication.');
