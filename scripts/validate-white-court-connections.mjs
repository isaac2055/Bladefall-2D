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
 await page.evaluate(()=>{meta.soundOn=false;meta.musicVolume=0;beginRun(0,null,{hp:1,dmg:1},{startStage:8,levelSelect:true,testRun:true,runSeed:0xB07});});
 await at(240,0);await upUntil(()=>G.openedZoneShortcuts.includes('frostfell-sorcerer'));
 await upUntil(()=>G.stageIndex===7);await record('aqueduct to Frostfell');
 await at(14950,650);await upUntil(()=>G.stageIndex===8);await record('aqueduct to White Court');
 await at(4800,0);await upUntil(()=>G.stageIndex===2);await record('shaft to Causeway');
 await at(10980,390);await upUntil(()=>G.stageIndex===8);await record('shaft to White Court');
 await at(15500,0);
 await upUntil(()=>!!G.outskirtsAnnotation);
 if(await page.evaluate(()=>G.stageIndex!==8||hasCapability('attunement')))throw new Error('Ember door opened before reward');
 await record('Ember door locked before Attunement');
 // Isolated victory fixture; boss combat is verified separately in focused tests.
 await page.evaluate(()=>killEnemy(G.boss));
 await upUntil(()=>G.stageIndex===9);await record('Ember door after Attunement');
 await at(180,0);await upUntil(()=>G.stageIndex===8);await record('Emberdeep return');
 if(await page.evaluate(()=>G.enemies.some(e=>e.boss&&!e.dead)))throw new Error('Defeated boss respawned');
 if(errors.length)throw new Error(errors.join('\n'));
 const expected=[[7,14920,650],[8,300,0],[2,10980,390],[8,4800,0],[8,15500,0],[9,240,0],[8,15500,0]];
 results.forEach((r,i)=>{const [stage,x,y]=expected[i];if(r.stage!==stage||Math.abs(r.x-x)>2||Math.abs(r.y-y)>3)throw new Error('Unexpected landing: '+JSON.stringify(r));});
 await mkdir('docs/charters/09-frost-sorcerer/evidence',{recursive:true});
 await writeFile('docs/charters/09-frost-sorcerer/evidence/connections.json',JSON.stringify({scope:'Normal keyboard and automatic loop; isolated endpoint positions and victory fixture. Not approach geometry or a full campaign playthrough.',errors,results},null,2)+'\n');
 console.log(JSON.stringify(results,null,2));
}catch(error){console.error(await page.evaluate(()=>({stage:G.stageIndex,mode,x:G.p.x,y:G.p.y,near:outskirtsInteractionCandidate()?.courtAction,annotation:G.outskirtsAnnotation,door:G.obstacles.find(o=>o.courtAction==='emberdeep')})));throw error;}finally{const child=browser.process();await browser.close();for(const stream of child?.stdio||[])stream?.destroy();server.closeAllConnections();server.close();}
