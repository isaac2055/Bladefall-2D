// Reproducible return-shortcut geometry validation and isolated render evidence.
// Run from the project root: node scripts/validate-recall-return.mjs
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
await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.__BF?.tas);
const bot=await import(resolve('scripts/bladefall-bot.mjs'));
await page.setViewport({width:1440,height:900,deviceScaleFactor:1});
// Geometry fixtures: no combat completion claim. Movement after setup uses only TAS inputs.
await mkdir('docs/recall-return/evidence',{recursive:true});
const results=[];
try {
for(const [stage,zone,points] of [
 [6,'warden',[[5500,0],[6200,0],[6880,0]]],
 [0,'outskirts',[[7400,0],[7970,0],[8870,0]]],
 [1,'black-woods',[[7400,130],[7620,260],[7840,390],[8060,520],[8280,620],[9600,620]]],
 [2,'brute',[[5710,0],[5900,70],[6120,135],[6380,200],[6600,265],[7430,265],[7690,200],[7970,130],[8160,0]]]
]) {
 await page.evaluate(bot.bootstrapStage,{stage,muster:true});
 const result=await page.evaluate(({zone,points})=>{
  const tas=window.__BF.tas,cache=G.obstacles.find(o=>o.recallReserve);
  Object.assign(G.p,{x:cache.x,y:cache.y-22,vx:0,vy:0,onGround:true,invuln:999});
  tas.stepFrames(1,{interact:true});tas.stepFrames(1,{});
  const directions=[];
  for(const reverse of [false,true]){
   const path=reverse?[...points].reverse():points;
   const [x,y]=path[0];
   const floor=G.obstacles.find(o=>o.type==='plat'&&!o.gone&&Math.abs(o.y-y)<1&&Math.abs(o.x-x)<o.w/2);
   Object.assign(G.p,{x,y,vx:0,vy:0,onGround:true,floorPlat:floor||null,jumps:0,invuln:999,ckSet:true,ckX:x,ckY:y});
   const touched=new Set(),segments=[];
   for(const [tx,ty] of path.slice(1)){
    tas.saveState('route-branch');let won=false,attempts=[];
    for(const moveAt of [0,18,22,26,30,34]){
     tas.restoreState('route-branch');let hit=false;const roads=new Set();
     const jumping=ty>G.p.y+10||(ty>0&&ty<G.p.y-10&&Math.abs(tx-G.p.x)>240);
     for(let i=0;i<600;i++){
      const p=G.p,dx=tx-p.x;
      tas.stepFrames(1,{right:dx>8&&i>=moveAt,left:dx< -8&&i>=moveAt,
       jump:jumping&&(i<20||(i>=22&&i<45))});
      if(p.floorPlat?.recallRoad)roads.add(p.floorPlat.zoneEntityId);
      if(Math.abs(p.x-tx)<20&&Math.abs(p.y-ty)<3&&p.onGround){hit=true;break;}
     }
     attempts.push({moveAt,hit,x:G.p.x,y:G.p.y});
     if(hit){won=true;for(const id of roads)touched.add(id);break;}
    }
    segments.push({target:[tx,ty],won,attempts});if(!won)break;
   }
   const allRoads=G.obstacles.filter(o=>o.recallRoad).every(o=>touched.has(o.zoneEntityId));
   directions.push({reverse,pass:allRoads&&segments.length===path.length-1&&segments.every(s=>s.won),allRoads,touched:[...touched],segments});
  }
  G.p.x=cache.x;G.p.y=cache.y-22;G.cam=Math.max(0,cache.x-500);G.camY=0;G.shake=0;G.stageBanner=0;G.outskirtsAnnotation=null;
  recalcVP();render();const png=mainCanvas.toDataURL('image/png').split(',')[1];
  return {zone,directions,png};
 },{zone,points});
 await writeFile('docs/recall-return/evidence/'+zone+'.png',Buffer.from(result.png,'base64'));delete result.png;
 results.push(result);console.log(JSON.stringify(result));
}
await writeFile('docs/recall-return/receipt.json',JSON.stringify({version:'7.98.0',scope:'Isolated invulnerable geometry fixtures, actual movement inputs; not campaign or combat completion.',errors,results},null,2)+'\n');
if(errors.length||results.some(r=>r.directions.some(d=>!d.pass)))process.exitCode=1;
} finally {const child=browser.process();await browser.close();for(const stream of child?.stdio||[])stream?.destroy();server.closeAllConnections();server.close();}
