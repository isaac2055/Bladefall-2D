/* Prints the geometry the traversal bot sees for one stretch of a level:
 * standable platforms, walls, doors, mechanisms and enemies with their patrols.
 * Use it to read a bot failure before changing the bot.
 *   node scripts/bot-geometry.mjs <stage> <xFrom> <xTo>
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
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
const [stage, lo, hi] = process.argv.slice(2).map(Number);
await page.evaluate(bot.bootstrapStage, stage);
const out = await page.evaluate((lo, hi) => {
  const inR = (o) => (o.x + (o.w||0)/2) > lo && (o.x - (o.w||0)/2) < hi;
  const plats = G.obstacles.filter(o => o.type==='plat' && !o.gone && inR(o))
    .map(o => ({x0:o.x-o.w/2, x1:o.x+o.w/2, y:o.y||0, h:o.h, ceiling:!!o.ceiling, fake:!!o.fake, invisible:!!o.invisible, crumble:!!o.crumble, move:!!o.move, ice:!!o.ice, gate:!!o.gate}))
    .sort((a,b)=>a.x0-b.x0);
  const other = G.obstacles.filter(o => o.type!=='plat' && !o.gone && inR(o) && o.type!=='scenery' && o.type!=='ambientFigure')
    .map(o => ({type:o.type, x:o.x, y:o.y||0, w:o.w, h:o.h, id:o.id, period:o.period, upT:o.upT, on:o.on, running:o.running, pressed:o.pressed, latch:o.latch, open:(o.type==='door'?(typeof doorOpen==='function'?doorOpen(o):undefined):undefined), keys:Object.keys(o).filter(k=>/[Ll]ever|[Ss]witch|[Gg]ate|door|release|repair|catch|[Pp]late|circuit|requires/.test(k)).slice(0,12)}));
  const enemies = G.enemies.filter(e=>!e.dead && e.x>lo-200 && e.x<hi+200).map(e=>({t:e.type, x:Math.round(e.x), y:Math.round(e.y||0), w:e.w, h:e.h, speed:e.speed, patrol:[e.patrolMin,e.patrolMax], kind:e.kind, notice:e.noticeRange}));
  return { plats, other, enemies };
}, lo, hi);
console.log(JSON.stringify(out, null, 1));
await browser.close(); server.close();
