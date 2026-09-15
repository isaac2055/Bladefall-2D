import { runWhiteCourtFight } from './white-court-fight-policy.mjs';
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
const requestedWeapon=process.argv.find(a=>a.startsWith('--weapon='))?.split('=')[1]||null;
try {
await page.evaluate(bot.bootstrapStage,8);
const receipt=await page.evaluate(runWhiteCourtFight,process.argv.includes('--invulnerable'),requestedWeapon,process.argv.includes('--miss-finish'),process.argv.includes('--approach=left')?'left':'right');
receipt.errors=errors;
await mkdir('docs/charters/09-frost-sorcerer/evidence',{recursive:true});
await writeFile('docs/charters/09-frost-sorcerer/evidence/boss-'+(receipt.approach==='left'?'left-':'')+(requestedWeapon?requestedWeapon+'-':'')+(receipt.missFinish?'missed-finish-':'')+(receipt.invulnerable?'mechanics':'unassisted')+'.json',JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt,null,2));
if(errors.length||!receipt.bossDead||!receipt.attunement||receipt.attemptLost||(receipt.missFinish&&!receipt.finalExposureExpired))process.exitCode=1;
} finally {const child=browser.process();await browser.close();for(const stream of child?.stdio||[])stream?.destroy();server.closeAllConnections();server.close();}
