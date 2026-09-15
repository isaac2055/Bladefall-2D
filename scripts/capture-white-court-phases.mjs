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
try{
 await page.evaluate(bot.bootstrapStage,8);
 const route=JSON.parse(await readFile(`${out}/continuous-boss.json`,'utf8'));
 const receipt=await page.evaluate(route=>{
  const tas=window.__BF.tas,captures=[],seen=new Set();
  G.p.invuln=0;meta.testMode=false;meta.soundOn=false;meta.reducedMotion=true;

  const inputs=[...route.inputs,...route.arenaApproach.inputs,...route.fight.inputs,...route.exitApproach.inputs];
  const capture=(name,frame)=>{
   if(seen.has(name))return;seen.add(name);G.stageBanner=0;G.shake=0;
   const camera=G.cam;if(name.startsWith('frost-'))G.cam=14550-VW/2;else if(name==='refuge')G.cam=G.p.x-VW/2;render();
   const view=document.createElement('canvas');view.width=VW;view.height=VH;view.getContext('2d').drawImage(mainCanvas,0,0);
   captures.push({name,frame,width:VW,height:VH,player:tas.getPlayerState(),ward:G.boss.courtBreaks,png:view.toDataURL('image/png').split(',')[1]});G.cam=camera;
  };
  for(let i=0;i<inputs.length;i++){
   tas.stepFrames(1,inputs[i]);const e=G.boss,patch=G.obstacles.find(o=>o.courtGlaze);
   if(i===0)capture('refuge',i);
   if(G.p.onGround&&Math.abs(G.p.x-8750)<8)capture('glassworks',i);
   if(!e.active||G.p.x<13000)continue;
   if(e.courtBreaks===0&&e.courtCastWind>.5)capture('first-cast',i);
   if(e.courtBreaks===1&&e.spellStunT>0)capture('first-ward',i);
   if(e.courtBreaks===1&&patch.courtFrostWarn)capture('frost-warning',i);
   if(e.courtBreaks===1&&patch.ice)capture('frost-active',i);
   if(e.courtBreaks===1&&e.courtSecondT>.3)capture('followup-warning',i);
   if(e.courtBlinkWind>.3)capture('blink-warning',i);
   if(e.courtBreaks===2&&G.aoes.some(a=>a.courtAttack&&a.dmg>0&&a.t>.7))capture('third-phase-mark',i);
   if(e.courtBreaks===3&&!e.dead)capture('final-opening',i);
   if(e.dead)capture('victory',i);
  }
  return {scope:'Actual continuous input replay; sound off and reduced motion enabled. No attack-state fixtures.',captures,end:tas.getPlayerState(),bossDead:G.boss.dead,attunement:hasCapability('attunement')};
 },route);
 for(const c of receipt.captures){await writeFile(`${out}/phase-${c.name}.png`,Buffer.from(c.png,'base64'));delete c.png;}
 receipt.errors=errors;await writeFile(`${out}/phase-review.json`,JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify(receipt,null,2));if(errors.length||!receipt.bossDead||receipt.captures.length!==11)process.exitCode=1;
}finally{const child=browser.process();await browser.close();for(const stream of child?.stdio||[])stream?.destroy();server.closeAllConnections();server.close();}
