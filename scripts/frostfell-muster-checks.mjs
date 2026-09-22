// Browser-side checks use the real input/update pipeline. Only the isolated
// two-Blood contact fixture positions the player next to a particular enemy.
export function musterScenario(){
 const tas=window.__BF.tas;tas.restoreState('muster-engine');
 const before=G.enemies.map(e=>({id:e._zoneEntityId,hp:e.maxHp,dead:e.dead}));
 const player={x:G.p.x,y:G.p.y,blood:G.p.blood};
 tas.stepFrames(1,{interact:true});tas.stepFrames(120,{left:true});
 const charging=!!G.frostMusterSequence&&!persistentCircuitOpen('frost-muster')&&Math.abs(G.p.x-player.x)<1;
 tas.saveState('muster-charge');tas.stepFrames(40,{});tas.saveState('muster-strike');
 const struck=persistentCircuitOpen('frost-muster'),added=G.enemies.filter(e=>e.zoneEntityId?.startsWith('muster-patrol-')).length;
 const boosted=before.every(old=>{const e=G.enemies.find(e=>e._zoneEntityId===old.id);return e&&e.maxHp===Math.round(old.hp*1.55)&&e.dead===old.dead;});
 tas.stepFrames(205,{});tas.saveState('muster-awake');
 const finished=!G.frostMusterSequence&&G.p.blood===player.blood;
 const cue=currentLevelMusicCue().id;
 const firstHp=G.enemies.find(e=>e.type==='rimehulk').maxHp;
 // Pressing it a second time must neither replay nor stack the roster/health.
 tas.stepFrames(1,{interact:true});tas.stepFrames(1,{});
 const once=!G.frostMusterSequence&&G.enemies.filter(e=>e.zoneEntityId?.startsWith('muster-patrol-')).length===added;
 // Walk to the summit passage, then use actual fresh Up presses at every stop.
 for(let i=0;i<180&&G.p.x<14660;i++)tas.stepFrames(1,{right:true});tas.stepFrames(20,{});
 const cycle=[];for(let i=0;i<4;i++){tas.stepFrames(1,{interact:true});tas.stepFrames(1,{});cycle.push({x:G.p.x,y:G.p.y});}
 const ring=JSON.stringify(cycle)===JSON.stringify([{x:1330,y:0},{x:7220,y:210},{x:14680,y:650},{x:1330,y:0}]);
 tas.saveState('muster-ring');
 // A real hulk contact must cost exactly two measures and preserve location.
 tas.restoreState('muster-awake');const hulk=G.enemies.find(e=>e.type==='rimehulk'&&e.y===650);
 Object.assign(G.p,{x:hulk.x+20,y:hulk.y,vx:0,vy:0,onGround:true,blood:5,hp:100,invuln:0,counterT:0,dodgeTimer:0,starT:0,giantT:0,cloakT:0});
 let hit=null;for(let i=0;i<150;i++){tas.stepFrames(1,{});if(G.p.blood<5){hit={lost:5-G.p.blood,x:G.p.x,y:G.p.y};break;}}
 const twoBlood=hit?.lost===2&&Math.abs(hit.y-650)<10&&Math.abs(hit.x-hulk.x)<160;
 tas.restoreState('muster-ring');const singer=G.enemies.find(e=>e.type==='frostsinger');
 bossShoot(singer,{x:singer.x-220,y:0,h:40});const shots=G.projectiles.filter(p=>p.sourceType==='frostsinger').length;
 const victim=G.enemies.find(e=>e.type==='frostpike'&&!e.dead),id=victim._zoneEntityId;
 hitEnemy(victim,10000,1,0,0,null,'attack');mode='play';showOverlay(false);
 captureCurrentZonePersistence();loadStage(7);tas.stepFrames(2,{});
 const persisted=persistentCircuitOpen('frost-muster')&&persistentCircuitOpen('frost-summit-service')&&!G.enemies.some(e=>e._zoneEntityId===id)&&G.enemies.find(e=>e.type==='rimehulk')?.maxHp===firstHp;
 const beforeAgain=G.enemies.length;captureCurrentZonePersistence();loadStage(7);tas.stepFrames(2,{});
 const noDuplicates=G.enemies.length===beforeAgain;
 const checks={charging,struck,added:added===11,boosted,finished,once,ring,twoBlood,shots:shots===2,persisted,noDuplicates,music:cue==='frostfell-muster-garrison'};
 return {pass:Object.values(checks).every(Boolean),checks,cycle,hit,added,firstHp,cue,alive:G.enemies.filter(e=>!e.dead).length};
}

