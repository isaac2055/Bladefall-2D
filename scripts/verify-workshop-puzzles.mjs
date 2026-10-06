import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {launchChrome} from '../tests/launch-chrome.mjs';
import {bootstrapStage} from './bladefall-bot.mjs';
const root=resolve('public'),out='docs/charters/celeste/evidence/workshop',errors=[];
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+new URL(req.url,'http://x').pathname);if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',extname(p)==='.js'?'text/javascript':'text/html');res.end(await readFile(p));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await launchChrome({headless:true});
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:1440,height:900});await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`);await page.waitForFunction(()=>window.__BF?.tas);await page.evaluate(bootstrapStage,44);
 const report={};
 report.menu=await page.evaluate(()=>{const W=BladefallPrecisionWorkshop,result={};for(const tab of ['candidates','base-bank','bank']){W.menu(tab);result[tab]={cards:document.querySelectorAll('[id^="pw"].choice').length,proposals:document.querySelectorAll('#pwCampaignPlan details').length,original:!!document.getElementById('pwBaseTab'),overflow:document.documentElement.scrollWidth>innerWidth};}return result;});
 assert.deepEqual(Object.values(report.menu).map(x=>[x.cards,x.proposals,x.original]),[[10,0,false],[4,20,false],[10,20,false]]);
 report.devices=await page.evaluate(()=>{
  const W=BladefallPrecisionWorkshop,t=__BF.tas,select=i=>{W.select(i);t.stepFrames(2,{});},list=()=>G.obstacles.filter(o=>o.ceRoom===G.celeste.room),stand=o=>Object.assign(G.p,{x:o.x,y:o.y,onGround:true,floorPlat:o,vx:0,vy:0,jumps:0}),results={};
  select(12);let h=list().find(o=>o.ceRootLocked),v=list().find(o=>o.ceRootRelease);stand(h);t.stepFrames(1,{dodge:true});results.rootLocked=h.ceAge<0;stand(v);t.stepFrames(1,{});stand(h);t.stepFrames(30,{});t.stepFrames(1,{dodge:true});results.rootReleased=h.ceAge>=0;
  select(26);let ballast=list().find(o=>o.ceBallast),socket=list().find(o=>o.type==='ceSeedSocket');socket.ceLit=true;t.stepFrames(80,{});results.ballastRaised=ballast.y===ballast.ceHighY;socket.ceLit=false;t.stepFrames(80,{});results.ballastLowered=ballast.y===ballast.ceHomeY;
  select(27);stand(list().find(o=>o.ceEchoRecord===1));t.stepFrames(1,{});stand(list().find(o=>o.ceEchoSwitch));t.stepFrames(1,{});results.memory=list().filter(o=>o.ceEchoCopy!==undefined&&!o.gone).map(o=>o.ceEchoCopy).join(',')==='1';
  select(28);let thorn=list().find(o=>o.ceSleeper);Object.assign(G.p,{x:thorn.x-140,y:thorn.y+200,onGround:false,floorPlat:null});t.stepFrames(1,{up:true,dodge:true});results.thornTell=thorn.ceWakeT>1.32&&thorn.gone;t.stepFrames(12,{});results.thornBloom=!thorn.gone;t.stepFrames(90,{});results.thornSettles=thorn.gone;
  select(29);let control=list().find(o=>o.type==='ceRailControl'),rail=list().find(o=>o.ceProgramRail);Object.assign(G.p,{x:control.x,y:control.y-22,onGround:false,floorPlat:null});t.stepFrames(1,{right:true,up:true,dodge:true});results.programUp=rail.ceX-G.celeste.rooms[29].x===1000&&rail.ceY===250;
  for(const i of [25,26,27,28,29]){select(i);t.stepFrames(1,{checkpoint:true});t.stepFrames(2,{});const s=G.celeste.puzzle;results['retry'+i]=!s||!s.commands&&!s.echoOpen&&!s.recorded.length;}
  select(23);results.docks=list().filter(o=>o.ceDock).length===4;for(const dock of list().filter(o=>o.ceDock)){Object.assign(G.p,{x:dock.x,y:dock.y+20,onGround:false,floorPlat:null,vy:0,vx:0});t.stepFrames(20,{});if(G.p.floorPlat!==dock||!G.p.onGround)results.docks=false;}
  return results;
 });for(const [name,ok]of Object.entries(report.devices))assert.equal(ok,true,name);
 const routes=JSON.parse(await readFile(`${out}/routes.json`));report.replay=[];
 if(!process.argv.includes('--devices-only'))for(const i of [10,18,12,21,23,25,26,27,28,29]){
  const r=routes.find(r=>r.index===i);assert.ok(r?.pass&&r.tape.length,`Missing route ${i}`);await page.evaluate(bootstrapStage,44);
  const result=await page.evaluate(({i,tape})=>{BladefallPrecisionWorkshop.select(i);__BF.tas.stepFrames(2,{});for(const k of tape){__BF.tas.stepFrames(1,k);if(G.celeste.complete||G.celeste.deaths)break;}return {i,complete:!!G.celeste.complete,deaths:G.celeste.deaths,contacts:G.celeste.contacts||0,puzzle:G.celeste.puzzle};},{i,tape:r.tape});assert.ok(result.complete&&!result.deaths,JSON.stringify(result));report.replay.push(result);console.log('PASS replay',i);
 }
 assert.deepEqual(errors,[]);report.errors=errors;await writeFile(`${out}/puzzle-verification.json`,JSON.stringify(report,null,2));console.log('PASS: menu organization, puzzle state, reset and resting docks.');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
