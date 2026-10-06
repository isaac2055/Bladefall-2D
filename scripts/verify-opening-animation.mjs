import assert from 'node:assert/strict';
import {launchChrome} from '../tests/launch-chrome.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const dir='docs/charters/opening-quest-refresh/presentation';
const b=await launchChrome({headless:true});
try{
 const p=await b.newPage();await p.setViewport({width:1200,height:800});await p.goto('http://localhost:8371/');await p.waitForFunction(()=>window.__BF);
 const receipt=await p.evaluate(()=>{
  const checks=[];
  for(const stage of [0,1]){
   beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});mode='pause';
   const S=BladefallSideStories,id=G.sideStoryScene.id,q=S.records.find(q=>q.id===id);
   G.sessionSideStories=S.reduce(G.sessionSideStories,id,{type:'choice',choice:'short'}).state;
   for(const task of q.tasks){
    G.sessionSideStories=S.reduce(G.sessionSideStories,id,{type:'task',task:task.id}).state;
    const r=S.row(G.sessionSideStories,id);BladefallOpeningStories.update(0,r);
    const start=G.sideStoryScene.performance.actionT;
    BladefallOpeningStories.update(2.5,r);
    checks.push({stage,task:task.id,start,end:G.sideStoryScene.performance.actionT,carried:!G.obstacles.find(o=>o.sideStoryRole==='carried').gone});
   }
  }
  return checks;
 });
 for(const r of receipt){assert.equal(r.start,0);assert.equal(r.end,2.5);assert.equal(r.carried,['bell','lantern','floor'].includes(r.task));}
 // Render the actual completion performances at three distinct times.
 const captures=[];
 for(const kind of ['mara','bram','assessor'])for(const t of [0,.8,2]){
  await p.evaluate(({kind,t})=>{
   beginRun(0,null,{hp:1,dmg:1},{startStage:kind==='mara'?0:1,levelSelect:true});mode='pause';
   const o=kind==='assessor'?G.obstacles.find(o=>o.shopId==='ethereal-goods'):G.npcs.find(o=>o.profileId===kind);
   G.p.x=o.x+55;G.p.y=o.y||0;G.cam=Math.max(0,o.x-550);G.camY=0;BFCamera.reset(G.cam,0);G.stageBanner=0;
   o.done=true;o._openingDoneT=t;o._openingGifted=true;o._openingGiftT=t;render();
  },{kind,t});
  const file=`${dir}/animation-${kind}-${t}.png`;await p.screenshot({path:file});captures.push({kind,t,file});
 }
 const sheet=await b.newPage();await sheet.setViewport({width:1200,height:1050});
 let html='<style>body{margin:0;background:#111;color:#eee;font:14px sans-serif;display:grid;grid-template-columns:repeat(3,400px);align-content:start}figure{margin:0}img{width:400px}</style>';
 for(const r of captures)html+=`<figure><figcaption>${r.kind} ${r.t}s</figcaption><img src="data:image/png;base64,${(await readFile(r.file)).toString('base64')}"></figure>`;
 await sheet.setContent(html);await sheet.screenshot({path:`${dir}/animation-sheet.png`});
 let residents='<style>body{margin:0;background:#111;color:#eee;font:14px sans-serif;display:grid;grid-template-columns:repeat(2,600px);align-content:start}figure{margin:0}img{width:600px}</style>';
 for(const kind of ['vey','olan','orra','pell','hale','bram'])residents+=`<figure><figcaption>${kind}</figcaption><img src="data:image/png;base64,${(await readFile(`${dir}/resident-${kind}.png`)).toString('base64')}"></figure>`;
 await sheet.setViewport({width:1200,height:1260});await sheet.setContent(residents);await sheet.screenshot({path:`${dir}/residents-sheet.png`});
 await writeFile(`${dir}/animation-verification.json`,JSON.stringify({scope:'Task-transition clocks and carried-prop assertions; rendered completion fixtures for survey, escort and shop gift.',receipt,captures},null,2));
 console.log('PASS: task transitions, carrying through repair, completed prop removal; animation captures.');
}finally{await b.close();}
