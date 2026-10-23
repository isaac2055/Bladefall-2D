// Screenshots of Ascend Together (for looking): .cache/quest-shots/together-*.png
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {mkdirSync} from 'node:fs';
import {extname,join,normalize} from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchChrome} from '../../tests/launch-chrome.mjs';
const ROOT=fileURLToPath(new URL('../../public/',import.meta.url)),dir=fileURLToPath(new URL('../../.cache/quest-shots/',import.meta.url));mkdirSync(dir,{recursive:true});
const server=http.createServer(async(req,res)=>{try{const p=normalize(decodeURIComponent(new URL(req.url,'http://x').pathname)).replace(/^\/+/,'')||'index.html';const body=await readFile(join(ROOT,p));res.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[extname(p)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await launchChrome({headless:true,args:['--no-sandbox']});const errors=[];
try{
 const pages=[];
 for(const role of ['host','guest']){const page=await browser.newPage();await page.setViewport({width:1440,height:900});page.on('pageerror',e=>errors.push(e.message));
  await page.evaluateOnNewDocument(()=>{localStorage.setItem('bladefall.climb.unlock-all.v1','1');});
  await page.goto(`http://127.0.0.1:${server.address().port}/precision.html?pitch=climb&world=1&coop=local&nosw=1`,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.BladefallClimbTogether,{timeout:30000});await new Promise(r=>setTimeout(r,1200));pages.push(page);}
 const [host,guest]=pages;
 await host.evaluate(()=>BladefallClimbCoop.host());await guest.evaluate(()=>BladefallClimbCoop.join('LOCAL'));
 await host.waitForFunction(()=>BladefallClimbCoop.state().status==='on',{timeout:10000});
 await host.evaluate(()=>BladefallPitchView.climb.menu());await new Promise(r=>setTimeout(r,500));
 await host.screenshot({path:dir+'together-0-panel.png'});
 for(let room=0;room<3;room++){
  if(room===0)await host.evaluate(()=>BladefallClimbTogether.start());else await host.evaluate(i=>{BladefallClimbTogether.begin(i,'host');},room);
  if(room>0)await guest.evaluate(i=>BladefallClimbTogether.begin(i,'guest'),room);
  await new Promise(r=>setTimeout(r,2500));
  await host.screenshot({path:dir+`together-${room+1}-host.png`});
 }
 await guest.screenshot({path:dir+'together-3-guest.png'});
}finally{console.log(errors.filter(e=>!/register/.test(e)));await browser.close();server.close();}
