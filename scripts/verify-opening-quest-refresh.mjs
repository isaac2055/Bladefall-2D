import {launchChrome} from '../tests/launch-chrome.mjs';
import {writeFile} from 'node:fs/promises';
const browser=await launchChrome({headless:true});
try{
 const page=await browser.newPage();await page.setViewport({width:1200,height:800});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:8371/');await page.waitForFunction(()=>window.__BF);
 const rows=[];
 for(const stage of [0,1]){
  const result=await page.evaluate(stage=>{
   BladefallConversation.close();beginRun(0,null,{hp:1,dmg:1},{startStage:stage,levelSelect:true});
   const q=BladefallSideStories.records.find(q=>q.stage===stage),scene=G.sideStoryScene;
   G.p.x=scene.base.x+40;G.p.y=0;G.p.vx=G.p.vy=0;G.p.onGround=true;
   G.sessionSideStories=BladefallSideStories.reduce(G.sessionSideStories,q.id,{type:'choice',choice:'short'}).state;BladefallSideStoryWorld.apply();mode='play';
   const keys=__BF.input.keys,pressed=__BF.input.pressed;let jumpAge=100;
   const legs=[];
   function walk(x,y){
    let pass=false;const trace=[];
    for(let frame=0;frame<900;frame++){
     const p=G.p,dx=x-p.x;if(frame%100===0)trace.push({frame,x:p.x,y:p.y,hp:p.hp,mode});keys.ArrowLeft=dx< -7;keys.ArrowRight=dx>7;
     const ahead=p.x+Math.sign(dx)*50,ground=G.obstacles.some(o=>o.type==='plat'&&!o.gone&&!o.fake&&Math.abs(o.y-p.y)<12&&ahead>o.x-o.w/2&&ahead<o.x+o.w/2);
     if(p.onGround&&jumpAge>25&&((y>p.y+20&&Math.abs(dx)<155)||(!ground&&Math.abs(dx)>35))){pressed[kbCode('jump')]=true;jumpAge=0;}
     keys[kbCode('jump')]=jumpAge<22;jumpAge++;update(1/60);BFKeyboard.clearPressed();
     if(mode==='conversation')BladefallConversation.close();
     if(p.dead)break;
     if(Math.abs(p.x-x)<28&&Math.abs(p.y-y)<16&&p.onGround){pass=true;break;}
    }
    keys.ArrowLeft=keys.ArrowRight=keys[kbCode('jump')]=false;
    legs.push({x,y,pass,trace:pass?undefined:trace,at:{x:Math.round(G.p.x),y:Math.round(G.p.y)}});return pass;
   }
   function use(task){const o=G.obstacles.find(o=>o.sideStory===q.id&&o.task===task);BladefallSideStoryWorld.interact(o);BladefallConversation.close();}
   let ok=true;
   if(stage===0){ok=walk(1035,0);if(ok)use('ballast');}
   // 7.231: Rowan's tower scaffold begins from the road's own creek hop (1220/58).
   const steps=(stage===0?[{x:1220,y:58}]:[]).concat(G.obstacles.filter(o=>o.sideStory===q.id&&o.openingLedge));
   for(const o of steps){if(!ok)break;ok=walk(o.x,o.y);if(stage===1&&o.x===1650&&ok)use('line');}
   if(ok)use(stage===0?'bell':'lantern');
   if(ok)ok=walk(stage===0?360:780,0);
   if(ok)use(stage===0?'hang':'floor');
   if(stage===1&&ok){ok=walk(850,0);if(ok)use('table');}
   if(ok)ok=walk(scene.base.x,0);
   return {stage,id:q.id,ok,phase:BladefallSideStories.row(G.sessionSideStories,q.id).phase,legs};
  },stage);
  rows.push(result);console.log(JSON.stringify(result));
  await page.screenshot({path:`docs/charters/opening-quest-refresh/stage-${stage}-route.png`});
 }
 await writeFile('docs/charters/opening-quest-refresh/route-verification.json',JSON.stringify({scope:'Fixture start at giver; real frame movement and device interactions thereafter. No position writes during routes.',rows,errors},null,2));
 if(errors.length||rows.some(r=>!r.ok||r.phase!=='ready'))process.exitCode=1;
}finally{await browser.close();}
