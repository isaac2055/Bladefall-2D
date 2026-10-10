// Touch controls for the Precision Core (7.258), checked in headless Chrome emulating a Galaxy S23 Ultra in
// landscape (824×384 CSS px, 2.8125 dppx, touch). Real touch events go in; the game's own events come out.
// Needs the dev server:  npm run serve   (or the preview server), then
//   node scripts/verify-touch-controls.mjs [base-url]      default http://localhost:8371
import {launchChrome} from '../tests/launch-chrome.mjs';
const BASE=(process.argv[2]||'http://localhost:8371').replace(/\/$/,'');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const VP={width:824,height:384,deviceScaleFactor:2.8125,isMobile:true,hasTouch:true,isLandscape:true};
const browser=await launchChrome({headless:true,args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const page=await browser.newPage();
await page.setUserAgent('Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36');
await page.setViewport(VP);
await page.evaluateOnNewDocument(()=>{localStorage.setItem('bladefall.pcore.v1',JSON.stringify({touch:{preset:'gestures'}}));});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
let fail=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fail++;};
await page.goto(BASE+'/precision.html',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.BladefallPrecisionView&&BladefallPrecisionView.view.mode==='menu',{timeout:30000});await delay(300);

const m=await page.evaluate(()=>({active:BladefallPrecisionTouch.active(),tabs:document.querySelectorAll('.pcTab').length,pages:document.querySelectorAll('.pcPage').length}));
ok(m.active&&m.tabs>10&&m.tabs===m.pages,`touch is on and the chapter menu is swipeable pages (${m.pages})`);
const box=await page.evaluate(()=>{const r=document.querySelector('.pcPages').getBoundingClientRect();return {x:r.left,y:r.top,w:r.width};});
let t=await page.touchscreen.touchStart(box.x+box.w*.8,box.y+60);for(let i=1;i<=8;i++){await t.move(box.x+box.w*(.8-.07*i),box.y+62);await delay(16);}await t.end();await delay(900);
ok(await page.evaluate(()=>document.querySelector('.pcTab.on')?.textContent==='II'),'a swipe turns the menu to Part II');

const W=VP.width,H=VP.height,R={x:W*.78,y:H*.6},Lf={x:W*.18,y:H*.65};
async function room(ch,setup){await page.evaluate((ch,setup)=>{BladefallPrecisionView.startChapter(ch);const g=BladefallPrecisionView.view.g;g.awake=true;if(setup)new Function('g',setup)(g);
 window.__ev=[];const T=BladefallPrecisionTouch;if(!T.__h){T.__h=1;const o=T.event;T.event=e=>{window.__ev.push(e.type);o(e);};}},ch,setup||'');await delay(250);await take();}
async function take(){return page.evaluate(()=>{const g=BladefallPrecisionView.view.g,e=window.__ev||[];window.__ev=[];return {ev:e,p:{x:g.p.x,y:g.p.y,state:g.p.state,dir:g.p.dashDir,carry:!!g.p.carrying}};});}
const tap=async(x,y,ms=40)=>{const h=await page.touchscreen.touchStart(x,y);await delay(ms);await h.end();};
const flick=async(dx,dy)=>{const h=await page.touchscreen.touchStart(R.x,R.y);for(let i=1;i<=4;i++){await h.move(R.x+dx*i/4,R.y+dy*i/4);await delay(8);}await h.end();};

await room(0);await tap(R.x,R.y);await delay(500);let s=await take();ok(s.ev.includes('jump'),'tap jumps');
await room(0);await flick(48,0);await delay(400);s=await take();ok(s.ev.includes('dash')&&!s.ev.includes('jump')&&s.p.dir.x>0&&s.p.dir.y===0,'a sideways flick dashes sideways, with no jump'+(s.ev.includes('dash')&&!s.ev.includes('jump')&&s.p.dir.x>0&&s.p.dir.y===0?'':' '+JSON.stringify(s)));
await room(0);await flick(-40,-40);await delay(400);s=await take();ok(s.ev.includes('dash')&&s.p.dir.x<0&&s.p.dir.y<0,'an up-left flick dashes up-left');
await room(0);t=await page.touchscreen.touchStart(Lf.x,Lf.y);await t.move(Lf.x+40,Lf.y);await delay(500);s=await take();await t.end();ok(s.p.x>40,'the left thumb moves the knight');
await room(0,'g.p.x=8;g.p.facing=-1;');t=await page.touchscreen.touchStart(Lf.x,Lf.y);await t.move(Lf.x-40,Lf.y);await delay(80);
let h=await page.touchscreen.touchStart(R.x,R.y);await delay(450);s=await take();await h.end();await t.end();ok(s.p.state==='climb'&&!s.ev.includes('jump'),'a hold on a wall clings, without jumping');
await room(6,"const l=g.ents.find(e=>e.type==='lantern');g.p.x=l.x-6;g.p.y=l.y+l.h-g.p.h;");
await tap(R.x,R.y,380);await delay(250);s=await take();ok(s.p.carry&&s.ev.includes('pickup')&&!s.ev.includes('jump'),'a hold by the lantern picks it up');
await tap(R.x,R.y);await delay(600);s=await take();ok(s.p.carry&&s.ev.includes('jump'),'a tap while carrying jumps');
await tap(R.x,R.y,380);await delay(400);s=await take();ok(!s.p.carry&&s.ev.includes('throw'),'a second hold throws it');
await room(29);await tap(R.x,R.y);await delay(90);await tap(R.x+4,R.y);await delay(400);s=await take();ok(s.ev.includes('parry-ready'),'double-tap parries (foes room)');
await room(0);let a=await page.touchscreen.touchStart(R.x-30,R.y-40),b=await page.touchscreen.touchStart(R.x+30,R.y-40);
for(let i=1;i<=4;i++){await a.move(R.x-30,R.y-40+10*i);await b.move(R.x+30,R.y-40+10*i);await delay(10);}await a.end();await b.end();await delay(400);s=await take();ok(s.ev.includes('strike'),'a two-finger swipe strikes');
await room(0);await tap(W-31,31);await delay(300);ok(await page.evaluate(()=>BladefallPrecisionView.view.paused),'the pause button pauses');
ok(errors.length===0,'no page errors'+(errors.length?': '+errors.join(' | '):''));
await browser.close();
console.log(fail?`${fail} failed`:'all passed');process.exit(fail?1:0);
