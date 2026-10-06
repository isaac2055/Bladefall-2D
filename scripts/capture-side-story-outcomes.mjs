import { launchChrome } from '../tests/launch-chrome.mjs';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const dir='docs/evidence/side-stories/outcomes';await mkdir(dir,{recursive:true});
const b=await launchChrome({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const p=await b.newPage();await p.setViewport({width:1200,height:800});await p.goto('http://localhost:8371/?outcome-review',{waitUntil:'domcontentloaded'});
 const records=await p.evaluate(()=>BladefallSideStories.records.map(q=>({id:q.id,stage:q.stage,title:q.title})));const images=[];
 for(const q of records)for(const branch of ['completed','harsh']){
  await p.evaluate(({q,branch})=>{
   BladefallConversation.close();beginRun(0,null,{hp:1,dmg:1},{startStage:q.stage,levelSelect:true});
   const S=BladefallSideStories;let state=S.reduce(null,q.id,{type:'choice',choice:'short'}).state;
   for(const t of S.byId[q.id].tasks)state=S.reduce(state,q.id,{type:'task',task:t.id,capabilities:['dash','portal-single','portal-pair','downward-strike','gravity-flip','chain-hook','echo']}).state;
   state=S.reduce(state,q.id,{type:'visit'}).state;
   state=S.reduce(state,q.id,{type:'choice',choice:branch==='harsh'?'harsh':S.byId[q.id].resolutions?'finish:keep':'finish'}).state;
   G.sessionSideStories=state;loadStage(q.stage);const base=G.sideStoryScene.base;
   Object.assign(G.p,{x:base.x+40,y:base.y,vx:0,vy:0,onGround:true,invuln:999});G.cartMode=false;mode='play';
   for(let i=0;i<90;i++){if(mode==='conversation')document.querySelector('#fieldConversation button')?.click();update(1/60);BFKeyboard.clearPressed();}
   BladefallConversation.close();G.stageBanner=0;document.getElementById('stageTag').style.display='none';
  },{q,branch});
  await new Promise(r=>setTimeout(r,180));
  const file=`${dir}/${q.id}-${branch}.png`;await p.screenshot({path:file});images.push({id:q.id,title:q.title,branch,file});
 }
 const sheet=await b.newPage();await sheet.setViewport({width:1000,height:1432});
 for(let batch=0;batch<5;batch++){
  const items=images.slice(batch*8,batch*8+8);let html='<style>*{box-sizing:border-box}body{margin:0;background:#12141a;color:#eee;font:16px system-ui;display:grid;grid-template-columns:1fr 1fr}figure{margin:0;padding:4px}figcaption{height:22px}img{width:492px;height:328px;object-fit:contain}</style>';
  for(const item of items)html+=`<figure><figcaption>${item.title} — ${item.branch}</figcaption><img src="data:image/png;base64,${(await readFile(item.file)).toString('base64')}"></figure>`;
  await sheet.setContent(html);await sheet.screenshot({path:`${dir}/sheet-${batch+1}.png`});
 }
 await writeFile(`${dir}/manifest.json`,JSON.stringify({scope:'Rendered return-visit outcome fixtures after all tasks, for completed and harsh branches of all 20 stories. Visual QA only; route mechanics are verified separately.',images},null,2)+'\n');console.log('Captured 40 outcome views and five comparison sheets.');
}finally{await b.close();}
