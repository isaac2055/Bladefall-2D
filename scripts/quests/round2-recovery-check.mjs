// Real page reload, failed carry, replay UI, and no duplicate Ascend heart.
import assert from 'node:assert/strict';import fs from 'node:fs';import {open} from './harness.mjs';
const {page,errors,close}=await open('precision.html?pitch=climb&world=1&nosw=1',()=>!!window.BladefallPitchView?.climb?.startWorld);
fs.mkdirSync('.cache/round2/shots',{recursive:true});
async function helpers(){await page.evaluate(()=>{
 const P=BladefallPitchView,V=BladefallPrecisionView,E=BladefallClimbRound2,st=()=>P.climb.state();
 window.r2={go(room){const w=BladefallClimb.world(10);P.climb.startWorld(10,w.chapter.rooms.findIndex(r=>r.id===room));st().spoke.add('cl10-e10-line:maker');V.advance(['']);},
 at(sp,n=2){if(st().view.g.room.id!==sp.room)r2.go(sp.room);const g=st().view.g;Object.assign(g.p,{x:sp.x-4,y:g.flipped?g.room.h-sp.y-g.p.h/2:sp.y-g.p.h/2,vx:0,vy:0});V.advance(Array(n).fill(''));},
 hit(sp){r2.at(sp);const p=st().view.g.p;p.x=sp.x-10;p.facing=1;V.advance(['s',...Array(8).fill('')]);},
 finish(){let W=E.where('quota');r2.at(W[0]);r2.hit(W[0]);for(let i=0;i<150&&E.state('quota').step===0;i++)r2.at(W[0],1);r2.at(W[1]);r2.hit(W[2]);for(let i=0;i<300&&!E.state('quota').done;i++)r2.at(W[2],1);return E.state('quota').done;},
 hearts(){return JSON.stringify(JSON.parse(localStorage.getItem('bladefall.rbr.v1')||'{}').keepsakes);}};
 });}
try{
 await helpers();assert.ok(await page.evaluate(()=>{BladefallClimbRound2.reset('quota');r2.go('cl10-e10-line');const W=BladefallClimbRound2.where('quota');r2.hit(W[0]);for(let i=0;i<150&&BladefallClimbRound2.state('quota').step===0;i++)r2.at(W[0],1);return BladefallClimbRound2.state('quota').step===1;}),'marked scrap acquired');
 await page.reload({waitUntil:'load'});await page.waitForFunction(()=>!!window.BladefallPitchView?.climb?.startWorld);await new Promise(r=>setTimeout(r,1500));await helpers();
 assert.equal(await page.evaluate(()=>BladefallClimbRound2.state('quota').step),1,'page reload preserves task');
 const death=await page.evaluate(()=>{r2.go('cl10-e10-line');const st=BladefallPitchView.climb.state(),g=st.view.g;const before={world:st.world.n,review:st.review,mode:st.view.mode,met:[...st.spoke],E:st._round2};g.deaths++;BladefallPrecisionView.advance(['']);return {ok:!BladefallClimbRound2.state('quota').held,before,after:st._round2,s:BladefallClimbRound2.state('quota')};});assert.ok(death.ok,'death drops the carry');
 assert.ok(await page.evaluate(()=>r2.finish()),'dropped scrap can be recovered and handed in');
 const hearts=await page.evaluate(()=>r2.hearts());await page.screenshot({path:'.cache/round2/shots/ascend-quota-award.png'});
 await page.evaluate(()=>BladefallPrecisionView.options(()=>{}));await page.waitForSelector('#opShake');for(let i=0;i<5;i++)await page.click('#opShake');
 await page.evaluate(()=>{const s=BladefallPitchView.climb.state();s.review=false;BladefallPitchView.climb.menu();});await page.waitForSelector('#clReplayQuest');await page.click('#clReplayQuest');
 assert.ok(await page.evaluate(()=>BladefallClimbRound2.replaying({id:'quota'})&&BladefallClimbRound2.state('quota').step===0),'map button restarts only this quest');
 assert.equal(await page.evaluate(()=>r2.hearts()),hearts,'replay keeps existing heart');
 assert.ok(await page.evaluate(()=>{const s=BladefallPitchView.climb.state();s.spoke.add('cl10-e10-line:maker');return r2.finish();}),'replayed quest completes');
 assert.equal(await page.evaluate(()=>r2.hearts()),hearts,'replayed completion adds no duplicate');
 assert.ok(await page.evaluate(()=>!!BladefallPitchView.climb.state().questAward),'replayed completion still celebrates');
 assert.deepEqual(errors.filter(e=>!/register/.test(e)),[]);console.log('PASS: real reload, death recovery, replay UI, exactly one heart.');
}finally{await close();}
