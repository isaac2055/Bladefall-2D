import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {launchChrome} from '../tests/launch-chrome.mjs';
import {workshopRoute} from './workshop-route-policy.mjs';
import {bootstrapStage} from './bladefall-bot.mjs';
const root=resolve('public');
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://x').pathname));if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',extname(p)==='.js'?'text/javascript':extname(p)==='.mp3'?'audio/mpeg':'text/html');res.end(await readFile(p));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await launchChrome({headless:true,args:['--disable-gpu'],protocolTimeout:60000});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:1440,height:900});await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`);await page.waitForFunction(()=>window.__BF?.tas);
 const routes=JSON.parse(await readFile('docs/charters/celeste/evidence/workshop/routes.json')),report={};
 const select=async i=>{await page.evaluate(bootstrapStage,44);await page.evaluate(i=>{BladefallPrecisionWorkshop.select(i);__BF.tas.stepFrames(2,{});},i);};
 report.independentLayouts=await page.evaluate(()=>{const L=BladefallCeleste.level(44),pairs=[[17,16],[19,12],[20,13],[21,14],[24,23]];return pairs.map(([hard,base])=>{const signature=i=>L.objects.filter(o=>o.ceRoom===i&&(o.ceFold||o.ceHoist||o.ceRoot||o.ceWakePerch||o.cePressurePerch||o.ceWeight||o.ceAnvil||o.type==='cePressurePod')).map(o=>[o.type,Math.round(o.x-L.ceRooms[i].x),o.y,o.w].join(':'));const a=signature(hard),b=new Set(signature(base));return {hard,base,count:a.length,shared:a.filter(s=>b.has(s)).length};});});
 for(const r of report.independentLayouts)assert.ok(r.count>=3&&r.shared/r.count<.2,JSON.stringify(r));
 report.noFlight=[];
 for(const carrying of [false,true])for(const interval of [24,30,45]){
  await select(22);const result=await page.evaluate(({carrying,interval})=>{const a=G.celeste,p=G.p;
   if(carrying){for(let n=0;n<32;n++)__BF.tas.stepFrames(1,{right:true});__BF.tas.stepFrames(1,{hook:true});if(!G.obstacles.find(o=>o.ceRoom===22&&o.type==='ceSeed').ceCarried)throw Error('lantern pickup failed');}
   let maxY=p.y,landings=0;for(let n=0;n<900;n++){__BF.tas.stepFrames(1,{up:true,dodge:n%interval===0,jump:n===0});maxY=Math.max(maxY,p.y);if(p.onGround)landings++;}
   __BF.tas.stepFrames(26,{});return {carrying,interval,maxY,landings,dashes:a.lab.dashes,ready:a.lab.charge,deaths:a.deaths};
  },{carrying,interval});assert.ok(result.maxY<320&&result.landings>0&&result.dashes>=19&&result.ready===1&&!result.deaths,JSON.stringify(result));report.noFlight.push(result);
 }
 report.freeAir=[];
 for(const carrying of [false,true])for(const direction of ['up','diagonal','right']){
  await select(22);const result=await page.evaluate(({carrying,direction})=>{const a=G.celeste,p=G.p,seed=G.obstacles.find(o=>o.ceRoom===22&&o.type==='ceSeed');G.obstacles=[seed];seed.ceCarried=carrying;Object.assign(p,{x:a.rooms[22].x+170,y:600,onGround:false,floorPlat:null,vy:0,vx:0});let n=0,readySeen=false,maxY=p.y,dashes=0;
   for(;n<300&&!a.deaths;n++){__BF.tas.stepFrames(1,{up:direction!=='right',right:direction!=='up',dodge:n%24===0});readySeen ||= a.lab.charge===1;maxY=Math.max(maxY,p.y);dashes=Math.max(dashes,a.lab.dashes);}
   return {carrying,direction,frames:n,deaths:a.deaths,maxY,dashes,readySeen};
  },{carrying,direction});assert.ok(result.deaths===1&&result.frames<300&&result.dashes>=3&&result.readySeen,JSON.stringify(result));report.freeAir.push(result);
 }
 // Replace a real successful throw with a deliberately missed directional throw.
 await select(22);report.lanternReturn=await page.evaluate(tape=>{const a=G.celeste,seed=G.obstacles.find(o=>o.ceRoom===22&&o.type==='ceSeed');
  for(const k of tape){if(k.hook&&seed.ceCarried)break;__BF.tas.stepFrames(1,k);}
  __BF.tas.stepFrames(1,{});__BF.tas.stepFrames(1,{left:true,up:true,hook:true});const launch={x:seed.ceReturnX,y:seed.ceReturnY};
  for(let n=0;n<220;n++)__BF.tas.stepFrames(1,{});
  const automatic={x:seed.x,y:seed.y,rest:seed.ceRest,recalls:a.candidates.recalls};__BF.tas.stepFrames(1,{hook:true});const recovered=seed.ceCarried;
  __BF.tas.stepFrames(1,{});__BF.tas.stepFrames(1,{up:true,hook:true});__BF.tas.stepFrames(15,{});__BF.tas.stepFrames(40,{hook:true});
  return {launch,automatic,recovered,manual:seed.ceRest&&(a.candidates.recalls||0)>=2,deaths:a.deaths};
 },routes[22].tape);assert.ok(report.lanternReturn.automatic.rest&&report.lanternReturn.automatic.recalls>=1&&report.lanternReturn.recovered&&report.lanternReturn.manual&&!report.lanternReturn.deaths);assert.equal(report.lanternReturn.automatic.x,report.lanternReturn.launch.x);assert.equal(report.lanternReturn.automatic.y,report.lanternReturn.launch.y);
 report.telemetry=[];
 for(const id of [10,18]){await select(id);const r=await page.evaluate(tape=>{for(const k of tape){__BF.tas.stepFrames(1,k);if(G.celeste.complete)break;}const receipts=G.celeste.flightReceipts;return {complete:G.celeste.complete,receipts,display:document.querySelector('#pwFlightReport')?.innerText};},routes[id].tape);assert.ok(r.complete&&r.display);for(const receipt of r.receipts)assert.ok(r.display.includes(receipt.remaining==null?'New transformation':receipt.remaining.toFixed(2)+'s'));assert.equal(r.receipts.filter(v=>v.refill).length,2);if(process.argv.includes('--capture'))await page.screenshot({path:'docs/charters/celeste/evidence/workshop/flight-report-'+id+'.png'});report.telemetry.push({id,...r});}
 // Public picker: both banks and all ten candidates remain separately accessible.
 await page.evaluate(()=>BladefallPrecisionWorkshop.menu('base-bank'));if(process.argv.includes('--capture'))await page.screenshot({path:'docs/charters/celeste/evidence/workshop/base-bank-picker.png'});
 assert.deepEqual(errors,[]);report.errors=errors;await writeFile('docs/charters/celeste/evidence/workshop/feedback-verification.json',JSON.stringify(report,null,2));console.log('PASS: distinct layouts, recharge without indefinite flight, automatic/manual lantern recall and real completion telemetry.');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
