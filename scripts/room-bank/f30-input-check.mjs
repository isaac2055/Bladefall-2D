// Exercise real view keyboard / pad mapping while retaining Grab across the Echo press.
import assert from 'node:assert/strict';import fs from 'node:fs';
import {launchChrome} from '../../tests/launch-chrome.mjs';
const record=JSON.parse(fs.readFileSync(new URL('./fractured/30-bank-f30.json',import.meta.url),'utf8'));
const browser=await launchChrome({headless:true,args:['--no-sandbox']});
const results=[];
try{for(const mode of ['keyboard','rebound-keyboard','gamepad']){
 const page=await browser.newPage();await page.setViewport({width:1440,height:960});
 await page.evaluateOnNewDocument(mode=>{
  window.requestAnimationFrame=()=>0;window.cancelAnimationFrame=()=>{};
  if(mode==='rebound-keyboard')localStorage.setItem('bladefall.pcore.v1',JSON.stringify({binds:{keys:{portal:['KeyE']}}}));
  if(mode==='gamepad'){
   window.testPad={index:0,id:'Standard test controller',mapping:'standard',connected:true,axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
   Object.defineProperty(navigator,'getGamepads',{value:()=>[window.testPad]});
  }
 },mode);
 await page.goto('http://localhost:8371/precision.html?pitch=bank&mode=play&room=bank-f30');
 await page.waitForFunction(()=>window.BladefallPrecisionView?.view.g?.room.id==='bank-f30');
 await page.evaluate(()=>{window.inputEvents=[];BladefallPrecisionDeviceViews.push({event:e=>inputEvents.push({...e})});});
 const codes={l:'ArrowLeft',r:'ArrowRight',u:'ArrowUp',d:'ArrowDown',j:'Space',g:'a',q:mode==='rebound-keyboard'?'e':'p'};
 const pad={l:14,r:15,u:12,d:13,j:0,g:4,q:5};let held=new Set();
 for(const [frames,keys]of record.tape){
  const next=new Set(keys);
  if(mode==='gamepad')await page.evaluate(({keys,pad})=>{for(const b of testPad.buttons){b.pressed=false;b.value=0;}for(const k of keys){testPad.buttons[pad[k]]={pressed:true,value:1};}}, {keys,pad});
  else{for(const k of held)if(!next.has(k))await page.keyboard.up(codes[k]);for(const k of next)if(!held.has(k))await page.keyboard.down(codes[k]);}
  held=next;await page.evaluate(n=>BladefallPrecisionView.pump(n),frames);
 }
 const result=await page.evaluate(()=>({events:inputEvents.map(e=>e.type),exits:inputEvents.filter(e=>e.type==='exit').length,deaths:inputEvents.filter(e=>e.type==='death').length,detach:inputEvents.filter(e=>e.type==='unhook'&&e.why==='echo').length,swaps:inputEvents.filter(e=>e.type==='echo-swap').length}));
 assert.equal(result.exits,1,mode+' completes');assert.equal(result.deaths,0,mode+' no deaths');assert.equal(result.detach,1,mode+' swap releases rope');assert.equal(result.swaps,1);
 results.push({mode,...result});await page.close();
 }
 fs.writeFileSync(new URL('./evidence/run23/f30-browser-input.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),input:'Actual view keyboard events and standard mapped gamepad; no raw tape injection',results},null,2)+'\n');
 console.log('PASS: F30 held-Grab Echo finish via default P, rebound E, and controller RB; zero deaths.');
}finally{await browser.close();}
