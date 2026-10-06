import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {launchChrome} from '../tests/launch-chrome.mjs';
import {workshopRoute} from './workshop-route-policy.mjs';
import {bootstrapStage} from './bladefall-bot.mjs';
const root=resolve('public');
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://x').pathname));if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',extname(p)==='.js'?'text/javascript':extname(p)==='.mp3'?'audio/mpeg':'text/html');res.end(await readFile(p));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await launchChrome({headless:true});
try{
 const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`);await page.waitForFunction(()=>window.__BF?.tas);
 const routes=JSON.parse(await readFile('docs/charters/celeste/evidence/workshop/routes.json')),report=[];
 for(const id of [10,18]){
  await page.evaluate(bootstrapStage,44);
  const result=await page.evaluate(({id,tape})=>{
   BladefallPrecisionWorkshop.select(id);__BF.tas.stepFrames(2,{});const a=G.celeste,r=a.rooms[id],inputs=new Set();let exits=0;
   for(const k of tape){if(a.flight){for(const name of ['left','right','up','down'])if(k[name])inputs.add(name);if(k.dodge)exits++;}__BF.tas.stepFrames(1,k);if(a.complete||a.deaths)break;}
   return {id,complete:a.complete,deaths:a.deaths,contacts:a.contacts,exits,inputs:[...inputs],open:r.openFlight,chapters:r.openPaths.length,forced:G.obstacles.some(o=>o.ceRoom===id&&o.cePrecisionKick),springs:a.workshop.springs,receipts:a.flightReceipts};
  },{id,tape:routes[id].tape});
  assert.ok(result.complete&&!result.deaths&&!result.contacts&&result.open&&!result.forced);assert.equal(result.chapters,2);assert.equal(result.exits,2);assert.deepEqual(result.inputs.sort(),['down','left','right','up']);assert.ok(result.springs>=2);assert.equal(result.receipts.filter(r=>r.refill).length,2);report.push(result);
 }
 await writeFile('docs/charters/celeste/evidence/workshop/free-flight-verification.json',JSON.stringify(report,null,2));
 console.log('PASS: two freely steered flights, four-direction input, varied springs and two manual dash exits each. Optional spring routes are permitted.');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
