// Explore Record (7.341), end to end in a normal game page: ● Record the opening of The Outskirts with real key presses,
// pause, save it, then Watch the saved route back and require it to end exactly where the recording did. Also checks
// that recording and watching leave the player's save untouched.
import assert from 'node:assert/strict';
import {launchChrome} from '../../tests/launch-chrome.mjs';
import {serve,readRoutes,watchRoute} from './lib.mjs';
const {server,url}=await serve(),browser=await launchChrome({headless:true,args:['--no-sandbox']}),routes=await readRoutes();
try{
 const page=await browser.newPage();await page.setViewport({width:1280,height:720,deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url+'/index.html',{waitUntil:'load'});await page.waitForFunction(()=>typeof exploreWatchStart==='function'&&window.__BF,{timeout:60000});
 await new Promise(r=>setTimeout(r,1000));
 const saveBefore=await page.evaluate(()=>JSON.stringify(Object.fromEntries(Object.keys(localStorage).filter(k=>!k.startsWith('bladefall.explore.')&&k!=='bladefall.last-played.v1').map(k=>[k,localStorage.getItem(k)]))));
 assert(await page.evaluate(()=>exploreWatchStart([0],'',{record:true,cont:false})),'record starts');
 await page.waitForFunction(()=>exploreWatch&&exploreWatch.rec.length>5);
 // Run right, jump twice, keep running: real keydown/keyup events through the game's keyboard.
 await page.keyboard.down('ArrowRight');await new Promise(r=>setTimeout(r,1500));
 for(let i=0;i<2;i++){await page.keyboard.down('Space');await new Promise(r=>setTimeout(r,250));await page.keyboard.up('Space');await new Promise(r=>setTimeout(r,500));}
 await new Promise(r=>setTimeout(r,1200));await page.keyboard.up('ArrowRight');await new Promise(r=>setTimeout(r,300));
 await page.keyboard.press('Escape');await page.waitForSelector('#recSave',{timeout:5000});
 const live=await page.evaluate(()=>({frames:exploreWatch.rec.length,x:Math.round(G.p.x)}));
 await page.click('#recSave');await page.waitForFunction(()=>!exploreWatch);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('bladefall.explore.route.0')));
 assert(saved&&saved.end==='partial'&&saved.source==='recorded','the recording is saved on this device as a partial route');
 assert.equal(saved.reachedX,live.x,'the saved route ends where the knight stood');
 assert(saved.frames>=live.frames&&live.x>200,'the recording covers the run ('+live.frames+' frames, x='+live.x+')');
 assert(await page.$('#lvlExportRoutes'),'the level select offers Export');
 const saveAfter=await page.evaluate(()=>JSON.stringify(Object.fromEntries(Object.keys(localStorage).filter(k=>!k.startsWith('bladefall.explore.')&&k!=='bladefall.last-played.v1').map(k=>[k,localStorage.getItem(k)]))));
 if(saveAfter!==saveBefore){const A=JSON.parse(saveBefore),B=JSON.parse(saveAfter);const diff=[];
  const walk=(a,b,p)=>{if(JSON.stringify(a)===JSON.stringify(b))return;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))walk(a[k],b[k],p+'.'+k);}else diff.push(p+': '+JSON.stringify(a)?.slice(0,80)+' → '+JSON.stringify(b)?.slice(0,80));};
  for(const k of new Set([...Object.keys(A),...Object.keys(B)])){let a=A[k],b=B[k];try{a=JSON.parse(a);b=JSON.parse(b);}catch{}walk(a,b,k);}
  if(diff.length)assert.fail('recording wrote the campaign save:\n  '+diff.slice(0,20).join('\n  '));}
 const v=await watchRoute(browser,url,routes,0,saved);
 assert(v.ok&&v.x===saved.reachedX,`the watch replays the recording exactly (watched to ${v.x}, recorded ${saved.reachedX})`);
 assert.deepEqual(errors,[]);
 console.log(`PASS: recorded ${live.frames} frames of The Outskirts with real keys (x=${live.x}), saved, watched back to the same pixel; campaign save untouched.`);
}finally{await browser.close();server.close();}
