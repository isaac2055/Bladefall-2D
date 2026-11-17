// Actual mobile browser input, including a clearly ineligible dash-unlock fixture.
// Run against the local server or deployed site; never publishes a score.
import assert from 'node:assert/strict';
import {launchChrome} from '../tests/launch-chrome.mjs';
const base=(process.argv[2]||'http://localhost:8371').replace(/\/$/,'');
const browser=await launchChrome({headless:true});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try{
 const page=await browser.newPage();
 await page.setViewport({width:844,height:390,deviceScaleFactor:1,isMobile:true,hasTouch:true,isLandscape:true});
 await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1');
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/?dvTrial=outskirts-v1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__BF?.G?.p&&BladefallPlaytest.state().run?.ms>350,{timeout:30000});
 const state=()=>page.evaluate(()=>({x:G.p.x,y:G.p.y,dash:G.p.dodgeTimer,canDash:movementProfile().dash,
  input:{jx:input.jx,jz:input.jz,jump:input.jump,dodge:input.dodge},control:exploreTouch.state()}));
 assert.equal(await page.$eval('#bJump',e=>getComputedStyle(e).display),'none');
 assert.equal(await page.$eval('#bDodge',e=>getComputedStyle(e).display),'none');
 assert.equal(await page.$eval('#joy',e=>getComputedStyle(e).display),'none');
 const initial=await state();await page.touchscreen.tap(550,210);await wait(100);
 const tapped=await state();assert.ok(tapped.y>initial.y+10,JSON.stringify({initial,tapped}));
 await wait(700);
 const session=await page.createCDPSession(),send=(type,touchPoints)=>session.send('Input.dispatchTouchEvent',{type,touchPoints});
 const point=(x,y,id)=>({x,y,id,radiusX:4,radiusY:4});
 const left=point(120,240,1),right=point(168,240,1),tap=point(550,210,2),swipe=point(620,210,2);
 await send('touchStart',[left]);await send('touchMove',[right]);await wait(220);
 const moved=await state();assert.ok(moved.x>initial.x+20);
 await send('touchStart',[right,tap]);await wait(120);
 const jumped=await state();assert.ok(jumped.y>moved.y+10);
 await send('touchEnd',[]);await wait(600);
 assert.equal((await state()).canDash,false,'The trial must not start with an unlocked dash');
 await page.evaluate(()=>{BladefallPlaytest.invalidate('mobile control fixture');G.sessionCapabilities=__BF.capabilities.createState({acquired:['jump','weapon','dash']});});
 await send('touchStart',[tap]);await send('touchMove',[swipe]);await wait(30);
 const dashed=await state();assert.ok(dashed.dash>0,JSON.stringify(dashed));
 await send('touchEnd',[]);await wait(200);
 const released=await state();assert.equal(released.input.jx,0);assert.equal(released.input.jump,false);assert.equal(released.input.dodge,false);
 await page.tap('#pausebtn');const paused=await page.evaluate(()=>BladefallPlaytest.state().run.ms);
 await wait(300);assert.equal(await page.evaluate(()=>BladefallPlaytest.state().run.ms),paused);
 assert.deepEqual(errors,[]);
 console.log('EXPLORE_SMOOTH_BROWSER_PASS',JSON.stringify({initial,tapped,moved,jumped,dashed,released}));
}finally{await browser.close();}
