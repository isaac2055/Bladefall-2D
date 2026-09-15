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
const includeBoss=process.argv.includes('--boss');
const {runWhiteCourtFight}=await import('./white-court-fight-policy.mjs');
const out='docs/charters/09-frost-sorcerer/evidence';
try{
 await page.evaluate(bot.bootstrapStage,8);
 const high=JSON.parse(await readFile(`${out}/high-route.json`,'utf8'));
 const gallery=JSON.parse(await readFile(`${out}/gallery-route.json`,'utf8'));
 const receipt=await page.evaluate(({high,gallery})=>{
  const tas=window.__BF.tas,inputs=[],events=[],wounds=[];let bridge=false,hopped=false;
  G.p.invuln=0;meta.testMode=false;meta.soundOn=false;
  const original=hurtPlayer;hurtPlayer=function(...args){const before=G.p.blood;const r=original(...args);if(G.p.blood<before)wounds.push({frame:inputs.length,x:G.p.x,y:G.p.y,before,after:G.p.blood});return r;};
  const step=input=>{tas.stepFrames(1,input);inputs.push(input);bridge ||= G.p.floorPlat?.zoneEntityId==='court-glass-ice-bridge';hopped ||= G.projectiles.some(p=>p.courtCold&&p.portalHops>0);};
  const event=name=>events.push({name,frame:inputs.length,...tas.getPlayerState(),checkpoint:G.p.ckX});
  const move=(x,limit=1000)=>{for(let i=0;i<limit&&!G.p.dead;i++){const dx=x-G.p.x;if(Math.abs(dx)<8&&Math.abs(G.p.vx)<8&&G.p.onGround)break;step({right:dx>8,left:dx<-8,attack:i%30===0});}};
  try{
   event('start');for(const input of high.inputs)step(input);step({interact:true});event('cache');
   move(8750);event('emitter');
   step({portal:true});step({});for(let i=0;i<45;i++)step({left:true});
   for(let i=0;i<480&&!circuitOpen('court-glass-cold')&&!G.p.dead;i++)step({attack:i%30===0});event('glass-circuit');
   move(10820,1400);event('gallery-entrance');
   for(const input of gallery.inputs)step(input);step({interact:true});event('recollection');
   move(12400);event('gallery-checkpoint');
   return {scope:'Continuous damage-enabled route from stage8 capability-prefix arrival. No intermediate position or state fixtures.',events,wounds,bridge,hopped,recollection:!!G.obstacles.find(o=>o.sealedRecollection==='frost-sorcerer')?.read,checkpoint:G.p.ckX,glass:circuitOpen('court-glass-cold'),end:tas.getPlayerState(),inputs};
  }finally{hurtPlayer=original;}
 },{high,gallery});
 if(includeBoss){
  receipt.arenaApproach=await page.evaluate(()=>{
   const tas=window.__BF.tas,inputs=[],start=tas.getPlayerState();
   for(let i=0;i<1400&&!G.p.dead;i++){
    const dx=13960-G.p.x;
    if(Math.abs(dx)<8&&Math.abs(G.p.vx)<8&&G.p.onGround)break;
    const input={right:dx>8,left:dx<-8,attack:i%30===0};
    tas.stepFrames(1,input);inputs.push(input);
   }
   // Clear the earlier Glassworks mouth through the ordinary place/cycle input.
   for(let i=0;i<3&&G.cratePortals.length;i++){tas.stepFrames(1,{portal:true});tas.stepFrames(1,{});inputs.push({portal:true},{});}
   return {start,end:tas.getPlayerState(),mouths:G.cratePortals.length,inputs};
  });
  receipt.fight=await page.evaluate(runWhiteCourtFight,false,null,false,'right',true);
  if(receipt.fight.bossDead)receipt.exitApproach=await page.evaluate(()=>{
   const tas=window.__BF.tas,inputs=[];
   for(let i=0;i<900;i++){
    const dx=15500-G.p.x;if(Math.abs(dx)<8&&Math.abs(G.p.vx)<8&&G.p.onGround)break;
    const input={right:dx>8,left:dx<-8};tas.stepFrames(1,input);inputs.push(input);
   }
   return {state:tas.getPlayerState(),candidate:outskirtsInteractionCandidate()?.courtAction,attunement:hasCapability('attunement'),inputs,
    boundary:'Stops at the usable exit; TAS intentionally refuses asynchronous zone crossings.'};
  });
 }
 receipt.errors=errors;receipt.passed=receipt.glass&&receipt.bridge&&receipt.hopped&&!receipt.end.dead&&Math.abs(receipt.end.x-12400)<30&&receipt.recollection&&receipt.checkpoint===12400;
 if(includeBoss)receipt.passed&&=receipt.fight.bossDead&&receipt.fight.attunement&&!receipt.fight.dead&&!receipt.fight.attemptLost&&receipt.exitApproach?.candidate==='emberdeep'&&receipt.exitApproach.attunement;
 await writeFile(`${out}/${includeBoss?'continuous-boss':'continuous-approach'}.json`,JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({...receipt,inputs:receipt.inputs.length,arenaApproach:receipt.arenaApproach?{...receipt.arenaApproach,inputs:receipt.arenaApproach.inputs.length}:undefined,fight:receipt.fight?{...receipt.fight,inputs:receipt.fight.inputs.length}:undefined},null,2));if(!receipt.passed||errors.length)process.exitCode=1;
}finally{const child=browser.process();await browser.close();for(const stream of child?.stdio||[])stream?.destroy();server.closeAllConnections();server.close();}
