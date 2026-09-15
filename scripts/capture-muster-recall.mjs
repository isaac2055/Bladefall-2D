/* Isolated render fixtures for recall arrivals and regional telegraphs.
 * Uses authored return coordinates and hides defeated bosses explicitly;
 * these screenshots are presentation evidence, not completed travel/boss runs.
 * Run: node scripts/capture-muster-recall.mjs
 */
/* Prints the geometry the traversal bot sees for one stretch of a level:
 * standable platforms, walls, doors, mechanisms and enemies with their patrols.
 * Use it to read a bot failure before changing the bot.
 *   node scripts/bot-geometry.mjs <stage> <xFrom> <xTo>
 */
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
await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.__BF?.tas);
const bot=await import(resolve('scripts/bladefall-bot.mjs'));
await page.setViewport({width:1440,height:900,deviceScaleFactor:1});
await mkdir('docs/recall/evidence',{recursive:true});
const scenes=[[6,'gaoler',850,0],[0,'outrider',1460,0],[1,'canopywing',3160,230],[2,'chainmarshal',3870,0]];
for(const [stage,type,x,y] of scenes){
 await page.evaluate(bot.bootstrapStage,{stage,muster:true});
 const png=await page.evaluate(({x,y,type})=>{
   G.p.x=x+110;G.p.y=0;G.p.vx=G.p.vy=0;
   G.sessionCapabilities=levelSelectCapabilitiesForStage(8);
   for(const boss of G.enemies)if(boss.boss)boss.dead=true; // returned-save fixture, not a boss victory
   const e=G.enemies.find(a=>a.type===type&&Math.abs(a.x-x)<20);
   e.active=true;e.recallCooldown=0;updateRegionalRecallEnemy(e,G.p,1/60,e.speed);
   G.cam=Math.max(0,x-520);G.camY=0;G.shake=0;G.stageBanner=0;G.outskirtsAnnotation=null;
   recalcVP();render();return mainCanvas.toDataURL('image/png').split(',')[1];
 },{x,y,type});
 await writeFile('docs/recall/evidence/'+type+'.png',Buffer.from(png,'base64'));
 console.log(type+' captured');
}
for(const [stage,x,y] of [[6,330,0],[0,70,500],[1,70,0],[2,70,0]]){
 await page.evaluate(bot.bootstrapStage,{stage,muster:true});
 const png=await page.evaluate(({x,y})=>{
   for(const boss of G.enemies)if(boss.boss)boss.dead=true;
   G.p.x=x;G.p.y=y;G.p.vx=G.p.vy=0;G.cam=0;G.camY=Math.max(0,y-200);
   G.shake=0;G.stageBanner=0;G.outskirtsAnnotation=null;recalcVP();render();
   return mainCanvas.toDataURL('image/png').split(',')[1];
 },{x,y});
 await writeFile('docs/recall/evidence/arrival-'+stage+'.png',Buffer.from(png,'base64'));
}
await browser.close();server.close();
