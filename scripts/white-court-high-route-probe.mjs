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
const errors=[];
page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message);});
await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.__BF?.tas);
const bot=await import(resolve('scripts/bladefall-bot.mjs'));
await page.setViewport({width:1440,height:900,deviceScaleFactor:1});
const overlook=process.argv.includes('--overlook');
const gallery=overlook||process.argv.includes('--gallery');
try {
 await page.evaluate(()=>recalcVP());
 await page.evaluate(bot.bootstrapStage,8);
 const receipt=await page.evaluate((gallery,overlook)=>{
  const tas=window.__BF.tas;
  if(overlook){mainCanvas.width=1440;mainCanvas.height=900;recalcVP();}
  G.p.invuln=600;
  if(gallery)Object.assign(G.p,{x:overlook?12400:10820,y:0,vx:0,vy:0,onGround:true,floorPlat:null});
  const start=tas.getPlayerState();tas.saveState('court-route-start');
  const points=overlook?[[12400,0],[12530,90],[12710,90],[12780,190],[12900,190]]:gallery?[[10900,0],[10950,70],[11160,70],[11270,150],[11460,150],[11590,270],[11710,270]]:[[5750,0],[5830,70],[6010,70],[6150,130],[6350,130],[6500,210],[6730,210],[6890,300],[7090,300],[7240,420],[7340,420]],segments=[],inputs=[];
  for(const [x,y] of points){
   const jumpNeeded=y>G.p.y+10;tas.saveState('court-route-branch');let won=false,attempts=0;
   for(const moveAt of [0,8,14,20,26,32]){
    for(const secondAt of [22,26,30,34,40]){
     tas.restoreState('court-route-branch');const branch=[];
     for(let frame=0;frame<360;frame++){
      const p=G.p,dx=x-p.x;
      const input={right:dx>8&&frame>=moveAt,left:dx<-8&&frame>=moveAt,
       jump:jumpNeeded&&(frame<20||(frame>=secondAt&&frame<secondAt+20))};
      tas.stepFrames(1,input);branch.push(input);
      if(p.onGround&&Math.abs(p.x-x)<22&&Math.abs(p.y-y)<3){won=true;break;}
     }
     attempts++;
     if(won){inputs.push(...branch);segments.push({target:[x,y],won,moveAt,secondAt,frames:branch.length,landing:{x:G.p.x,y:G.p.y},attempts});break;}
    }if(won)break;
   }
   if(!won){segments.push({target:[x,y],won,attempts,stuck:tas.getPlayerState()});break;}
  }
  const solved=segments.length===points.length&&segments.every(s=>s.won);
  let replay=null;
  if(solved){
   const expected=JSON.stringify(tas.getPlayerState());tas.restoreState('court-route-start');
   for(const input of inputs)tas.stepFrames(1,input);
   replay={matches:JSON.stringify(tas.getPlayerState())===expected,state:tas.getPlayerState()};
   tas.stepFrames(1,{interact:true});
  }
  return {scope:'Geometry proof with damage suppressed and normal stage8 abilities. High route starts at authored arrival; gallery uses one initial position fixture. Search branches replayed continuously from one start.',start,solved,segments,replay,reward:overlook?!!G.authoredCameraFocus?.courtLook:gallery?!!G.obstacles.find(o=>o.sealedRecollection==='frost-sorcerer')?.read:persistentCircuitOpen('court-high-cache'),inputs};
 },gallery,overlook);
 receipt.errors=errors;
 await mkdir('docs/charters/09-frost-sorcerer/evidence',{recursive:true});
 await writeFile('docs/charters/09-frost-sorcerer/evidence/'+(overlook?'overlook-route':gallery?'gallery-route':'high-route')+'.json',JSON.stringify(receipt,null,2)+'\n');
 if(overlook&&receipt.reward){
  const capture=await page.evaluate(()=>{G.p.invuln=0;const b=G.p.blood;window.__BF.tas.stepFrames(120,{});G.shake=0;render();return {bloodBefore:b,bloodAfter:G.p.blood,bossActive:G.boss.active,cam:G.cam,width:VW,player:G.p.x,boss:G.boss.x,receiver:G.obstacles.find(o=>o.courtBossReceiver).x,png:mainCanvas.toDataURL('image/png').split(',')[1]};});
  await writeFile('docs/charters/09-frost-sorcerer/evidence/overlook.png',Buffer.from(capture.png,'base64'));delete capture.png;console.log(JSON.stringify(capture));
  const narrow=await page.evaluate(()=>{mainCanvas.width=640;mainCanvas.height=360;recalcVP();meta.reducedMotion=true;BFCamera.applySettings({reducedMotion:true});window.__BF.tas.stepFrames(1,{});render();return mainCanvas.toDataURL('image/png').split(',')[1];});
  await writeFile('docs/charters/09-frost-sorcerer/evidence/overlook-narrow.png',Buffer.from(narrow,'base64'));
 }
 console.log(JSON.stringify({...receipt,inputs:receipt.inputs.length},null,2));
 if(errors.length||!receipt.solved||!receipt.replay?.matches||!receipt.reward)process.exitCode=1;
}finally{const child=browser.process();await browser.close();for(const stream of child?.stdio||[])stream?.destroy();server.closeAllConnections();server.close();}
