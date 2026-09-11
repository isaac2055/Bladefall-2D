import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';

const url=process.argv[2]||'http://127.0.0.1:8877/index.html';
const browser=await puppeteer.launch({headless:true,args:['--disable-background-timer-throttling']});
const page=await browser.newPage(),errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')errors.push(`console: ${message.text()}`);});
try{
  await page.setBypassServiceWorker(true);
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:20_000});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded',timeout:20_000});
  await page.waitForFunction(()=>window.__BF?.milestoneState);
  const authority=await page.evaluate(()=>({version:window.__BF.VERSION,state:window.__BF.milestoneState(),
    quest:window.__BF.quests.eligible(window.__BF.quests.quests.find(row=>row.id==='couriers-proof'),{capabilities:['jump','weapon']}),
    board:window.__BF.milestones.runEligibility({ngPlus:2})}));
  assert.match(authority.version,/^7\./);
  assert.equal(authority.state.validation.ok,true);
  assert.deepEqual(authority.quest.missingCapabilities,['portal-pair']);
  assert.equal(authority.board.category,'ng2');

  await page.click('#newBtn');await page.waitForSelector('#cutSkip:not(.hide)');await page.click('#cutSkip');
  await page.waitForFunction(()=>window.__BF?.mode==='play');
  const boss=await page.evaluate(()=>{
    window.__BF.meta.capabilities.acquired=['jump','weapon','dash','portal-single','portal-pair'];
    window.__BF.reloadStage(4);
    const e=window.__BF.G.boss;
    return {type:e.type,contract:e.milestoneContract,eligibility:e.milestoneEligibility};
  });
  assert.equal(boss.type,'archer');assert.equal(boss.contract.solution,'return-marked-arrows');
  assert.equal(boss.eligibility.ok,true);

  const completion=await page.evaluate(()=>{
    const M=window.__BF.milestones;
    let run=M.commitZone(M.createRun(),'outskirts',{enemyDone:2,enemyTotal:4,coinDone:0,coinTotal:1,travelerDone:1,travelerTotal:1},1).run;
    run=M.commitZone(run,'outskirts',{enemyDone:4,enemyTotal:4,coinDone:1,coinTotal:1,travelerDone:1,travelerTotal:1},2).run;
    const archive=M.addEntry(M.createArchive({base:[{name:'Old',time:90,completion:80,at:1}]}),'base',{name:'New',time:80,completion:100,at:2}).archive;
    return {percent:M.completionPercent(run),rank:M.rank(archive.base,'completion').map(row=>row.name),count:archive.base.length};
  });
  assert.deepEqual(completion,{percent:100,rank:['New','Old'],count:2});
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({ok:true,version:authority.version,boss,completion},null,2));
}finally{await browser.close();}