// Real keyboard + automatic loop: this is intentionally outside single-level TAS.
export async function mineAndMusicScenario(browser,url){
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.setViewport({width:1440,height:900});await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__BF);
  await page.evaluate(()=>{
   meta.capabilities=BFCapabilitiesModule.createState({acquired:['counter']});meta.world=BFWorldModule.createProgress({current:'warden',visited:['warden'],cleared:['warden']});meta.testMode=true;
   beginRun(0,null,{hp:1,dmg:1},{startStage:6,levelSelect:true,testRun:true,runSeed:0xF2057});grantPermanentCapability('counter','warden-broken-guard');restoreSolvedBacktrackDoors();if(G.boss)G.boss.dead=true;
   Object.assign(G.p,{x:80,y:0,vx:0,vy:0,onGround:true});mode='play';showOverlay(false);
  });
  await page.keyboard.down('ArrowLeft');await page.keyboard.press('ArrowUp',{delay:70});
  await page.waitForFunction(()=>G.stageIndex===7,{timeout:10000});
  await page.evaluate(()=>new Promise(r=>setTimeout(r,1800)));
  const outward=await page.evaluate(()=>({stage:G.stageIndex,x:G.p.x,completed:BFZoneStreamer.diagnostics().counters.completed}));
  await page.keyboard.up('ArrowLeft');await page.keyboard.down('ArrowRight');
  await page.waitForFunction(()=>G.p.x>=120&&G.p.x<=220,{polling:'raf',timeout:5000});
  await page.keyboard.up('ArrowRight');await page.keyboard.down('ArrowLeft');await page.keyboard.press('ArrowUp',{delay:70});
  await page.waitForFunction(()=>G.stageIndex===6,{timeout:10000});
  await page.evaluate(()=>new Promise(r=>setTimeout(r,1800)));
  const back=await page.evaluate(()=>({stage:G.stageIndex,x:G.p.x,completed:BFZoneStreamer.diagnostics().counters.completed}));await page.keyboard.up('ArrowLeft');
  await page.evaluate(()=>{
   meta.testMode=false;meta.soundOn=true;
   beginRun(0,null,{hp:1,dmg:1},{startStage:7,levelSelect:true,testRun:true,runSeed:0xF2057});grantPermanentCapability('double-jump','frost-second-step');
   Object.assign(G.p,{x:14400,y:650,vx:0,vy:0,onGround:true});mode='play';showOverlay(false);
  });
  await page.keyboard.press('ArrowUp',{delay:70});
  await page.waitForFunction(()=>persistentCircuitOpen('frost-muster')&&!G.frostMusterSequence,{timeout:15000});
  await page.waitForFunction(()=>document.getElementById('bgMusic').readyState>=2,{timeout:15000});
  const music=await page.evaluate(()=>{const m=document.getElementById('bgMusic');return{cue:currentLevelMusicCue().id,src:m.getAttribute('src'),paused:m.paused,ready:m.readyState};});
  return {pass:outward.stage===7&&outward.completed===1&&back.stage===6&&back.completed===2&&music.cue==='frostfell-muster-garrison'&&music.src.endsWith('engine-of-the-frozen-garrison.mp3')&&!music.paused&&errors.length===0,outward,back,music,errors};
 }finally{await page.close();}
}
