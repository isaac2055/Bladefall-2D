import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {launchChrome} from '../tests/launch-chrome.mjs';
import {workshopRoute} from './workshop-route-policy.mjs';
import {bootstrapStage} from './bladefall-bot.mjs';
const root=resolve('public');
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://x').pathname));if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',extname(p)==='.js'?'text/javascript':extname(p)==='.mp3'?'audio/mpeg':'text/html');res.end(await readFile(p));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await launchChrome({headless:true});
try{
 const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/index.html?tas=1`);await page.waitForFunction(()=>window.__BF?.tas);
 const report=[];
 for(const id of [12,19,23,24]){
  const route=JSON.parse(await readFile('docs/charters/celeste/evidence/workshop/routes.json'))[id];
  await page.evaluate(bootstrapStage,44);await page.evaluate(id=>{BladefallPrecisionWorkshop.select(id);__BF.tas.stepFrames(2,{});},id);
  const prep=await page.evaluate(({id,tape})=>{const r=G.celeste.rooms[id];let found=false;for(const k of tape){const o=G.p.floorPlat;if(G.p.onGround&&((id===12&&o?.ceOriginX===r.x+2520||id===19&&o?.ceOriginX===r.x+1100&&o.ceOriginY===80)&&o.ceGold||id>=23&&o?.ceWeight&&o.ceT===1)){found=true;break;}__BF.tas.stepFrames(1,k);}if(!found)throw Error('missing prefix '+id);if(id<23){const o=G.obstacles.find(o=>o.ceRoom===id&&o.ceRoot&&o.ceOriginX-r.x>(id===12?3000:1800));o.ceRoot=false;o.gone=true;}__BF.tas.saveState('shortcut-prefix');return {x:G.p.x-r.x,y:G.p.y};},{id,tape:route.tape});
  let bypasses=0,attempts=0,farthest=0;
  for(const secondJump of [18,30,42,54,66])for(const dashAt of [8,18,28,38,48])for(const repeat of [0,24,36])for(const aim of ['up','right']){
   const result=await page.evaluate(({id,secondJump,dashAt,repeat,aim})=>{__BF.tas.restoreState('shortcut-prefix');const a=G.celeste,r=a.rooms[id],p=G.p;let maxX=0,bypass=false,landAt=null;const initialHits=a.anvilHits||0;
    for(let n=0;n<600&&!a.deaths&&!a.complete;n++){
     if(id>=23&&p.onGround&&p.floorPlat?.ceAnvil&&landAt==null)landAt=n;
     const age=landAt==null?n:n-landAt,dodge=age===dashAt||repeat&&age>dashAt&&(age-dashAt)%repeat===0;
     __BF.tas.stepFrames(1,{right:true,jump:age===0||age===secondJump,dodge:!!dodge,up:!!dodge&&aim==='up'});maxX=Math.max(maxX,p.x-r.x);
     bypass=id>=23?!!p.seamRide&&(a.anvilHits||0)===initialHits:id===19?a.workshop.bells>0:a.complete;
     if(bypass)break;
    }
    return {bypass,maxX,deaths:a.deaths,complete:a.complete};
   },{id,secondJump,dashAt,repeat,aim});attempts++;farthest=Math.max(farthest,result.maxX);if(result.bypass){bypasses++;console.log('BYPASS',id,secondJump,dashAt,repeat,aim,result.maxX);}
   report.push({id,secondJump,dashAt,repeat,aim,...result});
  }
  console.log('ROOM',id,JSON.stringify({prep,attempts,bypasses,farthest}));
 }
 await writeFile('docs/charters/celeste/evidence/workshop/movement-shortcuts.json',JSON.stringify(report));assert.equal(report.filter(r=>r.bypass).length,0,'mechanic bypass found');console.log('PASS: '+report.length+' targeted movement shortcuts blocked.');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
