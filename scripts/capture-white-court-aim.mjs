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
try{
await page.evaluate(bot.bootstrapStage,8);
await mkdir('docs/charters/09-frost-sorcerer/evidence',{recursive:true});
for(const follow of [false,true])for(const face of [-1,1]){
 const png=await page.evaluate(({face,follow})=>{
  meta.soundOn=false;meta.reducedMotion=true;meta.screenShake=0;
  const e=G.boss;Object.assign(e,{x:14200,y:0,face,courtBreaks:2,phase:3,courtSecondT:follow?.5:0,courtSecondX:14200+face*350,courtSecondY:2,courtCastWind:follow?0:.8,courtAimX:14200+face*350,courtAimY:2});
  Object.assign(G.p,{x:e.courtAimX,y:0,vx:0,vy:0,onGround:true,floorPlat:null});
  G.cam=13500;G.camY=0;G.shake=0;G.stageBanner=0;G.outskirtsAnnotation=null;
  mainCanvas.width=1440;mainCanvas.height=900;recalcVP();
  G.projectiles=[];bossShoot(e,{x:e.courtAimX,y:2,h:0},follow?'followup':'payload');
  G.projectiles[0].x=e.x+face*140;G.projectiles[0].y=75;
  render();return mainCanvas.toDataURL('image/png').split(',')[1];
 },{face,follow});
 await writeFile('docs/charters/09-frost-sorcerer/evidence/aim-'+(follow?'followup-':'')+(face<0?'left':'right')+'-reduced.png',Buffer.from(png,'base64'));
}
}finally{const child=browser.process();await browser.close();for(const stream of child?.stdio||[])stream?.destroy();server.closeAllConnections();server.close();}
