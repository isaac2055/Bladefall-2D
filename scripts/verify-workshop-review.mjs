import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,extname} from 'node:path';
import {launchChrome} from '../tests/launch-chrome.mjs';
import {bootstrapStage} from './bladefall-bot.mjs';
import {workshopRoute} from './workshop-route-policy.mjs';
const out='docs/charters/celeste/evidence/workshop',root=resolve('public'),errors=[];
await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://x').pathname));if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',extname(p)==='.js'?'text/javascript':extname(p)==='.mp3'?'audio/mpeg':'text/html');res.end(await readFile(p));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await launchChrome({headless:true});
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:1440,height:900});await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`);await page.waitForFunction(()=>window.__BF?.tas);
 const routes=JSON.parse(await readFile(`${out}/routes.json`)),report={backtrack:[],directions:[],nativeDirections:[]};
 for(let i=0;i<25;i++){
  await page.evaluate(bootstrapStage,44);await page.evaluate(i=>{BladefallPrecisionWorkshop.select(i);__BF.tas.stepFrames(90,{left:true});},i);
  assert.equal(await page.evaluate(()=>G.celeste.deaths),0,`left boundary room ${i}`);report.backtrack.push(i);
  for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
   const result=await page.evaluate(({i,dx,dy})=>{BladefallPrecisionWorkshop.select(i);__BF.tas.stepFrames(2,{});Object.assign(G.p,{x:G.celeste.rooms[i].x+170,y:350,onGround:false,floorPlat:null});__BF.tas.stepFrames(1,{right:dx>0,left:dx<0,up:dy>0,down:dy<0,dodge:true});return {dx:G.celeste.lab.dx,dy:G.celeste.lab.dy};},{i,dx,dy});assert.equal(Math.sign(result.dx),dx);assert.equal(Math.sign(result.dy),dy);report.directions.push({i,dx,dy});
  }
 }
 report.chord=await page.evaluate(()=>{BladefallPrecisionWorkshop.select(8);__BF.tas.stepFrames(2,{});G.p.y=350;__BF.tas.stepFrames(1,{right:true,dodge:true});__BF.tas.stepFrames(2,{right:true,up:true});return {x:G.celeste.lab.dx,y:G.celeste.lab.dy};});assert.ok(report.chord.x>.6&&report.chord.y>.6);
 report.chordBoundary=[];
 for(const clock of [.03,8.6,19.83,1000]){const v=await page.evaluate(clock=>{BladefallPrecisionWorkshop.select(8);__BF.tas.stepFrames(2,{});G.celeste.clock=clock;Object.assign(G.p,{y:500,onGround:false,floorPlat:null});__BF.tas.stepFrames(1,{right:true,dodge:true});__BF.tas.stepFrames(5,{right:true});__BF.tas.stepFrames(1,{left:true});return {clock,x:G.celeste.lab.dx,y:G.celeste.lab.dy};},clock);assert.equal(v.x,1,'100ms boundary is independent of room age');report.chordBoundary.push(v);}
 report.recharge=await page.evaluate(()=>{BladefallPrecisionWorkshop.select(9);__BF.tas.stepFrames(2,{});Object.assign(G.p,{x:G.celeste.rooms[9].x+180,y:700,onGround:false,floorPlat:null});__BF.tas.stepFrames(1,{right:true,dodge:true});const spent=G.celeste.lab.charge;__BF.tas.stepFrames(25,{});const airborne=!G.p.onGround,ready=G.celeste.lab.charge;__BF.tas.stepFrames(1,{left:true,dodge:true});return {spent,ready,airborne,dashes:G.celeste.lab.dashes};});assert.deepEqual(report.recharge,{spent:0,ready:1,airborne:true,dashes:2});
 report.crumbleJumps=await page.evaluate(tape=>{BladefallPrecisionWorkshop.select(8);__BF.tas.stepFrames(2,{});for(const k of tape){__BF.tas.stepFrames(1,k);if(G.p.onGround&&G.p.floorPlat?.ceCrumble)break;}const landed=G.p.jumps;__BF.tas.stepFrames(1,{});__BF.tas.stepFrames(1,{jump:true});const first=G.p.jumps;__BF.tas.stepFrames(8,{});__BF.tas.stepFrames(1,{jump:true});return {landed,first,second:G.p.jumps,vy:G.p.vy};},routes[8].tape);assert.equal(report.crumbleJumps.landed,0);assert.equal(report.crumbleJumps.first,1);assert.equal(report.crumbleJumps.second,2);assert.ok(report.crumbleJumps.vy<0);
 report.wall=await page.evaluate(()=>{BladefallPrecisionWorkshop.select(7);const o=G.obstacles.find(o=>o.ceRoom===7&&o.type==='ceHazard');Object.assign(G.p,{x:o.x-o.w/2-G.p.w/2-8,y:150,onGround:false,floorPlat:null});__BF.tas.stepFrames(1,{right:true,dodge:true});const first={deaths:G.celeste.deaths,y:G.p.y,dash:G.p.dodgeTimer};__BF.tas.stepFrames(8,{});return {first,deaths:G.celeste.deaths,y:G.p.y};});assert.equal(report.wall.first.deaths,0);assert.equal(report.wall.first.dash,0);assert.equal(report.wall.deaths,0);assert.ok(report.wall.y<report.wall.first.y);
 report.corner=await page.evaluate(()=>{BladefallPrecisionWorkshop.select(7);const o=G.obstacles.find(o=>o.ceRoom===7&&o.type==='ceHazard');Object.assign(G.p,{x:o.x-o.w/2-G.p.w/2+3,y:o.y+o.h-3,vx:720,vy:0,dodgeTimer:.1});const hit=BladefallPrecisionWorkshop.contact(G.p,o);return {hit,deaths:G.celeste.deaths,dash:G.p.dodgeTimer,grace:G.celeste.cornerGrace};});assert.ok(!report.corner.hit&&report.corner.grace>0&&report.corner.dash>0);
 report.rift=await page.evaluate(()=>{BladefallPrecisionWorkshop.select(7);const o=G.obstacles.find(o=>o.ceRoom===7&&o.type==='ceVein');Object.assign(G.p,{x:o.x-o.w/2-G.p.w/2+3,y:o.y+20,onGround:false,floorPlat:null});__BF.tas.stepFrames(1,{right:true});return {deaths:G.celeste.deaths,y:G.p.y};});assert.equal(report.rift.deaths,0);
 // Reach the rest from the entrance, retry, then solve the remaining half with legal keys.
 await page.evaluate(()=>{BladefallPrecisionWorkshop.select(9);__BF.tas.stepFrames(2,{});});
 report.checkpoint=await page.evaluate(tape=>{for(const k of tape){__BF.tas.stepFrames(1,k);if(G.celeste.workshopCheckpoint)break;}const cp=G.celeste.workshopCheckpoint;if(!cp)throw Error('rest never lit');__BF.tas.stepFrames(1,{checkpoint:true});__BF.tas.stepFrames(2,{});return {cp,x:G.p.x,y:G.p.y,deaths:G.celeste.deaths};},routes[9].tape);assert.equal(report.checkpoint.deaths,1);assert.equal(report.checkpoint.x,report.checkpoint.cp.x);assert.equal(report.checkpoint.y,200);
 await page.evaluate(()=>G.celeste.deaths=0); // Route helper counts only failures during the new attempt.
 report.checkpointRoute=await page.evaluate(workshopRoute,9);assert.ok(report.checkpointRoute.pass,JSON.stringify(report.checkpointRoute.log.slice(-3)));delete report.checkpointRoute.tape;
 await page.evaluate(()=>{recalcVP();render();});await page.screenshot({path:`${out}/checkpoint-finish.png`});
 // H's complete route must finish on its far bank, never rewind.
 report.finish=await page.evaluate(tape=>{BladefallPrecisionWorkshop.select(7);__BF.tas.stepFrames(2,{});for(const k of tape){__BF.tas.stepFrames(1,k);if(G.celeste.complete)break;}return {complete:G.celeste.complete,deaths:G.celeste.deaths,x:G.p.x-G.celeste.rooms[7].x};},routes[7].tape);assert.ok(report.finish.complete&&!report.finish.deaths&&report.finish.x>2700);
 report.overshoot=await page.evaluate(()=>{BladefallPrecisionWorkshop.select(7);__BF.tas.stepFrames(2,{});const r=G.celeste.rooms[7];Object.assign(G.p,{x:r.x+r.width-60,y:90,vx:1800,vy:150,onGround:false,floorPlat:null,_ballisticT:.6});for(let i=0;i<100&&!G.celeste.complete&&!G.celeste.deaths;i++)__BF.tas.stepFrames(1,{right:true});return {complete:G.celeste.complete,deaths:G.celeste.deaths,landing:G.p.floorPlat?.ceRoom};});assert.deepEqual(report.overshoot,{complete:true,deaths:0,landing:7});
 // Keyboard events in ordinary play, not only injected TAS inputs.
 const ui=await browser.newPage();ui.on('pageerror',e=>errors.push(e.message));await ui.goto(`http://127.0.0.1:${server.address().port}/index.html`);await ui.waitForSelector('#precisionBtn');await ui.click('#precisionBtn');await ui.click('#ceFracturedWorkshop');await ui.click('#pwBankTab');await ui.click('#pw8');
 for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
  await ui.evaluate(()=>{BladefallPrecisionWorkshop.select(8);Object.assign(G.p,{x:G.celeste.rooms[8].x+170,y:350,onGround:false,floorPlat:null});});
  const keys=[...(dx?[dx>0?'ArrowRight':'ArrowLeft']:[]),...(dy?[dy>0?'ArrowUp':'ArrowDown']:[])];for(const key of keys)await ui.keyboard.down(key);await ui.keyboard.down('KeyD');await ui.waitForFunction(()=>G.celeste.lab?.dashes>0);const v=await ui.evaluate(()=>({x:Math.sign(G.celeste.lab.dx),y:Math.sign(G.celeste.lab.dy)}));await ui.keyboard.up('KeyD');for(const key of keys)await ui.keyboard.up(key);assert.deepEqual(v,{x:dx,y:dy});report.nativeDirections.push(v);
 }
 report.nativeChords=[];
 for(const keys of [['ArrowUp','ArrowRight','KeyD'],['ArrowRight','ArrowUp','KeyD'],['KeyD','ArrowRight','ArrowUp']]){
  await ui.evaluate(keys=>{BladefallPrecisionWorkshop.select(8);Object.assign(G.p,{x:G.celeste.rooms[8].x+170,y:350,onGround:false,floorPlat:null});for(const code of keys)window.dispatchEvent(new KeyboardEvent('keydown',{code,key:code,bubbles:true}));},keys);
  await ui.waitForFunction(()=>G.celeste.lab?.dashes>0);const v=await ui.evaluate(()=>({x:G.celeste.lab.dx,y:G.celeste.lab.dy}));await ui.evaluate(keys=>keys.forEach(code=>window.dispatchEvent(new KeyboardEvent('keyup',{code,key:code,bubbles:true}))),keys);assert.ok(v.x>.6&&v.y>.6,JSON.stringify({keys,v}));report.nativeChords.push({keys,v});
 }
 assert.deepEqual(errors,[]);report.errors=errors;await writeFile(`${out}/review-verification.json`,JSON.stringify(report,null,2));console.log('PASS: backtracking, 200 dash vectors, native keyboard aim, late direction chord, wall fall, corner grace, harmless rift contact, H finish and J checkpoint continuation.');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
