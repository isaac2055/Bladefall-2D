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
 const page=await browser.newPage();page.on('pageerror',e=>console.error(e.message));await page.setViewport({width:1440,height:900});await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`);await page.waitForFunction(()=>window.__BF?.tas);
 await page.evaluate(bootstrapStage,44);
 try{await page.evaluate(c=>window.__leapCache=c,JSON.parse(await readFile('/tmp/workshop-leaps244.json','utf8')));}catch{}
 let result;
 if(process.argv[2]==='--rooms'){result=[];for(const i of (process.argv[3]||'0,1,2,3,4,5').split(',').map(Number)){await page.evaluate(bootstrapStage,44);await page.evaluate(i=>{BladefallPrecisionWorkshop.select(i);__BF.tas.stepFrames(2,{});},i);const row=await page.evaluate(workshopRoute,i);result.push(row);await writeFile('/tmp/workshop-leaps244.json',JSON.stringify(await page.evaluate(()=>window.__leapCache||{})));await writeFile('/tmp/precision-attempt-'+i+'.json',JSON.stringify(row));if(row.pass)await writeFile('/tmp/precision-candidate-'+i+'.json',JSON.stringify(row));const {tape,...summary}=row;console.log(JSON.stringify(summary));}await writeFile('/tmp/workshop-routes.json',JSON.stringify(result));}
 else{result=await page.evaluate(await readFile(process.argv[2],'utf8'));console.log(JSON.stringify(result));}
 if(process.argv[2]!=='--rooms'&&process.argv[3])await writeFile(process.argv[3],JSON.stringify(result));
 await mkdir('docs/charters/celeste/evidence/workshop',{recursive:true});
 const png=await page.evaluate(()=>{recalcVP();render();return mainCanvas.toDataURL('image/png').split(',')[1];});await writeFile('docs/charters/celeste/evidence/workshop/current.png',Buffer.from(png,'base64'));
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
