// Real WASM touch UI and save downloads in phone-sized WebKit or Chromium.
import {webkit,chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const base=process.argv[2] || 'http://127.0.0.1:8877';
const engine=process.argv[3] || 'webkit';
assert(['webkit','chromium'].includes(engine));
const out=path.resolve(process.argv[4] || `.cache/mobile/${engine}`);await fs.mkdir(out,{recursive:true});
const browser=await (engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{headless:true}:{headless:true,executablePath:process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--enable-unsafe-swiftshader']});
try {
 const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2,acceptDownloads:true});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.addInitScript(()=>{window.shortSounds=0;const start=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...args){if(this.buffer?.duration<3)window.shortSounds++;return start.apply(this,args)}});
 async function point(x,y){const b=await page.locator('#canvas').boundingBox();const s=Math.min(b.width/1280,b.height/832);return {x:b.x+(b.width-1280*s)/2+x*s,y:b.y+(b.height-832*s)/2+y*s};}
 async function tap(x,y){const p=await point(x,y);await page.touchscreen.tap(p.x,p.y)}
 await page.goto(new URL('/play/',base).href);await page.locator('#start').tap();await page.waitForFunction(()=>window.felixReady || document.querySelector('#error').textContent,null,{timeout:180000});assert.equal(await page.locator('#error').textContent(),'');await page.waitForTimeout(6500);
 const bounds=await page.locator('#canvas').boundingBox();assert(bounds.y>=44 && bounds.y+bounds.height<=391,'canvas covers header or overflows viewport');
 await tap(930,345);await page.waitForTimeout(500);await tap(640,400);await page.waitForTimeout(500);
 if(engine==='chromium'){
  const cdp=await context.newCDPSession(page);const a=await point(160,660),b=await point(240,660),jump=await point(1170,704);
  const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
  await touch('touchStart',[{...a,id:1}]);await touch('touchMove',[{...b,id:1}]);await page.waitForTimeout(1000);await touch('touchEnd',[]);await page.waitForTimeout(3500);await touch('touchStart',[{...a,id:1}]);await touch('touchMove',[{...b,id:1}]);await page.waitForTimeout(100);
  const before=await page.evaluate(()=>window.shortSounds);
  await touch('touchStart',[{...b,id:1},{...jump,id:2}]);await page.waitForTimeout(180);
  assert(await page.evaluate(()=>window.shortSounds)>before,'simultaneous stick + Jump did not play a gameplay effect');
  await page.screenshot({path:path.join(out,'multi-touch.png')});await touch('touchEnd',[]);
 }
 await page.screenshot({path:path.join(out,'gameplay.png')});await tap(1200,174);await page.waitForTimeout(800);await page.screenshot({path:path.join(out,'pause.png')});
 if(engine==='chromium'){
  const cdp=await context.newCDPSession(page);const start=await point(630,650),end=await point(630,350);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...start,id:3}]});
  for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/8,y:start.y+(end.y-start.y)*i/8,id:3}]});await page.waitForTimeout(40)}
  await page.waitForTimeout(250);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }
 await page.waitForTimeout(450);await page.screenshot({path:path.join(out,'pause-scrolled.png')});
 const download=page.waitForEvent('download',{timeout:30000});await tap(630,155);const save=await download;assert.equal(save.suggestedFilename(),'Felix-save.json');const file=path.join(out,'Felix-save.json');await save.saveAs(file);const bundle=JSON.parse(await fs.readFile(file,'utf8'));assert.equal(bundle.format,'felix-save');assert(bundle.files['felix-story-1.save'],'touch journey did not create a checkpoint');
 console.log('PASS',engine,'phone touch menus, gameplay and exported checkpoint');
 await page.setViewportSize({width:390,height:844});await page.locator('#rotate').waitFor({state:'visible'});await page.locator('#portrait').tap();await page.locator('#rotate').waitFor({state:'hidden'});await page.setViewportSize({width:844,height:390});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'phone layout overflows');
 assert.deepEqual(errors,[]);await fs.writeFile(path.join(out,'result.json'),JSON.stringify({base,engine,passed:true,bounds,errors},null,2)+'\n');
 console.log('PASS',engine,'portrait guidance, rotation and no browser runtime errors');
}finally{await browser.close()}
