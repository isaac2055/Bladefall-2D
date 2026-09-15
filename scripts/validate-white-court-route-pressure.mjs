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
const out='docs/charters/09-frost-sorcerer/evidence';
try {
 await mkdir(out,{recursive:true});
 const results=[];
 for(const name of ['high','gallery']){
  await page.evaluate(bot.bootstrapStage,8);
  const route=JSON.parse(await readFile(`${out}/${name}-route.json`,'utf8'));
  const result=await page.evaluate(({name,route})=>{
   const tas=window.__BF.tas;
   if(name==='gallery')Object.assign(G.p,{x:10820,y:0,vx:0,vy:0,onGround:true,floorPlat:null});
   G.p.invuln=0;meta.testMode=false;meta.soundOn=false;
   mainCanvas.width=1440;mainCanvas.height=900;recalcVP();
   const wounds=[],original=hurtPlayer;
   hurtPlayer=function(...args){const before=G.p.blood;const value=original(...args);if(G.p.blood<before)wounds.push({frame:tas.getPlayerState().frame,x:G.p.x,y:G.p.y,before,after:G.p.blood});return value;};
   const start=tas.getPlayerState(),landings=[],captures=[];let frame=0;
   try{
    for(const segment of route.segments){
     for(let i=0;i<segment.frames;i++)tas.stepFrames(1,route.inputs[frame++]);
     landings.push({target:segment.target,x:G.p.x,y:G.p.y,onGround:G.p.onGround,dead:G.p.dead});
     if(landings.length===Math.ceil(route.segments.length/2)||landings.length===route.segments.length){
      G.stageBanner=0;G.shake=0;render();captures.push({segment:landings.length,png:mainCanvas.toDataURL('image/png').split(',')[1]});
     }
    }
    tas.stepFrames(1,{interact:true});
    const reward=name==='high'?persistentCircuitOpen('court-high-cache'):!!G.obstacles.find(o=>o.sealedRecollection==='frost-sorcerer')?.read;
    if(name==='high'){
     render();captures.push({segment:'opened',png:mainCanvas.toDataURL('image/png').split(',')[1]});
    }
    if(name==='gallery')for(let i=0;i<500&&G.p.x<12400&&!G.p.dead;i++)tas.stepFrames(1,{right:true});
    return {name,start,end:tas.getPlayerState(),checkpoint:G.p.ckX,landings,wounds,reward,captures,
     scope:'Damage enabled; fixed stage8 capability-prefix fixture. Gallery begins at10820. Existing geometry-route inputs replayed without branching or repositioning. Not a full campaign-state traversal.'};
   }finally{hurtPlayer=original;}
  },{name,route});
  for(const capture of result.captures)await writeFile(`${out}/${name}-pressure-${capture.segment}.png`,Buffer.from(capture.png,'base64'));
  delete result.captures;
  result.routePassed=result.reward&&!result.end.dead&&result.landings.every(p=>p.onGround&&Math.abs(p.x-p.target[0])<22&&Math.abs(p.y-p.target[1])<3)&&(name!=='gallery'||result.checkpoint===12400);
  results.push(result);
 }
 const receipt={results,errors};
 await writeFile(`${out}/route-pressure.json`,JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify(receipt,null,2));
 if(errors.length||results.some(r=>!r.routePassed))process.exitCode=1;
}finally{const child=browser.process();await browser.close();for(const stream of child?.stdio||[])stream?.destroy();server.closeAllConnections();server.close();}
