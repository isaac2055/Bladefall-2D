import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import puppeteer from 'puppeteer';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const OUTPUT=resolve(ROOT,'docs/charters/opening-systems-integration.json');
const URL=process.env.BLADEFALL_URL||'http://127.0.0.1:8877/index.html';
const source=await readFile(resolve(ROOT,'public/index.html'),'utf8');
const expectedVersion=source.match(/const VERSION='([^']+)'/)?.[1]||null;
const browser=await puppeteer.launch({headless:true,protocolTimeout:60000,args:[
  '--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const page=await browser.newPage();const pageErrors=[];
page.on('pageerror',error=>pageErrors.push(error.message));
page.on('console',message=>{if(message.type()==='error')pageErrors.push(`console: ${message.text()}`);});

async function start(stage){
  await page.evaluate((stageIndex)=>{
    meta.soundOn=false;meta.testMode=false;
    meta.inventory=BFInventoryModule.createState();meta.equipment=BFEquipmentEconomyModule.createState();
    meta.advancement=BFAdvancementModule.createState();meta.echoes=BFEchoesModule.createState();
    meta.gifts=BladefallGifts.createState();meta.recollections=BladefallRecollections.createState();
    meta.skin='warden';meta.skinsOwned={warden:true};meta.bossTypeKills={};
    beginRun(0,null,{hp:1,dmg:1},{levelSelect:true,startStage:stageIndex});mode='play';showOverlay(false);showGameUI(true);
    G.p.invuln=9999;
  },stage);
}

try{
  await page.setViewport({width:1280,height:720,deviceScaleFactor:1});await page.setBypassServiceWorker(true);
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForFunction(version=>window.__BF?.VERSION===version,{},expectedVersion);

  await start(0);
  const disclosure=await page.evaluate(()=>{
    const d=playerBuildDiscovery();openPause();
    const pause={bag:!!document.getElementById('bagBtn'),build:!!document.getElementById('advanceBtn')};
    mode='play';showOverlay(false);showGameUI(true);
    return{name:'fresh-awakening-discloses-no-build-menu',pass:!d.bag&&!d.build&&!pause.bag&&!pause.build,
      discovery:{bag:d.bag,build:d.build,gifts:d.gift.owned,recollections:d.archive.found},pause};
  });

  await start(1);
  const equipment=await page.evaluate(()=>{
    const blade=G.pickups.find(pk=>pk.acquisitionId===BFWeaponProgressionModule.FIRST_WEAPON.id);
    const mantle=G.pickups.find(pk=>pk.armor?.name==='Mothsilk Mantle');
    const before={bladeLocked:blade.ritualLocked,weapon:G.p.weapon,bag:playerBuildDiscovery().bag,
      mantleSource:mantle.sourceKind,mantleAuthored:mantle.authoredAcquisition};
    const weight=G.obstacles.find(o=>o.oathbladeCounterweight);
    Object.assign(G.p,{x:weight.x,y:weight.y,onGround:true,floorPlat:null});updateObstacles(1/60);
    Object.assign(G.p,{x:blade.x,y:blade.y,onGround:true,floorPlat:null});const bladeTaken=collectNearbyItem();
    const afterBlade={weapon:G.p.weapon?.name,capability:hasCapability('weapon'),bag:playerBuildDiscovery().bag,
      inBag:meta.inventory.items.some(row=>row.item?.name===G.p.weapon?.name)};
    Object.assign(G.p,{x:mantle.x,y:mantle.y-30,onGround:true,floorPlat:null});const mantleTaken=collectNearbyItem();
    const mantleRow=meta.inventory.items.find(row=>row.item?.name==='Mothsilk Mantle');
    openBag(()=>{});const button=[...document.querySelectorAll('[data-bag]')].find(node=>node.textContent.includes('Mothsilk Mantle'));
    if(button)button.click();
    return{name:'authored-oathblade-and-mantle-loop',pass:before.bladeLocked&&!before.weapon&&!before.bag&&
      before.mantleAuthored&&/rack/.test(before.mantleSource)&&bladeTaken&&afterBlade.weapon==='Recovered Oathblade'&&
      afterBlade.capability&&afterBlade.bag&&afterBlade.inBag&&mantleTaken&&!!mantleRow&&!!button&&
      G.p.gear.chest?.name==='Mothsilk Mantle',before,bladeTaken,afterBlade,mantleTaken,
      mantle:{row:mantleRow?.item?.name,equipped:G.p.gear.chest?.name,source:before.mantleSource}};
  });

  await start(2);
  const bossRewards=await page.evaluate(()=>{
    G.levelSelectMode=false;G.worldProgressEligible=true;G.sessionCapabilities=null;
    meta.capabilities=BFCapabilitiesModule.createState({acquired:['jump','weapon','dash']});
    meta.bossTypeKills.brute=1;syncGiftUnlocks(true);const echoResult=grantEchoReward({type:'boss:defeated',boss:'brute'});
    const giftBefore=BladefallGifts.uiModel(meta.gifts),echoBefore={...BFEchoesModule.profile(meta.echoes),
      ownedIds:[...meta.echoes.owned],equippedIds:[...meta.echoes.equipped]},skinBefore=meta.skin;
    meta.gifts=BladefallGifts.equip(meta.gifts,'blood-vow').state;
    meta.echoes=BFEchoesModule.equip(meta.echoes,'fault-bell',{atRest:true}).state;syncEchoRuntimeMods();
    Object.assign(G.p,{blood:5,maxBlood:5,bloodGuard:0,invuln:0,bloodVowT:0});syncBloodMirror(G.p);hurtPlayer(10,1,true);
    const vowPrimed=G.p.bloodVowT>5;
    G.p.bloodVowT=0;G.p.weapon=null;G.p.dashBuf=0;G.p.dodgeCdT=0;G.p.dodgeTimer=0;
    window.__BF.input.keys.ArrowRight=true;window.__BF.input.pressed[kbCode('dash')]=true;update(1/60);
    window.__BF.input.keys.ArrowRight=false;BFKeyboard.clearPressed();
    const bellPrimed=G.p.faultBellT>0;
    const enemy=spawnEnemy('grunt',G.p.x+80);enemy.hp=100;enemy.maxHp=100;enemy.invuln=0;G.enemies=[enemy];
    const hp=enemy.hp;hitEnemy(enemy,10,1,0,0,null,'melee');const damage=hp-enemy.hp;
    return{name:'boss-rewards-are-independent-and-immediately-usable',pass:echoResult?.changed&&
      giftBefore.rows.find(row=>row.id==='blood-vow')?.status==='owned'&&skinBefore==='warden'&&
      echoBefore.ownedIds.includes('fault-bell')&&meta.echoes.equipped.includes('fault-bell')&&vowPrimed&&
      bellPrimed&&Math.abs(damage-12.5)<.01&&G.p.faultBellT===0,
      skin:skinBefore,giftStatus:giftBefore.rows.find(row=>row.id==='blood-vow')?.status,
      echo:{owned:echoBefore.ownedIds,equipped:[...meta.echoes.equipped],capacity:echoBefore.capacity},
      vowPrimed,bellPrimed,damage,faultBellConsumed:G.p.faultBellT===0};
  });

  await start(3);
  const updraft=await page.evaluate(()=>{
    const relic=G.obstacles.find(o=>o.memoryId==='gale-stitch-cache'),blood=G.obstacles.find(o=>o.memoryId==='rain-catcher-blood-fragment');
    G.levelSelectMode=false;G.worldProgressEligible=true;G.sessionCapabilities=null;
    const echo=grantAuthoredEcho(relic.echoId,relic.sourceId),advance=grantAuthoredAdvancementBundle(blood.advancement,blood.sourceId);
    const profile=BFEchoesModule.profile(meta.echoes),advancement=BFAdvancementModule.profile(meta.advancement);
    return{name:'updraft-mastery-owns-distinct-rewards',pass:relic.optionalNeedleBranch&&echo?.changed&&
      meta.echoes.owned.includes('gale-stitch')&&blood.rainHighRoute&&advance?.changed&&advancement.vitalityFragments===1,
      gale:{branch:relic.optionalNeedleBranch,owned:meta.echoes.owned.includes('gale-stitch'),capacity:profile.capacity},
      blood:{highRoute:blood.rainHighRoute,fragments:advancement.vitalityFragments}};
  });

  await start(4);
  const marksman=await page.evaluate(()=>{
    const maps=G.obstacles.filter(o=>o.sealedRecollection).map(o=>o.sealedRecollection);
    const token=G.obstacles.find(o=>o.memoryId==='watch-command-token');
    const before=BFPortalProgressionModule.profile(activeCapabilityProgress());
    meta.capabilities=BFCapabilitiesModule.createState({acquired:[...G.sessionCapabilities.acquired]});
    G.levelSelectMode=false;G.worldProgressEligible=true;G.sessionCapabilities=null;
    const seal=grantAuthoredAdvancementBundle(token.advancement,token.sourceId);
    const shelfForge=BFAdvancementModule.profile(meta.advancement).forgeSeals;
    grantPermanentCapability('portal-pair','deadeye-rangefinder');const reward=grantEchoReward({type:'boss:defeated',boss:'archer'});
    const after=BFPortalProgressionModule.profile(activeCapabilityProgress()),echo=BFEchoesModule.profile(meta.echoes);
    return{name:'marksman-closes-the-constitutional-prefix',pass:before.mode==='single'&&before.maxPlayerMouths===1&&
      after.mode==='pair'&&after.maxPlayerMouths===2&&reward?.changed&&meta.echoes.owned.includes('far-thread')&&
      echo.capacity===3&&seal?.changed&&shelfForge===1&&BFAdvancementModule.profile(meta.advancement).forgeSeals===2&&
      maps.length===1&&maps[0]==='hollow-marksman',before,after,
      echo:{owned:[...meta.echoes.owned],capacity:echo.capacity},forgeSeals:{shelf:shelfForge,afterBoss:BFAdvancementModule.profile(meta.advancement).forgeSeals},sealedMaps:maps};
  });

  const probes=[disclosure,equipment,bossRewards,updraft,marksman];
  const receipt={schema:'bladefall.opening-systems-integration',version:1,gameVersion:expectedVersion,url:URL,
    pageErrors,probes,ok:pageErrors.length===0&&probes.every(probe=>probe.pass),
    limitations:['Automated evidence proves runtime contracts and reward causality; first-read value and visual taste still require human play.']};
  await mkdir(dirname(OUTPUT),{recursive:true});await writeFile(OUTPUT,`${JSON.stringify(receipt,null,2)}\n`);
  console.log(JSON.stringify(receipt,null,2));if(!receipt.ok)process.exitCode=1;
}finally{await browser.close();}
