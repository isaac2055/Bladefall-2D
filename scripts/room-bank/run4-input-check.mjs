// Human-facing input paths for the revised reverse-cut rooms: Dash, later Strike, then reverse Jump.
import assert from 'node:assert/strict';import fs from 'node:fs';
import {launchChrome} from '../../tests/launch-chrome.mjs';
const browser=await launchChrome({headless:true,args:['--no-sandbox']});
try{for(const id of ['31','32'])for(const mode of ['keyboard','gamepad']){
 const record=JSON.parse(fs.readFileSync(new URL('./fractured/'+id+'-bank-f'+id+'.json',import.meta.url),'utf8'));
 const page=await browser.newPage();await page.evaluateOnNewDocument(mode=>{
  window.requestAnimationFrame=()=>0;window.cancelAnimationFrame=()=>{};
  if(mode==='gamepad'){window.testPad={index:0,id:'Standard test controller',mapping:'standard',connected:true,axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[testPad]});}
 },mode);
 await page.goto('http://localhost:8371/precision.html?pitch=bank&mode=play&room='+record.room.id);
 await page.waitForFunction(id=>window.BladefallPrecisionView?.view.g?.room.id===id,{},record.room.id);
 await page.evaluate(()=>{window.inputEvents=[];BladefallPrecisionDeviceViews.push({event:e=>inputEvents.push(e.type)});});
 const codes={l:'ArrowLeft',r:'ArrowRight',u:'ArrowUp',d:'ArrowDown',j:'Space',x:'d',g:'a',s:'w',p:'f',q:'p'},pad={l:14,r:15,u:12,d:13,j:0,x:2,g:4,s:3,p:7,q:5};let held=new Set();
 for(const [frames,keys]of record.tape){const next=new Set(keys);
  if(mode==='gamepad')await page.evaluate(({keys,pad})=>{for(const b of testPad.buttons){b.pressed=false;b.value=0;}for(const k of keys)testPad.buttons[pad[k]]={pressed:true,value:1};},{keys,pad});
  else{for(const k of held)if(!next.has(k))await page.keyboard.up(codes[k]);for(const k of next)if(!held.has(k))await page.keyboard.down(codes[k]);}
  held=next;await page.evaluate(n=>BladefallPrecisionView.pump(n),frames);
 }
 const events=await page.evaluate(()=>inputEvents);assert.ok(events.includes('exit'),record.room.id+' '+mode+' exits');assert.ok(!events.includes('death'),record.room.id+' '+mode+' no deaths');assert.ok(events.includes('reverse-hyper'),record.room.id+' '+mode+' reverse');
 console.log('PASS: '+record.room.id+' '+mode+' delayed Strike and late reverse through actual input mapping.');await page.close();
}}finally{await browser.close();}
