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
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/index.html`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.__BF);
const bot=await import(resolve('scripts/bladefall-bot.mjs'));
await page.setViewport({width:1440,height:900,deviceScaleFactor:1});
const results=[];
async function upUntil(check){
 await page.keyboard.down('ArrowUp');
 try{await page.waitForFunction(check,{timeout:10000});}
 finally{await page.keyboard.up('ArrowUp');}
 // Let a normal animation tick consume the release before another press.
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
}
async function at(x,y){await page.evaluate(({x,y})=>{G.outskirtsAnnotation=null;Object.assign(G.p,{x,y,vx:0,vy:0,onGround:true,floorPlat:null,invuln:30});},{x,y});}
async function record(name){results.push(await page.evaluate(name=>({name,stage:G.stageIndex,x:G.p.x,y:G.p.y,endpoint:G.zoneArrival?.endpointId,ability:hasCapability('double-jump')}),name));}
try{
 await page.evaluate(()=>{
  meta.soundOn=false;meta.musicVolume=0;beginRun(0,null,{hp:1,dmg:1},{startStage:8,levelSelect:true,testRun:true,runSeed:0xB07});
  meta.capabilities=G.sessionCapabilities;meta.zoneState=G.sessionZoneState;
  G.levelSelectMode=false;G.worldProgressEligible=true;G.sessionCapabilities=null;G.sessionZoneState=null;
 });
 await at(3240,0);await upUntil(()=>persistentCircuitOpen('court-wheel'));
 await at(7340,420);await upUntil(()=>persistentCircuitOpen('court-high-cache'));
 const rewards=await page.evaluate(()=>({seals:meta.advancement.forgeSeals,fragments:meta.advancement.vitalityFragments}));
 await at(240,0);await upUntil(()=>G.openedZoneShortcuts.includes('frostfell-sorcerer'));
 await page.evaluate(()=>{captureCurrentZonePersistence();saveRunAtStage(8);});
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__BF&&meta.run);
 await page.evaluate(()=>continueRun());
 const restored=await page.evaluate(()=>({opened:G.openedZoneShortcuts.includes('frostfell-sorcerer'),wheel:persistentCircuitOpen('court-wheel'),cache:persistentCircuitOpen('court-high-cache'),seals:meta.advancement.forgeSeals,fragments:meta.advancement.vitalityFragments}));
 if(!restored.opened||!restored.wheel||!restored.cache||restored.seals!==rewards.seals||restored.fragments!==rewards.fragments)throw new Error('Progress did not survive reload: '+JSON.stringify(restored));
 await at(240,0);await upUntil(()=>G.stageIndex===7);await record('saved-open aqueduct to Frostfell');
 await at(14950,650);await upUntil(()=>G.stageIndex===8);await record('saved-open aqueduct return');
 const victoryRewards=await page.evaluate(()=>{killEnemy(G.boss);saveRunAtStage(8);return {seals:meta.advancement.forgeSeals,fragments:meta.advancement.vitalityFragments};});
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__BF&&meta.run);await page.evaluate(()=>continueRun());
 const victory=await page.evaluate(()=>({ability:hasCapability('attunement'),bossAlive:G.enemies.some(e=>e.boss&&!e.dead)}));
 if(!victory.ability||victory.bossAlive)throw new Error('Victory did not survive reload');
 await at(3240,0);await upUntil(()=>!!G.outskirtsAnnotation);
 await at(7340,420);await upUntil(()=>!!G.outskirtsAnnotation);
 const final=await page.evaluate(()=>({seals:meta.advancement.forgeSeals,fragments:meta.advancement.vitalityFragments}));
 if(JSON.stringify(final)!==JSON.stringify(victoryRewards))throw new Error('Revisit reward mismatch: '+JSON.stringify({victoryRewards,final}));
 if(errors.length)throw new Error(errors.join('\n'));
 const receipt={scope:'Fresh-page reload of an isolated campaign-prefix fixture; normal keyboard latch/reward interactions, victory fixture.',rewards,restored,victoryRewards,victory,final,results,errors};
 await mkdir('docs/charters/09-frost-sorcerer/evidence',{recursive:true});
 await writeFile('docs/charters/09-frost-sorcerer/evidence/reload.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));
}finally{const child=browser.process();await browser.close();for(const stream of child?.stdio||[])stream?.destroy();server.closeAllConnections();server.close();}
