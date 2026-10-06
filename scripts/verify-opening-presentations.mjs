import assert from 'node:assert/strict';
import {launchChrome} from '../tests/launch-chrome.mjs';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const dir='docs/charters/opening-quest-refresh/presentation';await mkdir(dir,{recursive:true});
const browser=await launchChrome({headless:true});const page=await browser.newPage(),errors=[],results=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://localhost:8371/');await page.waitForFunction(()=>window.__BF);
 for(const mobile of [false,true]){
  await page.setViewport({width:mobile?844:1200,height:mobile?390:800,isMobile:mobile,hasTouch:mobile});
  for(const stage of [0,1])for(const harsh of [false,true]){
   const setup=await page.evaluate(({stage,harsh})=>{
    BladefallConversation.close();beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});
    const S=BladefallSideStories,q=S.records.find(q=>q.stage===stage),a=G.obstacles.find(o=>o.sideStoryRole==='actor');
    if(!harsh){let state=S.reduce(G.sessionSideStories,q.id,{type:'choice',choice:'short'}).state;for(const task of q.tasks)state=S.reduce(state,q.id,{type:'task',task:task.id}).state;G.sessionSideStories=state;}
    BladefallSideStoryWorld.apply();G.p.x=a.x+38;G.p.y=0;G.cam=Math.max(0,a.x-350);G.stageBanner=0;mode='play';
    BladefallSideStoryWorld.interact(a);
    const v=S.view(G.sessionSideStories,q.id);return {id:q.id,label:v.choices.find(c=>c.id===(harsh?'harsh':'finish')).label};
   },{stage,harsh});
   const buttons=await page.$$('#fieldConversation button');let target;
   for(const button of buttons)if(await button.evaluate((e,label)=>e.textContent===label,setup.label))target=button;
   assert.ok(target);
   if(mobile)await target.tap();else{await target.focus();await page.keyboard.press('Enter');}
   const check=await page.evaluate(()=>{const panel=document.getElementById('fieldConversation'),r=panel.getBoundingClientRect();return {overflow:panel.scrollWidth>panel.clientWidth+2,top:r.top,bottom:r.bottom,viewport:innerHeight,phase:BladefallSideStories.row(G.sessionSideStories,G.sideStoryScene.id).phase};});
   assert.equal(check.phase,harsh?'harsh':'completed');assert.equal(check.overflow,false);assert.ok(check.top>=0&&check.bottom<=check.viewport);
   await page.evaluate(()=>{for(let i=0;i<180;i++)update(1/60);});
   assert.ok(await page.evaluate(()=>G.sideStoryScene.performance.t>=2.9),'outcome advances during conversation');
   const file=`${dir}/${stage}-${harsh?'refusal':'supper'}-${mobile?'mobile':'desktop'}.png`;await page.screenshot({path:file});
   results.push({stage,mobile,harsh,file,...check});
   if(mobile)await page.touchscreen.tap(15,15);await page.keyboard.press('Escape');
   assert.equal(await page.evaluate(()=>mode),'play');
   if(!harsh){
    const returned=await page.evaluate(stage=>{const saved=JSON.parse(JSON.stringify(G.sessionSideStories));loadStage(stage);G.sessionSideStories=saved;BladefallSideStoryWorld.apply();for(let i=0;i<210;i++)update(1/60);const a=G.obstacles.find(o=>o.sideStoryRole==='actor');return {phase:BladefallSideStories.row(G.sessionSideStories,G.sideStoryScene.id).phase,gone:a.gone,x:a.x,revisit:G.sideStoryScene.revisit};},stage);
    assert.equal(returned.phase,'completed');if(stage===1)assert.equal(returned.gone,true);
    await page.screenshot({path:`${dir}/${stage}-return-${mobile?'mobile':'desktop'}.png`});
   }
  }
 }
 await page.setViewport({width:1200,height:800,isMobile:false,hasTouch:false});
 for(const stage of [0,1]){
  const ids=await page.evaluate(stage=>{BladefallConversation.close();beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});return [...G.obstacles,...G.npcs].filter(o=>BladefallOpeningStories.residentKind(o)).map(o=>BladefallOpeningStories.residentKind(o));},stage);
  for(const id of ids){await page.evaluate(id=>{const o=[...G.obstacles,...G.npcs].find(o=>BladefallOpeningStories.residentKind(o)===id);G.p.x=o.x+55;G.p.y=o.y||0;G.cam=Math.max(0,o.x-550);G.camY=0;BFCamera.reset(G.cam,0);G.stageBanner=0;render();},id);await new Promise(r=>setTimeout(r,140));await page.screenshot({path:`${dir}/resident-${id}.png`});}
 }
 // The survey giver must reappear on a supported part of Broken Muster.
 const mara=await page.evaluate(()=>{BladefallConversation.close();beginRun(0,null,{hp:1,dmg:1},{startStage:0,levelSelect:true});const n=G.npcs.find(n=>n.profileId==='mara');beginMaraRun(n);G.p.x=10300;G.p.y=0;G.cam=9800;BFCamera.reset(9800,0);for(let i=0;i<60*60&&(n.maraRun||n.maraPose);i++)update(1/60);for(let i=0;i<30;i++)update(1/60);return {x:n.x,y:n.y,state:n.state};});
 assert.equal(mara.x,10410);assert.ok(Math.abs(mara.y)<2);
 const shop=await page.evaluate(()=>{beginRun(0,null,{hp:1,dmg:1},{startStage:1,levelSelect:true});const o=G.obstacles.find(o=>o.shopId==='ethereal-goods');G.p.x=o.x+60;G.p.y=0;G.cam=o.x-500;BFCamera.reset(G.cam,0);G.stageBanner=0;return o.name;});
 assert.ok(shop);await new Promise(r=>setTimeout(r,140));await page.screenshot({path:`${dir}/resident-tamsin.png`});
 const sheet=await browser.newPage();await sheet.setViewport({width:1200,height:1600});
 const selected=results.filter(r=>!r.mobile);let html='<style>body{margin:0;background:#15171b;color:#eee;font:16px sans-serif;display:grid;grid-template-columns:1fr 1fr}figure{margin:4px}img{width:590px}</style>';
 for(const r of selected)html+=`<figure><figcaption>${r.stage} ${r.harsh?'Refusal':'Completion'}</figcaption><img src="data:image/png;base64,${(await readFile(r.file)).toString('base64')}"></figure>`;
 await sheet.setContent(html);await sheet.screenshot({path:`${dir}/outcomes-sheet.png`});
 assert.deepEqual(errors,[]);await writeFile(`${dir}/verification.json`,JSON.stringify({scope:'Outcome/UI fixtures, real keyboard/touch choice activation; not route proof.',results,errors},null,2));console.log('PASS: outcomes during dialogue, keyboard/touch, mobile bounds, return states, resident captures.');
}finally{await browser.close();}
