import {launchChrome} from '../tests/launch-chrome.mjs';
import {readFile} from 'node:fs/promises';
const dir='docs/charters/early-platforming/evidence';const b=await launchChrome({headless:true});
try{const p=await b.newPage();await p.setViewport({width:1200,height:800});await p.goto('http://localhost:8371/');await p.waitForFunction(()=>window.__BF);
const files=[];const errors=[];p.on('pageerror',e=>errors.push(e.message));
for(const stage of [1,2,21,22,25]){
 await p.evaluate(stage=>{beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});mode='pause';if(stage===1||stage===22){if(stage===22)BladefallFractured.grantBlade();else grantPermanentCapability('weapon','capture-fixture',{quiet:true});G.p.weapon=oathbladeWeapon();}const r=G.earlyPlatforming.room;G.p.x=r.start+35;G.p.y=r.spawn[1];G.cam=r.start-80;G.camY=0;BFCamera.reset(G.cam,0);G.stageBanner=0;render();},stage);
 await new Promise(r=>setTimeout(r,120));const file=`${dir}/room-${stage}.png`;await p.screenshot({path:file});files.push({file,label:'Stage '+stage});
}
for(const phase of ['active','completed','harsh']){
 await p.evaluate(phase=>{beginRun(0,null,{hp:1,dmg:1},{startStage:2,levelSelect:true});const S=BladefallSideStories;let state=S.reduce(G.sessionSideStories,'defector',{type:'choice',choice:'short'}).state;if(phase!=='active'){for(const t of S.byId.defector.tasks)state=S.reduce(state,'defector',{type:'task',task:t.id,capabilities:['weapon']}).state;state=S.reduce(state,'defector',{type:'choice',choice:phase==='harsh'?'harsh':'finish'}).state;}G.sessionSideStories=state;BladefallSideStoryWorld.apply();G.p.x=10880;G.p.y=130;mode='play';for(let i=0;i<240;i++)update(1/60);mode='pause';G.p.x=10790;G.p.y=130;G.cam=10450;G.camY=0;BFCamera.reset(G.cam,0);G.stageBanner=0;render();},phase);
 await new Promise(r=>setTimeout(r,120));const file=`${dir}/silas-${phase}.png`;await p.screenshot({path:file});files.push({file,label:'Silas '+phase});
}
await p.setViewport({width:844,height:390,isMobile:true,hasTouch:true});
await p.waitForFunction(()=>window.__BF);await p.evaluate(()=>{beginRun(0,null,{hp:1,dmg:1},{startStage:2,levelSelect:true});mode='pause';G.p.x=10790;G.p.y=130;G.stageBanner=0;G.cam=10450;G.camY=0;BFCamera.reset(G.cam,0);render();});
await p.screenshot({path:`${dir}/silas-mobile.png`});
if(errors.length)throw new Error(errors.join('\n'));
const sheet=await b.newPage();await sheet.setViewport({width:1200,height:1900});let html='<style>body{margin:0;background:#111;color:#eee;font:16px sans-serif;display:grid;grid-template-columns:repeat(2,600px);align-content:start}figure{margin:0}img{width:600px}</style>';
for(const r of files)html+=`<figure><figcaption>${r.label}</figcaption><img src="data:image/png;base64,${(await readFile(r.file)).toString('base64')}"></figure>`;
await sheet.setContent(html);await sheet.screenshot({path:`${dir}/review-sheet.png`});
}finally{await b.close();}
