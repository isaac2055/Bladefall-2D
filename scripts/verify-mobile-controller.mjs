// Browser input check: real touch events and a synthetic standard Gamepad API.
// No claim of testing a physical controller or Android handset.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {launchChrome} from '../tests/launch-chrome.mjs';
const base=process.argv[2]||'http://localhost:8371',out='scripts/climb/.cache/mobile-7.304';
await mkdir(out,{recursive:true});
const browser=await launchChrome({headless:true,args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
process.on('uncaughtException',async error=>{console.error(error);await browser.close();process.exit(1);});
const checks=[],errors=[];const ok=(condition,label,detail)=>{assert.ok(condition,label+': '+JSON.stringify(detail));checks.push({label,detail});console.log('PASS',label);};
const page=await browser.newPage();page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message);});
await page.setViewport({width:844,height:390,isMobile:true,hasTouch:true});
await page.evaluateOnNewDocument(()=>{window.__pad={id:'Synthetic standard controller',index:0,mapping:'standard',connected:false,axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[__pad]});});
await page.goto(base+'/precision.html?pitch=climb&world=1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.BladefallPrecisionView?.view.g);
const defaults=await page.evaluate(()=>({touch:BladefallPrecisionTouch.active(),settings:BladefallPrecisionTouch.settings(),canvas:{width:pcCanvas.width,height:pcCanvas.height}}));
ok(defaults.touch&&defaults.settings.preset==='buttons'&&Object.values(defaults.settings.map).every(v=>v==='button'),'Mobile website loads Survive with direct action buttons',defaults);
await page.goto(base+'/precision.html?chapter=0',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.BladefallPrecisionView?.view.g);
// Use real input polling and physics, but suppress background RAF so the comparisons
// depend on exact ticks rather than headless browser scheduling.
await page.evaluate(()=>{window.requestAnimationFrame=()=>0;window.__events=[];const event=BladefallPrecisionTouch.event;BladefallPrecisionTouch.event=e=>{__events.push(e.type);event(e);};});
await new Promise(r=>setTimeout(r,150));
async function reset(){await page.evaluate(()=>{__pad.connected=false;__pad.axes=[0,0];__pad.buttons.forEach(b=>{b.pressed=false;b.value=0;});BladefallPrecisionTouch.releaseAll();BladefallPrecisionView.clearInput();BladefallPrecisionView.startChapter(0);BladefallPrecisionView.view.frameAcc=0;BladefallPrecisionView.view.wipe=0;BladefallPrecisionView.view.wipeTo=null;BladefallPrecisionView.pump(2);__events=[];});}
const pump=n=>page.evaluate(n=>BladefallPrecisionView.pump(n),n);
async function keys(key,code){await reset();return page.evaluate(({key,code})=>{const v=BladefallPrecisionView;dispatchEvent(new KeyboardEvent('keydown',{key,code,bubbles:true}));v.pump(6);dispatchEvent(new KeyboardEvent('keyup',{key,code,bubbles:true}));v.pump(1);return {events:__events,x:v.view.g.p.x,y:v.view.g.p.y,vx:v.view.g.p.vx};},{key,code});}
const lower=await keys('d','KeyD'),upper=await keys('D','KeyD'),fallback=await keys('D','');
ok(lower.events.includes('dash')&&JSON.stringify(lower)===JSON.stringify(upper)&&JSON.stringify(lower)===JSON.stringify(fallback),'Survive lowercase, Caps Lock and code-less uppercase dash match',{lower,upper,fallback});
await reset();
await page.evaluate(()=>{__pad.connected=true;__pad.axes=[1,0];});await pump(12);
let state=await page.evaluate(()=>({x:BladefallPrecisionView.view.g.p.x,touch:BladefallPrecisionTouch.active()}));
ok(state.x>30&&!state.touch,'Survive controller stick moves and dismisses touch overlay',state);
await page.evaluate(()=>{__pad.buttons[0]={pressed:true,value:1};});await pump(3);
ok(await page.evaluate(()=>__events.includes('jump')),'Survive controller A jumps');
await page.evaluate(()=>{__pad.buttons[2]={pressed:true,value:1};__pad.axes=[-1,-1];});await pump(6);
state=await page.evaluate(()=>({events:__events,dir:BladefallPrecisionView.view.g.p.dashDir}));ok(state.events.includes('dash')&&state.dir.x<0&&state.dir.y<0,'Survive controller diagonal dash',state);
for(const [button,action] of [[4,'grab'],[3,'strike'],[7,'parry'],[5,'portal']]){await reset();await page.evaluate(button=>{__pad.connected=true;__pad.buttons[button]={pressed:true,value:1};},button);await pump(1);ok(await page.evaluate(action=>BladefallPrecisionView.view.lastInput[action],action),'Survive controller '+action+' mapping');}
await page.evaluate(()=>{__pad.buttons[9]={pressed:true,value:1};});await pump(1);
ok(await page.evaluate(()=>BladefallPrecisionView.view.paused),'Survive controller Start pauses');
await reset();await page.evaluate(()=>BladefallPrecisionTouch.setActive(true));
const s=Math.max(.8,Math.min(1.3,390/400));
const button={jump:[844-66*s,390-66*s],dash:[844-156*s,390-58*s],grab:[844-236*s,390-52*s],strike:[844-62*s,390-156*s],parry:[844-136*s,390-140*s],portal:[844-204*s,390-128*s]};
const touch=await page.touchscreen.touchStart(...button.jump);await pump(1);
ok(await page.evaluate(()=>__events.includes('jump')),'Touch jump fires on the first simulation frame');await touch.end();
await reset();await page.evaluate(()=>BladefallPrecisionTouch.setActive(true));const shortPress=await page.touchscreen.touchStart(...button.jump);await pump(3);await shortPress.end();await pump(9);const shortY=await page.evaluate(()=>BladefallPrecisionView.view.g.p.y);
await reset();await page.evaluate(()=>BladefallPrecisionTouch.setActive(true));const longPress=await page.touchscreen.touchStart(...button.jump);await pump(12);const longY=await page.evaluate(()=>BladefallPrecisionView.view.g.p.y);await longPress.end();ok(longY<shortY-3,'Direct jump buttons preserve short-hop versus held-jump control',{shortY,longY});
await reset();await page.evaluate(()=>BladefallPrecisionTouch.setActive(true));
const beforeStick=await page.evaluate(()=>BladefallPrecisionView.view.g.p.x);
const stick=await page.touchscreen.touchStart(150,290);await stick.move(160,290);await pump(10);
state=await page.evaluate(()=>({x:BladefallPrecisionView.view.g.p.x,input:BladefallPrecisionTouch.read(0),debug:BladefallPrecisionTouch._debug(),viewport:[innerWidth,innerHeight]}));ok(state.x>beforeStick+4&&state.input.r,'A ten-pixel thumb movement steers',state);
const dash=await page.touchscreen.touchStart(...button.dash);await pump(1);
ok(await page.evaluate(()=>BladefallPrecisionView.view.g.p.state==='dash'),'Touch movement and dash work simultaneously');await dash.end();await stick.end();
for(const a of ['grab','strike','parry','portal']){await reset();await page.evaluate(()=>BladefallPrecisionTouch.setActive(true));const t=await page.touchscreen.touchStart(...button[a]);const input=await page.evaluate(()=>BladefallPrecisionTouch.read(1/60));ok(input[a]===true,'Touch '+a+' reads immediately');await t.end();}
await reset();await page.evaluate(()=>BladefallPrecisionTouch.setActive(true));const hold=await page.touchscreen.touchStart(...button.grab);await pump(1);await page.evaluate(()=>dispatchEvent(new Event('blur')));ok(await page.evaluate(()=>!BladefallPrecisionTouch.read(1/60).grab),'Backgrounding clears held touch actions');await hold.end();
await page.screenshot({path:out+'/survive-mobile.png'});
// An existing layout must not be silently changed by the new default.
await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('bladefall.pcore.v1')||'{}');s.touch={preset:'gestures'};localStorage.setItem('bladefall.pcore.v1',JSON.stringify(s));});await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.BladefallPrecisionTouch?.settings());ok(await page.evaluate(()=>BladefallPrecisionTouch.settings().map.jump==='tap'),'Existing gesture preference is retained');
await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.__BF&&document.querySelector('#bladescentBtn'));await page.evaluate(()=>{__pad.connected=true;__pad.buttons[13]={pressed:true,value:1};});await new Promise(r=>setTimeout(r,100));
state=await page.evaluate(()=>({id:document.activeElement.id,mode:__BF.mode,button:document.activeElement.tagName==='BUTTON'&&!!document.activeElement.closest('#overlay')}));ok(state.button,'Controller can navigate title menu',state);
await page.evaluate(()=>{__pad.buttons[13]={pressed:false,value:0};beginRun(0,null,{hp:1,dmg:1},{testRun:true,levelSelect:true,startStage:0});});await new Promise(r=>setTimeout(r,200));
const ex0=await page.evaluate(()=>__BF.G.p.x);await page.evaluate(()=>{__pad.axes=[1,0];});await page.waitForFunction(x=>__BF.G.p.x>x+10,{timeout:5000},ex0);
state=await page.evaluate(()=>({x:__BF.G.p.x,mode:__BF.mode,held:BFPad.isDown('right'),latch:bfPadPlayLatch,dialog:document.querySelector('dialog[open]')?.textContent,paused:__BF.G.paused}));ok(state.x>ex0+10,'Explore controller stick moves knight',{ex0,...state});
await page.evaluate(()=>{__pad.axes=[0,0];__pad.buttons[0]={pressed:true,value:1};});await new Promise(r=>setTimeout(r,90));
ok(await page.evaluate(()=>!__BF.G.p.onGround&&__BF.G.p.vy<0),'Explore controller A jumps');
await page.evaluate(()=>{__pad.buttons[0]={pressed:false,value:0};__pad.buttons[9]={pressed:true,value:1};});await new Promise(r=>setTimeout(r,80));ok(await page.evaluate(()=>__BF.mode!=='play'),'Explore controller Start pauses');
const allExplore=await page.evaluate(()=>{const mappings=[[0,'jump'],[1,'dash'],[2,'attack'],[3,'pickup'],[5,'portal'],[6,'tool'],[7,'counter'],[9,'pause'],[0,'flip',true],[1,'companion',true],[2,'hook',true],[3,'echo',true],[5,'swap',true],[7,'checkpoint',true]];return mappings.map(([button,action,utility])=>{__pad.buttons.forEach(b=>{b.pressed=false;b.value=0;});__pad.buttons[button]={pressed:true,value:1};if(utility)__pad.buttons[4]={pressed:true,value:1};BFPad.poll();return {action,held:BFPad.isDown(action)};});});ok(allExplore.every(x=>x.held),'Explore controller reaches every mapped combat and utility action',allExplore);
await page.evaluate(()=>{__pad.connected=false;beginRun(0,null,{hp:1,dmg:1},{testRun:true,levelSelect:true,startStage:0});});await new Promise(r=>setTimeout(r,150));
const touchStart=await page.evaluate(()=>({x:__BF.G.p.x,zone:document.getElementById('joyzone').getBoundingClientRect().toJSON()}));
const ej=await page.touchscreen.touchStart(touchStart.zone.x+80,touchStart.zone.y+60);await ej.move(touchStart.zone.x+125,touchStart.zone.y+60);await page.waitForFunction(x=>__BF.G.p.x>x+10,{timeout:5000},touchStart.x);await ej.end();ok(true,'Explore mobile joystick moves knight');
const jumpBox=await page.$eval('#bJump',e=>{const b=e.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2};});const jtouch=await page.touchscreen.touchStart(jumpBox.x,jumpBox.y);await page.waitForFunction(()=>!__BF.G.p.onGround&&__BF.G.p.vy<0,{timeout:5000});await jtouch.end();ok(true,'Explore mobile Jump button jumps');
const normalized=await page.evaluate(()=>{const I=BladefallInput;return ['d','D','keyd','KeyD'].map(x=>I.normalizeCode(x));});ok(normalized.every(x=>x==='KeyD'),'Explore bindings normalize upper/lowercase',normalized);
await page.evaluate(()=>{__pad.connected=false;openSettings(()=>{});});await page.screenshot({path:out+'/explore-controls-mobile.png'});
ok(errors.length===0,'No browser page errors',errors);
await writeFile(out+'/receipt.json',JSON.stringify({version:'7.304',physicalController:false,physicalAndroidDevice:false,checks,errors},null,2));await browser.close();console.log(checks.length+' input checks passed');
