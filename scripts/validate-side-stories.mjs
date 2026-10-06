import { launchChrome } from '../tests/launch-chrome.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await launchChrome({headless:true,executablePath:process.env.PUPPETEER_EXECUTABLE_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const page=await browser.newPage();await page.setViewport({width:1440,height:900});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(process.env.BLADEFALL_URL||'http://127.0.0.1:8371/index.html?side-stories-validation=1',{waitUntil:'domcontentloaded'});
 const results=await page.evaluate(()=>{
  const results=[];
  function click(label){const b=[...document.querySelectorAll('#fieldConversation button')].find(b=>b.textContent===label);if(!b)throw new Error('Missing choice: '+label);b.click();}
  function choose(q,id){const v=BladefallSideStories.view(BladefallSideStoryWorld.state(),q.id),c=v.choices.find(c=>c.id===id);if(!c)throw new Error(q.id+': missing '+id);click(c.label);}
  function use(o){if(!o)throw new Error('missing object');Object.assign(G.p,{x:o.x,y:o.y,vx:0,vy:0});if(!beginOutskirtsInteraction(o))throw new Error('interaction failed '+o.title);}
  for(const q of BladefallSideStories.records)for(const route of ['short','medium','harsh']){
   beginRun(0,null,{hp:1,dmg:1},{startStage:q.stage,levelSelect:true});
   G.sessionCapabilities=BladefallCapabilities.createState({acquired:BladefallProgression.abilities.map(a=>a.id)});
   // These tests verify dialogue and world-state integration, not earned ability progression or traversal.
   if(q.id==='figure')G.boss.echoDuel={};
   const actor=G.obstacles.find(o=>o.sideStoryRole==='actor');use(actor);
   if(route==='medium'){choose(q,'medium');choose(q,'ask:0');choose(q,'ask:1');choose(q,'accept');choose(q,'leave');}
   else if(route==='harsh'&&q.harshAt!=='ready'){choose(q,'harsh');choose(q,'leave');}
   else{choose(q,'short');choose(q,'leave');}
   if(route!=='harsh'||q.harshAt==='ready'){
    for(const t of q.tasks){
     const o=G.obstacles.find(o=>o.sideStory===q.id&&o.task===t.id);
     // Supply explicit mechanic fixtures here; route tests exercise the movement itself.
     if(['gear','mould'].includes(t.id)){Object.assign(G.p,{x:o.x,y:o.y+10,swingT:t.id==='gear'?.2:0,pogoSwing:false,upSlashSwing:false,slamming:t.id==='mould'});BladefallSideStoryWorld.update(1/60);G.p.swingT=0;G.p.slamming=false;}
     if(['funnel','chimes','frost','tables'].includes(t.id))G.cratePortals=[{...G.sideStoryScene.flowSource,nx:0,ny:1,surf:'floor'},{x:o.x,y:o.y,nx:0,ny:1,surf:'floor'}];
     if(t.id==='release')G.echoBody={...G.sideStoryScene.echoPad,spent:false,life:30};
     if(t.id==='service')G.gravityFlipped=true;
     if(t.id==='charm'){G.p.actHook={ring:G.obstacles.find(o=>o.sideStoryRole==='hook')};BladefallSideStoryWorld.update(1/60);G.p.actHook=null;}
     if(t.id==='water')G.actTwo.tapOpen=true;
     if(t.id==='ballast'){const cart=G.obstacles.find(p=>p.openingBallast);cart.x=o.x;cart.y=o.y;}
     if(t.id==='hoist')G.obstacles.find(o=>o.sideStoryRole==='cart').x=o.x;
     if(['crossing','ledger'].includes(t.id)){
      const a=G.obstacles.find(o=>o.sideStoryRole==='actor'),e=G.sideStoryScene.escort;
      for(let tick=0;tick<700&&!e.finished;tick++){G.p.x=a.x+Math.sign(e.destination-a.x)*70;G.p.y=a.y;BladefallSideStoryWorld.update(1/60);}
      if(!e.finished)throw new Error('escort did not arrive');
     }
     use(o);
     if(t.id==='signal'){click('Ring a long note.');if(BladefallSideStories.row(BladefallSideStoryWorld.state(),q.id).step!==0)throw new Error('wrong alarm signal advanced');click('Continue');use(o);for(const note of ['short','short','short','long','long'])click('Ring a '+note+' note.');}
     click('Continue');
    }
    use(actor);choose(q,route==='harsh'?'harsh':q.resolutions?'finish:keep':'finish');choose(q,'leave');
   }
   let r=BladefallSideStories.row(BladefallSideStoryWorld.state(),q.id);
   const expected=route==='harsh'?'harsh':'completed';if(r.phase!==expected)throw new Error(q.id+' '+route+': '+r.phase);
   if(q.id==='defector'&&route!=='harsh'){
    const a=G.obstacles.find(o=>o.sideStoryRole==='actor'),e=G.sideStoryScene.escort;
    for(let tick=0;tick<500&&!e.finished;tick++){G.p.x=a.x+Math.sign(e.destination-a.x)*65;G.p.y=a.y;BladefallSideStoryWorld.update(1/60);}
   }
   const reward=G.obstacles.find(o=>o.sideStoryRole==='reward');
   if(route==='harsh'){if(!reward.gone)throw new Error('harsh reward visible');}
   else{use(reward);click('Continue');if(!BladefallSideStories.row(BladefallSideStoryWorld.state(),q.id).claimed)throw new Error('reward not claimed');}
   const saved=JSON.parse(JSON.stringify(G.sessionSideStories));
   loadStage(q.stage);G.sessionSideStories=saved;BladefallSideStoryWorld.apply();
   r=BladefallSideStories.row(BladefallSideStoryWorld.state(),q.id);
   if(r.phase!==expected||r.claimed!==(route!=='harsh'))throw new Error('reload failed');
   if(q.id==='alarm'){const defenders=G.obstacles.filter(o=>o.supportKind==='defender');if(defenders.length!==2||defenders.some(o=>!!o.seated!==(route!=='harsh')))throw new Error('alarm defenders outcome wrong');if(!!G.obstacles.find(o=>o.supportKind==='volunteer')?.gone!==(route!=='harsh'))throw new Error('alarm volunteer outcome wrong');}
   if(q.id==='sailors'){const sailor=G.obstacles.find(o=>o.supportKind==='sailor');if(sailor.y!==G.sideStoryScene.base.y)throw new Error('sailor outcome left him stranded');}
   if(q.id==='quota'&&route!=='harsh'&&!G.obstacles.find(o=>o.supportKind==='worker')?.seated)throw new Error('second worker did not rest');
   results.push({id:q.id,stage:q.stage,route,phase:r.phase,reward:r.reward,claimed:r.claimed});
  }
  return results;
 });
 assert.equal(results.length,60);assert.deepEqual(errors,[]);
 await page.evaluate(()=>{beginRun(0,null,{hp:1,dmg:1},{startStage:0,levelSelect:true});const a=G.obstacles.find(o=>o.sideStoryRole==='actor');G.p.x=a.x;G.p.y=a.y;beginOutskirtsInteraction(a);});
 await mkdir('docs/evidence/side-stories',{recursive:true});
 await page.screenshot({path:'docs/evidence/side-stories/dialogue-desktop.png'});
 await page.setViewport({width:390,height:844});await page.screenshot({path:'docs/evidence/side-stories/dialogue-mobile.png'});
 await writeFile('docs/evidence/side-stories/dialogue-validation.json',JSON.stringify({scope:'Dialogue choices, task dispatch, persistence and reward integration. Does not prove physical route or unique task mechanics.',results,errors},null,2)+'\n');
 console.log('PASS: 60 dialogue paths, reload persistence, one-time regional rewards and harsh lockouts.');
}finally{await browser.close();}
