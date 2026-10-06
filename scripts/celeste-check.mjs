import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {launchChrome} from '../tests/launch-chrome.mjs';
import {runCourseRoom} from './celeste-route-policy.mjs';
import {bootstrapStage} from './bladefall-bot.mjs';
const root=resolve('public'),server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://x').pathname));if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',extname(p)==='.js'?'text/javascript':extname(p)==='.html'?'text/html':'application/octet-stream');res.end(await readFile(p));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});await page.setViewport({width:1440,height:900});
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__BF?.tas,{timeout:15000});
 for(const stage of [41,42]){
  await page.evaluate(bootstrapStage,stage);
  const result=await page.evaluate(()=>({stage:G.stageIndex,mode,player:{x:G.p.x,y:G.p.y,blood:G.p.blood},rooms:G.celeste?.rooms.map(r=>r.kind),cap:activeCapabilityProgress().acquired,obs:G.obstacles.length}));console.log(JSON.stringify(result));
 }
 if(process.argv[2]==='--course'){
 const runs=[];
 for(const stage of [41,42]){
 await page.evaluate(bootstrapStage,stage);const rooms=[];
 for(let i=0,n=await page.evaluate(()=>G.celeste.rooms.length);i<n;i++){const result=await page.evaluate(runCourseRoom);rooms.push(result);const {tape,...summary}=result;console.log(JSON.stringify(summary));if(!result.pass)break;}
 const final=await page.evaluate(()=>({complete:G.celeste.complete,deaths:G.celeste.deaths,mode}));runs.push({stage,rooms,final});console.log(JSON.stringify({stage,final}));
 }
 await mkdir('docs/charters/celeste/evidence',{recursive:true});await writeFile('docs/charters/celeste/evidence/routes.json',JSON.stringify(runs));
 }else if(process.argv[2]==='--rooms'){
 const results=[];const stage=Number(process.argv[4]||41);
 for(const room of process.argv[3].split(',').map(Number)){
 await page.evaluate(bootstrapStage,stage);
 await page.evaluate(i=>{const a=G.celeste;a.room=i;a.checkpoint=a.rooms[i].x+120;BladefallCeleste.retry();a.deaths=0;__BF.tas.stepFrames(2,{});},room);
 const result=await page.evaluate(runCourseRoom);results.push(result);const {tape,...summary}=result;console.log(JSON.stringify(summary));
 }
 await writeFile('/tmp/celeste-room-results.json',JSON.stringify(results));
 }else if(process.argv[2]){const body=await readFile(process.argv[2],'utf8');console.log(JSON.stringify(await page.evaluate(body)));}
 await mkdir('docs/charters/celeste/evidence',{recursive:true});
 const png=await page.evaluate(()=>{recalcVP();render();return mainCanvas.toDataURL('image/png').split(',')[1]});
 await writeFile('docs/charters/celeste/evidence/current.png',Buffer.from(png,'base64'));
 console.log(JSON.stringify({errors}));
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
