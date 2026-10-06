// Review the real exit flow, saved values, quest return, and final-room completion.
import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const browser=await puppeteer.launch({headless:true,args:['--allow-file-access-from-files']});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width:1280,height:760});
 const url=pathToFileURL(resolve('public/precision.html')).href;
 await page.goto(url+'?pitch=rbr&region=1');
 await page.waitForFunction(()=>window.BladefallPrecisionView?.view.g);
 const play=async(key)=>page.evaluate(key=>{const V=BladefallPrecisionView;V.retryRoom();V.advance(Array(14).fill(''));for(const [n,k] of BladefallPrecisionRooms.tapes[key])V.advance(Array(n).fill(k));return {room:V.view.g.room.id,mode:V.view.mode};},key);
 let id=await page.evaluate(()=>BladefallPrecisionView.view.g.room.id);
 assert.equal((await play(id)).mode,'card');
 assert.equal(await page.locator('[data-scale="diff"] button').waitHandle().then(()=>page.$$eval('[data-scale="diff"] button',x=>x.length)),10);
 await page.click('[data-scale="diff"] [data-v="7"]');await page.click('[data-scale="fun"] [data-v="4"]');await page.click('#svOff');await page.type('#svNote','Jump felt odd, but <safe>');
 await page.screenshot({path:'/tmp/rbr-survey-card.png'});
 const frozen=await page.evaluate(()=>{const V=BladefallPrecisionView;const f=V.view.g.frame;V.advance(Array(60).fill('r'));return f===V.view.g.frame;});assert(frozen);
 await page.click('#svNext');
 let saved=await page.evaluate(id=>JSON.parse(localStorage.getItem('bladefall.rbr.survey.v1')).rooms[id],id);
 assert.equal(saved.rating.diff,7);assert.equal(saved.rating.fun,4);assert.equal(saved.rating.off,true);assert.equal(saved.rating.note,'Jump felt odd, but <safe>');
 assert.notEqual(await page.evaluate(()=>BladefallPrecisionView.view.g.room.id),id);
 await page.reload();await page.waitForFunction(()=>window.BladefallPrecisionView?.view.g);
 assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('bladefall.rbr.survey.v1')).rooms[id].rating.diff,id),7);
 // Side exit and both quest rooms pause before navigation; final card continues back to the giver.
 const q=await page.evaluate(()=>{const q=BladefallRoomByRoom.region(1).quests.find(q=>q.rooms.length);const V=BladefallPrecisionView;V.startChapter(V.view.chapter,BladefallRoomByRoom.region(1).rooms.findIndex(r=>r.id===q.from));return {from:q.from,rooms:q.rooms.map(r=>r.id),keep:q.keepsake.id};});
 for(const key of [q.from+'#side',...q.rooms]){assert.equal((await play(key)).mode,'card');await page.click('#svNext');await page.evaluate(()=>BladefallPrecisionView.advance(Array(30).fill('')));}
 assert.equal(await page.evaluate(()=>BladefallPrecisionView.view.g.room.id),q.from);
 assert(await page.evaluate(k=>BladefallPitchView.rbr.save().keepsakes[k],q.keep));
 // Last main room's review precedes the region end card.
 id=await page.evaluate(()=>{const V=BladefallPrecisionView,r=BladefallRoomByRoom.region(1);V.startChapter(V.view.chapter,r.mainCount-1);return V.view.g.room.id;});
 assert.equal((await play(id)).mode,'card');await page.click('#svNext');await page.waitForSelector('#rbrNext');
 assert(await page.evaluate(()=>BladefallPitchView.rbr.save().cleared[1]));
 // The ordinary precision survey retains its per-level card and separate records.
 await page.goto(url+'?chapter=0&survey');await page.waitForFunction(()=>window.BladefallPrecisionView?.view.g);
 await page.evaluate(()=>{const V=BladefallPrecisionView;for(const room of BladefallPrecisionRooms.chapters[0].rooms){V.advance(Array(20).fill(''));V.retryRoom();V.advance(Array(14).fill(''));for(const [n,k] of BladefallPrecisionRooms.tapes[room.id]){for(let i=0;i<n;i++){if(V.view.g.room.id!==room.id||V.view.mode!=='play')break;V.advance([k]);}}V.advance(Array(20).fill(''));}});
 await page.waitForSelector('#svChapters');assert.equal(await page.$('#svOff'),null);
 assert.equal(await page.$$eval('.svFlag',x=>x.length),4);
 await page.click('[data-scale="diff"] [data-v="3"]');await page.click('#svChapters');
 assert(await page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('bladefall.pcore.survey.v1')).levels).some(l=>l.rating?.diff===3)));
 assert.deepEqual(errors,[]);
 console.log('Room reviews: ratings, note typing, frozen simulation, save/reload, side exits, quest rewards and region completion passed.');
}finally{await browser.close();}
