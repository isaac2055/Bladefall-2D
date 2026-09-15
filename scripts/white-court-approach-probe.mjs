import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import puppeteer from 'puppeteer';
const root=resolve('public');
const types={'.html':'text/html','.js':'application/javascript','.ogg':'audio/ogg','.mp3':'audio/mpeg','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.bak':'text/html'};
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+'/'))throw 0;const b=await readFile(p);res.writeHead(200,{'Content-Type':types[extname(p)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await puppeteer.launch({headless:true,protocolTimeout:1800000,executablePath:process.env.PUPPETEER_EXECUTABLE_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});
const page=await browser.newPage();
page.on('pageerror',e=>console.error('PAGE ERROR',e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.__BF?.tas);
const bot=await import(resolve('scripts/bladefall-bot.mjs'));
await page.setViewport({width:1440,height:900,deviceScaleFactor:1});
try {
await page.evaluate(bot.bootstrapStage,2);
console.log(JSON.stringify(await page.evaluate(()=>{
 const tas=window.__BF.tas;
 G.sessionCapabilities=levelSelectCapabilitiesForStage(8);syncMovementCapabilities();syncPortalCapabilities();
 Object.assign(G.p,{x:10450,y:0,vx:0,vy:0,onGround:true,floorPlat:null,invuln:120});
 const points=[[10640,130],[10800,130],[10930,260],[11130,260],[11020,390],[10980,390]],segments=[];
 for(const [x,y] of points){
  const jumpNeeded=y>G.p.y+10;tas.saveState('court-approach');let won=false,attempts=[];
  for(const moveAt of [0,8,14,20,26,32]){
   for(const secondAt of [18,22,26,30]){
    tas.restoreState('court-approach');let frames=0,peak=G.p.y;
    for(;frames<210;frames++){
     const p=G.p,dx=x-p.x,jump=y>p.y+10||!p.onGround;
     tas.stepFrames(1,{right:dx>8&&frames>=moveAt,left:dx< -8&&frames>=moveAt,
      jump:jumpNeeded&&(frames<20||(frames>=secondAt&&frames<secondAt+18))});
     peak=Math.max(peak,p.y);if(p.onGround&&Math.abs(p.x-x)<22&&Math.abs(p.y-y)<3){won=true;break;}
    }
    attempts.push({moveAt,secondAt,frames,peak,x:G.p.x,y:G.p.y,won});if(won)break;
   }if(won)break;
  }
  segments.push({target:[x,y],won,attempts});if(!won)break;
 }
 return {segments,near:outskirtsInteractionCandidate()?.courtAction,x:G.p.x,y:G.p.y};
}),null,2));
}finally{const child=browser.process();await browser.close();for(const stream of child?.stdio||[])stream?.destroy();server.closeAllConnections();server.close();}
