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
console.log(await page.evaluate(()=>BFCampaignModule.compileLegacyLevel(8,WHITE_COURT_LEVEL).validation.errors));
await page.evaluate(bot.bootstrapStage,8);
console.log(await page.evaluate(()=>({spawn:[G.p.x,G.p.y],len:G.levelLength,boss:G.boss?.type,rests:G.obstacles.filter(o=>o.type==='restSite').map(o=>[o.siteId,o.x]),blueprint:G.campaignBlueprint,geometry:G.geometryAudit?.errors})));
console.log(await page.evaluate(()=>{const tas=window.__BF.tas;
 for(let i=0;i<480;i++)tas.stepFrames(1,{left:true});
 const before=[G.p.x,G.p.y];tas.stepFrames(1,{interact:true});
 return {before,wheel:persistentCircuitOpen('court-wheel'),dead:G.p.dead,candidate:outskirtsInteractionCandidate()?.courtAction};}));
console.log(await page.evaluate(()=>{const tas=window.__BF.tas;
 Object.assign(G.p,{x:8750,y:0,vx:0,vy:0,onGround:true,floorPlat:null,invuln:10});
 tas.stepFrames(2,{});tas.stepFrames(1,{portal:true});tas.stepFrames(1,{});
 const mouths=G.cratePortals.map(o=>({x:o.x,y:o.y,nx:o.nx,ny:o.ny}));
 tas.stepFrames(45,{left:true});tas.stepFrames(360,{});
 return {mouths,glass:circuitOpen('court-glass-cold'),player:[G.p.x,G.p.y],dead:G.p.dead,
  shots:G.projectiles.filter(p=>p.courtCold).map(p=>({x:p.x,y:p.y,hops:p.portalHops}))};}));
await mkdir('docs/charters/09-frost-sorcerer/evidence',{recursive:true});
const png=await page.evaluate(()=>{G.cam=3500;G.camY=0;G.shake=0;G.stageBanner=0;G.outskirtsAnnotation=null;recalcVP();render();return mainCanvas.toDataURL('image/png').split(',')[1];});
await writeFile('docs/charters/09-frost-sorcerer/evidence/foundation.png',Buffer.from(png,'base64'));
} finally {const child=browser.process();await browser.close();for(const stream of child?.stdio||[])stream?.destroy();server.closeAllConnections();server.close();}
