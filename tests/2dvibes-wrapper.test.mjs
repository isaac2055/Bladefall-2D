import fs from 'node:fs';import vm from 'node:vm';import test from 'node:test';import assert from 'node:assert/strict';
test('Wrapper counts moving clock, completion once, and same-course restarts only',()=>{
 let run=null,tick,engaged=true;const messages=[],context={URL,URLSearchParams,location:{search:""},document:{referrer:'https://2dvibes.com/',hidden:false,querySelector:()=>({contentWindow:{BladefallPlaytest:{state:()=>({run})}}})},parent:{postMessage:data=>messages.push(data)},setInterval:fn=>tick=fn};context.window={dvCreateEngagement:()=>({active:()=>engaged})};vm.runInNewContext(fs.readFileSync(new URL('../public/2dvibes-play.js',import.meta.url),'utf8'),context);tick();assert.equal(messages.filter(m=>m.event==='engine_ready').length,1);run={id:'1',mode:'explore',world:'0',ms:0,done:false};tick();for(let i=0;i<10;i++){run.ms+=1000;tick();}assert.equal(messages.filter(m=>m.event==='gameplay_active').length,1);context.document.hidden=true;for(let i=0;i<12;i++){run.ms+=1000;tick();}assert.equal(messages.filter(m=>m.event==='gameplay_active').length,1);context.document.hidden=false;engaged=false;for(let i=0;i<12;i++){run.ms+=1000;tick();}assert.equal(messages.filter(m=>m.event==='gameplay_active').length,1);engaged=true;run.done=true;tick();tick();assert.equal(messages.filter(m=>m.event==='completion').length,1);run={...run,id:'2',done:false,ms:0};tick();run={...run,id:'3',world:'1'};tick();assert.equal(messages.filter(m=>m.event==='retry').length,1);
});

test('Only the published challenge slug launches the Outskirts time trial',()=>{
 const source=fs.readFileSync(new URL('../public/2dvibes-play.js',import.meta.url),'utf8');
 for(const [search,expected] of [['?challenge=outskirts-v1','/?timeTrial=0'],['?challenge=other','/'],['?timeTrial=7','/']]){
  const frame={src:'/'},window={};
  vm.runInNewContext(source,{URL,URLSearchParams,location:{search},document:{referrer:'',querySelector:()=>frame},window,parent:window});
  assert.equal(frame.src,expected);
 }
});

test('Trial preview sends one bounded result for the matching route and season', () => {
 const origin = 'https://outskirts-trial.2dvibes.pages.dev';
 let tick;
 const run = {id:'1', world:'0', campaign:'base', mode:'explore', season:'playtest-2026-10-v2', ms:61789.4, deaths:2, eligible:false, done:false};
 const frame = {contentDocument:{}, contentWindow:{BladefallPlaytest:{state:()=>({run})}}};
 const messages = [];
 const context = {
  URL, URLSearchParams, location:{search:'?challenge=outskirts-v1'},
  document:{referrer:origin+'/',querySelector:()=>frame},
  parent:{postMessage:(data,target)=>messages.push({data,target})},
  window:{dvCreateEngagement:()=>({active:()=>false})}, setInterval:fn=>{tick=fn;}
 };
 const script = fs.readFileSync(new URL('../public/2dvibes-play.js',import.meta.url),'utf8');
 vm.runInNewContext(script,context);
 tick();
 assert.equal(messages.filter(m=>m.data.type==='2dvibes:trial-result').length,0);
 run.done = true;
 tick();
 tick();
 const result = messages.filter(m=>m.data.type==='2dvibes:trial-result');
 assert.equal(result.length,1);
 assert.deepEqual(JSON.parse(JSON.stringify(result[0])),{
  target:origin, data:{type:'2dvibes:trial-result',challenge:'outskirts-v1',ms:61789,deaths:2,eligible:false}
 });
 Object.assign(run,{id:'2',world:'1'});
 tick();
 assert.equal(messages.filter(m=>m.data.type==='2dvibes:trial-result').length,1);
});
