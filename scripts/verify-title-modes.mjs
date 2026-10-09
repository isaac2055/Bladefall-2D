import assert from 'node:assert/strict';
import {launchChrome} from '../tests/launch-chrome.mjs';
const b=await launchChrome({headless:true,args:['--no-sandbox']});
try{
 const p=await b.newPage();await p.setViewport({width:1280,height:900});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const title=async()=>{await p.goto('http://localhost:8371/index.html');await p.waitForSelector('#newBtn');};
 await title();assert.equal(await p.$eval('#newBtn',e=>e.textContent),'🧭 Explore');assert.equal(await p.$eval('#bladescentBtn',e=>e.textContent),'⚔️ Survive');assert.equal(await p.$('#contBtn'),null);
 const widths=await p.evaluate(()=>['extrasBtn','coopBtn'].map(id=>document.getElementById(id).getBoundingClientRect().width));assert.equal(widths[0],widths[1]);
 await p.goto('http://localhost:8371/precision.html?pitch=climb&world=2&mode=review');await p.waitForFunction(()=>window.BladefallPrecisionView?.view.g);
 const checkpoint=await p.evaluate(()=>JSON.parse(localStorage.getItem('bladefall.climb.atlas.v1')).checkpoint);
 await title();assert.equal(await p.$eval('#contBtn',e=>e.textContent),'Continue — Survive');await p.screenshot({path:'scripts/climb/.cache/title-survive.png'});
 await Promise.all([p.waitForNavigation(),p.click('#contBtn')]);await p.waitForFunction(()=>window.BladefallPrecisionView?.view.g);
 assert.equal(await p.evaluate(()=>BladefallPrecisionView.view.g.room.id),checkpoint.room);assert.equal(await p.evaluate(()=>BladefallClimbSession.state().mode),'review');
 await title();await p.evaluate(()=>{beginRun(0,null,{hp:1,dmg:1});saveRunAtStage(0);titleScreen();});
 assert.equal(await p.$eval('#contBtn',e=>e.textContent),'Continue — Explore');await p.click('#contBtn');assert.equal(await p.evaluate(()=>mode),'play');
 await title();await p.click('#coopBtn');assert.ok(await p.$('#coopExplore'));assert.ok(await p.$('#coopSurvive'));await p.screenshot({path:'scripts/climb/.cache/title-coop-choice.png'});
 await p.click('#coopExplore');await p.waitForSelector('#coopHost');
 await title();await p.click('#coopBtn');await Promise.all([p.waitForNavigation(),p.click('#coopSurvive')]);await p.waitForSelector('#coHost');assert.ok(await p.$('#coJoin'));
 // Merely opening the other game's co-op menu does not replace the last-played choice.
 await title();assert.equal(await p.$eval('#contBtn',e=>e.textContent),'Continue — Explore');
 assert.deepEqual(errors,[]);console.log('PASS: Explore/Survive names, matching Extras width, last-played Continue in both directions, saved Survive room/review mode, both co-op choices, menu browsing preserves last-played.');
}finally{await b.close();}
