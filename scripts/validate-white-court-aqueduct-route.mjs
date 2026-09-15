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
await page.setViewport({width:1440,height:900,deviceScaleFactor:1});
const results=[];
async function upUntil(check){
 await page.keyboard.down('ArrowUp');
 try{await page.waitForFunction(check,{timeout:10000});}
 finally{await page.keyboard.up('ArrowUp');}
 // Let a normal animation tick consume the release before another press.
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
}
async function record(name){results.push(await page.evaluate(name=>({name,stage:G.stageIndex,x:G.p.x,y:G.p.y,endpoint:G.zoneArrival?.endpointId,ability:hasCapability('double-jump')}),name));}
async function walkTo(x){
 const from=await page.evaluate(()=>G.p.x),right=x>from,key=right?'ArrowRight':'ArrowLeft';
 await page.keyboard.down(key);
 try{await page.waitForFunction(({x,right})=>right?G.p.x>=x:G.p.x<=x,{timeout:60000},{x,right});}
 finally{await page.keyboard.up(key);}
 await page.waitForFunction(()=>Math.abs(G.p.vx)<1,{timeout:8000});
}
try{
 await page.evaluate(()=>{meta.soundOn=false;meta.musicVolume=0;beginRun(0,null,{hp:1,dmg:1},{startStage:8,levelSelect:true,testRun:true,runSeed:0xB07});});
 await page.evaluate(()=>{
  window.__aqueductDamage=[];const original=hurtPlayer;
  hurtPlayer=function(...args){const before=G.p.blood,where={stage:G.stageIndex,x:G.p.x,y:G.p.y,time:G.time};const result=original.apply(this,args);if(G.p.blood<before)window.__aqueductDamage.push({...where,before,after:G.p.blood});return result;};
 });
 const start=await page.evaluate(()=>({x:G.p.x,y:G.p.y,blood:G.p.blood,testMode:!!meta.testMode}));
 await walkTo(240);await record('walk from refuge to White Court latch');
 await upUntil(()=>G.openedZoneShortcuts.includes('frostfell-sorcerer'));
 await upUntil(()=>G.stageIndex===7);await record('aqueduct arrival on Frostfell summit');
 await walkTo(14680);await record('walk from aqueduct to summit service passage');
 await upUntil(()=>G.p.x<2000);await record('summit service to Frostfell refuge');
 await upUntil(()=>G.p.x>7000);await record('refuge service to high gallery');
 await upUntil(()=>G.p.x>14000);await record('high gallery service back to summit');
 await walkTo(14930);await record('walk back to Frostfell aqueduct');
 await upUntil(()=>G.stageIndex===8);await record('aqueduct return to White Court');
 await walkTo(4780);await record('walk back to White Court refuge');
 const end=await page.evaluate(()=>({x:G.p.x,y:G.p.y,blood:G.p.blood,testMode:!!meta.testMode,checkpoint:G.p.ckX,opened:G.openedZoneShortcuts.includes('frostfell-sorcerer')}));
 const damage=await page.evaluate(()=>window.__aqueductDamage);
 const expected=[[8,240,0],[7,14920,650],[7,14680,650],[7,1330,0],[7,7220,210],[7,14680,650],[7,14930,650],[8,300,0],[8,4780,0]];
 results.forEach((r,i)=>{const [stage,x,y]=expected[i];if(r.stage!==stage||Math.abs(r.x-x)>35||Math.abs(r.y-y)>3)throw new Error('Unexpected route landing: '+JSON.stringify(r));});
 if(errors.length||damage.length||end.blood!==start.blood||end.testMode||!end.opened||end.checkpoint!==4800)throw new Error('Route invariant failed: '+JSON.stringify({start,end,damage,errors}));
 const receipt={scope:'One normal stage8 capability-prefix fixture at authored arrival; normal keyboard and automatic loop throughout. No endpoint repositioning, damage suppression or victory fixture. Existing Frostfell service interactions supply their authored travel.',start,end,results,damage,errors};
 await mkdir('docs/charters/09-frost-sorcerer/evidence',{recursive:true});
 await writeFile('docs/charters/09-frost-sorcerer/evidence/aqueduct-route.json',JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify(receipt,null,2));
}catch(error){console.error(await page.evaluate(()=>({stage:G.stageIndex,mode,x:G.p.x,y:G.p.y,blood:G.p.blood,near:outskirtsInteractionCandidate()?.courtAction,annotation:G.outskirtsAnnotation?.body})));throw error;}
finally{const child=browser.process();await browser.close();for(const stream of child?.stdio||[])stream?.destroy();server.closeAllConnections();server.close();}
