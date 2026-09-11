import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';

const url=process.argv[2]||'http://127.0.0.1:8877/index.html';
const browser=await puppeteer.launch({headless:true,args:['--disable-background-timer-throttling']});
const page=await browser.newPage(),pageErrors=[];
page.on('pageerror',error=>pageErrors.push(error.message));
page.on('console',message=>{if(message.type()==='error')pageErrors.push(`console: ${message.text()}`);});
try{
  await page.setBypassServiceWorker(true);
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:20_000});
  await page.evaluate(()=>{localStorage.clear();localStorage.setItem('bladefall_v2',JSON.stringify({
    saveSchemaVersion:0,musicVolume:9,sfxVolume:-4,screenShake:22,graphicsQuality:'impossible',
    world:['bad'],capabilities:'all',secrets:42,quests:'broken',gold:-10,ngPlus:99
  }));});
  await page.reload({waitUntil:'domcontentloaded',timeout:20_000});
  await page.waitForFunction(()=>window.__BF?.foundationAudit);
  const migration=await page.evaluate(()=>({
    schema:window.__BF.meta.saveSchemaVersion,receiptChanged:window.__BF.saveMigration().changed,
    receiptTo:window.__BF.saveMigration().to,worldOk:window.__BF.worldState().validation.ok,
    capabilitiesOk:window.__BF.capabilityState().validation.ok,secretsOk:window.__BF.secretState().validation.ok,
    questsOk:window.__BF.questState().validation.ok,
    settingsBounded:window.__BF.meta.musicVolume>=0&&window.__BF.meta.musicVolume<=1&&
      window.__BF.meta.sfxVolume>=0&&window.__BF.meta.sfxVolume<=1&&window.__BF.meta.screenShake>=0&&
      window.__BF.meta.screenShake<=1&&['auto','low','balanced','high'].includes(window.__BF.meta.graphicsQuality),
    storageFailures:window.__BF.storage.diagnostics().failures.length
  }));

  await page.evaluate(()=>localStorage.clear());await page.reload({waitUntil:'domcontentloaded',timeout:20_000});
  await page.waitForFunction(()=>window.__BF?.foundationAudit);
  await page.click('#settingsBtn');
  for(const setting of ['reducedMotion','highContrast','largeText'])await page.click(`[data-setting="${setting}"]`);
  const accessibility=await page.evaluate(()=>({
    canvasRole:document.querySelector('#gameContainer canvas')?.getAttribute('role')==='img',
    canvasLabel:!!document.querySelector('#gameContainer canvas')?.getAttribute('aria-label'),
    settingCount:document.querySelectorAll('[data-setting]').length,
    remappableControls:document.querySelectorAll('.kbkey').length,
    reducedMotionClass:document.body.classList.contains('a11y-reduced-motion'),
    highContrastClass:document.body.classList.contains('a11y-contrast'),
    largeTextClass:document.body.classList.contains('a11y-large'),
    pauseLabel:document.querySelector('#pausebtn')?.getAttribute('aria-label')==='Pause game'
  }));
  await page.click('#settingsBack');await page.click('#newBtn');await page.waitForSelector('#cutSkip:not(.hide)');
  await page.click('#cutSkip');await page.waitForFunction(()=>window.__BF?.mode==='play');

  const slice=[];
  for(const stage of [0,1,2,3,4]){
    await page.evaluate(index=>window.__BF.reloadStage(index),stage);
    await new Promise(resolve=>setTimeout(resolve,500));
    slice.push(await page.evaluate(stage=>{const charter=window.__BF.charterState(),G=window.__BF.G;
      return {stage,charterOk:!!charter?.validation?.ok,geometryOk:!!charter?.geometry?.ok,
        ownershipCoverage:charter?.geometry?.ownershipCoverage||0,levelLength:G.levelLength||0,
        obstacles:G.obstacles.length,bossContract:G.boss?.milestoneContract?.solution||null};},stage));
  }
  await new Promise(resolve=>setTimeout(resolve,1200));
  const runtime=await page.evaluate(()=>{
    const BF=window.__BF;
    return {authorities:{
      progression:BF.progression.validate().ok,zones:BF.zones.validateCatalog().ok,world:BF.worldState().validation.ok,
      capabilities:BF.capabilityState().validation.ok,movement:BF.movementState().validation.ok,
      portals:BF.portalProgressionState().validation.ok,weapons:BF.weaponProgressionState().validation.ok,
      equipment:BF.equipmentState().validation.ok,echoes:BF.echoState().validation.ok,
      reactions:BF.reactions.TARGET_KINDS.length>=6,ecology:BF.ecologyState().validation.ok,
      secrets:BF.secretState().validation.ok,quests:BF.questState().validation.ok,
      milestones:BF.milestoneState().validation.ok,recovery:BF.recovery.validateCatalog().ok,
      streaming:!!BF.streamState().phase
    },performance:BF.metrics(),targetFrameMs:1000/60,release:BF.releaseState()};
  });
  const result=await page.evaluate(evidence=>window.__BF.foundationAudit.audit(evidence),{
    authorities:runtime.authorities,slice,performance:runtime.performance,targetFrameMs:runtime.targetFrameMs,
    accessibility,migration
  });
  assert.equal(result.ok,true,JSON.stringify(result.errors));
  assert.equal(runtime.release.ready,true);
  assert.deepEqual(pageErrors,[]);
  console.log(JSON.stringify({ok:true,version:await page.evaluate(()=>window.__BF.VERSION),result,slice,
    performance:runtime.performance,migration,accessibility},null,2));
}finally{await browser.close();}
