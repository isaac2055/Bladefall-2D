import fs from 'node:fs';import vm from 'node:vm';import test from 'node:test';import assert from 'node:assert/strict';
test('Wrapper counts moving clock, completion once, and same-course restarts only',()=>{
 let run=null,tick,engaged=true;const messages=[],context={URL,URLSearchParams,location:{search:""},document:{referrer:'https://2dvibes.com/',hidden:false,querySelector:()=>({addEventListener(){},contentWindow:{BladefallPlaytest:{state:()=>({run})}}})},parent:{postMessage:data=>messages.push(data)},setInterval:fn=>tick=fn};context.window={addEventListener(){},dvCreateEngagement:()=>({active:()=>engaged})};vm.runInNewContext(fs.readFileSync(new URL('../public/2dvibes-play.js',import.meta.url),'utf8'),context);tick();assert.equal(messages.filter(m=>m.event==='engine_ready').length,1);run={id:'1',mode:'explore',world:'0',ms:0,done:false};tick();for(let i=0;i<10;i++){run.ms+=1000;tick();}assert.equal(messages.filter(m=>m.event==='gameplay_active').length,1);context.document.hidden=true;for(let i=0;i<12;i++){run.ms+=1000;tick();}assert.equal(messages.filter(m=>m.event==='gameplay_active').length,1);context.document.hidden=false;engaged=false;for(let i=0;i<12;i++){run.ms+=1000;tick();}assert.equal(messages.filter(m=>m.event==='gameplay_active').length,1);engaged=true;run.done=true;tick();tick();assert.equal(messages.filter(m=>m.event==='completion').length,1);run={...run,id:'2',done:false,ms:0};tick();run={...run,id:'3',world:'1'};tick();assert.equal(messages.filter(m=>m.event==='retry').length,1);
});

test('Only the published challenge slug launches the Outskirts time trial',()=>{
 const source=fs.readFileSync(new URL('../public/2dvibes-play.js',import.meta.url),'utf8');
 for(const [search,expected] of [['?challenge=outskirts-v1','/?dvTrial=outskirts-v1'],['?challenge=other','/'],['?timeTrial=7','/']]){
  const frame={src:'/',addEventListener(){}},window={addEventListener(){}};
  vm.runInNewContext(source,{URL,URLSearchParams,location:{search},document:{referrer:'',querySelector:()=>frame},window,parent:window});
  assert.equal(frame.src,expected);
 }
});

test('Trial preview forwards only a valid finish from its game frame', () => {
 const origin = 'https://outskirts-trial.2dvibes.pages.dev';
 const gameOrigin = 'https://bladefall2d.pages.dev';
 let onMessage;
 const frame = {contentWindow:{},addEventListener(){}};
 const messages = [];
 const context = {
  URL, URLSearchParams, location:{origin:gameOrigin,search:'?challenge=outskirts-v1'},
  document:{referrer:origin+'/',querySelector:()=>frame},
  parent:{postMessage:(data,target)=>messages.push({data,target})},
  window:{addEventListener:(_,fn)=>{onMessage=fn;}}, setInterval(){}
 };
 const script = fs.readFileSync(new URL('../public/2dvibes-play.js',import.meta.url),'utf8');
 vm.runInNewContext(script,context);
 const finish = {source:frame.contentWindow,origin:gameOrigin,data:{
  type:'bladefall:outskirts-result',ms:61789,deaths:2,eligible:false
 }};
 onMessage({...finish,source:{}});
 onMessage({...finish,origin});
 onMessage({...finish,data:{...finish.data,ms:NaN}});
 onMessage(finish);
 const results = messages.filter(m=>m.data.type==='2dvibes:trial-result');
 assert.deepEqual(JSON.parse(JSON.stringify(results)),[{
  target:origin, data:{type:'2dvibes:trial-result',challenge:'outskirts-v1',ms:61789,deaths:2,eligible:false}
 }]);
});


test('Wrapper transfers launch/fullscreen focus to the nested game, without scrolling or focusing a hidden tab',()=>{
 const handlers={},frameHandlers={},focusCalls=[],windowFocusCalls=[];
 const frame={contentWindow:{focus:()=>windowFocusCalls.push(true)},focus:options=>focusCalls.push(options),addEventListener:(type,fn)=>frameHandlers[type]=fn};
 const window={addEventListener:(type,fn)=>handlers[type]=fn};
 const document={hidden:false,referrer:'',querySelector:()=>frame};
 vm.runInNewContext(fs.readFileSync(new URL('../public/2dvibes-play.js',import.meta.url),'utf8'),{URL,URLSearchParams,location:{search:''},document,window,parent:window});
 frameHandlers.load();handlers.focus();
 assert.equal(focusCalls.length,2);assert.equal(windowFocusCalls.length,2);
 assert(focusCalls.every(options=>options.preventScroll===true));
 document.hidden=true;frameHandlers.load();handlers.focus();
 assert.equal(focusCalls.length,2);assert.equal(windowFocusCalls.length,2);
});


test('Only the embedding allowlisted parent can request keyboard focus',()=>{
 const listeners={},parent={postMessage(){}},calls=[];
 const frame={contentWindow:{focus:()=>calls.push('window')},focus:()=>calls.push('frame'),addEventListener(){}};
 const window={addEventListener:(type,fn)=>(listeners[type]??=[]).push(fn)};
 const context={URL,URLSearchParams,location:{origin:'https://bladefall2d.pages.dev',search:''},document:{hidden:false,referrer:'https://2dvibes.com/',querySelector:()=>frame},window,parent,setInterval(){}};
 vm.runInNewContext(fs.readFileSync(new URL('../public/2dvibes-play.js',import.meta.url),'utf8'),context);
 const send=event=>listeners.message.forEach(fn=>fn(event));
 const event={source:parent,origin:'https://2dvibes.com',data:{type:'2dvibes:focus'}};
 send({...event,source:{}});send({...event,origin:'https://other.example'});send({...event,data:{type:'other'}});assert.equal(calls.length,0);
 send(event);assert.deepEqual(calls,['frame','window']);
});

test('Published edition links open Ascend or standalone Explore directly, and preserve the trial override',()=>{
 const source=fs.readFileSync(new URL('../public/2dvibes-play.js',import.meta.url),'utf8');
 for(const [search,expected] of [['?edition=ascend','/precision.html?pitch=climb&mode=play'],['?edition=explore','/?standalone=explore'],['?edition=ascend&challenge=outskirts-v1','/?dvTrial=outskirts-v1'],['?edition=unknown','/']]){
  const frame={src:'/',addEventListener(){}},window={addEventListener(){}};
  vm.runInNewContext(source,{URL,URLSearchParams,location:{search},document:{referrer:'',querySelector:()=>frame},window,parent:window});
  assert.equal(frame.src,expected);
 }
});
